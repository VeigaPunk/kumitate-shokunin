# MutGhost evidence index

Lane-relative paths under `.ufo/waves/round-59/build/MutGhost/`. Fixtures the gate read live only in `/tmp/kumitate-r59-MutGhost/`.

- `00-clock.txt` — `2026-10-25T00:38:18Z`
- `01-rev-parse.*` — HEAD `5469c0a58d7986ff8a5f203938ae1c8785a92213`, exit 0
- `02-ancestor.exit` — ancestor check exit 0
- `03-hash-object.*` / `04-blob.*` — both `d256297dacdb89a540ea82373657ec4696083d13`, exit 0
- `05-wt.sha256` / `06-blob.sha256` — both `7211be845cd994e6dc3bf1b1ed821a0464d9aa1cce6f4695412095a9fc2921a6`
- `08-diff.exit` / `15-diff-after.exit` — `git diff --exit-code` against the score revision, both 0
- `14-status-after.stdout` — empty; `14-status-after.exit` is 0
- `readme.fixture.md` / `sources.fixture.md` — copies of the `/tmp` bytes the assigned command read
- `16-sources-s121.*` — SOURCES has no S121 (exit 1, stdout 0 bytes). Not `13-sources-s121.exit`.
- `17-sources-s112.*` — SOURCES row `3:| S112 | example |`, exit 0
- `18-readme-s121.*` — README map row cites S121, exit 0
- `cite-sources.stdout` / `cite-sources.exit` — first assigned run, exit 1
- `20-assigned.command` / `20-assigned.pwd` / `20-assigned.stdout` / `20-assigned.stderr` / `20-assigned.exit` / `20-assigned.wc` — cited rerun, cwd `/tmp`, same stdout (`cmp` exit 0)
- `control-clean.*` / `readme-s112-only.fixture.md` — not the assigned command
