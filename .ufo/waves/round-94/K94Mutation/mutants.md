# K94Mutation — K2 mutation test of the round-94 declared-pin rule

Target (READY): `.ufo/waves/round-94/K94ExecTool/round-gate.mjs`, sha256
`341726f3854ce424c433dfe7d4321301bc9803bc72b0b6a1657e9387f82dae20` = one line of
`K94ExecTool/READY`; byte-identical copy in scratch (`pristine/round-gate.mjs`, same sha256).
Baseline on pristine bytes: `--selftest` exit 0, `ROUND_GATE_SELFTEST: 71/71 pass`, `VERDICT: PASS`;
frozen counter `C94_C1: HELD a=1/1 b=7/7 c=77/77 d=2/2 e=1/1` (`baseline/`).

Method: 16 single-point patches, each one contiguous hunk inside the candidate's NEW/changed lines
(`diff -u scripts/round-gate.mjs <candidate>`); anchors asserted to occur exactly once
(`make_mutants.py`, `manifest-v2-readytool.json`; per-mutant diffs `diffs/`). Detectors per mutant:
(A) `node <mutant> --selftest` (exit + `^FAIL` arm names), (B) the frozen counter run form
`probe94-c1.mjs --tool <mutant> --work <scratch> --freeze 73317eca…`. Receipts: `runs/<id>-selftest.txt`,
`runs/<id>-counter.txt`.

## Table A — READY candidate (sha 341726f3)

| # | mutant (patch) | selftest (exit, passes, FAIL arms) | counter | status |
|---|---|---|---|---|
| m01 | **blanket**: `isDeclaredPin(...)` → `true` in the declared branch | 1, 61/71, 10 | UNMET a=1 b=0 c=70 d=0 e=0 | KILLED-by-selftest |
| m02 | **substring**: declared iff `SOURCES.md` text `.includes(t)` | 1, 66/71, 5 | UNMET a=1 b=7 c=77 d=1 e=0 | KILLED-by-selftest |
| m03 | **anyline**: registry-row + status filters removed | 1, 68/71, 3 | UNMET d=1 e=0 | KILLED-by-selftest |
| m04 | **contains**: `p.startsWith(tok)` → `p.includes(tok)` | 1, 69/71, 2 | UNMET d=1 e=0 | KILLED-by-selftest |
| m05 | **norejfilter**: `rejected` rows no longer skipped | 1, 69/71, 2 | UNMET d=1 e=0 | KILLED-by-selftest |
| m06 | **slashonly**: `[/?#]` → `[/]` (a `#fragment` hides the pin) | 1, 69/71, 2 | UNMET d=1 e=0 | KILLED-by-selftest |
| m07 | `SOURCES_PIN_RE` `{40}` → `{7,40}` | 0, 71/71, 0 | HELD | **SURVIVED** |
| m08 | `SOURCES_ROW_RE` `S\d{3,}` → `S\d+` | 0, 71/71, 0 | HELD | **SURVIVED** |
| m09 | status cell index `[8]` → `[7]` | 1, 69/71, 2 | UNMET d=1 e=0 | KILLED-by-selftest |
| m10 | `rejected` matched case-sensitively (`.toLowerCase()` dropped) | 0, 71/71, 0 | HELD | **SURVIVED** |
| m11 | lazy one-per-run read removed (re-read per token) | 0, 71/71, 0 | HELD | EQUIVALENT |
| m12 | `citations.declared.push(t)` → `citations.unresolved.push(t)` | 1, 66/71, 5 | UNMET a=0 d=1 e=0 | KILLED-by-selftest |
| m13 | prefix rule → exact match (`p === tok`) | 1, 67/71, 4 | UNMET a=0 d=1 e=0 | KILLED-by-selftest |
| m14 | SOURCES path `corpus/SOURCES.md` → `SOURCES.md` | 1, 66/71, 5 | UNMET a=0 d=1 e=0 | KILLED-by-selftest |
| m15 | row filter inverted (`!test` → `test`) | 1, 65/71, 6 | UNMET a=0 d=1 e=0 | KILLED-by-selftest |
| m16 | fail-closed `--json` `citations` loses the new `declared` key | 0, 71/71, 0 | HELD | **SURVIVED** |

