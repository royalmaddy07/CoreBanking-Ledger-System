from django.apps import AppConfig

# this is the base app we created using the startapp command
class BaseConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'base'
