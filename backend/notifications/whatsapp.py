import requests
import logging
from django.conf import settings

logger = logging.getLogger(__name__)

def send_whatsapp(phone_number, message):
    """
    Send WhatsApp message using WhatsApp Business Cloud API

    Args:
        phone_number (str): Phone number to send message to
        message (str): Message content

    Returns:
        bool: True if successful, False if failed
    """
    try:
        # Format phone number to international format
        # Remove any leading + or 0, then add +263 for Zimbabwe
        phone = phone_number.strip()
        print(f"Original phone number: {phone}")

        if phone.startswith('+'):
            phone = phone[1:]
        if phone.startswith('0'):
            phone = phone[1:]
        formatted_phone = f"263{phone}"
        print(f"Formatted phone number: {formatted_phone}")

        # WhatsApp API endpoint
        url = f"https://graph.facebook.com/{settings.WHATSAPP_VERSION}/{settings.WHATSAPP_PHONE_ID}/messages"
        print(f"API URL: {url}")
        print(f"Token starts with: {settings.WHATSAPP_TOKEN[:20]}...")
        print(f"Phone ID: {settings.WHATSAPP_PHONE_ID}")

        # Headers
        headers = {
            'Authorization': f'Bearer {settings.WHATSAPP_TOKEN}',
            'Content-Type': 'application/json'
        }

        # Message payload
        payload = {
            'messaging_product': 'whatsapp',
            'to': formatted_phone,
            'type': 'text',
            'text': {
                'body': message
            }
        }

        print(f"Payload: {payload}")

        # Send request
        response = requests.post(url, json=payload, headers=headers)
        print(f"Response status: {response.status_code}")
        response_data = response.json()
        print(f"Response data: {response_data}")

        if response.status_code == 200 and response_data.get('messages'):
            logger.info(f"WhatsApp message sent successfully to {formatted_phone}")
            return True
        else:
            error_message = response_data.get('error', {}).get('message', 'Unknown error')
            error_code = response_data.get('error', {}).get('code', 'Unknown code')
            print(f"WhatsApp API Error: {error_code} - {error_message}")
            logger.error(f"Failed to send WhatsApp message to {formatted_phone}: {error_code} - {error_message}")
            return False

    except Exception as e:
        logger.error(f"Error sending WhatsApp message to {phone_number}: {str(e)}")
        print(f"Exception: {str(e)}")
        return False