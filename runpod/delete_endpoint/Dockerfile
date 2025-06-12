FROM python:3.10-slim

WORKDIR /app

COPY runpod/delete_endpoint/ /app

RUN apt-get update && apt-get install -y git \
    && apt-get clean && rm -rf /var/lib/apt/lists/* \
    && pip install --upgrade pip \
    && pip install --no-cache-dir -r requirements.txt

CMD ["python", "handler.py"]
