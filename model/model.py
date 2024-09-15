import torch
import torch.nn as nn
import torch.functional as F

class Model(nn.Module):
    def __init__(self, num_input, num_hidden_1, num_hidden_2, num_output) -> None:
        super().__init__()
        self.linear1 = nn.Linear(num_input, num_hidden_1)
        self.linear2 = nn.Linear(num_hidden_1, num_hidden_2)
        self.linear3 = nn.Linear(num_hidden_2, num_output)
        
        self.relu = nn.ReLU()
        self.softmax = nn.Softmax(dim=1)
        
        self.temp_std = 0.953750876436425
        self.temp_avg = 38.06273148148148
        
        self.respiratory_rate_std = 2.80196220146655
        self.respiratory_rate_avg = 21.239583333333332
        
        self.dropout = nn.Dropout(0.1)

    def forward(self, x):
        
        # Normalize the input
        x[:,0] = (x[:,0] - self.temp_avg) / self.temp_std
        x[:,1] = (x[:,1] - self.respiratory_rate_avg) / self.respiratory_rate_std
        
        x = self.relu(self.linear1(x))
        x = self.dropout(x)
        x = self.relu(self.linear2(x))
        x = self.dropout(x)
        x = self.relu(self.linear3(x))
        x = self.softmax(x)
        return x
    
    def set_norm_params(self, temp_std, temp_avg, respiratory_rate_std, respiratory_rate_avg):
        self.temp_std = temp_std
        self.temp_avg = temp_avg
        self.respiratory_rate_std = respiratory_rate_std
        self.respiratory_rate_avg = respiratory_rate_avg
        