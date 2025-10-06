# 🗄️ GUIDE DE CONFIGURATION BASE DE DONNÉES ECOSYSTIA

## 📋 **Vue d'ensemble**

Ce guide vous accompagne dans la configuration complète de la base de données Supabase pour EcosystIA, incluant :
- **18 tables** avec relations complexes
- **19 rôles** avec permissions granulaires
- **18 modules** avec accès contrôlé
- **Politiques RLS** pour la sécurité
- **Données de démonstration** pour les tests

---

## 🚀 **ÉTAPE 1: Préparation**

### 1.1 Variables d'environnement
Créez un fichier `.env.local` dans la racine du projet :

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_GEMINI_API_KEY=your-gemini-api-key
```

### 1.2 Accès au dashboard Supabase
1. Connectez-vous à [supabase.com](https://supabase.com)
2. Sélectionnez votre projet EcosystIA
3. Allez dans l'onglet **"SQL Editor"**

---

## 🏗️ **ÉTAPE 2: Création du Schéma**

### 2.1 Exécution du schéma principal
1. Ouvrez le fichier `database/schema.sql`
2. Copiez tout le contenu
3. Dans l'éditeur SQL de Supabase, collez le contenu
4. Cliquez sur **"Run"** pour exécuter

**✅ Résultat attendu :**
- 18 tables créées
- Types personnalisés définis
- Indexes de performance créés
- Triggers de mise à jour automatique

### 2.2 Tables principales créées :
```sql
-- Utilisateurs et rôles
users                    -- Profils utilisateurs
role_permissions         -- Permissions granulaires
modules                  -- Modules de l'application

-- Projets et gestion
projects                 -- Projets principaux
project_team_members     -- Membres d'équipe
tasks                    -- Tâches des projets
project_risks           -- Risques projet

-- Formation et emploi
courses                 -- Cours de formation
course_enrollments      -- Inscriptions
jobs                    -- Offres d'emploi
job_applications        -- Candidatures

-- Suivi et gestion
time_logs               -- Suivi du temps
leave_requests          -- Demandes de congés
invoices                -- Factures
expenses                -- Dépenses

-- Business et CRM
contacts                -- Contacts clients
documents               -- Base de connaissances

-- Système
system_logs             -- Logs système
notifications           -- Notifications
```

---

## 🔒 **ÉTAPE 3: Politiques de Sécurité (RLS)**

### 3.1 Exécution des politiques RLS
1. Ouvrez le fichier `database/rls_policies.sql`
2. Copiez tout le contenu
3. Dans l'éditeur SQL de Supabase, collez le contenu
4. Cliquez sur **"Run"** pour exécuter

**✅ Résultat attendu :**
- RLS activé sur toutes les tables
- Politiques de sécurité appliquées
- Fonctions utilitaires créées
- Accès contrôlé par rôle

### 3.2 Politiques principales :
- **Super Administrateur** : Accès total
- **Administrateur** : Gestion complète (sauf super admin)
- **Manager** : Gestion d'équipe et projets
- **Utilisateurs** : Accès limité à leurs données

---

## 🌱 **ÉTAPE 4: Données Initiales**

### 4.1 Exécution des données de seed
1. Ouvrez le fichier `database/seed_data.sql`
2. Copiez tout le contenu
3. Dans l'éditeur SQL de Supabase, collez le contenu
4. Cliquez sur **"Run"** pour exécuter

**✅ Résultat attendu :**
- 18 modules configurés
- 19 rôles avec permissions
- Projets de démonstration
- Cours et emplois de test
- Contacts CRM d'exemple

### 4.2 Données créées :
```sql
-- Modules (18)
dashboard, projects, goals, courses, jobs, time_tracking, 
leave_management, finance, crm_sales, knowledge_base, 
development, tools, ai_coach, gen_ai_lab, analytics, 
user_management, settings, super_admin

-- Rôles avec permissions (19)
super_administrator, administrator, manager, supervisor, 
student, trainer, teacher, entrepreneur, employer, funder, 
mentor, coach, facilitator, publisher, producer, artist, 
editor, implementer, intern, alumni

