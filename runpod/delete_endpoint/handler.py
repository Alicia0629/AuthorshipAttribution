import runpod
import os

def handler(job):
    data = job['input']
    model_id = data['model_id']
    try:
        os.remove(f"/runpod-volume/{model_id}_labels.pkl")
        os.remove(f"/runpod-volume/{model_id}_model.pth")
        return "sucess"
    except FileNotFoundError:
        return "error"


runpod.serverless.start({"handler": handler})
