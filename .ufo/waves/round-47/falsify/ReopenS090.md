RESULT ReopenS090 rev=269dadb6 verdict=HOLDS row=S090 supersedes-S061-correct quote-verbatim-22w teaches-clauses-supported tier/kind/scope/anchor-valid

Evidence (lane repo /home/vgpnk/Projects/shokunin/kumitate-shokunin; C1 commit 269dadb6a56744531bd1201e5944185e96ff6a4c):

1. S090 row at rev 269dadb6 (`git show 269dadb6:corpus/SOURCES.md | grep '^| S090 |'` → line 103):
   `| S090 | Fleet lane addendum, scripts/hyaku/lane-addendum.md (shokunin fleet repo) — /home/vgpnk/Projects/shokunin/scripts/hyaku/lane-addendum.md | own-work | B | who wrote mcp.json.pre-disable-<stamp> on this host | lines 82-84 at fleet commit 4248e9244108ba81141d347b699596dff34847bf; reopened 2026-10-23; body sha256 9f0be557dee50f7d00eab4124067d5ce03ea7495d085bc275684132f0a7dce1e | supersedes S061 — The operator authorized disabling the OMP rea MCP entry; the orchestrator set enabled=false and made the pre-edit copy at 10:12 -03. | mined | 2026-10-23 | 30d | corpus/knowledge/omp-agent-root.md, corpus/lessons/round-44.md |`

