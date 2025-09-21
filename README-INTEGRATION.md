# 🔗 Guide d'Intégration Frontend-Backend EcosystIA

## 📋 Vue d'ensemble

Ce document décrit l'intégration complète entre le frontend React et le backend Django d'EcosystIA, avec authentification JWT et API REST sécurisée.

## 🏗️ Architecture de l'Intégration

### Backend Django (Port 8000)
```
http://localhost:8000/
├── api/v1/
│   ├── auth/          # Authentification JWT
│   ├── users/         # Gestion utilisateurs
│   ├── projects/      # Gestion projets
│   ├── courses/       # Cours et formation
│   ├── jobs/          # Emplois
│   ├── crm/           # CRM et contacts
│   ├── finance/       # Facturation
│   ├── meetings/      # Réunions
│   ├── notifications/ # Notifications
│   └── analytics/     # Analytics
├── api/docs/          # Documentation Swagger
├── api/redoc/         # Documentation ReDoc
└── health/            # Health check
```

### Frontend React (Port 5173)
```
src/
├── services/
│   └── apiService.ts     # Service API centralisé
├── hooks/
│   └── useApi.ts         # Hooks React pour API
├── contexts/
│   └── AuthContext.tsx   # Contexte d'authentification
├── components/
│   ├── Login.tsx         # Composant de connexion
│   └── Signup.tsx        # Composant d'inscription
└── utils/
    └── errorHandler.ts   # Gestion d'erreurs
```

## 🔧 Configuration

### 1. Variables d'environnement

**Backend (backend/.env)**
```bash
SECRET_KEY=your-secret-key
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
DATABASE_URL=postgresql://user:password@localhost/ecosystia
REDIS_URL=redis://localhost:6379
CORS_ALLOWED_ORIGINS=http://localhost:5173
```

**Frontend (config.env)**
```bash
VITE_API_BASE_URL=http://localhost:8000/api/v1
VITE_API_KEY=your_gemini_api_key_here
```

### 2. Installation des dépendances

**Backend**
```bash
cd backend
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

**Frontend**
```bash
npm install axios
npm run dev
```

## 🔐 Authentification JWT

### Flux d'authentification

1. **Connexion utilisateur**
   ```typescript
   const credentials = { username: 'user', password: 'pass' };
   const { user, tokens } = await apiService.login(credentials);
   ```

2. **Stockage sécurisé des tokens**
   - Access token: `localStorage.getItem('access_token')`
   - Refresh token: `localStorage.getItem('refresh_token')`

3. **Renouvellement automatique**
   - Intercepteur Axios pour renouveler automatiquement les tokens
   - Déconnexion automatique si refresh échoue

4. **Requêtes authentifiées**
   ```typescript
   // Headers automatiquement ajoutés
   Authorization: Bearer <access_token>
   ```

## 📡 Services API

### Service principal (apiService.ts)

```typescript
import { apiService } from './services/apiService';

// Authentification
await apiService.login(credentials);
await apiService.signup(userData);
await apiService.getCurrentUser();

// Modules métier
await apiService.projects.getAll();
await apiService.courses.enroll(courseId);
await apiService.notifications.markAsRead(notificationId);
```

### Hooks React personnalisés

```typescript
import { useProjects, useCreateProject } from './hooks/useApi';

function ProjectsComponent() {
  const { items: projects, loading, loadPage } = useProjects();
  const { execute: createProject } = useCreateProject();
  
  // Utilisation...
}
```

## 🛡️ Gestion d'erreurs

### Types d'erreurs gérées

- **401 Unauthorized**: Renouvellement automatique du token
- **403 Forbidden**: Permissions insuffisantes
- **404 Not Found**: Ressource non trouvée
- **429 Too Many Requests**: Rate limiting
- **500 Server Error**: Erreur serveur

### Gestion centralisée

```typescript
import { ErrorHandler } from './utils/errorHandler';

try {
  await apiService.someMethod();
} catch (error) {
  const userMessage = ErrorHandler.getUserFriendlyMessage(error);
  // Afficher le message à l'utilisateur
}
```

## 🧪 Tests d'intégration

### Script de test automatisé

```bash
# Tester l'intégration complète
node scripts/test-integration.js
```

### Tests manuels

1. **Health Check**
   ```bash
   curl http://localhost:8000/health/
   ```

2. **Authentification**
   ```bash
   curl -X POST http://localhost:8000/api/v1/auth/login/ \
        -H "Content-Type: application/json" \
        -d '{"username":"test","password":"test123"}'
   ```

3. **Endpoint protégé**
   ```bash
   curl http://localhost:8000/api/v1/auth/me/ \
        -H "Authorization: Bearer <token>"
   ```

## 🚀 Déploiement

### Backend Django

1. **Configuration production**
   ```python
   # settings/production.py
   DEBUG = False
   ALLOWED_HOSTS = ['your-domain.com']
   SECURE_SSL_REDIRECT = True
   ```

2. **Serveur WSGI/ASGI**
   ```bash
   gunicorn ecosystia.wsgi:application
   # ou pour WebSocket
   daphne ecosystia.asgi:application
   ```

### Frontend React

1. **Build de production**
   ```bash
   npm run build
   ```

2. **Configuration Nginx**
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;
       
       location / {
           root /path/to/dist;
           try_files $uri $uri/ /index.html;
       }
       
       location /api/ {
           proxy_pass http://backend:8000;
       }
   }
   ```

## 🔍 Debugging

### Logs utiles

**Backend Django**
```python
# settings.py
LOGGING = {
    'version': 1,
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
        },
    },
    'loggers': {
        'django': {
            'handlers': ['console'],
            'level': 'DEBUG',
        },
    },
}
```

**Frontend React**
```typescript
// Activer les logs API en développement
if (import.meta.env.DEV) {
    console.log('API Request:', config);
    console.log('API Response:', response);
}
```

### Outils de développement

- **Django Debug Toolbar**: Analyse des requêtes backend
- **React Developer Tools**: État des composants
- **Network Tab**: Inspection des requêtes HTTP
- **Redux DevTools**: État global (si utilisé)

## 📚 Documentation API

### Swagger UI
- **URL**: http://localhost:8000/api/docs/
- **Description**: Interface interactive pour tester les APIs

### ReDoc
- **URL**: http://localhost:8000/api/redoc/
- **Description**: Documentation API élégante

### Schema OpenAPI
- **URL**: http://localhost:8000/api/schema/
- **Format**: JSON/YAML pour génération de clients

## ✅ Checklist de validation

- [ ] Backend Django démarré sur port 8000
- [ ] Frontend React démarré sur port 5173
- [ ] Health check API répond correctement
- [ ] Inscription utilisateur fonctionne
- [ ] Connexion utilisateur fonctionne
- [ ] Tokens JWT stockés et renouvelés
- [ ] Endpoints protégés accessibles
- [ ] Gestion d'erreurs opérationnelle
- [ ] Documentation API accessible
- [ ] Tests d'intégration passent

## 🎯 Prochaines étapes

1. **Notifications temps réel** avec Django Channels
2. **Upload de fichiers** pour avatars et documents
3. **Tests automatisés** complets
4. **Optimisations performance** (cache, pagination)
5. **Monitoring et logging** en production

---

**Statut**: ✅ Intégration Frontend-Backend OPÉRATIONNELLE
**Version**: 1.0.0
**Dernière mise à jour**: Septembre 2024
