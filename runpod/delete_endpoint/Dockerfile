FROM python:3.10-slim

WORKDIR /app

COPY runpod/delete_endpoint/ /app

RUN apt-get update && apt-get install -y git

CMD ["python", "handler.py"]
