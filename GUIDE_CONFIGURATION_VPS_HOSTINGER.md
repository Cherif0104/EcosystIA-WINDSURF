# 🖥️ GUIDE CONFIGURATION VPS HOSTINGER - ECOSYSTIA

## 📋 **INFORMATIONS GÉNÉRALES**

**Plateforme :** Hostinger VPS  
**Application :** EcosystIA - SENEGEL  
**OS :** Ubuntu 22.04 LTS  
**Développeur :** IMPULCIA AFRIQUE  

---

## 🚀 **ÉTAPE 1 : CONFIGURATION INITIALE VPS**

### **1.1 Connexion au VPS**
```bash
# Connexion SSH
ssh root@your-vps-ip

# Ou avec utilisateur spécifique
ssh username@your-vps-ip
```

### **1.2 Mise à jour du système**
```bash
# Mise à jour des packages
apt update && apt upgrade -y

# Installation des outils essentiels
apt install -y curl wget git vim htop unzip software-properties-common
```

### **1.3 Configuration utilisateur**
```bash
# Créer un utilisateur non-root
adduser ecosystia
usermod -aG sudo ecosystia

# Configuration SSH
cp -r /root/.ssh /home/ecosystia/
chown -R ecosystia:ecosystia /home/ecosystia/.ssh
```

---

## 🛡️ **ÉTAPE 2 : SÉCURITÉ DU SERVEUR**

### **2.1 Configuration Firewall (UFW)**
```bash
# Installation UFW
apt install -y ufw

# Configuration des règles
ufw default deny incoming
ufw default allow outgoing

# Autoriser SSH
ufw allow ssh

# Autoriser HTTP et HTTPS
ufw allow 80/tcp
ufw allow 443/tcp

# Activer le firewall
ufw enable

# Vérifier le statut
ufw status
```

### **2.2 Configuration SSH**
```bash
# Éditer la configuration SSH
vim /etc/ssh/sshd_config

# Modifications recommandées:
# Port 2222 (changer le port par défaut)
# PermitRootLogin no
# PasswordAuthentication no
# PubkeyAuthentication yes

# Redémarrer SSH
systemctl restart ssh
```

### **2.3 Installation Fail2ban**
```bash
# Installation
apt install -y fail2ban

# Configuration
cp /etc/fail2ban/jail.conf /etc/fail2ban/jail.local

# Éditer la configuration
vim /etc/fail2ban/jail.local

# Activer et démarrer
systemctl enable fail2ban
systemctl start fail2ban
```

---

## 🌐 **ÉTAPE 3 : INSTALLATION NGINX**

### **3.1 Installation Nginx**
```bash
# Installation
apt install -y nginx

# Démarrer et activer
systemctl start nginx
systemctl enable nginx

# Vérifier le statut
systemctl status nginx
```

### **3.2 Configuration Nginx pour EcosystIA**
```bash
# Créer le fichier de configuration
vim /etc/nginx/sites-available/ecosystia

# Contenu du fichier:
server {
    listen 80;
    server_name ecosystia.senegel.org;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name ecosystia.senegel.org;
    
    ssl_certificate /etc/letsencrypt/live/ecosystia.senegel.org/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/ecosystia.senegel.org/privkey.pem;
    
    root /var/www/ecosystia/dist;
    index index.html;
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
    
    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # Main application
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # API proxy (si nécessaire)
    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

# Activer le site
ln -s /etc/nginx/sites-available/ecosystia /etc/nginx/sites-enabled/

# Désactiver le site par défaut
rm /etc/nginx/sites-enabled/default

# Tester la configuration
nginx -t

# Redémarrer Nginx
systemctl restart nginx
```

---

## 🟢 **ÉTAPE 4 : INSTALLATION NODE.JS**

### **4.1 Installation Node.js 20.x**
```bash
# Ajouter le repository NodeSource
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -

# Installation Node.js
apt install -y nodejs

# Vérifier l'installation
node --version
npm --version
```

### **4.2 Installation PM2**
```bash
# Installation globale PM2
npm install -g pm2

# Configuration PM2
pm2 startup
pm2 save
```

---

## 🔒 **ÉTAPE 5 : CONFIGURATION SSL**

### **5.1 Installation Certbot**
```bash
# Installation Certbot
apt install -y certbot python3-certbot-nginx

# Obtenir le certificat SSL
certbot --nginx -d ecosystia.senegel.org

# Configuration auto-renewal
crontab -e

# Ajouter cette ligne:
0 12 * * * /usr/bin/certbot renew --quiet
```

### **5.2 Vérification SSL**
```bash
# Tester la configuration SSL
openssl s_client -connect ecosystia.senegel.org:443 -servername ecosystia.senegel.org

# Vérifier avec SSL Labs
# https://www.ssllabs.com/ssltest/
```

---

