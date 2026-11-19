-- Preparation for privacy lifecycle. DO NOT run in production before review.
-- No automatic deletion or email sending. Requests require authenticated ownership and manual review.
CREATE TABLE IF NOT EXISTS account_privacy_requests (
 id TEXT PRIMARY KEY,
 account_id TEXT NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
 request_type TEXT NOT NULL CHECK(request_type IN ('export','delete','rectify')),
 status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','reviewing','completed','rejected')),
 created_at TEXT NOT NULL DEFAULT (datetime('now')),
 reviewed_at TEXT,
 resolution_note TEXT NOT NULL DEFAULT '' CHECK(length(resolution_note)<=1000)
);
CREATE INDEX IF NOT EXISTS privacy_requests_owner_status ON account_privacy_requests(account_id,status,created_at);
