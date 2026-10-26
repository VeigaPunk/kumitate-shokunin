VERDICT: S198 holds on every located quote, the hash/pin and the anchor, but two row/entry wording cells are off: the "8572 chars" figure is not reproducible under the frozen norm() (it reads 8602), and the teaches cell's "of the lock-free design" is not the page's wording ("in").

## Evidence
Tree: lane 2ed8a5f8 (read-only). Scratch: /tmp/kumitate-r64/K64R2ScoutQuotesS198/ (q.mjs reuses the frozen norm() from probe/jj64-probe.mjs:56-64 verbatim).
- `curl -sSL -A 'Mozilla/5.0 (kumitate-r64)'` of v0.46.0, latest, v0.45.1 `/technical/concurrency/`: all http=200, no redirect (url_effective unchanged).
- `sha256sum` of all three fetches AND the capture .ufo/waves/round-64/build/Capture/jj-v0.46.0-technical-concurrency.html: all `5e2f757641748faf15df032f51e14435ddd579b13c30ab54fea0d40ce2e00bf6`, all 48988 bytes. Pin .ufo/pins/source-captures.json:208-212 (S198) = same sha256 and bytes 48988, captured 2026-10-25. MATCH.
- https://docs.jj-vcs.dev/versions.json: `v0.46.0` carries `"aliases": ["latest"]`; v0.45.1 has none. Row's alias claim MATCHES. `jj --version` → `jj 0.45.1-7c41cdeb16b6b321c64e789a966b6adf723816a5` (host cell MATCHES).
- Page `<title>` = `Concurrency - Jujutsu docs` (row source cell MATCHES).
- Frozen-norm text of capture / v0.46.0 / latest / v0.45.1: equal strings (`norm equal true`), length 8602 each.
- Quote table (occurrences in frozen-norm text; words = space-split count):
  | # | quote start | words | capture | live latest | live v0.46.0 | live v0.45.1 | heading |
  |---|---|---|---|---|---|---|---|
  | 1 | "That is what allows us to detect and merge divergent operations." (also the round-64.md Gate quote) | 11 | 1 | 1 | 1 | 1 | h2 Operation log, para 1 |
  | 2 | "The operation log is normally linear. It becomes non-linear if there are divergent operations." | 14 | 1 | 1 | 1 | 1 | h2 Operation log, para 2 (last two sentences) |
  | 3 | "When a command starts, it loads the repo at the latest operation." | 12 | 1 | 1 | 1 | 1 | h2 Operation log, para 3 (first sentence) |
  | 4 | "The view object contains the set of visible head commits, bookmarks, tags, and the working-copy commit in each workspace." | 19 | 1 | 1 | 1 | 1 | h2 Operation log, para 2 |
  All <=25 words. Entry bullets: corpus/knowledge/jj-workspace-seat-containment.md:107-110.
- Raw HTML: `<h2 id="operation-log">` is followed by exactly three `<p>` before a fourth (`--at-operation`) and `<h3 merging-divergent-operations>`. So "§ Operation log, its first three paragraphs" covers all four quotes; the row's teaches content (log detects/merges divergent ops; view holds heads/bookmarks/tags/working-copy commit per workspace; command loads at latest op, sees no later changes; operation cannot fail to commit) is all in paras 1-3. MATCH.
- Gate location cell: K64ScribeGateRecord/captures/jj-technical-concurrency.txt:168 `Operation log`, :170 "…is the "operation log". That is", :171 "what allows us to detect and merge divergent operations." → `:170-171` correct.
- `grep -c -F 'The most important piece in the lock-free design'` on the live v0.46.0 page and on the capture → 1 and 1 (SOURCES.md:156 recheck note MATCHES).
- `node scripts/sources-check.mjs` → `SOURCES_CHECK: CLEAN (rows=139 …)` exit 0, no S198/S199/S200/round-64 line.
- Row cells: kind docs, tier A, status mined, opened 2026-10-25, recheck 180d, 11 columns = header's 11. OK.

## Findings
K64R2ScoutQuotesS198-1 (low, row cell 7 "anchor"): "normalised text equals the v0.45.1 rendering (8572 chars both, measured 2026-10-25)" — equality is TRUE (indeed the three fetches are byte-identical, 48988 B, same sha256), but 8572 is not what the frozen norm() gives: 8602. Repro: `cd /tmp/kumitate-r64/K64R2ScoutQuotesS198 && node q.mjs | head -5` → `cap normLen 8602 … norm equal true`. 8572 appears only when the six `&para;` entities are also mapped to one char `¶` (my probe: `len with para->¶ 8572`; with them deleted 8560). The figure is therefore a different norm than the cited counter's. Exact replacement for the clause: `whose text is byte-identical to the v0.45.1 rendering (48988 bytes, sha256 5e2f7576…0bf6, measured 2026-10-25)`. (A byte statement is norm-independent and needs no char count.) Not caught by the frozen probe (it never checks that number).
K64R2ScoutQuotesS198-2 (low, row cell 8 "teaches"): `the operation log is the most important piece of the lock-free design` is a paraphrase; the page says `The most important piece in the lock-free design is the "operation log".` ("in", and the sentence is inverted). Not in quotation marks, so not a forgery, but it looks like one beside the SOURCES.md:156 recheck grep which uses the page's own words. Replacement: `the "operation log" is "the most important piece in the lock-free design" and is what lets divergent operations be detected and merged`.
K64R2ScoutQuotesS198-3 (info, cell 8): "so a seat's commit is visible from every workspace while its working copy stays per-workspace" and entry :50 "every workspace's snapshots land in it" are inferences from the view-object sentence, not page text; the page never says snapshots. Mark `[INFERENCE]` in the entry or cite the demo key `seat_snapshot_in_shared_op_log`. No replacement needed in the row if left as the row's own gloss.
K64R2ScoutQuotesS198-4 (info, cell 12 used-by): S198's used-by names only the entry; corpus/lessons/round-64.md cites S198 (7 hits, Gate table) but is not listed, unlike S195-S197 whose used-by include their round lessons. sources-check is CLEAN on it (no asymmetry rule fires for lessons), so this is hygiene only: append `, corpus/lessons/round-64.md` to the used-by of S198-S200 (allowed: used-by is a mutable column, Q35).
No quote mismatch, no hash mismatch, no word-count breach, no heading mismatch.

## Artifacts
- /tmp/kumitate-r64/K64R2ScoutQuotesS198/{v0.46.0,latest,v0.45.1}.html, versions.json, q.mjs (scratch only; nothing in the build dir).

## Limits
- Did not run the frozen jj64-probe.mjs end to end (the wave facts give 8/8); I re-implemented only its norm() and the includes() test. Did not audit S199/S200 rows or the other claims of the entry beyond S198. Fetched from one host/UA at one time; "latest" may later move to v0.47 (the row already cites the immutable path). Did not verify the 180d recheck interval policy.
