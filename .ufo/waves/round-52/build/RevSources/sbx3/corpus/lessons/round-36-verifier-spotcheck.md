author: hyaku closure (non-author integrator, @m_opus)

# round-36 — non-author verification and spot-check (hyaku closure)

Written by the integrator, not the lane (CORPUS.md: outside reviews are new files; the lane owns
`round-36.md`). Inputs: fleet report `.ufo/reports/round-36/kumitate.md` (fleet commits
`20802331`, `4e80ceab`, `5f35dd72`, correction `6625a5d0`, erratum `ba523308`), prompt
`.ufo/prompts/kumitate-round-36.md`. Lane BASE `0614092e0804aaca06642cb3a263a05c1cacc98e` → work
`3d5760a8a4746a2fd18eb0f7bad1ec716d421987` → LOG correction `cb80bc1601dfe22fd4b435c9e881387b06d681e8` →
tip `91da27c6ac17712aa53ea0adb27d89b133d60081` (late wave evidence). Upstream pin: read-only clone
`/fast/scratch/kumitate-r36/src` at `31c465f15669f744848bd9f5d56191c5085670f7`. Watchdog digest
(copied): `2026-10-21T00:47:22-03:00 launch kumitate round=36 pgid=2986834 driver=hyaku-inline
attempt=1` / `2026-10-21T03:06:44-03:00 complete kumitate round=36; hyaku-inline attempt=1`.
The closure's read-only review seats were refused by the process job cap, so every check below
was run by the closure itself. No lane gate, selftest, upstream script or vault/account operation
was run. Gate behaviour is judged from committed code, committed transcripts and the closure's
own throwaway parsers over committed bytes and the read-only pin. Tool installs: none.

## Step-1 conformance

| check | command | observed |
|---|---|---|
| report author | `git log --format='%an %H' -- .ufo/reports/round-36/kumitate.md` | 5 commits, all `kumitate-shokunin`; last `ba523308` 03:05:41-03:00, before the driver `complete` line |
| SHONEN heading | report §SHONEN vs SHONEN.md boxes | 4 lines, 4 boxes, all `[~]` with pointers |
| cited hashes | `git merge-base --is-ancestor <h> master` for 0614092e, 3d5760a8, cb80bc16, 91da27c6 | all resolve, all ancestors (`31c465f1` is the upstream pin, not a lane commit) |
| pushed/clean | `scripts/hyaku/jj-lane.sh state …`; `git status --porcelain`; `ls-remote origin refs/heads/master` | `ahead=0 behind=0 tracked=0 untracked=0`; empty; remote = `91da27c6…` |
| prompt contract | difflib of `templates/round-prompt.md` (140 lines) vs prompt | 10 placeholder hunks replaced, nothing removed; §6 hyaku addendum appended (256 lines) |
| range | `git log 0614092e..91da27c6` | 4 lane-identity commits (3d5760a, 0b5dcfb late reports, cb80bc1 LOG correction, 91da27c late reports) |

