"""Safe, local static checks. Does not use Cloudflare credentials or user data."""
import pathlib
import sqlite3
import subprocess
import tempfile
from html.parser import HTMLParser

ROOT = pathlib.Path(__file__).resolve().parents[1]
db = sqlite3.connect(":memory:")
db.execute("PRAGMA foreign_keys=ON")
db.executescript((ROOT / "migrations/0001_init.sql").read_text(encoding="utf-8"))
db.executescript((ROOT / "migrations/0002_reports.sql").read_text(encoding="utf-8"))
db.executescript((ROOT / "migrations/0003_marketplace.sql").read_text(encoding="utf-8"))
db.executescript((ROOT / "migrations/0004_accounts.sql").read_text(encoding="utf-8"))
db.executescript((ROOT / "migrations/0005_magic_links.sql").read_text(encoding="utf-8"))
db.executescript((ROOT / "migrations/0006_privacy_requests.sql").read_text(encoding="utf-8"))
db.execute("INSERT INTO submissions(id,kind,title,city,category,description,contact_email) VALUES(?,?,?,?,?,?,?)",
  ("a"*36,"job","Prueba","Higüey","Otros","Descripción de prueba","fake@example.invalid"))
db.execute("INSERT INTO reports(id,submission_id,reason,details) VALUES(?,?,?,?)",
  ("b"*36,"a"*36,"spam","Prueba"))
assert db.execute("SELECT status FROM reports").fetchone()[0] == "pending"
db.execute("DELETE FROM submissions WHERE id=?", ("a"*36,))
assert db.execute("SELECT count(*) FROM reports").fetchone()[0] == 0, "Reports must be deleted with a listing"
print("PASS: D1 SQL migrations, foreign key cascade and report statuses")

for path in ["functions/api/reports.js","functions/api/admin/reports.js",
             "functions/api/config.js","functions/api/submissions.js","i18n.js",
             "functions/api/marketplace/profiles.js","functions/api/marketplace/jobs.js",
             "functions/api/marketplace/proposals.js",
             "functions/_lib/account-auth.js","functions/api/account/me.js",
             "functions/api/account/login.js","functions/api/account/registration.js",
             "functions/api/account/dashboard.js","functions/api/account/magic-link.js",
             "functions/api/account/verify.js","functions/_lib/magic-link.js",
             "functions/_lib/session-lifecycle.js","functions/api/account/logout.js",
             "functions/api/account/export.js","functions/api/account/sessions.js",
             "functions/api/account/privacy.js"]:
    subprocess.run(["node","--check",str(ROOT/path)],check=True)
print("PASS: API syntax")

class Scripts(HTMLParser):
    def __init__(self):
        super().__init__()
        self.inside = False
        self.scripts = []
    def handle_starttag(self, tag, attrs):
        if tag == "script" and not dict(attrs).get("src"):
            self.inside = True
            self.scripts.append("")
    def handle_endtag(self, tag):
        if tag == "script":
            self.inside = False
    def handle_data(self,data):
        if self.inside:
            self.scripts[-1] += data

for path in ["index.html","en/index.html","de/index.html","fr/index.html","ht/index.html","admin/index.html","demo/index.html","account/index.html","account/verify/index.html"]:
    parser=Scripts()
    parser.feed((ROOT/path).read_text(encoding="utf-8"))
    assert parser.scripts, f"No JS script in {path}"
    with tempfile.NamedTemporaryFile(mode="w",suffix=".js",encoding="utf-8") as temp:
        temp.write("\n".join(parser.scripts));temp.flush()
        subprocess.run(["node","--check",temp.name],check=True)
print("PASS: HTML inline JavaScript syntax")

# Keep all five supported public languages and the reporting gates intact.
i18n=(ROOT/"i18n.js").read_text(encoding="utf-8")
for marker in ['es:"🇩🇴 Español"','en:"🇺🇸 English"','de:"🇩🇪 Deutsch"','fr:"🇫🇷 Français"','ht:"🇭🇹 Kreyòl ayisyen"']:
    assert marker in i18n, f"Missing language: {marker}"
assert '<script src="/i18n.js" defer></script>' in (ROOT/"index.html").read_text(encoding="utf-8")
print("PASS: five-language selector loaded")

# Each language is an independent, indexable URL with consistent hreflang links.
from xml.etree import ElementTree as ET
pages={"es":"index.html","en":"en/index.html","de":"de/index.html","fr":"fr/index.html","ht":"ht/index.html"}
titles=set()
for lang,path in pages.items():
    html=(ROOT/path).read_text(encoding="utf-8")
    assert f'<html lang="{lang}">' in html, (lang,"lang attribute")
    assert f'rel="canonical" href="https://oficiord.pages.dev/{"" if lang=="es" else lang+"/"}"' in html
    for alternate in pages:
        assert f'hreflang="{alternate}"' in html
    assert '<script src="/i18n.js" defer></script>' in html
    import re
    title=re.search(r'<title>(.*?)</title>',html).group(1)
    assert title not in titles, f"Duplicate SEO title: {title}"
    titles.add(title)
