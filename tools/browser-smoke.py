"""Optional browser QA using Python Playwright and a system Chromium.

Run against an already-started dev or preview server. No npm browser dependency
is installed, and no publication links are visited by these checks. Rendering
counters are injected into the test browser only; production has no QA hooks.
"""

import argparse
import json
from pathlib import Path
import re
import struct
from urllib.parse import parse_qs, urlsplit, urlunsplit

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


def export_share_image(page: Page, label: str, screenshots: Path, *, touch: bool = False) -> bytes:
    trigger = page.get_by_role("button", name="Share", exact=True)
    trigger.tap() if touch else trigger.click()
    dialog = page.get_by_role("dialog", name="Share this view", exact=True)
    expect(dialog).to_be_visible()
    preview = dialog.get_by_role("img", name="Share image preview", exact=True)
    expect(preview).to_be_visible(timeout=10000)
    assert preview.evaluate("image => image.complete && image.naturalWidth === 1200 && image.naturalHeight >= 800")
    # Decode the real PNG preview and sample its pixels. A blank WebGL capture
    # must not pass merely because an image element or download link exists.
    image_pixels = preview.evaluate("""async image => {
        await image.decode();
        const canvas = document.createElement('canvas');
        canvas.width = image.naturalWidth;
        canvas.height = image.naturalHeight;
        const context = canvas.getContext('2d');
        context.drawImage(image, 0, 0);
        const { data } = context.getImageData(0, 0, canvas.width, canvas.height);
        const colors = new Set();
        let visible = 0;
        for (let pixel = 0; pixel < data.length; pixel += 64) {
            if (data[pixel + 3]) visible += 1;
            colors.add(`${data[pixel]},${data[pixel + 1]},${data[pixel + 2]}`);
        }
        return { colors: colors.size, visible };
    }""")
    assert image_pixels["visible"] > 10000, image_pixels
    assert image_pixels["colors"] > 40, image_pixels
    download_control = dialog.get_by_role("link", name="Download PNG", exact=True)
    expect(download_control).to_be_visible()
    if touch:
        assert_touch_target(download_control)
    with page.expect_download() as pending_download:
        download_control.tap() if touch else download_control.click()
    download = pending_download.value
    assert download.suggested_filename.endswith(".png")
    destination = screenshots / f"share-{label}.png"
    download.save_as(destination)
    png = destination.read_bytes()
    assert png[:8] == b"\x89PNG\r\n\x1a\n", "The downloaded file is not a PNG"
    assert png[12:16] == b"IHDR"
    width, height = struct.unpack(">II", png[16:24])
    assert width == 1200 and height >= 800, (width, height)
    assert len(png) > 12000, "The share image unexpectedly contains very little content"
    assert page.evaluate("document.documentElement.scrollWidth <= innerWidth")
    dialog_box = dialog.bounding_box()
    assert dialog_box is not None
    assert dialog_box["x"] >= 0 and dialog_box["x"] + dialog_box["width"] <= page.viewport_size["width"] + 1
    page.screenshot(path=str(screenshots / f"share-{label}-dialog.png"), full_page=True)
    page.keyboard.press("Escape")
    expect(dialog).not_to_be_visible()
    expect(trigger).to_be_focused()
    return png


def assert_share_links(browser, base_url: str, screenshots: Path) -> None:
    context = browser.new_context(viewport={"width": 1440, "height": 1000})
    context.add_init_script("""
        window.__copiedLink = null;
        Object.defineProperty(navigator, 'clipboard', { configurable: true, value: {
            writeText: async text => { window.__copiedLink = text; }
        } });
    """)
    page = context.new_page()
    errors: list[str] = []
    page.on("pageerror", lambda error: errors.append(str(error)))
    parts = urlsplit(base_url)
    # Unrelated URL parameters must not leak into the copied share link.
    page.goto(urlunsplit((parts.scheme, parts.netloc, parts.path, "utm_source=preview&unrelated=omit-me", "")), wait_until="networkidle")
    expect(page.locator(".selected-title")).to_have_text("APOE")
    page.get_by_role("button", name="APOE ε2/ε3 genotype", exact=True).click()
    page.get_by_role("button", name="List view", exact=True).click()
    page.get_by_role("combobox", name="Filter by entity type").select_option("gene")
    page.get_by_role("combobox", name="Search entities").fill("APOE")
    page.get_by_role("button", name="Share", exact=True).click()
    dialog = page.get_by_role("dialog", name="Share this view", exact=True)
    field = dialog.get_by_role("textbox", name="Link to this view", exact=True)
    expect(field).to_be_visible()
    assert field.evaluate("element => element.readOnly")
    link = field.input_value()
    parsed = urlsplit(link)
    assert parsed.scheme == parts.scheme and parsed.netloc == parts.netloc and parsed.path == parts.path
    assert not parsed.query, "Unrelated query parameters must not enter a shared URL"
    assert parse_qs(parsed.fragment) == {
        "entity": ["gene-apoe"], "claim": ["claim-apoe-e2-risk"], "q": ["APOE"], "type": ["gene"], "view": ["list"]
    }
    dialog.get_by_role("button", name="Copy link", exact=True).click()
    expect(dialog.get_by_role("button", name="Copied", exact=True)).to_be_visible()
    expect(dialog.locator(".copy-status")).to_have_text("Link copied.")
    assert page.evaluate("window.__copiedLink") == link
    page.keyboard.press("Escape")

    # Permission denial must leave a usable, selected manual-copy field.
    page.evaluate("""Object.defineProperty(navigator, 'clipboard', { configurable: true, value: {
        writeText: async () => { throw new DOMException('Denied', 'NotAllowedError'); }
    } })""")
    page.get_by_role("button", name="Share", exact=True).click()
    dialog.get_by_role("button", name="Copy link", exact=True).click()
    expect(dialog.locator(".copy-status")).to_have_text("Copy the selected link to share this view.")
    expect(field).to_be_focused()
    assert field.evaluate("element => element.selectionStart === 0 && element.selectionEnd === element.value.length")
    expect(dialog.get_by_role("alert")).to_have_count(0)
    expect(dialog.get_by_role("img", name="Share image preview", exact=True)).to_be_visible(timeout=10000)
    page.screenshot(path=str(screenshots / "share-link-dialog.png"), full_page=True)

    restored = context.new_page()
    restored.on("pageerror", lambda error: errors.append(str(error)))
    restored.goto(link, wait_until="networkidle")

    def expect_apoe_link_state() -> None:
        expect(restored.locator(".selected-title")).to_have_text("APOE")
        expect(restored.get_by_role("button", name="APOE ε2/ε3 genotype", exact=True)).to_have_attribute("aria-pressed", "true")
        expect(restored.get_by_role("combobox", name="Search entities")).to_have_value("APOE")
        expect(restored.get_by_role("combobox", name="Filter by entity type")).to_have_value("gene")
        expect(restored.get_by_role("button", name="List view", exact=True)).to_have_attribute("aria-pressed", "true")
        expect(restored.locator(".entity-row")).to_have_count(1)
        expect(restored.locator(".source-link")).to_have_attribute("href", "https://pubmed.ncbi.nlm.nih.gov/7920638/")

    expect_apoe_link_state()
    restored.reload(wait_until="networkidle")
    expect_apoe_link_state()
    restored.evaluate("location.hash = 'entity=gene-trem2&claim=claim-trem2-r47h-risk'")
    expect(restored.locator(".selected-title")).to_have_text("TREM2")
    expect(restored.get_by_role("combobox", name="Search entities")).to_have_value("")
    expect(restored.get_by_role("combobox", name="Filter by entity type")).to_have_value("all")
    expect(restored.get_by_role("button", name="Graph view", exact=True)).to_have_attribute("aria-pressed", "true")
    expect(restored.locator(".source-link")).to_have_attribute("href", "https://pubmed.ncbi.nlm.nih.gov/23150908/")
    restored.go_back(wait_until="domcontentloaded")
    expect_apoe_link_state()

    # A claim belonging to another entity and unknown IDs cannot restore stale state.
    for fragment in ["entity=gene-apoe&claim=claim-trem2-r47h-risk", "entity=does-not-exist"]:
        restored.evaluate("fragment => { location.hash = fragment; }", fragment)
        expect(restored.locator(".selected-title")).to_have_text("APOE")
        expect(restored.get_by_role("combobox", name="Search entities")).to_have_value("")
        expect(restored.get_by_role("combobox", name="Filter by entity type")).to_have_value("all")
        expect(restored.get_by_role("button", name="Graph view", exact=True)).to_have_attribute("aria-pressed", "true")
        expect(restored.locator(".source-link")).to_have_attribute("href", "https://pubmed.ncbi.nlm.nih.gov/8346443/")
    restored.reload(wait_until="networkidle")
    expect(restored.locator(".selected-title")).to_have_text("APOE")
    assert not errors, errors
    context.close()
    print("PASS: share links restore entity, finding, query, filter, and view across reload/hash/back; invalid links fall back safely and denied clipboard supports manual copying.")


def assert_export_retry(browser, base_url: str, screenshots: Path) -> None:
    context = browser.new_context(viewport={"width": 1280, "height": 900})
    context.add_init_script("""
        window.__originalToBlob = HTMLCanvasElement.prototype.toBlob;
        HTMLCanvasElement.prototype.toBlob = function(callback) { callback(null); };
    """)
    page = context.new_page()
    errors: list[str] = []
    page.on("pageerror", lambda error: errors.append(str(error)))
    page.goto(base_url, wait_until="networkidle")
    expect(page.locator("canvas")).to_be_visible()
    page.get_by_role("button", name="Share", exact=True).click()
    dialog = page.get_by_role("dialog", name="Share this view", exact=True)
    expect(dialog.get_by_role("alert")).to_contain_text("Couldn’t create the image. Try again.")
    expect(dialog.get_by_role("link", name="Download PNG", exact=True)).to_have_count(0)
    expect(dialog.get_by_role("textbox", name="Link to this view", exact=True)).not_to_have_value("")
    page.evaluate("() => { HTMLCanvasElement.prototype.toBlob = window.__originalToBlob; }")
    dialog.get_by_role("button", name="Retry", exact=True).click()
    preview = dialog.get_by_role("img", name="Share image preview", exact=True)
    expect(preview).to_be_visible(timeout=10000)
    assert preview.evaluate("image => image.complete && image.naturalWidth === 1200 && image.naturalHeight >= 800")
    expect(dialog.get_by_role("alert")).to_have_count(0)
    with page.expect_download() as pending_download:
        dialog.get_by_role("link", name="Download PNG", exact=True).click()
    destination = screenshots / "share-retried.png"
    pending_download.value.save_as(destination)
    png = destination.read_bytes()
    assert png[:8] == b"\x89PNG\r\n\x1a\n" and len(png) > 12000
    page.keyboard.press("Escape")
    expect(dialog).not_to_be_visible()
    expect(page.get_by_role("button", name="Share", exact=True)).to_be_focused()
    assert not errors, errors
    context.close()
    print("PASS: PNG encoding failure shows Retry without losing the share link; retry creates a real downloadable PNG.")


def assert_text_contrast(control: Locator, *, pseudo: str | None = None, minimum: float = 4.5) -> None:
    # Measure the settled palette after finite control/theme transitions.
    control.evaluate("""element => Promise.all(element.getAnimations()
        .filter(animation => animation.playState === 'running' && animation.effect.getTiming().iterations !== Infinity)
        .map(animation => animation.finished.catch(() => {})))""")
    colors = control.evaluate("""(element, pseudo) => {
        const parse = value => {
            const values = value.match(/[\\d.]+/g).map(Number);
            return [values[0], values[1], values[2], values[3] ?? 1];
        };
        const blend = (foreground, background) => foreground.slice(0, 3)
            .map((value, index) => value * foreground[3] + background[index] * (1 - foreground[3]));
        const ancestors = [];
        for (let current = element; current; current = current.parentElement) ancestors.unshift(current);
        let background = [255, 255, 255];
        for (const ancestor of ancestors) background = blend(parse(getComputedStyle(ancestor).backgroundColor), background);
        const foreground = blend(parse(getComputedStyle(element, pseudo).color), background);
        const luminance = color => color.map(value => value / 255)
            .map(value => value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4)
            .reduce((result, value, index) => result + value * [0.2126, 0.7152, 0.0722][index], 0);
        const [low, high] = [luminance(foreground), luminance(background)].sort((a, b) => a - b);
        return { foreground, background, ratio: (high + 0.05) / (low + 0.05) };
    }""", pseudo)
    assert colors["ratio"] >= minimum, f"Insufficient tested text contrast ({minimum} required): {colors}"


