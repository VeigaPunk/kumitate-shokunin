# K83ScoutCensus — the omp-census compare/clock surface and its consumers

Read-only recon. No lane file was edited except this report; no counter, pin, tool or
control was touched. Scratch: `/fast/scratch/hyaku/kumitate-r83/K83ScoutCensus/`
(created, used, deleted at the end). Measured revision: `eca7debd9aa6184a81f7e4abb43d507299a31f31`
(`round-83 scaffolding: ready-handoff v3 … omp-census compare clock (16/16) …`); base
`eb8e00956e7a282cb2b53a5bc53e1afa1d0e7fcf`.

Tooling: none installed or upgraded (no pacman, no network). No LSP is available for the
lane's `.mjs` files — no `lsp` device is mounted and no JS/TS language server binary exists
on the host — so every symbol trace below is text (grep/read), not semantic proof.

## 1. The surface as found (line anchors are the M tree)

`kumitate-omp-shape-v2`, contract constant `SHAPE_CONTRACT` at `scripts/omp-census.mjs:166`.

| symbol | site | behaviour |
|---|---|---|
| `readShapeDoc` | `:197-210` | reads + `validateShape`; rejects a malformed/legacy-nonconforming doc as `SHAPE_INVALID` before any clock read |
| `validateShape` | `:170-194` | v2 requires exactly `{contract,captured_at,entries}`; `captured_at` must match `ISO_SECOND` (`:168`) **and** `Date.parse` must not be NaN |
| `clockRefusal` | `:220-224` | `null` when `ageDays` is `null` or NaN; otherwise `captured_at=<instant> age_days=<n>` iff `ageDays < 0` |
| `receiptAgeDays` | `:226-229` | `floor((now − Date.parse(captured_at)) / 86_400_000)` |
| `compareShape` | `:258-324` | stamp `:267`; clock judged **unconditionally** `:270-274` → `OMP_SHAPE_COMPARE: SHAPE_CLOCK <clock>` exit 2; then `--max-age` (`SHAPE_AGE_UNKNOWN` `:276-279`, `SHAPE_STALE_RECEIPT` `:280-283`); line printed at `:322` |
| `runShape` | `:500-532` | same predicate `:511-514` → `SHAPE_CLOCK <clock>` exit 2; verdict line `:530` |
| selftest clock arms | `:851-866` | `compare-clock-future-unbounded`, `compare-clock-future-bounded`, `clock-one-predicate` |

Line grammar at M (observed, not inferred):

```
OMP_SHAPE_COMPARE: IN_SYNC|DRIFT entries=<live> receipt=<n> added=<a> removed=<r> changed=<c>[ first=<name>] transient=<t> receipt_captured=<YYYY-MM-DD>|absent age_days=<n>|absent
OMP_SHAPE_COMPARE: SHAPE_CLOCK captured_at=<ISO> age_days=<negative>            exit 2
OMP_SHAPE_COMPARE: SHAPE_AGE_UNKNOWN receipt_captured=absent max_age=<m>        exit 2
OMP_SHAPE_COMPARE: SHAPE_STALE_RECEIPT entries=<n> age_days=<d> max_age=<m>     exit 1
SHAPE_CLOCK captured_at=<ISO> age_days=<negative>                              exit 2   (--shape)
```

## 2. What I ran (exact commands)

All with `S=/fast/scratch/hyaku/kumitate-r83/K83ScoutCensus`,
`L=/home/vgpnk/Projects/shokunin/kumitate-shokunin`, `TMPDIR=$S`, and `--work` under `$S`.

