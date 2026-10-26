# K64R2SimplifyEntry — redundancy ledger (C2 entry YAGNI pass)

Subject: `corpus/knowledge/jj-workspace-seat-containment.md` @ `2ed8a5f8b133c65b3be59e3d10ff5bff50c4a2d8` (140 lines,
14392 B, 2006 words) → `build/K64R2SimplifyEntry/entry.simplified.md` (129 lines, 13107 B, 1820 words).

Class codes: D = sentence repeats another sentence · T = prose restates a table row · U = carries no quote/key/label ·
L = duplicated limit · H = over-long header line.

| # | Class | Cut | Where the claim survives |
| --- | --- | --- | --- |
| 1 | H | `verified-at:` 241→143 chars: dropped "the demo `bash scripts/jj-seat-demo.sh` ran in" (command is named in `recheck:`) and "docs read at v0.46.0, one minor release above the host binary" | three `source:` lines carry `v0.46.0` in the URL; §Version skew states docs v0.46.0 vs host 0.45.1 |
| 2 | H | `recheck:` 349→315 chars: dropped "on 2026-10-25" (date is `verified-at:`) and "and re-run the demo" (the first clause already re-runs the demo) | both commands and the `→ 1` curl check kept verbatim |
| 3 | D | Intro restated the staleness rule ("the rule that decides whether a seat goes stale (the seat's on-disk tree against the tree of its new commit — not the kind of operation)") already stated in §What + Limits L4 | §What the demo measures (rule + `[INFERENCE: … derived by K64ReviewDemo]`), Limits L4 |
| 4 | T | §What: "a seat write stays out of the default tree and the default workspace reads clean, while the seat's next jj command adds a snapshot operation to the one shared log" = table row 1 middle cell | table row 1; `seat_file_in_default_tree`, `default_status_clean_after_seat_write`, `seat_snapshot_in_shared_op_log` in table + Demo outcomes |
| 5 | T | §What: "`jj workspace forget` removes the registration and leaves the directory and the seat's commit in the repository's history" = table row 8 middle cell | table row 8; `workspaces_after_forget`, `seat_dir_after_forget`, `forget_seat_commit_in_all` in table + Demo outcomes |
| 6 | D | §Mechanism re-quoted three Located-quote bullets verbatim: S200 "You can have multiple working copies backed by a single repo", S200 "When you modify workspace A's working-copy commit…", S199 "some mach commands invoke jj…" | facts kept as cited paraphrase ("One repository stands behind every workspace", "S200's sentence that modifying workspace A's … stales A", "its mach commands can fail, sometimes silently"); exact bytes remain in all 13 Located-quote bullets |
| 7 | D | §Mechanism: "The demo's four stale/fresh outcomes refine that sentence: modifying the seat's commit does not by itself stale the seat" restated the §What rule and Limits L4 | §What paragraph 1; Limits L4 ("S200's unqualified sentence is contradicted by the demo's describe case") |
| 8 | L | Two Limits bullets shared one premise ("Measured on jj 0.45.1 only" / "the wording of one jj version"): merged heads to "Fixture-dependent counts and wording." | both key names (`ignore_working_copy_adds_op`, stale/fresh keys) and the `working copy is stale` wording caveat kept |
| 9 | L | Limits L4 restated §What's rule sentence nearly verbatim | condensed to the residual (no document states it; describe case contradicts S200; fits all four) `[INFERENCE]` |
| 10 | U | Limits "Not measured": "(the demo prints the description only)" repeated the table row 3 `[INFERENCE: the demo prints the description, not the commit id]` | table row 3 INFERENCE cell |

Deliberate stops (next deletion would harm an axis):

- The 4 stale/fresh keys appear three times (prose, table, Demo outcomes). J6 requires the outcomes list to equal the
  demo's live set; the table is the decision artifact; the prose carries the `[INFERENCE]` rule. Cutting any one loses an
  axis (machine check, decision use, or the inference attribution).
- "a workspace is not a sandbox" appears as intro thesis, table row 7 guard, and Limits bullet 1. Three different jobs
  (headline, instruction, scope caveat); Limits 1 is the only place the accident-model/kasegi-kagi grounding sits.
- §Version skew repeats "host binary is jj 0.45.1" from `verified-at:`; the skew section is the only place the
  `jj workspace remove` absence is argued.

Invariants proven after the pass (see report §Evidence): 21/21 demo keys, 9/9 table rows byte-identical, 13/13 quotes
byte-identical, 3/3 `[INFERENCE]` labels, 3 sources S198-S200, 7/7 limit bullets, all 21 distinct `key=value` mentions
still present, J1 header trio inside the first 14 lines, `JJ64_HELD held=8/8` exit 0.