ROWS=16 KILLED=11 SURVIVED=4 EQUIVALENT=1 (kill ratio 11/16 = 0.6875). No counter-only kills:
every selftest kill is also counter-UNMET, and no mutant is counter-killed while the selftest passes.

The six forgery shapes the plan's controls name (blanket, substring, anyline, contains, norejfilter,
slashonly) are all killed by the shipped selftest — K2's "selftest passes a forgery shape" is false for
these six, i.e. no rule-shape mutant survived. Each fails its intended new arm (plus the hermeticity
arm, which cascades because the nested `--selftest` child inherits the failing suite):
m01 → (iv)(v)(vi)(vii)(viii)+text+`COMMIT_CITED_UNRESOLVED` base arm; m02 → (iv)(v)(vi)(vii);
m03 → (v)(vi); m04 → (vii); m05 → (vi); m06 → (iii).

## Survivors (coverage findings, not kill events; the claim's counter still HELD)

- **m07 `{40}` → `{7,40}`** — a 7-39-hex URL path segment would be treated as a declared pin, though the
  frozen rule requires a *40-hex* string. Arm that should catch it: a fixture row whose URL holds a short
  hex segment, e.g. `https://github.com/o/r/blob/a1b2c3d4/x.ts`, citing `a1b2c3d4` → must stay
  COMMIT_CITED_UNRESOLVED; the mutant declares it.
- **m08 `S\d{3,}` → `S\d+`** — `| S1 |` (1-2 digits) would count as a registry row, though the frozen
  row pattern is `S` + 3+ digits. Arm: a `| S1 |` row with a 40-hex URL segment, cited as its 8-hex
  prefix → must stay undeclared; the mutant declares it.
- **m10 `rejected` case-sensitivity** — no fixture uses `Rejected`/`REJECTED`; the frozen rule's text
  names `rejected` (lowercase), so the candidate's `.toLowerCase()` reading is an interpretation, not
  literally forced. Arm: one `Rejected`-status row fixture; decide the intended reading and assert it.
  Route to the critic: the frozen rule does not state case handling.
- **m16 fail-closed `--json` shape** — the new `declared: []` key was added to both citation inits, but
  the `--json fail-closed: one schema object` arm only checks top-level keys, so an exit-2 body omitting
  `citations.declared` passes all 71 arms and the counter (which never exercises fail-closed JSON).
  Arm: assert `citations.declared` present/empty in the fail-closed schema arm.
- **m11 lazy read removed** — EQUIVALENT, argued: `declaredPins` is a pure function of the file bytes
  and only its call count changes; no output, exit code, or finding differs. The doc comment says
  "once per run"; behaviour is still correct. (Not a coverage defect; a comment-vs-code invariant only.)

## Table B — integrated lane snapshot (siblings' M-candidate, sha 158062f8, after READY)

`scripts/round-gate.mjs` in the lane worktree was modified *after* READY by the integration seats
(sha `158062f8…`, uncommitted: bounded `readRegistry` hardening + `COMMIT_CITED_DECLARED` text info line
+ arms (ix)-(xi)/text-info; selftest 75/75 PASS at snapshot). Because K2 governs shipped code, the same
battery plus two integration-line mutants was re-run on those bytes (18 mutants, anchors re-fitted;
`make_mutants_v3.py`, `manifest-v3-integrated.json`, `diffs-integrated/`, `runs-integrated/`,
`integrated/integrated-selftest.txt`).