## 📁 **ÉTAPE 6 : PRÉPARATION DU RÉPERTOIRE**

### **6.1 Création des dossiers**
```bash
# Créer le répertoire de l'application
mkdir -p /var/www/ecosystia
mkdir -p /var/log/ecosystia

# Permissions
chown -R www-data:www-data /var/www/ecosystia
chmod -R 755 /var/www/ecosystia
```

### **6.2 Configuration des logs**
```bash
# Créer la configuration de logrotate
vim /etc/logrotate.d/ecosystia

# Contenu:
/var/log/ecosystia/*.log {
    daily
    missingok
    rotate 52
    compress
    delaycompress
    notifempty
    create 644 www-data www-data
}
```

---

## 🔧 **ÉTAPE 7 : CONFIGURATION PM2**

### **7.1 Fichier de configuration PM2**
```bash
# Créer le fichier de configuration
vim /var/www/ecosystia/ecosystem.config.js

# Contenu:
module.exports = {
  apps: [{
    name: 'ecosystia',
    script: 'npm',
    args: 'start',
    cwd: '/var/www/ecosystia',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: '/var/log/ecosystia/error.log',
    out_file: '/var/log/ecosystia/out.log',
    log_file: '/var/log/ecosystia/combined.log',
    time: true,
    max_memory_restart: '1G'
  }]
};
```

---

## 📊 **ÉTAPE 8 : MONITORING ET LOGS**

### **8.1 Installation des outils de monitoring**
```bash
# Installation htop et iotop
apt install -y htop iotop

# Installation netstat
apt install -y net-tools

# Installation dstat
apt install -y dstat
```

### **8.2 Script de monitoring**
```bash
# Créer le script de monitoring
vim /usr/local/bin/ecosystia-monitor

# Contenu:
#!/bin/bash

LOG_FILE="/var/log/ecosystia/monitor.log"
DATE=$(date '+%Y-%m-%d %H:%M:%S')

# Vérification de la santé de l'application
HEALTH_CHECK=$(curl -s -o /dev/null -w "%{http_code}" https://ecosystia.senegel.org/)

if [ "$HEALTH_CHECK" != "200" ]; then
    echo "[$DATE] ALERT: Application not responding (HTTP $HEALTH_CHECK)" >> $LOG_FILE
fi

# Vérification de l'espace disque
DISK_USAGE=$(df / | tail -1 | awk '{print $5}' | sed 's/%//')
if [ "$DISK_USAGE" -gt 80 ]; then
    echo "[$DATE] ALERT: Disk usage high ($DISK_USAGE%)" >> $LOG_FILE
fi

# Vérification de la mémoire
MEMORY_USAGE=$(free | grep Mem | awk '{printf("%.0f", $3/$2 * 100.0)}')
if [ "$MEMORY_USAGE" -gt 80 ]; then
    echo "[$DATE] ALERT: Memory usage high ($MEMORY_USAGE%)" >> $LOG_FILE
fi

# Vérification des processus PM2
PM2_STATUS=$(pm2 status | grep ecosystia | awk '{print $10}')
if [ "$PM2_STATUS" != "online" ]; then
    echo "[$DATE] ALERT: PM2 process not online ($PM2_STATUS)" >> $LOG_FILE
fi

# Rendre exécutable
chmod +x /usr/local/bin/ecosystia-monitor

# Ajouter au crontab
crontab -e

# Ajouter cette ligne (exécution toutes les 5 minutes):
*/5 * * * * /usr/local/bin/ecosystia-monitor
```

---

## 💾 **ÉTAPE 9 : CONFIGURATION BACKUP**

### **9.1 Script de backup**
```bash
# Créer le script de backup
vim /usr/local/bin/ecosystia-backup

# Contenu:
#!/bin/bash

BACKUP_DIR="/var/backups/ecosystia"
DATE=$(date +%Y%m%d_%H%M%S)

# Créer le dossier de backup
mkdir -p $BACKUP_DIR

# Backup des fichiers de l'application
tar -czf $BACKUP_DIR/ecosystia-files-$DATE.tar.gz /var/www/ecosystia/

# Backup de la configuration Nginx
cp /etc/nginx/sites-available/ecosystia $BACKUP_DIR/nginx-config-$DATE.conf

# Backup de la configuration PM2
cp /var/www/ecosystia/ecosystem.config.js $BACKUP_DIR/pm2-config-$DATE.js

# Nettoyer les anciens backups (garder 7 jours)
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete
find $BACKUP_DIR -name "*.conf" -mtime +7 -delete
find $BACKUP_DIR -name "*.js" -mtime +7 -delete

echo "Backup completed: $DATE" >> /var/log/ecosystia/backup.log

# Rendre exécutable
chmod +x /usr/local/bin/ecosystia-backup

# Ajouter au crontab (backup quotidien à 2h)
crontab -e

# Ajouter cette ligne:
0 2 * * * /usr/local/bin/ecosystia-backup
```

