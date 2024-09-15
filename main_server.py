from flask import Flask
from flask import request
from flask import jsonify
from pymongo import MongoClient
import gridfs
from server_ai_pipeline import summarize
from datetime import datetime
from send_sms import send_sms
import base64
from flask_cors import CORS, cross_origin
from bson.objectid import ObjectId
import requests
import os
from collections import defaultdict
from threading import Lock

from get_patient_response import ask_for_info, extract_info, add_extra_questions
from disease_prediction import predict

app = Flask(__name__)
client = MongoClient("mongodb://localhost:27017/")
db = client["main_db"]
test = db["test"]
user_info = db["user_info"]
activity_info = db["activity_info"]
fs = gridfs.GridFS(db)
CORS(app)

user_info_client = {
    "body temperature in celcius": None,
    "Respiratory rate": 20,
    "cough": None,
    "shortness of breath": False,
    "chest pain": None,
    "fatigue": True,
    "headache": False,
    "nausea": True,
    "body aches": True,
    "dizziness": False,
    "loss of taste": False,
    "loss of smell": None,
    "sore throat": None,
    "congestion": False,
    "runny nose": None,
    "diarrhea": None,
    "skin rash": True,
}

response_storage_dict = defaultdict(str)
response_storage_lock = Lock()


def convert_all_images_to_base64():
    files = os.listdir("./media/images")
    res = []
    for file in files:
        with open(f"./media/images/{file}", "rb") as f:
            img_base64 = base64.b64encode(f.read()).decode("utf-8")
            res.append(img_base64)

    return res


@app.route("/get_basic_info", methods=["GET"])
def get_basic_info():
    user_id = request.args.get("user_id")
    print(user_id)
    user = user_info.find_one({"_id": user_id})
    print(user)
    if user is None:
        return jsonify({"status": "error", "message": "User not found"})
    return jsonify(user)


@app.route("/post_basic_info", methods=["POST"])
def post_basic_info():
    user_id = request.json["user_id"]
    user = user_info.find_one({"_id": user_id})
    if user is None:
        user_data = request.json.copy()
        user_data["_id"] = user_id
        del user_data["user_id"]
        user_info.insert_one(user_data)
        return jsonify(
            {"status": "success", "message": "User created", "user_id": user_id}
        )
    else:
        return jsonify({"status": "error", "message": "User already exists"})


@app.route("/get_activity_info", methods=["GET"])
def get_activity_info():
    user_id = request.args.get("user_id")
    activity = activity_info.find_one({"_id": user_id})
    if activity is None:
        return jsonify({"status": "error", "message": "Activity not found"})
    else:
        for act in activity["activities"]:
            if "images" in act:
                images = []
                for image in act["images"]:
                    image_data = fs.get(image).read()
                    images.append(base64.b64encode(image_data).decode("utf-8"))
                act["images"] = images
        activity["activities"] = activity["activities"][::-1]

        for act in activity["activities"]:
            if "state" in act and type(act["state"]) is not str:
                for key in list(act["state"].keys()):
                    if act["state"][key] is None:
                        del act["state"][key]
    return jsonify(activity)


@app.route("/post_activity_info", methods=["POST"])
def post_activity_info():
    user_id = request.json["user_id"]
    activity_type = request.json["activity_type"]
    activity = activity_info.find_one({"_id": user_id})
    if activity is not None:
        activities = activity["activities"]
        print("exists")
    else:
        activities = []
    request.json["timestamp"] = datetime.now()
    print(user_info.find({"_id": user_id}))
    user_number = user_info.find_one({"_id": user_id})["phone_number"]

    if activity_type == "user_session":
        state = request.json["state"]
        responses = request.json["responses"]
        response = summarize(responses)
        request.json["summary"] = response
        request.json["prediction"] = predict(state)
        if request.json["images"]:
            images = []
            for image in request.json["images"]:
                image_data = base64.b64decode(image)
                image_id = fs.put(image_data)
                images.append(image_id)
            request.json["images"] = images
    elif activity_type == "doctor_notes":
        pass
    elif activity_type == "doctor_diagnosis":
        # TODO: do something for the analytics on the map later
        pass
    elif activity_type == "doctor_prescription":
        send_sms(
            user_number, "You have a new prescription: " + request.json["doctor_note"]
        )
        pass
    elif activity_type == "live_meeting":
        # TODO: implement a live meeting using something
        pass
    elif activity_type == "more_info_request":
        send_sms(
            user_number,
            "You have a new request from your doctor: " + request.json["doctor_note"],
        )
        request.json["status"] = "pending"
    else:
        return jsonify({"status": "error", "message": "Invalid activity type"})

    activities.append(request.json)
    activity_info.update_one(
        {"_id": user_id}, {"$set": {"activities": activities}}, upsert=True
    )

    return jsonify({"status": "success", "message": "Activity created"})


