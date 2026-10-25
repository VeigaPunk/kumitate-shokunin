# ScribeSourcesRows — round 61 w1 — S195 row draft

Milestone: S195 row draft. Axis: coverage. Registry NOT touched.

## Behavior

Candidate row written to
`.ufo/waves/round-61/build/ScribeSourcesRows/row-S195.txt` (1 line, 11 cells):

| # | cell | value |
|---|---|---|
| 1 | id | S195 |
| 2 | source | Worker Versioning — Temporal documentation — https://docs.temporal.io/worker-versioning.md |
| 3 | kind | docs |
| 4 | tier | A |
| 5 | scope | the worker-versioning pinning contract for durable execution |
| 6 | anchor | § Versioning behaviors → § Pinned Workflows, the guarantee sentence (body.md:39); raw markdown read 2026-10-25, HTTP 200, 9645 bytes, sha256 8ef2ee5f5e196d9d14fc8c85449442764e812f3e4f0f6e2bb1bdc12895f0f8fc |
| 7 | teaches | A **Pinned** Workflow is guaranteed to complete on a single Worker Deployment Version. |
| 8 | status | mined |
| 9 | opened | 2026-10-25 |
| 10 | recheck | 90d |
| 11 | used-by | corpus/knowledge/temporal-worker-versioning-pinning.md |

Provenance: every value in cells 2, 6, 7 comes from
`build/ScoutSourceWorkerVersioning/findings.md` (URL, access date, HTTP 200,
9645 bytes, sha256, quote location body.md:37 heading / :39 sentence) and was
re-checked against `build/ScoutSourceWorkerVersioning/body.md` by this seat.
The URL is the fetched `.md` URL, so the pin describes those exact bytes.
The teaches cell keeps the source's `**Pinned**` markup so the quote is a
byte-exact contiguous substring of the capture (13 words ≤ 25).

## Gates (exercised)

- `awk -F'|' '{print NF}' row-S195.txt` → `13`; `wc -l` → 1.
- `grep -c '\\|' row-S195.txt` → `0` (no escaped pipe); the 11 trimmed cells
  print as listed above (no literal `|` inside a cell).
- `grep -cF -- "<teaches>" body.md` → `1` (contiguous, single match).
- `sha256sum body.md` → `8ef2ee5f5e196d9d14fc8c85449442764e812f3e4f0f6e2bb1bdc12895f0f8fc`
  == the row's `sha256 …` pin (also matches findings.md).
- `scripts/sources-census.sh validate` on a scratch lane
  (`/tmp/kumitate-r61/ScribeSourcesRows/root/kumitate-shokunin`, a copy of `corpus/`
  only, with the row inserted after line 146 = last Registry row):
  - entry file absent (lane state now) → extra line
    `kumitate-shokunin	E11	S195 missing used-by corpus/knowledge/temporal-worker-versioning-pinning.md`
  - scratch placeholder entry present → no S195 line (no E01–E10/E12, no W04
    — the URL is new to the registry). The remaining E11 lines (S038…S099) are
    scratch artifacts: `scripts/` and `SKILL.md` were not copied. The real lane
    baseline `validate --root /home/vgpnk/Projects/shokunin kumitate` reads
    `kumitate	ok …` exit 0.
  - `census` → `rows 134`, `tier.A 111`, `tier.B 15`, `tier.C 8`,
    `status.mined 102` (plan base: 133 rows, A=110 B=15 C=8).
- E5 consequence: the row is admit-ready only in the same change that lands
  `corpus/knowledge/temporal-worker-versioning-pinning.md`; appending it before
  the entry exists makes `validate` emit E11 and exit 1.

## Parent correction (2026-10-25 09:45Z) — proceed with S195 draft

Parent (L1Kumitate61): "Correction: I misread the grep; existing lane registry
ends S194 and staged package starts S195, collision count 0 per
ScoutCollisionGuard. Please proceed with a S195 draft only, do not append registry."

Status: the S195 draft stands as delivered, unchanged
(`row-S195.txt`, file sha256 `cf37b133c39ba8d8b0fd591c27b0e7e05b43be0f1c54602ebb7db8b416d02660`,
NF=13). `corpus/SOURCES.md` is untouched (`git diff` empty).

