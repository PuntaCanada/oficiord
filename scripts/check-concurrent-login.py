"""Offline realistic SQLite concurrency test for OficioRD passwordless accounts.
Uses a temporary database with fabricated users, no D1 credentials, network, or real email.
"""
import concurrent.futures
import pathlib
import sqlite3
import tempfile
import threading
ROOT=pathlib.Path(__file__).resolve().parents[1]
MIGRATIONS=[f"migrations/{i:04d}_{name}.sql" for i,name in [
(1,"init"),(2,"reports"),(3,"marketplace"),(4,"accounts"),
(5,"magic_links"),(6,"privacy_requests"),(7,"login_redemptions")]]
NOW=1_700_000_200
def open_db(path):
    db=sqlite3.connect(path,timeout=5.0,isolation_level=None)
    db.execute("PRAGMA foreign_keys=ON")
    db.execute("PRAGMA busy_timeout=5000")
    return db

# Match the three statements from the deployed future D1 batch contract.
INSERT_REDEMPTION=(
 "INSERT INTO account_login_redemptions(token_hash,session_hash,created_at) "
 "SELECT t.token_hash,?,? FROM account_login_tokens t JOIN accounts a ON a.id=t.account_id "
 "WHERE t.token_hash=? AND t.used_at IS NULL AND t.expires_at>? "
 "AND a.status='active' AND a.email_verified_at IS NOT NULL"
)
INSERT_SESSION=(
 "INSERT INTO account_sessions(token_hash,account_id,expires_at) "
 "SELECT ?,t.account_id,? FROM account_login_redemptions r "
 "JOIN account_login_tokens t ON t.token_hash=r.token_hash "
 "JOIN accounts a ON a.id=t.account_id "
 "WHERE r.token_hash=? AND r.session_hash=? AND t.used_at IS NULL AND t.expires_at>? "
 "AND a.status='active' AND a.email_verified_at IS NOT NULL"
)
CONSUME_TOKEN=(
 "UPDATE account_login_tokens SET used_at=? WHERE token_hash=? AND used_at IS NULL "
 "AND EXISTS(SELECT 1 FROM account_login_redemptions r "
 "JOIN account_sessions s ON s.token_hash=r.session_hash "
 "WHERE r.token_hash=? AND r.session_hash=? AND s.expires_at>?)"
)
with tempfile.TemporaryDirectory(prefix="oficiord-auth-test-") as folder:
    path=str(pathlib.Path(folder)/"accounts.sqlite3")
    conn=open_db(path)
    for migration in MIGRATIONS:
        conn.executescript((ROOT/migration).read_text(encoding="utf-8"))
    conn.execute("INSERT INTO accounts(id,email,role,status,email_verified_at) VALUES(?,?,?,?,?)",
                 ("customer-a","customer@example.invalid","customer","active","2026-01-01"))
    conn.execute("INSERT INTO accounts(id,email,role,status,email_verified_at) VALUES(?,?,?,?,?)",
                 ("provider-b","provider@example.invalid","provider","active","2026-01-01"))
    conn.execute("INSERT INTO accounts(id,email,role,status) VALUES(?,?,?,?)",
                 ("blocked-c","blocked@example.invalid","customer","suspended"))
    for key,owner,expiry in [("a"*64,"customer-a",NOW+300),
                             ("b"*64,"provider-b",NOW+300),
                             ("c"*64,"blocked-c",NOW+300),
                             ("d"*64,"customer-a",NOW-1)]:
        conn.execute("INSERT INTO account_login_tokens(token_hash,account_id,expires_at,created_at) VALUES(?,?,?,?)",
                     (key,owner,expiry,NOW-100))
    conn.close()
    barrier=threading.Barrier(12)
    def claim(i):
        db=open_db(path)
        try:
            barrier.wait(timeout=10)
            db.execute("BEGIN IMMEDIATE")
            try:
                session_hash=f"{i+1:064x}"
                stmts=[
                    (INSERT_REDEMPTION,(session_hash,NOW,"a"*64,NOW)),
                    (INSERT_SESSION,(session_hash,NOW+86400,"a"*64,session_hash,NOW)),
                    (CONSUME_TOKEN,(NOW,"a"*64,"a"*64,session_hash,NOW)),
                ]
                counts=[]
                for sql,params in stmts:
                    cur=db.execute(sql,params)
                    counts.append(cur.rowcount)
                if counts==[1,1,1]:
                    db.execute("COMMIT")
                    return "won"
                db.execute("ROLLBACK")
                return "denied"
            except sqlite3.IntegrityError:
                db.execute("ROLLBACK")
                return "denied"
        finally:
            db.close()
    with concurrent.futures.ThreadPoolExecutor(max_workers=12) as pool:
        results=list(pool.map(claim,range(12)))
    assert results.count("won")==1,results
    assert results.count("denied")==11,results
    db=open_db(path)
    assert db.execute("SELECT count(*) FROM account_sessions").fetchone()[0]==1
    assert db.execute("SELECT count(*) FROM account_login_redemptions").fetchone()[0]==1
    assert db.execute("SELECT used_at FROM account_login_tokens WHERE token_hash=?",("a"*64,)).fetchone()[0]==NOW
    # A provider is allowed to sign in, but has a distinct role.
    account=db.execute("SELECT role FROM accounts WHERE id='provider-b'").fetchone()[0]
    assert account=="provider"
    # Suspended and expired tokens never acquire a redemption.
    for link in ["c"*64,"d"*64]:
        db.execute("BEGIN IMMEDIATE")
        cursor=db.execute(INSERT_REDEMPTION,("e"*64,NOW,link,NOW))
        assert cursor.rowcount==0
        db.execute("ROLLBACK")
    db.close()
print("PASS: 12 concurrent login attempts yield one session, one redemption, no replay or blocked users")
