from django.urls import path
from .views import ImageAnalysisView, MedicalImageListView, BiopsyReportUploadView, BiopsyReportListView, BiopsyPatientsListView, LastUserBiopsyView
from .auth_views import RegisterView, LoginView

urlpatterns = [
    path('analyze/', ImageAnalysisView.as_view(), name='image-analysis'),
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('images/', MedicalImageListView.as_view(), name='medicalimage-list'),
    path('biopsies/upload/', BiopsyReportUploadView.as_view(), name='biopsy-upload'),
    path('biopsies/', BiopsyReportListView.as_view(), name='biopsy-list'),
    path('biopsie/patients/', BiopsyPatientsListView.as_view(), name='biopsie-patients'),
    path('biopsie/', LastUserBiopsyView.as_view(), name='biopsie-last'),
]