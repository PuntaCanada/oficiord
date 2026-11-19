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
db.execute("INSERT INTO submissions(id,kind,title,city,category,description,contact_email) VALUES(?,?,?,?,?,?,?)",
  ("a"*36,"job","Prueba","Higüey","Otros","Descripción de prueba","fake@example.invalid"))
db.execute("INSERT INTO reports(id,submission_id,reason,details) VALUES(?,?,?,?)",
  ("b"*36,"a"*36,"spam","Prueba"))
assert db.execute("SELECT status FROM reports").fetchone()[0] == "pending"
db.execute("DELETE FROM submissions WHERE id=?", ("a"*36,))
assert db.execute("SELECT count(*) FROM reports").fetchone()[0] == 0, "Reports must be deleted with a listing"
print("PASS: D1 SQL migrations, foreign key cascade and report statuses")

for path in ["functions/api/reports.js","functions/api/admin/reports.js",
             "functions/api/config.js","functions/api/submissions.js","i18n.js"]:
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

for path in ["index.html","en/index.html","de/index.html","fr/index.html","ht/index.html","admin/index.html"]:
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
