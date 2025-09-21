import os
import django
import sys

# Get the absolute path of the 'backend' directory, which is where this script lives
backend_dir = os.path.dirname(os.path.abspath(__file__))
# Add the 'backend' directory to the Python path so Django can find the 'ecosystia' project
sys.path.insert(0, backend_dir)

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "ecosystia.settings")
django.setup()

from apps.users.models import User

# Credentials
email = 'admin@example.com'
username = 'admin'
password = 'adminpassword123'
first_name = 'Admin'
last_name = 'Platform'

if not User.objects.filter(email=email).exists():
    print(f"Creating superuser with email: {email} and username: {username}")
    
    # Create the user. Note: create_superuser sets is_staff and is_superuser to True.
    User.objects.create_superuser(
        email=email,
        username=username,
        password=password,
        first_name=first_name,
        last_name=last_name,
        role='super_administrator',
        is_verified=True # Verify the admin user by default
    )
    
    print("Superuser created successfully.")
    print(f"Email (for login): {email}")
    print(f"Password: {password}")
else:
    print(f"Superuser with email {email} already exists.")