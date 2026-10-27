VERDICT: `readme-map` requires exactly two round-66 rows + pins (`knowledge/mcp-deprecation-registry.md`, `lessons/round-66.md`) — `corpus/routed-ledger.md` lies outside the gate's `knowledge|lessons` scope, so it needs neither and is unratcheted (draft rows + pin patch CLEAN 162/162/162 in a scratch clone).

## Evidence

All runs in scratch clone `/fast/scratch/hyaku/kumitate-r66/K66ExecReadmeRows/lane`
(`git clone --shared`, `git rev-parse HEAD` = `88041bc9f45b06560bbd807bd1ea7b44126aa49f`; `git diff 621212ba HEAD -- scripts/readme-map.mjs corpus/README.md .ufo/pins/readme-map.json` empty,
so HEAD's gate bytes == the freeze). Receipts copied to `build/K66ExecReadmeRows/`.

1. Baseline at freeze HEAD (gate CLEAN, 160/160/160) and the tool's selftest:
```
$ node scripts/readme-map.mjs
README_MAP: CLEAN files=160 rows=160 covered=160      exit=0
$ node scripts/readme-map.mjs --selftest
README_MAP_SELFTEST: PASS (16/16)   VERDICT: PASS      exit=0
```
2. Three stub files added (`corpus/knowledge/mcp-deprecation-registry.md`, `corpus/lessons/round-66.md`, `corpus/routed-ledger.md`):
```
README_MAP: note uncovered:lessons/round-66.md
README_MAP: note unpinned:knowledge/mcp-deprecation-registry.md
README_MAP: note unpinned:lessons/round-66.md
README_MAP: DRIFT files=162 rows=160 covered=160 bad=4 first=uncovered:knowledge/mcp-deprecation-registry.md   exit=1
```
`files=162` = 160 + **2**: the corpus-root `routed-ledger.md` is not counted at all. (`02-drift-three-stubs.txt`)
3. The gate cannot be told to cover the root: `node scripts/readme-map.mjs --corpus …/lane/corpus` →
`README_MAP: FAIL-CLOSED reason=corpus dir outside the covered namespace (want knowledge|lessons)` **exit 2** (`03-…`).
4. Root-level pin refused: appending `"corpus/routed-ledger.md"` to `covered` →
`README_MAP: FAIL-CLOSED reason=covered entry malformed: "corpus/routed-ledger.md"` **exit 2** (`07-root-pin-rejected.txt`).
5. Root-level README rows are silently ignored: with `| `corpus/routed-ledger.md` | … |` and `| corpus/routed-ledger.md | … |` in the table the only new finding is `format-unmapped` from the deliberately unbackticked `| knowledge/… |` probe — `rows=160` unchanged (`04-root-row-probes.txt`).
6. Rows without pins still DRIFT: `README_MAP: DRIFT files=162 rows=162 covered=160 bad=2 first=unpinned:knowledge/mcp-deprecation-registry.md` exit 1 (`06-…`).
7. Draft rows (real text for this round) + two pins appended → `README_MAP: CLEAN files=162 rows=162 covered=162` **exit 0** (`10-clean-real-rows.txt`, `13-…`); `docs` patch `build/K66ExecReadmeRows/09-draft-rows-and-pins.patch` = 5 insertions / 1 deletion over the two files.
8. Unguarded deletion: `rm corpus/routed-ledger.md` with every row and pin in place → still `README_MAP: CLEAN files=162 rows=162 covered=162` exit 0 (`14-root-file-deleted-still-clean.txt`).
9. `cite-sources` coupling (same clone): row citing `S207` before its SOURCES row →
`CITE_SOURCES: DRIFT ghosts=1 first=S207` exit 1; after one stub `| S207 | … |` row → `CITE_SOURCES: CLEAN cited=199` exit 0 (`11-`, `12-`).
10. `plan-before-ready.sh --round 66 --rev HEAD` (read-only, TMPDIR in scratch):
`PLAN_BEFORE_READY: PASS rev=88041bc9… plan=621212ba… map=CLEAN files=160 rows=160 covered=160`, `pass=1 fail=0` exit 0.
11. Freeze corpus census: `SCORECARD.md:292 C2=156`, `:293 C2_total=156`, base `proxy-before.txt` computed `C2=159 C2_total=160`; freeze tree is 160/160 (`readme-map` CLEAN).

## Findings

**K66ExecReadmeRows-1** (medium — attacks the ratchet the plan leans on). `corpus/routed-ledger.md` is outside both gates:
`readme-map` walks only `corpus/knowledge`+`corpus/lessons` (`scripts/readme-map.mjs:19` `DEFAULT_DIRS`, `:20` `COVERED_RE = /^(knowledge|lessons)\/…/`), and `proxy-check`'s `C2_total` walks the same two dirs (`scripts/proxy-check.mjs:443`, `:707-712`). Consequence: after round 66 closes, the C1 data file can be deleted or emptied with **no** gate noticing (`14-root-file-deleted-still-clean.txt`) — only the round-66-frozen L66 counter would have, and it is not a standing gate. The gate also cannot be pointed at the root (`03-…`, exit 2) and cannot pin it (`07-…`, exit 2); a README row naming it is silently ignored (`04-…`). Reproduce:
`cd <clone>; printf '# stub\n' > corpus/routed-ledger.md; node scripts/readme-map.mjs` → CLEAN 160/160/160. Fix (L1's call, plan-path change): land the ledger at `corpus/knowledge/routed-ledger.md` (+ row + pin, exactly like the other two files) — then the ratchet covers it; otherwise accept and state in the lesson that C1's data is guarded only by its own frozen counter.

**K66ExecReadmeRows-2** (low — integration ordering). The C2 row cites `S207`; `scripts/cite-sources.mjs` scans every `| ` line of `corpus/README.md` and demands the id exist as a `| S### |` row in `corpus/SOURCES.md`. Row landing before the SOURCES rows ⇒ `CITE_SOURCES: DRIFT ghosts=1 first=S207` exit 1 (`11-…`). Land SOURCES rows + captures + README row + pin in one commit; the row also cites "`S207` and up", which stays valid whatever the final count ≥ 3 is, but `S207` itself must be the first new row (plan: "prepared ids S207 upward"). Reproduce: apply `09-draft-rows-and-pins.patch` alone in a clean clone and run `node scripts/cite-sources.mjs`.

**K66ExecReadmeRows-3** (low — close obligation). The two new files move the corpus census 160 → 162, so the `## Claim block` stanza's `C2=` **and** `C2_total=` must both be 162 at the close (they read 156/156 now, computed 159/160 at base — carried D4). A half-update is two findings (`C2_DRIFT`, `C2_TOTAL_DRIFT`); `coverage` itself is unchanged (both terms +2). Reproduce at the close: `node scripts/proxy-check.mjs` and compare `C2`/`C2_total` lines against `find corpus/knowledge corpus/lessons -name '*.md' | wc -l`.

**K66ExecReadmeRows-4** (low — false reassurance from a green gate). `plan-before-ready.sh`'s readme-map arm judges **only the PLAN commit**; for round 66 it prints `map=CLEAN files=160 rows=160 covered=160` (evidence 10) and will keep printing that after the merge commit lands two corpus files, so a forgotten row is invisible to it. The close must run `node scripts/readme-map.mjs` on the merge commit itself.

**K66ExecReadmeRows-5** (informational — display, not scoring). On DRIFT the gate prints `bad.slice(1)` as `README_MAP: note …` (`scripts/readme-map.mjs:257`), so the first finding appears only in the `first=` field of the verdict; an operator grepping the notes line misses `uncovered:knowledge/mcp-deprecation-registry.md` in evidence 2. `bad=` and the verdict are correct; reported, not patched (frozen-adjacent tool, L1-owned).

## Artifacts

- `.ufo/waves/round-66/w1/K66ExecReadmeRows.md` (this report)
- `.ufo/waves/round-66/build/K66ExecReadmeRows/README-rows-draft.md` — scope table, the two real 3-cell rows, the pin append, the four integration constraints
- `.ufo/waves/round-66/build/K66ExecReadmeRows/09-draft-rows-and-pins.patch` — uncompiled patch against the lane tree (corpus/README.md + .ufo/pins/readme-map.json only)
- receipts `02-drift-three-stubs.txt`, `03-corpus-root-failclosed.txt`, `04-root-row-probes.txt`, `05-clean-after-rows-and-pins.txt`, `06-rows-without-pins.txt`, `07-root-pin-rejected.txt`, `08-clean-restored.txt`, `10-clean-real-rows.txt`, `11-cite-sources-before-sources-row.txt`, `12-cite-sources-with-sources-row.txt`, `13-clean-with-sources-stub.txt`, `14-root-file-deleted-still-clean.txt`
- scratch `/fast/scratch/hyaku/kumitate-r66/K66ExecReadmeRows/` deleted before yield; no receipt cites it as evidence

Draft rows (verbatim, for integration):

```
| `knowledge/mcp-deprecation-registry.md` | The MCP deprecation registry and its clocks (round 66, `S207` and up; re-grounded, never copied): the 2026-07-28 Deprecated Features page captured and mirrored row-for-row in `## Registry snapshot` (every captured row's `Deprecated in` and `Earliest removal` cell), so the two clocks read as stated — HTTP+SSE "Three months after SEP-2596 reaches Final", Roots "First revision released on or after 2027-07-28"; the feature-lifecycle policy that makes a deprecation a state, not a date; read against the host in `## Bearing on the installed OMP release`: the installed release ships `transports/sse.ts` at `/v18.12.6/` and declares the `roots` client capability, so both deprecated surfaces are live bytes, not history; judged by frozen M66 M1–M8 (`DEPREC66_HELD`) | `S207` and up in `corpus/SOURCES.md` (rows opened 2026-10-27, each bound to a committed capture); the staged assimilation theme in `merge/kumitate/` |
| `lessons/round-66.md` | Round-66 (one v2 wave, build and attack together): `routed-ledger` capability acquisition (contract `kumitate-routed-ledger-v1` — every routed item of the rounds 55..65 non-author spot-checks bound to a ledger row by a located quote, every answered row bound to a located answer line at its `path:line`, class recurrences counted; 33-case selftest, judged by frozen L66 L1–L6) and the MCP deprecation registry frontier entry (judged by frozen M66 M1–M8); the round-65 routed items D1–D7 answered as ledger rows; the R65 verifier spot-check row D7 repaired at the freeze and the carried `proxy-check` drift D4 refreshed at the close; mistake mined: routed items lost between rounds (a lesson Gate claiming per-row URL/date/quote while two sources carried no Gate record), captured by C1 | `.ufo/waves/round-66/plan.md`; `.ufo/waves/round-66/base/`; `.ufo/waves/round-66/probe/` |
```

## Limits

- Did not run `proxy-check` end-to-end (needs the `--src` origin clone and `--kimi-root`; those counts are quoted from `base/proxy-before.txt` and read from source, not re-measured by me) — hence finding 3 is a source-read obligation, not a measured drift.
- Did not create the real C2 entry or SOURCES rows; row 1's cell 3 intentionally omits the capture dir (unknown until the C2 build lands) — the L1 may append it.
- Row 1's wording repeats plan facts (clocks, `roots`, `sse.ts@v18.12.6`); I did not verify the C2 entry actually carries them — that is M66's job.
- Read-only on the lane: no lane file edited, no git/jj write anywhere (all writes in the scratch clone and my two build/report paths); no tool installed or upgraded.