Residual caveat, kept for main (measured, not a refusal): ScoutCollisionGuard's
`collisions=0` compares the lane registry (S001–S194) against the staged package
(S195–S349). That is true today, before this row exists. Once this S195 lands in the lane,
the same comparison has one hit: lane S195 (Temporal) vs staged S195 (MCP,
`SOURCES.append.md:7`). The staged package also carries this Temporal source as
S217 (`SOURCES.append.md:29`). Whichever append goes second needs a re-key or a
de-dup. The section below records those measurements.

## ID collision measurements (written under the 09:43Z directive, since corrected)

Parent (L1Kumitate61): "Do not edit SOURCES.md. S195 already exists in lane
registry (MCP row); report collision and preserve your draft only."
Action taken: draft preserved unchanged at `build/ScribeSourcesRows/row-S195.txt`
(sha256 of `body.md` pin still matches); `corpus/SOURCES.md` was never edited.

Where S195 actually lives, as measured at 09:43Z:
- `corpus/SOURCES.md` in the lane: **no S195 row**, in either the working copy or
  `HEAD` (last registry commit `165b830`); no git ref carries one. The highest
  live id is S194 (line 146). The lane's MCP Architecture row is **S125** (line 137).
- The collision is in the **staged merge package**:
  `/home/vgpnk/Projects/shokuknow/merge/kumitate/SOURCES.append.md:7` holds
  `| S195 | MCP Architecture overview — https://modelcontextprotocol.io/docs/2026-07-28/learn/architecture | docs | A | …`.
  `MERGE-REPORT.md:9` says the package was re-keyed so its "first staged id is
  **S195**", and `MERGE-REPORT.md:96` maps it as `S195 ← S125` (same URL as lane S125).
  The staged ids are S195–S349, contiguous (`build/ScoutCollisionGuard/guard-proof.md:17,38,62,74`).
- So S195 is reserved by the package re-key. Once that append lands, this draft
  duplicates an id (census E03). It also cannot be the Temporal row's id without
  re-keying the package.

The same source is already staged under a different id:
- `SOURCES.append.md:29` = **S217**, `Temporal — Worker Versioning — https://docs.temporal.io/worker-versioning.md`,
  docs/A, mined, opened 2026-10-23, used-by `corpus/knowledge/temporal-worker-versioning-pinning.md`.
- The staged entry `merge/kumitate/knowledge/corpus/knowledge/temporal-worker-versioning-pinning.md:2`
  cites `source: S217`, not S195.
- Staged S217 is malformed under this seat's rule: `awk -F'|'` gives **NF=14**,
  because the recheck cell holds an escaped pipe inside a backticked command
  (`90d — \`curl … \| grep -c 'Pinned'\` -> 14`). As staged, census validate would
  emit E01 for it.

Consequence for C2 (decision for main, not taken here): the frozen plan, the
probe (`/S195/` in E2/E3/E4) and this draft all name S195. The merge package
names the same Temporal source S217 and uses S195 for MCP. These options are
mutually exclusive: (a) keep S195 for Temporal and re-key the package's MCP row;
(b) adopt the package's S217, with a re-grounded 11-cell row (this draft's cells
2–11 can be reused unchanged), which then fails the frozen `S195` predicate as
declared; (c) any other id, which also fails the frozen predicate.
Cells 2–11 of the draft do not depend on the id.

## Findings

F1 — the frozen probe cannot pass E3 or E4 for any well-formed row (blocks C2 as written).
`.ufo/waves/round-61/probe/doctrine61-probe.mjs` (committed in `48877b4`
"round-61: freeze claims, counters, controls and validated wave plan"):
- lines 17 and 21 locate the row with `/^\|[[:space:]]*S195[[:space:]]*\|/`.
  JavaScript has no POSIX classes; `[[:space:]]` is the class `{[ : s p a c e}`
  followed by `]*`, so it never matches `| S195 |`. A verbatim replay
  (`/tmp/kumitate-r61/ScribeSourcesRows/probe-replay.mjs`, node v24.21.0) on the
  scratch registry printed `probe-regex: E3 row-absent; E4 pin=''`.
