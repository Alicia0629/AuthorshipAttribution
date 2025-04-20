import nest_asyncio
from fastapi import FastAPI, File, UploadFile, Form
from pydantic import BaseModel
import torch
from transformers import AutoModelForSequenceClassification, AutoTokenizer, TrainingArguments, Trainer
import evaluate
from datasets import load_dataset, Dataset
import time
import pandas as pd
import numpy as np

nest_asyncio.apply()

app = FastAPI()

#model_name = "distilbert-base-uncased"
model_name = "mrm8488/bert-tiny-finetuned-sms-spam-detection"
model = AutoModelForSequenceClassification.from_pretrained(model_name)
tokenizer = AutoTokenizer.from_pretrained(model_name)
metric_accuracy = evaluate.load("accuracy")
metric_f1 = evaluate.load("f1")
label_mapping = None
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

class PredictRequest(BaseModel):
    text: str

def compute_metrics(eval_pred):
    logits, labels = eval_pred
    predictions = logits.argmax(axis=-1)
    acc = metric_accuracy.compute(predictions=predictions, references=labels)
    f1 = metric_f1.compute(predictions=predictions, references=labels, average="macro")
    return {"accuracy": acc["accuracy"], "f1": f1["f1"]}

def total_time(time):
    message = ""
    if time > 3600:
        message += " "+str(time//3600)+"h"
        time %= 3600
    if time > 60:
        message += " "+str(time//60)+"m"
        time %=60
    message += " "+str(int(time*100)/100)+"s"
    return message

@app.post("/predict/")
async def predict(request: PredictRequest):
    start_time = time.time()

    global model, label_mapping
    model.to(device)
    inputs = tokenizer(request.text, padding="max_length", truncation=True, return_tensors="pt").to(device)
    with torch.no_grad():
        outputs = model(**inputs)
        prediction = torch.argmax(outputs.logits, axis=-1).item()
        print(label_mapping)
        if not label_mapping is None:
            prediction = label_mapping[prediction]

    end_time = time.time()
    return {"prediction": prediction, "time":total_time(end_time-start_time)}

@app.post("/train/")
async def train(
    file: UploadFile = File(...),
    text_column: str = Form(...),
    label_column: str = Form(...)
    ):

    start_time = time.time()

    global model, label_mapping
    df = pd.read_csv(file.file)

    if text_column not in df.columns or label_column not in df.columns:
        return {"error": f"Columns not found. CSV should have '{text_column}' y '{label_column}'."}

    df = df[[text_column, label_column]]
    df.columns = ["text", "label"]

    if df["label"].dtype == "object":
        label_mapping = dict(enumerate(pd.Categorical(df["label"]).categories))
        #label_mapping = {v: k for k, v in label_mapping.items()}
        df["label"] = pd.Categorical(df["label"]).codes
        print(label_mapping)

    print("Valores únicos de etiquetas:", df["label"].unique())
    num_labels = df["label"].nunique()
    print("Número de clases:", num_labels)
    model = AutoModelForSequenceClassification.from_pretrained(model_name, num_labels=num_labels, ignore_mismatched_sizes=True)
    model.to(device)

    dataset = Dataset.from_pandas(df)
    dataset = dataset.train_test_split(test_size=0.2)
    train_data = dataset["train"]
    test_data = dataset["test"]
    epoch = 3

    if model_name=="mrm8488/bert-tiny-finetuned-sms-spam-detection":
        epoch = 10
        lengths = [len(tokenizer(example["text"])["input_ids"]) for example in train_data]
        max_length = int(np.percentile(lengths, 95))
        if max_length>512:
            max_length=512
        train_data = train_data.map(lambda row: tokenizer(row['text'], padding="max_length", truncation=True, max_length=max_length), batched=True)
        test_data = test_data.map(lambda row: tokenizer(row['text'], padding="max_length", truncation=True, max_length=max_length), batched=True)
    else:
        train_data = train_data.map(lambda row: tokenizer(row['text'], padding="max_length", truncation=True), batched=True)
        test_data = test_data.map(lambda row: tokenizer(row['text'], padding="max_length", truncation=True), batched=True)

    training_args = TrainingArguments(
        output_dir="./results",
        num_train_epochs=epoch,
        per_device_train_batch_size=16,
        per_device_eval_batch_size=16,
        warmup_steps=500,
        weight_decay=0.01,
        logging_dir='./logs',
        logging_steps=10,
    )

    trainer = Trainer(
        model=model,
        args=training_args,
        train_dataset=train_data,
        eval_dataset=test_data,
        compute_metrics=compute_metrics,
    )

    trainer.train()
    results = trainer.evaluate()
    end_time = time.time()
    return {"results": results, "time":total_time(end_time-start_time)}
