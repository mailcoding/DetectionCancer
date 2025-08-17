from .views import PatientExamHistoryView
from django.urls import path
from .views import ImageAnalysisView, MedicalImageListView, BiopsyReportUploadView, BiopsyReportListView, BiopsyPatientsListView, LastUserBiopsyView, BiopsyUploadView, BiopsyReportListView, BiopsyPatientsListView
from .transfer_views import TransferPatientView
from .patient_views import PatientListView
from .views_predict import CancerPredictView
from .auth_views import RegisterView, LoginView
from .health_views import HealthCheckView

urlpatterns = [
    path('health/', HealthCheckView.as_view(), name='health-check'),
    path('analyze/', ImageAnalysisView.as_view(), name='image-analysis'),
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('images/', MedicalImageListView.as_view(), name='medicalimage-list'),
    path('biopsies/upload/', BiopsyUploadView.as_view(), name='biopsies-upload'),
    path('biopsies/', BiopsyReportListView.as_view(), name='biopsy-list'),
    path('biopsie/patients/', BiopsyPatientsListView.as_view(), name='biopsie-patients'),
    path('biopsie/', LastUserBiopsyView.as_view(), name='biopsie-last'),
    path('examens/patient/<str:patient_id>/', PatientExamHistoryView.as_view(), name='patient-exam-history'),
    path('patients/transfer/', TransferPatientView.as_view(), name='transfer-patient'),
    path('patients/', PatientListView.as_view(), name='patients-list'),
    path('predict/', CancerPredictView.as_view(), name='predict-cancer'),
]