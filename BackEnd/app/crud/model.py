from sqlalchemy.orm import Session
from app.models.model import Model
from app.schemas.model import ModelCreate, ModelUpdateStatus

def create_model(db: Session, model: ModelCreate):
    db_model = Model(
        user_id=model.user_id,
        runpod_model_id=model.runpod_model_id,
        status=model.status,
        num_labels=model.num_labels
    )
    db.add(db_model)
    db.commit()
    db.refresh(db_model)
    return db_model

def get_model_by_id(db: Session, model_id: str):
    return db.query(Model).filter(Model.id == model_id).first()


def update_model_status(db: Session, data: ModelUpdateStatus):
    db_model = db.query(Model).filter(Model.id == data.model_id).first()
    if not db_model:
        return None

    db_model.status = data.status
    db_model.eval_accuracy = data.eval_accuracy
    db_model.eval_f1 = data.eval_f1
    db_model.eval_loss = data.eval_loss

    db.commit()
    db.refresh(db_model)
    return db_model

def delete_model(db: Session, model_id: str):
    db_model = db.query(Model).filter(Model.id == model_id).first()
    if db_model:
        db.delete(db_model)
        db.commit()
        return True
    return False

def update_id_runpod_model(db: Session, model_id: int, new_runpod_model_id: str):
    db_model = db.query(Model).filter(Model.id == model_id).first()
    if db_model:
        db_model.runpod_model_id = new_runpod_model_id
        db.commit()
        db.refresh(db_model)
        return True
    
    return False

def get_latest_model_by_user(db: Session, user_id: int):
    return db.query(Model).filter(Model.user_id == user_id).order_by(Model.created_at.desc()).first()
