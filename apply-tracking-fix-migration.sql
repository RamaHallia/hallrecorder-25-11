-- ⚠️ IMPORTANT : Appliquer cette migration AVANT de tester l'envoi individuel
-- Cette migration supprime la contrainte d'unicité sur tracking_id
-- pour permettre à plusieurs emails d'avoir le même tracking_id

-- 1. Supprimer l'index unique existant
DROP INDEX IF EXISTS idx_email_history_tracking_id;

-- 2. Créer un index normal (non-unique) pour optimiser les requêtes
CREATE INDEX IF NOT EXISTS idx_email_history_tracking_id 
  ON email_history(tracking_id);

-- 3. Créer un index composite pour optimiser le tri par tracking_id + date
CREATE INDEX IF NOT EXISTS idx_email_history_tracking_sent 
  ON email_history(tracking_id, sent_at DESC);

-- ✅ Migration terminée !
-- Vous pouvez maintenant envoyer des emails individuels avec le même tracking_id

-- Pour vérifier :
-- SELECT tracking_id, COUNT(*) as count, string_agg(recipients, ', ') as all_recipients
-- FROM email_history 
-- GROUP BY tracking_id 
-- HAVING COUNT(*) > 1;


