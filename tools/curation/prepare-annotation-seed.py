"""Extract a bounded gene/product/membership seed from pinned references. No network or graph writes."""

import argparse
import csv
import gzip
import hashlib
import io
import json
from pathlib import Path
import re
import runpy
import sys

ROOT = Path(__file__).resolve().parents[2]
PLAN = ROOT / 'data/annotations/seed-plan.json'
OUTPUT = ROOT / 'data/annotations/coverage-seed.json'
NORMALIZED_SHA256 = '0f149175bb29242405c31276d65b90cc320751abe26529e6062c816d9dc50201'


def references():
    hgnc = runpy.run_path(str(ROOT / 'tools/analysis/prepare-identifiers.py'))
    reactome = runpy.run_path(str(ROOT / 'tools/analysis/prepare-pathways.py'))
    raw = (ROOT / 'data/reference/reactome-pathways.json').read_bytes()
    if hashlib.sha256(raw).hexdigest() != reactome['NORMALIZED_SHA256']:
        raise ValueError('Reactome reference differs from its pinned normalized digest.')
    return hgnc, json.loads(raw), hashlib.sha256(raw).hexdigest()


def prepare(raw):
    hgnc, reference, reference_sha = references()
    verified = json.loads(hgnc['prepare'](raw))  # Canonical byte/row/identity checks.
    plan = json.loads(PLAN.read_text())
    if (plan.get('schema_version') != 'annotation-seed-plan-1'
            or not isinstance(plan.get('symbols'), list) or not 1 <= len(plan['symbols']) <= 8
            or len(set(plan['symbols'])) != len(plan['symbols'])
            or any(not isinstance(s, str) or not re.fullmatch(r'[A-Za-z][A-Za-z0-9_.-]{0,63}', s) for s in plan['symbols'])):
        raise ValueError('Seed plan must explicitly select 1–8 unique gene symbols.')
    pathway = next((p for p in reference['pathways'] if p['id'] == plan['pathway_id']), None)
    if pathway is None:
        raise ValueError('Selected pathway is absent from the pinned reference.')
    rows = {r['symbol']: r for r in csv.DictReader(io.StringIO(gzip.decompress(raw).decode()), delimiter='\t')}
    genes = []
    for symbol in plan['symbols']:
        row = rows.get(symbol)
        if row is None or row['status'] != 'Approved' or symbol not in pathway['genes']:
            raise ValueError('Selected gene lacks an approved exact identity or literal pathway membership.')
        if not re.fullmatch(r'ENSG\d{11}', row['ensembl_gene_id']) or not re.fullmatch(r'\d+', row['entrez_id']):
            raise ValueError('Seed requires an unambiguous Ensembl/NCBI identity.')
        if not re.fullmatch(r'(?:[OPQ][0-9][A-Z0-9]{3}[0-9]|[A-NR-Z][0-9](?:[A-Z][A-Z0-9]{2}[0-9]){1,2})', row['uniprot_ids']):
            raise ValueError('Resolve missing or multiple protein accessions explicitly before preparing this seed.')
        genes.append({
            'symbol': symbol, 'gene_name': row['name'], 'hgnc_id': row['hgnc_id'],
            'ensembl_gene_id': row['ensembl_gene_id'], 'ncbi_gene_id': row['entrez_id'],
            'uniprot_accession': row['uniprot_ids'],
            'identity_locator': f"Approved HGNC row {row['hgnc_id']} ({symbol}); symbol, name, ensembl_gene_id, entrez_id and uniprot_ids columns.",
            'pathway_membership': {'id': pathway['id'], 'name': pathway['name'], 'url': pathway['url'],
                'level': 'gene_set_annotation', 'locator': f"Pinned Reactome JSON pathways[id={pathway['id']}].genes contains exact symbol {symbol}."},
        })
    packet = {'schema_version': 'annotation-reference-seed-1', 'prepared_at': plan['prepared_at'],
        'baseline_dataset_version': plan['baseline_dataset_version'], 'selection_method': plan['selection_method'],
        'data_origin': 'pinned_reference_extract', 'retrieved_at': None,
        'scientific_review': 'not_performed_by_generator',
        'hgnc_source': verified['source'], 'reactome_source': reference['source'],
        'reactome_reference_id': reference['reference_id'], 'reactome_normalized_sha256': reference_sha,
        'upstream_releases': {'hgnc': None, 'reactome': None}, 'genes': genes,
        'limitations': ['Extraction is reproducible, not a live API request or scientific approval.',
            'HGNC identity cross-references do not measure expression, translation or disease association.',
            'Reactome memberships are gene-level annotations from a pinned mirror of unknown upstream release. They do not identify molecular states, direct physical binding or pathway activity.',
            'Any displayed scientific record requires a separate, source-checked snapshot diff. No claims, review attestations or graph changes are generated.']}
    return (json.dumps(packet, indent=2, ensure_ascii=False) + '\n').encode()


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--hgnc', type=Path, help='Explicit local gzip from the pinned HGNC mirror.')
    parser.add_argument('--output', type=Path, default=OUTPUT)
    parser.add_argument('--check', action='store_true')
    args = parser.parse_args()
    if not args.hgnc and not args.check:
        parser.error('--hgnc is required for preparation')
    try:
        generated = prepare(args.hgnc.read_bytes()) if args.hgnc else None
        if args.check:
            references()
            actual = args.output.read_bytes()
            if hashlib.sha256(actual).hexdigest() != NORMALIZED_SHA256:
                raise ValueError('Annotation seed differs from its recorded digest.')
            plan = json.loads(PLAN.read_text())
            seed = json.loads(actual)
            if ([r['symbol'] for r in seed['genes']] != plan['symbols']
                    or any(r['pathway_membership']['id'] != plan['pathway_id'] for r in seed['genes'])
                    or any(seed[k] != plan[k] for k in ['prepared_at', 'baseline_dataset_version', 'selection_method'])):
                raise ValueError('Annotation seed and explicit plan disagree.')
            if generated is not None and generated != actual:
                raise ValueError('Annotation seed does not reproduce from the pinned sources.')
            print(f"PASS: {len(seed['genes'])} exact HGNC gene/product identities and gene-level Reactome memberships; no live API or scientific approval implied.")
        else:
            args.output.parent.mkdir(parents=True, exist_ok=True)
            args.output.write_bytes(generated)
            print(f'Prepared reference extract: SHA-256 {hashlib.sha256(generated).hexdigest()}')
        return 0
    except (OSError, ValueError, KeyError, TypeError) as error:
        print(f'Annotation seed preparation failed: {error}', file=sys.stderr)
        return 1


if __name__ == '__main__':
    raise SystemExit(main())
