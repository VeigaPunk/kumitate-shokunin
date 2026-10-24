# CriticStaticVerdict — round 57, A57 verdict-path attack

Scope: does any arm of `.ufo/waves/round-57/probe/attest57-probe.mjs` (rule A57 v1)
trust prose over computed evidence — i.e., can a tree violate a check's *stated*
contract while the check still PASSes, and can that reach `ATTEST57_HELD`?
Method: static audit of all ten arms + six scratch mutations committed on a clone
under `.ufo/waves/round-57/build/CriticStaticVerdict/scratch/` (lane read-only;
no production bytes touched). Baseline re-run at R1
`f0dc6d1160e66af65355bd353665adac22bbf4a9`: `ATTEST57_HELD held=10/10` exit 0
(`build/CriticStaticVerdict/baseline-r1.txt`).

## Answer to the named example (B7)

"B7 counts items but the gate could still be absent" — **half right**. B7 is a
pure-prose arm (regex on SKILL.md text); mutD (`66d45d63`, gate file deleted,
every SKILL.md row and all 27 checklist items intact) shows **B7 PASS while the
gate is absent**. But the verdict does not trust B7: six computed arms MISSed
the same tree → `UNMET held=3/10` (B1 gate absent, B2/B3/B4 no executable gate,
B5 `readme-map-pin` blob-mismatch, B6/B10). So no prose arm can *manufacture*
HELD alone — the conjuncts sit between prose and the predicate. That half of the
hypothesis is refuted.

The other half lands, harder, elsewhere: three arms assert contracts they never
compute, and the pin trust-root is circular. Five mutations returned
`ATTEST57_HELD held=10/10` on trees that violate a stated contract.

## Finding 1 — B5 "WITHOUT REGRESSION" is unfalsifiable (counterexample, demonstrated)

Docblock: the round-56 pins "equal the round-56 plan §Counters pins **by name,
path and sha256**". Code (`probe:269-303`): the `need` loop checks name presence
+ `sha(blob)==entry.sha256` — **path is never compared for `need` names, and no
frozen sha256 literal exists anywhere in the probe**. `counter-pins.mjs` itself
verifies only `digest == registry entry` (scripts/counter-pins.mjs:161-165) —
the registry is the oracle for its own correctness. Git history is the only
anchor for a frozen pin, and the probe scores exactly one tree.

- mutA2 `e2aacd3c`: `source-capture.mjs` bytes regressed, registry + SCORECARD
  pins updated consistently → **HELD 10/10**. The pin silently binds different
  bytes than freeze; nothing computes that.
- mutA3 `d47367a4`: `.ufo/waves/round-56/probe/attest56-probe.mjs` replaced by a
  stub unconditionally printing `ATTEST56_HELD held=10/10` (output verified) +
  re-pin → **HELD 10/10**. Under the H5 prior-counter re-run convention the
  judged rev's *committed* counter bytes are executed — a forged counter is
  carried inside a HELD verdict. False provenance, not a nitpick.
- Note the asymmetry that makes this reachable: `readme-map` is immune to this
  class because B3/B4 mutate it and observe drift; `attest56-probe`,
  `source-capture`, `receipt-attest`, etc. are executed-only or never-executed
  file pins with no behavioral arms — re-pinning is their entire defense, and it
  is self-referential. B6's `pin.readme-map` conjunct compares SCORECARD *prose*
  to bytes — correct, but prose-vs-bytes consistency is not freeze-anchoring.

Impacted axes: **operability** (a verdict carried by a forged prior counter) and
**coverage** (the claimed regression property has zero computed surface).

Smallest safe correction: embed the frozen sha256 literals for carry-over pins
(`attest56-probe`, `doctrine56-probe`, `source-dupes` + the r53–r55 set named in
the plan stanza) in the probe, and compare `name,path,sha256` triples — a
one-line literal map; the self-pin (`attest57-probe`) is unanchorable from
inside and already defended by execution (the frozen probe is what runs).
Fixable defect; the canonical judge should not accept "WITHOUT REGRESSION" as
satisfied-by-construction.

