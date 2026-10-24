# SonicFreeze — mechanical freeze audit (round 52, wave 1)

Seat: simplifier (mechanical audit). Date: 2026-10-24. READ-ONLY seat: zero writes outside
this report; no lane tree, jj state, or git index touched. No tool installs performed
(nothing needed; recorded per operator directive 2026-10-19). All git use read-only
(`show`, `ls-files`, `log`, `status`, `merge-base --is-ancestor`).

## (a) sha256 of the three frozen artifacts

```
563d086bf1f59c60bb556501c0676597ec0df551eb03df57caacf1455c336565  .ufo/waves/round-52/plan.md
f6146a2cfd3fba984848c5b91c1d2570108dc751d5edca5939d6f4aee5171428  .ufo/waves/round-52/probe/attest52-probe.mjs
e1aa408337e6546e82610d3781cafd40a4f166f39526059747e8fa3b92537169  .ufo/waves/round-52/probe/doctrine52-probe.mjs
```

## (b) Predicate-sentence byte-identity: plan.md vs probe headers — **NOT byte-identical** (semantic equivalence holds)

The bare frozen sentences (hash of sentence + newline: A52
`124ba53a0549d54832da6256f37ca6709386826a3425e80d06222159c08d2b4d`, D52
`bc36d662519975cd2355b10d231670b1a6bd3dc1136aa41b9fcadd47b26ddf0d`) occur exactly once
each in plan.md (lines 53 / 59, as backtick-quoted code spans; full-line hashes
`042dd42f…` / `07a604c2…` differ only by the markdown backticks).

In the probes the full sentences occur **zero times** (`grep -F`, exact bytes):

| Target (fixed-string) | attest52-probe.mjs | doctrine52-probe.mjs |
|---|---|---|
| full `…_HELD — node … exits 0.` sentence | 0 | 0 |
| `…_HELD — ` em-dash fragment | 0 | 0 |
| quoted expected-output string | 0 | 0 |

Closest header counterparts (paraphrase form):

- attest52-probe.mjs L8 (usage): `` node .ufo/waves/round-52/probe/attest52-probe.mjs <lane> <rev> `` — `<lane>` placeholder, not the concrete lane path; L76: `Predicate ATTEST52_HELD = held=13/13, exit 0.`
- doctrine52-probe.mjs L7 (usage): `<lane> <rev>`; L30: `Predicate DOCTRINE52_HELD = held=5/5, exit 0.`

Semantic consistency check (the strings do agree at runtime): attest52 L473 emits
`` `ATTEST52: ${label} held=${held}/${checks.length} checks=${checks.length} rev=${rev} rule=${RULE} version=${VERSION}` `` — with held=13/13, RULE='A52' (L87), VERSION='v1' (L88) this instantiates exactly to the plan's quoted prefix `ATTEST52: ATTEST52_HELD held=13/13 checks=13 rev=<rev> rule=A52 version=v1`, then continues ` | B1 PASS | …` (per-check transcript suffix the plan sentence does not quote). doctrine52 L131 emits the D52 analogue with **no** version field — matching its plan sentence, which also has none. Exit maps match (`exit(held === checks.length && checks.length > 0 ? 0 : 1)`).

Also observed: plan.md's parenthetical claims byte-identity in "probe header, SCORECARD row
and report"; SCORECARD.md exists but contains **zero** occurrences of
`ATTEST52`/`DOCTRINE52`/`A52`/`D52` at audit time (mid-wave — report rows still landing).

**Verdict:** plan.md and probe headers are semantically consistent (same held counts, exit
map, rule ids, version field only where the sentence has one) but the full frozen sentences
are **not present byte-identically** in either probe header. Paraphrase, not copy.

## (c) Full inventory of `.ufo/waves/round-52/` (point-in-time, audit start)

14 files, 0 symlinks, 7 dirs at snapshot time. Sizes in bytes:

```
    675  base/attest52-base.txt
   2027  base/baseline-gates.txt
    124  base/doctrine52-base.txt
    675  build/ExecProbeSanity/attest52-f539a71e.txt
    124  build/ExecProbeSanity/doctrine52-f539a71e.txt
  35064  build/ScoutRfc3339/rfc3339.txt
  15475  plan.md
  25162  probe/attest52-probe.mjs
   6499  probe/doctrine52-probe.mjs
   2967  w1-assignments.json   ← FLAGGED
  87160  w1-registry.json      ← FLAGGED
  71881  w1-spec.json          ← FLAGGED
 110117  w1-taskcall.json      ← FLAGGED
 202097  w1-validate.json      ← FLAGGED
```

(build/CritFreeze/ exists but was empty at snapshot.)

**Scope violations (mechanical, per the allowed set {plan.md, probe/, base/, w1/<Seat>.md, build/<seat>/}):**
the five root-level `w1-*.json` files. Provenance, for the record: `w1-spec.json`,
`w1-taskcall.json`, `w1-validate.json` are **git-tracked**, committed by the orchestrator
identity in 66766f7 ("v2 wave spec — 64 seats") and ac56743 ("wave validation + taskCall
evidence"); `w1-assignments.json` and `w1-registry.json` are untracked, same family. These
are orchestrator wave-dispatch artifacts, not seat writes — flagged mechanically as
required; whether they belong inside the wave dir is an orchestrator question, not judged
here.

Caveat: the tree is live — `w1/` held 0 seat reports at my first listing and 11
(CritC2, ExecChecklistAudit, ExecClockSweep, ExecHarmBattery, ExecProbeSanity, ScoutCensus,
ScoutCompanion, ScoutRfc3339, ScoutSibling, ScribeQuality, SentScope — all conforming
`<Seat>.md`) minutes later. All `build/<seat>/` contents conform. `base/baseline-gates.txt`
is inside `base/` (allowed), a third file beyond the two named receipts, part of the freeze
commit.

## (d) Freeze commit f539a71e content — **exactly the freeze set, nothing else**

`f539a71e236a4d66810851c1f2fb6e1abe61ec19` (2026-10-24, "round-52: freeze — plan (2
claims, v2 wave of 64), counters A52/D52 v1, executed base receipts (Q43)") — 6 files,
854 insertions, 0 deletions, all status `A`:

```
A  .ufo/waves/round-52/base/attest52-base.txt
A  .ufo/waves/round-52/base/baseline-gates.txt
A  .ufo/waves/round-52/base/doctrine52-base.txt
A  .ufo/waves/round-52/plan.md
A  .ufo/waves/round-52/probe/attest52-probe.mjs
A  .ufo/waves/round-52/probe/doctrine52-probe.mjs
```

= {plan.md, probe/attest52-probe.mjs, probe/doctrine52-probe.mjs, base/ (3 files)} exactly;
no other paths. The commit **is an ancestor of HEAD** (ac56743). Blob-vs-worktree integrity:
all 6 frozen blobs hash **MATCH** to current working-tree bytes (the three (a) hashes plus
base receipts `57355f3d…`, `4c7f1363…`, `09f55e2a…`) — zero post-freeze drift in the frozen
set. Untracked additions since freeze are seat outputs only (build/, w1/) plus the
flagged w1-assignments/registry pair.

## Findings summary

- **F1 (b):** Frozen predicate sentences absent byte-identically from both probe headers;
  headers paraphrase ("Predicate X_HELD = held=n/n, exit 0."), runtime emission
  instantiates the quoted string. No action taken (audit-only).
- **F2 (c):** Five root-level `w1-*.json` files outside the seat-allowed set (3 tracked at
  66766f7/ac56743, 2 untracked) — orchestrator dispatch artifacts, flagged.
- **F3:** SCORECARD.md carries no A52/D52 row yet; plan's byte-identity triple
  (header/SCORECARD/report) currently holds in zero of three locations for the *sentence*.
- **F4 (d):** Freeze commit clean and undrifted; Q43 pairing (frozen AND executed) holds —
  base/attest52-base.txt (1 line) and base/doctrine52-base.txt (1 line) committed alongside.

No deletions made or proposed: audit-only seat; next-harmful deletion would be any freeze
artifact itself.
