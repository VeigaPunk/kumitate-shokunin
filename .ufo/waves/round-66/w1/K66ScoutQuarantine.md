VERDICT: Both deprecation-theme quarantine rows (S109, S129 — modelcontextprotocol.io 2026-07-28 pages) re-fetched live read PRESENT with the register's quotes located verbatim; the other seven slice rows carry round-65's verdict (round-63's 9/9 PRESENT) by pointer.

## Evidence

Slice (9 rows; byte-checked same as round-65's):
`wc -l .ufo/waves/round-66/assimilation/quarantine-slice .ufo/waves/round-65/build/K65ScoutQuarantine/quarantine-slice` → 9 and 9.

Register rows attacked (read-only): `/home/vgpnk/Projects/shokuknow/.ufo/waves/corpus-expansion-1/absent-defect-register.md` — kumitate S109 (architecture page, `payload-absent`), S129 (blog 2026-07-28, `payload-absent`); S116/S118/S142 (`payload-absent`), S143/S144/S145/S178 (could-not-fetch).

Live fetches (curl -sSL, 2026-10-27):
- S109: `curl ... 'https://modelcontextprotocol.io/docs/2026-07-28/learn/architecture'` → `HTTP 200 bytes 681275`; sha256 `a9917b694a3dd33eb3cc412ebc77c287622906a3999e5029bbaf04afd0535a6b`.
  `grep -o 'Every client request carries[^<]*' s109-architecture.html` → 3 hits, incl.:
  "Every client request carries the `io.modelcontextprotocol/protocolVersion` and `io.modelcontextprotocol/clientCapabilities` fields in `_meta`, and normally `io.modelcontextprotocol/clientInfo` as well, so the server can identify the client without relying on connection state." (backtick code spans = page's compiled-MDX payload; rendered `<code>`).
- S129: `curl ... 'https://blog.modelcontextprotocol.io/posts/2026-07-28/'` → `HTTP 200 bytes 133679`; sha256 `9e3c347f359baa66725fffe8e88f348299905d236dea320cd8457e8c4619e520`.
  `grep -o 'With the new spec version[^\\]*' s129-blog-2026-07-28.html` → 2 hits, incl.:
  "With the new spec version, we've officially retired the initialize/initialized exchange along with the Mcp-Session-Id header (refer to SEP-2575, SEP-2567)." — U+2019 curly apostrophe in "we've", under the "No handshake or sessions" heading.

Carried verdict pointers:
- `grep -n quarantine corpus/lessons/round-65.md` → lines 110-116: nine ids, round-63 hand-check 9/9 PRESENT, no row appended, stray-backtick artefact note.
- Round-63 verdict table `.ufo/waves/round-63/build/K63ScoutQuarantine/quarantine-verdicts.md`: S109 architecture.md:463 exact; S129 PRESENT (U+2019); S116 PRESENT v3 / ABSENT v1,v2; S118 PRESENT (LaTeX tarball); S142 PRESENT at types.ts:181; S143/S144/S145 PRESENT measured at 093edb9; S178 PRESENT via aaron.
- `corpus/lessons/round-61.md:28`: register↔lane id mapping by URL/DOI only (register S109↔lane S125, S118↔lane S134, S178↔lane S194); S116 absent-verdict superseded on version grounds.

## Findings

K66ScoutQuarantine-1 (info, attacks the register's `payload-absent` label on deprecation-theme row S109): quote PRESENT in the live page. The register's checker missed it across the page's compiled-MDX code-span folding — a checker artefact, not fabrication. Repro: fetch URL, `grep -o 'Every client request carries[^<]*'`.

K66ScoutQuarantine-2 (info, attacks the register's `payload-absent` label on deprecation-theme row S129): quote PRESENT verbatim (with U+2019) in the live post. Same artefact class as round 63 found. Repro: fetch URL, `grep -o 'With the new spec version[^\\]*'`.

K66ScoutQuarantine-3 (info, coverage carry): the seven non-deprecation rows (S116, S118, S142, S143, S144, S145, S178) carry round-65's verdict unchanged — round-63's document-identity hand-check read 9/9 PRESENT, 0 ABSENT, 0 UNVERIFIABLE; none adopted into corpus/SOURCES.md; pointers recorded per row in `build/K66ScoutQuarantine/verdicts.md`.

No counter/control defects found; nothing frozen was touched.

## Artifacts

- `build/K66ScoutQuarantine/verdicts.md` — full verdict table, theme split, located text, hashes, carried pointers.
- `build/K66ScoutQuarantine/s109-architecture.html` — live capture, 681,275 B, sha256 a9917b694a3dd33eb3cc412ebc77c287622906a3999e5029bbaf04afd0535a6b.
- `build/K66ScoutQuarantine/s129-blog-2026-07-28.html` — live capture, 133,679 B, sha256 9e3c347f359baa66725fffe8e88f348299905d236dea320cd8457e8c4619e520.

## Limits

Did not re-run the seven non-deprecation rows' measurements (seat spec: carry with pointer only). Did not consult the shokuknow campaign tools (read-only repo; register bytes only). Did not check the staged round-66 deprecation pages (S207+) against these two captures — that is C2's counter domain, not the quarantine slice. Slice id space is the register's, not the lane's; no lane row was matched by id.