def assert_themes(browser, base_url: str, screenshots: Path) -> None:
    key = "discovery-galaxy:theme"
    context = browser.new_context(viewport={"width": 1440, "height": 1000}, color_scheme="light")
    context.add_init_script(RENDER_COUNTERS)
    page = context.new_page()
    errors: list[str] = []
    page.on("pageerror", lambda error: errors.append(str(error)))
    page.goto(base_url, wait_until="networkidle")
    theme = page.get_by_role("combobox", name="Color theme", exact=True)
    expect(theme).to_have_value("system")
    expect(page.locator("html")).to_have_attribute("data-theme", "light")
    expect(page.locator("canvas")).to_be_visible(timeout=10000)
    assert page.evaluate("localStorage.getItem('discovery-galaxy:theme')") is None
    page.screenshot(path=str(screenshots / "desktop-light.png"), full_page=True)

    def assert_palette(mode: str) -> None:
        expect(page.locator("html")).to_have_attribute("data-theme", mode)
        expect(page.locator("html")).to_have_attribute("data-theme-preference", mode)
        for selector in [".selected-title", ".finding-statement", ".source-title", ".source-meta", ".data-status", ".claim-button"]:
            assert_text_contrast(page.locator(selector).first)
        assert_text_contrast(page.get_by_role("combobox", name="Search entities"))
        assert_text_contrast(page.get_by_role("combobox", name="Search entities"), pseudo="::placeholder")
        assert_text_contrast(page.get_by_role("combobox", name="Filter by entity type"))
        assert_text_contrast(theme)
        theme.focus()
        focus = theme.evaluate("element => { const style = getComputedStyle(element); return { width: parseFloat(style.outlineWidth), style: style.outlineStyle, color: style.outlineColor }; }")
        assert focus["width"] >= 2 and focus["style"] != "none", focus

    # OS changes follow System, while explicit settings persist and take priority.
    theme.select_option("dark")
    assert_palette("dark")
    assert page.evaluate("getComputedStyle(document.documentElement).backgroundColor") == "rgb(31, 31, 36)"
    expect(page.locator('meta[name="theme-color"]')).to_have_attribute("content", "#1f1f24", ignore_case=True)
    assert page.evaluate("localStorage.getItem('discovery-galaxy:theme')") == "dark"
    assert_idle(page, "Graph after dark-mode change")
    page.screenshot(path=str(screenshots / "desktop-dark.png"), full_page=True)
    page.emulate_media(color_scheme="dark")
    page.emulate_media(color_scheme="light")
    expect(page.locator("html")).to_have_attribute("data-theme", "dark")
    theme.select_option("system")
    expect(page.locator("html")).to_have_attribute("data-theme", "light")
    page.emulate_media(color_scheme="dark")
    expect(page.locator("html")).to_have_attribute("data-theme", "dark")
    theme.select_option("light")
    assert_palette("light")
    page.emulate_media(color_scheme="light")
    page.emulate_media(color_scheme="dark")
    expect(page.locator("html")).to_have_attribute("data-theme", "light")
    page.reload(wait_until="networkidle")
    expect(theme).to_have_value("light")
    expect(page.locator("html")).to_have_attribute("data-theme", "light")

    # Real same-origin storage events synchronize other tabs without changing
    # the operating-system setting of either page.
    other = context.new_page()
    other.on("pageerror", lambda error: errors.append(str(error)))
    other.goto(base_url, wait_until="networkidle")
    expect(other.get_by_role("combobox", name="Color theme", exact=True)).to_have_value("light")
    theme.select_option("dark")
    expect(other.locator("html")).to_have_attribute("data-theme", "dark")
    expect(other.get_by_role("combobox", name="Color theme", exact=True)).to_have_value("dark")
    other.get_by_role("combobox", name="Color theme", exact=True).select_option("system")
    expect(theme).to_have_value("system")
    expect(page.locator("html")).to_have_attribute("data-theme", "dark")
    expect(other.locator("html")).to_have_attribute("data-theme", "light")
    other.close()

    # Theme is presentation state: changing it must preserve the research view.
    page.get_by_role("button", name="TREM2", exact=True).click()
    page.get_by_role("button", name="List view", exact=True).click()
    page.get_by_role("combobox", name="Filter by entity type").select_option("gene")
    page.get_by_role("combobox", name="Search entities").fill("TREM2")
    theme.select_option("light")
    theme.select_option("dark")
    expect(page.locator(".selected-title")).to_have_text("TREM2")
    expect(page.get_by_role("combobox", name="Search entities")).to_have_value("TREM2")
    expect(page.get_by_role("combobox", name="Filter by entity type")).to_have_value("gene")
    expect(page.get_by_role("button", name="List view", exact=True)).to_have_attribute("aria-pressed", "true")
    expect(page.locator(".entity-row")).to_have_count(1)
    assert_text_contrast(page.locator(".entity-row-text strong"))
    assert_text_contrast(page.locator(".row-type"))
    page.screenshot(path=str(screenshots / "list-dark.png"), full_page=True)
    page.get_by_role("button", name="About the data").click()
    about = page.get_by_role("dialog", name="About this dataset", exact=True)
    for selector in ["h2", "p", "li", "dt", "dd"]:
        assert_text_contrast(about.locator(selector).first)
    page.keyboard.press("Escape")
    page.get_by_role("button", name="Share", exact=True).click()
    dialog = page.get_by_role("dialog", name="Share this view", exact=True)
    preview = dialog.get_by_role("img", name="Share image preview", exact=True)
    expect(preview).to_be_visible(timeout=10000)
    for control in [dialog.locator("h2"), dialog.get_by_role("textbox", name="Link to this view"), dialog.get_by_role("button", name="Copy link", exact=True), dialog.get_by_role("link", name="Download PNG", exact=True)]:
        assert_text_contrast(control)
    assert preview.evaluate("""async image => {
        await image.decode();
        const canvas = document.createElement('canvas'); canvas.width = 1; canvas.height = 1;
        const context = canvas.getContext('2d'); context.drawImage(image, 0, 0);
        return [...context.getImageData(0, 0, 1, 1).data].join(',') === '245,246,244,255';
    }"""), "Share images intentionally keep their readable light citation-card palette"
    page.screenshot(path=str(screenshots / "dialog-dark.png"), full_page=True)
    page.keyboard.press("Escape")
    export_share_image(page, "dark-list", screenshots)
    assert not errors, errors
    context.close()

    # Withhold the application module: the head bootstrap must resolve the
    # preference and browser chrome color before React is allowed to run.
    bootstrap = browser.new_context(color_scheme="dark")
    bootstrap.add_init_script("localStorage.setItem('discovery-galaxy:theme', 'invalid-value')")
    bootstrap.route("**/src/main.tsx*", lambda route: route.fulfill(status=200, content_type="application/javascript", body="/* application withheld by theme QA */"))
    bootstrap.route("**/assets/index-*.js*", lambda route: route.fulfill(status=200, content_type="application/javascript", body="/* application withheld by theme QA */"))
    first_paint = bootstrap.new_page()
    first_paint.goto(base_url, wait_until="networkidle")
    expect(first_paint.locator("html")).to_have_attribute("data-theme", "dark")
    expect(first_paint.locator("html")).to_have_attribute("data-theme-preference", "system")
    assert first_paint.evaluate("getComputedStyle(document.documentElement).backgroundColor") == "rgb(31, 31, 36)"
    expect(first_paint.locator('meta[name="theme-color"]')).to_have_attribute("content", "#1f1f24", ignore_case=True)
    assert first_paint.locator("#root").inner_html() == ""
    bootstrap.close()

    blocked = browser.new_context(viewport={"width": 1280, "height": 900}, color_scheme="dark")
    blocked.add_init_script("""Object.defineProperty(window, 'localStorage', { configurable: true,
        get() { throw new DOMException('Storage disabled by test', 'SecurityError'); }
    });""")
    blocked_page = blocked.new_page()
    blocked_errors: list[str] = []
    blocked_page.on("pageerror", lambda error: blocked_errors.append(str(error)))
    blocked_page.goto(base_url, wait_until="networkidle")
    blocked_theme = blocked_page.get_by_role("combobox", name="Color theme", exact=True)
    expect(blocked_theme).to_have_value("system")
    expect(blocked_page.locator("html")).to_have_attribute("data-theme", "dark")
    blocked_theme.select_option("light")
    expect(blocked_page.locator("html")).to_have_attribute("data-theme", "light")
    blocked_page.reload(wait_until="networkidle")
    expect(blocked_theme).to_have_value("system")
    expect(blocked_page.locator("html")).to_have_attribute("data-theme", "dark")
    assert not blocked_errors, blocked_errors
    blocked.close()

    mobile = browser.new_context(viewport={"width": 360, "height": 800}, color_scheme="dark", reduced_motion="reduce", is_mobile=True, has_touch=True)
    mobile_page = mobile.new_page()
    mobile_errors: list[str] = []
    mobile_page.on("pageerror", lambda error: mobile_errors.append(str(error)))
    mobile_page.goto(base_url, wait_until="networkidle")
    mobile_theme = mobile_page.get_by_role("combobox", name="Color theme", exact=True)
    expect(mobile_theme).to_have_value("system")
    expect(mobile_page.locator("html")).to_have_attribute("data-theme", "dark")
    assert_touch_target(mobile_theme)
    assert mobile_page.evaluate("document.documentElement.scrollWidth <= innerWidth")
    for selector in [".brand", ".data-status", ".theme-control"]:
        box = mobile_page.locator(selector).bounding_box()
        assert box is not None and box["x"] >= 0 and box["x"] + box["width"] <= 360, (selector, box)
    mobile_theme.select_option("light")
    expect(mobile_page.locator("html")).to_have_attribute("data-theme", "light")
    mobile_theme.select_option("dark")
    expect(mobile_page.locator("html")).to_have_attribute("data-theme", "dark")
    mobile_page.screenshot(path=str(screenshots / "mobile-360-dark.png"), full_page=True)
    assert not mobile_errors, mobile_errors
    mobile.close()

    fallback = browser.new_context(viewport={"width": 1280, "height": 900}, color_scheme="dark")
    fallback.add_init_script("""
        const original = HTMLCanvasElement.prototype.getContext;
        HTMLCanvasElement.prototype.getContext = function(kind, ...args) {
            return kind.startsWith('webgl') ? null : original.call(this, kind, ...args);
        };
    """)
    fallback_page = fallback.new_page()
    fallback_page.goto(base_url, wait_until="networkidle")
    expect(fallback_page.locator("html")).to_have_attribute("data-theme", "dark")
    expect(fallback_page.locator(".fallback-notice")).to_be_visible()
    assert_text_contrast(fallback_page.locator(".fallback-notice"))
    assert_text_contrast(fallback_page.locator(".entity-row-text strong").first)
    fallback_page.screenshot(path=str(screenshots / "fallback-dark.png"), full_page=True)
    fallback.close()
    print("PASS: light/dark/system themes, pre-App initialization, persistence, OS and cross-tab changes, blocked storage, view preservation, tested text contrast, 360px touch layout, dark dialogs/list/fallback, and light PNG palette.")


