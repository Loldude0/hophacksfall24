import os
import requests

servicePlanId = os.environ["PLAN_ID"]
apiToken = os.environ["API_TOKEN_SMS"]
sinchNumber = "12066578434"


def send_sms(number, text):
    url = f"https://sms.api.sinch.com/xms/v1/%7BservicePlanId%7D/batches"
    payload = {
        "from": sinchNumber,
        "to": [number],
        "body": f"{text}",
    }

    headers = {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + apiToken,
    }

    response = requests.post(url, json=payload, headers=headers)

    data = response.json()
    print(data)
