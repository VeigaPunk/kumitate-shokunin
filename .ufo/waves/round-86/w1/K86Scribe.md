# K86Scribe — round-86 scribe report

Seat `K86Scribe` (scribe), lane `kumitate-shokunin`, 2026-11-04. Read-only on the
lane corpus; every draft below lives under
`.ufo/waves/round-86/build/K86Scribe/` and is paste-ready for the L1.

## Behavior

The round-86 claim (C1) is that the lane's counter-transcript checker binds BOTH
halves of its answer to the bytes it read: the receipt half already carried a
sha256, the source half did not. The scribe's job was the corpus half of that
claim — the knowledge entry, the round-86 `## Gate` block, the `corpus/README.md`
coverage-map rows, and the `## Mistakes` block.

I opened both cited sources myself this round rather than reusing the integrating
seat's fetch, and recorded my own receipts.

**Source 1 (admit) — S248, the survey's reachable full text.**
`https://eecs481.org/readings/testoracles.pdf` → HTTP 200, 773275 B, sha256
`6c5689497594a75f08c1b37b3dd361e11c54946bbbf79f670d660f5d298d3d51`, byte-identical
to the round's `open/testoracles.pdf` capture (independently re-fetched, not read
from the working tree). Located quote (16 words, ≤25), PDF page 1, §1 Introduction:

> we need a test oracle, a procedure that distinguishes between the correct and
> incorrect behaviors of the System Under Test (SUT)

Located by `pdftotext -layout` page 1, lines 33–36 of the extracted text; the
same sentence also appears in the reader's own page-1 rendering.

**Source 2 (reject) — S249, the hash API as evidence of semantic correctness.**
`https://nodejs.org/api/crypto.html#hashdigestencoding` → HTTP 200, 1190370 B,
sha256 `1aa0f3ad2e2b04c382cbba5b7ad9b192d35a495e75b42ef934b0d77459395fcc`. Located
quote (12 words), `hash.digest([encoding])` section, HTML line 2070:

> Calculates the digest of all of the data passed to be hashed

Reject reason: an API that computes a digest over bytes it was handed says the
digest binds those bytes; it says nothing about whether those bytes are the
expected source or who produced them. Flip: independently specified expected
behaviour plus provenance evidence for the hashed bytes, not a digest alone.

**The S246 flip, decided honestly.** The r85 non-author spot-check (defect
R85-V10) recorded that S246's flip — "an accessible full text with a locatable
sentence" — was already satisfied when the reject row was written. Re-probed
2026-11-04: `https://dl.acm.org/doi/10.1109/TSE.2014.2372785` → HTTP 403 (5559 B),
while the eecs481 PDF is HTTP 200 and carries the quoted sentence. The reject
survived because the flip was checked only at the cited locator, never at the
work. The honest resolution is the admit of the reachable full text (S248), with
S246's historical 403 kept in the registry rather than rewritten.

## Drafts (all in `.ufo/waves/round-86/build/K86Scribe/`)

| draft | purpose | sha256 (16) | bytes |
|---|---|---|---|
| `knowledge-counter-receipt-source-binding.md` | the round-86 knowledge entry, ready to paste over `corpus/knowledge/counter-receipt-source-binding.md` | `3a5f03a522a896f5` | 3270 |
| `lesson-round-86-gate.md` | the `## Gate` block for `corpus/lessons/round-86.md` | `6aa12166f09344af` | 3590 |
| `sources-rows.md` | the two SOURCES.md registry rows behind those Gate bullets | `b08861f868fa1027` | 3423 |
| `readme-map-rows.md` | the two `corpus/README.md` coverage-map rows | `616bc2afe8db09aa` | 1659 |
| `lesson-round-86-mistakes.md` | the `## Mistakes` block for `corpus/lessons/round-86.md` | `afef0f6d6b96d744` | 5769 |

## Gates

Every gate below was run against a scratch copy of the lane with all five drafts
applied (a copy of the tree, so the lane corpus was never modified).

| gate | command | result |
|---|---|---|
| frozen probe | `node .ufo/waves/round-86/probe/probe86-c1.mjs --lane . --work <scratch>` | `C86_C1: HELD held=24/24`, exit 0 |
| readme-map | `node scripts/readme-map.mjs` | `README_MAP: CLEAN files=219 rows=219 covered=219`, exit 0 |
| proxy | `node scripts/proxy-check.mjs --strict` | `PROXY: MATCH (A=35 C=45 operability=9; …)`, exit 0 |
| sources-check | `node scripts/sources-check.mjs` | `SOURCES_CHECK: CLEAN (rows=187 …)`, exit 0 |
| source-dupes | `node scripts/source-dupes.mjs` | `SOURCE_DUPES: CLEAN groups=7 known=7`, exit 0 |
| source-capture | `node scripts/source-capture.mjs` | `SOURCE_CAPTURE: DRIFT captures=73 exemptions=111 bad=3 first=S247:uncaptured`, exit 1 — **pre-existing, not caused by these drafts** (see findings) |
| cite-check | `node scripts/cite-check.mjs --json` | corpus total 2601 → 2599 errors in the applied scratch copy; `corpus/lessons/round-86.md` 3 → 1; `corpus/README.md` and `corpus/SOURCES.md` unchanged at 64 / 37; **no new unresolved token** in any touched file. For reference, under identical flags the lane read 2289 errors at base `23235099` against 2292 now |