def assert_comparisons(browser, base_url: str, screenshots: Path) -> None:
    context = browser.new_context(viewport={"width": 1440, "height": 1000}, reduced_motion="reduce")
    context.add_init_script(RENDER_COUNTERS)
    page = context.new_page()
    errors: list[str] = []
    page.on("pageerror", lambda error: errors.append(str(error)))
    page.goto(base_url, wait_until="networkidle")
    expect(page.locator(".selected-title")).to_have_text("APOE")
    trigger = page.get_by_role("button", name="Compare findings", exact=True)
    trigger.focus()
    before_scroll = page.evaluate("window.scrollY")
    page.keyboard.press("Enter")
    dialog = page.get_by_role("dialog", name="Compare findings", exact=True)
    expect(dialog).to_be_visible()
    first = dialog.get_by_role("combobox", name="Finding A", exact=True)
    second = dialog.get_by_role("combobox", name="Finding B", exact=True)
    expect(first).to_have_value("claim-apoe-e4-risk")
    expect(second).to_have_value("claim-apoe-e2-risk")
    expect(dialog.locator(".comparison-finding")).to_have_count(2)
    expect(dialog).to_contain_text("APOE ε4 allele count")
    expect(dialog).to_contain_text("APOE ε2/ε3 genotype")
    variant = dialog.get_by_role("rowheader", name=re.compile(r"^Variant\b")).locator("..")
    expect(variant.locator(".context-status")).to_have_attribute("data-state", "different")
    assert "conflicting evidence" not in dialog.inner_text().lower()
    interpretation = dialog.get_by_text("Interpretation and source checks", exact=True)
    interpretation.click()
    assert "independen" in dialog.inner_text().lower()
    expect(dialog.locator(".comparison-summary")).to_contain_text("do not establish agreement or contradiction")
    interpretation.click()
    urls = set(dialog.locator('a[href^="https://pubmed.ncbi.nlm.nih.gov/"]').evaluate_all("links => links.map(link => link.href)"))
    assert urls == {"https://pubmed.ncbi.nlm.nih.gov/8346443/", "https://pubmed.ncbi.nlm.nih.gov/7920638/"}, urls
    assert first.locator('option[value="claim-apoe-e2-risk"]').evaluate("option => option.disabled")
    assert second.locator('option[value="claim-apoe-e4-risk"]').evaluate("option => option.disabled")
    page.screenshot(path=str(screenshots / "comparison-apoe-light.png"), full_page=True)

    # Keep TREM2's sequenced discovery count separate from total sample size.
    second.select_option("claim-trem2-r47h-risk")
    first.select_option("claim-abca1-n1800h-risk")
    sample = dialog.get_by_role("rowheader", name=re.compile(r"^Sample size\b")).locator("..")
    expect(sample).to_contain_text("92,726")
    expect(sample).to_contain_text("Not recorded")
    sequenced = dialog.get_by_role("rowheader", name=re.compile(r"^Sequenced discovery individuals\b")).locator("..")
    expect(sequenced).to_contain_text("2,261")
    expect(sequenced).to_contain_text("Not recorded")
    population = dialog.get_by_role("rowheader", name=re.compile(r"^Population\b")).locator("..")
    expect(population).to_contain_text("Claim scope")
    expect(population).to_contain_text("92,726 general-population participants in the AD analysis")
    expect(population).to_contain_text("General-population participants")
    urls = set(dialog.locator('a[href^="https://pubmed.ncbi.nlm.nih.gov/"]').evaluate_all("links => links.map(link => link.href)"))
    assert urls == {"https://pubmed.ncbi.nlm.nih.gov/26079414/", "https://pubmed.ncbi.nlm.nih.gov/23150908/"}, urls
    download = dialog.get_by_role("link", name="Download comparison", exact=True)
    expect(download).to_be_visible()
    with page.expect_download() as pending_download:
        download.click()
    assert pending_download.value.suggested_filename.endswith(".md")
    destination = screenshots / "comparison-abca1-trem2.md"
    pending_download.value.save_as(destination)
    brief = destination.read_text()
    for text in ["alzheimers-source-checked-0.5.0", "claim-abca1-n1800h-risk", "claim-trem2-r47h-risk",
                 "https://pubmed.ncbi.nlm.nih.gov/26079414/", "https://pubmed.ncbi.nlm.nih.gov/23150908/",
                 "Draft comparison", "Study-specific context", "independence"]:
        assert text in brief, text
    assert "- sample size: 92726" in brief
    trem2_brief = brief.split("## TREM2", 1)[1]
    assert "- sample size: Not recorded" in trem2_brief
    assert "- sequenced discovery individuals: 2261" in trem2_brief
    assert "Evidence limitations" in trem2_brief and "Evidence review: draft" in trem2_brief
    page.keyboard.press("Escape")
    expect(dialog).not_to_be_visible()
    expect(trigger).to_be_focused()
    assert abs(page.evaluate("window.scrollY") - before_scroll) <= 2
    expect(page.locator(".selected-title")).to_have_text("APOE")
    expect(page.get_by_role("button", name="APOE ε4 allele count", exact=True)).to_have_attribute("aria-pressed", "true")
    expect(page.get_by_role("combobox", name="Search entities")).to_have_value("")
    expect(page.get_by_role("combobox", name="Filter by entity type")).to_have_value("all")
    expect(page.get_by_role("button", name="Graph view", exact=True)).to_have_attribute("aria-pressed", "true")
    assert_idle(page, "Graph after comparison")

    page.get_by_role("combobox", name="Color theme", exact=True).select_option("dark")
    trigger.click()
    expect(dialog).to_be_visible()
    dialog.get_by_text("Interpretation and source checks", exact=True).click()
    assert_text_contrast(dialog.locator(".comparison-summary"))
    assert_text_contrast(dialog.get_by_role("combobox", name="Finding A", exact=True))
    page.screenshot(path=str(screenshots / "comparison-dark.png"), full_page=True)
    page.keyboard.press("Escape")
    assert not errors, errors
    context.close()

    mobile = browser.new_context(viewport={"width": 360, "height": 844}, reduced_motion="reduce", is_mobile=True, has_touch=True, color_scheme="dark")
    mobile_page = mobile.new_page()
    mobile_errors: list[str] = []
    mobile_page.on("pageerror", lambda error: mobile_errors.append(str(error)))
    mobile_page.goto(base_url, wait_until="networkidle")
    mobile_page.get_by_role("button", name="TREM2", exact=True).tap()
    mobile_trigger = mobile_page.get_by_role("button", name="Compare findings", exact=True)
    mobile_trigger.scroll_into_view_if_needed()
    assert_touch_target(mobile_trigger)
    mobile_scroll = mobile_page.evaluate("window.scrollY")
    mobile_trigger.tap()
    mobile_dialog = mobile_page.get_by_role("dialog", name="Compare findings", exact=True)
    expect(mobile_dialog).to_be_visible()
    expect(mobile_dialog.get_by_role("combobox", name="Finding A", exact=True)).to_have_value("claim-trem2-r47h-risk")
    mobile_page.screenshot(path=str(screenshots / "comparison-mobile-360-dark.png"))
    for label in ["Finding A", "Finding B"]:
        control = mobile_dialog.get_by_role("combobox", name=label, exact=True)
        assert_touch_target(control)
        assert control.evaluate("element => parseFloat(getComputedStyle(element).fontSize) >= 16")
    table = mobile_dialog.locator(".comparison-table-wrap")
    assert table.evaluate("element => element.scrollWidth > element.clientWidth")
    table.focus()
    expect(table).to_be_focused()
    mobile_page.keyboard.press("ArrowRight")
    mobile_page.wait_for_timeout(160)
    assert table.evaluate("element => element.scrollLeft > 0")
    assert mobile_page.evaluate("document.documentElement.scrollWidth <= innerWidth")
    bounds = mobile_dialog.bounding_box()
    assert bounds is not None and bounds["x"] >= 0 and bounds["x"] + bounds["width"] <= 360
    # Full-page screenshots resize mobile emulation and can move document scroll;
    # capture the real viewport before checking dialog dismissal behavior.
    mobile_page.screenshot(path=str(screenshots / "comparison-mobile-table-360-dark.png"))
    mobile_page.keyboard.press("Escape")
    expect(mobile_trigger).to_be_focused()
    assert abs(mobile_page.evaluate("window.scrollY") - mobile_scroll) <= 2
    assert not mobile_errors, mobile_errors
    mobile.close()

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
    fallback_page.get_by_role("button", name="Compare findings", exact=True).click()
    fallback_dialog = fallback_page.get_by_role("dialog", name="Compare findings", exact=True)
    expect(fallback_dialog).to_be_visible()
    expect(fallback_dialog.get_by_role("combobox", name="Finding B", exact=True)).to_have_value("claim-apoe-e2-risk")
    expect(fallback_dialog.get_by_role("link", name="Download comparison", exact=True)).to_be_visible()
    fallback_page.screenshot(path=str(screenshots / "comparison-fallback.png"), full_page=True)
    fallback.close()
    print("PASS: comparison preserves variant/source scope and unknown samples, downloads a cited draft brief, keeps explorer state, supports keyboard/mobile/dark/WebGL fallback, and returns focus without page scrolling.")


def assert_pathways(browser, base_url: str, screenshots: Path) -> None:
    desktop = browser.new_context(viewport={"width": 1440, "height": 1000}, color_scheme="light")
    desktop.add_init_script(RENDER_COUNTERS)
    page = desktop.new_page()
    errors = []
    page.on("pageerror", lambda error: errors.append(str(error)))
    page.goto(base_url, wait_until="networkidle")
    expect(page.locator(".result-status")).to_have_text("24 entities · 7 papers")
    page.get_by_role("combobox", name="Filter by entity type").select_option("gene")
    page.locator(".claim-button").filter(has_text="Encodes · APOE protein").click()
    expect(page.locator(".source-card")).to_contain_text("Database annotation")
    expect(page.locator(".source-card")).not_to_contain_text("Original paper")
    expect(page.locator(".source-link")).to_have_attribute("href", "https://rest.uniprot.org/uniprotkb/P02649.txt")
    page.get_by_role("button", name="View APOE protein", exact=True).focus()
    page.keyboard.press("Enter")
    expect(page.locator(".selected-title")).to_have_text("APOE protein")
    expect(page.locator(".selected-title")).to_be_focused()
    expect(page.get_by_role("combobox", name="Filter by entity type")).to_have_value("all")
    expect(page.locator(".claim-button").filter(has_text="Encoded by · APOE")).to_be_visible()
    page.locator(".claim-button").filter(has_text="Part of · Cholesterol transport and efflux").click()
    page.get_by_role("button", name="View Cholesterol transport and efflux", exact=True).click()
    expect(page.locator(".selected-title")).to_have_text("Cholesterol transport and efflux")
    assert_text_contrast(page.locator(".entity-symbol").first)
    page.locator(".claim-button").filter(has_text="Participant · ABCA1 protein").click()
    page.get_by_role("button", name="View ABCA1 protein", exact=True).click()
    expect(page.locator(".selected-title")).to_have_text("ABCA1 protein")
    expect(page.locator(".source-link")).to_have_attribute("href", "https://reactome.org/content/detail/R-HSA-194209")
    page.get_by_role("button", name="Study details and limitations").click()
    expect(page.locator(".study-context")).to_contain_text("curated database annotation")
    expect(page.locator(".study-context")).to_contain_text("database release and record revision not captured")
    expect(page.locator(".study-context")).to_contain_text("CC0")
    expect(page.locator(".source-details").get_by_role("link", name="Source terms")).to_have_attribute("href", "https://reactome.org/license")
    expect(page.locator(".source-card")).to_contain_text("ABCA1 [plasma membrane]")
    page.screenshot(path=str(screenshots / "pathway-desktop-light.png"), full_page=True)
    page.get_by_role("combobox", name="Color theme").select_option("dark")
    page.wait_for_timeout(300)
    assert_text_contrast(page.locator(".connection-link").first)
    assert_text_contrast(page.locator(".entity-symbol").first)
    page.screenshot(path=str(screenshots / "pathway-desktop-dark.png"), full_page=True)
    export_share_image(page, "pathway", screenshots)
    assert_idle(page, "Pathway graph after navigation and capture")
    filter_control = page.get_by_role("combobox", name="Filter by entity type")
    page.get_by_role("button", name="List view", exact=True).click()
    for value, count in [("protein", 7), ("pathway", 2)]:
        filter_control.select_option(value)
        expect(page.locator(".entity-row")).to_have_count(count)
    assert not errors, errors
    desktop.close()

    for fallback in [False, True]:
        context = browser.new_context(viewport={"width": 360, "height": 844}, color_scheme="dark", reduced_motion="reduce", is_mobile=True, has_touch=True)
        if fallback:
            context.add_init_script("""
              const original = HTMLCanvasElement.prototype.getContext;
              HTMLCanvasElement.prototype.getContext = function(kind, ...args) {
                return kind.startsWith('webgl') ? null : original.call(this, kind, ...args);
              };
            """)
        mobile = context.new_page()
        mobile.goto(base_url, wait_until="networkidle")
        if fallback:
            expect(mobile.locator(".fallback-notice")).to_be_visible()
        else:
            expect(mobile.locator("canvas")).to_be_visible()
            mobile.screenshot(path=str(screenshots / "pathway-mobile-overview.png"), full_page=True)
        assert mobile.evaluate("document.documentElement.scrollWidth <= innerWidth")
        mobile.get_by_role("button", name="TREM2", exact=True).tap()
        mobile.get_by_role("button", name="View evidence", exact=True).tap()
        mobile.locator(".claim-button").filter(has_text="Encodes · TREM2 protein").tap()
        follow = mobile.get_by_role("button", name="View TREM2 protein", exact=True)
        assert_touch_target(follow)
        follow.tap()
        expect(mobile.locator(".selected-title")).to_have_text("TREM2 protein")
        expect(mobile.locator(".selected-title")).to_be_focused()
        mobile.locator(".claim-button").filter(has_text="Part of · DAP12 signaling").tap()
        mobile.get_by_role("button", name="View DAP12 signaling", exact=True).tap()
        expect(mobile.locator(".selected-title")).to_have_text("DAP12 signaling")
        mobile.locator(".claim-button").filter(has_text="Participant · DAP12 protein").tap()
        mobile.get_by_role("button", name="View DAP12 protein", exact=True).tap()
        expect(mobile.locator(".selected-title")).to_have_text("DAP12 protein")
        mobile.get_by_role("button", name="Study details and limitations").tap()
        expect(mobile.locator(".study-context")).to_contain_text("Y91/Y102")
        mobile.locator(".claim-button").filter(has_text="Interacts with · TREM2 protein").tap()
        expect(mobile.locator(".source-link")).to_have_attribute("href", "https://reactome.org/content/detail/R-HSA-210300")
        mobile.screenshot(path=str(screenshots / f"pathway-mobile-{'fallback' if fallback else 'graph'}.png"), full_page=True)
        context.close()
    print("PASS: typed APOE/ABCA1 and TREM2/DAP12 pathway journeys preserve citations, states, keyboard focus, filters, themes, mobile touch, database PNG export, and WebGL fallback.")


