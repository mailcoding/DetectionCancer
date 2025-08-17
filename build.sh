# Render Build Script
# Ce script sera exécuté lors du déploiement sur Render

#!/bin/bash
set -e

echo "🚀 Build DetectionCancer Backend avec CORS"
echo "==========================================="

# Installation des dépendances
echo "📦 Installation des dépendances..."
pip install -r backend/requirements.txt

# Vérification de la configuration CORS
echo "🔧 Configuration CORS:"
echo "CORS_ALLOW_ALL_ORIGINS=$CORS_ALLOW_ALL_ORIGINS"
echo "CORS_ALLOWED_ORIGINS=$CORS_ALLOWED_ORIGINS"
echo "ALLOWED_HOSTS=$ALLOWED_HOSTS"

# Migrations de base de données
echo "🗃️ Application des migrations..."
cd backend
python manage.py migrate --noinput

# Collection des fichiers statiques
echo "📁 Collection des fichiers statiques..."
python manage.py collectstatic --noinput

# Test rapide de la configuration
echo "🔍 Test de la configuration..."
python manage.py check --deploy

echo "✅ Build terminé avec succès!"
