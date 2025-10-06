# 🚀 DÉPLOIEMENT ECOSYSTIA AVEC CLOUDPANEL

## 📋 **INFORMATIONS SERVEUR**
- **IP Publique :** 72.60.187.85
- **Système :** Ubuntu 24.04
- **Panel :** CloudPanel v2.5.2
- **Utilisateur Admin :** cherif0104

---

## 🎯 **STRATÉGIE DE DÉPLOIEMENT AVEC CLOUDPANEL**

### **OPTION 1 : DÉPLOIEMENT VIA CLOUDPANEL (RECOMMANDÉ)**

#### **1. Créer un nouveau site dans CloudPanel**
1. Connectez-vous à CloudPanel : `http://72.60.187.85:8443`
2. Cliquez sur **"Sites"** dans le menu
3. Cliquez sur **"Ajouter un site"**
4. Configurez :
   - **Nom du site :** ecosystia
   - **Domaine :** ecosystia.impulcia-afrique.com (ou votre domaine)
   - **Type :** Node.js
   - **Version Node.js :** 20.x

#### **2. Télécharger l'archive de déploiement**
```bash
# Depuis votre machine Windows
scp C:\temp\ecosystia-deploy-20251005_185517.zip root@72.60.187.85:/tmp/
```

#### **3. Déployer via SSH**
```bash
# Se connecter au serveur
ssh root@72.60.187.85

# Aller dans le répertoire du site CloudPanel
cd /home/ecosystia/htdocs/public

# Extraire l'archive
unzip /tmp/ecosystia-deploy-20251005_185517.zip

# Installer les dépendances
npm install

# Démarrer l'application
npm start
```

### **OPTION 2 : DÉPLOIEMENT MANUEL COMPLET**

#### **1. Préparer l'environnement**
```bash
# Se connecter au serveur
ssh root@72.60.187.85

# Installer Node.js 20.x si nécessaire
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
apt-get install -y nodejs

# Installer PM2
npm install -g pm2
```

#### **2. Créer l'utilisateur et les répertoires**
```bash
# Créer l'utilisateur ecosystia
useradd -m -s /bin/bash ecosystia

# Créer le répertoire de l'application
mkdir -p /var/www/ecosystia
chown -R ecosystia:www-data /var/www/ecosystia
```

#### **3. Déployer l'application**
```bash
# Aller dans le répertoire
cd /var/www/ecosystia

# Extraire l'archive
unzip /tmp/ecosystia-deploy-20251005_185517.zip

# Installer les dépendances
npm install

# Configurer les permissions
chown -R ecosystia:www-data /var/www/ecosystia
chmod -R 755 /var/www/ecosystia
```

#### **4. Configurer Nginx (si pas via CloudPanel)**
```bash
# Créer la configuration Nginx
cat > /etc/nginx/sites-available/ecosystia << 'EOF'
server {
    listen 80;
    server_name ecosystia.impulcia-afrique.com;
    
    root /var/www/ecosystia/dist;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    location /api/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF

# Activer le site
ln -s /etc/nginx/sites-available/ecosystia /etc/nginx/sites-enabled/
nginx -t
systemctl reload nginx
```

#### **5. Démarrer avec PM2**
```bash
# Démarrer l'application
pm2 start ecosystem.config.js

# Sauvegarder la configuration
pm2 save
pm2 startup
```

---

## 🔧 **CONFIGURATION SUPABASE**

### **Variables d'environnement**
```bash
# Éditer le fichier .env
nano /var/www/ecosystia/.env
```

```env
NODE_ENV=production
PORT=3000
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
DOMAIN_NAME=ecosystia.impulcia-afrique.com
```

---

## 📊 **MONITORING ET GESTION**

### **Commandes PM2 utiles**
```bash
# Statut
pm2 status

# Logs
pm2 logs ecosystia

# Redémarrage
pm2 restart ecosystia

# Monitoring
pm2 monit
```

### **Health Check**
```bash
# Test local
curl http://localhost:3000/api/health

# Test public
curl http://72.60.187.85/api/health
```

---

## 🌐 **CONFIGURATION DOMAINE**

### **DNS Configuration**
Configurez votre domaine pour pointer vers l'IP du serveur :
```
A    ecosystia.impulcia-afrique.com    72.60.187.85
```

### **SSL avec Let's Encrypt**
```bash
# Installer Certbot
apt install certbot python3-certbot-nginx

# Obtenir le certificat
certbot --nginx -d ecosystia.impulcia-afrique.com
```

---

## 🎯 **VÉRIFICATION FINALE**

### **URLs de test**
- 🌐 **Application :** http://72.60.187.85 ou http://ecosystia.impulcia-afrique.com
- 🔍 **Health Check :** http://72.60.187.85/api/health
- 📊 **Status :** http://72.60.187.85/api/status

### **Checklist**
- ✅ Site créé dans CloudPanel (si Option 1)
- ✅ Archive transférée et extraite
- ✅ Dépendances installées
- ✅ Application démarrée avec PM2
- ✅ Nginx configuré
- ✅ Variables d'environnement configurées
- ✅ Health check fonctionnel

---

## 🚨 **DÉPANNAGE**

### **Problèmes courants**

#### **1. Port déjà utilisé**
```bash
netstat -tlnp | grep :3000
pm2 stop ecosystia
pm2 start ecosystem.config.js
```

#### **2. Permissions**
```bash
chown -R ecosystia:www-data /var/www/ecosystia
chmod -R 755 /var/www/ecosystia
```

#### **3. Nginx ne fonctionne pas**
```bash
nginx -t
systemctl status nginx
systemctl restart nginx
```

---

## 🏆 **AVANTAGES CLOUDPANEL**

- ✅ **Interface graphique** intuitive
- ✅ **Gestion des sites** simplifiée
- ✅ **SSL automatique** avec Let's Encrypt
- ✅ **Monitoring** intégré
- ✅ **Sauvegardes** automatiques
- ✅ **Gestion des utilisateurs** et permissions

---

**🎉 Avec CloudPanel, le déploiement d'EcosystIA sera beaucoup plus simple et professionnel !**
