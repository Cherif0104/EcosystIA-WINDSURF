-- Script pour corriger la fonction get_unread_notifications
-- Il faut d'abord supprimer l'ancienne fonction puis la recréer

-- 1. Supprimer l'ancienne fonction si elle existe
DROP FUNCTION IF EXISTS get_unread_notifications(UUID);

-- 2. Créer la nouvelle fonction avec la structure correcte
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

-- 3. Accorder les permissions nécessaires
GRANT EXECUTE ON FUNCTION get_unread_notifications(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_unread_notifications(UUID) TO anon;

-- 4. Vérifier que la fonction a été créée correctement
SELECT 
  routine_name,
  routine_type,
  data_type
FROM information_schema.routines 
WHERE routine_schema = 'public' 
  AND routine_name = 'get_unread_notifications';
