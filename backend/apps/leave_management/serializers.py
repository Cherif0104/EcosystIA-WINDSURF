"""
Serializers pour la gestion des congés
"""

from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import LeaveType, LeaveBalance, LeaveRequest

User = get_user_model()


class LeaveTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = LeaveType
        fields = '__all__'


class LeaveBalanceSerializer(serializers.ModelSerializer):
    leave_type = LeaveTypeSerializer(read_only=True)
    remaining_days = serializers.IntegerField(read_only=True)
    
    class Meta:
        model = LeaveBalance
        fields = ['id', 'leave_type', 'year', 'allocated_days', 'used_days', 'pending_days', 'remaining_days']


class LeaveRequestSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField(read_only=True)
    leave_type = LeaveTypeSerializer(read_only=True)
    approved_by = serializers.StringRelatedField(read_only=True)
    duration_days = serializers.IntegerField(read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    
    class Meta:
        model = LeaveRequest
        fields = [
            'id', 'user', 'leave_type', 'status', 'status_display',
            'start_date', 'end_date', 'duration_days', 'reason', 'notes',
            'approved_by', 'approved_at', 'rejection_reason', 'created_at'
        ]
