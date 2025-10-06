# 🚀 GUIDE SYSTÈME TEMPS RÉEL ECOSYSTIA

## 📋 **Vue d'ensemble**

Ce guide vous accompagne dans la configuration complète du système temps réel pour EcosystIA, incluant :
- **Réplication temps réel** de toutes les tables critiques
- **Sauvegarde automatique** des formulaires
- **Notifications instantanées** aux utilisateurs
- **Synchronisation en direct** des données
- **Abonnements WebSocket** pour les mises à jour

---

## 🏗️ **ÉTAPE 1: Configuration Supabase**

### 1.1 Exécution du script de configuration
1. Ouvrez votre dashboard Supabase
2. Allez dans l'onglet **"SQL Editor"**
3. Copiez le contenu du fichier `database/realtime_setup.sql`
4. Collez-le dans l'éditeur et cliquez sur **"Run"**

**✅ Résultat attendu :**
- Réplication activée sur 7 tables critiques
- 7 triggers temps réel créés
- 9 fonctions utilitaires configurées
- Index optimisés pour les performances

### 1.2 Tables avec réplication temps réel
```sql
-- Tables répliquées automatiquement
users                    -- Profils utilisateurs
projects                 -- Projets principaux
project_team_members     -- Membres d'équipe
tasks                    -- Tâches et sous-tâches
courses                  -- Cours et formations
jobs                     -- Offres d'emploi
time_logs               -- Logs de temps
leave_requests          -- Demandes de congés
invoices                -- Factures
expenses                -- Dépenses
contacts                -- Contacts CRM
documents               -- Base de connaissances
notifications           -- Notifications utilisateur
system_logs             -- Logs système
```

---

## 🔧 **ÉTAPE 2: Configuration de l'Application**

### 2.1 Service temps réel
Le service `realtimeService.ts` fournit :
- **Abonnements** aux changements de données
- **Sauvegarde automatique** des formulaires
- **Gestion des notifications** temps réel
- **Synchronisation** des états

### 2.2 Hooks React disponibles
```typescript
// Hook principal pour les abonnements
const { subscribe, unsubscribe, isConnected } = useRealtime();

// Hook pour l'auto-save
const { autoSaveState, saveNow } = useAutoSave(formId, saveFunction, getFormData);

// Hook pour les notifications
const { notifications, unreadCount, markAsRead } = useRealtimeNotifications(userId);

// Hook pour les données projet temps réel
const { projectData, isLoading } = useProjectRealtime(projectId);

// Hook pour les statistiques utilisateur
const { stats } = useUserRealtimeStats(userId);
```

---

## 📡 **ÉTAPE 3: Abonnements Temps Réel**

### 3.1 S'abonner aux changements de projet
```typescript
useEffect(() => {
  const unsubscribe = realtimeService.subscribeToUserProjects(userId, (event) => {
    if (event.type === 'INSERT') {
      // Nouveau projet créé
      console.log('Nouveau projet:', event.record);
    } else if (event.type === 'UPDATE') {
      // Projet modifié
      console.log('Projet mis à jour:', event.record);
    }
  });

  return () => unsubscribe.unsubscribe();
}, [userId]);
```

### 3.2 S'abonner aux tâches d'un projet
```typescript
useEffect(() => {
  const unsubscribe = realtimeService.subscribeToProjectTasks(projectId, (event) => {
    // Mettre à jour la liste des tâches en temps réel
    setTasks(prevTasks => {
      if (event.type === 'INSERT') {
        return [...prevTasks, event.record];
      } else if (event.type === 'UPDATE') {
        return prevTasks.map(task => 
          task.id === event.record.id ? event.record : task
        );
      } else if (event.type === 'DELETE') {
        return prevTasks.filter(task => task.id !== event.record.id);
      }
      return prevTasks;
    });
  });

  return () => unsubscribe.unsubscribe();
}, [projectId]);
```

### 3.3 S'abonner aux notifications
```typescript
useEffect(() => {
  const unsubscribe = realtimeService.subscribeToUserNotifications(userId, (event) => {
    if (event.type === 'INSERT') {
      // Nouvelle notification
      showNotification(event.record.title, event.record.message);
    }
  });

  return () => unsubscribe.unsubscribe();
}, [userId]);
```

