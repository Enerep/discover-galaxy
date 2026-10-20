"""Compare npm lockfile entries to pinned IOC CSV data using only Python stdlib.

Downloaded feeds are decoded as data, never imported or executed. Exit status:
0 = no exact match in these feeds; 1 = match; 2 = incomplete/invalid check.
"""

import argparse
import csv
from datetime import datetime, timezone
import hashlib
import io
import json
from pathlib import Path
import re
import sys
import urllib.request


ROOT = Path(__file__).resolve().parents[2]
MAX_FEED_BYTES = 1_000_000
EXACT_VERSION = re.compile(r"v?\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?")


def lock_packages(data):
    if data.get("lockfileVersion") not in (2, 3):
        raise ValueError("Expected an npm lockfileVersion 2 or 3")
    entries = data.get("packages")
    if not isinstance(entries, dict):
        raise ValueError("Missing lockfile packages map")
    packages = []
    for path, record in entries.items():
        if "node_modules/" not in path or record.get("link"):
            continue
        name = record.get("name") or path.rsplit("node_modules/", 1)[1]
        version = record.get("version")
        if not isinstance(name, str) or not isinstance(version, str) or not version:
            raise ValueError(f"Missing package identity/version at {path}")
        packages.append((name, version))
    if not packages:
        raise ValueError("No resolved package entries to check")
    return packages


def parse_feed(raw, feed):
    if hashlib.sha256(raw).hexdigest() != feed["sha256"]:
        raise ValueError(f"IOC feed digest mismatch: {feed['id']}")
    reader = csv.DictReader(io.StringIO(raw.decode("utf-8-sig")))
    name_column, versions_column = feed["name_column"], feed["versions_column"]
    if not reader.fieldnames or not {name_column, versions_column} <= set(reader.fieldnames):
        raise ValueError(f"Unexpected IOC columns: {feed['id']}")
    indicators = set()
    rows = 0
    for row in reader:
        rows += 1
        name = row[name_column].strip()
        if not name:
            raise ValueError(f"Empty IOC package name in {feed['id']}")
        for token in re.split(r"\|\||,", row[versions_column]):
            version = token.strip().removeprefix("=").strip()
            if not EXACT_VERSION.fullmatch(version):
                raise ValueError(f"Unsupported IOC version syntax in {feed['id']}: {version}")
            indicators.add((name, version))
    if not indicators:
        raise ValueError(f"Empty IOC feed: {feed['id']}")
    return indicators, rows


def read_feed(feed, directory):
    if directory is not None:
        raw = (directory / f"{feed['id']}.csv").read_bytes()
    else:
        url = feed["url"]
        if not url.startswith("https://raw.githubusercontent.com/"):
            raise ValueError("IOC manifest must use reviewed HTTPS GitHub raw URLs")
        request = urllib.request.Request(url, headers={"User-Agent": "Discovery-Galaxy-IOC-check/1"})
        with urllib.request.urlopen(request, timeout=30) as response:
            raw = response.read(MAX_FEED_BYTES + 1)
    if len(raw) > MAX_FEED_BYTES:
        raise ValueError(f"Oversized IOC feed: {feed['id']}")
    return raw


def check(lockfile, feeds, directory):
    raw_lock = lockfile.read_bytes()
    packages = lock_packages(json.loads(raw_lock))
    report = {
        "checked_at": datetime.now(timezone.utc).isoformat(),
        "lockfile_sha256": hashlib.sha256(raw_lock).hexdigest(),
        "checked_package_entries": len(packages),
        "scope": "Exact matches in the listed pinned feeds only; not a malware-free guarantee",
        "feeds": [],
        "matches": [],
    }
    for feed in feeds:
        indicators, rows = parse_feed(read_feed(feed, directory), feed)
        matches = sorted(set(packages) & indicators)
        report["feeds"].append({
            "id": feed["id"],
            "revision": feed["revision"],
            "url": feed["url"],
            "sha256": feed["sha256"],
            "rows": rows,
            "exact_indicators": len(indicators),
        })
        report["matches"].extend(
            {"package": name, "version": version, "feed": feed["id"]}
            for name, version in matches
        )
    return report


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--lockfile", type=Path, default=ROOT / "package-lock.json")
    parser.add_argument("--feed-dir", type=Path, help="Read <feed-id>.csv locally instead of downloading")
    parser.add_argument("--report", type=Path, help="Optionally write the JSON result to this path")
    args = parser.parse_args()
    try:
        manifest = json.loads((Path(__file__).parent / "ioc-sources.json").read_text())
        if not manifest.get("feeds"):
            raise ValueError("No IOC feeds configured")
        report = check(args.lockfile, manifest["feeds"], args.feed_dir)
        output = json.dumps(report, indent=2) + "\n"
        if args.report:
            args.report.write_text(output)
        print(output, end="")
        return 1 if report["matches"] else 0
    except (OSError, ValueError, KeyError, TypeError, csv.Error) as error:
        print(f"IOC check incomplete: {error}", file=sys.stderr)
        return 2


if __name__ == "__main__":
    sys.exit(main())
