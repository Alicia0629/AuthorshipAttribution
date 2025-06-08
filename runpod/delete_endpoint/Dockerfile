FROM python:3.10-slim

WORKDIR /app

COPY .  /app

RUN apt-get update && apt-get install -y git

CMD ["python", "handler.py"]
