# S200 drafts (K64ScoutWorkingCopyOpen) — paste targets: corpus/SOURCES.md Registry; entry `## Located quotes`; .ufo/pins/source-captures.json

## Registry row (11 cells, one line; append after S197 — note ids S198/S199 are the L1's to allocate, S200 is the lane id given)

| S200 | Jujutsu docs "Working copy" (rendered, alias `latest` = v0.46.0 per versions.json) — https://docs.jj-vcs.dev/latest/working-copy/ | docs | A | jj working-copy auto-snapshot, workspaces (add, forget, the 0.46 `workspace remove`) and stale working copies; the page is jj 0.46.0, host jj is 0.45.1 | § Introduction (capture L2000-2004), § Workspaces (L2057-2077, incl. `jj workspace remove` L2072), § Stale working copy (L2078-2100); capture jj-working-copy.html body sha256 947d0c56c02f9c10b4c14e8aaa8cc3f435f7650536ab9386ef6a52f1d64ff3c7, 47694 bytes; fetched 2026-10-25 (seat K64ScoutWorkingCopyOpen); rendered page differs from S067 (v0.45.1) only in the forget paragraph | jj snapshots the working copy and commits changes automatically; workspaces share one repo, each with its own checked-out commit; `workspace forget` leaves the directory on disk while the 0.46 `workspace remove` also deletes it (main workspace excepted); a workspace goes stale when another workspace rewrites its commit and `jj workspace update-stale` repairs it | mined | 2026-10-25 | on-release | corpus/knowledge/jj-workspace-seat-containment.md |

## `## Located quotes` bullets (each verified: <= 25 words, present in the normalised capture; Y/Y checked by /tmp/kumitate-r64/K64ScoutWorkingCopyOpen/q.mjs)

- S200 — "Unlike most other VCSs, Jujutsu will automatically create commits from the working-copy contents when they have changed."
- S200 — "You can have multiple working copies backed by a single repo. Use jj workspace add to create a new working copy."
- S200 — "The working copy will have a .jj/ directory linked to the main repo."
- S200 — "The workspace directory and files are left on disk."
- S200 — "Use jj workspace remove to forget a workspace and remove its directory from disk."
- S200 — "When you modify workspace A's working-copy commit from workspace B, workspace A's working copy will become stale."
- S200 — "When the working copy is stale, use jj workspace update-stale to update the files in the working copy."
- S200 — "jj workspace update-stale will create a recovery commit with the contents of the working copy"

Heading of each (not part of the quote — see Finding -2): 1 § Introduction; 2-3 § Workspaces; 4-5 § Workspaces (forget / remove paragraphs); 6-8 § Stale working copy.

## source-captures.json entry to add
{"sourceId":"S200","path":".ufo/waves/round-64/build/K64ScoutWorkingCopyOpen/capture/jj-working-copy.html","sha256":"947d0c56c02f9c10b4c14e8aaa8cc3f435f7650536ab9386ef6a52f1d64ff3c7","bytes":47694,"captured":"2026-10-25"}
(the L1 may prefer to re-home the capture under its own build dir; sha256/bytes then stay identical.)
