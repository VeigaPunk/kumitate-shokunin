# Audit07 — Schema-ReportPath: the report path and report-name mapping

Assignment: attack the reports path and report-name mapping — absent, wrong-dir, path
traversal, mismatched stem; state whether any malformed report can be credited.

All observations below are reproductions on scratch repos under
`/tmp/kumitate-r61/Audit07/` (lane untouched). The gate under test is
`scripts/dispatch-evidence.mjs` (contract `kumitate-dispatch-evidence-v1`, pinned
`765a7aa3…`), the builder `scripts/make-dispatch-actual.mjs`, the predicate probe
`.ufo/waves/round-61/probe/dispatch61-probe.mjs` (P61 v1).

## 1. Findings (severity order)

### HIGH-1 — Report path is attacker-controlled: TSV seat names are joined into paths with no validation, so traversal and wrong-dir reports are credited

`dispatch-evidence.mjs:118` computes `reportPath = join(waveDir, row.name + '.md')` where
`row.name` is the raw first field of `launcher-progress.tsv`. The gate's `parseProgress`
(`:50-68`) never validates names against the builder's `NAME_RE`
(`make-dispatch-actual.mjs:52`, `^[A-Za-z0-9][A-Za-z0-9._-]*$`); the gate only checks the
wave name and the round. A TSV author controls the name, and with it the report path.

- **Traversal out of the wave dir — credited (scratch `cases/traversal`).** TSV rows
  `A` and `../escape` + files `w1/A.md` and `round-1/escape.md` → gate prints
  `DISPATCH_EVIDENCE: CLEAN (seats=2 sessions=2 exit0=2 reports=2 dead=0)` exit 0. The
  report for seat `../escape` lives **outside** the wave directory
  (`.ufo/waves/round-1/escape.md`) and is still credited. The builder **rejects** the same
  name: `MAKE_DISPATCH_ACTUAL: FAIL-CLOSED reason=INVALID_NAME name="../escape"` exit 2
  (scratch `builder/b1`). So the gate is the permissive side.
- **Wrong-dir (nested) report — credited (scratch `cases/subdir`).** TSV row `sub/B` +
  file `w1/sub/B.md` → CLEAN, reports=2. A seat credited for a report in a subdirectory.
- **`--wave ..` traversal (scratch `cases/waveup`).** `--wave` is checked only against
  `^[A-Za-z0-9._-]+$` (`:280`), so `..` is accepted. `--wave .. --round 1` reads
  `launcher-progress.tsv` / `dispatch-actual.json` from `.ufo/waves/` (one level above the
  round dir) — `DISPATCH_EVIDENCE: CLEAN (seats=1 …)` exit 0. This violates the usage
  contract "`--wave` must be a plain directory name" (the builder's `--wave` regex is
  stricter and rejects `..`).

The builder side is safe where it builds names; the gate reads whatever the TSV claims.
Because the gate is the credited artifact (`DISPATCH61_HELD` P2) and the P61 control
(`controls/ctl-c1-*.txt`) pins the gate's CLEAN line, traversal-typed/malformed reports
**can be credited** — the gate has no name validation at all.

### HIGH-2 — The report "presence" check is a bare `statSync().size > 0`: directories and symlinks count as reports; dangling symlinks EVADE dead-seat findings

`dispatch-evidence.mjs:118-121`: the only predicate is `st.size > 0` (no `isFile()`, no
realpath confinement). Reproductions (scratch cases):

- **Directory masquerading as report — credited (`cases/dirreport`).** `w1/B.md` is an
  empty directory; `statSync` on it succeeds with size > 0 → CLEAN reports=2.
- **Symlink to a file outside the wave — credited (`cases/symlink`).**
  `w1/B.md -> /etc/hostname` → CLEAN reports=2. (Contrast: `wave-census.mjs:155-158,191-194`
  is the strict consumer — it rejects non-canonical paths and requires `isFile()`.)
- **Dangling symlink on a dead seat — the dead seat's report counts as absent yet no
  finding fires (`cases/deadlink`).** Seat B is dead (`exit=null`, `exit=-9`); `w1/B.md`
  is a symlink to a nonexistent target. `statSync` throws ENOENT → caught → `hasReport =
  false` → B is **not** counted, but the gate CLEANs (`seats=2 … reports=1 dead=1`, exit
  0) with **no** `DEAD_SEAT_UNCREDITED` finding, because that finding requires
  `hasReport` to be true. A dead seat can leave a dangling report link and disappear from
  the dead-seat audit.
- Empty reports (0 bytes) and absent reports correctly fail closed: `REPORT_ABSENT:A` +
  `REGISTRY_MISMATCH:reports=…` exit 1 (scratch `absent/*`; confirmed live variant in
  case G). So *empty/absent* cannot be credited; *wrong-kind* (dir/symlink) can.

### MEDIUM-1 — Mismatched stem only fails when the disk file is absent; the mapping itself is name-injective, so the mismatch is between the TSV name and the file stem, not against the registry

