import torch
from transformers import AutoTokenizer
import joblib
import torch.nn.functional as F

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
tokenizer = AutoTokenizer.from_pretrained("distilbert-base-uncased")

def predict_text(text, model_id):
    model = torch.load(f"/runpod-volume/{model_id}_model.pth", map_location=device, weights_only=False)
    model.to(device)

    label_mapping = None
    try:
        label_mapping = joblib.load(f"/runpod-volume/{model_id}_labels.pkl")
    except FileNotFoundError:
        print(f"Label mapping file not found for model ID: {model_id}")
    except joblib.externals.loky.process_executor.TerminatedWorkerError as e:
        print(f"Error loading label mapping: {e}")
    except Exception as e:
        print(f"Unexpected error: {e}")

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
