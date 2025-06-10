from fastapi import FastAPI 
from fastapi.middleware.cors import CORSMiddleware
import app.api.auth as auth
import app.api.users as users
import app.api.model as model
from app.db.base import Base
from app.db.session import engine

Base.metadata.create_all(bind=engine)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],  
    allow_headers=["*"], 
)


app.include_router(users.router, prefix="/users", tags=["users"])
app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(model.router, prefix="/model", tags=["model"])
