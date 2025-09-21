"""
Serializers pour le CRM
"""

from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.utils import timezone
from .models import Contact, ContactInteraction, Deal, ContactTag

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


class ContactTagSerializer(serializers.ModelSerializer):
    """
    Serializer pour les tags de contact
    """
    class Meta:
        model = ContactTag
        fields = ['id', 'name', 'color', 'description', 'created_at']
        read_only_fields = ['id', 'created_at']


class ContactInteractionSerializer(serializers.ModelSerializer):
    """
    Serializer pour les interactions avec les contacts
    """
    user = UserBasicSerializer(read_only=True)
    type_display = serializers.CharField(source='get_type_display', read_only=True)
    result_display = serializers.CharField(source='get_result_display', read_only=True)
    contact_name = serializers.CharField(source='contact.name', read_only=True)
    
    class Meta:
        model = ContactInteraction
        fields = [
            'id', 'user', 'contact_name', 'type', 'type_display',
            'result', 'result_display', 'subject', 'description',
            'follow_up_date', 'follow_up_notes', 'duration',
            'created_at'
        ]
        read_only_fields = ['id', 'user', 'created_at']


class ContactInteractionCreateUpdateSerializer(ContactInteractionSerializer):
    """
    Serializer pour créer/modifier des interactions
    """
    contact_id = serializers.IntegerField(write_only=True, required=False)
    
    class Meta(ContactInteractionSerializer.Meta):
        fields = ContactInteractionSerializer.Meta.fields + ['contact_id']


class DealSerializer(serializers.ModelSerializer):
    """
    Serializer pour les opportunités
    """
    user = UserBasicSerializer(read_only=True)
    contact = serializers.StringRelatedField(read_only=True)
    contact_id = serializers.IntegerField(write_only=True, required=False)
    stage_display = serializers.CharField(source='get_stage_display', read_only=True)
    expected_value = serializers.SerializerMethodField()
    is_overdue = serializers.SerializerMethodField()
    
    class Meta:
        model = Deal
        fields = [
            'id', 'name', 'description', 'contact', 'contact_id',
            'user', 'stage', 'stage_display', 'value', 'currency',
            'probability', 'expected_value', 'expected_close_date',
            'actual_close_date', 'is_overdue', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'user', 'created_at', 'updated_at']
    
    def get_expected_value(self, obj):
        """Calcule la valeur espérée (valeur * probabilité)"""
        return float(obj.value * obj.probability / 100)
    
    def get_is_overdue(self, obj):
        """Vérifie si l'opportunité est en retard"""
        if obj.expected_close_date and obj.stage not in ['Closed Won', 'Closed Lost']:
            return obj.expected_close_date < timezone.now().date()
        return False
    
    def validate_contact_id(self, value):
        if value:
            try:
                Contact.objects.get(id=value)
                return value
            except Contact.DoesNotExist:
                raise serializers.ValidationError("Contact introuvable.")
        return value


