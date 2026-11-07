# K100ScribeLesson Report: row-id reader class knowledge entry + Mistakes/Q94 draft

**Date:** 2026-11-07
**Seat:** K100ScribeLesson (Kumitate round 100, hyaku run 15, attempt 1)
**Role:** UFO-FSD scribe (leaf; no dispatch)
**Inputs frozen at:** `445196e4609b76f23d706403b7bebf1135066952` (plan, `probe/probe100-c1.mjs`, `probe/make-controls100.py`, 16 controls with `OBSERVED.txt`, read-order log); lane base `5e2f9856271525760ade3b08892f6df7601fa689`
**Candidate:** `K100ExecTool/READY` appeared at 04:45 (`e887b982…` cite / `ad3227d6…` capture; lane M `7c3bca09`). Nothing here is scored against it; my measured rows are BASE `5e2f9856` (= the freeze bytes) and the L1 reference rule `ctl-positive`.
**Seat dir:** `.ufo/waves/round-100/K100ScribeLesson/` · **Scratch:** `/fast/scratch/hyaku/kumitate-r100/K100ScribeLesson/` (removed before yield)

---

## 1. Behaviour

Wrote the two asked-for drafts against frozen artifacts, and one re-runnable instrument:

1. `K100ScribeLesson/knowledge-row-id-reader-class.md` — provenance trio first (S276 ECMA-262, S277 POSIX
   `blank`, S274 POSIX awk, plus the round's S280/S281 MDN pages with sha256 and quote anchors), then the
   four-reader table against the census `row_pass` (`sources-census.sh:574-695`), the measured 135-row sweep
   (BASE vs census, `sources-check`, and the L1 reference pair), the `m`-flag record hole (`ctl-k99`, 6 rows),
   the K99ExecSibling draft fix that still fails, the out-of-scope classes (section scope, malformed rows,
   duplicate ids, BOM), and limits. Every count carries its command and a seat receipt.
2. `K100ScribeLesson/lesson-draft.md` — `## Mistakes` rows M100-1 (this round's read order + a plan-cited
   receipt absent from the frozen tree), M100-2 (pre-repair `ctl-indent4` read `HELD`), M100-3 (plan prose
   battery count vs the 132/135 artifacts), plus `## Q94` in the Q90–Q93 shape with rule, grounding,
   who-checks, command, fails-when, shown-able-to-fail and limit.
3. `K100ScribeLesson/reader-sweep.mjs` — draws 135 battery rows (same classes as the frozen probe), runs the
   census live and five readers per row, writes the per-row receipt and the over/under/agree summary.

## 2. Gates (what I did not touch)

- **No verdict.** `C100_C1` is the frozen counter's call. I replayed it only with pinned seeds
  (`ctl-nothing d60d75141f5f3f8d`, `ctl-positive a1e417bda45f6ae3`, `ctl-k99 b4745ab342e2ebdb`), never more
  than two at once, and touch no claim. The candidate `READY` is not scored by this seat.
- **Read-only on the lane.** No write under `scripts/`, `corpus/`, `probe/`, `controls/`, `open/`, `plan.md`;
  `git status --porcelain scripts/` was empty when I checked at 04:51; the four lane script hashes I read
  are the ones named here (`7211be84…`/`39bdeb39…` at the freeze, `75ac6972…`, `84ebaf9f…` —
  `receipts/env-and-freeze.txt`). At 04:56:24/04:56:36 another seat's in-flight edits appeared in
  `scripts/cite-sources.mjs`/`source-capture.mjs` and `.ufo/pins/` (worktree shas `9b9aeefd…`/`4b39fa14…`,
  not mine, not reverted); HEAD `7c3bca09` still carries the READY bytes `e887b982…`/`ad3227d6…`
  (`receipts/head-and-candidate.txt`).
- No git/jj mutation anywhere (the only git calls are `show`/`ls-tree`/`log`), no `sudo`, no pacman, no
  fleet-root file, no S-row edit (`corpus/SOURCES.md` untouched; S280/S281 stay with K100ScribeSources).

## 3. Touched surfaces

| path | what |
|---|---|
| `.ufo/waves/round-100/K100ScribeLesson/knowledge-row-id-reader-class.md` | knowledge entry draft (integration target `corpus/knowledge/row-id-reader-class.md`, the used-by of S280/S281) |
| `.ufo/waves/round-100/K100ScribeLesson/lesson-draft.md` | `## Mistakes` M100-1..3 + `## Q94` draft |
| `.ufo/waves/round-100/K100ScribeLesson/reader-sweep.mjs` | 135-row four-reader sweep (re-runnable) |
| `.ufo/waves/round-100/K100ScribeLesson/receipts/` | `reader-sweep.txt` (per row), `reader-sweep-derived.txt`, `probe-ctl-{nothing,positive,k99}.txt`, `controls-sha.txt`, `battery-row-counts.txt`, `q94-control-reachability.txt`, `read-order-check.txt`, `env-and-freeze.txt`, `round-gate-selftest.txt`, `head-and-candidate.txt` |
| `.ufo/waves/round-100/w1/K100ScribeLesson.md` | this report |

## 4. Findings

1. **Four readers, one class.** `sources-check` (r99, lines 194/233/235/249) and `round-gate` (r98, line 411
   `SOURCES_ROW_RE`) already implement the census gate `^ {0,3}\|` + `[ \t]` id cell; `cite-sources:36` is
   wider only on the pad axis; `source-capture:157` is wider on pad + indent + record (`/gm`). Measured on 135
   drawn rows (`receipts/reader-sweep.txt`; summary `rows=135 census_valid=33 census_invalid=66
   census_notrow=36`): cite over 42 (14 pad classes × lead/trail/both), capture over 64 (42 pad + 14 indent +
   8 break), under 0 for every reader; `sources-check` 0/0 and the L1 reference cite/capture 0/0 (agree 135).
2. **The counter agrees with the independent sweep.** Replays: `ctl-nothing` `UNMET a=0 b=0 … a_miss=42
   b_miss=64 … seed=d60d75141f5f3f8d`; `ctl-positive` `HELD a=1 b=1 c=1 d=1 … seed=a1e417bda45f6ae3`. The
   a/b miss counts equal the sweep's 42/64.
3. **`/gm` is a record rule.** `ctl-k99` (reference regex + `m`) reads `UNMET b_miss=6`, exactly
   `E-break-{CR,LS,PS}-{bare,text}`; K99ExecSibling's draft fix (pad+indent only) therefore still fails on the
   six same-record rows. The reference needs the per-LF-record form, which measures 0/0.
4. **M100-1, two faces.** The r99 checker on the frozen log reads `READ_ORDER: DRIFT MISSING_CANONICAL
   MISSION.md`, exit 1 (the fleet canonical line packs four paths into one field); only the split copy yields
   `CANONICAL_AFTER_CLAIM line=22` (`close-l1/read-order-split.txt`). The plan cites `open/read-order-check.txt`
   at line 12, and that path is absent from the frozen tree (`git ls-tree -r 445196e4 --
   .ufo/waves/round-100/open/` lists 8 files, read-order.log only for read-order).
5. **M100-2/M100-3, one generator defect.** Pre-repair `ctl-indent4` `HELD a=1 b=1 rows=132` exit 0 vs
   post-repair `UNMET a=0 b=0 rows=135` exit 1 with `miss a D-indent-SP4:…`; reachability grep 0 (exit 1) vs 2
   (exit 0). Plan "~135 rows" vs 132 pre-repair. 16 controls, 15 `UNMET` + 1 `HELD`, `OBSERVED.txt` 16/16
   `match=yes`; regenerated controls verify 32/32 sha256 (`receipts/controls-sha.txt`).

## 5. Out of scope / limits

- Section scope and row shape are report-only (K100ExecSection: BASE and the reference diverge identically on
  9 of 11 section placements; field-count/BOM classes; 210/210 live comparisons same). Duplicate ids make
  `source-capture` `FAIL-CLOSED` vs census `E03` — contract shape, routed.
- Live exposure is zero for the claim (K100Scout: 21 lanes + 79 revisions, (i)/(ii)/(iii)=0, (iv)=85
  recognition-neutral record-span matches; cite=0 capture=0 divergence). Prospective, not an incident.
- Disclosed in the entry: NEL is not JS white space; capture's trailing `\s*` can cross a record boundary;
  gawk manual unreachable (`curl: (28)`); MDN `…/Regular_expressions/Lexical_grammar` is a 404 (cited page is
  `…/Reference/Lexical_grammar`); the frozen plan is not amended (K4).
- `round-gate` is labelled `[INFERENCE]` in the entry: regex-identical to R100, certified by its own R98
  counter and `--selftest` `98/98 PASS` (`receipts/round-gate-selftest.txt`), not driven by my sweep.

## 6. Artifact paths

- Knowledge draft: `.ufo/waves/round-100/K100ScribeLesson/knowledge-row-id-reader-class.md`
- Lesson draft: `.ufo/waves/round-100/K100ScribeLesson/lesson-draft.md`
- Sweep instrument: `.ufo/waves/round-100/K100ScribeLesson/reader-sweep.mjs`
- Receipts: `.ufo/waves/round-100/K100ScribeLesson/receipts/` (12 files, listed in §3)
