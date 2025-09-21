"""
Sérialiseurs pour la gestion des emplois
"""

from rest_framework import serializers
from .models import Job, JobApplication


class JobSerializer(serializers.ModelSerializer):
    """
    Sérialiseur pour les emplois
    """
    company_name = serializers.SerializerMethodField()
    applicants_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Job
        fields = [
            'id', 'title', 'description', 'company', 'company_name',
            'location', 'salary_min', 'salary_max', 'job_type',
            'experience_level', 'skills_required', 'is_active',
            'posted_at', 'applicants_count'
        ]
        read_only_fields = ['id', 'posted_at']
    
    def get_company_name(self, obj):
        return obj.company.name if obj.company else None
    
    def get_applicants_count(self, obj):
        return obj.applications.count()


class JobApplicationSerializer(serializers.ModelSerializer):
    """
    Sérialiseur pour les candidatures
    """
    applicant_name = serializers.SerializerMethodField()
    job_title = serializers.SerializerMethodField()
    
    class Meta:
        model = JobApplication
        fields = [
            'id', 'job', 'job_title', 'applicant', 'applicant_name',
            'cover_letter', 'resume_url', 'status', 'applied_at'
        ]
        read_only_fields = ['id', 'applied_at']
    
    def get_applicant_name(self, obj):
        return obj.applicant.get_full_name()
    
    def get_job_title(self, obj):
        return obj.job.title