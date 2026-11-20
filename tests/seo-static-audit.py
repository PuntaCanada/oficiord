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
    verify('class="od-community-disclaimer"' in page, f"{lang}: no clear fictional demo disclaimer")
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
