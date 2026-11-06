# Round-93 province amendment — draft for `PROVINCE.md`

Insertion: append the paragraph below at the end of `/home/vgpnk/Projects/shokunin/kumitate-shokunin/PROVINCE.md`
(after line 58, the current EOF). Dated addition only; the bands above stand unchanged.

Glossed lines (measured at the round-93 freeze `b6204949`): `PROVINCE.md:16` — "Member **content** stays out
of scope by design (readdir + lstat only)."; `PROVINCE.md:57-58` — "Unchanged and binding: member content of
`~/.omp/agent` is out of scope (readdir + lstat only), and the OMP live root is read only through an explicit
live read." Receipt: `K93ScribeLesson/receipts/province-lines.txt`.

---

Round-93 province amendment (2026-11-06; the bands above stand unchanged, dated addition only): **seat
transcripts under `~/.omp/agent/sessions/<cwd>/<orchestrator-session>/<Seat>.jsonl` are read by content** by
the lane's own instrument `scripts/seat-route.mjs` (contracts `kumitate-seat-route-v1`, round 92, and
`kumitate-seat-route-v2`, round 93): per seat it reports the captured route, the answering turns, the retry
fields, the final state and a redacted last error. The read is read-only, and its output is redacted (runs of
24 or more characters from `[A-Za-z0-9_-]` become `<redacted>`, first line, 120-character cut); a transcript
is never copied into the lane — a citation is path plus sha256 and at most the fields a claim needs. This
paragraph glosses the two "member content stays out of scope (readdir + lstat only)" sentences at
`PROVINCE.md:16` and `PROVINCE.md:57` as scoped to the **depth-1 member set** of `~/.omp/agent`, and that
bound is unchanged: `scripts/omp-census.mjs` still reads names, kinds and permission bits only, and no census
surface reads content. The `sessions/` subtree is an input to a named instrument, not a widening of the
census and not a live read of the OMP root — that root still requires an explicit live read. Redaction is
shape-based, not a secret scanner; its limits are recorded in
`corpus/knowledge/seat-route-from-session-transcripts.md` (v1) and
`corpus/knowledge/seat-route-retry-fields.md` (v2). Adjacent and unchanged: report-pointer resolution stays
kotoba's, MCP/OAuth practice stays kasegi/kagi's, local model serving stays kama's.
