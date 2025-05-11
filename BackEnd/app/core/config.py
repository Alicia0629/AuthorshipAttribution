import os
from dotenv import load_dotenv

load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 30))
URL_TRAIN = os.getenv("URL_TRAIN")
URL_TEST = os.getenv("URL_TEST")
#AUTH_HEADER = os.getenv("AUTH_HEADER")
RUNPOD_KEY = os.getenv("RUNPOD_KEY")