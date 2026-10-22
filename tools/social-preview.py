"""Render the social card or check the crawler-visible production artifacts.

Checking uses only the Python standard library. Rendering optionally uses the
environment's existing Python Playwright and Chromium; it installs nothing.
"""

import argparse
from html.parser import HTMLParser
from pathlib import Path
import shutil
import struct
from urllib.parse import urlsplit


ROOT = Path(__file__).resolve().parents[1]
CARD_NAME = "social-preview-v1.png"


class Head(HTMLParser):
    def __init__(self):
        super().__init__()
        self.in_head = False
        self.meta = {}
        self.canonical = []

    def handle_starttag(self, tag, attrs):
        if tag == "head":
            self.in_head = True
        if not self.in_head:
            return
        attrs = dict(attrs)
        if tag == "meta":
            key = attrs.get("property", attrs.get("name"))
            if key:
                assert key not in self.meta, f"Duplicate metadata: {key}"
                self.meta[key] = attrs.get("content", "")
        if tag == "link" and attrs.get("rel") == "canonical":
            self.canonical.append(attrs.get("href", ""))

    def handle_endtag(self, tag):
        if tag == "head":
            self.in_head = False


def public_url(value):
    url = urlsplit(value)
    assert url.scheme == "https" and url.hostname, f"Expected absolute HTTPS URL: {value}"
    assert not url.username and not url.password, "Public URLs must not contain credentials"
    assert not url.query and not url.fragment, "Canonical/image URLs must omit queries and fragments"
    assert url.hostname not in ("localhost", "127.0.0.1", "::1"), "Expected public host"
    return url


def check():
    dist = ROOT / "apps/web/dist"
    head = Head()
    head.feed((dist / "index.html").read_text())
    meta = head.meta
    required = (
        "description", "og:type", "og:site_name", "og:title", "og:description",
        "og:url", "og:image", "og:image:secure_url", "og:image:type",
        "og:image:width", "og:image:height", "og:image:alt", "twitter:card",
        "twitter:title", "twitter:description", "twitter:image", "twitter:image:alt",
    )
    for key in required:
        assert meta.get(key, "").strip(), f"Missing crawler-visible metadata: {key}"
    assert len(head.canonical) == 1, "Expected exactly one canonical link"
    assert head.canonical[0] == meta["og:url"], "Canonical and Open Graph page URLs differ"
    page = public_url(meta["og:url"])
    image = public_url(meta["og:image"])
    assert page.netloc == image.netloc, "Social card must use the public app's origin"
    assert meta["og:image"] == meta["twitter:image"] == meta["og:image:secure_url"]
    assert meta["og:type"] == "website" and meta["twitter:card"] == "summary_large_image"
    assert meta["description"] == meta["og:description"] == meta["twitter:description"]
    assert meta["og:title"] == meta["twitter:title"]
    assert meta["og:image:alt"] == meta["twitter:image:alt"]
    assert image.path == f"/{CARD_NAME}", "Metadata must point at the versioned public PNG"
    png = (dist / CARD_NAME).read_bytes()
    assert png[:8] == b"\x89PNG\r\n\x1a\n" and png[12:16] == b"IHDR", "Invalid PNG"
    width, height = struct.unpack(">II", png[16:24])
    assert (width, height) == (1200, 630), f"Unexpected social card dimensions: {width}×{height}"
    assert (str(width), str(height)) == (meta["og:image:width"], meta["og:image:height"])
    assert meta["og:image:type"] == "image/png"
    assert png == (ROOT / "apps/web/public" / CARD_NAME).read_bytes(), "Build shipped a different card"
    print(f"PASS: initial HTML has complete Open Graph/Twitter metadata for {page.netloc}.")
    print(f"PASS: linked public PNG ships in the build at {width}×{height} ({len(png):,} bytes).")


def render():
    from playwright.sync_api import sync_playwright

    chromium = shutil.which("chromium") or shutil.which("chromium-browser")
    assert chromium, "Rendering requires an existing system Chromium"
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(executable_path=chromium, args=["--no-sandbox"])
        page = browser.new_page(viewport={"width": 1200, "height": 630}, device_scale_factor=1)
        svg = (ROOT / "tools/social-preview.svg").read_text()
        page.set_content(f"<!doctype html><html><head><style>body {{ margin: 0; }}</style></head><body>{svg}</body></html>")
        page.screenshot(path=str(ROOT / "apps/web/public" / CARD_NAME))
        browser.close()
    print(f"Rendered apps/web/public/{CARD_NAME} from tools/social-preview.svg.")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("action", choices=("check", "render"))
    args = parser.parse_args()
    render() if args.action == "render" else check()
