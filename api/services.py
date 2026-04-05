# this services.py file contains all the business logic for the views
from django.db import transaction
from django.utils import timezone
from decimal import Decimal
from .models import Users, Transactions, Transactionstatus, Accounts, Auditlog, Ledgerentries, Beneficiaries, Fixeddeposits
from django.contrib.auth.models import User # this is django User model used for authentication
from django.contrib.auth import authenticate
from rest_framework.authtoken.models import Token

# ===============================================================================================================

class RegistrationService:
    # andar jo ham methods likhenge -> they have to be static, they can used without creating instances of the class
    # these functions act like normal methods but live inside classes
    # @transaction.atomic -> DB operations inside the function, if it fails then everything rollbacks
    @staticmethod
    @transaction.atomic
    def register_user(name, email, password, phone):
        auth_user = User.objects.create_user(
            username=email,
            email=email,
            password=password
        )# create django user profile

        banking_profile = Users.objects.create(
            auth_user=auth_user,
            name=name,
            email=email,
            phone=phone,
            status='ACTIVE',
            createdate=timezone.now()
        )# create a user banking profile

        return banking_profile

# ===============================================================================================================

class LoginService:
    @staticmethod
    def login_user(username, password):
        user = authenticate(username=username, password=password)

        if not user:
            raise ValueError("Invalid Credentials")
        if not user.is_active:
            raise ValueError("User account is inactive.")

        token, created = Token.objects.get_or_create(user=user)# for token based authentication -> 
        return {
            "user": user,
            "token": token.key
        }
    
# ===============================================================================================================

class LogoutService:
    @staticmethod
    def logout_user(user):
        Token.objects.filter(user=user).delete()

#################################################################################################################

class TransferService:
    # this service class logic is reusable in : CLI, react frontend, microservices, celery, drf, etc
    @staticmethod
    def execute_transfer(user, from_account_no, to_account_no, amount):
        with transaction.atomic():
            from_account = Accounts.objects.select_for_update().get(
                accountnumber=from_account_no,
                userid=user.users,
                status='ACTIVE'
            )
            to_account = Accounts.objects.select_for_update().get(
                accountnumber=to_account_no,
                status='ACTIVE'
            )# since we are doing these things inside the transaction.atomic block, any problem will result in 
            # a rollback of the transaction
            if from_account.balance < amount:
                raise ValueError("Insufficient funds.")
            success_status, _ = Transactionstatus.objects.get_or_create(
                statusname='SUCCESS'
            )
            transaction_obj = Transactions.objects.create(
                fromaccountid=from_account,
                toaccountid=to_account,
                amount=amount,
                transactiontype='TRANSFER',
                statusid=success_status,
                createdate=timezone.now()
            )
            # Deduct
            from_account.balance -= amount
            from_account.save()

            # Credit
            to_account.balance += amount
            to_account.save()

            # Ledger entries
            Ledgerentries.objects.create(
                transactionid=transaction_obj,
                accountid=from_account,
                entrytype='DEBIT',
                amount=amount,
                createdate=timezone.now()
            )

            Ledgerentries.objects.create(
                transactionid=transaction_obj,
                accountid=to_account,
                entrytype='CREDIT',
                amount=amount,
                createdate=timezone.now()
            )

            # Audit log
            Auditlog.objects.create(
                entityname='Transactions',
                entityid=transaction_obj.transactionid,
                action='TRANSFER_CREATED',
                performedby=user.users.userid,
                createdate=timezone.now()
            )

            return transaction_obj
        
# ==============================================================================================================

class DeactivateAccountService:
    @staticmethod
    @transaction.atomic
    def deactivate_account(user, account_number):
        account = Accounts.objects.get(
            accountnumber=account_number,
            userid=user.users
        )

        if(account.status == 'INACTIVE'):
            raise ValueError("Account is already inactive.")

        if(account.balance > 0):
            raise ValueError("Account balance must be zero before deactivating.")
        
        account.status = 'INACTIVE'
        account.save()

        Auditlog.objects.create(
            entityname='Accounts',
            entityid=account.accountid,
            action='ACCOUNT_DEACTIVATED',
            performedby=user.users.userid,
            createdate=timezone.now()
        )

        return account