-- Données de démonstration
4 projets SENEGEL
4 cours de formation
4 offres d'emploi
4 documents de base de connaissances
4 contacts CRM
```

---

## ✅ **ÉTAPE 5: Vérification**

### 5.1 Vérification des tables
Dans l'éditeur SQL, exécutez :
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

**Résultat attendu :** 18 tables listées

### 5.2 Vérification des modules
```sql
SELECT id, name FROM modules ORDER BY sort_order;
```

**Résultat attendu :** 18 modules listés

### 5.3 Vérification des permissions
```sql
SELECT role, module_id, can_view, can_create, can_update, can_delete, can_manage 
FROM role_permissions 
WHERE role = 'super_administrator' 
LIMIT 5;
```

**Résultat attendu :** Toutes les permissions à `true`

### 5.4 Vérification des données
```sql
SELECT COUNT(*) as total_projects FROM projects;
SELECT COUNT(*) as total_courses FROM courses;
SELECT COUNT(*) as total_jobs FROM jobs;
```

**Résultats attendus :**
- `total_projects`: 4
- `total_courses`: 4  
- `total_jobs`: 4

---

## 🔧 **ÉTAPE 6: Configuration de l'Application**

### 6.1 Test de connexion
1. Démarrez l'application : `npm run dev`
2. Ouvrez http://localhost:5173
3. Vérifiez que l'authentification fonctionne

### 6.2 Création du premier utilisateur
1. Inscrivez-vous via l'interface
2. Vérifiez dans Supabase > Authentication > Users
3. Mettez à jour le rôle dans la table `users`

### 6.3 Attribution du rôle Super Administrateur
```sql
UPDATE users 
SET role = 'super_administrator' 
WHERE email = 'votre-email@exemple.com';
```

---

## 🚨 **DÉPANNAGE**

### Problème : Tables non créées
**Solution :**
1. Vérifiez les erreurs dans l'éditeur SQL
2. Exécutez les requêtes une par une
3. Vérifiez les permissions de votre utilisateur Supabase

### Problème : Politiques RLS bloquantes
**Solution :**
1. Désactivez temporairement RLS :
```sql
ALTER TABLE nom_table DISABLE ROW LEVEL SECURITY;
```
2. Testez l'application
3. Réactivez RLS après résolution

### Problème : Données non insérées
**Solution :**
1. Vérifiez les contraintes de clés étrangères
2. Exécutez les INSERT dans l'ordre
3. Vérifiez les types de données

### Problème : Permissions non appliquées
**Solution :**
1. Vérifiez la table `role_permissions`
2. Testez avec un utilisateur super administrateur
3. Vérifiez les hooks de permissions dans l'application

---

## 📊 **MÉTRIQUES DE SUCCÈS**

### ✅ Configuration réussie si :
- [ ] 18 tables créées et accessibles
- [ ] RLS activé sur toutes les tables
- [ ] 18 modules configurés avec permissions
- [ ] 19 rôles avec permissions granulaires
- [ ] Données de démonstration insérées
- [ ] Application connectée et fonctionnelle
- [ ] Authentification opérationnelle
- [ ] Super Admin accessible

### 📈 Indicateurs de performance :
- **Temps de réponse** : < 200ms pour les requêtes simples
- **Connexions simultanées** : Support jusqu'à 100 utilisateurs
- **Sécurité** : RLS actif sur 100% des tables sensibles
- **Permissions** : 1615 configurations (19 rôles × 17 modules × 5 permissions)

---

## 🎯 **PROCHAINES ÉTAPES**

### Phase 1 : Tests et validation
1. **Tests utilisateur** : Tester avec différents rôles
2. **Tests de sécurité** : Vérifier les politiques RLS
3. **Tests de performance** : Optimiser les requêtes lentes

### Phase 2 : Données réelles
1. **Import des utilisateurs** : Migrer les utilisateurs existants
2. **Import des projets** : Transférer les projets SENEGEL
3. **Configuration des workflows** : Adapter aux processus métier

### Phase 3 : Production
1. **Backup automatique** : Configurer les sauvegardes
2. **Monitoring** : Surveiller les performances
3. **Évolutivité** : Planifier la montée en charge

---

## 📞 **SUPPORT**

### Documentation technique :
- **Schéma complet** : `database/schema.sql`
- **Politiques RLS** : `database/rls_policies.sql`
- **Données initiales** : `database/seed_data.sql`

### Scripts d'automatisation :
- **Windows** : `scripts/setupSupabaseDatabase.cmd`
- **Linux/Mac** : `scripts/setupSupabaseDatabase.sh`

### Ressources Supabase :
- [Documentation Supabase](https://supabase.com/docs)
- [Guide RLS](https://supabase.com/docs/guides/auth/row-level-security)
- [API Reference](https://supabase.com/docs/reference)

---

## 🎉 **FÉLICITATIONS !**

Votre base de données EcosystIA est maintenant configurée et prête pour la production !

**🚀 Votre plateforme dispose de :**
- ✅ Architecture robuste et évolutive
- ✅ Sécurité de niveau entreprise
- ✅ Permissions granulaires par rôle
- ✅ Données de démonstration complètes
- ✅ Interface d'administration avancée

**📈 Prêt pour :**
- Développement et tests
- Déploiement en production
- Gestion de milliers d'utilisateurs
- Évolutivité future

**✨ Bon développement avec EcosystIA !**
