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
    allow_origins=["http://localhost:5173"],  
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
