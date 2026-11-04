# K85Scribe — scoped report

Date: 2026-11-04. Lane-author advice only; no non-author closure, SHONEN attestation, admission
judgment or production edit. Axes named: operability (the round's capability acquisition) and
coverage through one knowledge entry. Base `a5d3e7549501ae76dbd86a6f81c5e858f1f92446`; repair
`6663b3beb4b5bd30e766e9c01f6ba4db24f5c5e8`; freeze
`9db0c6b5eb9111cfc5581006ba976ca2cd112792`.

**Not a closure.** The C1 disposition is L1's and the non-author closure's. I do not write
SHONEN `[x]` and I do not adjudicate the frozen kill rule. While I worked, L1 committed the
round's own integrated drafts (`a882a334`, `2688cc7f`, `6e3e4749`): the knowledge note, the
lesson, Q78 and the S245/S246 rows are already in `corpus/`, and L1's `## Round 85` LOG entry
records **C1 UNMET** under the frozen kill rule, citing "three post-data adversaries reach
20/20". My four drafts below are therefore the independent scribe-seat versions, delivered for
the diff and for the record; they differ from the integrated files in the places named under
"Conflicts preserved verbatim". Nothing here reopens or re-decides the disposition.

## Delivered surfaces

All four drafts are under
`/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-85/build/K85Scribe/`:

- `knowledge/counter-receipt-discrimination.md` — the S245-grounded knowledge note: why an
  internal-consistency check is not an oracle, the v2 contract and its precedence, the four
  pre-data control classes, and the limits (forged-but-consistent receipts still pass; not
  authentication; byte dependence is not comprehension; the column-zero grammar hides an
  indented red row; textual source binding; no liveness or size bound; no source digest).
  Header carries the `source:` / `verified-at:` / `recheck:` trio the corpus requires.
- `quality-q78.md` — one QUALITY.md criterion in the file's bullet style, requiring four
  pre-data control classes (absent tool, constant printer, label-keyed no-reader, same-path
  content variation), each asserted with an exact unique verdict, grounded in the round-84
  `vacuous` row.
- `lesson-round-85.md` — the `## Mistakes` table in the lane's column shape (class · evidence
  pointer · captured-by · fix and shown-able-to-fail boundary) with five rows, plus `## Gate`
  and `## Method` sections.
- `sources-rows.md` — the two registry rows S245 (admit) and S246 (reject) in the registry's
  11-column shape, with the re-derivation notes for the quote and the reject.

`receipts/` holds ten durable receipts from my own runs, each naming command, exit code and the
revision measured.

## Read-only evidence and exact commands

Every command below ran from the fleet root or from my scratch root
`/fast/scratch/hyaku/kumitate-r85/K85Scribe/` (deleted after the receipts were copied).
`L=/home/vgpnk/Projects/shokunin/kumitate-shokunin`.

1. `node $L/.ufo/waves/round-85/probe/probe85-c1.mjs --lane $L --work <scratch>` → exit 0,
   `C85_C1: HELD held=20/20` (`receipts/probe-integrated.txt`).
2. `node $L/.ufo/waves/round-85/controls/content-variation.mjs --lane $L --work <scratch>` →
   exit 0, `CONTENT_VARIATION: HELD held=3/3 distinct_sha=true` (`receipts/cv-integrated.txt`).
3. The same frozen probe against each committed control tool
   (`--lane $L/.ufo/waves/round-85/controls/{base,stub,noreader}`) → exit 1 each, `UNMET
   held=1/20`, `UNMET held=0/20`, `UNMET held=1/20`
   (`receipts/control-{base,stub,noreader}-probe.txt`) — byte-identical to the frozen receipts
   `.ufo/waves/round-85/controls/{base,stub,noreader}.txt`.
4. `git archive 9db0c6b5 | tar -x -C <freeze>` then
   `node scripts/readme-map.mjs --registry .ufo/pins/readme-map.json --readme corpus/README.md
   --corpus corpus/knowledge --corpus corpus/lessons` → exit 1, `README_MAP: DRIFT files=214
   rows=214 covered=213 bad=1 first=unpinned:lessons/round-84-verifier-spotcheck.md`
   (`receipts/readme-map-at-freeze.txt`). The same tree's
   `bash scripts/plan-before-ready.sh --round 85` → exit 1, `PLAN_BEFORE_READY: FAIL …
   reason=MAP_DRIFT … map_first=unpinned:lessons/round-84-verifier-spotcheck.md`.
