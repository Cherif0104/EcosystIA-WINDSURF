"""
Serializers pour la gestion des réunions
"""

from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Meeting, MeetingAttendee, MeetingAction, MeetingTemplate

User = get_user_model()


class UserBasicSerializer(serializers.ModelSerializer):
    """Serializer basique pour les utilisateurs"""
    full_name = serializers.CharField(source='get_full_name', read_only=True)
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'full_name', 'avatar']
        read_only_fields = ['id', 'username', 'email', 'full_name', 'avatar']


class MeetingAttendeeSerializer(serializers.ModelSerializer):
    """Serializer pour les participants aux réunions"""
    user = UserBasicSerializer(read_only=True)
    user_id = serializers.IntegerField(write_only=True)
    attendance_duration_minutes = serializers.ReadOnlyField()
    
    class Meta:
        model = MeetingAttendee
        fields = [
            'id', 'user', 'user_id', 'status', 'role', 'joined_at', 'left_at', 
            'is_present', 'notes', 'invited_at', 'responded_at', 'attendance_duration_minutes'
        ]
        read_only_fields = ['id', 'invited_at', 'attendance_duration_minutes']


class MeetingActionSerializer(serializers.ModelSerializer):
    """Serializer pour les actions de réunions"""
    assigned_to = UserBasicSerializer(read_only=True)
    assigned_to_id = serializers.IntegerField(write_only=True)
    created_by = UserBasicSerializer(read_only=True)
    is_overdue = serializers.ReadOnlyField()
    
    class Meta:
        model = MeetingAction
        fields = [
            'id', 'title', 'description', 'status', 'priority', 'assigned_to', 
            'assigned_to_id', 'created_by', 'due_date', 'completed_date', 
            'created_at', 'updated_at', 'is_overdue'
        ]
        read_only_fields = ['id', 'created_by', 'created_at', 'updated_at', 'is_overdue']


class MeetingSerializer(serializers.ModelSerializer):
    """Serializer pour les réunions"""
    organizer = UserBasicSerializer(read_only=True)
    attendees_details = MeetingAttendeeSerializer(source='meetingattendee_set', many=True, read_only=True)
    actions = MeetingActionSerializer(many=True, read_only=True)
    attendee_ids = serializers.ListField(child=serializers.IntegerField(), write_only=True, required=False)
    
    # Propriétés calculées
    duration_minutes = serializers.ReadOnlyField()
    is_past = serializers.ReadOnlyField()
    is_today = serializers.ReadOnlyField()
    attendees_count = serializers.ReadOnlyField()
    
    class Meta:
        model = Meeting
        fields = [
            'id', 'title', 'description', 'type', 'status', 'priority',
            'start_datetime', 'end_datetime', 'timezone', 'organizer',
            'attendees_details', 'attendee_ids', 'location', 'meeting_url',
            'meeting_id', 'meeting_password', 'agenda', 'notes', 'recording_url',
            'is_recurring', 'recurrence_pattern', 'recurrence_end_date',
            'parent_meeting', 'created_at', 'updated_at', 'actual_start_time',
            'actual_end_time', 'attendance_rate', 'actions', 'duration_minutes',
            'is_past', 'is_today', 'attendees_count'
        ]
        read_only_fields = [
            'id', 'organizer', 'created_at', 'updated_at', 'duration_minutes',
            'is_past', 'is_today', 'attendees_count'
        ]
    
    def create(self, validated_data):
        attendee_ids = validated_data.pop('attendee_ids', [])
        validated_data['organizer'] = self.context['request'].user
        
        meeting = Meeting.objects.create(**validated_data)
        
        # Ajouter les participants
        for user_id in attendee_ids:
            try:
                user = User.objects.get(id=user_id)
                MeetingAttendee.objects.create(
                    meeting=meeting,
                    user=user,
                    status='Invited'
                )
            except User.DoesNotExist:
                continue
        
        return meeting
    
    def update(self, instance, validated_data):
        attendee_ids = validated_data.pop('attendee_ids', None)
        
        # Mettre à jour les champs de base
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        # Mettre à jour les participants si fournis
        if attendee_ids is not None:
            # Supprimer les anciens participants
            instance.meetingattendee_set.all().delete()
            
            # Ajouter les nouveaux participants
            for user_id in attendee_ids:
                try:
                    user = User.objects.get(id=user_id)
                    MeetingAttendee.objects.create(
                        meeting=instance,
                        user=user,
                        status='Invited'
                    )
                except User.DoesNotExist:
                    continue
        
        return instance


class MeetingTemplateSerializer(serializers.ModelSerializer):
    """Serializer pour les modèles de réunions"""
    created_by = UserBasicSerializer(read_only=True)
    default_attendees = UserBasicSerializer(many=True, read_only=True)
    default_attendee_ids = serializers.ListField(child=serializers.IntegerField(), write_only=True, required=False)
    
    class Meta:
        model = MeetingTemplate
        fields = [
            'id', 'name', 'description', 'type', 'default_duration_minutes',
            'default_agenda', 'default_location', 'default_attendees',
            'default_attendee_ids', 'created_by', 'created_at', 'updated_at',
            'is_active'
        ]
        read_only_fields = ['id', 'created_by', 'created_at', 'updated_at']
    
    def create(self, validated_data):
        default_attendee_ids = validated_data.pop('default_attendee_ids', [])
        validated_data['created_by'] = self.context['request'].user
        
        template = MeetingTemplate.objects.create(**validated_data)
        
        # Ajouter les participants par défaut
        if default_attendee_ids:
            users = User.objects.filter(id__in=default_attendee_ids)
            template.default_attendees.set(users)
        
        return template
    
    def update(self, instance, validated_data):
        default_attendee_ids = validated_data.pop('default_attendee_ids', None)
        
        # Mettre à jour les champs de base
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        # Mettre à jour les participants par défaut si fournis
        if default_attendee_ids is not None:
            users = User.objects.filter(id__in=default_attendee_ids)
            instance.default_attendees.set(users)
        
        return instance


class MeetingListSerializer(serializers.ModelSerializer):
    """Serializer allégé pour la liste des réunions"""
    organizer = UserBasicSerializer(read_only=True)
    attendees_count = serializers.ReadOnlyField()
    duration_minutes = serializers.ReadOnlyField()
    is_past = serializers.ReadOnlyField()
    is_today = serializers.ReadOnlyField()
    
    class Meta:
        model = Meeting
        fields = [
            'id', 'title', 'type', 'status', 'priority', 'start_datetime',
            'end_datetime', 'organizer', 'location', 'attendees_count',
            'duration_minutes', 'is_past', 'is_today'
        ]


class MeetingStatsSerializer(serializers.Serializer):
    """Serializer pour les statistiques des réunions"""
    total_meetings = serializers.IntegerField()
    meetings_this_week = serializers.IntegerField()
    meetings_this_month = serializers.IntegerField()
    average_duration = serializers.FloatField()
    attendance_rate = serializers.FloatField()
    meetings_by_type = serializers.DictField()
    meetings_by_status = serializers.DictField()
