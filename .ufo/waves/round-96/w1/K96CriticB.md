# K96CriticB — C1 framing, CRLF, and harm review (round 96)

Seat: K96CriticB (critic). Lane base f5873bff; plan freeze 617e80cd8. Candidate READY **absent** at every check,
including after a 550 s bounded watcher (`K96ExecTool/READY` still missing; `draft/READY-absent.txt`); the attack
therefore ran against
(a) BASE bytes, (b) the freshly generated `ctl-positive` (L1 reference rule, `make-controls96.py` re-run into
scratch), and (c) the current draft `K96ExecTool/round-gate.mjs` sha256
`9975be54617a9cb943abc680a35ee04977e2c253d6d852d86324fffc497bdb1c` (120748 B) — draft results are labelled as
draft, not a final-candidate verdict, and must be re-diffed at M.

## Verdict

**Framing: SOUND mechanism, NARROW / weakly-motivated live surface.** The premise is true in the gate itself and
the reference rule mirrors the census byte-for-byte on every clause I could construct; but the harm case the claim
names (`## Leads (unopened)`) is already refused by the lane's own `sources-check.mjs` at the same close. The one
class where *both* lane gates read green while the census refuses is the section-parser divergence (CRLF / lone CR
on the `## Registry` line / an LF-only empty `## ` heading) — and that class is exactly `FIX-B`, so the frozen
counter tests the true uncovered harm even though the prose names the redundant one.

## Counterexample (strongest available)

The claim is stated per row ("a row under `## Leads` declares its pin"), but *declaration is per pin*. Moving one
real row out of the Registry does not stop its pin being declared when an inside row carries the same URL.

- Real registry pin `79fa222e…` (rows S266, S267, S268, S269, S272; file lines 221–224, 227) is the only registry
  pin cited as a backticked token by a filed kumitate report (`round-93/kumitate.md`, bytes equal to the fleet pin
  056a9c48: sha256 `fbdb020d…` both at the pin and in the work tree; 79 filed reports, 11 tokens checked).
- Variant A: move **S266 only** under `## Leads (unopened)` → census E12=1, BASE **still declares** the pin
  (S267/S268/S269/S272 inside), R96 `ctl-positive` `outsideRows=['S266']` and **still declares it**. A single-row
  move produces no citation harm.
- Variant A3: move all five declarers under Leads → census E12=5 (`S266 S267 S268 S269 S272`), `sources-check`
  **DRIFT** (`ROW_OUTSIDE_REGISTRY,ENTRY_SOURCE_UNKNOWN`), BASE round 93 **CLEAN exit 0** declaring the pin, R96
  **DRIFT** declared `[]`, unresolved `['79fa222e','79fa222e8390aed3494f4bc6746814e6c74c21cf']`, outside in file
  order. So the ordinary case is caught — but by `sources-check`, not by round-gate.

## Evidence: BASE vs reference R96 (same bytes, round-93 filed report)

| fixture (copy of real `corpus/SOURCES.md`; pristine = 212 rows, census `ok` E12=0, sources-check CLEAN) | census `validate --file` | `sources-check` | BASE round 93 | R96 `ctl-positive` round 93 |
|---|---|---|---|---|
| pristine | ok E12=0 | CLEAN rows=212 | CLEAN exit 0, declared pin | CLEAN exit 0, outsideRows=[] (same JSON but `durationMs`) |
| A: S266 under Leads | E12=1 `S266` | DRIFT (ROW_OUTSIDE_REGISTRY,ENTRY_SOURCE_UNKNOWN) | CLEAN exit 0, declared pin | CLEAN exit 0, outside `[S266]`, still declares (pin family) |
| A3: S266/S267/S268/S269/S272 under Leads | E12=5 | DRIFT (ROW_OUTSIDE_REGISTRY,ENTRY_SOURCE_UNKNOWN) | **CLEAN exit 0, declared pin** | **DRIFT exit 1**, declared `[]`, unresolved 2, outside 5 |
| B: whole file CRLF (371 CRLF lines) | **E12=212** | **CLEAN rows=212** | **CLEAN exit 0, declared pin** | **DRIFT exit 1**, outside 212, text `SOURCES_ROWS_OUTSIDE outside=212 […]` |
| C: only the `## Registry` line CRLF (1 CR) | **E12=212** | **CLEAN rows=212** | **CLEAN exit 0, declared pin** | **DRIFT exit 1**, outside 212 |
| D: LF-only empty `## ` heading right after `## Registry` | **E12=212** | **CLEAN rows=212** | **CLEAN exit 0, declared pin** | **DRIFT exit 1**, outside 212 |

Answer to the task's question — *can a round be filed with a registry the census refuses while round-gate reads
green?* **Yes, for B/C/D**: both lane checklist gates (`round-gate` at SKILL.md:723–725, `sources-check` at
:730–731) read green while the fleet census calls every row E12. For the claim's named `## Leads` case: `sources-check`
refuses it (A3), so the round-gate-sole-green window only exists between the two checklist items (round-gate runs
first). The census itself is **not** in SKILL.md's close checklist; it is run at round end by the fleet contract
(r72/r73 close messages: `census end exit 0`).

## CRLF finding (item 2)

Mirroring the **census** and not CommonMark is right, and R96 does mirror it exactly:

- census `row_pass` (`/home/vgpnk/Projects/shokunin/scripts/sources-census.sh:609-624`): `^ {0,3}##[ \t]`, strip
  leading 0–3 spaces, `trim(substr(line,3))` where `trim` strips **space/tab only** (`:581`); E12 predicate
  `^\|[ \t]*S[0-9]{3,}[ \t]*\|`; no fence awareness.
