# SCORECARD.md round-52 section — seat draft (ScribeScorecard)

STATUS: **draft for integration.** Shape follows the live `## Round 51 — claims, freeze
repairs, limits (2026-10-24)` section of `SCORECARD.md` (tail). Every `<<FILL: …>>` marker is a
value this seat could not measure at draft time (the v2 instrument, the receipts and the close
receipts do not exist at the draft tip `ac56743`); integration replaces each one and deletes
this header block. The two predicate sentences are **byte-identical to
`.ufo/waves/round-52/plan.md` §Claims and to the probe headers** — do not reword, re-wrap or
re-indent them; they are quoted verbatim inside fenced blocks so no editor rewraps them.

---

## Round 52 — claims, freeze repairs, terms, limits (2026-10-24)

Plan `.ufo/waves/round-52/plan.md` (frozen 2026-10-24 before any data seat; no freeze-repair
addendum at draft time); base and round-open tip
`02c01258464cac3804faf177d0cfbf113cd59706` (jj ahead=0 behind=0, clean tree). Round shape:
**ONE v2 wave of exactly 64 seats**, validated under `scripts/hyaku/ufo-wave-policy-v2.json`
(band 64–128, ≥25% attack) and dispatched as exactly one task call; the validator's payload is
`.ufo/waves/round-52/w1-validate.json` (`schema: ufo-swarm-wave-v1`, `wave: kumitate-r52-w1`) and
the 64-seat registry is `.ufo/waves/round-52/w1-registry.json` (role census from that file:
executor 19, reviewer 13, scribe 8, scout 7, critic 6, mutation-tester 5, simplifier 2, sentinel
2, connector 1, revenger 1). The §3 planner seat was held by the L1 (the validator rejects
`planner` as a swarm role); the bounded planning walk rode `RevPlan` + `RevCounterA`. Routed
inputs R52-1..R52-11 honored: R52-1/R52-2/R52-3/R52-6/R52-7/R52-8 and A2e landed inside the v2
contract (SHAPE/CLOCK/STDIN/LEDGER/SELFTEST), R52-4 landed as the named bounded round-50 probe
repair, R52-5 as check B5c plus the probe's own checks-nonempty guard, and **R52-9/R52-10 are
DEFERRED by the plan** (limits (d)). R52-11 (no frozen receipt at the cited close rev) is
answered by the close sequence and the new QUALITY criterion Q44.

