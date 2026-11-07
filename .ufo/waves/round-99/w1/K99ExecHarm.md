# K99ExecHarm — round 99 C1 harm battery (kill rule K3)

Seat: K99ExecHarm. Claim C1 = operability; rule R99 = sources-check `trim` strips only ASCII SP/TAB
(`value.replace(/^[ \t]+|[ \t]+$/g, '')`), every Registry cell and every `trim` caller.

## Candidate attacked

`K99ExecTool/READY` = `50b94567905676cc31c78ca47e76fd3ba625a7ae0d933b597fca0e74e1463f31`, matching
`sha256sum K99ExecTool/sources-check.mjs` (verified before the runs). Candidate trim line 137 reads exactly
`function trim(value) { return value.replace(/^[ \t]+|[ \t]+$/g, ''); }`; imports are node builtins +
`./cap-spawn.mjs` only, and the seat's `cap-spawn.mjs`/`cap-run.mjs` are byte-identical to the lane base
(same shas as the sandbox copies), so the battery drop-in is exactly the spec'd file swap.

READY was absent for the first ~9 minutes of the seat (bounded waits only, 540 s total, no sleep loop);
the fallback ctl-positive (L1 reference rule, regenerated with `make-controls99.py`, sha `80b2f3f2…`,
diff vs base = line 134 only) was run first — `cand-ctlpositive.txt` kept as a receipt. Its battery diff
had the identical shape (only the two proxy GATE_PIN_DRIFT hunks, `computed=80b2f3f2…`). All final
receipts below are the REAL candidate.

## 1. Harm battery (K3)

Sandbox: `git clone --shared` of the lane under scratch, `checkout f9cd1bff147508f0d787f9e0cc4d2191aabaf02a`
(asserted `rev-parse --show-toplevel` = sandbox). `bash .ufo/waves/round-99/close/battery.sh <sandbox> base`
→ `base.txt` (exit 0); READY candidate copied over `scripts/sources-check.mjs`, rerun label `cand` → `cand.txt`
(exit 0); `diff -u` → `battery-diff.txt`.

Per-tool verdict (one line each; full diff in battery-diff.txt):

- proxy-check: **expected** — only change is `+PROXY error GATE_PIN_DRIFT pin.sources-check:
  declared=1def379f… computed=50b9456…` plus the same term inside the `PROXY: DRIFT (…)` summary. Exit stays
  1 (pre-existing C2/C2_total bookkeeping DRIFT at base, declared=254 computed=255, identical in
  base.txt:5,10). This is the designed pin-line change: SCORECARD.md:328 pins base bytes; SCORECARD.md:395-399
  names sources-check as a re-pin target. Nothing else in the run moved.
- proxy-check --strict: **expected** — same two pin hunks only, exit 1 unchanged.
- readme-map: **same** — `README_MAP: CLEAN files=255 rows=255 covered=255`, exit 0.
- sources-check (real registry): **same** — `SOURCES_CHECK: CLEAN (rows=215 tiers=A:183,B:22,C:10
  status=queued:14,mined:173,rejected:28 entries_with_source=52 legacy=38)`, exit 0; verdict line
  byte-identical (real registry pads with ASCII SP only, so R99 changes no count).
- counter-pins: **same** — `COUNTER_PINS: CLEAN pins=50`, exit 0.
- spotcheck-adopt --check: **same** — `SPOTCHECK_COVERAGE: CLEAN spotchecks=65 uncovered=0` + `MAP: CLEAN`, exit 0.
- round-gate --tracked: **same** — `ROUND_GATE: CLEAN (mode=tracked checked=81 errors=0 warnings=0)`, exit 0.
- round-gate --round 98: **same** — `ROUND_GATE: CLEAN (round=98 … checks=10 errors=0 warnings=0)`, exit 0.
- sources-census.sh validate --file corpus/SOURCES.md: **same** — `file ok …/sandbox/corpus/SOURCES.md`, exit 0.

battery-diff.txt contains exactly two hunks (the two proxy-check runs) plus the label header line.
**No regression observed; K3 harm condition not fired.**

## 2. SOURCES.md history differential

Every committed revision of `corpus/SOURCES.md` (`git log --format=%H -- corpus/SOURCES.md`, no --follow):
**78 revisions**. For each: `git archive <rev> corpus | tar -x -C <snap>` then
`node sources-check.mjs --self <snap> --today 2026-11-07 --json` for BASE bytes and for the READY candidate
(driver `histrun.py`, comparator `histcmp.py`, both copied into this seat dir).

Result (`history.txt`): **same=78, differ=0**. (72 snapshots verdict DRIFT / 6 CLEAN at BASE — the DRIFT is
USED_BY_MISSING from corpus-only snapshots lacking scripts/, identical for both tools; the differential is
the measurement.) No committed registry revision exercises a non-blank pad class, consistent with the
plan's disclosed limit (1): the claim's value is prospective census agreement, measured by the frozen counter.

## 3. Consumers (`consumers.txt`)

Only three consumers of sources-check OUTPUT exist in the lane: `harm-matrix-gates.json`/`harm-matrix.mjs`
(verdict WORD only, `^SOURCES_CHECK: (\w+)`), `SKILL.md` checklist prose (verdict + exit code), and the K3
`battery.sh` itself (tail + exit). **No lane consumer reads `counts.rows`, tiers/status histograms, or
finding kinds** — nothing parses `--json` or the `CLEAN (rows=N …)` detail. `proxy-check.mjs` does not read
the output; it pins the file BYTES (`pin.sources-check`, proxy-check.mjs:551) → the expected GATE_PIN_DRIFT.
`round-gate.mjs`, `source-capture.mjs`, `source-dupes.mjs` read SOURCES.md with their own parsers.
R99 can change a consumer's reading only through a verdict flip; battery + 78-revision history show none.

## Receipts (this seat dir)

`base.txt` `cand.txt` `battery-diff.txt` `history.txt` `consumers.txt` `controls-gen.txt` `cand-ctlpositive.txt`
(fallback run, superseded) `histrun.py` `histcmp.py`. Scratch `/fast/scratch/hyaku/kumitate-r99/K99ExecHarm/`
removed before yield.

## Tools

None installed or upgraded (python3/node/git/bash only, all pre-existing).

## Blockers

None. READY landed during the seat; final receipts are the real candidate.
