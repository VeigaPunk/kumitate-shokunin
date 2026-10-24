# ScribeScorecardAudit — evidence manifest (kumitate round 57)

Seat: ScribeScorecardAudit (scribe). Item: audit SCORECARD.md round-57 surfaces.
Date: 2026-10-24. Lane HEAD at audit: `8c6f5b017d149b18134917378cdbed3b492d8e89`
("round-57: idempotence at bookkeeping tip c42afe1c — A57 10/10, D57 5/5").
Measured rev R1 `f0dc6d1160e66af65355bd353665adac22bbf4a9`; base
`7178bfd3643c0fac74c8eb637cd6e985faadd0cf` (all from scorecard/plan text).

## Audited file identity

- working tree `SCORECARD.md` sha256 = `5a0cb8f780961c3bf1a86ad50cbf3049d0a769ff7f7b765a1b383f62ce891004`
- `git show HEAD:SCORECARD.md` sha256 = same ⇒ working tree == HEAD bytes.
- `git show f0dc6d11…:SCORECARD.md` sha256 = `87d1ee6015aacfb3af6ce5b1b2a4690a6b136dca7dd30a2a29de79030fe5ed00`
  (differs; diff = R1PENDING→f0dc6d11 fill-ins only, see `scorecard-r1-to-head.diff`, 24 lines).

## Five audit points — locations

1. `readme-map` capability row — SCORECARD.md line 1774 in `## Capabilities`
   (header `| Capability | …` line 1757); row names contract `kumitate-readme-map-v1`,
   verdicts `README_MAP: CLEAN files=135 rows=135 covered=135`, selftest 14/14,
   `| 57 |` first-working round. Present at R1 (same line no.).
2. `## Round 57 — claims, routed-defect answers, limits (2026-10-24)` — lines 2676–2717
   (last section of file, file is 2717 lines). Names base/R1 revs, predicates,
   before/after receipts, terms A=87→90 C=26→27, C2=135, routed-defect answers R56-V1/V2/V3.
3. Move-log rows — lines 449 (C1 readme-map) and 450 (C2 worker-heartbeat-liveness)
   in `## Move log` table (header line 437). Before-column quotes
   `ATTEST57_UNMET held=0/10` / `DOCTRINE57_UNMET held=2/5` at base; after-column
   `ATTEST57_HELD held=10/10` / `DOCTRINE57_HELD held=5/5` at R1 f0dc6d11.
4. Stanza terms — `<!-- kumitate-proxy-v1` block lines 287–311: `A=90` (288),
   `C=27` (289), `C2=135` (292), `C2_total=135` (293). Same lines at R1.
5. `pin.readme-map` — line 326, inside `<!-- kumitate-gate-pins-v1` block
   (lines 312–327), last pin before `-->`. Not in the v1 stanza (correct: v1 keeps
   its six pins; readme-map is a gate-pins key). Same line at R1.

## Independent recomputation (transcript: recompute-transcript.txt)

Extraction method identical to attest57-probe: `git archive <rev> | tar -x`.

