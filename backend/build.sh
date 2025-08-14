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

echo "✅ Déploiement terminé avec succès!"
