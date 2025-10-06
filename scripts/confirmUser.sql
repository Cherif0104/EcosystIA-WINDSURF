-- Confirmer l'utilisateur dans auth.users
UPDATE auth.users 
SET email_confirmed_at = NOW(), 
    confirmed_at = NOW()
WHERE email = 'contact@impulcia-afrique.com';
