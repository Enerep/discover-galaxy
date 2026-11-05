"""Focused source/species browser checks for the APOE/ABCA1 checkpoint.

Run against an already-running local production preview. Uses the existing
Python Playwright/system Chromium setup; does not fetch scientific providers or
install browser dependencies. Screenshots include real WebGL and its fallback.
"""

import argparse
import json
from pathlib import Path
import re
import runpy
from urllib.parse import parse_qs, urlsplit

from playwright.sync_api import Page, expect, sync_playwright


ROOT = Path(__file__).resolve().parents[1]
HELPERS = runpy.run_path(str(Path(__file__).with_name("browser-smoke.py")))
SNAPSHOT = json.loads((ROOT / "data/alzheimers/dataset.json").read_text())
CLAIMS = {claim["id"]: claim for claim in SNAPSHOT["claims"]}
SOURCES = {source["id"]: source for source in SNAPSHOT["sources"]}
EFFECTS = [
    "claim-mouse-abca1-apoe-lipidation-wahrle",
    "claim-mouse-abca1-apoe-soluble-tgswdi",
    "claim-mouse-abca1-apoe-soluble-app-ps1",
]
FALLBACK = """const original = HTMLCanvasElement.prototype.getContext;
HTMLCanvasElement.prototype.getContext = function(kind, ...args) {
    return kind.startsWith('webgl') ? null : original.call(this, kind, ...args);
};"""


def activate(control, *, touch: bool = False) -> None:
    control.tap() if touch else control.click()


def show_evidence(page: Page, *, touch: bool) -> None:
    control = page.get_by_role("button", name="View evidence", exact=True)
    if control.is_visible():
        if touch:
            HELPERS["assert_touch_target"](control)
        activate(control, touch=touch)


def select_entity(page: Page, entity_id: str, label: str, *, touch: bool) -> None:
    back = page.get_by_role("button", name="Back to graph", exact=True)
    if back.is_visible():
        activate(back, touch=touch)
    search = page.get_by_role("combobox", name="Search entities", exact=True)
    search.fill(entity_id)
    search.press("Enter")
    expect(page.locator(".selected-title")).to_have_text(label)
    expect(search).to_have_value("")
    show_evidence(page, touch=touch)


def assert_claim(page: Page, claim_id: str, source_kind: str) -> None:
    claim = CLAIMS[claim_id]
    expect(page.locator(".finding-statement")).to_have_text(claim["statement"])
    evidence = [item for item in SNAPSHOT["evidence"] if item["claim_id"] == claim_id]
    urls = {SOURCES[item["source_id"]]["url"] for item in evidence}
    actual = set(page.locator(".source-link").evaluate_all("links => links.map(link => link.href)"))
    assert actual == urls, (claim_id, actual, urls)
    for meta in page.locator(".source-meta").all_text_contents():
        assert source_kind in meta, (claim_id, meta)
    expect(page.locator(".selected-title")).to_be_visible()
    assert page.evaluate("document.documentElement.scrollWidth <= innerWidth"), claim_id


def choose_effect(page: Page, claim_id: str, *, touch: bool) -> None:
    label = CLAIMS[claim_id]["context"]["finding_label"]
    control = page.locator(".claim-button").filter(has_text=label)
    expect(control).to_have_count(1)
    activate(control, touch=touch)
    expect(control).to_have_attribute("aria-pressed", "true")
    assert_claim(page, claim_id, "Original paper")
    assert CLAIMS[claim_id]["context"]["taxonomy_id"] == 10090
    details = page.get_by_role("button", name="Study details and limitations", exact=True)
    activate(details, touch=touch)
    expect(details).to_have_attribute("aria-expanded", "true")
    expect(page.locator(".finding-content")).to_contain_text(re.compile(r"Mus musculus|mouse", re.I))
    # A real original-source locator must remain accessible beside each record.
    for item in SNAPSHOT["evidence"]:
        if item["claim_id"] == claim_id:
            expect(page.locator(".source-details")).to_contain_text(item["locator"])
    if any(value is None for item in SNAPSHOT["evidence"] if item["claim_id"] == claim_id
           for value in item["study_context"].values()):
        expect(page.locator(".source-study-context")).to_contain_text("Not recorded")
    assert page.evaluate("document.documentElement.scrollWidth <= innerWidth"), claim_id


