"""
Serializers pour le suivi du temps
"""

from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.utils import timezone
from datetime import datetime, timedelta
from .models import TimeLog, TimeSession, Meeting, WorkSchedule, TimeOff

User = get_user_model()


class UserBasicSerializer(serializers.ModelSerializer):
    """
    Serializer basique pour les utilisateurs
    """
    full_name = serializers.CharField(source='get_full_name', read_only=True)
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'full_name', 'avatar']
        read_only_fields = ['id', 'username', 'email', 'full_name', 'avatar']


class TimeLogSerializer(serializers.ModelSerializer):
    """
    Serializer pour les logs de temps
    """
    user = UserBasicSerializer(read_only=True)
    entity_type_display = serializers.CharField(source='get_entity_type_display', read_only=True)
    hours_decimal = serializers.FloatField(read_only=True)
    billable_amount = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    is_today = serializers.BooleanField(read_only=True)
    is_current_week = serializers.BooleanField(read_only=True)
    
    class Meta:
        model = TimeLog
        fields = [
            'id', 'user', 'entity_type', 'entity_type_display', 'entity_id',
            'entity_title', 'date', 'duration', 'hours_decimal', 'description',
            'billable_amount', 'is_today', 'is_current_week', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'user', 'created_at', 'updated_at', 'hours_decimal',
            'billable_amount', 'is_today', 'is_current_week'
        ]


class TimeLogCreateUpdateSerializer(serializers.ModelSerializer):
    """
    Serializer pour créer/modifier des logs de temps
    """
    class Meta:
        model = TimeLog
        fields = [
            'entity_type', 'entity_id', 'entity_title', 'date',
            'duration', 'description'
        ]
    
    def validate_duration(self, value):
        if value <= 0:
            raise serializers.ValidationError("La durée doit être positive.")
        if value > 1440:  # 24 heures max
            raise serializers.ValidationError("La durée ne peut pas dépasser 24 heures (1440 minutes).")
        return value
    
    def validate_date(self, value):
        if value > timezone.now().date():
            raise serializers.ValidationError("La date ne peut pas être dans le futur.")
        
        # Pas plus de 30 jours dans le passé
        if value < timezone.now().date() - timedelta(days=30):
            raise serializers.ValidationError("La date ne peut pas être antérieure à 30 jours.")
        
        return value
    
    def validate(self, attrs):
        # Vérifier que l'utilisateur n'a pas déjà trop d'heures ce jour-là
        user = self.context['request'].user
        date = attrs.get('date')
        duration = attrs.get('duration')
        
        if date and duration:
            existing_duration = TimeLog.objects.filter(
                user=user,
                date=date
            ).exclude(id=self.instance.id if self.instance else None).aggregate(
                total=models.Sum('duration')
            )['total'] or 0
            
            total_duration = existing_duration + duration
            if total_duration > 1440:  # 24 heures
                raise serializers.ValidationError(
                    f"Total des heures pour cette date dépasserait 24h. "
                    f"Déjà enregistré: {existing_duration}min, "
                    f"Nouveau: {duration}min, "
                    f"Total: {total_duration}min"
                )
        
        return attrs


class TimeSessionSerializer(serializers.ModelSerializer):
    """
    Serializer pour les sessions de temps actives
    """
    user = UserBasicSerializer(read_only=True)
    entity_type_display = serializers.CharField(source='get_entity_type_display', read_only=True)
    duration_minutes = serializers.IntegerField(read_only=True)
    duration_hours = serializers.FloatField(read_only=True)
    
    class Meta:
        model = TimeSession
        fields = [
            'id', 'user', 'entity_type', 'entity_type_display', 'entity_id',
            'entity_title', 'start_time', 'end_time', 'description',
            'is_active', 'is_billable', 'duration_minutes', 'duration_hours',
            'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'user', 'created_at', 'updated_at',
            'duration_minutes', 'duration_hours'
        ]


class TimeSessionCreateSerializer(serializers.ModelSerializer):
    """
    Serializer pour créer une session de temps
    """
    class Meta:
        model = TimeSession
        fields = [
            'entity_type', 'entity_id', 'entity_title', 'description', 'is_billable'
        ]
    
    def validate(self, attrs):
        # Vérifier qu'il n'y a pas déjà une session active pour cet utilisateur
        user = self.context['request'].user
        active_sessions = TimeSession.objects.filter(user=user, is_active=True)
        
        if active_sessions.exists():
            raise serializers.ValidationError(
                "Vous avez déjà une session active. Arrêtez-la avant d'en créer une nouvelle."
            )
        
        return attrs
    
    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        validated_data['start_time'] = timezone.now()
        return super().create(validated_data)


