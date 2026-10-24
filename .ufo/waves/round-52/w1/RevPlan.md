# RevPlan — freeze-integrity review of round-52 plan.md vs both frozen counters

Read-only seat. Scope: (a) predicate-sentence byte-identity, (b) per-check fail-closed/exit 2,
(c) counting-command vs usage-line match, (d) claim sizing per AXES.md, (e) K1–K5 executable
controls. Lane root `/home/vgpnk/Projects/shokunin/kumitate-shokunin`. No writes outside this
report; no subagents, no background jobs.

**Q43 re-executed (evidence, not restated):** both frozen counters were re-run at
`02c01258464cac3804faf177d0cfbf113cd59706`. A52 reproduced `held=5/13` **byte-identically** to
`base/attest52-base.txt` (4.6 s, exit 1); D52 reproduced `held=0/5` byte-identically to
`base/doctrine52-base.txt` (exit 1). `node --check` clean on both probes. The freeze counter set
is therefore real, runnable, and reproducible — the findings below are about what the counters
*claim* versus what they *score*, not about whether they ran.

---

## HIGH

### H-1 Predicate sentences are NOT byte-identical in the probe headers — the stated freeze condition is false
`plan.md:52-53` (`ATTEST52_HELD …`) and `plan.md:58-59` (`DOCTRINE52_HELD …`) declare themselves
"frozen — byte-identical in probe header, SCORECARD row and report". Measured:

- exact sentence occurrences in `probe/attest52-probe.mjs`: **0**; in `probe/doctrine52-probe.mjs`: **0**
  (`grep -Fc` over the 218-byte / 212-byte strings extracted from plan.md).
- the probe headers carry only a short scalar form: `probe/attest52-probe.mjs:76`
  `* Predicate ATTEST52_HELD = held=13/13, exit 0.` and `probe/doctrine52-probe.mjs:30`
  `* Predicate DOCTRINE52_HELD = held=5/5, exit 0.`
- the sentences ARE byte-identical in `plan.md` and in the dispatched `w1-taskcall.json` context
  (verified programmatically: `ctx has S1: True | ctx has S2: True`), and the `ScribeReport` item
  only demands identity "to plan.md".

Consequence: seat `SonicFreeze` item (b) — "verify the two frozen predicate sentences appear
BYTE-IDENTICAL in plan.md and in the respective probe headers (diff the sentences)" — is
**unsatisfiable as dispatched**. It will either emit a false FAIL against a correct freeze, or
prompt an edit of the frozen probe bytes, which would void `f539a71e`'s receipts and require the
plan's own re-freeze path. Cheapest honest repair: an addendum re-scoping the identity condition
to `plan.md` + taskCall + report (no probe edit, no receipt re-run). Decide before SonicFreeze
returns, not after.

### H-2 C1 is not causally separable from C2 — AXES.md admission rule violated, and the counter cannot attribute the win
AXES.md: "Claims must be **causally separable** — each verifiable without the others having
landed". C1's B5 requires `proxy-check --strict` → `PROXY: MATCH` (`plan.md:123-124`, `plan.md:172`).
That verdict is computed over corpus-derived terms, and the round opened *already red*:

```
PROXY error A_DRIFT        A: declared=71 computed=73 delta=+2
PROXY error C2_TOTAL_DRIFT C2_total: declared=117 computed=118 delta=+1
PROXY error AXES_DRIFT     coverage: ## Axes row=10 derived=9
```
(`base/baseline-gates.txt:4-6`.)

The repair path is a C2-axis edit — the README map row for the unrowed corpus note plus the
SCORECARD stanza re-derivation (`plan.md:24-27`, `plan.md:174`). So C1's 13/13 is gated on files
that belong to C2's territory, and the plan says so itself ("the close stanza repair must restore
PROXY: MATCH for arm B5…"). Two assertions in the plan cannot both hold: "causally separable"
(`plan.md:45`) and "B5 needs the stanza/corpus repair" (`plan.md:24-27`). Worse, because the
drift is *inherited*, a green B5 at close is evidence that the drift was repaired, not that the
v2 instrument works. C2 is genuinely separable (E1–E5 touch no C1 byte); C1 is not separable from
C2. Recommendation: split B5's proxy conjunct out of the C1 predicate (a separate freshness
statement), or declare the drift repair as its own third claim. Do not ship 13/13 as C1's evidence
while B5 scores corpus bookkeeping.

