"""Prepare/check the pinned public GBM results for local QA. No network access.

This is a lossless column extraction from a supplied human brain-tissue
reanalysis, not a differential-expression rerun or biological validation.
NCBI Gene identifiers remain exactly as supplied; no identity mapping occurs.
"""

import argparse
import csv
from decimal import Decimal, InvalidOperation
import hashlib
import io
from pathlib import Path
import re
import sys

COMMIT = '51bfb386dccb6c62e31af69c2da2fc46759d519e'
SOURCE_URL = (
    'https://raw.githubusercontent.com/Katarzyna-Zielinska/'
    f'02_Bulk_RNAseq_Glioblastoma_DESeq2/{COMMIT}/'
    'results/DESeq2_results_GBM_vs_Healthy.csv'
)
SOURCE_BYTES = 4_438_050
SOURCE_SHA = '5aa64640aafcada36a12f1207860c451f912752de2fc23f1644a67c2b0dd4dc7'
OUTPUT_BYTES = 1_652_144
OUTPUT_SHA = '3ce64b13f1ad2365b4cb2ba0eb9aff562f69b93c9b75b4e6758e52531a879194'
ROW_COUNT = 37_101
INCOMPLETE_COUNT = 1_441
ELIGIBLE_COUNT = 35_660
SELECTED_COUNT = 13_027
SOURCE_COLUMNS = ['', 'baseMean', 'log2FoldChange', 'lfcSE', 'stat', 'pvalue', 'padj']
APOE_STATISTICS = ('2.2201675785994', '4.3996355993083e-17')


def statistic(value):
    """Read a value for validation only; output always uses the source string."""
    if value == 'NA':
        return None
    try:
        result = Decimal(value)
    except InvalidOperation as error:
        raise ValueError('Invalid supplied statistic.') from error
    if not result.is_finite():
        raise ValueError('Nonfinite supplied statistic.')
    return result


def prepare(raw):
    if len(raw) != SOURCE_BYTES or hashlib.sha256(raw).hexdigest() != SOURCE_SHA:
        raise ValueError('GBM input differs from the pinned reanalysis bytes.')
    reader = csv.DictReader(io.StringIO(raw.decode('utf-8'), newline=''))
    if reader.fieldnames != SOURCE_COLUMNS:
        raise ValueError('Unexpected GBM source columns.')

    output = io.StringIO(newline='')
    writer = csv.writer(output, lineterminator='\n')
    writer.writerow(['gene', 'log2FoldChange', 'padj'])
    seen = set()
    incomplete = eligible = selected = 0
    for row in reader:
        if set(row) != set(SOURCE_COLUMNS) or any(value is None for value in row.values()):
            raise ValueError('Malformed GBM source row.')
        identifier = row['']
        if not re.fullmatch(r'[1-9][0-9]*', identifier) or identifier in seen:
            raise ValueError('Noncanonical or duplicate source NCBI Gene ID.')
        seen.add(identifier)
        fold_change, adjusted_p = row['log2FoldChange'], row['padj']
        effect, fdr = statistic(fold_change), statistic(adjusted_p)
        if fdr is not None and not Decimal(0) <= fdr <= Decimal(1):
            raise ValueError('Supplied adjusted p-value is outside [0, 1].')
        if effect is None or fdr is None:
            incomplete += 1
        else:
            eligible += 1
            if fdr <= Decimal('0.05') and abs(effect) >= Decimal(1):
                selected += 1
        if identifier == '348' and (fold_change, adjusted_p) != APOE_STATISTICS:
            raise ValueError('APOE source statistics differ from the recorded values.')
        # Keep every row, the exact NCBI Gene string and both statistical strings,
        # including NA. These counts do not filter or alter the output.
        writer.writerow([identifier, fold_change, adjusted_p])

    if (len(seen), incomplete, eligible, selected) != (
        ROW_COUNT, INCOMPLETE_COUNT, ELIGIBLE_COUNT, SELECTED_COUNT
    ) or '348' not in seen:
        raise ValueError('GBM source coverage differs from the recorded audit.')
    result = output.getvalue().encode('utf-8')
    if len(result) != OUTPUT_BYTES or hashlib.sha256(result).hexdigest() != OUTPUT_SHA:
        raise ValueError('Normalized GBM bytes differ from the recorded extraction.')
    return result


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--input', type=Path, required=True)
    parser.add_argument('--output', type=Path, required=True)
    parser.add_argument('--check', action='store_true', help='Check an existing output without writing it.')
    args = parser.parse_args()
    try:
        if args.input.resolve() == args.output.resolve():
            raise ValueError('Input and output must be different files.')
        with args.input.open('rb') as source:
            result = prepare(source.read(SOURCE_BYTES + 1))
        if args.check:
            with args.output.open('rb') as target:
                actual = target.read(OUTPUT_BYTES + 1)
            if actual != result or hashlib.sha256(actual).hexdigest() != OUTPUT_SHA:
                raise ValueError('Existing output differs from the pinned GBM extraction.')
        else:
            args.output.write_bytes(result)
        print(
            'PASS: all 37,101 unique NCBI Gene rows retained; supplied statistics unchanged; '
            '1,441 incomplete, 35,660 eligible, 13,027 default-selected; normalized SHA-256 matches.'
        )
        return 0
    except (OSError, ValueError, KeyError, csv.Error) as error:
        print(f'GBM preparation failed: {error}', file=sys.stderr)
        return 1


if __name__ == '__main__':
    raise SystemExit(main())
