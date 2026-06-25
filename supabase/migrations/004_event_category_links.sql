-- category_id (Scalar) aus 003 entfernen — wird durch Junction-Tabelle ersetzt
ALTER TABLE events DROP COLUMN IF EXISTS category_id;

-- UNIQUE auf url für ON CONFLICT
-- Duplikate entfernen, falls vorhanden (neuere Einträge gewinnen)
DELETE FROM events a USING events b
WHERE a.created_at < b.created_at AND a.url = b.url AND a.url IS NOT NULL;

ALTER TABLE events ADD CONSTRAINT events_url_unique UNIQUE (url);

-- Junction-Tabelle: ein Event kann mehreren Kategorien gehören
CREATE TABLE IF NOT EXISTS event_category_links (
  event_id    UUID   NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  category_id BIGINT NOT NULL REFERENCES event_categories(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (event_id, category_id)
);

ALTER TABLE event_category_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "authenticated users can manage event_category_links"
  ON event_category_links FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "service role can manage event_category_links"
  ON event_category_links FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Atomare RPC-Funktion: Event upserten + Kategorie-Link setzen
-- Aufruf via n8n: POST /rest/v1/rpc/upsert_event_with_category
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
  INSERT INTO events (title, start_date, url, source, status)
  VALUES (
    p_title,
    p_start_date::TIMESTAMPTZ,
    p_url,
    p_source,
    p_status::event_status
  )
  ON CONFLICT (url) DO UPDATE
    SET updated_at = NOW()
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
