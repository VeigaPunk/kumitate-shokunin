# ExecMapSelftest — round 57 / w1 (leaf executor)

Item: run `node scripts/readme-map.mjs --selftest`; count `case <name>: PASS` lines, verify
14/14 and final `VERDICT: PASS`. Axes: operability + coverage. Date: 2026-10-24.

**Result: corroborated — 14/14 `case …: PASS`, `VERDICT: PASS`, exit 0. No falsification found.**
No lane production file was read-modified or written; the only lane writes are
`.ufo/waves/round-57/build/ExecMapSelftest/**` and this report.

## Revision binding

| Object | Value |
|---|---|
| lane HEAD (not moved) | `8c6f5b017d149b18134917378cdbed3b492d8e89` (round-57 bookkeeping tip) |
| `scripts/readme-map.mjs` sha256 at HEAD | `058e503363363ca3d9dbfd7a82602bd1b7287dfc9936af25796834b8812c7727` |
| worktree sha256 | identical to HEAD (no local drift) |
| plan base `7178bfd…` | path absent (`git cat-file -e` exit 128) — matches K1 do-nothing: the capability is acquired this round |

The gate file exists only at round-57 revisions, so the selftest was executed against the
committed HEAD bytes; the working-tree bytes hash-equal those bytes.

## Assigned command — observed

`node scripts/readme-map.mjs --selftest` (cwd = lane root), stdout captured verbatim:

```
case clean: PASS
case uncovered: PASS
case orphan-row: PASS
case duplicate-row: PASS
case format-unmapped: PASS
case stale-covered: PASS
case unpinned: PASS
case empty-covered: PASS
case malformed-registry: PASS
case registry-version: PASS
case covered-scope: PASS
case readme-absent: PASS
case corpus-dir-missing: PASS
case non-corpus-rows: PASS
README_MAP_SELFTEST: PASS (14/14)
VERDICT: PASS
```

- exit `0`; stderr empty (sha256 `e3b0c442…b855`).
- `grep -c '^case .*: PASS$'` = **14**; `^case ` lines = 14; 14 unique names, no duplicates.
- Counting caveat: a naive `grep -c ': PASS$'` returns **15** because the summary line
  `README_MAP_SELFTEST: PASS (14/14)` also ends in `: PASS`. The anchored `^case …: PASS$`
  count is the correct instrument, and it is what the frozen B1 arm uses.

## Independent corroboration (not the printed line)

1. Live gate, same bytes, real corpus: `node scripts/readme-map.mjs` →
   `README_MAP: CLEAN files=135 rows=135 covered=135`, exit 0. This is the B2 shape
   (`files ≥ 130`, `files == rows`) and shows the 14 green cases sit on a gate that also
   evaluates the committed corpus. The 135 vs the plan's base `computed=133` is the two
   round-57 corpus files (entry + lesson) — `[INFERENCE]`, arithmetic only.
2. Frozen A57 **B1 predicate inputs** re-applied to the captured bytes:
   `{"exit":0,"cases":14,"selftest":"14/14","verdict":true,"B1_predicate_inputs_satisfied":true}`
   (B1 requires `exit 0 ∧ README_MAP_SELFTEST: PASS (a/b) ∧ a==b ∧ a≥12 ∧ VERDICT: PASS`).
   I did not run the full `attest57-probe.mjs` — that is another seat's item; only B1's own
   predicate inputs are asserted here.
3. Static read of the 14 cases (`scripts/readme-map.mjs:215-344`): every case asserts a
   distinct rule, and each red-before is a real fixture mutation (row deleted, file deleted,
   row duplicated, registry corrupted, README removed, corpus dir removed). The DRIFT classes
   named in the header are each covered: `uncovered`, `orphan-row`, `duplicate-row`,
   `format-unmapped`, `stale-covered`, `unpinned` (6/6), plus `empty-covered` (anti-vacuous
   `covered=[]`) and `non-corpus-rows` (ignore semantics).

## Mutation probes — are the 14 PASS lines load-bearing? (scratch copies only)

Control: byte-identical copy (`scratch/pristine.mjs`, sha `058e5033…`) → exit 0, 14/14.

