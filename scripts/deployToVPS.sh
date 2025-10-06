#!/bin/bash

# 🚀 SCRIPT DE DÉPLOIEMENT ECOSYSTIA SUR VPS HOSTINGER
# Développé par IMPULCIA AFRIQUE pour SENEGEL

set -e  # Arrêter en cas d'erreur

# Couleurs pour les logs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
VPS_HOST="your-vps-hostinger.com"
VPS_USER="your-username"
VPS_PATH="/var/www/ecosystia"
DOMAIN="ecosystia.senegel.org"
APP_NAME="ecosystia"

echo -e "${BLUE}🚀 DÉPLOIEMENT ECOSYSTIA SUR VPS HOSTINGER${NC}"
echo -e "${BLUE}==========================================${NC}"
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

# Vérification des prérequis
check_prerequisites() {
    log_info "Vérification des prérequis..."
    
    # Vérifier Node.js
    if ! command -v node &> /dev/null; then
        log_error "Node.js n'est pas installé"
        exit 1
    fi
    
    # Vérifier npm
    if ! command -v npm &> /dev/null; then
        log_error "npm n'est pas installé"
        exit 1
    fi
    
    # Vérifier SSH
    if ! command -v ssh &> /dev/null; then
        log_error "SSH n'est pas installé"
        exit 1
    fi
    
    log_success "Prérequis vérifiés"
}

# Build de l'application
build_application() {
    log_info "Construction de l'application pour la production..."
    
    # Nettoyer le cache
    npm run clean || true
    
    # Installer les dépendances
    log_info "Installation des dépendances..."
    npm ci --production=false
    
    # Build de l'application
    log_info "Build de l'application..."
    npm run build
    
    # Vérifier que le build a réussi
    if [ ! -d "dist" ]; then
        log_error "Le build a échoué - dossier dist manquant"
        exit 1
    fi
    
    log_success "Application construite avec succès"
}

# Optimisation du build
optimize_build() {
    log_info "Optimisation du build..."
    
    # Compresser les fichiers
    cd dist
    
    # Compresser les fichiers JS et CSS
    find . -name "*.js" -exec gzip -k {} \;
    find . -name "*.css" -exec gzip -k {} \;
    
    # Optimiser les images (si imagemagick est disponible)
    if command -v convert &> /dev/null; then
        find . -name "*.png" -exec convert {} -quality 85 {} \;
        find . -name "*.jpg" -exec convert {} -quality 85 {} \;
    fi
    
    cd ..
    
    log_success "Build optimisé"
}

