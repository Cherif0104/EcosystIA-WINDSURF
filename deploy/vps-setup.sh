#!/bin/bash

# =====================================================
# SCRIPT DE RÉINITIALISATION ET DÉPLOIEMENT VPS HOSTINGER
# ECOSYSTIA - Premier Déploiement
# =====================================================

echo "🚀 DÉPLOIEMENT ECOSYSTIA SUR VPS HOSTINGER"
echo "=========================================="

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Variables de configuration
DOMAIN_NAME="ecosystia.impulcia-afrique.com"  # Remplacez par votre domaine
APP_NAME="ecosystia"
APP_USER="ecosystia"
APP_DIR="/var/www/ecosystia"
NGINX_CONF="/etc/nginx/sites-available/ecosystia"
NGINX_ENABLED="/etc/nginx/sites-enabled/ecosystia"

echo -e "${BLUE}📋 Configuration du déploiement:${NC}"
echo "   - Domaine: $DOMAIN_NAME"
echo "   - Application: $APP_NAME"
echo "   - Répertoire: $APP_DIR"
echo ""

# =====================================================
# 1. MISE À JOUR DU SYSTÈME
# =====================================================

echo -e "${YELLOW}🔄 Mise à jour du système...${NC}"
sudo apt update && sudo apt upgrade -y

# =====================================================
# 2. INSTALLATION DES DÉPENDANCES
# =====================================================

echo -e "${YELLOW}📦 Installation des dépendances...${NC}"

# Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Nginx
sudo apt install -y nginx

# PM2
sudo npm install -g pm2

# Git
sudo apt install -y git

# Certbot pour SSL
sudo apt install -y certbot python3-certbot-nginx

# UFW (Firewall)
sudo apt install -y ufw

# =====================================================
# 3. CONFIGURATION DU FIREWALL
# =====================================================

echo -e "${YELLOW}🔥 Configuration du firewall...${NC}"
sudo ufw --force reset
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw --force enable

# =====================================================
# 4. CRÉATION DE L'UTILISATEUR APPLICATION
# =====================================================

echo -e "${YELLOW}👤 Création de l'utilisateur application...${NC}"

# Vérifier si l'utilisateur existe déjà
if id "$APP_USER" &>/dev/null; then
    echo -e "${BLUE}   Utilisateur $APP_USER existe déjà${NC}"
else
    sudo useradd -m -s /bin/bash $APP_USER
    echo -e "${GREEN}   Utilisateur $APP_USER créé${NC}"
fi

# Ajouter l'utilisateur au groupe www-data
sudo usermod -a -G www-data $APP_USER

# =====================================================
# 5. PRÉPARATION DU RÉPERTOIRE APPLICATION
# =====================================================

echo -e "${YELLOW}📁 Préparation du répertoire application...${NC}"

# Créer le répertoire si il n'existe pas
sudo mkdir -p $APP_DIR
sudo chown -R $APP_USER:www-data $APP_DIR
sudo chmod -R 755 $APP_DIR

# =====================================================
# 6. CONFIGURATION NGINX
# =====================================================

echo -e "${YELLOW}⚙️  Configuration de Nginx...${NC}"

# Créer la configuration Nginx
sudo tee $NGINX_CONF > /dev/null <<EOF
server {
    listen 80;
    server_name $DOMAIN_NAME www.$DOMAIN_NAME;
    
    # Redirection vers HTTPS (sera activé après SSL)
    # return 301 https://\$server_name\$request_uri;
    
    root $APP_DIR/dist;
    index index.html;
    
    # Configuration pour SPA (Single Page Application)
    location / {
        try_files \$uri \$uri/ /index.html;
    }
    
    # Cache pour les assets statiques
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # Sécurité
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
    
    # Limitation de la taille des uploads
    client_max_body_size 10M;
    
    # Logs
    access_log /var/log/nginx/ecosystia_access.log;
    error_log /var/log/nginx/ecosystia_error.log;
}
EOF

# Activer le site
sudo ln -sf $NGINX_CONF $NGINX_ENABLED

