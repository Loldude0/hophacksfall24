from flask import Flask
import os
from twilio.rest import Client


app = Flask(__name__)


account_sid = "AC050fb015aabc6c5a792e0dd722d61389"
auth_token = "6642c4bc309d8ebc179692033337ea5a"
client = Client(account_sid, auth_token)

message = client.messages.create(
    from_="+18446207028", body="Hello      Twilio", to="+12406103742"
)

print(message.sid)
