VERDICT: The staged claim "the seat does not go stale" is evidence for ONE case only (a description-only rewrite of a commit above the seat, run once on jj 0.45.1, `snapshot.auto-update-stale=false`); the demo contradicts every generalisation of it (`abandon_seat_head_seat_state=stale`), so the lane entry may carry only the shared-log / separate-tree sentences and the Mozilla/jj-doc attributions, and must cut the "never stale / not needed / hazard does not arise" sentences.

Staged files (read-only, /home/vgpnk/Projects/shokuknow/merge/kumitate/knowledge/corpus/knowledge/): A = `jj-operation-log-and-seat-staleness-2026-10-25.md` (43 lines; S290+S291; one entry, no S295), B = `jj-seat-staleness-outcome-2026-10-25.md` (41 lines; S295). Line refs below are file-local (A:n, B:n).

## Evidence

`bash scripts/jj-seat-demo.sh` → exit 0, jj 0.45.1-7c41cdeb16b6b321c64e789a966b6adf723816a5 (scratch `/tmp/kumitate-r64/K64ScoutStagedJjDiff/demo.out`):
```
JJ_SEAT: workspaces_after_add=2          JJ_SEAT: rewrite_seat_head_seat_state=fresh
JJ_SEAT: seat_gets_base_file=yes         JJ_SEAT: rewrite_seat_head_description_seen=rewritten
JJ_SEAT: seat_has_git_dir=no             JJ_SEAT: abandon_seat_head_seat_state=stale
JJ_SEAT: seat_file_in_default_tree=no    JJ_SEAT: abandon_seat_head_files_on_disk=kept
JJ_SEAT: default_status_clean_after_seat_write=1   JJ_SEAT: update_stale_recovers=yes
JJ_SEAT: seat_snapshot_in_shared_op_log=2          JJ_SEAT: absolute_path_write_seen_in_default=1
JJ_SEAT: ignore_working_copy_adds_op=no            JJ_SEAT: workspaces_after_forget=1
JJ_SEAT: seat_dir_after_forget=present
JJ_SEAT_DEMO: DONE jj=0.45.1-7c41cdeb16b6b321c64e789a966b6adf723816a5
```
(15 keys; the demo has NO key for: seat commit visible in default's log, the "Rebased N descendant commits" text, the update-stale "not stale" text, `auto-update-stale` default or `=true`.)

Docs opened live: jj v0.45.1 `working-copy.md` (raw.githubusercontent), jj latest `technical/concurrency` (= v0.45.1 `technical/concurrency.md`), Mozilla `contributing/jujutsu.html`. Quotes used:
- concurrency.md:66-68 "The most important piece in the lock-free design is the "operation log". That is what allows us to detect and merge divergent operations."; :72-74 "The view object contains the set of visible head commits, bookmarks, tags, and the working-copy commit in each workspace."
- working-copy.md:108-110 "When you modify workspace A's working-copy commit from workspace B, workspace A's working copy will become stale."
- Mozilla: "A workspace becomes stale when a commit it depends on is rewritten from another workspace, for example by rebasing, editing, or squashing." and "With auto-update disabled, most jj commands will refuse to run on a stale workspace until you manually update with jj workspace update-stale."
- `jj config list --include-defaults` line 215: `snapshot.auto-update-stale = false` (jj 0.45.1 default).

Staged transcript read (`lanes/kumitate/round12/jj-seat-isolation-demo.txt`, 28 lines; the lane cannot cite it): `jj describe -r @- -m 'rewritten by main'` run in the MAIN workspace (:8) → `Rebased 2 descendant commits.` (:9); the seat's status afterwards shows `Working copy (@): zzsrylmp 43306665 seat work` with `Parent commit (@-): vprvxpto ca078d8a (empty) rewritten by main` (:19-20) and `jj workspace update-stale` → `Attempted recovery, but the working copy is not stale.` (:22). [INFERENCE from :19-20] the rewritten commit was the seat's PARENT (ancestor, description-only); the seat's own `@` kept its description "seat work" and was merely auto-rebased. One run, one op, no abandon, no rebase-with-tree-change, no auto-update-stale=true arm.

Own live variants (fixture repos via mktemp, `JJ_CONFIG=/dev/null`, script `/tmp/kumitate-r64/K64ScoutStagedJjDiff/var.sh`; each seat has a parent `seatwork` and a child `seatchild` with an uncommitted file; run from default workspace, then `jj status` in the seat):
```
A rewrite ANCESTOR description   -> "Rebased 1 descendant commits." ; seat status fresh ; update-stale: "Attempted recovery, but the working copy is not stale."
B rewrite seat HEAD description  -> seat status fresh (@ description now head-rewritten); update-stale: not stale
C abandon seat HEAD              -> seat: "Error: The working copy is stale (not updated since operation ...)" ; update-stale: "Updated working copy to fresh commit ... removed 1 files"
D rebase seat HEAD (-d root())   -> "Rebased 1 commits to destination." ; seat: "Error: The working copy is stale ..."
F abandon seat PARENT            -> "Rebased 1 descendant commits onto parents of abandoned commits." ; seat: "Error: The working copy is stale ..."
G abandon seat HEAD, seat run with --config snapshot.auto-update-stale=true -> seat status auto-updates ("Updated working copy to fresh commit ...", exit 0, not silent)
```
So "stale or not" is decided by the KIND of rewrite (description-only → fresh; abandon, rebase/tree-changing → stale), not by "rewrite" vs "no rewrite". Case E (tree-edit via restore) errored on a fileset parse in my script; not measured.

Lane doc: `corpus/knowledge/agent-isolation-substrates.md:149-151` (M7): "…rewriting a commit another workspace has checked out makes that workspace stale. Not demonstrated this round; no table row relies on it." `:195-196`: "jj workspaces in colocated repos (M7) are not demonstrated here." The decision table (:154 ff.) has no jj-workspace row (grep `workspace` hits only :149,:195).

## Findings

**K64ScoutStagedJjDiff-1 (HIGH) — title/thesis of B is true for one case and false as stated.** B:8 "The seat does not go stale…", B:27 "a seat is never left holding a working copy that contradicts the repository", B:22-23 "off by default here, and was still not needed". Demo: `rewrite_seat_head_seat_state=fresh` but `abandon_seat_head_seat_state=stale`; probes C/D/F stale. The staged evidence covered: one description-only rewrite of an ancestor, with `auto-update-stale=false`, one transcript. It never tried abandon, rebase, or `=true`. Repro: `bash scripts/jj-seat-demo.sh | grep -E 'rewrite_seat_head_seat_state|abandon_seat_head_seat_state'`.

**K64ScoutStagedJjDiff-2 (HIGH) — B:16 "a second workspace rewrote that commit" misdescribes its own transcript.** Transcript :19-20 shows the rewritten commit is the seat's parent, the seat's `@` ("seat work") was only auto-rebased; the demo's `rewrite_seat_head_*` keys are the first measurement of rewriting the seat's checked-out commit (fresh, description seen = rewritten). `Rebased 2 descendant commits` is topology-specific (my probe A printed `1`). Repro: probes A vs B in var.sh.

**K64ScoutStagedJjDiff-3 (MED) — M7 (lane doc :149-151) is contradicted as an unqualified sentence by the demo** ("rewriting a commit … makes that workspace stale" is the jj doc working-copy.md:108-110 wording; measured: description-only rewrite of the head = fresh; abandon/rebase = stale). J8's amendment must say so; the doc line is append-only, so the correction goes in the amendment, not an edit. Also :195-196 "colocated repos not demonstrated": the demo's default workspace is colocated (`jj git init` over a git repo yields `.git` + `.jj`, `git.colocate = true`) and the seat is not (`seat_has_git_dir=no`); the amendment can narrow that sentence.

**K64ScoutStagedJjDiff-4 (MED) — A:28-30 overstates Mozilla.** "a seat … refuses to run until it is updated" vs Mozilla "most jj commands will refuse"; "silently absorbs" vs probe G, where jj prints `Updated working copy to fresh commit`. A:32-35 "the tool does not choose between them" omits that jj 0.45.1's default is `false` (refuse) and Mozilla's `mach vcs-setup` sets `true`. The knob is only relevant for the stale cases (abandon/rebase), not for the description-only case B headlines.

**K64ScoutStagedJjDiff-5 (MED) — provenance defects.** B:2 lists the jj concurrency URL as the source of a measurement it does not contain (`grep -n -i 'stale\|rebas' concurrency.md` → no hits). Both files carry `verified-at: 2026-10-24` (lane needs 2026-10-25), recheck paths point at `/home/vgpnk/Projects/shokuknow/lanes/…` (lane cannot cite), and A:5 recheck says `grep -c -F 'operation log' …/concurrency/` → 1; live count is 6 (`curl -fsSL 'https://docs.jj-vcs.dev/latest/technical/concurrency/' | grep -c -F 'operation log'` → 6). Registry has no S290/S291/S295 (`grep -n 'S290\|S291\|S295' corpus/SOURCES.md` → no hits); rows must be opened and re-id'd from S198.

**K64ScoutStagedJjDiff-6 (LOW) — "isolation of working trees" (A:22, B:30) needs the demo's second half.** `absolute_path_write_seen_in_default=1`: separate tree ≠ contained writes; and the seat's wc commit is addressable/rewritable from every workspace (`rewrite_seat_head_description_seen=rewritten`), so "working-copy commit stays per-workspace" (A:20) is true of where it is checked out, not of who can change it.

**K64ScoutStagedJjDiff-7 (LOW) — amendment 2026-10-25 lines 62-64 would propagate the error:** "the earlier measurement that a seat is not left stale stands unchanged". The lane amendment must not carry it. (Amendments -26/-27 are fleet-doc citations, no jj claim to re-ground; -25's Arm 1/Arm 2 visibility counts rest on an uncited transcript (S311) and have no demo key.)

## Sentence table

| # | Staged sentence (loc) | Class | Basis |
|---|---|---|---|
| A1 | "previous round measured that a seat's commit appears in every other workspace's log" (A:12) | UNSUPPORTED | cites prior-round transcript (S280, round10); demo has only the reverse direction (`rewrite_seat_head_description_seen=rewritten`) and op-log sharing (`seat_snapshot_in_shared_op_log=2`) |
| A2 | "operation log is the most important piece of the lock-free design … detect and merge divergent operations" (A:17-19) | SUPPORTED-BY-DOC | concurrency.md:66-68 quote above |
| A3 | "The operation log is where every workspace's changes live" (A:19) | SUPPORTED-BY-DEMO+DOC | `seat_snapshot_in_shared_op_log=2`; concurrency.md:72-74 view holds "working-copy commit in each workspace" |
| A4 | "working copy … stay per-workspace; the history does not" (A:19-20) | SUPPORTED-BY-DEMO (files) | `seat_file_in_default_tree=no`, `default_status_clean_after_seat_write=1`; wc-commit caveat = finding -6 |
| A5 | "That is why the lane's measurement showed a seat's commit in the main workspace's log" (A:21-22) | UNSUPPORTED | round10 transcript; no demo key |
| A6 | "isolation of working trees, no isolation of history" (A:22) | SUPPORTED-BY-DEMO | `seat_file_in_default_tree=no`; `rewrite_seat_head_description_seen=rewritten`, `abandon_seat_head_seat_state=stale` (history reaches into seat); qualify with `absolute_path_write_seen_in_default=1` |
| A7 | "A workspace becomes stale when a commit it depends on is rewritten from another workspace, by rebasing, editing or squashing [2]" (A:26-28) | SUPPORTED-BY-DOC (as Mozilla's statement); NARROWED by demo | Mozilla quote above; `rewrite_seat_head_seat_state=fresh` (description-only edit not enough); `abandon_seat_head_seat_state=stale`; probe D rebase → stale |
| A8 | "`snapshot.auto-update-stale` decides whether a seat silently absorbs … or refuses to run until it is updated" (A:28-30) | SUPPORTED-BY-DOC, overstated | Mozilla "most jj commands will refuse"; probe G not silent; no demo key sets it |
| A9 | "configuration rather than a code change … both are coherent policies; the tool does not choose" (A:32-35) | UNSUPPORTED (inference) / partly CONTRADICTED | jj default `false` (config list :215); no demo key |
| B1 | "documentation's warning was … stale when a commit it depends on is rewritten" (B:10-12) | SUPPORTED-BY-DOC | Mozilla / working-copy.md:108-110 (but B cites S295 URL, which lacks it) |
| B2 | "Measuring it on this host gives a sharper answer than the warning" (B:12-13) | CONTRADICTED | `abandon_seat_head_seat_state=stale`; the answer is narrower, not sharper |
| B3 | "A seat committed work in one workspace; a second workspace rewrote that commit" (B:16-17) | UNSUPPORTED (transcript) / partly CONTRADICTED | transcript :19-20 shows ancestor rewritten; demo covers head: `rewrite_seat_head_description_seen=rewritten` |
| B4 | `jj reported "Rebased 2 descendant commits"` (B:17-18) | UNSUPPORTED | transcript :9 only; demo prints no jj output; count is topology-specific |
| B5 | "the seat's commit came to rest on the rewritten parent" (B:18) | UNSUPPORTED | transcript :19-20; live probe A matches, no demo key |
| B6 | "seat's own files were untouched, still sitting as working-copy changes" (B:19-20) | UNSUPPORTED by demo | transcript :16-18; probes A/B show change retained; the demo's file key is for abandon (`abandon_seat_head_files_on_disk=kept`) and probe C's update-stale removes the file |
| B7 | `answer was "Attempted recovery, but the working copy is not stale" — nothing to recover` (B:20-22) | SUPPORTED-BY-DEMO in substance, text UNSUPPORTED | `rewrite_seat_head_seat_state=fresh`; message only in transcript :22 and probes A/B |
| B8 | "auto-update … is off by default here" (B:22-23) | SUPPORTED-BY-DOC/live | `jj config list --include-defaults` :215 `false`; transcript :4; not a demo key |
| B9 | "…and was still not needed" (B:23) | CONTRADICTED (as generalisation) | `abandon_seat_head_seat_state=stale`, `update_stale_recovers=yes`; probe G shows `=true` removes the manual step |
| B10 | "The stale-file hazard … does not arise in this shape of use: jj rebases descendants automatically, so a seat is never left holding a working copy that contradicts the repository" (B:25-27) | CONTRADICTED | `abandon_seat_head_seat_state=stale`; probes C, D, F |
| B11 | "a seat shares the history and the operation log — another seat's rewrite is immediately visible everywhere" (B:27-28) | SUPPORTED-BY-DEMO | `rewrite_seat_head_description_seen=rewritten`, `seat_snapshot_in_shared_op_log=2`; "immediately" = next command (`ignore_working_copy_adds_op=no` shows reads need no new op) |
| B12 | "the seat's own commit id changes under it" (B:28) | SUPPORTED-BY-DEMO (inference from rewrite) | `rewrite_seat_head_description_seen=rewritten` (description is part of the commit id; id not printed by demo) |
| B13 | "isolation … is precisely the working tree, and nothing else" (B:30-31) | SUPPORTED-BY-DEMO, needs caveat | `seat_file_in_default_tree=no`; plus `absolute_path_write_seen_in_default=1` |
| B14 | "defensible for … files, and unacceptable for … claims" (B:31-33) | UNSUPPORTED (policy judgement) | no key; keep only as framing |
| B15 | "a seat whose commit id changes under it needs a way to recognise that" (B:37-39) | UNSUPPORTED (policy judgement) | no key |

## Recommendation

Lane entry MAY carry (re-worded, each tied to a demo key it lists under `## Demo outcomes`): A2, A3, A4/A6 (working tree separate: `seat_gets_base_file`, `seat_has_git_dir`, `seat_file_in_default_tree`, `default_status_clean_after_seat_write`; with `absolute_path_write_seen_in_default` caveat), shared op log / history visibility (B11-12: `seat_snapshot_in_shared_op_log`, `rewrite_seat_head_description_seen`, `ignore_working_copy_adds_op`), A7/A8 as attributed Mozilla + jj-doc statements (open S-rows from the live docs, quote ≤25 words, soften "refuses" to "most commands refuse", drop "silently"), B8 (default false) only if re-sourced live, and the TWO-ARM staleness result stated as measured: head description rewrite → `fresh`; abandon → `stale` with `abandon_seat_head_files_on_disk=kept` and `update_stale_recovers=yes`. The entry title must name the case ("a description-only rewrite does not stale the seat; abandoning its commit does").

MUST cut: B8 title, B2, B9, B10 (contradicted); B3-B6 and the transcript quotes in B7/B4 (uncitable; the demo's `rewrite_seat_head_*` keys replace them; if a "Rebased N descendant commits" or "not stale" message is wanted, add a demo key that captures it); A1, A5 (round10 transcript); A9 and B14-15 as factual statements (keep at most as flagged inference); amendment-2026-10-25 lines 62-64 ("stands unchanged"). Fix M7 via the J8 amendment: the jj-doc sentence is true for abandon/rebase, false for description-only rewrite on 0.45.1. Suggested extra demo keys (strengthening only): `rebase_seat_head_seat_state` (probe D = stale), `abandon_seat_parent_seat_state` (probe F = stale), `auto_update_stale_true_abandon_seat_state` (probe G = fresh/updated), `auto_update_stale_default` (= false).

## Artifacts
- `/tmp/kumitate-r64/K64ScoutStagedJjDiff/{demo.out,var.sh,wc.md,conc.md,ff.html}` (scratch; no file under scripts/, corpus/, or the frozen paths was edited).

## Limits
- Did not run the lane's J64/R64 probes; did not open staged S280/S311/S327/S338 transcripts beyond S295's (round12) file; amendments -26/-27 not fact-checked (fleet-doc citations).
- Probe E (tree-changing edit from default) failed to parse; "tree-changing rewrite = stale" rests on probe D (rebase) only. All jj behaviour measured on 0.45.1, one host, single runs per variant; the `Rebased N` counts are fixture-specific.
- Transcript topology (ancestor vs head rewrite) is inferred from its status output, not from a commit graph the transcript does not print.
- Mozilla page quoted from a glyph-stripped text extraction; "most jj commands" wording as extracted.
