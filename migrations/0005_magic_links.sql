-- Future passwordless authentication schema. DO NOT apply in production yet.
-- Never store raw link tokens, login secrets or email contents in D1.
CREATE TABLE IF NOT EXISTS account_login_tokens (
 token_hash TEXT PRIMARY KEY CHECK(length(token_hash)=64),
 account_id TEXT NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
 expires_at INTEGER NOT NULL,
 used_at INTEGER,
 created_at INTEGER NOT NULL,
 CHECK(expires_at > created_at)
);
CREATE INDEX IF NOT EXISTS account_login_tokens_owner ON account_login_tokens(account_id,expires_at);
CREATE INDEX IF NOT EXISTS account_login_tokens_expiry ON account_login_tokens(expires_at);
-- Rate limits are keyed by an HMAC over normalized email/IP, not plaintext addresses.
CREATE TABLE IF NOT EXISTS account_login_limits (
 key_hash TEXT PRIMARY KEY CHECK(length(key_hash)=64),
 attempts INTEGER NOT NULL CHECK(attempts >= 0),
 expires_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS account_login_limits_expiry ON account_login_limits(expires_at);