**Attack-seat count — three readings, recorded verbatim (not reconciled here).** The plan's
§Wave says "≥25% attack roles (25 of 64)"; the spec commit message (`66766f7`) says "37.5%
attack"; the registry role census admits a third reading. Derived from
`w1-registry.json`: reviewer+critic+mutation-tester+revenger = 25 (39.1%, the plan's figure),
reviewer+critic+mutation-tester = 24 (37.5%, the commit message's figure), and the union
including sentinel+simplifier = 29 (45.3%). Every reading clears the policy floor
(≥25% of 64 = 16 seats), so the gate is satisfied under all three; the canonical Rust judge
should name which role set it scores. `<<FILL: validator/judge attack count>>

**C1 — operability (capability deepening): `receipt-attest` v2, predicate `ATTEST52_HELD`
(rule A52 v1, thirteen checks over `git archive` bytes of `<rev>`).** Counting command:

```
node .ufo/waves/round-52/probe/attest52-probe.mjs /home/vgpnk/Projects/shokunin/kumitate-shokunin <rev>
```

Frozen predicate sentence (byte-identical in plan §C1, the probe header and this row):

```
ATTEST52_HELD — node .ufo/waves/round-52/probe/attest52-probe.mjs /home/vgpnk/Projects/shokunin/kumitate-shokunin <rev> prints "ATTEST52: ATTEST52_HELD held=13/13 checks=13 rev=<rev> rule=A52 version=v1" and exits 0.
```

Before at base `02c01258`: `ATTEST52: ATTEST52_UNMET held=5/13 checks=13 rev=02c01258464cac3804faf177d0cfbf113cd59706
rule=A52 version=v1` exit 1 (`base/attest52-base.txt`, committed at the freeze and executed —
Q43). The five arms that already held at base are the v1-instrument arms (B2c printf challenge,
B3c live prelude-tamper, B4c twin REPLAY, B4d corrupt-digest REPLAY, B6 round-51 v1 receipts);
the eight that missed are the v2 contract arms: B1 (selftest ≥30 cases; v1 shipped 27 and no
`--stdin`), B1c (CLOCK rollover), B2 (three committed receipts absent), B2e (`--stdin` usage
error 64), B3 (doctored control absent), B4 (tool/receipts dir absent), B5 (pin + `--strict`
proxy: `PROXY: DRIFT … C2_total declared=117`), B5c (counter-mutant receipt absent, guard
present). The **do-nothing control K1 IS this receipt**: no SCORECARD-only edit can clear B1.

After at the measured close revision R1 `<<FILL: R1 40-hex rev>>`: `<<FILL: exact
ATTEST52_HELD held=13/13 checks=13 rev=R1 rule=A52 version=v1 line, quoted verbatim from
close/FINAL-<R1>.txt>>` exit 0. Idempotence re-run at R2 `<<FILL: R2 rev + line from
close/IDEMPOTENCE-<R2>.txt>>`.

Evidence slots (all under `.ufo/waves/round-52/` unless named otherwise):
`<<FILL: close/FINAL-<R1>.txt>>`, `<<FILL: close/IDEMPOTENCE-<R2>.txt>>`,
three committed receipts `receipts/attest52-run-{1,2,3}.txt` + `.sha256` sidecars (each
`RECEIPT: VALID` exit 0, nonces pairwise distinct, file shas pairwise distinct, span ≥300 s
from the digest-bound BODY `wall_start` fields — never the display prelude, R52-7),
doctored control `receipts/attest52-run-2-replayed.txt` reading `TAMPERED`,
counter-mutant transcript `build/MutCounter52/counter-mutant.txt` (hold-call-deleted A52 mutant
prints `ATTEST52_UNMET held=0/0` exit 1 — the B5c guard, R52-5), round-50 repaired probe and its
re-run receipt `<<FILL: R52-4 artifact paths>>`.

Shown able to fail (controls declared before data, each executed): K1 the base receipt above;
K2 print-stub `<<FILL: transcript, expected B1/B2c/B2e/B3c misses>>`; K3 zero-spawn full-tree
forger stays **inside** the declared forgery boundary (limits (a)) — it is not claimed as
killed; K4 counter mutants (drop-one-check and hold-call-deleted) `<<FILL: readings>>`; the
CLOCK challenge B1c and the STDIN challenge B2e both fail a stub that only prints verdicts,
because the probe supplies the nonce and captures the child's real stdout itself.

**C2 — frontier coverage (learning, sourced): `fail-closed-clock-validation`, predicate
`DOCTRINE52_HELD` (rule D52 v1, five checks over `git archive` bytes).** Counting command:

```
node .ufo/waves/round-52/probe/doctrine52-probe.mjs /home/vgpnk/Projects/shokunin/kumitate-shokunin <rev>
```

Frozen predicate sentence (byte-identical in plan §C2 and the probe header):

```
DOCTRINE52_HELD — node .ufo/waves/round-52/probe/doctrine52-probe.mjs /home/vgpnk/Projects/shokunin/kumitate-shokunin <rev> prints "DOCTRINE52: DOCTRINE52_HELD held=5/5 checks=5 rev=<rev> rule=D52" and exits 0.
```

Before at base `02c01258`: `DOCTRINE52: DOCTRINE52_UNMET held=0/5 checks=5
rev=02c01258464cac3804faf177d0cfbf113cd59706 rule=D52 | E1 MISS entry-absent` exit 1
(`base/doctrine52-base.txt`; K5 do-nothing — the entry is absent at base, so no
SCORECARD-only edit scores).

After at R1 `<<FILL: R1 rev>>`: `<<FILL: exact DOCTRINE52_HELD held=5/5 checks=5 rev=R1
rule=D52 line with E1..E5 PASS tokens, quoted from close/FINAL-<R1>.txt>>` exit 0.

Sourced claim: the entry's provenance trio (first five lines: `source:`, `verified-at:`,
`recheck:`) cites **S102 = RFC 3339** (rfc-editor.org URL, tier A) and companion **S103**
`<<FILL: S103 identity + honestly assigned tier — seat-asserted hint, unverified by this seat:
w1/ScoutCompanion.md:20 registers S103 = MDN Web Docs "Date.parse()"
(developer.mozilla.org …/Date/parse), tier **B**, status `mined`, used-by the entry, body sha256
9c120292…; integration confirms the landed SOURCES row at R1>>`, both opened this round; E2 needs ≥12
receipt-bound `- ` clauses, each `receipt:<repo-path>@sha256:<64hex>` whose path exists at rev
with a matching blob sha256 `<<FILL: clause count and the receipt-bound file list>>`; E3 needs
`corpus/SOURCES.md` rows S102/S103 with status `mined` and a used-by cell naming the entry
`<<FILL: rows>>`; E4 `node scripts/sources-check.mjs` → `SOURCES_CHECK: CLEAN` exit 0
`<<FILL>>`; E5 live census `<<FILL: validate --root … kumitate exit 0>>`. Census before (round
open, `base/baseline-gates.txt`): exit 0, 101 rows, tiers A:87/B:6/C:8, four pre-existing W04s
(S034/S068/S084/S095). After at close: `<<FILL: rows, tiers, W04 delta — S102/S103 added, tier
A +1 and the S103 tier honestly counted>>`. Wave-time snapshot (unverified by this seat,
`w1/ScoutCensus.md`): at its observation the live registry still read 101 rows, A:87/B:6/C:8,
four W04s, `SOURCES_CHECK: CLEAN (rows=101 tiers=A:87,B:6,C:8 …)`, i.e. **no row had landed yet** —
so the after-values above are integration-only. The entry itself: `corpus/knowledge/fail-closed-clock-validation.md`
`<<FILL: sha256 + section count>>`; mistake mined into `corpus/lessons/round-52.md ## Mistakes`
`<<FILL: the mined mistake (candidate: R52-11 itself, or a fresh wave finding)>>`.

**Freeze repairs.** `<<FILL: "None. Both counters were frozen AND executed at base before any
data seat (Q43) — base/attest52-base.txt held=5/13 and base/doctrine52-base.txt held=0/5 — and
no addendum landed; the predicates, labels and counting commands never changed.">>. If a seat
finding did change a counter, the plan's rule applies instead and this paragraph must read:
every repair named, minimal, seat-found, base-re-measured, with the re-run receipts committed
under the same `base/` paths and a numbered `## Freeze repair addendum` in the plan
`<<FILL: addendum item numbers + commits, or delete this sentence>>`.

**Terms (declared vs computed, with revs — R51-2 phrasing).** At base `02c01258` the declared
block read A=71, C=23, C1=19/19, C2=117/117, S 88/88, R 92/92, K 53/53, and the same commit's
`--strict` run read `PROXY: DRIFT (A_DRIFT term=A declared=71 computed=73 delta=+2;
C2_TOTAL_DRIFT term=C2_total declared=117 computed=118 delta=+1; AXES_DRIFT term=coverage
declared=10 computed=9; src-rev=31c465f15669)` (`base/baseline-gates.txt`). The three drift
terms are not claim evidence (Q26) and each has a named cause: A computed 73 because the two
frozen round-52 probe `.mjs` files already sat in the tree at freeze (the `RE_RUNNABLE` walk
counts the whole tree); C2_total 118 because one corpus note lacks a README map row (the
inherited drift, repaired by the close commit); AXES coverage derived 9 vs declared 10
(the same inherited row). **Plan-text finding:** the plan's round-open baseline paragraph quotes
only `C2_TOTAL_DRIFT` and `AXES_DRIFT`; its own committed base receipt also carries `A_DRIFT`.
One tree, one reading: at the round-51 close the *same* rev carried two
A readings inside one committed bundle — `FINAL-57333ead….txt:1` shows `A51 … A5 MISS …
PROXY: DRIFT (A_DRIFT term=A declared=81 computed=71` while line 5 of that file shows
`PROXY: MATCH (A=81 …` — the archive/committed-bytes reading and the working-tree reading.
Round 52's terms therefore name the tree and the rev for every computed value.
At close the stanza is re-derived — `<<FILL: A=?, C=23, C1=19/19, C2=118, S/R/K values with the
derivation command, tree and rev>>` — and `--strict` must print
`PROXY: MATCH (… pins=6 match; src-rev=31c465f15669)` `<<FILL: full verbatim line at R1>>`.
C stays 23 (checklist item 23 remains "receipt-attest hermetic suite", command unchanged, its
contract label re-pointed to v2 `<<FILL: SKILL.md item 23 line>>`); C2 117 → 118 only if the
README map row lands `<<FILL>>`. Operability integer at close
`<<FILL: floor(10 × (A+C)/(A+C+3)) with the computed A,C and the arithmetic>>`; coverage
successors `<<FILL: S=…/… R=…/… K=53/53>>`. The pin family stays at six pins; only
`pin.receipt-attest` is re-derived to the v2 bytes in the `kumitate-gate-pins-v1` block
`<<FILL: scripts/receipt-attest.mjs sha256 at R1 >>`.

**Harm (H1–H5 at the measured close revision, transcripts under `close/`).** H1
`CHECKLIST: 23/23 pass` `<<FILL: line + exit>>` (item 23 = receipt-attest selftest, command
unchanged; baseline 21/23 at open — the two reds are the inherited ones the close repairs).
H2 `cap-run 12/12`, `bind-oracle 7/7`, `counter-rerun PASS`, `round-gate <<FILL: n/n>>`,
`receipt-attest --selftest` `<<FILL: ATTEST_SELFTEST: PASS (n/n), n ≥ 30>>`, `sources-check
CLEAN` `<<FILL>>`. H3 `PROXY: MATCH … pins=6 match` `<<FILL: line>>`. H4 census exit 0
`<<FILL: rows>>`. H5 G50 `GUARD_HELD held=8/8` `<<FILL>>` (7/8 at base — the inherited proxy
drift; the close repair returns it to 8/8, verified or named); R50 `LEDGER_HELD held=8/8` after
the R52-4 named repair `<<FILL: or 7/8 with the reason>>`; A51 retired with a superseded-by-A52
note `<<FILL: file/line>>`; D51 `DOCTRINE_HELD held=5/5` unchanged `<<FILL>>`. H1–H3 final close
readings are taken on the idle host at the close commit.

**Limits, recorded not hidden.** (a) **Forgery boundary unchanged.** The static arms remain
satisfiable by a whole-tree author; discrimination rests on the challenge arms (B1c, B2c, B2e,
B3c, B4c, B4d) plus the judged committed bytes (r49 precedent). The round-51 end-to-end witness
(zero-spawn forger, faithful receipt format, no process execution, held=9/9 in a forger-owned
tree) still marks the edge of that boundary. (b) **A2c predictability is closed by B2e** — the
probe generates the nonce, writes the 32 bytes to the child's stdin and captures the child's
real stdout itself, so hashing argv no longer suffices; what remains is (a), not this.
(c) **A3e (captured invocation) stays OPEN** — binding a receipt to a genuinely executed child
rather than to probe-captured stdout is not claimed and is named as a round-53 candidate.
(d) **R52-9 / R52-10 DEFERRED by the plan** — the ledger's evidence set is `*.txt`-scoped, and
B4's distinct-sha arm is satisfiable by trailing-newline bytes alone (only the nonce arm ties
distinctness to distinct invocations); ledger recursion would change B4's corpora semantics.
(e) Wall-window tolerance stays exactly −60,000/+60,073 ms (the Q39 ceiling); a re-dated copy
inside the window verifies. (f) The display `run-at:` prelude stays display text, bound by the
sidecar and not by the inner digest (v1 semantics preserved); the counter no longer trusts it —
B2 scores the span from the digest-bound body field (R52-7 closed for the counter) and the
SHAPE prelude check closes R52-8's zone-less flip. (g) D52's E5 is live-only and E4 trusts the
rev's own `sources-check` (the D5/D4 analogue, R51-4 class). (h) Probe runs inherit the host
environment (interpreter-tampering class). (i) The three-receipt span is author-scheduled and
honestly labelled (R50-4 class); the receipts run at L1 integration because the single-wave
shape cannot attack bytes that do not exist yet. (j) Q43's enforcement is manual, and Q44 (cite
measured close R1, name R2/R3, quote the committed FINAL line) is manual too — same class.
(k) **R43-1 / R43-5 stay open**; the **R41-2** gate-pins ruling stays pending
(`.ufo/l0-questions.md`, kumitate round 42). (l) B1's ≥30-case floor is a count, not a coverage
proof; B1c/B2e/B3c/B4c/B4d are the arms that score behaviour.

