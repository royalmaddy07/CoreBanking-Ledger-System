from django.contrib import admin
from .models import Users, Transactions, Transactionstatus, Accounts, Ledgerentries, Auditlog

# Registering the models created to the django admin
admin.site.register(Users)
admin.site.register(Transactions)
admin.site.register(Accounts)
admin.site.register(Ledgerentries)
admin.site.register(Transactionstatus)
admin.site.register(Auditlog)