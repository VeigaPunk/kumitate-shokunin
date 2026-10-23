# CritClaimSizing — falsification of the round-50 claim framing

Seat: KumitateR50.CritClaimSizing (critic). Lane repo read-only; no installs; no scratch builds needed
(analysis seat). Attacked object: the claim framing in `.ufo/waves/round-50/plan.md` (§"C1", §"Frontier
audit") as scored by the frozen counters `probe/bindguard50-probe.mjs` (rule G50) and
`probe/repairs50-probe.mjs` (rule R50).

Frozen artifacts hashed for this review:

```
$ sha256sum .ufo/waves/round-50/plan.md .ufo/waves/round-50/probe/bindguard50-probe.mjs .ufo/waves/round-50/probe/repairs50-probe.mjs
4a024d84476aa13c18dcaee575cfbb317597b5b02802571c9ccc647e64fc833e  .ufo/waves/round-50/plan.md
a9e79600d8849d947f0074b6f2964c17611b40a324afb9c5793ea7f212b61dc3  .ufo/waves/round-50/probe/bindguard50-probe.mjs
f69dbc3ecb6212646ed07503cfe395c8a32d5044e2ea8184b86ca74b7dca240d  .ufo/waves/round-50/probe/repairs50-probe.mjs
```

## The four sizing tests applied

Per the round prompt's claim-sizing rules and the lane's frozen-counter rule (r42 lesson): (1) a
do-nothing control must read UNMET at the base rev; (2) universal clauses ("every", "all") must be
enumerable by the counting command; (3) the claim must be re-derivable with one command; (4) nothing
already committed may make the predicate vacuously true. At terminal saturation the lane's established
convention (r43 capability re-claim, r44–r49 "integer held" rows, SCORECARD `## Axes`) is that a claim
is a verifiable capability acquisition/hold — the f_O integer cannot move (see "Axes" below).

## C1 (GUARD_HELD, rule G50) — VERDICT: real operability claim, correctly sized. Not bookkeeping.

**What the predicate measures.** Eight checks over `git archive <rev>` bytes, five of them behavioral
(bwrap children run; host-side marker files checked): G2 refusal arm runs `cap-run --bind <D>` for the
8-value set {`/tmp`, `/tmp/`, `/tmp/.`, `/`, `/run`, `/proc/self`, `rel`, nonexistent} and requires exit
64 + `CAP_RUN: USAGE`; G3 binds a host dir under /tmp and asserts the child /tmp is still tmpfs and a
child write does not reach the host; G8 asserts ordinary no-bind isolation. G4/G5 are the two
instruments' selftests; G6 binds five named pins to extracted sha256; G7 runs `proxy-check --strict` at
the extract.

**Test 1 — do-nothing control: PASS (discriminates).** Committed base control at `ff40d7d`
(`.ufo/waves/round-50/controls/CtlG50-base-ff40d7d-r1.txt`):

```
  G1 PASS present
  G2 MISS /tmp:exit=0;/tmp/:exit=0;/tmp/.:exit=0
  G3 PASS exit=0 bound_rw=true tmpfs=true
  G4 PASS exit=0 VERDICT: PASS
  G5 PASS exit=0 VERDICT: PASS
  G6 MISS pin.bind-oracle=absent
  G7 MISS exit=1 PROXY: DRIFT (...)
  G8 PASS exit=0 host_marker=false
BINDGUARD50: GUARD_UNMET held=5/8 checks=8 rev=ff40d7d rule=G50 ...
exit=1
```

The exposure itself is proven at base (`CtlExposure-base-ff40d7d.txt`: child through `--bind /tmp` exits
0 and `host_marker=present`). The counter can fail, and fails exactly on the claimed delta (G2/G6/G7).

**Test 2 — universal clauses: PASS with one recorded sampling limit.** G2's "every D" is enumerated
(probe source, the `refusals` array, 8 values). G6's pin set is 5 named keys. No unbounded universal.
Recorded limit: G3 asserts "subdirectory binds keep working" with a single fixture dir — a sampled
witness of a universal, same class as r49's output-text-oracle limit; plan limit (a) partially
discloses this ("binds under /tmp keep working (G3 asserts it)"). Acceptable as a limit; it would only
become a hole if the plan claimed "all subdir binds" rather than "G3 asserts it".

**Test 3 — one-command re-derivation: PASS with one structural caveat.** The counting command is
`node .ufo/waves/round-50/probe/bindguard50-probe.mjs <lane> <rev>`; the verdict line
`GUARD_HELD held=8/8 checks=8 rev=<rev> rule=G50` is the frozen printed predicate (r42 rule: the printed
line is the rule). Caveat: G7 sets `UFO_SRC=/home/vgpnk/Projects/ufo-fsd-alpha` and reads the **live
origin checkout**, so GUARD_HELD is not a pure function of `<rev>` — an upstream move unrelated to the
rev can flip G7 on a re-run. This matches every prior round's proxy-stanza practice and the origin is
itself stanza-pinned, but the closure should record it as a limit (same class as R50's R7/R8 live reads,
smaller blast radius).

**Test 4 — vacuity: PASS.** Nothing already committed makes the predicate true at base (Test 1 shows
5/8). G1 (file exists) is trivially true everywhere but is 1/8 and never decisive alone.

**Is it an axis move?** Operability is terminal: `f_O = (A+C)/(A+C+3) < 1` for all finite A+C, so the
integer caps at 9 (SCORECARD r49 row: "integer held 9 — terminal under f_O"). C1 adds no declared proxy
term (a patch to existing `cap-run.mjs` plus a pin — A=10, C=19 hold). Under the lane's standing
convention this is a **capability hold at the terminal axis**: the tool now enforces, under adversarial
input, the property its own contract advertised ("and `/run` are fresh tmpfs mounts"). The exposure was
self-inflicted by cap-run's argv order (binds appended after `--tmpfs /tmp`, r47 design, S095) — the
plan discloses this verbatim (context R50-6), so the framing is honest, not laundered. The strongest
counterexample I could construct — "repairing your own design hole is bookkeeping" — fails because the
counter measures runtime behavior (exit 64; host markers), not the patch text, and the do-nothing
control discriminates. One thinness to record: the claim's novelty concentrates in one behavioral arm
(G2, 8 sub-cases) plus its negative space (G3); G6/G7 are regression-guard bookkeeping in support
(R41-2 pattern). Thin is not dishonest here — the capability *is* "refuses whole-point /tmp binds".

## C2 (LEDGER_HELD, rule R50) — VERDICT: correctly labeled "not a claim". If anyone scored it, it would be repair bookkeeping wearing claim clothes. The plan's refusal to claim it is load-bearing.

**What the predicate actually measures.** Of 8 checks: R1/R5/R6/R8 are pure committed-text presence
(four words inside `## Gate`; absence of `all eleven` + presence of `Twelve`; two headings; six
substrings in a fleet report). R2/R3 attest receipt first-line format plus sha256 of the *fetched source
bodies* (genuine re-fetch attestation, but lane-state-neutral — nothing about the lane's object moves).
R4 checks receipt count, prelude format, sha256-distinctness and a ≥300 s span computed from
**self-reported `run-at=` preludes** — plan limit (c) itself admits a forged clock line defeats it.
R7/R8 read **live fleet state outside `<rev>`** (`sources-census.sh validate` over the live fleet root;
`git -C <fleet> show master:` at probe time). Committed base control (`CtlR50-base-ff40d7d-r2.txt`):
`LEDGER_UNMET held=1/8`, exit 1 — the counter discriminates, but what it discriminates is *the presence
of repair text and receipts*, not any axis state.

**Falsification against the sizing rules, if it were scored as coverage/coverage-learning:**
- No axis term moves: no registry cell, no member section, no proxy term, no f_O term. Nothing in the
  lane's coverage object (retired aggregate; script/runtime/kimi successors all at 10) changes.
- Not re-derivable at `<rev>`: R7/R8 are functions of live fleet state (plan limit (d) admits the
  ordering dependency). A scored claim must be a pure rev function; R50 structurally is not.
- Predicates text, not state: "LEDGER_HELD" answers "did the closure land the repairs" — an audit
  question, not "did the lane learn/cover something".
So: as a claim it fails sizing on three independent grounds. As an **auxiliary frontier/closure
audit** — which is what the plan declares ("Frontier audit (not a second claim)", "no axis score
attaches to this auxiliary audit") — it is legitimate and useful. The framing is honest before data.

**No smuggle vectors found.** Plan line 5: "This round's declared claim: **one**." The milestone's
"attacks on both frozen counters" invites attacking R50 as a counter, not scoring it. The wave spec's
`axes: ['operability','coverage']` matches r49's spec exactly — standing axis ownership, not a per-round
claim count; the closure must not read it as a second claim.

## Impacted axes

- **operability** — C1 claim judged sound; expected closure language "integer held 9 (terminal under
  f_O), capability `cap-run` /tmp bind-guard + pin.bind-oracle held, GUARD_HELD 8/8".
- **coverage (retired) and successors** — LEDGER_HELD must not be reported as a coverage or
  coverage-learning move. If the fleet report's claim table lists C2 for r50, that row is unsupported.

## Smallest safe correction

None required for C1. For C2 the correction is a "don't" for the L1/closure: keep R50 scored only as
the auxiliary audit (per plan), record G7's live-origin dependency as a limit beside plan limits
(c)/(d), and record G3's single-fixture sampling as a limit beside (a). If the closure wants a second
scored claim this round, none exists in the frozen artifacts — the honest report is one claim held.