Row-shape checks, run on the drafts themselves:

- the two drafted SOURCES rows parse as **11 pipe-separated cells** each
  (`awk -F'|'` → NF=13) with **no literal `|` inside any cell** (verified by
  splitting each row and asserting 11 cells and zero interior pipes);
- the drafted README coverage-map rows parse as 3 cells, matching the table's own
  header and all 219 existing rows (`NF=5`);
- the drafted `## Mistakes` rows parse as 4 cells, matching the round-84 and
  round-85 lessons' Mistakes tables.

## Findings

1. **`SOURCE_CAPTURE` is red at the measured tree, independently of this seat.**
   `node scripts/source-capture.mjs` reads `DRIFT … bad=3 first=S247:uncaptured`
   (S247, S248, S249 all uncaptured) — the three rows the round added have no
   capture entry in `.ufo/pins/source-captures.json`, and the round's own capture
   bytes (`open/survey.html`, `open/testoracles.pdf`) are untracked
   (`git status` shows them as `??`). The gate reads a capture path relative to
   the lane root and requires the file to exist, so the untracked bytes plus the
   missing registry entries are both halves of the red. This is an integration
   step for the L1, not something a draft can fix.

2. **The frozen prose undercounts the runtime-randomised arms.** The frozen probe
   header (`.ufo/waves/round-86/probe/probe86-c1.mjs:2`) and the frozen plan
   (`.ufo/waves/round-86/plan.md:35`) both say twelve arms generate their receipt
   at run time. Measured by instrumenting a scratch copy of the frozen probe and
   comparing each arm's expected receipt digest across two runs of the same
   probe: **21 of 24** arms produce a different expected `sha256` on the second
   run; only `honest-red`, `missing-receipt` and `usage` are byte-stable. The plan
   also says four arms assert the source digest; measured, **nine** arms carry a
   source digest and **eight** of those change it between runs. The frozen files
   are not edited — the claim that survives is the weaker one, and the mined
   `number-drift` row records the measured counts with the instrument that
   produced them.

3. **A citation-form defect that this round's own lesson repeats.** The round-86
   lesson cites three wave-relative paths and `cite-check` reports all three as
   `UNRESOLVED` errors. Prefixing each with its lane-relative path drops that
   file's errors 3 → 1 (the remainder is the header line's own token, which this
   draft does not touch). The round-85 lesson has 5 such errors. Under identical
   flags the corpus read 2289 errors at the base commit `23235099` against 2292
   now — the +3 being exactly this lesson's three tokens — so this is a
   lane-wide condition with a round-86 increment of three, not a round-86
   regression. The mined `reference-drift` row records it, and the drafts use the
   resolving lane-relative form. Two citation traps were found and avoided while
   drafting that row: a bare wave-relative path inside backticks is censused and
   read `UNRESOLVED`, and the marker word *commit* beside a hash makes the hash
   read as a pin (`REV_UNKNOWN`) — so the row names the offending paths as plain
   prose and cites the base revision in the `base` form the lesson header
   already uses.

4. **The Q21 Gate-bullet shape.** `QUALITY.md` Q21 requires every `## Gate`
   decision bullet to open with `Admit`/`Re-open`/`Reject`/`Hold`, and its
   mechanical check greps `^- \*\*(Reject|Hold)`. The house shape
   `- **S248 — admit, mined, B.**` reads **0** on that grep in round-85, round-84
   and the currently-integrated round-86 lesson alike. My draft uses
   `- **Admit — S248, mined, B.**` and `- **Reject — S249, …**`, which reads **1**
   on the Q21 grep while keeping the id, decision, tier, quote, fetch receipt,
   reason and flip each in one bullet. The L1 may adopt the shape.

