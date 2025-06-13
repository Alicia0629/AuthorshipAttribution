from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import app.crud.user as crud
import app.schemas.auth as schemas
import app.core.auth as auth
from app.db.session import get_db

router = APIRouter()

@router.post("/login", response_model=schemas.Token)
def login(data: schemas.LoginData, db: Session = Depends(get_db)):
    user = crud.get_user_by_email(db, data.email)
    if not user or not auth.verify_password(data.password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Credenciales incorrectas")
    token = auth.create_access_token({"sub": user.email})
    return {"access_token": token, "token_type": "bearer"}