ET.parse(ROOT/"sitemap.xml")
robots=(ROOT/"robots.txt").read_text(encoding="utf-8")
assert "Sitemap: https://oficiord.pages.dev/sitemap.xml" in robots
assert "Disallow: /admin/" in robots and "Disallow: /api/" in robots
print("PASS: five indexable pages, distinct titles, canonicals, hreflang, XML sitemap and robots")

# Future marketplace schema is valid, preserves privacy and supports a coherent offer relation.
db.execute("INSERT INTO provider_profiles(id,display_name,city,category,introduction,contact_email) VALUES(?,?,?,?,?,?)",
  ("provider-1","Demo Proveedor","Higüey","Plomería","Perfil ficticio","test@example.invalid"))
db.execute("INSERT INTO submissions(id,kind,title,city,category,description,contact_email,status) VALUES(?,?,?,?,?,?,?,?)",
  ("job-demo-1","job","Trabajo de demostración","Higüey","Plomería","Descripción inventada","test@example.invalid","approved"))
db.execute("INSERT INTO job_details(submission_id,estimated_budget_dop) VALUES(?,?)",("job-demo-1",3500))
db.execute("INSERT INTO proposals(id,submission_id,provider_id,price_dop,description) VALUES(?,?,?,?,?)",
  ("offer-1","job-demo-1","provider-1",3400,"Propuesta de prueba segura"))
assert db.execute("SELECT price_dop FROM proposals WHERE id='offer-1'").fetchone()[0]==3400
try:
    db.execute("INSERT INTO proposals(id,submission_id,provider_id,description) VALUES(?,?,?,?)",
      ("offer-2","job-demo-1","provider-1","No duplicadas"))
    raise AssertionError("Duplicate offer should be rejected")
except sqlite3.IntegrityError:
    pass
db.execute("DELETE FROM submissions WHERE id='job-demo-1'")
assert db.execute("SELECT count(*) FROM proposals").fetchone()[0]==0
print("PASS: future profiles, job details, offer uniqueness, cascade")
for path in ["functions/api/marketplace/profiles.js","functions/api/marketplace/jobs.js","functions/api/marketplace/proposals.js"]:
    source=(ROOT/path).read_text(encoding="utf-8")
    assert "onRequestPost" in source and ("NOT_ENABLED" in source or "WRITE_DISABLED" in source)
assert "fetch(" not in (ROOT/"demo/index.html").read_text(encoding="utf-8"), "Demo must not send requests"
print("PASS: all marketplace writes closed and demo makes no network requests")

# Account schema tests: role constraints, ownership and cascading session cleanup.
db.execute("INSERT INTO accounts(id,email,role,status,email_verified_at) VALUES(?,?,?,?,?)",
  ("customer-a","Customer@Example.invalid","customer","active","2026-01-01"))
db.execute("INSERT INTO accounts(id,email,role,status,email_verified_at) VALUES(?,?,?,?,?)",
  ("provider-a","provider@example.invalid","provider","active","2026-01-01"))
try:
    db.execute("INSERT INTO accounts(id,email,role) VALUES(?,?,?)",("other","customer@example.invalid","customer"))
    raise AssertionError("Emails must be unique case-insensitively")
except sqlite3.IntegrityError:
    pass
try:
    db.execute("INSERT INTO accounts(id,email,role) VALUES(?,?,?)",("other","bad@example.invalid","administrator"))
    raise AssertionError("Admin may not be created through customer schema")
except sqlite3.IntegrityError:
    pass
db.execute("INSERT INTO account_sessions(token_hash,account_id,expires_at) VALUES(?,?,?)",("a"*64,"customer-a",9999999999))
db.execute("INSERT INTO submissions(id,kind,title,city,category,description,contact_email,status) VALUES(?,?,?,?,?,?,?,?)",
  ("job-secure","job","Fictitious test job","Higüey","Plomería","Fake description","test@example.invalid","approved"))
db.execute("INSERT INTO account_jobs(submission_id,account_id) VALUES(?,?)",("job-secure","customer-a"))
db.execute("INSERT INTO account_provider_profiles(profile_id,account_id) VALUES(?,?)",("provider-1","provider-a"))
assert db.execute("SELECT account_id FROM account_jobs WHERE submission_id='job-secure'").fetchone()[0]=="customer-a"
try:
    db.execute("INSERT INTO account_provider_profiles(profile_id,account_id) VALUES(?,?)",("other-profile","provider-a"))
    raise AssertionError("Only one provider profile per account")
except sqlite3.IntegrityError:
    pass
db.execute("DELETE FROM accounts WHERE id='customer-a'")
assert db.execute("SELECT count(*) FROM account_sessions").fetchone()[0]==0
assert db.execute("SELECT count(*) FROM account_jobs").fetchone()[0]==0
subprocess.run(["node",str(ROOT/"scripts/check-accounts.mjs")],check=True)
print("PASS: account schema, email uniqueness, sessions, ownership and role tests")

