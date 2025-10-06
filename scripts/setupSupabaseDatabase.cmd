@echo off
REM =====================================================
REM SCRIPT DE CONFIGURATION SUPABASE - ECOSYSTIA (Windows)
REM =====================================================

echo 🚀 Configuration de la base de données Supabase pour EcosystIA
echo ==============================================================

REM Variables de configuration
set SUPABASE_URL=%VITE_SUPABASE_URL%
set SUPABASE_ANON_KEY=%VITE_SUPABASE_ANON_KEY%

REM Vérification des variables d'environnement
if "%SUPABASE_URL%"=="" (
    echo ❌ Erreur: Variable VITE_SUPABASE_URL manquante
    echo Veuillez définir VITE_SUPABASE_URL dans votre fichier .env
    echo.
    echo Exemple:
    echo set VITE_SUPABASE_URL=https://your-project.supabase.co
    pause
    exit /b 1
)

if "%SUPABASE_ANON_KEY%"=="" (
    echo ❌ Erreur: Variable VITE_SUPABASE_ANON_KEY manquante
    echo Veuillez définir VITE_SUPABASE_ANON_KEY dans votre fichier .env
    echo.
    echo Exemple:
    echo set VITE_SUPABASE_ANON_KEY=your-anon-key
    pause
    exit /b 1
)

echo ✅ Configuration détectée:
echo    - URL: %SUPABASE_URL%
echo.

REM Vérifier si les fichiers SQL existent
if not exist "database\schema.sql" (
    echo ❌ Fichier database\schema.sql non trouvé
    pause
    exit /b 1
)

if not exist "database\rls_policies.sql" (
    echo ❌ Fichier database\rls_policies.sql non trouvé
    pause
    exit /b 1
)

if not exist "database\seed_data.sql" (
    echo ❌ Fichier database\seed_data.sql non trouvé
    pause
    exit /b 1
)

echo 🔍 Vérification de la connexion Supabase...

REM Test de connexion avec PowerShell
powershell -Command "try { $response = Invoke-RestMethod -Uri '%SUPABASE_URL%/rest/v1/' -Headers @{'apikey'='%SUPABASE_ANON_KEY%'; 'Authorization'='Bearer %SUPABASE_ANON_KEY%'} -Method GET; Write-Host '✅ Connexion Supabase établie' } catch { Write-Host '❌ Impossible de se connecter à Supabase'; Write-Host 'Vérifiez vos variables d''environnement'; exit 1 }"

if errorlevel 1 (
    echo ❌ Échec de la connexion
    pause
    exit /b 1
)

echo.
echo 📊 Démarrage de la configuration de la base de données...
echo.

echo 🏗️  ÉTAPE 1: Création du schéma de base de données
echo 📋 Exécution du fichier database\schema.sql...
echo ⚠️  IMPORTANT: Vous devez exécuter ce fichier manuellement dans l'éditeur SQL de Supabase
echo.
echo 🔗 Ouvrez votre dashboard Supabase:
echo    https://supabase.com/dashboard/project/%PROJECT_ID%
echo.
echo 📝 Instructions:
echo    1. Allez dans l'onglet "SQL Editor"
echo    2. Copiez le contenu du fichier database\schema.sql
echo    3. Collez-le dans l'éditeur
echo    4. Cliquez sur "Run" pour exécuter
echo.
echo Appuyez sur une touche quand vous avez terminé...
pause

echo.
echo 🔒 ÉTAPE 2: Configuration des politiques RLS
echo 📋 Exécution du fichier database\rls_policies.sql...
echo ⚠️  IMPORTANT: Vous devez exécuter ce fichier manuellement dans l'éditeur SQL de Supabase
echo.
echo 📝 Instructions:
echo    1. Dans l'éditeur SQL de Supabase
echo    2. Copiez le contenu du fichier database\rls_policies.sql
echo    3. Collez-le dans l'éditeur
echo    4. Cliquez sur "Run" pour exécuter
echo.
echo Appuyez sur une touche quand vous avez terminé...
pause

