# Round 40 — a round-open floor for the truth gate, and the seventh Kimi skill

Source: S035 (the Kimi user-scope skill `kimi-webbridge`, opened this round), S036 and S037 (the
mutation-testing-elements report schema, opened this round), S012 (re-opened), the round-39
non-author closure (`corpus/lessons/round-39-verifier-spotcheck.md`, routed defects R39-1 to
R39-8) and the pinned upstream revision 31c465f15669f744848bd9f5d56191c5085670f7.
Round open: lane f69817edf687c8ce4f87ed7953a353399232f69e. Measured production revision:
1530a75521345e0f4516ed7146180e65f788e017 (code, pins, notes and sources), attacked by wave 2;
falsify follow-up 5ae8ac9cbb1697e30ec32b717b8c4dafb757315c (one gate change, AT46, re-measured
below); later commits carry documents and evidence only. Receipts: `.ufo/waves/round-40/open/`,
`.ufo/waves/round-40/final/`; seat reports: `.ufo/waves/round-40/build/`,
`.ufo/waves/round-40/falsify/`.

## Claims

1. **operability — the truth gate refuses the round-39 routed attacks it accepted at open.**
   `scripts/anchor-truth.mjs` gains `--open REV`, the round-open revision named on the command
   line, never read from a lane file. With it, a `review:<seat>` pin source counts only when a
   review record committed at REV binds the same note, seat and token to the same anchor
   identity (raw text, path and occurrence), else `REVIEW_UNBOUND` (R39-1); and the pin at REV
   is a second floor: `BASE_TRUE_LOST`, `DEBT_GREW` and `CHECKED_SHRANK` run against it, and every
   current debt anchor must equal a debt anchor at REV by identity and token, else `DEBT_NEW`
   (R39-2 swaps, R39-3 headroom). Counting command:
   `node --input-type=module - --lane <lane> --rev <rev> --src <pinned clone> --base e18ff1af3392e3823227644c977c237737fe65c9 < .ufo/waves/round-40/probe/floor-probe-v2.mjs.txt`.
   It applies 26 named attacks (P01–P12 from the round-39 falsify reports, A1–A6 replayed from
   the round-39 probe, eight round-40 critic attacks) and 10 named benign edits to a temp clone
   at `<rev>` and runs that revision's own gate. Before at f69817ed: `attacks_accepted=20/26`,
   `benign_clean=10/10`, `setup_errors=0` (A1–A6 were already refused). Declared after:
   `attacks_accepted=0/26` with `benign_clean=10/10` and `setup_errors=0`. The claim is about
   these 26 named attacks and 10 named benign edits, not about every possible edit.
2. **coverage:kimi-layer — the declared integers match the derived ones again.** At open,
   `node scripts/proxy-check.mjs --src <pinned clone>` printed 5 error rows, two of them
   `AXES_DRIFT` (coverage 10 against derived 9 because the round-39 closure file had no README
   map row; coverage:kimi-layer 10 against derived 9 because `~/.kimi-code/skills/` holds a
   seventh child), `PROXY: DRIFT`, exit 1. Declared after: 0 error rows, `PROXY: MATCH`, exit 0,
   with the `## Axes` rows for coverage and coverage:kimi-layer still at 10 (they are not
   lowered to match). The learning is the new K2 section
   `corpus/knowledge/kimi-skills-plugins.md` `## ~/.kimi-code/skills/kimi-webbridge`: a real
   directory holding version 2.0.26 of a skill whose managed-plugin copy is 1.11.3, both
   declaring `name: kimi-webbridge` — so the note's earlier "no collision on this host" reading
   is false (erratum appended). Census `KIMI_CENSUS: DRIFT (UNLISTED skills/)` →
   `CLEAN (members=52 …)`. Rests on S035.

## Measured

- C1: `FLOOR_PROBE2 attacks_accepted=20/26 benign_clean=10/10 setup_errors=0` at f69817ed
  (`.ufo/waves/round-40/final/floor-probe2-open.txt`) →
  `attacks_accepted=0/26 benign_clean=10/10 setup_errors=0` at 1530a755
  (`.ufo/waves/round-40/final/floor-probe2-measured-1530a755.txt`). Direct entry at 1530a755
  with `--base e18ff1af… --open f69817ed…`: `TRUTH: CLEAN (… true=778 debt=20 unchecked=13 …)`,
  the same totals as at open. Selftest 30/30 → 41/41.
- C1 red-before: the open gate logic with the new review cases reads 30/34, AT31–AT34 failing
  (`.ufo/waves/round-40/build/ExecReviewBind.md`); with the new open-floor cases 30/34,
  AT39–AT42 failing (`.ufo/waves/round-40/build/ExecNewDebtIdentity.md`).
