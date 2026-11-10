"""Focused browser checks for the source-linked APOE RNA explanation pilot.

Uses an already-running local production preview and the existing Python
Playwright/system Chromium setup. Positive fixtures are explicitly synthetic;
the optional pinned public MAYO input is a negative control at default cutoffs.
No provider requests, package installs, or uploads are performed.
"""

import argparse
import hashlib
import json
from pathlib import Path
import re
import runpy
from urllib.parse import urlsplit

from playwright.sync_api import expect, sync_playwright


ROOT = Path(__file__).resolve().parents[1]
HELPERS = runpy.run_path(str(Path(__file__).with_name("browser-smoke.py")))
PATHWAYS = json.loads((ROOT / "data/reference/reactome-pathways.json").read_text())["pathways"]
PATHWAY = next(item for item in PATHWAYS if item["id"] == "R-HSA-174824")
UNRELATED_PATHWAY = next(item for item in PATHWAYS if "ACTB" in item["genes"] and "APOE" not in item["genes"])
CATALOG = json.loads((ROOT / "data/interpretation/apoe-bulk-rna-sources.json").read_text())
FALLBACK = """const original = HTMLCanvasElement.prototype.getContext;
HTMLCanvasElement.prototype.getContext = function(kind, ...args) {
  return kind.startsWith('webgl') ? null : original.call(this, kind, ...args);
};"""
WORKER_SPY = """window.__explanationWorkerMessages = [];
const OriginalWorker = window.Worker;
window.Worker = class extends OriginalWorker {
  postMessage(message, ...rest) {
    window.__explanationWorkerMessages.push(JSON.stringify(message));
    return super.postMessage(message, ...rest);
  }
};"""


def upload(form, *, negative=False, ensembl=False, filename="synthetic-apoe-explanations.csv"):
    gene = "ENSG00000130203.9" if ensembl else "APOE"
    extra = "ENSG00000075624.17" if ensembl else "ACTB"
    data = f"gene,log2FoldChange,padj\n{gene},{'-2.25' if negative else '2.25'},.0123\n{extra},.1,.9\n"
    form.get_by_label("Human RNA-seq results", exact=True).set_input_files(
        {"name": filename, "mimeType": "text/csv", "buffer": data.encode()})


def context_inputs(form):
    details = form.locator(".experiment-context-input")
    if details.get_attribute("open") is None:
        details.locator(":scope > summary").click()
    return details


def declare_context(form, *, sample="bulk_brain_tissue", design="observational"):
    details = context_inputs(form)
    details.get_by_role("textbox", name="Tissue or cell model", exact=True).fill("QA cortex model")
    details.get_by_role("textbox", name="Treatment or condition", exact=True).fill("QA observed groups")
    details.get_by_role("combobox", name="Study design", exact=True).select_option(design)
    details.get_by_role("combobox", name="Sample type", exact=True).select_option(sample)


def apply(form, workspace, comparison="QA APOE interpretation"):
    form.get_by_role("textbox", name="Comparison", exact=True).fill(comparison)
    form.get_by_role("checkbox", name="This table contains all tested genes", exact=True).check()
    form.locator("button[type=submit]").click()
    expect(form.locator("button[type=submit]")).to_be_enabled(timeout=15000)
    expect(workspace.locator("#experiment-results-title")).to_have_text(comparison)


def choose_pathway(workspace, pathway=PATHWAY):
    workspace.get_by_role("searchbox", name="Find pathways", exact=True).fill(pathway["id"])
    workspace.get_by_role("button", name=pathway["name"], exact=True).click()
    expect(workspace.locator("#experiment-pathway-title")).to_have_text(pathway["name"])


def open_report(page, workspace):
    report = workspace.locator(".experiment-explanations")
    expect(report).to_have_count(1)
    if report.get_attribute("open") is None:
        summary = report.locator(":scope > summary")
        summary.focus()
        page.keyboard.press("Enter")
    return report


def inspect_report(page, report, *, negative=False, ensembl=False):
    expect(report.locator("h4")).to_have_text(f"What could contribute to {'lower' if negative else 'higher'} APOE RNA?")
    expect(report.locator(".experiment-explanation-observation dd").nth(0)).to_have_text("-2.25" if negative else "+2.25")
    expect(report.locator(".experiment-explanation-observation dd").nth(1)).to_have_text("0.0123")
    expect(report).to_contain_text("Applied cutoffs: gene FDR ≤ 0.05; |log₂ fold change| ≥ 1.")
    expect(report.locator(".experiment-explanation-alternative")).to_have_count(2)
    expect(report).to_contain_text("Both contributions may occur together")
    expect(report).to_contain_text("same cohort")
    expect(report).to_contain_text("not independent replication")
    expect(report).to_contain_text("reanalysis")
    expect(report.get_by_role("region", name="Proposed follow-up", exact=True)).to_contain_text("matched donors")
    report.get_by_text("Measurement limits", exact=True).click()
    expect(report).to_contain_text("not independent biological replicates")
    expect(report).to_contain_text("not direct tissue cell proportions")
    report.get_by_text("Applied context and scope", exact=True).click()
    expect(report).to_contain_text("QA cortex model")
    expect(report).to_contain_text("Bulk brain tissue")
    if ensembl:
        expect(report).to_contain_text("ENSG00000130203.9")
    for source in CATALOG["sources"]:
        expect(report.locator(f'a[href="{source["url"]}"]').first).to_be_visible()
        expect(report).to_contain_text(source["premise"])
        for locator in source["locators"]:
            expect(report.locator(f'a[href="{locator["url"]}"]').first).to_have_count(1)
        notice = source["publication_status"]["notice_url"]
        if notice:
            expect(report.locator(f'a[href="{notice}"]').first).to_be_visible()
    for control in [report.locator(":scope > summary"), report.locator("h4"), report.locator("p").first,
                    report.locator("a").first, report.locator(".experiment-explanation-alternative h5").first]:
        HELPERS["assert_text_contrast"](control)
    assert page.evaluate("document.documentElement.scrollWidth <= innerWidth"), "Explanation content must fit viewport."


