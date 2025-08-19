#!/bin/bash
# Script d'automatisation du déploiement complet (backend + frontend)

set -e

# 1. Installation des dépendances Python (backend)
echo "🛠️ Installation des dépendances backend..."
pip install -r backend/requirements.txt

# 2. Build backend (optionnel si build.sh existe)
if [ -f backend/build.sh ]; then
    echo "🧹 Build backend..."
    bash backend/build.sh
fi

# 3. Installation des dépendances Node.js (frontend)
if [ -f frontend/package.json ]; then
    echo "🛠️ Installation des dépendances frontend..."
    cd frontend
    npm install --legacy-peer-deps
    npm run build
    cd ..
fi

# 4. Lancement du backend avec Gunicorn (1 worker)
echo "🚀 Lancement du backend avec Gunicorn (1 worker)..."
gunicorn --chdir backend core.wsgi:application --workers 1

# 5. (Optionnel) Lancement du serveur frontend (si besoin)
# Exemple : serve -s frontend/build
# npm install -g serve
# serve -s frontend/build -l 3000

# Fin du script
echo "✅ Déploiement terminé !"