- C2: at f69817ed `PROXY: DRIFT`, 5 error rows (`.ufo/waves/round-40/open/receipts.txt`); at
  1530a755 `PROXY: MATCH (… C2=89/89 coverage=10; … K=52/52 coverage:kimi-layer=10; pins=6
  match …)`, 0 error rows. `ls -A ~/.kimi-code/skills | wc -l` → 7 on 2026-10-22. The census
  re-pin is shown able to fail: declared count 6 reads `DRIFT (UNLISTED skills/)`, 8 reads
  `DRIFT (MEMBER_MISSING skills/)` (`.ufo/waves/round-40/build/ExecKimiCensus.md`).
- C1 follow-up at 5ae8ac9c: four wave-2 critic seats borrowed a committed review record through
  the nested-range fallback while the record's own anchor still existed (a false claim then read
  CLEAN under `--open`). The fallback now applies only when the record's own anchor identity is
  gone, and one record binds at most one entry that way (AT46; red-before: the 1530a755 logic
  with the new selftest reads 41/42, AT46 failing, `.ufo/waves/round-40/final/at46-red-before.txt`).
  All five borrow replays read `REVIEW_UNBOUND`, exit 1
  (`.ufo/waves/round-40/final/borrow-replay-5ae8ac9c.txt`); probe at 5ae8ac9c
  `attacks_accepted=0/26 benign_clean=10/10 setup_errors=0`
  (`.ufo/waves/round-40/final/floor-probe2-measured-5ae8ac9c.txt`); mutant runner 26/26
  (`.ufo/waves/round-40/final/mutants-5ae8ac9c.txt`); selftest 42/42. The checklist truth item
  now carries `--open f69817ed…`, so the default command is the sound mode for this round.
- R39-4: the mutant runner `.ufo/waves/round-40/probe/run-mutants-v2.py.txt` (the 11 round-39
  mutants plus the 15 of the round-39 seat CritClaimC2) reads 23 killed, 3 survived at f69817ed
  (`.ufo/waves/round-40/final/mutants-open.txt`) and 26 killed at 1530a755
  (`.ufo/waves/round-40/final/mutants-measured-1530a755.txt`); AT43–AT45 kill the three round-39
  survivors (fixtures by the seat MutAnchorSurvivors). The ledger is written in the
  mutation-testing-elements report shape and validates against S036 with 0 errors.
- R39-5: dropping only `totals.resolved > 0` at `scripts/cite-check.mjs:1590` passed 62/62 at
  f69817ed; two hermetic cases (zero resolved citations with no drift reads FAIL; a clean
  fixture reads PASS) make the suite 64/64 and kill that mutant, `resolved >= 0` and
  `filesScanned <= 0`; `filesScanned >= 0` survives as an equivalent mutant
  (`.ufo/waves/round-40/final/cite-zero-resolved-red-before.txt`).
- R39-7: committed cite-check receipts for 654d1b28, d8bb37db and f69817ed in two fleet forms
  (`.ufo/waves/round-40/final/cite-receipts/`): 643 → 639 → 659 errors with the round-39
  receipt's fleet layout, 501 → 494 → 510 against the real fleet root. The round-39 report's
  `639 → 639` compared against its own round open; the +20 at f69817ed is the round-39 closure
  file, not a regression (`.ufo/waves/round-40/build/ReviewCiteReceipt.md`).
- R39-8: the pin's clone path moved to `/fast/scratch/hyaku/kumitate-pin/src` (recreated at the
  pin, tree identical to the round-39 closure clone; commit 8eea5608). Checklist, measured by the
  falsify seats ScoutChecklistCand and CritCalibration: a bare clone reads 8/15 at f69817ed and
  13/15 at 1530a755 (the two round-gate items need the fleet repo as parent); a clone laid out
  like the lane reads 10/15 → 15/15. The pin move fixed three items and C2 fixed two
  (proxy and census); the L1's in-lane run before the measured commit read 15/15.

## Correction (R39-6)

The round-39 report attributed kumitate's `W04` census warning to sibling adjacency ("kama and
tameshi hold the same URL in their own registries"). The warning is intra-lane: the fleet
`scripts/sources-census.sh:644-645` prints W04 from `url_seen`/`url_scopes`, arrays filled
inside one `row_pass` call (`:651-653`), and `row_pass` runs once per registry file (`:717`).
The duplicate is kumitate's own `S023` (opened 2026-10-20) and `S034` (opened 2026-10-22): the
same Stryker page under two scope strings. The cross-lane fact the report quoted comes from the
census's separate `shared` mode. The round-39 lesson's S034 admit also did not say that S023
already held the page. Disposition: both rows stay (each is cited: S023 by the round-35 lesson,
S034 by Q19); no append-only move clears this W04 (it ignores status), so it stays logged as an
explained intra-lane warning (`.ufo/waves/round-40/build/ScribeLessonDraft.md`).