# Configuration du serveur VPS
configure_vps() {
    log_info "Configuration du serveur VPS..."
    
    # Créer le dossier de l'application
    ssh ${VPS_USER}@${VPS_HOST} "mkdir -p ${VPS_PATH}"
    
    # Configuration Nginx
    log_info "Configuration Nginx..."
    cat > nginx.conf << EOF
server {
    listen 80;
    server_name ${DOMAIN};
    return 301 https://\$server_name\$request_uri;
}

server {
    listen 443 ssl http2;
    server_name ${DOMAIN};
    
    ssl_certificate /etc/letsencrypt/live/${DOMAIN}/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/${DOMAIN}/privkey.pem;
    
    root ${VPS_PATH}/dist;
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
    
    # Upload de la configuration Nginx
    scp nginx.conf ${VPS_USER}@${VPS_HOST}:/tmp/ecosystia.conf
    ssh ${VPS_USER}@${VPS_HOST} "sudo mv /tmp/ecosystia.conf /etc/nginx/sites-available/ecosystia"
    ssh ${VPS_USER}@${VPS_HOST} "sudo ln -sf /etc/nginx/sites-available/ecosystia /etc/nginx/sites-enabled/"
    
    log_success "Serveur VPS configuré"
}

# Upload de l'application
upload_application() {
    log_info "Upload de l'application sur le VPS..."
    
    # Créer une archive
    tar -czf ecosystia-build.tar.gz -C dist .
    
    # Upload de l'archive
    scp ecosystia-build.tar.gz ${VPS_USER}@${VPS_HOST}:/tmp/
    
    # Extraction sur le serveur
    ssh ${VPS_USER}@${VPS_HOST} "
        cd ${VPS_PATH}
        sudo rm -rf dist
        sudo mkdir -p dist
        sudo tar -xzf /tmp/ecosystia-build.tar.gz -C dist/
        sudo chown -R www-data:www-data ${VPS_PATH}
        sudo chmod -R 755 ${VPS_PATH}
        rm /tmp/ecosystia-build.tar.gz
    "
    
    # Nettoyer l'archive locale
    rm ecosystia-build.tar.gz
    
    log_success "Application uploadée avec succès"
}

# Configuration SSL
setup_ssl() {
    log_info "Configuration SSL avec Let's Encrypt..."
    
    # Installer Certbot si nécessaire
    ssh ${VPS_USER}@${VPS_HOST} "
        if ! command -v certbot &> /dev/null; then
            sudo apt update
            sudo apt install -y certbot python3-certbot-nginx
        fi
    "
    
    # Obtenir le certificat SSL
    ssh ${VPS_USER}@${VPS_HOST} "
        sudo certbot --nginx -d ${DOMAIN} --non-interactive --agree-tos --email admin@senegel.org
    "
    
    log_success "SSL configuré avec succès"
}

# Configuration PM2
setup_pm2() {
    log_info "Configuration PM2..."
    
    # Créer la configuration PM2
    cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: '${APP_NAME}',
    script: 'npm',
    args: 'start',
    cwd: '${VPS_PATH}',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: '/var/log/pm2/${APP_NAME}-error.log',
    out_file: '/var/log/pm2/${APP_NAME}-out.log',
    log_file: '/var/log/pm2/${APP_NAME}-combined.log',
    time: true
  }]
};
EOF
    
    # Upload de la configuration PM2
    scp ecosystem.config.js ${VPS_USER}@${VPS_HOST}:/tmp/
    ssh ${VPS_USER}@${VPS_HOST} "sudo mv /tmp/ecosystem.config.js ${VPS_PATH}/"
    
    # Installer et configurer PM2
    ssh ${VPS_USER}@${VPS_HOST} "
        if ! command -v pm2 &> /dev/null; then
            sudo npm install -g pm2
        fi
        
        cd ${VPS_PATH}
        sudo pm2 start ecosystem.config.js
        sudo pm2 save
        sudo pm2 startup
    "
    
    log_success "PM2 configuré avec succès"
}

