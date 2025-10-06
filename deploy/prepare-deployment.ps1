# =====================================================
# SCRIPT DE PRÉPARATION DU DÉPLOIEMENT ECOSYSTIA
# VPS HOSTINGER - Windows PowerShell
# =====================================================

Write-Host "🚀 PRÉPARATION DU DÉPLOIEMENT ECOSYSTIA SUR VPS HOSTINGER" -ForegroundColor Green
Write-Host "=========================================================" -ForegroundColor Green

# Variables de configuration
$DOMAIN_NAME = "ecosystia.impulcia-afrique.com"
$APP_NAME = "ecosystia"
$TEMP_DIR = "C:\temp\ecosystia-deploy"
$DEPLOY_ARCHIVE = "ecosystia-deploy-$(Get-Date -Format 'yyyyMMdd_HHmmss').zip"

Write-Host "📋 Configuration du déploiement:" -ForegroundColor Blue
Write-Host "   - Domaine: $DOMAIN_NAME" -ForegroundColor Gray
Write-Host "   - Application: $APP_NAME" -ForegroundColor Gray
Write-Host "   - Répertoire temporaire: $TEMP_DIR" -ForegroundColor Gray
Write-Host ""

# =====================================================
# 1. VÉRIFICATION DES PRÉREQUIS
# =====================================================

Write-Host "🔍 Vérification des prérequis..." -ForegroundColor Yellow

# Vérifier si nous sommes dans le bon répertoire
if (-not (Test-Path "package.json")) {
    Write-Host "❌ Erreur: Ce script doit être exécuté depuis le répertoire racine d'EcosystIA" -ForegroundColor Red
    exit 1
}

# Vérifier si Node.js est installé
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js version: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js n'est pas installé ou pas dans le PATH" -ForegroundColor Red
    exit 1
}

# Vérifier si npm est installé
try {
    $npmVersion = npm --version
    Write-Host "✅ npm version: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ npm n'est pas installé ou pas dans le PATH" -ForegroundColor Red
    exit 1
}

# =====================================================
# 2. INSTALLATION DES DÉPENDANCES
# =====================================================

Write-Host "📦 Installation des dépendances..." -ForegroundColor Yellow

if (-not (Test-Path "node_modules")) {
    Write-Host "   Installation des dépendances..." -ForegroundColor Blue
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Erreur lors de l'installation des dépendances" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "   ✅ Dépendances déjà installées" -ForegroundColor Green
}

# =====================================================
# 3. CONSTRUCTION DE L'APPLICATION
# =====================================================

Write-Host "🔨 Construction de l'application..." -ForegroundColor Yellow

Write-Host "   Construction de l'application..." -ForegroundColor Blue
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Erreur lors de la construction de l'application" -ForegroundColor Red
    exit 1
}

Write-Host "   ✅ Application construite avec succès" -ForegroundColor Green

# =====================================================
# 4. PRÉPARATION DU RÉPERTOIRE TEMPORAIRE
# =====================================================

Write-Host "📁 Préparation du répertoire temporaire..." -ForegroundColor Yellow

# Créer le répertoire temporaire
if (Test-Path $TEMP_DIR) {
    Remove-Item -Path $TEMP_DIR -Recurse -Force
}
New-Item -ItemType Directory -Path $TEMP_DIR -Force | Out-Null

# =====================================================
# 5. COPIE DES FICHIERS
# =====================================================

Write-Host "📋 Copie des fichiers..." -ForegroundColor Yellow

# Copier les fichiers de l'application construite
Copy-Item -Path "dist\*" -Destination $TEMP_DIR -Recurse -Force

# Copier les fichiers de configuration serveur
Copy-Item -Path "deploy\server.js" -Destination $TEMP_DIR -Force
Copy-Item -Path "deploy\ecosystem.config.js" -Destination $TEMP_DIR -Force
Copy-Item -Path "deploy\package.json" -Destination $TEMP_DIR -Force
Copy-Item -Path "deploy\nginx-ecosystia.conf" -Destination $TEMP_DIR -Force

# =====================================================
# 6. CRÉATION DU FICHIER .ENV
# =====================================================

Write-Host "⚙️  Création du fichier .env de production..." -ForegroundColor Yellow

