"""
Configuration des URLs principales pour EcosystIA
"""

from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.http import JsonResponse
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView, SpectacularRedocView

def health_check(request):
    """Endpoint de vérification de santé de l'API"""
    return JsonResponse({
        'status': 'healthy',
        'service': 'EcosystIA API',
        'version': '1.0.0',
        'environment': 'development' if settings.DEBUG else 'production'
    })

urlpatterns = [
    # Administration Django
    path('admin/', admin.site.urls),
    
    # Documentation API
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    path('api/redoc/', SpectacularRedocView.as_view(url_name='schema'), name='redoc'),
    
    # Health Check
    path('health/', health_check, name='health-check'),
    
    # API v1
    path('api/v1/auth/', include('apps.authentication.urls')),
    path('api/v1/users/', include('apps.users.urls')),
    path('api/v1/projects/', include('apps.projects.urls')),
    path('api/v1/courses/', include('apps.courses.urls')),
    path('api/v1/jobs/', include('apps.jobs.urls')),
    path('api/v1/crm/', include('apps.crm.urls')),
    path('api/v1/finance/', include('apps.finance.urls')),
    path('api/v1/analytics/', include('apps.analytics.urls')),
    path('api/v1/ai/', include('apps.ai.urls')),
    path('api/v1/knowledge/', include('apps.knowledge_base.urls')),
    path('api/v1/notifications/', include('apps.notifications.urls')),
    path('api/v1/time-tracking/', include('apps.time_tracking.urls')),
    path('api/v1/leave/', include('apps.leave_management.urls')),
    path('api/v1/meetings/', include('apps.meetings.urls')),
    path('api/v1/goals/', include('apps.goals.urls')),
    
    # OAuth2
    path('oauth/', include('oauth2_provider.urls', namespace='oauth2_provider')),
]

# Configuration des fichiers statiques et média en développement
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
    
    # Django Debug Toolbar
    if 'debug_toolbar' in settings.INSTALLED_APPS:
        import debug_toolbar
        urlpatterns = [
            path('__debug__/', include(debug_toolbar.urls)),
        ] + urlpatterns