def assert_binding_findings(browser, base_url: str, screenshots: Path) -> None:
    link = f"{base_url}#entity=protein-trem2&claim=claim-trem2-apoe-binding&type=protein"
    context = browser.new_context(viewport={"width": 1440, "height": 1000}, reduced_motion="reduce")
    context.add_init_script(RENDER_COUNTERS)
    page = context.new_page()
    errors = []
    page.on("pageerror", lambda error: errors.append(str(error)))
    page.goto(link, wait_until="networkidle")
    expect(page.locator(".selected-title")).to_have_text("TREM2 protein")
    expect(page.get_by_role("combobox", name="Filter by entity type")).to_have_value("protein")
    expect(page.locator(".finding-statement")).to_contain_text("dot-blot assays")
    expect(page.locator(".source-link")).to_have_attribute("href", "https://pubmed.ncbi.nlm.nih.gov/26374899/")
    expect(page.locator(".source-context")).to_have_text("Cell-free protein assayDot blot")
    for theme in ["light", "dark"]:
        page.get_by_role("combobox", name="Color theme").select_option(theme)
        assert_text_contrast(page.locator(".source-context"))
        page.screenshot(path=str(screenshots / f"binding-{theme}.png"), full_page=True)
    trigger = page.get_by_role("button", name="Compare findings", exact=True)
    trigger.focus()
    page.keyboard.press("Enter")
    dialog = page.get_by_role("dialog", name="Compare findings", exact=True)
    expect(dialog.get_by_role("combobox", name="Finding A")).to_have_value("claim-trem2-apoe-binding")
    expect(dialog.get_by_role("combobox", name="Finding B")).to_have_value("claim-bailey-trem2-apoe-binding")
    expect(dialog.locator(".comparison-source-note")).to_contain_text("No shared publication identifier")
    expect(dialog.locator(".comparison-finding h3").nth(0)).to_contain_text("Atagi et al.")
    expect(dialog.locator(".comparison-finding h3").nth(1)).to_contain_text("Bailey et al.")
    expect(dialog.locator("tbody tr").first).to_contain_text("Experimental system")
    condition = dialog.get_by_role("rowheader", name=re.compile(r"^Binding condition\b")).locator("..")
    expect(condition).to_have_attribute("data-state", "matching")
    replicates = dialog.get_by_role("rowheader", name=re.compile(r"^Assay replicates\b")).locator("..")
    expect(replicates).to_have_attribute("data-state", "matching")
    units = dialog.get_by_role("rowheader", name=re.compile(r"^Replicate unit\b")).locator("..")
    expect(units).to_contain_text("Independent dot blots")
    expect(units).to_contain_text("Triplicate wells")
    sample = dialog.get_by_role("rowheader", name=re.compile(r"^Sample size\b")).locator("..")
    expect(sample.locator(".context-status")).to_have_attribute("data-state", "missing")
    with page.expect_download() as pending:
        dialog.get_by_role("link", name="Download comparison", exact=True).click()
    destination = screenshots / "comparison-binding.md"
    pending.value.save_as(destination)
    brief = destination.read_text()
    for text in ["26374899", "26374897", "Figure 1A", "Figure 5D", "assay replicates: 3", "Triplicate wells", "Publication status: corrected", "Publication notice: https://pmc.ncbi.nlm.nih.gov/articles/PMC4646256/", "alzheimers-source-checked-0.5.0"]:
        assert text in brief, text
    dialog.evaluate("element => { element.scrollTop = 0; }")
    page.screenshot(path=str(screenshots / "comparison-binding-dark.png"), full_page=True)
    # A same-paper comparison still exposes the shared publication identity.
    second = dialog.get_by_role("combobox", name="Finding B")
    first = dialog.get_by_role("combobox", name="Finding A")
    second.select_option("claim-trem2-r47h-apoe-binding")
    expect(dialog.locator(".comparison-source-note")).to_contain_text("shared")
    # Match the recorded R47H condition across the two publications explicitly.
    second.select_option("claim-bailey-trem2-r47h-apoe-binding")
    first.select_option("claim-trem2-r47h-apoe-binding")
    preparation = dialog.get_by_role("rowheader", name=re.compile(r"^Ligand preparation\b")).locator("..")
    expect(preparation.locator(".context-status")).to_have_attribute("data-state", "missing")
    expect(preparation).to_contain_text("isoform not identified")
    expect(preparation).to_contain_text("Not recorded")
    experiments = dialog.get_by_role("rowheader", name=re.compile(r"^Experiments reported\b")).locator("..")
    expect(experiments).to_contain_text("2")
    expect(experiments).to_contain_text("Not recorded")
    dialog.locator(".comparison-provenance").nth(1).locator("summary").click()
    notice = dialog.get_by_role("link", name="View notice")
    expect(notice).to_have_attribute("href", "https://pmc.ncbi.nlm.nih.gov/articles/PMC4646256/")
    expect(dialog.locator(".publication-status").nth(1)).to_contain_text("2026-10-23")
    dialog.evaluate("element => { element.scrollTop = 0; }")
    page.screenshot(path=str(screenshots / "comparison-binding-r47h.png"), full_page=True)
    page.keyboard.press("Escape")
    expect(trigger).to_be_focused()
    export_share_image(page, "binding", screenshots)
    page.get_by_role("button", name="Share", exact=True).click()
    sharing = page.get_by_role("dialog", name="Share this view", exact=True)
    shared = sharing.get_by_role("textbox", name="Link to this view").input_value()
    assert "type=protein" in shared and "claim=claim-trem2-apoe-binding" in shared
    page.keyboard.press("Escape")
    page.goto(shared, wait_until="networkidle")
    expect(page.get_by_role("combobox", name="Filter by entity type")).to_have_value("protein")
    page.get_by_role("button", name="View APOE protein", exact=True).click()
    expect(page.locator(".selected-title")).to_have_text("APOE protein")
    expect(page.locator(".selected-title")).to_be_focused()
    expect(page.locator(".finding-statement")).to_contain_text("dot-blot assays")
    expect(page.get_by_role("combobox", name="Filter by entity type")).to_have_value("all")
    page.locator(".claim-button").filter(has_text="Bailey et al. 2015 · R47H versus wild type").click()
    expect(page.locator(".source-link")).to_have_attribute("href", "https://pubmed.ncbi.nlm.nih.gov/26374897/")
    expect(page.locator(".source-context")).to_contain_text("ELISA")
    page.get_by_role("button", name="Study details and limitations").click()
    expect(page.locator(".publication-status")).to_contain_text("Correction recorded (2026-10-23)")
    expect(page.get_by_role("link", name="View notice")).to_have_attribute("href", "https://pmc.ncbi.nlm.nih.gov/articles/PMC4646256/")
    export_share_image(page, "bailey", screenshots)
    assert_idle(page, "Protein binding graph after comparison and sharing")
    assert not errors, errors
    context.close()

    for fallback in [False, True]:
        mobile = browser.new_context(viewport={"width": 360, "height": 844}, reduced_motion="reduce", color_scheme="dark", is_mobile=True, has_touch=True)
        if fallback:
            mobile.add_init_script("""
              const original = HTMLCanvasElement.prototype.getContext;
              HTMLCanvasElement.prototype.getContext = function(kind, ...args) {
                return kind.startsWith('webgl') ? null : original.call(this, kind, ...args);
              };
            """)
        page = mobile.new_page()
        page.goto(link, wait_until="networkidle")
        page.get_by_role("button", name="View evidence", exact=True).tap()
        expect(page.locator(".source-context")).to_contain_text("Cell-free protein assay")
        page.get_by_role("button", name="Study details and limitations").tap()
        expect(page.locator(".source-study-context")).to_contain_text("Independent dot blots")
        expect(page.locator(".source-locator").filter(has_text="Source location")).to_contain_text("Figure 1A")
        trigger = page.get_by_role("button", name="Compare findings", exact=True)
        assert_touch_target(trigger)
        trigger.tap()
        dialog = page.get_by_role("dialog", name="Compare findings", exact=True)
        expect(dialog.get_by_role("combobox", name="Finding B")).to_have_value("claim-bailey-trem2-apoe-binding")
        assert page.evaluate("document.documentElement.scrollWidth <= innerWidth")
        page.screenshot(path=str(screenshots / f"binding-mobile-{'fallback' if fallback else 'graph'}.png"))
        page.keyboard.press("Escape")
        page.locator(".claim-button").filter(has_text="Bailey et al. 2015 · R47H versus wild type").tap()
        expect(page.locator(".source-link")).to_have_attribute("href", "https://pubmed.ncbi.nlm.nih.gov/26374897/")
        page.get_by_role("button", name="Study details and limitations").tap()
        expect(page.locator(".publication-status")).to_contain_text("Correction recorded")
        expect(page.get_by_role("link", name="View notice")).to_have_attribute("href", "https://pmc.ncbi.nlm.nih.gov/articles/PMC4646256/")
        mobile.close()
    print("PASS: two binding studies default to matching recorded conditions, retain preparation/replicate differences and shared-paper checks, export the correction link, and support keyboard/mobile/themes/WebGL fallback plus cited PNGs.")


def assert_study_context_note(browser, base_url: str, screenshots: Path) -> None:
    link = f"{base_url}#entity=protein-trem2&claim=claim-trem2-r47h-apoe-binding&type=protein"
    source_urls = {"https://pubmed.ncbi.nlm.nih.gov/26374899/", "https://link.springer.com/article/10.15252/emmm.201809027"}
    context = browser.new_context(viewport={"width": 1440, "height": 1000}, reduced_motion="reduce")
    context.add_init_script(RENDER_COUNTERS)
    page = context.new_page()
    errors = []
    page.on("pageerror", lambda error: errors.append(str(error)))
    page.goto(link, wait_until="networkidle")
    note = page.locator(".inspector .study-context-note")
    expect(note.get_by_role("heading")).to_contain_text("Different R47H binding results")
    expect(note.locator(".draft-label")).to_have_text("Draft")
    expect(note).to_contain_text("no statistically significant APOE3 affinity difference")
    assert set(note.locator("a").evaluate_all("links => links.map(link => link.href)")) == source_urls
    # The selected finding's original citation precedes the contextual note.
    assert page.locator(".source-link").evaluate("element => Boolean(element.compareDocumentPosition(document.querySelector('.inspector .study-context-note')) & Node.DOCUMENT_POSITION_FOLLOWING)")
    summary = note.get_by_text("What differs", exact=True)
    summary.focus()
    page.keyboard.press("Enter")
    expect(note.locator("details")).to_have_attribute("open", "")
    expect(note).to_contain_text("not an equivalence test")
    expect(note).to_contain_text("Discovery Galaxy source check (AI)")
    for theme in ["light", "dark"]:
        page.get_by_role("combobox", name="Color theme").select_option(theme)
        for control in [note.locator("h3"), note.locator("p").first, summary, note.locator("a").first, note.locator(".context-note-review").first]:
            assert_text_contrast(control)
        note.scroll_into_view_if_needed()
        page.screenshot(path=str(screenshots / f"study-context-{theme}.png"), full_page=True)
    trigger = page.get_by_role("button", name="Compare findings", exact=True)
    trigger.focus()
    page.keyboard.press("Enter")
    dialog = page.get_by_role("dialog", name="Compare findings", exact=True)
    expect(dialog.get_by_role("combobox", name="Finding B")).to_have_value("claim-lessard-trem2-r47h-apoe3-binding")
    compared_note = dialog.locator(".study-context-note")
    expect(compared_note).to_have_count(1)
    expect(compared_note).to_contain_text("preparations and readouts differ")
    assert set(compared_note.locator("a").evaluate_all("links => links.map(link => link.href)")) == source_urls
    experiments = dialog.get_by_role("rowheader", name=re.compile(r"^Experiments reported\b")).locator("..")
    expect(experiments.locator("td").nth(1)).to_contain_text("Not recorded")
    concentrations = dialog.get_by_role("rowheader", name=re.compile(r"^Ligand concentrations\b")).locator("..")
    expect(concentrations.locator("td").nth(1)).to_contain_text("5")
    with page.expect_download() as pending:
        dialog.get_by_role("link", name="Download comparison", exact=True).click()
    destination = screenshots / "comparison-study-context.md"
    pending.value.save_as(destination)
    brief = destination.read_text()
    for text in ["Different R47H binding results", "conflict-r47h-binding-context", "not an equivalence test", "ligand concentrations: 5", "Note review: draft; human reviewed: false", "total run count was not resolved"]:
        assert text in brief, text
    assert all(url in brief for url in source_urls)
    compared_note.scroll_into_view_if_needed()
    page.screenshot(path=str(screenshots / "comparison-study-context-dark.png"), full_page=True)
    # Field differences alone must never fabricate a curated disagreement.
    dialog.get_by_role("combobox", name="Finding B").select_option("claim-bailey-trem2-r47h-apoe-binding")
    expect(dialog.locator(".study-context-note")).to_have_count(0)
    page.keyboard.press("Escape")
    expect(trigger).to_be_focused()
    expect(page.get_by_role("combobox", name="Filter by entity type")).to_have_value("protein")
    page.locator(".claim-button").filter(has_text="Lessard et al. 2018 · R47H versus wild type").click()
    expect(page.locator(".source-link")).to_have_attribute("href", "https://link.springer.com/article/10.15252/emmm.201809027")
    expect(note).to_have_count(1)
    page.get_by_role("button", name="Compare findings", exact=True).click()
    expect(dialog.get_by_role("combobox", name="Finding B")).to_have_value("claim-trem2-r47h-apoe-binding")
    page.keyboard.press("Escape")
    page.get_by_role("button", name="View APOE protein", exact=True).click()
    expect(page.locator(".selected-title")).to_have_text("APOE protein")
    expect(page.locator(".finding-statement")).to_contain_text("no statistically significant difference")
    expect(note).to_have_count(1)
    export_share_image(page, "lessard", screenshots)
    page.locator(".claim-button").filter(has_text="Atagi et al. 2015 · Wild-type TREM2").click()
    expect(note).to_have_count(0)
    assert_idle(page, "Graph after source-context comparison")
    assert not errors, errors
    context.close()

    for fallback in [False, True]:
        mobile = browser.new_context(viewport={"width": 360, "height": 844}, reduced_motion="reduce", color_scheme="dark", is_mobile=True, has_touch=True)
        if fallback:
            mobile.add_init_script("""
              const original = HTMLCanvasElement.prototype.getContext;
              HTMLCanvasElement.prototype.getContext = function(kind, ...args) {
                return kind.startsWith('webgl') ? null : original.call(this, kind, ...args);
              };
            """)
        page = mobile.new_page()
        page.goto(link, wait_until="networkidle")
        page.get_by_role("button", name="View evidence", exact=True).tap()
        note = page.locator(".inspector .study-context-note")
        expect(note).to_have_count(1)
        summary = note.get_by_text("What differs", exact=True)
        assert_touch_target(summary)
        for source in note.locator("a").all():
            assert_touch_target(source)
        summary.tap()
        expect(note).to_contain_text("not an equivalence test")
        assert page.evaluate("document.documentElement.scrollWidth <= innerWidth")
        note.scroll_into_view_if_needed()
        page.screenshot(path=str(screenshots / f"study-context-mobile-{'fallback' if fallback else 'graph'}.png"))
        page.get_by_role("button", name="Compare findings", exact=True).tap()
        dialog = page.get_by_role("dialog", name="Compare findings", exact=True)
        expect(dialog.get_by_role("combobox", name="Finding B")).to_have_value("claim-lessard-trem2-r47h-apoe3-binding")
        expect(dialog.locator(".study-context-note")).to_have_count(1)
        dialog.locator(".study-context-note").scroll_into_view_if_needed()
        page.screenshot(path=str(screenshots / f"comparison-context-mobile-{'fallback' if fallback else 'graph'}.png"))
        assert page.evaluate("document.documentElement.scrollWidth <= innerWidth")
        mobile.close()
    print("PASS: the cited R47H context note opens its explicit pair, retains non-equivalence and unknown repeat totals in briefs/PNG sharing, and works with keyboard, themes, mobile touch and WebGL fallback.")


