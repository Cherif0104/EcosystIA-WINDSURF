"""
Vues API pour la gestion des emplois
"""

from rest_framework import generics, status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.db.models import Q
from .models import Job, JobApplication
from .serializers import JobSerializer, JobApplicationSerializer


class JobListView(generics.ListCreateAPIView):
    """
    Liste et création d'emplois
    """
    serializer_class = JobSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    
    def get_queryset(self):
        queryset = Job.objects.filter(is_active=True)
        
        # Filtres
        location = self.request.query_params.get('location')
        job_type = self.request.query_params.get('job_type')
        experience_level = self.request.query_params.get('experience_level')
        search = self.request.query_params.get('search')
        
        if location:
            queryset = queryset.filter(location__icontains=location)
        if job_type:
            queryset = queryset.filter(job_type=job_type)
        if experience_level:
            queryset = queryset.filter(experience_level=experience_level)
        if search:
            queryset = queryset.filter(
                Q(title__icontains=search) | Q(description__icontains=search)
            )
        
        return queryset.order_by('-posted_at')


class JobDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Détails d'un emploi
    """
    serializer_class = JobSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    queryset = Job.objects.all()


class JobApplicationListView(generics.ListCreateAPIView):
    """
    Liste et création de candidatures
    """
    serializer_class = JobApplicationSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        # L'utilisateur voit ses propres candidatures
        return JobApplication.objects.filter(applicant=user).order_by('-applied_at')
    
    def perform_create(self, serializer):
        serializer.save(applicant=self.request.user)


class MyJobApplicationsView(generics.ListAPIView):
    """
    Mes candidatures
    """
    serializer_class = JobApplicationSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return JobApplication.objects.filter(applicant=self.request.user).order_by('-applied_at')


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def apply_for_job(request, job_id):
    """
    Postuler pour un emploi
    """
    try:
        job = Job.objects.get(id=job_id, is_active=True)
        
        # Vérifier si déjà candidaté
        existing_application = JobApplication.objects.filter(
            job=job, applicant=request.user
        ).first()
        
        if existing_application:
            return Response(
                {'error': 'Vous avez déjà postulé pour cet emploi'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Créer la candidature
        application = JobApplication.objects.create(
            job=job,
            applicant=request.user,
            cover_letter=request.data.get('cover_letter', ''),
            resume_url=request.data.get('resume_url', ''),
            status='pending'
        )
        
        serializer = JobApplicationSerializer(application)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
        
    except Job.DoesNotExist:
        return Response(
            {'error': 'Emploi non trouvé'},
            status=status.HTTP_404_NOT_FOUND
        )