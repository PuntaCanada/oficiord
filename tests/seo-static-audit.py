#!/usr/bin/env python3
"""Offline checks for indexable OficioRD pilot pages. No personal data or external API."""
from pathlib import Path
from html.parser import HTMLParser
import json
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
BASE = "https://oficiord.pages.dev"
LANGUAGES = {"es": "/", "en": "/en/", "de": "/de/", "fr": "/fr/", "ht": "/ht/"}
ALL = {lang: BASE + path for lang, path in LANGUAGES.items()}
XHTML = "{http://www.w3.org/1999/xhtml}"
SITE = "{http://www.sitemaps.org/schemas/sitemap/0.9}"

class Head(HTMLParser):
    def __init__(self):
        super().__init__()
        self.attrs = []
        self.lang = None
        self.jsonld = []
        self.script = False
    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if tag == "html": self.lang = a.get("lang")
        if tag in ("link", "meta"): self.attrs.append((tag, a))
        if tag == "script" and a.get("type") == "application/ld+json": self.script = True
    def handle_data(self, data):
        if self.script: self.jsonld.append(data)
    def handle_endtag(self, tag):
        if tag == "script": self.script = False
    def select(self, tag, key, value):
        return [a for t, a in self.attrs if t == tag and a.get(key) == value]

errors = []
def verify(ok, message):
    if not ok: errors.append(message)

robots = (ROOT / "robots.txt").read_text(encoding="utf-8")
verify("User-agent: *" in robots, "robots.txt missing universal crawler group")
verify("Allow: /" in robots, "robots.txt missing public allow")
verify("Disallow: /api/" in robots and "Disallow: /admin/" in robots,
       "robots.txt must block API and admin paths")
verify(f"Sitemap: {BASE}/sitemap.xml" in robots, "robots.txt sitemap URL mismatch")
verify("Disallow: /\n" not in robots, "robots.txt blocks all pages")
headers = (ROOT / "_headers").read_text(encoding="utf-8")
for path in ["/admin/*", "/account/*", "/demo/*", "/demo"]:
    marker = path + "\n"
    idx = headers.find(marker)
    verify(idx >= 0 and "X-Robots-Tag: noindex" in headers[idx:headers.find("\n\n", idx) if "\n\n" in headers[idx:] else None], f"No-index policy missing for {path}")
for path in ["demo/index.html", "account/index.html"]:
    page = (ROOT / path).read_text(encoding="utf-8")
    verify('name="robots" content="noindex' in page, f"{path}: noindex meta missing")

tree = ET.parse(ROOT / "sitemap.xml")
sitemap = {}
for entry in tree.getroot().findall(f"{SITE}url"):
    url = entry.findtext(f"{SITE}loc")
    verify(url not in sitemap, f"Duplicate sitemap URL {url}")
    sitemap[url] = {x.get("hreflang"): x.get("href") for x in entry.findall(f"{XHTML}link")}