def assert_research_brief(browser, base_url: str, screenshots: Path) -> None:
    key = 'discovery-galaxy:research-brief:v1'
    atagi = 'claim-trem2-r47h-apoe-binding'
    lessard = 'claim-lessard-trem2-r47h-apoe3-binding'
    link = f'{base_url}#entity=protein-trem2&claim={atagi}&type=protein'
    context = browser.new_context(viewport={"width": 1440, "height": 1000}, reduced_motion="reduce")
    context.add_init_script(RENDER_COUNTERS)
    page = context.new_page()
    errors = []
    page.on('pageerror', lambda error: errors.append(str(error)))
    page.goto(link, wait_until='networkidle')
    pin = page.get_by_role('button', name='Pin finding', exact=True)
    pin.click()
    expect(pin).to_have_attribute('aria-pressed', 'true')
    expect(page.get_by_role('combobox', name='Filter by entity type')).to_have_value('protein')
    page.get_by_role('button', name='Compare findings', exact=True).click()
    page.get_by_role('button', name='Add to research brief', exact=True).click()
    dialog = page.get_by_role('dialog', name='Research brief', exact=True)
    expect(dialog).to_be_visible()
    expect(page.get_by_role('dialog', name='Compare findings', exact=True)).not_to_be_visible()
    expect(dialog.locator('.brief-finding')).to_have_count(2)
    expect(dialog.get_by_role('combobox', name='Finding A')).to_have_value(atagi)
    expect(dialog.get_by_role('combobox', name='Finding B')).to_have_value(lessard)
    fields = {
        'Research question': 'Workflow test: which assay conditions need a controlled comparison?',
        'Your explanation': 'Workflow test notes, not a scientific finding.\n# This is user text.',
        'Your assumptions': 'Workflow test: the selected methods may need harmonizing.',
        'Your proposed experiment': 'Workflow test: compare preparations with prespecified controls and readouts.',
    }
    for label, value in fields.items():
        dialog.get_by_role('textbox', name=label, exact=True).fill(value)
    expect(dialog.locator('.brief-save-status')).to_have_text('Saved on this device')
    saved = page.evaluate('key => JSON.parse(localStorage.getItem(key))', key)
    assert saved['pinned_claim_ids'] == [atagi, lessard]
    assert saved['comparison_claim_ids'] == [atagi, lessard]
    assert saved['experiment'] == fields['Your proposed experiment']
    assert not {'sources', 'review', 'human_reviewed'} & saved.keys()
    for theme in ['light', 'dark']:
        page.keyboard.press('Escape')
        expect(page.get_by_role('button', name='Research brief', exact=True)).to_be_focused()
        page.get_by_role('combobox', name='Color theme').select_option(theme)
        page.get_by_role('button', name='Research brief', exact=True).click()
        for control in [dialog.get_by_role('textbox', name='Research question'), dialog.get_by_role('textbox', name='Your explanation'), dialog.locator('.brief-source a').first, dialog.locator('.brief-save-status')]:
            assert_text_contrast(control)
        dialog.get_by_role('textbox', name='Research question').scroll_into_view_if_needed()
        page.screenshot(path=str(screenshots / f'research-brief-{theme}.png'))
    download_button = dialog.get_by_role('button', name='Download brief', exact=True)
    box = download_button.bounding_box()
    assert box and 0 <= box['y'] < 1000 - box['height'], 'Download action must stay visible while writing.'
    with page.expect_download() as pending:
        download_button.click()
    destination = screenshots / 'research-brief.md'
    pending.value.save_as(destination)
    markdown = destination.read_text()
    for text in ['Researcher-entered draft', '> Workflow test', '> \\# This is user text.', atagi, lessard,
                 'https://pubmed.ncbi.nlm.nih.gov/26374899/', 'https://link.springer.com/article/10.15252/emmm.201809027',
                 'conflict-r47h-binding-context', 'not an equivalence test', 'ligand concentrations: 5', 'total run count was not resolved']:
        assert text in markdown, text
    # Native modal focus excludes background controls; Chromium also allows browser chrome.
    for _ in range(6):
        page.keyboard.press('Tab')
        assert dialog.evaluate('element => element.contains(document.activeElement) || document.activeElement === document.body')
    dialog.get_by_role('button', name='View comparison', exact=True).click()
    expect(page.get_by_role('dialog', name='Compare findings', exact=True)).to_be_visible()
    page.get_by_role('button', name='Add to research brief', exact=True).click()
    expect(dialog.get_by_role('textbox', name='Your explanation')).to_have_value(fields['Your explanation'])
    # Refresh immediately after editing, before the ordinary autosave debounce.
    fields['Your proposed experiment'] += ' Immediate-reload workflow test note.'
    dialog.get_by_role('textbox', name='Your proposed experiment').fill(fields['Your proposed experiment'])
    page.reload(wait_until='networkidle')
    page.get_by_role('button', name='Research brief', exact=True).click()
    for label, value in fields.items():
        expect(dialog.get_by_role('textbox', name=label, exact=True)).to_have_value(value)
    expect(dialog.locator('.brief-finding')).to_have_count(2)
    dialog.locator(f'[data-claim-id="{lessard}"]').get_by_role('button', name=re.compile('^Unpin ')).click()
    expect(dialog.locator('.brief-finding')).to_have_count(1)
    expect(dialog.get_by_role('combobox', name='Finding A')).to_have_count(0)
    expect(dialog.get_by_role('textbox', name='Your assumptions')).to_have_value(fields['Your assumptions'])
    dialog.get_by_role('button', name='View finding', exact=True).click()
    expect(dialog).not_to_be_visible()
    expect(page.locator('.selected-title')).to_be_focused()
    expect(page.locator('.finding-statement')).to_contain_text('R47H-Fc showed less APOE binding')
    expect(page.get_by_role('combobox', name='Filter by entity type')).to_have_value('all')
    assert_idle(page, 'Graph after writing and exporting a research brief')
    assert not errors, errors
    context.close()

    # Both real WebGL and the searchable fallback support the same mobile workspace.
    for fallback in [False, True]:
        mobile = browser.new_context(viewport={"width": 360, "height": 844}, reduced_motion='reduce', color_scheme='dark', is_mobile=True, has_touch=True)
        if fallback:
            mobile.add_init_script("""
                const original = HTMLCanvasElement.prototype.getContext;
                HTMLCanvasElement.prototype.getContext = function(kind, ...args) {
                    return kind.startsWith('webgl') ? null : original.call(this, kind, ...args);
                };
            """)
        page = mobile.new_page()
        page.goto(link, wait_until='networkidle')
        page.get_by_role('button', name='View evidence', exact=True).tap()
        pin = page.get_by_role('button', name='Pin finding', exact=True)
        assert_touch_target(pin)
        pin.tap()
        trigger = page.get_by_role('button', name='Research brief', exact=True)
        assert_touch_target(trigger)
        trigger.tap()
        dialog = page.get_by_role('dialog', name='Research brief', exact=True)
        dialog.get_by_role('textbox', name='Research question').fill(fields['Research question'])
        dialog.get_by_role('textbox', name='Your explanation').fill(fields['Your explanation'])
        for control in [dialog.get_by_role('button', name='Download brief'), dialog.get_by_role('button', name='Close research brief'), dialog.locator('.brief-source a').first]:
            assert_touch_target(control)
        dialog.get_by_role('textbox', name='Research question').scroll_into_view_if_needed()
        assert page.evaluate('document.documentElement.scrollWidth <= innerWidth')
        assert dialog.evaluate('element => element.scrollWidth <= element.clientWidth')
        page.screenshot(path=str(screenshots / f'research-brief-mobile-{"fallback" if fallback else "graph"}.png'))
        with page.expect_download() as pending:
            dialog.get_by_role('button', name='Download brief', exact=True).tap()
        assert pending.value.suggested_filename == 'discovery-galaxy-research-brief.md'
        dialog.get_by_role('button', name='View finding', exact=True).tap()
        expect(page.locator('.selected-title')).to_be_focused()
        title = page.locator('.selected-title').bounding_box()
        assert title and 0 <= title['y'] < 844, 'View finding must bring evidence into view.'
        expect(page.get_by_role('button', name='List view')).to_have_attribute('aria-pressed', str(fallback).lower())
        mobile.close()

    # An unavailable store still permits in-memory writing and a cited download.
    blocked = browser.new_context()
    blocked.add_init_script("""Object.defineProperty(window, 'localStorage', { configurable: true,
        get() { throw new DOMException('Storage disabled by test', 'SecurityError'); }
    });""")
    page = blocked.new_page()
    page.on('pageerror', lambda error: errors.append(str(error)))
    page.goto(link, wait_until='networkidle')
    page.get_by_role('button', name='Research brief', exact=True).click()
    dialog = page.get_by_role('dialog', name='Research brief', exact=True)
    expect(dialog).to_contain_text('Device storage is unavailable')
    dialog.get_by_role('button', name='Pin selected finding').click()
    dialog.get_by_role('textbox', name='Research question').fill(fields['Research question'])
    expect(dialog).to_contain_text('Device storage is unavailable')
    with page.expect_download() as pending:
        dialog.get_by_role('button', name='Download brief', exact=True).click()
    assert pending.value.suggested_filename.endswith('.md')
    blocked.close()

    # Corrupt saved data is left untouched until the user explicitly replaces it.
    corrupt = browser.new_context()
    corrupt.add_init_script(f'localStorage.setItem({json.dumps(key)}, "unreadable workflow test")')
    page = corrupt.new_page()
    page.goto(link, wait_until='networkidle')
    page.get_by_role('button', name='Research brief', exact=True).click()
    dialog = page.get_by_role('dialog', name='Research brief', exact=True)
    dialog.get_by_role('textbox', name='Research question').fill(fields['Research question'])
    expect(dialog).to_contain_text('It has not been replaced.')
    page.wait_for_timeout(450)
    assert page.evaluate('key => localStorage.getItem(key)', key) == 'unreadable workflow test'
    dialog.get_by_role('button', name='Save this version').click()
    expect(dialog.locator('.brief-save-status')).to_have_text('Saved on this device')
    assert page.evaluate('key => JSON.parse(localStorage.getItem(key)).question', key) == fields['Research question']
    corrupt.close()

    # Dataset upgrades never drop notes or silently substitute different evidence.
    outdated = browser.new_context()
    old = {**saved, 'dataset_version': 'workflow-test-old-version', 'pinned_claim_ids': [atagi, 'claim-workflow-test-unavailable'], 'comparison_claim_ids': None}
    outdated.add_init_script(f'localStorage.setItem({json.dumps(key)}, {json.dumps(json.dumps(old))})')
    page = outdated.new_page()
    page.goto(link, wait_until='networkidle')
    page.get_by_role('button', name='Research brief', exact=True).click()
    dialog = page.get_by_role('dialog', name='Research brief', exact=True)
    expect(dialog).to_contain_text('Unavailable finding')
    dialog.get_by_role('button', name='Refresh evidence').click()
    expect(dialog.get_by_role('alert')).to_contain_text('Remove unavailable findings')
    dialog.get_by_role('button', name='Unpin claim-workflow-test-unavailable', exact=True).click()
    dialog.get_by_role('button', name='Refresh evidence').click()
    expect(dialog.get_by_role('button', name='Refresh evidence')).to_have_count(0)
    expect(dialog.get_by_role('textbox', name='Your explanation')).to_have_value(fields['Your explanation'])
    with page.expect_download() as pending:
        dialog.get_by_role('button', name='Download brief', exact=True).click()
    assert pending.value.suggested_filename.endswith('.md')
    outdated.close()

    # Another tab's save pauses autosave instead of overwriting either in-memory draft.
    shared = browser.new_context()
    first = shared.new_page()
    first.goto(link, wait_until='networkidle')
    first.get_by_role('button', name='Research brief', exact=True).click()
    first_dialog = first.get_by_role('dialog', name='Research brief', exact=True)
    first_dialog.get_by_role('textbox', name='Research question').fill('Workflow test: first tab question')
    expect(first_dialog.locator('.brief-save-status')).to_have_text('Saved on this device')
    second = shared.new_page()
    second.goto(link, wait_until='networkidle')
    second.get_by_role('button', name='Research brief', exact=True).click()
    second_dialog = second.get_by_role('dialog', name='Research brief', exact=True)
    second_dialog.get_by_role('textbox', name='Research question').fill('Workflow test: second tab question')
    expect(second_dialog.locator('.brief-save-status')).to_have_text('Saved on this device')
    expect(first_dialog).to_contain_text('Another tab changed the saved brief')
    expect(first_dialog.get_by_role('textbox', name='Research question')).to_have_value('Workflow test: first tab question')
    first_dialog.get_by_role('textbox', name='Your explanation').fill('Workflow test: unsaved first tab edits')
    first.wait_for_timeout(450)
    assert first.evaluate('key => JSON.parse(localStorage.getItem(key)).question', key) == 'Workflow test: second tab question'
    first_dialog.get_by_role('button', name='Save this version').click()
    expect(second_dialog).to_contain_text('Another tab changed the saved brief')
    assert first.evaluate('key => JSON.parse(localStorage.getItem(key)).explanation', key) == 'Workflow test: unsaved first tab edits'
    shared.close()
    assert not errors, errors
    print('PASS: research briefs pin cited findings and comparisons, retain user notes across reloads, export complete evidence, and recover explicitly from blocked/corrupt storage, dataset changes and other tabs; keyboard, themes, mobile and WebGL fallback work.')


