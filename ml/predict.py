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

import tensorflow as tf
import numpy as np
from PIL import Image
import io
import os

# Priorité des modèles à charger (du plus fiable au moins fiable)
# Chemins relatifs depuis la racine du projet
import os
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

MODEL_PATHS = [
    os.path.join(BASE_DIR, 'ml/models/model_trained.keras'),      # Modèle entraîné (le plus fiable)
    os.path.join(BASE_DIR, 'ml/models/model_v2.keras'),           # Modèle pré-entraîné
    os.path.join(BASE_DIR, 'ml/models/modele.py')                 # Architecture seulement (poids aléatoires)
]

MODEL_STATUS = {
    'status': 'not_loaded',
    'type': 'unknown',
    'path': None,
    'warning': None
}

def load_best_available_model():
    """
    Charge le meilleur modèle disponible selon l'ordre de priorité
    """
    global MODEL_STATUS
    
    for model_path in MODEL_PATHS:
        try:
            if model_path.endswith('.keras') and os.path.exists(model_path):
                # Modèle Keras sauvegardé
                model = tf.keras.models.load_model(model_path)
                
                # Déterminer le type de modèle
                if 'trained' in model_path:
                    MODEL_STATUS = {
                        'status': 'trained_loaded',
                        'type': 'trained',
                        'path': model_path,
                        'warning': None
                    }
                    print(f"✅ Modèle ENTRAÎNÉ chargé depuis {model_path}")
                else:
                    MODEL_STATUS = {
                        'status': 'pretrained_loaded', 
                        'type': 'pretrained',
                        'path': model_path,
                        'warning': 'Modèle pré-entraîné - vérifier la compatibilité avec vos données'
                    }
                    print(f"✅ Modèle PRÉ-ENTRAÎNÉ chargé depuis {model_path}")
                    
                return model
                
            elif model_path.endswith('.py'):
                # Architecture Python seulement
                import sys
                sys.path.append(os.path.join(BASE_DIR, 'ml', 'models'))
                from modele import create_cancer_detection_model
                model = create_cancer_detection_model()
                
                MODEL_STATUS = {
                    'status': 'architecture_loaded',
                    'type': 'random_weights',
                    'path': model_path,
                    'warning': 'Modèle non entraîné - prédictions non fiables'
                }
                print("⚠️ Modèle pré-entraîné non trouvé. Utilisation d'un modèle avec poids aléatoires.")
                print("⚠️ Les prédictions ne seront pas fiables sans entraînement préalable.")
                return model
                
        except Exception as e:
            print(f"❌ Impossible de charger {model_path}: {e}")
            continue
    
    MODEL_STATUS = {
        'status': 'failed',
        'type': 'none',
        'path': None,
        'warning': 'Aucun modèle disponible'
    }
    raise Exception("Aucun modèle n'a pu être chargé")

# Charger le modèle au démarrage
try:
    model = load_best_available_model()
    print(f"✅ Modèle IA chargé avec succès")
    print(f"✅ Architecture: {len(model.layers)} couches")
    print(f"✅ Paramètres: {model.count_params():,}")
    if MODEL_STATUS['warning']:
        print(f"⚠️ {MODEL_STATUS['warning']}")
except Exception as e:
    print(f"❌ ERREUR: Impossible de charger le modèle IA: {e}")
    model = None

def get_model_status():
    """
    Retourne le statut actuel du modèle
    """
    if model is None:
        return {
            'status': 'failed',
            'type': 'none',
            'layers': 0,
            'parameters': 0,
            'warning': 'Aucun modèle chargé'
        }
    
    return {
        'status': MODEL_STATUS['status'],
        'type': MODEL_STATUS['type'],
        'layers': len(model.layers),
        'parameters': model.count_params(),
        'warning': MODEL_STATUS['warning']
    }

def preprocess_image(image_bytes):
    """
    Préprocesse une image pour la prédiction
    """
    try:
        img = Image.open(io.BytesIO(image_bytes)).convert('RGB')
        img = img.resize((50, 50))  # IMAGE_SIZE
        img_array = np.array(img) / 255.0
        img_array = img_array.reshape(1, 50, 50, 3)  # CHANNELS
        return img_array
    except Exception as e:
        raise ValueError(f"Erreur lors du préprocessing de l'image: {e}")

def predict_cancer(image_bytes):
    """
    Effectue une prédiction de cancer sur une image
    """
    if model is None:
        raise Exception("Modèle IA non disponible")
    
    try:
        processed_image = preprocess_image(image_bytes)
        prediction = model.predict(processed_image, verbose=0)
        return float(prediction[0][0])
    except Exception as e:
        raise Exception(f"Erreur lors de la prédiction: {e}")
