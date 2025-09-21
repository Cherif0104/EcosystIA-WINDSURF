"""
Vues API pour la gestion des cours
"""

from rest_framework import generics, status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.db.models import Q
from django.utils import timezone
from .models import Course, Module, Lesson, CourseEnrollment, CourseProgress
from .serializers import (
    CourseSerializer, ModuleSerializer, LessonSerializer,
    CourseEnrollmentSerializer, CourseProgressSerializer
)


class CourseListView(generics.ListCreateAPIView):
    """
    Liste et création de cours
    """
    serializer_class = CourseSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    
    def get_queryset(self):
        queryset = Course.objects.filter(is_published=True)
        
        # Filtres
        category = self.request.query_params.get('category')
        difficulty = self.request.query_params.get('difficulty')
        search = self.request.query_params.get('search')
        
        if category:
            queryset = queryset.filter(category=category)
        if difficulty:
            queryset = queryset.filter(difficulty=difficulty)
        if search:
            queryset = queryset.filter(
                Q(title__icontains=search) | Q(description__icontains=search)
            )
        
        return queryset.order_by('-created_at')


class CourseDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Détails d'un cours
    """
    serializer_class = CourseSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    queryset = Course.objects.all()


class MyCoursesListView(generics.ListAPIView):
    """
    Mes cours (cours auxquels l'utilisateur est inscrit)
    """
    serializer_class = CourseSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        enrolled_courses = CourseEnrollment.objects.filter(
            user=user, status='enrolled'
        ).values_list('course_id', flat=True)
        
        return Course.objects.filter(
            id__in=enrolled_courses
        ).order_by('-enrollment__enrolled_at')


class CourseEnrollmentView(generics.CreateAPIView):
    """
    Inscription à un cours
    """
    serializer_class = CourseEnrollmentSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def create(self, request, *args, **kwargs):
        course_id = kwargs.get('course_id')
        try:
            course = Course.objects.get(id=course_id, is_published=True)
            
            # Vérifier si déjà inscrit
            enrollment, created = CourseEnrollment.objects.get_or_create(
                user=request.user,
                course=course,
                defaults={'status': 'enrolled'}
            )
            
            if not created:
                return Response(
                    {'message': 'Vous êtes déjà inscrit à ce cours'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Créer le suivi de progression
            CourseProgress.objects.create(
                user=request.user,
                course=course,
                overall_progress=0
            )
            
            return Response(
                {'message': 'Inscription réussie'},
                status=status.HTTP_201_CREATED
            )
            
        except Course.DoesNotExist:
            return Response(
                {'error': 'Cours non trouvé'},
                status=status.HTTP_404_NOT_FOUND
            )


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def complete_lesson(request, course_id, lesson_id):
    """
    Marquer une leçon comme terminée
    """
    try:
        # Vérifier que l'utilisateur est inscrit au cours
        enrollment = CourseEnrollment.objects.get(
            user=request.user,
            course_id=course_id,
            status='enrolled'
        )
        
        # Marquer la leçon comme terminée
        lesson = Lesson.objects.get(id=lesson_id, module__course_id=course_id)
        lesson.is_completed = True
        lesson.save()
        
        # Mettre à jour la progression du cours
        progress, created = CourseProgress.objects.get_or_create(
            user=request.user,
            course=enrollment.course
        )
        
        # Recalculer la progression globale
        total_lessons = Lesson.objects.filter(
            module__course=enrollment.course
        ).count()
        completed_lessons = Lesson.objects.filter(
            module__course=enrollment.course,
            is_completed=True
        ).count()
        
        progress.overall_progress = int((completed_lessons / total_lessons) * 100)
        progress.save()
        
        # Vérifier si le cours est terminé
        if progress.overall_progress == 100:
            enrollment.status = 'completed'
            enrollment.save()
            progress.completed_at = timezone.now()
            progress.save()
        
        return Response({'message': 'Leçon marquée comme terminée'})
        
    except CourseEnrollment.DoesNotExist:
        return Response(
            {'error': 'Vous n\'êtes pas inscrit à ce cours'},
            status=status.HTTP_400_BAD_REQUEST
        )
    except Lesson.DoesNotExist:
        return Response(
            {'error': 'Leçon non trouvée'},
            status=status.HTTP_404_NOT_FOUND
        )