from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Accounts, Transactions, Users, Transactionstatus, Ledgerentries, Auditlog, Beneficiaries, Fixeddeposits

class AccountSerializer(serializers.ModelSerializer):
    class Meta:
        model = Accounts
        fields = ['accountid', 'accountnumber', 'accounttype', 'balance', 'status', 'createdate']

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = Users
        fields = ['userid', 'name', 'email', 'phone', 'status', 'createdate']

class TransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Transactions
        fields = ['transactionid', 'fromaccountid', 'toaccountid', 'amount', 'transactiontype', 'statusid', 'createdate']

# ==============================================================================================================

class RegistrationSerializer(serializers.Serializer):
    # (1.) validation of the input fields
    name = serializers.CharField(max_length=50)
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, min_length=6)
    cpassword = serializers.CharField(write_only=True)
    phone = serializers.CharField(max_length=10)

    # (2.) write different validation logics
    # how does a serializer know which method to call -> DRF uses Python's introspection to find methods matching 
    # the pattern validate_<field_name>
    # Object-Level Validation (validate() method) -> DRF specifically looks for a method named validate:
    def validate(self, data):
        if data["password"] != data["cpassword"]:
            raise serializers.ValidationError("Passwords do not match.")

        if len(data["phone"]) != 10 or not data["phone"].isdigit():
            raise serializers.ValidationError("Invalid phone format. 10 digits required.")

        if User.objects.filter(username=data["email"]).exists():
            raise serializers.ValidationError("Email already registered.")

        if Users.objects.filter(phone=data["phone"]).exists():
            raise serializers.ValidationError("Phone already registered.")

        return data

# ===============================================================================================================

class LoginSerializer(serializers.Serializer):
    username = serializers.CharField(max_length=50)
    password = serializers.CharField(min_length=6)

    def validate(self, data):
        if not data["username"] or not data["password"]:
            raise serializers.ValidationError("Both username and password are required.")
        return data

# ===============================================================================================================

class TransferSerializer(serializers.Serializer):
    # role of this serializer : validation of the data types of the fields
    # amount validation & checking whether the user is trying to send the money to the same account itself
    from_account = serializers.CharField()
    to_account = serializers.CharField()
    amount = serializers.DecimalField(max_digits=12, decimal_places=2)
    verify_password = serializers.CharField(write_only=True)
    confirm_tx = serializers.BooleanField()

    def validate_amount(self, value):
        if value <= 0:
            raise serializers.ValidationError("Transfer amount must be positive")
        return value

    def validate(self, data):
        request = self.context.get("request")

        # 1. validate the confirm checkbox
        if not data.get('confirm_tx'):
            raise serializers.ValidationError("You must confirm the transaction.")

        # 2. password validation
        if not request.user.check_password(data.get("verify_password")):
            raise serializers.ValidationError("Incorrect password.")
        
        # 3. Same account validation
        if data['from_account'] == data['to_account']:
            raise serializers.ValidationError("Cannot transfer to the same account.")
        
        return data
    
# ==============================================================================================================

class DeactivateAccountSerializer(serializers.Serializer):
    account_number = serializers.CharField()
    verify_password = serializers.CharField(write_only=True) # field is only used for i/p, never shown in o/p

    def validate(self, data):
        request = self.context.get('request')
        if not request.user.check_password(data.get('verify_password')):
            raise serializers.ValidationError('Incorrect Password.')
        return data
    
# ==============================================================================================================

class BeneficiarySerializer(serializers.ModelSerializer):
    class Meta:
        model = Beneficiaries
        fields = ['beneficiaryid', 'accountnumber', 'nickname', 'addedtype', 'createdate']

class AddBeneficiarySerializer(serializers.Serializer):
    account_number = serializers.CharField()
    nickname = serializers.CharField(max_length=50, required=False, allow_blank=True)

    def validate_account_number(self, value):
        if not Accounts.objects.filter(accountnumber=value, status='ACTIVE').exists():
            raise serializers.ValidationError("Account does not exist or is inactive.")
        return value

    def validate(self, data):
        request = self.context.get('request')
        # user cannot add their own account as a beneficiary
        if Accounts.objects.filter(
            accountnumber=data['account_number'],
            userid=request.user.users
        ).exists():
            raise serializers.ValidationError("You cannot add your own account as a beneficiary.")
        return data
    
# ==============================================================================================================

class FixedDepositSerializer(serializers.ModelSerializer):
    class Meta:
        model = Fixeddeposits
        fields = ['fdid', 'accountid', 'amount', 'interestrate', 'durationmonths', 
                  'maturityamount', 'startdate', 'maturitydate', 'status']

class CreateFDSerializer(serializers.Serializer):
    account_number = serializers.CharField()
    amount = serializers.DecimalField(max_digits=20, decimal_places=2)

    def validate_amount(self, value):
        if value <= 0:
            raise serializers.ValidationError("FD amount must be positive.")
        return value

    def validate_account_number(self, value):
        if not Accounts.objects.filter(accountnumber=value, status='ACTIVE').exists():
            raise serializers.ValidationError("Account does not exist or is inactive.")
        return value

    def validate(self, data):
        request = self.context.get('request')
        # account must belong to the logged in user
        if not Accounts.objects.filter(
            accountnumber=data['account_number'],
            userid=request.user.users
        ).exists():
            raise serializers.ValidationError("This account does not belong to you.")

        # check sufficient balance
        account = Accounts.objects.get(accountnumber=data['account_number'])
        if account.balance < data['amount']:
            raise serializers.ValidationError("Insufficient balance to create FD.")

        return data

class CancelFDSerializer(serializers.Serializer):
    verify_password = serializers.CharField(write_only=True)

    def validate(self, data):
        request = self.context.get('request')
        if not request.user.check_password(data.get('verify_password')):
            raise serializers.ValidationError("Incorrect password.")
        return data
