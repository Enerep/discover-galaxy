"""Checks for consequential false-negative and malformed-data failure modes."""

import hashlib
import importlib.util
from pathlib import Path
import unittest


spec = importlib.util.spec_from_file_location("check_iocs", Path(__file__).with_name("check-iocs.py"))
checker = importlib.util.module_from_spec(spec)
spec.loader.exec_module(checker)


class IocChecks(unittest.TestCase):
    def feed(self, content):
        raw = content.encode()
        metadata = {
            "id": "test",
            "sha256": hashlib.sha256(raw).hexdigest(),
            "name_column": "Package",
            "versions_column": "Version",
        }
        return raw, metadata

    def test_nested_scoped_and_aliased_identities(self):
        packages = checker.lock_packages({"lockfileVersion": 3, "packages": {
            "": {},
            "node_modules/@scope/name": {"version": "1.0.1"},
            "node_modules/parent/node_modules/alias": {"name": "real-package", "version": "2.0.0"},
            "node_modules/workspace": {"link": True},
        }})
        self.assertEqual(packages, [("@scope/name", "1.0.1"), ("real-package", "2.0.0")])

    def test_only_exact_versions_match_and_duplicates_accumulate(self):
        raw, feed = self.feed('Package,Version\nsample,= 1.0.1 || = 1.0.2\nsample,1.0.3\n')
        indicators, rows = checker.parse_feed(raw, feed)
        self.assertEqual(rows, 2)
        self.assertIn(("sample", "1.0.1"), indicators)
        self.assertIn(("sample", "1.0.3"), indicators)
        self.assertNotIn(("sample", "1.0.0"), indicators)

    def test_csv_quoted_version_list(self):
        raw, feed = self.feed('Package,Version\nsample,"1.0.1, 1.0.2"\n')
        self.assertEqual(len(checker.parse_feed(raw, feed)[0]), 2)

    def test_tampered_feed_is_rejected(self):
        raw, feed = self.feed('Package,Version\nsample,1.0.1\n')
        with self.assertRaisesRegex(ValueError, "digest mismatch"):
            checker.parse_feed(raw + b"\n", feed)

    def test_version_ranges_are_not_silently_ignored(self):
        raw, feed = self.feed('Package,Version\nsample,>=1.0.1\n')
        with self.assertRaisesRegex(ValueError, "Unsupported IOC version"):
            checker.parse_feed(raw, feed)

    def test_empty_feed_is_not_a_clean_result(self):
        raw, feed = self.feed('Package,Version\n')
        with self.assertRaisesRegex(ValueError, "Empty IOC feed"):
            checker.parse_feed(raw, feed)

    def test_unresolved_package_is_not_a_clean_result(self):
        with self.assertRaisesRegex(ValueError, "identity/version"):
            checker.lock_packages({"lockfileVersion": 3, "packages": {"node_modules/sample": {}}})


if __name__ == "__main__":
    unittest.main()
