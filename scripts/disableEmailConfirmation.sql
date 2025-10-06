-- Désactiver la confirmation d'email obligatoire
-- Ce script configure Supabase pour accepter les utilisateurs sans confirmation d'email

-- 1. Désactiver l'envoi d'emails de confirmation
UPDATE auth.config 
SET enable_signup = true,
    enable_email_confirmations = false,
    enable_sms_confirmations = false;

-- 2. Confirmer automatiquement tous les utilisateurs existants
UPDATE auth.users 
SET email_confirmed_at = NOW(),
    phone_confirmed_at = NOW()
WHERE email_confirmed_at IS NULL;

-- 3. Créer une fonction pour confirmer automatiquement les nouveaux utilisateurs
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Confirmer automatiquement l'email et le téléphone
  UPDATE auth.users 
  SET email_confirmed_at = NOW(),
      phone_confirmed_at = NOW()
  WHERE id = NEW.id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Créer le trigger pour confirmer automatiquement les nouveaux utilisateurs
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- 5. Confirmer l'utilisateur admin existant
UPDATE auth.users 
SET email_confirmed_at = NOW()
WHERE email = 'admin@senegal.com';