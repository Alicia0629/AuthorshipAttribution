FROM python:3.10-slim

WORKDIR /app

COPY runpod/test_endpoint/ /app

RUN apt-get update && apt-get install -y git
RUN pip install --upgrade pip
RUN pip install -r requirements.txt

CMD [ "python", "-u", "handler.py" ]
