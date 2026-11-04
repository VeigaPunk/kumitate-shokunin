# K80ScribeDocs — full report

Seat: docs scribe (text only, leaf). Target bytes:
`6d03402fddf44cc9797ec590f0f888e933db4677` (scaffolding). Lane repo read-only; every write in this
seat went to `.ufo/waves/round-80/w1/K80ScribeDocs/` and to scratch, which was deleted.

## Provenance

| item | value | how |
|---|---|---|
| base tip | `1968689f9097f839457e242b41f83879e99af58e` | plan header; `git rev-parse` |
| freeze | `c6a7ebd3bd01ec34b2f9349a6756886c5dd85982` | `git log` (`round-80: freeze — plan, C1/C2 counters, open receipts, pre-data controls`) |
| scaffolding / M | `6d03402fddf44cc9797ec590f0f888e933db4677` | `git log` (`… v3 two-reading split … O terms default to the committed shape receipt (--omp-live opt-in); receipt re-captured 65; stanza/pins re-measured`) |
| lane HEAD when read | `ed64ddcabf4e4f6a0d860d288d083fdad34f61c7` (wave spec only; touches no `LOG.md`/`SCORECARD.md`/`SKILL.md`/`corpus/`) | `git diff --stat 6d03402f ed64ddca -- LOG.md SCORECARD.md SKILL.md corpus/` → empty |
| counter C1 | `.ufo/waves/round-80/probe/probe80-c1.mjs` sha256 `9cbd0281…` | `sha256sum` on the archive extract |
| counter C2 | `.ufo/waves/round-80/probe/probe80-c2.mjs` sha256 `ad514cf4…` | same |
| plan | `.ufo/waves/round-80/plan.md` sha256 `f9d235de…` | same |
| instrument bytes at M | `scripts/spotcheck-adopt.mjs` `0d9c56dc…` = `pin.spotcheck-adopt`; `scripts/proxy-check.mjs` `59dfeb64…` = `pin.proxy-check`; `scripts/omp-census.mjs` `c5986057…` = `pin.omp-census`; `.ufo/pins/omp-shape.json` `84e41b9f…` = `pin.omp-shape` | `sha256sum` vs the `kumitate-gate-pins-v1` block |

Method: `git archive <rev> | tar -x` into scratch (`/fast/scratch/hyaku/kumitate-r80/K80ScribeDocs`,
deleted before yield); counters run with `--tool`/`--lane` = that extract and `--work` **outside** the
tree (`../K80ScribeDocs-work`) so the `A` term stays clean; a second extract of `1968689f` for the
base readings; the lane tree read only through `git`/`read`.

## Commands and outcomes (all at `6d03402f` unless named)

