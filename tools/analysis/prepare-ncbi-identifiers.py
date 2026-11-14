"""Prepare/check pinned HGNC NCBI Gene cross-references. No network access."""

import argparse
from collections import Counter
import csv
import gzip
import hashlib
import io
import json
from pathlib import Path
import re
import sys

ROOT = Path(__file__).resolve().parents[2]
OUTPUT = ROOT / 'data/reference/hgnc-ncbi-gene.json'
COMMIT = '37b375b4e4f70445cbb9e40b273a510467b798ae'
SOURCE_SHA = '6bb2951c56204cd7b387c4e40b8d46107f6bdc422e77b8e4f2088a5d39e1be4b'
SOURCE_BYTES = 1_415_550
DECOMPRESSED_BYTES = 5_618_078
NORMALIZED_SHA = 'ade9370607ec7c0cca9d5993bd8b8b007ba2027f109502bae3512a04721b1284'
NORMALIZED_BYTES = 1_541_903


def read_bounded(path, expected_size):
    if path.stat().st_size != expected_size:
        raise ValueError('Reference byte count differs from the pinned input.')
    with path.open('rb') as handle:
        raw = handle.read(expected_size + 1)
    if len(raw) != expected_size:
        raise ValueError('Reference byte count changed while reading.')
    return raw


def prepare(raw):
    if len(raw) != SOURCE_BYTES or hashlib.sha256(raw).hexdigest() != SOURCE_SHA:
        raise ValueError('Input differs from the pinned HGNC mirror.')
    with gzip.GzipFile(fileobj=io.BytesIO(raw)) as handle:
        content = handle.read(DECOMPRESSED_BYTES + 1)
    if len(content) != DECOMPRESSED_BYTES:
        raise ValueError('Unexpected decompressed reference size.')
    records = csv.DictReader(io.StringIO(content.decode('utf-8')), delimiter='\t')
    genes = []
    seen_ids, seen_symbols = set(), set()
    for record in records:
        hgnc, symbol, ncbi = (record[key] for key in ['hgnc_id', 'symbol', 'entrez_id'])
        if (record['status'] != 'Approved' or not re.fullmatch(r'HGNC:[0-9]+', hgnc)
                or hgnc in seen_ids or symbol in seen_symbols or not symbol or len(symbol) > 64
                or (ncbi and not re.fullmatch(r'[1-9][0-9]{0,11}', ncbi))):
            raise ValueError('Invalid or duplicate HGNC record.')
        seen_ids.add(hgnc)
        seen_symbols.add(symbol)
        # Preserve the exact current cross-reference as a string. Repeated NCBI
        # IDs remain separate HGNC records, allowing consumers to retain ambiguity.
        # No aliases, previous symbols or historical IDs are consulted.
        genes.append([hgnc, symbol, ncbi or None])
    if len(genes) != 44_997:
        raise ValueError('Unexpected HGNC coverage.')
    result = {
        'schema_version': 1, 'reference_id': 'hgnc-ncbi-gene-6bb2951c5620',
        'organism': 'Homo sapiens', 'reported_source_date': '2026-06-20',
        'source': {
            'url': f'https://raw.githubusercontent.com/MargoSolo/gene-tidy/{COMMIT}/src/gene_tidy/data/hgnc_complete_set.tsv.gz',
            'commit': COMMIT, 'sha256': SOURCE_SHA, 'retrieved_at': '2026-11-14',
            'metadata_url': f'https://raw.githubusercontent.com/MargoSolo/gene-tidy/{COMMIT}/src/gene_tidy/data/hgnc_version.json',
            'terms_url': 'https://hgnc.genenames.org/about/license/', 'license': 'CC0-1.0',
            'attribution': 'HGNC (RRID:SCR_002827), approved NCBI Gene cross-references; gene-tidy mirror reports source date 2026-06-20. Not verified against the official archive.',
        },
        'columns': ['hgnc_id', 'symbol', 'ncbi_gene_id'], 'genes': genes,
    }
    return (json.dumps(result, ensure_ascii=False, separators=(',', ':')) + '\n').encode()


def coverage(raw):
    genes = json.loads(raw)['genes']
    identifiers = Counter(row[2] for row in genes if row[2] is not None)
    mapped = sum(identifiers.values())
    ambiguous = sum(count > 1 for count in identifiers.values())
    ambiguous_records = sum(count for count in identifiers.values() if count > 1)
    return (f'{len(genes):,} approved records; {mapped:,} assigned records; '
            f'{len(genes) - mapped:,} missing; {len(identifiers):,} distinct NCBI Gene IDs; '
            f'{ambiguous:,} ambiguous IDs across {ambiguous_records:,} records')


def verify_normalized(raw):
    if len(raw) != NORMALIZED_BYTES or hashlib.sha256(raw).hexdigest() != NORMALIZED_SHA:
        raise ValueError('Normalized HGNC bytes do not match the pinned reference.')


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--input', type=Path)
    parser.add_argument('--output', type=Path, default=OUTPUT)
    parser.add_argument('--check', action='store_true')
    args = parser.parse_args()
    if not args.input and not args.check:
        parser.error('--input is required for preparation')
    try:
        generated = prepare(read_bounded(args.input, SOURCE_BYTES)) if args.input else None
        if generated is not None:
            verify_normalized(generated)
        if args.check:
            actual = read_bounded(args.output, NORMALIZED_BYTES)
            verify_normalized(actual)
            if generated is not None and actual != generated:
                raise ValueError('Normalized reference differs from the supplied HGNC source.')
            print(f'PASS: pinned HGNC NCBI Gene bytes; {coverage(actual)}.')
        else:
            args.output.write_bytes(generated)
            print(f'Prepared {len(generated):,} bytes; SHA-256 {NORMALIZED_SHA}; {coverage(generated)}.')
        return 0
    except (OSError, ValueError, KeyError, EOFError) as error:
        print(f'Identifier preparation failed: {error}', file=sys.stderr)
        return 1


if __name__ == '__main__':
    raise SystemExit(main())
