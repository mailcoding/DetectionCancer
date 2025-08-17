import tensorflow as tf
import numpy as np
import os

def create_dummy_model():
    """
    Crée un modèle CNN factice pour les tests et le déploiement
    quand le modèle réel n'est pas disponible.
    """
    model = tf.keras.Sequential([
        tf.keras.layers.Input(shape=(50, 50, 3)),
        tf.keras.layers.Conv2D(32, (3, 3), activation='relu'),
        tf.keras.layers.MaxPooling2D(2, 2),
        tf.keras.layers.Conv2D(64, (3, 3), activation='relu'),
        tf.keras.layers.MaxPooling2D(2, 2),
        tf.keras.layers.Conv2D(64, (3, 3), activation='relu'),
        tf.keras.layers.Flatten(),
        tf.keras.layers.Dense(64, activation='relu'),
        tf.keras.layers.Dense(1, activation='sigmoid')
    ])
    
    model.compile(
        optimizer='adam',
        loss='binary_crossentropy',
        metrics=['accuracy']
    )
    
    return model

def create_and_save_dummy_model():
    """
    Crée et sauvegarde un modèle factice pour les tests
    """
    # Créer le dossier models s'il n'existe pas
    models_dir = 'ml/models'
    os.makedirs(models_dir, exist_ok=True)
    
    # Créer le modèle factice
    dummy_model = create_dummy_model()
    
    # Sauvegarder le modèle
    model_path = os.path.join(models_dir, 'model_v2.keras')
    dummy_model.save(model_path)
    
    print(f"✅ Modèle factice créé et sauvegardé à {model_path}")
    print("⚠️  Note: Ce modèle ne fait que des prédictions aléatoires pour les tests.")

if __name__ == "__main__":
    create_and_save_dummy_model()
