from django.shortcuts import render, redirect
from .models import Users, Transactions, Transactionstatus, Ledgerentries, Auditlog, Accounts, Beneficiaries, Fixeddeposits
from django.contrib.auth.models import User
from django.utils import timezone # for storing time related fields
from django.db import transaction, IntegrityError
from django.contrib.auth import authenticate, login, logout
from django.contrib import messages
from django.db.models import Q
import random
from decimal import Decimal

# initialisation views : Login, Logout and Register
from django.db import IntegrityError

# DRF api development : 
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from .serializers import  UserSerializer, TransactionSerializer, AccountSerializer, TransferSerializer
from .serializers import RegistrationSerializer, LoginSerializer, DeactivateAccountSerializer, BeneficiarySerializer, AddBeneficiarySerializer, FixedDepositSerializer, CancelFDSerializer, CreateFDSerializer
from .services import RegistrationService ,TransferService, LoginService, LogoutService, DeactivateAccountService, StatementsService, BeneficiaryService, FixedDepositService

def register_user(request):
    if request.method == 'POST':
        details = request.POST
        name = details.get('name')
        email = details.get('email')
        password = details.get('password')
        cpassword = details.get('cpassword')
        phone = details.get('phone')

        # 1. Validation Logic (Catching errors before they hit the DB)
        if password != cpassword:
            return render(request, 'base/register.html', {'error': "Access Keys do not match."})
        
        if len(phone) != 10:
            return render(request, 'base/register.html', {'error': "Invalid Phone Format. 10 digits required."})

        try:
            with transaction.atomic():
                # 1. Create Digital Profile
                auth_user = User.objects.create_user(
                    username=email,
                    email=email,
                    password=password
                )

                # 2. Create Banking Profile (Using your custom 'Users' model)
                Users.objects.create(
                    auth_user=auth_user,
                    name=name,
                    email=email,
                    phone=phone,
                    status='ACTIVE',
                    createdate=timezone.now(),
                )

            messages.success(request, "Account created successfully!")
            return redirect('login')

        except IntegrityError:
            # Catch duplicate email/phone specifically
            return render(request, 'base/register.html', {'error': "Identity Conflict: Email or Phone already registered."})
        except Exception as e:
            # Catch-all for unexpected system issues
            return render(request, 'base/register.html', {'error': f"Engine Fault: {str(e)}"})
        
    return render(request, 'base/register.html')

