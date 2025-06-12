from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
import json, requests, time
from sqlalchemy.orm import Session
from app.core.config import URL_TRAIN, URL_PREDICT, URL_DELETE, RUNPOD_KEY
import app.core.auth as auth
import app.schemas.user as schemasUser
from app.db.session import get_db
import app.crud.model as crud
import app.schemas.model as schemasModel

router = APIRouter()


HEADERS = {
    "Authorization": RUNPOD_KEY,
    "accept": "application/json"
}

def check_model(current_user, model):
    if not model:
        raise HTTPException(status_code=404, detail="Model not found")
    if model.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")


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

    # Crear el modelo en la base de datos inicialmente con un estado "pending"
    model = crud.create_model(
        db=db,
        model=schemasModel.ModelCreate(
            runpod_model_id="",  # Inicialmente vacío
            user_id=current_user.id,
            status="pending",
            num_labels=request.num_labels
        )
    )

    # Usar el model.id generado por la base de datos como model_id
    model_id = model.id

    job_id = f"job-{email}-{model_id}-{str(time.time())}"

    payload = {
        "id": job_id,
        "input": {
            "file": request.file,
            "text_column": request.text_column,
            "label_column": request.label_column,
            "model_id": model_id
        }
    }

    response = requests.post(f"{URL_TRAIN}/run", headers=HEADERS, data=json.dumps(payload))
    response = response.json()

    # Actualizar el modelo con el runpod_model_id y cambiar el estado a "training"
    runpod_model_id = response["id"]
    crud.update_model_status(
        db=db,
        data=schemasModel.ModelUpdateStatus(
            model_id=model_id,
            status="training"
        )
    )
    crud.update_id_runpod_model(db=db, model_id=model_id, new_runpod_model_id=runpod_model_id)

    return {"job_id": job_id, "model_id": model_id, "response": response}



class PredictRequest(BaseModel):
    text: str
    model_id: str

@router.post("/predict")
def predict_endpoint(
    request: PredictRequest,
    current_user: schemasUser.UserOut = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
    ):
    
    email = current_user.email

    model = crud.get_model_by_id(db, model_id=request.model_id)
    check_model(current_user, model)
    
    payload = {
        "id": f"job-{email}-{request.model_id}-{str(time.time())}",
        "input": {
            "text": request.text,
            "model_id": request.model_id,
        }
    }

    response = requests.post(f"{URL_PREDICT}/run", headers=HEADERS, data=json.dumps(payload))
    
    response_json = json.loads(response.text)

    runpod_model_id = response_json["id"]
    crud.update_id_runpod_model(db=db, model_id=request.model_id, new_runpod_model_id=runpod_model_id)

    return response.json()


class DeleteRequest(BaseModel):
    model_id: str

@router.post("/delete")
def delete_model(
    request: DeleteRequest,
    current_user: schemasUser.UserOut = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    email = current_user.email
    model = crud.get_model_by_id(db, model_id=request.model_id)
    check_model(current_user, model)
    
    payload = {
        "id": f"job-{email}-{request.model_id}-{str(time.time())}",
        "input": {
            "model_id": request.model_id,
        }
    }

    response = requests.post(f"{URL_DELETE}/run", headers=HEADERS, data=json.dumps(payload))

    return response.json()



@router.get("/status/{model_id}")
def check_status(
    model_id: str,
    db: Session = Depends(get_db),
    current_user: schemasUser.UserOut = Depends(auth.get_current_user)
):
    model = crud.get_model_by_id(db, model_id=model_id)
    check_model(current_user, model)

    url = URL_TRAIN if model.status == "training" else URL_PREDICT

    response = requests.get(f"{url}/status/{model.runpod_model_id}", headers={"Authorization": RUNPOD_KEY})
    res_json = response.json()
    # Check for FileNotFoundError in the error response
    error_json = res_json.get("error")
    if error_json:
        try:
            error_data = json.loads(error_json)
            if error_data.get("error_type") == "<class 'FileNotFoundError'>":
                if not crud.delete_model(db, model_id=model_id):
                    raise HTTPException(status_code=500, detail="Error al eliminar el modelo de la base de datos")
                return {"status": "deleted"}
        except Exception:
            pass


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


@router.get("/latest-model")
def get_latest_model(
    db: Session = Depends(get_db),
    current_user: schemasUser.UserOut = Depends(auth.get_current_user)
):
    model = crud.get_latest_model_by_user(db, user_id=current_user.id)
    if not model:
        return {"status": "no_model"}

    return {
        "model_id": model.id,
        "status": model.status
    }


@router.get("/{model_id}")
def get_model_details(
    model_id: str,
    db: Session = Depends(get_db),
    current_user: schemasUser.UserOut = Depends(auth.get_current_user)
):
    model = crud.get_model_by_id(db, model_id=model_id)
    check_model(current_user, model)

    return {
        "eval_accuracy": model.eval_accuracy,
        "eval_f1": model.eval_f1,
        "eval_loss": model.eval_loss,
        "num_labels": model.num_labels,
        "created_at": model.created_at,
    }
