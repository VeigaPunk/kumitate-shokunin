# K70AttackC1Auto — Attack findings: c1 autoledger parser ignores numbered routed rows; negative control vs. complete coverage

Seat: K70AttackC1Auto (attack, leaf). Scope: one contract edge — the frozen
`.ufo/waves/round-69/probe/c1-controls.sh` `autoledger` arm's item generator regex
(`c1-controls.sh:62`, `re.match(r'^[-*+]\s+\*\*', line)`) vs. the frozen counter's own item
grammar (`.ufo/waves/round-69/probe/ledger69-probe.mjs:169`,
`/^([-*+]|[0-9]+[.)])\s+\S/`), and what the REPLAY70 R4 assertion set
(`.ufo/waves/round-70/probe/replay70-probe.mjs:34`) can and cannot distinguish.
Lane: `/home/vgpnk/Projects/shokunin/kumitate-shokunin`. Plan frozen at
`3dbe7e6e2616423d55f0ea2bbcf8fb32fe7bda6a`; counter/replay base B =
`78b98d762ccf3e3a0961f94c4042eaabd2bcb706`.

## Verdict up front

The blind spot is **real, measured, and already visible in the frozen receipt**: the frozen
counter counts **61** routed items over the twelve real spot-check lessons; the frozen
autoledger generator rows only **39**; the **21 numbered routed rows** in rounds 56, 57, 58 and
62 are ignored by the control generator while the counter counts them as first-class items.
The R4 assertion set (`wrapper exit 0 + receipt ∋ LEDGER69_UNMET + receipt ∋ CONTROL-PASS
autoledger + prior digests preserved + empty work dir`) **passes for both** a faithful negative
control over the covered subset **and** a degenerate autoledger run whose ledger has **zero
rows** (numbered-only content), while **complete coverage including the numbered rows flips the
counter to `LEDGER69_HELD held=7/7`** (observed, isolated replay). So R4 distinguishes negative
control from complete coverage only at the UNMET/HELD line; it cannot distinguish
partial-grammar negative control from zero-coverage negative control. This is a **fixable
defect in disclosure/selftest, not a must-reject tradeoff**: the predicate and the frozen bytes
stay exactly as frozen; the correction is that candidate selftest must pin replayed-receipt
row parity and the seat report must disclose the 39/61 coverage cap. REPLAY70_HELD 10/10
remains reachable — R4's evidentiary weight is what is capped, not its pass condition.

## Observed commands and outcomes

1. **Static parser audit** (`node parser-audit.mjs`, scratch; `items67` copied verbatim from the
   frozen counter, generator predicate replicated exactly from the frozen control). Outcome
   (`parser-audit.out`): per-round `counter-items` vs. `control-rows` —
   r55: 3/2, r56: 4/0, r57: 4/0, r58: 8/0, r59: 0/0, r60: 9/9, r61: 6/6, r62: 5/0,
   r63: 6/6, r64: 5/5, r65: 7/7, r66: 4/4 → `TOTAL: counter-items=61 control-rows=39
   numbered-items=21`. Rounds 56, 57, 58, 62 are numbered-only in their routed sections
   (e.g. `round-58-verifier-spotcheck.md:204-233`, `1. **R58-V1 …**` … `8. **R58-V8 …**`).
   Matches the frozen receipt `.ufo/waves/round-69/controls/c1-autoledger.txt` exactly:
   `items=61 rows=39 open=39`.
2. **Frozen-receipt cross-check**: `head -1 …/c1-autoledger.txt` →
   `L2 MISS … items=61 rows=39 …` and `L3 MISS 31 problems:
   A63x4:quote-not-word-boundary-in-item, A63x6:…, unledgered:55#3, unledgered:56#1,
   unledgered:56#2, unledgered:56#3, …` — the unledgered residue begins in the numbered-only
   rounds.
3. **Isolated counterexample** (originals never executed; nothing written to frozen paths):
   three synthetic fixture lanes built in private scratch (`build-fixtures.mjs`), differing
   **only** in routed-row list markers and ledger coverage; the frozen counter
   `ledger69-probe.mjs` run on each with `TMPDIR` private:
   - `fx-bullet-open` (24 `- **…**` items, generator-covered open rows) →
     `LEDGER69_UNMET held=6/7 … ` + `CONTROL-PASS autoledger`, counter exit 1 → **R4 set PASS**.
   - `fx-num-open` (same items as `1. **…**`, `2. **…**`; ledger exactly as the frozen
     generator emits: **0 rows**) → `LEDGER69_UNMET held=5/7 … rows=0 …` + `CONTROL-PASS
     autoledger` → **R4 set PASS** — predicate-level indistinguishable from a donothing run.
   - `fx-num-closed` (numbered items, every item closed with a well-formed located answer,
     class plan `c-span`×rounds 55–58 + 7 more classes, round-66 answers fresh) →
     **`LEDGER69_HELD held=7/7 checks=7`**, counter exit 0 + `CONTROL-FAIL autoledger` →
     **R4 set FAIL**. The counter demonstrably processes numbered-row ledgers correctly;
     only the control generator is blind.
   - `node compare-r4.mjs` → `fx-bullet-open: R4-set-pass=true … fx-num-open:
     R4-set-pass=true … fx-num-closed: R4-set-pass=false` (artifact
     `receipts/compare-r4.out`).
