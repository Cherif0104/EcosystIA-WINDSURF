"""
Sérialiseurs pour la gestion des cours
"""

from rest_framework import serializers
from .models import Course, Module, Lesson, CourseEnrollment, CourseProgress


class LessonSerializer(serializers.ModelSerializer):
    class Meta:
        model = Lesson
        fields = [
            'id', 'title', 'type', 'duration', 'icon', 'content',
            'order', 'is_completed', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']


class ModuleSerializer(serializers.ModelSerializer):
    lessons = LessonSerializer(many=True, read_only=True)
    progress = serializers.SerializerMethodField()
    
    class Meta:
        model = Module
        fields = [
            'id', 'title', 'description', 'order', 'lessons', 'progress'
        ]
        read_only_fields = ['id']
    
    def get_progress(self, obj):
        # Calculer le pourcentage de progression du module
        total_lessons = obj.lessons.count()
        if total_lessons == 0:
            return 0
        completed_lessons = obj.lessons.filter(is_completed=True).count()
        return int((completed_lessons / total_lessons) * 100)


class CourseProgressSerializer(serializers.ModelSerializer):
    class Meta:
        model = CourseProgress
        fields = ['id', 'user', 'course', 'overall_progress', 'last_accessed', 'completed_at']


class CourseSerializer(serializers.ModelSerializer):
    modules = ModuleSerializer(many=True, read_only=True)
    instructor_name = serializers.SerializerMethodField()
    enrollment_status = serializers.SerializerMethodField()
    
    class Meta:
        model = Course
        fields = [
            'id', 'title', 'description', 'instructor', 'instructor_name',
            'duration', 'difficulty', 'category', 'price', 'is_published',
            'modules', 'enrollment_status', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_instructor_name(self, obj):
        return obj.instructor.get_full_name()
    
    def get_enrollment_status(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            try:
                enrollment = CourseEnrollment.objects.get(
                    user=request.user, course=obj
                )
                return enrollment.status
            except CourseEnrollment.DoesNotExist:
                return 'not_enrolled'
        return 'not_enrolled'


class CourseEnrollmentSerializer(serializers.ModelSerializer):
    user_name = serializers.SerializerMethodField()
    course_title = serializers.SerializerMethodField()
    
    class Meta:
        model = CourseEnrollment
        fields = [
            'id', 'user', 'user_name', 'course', 'course_title',
            'status', 'enrolled_at', 'completed_at'
        ]
        read_only_fields = ['id', 'enrolled_at']
    
    def get_user_name(self, obj):
        return obj.user.get_full_name()
    
    def get_course_title(self, obj):
        return obj.course.title