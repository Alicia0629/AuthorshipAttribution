from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

import app.crud.user as crud
import app.schemas.user as schemas
from app.db.session import get_db
import app.core.auth as auth

router = APIRouter()

@router.post("/register", response_model=schemas.UserOut)
def register(user: schemas.UserCreate, db: Session = Depends(get_db)):
    if crud.get_user_by_email(db, user.email):
        raise HTTPException(status_code=400, detail="Usuario ya registrado")
    return crud.create_user(db, user)

@router.get("/me", response_model=schemas.UserOut)
def read_users_me(current_user: schemas.UserOut = Depends(auth.get_current_user)):
    return current_user

@router.delete("/delete-account", status_code=204)
def delete_account(current_user: schemas.UserOut = Depends(auth.get_current_user), db: Session = Depends(get_db)):
    crud.delete_user(db, current_user)
    return {"sucess": True}
