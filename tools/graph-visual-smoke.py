"""Focused 3D graph QA against an already-running local production preview.

Uses system Chromium and the existing browser-smoke helpers; installs nothing and
does not visit publication/provider URLs. Screenshots retain the real WebGL scene
for manual review of silhouettes, label spacing and selected relationship tags.
"""

import argparse
import base64
from pathlib import Path
import runpy
from urllib.parse import urlsplit, urlunsplit

from playwright.sync_api import Page, expect, sync_playwright


HELPERS = runpy.run_path(str(Path(__file__).with_name("browser-smoke.py")))
SNAPSHOT = HELPERS["SNAPSHOT"]
RENDER_COUNTERS = HELPERS["RENDER_COUNTERS"]
assert_idle = HELPERS["assert_idle"]
export_share_image = HELPERS["export_share_image"]
PATHWAYS = [
    ("pathway-cholesterol-efflux", "Cholesterol transport and efflux"),
    ("pathway-dap12", "DAP12 signaling"),
    ("pathway-scavenger-receptors", "Scavenger-receptor binding and uptake"),
]


def select_entity(page: Page, entity_id: str, label: str) -> None:
    search = page.get_by_role("combobox", name="Search entities", exact=True)
    search.fill(entity_id)
    search.press("Enter")
    expect(page.locator(".selected-title")).to_have_text(label)
    expect(search).to_have_value("")
    page.wait_for_timeout(650)


def assert_claim(page: Page, claim_id: str) -> None:
    claim = next(claim for claim in SNAPSHOT["claims"] if claim["id"] == claim_id)
    source_ids = {evidence["source_id"] for evidence in SNAPSHOT["evidence"] if evidence["claim_id"] == claim_id}
    source_urls = {source["url"] for source in SNAPSHOT["sources"] if source["id"] in source_ids}
    expect(page.locator(".finding-statement")).to_have_text(claim["statement"])
    assert set(page.locator(".source-link").evaluate_all("links => links.map(link => link.href)")) == source_urls


def capture_scene(page: Page, screenshots: Path, name: str) -> None:
    expect(page.locator("canvas")).to_be_visible()
    assert page.evaluate("document.documentElement.scrollWidth <= innerWidth"), name
    page.screenshot(path=str(screenshots / f"{name}.png"), full_page=True)
    page.locator("canvas").screenshot(path=str(screenshots / f"{name}-canvas.png"), scale="css")


def pick_colored_body(page: Page, entity_type: str, *, topmost: bool = False) -> None:
    """Find an actual rendered body by hue, then send a normal canvas click.

    Read a Playwright screenshot rather than WebGL's discarded drawing buffer.
    Bright, compact components exclude the dim stars, glows and relationship
    lines. This needs no production scene access or fixed layout coordinates.
    """
    canvas = page.locator("canvas")
    screenshot = base64.b64encode(canvas.screenshot(scale="css")).decode("ascii")
    components = page.evaluate("""async ({ screenshot, entityType }) => {
        const image = new Image(); image.src = `data:image/png;base64,${screenshot}`;
        await image.decode();
        const copy = document.createElement('canvas');
        copy.width = image.width; copy.height = image.height;
        const context = copy.getContext('2d'); context.drawImage(image, 0, 0);
        const pixels = context.getImageData(0, 0, copy.width, copy.height).data;
        const mask = new Uint8Array(copy.width * copy.height);
        for (let index = 0; index < mask.length; index++) {
            const [r, g, b] = pixels.subarray(index * 4, index * 4 + 3);
            mask[index] = entityType === 'protein' ? b > g + 5 && g > r + 12 && g > 125
                : entityType === 'pathway' ? r > b + 15 && g > b + 12 && Math.abs(r - g) < 35 && g > 125
                : g > r + 18 && g > b + 3 && b > r + 8 && g > 135;
        }
        const components = [];
        for (let index = 0; index < mask.length; index++) {
            if (!mask[index]) continue;
            const queue = [index]; mask[index] = 0;
            let minX = copy.width, maxX = 0, minY = copy.height, maxY = 0;
            for (let cursor = 0; cursor < queue.length; cursor++) {
                const current = queue[cursor], x = current % copy.width, y = Math.floor(current / copy.width);
                minX = Math.min(minX, x); maxX = Math.max(maxX, x);
                minY = Math.min(minY, y); maxY = Math.max(maxY, y);
                for (const next of [x > 0 ? current - 1 : -1, x + 1 < copy.width ? current + 1 : -1,
                    y > 0 ? current - copy.width : -1, y + 1 < copy.height ? current + copy.width : -1]) {
                    if (next >= 0 && mask[next]) { mask[next] = 0; queue.push(next); }
                }
            }
            const width = maxX - minX + 1, height = maxY - minY + 1;
            if (queue.length >= 8 && width >= 3 && height >= 3 && width <= 65 && height <= 65
                && width / height > .3 && width / height < 3) {
                components.push({ x: (minX + maxX) / 2, y: (minY + maxY) / 2, pixels: queue.length });
            }
        }
        return components;
    }""", {"screenshot": screenshot, "entityType": entity_type})
    assert components, f"No rendered {entity_type} body found; inspect the preceding canvas screenshot"
    print(f"Rendered {entity_type} body candidates: {components}")
    body = min(components, key=lambda item: item["y"]) if topmost else max(components, key=lambda item: item["pixels"])
    box = canvas.bounding_box()
    assert box is not None
    page.mouse.click(box["x"] + body["x"], box["y"] + body["y"])
    page.wait_for_timeout(650)


