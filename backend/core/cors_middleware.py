import logging
from django.http import HttpResponse

logger = logging.getLogger(__name__)

class CorsDebugMiddleware:
    """
    Middleware de débogage CORS pour diagnostiquer les problèmes
    """
    
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # Log des informations de débogage
        origin = request.headers.get('Origin', 'No Origin')
        method = request.method
        
        logger.info(f"CORS Debug - Method: {method}, Origin: {origin}")
        logger.info(f"CORS Debug - Headers: {dict(request.headers)}")
        
        # Gérer les requêtes OPTIONS préflight
        if method == 'OPTIONS':
            logger.info("CORS Debug - Handling OPTIONS preflight request")
            
            response = HttpResponse()
            response['Access-Control-Allow-Origin'] = origin if origin != 'No Origin' else '*'
            response['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS'
            response['Access-Control-Allow-Headers'] = 'Content-Type, Authorization, Accept, Origin, User-Agent, X-Requested-With'
            response['Access-Control-Allow-Credentials'] = 'true'
            response['Access-Control-Max-Age'] = '86400'
            
            logger.info(f"CORS Debug - Preflight response headers: {dict(response.items())}")
            return response

        # Continuer avec la requête normale
        response = self.get_response(request)
        
        # Ajouter les headers CORS à toutes les réponses
        if hasattr(response, '__setitem__'):
            if origin != 'No Origin':
                response['Access-Control-Allow-Origin'] = origin
                response['Access-Control-Allow-Credentials'] = 'true'
                logger.info(f"CORS Debug - Added headers to response for origin: {origin}")
        
        return response


class CorsFixMiddleware:
    """
    Middleware CORS de secours qui force les headers nécessaires
    """
    
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        origin = request.headers.get('Origin', '')
        
        # Liste des origines autorisées
        allowed_origins = [
            'https://detectioncancerfront.onrender.com',
            'http://localhost:3000',
            'http://127.0.0.1:3000',
        ]
        
        # Gérer les requêtes OPTIONS préflight
        if request.method == 'OPTIONS':
            response = HttpResponse()
            if origin in allowed_origins or not origin:
                response['Access-Control-Allow-Origin'] = origin or '*'
                response['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS'
                response['Access-Control-Allow-Headers'] = (
                    'Content-Type, Authorization, Accept, Origin, User-Agent, '
                    'X-Requested-With, X-CSRFToken'
                )
                response['Access-Control-Allow-Credentials'] = 'true'
                response['Access-Control-Max-Age'] = '86400'
            return response
        
        # Traiter la requête normale
        response = self.get_response(request)
        
        # Ajouter les headers CORS
        if origin in allowed_origins:
            response['Access-Control-Allow-Origin'] = origin
            response['Access-Control-Allow-Credentials'] = 'true'
            response['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS'
            response['Access-Control-Allow-Headers'] = (
                'Content-Type, Authorization, Accept, Origin, User-Agent, '
                'X-Requested-With, X-CSRFToken'
            )
        
        return response
