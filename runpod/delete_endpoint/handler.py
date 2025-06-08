import runpod
import os

def handler(job):
    data = job['input']
    user_id = data['user_id']
    try:
        os.remove(f"/mnt/storage/{user_id}_labels.pkl")
        os.remove(f"/mnt/storage/{user_id}_model.pth")
    except FileNotFoundError:
        pass


runpod.serverless.start({"handler": handler})
