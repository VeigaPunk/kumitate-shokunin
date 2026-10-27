VERDICT: The three C2 capture files fetched twice 62 s apart are byte-stable, and my independently-fetched bytes + my three pin entries + my three SOURCES rows score DEPREC66_HELD 8/8 under the frozen M66 counter on a scratch clone; the integration hazards are a duplicate-sourceId fail-closed if both this seat and K66ScribeRows' S207–S209 entries are merged, and an M6 blind spot that lets a mispaired snapshot read 8/8.

## Evidence

**1. Double fetch, 62 s apart — all three URLs byte-stable.** Both rounds: `curl -fsSL --max-time 90 --retry 2 -A "Mozilla/5.0 (kumitate-r66-capture)" <url>`.

```
=== round 1 ===
deprecated-2026-07-28.md exit=0 bytes=3839
c12c3cb7d6b8a30cd4df8ea8162a819df071a42745da6d20165e8fdf94b28baa  r1-deprecated-2026-07-28.md
feature-lifecycle.md exit=0 bytes=8794
3f3371911512591e61d80d8e1bf07ac6a93df4e930d1379d24b78034349e74ee  r1-feature-lifecycle.md
omp-v18.12.6-sse.ts exit=0 bytes=15183
0b69229a69b01a372117d3d86833ec40e8f5118efe1049fdc4993ae1c677fbb0  r1-omp-v18.12.6-sse.ts
=== round 2 (after a 62 s wait) ===
c12c3cb7d6b8a30cd4df8ea8162a819df071a42745da6d20165e8fdf94b28baa  r2-deprecated-2026-07-28.md
3f3371911512591e61d80d8e1bf07ac6a93df4e930d1379d24b78034349e74ee  r2-feature-lifecycle.md
0b69229a69b01a372117d3d86833ec40e8f5118efe1049fdc4993ae1c677fbb0  r2-omp-v18.12.6-sse.ts
=== cmp ===
deprecated-2026-07-28.md STABLE
feature-lifecycle.md STABLE
omp-v18.12.6-sse.ts STABLE
```

These three digests are byte-identical to the ones seat `K66ScribeRows` reported over IRC for the same three URLs — two independent fetches agree.

**2. Frozen M66 counter on MY bytes.** Clone: `git clone --shared /home/vgpnk/Projects/shokunin/kumitate-shokunin` → `/fast/scratch/hyaku/kumitate-r66/K66ExecCaptures/lane` (`git rev-parse --show-toplevel` asserted equal to the clone path before its commit). Revision `0883a65110baed4d287ed218cebc0783ee163ec3`; commit only inside the clone, identity via `-c user.name=… -c user.email=…` on that call.

```
=== frozen M66 probe (live fetch on) ===
DEPREC66_HELD held=8/8 checks=8 rev=0883a65110baed4d287ed218cebc0783ee163ec3 rule=M66
probe-exit=0
=== source-capture gate ===
SOURCE_CAPTURE: CLEAN captures=41 exemptions=107
capture-exit=0
=== sources-check ===
SOURCES_CHECK: CLEAN (rows=148 tiers=A:125,B:15,C:8 status=queued:13,mined:116,rejected:19 entries_with_source=23 legacy=38)
sources-check-exit=0
=== readme-map ===
README_MAP: CLEAN files=161 rows=161 covered=161
readme-exit=0
=== census validate --file <clone>/corpus/SOURCES.md --today 2026-10-27 ===
file	W04	S034 duplicate url stryker-mutator.io/docs/mutation-testing-elements/mutant-states-and-metrics across scopes
file	W04	S068 duplicate url github.com/can1357/oh-my-pi/tree/45c35e40c46166dc726ccc52f5d27f40f2449f99 across scopes
file	W04	S084 duplicate url infection.github.io/guide across scopes
file	W04	S095 duplicate url raw.githubusercontent.com/containers/bubblewrap/v0.13.1/bwrap.xml across scopes
file	W04	S123 duplicate url docs.langchain.com/oss/python/langgraph/checkpointers across scopes
file	W04	S126 duplicate url docs.temporal.io/encyclopedia/detecting-activity-failures across scopes
file	ok	/fast/scratch/hyaku/kumitate-r66/K66ExecCaptures/lane/corpus/SOURCES.md
census-exit=0
```

The six W04 are the carried baseline (`base/census-before.txt`), unchanged.

**3. M6 parse — the frozen M6 block extracted verbatim from the frozen file at runtime** (`.ufo/waves/round-66/probe/deprec66-probe.mjs`, `// ---- M6` … `// ---- M7`, 35 lines) and evaluated with the probe's own `norm`/`delink`/`section` bindings against my S207 capture and my entry:

```
--- extracted M6 block from .../deprec66-probe.mjs (35 lines) ---
check M6: PASS
misses: none
```