| # | command | observed |
|---|---|---|
| 1 | `node .ufo/waves/round-80/probe/probe80-c1.mjs --set c1 --tool <extract> --lane <extract> --work <outside>` | `C80_C1: HELD held=13/13`, exit 0 — arms 01–13 all PASS; arm 03 `SPOTCHECK_COVERAGE: CLEAN spotchecks=1 uncovered=0` + `MAP: DRIFT first=uncovered:knowledge/late.md` exit 0; arm 08 `ADOPTED … wrote=both`; arm 12 `PASS (28/28)`; arm 13 `CLEAN spotchecks=46 uncovered=0` + `MAP: CLEAN` (`c1-at-6d03402f.txt`) |
| 2 | `node .ufo/waves/round-80/probe/probe80-c2.mjs --set c2 …` | `C80_C2: HELD held=12/12`, exit 0 — arm 01 `source=snapshot O_members=65` on a 68-member fixture; arm 02 `source=live O_members=68 O_MEMBERS_DRIFT`; arm 05 `OMP_SHAPE_NOT_FOUND` exit 2; arm 08 `O_findings=1 coverage=9`; arm 10 compare DRIFT vs proxy MATCH (`c2-at-6d03402f.txt`) |
| 3 | `OMP_AGENT_ROOT=/nonexistent node scripts/proxy-check.mjs --src <pinned origin>` | `PROXY: MATCH (A=886 C=39 operability=9; C1=19/19 C2=195/195 coverage=10; S=88/88 coverage:script-layer=10; R=92/92 coverage:runtime-layer=10; K=55/55 coverage:kimi-layer=10; O=1/1 O_members=65 O_findings=0 O_bound=35 coverage:omp=10; pins=6 match; src-rev=31c465f15669; source=snapshot)`, exit 0 |
| 4 | `node scripts/proxy-check.mjs --selftest` | `PROXY_SELFTEST: 163/163 pass`, `VERDICT: PASS` |
| 5 | `node scripts/spotcheck-adopt.mjs --check` | `SPOTCHECK_COVERAGE: CLEAN spotchecks=46 uncovered=0` + `MAP: CLEAN`, exit 0 |
| 6 | `node scripts/spotcheck-adopt.mjs --selftest` | `SPOTCHECK_ADOPT_SELFTEST: PASS (28/28)`, `VERDICT: PASS` |
| 7 | `node scripts/readme-map.mjs` | `README_MAP: CLEAN files=195 rows=195 covered=195`, exit 0 |
| 8 | `node scripts/omp-census.mjs --shape .ufo/pins/omp-shape.json` | `OMP_CENSUS: CLEAN (source=snapshot entries=65 findings=0 bound=35/35)`, exit 0 |
| 9 | `node scripts/omp-census.mjs --compare .ufo/pins/omp-shape.json` | `OMP_SHAPE_COMPARE: IN_SYNC entries=65 receipt=65 added=0 removed=0 changed=0 transient=0`, exit 0 |
| 10 | `node .ufo/waves/round-77/probe/probe77.mjs --set c2 …` | `C77_C2: UNMET held=9/13` — `c2.1`–`c2.4` fail on the superseded `v2`/`SPOTCHECK_MAP:` labels, `c2.5`–`c2.13` PASS (verifies checklist item 745) |
| 11 | base extract `1968689f`: `node scripts/readme-map.mjs`; `node scripts/spotcheck-adopt.mjs --check`; stanza read | `README_MAP: DRIFT files=195 rows=194 covered=194 bad=2 first=uncovered:lessons/round-79-verifier-spotcheck.md` exit 1; `SPOTCHECK_MAP: DRIFT spotchecks=46 uncovered=1 first=corpus/lessons/round-79-verifier-spotcheck.md` exit 1; `A=884 C=39 C2=194 C2_total=194 O_members=64 O_findings=0 O_bound=35 coverage_omp=10` (`base-readings.txt`) |
| 12 | `find corpus/lessons -name '*verifier-spotcheck*.md' \| wc -l` | `46` |
| 13 | `grep -c '^## 2026-11-04 — round 79' LOG.md`; `wc -l LOG.md`; `tail -2 LOG.md` | `0`; `2544`; the last line is the round-79 bullet ending "the full entry is the section below" — no such section |
| 14 | `grep -n -- '--omp-live' SKILL.md` | no hits (0) |
| 15 | `git diff --stat 1968689f 6d03402f` | `17 files +913 -29`; instrument/record files: `scripts/proxy-check.mjs`, `scripts/spotcheck-adopt.mjs`, `SCORECARD.md`, `SKILL.md`, `corpus/README.md`, `.ufo/pins/{omp-shape,readme-map}.json` |

Stanza before → after (bytes): `A 884 → 886` (the two frozen probes), `C 39 → 39`, `C2/C2_total
194 → 195` (the adopted `lessons/round-79-verifier-spotcheck.md` row), `O_members 64 → 65`,
`pin.proxy-check ab304f97… → 59dfeb64…`, `pin.omp-shape 5980a0c8… → 84e41b9f…`,
`pin.spotcheck-adopt b84343a0… → 0d9c56dc…`.

## Findings

- **F1 — the plan's C1 after-state number is not re-derivable.** Plan §C1 says the live lane reads
  `SPOTCHECK_COVERAGE: CLEAN spotchecks=47 uncovered=0`; the measured lane at the scaffold reads
  **46** and there are 46 `*verifier-spotcheck*.md` files. The counter's arm 13 asserts `CLEAN`, not a
  count, so the arm passes; 47 is true only if the closure lands a 47th spotcheck file. Text defect in
  the plan/registration, not a counter defect.
