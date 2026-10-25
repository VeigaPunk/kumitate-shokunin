# ScoutFrontier — round 59 / w1

Axes: operability, coverage. This seat checks one coverage fact: PROVINCE.md frontier item 2 names `corpus/knowledge/mcp-orchestration-contract.md`, and that file's first line cites S125, S127, S136 and modelcontextprotocol.io. It does not run a counter and does not edit the lane.

**Item result: corroborated.** This is not a claim verdict. It does not attest DOCTRINE59_HELD or REPAIR59_HELD.

Score revision `5469c0a58d7986ff8a5f203938ae1c8785a92213` is HEAD and an ancestor of HEAD (`00-rev.txt`: `git rev-parse HEAD` printed that hash; `ancestor_exit=0`; `git cat-file -t` printed `commit`). Both files at that rev match the worktree (`05-identity.txt`: `province_cmp_exit=0`, `entry_cmp_exit=0`). `git show` of each path exited 0.

## Province bullet

`PROVINCE.md` does not print the token `item 2`. The index used here is the Nth `- ` bullet under `### Frontier` (line 17) and before the next `### ` heading (line 24, Adjacent). That window has four bullets (`06-frontier-bullets.txt`: `frontier_bullet_count=4`). Item 2 is line 20. `grep -n` of the path hits only that line (`09-token-grep.txt`).

`nl -ba` of the score blob (`08-quoted-lines.txt`):

```text
    20	- MCP protocol revisions as they bear on orchestration — first entry `corpus/knowledge/mcp-orchestration-contract.md` (round 59, S125/S127/S136): per-request identity in `_meta`, durable task creation, and the removal of the session handshake; other MCP revision families remain queued.
```

That bullet names `corpus/knowledge/mcp-orchestration-contract.md`. No other frontier bullet does.

## Source line

`sed -n '1p'` of `git show 5469c0a58d7986ff8a5f203938ae1c8785a92213:corpus/knowledge/mcp-orchestration-contract.md` (`08-quoted-lines.txt`):

```text
source: S125 https://modelcontextprotocol.io/docs/2026-07-28/learn/architecture ; S127 https://github.com/modelcontextprotocol/ext-tasks/blob/b3d28aceaa6d49f5f92258e3d06b61ad6f111e84/specification/2026-07-28/tasks.md ; S136 https://zenn.dev/komlock_lab/articles/mcp-stateless-spec-2026
```

Token scan of that line only (`09-token-grep.txt`):

```text
      1 modelcontextprotocol.io
      1 S125
      1 S127
      1 S136
```

`07-source-line.txt`: `cites_S125=yes`, `cites_S127=yes`, `cites_S136=yes`, `cites_modelcontextprotocol.io=yes`, `first_line_is_line_1=yes`, `first_line_chars=285`.

The entry's own line 4, not used as the province quote, agrees with the index: `coverage-map: frontier item 2 — MCP protocol revisions as they bear on orchestration (PROVINCE.md)`.

## Attack

A numbered label other than list position would falsify the index. None is printed. The second bullet is the only line that both sits in the Frontier window and names the path the item asks for. The theme text matches the frozen plan's C2 wording ("MCP protocol revisions as they bear on orchestration") and the entry's coverage-map line. Item 1 names `omp-task-contract.md`; items 3 and 4 name other entries.

The probe's E1 checks this entry header, not the province bullet. This seat does not re-score E1.

## Identity

| file | sha256 | git blob |
| --- | --- | --- |
| PROVINCE.md | `92102aa91d10cc02f63cd82cd70b294a1a8edea66f7116bed9efb3532764e308` | `a07a3d903c176d754c7855b8c17d28e919ef7c53` |
| corpus/knowledge/mcp-orchestration-contract.md | `a9c11099d665df26ccb223acd74170c54f3cf91363b3e400d95f5c51c26f3797` | `f84a4b5d6dc0f8d07f08ce20ef776a8bdbb52a6b` |

Worktree `git hash-object` equals `git rev-parse <rev>:<path>` for both.

## Evidence

`.ufo/waves/round-59/build/ScoutFrontier/` — `00-rev.txt`, `01-province-at-rev.md`, `02-entry-at-rev.md`, `05-identity.txt`, `06-frontier-bullets.txt`, `07-source-line.txt`, `08-quoted-lines.txt`, `09-token-grep.txt`, `commands.md`.
