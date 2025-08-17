#!/bin/bash

# Script de déploiement avec correction CORS
echo "🚀 Déploiement DetectionCancer avec correction CORS"

# Variables d'environnement pour Render
export CORS_ALLOW_ALL_ORIGINS=True  # Mode debug temporaire
export CORS_ALLOWED_ORIGINS="https://detectioncancerfront.onrender.com,http://localhost:3000"
export ALLOWED_HOSTS="detectioncancer-backend.onrender.com,.onrender.com,localhost,127.0.0.1"

# Installation des dépendances
echo "📦 Installation des dépendances..."
pip install -r requirements.txt

# Migrations Django
echo "🗃️ Application des migrations..."
python manage.py migrate --noinput

# Collecte des fichiers statiques
echo "📁 Collecte des fichiers statiques..."
python manage.py collectstatic --noinput

# Test de la configuration CORS
echo "🔍 Test de la configuration CORS..."
python manage.py shell -c "
from django.conf import settings
print(f'CORS_ALLOW_ALL_ORIGINS: {settings.CORS_ALLOW_ALL_ORIGINS}')
print(f'CORS_ALLOWED_ORIGINS: {settings.CORS_ALLOWED_ORIGINS}')
print(f'ALLOWED_HOSTS: {settings.ALLOWED_HOSTS}')
"

# Démarrage du serveur
echo "✅ Démarrage du serveur..."
python manage.py runserver 0.0.0.0:$PORT
