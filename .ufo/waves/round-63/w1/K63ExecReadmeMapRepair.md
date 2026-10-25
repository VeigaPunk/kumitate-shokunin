VERDICT: The base `readme-map` DRIFT is repaired by a two-hunk mirror diff (row + appended pin → `README_MAP: CLEAN files=151 rows=151 covered=151` exit 0), the three round-63 landings read DRIFT at every unrowed landing and CLEAN only when file+row+pin land together (151→154), and the recurrence gets a structural fix — a mechanical writer plus a reproducing close receipt — whose rejected "one wildcard row" alternative is shown unable to fail on a real unmapped spot-check.

## Evidence

Lane at `b38a2065ab8ac5b198f6569b9013d04411c3d40d`; lane untouched (`git status --porcelain corpus .ufo/pins scripts` → empty). All work in mirrors under the build dir.

1. Frozen base, live lane and mirror agree (`node scripts/readme-map.mjs`; `bash repro.sh` step 0 on `frozen/`):
```
README_MAP: note unpinned:lessons/round-62-verifier-spotcheck.md
README_MAP: DRIFT files=151 rows=150 covered=150 bad=2 first=uncovered:lessons/round-62-verifier-spotcheck.md
EXIT=1
```
2. Repair applied in `mirror/` (one row after `lessons/round-62.md`; pin appended at the end of `covered`, per `readme-map.mjs:58` "grows by append … never rewritten"):
```
README_MAP: CLEAN files=151 rows=151 covered=151
EXIT=0
```
`grep -c '^| `\(knowledge\|lessons\)/' mirror/corpus/README.md` → 151; `ls mirror/corpus/{knowledge,lessons}/*.md | wc -l` → 151; pins 151 unique.
3. Round-63 landing dry-run (`repro.sh` → `dryrun.log`, full table in `apply/04-round63-landing.draft.md`):
```
2a entry, no row        DRIFT files=152 rows=151 covered=151 bad=2 first=uncovered:knowledge/multi-agent-coordinator-topologies.md   EXIT=1
2b entry+row+pin        CLEAN files=152 rows=152 covered=152                                                                       EXIT=0
2c round-63.md, no row  DRIFT files=153 rows=152 covered=152 bad=2 first=uncovered:lessons/round-63.md                              EXIT=1
2d round-63.md+row+pin  CLEAN files=153 rows=153 covered=153                                                                       EXIT=0
2e spotcheck, no row    DRIFT files=154 rows=153 covered=153 bad=2 first=uncovered:lessons/round-63-verifier-spotcheck.md           EXIT=1
2f spotcheck+row+pin    CLEAN files=154 rows=154 covered=154                                                                       EXIT=0
```
Between the two lesson landings (2d) the gate reads CLEAN; the moment the closure's own file lands (2e) it reads DRIFT — the recurrence is a landing-order property, not a gate bug.
4. Writer selftest and behaviour (`apply/readme-map-append.mjs`; `repro-fix.sh` §F1):
```
README_MAP_APPEND_SELFTEST: PASS (8/8) / VERDICT: PASS   EXIT=0
F1a row+pin removed   → DRIFT files=151 rows=150 covered=150 bad=2 first=uncovered:lessons/round-61-verifier-spotcheck.md  EXIT=1
F1b writer            → README_MAP_APPEND: OK lessons/round-61-verifier-spotcheck.md row=inserted pin=inserted              EXIT=0
    gate              → README_MAP: CLEAN files=151 rows=151 covered=151                                                   EXIT=0
F1c second run        → README_MAP_APPEND: OK … row=present pin=present                                                    EXIT=0
F1d phantom path      → README_MAP_APPEND: FAIL-CLOSED reason=no such corpus file: corpus/lessons/round-99-verifier-spotcheck.md  EXIT=2
```
5. Rejected alternative — wildcard row (`repro-fix.sh` §F3, mutant gate expanding `round-*-verifier-spotcheck.md`):
```
F3a honest gate on wildcard row → DRIFT files=151 rows=151 covered=151 bad=2 first=orphan-row:lessons/round-*-verifier-spotcheck.md  EXIT=1
F3b mutant gate                 → CLEAN files=151 rows=151 covered=151                                                               EXIT=0
F3c mutant, row removed for lessons/round-62.md → DRIFT bad=1 first=uncovered:lessons/round-62.md                                    EXIT=1
```
`F3b` = a real spot-check lesson with no row of its own reads CLEAN → the rule cannot fail on the class it claims to fix.
6. Close-receipt enforcement (`repro-enforce.sh` → `enforce.log`, git fixture in `mktemp -d`, never the lane):
```
E1 receipt-attest run at repaired tip   → "exit":0
E2 receipt-evidence --rev <repaired>    → RECEIPT_EVIDENCE: HELD receipts=1 reproduced=1 sweep_files=1 sweep_nonces=1 span_ms=0   EXIT=0
E3 same receipt, drifted tree           → RECEIPT_EVIDENCE: UNMET reason=REPRODUCE detail=readme-map.txt                        EXIT=1
E4 receipt-attest at FROZEN base        → "exit":1   (no CLEAN receipt can be minted at the base)
```
7. Independent count cross-check (peer `K63ExecProxyStanza/recompute.sh` on the lane, read-only):
```
# C2_total counts 151 corpus notes; C2 counts 150 README map rows
A=414  C2=150  C2_total=151   coverage=9
```
8. Patch applicability and gate selftest: `git -C <fixture> apply --check -p1 apply/01-readme-map-repair.patch` → `APPLY_CHECK=ok`; `node scripts/readme-map.mjs --selftest` → `README_MAP_SELFTEST: PASS (16/16)` `VERDICT: PASS` exit 0.

## Findings