4. **Real-corpus private replay** (private copy `ctl/c1-controls-private.sh`, substitutions:
   W→private, S→private, TMPDIR→private — mirroring the contract's transform set; LANE/PROBE
   read-only against the lane): `./c1-controls-private.sh autoledger` → wrapper exit 0,
   receipt `LEDGER69_UNMET held=5/7 … items=61 rows=39 open=39 … L3 MISS 31 problems:
   A63x4:…, A63x6:…, unledgered:55#3, unledgered:56#1, …` + `CONTROL-PASS autoledger`.
   The `items=61 rows=39` and the 31-problem prefix reproduce the frozen r69 receipt
   byte-for-byte in those segments (held count 5/7 vs frozen 2/7 is the documented v1→v2 tool
   evolution, same as seat K70AttackC1Nothing observed for donothing). The generated ledger
   (`receipts/real-corpus-generated-ledger.md`) has exactly 39 data rows.
5. **Candidate inspection** (`.ufo/waves/round-70/build/K70ExecRunner/scripts/control-replay.mjs`,
   401 lines, appeared mid-flight): sha256-pins both frozen controls and refuses mismatch;
   substitutes LANE/PROBE/W/S exactly once; removes the r69 c2 line-80 fixed temp write;
   tees `CONTROL-PASS $MODE` into the receipt. Its selftest (ST01–ST09) covers argument
   contract, tamper refusal, transform-once, output exclusivity, private syntax, c2 statics —
   **nothing pins replayed-receipt coverage semantics** (no row parity, no numbered-row
   finding). The blind spot flows through R4 unchecked by any layer.
6. **Frozen-byte mutation check after all runs**: `git show B:.ufo/waves/round-69/probe/c1-controls.sh
   | sha256sum` = `01efd6dde4c987b676b1930f647cc283768e1ae8113fd076b313e54b56aeda12` =
   on-disk c1; c2 = `679b7d9619ab8d79139cfe8e956e425f7ccbbf7e58b6eaee5cb72c3deb3a66f4`;
   all five frozen receipts unchanged; `git status --porcelain -- .ufo/waves/round-69/` empty.

## The defect

- **Where:** `c1-controls.sh:62` — `if in_routed and re.match(r'^[-*+]\s+\*\*', line):`.
- **What:** the autoledger generator only emits a ledger row for bullet (`-`/`*`/`+`) routed
  items that begin with bold. The counter's item grammar (`ledger69-probe.mjs:169`) explicitly
  includes numbered list items (`[0-9]+[.)]`), and the counter's own L4 fixtures use numbered
  routed rows (`1. **D2 — …**`), so numbered routed rows are first-class input to the predicate.
- **Measured effect (real corpus):** 21 of 61 items (34%) — rounds 56, 57, 58, 62 — are never
  ledgered by the control. The control's own header comment ("one machine-generated OPEN row
  per routed item … Coverage without answers") overstates coverage: it is coverage of the
  bullet subset only.
- **Predicate effect (R4):** `replay70-probe.mjs:34` asserts wrapper exit 0, label substring,
  `CONTROL-PASS autoledger` substring, preserved prior digests, empty work dir. All three
  materially different fixture classes — (a) bullet-covered negative control, (b) numbered-only
  content whose autoledger arm degenerates to `rows=0` (donothing-equivalent receipt), (c)
  complete coverage including numbered rows — produce receipts that R4 treats as
  indistinguishable in case (a) vs (b) (both PASS), while case (c) flips to HELD/FAIL. R4
  therefore cannot tell "the autoledger arm ran over the full item grammar and stayed UNMET"
  from "the autoledger arm silently generated nothing and stayed UNMET", and the frozen bytes
  guarantee it never will: R1 pins the generator regex, and the contract's closed transform set
  (LANE/PROBE/W/S once + the one temp-write removal) does not permit repairing it — a candidate
  that "fixed" the regex would refuse its own pinned source on the second transform
  (transform-once) and break ST06-style checks.

## Strongest counterexample tested (from local evidence)

