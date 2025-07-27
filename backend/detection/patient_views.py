from rest_framework import generics, permissions, filters
from django.contrib.auth.models import User
from .models import UserProfile
from rest_framework.response import Response
from rest_framework import serializers
from rest_framework.serializers import ModelSerializer

class PatientListSerializer(ModelSerializer):
    nom = serializers.CharField(source='user.last_name')
    prenom = serializers.CharField(source='user.first_name')
    username = serializers.CharField(source='user.username')
    urgence = serializers.IntegerField(default=1)  # À adapter si champ urgence réel
    class Meta:
        model = UserProfile
        fields = ['id', 'username', 'nom', 'prenom', 'urgence', 'medecin']

class PatientListView(generics.ListAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = PatientListSerializer
    filter_backends = [filters.OrderingFilter]
    ordering_fields = ['urgence']

    def get_queryset(self):
        medecin_id = self.request.query_params.get('medecin_id')
        qs = UserProfile.objects.filter(role='patient')
        if medecin_id == 'null':
            qs = qs.filter(medecin__isnull=True)
        elif medecin_id:
            qs = qs.filter(medecin_id=medecin_id)
        return qs
