import tensorflow as tf
from tensorflow.keras import layers, models
import matplotlib.pyplot as plt
import numpy as np



IMAGE_SIZE = 50 
BATCH_SIZE = 32
CHANNELS = 3
EPOCHS = 30
def get_dataset_partitions_tf(ds, train_split=0.8, val_split=0.1, test_split=0.1, shuffle=True, shuffle_size=10000):
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

train_ds, val_ds, test_ds = get_dataset_partitions_tf(dataset)
print("Train batches :", len(train_ds))
print("Val batches   :", len(val_ds))
print("Test batches  :", len(test_ds))
def count_elements(ds):
    return sum([len(batch[0]) for batch in ds])

print(f"🧮 Total images entraînement : {count_elements(train_ds)}")
print(f"🧮 Total images validation   : {count_elements(val_ds)}")
print(f"🧮 Total images test         : {count_elements(test_ds)}")


normalization_layer = tf.keras.layers.Rescaling(1./255)

train_ds = train_ds.map(lambda x, y: (normalization_layer(x), y))
val_ds = val_ds.map(lambda x, y: (normalization_layer(x), y))
test_ds = test_ds.map(lambda x, y: (normalization_layer(x), y))

from tensorflow.keras import layers, models

model = models.Sequential([
    layers.Input(shape=(50, 50, 3)),  
    
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
model.summary()

history = model.fit(
    train_ds,
    validation_data=val_ds,
    epochs=EPOCHS
)

test_loss, test_acc = model.evaluate(test_ds)
print(f"✅ Test accuracy : {test_acc:.4f}")
acc = history.history['accuracy']
val_acc = history.history['val_accuracy']
loss = history.history['loss']
val_loss = history.history['val_loss']
epochs_range = range(len(acc))  

plt.figure(figsize=(7, 5))
plt.plot(epochs_range, acc, label="Accuracy (Entraînement)", color="blue")
plt.plot(epochs_range, loss, label="Loss (Entraînement)", color="green")
plt.title("Précision & Perte sur l'entraînement")
plt.xlabel("Époques")
plt.ylabel("Valeurs")
plt.legend()
plt.grid(True)
plt.show()

plt.figure(figsize=(7, 5))
plt.plot(epochs_range, val_acc, label="Accuracy (Validation)", color="orange")
plt.plot(epochs_range, val_loss, label="Loss (Validation)", color="red")
plt.title("Précision & Perte sur la validation")
plt.xlabel("Époques")
plt.ylabel("Valeurs")
plt.legend()
plt.grid(True)
plt.show()

from sklearn.metrics import classification_report

y_true = []
y_pred = []

for images, labels in test_ds:
    preds = model.predict(images)
    preds = (preds > 0.5).astype("int32").flatten()
    
    y_true.extend(labels.numpy())
    y_pred.extend(preds)

print(classification_report(y_true, y_pred, target_names=['Non Cancéreux', 'Cancéreux']))

from sklearn.metrics import confusion_matrix, ConfusionMatrixDisplay, classification_report
import numpy as np
import matplotlib.pyplot as plt
y_true = []
y_pred = []

for images, labels in test_ds:
    preds = model.predict(images, verbose=0)
    preds = (preds > 0.5).astype("int32").flatten()

    y_true.extend(labels.numpy())
    y_pred.extend(preds)

cm = confusion_matrix(y_true, y_pred)
disp = ConfusionMatrixDisplay(confusion_matrix=cm, display_labels=["Cancéreux", "Non Cancéreux"])

plt.figure(figsize=(6, 6))
disp.plot(cmap=plt.cm.Blues)
plt.title("Matrice de confusion")
plt.grid(False)
plt.show()

print(classification_report(y_true, y_pred, target_names=["Cancéreux", "Non Cancéreux"]))

# Sauvegarde du modèle
model_version = 1
model.save(f"monmodel_v{model_version}.keras")
model.save(r'model_v2.keras')