**K63ExecReadmeMapRepair-1** (high; attacks the base drift + the gate). `lessons/round-62-verifier-spotcheck.md` has no coverage-map row and no `covered` pin → `bad=2`. Repair = `apply/01-readme-map-repair.patch`: one row after `lessons/round-62.md` (three cells, neighbouring style, cites S195 + the file's real paths `.ufo/reports/round-62/kumitate.md`, `.ufo/waves/round-62/w1/Audit19.md`, `.ufo/waves/round-62/w2/RevS126Quote.md`; all seven cited S-ids S034/S068/S084/S095/S123/S126/S195 exist as `corpus/SOURCES.md` rows) plus the pin appended at the end of `covered`. Reproduce: `bash repro.sh` (step 0 vs step 1).

**K63ExecReadmeMapRepair-2** (high; attacks the integration, not the gate). `SCORECARD.md:292-293` declares `C2=150` / `C2_total=150` while the corpus holds 151 notes; after the repair rows=files=151, so `proxy-check` would read both `C2_DRIFT` and `C2_TOTAL_DRIFT` unless the stanza moves. Proposal `apply/02-scorecard-c2.patch` (C2=151, C2_total=151). Reproduce: `sh .ufo/waves/round-63/build/K63ExecProxyStanza/recompute.sh <lane>` → `C2=150 C2_total=151`.

**K63ExecReadmeMapRepair-3** (high; structural root cause). No gate that runs at round close executes `readme-map`: `grep -rn 'readme-map' scripts/*.mjs` returns only `scripts/readme-map.mjs` and `scripts/proxy-check.mjs:475` (a pin hash row). The only live close-time term, `proxy-check` C2 (`:507`, `:945-946`), is count-only — it can see a count drift, never a swap — and at the base it dies earlier at `GATE_PIN_KEY_UNKNOWN` (`base/proxy-before.txt` exit 2). Fix `apply/03-structural-fix.md`: rule **MAP_LANDING** = writer (`apply/readme-map-append.mjs`, contract `kumitate-readme-map-append-v1`) + a `close/` receipt of `node scripts/readme-map.mjs` that `receipt-evidence.mjs` must read `HELD` (evidence §6) + a `corpus/QUALITY.md` criterion with a failing command. Reproduce: `grep -rn 'readme-map' scripts/*.mjs`; `bash repro-enforce.sh`.

**K63ExecReadmeMapRepair-4** (medium; attacks the tempting fix). "Treat `*-verifier-spotcheck.md` as covered by one wildcard row" is disqualified: with the mutant gate a real unmapped spot-check reads `CLEAN` (§5 F3b), i.e. the gate loses exactly the class that recurred eight times, while still catching other classes (F3c). Reproduce: `bash repro-fix.sh` §F3.

**K63ExecReadmeMapRepair-5** (medium; correctness of any hand-edit). `.ufo/pins/readme-map.json` is **append-ordered, not sorted** (`lessons/round-6-aggregator-audit.md` follows `lessons/round-62.md`). A sorted insert reorders six unrelated lines — measured in the writer's first iteration and corrected; the shipped writer appends and preserves the file's missing trailing newline (a naive `JSON.stringify(…, null, 2)+"\n"` adds one byte). Reproduce: `bash repro-fix.sh` §F1e (`diff <(cat mirror/.ufo/pins/readme-map.json) <(cat mutant/.ufo/pins/readme-map.json)` → 3 lines, not the 6-line reorder the sorted insert produced).

**K63ExecReadmeMapRepair-6** (low; the recurrence's shape). Every unrowed landing is DRIFT and every together-landing is CLEAN (§3); the closure's spot-check file lands last, after the round's own row work, which is why the class keeps reappearing at the same point. The appender makes the honest path one command; it does not force it.

## Artifacts

All under `.ufo/waves/round-63/build/K63ExecReadmeMapRepair/`:
- `apply/01-readme-map-repair.patch` (ready to apply, `-p1` from the lane root; `--check` ok)
- `apply/02-scorecard-c2.patch` (proposal, L1-owned file)
- `apply/03-structural-fix.md`, `apply/04-round63-landing.draft.md`, `apply/05-registry-rows.draft.md`
- `apply/readme-map-append.mjs` (writer draft, sha256 `ba56596f4b3e7da01b87c7da9df5c3899a4065685440afaddc62113ebb498064` — re-pin the committed bytes)
- `repro.sh`, `repro-fix.sh`, `repro-enforce.sh` + `dryrun.log`, `fix.log`, `enforce.log`
- mirrors: `mirror/` (repaired), `frozen/` (base), `dryrun/` (landing states), `mutant/` (writer), `wildcard/` (rejected rule)

## Limits

- Did not run the round-63 frozen probes or either claim arm (`INLINE63`, `TOPOLOGY63`) — not this seat's surface; the entry/lesson rows are drafts whose prose the scribe must replace.
- Did not run `proxy-check` post-repair: it is FAIL-CLOSED on `GATE_PIN_KEY_UNKNOWN pin.make-dispatch-actual` (another seat's repair), so the C2/C2_total projection is arithmetic + the peer's independent `recompute.sh`, not a MATCH receipt.
- Did not run `cite-sources` end-to-end; only confirmed each cited S-id is a registry row.
- Enforcement is a criterion plus a receipt, not a gate: nothing in the lane forces the close receipt to exist (the L1 owns the close). A forcing arm would need `scripts/round-gate.mjs --close`, whose contract is parent-frozen.
- Untested by me: non-UTF8 `--desc`, a symlinked corpus file, a `## Coverage map` section absent from the README (the writer FAIL-CLOSES by construction but I did not exercise it).
- No tool installs or upgrades were needed; nothing was installed.