Planned next round (candidates, not commitments): (1) **R52-9/R52-10 ledger strengthening**
(typed/recursive evidence set plus an arm binding distinctness to distinct invocations, with its
own before/after and corpora semantics change); (2) **A3e captured invocation** — the open arm
that would bind a receipt to a real executed child; (3) routing the lane's three-receipt pattern
through `receipt-attest` itself as its first internal consumer (carried from round 51,
unshipped); (4) **R43-1/R43-5 stay open**; the **R41-2** gate-pins ruling stays pending with
`proxy-check` GATE_PINS extended for it (the established round-44/46/47 pattern); (5) the full
pin re-derivation dance if the instrument bytes change again (`pin.receipt-attest` +
`kumitate-gate-pins-v1` + SKILL.md checklist item 23 label).

**Capability row note.** `*Round-52 note (capabilities; the paragraph above stays as
written).*` The `receipt-attest` row is now **v2**: contract `kumitate-receipt-attest-v2` at
`scripts/receipt-attest.mjs` (sha256 `<<FILL: v2 bytes>>`; the v1 bytes `44919763…f48e8d9`
stay in history and v1 receipts stay valid — B6 pins this) with the routed hardening package,
additions only: `SHAPE` (exact field whitelist `{argv, exit, mono_span_ms, nonce,
stderr_sha256, stdout_sha256, wall_end, wall_start, digest, stdin_sha256?}`, exactly two lines
plus trailing newline, prelude `^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$`, sidecar name
equals receipt basename, no half-pair on sidecar write failure, spawn failure recorded as exit
127 and selftest-asserted); `CLOCK` (finite `Date.parse` AND exact `toISOString` round-trip;
rolled or non-finite → `RECEIPT: TAMPERED` exit 1); `STDIN` (`run --out <base> --stdin --
<cmd…>`: the instrument writes the 32 nonce bytes to the child's stdin and binds
`stdin_sha256`); `LEDGER` (documented damaged-prior skip with a printed note plus a selftest
arm); `SELFTEST` (≥30 hermetic cases, the R52-6 truncated-compare forgers included, all 27 v1
cases retained). Verified at R1 `<<FILL: rev>>` by A52 `held=13/13`; SKILL.md gate-registry row
and checklist item 23 carry the v2 contract label `<<FILL: SKILL.md line(s)>>`; R52-4 (round-50
probe stale literal `Twelve` → `Thirteen`, re-derived count-independently, versioned v2,
receipt re-run) `<<FILL: repaired at commit X / stays routed with reason>>`.