class MeetingSerializer(serializers.ModelSerializer):
    """
    Serializer pour les réunions
    """
    organizer = UserBasicSerializer(read_only=True)
    attendees = UserBasicSerializer(many=True, read_only=True)
    attendee_ids = serializers.ListField(
        child=serializers.IntegerField(),
        write_only=True,
        required=False
    )
    duration = serializers.IntegerField(read_only=True)
    project_title = serializers.CharField(source='project.title', read_only=True)
    
    class Meta:
        model = Meeting
        fields = [
            'id', 'title', 'description', 'start_time', 'end_time',
            'duration', 'organizer', 'attendees', 'attendee_ids',
            'location', 'meeting_url', 'agenda', 'project',
            'project_title', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'organizer', 'created_at', 'updated_at', 'duration']
    
    def validate(self, attrs):
        start_time = attrs.get('start_time')
        end_time = attrs.get('end_time')
        
        if start_time and end_time:
            if start_time >= end_time:
                raise serializers.ValidationError(
                    "L'heure de fin doit être postérieure à l'heure de début."
                )
            
            # Vérifier que la réunion ne dure pas plus de 8 heures
            duration = end_time - start_time
            if duration.total_seconds() > 8 * 3600:  # 8 heures
                raise serializers.ValidationError(
                    "Une réunion ne peut pas durer plus de 8 heures."
                )
        
        return attrs
    
    def validate_attendee_ids(self, value):
        if value:
            # Vérifier que tous les utilisateurs existent
            existing_users = User.objects.filter(id__in=value).count()
            if existing_users != len(value):
                raise serializers.ValidationError(
                    "Un ou plusieurs participants spécifiés n'existent pas."
                )
            
            # Limite de 50 participants
            if len(value) > 50:
                raise serializers.ValidationError(
                    "Maximum 50 participants autorisés."
                )
        
        return value
    
    def create(self, validated_data):
        attendee_ids = validated_data.pop('attendee_ids', [])
        meeting = super().create(validated_data)
        
        if attendee_ids:
            meeting.attendees.set(attendee_ids)
        
        return meeting
    
    def update(self, instance, validated_data):
        attendee_ids = validated_data.pop('attendee_ids', None)
        meeting = super().update(instance, validated_data)
        
        if attendee_ids is not None:
            meeting.attendees.set(attendee_ids)
        
        return meeting


class WorkScheduleSerializer(serializers.ModelSerializer):
    """
    Serializer pour les horaires de travail
    """
    user = UserBasicSerializer(read_only=True)
    weekday_display = serializers.CharField(source='get_weekday_display', read_only=True)
    daily_hours = serializers.FloatField(read_only=True)
    
    class Meta:
        model = WorkSchedule
        fields = [
            'id', 'user', 'weekday', 'weekday_display', 'start_time',
            'end_time', 'is_working_day', 'daily_hours', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'user', 'created_at', 'updated_at', 'daily_hours']
    
    def validate(self, attrs):
        weekday = attrs.get('weekday')
        start_time = attrs.get('start_time')
        end_time = attrs.get('end_time')
        is_working_day = attrs.get('is_working_day', True)
        
        if is_working_day and start_time and end_time:
            if start_time >= end_time:
                raise serializers.ValidationError(
                    "L'heure de fin doit être postérieure à l'heure de début."
                )
        
        # Vérifier l'unicité pour cet utilisateur et ce jour
        user = self.context['request'].user
        existing = WorkSchedule.objects.filter(user=user, weekday=weekday)
        if self.instance:
            existing = existing.exclude(id=self.instance.id)
        
        if existing.exists():
            raise serializers.ValidationError(
                f"Vous avez déjà un horaire configuré pour {dict(WorkSchedule.WEEKDAY_CHOICES)[weekday]}."
            )
        
        return attrs