---

## 💾 **ÉTAPE 4: Sauvegarde Automatique**

### 4.1 Configuration de l'auto-save
```typescript
const MyForm = () => {
  const [formData, setFormData] = useState({});
  
  const saveFunction = async (data) => {
    const response = await fetch('/api/save-form', {
      method: 'POST',
      body: JSON.stringify(data)
    });
    return response.ok;
  };

  const { autoSaveState, saveNow } = useAutoSave(
    'my-form',
    saveFunction,
    () => formData,
    {
      intervalMs: 30000, // Sauvegarder toutes les 30 secondes
      enabled: true
    }
  );

  return (
    <div>
      <form>
        {/* Votre formulaire */}
      </form>
      
      <AutoSaveIndicator state={autoSaveState} />
    </div>
  );
};
```

### 4.2 États d'auto-save
```typescript
interface AutoSaveState {
  isSaving: boolean;        // Sauvegarde en cours
  lastSaved: Date | null;   // Dernière sauvegarde
  hasUnsavedChanges: boolean; // Modifications non sauvegardées
  error: string | null;     // Erreur de sauvegarde
}
```

---

## 🔔 **ÉTAPE 5: Notifications Temps Réel**

### 5.1 Créer une notification
```typescript
const createNotification = async () => {
  await realtimeService.createNotification(
    userId,
    'Nouveau projet',
    'Un nouveau projet a été créé',
    'info',
    '/projects/123',
    { projectId: 123 }
  );
};
```

### 5.2 Composant de notifications
```typescript
const Header = () => {
  return (
    <header>
      <RealtimeNotifications 
        className="text-gray-600"
        showCount={true}
        maxNotifications={5}
      />
    </header>
  );
};
```

### 5.3 Types de notifications
- **info** : Information générale
- **success** : Succès d'une action
- **warning** : Avertissement
- **error** : Erreur critique

---

## 📊 **ÉTAPE 6: Données Temps Réel**

### 6.1 Statistiques utilisateur en temps réel
```typescript
const Dashboard = () => {
  const { user } = useAuth();
  const { stats, isLoading } = useUserRealtimeStats(user?.id);

  if (isLoading) return <div>Chargement...</div>;

  return (
    <div>
      <h2>Projets actifs: {stats?.active_projects}</h2>
      <h2>Tâches terminées: {stats?.completed_tasks}</h2>
      <h2>Temps loggé aujourd'hui: {stats?.time_logged_today}h</h2>
    </div>
  );
};
```

### 6.2 Données projet temps réel
```typescript
const ProjectDetail = ({ projectId }) => {
  const { projectData, isLoading } = useProjectRealtime(projectId);

  if (isLoading) return <div>Chargement...</div>;

  return (
    <div>
      <h1>{projectData?.project?.title}</h1>
      <div>Équipe: {projectData?.team?.length} membres</div>
      <div>Tâches: {projectData?.tasks?.length}</div>
    </div>
  );
};
```

---

## ⚡ **ÉTAPE 7: Optimisations Performance**

### 7.1 Index optimisés
```sql
-- Index pour les notifications
CREATE INDEX idx_notifications_user_status ON notifications(user_id, status);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);

-- Index pour les logs de temps
CREATE INDEX idx_time_logs_user_date ON time_logs(user_id, date);
CREATE INDEX idx_time_logs_project_date ON time_logs(project_id, date);

-- Index pour les tâches
CREATE INDEX idx_tasks_project_status ON tasks(project_id, status);
CREATE INDEX idx_tasks_assignee_status ON tasks(assignee_id, status);
```

### 7.2 Fonctions optimisées
```sql
-- Fonction pour les statistiques utilisateur
SELECT get_user_realtime_stats('user-id');

-- Fonction pour les données projet
SELECT get_project_realtime_data(project_id);
```

---

## 🧪 **ÉTAPE 8: Tests et Validation**

### 8.1 Test de réplication
```javascript
// Exécuter le script de test
node scripts/testRealtimeSystem.js
```

