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
        file_obj = request.FILES.get('image')
        if not file_obj:
            return Response({'error': 'Aucun fichier reçu.'}, status=400)

        # Détection du type de fichier
        content_type = file_obj.content_type
        filename = file_obj.name.lower()
        result = {}
        if content_type == 'application/dicom' or filename.endswith('.dcm'):
            # Simulation analyse DICOM
            result = {
                'malignancy_score': 0.85,
                'findings': ['Masse suspecte détectée', 'DICOM analysé']
            }
        elif content_type == 'image/jpeg' or filename.endswith('.jpg') or filename.endswith('.jpeg'):
            # Simulation analyse JPEG
            result = {
                'malignancy_score': 0.15,
                'findings': ['Image JPEG analysée', 'Pas de masse suspecte']
            }
        elif content_type == 'application/pdf' or filename.endswith('.pdf'):
            # Simulation analyse PDF
            result = {
                'malignancy_score': 0.5,
                'findings': ['PDF reçu', 'Analyse textuelle possible']
            }
        else:
            return Response({'error': 'Format de fichier non supporté.'}, status=400)

        # Sauvegarde en base (optionnel, ici on simule)
        serializer = MedicalImageSerializer(data={'image': file_obj, 'analysis_result': result})
        if serializer.is_valid():
            instance = serializer.save()
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