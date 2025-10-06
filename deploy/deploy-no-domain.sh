#!/bin/bash

# =====================================================
# SCRIPT DE DÉPLOIEMENT ECOSYSTIA SANS DOMAINE
# VPS Hostinger - IP: 72.60.187.85
# =====================================================

echo "🚀 DÉPLOIEMENT ECOSYSTIA SANS DOMAINE"
echo "====================================="

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Variables de configuration
SERVER_IP="72.60.187.85"
APP_NAME="ecosystia"
APP_USER="ecosystia"
APP_DIR="/var/www/ecosystia"

echo -e "${BLUE}📋 Configuration du déploiement:${NC}"
echo "   - Serveur IP: $SERVER_IP"
echo "   - Accès direct: http://$SERVER_IP"
echo "   - Application: $APP_NAME"
echo ""

# =====================================================
# 1. VÉRIFICATION DES PRÉREQUIS
# =====================================================

echo -e "${YELLOW}🔍 Vérification des prérequis...${NC}"

# Vérifier si Node.js est installé
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo -e "${GREEN}   ✅ Node.js version: $NODE_VERSION${NC}"
else
    echo -e "${RED}   ❌ Node.js n'est pas installé${NC}"
    echo -e "${BLUE}   📦 Installation de Node.js 20.x...${NC}"
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    apt-get install -y nodejs
fi

# Vérifier si PM2 est installé
if command -v pm2 &> /dev/null; then
    echo -e "${GREEN}   ✅ PM2 est installé${NC}"
else
    echo -e "${BLUE}   📦 Installation de PM2...${NC}"
    npm install -g pm2
fi

# =====================================================
# 2. CRÉATION DE L'UTILISATEUR ET RÉPERTOIRES
# =====================================================

echo -e "${YELLOW}👤 Configuration de l'utilisateur...${NC}"

# Créer l'utilisateur s'il n'existe pas
if id "$APP_USER" &>/dev/null; then
    echo -e "${GREEN}   ✅ Utilisateur $APP_USER existe déjà${NC}"
else
    useradd -m -s /bin/bash $APP_USER
    echo -e "${GREEN}   ✅ Utilisateur $APP_USER créé${NC}"
fi

# Créer le répertoire de l'application
mkdir -p $APP_DIR
chown -R $APP_USER:www-data $APP_DIR
chmod -R 755 $APP_DIR

# =====================================================
# 3. DÉPLOIEMENT DE L'APPLICATION
# =====================================================

echo -e "${YELLOW}📦 Déploiement de l'application...${NC}"

# Vérifier si l'archive existe
ARCHIVE_FILE="/tmp/ecosystia-deploy-20251005_185517.zip"
if [ -f "$ARCHIVE_FILE" ]; then
    echo -e "${GREEN}   ✅ Archive trouvée: $ARCHIVE_FILE${NC}"
    
    # Extraire l'archive
    echo -e "${BLUE}   📁 Extraction de l'archive...${NC}"
    unzip -q $ARCHIVE_FILE -d $APP_DIR/
    
    # Configurer les permissions
    chown -R $APP_USER:www-data $APP_DIR
    chmod -R 755 $APP_DIR
    
    echo -e "${GREEN}   ✅ Application déployée${NC}"
else
    echo -e "${RED}   ❌ Archive non trouvée: $ARCHIVE_FILE${NC}"
    echo -e "${BLUE}   💡 Transférez d'abord l'archive avec:${NC}"
    echo -e "${BLUE}      scp C:\\temp\\ecosystia-deploy-20251005_185517.zip root@$SERVER_IP:/tmp/${NC}"
    exit 1
fi

# =====================================================
# 4. INSTALLATION DES DÉPENDANCES
# =====================================================

echo -e "${YELLOW}📦 Installation des dépendances...${NC}"

cd $APP_DIR
sudo -u $APP_USER npm install --production

echo -e "${GREEN}   ✅ Dépendances installées${NC}"

# =====================================================
# 5. CONFIGURATION DE L'ENVIRONNEMENT
# =====================================================

echo -e "${YELLOW}⚙️  Configuration de l'environnement...${NC}"

# Créer le fichier .env optimisé pour l'accès par IP
cat > $APP_DIR/.env << EOF
NODE_ENV=production
PORT=3000
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
DOMAIN_NAME=$SERVER_IP
SERVER_IP=$SERVER_IP
EOF

chown $APP_USER:www-data $APP_DIR/.env
chmod 644 $APP_DIR/.env

echo -e "${GREEN}   ✅ Fichier .env créé${NC}"
echo -e "${BLUE}   💡 Configurez vos clés Supabase dans $APP_DIR/.env${NC}"

# =====================================================
# 6. CONFIGURATION NGINX POUR ACCÈS PAR IP
# =====================================================

echo -e "${YELLOW}🌐 Configuration de Nginx pour accès par IP...${NC}"

