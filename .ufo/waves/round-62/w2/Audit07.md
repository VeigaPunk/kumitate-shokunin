# Audit07 — Schema-ReportPath: reports path and report-name mapping

Seat: `L1Kumitate62.Audit07` (reviewer, wave 2, round 62).
Lane: `/home/vgpnk/Projects/shokunin/kumitate-shokunin`.
Scope: inherited round-61 predicate C1 (`DISPATCH61_HELD`, P1/P2) only — the
dispatch gate `scripts/dispatch-evidence.mjs` and its report counting. Read-only;
no lane edits; all repros hermetic under `/tmp/audit07-r62*`.

## Question

Can a malformed report — absent, wrong-dir, traversal, or mismatched stem — be
**credited** by the dispatch gate? The gate is the artifact that prints the
`DISPATCH_EVIDENCE: CLEAN (… reports=32 …)` line P2 demands, and it is what the
round-61 capability row and tip receipt (P3/P4) point at.

## How the gate maps report names to paths (evidence)

`dispatch-evidence.mjs`:

- `parseProgress` (lines 50–70) splits `launcher-progress.tsv` on `\t`, takes
  `parts[0]` as the seat name, and performs **no name validation** (no charset,
  no `..`/`/` rejection, no duplicate check).
- Per row (lines 113–127):
  ```js
  const reportPath = join(waveDir, `${row.name}.md`);
  try { hasReport = statSync(reportPath).size > 0; } catch { hasReport = false; }
  if (hasReport) reports += 1;
  ```
  `statSync` follows symlinks and reports a directory as `size > 0`
  (directories have non-zero size on this FS). `join` resolves `..` segments, so
  a seat name carrying `../` moves the existence probe outside the wave dir.
  `hasReport` is the only gate on `reports`.
- The seat-name → `<waveDir>/<seat>.md` mapping is therefore not confined to the
  flat wave directory and not constrained to regular files.

`make-dispatch-actual.mjs` uses the same probe for its record (`countReports`,
lines 330–338: `statSync(join(dir, `${row.name}.md`)).size > 0`), though its
input names are first constrained by `NAME_RE = /^[A-Za-z0-9][A-Za-z0-9._-]*$/`
(line 52), which blocks `/` and leading `..` in the files it writes. The gate
itself applies no such filter.

## Repro results (hermetic, gate CLI on the real binary)

Fixture: 3 seats, `exit=0` + session ids for each, matching
`dispatch-actual.json` (`members` array, `planned=3`, `reports=3`). The only
variation is the report artifact named `<seat>.md`. Exit 0 + `CLEAN` = credited.

| # | Artifact | Gate line | Verdict |
|---|----------|-----------|---------|
| A | three regular non-empty files | `CLEAN (seats=3 sessions=3 exit0=3 reports=3 dead=0)` | credited (baseline) |
| B | `ExecAlpha.md` is a **directory** (file removed) | identical `CLEAN`, `reports=3` | **credited** |
| C | `ExecAlpha.md` is a **symlink** to a file outside the wave dir | identical `CLEAN`, `reports=3` | **credited** |
| D | seat name `sub/ExecAlpha`; report at `w1/sub/ExecAlpha.md` (nested) | identical `CLEAN`, `reports=3` | **credited** |
| E | seat name `../../evade`; report at `<root>/…/waves/evade.md` (outside w1) | identical `CLEAN`, `reports=3` | **credited** |
| F | duplicate seat rows `ExecAlpha` ×2 with one file | `CLEAN`, `reports=3` with only 2 report files | **credited twice** |
| G | stem case-mismatch (`execalpha.md` vs `ExecAlpha`) | `DRIFT`, `FINDING REPORT_ABSENT:ExecAlpha`, exit 1 | not credited (fail-closed) |
| H | zero-byte file | `DRIFT`, `FINDING REPORT_ABSENT:ExecAlpha`, exit 1 | not credited (fail-closed) |
| I | stray extra `.md` files (`README.md`, `Zzz.md`) | `CLEAN` reports=3 | no inflation (per-row count) |

