# Round 73 plan — kumitate (L1-only, no wave; frozen before any work commit)

Base `651920ccb81f4ce21105cf32ca4c86b1a60f62a3` (the round-72 verifier spot-check commit).
This host has no AgentSwarm dispatch surface (L0-noted round 70; disclosed every round since) —
L1-only round, disclosed. No L2 subagents are dispatched; nothing is assumed answered.

## Carry-in (round-72 closure defects D1–D2, routed to this round; maintenance, not claims)

- **D1 — the "plan Amendment 2" pointers dangle.** The filed r72 report (3 places), the LOG
  round-72 entry and the lesson Mistakes §2 cite a plan "Amendment 2" (the checklist-total
  divergence disclosure); the committed `.ufo/waves/round-72/plan.md` has exactly ONE
  `## Amendment` section — the second amendment text existed only in the uncommitted worktree
  (`git show HEAD:.ufo/waves/round-72/plan.md | grep -c Amendment` → 1 heading, measured at
  open). → Land the Amendment 2 text this round (append-only, below the existing amendment as
  its authoring intended), with the two before-state clauses landed corrected to the committed
  receipt (see D2) and a dated landing note; the dangling-pointer count is then zero by
  construction (the cited section exists at tip).
- **D2 — BEFORE-checklist figures drift from the cited receipt.** Report/LOG/SCORECARD quote
  item SKILL.md:744 before-state `FAIL exit=2 wall=0.851` ("toplevel mismatch") citing
  `open/checklists-BEFORE.txt`; the committed receipt reads `FAIL … exit=null … wall=120.028`
  for that item, and `0.851` appears nowhere in the committed round tree — BOTH the before and
  the after checklist runs were killed by surface-probe's 120 s per-item wall cap
  (`exit=null`, 120.028 → 120.020), total `CHECKLIST: 7/33 pass` on both sides; the fast
  `toplevel mismatch` exit 2 at base is receipted only in `open/pbr72-red-selftest.txt` (the
  direct selftest run). → Errata: round-72 lesson `## Errata` (append-only; original wording
  preserved verbatim there), a dated correction note at the SCORECARD round-72 section's two
  cites, and the correction recorded in the LOG round-73 entry. The filed r72 report is not
  lane-rewritable (r71 N3 precedent) — the correction is recorded lane-side and named in the
  round-73 report.

## Claim

| claim | axis | instrument |
|---|---|---|
| C1 | operability (9, integer held — terminal under `f_O`) | gate `plan-before-ready` **map arm** (`scripts/plan-before-ready.sh`), the round-72 routed host defect (`MAP_UNRUNNABLE reason=ARCHIVE`) |

**C1 — operability (lowest non-retired axis, 9, terminal), capability deepening of gate
`plan-before-ready`'s map arm: disclosed sanitized archive extraction that still fails closed,
with hermetic cases and a same-commit re-pin (sourced on S222).** Round 72 routed: with the
path-form refusal gone, the map arm's first live run on this host fails closed —
`git archive <plan> | tar -x` cannot extract the round-57 SentinelArtifacts attack-fixture
symlinks (16 mode-120000 members in the round-71 plan tree, targets absolute origin-host paths
or parent-escaping; MSYS tar cannot create them here) — so every map-armed round reads
`map=UNRUNNABLE reason=ARCHIVE` on this host (fresh red sweep at base bytes, this round:
rounds 65–71, 7/7 `UNRUNNABLE reason=ARCHIVE`, `open/pbr73-red-sweep.txt`). Land the versioned
repair, scoped exactly as routed:

- Stage 1 stays byte-for-byte the current behavior: `git archive | tar -x`. On success,
  nothing changes (no `sanitized=` term — the verdict grammar only grows in the sanitized arm).
- On stage-1 failure ONLY: a disclosed sanitized second attempt — list the same archive
  (`tar -tvf`), parse the symlink members (mode field starting `l`, path split at ` -> `),
  re-extract excluding exactly those members (`--anchored --exclude=<member>`), and require
  the remaining extraction to exit 0. Fail-closed is preserved: a member not named a symlink
  by the listing can never be dropped (any remaining extraction failure is still
  `map=UNRUNNABLE reason=ARCHIVE`); an archive whose listing shows NO symlink members is never
  sanitized (still `reason=ARCHIVE`); the excluded count is disclosed in the verdict line as
  `sanitized=<n>` on every verdict the sanitized run produces. Sanitization cannot launder a
  red map: an excluded member inside `corpus/` makes the file absent from the extracted tree,
  where the map gate's own row bimap reads it `orphan-row`/`uncovered` DRIFT — the gate still
  judges the plan's corpus, not the fixture links. Parsing limit, disclosed: a member path
  containing a space or a literal ` -> ` defeats the parse and degrades to fail-closed (no
  such member exists in the lane tree today — sweep receipt names the check).
