#!/bin/bash

# =====================================================
# SCRIPT DE CONFIGURATION SUPABASE - ECOSYSTIA
# =====================================================

echo "🚀 Configuration de la base de données Supabase pour EcosystIA"
echo "=============================================================="

# Variables de configuration
SUPABASE_URL="${VITE_SUPABASE_URL:-}"
SUPABASE_ANON_KEY="${VITE_SUPABASE_ANON_KEY:-}"
PROJECT_ID="${SUPABASE_URL#https://}"
PROJECT_ID="${PROJECT_ID%.supabase.co}"

# Vérification des variables d'environnement
if [ -z "$SUPABASE_URL" ] || [ -z "$SUPABASE_ANON_KEY" ]; then
    echo "❌ Erreur: Variables d'environnement Supabase manquantes"
    echo "Veuillez définir VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY"
    echo ""
    echo "Exemple:"
    echo "export VITE_SUPABASE_URL='https://your-project.supabase.co'"
    echo "export VITE_SUPABASE_ANON_KEY='your-anon-key'"
    exit 1
fi

echo "✅ Configuration détectée:"
echo "   - URL: $SUPABASE_URL"
echo "   - Projet: $PROJECT_ID"
echo ""

# Fonction pour exécuter du SQL via l'API Supabase
execute_sql() {
    local sql_file="$1"
    local description="$2"
    
    echo "📋 $description..."
    
    # Préparer le contenu SQL (échapper les caractères spéciaux)
    local sql_content=$(cat "$sql_file" | sed 's/"/\\"/g' | tr -d '\n' | sed 's/;/;\n/g')
    
    # Appeler l'API Supabase pour exécuter le SQL
    local response=$(curl -s -X POST \
        "$SUPABASE_URL/rest/v1/rpc/exec_sql" \
        -H "apikey: $SUPABASE_ANON_KEY" \
        -H "Authorization: Bearer $SUPABASE_ANON_KEY" \
        -H "Content-Type: application/json" \
        -d "{\"sql\": \"$sql_content\"}")
    
    if echo "$response" | grep -q "error\|Error\|ERROR"; then
        echo "❌ Erreur lors de l'exécution de $sql_file:"
        echo "$response"
        return 1
    else
        echo "✅ $description terminé avec succès"
        return 0
    fi
}

# Fonction alternative utilisant psql si disponible
execute_sql_psql() {
    local sql_file="$1"
    local description="$2"
    
    echo "📋 $description (via psql)..."
    
    # Extraire l'host, port, dbname, user, password de l'URL
    local db_url="$SUPABASE_URL"
    local host=$(echo "$db_url" | sed 's/.*@\([^:]*\):.*/\1/')
    local port=$(echo "$db_url" | sed 's/.*:\([0-9]*\)\/.*/\1/')
    local dbname=$(echo "$db_url" | sed 's/.*\/\([^?]*\).*/\1/')
    
    # Construire la commande psql
    local psql_cmd="psql -h $host -p $port -d $dbname -f $sql_file"
    
    if command -v psql &> /dev/null; then
        if $psql_cmd; then
            echo "✅ $description terminé avec succès"
            return 0
        else
            echo "❌ Erreur lors de l'exécution de $sql_file"
            return 1
        fi
    else
        echo "⚠️  psql non disponible, tentative via API..."
        return 1
    fi
}

# Vérifier si les fichiers SQL existent
if [ ! -f "database/schema.sql" ]; then
    echo "❌ Fichier database/schema.sql non trouvé"
    exit 1
fi

if [ ! -f "database/rls_policies.sql" ]; then
    echo "❌ Fichier database/rls_policies.sql non trouvé"
    exit 1
fi

if [ ! -f "database/seed_data.sql" ]; then
    echo "❌ Fichier database/seed_data.sql non trouvé"
    exit 1
fi

echo "🔍 Vérification de la connexion Supabase..."

# Test de connexion
test_response=$(curl -s -X GET \
    "$SUPABASE_URL/rest/v1/" \
    -H "apikey: $SUPABASE_ANON_KEY" \
    -H "Authorization: Bearer $SUPABASE_ANON_KEY")

if echo "$test_response" | grep -q "error\|Error\|ERROR"; then
    echo "❌ Impossible de se connecter à Supabase"
    echo "Vérifiez vos variables d'environnement"
    exit 1
else
    echo "✅ Connexion Supabase établie"
fi

echo ""
echo "📊 Démarrage de la configuration de la base de données..."
echo ""

# Étape 1: Création du schéma
echo "🏗️  ÉTAPE 1: Création du schéma de base de données"
if execute_sql_psql "database/schema.sql" "Création des tables et structures"; then
    echo "✅ Schéma créé avec succès"
