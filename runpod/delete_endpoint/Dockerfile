FROM python:3.10-slim

WORKDIR /app

COPY runpod/delete_endpoint/ /app

RUN apt-get update && apt-get install -y git
RUN pip install --upgrade pip
RUN pip install -r requirements.txt

CMD ["python", "handler.py"]