# ==============================================================================================================

class StatementsService:
    @staticmethod
    def get_statements(user, account_number=None):
        ledger_qs = Ledgerentries.objects.select_related(
            'transactionid',
            'accountid',
            'transactionid__fromaccountid',
            'transactionid__toaccountid'
        ).filter(accountid__userid=user.users)

        # optional filter by account number
        if account_number:
            ledger_qs = ledger_qs.filter(accountid__accountnumber=account_number)

        ledger_qs = ledger_qs.order_by('-createdate')

        transactions = []
        for entry in ledger_qs:
            txn = entry.transactionid

            if entry.entrytype == 'DEBIT':
                other_party = txn.toaccountid.accountnumber
                description = f"Transfer to {other_party}"
            else:
                other_party = txn.fromaccountid.accountnumber
                description = f"Transfer from {other_party}"

            transactions.append({
                'id': txn.transactionid,
                'created_at': entry.createdate,
                'description': description,
                'other_party': other_party,
                'type': entry.entrytype,
                'amount': str(entry.amount)  # convert Decimal to string for JSON
            })

        return transactions
    
# ===============================================================================================================

class BeneficiaryService:
    @staticmethod
    def get_beneficiaries(user):
        return Beneficiaries.objects.filter(userid=user.users)

    @staticmethod
    def add_beneficiary(user, account_number, nickname=None, addedtype='MANUAL'):
        beneficiary, created = Beneficiaries.objects.get_or_create(
            userid=user.users,
            accountnumber=account_number,
            defaults={
                'nickname': nickname,
                'addedtype': addedtype,
                'createdate': timezone.now()
            }
        )
        return beneficiary, created
    
# ===============================================================================================================

class FixedDepositService:
    INTEREST_RATE = Decimal('5.00')
    DURATION_MONTHS = 6

    @staticmethod
    def get_fds(user):
        return Fixeddeposits.objects.filter(userid=user.users)

    @staticmethod
    @transaction.atomic
    def create_fd(user, account_number, amount):
        account = Accounts.objects.select_for_update().get(
            accountnumber=account_number,
            userid=user.users,
            status='ACTIVE'
        )

        # calculate maturity amount = amount + (amount * 5% * 6/12)
        interest = amount * (FixedDepositService.INTEREST_RATE / 100) * Decimal('0.5')
        maturity_amount = amount + interest

        start_date = timezone.now()
        maturity_date = start_date + timezone.timedelta(days=180)  # 6 months

        # deduct from account
        account.balance -= amount
        account.save()

        fd = Fixeddeposits.objects.create(
            userid=user.users,
            accountid=account,
            amount=amount,
            interestrate=FixedDepositService.INTEREST_RATE,
            durationmonths=FixedDepositService.DURATION_MONTHS,
            maturityamount=maturity_amount,
            startdate=start_date,
            maturitydate=maturity_date,
            status='ACTIVE'
        )

        # audit log
        Auditlog.objects.create(
            entityname='FixedDeposits',
            entityid=fd.fdid,
            action='FD_CREATED',
            performedby=user.users.userid,
            createdate=timezone.now()
        )

        return fd

    @staticmethod
    @transaction.atomic
    def cancel_fd(user, fd_id):
        fd = Fixeddeposits.objects.select_for_update().get(
            fdid=fd_id,
            userid=user.users
        )

        if fd.status == 'CANCELLED':
            raise ValueError("FD is already cancelled.")

        if fd.status == 'MATURED':
            raise ValueError("Matured FDs cannot be cancelled.")

        # credit back only the original amount on cancellation, no interest
        account = Accounts.objects.select_for_update().get(accountid=fd.accountid.accountid)
        account.balance += fd.amount
        account.save()

        fd.status = 'CANCELLED'
        fd.save()

        # audit log
        Auditlog.objects.create(
            entityname='FixedDeposits',
            entityid=fd.fdid,
            action='FD_CANCELLED',
            performedby=user.users.userid,
            createdate=timezone.now()
        )

        return fd