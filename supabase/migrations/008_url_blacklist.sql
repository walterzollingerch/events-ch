-- URL-Blacklist: Ticket-Plattformen und Event-Aggregatoren ausschliessen
CREATE TABLE IF NOT EXISTS url_blacklist (
  id             BIGSERIAL PRIMARY KEY,
  domain         TEXT NOT NULL,
  reason         TEXT,
  blacklisted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by     TEXT NOT NULL DEFAULT 'admin',
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT url_blacklist_domain_unique UNIQUE (domain)
);

ALTER TABLE url_blacklist ENABLE ROW LEVEL SECURITY;

CREATE POLICY "authenticated users can manage url_blacklist"
  ON url_blacklist FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "service role can manage url_blacklist"
  ON url_blacklist FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Bekannte Schweizer/europäische Ticket-Plattformen als Startwerte
INSERT INTO url_blacklist (domain, reason, created_by) VALUES
  ('ticketcorner.ch',    'Ticket-Plattform',    'system'),
  ('starticket.ch',      'Ticket-Plattform',    'system'),
  ('ticketmaster.ch',    'Ticket-Plattform',    'system'),
  ('ticketmaster.com',   'Ticket-Plattform',    'system'),
  ('eventbrite.ch',      'Event-Aggregator',    'system'),
  ('eventbrite.com',     'Event-Aggregator',    'system'),
  ('reservix.de',        'Ticket-Plattform',    'system'),
  ('eventim.de',         'Ticket-Plattform',    'system'),
  ('eventim.ch',         'Ticket-Plattform',    'system'),
  ('ticketino.com',      'Ticket-Plattform',    'system'),
  ('petzi.ch',           'Ticket-Plattform',    'system'),
  ('ticketpark.ch',      'Ticket-Plattform',    'system'),
  ('seetickets.com',     'Ticket-Plattform',    'system'),
  ('kulturticket.ch',    'Ticket-Plattform',    'system'),
  ('festivalticker.de',  'Event-Aggregator',    'system'),
  ('oeticket.com',       'Ticket-Plattform',    'system')
ON CONFLICT (domain) DO NOTHING;

-- RPC: Domain zur Blacklist hinzufügen (für n8n-Auto-Erkennung)
CREATE OR REPLACE FUNCTION add_domain_to_blacklist(
  p_domain     TEXT,
  p_reason     TEXT DEFAULT NULL,
  p_created_by TEXT DEFAULT 'n8n-auto'
) RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO url_blacklist (domain, reason, created_by)
  VALUES (lower(trim(p_domain)), p_reason, p_created_by)
  ON CONFLICT (domain) DO NOTHING;
END;
$$;

GRANT EXECUTE ON FUNCTION add_domain_to_blacklist TO authenticated, anon, service_role;
