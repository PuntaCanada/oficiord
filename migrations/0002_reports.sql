-- Run once in D1 Console before enabling reports API.
CREATE TABLE IF NOT EXISTS reports (
 id TEXT PRIMARY KEY,
 submission_id TEXT NOT NULL REFERENCES submissions(id) ON DELETE CASCADE,
 reason TEXT NOT NULL CHECK(reason IN ('spam','fraud','inappropriate','privacy','other')),
 details TEXT NOT NULL DEFAULT '',
 status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','reviewed','dismissed')),
 created_at TEXT NOT NULL DEFAULT (datetime('now')),
 reviewed_at TEXT
);
CREATE INDEX IF NOT EXISTS reports_moderation ON reports(status,created_at DESC);
CREATE INDEX IF NOT EXISTS reports_submission ON reports(submission_id);
CREATE TABLE IF NOT EXISTS report_rate_limits (
 key TEXT PRIMARY KEY,
 count INTEGER NOT NULL,
 expires_at INTEGER NOT NULL
);