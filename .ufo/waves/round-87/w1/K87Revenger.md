# K87Revenger — what `tool_sha256=` was supposed to be, and whether `receipt-bind` is a new contract

Seat: K87Revenger (revenger). Round 87, wave 1. Lane `kumitate-shokunin`.
Base `db97929212bb61ae970b10abac3cc4cd976713ae`; freeze `25a3a75df123a59c5cf0de944a6d2f067e278f82`.
Nothing committed; every artifact beneath `.ufo/waves/round-87/build/K87Revenger/`.

## Verdict (one paragraph)

`tool_sha256=` was invented by the round-86 close runner and meant "the digest of the instrument this
receipt is about" — the meaning its two ancestors give it explicitly — but its value was hoisted out of
the per-case loop, so nine of ten receipts name an instrument the case never ran. What it *should* have
meant is the sentence the L1 wrote after the fact: the sha256 of the bytes the case's own command line
executed, read at the revision the receipt names. The 229 unbound historical receipts are **not**
salvageable as bindings by any deterministic rule: 229 of 229 carry no digest of their subject at all, so
a rule can at best *name* the subject (45 receipts carry a command in a non-`cmd=` syntax, 37 of those
resolve at their own `rev=`), never *check* it — and 114 of the 225 that carry neither `cmd=` nor
`tool_sha256=` do not even name a revision to hash against. `receipt-bind` does not duplicate any
*implemented* surface (`report-receipt-diff` never parses a 64-hex digest and declares the gap itself;
`receipt-attest`'s field whitelist makes the field unrepresentable; `receipt-evidence` cannot read the
close-receipt dialect at all), but it **is a strictly weaker restatement of a property the lane has
already held since round 58** — `receipt-evidence`'s REPRODUCTION arm re-runs a receipt's recorded argv
at the judged revision, which binds a receipt to the instrument it names by execution, and it did so on
real receipts in round 58. The honest framing of C1 is therefore not "the lane can now bind a receipt to
its instrument" but "the lane's *close-receipt dialect* became auditable at all, for receipts minted from
round 87 onward".

## (a) What `tool_sha256=` meant to its author, and what it should have meant

**What the field is.** `.ufo/waves/round-86/run-close.mjs:11-22` is a ten-case table; `:13` is the only
case that invokes `scripts/counter-receipt.mjs`; `:24` computes one digest for the whole run —
`createHash('sha256').update(readFileSync(`${lane}/scripts/counter-receipt.mjs`))` — and `:26` writes it
into every receipt. The loop variable `name` reaches the command at `:25` and the filename at `:26`, but
not the hash at `:24`. That is the whole defect: a value that was correct for the one case it was copied
from (`selftest`) and wrong for the other nine.

**Provenance, measured.** Round 86 is the first round in this lane whose close receipts carry the field
at all: of the 300 close receipts in rounds 60-85, **zero** carry `^tool_sha256=`; round-86 carries it in
10 of 10 (`perround-verdicts.txt`, `census-deep.txt`). The runner landed at the measured revision
`19b4e440e83ea9d618708003f36c3a799eb13e08` and was never edited (`git log -- .ufo/waves/round-86/run-close.mjs`
→ one commit). So the field has no history, no stated contract and no earlier value: its meaning *is*
line 24. Round-85's receipts show the preceding state — `rev=` and `cmd=` present, no digest
(`.ufo/waves/round-85/close/c1-probe.txt:1-2`), which the round-86 scout recorded as R85-V5 and round 86
then "complied" with by adding the header (`K86Scout.md:45`).

**What it meant, from the two instruments it was copied from.** The field is not novel; the lane uses it
elsewhere with an explicit gloss:

- `.ufo/waves/round-68/build/K68ExecToolSelftest/run-cases.mjs:607-608` emits `tool_under_test: TOOL`
  immediately beside `tool_sha256: sha256(readFileSync(TOOL))` — the pair *defines* the field: digest of
  the tool under test.