$envContent = @"
# Configuration de production EcosystIA
NODE_ENV=production
PORT=3000

# Supabase (à configurer avec vos vraies clés)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Configuration du domaine
DOMAIN_NAME=$DOMAIN_NAME
"@

Set-Content -Path "$TEMP_DIR\.env" -Value $envContent

# =====================================================
# 7. CRÉATION DU SCRIPT DE DÉPLOIEMENT SERVEUR
# =====================================================

Write-Host "📜 Création du script de déploiement serveur..." -ForegroundColor Yellow

$deployScriptContent = @'
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
'@

Set-Content -Path "$TEMP_DIR\deploy.sh" -Value $deployScriptContent

# =====================================================
# 8. CREATION DE L'ARCHIVE
# =====================================================

Write-Host "📦 Création de l'archive de déploiement..." -ForegroundColor Yellow

# Créer l'archive ZIP
Compress-Archive -Path "$TEMP_DIR\*" -DestinationPath "C:\temp\$DEPLOY_ARCHIVE" -Force

if (Test-Path "C:\temp\$DEPLOY_ARCHIVE") {
    Write-Host "   ✅ Archive créée: C:\temp\$DEPLOY_ARCHIVE" -ForegroundColor Green
} else {
    Write-Host "   ❌ Erreur lors de la création de l'archive" -ForegroundColor Red
    exit 1
}

# =====================================================
# 9. NETTOYAGE
# =====================================================

Write-Host "🧹 Nettoyage..." -ForegroundColor Yellow
Remove-Item -Path $TEMP_DIR -Recurse -Force

# =====================================================
# 10. INSTRUCTIONS FINALES
# =====================================================

Write-Host ""
Write-Host "🎉 PRÉPARATION DU DÉPLOIEMENT TERMINÉE !" -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Instructions de déploiement:" -ForegroundColor Blue
Write-Host ""
Write-Host "1. Réinitialiser le serveur VPS:" -ForegroundColor Yellow
Write-Host "   wget https://raw.githubusercontent.com/your-repo/ecosystia/main/deploy/vps-setup.sh" -ForegroundColor Gray
Write-Host "   chmod +x vps-setup.sh" -ForegroundColor Gray
Write-Host "   sudo ./vps-setup.sh" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Transférer l'archive sur votre serveur:" -ForegroundColor Yellow
Write-Host "   scp C:\temp\$DEPLOY_ARCHIVE root@YOUR_SERVER_IP:/tmp/" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Se connecter au serveur et déployer:" -ForegroundColor Yellow
Write-Host "   ssh root@YOUR_SERVER_IP" -ForegroundColor Gray
Write-Host "   cd /tmp" -ForegroundColor Gray
Write-Host "   unzip $DEPLOY_ARCHIVE" -ForegroundColor Gray
Write-Host "   chmod +x deploy.sh" -ForegroundColor Gray
Write-Host "   ./deploy.sh" -ForegroundColor Gray
Write-Host ""
Write-Host "4. Configurer SSL (optionnel):" -ForegroundColor Yellow
Write-Host "   certbot --nginx -d $DOMAIN_NAME" -ForegroundColor Gray
Write-Host ""
Write-Host "📁 Fichiers préparés:" -ForegroundColor Blue
Write-Host "   ✅ Application construite (dist/)" -ForegroundColor Green
Write-Host "   ✅ Serveur Node.js (server.js)" -ForegroundColor Green
Write-Host "   ✅ Configuration PM2 (ecosystem.config.js)" -ForegroundColor Green
Write-Host "   ✅ Configuration Nginx (nginx-ecosystia.conf)" -ForegroundColor Green
Write-Host "   ✅ Package.json serveur (package.json)" -ForegroundColor Green
Write-Host "   ✅ Script de déploiement (deploy.sh)" -ForegroundColor Green
Write-Host "   ✅ Archive complète ($DEPLOY_ARCHIVE)" -ForegroundColor Green
Write-Host ""
Write-Host "🚀 Prêt pour le déploiement sur VPS Hostinger !" -ForegroundColor Green
Write-Host ""
Write-Host "📖 Consultez deploy/README-DEPLOYMENT.md pour plus de détails" -ForegroundColor Blue