def assert_experiment_analysis(browser, base_url: str, screenshots: Path, public_table: Path | None = None) -> None:
    # Synthetic workflow values are confined to browser inputs, never graph claims.
    csv = ('gene,log2FoldChange,padj\nAPOE,2,.01\nTREM2,-1.8,.02\nABCA1,-1.2,.03\n'
           'TYROBP,.4,.5\nNR1H2,.1,.9\nNR1H3,.2,.7\nRXRA,.3,.6\nPLCG2,1.1,.04\n'
           'SPP1,-.1,.8\nFKBP5,NA,NA\nSYNTHETICUNMAPPED,0,.9\n')
    pathway_name = 'Plasma lipoprotein assembly, remodeling, and clearance'
    pathway_id = 'R-HSA-174824'
    reference = json.loads((Path(__file__).resolve().parents[1] / 'data/reference/reactome-pathways.json').read_text())
    # All uploaded rows are retained, but incomplete statistics cannot enter the
    # selected set and are therefore ineligible for this threshold-based universe.
    background = {parts[0] for parts in (line.split(',') for line in csv.splitlines()[1:]) if 'NA' not in parts[1:]}
    annotated = {gene for pathway in reference['pathways'] for gene in pathway['genes']}
    family_size = sum(bool(background.intersection(pathway['genes'])) for pathway in reference['pathways'])
    context = browser.new_context(viewport={'width': 1440, 'height': 1000}, reduced_motion='reduce')
    context.add_init_script(RENDER_COUNTERS)
    page = context.new_page()
    errors = []
    requests = []
    page.on('pageerror', lambda error: errors.append(str(error)))
    page.on('request', lambda request: requests.append((request.method, request.url, request.post_data)))
    page.goto(base_url, wait_until='networkidle')
    nav = page.get_by_role('navigation', name='Workspace', exact=True)
    assert not any('reactome-pathways' in url for _, url, _ in requests), 'Reference must load only for explicit analysis.'
    page.get_by_role('button', name='TREM2', exact=True).click()
    expect(page.locator('.selected-title')).to_have_text('TREM2')
    nav.get_by_role('button', name='Analyze results', exact=True).focus()
    page.keyboard.press('Enter')
    workspace = page.get_by_role('main', name='Analyze results', exact=True)
    # A retained but hidden explorer must not swallow browser shortcuts.
    for modifier in ['ctrlKey', 'metaKey']:
        assert page.evaluate('modifier => { const event = new KeyboardEvent("keydown", {key: "k", [modifier]: true, bubbles: true, cancelable: true}); window.dispatchEvent(event); return event.defaultPrevented; }', modifier) is False
    form = workspace.get_by_role('form', name='RNA-seq analysis')
    submit = form.locator('button[type=submit]')
    expect(submit).to_be_disabled()
    with page.expect_download() as pending:
        workspace.get_by_role('button', name='CSV template', exact=True).click()
    template = screenshots / 'synthetic-rnaseq-format-template.csv'
    pending.value.save_as(template)
    assert 'synthetic' in template.read_text() and 'synthetic' in pending.value.suggested_filename
    expect(workspace.locator('.experiment-results')).to_have_count(0)
    upload = form.get_by_label('Human RNA-seq results', exact=True)
    upload.set_input_files({'name': 'synthetic-rnaseq-workflow.csv', 'mimeType': 'text/csv', 'buffer': csv.encode()})
    expect(submit).to_be_enabled()
    form.get_by_role('textbox', name='Comparison', exact=True).fill('QA synthetic RNA numerator / denominator')
    declaration = form.get_by_role('checkbox', name='This table contains all tested genes', exact=True)
    submit.click()
    expect(declaration).not_to_be_checked()
    assert not any('reactome-pathways' in url for _, url, _ in requests), 'A selected-only list must not bypass the background declaration.'
    declaration.check()
    submit.click()
    heading = workspace.locator('#experiment-results-title')
    expect(heading).to_have_text('QA synthetic RNA numerator / denominator', timeout=15000)
    expect(heading).to_be_focused()
    expect(workspace.locator('.experiment-results-heading')).to_contain_text('11 uploaded rows')
    counts = workspace.locator('.experiment-counts dd')
    expect(counts).to_have_text(['10', '4', str(len(background & annotated)), str(family_size)])
    assert any('reactome-pathways' in url for _, url, _ in requests)
    # Workspace anchors preserve the current work; scientific share hashes
    # deliberately reveal their destination in the evidence explorer.
    skip = page.get_by_role('link', name='Skip to workspace', exact=True)
    skip.focus()
    page.keyboard.press('Enter')
    expect(page).to_have_url(re.compile(r'#experiment-workspace$'))
    expect(nav.get_by_role('button', name='Analyze results', exact=True)).to_have_attribute('aria-pressed', 'true')
    expect(page.locator('#experiment-workspace')).to_be_focused()
    expect(page.locator('.selected-title')).to_have_text('TREM2')
    expect(heading).to_have_text('QA synthetic RNA numerator / denominator')
    page.evaluate("location.hash = 'entity=gene-abca1&claim=claim-abca1-n1800h-risk&type=gene&view=graph'")
    expect(nav.get_by_role('button', name='Explore', exact=True)).to_have_attribute('aria-pressed', 'true')
    expect(page.locator('.selected-title')).to_have_text('ABCA1')
    expect(page.get_by_role('combobox', name='Filter by entity type')).to_have_value('gene')
    expect(page.get_by_role('button', name='Graph view', exact=True)).to_have_attribute('aria-pressed', 'true')
    skip.focus()
    page.keyboard.press('Enter')
    expect(page).to_have_url(re.compile(r'#explorer$'))
    expect(page.locator('.selected-title')).to_have_text('ABCA1')
    nav.get_by_role('button', name='Analyze results', exact=True).click()
    expect(heading).to_have_text('QA synthetic RNA numerator / denominator')
    expect(counts).to_have_text(['10', '4', str(len(background & annotated)), str(family_size)])
    expect(workspace.get_by_role('region', name='Pathway results', exact=True).locator('tbody tr')).to_have_count(20)
    search = workspace.get_by_role('searchbox', name='Find pathways', exact=True)
    assert_no_scroll(page, search, lambda: search.fill(pathway_name), 'Pathway search typing')
    workspace.get_by_role('button', name=pathway_name, exact=True).click()
    detail = workspace.locator('.experiment-pathway-detail')
    expect(detail.get_by_role('heading', name=pathway_name, exact=True)).to_be_visible()
    expect(detail.locator('.experiment-source-link')).to_have_attribute('href', f'https://reactome.org/content/detail/{pathway_id}')
    members = detail.get_by_role('region', name='Eligible pathway members', exact=True)
    expect(members.get_by_role('rowheader', name='APOE', exact=True).locator('..')).to_contain_text('+2')
    expect(members.get_by_role('rowheader', name='ABCA1', exact=True).locator('..')).to_contain_text('-1.2')
    questions = detail.get_by_role('region', name='Questions to investigate', exact=True)
    expect(questions.locator('article')).to_have_count(2)
    expect(questions).to_contain_text('Do the APOE and TREM2 transcript changes correspond')
    questions.get_by_text('Assumptions and proposed test', exact=True).last.click()
    expect(questions).to_contain_text('do not establish that this experiment involves R47H')
    urls = questions.locator('a').evaluate_all('links => links.map(link => link.href)')
    assert 'https://pubmed.ncbi.nlm.nih.gov/26374899/' in urls
    assert 'https://link.springer.com/article/10.15252/emmm.201809027' in urls
    methods = workspace.locator('.experiment-methods')
    methods.get_by_text('Methods and reference', exact=True).click()
    expect(methods).to_contain_text('including unannotated eligible genes')
    expect(methods).to_contain_text('excluded')
    expect(methods).to_contain_text(f'all {family_size} pathways with eligible members, including zero-overlap pathways')
    expect(methods).to_contain_text('Not recorded')
    expect(methods).to_contain_text(reference['reference_id'])
    for theme in ['light', 'dark']:
        page.get_by_role('combobox', name='Color theme').select_option(theme)
        for control in [form.get_by_role('textbox', name='Comparison'), counts.first, detail.locator('h3'), detail.locator('.experiment-source-link'), questions.locator('h5').first]:
            assert_text_contrast(control)
        heading.scroll_into_view_if_needed()
        page.screenshot(path=str(screenshots / f'rnaseq-{theme}.png'))
    detail.get_by_role('button', name='View APOE evidence', exact=True).click()
    expect(nav.get_by_role('button', name='Explore', exact=True)).to_have_attribute('aria-pressed', 'true')
    expect(page.locator('.selected-title')).to_have_text('APOE')
    expect(page.locator('.selected-title')).to_be_focused()
    observation = page.get_by_role('region', name='Your RNA-seq result', exact=True)
    expect(observation).to_contain_text('QA synthetic RNA numerator / denominator')
    expect(observation).to_contain_text('Meets gene cutoffs')
    expect(observation.locator('dd')).to_have_text(['2', '0.01', 'Meets gene cutoffs'])
    expect(page.locator('.source-link')).to_have_attribute('href', 'https://pubmed.ncbi.nlm.nih.gov/8346443/')
    page.locator('.claim-button').filter(has_text='Encodes · APOE protein').click()
    page.get_by_role('button', name='View APOE protein', exact=True).click()
    expect(page.locator('.selected-title')).to_have_text('APOE protein')
    expect(observation).to_have_count(0)
    nav.get_by_role('button', name='Analyze results', exact=True).click()
    expect(search).to_have_value(pathway_name)
    expect(heading).to_have_text('QA synthetic RNA numerator / denominator')
    assert_idle(page, 'Graph after switching between experiment analysis and cited evidence')
    form.get_by_role('spinbutton', name='Gene FDR', exact=True).fill('0')
    submit.click()
    expect(counts.nth(1)).to_have_text('0')
    expect(workspace.locator('.experiment-questions')).to_have_count(0)
    workspace.get_by_role('checkbox', name='Pathway FDR ≤ 0.05', exact=True).check()
    expect(workspace).to_contain_text('No pathways pass this FDR cutoff')
    workspace.get_by_role('button', name='Show all tested pathways', exact=True).click()
    upload.set_input_files({'name': 'synthetic-duplicate.csv', 'mimeType': 'text/csv', 'buffer': b'gene,log2FoldChange,padj\nAPOE,2,.01\nAPOE,-2,.01\n'})
    expect(form.get_by_role('alert')).to_contain_text('duplicate symbol')
    expect(counts.nth(1)).to_have_text('0')
    expect(heading).to_have_text('QA synthetic RNA numerator / denominator')
    upload.set_input_files({'name': 'synthetic-retry.csv', 'mimeType': 'text/csv', 'buffer': csv.encode()})
    form.get_by_role('textbox', name='Comparison', exact=True).fill('QA synthetic retry / control')
    form.get_by_role('spinbutton', name='Gene FDR', exact=True).fill('0.05')
    declaration.check()
    page.route('**/reactome-pathways*.json', lambda route: route.abort('failed'))
    submit.click()
    expect(form.get_by_role('alert')).to_be_visible()
    expect(heading).to_have_text('QA synthetic RNA numerator / denominator')
    page.unroute('**/reactome-pathways*.json')
    submit.click()
    expect(heading).to_have_text('QA synthetic retry / control')
    expect(counts.nth(1)).to_have_text('4')
    held_reference = []
    page.route('**/reactome-pathways*.json', lambda route: held_reference.append(route))
    form.get_by_role('textbox', name='Comparison', exact=True).fill('QA synthetic delayed / control')
    submit.click()
    expect(submit).to_have_text('Analyzing…')
    explore = nav.get_by_role('button', name='Explore', exact=True)
    explore.click()
    expect(explore).to_be_focused()
    assert held_reference, 'Analysis reference request should be held for the navigation test.'
    held_reference[0].continue_()
    expect(page.locator('#experiment-results-title')).to_have_text('QA synthetic delayed / control')
    expect(explore).to_be_focused()
    page.unroute('**/reactome-pathways*.json')
    nav.get_by_role('button', name='Analyze results', exact=True).click()
    expect(heading).to_have_text('QA synthetic delayed / control')
    form.get_by_role('button', name='Remove results', exact=True).click()
    expect(workspace.locator('.experiment-results')).to_have_count(0)
    nav.get_by_role('button', name='Explore', exact=True).click()
    expect(page.locator('.experiment-context')).to_have_count(0)
    expect(page.locator('.experiment-observation')).to_have_count(0)
    nav.get_by_role('button', name='Analyze results', exact=True).click()
    upload.set_input_files({'name': 'synthetic-unmapped.tsv', 'mimeType': 'text/tab-separated-values', 'buffer': b'gene\tlog2FC\tFDR\nSYNTHETICUNMAPPED\t2\t.01\n'})
    declaration.check()
    submit.click()
    expect(counts).to_have_text(['1', '1', '0', '0'])
    expect(workspace).to_contain_text('No eligible genes map to the pathway reference')
    expect(workspace.locator('.experiment-questions')).to_have_count(0)
    if public_table is not None:
        assert public_table.is_file(), 'Explicit public validation table is missing.'
        upload.set_input_files(public_table)
        form.get_by_role('textbox', name='Comparison', exact=True).fill('Public airway: dexamethasone / untreated')
        declaration.check()
        submit.click()
        expect(counts).to_have_text(['13,587', '710', '7,682', '2,581'], timeout=20000)
        workspace.get_by_role('checkbox', name='Pathway FDR ≤ 0.05', exact=True).check()
        expect(workspace.get_by_role('region', name='Pathway results', exact=True).locator('tbody tr')).to_have_count(14)
        expect(workspace.locator('.experiment-pagination').first).to_contain_text('1–14 of 14')
        expect(workspace.get_by_role('region', name='Pathway results', exact=True).locator('tbody tr').first).to_contain_text('1.69e-5')
        page.screenshot(path=str(screenshots / 'rnaseq-public-airway.png'))
        print('PASS: public human airway table uploads and produces 13,587 measured genes, 710 selected genes, 2,581 tested pathways and 14 pathway-FDR results ≤0.05; this is not an AD experiment.')
    assert all(method == 'GET' and data is None for method, _, data in requests), 'Experimental input must not be uploaded.'
    assert not any('QA%20synthetic' in url or 'SYNTHETICUNMAPPED' in url for _, url, _ in requests)
    assert 'QA synthetic' not in page.evaluate('JSON.stringify(localStorage)')
    page.reload(wait_until='networkidle')
    nav.get_by_role('button', name='Analyze results', exact=True).click()
    expect(workspace.locator('.experiment-results')).to_have_count(0)
    expect(form.get_by_role('textbox', name='Comparison', exact=True)).to_have_value('')
    assert not errors, errors
    context.close()

    for fallback in [False, True]:
        mobile = browser.new_context(viewport={'width': 360, 'height': 844}, reduced_motion='reduce', color_scheme='dark', is_mobile=True, has_touch=True)
        if fallback:
            mobile.add_init_script("""const original = HTMLCanvasElement.prototype.getContext;
                HTMLCanvasElement.prototype.getContext = function(kind, ...args) {
                    return kind.startsWith('webgl') ? null : original.call(this, kind, ...args);
                };""")
        page = mobile.new_page()
        mobile_errors = []
        page.on('pageerror', lambda error: mobile_errors.append(str(error)))
        page.goto(base_url, wait_until='networkidle')
        nav = page.get_by_role('navigation', name='Workspace', exact=True)
        trigger = nav.get_by_role('button', name='Analyze results', exact=True)
        assert_touch_target(trigger)
        trigger.tap()
        workspace = page.get_by_role('main', name='Analyze results', exact=True)
        form = workspace.get_by_role('form', name='RNA-seq analysis')
        mobile_csv = csv.replace('APOE,2,.01', 'APOE,-0.000001234,.0000000000001')
        form.get_by_label('Human RNA-seq results', exact=True).set_input_files({'name': 'synthetic-mobile.csv', 'mimeType': 'text/csv', 'buffer': mobile_csv.encode()})
        form.get_by_role('textbox', name='Comparison', exact=True).fill('QA mobile / control')
        form.get_by_role('spinbutton', name='|log₂ fold change|', exact=True).fill('0')
        form.get_by_role('checkbox', name='This table contains all tested genes', exact=True).check()
        assert_touch_target(form.locator('.experiment-background'))
        submit = form.locator('button[type=submit]')
        assert_touch_target(submit)
        submit.tap()
        expect(workspace.locator('#experiment-results-title')).to_have_text('QA mobile / control', timeout=15000)
        expect(workspace.locator('.experiment-counts dd')).to_have_text(['10', '4', str(len(background & annotated)), str(family_size)])
        workspace.get_by_role('searchbox', name='Find pathways', exact=True).fill(pathway_name)
        choice = workspace.get_by_role('button', name=pathway_name, exact=True)
        assert_touch_target(choice)
        choice.tap()
        detail = workspace.locator('.experiment-pathway-detail')
        expect(detail.locator('h3')).to_be_focused()
        box = detail.locator('h3').bounding_box()
        assert box and 0 <= box['y'] < 844
        assert_touch_target(detail.locator('.experiment-source-link'))
        assert page.evaluate('document.documentElement.scrollWidth <= innerWidth')
        members = detail.get_by_role('region', name='Eligible pathway members', exact=True)
        # Names, signs and leading zeros must all be readable together. A sticky
        # gene column must never cover the start of an adjacent measurement.
        expect(members.get_by_role('rowheader', name='APOE', exact=True).locator('..').locator('td')).to_have_text(['-1.234e-6', '1.00e-13', 'Yes'])
        assert members.evaluate('''element => {
            const bounds = element.getBoundingClientRect();
            return Array.from(element.querySelectorAll('th, td')).every(cell => {
                const cellBounds = cell.getBoundingClientRect();
                const text = document.createRange(); text.selectNodeContents(cell);
                const rects = Array.from(text.getClientRects());
                return (cell.tagName !== 'TD' || rects.length === 1) && rects.every(rect =>
                    rect.left >= Math.max(bounds.left, cellBounds.left) - 1 &&
                    rect.right <= Math.min(bounds.right, cellBounds.right) + 1);
            });
        }'''), 'Member names and full numeric values must remain inside their visible cells.'
        page.screenshot(path=str(screenshots / f'rnaseq-mobile-{"fallback" if fallback else "graph"}.png'))
        evidence = detail.get_by_role('button', name='View APOE evidence', exact=True)
        assert_touch_target(evidence)
        evidence.tap()
        expect(page.locator('.selected-title')).to_be_focused()
        expect(page.get_by_role('region', name='Your RNA-seq result', exact=True)).to_contain_text('QA mobile / control')
        expect(page.get_by_role('button', name='List view', exact=True)).to_have_attribute('aria-pressed', str(fallback).lower())
        nav.get_by_role('button', name='Analyze results', exact=True).tap()
        expect(workspace.locator('#experiment-results-title')).to_have_text('QA mobile / control')
        assert not mobile_errors, mobile_errors
        mobile.close()
    print('PASS: RNA-seq analysis uses the eligible tested universe while retaining missing input and unannotated eligible genes, separates RNA observations from original claims, proposes cited questions, retains results after failed replacement/reference fetch, and supports keyboard, themes, touch and unavailable WebGL without uploading or saving input.')


