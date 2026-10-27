VERDICT: The staged append's numbering is unsafe against the frozen lane — 12 staged ids (S195-S206) are live lane ids holding different documents, the guard's MERGE-REPORT is stale (claims 133 lane rows vs 145, misses 2 of 10 URL duplicates, has no renumber step), and the 22 staged deprecation-theme rows reduce to 15 lane-new documents that map cleanly onto S207-S221 but cannot be cited by the C2 entry as-is (all opened 2026-10-24 vs the frozen counter's 2026-10-27, two without a URL cell, 20 with escaped pipes that break the counter's cell count).

## Evidence

- Lane registry re-derived at the freeze (`git -C <lane> show 621212bac37f8249c72ac982d1d6534cb8d60701:corpus/SOURCES.md`; working tree byte-identical — verified) with the pattern `^ {0,3}\|[[:space:]]*S[0-9]{3,}`: 145 rows, S001..S206, max id **S206**, no dup ids, 61 gaps, one physical-order inversion (S136@139 → S126@140). At base `8d557f85`: `grep -cE '^\| S20[1-6]\b'` → **6** (S201-S206 exist at base; next free id = S207 at base and freeze).
- Staged `SOURCES.append.md`: 155 rows, S195..S349 contiguous, no dup ids. Merger report header: "lane registry currently holds 133 rows" — stale (truth 145/S206).
- Collision list (script output, all `sameDoc=false` — same id, different document in every case): S195, S196, S197, S198, S199, S200, S201, S202, S203, S204, S205, S206 ↔ lane rows at lines 147-158 (e.g. staged S195 = MCP architecture page vs lane S195 = Temporal worker-versioning; staged S206 = Zenn article vs lane S206 = OMP http.ts).
- URL document duplicates (staged row URL already a lane row under another id), 10: S195→S125, S196→S117+S126, S197→S127, S201→S131, S205→S135, S206→S136, S217→S195, S260→S190, S264→S194, S291→S199. MERGE-REPORT lists only 8 (misses S217, S291).
- URL-invisible same-document cases: staged S202 (`arxiv.org/abs/2512.08296`) = lane S197 (`arxiv.org/html/2512.08296v3`), and S202's scope asserts "no scaling-law row" — false at the freeze; staged S232 (commit page) = lane S203 (same commit's `.patch`); staged S204 (row 10) = S211 (row 17), same URL twice in the append.
- Theme documents (7 files under `merge/kumitate/knowledge/corpus/knowledge/`) cite 22 distinct staged rows = 15 documents after per-document dedupe; none of the 15 URLs exists in the lane registry.
- Frozen counter `deprec66-probe.mjs` (read, not modified): `const OPENED = '2026-10-27'`; M2 requires every cited id absent at base, 13 cells, `mined`, `opened=2026-10-27`, used-by the entry, URL, tier A/B; M1 parses ids from `source:` lines in the entry's first 14 lines; M7 needs the bearing section to name `\bS20[1-6]\b` + `roots` + `HTTP+SSE` and a cited row whose URL carries `/v18.12.6/` and ends `sse.ts`.

## Findings

1. **K66ReviewQuarantineRows-1 (HIGH)** — 12 staged ids collide with live lane rows, each holding a different document. A verbatim append redefines 12 lane rows and corrupts every citation, including the plan's M7 anchor rows S201-S206. Reproduce: `node derive2.mjs` (receipt `derive-out.json`, `.idCollisions`, 12 entries, `sameDoc=false` ×12).
2. **K66ReviewQuarantineRows-2 (HIGH)** — the guard's MERGE-REPORT is stale and its adopt checklist lacks a renumber step: claims 133 lane rows (truth 145), lists 8 URL dups (truth 10), and step 3 says "Append SOURCES.append.md to corpus/SOURCES.md" with no id remap. Reproduce: read `merge/kumitate/MERGE-REPORT.md` header + dup table vs `derive-out.json`.
3. **K66ReviewQuarantineRows-3 (MEDIUM)** — staged rows S207-S232 occupy exactly the id range the round reserves for the C2 entry ("prepared ids S207 upward"); no staged row may keep its id, and S207+ belongs to the entry's rows first.
4. **K66ReviewQuarantineRows-4 (MEDIUM)** — none of the 22 staged theme rows can be cited by the C2 entry as-is: all `mined/2026-10-24` vs the counter's `opened=2026-10-27`; S304/S320 have no URL cell (M2/M5 `no-url`); every cited id must be absent at base and capture-bound (M3). The entry must re-open the 15 documents on 2026-10-27 into fresh rows; the by-document map allocates their ids.
5. **K66ReviewQuarantineRows-5 (MEDIUM)** — 20 of the 22 theme rows carry an escaped `\|` in a cell; the frozen counter splits cells on every `|` (`cells()`, then `c.length !== 13`), so those rows read as NF=14. Fresh rows must keep every cell pipe-free; adapt the data, never the frozen counter.
6. **K66ReviewQuarantineRows-6 (LOW)** — inline campaign ids in staged texts mis-resolve against the lane: the theme entry cites "S130 and S131" (lane S130 = gap, S131 = Aliyun row); staged S218 cites "round-2's S117" (lane S117 = Temporal page); S240/S245/S249/S253 cite S148/S147/S146/S160 — all lane gaps. Adopted texts need inline remapping.
7. **K66ReviewQuarantineRows-7 (LOW)** — URL-invisible document duplicates (S202=S197 paper, S232=S203 commit, S204=S211 intra-append) show URL equality alone is an insufficient guard; dedupe must be by document identity (same paper/commit/registry page), at least for rows bound to a claim.

Renumber map (15 documents → S207..S221, next free S222; "=" = same document, admit one, cite for all): S207←S233=S319; S208←S234=S242=S314; S209←S273; S210←S274; S211←S240; S212←S241=S334; S213←S243=S317; S214←S244=S318; S215←S303; S216←S304=S320; S217←S305; S218←S306; S219←S315; S220←S316; S221←S321. The entry additionally needs staged-absent rows (at minimum `sse.ts` at `/v18.12.6/`, plus the `roots` declaration) which take S222+ or displace the map's head if the L1 seats M7's rows first.

## Artifacts

- /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-66/build/K66ReviewQuarantineRows/review.md (full derivation, tables, map)
- .../build/K66ReviewQuarantineRows/derive-out.json (machine-readable: lane stats, 12 collisions, 10 URL dups, map)
- .../build/K66ReviewQuarantineRows/derive2.mjs, check3.mjs (derivation scripts, re-runnable)

## Limits

- Did not re-open any of the 155 staged sources; this is an id/URL/document-level registry review, not a source-verification pass.
- URL comparison is exact after normalization (case, fragment, trailing slash); same-document-different-URL detection was manual and may be incomplete beyond the three cases found.
- Did not run the frozen counters or any lane scripts (no claim to count, no lane mutation); no git/jj state touched; scratch under /fast/scratch/hyaku/kumitate-r66/K66ReviewQuarantineRows/ deleted after receipts were copied into the build dir.
