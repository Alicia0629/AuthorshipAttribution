import runpod
from model import predict_text

def handler(job):
    data = job['input']
    text = data['text']
    user_id = data['user_id']

    result = predict_text(text, user_id)
    return result

runpod.serverless.start({"handler": handler})
