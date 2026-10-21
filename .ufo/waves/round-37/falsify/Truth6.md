TRUTH6 anchors=1551 false=263 delivered-nonok=186 delta=77 verdict=partial

Slice 6/8 (23 of 183 member sections, section-count split floor(i*8/183)+1 = 6; delivered tree): anchors=131 ok=79 elsewhere=20 absent=0 dead=4 noid=28 false=20. Current tree (HEAD): anchors=132 ok=84 elsewhere=21 absent=2 dead=1 noid=24 false=23.

## Measured states (git, read-only)
- Delivered tree = commit 5ceb8cd (03:14:49). FIDELITY ran at 03:21:05 on it (`.ufo/waves/round-37/final/fidelity.txt`). My universe on it: 1551 anchors, 183 member sections; per-note anchor counts equal the delivered counts for all 20 notes.
- Commit 5bc40d0 (03:31:09) reset four notes to 0614092 bytes and replaced the round-37 restoration notice with a scope-accurate one ("scope-accurate notice"); remaining-scripts-census went 484 -> 507 cites. HEAD c589b38 (03:34:49) is the current tree: 1574 anchors, dead 168. The brief's base 91da27c6 is no longer HEAD. The delivered 186 describes 5ceb8cd only.
- Pin: /fast/scratch/kumitate-r36/src @ 31c465f15669f744848bd9f5d56191c5085670f7; `git rev-parse` matches; read-only.
- Exports: `git archive 5ceb8cd corpus/knowledge` and `git archive HEAD corpus/knowledge` into /fast/scratch/kumitate-r37/Truth6/rev-5ceb8cd and rev-head. The 16 unchanged member notes are byte-identical across both states (cmp, 16/16).

## Parser (own; claims-check not imported)
Disclosure: I read claims-check `fidelityWalk` (lines 246-316) only to name the delivered classes and confirm the universe. I then wrote /fast/scratch/kumitate-r37/Truth6/truth6.py separately. It does not import claims-check.
- Universe: backticked `:N[-M]` or `path:N[-M]` whose path resolves to the section's own file, inside `##` sections whose first token is a path. Gives 1551, the delivered universe.
- Symbol (primary): nearest backticked code span in the same segment, joined gap <=14 chars, no sentence terminator; left first, then right. Wrapped prose lines join; table rows, list items and headings are breaks.
- Truth: normalized symbol, or its longest identifier as a whole word, on the cited range. dead = range outside the file. false = live and symbol not on range (elsewhere = in file; absent = not in file).
- Path token: no whitespace and (`/` or a file extension). Corrected mid-run: dotted names such as `console.log` are symbols.

## Results on the delivered tree (1551 anchors)
| measure | ok | elsewhere | absent | dead | noid | false |
|---|---|---|---|---|---|---|
| delivered FIDELITY_TOTAL | 675 | 169 | 17 | 173 | 517 | 186 |
| replica: same-line nearest any span, strict | 678 | 172 | 19 | 173 | 509 | 191 |
| replica: same-line nearest any span, lenient | 685 | 181 | 3 | 173 | 509 | 184 |
| same-line nearest symbol, lenient | 674 | 186 | 5 | 173 | 513 | 191 |
| PRIMARY: wrap-joined, lenient | 700 | 257 | 6 | 173 | 415 | 263 |
| identifier-only claims (single identifiers) | 578 | 177 | 6 | 173 | 617 | 183 |
| sentence-scope upper bound (not adopted) | 762 | 458 | 22 | 173 | 136 | 480 |
Command: `cd /fast/scratch/kumitate-r37/Truth6 && python3 verify_all.py`; figures in `summary.json`.

## Attribution 186 -> 263 (+77)
- +5 replica residual (path-token rule; its three variants give 183 / 187 / 191): replica strict 191 vs delivered 186. Per note, 16 of 20 match on ok/noid/nonok; ops-watchers (+2 nonok) and remaining-scripts-census (+3) carry the +5; distill-and-l3 and route-probe-cluster each move one ok/noid.
- -7 matching: strict verbatim -> lenient (closure rule).
- +7 pairing: nearest any span -> nearest symbol-like span.
- +72 wrap-joined pairing: noid->elsewhere 58, noid->absent 1, ok->elsewhere 13 (noid->ok 39 more).

## Failing-condition check
delta = +77 (41% of 186), above 10%. Every unit of delta is a named class boundary, and the largest is the wrap-joined pairing (+72). It is not an unexplained difference, so the item is not refuted. The 186 reproduces within 3% under its own same-line boundary (replica 184-191), so it is faithful to its rule. It is not faithful to the documented follows-a-symbol rule for the 72 wrapped anchors. Under single-identifier scoring the wrap-aware count is 183 (-2%).

