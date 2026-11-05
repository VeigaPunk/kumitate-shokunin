# K91ExecCarry — carried routed defects (round 90 §6)

Report: `/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-91/w1/K91ExecCarry.md`
Seat dir: `/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-91/K91ExecCarry/`
Frozen rev: `2b1b8bf3d274db8e608035bffb27bd3b3d4009d4` (archived via `git archive` to
`/fast/scratch/hyaku/kumitate-r91/K91ExecCarry/tree`, run in `worktree-src` fixture with full history;
lane never written).

## 1. round-gate — §6 items 1 + §5.6

Method note: the bare archived tree has no `.git`, so the first runs failed closed
`NOT_A_GIT_WORKTREE` (exit 2, `round-gate-r90.txt` v1 overwritten — current file is the
real run). The fixture below fetched the lane's history (`git fetch lane`) and checked out
the frozen rev, so cited-commit ancestry resolves as in the lane.

Receipts (command, rev, exit — exact):

- `round-gate-r90.txt`: `node scripts/round-gate.mjs --round 90 --repo <fixture> --reports-dir
  /home/vgpnk/Projects/shokunin/.ufo/reports --main-repo /home/vgpnk/Projects/shokunin --lane kumitate`
  (fixture HEAD = frozen + one empty marker commit `round 90 repair: round-gate receipt` so
  `COMMIT_MISSING` can resolve; the marker is fixture-only).
  Result: `ROUND_GATE: CLEAN (round=90 lane=kumitate checks=10 errors=0 warnings=1) exit 0`
  with single warning `SCORECARD_PLAN_MISSING` (## Planned names no round later than 90).
  Verdict: §6.1 is repaired at the landed revision — the three `REPORT_MISSING` /
  `SCORECARD_ROW_MISSING` / `LOG_ENTRY_MISSING` errors from the close snapshot no longer fire,
  because the round-90 records are now present at the landed tree. The remaining warning is
  expected pre-close: `## Planned` needs a round-91 forward mention (see §1b).

- `round-gate-r91.txt`: same command, `--round 91`, at the frozen rev without the round-90
  marker (present in the file as recorded). Result: `ROUND_GATE: DRIFT
  (round=91 lane=kumitate checks=5 errors=3 warnings=1) exit 1`:
  `REPORT_MISSING /home/vgpnk/Projects/shokunin/.ufo/reports/round-91/kumitate.md`,
  `SCORECARD_ROW_MISSING` (no `| 91 |` row in `SCORECARD.md`),
  `LOG_ENTRY_MISSING` (no `- YYYY-MM-DD — round 91` line in `LOG.md`), warning
  `SCORECARD_PLAN_MISSING`. 

### 1b. What round 91 will require at close (from `round-gate.mjs` runChecks + committed receipt list)
At close the L1 must land, and re-run this gate against:
1. Fleet report `.ufo/reports/round-91/kumitate.md` in the main repo
   (`REPORT_MISSING`, `REPORT_THIN` ≥1024 bytes, `REPORT_HEADINGS` ≥2, `REPORT_ROUND_MISMATCH`
   naming round 91, `REPORT_SHONEN_MISSING` warning if no SHONEN heading).
2. `SCORECARD.md` move-log row `| 91 | …` (`SCORECARD_ROW_MISSING`).
3. `SCORECARD.md` `## Planned` naming a round > 91 (warning-only, but the round-90 warning
   carried exactly this shape).
4. `LOG.md` line `- YYYY-MM-DD — round 91` (`LOG_ENTRY_MISSING`).
5. A commit message matching `\bround[- ]91\b` in lane history (`COMMIT_MISSING`).
6. All cited commit tokens in the report resolving in lane/main/origin and being ancestors of
   lane HEAD (`COMMIT_CITED_UNRESOLVED`, `COMMIT_CITED_NOT_ANCESTOR`).
Plus `--close` mode (not run here): clean worktree (`TREE_DIRTY`), no unpushed commits
(`UNPUSHED`), report tracked+pushed in main repo (`REPORT_UNTRACKED`).

## 2. Remaining checks (archived tree at frozen rev)

| script | receipt | verdict | exit |
|---|---|---|---|
| `spotcheck-adopt.mjs --check` | `spotcheck-adopt-check.txt` | `SPOTCHECK_COVERAGE: DRIFT spotchecks=57 uncovered=1 first=corpus/lessons/round-90-verifier-spotcheck.md` / `MAP: DRIFT first=uncovered:lessons/round-90-verifier-spotcheck.md` | 1 |
| `counter-pins.mjs` | `counter-pins.txt` | `COUNTER_PINS: CLEAN pins=45` | 0 |
| `readme-map.mjs` | `readme-map.txt` | `README_MAP: DRIFT files=231 rows=230 covered=230 bad=2 first=uncovered:lessons/round-90-verifier-spotcheck.md` (+ `unpinned:` note) | 1 |
| `surface-probe.mjs --checklists` (+`--self`) | `surface-probe.txt` | timed out at 120 s (`exit=124`, no verdict line) | 124 |

`counter-pins` is green — no patch, no lane edit.

`surface-probe --checklists` produced no verdict in 120 s (46 checklist items incl. probe runs);
this is a timeout, not a red. No lane edit is prescribed on this evidence; re-run longer at close.

### Red items → exact L1 edits (patch files in seat dir, against the archived tree)

1. **Coverage of `corpus/lessons/round-90-verifier-spotcheck.md` (red in both spotcheck-adopt
   and readme-map).** Called `uncovered:` + `unpinned:` because `corpus/README.md` has no row
   for it (precedent rows: `round-89-verifier-spotcheck.md` at `corpus/README.md:265`) and
   `.ufo/pins/readme-map.json` `covered[]` lacks it (precedent: `lessons/round-89-verifier-spotcheck.md`
   and `lessons/round-90.md` both present). Patches:
   - `readme-coverage.patch` — adds one table row after the `round-90.md` row
     (`corpus/README.md`, in `## Coverage map`): 
     ``| `lessons/round-90-verifier-spotcheck.md` | Non-author round-90 verifier spotcheck | Closure artifact; adopted by spotcheck-adopt |``
   - `readme-map-pin.patch` — appends `"lessons/round-90-verifier-spotcheck.md"` to `covered[]`
     in `.ufo/pins/readme-map.json`.
   Equivalence note: `spotcheck-adopt --adopt <target>` performs exactly these two writes via its
   journal. Verified: applying both patches in a scratch copy turns `readme-map` to
   `README_MAP: CLEAN files=231 rows=231 covered=231` (exit 0) and `spotcheck-adopt --check` to
   `SPOTCHECK_COVERAGE: CLEAN spotchecks=57 uncovered=0 / MAP: CLEAN` (exit 0). This is the
   round-90 spotcheck adoption (§6, and the S260/K89-V7/turn-rule follow-ups live in the spotcheck
   file itself, not a coverage item).

2. **Pins and contract references for v5** (preparation, not a current red at the frozen rev —
   the tree is still v4):
   - `scorecard-pin.patch` — `SCORECARD.md:338` `pin.receipt-bind=35f4f25e…` →
     `pin.receipt-bind=<V5-DIGEST-PLACEHOLDER; L1 re-pins after integration>`. Placeholder
     per the seat spec; L1 substitutes the v5 sha256 after integration (the candidate seat
     reports `33ee29eb…` for its build, but the L1 must re-measure the integrated file).
   - `skill-receipt-bind-v5.patch` — `SKILL.md:646` gate row contract
     `kumitate-receipt-bind-v4 (round 90; …)` → `kumitate-receipt-bind-v5 (round 91; v4 round 90, …)`;
     `SKILL.md:763` checklist item `Receipt-subject binding (…, v4 round 90; contract
     kumitate-receipt-bind-v4; …)` → `(…, v5 round 91; contract kumitate-receipt-bind-v5; …)`.
     (Note the checklist text also cites the 76-case selftest and the r90 probe; the L1 should
     update counts/probe pointer for v5 when integrating — the patch changes only the contract
     string, the count update is left to the integrator to avoid guessing the final arm total.)
   - `receipt-bind-v5-contract.patch` — `scripts/receipt-bind.mjs:5` header and `:96`
     `const CONTRACT = 'kumitate-receipt-bind-v4'` → `-v5`. The behavioural edit itself is the
     candidate seat's work; this patch carries only the contract rename.

## 3. Lane files naming `kumitate-receipt-bind-v4` or the v4 sha `35f4f25e…`

Full grep: `grep-v4-refs.txt` (32 hits, incl. frozen history). Live files that must change
for v5 (filtered, `v4-live-refs.txt`): 
- `scripts/receipt-bind.mjs` (header `:5`, `CONTRACT :96`) — the instrument itself.
- `SKILL.md` (gate row `:646`, checklist item `:763`).
- `SCORECARD.md` (`pin.receipt-bind` `:338`; the `## Round 90 — declaration` body at `:4420`
  is a historical round statement — keep as history, do not rewrite).
- `corpus/lessons/round-90.md`, `corpus/lessons/round-90-verifier-spotcheck.md` — frozen round-90
  record; keep (history), the spotcheck's sha measurement stays true.
- Historical/frozen, never edit: `.ufo/waves/round-90/**` (candidate, probe, plan, w1 records,
  dispatch/spec/results JSON), `.ufo/waves/round-91/controls/` (v4-based controls), `LOG.md:3112`
  (round-90 entry records the then-pin).

## Files in seat dir
Receipts: `round-gate-r90.txt`, `round-gate-r91.txt`, `spotcheck-adopt-check.txt`,
`counter-pins.txt`, `readme-map.txt`, `surface-probe.txt`, `grep-v4-refs.txt`, `v4-live-refs.txt`.
Patches: `readme-coverage.patch`, `readme-map-pin.patch`, `skill-receipt-bind-v5.patch`,
`scorecard-pin.patch`, `receipt-bind-v5-contract.patch`. Originals (`*.orig`) kept for diff provenance.
Scratch removed on completion. L1 checks to run at close: `round-gate --round 91` (expect CLEAN
after the five records land), `spotcheck-adopt --check` (expect CLEAN after the two patches),
`readme-map` (expect CLEAN), `counter-pins` (expect CLEAN), `surface-probe --checklists` (full timeout budget).
