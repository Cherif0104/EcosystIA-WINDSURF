# Script de preparation du deploiement EcosystIA
# VPS Hostinger - Windows PowerShell

Write-Host "Preparation du deploiement EcosystIA sur VPS Hostinger" -ForegroundColor Green

# Variables
$DOMAIN_NAME = "ecosystia.impulcia-afrique.com"
$APP_NAME = "ecosystia"
$TEMP_DIR = "C:\temp\ecosystia-deploy"
$DEPLOY_ARCHIVE = "ecosystia-deploy-$(Get-Date -Format 'yyyyMMdd_HHmmss').zip"

Write-Host "Configuration du deploiement:" -ForegroundColor Blue
Write-Host "   - Domaine: $DOMAIN_NAME" -ForegroundColor Gray
Write-Host "   - Application: $APP_NAME" -ForegroundColor Gray
Write-Host ""

# 1. Verification des prerequis
Write-Host "Verification des prerequis..." -ForegroundColor Yellow

if (-not (Test-Path "package.json")) {
    Write-Host "Erreur: Ce script doit etre execute depuis le repertoire racine d'EcosystIA" -ForegroundColor Red
    exit 1
}

# 2. Installation des dependances
Write-Host "Installation des dependances..." -ForegroundColor Yellow

if (-not (Test-Path "node_modules")) {
    Write-Host "   Installation des dependances..." -ForegroundColor Blue
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Erreur lors de l'installation des dependances" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "   Dependances deja installees" -ForegroundColor Green
}

# 3. Construction de l'application
Write-Host "Construction de l'application..." -ForegroundColor Yellow

Write-Host "   Construction de l'application..." -ForegroundColor Blue
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "Erreur lors de la construction de l'application" -ForegroundColor Red
    exit 1
}

Write-Host "   Application construite avec succes" -ForegroundColor Green

# 4. Preparation du repertoire temporaire
Write-Host "Preparation du repertoire temporaire..." -ForegroundColor Yellow

if (Test-Path $TEMP_DIR) {
    Remove-Item -Path $TEMP_DIR -Recurse -Force
}
New-Item -ItemType Directory -Path $TEMP_DIR -Force | Out-Null

# 5. Copie des fichiers
Write-Host "Copie des fichiers..." -ForegroundColor Yellow

Copy-Item -Path "dist\*" -Destination $TEMP_DIR -Recurse -Force
Copy-Item -Path "deploy\server.js" -Destination $TEMP_DIR -Force
Copy-Item -Path "deploy\ecosystem.config.js" -Destination $TEMP_DIR -Force
Copy-Item -Path "deploy\package.json" -Destination $TEMP_DIR -Force
Copy-Item -Path "deploy\nginx-ecosystia.conf" -Destination $TEMP_DIR -Force

# 6. Creation du fichier .env
Write-Host "Creation du fichier .env de production..." -ForegroundColor Yellow

$envContent = @"
NODE_ENV=production
PORT=3000
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
DOMAIN_NAME=$DOMAIN_NAME
"@

Set-Content -Path "$TEMP_DIR\.env" -Value $envContent

# 7. Creation du script de deploiement serveur
Write-Host "Creation du script de deploiement serveur..." -ForegroundColor Yellow

$deployScriptContent = @'
#!/bin/bash
APP_DIR="/var/www/ecosystia"
APP_USER="ecosystia"

echo "Deploiement d'EcosystIA sur le serveur..."

pm2 stop ecosystia 2>/dev/null || true

if [ -d "$APP_DIR/dist" ]; then
    echo "Sauvegarde de l'ancienne version..."
    sudo mv $APP_DIR/dist $APP_DIR/dist.backup.$(date +%Y%m%d_%H%M%S)
fi

sudo mkdir -p $APP_DIR/dist
echo "Copie des nouveaux fichiers..."
sudo cp -r * $APP_DIR/

sudo chown -R $APP_USER:www-data $APP_DIR
sudo chmod -R 755 $APP_DIR

echo "Installation des dependances serveur..."
cd $APP_DIR
sudo -u $APP_USER npm install

echo "Demarrage de l'application..."
sudo -u $APP_USER pm2 start ecosystem.config.js

sudo -u $APP_USER pm2 save
sudo -u $APP_USER pm2 startup

echo "Deploiement termine !"
echo "Application accessible sur: http://$(curl -s ifconfig.me)"
'@

Set-Content -Path "$TEMP_DIR\deploy.sh" -Value $deployScriptContent

# 8. Creation de l'archive
Write-Host "Creation de l'archive de deploiement..." -ForegroundColor Yellow

Compress-Archive -Path "$TEMP_DIR\*" -DestinationPath "C:\temp\$DEPLOY_ARCHIVE" -Force

if (Test-Path "C:\temp\$DEPLOY_ARCHIVE") {
    Write-Host "   Archive creee: C:\temp\$DEPLOY_ARCHIVE" -ForegroundColor Green
} else {
    Write-Host "   Erreur lors de la creation de l'archive" -ForegroundColor Red
    exit 1
}

# 9. Nettoyage
Write-Host "Nettoyage..." -ForegroundColor Yellow
Remove-Item -Path $TEMP_DIR -Recurse -Force

# 10. Instructions finales
Write-Host ""
Write-Host "Preparation du deploiement terminee !" -ForegroundColor Green
Write-Host "=======================================" -ForegroundColor Green
Write-Host ""
Write-Host "Instructions de deploiement:" -ForegroundColor Blue
Write-Host ""
Write-Host "1. Reinitialiser le serveur VPS:" -ForegroundColor Yellow
Write-Host "   wget https://raw.githubusercontent.com/your-repo/ecosystia/main/deploy/vps-setup.sh" -ForegroundColor Gray
Write-Host "   chmod +x vps-setup.sh" -ForegroundColor Gray
Write-Host "   sudo ./vps-setup.sh" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Transférer l'archive sur votre serveur:" -ForegroundColor Yellow
Write-Host "   scp C:\temp\$DEPLOY_ARCHIVE root@YOUR_SERVER_IP:/tmp/" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Se connecter au serveur et deployer:" -ForegroundColor Yellow
Write-Host "   ssh root@YOUR_SERVER_IP" -ForegroundColor Gray
Write-Host "   cd /tmp" -ForegroundColor Gray
Write-Host "   unzip $DEPLOY_ARCHIVE" -ForegroundColor Gray
Write-Host "   chmod +x deploy.sh" -ForegroundColor Gray
Write-Host "   ./deploy.sh" -ForegroundColor Gray
Write-Host ""
Write-Host "4. Configurer SSL (optionnel):" -ForegroundColor Yellow
Write-Host "   certbot --nginx -d $DOMAIN_NAME" -ForegroundColor Gray
Write-Host ""
Write-Host "Fichiers prepares:" -ForegroundColor Blue
Write-Host "   Application construite (dist/)" -ForegroundColor Green
Write-Host "   Serveur Node.js (server.js)" -ForegroundColor Green
Write-Host "   Configuration PM2 (ecosystem.config.js)" -ForegroundColor Green
Write-Host "   Configuration Nginx (nginx-ecosystia.conf)" -ForegroundColor Green
Write-Host "   Package.json serveur (package.json)" -ForegroundColor Green
Write-Host "   Script de deploiement (deploy.sh)" -ForegroundColor Green
Write-Host "   Archive complete ($DEPLOY_ARCHIVE)" -ForegroundColor Green
Write-Host ""
Write-Host "Pret pour le deploiement sur VPS Hostinger !" -ForegroundColor Green
