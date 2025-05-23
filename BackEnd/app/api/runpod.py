from fastapi import APIRouter, UploadFile, File, Depends, Form, HTTPException
from pydantic import BaseModel
import pandas as pd
import base64, json, requests, time, tempfile, os
from sqlalchemy.orm import Session
from app.core.config import URL_TRAIN, URL_TEST, RUNPOD_KEY
import app.core.auth as auth
import app.schemas.user as schemasUser
from app.db.session import get_db
import app.crud.model as crud
import app.schemas.model as schemasModel

router = APIRouter()

class TrainRequest(BaseModel):
    text_column: str
    label_column: str
    num_labels: int
    file: str

@router.post("/train")
def train_model(
    request: TrainRequest,
    db: Session = Depends(get_db),
    current_user: schemasUser.UserOut = Depends(auth.get_current_user)):
    email = current_user.email

    job_id = f"job-{email}-{str(time.time())}"

    payload = {
        "id": job_id,
        "input": {
            "file": request.file,
            "text_column": request.text_column,
            "label_column": request.label_column,
            "user_id": email
        }
    }

    headers = {
    "Authorization": RUNPOD_KEY,
    "accept": "application/json"
    }

    response = requests.post(f"{URL_TRAIN}/run", headers=headers, data=json.dumps(payload))
    response = response.json()
    runpod_model_id = response["id"]

    if 'error' in response:
        return response

    model = crud.create_model(db=db, model=schemasModel.ModelCreate(runpod_model_id=runpod_model_id, user_id=current_user.id, status="training", num_labels=request.num_labels))
    
    return {"job_id": job_id, "model_id":model.id, "response": response}



@router.post("/predict")
def predict_endpoint(
    num_labels: int,
    text: str,
    model_id: str,
    current_user: schemasUser.UserOut = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
    ):
    email = current_user.email

    model = crud.get_model_by_id(db, model_id=model_id)
    if not model:
        raise HTTPException(status_code=404, detail="Model not found")
    if not model or model.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")
    
    payload = {
        "id": f"job-{email}-{str(time.time())}",
        "input": {
            "text": text,
            "user_id": email,
            "num_labels": num_labels
        }
    }

    headers = {
        "Authorization": RUNPOD_KEY,
        "accept": "application/json"
    }

    runpod_model_id = response.json().get('job_id')
    if not crud.update_id_runpod_model(db=db, model_id=model_id, runpod_model_id=runpod_model_id):
        raise HTTPException(status_code=403, detail="No hay un modelo con ese id")


    response = requests.post(f"{URL_TEST}/run", headers=headers, data=json.dumps(payload))
    return response.json()


@router.get("/status/{model_id}")
def check_status(
    model_id: int,
    db: Session = Depends(get_db),
    current_user: schemasUser.UserOut = Depends(auth.get_current_user)
):
    model = crud.get_model_by_id(db, model_id=model_id)
    if not model:
        raise HTTPException(status_code=404, detail="Model not found")
    if not model or model.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")

    url = URL_TRAIN if model.status == "training" else URL_TEST

    response = requests.get(f"{url}/status/{model.runpod_model_id}", headers={"Authorization": RUNPOD_KEY})
    res_json = response.json()

    if res_json.get("status") == "COMPLETED" and model.status == "training":
        eval_data = res_json.get("output", {}).get("evaluate", {})
        update_data = schemasModel.ModelUpdateStatus(
            model_id=int(model.id),
            status="trained",
            eval_accuracy=eval_data.get("eval_accuracy"),
            eval_f1=eval_data.get("eval_f1"),
            eval_loss=eval_data.get("eval_loss"),
        )
        crud.update_model_status(db=db, data=update_data)


    return res_json