class TimeOffSerializer(serializers.ModelSerializer):
    """
    Serializer pour les congés
    """
    user = UserBasicSerializer(read_only=True)
    approved_by = UserBasicSerializer(read_only=True)
    type_display = serializers.CharField(source='get_type_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    duration_days = serializers.IntegerField(read_only=True)
    
    class Meta:
        model = TimeOff
        fields = [
            'id', 'user', 'type', 'type_display', 'status', 'status_display',
            'start_date', 'end_date', 'duration_days', 'reason', 'notes',
            'approved_by', 'approved_at', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'user', 'approved_by', 'approved_at', 'created_at',
            'updated_at', 'duration_days'
        ]


class TimeOffCreateSerializer(serializers.ModelSerializer):
    """
    Serializer pour créer une demande de congé
    """
    class Meta:
        model = TimeOff
        fields = ['type', 'start_date', 'end_date', 'reason', 'notes']
    
    def validate(self, attrs):
        start_date = attrs.get('start_date')
        end_date = attrs.get('end_date')
        
        if start_date and end_date:
            if start_date > end_date:
                raise serializers.ValidationError(
                    "La date de début ne peut pas être postérieure à la date de fin."
                )
            
            # Pas de congé dans le passé (sauf aujourd'hui)
            if start_date < timezone.now().date():
                raise serializers.ValidationError(
                    "La date de début ne peut pas être dans le passé."
                )
            
            # Limite de durée (par exemple 30 jours consécutifs max)
            duration = (end_date - start_date).days + 1
            if duration > 30:
                raise serializers.ValidationError(
                    "La durée du congé ne peut pas dépasser 30 jours consécutifs."
                )
            
            # Vérifier les chevauchements
            user = self.context['request'].user
            overlapping = TimeOff.objects.filter(
                user=user,
                status__in=['Pending', 'Approved'],
                start_date__lte=end_date,
                end_date__gte=start_date
            )
            
            if self.instance:
                overlapping = overlapping.exclude(id=self.instance.id)
            
            if overlapping.exists():
                raise serializers.ValidationError(
                    "Cette période chevauche avec un congé existant."
                )
        
        return attrs


class TimeStatsSerializer(serializers.Serializer):
    """
    Serializer pour les statistiques de temps
    """
    # Temps aujourd'hui
    today_hours = serializers.FloatField()
    today_logs_count = serializers.IntegerField()
    
    # Temps cette semaine
    week_hours = serializers.FloatField()
    week_logs_count = serializers.IntegerField()
    
    # Temps ce mois
    month_hours = serializers.FloatField()
    month_logs_count = serializers.IntegerField()
    
    # Répartition par entité
    time_by_entity = serializers.ListField(child=serializers.DictField())
    
    # Sessions actives
    active_sessions_count = serializers.IntegerField()
    
    # Réunions
    meetings_today = serializers.IntegerField()
    meetings_week = serializers.IntegerField()
    
    # Congés
    pending_time_offs = serializers.IntegerField()
    approved_time_offs_this_month = serializers.IntegerField()


class WeeklyTimeReportSerializer(serializers.Serializer):
    """
    Serializer pour le rapport hebdomadaire
    """
    week_start = serializers.DateField()
    week_end = serializers.DateField()
    total_hours = serializers.FloatField()
    daily_breakdown = serializers.ListField(child=serializers.DictField())
    entity_breakdown = serializers.ListField(child=serializers.DictField())
    billable_hours = serializers.FloatField()
    non_billable_hours = serializers.FloatField()


class MonthlyTimeReportSerializer(serializers.Serializer):
    """
    Serializer pour le rapport mensuel
    """
    month = serializers.CharField()
    year = serializers.IntegerField()
    total_hours = serializers.FloatField()
    working_days = serializers.IntegerField()
    average_daily_hours = serializers.FloatField()
    weekly_breakdown = serializers.ListField(child=serializers.DictField())
    project_breakdown = serializers.ListField(child=serializers.DictField())
    overtime_hours = serializers.FloatField()
    time_off_days = serializers.IntegerField()


class TimerActionSerializer(serializers.Serializer):
    """
    Serializer pour les actions du timer
    """
    ACTION_CHOICES = [
        ('start', 'Démarrer'),
        ('stop', 'Arrêter'),
        ('pause', 'Pause'),
        ('resume', 'Reprendre'),
    ]
    
    action = serializers.ChoiceField(choices=ACTION_CHOICES)
    entity_type = serializers.CharField(required=False)
    entity_id = serializers.CharField(required=False)
    entity_title = serializers.CharField(required=False)
    description = serializers.CharField(required=False, allow_blank=True)
    is_billable = serializers.BooleanField(required=False, default=False)
    
    def validate(self, attrs):
        action = attrs.get('action')
        
        if action == 'start':
            required_fields = ['entity_type', 'entity_id', 'entity_title']
            for field in required_fields:
                if not attrs.get(field):
                    raise serializers.ValidationError(
                        f"Le champ '{field}' est requis pour démarrer une session."
                    )
        
        return attrs


class BulkTimeLogSerializer(serializers.Serializer):
    """
    Serializer pour l'import en masse de logs de temps
    """
    time_logs = serializers.ListField(
        child=serializers.DictField(),
        min_length=1,
        max_length=100  # Limite de 100 logs par import
    )
    
    def validate_time_logs(self, value):
        errors = []
        
        for i, log_data in enumerate(value):
            try:
                # Valider chaque log individuellement
                serializer = TimeLogCreateUpdateSerializer(data=log_data)
                if not serializer.is_valid():
                    errors.append(f"Log {i+1}: {serializer.errors}")
            except Exception as e:
                errors.append(f"Log {i+1}: {str(e)}")
        
        if errors:
            raise serializers.ValidationError(errors)
        
        return value


class TimeOffApprovalSerializer(serializers.Serializer):
    """
    Serializer pour approuver/rejeter les congés
    """
    action = serializers.ChoiceField(choices=['approve', 'reject'])
    notes = serializers.CharField(required=False, allow_blank=True)
    
    def validate(self, attrs):
        time_off_id = self.context.get('time_off_id')
        user = self.context['request'].user
        
        try:
            time_off = TimeOff.objects.get(id=time_off_id)
        except TimeOff.DoesNotExist:
            raise serializers.ValidationError("Demande de congé introuvable.")
        
        if time_off.status != 'Pending':
            raise serializers.ValidationError(
                "Cette demande a déjà été traitée."
            )
        
        # Vérifier les permissions (manager, admin, etc.)
        if not user.is_staff and not user.role in ['manager', 'supervisor', 'administrator']:
            raise serializers.ValidationError(
                "Vous n'avez pas les permissions pour approuver des congés."
            )
        
        return attrs