verify(set(sitemap) == set(ALL.values()), "Sitemap must contain exactly five public homepages")
expected = {**ALL, "x-default": BASE + "/"}
for lang, path in LANGUAGES.items():
    html = ROOT / path.lstrip("/") / "index.html" if path != "/" else ROOT / "index.html"
    verify(html.exists(), f"{lang}: missing homepage")
    if not html.exists(): continue
    page = html.read_text(encoding="utf-8")
    verify(page.count('class="od-community-intro"') == 1, f"{lang}: missing community project introduction")
    verify('class="od-community-disclaimer"' in page, f"{lang}: no honest launch status disclaimer")
    verify('class="od-public-start"' in page, f"{lang}: public launch section missing")
    legal_path = "/legal/" if lang == "es" else f"/legal/{lang}/"
    verify(f'href="{legal_path}"' in page, f"{lang}: legal/readiness draft not linked from homepage")
    legal_file = ROOT / legal_path.strip("/") / "index.html"
    verify(legal_file.exists(), f"{lang}: legal preparation page missing")
    if legal_file.exists():
        legal_text = legal_file.read_text(encoding="utf-8")
        verify(f'<html lang="{lang}">' in legal_text, f"{lang}: legal page not translated")
        verify('name="robots" content="noindex,follow"' in legal_text, f"{lang}: incomplete legal draft must not be indexed")
        for section_id in ["operator", "contact", "privacy", "terms", "moderation"]:
            verify(f'id="{section_id}"' in legal_text, f"{lang}: legal section {section_id} missing")
        verify("oficiord@outlook.com" in legal_text and "soporte.oficiord@outlook.com" in legal_text, f"{lang}: existing contact addresses absent")
        for obsolete in ["No person has yet been appointed to actually operate it in the Dominican Republic", "operación en República Dominicana aún no", "La personne réellement chargée de son exploitation en République dominicaine", "Wer den Betrieb in der Dominikanischen Republik tatsächlich verantwortet"]:
            verify(obsolete not in legal_text, f"{lang}: obsolete operator plan in notice")
        pending = {"es":"Identificación del operador pendiente", "en":"Operator information to follow", "de":"Betreiberangaben werden nachgereicht", "fr":"Informations sur l'exploitant à venir", "ht":"Enfòmasyon sou responsab la ap vini pita"}
        verify(pending[lang] in legal_text, f"{lang}: pending operator notice absent")
        verify("Marc Rosemann" not in legal_text and "Marc Rosemann" not in page, f"{lang}: name unexpectedly public")
        verify("noindex,follow" in legal_text, f"{lang}: unfinished information must stay out of search results")
        verify("noindex,follow" in legal_text, f"{lang}: unfinished legal details should stay noindex")

        verify("MARKETPLACE_LAUNCH_APPROVED=true" not in legal_text, f"{lang}: draft claims premature launch")

    verify('id="listing-kind"' in page and 'value="professional"' in page, f"{lang}: professional discovery selector missing")
    verify('src="/assets/oficiord-contact.js"' in page, f"{lang}: moderated contact UI script missing")
    verify("kind:el('listing-kind').value" in page, f"{lang}: listing kind not passed to public read API")
    verify('window.oficioContact.attach' in page, f"{lang}: approved listings cannot receive safe contact requests")
    verify('class="od-safety"' in page and 'id="seguridad"' in page, f"{lang}: safety section missing")
    verify('class="od-safety-contact"' in page, f"{lang}: reporting contact status absent")
    verify('href="mailto:oficiord@outlook.com?' in page, f"{lang}: verified OficioRD contact alias not linked")
    verify('href="mailto:soporte.oficiord@outlook.com?' in page, f"{lang}: dedicated support and privacy contact not linked")
    contact = page.split('<p class="od-safety-contact">', 1)[-1].split('</p>', 1)[0]
    verify(contact.count('mailto:soporte.oficiord@outlook.com?') == 1, f"{lang}: support contact must appear once")
    verify(contact.count('mailto:oficiord@outlook.com?') == 1, f"{lang}: general contact must appear once")
    verify('marc.rosemann@email.de' not in contact, f"{lang}: personal email leaked in public contact")
    verify('marc.rosemann@email.de' not in page, f"{lang}: personal email must not be published")
    verify('class="od-safety-law"' in page, f"{lang}: platform responsibilities absent")
    verify('class="od-safety-footer" href="#seguridad"' in page, f"{lang}: safety footer link missing")
    verify(page.count('<li>') >= 4, f"{lang}: safety checklist incomplete")
    verify('href="#trabajos"' in page and 'href="#categorias"' in page, f"{lang}: genuine listing navigation missing")
    verify('<section class="od-journey"' not in page and '<section class="od-find"' not in page, f"{lang}: fictional demo still promoted on public homepage")
    verify('class="navlink" href="/demo/' not in page and 'class="navlink" href="/account/' not in page, f"{lang}: demo/account promoted in main navigation")
    verify("el('form').hidden=!(enabled&&sitekey)" in page, f"{lang}: private form not gated behind readiness")
    verify('id="od-community-heading"' in page, f"{lang}: announcement missing accessible heading")
    verify('href="/assets/oficiord-home-journey.css"' in page, f"{lang}: shared announcement stylesheet missing")

    parsed = Head()
    parsed.feed(page)
    verify(parsed.lang == lang, f"{lang}: html lang mismatch")
    canonicals = parsed.select("link", "rel", "canonical")
    verify(len(canonicals) == 1 and canonicals[0].get("href") == ALL[lang], f"{lang}: canonical mismatch")
    alternates = {a.get("hreflang"): a.get("href") for a in parsed.select("link", "rel", "alternate")}
    verify(alternates == expected, f"{lang}: incomplete hreflang reciprocity")
    verify(sitemap.get(ALL[lang]) == expected, f"{lang}: sitemap hreflang mismatch")
    descriptions = parsed.select("meta", "name", "description")
    verify(len(descriptions) == 1 and len(descriptions[0].get("content", "")) > 45, f"{lang}: missing description")
    for key in ["og:type", "og:title", "og:description", "og:url", "og:image"]:
        metas = parsed.select("meta", "property", key)
        verify(len(metas) == 1 and bool(metas[0].get("content")), f"{lang}: missing {key}")
        if key == "og:url" and metas: verify(metas[0]["content"] == ALL[lang], f"{lang}: social URL mismatch")
    robots_meta = parsed.select("meta", "name", "robots")
    verify(len(robots_meta) == 1 and "index,follow" in robots_meta[0].get("content", ""), f"{lang}: indexing meta missing")
    verify(len(parsed.jsonld) == 1, f"{lang}: expected one WebSite JSON-LD")
    for blob in parsed.jsonld:
        try:
            obj = json.loads(blob)
            verify(obj.get("@type") == "WebSite" and obj.get("url") == BASE + "/", f"{lang}: bad structured data")
        except json.JSONDecodeError:
            errors.append(f"{lang}: invalid JSON-LD")
if errors:
    print("FAIL: OficioRD static SEO audit")
    for e in errors: print(" - " + e)
    raise SystemExit(1)
print("PASS: five canonical and multilingual pages, sitemap, robots, noindex safeguards, OpenGraph and JSON-LD")