# Future one-use magic-link table with no live emails or token issuance.
db.execute("INSERT INTO accounts(id,email,role) VALUES(?,?,?)",("magic-user","magic@example.invalid","customer"))
db.execute("INSERT INTO account_login_tokens(token_hash,account_id,expires_at,created_at) VALUES(?,?,?,?)",("b"*64,"magic-user",1700000600,1700000000))
assert db.execute("SELECT used_at FROM account_login_tokens").fetchone()[0] is None
db.execute("UPDATE account_login_tokens SET used_at=? WHERE token_hash=? AND used_at IS NULL AND expires_at>?",(1700000200,"b"*64,1700000200))
assert db.execute("SELECT used_at FROM account_login_tokens").fetchone()[0]==1700000200
db.execute("DELETE FROM accounts WHERE id='magic-user'")
assert db.execute("SELECT count(*) FROM account_login_tokens").fetchone()[0]==0
for path in ["functions/api/account/magic-link.js","functions/api/account/verify.js"]:
    source=(ROOT/path).read_text(encoding="utf-8")
    assert "MAGIC_LINK_NOT_ENABLED" in source
    assert "fetch(" not in source
assert "fetch(" not in (ROOT/"account/index.html").read_text(encoding="utf-8")
assert "disabled" in (ROOT/"account/index.html").read_text(encoding="utf-8")
for method in ["onRequestPost","onRequestPut","onRequestDelete"]:
    assert method in (ROOT/"functions/api/account/dashboard.js").read_text(encoding="utf-8")
subprocess.run(["node",str(ROOT/"scripts/check-magic-link.mjs")],check=True)
print("PASS: magic-link schema, disabled signup, demo isolation and cryptographic token properties")

# Verify actual SQLite conditional token consumption, replay protection and expiry
# without touching production D1.
db.execute("INSERT INTO accounts(id,email,role,status,email_verified_at) VALUES(?,?,?,?,?)",
  ("secure-customer","secure@example.invalid","customer","active","2026-01-01"))
db.execute("INSERT INTO accounts(id,email,role,status,email_verified_at) VALUES(?,?,?,?,?)",
  ("unverified-customer","unverified@example.invalid","customer","pending",None))
for suffix,owner in [("c","secure-customer"),("d","unverified-customer"),("e","secure-customer")]:
    db.execute("INSERT INTO account_login_tokens(token_hash,account_id,expires_at,created_at) VALUES(?,?,?,?)",
      (suffix*64,owner,1700000600 if suffix!="e" else 1700000100,1700000000))
sql = """UPDATE account_login_tokens SET used_at=? WHERE token_hash=? AND used_at IS NULL AND expires_at>? AND EXISTS
 (SELECT 1 FROM accounts a WHERE a.id=account_login_tokens.account_id AND a.status='active'
 AND a.email_verified_at IS NOT NULL) RETURNING account_id"""
def consume(token_hash, timestamp=1700000200):
    return db.execute(sql,(timestamp,token_hash,timestamp)).fetchone()
assert consume("c"*64)==("secure-customer",)
assert consume("c"*64) is None, "Token replay must fail"
assert consume("d"*64) is None, "Unverified account token must fail"
assert consume("e"*64) is None, "Expired token must fail"
assert db.execute("SELECT used_at FROM account_login_tokens WHERE token_hash=?",("d"*64,)).fetchone()[0] is None
subprocess.run(["node",str(ROOT/"scripts/check-session-lifecycle.mjs")],check=True)
print("PASS: conditional atomic SQLite token consumption, expiry, revocation and JS session tests")

# Privacy requests are confined to an account and cascade when an account is removed.
db.execute("INSERT INTO accounts(id,email,role) VALUES(?,?,?)",
 ("privacy-demo","privacy@example.invalid","customer"))
db.execute("INSERT INTO account_privacy_requests(id,account_id,request_type) VALUES(?,?,?)",
 ("privacy-demo-request","privacy-demo","delete"))
assert db.execute("SELECT status FROM account_privacy_requests WHERE id='privacy-demo-request'").fetchone()[0]=="pending"
try:
 db.execute("INSERT INTO account_privacy_requests(id,account_id,request_type) VALUES(?,?,?)",
 ("invalid-type","privacy-demo","admin"))
 raise AssertionError("Invalid privacy request type")
except sqlite3.IntegrityError:
 pass
db.execute("DELETE FROM accounts WHERE id='privacy-demo'")
assert db.execute("SELECT count(*) FROM account_privacy_requests WHERE account_id='privacy-demo'").fetchone()[0]==0
assert "ACCOUNTS_ENABLED" in (ROOT/"functions/api/account/export.js").read_text(encoding="utf-8")
assert "ACCOUNTS_ENABLED" in (ROOT/"functions/api/account/sessions.js").read_text(encoding="utf-8")
assert "PRIVACY_REQUESTS_NOT_ENABLED" in (ROOT/"functions/api/account/privacy.js").read_text(encoding="utf-8")
subprocess.run(["node",str(ROOT/"scripts/check-account-privacy.mjs")],check=True)
print("PASS: privacy schema, owner scoping, session redaction and closed intake")