def run_context(browser, url, screenshots, *, mobile=False, fallback=False):
    label = "fallback" if fallback else "mobile-dark" if mobile else "desktop-light"
    context = browser.new_context(viewport={"width": 360 if mobile else 1440, "height": 844 if mobile else 1000},
                                  color_scheme="dark" if mobile else "light", reduced_motion="reduce",
                                  is_mobile=mobile, has_touch=mobile)
    context.add_init_script(WORKER_SPY)
    if fallback:
        context.add_init_script(FALLBACK)
    page = context.new_page()
    errors, requests, reconciliation_errors = [], [], []
    page.on("pageerror", lambda error: errors.append(str(error)))
    page.on("console", lambda message: reconciliation_errors.append(message.text) if "same key" in message.text else None)
    page.on("request", lambda request: requests.append((request.method, request.url, request.post_data)))
    page.goto(url, wait_until="networkidle")
    nav = page.get_by_role("navigation", name="Workspace", exact=True)
    nav.get_by_role("button", name="Analyze results", exact=True).click()
    workspace = page.get_by_role("main", name="Analyze results", exact=True)
    form = workspace.get_by_role("form", name="RNA-seq analysis")
    upload(form, negative=fallback, ensembl=fallback)
    apply(form, workspace)
    choose_pathway(workspace)
    expect(workspace.locator(".experiment-explanations")).to_have_count(0)
    declare_context(form)
    apply(form, workspace)
    choose_pathway(workspace)
    report = open_report(page, workspace)
    inspect_report(page, report, negative=fallback, ensembl=fallback)
    expected_pathway_fdr = workspace.get_by_role("region", name="Pathway results", exact=True).locator("tbody tr td").last.inner_text()
    expect(report.locator(".experiment-explanation-observation dd").nth(3)).to_have_text(expected_pathway_fdr)
    report.scroll_into_view_if_needed()
    page.screenshot(path=str(screenshots / f"apoe-explanations-{label}.png"), full_page=True)
    report.screenshot(path=str(screenshots / f"apoe-explanations-{label}-detail.png"))

    # Pending metadata and a failed reapply must not replace the applied report.
    fields = context_inputs(form)
    fields.get_by_role("textbox", name="Tissue or cell model", exact=True).fill("QA pending model")
    fields.get_by_role("combobox", name="Sample type", exact=True).select_option("other")
    expect(report).not_to_contain_text("QA pending model")
    reference_route = re.compile(r".*/reactome-pathways(?:-[^/?]+)?\.json(?:\?.*)?$")
    page.route(reference_route, lambda route: route.abort(), times=1)
    form.locator("button[type=submit]").click()
    expect(workspace.get_by_role("alert")).to_contain_text("Unable to load the pathway reference")
    expect(report).to_be_visible()
    expect(report).to_contain_text("QA cortex model")
    form.locator("button[type=submit]").click()
    expect(workspace.locator(".experiment-explanations")).to_have_count(0)
    declare_context(form)
    apply(form, workspace)
    choose_pathway(workspace)
    report = open_report(page, workspace)

    # Explorer navigation keeps this applied analysis and disclosure state.
    workspace.get_by_role("button", name="View APOE evidence", exact=True).click()
    expect(page.locator(".selected-title")).to_have_text("APOE")
    nav.get_by_role("button", name="Analyze results", exact=True).click()
    expect(report).to_have_attribute("open", "")

    if not mobile and not fallback:
        choose_pathway(workspace, UNRELATED_PATHWAY)
        expect(workspace.locator(".experiment-explanations")).to_have_count(0)
        choose_pathway(workspace)
        for sample, design in [("unspecified", "observational"), ("bulk_brain_tissue", "perturbation")]:
            declare_context(form, sample=sample, design=design)
            apply(form, workspace)
            expect(workspace.locator(".experiment-explanations")).to_have_count(0)
        declare_context(form)
        apply(form, workspace)
        choose_pathway(workspace)
        open_report(page, workspace)

    # A stricter cutoff removes the selected APOE and therefore the pilot.
    form.get_by_role("spinbutton", name="Gene FDR", exact=True).fill("0.001")
    form.locator("button[type=submit]").click()
    expect(workspace.locator(".experiment-explanations")).to_have_count(0)
    form.get_by_role("spinbutton", name="Gene FDR", exact=True).fill("0.05")
    form.get_by_role("button", name="Remove results", exact=True).click()
    expect(fields.get_by_role("combobox", name="Sample type", exact=True)).to_have_value("unspecified")
    expect(workspace.locator(".experiment-results")).to_have_count(0)

    # Only the authored example owns synthetic provenance, even after edits.
    workspace.get_by_role("button", name="Try example", exact=True).click()
    expect(workspace.locator("#experiment-results-title")).to_have_text("Synthetic example: treatment / control")
    declare_context(form)
    apply(form, workspace, comparison="QA edited example label")
    choose_pathway(workspace)
    report = open_report(page, workspace)
    expect(report.locator(":scope > summary")).to_have_text("Example explanations")
    expect(report).to_have_attribute("data-synthetic", "true")
    expect(report).to_contain_text("Synthetic example · invented measurements")
    sensitivity = workspace.locator(".experiment-sensitivity")
    sensitivity.get_by_text("Threshold sensitivity", exact=True).click()
    expect(sensitivity.locator(".experiment-sensitivity-count")).to_contain_text("of 9 settings", timeout=15000)
    worker_messages = page.evaluate("window.__explanationWorkerMessages")
    assert worker_messages, "Expected actual local-worker sensitivity check."
    assert all("bulk_brain_tissue" not in message and "QA cortex model" not in message for message in worker_messages)
    upload(form, filename="synthetic-replacement.csv")
    expect(fields.get_by_role("combobox", name="Sample type", exact=True)).to_have_value("unspecified")
    expect(report).to_have_attribute("data-synthetic", "true")
    apply(form, workspace)
    expect(workspace.locator(".experiment-explanations")).to_have_count(0)
    form.get_by_role("button", name="Remove results", exact=True).click()

    assert all(method == "GET" and data is None for method, _, data in requests), requests
    assert all(urlsplit(request_url).netloc in ("", urlsplit(url).netloc) for _, request_url, _ in requests), "No automatic scientific-provider request is allowed."
    storage = page.evaluate("JSON.stringify({local:{...localStorage},session:{...sessionStorage}})")
    assert not any(value in storage or value in page.url for value in ["QA cortex", "QA pending", "QA APOE", "synthetic-replacement", "bulk_brain_tissue"])
    assert not errors, errors
    assert not reconciliation_errors, reconciliation_errors
    context.close()
    print(f"PASS: {label} APOE pilot gates, direction, citations, applied-state boundaries, synthetic provenance, privacy and accessible layout.")


