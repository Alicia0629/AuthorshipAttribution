import runpod
import os

def handler(job):
    data = job['input']
    user_id = data['user_id']
    try:
        os.remove(f"/runpod-volume/{user_id}_labels.pkl")
        os.remove(f"/runpod-volume/{user_id}_model.pth")
        return "sucess"
    except FileNotFoundError:
        return "error"


runpod.serverless.start({"handler": handler})