```bash
# clean M and base trees (read-only extractions)
cd $L && git archive HEAD | tar -x -C $S/head
cd $L && git archive eb8e00956e7a282cb2b53a5bc53e1afa1d0e7fcf | tar -x -C $S/base

# frozen C2 counters, current round and 78/80/81/82, against both trees
node $X/.ufo/waves/round-83/probe/probe83-c2.mjs --set c2 --lane $X --work $S/<tag>
node $X/.ufo/waves/round-82/probe/probe82-c2.mjs --set c2 --lane $X --work $S/<tag>
node $X/.ufo/waves/round-81/probe/probe81-c2.mjs --set c2 --lane $X --work $S/<tag>
node $X/.ufo/waves/round-80/probe/probe80-c2.mjs --set c2 --lane $X --work $S/<tag>
node $X/.ufo/waves/round-78/probe/probe78-c2.mjs --set c2 --lane $X --work $S/<tag>
# same six against $S/base (X=$S/base)

# C1 counters of rounds 80-82, both trees (to separate round-83 effects from pre-existing)
node $X/.ufo/waves/round-82/probe/probe82-c1.mjs --set c1 --lane $X --work $S/<tag>
node $X/.ufo/waves/round-81/probe/probe81-c1.mjs --set c1 --lane $X --work $S/<tag>
node $X/.ufo/waves/round-80/probe/probe80-c1.mjs --set c1 --lane $X --work $S/<tag>

# instrument suites and the byte gate
node $L/scripts/omp-census.mjs --selftest --work $S/st
cd $S/head && node scripts/proxy-check.mjs --self . --json

# clock fixtures (v2 receipt, 2-entry live root), run from $L
node scripts/omp-census.mjs --compare $S/fix/<name>.json --root $S/fix/live [--max-age 30]
node scripts/omp-census.mjs --shape   $S/fix/<name>.json --note corpus/knowledge/omp-agent-root.md
```

`<name>` ∈ `today` (now−1 h), `future` (now+90 d), `bad-date` (`not-a-date`), `date-only`
(`2026-11-04`), `impossible-calendar` (`2026-13-45T00:00:00Z`), `legacy` (v1).

## 3. Consumer table — the compare line and `SHAPE_CLOCK`

`delta` = this round's change (compare refuses a future instant without `--max-age`;
`SHAPE_CLOCK` names `captured_at`+`age_days` on both paths).

