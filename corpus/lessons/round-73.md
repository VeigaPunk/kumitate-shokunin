# Round 73 — the carry-in record defects corrected (D1/D2), and the routed map-arm ARCHIVE defect landed as a disclosed sanitized extraction

## Gate

Opened this round, capture pinned under `.ufo/waves/round-73/open/captures/`:
- S222 — MSYS2, "Symlinks", https://www.msys2.org/docs/symlinks/, opened 2026-11-02
  (`curl -sL`, 54336 bytes, sha256 `999b69b2…`, pinned in `.ufo/pins/source-captures.json`).
  Located quotes: § Native Windows Symlinks (19 words): "Without developer mode enabled or
  administrative privileges you will get: 'You do not have sufficient privilege to perform
  this operation.'" — why the round-57 fixtures' symlink members cannot be created here; §
  Cygwin Symlink Modes (10 words): "MSYS=winsymlinks:nativestrict can be used to enable
  native Windows symlinks" — the r70 adapter's mode, privilege-gated either way; § Known
  Issues (18 words): "For the default winsymlinks:deepcopy mode in MSYS2 the target needs to
  exist for the symlinking to work" — absolute origin-host targets cannot materialize on
  this host under any mode.

Decisions:
- **Admit** S222 (tier A, official MSYS2 project docs) — criterion Q1–Q5: header facts in
  the row, capture pinned and gate-verified (`SOURCE_CAPTURE: CLEAN captures=54`); it
  grounds exactly one claim (C1's sanitize-instead-of-materialize mechanism); re-opened
  live, quotes verbatim in the captured bytes.
- **Reject** — candidate: also repair the kimi-census win32 crash this round (the other
  routed r72 defect). Criterion missed: scoping honesty — the census selftest carries
  POSIX-native arms (cap-run/bwrap gate children per ROUND 47, FIFO fixtures, POSIX
  chmod/mode floors, forward-slash path assumptions in selftest case asserts), so a
  one-line `process.getuid` guard would make the crash disappear while the suite still
  could not run hermetically here; that is a portability design (versioned, with its own
  hermetic cases), not a same-round fold-on. Disposition: routed onward with the scoping
  note recorded (PROVINCE round-73 line; LOG round-73 entry). **Flip:** a round that
  pre-registers the census portability design (portable uid gate, host-split selftest
  arms, hermetic win32 cases) and lands it as one versioned change.
- **Reject** — candidate: edit the filed round-72 report in place to fix its D1/D2 cites
  (three "Amendment 2" mentions; the `exit=2 wall=0.851` quote). Criterion missed: filed
  reports are not lane-rewritable (r71 N3 precedent, upheld by the r72 verifier). The
  report's `exit=2 wall=0.851` quote is corrected by the lane-side errata and named in the
  round-73 report; its "Amendment 2" cites now resolve because the amendment text landed
  (D1). **Flip:** an operator-owned correction commit in the fleet repo.
- Standing rejects re-opened this round: the round-72 reject (editing the scored v3
  counter header) was re-checked by absence — no scored counter byte was touched this
  round (`git diff 651920c..cf58f1d0 --name-only` outside `.ufo/waves/round-73/` names
  only `.ufo/pins/source-captures.json`, `.ufo/waves/round-72/plan.md` (the D1 landing),
  `SCORECARD.md`, `SKILL.md`, `corpus/SOURCES.md`, `scripts/plan-before-ready.sh`), and
  `.ufo/waves/round-71/probe/replay71-probe.mjs` / `scripts/control-replay.mjs` are not in
  the round range (grep count 0). Standing reject verdicts unchanged.

## Mistakes

- attribution/number-drift (erratum quoting recalled figures) · the round-72 close itself
  committed an erratum whose before-figures (`exit=2 wall=0.851` "toplevel mismatch" for the
  checklist run) were quoted from the round's narrative memory, not from the cited receipt —
  the receipt reads `exit=null … wall=120.028` for that item, and `0.851` appears nowhere in
  the committed round tree; the inverted "failure reason changed" narrative followed from the
  same recall (the non-author closure caught it as D2) · captured-by: CORPUS rule "a quote
  names its location" + Q24's receipt-label discipline (a cited receipt names the bytes it
  measured) — neither was applied to the erratum's own figures · fix: an erratum's every
  figure is greped from its authority receipt at write time, with the line number in the
  erratum (the round-73 errata quote `checklists-BEFORE.txt` line 167); a figure that cannot
  be greped is not written. Landed as the round-72 lesson `## Errata` + SCORECARD dated
  corrections + this LOG entry.

