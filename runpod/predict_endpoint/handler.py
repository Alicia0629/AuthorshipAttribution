import runpod
from model import predict_text

def handler(job):
    data = job['input']
    text = data['text']
    user_id = data['user_id']
    num_labels = data['num_labels']

    return predict_text(text, user_id, num_labels)

runpod.serverless.start({"handler": handler})