### H-3 B2e does not close the zero-spawn shortcut it claims to close — the two conjuncts are the same predictable value
`plan.md:141-143` (K3) and `plan.md:117` (B2e) claim "the stdin-bound nonce plus
probe-captured output closes that shortcut" left open by A2c. By construction of
`probe/attest52-probe.mjs:229-243`:

- `stdinOk  = j.stdin_sha256 === sha(Buffer.from(j.nonce,'utf8'))`
- `capturedOk = j.stdout_sha256 === sha(cat.stdout)` where the probe feeds **the same nonce** to
  `/bin/cat`, and `cat` echoes its stdin — so `cat.stdout === nonce bytes`.

Both conjuncts reduce to `sha256(nonce)`, a value the instrument itself generates. `run --stdin --
/bin/cat` is a fixed point: a forger that never spawns a child and writes
`stdin_sha256 = stdout_sha256 = sha256(nonce)` satisfies B2e exactly as a genuine invocation does.
B2c has the same shape (`printf %s <nonce>` → stdout = nonce). The round-51 forger class is
therefore *not* closed; the plan inherits it and re-labels it closed. To actually bind a spawn the
child must produce output the probe can predict but the instrument cannot (e.g. `--stdin -- /bin/sh
-c 'sha256sum'` over nonce bytes, or `cat` fed nonce ‖ probe secret, compared back by the probe).
Control coverage: no seat isolates this. `CritDoNothing` is adjacent (it *tries* to reach 13/13
with a predictable stdin stub) but a failure there would be attributed to the other 12 arms, not to
B2e — the discriminating experiment ("v2 minus spawning still passes B2e") is unassigned.

### H-4 B3 and B3c can be satisfied by the SHAPE sidecar-name clause alone — the M2/prelude arm is not exercised
The v2 contract adds: "The sidecar's recorded name must equal the receipt's basename → else
`RECEIPT: TAMPERED`" (`plan.md:76`). Now read the two prelude-tamper arms:

- **B3c** (`probe/attest52-probe.mjs:313-324`): writes the tampered receipt at
  `${base}.txt.tampered` and copies the sidecar **untouched** (`.sha256` whose recorded name,
  per the r51 convention `7b87…  attest-run-1.txt`, is `${base}.txt`). Basename ≠ recorded name →
  any conforming v2 answers `RECEIPT: TAMPERED` at the SHAPE arm, before the prelude is compared.
- **B3** (committed doctored control, `plan.md:164-165`): "run-2's receipt with only the `run-at:`
  prelude rewritten, sidecar untouched" — same mismatch (`attest52-run-2.txt` recorded vs
  `attest52-run-2-replayed.txt` basename) unless the L1 rewrites the sidecar's name field, which
  the plan forbids ("untouched").