## Mistakes

| class | evidence | captured-by | fix |
|---|---|---|---|
| survivor — a verdict guard no selftest pinned: dropping `totals.resolved > 0` from the cite-check verdict passed the whole suite and turned FAIL into PASS on a scanned document with zero resolved citations | `scripts/cite-check.mjs:1590` at f69817ed; mutant 62/62 survived (`.ufo/waves/round-40/final/cite-zero-resolved-red-before.txt`, `.ufo/waves/round-40/build/MutCiteGuard.md`) | none in the lane: found by the tameshi round-26 closure and routed as R39-5 | two hermetic cases; the same mutant now fails 63/64; `corpus/QUALITY.md` Q20 makes it a rule. Shown able to fail: the red-before receipt above |
| attribution — a census warning was credited to sibling lanes without reading the code that emits it | round-39 report line 176; `scripts/sources-census.sh:644-653,717` (fleet) | the round-39 non-author closure (R39-6) | the correction above, made after reading the emitter; the W04 line is quoted with its command in `## Gate` |
| vacuous control — a benign control in this round's first probe cited a symbol one line off (`MAX_N_PREDICT` at `scripts/local-helper.mjs:12`; it is at line 11), so "a new true anchor" was a new false anchor; the open gate read it CLEAN under the debt headroom, and the candidate refused it, which first looked like a benign harm (benign 8/10) | `.ufo/waves/round-40/final/floor-probe2-integration-c3d9547.txt` was re-run after the fix; the seat's original probe is `.ufo/waves/round-40/probe/floor-probe-v2.seat.mjs.txt`, cases B03 and B04 | the candidate gate itself (`DEBT_NEW` on the new anchor), then the L1 reading the pinned source | the L1 moved both controls to line 11 and re-ran both revisions (benign 10/10 at both). The same edit also made setup errors count as neither accepted nor refused (`setup_errors` total), and committed the forged records of three attacks inside the probe's temp clone so the write path did not abort them |
| scope — the new review binding accepted a nested re-citation of any reviewed range in the same file, even while the reviewed anchor still existed, so a second anchor could borrow a record; the binding rule was written to keep honest widening bound and was not attacked for borrowing before the measured commit | `.ufo/waves/round-40/falsify/AtkReviewForge.md`, `.ufo/waves/round-40/falsify/AtkNovelRecords.md` (five accepted borrows at 1530a755) | the falsify wave (four critic seats); no wave-1 item attacked the binding rule itself | fallback only when the record's own anchor is gone, once per record (5ae8ac9c); AT46 fails on the 1530a755 logic (41/42, `.ufo/waves/round-40/final/at46-red-before.txt`) |
| landing — the wave-1 seat-gate reservation was released at 15:16Z, after the last wave-1 seat had returned; the contract asks for release once every seat returns, and the gap held 32 seats the fleet could have used | `.ufo/waves/round-40/evidence/seat-gate.txt` | none (no check exists) | release right after the last seat returns; recorded so the next round's L1 does it at once |

## Gate — admits and rejects

- **Admit S035** (own-work, tier A): the host path `~/.kimi-code/skills/kimi-webbridge/`, read
  only (list, stat, sha256, the SKILL.md front matter), opened 2026-10-22 about 14:07Z by the
  seat ScribeKimiSkillNote; no secret file read. Located quote, `SKILL.md:2` and `:6`:
  "name: kimi-webbridge" … "version: \"2.0.26\"". Used by `corpus/knowledge/kimi-skills-plugins.md`.
- **Queue S036 and S037** (spec, tier A): the mutation-testing-elements report schema at the upstream commit named in its URL
  (https://raw.githubusercontent.com/stryker-mutator/mutation-testing-elements/140f211984e8a0c926ec305a550da425f9bb8d69/packages/report-schema/src/mutation-testing-report-schema.json,
  line 92, quote: `"enum": ["Killed", "Survived", "NoCoverage", "CompileError", "RuntimeError", "Timeout", "Ignored", "Pending"]`)
  and the npm release 3.9.0
  (https://registry.npmjs.org/mutation-testing-report-schema/-/mutation-testing-report-schema-3.9.0.tgz,
  line 41 of the schema file inside that tarball, quote: `"required": ["id", "mutatorName", "location", "status"]`),
  both opened 2026-10-22T14:10:55Z by the seat ScribeSourceMTE by plain HTTP. They stay `queued`
  (used-by `—`): the ledger validates against S036, but no admitted entry cites them yet.
- **Re-open S012** (Kimi Code CLI docs, Agents and Sub-Agents,
  https://moonshotai.github.io/kimi-code/en/customization/agents.html, HTTP 200, 2026-10-22 about
  14:04Z, seat ScoutSourcesRecheck). Recorded quote still present (18 words): "more specific
  scopes take higher priority: Explicit (--agent-file) > Project > Extra > User > Plugin >
  Built-in". Change logged: `status queued → mined`; `used-by — → corpus/knowledge/kimi-lane-definitions.md`;
  opened, recheck and anchor unchanged.
