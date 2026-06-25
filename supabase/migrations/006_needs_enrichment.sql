-- needs_enrichment: Flag ob ein Event noch mit Website-Daten angereichert werden muss
-- Neue Events bekommen DEFAULT TRUE, nach Anreicherung wird es auf FALSE gesetzt
ALTER TABLE events ADD COLUMN IF NOT EXISTS needs_enrichment BOOLEAN NOT NULL DEFAULT TRUE;

-- Partial index: nur Events die noch angereichert werden müssen
CREATE INDEX IF NOT EXISTS events_needs_enrichment_idx ON events(created_at) WHERE needs_enrichment = TRUE;