def assert_legend(page: Page) -> None:
    legend = page.get_by_label("Graph legend", exact=True)
    expect(legend.locator(".entity-shape-mark.gene path")).to_have_count(1)
    expect(legend.locator(".entity-shape-mark.protein circle")).to_have_count(1)
    expect(legend.locator(".entity-shape-mark.pathway circle")).to_have_attribute("fill", "none")
    for name in ["Gene", "Protein", "Pathway"]:
        expect(legend.get_by_text(name, exact=True)).to_be_visible()


def pathway_views(page: Page, screenshots: Path, device: str) -> None:
    navigation = page.get_by_role("navigation", name="Graph navigation")
    for entity_id, label in PATHWAYS:
        select_entity(page, entity_id, label)
        expect(navigation).to_contain_text(f"{label} connections")
        direct_status = navigation.get_by_role("status").inner_text()
        capture_scene(page, screenshots, f"{device}-{entity_id}-focus")
        navigation.get_by_role("button", name="Expand connections", exact=True).click()
        expect(navigation.get_by_role("button", name="Collapse", exact=True)).to_have_attribute("aria-expanded", "true")
        assert navigation.get_by_role("status").inner_text() != direct_status
        page.wait_for_timeout(650)
        capture_scene(page, screenshots, f"{device}-{entity_id}-expanded")
        navigation.get_by_role("button", name="Previous graph view", exact=True).click()
        expect(navigation.get_by_role("status")).to_have_text(direct_status)
        navigation.get_by_role("button", name="Overview", exact=True).click()
        expect(navigation.get_by_role("status")).to_have_text(f"{len(SNAPSHOT['entities'])} entities in this graph view")
        page.wait_for_timeout(650)
        capture_scene(page, screenshots, f"{device}-{entity_id}-overview")
        navigation.get_by_role("button", name="Focus selection", exact=True).click()
    assert_idle(page, f"{device} pathway focus/expand/overview")


def check_desktop(browser, base_url: str, screenshots: Path) -> None:
    context = browser.new_context(viewport={"width": 1440, "height": 1000}, color_scheme="light")
    context.add_init_script(RENDER_COUNTERS)
    page = context.new_page()
    errors, requests = [], []
    page.on("pageerror", lambda error: errors.append(str(error)))
    page.on("request", lambda request: requests.append(request.url))
    page.goto(base_url, wait_until="networkidle")
    expect(page.locator("canvas")).to_be_visible()
    assert_legend(page)
    page.wait_for_timeout(650)
    capture_scene(page, screenshots, "desktop-gene-shape")
    pick_colored_body(page, "protein")
    expect(page.locator(".selected-title")).to_have_text("APOE protein")
    page.locator(".claim-button").filter(has_text="Encoded by · APOE").click()
    assert_claim(page, "claim-apoe-encodes")
    capture_scene(page, screenshots, "desktop-protein-selected-encodes")
    pick_colored_body(page, "pathway", topmost=True)
    expect(page.locator(".selected-title")).to_have_text("Cholesterol transport and efflux")
    page.locator(".claim-button").filter(has_text="Participant · APOE protein").click()
    assert_claim(page, "claim-apoe-cholesterol-pathway")
    capture_scene(page, screenshots, "desktop-pathway-selected-participant")
    page.get_by_role("navigation", name="Graph navigation").get_by_role("button", name="Expand connections", exact=True).click()
    page.wait_for_timeout(650)
    capture_scene(page, screenshots, "desktop-expanded-gene-pick")
    pick_colored_body(page, "gene", topmost=True)
    expect(page.locator(".selected-title")).to_have_text("ABCA1")
    page.locator(".claim-button").filter(has_text="Encodes · ABCA1 protein").click()
    assert_claim(page, "claim-abca1-encodes")
    capture_scene(page, screenshots, "desktop-diamond-selected")
    pathway_views(page, screenshots, "desktop-light")

    # Two findings share one visual protein pair; preserve their original paper identities.
    fragment = "entity=protein-trem2&claim=claim-trem2-apoe-binding"
    parts = urlsplit(base_url)
    page.goto(urlunsplit((parts.scheme, parts.netloc, parts.path, parts.query, fragment)), wait_until="networkidle")
    assert_claim(page, "claim-trem2-apoe-binding")
    page.locator(".claim-button").filter(has_text="Bailey et al. 2015 · Wild-type TREM2").click()
    assert_claim(page, "claim-bailey-trem2-apoe-binding")
    page.wait_for_timeout(650)
    capture_scene(page, screenshots, "desktop-exact-binding-claim")
    theme = page.get_by_role("combobox", name="Color theme", exact=True)
    theme.focus()
    theme.press("End")
    theme.press("Enter")
    expect(theme).to_have_value("dark")
    assert_claim(page, "claim-bailey-trem2-apoe-binding")
    capture_scene(page, screenshots, "desktop-dark-exact-binding-claim")
    export_share_image(page, "graph-visual-binding", screenshots)
    assert_idle(page, "Desktop selected relationship and PNG capture")
    assert not errors, errors
    expected_origin = urlsplit(base_url).netloc
    assert all(urlsplit(url).netloc == expected_origin or url.startswith(("data:", "blob:")) for url in requests), requests
    context.close()
    print("PASS: real canvas gene/protein/pathway picking, exact source claims, selected relationship screenshots, keyboard theme and PNG capture.")


