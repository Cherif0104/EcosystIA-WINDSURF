"""
Tests API pour EcosystIA Backend
"""

from django.test import TestCase
from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework.test import APITestCase, APIClient
from rest_framework import status
from apps.users.models import User

User = get_user_model()


class UserAPITestCase(APITestCase):
    """
    Tests pour l'API des utilisateurs
    """
    
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username='testuser',
            email='test@ecosystia.org',
            password='testpass123',
            first_name='Test',
            last_name='User'
        )
    
    def test_user_registration(self):
        """
        Test de l'inscription d'un utilisateur
        """
        url = reverse('users:register')
        data = {
            'username': 'newuser',
            'email': 'newuser@ecosystia.org',
            'first_name': 'New',
            'last_name': 'User',
            'password': 'newpass123',
            'password_confirm': 'newpass123',
            'role': 'student'
        }
        
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(User.objects.count(), 2)
    
    def test_user_login(self):
        """
        Test de la connexion d'un utilisateur
        """
        url = reverse('authentication:token_obtain_pair')
        data = {
            'email': 'test@ecosystia.org',
            'password': 'testpass123'
        }
        
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access_token', response.data)
        self.assertIn('refresh_token', response.data)
    
    def test_get_current_user(self):
        """
        Test de récupération de l'utilisateur actuel
        """
        self.client.force_authenticate(user=self.user)
        url = reverse('users:current-user')
        
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['email'], self.user.email)


class HealthCheckTestCase(TestCase):
    """
    Tests pour l'endpoint de santé
    """
    
    def test_health_check(self):
        """
        Test de l'endpoint de santé
        """
        from django.test import Client
        client = Client()
        
        response = client.get('/health/')
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data['status'], 'healthy')
        self.assertEqual(data['service'], 'EcosystIA API')


class ModelTestCase(TestCase):
    """
    Tests pour les modèles
    """
    
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            email='test@ecosystia.org',
            password='testpass123',
            first_name='Test',
            last_name='User',
            role='student'
        )
    
    def test_user_creation(self):
        """
        Test de création d'un utilisateur
        """
        self.assertEqual(self.user.get_full_name(), 'Test User')
        self.assertEqual(self.user.role, 'student')
        self.assertFalse(self.user.is_verified)
    
    def test_user_profile_creation(self):
        """
        Test de création automatique du profil utilisateur
        """
        from apps.users.models import UserProfile
        
        profile = UserProfile.objects.get(user=self.user)
        self.assertEqual(profile.user, self.user)
        self.assertTrue(profile.email_notifications)
