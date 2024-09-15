import torch

model = torch.load("./model/model.pth")

def predict(state):
    """
    state is a 17 element list containing the following information:
    "body temperature in celcius": float,
    "Respiratory rate": int,
    "cough": bool,
    "shortness of breath": bool,
    "chest pain": bool,
    "fatigue": bool,
    "headache": bool,
    "nausea": bool,
    "body aches": bool,
    "dizziness": bool,
    "loss of taste": bool,
    "loss of smell": bool,
    "sore throat": bool,
    "congestion": bool,
    "runny nose": bool,
    "diarrhea": bool,
    "skin rash": bool,
    
    returns a list of 7 element Tensor
    classes:
    ["Covid-19", "Bronchitis", "Influenza", "Migraine", "Tuberculosis", "Meningitis", "Legionnaires' Disease"]
    each representing the probability of the patient having the disease
    """
    
    X = torch.tensor(state, dtype=torch.float32)
    prediction = model(X)
    return prediction