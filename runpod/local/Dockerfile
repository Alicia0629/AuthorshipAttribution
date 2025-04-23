FROM python:3.9-slim

WORKDIR /app
COPY .. .

RUN pip install --upgrade pip

RUN pip install transformers[torch]
RUN pip install fastapi uvicorn nest_asyncio transformers evaluate scikit-learn python-multipart pandas

EXPOSE 8000
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8000"]
