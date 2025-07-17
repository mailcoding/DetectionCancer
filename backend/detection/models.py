from django.db import models
from django.contrib.auth.models import User

class UserProfile(models.Model):
    ROLE_CHOICES = [
        ('medecin', 'Médecin'),
        ('infirmier', 'Infirmier'),
        ('patient', 'Patient'),
        ('directeur', 'Directeur'),
        ('chef_poste', 'Chef de poste'),
        ('superuser', 'Superuser'),
    ]
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='patient')

    def __str__(self):
        return f"{self.user.username} - {self.role}"

class MedicalImage(models.Model):
    image = models.ImageField(upload_to='medical_images/')
    analysis_result = models.JSONField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Image {self.id}"

class BiopsyReport(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    file = models.FileField(upload_to='biopsies/')
    uploaded_at = models.DateTimeField(auto_now_add=True)
    # Optionnel : lien vers un patient, un examen, etc.