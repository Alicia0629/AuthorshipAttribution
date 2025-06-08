import torch
from transformers import AutoTokenizer
import joblib
import torch.nn.functional as F

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
tokenizer = AutoTokenizer.from_pretrained("mrm8488/bert-tiny-finetuned-sms-spam-detection")

def predict_text(text, model_id):
    model = torch.load(f"/mnt/storage/{model_id}_model.pth", map_location=device, weights_only=False)
    model.to(device)


    label_mapping = None
    try:
        label_mapping = joblib.load(f"/mnt/storage/{model_id}_labels.pkl")
    except:
        pass

    inputs = tokenizer(text, padding="max_length", truncation=True, return_tensors="pt").to(device)
    with torch.no_grad():
        outputs = model(**inputs)
        logits = outputs.logits
        probs = F.softmax(logits, dim=-1).squeeze().tolist()

    pred_index = int(torch.argmax(torch.tensor(probs)))
    confidence = probs[pred_index]

    if label_mapping:
        prediction = label_mapping[pred_index]
        probabilities = {label_mapping[i]: prob for i, prob in enumerate(probs)}
    else:
        prediction = pred_index
        probabilities = probs

    return {
        "prediction": prediction,
        "confidence": confidence,
        "probabilities": probabilities
    }
