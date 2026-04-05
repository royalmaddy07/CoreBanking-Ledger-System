from django.apps import AppConfig


class ApiConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'api'
    # Keep label = 'base' for backward compatibility with existing django_migrations table entries
    label = 'base'
