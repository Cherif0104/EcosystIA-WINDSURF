"""
Vues pour le CRM
"""

from rest_framework import generics, status, filters
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.exceptions import PermissionDenied
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q, Count, Sum, Avg, F, Case, When, DecimalField
from django.utils import timezone
from django.http import HttpResponse
import csv
import json
from datetime import datetime, timedelta

from apps.core.throttling import ContactImportRateThrottle

from .models import Contact, ContactInteraction, Deal, ContactTag
from .serializers import (
    ContactListSerializer,
    ContactDetailSerializer,
    ContactCreateUpdateSerializer,
    ContactInteractionSerializer,
    ContactInteractionCreateUpdateSerializer,
    DealSerializer,
    ContactTagSerializer,
    ContactStatsSerializer,
    ContactImportSerializer,
    ContactExportSerializer,
    BulkContactActionSerializer
)
from .filters import ContactFilter, DealFilter


class ContactListCreateView(generics.ListCreateAPIView):
    """
    Vue pour lister et créer des contacts
    """
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = ContactFilter
    search_fields = ['name', 'work_email', 'company', 'job_title', 'city']
    ordering_fields = ['created_at', 'updated_at', 'name', 'company', 'last_contact_date']
    ordering = ['-created_at']
    
    def get_queryset(self):
        # Filtrer les contacts créés par l'utilisateur ou assignés à lui
        return Contact.objects.filter(
            Q(created_by=self.request.user) |
            Q(assigned_to=self.request.user)
        ).distinct().select_related('assigned_to', 'created_by').prefetch_related('interactions', 'deals')
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return ContactCreateUpdateSerializer
        return ContactListSerializer
    
    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)


class ContactDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Vue pour récupérer, modifier et supprimer un contact
    """
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Contact.objects.filter(
            Q(created_by=self.request.user) |
            Q(assigned_to=self.request.user)
        ).distinct().select_related('assigned_to', 'created_by').prefetch_related(
            'interactions__user',
            'deals__user'
        )
    
    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return ContactCreateUpdateSerializer
        return ContactDetailSerializer


class ContactInteractionsView(generics.ListCreateAPIView):
    """
    Vue pour lister et créer des interactions avec un contact
    """
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['subject', 'description']
    ordering_fields = ['created_at', 'type', 'result']
    ordering = ['-created_at']
    
    def get_queryset(self):
        contact_id = self.kwargs.get('contact_id')
        return ContactInteraction.objects.filter(
            contact_id=contact_id,
            contact__created_by=self.request.user
        ).select_related('user', 'contact')
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return ContactInteractionCreateUpdateSerializer
        return ContactInteractionSerializer
    
    def perform_create(self, serializer):
        contact_id = self.kwargs.get('contact_id')
        # Vérifier que l'utilisateur a accès au contact
        try:
            contact = Contact.objects.get(
                id=contact_id,
                created_by=self.request.user
            )
        except Contact.DoesNotExist:
            raise PermissionDenied("Vous n'avez pas accès à ce contact.")
        
        interaction = serializer.save(
            contact=contact,
            user=self.request.user
        )
        
        # Mettre à jour la date de dernier contact
        contact.last_contact_date = timezone.now()
        contact.contact_count = F('contact_count') + 1
        contact.save()


class InteractionDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Vue pour récupérer, modifier et supprimer une interaction
    """
    serializer_class = ContactInteractionCreateUpdateSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return ContactInteraction.objects.filter(
            contact__created_by=self.request.user
        ).select_related('user', 'contact')


class ContactDealsView(generics.ListCreateAPIView):
    """
    Vue pour lister et créer des opportunités pour un contact
    """
    serializer_class = DealSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'description']
    ordering_fields = ['created_at', 'value', 'expected_close_date', 'stage']
    ordering = ['-created_at']
    
    def get_queryset(self):
        contact_id = self.kwargs.get('contact_id')
        return Deal.objects.filter(
            contact_id=contact_id,
            contact__created_by=self.request.user
        ).select_related('user', 'contact')
    
    def perform_create(self, serializer):
        contact_id = self.kwargs.get('contact_id')
        # Vérifier que l'utilisateur a accès au contact
        try:
            contact = Contact.objects.get(
                id=contact_id,
                created_by=self.request.user
            )
        except Contact.DoesNotExist:
            raise PermissionDenied("Vous n'avez pas accès à ce contact.")
        
        serializer.save(
            contact=contact,
            user=self.request.user
        )


class DealListView(generics.ListAPIView):
    """
    Vue pour lister toutes les opportunités de l'utilisateur
    """
    serializer_class = DealSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = DealFilter
    search_fields = ['name', 'description', 'contact__name', 'contact__company']
    ordering_fields = ['created_at', 'value', 'expected_close_date', 'stage', 'probability']
    ordering = ['-created_at']
    
    def get_queryset(self):
        return Deal.objects.filter(
            user=self.request.user
        ).select_related('user', 'contact')


class DealDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Vue pour récupérer, modifier et supprimer une opportunité
    """
    serializer_class = DealSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Deal.objects.filter(
            user=self.request.user
        ).select_related('user', 'contact')


class ContactTagsView(generics.ListCreateAPIView):
    """
    Vue pour lister et créer des tags de contact
    """
    queryset = ContactTag.objects.all()
    serializer_class = ContactTagSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'description']
    ordering_fields = ['created_at', 'name']
    ordering = ['name']


class ContactTagDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Vue pour récupérer, modifier et supprimer un tag
    """
    queryset = ContactTag.objects.all()
    serializer_class = ContactTagSerializer
    permission_classes = [IsAuthenticated]


class ContactStatsView(APIView):
    """
    Vue pour les statistiques CRM
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        # Contacts de l'utilisateur
        user_contacts = Contact.objects.filter(
            Q(created_by=request.user) |
            Q(assigned_to=request.user)
        ).distinct()
        
        # Statistiques des contacts
        total_contacts = user_contacts.count()
        leads_count = user_contacts.filter(status='Lead').count()
        prospects_count = user_contacts.filter(status='Prospect').count()
        customers_count = user_contacts.filter(status='Customer').count()
        lost_count = user_contacts.filter(status='Lost').count()
        
        # Statistiques des interactions
        total_interactions = ContactInteraction.objects.filter(
            contact__in=user_contacts
        ).count()
        
        # Statistiques des opportunités
        user_deals = Deal.objects.filter(user=request.user)
        total_deals = user_deals.count()
        total_deal_value = user_deals.aggregate(
            total=Sum('value')
        )['total'] or 0
        
        won_deals = user_deals.filter(stage='Closed Won')
        won_deals_count = won_deals.count()
        won_deals_value = won_deals.aggregate(
            total=Sum('value')
        )['total'] or 0
        
        avg_deal_value = user_deals.aggregate(
            avg=Avg('value')
        )['avg'] or 0
        
        # Taux de conversion
        conversion_rate = (customers_count / total_contacts * 100) if total_contacts > 0 else 0
        
        # Répartition par source
        contacts_by_source = dict(
            user_contacts.values('source').annotate(
                count=Count('id')
            ).values_list('source', 'count')
        )
        
        # Répartition des opportunités par étape
        deals_by_stage = dict(
            user_deals.values('stage').annotate(
                count=Count('id')
            ).values_list('stage', 'count')
        )
        
        stats = {
            'total_contacts': total_contacts,
            'leads_count': leads_count,
            'prospects_count': prospects_count,
            'customers_count': customers_count,
            'lost_count': lost_count,
            'total_interactions': total_interactions,
            'total_deals': total_deals,
            'total_deal_value': total_deal_value,
            'won_deals_count': won_deals_count,
            'won_deals_value': won_deals_value,
            'avg_deal_value': avg_deal_value,
            'conversion_rate': round(conversion_rate, 2),
            'contacts_by_source': contacts_by_source,
            'deals_by_stage': deals_by_stage,
        }
        
        serializer = ContactStatsSerializer(stats)
        return Response(serializer.data)


class BulkContactActionView(APIView):
    """
    Vue pour les actions en masse sur les contacts
    """
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        serializer = BulkContactActionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        contact_ids = serializer.validated_data['contact_ids']
        action = serializer.validated_data['action']
        
        # Vérifier que l'utilisateur a accès à tous les contacts
        contacts = Contact.objects.filter(
            id__in=contact_ids,
            created_by=request.user
        )
        
        if contacts.count() != len(contact_ids):
            return Response(
                {'error': 'Vous n\'avez pas accès à tous les contacts spécifiés.'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Exécuter l'action
        updated_count = 0
        
        if action == 'assign':
            assigned_to_id = serializer.validated_data.get('assigned_to_id')
            updated_count = contacts.update(assigned_to_id=assigned_to_id)
            
        elif action == 'update_status':
            new_status = serializer.validated_data.get('status')
            updated_count = contacts.update(status=new_status)
            
        elif action == 'add_tag':
            tag = serializer.validated_data.get('tag')
            for contact in contacts:
                if tag not in contact.tags:
                    contact.tags.append(tag)
                    contact.save()
                    updated_count += 1
                    
        elif action == 'remove_tag':
            tag = serializer.validated_data.get('tag')
            for contact in contacts:
                if tag in contact.tags:
                    contact.tags.remove(tag)
                    contact.save()
                    updated_count += 1
                    
        elif action == 'delete':
            updated_count = contacts.count()
            contacts.delete()
        
        return Response({
            'message': f'Action "{action}" exécutée sur {updated_count} contact(s).',
            'updated_count': updated_count
        })


class ContactImportView(APIView):
    """
    Vue pour importer des contacts depuis un fichier
    """
    permission_classes = [IsAuthenticated]
    throttle_classes = [ContactImportRateThrottle]
    
    def post(self, request):
        serializer = ContactImportSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        file = serializer.validated_data['file']
        
        # Traitement du fichier (simplifié)
        imported_count = 0
        errors = []
        
        try:
            if file.name.endswith('.csv'):
                # Traitement CSV
                import csv
                import io
                
                file_content = file.read().decode('utf-8')
                csv_reader = csv.DictReader(io.StringIO(file_content))
                
                for row_num, row in enumerate(csv_reader, start=2):
                    try:
                        # Validation et création du contact
                        contact_data = {
                            'name': row.get('name', ''),
                            'work_email': row.get('work_email', ''),
                            'company': row.get('company', ''),
                            'job_title': row.get('job_title', ''),
                            'office_phone': row.get('office_phone', ''),
                            'city': row.get('city', ''),
                            'country': row.get('country', 'Sénégal'),
                            'created_by': request.user
                        }
                        
                        if contact_data['name'] and contact_data['work_email']:
                            Contact.objects.create(**contact_data)
                            imported_count += 1
                        else:
                            errors.append(f"Ligne {row_num}: Nom et email requis")
                            
                    except Exception as e:
                        errors.append(f"Ligne {row_num}: {str(e)}")
            
            return Response({
                'message': f'{imported_count} contact(s) importé(s) avec succès.',
                'imported_count': imported_count,
                'errors': errors[:10]  # Limiter les erreurs affichées
            })
            
        except Exception as e:
            return Response(
                {'error': f'Erreur lors de l\'import: {str(e)}'},
                status=status.HTTP_400_BAD_REQUEST
            )


class ContactExportView(APIView):
    """
    Vue pour exporter des contacts
    """
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        serializer = ContactExportSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        export_format = serializer.validated_data.get('format', 'csv')
        filters = serializer.validated_data.get('filters', {})
        fields = serializer.validated_data.get('fields', [
            'name', 'work_email', 'company', 'job_title', 'status',
            'office_phone', 'city', 'country', 'created_at'
        ])
        
        # Récupérer les contacts à exporter
        contacts = Contact.objects.filter(
            Q(created_by=request.user) |
            Q(assigned_to=request.user)
        ).distinct()
        
        # Appliquer les filtres si fournis
        if filters.get('status'):
            contacts = contacts.filter(status=filters['status'])
        if filters.get('source'):
            contacts = contacts.filter(source=filters['source'])
        if filters.get('company'):
            contacts = contacts.filter(company__icontains=filters['company'])
        
        # Export CSV
        if export_format == 'csv':
            response = HttpResponse(content_type='text/csv')
            response['Content-Disposition'] = f'attachment; filename="contacts_{timezone.now().strftime("%Y%m%d")}.csv"'
            
            writer = csv.writer(response)
            writer.writerow(fields)
            
            for contact in contacts:
                row = []
                for field in fields:
                    value = getattr(contact, field, '')
                    if field == 'created_at' and value:
                        value = value.strftime('%Y-%m-%d %H:%M:%S')
                    row.append(str(value))
                writer.writerow(row)
            
            return response
        
        return Response({'error': 'Format d\'export non supporté'}, 
                       status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_data(request):
    """
    Vue pour récupérer les données du dashboard CRM
    """
    # Contacts récents
    recent_contacts = Contact.objects.filter(
        Q(created_by=request.user) |
        Q(assigned_to=request.user)
    ).distinct().order_by('-created_at')[:5]
    
    # Interactions récentes
    recent_interactions = ContactInteraction.objects.filter(
        contact__created_by=request.user
    ).order_by('-created_at')[:5]
    
    # Opportunités urgentes (échéance proche)
    urgent_deals = Deal.objects.filter(
        user=request.user,
        expected_close_date__lte=timezone.now().date() + timedelta(days=7),
        stage__in=['Qualified', 'Proposal', 'Negotiation']
    ).order_by('expected_close_date')[:5]
    
    # Contacts à relancer (pas de contact depuis 30 jours)
    follow_up_contacts = Contact.objects.filter(
        Q(created_by=request.user) |
        Q(assigned_to=request.user),
        last_contact_date__lt=timezone.now() - timedelta(days=30)
    ).distinct().order_by('last_contact_date')[:5]
    
    data = {
        'recent_contacts': ContactListSerializer(recent_contacts, many=True).data,
        'recent_interactions': ContactInteractionSerializer(recent_interactions, many=True).data,
        'urgent_deals': DealSerializer(urgent_deals, many=True).data,
        'follow_up_contacts': ContactListSerializer(follow_up_contacts, many=True).data,
    }
    
    return Response(data)
