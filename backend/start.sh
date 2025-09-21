#!/bin/bash

# Script de démarrage pour EcosystIA Backend
echo "🚀 Démarrage d'EcosystIA Backend..."

# Vérifier si Python est installé
if ! command -v python &> /dev/null; then
    echo "❌ Python n'est pas installé. Veuillez installer Python 3.11+"
    exit 1
fi

# Vérifier si PostgreSQL est installé
if ! command -v psql &> /dev/null; then
    echo "❌ PostgreSQL n'est pas installé. Veuillez installer PostgreSQL 15+"
    exit 1
fi

# Créer l'environnement virtuel s'il n'existe pas
if [ ! -d "venv" ]; then
    echo "📦 Création de l'environnement virtuel..."
    python -m venv venv
fi

# Activer l'environnement virtuel
echo "🔧 Activation de l'environnement virtuel..."
source venv/bin/activate

# Installer les dépendances
echo "📥 Installation des dépendances..."
pip install -r requirements.txt

# Copier le fichier d'environnement s'il n'existe pas
if [ ! -f ".env" ]; then
    echo "⚙️ Copie du fichier de configuration..."
    cp env.example .env
    echo "📝 Veuillez modifier le fichier .env avec vos configurations"
fi

# Appliquer les migrations
echo "🗄️ Application des migrations..."
python manage.py migrate

# Créer un superutilisateur s'il n'existe pas
echo "👤 Création du superutilisateur..."
python manage.py createsuperuser --noinput --username admin --email admin@ecosystia.org || echo "Superutilisateur existe déjà"

# Collecter les fichiers statiques
echo "📁 Collecte des fichiers statiques..."
python manage.py collectstatic --noinput

# Démarrer le serveur
echo "🌟 Démarrage du serveur de développement..."
echo "🌐 API disponible sur: http://localhost:8000"
echo "📚 Documentation API: http://localhost:8000/api/docs/"
echo "💚 Health Check: http://localhost:8000/health/"

python manage.py runserver 0.0.0.0:8000