def compare_and_download(page: Page, screenshots: Path, name: str, *, touch: bool) -> None:
    activate(page.get_by_role("button", name="Compare findings", exact=True), touch=touch)
    dialog = page.get_by_role("dialog", name="Compare findings", exact=True)
    expect(dialog).to_be_visible()
    first = dialog.get_by_role("combobox", name="Finding A", exact=True)
    second = dialog.get_by_role("combobox", name="Finding B", exact=True)
    # Select one side via a third finding so neither controlled select chooses
    # the other side's disabled current option.
    second.select_option(EFFECTS[0])
    first.select_option(EFFECTS[1])
    second.select_option(EFFECTS[2])
    expect(dialog.locator(".comparison-finding")).to_have_count(2)
    expect(dialog).to_contain_text("Tg-SwDI/B")
    expect(dialog).to_contain_text("APP/PS1")
    with page.expect_download() as pending:
        activate(dialog.get_by_role("link", name="Download comparison", exact=True), touch=touch)
    destination = screenshots / f"{name}-mouse-model-comparison.md"
    pending.value.save_as(destination)
    markdown = destination.read_text()
    plain = re.sub(r"\\([\\`*_\[\]<>|])", r"\1", markdown)
    for value in [SNAPSHOT["dataset_version"], *EFFECTS[1:], "Mus musculus", "Tg-SwDI/B", "APP/PS1", "not_checked"]:
        assert value in plain, value
    for item in SNAPSHOT["evidence"]:
        if item["claim_id"] in EFFECTS[1:]:
            assert SOURCES[item["source_id"]]["url"] in markdown
    assert page.evaluate("document.documentElement.scrollWidth <= innerWidth")
    page.screenshot(path=str(screenshots / f"{name}-mouse-model-comparison.png"))
    page.keyboard.press("Escape")
    expect(dialog).not_to_be_visible()


def assert_mouse_share_link(page: Page) -> None:
    page.get_by_role("button", name="Share", exact=True).click()
    dialog = page.get_by_role("dialog", name="Share this view", exact=True)
    expect(dialog).to_be_visible()
    link = dialog.get_by_role("textbox", name="Link to this view", exact=True).input_value()
    fragment = parse_qs(urlsplit(link).fragment)
    assert fragment["entity"] == ["protein-mouse-apoe"], fragment
    assert fragment["claim"] == [EFFECTS[-1]], fragment
    page.keyboard.press("Escape")
    page.goto(link, wait_until="networkidle")
    expect(page.locator(".selected-title")).to_have_text("ApoE protein (mouse)")
    assert_claim(page, EFFECTS[-1], "Original paper")


