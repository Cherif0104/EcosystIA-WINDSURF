"""
Administration pour les analytics
"""

from django.contrib import admin
from django.utils.html import format_html
from .models import DashboardWidget, MetricSnapshot, AnalyticsReport


@admin.register(DashboardWidget)
class DashboardWidgetAdmin(admin.ModelAdmin):
    list_display = ['title', 'user', 'widget_type', 'data_source', 'is_active', 'created_at']
    list_filter = ['widget_type', 'data_source', 'is_active', 'created_at']
    search_fields = ['title', 'user__username', 'data_source']
    readonly_fields = ['created_at', 'updated_at']


@admin.register(MetricSnapshot)
class MetricSnapshotAdmin(admin.ModelAdmin):
    list_display = ['metric_name', 'metric_type', 'value', 'user', 'date', 'created_at']
    list_filter = ['metric_type', 'date', 'created_at']
    search_fields = ['metric_name', 'user__username']
    readonly_fields = ['created_at']
    date_hierarchy = 'date'


@admin.register(AnalyticsReport)
class AnalyticsReportAdmin(admin.ModelAdmin):
    list_display = ['name', 'report_type', 'period_display', 'generated_by', 'generated_at']
    list_filter = ['report_type', 'generated_at']
    search_fields = ['name', 'generated_by__username']
    readonly_fields = ['generated_at', 'data']
    
    def period_display(self, obj):
        return f"{obj.start_date} → {obj.end_date}"
    period_display.short_description = 'Période'
