from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.conf import settings
from django.contrib.auth.models import User

import os
import sys

class HealthCheckView(APIView):
    """
    Endpoint de vérification de santé du service
    """
    def get(self, request):
        health_status = {
            'status': 'healthy',
            'service': 'DetectionCancer Backend',
            'version': '1.0.0',
            'debug': settings.DEBUG,
        }
        
        # Vérifier le modèle IA (nouveau système basé sur modele.py)
        try:
            sys.path.append('..')
            from ml.predict import get_model_status
            health_status['ai_model'] = get_model_status()
        except Exception as e:
            health_status['ai_model'] = {
                'status': 'error',
                'type': 'unknown',
                'layers': 0,
                'parameters': 0,
                'warning': f'Erreur lors du chargement: {str(e)}'
            }
        
        # Vérifier le système d'apprentissage autonome
        try:
            sys.path.append('..')
            from ml.autonomous_learning import autonomous_system
            
            if autonomous_system:
                learning_stats = autonomous_system.get_learning_stats()
                health_status['autonomous_learning'] = {
                    'enabled': learning_stats['autonomous_learning_enabled'],
                    'total_feedbacks': learning_stats['total_feedbacks'],
                    'current_accuracy': learning_stats['current_accuracy'],
                    'performance_trend': learning_stats['performance_trend'],
                    'model_version': learning_stats['model_version'],
                    'status': 'operational'
                }
            else:
                health_status['autonomous_learning'] = {
                    'enabled': False,
                    'status': 'unavailable'
                }
        except Exception as e:
            health_status['autonomous_learning'] = {
                'enabled': False,
                'status': 'error',
                'error': str(e)
            }
        
        # Vérifier la base de données
        try:
            user_count = User.objects.count()
            health_status['database'] = 'connected'
            health_status['user_count'] = user_count
        except Exception as e:
            health_status['database'] = 'error'
            health_status['database_error'] = str(e)
        
        return Response(health_status, status=status.HTTP_200_OK)