---

## 🚀 **ÉTAPE 10 : DÉPLOIEMENT DE L'APPLICATION**

### **10.1 Upload des fichiers**
```bash
# Depuis votre machine locale, uploader l'application
scp -r dist/* ecosystia@your-vps-ip:/var/www/ecosystia/dist/

# Ou utiliser le script de déploiement
chmod +x scripts/deployToVPS.sh
./scripts/deployToVPS.sh
```

### **10.2 Démarrage de l'application**
```bash
# Aller dans le répertoire de l'application
cd /var/www/ecosystia

# Démarrer avec PM2
pm2 start ecosystem.config.js

# Sauvegarder la configuration PM2
pm2 save

# Vérifier le statut
pm2 status
pm2 logs ecosystia
```

---

## ✅ **ÉTAPE 11 : TESTS DE VALIDATION**

### **11.1 Tests de connectivité**
```bash
# Test local
curl -I http://localhost

# Test HTTPS
curl -I https://ecosystia.senegel.org

# Test avec certificat SSL
openssl s_client -connect ecosystia.senegel.org:443 -servername ecosystia.senegel.org
```

### **11.2 Tests de performance**
```bash
# Test de charge (si apache bench est installé)
apt install -y apache2-utils
ab -n 100 -c 10 https://ecosystia.senegel.org/

# Test de temps de réponse
curl -o /dev/null -s -w "Time: %{time_total}s\n" https://ecosystia.senegel.org/
```

### **11.3 Tests de sécurité**
```bash
# Vérification des headers de sécurité
curl -I https://ecosystia.senegel.org

# Test SSL Labs
# https://www.ssllabs.com/ssltest/analyze.html?d=ecosystia.senegel.org
```

---

## 📋 **CHECKLIST DE VALIDATION**

### **Infrastructure**
- [ ] VPS configuré et sécurisé
- [ ] Nginx installé et configuré
- [ ] SSL certificate installé et valide
- [ ] Firewall configuré
- [ ] Fail2ban activé

### **Application**
- [ ] Node.js 20.x installé
- [ ] PM2 configuré et fonctionnel
- [ ] Application accessible via HTTPS
- [ ] Tous les modules fonctionnels
- [ ] Performance optimisée

### **Monitoring**
- [ ] Script de monitoring configuré
- [ ] Logs configurés et rotatés
- [ ] Backup automatique configuré
- [ ] Alertes configurées
- [ ] Crontab configuré

### **Sécurité**
- [ ] HTTPS redirection active
- [ ] Headers de sécurité configurés
- [ ] Firewall actif
- [ ] SSH sécurisé
- [ ] Certificat SSL valide

---

## 🔧 **COMMANDES UTILES**

### **Gestion de l'application**
```bash
# Statut PM2
pm2 status
pm2 logs ecosystia
pm2 restart ecosystia
pm2 stop ecosystia
pm2 start ecosystia

# Nginx
systemctl status nginx
systemctl restart nginx
nginx -t

# Logs
tail -f /var/log/ecosystia/error.log
tail -f /var/log/ecosystia/out.log
```

### **Monitoring**
```bash
# Ressources système
htop
df -h
free -h
iostat

# Réseau
netstat -tulpn
ss -tulpn
```

### **Maintenance**
```bash
# Mise à jour système
apt update && apt upgrade -y

# Nettoyage
apt autoremove -y
apt autoclean

# Backup manuel
/usr/local/bin/ecosystia-backup
```

---

## 📞 **SUPPORT ET MAINTENANCE**

### **Support Immédiat**
- **Email** : support@impulcia-afrique.com
- **Téléphone** : +221 78 832 40 69
- **Urgences** : 24/7 disponible

### **Maintenance Préventive**
- **Mises à jour** : Hebdomadaire
- **Backup** : Quotidien
- **Monitoring** : 24/7
- **Sécurité** : Mensuel

---

## 🎯 **PROCHAINES ÉTAPES**

### **Immédiat**
1. **Tester l'application** - Validation complète
2. **Configurer le monitoring** - Alertes et notifications
3. **Former l'équipe** - Utilisateurs SENEGEL
4. **Documenter** - Guides utilisateur

### **Court terme**
1. **Optimisation** - Performance et sécurité
2. **Backup cloud** - Sauvegarde externe
3. **CDN** - Distribution mondiale
4. **Analytics** - Métriques détaillées

### **Moyen terme**
1. **Scalabilité** - Load balancing
2. **High availability** - Redondance
3. **Disaster recovery** - Plan de reprise
4. **Évolution** - Nouvelles fonctionnalités

---

**EcosystIA - Prêt pour la production sur VPS Hostinger !** 🚀🇸🇳
