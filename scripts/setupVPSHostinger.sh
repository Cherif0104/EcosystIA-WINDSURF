#!/bin/bash

# 🖥️ SCRIPT DE CONFIGURATION AUTOMATIQUE VPS HOSTINGER
# Développé par IMPULCIA AFRIQUE pour SENEGEL EcosystIA

set -e  # Arrêter en cas d'erreur

# Couleurs pour les logs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
DOMAIN="ecosystia.senegel.org"
APP_NAME="ecosystia"
APP_PATH="/var/www/ecosystia"
USER="ecosystia"

echo -e "${BLUE}🖥️  CONFIGURATION VPS HOSTINGER POUR ECOSYSTIA${NC}"
echo -e "${BLUE}==============================================${NC}"
echo ""

# Fonction pour afficher les messages
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Vérification des droits root
check_root() {
    if [ "$EUID" -ne 0 ]; then
        log_error "Ce script doit être exécuté en tant que root"
        exit 1
    fi
    log_success "Droits root vérifiés"
}

# Mise à jour du système
update_system() {
    log_info "Mise à jour du système..."
    
    apt update -y
    apt upgrade -y
    apt install -y curl wget git vim htop unzip software-properties-common
    
    log_success "Système mis à jour"
}

# Configuration de la sécurité
setup_security() {
    log_info "Configuration de la sécurité..."
    
    # Installation et configuration UFW
    apt install -y ufw
    ufw default deny incoming
    ufw default allow outgoing
    ufw allow ssh
    ufw allow 80/tcp
    ufw allow 443/tcp
    ufw --force enable
    
    # Installation Fail2ban
    apt install -y fail2ban
    systemctl enable fail2ban
    systemctl start fail2ban
    
    log_success "Sécurité configurée"
}

# Création de l'utilisateur
create_user() {
    log_info "Création de l'utilisateur $USER..."
    
    if ! id "$USER" &>/dev/null; then
        useradd -m -s /bin/bash $USER
        usermod -aG sudo $USER
        log_success "Utilisateur $USER créé"
    else
        log_warning "Utilisateur $USER existe déjà"
    fi
    
    # Configuration SSH pour l'utilisateur
    mkdir -p /home/$USER/.ssh
    cp -r /root/.ssh/* /home/$USER/.ssh/ 2>/dev/null || true
    chown -R $USER:$USER /home/$USER/.ssh
    chmod 700 /home/$USER/.ssh
    chmod 600 /home/$USER/.ssh/* 2>/dev/null || true
}

# Installation Nginx
install_nginx() {
    log_info "Installation de Nginx..."
    
    apt install -y nginx
    systemctl start nginx
    systemctl enable nginx
    
    # Configuration Nginx pour EcosystIA
    cat > /etc/nginx/sites-available/$APP_NAME << EOF
server {
    listen 80;
    server_name $DOMAIN;
    return 301 https://\$server_name\$request_uri;
}

server {
    listen 443 ssl http2;
    server_name $DOMAIN;
    
    ssl_certificate /etc/letsencrypt/live/$DOMAIN/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/$DOMAIN/privkey.pem;
    
    root $APP_PATH/dist;
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
        try_files \$uri \$uri/ /index.html;
    }
    
    # API proxy (si nécessaire)
    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF
    
    # Activer le site
    ln -sf /etc/nginx/sites-available/$APP_NAME /etc/nginx/sites-enabled/
    rm -f /etc/nginx/sites-enabled/default
    
    # Tester la configuration
    nginx -t
    
    log_success "Nginx installé et configuré"
}

# Installation Node.js
install_nodejs() {
    log_info "Installation de Node.js 20.x..."
    
    # Ajouter le repository NodeSource
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt install -y nodejs
    
    # Installation PM2
    npm install -g pm2
    
    # Configuration PM2
    sudo -u $USER pm2 startup systemd -u $USER --hp /home/$USER
    
    log_success "Node.js et PM2 installés"
}

# Installation Certbot
install_certbot() {
    log_info "Installation de Certbot..."
    
    apt install -y certbot python3-certbot-nginx
    
    log_success "Certbot installé"
}

# Création des répertoires
create_directories() {
    log_info "Création des répertoires..."
    
    mkdir -p $APP_PATH
    mkdir -p /var/log/$APP_NAME
    mkdir -p /var/backups/$APP_NAME
    
    # Permissions
    chown -R $USER:$USER $APP_PATH
    chown -R $USER:$USER /var/log/$APP_NAME
    chmod -R 755 $APP_PATH
    
    log_success "Répertoires créés"
}

# Configuration PM2
setup_pm2() {
    log_info "Configuration PM2..."
    
    cat > $APP_PATH/ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: '$APP_NAME',
    script: 'npm',
    args: 'start',
    cwd: '$APP_PATH',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: '/var/log/$APP_NAME/error.log',
    out_file: '/var/log/$APP_NAME/out.log',
    log_file: '/var/log/$APP_NAME/combined.log',
    time: true,
    max_memory_restart: '1G'
  }]
};
EOF
    
    chown $USER:$USER $APP_PATH/ecosystem.config.js
    
    log_success "PM2 configuré"
}

# Configuration du monitoring
setup_monitoring() {
    log_info "Configuration du monitoring..."
    
    # Script de monitoring
    cat > /usr/local/bin/$APP_NAME-monitor << 'EOF'
#!/bin/bash

APP_NAME="ecosystia"
DOMAIN="ecosystia.senegel.org"
LOG_FILE="/var/log/$APP_NAME/monitor.log"
DATE=$(date '+%Y-%m-%d %H:%M:%S')

# Vérification de la santé de l'application
HEALTH_CHECK=$(curl -s -o /dev/null -w "%{http_code}" https://$DOMAIN/)

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
PM2_STATUS=$(sudo -u ecosystia pm2 status | grep $APP_NAME | awk '{print $10}')
if [ "$PM2_STATUS" != "online" ]; then
    echo "[$DATE] ALERT: PM2 process not online ($PM2_STATUS)" >> $LOG_FILE
fi
EOF
    
    chmod +x /usr/local/bin/$APP_NAME-monitor
    
    # Ajouter au crontab
    (crontab -l 2>/dev/null; echo "*/5 * * * * /usr/local/bin/$APP_NAME-monitor") | crontab -
    
    log_success "Monitoring configuré"
}

