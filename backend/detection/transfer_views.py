from rest_framework import status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from django.contrib.auth.models import User
from .models import UserProfile, TransfertPatient

class TransferPatientView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        patient_id = request.data.get('patient_id')
        medecin_cible_id = request.data.get('medecin_cible_id')
        motif = request.data.get('motif', '')
        if not patient_id or not medecin_cible_id:
            return Response({'detail': 'patient_id et medecin_cible_id requis.'}, status=400)
        try:
            patient_user = User.objects.get(id=patient_id)
            profile = patient_user.profile
            medecin_source = profile.medecin
            medecin_cible = User.objects.get(id=medecin_cible_id)
            # Vérifier que le médecin cible est bien un médecin
            if not hasattr(medecin_cible, 'profile') or medecin_cible.profile.role != 'medecin':
                return Response({'detail': 'Le médecin cible doit avoir le rôle "medecin".'}, status=400)
            # Effectuer le transfert
            profile.medecin = medecin_cible
            profile.save()
            # Historiser le transfert
            TransfertPatient.objects.create(
                patient=patient_user,
                medecin_source=medecin_source,
                medecin_cible=medecin_cible,
                motif=motif
            )
            return Response({'detail': 'Transfert effectué.'}, status=200)
        except User.DoesNotExist:
            return Response({'detail': 'Utilisateur ou médecin non trouvé.'}, status=404)
        except Exception as e:
            return Response({'detail': str(e)}, status=500)
