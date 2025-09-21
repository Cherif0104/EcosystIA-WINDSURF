"""
Vues API pour la gestion des projets
"""

from rest_framework import generics, status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.db.models import Q
from .models import Project, Task, Risk, ProjectTeam
from .serializers import ProjectSerializer, TaskSerializer, RiskSerializer, ProjectTeamSerializer
from apps.users.models import User


class ProjectListView(generics.ListCreateAPIView):
    """
    Liste et création de projets
    """
    serializer_class = ProjectSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        # L'utilisateur voit ses propres projets et ceux où il est membre
        return Project.objects.filter(
            Q(owner=user) | Q(team__user=user)
        ).distinct().order_by('-created_at')
    
    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)


class ProjectDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Détails, mise à jour et suppression d'un projet
    """
    serializer_class = ProjectSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        return Project.objects.filter(
            Q(owner=user) | Q(team__user=user)
        ).distinct()


class TaskListView(generics.ListCreateAPIView):
    """
    Liste et création de tâches pour un projet
    """
    serializer_class = TaskSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        project_id = self.kwargs['project_id']
        return Task.objects.filter(project_id=project_id).order_by('-created_at')
    
    def perform_create(self, serializer):
        project_id = self.kwargs['project_id']
        serializer.save(project_id=project_id)


class RiskListView(generics.ListCreateAPIView):
    """
    Liste et création de risques pour un projet
    """
    serializer_class = RiskSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        project_id = self.kwargs['project_id']
        return Risk.objects.filter(project_id=project_id).order_by('-created_at')
    
    def perform_create(self, serializer):
        project_id = self.kwargs['project_id']
        serializer.save(project_id=project_id)


class ProjectTeamView(generics.ListCreateAPIView):
    """
    Gestion de l'équipe d'un projet
    """
    serializer_class = ProjectTeamSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        project_id = self.kwargs['project_id']
        return ProjectTeam.objects.filter(project_id=project_id).order_by('-joined_at')
    
    def perform_create(self, serializer):
        project_id = self.kwargs['project_id']
        serializer.save(project_id=project_id)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def add_team_member(request, project_id, user_id):
    """
    Ajouter un membre à l'équipe du projet
    """
    try:
        project = Project.objects.get(id=project_id, owner=request.user)
        user = User.objects.get(id=user_id)
        
        ProjectTeam.objects.get_or_create(
            project=project,
            user=user,
            defaults={'role': 'member'}
        )
        
        return Response({'message': 'Membre ajouté à l\'équipe'})
    except Project.DoesNotExist:
        return Response({'error': 'Projet non trouvé'}, status=404)
    except User.DoesNotExist:
        return Response({'error': 'Utilisateur non trouvé'}, status=404)


@api_view(['DELETE'])
@permission_classes([permissions.IsAuthenticated])
def remove_team_member(request, project_id, user_id):
    """
    Retirer un membre de l'équipe du projet
    """
    try:
        project = Project.objects.get(id=project_id, owner=request.user)
        ProjectTeam.objects.filter(project=project, user_id=user_id).delete()
        return Response({'message': 'Membre retiré de l\'équipe'})
    except Project.DoesNotExist:
        return Response({'error': 'Projet non trouvé'}, status=404)