- line 17 E3 reads `c[9]`/`c[10]`/`c[12]` after `split('|')`. For an 11-cell row
  (NF=13) status/opened/used-by are `c[8]`/`c[9]`/`c[11]`; `c[12]` is the empty
  trailing field. Replay with a whitespace-matching regex printed
  `E3 as-coded status=c[9]=2026-10-25 opened=c[10]=90d used-by=c[12]="" -> false`
  and at contract indices `status=c[8]=mined opened=c[9]=2026-10-25 used-by=c[11]=corpus/knowledge/temporal-worker-versioning-pinning.md`.
- With the whitespace-matching regex, E4 on this row printed
  `E4 pin=sha256 8ef2ee5f5e196d9d1 sha=8ef2ee5f5e196d9d -> true`.
- So a correct row (this one) MISSes E3 and E4 under the frozen counter, and a
  12-cell row shaped to satisfy E3 would fail census E01 (NF≠13) and E5.
  Per the plan's kill rule ("A rule changed after any seat scored is not this
  claim's rule"), this is a judge/main decision; this seat did not edit the probe.

F2 — the C2 control is likely vacuous [INFERENCE].
`controls/ctl-c2-unopened-row.txt` reads `row pin: (none)` / `E4 PASS: false`.
Given F1, the probe returns `pin=''` for every row, so that receipt cannot tell
"fake row has no capture" apart from "row never found". Not re-run; inferred
from the regex replay only.

F4 — E4's capture side is not bound to the measured revision (raised by
ScribeLessonPrep, verified here).
`doctrine61-probe.mjs:20` hashes
`join(lane,'.ufo','waves','round-61','build','ScoutSourceWorkerVersioning','body.md')`
via `readFileSync`, which reads the working tree. Only the row side goes through
`git show <rev>:corpus/SOURCES.md`. At 09:50Z the capture is not in git
(`git ls-files …/ScoutSourceWorkerVersioning/` → empty; `git status` → `??`;
not ignored). Today E4 therefore compares a committed pin against an
uncommitted file. It would still "pass" at a revision that never carried the
capture, as long as the file sits on disk when the probe runs. That contradicts
plan E4's "the opened-source capture exists at … and its sha256 equals the pin".
To make it honest without editing the frozen probe: commit
`build/ScoutSourceWorkerVersioning/body.md` (and `findings.md`) in the same
change as the row, and have the closure also run
`git show <rev>:.ufo/waves/round-61/build/ScoutSourceWorkerVersioning/body.md | sha256sum`
and record it.
The comparison is also only a prefix check: line 21 is
`pin.includes(sha.slice(0,16))`, so 16 of the 64 hex characters are compared.
The closure's `git show` hash must equal the row's full 64-character pin
(`8ef2ee5f5e196d9d14fc8c85449442764e812f3e4f0f6e2bb1bdc12895f0f8fc`). The row's
pin already is the full hash.

F3 — scope note carried from the scout (not in the row).
findings.md flags an unresolved gap: by the page's literal retry conditions,
a top-level Pinned run that did not inherit its version gets no inheritance on
retry, and the page does not say which version that retry starts on. The row's
teaches quotes only the pinning guarantee, so it states nothing about that gap.
The entry author should not claim retry behavior for non-inherited Pinned runs.

## Touched surfaces

- written: `.ufo/waves/round-61/build/ScribeSourcesRows/row-S195.txt`
- written: `.ufo/waves/round-61/w1/ScribeSourcesRows.md` (this report)
- scratch: `/tmp/kumitate-r61/ScribeSourcesRows/` (`root/` registry copy, `probe-replay.mjs`)
- read-only git: `git log`/`git status` on the probe path (no mutation).

## Out of scope / not done

- `corpus/SOURCES.md` not appended (per assignment); probe not edited; no entry written.
- The HTTP status and access time are the scout's observations (curl response
  headers in findings.md); this seat did not re-fetch the URL.
- Tool installs/updates: none.
