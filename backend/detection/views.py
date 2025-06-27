from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser
from .serializers import MedicalImageSerializer
from rest_framework.generics import ListAPIView
from .models import MedicalImage

class ImageAnalysisView(APIView):
    parser_classes = [MultiPartParser]

    def post(self, request):
        serializer = MedicalImageSerializer(data=request.data)
        if serializer.is_valid():
            # Simulation d'analyse IA
            instance = serializer.save(analysis_result={
                'malignancy_score': 0.85,
                'findings': ['Masse suspecte détectée']
            })
            return Response({
                'result': instance.analysis_result,
                'id': instance.id,
                'created_at': instance.created_at,
                'image_url': instance.image.url if instance.image else None
            })
        return Response(serializer.errors, status=400)

class MedicalImageListView(ListAPIView):
    queryset = MedicalImage.objects.all().order_by('-created_at')
    serializer_class = MedicalImageSerializer