| rev | A (find *.mjs/*.js/*.sh/*.py − .git) | C (`grep -c '^\s*- \[' SKILL.md`) | C2 rows (`grep -c '^| \`\(knowledge\|lessons\)/' corpus/README.md`) | C2 files (`find corpus/knowledge corpus/lessons -name '*.md'`) |
|---|---|---|---|---|
| base 7178bfd3 | 87 | 26 | 132 | 133 |
| R1 f0dc6d11 | 90 | 27 | 135 | 135 |
| HEAD 8c6f5b0 | 90 | 27 | 135 | 135 |

Base reads A=87, C=26 exactly as move-log before-column; base C2 rows=132 vs
files=133 reproduces the R56-V3 drift quoted (`C2_TOTAL_DRIFT declared=132 computed=133`).

## Gate executions at HEAD extraction (cwd = tree-8c6f5b0…, UFO_SRC=/home/vgpnk/Projects/ufo-fsd-alpha)

- `node scripts/readme-map.mjs` → `README_MAP: CLEAN files=135 rows=135 covered=135`, exit 0.
- `node scripts/readme-map.mjs --selftest` → `README_MAP_SELFTEST: PASS (14/14)` `VERDICT: PASS`, exit 0.
- `node scripts/proxy-check.mjs --strict` → `PROXY: MATCH (A=90 C=27 operability=9; C1=19/19 C2=135/135 coverage=10; S=88/88 …; R=92/92 …; K=53/53 …; pins=6 match; src-rev=31c465f15669)`, exit 0.

## Pin corroboration

- `sha256sum scripts/readme-map.mjs` (working tree) = `058e5033…88b8812c7727`
- `git show HEAD:scripts/readme-map.mjs | sha256sum` = same
- `git show f0dc6d11…:scripts/readme-map.mjs | sha256sum` = same
- scorecard line 326 `pin.readme-map=` = same ⇒ B6 pin equality holds at both revs.
- `.ufo/pins/counter-pins.json` lines 83–87: `{"round":57,"name":"readme-map","path":"scripts/readme-map.mjs","sha256":"058e5033…"}` — registry agrees.

## Receipt corroboration (scorecard quotes vs committed artifacts)

| scorecard claim | artifact read | observed |
|---|---|---|
| `ATTEST57_UNMET held=0/10` at base | `base/attest57-base.txt` | `ATTEST57_UNMET held=0/10 checks=10 rev=7178bfd3…` ✔ |
| `DOCTRINE57_UNMET held=2/5` at base | `base/doctrine57-base.txt` | `DOCTRINE57_UNMET held=2/5 checks=5 rev=7178bfd3…` ✔ |
| `ATTEST57_HELD held=10/10` at R1 | `close/FINAL-attest57-R1.txt` | `held=10/10 checks=10 rev=f0dc6d11…` ✔ |
| `DOCTRINE57_HELD held=5/5` at R1 | `close/FINAL-doctrine57-R1.txt` | `held=5/5 checks=5 rev=f0dc6d11…` ✔ |
| witness `held=10/10` | `witness/scratch-held-attest.txt` | `held=10/10 rev=1cd6d667…` ✔ |
| witness `held=5/5` | `witness/scratch-held-doctrine.txt` | `held=5/5 rev=1cd6d667…` ✔ |

Base receipt detail (not in scorecard but consistent): B6 MISS shows
`AXES_DRIFT coverage declared=10 computed=9` — the retired coverage integer
correctly recomputes to 9 while C2 was 132/133.

## R1→HEAD scorecard diff (scorecard-r1-to-head.diff)

24 lines: `R1PENDING` → `f0dc6d1160e66af65355bd353665adac22bbf4a9` at three sites
(two move-log rows, one section header). All five audit surfaces already present
at R1 with the placeholder; HEAD replaces the placeholder with the true rev.
`grep R1PENDING` at HEAD: no matches.

## Consistency notes (no defect)

- `## Axes` operability row (line 334) still carries round-42 figures A=10/C=19
  ⇒ 29/32 ≈ 0.906 ⇒ 9. The machine-checkable surface is the integer only
  (proxy `AXES_DRIFT` compares score, not inline prose); stanza A=90/C=27
  independently computes floor(10·117/120)=9 — same integer. Established
  frozen-prose convention. [INFERENCE on the convention rationale]
- `grep R1PENDING` clean; `pin.readme-map` absent from `kumitate-proxy-v1`
  stanza by design (23-key parent-frozen set untouched; pins=6 match confirmed).

## Artifacts (all under this seat's build dir)

- `recompute.sh` — the exact commands run.
- `recompute-transcript.txt` — full stdout of the run.
- `scorecard-r1-to-head.diff` — `git diff f0dc6d11 8c6f5b0 -- SCORECARD.md`.
- `tree-7178bfd3…`, `tree-f0dc6d11…`, `tree-8c6f5b0…` — extraction scratch trees.

No tools installed (none needed; pacman pause honored). No lane writes outside
this build dir; no commits, no jj/git mutations in the lane.
