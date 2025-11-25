-- Supprimer la contrainte d'unicité sur tracking_id
-- pour permettre l'envoi individuel avec le même tracking_id

-- Supprimer l'index unique existant
DROP INDEX IF EXISTS idx_email_history_tracking_id;

-- Créer un index normal (non-unique) pour optimiser les requêtes de groupement
CREATE INDEX IF NOT EXISTS idx_email_history_tracking_id 
  ON email_history(tracking_id);

-- Ajouter également un index sur (tracking_id, sent_at) pour optimiser le tri
CREATE INDEX IF NOT EXISTS idx_email_history_tracking_sent 
  ON email_history(tracking_id, sent_at DESC);


