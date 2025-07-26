class ExamenMedical(models.Model):
    id = models.AutoField(primary_key=True)
    patient = models.CharField(max_length=128)
    type = models.CharField(max_length=32, choices=[('mammographie', 'Mammographie'), ('biopsie', 'Biopsie')])
    date = models.DateField()
    score_ia = models.FloatField(null=True, blank=True)
    findings = models.TextField(blank=True)
    advice = models.TextField(blank=True)
    interpretation = models.TextField(blank=True)
    rapport_url = models.URLField(blank=True)

    def __str__(self):
        return f"{self.patient} - {self.type} - {self.date}"
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
    patient = models.CharField(max_length=128, blank=True, null=True)
    resultat = models.CharField(max_length=256, blank=True, null=True)

    def __str__(self):
        return f"BiopsyReport #{self.id} ({self.file.name})"