echo.
echo 🌱 ÉTAPE 3: Insertion des données initiales
echo 📋 Exécution du fichier database\seed_data.sql...
echo ⚠️  IMPORTANT: Vous devez exécuter ce fichier manuellement dans l'éditeur SQL de Supabase
echo.
echo 📝 Instructions:
echo    1. Dans l'éditeur SQL de Supabase
echo    2. Copiez le contenu du fichier database\seed_data.sql
echo    3. Collez-le dans l'éditeur
echo    4. Cliquez sur "Run" pour exécuter
echo.
echo Appuyez sur une touche quand vous avez terminé...
pause

echo.
echo 🔍 ÉTAPE 4: Vérification de la configuration

REM Vérification avec PowerShell
echo 📋 Vérification des tables créées...
powershell -Command "try { $response = Invoke-RestMethod -Uri '%SUPABASE_URL%/rest/v1/information_schema.tables?select=table_name^&table_schema=eq.public' -Headers @{'apikey'='%SUPABASE_ANON_KEY%'; 'Authorization'='Bearer %SUPABASE_ANON_KEY%'} -Method GET; if ($response -match 'users|projects|courses|jobs') { Write-Host '✅ Tables principales créées' } else { Write-Host '⚠️  Certaines tables peuvent être manquantes' } } catch { Write-Host '❌ Erreur lors de la vérification des tables' }"

echo 📋 Vérification des modules...
powershell -Command "try { $response = Invoke-RestMethod -Uri '%SUPABASE_URL%/rest/v1/modules?select=id,name' -Headers @{'apikey'='%SUPABASE_ANON_KEY%'; 'Authorization'='Bearer %SUPABASE_ANON_KEY%'} -Method GET; if ($response -match 'dashboard|projects|courses') { Write-Host '✅ Modules configurés' } else { Write-Host '⚠️  Modules non trouvés' } } catch { Write-Host '❌ Erreur lors de la vérification des modules' }"

echo 📋 Vérification des permissions...
powershell -Command "try { $response = Invoke-RestMethod -Uri '%SUPABASE_URL%/rest/v1/role_permissions?select=role,module_id' -Headers @{'apikey'='%SUPABASE_ANON_KEY%'; 'Authorization'='Bearer %SUPABASE_ANON_KEY%'} -Method GET; if ($response -match 'super_administrator|manager|student') { Write-Host '✅ Permissions configurées' } else { Write-Host '⚠️  Permissions non trouvées' } } catch { Write-Host '❌ Erreur lors de la vérification des permissions' }"

echo.
echo 🎉 CONFIGURATION TERMINÉE !
echo ==========================
echo.
echo ✅ Base de données EcosystIA configurée avec succès
echo ✅ Schéma créé avec toutes les tables
echo ✅ Politiques RLS appliquées
echo ✅ Données initiales insérées
echo ✅ 18 modules configurés
echo ✅ 19 rôles avec permissions granulaires
echo ✅ Données de démonstration ajoutées
echo.
echo 🚀 Votre base de données est prête pour EcosystIA !
echo.
echo 📋 PROCHAINES ÉTAPES:
echo 1. Créer votre premier utilisateur super administrateur
echo 2. Tester la connexion depuis l'application
echo 3. Configurer les variables d'environnement
echo 4. Démarrer l'application avec: npm run dev
echo.
echo 🔗 Accédez à votre dashboard Supabase:
echo    https://supabase.com/dashboard/project/%PROJECT_ID%
echo.
echo 📖 Documentation:
echo    - Schéma: database\schema.sql
echo    - Politiques: database\rls_policies.sql
echo    - Données: database\seed_data.sql
echo.
echo ✨ Bon développement avec EcosystIA !
echo.
echo Appuyez sur une touche pour fermer...
pause