# Configuration du backup
setup_backup() {
    log_info "Configuration du backup..."
    
    # Script de backup
    cat > /usr/local/bin/$APP_NAME-backup << 'EOF'
#!/bin/bash

APP_NAME="ecosystia"
APP_PATH="/var/www/ecosystia"
BACKUP_DIR="/var/backups/$APP_NAME"
DATE=$(date +%Y%m%d_%H%M%S)

# Créer le dossier de backup
mkdir -p $BACKUP_DIR

# Backup des fichiers de l'application
tar -czf $BACKUP_DIR/$APP_NAME-files-$DATE.tar.gz $APP_PATH/

# Backup de la configuration Nginx
cp /etc/nginx/sites-available/$APP_NAME $BACKUP_DIR/nginx-config-$DATE.conf

# Backup de la configuration PM2
cp $APP_PATH/ecosystem.config.js $BACKUP_DIR/pm2-config-$DATE.js

# Nettoyer les anciens backups (garder 7 jours)
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete
find $BACKUP_DIR -name "*.conf" -mtime +7 -delete
find $BACKUP_DIR -name "*.js" -mtime +7 -delete

echo "Backup completed: $DATE" >> /var/log/$APP_NAME/backup.log
EOF
    
    chmod +x /usr/local/bin/$APP_NAME-backup
    
    # Ajouter au crontab (backup quotidien à 2h)
    (crontab -l 2>/dev/null; echo "0 2 * * * /usr/local/bin/$APP_NAME-backup") | crontab -
    
    log_success "Backup configuré"
}

# Configuration des logs
setup_logs() {
    log_info "Configuration des logs..."
    
    # Configuration logrotate
    cat > /etc/logrotate.d/$APP_NAME << EOF
/var/log/$APP_NAME/*.log {
    daily
    missingok
    rotate 52
    compress
    delaycompress
    notifempty
    create 644 $USER $USER
}
EOF
    
    log_success "Logs configurés"
}

# Installation des outils de monitoring
install_monitoring_tools() {
    log_info "Installation des outils de monitoring..."
    
    apt install -y htop iotop net-tools dstat
    
    log_success "Outils de monitoring installés"
}

# Configuration finale
final_setup() {
    log_info "Configuration finale..."
    
    # Redémarrer Nginx
    systemctl restart nginx
    
    # Vérifier les services
    systemctl is-active --quiet nginx && log_success "Nginx actif" || log_error "Nginx inactif"
    systemctl is-active --quiet fail2ban && log_success "Fail2ban actif" || log_error "Fail2ban inactif"
    
    log_success "Configuration finale terminée"
}

# Affichage des informations
show_info() {
    echo ""
    echo -e "${GREEN}🎉 CONFIGURATION VPS TERMINÉE AVEC SUCCÈS !${NC}"
    echo -e "${GREEN}==========================================${NC}"
    echo ""
    echo -e "${BLUE}📋 Informations de connexion:${NC}"
    echo -e "${BLUE}   Utilisateur: $USER${NC}"
    echo -e "${BLUE}   Application: $APP_PATH${NC}"
    echo -e "${BLUE}   Domain: $DOMAIN${NC}"
    echo ""
    echo -e "${YELLOW}🔧 Prochaines étapes:${NC}"
    echo -e "${YELLOW}   1. Configurer le certificat SSL:${NC}"
    echo -e "${YELLOW}      certbot --nginx -d $DOMAIN${NC}"
    echo -e "${YELLOW}   2. Uploader l'application EcosystIA${NC}"
    echo -e "${YELLOW}   3. Démarrer l'application:${NC}"
    echo -e "${YELLOW}      sudo -u $USER pm2 start $APP_PATH/ecosystem.config.js${NC}"
    echo -e "${YELLOW}   4. Sauvegarder la configuration PM2:${NC}"
    echo -e "${YELLOW}      sudo -u $USER pm2 save${NC}"
    echo ""
    echo -e "${BLUE}📊 Monitoring:${NC}"
    echo -e "${BLUE}   - Logs: /var/log/$APP_NAME/${NC}"
    echo -e "${BLUE}   - Backup: /var/backups/$APP_NAME/${NC}"
    echo -e "${BLUE}   - Monitoring: /usr/local/bin/$APP_NAME-monitor${NC}"
    echo ""
    echo -e "${BLUE}🚀 Votre VPS est prêt pour EcosystIA !${NC}"
}

# Fonction principale
main() {
    echo -e "${BLUE}🎯 Début de la configuration VPS Hostinger${NC}"
    echo ""
    
    check_root
    update_system
    setup_security
    create_user
    install_nginx
    install_nodejs
    install_certbot
    create_directories
    setup_pm2
    setup_monitoring
    setup_backup
    setup_logs
    install_monitoring_tools
    final_setup
    show_info
}

# Gestion des erreurs
trap 'log_error "Configuration échouée à la ligne $LINENO"' ERR

# Exécution
main "$@"
