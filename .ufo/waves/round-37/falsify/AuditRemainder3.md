AUDIT Remainder3 anchors=18 false=18 overreverted=2 notice=bad verdict=refuted

Scope: `corpus/knowledge/remaining-scripts-census.md` at restoration commit `5ceb8cd` (`git diff --stat 0614092 5ceb8cd -- <F>` → `94 lines (48+/46-)`). Pin `/fast/scratch/kumitate-r36/src` = `31c465f15669f744848bd9f5d56191c5085670f7` (`git rev-parse HEAD`).

## Method
- Anchor universe: every backticked `path:line` or bare `:line` token. Counts 0614092=521, 3d5760a=521, 5ceb8cd=521. Prose with anchors and backticks removed is identical across the three versions except the notice line, so index alignment is exact.
- Changed = resolved (file, line-spec) differs from 0614092: 138. Eighth = ceil(138/8)=18; 3rd eighth = changed[36:54) in note order (token idx 171–234).
- Governing symbol = the name the sentence attaches to that anchor, read from the sentence text. strict = symbol on the restored line of the sentence's own module. literal = symbol string on that line in any file.
- Pin lines confirmed with the read tool, e.g. `local-helper.mjs:131` = `if (size === 0) fail("input_invalid", …)`, `:135` = `async function readInput(file) {`, `:157` = `fail("endpoint_invalid", …)`, `:165` = `}`, `:325-327` = endpoint/performance/readInput lines.
- Other commands: `git log --oneline 5ceb8cd..HEAD -- F` → `c589b38`, `5bc40d0`; `git diff --stat 0614092 HEAD -- F` → `1 insertion(+)`.

## Eighth 3/8: 18 restored anchors
n | idx | module | sentence's symbol | 0614092 | 3d5760a | 5ceb8cd | base | restored | class → D1 value
1 | 171 | lean-cargo/measure.sh | `du -sh` (evidence block) | :95 | :95 | :66 | T | F | regressed → :95
2 | 173 | local-helper.mjs | `main` | :316 | :316 | ufo-watchdog-repend.mjs:366 | T | F (literal T, other module) | regressed → :316
3 | 177 | local-helper.mjs | `endpoint_invalid` | :165 | :157 | :325-327 | F | F | OVERREVERTED → :157
4 | 182 | local-helper.mjs | `input_invalid` (empty input) | :135 | :131 | :146 | F | F | OVERREVERTED → :131
5 | 189 | local-helper.mjs | `ufo-local-helper-error-v1` | :356 | :356 | :360 | T | F | regressed → :356
6 | 202 | omp-role-work.mjs | `seatId` (import) | :21 | :21 | :40 | T | F | regressed → :21
7 | 206 | omp-route-grammar.mjs | `parseRoute` | :88 | :25 | :104-108 | T | F | regressed → :88
8 | 209 | prepare-ephemeral-fleet.mjs | `composeEphemeralFleet` | :191 | :191 | prepare-ephemeral-fleet.test.mjs:15 | T | F (literal T, test import) | regressed → :191
9 | 214 | prepare-ephemeral-l1.mjs | `main` | :912 | :912 | ufo-watchdog-repend.mjs:366 | T | F (literal T, other module) | regressed → :912
10 | 215 | prepare-ephemeral-l1.mjs | usage-error throw | :917 | :29 | ufo-watchdog-repend.mjs:366 | T | F | regressed → :917
11 | 219 | prepare-ephemeral-l1.mjs | `readValidatedMarker` | :756 | :756 | :760 (body line) | T | F | regressed → :756
12 | 221 | prepare-ephemeral-l1.mjs | force path (`force`) | :814-887 | :814-887 | :760 | T | F | regressed → :814-887
13 | 222 | prepare-ephemeral-l1.mjs | `readPolicy` | :92 | :92 | :16 | T | F | regressed → :92
14 | 224 | prepare-ephemeral-l1.mjs | refusal emit `{error:…}` | :959 | :959 | :45 | T | F | regressed → :959
15 | 225 | prepare-ephemeral-l1.mjs | CLI exit 2 (`exitCode`) | :960 | :960 | :45 | T | F | regressed → :960
16 | 232 | project-devin-subagents.mjs | `readBoundedFile` (import) | :29 | :29 | :19 | T | F | regressed → :29
17 | 233 | project-devin-subagents.mjs | `MAX_REPO_FILE_BYTES` | :84 | :84 | :247 | T | F | regressed → :84
18 | 234 | project-devin-subagents.mjs | `readBoundedFile(` call site | :114 | :114 | :247 | T | F | regressed → :114