- `.ufo/waves/round-84/build/K84Mutation/mutate84.mjs:33-35` writes `tool_sha256: hash(readFileSync(tool))`
  into a record whose receipt line prints `working-copy sha256 <hash>` directly above `command=…` — the
  digest of the bytes that command ran.
- `.ufo/waves/round-70/build/K70ProbeHeaderModes/probe-header-modes.mjs:192` prints `tool_sha256=` for the
  candidate probe under test.

So: **to its author, `tool_sha256` meant "the instrument this receipt is about"; the bug is that the
subject was resolved once, from the runner's own copy origin, instead of per case.**

**What it should have meant — the lane had already ruled on it.** `corpus/lessons/round-85-verifier-spotcheck.md:130`
(R85-V3) rejected a receipt that named `tool_sha256=7659be6e…`, the *candidate* bytes, when the claim was
about the integrated instrument: the field must name the instrument the evidence is about, and naming a
different one is a defect. `corpus/lessons/round-86-verifier-spotcheck.md:117-121` restates it for round
86 and gives the fix in one line: "hash the invoked script per case and re-emit". The normative form of
that fix is now `SKILL.md:646` ("a receipt's `tool_sha256=` must name the instrument its own `cmd=`
invoked") — written *after* the defect, which is precisely why no gate could see it before
(`SKILL.md` at base `db979292` contains no sentence about `tool_sha256` at all).

**Corroborated at the measured revision** (`crosscheck.txt` §P4): the ten receipts all carry
`e9531370…`, which is `scripts/counter-receipt.mjs` at `19b4e440…` — correct for `selftest.txt` only. The
instruments the nine other cases actually ran hash `fd51dc98…` (proxy-check), `fc119ab6…` (readme-map),
`e2b0f0de…` (spotcheck-adopt), `d6e6ba8a…` (ready-handoff), `4d927ce3…` (plan-before-ready.sh), and
`census` runs a fleet-external script. The spot-check's "nine of ten" is exact.

## (b) Are the 229 receipts without `cmd=` salvageable by a deterministic rule?

**Short answer: the *subject* is partly nameable; the *binding* is unrecoverable for all 229.**

The census (`open/census-toolbind.txt:1`) counts `no_cmd=229` over rounds 74-86. Re-deriving it
(`census-deep.txt`, `recoverability-split.txt`):

| class | count | what a deterministic rule can do |
|---|---|---|
| carries a command line in a **non-`cmd=` syntax** (`$ node …`, `command=node …`, `cmd: grep …`) **and** `rev=` | 42 | the subject is **nameable from committed bytes**; 37 of them resolve their named script at their own rev (`resolvable.txt`). Still no digest → no binding |
| same syntax, **no** `rev=` | 8 | subject nameable, revision unbound |
| no command text, **with** `rev=` | 73 | subject only by convention (filename stem → `scripts/<stem>.mjs` hits 51 of 111) — inference, not derivation |
| no command text, **no** `rev=` | 106 | subject unrecoverable in principle |
| **total** | **229** | |

Two structural reasons no rule closes the gap:

1. **There is nothing to compare.** A binding is a relation between a receipt's bytes and an
   instrument's bytes. These receipts carry no digest of the subject, so even a perfect subject-identifier
   yields no check: assigning `sha256(git show rev:scripts/x.mjs)` to a historical receipt would be
   *minting a new claim* and retro-fitting it, which is the failure Q17 names (`corpus/QUALITY.md:130-131`:
   a ratchet that equals the current debt is not a gate).
2. **114 of the 225 carry no revision either**, so even the "hash the identified script at the receipt's
   rev" repair has no rev to hash at.

**What the frozen contract actually says about them** (`perround-verdicts.txt`, applying
`mismatched==0 AND unchecked==0` from `plan.md:64` to every historical close dir): rounds 74-85 read
`DRIFT` with `unchecked` = the whole directory (9-29 receipts each); round 86 reads `DRIFT` with
`matched=1 mismatched=9 unchecked=0`. So the instrument converts silence into *counted* silence for the
old rounds and into a *visible mismatch* for round 86 — a real improvement over "no gate can see it" —
but it never reads CLEAN on any pre-round-87 directory, and cannot.

**Honest disposition for the L1:** record the 229 as `unchecked` history, permanently. The only way to
re-earn any of those claims is to re-run the gate at a named revision and commit a *new* receipt — which
is exactly `receipt-evidence`'s REPRODUCTION arm, not a recovery of the old bytes.

## (c) Overlap, duplication or contradiction with the three existing receipt contracts

| instrument | what it binds | input dialect | verdict on `receipt-bind` |
|---|---|---|---|
| `receipt-attest` (v3) | body fields → inner digest; receipt bytes → sidecar; nonce → ledger. **No instrument digest**: `SEMANTIC_FIELDS` is `argv, exit, mono_span_ms, nonce, stderr_sha256, stdout_sha256, wall_end, wall_start` (`scripts/receipt-attest.mjs:98`) and `ALLOWED_FIELDS` (`:99`) rejects anything else | `run-at:` prelude + one canonical-JSON line + sidecar | **no overlap, and an incompatibility**: the round-86 header is *unrepresentable* in this dialect — adding `tool_sha256` is a v4 contract bump, not an arm |
| `receipt-evidence` (v1) | LEDGER (`scripts/receipt-evidence.mjs:11-14`, `:170-173`) + **REPRODUCTION** (`:184-193`: re-runs `body.argv` in a `git archive` extraction of the judged rev and compares exit, stdout and stderr digests) | attested receipts only | **overlap at the property level, weaker**: REPRODUCTION binds a receipt to the instrument its argv names *by execution*; `receipt-bind` binds it *by hashing argv[1]'s bytes*. Strictly weaker, but reachable on a dialect `receipt-evidence` cannot read (proved: `RECEIPT_EVIDENCE: UNMET reason=LEDGER` over the round-86 close dir, `crosscheck.txt` §P2) |
| `report-receipt-diff` (v4) | report → receipts: tallies, pointers, hashes | the report + the round's `base/`+`close/` receipts | **no overlap, fills a declared hole**: its `HASH` is `/\b[0-9a-fA-F]{39,41}\b/g` (`scripts/report-receipt-diff.mjs:59`) so a 64-hex digest is never even parsed, and `:35-37` declares "nothing in the tree binds a receipt to a counter run". Proved blind: a receipt whose `tool_sha256=` is 64 zeros and whose `cmd=` names a file that does not exist reads `REPORT_RECEIPT: CLEAN` (`crosscheck.txt` §P1) |

**No contradiction.** The three contracts are silent on the close-receipt dialect rather than opposed to
it. Two adjacent instruments are *not* overlapping and should not be confused with it:
`counter-receipt --src` binds the **source** to the receipt (`scripts/counter-receipt.mjs:151`,
`SOURCE: … sha256=`), a different subject; and `scripts/bind-oracle.mjs` is about *mount* binds
(`kumitate-bind-oracle-v1`) — a pure name collision with the new gate, worth a note in the registry so a
reader grepping "bind" is not misled.

**The finding the L1 must report plainly:** the lane could already bind a receipt to its instrument, by
execution, from round 58 — `.ufo/waves/round-58/receipts/attest-run-1.txt:2` records
`argv: ["node","scripts/readme-map.mjs","--selftest"]`, and `.ufo/waves/round-58/build/ExecToolVerifyR1/verify-r1.stdout:1`
reads `RECEIPT_EVIDENCE: HELD receipts=3 reproduced=3 …`. It was never run on a lane *close* receipt
(0 `RECEIPT_EVIDENCE: HELD` lines in any `.ufo/waves/*/close/*.txt`; the 51 occurrences in the tree are
all round-58 build artifacts). So C1's capability is real but narrower than its label: **"the close-receipt
dialect became auditable"**, not "receipt→instrument binding is new".

## Recommendation

Keep `receipt-bind` as a separate file — its input dialect and exit map are incompatible with
`receipt-evidence`'s attested-ledger contract, and folding a second format branch into a v1 gate with a
ten-case selftest buys nothing — but register it in `SKILL.md` as `receipt-evidence`'s **SUBJECT arm on the
close-receipt dialect**, not as an independent capability row, and stop the dialect from spreading: mint
round-88's close receipts with `receipt-attest run -- <cmd>` so that the property C1 actually claims is
scored by REPRODUCTION (which also proves the receipt was *executed*, something a static digest cannot),
leaving `receipt-bind` as a cheap pre-commit lint inside the close runner. If the lane keeps the
capability claim, the round report must say three things in the same breath: (i) the 229 historical
receipts stay `unchecked` forever and no rule can recover them; (ii) round 86 is the only historical
directory where the class is *visible*, and it is visible as DRIFT; (iii) the instrument is a
*consistency* check, not an authenticity check — a writer who runs Y and declares X with `sha256(X)`
passes, because both fields are writer-controlled; only REPRODUCTION closes that.

## Work performed

Reconstructed the field's intent from the two instruments it was copied from and from the lane's own
rulings (R85-V3, R86-D1), re-derived the base census four ways, and judged the frozen contract against
the three existing receipt contracts with four read-only cross-checks. Commands (all exit codes in
`crosscheck.txt`, `census-deep.txt`, `perround-verdicts.txt`, `recoverability-split.txt`, `resolvable.txt`):

| # | command | result |
|---|---|---|
| 1 | `node census-deep.mjs round-74 … round-86` | 239 receipts, 225 with neither `cmd=` nor `tool_sha256=`, 111 of those with `rev=` |
| 2 | `node recoverability-split.mjs` (as `split.mjs`) | 42 command-shaped+rev, 8 command-shaped only, 73 rev only, 106 neither |
| 3 | `node resolvable.mjs` | 37 command-shaped receipts name a script that resolves at their own rev |
| 4 | `node perround.mjs` | every historical close dir (74-86) reads DRIFT under the frozen CLEAN rule; round 86 is the only one with `mismatched=9` |
| 5 | `bash crosscheck.sh <SCRATCH>` | P1 `REPORT_RECEIPT: CLEAN` over a 64-zero digest and a nonexistent `cmd=` (exit 0); P2 `RECEIPT_EVIDENCE: UNMET reason=LEDGER` (exit 1); P3 round-86 report at `19b4e440…`/`ee0ffa9f…` DRIFTs only on pointer/hash findings, never on the instrument; P4 digests |

Read-only; no lane file written outside this seat's build and report paths; no commit; no pacman
transaction (nothing installed).

## Landed changes

None in production. Candidates for the L1, all beneath `.ufo/waves/round-87/build/K87Revenger/`:
`census-deep.mjs`, `perround.mjs`, `split.mjs`, `resolvable.mjs`, `crosscheck.sh` and their `.txt` outputs.
Integration points, if the L1 wants them: `perround-verdicts.txt` is the row that says the instrument
reads DRIFT on every historical round (report it with (b)); `crosscheck.txt` §P1 is the receipt that
`report-receipt-diff`'s declared limit at `:35-37` is a live blindness, not a theoretical one.

Three contract notes, offered as findings, none of which is a red on the frozen predicate:

- **K87REV-N1 (precision).** The close runner runs its own `bind` case (`.ufo/waves/round-87/build/K87ExecClose/run-close.mjs:106`)
  *before* `c1-probe` (`:107`), so the committed `bind.txt` records a tally over the ten receipts that
  existed at that moment while the certified directory ends with twelve. The frozen probe re-runs the
  tool over the finished directory (arm 4, `.ufo/waves/round-87/probe/probe87-c1.mjs:110-118`), so the
  predicate holds — but the round report must write `matched=10` as "10 of 12 present", never as the
  whole set.
- **K87REV-N2 (reproducibility).** One of the twelve receipts binds an instrument outside the lane
  (`/home/vgpnk/Projects/shokunin/scripts/sources-census.sh`, current digest `3fb72615…`, last touched by
  fleet commit `f47ad6ba`), hashed from disk and not from the revision, exactly as the contract discloses
  (`plan.md:59-64`, `external=`). The after-state is therefore not stable: a fleet-side edit to that file
  flips the census receipt to DRIFT and turns arm 4 red for a reason that has nothing to do with this
  lane. Either drop the external case from the certified directory or exclude external receipts from the
  CLEAN predicate (a contract change, since CLEAN currently requires `mismatched==0` over the directory).
- **K87REV-N3 (unspecified case).** The instrument is a *positional* token (second whitespace token), so a
  legitimate `cmd=node --input-type=module -e …` or `cmd=bash -c …` receipt has no resolvable second token
  and, under the frozen exit map, makes the whole directory fail closed with `UNRESOLVED` (arm 8 fixes
  that exit at `probe87-c1.mjs:169-185`). Such receipts exist in history in the neighbouring syntax
  (`.ufo/waves/round-77/close/r78-loader-rerun.txt:1`), so the hazard is one header convention away.
  Suggested wording for a future contract: a second token that begins with `-` is `unchecked`, not
  unresolved; or derive the instrument as the first argv token that resolves to a file at the revision.

## Before → after measurements

| quantity | before round 87 | with the frozen contract | evidence |
|---|---|---|---|
| close receipts carrying a subject digest | 10 of 310 (rounds 60-86); 0 of 300 before round 86 | the same 10, now checked | `census-deep.txt`, `perround-verdicts.txt` |
| historical close directories readable by any gate | 0 | 13 of 13 read a verdict; 1 (round 86) shows the class, 12 read `unchecked` only | `perround-verdicts.txt` |
| binding of a receipt to its instrument | attested receipts only, by REPRODUCTION, never run on close receipts (0 close receipts carry `RECEIPT_EVIDENCE: HELD`) | close receipts checkable statically from round 87 onward | `.ufo/waves/round-58/build/ExecToolVerifyR1/verify-r1.stdout:1`, `crosscheck.txt` §P2 |
| gates that can see a 64-hex digest naming the wrong file | `report-receipt-diff` cannot (`:59`, `:35-37`); proved blind on a 64-zero fixture | `receipt-bind` sees it as `mismatched` | `crosscheck.txt` §P1 |

I did not run the frozen scorer: the instrument `receipt-bind` is absent from `scripts/` at the freeze
commit, so arms 2 and 4-12 have no candidate to score and any run would be a statement about a file that
does not exist. This seat's judgement is about the contract, the probe's arms and the close runner's
candidate, not about integrated bytes.

## Sources & frontier

No new source rows opened; this is a reconstruction over committed bytes only. Ground used:
`corpus/lessons/round-85-verifier-spotcheck.md:130`, `corpus/lessons/round-86-verifier-spotcheck.md:117-121`,
`corpus/QUALITY.md:130-131` (Q17), `SKILL.md:622` (receipt-evidence), `:626` (receipt-attest), `:646`
(receipt-bind), `:763` (its checklist item). Frontier: none entered; the receipt-dialect question belongs
to the lane's own knowledge base, not to an external source.

## Trend verdicts

| trend | verdict | evidence |
|---|---|---|
| quality | **improved with a caveat** | the class R86-D1 names becomes visible and future receipts bind per case; the caveat is that the same property already existed at higher strength and was never applied |
| discernment | **improved** | the frozen contract is non-vacuous (four controls at 0/0/1/3 of 12) and the probe's same-directory fixtures kill path- and name-keyed answers; the label of the capability is what needs correcting, not the instrument |
| expansion | **unchanged** | no new frontier area; the work reconstructs existing contracts |

## SHONEN

- [x] Read the frozen plan and the frozen probe before touching anything; cited both by line.
- [x] Re-derived the base census four ways rather than restating it; found the 45 receipts the `^cmd=` regex cannot see.
- [x] Ran the three cross-checks read-only and reported the red ones as red (`RECEIPT_EVIDENCE: UNMET`, `REPORT_RECEIPT: DRIFT`).
- [x] Said plainly where the claim is narrower than its label, with the receipt that proves the lane already held the property.
- [x] Left the lane untouched: no commit, no edit to a frozen file, scratch removed.
