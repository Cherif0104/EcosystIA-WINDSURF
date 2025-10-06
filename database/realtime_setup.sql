-- =====================================================
-- CONFIGURATION TEMPS RÉEL SUPABASE - ECOSYSTIA
-- =====================================================

-- Activer la réplication pour toutes les tables critiques
ALTER PUBLICATION supabase_realtime ADD TABLE public.users;
ALTER PUBLICATION supabase_realtime ADD TABLE public.projects;
ALTER PUBLICATION supabase_realtime ADD TABLE public.project_team_members;
ALTER PUBLICATION supabase_realtime ADD TABLE public.tasks;
ALTER PUBLICATION supabase_realtime ADD TABLE public.courses;
ALTER PUBLICATION supabase_realtime ADD TABLE public.course_enrollments;
ALTER PUBLICATION supabase_realtime ADD TABLE public.jobs;
ALTER PUBLICATION supabase_realtime ADD TABLE public.job_applications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.time_logs;
ALTER PUBLICATION supabase_realtime ADD TABLE public.leave_requests;
ALTER PUBLICATION supabase_realtime ADD TABLE public.invoices;
ALTER PUBLICATION supabase_realtime ADD TABLE public.expenses;
ALTER PUBLICATION supabase_realtime ADD TABLE public.contacts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.documents;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.system_logs;

-- =====================================================
-- FONCTIONS POUR LE TEMPS RÉEL
-- =====================================================

-- Fonction pour notifier les changements de projet
CREATE OR REPLACE FUNCTION notify_project_change()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM pg_notify('project_changes', json_build_object(
    'table', TG_TABLE_NAME,
    'action', TG_OP,
    'id', COALESCE(NEW.id, OLD.id),
    'data', COALESCE(NEW, OLD),
    'timestamp', NOW()
  )::text);
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Fonction pour notifier les changements de tâche
CREATE OR REPLACE FUNCTION notify_task_change()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM pg_notify('task_changes', json_build_object(
    'table', TG_TABLE_NAME,
    'action', TG_OP,
    'id', COALESCE(NEW.id, OLD.id),
    'project_id', COALESCE(NEW.project_id, OLD.project_id),
    'data', COALESCE(NEW, OLD),
    'timestamp', NOW()
  )::text);
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Fonction pour notifier les changements d'utilisateur
CREATE OR REPLACE FUNCTION notify_user_change()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM pg_notify('user_changes', json_build_object(
    'table', TG_TABLE_NAME,
    'action', TG_OP,
    'id', COALESCE(NEW.id, OLD.id),
    'data', COALESCE(NEW, OLD),
    'timestamp', NOW()
  )::text);
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Fonction pour notifier les changements de cours
CREATE OR REPLACE FUNCTION notify_course_change()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM pg_notify('course_changes', json_build_object(
    'table', TG_TABLE_NAME,
    'action', TG_OP,
    'id', COALESCE(NEW.id, OLD.id),
    'data', COALESCE(NEW, OLD),
    'timestamp', NOW()
  )::text);
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Fonction pour notifier les changements d'emploi
CREATE OR REPLACE FUNCTION notify_job_change()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM pg_notify('job_changes', json_build_object(
    'table', TG_TABLE_NAME,
    'action', TG_OP,
    'id', COALESCE(NEW.id, OLD.id),
    'data', COALESCE(NEW, OLD),
    'timestamp', NOW()
  )::text);
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Fonction pour notifier les changements de log de temps
CREATE OR REPLACE FUNCTION notify_time_log_change()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM pg_notify('time_log_changes', json_build_object(
    'table', TG_TABLE_NAME,
    'action', TG_OP,
    'id', COALESCE(NEW.id, OLD.id),
    'user_id', COALESCE(NEW.user_id, OLD.user_id),
    'project_id', COALESCE(NEW.project_id, OLD.project_id),
    'data', COALESCE(NEW, OLD),
    'timestamp', NOW()
  )::text);
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Fonction pour notifier les changements de notification
CREATE OR REPLACE FUNCTION notify_notification_change()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM pg_notify('notification_changes', json_build_object(
    'table', TG_TABLE_NAME,
    'action', TG_OP,
    'id', COALESCE(NEW.id, OLD.id),
    'user_id', COALESCE(NEW.user_id, OLD.user_id),
    'data', COALESCE(NEW, OLD),
    'timestamp', NOW()
  )::text);
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- TRIGGERS POUR LE TEMPS RÉEL
-- =====================================================

-- Triggers pour les projets
CREATE TRIGGER projects_realtime_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.projects
  FOR EACH ROW EXECUTE FUNCTION notify_project_change();