- **F2 — `SKILL.md`'s `proxy-check` registry row is stale for C2.** It still presents the live root as
  the O default and never mentions `--omp-live` or the receipt default (0 hits). The tool's header says
  otherwise. Proposed one-sentence replacement in `skill-check.md` §4. This is the second registry row
  the seat brief expected to have changed; measured, it did not change (`SKILL.md | 6 +-` = one row +
  two checklist items).
- **F3 — `LOG.md` carries a live dead pointer.** The round-79 bullet says "the full entry is the
  section below"; no round-79 section exists (0 hits; the bullet is the file's last line, 2544). This is
  the r79 `reference-drift` class, measured at the scaffold and at lane HEAD.
- **F4 — the `A` term counts every runnable file under the lane root.** Leaving 22 fixture `.mjs` files
  under an extract moved `A` 886 → 908 and turned the proxy into `A_DRIFT` (observed live before I moved
  `--work` outside the tree). Not a claim; a measured operability limit and a round-81 candidate.
- **F5 — the `## Axes` operability row's `A=10`/`C=19` are not the stanza's `A=886`/`C=39`.** Both
  accountings give 9 under `floor(10×(A+C)/(A+C+3))` (29/32 = 0.906; 925/928 = 0.997), but the row's
  terms are a frozen historical list, not the proxy's counts. Pre-existing; not changed, not re-derived
  beyond the formula check.
- **F6 — the checklist pass count is not measurable on an archive extract.** `surface-probe
  --checklists` on the extract reads `34/39` with five failures that are environment-shaped (items
  720/721 need a git work tree / reports dir; 728 needs a committed rev; 752's r79 probe needs both; 722
  read `A_DRIFT` from my then-polluted `--work`). Not the lane's reading; the lane's checklist number is
  a closure measurement.

## Numbers I could not re-derive

1. `spotchecks=47` (plan §C1 after-state) — measured 46; see F1.
2. Every closure value: final `A`, `C2/C2_total` after the lesson + README row, `SOURCES` rows/tiers,
   the lane checklist pass count, the wave settlement (seats/sessions/reports), and the `rev=`-stamped
   close receipts. These belong to the close commit, not the scaffold.
3. The second changed gate-registry row — it does not exist in the bytes; only `spotcheck-adopt`
   changed (F2).
4. C1's sourced knowledge row (S233 at the scaffold) — no source was opened or read by this seat; the
   `## Gate` skeleton carries `[L1 fills]` slots with the acceptance criteria only.
5. The `## Axes` operability row's `A=10`/`C=19` as *counts* — re-derived only the formula's output (9).

## Touched surfaces

- Written: `.ufo/waves/round-80/w1/K80ScribeDocs.md` and `.ufo/waves/round-80/w1/K80ScribeDocs/`
  (`scorecard-additions.md`, `log-entry.md`, `lesson-skeleton.md`, `skill-check.md`, `report.md`, and
  the receipts `c1-at-6d03402f.txt`, `c2-at-6d03402f.txt`, `scaffold-readings.txt`, `base-readings.txt`,
  `probe77-c2-at-6d03402f.txt`).
- Not touched: the lane tree, the fleet repo, `MANIFEST.json`, `.ufo/state/`, `.ufo/watchdog.log`,
  `.scratch/`, `~/.local/bin`, any sibling lane. No git mutation anywhere; no subagents; no tools
  installed.
- Scratch `/fast/scratch/hyaku/kumitate-r80/K80ScribeDocs{,-work}` removed before yield.

## Working-tree and close state, read after the drafts above were written