# converting user registration to apiView ->
class RegistrationAPI(APIView):
    authentication_classes = []
    permission_classes = []

    def post(self,request):
        #  data is a dictionary object -> serializer expects a dictionary
        serializer = RegistrationSerializer(data=request.data)
        # after doing validation of data using serializer -> check whether correctly validation or not
        if not serializer.is_valid():
            return Response({
                'success' : False,
                'error' : serializer.errors
            }, status=400)
        # serializer.errors -> is a property that gives a dictionary of all the errors
        # key -> field and value -> error which has occured with that field
        try:
            #serializer.validated_data is a dictionary containing the cleaned/validated data after successfully 
            # calling is_valid() on a serializer, key = variable, value = validated_data_ki_value
            # respective service class ka function call karo with the respective parameters ->
            user = RegistrationService.register_user(
                name = serializer.validated_data['name'],
                email=serializer.validated_data['email'],
                password=serializer.validated_data['password'],
                phone=serializer.validated_data['phone']
            )

            return Response(
                {
                    'success' : True,
                    'message' : 'User registration completed Successfully'
                }, status=201
            )
        except IntegrityError:
            return Response(
                {"success": False, "error": "Email or phone already exists."},
                status=400
            )
        except Exception as e:
            return Response(
                {"success": False, "error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

###############################################################################################################

def login_user(request):
    if request.user.is_authenticated:
        return home(request)
    
    if request.method == 'POST':
        u = request.POST.get('username')
        p = request.POST.get('password')

        user = authenticate(request, username=u, password=p)

        if user is not None:
            login(request, user)
            messages.success(request, "Loggedin Successfully!")
            return redirect('home')
        else:
            return render(request, 'base/login.html', {'error': "Invalid AUTH_KEY or AUTH_ID."})
        
    return render(request, 'base/login.html')

class LoginAPI(APIView):
    authentication_classes = []
    permission_classes = []

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if not serializer.is_valid():
            return Response({
                'success' : False,
                'error' : serializer.errors
            }, status=400)
        try:
            result = LoginService.login_user(
                username=serializer.validated_data['username'],
                password=serializer.validated_data['password']
            )
            return Response(
                {
                    "success": True,
                    "token": result["token"]
                },
                status=200
            )
        except ValueError as e:
            return Response(
                {"success": False, "error": str(e)},
                status=status.HTTP_401_UNAUTHORIZED
            )

#################################################################################################################

class LogoutAPI(APIView):
    # note : permission_classes = [IsAuthenticated] -> this should not remain empty, since logout requires
    # a valid token. An unauthenticated request to logout doesn't make sense and should be rejected with a 401.
    # while registration and login api donot require tokens
    permission_classes = [IsAuthenticated]
    def post(self, request):
        # No serializer is needed. Since there is no input data to validate, token is pulled straight
        try:
            LogoutService.logout_user(request.user)
            return Response({
                "success" : True, 
                "message" : "logged out successfully"
            }, status=200)
        except Exception as e:
            return Response(
                {"success": False, "error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
            
def logout_user(request):
    logout(request)
    messages.success(request, 'Loggedout Successfully!')
    return redirect('login')

################################################################################################################

# base/home page view :
def home(request):
    accounts = Accounts.objects.filter(userid = request.user.users)
    active_acc_count = accounts.filter(status = 'ACTIVE').count()
    context = {
        'accounts' : accounts,
        'active_acc_count' : active_acc_count,
    }
    return render(request, 'base/home.html', context)

# converting Home view to DRF APIView -> 
class HomeAPI(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        accounts = Accounts.objects.filter(userid = request.user.users)
        active_acc_count = accounts.filter(status = 'ACTIVE').count()

        serializer = AccountSerializer(accounts, many=True)

        return Response({
            'active_acc_count' : active_acc_count,
            "accounts" : serializer.data
        })

#################################################################################################################

# view for opening new account ->
def new_account(request):
    # preventing new account creating if user has 5 accounts
    account_count = Accounts.objects.filter(userid = request.user.users, status = 'ACTIVE').count()

    if account_count>=5:
        messages.error(request, "Provisioning Limit Reached: You may only manage up to 5 active ledgers.")
        return redirect('home')

    if request.method == 'POST':
        verify_password = request.POST.get('verify_password')
        accType = request.POST.get('account_type')
        initial_balance = request.POST.get('initial_balance')

        if not request.user.check_password(verify_password):
            messages.error(request, "Incorrect Password!")
            return render(request, 'base/new_account.html')

        while True :
            generated_acc_no = str(random.randint(1000000000, 9999999999))
            if not Accounts.objects.filter(accountnumber=generated_acc_no).exists():
                break
        
        try:
            with transaction.atomic(): # start transaction to insert into the 'accounts' table
                new_account = Accounts.objects.create(
                    userid = request.user.users,
                    accountnumber = generated_acc_no,
                    accounttype = accType,
                    balance = initial_balance,
                    status = 'ACTIVE',
                    createdate = timezone.now(),
                )

                messages.success(request, 'Account created successfully!')
                messages.success(request, f"Account {generated_acc_no} is now ACTIVE.")
                return redirect('home')
        except Exception as e:
            messages.error(request, f"Provising error : {str(e)}")

    return render(request, 'base/new_account.html')

# converting new_account view to APIView
class CreateAccountAPI(APIView):
    permission_classes = [IsAuthenticated]
    # why use this line of code? accounts should only be created by logged-in users.
    # This ensures that 1. anonymous users cannot call APIView
    # 2. request.user is available

    def post(self,request):
        account_count = Accounts.objects.filter(userid=request.user.users, status='ACTIVE').count()

        if account_count >= 5:
            return Response({'error' : 'Max 5 active accounts are allowed'}, status=400)

        # extract the accounttype and initial balance details from the post request:
        accType = request.data.get('accounttype')
        initial_balance = request.data.get('balance')
        
        while True:# same logic as before for creating a random 10 digit account number
            generated_acc_no = str(random.randint(1000000000, 9999999999))
            if not Accounts.objects.filter(accountnumber=generated_acc_no).exists():
                break
        
        new_account = Accounts.objects.create( # same logic for creating the new account object in the DB
            userid=request.user.users,
            accountnumber=generated_acc_no,
            accounttype=accType,
            balance=initial_balance,
            status='ACTIVE',
            createdate=timezone.now(),
        )

        serializer = AccountSerializer(new_account)
        # why use ModelSerializer? automatically converts DecimalField, etc to JSON format
        return Response(serializer.data, status=201)

#################################################################################################################

# view logic for deactivating a ledger ->
def deactivate_account(request, pk):
    account = Accounts.objects.get(accountid = pk, userid = request.user.users)
    context = {
        'account' : account
    }

    if request.method == "POST" :
        verify_password = request.POST.get('verify_password')
        if not request.user.check_password(verify_password):
            messages.error(request, "Incorrect Password!")
            return render(request, 'base/deactivate_account.html', context)
        
        # start a transaction to deactivate the account ->
        try:
            with transaction.atomic():
                account.status = 'INACTIVE'
                account.save()
                messages.success(request, f"Ledger {account.accountnumber} Has Been Deactivated Successfully!")
                return redirect('home')
        except Exception as e:
            messages.error(request, f'System Error : {str(e)}')

    return render(request, 'base/deactivate_account.html', context)

class DeactivateAccountAPI(APIView):
    permission_classes = [IsAuthenticated]
    # why is permission_classes list = [IsAuthenticated required] used ?
    # why is authentication_classes list used ?

    def post(self, request):
        serializer = DeactivateAccountSerializer(
            data = request.data,
            context = {'request' : request}
        )

        if not serializer.is_valid():
            return Response({
                "success" : False,
                "error" : serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            account = DeactivateAccountService.deactivate_account(
                user=request.user,
                account_number=serializer.validated_data['account_number'] 
            )
            response_serializer = AccountSerializer(account)
            return Response({
                "success": True, 
                "account": response_serializer.data
            }, status=status.HTTP_200_OK)
        
        except Accounts.DoesNotExist:
            return Response(
                {"success": False, "error": "Account not found."},
                status=status.HTTP_404_NOT_FOUND
            )
        except ValueError as e:
            return Response(
                {"success": False, "error": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            return Response(
                {"success": False, "error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


#################################################################################################################

# view for performing a transaction ->
def transfer(request):
    accounts = Accounts.objects.filter(userid = request.user.users)
    context = {'accounts' : accounts}

    if request.method == 'POST':
        # checkbox clicked hona chahiye
        if not request.POST.get('confirm_tx'):
            messages.error(request, "You must confirm the transaction checkbox")
            return render(request, 'base/transfer.html', context)

        # first and foremost thing is to verify the password
        verify_password = request.POST.get('verify_password')

        if not verify_password or not request.user.check_password(verify_password):
            messages.error(request, "Incorrect password.")
            return render(request, 'base/transfer.html', context)

        # fetch the from_accounts object
        from_account_no = request.POST.get('from_account')
        # fetch the to_accounts object
        to_account_no = request.POST.get('to_account')
        # fetch the amount object
        amount = request.POST.get('amount')

        # user cannot transfer from an account to same
        if from_account_no == to_account_no:
            messages.error(request, "Cannot transfer to the same account.")
            return render(request, 'base/transfer.html', context)

        try: # try-catch block for the transaction
            amount = Decimal(amount)
            if amount<=0:
                messages.error(request, "Transfer amount must be positive")
                return render(request, 'base/failure.html', context)

            with transaction.atomic():# start the transaction
                # lock the accounts for sender and reciever -> concurrency control
                from_account = Accounts.objects.select_for_update().get(
                    accountnumber=from_account_no,
                    userid=request.user.users,
                    status='ACTIVE'
                )

                to_account = Accounts.objects.select_for_update().get(
                    accountnumber=to_account_no,
                    status='ACTIVE'
                )

                if from_account.balance < amount:
                    messages.error(request, "Insufficient funds.")
                    return render(request, 'base/transfer.html', context)
                
                # transaction Status object
                success_status, _ = Transactionstatus.objects.get_or_create(statusname='SUCCESS')

                # create transaction record object
                transaction_obj = Transactions.objects.create(
                    fromaccountid=from_account,
                    toaccountid=to_account,
                    amount=amount,
                    transactiontype='TRANSFER',
                    statusid=success_status,
                    createdate=timezone.now()
                )

                # perform transaction
                # Deduct from sender
                from_account.balance -= amount
                from_account.save()
                # Credit receiver
                to_account.balance += amount
                to_account.save()

                # Create Ledger Entry (DEBIT)
                Ledgerentries.objects.create(
                    transactionid=transaction_obj,
                    accountid=from_account,
                    entrytype='DEBIT',
                    amount=amount,
                    createdate=timezone.now()
                )

                # Create Ledger Entry (CREDIT)
                Ledgerentries.objects.create(
                    transactionid=transaction_obj,
                    accountid=to_account,
                    entrytype='CREDIT',
                    amount=amount,
                    createdate=timezone.now()
                )

                # Create Audit Log
                Auditlog.objects.create(
                    entityname='Transactions',
                    entityid=transaction_obj.transactionid,
                    action='TRANSFER_CREATED',
                    performedby=request.user.users.userid,
                    createdate=timezone.now()
                )

                return render(request, 'base/success.html', {'transaction': transaction_obj})

        except Accounts.DoesNotExist:
            messages.error(request, "Invalid account details.")

        except Exception as e:
            messages.error(request, f"System error: {str(e)}")

    return render(request, 'base/transfer.html', context)

# writting the transfer logic in an api
class TransferAPI(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        accounts = Accounts.objects.filter(userid=request.user.users)
        serializer = AccountSerializer(accounts, many=True)
        return Response(serializer.data)

    def post(self, request):
        # this is where we use serializer module to handle validation part of the request ->
        serializer = TransferSerializer(data=request.data, context={"request": request})

        if not serializer.is_valid(): # if validation fails then response of "bad_request" is send to the client
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        try: # this is where we use service module to execute business logic ->
            transaction_obj = TransferService.execute_transfer(
                user=request.user,
                from_account_no=serializer.validated_data['from_account'],
                to_account_no=serializer.validated_data['to_account'],
                amount=serializer.validated_data['amount']
            )

            response_serializer = TransactionSerializer(transaction_obj)

            return Response(
                {
                    "message": "Transfer successful",
                    "transaction": response_serializer.data
                },
                status=status.HTTP_201_CREATED
            )

        except Accounts.DoesNotExist:
            return Response(
                {"error": "Invalid account details."},
                status=status.HTTP_400_BAD_REQUEST
            )

        except ValueError as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

        except Exception as e:
            return Response(
                {"error": f"System error: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

################################################################################################################

class StatementsAPI(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # optional query parameter -> /api/statements?account_number=9876543210
        account_number = request.GET.get('account_number', None)
        try:
            transactions = StatementsService.get_statements(
                user=request.user,
                account_number=account_number
            )
            return Response(
                {
                    "success": True,
                    "count": len(transactions),
                    "transactions": transactions
                },
                status=status.HTTP_200_OK
            )
        except Exception as e:
            return Response(
                {"success": False, "error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


# view for retrieving bank statements ->
def statements(request):
    user_accounts = Accounts.objects.filter(userid = request.user.users)
    selected_account_id = request.GET.get('account_id')

    ledger_qs = Ledgerentries.objects.select_related(
        'transactionid',
        'accountid',
        'transactionid__fromaccountid',
        'transactionid__toaccountid'
    ).filter(accountid__userid=request.user.users)

    if selected_account_id:
        ledger_qs = ledger_qs.filter(accountid__accountid=selected_account_id)

    ledger_qs = ledger_qs.order_by('-createdate')

    transactions = []

    for entry in ledger_qs:

        txn = entry.transactionid

        # Determine counterparty
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
            'amount': entry.amount
        })

    context = {
        'user_accounts': user_accounts,
        'transactions': transactions
    }

    return render(request, 'base/statements.html', context)

# ===============================================================================================================

def beneficiaries(request):
    return render(request, 'base/beneficiaries.html')

class BeneficiariesAPI(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            beneficiaries = BeneficiaryService.get_beneficiaries(user=request.user)
            serializer = BeneficiarySerializer(beneficiaries, many=True)
            return Response(
                {
                    "success": True,
                    "count": beneficiaries.count(),
                    "beneficiaries": serializer.data
                },
                status=status.HTTP_200_OK
            )
        except Exception as e:
            return Response(
                {"success": False, "error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    # POST -> manually add a beneficiary
    def post(self, request):
        serializer = AddBeneficiarySerializer(
            data=request.data,
            context={'request': request}
        )

        if not serializer.is_valid():
            return Response(
                {"success": False, "error": serializer.errors},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            beneficiary, created = BeneficiaryService.add_beneficiary(
                user=request.user,
                account_number=serializer.validated_data['account_number'],
                nickname=serializer.validated_data.get('nickname', None),
                addedtype='MANUAL'
            )
            response_serializer = BeneficiarySerializer(beneficiary)
            return Response(
                {
                    "success": True,
                    "message": "Beneficiary added." if created else "Beneficiary already exists.",
                    "beneficiary": response_serializer.data
                },
                status=status.HTTP_200_OK
            )
        except Exception as e:
            return Response(
                {"success": False, "error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

# ==============================================================================================================

def fixed_deposits(request):
    return render(request, 'base/fixed_deposits.html')

class FixedDepositsAPI(APIView):
    permission_classes = [IsAuthenticated]

    # GET -> view all FDs
    def get(self, request):
        try:
            fds = FixedDepositService.get_fds(user=request.user)
            serializer = FixedDepositSerializer(fds, many=True)
            return Response(
                {
                    "success": True,
                    "count": fds.count(),
                    "fixed_deposits": serializer.data
                },
                status=status.HTTP_200_OK
            )
        except Exception as e:
            return Response(
                {"success": False, "error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    # POST -> create FD
    def post(self, request):
        serializer = CreateFDSerializer(
            data=request.data,
            context={'request': request}
        )

        if not serializer.is_valid():
            return Response(
                {"success": False, "error": serializer.errors},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            fd = FixedDepositService.create_fd(
                user=request.user,
                account_number=serializer.validated_data['account_number'],
                amount=serializer.validated_data['amount']
            )
            response_serializer = FixedDepositSerializer(fd)
            return Response(
                {
                    "success": True,
                    "message": f"FD created successfully. Maturity amount will be {fd.maturityamount} after 6 months.",
                    "fixed_deposit": response_serializer.data
                },
                status=status.HTTP_201_CREATED
            )
        except Accounts.DoesNotExist:
            return Response(
                {"success": False, "error": "Account not found."},
                status=status.HTTP_404_NOT_FOUND
            )
        except ValueError as e:
            return Response(
                {"success": False, "error": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            return Response(
                {"success": False, "error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    # DELETE -> cancel FD
    def delete(self, request, fd_id):
        serializer = CancelFDSerializer(
            data=request.data,
            context={'request': request}
        )

        if not serializer.is_valid():
            return Response(
                {"success": False, "error": serializer.errors},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            fd = FixedDepositService.cancel_fd(
                user=request.user,
                fd_id=fd_id
            )
            response_serializer = FixedDepositSerializer(fd)
            return Response(
                {
                    "success": True,
                    "message": f"FD cancelled. {fd.amount} has been credited back to your account.",
                    "fixed_deposit": response_serializer.data
                },
                status=status.HTTP_200_OK
            )
        except Fixeddeposits.DoesNotExist:
            return Response(
                {"success": False, "error": "FD not found."},
                status=status.HTTP_404_NOT_FOUND
            )
        except ValueError as e:
            return Response(
                {"success": False, "error": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            return Response(
                {"success": False, "error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )