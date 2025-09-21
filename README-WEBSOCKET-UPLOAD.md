# 🔔📁 **WEBSOCKET + UPLOAD DE FICHIERS - ECOSYSTIA**

## 📋 **Vue d'ensemble**

Cette documentation couvre les deux fonctionnalités avancées finales d'EcosystIA :
1. **Notifications temps réel** avec Django Channels et WebSocket
2. **Système d'upload de fichiers** avec validation et optimisation

---

# 🔔 **NOTIFICATIONS TEMPS RÉEL**

## **🏗️ Architecture WebSocket**

### **Backend Django Channels**

#### **Configuration ASGI**
```python
# ecosystia/asgi.py
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack

application = ProtocolTypeRouter({
    "http": get_asgi_application(),
    "websocket": AuthMiddlewareStack(
        URLRouter(websocket_urlpatterns)
    ),
})
```

#### **Consumers WebSocket**
- **NotificationConsumer** - Notifications personnelles utilisateur
- **ProjectNotificationConsumer** - Notifications de projet
- **MeetingChatConsumer** - Chat temps réel réunions
- **SystemNotificationConsumer** - Notifications système

#### **URLs WebSocket**
```
ws://localhost:8000/ws/notifications/<user_id>/
ws://localhost:8000/ws/projects/<project_id>/notifications/
ws://localhost:8000/ws/meetings/<meeting_id>/chat/
ws://localhost:8000/ws/system/
```

### **Frontend React WebSocket**

#### **Service WebSocket**
```typescript
import { webSocketService } from '../services/websocketService';

// Connexion notifications utilisateur
webSocketService.connectToUserNotifications(userId, {
  onNotification: (notification) => {
    // Traiter la notification
  },
  onConnectionChange: (status) => {
    // Gérer le statut de connexion
  }
});
```

#### **Hooks React**
```typescript
import { useUserNotifications } from '../hooks/useWebSocket';

const { 
  notifications, 
  unreadCount, 
  markAsRead, 
  isConnected 
} = useUserNotifications();
```

## **🚀 Fonctionnalités Implémentées**

### **✅ Notifications Personnelles**
- Réception temps réel des notifications
- Marquer comme lu/non lu
- Compteur de notifications non lues
- Notifications navigateur avec permission
- Reconnexion automatique

### **✅ Notifications de Projet**
- Mises à jour temps réel des projets
- Notifications de changement de tâches
- Collaboration en temps réel
- Notifications d'équipe

### **✅ Chat de Réunion**
- Chat temps réel pendant les réunions
- Participants en ligne
- Messages système (rejoindre/quitter)
- Historique des messages

### **✅ Notifications Système**
- Notifications administrateur
- Maintenance programmée
- Alertes système
- Statistiques temps réel

### **✅ Services Automatisés**
- **Signaux Django** pour notifications automatiques
- **Tâches Celery** pour rappels et résumés
- **Templates de notifications** réutilisables
- **Nettoyage automatique** des anciennes notifications

## **📱 Composant NotificationCenter**

```tsx
import NotificationCenter from './components/NotificationCenter';

<NotificationCenter className="fixed top-4 right-4" />
```

**Fonctionnalités :**
- Badge avec compteur non lues
- Panel déroulant avec notifications
- Filtrage non lues uniquement
- Marquer tout comme lu
- Indicateur de connexion temps réel
- Notifications navigateur

---

# 📁 **SYSTÈME D'UPLOAD DE FICHIERS**

## **🏗️ Architecture Upload**

### **Backend Django**

#### **Modèles de Fichiers**
```python
class FileUpload(models.Model):
    file = models.FileField(upload_to=document_upload_path)
    original_name = models.CharField(max_length=255)
    file_type = models.CharField(max_length=20, choices=FILE_TYPES)
    mime_type = models.CharField(max_length=100)
    file_size = models.PositiveIntegerField()
    uploaded_by = models.ForeignKey(User, on_delete=models.CASCADE)
    # ... autres champs
```

