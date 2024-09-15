import torch
from model.model import Model

model = Model(17, 32, 64, 7)
model.load_state_dict(torch.load("./model/model.pth", weights_only=True))

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
    for key in state:
        if isinstance(state[key], bool):
            state[key] = int(state[key])
        elif state[key] is None:
            state[key] = 0
        else:
            state[key] = float(state[key])
    print(state)
    #limit to first 17 elements
    state = {k: state[k] for k in list(state)[:17]}
    vals = list(state.values())
    X = torch.tensor(vals, dtype=torch.float32)
    X = X.reshape(1, -1)
    prediction = model(X)
    print(prediction)
    #convert to list
    prediction = prediction[0].tolist()
    return prediction