import torch
from transformers import AutoModelForSequenceClassification, AutoTokenizer
import joblib

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
tokenizer = AutoTokenizer.from_pretrained("mrm8488/bert-tiny-finetuned-sms-spam-detection")

def predict_text(text, user_id, num_labels):
    model = torch.load(f"/runpod-volume/{user_id}_model.pth", map_location=device, weights_only=False)
    model.to(device)


    label_mapping = None
    try:
        label_mapping = joblib.load(f"/runpod-volume/{user_id}_labels.pkl")
    except:
        pass

    inputs = tokenizer(text, padding="max_length", truncation=True, return_tensors="pt").to(device)
    with torch.no_grad():
        outputs = model(**inputs)
        prediction = torch.argmax(outputs.logits, axis=-1).item()

    if label_mapping:
        prediction = label_mapping[prediction]

    return {"prediction": prediction}
