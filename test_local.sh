#!/bin/bash
# Script de test local pour DetectionCancer

echo "🧪 Test local de DetectionCancer Backend avec modèle modele.py..."

# Vérifier si on est dans le bon répertoire
if [ ! -f "backend/manage.py" ]; then
    echo "❌ Erreur: Lancez ce script depuis la racine du projet DetectionCancer"
    exit 1
fi

# Vérification de l'environnement Python
echo "🐍 Vérification Python..."
python --version

# Test d'importation du modèle IA basé sur modele.py
echo "🧠 Test du nouveau modèle IA (basé sur modele.py)..."
cd backend
python -c "
import sys
sys.path.append('..')
try:
    from ml.predict import model, predict_cancer
    if model is not None:
        print('✅ Modèle IA chargé avec succès depuis modele.py')
        print(f'✅ Architecture: {len(model.layers)} couches')
        print(f'✅ Paramètres totaux: {model.count_params():,}')
        
        # Test avec une image factice
        import numpy as np
        fake_image = np.random.randint(0, 255, (100, 100, 3), dtype=np.uint8)
        from PIL import Image
        import io
        
        img = Image.fromarray(fake_image)
        img_bytes = io.BytesIO()
        img.save(img_bytes, format='PNG')
        img_bytes = img_bytes.getvalue()
        
        score = predict_cancer(img_bytes)
        print(f'✅ Test de prédiction: score = {score:.4f}')
        print('⚠️ ATTENTION: Prédictions avec poids aléatoires (modèle non entraîné)')
        
    else:
        print('❌ Modèle IA non disponible')
except ImportError as e:
    print(f'❌ Erreur d\'importation: {e}')
except Exception as e:
    print(f'❌ Erreur: {e}')
"

cd backend

echo "📦 Installation des dépendances..."
pip install -r requirements.txt

echo "🤖 Vérification du modèle IA..."
if [ ! -f "../ml/models/model_v2.keras" ]; then
    echo "⚠️  Modèle IA non trouvé, création d'un modèle factice..."
    cd ../ml
    python create_dummy_model.py
    cd ../backend
fi

echo "🗄️  Migrations..."
python manage.py makemigrations
python manage.py migrate

echo "👤 Création du superutilisateur..."
python manage.py shell -c "
from django.contrib.auth.models import User
from detection.models import UserProfile
if not User.objects.filter(username='admin').exists():
    user = User.objects.create_superuser('admin', 'admin@test.com', 'admin123!')
    UserProfile.objects.create(user=user, role='superuser')
    print('✅ Superutilisateur créé: admin/admin123!')
else:
    print('✅ Superutilisateur existe')
"

echo "🚀 Démarrage du serveur..."
echo "📍 Le serveur sera accessible à http://localhost:8000"
echo "🏥 Health check: http://localhost:8000/detection/health/"
echo "🔐 Login endpoint: http://localhost:8000/detection/login/"
echo ""
echo "Pour tester le login:"
echo "curl -X POST http://localhost:8000/detection/login/ -H \"Content-Type: application/json\" -d '{\"username\":\"admin\",\"password\":\"admin123!\"}'"
echo ""

python manage.py runserver
