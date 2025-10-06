# 🚀 GUIDE DE DÉPLOIEMENT ECOSYSTIA SUR VPS HOSTINGER

## 📋 **PRÉREQUIS**

- ✅ VPS Hostinger avec accès root
- ✅ Domaine configuré (ex: ecosystia.impulcia-afrique.com)
- ✅ Accès SSH au serveur
- ✅ Application EcosystIA construite localement

---

## 🛠️ **ÉTAPES DE DÉPLOIEMENT**

### **1. RÉINITIALISATION DU SERVEUR**

```bash
# Télécharger et exécuter le script de setup
wget https://raw.githubusercontent.com/your-repo/ecosystia/main/deploy/vps-setup.sh
chmod +x vps-setup.sh
sudo ./vps-setup.sh
```

**Ce script va :**
- ✅ Mettre à jour le système
- ✅ Installer Node.js 20.x, Nginx, PM2
- ✅ Configurer le firewall
- ✅ Créer l'utilisateur `ecosystia`
- ✅ Préparer les répertoires
- ✅ Configurer Nginx
- ✅ Configurer PM2

### **2. PRÉPARATION DU DÉPLOIEMENT LOCAL**

```bash
# Depuis votre machine locale (répertoire EcosystIA)
chmod +x deploy/deploy-ecosystia.sh
./deploy/deploy-ecosystia.sh
```

**Ce script va :**
- ✅ Construire l'application (npm run build)
- ✅ Préparer les fichiers serveur
- ✅ Créer l'archive de déploiement
- ✅ Générer les instructions de déploiement

### **3. TRANSFERT VERS LE SERVEUR**

```bash
# Transférer l'archive (remplacer YOUR_SERVER_IP)
scp /tmp/ecosystia-deploy-YYYYMMDD_HHMMSS.tar.gz root@YOUR_SERVER_IP:/tmp/
```

### **4. DÉPLOIEMENT SUR LE SERVEUR**

```bash
# Se connecter au serveur
ssh root@YOUR_SERVER_IP

# Extraire et déployer
cd /tmp
tar -xzf ecosystia-deploy-YYYYMMDD_HHMMSS.tar.gz
cd ecosystia-deploy
chmod +x deploy.sh
./deploy.sh
```

### **5. CONFIGURATION SSL (OPTIONNEL)**

```bash
# Obtenir un certificat SSL gratuit avec Let's Encrypt
certbot --nginx -d ecosystia.impulcia-afrique.com
```

---

## 🔧 **CONFIGURATION SUPABASE**

### **Variables d'environnement à configurer :**

```bash
# Éditer le fichier .env sur le serveur
sudo nano /var/www/ecosystia/.env
```

```env
# Configuration Supabase
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Configuration production
NODE_ENV=production
PORT=3000
DOMAIN_NAME=ecosystia.impulcia-afrique.com
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

# Monitoring
pm2 monit

# Sauvegarder la configuration
pm2 save

# Redémarrage automatique au boot
pm2 startup
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

## 🚨 **DÉPANNAGE**

### **Problèmes courants :**

#### **1. Application ne démarre pas**
```bash
# Vérifier les logs PM2
pm2 logs ecosystia

# Vérifier les permissions
sudo chown -R ecosystia:www-data /var/www/ecosystia
```

#### **2. Nginx ne sert pas l'application**
```bash
# Tester la configuration Nginx
sudo nginx -t

# Redémarrer Nginx
sudo systemctl restart nginx
```

#### **3. Erreurs de permissions**
```bash
# Corriger les permissions
sudo chmod -R 755 /var/www/ecosystia
sudo chown -R ecosystia:www-data /var/www/ecosystia
```

#### **4. Port 3000 déjà utilisé**
```bash
# Vérifier les processus
sudo netstat -tlnp | grep :3000

# Arrêter PM2 et redémarrer
pm2 stop ecosystia
pm2 start ecosystem.config.js
```

---

## 📈 **OPTIMISATIONS**

### **Performance :**

1. **Activer la compression gzip** (déjà configuré)
2. **Cache des assets statiques** (déjà configuré)
3. **Monitoring avec PM2** (déjà configuré)

### **Sécurité :**

1. **Firewall configuré** (UFW)
2. **Headers de sécurité** (Helmet.js)
3. **SSL/TLS** (Let's Encrypt)

### **Scalabilité :**

1. **Cluster mode PM2** (déjà configuré)
2. **Load balancing Nginx** (prêt pour multiple instances)
3. **Monitoring des ressources** (PM2 monit)

---

## 🎯 **VÉRIFICATION FINALE**

### **Checklist de déploiement :**

- ✅ Serveur réinitialisé et configuré
- ✅ Application construite et transférée
- ✅ Nginx configuré et fonctionnel
- ✅ PM2 configuré et application démarrée
- ✅ SSL configuré (si applicable)
- ✅ Variables d'environnement configurées
- ✅ Health check fonctionnel
- ✅ Logs configurés et accessibles

### **URLs de test :**

- 🌐 **Application :** http://ecosystia.impulcia-afrique.com
- 🔍 **Health Check :** http://ecosystia.impulcia-afrique.com/api/health
- 📊 **Status :** http://ecosystia.impulcia-afrique.com/api/status

---

## 🆘 **SUPPORT**

En cas de problème :

1. **Vérifier les logs** PM2 et Nginx
2. **Tester les endpoints** de santé
3. **Vérifier les permissions** des fichiers
4. **Contacter le support** avec les logs d'erreur

---

**🎉 Félicitations ! EcosystIA est maintenant déployé sur votre VPS Hostinger !**
