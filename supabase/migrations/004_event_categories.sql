-- event_categories: verwaltbare Kategorien für den Gemini-Recherche-Workflow
CREATE TABLE IF NOT EXISTS event_categories (
  id          BIGSERIAL PRIMARY KEY,
  name        TEXT NOT NULL,
  gemini_prompt TEXT NOT NULL,
  active      BOOLEAN NOT NULL DEFAULT true,
  sort_order  INTEGER NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER event_categories_updated_at
  BEFORE UPDATE ON event_categories
  FOR EACH ROW EXECUTE PROCEDURE set_updated_at();

CREATE INDEX ON event_categories (active);
CREATE INDEX ON event_categories (sort_order);

ALTER TABLE event_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "authenticated users can read event_categories"
  ON event_categories FOR SELECT TO authenticated USING (true);

CREATE POLICY "authenticated users can manage event_categories"
  ON event_categories FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- category_id FK auf events
ALTER TABLE events ADD COLUMN IF NOT EXISTS category_id BIGINT REFERENCES event_categories(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS events_category_id_idx ON events(category_id);

-- Standard-Kategorien (übereinstimmend mit bisherigem n8n-Workflow)
INSERT INTO event_categories (name, gemini_prompt, active, sort_order) VALUES
  ('Konzerte & Entertainment', 'Konzerte, Musik-Festivals und Entertainment-Veranstaltungen', true, 1),
  ('Sport',                   'Sport-Events, Meisterschaften und Sportveranstaltungen',       true, 2),
  ('Kultur & Ausstellungen',  'Kulturveranstaltungen, Ausstellungen, Theater und Museen',     true, 3),
  ('Messen & Kongresse',      'Messen, Kongresse, Konferenzen und Business-Events',           true, 4),
  ('Feste & Märkte',          'Stadtfeste, Volksfeste, Märkte und lokale Veranstaltungen',    true, 5);