def assert_identifier_mapping(browser, base_url: str, screenshots: Path) -> None:
    csv = ('gene_id,symbol,log2FoldChange,padj\nENSG00000130203.12,WRONGSYMBOL,2,.01\n'
           'ENSG00000095970,TREM2,-1.5,.02\nENSG00000165029,ABCA1,.1,.7\n'
           'ENSG99999999999,SYNTHETICUNKNOWN,.3,.8\nENSG00000230417,SYNTHETICAMBIGUOUS,1.2,.03\n'
           'ENSG00000011600,TYROBP,NA,NA\n')
    reference = json.loads((Path(__file__).resolve().parents[1] / 'data/reference/reactome-pathways.json').read_text())
    eligible = {'APOE', 'TREM2', 'ABCA1', 'ENSG99999999999', 'ENSG00000230417'}
    family = sum(bool(eligible.intersection(row['genes'])) for row in reference['pathways'])
    for mobile in [False, True]:
        context = browser.new_context(viewport={'width': 360 if mobile else 1440, 'height': 844 if mobile else 1000}, reduced_motion='reduce', color_scheme='dark' if mobile else 'light', is_mobile=mobile, has_touch=mobile)
        context.add_init_script(RENDER_COUNTERS)
        page = context.new_page()
        requests = []
        errors = []
        page.on('pageerror', lambda error: errors.append(str(error)))
        page.on('request', lambda request: requests.append((request.method, request.url, request.post_data)))
        page.goto(base_url, wait_until='networkidle')
        assert not any('hgnc-ensembl' in url for _, url, _ in requests)
        nav = page.get_by_role('navigation', name='Workspace', exact=True)
        nav.get_by_role('button', name='Analyze results', exact=True).click()
        workspace = page.get_by_role('main', name='Analyze results', exact=True)
        form = workspace.get_by_role('form', name='RNA-seq analysis')
        upload = form.get_by_label('Human RNA-seq results', exact=True)
        upload.set_input_files({'name': 'synthetic-ensembl.csv', 'mimeType': 'text/csv', 'buffer': csv.encode()})
        column = form.get_by_role('combobox', name='Gene identifier column', exact=True)
        expect(column).to_be_visible()
        submit = form.locator('button[type=submit]')
        expect(submit).to_be_disabled()
        column.select_option('0')
        form.get_by_role('textbox', name='Comparison', exact=True).fill('Synthetic Ensembl / control')
        form.get_by_role('checkbox', name='This table contains all tested genes', exact=True).check()
        page.route('**/hgnc-ensembl*.json', lambda route: route.abort('failed'))
        submit.click()
        expect(form.get_by_role('alert')).to_contain_text('Unable to load gene identifier mappings')
        page.unroute('**/hgnc-ensembl*.json')
        submit.click()
        review = form.get_by_role('region', name='Identifier review', exact=True)
        expect(review).to_be_focused()
        expect(review).to_contain_text('4 mapped · 2 unresolved')
        expect(review).to_contain_text('LINC00595')
        expect(review).to_contain_text('LINC00856')
        expect(workspace.locator('.experiment-results')).to_have_count(0)
        assert not any('reactome-pathways' in url for _, url, _ in requests)
        review.get_by_role('checkbox', name='Unresolved or duplicate only', exact=True).uncheck()
        expect(review.get_by_role('rowheader', name='ENSG00000130203.12', exact=True).locator('..')).to_contain_text('APOE (HGNC:613)')
        review.get_by_role('searchbox', name='Find identifiers', exact=True).fill('apoe')
        expect(review.get_by_role('region', name='Gene identifier mappings').locator('tbody tr')).to_have_count(1)
        expect(review.get_by_role('rowheader', name='ENSG00000130203.12', exact=True)).to_be_visible()
        review.get_by_role('searchbox', name='Find identifiers', exact=True).fill('')
        submit.click()
        expect(workspace.locator('.experiment-results')).to_have_count(0)
        acknowledgement = form.get_by_role('checkbox', name='Keep unresolved IDs unannotated in the eligible background', exact=True)
        if mobile:
            assert_touch_target(acknowledgement.locator('..'))
            assert_touch_target(review.get_by_role('link', name='APOE (HGNC:613)', exact=True))
        page.screenshot(path=str(screenshots / f'identifiers-review-{"mobile" if mobile else "desktop"}.png'))
        acknowledgement.check()
        submit.click()
        counts = workspace.locator('.experiment-counts dd')
        expect(counts).to_have_text(['5', '3', '3', str(family)])
        expect(workspace.locator('#experiment-results-title')).to_be_focused()
        expect(review).to_have_count(0)
        workspace.get_by_role('searchbox', name='Find pathways', exact=True).fill('Plasma lipoprotein assembly, remodeling, and clearance')
        workspace.get_by_role('button', name='Plasma lipoprotein assembly, remodeling, and clearance', exact=True).click()
        workspace.get_by_role('button', name='View APOE evidence', exact=True).click()
        observation = page.get_by_role('region', name='Your RNA-seq result', exact=True)
        expect(observation).to_contain_text('ENSG00000130203.12')
        expect(observation).to_contain_text('Meets gene cutoffs')
        nav.get_by_role('button', name='Analyze results', exact=True).click()
        upload.set_input_files({'name': 'synthetic-duplicate-versions.csv', 'mimeType': 'text/csv', 'buffer': b'gene,log2FC,padj\nENSG00000130203.1,2,.01\nENSG00000130203.2,-2,.01'})
        expect(column).to_have_count(0)
        form.get_by_role('checkbox', name='This table contains all tested genes', exact=True).check()
        submit.click()
        expect(form.get_by_role('alert')).to_contain_text('Resolve duplicate gene mappings')
        expect(review).to_contain_text('2 duplicate rows')
        expect(counts).to_have_text(['5', '3', '3', str(family)])
        expect(review.get_by_role('checkbox', name='Keep unresolved IDs unannotated in the eligible background', exact=True)).to_have_count(0)
        assert page.evaluate('document.documentElement.scrollWidth <= innerWidth')
        assert all(method == 'GET' and body is None for method, _, body in requests)
        assert not any('Synthetic%20Ensembl' in url or 'ENSG99999999999' in url for _, url, _ in requests)
        assert 'Synthetic Ensembl' not in page.evaluate('JSON.stringify(localStorage)')
        if not mobile:
            assert_idle(page, 'Graph after Ensembl mapping and evidence navigation')
        assert not errors, errors
        context.close()
    print('PASS: Ensembl column selection, pinned lazy mapping, retry/focus, unresolved acknowledgement, full eligible background, original IDs in gene evidence and blocked duplicate versions work on desktop/mobile without upload or persistence.')


