# CritTheme evidence index

Measured revision `5469c0a58d7986ff8a5f203938ae1c8785a92213`. Base `0f66ecd4a9efd10b7c0daab35891edbdd6c74b5f` used only as the before-state for the "second theme admitted" attack. Lane `/home/vgpnk/Projects/shokunin/kumitate-shokunin`. Clock `2026-10-24T21:38:14-03:00` in `00-identity.txt`.

| file | what it records |
|---|---|
| `00-identity.txt` | HEAD equals the score rev; base is an ancestor; lesson blob `a7e14c72450f67e913db34d4b24665db08bf6e03` matches the worktree hash-object |
| `01-lesson-nl.txt` | `git show <rev>:corpus/lessons/round-59.md \| nl -ba` |
| `02-admit-reject-census.txt` | `git grep` of `ADMIT ` and `^REJECT `; `flip:` count; distinct filenames after ADMIT and REJECT |
| `03-rejected-paths.txt` | `git ls-tree -r --name-only` filtered for durable-execution / mcp-orchestration / fanout / failure-detection |
| `04-name-status.txt` | `git diff --name-status <base> <rev>` on knowledge, lessons, README, SOURCES, PROVINCE, LOG, SCORECARD |
| `05-knowledge-added.txt` | added knowledge files only |
| `06-sources-id-delta.txt` | SOURCES id set, base 123 vs rev 126; added S125 S127 S136; removed none |
| `07-rejected-ids.txt` | no SOURCES rows for S126 S131 S133 S134 S135 S190 S194 |
| `08-province.diff` | only the MCP frontier bullet changed |
| `09-readme.diff` | README hunk |
| `10-marker-grep.txt` | saga / Tail at Scale / S190 / S194 / rejected filenames in corpus at rev |
| `11-staged-vs-adopted.txt` | staged-ids vs reg-ids membership |
| `12-quotes.txt` | admit line and both flip sentences extracted from the worktree lesson (blob-identical to the rev) |
| `13-ledger-and-counts.txt` | knowledge count 53→54; rejected filenames absent from the rev tree; S126 row count 0 |
| `14-package-absent.txt` | assimilation dir listing; no rejected filename under the round-59 wave |
| `15-entry-nl.txt` | admitted entry at the rev, numbered |
| `16-attack-bindings.txt` | staged lines for the rejected-theme ids; SOURCES has none; LOG round-59 entry; SCORECARD round-59 hit |

Binding absence check, re-stated: `git ls-tree -r --name-only 5469c0a58d7986ff8a5f203938ae1c8785a92213 | grep -F -e durable-execution-and-fanout-primitives-2026-10-24.md -e durable-execution-failure-detection.md` printed `(absent from rev tree)` (`13-ledger-and-counts.txt`).
