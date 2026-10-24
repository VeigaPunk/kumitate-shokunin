#!/usr/bin/env python3
# MutMap1 scratch builder. Contract: copy the R1 gate bytes, remove exactly the
# covered-member lstat block, and create directory/version-1/malformed-JSON
# fixtures below BUILD. Exits 0 on success, 64 for usage, 1 on a byte mismatch.
import json
import shutil
import sys
from pathlib import Path

BLOCK = """    // v2 (R57-V3): a covered member is scored by name only no longer — it
    // must lstat as a regular file in its namespace dir.
    const [ns, leaf] = [c.slice(0, c.indexOf('/')), c.slice(c.indexOf('/') + 1)];
    let lst;
    try {
      lst = lstatSync(join(dirFor[ns], leaf));
    } catch {
      bad.push(`stale-covered:${c}`);
      continue;
    }
    if (lst.isSymbolicLink()) {
      try {
        statSync(full);
        bad.push(`covered-not-file:${c}`);
      } catch {
        bad.push(`stale-covered:${c}`);
      }
      continue;
    }
    if (!lst.isFile()) {
      bad.push(`covered-not-file:${c}`);
    }
"""


def make_fixture(root, registry):
    (root / "corpus/knowledge/dir.md").mkdir(parents=True)
    (root / "corpus/lessons").mkdir(parents=True)
    (root / "corpus/knowledge/a.md").write_text("# knowledge/a.md\n")
    (root / "corpus/lessons/b.md").write_text("# lessons/b.md\n")
    rows = ["knowledge/a.md", "lessons/b.md", "knowledge/dir.md"]
    (root / "corpus/README.md").write_text(
        "# README\n\n## Coverage map\n\n"
        + "".join(f"| `{path}` | desc | ptr |\n" for path in rows)
    )
    if isinstance(registry, bytes):
        (root / "reg.json").write_bytes(registry)
    else:
        (root / "reg.json").write_text(json.dumps(registry, indent=2) + "\n")


def main():
    if len(sys.argv) != 3:
        print("usage: setup_scratch.py R1_GATE_BYTES BUILD", file=sys.stderr)
        return 64
    source = Path(sys.argv[1])
    build = Path(sys.argv[2])
    original_bytes = source.read_bytes()
    original = original_bytes.decode("utf-8")
    if original.count(BLOCK) != 1:
        print(f"mutation target count={original.count(BLOCK)} want=1", file=sys.stderr)
        return 1
    mutated = original.replace(BLOCK, "")
    if "lst.isFile()" in mutated or "lstatSync(join(dirFor[ns], leaf))" in mutated:
        print("covered-member lstat guard remains", file=sys.stderr)
        return 1
    (build / "readme-map.r1.mjs").write_bytes(original_bytes)
    (build / "readme-map.name-only.mjs").write_text(mutated)
    fixtures = build / "fixtures"
    if fixtures.exists():
        shutil.rmtree(fixtures)
    covered = ["knowledge/a.md", "lessons/b.md", "knowledge/dir.md"]
    make_fixture(fixtures / "directory", {"version": 2, "covered": covered})
    make_fixture(fixtures / "version-1", {"version": 1, "covered": covered})
    make_fixture(fixtures / "malformed-json", b'{"version": 2, "covered": [')
    print("mutation replacements=1")
    print("covered-member lstat guard absent=true")
    print("fixtures=directory,version-1,malformed-json")
    return 0


if __name__ == "__main__":
    sys.exit(main())
