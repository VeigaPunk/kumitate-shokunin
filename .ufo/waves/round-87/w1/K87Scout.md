# K87Scout — round-87 reconnaissance for round-88 pre-registration

Seat: K87Scout (scout, leaf). Read-only. Base revision `db97929212bb61ae970b10abac3cc4cd976713ae`;
freeze `25a3a75df123a59c5cf0de944a6d2f067e278f82`. Frozen `plan.md` and `probe/probe87-c1.mjs` were read
before any work and not edited. Nothing committed, nothing staged, no mutating git. Scratch removed at the end.

Evidence: `.ufo/waves/round-87/build/K87Scout/` — `cand1-…`, `cand2-…`, `cand3-…`, `cand4-…`, `kimi-fixture-matrix.txt`,
`fixtures/` (generators), `raw/` (every command output used). Installs: none.

## Candidate 1 — `spotcheck-adopt --check`: two readings, one exit

- Anchors: `scripts/spotcheck-adopt.mjs:207-217` (`--check`), `:215` SPOTCHECK_COVERAGE line, `:216` MAP line,
  `:217` exit `paths.length === 0 || uncovered.length > 0 ? 1 : 0`.
- Command (freeze clone): `node scripts/spotcheck-adopt.mjs --check` → exit 1; `SPOTCHECK_COVERAGE: DRIFT spotchecks=53 uncovered=1
  first=corpus/lessons/round-86-verifier-spotcheck.md` / `MAP: DRIFT first=uncovered:lessons/round-86-verifier-spotcheck.md`.
- Finding: the **exit is not conflated**. A fixture with a green spotcheck set and an unrelated unrowed knowledge file
  (`unrelated-drift`) prints `MAP: DRIFT` and exits 0. What is shared is one readme-map child run (`:35-39`), one
  `missing()` finding family (`:41-43`), and the `MAP:` line's `first=`, which can name the same defect as the spotcheck line
  or an unrelated one. The brief's conflation is partly refuted (exit) and holds for verdict text.
- Round-88 claim would measure: whether the printed verdict and exit jointly name the reading that set the exit, over
  fixtures (green spotcheck / red unrelated map) and (red spotcheck / green map).
- Confidence: measured on 5 hermetic fixtures + the freeze tree. Live tree not run through `--check` (its `recover()` can write).

## Candidate 2 — `K_findings` double penalty on a MISSING member

- Anchors: `scripts/proxy-check.mjs:838-841` `kCoverage` (`:840` formula), `:969-972` terms; `scripts/kimi-census.mjs:304-306`
  (absent → `live=0`, `MEMBER_MISSING`), `:337` identity only when `live>0`, `:365` `fam.members += live`.
- Formula: `coverage_kimi = floor(10 · (C1k/C1k_total) · (K_sections/K_members) · (K_members − K_findings)/K_members)`.
- Measured (`kimi-fixture-matrix.txt`, command `node scripts/proxy-check.mjs --json --kimi-root <fx>`):
  15 declared members absent → `K_members=40 K_sections=40 K_findings=15 coverage_kimi=6` (as-written 6.25);
  15 undeclared strays, all members present → `55 55 15 7` (7.27). Same finding count, scores 6 vs 7.
  One absent member and one shape drift both score 9 at k=1.
- Mechanism: the absent member leaves `members` and `sections` (these cancel in `sections/members`), and then its finding
  is charged again in `(members − findings)/members` against the already-reduced denominator.
- Round-88 claim would measure `coverage_kimi(absent k)` vs `coverage_kimi(stray k)` at matched `k`, with the
  declared universe held; a single-counted formula predicts equal scores.

## Candidate 3 — `POINTER_DEAD` precision: prose examples as dead paths

- Token class: a single inline backtick span whose final extension is in `txt|json|jsonl|md|mjs|js|sh|py|html|tsv|csv|log`
  (`scripts/report-receipt-diff.mjs:60`), extracted from prose only (`:160`, `:233-236`), checked at `:238-257` against
  lane root, report dir, and round dir. No slash required; no exemption list.
