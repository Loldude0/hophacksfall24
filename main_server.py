from flask import Flask
from pymongo import MongoClient 

app = Flask(__name__)
client = MongoClient('mongodb://localhost:27017/') 
db = client['main_db']
test = db['test']
user_info = db['user_info']
activity_info = db['activity_info']

@app.route('/')
def hello_world():
    test.insert_one({'test': 'test'})
    return 'Hello World!'

app.run(port=5000)