- **W04 kept, explained:** `scripts/sources-census.sh validate --root /home/vgpnk/Projects/shokunin kumitate`
  → `kumitate W04 S034 duplicate url stryker-mutator.io/docs/mutation-testing-elements/mutant-states-and-metrics across scopes`,
  `kumitate ok …`, exit 0 (see the R39-6 correction).
- **Reject (this round):** a strict token-equality rule for base-true anchors. The critic seat
  CritC1Design showed it refuses an honest re-key on the same line (BEN_REKEY), and the open
  floor already refuses the swaps; the seat building the swap-signature arm (ExecTokenKept) did
  not deliver before the scope freeze and was cancelled, so no token arm landed.
- **Reject:** documenting the webbridge browser commands, daemon or CLI workflow in the K2
  section: that ground is tabi's (`tabi-shokunin/corpus/knowledge/webbridge-plugin-anatomy.md`);
  kumitate records only install and load facts (`.ufo/waves/round-40/build/ConnSiblingOverlap.md`).

## Wave-2 findings the claim does not cover (measured by non-author seats)

The C1 claim is the 26 named attacks. Wave 2 found these further edits that read CLEAN under
`--open` at 1530a755; none is new in round 40 (each also reads CLEAN at f69817ed), except the
nested borrow, which round 40 introduced with its binding rule and closed at 5ae8ac9c:

- **Nested-range borrow** (AtkReviewForge, AtkRecordForge, AtkNovelPin A2, AtkNovelRecords):
  closed at 5ae8ac9c (above).
- **Prose edit on a reviewed anchor** (AtkRebreakTrade variant, AtkNovelPin A1): for a
  review-sourced entry only the review token must appear in the paragraph, so the sentence's
  own symbol can change to a false one with the pin untouched.
- **Token re-pair on a stable identity** (AtkNovelIdentity, AtkNovelPin A3): a `pair` anchor true
  at base or open can be re-paired to another identifier on the same line; identity ignores the
  token. This is the token-kept arm that did not land.
- **Swap of two recorded anchors in one run** (AtkReorder variant; 13 such pairs) and the four
  token-carry swaps (AtkSwaps).
- **Symbols written in bold instead of backticks** are read as `unchecked` (AtkHeadroom variant;
  188 false claims, CLEAN).
- One seat each of AtkNovelIdentity and AtkNovelRecords reported that its route switched model
  after a provider safety filter; their findings are recorded as returned.

## Open limits (measured, not fixed)

- **The checklist's `--open` revision is this round's.** The truth item now passes
  `--open f69817ed…`; a later round must move it to its own round-open revision, or new honest
  reviews committed after f69817ed will read `REVIEW_UNBOUND`. Without `--open` the gate reads
  records at HEAD (one `TRUTH_WARN` line), where a forged record committed in the judged change
  binds (`.ufo/waves/round-40/build/ExecReviewBind.md`, evidence 8).
- **Honest re-cites of anchors true at open are refused under `--open`.** Narrowing or widening a
  range that was true at the open revision reads `BASE_TRUE_LOST` (recipes H3r, H4r, H7, H12 of
  `.ufo/waves/round-40/build/CritOperabilityCost.md`; `.ufo/waves/round-40/build/ExecNewDebtIdentity.md`).
  Under the checklist form the same nine honest edits stay CLEAN (9/17, unchanged from open).
- **No token-kept arm.** A swap that carries a review token with its coordinate keeps that
  anchor's identity; the open floor refuses the measured swaps through other findings, but the
  swap signature itself is not checked.
- **`unchecked` anchors are unbounded** (no symbol, so no truth claim), measured by the seat
  ReviewR39Routing.
- **cite-check:** 16 of 22 verdict and exit conditions are still not pinned by a selftest case
  (`.ufo/waves/round-40/build/ScoutCiteVerdict.md`); this round pinned the routed one.
- **Kimi census:** three arms survive its suite (a hidden child under a counted directory, an
  unreadable counted directory read as zero children, the counted-directory kind check;
  `.ufo/waves/round-40/build/MutKimiCensusArms.md`). In-range but wrong-line citations are not
  caught by cite-check; four such census citations in `corpus/knowledge/kimi-residue-files.md`
  were re-pinned by hand this round.
- **Fleet cite-check:** round-40 documents add one error, the S036 row's external commit
  (`REV_UNKNOWN`, the same class as 32 existing rows); the two lesson references the falsify seat
  ReviewCiteReceiptCand found were reworded (`.ufo/waves/round-40/falsify/ReviewCiteReceiptCand.md`).