class ContactListSerializer(serializers.ModelSerializer):
    """
    Serializer pour la liste des contacts (vue simplifiée)
    """
    assigned_to = UserBasicSerializer(read_only=True)
    created_by = UserBasicSerializer(read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    source_display = serializers.CharField(source='get_source_display', read_only=True)
    interactions_count = serializers.SerializerMethodField()
    deals_count = serializers.SerializerMethodField()
    last_interaction = serializers.SerializerMethodField()
    days_since_last_contact = serializers.SerializerMethodField()
    
    class Meta:
        model = Contact
        fields = [
            'id', 'name', 'work_email', 'company', 'job_title',
            'status', 'status_display', 'source', 'source_display',
            'office_phone', 'mobile_phone', 'city', 'country',
            'assigned_to', 'created_by', 'avatar', 'tags',
            'interactions_count', 'deals_count', 'last_interaction',
            'days_since_last_contact', 'created_at', 'updated_at',
            'last_contact_date'
        ]
        read_only_fields = [
            'id', 'created_by', 'created_at', 'updated_at',
            'interactions_count', 'deals_count', 'last_interaction',
            'days_since_last_contact'
        ]
    
    def get_interactions_count(self, obj):
        return obj.interactions.count()
    
    def get_deals_count(self, obj):
        return obj.deals.count()
    
    def get_last_interaction(self, obj):
        last_interaction = obj.interactions.order_by('-created_at').first()
        if last_interaction:
            return {
                'id': last_interaction.id,
                'type': last_interaction.type,
                'type_display': last_interaction.get_type_display(),
                'result': last_interaction.result,
                'created_at': last_interaction.created_at
            }
        return None
    
    def get_days_since_last_contact(self, obj):
        if obj.last_contact_date:
            delta = timezone.now().date() - obj.last_contact_date.date()
            return delta.days
        return None


class ContactDetailSerializer(serializers.ModelSerializer):
    """
    Serializer détaillé pour un contact
    """
    assigned_to = UserBasicSerializer(read_only=True)
    created_by = UserBasicSerializer(read_only=True)
    interactions = ContactInteractionSerializer(many=True, read_only=True)
    deals = DealSerializer(many=True, read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    source_display = serializers.CharField(source='get_source_display', read_only=True)
    
    # Statistiques
    interactions_count = serializers.SerializerMethodField()
    deals_count = serializers.SerializerMethodField()
    total_deal_value = serializers.SerializerMethodField()
    won_deals_count = serializers.SerializerMethodField()
    last_interaction = serializers.SerializerMethodField()
    days_since_last_contact = serializers.SerializerMethodField()
    
    class Meta:
        model = Contact
        fields = [
            'id', 'name', 'work_email', 'personal_email', 'company',
            'job_title', 'status', 'status_display', 'source',
            'source_display', 'office_phone', 'mobile_phone',
            'whatsapp_number', 'address', 'city', 'country',
            'avatar', 'notes', 'tags', 'assigned_to', 'created_by',
            'interactions', 'deals', 'interactions_count', 'deals_count',
            'total_deal_value', 'won_deals_count', 'last_interaction',
            'days_since_last_contact', 'created_at', 'updated_at',
            'last_contact_date', 'contact_count'
        ]
        read_only_fields = [
            'id', 'created_by', 'created_at', 'updated_at',
            'interactions_count', 'deals_count', 'total_deal_value',
            'won_deals_count', 'last_interaction', 'days_since_last_contact'
        ]
    
    def get_interactions_count(self, obj):
        return obj.interactions.count()
    
    def get_deals_count(self, obj):
        return obj.deals.count()
    
    def get_total_deal_value(self, obj):
        return sum(deal.value for deal in obj.deals.all())
    
    def get_won_deals_count(self, obj):
        return obj.deals.filter(stage='Closed Won').count()
    
    def get_last_interaction(self, obj):
        last_interaction = obj.interactions.order_by('-created_at').first()
        if last_interaction:
            return ContactInteractionSerializer(last_interaction).data
        return None
    
    def get_days_since_last_contact(self, obj):
        if obj.last_contact_date:
            delta = timezone.now().date() - obj.last_contact_date.date()
            return delta.days
        return None


class ContactCreateUpdateSerializer(serializers.ModelSerializer):
    """
    Serializer pour créer/modifier des contacts
    """
    assigned_to_id = serializers.IntegerField(write_only=True, required=False, allow_null=True)
    
    class Meta:
        model = Contact
        fields = [
            'name', 'work_email', 'personal_email', 'company',
            'job_title', 'status', 'source', 'office_phone',
            'mobile_phone', 'whatsapp_number', 'address', 'city',
            'country', 'avatar', 'notes', 'tags', 'assigned_to_id'
        ]
    
    def validate_assigned_to_id(self, value):
        if value is not None:
            try:
                User.objects.get(id=value)
                return value
            except User.DoesNotExist:
                raise serializers.ValidationError("Utilisateur assigné introuvable.")
        return value
    
    def validate_work_email(self, value):
        # Vérifier l'unicité de l'email de travail
        if self.instance:
            if Contact.objects.filter(work_email=value).exclude(id=self.instance.id).exists():
                raise serializers.ValidationError("Un contact avec cet email existe déjà.")
        else:
            if Contact.objects.filter(work_email=value).exists():
                raise serializers.ValidationError("Un contact avec cet email existe déjà.")
        return value
    
    def create(self, validated_data):
        assigned_to_id = validated_data.pop('assigned_to_id', None)
        contact = Contact.objects.create(**validated_data)
        
        if assigned_to_id:
            contact.assigned_to_id = assigned_to_id
            contact.save()
        
        return contact
    
    def update(self, instance, validated_data):
        assigned_to_id = validated_data.pop('assigned_to_id', None)
        
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        
        if assigned_to_id is not None:
            instance.assigned_to_id = assigned_to_id
        
        instance.save()
        return instance


class ContactStatsSerializer(serializers.Serializer):
    """
    Serializer pour les statistiques CRM
    """
    total_contacts = serializers.IntegerField()
    leads_count = serializers.IntegerField()
    prospects_count = serializers.IntegerField()
    customers_count = serializers.IntegerField()
    lost_count = serializers.IntegerField()
    total_interactions = serializers.IntegerField()
    total_deals = serializers.IntegerField()
    total_deal_value = serializers.DecimalField(max_digits=15, decimal_places=2)
    won_deals_count = serializers.IntegerField()
    won_deals_value = serializers.DecimalField(max_digits=15, decimal_places=2)
    avg_deal_value = serializers.DecimalField(max_digits=15, decimal_places=2)
    conversion_rate = serializers.FloatField()
    contacts_by_source = serializers.DictField()
    deals_by_stage = serializers.DictField()


class ContactImportSerializer(serializers.Serializer):
    """
    Serializer pour l'import de contacts en masse
    """
    file = serializers.FileField()
    
    def validate_file(self, value):
        if not value.name.endswith(('.csv', '.xlsx', '.xls')):
            raise serializers.ValidationError(
                "Seuls les fichiers CSV et Excel sont acceptés."
            )
        
        if value.size > 5 * 1024 * 1024:  # 5MB
            raise serializers.ValidationError(
                "Le fichier ne peut pas dépasser 5MB."
            )
        
        return value


class ContactExportSerializer(serializers.Serializer):
    """
    Serializer pour l'export de contacts
    """
    format = serializers.ChoiceField(choices=['csv', 'excel'], default='csv')
    filters = serializers.JSONField(required=False)
    fields = serializers.ListField(
        child=serializers.CharField(),
        required=False,
        help_text="Liste des champs à exporter"
    )


class BulkContactActionSerializer(serializers.Serializer):
    """
    Serializer pour les actions en masse sur les contacts
    """
    ACTION_CHOICES = [
        ('assign', 'Assigner'),
        ('update_status', 'Changer le statut'),
        ('add_tag', 'Ajouter un tag'),
        ('remove_tag', 'Supprimer un tag'),
        ('delete', 'Supprimer'),
    ]
    
    contact_ids = serializers.ListField(
        child=serializers.IntegerField(),
        min_length=1
    )
    action = serializers.ChoiceField(choices=ACTION_CHOICES)
    
    # Paramètres optionnels selon l'action
    assigned_to_id = serializers.IntegerField(required=False, allow_null=True)
    status = serializers.ChoiceField(choices=Contact.STATUS_CHOICES, required=False)
    tag = serializers.CharField(required=False)
    
    def validate_contact_ids(self, value):
        # Vérifier que tous les contacts existent
        existing_contacts = Contact.objects.filter(id__in=value).count()
        if existing_contacts != len(value):
            raise serializers.ValidationError(
                "Un ou plusieurs contacts spécifiés n'existent pas."
            )
        return value
    
    def validate(self, attrs):
        action = attrs.get('action')
        
        if action == 'assign' and not attrs.get('assigned_to_id'):
            raise serializers.ValidationError(
                "L'ID de l'utilisateur assigné est requis pour l'action 'assign'."
            )
        
        if action == 'update_status' and not attrs.get('status'):
            raise serializers.ValidationError(
                "Le statut est requis pour l'action 'update_status'."
            )
        
        if action in ['add_tag', 'remove_tag'] and not attrs.get('tag'):
            raise serializers.ValidationError(
                "Le tag est requis pour les actions de tag."
            )
        
        return attrs
