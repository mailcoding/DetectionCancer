from rest_framework import serializers
from .models import MedicalImage, BiopsyReport

class MedicalImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = MedicalImage
        fields = ['id', 'image', 'analysis_result', 'created_at']
        read_only_fields = ['analysis_result', 'created_at']

class BiopsyReportSerializer(serializers.ModelSerializer):
    rapport_url = serializers.SerializerMethodField()

    class Meta:
        model = BiopsyReport
        fields = ['id', 'file', 'created_at', 'patient', 'resultat', 'rapport_url']

    def get_rapport_url(self, obj):
        request = self.context.get('request')
        if obj.file and hasattr(obj.file, 'url'):
            return request.build_absolute_uri(obj.file.url) if request else obj.file.url
        return None
class BiopsyReportSerializer(serializers.ModelSerializer):
    class Meta:
        model = BiopsyReport
        fields = ['id', 'user', 'file', 'uploaded_at']
        read_only_fields = ['id', 'user', 'uploaded_at']