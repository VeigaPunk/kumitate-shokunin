# RevPins command index

Lane: `/home/vgpnk/Projects/shokunin/kumitate-shokunin`. Score revision: `5469c0a58d7986ff8a5f203938ae1c8785a92213`. Read-only git only. Captures in this directory.

Identity (`00-identity.txt`), captured `2026-10-24T21:35:08-03:00`:

```bash
git rev-parse HEAD
git rev-parse --verify '5469c0a58d7986ff8a5f203938ae1c8785a92213^{commit}'
git merge-base --is-ancestor 5469c0a58d7986ff8a5f203938ae1c8785a92213 HEAD
git cat-file -t '5469c0a58d7986ff8a5f203938ae1c8785a92213:.ufo/pins/readme-map.json'
git rev-parse '5469c0a58d7986ff8a5f203938ae1c8785a92213:.ufo/pins/readme-map.json'
git hash-object .ufo/pins/readme-map.json
```

Drift (`01-status.txt`, `02-diffstat.txt`):

```bash
git status --porcelain --untracked-files=all -- .ufo/pins/readme-map.json corpus/lessons/round-58-verifier-spotcheck.md corpus/lessons/round-59.md corpus/knowledge/mcp-orchestration-contract.md
git diff --stat 5469c0a58d7986ff8a5f203938ae1c8785a92213 -- .ufo/pins/readme-map.json corpus/lessons/round-58-verifier-spotcheck.md corpus/lessons/round-59.md corpus/knowledge/mcp-orchestration-contract.md
```

Pin blob (`03-pin-at-rev.json`, membership in `04-membership.txt`, numbered lines in `06-pin-lines-nl.txt`, indexes in `08-indexes.txt`):

```bash
git cat-file -p '5469c0a58d7986ff8a5f203938ae1c8785a92213:.ufo/pins/readme-map.json'
git cat-file -p '5469c0a58d7986ff8a5f203938ae1c8785a92213:.ufo/pins/readme-map.json' | nl -ba | awk 'index($0, "lessons/round-58-verifier-spotcheck.md") || index($0, "lessons/round-59.md") || index($0, "knowledge/mcp-orchestration-contract.md")'
```

File existence (`05-files.txt`, `07-file-identity.txt`, `09-hash-object.txt`):

```bash
git ls-tree 5469c0a58d7986ff8a5f203938ae1c8785a92213 -- corpus/lessons/round-58-verifier-spotcheck.md corpus/lessons/round-59.md corpus/knowledge/mcp-orchestration-contract.md
git cat-file -t '5469c0a58d7986ff8a5f203938ae1c8785a92213:<path>'
stat -c 'mode=%f type=%F size=%s links=%h' <path>
sha256sum <path>
git hash-object <path>
git rev-parse '5469c0a58d7986ff8a5f203938ae1c8785a92213:<path>'
```
