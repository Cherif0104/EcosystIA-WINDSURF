"""
Sérialiseurs pour la gestion des projets
"""

from rest_framework import serializers
from .models import Project, Task, Risk, ProjectTeam
from apps.users.models import User


class TaskSerializer(serializers.ModelSerializer):
    assignee_name = serializers.SerializerMethodField()
    
    class Meta:
        model = Task
        fields = [
            'id', 'text', 'status', 'priority', 'assignee', 'assignee_name',
            'estimated_time', 'logged_time', 'due_date', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_assignee_name(self, obj):
        return obj.assignee.get_full_name() if obj.assignee else None


class RiskSerializer(serializers.ModelSerializer):
    class Meta:
        model = Risk
        fields = [
            'id', 'description', 'likelihood', 'impact', 
            'mitigation_strategy', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class ProjectTeamSerializer(serializers.ModelSerializer):
    user_name = serializers.SerializerMethodField()
    role_display = serializers.SerializerMethodField()
    
    class Meta:
        model = ProjectTeam
        fields = ['id', 'user', 'user_name', 'role', 'role_display', 'joined_at']
        read_only_fields = ['id', 'joined_at']
    
    def get_user_name(self, obj):
        return obj.user.get_full_name()
    
    def get_role_display(self, obj):
        return obj.get_role_display()


class ProjectSerializer(serializers.ModelSerializer):
    tasks = TaskSerializer(many=True, read_only=True)
    risks = RiskSerializer(many=True, read_only=True)
    team = ProjectTeamSerializer(many=True, read_only=True)
    owner_name = serializers.SerializerMethodField()
    
    class Meta:
        model = Project
        fields = [
            'id', 'title', 'description', 'status', 'due_date', 'progress',
            'owner', 'owner_name', 'created_at', 'updated_at',
            'tasks', 'risks', 'team'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_owner_name(self, obj):
        return obj.owner.get_full_name()
    
    def create(self, validated_data):
        validated_data['owner'] = self.context['request'].user
        return super().create(validated_data)