def check_mobile(browser, base_url: str, screenshots: Path) -> None:
    context = browser.new_context(viewport={"width": 360, "height": 844}, color_scheme="dark",
                                  reduced_motion="reduce", is_mobile=True, has_touch=True)
    context.add_init_script(RENDER_COUNTERS)
    page = context.new_page()
    errors = []
    page.on("pageerror", lambda error: errors.append(str(error)))
    page.goto(base_url, wait_until="networkidle")
    assert page.evaluate("matchMedia('(prefers-reduced-motion: reduce)').matches")
    assert_legend(page)
    pathway_views(page, screenshots, "mobile-dark-reduced-motion")
    select_entity(page, "gene-col1a1", "COL1A1")
    page.get_by_role("button", name="View evidence", exact=True).tap()
    page.locator(".claim-button").filter(has_text="Annotated to · Scavenger-receptor binding and uptake").tap()
    assert_claim(page, "claim-col1a1-scavenger-gene-set")
    page.get_by_role("button", name="View Scavenger-receptor binding and uptake", exact=True).tap()
    expect(page.locator(".claim-button[aria-pressed=true]")).to_have_text("Annotated gene · COL1A1")
    assert_claim(page, "claim-col1a1-scavenger-gene-set")
    page.get_by_role("button", name="Back to graph", exact=True).tap()
    capture_scene(page, screenshots, "mobile-gene-annotation-selected")
    for name in ["Zoom in", "Zoom out", "Reset view"]:
        before = page.evaluate("window.__browserQA.draws")
        page.get_by_role("button", name=name, exact=True).tap()
        page.wait_for_function("before => window.__browserQA.draws > before", arg=before)
    assert_idle(page, "Mobile reduced-motion zoom/reset")
    assert not errors, errors
    context.close()
    print("PASS: 360px real 3D pathway views, reduced motion, gene-level annotation source navigation and zoom/reset.")


def check_fallback(browser, base_url: str, screenshots: Path) -> None:
    context = browser.new_context(viewport={"width": 360, "height": 844}, reduced_motion="reduce")
    context.add_init_script("""const original = HTMLCanvasElement.prototype.getContext;
        HTMLCanvasElement.prototype.getContext = function(kind, ...args) {
            return kind.startsWith('webgl') ? null : original.call(this, kind, ...args);
        };""")
    page = context.new_page()
    page.goto(base_url, wait_until="networkidle")
    expect(page.locator(".fallback-notice")).to_be_visible()
    expect(page.get_by_role("button", name="Graph view", exact=True)).to_be_disabled()
    for entity_id, label in [("gene-apoe", "APOE"), ("protein-apoe", "APOE protein"), PATHWAYS[0]]:
        row = page.locator(f'.entity-row[data-entity-id="{entity_id}"]')
        row.focus()
        row.press("Enter")
        expect(page.locator(".selected-title")).to_have_text(label)
    page.get_by_role("button", name="View evidence", exact=True).click()
    page.locator(".claim-button").filter(has_text="Participant · APOE protein").click()
    assert_claim(page, "claim-apoe-cholesterol-pathway")
    assert page.evaluate("document.documentElement.scrollWidth <= innerWidth")
    page.screenshot(path=str(screenshots / "mobile-webgl-fallback-pathway.png"), full_page=True)
    context.close()
    print("PASS: unavailable WebGL preserves keyboard gene/protein/pathway selection and exact pathway citation.")


def run(base_url: str, executable: str, screenshots: Path) -> None:
    screenshots.mkdir(parents=True, exist_ok=True)
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(executable_path=executable, headless=True,
            args=["--no-sandbox", "--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"])
        check_desktop(browser, base_url, screenshots)
        check_mobile(browser, base_url, screenshots)
        check_fallback(browser, base_url, screenshots)
        browser.close()


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--url", default="http://127.0.0.1:5210/")
    parser.add_argument("--chromium", default="/usr/bin/chromium")
    parser.add_argument("--screenshots", type=Path, default=Path("artifacts/graph-visual"))
    options = parser.parse_args()
    run(options.url, options.chromium, options.screenshots)
