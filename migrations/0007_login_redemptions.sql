-- FUTURE ONLY. Do not apply in production before the login rollout.
-- One redemption per magic-link hash, one session hash per redemption.
-- A unique constraint prevents simultaneous/replayed link use from producing two sessions.
CREATE TABLE IF NOT EXISTS account_login_redemptions (
 token_hash TEXT PRIMARY KEY REFERENCES account_login_tokens(token_hash) ON DELETE CASCADE,
 session_hash TEXT NOT NULL UNIQUE CHECK(length(session_hash)=64),
 created_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS login_redemptions_created ON account_login_redemptions(created_at);