| # | consumer | site | what it asserts | reading at M | delta |
|---|---|---|---|---|---|
| 1 | frozen C2 counter | `.ufo/waves/round-83/probe/probe83-c2.mjs:115-130` | `SHAPE_CLOCK` substring; both paths exit 2; compare line names `captured_at=<future>` | `C83_C2: HELD held=16/16` exit 0 | is the claim; **clean** |
| 2 | in-file selftest | `scripts/omp-census.mjs:851-866` | `OMP_SHAPE_COMPARE: SHAPE_CLOCK` + `captured_at=<instant>`; `clock-one-predicate` | `VERDICT: PASS (108 cases)` exit 0 | **clean** |
| 3 | frozen C2 counter r82 | `.ufo/waves/round-82/probe/probe82-c2.mjs:114-124,150-157` | IN_SYNC, `receipt_captured=`, `age_days=0/45`, `SHAPE_STALE_RECEIPT`, `SHAPE_AGE_UNKNOWN`; carries no future arm | `C82_C2: HELD held=13/13` exit 0 at base **and** M | **clean** (delta 0) |
| 4 | frozen C2 counter r81 | `.ufo/waves/round-81/probe/probe81-c2.mjs:124,152,168` | `SHAPE_CLOCK` substring only (arm 08); IN_SYNC counts | `C81_C2: UNMET held=13/15` at base **and** M, same two arms (`stale-does-not-score`, `proxy-terms-unchanged`) failing on lane-state DRIFT, not text | **clean** (arm 08 passes; delta 0) |
| 5 | frozen C2 counter r80 | `.ufo/waves/round-80/probe/probe80-c2.mjs:240` | `OMP_SHAPE_COMPARE: DRIFT` + `added=3` (tolerant) | `C80_C2: HELD held=8/12` at base **and** M, same four arms (01, 03, 10, 12) failing on live-root/stanza drift | **clean** (delta 0) |
| 6 | frozen C2 counter r78 | `.ufo/waves/round-78/probe/probe78-c2.mjs:95,104-106,161` | exact IN_SYNC line (no stamp), `first=<name>$` | `probe78-c2: receipt … invalid` exit 2 at base **and** M — it pins `kumitate-omp-shape-v1` and the pin is v2; its exact-line arm has also been dead since r82's stamp | already dead before r83; **delta 0** |
| 7 | frozen r78 copy | `.ufo/waves/round-78/build/K78ReviewFreeze/frozen-probe78-c2.mjs:27,95,106` | same constants as #6 | not executed; expectations read identical | **delta 0** |
| 8 | r78 sentinel probe | `.ufo/waves/round-78/build/K78SentinelSecrets/security-probe.py:59` | writes `OMP_SHAPE_COMPARE: IN_SYNC` as member **content** (injection marker); parses nothing | unaffected | **clean** |
| 9 | proxy-check | `scripts/proxy-check.mjs:331,1284,1312-1313` | imports `shapeFromFile`/`censusEntries` in process; never parses the compare line, never reads `captured_at` | no text dependency | **clean** |
| 10 | harm-matrix registry | `scripts/harm-matrix-gates.json:13,36` | `^OMP_CENSUS: (\w+)` / `^VERDICT: (PASS\|FAIL)`; not the compare line | unaffected | **clean** |
| 11 | pinned receipt | `.ufo/pins/omp-shape.json` | v2, `captured_at=2026-11-04`, 65 entries | compare reads IN_SYNC `age_days=0`; a future-dated receipt would now be refused (intended) | **clean** |
| 12 | gate byte pin | `SCORECARD.md:330` `pin.omp-census` | sha256 of `scripts/omp-census.mjs` | at committed M declares `92180f3c…` (base bytes) vs computed `f6ace3e2…` → `GATE_PIN_DRIFT` proxy exit 1; the uncommitted worktree (sibling seat, at the time of reading) declares `f6ace3e2…` and proxy reads MATCH | **broken at M** (byte, not text) |
| 13 | knowledge entry | `corpus/knowledge/receipt-age-on-the-compare-path.md:22` | “Future instant plus a bound: `SHAPE_CLOCK age_days=<negative> max_age=<m>` … without a bound the negative age prints and the compare grades” | both clauses false: the bounded line drops `max_age=` and adds `captured_at=`; unbounded is now `SHAPE_CLOCK` exit 2 | **broken** |
| 14 | knowledge entry | `corpus/knowledge/receipt-age-on-the-compare-path.md:24` | “Compare's exit stays drift-only (`return drift ? 1 : 0`)” | false: a clock refusal exits 2 before the comparison | **broken** |
| 15 | knowledge entry | `corpus/knowledge/self-describing-shape-receipt.md:29` | “`--compare` stays report-only and still reads a legacy v1 receipt” | the legacy clause holds; “report-only” is false for a future instant (exit 2) | **broken** |
| 16 | knowledge entry | `corpus/knowledge/self-describing-shape-receipt.md:63` | “clock refused \| future `captured_at` \| `SHAPE_CLOCK` exit 2” | still true | **clean** |
| 17 | knowledge entry | `corpus/knowledge/shape-receipt-live-drift.md:13` | grammar ending at `first=<name>` | missing `transient=<n>` (since r79) and the stamp (since r82); not an r83 effect | pre-existing drift |
| 18 | corpus index | `corpus/README.md:213-214` | prose descriptions of the two entries | no exact text quoted; still accurate | **clean** |
| 19 | registry row | `SKILL.md:617` (committed) | r77/r78/r79/r82 chain; r78 grammar omits `transient=`/stamp; makes no claim that an unbounded compare accepts a future instant | not contradicted by r83; the r83 sentence/checklist row is absent at M (a sibling's worktree has added it) | **clean** w.r.t. r83 |
| 20 | historical receipts/prose | `.ufo/waves/round-81/close/c2-probe.txt:9`, `corpus/lessons/round-7*/*8*.md` (r78/r80/r81/r82 verifier spot-checks, `round-82.md:124`), `LOG.md:2646`, `SCORECARD.md:3818` | record past output (`SHAPE_CLOCK … is in the future`) | immutable history, not live consumers; MUST NOT be regenerated or edited | n/a |

Full-lane grep basis: `OMP_SHAPE_COMPARE|SHAPE_STALE_RECEIPT|SHAPE_AGE_UNKNOWN|receipt_captured`
over `scripts/`, `.ufo/waves/round-7*`, `round-8*`, `corpus/`, `.ufo/pins/`; `--compare`
invokers are exactly `probe78-c2`, `probe80-c2`, `probe81-c2`, `probe82-c2`, `probe83-c2`
(no `scripts/` caller).

## 4. Break list

**Broken by this round (4 consumer sites):**

1. `corpus/knowledge/receipt-age-on-the-compare-path.md:22` — old bounded text and “without a
   bound … the compare grades”.
2. `corpus/knowledge/receipt-age-on-the-compare-path.md:24` — “compare's exit stays drift-only”.
3. `corpus/knowledge/self-describing-shape-receipt.md:29` — “`--compare` stays report-only”.
4. `SCORECARD.md:330` `pin.omp-census` — declares base bytes at committed M, so
   `node scripts/proxy-check.mjs --self .` reads `GATE_PIN_DRIFT` exit 1 at M. The uncommitted
   worktree already carries `f6ace3e2…` and reads MATCH; the re-pin must be in the M commit
   (the plan lists “pins” under commit 2). The same clean-M run also reads `pin.ready-handoff`
   drift, `A_DRIFT 891→894`, `C2_TOTAL_DRIFT 206→207`, `AXES_DRIFT coverage row=10 derived=9`
   (the last one pre-exists at base).

**Not broken by this round (delta 0, verified by base-vs-M runs):** probes 78/80/81/82, the
in-file selftest, proxy-check, harm-matrix, the pinned receipt, and the remaining corpus prose.
Counter detail (base `eb8e0095` → M):

| counter | base | M | arms that differ |
|---|---|---|---|
| `probe83-c2` | (did not exist) | `HELD 16/16` | — |
| `probe82-c2` | `HELD 13/13` | `HELD 13/13` | none |
| `probe81-c2` | `UNMET 13/15` | `UNMET 13/15` | none (`stale-does-not-score`, `proxy-terms-unchanged` fail on both) |
| `probe80-c2` | `UNMET 8/12` | `UNMET 8/12` | none (arms 01, 03, 10, 12 fail on both) |
| `probe78-c2` | exit 2, receipt invalid | exit 2, receipt invalid | none |
| `probe82-c1` (context) | `UNMET 21/22` | `UNMET 16/22` | `tool-v2-contract`, `clean-ready`, `dispatch-wave-agree`, `l1-resolved`, `policy-band-default` — all v3 effects (contract string; `DISPATCH_SCHEMA dispatch.schema=undefined`) |
| `probe81-c1` (context) | `UNMET 2/16` | `UNMET 2/16` | none (v1 CLI superseded by v2's required `--policy`, since r82) |
| `probe80-c1` (context) | `HELD 12/13` | `HELD 12/13` | none (`corpus/lessons/round-82-verifier-spotcheck.md` uncovered) |

(Extracted-tree runs are the controlled pair; the real-lane M run of `probe82-c1` reads
`17/22` because the extraction-only `DISPATCH_OUTSIDE` artifact disappears; the same five
arms are the only delta.)

## 5. Observed clock behaviour (exact output)

```
### today | --compare …/today.json --root …/live
OMP_SHAPE_COMPARE: IN_SYNC entries=2 receipt=2 added=0 removed=0 changed=0 transient=0 receipt_captured=2026-11-04 age_days=0        exit=0
### future | --compare …/future.json --root …/live
OMP_SHAPE_COMPARE: SHAPE_CLOCK captured_at=2027-02-02T12:07:00Z age_days=-90                                                          exit=2
### future | --compare … --max-age 30
OMP_SHAPE_COMPARE: SHAPE_CLOCK captured_at=2027-02-02T12:07:00Z age_days=-90                                                          exit=2
### future | --shape …
SHAPE_CLOCK captured_at=2027-02-02T12:07:00Z age_days=-90                                                                              exit=2
### bad-date | --compare …            SHAPE_INVALID                                                                                    exit=2
### date-only | --compare …           SHAPE_INVALID                                                                                    exit=2
### impossible-calendar | --compare  SHAPE_INVALID                                                                                    exit=2
### legacy | --compare …              OMP_SHAPE_COMPARE: IN_SYNC … receipt_captured=absent age_days=absent                            exit=0
### legacy | --compare … --max-age 1  OMP_SHAPE_COMPARE: SHAPE_AGE_UNKNOWN receipt_captured=absent max_age=1                          exit=2
```

Consequences the consumers must absorb:

- A bounded future instant no longer prints `max_age=`; the clock line is now identical
  bounded and unbounded.
- A compare can exit 2 for a clock reason, so any caller that treated compare exit 2 as
  “unreadable receipt/live root only” (prose in `receipt-age-on-the-compare-path.md` and
  `shape-receipt-live-drift.md`'s exit table) is under-specified — the exit code itself is
  unchanged as a class (“fail-closed”), but the cause set grew.
- `--shape` lost the sentence “is in the future”; the token and exit are unchanged, so any
  consumer matching `SHAPE_CLOCK` (all probes) still matches.

## 6. Discrepancies disclosed (not edited)

1. **Plan/comment say “unparseable instant → `SHAPE_CLOCK`”; the code says `SHAPE_INVALID`.**
   `validateShape` (`:170-194`) admits only an `ISO_SECOND` string that `Date.parse` accepts,
   so `receiptAgeDays` can never return NaN and `clockRefusal`'s NaN branch (`:221`) is
   unreachable. Observed on both paths: `SHAPE_INVALID` exit 2 (bad-date, date-only,
   impossible-calendar). The refusal is still fail-closed; only the token differs from the
   plan's § C2 prose and the `clockRefusal` doc comment (“future (or unparseable)”).
2. **`max_age=` dropped from the bounded clock line.** Round-82's reviewers quoted
   `OMP_SHAPE_COMPARE: SHAPE_CLOCK age_days=-2 max_age=0`; at M the same call prints
   `captured_at=… age_days=-90` with no `max_age`. No executable consumer asserted that
   token, but two knowledge entries did.
3. **`pin.omp-census` (and `pin.ready-handoff`) are stale in the committed M tree.** Reading
   the worktree instead of `git archive HEAD` can hide this, because sibling seats are
   re-pinning there right now (`SCORECARD.md` is modified, uncommitted).
4. **`probe78-c2` is an obsolete consumer** of the receipt contract and of the pre-r82 line;
   it reads identically at base and M, so it must not be cited as evidence either way.
5. `git archive HEAD` does not include `.git`, so `round-handoff-ready` arms that point at a
   real-lane dispatch necessarily read `DISPATCH_OUTSIDE` in extraction runs — an artifact
   of the method, symmetric across base and M.

## 7. What I could not verify

- `probe78-c2`'s per-arm text readings: the probe refuses the v2 pin at startup, so its
  exact-line arms cannot be exercised at base or M; the failure is inferred from source
  (`:95`, `:104-106`) and from the r82 stamp.
- `.ufo/waves/round-78/build/K78ReviewFreeze/frozen-probe78-c2.mjs` was not executed and its
  digest was not compared to `probe78-c2.mjs`; only its constants were read.
- Whether the in-flight scribe edits (`SCORECARD.md`, `SKILL.md`, `corpus/README.md`,
  knowledge entries) land in the M commit or the close commit; all M readings above are
  from `git archive HEAD`, not the dirty worktree.
- The cause of the host's live-root drift (`entries=68 receipt=65`, `first=config.yml.pre-arm80-…`)
  beyond the probe's own output; it is identical at base and M and is not attributed to any
  round.
- Semantic tracing: no LSP server/device exists for these files (recorded above), so symbol
  relationships are text-derived.

## 8. Verdict

`CONSUMERS: 4 broken` — 3 knowledge-entry statements (`receipt-age-on-the-compare-path.md:22`,
`:24`, `self-describing-shape-receipt.md:29`) plus the `pin.omp-census` gate byte pin at
committed M; every executable consumer (frozen counters 78/80/81/82/83, the in-file selftest,
proxy-check, harm-matrix, the pinned receipt) reads as designed, and the round-83 frozen C2
counter holds `C83_C2: HELD held=16/16`.
