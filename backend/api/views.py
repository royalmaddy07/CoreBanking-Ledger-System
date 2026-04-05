from .models import Accounts, Beneficiaries, Fixeddeposits
from django.db import IntegrityError

# DRF api views
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from .serializers import UserSerializer, TransactionSerializer, AccountSerializer, TransferSerializer
from .serializers import (
    RegistrationSerializer, LoginSerializer, DeactivateAccountSerializer,
    BeneficiarySerializer, AddBeneficiarySerializer,
    FixedDepositSerializer, CancelFDSerializer, CreateFDSerializer
)
from .services import (
    RegistrationService, TransferService, LoginService, LogoutService,
    DeactivateAccountService, StatementsService, BeneficiaryService, FixedDepositService
)

# ==============================================================================
# Auth APIs
# ==============================================================================

class RegistrationAPI(APIView):
    authentication_classes = []
    permission_classes = []

    def post(self, request):
        serializer = RegistrationSerializer(data=request.data)
        if not serializer.is_valid():
            return Response({
                'success': False,
                'error': serializer.errors
            }, status=400)
        try:
            user = RegistrationService.register_user(
                name=serializer.validated_data['name'],
                email=serializer.validated_data['email'],
                password=serializer.validated_data['password'],
                phone=serializer.validated_data['phone']
            )
            return Response({
                'success': True,
                'message': 'User registration completed successfully'
            }, status=201)
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


class LoginAPI(APIView):
    authentication_classes = []
    permission_classes = []

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if not serializer.is_valid():
            return Response({
                'success': False,
                'error': serializer.errors
            }, status=400)
        try:
            result = LoginService.login_user(
                username=serializer.validated_data['username'],
                password=serializer.validated_data['password']
            )
            return Response({
                "success": True,
                "token": result["token"]
            }, status=200)
        except ValueError as e:
            return Response(
                {"success": False, "error": str(e)},
                status=status.HTTP_401_UNAUTHORIZED
            )


class LogoutAPI(APIView):
    # logout requires a valid token — unauthenticated logout requests should be rejected
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            LogoutService.logout_user(request.user)
            return Response({
                "success": True,
                "message": "Logged out successfully"
            }, status=200)
        except Exception as e:
            return Response(
                {"success": False, "error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

# ==============================================================================
# Home / Accounts APIs
# ==============================================================================

class HomeAPI(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        accounts = Accounts.objects.filter(userid=request.user.users)
        active_acc_count = accounts.filter(status='ACTIVE').count()
        serializer = AccountSerializer(accounts, many=True)
        return Response({
            'active_acc_count': active_acc_count,
            'accounts': serializer.data
        })


class CreateAccountAPI(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        import random
        account_count = Accounts.objects.filter(userid=request.user.users, status='ACTIVE').count()

        if account_count >= 5:
            return Response({'error': 'Max 5 active accounts are allowed'}, status=400)

        accType = request.data.get('accounttype')
        initial_balance = request.data.get('balance')

        while True:
            generated_acc_no = str(random.randint(1000000000, 9999999999))
            if not Accounts.objects.filter(accountnumber=generated_acc_no).exists():
                break

        from django.utils import timezone
        new_account = Accounts.objects.create(
            userid=request.user.users,
            accountnumber=generated_acc_no,
            accounttype=accType,
            balance=initial_balance,
            status='ACTIVE',
            createdate=timezone.now(),
        )

        serializer = AccountSerializer(new_account)
        return Response(serializer.data, status=201)


class DeactivateAccountAPI(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = DeactivateAccountSerializer(
            data=request.data,
            context={'request': request}
        )

        if not serializer.is_valid():
            return Response({
                "success": False,
                "error": serializer.errors
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

# ==============================================================================
# Transfer API
# ==============================================================================

class TransferAPI(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        accounts = Accounts.objects.filter(userid=request.user.users)
        serializer = AccountSerializer(accounts, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = TransferSerializer(data=request.data, context={"request": request})

        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        try:
            transaction_obj = TransferService.execute_transfer(
                user=request.user,
                from_account_no=serializer.validated_data['from_account'],
                to_account_no=serializer.validated_data['to_account'],
                amount=serializer.validated_data['amount']
            )
            response_serializer = TransactionSerializer(transaction_obj)
            return Response({
                "message": "Transfer successful",
                "transaction": response_serializer.data
            }, status=status.HTTP_201_CREATED)

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

# ==============================================================================
# Statements API
# ==============================================================================

class StatementsAPI(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # optional query parameter: /api/statements?account_number=9876543210
        account_number = request.GET.get('account_number', None)
        try:
            transactions = StatementsService.get_statements(
                user=request.user,
                account_number=account_number
            )
            return Response({
                "success": True,
                "count": len(transactions),
                "transactions": transactions
            }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response(
                {"success": False, "error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

# ==============================================================================
# Beneficiaries API
# ==============================================================================

class BeneficiariesAPI(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            beneficiaries = BeneficiaryService.get_beneficiaries(user=request.user)
            serializer = BeneficiarySerializer(beneficiaries, many=True)
            return Response({
                "success": True,
                "count": beneficiaries.count(),
                "beneficiaries": serializer.data
            }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response(
                {"success": False, "error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

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
            return Response({
                "success": True,
                "message": "Beneficiary added." if created else "Beneficiary already exists.",
                "beneficiary": response_serializer.data
            }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response(
                {"success": False, "error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

# ==============================================================================
# Fixed Deposits API
# ==============================================================================

class FixedDepositsAPI(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            fds = FixedDepositService.get_fds(user=request.user)
            serializer = FixedDepositSerializer(fds, many=True)
            return Response({
                "success": True,
                "count": fds.count(),
                "fixed_deposits": serializer.data
            }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response(
                {"success": False, "error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

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
            return Response({
                "success": True,
                "message": f"FD created successfully. Maturity amount will be {fd.maturityamount} after 6 months.",
                "fixed_deposit": response_serializer.data
            }, status=status.HTTP_201_CREATED)
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
            return Response({
                "success": True,
                "message": f"FD cancelled. {fd.amount} has been credited back to your account.",
                "fixed_deposit": response_serializer.data
            }, status=status.HTTP_200_OK)
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
