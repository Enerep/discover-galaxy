"""Independent SciPy sensitivity and Python set-overlap oracle. Local QA only."""

import argparse
import csv
import hashlib
import json
import math
from pathlib import Path


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--input', type=Path, required=True)
    parser.add_argument('--results', type=Path, required=True, help='JSON containing sensitivity, grouping and original baseline.')
    parser.add_argument('--sha256', required=True)
    args = parser.parse_args()
    from scipy.stats import false_discovery_control, hypergeom
    root = Path(__file__).resolve().parents[2]
    raw = args.input.read_bytes()
    assert hashlib.sha256(raw).hexdigest() == args.sha256, 'Input differs from pinned validation bytes.'
    index = {}
    for hgnc, symbol, ensembl in json.loads((root / 'data/reference/hgnc-ensembl.json').read_text())['genes']:
        if ensembl:
            index.setdefault(ensembl, []).append((hgnc, symbol))
    rows = []
    for record in csv.DictReader(raw.decode().splitlines()):
        original = record['gene']
        matches = index.get(original.split('.')[0], [])
        gene = matches[0][1] if len(matches) == 1 else original
        values = [record['log2FoldChange'], record['padj']]
        if any(value.upper() in ['', 'NA', 'N/A', 'NULL', 'NAN'] for value in values):
            continue
        fold, padj = map(float, values)
        assert math.isfinite(fold) and math.isfinite(padj) and 0 <= padj <= 1
        rows.append((gene, fold, padj))
    background = {row[0] for row in rows}
    assert len(background) == len(rows), 'Gene identities must be unique.'
    pathways = json.loads((root / 'data/reference/reactome-pathways.json').read_text())['pathways']
    profiles = {row['id']: background.intersection(row['genes']) for row in pathways}
    profiles = {identifier: genes for identifier, genes in profiles.items() if genes}
    actual = json.loads(args.results.read_text())
    report = actual['sensitivity']
    assert report['backgroundSize'] == len(background)
    assert len(report['settings']) == len(report['geneFdrValues']) * len(report['foldChangeValues'])
    assert sum(row['applied'] for row in report['settings']) == 1
    max_absolute, max_relative = 0.0, 0.0
    for setting in report['settings']:
        cutoffs = setting['thresholds']
        selected = {gene for gene, fold, padj in rows if padj <= cutoffs['adjustedPMax'] and abs(fold) >= cutoffs['minAbsLog2FoldChange']}
        assert setting['selectedCount'] == len(selected)
        assert setting['pathwayCount'] == len(profiles)
        expected = [(identifier, len(genes & selected), hypergeom.sf(len(genes & selected) - 1, len(background), len(genes), len(selected))) for identifier, genes in profiles.items()]
        adjusted = false_discovery_control([row[2] for row in expected], method='bh')
        observed = {row['id']: row for row in setting['results']}
        assert len(observed) == len(setting['results']) == len(profiles)
        assert setting['significantCount'] == sum(value <= 0.05 for value in adjusted)
        for (identifier, hits, _), value in zip(expected, adjusted):
            row = observed[identifier]
            assert row['overlapSize'] == hits
            difference = abs(row['adjustedPValue'] - value)
            max_absolute = max(max_absolute, difference)
            if value:
                max_relative = max(max_relative, difference / value)
            assert math.isclose(row['adjustedPValue'], value, rel_tol=2e-8, abs_tol=2e-9), (identifier, value, row)
    # Deliberately use a simple all-representative search, independently of the
    # application's inverted candidate index. Ranking uses its recorded baseline.
    expected_groups = []
    baseline = sorted(actual['baseline'], key=lambda row: (row['logAdjustedPValue'], row['logPValue'], row['id']))
    assert {row['id'] for row in baseline} == set(profiles)
    for pathway in baseline:
        members = profiles[pathway['id']]
        best, best_score, shared_count = None, 0, 0
        for group_index, group in enumerate(expected_groups):
            reference = profiles[group['representativeId']]
            shared = len(members & reference)
            union = len(members | reference)
            if 2 * shared < union:
                continue
            score = shared / union
            if score > best_score:
                best, best_score, shared_count = group_index, score, shared
        entry = {'id': pathway['id'], 'jaccard': best_score if best is not None else 1,
                 'sharedCount': shared_count if best is not None else len(members), 'eligibleSize': len(members)}
        if best is None:
            expected_groups.append({'representativeId': pathway['id'], 'members': [entry]})
        else:
            expected_groups[best]['members'].append(entry)
    assert actual['grouping']['groups'] == expected_groups, 'Representative grouping differs from independent set calculation.'
    assert actual['grouping']['pathwayCount'] == len(profiles)
    print(f'PASS: all {len(report["settings"])} settings × {len(profiles):,} pathways match SciPy; N={len(background):,} stays fixed.')
    print(f'PASS: all {len(expected_groups):,} representative groups, member identities, shared counts and Jaccard values match independent Python sets.')
    print(f'Maximum BH absolute error={max_absolute:.3g}; relative error={max_relative:.3g}.')


if __name__ == '__main__':
    main()
