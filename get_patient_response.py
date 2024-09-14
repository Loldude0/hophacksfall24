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

def expand_user_dict(user_dict: dict, extra_keys: list) -> None:
    for key in extra_keys:
        user_dict[key] = None

def parse_response_dict(response: str) -> dict:
    pattern = r'(?:```)?[^{]*({.*})'
    match = re.search(pattern, response, re.DOTALL)
    if match:
        dict_str = match.group(1)
        return ast.literal_eval(dict_str)
    return {}

def parse_response_list(response: str) -> list:
    print(response)
    pattern = r'(?:```)?[^\[]*(\[.*\])'
    match = re.search(pattern, response, re.DOTALL)
    if match:
        list_str = match.group(1)
        return ast.literal_eval(list_str)
    return []

def ask_for_info(state: dict) -> str:
    prompt = """
    You are a telemedicine doctor. You are seeing a patient who is experiencing symptoms of a disease. You need to ask the patient for more information to diagnose the disease. The patient is not in front of you, so you need to ask the patient for more information.
    You currently have the following information about the patient:
    {state}
    
    "None" in the state means that the information is not available.
    ask the patient for more information about the field with "None" in the state.
    
    You don't need to say "Okay, I understand in the beginning". Just start asking questions.
    ask questions one by one and wait for the patient's response.
    Your role as a doctor starts now.
    """
    
    response = model.generate_content(prompt.format(state=state))
    return response.text

def extract_info(question:str, state: dict, is_img: bool = False, **kwargs) -> None:
    
    """
    kwargs:
    img_path: str
        image path to the image to extract information from (required if is_img is True)
    user_response: str
        user response to the question (required if is_img is False)
    
    """
    
    
    if is_img:
        img_path = kwargs["img_path"]
        img_file = genai.upload_file(img_path)
        
        prompt = """
        extract the data from the image patient provided, and update the state with the new information.
    
        doctor's question:
        {question}
        
        current state:
        {state}
        
        Fill in or update the state with the new information extracted from the image.
        make a key value pair for each piece of information to update the state.
        do not include any key that are not in the state.
        
        example response:
        {{
            "temp": 37.5,
            "soar throat": True
        }}
        
        """
        
        response = model.generate_content([img_file, prompt.format(question=question,state=state)])
        
    else:
        user_response = kwargs["user_response"]
    
        prompt = """
        extract the data from the patient's response and update the state with the new information.
        
        doctor's question:
        {question}
        
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

        response = model.generate_content(prompt.format(question=question,state=state, user_response=user_response))
    
    response_dict = parse_response_dict(response.text)
    update_user_dict(state, response_dict)

def extra_questions(question: str, user_state: dict) -> None:
    prompt = """
    create a list of extra states to ask the patient based on the current state of the patient.
    
    current patient state:
    {state}
    
    extra question from the doctor:
    {question}
    
    initialize the values of the new dictionary keys to None.
    
    output format:
    ["key 1", "key 2", "key 3"]
    
    output example:
    ["weight", "height", "blood type"]
    
    FOLLOW THE EXAMPLE FORMAT ABOVE
    """
    
    response = model.generate_content(prompt.format(state=user_state, question=question))
    response_list = parse_response_list(response.text)
    expand_user_dict(user_state, response_list)

if __name__ == "__main__":
    while True:
        question = ask_for_info(user_info)
        print(question)
        user_response = input("Enter your response: ")
        if user_response == "exit":
            break
        extract_info(question, user_info, is_img=False, user_response=user_response)
        #extract_info(question, user_info, is_img=True, img_path="image.png")
        print(user_info)
        if all(user_info.values()):
            print("All information has been collected")
            break
            
        