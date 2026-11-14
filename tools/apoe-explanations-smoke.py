"""Focused browser checks for the source-linked APOE RNA explanation pilot.

Uses an already-running local production preview and the existing Python
Playwright/system Chromium setup. Built-in positive fixtures are synthetic;
optional hash-pinned external tables cover a real positive case and the public
MAYO negative control at default cutoffs. Real tables stay outside this repo.
No provider requests, package installs, or uploads are performed.
"""

import argparse
import hashlib
import json
import math
from pathlib import Path
import re
import runpy
from urllib.parse import parse_qs, unquote, urlsplit

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


def declare_context(form, *, sample="bulk_brain_tissue", design="observational",
                    model="QA cortex model", condition="QA observed groups"):
    details = context_inputs(form)
    details.get_by_role("textbox", name="Tissue or cell model", exact=True).fill(model)
    details.get_by_role("textbox", name="Treatment or condition", exact=True).fill(condition)
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


def probability_text(page, value):
    # Check the public display precision against independently supplied values.
    return page.evaluate("""value => value === 0 ? '0 (reported)' : value < .001
        ? value.toExponential(2) : Number(value.toPrecision(3)).toString()""", value)


def inspect_report(page, report, *, negative=False, ensembl=False, observation=None,
                   model="QA cortex model", condition="QA observed groups"):
    fold_change = observation["log2_fold_change"] if observation else -2.25 if negative else 2.25
    gene_fdr = observation["adjusted_p"] if observation else .0123
    signed = page.evaluate("value => `${value > 0 ? '+' : ''}${value}`", fold_change)
    expect(report.locator("h4")).to_have_text(f"What could contribute to {'lower' if fold_change < 0 else 'higher'} APOE RNA?")
    expect(report.locator(".experiment-explanation-observation dd").nth(0)).to_have_text(signed)
    expect(report.locator(".experiment-explanation-observation dd").nth(1)).to_have_text(probability_text(page, gene_fdr))
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
    expect(report).to_contain_text("Nuclear APOE RNA can differ from whole-cell or bulk RNA")
    report.get_by_text("Applied context and scope", exact=True).click()
    expect(report).to_contain_text(model)
    expect(report).to_contain_text(condition)
    expect(report).to_contain_text("Bulk brain tissue")
    expect(report).to_contain_text("interpretation context, not validation of this experiment")
    expect(report).to_contain_text("No disease status, brain region, genotype or causal effect is inferred")
    expect(report).to_contain_text("cannot choose a winning explanation")
    if observation:
        expect(report.locator("dt").filter(has_text=re.compile("^Original input ID$")).locator("..").locator("dd")).to_have_text(observation["original_id"])
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


def read_real_manifest(table, manifest_path):
    manifest = json.loads(manifest_path.read_text())
    assert manifest["schema_version"] == 1, "Unsupported real-validation manifest."
    assert manifest["identifier_type"] in ("symbol", "ensembl", "ncbi_gene"), "Declare the real input identifier namespace."
    assert manifest["thresholds"] == {"adjustedPMax": .05, "minAbsLog2FoldChange": 1}, "Keep the default cutoffs."
    raw = table.read_bytes()
    assert len(raw) <= 5 * 1024 * 1024, "Real table exceeds the application's input limit."
    assert hashlib.sha256(raw).hexdigest() == manifest["normalized_sha256"], "Real table differs from the pinned full-table conversion."
    assert not table.resolve().is_relative_to(ROOT), "Keep real full tables outside the repository."
    context = manifest["context"]
    assert context["design"] == "observational" and context["sampleType"] == "bulk_brain_tissue"
    assert context["model"] and context["condition"] and manifest["comparison"], "Use the actual recorded experiment context."
    expected = manifest["expected"]
    observation = expected["apoe"]
    assert observation["symbol"] == "APOE" and observation["original_id"]
    assert math.isfinite(observation["log2_fold_change"]) and abs(observation["log2_fold_change"]) >= 1
    assert math.isfinite(observation["adjusted_p"]) and 0 <= observation["adjusted_p"] <= .05
    pathway = next(item for item in PATHWAYS if item["id"] == expected["pathway"]["id"])
    assert pathway["name"] == expected["pathway"]["name"] and "APOE" in pathway["genes"]
    assert 0 < expected["pathway"]["k"] <= expected["pathway"]["K"]
    assert all(isinstance(expected[key], int) and expected[key] >= 0 for key in
               ["background", "selected", "reference_mapped", "family", "input_rows", "incomplete"])
    return manifest


