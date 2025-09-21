# 🚀 Guide de Démarrage Rapide - EcosystIA Backend

## ⚡ Démarrage Express (5 minutes)

### Option 1: Avec Docker (Recommandé)

```bash
# 1. Démarrer tous les services
docker-compose up -d

# 2. Voir les logs
docker-compose logs -f

# 3. Accéder à l'API
# 🌐 http://localhost:8000
# 📚 http://localhost:8000/api/docs/
```

### Option 2: Installation Locale

```bash
# 1. Créer l'environnement virtuel
python -m venv venv

# 2. Activer l'environnement
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# 3. Installer les dépendances
pip install -r requirements.txt

# 4. Configurer l'environnement
cp env.example .env
# Modifier .env avec vos configurations

# 5. Démarrer le serveur
python manage.py runserver
```

## 🔧 Configuration Rapide

### Variables d'environnement essentielles

```env
# Base de données
DATABASE_URL=postgresql://ecosystia_user:ecosystia_password_2024@localhost:5432/ecosystia

# Redis
REDIS_URL=redis://localhost:6379/0

# IA (optionnel)
GEMINI_API_KEY=your-gemini-api-key

# Email (optionnel)
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password
```

## 🎯 Endpoints Principaux

### Authentification
```bash
# Inscription
POST /api/v1/users/register/
{
  "username": "testuser",
  "email": "test@ecosystia.org",
  "password": "password123",
  "password_confirm": "password123",
  "role": "student"
}

# Connexion
POST /api/v1/auth/token/
{
  "email": "test@ecosystia.org",
  "password": "password123"
}
```

### Utilisateurs
```bash
# Informations utilisateur actuel
GET /api/v1/users/current/

# Liste des utilisateurs
GET /api/v1/users/
```

### Projets
```bash
# Créer un projet
POST /api/v1/projects/
{
  "title": "Mon Projet",
  "description": "Description du projet",
  "due_date": "2024-12-31"
}

# Liste des projets
GET /api/v1/projects/
```

### IA Chat
```bash
# Créer une session de chat
POST /api/v1/ai/sessions/
{
  "context_type": "general"
}

# Envoyer un message
POST /api/v1/ai/sessions/1/send-message/
{
  "content": "Bonjour, comment puis-je créer un projet ?"
}
```

## 🧪 Tests

```bash
# Lancer tous les tests
python manage.py test

# Tests avec coverage
coverage run --source='.' manage.py test
coverage report
coverage html
```

## 📊 Admin Django

```bash
# Créer un superutilisateur
python manage.py createsuperuser

# Accéder à l'admin
# 🌐 http://localhost:8000/admin/
```

## 🔍 Debug et Logs

```bash
# Voir les logs en temps réel
docker-compose logs -f

# Logs d'un service spécifique
docker-compose logs -f web
docker-compose logs -f db
docker-compose logs -f redis
```

## 🚨 Dépannage Rapide

### Problème de base de données
```bash
# Réinitialiser la base
docker-compose down -v
docker-compose up -d
```

### Problème de permissions
```bash
# Linux/Mac
chmod +x start.sh
```

### Problème de ports
```bash
# Vérifier les ports utilisés
netstat -tulpn | grep :8000
netstat -tulpn | grep :5432
netstat -tulpn | grep :6379
```

## 📈 Monitoring

### Health Check
```bash
curl http://localhost:8000/health/
```

### API Documentation
- **Swagger UI**: http://localhost:8000/api/docs/
- **ReDoc**: http://localhost:8000/api/redoc/
- **Schema**: http://localhost:8000/api/schema/

## 🎉 Prêt !

Votre backend EcosystIA est maintenant opérationnel ! 

- ✅ API REST fonctionnelle
- ✅ Authentification JWT
- ✅ Base de données PostgreSQL
- ✅ Cache Redis
- ✅ Interface Admin Django
- ✅ Documentation API
- ✅ Tests automatisés

### Prochaines étapes :
1. **Intégrer le frontend React** avec les services Axios
2. **Configurer l'IA** avec votre clé Gemini API
3. **Personnaliser** les modèles selon vos besoins
4. **Déployer** en production

**Bonne chance avec EcosystIA ! 🚀**
