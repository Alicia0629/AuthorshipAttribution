from fastapi import APIRouter, UploadFile, File, Depends, Form
from pydantic import BaseModel
import pandas as pd
import base64, json, requests, time, tempfile, os
from app.core.config import URL_TRAIN, URL_TEST, RUNPOD_KEY
from app.schemas.user import UserOut
from app.core.auth import get_current_user

router = APIRouter()

@router.post("/train")
async def train_model(file: UploadFile = File(...), text_column:str = Form(...), label_column:str = Form(...), current_user: UserOut = Depends(get_current_user)):
    print("train")
    print(text_column)
    print(label_column)
    with tempfile.NamedTemporaryFile(delete=False, mode='wb') as tmp_file:
        tmp_file.write(await file.read())
        tmp_file.close()

    df = pd.read_csv(tmp_file.name)
    unique_labels = df[label_column].nunique()

    with open(tmp_file.name, "rb") as f:
        encoded = base64.b64encode(f.read()).decode('utf-8')

    job_id = f"job-{current_user.email}-{str(time.time())}"

    payload = {
        "id": job_id,
        "input": {
            "file": encoded,
            "text_column": text_column,
            "label_column": label_column,
            "user_id": current_user.email
        }
    }

    print(URL_TRAIN)
    print(text_column)
    headers = {
    "Authorization": RUNPOD_KEY,
    "accept": "application/json"
    }
    print(headers)
    response = requests.post(f"{URL_TRAIN}/run", headers=headers, data=json.dumps(payload))
    print(job_id)
    print(response.json())
    os.remove(tmp_file.name)

    if 'error' in response.json():
        return response.json()
    
    return {"job_id": job_id, "unique_labels": unique_labels, "response": response.json()}



class PredictInput(BaseModel):
    text: str

@router.post("/predict")
def predict(data: PredictInput, current_user: UserOut = Depends(get_current_user)):
    num_labels = data.num_labels
    
    payload = {
        "id": f"job-{current_user.email}-{str(time.time())}",
        "input": {
            "text": data.text,
            "user_id": current_user.email,
            "num_labels": num_labels
        }
    }

    headers = {
        "Authorization": RUNPOD_KEY,
        "accept": "application/json"
    }
    response = requests.post(f"{URL_TEST}/run", headers=headers, data=json.dumps(payload))
    return response.json()


@router.get("/status/{job_id}")
def check_status(job_id: str, current_user: UserOut = Depends(get_current_user)):
    user_email_from_job = job_id.split("-")[1]
    
    if user_email_from_job != current_user.email:
        raise HTTPException(status_code=403, detail="Acceso denegado")

    response = requests.get(f"{URL_TRAIN}/status/{job_id}", headers={"Authorization": RUNPOD_KEY})
    return response.json()