def run_real(browser, url, screenshots, table, manifest, *, mobile=False, fallback=False):
    label = "fallback" if fallback else "mobile-dark" if mobile else "desktop-light"
    expected, recorded_context = manifest["expected"], manifest["context"]
    pathway, observation = expected["pathway"], expected["apoe"]
    context = browser.new_context(viewport={"width": 360 if mobile else 1440, "height": 844 if mobile else 1000},
                                  color_scheme="dark" if mobile else "light", reduced_motion="reduce",
                                  is_mobile=mobile, has_touch=mobile)
    if fallback:
        context.add_init_script(FALLBACK)
    page = context.new_page()
    errors, requests, reconciliation_errors = [], [], []
    page.on("pageerror", lambda error: errors.append(str(error)))
    page.on("console", lambda message: reconciliation_errors.append(message.text) if "same key" in message.text else None)
    page.on("request", lambda request: requests.append((request.method, request.url, request.post_data)))
    page.goto(url, wait_until="networkidle")
    expect(page.locator("html")).to_have_attribute("data-theme", "dark" if mobile else "light")
    assert page.evaluate("matchMedia('(prefers-reduced-motion: reduce)').matches")
    if fallback:
        expect(page.locator(".fallback-notice")).to_have_text("3D unavailable · List view")
    initial_storage = page.evaluate("JSON.stringify({local:{...localStorage},session:{...sessionStorage}})")
    nav = page.get_by_role("navigation", name="Workspace", exact=True)
    nav.get_by_role("button", name="Analyze results", exact=True).click()
    workspace = page.get_by_role("main", name="Analyze results", exact=True)
    form = workspace.get_by_role("form", name="RNA-seq analysis")
    form.get_by_label("Human RNA-seq results", exact=True).set_input_files(table)
    expect(form.get_by_role("spinbutton", name="Gene FDR", exact=True)).to_have_value("0.05")
    expect(form.get_by_role("spinbutton", name="|log₂ fold change|", exact=True)).to_have_value("1")
    form.get_by_role("textbox", name="Comparison", exact=True).fill(manifest["comparison"])
    form.get_by_role("checkbox", name="This table contains all tested genes", exact=True).check()
    ncbi_confirmation = form.get_by_role("checkbox", name="These are NCBI Gene IDs (Entrez), not row numbers", exact=True)
    if manifest["identifier_type"] == "ncbi_gene":
        expect(ncbi_confirmation).not_to_be_checked()
        form.locator("button[type=submit]").click()
        expect(workspace.locator(".experiment-results")).to_have_count(0)
        expect(form.get_by_role("region", name="Identifier review", exact=True)).to_have_count(0)
        assert not any(re.search(r"/hgnc-ncbi-gene(?:-[^/?]+)?\.json(?:\?.*)?$", request_url) for _, request_url, _ in requests), "Unconfirmed numeric rows must not load an identifier reference."
        ncbi_confirmation.check()
    form.locator("button[type=submit]").click()
    if manifest["allow_unresolved_ids"]:
        acknowledgement = form.get_by_role("checkbox", name="Keep unresolved IDs unannotated in the eligible background", exact=True)
        expect(acknowledgement).to_be_visible(timeout=20000)
        acknowledgement.check()
        form.locator("button[type=submit]").click()
    expect(workspace.locator("#experiment-results-title")).to_have_text(manifest["comparison"], timeout=20000)
    counts = [f'{expected[key]:,}' for key in ["background", "selected", "reference_mapped", "family"]]
    expect(workspace.locator(".experiment-counts dd")).to_have_text(counts)
    expect(workspace.locator(".experiment-results-heading")).to_contain_text(f'{table.name} · {expected["input_rows"]:,} uploaded rows')
    choose_pathway(workspace, pathway)
    expect(workspace.locator(".experiment-explanations")).to_have_count(0)

    # Actual context enables the report without changing selection or enrichment.
    declare_context(form, sample=recorded_context["sampleType"], design=recorded_context["design"],
                    model=recorded_context["model"], condition=recorded_context["condition"])
    apply(form, workspace, comparison=manifest["comparison"])
    choose_pathway(workspace, pathway)
    expect(workspace.locator(".experiment-counts dd")).to_have_text(counts)
    pathway_cells = workspace.get_by_role("region", name="Pathway results", exact=True).locator("tbody tr td")
    expected_q = probability_text(page, pathway["adjusted_p"])
    expect(pathway_cells).to_have_text([f'{pathway["k"]:,}', f'{pathway["K"]:,}', expected_q])
    report = open_report(page, workspace)
    expect(report.locator(":scope > summary")).to_have_text("Possible explanations")
    expect(report).to_have_attribute("data-synthetic", "false")
    expect(report).not_to_contain_text("Synthetic example")
    inspect_report(page, report, observation=observation,
                   model=recorded_context["model"], condition=recorded_context["condition"])
    expect(report.locator(".experiment-explanation-observation dd").nth(2)).to_have_text(f'{pathway["k"]} of {pathway["K"]} eligible')
    expect(report.locator(".experiment-explanation-observation dd").nth(3)).to_have_text(expected_q)
    for source, article in zip(CATALOG["sources"], report.locator(".experiment-explanation-source").all()):
        article.get_by_text("Source locations and checks", exact=True).click()
        expect(article).to_contain_text(source["study_context"]["tissue"])
        expect(article).to_contain_text(source["study_context"]["design"])
        expect(article).to_contain_text(source["study_context"]["replicate_unit"])
        expect(article.locator("dt").filter(has_text=re.compile("^Participants$")).locator("..").locator("dd")).to_have_text(str(source["study_context"]["participants"]))
        expect(article.locator("dt").filter(has_text=re.compile("^Nuclei$")).locator("..").locator("dd")).to_have_text(str(source["study_context"]["nuclei"]) if source["study_context"]["nuclei"] is not None else "Not recorded")
        expect(article).to_contain_text(source["publication_status"]["scope"])
        for limitation in source["limitations"]:
            expect(article).to_contain_text(limitation)
        article.get_by_text("Source locations and checks", exact=True).click()
    methods = workspace.locator(".experiment-methods")
    methods.locator(":scope > summary").click()
    expect(methods).to_contain_text(f'{expected["incomplete"]:,} incomplete rows remain in the uploaded input')
    expect(methods).to_contain_text(f'correction across all {expected["family"]:,} pathways with eligible members, including zero-overlap pathways')
    methods.locator(":scope > summary").click()
    report.scroll_into_view_if_needed()
    page.screenshot(path=str(screenshots / f"real-apoe-explanations-{label}.png"), full_page=True)
    report.screenshot(path=str(screenshots / f"real-apoe-explanations-{label}-detail.png"))

    # APOE can occur beyond the first member page in a full real table.
    gene_action = workspace.get_by_role("button", name="View APOE evidence", exact=True)
    next_members = workspace.get_by_role("navigation", name="Eligible member pages", exact=True).get_by_role("button", name="Next", exact=True)
    for _ in range(math.ceil(pathway["K"] / 20)):
        if gene_action.count():
            break
        expect(next_members).to_be_enabled()
        next_members.click()
    gene_action.click()
    expect(page.locator(".selected-title")).to_have_text("APOE")
    inspector = page.get_by_role("region", name="Your RNA-seq result", exact=True)
    expect(inspector.locator("dt").filter(has_text=re.compile("^Input ID$")).locator("..").locator("dd")).to_have_text(observation["original_id"])
    expect(inspector.locator("dt").filter(has_text=re.compile("^log₂ fold change$")).locator("..").locator("dd")).to_have_text(page.evaluate("value => String(value)", observation["log2_fold_change"]))
    expect(inspector).to_contain_text(probability_text(page, observation["adjusted_p"]))
    expect(inspector).to_contain_text("Meets gene cutoffs")
    nav.get_by_role("button", name="Analyze results", exact=True).click()
    expect(workspace.locator("#experiment-pathway-title")).to_have_text(pathway["name"])
    expect(workspace.locator(".experiment-counts dd")).to_have_text(counts)
    expect(report).to_have_attribute("open", "")

    # This also works for a supplied adjusted p-value of zero.
    form.get_by_role("spinbutton", name="|log₂ fold change|", exact=True).fill(str(abs(observation["log2_fold_change"]) + 1))
    form.locator("button[type=submit]").click()
    expect(form.locator("button[type=submit]")).to_be_enabled(timeout=20000)
    expect(workspace.locator(".experiment-explanations")).to_have_count(0)
    form.get_by_role("spinbutton", name="|log₂ fold change|", exact=True).fill("1")
    if manifest["identifier_type"] == "ncbi_gene":
        # Re-selecting the identical path does not emit change in Chromium.
        form.get_by_label("Human RNA-seq results", exact=True).set_input_files(
            {"name": f"replacement-{table.name}", "mimeType": "text/csv", "buffer": table.read_bytes()})
        expect(ncbi_confirmation).not_to_be_checked()
    form.get_by_role("button", name="Remove results", exact=True).click()
    fields = context_inputs(form)
    for name in ["Tissue or cell model", "Treatment or condition"]:
        expect(fields.get_by_role("textbox", name=name, exact=True)).to_have_value("")
    for name in ["Sample type", "Study design"]:
        expect(fields.get_by_role("combobox", name=name, exact=True)).to_have_value("unspecified")
    expect(workspace.locator(".experiment-results")).to_have_count(0)
    expect(page.locator(".experiment-observation")).to_have_count(0)
    expect(form.get_by_label("Human RNA-seq results", exact=True)).to_have_value("")
    expect(form.get_by_role("checkbox", name="This table contains all tested genes", exact=True)).not_to_be_checked()
    if manifest["identifier_type"] == "ncbi_gene":
        form.get_by_label("Human RNA-seq results", exact=True).set_input_files(table)
        expect(ncbi_confirmation).not_to_be_checked()
        form.get_by_role("button", name="Remove results", exact=True).click()
    assert page.evaluate("JSON.stringify({local:{...localStorage},session:{...sessionStorage}})") == initial_storage, "Real input must not be persisted."
    private_values = [manifest["comparison"], recorded_context["model"], recorded_context["condition"], table.name,
                      str(observation["log2_fold_change"]), str(observation["adjusted_p"])]
    assert not any(value in unquote(page.url) for value in private_values), "Real context/statistics must stay outside shared URLs."
    assert all(method == "GET" and body is None for method, _, body in requests), "Real input must not be uploaded."
    for _, request_url, _ in requests:
        parsed = urlsplit(request_url)
        assert parsed.netloc in ("", urlsplit(url).netloc), "No automatic scientific-provider request is allowed."
        assert not any(value in unquote(request_url) for value in private_values), "Real input must stay outside asset requests."
        assert all(observation["original_id"] not in values for values in parse_qs(parsed.query).values()), "Do not transmit the input identifier."
    assert not errors, errors
    assert not reconciliation_errors, reconciliation_errors
    context.close()
    print(f"PASS: {label} pinned real full-table positive path, default counts, APOE identity/statistics, source limits, navigation, stricter-cutoff gate, removal and tab-only privacy.")


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--url", default="http://127.0.0.1:4173/")
    parser.add_argument("--executable", default="/usr/bin/chromium")
    parser.add_argument("--screenshots", type=Path, default=ROOT / "artifacts/apoe-explanations")
    parser.add_argument("--mayo-table", type=Path)
    parser.add_argument("--real-table", type=Path, help="Externally held normalized full table; never fetched or bundled.")
    parser.add_argument("--real-manifest", type=Path, help="Committed validation manifest with input hash, actual context and independent expected results.")
    args = parser.parse_args()
    if bool(args.real_table) != bool(args.real_manifest):
        parser.error("--real-table and --real-manifest must be supplied together")
    real_manifest = read_real_manifest(args.real_table, args.real_manifest) if args.real_table else None
    args.screenshots.mkdir(parents=True, exist_ok=True)
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(executable_path=args.executable, headless=True,
            args=["--no-sandbox", "--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"])
        run_context(browser, args.url, args.screenshots)
        run_context(browser, args.url, args.screenshots, mobile=True)
        run_context(browser, args.url, args.screenshots, fallback=True)
        if args.mayo_table:
            run_mayo(browser, args.url, args.mayo_table)
        if real_manifest:
            run_real(browser, args.url, args.screenshots, args.real_table, real_manifest)
            run_real(browser, args.url, args.screenshots, args.real_table, real_manifest, mobile=True)
            run_real(browser, args.url, args.screenshots, args.real_table, real_manifest, fallback=True)
        browser.close()


if __name__ == "__main__":
    main()
