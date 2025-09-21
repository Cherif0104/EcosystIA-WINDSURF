"""
Vues API pour l'authentification
"""

from rest_framework import generics, status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import login, logout
from .serializers import (
    UserRegistrationSerializer, LoginSerializer, 
    PasswordChangeSerializer, PasswordResetSerializer
)


class UserRegistrationView(generics.CreateAPIView):
    """
    Inscription d'un nouvel utilisateur
    """
    serializer_class = UserRegistrationSerializer
    permission_classes = [permissions.AllowAny]
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        
        # Générer les tokens JWT
        refresh = RefreshToken.for_user(user)
        
        return Response({
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'role': user.role,
            },
            'tokens': {
                'access_token': str(refresh.access_token),
                'refresh_token': str(refresh),
            },
            'message': 'Utilisateur créé avec succès'
        }, status=status.HTTP_201_CREATED)


class LoginView(generics.GenericAPIView):
    """
    Connexion utilisateur
    """
    serializer_class = LoginSerializer
    permission_classes = [permissions.AllowAny]
    
    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']
        
        # Générer les tokens JWT
        refresh = RefreshToken.for_user(user)
        
        # Mettre à jour les statistiques
        user.increment_login_count()
        user.update_last_activity()
        
        return Response({
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'role': user.role,
                'avatar': user.avatar,
            },
            'tokens': {
                'access_token': str(refresh.access_token),
                'refresh_token': str(refresh),
            },
            'message': 'Connexion réussie'
        })


class LogoutView(generics.GenericAPIView):
    """
    Déconnexion utilisateur
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request, *args, **kwargs):
        try:
            refresh_token = request.data["refresh_token"]
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response({'message': 'Déconnexion réussie'})
        except Exception as e:
            return Response({'error': 'Token invalide'}, status=400)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def change_password(request):
    """
    Changement de mot de passe
    """
    serializer = PasswordChangeSerializer(data=request.data, context={'request': request})
    if serializer.is_valid():
        user = request.user
        user.set_password(serializer.validated_data['new_password'])
        user.save()
        return Response({'message': 'Mot de passe modifié avec succès'})
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def password_reset(request):
    """
    Demande de réinitialisation de mot de passe
    """
    serializer = PasswordResetSerializer(data=request.data)
    if serializer.is_valid():
        email = serializer.validated_data['email']
        try:
            from apps.users.models import User
            user = User.objects.get(email=email)
            # Ici vous pouvez envoyer un email de réinitialisation
            return Response({'message': 'Email de réinitialisation envoyé'})
        except User.DoesNotExist:
            return Response({'message': 'Email de réinitialisation envoyé'})  # Pour la sécurité
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)