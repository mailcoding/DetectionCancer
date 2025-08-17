from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
import logging

logger = logging.getLogger(__name__)

try:
    from ml.predict import predict_cancer
    ML_AVAILABLE = True
except ImportError as e:
    ML_AVAILABLE = False
    logger.error(f"Module ML non disponible: {e}")

class CancerPredictView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        # Vérifier si le module ML est disponible
        if not ML_AVAILABLE:
            logger.warning("Tentative d'utilisation du module ML non disponible")
            return Response({
                'detail': 'Fonctionnalité de prédiction IA temporairement indisponible.',
                'error_type': 'model_unavailable',
                'status': 'degraded'
            }, status=status.HTTP_503_SERVICE_UNAVAILABLE)
        
        image_file = request.FILES.get('image')
        if not image_file:
            return Response({
                'detail': 'Aucune image reçue.'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            image_bytes = image_file.read()
            score = predict_cancer(image_bytes)
            result = 'Cancéreux' if score > 0.5 else 'Non Cancéreux'
            
            logger.info(f"Prédiction IA réalisée avec succès: score={score}")
            
            return Response({
                'score_ia': score, 
                'resultat': result,
                'status': 'success'
            })
            
        except ValueError as e:
            # Erreur spécifique au modèle IA non disponible
            logger.warning(f"Modèle IA non disponible: {str(e)}")
            return Response({
                'detail': 'Fonctionnalité de prédiction IA temporairement indisponible.',
                'error_type': 'model_unavailable',
                'status': 'degraded'
            }, status=status.HTTP_503_SERVICE_UNAVAILABLE)
            
        except Exception as e:
            # Autres erreurs
            logger.error(f"Erreur lors de la prédiction: {str(e)}")
            return Response({
                'detail': f'Erreur lors de l\'analyse de l\'image: {str(e)}',
                'error_type': 'prediction_error',
                'status': 'error'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