-- Triggers pour les tâches
CREATE TRIGGER tasks_realtime_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.tasks
  FOR EACH ROW EXECUTE FUNCTION notify_task_change();

-- Triggers pour les utilisateurs
CREATE TRIGGER users_realtime_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.users
  FOR EACH ROW EXECUTE FUNCTION notify_user_change();

-- Triggers pour les cours
CREATE TRIGGER courses_realtime_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.courses
  FOR EACH ROW EXECUTE FUNCTION notify_course_change();

-- Triggers pour les emplois
CREATE TRIGGER jobs_realtime_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.jobs
  FOR EACH ROW EXECUTE FUNCTION notify_job_change();

-- Triggers pour les logs de temps
CREATE TRIGGER time_logs_realtime_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.time_logs
  FOR EACH ROW EXECUTE FUNCTION notify_time_log_change();

-- Triggers pour les notifications
CREATE TRIGGER notifications_realtime_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.notifications
  FOR EACH ROW EXECUTE FUNCTION notify_notification_change();

-- =====================================================
-- FONCTIONS POUR LA SAUVEGARDE AUTOMATIQUE
-- =====================================================

-- Fonction pour créer automatiquement une notification
CREATE OR REPLACE FUNCTION create_notification(
  p_user_id UUID,
  p_title TEXT,
  p_message TEXT,
  p_type TEXT DEFAULT 'info',
  p_action_url TEXT DEFAULT NULL,
  p_data JSONB DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  notification_id UUID;
BEGIN
  INSERT INTO public.notifications (
    user_id, title, message, type, action_url, data
  ) VALUES (
    p_user_id, p_title, p_message, p_type::notification_type, p_action_url, p_data
  ) RETURNING id INTO notification_id;
  
  RETURN notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour marquer les notifications comme lues
CREATE OR REPLACE FUNCTION mark_notifications_read(
  p_user_id UUID,
  p_notification_ids UUID[] DEFAULT NULL
)
RETURNS INTEGER AS $$
DECLARE
  updated_count INTEGER;
BEGIN
  IF p_notification_ids IS NULL THEN
    UPDATE public.notifications 
    SET status = 'read', read_at = NOW()
    WHERE user_id = p_user_id AND status = 'unread';
  ELSE
    UPDATE public.notifications 
    SET status = 'read', read_at = NOW()
    WHERE user_id = p_user_id AND id = ANY(p_notification_ids);
  END IF;
  
  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RETURN updated_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour obtenir les notifications non lues
CREATE OR REPLACE FUNCTION get_unread_notifications(p_user_id UUID)
RETURNS TABLE (
  id UUID,
  title TEXT,
  message TEXT,
  type notification_type,
  action_url TEXT,
  data JSONB,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT n.id, n.title, n.message, n.type, n.action_url, n.data, n.created_at
  FROM public.notifications n
  WHERE n.user_id = p_user_id 
    AND n.status = 'unread'
    AND (n.expires_at IS NULL OR n.expires_at > NOW())
  ORDER BY n.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- FONCTIONS POUR LA SYNCHRONISATION TEMPS RÉEL
-- =====================================================

-- Fonction pour obtenir les données d'un projet en temps réel
CREATE OR REPLACE FUNCTION get_project_realtime_data(p_project_id INTEGER)
RETURNS JSONB AS $$
DECLARE
  project_data JSONB;
  team_data JSONB;
  tasks_data JSONB;
  result JSONB;
BEGIN
  -- Récupérer les données du projet
  SELECT to_jsonb(p.*) INTO project_data
  FROM public.projects p
  WHERE p.id = p_project_id;
  
  -- Récupérer les données de l'équipe
  SELECT jsonb_agg(
    jsonb_build_object(
      'user_id', ptm.user_id,
      'role', ptm.role,
      'is_active', ptm.is_active,
      'user', to_jsonb(u.*)
    )
  ) INTO team_data
  FROM public.project_team_members ptm
  JOIN public.users u ON u.id = ptm.user_id
  WHERE ptm.project_id = p_project_id AND ptm.is_active = true;
  
  -- Récupérer les données des tâches
  SELECT jsonb_agg(to_jsonb(t.*)) INTO tasks_data
  FROM public.tasks t
  WHERE t.project_id = p_project_id;
  
  -- Construire le résultat
  result := jsonb_build_object(
    'project', project_data,
    'team', team_data,
    'tasks', tasks_data,
    'last_updated', NOW()
  );
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour obtenir les statistiques temps réel d'un utilisateur
CREATE OR REPLACE FUNCTION get_user_realtime_stats(p_user_id UUID)
RETURNS JSONB AS $$
DECLARE
  stats JSONB;
BEGIN
  SELECT jsonb_build_object(
    'active_projects', (
      SELECT COUNT(*)
      FROM public.project_team_members ptm
      JOIN public.projects p ON p.id = ptm.project_id
      WHERE ptm.user_id = p_user_id 
        AND ptm.is_active = true 
        AND p.status = 'In Progress'
    ),
    'completed_tasks', (
      SELECT COUNT(*)
      FROM public.tasks t
      WHERE t.assignee_id = p_user_id AND t.status = 'Done'
    ),
    'time_logged_today', (
      SELECT COALESCE(SUM(duration), 0)
      FROM public.time_logs tl
      WHERE tl.user_id = p_user_id 
        AND tl.date = CURRENT_DATE
    ),
    'pending_leave_requests', (
      SELECT COUNT(*)
      FROM public.leave_requests lr
      WHERE lr.user_id = p_user_id AND lr.status = 'Pending'
    ),
    'unread_notifications', (
      SELECT COUNT(*)
      FROM public.notifications n
      WHERE n.user_id = p_user_id 
        AND n.status = 'unread'
        AND (n.expires_at IS NULL OR n.expires_at > NOW())
    ),
    'last_updated', NOW()
  ) INTO stats;
  
  RETURN stats;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- POLITIQUES RLS POUR LES NOTIFICATIONS
-- =====================================================

-- Politique pour les notifications : utilisateurs peuvent voir leurs propres notifications
CREATE POLICY "Users can view own notifications" ON public.notifications
  FOR SELECT USING (user_id = auth.uid());

-- Politique pour les notifications : utilisateurs peuvent modifier leurs propres notifications
CREATE POLICY "Users can update own notifications" ON public.notifications
  FOR UPDATE USING (user_id = auth.uid());

-- Politique pour les notifications : système peut créer des notifications
CREATE POLICY "System can create notifications" ON public.notifications
  FOR INSERT WITH CHECK (true);

-- =====================================================
-- INDEXES POUR LES PERFORMANCES TEMPS RÉEL
-- =====================================================

-- Index sur les notifications pour les requêtes fréquentes
CREATE INDEX IF NOT EXISTS idx_notifications_user_status ON public.notifications(user_id, status);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_expires_at ON public.notifications(expires_at) WHERE expires_at IS NOT NULL;

-- Index sur les logs de temps pour les statistiques temps réel
CREATE INDEX IF NOT EXISTS idx_time_logs_user_date ON public.time_logs(user_id, date);
CREATE INDEX IF NOT EXISTS idx_time_logs_project_date ON public.time_logs(project_id, date);

-- Index sur les tâches pour les mises à jour temps réel
CREATE INDEX IF NOT EXISTS idx_tasks_project_status ON public.tasks(project_id, status);
CREATE INDEX IF NOT EXISTS idx_tasks_assignee_status ON public.tasks(assignee_id, status);

-- =====================================================
-- COMMENTAIRES ET DOCUMENTATION
-- =====================================================

COMMENT ON FUNCTION notify_project_change() IS 'Notifie les changements de projet en temps réel';
COMMENT ON FUNCTION notify_task_change() IS 'Notifie les changements de tâche en temps réel';
COMMENT ON FUNCTION notify_user_change() IS 'Notifie les changements d\'utilisateur en temps réel';
COMMENT ON FUNCTION notify_course_change() IS 'Notifie les changements de cours en temps réel';
COMMENT ON FUNCTION notify_job_change() IS 'Notifie les changements d\'emploi en temps réel';
COMMENT ON FUNCTION notify_time_log_change() IS 'Notifie les changements de log de temps en temps réel';
COMMENT ON FUNCTION notify_notification_change() IS 'Notifie les changements de notification en temps réel';

COMMENT ON FUNCTION create_notification(UUID, TEXT, TEXT, TEXT, TEXT, JSONB) IS 'Crée une notification pour un utilisateur';
COMMENT ON FUNCTION mark_notifications_read(UUID, UUID[]) IS 'Marque les notifications comme lues';
COMMENT ON FUNCTION get_unread_notifications(UUID) IS 'Récupère les notifications non lues d\'un utilisateur';

COMMENT ON FUNCTION get_project_realtime_data(INTEGER) IS 'Récupère les données complètes d\'un projet pour le temps réel';
COMMENT ON FUNCTION get_user_realtime_stats(UUID) IS 'Récupère les statistiques temps réel d\'un utilisateur';

-- Message de confirmation
DO $$
BEGIN
  RAISE NOTICE 'Configuration temps réel Supabase terminée avec succès !';
  RAISE NOTICE 'Tables avec réplication: %, Triggers: %, Fonctions: %', 
    (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_name IN ('users', 'projects', 'tasks', 'courses', 'jobs', 'time_logs', 'notifications')),
    7,
    9;
END $$;
