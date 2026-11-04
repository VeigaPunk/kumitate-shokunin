# kumitate round 76 — frozen plan (L1, 2026-11-04)

Base: lane branch `master` = `ebfcedfaaa375517d99d2281e647a9293541efec` (round-75 close + the round-75
closure and its erratum).
Host: Linux 7.2.11-arch1-1 x86_64 (restored run-15 host), node v24.21.0, installed harness
`omp/18.15.0`.
This file is frozen and committed in the scaffolding commit **before any data seat runs**, together
with every open/base receipt and every control receipt it names (Q58, Q64, Q65). Nothing below may be
narrowed after data; a miss is an honest stop.

Claims (2): C1 coverage:omp / C2 operability. Distinct axes, causally separable: C1 edits
`scripts/omp-census.mjs` + `scripts/proxy-check.mjs` + the scorecard registry; C2 adds a new
`scripts/spotcheck-adopt.mjs` and touches the README map/pin only through its own adopt arm. Neither
edits the other's file.

## C1 — coverage:omp: the axis stops being the one live row the proxy does not derive

Surface moved: the OMP agent plane `~/.omp/agent`. Before this round it is an axis row in
`## Axes` only — `SCORECARD.md` says in its own words "this row is deliberately not an `AXIS_ROWS`
term, so `AXES_DRIFT` does not cross-check it", and the registry has no row for the plane. After:
the plane is registry family **`O1`** and `proxy-check` derives its score from the census's own rule
tables, cross-checks it against the `## Axes` row and refuses a stanza that declares a value the tool
does not derive.

Instrument: `scripts/omp-census.mjs` (contract `kumitate-omp-census-v1` unchanged; exports its
declared-member tables and its shape decision for in-process import, `isMain` guard unchanged) and
`scripts/proxy-check.mjs` (contract `kumitate-proxy-v1`, **six additive O keys**; no existing term's
meaning changes).

Score (pre-registered): `coverage_omp = floor(10 × C1o/C1o_total × (O_members − O_findings) / O_members)`,
where `C1o/C1o_total` = `yes` rows among scorecard registry rows matching `/^\| O\d+ \|/`, and
`O_members`/`O_findings`/`O_bound` are the census's own counts over the live root (`--omp-root`,
default `$OMP_AGENT_ROOT` or `~/.omp/agent`) and the note `<self>/corpus/knowledge/omp-agent-root.md`.
A zero denominator scores 0, never NaN.

Before at base `ebfcedfa`:
- `node scripts/proxy-check.mjs --json` prints the 17 terms; `grep -c '"coverage_omp"'` → **0**
  (`open/proxy-json-open.txt`).
- `grep -c '^| O1 |' SCORECARD.md` → **0** (the registry carries S1–S8, R1–R11, K1–K5 only).
- `node scripts/omp-census.mjs` → `OMP_CENSUS: CLEAN (root=/home/vgpnk/.omp/agent entries=64
  findings=0 bound=35/35)` exit 0 (`open/omp-census-open.txt`).

Frozen predicate — C1 verifies iff, at the measured commit, **all** of:
- (a) `node scripts/proxy-check.mjs --json` prints `terms.C1o=1`, `terms.C1o_total=1`,
  `terms.O_members=64`, `terms.O_findings=0`, `terms.O_bound=35`, `terms.coverage_omp=10`, and
  `node scripts/proxy-check.mjs --json | grep -c '"coverage_omp"'` → **1**;
- (b) `node scripts/proxy-check.mjs --strict` exits 0 printing `PROXY: MATCH`, with the
  `kumitate-proxy-v1` stanza carrying all six O keys (`C1o=1 C1o_total=1 O_members=64 O_findings=0
  O_bound=35 coverage_omp=10`) and the `## Axes` row `| coverage:omp | 10 |`; `AXES_DRIFT` now
  covers six axis rows (the five frozen ones plus `coverage:omp`);
