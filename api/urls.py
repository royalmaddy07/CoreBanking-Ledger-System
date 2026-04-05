from django.urls import path
from . import views

urlpatterns = [
    path('', views.login_user, name='login'),
    path('api/login', views.LoginAPI.as_view(), name='login-api'),

    path('home/', views.home, name='home'),
    path('api/home', views.HomeAPI.as_view(), name='home-api'),

    path('register/', views.register_user, name='register'),
    path('api/register', views.RegistrationAPI.as_view(), name='register-api'),

    path('logout/', views.logout_user, name='logout'),
    path('api/logout', views.LogoutAPI.as_view(), name="api-logout"),

    path('new_account/', views.new_account, name="new_account"),
    path('api/accounts/create', views.CreateAccountAPI.as_view(), name='create-account-api'),

    path('transfer/', views.transfer, name='transfer'),
    path('api/transfer', views.TransferAPI.as_view(), name='transfer-api'),

    path('statements/', views.statements, name='statements'),
    path('api/statements', views.StatementsAPI.as_view(), name='statements-api'),

    path('deactivate_account/<int:pk>', views.deactivate_account, name='deactivate_account'),
    path('api/accounts/deactivate', views.DeactivateAccountAPI.as_view(), name='deactivate-account-api'),

    path('beneficiaries/', views.beneficiaries, name='beneficiaries'),
    path('api/beneficiaries', views.BeneficiariesAPI.as_view(), name='beneficiaries-api'),

    path('fixed_deposits/', views.fixed_deposits, name="fixed-deposits"),
    path('api/fixed_deposits', views.FixedDepositsAPI.as_view(), name='fixed-deposits-api'),
    path('api/fixed_deposits/<int:fd_id>/cancel', views.FixedDepositsAPI.as_view(), name='cancel-fd-api'),
]