## Findings
1. Restored but still false: 18/18 under strict; 15/18 under literal. Rows 2, 8, 9 match only because the symbol string appears in another module: `scripts/ufo-watchdog-repend.mjs:366` is `export function main(argv = …)` and `scripts/prepare-ephemeral-fleet.test.mjs:15` is an import line.
2. Overreverted true improvements: 2 (rows 3, 4). In both, the 0614092 line lacks the symbol and the 3d5760a line carried it correctly. 5ceb8cd discarded the correct line for one without the symbol. Row 4's restored `:146` equals the base value of the next anchor token (idx 183); row 3's restored `:325-327` equals the base value of idx 178.
3. Regressions: 16 rows where base was true and the restored value is not. Rule D1 (`corpus/lessons/round-36-verifier-spotcheck.md:193-196`: "keep the base line wherever its symbol is still on that line") keeps all 16 at base. Rows 3–4 take their symbol's pin line, which is the 3d5760a value. The restoration matches the D1-correct value on 0/18 rows.
4. Global provenance over the 138 changed anchors: 54 restored values equal the base value of the next anchor token, 6 equal the previous one, 60 equal another base token, 18 match no base token. 117 of the 138 are tokens round-36 never touched (3d5760a equals 0614092). [INFERENCE] The restoration assigned base values by token position with an off-by-one rather than by symbol. Round-36 moved 163 tokens; 5ceb8cd returns 142 of them to base, keeps 6 at the shifted value, and gives 15 a third value.
5. Notice at 5ceb8cd line 2 is bad:
   - "Anchors in this note were reverted to the lines their 0614092 sentences named": false. 138 of 521 tokens differ from 0614092, and 0 of the 18 in this eighth sit at their base line.
   - "treat line anchors here as at their base revision until then": misleading for the same reason.
   - Undisclosed scope: about 12 non-anchor code spans lost their backticks (`--force`, `{error: message}`, `touched=unknown`, `usageError`, `grokWeb.bin`, and others).
   - The D1 attribution is real (lesson lines 193-196).
6. Superseded at HEAD: `5bc40d0` ("reset four notes to 0614092 bytes") and `c589b38` replaced this restoration. The HEAD diff against 0614092 is one notice line, which matches the tree and is scope-accurate. Its attribution to AuditRemainder1/2/7 is only checked for file existence. The 5ceb8cd notice is still quoted as current in `.ufo/waves/round-37/falsify/AuditNativeTrial1.md:31`.

## Verification gaps
- Only the 3rd eighth was audited. Seven other eighths were not checked.
- Row 11: line 760 is inside `readValidatedMarker`'s body (declared 756). Counted false under strict.
- Row 12: the literal `--force` does not appear in `prepare-ephemeral-l1.mjs`. The referent was taken as `force`. The restored 760 fails under any reading.
- Row 14: the literal `{error: message}` does not appear on 959. The referent is the JSON emission line. The restored 45 fails under any reading.
- The HEAD notice's "ratcheted fidelity debt" claim was not evaluated.
- No installs or package transactions. Writes: this report and `/fast/scratch/kumitate-r37/AuditRemainder3/{changed.json,eighth.json}`.
