"""
Vues pour le suivi du temps avec logique métier réelle
"""

from rest_framework import generics, status, filters
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q, Sum, Count, Avg, F, Case, When
from django.utils import timezone
from datetime import datetime, timedelta, date
import calendar

from .models import TimeLog, TimeSession, Meeting, WorkSchedule, TimeOff
from .serializers import (
    TimeLogSerializer,
    TimeLogCreateUpdateSerializer,
    TimeSessionSerializer,
    TimeSessionCreateSerializer,
    MeetingSerializer,
    WorkScheduleSerializer,
    TimeOffSerializer,
    TimeOffCreateSerializer,
    TimeStatsSerializer,
    WeeklyTimeReportSerializer,
    MonthlyTimeReportSerializer,
    TimerActionSerializer,
    BulkTimeLogSerializer,
    TimeOffApprovalSerializer
)
from .filters import TimeLogFilter, MeetingFilter, TimeOffFilter


class TimeLogListCreateView(generics.ListCreateAPIView):
    """
    Vue pour lister et créer des logs de temps
    """
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = TimeLogFilter
    search_fields = ['entity_title', 'description']
    ordering_fields = ['date', 'duration', 'created_at']
    ordering = ['-date', '-created_at']
    
    def get_queryset(self):
        return TimeLog.objects.filter(
            user=self.request.user
        ).select_related('user')
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return TimeLogCreateUpdateSerializer
        return TimeLogSerializer
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class TimeLogDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Vue pour récupérer, modifier et supprimer un log de temps
    """
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return TimeLog.objects.filter(user=self.request.user)
    
    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return TimeLogCreateUpdateSerializer
        return TimeLogSerializer


class TimeSessionView(APIView):
    """
    Vue pour gérer les sessions de temps (timer)
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        """Récupérer la session active de l'utilisateur"""
        try:
            session = TimeSession.objects.get(
                user=request.user,
                is_active=True
            )
            serializer = TimeSessionSerializer(session)
            return Response(serializer.data)
        except TimeSession.DoesNotExist:
            return Response({
                'active_session': None,
                'message': 'Aucune session active'
            })
    
    def post(self, request):
        """Démarrer une nouvelle session"""
        serializer = TimeSessionCreateSerializer(
            data=request.data,
            context={'request': request}
        )
        serializer.is_valid(raise_exception=True)
        session = serializer.save()
        
        return Response({
            'message': 'Session démarrée avec succès.',
            'session': TimeSessionSerializer(session).data
        }, status=status.HTTP_201_CREATED)
    
    def patch(self, request):
        """Arrêter la session active"""
        try:
            session = TimeSession.objects.get(
                user=request.user,
                is_active=True
            )
        except TimeSession.DoesNotExist:
            return Response(
                {'error': 'Aucune session active trouvée.'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        description = request.data.get('description', '')
        time_log = session.stop_session(description)
        
        return Response({
            'message': 'Session arrêtée avec succès.',
            'time_log': TimeLogSerializer(time_log).data,
            'duration_minutes': session.duration_minutes
        })


class TimerActionView(APIView):
    """
    Vue pour les actions du timer (start/stop/pause/resume)
    """
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        serializer = TimerActionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        action = serializer.validated_data['action']
        user = request.user
        
        if action == 'start':
            # Vérifier qu'il n'y a pas de session active
            if TimeSession.objects.filter(user=user, is_active=True).exists():
                return Response(
                    {'error': 'Une session est déjà active.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Créer une nouvelle session
            session = TimeSession.objects.create(
                user=user,
                entity_type=serializer.validated_data['entity_type'],
                entity_id=serializer.validated_data['entity_id'],
                entity_title=serializer.validated_data['entity_title'],
                description=serializer.validated_data.get('description', ''),
                is_billable=serializer.validated_data.get('is_billable', False),
                start_time=timezone.now()
            )
            
            return Response({
                'message': 'Timer démarré.',
                'session': TimeSessionSerializer(session).data
            })
        
        elif action == 'stop':
            try:
                session = TimeSession.objects.get(user=user, is_active=True)
                time_log = session.stop_session(
                    serializer.validated_data.get('description')
                )
                
                return Response({
                    'message': 'Timer arrêté.',
                    'time_log': TimeLogSerializer(time_log).data,
                    'total_minutes': session.duration_minutes
                })
            except TimeSession.DoesNotExist:
                return Response(
                    {'error': 'Aucune session active.'},
                    status=status.HTTP_404_NOT_FOUND
                )


class MeetingListCreateView(generics.ListCreateAPIView):
    """
    Vue pour lister et créer des réunions
    """
    serializer_class = MeetingSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = MeetingFilter
    search_fields = ['title', 'description', 'location']
    ordering_fields = ['start_time', 'duration', 'created_at']
    ordering = ['-start_time']
    
    def get_queryset(self):
        # Réunions organisées par l'utilisateur ou auxquelles il participe
        return Meeting.objects.filter(
            Q(organizer=self.request.user) |
            Q(attendees=self.request.user)
        ).distinct().select_related('organizer', 'project').prefetch_related('attendees')
    
    def perform_create(self, serializer):
        serializer.save(organizer=self.request.user)


class MeetingDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Vue pour récupérer, modifier et supprimer une réunion
    """
    serializer_class = MeetingSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        # Seul l'organisateur peut modifier/supprimer
        return Meeting.objects.filter(
            organizer=self.request.user
        ).select_related('organizer', 'project').prefetch_related('attendees')


class WorkScheduleView(generics.ListCreateAPIView):
    """
    Vue pour gérer les horaires de travail
    """
    serializer_class = WorkScheduleSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return WorkSchedule.objects.filter(
            user=self.request.user
        ).order_by('weekday')
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class WorkScheduleDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Vue pour modifier un horaire de travail spécifique
    """
    serializer_class = WorkScheduleSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return WorkSchedule.objects.filter(user=self.request.user)


class TimeOffListCreateView(generics.ListCreateAPIView):
    """
    Vue pour lister et créer des demandes de congé
    """
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = TimeOffFilter
    search_fields = ['reason', 'notes']
    ordering_fields = ['start_date', 'created_at', 'status']
    ordering = ['-created_at']
    
    def get_queryset(self):
        return TimeOff.objects.filter(
            user=self.request.user
        ).select_related('user', 'approved_by')
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return TimeOffCreateSerializer
        return TimeOffSerializer
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class TimeOffDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Vue pour récupérer, modifier et supprimer une demande de congé
    """
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return TimeOff.objects.filter(
            user=self.request.user
        ).select_related('user', 'approved_by')
    
    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return TimeOffCreateSerializer
        return TimeOffSerializer


class TimeOffApprovalView(APIView):
    """
    Vue pour approuver/rejeter les demandes de congé
    """
    permission_classes = [IsAuthenticated]
    
    def post(self, request, time_off_id):
        serializer = TimeOffApprovalSerializer(
            data=request.data,
            context={'request': request, 'time_off_id': time_off_id}
        )
        serializer.is_valid(raise_exception=True)
        
        action = serializer.validated_data['action']
        notes = serializer.validated_data.get('notes', '')
        
        try:
            time_off = TimeOff.objects.get(id=time_off_id)
        except TimeOff.DoesNotExist:
            return Response(
                {'error': 'Demande de congé introuvable.'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        if action == 'approve':
            time_off.approve(request.user)
            message = 'Demande de congé approuvée.'
        else:
            time_off.reject(request.user)
            message = 'Demande de congé rejetée.'
        
        if notes:
            time_off.notes = notes
            time_off.save()
        
        return Response({
            'message': message,
            'time_off': TimeOffSerializer(time_off).data
        })


class TimeStatsView(APIView):
    """
    Vue pour les statistiques de temps
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        user = request.user
        today = timezone.now().date()
        
        # Temps aujourd'hui
        today_logs = TimeLog.objects.filter(user=user, date=today)
        today_hours = sum(log.hours_decimal for log in today_logs)
        today_logs_count = today_logs.count()
        
        # Temps cette semaine
        start_week = today - timedelta(days=today.weekday())
        end_week = start_week + timedelta(days=6)
        week_logs = TimeLog.objects.filter(
            user=user,
            date__range=[start_week, end_week]
        )
        week_hours = sum(log.hours_decimal for log in week_logs)
        week_logs_count = week_logs.count()
        
        # Temps ce mois
        start_month = today.replace(day=1)
        end_month = (start_month + timedelta(days=32)).replace(day=1) - timedelta(days=1)
        month_logs = TimeLog.objects.filter(
            user=user,
            date__range=[start_month, end_month]
        )
        month_hours = sum(log.hours_decimal for log in month_logs)
        month_logs_count = month_logs.count()
        
        # Répartition par entité
        time_by_entity = list(
            month_logs.values('entity_type', 'entity_title').annotate(
                total_minutes=Sum('duration'),
                total_hours=Sum('duration') / 60.0,
                logs_count=Count('id')
            ).order_by('-total_minutes')
        )
        
        # Sessions actives
        active_sessions_count = TimeSession.objects.filter(
            user=user,
            is_active=True
        ).count()
        
        # Réunions
        meetings_today = Meeting.objects.filter(
            Q(organizer=user) | Q(attendees=user),
            start_time__date=today
        ).distinct().count()
        
        meetings_week = Meeting.objects.filter(
            Q(organizer=user) | Q(attendees=user),
            start_time__date__range=[start_week, end_week]
        ).distinct().count()
        
        # Congés
        pending_time_offs = TimeOff.objects.filter(
            user=user,
            status='Pending'
        ).count()
        
        approved_time_offs_this_month = TimeOff.objects.filter(
            user=user,
            status='Approved',
            start_date__range=[start_month, end_month]
        ).count()
        
        stats = {
            'today_hours': today_hours,
            'today_logs_count': today_logs_count,
            'week_hours': week_hours,
            'week_logs_count': week_logs_count,
            'month_hours': month_hours,
            'month_logs_count': month_logs_count,
            'time_by_entity': time_by_entity,
            'active_sessions_count': active_sessions_count,
            'meetings_today': meetings_today,
            'meetings_week': meetings_week,
            'pending_time_offs': pending_time_offs,
            'approved_time_offs_this_month': approved_time_offs_this_month,
        }
        
        serializer = TimeStatsSerializer(stats)
        return Response(serializer.data)


class WeeklyReportView(APIView):
    """
    Vue pour le rapport hebdomadaire
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        user = request.user
        
        # Récupérer la semaine (par défaut: semaine actuelle)
        week_start_str = request.GET.get('week_start')
        if week_start_str:
            try:
                week_start = datetime.strptime(week_start_str, '%Y-%m-%d').date()
            except ValueError:
                return Response(
                    {'error': 'Format de date invalide. Utilisez YYYY-MM-DD.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
        else:
            today = timezone.now().date()
            week_start = today - timedelta(days=today.weekday())
        
        week_end = week_start + timedelta(days=6)
        
        # Logs de la semaine
        week_logs = TimeLog.objects.filter(
            user=user,
            date__range=[week_start, week_end]
        ).order_by('date')
        
        total_hours = sum(log.hours_decimal for log in week_logs)
        
        # Répartition quotidienne
        daily_breakdown = []
        for i in range(7):
            day = week_start + timedelta(days=i)
            day_logs = week_logs.filter(date=day)
            day_hours = sum(log.hours_decimal for log in day_logs)
            
            daily_breakdown.append({
                'date': day.isoformat(),
                'weekday': calendar.day_name[day.weekday()],
                'hours': day_hours,
                'logs_count': day_logs.count()
            })
        
        # Répartition par entité
        entity_breakdown = list(
            week_logs.values('entity_type', 'entity_title').annotate(
                total_minutes=Sum('duration'),
                total_hours=Sum('duration') / 60.0,
                logs_count=Count('id')
            ).order_by('-total_minutes')
        )
        
        # Heures facturables vs non-facturables (si applicable)
        billable_hours = sum(log.billable_amount for log in week_logs if log.billable_amount > 0)
        non_billable_hours = total_hours - billable_hours
        
        report = {
            'week_start': week_start,
            'week_end': week_end,
            'total_hours': total_hours,
            'daily_breakdown': daily_breakdown,
            'entity_breakdown': entity_breakdown,
            'billable_hours': billable_hours,
            'non_billable_hours': non_billable_hours,
        }
        
        serializer = WeeklyTimeReportSerializer(report)
        return Response(serializer.data)


class MonthlyReportView(APIView):
    """
    Vue pour le rapport mensuel
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        user = request.user
        
        # Récupérer le mois (par défaut: mois actuel)
        year = int(request.GET.get('year', timezone.now().year))
        month = int(request.GET.get('month', timezone.now().month))
        
        try:
            month_start = date(year, month, 1)
            month_end = (month_start + timedelta(days=32)).replace(day=1) - timedelta(days=1)
        except ValueError:
            return Response(
                {'error': 'Mois ou année invalide.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Logs du mois
        month_logs = TimeLog.objects.filter(
            user=user,
            date__range=[month_start, month_end]
        )
        
        total_hours = sum(log.hours_decimal for log in month_logs)
        
        # Jours ouvrables du mois
        working_days = 0
        current_date = month_start
        while current_date <= month_end:
            if current_date.weekday() < 5:  # Lundi à Vendredi
                working_days += 1
            current_date += timedelta(days=1)
        
        average_daily_hours = total_hours / working_days if working_days > 0 else 0
        
        # Répartition hebdomadaire
        weekly_breakdown = []
        current_week_start = month_start
        while current_week_start <= month_end:
            current_week_end = min(current_week_start + timedelta(days=6), month_end)
            
            week_logs = month_logs.filter(
                date__range=[current_week_start, current_week_end]
            )
            week_hours = sum(log.hours_decimal for log in week_logs)
            
            weekly_breakdown.append({
                'week_start': current_week_start.isoformat(),
                'week_end': current_week_end.isoformat(),
                'hours': week_hours,
                'logs_count': week_logs.count()
            })
            
            current_week_start += timedelta(days=7)
        
        # Répartition par projet
        project_breakdown = list(
            month_logs.filter(entity_type='project').values('entity_title').annotate(
                total_hours=Sum('duration') / 60.0,
                logs_count=Count('id')
            ).order_by('-total_hours')
        )
        
        # Heures supplémentaires (si horaire défini)
        expected_hours = working_days * 8  # 8h par jour par défaut
        overtime_hours = max(0, total_hours - expected_hours)
        
        # Jours de congé ce mois
        time_off_days = TimeOff.objects.filter(
            user=user,
            status='Approved',
            start_date__lte=month_end,
            end_date__gte=month_start
        ).aggregate(
            total_days=Sum('duration_days')
        )['total_days'] or 0
        
        report = {
            'month': calendar.month_name[month],
            'year': year,
            'total_hours': total_hours,
            'working_days': working_days,
            'average_daily_hours': round(average_daily_hours, 2),
            'weekly_breakdown': weekly_breakdown,
            'project_breakdown': project_breakdown,
            'overtime_hours': overtime_hours,
            'time_off_days': time_off_days,
        }
        
        serializer = MonthlyTimeReportSerializer(report)
        return Response(serializer.data)


class BulkTimeLogView(APIView):
    """
    Vue pour l'import en masse de logs de temps
    """
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        serializer = BulkTimeLogSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        time_logs_data = serializer.validated_data['time_logs']
        created_logs = []
        errors = []
        
        for i, log_data in enumerate(time_logs_data):
            try:
                log_serializer = TimeLogCreateUpdateSerializer(
                    data=log_data,
                    context={'request': request}
                )
                if log_serializer.is_valid():
                    time_log = log_serializer.save(user=request.user)
                    created_logs.append(time_log)
                else:
                    errors.append(f"Log {i+1}: {log_serializer.errors}")
            except Exception as e:
                errors.append(f"Log {i+1}: {str(e)}")
        
        return Response({
            'message': f'{len(created_logs)} log(s) créé(s) avec succès.',
            'created_count': len(created_logs),
            'errors': errors,
            'created_logs': TimeLogSerializer(created_logs, many=True).data
        })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_data(request):
    """
    Vue pour les données du dashboard de suivi du temps
    """
    user = request.user
    today = timezone.now().date()
    
    # Session active
    active_session = None
    try:
        session = TimeSession.objects.get(user=user, is_active=True)
        active_session = TimeSessionSerializer(session).data
    except TimeSession.DoesNotExist:
        pass
    
    # Logs récents
    recent_logs = TimeLog.objects.filter(
        user=user
    ).order_by('-created_at')[:5]
    
    # Réunions d'aujourd'hui
    today_meetings = Meeting.objects.filter(
        Q(organizer=user) | Q(attendees=user),
        start_time__date=today
    ).distinct().order_by('start_time')[:5]
    
    # Réunions à venir (7 prochains jours)
    upcoming_meetings = Meeting.objects.filter(
        Q(organizer=user) | Q(attendees=user),
        start_time__date__range=[today + timedelta(days=1), today + timedelta(days=7)]
    ).distinct().order_by('start_time')[:5]
    
    # Congés en attente d'approbation
    pending_time_offs = TimeOff.objects.filter(
        user=user,
        status='Pending'
    ).order_by('start_date')[:3]
    
    data = {
        'active_session': active_session,
        'recent_logs': TimeLogSerializer(recent_logs, many=True).data,
        'today_meetings': MeetingSerializer(today_meetings, many=True).data,
        'upcoming_meetings': MeetingSerializer(upcoming_meetings, many=True).data,
        'pending_time_offs': TimeOffSerializer(pending_time_offs, many=True).data,
    }
    
    return Response(data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def team_time_overview(request):
    """
    Vue pour la vue d'ensemble du temps de l'équipe (managers)
    """
    user = request.user
    
    # Vérifier les permissions
    if not user.role in ['manager', 'supervisor', 'administrator', 'super_administrator']:
        return Response(
            {'error': 'Permissions insuffisantes.'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    # Récupérer l'équipe (simplification: tous les utilisateurs)
    team_members = User.objects.filter(is_active=True)
    
    today = timezone.now().date()
    start_week = today - timedelta(days=today.weekday())
    
    team_stats = []
    for member in team_members:
        # Temps cette semaine
        week_logs = TimeLog.objects.filter(
            user=member,
            date__range=[start_week, today]
        )
        week_hours = sum(log.hours_decimal for log in week_logs)
        
        # Session active
        has_active_session = TimeSession.objects.filter(
            user=member,
            is_active=True
        ).exists()
        
        team_stats.append({
            'user': {
                'id': member.id,
                'full_name': member.get_full_name(),
                'avatar': member.avatar,
                'role': member.role
            },
            'week_hours': week_hours,
            'has_active_session': has_active_session,
            'last_activity': member.last_activity.isoformat() if member.last_activity else None
        })
    
    # Trier par heures de la semaine
    team_stats.sort(key=lambda x: x['week_hours'], reverse=True)
    
    return Response({
        'team_stats': team_stats,
        'week_start': start_week.isoformat(),
        'total_team_hours': sum(stat['week_hours'] for stat in team_stats),
        'active_members': sum(1 for stat in team_stats if stat['has_active_session'])
    })
