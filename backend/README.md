# EcosystIA Backend

Backend Django robuste pour la plateforme EcosystIA, conçu pour supporter 250,000 utilisateurs avec une architecture modulaire et scalable.

## 🚀 Architecture

### Stack Technique
- **Framework**: Django 5.0 + Django REST Framework
- **Base de données**: PostgreSQL (principal) + Redis (cache)
- **Authentification**: JWT + OAuth2
- **IA**: Google Gemini API intégrée
- **Conteneurisation**: Docker + Docker Compose
- **Monitoring**: Sentry + Health Checks

### Applications Modulaires
```
apps/
├── authentication/     # JWT + OAuth2
├── users/             # Gestion des 15 rôles utilisateurs
├── projects/          # Gestion de projets Kanban
├── courses/           # Système de cours et leçons
├── jobs/              # Offres d'emploi et candidatures
├── crm/               # Gestion de la relation client
├── finance/           # Factures, dépenses, budgets
├── analytics/         # Métriques et rapports
├── ai/                # Chatbot contextuel + Gemini
├── knowledge_base/    # Base de connaissances
├── notifications/     # Système de notifications
├── time_tracking/     # Suivi du temps et réunions
├── leave_management/  # Gestion des congés
├── meetings/          # Planification des réunions
└── goals/             # OKRs et objectifs
```

## 🛠 Installation

### Prérequis
- Python 3.11+
- PostgreSQL 15+
- Redis 7+
- Docker (optionnel)

### Installation locale

1. **Cloner et configurer**
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Linux/Mac
# ou
venv\Scripts\activate     # Windows

pip install -r requirements.txt
```

2. **Configuration de la base de données**
```bash
# Créer la base PostgreSQL
createdb ecosystia

# Variables d'environnement
export DATABASE_URL="postgresql://user:password@localhost:5432/ecosystia"
export REDIS_URL="redis://localhost:6379/0"
export SECRET_KEY="your-secret-key-here"
```

3. **Migrations et superutilisateur**
```bash
python manage.py migrate
python manage.py createsuperuser
```

4. **Démarrage**
```bash
python manage.py runserver
```

### Installation avec Docker

```bash
# Démarrer tous les services
docker-compose up -d

# Voir les logs
docker-compose logs -f

# Arrêter
docker-compose down
```

## 📊 Configuration des Performances

### Base de données
- **Connexions**: 20 connexions max par instance
- **Indexation**: Index optimisés sur les champs fréquemment utilisés
- **Pooling**: Connexion pooling activé

### Cache Redis
- **TTL**: 300 secondes par défaut
- **Stratégie**: Cache-aside pattern
- **Clustering**: Support Redis Cluster

### Limites de débit
- **API**: 1000 requêtes/heure par utilisateur
- **Authentification**: 100 requêtes/heure anonymes
- **IA**: Limites configurables par utilisateur

## 🔐 Sécurité

### Authentification
- **JWT**: Access tokens (1h) + Refresh tokens (7j)
- **OAuth2**: Support complet des scopes
- **Sessions**: Gestion sécurisée avec rotation

### Sécurité des données
- **Chiffrement**: Mots de passe bcrypt
- **HTTPS**: Obligatoire en production
- **CORS**: Configuration restrictive
- **Rate limiting**: Protection contre les attaques

## 🤖 Intégration IA

### Gemini API
```python
# Configuration dans settings
ECOSYSTIA = {
    'AI_ENABLED': True,
    'GEMINI_API_KEY': 'your-api-key',
    'MAX_TOKENS_PER_USER': 10000,
}
```

### Fonctionnalités IA
- **Chatbot contextuel**: Sur chaque page
- **Génération de contenu**: Cours, projets, descriptions
- **Suggestions intelligentes**: Basées sur l'historique
- **Analytics prédictives**: Tendances et recommandations

## 📈 Monitoring et Analytics

### Métriques disponibles
- **Utilisateurs**: Inscriptions, connexions, activité
- **Projets**: Création, progression, completion
- **Cours**: Inscriptions, progression, évaluations
- **IA**: Tokens utilisés, sessions, coûts

### Health Checks
- **Endpoint**: `/health/`
- **Services**: Database, Redis, IA API
- **Monitoring**: Sentry intégré

## 🔧 Configuration de Production

### Variables d'environnement
```env
# Base de données
DATABASE_URL=postgresql://user:pass@host:5432/db

# Cache
REDIS_URL=redis://host:6379/0

# Sécurité
SECRET_KEY=your-secret-key
DEBUG=False
ALLOWED_HOSTS=yourdomain.com

# Email
EMAIL_HOST=smtp.gmail.com
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-password

# IA
GEMINI_API_KEY=your-gemini-key

# Monitoring
SENTRY_DSN=your-sentry-dsn
```

### Optimisations
- **Static files**: Whitenoise + CDN
- **Database**: Connection pooling
- **Cache**: Redis clustering
- **Background tasks**: Celery + Redis

## 📚 API Documentation

### Endpoints principaux
- **Auth**: `/api/v1/auth/`
- **Users**: `/api/v1/users/`
- **Projects**: `/api/v1/projects/`
- **Courses**: `/api/v1/courses/`
- **AI**: `/api/v1/ai/`

### Documentation interactive
- **Swagger UI**: `/api/docs/`
- **ReDoc**: `/api/redoc/`
- **Schema**: `/api/schema/`

## 🧪 Tests

```bash
# Tests unitaires
python manage.py test

# Tests avec coverage
coverage run --source='.' manage.py test
coverage report
coverage html
```

## 🚀 Déploiement

### Production
1. **Serveur**: Ubuntu 20.04+ recommandé
2. **Base de données**: PostgreSQL 15+ clusterisé
3. **Cache**: Redis 7+ clusterisé
4. **Load balancer**: Nginx + Gunicorn
5. **Monitoring**: Sentry + Prometheus

### Scaling
- **Horizontal**: Multi-instances Django
- **Vertical**: Optimisation des requêtes
- **Cache**: Redis clustering
- **Database**: Read replicas + sharding

## 📞 Support

### Documentation
- **API**: `/api/docs/`
- **Code**: Commentaires détaillés
- **Architecture**: Diagrammes dans `/docs/`

### Monitoring
- **Logs**: Centralisés avec rotation
- **Métriques**: Temps réel
- **Alertes**: Configuration Sentry

---

**EcosystIA Backend** - Architecture robuste pour l'écosystème éducatif et professionnel sénégalais 🇸🇳
