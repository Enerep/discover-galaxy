"""Optional browser QA using Python Playwright and a system Chromium.

Run against an already-started dev or preview server. No npm browser dependency
is installed, and no publication links are visited by these checks. Rendering
counters are injected into the test browser only; production has no QA hooks.
"""

import argparse
from pathlib import Path

from playwright.sync_api import Locator, Page, expect, sync_playwright


RENDER_COUNTERS = """
window.__browserQA = { raf: 0, draws: 0 };
const originalRAF = window.requestAnimationFrame;
window.requestAnimationFrame = function(callback) {
  window.__browserQA.raf += 1;
  return originalRAF.call(this, callback);
};
for (const api of [window.WebGLRenderingContext, window.WebGL2RenderingContext]) {
  if (!api) continue;
  for (const method of ['drawArrays', 'drawElements', 'drawArraysInstanced', 'drawElementsInstanced']) {
    const original = api.prototype[method];
    if (!original) continue;
    api.prototype[method] = function(...args) {
      window.__browserQA.draws += 1;
      return original.apply(this, args);
    };
  }
}
"""


def assert_idle(page: Page, label: str) -> None:
    # Pointer movement can animate hover, so park it outside the scene first.
    if not page.evaluate("matchMedia('(pointer: coarse)').matches"):
        page.mouse.move(2, 2)
    page.wait_for_timeout(1800)
    before = page.evaluate("({...window.__browserQA})")
    # Playwright's assertion polling can itself request frames. Keep this sample
    # free of locators/assertions so it measures the application's idle behavior.
    page.wait_for_timeout(500)
    after = page.evaluate("({...window.__browserQA})")
    rafs = after["raf"] - before["raf"]
    draws = after["draws"] - before["draws"]
    assert rafs <= 2, f"{label}: {rafs} RAF requests while idle"
    assert draws == 0, f"{label}: {draws} WebGL draws while idle"
    print(f"PASS: {label} settles; idle sample requested {rafs} frames and made {draws} WebGL draws.")


def assert_no_scroll(page: Page, control: Locator, action, label: str) -> None:
    # Account for the browser bringing an offscreen control into view before
    # measuring whether the application unexpectedly scrolls on selection.
    control.scroll_into_view_if_needed()
    page.wait_for_timeout(120)
    before = page.evaluate("window.scrollY")
    action()
    page.wait_for_timeout(160)
    after = page.evaluate("window.scrollY")
    assert abs(after - before) <= 2, f"{label}: scroll changed from {before} to {after}"


def assert_touch_target(control: Locator) -> None:
    box = control.bounding_box()
    assert box is not None
    assert box["width"] >= 40 and box["height"] >= 40, f"Small touch target: {box}"