- Case mismatch (scratch `cases/stem`): TSV seat `B`, disk file `w1/b.md` → fail-closed
  `REPORT_ABSENT:B` + `REGISTRY_MISMATCH:reports=2observed=1`, exit 1. Good — this is the
  one malformed-shape that fails.
- But the "stem" binding is TSV-name ↔ filename only. The gate never cross-checks TSV
  names against the registry's `members`. Scratch `cases/ghost`: registry `members` =
  `[A, B]`, TSV + disk additionally contain seat `Ghost` → **CLEAN reports=3** exit 0 —
  an unplanned seat absent from the registry is credited (the builder fails-closed on
  unplanned seats; the gate does not).
- **Duplicate TSV rows — credited (`cases/dup`).** Rows `A, A, B`, one file `A.md`:
  reports=3 (the same file counted twice), CLEAN exit 0. The builder dedupes
  (`seen` at `make-dispatch-actual.mjs:192-199`); the gate does not.

### LOW-1 — `reportDir` is a dead field; the gate hard-codes the wave dir

Both `w1-spec.json` and `w2/swarm-registry.json` declare `reportDir` (`.ufo/waves/round-61/w1`),
but the builder only uses it to default `--reports` (RevGateSchema already noted
`--reports ≠ --out` can never be CLEAN, finding 7), and the gate ignores it entirely — it
derives the report directory straight from `--root/--round/--wave`. None of the tools
validate a declared `reportDir` against where reports actually land, which is why the
HIGH-1 wrong-dir shapes are invisible. The field is cosmetic; the actual contract is the
convention `join(waveDir, name + '.md')` with no normalization.

### LOW-2 — The P61 predicate ('DISPATCH61_HELD') counts committed report files by name shape ONLY, not by seat-name binding, and does not check emptiness

`dispatch61-probe.mjs:20` filters committed files by
`/^\.ufo\/waves\/round-61\/w1\/[^/]+\.md$/` — any `.md` directly under `w1` counts, with
**no comparison to seat names and no size/regular-file check**. Reproduced in a scratch
repo:

- Commit 32 files `z1.md…z32.md` (none matching any of the 32 seat names), keep the real
  `a1.md…a32.md` seat reports uncommitted in the working tree → probe prints
  `DISPATCH61_HELD held=4/4 checks=4` exit 0 (P2 `reports=64`; working-tree gate CLEAN,
  committed-rev "reports" = 32 name-shaped files).
- Commit the same `z*.md` as **empty** files → still `DISPATCH61_HELD held=4/4` exit 0.

So a rev satisfies P2 with **zero committed seat reports**: the gate arm checks the
working tree, the rev arm checks name shape only. The real lane's current HEAD is exactly
in this posture — `git ls-tree -r --name-only HEAD -- .ufo/waves/round-61/w1` lists no
report files (0 `.md`; TSV/record not committed either), while the live working-tree gate
prints `CLEAN (… reports=32 …)` and the probe at HEAD reads `P2 MISS reports=0`. The two
arms measure different trees; neither validates that what the rev "counts" is seat reports.

### Note — P1/P3/P4 plumbing

P1 (`--selftest` 8/8) PASSES. P3's row search is on the SCORECARD capabilities segment —
current HEAD: `P3 MISS` (row is the long `dispatch-evidence` line naming "the launcher
progress file…" — it does not contain the literal `round 61`; the plan's claim "first-working
round 61" is formatted as prose, so the regex misses it). P4 needs `close/dispatch61-tip.txt`
at the measured rev — absent at HEAD.

## 2. Residual risk / gaps

- The gate's own selftest is 8/8 (P1) and does cover `report-absent`; it does not cover
  traversal/ghost/dup/symlink/dir shapes — the surviving mutant M2b (RevGateSchema notes
  `size > 0` vs `size >= 0` cannot be distinguished by the suite) is the tip of this.
- Reported stem-vs-TSV parity on the live w1 is exact (all 32 stems match); the live
  hazard is the *uncommitted* w1 tree and the name-blind rev counting, not a stem typo.
- No real round-61 settle/commit exists at HEAD for the gate to be wrong about; the gate
  result itself (CLEAN at the working tree) is consistent with the live record. The
  exploitation surface is the *assertion* chain: any report file of any type/name at the
  convention path is credited by the gate, and the probe's rev arm counts name-shaped
  files that were never written by seats.

## 3. Summary verdict

Malformed reports **can be credited**: (a) traversal-named seats write outside the wave
dir and are credited by the gate (builder fails closed on the same names — asymmetry);
(b) non-regular files (directories, symlinks to outside files) count as reports; (c)
unplanned/ghost seats and duplicate TSV rows are credited by the gate; (d) seat reports
are not required to be committed for `DISPATCH61_HELD` P2 to pass (name-shape counting,
non-empty committed files unverifiable); (e) a dangling report symlink can suppress
`DEAD_SEAT_UNCREDITED`. Only absent/empty/case-mismatched files fail closed
(`REPORT_ABSENT`). The builder-side validation is the only real guard; the gate does not
share it.
