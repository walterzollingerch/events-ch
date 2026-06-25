-- last_enriched_at: wann hat n8n diesen Event zuletzt angereichert
ALTER TABLE events ADD COLUMN IF NOT EXISTS last_enriched_at TIMESTAMPTZ;

-- RPC neu: COALESCE-Schutz für manuell gesetzte Felder
-- Regel: n8n überschreibt nur Felder die NULL sind (d.h. noch nie gesetzt oder vom Admin geleert)
CREATE OR REPLACE FUNCTION upsert_event_with_category(
  p_title       TEXT,
  p_start_date  TEXT,
  p_url         TEXT,
  p_source      TEXT,
  p_status      TEXT,
  p_category_id BIGINT
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_event_id UUID;
BEGIN
  INSERT INTO events (title, start_date, url, source, status, last_enriched_at)
  VALUES (
    p_title,
    p_start_date::TIMESTAMPTZ,
    p_url,
    p_source,
    p_status::event_status,
    NOW()
  )
  ON CONFLICT (url) DO UPDATE SET
    title            = COALESCE(events.title,       EXCLUDED.title),
    start_date       = COALESCE(events.start_date,  EXCLUDED.start_date),
    source           = COALESCE(events.source,      EXCLUDED.source),
    last_enriched_at = NOW(),
    updated_at       = NOW()
  RETURNING id INTO v_event_id;

  IF p_category_id IS NOT NULL THEN
    INSERT INTO event_category_links (event_id, category_id)
    VALUES (v_event_id, p_category_id)
    ON CONFLICT DO NOTHING;
  END IF;

  RETURN v_event_id;
END;
$$;

GRANT EXECUTE ON FUNCTION upsert_event_with_category TO authenticated, anon, service_role;
