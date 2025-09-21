@echo off
echo ========================================
echo    ECOSYSTIA BACKEND - DEMARRAGE
echo ========================================

echo.
echo [1/5] Verification de l'environnement...
python --version
if errorlevel 1 (
    echo ERREUR: Python n'est pas installe ou n'est pas dans le PATH
    echo Veuillez installer Python 3.11+ et l'ajouter au PATH
    pause
    exit /b 1
)

echo.
echo [2/5] Installation des dependances...
pip install -r requirements.txt

echo.
echo [3/5] Creation des migrations...
python manage.py makemigrations

echo.
echo [4/5] Application des migrations...
python manage.py migrate

echo.
echo [5/5] Demarrage du serveur...
echo.
echo ========================================
echo   ECOSYSTIA BACKEND DEMARRE !
echo ========================================
echo.
echo API disponible sur: http://localhost:8000
echo Documentation: http://localhost:8000/api/docs/
echo Admin: http://localhost:8000/admin/
echo.
echo Appuyez sur Ctrl+C pour arreter le serveur
echo.

python manage.py runserver
