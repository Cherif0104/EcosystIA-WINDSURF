"""
Configuration admin pour les cours
"""

from django.contrib import admin
from .models import Course, Module, Lesson, CourseEnrollment, CourseProgress


class LessonInline(admin.TabularInline):
    model = Lesson
    extra = 0
    fields = ['title', 'type', 'duration', 'order', 'is_completed']


class ModuleInline(admin.TabularInline):
    model = Module
    extra = 0
    fields = ['title', 'description', 'order']


@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = ['title', 'instructor', 'category', 'difficulty', 'price', 'is_published', 'created_at']
    list_filter = ['category', 'difficulty', 'is_published', 'created_at']
    search_fields = ['title', 'description', 'instructor__username']
    inlines = [ModuleInline]
    readonly_fields = ['created_at', 'updated_at']


@admin.register(Module)
class ModuleAdmin(admin.ModelAdmin):
    list_display = ['title', 'course', 'order', 'created_at']
    list_filter = ['created_at']
    search_fields = ['title', 'course__title']
    inlines = [LessonInline]


@admin.register(Lesson)
class LessonAdmin(admin.ModelAdmin):
    list_display = ['title', 'module', 'type', 'duration', 'order', 'is_completed']
    list_filter = ['type', 'is_completed', 'created_at']
    search_fields = ['title', 'module__title', 'module__course__title']


@admin.register(CourseEnrollment)
class CourseEnrollmentAdmin(admin.ModelAdmin):
    list_display = ['user', 'course', 'status', 'enrolled_at', 'completed_at']
    list_filter = ['status', 'enrolled_at']
    search_fields = ['user__username', 'course__title']


@admin.register(CourseProgress)
class CourseProgressAdmin(admin.ModelAdmin):
    list_display = ['user', 'course', 'overall_progress', 'last_accessed', 'completed_at']
    list_filter = ['overall_progress', 'completed_at']
    search_fields = ['user__username', 'course__title']