The contract does not pin the order of the name check vs the prelude/digest check, so a correct v2
legitimately passes both arms without ever detecting a prelude rewrite. That is precisely the M2
forgery class the round exists to harden. B1c and B4d craft sidecars with the correct basename, so
those arms are clean; only the two prelude arms are masked. Fix in the counter (craft the sidecar
with the tampered file's own basename, as B1c does) — this is a probe change, so it needs the
plan's addendum + fresh base receipts, and it should be decided before seats build against it.

### H-5 B4's nonce-reuse sweep never scans the corpora it names — zero coverage of the predecessor corpus
`plan.md:122`: "zero nonce hits across all prior receipt corpora"; probe header:
"(round-48/49/50/51 receipt corpora)". Implementation (`probe/attest52-probe.mjs:288-300`) selects
files by **basename** regex `/receipt|ReRun|L1-score/i.test(n)` while walking `.ufo/waves/` (skipping
`round-52`). The only prior receipt corpus that exists is `.ufo/waves/round-51/receipts/` with
basenames `attest-run-1.txt`, `attest-run-2.txt`, `attest-run-3.txt`, `attest-run-2-replayed.txt`,
`run-1.out` — **none** match. Round-52's own receipts (`attest52-run-*.txt`) do not match either.
Measured: 176 files match the regex lane-wide, zero of them are any round's receipt file. So the
nonce-reuse conjunct is a sweep of reports and unrelated `*-receipt*.txt` artifacts, and the
R52-10-adjacent claim ("no nonce reuse across prior corpora") is unscored. Cheapest no-probe-change
mitigation: have the L1 state in the report that this conjunct is decorative, and add the explicit
prior-corpus scan to round 53's counter (the plan already defers R52-9/10).

### H-6 The close sequence omits the one artifact B5c requires — C1 would cap at 12/13
B5c requires `.ufo/waves/round-52/build/MutCounter52/counter-mutant.txt` **at rev**
(`probe/attest52-probe.mjs:405-412`; `plan.md:125-127`). The close step 1
(`plan.md:181-184`) enumerates what the integration commits land and does not include that file;
it is currently untracked (`git ls-files .ufo/waves/round-52` → plan, probes, base/, w1-*.json
only). `.gitignore` does not exclude it (only `.ufo/interactive-sessions/`), so it is committable —
but a close executed literally from the list leaves B5c MISS and breaks the 13/13 predicate.
Add "build/MutCounter52/counter-mutant.txt (B5c evidence)" to step 1.

---

## MEDIUM

### M-1 D52's committed base receipt prints a fabricated denominator (`checks=5` after executing 1 check)
`probe/doctrine52-probe.mjs:61-65` short-circuits on `entry absent` and prints the literal
`held=0/5 checks=5 | E1 MISS entry-absent`. Reproduced verbatim. The verdict is fail-closed
(exit 1), but `checks=5` is a constant, not `checks.length`, on the one path whose transcript is
committed as freeze evidence — the same honest-counting class as the R52-5 vacuous-HELD the round
is hardening. Contrast A52, which records every arm via `hold()` and always reports a measured
`checks=13`. Fix: either record E1 and let the remaining arms score (they are all cheap) or print
`checks=1` on the short-circuit.

### M-2 The plan's frozen baseline omits a third drift term (A_DRIFT +2)
`plan.md:21-24` records `C2_TOTAL_DRIFT declared=117 computed=118` and `AXES_DRIFT coverage
declared=10 derived=9`. The executed baseline has a third: `A_DRIFT A: declared=71 computed=73
delta=+2` (`base/baseline-gates.txt:4`). H3's expected `PROXY: MATCH` (`plan.md:172`) therefore
depends on a term the plan never names — and `A_DRIFT` appears **0 times** in all 64 registry
items. Mitigation exists by accident (`RevStanza` item: "derive the EXACT block values (A, C, C2,
C2_total, and every layer term)"), so the repair is reachable; the *record* of the inherited state
is still wrong, and "INHERITED state" is what later rounds cite.

### M-3 Contract clauses with no enumerating check
Universal clauses the counter cannot score:
- `ATTEST_SELFTEST: PASS (n/n)` (`plan.md:93`) — B1 tests `/ATTEST_SELFTEST: PASS/` (substring), so
  a v2 that keeps v1's count-less final line passes.
- "every v1 case retained (v1 corpus: 27 cases)" (`plan.md:98`) — no check: B6 pins r51 *receipts*,
  not selftest cases. A v2 can delete all 27 and re-print 30 new cases.
- The five SHAPE arms, the spawn-failure exit-127 arm and the LEDGER skip-note arm (`plan.md:66-84`)
  are enforced only by the instrument's own `--selftest` — self-attestation. The only externally
  challenged hardening is CLOCK (B1c). A 30-line `case …: PASS` printer + a real `run/verify`
  satisfies B1 while omitting SHAPE/LEDGER entirely (the six contract items R52-3/R52-2 asked for).

That is exactly the enumeration gap AXES.md warns about ("no universal clause the counter cannot
enumerate"). Cheapest fix is a plan-addendum sentence naming SHAPE/LEDGER as self-attested (and
therefore inside the K3 forgery boundary) rather than countered.

### M-4 B5c's mutant evidence is a three-regex text match, not an execution receipt
`probe/attest52-probe.mjs:409-412` accepts any file containing `ATTEST52_UNMET`, `held=0/0`,
`exit 1`. No bind to a mutated probe's bytes, no command line, no exit-code provenance — any seat
can type the file. K4's "must never print HELD" is therefore text-shaped. A stronger arm costs one
field: require the transcript's first line to be the mutated probe's sha256 and the file to record
the literal command. **Tempering:** the artifact MutCounter52 actually delivered already exceeds the
check — `build/MutCounter52/counter-mutant.txt` records `Pristine bytes : sha256 f6146a2c…` and the
one-line transformation, and that hash matches the frozen probe at `f539a71e` (verified below), and
it satisfies all three patterns (4/1/3 hits). The defect is that the *counter* would accept a
hand-typed file, so K4's strength rests on seat honesty rather than on the arm.

### M-5 B5c's self-guard is not rev-bound and is trivially true
`probe/attest52-probe.mjs:413-416` reads the *running* probe source via `import.meta.url`, so one of
the 13 checks is not over `git archive` bytes despite `plan.md:113`; and since the frozen probe
always contains `/checks\.length\s*>\s*0/`, the conjunct can never fail. It adds no discrimination
(the real guard is the label expression itself, which is already frozen).

---

## LOW

- **L-1 K1's stated mechanism is wrong.** `plan.md:139`: "B1 misses (v1 selftest has 27 cases <30)".
  v1 prints `ATTEST_CASE NN <name>: PASS` (`scripts/receipt-attest.mjs:771`) and B1 counts
  `^case\s+\S+:\s+PASS` → measured `cases=0`, not 27 (reproduced; `base/attest52-base.txt` agrees).
  The control still misses, but the ≥30 threshold is never exercised by it, so K1 does not
  discriminate "27 vs 30" as claimed.
- **L-2 Predicate sentences quote a strict prefix of the printed line.** Actual output appends
  ` | <per-check detail>` (`attest52:473`, `doctrine52:132`). Satisfiable as a substring; a
  verbatim SCORECARD citation will not equal the frozen sentence. r51 precedent used an ellipsis
  (`SCORECARD.md:2268`).
- **L-3 Counting commands omit cwd** though the probe path is lane-relative (probe resolves `<lane>`
  from argv, so cwd only matters for locating the probe). Also: A52's predicate carries
  `version=v1`, D52's carries none — correct (no `VERSION` const in the D52 probe) but asymmetric
  against the SCORECARD convention of a `version=` token in rule lines.
- **L-4 Two of D52's five checks are not rev-bound / not hermetic.** E5 shells the fleet-owned
  `/home/vgpnk/Projects/shokunin/scripts/sources-census.sh` (`doctrine52-probe.mjs:114-117`) —
  outside the lane, environment-dependent (D51 precedent, but `plan.md:113`'s blanket "over
  archive bytes" does not hold). E2 shells `git show rev:path` per clause and compares
  `sha(Buffer.from(stdout,'utf8'))` — a binary receipt-bound path would false-MISS on the utf8
  round-trip.
- **L-5 ScribeReport skeleton absent at review time.** `build/ScribeReport/` does not exist (32
  build dirs present). Dependency, not a defect: the seat's item text correctly requires identity
  to `plan.md` only. The "SCORECARD row" leg of (a) is likewise unscored — `build/ScribeScorecard/`
  is absent. Both must be re-checked when they land.

---

## Verified clean (so the review does not over-report)

- **Q43 executed and reproducible**: A52 `held=5/13` and D52 `held=0/5` at `02c01258…` reproduce
  their committed receipts byte-for-byte.
- **13 + 5 checks enumerated exactly** as the plan lists (B1, B1c, B2, B2c, B2e, B3, B3c, B4, B4c,
  B4d, B5, B5c, B6 / E1–E5); no check is silently absent.
- **Exit 2 on crash** is wired in both probes (archive failure and the outer `catch`; `finally`
  still cleans the temp dir), and no path can reach `HELD` with a partial check set (`checks.length > 0`
  guard plus a recorded `hold()` per arm in A52). A malformed tool verdict degrades to MISS, never
  to a crash and never to HELD.
- **Counting commands match the probes' argv contract exactly** (lane, rev, no third arg; extra
  args → exit 64). `<lane>/.git` exists, `02c01258…` is a real commit, `git archive` works.
- **E3's column indices are right**: `corpus/SOURCES.md:12` header →
  `c[8]=status`, `c[11]=used-by`; `c[1]=id`. S102/S103 are genuinely absent at base (0 rows), so
  E1/E3 are honest base misses.
- **Wave shape**: 64 registered members (`w1-registry.json.members`), 25 attack seats (13 reviewer
  + 6 critic + 5 mutation-tester + 1 revenger) = 39% ≥ 25%, band 64–128 per
  `w1-validate.json.policy` (`waveMinLanes 64`, `waveMaxLanes 128`).
- **Freeze commit `f539a71e`** carries exactly `plan.md`, both probes, `base/` (3 files) — matches
  SonicFreeze item (d) and `plan.md`'s claim.
- **Frozen bytes are still the frozen bytes** (no mid-wave drift): `sha256(plan.md) =
  563d086bf1f59c60bb556501c0676597ec0df551eb03df57caacf1455c336565`,
  `sha256(attest52-probe.mjs) = f6146a2cfd3fba984848c5b91c1d2570108dc751d5edca5939d6f4aee5171428`,
  `sha256(doctrine52-probe.mjs) = e1aa408337e6546e82610d3781cafd40a4f166f39526059747e8fa3b92537169`
  — all three identical to the blobs at `f539a71e`. MutCounter52's recorded pristine hash matches
  the live probe, so its transcript is genuinely bound to the frozen bytes even though B5c does not
  require that binding.
- **B5c's evidence exists but is untracked.** `build/MutCounter52/counter-mutant.txt` (2213 B) is
  present, matches all three patterns, and `git ls-files` returns nothing for `build/` — H-6 is
  strictly a commit-list omission.
- **`.gitignore` does not exclude `.ufo`** (only `.ufo/interactive-sessions/`), so B5c's evidence
  and the receipts/close paths are committable — H-6 is an omission in the checklist, not an
  impossibility.
- **Kill-rule controls that do have executable coverage**: K1/K5 = the freeze receipts (executed,
  reproduced here); K2 = `CritDoNothing`; K4 = `MutCounter52` (both the drop-one-check and the
  hold-deleted mutant); K3 = only indirectly via `CritDoNothing` (see H-3).

## Kill-rule coverage table (item e)

| Rule | Executable control | Covered? |
|---|---|---|
| K1 do-nothing | `base/attest52-base.txt` (reproduced) | yes, rationale text wrong (L-1) |
| K2 print-stub | `CritDoNothing` | yes |
| K3 zero-spawn forger | none isolates B2e; `CritDoNothing` adjacent | **no** — B2e is a fixed point (H-3) |
| K4 counter mutants | `MutCounter52` (a)+(b) | arm exists; evidence text-shaped (M-4) and uncommitted at close (H-6) |
| K5 D52 do-nothing | `base/doctrine52-base.txt` (reproduced) | yes, denominator fabricated (M-1) |

## Residual risk and verification gaps

1. No v2 instrument exists yet, so H-4's masking is derived from clause ordering, not observed: if
   v2 evaluates the prelude/wall-window *before* the sidecar-name check, B3c would then exercise the
   prelude arm after all. The contract does not pin ordering — that is the defect; the fix should
   be an explicit order in the contract, not faith in one implementation.
2. B3's cleanliness depends on receipt bytes that do not exist yet (`receipts/` is absent), so only
   B3c is structural today.
3. `build/ScribeReport/kumitate.md` and `build/ScribeScorecard/scorecard-round-52.md` absent —
   the skeleton leg of (a) is unscored; re-check on land.
4. I did not re-run the mutant batteries, the census, or `proxy-check` end-to-end (out of
   freeze-integrity scope and the 15-minute box); the drift numbers cited are the committed
   `base/baseline-gates.txt` values, which match the A52 reproduction's B5 detail
   (`proxy exit=1 PROXY: DRIFT (C2_TOTAL_DRIFT …`).
5. Tooling: **nothing installed or upgraded** — no pacman, no uv/npx, no binary fetch; `node` and
   `git` already present sufficed. No pacman guard invocation occurred.

**Net recommendation to the L1:** H-1, H-2, H-6 are plan/schedule defects — fixable by a plan
addendum before integration, no counter change. H-3, H-4, H-5 are counter defects that change what
13/13 *means*; they require a probe change, which under the plan voids `f539a71e`'s receipts and
demands the addendum + fresh base re-run. If the operator will not spend the re-freeze, the honest
move is to state in the SCORECARD limits that B2e's anti-forgery closure, B4's prior-corpus sweep,
and the B3/B3c prelude attribution are **unproven** — not to cite them as controls.

Report: `.ufo/waves/round-52/w1/RevPlan.md`
