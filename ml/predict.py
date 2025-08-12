import tensorflow as tf
import numpy as np
from PIL import Image
import io

MODEL_PATH = 'ml/models/model_v2.keras'
model = tf.keras.models.load_model(MODEL_PATH)

IMAGE_SIZE = 50
CHANNELS = 3

def preprocess_image(image_bytes):
    img = Image.open(io.BytesIO(image_bytes)).convert('RGB')
    img = img.resize((IMAGE_SIZE, IMAGE_SIZE))
    arr = np.array(img) / 255.0
    arr = arr.reshape(1, IMAGE_SIZE, IMAGE_SIZE, CHANNELS)
    return arr

def predict_cancer(image_bytes):
    arr = preprocess_image(image_bytes)
    pred = model.predict(arr)[0][0]
    return float(pred)
