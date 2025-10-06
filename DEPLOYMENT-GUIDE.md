# 🚀 GUIDE DE DÉPLOIEMENT ECOSYSTIA SUR VPS HOSTINGER

## ✅ **PRÉPARATION TERMINÉE !**

L'application EcosystIA est maintenant prête pour le déploiement sur votre VPS Hostinger.

---

## 📦 **FICHIERS PRÉPARÉS**

✅ **Archive de déploiement créée :** `C:\temp\ecosystia-deploy-20251005_185517.zip`

Cette archive contient :
- 🏗️ **Application construite** (dist/)
- 🖥️ **Serveur Node.js** (server.js)
- ⚙️ **Configuration PM2** (ecosystem.config.js)
- 🌐 **Configuration Nginx** (nginx-ecosystia.conf)
- 📦 **Package.json serveur** (package.json)
- 🚀 **Script de déploiement** (deploy.sh)
- 🔧 **Fichier .env** (configuration production)

---

## 🛠️ **ÉTAPES DE DÉPLOIEMENT**

### **1. RÉINITIALISATION DU SERVEUR VPS**

Connectez-vous à votre VPS Hostinger et exécutez :

```bash
# Télécharger le script de setup
wget https://raw.githubusercontent.com/your-repo/ecosystia/main/deploy/vps-setup.sh
chmod +x vps-setup.sh
sudo ./vps-setup.sh
```

**Ce script va automatiquement :**
- ✅ Mettre à jour le système Ubuntu
- ✅ Installer Node.js 20.x, Nginx, PM2, Git
- ✅ Configurer le firewall (UFW)
- ✅ Créer l'utilisateur `ecosystia`
- ✅ Préparer les répertoires `/var/www/ecosystia`
- ✅ Configurer Nginx pour servir l'application
- ✅ Configurer PM2 pour la gestion des processus

### **2. TRANSFERT DE L'ARCHIVE**

Depuis votre machine Windows, transférez l'archive :

```bash
# Remplacez YOUR_SERVER_IP par l'IP de votre VPS
scp C:\temp\ecosystia-deploy-20251005_185517.zip root@YOUR_SERVER_IP:/tmp/
```

### **3. DÉPLOIEMENT SUR LE SERVEUR**

Connectez-vous au serveur et déployez :

```bash
# Se connecter au serveur
ssh root@YOUR_SERVER_IP

# Aller dans le répertoire temporaire
cd /tmp

# Extraire l'archive
unzip ecosystia-deploy-20251005_185517.zip

# Rendre le script exécutable
chmod +x deploy.sh

# Exécuter le déploiement
./deploy.sh
```

**Le script de déploiement va :**
- ✅ Sauvegarder l'ancienne version (si elle existe)
- ✅ Copier les nouveaux fichiers
- ✅ Configurer les permissions
- ✅ Installer les dépendances serveur
- ✅ Démarrer l'application avec PM2
- ✅ Configurer le redémarrage automatique

### **4. CONFIGURATION SSL (RECOMMANDÉ)**

Pour activer HTTPS :

```bash
# Obtenir un certificat SSL gratuit
certbot --nginx -d ecosystia.impulcia-afrique.com
```

---

## 🔧 **CONFIGURATION SUPABASE**

### **Variables d'environnement à configurer :**

Éditez le fichier `.env` sur le serveur :

```bash
sudo nano /var/www/ecosystia/.env
```

Remplacez les valeurs par vos vraies clés Supabase :

```env
NODE_ENV=production
PORT=3000
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
DOMAIN_NAME=ecosystia.impulcia-afrique.com
```

**Redémarrez l'application après modification :**

```bash
pm2 restart ecosystia
```

---

## 📊 **MONITORING ET MAINTENANCE**

### **Commandes PM2 utiles :**

```bash
# Statut de l'application
pm2 status

# Logs en temps réel
pm2 logs ecosystia

# Redémarrage
pm2 restart ecosystia

# Monitoring des ressources
pm2 monit

# Sauvegarder la configuration
pm2 save
```

### **Logs Nginx :**

```bash
# Logs d'accès
tail -f /var/log/nginx/ecosystia_access.log

# Logs d'erreurs
tail -f /var/log/nginx/ecosystia_error.log
```

### **Health Check :**

```bash
# Vérifier que l'application fonctionne
curl http://localhost:3000/api/health

# Ou depuis l'extérieur
curl http://ecosystia.impulcia-afrique.com/api/health
```

---

## 🎯 **VÉRIFICATION FINALE**

### **URLs de test :**

- 🌐 **Application :** http://ecosystia.impulcia-afrique.com
- 🔍 **Health Check :** http://ecosystia.impulcia-afrique.com/api/health
- 📊 **Status :** http://ecosystia.impulcia-afrique.com/api/status

### **Checklist de déploiement :**

- ✅ Serveur réinitialisé et configuré
- ✅ Application construite et transférée
- ✅ Nginx configuré et fonctionnel
- ✅ PM2 configuré et application démarrée
- ✅ Variables d'environnement configurées
- ✅ Health check fonctionnel
- ✅ SSL configuré (si applicable)

---

## 🚨 **DÉPANNAGE**

### **Problèmes courants :**

#### **1. Application ne démarre pas**
```bash
pm2 logs ecosystia
sudo chown -R ecosystia:www-data /var/www/ecosystia
```

#### **2. Nginx ne sert pas l'application**
```bash
sudo nginx -t
sudo systemctl restart nginx
```

#### **3. Erreurs de permissions**
```bash
sudo chmod -R 755 /var/www/ecosystia
sudo chown -R ecosystia:www-data /var/www/ecosystia
```

#### **4. Port 3000 déjà utilisé**
```bash
sudo netstat -tlnp | grep :3000
pm2 stop ecosystia
pm2 start ecosystem.config.js
```

---

## 🏆 **RÉSULTAT FINAL**

Après le déploiement, vous aurez :

- ✅ **EcosystIA** fonctionnel sur votre VPS Hostinger
- ✅ **Sécurité** niveau entreprise (firewall, SSL, headers)
- ✅ **Performance** optimisée (compression, cache, cluster)
- ✅ **Monitoring** complet (PM2, logs, health checks)
- ✅ **Scalabilité** prête (architecture cloud-native)
- ✅ **Maintenance** automatisée (redémarrage, sauvegarde)

---

## 📞 **SUPPORT**

En cas de problème :

1. **Vérifiez les logs** PM2 et Nginx
2. **Testez les endpoints** de santé
3. **Vérifiez les permissions** des fichiers
4. **Consultez** deploy/README-DEPLOYMENT.md pour plus de détails

---

**🎉 Félicitations ! EcosystIA est maintenant prêt pour le déploiement sur votre VPS Hostinger !**

**📧 Pour toute question : contactez l'équipe IMPULCIA AFRIQUE**
