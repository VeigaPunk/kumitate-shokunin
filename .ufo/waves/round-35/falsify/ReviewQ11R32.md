ATTACK Q11 retro-admission + round-32 Move-log verdict=partial defects=1

Axes: operability (judged); coverage (round-32 row cross-check).

## Finding — medium: round-32 runtime baseline arithmetic is inconsistent

- `SCORECARD.md:404` records `R 69/98 ⇒ 6`; `LOG.md:1232` says the script and runtime axes were both tied at 6.
- At the prior round-32 scorecard state, `coverage:runtime-layer` declares `C1r/C1r_total = 11/11`, `R_sections=69`, and `R_members=98` (`git show 5d250b4^:SCORECARD.md`, runtime axis row, line 309). That formula evaluates to `floor(10 × 11/11 × 69/98) = floor(7.04…) = 7`, not 6. The stored score cell is 6, so the prior scorecard's own score and derivation disagree; the appended Move-log row repeats the 6 without resolving it. The post-round values do check out: `S=91/91 ⇒ 10`, `R=75/92 ⇒ 8`, as recorded in the 5d250b4 stanza and round-32 log.
- Reproduction:
  ```text
  $ git -C /home/vgpnk/Projects/shokunin/kumitate-shokunin show 5d250b4^:SCORECARD.md | grep -E '^\\| coverage:runtime-layer \\|'
  | coverage:runtime-layer | 6 | `floor(10 × 11/11 × 69/98)` = `floor(7.04…)` = 7 …
  $ git -C /home/vgpnk/Projects/shokunin/kumitate-shokunin show 5d250b4:SCORECARD.md | grep -E '^\\| coverage:runtime-layer \\|'
  | coverage:runtime-layer | 8 | `floor(10 × 11/11 × 69/98)` = `floor(7.04…)` = 7 …
  ```
- Minimal fix: reconcile the pre-round runtime coverage factor/measurement with the formula. If 11/11 and 69/98 are the actual inputs, correct the prior score and the Move-log/LOG baseline to 7; if score 6 is intended, record the actual factor/inputs that yield it and correct the formula. Keep the tied-at-6 claim only if both prior axis scores are supported.

## Verified

- Exact q11 reruns (the q11 lane/source trees byte-compare with `git archive 16a5441` and `git archive 964f443e`, respectively; `diff -qr` reported 0 differing paths for both comparisons):
  - `node scripts/claims-check.mjs --src /fast/scratch/kumitate-r35/q11/src964 --row R3 --row R4 --row R6 --strict` → `CLAIMS: MATCH (rows=3 yes=3 notes=3 sections=15 adv=0)`, exit 0; R3/R4/R6 sections = 5/6/4.
  - `node scripts/proxy-check.mjs --src /fast/scratch/kumitate-r35/q11/src964` → the quoted `PROXY: DRIFT` with only `K_MEMBERS_DRIFT` (49→50), `COVERAGE_KIMI_DRIFT` (10→9), and `AXES_DRIFT` findings, exit 1. The current live K root has six `skills/` children, including `cursor-lane` (stat timestamp 2026-10-18); the candidate's K note does not name that member. Round-34's scorecard records the added section and 49/50→50/50 correction. This supports the Q11 entry's explanation; no `mcp.json` content was read.
- The round-32 row's post counts and scores agree with `5d250b4:SCORECARD.md`'s final stanza and the round-32 LOG measurements (`S_members 114→91`, `S_sections 74→91`, `R_members 98→92`, `R_sections 69→75`, coverage 6→10 and 6→8). `c64b380` is the LOG-entry commit following `5d250b4`; the fleet report `.ufo/reports/round-32/kumitate.md` exists and carries the same before/after counts.
- `node scripts/round-gate.mjs --round 32` from the current lane → `ROUND_GATE: CLEAN (round=32 lane=kumitate checks=10 errors=0 warnings=0)`, exit 0. On an isolated 16a5441 checkout with the fleet report supplied, the pre-rider state yielded exactly `SCORECARD_ROW_MISSING` and `LOG_ENTRY_MISSING` (2 errors), confirming the stated transition to CLEAN after the round-35 row/bullet.

## Residual risk and verification gaps

- The round-32 pre-runtime score remains unresolved as above; round-gate checks record presence, not score arithmetic.
- Historical proxy output at 5d250b4 was not rerun against its then-live K root. Current q11 proxy rerun is reproducible, but the host K substrate has since changed.
- No LSP device/status endpoint was available in this session, so references/definition/diagnostics could not be requested. Shell output was used only for literal line/output verification, not as semantic proof.
