#!/usr/bin/env python3
# ExecSourceCapture evidence helper: compare required live and committed capture bindings and bytes.
# Exit 0 = all checks pass; 1 = missing binding, read error, or mismatch; 64 = usage.
import argparse
import hashlib
import json
import stat
import subprocess
import sys
from pathlib import Path, PurePosixPath

REGISTRY = ".ufo/pins/source-captures.json"
REQUIRED = ("S112", "S122", "S123", "S124")


class Parser(argparse.ArgumentParser):
    def error(self, message):
        self.print_usage(sys.stderr)
        self.exit(64, f"argument error: {message}\n")


def sha256(data):
    return hashlib.sha256(data).hexdigest()


def git_blob(lane, rev, path):
    result = subprocess.run(
        ["git", "-C", str(lane), "show", f"{rev}:{path}"],
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        check=False,
    )
    if result.returncode != 0:
        raise RuntimeError(
            f"git show {rev}:{path} exit={result.returncode}: "
            f"{result.stderr.decode('utf-8', errors='replace').strip()}"
        )
    return result.stdout


def repo_path(lane, value):
    relative = PurePosixPath(value)
    if relative.is_absolute() or ".." in relative.parts:
        raise ValueError(f"unsafe capture path: {value!r}")
    return lane.joinpath(*relative.parts)


def main():
    parser = Parser()
    parser.add_argument("--lane", required=True, type=Path)
    parser.add_argument("--rev", required=True)
    args = parser.parse_args()
    lane = args.lane.resolve()
    failures = []

    live_registry_bytes = (lane / REGISTRY).read_bytes()
    revision_registry_bytes = git_blob(lane, args.rev, REGISTRY)
    live_registry = json.loads(live_registry_bytes)
    revision_registry = json.loads(revision_registry_bytes)
    registry_equal = live_registry_bytes == revision_registry_bytes
    print(json.dumps({
        "registry": REGISTRY,
        "live_sha256": sha256(live_registry_bytes),
        "revision_sha256": sha256(revision_registry_bytes),
        "live_equals_revision": registry_equal,
    }, sort_keys=True))
    if not registry_equal:
        failures.append("registry differs between live tree and revision")

    live_captures = live_registry.get("captures", [])
    revision_captures = revision_registry.get("captures", [])
    for source_id in REQUIRED:
        try:
            live_matches = [c for c in live_captures if c.get("sourceId") == source_id]
            revision_matches = [c for c in revision_captures if c.get("sourceId") == source_id]
            if len(live_matches) != 1 or len(revision_matches) != 1:
                raise ValueError(
                    f"binding count live={len(live_matches)} revision={len(revision_matches)}"
                )
            live = live_matches[0]
            committed = revision_matches[0]
            capture_path = repo_path(lane, live["path"])
            live_bytes = capture_path.read_bytes()
            committed_bytes = git_blob(lane, args.rev, committed["path"])
            regular_file = stat.S_ISREG(capture_path.lstat().st_mode)
            live_sha256 = sha256(live_bytes)
            revision_sha256 = sha256(committed_bytes)
            binding_equal = live == committed
            ok = (
                binding_equal
                and regular_file
                and live_sha256 == live["sha256"]
                and revision_sha256 == committed["sha256"]
                and len(live_bytes) == live["bytes"]
                and len(committed_bytes) == committed["bytes"]
            )
            record = {
                "sourceId": source_id,
                "path": live["path"],
                "captured": live["captured"],
                "binding_matches_revision": binding_equal,
                "regular_file": regular_file,
                "pinned_sha256": live["sha256"],
                "live_sha256": live_sha256,
                "revision_sha256": revision_sha256,
                "pinned_bytes": live["bytes"],
                "live_bytes": len(live_bytes),
                "revision_bytes": len(committed_bytes),
                "ok": ok,
            }
            print(json.dumps(record, sort_keys=True))
            if not ok:
                failures.append(f"{source_id}: mismatch")
        except Exception as error:
            failures.append(f"{source_id}: {error}")
            print(json.dumps({"sourceId": source_id, "ok": False, "error": str(error)}, sort_keys=True))

    if failures:
        print(f"SOURCE_CAPTURE_BINDINGS: FAIL required={len(REQUIRED)} failures={len(failures)}")
        for failure in failures:
            print(f"FAIL: {failure}", file=sys.stderr)
        return 1
    print(
        f"SOURCE_CAPTURE_BINDINGS: PASS required={len(REQUIRED)} "
        f"live={len(REQUIRED)} revision={len(REQUIRED)} rev={args.rev}"
    )
    return 0


if __name__ == "__main__":
    try:
        sys.exit(main())
    except Exception as error:
        print(f"SOURCE_CAPTURE_BINDINGS: FAIL error={error}", file=sys.stderr)
        sys.exit(1)
