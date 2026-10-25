import os

import requests

try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN", "").strip()
EMERGENCY_CONTACTS = [
    chat_id.strip()
    for chat_id in os.getenv("TELEGRAM_CHAT_IDS", "").split(",")
    if chat_id.strip()
]


def send_telegram_alert(message):
    if not BOT_TOKEN or not EMERGENCY_CONTACTS:
        print("⚠️ Telegram alert skipped: set TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_IDS.")
        return

    url = f"https://api.telegram.org/bot{BOT_TOKEN}/sendMessage"

    for chat_id in EMERGENCY_CONTACTS:
        payload = {
            "chat_id": chat_id,
            "text": message
        }

        try:
            requests.post(url, json=payload, timeout=5)
        except Exception as e:
            print("Telegram send failed:", e)