# Tester la configuration Nginx
sudo nginx -t

if [ $? -eq 0 ]; then
    echo -e "${GREEN}   Configuration Nginx validée${NC}"
else
    echo -e "${RED}   Erreur dans la configuration Nginx${NC}"
    exit 1
fi

# Redémarrer Nginx
sudo systemctl restart nginx
sudo systemctl enable nginx

# =====================================================
# 7. CONFIGURATION PM2
# =====================================================

echo -e "${YELLOW}⚙️  Configuration de PM2...${NC}"

# Créer le fichier de configuration PM2
sudo tee $APP_DIR/ecosystem.config.js > /dev/null <<EOF
module.exports = {
  apps: [{
    name: '$APP_NAME',
    script: 'server.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: '/var/log/pm2/ecosystia-error.log',
    out_file: '/var/log/pm2/ecosystia-out.log',
    log_file: '/var/log/pm2/ecosystia-combined.log',
    time: true
  }]
};
EOF

# Créer le serveur Node.js pour servir les fichiers statiques
sudo tee $APP_DIR/server.js > /dev/null <<EOF
const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Servir les fichiers statiques
app.use(express.static(path.join(__dirname, 'dist')));

// Route pour SPA
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(\`🚀 Serveur EcosystIA démarré sur le port \${PORT}\`);
});
EOF

# Créer le package.json pour le serveur
sudo tee $APP_DIR/package.json > /dev/null <<EOF
{
  "name": "ecosystia-server",
  "version": "1.0.0",
  "description": "Serveur de production EcosystIA",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "pm2:start": "pm2 start ecosystem.config.js",
    "pm2:stop": "pm2 stop ecosystem.config.js",
    "pm2:restart": "pm2 restart ecosystem.config.js",
    "pm2:delete": "pm2 delete ecosystem.config.js"
  },
  "dependencies": {
    "express": "^4.18.2"
  }
}
EOF

# =====================================================
# 8. CONFIGURATION DES LOGS
# =====================================================

echo -e "${YELLOW}📝 Configuration des logs...${NC}"

# Créer les répertoires de logs
sudo mkdir -p /var/log/pm2
sudo chown -R $APP_USER:$APP_USER /var/log/pm2

# =====================================================
# 9. CONFIGURATION DU SYSTÈME
# =====================================================

echo -e "${YELLOW}⚙️  Configuration du système...${NC}"

# Optimiser les limites système
sudo tee -a /etc/security/limits.conf > /dev/null <<EOF
$APP_USER soft nofile 65536
$APP_USER hard nofile 65536
EOF

# =====================================================
# 10. NETTOYAGE ET FINALISATION
# =====================================================

echo -e "${YELLOW}🧹 Nettoyage...${NC}"

# Nettoyer les packages inutiles
sudo apt autoremove -y
sudo apt autoclean

# =====================================================
# RÉSUMÉ FINAL
# =====================================================

echo ""
echo -e "${GREEN}🎉 RÉINITIALISATION DU SERVEUR TERMINÉE !${NC}"
echo "=========================================="
echo ""
echo -e "${BLUE}📋 Configuration finale:${NC}"
echo "   ✅ Système mis à jour"
echo "   ✅ Node.js 20.x installé"
echo "   ✅ Nginx configuré"
echo "   ✅ PM2 installé"
echo "   ✅ Firewall configuré"
echo "   ✅ Utilisateur $APP_USER créé"
echo "   ✅ Répertoire $APP_DIR préparé"
echo "   ✅ Configuration Nginx créée"
echo "   ✅ Configuration PM2 créée"
echo ""
echo -e "${YELLOW}📋 Prochaines étapes:${NC}"
echo "   1. Transférer les fichiers EcosystIA vers $APP_DIR"
echo "   2. Installer les dépendances (npm install)"
echo "   3. Construire l'application (npm run build)"
echo "   4. Démarrer avec PM2"
echo "   5. Configurer SSL avec Certbot"
echo ""
echo -e "${GREEN}🚀 Le serveur est prêt pour le déploiement !${NC}"
