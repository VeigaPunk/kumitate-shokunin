# ScoutS125Live evidence index

Primary hashed body: `live.body` (copy of the temp file). Temp path: `tmp.path`.

1. Primary fetch, exact item command, stdout redirected to the temp file. Exit `curl.exit`. Stderr `curl.stderr` (empty). Clock `access-date.before.txt` / `access-date.after.txt` and the UTC pair.
   `curl -fsSL https://modelcontextprotocol.io/docs/2026-07-28/learn/architecture`
2. `sha256sum` of the temp file: `live.sha256.txt`. Byte count: `live.bytes.txt`.
3. Score-revision pin object: `git show 5469c0a58d7986ff8a5f203938ae1c8785a92213:.ufo/pins/source-captures.json` → `pin-at-rev.json`, S125 object `pin-at-rev.s125.txt`. `git grep` of the named hash at that rev: `pin-grep.txt`.
4. Read-only hash of the pin path `.ufo/waves/round-59/build/ScoutMcpArch/body.html`: `stored-capture.sha256.txt`.
5. Re-hash and string compare: `02-rehash-tmp.stdout`, `03-rehash-evidence.stdout`, `04-compare.stdout`.
6. `cmp` live vs stored and live vs temp: `05-cmp.stdout`. `git show` of the pin-path blob at the score revision, then `sha256sum` and `cmp`: `06-committed.sha256.txt`, `06-cmp-committed.exit`.
7. Identity strings from `live.body`: `07-identity.stdout`. The `nul=no` line is not evidence. The probe searched for the four characters `\x00`, not a NUL byte. Title, canonical, and `protocolVersion` lines are the ones used.
8. Separate second fetch, not the hashed primary body: `08-headers.raw`, `08-curl-w.stdout`, `08-body2.sha256.txt`.
