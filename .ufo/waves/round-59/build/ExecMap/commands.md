# ExecMap evidence index — round 59 / w1

Seat item: run `node /home/vgpnk/Projects/shokunin/kumitate-shokunin/scripts/readme-map.mjs`, quote the `README_MAP` line, expect `CLEAN files=141 rows=141 covered=141`, and name the first finding if it drifts.

All commands below were read-only against the lane. Writes are only these evidence files.

## Environment

`env.txt` — captured at `2026-10-24T21:30:14-03:00`. Interpreter `/home/vgpnk/.local/share/mise/installs/node/latest/bin/node`, `node --version` printed `v26.12.0`. cwd `/home/vgpnk/Projects/shokunin/kumitate-shokunin`.

## Revision binding

```text
git -C /home/vgpnk/Projects/shokunin/kumitate-shokunin rev-parse HEAD
```

stdout `head.txt`: `5469c0a58d7986ff8a5f203938ae1c8785a92213` (exit 0).

```text
git -C /home/vgpnk/Projects/shokunin/kumitate-shokunin rev-parse 5469c0a58d7986ff8a5f203938ae1c8785a92213
```

stdout `score-rev.txt`: the same hash (exit 0).

```text
git -C /home/vgpnk/Projects/shokunin/kumitate-shokunin merge-base --is-ancestor 5469c0a58d7986ff8a5f203938ae1c8785a92213 HEAD
```

exit 0 (`score-rev-ancestor.exit`). HEAD is that revision, so the ancestor check is trivial.

Gate inputs, path-limited:

```text
git -C /home/vgpnk/Projects/shokunin/kumitate-shokunin status --porcelain --untracked-files=all -- scripts/readme-map.mjs .ufo/pins/readme-map.json corpus/README.md corpus/knowledge corpus/lessons
```

stdout `gate-inputs.status` empty, exit 0.

```text
git -C /home/vgpnk/Projects/shokunin/kumitate-shokunin diff --stat 5469c0a58d7986ff8a5f203938ae1c8785a92213 -- scripts/readme-map.mjs .ufo/pins/readme-map.json corpus/README.md corpus/knowledge corpus/lessons
```

stdout `gate-inputs.diffstat` empty, exit 0.

A later confirming pair used `--no-optional-locks`: `git diff --cached --stat --exit-code` exit 0, and `git diff --stat --exit-code` on the same gate-input paths exit 0. The index file mtime (`2026-10-24 21:25:16 -0300`) predates the map run (`21:30:14 -0300`).

## Assigned command

```text
node /home/vgpnk/Projects/shokunin/kumitate-shokunin/scripts/readme-map.mjs
```

| capture | bytes | note |
| --- | --- | --- |
| `readme-map.stdout` | 49 | one line, trailing newline |
| `readme-map.stderr` | 0 | empty |
| `readme-map.exit` | 2 | `0` plus newline |

sha256 (`readme-map.sha256`):

```text
bca9b8189352ee8e73d59b589bfbf82b18c156de65b74bc400ac0c17f4c25db7  readme-map.stdout
e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855  readme-map.stderr
9a271f2a916b0b6ee6cecb2426f0b3206ef074578be55d9bc94f6f3fe3ab86aa  readme-map.exit
```

Exact stdout bytes: `README_MAP: CLEAN files=141 rows=141 covered=141\n`. No `first=` field was printed.
