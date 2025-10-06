# 🔧 GUIDE DE RÉSOLUTION D'ERREURS ECOSYSTIA

## 📋 **Erreurs Communes et Solutions**

### ❌ **Erreur d'Import Supabase**

**Symptôme :**
```
[plugin:vite:import-analysis] Échec de l'importation de « ../lib/supabase » depuis « services/realtimeService.ts ». Le fichier existe-t-il ?
```

**Cause :** Chemin d'import incorrect vers le fichier Supabase.

**Solution :**
1. Vérifiez que le fichier `src/lib/supabase.js` existe
2. Corrigez les imports dans tous les services :
   ```typescript
   // ❌ Incorrect
   import { supabase } from '../lib/supabase';
   
   // ✅ Correct
   import { supabase } from '../src/lib/supabase.js';
   ```

**Fichiers à vérifier :**
- `services/realtimeService.ts`
- `services/databaseService.ts`
- `services/supabaseAuthService.ts`
- `services/roleManagementService.ts`
- `services/userManagementService.ts`

**Script de vérification :**
```bash
node scripts/checkEnvironment.cjs
```

---

### ❌ **Erreur de Connexion Supabase**

**Symptôme :**
```
Error: Invalid API key
Error: Failed to connect to Supabase
```

**Cause :** Variables d'environnement manquantes ou incorrectes.

**Solution :**
1. Créez le fichier `.env.local` :
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   VITE_GEMINI_API_KEY=your-gemini-key
   ```

2. Vérifiez vos clés dans le dashboard Supabase

3. Redémarrez le serveur de développement :
   ```bash
   npm run dev
   ```

---

### ❌ **Erreur de Module Non Trouvé**

**Symptôme :**
```
Module not found: Can't resolve 'module-name'
```

**Cause :** Dépendance manquante ou chemin incorrect.

**Solution :**
1. Installez la dépendance :
   ```bash
   npm install module-name
   ```

2. Vérifiez le chemin d'import

3. Redémarrez le serveur

---

### ❌ **Erreur de TypeScript**

**Symptôme :**
```
Property 'property' does not exist on type 'Type'
```

**Cause :** Type manquant ou incorrect.

**Solution :**
1. Vérifiez les types dans `types.ts`
2. Ajoutez les types manquants
3. Redémarrez TypeScript :
   ```bash
   npx tsc --noEmit
   ```

---

### ❌ **Erreur de Permissions**

**Symptôme :**
```
Row Level Security policy violation
```

**Cause :** Politiques RLS bloquantes.

**Solution :**
1. Vérifiez les politiques RLS dans Supabase
2. Exécutez `database/rls_policies.sql`
3. Vérifiez les permissions utilisateur

---

## 🔍 **Outils de Diagnostic**

### Script de Vérification d'Environnement
```bash
node scripts/checkEnvironment.cjs
```

### Test de Connexion Supabase
```bash
node scripts/testSupabaseConnection.js
```

### Test du Système Temps Réel
```bash
node scripts/testRealtimeSystem.js
```

### Test des Permissions
```bash
node scripts/testPermissionsSystem.js
```

---

## 📊 **Vérifications Préventives**

### Avant de Commencer le Développement
1. ✅ Vérifiez que tous les fichiers critiques existent
2. ✅ Vérifiez que les imports Supabase sont corrects
3. ✅ Vérifiez que les variables d'environnement sont configurées
4. ✅ Vérifiez que le serveur de développement démarre sans erreur

### Avant de Déployer
1. ✅ Exécutez tous les scripts de test
2. ✅ Vérifiez que la base de données est configurée
3. ✅ Vérifiez que les politiques RLS sont appliquées
4. ✅ Testez toutes les fonctionnalités principales

---

## 🚨 **Procédure d'Urgence**

### Si l'Application Ne Démarre Pas
1. **Arrêtez le serveur** (Ctrl+C)
2. **Vérifiez les erreurs** dans la console
3. **Exécutez le diagnostic** :
   ```bash
   node scripts/checkEnvironment.cjs
   ```
4. **Corrigez les problèmes** identifiés
5. **Redémarrez le serveur** :
   ```bash
   npm run dev
   ```

### Si la Base de Données Ne Fonctionne Pas
1. **Vérifiez la connexion** :
   ```bash
   node scripts/testSupabaseConnection.js
   ```
2. **Reconfigurez la base** si nécessaire :
   - Exécutez `database/schema.sql`
   - Exécutez `database/rls_policies.sql`
   - Exécutez `database/seed_data.sql`
3. **Vérifiez les variables d'environnement**

### Si le Temps Réel Ne Fonctionne Pas
1. **Vérifiez la réplication** :
   ```bash
   node scripts/testRealtimeSystem.js
   ```
2. **Reconfigurez le temps réel** :
   - Exécutez `database/realtime_setup.sql`
3. **Vérifiez les abonnements** dans l'application

---

## 📞 **Support et Ressources**

### Documentation Technique
- **Configuration Supabase** : `GUIDE_CONFIGURATION_DATABASE.md`
- **Système Temps Réel** : `GUIDE_TEMPS_REEL_SUPABASE.md`
- **Déploiement VPS** : `GUIDE_CONFIGURATION_VPS_HOSTINGER.md`

### Scripts Utilitaires
- **Vérification** : `scripts/checkEnvironment.cjs`
- **Test Connexion** : `scripts/testSupabaseConnection.js`
- **Test Temps Réel** : `scripts/testRealtimeSystem.js`
- **Test Permissions** : `scripts/testPermissionsSystem.js`

### Ressources Supabase
- [Documentation Supabase](https://supabase.com/docs)
- [Guide Realtime](https://supabase.com/docs/guides/realtime)
- [API Reference](https://supabase.com/docs/reference/javascript)

---

## 🎯 **Checklist de Résolution**

### ✅ Vérifications de Base
- [ ] Fichier `.env.local` existe et est configuré
- [ ] Fichier `src/lib/supabase.js` existe
- [ ] Tous les imports Supabase sont corrects
- [ ] Serveur de développement démarre sans erreur
- [ ] Application se charge dans le navigateur

### ✅ Vérifications Avancées
- [ ] Connexion Supabase fonctionne
- [ ] Tables de base de données existent
- [ ] Politiques RLS sont appliquées
- [ ] Système temps réel fonctionne
- [ ] Notifications temps réel fonctionnent
- [ ] Sauvegarde automatique fonctionne

### ✅ Vérifications de Production
- [ ] Variables d'environnement de production
- [ ] Base de données de production configurée
- [ ] SSL/HTTPS configuré
- [ ] Monitoring et logs configurés
- [ ] Sauvegarde automatique configurée

---

## 💡 **Conseils Préventifs**

1. **Toujours vérifier les imports** après modification des fichiers
2. **Tester les changements** avant de continuer
3. **Utiliser les scripts de diagnostic** régulièrement
4. **Maintenir les variables d'environnement** à jour
5. **Documenter les modifications** importantes

---

## 🎉 **En Cas de Succès**

Une fois tous les problèmes résolus :
1. ✅ L'application démarre sans erreur
2. ✅ La connexion Supabase fonctionne
3. ✅ Le système temps réel est opérationnel
4. ✅ Toutes les fonctionnalités sont accessibles
5. ✅ Les notifications temps réel fonctionnent

**🚀 Votre application EcosystIA est maintenant prête pour le développement et la production !**
