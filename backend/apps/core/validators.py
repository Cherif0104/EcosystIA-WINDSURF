"""
Validateurs personnalisés pour EcosystIA
"""

import re
from django.core.exceptions import ValidationError
from django.core.validators import RegexValidator
from django.utils.translation import gettext_lazy as _
from django.utils import timezone
from datetime import datetime, timedelta


class StrongPasswordValidator:
    """
    Validateur pour des mots de passe forts
    """
    
    def __init__(self, min_length=8):
        self.min_length = min_length
    
    def validate(self, password, user=None):
        if len(password) < self.min_length:
            raise ValidationError(
                f'Le mot de passe doit contenir au moins {self.min_length} caractères.',
                code='password_too_short',
            )
        
        if not re.search(r'[A-Z]', password):
            raise ValidationError(
                'Le mot de passe doit contenir au moins une majuscule.',
                code='password_no_upper',
            )
        
        if not re.search(r'[a-z]', password):
            raise ValidationError(
                'Le mot de passe doit contenir au moins une minuscule.',
                code='password_no_lower',
            )
        
        if not re.search(r'\d', password):
            raise ValidationError(
                'Le mot de passe doit contenir au moins un chiffre.',
                code='password_no_digit',
            )
        
        if not re.search(r'[!@#$%^&*(),.?":{}|<>]', password):
            raise ValidationError(
                'Le mot de passe doit contenir au moins un caractère spécial.',
                code='password_no_special',
            )
        
        # Vérifier que le mot de passe n'est pas trop commun
        common_passwords = [
            'password', '123456', '123456789', 'qwerty', 'abc123',
            'password123', 'admin', 'letmein', 'welcome', 'monkey'
        ]
        
        if password.lower() in common_passwords:
            raise ValidationError(
                'Ce mot de passe est trop commun.',
                code='password_too_common',
            )
    
    def get_help_text(self):
        return _(
            f"Votre mot de passe doit contenir au moins {self.min_length} caractères "
            "avec au moins une majuscule, une minuscule, un chiffre et un caractère spécial."
        )


def validate_senegalese_phone(value):
    """
    Validateur pour les numéros de téléphone sénégalais
    """
    # Format acceptés: +221XXXXXXXXX, 221XXXXXXXXX, 7XXXXXXXX, 3XXXXXXXX
    patterns = [
        r'^\+221[0-9]{9}$',  # +221XXXXXXXXX
        r'^221[0-9]{9}$',    # 221XXXXXXXXX
        r'^[73][0-9]{8}$',   # 7XXXXXXXX ou 3XXXXXXXX
    ]
    
    if not any(re.match(pattern, value) for pattern in patterns):
        raise ValidationError(
            'Format de numéro de téléphone sénégalais invalide. '
            'Formats acceptés: +221XXXXXXXXX, 7XXXXXXXX, 3XXXXXXXX',
            code='invalid_phone',
        )


def validate_project_date_range(start_date, end_date):
    """
    Validateur pour les plages de dates de projet
    """
    if start_date and end_date:
        if start_date > end_date:
            raise ValidationError(
                'La date de début ne peut pas être postérieure à la date de fin.',
                code='invalid_date_range',
            )
        
        # Vérifier que la durée n'est pas excessive (max 5 ans)
        max_duration = timedelta(days=365 * 5)
        if (end_date - start_date) > max_duration:
            raise ValidationError(
                'La durée du projet ne peut pas dépasser 5 ans.',
                code='duration_too_long',
            )


def validate_budget_amount(value):
    """
    Validateur pour les montants budgétaires
    """
    if value < 0:
        raise ValidationError(
            'Le montant ne peut pas être négatif.',
            code='negative_amount',
        )
    
    # Limite maximum (100 milliards XOF)
    max_amount = 100_000_000_000
    if value > max_amount:
        raise ValidationError(
            f'Le montant ne peut pas dépasser {max_amount:,} XOF.',
            code='amount_too_high',
        )


def validate_file_size(value):
    """
    Validateur pour la taille des fichiers uploadés
    """
    max_size = 50 * 1024 * 1024  # 50MB
    if value.size > max_size:
        raise ValidationError(
            f'La taille du fichier ne peut pas dépasser {max_size // (1024*1024)}MB.',
            code='file_too_large',
        )