Repro harness: `/tmp/audit07_scaffold3.sh`; reported lines above are verbatim
gate stdout. For E, `stat -c '%n %F'` confirms a regular file exists at
`…/round-1/w1/../../evade.md` ⇒ the probe resolved outside the wave dir.

## Findings by severity

### HIGH-1 — A directory named `<seat>.md` is credited as a non-empty report (B)
`statSync` on a directory succeeds with `size > 0`, so the gate counts it as a
report. A phase-2 wave whose seat file path is a directory (e.g. a botched
write or a hostile placement) prints `CLEAN reports=32` with zero report bytes
present. This defeats the very purpose of `reports`: it does not certify report
content, only a path whose `stat` succeeds with non-zero size.

### HIGH-2 — Symlink reports let report content live outside the wave directory/tree (C)
A symlink `ExecAlpha.md → /any/where/victim` is followed and credited. The gate
therefore cannot attest that the report bytes are inside the wave dir, inside
the repo, or even written by the seat. `git ls-tree` on the measured revision
lists a symlink as a blob under the same name (mode 120000), so P2's
file-list check does not exclude this class either.

### HIGH-3 — Seat names with `/` or `../` move the existence probe out of the flat wave dir (D, E)
- D: a seat name containing `/` (`sub/ExecAlpha`) makes a report in a nested
  subdirectory count as present. The wave's "flat `<name>.md` per seat"
  contract is not enforced.
- E: `../../` segments resolve the probe to `.ufo/waves/evade.md` — outside the
  wave dir entirely. A hostile TSV (or any writer with access to the wave dir)
  can satisfy the report check from anywhere relative to the wave dir, and can
  also read an existing unrelated file's size as "present".

Both are unreachable through `make-dispatch-actual.mjs`'s `NAME_RE`, but the
gate is the verifier and reads raw TSV; the gate's own contract does not
restrict names, so the safety rests entirely on a sibling tool.

### MEDIUM-4 — Duplicate seat rows credit one report multiple times (F)
`rows` is not de-duplicated; the same `<seat>.md` is stat-ed once per row, so
`reports` and `seats` both inflate. Two rows naming `ExecAlpha` + one naming
`ExecBeta` → `CLEAN seats=3 reports=3` with two report files. A fabricated
progress file can pad seat/session/report counts without creating artifacts.

### Confirmed fail-closed (no finding) — G, H, I
A genuinely mismatched stem (case mismatch) and a zero-byte file both produce
`REPORT_ABSENT` → `DRIFT`, exit 1. Stray extra `.md` files do not inflate the
count (counting is per progress row, not per directory entry). These axes of
the claim hold.

## Can a malformed report be credited? — Yes

Five concrete classes (B, C, D, E, F) end in the same `CLEAN` line P2 requires,
with `reports=3` (scales to 32) while no genuine 32 regular non-empty report
files exist in the flat wave dir. The gate's `reports` counter is a `stat`
probe, not a report validator. The P61 probe's extra `git ls-tree` file count
catches B, D and E at the *committed revision* level (dirs and nested/escaped
paths are not listed as flat `.md` blobs), but not C (symlink blobs are listed)
and not the crediting semantics of the gate CLI itself; the `dispatch-actual.json`
record and the P4 tip receipt both carry the gate's inflated `reports`.

## Residual risk / verification gaps

- I did not modify the lane; repros run only against the gate binary from
  `/tmp` fixtures (same pattern as round-61 `RevGateSchema`). The B/D/E classes
  were not exercised against the real round-61 `w1` tree (its 32 seat reports
  are present and flat).
- `make-dispatch-actual.mjs` `countReports` shares the identical `statSync(size>0)`
  probe; by code inspection [INFERENCE] it reproduces B and C in the record it
  writes (`NAME_RE` blocks D/E). I did not re-run its selftest.
- Whether a dead seat (exit≠0) with absent report staying silent is intended
  behavior is noted but not mined; it is not an attack path (nothing is
  credited for it).