def check_case(browser, base_url: str, screenshots: Path, name: str, *, touch: bool, fallback: bool) -> None:
    context = browser.new_context(viewport={"width": 360 if touch else 1440, "height": 844 if touch else 1000},
        color_scheme="dark" if touch else "light", reduced_motion="reduce" if touch else "no-preference",
        is_mobile=touch, has_touch=touch)
    context.add_init_script(HELPERS["RENDER_COUNTERS"])
    if fallback:
        context.add_init_script(FALLBACK)
    page = context.new_page()
    errors, external, mutations = [], [], []
    origin = urlsplit(base_url).netloc
    page.on("pageerror", lambda error: errors.append(str(error)))

    def route(request_route) -> None:
        request = request_route.request
        parsed = urlsplit(request.url)
        if parsed.scheme in ["http", "https"] and parsed.netloc != origin:
            external.append(request.url)
            request_route.abort()
        else:
            if request.method not in ["GET", "HEAD"]:
                mutations.append(request.url)
            request_route.continue_()

    page.route("**/*", route)
    page.goto(base_url, wait_until="networkidle")
    if fallback:
        expect(page.locator(".fallback-notice")).to_be_visible()
        expect(page.get_by_role("button", name="Graph view", exact=True)).to_be_disabled()
    else:
        expect(page.locator("canvas")).to_be_visible()

    select_entity(page, "gene-abca1", "ABCA1", touch=touch)
    ortholog = page.locator(".claim-button").filter(has_text="Ortholog of · Abca1 (mouse)")
    ortholog.focus()
    ortholog.press("Enter")
    follow = page.get_by_role("button", name="View Abca1 (mouse)", exact=True)
    activate(follow, touch=touch)
    expect(page.locator(".selected-title")).to_have_text("Abca1 (mouse)")
    expect(page.locator(".selected-title")).to_be_focused()

    labels = [CLAIMS[claim_id]["context"]["finding_label"] for claim_id in EFFECTS]
    assert len(set(labels)) == 3, "Different experiments need distinguishable finding controls."
    for claim_id in EFFECTS:
        choose_effect(page, claim_id, touch=touch)
        page.screenshot(path=str(screenshots / f"{name}-{claim_id}.png"))
    compare_and_download(page, screenshots, name, touch=touch)

    # The original mouse endpoint remains explicit when following the selected
    # outcome rather than inheriting the human APOE identity.
    activate(page.get_by_role("button", name="View ApoE protein (mouse)", exact=True), touch=touch)
    expect(page.locator(".selected-title")).to_have_text("ApoE protein (mouse)")
    assert_claim(page, EFFECTS[-1], "Original paper")
    if not fallback:
        back = page.get_by_role("button", name="Back to graph", exact=True)
        if back.is_visible():
            activate(back, touch=touch)
        HELPERS["assert_idle"](page, f"{name} mouse-model graph")
        page.screenshot(path=str(screenshots / f"{name}-mouse-model-graph.png"), full_page=True)
        if not touch:
            HELPERS["export_share_image"](page, name, screenshots)
            assert_mouse_share_link(page)

    for gene, label, expected_score in [("abca1", "ABCA1", "0.4940984029965598"), ("apoe", "APOE", "0.695512952413486")]:
        select_entity(page, f"gene-{gene}", label, touch=touch)
        aggregate = page.locator(".claim-button").filter(has_text="Database association")
        expect(aggregate).to_have_count(1)
        activate(aggregate, touch=touch)
        assert_claim(page, f"claim-{gene}-opentargets-association", "Database annotation")
        activate(page.get_by_role("button", name="Study details and limitations", exact=True), touch=touch)
        content = page.locator(".finding-content")
        expect(content).to_contain_text("26.09")
        expect(content).to_contain_text(expected_score)
        expect(content).to_contain_text(re.compile("direct", re.I))
        expect(content).to_contain_text("20")
        page.screenshot(path=str(screenshots / f"{name}-{gene}-database-association.png"))

    assert not errors, errors
    assert not external, f"Explorer attempted external requests: {external}"
    assert not mutations, f"Explorer attempted non-read requests: {mutations}"
    assert page.evaluate("document.documentElement.scrollWidth <= innerWidth")
    context.close()
    print(f"PASS: {name}: human-to-mouse navigation, three scoped findings, exact citations, model comparison export, database scores and local-only requests.")


def run(base_url: str, executable: str, screenshots: Path) -> None:
    for claim_id in EFFECTS:
        assert claim_id in CLAIMS, f"Checkpoint dataset not ready: missing {claim_id}"
    screenshots.mkdir(parents=True, exist_ok=True)
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(executable_path=executable, headless=True,
            args=["--no-sandbox", "--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"])
        for name, touch, fallback in [("desktop-light", False, False), ("mobile-dark", True, False), ("mobile-fallback", True, True)]:
            check_case(browser, base_url, screenshots, name, touch=touch, fallback=fallback)
        browser.close()


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--url", default="http://127.0.0.1:4173/")
    parser.add_argument("--chromium", default="/usr/bin/chromium")
    parser.add_argument("--screenshots", type=Path, default=Path("artifacts/apoe-abca1"))
    options = parser.parse_args()
    run(options.url, options.chromium, options.screenshots)
