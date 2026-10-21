MISTAKES rows=3

# ScribeLessonMistakes — round-35 lesson candidates

Scope: candidate `## Mistakes` rows for `corpus/lessons/round-35.md`, format of `corpus/lessons/round-34.md:9-24`. The lesson was not edited. Lane base `1770305fae20826b39905a8251ddeca6b4957ac4`; pinned upstream `31c465f15669f744848bd9f5d56191c5085670f7` (`.ufo/waves/round-35/baseline/proxy.txt:2`). All pointers are repo-relative (Q14), read from the working tree on 2026-10-20.

## Candidate rows

| class | evidence pointer | captured-by | fix |
|---|---|---|---|
| Pre-registered baseline frozen against a tree that then moved | `SCORECARD.md:452` (`live trees unchanged (S 91/91, R 83/92)`); `SCORECARD.md:284-285` (stanza `S_members=91`, `S_sections=91`); `.ufo/waves/round-35/baseline/proxy.txt:4-5` (`S_MEMBERS_DRIFT … computed=88`; `S_SECTIONS_DRIFT … computed=86`) | Q13 | Restate the baseline at the pinned revision (S 86/88; `coverage_script` floor 9, `proxy.txt:6`) and make the pre-registration's check run with the pin. Fails today: `node scripts/proxy-check.mjs --src /fast/scratch/kumitate-r35/src` → exit 1 (`proxy.txt:11`) against the text "S 91/91". It passes only when the stanza and `## Planned` state the values that command prints. The R half is not falsified by this run (no `R_*` line in `proxy.txt`). |
| Prose asserts a checklist result the gate reports as failing | `SCORECARD.md:47-48` (`All eleven are *executed* … CHECKLIST: 10/10 pass`); `SCORECARD.md:279` (stanza `C=13`); `SKILL.md:618-630` (13 `- [ ]` items); `.ufo/waves/round-35/baseline/checklists.txt:17-19` (`CHECKLIST: 9/13 pass`, `VERDICT: FAIL`, `exit=1`); failing items `checklists.txt:5,10,12,13` (= `SKILL.md:620,625,627,628`) | Q3 | Quote the machine line verbatim with its date (`CHECKLIST: 9/13 pass`); score the C term on passes, not items (`C=13` counts items only). Fails today: `node scripts/surface-probe.mjs --checklists` → exit 1 with `CHECKLIST: 9/13 pass`, which refutes any prose line reading `10/10 pass`. The prose passes only once the four failing items pass or the prose reports 9/13 FAIL. |
| Checklist verdict follows the operator's moving origin tree (no `--src` pin) | `SKILL.md:625` (`node scripts/proxy-check.mjs`, bare) and `SKILL.md:627` (`node scripts/claims-check.mjs`, bare); `scripts/surface-probe.mjs:857-859` (items run via `bash -c` with inherited env, no `--src`); `scripts/proxy-check.mjs:262-265` (`SRC_CANDIDATES` = `~/Projects/ufo-fsd-alpha`, then `origin-work`), `:273-276` (`UFO_SRC` wins); same candidate list at `scripts/claims-check.mjs:78-80`; observed `.ufo/waves/round-35/baseline/surface.txt:4` (`src=/home/vgpnk/Projects/ufo-fsd-alpha`) vs `proxy.txt:2` (`src=31c465f1` with `--src`) | Q8 | Pin the origin revision in the checklist commands (`--src` to the recorded tree) and print the `src=` line beside each derived verdict. Fails today: `UFO_SRC=/nonexistent/origin node scripts/proxy-check.mjs` → `PROXY: FAIL-CLOSED (SRC_NOT_A_DIR)`, exit 2 (run in this round, output below). After the fix, the pinned form must print the same verdict under the poisoned env: `UFO_SRC=/nonexistent/origin node scripts/proxy-check.mjs --src /fast/scratch/kumitate-r35/src` → `src=31c465f1`, exit 1 (as `proxy.txt`). |

## Verification performed

Pointer checks (tool reads/greps, 2026-10-20):
- `SCORECARD.md:452` contains `live trees unchanged (S 91/91, R 83/92)` under `## Planned` (`SCORECARD.md:435`).
- `SCORECARD.md:47-48` contains `All eleven are *executed*` and `CHECKLIST: 10/10 pass`.
- `SKILL.md:618-630`: exactly 13 `- [ ]` lines.
- `baseline/checklists.txt:17-19` and `baseline/proxy.txt:4-5,11` quoted above.
- `scripts/surface-probe.mjs:857-859`: `spawnSync('bash', ['-c', item.command], { cwd: opts.self, ... })`, no `env` override, no `--src`.
- `corpus/QUALITY.md` ids used: Q3 (line 23), Q8 (line 45), Q13 (line 70). All exist.

Command run (read-only; no origin tree touched):

```
$ UFO_SRC=/nonexistent/origin node scripts/proxy-check.mjs; echo "exit=$?"
proxy-check: fail-closed — SRC_NOT_A_DIR: --src /nonexistent/origin is absent
PROXY: FAIL-CLOSED (SRC_NOT_A_DIR) --src /nonexistent/origin is absent
exit=2
```

Not run: any command against `/home/vgpnk/Projects/ufo-fsd-alpha`. Its use as a bare-run source is taken from `baseline/surface.txt:4`, not re-observed here.

## Findings

- F1 (row 1) confirmed. The pre-registered S claim is contradicted at the pinned revision (S_members 88 ≠ 91; S_sections 86 ≠ 91). The R claim is not contradicted by this run.
- F2 (row 2) confirmed. The prose and the stanza describe different things: `C=13` counts checklist lines, while the prose presents the list as all executed and passing (`10/10`). The live run is `9/13`, `VERDICT: FAIL`.
- F3 (row 3) confirmed. Bare runs of the checklist resolve the origin through `UFO_SRC` or the `~/Projects` candidates; the same round's baseline recorded a different tree for the bare and pinned runs (`surface.txt:4` vs `proxy.txt:2`). Whether checklist items 625 and 627 fail *because* of that tree is [INFERENCE]: their failure output is in `checklists.txt:10,12` but was not re-run against a pinned tree.

## Out of scope / not done

- The lesson file was not edited; these are candidates only. No fix was applied to any script or to SKILL/SCORECARD.
- No tools installed or upgraded; no package transactions; no git or jj mutation; no subagents spawned.
- Node was already present (`proxy-selftest.txt` header records node v24.21.0). Nothing else installed.