# Créer la configuration Nginx optimisée pour l'IP
cat > /etc/nginx/sites-available/ecosystia-ip << EOF
server {
    listen 80 default_server;
    listen [::]:80 default_server;
    server_name $SERVER_IP _;
    
    root $APP_DIR/dist;
    index index.html;
    
    # Configuration pour SPA (Single Page Application)
    location / {
        try_files \$uri \$uri/ /index.html;
        
        # Headers de sécurité
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-XSS-Protection "1; mode=block" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header Referrer-Policy "no-referrer-when-downgrade" always;
    }
    
    # Cache pour les assets statiques
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        add_header Vary "Accept-Encoding";
    }
    
    # API et Health Check
    location /api/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        proxy_read_timeout 86400;
    }
    
    # Limitation de la taille des uploads
    client_max_body_size 10M;
    
    # Timeouts
    client_body_timeout 60s;
    client_header_timeout 60s;
    keepalive_timeout 65s;
    send_timeout 60s;
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/json
        application/javascript
        application/xml+rss
        application/atom+xml
        image/svg+xml;
    
    # Logs spécifiques
    access_log /var/log/nginx/ecosystia_ip_access.log;
    error_log /var/log/nginx/ecosystia_ip_error.log;
}
EOF

# Supprimer la configuration par défaut de Nginx
rm -f /etc/nginx/sites-enabled/default

# Activer notre configuration
ln -sf /etc/nginx/sites-available/ecosystia-ip /etc/nginx/sites-enabled/

# Tester la configuration
nginx -t

if [ $? -eq 0 ]; then
    systemctl reload nginx
    echo -e "${GREEN}   ✅ Nginx configuré pour l'accès par IP${NC}"
else
    echo -e "${RED}   ❌ Erreur dans la configuration Nginx${NC}"
    exit 1
fi

# =====================================================
# 7. DÉMARRAGE DE L'APPLICATION
# =====================================================

echo -e "${YELLOW}🚀 Démarrage de l'application...${NC}"

# Arrêter PM2 si l'application est déjà en cours
pm2 stop $APP_NAME 2>/dev/null || true
pm2 delete $APP_NAME 2>/dev/null || true

# Démarrer l'application
cd $APP_DIR
sudo -u $APP_USER pm2 start ecosystem.config.js

# Sauvegarder la configuration PM2
sudo -u $APP_USER pm2 save
sudo -u $APP_USER pm2 startup

echo -e "${GREEN}   ✅ Application démarrée avec PM2${NC}"

# =====================================================
# 8. VÉRIFICATION DU DÉPLOIEMENT
# =====================================================

echo -e "${YELLOW}🔍 Vérification du déploiement...${NC}"

# Attendre que l'application démarre
sleep 5

# Test de santé local
if curl -f http://localhost:3000/api/health > /dev/null 2>&1; then
    echo -e "${GREEN}   ✅ Application accessible localement${NC}"
else
    echo -e "${RED}   ❌ Application non accessible localement${NC}"
fi

# Test public par IP
if curl -f http://$SERVER_IP/api/health > /dev/null 2>&1; then
    echo -e "${GREEN}   ✅ Application accessible publiquement${NC}"
else
    echo -e "${RED}   ❌ Application non accessible publiquement${NC}"
fi

# =====================================================
# 9. RÉSUMÉ FINAL
# =====================================================

echo ""
echo -e "${GREEN}🎉 DÉPLOIEMENT TERMINÉ !${NC}"
echo "====================================="
echo ""
echo -e "${BLUE}📋 Résumé du déploiement:${NC}"
echo "   ✅ Application déployée dans $APP_DIR"
echo "   ✅ Dépendances installées"
echo "   ✅ Nginx configuré pour l'accès par IP"
echo "   ✅ PM2 configuré et démarré"
echo "   ✅ Fichier .env créé"
echo ""
echo -e "${BLUE}🌐 URLs d'accès:${NC}"
echo "   - Application principale: http://$SERVER_IP"
echo "   - Health Check: http://$SERVER_IP/api/health"
echo "   - Status API: http://$SERVER_IP/api/status"
echo "   - CloudPanel: http://$SERVER_IP:8443"
echo ""
echo -e "${BLUE}📊 Commandes utiles:${NC}"
echo "   - Statut PM2: pm2 status"
echo "   - Logs PM2: pm2 logs $APP_NAME"
echo "   - Redémarrage: pm2 restart $APP_NAME"
echo "   - Monitoring: pm2 monit"
echo "   - Logs Nginx: tail -f /var/log/nginx/ecosystia_ip_access.log"
echo ""
echo -e "${BLUE}🔧 Prochaines étapes:${NC}"
echo "   1. Configurez vos clés Supabase dans $APP_DIR/.env"
echo "   2. Testez l'application sur http://$SERVER_IP"
echo "   3. (Optionnel) Ajoutez un domaine plus tard"
echo ""
echo -e "${BLUE}💡 Options pour ajouter un domaine plus tard:${NC}"
echo "   - Achetez un domaine et configurez le DNS"
echo "   - Utilisez un service de domaine gratuit (Freenom, DuckDNS)"
echo "   - Créez un sous-domaine sur un domaine existant"
echo ""
echo -e "${GREEN}🚀 EcosystIA est maintenant accessible sur http://$SERVER_IP !${NC}"
