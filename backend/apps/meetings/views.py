"""
Vues pour la gestion des réunions
"""

from rest_framework import generics, status, filters
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q, Count, Avg
from django.utils import timezone
from datetime import datetime, timedelta

from .models import Meeting, MeetingAttendee, MeetingAction, MeetingTemplate
from .serializers import (
    MeetingSerializer, MeetingListSerializer, MeetingAttendeeSerializer,
    MeetingActionSerializer, MeetingTemplateSerializer, MeetingStatsSerializer
)
from apps.core.mixins import CacheResponseMixin


class MeetingListCreateView(CacheResponseMixin, generics.ListCreateAPIView):
    """
    Liste et création des réunions
    """
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['type', 'status', 'priority', 'organizer']
    search_fields = ['title', 'description', 'location']
    ordering_fields = ['start_datetime', 'created_at', 'title']
    ordering = ['-start_datetime']
    
    def get_queryset(self):
        user = self.request.user
        return Meeting.objects.filter(
            Q(organizer=user) | Q(attendees=user)
        ).distinct().select_related('organizer').prefetch_related('attendees')
    
    def get_serializer_class(self):
        if self.request.method == 'GET':
            return MeetingListSerializer
        return MeetingSerializer


class MeetingDetailView(CacheResponseMixin, generics.RetrieveUpdateDestroyAPIView):
    """
    Détail, modification et suppression d'une réunion
    """
    serializer_class = MeetingSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        return Meeting.objects.filter(
            Q(organizer=user) | Q(attendees=user)
        ).distinct().select_related('organizer').prefetch_related(
            'attendees', 'actions', 'meetingattendee_set__user'
        )


class MeetingAttendeesView(generics.ListCreateAPIView):
    """
    Gestion des participants à une réunion
    """
    serializer_class = MeetingAttendeeSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        meeting_id = self.kwargs['meeting_id']
        return MeetingAttendee.objects.filter(
            meeting_id=meeting_id
        ).select_related('user', 'meeting')
    
    def perform_create(self, serializer):
        meeting_id = self.kwargs['meeting_id']
        meeting = Meeting.objects.get(id=meeting_id)
        
        # Vérifier que l'utilisateur peut ajouter des participants
        if meeting.organizer != self.request.user:
            raise PermissionDenied("Seul l'organisateur peut ajouter des participants")
        
        serializer.save(meeting=meeting)


class MeetingAttendeeDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Détail d'un participant à une réunion
    """
    serializer_class = MeetingAttendeeSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        meeting_id = self.kwargs['meeting_id']
        return MeetingAttendee.objects.filter(
            meeting_id=meeting_id
        ).select_related('user', 'meeting')


class MeetingActionsView(generics.ListCreateAPIView):
    """
    Actions issues d'une réunion
    """
    serializer_class = MeetingActionSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['status', 'priority', 'assigned_to']
    ordering_fields = ['due_date', 'priority', 'created_at']
    ordering = ['due_date', 'priority']
    
    def get_queryset(self):
        meeting_id = self.kwargs['meeting_id']
        return MeetingAction.objects.filter(
            meeting_id=meeting_id
        ).select_related('assigned_to', 'created_by', 'meeting')
    
    def perform_create(self, serializer):
        meeting_id = self.kwargs['meeting_id']
        meeting = Meeting.objects.get(id=meeting_id)
        serializer.save(meeting=meeting, created_by=self.request.user)


class MeetingActionDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Détail d'une action de réunion
    """
    serializer_class = MeetingActionSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        meeting_id = self.kwargs['meeting_id']
        return MeetingAction.objects.filter(
            meeting_id=meeting_id
        ).select_related('assigned_to', 'created_by', 'meeting')


class MeetingTemplatesView(generics.ListCreateAPIView):
    """
    Modèles de réunions
    """
    serializer_class = MeetingTemplateSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'description']
    ordering_fields = ['name', 'created_at']
    ordering = ['name']
    
    def get_queryset(self):
        return MeetingTemplate.objects.filter(
            is_active=True
        ).select_related('created_by').prefetch_related('default_attendees')


class MeetingTemplateDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Détail d'un modèle de réunion
    """
    serializer_class = MeetingTemplateSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return MeetingTemplate.objects.filter(
            created_by=self.request.user
        ).select_related('created_by').prefetch_related('default_attendees')


class MeetingStatsView(APIView):
    """
    Statistiques des réunions
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        user = request.user
        now = timezone.now()
        week_ago = now - timedelta(days=7)
        month_ago = now - timedelta(days=30)
        
        # Réunions de l'utilisateur
        user_meetings = Meeting.objects.filter(
            Q(organizer=user) | Q(attendees=user)
        ).distinct()
        
        # Statistiques de base
        stats = {
            'total_meetings': user_meetings.count(),
            'meetings_this_week': user_meetings.filter(
                start_datetime__gte=week_ago
            ).count(),
            'meetings_this_month': user_meetings.filter(
                start_datetime__gte=month_ago
            ).count(),
        }
        
        # Durée moyenne
        avg_duration = user_meetings.aggregate(
            avg_duration=Avg('actual_end_time') - Avg('actual_start_time')
        )
        stats['average_duration'] = avg_duration['avg_duration'] or 0
        
        # Taux de présence moyen
        avg_attendance = user_meetings.aggregate(
            avg_attendance=Avg('attendance_rate')
        )
        stats['attendance_rate'] = avg_attendance['avg_attendance'] or 0
        
        # Répartition par type
        meetings_by_type = user_meetings.values('type').annotate(
            count=Count('id')
        ).order_by('-count')
        stats['meetings_by_type'] = {
            item['type']: item['count'] for item in meetings_by_type
        }
        
        # Répartition par statut
        meetings_by_status = user_meetings.values('status').annotate(
            count=Count('id')
        ).order_by('-count')
        stats['meetings_by_status'] = {
            item['status']: item['count'] for item in meetings_by_status
        }
        
        serializer = MeetingStatsSerializer(stats)
        return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def upcoming_meetings(request):
    """
    Réunions à venir pour l'utilisateur
    """
    user = request.user
    now = timezone.now()
    
    meetings = Meeting.objects.filter(
        Q(organizer=user) | Q(attendees=user),
        start_datetime__gte=now,
        status='Scheduled'
    ).distinct().select_related('organizer').order_by('start_datetime')[:10]
    
    serializer = MeetingListSerializer(meetings, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def today_meetings(request):
    """
    Réunions d'aujourd'hui
    """
    user = request.user
    today = timezone.now().date()
    
    meetings = Meeting.objects.filter(
        Q(organizer=user) | Q(attendees=user),
        start_datetime__date=today
    ).distinct().select_related('organizer').order_by('start_datetime')
    
    serializer = MeetingListSerializer(meetings, many=True)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def join_meeting(request, meeting_id):
    """
    Rejoindre une réunion
    """
    try:
        attendee = MeetingAttendee.objects.get(
            meeting_id=meeting_id,
            user=request.user
        )
        attendee.is_present = True
        attendee.joined_at = timezone.now()
        attendee.save()
        
        return Response({'message': 'Vous avez rejoint la réunion'})
    except MeetingAttendee.DoesNotExist:
        return Response(
            {'error': 'Vous n\'êtes pas invité à cette réunion'},
            status=status.HTTP_403_FORBIDDEN
        )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def leave_meeting(request, meeting_id):
    """
    Quitter une réunion
    """
    try:
        attendee = MeetingAttendee.objects.get(
            meeting_id=meeting_id,
            user=request.user
        )
        attendee.is_present = False
        attendee.left_at = timezone.now()
        attendee.save()
        
        return Response({'message': 'Vous avez quitté la réunion'})
    except MeetingAttendee.DoesNotExist:
        return Response(
            {'error': 'Vous n\'êtes pas invité à cette réunion'},
            status=status.HTTP_403_FORBIDDEN
        )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def respond_to_invitation(request, meeting_id):
    """
    Répondre à une invitation de réunion
    """
    response_status = request.data.get('status')
    
    if response_status not in ['Accepted', 'Declined', 'Tentative']:
        return Response(
            {'error': 'Statut de réponse invalide'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        attendee = MeetingAttendee.objects.get(
            meeting_id=meeting_id,
            user=request.user
        )
        attendee.status = response_status
        attendee.responded_at = timezone.now()
        attendee.save()
        
        return Response({'message': f'Réponse enregistrée: {response_status}'})
    except MeetingAttendee.DoesNotExist:
        return Response(
            {'error': 'Invitation non trouvée'},
            status=status.HTTP_404_NOT_FOUND
        )