2. Source fetch (ordinary means): the source is a local fleet file; I opened its canonical bytes with `git -C /home/vgpnk/Projects/shokunin show 4248e9244108ba81141d347b699596dff34847bf:scripts/hyaku/lane-addendum.md > /tmp/s090-src.md && sha256sum /tmp/s090-src.md` → `9f0be557dee50f7d00eab4124067d5ce03ea7495d085bc275684132f0a7dce1e  /tmp/s090-src.md` (matches the row's body sha256; 225 lines). Access date 2026-10-23.

3. Quote verbatim at stated locator: `sed -n '82,84p' /tmp/s090-src.md` →
   82: `   **REA MCP:** the operator authorized disabling the OMP `rea` MCP entry for this phase; the`
   83: `   orchestrator set `"enabled": false` in `~/.omp/agent/mcp.json` at 10:12 -03 (pre-edit copy`
   84: `   `~/.omp/agent/mcp.json.pre-disable-20261020T1015`). An unidentified writer rewrote that file at`
   The Gate quote is the line-82 tail + line-83 head, verbatim: "the operator authorized disabling the OMP `rea` MCP entry for this phase; the orchestrator set `"enabled": false` in `~/.omp/agent/mcp.json` at 10:12 -03" (:82-83). `printf '%s' '<quote>' | wc -w` → `22` (≤25). `sha256sum` of the fetched body: `9f0be557…` (above).

4. `supersedes S061 —` names the right target and the correction is supported by the bytes:
   - S061 at 2b2bf7bb (`git show 2b2bf7bb:corpus/SOURCES.md | grep '^| S061 |'`): same source/kind (`own-work`)/tier (`B`)/scope as S090; teaches `"the orchestrator set ... at 10:12 -03 (pre-edit copy" — an operator pre-edit copy, not an OMP or REA chain`.
   - S061 at rev 269dadb6 is byte-identical to the 2b2bf7bb row (`git show 269dadb6:corpus/SOURCES.md | grep '^| S061 |'` diffed against the 2b2bf7bb row → `IDENTICAL`), i.e. the round-46 in-place rewrite is restored and the correction lives only in appended row S090 (Q35: `corpus/QUALITY.md` 695-719; CORPUS.md:116-118 rule 2).
   - Exactly one `supersedes S061` row exists (`grep -c 'supersedes S061'` → 1, at S090).
   - Dropped clause support: `grep -in 'not an\|no OMP\|rea chain' /tmp/s090-src.md` → no hits (exit 1); `grep -n 'OMP' /tmp/s090-src.md` → only line 82 (`OMP `rea` MCP entry`); the source nowhere states "not an OMP or REA chain", so S090's drop of the exclusion clause is supported. The `rea` mentions (:82,:85,:87,:88) are the OMP `rea` MCP entry, the rea pin `rea-agents@6.7.0`, the CLI `rea-agents@6.5.0`, and the `xd://mcp__rea_*` devices.

5. Every clause of `teaches` (after "supersedes S061 —") is supported by the located bytes:
   - "The operator authorized disabling the OMP rea MCP entry" ← :82 verbatim (`the operator authorized disabling the OMP `rea` MCP entry for this phase`).
   - "the orchestrator set enabled=false" ← :83 verbatim (`the orchestrator set `"enabled": false` in `~/.omp/agent/mcp.json``).
   - "and made the pre-edit copy" ← :83 parenthetical `(pre-edit copy `~/.omp/agent/mcp.json.pre-disable-20261020T1015`)`, governed by the sentence subject "the orchestrator"; the same attribution is recorded in `corpus/lessons/round-44.md` R44-6 (:199-203): "S061's source text attributes the pre-edit action to the orchestrator … Record the corrected attribution as an orchestrator-created pre-edit copy."
   - "at 10:12 -03" ← :83 (`at 10:12 -03`), the temporal frame of the clause.

6. tier/kind/scope/anchor:
   - tier B: fleet operational incident record; round-44 gate note (:81-82) gives S061/S058 "Same tier reasoning as S058" — an operator incident record, the only record of a writer no code implements (Q4 marks the attribution as the record's, not an observation). S090 inherits that source type (own-work, B). Valid vocabulary (`B` used by S058/S061/S090; `community` never tier A, tier C never sole support per QUALITY Q2).
   - kind `own-work`: matches S061 and S058 (local fleet record, not an external doc).
   - scope `who wrote mcp.json.pre-disable-<stamp> on this host`: byte-identical to S061's scope; the question matches the located parenthetical and the round prompt §6.2 paragraph.
   - anchor `lines 82-84 at fleet commit 4248e924…; reopened 2026-10-23; body sha256 9f0be557…`: verified — lines 82-84 are the REA MCP paragraph at that commit; body sha256 computed matches; reopened date is today.
   - status `mined` / opened 2026-10-23 / recheck `30d` / used-by `corpus/knowledge/omp-agent-root.md, corpus/lessons/round-44.md`: used-by paths exist at rev 269dadb6 (`git ls-tree 269dadb6 -- corpus/knowledge/omp-agent-root.md corpus/knowledge/omp-task-contract.md` → 100644 blobs 94232d13 and 9ad41eaf).

7. Gate record in `corpus/lessons/round-47.md` (§ Gate table, S090 row): URL fleet `scripts/hyaku/lane-addendum.md` at `4248e924…`; accessed 2026-10-23; quote "the operator authorized disabling the OMP `rea` MCP entry for this phase; the orchestrator set `"enabled": false` in `~/.omp/agent/mcp.json` at 10:12 -03" (:82-83; 22 words); decision `admit B, mined — supersedes S061; drops round 46's "not an OMP or REA chain" clause, which the source does not state (SupersedeS061)` — consistent with the row and with my independent measurements (quote 22 words, locator :82-83, dropped clause absent from the bytes).

8. Drafting seat report `build/SupersedeS061.md` (RESULT SupersedeS061 rev=cac43009 verdict=CHANGED row=S090): its quote (22 words), body sha256 (`9f0be557…`), lines 82-83 locator and R44-6 corroboration all match my independent re-measurement. Q35 (QUALITY.md :719) assigns the supersedes-row correctness judgment to this non-author re-open; no defect found.

Residual risk / verification gaps:
- The clause "made the pre-edit copy at 10:12 -03" attaches the operation's time to the copy; the copy path's own stamp reads `…pre-disable-20261020T1015` (10:15) while the sentence places the operation at 10:12 -03. The creation time is not independently attested beyond that stamp; the actor attribution is confirmed by R44-6, so this is a minor unverifiable detail, not a contradiction of the teach's substance.
- The teach omits "for this phase" and the copy path; the ≤25-word verbatim requirement applies to the Gate quote (verified), not to the teaches summary.
- The local source is opened from its pinned Git blob (file:// provenance in the drafting seat's report); no live-HTTP fetch is possible for a local fleet file.

No tools installed (no install records); no scratch clone or process started; no lane files touched other than this report.
