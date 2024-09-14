from flask import Flask
from flask import request
from flask import jsonify
from pymongo import MongoClient
import gridfs
from server_ai_pipeline import diagnose_patient
from datetime import datetime

app = Flask(__name__)
client = MongoClient("mongodb://localhost:27017/")
db = client["main_db"]
test = db["test"]
user_info = db["user_info"]
activity_info = db["activity_info"]
fs = gridfs.GridFS(db)


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
        return jsonify({"status": "success", "message": "User created"})
    else:
        return jsonify({"status": "error", "message": "User already exists"})

@app.route("/get_activity_info", methods=["GET"])
def get_activity_info():
    user_id = request.args.get("user_id")
    activity = activity_info.find_one({"_id": user_id})
    if activity is None:
        return jsonify({"status": "error", "message": "Activity not found"})
    else:
        #load images and convert them to base64
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
        #TODO: do something for the analytics on the map later
        pass
    elif activity_type == "doctor_prescription":
        #TODO: send a sms with the prescription
        pass
    elif activity_type == "live_meeting":
        #TODO: send a sms and implement a live meeting using something
        pass
    elif activity_type == "more_info_request":
        #TODO: send a sms asking for more info
        request.json["status"] = "pending"
    else:
        return jsonify({"status": "error", "message": "Invalid activity type"})

    activities.append(request.json)
    activity_info.update_one({"_id": user_id}, {"$set": {"activities": activities}}, upsert=True)

    return jsonify({"status": "success", "message": "Activity created"})

@app.route("get_doctor_request", methods=["GET"])
def get_doctor_request():
    user_id = request.args.get("user_id")
    activity = activity_info.find_one({"_id": user_id})
    if activity is None:
        return jsonify({"status": "error", "message": "Activity not found"})
    else:
        #find if there is an activity type with status pending
        for act in activity["activities"]:
            if act["activity_type"] == "more_info_request" and act["status"] == "pending":
                act["status"] = "completed"
                activity_info.update_one({"_id": user_id}, {"$set": {"activities": activity["activities"]}})
                return jsonify(act)
    return jsonify({"status": "error", "message": "No pending request"})


app.run(port=5000)
