from .models import ExamenMedical
class PatientExamHistoryView(APIView):
    def get(self, request, patient_id):
        type_ = request.GET.get('type')
        exams = ExamenMedical.objects.filter(patient=patient_id)
        if type_:
            exams = exams.filter(type=type_)
        exams = exams.order_by('date')
        data = [
            {
                'id': e.id,
                'patient': e.patient,
                'type': e.type,
                'date': e.date,
                'score_ia': e.score_ia,
                'findings': e.findings,
                'advice': e.advice,
                'interpretation': e.interpretation,
                'rapport_url': e.rapport_url,
            }
            for e in exams
        ]
        return Response(data)
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser
from .serializers import MedicalImageSerializer, BiopsyReportSerializer
from rest_framework.generics import ListAPIView, CreateAPIView
from .models import MedicalImage, BiopsyReport
from rest_framework import permissions, generics
from django.contrib.auth.models import User


class BiopsyPatientsListView(APIView):
    def get(self, request):
        patients = BiopsyReport.objects.values_list('patient', flat=True).distinct()
        patients = [p for p in patients if p]
        return Response(patients)

class BiopsyReportListView(APIView):
    def get(self, request):
        reports = BiopsyReport.objects.all().order_by('-uploaded_at')
        serializer = BiopsyReportSerializer(reports, many=True, context={'request': request})
        return Response(serializer.data)


class BiopsyUploadView(APIView):
    parser_classes = (MultiPartParser, FormParser)

    def post(self, request, format=None):
        file_obj = request.FILES.get('file')
        patient = request.data.get('patient', '')
        resultat = request.data.get('resultat', '')
        if not file_obj or file_obj.content_type not in ['application/pdf', 'image/png', 'image/jpeg']:
            return Response({'error': 'Format de fichier non supporté.'}, status=status.HTTP_400_BAD_REQUEST)
        report = BiopsyReport.objects.create(file=file_obj, user=request.user, patient=patient, resultat=resultat)
        serializer = BiopsyReportSerializer(report, context={'request': request})
        return Response(serializer.data, status=status.HTTP_201_CREATED)

# --- Nouvelle version fusionnée et avancée ---
from django.db import models

class BiopsyReportListView(APIView):
    def get(self, request):
        queryset = BiopsyReport.objects.all()
        # Recherche
        search = request.GET.get('search')
        if search:
            queryset = queryset.filter(
                models.Q(patient__icontains=search) |
                models.Q(resultat__icontains=search)
            )
        # Filtrage par type (PDF/image)
        type_ = request.GET.get('type')
        if type_:
            if type_ == 'pdf':
                queryset = queryset.filter(file__iendswith='.pdf')
            elif type_ == 'image':
                queryset = queryset.filter(file__iregex=r'\\.(png|jpg|jpeg)$')
        # Tri
        ordering = request.GET.get('ordering', '-uploaded_at')
        queryset = queryset.order_by(ordering)
        serializer = BiopsyReportSerializer(queryset, many=True, context={'request': request})
        return Response(serializer.data)

class BiopsyUploadView(APIView):
    parser_classes = (MultiPartParser, FormParser)

    def post(self, request, format=None):
        files = request.FILES.getlist('files')
        patient = request.data.get('patient', '')
        resultat = request.data.get('resultat', '')
        if not files:
            return Response({'error': 'Aucun fichier reçu.'}, status=status.HTTP_400_BAD_REQUEST)
        created = []
        for file_obj in files:
            if file_obj.content_type not in ['application/pdf', 'image/png', 'image/jpeg']:
                continue
            report = BiopsyReport.objects.create(file=file_obj, user=request.user, patient=patient, resultat=resultat)
            created.append(report)
        if not created:
            return Response({'error': 'Aucun fichier valide.'}, status=status.HTTP_400_BAD_REQUEST)
        serializer = BiopsyReportSerializer(created, many=True, context={'request': request})
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class ImageAnalysisView(APIView):
    def post(self, request):
        file = request.FILES.get('image')
        if not file:
            return Response({'error': 'Aucun fichier reçu.'}, status=400)

        try:
            import magic
            mime = magic.from_buffer(file.read(2048), mime=True)
            file.seek(0)
        except Exception as e:
            return Response({'error': f'Erreur de détection du format : {str(e)}'}, status=400)

        supported = {
            'application/dicom': 'DICOM',
            'image/jpeg': 'JPEG',
            'image/png': 'PNG',
            'image/tiff': 'TIFF',
            'application/pdf': 'PDF',
            'image/bmp': 'BMP',
            'image/gif': 'GIF',
        }
        format_detected = supported.get(mime)
        if not format_detected:
            return Response({'error': f'Format non supporté ({mime}).'}, status=415)

        result = {
            'format': format_detected,
            'score': 0.72,
            'findings': 'Suspicion de cellules atypiques',
            'advice': 'Demander une biopsie complémentaire',
            'interpretation': 'Le modèle détecte des anomalies compatibles avec une tumeur maligne.',
        }
        return Response(result, status=200)

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