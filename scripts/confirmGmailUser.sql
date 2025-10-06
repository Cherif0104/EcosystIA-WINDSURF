-- Confirmer l'email de l'utilisateur Gmail
UPDATE auth.users 
SET email_confirmed_at = NOW()
WHERE email = 'testuser123@gmail.com';

-- Vérifier la confirmation
SELECT id, email, email_confirmed_at, created_at 
FROM auth.users 
WHERE email = 'testuser123@gmail.com';
