from rest_framework import serializers
from .models import Accounts, Transactions, Users, Transactionstatus, Ledgerentries, Auditlog

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