#### **Validation et Optimisation**
- **Validation MIME type** avec python-magic
- **Validation taille** configurable par type
- **Optimisation images** automatique avec Pillow
- **Génération miniatures** pour images
- **Hash de fichier** pour détecter doublons

#### **Endpoints API**
```
POST /api/v1/core/files/upload/          # Upload général
POST /api/v1/core/avatar/upload/         # Upload avatar
POST /api/v1/core/images/upload/         # Upload image avec miniatures
POST /api/v1/core/files/bulk-upload/     # Upload multiple
GET  /api/v1/core/files/<id>/download/   # Téléchargement
GET  /api/v1/core/files/stats/           # Statistiques
```

### **Frontend React**

#### **Composant FileUpload**
```tsx
import FileUpload from './components/FileUpload';

<FileUpload
  fileType="image"
  multiple={true}
  maxSize={5}
  onUploadComplete={(files) => console.log(files)}
/>
```

#### **Composant AvatarUpload**
```tsx
import AvatarUpload from './components/AvatarUpload';

<AvatarUpload
  currentAvatar={user.avatar}
  onAvatarChange={(url) => setAvatar(url)}
  size="lg"
/>
```

## **🚀 Fonctionnalités Implémentées**

### **✅ Upload Général**
- **Drag & drop** intuitif
- **Preview** des fichiers
- **Validation côté client** et serveur
- **Progress bar** temps réel
- **Upload multiple** en lot
- **Gestion d'erreurs** détaillée

### **✅ Upload d'Avatar**
- **Validation spécifique** avatars
- **Optimisation automatique** 300x300px
- **Preview instantané**
- **Suppression d'avatar**
- **Mise à jour profil** automatique

### **✅ Upload d'Images**
- **Génération miniatures** automatique
- **Optimisation qualité/taille**
- **Formats multiples** (JPEG, PNG, WebP, GIF)
- **Métadonnées images** (dimensions, alt text)

### **✅ Sécurité et Validation**
- **Validation MIME type** stricte
- **Limite de taille** configurable
- **Scan antivirus** (intégrable)
- **Permissions d'accès** granulaires
- **Logs d'activité** complets

### **✅ Stockage et Performance**
- **Organisation par date** (année/mois)
- **Noms de fichiers** sécurisés
- **Hash de déduplication**
- **Compression images** intelligente
- **CDN ready** pour production

## **📊 Types de Fichiers Supportés**

### **Images**
- **Formats :** JPEG, PNG, GIF, WebP
- **Taille max :** 5MB
- **Dimensions max :** 2048x2048px
- **Optimisation :** Automatique

### **Documents**
- **Formats :** PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, TXT, CSV
- **Taille max :** 10MB
- **Validation :** Type MIME strict

### **Avatars**
- **Formats :** JPEG, PNG
- **Taille max :** 2MB
- **Dimensions :** 50x50px minimum
- **Ratio :** Maximum 2:1
- **Optimisation :** 300x300px automatique

---

# 🔧 **CONFIGURATION ET DÉPLOIEMENT**

## **Installation Backend**

### **Dépendances**
```bash
pip install channels==4.0.0
pip install channels-redis==4.1.0
pip install daphne==4.0.0
pip install Pillow==10.0.1
pip install python-magic==0.4.27
```

### **Settings Django**
```python
# settings/base.py
INSTALLED_APPS = [
    'channels',
    'daphne',
    # ... autres apps
]

ASGI_APPLICATION = 'ecosystia.asgi.application'

CHANNEL_LAYERS = {
    'default': {
        'BACKEND': 'channels_redis.core.RedisChannelLayer',
        'CONFIG': {
            'hosts': [('127.0.0.1', 6379)],
        },
    },
}

# Configuration upload
MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'
FILE_UPLOAD_MAX_MEMORY_SIZE = 10 * 1024 * 1024  # 10MB
```

### **Démarrage Serveur**
```bash
# Développement
daphne ecosystia.asgi:application

# Production
daphne -b 0.0.0.0 -p 8000 ecosystia.asgi:application
```

## **Configuration Frontend**

