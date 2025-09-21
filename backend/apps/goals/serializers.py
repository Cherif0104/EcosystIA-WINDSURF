"""
Serializers pour la gestion des objectifs OKR
"""

from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.utils import timezone
from datetime import datetime, timedelta
from .models import Goal, KeyResult, GoalUpdate, GoalTemplate, GoalMilestone, OKRCycle

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


class KeyResultSerializer(serializers.ModelSerializer):
    """
    Serializer pour les résultats clés
    """
    created_by = UserBasicSerializer(read_only=True)
    assignee = UserBasicSerializer(read_only=True)
    assignee_id = serializers.IntegerField(write_only=True, required=False, allow_null=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    completion_percentage = serializers.FloatField(read_only=True)
    is_overdue = serializers.BooleanField(read_only=True)
    
    class Meta:
        model = KeyResult
        fields = [
            'id', 'title', 'description', 'status', 'status_display',
            'target_value', 'current_value', 'unit', 'progress',
            'completion_percentage', 'start_date', 'target_date',
            'completed_date', 'is_overdue', 'created_by', 'assignee',
            'assignee_id', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'created_by', 'created_at', 'updated_at',
            'completion_percentage', 'is_overdue', 'progress', 'completed_date'
        ]
    
    def validate_target_value(self, value):
        if value <= 0:
            raise serializers.ValidationError("La valeur cible doit être positive.")
        return value
    
    def validate_current_value(self, value):
        if value < 0:
            raise serializers.ValidationError("La valeur actuelle ne peut pas être négative.")
        return value
    
    def validate_assignee_id(self, value):
        if value is not None:
            try:
                User.objects.get(id=value)
                return value
            except User.DoesNotExist:
                raise serializers.ValidationError("Utilisateur assigné introuvable.")
        return value
    
    def update(self, instance, validated_data):
        assignee_id = validated_data.pop('assignee_id', None)
        
        # Vérifier si la valeur actuelle a changé
        old_current_value = instance.current_value
        new_current_value = validated_data.get('current_value', old_current_value)
        
        # Mettre à jour l'instance
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        
        if assignee_id is not None:
            instance.assignee_id = assignee_id
        
        # Mettre à jour la progression si la valeur a changé
        if new_current_value != old_current_value:
            instance.update_progress(new_current_value)
        else:
            instance.save()
        
        return instance


class GoalMilestoneSerializer(serializers.ModelSerializer):
    """
    Serializer pour les jalons d'objectifs
    """
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    is_overdue = serializers.BooleanField(read_only=True)
    
    class Meta:
        model = GoalMilestone
        fields = [
            'id', 'title', 'description', 'status', 'status_display',
            'target_date', 'completed_date', 'target_progress',
            'is_overdue', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'is_overdue']


class GoalUpdateSerializer(serializers.ModelSerializer):
    """
    Serializer pour les mises à jour d'objectifs
    """
    created_by = UserBasicSerializer(read_only=True)
    update_type_display = serializers.CharField(source='get_update_type_display', read_only=True)
    
    class Meta:
        model = GoalUpdate
        fields = [
            'id', 'update_type', 'update_type_display', 'title',
            'description', 'old_value', 'new_value', 'created_by', 'created_at'
        ]
        read_only_fields = ['id', 'created_by', 'created_at']


class GoalListSerializer(serializers.ModelSerializer):
    """
    Serializer pour la liste des objectifs
    """
    owner = UserBasicSerializer(read_only=True)
    assignees = UserBasicSerializer(many=True, read_only=True)
    type_display = serializers.CharField(source='get_type_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    priority_display = serializers.CharField(source='get_priority_display', read_only=True)
    completion_rate = serializers.FloatField(read_only=True)
    is_overdue = serializers.BooleanField(read_only=True)
    days_remaining = serializers.IntegerField(read_only=True)
    key_results_count = serializers.SerializerMethodField()
    completed_key_results_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Goal
        fields = [
            'id', 'title', 'description', 'type', 'type_display',
            'status', 'status_display', 'priority', 'priority_display',
            'start_date', 'target_date', 'completed_date', 'progress',
            'completion_rate', 'is_overdue', 'days_remaining', 'owner',
            'assignees', 'tags', 'key_results_count', 'completed_key_results_count',
            'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'owner', 'created_at', 'updated_at', 'completion_rate',
            'is_overdue', 'days_remaining', 'key_results_count',
            'completed_key_results_count'
        ]
    
    def get_key_results_count(self, obj):
        return obj.key_results.count()
    
    def get_completed_key_results_count(self, obj):
        return obj.key_results.filter(status='Completed').count()


class GoalDetailSerializer(serializers.ModelSerializer):
    """
    Serializer détaillé pour un objectif
    """
    owner = UserBasicSerializer(read_only=True)
    assignees = UserBasicSerializer(many=True, read_only=True)
    key_results = KeyResultSerializer(many=True, read_only=True)
    milestones = GoalMilestoneSerializer(many=True, read_only=True)
    updates = GoalUpdateSerializer(many=True, read_only=True)
    sub_goals = serializers.SerializerMethodField()
    parent_goal = serializers.StringRelatedField(read_only=True)
    
    # Displays
    type_display = serializers.CharField(source='get_type_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    priority_display = serializers.CharField(source='get_priority_display', read_only=True)
    
    # Computed fields
    completion_rate = serializers.FloatField(read_only=True)
    is_overdue = serializers.BooleanField(read_only=True)
    days_remaining = serializers.IntegerField(read_only=True)
    
    class Meta:
        model = Goal
        fields = [
            'id', 'title', 'description', 'type', 'type_display',
            'status', 'status_display', 'priority', 'priority_display',
            'start_date', 'target_date', 'completed_date', 'progress',
            'completion_rate', 'is_overdue', 'days_remaining', 'owner',
            'assignees', 'parent_goal', 'sub_goals', 'project', 'tags',
            'key_results', 'milestones', 'updates', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'owner', 'created_at', 'updated_at', 'completion_rate',
            'is_overdue', 'days_remaining'
        ]
    
    def get_sub_goals(self, obj):
        sub_goals = obj.sub_goals.all()
        return GoalListSerializer(sub_goals, many=True).data


class GoalCreateUpdateSerializer(serializers.ModelSerializer):
    """
    Serializer pour créer/modifier des objectifs
    """
    assignee_ids = serializers.ListField(
        child=serializers.IntegerField(),
        write_only=True,
        required=False
    )
    parent_goal_id = serializers.IntegerField(write_only=True, required=False, allow_null=True)
    project_id = serializers.IntegerField(write_only=True, required=False, allow_null=True)
    
    class Meta:
        model = Goal
        fields = [
            'title', 'description', 'type', 'status', 'priority',
            'start_date', 'target_date', 'tags', 'assignee_ids',
            'parent_goal_id', 'project_id'
        ]
    
    def validate(self, attrs):
        start_date = attrs.get('start_date')
        target_date = attrs.get('target_date')
        
        if start_date and target_date:
            if start_date > target_date:
                raise serializers.ValidationError(
                    "La date de début ne peut pas être postérieure à la date cible."
                )
            
            # Vérifier que l'objectif n'est pas trop long (max 2 ans)
            if (target_date - start_date).days > 730:
                raise serializers.ValidationError(
                    "Un objectif ne peut pas durer plus de 2 ans."
                )
        
        return attrs
    
    def validate_assignee_ids(self, value):
        if value:
            existing_users = User.objects.filter(id__in=value).count()
            if existing_users != len(value):
                raise serializers.ValidationError(
                    "Un ou plusieurs utilisateurs assignés n'existent pas."
                )
        return value
    
    def validate_parent_goal_id(self, value):
        if value is not None:
            try:
                Goal.objects.get(id=value)
                return value
            except Goal.DoesNotExist:
                raise serializers.ValidationError("Objectif parent introuvable.")
        return value
    
    def validate_project_id(self, value):
        if value is not None:
            from apps.projects.models import Project
            try:
                Project.objects.get(id=value)
                return value
            except Project.DoesNotExist:
                raise serializers.ValidationError("Projet introuvable.")
        return value
    
    def create(self, validated_data):
        assignee_ids = validated_data.pop('assignee_ids', [])
        parent_goal_id = validated_data.pop('parent_goal_id', None)
        project_id = validated_data.pop('project_id', None)
        
        goal = Goal.objects.create(**validated_data)
        
        if assignee_ids:
            goal.assignees.set(assignee_ids)
        
        if parent_goal_id:
            goal.parent_goal_id = parent_goal_id
            goal.save()
        
        if project_id:
            goal.project_id = project_id
            goal.save()
        
        return goal
    
    def update(self, instance, validated_data):
        assignee_ids = validated_data.pop('assignee_ids', None)
        parent_goal_id = validated_data.pop('parent_goal_id', None)
        project_id = validated_data.pop('project_id', None)
        
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        
        if assignee_ids is not None:
            instance.assignees.set(assignee_ids)
        
        if parent_goal_id is not None:
            instance.parent_goal_id = parent_goal_id
        
        if project_id is not None:
            instance.project_id = project_id
        
        instance.save()
        return instance


class OKRCycleSerializer(serializers.ModelSerializer):
    """
    Serializer pour les cycles OKR
    """
    owner = UserBasicSerializer(read_only=True)
    goals = GoalListSerializer(many=True, read_only=True)
    cycle_type_display = serializers.CharField(source='get_cycle_type_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    overall_progress = serializers.FloatField(read_only=True)
    is_current = serializers.BooleanField(read_only=True)
    goals_count = serializers.SerializerMethodField()
    completed_goals_count = serializers.SerializerMethodField()
    
    class Meta:
        model = OKRCycle
        fields = [
            'id', 'name', 'cycle_type', 'cycle_type_display', 'status',
            'status_display', 'start_date', 'end_date', 'description',
            'overall_progress', 'is_current', 'owner', 'goals',
            'goals_count', 'completed_goals_count', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'owner', 'created_at', 'updated_at', 'overall_progress',
            'is_current', 'goals_count', 'completed_goals_count'
        ]
    
    def get_goals_count(self, obj):
        return obj.goals.count()
    
    def get_completed_goals_count(self, obj):
        return obj.goals.filter(status='Completed').count()


class GoalTemplateSerializer(serializers.ModelSerializer):
    """
    Serializer pour les templates d'objectifs
    """
    created_by = UserBasicSerializer(read_only=True)
    category_display = serializers.CharField(source='get_category_display', read_only=True)
    
    class Meta:
        model = GoalTemplate
        fields = [
            'id', 'name', 'category', 'category_display', 'description',
            'goal_template', 'key_results_template', 'is_public',
            'created_by', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_by', 'created_at', 'updated_at']


class GoalProgressUpdateSerializer(serializers.Serializer):
    """
    Serializer pour mettre à jour la progression d'un objectif
    """
    progress = serializers.IntegerField(min_value=0, max_value=100)
    comment = serializers.CharField(required=False, allow_blank=True)
    
    def validate_progress(self, value):
        goal = self.context.get('goal')
        if goal and value < goal.progress:
            raise serializers.ValidationError(
                "La progression ne peut pas diminuer. "
                f"Progression actuelle: {goal.progress}%"
            )
        return value


class KeyResultProgressUpdateSerializer(serializers.Serializer):
    """
    Serializer pour mettre à jour la progression d'un résultat clé
    """
    current_value = serializers.DecimalField(max_digits=12, decimal_places=2, min_value=0)
    comment = serializers.CharField(required=False, allow_blank=True)
    
    def validate_current_value(self, value):
        key_result = self.context.get('key_result')
        if key_result and value > key_result.target_value * 2:  # Limite raisonnable
            raise serializers.ValidationError(
                f"La valeur semble trop élevée. Cible: {key_result.target_value}"
            )
        return value


class GoalStatsSerializer(serializers.Serializer):
    """
    Serializer pour les statistiques d'objectifs
    """
    total_goals = serializers.IntegerField()
    active_goals = serializers.IntegerField()
    completed_goals = serializers.IntegerField()
    overdue_goals = serializers.IntegerField()
    
    total_key_results = serializers.IntegerField()
    completed_key_results = serializers.IntegerField()
    
    average_completion_rate = serializers.FloatField()
    goals_by_type = serializers.ListField(child=serializers.DictField())
    goals_by_priority = serializers.ListField(child=serializers.DictField())
    
    upcoming_deadlines = serializers.ListField(child=serializers.DictField())
    recent_completions = serializers.ListField(child=serializers.DictField())


class OKRDashboardSerializer(serializers.Serializer):
    """
    Serializer pour le dashboard OKR
    """
    current_cycle = OKRCycleSerializer()
    my_goals = GoalListSerializer(many=True)
    team_goals = GoalListSerializer(many=True)
    recent_updates = GoalUpdateSerializer(many=True)
    upcoming_deadlines = GoalListSerializer(many=True)
    stats = GoalStatsSerializer()


class CreateGoalFromTemplateSerializer(serializers.Serializer):
    """
    Serializer pour créer un objectif à partir d'un template
    """
    template_id = serializers.IntegerField()
    title = serializers.CharField(max_length=200)
    start_date = serializers.DateField()
    target_date = serializers.DateField()
    assignee_ids = serializers.ListField(
        child=serializers.IntegerField(),
        required=False
    )
    
    def validate_template_id(self, value):
        try:
            GoalTemplate.objects.get(id=value)
            return value
        except GoalTemplate.DoesNotExist:
            raise serializers.ValidationError("Template introuvable.")
    
    def validate(self, attrs):
        start_date = attrs.get('start_date')
        target_date = attrs.get('target_date')
        
        if start_date and target_date and start_date > target_date:
            raise serializers.ValidationError(
                "La date de début ne peut pas être postérieure à la date cible."
            )
        
        return attrs
