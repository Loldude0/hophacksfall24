from flask import Flask
from flask import request
from flask import jsonify
from pymongo import MongoClient
import gridfs
from server_ai_pipeline import diagnose_patient
from datetime import datetime
from send_sms import send_sms

from get_patient_response import ask_for_info, extract_info, add_extra_questions

app = Flask(__name__)
client = MongoClient("mongodb://localhost:27017/")
db = client["main_db"]
test = db["test"]
user_info = db["user_info"]
activity_info = db["activity_info"]
fs = gridfs.GridFS(db)

user_info = {
    "temp": None,
    "soar throat": None
}

@app.route("/get_basic_info", methods=["GET"])
def get_basic_info():
    user_id = request.args.get("user_id")
    user = user_info.find_one({"_id": user_id})
    if user is None:
        return jsonify({"status": "error", "message": "User not found"})
    return jsonify(user)


@app.route("/post_basic_info", methods=["POST"])
def post_basic_info():
    user_id = request.json["user_id"]
    user = user_info.find_one({"_id": user_id})
    if user is None:
        user_info.insert_one(request.json)
        return jsonify({"status": "success", "message": "User created", "user_id": user_id})
    else:
        return jsonify({"status": "error", "message": "User already exists"})


@app.route("/get_activity_info", methods=["GET"])
def get_activity_info():
    user_id = request.args.get("user_id")
    activity = activity_info.find_one({"_id": user_id})
    if activity is None:
        return jsonify({"status": "error", "message": "Activity not found"})
    else:
        # load images and convert them to base64
        for act in activity["activities"]:
            images = []
            for image in act["images"]:
                image = fs.get(image)
                images.append(image.read().decode("utf-8"))
            act["images"] = images
    return jsonify(activity)


@app.route("/post_activity_info", methods=["POST"])
def post_activity_info():
    user_id = request.json["user_id"]
    activity_type = request.json["activity_type"]
    activity = activity_info.find_one({"_id": user_id})
    if activity is not None:
        activities = activity["activities"]
    else:
        activities = []
    request.json["timestamp"] = datetime.now()
    user_number = user_info.find({"_id": user_id})[0]["phone_number"]

    if activity_type == "user_session":
        state = request.json["state"]
        response = diagnose_patient(state)
        request.json["ai_notes"] = response
        images = []
        for image in request.json["images"]:
            image_id = fs.put(image)
            images.append(image_id)
        request.json["images"] = images
    elif activity_type == "doctor_notes":
        pass
    elif activity_type == "doctor_diagnosis":
        # TODO: do something for the analytics on the map later
        pass
    elif activity_type == "doctor_prescription":
        user_number = user_info.find({"_id": user_id})[0]["phone_number"]
        send_sms(
            user_number, "You have a new prescription: " + request.json["doctor_note"]
        )
        pass
    elif activity_type == "live_meeting":
        # TODO: send a sms and implement a live meeting using something
        pass
    elif activity_type == "more_info_request":
        user_number = user_info.find({"_id": user_id})[0]["phone_number"]
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


@app.route("/get_doctor_request", methods=["GET"])
def get_doctor_request():
    user_id = request.args.get("user_id")
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
                add_extra_questions(doctor_note, user_info)
                return jsonify({"status": "ok", "is_pending": True,"message": ask_for_info(user_info)})
                
    return jsonify({"status": "ok", "is_pending": False, "message": "No pending request"})

@app.route("/get_bot_response", methods=["GET"])
def get_bot_response():
    response_type = request.args.get("response_type")
    question = request.args.get("question")

    content = request.args.get("content")
    file_name = request.args.get("file_name")
    extract_info(question, state=user_info, response_type=response_type, content=content, file_name=file_name)
    if all(user_info.values()):
        return jsonify({"status": "done", "message": "All information extracted"})
    else:
        return jsonify({"status": "ok", "message": ask_for_info(user_info)})

app.run(port=5000)
