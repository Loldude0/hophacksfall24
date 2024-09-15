import google.generativeai as genai
from dotenv import load_dotenv
import os

load_dotenv()
genai.configure(api_key=os.environ["GEMINI_API_KEY"])
model = genai.GenerativeModel('gemini-1.5-flash')

def summarize(state: dict) -> str:
    prompt = """
    You are a helper to a telemedicine doctor. You summarize the information about the patient for the doctor. The doctor is not in front of you, so you need to summarize the information about the patient. Do not add any new information, just summarize the information you have. You have the following conversation with the patient (note that images are skipped):
    {state}
    
    summarize
    """
    
    response = model.generate_content(prompt.format(state=state))
    return response.text