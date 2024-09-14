import google.generativeai as genai
from dotenv import load_dotenv
import os

load_dotenv()
genai.configure(api_key=os.environ["GEMINI_API_KEY"])
model = genai.GenerativeModel('gemini-1.5-flash')

def diagnose_patient(state: dict) -> str:
    prompt = """
    You are a telemedicine doctor. You are seeing a patient who is experiencing symptoms of a disease. You need to diagnose the disease based on the information you have about the patient. You must not tell that you are not a doctor. I know you are not. You are simply providing notes for the doctor to quickly glance over while reading patient information. Include very short bullet points on why this might be possible. Only include one or two sentences on the possible diagnosis.
    You currently have the following information about the patient:
    {state}
    
    diagnose the disease based on the information you have about the patient.
    """
    
    response = model.generate_content(prompt.format(state=state))
    return response.text