#!/bin/bash
# Script de déploiement pour Render.com

echo "🚀 Démarrage du déploiement DetectionCancer Backend..."

# Installation des dépendances
echo "📦 Installation des dépendances..."
pip install -r requirements.txt

# Migrations Django
echo "🗄️  Exécution des migrations..."
python manage.py makemigrations
python manage.py migrate

# Collecte des fichiers statiques
echo "📂 Collecte des fichiers statiques..."
python manage.py collectstatic --noinput

# Création des dossiers nécessaires
echo "📁 Création des dossiers pour les fichiers..."
mkdir -p media/biopsies
mkdir -p medical_images
mkdir -p ml/models

# Création du superutilisateur si nécessaire
echo "👤 Vérification du superutilisateur..."
python manage.py shell -c "
from django.contrib.auth.models import User
from detection.models import UserProfile
if not User.objects.filter(is_superuser=True).exists():
    user = User.objects.create_superuser('admin', 'admin@detectioncancer.com', 'admin123!')
    UserProfile.objects.create(user=user, role='superuser')
    print('✅ Superutilisateur créé')
else:
    print('✅ Superutilisateur existe déjà')
"

# Test de la configuration du modèle IA
echo "🧠 Test du modèle IA..."
python -c "
import sys
sys.path.append('.')
try:
    from ml.predict import model
    if model is not None:
        print('✅ Modèle IA initialisé avec succès')
    else:
        print('⚠️ Modèle IA non disponible')
except Exception as e:
    print(f'❌ Erreur modèle IA: {e}')
"

echo "✅ Déploiement terminé avec succès!"
