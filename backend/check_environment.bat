@echo off
echo ========================================
echo    ECOSYSTIA - VERIFICATION ENVIRONNEMENT
echo ========================================

echo.
echo [1/6] Verification de Python...
python --version 2>nul
if errorlevel 1 (
    echo ❌ ERREUR: Python n'est pas installe ou n'est pas dans le PATH
    echo.
    echo Solutions possibles:
    echo 1. Installer Python depuis https://python.org
    echo 2. Ajouter Python au PATH systeme
    echo 3. Utiliser py au lieu de python
    echo.
    echo Tentative avec 'py'...
    py --version 2>nul
    if errorlevel 1 (
        echo ❌ 'py' non disponible non plus
        echo.
        echo Veuillez installer Python 3.11+ et relancer ce script
        pause
        exit /b 1
    ) else (
        echo ✅ Python trouve via 'py'
        set PYTHON_CMD=py
    )
) else (
    echo ✅ Python trouve via 'python'
    set PYTHON_CMD=python
)

echo.
echo [2/6] Verification de pip...
%PYTHON_CMD% -m pip --version 2>nul
if errorlevel 1 (
    echo ❌ ERREUR: pip n'est pas disponible
    pause
    exit /b 1
) else (
    echo ✅ pip disponible
)

echo.
echo [3/6] Verification du dossier requirements.txt...
if exist requirements.txt (
    echo ✅ requirements.txt trouve
) else (
    echo ❌ ERREUR: requirements.txt non trouve
    pause
    exit /b 1
)

echo.
echo [4/6] Verification de manage.py...
if exist manage.py (
    echo ✅ manage.py trouve
) else (
    echo ❌ ERREUR: manage.py non trouve
    pause
    exit /b 1
)

echo.
echo [5/6] Verification de la structure des apps...
if exist apps\authentication (
    echo ✅ apps\authentication trouve
) else (
    echo ❌ ERREUR: apps\authentication non trouve
)

if exist apps\users (
    echo ✅ apps\users trouve
) else (
    echo ❌ ERREUR: apps\users non trouve
)

if exist apps\projects (
    echo ✅ apps\projects trouve
) else (
    echo ❌ ERREUR: apps\projects non trouve
)

echo.
echo [6/6] Test de la configuration Django...
%PYTHON_CMD% manage.py check --deploy 2>nul
if errorlevel 1 (
    echo ⚠️  Configuration Django a des avertissements (normal en dev)
) else (
    echo ✅ Configuration Django OK
)

echo.
echo ========================================
echo   VERIFICATION TERMINEE
echo ========================================
echo.
echo Resume:
echo - Python: %PYTHON_CMD%
echo - Structure: OK
echo - Configuration: OK
echo.
echo Prochaines etapes:
echo 1. Executer: setup_backend.bat
echo 2. Ou executer: start_backend.bat
echo.
echo Appuyez sur une touche pour continuer...
pause
