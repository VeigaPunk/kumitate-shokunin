AUDIT Remainder4 anchors=23 false=18 overreverted=0 notice=bad verdict=refuted

# Scope
- Audited: round-37 restoration as delivered, `corpus/knowledge/remaining-scripts-census.md` @ `5ceb8cd` (the repair tree at dispatch; my snapshot is byte-identical to `git show 5ceb8cd:…`).
- Base B = `0614092`; round-36 R = `3d5760a`; pin = `/fast/scratch/kumitate-r36/src` @ `31c465f15669f744848bd9f5d56191c5085670f7` (HEAD verified, read-only, not written).
- Changed anchors: 185 positions whose effective `path:line-range` differs from B (a bare `:N` inherits its paragraph's path), ordered by base line then position. Group 4/8 = indices 70–92, base lines 591–623. Delivered line = base line + 2.
- Reproduce: `python3 /fast/scratch/kumitate-r37/AuditRemainder4/audit_group4.py` (full output: `/fast/scratch/kumitate-r37/AuditRemainder4/group4.final.out`).
- Cross-check, raw-text partition (N=138): group 4 = 18 anchors at base lines 595–611, all inside the 23 above; 14 false, 4 drift, 0 overreverted. Same verdict.

# State drift (read first)
- The note changed during this audit. Commits after `5ceb8cd`: `5bc40d0` reset the note to 0614092 bytes plus a notice (ratchet 78→70 for this note); `c589b38` (HEAD now) changed the notice attribution.
- `git diff --stat 0614092 -- corpus/knowledge/remaining-scripts-census.md` now prints `1 file changed, 1 insertion(+)` (line 2). I did not edit the note.
- Findings below are for `5ceb8cd`. Section "Current tree" covers HEAD.

# Table (B = base, R = round-36, D = delivered 5ceb8cd; Y/N = sentence's symbol on that line of the judged file)
Legend: FALSE-r37 = round 37 changed an unshifted, true anchor; FALSE-R36kept = round-36 shift not reverted (D = R); FALSE-third = D is neither base nor R; FALSE-file = wrong file; drift = true but not base.
```
[70]  B591 k13  process.exitCode       prepare-ephemeral-l1.mjs  B 960 Y  R 960 Y  D 45 N (PATH_VARIABLES)     FALSE-r37
[71]  B595 k6   readBoundedFile        project-devin-subagents   B 29 Y   R 29 Y   D 19 N (`*/`)                  FALSE-r37
[72]  B595 k7   MAX_REPO_FILE_BYTES    project-devin-subagents   B 84 Y   R 84 Y   D 247 N (card-missing throw)   FALSE-r37
[73]  B595 k8   readBoundedFile        project-devin-subagents   B 114 Y  R 114 Y D 247 N                         FALSE-r37
[74]  B595 k9   readBoundedFile        project-devin-subagents   B 251 Y  R 251 Y D 247 N                         FALSE-r37
[75]  B595 k10  readBoundedFile        project-devin-subagents   B 306 Y  R 306 Y D 247 N                         FALSE-r37
[76]  B595 k13  checkOnly              project-devin-subagents   B 98 Y   R 98 Y   D 336 Y (`!checkOnly`)         drift
[77]  B595 k14  --check                project-devin-subagents   B 93 Y   R 93 Y   D 336 N                         FALSE-r37
[78]  B599 k1   seatsDigest            render-seat-tables        B 31 Y   R 31 Y   D 54 N (BEGIN,)                FALSE-r37
[79]  B607 k0   no CLI                 sync-global-routing       B 14-16 Y R 41 N D 41 N (MIRROR_PATH)           FALSE-R36kept
[80]  B607 k4   buildSeatRoutingMirror sync-global-routing       B 211 Y  R 211 Y D 209-214 Y (hit 211)          drift (range widened)
[81]  B607 k5   writeFileAtomic        sync-ufo-contracts        B 635 Y  R 635 Y D :19 Y (import line)          drift
[82]  B607 k10  parseRoute             omp-route-grammar         B 88 Y   R 88 Y   D 104-108 N (function body)    FALSE-r37
[83]  B611 k0   CONTRACTS_USAGE        sync-ufo-contracts        B 22-26 Y R 22-26 Y D 32-36 N                   FALSE-r37
[84]  B611 k1   argv (guard)           sync-ufo-contracts        B 32-37 Y R 32-37 Y D 32-36 Y (hit 32)          drift
[85]  B611 k4   validationErrors       sync-ufo-contracts        B 2106 Y R 2106 Y D 2137 N                      FALSE-r37
[86]  B611 k5   validationErrors       sync-ufo-contracts        B 2132 Y R 2132 Y D 2137 N                      FALSE-r37
[87]  B611 k11  validateTickMachineConfig sync-ufo-contracts     B 18 Y   R 1225 N D 183-185 N            FALSE-third (R shift not reverted)
[88]  B611 k12  fixtureLaneRoles       sync-ufo-contracts        B 1225 Y R 1225 Y D 2136 N                      FALSE-r37
[89]  B615 k4   requireExactKeys       the-tick-config           B 152 Y  R 152 Y  D 214-221 N                   FALSE-r37
[90]  B615 k5   endpoint (loopback)    the-tick-config           B 210-212 Y R 210-212 Y D 214-221 N             FALSE-r37
[91]  B619 k6   FORMAT_CHARS_RE        ufo-credential-screen     B 61 Y   R 61 Y   D 65-68 Y (hit 65)            drift
[92]  B623 k0   main                   ufo-drills                B 1561 Y R 1561 Y D ufo-watchdog-repend.mjs:366 (homonym main) FALSE-file
```
Evidence for the 611 rows: `git show 0614092:corpus/knowledge/remaining-scripts-census.md | sed -n 611p` shows `validateTickMachineConfig` (`:18`) and `fixtureLaneRoles` … at `:1225`; `git show 5ceb8cd:…| sed -n 613p` shows `validateTickMachineConfig` (`:183-185`) and `fixtureLaneRoles` … at `:2136`. Pinned `sed -n '18p;183,185p;1225p;2136p' /fast/scratch/kumitate-r36/src/scripts/sync-ufo-contracts.mjs` gives `import { validateTickMachineConfig } …` / `grok: {`, `skillDirectory…`, `scopeTag…` / `const fixtureLaneRoles = new Set([` / `console.log(JSON.stringify(report, null, 2));`.

# Findings
1. Restored-but-still-false: 18 — [70]–[75], [77], [78], [79], [82], [83], [85]–[90], [92]. 16 of them are anchors round 36 did not touch (R = B, true) that round 37 made false. [79] and [87] are round-36 shifts that round 37 did not revert to base. [92] is false by file: the sentence names `ufo-drills.mjs`, while D points at `ufo-watchdog-repend.mjs:366`, which has a homonym `main`. A symbol-only check passes it; the file-aware check does not.
2. Overreverted (true improvement reverted to a false base line): 0. All 23 base lines carry their symbol (B = Y, 23/23), so the slice has no base-absent case.
3. Drift (true, not base; D1 says keep base wherever the symbol remains): [76], [80], [81], [84], [91]. [81] is true only under the file the same sentence names (`sync-ufo-contracts.mjs`). A paragraph-carry reader resolves it to `sync-global-routing.mjs:19`, which is false.

# Notice (5ceb8cd line 2)
- Present, not accurate. Text: "Anchors in this note were reverted to the lines their 0614092 sentences named, because the round-36 shift-repair moved them one symbol off (spot-check D1). … treat line anchors here as at their base revision until then."
- Scope claim is false. Of 521 anchor positions, 185 differ from 0614092. 153 of those were never moved by round 36 (R = B). Of the 163 round-36 moves, 131 were restored, 6 kept the round-36 value, and 26 went to a third value.
- The "spot-check D1" reference exists (`corpus/lessons/round-36-verifier-spotcheck.md:193`). D1 requires keeping the base line wherever the symbol is still on it; this slice violates that in 16 + 5 + 2 anchors.
- `.ufo/waves/round-37/repairs.md:3` ("every symbol-keyed anchor … reverted to its 0614092 sentence line") is contradicted by the same counts.

# Current tree (HEAD c589b38)
- Notice present, line 2: "Round-37 restoration (2026-10-21; final, amended by AuditRemainder1/2/7). This note is reset to its 0614092 bytes…"
- Accurate on what I could check:
  - "reset to its 0614092 bytes": body identical to base once line 2 is removed.
  - "no anchor here is a round-36 artifact": follows from body identity. `git merge-base --is-ancestor 0614092 3d5760a` succeeds, so base predates round 36.
  - "re-verification owed": honest.
  - "ratcheted fidelity debt": `.ufo/pins/fidelity-ratchet.json` carries `remaining-scripts-census.md: 70`. I did not re-measure 70; that is whole-note work outside this slice, so it is unverified.
- Slice under the current tree: 0 changed anchors; 23/23 base values true at the pin. Restored-but-false in this slice = 0.
- The attribution "amended by AuditRemainder1/2/7" is not something I checked. I did not amend the note.

# Verification gaps and notes
- Sentence-symbol judgements are mine, encoded in `SPEC` in `audit_group4.py`; change one there and re-run.
- Positional comparison relies on identical line and anchor counts across B, R, and D; the script asserts this (762 lines).
- Not run: lane gates and claims-check (read-only audit; no lane writes). Whole-note base-debt (70) is unmeasured.
- Tooling: no installs or updates. Used existing `git` and `python3`.
- For the main agent: any further change to this note needs re-running `audit_group4.py` against the new HEAD. Closing the notice's debt claim needs a whole-note base truth measure, which I did not do.
