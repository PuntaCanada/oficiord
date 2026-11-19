-- Account schema preparation ONLY. Does not activate registration/login.
-- Apply after 0001/0002/0003 and a reviewed authentication launch plan.
CREATE TABLE IF NOT EXISTS accounts (
 id TEXT PRIMARY KEY,
 email TEXT NOT NULL COLLATE NOCASE UNIQUE,
 role TEXT NOT NULL CHECK(role IN ('customer','provider')),
 status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','active','suspended','deleted')),
 email_verified_at TEXT,
 created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS account_sessions (
 token_hash TEXT PRIMARY KEY CHECK(length(token_hash)=64),
 account_id TEXT NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
 expires_at INTEGER NOT NULL,
 revoked_at INTEGER,
 created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS account_sessions_owner ON account_sessions(account_id,expires_at);
CREATE TABLE IF NOT EXISTS account_jobs (
 submission_id TEXT PRIMARY KEY REFERENCES submissions(id) ON DELETE CASCADE,
 account_id TEXT NOT NULL REFERENCES accounts(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS account_jobs_owner ON account_jobs(account_id);
CREATE TABLE IF NOT EXISTS account_provider_profiles (
 profile_id TEXT PRIMARY KEY REFERENCES provider_profiles(id) ON DELETE CASCADE,
 account_id TEXT NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
 UNIQUE(account_id)
);
-- Avoid having the same account represented by many provider profiles.
CREATE INDEX IF NOT EXISTS account_profiles_owner ON account_provider_profiles(account_id);
