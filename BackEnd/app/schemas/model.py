from pydantic import BaseModel
from typing import Optional

class ModelCreate(BaseModel):
    runpod_model_id: str
    user_id: int
    status: str = "training"
    num_labels: int

class ModelUpdateStatus(BaseModel):
    model_id: int
    status: str = "trained"
    eval_accuracy: Optional[float] = None
    eval_f1: Optional[float] = None
    eval_loss: Optional[float] = None
