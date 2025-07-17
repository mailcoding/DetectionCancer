from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser
from .serializers import MedicalImageSerializer, BiopsyReportSerializer
from rest_framework.generics import ListAPIView, CreateAPIView
from .models import MedicalImage, BiopsyReport
from rest_framework import permissions, generics
from django.contrib.auth.models import User

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

class BiopsyReportUploadView(CreateAPIView):
    serializer_class = BiopsyReportSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class BiopsyReportListView(generics.ListAPIView):
    serializer_class = BiopsyReportSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return BiopsyReport.objects.all().order_by('-uploaded_at')

class BiopsyPatientsListView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        # On suppose que chaque BiopsyReport a un user/patient
        patients = User.objects.filter(biopsyreport__isnull=False).distinct()
        # Retourne la liste des usernames (ou adaptez selon votre modèle Patient)
        return Response([p.username for p in patients])

class LastUserBiopsyView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        # Dernière biopsie du user connecté
        biopsy = BiopsyReport.objects.filter(user=request.user).order_by('-uploaded_at').first()
        if not biopsy:
            return Response({}, status=404)
        return Response(BiopsyReportSerializer(biopsy).data)