### 8.2 Tests manuels
1. **Ouvrir deux onglets** de l'application
2. **Modifier des données** dans un onglet
3. **Vérifier la synchronisation** dans l'autre onglet
4. **Tester les notifications** en temps réel
5. **Valider l'auto-save** des formulaires

### 8.3 Métriques de performance
- **Latence WebSocket** : < 100ms
- **Temps de sauvegarde** : < 500ms
- **Temps de notification** : < 200ms
- **Mémoire utilisée** : < 50MB pour 1000 connexions

---

## 🔧 **DÉPANNAGE**

### Problème : Pas de synchronisation
**Solution :**
1. Vérifier que la réplication est activée
2. Vérifier les triggers dans Supabase
3. Vérifier la connexion WebSocket

### Problème : Auto-save ne fonctionne pas
**Solution :**
1. Vérifier la fonction de sauvegarde
2. Vérifier les permissions utilisateur
3. Vérifier les erreurs dans la console

### Problème : Notifications manquantes
**Solution :**
1. Vérifier les politiques RLS
2. Vérifier la table notifications
3. Vérifier les abonnements WebSocket

### Problème : Performance dégradée
**Solution :**
1. Vérifier les index de base de données
2. Limiter le nombre d'abonnements
3. Optimiser les requêtes

---

## 📈 **MÉTRIQUES DE SUCCÈS**

### ✅ Système opérationnel si :
- [x] **Réplication** activée sur toutes les tables
- [x] **Triggers** temps réel fonctionnels
- [x] **Abonnements** WebSocket établis
- [x] **Auto-save** opérationnel
- [x] **Notifications** temps réel
- [x] **Synchronisation** des données
- [x] **Performance** acceptable

### 📊 Indicateurs de performance :
- **Latence** : < 100ms pour les mises à jour
- **Disponibilité** : 99.9% uptime
- **Connexions simultanées** : 1000+ utilisateurs
- **Débit** : 10,000+ événements/minute

---

## 🚀 **FONCTIONNALITÉS AVANCÉES**

### 🔄 Synchronisation bidirectionnelle
```typescript
// Écouter les changements et synchroniser
useEffect(() => {
  const unsubscribe = realtimeService.subscribeToTable('projects', (event) => {
    // Synchroniser avec le state local
    syncLocalState(event);
  });
  
  return () => unsubscribe.unsubscribe();
}, []);
```

### 📱 Notifications push
```typescript
// Intégration avec les notifications push du navigateur
const requestNotificationPermission = async () => {
  if ('Notification' in window) {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      // Configurer les notifications push
    }
  }
};
```

### 🔄 Reconnection automatique
```typescript
// Gestion de la reconnexion automatique
useEffect(() => {
  const handleReconnect = () => {
    // Reconnecter les abonnements
    realtimeService.reconnect();
  };

  window.addEventListener('online', handleReconnect);
  return () => window.removeEventListener('online', handleReconnect);
}, []);
```

---

## 📞 **SUPPORT**

### Documentation technique :
- **Configuration** : `database/realtime_setup.sql`
- **Service** : `services/realtimeService.ts`
- **Hooks** : `hooks/useRealtime.ts`
- **Composants** : `components/common/`

### Scripts de test :
- **Test complet** : `scripts/testRealtimeSystem.js`
- **Test de performance** : Tests automatisés inclus

### Ressources Supabase :
- [Documentation Realtime](https://supabase.com/docs/guides/realtime)
- [Guide WebSocket](https://supabase.com/docs/guides/realtime/websockets)
- [API Reference](https://supabase.com/docs/reference/javascript/realtime)

---

## 🎉 **FÉLICITATIONS !**

Votre système temps réel EcosystIA est maintenant configuré et opérationnel !

**🚀 Votre plateforme dispose de :**
- ✅ Synchronisation temps réel complète
- ✅ Sauvegarde automatique intelligente
- ✅ Notifications instantanées
- ✅ Performance optimisée
- ✅ Reconnexion automatique
- ✅ Gestion d'erreurs robuste

**📈 Prêt pour :**
- Collaboration en temps réel
- Sauvegarde automatique des données
- Notifications instantanées
- Synchronisation multi-utilisateurs
- Performance à grande échelle

**✨ Bon développement avec EcosystIA Temps Réel !**
