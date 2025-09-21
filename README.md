# 🚀 EcosystIA - Plateforme de Gestion d'Entreprise

[![Django](https://img.shields.io/badge/Django-5.0.8-green.svg)](https://djangoproject.com/)
[![React](https://img.shields.io/badge/React-19.1.0-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8.2-blue.svg)](https://www.typescriptlang.org/)
[![Docker](https://img.shields.io/badge/Docker-Ready-blue.svg)](https://docker.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

## 📋 Description

**EcosystIA** est une plateforme complète de gestion d'entreprise intégrant l'intelligence artificielle pour optimiser les processus métier. Cette solution full-stack combine un backend Django robuste avec un frontend React moderne.

## ✨ Fonctionnalités Principales

### 🤖 Intelligence Artificielle
- **Assistant IA intégré** avec Google Gemini
- **Coaching personnel** basé sur l'IA
- **Analyses prédictives** pour la prise de décision
- **Génération automatique** de contenu

### 👥 Gestion des Utilisateurs
- **Authentification sécurisée** avec JWT
- **Gestion des rôles** et permissions
- **Profils utilisateurs** personnalisables
- **Système de notifications** en temps réel

### 📊 Modules Métier
- **CRM** - Gestion de la relation client
- **Projets** - Suivi et gestion des projets
- **Finance** - Comptabilité et facturation
- **Formations** - Gestion des cours et certifications
- **Emplois** - Gestion des offres et candidatures
- **Objectifs** - Suivi OKR et KPI
- **Temps** - Suivi du temps de travail
- **Congés** - Gestion des absences
- **Réunions** - Planification et suivi

### 🔧 Fonctionnalités Techniques
- **API REST** complète avec documentation
- **WebSocket** pour les mises à jour temps réel
- **Upload de fichiers** sécurisé
- **Cache Redis** pour les performances
- **Tâches asynchrones** avec Celery
- **Monitoring** et logging avancés

## 🏗️ Architecture

```
SENEGEL-WorkFlow/
├── backend/                 # API Django
│   ├── apps/               # Modules métier
│   ├── ecosystia/         # Configuration Django
│   ├── docker-compose.yml # Orchestration Docker
│   └── Dockerfile         # Image Docker
├── components/            # Composants React
├── services/             # Services API
├── contexts/             # Contextes React
├── hooks/               # Hooks personnalisés
└── utils/               # Utilitaires
```

## 🚀 Installation Rapide

### Prérequis
- **Node.js** 18+ et npm
- **Python** 3.11+
- **PostgreSQL** 15+
- **Redis** 7+
- **Docker** (optionnel)

### 🐳 Déploiement Docker (Recommandé)

```bash
# Cloner le projet
git clone https://github.com/Cherif0104/EcosystIA-django.git
cd EcosystIA-django

# Démarrer avec Docker
cd backend
docker-compose up -d

# Votre application sera disponible sur :
# - Frontend: http://localhost:5173
# - Backend API: http://localhost:8000
# - Documentation: http://localhost:8000/api/docs/
```

### 💻 Installation Manuelle

#### Backend Django
```bash
cd backend

# Créer l'environnement virtuel
python -m venv venv
source venv/bin/activate  # Linux/Mac
# ou
venv\Scripts\activate     # Windows

# Installer les dépendances
pip install -r requirements.txt

# Configuration
cp env.example .env
# Éditer .env avec vos paramètres

# Migrations
python manage.py migrate

# Créer un superutilisateur
python manage.py createsuperuser

# Démarrer le serveur
python manage.py runserver
```

#### Frontend React
```bash
# Installer les dépendances
npm install

# Configuration
cp config.env.example config.env
# Éditer config.env avec vos paramètres

# Démarrer le serveur de développement
npm run dev
```

## ⚙️ Configuration

### Variables d'Environnement

#### Backend (.env)
```env
# Django
DEBUG=True
SECRET_KEY=your-secret-key
ALLOWED_HOSTS=localhost,127.0.0.1

# Base de données
DATABASE_URL=postgresql://user:password@localhost:5432/ecosystia

# Redis
REDIS_URL=redis://localhost:6379/0

# Email
EMAIL_HOST=smtp.gmail.com
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password

# AI
GEMINI_API_KEY=your-gemini-api-key
OPENAI_API_KEY=your-openai-api-key
```

#### Frontend (config.env)
```env
VITE_API_URL=http://localhost:8000/api
VITE_GEMINI_API_KEY=your-gemini-api-key
```

## 📚 Documentation API

- **Swagger UI**: http://localhost:8000/api/docs/
- **ReDoc**: http://localhost:8000/api/redoc/
- **Schema**: http://localhost:8000/api/schema/

## 🧪 Tests

```bash
# Tests Backend
cd backend
python -m pytest

# Tests Frontend
npm run test

# Tests d'intégration
npm run test:integration
```

## 📦 Déploiement Production

### 🚀 Railway (No-Code)
1. Connectez votre GitHub à [Railway](https://railway.app)
2. Sélectionnez ce repository
3. Railway détecte automatiquement Docker
4. Configurez les variables d'environnement
5. Déployez en 1 clic !

### ☁️ AWS/GCP/Azure
```bash
# Build de l'image Docker
docker build -t ecosystia-backend ./backend

# Déploiement avec Kubernetes
kubectl apply -f k8s/
```

### 🖥️ VPS
```bash
# Utiliser les scripts fournis
./backend/start.sh    # Linux/Mac
backend/start.bat     # Windows
```

## 🔒 Sécurité

- ✅ **HTTPS** obligatoire en production
- ✅ **JWT** sécurisé avec refresh tokens
- ✅ **Rate limiting** sur les APIs
- ✅ **CORS** configuré
- ✅ **Validation** des données
- ✅ **Logs** de sécurité
- ✅ **Headers** de sécurité

## 📊 Monitoring

- **Health Check**: `/health/`
- **Metrics**: Intégration Prometheus
- **Logs**: Centralisés avec Sentry
- **Performance**: Monitoring Redis et DB

## 🤝 Contribution

1. Fork le projet
2. Créez une branche feature (`git checkout -b feature/AmazingFeature`)
3. Committez vos changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrez une Pull Request

## 📝 Changelog

### Version 1.0.0
- ✅ Backend Django complet
- ✅ Frontend React avec TypeScript
- ✅ Intégration IA (Google Gemini)
- ✅ Modules métier complets
- ✅ API REST documentée
- ✅ Docker ready
- ✅ Tests automatisés

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier [LICENSE](LICENSE) pour plus de détails.

## 👥 Équipe

- **Développeur Principal**: Cherif0104
- **Architecture**: Full-stack avec IA
- **Technologies**: Django, React, TypeScript, Docker

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/Cherif0104/EcosystIA-django/issues)
- **Documentation**: [Wiki](https://github.com/Cherif0104/EcosystIA-django/wiki)
- **Email**: support@ecosystia.org

## 🌟 Fonctionnalités à Venir

- [ ] **Mobile App** (React Native)
- [ ] **Analytics** avancées
- [ ] **Intégrations** tierces (Slack, Teams)
- [ ] **Multi-tenant** architecture
- [ ] **IA** prédictive avancée

---

<div align="center">
  <strong>🚀 Développé avec ❤️ par l'équipe EcosystIA</strong>
</div>