# CritControlC1SessionIdentity — C1 subcase 8: actual-session identity

Seat: `L1Kumitate62.CritControlC1SessionIdentity` (reviewer, wave w2, round 62). Scope:
scratch only (`/tmp/kumitate-r62/CritControlC1SessionIdentity/`); lane writes limited to
this report.

Attacked artifact: `.ufo/waves/round-61/w1/CritControlC1.md` subcase 8 — **actual-session
identity** (the identity-binding claim under "Duplicate authority / identity", w1:138-148).

Gate under test: `scripts/dispatch-evidence.mjs`, sha256
`765a7aa3ef6b11f18548da4a91f98c42e07b825229135c30010f092cc1af65cc` — matches the pin
(`SCORECARD.md:329 pin.dispatch-evidence=`), i.e. the pinned artifact. Probe:
`.ufo/waves/round-61/probe/dispatch61-probe.mjs` (P61 / DISPATCH61_HELD, 4 checks), sha256
`02028d11b9b05d952df421b030be919e2af1bf77101d302c06a8b0a718c9a89f`; the round-62 probe copy
`.ufo/waves/round-62/probe/dispatch61-probe.mjs` is byte-identical (same sha256).

## Subcase under attack

Round-61 w1's strongest counterexample A4 fabricated session ids (`L1Kumitate61.SeatNN` —
seats that never existed). Subcase 8 asks the sharper question: does using **real, live
session identities** — bytes the dispatcher's own records actually carry — change the
verdict? If the gate bound identity to dispatch, a fabricated evidence set carrying copied
or foreign-wave identities should fail. Two reproductions, both scratch git repos, zero
seats ever run, no real dispatch record in the scratch root:

- **A8a `a8-lifted-identity`** — `launcher-progress.tsv`, `dispatch-actual.json`, and all
  32 `<seat>.md` reports copied **byte-identical** from the lane's committed w1 evidence
  (real seat names, real `agentId`s `L1Kumitate61.<Seat>`). `swarm-registry.json`
  deliberately **not** copied.
- **A8b `a8-live-w2-identity`** — fabricated `launcher-progress.tsv`/`dispatch-actual.json`
  for 32 invented `SeatNN` rows, every row carrying one **actual live session id**:
  `L1Kumitate61.CritControlC1SessionIdentity` (this seat's round-61 predecessor, wave w2,
  wrong wave, one id for all 32 "sessions").

## Verdict: both read DISPATCH61_HELD — identity is bound to nothing

### A8a — byte-identical lift of the real dispatch evidence

Fixture: `/tmp/kumitate-r62/CritControlC1SessionIdentity/a8-lifted-identity`, rev
`c25608a4dbdc69516db8066d1a52bf4625a0877f` (32 reports copied; `swarm-registry.json`
absent).

Identity proof (lifted bytes = real bytes):

```
$ sha256sum <scratch w1>/{launcher-progress.tsv,dispatch-actual.json,CritControlC1.md} \
            <lane w1>/{launcher-progress.tsv,dispatch-actual.json,CritControlC1.md}
1a963546…  launcher-progress.tsv   (scratch)  == 1a963546…  (lane)
3458d712…  dispatch-actual.json    (scratch)  == 3458d712…  (lane)
d71f6aca…  CritControlC1.md        (scratch)  == d71f6aca…  (lane)
```

```
$ node .ufo/waves/round-61/probe/dispatch61-probe.mjs \
    /tmp/kumitate-r62/CritControlC1SessionIdentity/a8-lifted-identity c25608a4dbdc69516db8066d1a52bf4625a0877f
DISPATCH61: DISPATCH61_HELD held=4/4 checks=4 rev=c25608a4dbdc69516db8066d1a52bf4625a0877f rule=P61
 | P1 PASS DISPATCH_EVIDENCE_SELFTEST: PASS (8/8)
 | P2 PASS gate=0 clean=true reports=32
 | P3 PASS | `dispatch-evidence` | read a round's dispatch record | `node scripts/dispatch-evidence.mjs --selftest` -> PASS (8/8) | round 61 |
 | P4 PASS exists
exit=0

$ node scripts/dispatch-evidence.mjs --root /tmp/kumitate-r62/CritControlC1SessionIdentity/a8-lifted-identity --round 61 --wave w1
DISPATCH_EVIDENCE: CLEAN (seats=32 sessions=32 exit0=32 reports=32 dead=0)
exit=0
```

### A8b — one live w2 session id on all 32 fabricated w1 rows

Fixture: `/tmp/kumitate-r62/CritControlC1SessionIdentity/a8-live-w2-identity`, rev
`0d2900ea06497730aeeef7be5ef13d8fd1bfd382`. The id is genuinely live: present in
`.ufo/waves/round-61/w2/swarm-registry.json` as
`CritControlC1SessionIdentity -> L1Kumitate61.CritControlC1SessionIdentity` (verified via
jq). Progress rows, e.g.:

```
Seat01	session=L1Kumitate61.CritControlC1SessionIdentity	exit=0	pid=-	start=-	end=-
Seat02	session=L1Kumitate61.CritControlC1SessionIdentity	exit=0	pid=-	start=-	end=-
Seat03	session=L1Kumitate61.CritControlC1SessionIdentity	exit=0	pid=-	start=-	end=-
```