### **Variables d'environnement**
```bash
# config.env
VITE_API_BASE_URL=http://localhost:8000/api/v1
VITE_WS_HOST=localhost:8000
```

### **Intégration Composants**
```tsx
// App.tsx
import NotificationCenter from './components/NotificationCenter';
import FileUpload from './components/FileUpload';
import AvatarUpload from './components/AvatarUpload';

function App() {
  return (
    <div>
      <NotificationCenter />
      {/* Autres composants */}
    </div>
  );
}
```

## **Production**

### **Redis pour WebSocket**
```bash
# Installation Redis
sudo apt install redis-server

# Configuration
redis-server --daemonize yes
```

### **Nginx Configuration**
```nginx
# WebSocket proxy
location /ws/ {
    proxy_pass http://backend:8000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
}

# Upload de fichiers
location /media/ {
    alias /path/to/media/;
    expires 1y;
    add_header Cache-Control "public, immutable";
}

client_max_body_size 20M;
```

### **Celery pour Tâches**
```bash
# Worker Celery
celery -A ecosystia worker -l info

# Beat pour tâches périodiques
celery -A ecosystia beat -l info
```

---

# 🧪 **TESTS ET VALIDATION**

## **Tests WebSocket**

### **Test Connexion**
```javascript
const ws = new WebSocket('ws://localhost:8000/ws/notifications/1/?token=your_jwt_token');

ws.onopen = () => console.log('WebSocket connecté');
ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    console.log('Notification reçue:', data);
};
```

### **Test Notifications**
```python
# Django shell
from apps.notifications.services import notification_service

notification_service.send_to_user(
    user_id=1,
    notification_data={
        'title': 'Test notification',
        'message': 'Ceci est un test',
        'type': 'info'
    }
)
```

## **Tests Upload**

### **Test Upload Simple**
```bash
curl -X POST http://localhost:8000/api/v1/core/files/upload/ \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@test.jpg" \
  -F "file_type=image"
```

### **Test Upload Avatar**
```bash
curl -X POST http://localhost:8000/api/v1/core/avatar/upload/ \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "avatar=@avatar.jpg"
```

---

# 📊 **MÉTRIQUES ET MONITORING**

## **Métriques WebSocket**
- Connexions actives
- Messages par seconde
- Latence moyenne
- Reconnexions

## **Métriques Upload**
- Fichiers uploadés/jour
- Taille totale stockage
- Types de fichiers populaires
- Erreurs d'upload

## **Logs Importants**
```python
# Logs WebSocket
logger.info(f'WebSocket connecté: user_{user_id}')
logger.error(f'Erreur WebSocket: {error}')

# Logs Upload
logger.info(f'Fichier uploadé: {filename} par {user}')
logger.warning(f'Fichier rejeté: {filename} - {reason}')
```

---

# 🎯 **RÉSUMÉ FONCTIONNALITÉS**

## **✅ NOTIFICATIONS TEMPS RÉEL**
- 🔔 **4 types de WebSocket** (user, project, meeting, system)
- 🔄 **Reconnexion automatique** avec backoff exponentiel
- 📱 **Notifications navigateur** avec permissions
- 🎯 **Signaux automatiques** pour événements Django
- ⏰ **Tâches Celery** pour rappels et résumés
- 📊 **Templates réutilisables** pour notifications
- 🧹 **Nettoyage automatique** anciennes notifications

## **✅ UPLOAD DE FICHIERS**
- 📁 **Upload général** avec drag & drop
- 🖼️ **Upload images** avec miniatures automatiques
- 👤 **Upload avatar** optimisé et sécurisé
- 🔒 **Validation stricte** types MIME et tailles
- ⚡ **Optimisation automatique** images
- 📊 **Statistiques** et logs complets
- 🗂️ **Organisation intelligente** par date

---

**🎊 ECOSYSTIA EST MAINTENANT 100% COMPLET !**

**Toutes les fonctionnalités avancées sont implémentées et prêtes pour la production :** notifications temps réel, upload de fichiers, authentification JWT, API REST complète, interface React moderne, et bien plus !

**🚀 Prêt pour le lancement mondial !** 🌍
