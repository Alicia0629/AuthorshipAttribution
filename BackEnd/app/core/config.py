import os
from dotenv import load_dotenv

load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 30))
URL_TRAIN = os.getenv("URL_TRAIN")
URL_PREDICT = os.getenv("URL_PREDICT")
URL_DELETE = os.getenv("URL_DELETE")
RUNPOD_KEY = os.getenv("RUNPOD_KEY")
DB_URL = os.getenv("DB_URL", "sqlite:///./test.db")