## Routed items (dispositioned this round; none silently skipped)

- **plan-before-ready map arm `MAP_UNRUNNABLE reason=ARCHIVE` (routed r72): LANDED** as C1 —
  disclosed sanitized second extraction (list, exclude exactly the listed symlink members
  `--anchored`, extract the rest, disclose `sanitized=<n>`), fail-closed preserved, three
  hermetic cases, same-commit re-pin. Rounds 65–71: `map=UNRUNNABLE reason=ARCHIVE` 7 → 0.
- **kimi-census win32 crash (routed r72): still routed**, scoping note added (see Gate
  reject 1): the repair is a portability design — portable uid gate, host-split selftest
  arms, POSIX-native fixture substitutes — not a one-line guard.
- **proxy-check FAIL-CLOSED `SRC_NOT_A_DIR` (carried r70): unchanged**, carried disclosure.

## Round-73 verdicts

C1 (operability, lowest non-retired axis 9 — terminal under the frozen `f_O` proxy;
capability deepening of gate `plan-before-ready`'s map arm; sourced on S222) **verifies** on
the gate's own receipts: red at base `651920cc…` — rounds 65–71 sweep 7/7
`FAIL … map=UNRUNNABLE reason=ARCHIVE` (`open/pbr73-red-sweep.txt`), and the suite with the
three new cases at base bytes reads `FAIL (41/42)` with exactly `map-archive-sanitized` BAD
(`open/pbr73-red-selftest-with-cases.txt` — the fix shown able to fail); green at
`cf58f1d0…` (fix commit, `pin.plan-before-ready` re-pinned `cb8da6f2…` → `4d927ce3…` in the
same commit) — the same sweep reads `map=UNRUNNABLE reason=ARCHIVE` count 0 with real
verdicts for all seven rounds (65 PASS 157, 66 PASS 160, 67 FAIL MAP_DRIFT
first=uncovered:lessons/round-66-verifier-spotcheck.md, 68 PASS 163, 69 FAIL MAP_DRIFT
first=uncovered:lessons/round-68-verifier-spotcheck.md, 70 PASS 169, 71 NA NO_MARKER
map=CLEAN 171; `sanitized=16` on every sanitized verdict; `close/pbr73-green-sweep.txt`),
`PLAN_BEFORE_READY_SELFTEST: PASS (42/42)` exit 0 (`close/pbr73-green-selftest.txt`),
committed blob re-hashes to the pin (`close/pbr73-blob-identity.txt`). Operability integer
9 → 9 (terminal; `f_O` terms unchanged — an edited `.sh` adds no runnable file and no
checklist item). No axis harmed: the coverage rows are untouched; the rounds 67/69 MAP_DRIFT
readings are the arm's honest red at those freeze commits (real verdicts replacing a blanket
UNRUNNABLE, not regressions).

admitted_self: the claim verifies; the carry-in D1/D2 corrections are maintenance and
recorded where they live (round-72 plan landing note, round-72 lesson `## Errata`,
SCORECARD dated notes, LOG round-73 entry).

## Round-gate at filing

`node scripts/round-gate.mjs --round 73` at open read `DRIFT (errors=4 warnings=1)` — the
expected pre-close state (REPORT_MISSING, SCORECARD_ROW_MISSING, LOG_ENTRY_MISSING,
COMMIT_MISSING) plus the stale-`## Planned` warning the r72 lesson carried forward; this
round repairs the warning class by pre-registering round 74 in `## Planned` (the repair the
r72 lesson routed to "the next round's declaration"). The four errors are satisfied by this
round's own close artifacts (Move-log row `| 73 |`, gate-required one-line LOG record, the
round-73 commit, and the report filed after this lesson).
