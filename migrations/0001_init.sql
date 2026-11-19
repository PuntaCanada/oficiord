CREATE TABLE IF NOT EXISTS submissions (
 id TEXT PRIMARY KEY,
 kind TEXT NOT NULL CHECK(kind IN ('job','professional')),
 title TEXT NOT NULL,
 city TEXT NOT NULL,
 category TEXT NOT NULL,
 description TEXT NOT NULL,
 contact_email TEXT NOT NULL,
 status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','approved','rejected')),
 created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS submissions_public ON submissions(kind,status,created_at DESC);
CREATE TABLE IF NOT EXISTS rate_limits (
 key TEXT PRIMARY KEY,
 count INTEGER NOT NULL,
 expires_at INTEGER NOT NULL
);