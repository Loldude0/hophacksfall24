import requests
import json
import base64
import random
from datetime import datetime
from bson.objectid import ObjectId
import time

# Server URL
BASE_URL = "http://localhost:5000"  # Replace with your server URL

temp = 1

fake_addresses = [
    [78.751176, 21.098611],
    [83.023568, 19.612587],
    [73.833789, 24.725746],
    [85.660295, 25.786556],
    [77.011253, 28.253720],
    [76.697692, 9.750399],
    [79.963947, 12.824952],
    [87.228098, 23.530777],
    [74.946980, 29.761889],
    [92.767666, 25.939389],
    [77.594562, 12.971599],
    [72.877655, 19.076090],
    [80.270186, 13.082680],
]

fake_names = [
    "John Doe",
    "Jane Doe",
    "Alice Smith",
    "Bob Johnson",
    "Charlie Brown",
    "David Lee",
    "Eve Wilson",
    "Frank Miller",
    "Grace Davis",
    "Henry Clark",
    "Ivy White",
    "Jack Green",
    "Kate Anderson",
    "Luke Harris",
    "Mia Martin",
    "Nick Young",
    "Olivia King",
    "Peter Wright",
    "Quinn Hall",
    "Rose Hill",
]

fake_name_pointer = 0


# Fake data for basic info
def generate_fake_user_data():
    global temp
    global fake_name_pointer
    user_data = {
        "user_id": str(ObjectId()),
        "name": fake_names[fake_name_pointer],
        "age": random.randint(18, 90),
        "sex": random.choice(["Male", "Female"]),
        "height": random.randint(150, 200),  # height in cm
        "weight": random.randint(50, 120),  # weight in kg
        "blood_type": random.choice(["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"]),
        "email": f"test{random.randint(1, 100)}@example.com",
        "phone_number": f"12406103742",
        "address": random.choice(fake_addresses),
    }
    temp += 1
    fake_name_pointer += 1
    return user_data


# Fake data for each activity type
def generate_fake_activity_data(user_id, activity_type, i, j):
    activity_data = {
        "user_id": user_id,
        "activity_type": activity_type,
    }

    if activity_type == "user_session" and i % 2 == 0:
        activity_data["state"] = {
            "body temperature in celcius": 39,
            "Respiratory rate": 20,
            "cough": 1,
            "shortness of breath": 0,
            "chest pain": 1,
            "fatigue": 1,
            "headache": 1,
            "nausea": 1,
            "body aches": 1,
            "dizziness": 0,
            "loss of taste": 0,
            "loss of smell": 1,
            "sore throat": 1,
            "congestion": 0,
            "runny nose": 1,
            "diarrhea": 1,
            "skin rash": 1,
        }
        activity_data["images"] = [
            base64.b64encode(open("/home/aryan/hophacksfall24/image_main.jpg", "rb").read()).decode("utf-8"),
        ]
        activity_data["responses"] = (
            "question-answer pair: Please provide information about your symptoms:I am having runny nose, cough, swollen lymph nodes, body ache, diarrhea, headaches, chills/fever\nquestion-answer pair: Could you please tell me your body temperature? Also, have you experienced any chest pain? And have you noticed any loss of smell? \n:fever\nquestion-answer pair: Do you have a sore throat? \n:I have loss of smell, sore throat, chest pain\n"
        )
        activity_data["summary"] = (
            "The patient is experiencing runny nose, cough, swollen lymph nodes, body ache, diarrhea, headaches, chills/fever, loss of smell, sore throat and chest pain. They reported a fever but did not provide a specific temperature. \n",
        )
        activity_data["prediction"] = {
            "data": [
                {"id": 0, "value": 0.6069079637527466, "label": "Covid-19"},
                {"id": 1, "value": 0.0012430587084963918, "label": "Bronchitis"},
                {"id": 2, "value": 0.0012430587084963918, "label": "Influenza"},
                {"id": 3, "value": 0.0012430587084963918, "label": "Migraine"},
                {"id": 4, "value": 0.06809396296739578, "label": "Tuberculosis"},
                {"id": 5, "value": 0.0036759257782250643, "label": "Meningitis"},
                {
                    "id": 6,
                    "value": 0.3175930082798004,
                    "label": "Legionnaires' Disease",
                },
            ]
        }

    elif activity_type == "user_session" and i % 2 != 0:
        activity_data["state"] = {
            "body temperature in celcius": 37.2,
            "Respiratory rate": 20,
            "cough": 0,
            "shortness of breath": 0,
            "chest pain": 0,
            "fatigue": 1,
            "headache": 0,
            "nausea": 1,
            "body aches": 1,
            "dizziness": 0,
            "loss of taste": 0,
            "loss of smell": 0,
            "sore throat": 0,
            "congestion": 0,
            "runny nose": 0,
            "diarrhea": 0,
            "skin rash": 0,
        }
        activity_data["images"] = []
        activity_data["responses"] = (
            "question-answer pair: Can you tell me if you've been experiencing a cough?  Have you noticed any changes in your sense of smell?  And lastly, how long has your skin rash been present? \n:I do not have cough or chang in sense of smell or skin rash\nquestion-answer pair: Have you noticed any chest pain? \nAnd could you please tell me your body temperature? \nDo you have a sore throat? \nHave you experienced any runny nose? \nHave you had diarrhea? \n:no nothing, my body temperature is 37.2C\nquestion-answer pair: Have you experienced any chest pain?  And is it possible you have a skin rash, even a mild one? \n:nope\n"
        )
        activity_data["summary"] = (
            "The patient reports no cough, change in sense of smell, skin rash, chest pain, sore throat, runny nose, or diarrhea. Their body temperature is 37.2C. \n"
        )
        activity_data["prediction"] = {
            "data": [
                {"id": 0, "value": 0.0007922174409031868, "label": "Covid-19"},
                {"id": 1, "value": 0.35258859395980835, "label": "Bronchitis"},
                {"id": 2, "value": 0.0007922174409031868, "label": "Influenza"},
                {"id": 3, "value": 0.5187347531318665, "label": "Migraine"},
                {"id": 4, "value": 0.12550783157348633, "label": "Tuberculosis"},
                {"id": 5, "value": 0.0007922174409031868, "label": "Meningitis"},
                {
                    "id": 6,
                    "value": 0.0007922174409031868,
                    "label": "Legionnaires' Disease",
                },
            ]
        }

    elif activity_type == "doctor_notes" and i % 2 == 0:
        activity_data["doctor_note"] = (
            "Patient is experiencing symptoms of Covid-19. "
            "They have a fever, cough, swollen lymph nodes, body ache, diarrhea, headaches, chills/fever, "
            "loss of smell, sore throat, and chest pain. "
            "They did not provide a specific temperature. "
            "Patient is advised to self-isolate and get tested for Covid-19."
        )
    elif activity_type == "doctor_notes" and i % 2 != 0:
        activity_data["doctor_note"] = (
            "Patient is not experiencing symptoms of severe illness. It is very unclear what the patient is experiencing. "
        )

    elif activity_type == "more_info_request":
        activity_data["doctor_note"] = (
            "More information such as dizzy spells, nausea, and vomiting is needed to make a proper diagnosis."
        )
        activity_data["status"] = "pending"

    elif activity_type == "doctor_diagnosis":
        activity_data["diagnosis"] = "COVID-19"

    elif activity_type == "doctor_prescription":
        if j % 2 == 0:
            activity_data["doctor_note"] = "take Ritonavir 100mg twice a day for 5 days"
            activity_data["med_name"] = "Ritonavir"
            activity_data["med_dosage"] = "100mg"
            activity_data["med_frequency"] = "twice a day"
        else:
            activity_data["doctor_note"] = (
                "take Paracetamol 500mg twice a day for 3 days"
            )
            activity_data["med_name"] = "Paracetamol"
            activity_data["med_dosage"] = "500mg"
            activity_data["med_frequency"] = "twice a day"

    return activity_data


