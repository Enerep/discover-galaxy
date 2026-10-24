"""Independent SciPy oracle for exported application pathway results.

Optional local QA only: requires an existing SciPy, installs nothing, fetches
nothing and is not part of the application runtime. Input is a normalized
gene/log2FoldChange/padj CSV/TSV, with symbols or human Ensembl gene IDs.
"""

import argparse
import csv
import hashlib
import json
import math
from pathlib import Path
import re


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--input', type=Path, required=True)
    parser.add_argument('--results', type=Path, required=True)
    parser.add_argument('--sha256', required=True, help='Expected normalized input bytes.')
    parser.add_argument('--identifier-type', choices=['symbol', 'ensembl'], required=True)
    parser.add_argument('--gene-fdr', type=float, default=0.05)
    parser.add_argument('--min-log2fc', type=float, default=1)
    args = parser.parse_args()
    from scipy.stats import false_discovery_control, hypergeom

    root = Path(__file__).resolve().parents[2]
    raw = args.input.read_bytes()
    assert len(raw) <= 5 * 1024 * 1024 and hashlib.sha256(raw).hexdigest() == args.sha256, 'Input digest/size differs.'
    records = list(csv.DictReader(raw.decode().splitlines(), delimiter='\t' if args.input.suffix == '.tsv' else ','))
    index = {}
    if args.identifier_type == 'ensembl':
        for hgnc, symbol, ensembl in json.loads((root / 'data/reference/hgnc-ensembl.json').read_text())['genes']:
            if ensembl:
                index.setdefault(ensembl, []).append((hgnc, symbol))
    identifiers, seen, stable_seen = [], set(), set()
    for row in records:
        original = row['gene'].strip()
        canonical = original
        if args.identifier_type == 'ensembl':
            assert re.fullmatch(r'ENSG[0-9]{11}(\.[0-9]+)?', original)
            stable = original.split('.')[0]
            assert stable not in stable_seen, 'Duplicate stable input.'
            stable_seen.add(stable)
            matches = index.get(stable, [])
            if len(matches) == 1:
                canonical = matches[0][1]
        assert canonical not in seen, 'Duplicate gene identity.'
        seen.add(canonical)
        values = [row[key].strip() for key in ['log2FoldChange', 'padj']]
        if any(value.upper() in ['', 'NA', 'N/A', 'NAN', 'NULL'] for value in values):
            continue
        fold, padj = map(float, values)
        assert math.isfinite(fold) and math.isfinite(padj) and 0 <= padj <= 1
        identifiers.append((canonical, padj <= args.gene_fdr and abs(fold) >= args.min_log2fc))
    background = {gene for gene, _ in identifiers}
    selected = {gene for gene, hit in identifiers if hit}
    sets = json.loads((root / 'data/reference/reactome-pathways.json').read_text())['pathways']
    expected = []
    for pathway in sets:
        members = background.intersection(pathway['genes'])
        if members:
            overlap = sorted(members.intersection(selected))
            expected.append((pathway['id'], len(members), overlap, float(hypergeom.sf(len(overlap) - 1, len(background), len(members), len(selected)))))
    adjusted = false_discovery_control([row[3] for row in expected], method='bh')
    actual_rows = json.loads(args.results.read_text())
    actual = {row['id']: row for row in actual_rows}
    assert len(actual) == len(actual_rows) == len(expected), 'Tested family differs.'
    absolute, relative = 0.0, 0.0
    for (identifier, measured, overlap, pvalue), qvalue in zip(expected, adjusted):
        row = actual[identifier]
        assert [row['backgroundSize'], row['selectedSize'], row['pathwayMeasuredSize'], row['overlapSize']] == [len(background), len(selected), measured, len(overlap)]
        assert row['overlapGenes'] == overlap
        for key, value in [('pValue', pvalue), ('adjustedPValue', float(qvalue))]:
            difference = abs(row[key] - value)
            absolute = max(absolute, difference)
            if value:
                relative = max(relative, difference / value)
            assert math.isclose(row[key], value, rel_tol=2e-8, abs_tol=2e-9), (identifier, key, row[key], value)
    print(f'PASS: N={len(background):,}; selected={len(selected):,}; all {len(expected):,} pathway counts, overlaps, p-values and BH values match SciPy.')
    print(f'Pathway BH <=0.05: {sum(value <= 0.05 for value in adjusted)}; max absolute error={absolute:.3g}; max relative error={relative:.3g}.')


if __name__ == '__main__':
    main()