def validate_image_file(value):
    """
    Validateur pour les fichiers image
    """
    import magic
    
    # Vérifier la taille
    validate_file_size(value)
    
    # Vérifier le type MIME
    file_mime = magic.from_buffer(value.read(), mime=True)
    valid_mimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    
    if file_mime not in valid_mimes:
        raise ValidationError(
            'Seuls les fichiers JPEG, PNG, GIF et WebP sont autorisés.',
            code='invalid_image_type',
        )
    
    # Réinitialiser le pointeur du fichier
    value.seek(0)


def validate_course_duration(value):
    """
    Validateur pour la durée des cours
    """
    # Formats acceptés: "2 heures", "3 semaines", "1 mois", etc.
    pattern = r'^(\d+)\s+(minute|minutes|heure|heures|jour|jours|semaine|semaines|mois)$'
    
    if not re.match(pattern, value.lower()):
        raise ValidationError(
            'Format de durée invalide. Exemples: "2 heures", "3 semaines", "1 mois"',
            code='invalid_duration_format',
        )


def validate_email_domain(value):
    """
    Validateur pour les domaines d'email autorisés
    """
    # Liste des domaines interdits (temporaires, jetables)
    blocked_domains = [
        '10minutemail.com', 'tempmail.org', 'guerrillamail.com',
        'mailinator.com', 'throwaway.email', 'temp-mail.org'
    ]
    
    domain = value.split('@')[1].lower() if '@' in value else ''
    
    if domain in blocked_domains:
        raise ValidationError(
            'Les adresses email temporaires ne sont pas autorisées.',
            code='blocked_email_domain',
        )


def validate_json_structure(value, required_keys=None):
    """
    Validateur pour les structures JSON
    """
    if not isinstance(value, (dict, list)):
        raise ValidationError(
            'La valeur doit être un objet JSON valide.',
            code='invalid_json',
        )
    
    if required_keys and isinstance(value, dict):
        missing_keys = set(required_keys) - set(value.keys())
        if missing_keys:
            raise ValidationError(
                f'Clés manquantes: {", ".join(missing_keys)}',
                code='missing_json_keys',
            )


def validate_tags_list(value):
    """
    Validateur pour les listes de tags
    """
    if not isinstance(value, list):
        raise ValidationError(
            'Les tags doivent être une liste.',
            code='invalid_tags_format',
        )
    
    if len(value) > 10:
        raise ValidationError(
            'Maximum 10 tags autorisés.',
            code='too_many_tags',
        )
    
    for tag in value:
        if not isinstance(tag, str):
            raise ValidationError(
                'Chaque tag doit être une chaîne de caractères.',
                code='invalid_tag_type',
            )
        
        if len(tag) > 50:
            raise ValidationError(
                'Chaque tag ne peut pas dépasser 50 caractères.',
                code='tag_too_long',
            )


def validate_priority_level(value):
    """
    Validateur pour les niveaux de priorité
    """
    valid_priorities = ['Low', 'Medium', 'High', 'Critical']
    
    if value not in valid_priorities:
        raise ValidationError(
            f'Priorité invalide. Valeurs autorisées: {", ".join(valid_priorities)}',
            code='invalid_priority',
        )


def validate_percentage(value):
    """
    Validateur pour les pourcentages (0-100)
    """
    if not (0 <= value <= 100):
        raise ValidationError(
            'La valeur doit être comprise entre 0 et 100.',
            code='invalid_percentage',
        )


def validate_business_hours(value):
    """
    Validateur pour les heures d'ouverture
    """
    # Format attendu: "09:00-17:30"
    pattern = r'^([0-1]?[0-9]|2[0-3]):[0-5][0-9]-([0-1]?[0-9]|2[0-3]):[0-5][0-9]$'
    
    if not re.match(pattern, value):
        raise ValidationError(
            'Format d\'heures invalide. Utilisez le format HH:MM-HH:MM (ex: 09:00-17:30)',
            code='invalid_hours_format',
        )


# Validateurs RegEx prêts à l'emploi
username_validator = RegexValidator(
    regex=r'^[a-zA-Z0-9_]+$',
    message='Le nom d\'utilisateur ne peut contenir que des lettres, chiffres et underscores.',
    code='invalid_username'
)

slug_validator = RegexValidator(
    regex=r'^[-a-zA-Z0-9_]+$',
    message='Seuls les lettres, chiffres, tirets et underscores sont autorisés.',
    code='invalid_slug'
)

color_validator = RegexValidator(
    regex=r'^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$',
    message='Code couleur hexadécimal invalide (ex: #FF0000 ou #F00).',
    code='invalid_color'
)
