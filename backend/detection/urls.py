from django.urls import path
from .views import ImageAnalysisView, MedicalImageListView
from .auth_views import RegisterView, LoginView

urlpatterns = [
    path('analyze/', ImageAnalysisView.as_view(), name='image-analysis'),
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('images/', MedicalImageListView.as_view(), name='medicalimage-list'),
]