- Measured (command `node <rrd>/scripts/report-receipt-diff.mjs --lane <rrd> --round 9 --report <r>`):
  `example-not-real.md`, `audit-env.sh`, `summary.txt`, `l0-watch-state.json`, `plan.md` each → `POINTER_DEAD`, exit 1.
  `f.txt` (present) → clean.
- cite-check exempts these same runtime-artifact shapes (`scripts/cite-check.mjs:386-391`, `:428`, `:443`); receipt-diff does not.
- Inference (not run): `` `.mjs/.rs/.sh/.js` `` does not match `:60`.
- Round-88 claim would measure: POINTER_DEAD findings on committed round reports whose token is an example, not a citation,
  and how many cite-check's exemption set would absorb.

## Candidate 4 — `cite-check` carried red: count and classes

- Command: `node scripts/cite-check.mjs` (live working tree) → exit 1, `CITE_CHECK: DRIFT (files=225 tokens=14693 errors=2304 warnings=946)`.
  Freeze clone with explicit fleet: `errors=2304`. Base `db97929` with explicit fleet: `errors=2304`.
  Disclosure: a base run with the clone's default fleet read 2677 (FLEET_MISSING 119); that is my invocation, not the base tree.
- Error classes (`grep -E '  ERROR '` census): UNRESOLVED 1866 · LINE_OOR 232 · PIN_MISMATCH 137 · REV_UNKNOWN 69 (sum 2304).
- UNRESOLVED (1866 occ., 975 distinct): mostly round-relative wave artefacts (1143 exist under some `.ufo/waves/round-*/`).
  The single code cause is `scripts/cite-check.mjs:121` `EXCLUDE_DIRS` containing `.ufo`, applied at `:290`, so the self index
  (`:1538`) never sees wave artefacts. Dead remainder 699 occ.: 603 bare basenames, 48 ellipsis-elided, 8 hash-prefix.
- LINE_OOR (232): 83 are `fleet-dispatcher.mjs` line refs (36%) — one file, stale pinned line numbers.
- PIN_MISMATCH (137): spread across many tokens (top token 4 occurrences) — not one class.
- Round-88 claim would measure: the red count after partitioning UNRESOLVED by the rung that should resolve it.

## Commands run (exit codes in brackets where non-zero is expected)

```
node scripts/cite-check.mjs [1]                       (live worktree, base, freeze — with/without explicit --fleet)
node scripts/proxy-check.mjs --json [1]               (live; and --kimi-root on 6 fixtures)
node scripts/kimi-census.mjs verify --json [0]        (live: CLEAN members=55)
node scripts/kimi-census.mjs verify --root <fx> [1]   (fixtures kf2..kf7)
node scripts/spotcheck-adopt.mjs --check [1]          (freeze clone; 5 hermetic fixtures)
node scripts/readme-map.mjs [0]                       (live: CLEAN files=221 rows=221 covered=221)
node scripts/readme-map.mjs [1]                       (freeze clone: DRIFT bad=2 first=uncovered:…round-86)
node scripts/report-receipt-diff.mjs --lane <rrd> … [1]  (hermetic fixture, 3 report variants)
git clone --shared -q /home/vgpnk/Projects/shokunin/kumitate-shokunin <scratch>/lane-clone; git -C <clone> rev-parse --show-toplevel
git -C <clone> checkout -q <rev>                      (clone only; never the lane)
```

## Live-tree observations (read-only)

- `git status --porcelain` on the lane (uncommitted): `M corpus/README.md`, `M .ufo/pins/readme-map.json`,
  `M .ufo/pins/source-captures.json`, `M SKILL.md`, `M corpus/QUALITY.md`, `M corpus/SOURCES.md`, and round-87 untracked files.
  The round-86 README row is already present in the working tree (`readme-map` CLEAN 221/221/221).
- `~/.kimi-code` is 2.0 GB; census live reads `members=55 checked=55 chain=22 info=4` (`KIMI_CENSUS: CLEAN`).

## Remaining unknowns

- Candidate 1: how the live `--check` behaves after `recover()` on a real journal — not run, to avoid a write.
- Candidate 3: the `` `.mjs/.rs/.sh/.js` `` case is inference.
- Candidate 4: which of the 420 dead distinct tokens are real missing origin-tree files vs. prose; I measured buckets, not a per-token audit.
