import runpod
from model import train_model

def handler(job):
    data = job['input']
    file_content = data['file']
    text_col = data['text_column']
    label_col = data['label_column']
    model_id = data['model_id']

    return train_model(file_content, text_col, label_col, model_id)

runpod.serverless.start({"handler": handler})