## Finding 2 — section claims are unscoped prose (three sites, same defect class)

Each of these docblock sentences scopes a check to a named section; the code
greps/counts the whole file:

- **B9 lesson**: "names R56-V1, R56-V2 AND R56-V3 **in its `## Mistakes` section**"
  → `lesOk` is three regexes over the entire file (probe:365-385). mutB
  `fd4b38eb` renamed `## Mistakes` → **HELD 10/10** with no Mistakes section at
  all. The routed-defect *binding* claimed by the plan is not what is computed.
- **B9 LOG**: "carries a **round-57 entry** naming R56-V2 AND R56-V3" → whole-file
  grep; strings in a round-25 entry would satisfy it (at R1 no earlier `R56-V`
  strings exist, so the check is currently honest — the scope, not today's data,
  is the defect).
- **B7**: "the `## Verifiable checklist` carries exactly 27 items" →
  `itemLines` filters `^\s*- \[` over the whole file (probe:317-332). mutE
  `499a5194` renamed the heading → **HELD 10/10**. A stray `- [ ]` in any other
  section also counts toward the 27 (false-UNMET risk today, false-PASS risk if
  a member row ever gains one).

Impacted axes: **coverage** primarily — the R56-V2 amendment's binding strength
is overstated by the docblock.

Smallest safe correction: slice each file to its named section
(`^## Mistakes` → next `^## `; `## Verifiable checklist` → next `^## `; LOG's
round-57 stanza) before matching. Mechanical, no contract change.

## Finding 3 — B8's doctored control is never invoked

Plan §Receipt plan: "verify must read REPLAY/TAMPERED, **never VALID**; it is
excluded from the B8 evidence set by name." The probe (probe:333-363) iterates
exactly `attest-run-{1,2,3}.txt`; exclusion is implemented only by *not reading*
the control — its required non-VALID verdict is asserted nowhere. mutC2
`ebaa1e1e` committed a freshly minted **VALID** receipt under the control's name
(verified `RECEIPT: VALID` exit 0 over the ledger) → **HELD 10/10**. A tree
where the negative control is actually positive evidence is indistinguishable.
Fixable: one `verify` call on the named control asserting `vline !== 'VALID'`.

## Corroborated (no defect)

- K2/K3 structure holds: no arm parses a score from text; B1 requires exit 0 +
  `PASS (n/n)` + ≥12 `case *: PASS` lines, and B3/B4/B10 exercise the gate on
  real mutated bytes (mutD confirms `held=3/10`, never forged HELD).
- Vacuous-HELD guard present in judged bytes; `checks=10` literal blocks the
  drop-one class; B5c's transcript regex is a conjunct, not a witness.
- `receipt-attest` is itself a pinned blob (`receipt-attest` entry +
  `pin.receipt-attest`), so B8's verifier can't be swapped without hitting
  Finding 1's chain — which is precisely why Finding 1 matters.
- B10 recomputes the bimap independently and demands three-way equality
  (files = rows = covered); B10 MISSed mutD only via `gateExit` — the strictest
  arm.

## Summary

- Strongest counterexample: **mutA3** — a forged prior-round counter riding
  inside `ATTEST57_HELD`. Fixable defect (frozen pin literals), not a tradeoff
  the Rust judge must carry.
- Fixable defects: B5 unanchored pins (op+cov); B9/B7 unscoped sections (cov);
  B8 unexercised control (cov).
- Refuted: prose-only HELD via B7 — conjuncts hold (mutD).
- Evidence: `build/CriticStaticVerdict/` — `baseline-r1.txt`, `mutA`/`mutA2`/
  `mutA3`/`mutB`/`mutC2`/`mutD`/`mutE` `-result.txt`, `mutations-index.txt`,
  `scratch/` clone.
- Installs: none (directive checked; pacman paused, nothing needed).
