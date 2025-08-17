#!/bin/bash
# Script de diagnostic des utilisateurs

cd backend

echo "🔍 Diagnostic des utilisateurs..."

python manage.py shell -c "
from django.contrib.auth.models import User
from detection.models import UserProfile

print('📊 Liste de tous les utilisateurs:')
users = User.objects.all()
for user in users:
    try:
        profile = user.profile
        role = profile.role
    except:
        role = 'NO_PROFILE'
    
    print(f'  - Username: {user.username}')
    print(f'    Email: {user.email}')
    print(f'    Is superuser: {user.is_superuser}')
    print(f'    Is active: {user.is_active}')
    print(f'    Role: {role}')
    print(f'    ID: {user.id}')
    print('    ---')

print()
print('🔧 Création/vérification du superuser admin...')

# Supprimer l'ancien admin s'il existe et recréer
try:
    admin = User.objects.get(username='admin')
    admin.delete()
    print('✅ Ancien admin supprimé')
except User.DoesNotExist:
    print('ℹ️  Aucun admin existant')

# Créer le nouvel admin
user = User.objects.create_superuser('admin', 'admin@test.com', 'admin123!')
UserProfile.objects.create(user=user, role='superuser')
print('✅ Nouvel admin créé: admin/admin123!')

print()
print('✅ Diagnostic terminé')
"

echo ""
echo "🧪 Test de connexion admin..."
echo "Commande de test :"
echo "curl -X POST http://127.0.0.1:8000/detection/login/ -H \"Content-Type: application/json\" -d '{\"username\":\"admin\",\"password\":\"admin123!\"}'"
