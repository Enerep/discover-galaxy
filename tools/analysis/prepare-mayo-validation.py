"""Normalize the pinned public MAYO results for local QA; never fetch data."""

import argparse
import csv
import hashlib
import io
from pathlib import Path
import re

SOURCE_SHA = '5eb91451860590f0df3c7d060cf94dfb53df30367dd3bb0e6f14cd309db8ca7f'
OUTPUT_SHA = '0f084d65603e1608c8293300ce0b00ccf5dab6d3bf93321cbd3179d688f61c09'


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--input', type=Path, required=True)
    parser.add_argument('--output', type=Path, required=True)
    args = parser.parse_args()
    raw = args.input.read_bytes()
    if len(raw) != 2_407_173 or hashlib.sha256(raw).hexdigest() != SOURCE_SHA:
        raise ValueError('MAYO input differs from the recorded author-provided bytes.')
    rows = list(csv.DictReader(io.StringIO(raw.decode()), delimiter='\t'))
    output = io.StringIO(newline='')
    writer = csv.writer(output)
    writer.writerow(['gene', 'log2FoldChange', 'padj', 'original_label'])
    seen = set()
    for row in rows:
        # The source explicitly supplies ENSG|symbol; retain the first field,
        # without guessing identity from its historic display symbol.
        identifier = row['gene_name'].split('|')[0]
        if not re.fullmatch(r'ENSG[0-9]{11}', identifier) or identifier in seen:
            raise ValueError('Missing or duplicate source Ensembl gene ID.')
        seen.add(identifier)
        writer.writerow([identifier, row['log2_fold_change'], row['FDR_adjusted_p_value'], row['gene_name']])
    result = output.getvalue().encode()
    if len(rows) != 32_607 or hashlib.sha256(result).hexdigest() != OUTPUT_SHA:
        raise ValueError('Normalized MAYO results differ from the recorded conversion.')
    args.output.write_bytes(result)
    print('PASS: all 32,607 rows retained; source fold changes and FDR values unchanged; normalized SHA-256 matches.')


if __name__ == '__main__':
    main()
