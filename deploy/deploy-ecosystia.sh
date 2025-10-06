#!/bin/bash

# =====================================================
# SCRIPT DE DÉPLOIEMENT ECOSYSTIA SUR VPS HOSTINGER
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
LOCAL_BUILD_DIR="./dist"

# Vérifier si nous sommes dans le bon répertoire
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Erreur: Ce script doit être exécuté depuis le répertoire racine d'EcosystIA${NC}"
    exit 1
fi

# =====================================================
# 1. CONSTRUCTION DE L'APPLICATION
# =====================================================

echo -e "${YELLOW}🔨 Construction de l'application...${NC}"

# Installer les dépendances si nécessaire
if [ ! -d "node_modules" ]; then
    echo -e "${BLUE}   Installation des dépendances...${NC}"
    npm install
fi

# Construire l'application
echo -e "${BLUE}   Construction de l'application...${NC}"
npm run build

if [ $? -eq 0 ]; then
    echo -e "${GREEN}   ✅ Application construite avec succès${NC}"
else
    echo -e "${RED}   ❌ Erreur lors de la construction${NC}"
    exit 1
fi

# =====================================================
# 2. PRÉPARATION DES FICHIERS DE DÉPLOIEMENT
# =====================================================

echo -e "${YELLOW}📦 Préparation des fichiers de déploiement...${NC}"

# Créer un répertoire temporaire pour le déploiement
TEMP_DIR="/tmp/ecosystia-deploy"
rm -rf $TEMP_DIR
mkdir -p $TEMP_DIR

# Copier les fichiers nécessaires
echo -e "${BLUE}   Copie des fichiers...${NC}"
cp -r dist/* $TEMP_DIR/
cp deploy/server.js $TEMP_DIR/
cp deploy/ecosystem.config.js $TEMP_DIR/
cp deploy/package.json $TEMP_DIR/

# Créer le fichier .env pour la production
echo -e "${BLUE}   Création du fichier .env de production...${NC}"
cat > $TEMP_DIR/.env <<EOF
# Configuration de production EcosystIA
NODE_ENV=production
PORT=3000

# Supabase (à configurer avec vos vraies clés)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Configuration du domaine
DOMAIN_NAME=$DOMAIN_NAME
EOF

# Créer un script de déploiement
echo -e "${BLUE}   Création du script de déploiement...${NC}"
cat > $TEMP_DIR/deploy.sh <<'EOF'
#!/bin/bash

# Script de déploiement à exécuter sur le serveur
APP_DIR="/var/www/ecosystia"
APP_USER="ecosystia"

echo "🚀 Déploiement d'EcosystIA sur le serveur..."

# Arrêter PM2 si l'application est en cours d'exécution
pm2 stop ecosystia 2>/dev/null || true

# Sauvegarder l'ancienne version
if [ -d "$APP_DIR/dist" ]; then
    echo "📦 Sauvegarde de l'ancienne version..."
    sudo mv $APP_DIR/dist $APP_DIR/dist.backup.$(date +%Y%m%d_%H%M%S)
fi

# Créer le répertoire dist
sudo mkdir -p $APP_DIR/dist

# Copier les nouveaux fichiers
echo "📁 Copie des nouveaux fichiers..."
sudo cp -r * $APP_DIR/

# Changer les permissions
sudo chown -R $APP_USER:www-data $APP_DIR
sudo chmod -R 755 $APP_DIR

# Installer les dépendances du serveur
echo "📦 Installation des dépendances serveur..."
cd $APP_DIR
sudo -u $APP_USER npm install

# Démarrer l'application avec PM2
echo "🚀 Démarrage de l'application..."
sudo -u $APP_USER pm2 start ecosystem.config.js

# Sauvegarder la configuration PM2
sudo -u $APP_USER pm2 save
sudo -u $APP_USER pm2 startup

echo "✅ Déploiement terminé !"
echo "🌐 Application accessible sur: http://$(curl -s ifconfig.me)"
EOF

chmod +x $TEMP_DIR/deploy.sh

# =====================================================
# 3. CRÉATION DE L'ARCHIVE DE DÉPLOIEMENT
# =====================================================

echo -e "${YELLOW}📦 Création de l'archive de déploiement...${NC}"

DEPLOY_ARCHIVE="ecosystia-deploy-$(date +%Y%m%d_%H%M%S).tar.gz"
cd /tmp
tar -czf $DEPLOY_ARCHIVE -C ecosystia-deploy .

echo -e "${GREEN}   ✅ Archive créée: /tmp/$DEPLOY_ARCHIVE${NC}"

# =====================================================
# 4. INSTRUCTIONS DE DÉPLOIEMENT
# =====================================================

echo ""
echo -e "${GREEN}🎉 PRÉPARATION DU DÉPLOIEMENT TERMINÉE !${NC}"
echo "=========================================="
echo ""
echo -e "${BLUE}📋 Instructions de déploiement:${NC}"
echo ""
echo -e "${YELLOW}1. Transférer l'archive sur votre serveur:${NC}"
echo "   scp /tmp/$DEPLOY_ARCHIVE root@YOUR_SERVER_IP:/tmp/"
echo ""
echo -e "${YELLOW}2. Se connecter au serveur:${NC}"
echo "   ssh root@YOUR_SERVER_IP"
echo ""
echo -e "${YELLOW}3. Extraire et déployer:${NC}"
echo "   cd /tmp"
echo "   tar -xzf $DEPLOY_ARCHIVE"
echo "   cd ecosystia-deploy"
echo "   chmod +x deploy.sh"
echo "   ./deploy.sh"
echo ""
echo -e "${YELLOW}4. Configurer SSL (optionnel):${NC}"
echo "   certbot --nginx -d $DOMAIN_NAME"
echo ""
echo -e "${BLUE}📁 Fichiers préparés:${NC}"
echo "   ✅ Application construite (dist/)"
echo "   ✅ Serveur Node.js (server.js)"
echo "   ✅ Configuration PM2 (ecosystem.config.js)"
echo "   ✅ Package.json serveur (package.json)"
echo "   ✅ Script de déploiement (deploy.sh)"
echo "   ✅ Archive complète ($DEPLOY_ARCHIVE)"
echo ""
echo -e "${GREEN}🚀 Prêt pour le déploiement sur VPS Hostinger !${NC}"

# Retourner au répertoire original
cd - > /dev/null