# Configuration du monitoring
setup_monitoring() {
    log_info "Configuration du monitoring..."
    
    # Script de monitoring
    cat > monitor.sh << 'EOF'
#!/bin/bash

# Vérification de la santé de l'application
HEALTH_CHECK=$(curl -s -o /dev/null -w "%{http_code}" https://ecosystia.senegel.org/)

if [ "$HEALTH_CHECK" != "200" ]; then
    echo "ALERT: Application not responding (HTTP $HEALTH_CHECK)"
    # Envoyer une alerte email ou Slack
fi

# Vérification de l'espace disque
DISK_USAGE=$(df / | tail -1 | awk '{print $5}' | sed 's/%//')
if [ "$DISK_USAGE" -gt 80 ]; then
    echo "ALERT: Disk usage high ($DISK_USAGE%)"
fi

# Vérification de la mémoire
MEMORY_USAGE=$(free | grep Mem | awk '{printf("%.0f", $3/$2 * 100.0)}')
if [ "$MEMORY_USAGE" -gt 80 ]; then
    echo "ALERT: Memory usage high ($MEMORY_USAGE%)"
fi
EOF
    
    # Upload et configuration du script de monitoring
    scp monitor.sh ${VPS_USER}@${VPS_HOST}:/tmp/
    ssh ${VPS_USER}@${VPS_HOST} "
        sudo mv /tmp/monitor.sh /usr/local/bin/ecosystia-monitor
        sudo chmod +x /usr/local/bin/ecosystia-monitor
        
        # Ajouter au crontab pour exécution toutes les 5 minutes
        (crontab -l 2>/dev/null; echo "*/5 * * * * /usr/local/bin/ecosystia-monitor") | crontab -
    "
    
    log_success "Monitoring configuré avec succès"
}

# Configuration du backup
setup_backup() {
    log_info "Configuration du backup automatique..."
    
    # Script de backup
    cat > backup.sh << 'EOF'
#!/bin/bash

BACKUP_DIR="/var/backups/ecosystia"
DATE=$(date +%Y%m%d_%H%M%S)

# Créer le dossier de backup
mkdir -p $BACKUP_DIR

# Backup des fichiers de l'application
tar -czf $BACKUP_DIR/ecosystia-files-$DATE.tar.gz /var/www/ecosystia/

# Backup de la base de données (si configuré)
if [ ! -z "$DATABASE_URL" ]; then
    pg_dump $DATABASE_URL > $BACKUP_DIR/ecosystia-db-$DATE.sql
fi

# Nettoyer les anciens backups (garder 7 jours)
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete
find $BACKUP_DIR -name "*.sql" -mtime +7 -delete

echo "Backup completed: $DATE"
EOF
    
    # Upload et configuration du script de backup
    scp backup.sh ${VPS_USER}@${VPS_HOST}:/tmp/
    ssh ${VPS_USER}@${VPS_HOST} "
        sudo mv /tmp/backup.sh /usr/local/bin/ecosystia-backup
        sudo chmod +x /usr/local/bin/ecosystia-backup
        
        # Ajouter au crontab pour exécution quotidienne à 2h
        (crontab -l 2>/dev/null; echo "0 2 * * * /usr/local/bin/ecosystia-backup") | crontab -
    "
    
    log_success "Backup automatique configuré"
}

# Tests de validation
run_tests() {
    log_info "Exécution des tests de validation..."
    
    # Test de connectivité
    if ! curl -f -s https://${DOMAIN} > /dev/null; then
        log_error "Test de connectivité échoué"
        exit 1
    fi
    
    # Test de performance
    RESPONSE_TIME=$(curl -o /dev/null -s -w "%{time_total}" https://${DOMAIN})
    if (( $(echo "$RESPONSE_TIME > 3.0" | bc -l) )); then
        log_warning "Temps de réponse élevé: ${RESPONSE_TIME}s"
    fi
    
    # Test SSL
    SSL_SCORE=$(curl -s "https://api.ssllabs.com/api/v3/analyze?host=${DOMAIN}" | grep -o '"grade":"[A-F]"' | cut -d'"' -f4)
    if [ "$SSL_SCORE" != "A" ] && [ "$SSL_SCORE" != "A+" ]; then
        log_warning "Score SSL: $SSL_SCORE"
    fi
    
    log_success "Tests de validation terminés"
}

# Redémarrage des services
restart_services() {
    log_info "Redémarrage des services..."
    
    ssh ${VPS_USER}@${VPS_HOST} "
        sudo systemctl reload nginx
        sudo pm2 restart ${APP_NAME}
        sudo systemctl restart nginx
    "
    
    log_success "Services redémarrés avec succès"
}

# Nettoyage
cleanup() {
    log_info "Nettoyage des fichiers temporaires..."
    
    rm -f nginx.conf ecosystem.config.js monitor.sh backup.sh
    
    log_success "Nettoyage terminé"
}

# Fonction principale
main() {
    echo -e "${BLUE}🎯 Début du déploiement EcosystIA${NC}"
    echo ""
    
    check_prerequisites
    build_application
    optimize_build
    configure_vps
    upload_application
    setup_ssl
    setup_pm2
    setup_monitoring
    setup_backup
    restart_services
    run_tests
    cleanup
    
    echo ""
    echo -e "${GREEN}🎉 DÉPLOIEMENT TERMINÉ AVEC SUCCÈS !${NC}"
    echo -e "${GREEN}===================================${NC}"
    echo ""
    echo -e "${BLUE}🌐 Application accessible sur: https://${DOMAIN}${NC}"
    echo -e "${BLUE}📊 Monitoring: PM2 dashboard disponible${NC}"
    echo -e "${BLUE}🔒 SSL: Certificat Let's Encrypt installé${NC}"
    echo -e "${BLUE}📈 Performance: Optimisée pour la production${NC}"
    echo ""
    echo -e "${YELLOW}📋 Prochaines étapes:${NC}"
    echo -e "${YELLOW}   1. Tester l'application${NC}"
    echo -e "${YELLOW}   2. Configurer le monitoring avancé${NC}"
    echo -e "${YELLOW}   3. Former l'équipe SENEGEL${NC}"
    echo -e "${YELLOW}   4. Mettre en place le support${NC}"
    echo ""
    echo -e "${BLUE}🚀 EcosystIA est maintenant en production !${NC}"
}

# Gestion des erreurs
trap 'log_error "Déploiement échoué à la ligne $LINENO"' ERR

# Exécution
main "$@"
