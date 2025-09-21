@echo off
echo ========================================
echo    ECOSYSTIA BACKEND - SETUP COMPLET
echo ========================================

echo.
echo [1/6] Verification de l'environnement...
python --version
if errorlevel 1 (
    echo ERREUR: Python n'est pas installe
    echo Veuillez installer Python 3.11+ depuis https://python.org
    pause
    exit /b 1
)

echo.
echo [2/6] Installation des dependances...
pip install -r requirements.txt
if errorlevel 1 (
    echo ERREUR: Echec de l'installation des dependances
    pause
    exit /b 1
)

echo.
echo [3/6] Creation des migrations...
python manage.py makemigrations
if errorlevel 1 (
    echo ERREUR: Echec de la creation des migrations
    pause
    exit /b 1
)

echo.
echo [4/6] Application des migrations...
python manage.py migrate
if errorlevel 1 (
    echo ERREUR: Echec de l'application des migrations
    pause
    exit /b 1
)

echo.
echo [5/6] Creation d'un superutilisateur...
echo Veuillez entrer les informations pour le compte administrateur:
python manage.py createsuperuser

echo.
echo [6/6] Verification de la configuration...
python manage.py check
if errorlevel 1 (
    echo ERREUR: Probleme de configuration detecte
    pause
    exit /b 1
)

echo.
echo ========================================
echo   SETUP TERMINE AVEC SUCCES !
echo ========================================
echo.
echo Votre backend EcosystIA est maintenant pret !
echo.
echo Prochaines etapes:
echo 1. Demarrer le serveur: python manage.py runserver
echo 2. Acceder a l'admin: http://localhost:8000/admin/
echo 3. Tester l'API: http://localhost:8000/api/docs/
echo.
echo Appuyez sur une touche pour continuer...
pause
