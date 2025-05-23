from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey
from datetime import datetime
from app.db.base import Base


class Model(Base):
    __tablename__ = "models"
    
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    model_id = Column(String, unique=True)
    runpod_model_id = Column(String)
    status = Column(String) 
    num_labels = Column(Integer)
    eval_accuracy = Column(Float)
    eval_f1 = Column(Float)
    eval_loss = Column(Float)
    created_at = Column(DateTime, default=datetime.utcnow)
    is_active = Column(Boolean, default=True)