@app.route("/get_doctor_request", methods=["POST"])
def get_doctor_request():
    data = request.json
    user_id = data["user_id"]
    activity = activity_info.find_one({"_id": user_id})
    if activity is None:
        return jsonify({"status": "error", "message": "Activity not found"})
    else:
        # find if there is an activity type with status pending
        for act in activity["activities"]:
            if (
                act["activity_type"] == "more_info_request"
                and act["status"] == "pending"
            ):
                act["status"] = "completed"
                activity_info.update_one(
                    {"_id": user_id}, {"$set": {"activities": activity["activities"]}}
                )

                doctor_note = act["doctor_note"]
                add_extra_questions(doctor_note, user_info_client)
                return jsonify(
                    {
                        "status": "ok",
                        "is_pending": True,
                        "message": ask_for_info(user_info_client),
                        "phone_number": "12406103742",
                    }
                )

    return jsonify(
        {"status": "ok", "is_pending": False, "message": "No pending request"}
    )


@app.route("/get_user_prescription", methods=["GET"])
def get_user_prescription():
    user_id = request.args.get("user_id")
    activity = activity_info.find_one({"_id": user_id})
    if activity is None:
        return jsonify({"status": "error", "message": "Activity not found"})
    else:
        # find if there is an activity type with status pending
        prescriptions = []
        for act in activity["activities"]:
            if act["activity_type"] == "doctor_prescription":
                prescriptions.append(
                    {
                        "med_name": act["med_name"],
                        "med_dosage": act["med_dosage"],
                        "med_frequency": act["med_frequency"],
                        "doctor_note": act["doctor_note"],
                    }
                )

        if prescriptions:
            return jsonify({"status": "ok", "prescriptions": prescriptions})
        else:
            return jsonify({"status": "error", "message": "No prescription found"})


@app.route("/get_user_diagnosis", methods=["GET"])
def get_user_diagnosis():
    user_id = request.args.get("user_id")
    activity = activity_info.find_one({"_id": user_id})
    if activity is None:
        return jsonify({"status": "error", "message": "Activity not found"})
    else:
        diagnosis = None
        for act in activity["activities"]:
            if act["activity_type"] == "doctor_diagnosis":
                diagnosis = act["diagnosis"]

            return jsonify({"status": "ok", "diagnosis": diagnosis})

    return jsonify({"status": "error", "message": "No diagnosis found"})


@app.route("/get_patient_addresses", methods=["GET"])
def get_patient_addresses():
    patients = user_info.find()
    markers = []
    for patient in patients:
        markers.append(
            {
                "name": patient["_id"],
                "coordinates": patient["address"],
            }
        )

    return jsonify({"status": "ok", "addresses": markers})


@cross_origin()
def get_bot_response():
    data = request.json

    required_keys = ["user_id", "response_type", "question", "content", "file_name"]
    if not all(key in data for key in required_keys):
        return jsonify({"status": "error", "message": "Missing required data"}), 400

    user_id = str(data.get("user_id", ""))
    if not user_id:
        return jsonify({"status": "error", "message": "Invalid user ID"}), 400

    response_type = data["response_type"]
    question = data["question"]
    content = data["content"]
    file_name = data["file_name"]

    print(request.json)
    print(response_type, question, content, file_name)

    try:
        user_response = extract_info(
            question,
            state=user_info_client,
            response_type=response_type,
            content=content,
            file_name=file_name,
        )

        with response_storage_lock:
            response_storage_dict[
                user_id
            ] += f"question-answer pair: {question}:{user_response}\n"

        print(user_info_client)

        if all([value is not None for value in user_info_client.values()]):
            requests.post(
                "http://localhost:5000/post_activity_info",
                json={
                    "user_id": user_id,
                    "activity_type": "user_session",
                    "state": user_info_client,
                    "images": convert_all_images_to_base64(),
                    "responses": response_storage_dict[user_id],
                },
            )
            os.rmdir("./media")
            return jsonify({"status": "done", "message": "All information extracted"})
        else:
            return jsonify({"status": "ok", "message": ask_for_info(user_info_client)})

    except Exception as e:
        print(f"Error in get_bot_response: {e}")
        return (
            jsonify(
                {
                    "status": "error",
                    "message": "An error occurred processing your request",
                }
            ),
            500,
        )


@app.route("/search_patient", methods=["GET"])
def search_patient():
    patient_name = request.args.get("name")
    if not patient_name:
        return jsonify({"status": "error", "message": "Name parameter is required"})

    patients = user_info.find(
        {"name": {"$regex": f".*{patient_name}.*", "$options": "i"}}
    )
    patient_list = list(patients)

    if not patient_list:
        return jsonify({"status": "error", "message": "No patients found"})

    return jsonify({"status": "success", "patients": patient_list})


@app.route("/get_prediction", methods=["GET"])
def get_prediction():
    input_data = list(user_info_client.values())
    for i in range(len(input_data)):
        if input_data[i] is None:
            input_data[i] = 0

    prediction = predict(input_data)
    series = {"data": []}

    classes = [
        "Covid-19",
        "Bronchitis",
        "Influenza",
        "Migraine",
        "Tuberculosis",
        "Meningitis",
        "Legionnaires' Disease",
    ]
    for i in range(len(prediction)):
        series["data"].append(
            {"id": i, "value": prediction[i].item(), "label": classes[i]}
        )

    return jsonify(series)


app.run(port=5000, debug=True)