```
$ node .ufo/waves/round-61/probe/dispatch61-probe.mjs \
    /tmp/kumitate-r62/CritControlC1SessionIdentity/a8-live-w2-identity 0d2900ea06497730aeeef7be5ef13d8fd1bfd382
DISPATCH61: DISPATCH61_HELD held=4/4 checks=4 rev=0d2900ea06497730aeeef7be5ef13d8fd1bfd382 rule=P61
 | P1 PASS DISPATCH_EVIDENCE_SELFTEST: PASS (8/8)
 | P2 PASS gate=0 clean=true reports=32
 | P3 PASS | `dispatch-evidence` | read a round's dispatch record | `node scripts/dispatch-evidence.mjs --selftest` -> PASS (8/8) | round 61 |
 | P4 PASS exists
exit=0

$ node scripts/dispatch-evidence.mjs --root /tmp/kumitate-r62/CritControlC1SessionIdentity/a8-live-w2-identity --round 61 --wave w1
DISPATCH_EVIDENCE: CLEAN (seats=32 sessions=32 exit0=32 reports=32 dead=0)
exit=0
```

## Why: the gate counts ids, it never compares them

`dispatch-evidence.mjs` uses `session`/`agentId` only as presence/absence tokens:

- `if (row.session) sessions += 1;` (line 116) — truthiness of the string, nothing else.
- `if (withSession === 0 && rows.length > 0) → NOT_A_DISPATCH` (line 130) — the only
  session-level guard is all-absent.
- `const noIds = members.every((m) => !m.agentId || m.agentId === 'null')` (line 134) —
  the only member-level guard is all-absent.
- There is **no code anywhere** that compares a progress-row `session` to a registry
  `agentId`, deduplicates ids, checks wave membership, or consults the harness record:
  `swarm-registry` appears **0 times** in both `scripts/dispatch-evidence.mjs` and
  `dispatch61-probe.mjs` (grep-verified).

Consequences: 32 copies of one wrong-wave id = "sessions=32" (A8b). Perfect real ids =
"sessions=32" (A8a). The counter cannot distinguish lift, fabrication, or dispatch.

This sharpens w1's finding "the gate compares no ids across the two [namespaces], so
neither namespace is bound to anything" (w1:146-148): even *correct* identities — the very
bytes a real dispatcher emits — carry zero evidentiary weight, because the record the gate
demands is a document, and documents are portable.

## Does subcase 8 independently falsify P61?

**Yes — with a shared root cause.** The mechanism is the same one A4/A5 exposed (the gate
checks consistency among lane-authored documents, never dispatch provenance), but the
attack is independent in the sense that matters for the fix: A8a defeats any defense
premised on "a forger can't produce real identities." No invention is needed — `cp` of the
committed w1 directory into any git repo with a SCORECARD row and a tip receipt yields
HELD 4/4, exit 0. The cheapest possible attacker is a copier, not an author, and the
gate's own docstring claim — "the launcher progress file the dispatcher wrote seat by
seat" — is exactly what cannot be established from the bytes it reads. A8b additionally
shows identity checks scoped to "does the id exist somewhere live" would still pass a
wrong-wave, non-unique id; only comparing ids *against the harness registry for this wave*
would bind them, and nothing does that.

Residual: this does not add a *new* defect beyond w1's unbound-identity paragraph; it
confirms and quantifies it (verbatim lift accepted; single foreign id accepted). It is an
independent falsifier of P61's evidentiary worth, not an independent code path. The same
conclusion was reached by the round-61 w2 reproduction of this subcase
(`w2/CritControlC1SessionIdentity.md`); this run re-confirms it at the current lane HEAD
(`0cbe0d75e5a08718e2256408329692908c837766`) with fresh fixtures.

## Live-lane state (read-only file facts; no probe executed against the lane)

- Round-61 w1 evidence is now **committed** at HEAD (35 entries in `git ls-tree HEAD -- .ufo/waves/round-61/w1`: launcher-progress.tsv, dispatch-actual.json, swarm-registry.json, 32 `<seat>.md`).
- `close/dispatch61-tip.txt` does **not** exist at HEAD or in the worktree (close/ holds `a2-tip-dispatch61.txt` and nine other files) — P4 would MISS.
- The committed SCORECARD capabilities row for `dispatch-evidence` ends `first working round 60 | 60 |` — no `round 61` substring, so P3 would MISS at this rev.

Scenario: the live lane at HEAD would read P2/CLEAN from the worktree w1 evidence while P3/P4 MISS at the measured rev (the A5 split shape persists).

## Evidence / receipts

- Scratch: `/tmp/kumitate-r62/CritControlC1SessionIdentity/{build_a8.py,a8-lifted-identity/,a8-live-w2-identity/}`
- Committed inputs: `.ufo/waves/round-61/controls/ctl-c1-critic-a4-full-fabrication.txt`
  (HELD by fabrication), `ctl-c1-critic-a5-commit-worktree-split.txt` (HELD at a rev with
  zero-byte reports); real identities from `.ufo/waves/round-61/w1/{launcher-progress.tsv,
  dispatch-actual.json,swarm-registry.json}` and `w2/swarm-registry.json`.
- No tool installs, no subagents, no lane mutation (all lane commands read-only; scratch git
  repos under `/tmp` only; lane writes limited to this report).

**Bottom line: subcase 8 stands and strengthens w1 — P61 is falsified; real session
identity adds no binding because the gate counts id-shaped strings instead of verifying
them against the dispatcher's record.**
