from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
import models, schemas, crud, auth, database
from database import engine, Base

Base.metadata.create_all(bind=engine)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],  
    allow_headers=["*"], 
)


@app.post("/register", response_model=schemas.UserOut)
def register(user: schemas.UserCreate, db: Session = Depends(database.get_db)):
    if crud.get_user_by_email(db, user.email):
        raise HTTPException(status_code=400, detail="Usuario ya registrado")
    return crud.create_user(db, user)

@app.post("/login", response_model=schemas.Token)
def login(data: schemas.LoginData, db: Session = Depends(database.get_db)):
    user = crud.get_user_by_email(db, data.email)
    if not user or not auth.verify_password(data.password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Credenciales incorrectas")
    token = auth.create_access_token({"sub": user.email})
    return {"access_token": token, "token_type": "bearer"}

@app.get("/me", response_model=schemas.UserOut)
def read_users_me(current_user: schemas.UserOut =Depends(auth.get_current_user)):
    return current_user

@app.delete("/delete-account", status_code=204)
def delete_account(current_user: schemas.UserOut = Depends(auth.get_current_user), db: Session = Depends(database.get_db)):
    db_user = crud.get_user_by_email(db, current_user.email)
    if not db_user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    crud.delete_user(db, db_user)
    return
