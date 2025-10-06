-- Configuration finale pour l'authentification automatique
-- À exécuter dans Supabase Dashboard → SQL Editor

-- 1. Confirmer tous les utilisateurs existants
UPDATE auth.users 
SET email_confirmed_at = NOW()
WHERE email_confirmed_at IS NULL;

-- 2. Créer une fonction pour confirmer automatiquement les nouveaux utilisateurs
CREATE OR REPLACE FUNCTION auto_confirm_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Confirmer automatiquement l'email pour tous les nouveaux utilisateurs
  UPDATE auth.users 
  SET email_confirmed_at = NOW()
  WHERE id = NEW.id AND email_confirmed_at IS NULL;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Créer le trigger pour la confirmation automatique
DROP TRIGGER IF EXISTS on_user_created_auto_confirm ON auth.users;
CREATE TRIGGER on_user_created_auto_confirm
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION auto_confirm_user();

-- 4. Vérifier que la configuration est active
SELECT 'Configuration automatique activée' as status;