| # | mutant | selftest | counter | status |
|---|---|---|---|---|
| m01 | blanket | 1, 62/75, 13 | UNMET b=0 c=70 d=0 e=0 | KILLED-by-selftest |
| m02 | substring | 1, 67/75, 8 | UNMET d=1 e=0 | KILLED-by-selftest |
| m03 | anyline | 1, 72/75, 3 | UNMET d=1 e=0 | KILLED-by-selftest |
| m04 | contains | 1, 73/75, 2 | UNMET d=1 e=0 | KILLED-by-selftest |
| m05 | norejfilter | 1, 73/75, 2 | UNMET d=1 e=0 | KILLED-by-selftest |
| m06 | slashonly | 1, 73/75, 2 | UNMET d=1 e=0 | KILLED-by-selftest |
| m07 | `{7,40}` | 0, 75/75, 0 | HELD | **SURVIVED** |
| m08 | `S\d+` | 0, 75/75, 0 | HELD | **SURVIVED** |
| m09 | status index 7 | 1, 73/75, 2 | UNMET d=1 e=0 | KILLED-by-selftest |
| m10 | `rejected` case-sensitive | 0, 75/75, 0 | HELD | **SURVIVED** |
| m11 | lazy read removed | 0, 75/75, 0 | HELD | EQUIVALENT |
| m12 | declared → unresolved | 1, 69/75, 6 | UNMET a=0 d=1 e=0 | KILLED-by-selftest |
| m13 | prefix → exact | 1, 70/75, 5 | UNMET a=0 d=1 e=0 | KILLED-by-selftest |
| m14 | SOURCES path dropped | 1, 69/75, 6 | UNMET a=0 d=1 e=0 | KILLED-by-selftest |
| m15 | row filter inverted | 1, 68/75, 7 | UNMET a=0 d=1 e=0 | KILLED-by-selftest |
| m16 | fail-closed `declared` key removed | 0, 75/75, 0 | HELD | **SURVIVED** |
| m17 | integration info line removed | 1, 73/75, 2 | UNMET e=0 (a-d pass) | KILLED-by-selftest |
| m18 | bounded `readRegistry` → `readText` | hang: `timeout 180` exit 124, empty stdout | not run (see below) | KILLED-by-selftest-hang |

ROWS=18 KILLED=13 SURVIVED=4 EQUIVALENT=1 (kill ratio 13/18 = 0.7222). m17's FAIL is exactly the new
arm `text mode: a green round with a declared pin prints one ROUND_GATE info COMMIT_CITED_DECLARED line`
(plus the hermeticity cascade), confirming the integration's disclosure arm has teeth. m18 re-opens the
unbounded `readText` path and the newly added FIFO arm (ix) blocks forever — no verdict within 180 s
(stdout block-buffered, receipt empty); the counter was not run for m18 because its embedded `--selftest`
step is the same hang and the counter's own child timeout is 600 s (declared, not silently skipped).
The four Table-A survivors persist unchanged on the integrated bytes; no new rule defect was introduced
by integration for the six forgery shapes.

## Evidence map / controls

- Baseline pristine: `baseline/pristine-selftest.txt`, `baseline/pristine-counter.txt`.
- 16 READY mutants: sources are reproducible from `make_mutants.py` + the READY bytes (`manifest-v2-readytool.json`
  records every sha256); receipts `runs/`; hunk-level `diffs/`.
- Integrated snapshot: `make_mutants_v3.py` + `158062f8` bytes; receipts `runs-integrated/`; diffs `diffs-integrated/`.
- ctl-positive fallback (READY absent): regenerated in scratch with `probe/make-controls94.py` from the
  frozen base bytes → `ctl-positive.mjs` sha `c67dbc8d…` (matches `controls/controls-sha256.txt`), selftest
  61/61 PASS, i.e. the reference rule adds **no** declared-pin selftest arms; the frozen control receipts
  for the seven forgeries (`controls/ctl-*.txt`, UNMET d=1/2) were copied into this seat dir. READY then
  appeared, so Table A/B above are the authoritative runs.
- Lane integrity: no lane file was written by this seat. At HEAD `73317eca` the lane blob
  `scripts/round-gate.mjs` is `09d4d792…` (unchanged); the worktree copy `158062f8…` is the sibling
  integration edit described above. Candidate READY sha256 re-checked unchanged after all runs
  (`hashes.txt`).
