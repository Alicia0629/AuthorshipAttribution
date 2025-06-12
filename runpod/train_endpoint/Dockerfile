FROM python:3.10-slim

WORKDIR /app

COPY runpod/train_endpoint/ /app

RUN apt-get update && apt-get install -y git \
    && apt-get clean && rm -rf /var/lib/apt/lists/* \
    && pip install --upgrade pip \
    && pip install --no-cache-dir -r requirements.txt

CMD ["python", "handler.py"]
