import tensorflow as tf
from tensorflow.keras import layers, models

# Configuration
IMAGE_SIZE = 50 
BATCH_SIZE = 32
CHANNELS = 3

def create_cancer_detection_model():
    """
    Crée le modèle CNN pour la détection de cancer
    """
    model = models.Sequential([
        layers.Input(shape=(IMAGE_SIZE, IMAGE_SIZE, CHANNELS)),  
        
        # Première couche de convolution
        layers.Conv2D(32, (3, 3), activation='relu'),
        layers.MaxPooling2D((2, 2)),

        # Deuxième couche de convolution
        layers.Conv2D(64, (3, 3), activation='relu'),
        layers.MaxPooling2D((2, 2)),

        # Troisième couche de convolution
        layers.Conv2D(128, (3, 3), activation='relu'),
        layers.MaxPooling2D((2, 2)),

        # Quatrième couche de convolution avec padding
        layers.Conv2D(512, (3, 3), activation='relu', padding='same'),
        layers.MaxPooling2D((2, 2)),

        # Couches entièrement connectées
        layers.Flatten(),
        layers.Dense(64, activation='relu'),
        layers.Dropout(0.5),
        layers.Dense(1, activation='sigmoid')  # Sortie binaire (cancer/pas cancer)
    ])

    # Compiler le modèle
    model.compile(
        optimizer='adam',
        loss='binary_crossentropy',
        metrics=['accuracy']
    )
    
    return model

def get_dataset_partitions_tf(ds, train_split=0.8, val_split=0.1, test_split=0.1, shuffle=True, shuffle_size=10000):
    """
    Divise un dataset TensorFlow en ensembles d'entraînement, validation et test
    """
    ds = ds.cache()  
    ds = ds.prefetch(buffer_size=tf.data.AUTOTUNE)

    ds_size = 0
    for _ in ds:
        ds_size += 1

    if shuffle:
        ds = ds.shuffle(shuffle_size, seed=12)

    train_size = int(train_split * ds_size)
    val_size = int(val_split * ds_size)

    train_ds = ds.take(train_size)
    val_ds = ds.skip(train_size).take(val_size)
    test_ds = ds.skip(train_size + val_size)

    return train_ds, val_ds, test_ds

# Code d'exemple pour utilisation (commenté pour éviter l'exécution automatique)
"""
# Exemple d'utilisation complète:

# 1. Charger et préparer les données
dataset = tf.keras.preprocessing.image_dataset_from_directory(
    'path/to/data',
    image_size=(IMAGE_SIZE, IMAGE_SIZE),
    batch_size=BATCH_SIZE
)

# 2. Diviser le dataset
train_ds, val_ds, test_ds = get_dataset_partitions_tf(dataset)

# 3. Normalisation
normalization_layer = tf.keras.layers.Rescaling(1./255)
train_ds = train_ds.map(lambda x, y: (normalization_layer(x), y))
val_ds = val_ds.map(lambda x, y: (normalization_layer(x), y))
test_ds = test_ds.map(lambda x, y: (normalization_layer(x), y))

# 4. Créer et entraîner le modèle
model = create_cancer_detection_model()
history = model.fit(
    train_ds,
    validation_data=val_ds,
    epochs=30
)

# 5. Évaluer le modèle
test_loss, test_acc = model.evaluate(test_ds)
print(f"Test accuracy : {test_acc:.4f}")

# 6. Sauvegarder le modèle
model.save('model_trained.keras')
"""
