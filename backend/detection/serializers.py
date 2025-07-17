from rest_framework import serializers
from .models import MedicalImage, BiopsyReport

class MedicalImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = MedicalImage
        fields = ['id', 'image', 'analysis_result', 'created_at']
        read_only_fields = ['analysis_result', 'created_at']

class BiopsyReportSerializer(serializers.ModelSerializer):
    class Meta:
        model = BiopsyReport
        fields = ['id', 'user', 'file', 'uploaded_at']
        read_only_fields = ['id', 'user', 'uploaded_at']