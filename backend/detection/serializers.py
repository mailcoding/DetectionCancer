from rest_framework import serializers
from .models import MedicalImage

class MedicalImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = MedicalImage
        fields = ['id', 'image', 'analysis_result', 'created_at']
        read_only_fields = ['analysis_result', 'created_at']