Conformance defects (they do not affect the round's status):

- The falsify wave was validated but never dispatched: 81 spec items, and the
  `.ufo/waves/round-36/falsify/` directory is empty. The contract asks for a build wave and
  then a falsify wave. The report discloses this.
- Late build-wave evidence landed in `0b5dcfb` and `91da27c6`, after the first report commit.
- The report's misroot sweep is stale. A fleet-root `-.rej` (72,390 B, mtime 02:48-03:00) holds
  19 rejected hunks of `remaining-scripts-census.md`. It appeared after the sweep and is still
  untracked at the fleet root. The closure leaves it in place: it is not the closure's to delete.

## Claims — re-check

**C1 operability: does not verify.** The frozen claim reads "anchor fidelity becomes a gate term
and the lane's anchor debt burns down". The gate lines are evidence-verified:

- `.ufo/waves/round-36/final/` shows `CHECKLIST: 14/14 pass`, `SURFACE_PROBE: CLEAN (… known=1
  src-rev=31c465f15669)` and `FIDELITY: CLEAN (notes=20 anchors=1574 …)` with
  `FIDELITY_TOTAL … dead=168 noid=539 nonok=0`.
- `build/ReviewNumbersC1.md` records the before arm on pristine `0614092` at `nonok=543`.
- `PROXY: MATCH (A=7 C=14 operability=8; … C2=82/82 … R=92/92 …)` appears twice in the wave
  evidence.
- `git diff --stat 3d5760a8 91da27c6 -- scripts SKILL.md .ufo/pins corpus SCORECARD.md` is
  empty, so those runs measured the final bytes.
- The checklist count, re-measured, goes from 13 to 14 items.

Code read at 91da27c6: `scripts/claims-check.mjs` pairs with `const pair = next ?? prev ?? null`.
That is plain right-first pairing. The clause guard the report, the SCORECARD limits and the
lesson's `## Mistakes` table describe is absent.

Anchor truth was re-measured by the closure with its own parser. The parser has two rules:

- An anchor is the backticked `:N` or `path:N` span that follows a symbol span. The file is the
  most recent full path in the section.
- An anchor counts as "true" when the normalized symbol, or its longest identifier, appears on
  the cited line range in the pin.

It compares each anchor that moved between 0614092e and 91da27c6:

| note (axis family) | anchors moved | true before → wrong after | wrong before → true after |
|---|---|---|---|
| remaining-scripts-census.md (S8) | 167 | **102** | 24 |
| sighting-wall.md (S4) | 30 | **12** | 9 |
| route-probe-cluster.md (S7) | 47 | **5** | 1 |
| native-trial-launch.md | 35 | **4** | 22 |
| ops-watchers.md | 151 | 0 | 45 |
| failure-telemetry, queue-and-claim, route-resolution, runtime-remainder-census, swarm-wave-lifecycle | 46 | 0 | 44 |

The breakages are a systematic forward shift onto the next symbol. Examples:

- charter-scribe `config.json`: `cdpPort` moved from line 9 to line 10, which holds `"mode"`.
- `sync.mjs`: `BEGIN_MARKER` and `END_MARKER` now both cite line 57.
- `ufo-sighting-lib/base.mjs`: `SHIM_PATH` moved from line 19 to line 21, which is
  `MODULE_PATH`.
- `fake-omp.mjs`: `emitRaw` moved from line 98 to line 174, which is `flushSession`.

This reproduces the lane's own late finding (ReviewFidRemainder: 105 of 163) and extends it to S4,
S7 and native-trial-launch. Right-first pairing rewarded the shift, so `nonok` reached 0 while 123
previously true anchors became false. The notes carry no in-note marker. Only `LOG.md` (cb80bc1)
and the report correction say so, and the lesson's Mistakes row still claims the clause-guarded
fix landed.

The rest of C1 is real and evidenced:

- PIN v1 (`src-rev=` in the verdicts, scrubbed git env).
- The declared-order digest fix.
- Read-only dispatcher state.
- The `--known` pin of the upstream finding.

The closure re-checked the upstream finding in the pin: `ufo-sighting.mjs` dispatches `surface`
and `ufo-sighting-lib/surface.mjs` omits it, as stated. Verdict: **fails as declared**. The
burn-down half is falsified by anchor truth, and the integer stays 8 (`f_O` 20/23 → 21/24).

**C2 coverage:runtime-layer: verifies.** Plain re-measurement:

- The 9 member files exist at the pin under `crates/ufo-core-runtime/src/`.
- `native-admission-detail.md` goes from 3 to 7 `## ` sections, adding exactly the 4 R5 files.
- `local-ship.md` goes from 10 to 15 sections, adding exactly the 5 R7 files.
- New anchors: 38/38 in native-admission-detail use the "At `path:N`, `symbol`" convention, and
  42/42 in local-ship use the symbol-then-anchor convention. Every symbol sits on its cited line,
  for 80/80 as claimed.

Prose sampled against the pin, all true:

- `seat_label` formats `{}-{:02}`.
- `FAILURE_RULES` is an 8-row table in the stated order.
- `DispatchLaneFailureDetailError` has exactly `Grammar` and `MissingId`.
- The `ToolFailure` arm fires on the word `process` (`native_text.rs` line 136).
- `correlation_group_for` material is `omp-native-correlation-v1\0…`.

Evidence-verified: `CLAIMS: MATCH (rows=2 yes=2 notes=2 sections=9 adv=0 src-rev=31c465f15669)` and
the proxy line `R=92/92 coverage:runtime-layer=10`. The ReviewFidSmallB semantic failures
(`native-admission-detail.md` line 29, `local-ship.md` lines 31-32, swarm-wave-lifecycle) are
pre-existing base lines, or lines inside the unapplied ExecFidSmall patch. They are not
C2-introduced text.

## Per-axis verdicts

`git diff 0614092e 91da27c6 -- SCORECARD.md`: +29/−9. The proxy stanza moves C 13→14, C2 79→82,
R_sections 83→92 and coverage_runtime 9→10, and the pins are refreshed. The Axes runtime row now
reads `10` but its evidence text still says `floor(10 × 11/11 × 83/92)` = 9. The Move-log row
quotes `C2=81/81`.

| axis | verdict | basis |
|---|---|---|
| operability | unprovable | C1 fails as declared; pin/digest/read-only fixes are real, but the fidelity term certifies false anchors; integer held 8 |
| coverage:runtime-layer | improved | R distinct 83→92/92, 80/80 anchors true, prose sample true |
| coverage:script-layer | **harmed** | S4/S7/S8 member notes lost anchor truth: 119 true anchors made false (102 + 12 + 5), not marked in the notes; the integer 10 holds only because the proxy counts section identities |
| coverage (retired) | unchanged | terminal 10 |
| coverage:kimi-layer | unchanged | K 51/51 unchanged |

## Discernment spot-check (LEARNING.md)

| item | decision | re-opened source | verdict | reason |
|---|---|---|---|---|
| S030 pytest strict xfail | admit | https://docs.pytest.org/en/stable/how-to/skipping.html (closure re-opened 2026-10-21) | agree | “This will make XPASS (“unexpectedly passing”) results from this test to fail the test suite.” verbatim, 15 words |
| S031 git rev-parse `--verify` | admit | https://git-scm.com/docs/git-rev-parse | agree | “If so, emit it to the standard output; otherwise, error out.” verbatim, 11 words; supports the unverifiable-vs-mismatch split |
| S032 Reproducible Builds recording | admit | https://reproducible-builds.org/docs/recording/ | agree | 23-word quote verbatim in rendered text |
| cite-check pinning | held (rejected for this round) | `git grep -c -- --pin 91da27c6 -- scripts/cite-check.mjs` | agree | no `--pin` arm (exit 1); the limit is named and pre-registered |
| `dead` anchors gated | held | `final/fidelity.txt` | agree | `dead=168` printed, outside `nonok` |
| S020 LangGraph locator | rejected (standing) | https://docs.langchain.com/oss/python/langgraph/durable-execution | agree | 200 after redirect to `/persistence`; no `durability=` mode semantics on the page |

Agreement: 3/3 sampled admits and 3/3 held or rejected decisions. New-row check: S029–S032 sit in
`corpus/SOURCES.md` as A/mined, opened 2026-10-21. S029's pin equals
`git -C /fast/scratch/kumitate-r36/src rev-parse HEAD`. Quote counts are 15, 11 and 23 words, all
≤25.

`scripts/sources-census.sh validate --root /home/vgpnk/Projects/shokunin kumitate` exits 0 with
`kumitate ok …/corpus/SOURCES.md` and no warnings. QUALITY.md diff: empty, so no criterion was
added for the pairing mistake this round. Its `## Mistakes` row records a fix that did not land.

## Round-35 debts

- Anchor fidelity as a gate term (round-35 routed 1): the term landed, but it is gameable.
  Right-first pairing was satisfied by shifting anchors, so the routed intent (symbol-on-line
  truth) is **not learned**.
- Unbacked comparisons (round-35 routed 2): reproduced in `build/ScoutCiteProvenance.md`.
  **Learned.**
- S1–S7 debt of 624 (round-35 routed 3): re-scoped to the arm's own measure. The `nonok` burn-down
  is not truth (above), so this is **partial**.
- Moving-checkout `final/cite.txt` (round-35 routed 4): this round's evidence names the pin, but
  `cite-check` stays unpinned. **Partial**, with the limit named.

## Trend verdicts

- expansion — **improved**: `knowledge/pinned-evidence.md` adds new ground; the R5/R7 member
  sections take runtime coverage to 92/92; four new mined sources.
- quality — **harmed**: 123 previously true anchors in four admitted notes (S8, S4, S7,
  native-trial-launch) now cite the wrong line. The notes themselves carry no marker, and the
  lesson's Mistakes table states a fix that is not in the tree. Expansion improved with quality
  harmed is a trade, and a trade is never admitted.
- discernment — **unchanged**: sampled source decisions agree (3/3 admits, 3/3 holds/rejects).
  The round's own fidelity instrument disagreed with anchor truth, and the lane caught that only
  after landing. That disagreement has no `QUALITY.md` criterion yet.

## Adjudication

**REJECTED: an axis is harmed.** C2 verifies. C1 fails as declared, and coverage:script-layer is
harmed by the shift-repair. The author's correction is honest and accurate in direction, but it
understates the scope: S4, S7 and native-trial-launch broke too, not only S8. Status `ok`: this is
a real report with checkable work. SHONEN boxes stay `[~]`, and promotion remains operator-owned.

## Routed defects (lane owes next round)

- D1 Restore anchor truth in `remaining-scripts-census.md`, `sighting-wall.md`,
  `route-probe-cluster.md` and `native-trial-launch.md`. For each moved anchor, keep the base line
  wherever its symbol is still on that line. Until the notes are repaired, mark each of them in
  the note itself.
- D2 Make the fidelity rule one canonical pairing, either integrated or retired. Add a selftest
  case where the shifted-to-next-symbol mutation must read non-ok. A `nonok` ratchet that a shift
  can satisfy is not a fidelity gate.
- D3 Correct the lesson `## Mistakes` row and the SCORECARD limits text that call the shipped
  pairing "clause-guarded", using a named appended correction. Also correct the Axes runtime-row
  evidence that still says 83/92 = 9, and the stale `C2=81/81` quotes.
- D4 Add a `QUALITY.md` criterion citing this note: a gate term that admits anchors must be
  checked against symbol-on-line truth before landing.
- D5 Dispatch the falsify wave before the report. If budget stops it, the round may not claim the
  attacked arm.
- D6 Remove or claim the fleet-root `-.rej` stray (19 hunks of `remaining-scripts-census.md`), and
  re-run the misroot sweep after every late patch attempt.
- D7 Apply or discard `ExecFidSmall.patch` explicitly. Its four ReviewFidSmallB semantic failures
  must be fixed first.
- D8 Add the `corpus/README.md` map row for this note, so the proxy's C2_total stays in step, as
  in round 35.
