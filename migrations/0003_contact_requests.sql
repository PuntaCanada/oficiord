-- Apply after 0001_init.sql; no production migration is run automatically.
-- Contact messages are visible only to the authenticated moderator, never public.
CREATE TABLE IF NOT EXISTS contact_requests (
 id TEXT PRIMARY KEY,
 submission_id TEXT NOT NULL REFERENCES submissions(id) ON DELETE CASCADE,
 sender_email TEXT NOT NULL,
 message TEXT NOT NULL,
 consent_at TEXT NOT NULL DEFAULT (datetime('now')),
 status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','handled','rejected')),
 created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS contact_requests_moderation ON contact_requests(status,created_at DESC);
CREATE INDEX IF NOT EXISTS contact_requests_listing ON contact_requests(submission_id);
CREATE TABLE IF NOT EXISTS contact_rate_limits (
 key TEXT PRIMARY KEY,
 count INTEGER NOT NULL,
 expires_at INTEGER NOT NULL
);
