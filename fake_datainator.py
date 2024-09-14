import requests
import json
import base64
import random
from datetime import datetime
from bson.objectid import ObjectId

# Server URL
BASE_URL = "http://localhost:5000"  # Replace with your server URL

temp = 1

# Fake data for basic info
def generate_fake_user_data():
    global temp
    user_data = {
        "user_id": str(ObjectId()),
        "name": f"Test User {temp}",
        "age": random.randint(18, 90),
        "sex": random.choice(["Male", "Female"]),
        "height": random.randint(150, 200),  # height in cm
        "weight": random.randint(50, 120),  # weight in kg
        "blood_type": random.choice(["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"]),
        "email": f"test{random.randint(1, 100)}@example.com",
        "phone_number": f"12406103742",
        "address": f"Street {random.randint(1, 100)}, City {random.randint(1, 100)}"
    }
    temp += 1
    return user_data

# Fake data for each activity type
def generate_fake_activity_data(user_id, activity_type):
    activity_data = {
        "user_id": user_id,
        "activity_type": activity_type,
        "timestamp": random.randint(1612137600, 1614556800)
    }

    if activity_type == "user_session":
        activity_data["state"] = "Patient reported headache and dizziness and something more about his health. Fever: 38.5C, Blood Pressure: 120/80, Heart Rate: 80bpm, Oxygen Saturation: 98%"
        activity_data["images"] = [
            base64.b64encode(open("./image1.jpeg", "rb").read()).decode("utf-8"),
            base64.b64encode(open("./image2.jpeg", "rb").read()).decode("utf-8")
        ]
        
    elif activity_type == "doctor_notes":
        activity_data["doctor_note"] = "Doctor suggests further tests. Perhaps an MRI scan. What about a blood test? No idea lol"

    elif activity_type == "doctor_diagnosis":
        activity_data["diagnosis"] = "Migraine with negative aura"

    elif activity_type == "doctor_prescription":
        activity_data["doctor_note"] = "Prescribed Ibuprofen 400mg"
    
    elif activity_type == "more_info_request":
        activity_data["doctor_note"] = "Request more information about headaches duration."

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
    for _ in range(10):  # Adjust number of fake users as needed
        fake_user = generate_fake_user_data()
        user_response = post_basic_info(fake_user)
        print("User Insert Response:", user_response)

        if user_response["status"] == "success":
            user_id = fake_user["user_id"]

            # Generate fake activities for each user
            activity_types = ["user_session", "doctor_notes", "doctor_diagnosis", "doctor_prescription", "more_info_request"]

            # Choose random number of activities for each user (between 3 and 10)
            num_activities = random.randint(1,10)

            # Generate random activities for each user
            for _ in range(num_activities):
                activity_type = random.choice(activity_types)  # Randomly select an activity type
                fake_activity = generate_fake_activity_data(user_id, activity_type)
                activity_response = post_activity_info(fake_activity)
                print(f"Activity Insert Response for {activity_type}:", activity_response)