# Post basic user info
def post_basic_info(user_data):
    url = f"{BASE_URL}/post_basic_info"
    response = requests.post(url, json=user_data)
    return response.json()


# Post activity info
# Post activity info with error handling
def post_activity_info(activity_data):
    url = f"{BASE_URL}/post_activity_info"
    response = requests.post(url, json=activity_data)

    # Check if response is not empty and is JSON
    try:
        response.raise_for_status()  # Raises an error for 4xx/5xx HTTP errors
        if response.content:  # Check if response has content
            return response.json()
        else:
            print("Empty response from server")
            return {"status": "error", "message": "Empty response from server"}
    except requests.exceptions.RequestException as e:
        print(f"Error: {e}")
        return {"status": "error", "message": str(e)}
    except json.JSONDecodeError as e:
        print(f"JSON Decode Error: {e}")
        return {"status": "error", "message": "Invalid JSON response from server"}


# Main script to insert fake data
if __name__ == "__main__":
    # Insert fake users
    i = 0
    for _ in range(20):  # Adjust number of fake users as needed
        fake_user = generate_fake_user_data()
        user_response = post_basic_info(fake_user)
        print("User Insert Response:", user_response)

        if user_response["status"] == "success":
            user_id = fake_user["user_id"]

            # We will have two types of fake activities, type one is called a and type two is called b
            a = [
                "user_session",
                "doctor_notes",
                "doctor_diagnosis",
                "doctor_prescription",
                "doctor_prescription",
            ]
            b = ["user_session", "doctor_notes", "more_info_request"]

            if i % 2 == 0:
                activity_types = a
            else:
                activity_types = b

            for activity_type in activity_types:
                if activity_type == "doctor_prescription":
                    for j in range(2):
                        fake_activity = generate_fake_activity_data(
                            user_id, activity_type, i, j
                        )
                        activity_response = post_activity_info(fake_activity)
                        print(f"{activity_type} Insert Response:", activity_response)
                else:
                    fake_activity = generate_fake_activity_data(
                        user_id, activity_type, i, 0
                    )
                    activity_response = post_activity_info(fake_activity)
                    print(f"{activity_type} Insert Response:", activity_response)

        i += 1
