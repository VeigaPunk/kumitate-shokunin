# kumitate round 49 — plan (L1 KumitateR49, frozen before any data seat)

Base `b7b040b5` (round-48 verifier spot-check; round 48 admitted). Frozen counter before any data seat.
Dispatched 16:38 -03 (19:38Z); freeze 18:38 -03; hard stop 18:38 -03 (2h budget). The L1 holds the §3 planner seat
(a bounded planning data-walk rides the `ConnPlanningWalk` connector item).

## Repairs routed from the round-48 closure (`corpus/lessons/round-48-verifier-spotcheck.md:§5`)

- **R49-1 leftovers (5 paths).** `M .ufo/waves/round-48/close/ReRunCounter48-1.md`, `M …/ReRunCounterA.md`,
  `?? …/ReviewIntegration.md`, `?? .ufo/waves/round-48/r48-plan.stderr`, `?? .ufo/waves/round-48/r48-residual-plan.stderr`.
  Resolution rule: a leftover whose bytes are a seat's late post-completion write is committed under this round's entry
  with a naming line in LOG.md; a stderr that is an empty/one-line harness dump is committed as named evidence; nothing
  is silently reverted unless it contradicts a committed receipt.
- **R49-2 registry.** `scripts/counter-rerun.mjs` has `--selftest` and a non-zero exit map but no SKILL.md
  `## Gate registry` row. Add its row (kind: probe — it re-runs a frozen counter and compares receipts; it exits 0 on
  AGREE, 1 on DISAGREE, 2 fail-closed, 64 usage) and the `cap-spawn` helper row (kind: helper, not a gate), plus the
  new `bind-oracle` row if C1 lands.
- **R49-3 LOG wording.** The round-48 LOG bullet says "two mistakes"; `corpus/lessons/round-48.md` mines four.
  Appended LOG correction naming all four.
- **R49-4 timestamp imprecision.** The round-48 report reads re-runs "18:52Z/18:59Z/19:00Z"; the committed
  `ReRunCounter48-1` receipt starts 19:01:13Z. Appended correction in LOG.md (the filed r48 report is not rewritten).
- **R49-5 leak-delta evidence.** `r48/L1-leakfix-delta.txt` reads `leak-delta-at-ce9aee5d=13` while prose said
  "quiet-host delta 0". This round commits the decomposition: directory count before → after the routed selftest set,
  the attribution of the 13 to concurrent host activity (named by owner/prefix), and the corrected sentence.

## C1 — capability `bind-oracle` (operability; the r48 §Limits (a) bind-view gap)

**Surface.** `scripts/cap-run.mjs` makes a host directory visible inside the sandbox only through `--bind` (S095: mounts
apply in argument order; `--tmpfs /tmp` masks host `/tmp`). Round 48's counter could not see a surgical drop of a
site's `--bind` (`.ufo/waves/round-48/plan.md` §Limits; `r48/L1BindProbe-receipt.txt`), because sites bind per-run
`mkdtemp` paths the counter cannot pre-name. The new instrument reads the *observed* mount set from inside the child:
`/proc/self/mountinfo` lists the process's own mount namespace (S099), so a bound directory appears as a mount point
and a dropped bind cannot be reported as bound.

**Instrument (candidate, after the freeze).** `scripts/bind-oracle.mjs`, contract `kumitate-bind-oracle-v1`:
creates N fresh directories, requests them as binds through `cap-run.mjs`, has its child print the mount points it
observes from `/proc/self/mountinfo`, and compares. One unbound control directory must stay absent.
Verdicts: `BIND_ORACLE: HELD binds=<n> observed=<n> absent=<k>` (exit 0), `MISSING missing=<n>` (1),
`EXTRA extra=<n>` (1), `CONTROL_VISIBLE visible=<n>` (1), `NO_CHILD` (2), `USAGE` (64).
Flags: `--cap-run <path>` (default the sibling `cap-run.mjs`), `--binds <n>` (default 3), `--selftest`.

**Counter (frozen here, before data).** `node .ufo/waves/round-49/probe/bindoracle49-probe.mjs <lane> <rev>` (rule `B49`).
It extracts `rev` with `git archive` into a temp tree and scores six checks on the committed bytes:

| k | check | pass reading |
|---|---|---|
| K1 | instrument present at rev | `git cat-file -e <rev>:scripts/bind-oracle.mjs` exits 0 |
| K2 | `--selftest` at rev | `BIND_ORACLE_SELFTEST: n/m pass` with n=m≥6, `VERDICT: PASS`, exit 0 |
| K3 | live run | `BIND_ORACLE: HELD binds=3 observed=3 absent=1`, exit 0 |
| K4 | mutant runner dropping the requested binds | `BIND_ORACLE: MISSING missing=3`, exit 1 |
| K5 | mutant runner adding `--bind /etc /etc` | `BIND_ORACLE: EXTRA extra=1`, exit 1 |
| K6 | mutant runner without `--tmpfs /tmp` | `BIND_ORACLE: CONTROL_VISIBLE visible=1`, exit 1 |

