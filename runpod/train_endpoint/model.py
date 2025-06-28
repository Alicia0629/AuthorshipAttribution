import torch
import pandas as pd
import numpy as np
from transformers import AutoModelForSequenceClassification, AutoTokenizer, TrainingArguments, Trainer, EarlyStoppingCallback
from datasets import Dataset
import evaluate
import io
import joblib
import base64

tokenizer = AutoTokenizer.from_pretrained("distilbert-base-uncased")
metric_accuracy = evaluate.load("accuracy")
metric_f1 = evaluate.load("f1")

def compute_metrics(eval_pred):
    logits, labels = eval_pred
    predictions = logits.argmax(axis=-1)
    acc = metric_accuracy.compute(predictions=predictions, references=labels)
    f1 = metric_f1.compute(predictions=predictions, references=labels, average="macro")
    return {"accuracy": acc["accuracy"], "f1": f1["f1"]}

def train_model(file_content, text_column, label_column, model_id):
    file_decoded = base64.b64decode(file_content)
    df = pd.read_csv(io.BytesIO(file_decoded))
    df = df[[text_column, label_column]]
    df.columns = ["text", "label"]

    label_mapping = dict(enumerate(pd.Categorical(df["label"]).categories))
    df["label"] = pd.Categorical(df["label"]).codes
    joblib.dump(label_mapping, f"/runpod-volume/{model_id}_labels.pkl")

    num_labels = df["label"].nunique()
    model = AutoModelForSequenceClassification.from_pretrained(
        "distilbert-base-uncased",
        num_labels=num_labels,
        ignore_mismatched_sizes=True
    )

    dataset = Dataset.from_pandas(df).train_test_split(test_size=0.2)
    train_data = dataset["train"]
    test_data = dataset["test"]

    epoch = 30
    lengths = [len(tokenizer(example["text"])["input_ids"]) for example in train_data]
    max_length = min(int(np.percentile(lengths, 95)), 512)
    train_data = train_data.map(lambda row: tokenizer(row['text'], padding="max_length", truncation=True, max_length=max_length), batched=True)
    test_data = test_data.map(lambda row: tokenizer(row['text'], padding="max_length", truncation=True, max_length=max_length), batched=True)

    training_args = TrainingArguments(
        output_dir="./results",
        num_train_epochs=epoch,
        per_device_train_batch_size=16,
        per_device_eval_batch_size=16,
        eval_strategy="epoch",
        save_strategy="epoch",
        load_best_model_at_end=True,
        metric_for_best_model="eval_f1",
        greater_is_better=True,
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
        callbacks=[EarlyStoppingCallback(early_stopping_patience=2)]
    )

    trainer.train()
    torch.save(model, f"/runpod-volume/{model_id}_model.pth")
    return {"evaluate":trainer.evaluate(), "num_labels": num_labels}