- (c) the registry carries exactly one `| O1 |` row whose fourth cell starts `yes`, whose note cell
  names `knowledge/omp-agent-root.md`, and `node scripts/omp-census.mjs` still reads `CLEAN … bound=35/35`
  (the note-binding arm is the plane's member gate);
- (d) fail-closed, never MATCH: `--omp-root <path that is not a directory>` → exit 2 with token
  `OMP_ROOT_NOT_A_DIR`; a run whose `--self` copy has no `corpus/knowledge/omp-agent-root.md` → exit 2
  with token `OMP_NOTE_MISSING`;
- (e) the term is live, not constant: `--omp-root <scratch fixture root that copies the live shape plus
  one added bogus member>` with the unchanged stanza reads `O_findings=1`, `coverage_omp=9` and a
  `COVERAGE_OMP_DRIFT`/`O_FINDINGS_DRIFT` finding (exit 1) — the value follows the root;
- (f) `node scripts/proxy-check.mjs --selftest` exits 0 with `PROXY_SELFTEST: n/n pass`, n ≥ 135, and
  each of the ≥3 new arms is killed by removing that arm's branch alone (one receipt line per arm).

Kill rule: an off-value in (a)–(c); a constant printer meeting (a); (e) reading the declared 10 on a
root with a finding; an arm surviving its mutant; the stanza accepting a declared O score the tool
does not derive (control `controls/c1-declare-only.txt` must stay refused); any existing v1 term
changing meaning or value beyond the pre-registered re-measure.

Control C1 (pre-data, `controls/`): `c1-declare-only.txt` — a scratch copy of `SCORECARD.md` with
`coverage_omp=10` added to the stanza and `| coverage:omp | 10 |` to `## Axes`, run against the base
tool: it must be refused (`STANZA_UNKNOWN_KEY`), so a score cannot be declared into existence.
`c1-axis-only.txt` — a scratch copy with only the Axes row added: the base tool's verdict is
unchanged (it does not know the row), so the row alone governs nothing. `open/proxy-json-open.txt` is
the do-nothing control: no key, no value.

Axis arithmetic (pre-registered): `coverage:omp` before **10** (the axis row's own value; the census
reads 64/64) and after **10** — the claim is the *derivation and cross-check*, not a score change;
the movement is counted in derived axes (5 → 6) and registry families (19 → 20 for S/R, plus K/O
plane families). No retired or frozen row changes: `coverage` (retired aggregate), `coverage:script-layer`,
`coverage:runtime-layer`, `coverage:kimi-layer`, `operability` must read exactly what `proxy-check`
derives at the measured commit.

## C2 — operability: capability acquisition `spotcheck-adopt` (the 5th-recurrence repair stops being hand work)

Surface moved: the corpus coverage repair loop. The non-author closure writes
`corpus/lessons/round-<N>-verifier-spotcheck.md` **after** the lane's close, so each of rounds 72, 73,
74, 75 opened with `README_MAP: DRIFT … first=uncovered:<that file>` and each repair was hand work
(README row + `readme-map.json` covered entry). After: one command owns the two-sided write, refuses
everything else, and the *next* closure artifact is a named expectation at close.

Instrument: new `scripts/spotcheck-adopt.mjs` (contract `kumitate-spotcheck-adopt-v1`); the oracle is
the unchanged `scripts/readme-map.mjs` (`kumitate-readme-map-v2`), run by the instrument as a child
after any write and required to read `README_MAP: CLEAN`.

Before at base `ebfcedfa`:
- `node scripts/spotcheck-adopt.mjs` → no such file (`node` exit 1, `MODULE_NOT_FOUND`).
- `node scripts/readme-map.mjs` → `README_MAP: DRIFT files=182 rows=181 covered=181 bad=2
  first=uncovered:lessons/round-75-verifier-spotcheck.md` exit 1 (`open/maps-open.txt`).

Frozen predicate — C2 verifies iff, at the measured commit, **all** of:
- (a) `node scripts/spotcheck-adopt.mjs --check` exits 0 printing
  `SPOTCHECK_MAP: CLEAN spotchecks=<n> uncovered=0` (after the repair below);
- (b) the repair is the tool's own: `node scripts/spotcheck-adopt.mjs --adopt
  corpus/lessons/round-75-verifier-spotcheck.md` exits 0 printing `SPOTCHECK_ADOPT: ADOPTED
  corpus/lessons/round-75-verifier-spotcheck.md` followed by `README_MAP: CLEAN files=182 rows=182
  covered=182`; the README carries exactly one `| `lessons/round-75-verifier-spotcheck.md` |` row and
  `.ufo/pins/readme-map.json` carries the path exactly once; `node scripts/readme-map.mjs` → CLEAN
  exit 0;
- (c) idempotent: a second `--adopt` on the same path exits 0 printing `SPOTCHECK_ADOPT:
  ALREADY_ADOPTED corpus/lessons/round-75-verifier-spotcheck.md`, and the README + pin bytes are
  unchanged (sha256 before = after);
- (d) each refusal exits 2 and writes nothing (both files' sha256 unchanged):
  `REFUSED_OUT_OF_SCOPE` (`--adopt SCORECARD.md`), `REFUSED_NOT_SPOTCHECK`
  (`--adopt corpus/lessons/round-75.md`), `REFUSED_ABSENT` (`--adopt
  corpus/lessons/round-99-verifier-spotcheck.md`);
- (e) both half-states are repaired one-sidedly: a row present / pin missing fixture → adopt writes
  only the pin, final verdict CLEAN; a pin present / row missing fixture → adopt writes only the row,
  final verdict CLEAN (fields `wrote=row|pin|both` on the `ADOPTED` line);
- (f) `node scripts/spotcheck-adopt.mjs --predict 76` exits 0 printing
  `SPOTCHECK_PREDICT: PENDING corpus/lessons/round-76-verifier-spotcheck.md` at close (the closure
  artifact does not exist yet), and `--predict 75` prints `SPOTCHECK_PREDICT: COVERED
  corpus/lessons/round-75-verifier-spotcheck.md` exit 0;
- (g) `node scripts/spotcheck-adopt.mjs --selftest` exits 0 with `SPOTCHECK_ADOPT_SELFTEST: PASS
  (n/n)`, n ≥ 12 cases, each arm killed by removing that arm's branch alone (one receipt line per arm).

Kill rule: an off-value in (a)–(f); a hand edit reaching CLEAN (controls `c2-row-only.txt` and
`c2-pin-only.txt` must both stay DRIFT); a second adopt changing bytes; a refusal writing a byte; an
arm surviving its mutant; the check mode not naming an uncovered spotcheck file.

Control C2 (pre-data, `controls/`): `c2-row-only.txt` (scratch corpus + README with the row added and
the pin unchanged → `README_MAP: DRIFT … unpinned:lessons/round-75-verifier-spotcheck.md`) and
`c2-pin-only.txt` (pin added, row not → `DRIFT … uncovered:`), both on scratch copies, plus the live
`open/maps-open.txt` as the do-nothing control. Together they show the two-sided write is load-bearing
and neither half alone can pay for the claim.

Capability: on admission `spotcheck-adopt` enters the SCORECARD capabilities table with evidence
`close/spotcheck-adopt.txt`. Operability integer stays 9 (`f_O` is terminal at 9 for any finite A+C);
`A` rises by the new script and the stanza is re-measured in the same work commit.

## Score arithmetic (pre-registered, so the report cannot fit it)

| axis | before | after target | ceiling |
|---|---|---|---|
| coverage:omp | 10 (row; not derived, not registered) | 10, now derived + AXIS-checked + registered as `O1` | 10 = terminal for `(E−F)/E` |
| operability | 9 (terminal) | 9 + capability row `spotcheck-adopt` | 9 is this proxy's terminal integer |

## Routed repairs (not claims; inherited red states)

- R75-spotcheck D1 (stale `A`): the round-75 SCORECARD prose and LOG entry say `A 821→832` / `A=832`
  while the stanza and report read 833. Append-only erratum naming the superseded lines.
- R75-spotcheck D2 (stale remote pointers): the filed round-75 report's "final lane tip `c775e9b1`"
  and "`ls-remote … reads f297289f`" are superseded by the post-filing receipt commits and the current
  tip. The round-76 report names the superseded lines and the actual tip.
- R75-spotcheck D3 (5th recurrence): `lessons/round-75-verifier-spotcheck.md` is the uncovered file at
  open. Its repair **is** C2's demonstration (by the new tool, not by hand).
- Open drift, re-measured in the work commit: the stanza's `C2/C2_total` 181 → 182 (round-75 lesson +
  the closure lesson), `A`, and the pins `pin.omp-census`, `pin.proxy-check` and the new
  `pin.spotcheck-adopt` (the lane-owned `kumitate-gate-pins-v1` block, per its own registry row rule).
- `node scripts/round-gate.mjs --close` still fail-closes `UPSTREAM_MISSING` on the lane's detached
  `HEAD` (carried r75 D4, operator-side fix): not a claim, reported again.

## Inherited state

No uncommitted lane-authored leftovers at base: `jj-lane.sh state` reads
`local=ebfcedfaaa375517d99d2281e647a9293541efec remote=… ahead=0 behind=0` and
`git status --porcelain` is empty. Files this lane did not author (`corpus/lessons/round-75-verifier-spotcheck.md`,
`MANIFEST.json`) are named, never edited.

## Amendment 1 (2026-11-04, written by the L1 before any claim verdict)

Append-only. Nothing above is rewritten; every clause below is a correction of a clause that could
not discriminate as written, landed before the round's verdicts (the round-75 Amendment 1/2
precedent; the reviewer's FREEZE-FIX items and the critic's FLAWS are the triggers).

- **A1.1 — C1(a)'s JSON occurrence count.** The frozen clause reads `grep -c '"coverage_omp"'` → 1.
  `--json` prints every term twice — computed `terms.<key>` and the stanza's `terms.declared.<key>` —
  so a correct implementation reads **2** (`close/c1-json.txt`). The counter discriminated the base
  (0) but the after-value was mis-frozen because the `terms.declared` block was not read at freeze
  time. Operative reading: `terms.coverage_omp === 10` and the key present in both slots; both the
  literal (2 ≠ 1) and the corrected reading are reported, and the literal miss is not papered over.
- **A1.2 — C1(b)'s `--strict` MATCH and separability.** C1(b) is a whole-tree verdict; at base the
  stanza is red for an inherited reason (`C2_total` 181/182 and the retired `coverage` AXES row), and
  the round owes that repair independently as a routed item (D3). C1 therefore depends on the repair
  landing, not on C2's *tool*: the repair's two halves can also be written by hand (the reviewer
  reproduced `README_MAP: CLEAN` from a hand-edited row+pin), so the claims stay causally separable
  at the mechanism level. The receipt shows the tool performed it; it does not claim the tool is the
  only way.
- **A1.3 — C2's kill rule.** "A hand edit reaching CLEAN" would kill a valid oracle state, not a
  defect: the oracle checks a bimap, not its author. The operative proof is the tool's own receipt —
  `SPOTCHECK_ADOPT: ADOPTED … wrote=both` followed by the oracle's CLEAN line — plus the two
  half-state controls (`c2-row-only.txt`, `c2-pin-only.txt`) staying DRIFT. A hand edit is not
  evidence for the claim and no longer a kill condition.
- **A1.4 — token erratum.** `controls/c1-declare-only.txt` prints `STANZA_KEY_UNKNOWN`; this plan's
  C1 control paragraph wrote `STANZA_UNKNOWN_KEY`. The receipt is the authority; both spellings are
  quoted verbatim in the lesson and the report.
- **A1.5 — runtime provenance.** The plan names node v24.21.0 and every lane receipt in `close/` was
  run with it (`node --version` printed in each header). Wave seats observed `v26.12.0` on their own
  PATH; their numbers are seat-side observations, never lane receipts, and are not relabelled.
- **A1.6 — C1(e) strengthened.** One negative root could be special-cased by a printer (the critic's
  path-special-case attack). The claim is evidenced on **two** shape-only roots with different
  results: +1 member → `O_members=65 O_findings=1 coverage_omp=9`; +10 → `74/10/8`
  (`close/c1-negative-plus1.txt`, `close/c1-negative-plus10.txt`), plus a 13-mutant battery run on
  the final bytes (`close/mutants.txt`, `MUTANTS76: ALL-KILLED killed=13/13`), whose C1-M2 is the
  constant-10 printer and C1-M6 the registry-inflation path.
