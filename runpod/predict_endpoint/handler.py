import runpod
from model import predict_text

def handler(job):
    data = job['input']
    text = data['text']
    model_id = data['model_id']

    return predict_text(text, model_id)

runpod.serverless.start({"handler": handler})