5. `curl -sS https://arxiv.org/abs/2212.06118v3` → HTTP 200, 42130 B, sha256 `ebc79620…`; a
   second fetch was byte-identical. `curl -sS https://dl.acm.org/doi/10.1109/TSE.2014.2372785`
   → HTTP 403, 5581 B, sha256 `db04737d…`, Cloudflare interstitial. `curl -sSI
   https://doi.org/10.1109/TSE.2014.2372785` → 302 to
   `http://ieeexplore.ieee.org/document/6963470/`; that URL answers HTTP 202 with an empty body.
   `curl -sS https://api.crossref.org/works/10.1109/TSE.2014.2372785` → HTTP 200, metadata
   only.
6. `grep -c -F` of my S245 quote against the committed capture
   `.ufo/waves/round-85/build/L1/arxiv-2212.06118.html` → 3; against my own v3 fetch → 3;
   against the v1 and v2 abs pages → 0 and 0. `wc -w` over the quoted bytes → 19.
7. `bash scripts/sources-census.sh validate --root /home/vgpnk/Projects/shokunin kumitate` →
   exit 0, the same six pre-existing W04 warnings and `kumitate ok …/corpus/SOURCES.md`.
8. `node scripts/sources-check.mjs` → `SOURCES_CHECK: CLEAN (rows=184 tiers=A:157,B:17,C:10
   status=queued:13,mined:147,rejected:24 …)` with only pre-existing
   `USED_BY_ASYMMETRY` warnings. `node scripts/source-capture.mjs` → `SOURCE_CAPTURE: CLEAN
   captures=73 exemptions=111`.
9. `node scripts/cite-check.mjs --self <tree-with-my-draft> --src /home/vgpnk/Projects/shokunin
   --json`, with my knowledge draft copied into `corpus/knowledge/` of a scratch tree built from
   `git archive HEAD`: **0 errors attributable to my file**. The tree-wide baseline is very red
   (`errors=5135`), so only the per-file delta is meaningful; my first draft carried one
   `UNRESOLVED` error for a receipt path missing its `.ufo/waves/round-85/` prefix, which I
   fixed and re-measured at zero.

## Conflicts preserved verbatim

**The frozen predicate accepts a semantically blind instrument.** Two independent attack lanes
satisfy both frozen gates without parsing a transcript:

- A lane keyed on the **content digest** of the receipt body
  (`.ufo/waves/round-85/build/K85Critic/content-keyed/scripts/counter-receipt.mjs`) reads
  `C85_C1: HELD held=20/20` exit 0 on the frozen probe and
  `CONTENT_VARIATION: HELD held=3/3 distinct_sha=true` exit 0 on the frozen same-path control.
  I re-ran both myself against the frozen probe and control
  (`receipts/blind-content-keyed-{probe,cv}.txt`).
- A lane that reads only the **21-byte nonce header** and replays a static table
  (`.ufo/waves/round-85/build/K85Cheat/control-c.mjs`) reads `C85_C1: HELD held=20/20` exit 0
  (`receipts/blind-nonce-read-probe.txt`); K85Cheat's `strace-d2.txt` records exactly one
  `pread64(22, "rev=27d4c615bc7b32a2\n", 21, 0) = 21` and no body read.

The integrated `corpus/knowledge/counter-receipt-discrimination.md` states the limit as "v2 raises
the cost of a vacuous *answer*, not of a vacuous *test*". That wording understates what the
measurements show: a lane that satisfies **both** frozen gates never parses an arm row, so the
*answer* itself is not bound to comprehension. My draft adds the byte-bound-not-semantic limit
and a fifth `## Mistakes` row. This does not contradict L1's UNMET disposition — it explains
it: the three adversaries reaching 20/20 are exactly this class. The frozen predicate, probe and
controls were not edited, and the claim's disposition is not mine to make.

**The plan's S245 title does not match the record's title.** The plan's `## Frontier step`
names "*Oracle-based Test Adequacy Metrics: A Survey*"; the arXiv record's own
`citation_title` is "*A Brief Survey on Oracle-based Test Adequacy Metrics*". My registry draft
carries the title as printed on the record.

**The integrated lesson's S245 quote is 14 words; mine is 19.** The integrated Gate row quotes
"it does not provide any insights into the quality or quantity of test oracles" (14 words by
`wc -w`). My quote extends the same sentence to its full form, "… a core component of testing"
(19 words). Both are verbatim and byte-contiguous in the committed capture; the 19-word form is
the complete sentence, which the 14-word form truncates mid-sentence. I verified the sentence is
absent from the v1 and v2 abstracts, so the row's anchor must name **v3** — the integrated row
does name v3.

