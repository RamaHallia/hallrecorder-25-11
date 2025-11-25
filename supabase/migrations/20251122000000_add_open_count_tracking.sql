-- Ajouter le compteur d'ouvertures à email_history
ALTER TABLE email_history
  ADD COLUMN IF NOT EXISTS open_count integer DEFAULT 0;

-- Fonction RPC pour incrémenter le compteur d'ouvertures
CREATE OR REPLACE FUNCTION increment_open_count(history_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE email_history
  SET open_count = COALESCE(open_count, 0) + 1
  WHERE id = history_id;
END;
$$;

-- Activer Realtime sur email_history et email_open_events
ALTER PUBLICATION supabase_realtime ADD TABLE email_history;
ALTER PUBLICATION supabase_realtime ADD TABLE email_open_events;

-- Mettre à jour les compteurs existants basés sur les events déjà enregistrés
UPDATE email_history eh
SET open_count = (
  SELECT COUNT(*)
  FROM email_open_events eoe
  WHERE eoe.email_history_id = eh.id
)
WHERE EXISTS (
  SELECT 1 FROM email_open_events eoe WHERE eoe.email_history_id = eh.id
);