| Mutant | Mutation (scratch copy) | Observed |
|---|---|---|
| m1 | CLEAN emit `files=` → `filesx=` | exit 1, **12/14**; exactly `clean` + `non-corpus-rows` red (the two exact-last-line assertions) |
| m2 | `if (seen.has(r))` → `if (false && seen.has(r))` | exit 1, **13/14**; exactly `duplicate-row` red |
| m3 | `format-unmapped` `bad.push` → `void` expression | exit 1, **13/14**; exactly `format-unmapped` red |

Each mutant killed precisely the intended case(s) with no collateral, so the selftest is
non-vacuous and its green count is a real signal for the mutated rules.

## Findings / risks (non-blocking, not edited — lane is read-only)

- **F1 — summary-line label is hardcoded `PASS`.** `README_MAP_SELFTEST: PASS (${passed}/${results.length})`
  (`scripts/readme-map.mjs:341`) prints `PASS` even on failure; m1/m2/m3 produced
  `README_MAP_SELFTEST: PASS (12/14)` and `PASS (13/14)`. `VERDICT:` is the authoritative
  token, and the frozen A57 B1 arm is immune because it additionally requires
  `+m[1] === +m[2]` and `/VERDICT: PASS/`. Hole only for a future check that greps the
  summary prefix alone — recorded as a risk, not a counter defect.
- **F2 — FAIL-CLOSED red-before coverage is narrower than the header's reason list.** Header
  enumerates more fail-closed reasons than the 5 arms (cases 9–13) exercise. No case covers
  `registry not a regular file`, `registry unreadable`, `registry not an object`,
  `covered not an array`, `covered entry duplicated`, `corpus dir outside knowledge|lessons`,
  empty corpus (`no *.md`), `README unreadable`. Two of these were probed directly on scratch
  fixtures and behave correctly: empty corpus → exit 2
  `FAIL-CLOSED reason=no *.md under … (empty corpus)`; `covered` string → exit 2
  `FAIL-CLOSED reason=registry covered not an array`. So behavior is right; only the
  selftest's red-before breadth is short of the header's enumeration. The frozen B1 floor
  (`≥12`, `a==b`) is met by 14/14, so no counter violation.
- No blockers. No production change proposed by this seat (assignment was execution +
  independent corroboration only). No pacman, no installs, no git/jj mutations.

## Retained evidence (under `.ufo/waves/round-57/build/ExecMapSelftest/`)

| File | sha256 |
|---|---|
| `selftest.stdout.txt` | `555fde83422a333695cb655c71ee0e0b99e8809861ce0354f9378ab2c4df9906` |
| `selftest.stderr.txt` | `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855` (empty) |
| `selftest.exit.txt` | `9a271f2a916b0b6ee6cecb2426f0b3206ef074578be55d9bc94f6f3fe3ab86aa` (`0`) |
| `gate-live.stdout.txt` | `240d7e96361616522e9c74dace76c5af30820b3b0084a96df4eab22564c4ddda` |
| `scratch/pristine.mjs` | `058e503363363ca3d9dbfd7a82602bd1b7287dfc9936af25796834b8812c7727` |
| `scratch/m1-clean-label.mjs` | `9f67f4cc5d778b94ebf0a3f74ff22746019a76ac76640d71ed0c1ad63a6455ec` |
| `scratch/m2-duplicate-arm.mjs` | `a1a9853fbcedb777f5437a2e251b3c3fd33e772c2be294e9ddd77006a13f22cd` |
| `scratch/m3-format-arm.mjs` | `1a7fa319917467852106278c1eb6f32947d357a8db2bc1230338ae6b5c5fe0be` |
| `commands.md` | full argv/exit log |

Full stdout/stderr of every mutant is retained alongside each `.mjs`; `fx/` holds the two
fail-closed fixtures and their outputs.

**Files changed:** none in lane production (SCORECARD/LOG/SKILL/PROVINCE/corpus/scripts/jj/git
untouched); only `build/ExecMapSelftest/**` and this report. **Behavior:** no change; measured
no-change result on a read-only gate.
