-- Future marketplace schema. Execute in D1 only after planned rollout review.
-- Never store passwords/tokens in this schema.
CREATE TABLE IF NOT EXISTS provider_profiles (
 id TEXT PRIMARY KEY,
 display_name TEXT NOT NULL CHECK(length(display_name) BETWEEN 2 AND 100),
 city TEXT NOT NULL,
 category TEXT NOT NULL,
 introduction TEXT NOT NULL DEFAULT '' CHECK(length(introduction)<=1000),
 verification_status TEXT NOT NULL DEFAULT 'unverified'
   CHECK(verification_status IN ('unverified','pending','verified','suspended')),
 publication_status TEXT NOT NULL DEFAULT 'draft'
   CHECK(publication_status IN ('draft','pending','approved','rejected')),
 contact_email TEXT NOT NULL,
 created_at TEXT NOT NULL DEFAULT(datetime('now'))
);
CREATE INDEX IF NOT EXISTS profiles_public ON provider_profiles(publication_status,city,category);
CREATE TABLE IF NOT EXISTS job_details (
 submission_id TEXT PRIMARY KEY REFERENCES submissions(id) ON DELETE CASCADE,
 preferred_date TEXT,
 estimated_budget_dop INTEGER CHECK(estimated_budget_dop IS NULL OR estimated_budget_dop BETWEEN 0 AND 100000000),
 status TEXT NOT NULL DEFAULT 'open' CHECK(status IN ('open','assigned','completed','cancelled')),
 created_at TEXT NOT NULL DEFAULT(datetime('now'))
);
CREATE TABLE IF NOT EXISTS proposals (
 id TEXT PRIMARY KEY,
 submission_id TEXT NOT NULL REFERENCES submissions(id) ON DELETE CASCADE,
 provider_id TEXT NOT NULL REFERENCES provider_profiles(id) ON DELETE CASCADE,
 price_dop INTEGER CHECK(price_dop IS NULL OR price_dop BETWEEN 0 AND 100000000),
 description TEXT NOT NULL CHECK(length(description) BETWEEN 10 AND 1200),
 status TEXT NOT NULL DEFAULT 'pending'
   CHECK(status IN ('pending','withdrawn','accepted','rejected')),
 created_at TEXT NOT NULL DEFAULT(datetime('now')),
 UNIQUE(submission_id,provider_id)
);
CREATE INDEX IF NOT EXISTS proposals_job_status ON proposals(submission_id,status);
CREATE INDEX IF NOT EXISTS proposals_provider_status ON proposals(provider_id,status);