- Hermetic cases (host-independent, fake-tar driven — the suite must stay green on the origin
  Unix host too, where stage 1 succeeds): (i) `map-archive-sanitized` — a plan tree carrying a
  mode-120000 member with an absolute target (planted via `git update-index --cacheinfo`, no
  filesystem symlink), fake tar fails the first extraction then delegates — expect the real
  verdict WITH `sanitized=1`; (ii) `map-archive-sanitized-failclosed` — fake tar fails every
  extraction but lists fine — expect `reason=ARCHIVE` (sanitized extraction that still fails
  is still a red); (iii) `map-archive-nosymlink-failclosed` — fake tar fails once, archive has
  no symlink members — expect `reason=ARCHIVE` (nothing may be sanitized without a symlink
  listing). Suite 39 → 42 cases.
- The fix is shown able to fail before it counts (Q20): the same three cases are inserted into
  the BASE bytes (fix absent) and the suite run receipt is committed — case 37 reads BAD
  (`reason=ARCHIVE` where `sanitized=1` is asserted) while cases 38/39 (fail-closed
  preservation controls) and the original 39 read ok, suite `FAIL (41/42)`; the fixed bytes
  are the only delta in the green run.
- `pin.plan-before-ready` re-pinned in the SAME commit as the script edit (the row's own
  rule); SKILL registry row gains the `sanitized=<n>` vocabulary and the corrected selftest
  tally with a dated note (r71 D4 / r72 precedents).

Falsifiable before→after, all on this host, receipts committed:

- before (base bytes `cb8da6f2…` = pin, receipts under `open/`):
  - `bash scripts/plan-before-ready.sh --repo <lane> --round 65..71` → 7/7
    `FAIL … reason=MAP_UNRUNNABLE … map=UNRUNNABLE reason=ARCHIVE` exit 1
    (`open/pbr73-red-sweep.txt`, measured this round at open);
  - `--selftest` with the three new cases inserted at base bytes → suite `FAIL (41/42)`, the
    BAD line is case `map-archive-sanitized` (`open/pbr73-red-selftest-with-cases.txt`);
- after (fix commit):
  - the same sweep reads real map verdicts for 7/7 rounds — `UNRUNNABLE reason=ARCHIVE` count
    7 → 0, each round's `map=` field names its actual archived-map state
    (`close/pbr73-green-sweep.txt`);
  - `--selftest` → `PLAN_BEFORE_READY_SELFTEST: PASS (42/42)` exit 0 including the three new
    cases (`close/pbr73-green-selftest.txt`);
  - committed blob re-hashes to the re-pinned pin (`close/pbr73-blob-identity.txt`).

Counting commands (paste-ready): `for n in 65 66 67 68 69 70 71; do bash
scripts/plan-before-ready.sh --repo <lane> --round $n; done | grep -c 'map=UNRUNNABLE
reason=ARCHIVE'` → 7 before, 0 after; `bash scripts/plan-before-ready.sh --selftest | tail -1`
→ `PASS (39/39)` shape before (with cases: FAIL 39/42), `PASS (42/42)` after.

Sourcing (2b): S222 opened this round — MSYS2 "Symlinks"
(https://www.msys2.org/docs/symlinks/, official project docs, tier A), § Native Windows
Symlinks: "Without developer mode enabled or administrative privileges you will get: 'You do
not have sufficient privilege to perform this operation.'" (19 words) — why the fixture
symlink members cannot be created here; § Cygwin Symlink Modes names
`MSYS=winsymlinks:nativestrict` (the r70 adapter); § Known Issues: "For the default
winsymlinks:deepcopy mode in MSYS2 the target needs to exist for the symlinking to work" (18
words) — absolute origin-host targets cannot materialize on this host under any mode. Capture
pinned in `.ufo/pins/source-captures.json`; `used-by` names this plan and the fixed script.

## Carry-in dispositions recorded where they live

D1: `.ufo/waves/round-72/plan.md` Amendment 2 landed this round (corrected figures + landing
note); D2: round-72 lesson `## Errata` + SCORECARD dated notes + LOG round-73 entry. The r72
routed kimi-census win32 crash (`process.getuid`, `scripts/kimi-census.mjs:258`) and the
carried proxy-check FAIL-CLOSED stay routed, NOT silently skipped (Q13 open lines receipted in
`gates-open.txt`); scoping note for the next routing: the kimi-census selftest also carries
POSIX-native arms (cap-run/bwrap children, FIFO fixtures, POSIX chmod/mode floors), so its
repair is a portability design, not a one-line guard — recorded in the round-73 lesson.

## Controls / failure discipline

- Order: plan → red receipts (sweep done at open; base-with-cases selftest) → fix (+ S222 +
  capture pin + re-pin + SKILL row) → green receipts → close (gates, census, LOG/SCORECARD/
  lesson, D1/D2 errata).
- The stage-1 byte-identity control: existing selftest cases 1–39 (including case 23's fake
  tar and the map verdict grammar cases) must read unchanged behavior — the suite itself is
  the control; additionally case 23 still asserting `reason=ARCHIVE` pins the fail-closed arm
  end-to-end through the NEW two-stage code.
- No wave, no budgets, no dispatch (host surface absent — disclosed, routed around).