`CAP_ROWS count = 6` — the six rows (Roots / Sampling / Logging / Dynamic Client Registration / includeContext / HTTP+SSE), with `Deprecated in` = 2026-07-28 ×4, 2025-11-25, 2025-03-26 and `Earliest removal` = "First revision released on or after 2027-07-28" ×4, "Follows Sampling (SEP-2577)", "Three months after SEP-2596 reaches Final". Full table in `build/K66ExecCaptures/m6-rows.md`.

**4. Mutants against the frozen counter.**

| mutant | change | verdict |
|---|---|---|
| A | S207 capture is the HTML render of the same page (297 396 B) instead of the `.md` | `DEPREC66_UNMET held=7/8 checks=8 … M6 MISS capture-table-rows=0<5;snapshot-rows=6!=capture-rows=0` (exit 1) |
| B | the entry's snapshot swaps Sampling's and HTTP+SSE's removal clauses | `DEPREC66_HELD held=8/8` (exit 0) |
| C | an unescaped `|` inside the S207 `source` cell | `DEPREC66_UNMET held=4/8 … M2 MISS S207:NF=14 | M5 MISS S207:no-url | M8 MISS census-exit=1 sources-check=false …` (exit 1) |
| D | the S207 capture bytes are not committed | `DEPREC66_UNMET held=4/8 … M3 MISS S207:capture-absent | M4 MISS S207:quote-not-in-capture(…) | M6 MISS S207:capture-unusable` (exit 1); `SOURCE_CAPTURE: DRIFT captures=41 exemptions=107 bad=1 first=S207:capture-absent` (exit 1) |

**5. Cross-seat integration matrix** (all with the frozen probe, live fetch on):

| case | entry | rows | pins | verdict |
|---|---|---|---|---|
| 1 | sibling `K66ScribeRows` entry (cites S207–S211) | mine S207–S209 | mine S207–S209 | `DEPREC66_UNMET held=3/8 … M2 MISS S210:not-in-registry,S211:not-in-registry | M3 MISS S210:unbound,S211:unbound | M4 MISS S210:quote-not-in-capture(…) | M5 MISS S210:no-url | M8 MISS sources-check=false` (exit 1) |
| 2 | sibling entry | mine S207–S209 + sibling S210–S211 | mine + sibling | `DEPREC66_HELD held=8/8` (exit 0) |
| 3 | my entry | mine S207–S209 | mine S207–S209 | `DEPREC66_HELD held=8/8` (exit 0) |

**6. Duplicate-sourceId hazard.** Merging both seats' S207–S209 pin entries (same ids, same bytes, different paths):

```
duplicate-entries-added captures=44
=== source-capture with BOTH seats' S207-S209 entries merged ===
SOURCE_CAPTURE: FAIL-CLOSED reason=duplicate sourceId "S207"
capture-exit=2
```

## Findings

**K66ExecCaptures-1 — HIGH — the L1 must pick one S207–S209 pin set, not both.** This seat and `K66ScribeRows` independently claim S207 (deprecated.md), S208 (feature-lifecycle.md) and S209 (`sse.ts`) for the *same three URLs*, with byte-identical captures but different committed paths (mine under `build/K66ExecCaptures/`, theirs under `build/K66ScribeRows/capture/`). Appending both sets to `.ufo/pins/source-captures.json` makes `scripts/source-capture.mjs` **FAIL-CLOSED** (`reason=duplicate sourceId "S207"`, exit 2) — a hard gate failure, not a drift, so it cannot be repaired by editing rows alone. Reproduce: `bash /fast/scratch/hyaku/kumitate-r66/K66ExecCaptures/dupid-test.sh` (the script is in scratch; the shape is "append both sets, run `node scripts/source-capture.mjs`"). Recommendation: take **one** set of three entries and one set of capture files; the sibling's set additionally carries S210/S211, which case 2 above shows the entry then needs. Do not mix the two id→path mappings.

