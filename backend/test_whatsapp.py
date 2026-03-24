import os
import django
from pathlib import Path

# Setup Django
BASE_DIR = Path(__file__).resolve().parent
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from notifications.whatsapp import send_whatsapp

def test_whatsapp_direct():
    print("=== Direct WhatsApp Test ===")

    # Test phone number formatting and API call
    phone = "0782821968"
    message = "Test message from Pen Academy SMS system"

    print(f"Testing phone: {phone}")
    print(f"Message: {message}")

    success = send_whatsapp(phone, message)
    print(f"Result: {'SUCCESS' if success else 'FAILED'}")

if __name__ == "__main__":
    test_whatsapp_direct()