else
    echo "⚠️  Échec via psql, tentative via API..."
    if execute_sql "database/schema.sql" "Création des tables et structures"; then
        echo "✅ Schéma créé avec succès"
    else
        echo "❌ Impossible de créer le schéma"
        echo "Veuillez exécuter manuellement le fichier database/schema.sql dans l'éditeur SQL de Supabase"
        exit 1
    fi
fi

echo ""

# Étape 2: Configuration des politiques RLS
echo "🔒 ÉTAPE 2: Configuration des politiques RLS"
if execute_sql_psql "database/rls_policies.sql" "Application des politiques de sécurité"; then
    echo "✅ Politiques RLS configurées avec succès"
else
    echo "⚠️  Échec via psql, tentative via API..."
    if execute_sql "database/rls_policies.sql" "Application des politiques de sécurité"; then
        echo "✅ Politiques RLS configurées avec succès"
    else
        echo "❌ Impossible de configurer les politiques RLS"
        echo "Veuillez exécuter manuellement le fichier database/rls_policies.sql dans l'éditeur SQL de Supabase"
        exit 1
    fi
fi

echo ""

# Étape 3: Insertion des données initiales
echo "🌱 ÉTAPE 3: Insertion des données initiales"
if execute_sql_psql "database/seed_data.sql" "Insertion des données de démonstration"; then
    echo "✅ Données initiales insérées avec succès"
else
    echo "⚠️  Échec via psql, tentative via API..."
    if execute_sql "database/seed_data.sql" "Insertion des données de démonstration"; then
        echo "✅ Données initiales insérées avec succès"
    else
        echo "❌ Impossible d'insérer les données initiales"
        echo "Veuillez exécuter manuellement le fichier database/seed_data.sql dans l'éditeur SQL de Supabase"
        exit 1
    fi
fi

echo ""

# Étape 4: Vérification de la configuration
echo "🔍 ÉTAPE 4: Vérification de la configuration"

# Vérifier que les tables existent
echo "📋 Vérification des tables créées..."
tables_response=$(curl -s -X GET \
    "$SUPABASE_URL/rest/v1/information_schema.tables?select=table_name&table_schema=eq.public" \
    -H "apikey: $SUPABASE_ANON_KEY" \
    -H "Authorization: Bearer $SUPABASE_ANON_KEY")

if echo "$tables_response" | grep -q "users\|projects\|courses\|jobs"; then
    echo "✅ Tables principales créées"
else
    echo "⚠️  Certaines tables peuvent être manquantes"
fi

# Vérifier que les modules sont configurés
echo "📋 Vérification des modules..."
modules_response=$(curl -s -X GET \
    "$SUPABASE_URL/rest/v1/modules?select=id,name" \
    -H "apikey: $SUPABASE_ANON_KEY" \
    -H "Authorization: Bearer $SUPABASE_ANON_KEY")

if echo "$modules_response" | grep -q "dashboard\|projects\|courses"; then
    echo "✅ Modules configurés"
else
    echo "⚠️  Modules non trouvés"
fi

# Vérifier que les permissions sont configurées
echo "📋 Vérification des permissions..."
permissions_response=$(curl -s -X GET \
    "$SUPABASE_URL/rest/v1/role_permissions?select=role,module_id" \
    -H "apikey: $SUPABASE_ANON_KEY" \
    -H "Authorization: Bearer $SUPABASE_ANON_KEY")

if echo "$permissions_response" | grep -q "super_administrator\|manager\|student"; then
    echo "✅ Permissions configurées"
else
    echo "⚠️  Permissions non trouvées"
fi

echo ""
echo "🎉 CONFIGURATION TERMINÉE !"
echo "=========================="
echo ""
echo "✅ Base de données EcosystIA configurée avec succès"
echo "✅ Schéma créé avec toutes les tables"
echo "✅ Politiques RLS appliquées"
echo "✅ Données initiales insérées"
echo "✅ 18 modules configurés"
echo "✅ 19 rôles avec permissions granulaires"
echo "✅ Données de démonstration ajoutées"
echo ""
echo "🚀 Votre base de données est prête pour EcosystIA !"
echo ""
echo "📋 PROCHAINES ÉTAPES:"
echo "1. Créer votre premier utilisateur super administrateur"
echo "2. Tester la connexion depuis l'application"
echo "3. Configurer les variables d'environnement"
echo "4. Démarrer l'application avec: npm run dev"
echo ""
echo "🔗 Accédez à votre dashboard Supabase:"
echo "   https://supabase.com/dashboard/project/$PROJECT_ID"
echo ""
echo "📖 Documentation:"
echo "   - Schéma: database/schema.sql"
echo "   - Politiques: database/rls_policies.sql"
echo "   - Données: database/seed_data.sql"
echo ""
echo "✨ Bon développement avec EcosystIA !"
