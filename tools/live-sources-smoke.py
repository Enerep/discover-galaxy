"""Deterministic browser QA for explicit live-source lookup.

All provider responses here are authored synthetic fixtures intercepted in the
test browser. These checks do not establish live provider availability and never
add fixtures to the curated dataset. Use the existing Playwright/system Chromium
environment against an already-running production preview; installs nothing.
"""

import argparse
from collections import Counter
import hashlib
import json
from pathlib import Path
import re
from urllib.parse import parse_qs, unquote, urlsplit

from playwright.sync_api import Error, expect, sync_playwright


ROOT = Path(__file__).resolve().parents[1]
PROVIDERS = {
    "rest.uniprot.org": "UniProt", "reactome.org": "Reactome",
    "api.platform.opentargets.org": "Open Targets", "api.openalex.org": "OpenAlex",
}
IDENTITIES = {
    "APOE": {"uniprot": "P02649", "ensembl": "ENSG00000130203"},
    "ABCA1": {"uniprot": "O95477", "ensembl": "ENSG00000165029"},
}
PRIVATE = ["QA_PRIVATE_COMPARISON_89432", "QA_PRIVATE_MODEL_85431",
           "QA_PRIVATE_CONDITION_63825", "private-qa-input.csv", "2.375", "0.0137"]
FALLBACK = """const original = HTMLCanvasElement.prototype.getContext;
HTMLCanvasElement.prototype.getContext = function(kind, ...args) {
  return kind.startsWith('webgl') ? null : original.call(this, kind, ...args);
};"""
FETCH_SPY = """window.__liveFetchQA = [];
const originalFetch = window.fetch;
window.fetch = function(input, init = {}) {
  const url = typeof input === 'string' ? input : input.url ?? String(input);
  if (['rest.uniprot.org','reactome.org','api.platform.opentargets.org','api.openalex.org'].includes(new URL(url, location.href).hostname)) {
    const record = {url, credentials:init.credentials, referrerPolicy:init.referrerPolicy,
      mode:init.mode, cache:init.cache, redirect:init.redirect, aborted:false};
    window.__liveFetchQA.push(record);
    init.signal?.addEventListener('abort', () => { record.aborted = true; }, {once:true});
  }
  return originalFetch.call(this, input, init);
};"""


def json_bytes(value):
    return (json.dumps(value, ensure_ascii=False, separators=(",", ":")) + "\n").encode()


def payloads(symbol):
    identity = IDENTITIES[symbol]
    first = {
        "id": "https://openalex.org/W990000001", "ids": {"openalex": "https://openalex.org/W990000001", "doi": "https://doi.org/10.9999/synthetic-one"},
        "doi": "https://doi.org/10.9999/synthetic-one", "title": "SYNTHETIC literature metadata one",
        "publication_year": 2026, "publication_date": "2026-01-01", "type": "article",
        "is_retracted": False, "updated_date": "2026-11-01T00:00:00Z", "abstract_inverted_index": {"DO_NOT_RETAIN": [0]},
    }
    duplicate = {**first, "id": "https://openalex.org/W990000002", "ids": {"openalex": "https://openalex.org/W990000002", "doi": first["doi"]}, "is_retracted": True}
    second = {**first, "id": "https://openalex.org/W990000003", "ids": {"openalex": "https://openalex.org/W990000003"}, "doi": None, "title": "SYNTHETIC literature metadata two", "is_retracted": None}
    return {
        "UniProt": {
            "primaryAccession": identity["uniprot"], "organism": {"taxonId": 9606},
            "genes": [{"geneName": {"value": symbol}}], "entryType": "UniProtKB reviewed (Swiss-Prot)",
            "proteinDescription": {"recommendedName": {"fullName": {"value": f"SYNTHETIC {symbol} identity metadata"}}},
            "entryAudit": {"entryVersion": 123, "lastAnnotationUpdateDate": "2026-01-01"},
            "uniProtKBCrossReferences": [{"database": "Ensembl", "properties": [{"key": "GeneId", "value": identity["ensembl"] + ".9"}]}],
            "sequence": {"value": "DO_NOT_RETAIN"},
        },
        "Reactome": [{"stId": f"R-HSA-99000000{i}", "stIdVersion": f"R-HSA-99000000{i}.2", "speciesName": "Homo sapiens", "schemaClass": "Pathway", "displayName": f"SYNTHETIC mapped pathway {i}"} for i in range(1, 7)],
        "Open Targets": {"data": {"meta": {"dataVersion": {"year": "26", "month": "09", "iteration": None}}, "target": {"id": identity["ensembl"], "approvedSymbol": symbol, "associatedDiseases": {"count": 25, "rows": [{"disease": {"id": "EFO_99000001", "name": "SYNTHETIC condition alpha"}, "score": .6789, "datasourceScores": [{"id": "synthetic-source", "score": .4567}]}]}}}},
        "OpenAlex": {"meta": {"count": 12, "page": 1}, "results": [first, duplicate, second]},
    }


