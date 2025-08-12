from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from ml.predict import predict_cancer

class CancerPredictView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        image_file = request.FILES.get('image')
        if not image_file:
            return Response({'detail': 'Aucune image reçue.'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            image_bytes = image_file.read()
            score = predict_cancer(image_bytes)
            result = 'Cancéreux' if score > 0.5 else 'Non Cancéreux'
            return Response({'score_ia': score, 'resultat': result})
        except Exception as e:
            return Response({'detail': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
