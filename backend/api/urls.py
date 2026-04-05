from django.urls import path
from . import views

urlpatterns = [
    # Auth
    path('api/register', views.RegistrationAPI.as_view(), name='register-api'),
    path('api/login', views.LoginAPI.as_view(), name='login-api'),
    path('api/logout', views.LogoutAPI.as_view(), name='api-logout'),

    # Home / Accounts
    path('api/home', views.HomeAPI.as_view(), name='home-api'),
    path('api/accounts/create', views.CreateAccountAPI.as_view(), name='create-account-api'),
    path('api/accounts/deactivate', views.DeactivateAccountAPI.as_view(), name='deactivate-account-api'),

    # Transfer
    path('api/transfer', views.TransferAPI.as_view(), name='transfer-api'),

    # Statements
    path('api/statements', views.StatementsAPI.as_view(), name='statements-api'),

    # Beneficiaries
    path('api/beneficiaries', views.BeneficiariesAPI.as_view(), name='beneficiaries-api'),

    # Fixed Deposits
    path('api/fixed_deposits', views.FixedDepositsAPI.as_view(), name='fixed-deposits-api'),
    path('api/fixed_deposits/<int:fd_id>/cancel', views.FixedDepositsAPI.as_view(), name='cancel-fd-api'),
]