**K66ExecCaptures-2 — HIGH — M6 cannot detect a mispaired `## Registry snapshot`.** The counter joins the snapshot table into one string and asks only that each captured `Deprecated in` and `Earliest removal` cell occur *somewhere* in it (`deprec66-probe.mjs:197-203`). Swapping Sampling's and HTTP+SSE's removal clauses in the snapshot still reads `DEPREC66_HELD held=8/8` (exit 0) — mutant B. So the entry's six-row table can pair a feature with another feature's clock and the gate is silent. This is a property of the frozen counter (not patched here, per the round's rules): the L1 and any non-author reviewer must check the snapshot row-wise. The row-wise-correct table is in `build/K66ExecCaptures/m6-rows.md`; note row 5's removal cell must read `Follows Sampling (SEP-2577)` (delinked), not the markdown-link form.

**K66ExecCaptures-3 — MEDIUM — the capture must be the `.md` render, and its bytes must be committed.** Two independent ways to lose M6, both measured: replacing the S207 capture with the HTML render of the same page (297 396 B) gives `M6 MISS capture-table-rows=0<5;snapshot-rows=6!=capture-rows=0` (mutant A), and leaving the capture bytes out of the commit gives `M3 MISS S207:capture-absent` plus `M4 MISS S207:quote-not-in-capture(…)` and `M8 MISS source-capture=false` (mutant D). The pins entry alone is not enough: `scripts/source-capture.mjs` re-hashes the file on disk under the lane root, so the bytes must be committed at exactly the path the pins entry names.

**K66ExecCaptures-4 — MEDIUM — an entry may not cite ids the registry does not carry.** Case 1 above: the sibling's entry cites S207–S211 while only S207–S209 rows exist, and the counter fails at M2 (`S210:not-in-registry,S211:not-in-registry`), M3 (`unbound`), M4 (`quote-not-in-capture`), M5 (`no-url`) and M8 (`sources-check=false`). Either the entry cites exactly the ids the rows carry, or the rows and pins cover every id the entry cites (case 2 = 8/8).

**K66ExecCaptures-5 — LOW — a `|` inside a SOURCES cell breaks four checks at once.** Mutant C: an unescaped pipe in the S207 `source` cell gives `M2 MISS S207:NF=14` (13 fields expected), `M5 MISS S207:no-url` (the URL is split out of the cell), `M6 MISS no-cited-row-for-the-2026-07-28-deprecated-page`, and `M8 MISS census-exit=1 sources-check=false`. The row text I propose contains no pipe in any cell; the L1 should paste the rows programmatically rather than retype them.

**K66ExecCaptures-6 — INFO — the three captures are reproducible and stable.** Both fetches, 62 s apart, are byte-identical, and two seats fetching independently agree on all three digests. The `.md` URLs serve the Mintlify `text/markdown` render (same shape as the existing S195/S198/S200 rows); `sse.ts` is the raw file at tag `v18.12.6` (446 lines). Recheck cadence: 90d for the two MCP pages, `on-release` for the OMP file (the tag moves).

## Artifacts

Under `/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-66/build/K66ExecCaptures/`:

- `deprecated-2026-07-28.md` — S207 capture, 3839 B, `c12c3cb7d6b8a30cd4df8ea8162a819df071a42745da6d20165e8fdf94b28baa`
- `feature-lifecycle.md` — S208 capture, 8794 B, `3f3371911512591e61d80d8e1bf07ac6a93df4e930d1379d24b78034349e74ee`
- `omp-v18.12.6-sse.ts` — S209 capture, 15183 B, `0b69229a69b01a372117d3d86833ec40e8f5118efe1049fdc4993ae1c677fbb0`
- `pin-entries-S207-S209.json` — the three proposed `.ufo/pins/source-captures.json` entries (path / sha256 / bytes / captured 2026-10-27), plus the source URL of each
- `m6-rows.md` — the six-row M6 table and the row-wise-correct `## Registry snapshot` contents
- `receipts.txt` — the full command transcripts quoted above

Scratch (deleted before yield): `/fast/scratch/hyaku/kumitate-r66/K66ExecCaptures/` — clone `lane` at `0883a651`, plus `m6parse.mjs`, `m6-verbatim.mjs` (runtime extraction of the frozen M6 block), `setup-clone.sh`, `rehearse.sh`, `mutants.sh`, `interop.sh`, `dupid-test.sh`.

Not written (L1-owned): `.ufo/pins/source-captures.json`, `.ufo/pins/readme-map.json`, `corpus/SOURCES.md`, `corpus/knowledge/mcp-deprecation-registry.md`, `corpus/README.md`, `PROVINCE.md`, `scripts/`, and every frozen file under `.ufo/waves/round-66/{plan.md,probe,base}`. The lane tree carries only my untracked build artifacts; no git or jj mutation was made in the lane.

## Limits

- I did not write the C2 entry, the SOURCES rows, the README map row or the PROVINCE line into the lane — the L1 owns those. My rehearsal versions of them exist only inside the scratch clone and were scored there; the entry text I used is a rehearsal artifact, not a proposal for the lane's wording.
- I did not open the per-feature deprecation notices the registry calls normative, nor the SEP-2596 status page (the sibling's S210/S211 rows cover the SEP and the 2025-11-25 transports page). My captures are the three URLs named in this seat's assignment; the registry's `Follows Sampling` and `Three months after SEP-2596 reaches Final` clauses are read as state-relative, not resolved to a date — that resolution needs S210.
- I did not verify at run time whether the host's OMP release exercises the legacy SSE transport or the `roots` capability; presence in the source bytes is not use.
- The M4 quote list I used is the one inside my rehearsal entry (10 bullets from S207/S208/S209). It satisfies the counter's ≥6-bullet, ≤25-word, one-`2027-07-28`, one-`Three months after` clauses; whether each quote is the *right* quote for the entry's argument is a non-author reading, not a gate check.
- I ran the census and the three corpus gates against a scratch clone only, never against the lane's working tree (the lane's `readme-map` is CLEAN at `files=160 rows=160` and `source-capture` CLEAN at `captures=38` as of the freeze).
- No tool was installed or upgraded; nothing in this task needed one.
