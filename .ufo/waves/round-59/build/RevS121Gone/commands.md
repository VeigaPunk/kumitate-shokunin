# RevS121Gone command index

Scored surface: `5469c0a58d7986ff8a5f203938ae1c8785a92213:corpus/README.md`. Worktree blob matches that object (`2a116230d40a1252df79781e0725401388c97aa7`). Captured `2026-10-24T21:34:54-03:00`.

| command | exit | capture |
|---|---|---|
| `git rev-parse HEAD` | 0 | `head.txt` (`5469c0a58d7986ff8a5f203938ae1c8785a92213`) |
| `git status --porcelain --untracked-files=all -- corpus/README.md` | 0 | `readme.status.txt` (empty stdout) |
| `git diff --stat 5469c0a58d7986ff8a5f203938ae1c8785a92213 -- corpus/README.md` | 0 | `readme.diffstat.txt` (empty stdout) |
| `git hash-object corpus/README.md` and `git rev-parse 5469c0a…:corpus/README.md` | 0 | both printed `2a116230d40a1252df79781e0725401388c97aa7` |
| `git grep -n -E 'S121' 5469c0a58d7986ff8a5f203938ae1c8785a92213 -- corpus/README.md` | 1 | `score-grep.stdout.txt` empty; `score-grep.exit.txt` |
| `git grep -n -E 'S121' 0f66ecd4a9efd10b7c0daab35891edbdd6c74b5f -- corpus/README.md` | 0 | `base-grep.stdout.txt` (base only; not the scored surface) |
| python cell extract + map-row scan of `git show 5469c0a…:corpus/README.md` | 0 | `extract.txt`, `attack.txt`, `*.source-id-cell.txt`, `*.line` |

Map-row rule used in the scan: a line whose first non-space characters are `| ` (same rule as `scripts/cite-sources.mjs`). Source id: `\bS[0-9]{3,}\b`. Source-id cell: the third markdown cell (header: Primary sources).