**`README_MAP` is red at the freeze commit.** The repair commit added the r84 spot-check's
README row but not its `.ufo/pins/readme-map.json` `covered` entry, so the map gate and
`plan-before-ready --round 85` both read red *at the frozen plan*. The integrated lesson records
this as the `map-pin-half` row; my measurement is the same row and adds the frozen-commit
measurement (the integrated row cites the working-tree repair, `close/map-repair.txt`, which is a
post-freeze artifact). Note for L1: the row's own fix text says the spot-check must be adopted
**before** the freeze commit, and the freeze commit in fact predates that adoption.

**The plan's real task names non-receipts.** The frozen plan's "Real task" names r84
`close/history-{red,repair}.txt` as receipts; those files are the v1 tool's own
`COUNTER_RECEIPT:` output lines. v2 reads them `FAIL-CLOSED SUMMARY_COUNT` (exit 2), which I
measured directly. The integrated lesson records this as `transport-vs-transcript`; my draft
keeps the row and adds the measured exit.

## Gates and observed results

Gates I ran myself, at the integrated working tree, all with receipts in `build/K85Scribe/receipts/`:
the frozen probe 20/20 exit 0; the frozen content-variation control 3/3 exit 0; the three
committed control tools 1/20, 0/20, 1/20 exit 1 each; the two blind lanes 20/20 and 3/3 exit 0;
`readme-map` DRIFT exit 1 at the freeze commit; `sources-check` CLEAN; `source-capture` CLEAN;
`plan-before-ready --round 85` FAIL `MAP_DRIFT` exit 1 at the freeze commit; the fleet
`sources-census validate` exit 0 with the six pre-existing W04 warnings.

Gates I did **not** run, and therefore do not report as passing: the candidate's own
`--selftest`; the integrated `close/` battery; `scripts/proxy-check.mjs`; `scripts/anchor-truth.mjs`;
`scripts/round-gate.mjs`; any mutation or sentinel battery. Those are other seats' and L1's
measurements, and their receipts are theirs.

## Out of scope

No production file, frozen plan, probe, control, `corpus/`, `SCORECARD.md`, `LOG.md`, `SKILL.md`
or another seat's subtree was modified. No git or jj operation was run on the lane; the only
git commands I issued were read-only (`archive`, `show`, `ls-tree`, `log`, `status`, `diff`) and
they wrote nothing into the lane. No install was needed and none was made. The scratch root
`/fast/scratch/hyaku/kumitate-r85/K85Scribe/` is deleted; its durable receipts were copied into
`build/K85Scribe/receipts/` first.

## Limits and out of scope

- I did not adjudicate C1. The kill rule, the claim's disposition and the SHONEN boxes belong to
  L1 and the non-author closure.
- My drafts are the scribe seat's independent versions. Where they differ from the integrated
  `corpus/` files, the differences are the ones listed above; L1 chooses.
- The quote I offer for S245 is the sentence's full 19-word form; L1's 14-word truncation is also
  verbatim and byte-locatable. Either satisfies the ≤25-word rule; the choice is L1's.
- The `byte-bound-not-semantic` finding is a limit of the frozen gate pair, not a defect in the
  claimed tool. I do not claim the integrated tool fails; I measured that the *gates* accept a
  blind lane.
- No install was needed: node v26.12.0 and the lane's own scripts were sufficient.

## Self-evaluation

Accuracy 4/5: every number I state comes from a receipt in my own build subtree with its
command and exit code; the one number I take from another seat is the 21-byte `pread64`, which I
read from K85Cheat's committed strace receipt and did not re-derive under strace myself.
Completeness 4/5: all four assigned drafts are delivered with headers, tables and citations; the
lesson's Gate and the sources rows carry the re-derivation notes, but the round's `close/`
battery is not mine to write. Clarity 4/5: drafts and report separate observed from required.
Actionability 4/5: the four drafts can be diffed against the integrated files directly, and the
two conflicts (title, quote length) are stated with the exact strings. Conciseness 3/5: the
report repeats receipt evidence for auditability. Overall 3.8/5. The highest-impact improvement
is L1's diff of the blind-lane limit against the integrated wording, since it is the one place
where my drafts say more than the integrated corpus does.
