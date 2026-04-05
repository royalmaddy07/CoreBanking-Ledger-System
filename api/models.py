from django.db import models
from django.contrib.auth.models import User

# this is our Accounts table
class Accounts(models.Model):
    accountid = models.BigAutoField(db_column='accountID', primary_key=True)  # Field name made lowercase.
    userid = models.ForeignKey('Users', models.DO_NOTHING, db_column='userID')  # Field name made lowercase.
    accountnumber = models.CharField(db_column='accountNumber', unique=True, max_length=50)  # Field name made lowercase.
    accounttype = models.CharField(db_column='accountType', max_length=10)  # Field name made lowercase.
    balance = models.DecimalField(max_digits=20, decimal_places=4)
    status = models.CharField(max_length=10)
    createdate = models.DateTimeField(db_column='createdAt')  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'accounts'

# this is our Auditlog table
class Auditlog(models.Model):
    logid = models.BigAutoField(db_column='logID', primary_key=True)  # Field name made lowercase.
    entityname = models.CharField(db_column='entityName', max_length=50)  # Field name made lowercase.
    entityid = models.BigIntegerField(db_column='entityID')  # Field name made lowercase.
    action = models.CharField(max_length=50)
    performedby = models.BigIntegerField(db_column='performedBy')  # Field name made lowercase.
    createdate = models.DateTimeField(db_column='createdAt')  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'auditlog'

# this is our Ledgerentries table
class Ledgerentries(models.Model):
    ledgerid = models.BigAutoField(db_column='ledgerID', primary_key=True)  # Field name made lowercase.
    transactionid = models.ForeignKey('Transactions', models.DO_NOTHING, db_column='transactionID')  # Field name made lowercase.
    accountid = models.ForeignKey(Accounts, models.DO_NOTHING, db_column='accountID')  # Field name made lowercase.
    entrytype = models.CharField(db_column='entryType', max_length=50)  # Field name made lowercase.
    amount = models.DecimalField(max_digits=20, decimal_places=5)
    createdate = models.DateTimeField(db_column='createdAt')  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'ledgerentries'

# this is our transactions table
class Transactions(models.Model):
    transactionid = models.BigAutoField(db_column='transactionID', primary_key=True)  # Field name made lowercase.
    fromaccountid = models.ForeignKey(Accounts, models.DO_NOTHING, db_column='fromAccountID')  # Field name made lowercase.
    toaccountid = models.ForeignKey(Accounts, models.DO_NOTHING, db_column='toAccountID', related_name='transactions_toaccountid_set')  # Field name made lowercase.
    amount = models.DecimalField(max_digits=20, decimal_places=2)
    transactiontype = models.CharField(db_column='transactionType', max_length=10)  # Field name made lowercase.
    statusid = models.ForeignKey('Transactionstatus', models.DO_NOTHING, db_column='statusID')  # Field name made lowercase.
    createdate = models.DateTimeField(db_column='createdAt')  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'transactions'

# this is our Transactionstatus table
class Transactionstatus(models.Model):
    statusid = models.AutoField(db_column='statusID', primary_key=True)  # Field name made lowercase.
    statusname = models.CharField(db_column='statusName', max_length=50)  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'transactionstatus'

# this is our Users table
class Users(models.Model):
    userid = models.BigAutoField(db_column='userID', primary_key=True)  # Field name made lowercase.

    # We need to add this extra column to link our "Users" model to django's "User" model to streamline the
    # registration and authentication step
    auth_user = models.OneToOneField(User, on_delete=models.CASCADE, db_column='auth_user_id', null=True)

    name = models.CharField(max_length=50)
    email = models.CharField(unique=True, max_length=50)
    phone = models.CharField(unique=True, max_length=10)
    status = models.CharField(max_length=10)
    createdate = models.DateTimeField(db_column='createdAt')  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'users'

class Beneficiaries(models.Model):
    beneficiaryid = models.BigAutoField(db_column='beneficiaryID', primary_key=True)
    userid = models.ForeignKey('Users', models.DO_NOTHING, db_column='userID')
    accountnumber = models.CharField(db_column='accountNumber', max_length=50)
    nickname = models.CharField(max_length=50, null=True, blank=True)
    addedtype = models.CharField(db_column='addedType', max_length=10)
    createdate = models.DateTimeField(db_column='createdAt')

    class Meta:
        managed = False
        db_table = 'beneficiaries'

class Fixeddeposits(models.Model):
    fdid = models.BigAutoField(db_column='fdID', primary_key=True)
    userid = models.ForeignKey('Users', models.DO_NOTHING, db_column='userID')
    accountid = models.ForeignKey('Accounts', models.DO_NOTHING, db_column='accountID')
    amount = models.DecimalField(max_digits=20, decimal_places=2)
    interestrate = models.DecimalField(db_column='interestRate', max_digits=5, decimal_places=2, default=5.00)
    durationmonths = models.IntegerField(db_column='durationMonths', default=6)
    maturityamount = models.DecimalField(db_column='maturityAmount', max_digits=20, decimal_places=2)
    startdate = models.DateTimeField(db_column='startDate')
    maturitydate = models.DateTimeField(db_column='maturityDate')
    status = models.CharField(max_length=10, default='ACTIVE')

    class Meta:
        managed = False
        db_table = 'fixeddeposits'