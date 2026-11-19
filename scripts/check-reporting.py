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
             "functions/api/config.js","functions/api/submissions.js"]:
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

for path in ["index.html","admin/index.html"]:
    parser=Scripts()
    parser.feed((ROOT/path).read_text(encoding="utf-8"))
    assert parser.scripts, f"No JS script in {path}"
    with tempfile.NamedTemporaryFile(mode="w",suffix=".js",encoding="utf-8") as temp:
        temp.write("\n".join(parser.scripts));temp.flush()
        subprocess.run(["node","--check",temp.name],check=True)
print("PASS: HTML inline JavaScript syntax")