def run_mayo(browser, url, path):
    expected = "0f084d65603e1608c8293300ce0b00ccf5dab6d3bf93321cbd3179d688f61c09"
    assert hashlib.sha256(path.read_bytes()).hexdigest() == expected, "MAYO table differs from pinned conversion."
    context = browser.new_context(viewport={"width": 1440, "height": 1000}, reduced_motion="reduce")
    page = context.new_page()
    page.goto(url, wait_until="networkidle")
    page.get_by_role("navigation", name="Workspace", exact=True).get_by_role("button", name="Analyze results", exact=True).click()
    workspace = page.get_by_role("main", name="Analyze results", exact=True)
    form = workspace.get_by_role("form", name="RNA-seq analysis")
    form.get_by_label("Human RNA-seq results", exact=True).set_input_files(path)
    declare_context(form)
    form.get_by_role("textbox", name="Comparison", exact=True).fill("MAYO temporal cortex: author-coded AD / Control")
    form.get_by_role("checkbox", name="This table contains all tested genes", exact=True).check()
    form.locator("button[type=submit]").click()
    form.get_by_role("checkbox", name="Keep unresolved IDs unannotated in the eligible background", exact=True).check()
    form.locator("button[type=submit]").click()
    expect(workspace.locator("#experiment-results-title")).to_have_text("MAYO temporal cortex: author-coded AD / Control", timeout=15000)
    expect(workspace.locator(".experiment-counts dd")).to_have_text(["32,607", "397", "10,786", "2,720"])
    choose_pathway(workspace)
    expect(workspace.locator(".experiment-explanations")).to_have_count(0)
    context.close()
    print("PASS: pinned real MAYO table retains default results and suppresses the pilot because APOE fails the applied cutoffs.")


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--url", default="http://127.0.0.1:4173/")
    parser.add_argument("--executable", default="/usr/bin/chromium")
    parser.add_argument("--screenshots", type=Path, default=ROOT / "artifacts/apoe-explanations")
    parser.add_argument("--mayo-table", type=Path)
    args = parser.parse_args()
    args.screenshots.mkdir(parents=True, exist_ok=True)
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(executable_path=args.executable, headless=True,
            args=["--no-sandbox", "--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"])
        run_context(browser, args.url, args.screenshots)
        run_context(browser, args.url, args.screenshots, mobile=True)
        run_context(browser, args.url, args.screenshots, fallback=True)
        if args.mayo_table:
            run_mayo(browser, args.url, args.mayo_table)
        browser.close()


if __name__ == "__main__":
    main()