The numbered-only fixture `fx-num-open` is the strongest local counterexample: identical
synthetic content to `fx-bullet-open` modulo list markers, receipt carries `rows=0` and
`unledgered:55#1…` exactly like a do-nothing run, yet emits `CONTROL-PASS autoledger` and
satisfies every R4 clause. Against it, the only defense is the receipt's optional L2 detail
line (`rows=N`), which R4 does not assert. Conversely `fx-num-closed` proves the blindness is
one-sided: the counter itself scores numbered-row ledgers correctly up to HELD, so the gap is
purely the control generator's — and therefore purely a limit on what R4-evidence means.

## Impacted axes

- **Operability (C1 replay isolation)** — the attacked axis. Impact: none on the reachability
  of REPLAY70_HELD 10/10; impact on evidentiary wording: R4 proves "replaying the frozen
  autoledger control yields UNMET + CONTROL-PASS", not "the autoledger control covers the
  counter's routed-row grammar".
- Secondary: none. No coverage/knowledge claim touched; c2 arms unaffected.

## Fixable defect or must-reject tradeoff?

Fixable-in-spirit, **not** fixable in bytes: R1 pins the frozen scripts at B, so the regex
cannot be corrected in-lane; any candidate that repairs it breaks the frozen-source pin. The
canonical judge must **not** reject conforming candidates for inheriting the blind spot, and
must **not** accept any seat's claim that R4 demonstrates full-grammar autoledger coverage.

Smallest safe correction (zero frozen-byte change, candidate/report layer only):

1. **Candidate selftest addition:** assert replayed-receipt **row parity** for the autoledger
   arm — extract `rows=(\d+)` from the replayed receipt's L2 segment and require `rows=39`
   against the real corpus (deterministic: own-items/rows derive only from the corpus; the L4
   seed affects only the L4 detail line). This catches autoledger-arm degeneration (rows=0)
   without touching frozen bytes or the predicate. A stable selftest finding id should document
   the numbered-row blind spot explicitly (e.g. `ST10-autoledger-row-parity`).
2. **Disclosure:** the round-70 report/lessons must state that the c1 autoledger control
   exercises 39/61 of the counter's item universe (rounds 56, 57, 58, 62 numbered rows
   ignored by the frozen generator) — "limits disclosed rather than changing this predicate
   after scoring", per the plan's own controls-and-freeze section.
3. **Do not** amend the predicate after scoring, and do not vendor a "fixed" generator into any
   fixture — both would be contract violations (predicate freeze / fixture forgery).
4. Freeze consequence: frozen bytes stay byte-identical; R4's pass condition is unchanged;
   only the interpretation of R4-evidence is corrected, and the candidate selftest gains the
   row-parity pin described above.

## Evidence artifacts (private build dir, unique to this seat)

`.ufo/waves/round-70/build/K70AttackC1Auto/`:
- `parser-audit.mjs`, `parser-audit.out` — verbatim-counter-parser audit: 61 vs 39 vs 21.
- `build-fixtures.mjs` — the three-variant counterexample builder.
- `compare-r4.mjs`, `receipts/compare-r4.out` — R4 assertion-set comparison over the three
  synthetic receipts.
- `receipts/fx-bullet-open.{txt,rev}`, `receipts/fx-num-open.{txt,rev}`,
  `receipts/fx-num-closed.{txt,rev}` — frozen-counter receipts per variant (trailer records
  the observed CONTROL-PASS/FAIL outcome).
- `receipts/c1-autoledger.txt`, `receipts/c1-autoledger-private-run.log` — real-corpus private
  replay receipt (rows=39 parity with the frozen receipt).
- `receipts/real-corpus-generated-ledger.md` — the autoledger-generated ledger over the real
  corpus (exactly 39 data rows).
- `ctl/c1-controls-private.sh` — private control copy; substitutions: W, S, TMPDIR → private
  paths (LANE/PROBE read-only); diff vs frozen original visible via `grep -nE '^(W|S)=|TMPDIR='`.

Scratch `/fast/scratch/hyaku/kumitate-r70/K70AttackC1Auto/` was created explicitly, receipts
copied to the build dir first, and **removed before yield** (verified absent).

## Tooling record (no installs; pacman untouched)

node v24.21.0 (preinstalled; ran the frozen counter and all harnesses), git 2.56.0 (read-only
init/add/commit/rev-parse inside private scratch fixtures; archive/show/sha256sum for frozen
verification), sed + sha256sum (private-copy substitution, digest checks). No installs or
updates performed; nothing written outside this seat's build dir, its scratch, and the required
report path. No git/jj mutations anywhere. No delegation, no background task system — the three
counter runs and one private control run are the required observations (two foreground, two
harness-managed). Originals `c1-controls.sh` / `c2-controls.sh` never executed; only the
private copy with private W/S/TMPDIR ran, and only the c1 autoledger arm.