def assert_public_ad_results(browser, base_url: str, screenshots: Path, table: Path) -> None:
    import hashlib
    assert hashlib.sha256(table.read_bytes()).hexdigest() == '0f084d65603e1608c8293300ce0b00ccf5dab6d3bf93321cbd3179d688f61c09', 'Use the documented, unfiltered MAYO validation conversion.'
    context = browser.new_context(viewport={'width': 1440, 'height': 1000}, reduced_motion='reduce')
    page = context.new_page()
    requests, errors = [], []
    page.on('request', lambda request: requests.append((request.method, request.url, request.post_data)))
    page.on('pageerror', lambda error: errors.append(str(error)))
    page.goto(base_url, wait_until='networkidle')
    page.get_by_role('navigation', name='Workspace').get_by_role('button', name='Analyze results', exact=True).click()
    workspace = page.get_by_role('main', name='Analyze results', exact=True)
    form = workspace.get_by_role('form', name='RNA-seq analysis')
    form.get_by_label('Human RNA-seq results', exact=True).set_input_files(table)
    form.get_by_role('textbox', name='Comparison', exact=True).fill('MAYO temporal cortex: author-coded AD / Control')
    form.get_by_role('checkbox', name='This table contains all tested genes', exact=True).check()
    form.locator('button[type=submit]').click()
    review = form.get_by_role('region', name='Identifier review', exact=True)
    expect(review).to_contain_text('26,347 mapped · 6,260 unresolved', timeout=20000)
    expect(review.get_by_role('region', name='Gene identifier mappings').locator('tbody tr')).to_have_count(20)
    form.get_by_role('checkbox', name='Keep unresolved IDs unannotated in the eligible background', exact=True).check()
    form.locator('button[type=submit]').click()
    expect(workspace.locator('.experiment-counts dd')).to_have_text(['32,607', '397', '10,786', '2,720'], timeout=20000)
    workspace.get_by_role('checkbox', name='Pathway FDR ≤ 0.05', exact=True).check()
    expect(workspace.locator('.experiment-pagination').first).to_contain_text('1–20 of 71')
    expect(workspace.get_by_role('region', name='Pathway results').locator('tbody tr').first).to_contain_text('1.54e-15')
    page.screenshot(path=str(screenshots / 'public-mayo-ad-results.png'))
    assert all(method == 'GET' and data is None for method, _, data in requests)
    assert 'MAYO temporal cortex' not in page.evaluate('JSON.stringify(localStorage)')
    assert not errors, errors
    context.close()
    print('PASS: public MAYO AD results retain all 32,607 input genes, report 6,260 unresolved mappings, and reproduce 397 selected genes, 2,720 tested pathways and 71 pathway-BH results ≤0.05. This validates interpretation of supplied results, not the upstream disease model.')


def run(base_url: str, executable: str, screenshots: Path, public_ad_table: Path | None = None) -> None:
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
        expect(page.locator(".entity-heading").get_by_role("img", name="Gene", exact=True)).to_be_visible()
        entity_details = page.get_by_role("button", name="Entity details", exact=True)
        entity_details.focus()
        page.keyboard.press("Enter")
        expect(page.locator(".identifiers")).to_be_visible()
        expect(page.locator(".identifiers")).to_contain_text("apolipoprotein E")
        expect(page.locator(".identifiers")).to_contain_text("Gene")
        page.keyboard.press("Enter")
        expect(entity_details).to_have_attribute("aria-expanded", "false")
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
        expect(options).to_have_count(24)
        assert results.evaluate("element => element.scrollHeight > element.clientHeight")
        page_scroll = page.evaluate("window.scrollY")
        for _ in range(23):
            search.press("ArrowDown")
        expect(options.nth(23)).to_have_attribute("aria-selected", "true")
        assert results.evaluate("element => element.scrollTop > 0")
        active_visible = "element => { const bounds = element.getBoundingClientRect(); const active = element.querySelector('[aria-selected=true]').getBoundingClientRect(); const top = bounds.top + element.clientTop; return active.top >= top - 1 && active.bottom <= top + element.clientHeight + 1; }"
        assert results.evaluate(active_visible)
        assert abs(page.evaluate("window.scrollY") - page_scroll) <= 2
        search.press("ArrowDown")
        expect(options.nth(0)).to_have_attribute("aria-selected", "true")
        assert results.evaluate(active_visible)
        search.press("ArrowUp")
        expect(options.nth(23)).to_have_attribute("aria-selected", "true")
        assert results.evaluate("element => element.scrollTop > 0")
        assert results.evaluate(active_visible)
        assert abs(page.evaluate("window.scrollY") - page_scroll) <= 2
        search.press("Escape")
        print("PASS: entity changes reset only inspector scroll; keyboard search keeps wrapped active options visible without page movement.")

        search.fill("Alzheimer’s disease")
        expect(page.get_by_role("listbox").get_by_role("option")).to_have_count(1)
        expect(page.locator(".result-status")).to_contain_text("related")
        search.press("Enter")
        expect(page.locator(".selected-title")).to_have_text("Alzheimer's disease")
        expect(page.locator(".claim-button")).to_have_count(4)
        expect(search).to_have_value("")
        expect(search).to_have_attribute("aria-expanded", "false")
        expect(page.locator(".result-status")).to_have_text("24 entities · 7 papers")
        search.fill("APOE")
        expect(page.get_by_role("listbox").get_by_role("option")).to_have_count(7)
        search.press("ArrowDown")
        expect(page.get_by_role("listbox").get_by_role("option", selected=True)).to_contain_text("Corder et al. · 1993")
        search.press("Enter")
        expect(page.locator(".selected-title")).to_have_text("Corder et al. · 1993")
        expect(page.locator(".source-link")).to_have_attribute("href", "https://pubmed.ncbi.nlm.nih.gov/8346443/")
        expect(search).to_have_value("")
        search.fill("APOE")
        search.press("ArrowUp")
        expect(page.get_by_role("listbox").get_by_role("option", selected=True)).to_contain_text("Lessard et al. · 2018")
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
        expect(page.locator(".entity-row")).to_have_count(24)
        page.locator('.entity-row[data-entity-id="paper-corder-1994"]').click()
        expect(page.locator(".selected-title")).to_have_text("Corder et al. · 1994")
        expect(page.locator(".source-link")).to_have_attribute("href", "https://pubmed.ncbi.nlm.nih.gov/7920638/")
        gene_row = page.locator('.entity-row[data-entity-id="gene-abca1"]')
        gene_row.focus()
        page.keyboard.press("Enter")
        expect(page.locator(".selected-title")).to_have_text("ABCA1")
        expect(page.locator(".source-link")).to_have_attribute("href", "https://pubmed.ncbi.nlm.nih.gov/26079414/")
        filter_control.select_option("gene")
        expect(page.locator(".entity-row")).to_have_count(7)
        filter_control.select_option("paper")
        expect(page.locator(".entity-row")).to_have_count(7)
        page.get_by_role("button", name="Show in the current view").click()
        expect(filter_control).to_have_value("all")
        expect(page.locator(".entity-row")).to_have_count(24)
        page.get_by_role("button", name="About the data").click()
        expect(page.get_by_role("dialog")).to_be_visible()
        expect(page.get_by_role("dialog")).to_contain_text("Source-checked draft")
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
        graph_image = export_share_image(page, "graph", screenshots)
        page.get_by_role("button", name="Zoom in", exact=True).click()
        page.wait_for_timeout(900)
        zoomed_image = export_share_image(page, "graph-zoomed", screenshots)
        assert graph_image != zoomed_image, "Changing camera zoom must change the exported graph image"
        assert_idle(page, "Graph after image capture")
        page.get_by_role("button", name="List view", exact=True).click()
        export_share_image(page, "list", screenshots)
        assert not errors, errors
        print("PASS: desktop canvas picking, source URLs, disclosures, keyboard search, filters, list, dialogs, zoom, and graph/list PNG exports.")

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
        assert mobile_page.locator("canvas").evaluate("element => getComputedStyle(element).touchAction === 'none'")
        for name in ["Zoom in", "Zoom out"]:
            before = mobile_page.evaluate("window.__browserQA.draws")
            mobile_page.get_by_role("button", name=name, exact=True).tap()
            mobile_page.wait_for_function("before => window.__browserQA.draws > before", arg=before)
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
        expect(mobile_page.locator(".entity-row")).to_have_count(7)
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
        export_share_image(mobile_page, "mobile", screenshots, touch=True)
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
        expect(fallback_page.locator(".entity-row")).to_have_count(24)
        expect(fallback_page.get_by_role("button", name="Graph view", exact=True)).to_be_disabled()
        fallback_page.locator('.entity-row[data-entity-id="gene-trem2"]').click()
        expect(fallback_page.locator(".selected-title")).to_have_text("TREM2")
        expect(fallback_page.locator(".source-link")).to_have_attribute("href", "https://pubmed.ncbi.nlm.nih.gov/23150908/")
        fallback_page.screenshot(path=str(screenshots / "webgl-fallback.png"), full_page=True)
        export_share_image(fallback_page, "webgl-fallback", screenshots)
        fallback_page.goto(urlunsplit((*urlsplit(base_url)[:3], "", "entity=gene-trem2&claim=claim-trem2-r47h-risk")), wait_until="networkidle")
        expect(fallback_page.locator(".fallback-notice")).to_be_visible()
        expect(fallback_page.locator(".selected-title")).to_have_text("TREM2")
        expect(fallback_page.get_by_role("button", name="List view", exact=True)).to_have_attribute("aria-pressed", "true")
        expect(fallback_page.locator(".source-link")).to_have_attribute("href", "https://pubmed.ncbi.nlm.nih.gov/23150908/")
        print("PASS: unavailable WebGL preserves list selection, original evidence, and PNG export.")

        native = browser.new_context(viewport={"width": 1280, "height": 900})
        native.add_init_script("""
            window.__nativeShare = { mode: 'success', calls: [] };
            Object.defineProperty(navigator, 'canShare', { configurable: true, value: data =>
                data.files?.length === 1 && data.files[0].type === 'image/png' });
            Object.defineProperty(navigator, 'share', { configurable: true, value: async data => {
                if (window.__nativeShare.mode === 'cancel') throw new DOMException('Cancelled', 'AbortError');
                window.__nativeShare.calls.push({ type: data.files[0].type, size: data.files[0].size, name: data.files[0].name });
            } });
        """)
        native_page = native.new_page()
        native_page.goto(base_url, wait_until="networkidle")
        expect(native_page.locator("canvas")).to_be_visible()
        native_page.get_by_role("button", name="Share", exact=True).click()
        native_dialog = native_page.get_by_role("dialog", name="Share this view", exact=True)
        native_control = native_dialog.get_by_role("button", name="Share image", exact=True)
        expect(native_control).to_be_visible(timeout=10000)
        native_control.click()
        expect(native_control).to_be_enabled()
        shared = native_page.evaluate("window.__nativeShare.calls")
        assert len(shared) == 1 and shared[0]["type"] == "image/png" and shared[0]["size"] > 12000
        native_page.evaluate("window.__nativeShare.mode = 'cancel'")
        native_control.click()
        expect(native_control).to_be_enabled()
        expect(native_dialog.get_by_role("alert")).to_have_count(0)
        expect(native_dialog).to_be_visible()
        print("PASS: supported native sharing receives a real PNG; cancelling the native sheet is not an error.")
        assert_share_links(browser, base_url, screenshots)
        assert_export_retry(browser, base_url, screenshots)
        assert_themes(browser, base_url, screenshots)
        assert_comparisons(browser, base_url, screenshots)
        assert_pathways(browser, base_url, screenshots)
        assert_binding_findings(browser, base_url, screenshots)
        assert_study_context_note(browser, base_url, screenshots)
        assert_research_brief(browser, base_url, screenshots)
        assert_experiment_analysis(browser, base_url, screenshots)
        assert_identifier_mapping(browser, base_url, screenshots)
        if public_ad_table is not None:
            assert_public_ad_results(browser, base_url, screenshots, public_ad_table)
        browser.close()


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--url", default="http://127.0.0.1:5173/")
    parser.add_argument("--chromium", default="/usr/bin/chromium")
    parser.add_argument("--screenshots", type=Path, default=Path("artifacts/browser"))
    parser.add_argument("--mayo-table", type=Path, help="Optional externally held, documented MAYO validation conversion; never bundled.")
    options = parser.parse_args()
    run(options.url, options.chromium, options.screenshots, options.mayo_table)
