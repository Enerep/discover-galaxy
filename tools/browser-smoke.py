"""Optional browser QA. Requires Python Playwright and a system Chromium.

Run against an already-started dev or preview server. No npm browser dependency
is installed, and no publication links are visited by these checks.
"""

import argparse
from pathlib import Path

from playwright.sync_api import expect, sync_playwright


def run(base_url: str, executable: str, screenshots: Path) -> None:
    screenshots.mkdir(parents=True, exist_ok=True)
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(
            executable_path=executable,
            headless=True,
            args=["--no-sandbox", "--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"],
        )
        context = browser.new_context(viewport={"width": 1440, "height": 1000})
        page = context.new_page()
        errors: list[str] = []
        page.on("pageerror", lambda error: errors.append(str(error)))
        page.goto(base_url, wait_until="networkidle")
        expect(page.locator("canvas")).to_be_visible(timeout=10000)
        expect(page.locator(".selected-title")).to_have_text("APOE")
        assert page.evaluate("!!document.querySelector('canvas').getContext('webgl2')")
        page.wait_for_timeout(500)
        page.screenshot(path=str(screenshots / "desktop.png"), full_page=True)

        # Fixed viewport + deterministic layout: pick the large disease node.
        canvas = page.locator("canvas").bounding_box()
        assert canvas is not None
        page.mouse.click(canvas["x"] + canvas["width"] * 0.55, canvas["y"] + canvas["height"] * 0.46)
        expect(page.locator(".selected-title")).to_have_text("Alzheimer's disease")

        page.get_by_role("button", name="TREM2", exact=True).click()
        expect(page.locator(".selected-title")).to_have_text("TREM2")
        expect(page.locator(".source-card > a")).to_have_attribute("href", "https://pubmed.ncbi.nlm.nih.gov/23150908/")
        page.get_by_role("button", name="Show study context & limitations").click()
        expect(page.locator(".study-context")).to_contain_text("rs75932628-T")
        page.locator(".source-card summary").click()
        expect(page.locator(".source-study-context")).to_contain_text("sequenced discovery individuals")
        expect(page.locator(".source-study-context")).to_contain_text("2261")

        page.keyboard.press("Control+k")
        expect(page.get_by_role("textbox", name="Search entities")).to_be_focused()
        page.get_by_role("textbox", name="Search entities").fill("Alzheimer’s disease")
        expect(page.locator(".search-results > button")).to_have_count(1)
        expect(page.locator(".filter-status")).to_contain_text("neighborhood shown")
        page.get_by_role("textbox", name="Search entities").press("Enter")
        expect(page.locator(".selected-title")).to_have_text("Alzheimer's disease")
        expect(page.locator(".claim-button")).to_have_count(4)
        page.get_by_role("textbox", name="Search entities").fill("not-in-this-atlas")
        expect(page.get_by_role("heading", name="No entities found")).to_be_visible()
        page.get_by_role("button", name="Show all entities").click()

        page.get_by_role("button", name="List view", exact=True).click()
        expect(page.locator(".entity-card")).to_have_count(8)
        page.locator(".entity-card").filter(has_text="Corder et al. · 1993").click()
        expect(page.locator(".selected-title")).to_have_text("Corder et al. · 1993")
        expect(page.locator(".source-card > a")).to_have_attribute("href", "https://pubmed.ncbi.nlm.nih.gov/8346443/")
        gene_card = page.locator('.entity-card[data-entity-id="gene-abca1"]')
        gene_card.focus()
        page.keyboard.press("Enter")
        expect(page.locator(".selected-title")).to_have_text("ABCA1")
        page.get_by_role("button", name="Genes", exact=False).first.click()
        expect(page.locator(".entity-card")).to_have_count(3)
        page.get_by_role("button", name="Clear filters").click()
        expect(page.locator(".entity-card")).to_have_count(8)
        page.get_by_role("button", name="About this atlas").click()
        expect(page.get_by_role("dialog")).to_be_visible()
        page.keyboard.press("Escape")
        expect(page.get_by_role("dialog")).not_to_be_visible()
        page.screenshot(path=str(screenshots / "list.png"), full_page=True)
        assert not errors, errors
        assert page.evaluate("document.documentElement.scrollWidth <= innerWidth")
        print("PASS: desktop WebGL, search neighborhood, selection, citations, keyboard, filters, dialog, and list.")

        mobile = browser.new_context(viewport={"width": 390, "height": 844}, reduced_motion="reduce", is_mobile=True, has_touch=True)
        mobile_page = mobile.new_page()
        mobile_errors: list[str] = []
        mobile_page.on("pageerror", lambda error: mobile_errors.append(str(error)))
        mobile_page.goto(base_url, wait_until="networkidle")
        expect(mobile_page.locator("canvas")).to_be_visible()
        assert mobile_page.evaluate("matchMedia('(prefers-reduced-motion: reduce)').matches")
        assert mobile_page.evaluate("document.documentElement.scrollWidth <= innerWidth")
        mobile_page.screenshot(path=str(screenshots / "mobile.png"), full_page=True)
        mobile_page.get_by_role("button", name="List view", exact=True).click()
        mobile_page.locator(".mobile-filters").get_by_role("button", name="Genes", exact=True).click()
        expect(mobile_page.locator(".entity-card")).to_have_count(3)
        mobile_page.locator('.entity-card[data-entity-id="gene-abca1"]').click()
        expect(mobile_page.locator(".selected-title")).to_have_text("ABCA1")
        assert not mobile_errors, mobile_errors
        print("PASS: mobile layout, reduced motion, filters, and entity inspection.")

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
        expect(fallback_page.locator(".entity-card")).to_have_count(8)
        fallback_page.locator('.entity-card[data-entity-id="gene-trem2"]').click()
        expect(fallback_page.locator(".selected-title")).to_have_text("TREM2")
        expect(fallback_page.locator(".source-card > a")).to_have_attribute("href", "https://pubmed.ncbi.nlm.nih.gov/23150908/")
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
