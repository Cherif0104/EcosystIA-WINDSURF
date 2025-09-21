@echo off
REM Script de démarrage pour EcosystIA Backend (Windows)
echo 🚀 Démarrage d'EcosystIA Backend...

REM Vérifier si Python est installé
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python n'est pas installé. Veuillez installer Python 3.11+
    pause
    exit /b 1
)

REM Créer l'environnement virtuel s'il n'existe pas
if not exist "venv" (
    echo 📦 Création de l'environnement virtuel...
    python -m venv venv
)

REM Activer l'environnement virtuel
echo 🔧 Activation de l'environnement virtuel...
call venv\Scripts\activate.bat

REM Installer les dépendances
echo 📥 Installation des dépendances...
pip install -r requirements.txt

REM Copier le fichier d'environnement s'il n'existe pas
if not exist ".env" (
    echo ⚙️ Copie du fichier de configuration...
    copy env.example .env
    echo 📝 Veuillez modifier le fichier .env avec vos configurations
)

REM Appliquer les migrations
echo 🗄️ Application des migrations...
python manage.py migrate

REM Créer un superutilisateur s'il n'existe pas
echo 👤 Création du superutilisateur...
python manage.py createsuperuser --noinput --username admin --email admin@ecosystia.org 2>nul || echo Superutilisateur existe déjà

REM Collecter les fichiers statiques
echo 📁 Collecte des fichiers statiques...
python manage.py collectstatic --noinput

REM Démarrer le serveur
echo 🌟 Démarrage du serveur de développement...
echo 🌐 API disponible sur: http://localhost:8000
echo 📚 Documentation API: http://localhost:8000/api/docs/
echo 💚 Health Check: http://localhost:8000/health/

python manage.py runserver 0.0.0.0:8000
