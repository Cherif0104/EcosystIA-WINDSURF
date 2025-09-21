"""
URLs pour le CRM
"""

from django.urls import path
from . import views

app_name = 'crm'

urlpatterns = [
    # Contacts
    path('contacts/', views.ContactListCreateView.as_view(), name='contact_list_create'),
    path('contacts/<int:pk>/', views.ContactDetailView.as_view(), name='contact_detail'),
    path('contacts/stats/', views.ContactStatsView.as_view(), name='contact_stats'),
    path('contacts/import/', views.ContactImportView.as_view(), name='contact_import'),
    path('contacts/export/', views.ContactExportView.as_view(), name='contact_export'),
    path('contacts/bulk-action/', views.BulkContactActionView.as_view(), name='bulk_contact_action'),
    path('dashboard/', views.dashboard_data, name='dashboard_data'),
    
    # Contact Interactions
    path('contacts/<int:contact_id>/interactions/', views.ContactInteractionsView.as_view(), name='contact_interactions'),
    path('interactions/<int:pk>/', views.InteractionDetailView.as_view(), name='interaction_detail'),
    
    # Contact Deals
    path('contacts/<int:contact_id>/deals/', views.ContactDealsView.as_view(), name='contact_deals'),
    path('deals/', views.DealListView.as_view(), name='deal_list'),
    path('deals/<int:pk>/', views.DealDetailView.as_view(), name='deal_detail'),
    
    # Contact Tags
    path('tags/', views.ContactTagsView.as_view(), name='contact_tags'),
    path('tags/<int:pk>/', views.ContactTagDetailView.as_view(), name='contact_tag_detail'),
]