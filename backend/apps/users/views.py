"""
Vues API pour la gestion des utilisateurs
"""

from rest_framework import generics, status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from .models import User
from .serializers import UserSerializer, UserProfileSerializer, UserStatsSerializer

User = get_user_model()


class UserListView(generics.ListAPIView):
    """
    Liste des utilisateurs (pour les administrateurs)
    """
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        # Seuls les administrateurs peuvent voir tous les utilisateurs
        if self.request.user.is_staff:
            return User.objects.all().order_by('-date_joined')
        else:
            # Sinon, retourner seulement l'utilisateur actuel
            return User.objects.filter(id=self.request.user.id)


class UserDetailView(generics.RetrieveUpdateAPIView):
    """
    Détails et mise à jour d'un utilisateur
    """
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        # L'utilisateur peut voir son propre profil ou les admins peuvent voir tous
        if self.request.user.is_staff:
            return User.objects.all()
        else:
            return User.objects.filter(id=self.request.user.id)


class CurrentUserView(generics.RetrieveUpdateAPIView):
    """
    Profil de l'utilisateur actuel
    """
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self):
        return self.request.user


class UserProfileUpdateView(generics.UpdateAPIView):
    """
    Mise à jour du profil utilisateur
    """
    serializer_class = UserProfileSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self):
        return self.request.user


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def user_stats(request):
    """
    Statistiques de l'utilisateur actuel
    """
    user = request.user
    stats = {
        'user': UserStatsSerializer(user).data,
        'projects_count': user.projects_owned.count(),
        'courses_enrolled': user.course_enrollments.filter(status='enrolled').count(),
        'courses_completed': user.course_enrollments.filter(status='completed').count(),
    }
    return Response(stats)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def search_users(request):
    """
    Recherche d'utilisateurs
    """
    query = request.GET.get('q', '')
    if len(query) < 2:
        return Response({'error': 'Requête trop courte'}, status=400)
    
    users = User.objects.filter(
        models.Q(first_name__icontains=query) |
        models.Q(last_name__icontains=query) |
        models.Q(username__icontains=query) |
        models.Q(email__icontains=query)
    )[:10]
    
    serializer = UserSerializer(users, many=True)
    return Response(serializer.data)