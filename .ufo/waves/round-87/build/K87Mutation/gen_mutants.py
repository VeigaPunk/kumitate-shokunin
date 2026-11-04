#!/usr/bin/env python3
"""Generate receipt-bind.mjs mutants by asserted single-site replacement.

Each mutant is the L1 reference instrument with exactly one behaviour-bearing
edit. Every replacement must match exactly once, else the generator aborts
(so no mutant silently degenerates into an unmutated copy).
"""
import json
import pathlib
import sys

REF = pathlib.Path('/fast/scratch/hyaku/kumitate-r87/L1/ref/receipt-bind.mjs')
OUT = pathlib.Path('/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-87/build/K87Mutation/mutants')

CLEAN_COND = "if (mismatched === 0 && unchecked === 0) return { code: 0, matched, mismatched, unchecked, external };"
CLEAN_RET = "return { code: 0, matched, mismatched, unchecked, external };"
DRIFT_RET = "return { code: 1, matched, mismatched, unchecked, external, first };"
CLEAN_PRINT = "  console.log(`RECEIPT_BIND: CLEAN matched=${r.matched} mismatched=0 unchecked=0 external=${r.external}`);"
DRIFT_PRINT = "  console.log(`RECEIPT_BIND: DRIFT matched=${r.matched} mismatched=${r.mismatched} unchecked=${r.unchecked} external=${r.external} first=${r.first}`);"
GIT_FN = "function git(lane, a) {\n  return spawnSync('git', ['-C', lane, ...a], { maxBuffer: 64 << 20 });\n}"

MUTANTS = [
    ("m01", "CLEAN drops the unchecked term",
     [(CLEAN_COND, "if (mismatched === 0) return { code: 0, matched, mismatched, unchecked, external };")]),
    ("m02", "CLEAN drops the mismatched term",
     [(CLEAN_COND, "if (unchecked === 0) return { code: 0, matched, mismatched, unchecked, external };")]),
    ("m03", "declared digest accepted at any hex length",
     [("^tool_sha256=([a-f0-9]{64})$", "^tool_sha256=([a-f0-9]+)$")]),
    ("m04", "digest comparison inverted (!= treated as a match)",
     [("if (sha(bytes) === declared) matched++;", "if (sha(bytes) !== declared) matched++;")]),
    ("m05", "symlink detection removed",
     [("    if (st.isSymbolicLink()) return { code: 2, token: 'SYMLINK_RECEIPT' };\n", "")]),
    ("m06", "missing receipt directory answered as empty CLEAN",
     [("if (!existsSync(dir)) return { code: 2, token: 'DIR_UNREADABLE' };",
       "if (!existsSync(dir)) return { code: 0, matched: 0, mismatched: 0, unchecked: 0, external: 0 };")]),
    ("m07", "per-receipt rev= ignored in favour of the --rev default",
     [("const useRev = ownRev || rev;", "const useRev = rev;")]),
    ("m08", "worktree bytes used instead of `git show <rev>:<path>`",
     [(GIT_FN,
       "function git(lane, a) {\n"
       "  if (a[0] === 'show') {\n"
       "    const p = join(lane, String(a[1]).slice(41));\n"
       "    if (existsSync(p)) return { status: 0, stdout: readFileSync(p) };\n"
       "    return { status: 1, stdout: null };\n"
       "  }\n"
       "  return spawnSync('git', ['-C', lane, ...a], { maxBuffer: 64 << 20 });\n"
       "}")]),
    ("m09", "the cmd= string is hashed instead of the instrument file",
     [("if (sha(bytes) === declared) matched++;", "if (sha(cmd) === declared) matched++;")]),
    ("m10", "a receipt with no cmd= is accepted as matched",
     [("if (!cmd || !declared) { unchecked++; continue; }",
       "if (!cmd) { matched++; continue; }\n    if (!declared) { unchecked++; continue; }")]),
    ("m11", "DRIFT exits 0",
     [("external=${r.external} first=${r.first}`);\n  process.exit(1);",
       "external=${r.external} first=${r.first}`);\n  process.exit(0);")]),
    ("m12", "CLEAN line prints the file count as matched",
     [(CLEAN_RET, "return { code: 0, matched, files: files.length, mismatched, unchecked, external };"),
      ("RECEIPT_BIND: CLEAN matched=${r.matched}", "RECEIPT_BIND: CLEAN matched=${r.files}")]),
    ("m13", "empty-directory guard removed (empty dir reads CLEAN)",
     [("  if (files.length === 0) return { code: 2, token: 'DIR_UNREADABLE' };\n", "")]),
    ("m14", "both verdict lines print the file count as matched",
     [(CLEAN_RET, "return { code: 0, matched, files: files.length, mismatched, unchecked, external };"),
      (DRIFT_RET, "return { code: 1, matched, files: files.length, mismatched, unchecked, external, first };"),
      ("RECEIPT_BIND: CLEAN matched=${r.matched}", "RECEIPT_BIND: CLEAN matched=${r.files}"),
      ("RECEIPT_BIND: DRIFT matched=${r.matched}", "RECEIPT_BIND: DRIFT matched=${r.files}")]),
]


def main() -> int:
    src = REF.read_text()
    OUT.mkdir(parents=True, exist_ok=True)
    manifest = []
    for mid, desc, edits in MUTANTS:
        text = src
        for old, new in edits:
            n = text.count(old)
            if n != 1:
                print(f"ABORT {mid}: expected 1 occurrence, got {n}: {old[:60]!r}", file=sys.stderr)
                return 2
            text = text.replace(old, new)
        p = OUT / f"{mid}.mjs"
        p.write_text(text)
        manifest.append({"id": mid, "desc": desc, "path": str(p),
                         "bytes": len(text.encode()),
                         "edits": [{"old": o, "new": n} for o, n in edits]})
        print(f"{mid}: {desc} -> {p}")
    (OUT / "manifest.json").write_text(json.dumps(manifest, indent=2) + "\n")
    print(f"wrote {len(manifest)} mutants")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
