"""Prepare/check the pinned HGNC Ensembl cross-reference. No network access."""

import argparse
import csv
import gzip
import hashlib
import io
import json
from pathlib import Path
import re
import sys

ROOT = Path(__file__).resolve().parents[2]
OUTPUT = ROOT / 'data/reference/hgnc-ensembl.json'
COMMIT = '37b375b4e4f70445cbb9e40b273a510467b798ae'
SOURCE_SHA = '6bb2951c56204cd7b387c4e40b8d46107f6bdc422e77b8e4f2088a5d39e1be4b'
NORMALIZED_SHA = 'b003cb4c9b0cbc7ef1e17d223110888d51962fc3eae1732a120269b78ef11799'


def prepare(raw):
    if len(raw) != 1_415_550 or hashlib.sha256(raw).hexdigest() != SOURCE_SHA:
        raise ValueError('Input differs from the pinned HGNC mirror.')
    content = gzip.decompress(raw)
    if len(content) != 5_618_078:
        raise ValueError('Unexpected decompressed reference size.')
    records = list(csv.DictReader(io.StringIO(content.decode('utf-8')), delimiter='\t'))
    genes = []
    seen_ids, seen_symbols = set(), set()
    for record in records:
        hgnc, symbol, ensembl = (record[key] for key in ['hgnc_id', 'symbol', 'ensembl_gene_id'])
        if (record['status'] != 'Approved' or not re.fullmatch(r'HGNC:[0-9]+', hgnc)
                or hgnc in seen_ids or symbol in seen_symbols or not symbol or len(symbol) > 64
                or (ensembl and not re.fullmatch(r'ENSG[0-9]{11}', ensembl))):
            raise ValueError('Invalid or duplicate HGNC record.')
        seen_ids.add(hgnc)
        seen_symbols.add(symbol)
        genes.append([hgnc, symbol, ensembl or None])
    if len(genes) != 44_997:
        raise ValueError('Unexpected HGNC coverage.')
    result = {
        'schema_version': 1, 'reference_id': 'hgnc-ensembl-6bb2951c5620',
        'organism': 'Homo sapiens', 'reported_source_date': '2026-06-20',
        'source': {
            'url': f'https://raw.githubusercontent.com/MargoSolo/gene-tidy/{COMMIT}/src/gene_tidy/data/hgnc_complete_set.tsv.gz',
            'commit': COMMIT, 'sha256': SOURCE_SHA, 'retrieved_at': '2026-10-24',
            'metadata_url': f'https://raw.githubusercontent.com/MargoSolo/gene-tidy/{COMMIT}/src/gene_tidy/data/hgnc_version.json',
            'terms_url': 'https://hgnc.genenames.org/about/license/', 'license': 'CC0-1.0',
            'attribution': 'HGNC (RRID:SCR_002827), approved Ensembl cross-references; gene-tidy mirror reports source date 2026-06-20. Not verified against the official archive.',
        },
        'columns': ['hgnc_id', 'symbol', 'ensembl_gene_id'], 'genes': genes,
    }
    return (json.dumps(result, ensure_ascii=False, separators=(',', ':')) + '\n').encode()


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--input', type=Path)
    parser.add_argument('--output', type=Path, default=OUTPUT)
    parser.add_argument('--check', action='store_true')
    args = parser.parse_args()
    if not args.input and not args.check:
        parser.error('--input is required for preparation')
    try:
        generated = prepare(args.input.read_bytes()) if args.input else None
        if args.check:
            actual = args.output.read_bytes()
            if hashlib.sha256(actual).hexdigest() != NORMALIZED_SHA or (generated is not None and actual != generated):
                raise ValueError('Normalized HGNC bytes do not match the pinned reference.')
            print('PASS: pinned HGNC bytes; 44,997 approved records.')
        else:
            args.output.write_bytes(generated)
            print(f'Prepared {len(generated):,} bytes; SHA-256 {hashlib.sha256(generated).hexdigest()}')
        return 0
    except (OSError, ValueError, KeyError) as error:
        print(f'Identifier preparation failed: {error}', file=sys.stderr)
        return 1


if __name__ == '__main__':
    raise SystemExit(main())