## Like-for-like: 16 unchanged notes (864 anchors)
Delivered nonok 56; replica lenient 56 (exact); primary 117. Command: `python3 verify_all.py` (16-note line).

## Adjudication (primary rule, HEAD tree; pinned lines read from the pin)
Wrap-only false, 6 of 49 sampled (all six cited lines lack the claimed symbol):
- ops-watchers `:754` (compound `mkdirSync(...)`): L754 = `process.stdout.write(`; symbol nearest at 695.
- ops-watchers `:503` `ufo_socket_not_owned`: absent from the file.
- ops-watchers `:319` (compound expression): L319 = `ageMs,`; symbol at 307.
- swarm-wave-lifecycle `scripts/ufo-swarm-collect.mjs:576` `unexpected_member`: L576 is a comment; symbol at 549.
- ops-watchers `:397` `model: config.model.apiModel`: L397 = `temperature: 0.1,`; symbol at 396, one line off.
- runtime-support `lease_tests.rs:351` `acquire_for_resume`: L351 = fn header; symbol at 354.
Wrap-only ok, 3 of 20: cost-and-profile `:21-24` (L23 holds `unsupported substrate 'gemini'`), `:5-8` (L7 holds the array literal), loop-driver `state.rs:226` (L226 = `pub struct LoopState {`).
Flip ok->false, 2 of 7: loop-driver `state.rs:41`: the sentence binds `CheckpointStopReason` to :41; L41 = `pub enum LoopOutcome {`. The same-line rule scored it ok by pairing the right-hand `LoopOutcome`. ops-watchers `:418`: L418 = `schema: "the-tick-chat-result-v1",`; `advisoryOnly` sits at 322/441.
In the six sampled, the nearest occurrence of the claimed symbol is 1, 3, 12, 27 or 59 lines from the cite, or the string is absent from the file. This is consistent with pin drift from 0614092; it is not a population claim.

## Pre-repair r36 comparison
- r36 closure: 123 previously-true anchors wrong (S8 102, S4 12, S7 5, native-trial 4), measured 0614092 -> 91da27c6. The r36 gate read nonok=0 (CLEAN; anchors 1574, dead 168) (`.ufo/waves/round-36/final/fidelity.txt`).
- Four rewritten notes at the pin: delivered state 5ceb8cd primary-false 146 (delivered 130; replica 128). HEAD c589b38 primary-false 124 (replica 133).
- Magnitude: 124 now at the pin against 123 harmed in r36. The 0614092 reset restores the lines, not pin truth. Per-anchor sets not compared (different revision pairs).

## Current tree (HEAD c589b38)
1574 anchors; primary ok 761, false 241, noid 404; replica false 189 lenient / 204 strict. The delivered rule on this tree would report roughly 189-204: within 10% of 186, but stale.

## Named class boundaries
- B1 pairing scope: same physical line (delivered) vs wrapped segment (primary). +72.
- B2 matching: verbatim vs verbatim-or-longest-identifier. -7.
- B3 nearest span: any kind vs symbol-like. +7.
- B4 path-token rule (replica residual): variants 183 / 187 / 191 against 186.
- B5 universe: only backticked own-file cites are scored. 29 table-cell `:N` and 292 parenthesised `(:N)` cites in member sections sit outside both measures (coverage, not counted).
- B6 split ranges: 24 `:N`-`:M` pairs in member sections are parsed as two single-line cites by both measures (e.g. swarm `:54`-`:58`, where 56 holds RESULTS_SCHEMA).
- B7 dead boundary: no effect (173 in both).

## Verdict basis
partial. The delivered 186 reproduces under its own same-line boundary (replica 184-191; 16 unchanged notes exact at 56) and holds for single-identifier claims (183). Under the documented follows-a-symbol rule, 263 anchors are false. The gap is the wrapped class the same-line rule leaves noid; noid is 517 of 1551 (33%) and goes unscored by the delivered term.
Operability: the term is deterministic and reproducible, but it cannot be cited as anchor truth without the wrapped class. A pinned snapshot is needed, since the delivered run predates the 03:31 reset.

## Tooling and limits
- No installs or updates; python3 3.14.8 pre-existing; git read-only (archive, show, log, cat-file, status, diff). No writes to lane git/jj or production files; this report is the only lane write.
- Scratch: /fast/scratch/kumitate-r37/Truth6/ (truth6.py, verify_all.py, summary.json, snap-post0330/ with SHA256SUMS, rev-5ceb8cd/, rev-head/).
- Not verified: the 123 per-anchor list (not compared); the sentence-scope bound (not adjudicated); pin history beyond rev-parse.