def run(base_url: str, executable: str, screenshots: Path) -> None:
    screenshots.mkdir(parents=True, exist_ok=True)
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(
            executable_path=executable,
            headless=True,
            args=["--no-sandbox", "--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"],
        )
        context = browser.new_context(viewport={"width": 1440, "height": 1000})
        context.add_init_script(RENDER_COUNTERS)
        page = context.new_page()
        errors: list[str] = []
        page.on("pageerror", lambda error: errors.append(str(error)))
        page.goto(base_url, wait_until="networkidle")
        expect(page.locator("canvas")).to_be_visible(timeout=10000)
        expect(page.locator(".selected-title")).to_have_text("APOE")
        assert page.evaluate("!!document.querySelector('canvas').getContext('webgl2')")
        assert page.evaluate("window.__browserQA.draws > 0")
        search = page.get_by_role("combobox", name="Search entities")
        filter_control = page.get_by_role("combobox", name="Filter by entity type")
        expect(search).to_have_count(1)
        expect(filter_control).to_have_count(1)
        expect(page.get_by_role("button", name="Graph view", exact=True)).to_have_count(1)
        expect(page.get_by_role("button", name="List view", exact=True)).to_have_count(1)
        assert page.evaluate("document.documentElement.scrollWidth <= innerWidth")
        assert page.get_by_role("button", name="About the data").evaluate(
            "element => getComputedStyle(element).transitionDuration.split(',').some(value => parseFloat(value) > 0)"
        )
        assert_idle(page, "Initial graph")
        page.screenshot(path=str(screenshots / "desktop.png"), full_page=True)

        # The deterministic initial camera centers the disease at the origin.
        canvas = page.locator("canvas").bounding_box()
        assert canvas is not None
        page.mouse.click(canvas["x"] + canvas["width"] / 2, canvas["y"] + canvas["height"] / 2)
        expect(page.locator(".selected-title")).to_have_text("Alzheimer's disease")
        expect(page.locator(".claim-button")).to_have_count(4)

        page.get_by_role("button", name="TREM2", exact=True).click()
        expect(page.locator(".selected-title")).to_have_text("TREM2")
        expect(page.locator(".source-link")).to_have_attribute("href", "https://pubmed.ncbi.nlm.nih.gov/23150908/")
        details = page.get_by_role("button", name="Study details and limitations")
        body = page.locator(".finding-content .disclosure-body")
        expect(details).to_have_attribute("aria-expanded", "false")
        expect(body).to_have_attribute("aria-hidden", "true")
        assert body.evaluate("element => element.inert")
        details.click()
        expect(details).to_have_attribute("aria-expanded", "true")
        expect(body).to_have_attribute("aria-hidden", "false")
        assert not body.evaluate("element => element.inert")
        expect(page.locator(".study-context")).to_contain_text("rs75932628-T")
        expect(page.locator(".source-study-context")).to_contain_text("sequenced discovery individuals")
        expect(page.locator(".source-study-context")).to_contain_text("2,261")
        details.click()
        expect(body).to_have_attribute("aria-hidden", "true")
        assert body.evaluate("element => element.inert")
        assert page.locator(".finding-statement").evaluate("element => parseFloat(getComputedStyle(element).fontSize) >= 15")
        assert page.locator(".source-title").evaluate("element => parseFloat(getComputedStyle(element).fontSize) >= 14")

        # Long study details must not leave the next entity's heading offscreen.
        details.click()
        page.wait_for_timeout(300)
        inspector = page.locator(".inspector")
        assert inspector.evaluate("element => element.scrollHeight > element.clientHeight")
        apoe_shortcut = page.get_by_role("button", name="APOE", exact=True)
        apoe_shortcut.scroll_into_view_if_needed()
        page.wait_for_timeout(120)
        inspector.evaluate("element => { element.scrollTop = element.scrollHeight; }")
        assert inspector.evaluate("element => element.scrollTop > 0")
        page_scroll = page.evaluate("window.scrollY")
        apoe_shortcut.click()
        expect(page.locator(".selected-title")).to_have_text("APOE")
        assert inspector.evaluate("element => element.scrollTop === 0")
        expect(page.locator(".selected-title")).to_be_in_viewport()
        assert inspector.evaluate("element => { const panel = element.getBoundingClientRect(); const title = element.querySelector('.selected-title').getBoundingClientRect(); return title.top >= panel.top && title.bottom <= panel.bottom; }")
        assert abs(page.evaluate("window.scrollY") - page_scroll) <= 2

        page.keyboard.press("Control+k")
        expect(search).to_be_focused()
        search.fill("e")
        results = page.get_by_role("listbox")
        options = results.get_by_role("option")
        expect(options).to_have_count(8)
        assert results.evaluate("element => element.scrollHeight > element.clientHeight")
        page_scroll = page.evaluate("window.scrollY")
        for _ in range(7):
            search.press("ArrowDown")
        expect(options.nth(7)).to_have_attribute("aria-selected", "true")
        assert results.evaluate("element => element.scrollTop > 0")
        active_visible = "element => { const bounds = element.getBoundingClientRect(); const active = element.querySelector('[aria-selected=true]').getBoundingClientRect(); const top = bounds.top + element.clientTop; return active.top >= top - 1 && active.bottom <= top + element.clientHeight + 1; }"
        assert results.evaluate(active_visible)
        assert abs(page.evaluate("window.scrollY") - page_scroll) <= 2
        search.press("ArrowDown")
        expect(options.nth(0)).to_have_attribute("aria-selected", "true")
        assert results.evaluate(active_visible)
        search.press("ArrowUp")
        expect(options.nth(7)).to_have_attribute("aria-selected", "true")
        assert results.evaluate("element => element.scrollTop > 0")
        assert results.evaluate(active_visible)
        assert abs(page.evaluate("window.scrollY") - page_scroll) <= 2
        search.press("Escape")
        print("PASS: entity changes reset only inspector scroll; keyboard search keeps wrapped active options visible without page movement.")

        search.fill("Alzheimer’s disease")
        expect(page.get_by_role("listbox").get_by_role("option")).to_have_count(1)
        expect(page.locator(".result-status")).to_contain_text("with context")
        search.press("Enter")
        expect(page.locator(".selected-title")).to_have_text("Alzheimer's disease")
        expect(page.locator(".claim-button")).to_have_count(4)
        expect(search).to_have_value("")
        expect(search).to_have_attribute("aria-expanded", "false")
        expect(page.locator(".result-status")).to_have_text("8 entities · 4 papers")
        search.fill("APOE")
        expect(page.get_by_role("listbox").get_by_role("option")).to_have_count(3)
        search.press("ArrowDown")
        expect(page.get_by_role("listbox").get_by_role("option", selected=True)).to_contain_text("Corder et al. · 1993")
        search.press("Enter")
        expect(page.locator(".selected-title")).to_have_text("Corder et al. · 1993")
        expect(page.locator(".source-link")).to_have_attribute("href", "https://pubmed.ncbi.nlm.nih.gov/8346443/")
        expect(search).to_have_value("")
        search.fill("APOE")
        search.press("ArrowUp")
        expect(page.get_by_role("listbox").get_by_role("option", selected=True)).to_contain_text("Corder et al. · 1994")
        search.press("Escape")
        expect(search).to_have_value("")
        expect(search).to_have_attribute("aria-expanded", "false")
        expect(page.get_by_role("listbox")).to_have_count(0)
        expect(page.locator(".selected-title")).to_have_text("Corder et al. · 1993")
        search.fill("not-in-this-atlas")
        expect(page.get_by_role("heading", name="No matches", exact=True)).to_be_visible()
        page.get_by_role("button", name="Show all entities").click()
        expect(search).to_have_value("")

        page.get_by_role("button", name="List view", exact=True).click()
        expect(page.locator(".entity-row")).to_have_count(8)
        page.locator('.entity-row[data-entity-id="paper-corder-1994"]').click()
        expect(page.locator(".selected-title")).to_have_text("Corder et al. · 1994")
        expect(page.locator(".source-link")).to_have_attribute("href", "https://pubmed.ncbi.nlm.nih.gov/7920638/")
        gene_row = page.locator('.entity-row[data-entity-id="gene-abca1"]')
        gene_row.focus()
        page.keyboard.press("Enter")
        expect(page.locator(".selected-title")).to_have_text("ABCA1")
        expect(page.locator(".source-link")).to_have_attribute("href", "https://pubmed.ncbi.nlm.nih.gov/26079414/")
        filter_control.select_option("gene")
        expect(page.locator(".entity-row")).to_have_count(3)
        filter_control.select_option("paper")
        expect(page.locator(".entity-row")).to_have_count(4)
        page.get_by_role("button", name="Show in the current view").click()
        expect(filter_control).to_have_value("all")
        expect(page.locator(".entity-row")).to_have_count(8)
        page.get_by_role("button", name="About the data").click()
        expect(page.get_by_role("dialog")).to_be_visible()
        expect(page.get_by_role("dialog")).to_contain_text("drafts awaiting human review")
        page.keyboard.press("Escape")
        expect(page.get_by_role("dialog")).not_to_be_visible()
        expect(page.get_by_role("button", name="About the data")).to_be_focused()
        page.screenshot(path=str(screenshots / "list.png"), full_page=True)

        page.get_by_role("button", name="Graph view", exact=True).click()
        expect(page.locator("canvas")).to_be_visible()
        for name in ["Zoom in", "Zoom out", "Reset view"]:
            before = page.evaluate("window.__browserQA.draws")
            page.get_by_role("button", name=name, exact=True).click()
            page.wait_for_timeout(150)
            assert page.evaluate("window.__browserQA.draws") > before, f"{name} did not render"
        assert_idle(page, "Graph after zoom and reset")
        assert not errors, errors
        print("PASS: desktop canvas picking, source URLs, disclosures, keyboard search, filters, list, dialog, zoom and reset.")

        mobile = browser.new_context(viewport={"width": 390, "height": 844}, reduced_motion="reduce", is_mobile=True, has_touch=True)
        mobile.add_init_script(RENDER_COUNTERS)
        mobile_page = mobile.new_page()
        mobile_errors: list[str] = []
        mobile_page.on("pageerror", lambda error: mobile_errors.append(str(error)))
        mobile_page.goto(base_url, wait_until="networkidle")
        expect(mobile_page.locator("canvas")).to_be_visible()
        assert mobile_page.evaluate("matchMedia('(prefers-reduced-motion: reduce)').matches")
        assert mobile_page.evaluate("document.documentElement.scrollWidth <= innerWidth")
        for selector in [".data-status", ".inspector-content", ".disclosure-body"]:
            assert mobile_page.locator(selector).first.evaluate("element => { const style = getComputedStyle(element); return style.animationName === 'none' && style.transitionDuration.split(',').every(value => parseFloat(value) === 0); }")
        for control in [
            mobile_page.get_by_role("button", name="About the data"),
            mobile_page.get_by_role("combobox", name="Filter by entity type"),
            mobile_page.get_by_role("button", name="Graph view", exact=True),
            mobile_page.get_by_role("button", name="List view", exact=True),
            mobile_page.get_by_role("button", name="Zoom in", exact=True),
            mobile_page.get_by_role("button", name="Zoom out", exact=True),
            mobile_page.get_by_role("button", name="Reset view", exact=True),
            mobile_page.get_by_role("button", name="View evidence", exact=True),
            mobile_page.get_by_role("button", name="Back to graph", exact=True),
        ]:
            assert_touch_target(control)
        assert_idle(mobile_page, "Reduced-motion graph")
        expect(mobile_page.locator(".touch-hint")).to_be_visible()
        expect(mobile_page.locator(".pointer-hint")).not_to_be_visible()
        mobile_page.screenshot(path=str(screenshots / "mobile.png"), full_page=True)
        shortcut = mobile_page.get_by_role("button", name="TREM2", exact=True)
        assert_no_scroll(mobile_page, shortcut, shortcut.tap, "Mobile gene selection")
        expect(mobile_page.locator(".selected-title")).to_have_text("TREM2")
        mobile_search = mobile_page.get_by_role("combobox", name="Search entities")
        assert_no_scroll(mobile_page, mobile_search, lambda: mobile_search.fill("ABCA1"), "Mobile search typing")
        assert_no_scroll(mobile_page, mobile_search, lambda: mobile_search.press("Enter"), "Mobile search selection")
        expect(mobile_page.locator(".selected-title")).to_have_text("ABCA1")
        expect(mobile_search).to_have_value("")
        mobile_filter = mobile_page.get_by_role("combobox", name="Filter by entity type")
        assert_no_scroll(mobile_page, mobile_filter, lambda: mobile_filter.select_option("gene"), "Mobile filter")
        mobile_page.get_by_role("button", name="List view", exact=True).tap()
        expect(mobile_page.locator(".entity-row")).to_have_count(3)
        mobile_row = mobile_page.locator('.entity-row[data-entity-id="gene-trem2"]')
        assert_no_scroll(mobile_page, mobile_row, mobile_row.tap, "Mobile list selection")
        expect(mobile_page.locator(".selected-title")).to_have_text("TREM2")
        mobile_page.get_by_role("button", name="View evidence", exact=True).tap()
        expect(mobile_page.locator(".selected-title")).to_be_focused()
        expect(mobile_page.locator(".source-link")).to_have_attribute("href", "https://pubmed.ncbi.nlm.nih.gov/23150908/")
        evidence_scroll = mobile_page.evaluate("window.scrollY")
        mobile_page.screenshot(path=str(screenshots / "mobile-evidence.png"), full_page=True)
        mobile_page.get_by_role("button", name="Back to graph", exact=True).tap()
        expect(mobile_page.locator(".graph-card")).to_be_focused()
        assert mobile_page.evaluate("window.scrollY") < evidence_scroll
        assert mobile_page.evaluate("document.documentElement.scrollWidth <= innerWidth")
        assert not mobile_errors, mobile_errors
        print("PASS: mobile touch targets, reduced motion, stable scrolling on selection, explicit evidence navigation, and list filters.")

        fallback = browser.new_context(viewport={"width": 1280, "height": 900})
        fallback.add_init_script("""
            const original = HTMLCanvasElement.prototype.getContext;
            HTMLCanvasElement.prototype.getContext = function(kind, ...args) {
              if (kind.startsWith('webgl')) return null;
              return original.call(this, kind, ...args);
            };
        """)
        fallback_page = fallback.new_page()
        fallback_page.goto(base_url, wait_until="networkidle")
        expect(fallback_page.locator(".fallback-notice")).to_be_visible()
        expect(fallback_page.locator(".entity-row")).to_have_count(8)
        expect(fallback_page.get_by_role("button", name="Graph view", exact=True)).to_be_disabled()
        fallback_page.locator('.entity-row[data-entity-id="gene-trem2"]').click()
        expect(fallback_page.locator(".selected-title")).to_have_text("TREM2")
        expect(fallback_page.locator(".source-link")).to_have_attribute("href", "https://pubmed.ncbi.nlm.nih.gov/23150908/")
        fallback_page.screenshot(path=str(screenshots / "webgl-fallback.png"), full_page=True)
        print("PASS: unavailable WebGL preserves list selection and original evidence.")
        browser.close()


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--url", default="http://127.0.0.1:5173/")
    parser.add_argument("--chromium", default="/usr/bin/chromium")
    parser.add_argument("--screenshots", type=Path, default=Path("artifacts/browser"))
    options = parser.parse_args()
    run(options.url, options.chromium, options.screenshots)
