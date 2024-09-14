import google.generativeai as genai
from dotenv import load_dotenv
import ast
import re
import os

load_dotenv()
genai.configure(api_key=os.environ["GEMINI_API_KEY"])
model = genai.GenerativeModel('gemini-1.5-flash')

user_info = {
    "temp": None,
    "soar throat": None
}

def update_user_dict(user_dict: dict, response_dict: dict) -> None:
    for key in response_dict:
        if key in user_dict:
            user_dict[key] = response_dict[key]

def parse_response_dict(response: str) -> dict:
    pattern = r'(?:```)?[^{]*({.*})'
    match = re.search(pattern, response, re.DOTALL)
    if match:
        dict_str = match.group(1)
        return ast.literal_eval(dict_str)
    return {}


def ask_for_info(state: dict) -> str:
    prompt = """
    You are a telemedicine doctor. You are seeing a patient who is experiencing symptoms of a disease. You need to ask the patient for more information to diagnose the disease. The patient is not in front of you, so you need to ask the patient for more information.
    You currently have the following information about the patient:
    {state}
    
    "None" in the state means that the information is not available.
    ask the patient for more information about the field with "None" in the state.
    """
    
    response = model.generate_content(prompt.format(state=state))
    return response.text

def extract_info(user_response: str, state: dict) -> None:
    prompt = """
    extract the data from the patient's response and update the state with the new information.
    
    current state:
    {state}
    
    user response:
    {user_response}
    
    Fill in or update the state with the new information extracted from the user response.
    make a key value pair for each piece of information to update the state.
    do not include any key that are not in the state.
    
    example response:
    {{
        "temp": 37.5,
        "soar throat": True
    }}
    """

    response = model.generate_content(prompt.format(state=state, user_response=user_response))
    response_dict = parse_response_dict(response.text)
    update_user_dict(state, response_dict)
    
if __name__ == "__main__":
    while True:
        question = ask_for_info(user_info)
        print(question)
        user_response = input("Enter your response: ")
        if user_response == "exit":
            break
        extract_info(user_response, user_info)
        print(user_info)
        if all(user_info.values()):
            print("All information has been collected")
            break
        