from django.db import migrations
from django.contrib.auth.hashers import make_password

def create_patients(apps, schema_editor):
    User = apps.get_model('auth', 'User')
    UserProfile = apps.get_model('detection', 'UserProfile')
    patients = [
        {'username': 'awa.diop', 'first_name': 'Awa', 'last_name': 'Diop'},
        {'username': 'mamadou.fall', 'first_name': 'Mamadou', 'last_name': 'Fall'},
        {'username': 'fatou.ndiaye', 'first_name': 'Fatou', 'last_name': 'Ndiaye'},
        {'username': 'ibrahima.sow', 'first_name': 'Ibrahima', 'last_name': 'Sow'},
        {'username': 'aminata.ba', 'first_name': 'Aminata', 'last_name': 'Ba'},
        {'username': 'cheikh.diouf', 'first_name': 'Cheikh', 'last_name': 'Diouf'},
        {'username': 'astou.sy', 'first_name': 'Astou', 'last_name': 'Sy'},
        {'username': 'pape.faye', 'first_name': 'Pape', 'last_name': 'Faye'},
        {'username': 'khady.sarr', 'first_name': 'Khady', 'last_name': 'Sarr'},
        {'username': 'moussa.kane', 'first_name': 'Moussa', 'last_name': 'Kane'},
    ]
    for p in patients:
        user, created = User.objects.get_or_create(
            username=p['username'],
            defaults={
                'first_name': p['first_name'],
                'last_name': p['last_name'],
                'password': make_password('patient2025'),
                'email': f"{p['username']}@example.com"
            }
        )
        if created:
            UserProfile.objects.create(user=user, role='patient')

class Migration(migrations.Migration):
    dependencies = [
        ('detection', '0003_biopsyreport'),
        ('auth', '0012_alter_user_first_name_max_length'),
    ]

    operations = [
        migrations.RunPython(create_patients),
    ]