**Predicate, label `ORACLE_HELD`:** all six checks pass at the scored revision, and the counter prints
`BINDORACLE49: ORACLE_HELD held=6/6 checks=6 rev=<rev> rule=B49 oracle_sha256=<sha256>` exit 0. Any other reading is
`held=<k>/6` exit 1; a counter crash, an unreadable extraction or a malformed child line is exit 2 and is never a score.

**Before → target.** At base `b7b040b5` and at freeze: `held=0/6` (K1 absent; K2–K6 fail closed) exit 1
→ `held=6/6` exit 0 at the C1 commit.

**Kill rule.** C1 verifies iff the L1 score run on the C1 commit and every committed same-commit re-run (≥2, time-spaced)
read `held=6/6` exit 0. Any run reading exit 1 is a miss of C1, reported as measured. The counter, predicate, check list
and target are never amended after the first candidate score; a pre-data control that reads `ORACLE_HELD` forces an
amendment (named `A49`, before data, every control re-scored) or C1 becomes exploratory.

**Pre-data controls (run before the candidate exists, receipts committed).**
- `CtlNothing` — the counter at the base rev: `held=0/6`.
- `CtlForged` — a temp tree holding a static `bind-oracle.mjs` that prints the six verdict strings without launching a
  child; scored with the same counter. Its reading is recorded as the counter's known limit: the counter is an
  output-text oracle over the instrument (precedent: r48 A48 limit (b)), so the forgery class is attacked by wave
  mutation seats and the non-author closure, not by the counter.

**Limits, recorded not hidden (declared before data).** (1) The counter is an output-text oracle: it corroborates the
instrument's printed verdict and its exit, not that `mountinfo` was read; a forged instrument that branches on
`--cap-run` can satisfy it (CtlForged records the class). (2) `EXTRA` compares against a fixed base-mount allowlist
(`/`, `/proc`, `/dev`, `/tmp`, `/run`, `/sys`, the cwd); a host mount outside that list appearing in the child reads as
EXTRA or is missed depending on the allowlist's exactness. (3) The oracle proves the *mechanism* end-to-end; it does
not name which lane site requested which bind — the per-site claim stays with the sites' own children.

**Harm rules (declared before data).**
- H1 (R47-4 continuity): `node scripts/surface-probe.mjs --checklists` from a clone at `b7b040b5` and at the close
  commit, two runs each. An item that passes in both base runs and fails in any tip run is harm.
- H2: the r48 counter set at the close commit reads `held=4/4` under rule `F48+A48` (its base reading), and
  `node scripts/counter-rerun.mjs --selftest` reads PASS; the r47-set at the close commit reads 5/5.
- H3: `node scripts/proxy-check.mjs --strict` MATCH at the close commit (the new pin list re-pinned in the same family).
- H4: the fleet sources census exits 0.

## C2 — coverage (learning): knowledge entry `counter-amendment-discipline` with clause-receipt attestation

**Surface.** The lane holds the F48/A48 counter discipline (freeze before data; a pre-data amendment forced by a
control finding, named, byte-identical in plan and counter header; N≥2 committed receipts with byte-identical success
summaries — Q36) only in round-scoped receipts and SCORECARD prose. The round-48 seat findings that forced A48 live in
one wave directory. This round admits a knowledge entry that states the discipline as reusable clauses, each bound to a
committed receipt by content hash.

**Instrument.** `probe/doctrine49-probe.mjs` (frozen here) reads the entry at a revision with `git show`, and for every
clause line carrying `receipt:<repo-path>@sha256:<64 hex>` verifies the path exists at the same revision and its blob
sha256 matches; for every `S0NN` citation it verifies the row exists in `corpus/SOURCES.md` at that revision with
`status` `mined`. Floor: `clauses>=10`, `rows>=2`.
Output: `DOCTRINE49: HELD clauses=<n>/<n> rows=<m> entry_sha256=<sha256>` exit 0; `UNMET (entry=absent)` / mismatched
hashes → exit 1; unreadable revision → exit 2.

**Before → target.** At the freeze: `DOCTRINE49: UNMET (entry=absent)` exit 1
→ at the C2 commit: `HELD clauses>=10 rows>=2` exit 0.
**Kill rule.** C2 verifies iff the entry is present at the C2 commit and the counter reads HELD there, and a doctored
copy of the entry (one receipt hash changed) reads UNMET — that doctored run is committed as the counter's
shown-able-to-fail receipt. An entry that meets the floor only with clause lines whose receipts are the round's own
prose (not committed receipts) fails.

## Claim admission

Claims are causally separable: C1 lives in `scripts/bind-oracle.mjs` + the counter; C2 in the corpus entry + its
counter. Neither needs the other to have landed. Sourced requirement: C1 rests on S099 (opened this round); C2 cites
S099 and S095/S098 (re-opened this round, old→new logged).

## Round shape

One v2 wave (`r49`, band 64–128, policy `ufo-wave-policy-v2.json`), build and attack together, ≥25% attack roles.
Residual checks after the wave ride one `task` call of ≤8 seats, counted in the round total.
