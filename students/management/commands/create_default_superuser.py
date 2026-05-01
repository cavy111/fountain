from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
import os

class Command(BaseCommand):
    help = 'Create a default superuser if none exists'

    def handle(self, *args, **kwargs):
        if not User.objects.filter(is_superuser=True).exists():
            User.objects.create_superuser(
                username=os.environ.get('DJANGO_SUPERUSER_USERNAME', 'admin'),
                password=os.environ.get('DJANGO_SUPERUSER_PASSWORD', 'admin123'),
                email=os.environ.get('DJANGO_SUPERUSER_EMAIL', 'admin@penacademy.co.zw')
            )
            self.stdout.write('Superuser created.')
        else:
            self.stdout.write('Superuser already exists.')
