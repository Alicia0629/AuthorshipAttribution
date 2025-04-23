import runpod
from model import train_model

def handler(job):
    data = job['input']
    file_content = data['file']
    text_col = data['text_column']
    label_col = data['label_column']
    user_id = data['user_id']

    result = train_model(file_content, text_col, label_col, user_id)
    return result

runpod.serverless.start({"handler": handler})