5. **A dupes hazard for any attempt to re-open these sources as new rows.**
   Measured: adding a second row for `eecs481.org/readings/testoracles.pdf` under a
   different scope, and a second for `nodejs.org/api/crypto.html#hashdigestencoding`
   under a different scope, makes `node scripts/source-dupes.mjs` read
   `SOURCE_DUPES: DRIFT groups=9 known=7 bad=2 first=new-duplicate:eecs481.org/readings/testoracles.pdf ids=S248,S250`
   (exit 1). The drafts therefore **replace** S248 and S249 in place (same ids,
   same URLs, same scopes; refined `anchor`/`teaches` cells) rather than minting
   new ids. `source-dupes` stays CLEAN.

## Touched surfaces

Written by this seat (all under the wave's own build directory, plus this report):

- `.ufo/waves/round-86/build/K86Scribe/knowledge-counter-receipt-source-binding.md`
- `.ufo/waves/round-86/build/K86Scribe/lesson-round-86-gate.md`
- `.ufo/waves/round-86/build/K86Scribe/sources-rows.md`
- `.ufo/waves/round-86/build/K86Scribe/readme-map-rows.md`
- `.ufo/waves/round-86/build/K86Scribe/lesson-round-86-mistakes.md`
- `.ufo/waves/round-86/w1/K86Scribe.md` (this report)

Nothing else in the lane was edited: no corpus file, no `SCORECARD.md`, no
`README.md`, no pin, no script, no git state. The gate runs above were executed
against a scratch copy of the tree.

## Out of scope

- The `source-capture` red and the untracked `open/` capture bytes: the L1's
  integration step (finding 1).
- The 2601-error corpus-wide `cite-check` red: a pre-existing lane condition
  spanning the older lessons; this round's drafts move the round-86 files in the
  right direction and add no new unresolved token.
- Editing the frozen probe or plan to correct the arm counts (finding 2): the
  frozen text is not rewritten; the correction is recorded as a mined mistake.
- The `round-gate` reds for round 86 (no `.ufo/reports/round-86/kumitate.md`, no
  `| 86 |` SCORECARD row, no LOG entry): the L1's close steps.
- Every other seat's wave output.

## Tooling

No package was installed, upgraded or removed by this seat; the tools used were
already present: `node` v24.21.0 (`node --version`), `curl`, `pdftotext`
(poppler, via `pdftotext -layout`), `python3`, `awk`, `rsync`, `sha256sum`,
`git` (read-only). No `pacman` transaction was attempted — the host-wide pacman
pause was respected. Scratch lived under
`$HYAKU_SCRATCH/kumitate-r86/K86Scribe/` and is removed on exit; nothing
citable lived under `/tmp`.

## Commands run (receipts)

```
node .ufo/waves/round-86/probe/probe86-c1.mjs --lane . --work <scratch>   # C86_C1: HELD held=24/24, exit 0
node scripts/readme-map.mjs                                                 # README_MAP: CLEAN files=219 rows=219 covered=219, exit 0
node scripts/proxy-check.mjs --strict                                       # PROXY: MATCH (A=35 C=45 operability=9; ...), exit 0
node scripts/sources-check.mjs                                              # SOURCES_CHECK: CLEAN (rows=187 ...), exit 0
node scripts/source-dupes.mjs                                               # SOURCE_DUPES: CLEAN groups=7 known=7, exit 0
node scripts/source-capture.mjs                                             # SOURCE_CAPTURE: DRIFT ... bad=3 first=S247:uncaptured, exit 1 (pre-existing)
node scripts/cite-check.mjs --json                                          # corpus 2601 -> 2599 errors; round-86 lesson 3 -> 1
awk -F'|' '/^|[[:space:]]*S[0-9]{3,}[[:space:]]*\|/ && NF!=13 {n++} END{print n+0}' corpus/SOURCES.md   # 0
```

Source fetches (2026-11-04, `curl -sSL --max-time 60`):

```
https://eecs481.org/readings/testoracles.pdf   HTTP 200  773275 B  6c5689497594a75f08c1b37b3dd361e11c54946bbbf79f670d660f5d298d3d51
https://nodejs.org/api/crypto.html              HTTP 200  1190370 B  1aa0f3ad2e2b04c382cbba5b7ad9b192d35a495e75b42ef934b0d77459395fcc
https://arxiv.org/abs/2212.06118                HTTP 200    43275 B  838d07156c06a6fb38927fd79b4d87548dba92b5e0d5f601af83c031ffa5bbd2
https://dl.acm.org/doi/10.1109/TSE.2014.2372785 HTTP 403    5559 B  02e6fff8803ff7116fa32a7138fc73f3e14863963298fa5c8d0b5d9c6a2c4805
```

The arXiv fetch reproduces the round's `open/survey.html` byte-for-byte
(`838d0715…`), and the eecs481 fetch reproduces `open/testoracles.pdf`
byte-for-byte (`6c568949…`); both are independent re-fetches, not copies.
