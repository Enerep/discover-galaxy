"""Normalize a pinned Reactome GMT mirror, or verify the bundled reference.

Only Python's standard library is used. Input must be downloaded explicitly;
preparation, checking, application builds and browser analysis do not fetch it.
"""

import argparse
import hashlib
import json
from pathlib import Path
import re
import sys


ROOT = Path(__file__).resolve().parents[2]
OUTPUT = ROOT / "data/reference/reactome-pathways.json"
COMMIT = "fbe2f70935496c73ed21337af70e97e633c2f4d3"
RAW_SHA256 = "f5d9af14b2f8d373201372b2e63e3c7b2c5b535d30af1459fddfdba22015cd7d"
NORMALIZED_SHA256 = "f19f3f37b142e1f0d0a6ef84118f1ae586334b04545897627c6d9236c7a739c6"
SOURCE_URL = f"https://raw.githubusercontent.com/epigen/MrBiomics/{COMMIT}/resources/ReactomePathways.gmt"
REFERENCE_ID = "reactome-human-mrbiomics-f5d9af14b2f8"
RETRIEVED_AT = "2026-10-23T11:42:08Z"


def normalize(raw: bytes) -> bytes:
    if len(raw) != 964_840 or hashlib.sha256(raw).hexdigest() != RAW_SHA256:
        raise ValueError("Input does not match the pinned Reactome GMT bytes and SHA-256.")
    pathways = []
    ids = set()
    for number, line in enumerate(raw.decode("utf-8").splitlines(), 1):
        name, identifier, *genes = line.split("\t")
        if (not name.strip() or not re.fullmatch(r"R-HSA-[0-9]+", identifier)
                or identifier in ids or not genes or len(set(genes)) != len(genes)
                or any(not gene.strip() for gene in genes)):
            raise ValueError(f"Invalid pathway record on line {number}.")
        ids.add(identifier)
        # Preserve original symbols/labels, case and ordering. This is not an
        # HGNC alias resolver; a human pathway can include microbial members.
        pathways.append({"id": identifier, "name": name,
                         "url": f"https://reactome.org/content/detail/{identifier}", "genes": genes})
    if len(pathways) != 2_751 or len({gene for pathway in pathways for gene in pathway["genes"]}) != 11_727:
        raise ValueError("Unexpected pathway or member coverage.")
    reference = {
        "schema_version": 1,
        "reference_id": REFERENCE_ID,
        "organism": "Homo sapiens",
        "identifier_type": "gene_symbol",
        "upstream_release": None,
        "source": {
            "url": SOURCE_URL,
            "commit": COMMIT,
            "sha256": RAW_SHA256,
            "retrieved_at": RETRIEVED_AT,
            "terms_url": "https://reactome.org/license",
            "license": "CC0-1.0",
            "attribution": "Reactome annotation data, mirrored by Computational Epigenetics / MrBiomics; exact upstream release unknown.",
        },
        "pathways": pathways,
    }
    return (json.dumps(reference, ensure_ascii=False, separators=(",", ":")) + "\n").encode("utf-8")


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--input", type=Path, help="Local GMT from the pinned source URL; never fetched by this script.")
    parser.add_argument("--output", type=Path, default=OUTPUT, help="Normalized reference path.")
    parser.add_argument("--check", action="store_true", help="Verify output without changing it; optionally regenerate from --input.")
    args = parser.parse_args()
    if args.input is None and not args.check:
        parser.error("--input is required to prepare the reference")
    try:
        generated = None
        if args.input:
            with args.input.open("rb") as handle:
                generated = normalize(handle.read(964_841))
        if args.check:
            with args.output.open("rb") as handle:
                actual = handle.read(2_000_001)
            if hashlib.sha256(actual).hexdigest() != NORMALIZED_SHA256:
                raise ValueError("Normalized reference differs from its recorded SHA-256.")
            if generated is not None and generated != actual:
                raise ValueError("Normalized reference does not reproduce from the pinned GMT.")
            print(f"PASS: {REFERENCE_ID}; 2,751 pathways; pinned normalized SHA-256 matches.")
        else:
            args.output.parent.mkdir(parents=True, exist_ok=True)
            args.output.write_bytes(generated)
            print(f"Prepared {REFERENCE_ID}: {len(generated):,} bytes at {args.output}.")
        return 0
    except (OSError, ValueError, UnicodeError) as error:
        print(f"Reference preparation failed: {error}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
