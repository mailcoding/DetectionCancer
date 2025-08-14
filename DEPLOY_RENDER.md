# Guide de déploiement Render.com pour DetectionCancer

## 🚀 Déploiement Backend

### 1. Configuration du service Backend sur Render

1. Connectez votre repo GitHub à Render.com
2. Créez un nouveau **Web Service**
3. Configurez les paramètres :

```
Environment: Python 3
Build Command: ./backend/build.sh
Start Command: gunicorn --chdir backend core.wsgi:application
```

### 2. Variables d'environnement à configurer

Dans le dashboard Render, ajoutez ces variables :

```bash
# Django Configuration
SECRET_KEY=your-super-secret-key-here
DEBUG=False
ALLOWED_HOSTS=detectioncancer-backend.onrender.com,.onrender.com

# CORS Configuration  
CORS_ALLOW_ALL_ORIGINS=False
CORS_ALLOWED_ORIGINS=https://detectioncancerfront.onrender.com

# Database (optionnel, SQLite par défaut)
# DATABASE_URL=postgres://...

# Static & Media Files
STATIC_ROOT=/opt/render/project/src/backend/static
MEDIA_ROOT=/opt/render/project/src/backend/media
```

### 3. Configuration DNS

- **Backend URL** : `https://detectioncancer-backend.onrender.com`
- **Frontend URL** : `https://detectioncancerfront.onrender.com`

## 🎨 Déploiement Frontend

### 1. Configuration du service Frontend sur Render

1. Créez un nouveau **Static Site**
2. Configurez les paramètres :

```
Build Command: cd frontend && npm install && npm run build
Publish Directory: frontend/build
```

### 2. Variables d'environnement Frontend

```bash
REACT_APP_API_URL=https://detectioncancer-backend.onrender.com
REACT_APP_BACKEND_URL=https://detectioncancer-backend.onrender.com
```

## 🔧 Corrections apportées

### Backend (settings.py)
- ✅ CORS middleware repositionné en premier
- ✅ ALLOWED_HOSTS configuré pour Render
- ✅ CORS_ALLOWED_ORIGINS avec l'URL du frontend
- ✅ Headers et méthodes CORS configurés
- ✅ CORS_ALLOW_CREDENTIALS activé

### Requirements.txt
- ✅ Ajout de `dj-database-url` pour PostgreSQL
- ✅ Ajout de `whitenoise` pour les fichiers statiques
- ✅ Ajout de `Pillow` pour le traitement d'images

### Auth Views
- ✅ Gestion d'erreur améliorée
- ✅ Validation des entrées
- ✅ Création automatique de profil utilisateur
- ✅ Messages d'erreur détaillés

## 🐛 Résolution des problèmes

### Erreur CORS
- Vérifiez que `CORS_ALLOWED_ORIGINS` contient l'URL exacte du frontend
- Le middleware CORS doit être en premier dans `MIDDLEWARE`

### Erreur 500
- Vérifiez les logs Render pour l'erreur exacte
- Assurez-vous que toutes les variables d'environnement sont définies
- Vérifiez que les migrations sont appliquées

### Erreur de base de données
- Par défaut SQLite est utilisé
- Pour PostgreSQL, définir `DATABASE_URL`

## 📝 Commandes utiles

```bash
# Logs backend Render
render logs --service your-backend-service-name

# Test local
python manage.py runserver
curl -X POST http://localhost:8000/detection/login/ \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123!"}'
```

## ✅ Checklist de déploiement

- [ ] Variables d'environnement configurées
- [ ] CORS correctement configuré
- [ ] Build script exécutable
- [ ] Frontend pointe vers la bonne URL backend
- [ ] SSL activé (HTTPS)
- [ ] Logs vérifiés sans erreur
