# Round 72 plan — kumitate (L1-only, no wave; frozen before any work commit)

Base `a615abcc441fe0cd9e49b99b6621dededf5ac330` (the round-71 verifier spot-check commit).
This host has no AgentSwarm dispatch surface (L0-noted round 70; souji r46 question covers
the same surface) — L1-only round, disclosed. No L2 subagents are dispatched; nothing is
assumed answered.

## Carry-in (round-71 verifier spot-check notes N1–N5; maintenance, not claims)

- N1 — LOG round-71 entry's gates line cites `README_MAP files=171` / `CITE_SOURCES cited=206`;
  the committed close receipt `.ufo/waves/round-71/close/gates.txt` reads 172 / 207 (the lesson
  + README row landed in the same close commit and moved both). LOG is append-only: corrected
  next round with an appended note. Authority: that receipt. → executed this round in the LOG
  round-72 entry and the round-71 lesson errata.
- N2 — the round-71 lesson annotates the S220 quote "(17 words)"; the quote is 16 words
  ("The exit code of the subprocess, or null if the subprocess terminated due to a signal" —
  counted: The/exit/code/of/the/subprocess/or/null/if/the/subprocess/terminated/due/to/a/signal).
  The ≤25-word bound holds either way. → erratum, appended to the round-71 lesson.
- N3 — the round-71 report's aside "A grows by the one new counter file" is loose: `A` counts
  runnable-extension files; the new counter is a `.ufo/waves` artifact, not a `scripts/`
  executable, so `A` stays 10 (SCORECARD round-45 note defines the frozen pattern). The
  unchanged SCORECARD cell is the authority. Filed reports are not lane-rewritable → precision
  note appended to the round-71 lesson and recorded in the LOG round-72 entry.
- N4 — "tool untouched" overstates: `scripts/control-replay.mjs` WAS byte-changed in round 71
  by the measured budget recalibration (900000 → 1200000 ms, 13 lines) and re-pinned in the
  same commit (`f4f67ec5`, r70 precedent `89cbd998`). Accurate wording: the controls, the v1/v2
  counter bytes and the five frozen receipts are untouched and hash-checked (not in the diff
  range); the tool is pin-checked against its re-pinned sha. The v3 counter header line
  "scripts/control-replay.mjs is likewise untouched (pin-checked)" carries the same erratum;
  its bytes are frozen scored history at pin `75094e4a…` and are NOT amended (reject recorded
  in the round-72 lesson `## Gate`; flip: a versioned v4 successor if a counter-side change is
  ever routed). → wording corrected in the round-71 lesson errata + LOG.
- N5 — the v2 red re-execution limit disclosure (EPERM at V09 from the stale 900000 ms budget)
  is fine as-is; no action.

## Claim

| claim | axis | instrument |
|---|---|---|
| C1 | operability (9, integer held — terminal under `f_O`) | gate `plan-before-ready` (`scripts/plan-before-ready.sh`), routed from the round-71 lesson's "Host defect routed" item |

**C1 — operability (lowest non-retired axis, 9, terminal), capability deepening of gate
`plan-before-ready`: the Windows-host path-form fix, with a hermetic case and a same-commit
re-pin.** Round 71 routed: "`scripts/plan-before-ready.sh` `--repo` fails on this host with
"--repo is not the repository root": its equality check compares `git rev-parse
--show-toplevel` (Windows form `C:/…`) against `pwd -P` (POSIX form `/c/…`)." Land the fix:
both sides of the root equality (main check and the selftest `fixture` helper) are normalized
through `cd <path> && pwd -P` before comparison, and a hermetic selftest case
(`repo-path-form-toplevel`) passes `--repo` in git's own reported form and must read PASS —
it fails on the base bytes on this host (red receipt) and passes on the fixed bytes. The gate
pin `pin.plan-before-ready` is re-pinned in the same commit as the edit (the row's own rule,
measured `GATE_PIN_DRIFT` at `2ed8a5f8`), and the SKILL `plan-before-ready (map arm)` row's
selftest tally is corrected to the measured count with a dated note (r71 D4 precedent).

Falsifiable before→after, all on this host, receipts committed:

- before (base `a615abc…`, receipts under `open/`):
  - `bash scripts/plan-before-ready.sh --repo <Windows-form lane path> --round 71` →
    `plan-before-ready: --repo is not the repository root (got C:/…)` exit 2;
  - `--repo <POSIX-form lane path>` → same refusal exit 2 (both forms dead: the gate is
    unusable on this host);
  - `bash scripts/plan-before-ready.sh --selftest` → `toplevel mismatch /tmp/pbr-selftest.…/honest`
    exit 2 (the fixture helper carries the same equality);
  - `node scripts/surface-probe.mjs --checklists` → item SKILL.md:744 (plan-before-ready
    map-arm suite) FAIL exit=2; total `CHECKLIST: 7/33 pass`, `VERDICT: FAIL`.
- after (fix commit):
  - the same CLI commands print real `PLAN_BEFORE_READY:` verdict lines with `map=` fields
    (PASS / FAIL / NA covered on real rounds 63, 62, 71 — receipt names them);
  - `--selftest` → `PLAN_BEFORE_READY_SELFTEST: PASS (<n>/<n>)` exit 0, including
    `repo-path-form-toplevel`;
  - checklists item SKILL.md:744 PASS exit=0; total `CHECKLIST: 8/33 pass` (the other 25
    failures are the disclosed host defects: jj-absent, origin-absent pins, win32-node
    crashes — named, not repaired this round).

Sourcing (2b): S221 opened this round — MSYS2 "Filesystem Paths" (https://www.msys2.org/docs/filesystem-paths/,
official project docs, tier A), § Filesystem Paths: "The problem here is that those are in
many cases not compatible" — the POSIX/Windows path-form split the fix normalizes; § Manual
Unix ⟷ Windows Path Conversion names `cygpath` as the converter (this fix uses the shell's
own `cd && pwd -P`, which needs no external tool and is identity on Unix hosts). Capture
pinned in `.ufo/pins/source-captures.json`; `used-by` names this plan and the fixed script.

## Controls / failure discipline

- The red receipts are measured at base BEFORE the fix commit; the fix commit cites them.
  Order: plan → red receipts → fix (+ S221 + capture pin + re-pin + SKILL row) → green
  receipts → close (gates, census, LOG/SCORECARD/lesson).
- A green selftest that passes WITHOUT the normalization would falsify the claim: the red
  selftest receipt shows the base bytes failing at fixture 1 on this host, and
  `repo-path-form-toplevel` fails on the base bytes by construction there (the main check
  refuses git's own reported form).
- No wave, no budgets, no dispatch (host surface absent — disclosed, routed around).

## Carry-in dispositions recorded where they live

LOG round-72 entry (N1 correction + N3/N4 wording); round-71 lesson `## Errata` (N1–N4,
append-only; the original text stays as written); SCORECARD round-72 section (declaration +
verdicts + pin update); PROVINCE round-72 host-correction line (jj absent, kimi-census
win32 crash, dated). kimi-census `process.getuid` win32 crash and proxy FAIL-CLOSED
(`SRC_NOT_A_DIR C:\fast\scratch\hyaku\kumitate-pin\src`) are quoted and dispositioned at
open (Q13), not silently skipped; the kimi-census repair is routed to a later round (same
class as this round's routed fix: versioned, with a hermetic case).
