RESULT ReopenS080 rev=269dadb6 verdict=HOLDS row=S080 supersedes-S003-correct quote-verbatim-7w teaches-clauses-supported tier/kind/scope/anchor-valid

Evidence (lane repo /home/vgpnk/Projects/shokunin/kumitate-shokunin; C1 commit 269dadb6a56744531bd1201e5944185e96ff6a4c):

1. S080 row at rev 269dadb6 (`git show 269dadb6:corpus/SOURCES.md | grep -n '^| S080 |'` → line 93):
   `| S080 | oh-my-pi docs/task-agent-discovery.md — https://github.com/can1357/oh-my-pi/blob/0b5c27ab24719c86a5986b95ee55f4e75bc1aaa0/docs/task-agent-discovery.md | docs | A | OMP task-agent discovery precedence on main | docs/task-agent-discovery.md § Merge and collision rules; main 0b5c27ab24719c86a5986b95ee55f4e75bc1aaa0; body sha256 6739e902386ee06ff068a8b2c97e36aa0d4086d28b45643efc837c3dbbbe3c81 | supersedes S003 — Task-agent discovery precedence and first-wins by exact name | mined | 2026-10-23 | on-release | corpus/knowledge/omp-task-contract.md |`

2. Source fetch (ordinary means; curl): `curl -sS -L -o task-agent-discovery.md -w 'HTTP %{http_code} %{url_effective}\n' 'https://raw.githubusercontent.com/can1357/oh-my-pi/0b5c27ab24719c86a5986b95ee55f4e75bc1aaa0/docs/task-agent-discovery.md'` → `HTTP 200 https://raw.githubusercontent.com/can1357/oh-my-pi/0b5c27ab24719c86a5986b95ee55f4e75bc1aaa0/docs/task-agent-discovery.md`; `sha256sum task-agent-discovery.md` → `6739e902386ee06ff068a8b2c97e36aa0d4086d28b45643efc837c3dbbbe3c81` (matches row cell; 26340 bytes, 341 lines).

3. Quote verbatim at stated locator: `grep -n 'Merge and collision' task-agent-discovery.md` → `166:## Merge and collision rules`; `sed -n '168p' task-agent-discovery.md` → `Discovery uses first-wins dedup by exact `agent.name`:` — first sentence of the section. `printf '%s' 'Discovery uses first-wins dedup by exact `agent.name`:' | wc -w` → `7` (≤25). `sha256sum` of fetched body given above.

4. `supersedes S003 —` names the right target and the correction is supported by the bytes:
   - S003 at 2b2bf7bb (`git show 2b2bf7bb:corpus/SOURCES.md | grep '^| S003 |'`): teaches `Task-agent discovery precedence, first-wins by exact name, and recursive filesystem roots`; URL pins `main` (81fa40e, 2026-10-19).
   - S003 at rev 269dadb6 is byte-identical to the 2b2bf7bb row (same 16-line output), i.e. the immutable cells are restored; only the appended row S080 carries the correction.
   - `grep -icn 'recursiv' task-agent-discovery.md` → `0`: the fetched doc contains no "recursive" claim; the dropped clause "recursive filesystem roots" has no antecedent in the bytes, so the correction is supported.
   - Targets: `git show 269dadb6:corpus/SOURCES.md | grep -oP 'supersedes S\d+ —' | sort | uniq -c` → 13 rows, exactly one `supersedes S003 —` (S080); S003 is the first of the 13 R46-1 in-place rewrites and S080 the first appended row (S080–S092), per `corpus/lessons/round-47.md` row-log and `corpus/QUALITY.md` Q35.

5. Every clause of `teaches` supported by located bytes:
   - "Task-agent discovery precedence": doc section `### Discovery inputs and precedence` (:150) enumerates order 1–5; `Implications` gives override order (project over user, earlier extension roots override later, non-bundled override bundled).
   - "first-wins by exact name": :168 quote; bullets :170-175 (`Set<string>` tracks seen names; kept only if unseen; exact `agent.name`; case-sensitive).

6. tier/kind/scope/anchor:
   - tier A: plan defines new rows as tier A primary manuals; row uses `A` (valid vocabulary; 82 A-rows).
   - kind `docs`: documentation markdown (valid vocabulary).
   - scope `OMP task-agent discovery precedence on main`: `git ls-remote https://github.com/can1357/oh-my-pi.git refs/heads/main` → `0b5c27ab24719c86a5986b95ee55f4e75bc1aaa0 refs/heads/main` (pinned commit is main tip on 2026-10-23; "on main" holds).
   - anchor `docs/task-agent-discovery.md § Merge and collision rules; main 0b5c27ab…; body sha256 6739e902…`: all verified (section at :166, main sha via ls-remote, body sha256 computed).
   - status `mined` / opened 2026-10-23 / recheck `on-release` (matches S003's original recheck) / used-by `corpus/knowledge/omp-task-contract.md` exists at rev 269dadb6 (`git ls-tree 269dadb6 -- corpus/knowledge/omp-task-contract.md` → blob 9ad41eaf).

7. Gate record in `corpus/lessons/round-47.md` (§ Gate table, S080 row): URL raw oh-my-pi `0b5c27ab…/docs/task-agent-discovery.md`; accessed 2026-10-23; quote "Discovery uses first-wins dedup by exact `agent.name`:" (§ Merge and collision rules, first sentence; 7 words); decision `admit A, mined — supersedes S003 (SupersedeS003)` — consistent with the row and with my independent measurements.

8. Drafting seat report `build/SupersedeS003.md` (RESULT SupersedeS003 rev=cac43009 verdict=CONFIRMED row=S080): states the pinned raw source re-opened today; no recursive-filesystem-roots claim occurs; corrected teaching confirmed. Its own evidence (ls-remote main sha, body sha256, 7-word count) matches my independent re-measurement. Q35 (QUALITY.md) assigns the supersedes-row correctness judgment to this non-author re-open; no defect found.

Verification gaps / residual risk: the doc's "Nearest project `.omp/agents` dir" discovery item is `findAllNearestProjectConfigDirs` — the exact-name/first-wins claim is verified against the doc text, not against oh-my-pi executable source; the row is a documentation claim, so the doc is the right fetched bytes. No deviations from the row's cells or Gate record found. No tools installed; no processes left running; only this report written in the lane.
