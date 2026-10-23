RESULT ReviewSurfaceProbeTail rev=269dadb6 verdict=SOUND defects=0

R46-3 diff reviewed: `git -C <lane> diff cac43009b22232c1ae8efdab4f2789516c1fcc6f 269dadb6a56744531bd1201e5944185e96ff6a4c -- scripts/surface-probe.mjs` (87+/3-). All runs below under `systemd-run --user --scope --quiet -p MemoryMax=4G -p TasksMax=512 timeout -s KILL 900`. No tools installed (existing node/git/systemd-run).

1. Selftest at 269dadb6 (scratch clone w2-ReviewSurfaceProbeTail/new):
```
$ node scripts/surface-probe.mjs --selftest
...
PASS  checklists: every ran line carries `wall=`/`load1=`, a FAIL line appends the last 8 output lines (`  | `, ≤2000 bytes) — R46-3 — exit=1 ran=3 receipted=3 tail=8:L5..L12 huge=5/2000B
46/46 cases passed
VERDICT: PASS
EXIT=0
```

2. New case fails on old code — same 3-item fixture at cac43009 (scratch clone old) produces lines without wall=/load1=; the new check's predicate over that text: ran=3 receipted=0 (FAIL). Old lines: `CHECKLIST  FAIL SKILL.md:4 exit=3 expected=0 substring=miss — fails with a tail` (no wall/load1, no tails).

3. Every ran PASS/FAIL line carries wall= and load1= (verified text+JSON on fixtures A/B/C/D); prefix up to `substring=` byte-identical to cac43009; `— label` stays last. SKIP(self)/SKIP(checked)/grammar-ERROR lines and summaries `CHECKLIST_SKIPPED:`, `CHECKLIST: n/m pass`, `VERDICT:` byte-unchanged (fixture D verified: SKIP ×2, ERROR, 1 PASS, 1 FAIL with 3-line tail, summary identical).

4. Tail bounds (JSON-measured payload bytes, excluding `  | ` prefix):
  - 12-line output → exactly last 8 (L5..L12), 26B.
  - 1000-line output → exactly last 8 (line993..line1000 in run b2).
  - huge (12 × 402B) → exactly 2000B, first kept line partial (documented mid-line cut).
  - single line 5000×'x' → 1 line, 2000B; 2001×'y' → 2000B; 2000×'y' → full 2000B kept (strict > bound).
  - emoji 1500×😀(4B) → 500×😀 = 2000B, no split surrogate; é×1000 = 2000B full.
  - empty / blank-only output → zero tail lines; CRLF input → trailing \r stripped (a/b/c clean).
  - binary 0xFF 0xFE 0x00 0x01 → decoded to U+FFFD×2 + NUL + SOH, single tail line, 8B.
  - kill -9 child → status=null, line still carries wall=/load1=, zero tail lines.

5. JSON superset: old item keys {line,label,command,exits,expect,status,exitOk,substringOk,skipped,failed} ⊆ new item keys + {wall,load1,tail} (tail null on pass, array on fail); top-level object keys unchanged.

6. Consumers: grep over all lane code (.mjs in scripts/, .ufo/waves/round-46|47/probe/) — the only parser of these result lines is scripts/surface-probe.mjs itself. proxy-check's RE_CHECKLIST counts `- [` task lines (unrelated); caprun/caproute probes parse their own gate-selftest outputs (not surface-probe checklists). Historical `checklists.txt` receipts are records, not parsed by code.

7. Observations (not defects of this diff):
  - Child stdout truncation nondeterminism: fixture "thousandlines" (1000 lines via `process.exit(3)`) captured tails 574..581 / 993..1000 / 180..187 across three runs — Node process.exit() drops queued pipe writes; pre-existing spawnSync behavior, not introduced here. Receipt fidelity inherits whatever the gate captured.
  - Lone-CR separators (`a\rb\rc`) are not line breaks; raw CR survives inside one receipt line (bounded by 2000B).

8. Residual risk/gaps: frozen counter not run (L1 scores C1; out of leaf scope). No load sensitivity observed (load1 recorded at item start, pre-spawn; wall post-spawn).
