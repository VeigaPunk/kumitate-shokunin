# ExecCiteLive evidence index

Observed 2026-10-24T21:30:13-03:00. node v26.12.0. git version 2.56.0.
Lane: /home/vgpnk/Projects/shokunin/kumitate-shokunin
Score rev named by the wave: 5469c0a58d7986ff8a5f203938ae1c8785a92213

Assigned gate cwd is the lane. The script defaults are relative (`corpus/README.md`, `corpus/SOURCES.md`); `resolve()` is against `process.cwd()`.

## Assigned

1. `node /home/vgpnk/Projects/shokunin/kumitate-shokunin/scripts/cite-sources.mjs`
   cwd: lane (`cite-sources.pwd`)
   stdout: `cite-sources.stdout` (30 bytes) `CITE_SOURCES: CLEAN cited=149`
   stderr: `cite-sources.stderr` (0 bytes)
   exit: `cite-sources.exit` = 0

2. `git -C /home/vgpnk/Projects/shokunin/kumitate-shokunin grep -n S121 -- corpus/README.md`
   stdout: `grep-s121.stdout` (0 bytes)
   stderr: `grep-s121.stderr` (0 bytes)
   exit: `grep-s121.exit` = 1

## Binding (read-only)

- `git rev-parse HEAD` → `head.stdout` = `5469c0a58d7986ff8a5f203938ae1c8785a92213`, `head.exit` = 0
- `git rev-parse --verify 5469c0a58d7986ff8a5f203938ae1c8785a92213^{commit}` → `score-rev.stdout` same hash, `score-rev.exit` = 0
- `git merge-base --is-ancestor 5469c0a58d7986ff8a5f203938ae1c8785a92213 HEAD` → `score-ancestor.exit` = 0, empty stdout
- `git diff --exit-code 5469c0a58d7986ff8a5f203938ae1c8785a92213 -- scripts/cite-sources.mjs corpus/README.md corpus/SOURCES.md` → `diff-score-gate-inputs.exit` = 0, empty stdout and stderr
- `git status --porcelain --untracked-files=all -- scripts/cite-sources.mjs corpus/README.md corpus/SOURCES.md` → `status-gate-inputs.exit` = 0, empty stdout and stderr

## Controls (not substitutes for the assigned commands)

- Same node argv with cwd `/home/vgpnk/Projects/shokunin` (session default, not the lane): `cite-sources-fleet-cwd.stdout` = `CITE_SOURCES: FAIL-CLOSED reason=README_UNREADABLE`, stderr empty, `cite-sources-fleet-cwd.exit` = 2. That process does not read the lane corpus.
- `grep -n S121 -- corpus/README.md` from the lane: `grep-plain-s121.stdout` 0 bytes, stderr 0 bytes, `grep-plain-s121.exit` = 1.
- Recount of map-row `S` + 3-or-more-digit tokens against SOURCES.md row ids, same rule as `scripts/cite-sources.mjs`: `recount.stdout` = `recount cited=149 mapRows=142 registryIds=126 ghosts=0 first=none s121cited=false s121registry=false`, `recount.exit` = 0.
- `git help grep` (Git 2.56.0) has no EXIT STATUS section. Nearest wording is the `-q` option: exit 0 when there is a match and non-zero when there isn't. The assigned grep was not `-q`. The no-match reading is the empty stdout plus exit 1, cross-checked by the plain grep.

No production file, ledger, corpus file, pin, jj state, or Git index was written. No install, pacman, commit, push, or mutating git/jj command.
