# this services.py file contains all the business logic for the views
from django.db import transaction
from django.utils import timezone
from decimal import Decimal
from .models import Users, Transactions, Transactionstatus, Accounts, Auditlog, Ledgerentries
from django.contrib.auth.models import User # this is django User model used for authentication

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