The lane moved while this seat worked: HEAD advanced `ed64ddca` → **`509afb1d`** ("round-80: corpus
increment — two sourced knowledge entries (S233/S234) + captures; r79 lesson erratum (D3/D4);
round-start sources census; stanza C2 re-measure 197"). My drafts stay against the assigned target
`6d03402f`; these are the parallel readings, not replacements.

Already applied in the working tree (uncommitted unless noted):

| item | state | relation to my findings |
|---|---|---|
| `plan.md` **Amendment 1** (+17) | fixes §C1's `spotchecks=47` to the measured **46**; states the close C2 reading as 197/197; records the `labrat` role substitution | **F1 addressed** |
| `SKILL.md` `proxy-check` row | gained the round-80 sentence: the receipt is the default O source, `source=snapshot` in both JSON bodies, `--omp-live` opt-in exclusive with `--omp-shape`/`--omp-root`, absent receipt fails closed | **F2 addressed** |
| `LOG.md` (+14) | a "Round 79 — full entry, appended at round 80" section, explicitly crediting this seat's `reference-drift` routing | **F3 addressed** |
| `SCORECARD.md` (+34/−2) | stanza `C2`/`C2_total` 195 → 198; two round-80 Move-log rows (C1 sourced on S119/S233 history, C2 on S234); round-81 Planned block (5 candidates); "Round 80 correction" section (D5, round-79 receipt names) | my two rows are a second reading; the L1's text is the applied one |
| `corpus/lessons/round-80.md` (untracked) | Gate admits S119 (re-opened) and S234, rejects S235; records S233 written-and-withdrawn as a duplicate of S119; `## Mistakes` mines `reference-drift` (duplicate source row) and `attribution` (probe label arms); `## Limits` records the `A`-term count and `otherFindings` substring filter | my skeleton's S233 placeholder is **superseded** — S233 is withdrawn |
| `corpus/knowledge/{two-reading-verdicts,snapshot-bound-derived-scores}.md` | committed at `509afb1d` | the round's two entries |

### F7 — the stanza is one re-measure behind, and the close receipts show it

- `node scripts/readme-map.mjs` in the lane now reads `README_MAP: CLEAN files=198 rows=198 covered=198`
  (the round-80 lesson + its README row landed after `509afb1d`), while the stanza at `509afb1d` declares
  `C2=197` / `C2_total=197` and plan Amendment 1 quotes the close as `C2=197/197`.
- `.ufo/waves/round-80/close/proxy-check.txt` (`rev=509afb1d…`) reads
  `PROXY: DRIFT (C2_DRIFT term=C2 declared=197 computed=198 delta=+1; C2_TOTAL_DRIFT …; src-rev=31c465f15669; source=snapshot)`
  — not the `PROXY: MATCH (… C2=197/197 …)` the lesson's `## Counters` quotes.
- `.ufo/waves/round-80/close/c2-probe.txt` (`rev=509afb1d…`) reads **`C80_C2: HELD held=8/12`, exit 1**:
  arms 01, 03, 10 and 12 fail because they require the proxy's text verdict to be `MATCH`/exit 0 on the
  current tree (arm 01 `text_exit=1`; arm 03 `kinds=C2_DRIFT,C2_TOTAL_DRIFT`; arm 12 `exit=1`).
- `.ufo/waves/round-80/close/checklists.txt` (`rev=509afb1d…`) reads `CHECKLIST: 36/39 pass`,
  `VERDICT: FAIL`; the three failures are item 720 (round-close artifact audit — the round report is not
  filed yet), item 722 (proxy recompute — the same C2_DRIFT) and item 752 (the r79 Kimi probe, which reads
  the proxy verdict).
- `.ufo/waves/round-80/close/c1-probe.txt` (`rev=509afb1d…`) reads `C80_C1: HELD held=13/13`, exit 0, and
  the remaining close receipts I read are green (`census-shape` CLEAN 65/0/35; `census-compare` IN_SYNC
  65/65; `spotcheck-check` 46/0 + `MAP: CLEAN`).

Reading: every red line above is downstream of one number — the stanza still declares 197 after the
lesson and its row made the tree 198. Re-pin `C2`/`C2_total` to 198, re-run the proxy, the C2 counter
and the checklist sweep, and the close is green; until then the lesson's `PROXY: MATCH (… C2=197/197 …)`
row and Amendment 1's "final close reading" are not what the committed receipts show. I did not edit
either (registration is the L1's).

### F8 — `close/census-shape.txt` is the live census, not the receipt reading

`close/census-shape.txt` runs `node scripts/omp-census.mjs` (no `--shape`) and reads
`OMP_CENSUS: CLEAN (root=/home/vgpnk/.omp/agent entries=65 …)`; the offline re-derivation the claim
names is `--shape .ufo/pins/omp-shape.json` (I measured `CLEAN (source=snapshot entries=65 …)` at the
scaffold). Both are true; the receipt's name is slightly wider than its command. Not a defect — a
reading note for the close set.