---

## Integration fill list (delete with the draft header)

1. `R1` measured close revision and the verbatim `close/FINAL-<R1>.txt` A52 + D52 + proxy lines.
2. `R2`/`R3` receipt and idempotence commits and their lines (`close/IDEMPOTENCE-<R2>.txt`).
3. The three `receipts/attest52-run-{1,2,3}.txt` runs (+ sidecars), the doctored
   `attest52-run-2-replayed.txt` TAMPERED reading, and the `build/MutCounter52/counter-mutant.txt`
   transcript.
4. K2 print-stub and K4 counter-mutant readings (drop-one, hold-call-deleted).
5. R52-4 round-50 repair commit, the re-run receipt, and whether the repair landed or stays routed.
6. S103 identity + tier, E1..E5 lines, E2 clause count + receipt-bound file list, E3 row text,
   E4/E5 exit lines, census before→after (rows, tiers, W04 delta), entry sha256/sections.
7. Freeze-repair verdict ("none" unless an addendum landed) — with addendum item numbers/commits.
8. Terms: re-derived stanza (A, C=23, C2=118, S/R/K), the close `--strict` MATCH line verbatim,
   the operability integer arithmetic, and `pin.receipt-attest` = sha256(v2 bytes).
9. Harm H1–H5 readings (checklist 23/23, six selftests, proxy, census, G50/R50/A51/D51).
10. Capability row: v2 sha256, SKILL.md registry row + checklist item 23 lines.
11. Attack-seat count as the canonical judge scores it (24 / 25 / 29 readings recorded above).
12. Mined mistake line in `corpus/lessons/round-52.md ## Mistakes`, and Q44's landed text.
