import os
import psutil
os.environ["CUDA_VISIBLE_DEVICES"] = os.getenv("TF_FORCE_CPU", "")
import tensorflow as tf
import numpy as np
from PIL import Image
import io
import os
import logging

logger = logging.getLogger(__name__)

IMAGE_SIZE = 50
CHANNELS = 3

def create_model():
    """Crée le modèle CNN pour la détection de cancer"""
    from tensorflow.keras import layers, models
    
    model = models.Sequential([
        layers.Input(shape=(IMAGE_SIZE, IMAGE_SIZE, CHANNELS)),  
        
        layers.Conv2D(32, (3, 3), activation='relu'),
        layers.MaxPooling2D((2, 2)),

        layers.Conv2D(64, (3, 3), activation='relu'),
        layers.MaxPooling2D((2, 2)),

        layers.Conv2D(128, (3, 3), activation='relu'),
        layers.MaxPooling2D((2, 2)),

        layers.Conv2D(512, (3, 3), activation='relu', padding='same'),
        layers.MaxPooling2D((2, 2)),

        layers.Flatten(),
        layers.Dense(64, activation='relu'),
        layers.Dropout(0.5),
        layers.Dense(1, activation='sigmoid')
    ])

    model.compile(
        optimizer='adam',
        loss='binary_crossentropy',
        metrics=['accuracy']
    )
    
    return model

# Chargement du modèle


# Affichage du mode utilisé (CPU ou GPU)

def print_tf_device_info():
    gpus = tf.config.list_physical_devices('GPU')
    if gpus:
        print(f"✅ TensorFlow utilise le GPU : {gpus}")
    else:
        print("⚠️ TensorFlow utilise le CPU (aucun GPU détecté)")
    # Log mémoire dispo
    process = psutil.Process(os.getpid())
    mem = process.memory_info().rss / (1024 * 1024)
    print(f"🔎 Mémoire utilisée au démarrage : {mem:.2f} Mo")

print_tf_device_info()

model = None
MODEL_PATH = 'ml/models/model_v2.keras'

def get_model():
    global model
    if model is not None:
        return model
    try:
        if os.path.exists(MODEL_PATH):
            model = tf.keras.models.load_model(MODEL_PATH)
            logger.info(f"Modèle pré-entraîné chargé depuis {MODEL_PATH}")
        else:
            model = create_model()
            logger.warning("Modèle pré-entraîné non trouvé. Utilisation d'un modèle avec poids aléatoires.")
            logger.warning("⚠️ Les prédictions ne seront pas fiables sans entraînement préalable.")
    except Exception as e:
        logger.error(f"Erreur lors du chargement du modèle: {str(e)}")
        try:
            model = create_model()
            logger.info("Modèle de base créé avec succès")
        except Exception as e2:
            logger.error(f"Impossible de créer le modèle: {str(e2)}")
            model = None
    return model

def preprocess_image(image_bytes):
    img = Image.open(io.BytesIO(image_bytes)).convert('RGB')
    img = img.resize((IMAGE_SIZE, IMAGE_SIZE))
    arr = np.array(img) / 255.0
    arr = arr.reshape(1, IMAGE_SIZE, IMAGE_SIZE, CHANNELS)
    return arr

def predict_cancer(image_bytes):
    # Log mémoire avant prédiction
    process = psutil.Process(os.getpid())
    mem = process.memory_info().rss / (1024 * 1024)
    print(f"🔎 Mémoire utilisée avant prédiction : {mem:.2f} Mo")
    mdl = get_model()
    if mdl is None:
        raise ValueError("Modèle IA non disponible. Veuillez contacter l'administrateur.")
    arr = preprocess_image(image_bytes)
    pred = mdl.predict(arr)[0][0]
    # Log mémoire après prédiction
    mem = process.memory_info().rss / (1024 * 1024)
    print(f"🔎 Mémoire utilisée après prédiction : {mem:.2f} Mo")
    return float(pred)
