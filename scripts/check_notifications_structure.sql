-- Script pour vérifier et corriger la structure de la table notifications
-- et créer la fonction RPC get_unread_notifications

-- 1. Vérifier la structure de la table notifications
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'notifications'
ORDER BY ordinal_position;

-- 2. Vérifier les contraintes et index
SELECT 
  constraint_name,
  constraint_type
FROM information_schema.table_constraints 
WHERE table_schema = 'public' 
  AND table_name = 'notifications';

-- 3. Vérifier les fonctions RPC disponibles
SELECT 
  routine_name,
  routine_type
FROM information_schema.routines 
WHERE routine_schema = 'public' 
  AND routine_name LIKE '%notification%';

-- 4. Créer ou remplacer la fonction get_unread_notifications
CREATE OR REPLACE FUNCTION get_unread_notifications(p_user_id UUID)
RETURNS TABLE (
  id UUID,
  user_id UUID,
  titre TEXT,
  message TEXT,
  taper TEXT,
  lire BOOLEAN,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    n.id,
    n.user_id,
    n.titre,
    n.message,
    n.taper,
    n.lire,
    n.created_at,
    n.updated_at
  FROM notifications n
  WHERE n.user_id = p_user_id
    AND (n.lire = false OR n.lire IS NULL)
  ORDER BY n.created_at DESC;
END;
$$;

-- 5. Accorder les permissions nécessaires
GRANT EXECUTE ON FUNCTION get_unread_notifications(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_unread_notifications(UUID) TO anon;

-- 6. Vérifier que la fonction a été créée
SELECT 
  routine_name,
  routine_type,
  data_type
FROM information_schema.routines 
WHERE routine_schema = 'public' 
  AND routine_name = 'get_unread_notifications';