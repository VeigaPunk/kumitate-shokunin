#!/usr/bin/env python3
"""CtlNoNonceCorpus byte-strip mutation for its round-58 sandbox only.

Removes exact nonce-pattern byte matches from regular files in rounds 48..57,
while pruning every probe/ directory and skipping non-regular files.
Exit 0: mutation completed; 1: wrong arguments or safety check failed.
"""
import json
import os
from pathlib import Path
import re
import stat
import sys

EXPECTED_ROOT = Path("/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-58/build/CtlNoNonceCorpus/lane")
PATTERN = re.compile(br'"nonce":\s*"[0-9a-f]{32}"')


def main():
    if len(sys.argv) != 2:
        return 1
    root = Path(sys.argv[1]).resolve()
    if root != EXPECTED_ROOT or not (root / ".git").exists():
        print(json.dumps({"error": "refusing to mutate anything except the CtlNoNonceCorpus sandbox clone", "root": str(root)}))
        return 1

    changed = []
    rounds = {}
    missing_rounds = []
    skipped_probes = []
    skipped_nonregular = []

    def visit(directory, relative):
        with os.scandir(directory) as entries:
            for entry in entries:
                rel = f"{relative}/{entry.name}" if relative else entry.name
                mode = entry.stat(follow_symlinks=False).st_mode
                if stat.S_ISDIR(mode):
                    if entry.name == "probe":
                        skipped_probes.append(rel)
                        continue
                    visit(entry.path, rel)
                    continue
                if not stat.S_ISREG(mode):
                    skipped_nonregular.append(rel)
                    continue
                with open(entry.path, "rb") as stream:
                    before = stream.read()
                after, count = PATTERN.subn(b"", before)
                if not count:
                    continue
                with open(entry.path, "wb") as stream:
                    stream.write(after)
                changed.append({"path": rel, "matches_removed": count, "bytes_before": len(before), "bytes_after": len(after)})
                rounds[rel.split("/")[2]] = rounds.get(rel.split("/")[2], 0) + count

    for number in range(48, 58):
        name = f"round-{number}"
        base = root / ".ufo" / "waves" / name
        try:
            mode = os.lstat(base).st_mode
        except FileNotFoundError:
            missing_rounds.append(name)
            continue
        if not stat.S_ISDIR(mode):
            skipped_nonregular.append(f".ufo/waves/{name}")
            continue
        visit(base, f".ufo/waves/{name}")

    changed.sort(key=lambda item: item["path"])
    print(json.dumps({
        "pattern": PATTERN.pattern.decode("ascii"),
        "replacement": "empty bytes",
        "files_changed": len(changed),
        "matches_removed": sum(item["matches_removed"] for item in changed),
        "matches_by_round": dict(sorted(rounds.items())),
        "missing_rounds": missing_rounds,
        "skipped_probe_dirs": sorted(skipped_probes),
        "skipped_nonregular": sorted(skipped_nonregular),
        "changed": changed,
    }, indent=2))
    return 0


if __name__ == "__main__":
    sys.exit(main())