- R96 reference: `##[ \t]` first, `#[ \t]` second, `[ \t]`-only trim, rows outside appended. I could not construct a
  line where R96 and the census disagree except the disclosed exotic-whitespace cell (`\s` vs `[ \t]`).
- The divergence is with the *sibling lane gate*, not the census: `sources-check.mjs:191` does
  `sourceText.split(/\r?\n/)`, so it strips CR and sees `## Registry\r` as `Registry`, and its heading regex
  `/^## (.+?)\s*$/` ignores an empty `## ` line. Hence B/C/D: sources-check CLEAN, census E12, BASE green.

Does any real path produce a CRLF registry here? **Not today, and not in this lane's history**:
`core.autocrlf` unset in lane and fleet (rc=1); no `.gitattributes` at any revision (`git log --all -- .gitattributes`
empty); 21/21 lane `corpus/SOURCES.md` have 0 CR; 342/342 kumitate `SOURCES.md` revisions have 0 CR; the Windows-host
rounds (r70 report line 3: "New host: Windows (Git Bash, node 24)") closed with `census end exit 0` (r72 b74d4eb7,
r73 8b4a7d63), i.e. their checkout was LF. The one live incident in the fleet is documented:
`.ufo/l0-questions.md:266` (kagi r30) — "one CR in a `## Registry` heading makes every row E12 for any CRLF lane"
(the lane repaired its bytes and added `.gitattributes`). So FIX-B is a real hazard class with fleet provenance but
no current instance; keeping the census reading (fail-closed, declares nothing) is the safe direction — CommonMark
trimming (`.trim()`/fence awareness/closing-sequence stripping) would declare pins the census refuses, i.e. a false
green, and R96's 20 controls each violate exactly one clause of that.

**Coupling to record (not a defect in R96):** R96 hard-codes a known fleet-side behaviour of `trim`. If the fleet
ever fixes `sources-census.sh` to strip CR (or to implement CommonMark), round-gate becomes the *false red* while the
census accepts. The lesson should name that dependency so the rule is re-opened with the census, not silently kept.

## Harm (item 3, at draft hash, labelled)

Six filed rounds (90–95), JSON diff after dropping `citations.outsideRows`, pristine registry:

| comparison | rounds | non-`durationMs` differences | citations.declared / unresolved / malformedRows |
|---|---|---|---|
| BASE vs `ctl-positive` (R96 reference) | 90 91 92 93 94 95 | **0** (only `/durationMs`) | equal on every round; outsideRows `[]` |
| BASE vs draft `9975be…` | 90 91 92 93 94 95 | **0** (only `/durationMs`) | equal on every round; outsideRows `[]` |

Text mode at n=0: no `SOURCES_ROWS_OUTSIDE` line (0 occurrences on round 95); at n>0 one line (B/C/D receipts).
Draft on B/A3 behaves as R96 (declared `[]`, outside 212/5). No code consumer parses round-gate's `citations`:
`outsideRows|malformedRows` appear only in `round-gate.mjs` (and `sources-check.mjs`'s own E12 text) outside
`.ufo/waves`; `harm-matrix-gates.json:18` runs `round-gate.mjs --selftest` only; SKILL.md documents the JSON keys
but consumes exit code + verdict line; `proxy-check.mjs:542` pins `sha256(scripts/round-gate.mjs)` as
`pin.round-gate` — the K3 re-pin is mandatory and is the only integration coupling. No hidden regression or identity
change found beyond the declared ones (`citations` gains one key; outside rows no longer appear in `malformedRows`,
which R96 states).

## Impacted axes

- operability (the C1 claim axis, terminal `f_O`): the only axis moved.
- coverage rows: no change observed (six-round differential zero; registry untouched). Harm: none observed.

## Smallest safe correction

No code change demanded by this seat. Two documentation-level corrections for the lesson/claim text:
1. Name the **section-parser divergence** (`## Registry\r`, lone CR, LF-only `## ` heading; sources-check normalises
   CR and requires ≥1 heading char) as the uncovered harm; the `## Leads` prose names a case `sources-check` already
   refuses, and the row-move harm is per *pin family*, not per row.
2. Record the census dependency: R96 encodes `sources-census.sh:581`'s space/tab-only `trim`; a future census fix
   must re-open this rule, or round-gate turns into the false red.

## Blockers

- Candidate `READY` never appeared (checked 22:35, 22:39, 22:47, 23:00; bounded watcher 550 s found nothing). Draft
  hash `9975be…` was edited during the seat (earlier `ac92d7f2…`); final bytes at M must be re-diffed on 6 rounds.
  All receipts below are for BASE / regenerated ctl-positive / draft-at-hash.

## Receipts (all under this seat dir; scratch removed)

- `commands.txt`; `framing/` (pristine census+sources-check, A, A3; variant SOURCES copies); `crlf/` (B);
  `headercr/` (C); `emptyheading/` (D); each with the exact command outputs.
- `harm/base-{90..95}.json`, `harm/pos-{90..95}.json`, `harm/draft-{90..95}.json`, `harm/harm-diff-summary.txt`.
- `draft/draft-sha.txt`, `draft/READY-absent.txt`, `draft/draftB-r93.json`, `draft/draftA3-r93.json`.
- `provenance/provenance.txt` (autocrlf, .gitattributes, 21-lane CR survey, 342-revision scan, Windows host quote,
  r72/r73 census-end, kagi r30, checklist order, census `row_pass`, sources-check split/heading, pin rule) and
  `provenance/consumers.txt` (negative consumer search).