class MockSources:
    def __init__(self, page):
        self.page = page
        self.calls = []
        self.phase = "success"
        self.held = []
        self.last_digest = {}
        self.last_raw = {}
        page.route(re.compile(r"^https://(?:rest\.uniprot\.org|reactome\.org|api\.platform\.opentargets\.org|api\.openalex\.org)/"), self.route)

    def route(self, route):
        request = route.request
        parsed = urlsplit(request.url)
        provider = PROVIDERS[parsed.hostname]
        headers = {"Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "GET, POST, OPTIONS", "Access-Control-Allow-Headers": "content-type", "Access-Control-Expose-Headers": "X-UniProt-Release", "Content-Type": "application/json", "X-UniProt-Release": "2026_04"}
        if request.method == "OPTIONS":
            route.fulfill(status=204, headers=headers)
            return
        assert not any(value in unquote(request.url) or value in (request.post_data or "") for value in PRIVATE), "Uploaded input reached a provider request."
        assert "cookie" not in request.headers and "authorization" not in request.headers and "referer" not in request.headers
        symbol = self.check_request(provider, request)
        self.calls.append((provider, symbol, request.method, request.url, request.post_data))
        if self.phase == "held":
            self.held.append((route, headers, json_bytes(payloads(symbol)[provider])))
            return
        status = 403 if self.phase == "partial" and provider == "Reactome" else 429 if self.phase == "partial" and provider == "OpenAlex" else 200
        value = payloads(symbol)[provider]
        if self.phase == "mismatch" and provider == "UniProt":
            value["genes"] = [{"geneName": {"value": "SYNTHETIC_MISMATCH_MUST_NOT_DISPLAY"}}]
        raw = json_bytes(value if status == 200 else {"error": "DO_NOT_RETAIN_PROVIDER_ERROR"})
        if status == 200 and not (self.phase == "mismatch" and provider == "UniProt"):
            self.last_digest[provider] = hashlib.sha256(raw).hexdigest()
            self.last_raw[provider] = raw
        route.fulfill(status=status, headers=headers, body=raw)

    @staticmethod
    def check_request(provider, request):
        parsed = urlsplit(request.url)
        params = parse_qs(parsed.query)
        if provider in ("UniProt", "Reactome"):
            symbol = next(symbol for symbol, identity in IDENTITIES.items() if identity["uniprot"] in parsed.path)
            accession = IDENTITIES[symbol]["uniprot"]
            assert request.method == "GET" and request.post_data is None
            assert parsed.path == (f"/uniprotkb/{accession}.json" if provider == "UniProt" else f"/ContentService/data/mapping/UniProt/{accession}/pathways")
            assert params == ({} if provider == "UniProt" else {"species": ["9606"]})
        elif provider == "Open Targets":
            assert request.method == "POST" and parsed.path == "/api/v4/graphql" and not params
            body = json.loads(request.post_data)
            symbol = next(symbol for symbol, identity in IDENTITIES.items() if identity["ensembl"] == body["variables"]["id"])
            assert body["variables"] == {"id": IDENTITIES[symbol]["ensembl"]}
            assert body["query"].startswith("query GeneAnnotations") and "mutation" not in body["query"].lower()
            assert "enableIndirect: false" in body["query"] and "index: 0, size: 20" in body["query"]
        else:
            assert request.method == "GET" and parsed.path == "/works" and request.post_data is None
            symbol = next(symbol for symbol in IDENTITIES if params["search.title_and_abstract"] == [f"Alzheimer AND {symbol}"])
            assert params["per_page"] == ["5"] and params["page"] == ["1"]
            assert set(params) == {"search.title_and_abstract", "per_page", "page", "select"}
            assert "abstract" not in params["select"][0]
        return symbol

    def counts(self):
        return Counter(row[0] for row in self.calls)

    def release(self):
        for route, headers, raw in self.held:
            try:
                route.fulfill(status=200, headers=headers, body=raw)
            except Error:
                pass  # Aborted on purpose by keyed entity navigation.
        self.held.clear()


def provider(panel, name):
    return panel.locator(".live-source-provider").filter(has=panel.page.get_by_role("heading", name=name, exact=True))


def wait_done(panel):
    expect(panel.locator(".live-source-provider")).to_have_count(4)
    expect(panel.locator(".live-source-provider[aria-busy=true]")).to_have_count(0, timeout=15000)
    expect(panel.get_by_role("button", name="Refresh live sources", exact=True)).to_have_attribute("aria-disabled", "false")


def select_entity(page, label):
    page.get_by_role("combobox", name="Filter by entity type", exact=True).select_option("all")
    page.get_by_role("combobox", name="Search entities", exact=True).fill(label)
    page.get_by_role("option").filter(has=page.get_by_text(label, exact=True)).click()
    expect(page.locator(".selected-title")).to_have_text(label)


def open_panel(page):
    panel = page.locator(".live-sources")
    expect(panel).to_have_count(1)
    expect(panel).not_to_have_attribute("open", "")
    panel.locator(":scope > summary").focus()
    page.keyboard.press("Enter")
    expect(panel).to_have_attribute("open", "")
    return panel


def private_experiment(page):
    nav = page.get_by_role("navigation", name="Workspace", exact=True)
    nav.get_by_role("button", name="Analyze results", exact=True).click()
    workspace = page.get_by_role("main", name="Analyze results", exact=True)
    form = workspace.get_by_role("form", name="RNA-seq analysis")
    form.get_by_label("Human RNA-seq results", exact=True).set_input_files({"name": PRIVATE[3], "mimeType": "text/csv", "buffer": b"gene,log2FoldChange,padj\nAPOE,2.375,0.0137\nABCA1,.1,.9\n"})
    form.get_by_role("textbox", name="Comparison", exact=True).fill(PRIVATE[0])
    fields = form.locator(".experiment-context-input")
    fields.locator(":scope > summary").click()
    fields.get_by_role("textbox", name="Tissue or cell model", exact=True).fill(PRIVATE[1])
    fields.get_by_role("textbox", name="Treatment or condition", exact=True).fill(PRIVATE[2])
    fields.get_by_role("combobox", name="Study design", exact=True).select_option("observational")
    fields.get_by_role("combobox", name="Sample type", exact=True).select_option("bulk_brain_tissue")
    form.get_by_role("checkbox", name="This table contains all tested genes", exact=True).check()
    form.locator("button[type=submit]").click()
    expect(workspace.locator("#experiment-results-title")).to_have_text(PRIVATE[0], timeout=15000)
    workspace.get_by_role("searchbox", name="Find pathways", exact=True).fill("R-HSA-174824")
    workspace.get_by_role("button", name="Plasma lipoprotein assembly, remodeling, and clearance", exact=True).click()
    workspace.get_by_role("button", name="View APOE evidence", exact=True).click()
    expect(page.locator(".selected-title")).to_have_text("APOE")
    # Explicit evidence navigation focuses its heading in the next frame.
    expect(page.locator(".selected-title")).to_be_focused()
    expect(page.get_by_role("region", name="Your RNA-seq result", exact=True)).to_contain_text(PRIVATE[0])


def inspect_success(panel, mocks):
    expect(panel.get_by_role("heading", name="Live results · unreviewed", exact=True)).to_be_visible()
    expect(panel).not_to_contain_text("DO_NOT_RETAIN")
    expect(provider(panel, "UniProt")).to_contain_text("SYNTHETIC APOE identity metadata")
    expect(provider(panel, "UniProt")).to_contain_text("123 · annotation updated 2026-01-01")
    expect(provider(panel, "Reactome")).to_contain_text("Membership does not establish pathway activity.")
    expect(provider(panel, "Reactome").get_by_role("link", name="SYNTHETIC mapped pathway 1", exact=False)).to_have_attribute("href", "https://reactome.org/content/detail/R-HSA-990000001")
    provider(panel, "Reactome").get_by_text("Remaining 1 returned records", exact=True).click()
    expect(provider(panel, "Reactome")).to_contain_text("SYNTHETIC mapped pathway 6")
    expect(provider(panel, "Open Targets")).to_contain_text("Provider scores are not probabilities.")
    expect(provider(panel, "Open Targets")).to_contain_text("Association score: 0.6789")
    expect(provider(panel, "OpenAlex")).to_contain_text("2 grouped works from 3 returned records; 12 matches reported")
    expect(provider(panel, "OpenAlex")).to_contain_text("OpenAlex reports a retraction.")
    work = provider(panel, "OpenAlex").locator(".live-source-records > li").first
    work.get_by_text("Work metadata", exact=True).click()
    expect(work).to_contain_text("true · not independently checked")
    expect(work).to_contain_text("duplicate_metadata_requires_review")
    work.get_by_text("Work metadata", exact=True).click()
    for name in PROVIDERS.values():
        card = provider(panel, name)
        expect(card.locator(".live-source-retrieved time")).to_have_count(1)
        details = card.locator(".live-source-provenance")
        details.locator(":scope > summary").click()
        expect(details).to_contain_text(mocks.last_digest[name])
        expect(details).to_contain_text("CC-BY-4.0" if name == "UniProt" else "CC0-1.0")
        if name == "UniProt":
            expect(details).to_contain_text("2026_04")
        elif name == "Open Targets":
            expect(details).to_contain_text('"year":"26","month":"09","iteration":null')
            expect(details).to_contain_text("1 retained; total 25; truncated: true")
        else:
            expect(details).to_contain_text("Not supplied")
        details.locator(":scope > summary").click()


def run_case(browser, url, screenshots, *, mobile=False, fallback=False):
    label = "fallback" if fallback else "mobile-dark" if mobile else "desktop-light"
    context = browser.new_context(viewport={"width": 360 if mobile else 1440, "height": 844 if mobile else 1000}, color_scheme="dark" if mobile else "light", reduced_motion="reduce", is_mobile=mobile, has_touch=mobile)
    context.add_init_script(FETCH_SPY)
    if fallback:
        context.add_init_script(FALLBACK)
    page = context.new_page()
    mocks = MockSources(page)
    errors, requests = [], []
    page.on("pageerror", lambda error: errors.append(str(error)))
    page.on("request", lambda request: requests.append((request.method, request.url, request.post_data)))
    page.goto(url, wait_until="networkidle")
    expect(page.locator("html")).to_have_attribute("data-theme", "dark" if mobile else "light")
    if fallback:
        expect(page.locator(".fallback-notice")).to_have_text("3D unavailable · List view")
    assert not mocks.calls, "Opening the app must not query providers."
    storage_before = page.evaluate("JSON.stringify({local:{...localStorage},session:{...sessionStorage}})")
    private_experiment(page)
    assert not mocks.calls, "Uploads/evidence navigation must not query providers."
    statement = page.locator(".finding-statement").inner_text()
    original_link = page.locator(".source-link").first.get_attribute("href")
    panel = open_panel(page)
    expect(panel).to_contain_text("public APOE identifiers (P02649, ENSG00000130203)")
    assert not mocks.calls, "Opening the disclosure must not query providers."
    button = panel.get_by_role("button", name="Check live sources", exact=True)
    button.focus()
    page.keyboard.press("Enter")
    wait_done(panel)
    expect(panel.get_by_role("button", name="Refresh live sources", exact=True)).to_be_focused()
    assert mocks.counts() == Counter({name: 1 for name in PROVIDERS.values()})
    inspect_success(panel, mocks)
    expect(page.locator(".selected-title")).to_have_text("APOE")
    expect(page.locator(".finding-statement")).to_have_text(statement)
    expect(page.locator(".source-link").first).to_have_attribute("href", original_link)
    panel.locator(":scope > summary").scroll_into_view_if_needed()
    page.screenshot(path=str(screenshots / f"live-sources-{label}.png"), full_page=True)
    provider(panel, "Open Targets").scroll_into_view_if_needed()
    page.screenshot(path=str(screenshots / f"live-sources-{label}-associations.png"), full_page=True)
    assert page.evaluate("document.documentElement.scrollWidth <= innerWidth"), "Live records overflow the viewport."

    # Current responses can fail independently; old packets stay explicitly dated.
    mocks.phase = "partial"
    panel.get_by_role("button", name="Refresh live sources", exact=True).click()
    wait_done(panel)
    for name, status in [("Reactome", 403), ("OpenAlex", 429)]:
        card = provider(panel, name)
        expect(card.get_by_role("alert")).to_contain_text(f"HTTP {status}")
        expect(card.get_by_role("alert")).to_contain_text("Previous result retained.")
        expect(card.locator(".live-source-retrieved time")).to_have_count(1)
    assert mocks.counts() == Counter({name: 2 for name in PROVIDERS.values()})
    mocks.phase = "success"
    for name in ["Reactome", "OpenAlex"]:
        counts = mocks.counts()
        action = provider(panel, name).get_by_role("button", name=f"Retry {name}", exact=True)
        action.focus()
        page.keyboard.press("Enter")
        wait_done(panel)
        expect(provider(panel, name).get_by_role("button", name=f"Refresh {name}", exact=True)).to_be_focused()
        assert mocks.counts() == counts + Counter({name: 1}), "Retry must query only the chosen provider."
        expect(provider(panel, name).get_by_role("alert")).to_have_count(0)

    if not mobile and not fallback:
        mocks.phase = "mismatch"
        panel.get_by_role("button", name="Refresh live sources", exact=True).click()
        wait_done(panel)
        expect(provider(panel, "UniProt").get_by_role("alert")).to_contain_text("does not match")
        expect(panel).not_to_contain_text("SYNTHETIC_MISMATCH_MUST_NOT_DISPLAY")
        expect(provider(panel, "UniProt")).to_contain_text("SYNTHETIC APOE identity metadata")
        mocks.phase = "success"
        provider(panel, "UniProt").get_by_role("button", name="Retry UniProt", exact=True).click()
        wait_done(panel)

    count_before_navigation = len(mocks.calls)
    for label_text in ["ABCA1", "ABCA1 protein", "APOE protein"]:
        select_entity(page, label_text)
        panel = open_panel(page)
        expect(panel).to_contain_text("public ABCA1 identifiers" if label_text.startswith("ABCA1") else "public APOE identifiers")
        assert len(mocks.calls) == count_before_navigation
        if label_text == "ABCA1":
            panel.get_by_role("button", name="Check live sources", exact=True).click()
            wait_done(panel)
            expect(provider(panel, "UniProt")).to_contain_text("SYNTHETIC ABCA1 identity metadata")
            assert all(row[1] == "ABCA1" for row in mocks.calls[-4:])
            count_before_navigation = len(mocks.calls)

    # Hold actual fetches, switch entities, and deliver late data after abort.
    mocks.phase = "held"
    before_signals = page.evaluate("window.__liveFetchQA.length")
    panel.get_by_role("button", name="Check live sources", exact=True).click()
    expect(panel.locator(".live-source-provider[aria-busy=true]")).to_have_count(4)
    select_entity(page, "TREM2")
    expect(page.locator(".live-sources")).to_have_count(0)
    assert len(mocks.held) == 4
    assert page.evaluate("start => window.__liveFetchQA.slice(start).every(item => item.aborted)", before_signals)
    mocks.release()
    select_entity(page, "Abca1 (mouse)")
    expect(page.locator(".live-sources")).to_have_count(0)
    select_entity(page, "APOE")
    panel = open_panel(page)
    expect(panel.locator(".live-source-results")).to_have_count(0)
    expect(panel.get_by_role("button", name="Check live sources", exact=True)).to_be_visible()

    fetches = page.evaluate("window.__liveFetchQA")
    assert fetches and all(item["credentials"] == "omit" and item["referrerPolicy"] == "no-referrer" and item["mode"] == "cors" and item["cache"] == "no-store" and item["redirect"] == "error" for item in fetches)
    for method, request_url, body in requests:
        parsed = urlsplit(request_url)
        assert parsed.netloc in ("", urlsplit(url).netloc) or parsed.hostname in PROVIDERS
        assert not any(value in unquote(request_url) or value in (body or "") for value in PRIVATE), "Private input reached network data."
        assert method in ("GET", "OPTIONS") or parsed.hostname == "api.platform.opentargets.org" and method == "POST"
    assert page.evaluate("JSON.stringify({local:{...localStorage},session:{...sessionStorage}})") == storage_before
    assert not any(value in unquote(page.url) for value in PRIVATE)
    assert not errors, errors
    context.close()
    print(f"PASS: {label} mocked live sources are explicit, identity-bound, separately labeled/hashed, retry independently, preserve focus/evidence, cancel stale requests and keep uploaded data local.")


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--url", default="http://127.0.0.1:4174/")
    parser.add_argument("--executable", default="/usr/bin/chromium")
    parser.add_argument("--screenshots", type=Path, default=ROOT / "artifacts/live-sources")
    args = parser.parse_args()
    args.screenshots.mkdir(parents=True, exist_ok=True)
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(executable_path=args.executable, headless=True, args=["--no-sandbox", "--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"])
        run_case(browser, args.url, args.screenshots)
        run_case(browser, args.url, args.screenshots, mobile=True)
        run_case(browser, args.url, args.screenshots, fallback=True)
        browser.close()


if __name__ == "__main__":
    main()
