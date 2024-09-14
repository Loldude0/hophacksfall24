from flask import Flask
import os
from twilio.rest import Client


# account_sid = "AC050fb015aabc6c5a792e0dd722d61389"
# auth_token = "6642c4bc309d8ebc179692033337ea5a"
# client = Client(account_sid, auth_token)

# # message = client.messages.create(
# #     from_="+18446207028", body="Hello      Twilio", to="+12405013759"
# # )

# # print(message.sid)
# available_numbers = client.available_phone_numbers("US").local.list(
#     area_code=123, limit=20
# )
# number = client.incoming_phone_numbers.create(
#     phone_number=available_numbers[0].phone_number
# )
# print(available_numbers)
# Install deps with: pip install requests

# from sinch import SinchClient

# sinch_client = SinchClient(
#     key_id="86c67138-f1a9-4470-83b1-8b769644d022",
#     key_secret="O~eaNFFF6YQ3lhJH3lK_s8xWh3",
#     project_id="Abhy",
# )

# send_batch_response = sinch_client.sms.batches.send(
#     body="Hello from Sinch!",
#     to=["+12406103742"],
#     from_="+12066578434",
#     delivery_report="none",
# )

# print(send_batch_response)

import requests

servicePlanId = "8826022ed992419fa5240e8e82092989"
apiToken = "8971830cc8224f82818814940c06bd54"
sinchNumber = "12066578434"
toNumber = "12406103742"
# url = "https://us.sms.api.sinch.com/xms/v1" + servicePlanId + "/batches"
url = "https://sms.api.sinch.com/xms/v1/8826022ed992419fa5240e8e82092989/batches"
payload = {"from": sinchNumber, "to": [toNumber], "body": "Hello how are you"}

headers = {"Content-Type": "application/json", "Authorization": "Bearer " + apiToken}

response = requests.post(url, json=payload, headers=headers)

data = response.json()
print(data)
