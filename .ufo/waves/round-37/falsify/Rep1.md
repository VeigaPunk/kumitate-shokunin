REP1 numbers=25 mismatches=8 verdict=refuted
Scope: round-37 report section 1 "## Work performed" (lines 9–44) of `/home/vgpnk/Projects/shokunin/.ufo/reports/round-37/kumitate.md` (fleet root; 12,321 B, sha256 83112dd2…, mtime 03:32:12). That file changed five times during this audit; lines 9–44 read identically in each version I read. Lane pinned to origin/master `c7648c7` (committed state, read via `git show <rev>:path` and `git archive`). Definitions: numbers = numeric values re-derived (25); pointers = 20 checked separately; mismatches = 4 numeric + 4 pointer/claim failures. Failing condition met, so refuted.

## A. Numbers (25)
Reproduced (17): D1–D8 = 8 dispositions (LOG round-37 lists D1–D8); four notes; one notice per note; 47/47; nonok=1 (asserted by the shift case; selftest passes); C2 = 84; C2_total = 84; 68 seats; roles 40/8/8/8/4; 72,390 B; 19 hunks; 83/92 fixed (true at c7648c7 only); four semantic failures; two README rows.
- `node scripts/claims-check.mjs --selftest` (c7648c7 archive) → `CLAIMS_SELFTEST: 47/47 pass`.
- `python3 -c` over `.ufo/waves/round-37/falsify-spec.json` → 68 items, reviewer 40, mutation-tester 8, critic 8, scout 8, sentinel 4; `falsify-dispatch.json` `taskCall.tasks` = 68; `swarm-registry.json` members = 68.
- `wc -c` → 72390; `grep -c '^@@'` → 19 (sha256 3f51c7e7…, matches repairs.md line 13).
- `grep semantic-fail` on `.ufo/waves/round-36/build/ReviewFidSmallB.md` → `semantic-fail=4`.
- `git show c7648c7:SCORECARD.md` lines 288–289 → `C2=84`, `C2_total=84`; `node scripts/proxy-check.mjs` → `PROXY: MATCH (… C1=19/19 C2=84/84 …)`.
- `git show c7648c7:corpus/README.md` lines 101 and 103 → both rows present.

Not reproduced (4):
- N3 "274" / N4 "29" / N5 "36" / N6 "30" anchor replacements (D1). Measured at c7648c7 with `git diff --numstat 91da27c6 c7648c7 -- <four notes>`: 27/26, 55/54, 26/25, 27/26. Changed anchor tokens (path:N and bare :N, per-hunk multiset; script `/fast/scratch/kumitate-r37/Rep1/dcount.py`): remaining 123, sighting 27, route 25, native 33 = 208. That equals the round-36 shift measured by `0614092→91da27c6` (123/27/25/33), so the reset is an exact inverse. Earlier states give other totals (5ceb8cd 238/28/34/29), and none equals 274/29/36/30. No retained log supports the figures. The restorer they are attributed to is absent from the lane and was replaced by a full base reset (errata 5–6).

## B. Pointers (20)
Resolved (16): base 91da27c6 (ancestor of HEAD); previous 5ceb8cd (parent of 86c0676); pushed (5ceb8cd, 86c0676, 5bc40d0, 469500f all ancestors of origin/master); pin 31c465f1 (= `/fast/scratch/kumitate-r36/src` HEAD; dir mode dr-xr-xr-x); `git diff --stat 0614092 -- <four notes>` runs (c7648c7: 1 insertion per note, 0 deletions); `.ufo/waves/round-37/repairs.md`; `scripts/claims-check.mjs` (line 303 `prev ?? next`, line 360 CLEAN-with-ratchet rule); `falsify-spec.json`; `falsify/` dir; the `.rej` evidence file; fleet `.ufo/watchdog.log` and `.ufo/state/*` (`final/misroot.txt`: M watchdog.log + 14 untracked state files, equal to git status); no ExecFidSmall *.patch in any tree; `corpus/lessons/round-37.md`; `corpus/lessons/round-36-verifier-spotcheck.md` (verdict "REJECTED: an axis is harmed"); `corpus/QUALITY.md` Q16 (line 126–129, requires an independent parser); `corpus/README.md` rows.

Failing (4):
- P2 landed pointer `86c0676c` (header; supports D1, D3, D8). At 86c0676, `git diff --numstat 0614092 86c0676 -- <four notes>` = 11/9, 48/46, 28/26, 12/10 (91 base lines still altered, so D1 "reverted" is false there). `git show 86c0676:SCORECARD.md` line 316 = `floor(10 × 11/11 × 83/92) = 9`, and `## Round 37 correction` count = 0. Those claims hold only at c7648c7 (D1 reset in 5bc40d0; D3 in a5d627b; D8 in 5031720). Errata 1 and 5 concede; the body is not corrected.
- P12 "`cmp` equal" (D6). `repairs.md` (c7648c7, line 13): "`cmp` output not retained (Verify6)". The fleet original was deleted, so the claim cannot be re-derived. Only the sha256 match against the lane copy is checkable.
- P14 slot `granted lane=kumitate wave=r37-falsify seats=68` (D5). `grep -rl "granted lane=kumitate\|seats=68" /home/vgpnk/Projects/shokunin/.ufo` returns only `.ufo/reports/round-37/kumitate.md` (self-reference). No ledger or state record exists.
- P19 notice "naming the spot-check" (D1). `grep -c spot-check` = 0 in all four notes at c7648c7; the notice reads "reset to its 0614092 bytes … amended by AuditSighting2/4".

## C. Adjacent (outside section 1, for the lead)
- Section 2 quotes ratchet `total 186`, `anchors=1551`, `nonok=186`. Committed ratchet is 200 (5bc40d0); gate at c7648c7: `FIDELITY_TOTAL anchors=1574 … nonok=200`, `FIDELITY: CLEAN (notes=20 anchors=1574 src-rev=31c465f15669)`.
- Fleet-root `bash: /home/vgpnk/Projects/shokunin/…` stray tree (2026-10-18, one file) is hidden from git by the fleet `.gitignore` (`*-shokunin/`). The "only driver files" sweep is therefore git-scoped. The tree predates round 37.
- Lane churn: nine commits landed during this audit (86c0676 → a5d627b → 5031720 → fdac52c → 1c281bb → fb5b90e → 5bc40d0 → 469500f → c7648c7).

## D. Recommended repair (not applied)
Strike or correct D1's "274 + 29 + 36 + 30" and "by a deterministic restorer" to the reset facts (base reset; 123/27/25/33 anchor tokens). Correct the notice to name the spot-check. Move the landed pointer to c7648c7 (or cite 5bc40d0 for D1, a5d627b for D3/D8). Replace "`cmp` equal" with the sha256 check.

## E. Verification gaps and environment
- Original fleet `-.rej` deleted; `cmp` not re-runnable. Restorer script not retained.
- Falsify seat outputs not re-judged (out of scope).
- Tool installs: none. Writes: this file and `/fast/scratch/kumitate-r37/Rep1/` only. Lane git commands were read-only (`--no-optional-locks`). One early `jj status` ran without `--ignore-working-copy`; it reported no changes. Early batches ran under a stale `set -e`; every cited result was re-run with `set +e`.
- Node v24.21.0. Gates run on fresh archives: `/fast/scratch/kumitate-r37/Rep1/{t86,tHEAD,tH3,tH4}`.
