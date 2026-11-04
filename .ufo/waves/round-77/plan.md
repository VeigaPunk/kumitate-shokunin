# kumitate round 77 — frozen plan (L1, 2026-11-04)

Base: lane branch `master` = `a321ed8006083be1086a3b991a78d3b4c26f0be9` (round-76 close
`cf1cdc5a` + the round-76 non-author closure spot-check commit `a321ed80`).
Host: Linux 7.2.11-arch1-1 x86_64 (run-15 restored host), node v24.21.0, installed harness
`omp/18.15.0`; `OMP_AGENT_ROOT` unset.
This file is frozen and committed in the scaffolding commit **before any data seat runs**, with
every open/base receipt and every control receipt it names (Q58, Q64, Q65). Nothing below may be
narrowed after data; a miss is an honest stop.

Claims (2): **C1 coverage:omp** and **C2 operability**. Distinct axes, causally separable: C1
edits `scripts/omp-census.mjs` + `scripts/proxy-check.mjs` + `.ufo/pins/omp-shape.json` + the
`kumitate-gate-pins-v1` block; C2 edits `scripts/spotcheck-adopt.mjs` and the map/pin only through
its own adopt arm. Neither edits the other's instrument. C1 does not require the proxy to read
MATCH (the inherited C2/C2_total drift is C2's repair), and C2 does not touch the O terms.

## C1 — coverage:omp: the plane's score is re-derivable offline from a committed shape receipt

Surface moved: the OMP agent plane `~/.omp/agent`. Round 76 made `coverage_omp` *derived* by
`proxy-check` from the imported census, but the derivation still reads the live root: a closure
cannot re-derive the integer from committed bytes, and the live root moved under this lane's own
feet (open `entries=64` at 02:44, a 68-entry reading minutes earlier, both `findings=0`). After:
the census writes a canonical depth-1 shape receipt (`kumitate-omp-shape-v1`) that is committed
and pinned, and both the census and `proxy-check` judge that receipt offline, with the same six O
terms as the root judge.

Contract (new, `kumitate-omp-shape-v1`):
- Receipt shape: `{"contract":"kumitate-omp-shape-v1","entries":[{"name","kind","mode"}…]}`,
  entries sorted by name, `kind ∈ {file,dir,symlink}`, `mode` the `0o777` bits as an integer.
  No member content, no digest of content, no path, no timestamp — the receipt is the shape.
- `scripts/omp-census.mjs --snapshot FILE [--root DIR]` writes the receipt and prints exactly one
  line `OMP_SNAPSHOT: WROTE entries=<n> sha256=<hex> path=<p>`; exit 0, 2 on an unreadable root,
  64 usage. The write is staged then renamed (never a partial receipt).
- `scripts/omp-census.mjs --shape FILE` judges the receipt with the unchanged rule tables and
  prints `OMP_CENSUS: CLEAN|DRIFT (source=snapshot entries=<n> findings=<n>[ bound=<b>/<d>])`;
  exit 0/1; exit 2 `SHAPE_INVALID` (malformed JSON, wrong contract, missing/extra keys, bad kind,
  empty entries) or `SHAPE_NOT_FOUND` (absent/unreadable). Never CLEAN on an unreadable receipt.
- `scripts/proxy-check.mjs --omp-shape FILE` uses the receipt instead of the live root for the six
  O terms, carries `"source":"snapshot"` in `--json` and `source=snapshot` in the printed line,
  and fails closed `OMP_SHAPE_INVALID` / `OMP_SHAPE_NOT_FOUND`; `--omp-shape` and `--omp-root` are
  mutually exclusive (usage 64). The live path is unchanged when the flag is absent.
- Pin: `pin.omp-shape=<sha256 of .ufo/pins/omp-shape.json>` in the lane-owned
  `kumitate-gate-pins-v1` block (never in the parent-frozen v1 key set), verified by
  `compareGatePins` exactly like the tool pins.

Before at base `a321ed80`:
- `omp-census --snapshot`, `--shape`, `proxy-check --omp-shape` do not exist (usage 64);
  `open/c1-usage-base.txt`; the probe reads `C77_C1: UNMET held=0/10` (`controls/c77-c1-base.txt`).
- `proxy-check --json` has `O_members=64 O_findings=0 O_bound=35 coverage_omp=10` from the live
  root (`open/proxy-open.json`); the census reads `entries=64 findings=0 bound=35/35`
  (`open/census-open.txt`).

Frozen predicate — C1 verifies iff, at the measured commit M, the frozen counter
`node .ufo/waves/round-77/probe/probe77.mjs --set c1 --lane <lane>` prints
`C77_C1: HELD held=10/10`, i.e. all ten checks:
1. `c1.1-snapshot-writer` — `--snapshot` exit 0, one `OMP_SNAPSHOT: WROTE entries=<n> sha256=<hex>` line, `<n>` = the committed receipt's entry count, `<hex>` = the committed receipt's sha256.
2. `c1.2-snapshot-is-open-shape` — the committed receipt's `(name,kind,mode)` set equals the independent shell lstat receipt `open/omp-shape-open.tsv` (find `-printf '%f\t%y\t%m'`), so the receipt is the live shape at open, not a hand-typed list.
3. `c1.3-writer-roundtrip` — a root materialised from the committed receipt re-snapshots to bytes byte-identical to the committed receipt (`sha256` equal).
4. `c1.4-census-shape-clean` — `--shape` prints exactly `OMP_CENSUS: CLEAN (source=snapshot entries=<n> findings=0 bound=35/35)`, exit 0.
5. `c1.5-proxy-shape-terms` — `--omp-shape <receipt> --json` carries `source=snapshot` and the six O terms `C1o=1 C1o_total=1 O_members=<n> O_findings=0 O_bound=35 coverage_omp=10`, no `O_*`/`COVERAGE_OMP_*` finding.
6. `c1.6-offline-equals-root` — those six terms equal the `--omp-root <materialised root> --json` terms.
7. `c1.7-negative-discriminates` — a receipt with one added `zz-stray.txt` entry: `--shape` exit 1 `UNLISTED zz-stray.txt`; `--omp-shape --json` exit 1 `O_findings=1 coverage_omp=9` + `COVERAGE_OMP_DRIFT`.
8. `c1.8-fail-closed` — malformed (no `entries`), absent, and bad-kind receipts: `--shape` exit 2 with `SHAPE_INVALID`/`SHAPE_NOT_FOUND`; `--omp-shape` absent exit 2.
9. `c1.9-selftests` — `omp-census --selftest` exit 0 `VERDICT: PASS (≥53 cases)`; `proxy-check --selftest` exit 0 `PROXY_SELFTEST: n/n pass`, n ≥ 148.
10. `c1.10-no-content-pinned` — the committed receipt has only `name/kind/mode` keys and no content-shaped key; `pin.omp-shape` in the gate-pin block equals the receipt's sha256.

Kill rule: any check false; a constant printer meeting 5 or 6; a receipt accepted after a
content key is added; an offline term that does not follow the receipt (7); the receipt equal to
the open tsv by coincidence of a hand-typed list while `--snapshot` writes something else (1+3
together); `--omp-shape` reading MATCH on a malformed receipt; the gate pin absent or unchecked.

Axis arithmetic (pre-registered): `coverage:omp` before **10** and after **10** (the integer is
terminal at 64/64; the claim is that the *evidence* stops being a live-host term). Movement counted
in: derived-from-committed-bytes 0 → 1 receipt; fail-closed offline arms 0 → 4; pinned shape
receipts 0 → 1. No retired or frozen row changes.

## C2 — operability: adopt is crash-recoverable (spotcheck-adopt v2 journal)

Surface moved: `scripts/spotcheck-adopt.mjs` (the round-76 capability that owns the recurring
non-author spotcheck adoption). Today the two writes are atomic per file but **not** a cross-file
transaction: SIGKILL between the README rename and the pin rename leaves a half-state that only a
later hand run repairs (round-76 C2's stated limit), and r76's live adopt also appended its row at
EOF, after the `## Frontier` prose (r76 lesson mistake `adopt-appends-at-eof`). After: a versioned
adopt journal (`kumitate-spotcheck-adopt-v2`) makes the pair crash-recoverable and places the row
inside the coverage-map table.

Contract (new, `kumitate-spotcheck-adopt-v2`):
- Journal root `.ufo/pins/adopt-journal/`. An adopt writes `<uuid>.tmp/` (manifest + `README.pre` +
  `readme-map.pre`), renames it to `<uuid>/` **before** the first destination write, performs the
  writes, then removes `<uuid>/`. A kill at any point leaves either no journal (before the rename)
  or a complete journal (after it).
- `manifest.json`: `{"contract":"kumitate-adopt-journal-v1","lane":"<abs lane>","target":"corpus/lessons/…","key":"lessons/…","pre":[{"path","file","sha256"}…]}`.
- Recovery runs on every non-selftest invocation (`--adopt`, `--check`, `--predict`) before the
  requested arm: a `<uuid>.tmp` is removed (`RECOVERED - stale`); a `<uuid>/` whose `lane` is not
  this lane is refused (`REFUSED_JOURNAL_FOREIGN`, exit 2, journal and bytes retained); otherwise
  the oracle is consulted — CLEAN for the journaled key → remove the journal, print
  `RECOVERED <target> complete` (bytes untouched); not clean → restore both `*.pre` files
  byte-exact (after checking their sha256 against the manifest), remove the journal, print
  `RECOVERED <target> rolled-back`. Then the requested arm runs normally.
- Row placement: the adopt inserts the map row immediately after the last existing
  ``| `lessons/` `` row (inside the coverage-map table), never at EOF.
- Test seam: `SPOTCHECK_ADOPT_TEST_CRASH=journal|row|pin` kills the child (`SIGKILL`) at the named
  stage. Documented in the header; selftest-only use, no effect when unset.

Before at base `a321ed80`:
- `--check` read `SPOTCHECK_MAP: DRIFT spotchecks=43 uncovered=1
  first=corpus/lessons/round-76-verifier-spotcheck.md` exit 1 (`open/adopt-check-open.txt`) and
  `README_MAP: DRIFT files=184 rows=183 covered=183 bad=2` (`open/readme-map-open.txt`) before the
  scaffolding repair — the inherited r76 closure artifact, the 6th spotcheck-coverage recurrence.
- `grep -c 'adopt-journal'` and `grep -c 'RECOVERED'` in the tool read 0; the probe reads
  `C77_C2: UNMET held=2/11` (`controls/c77-c2-base.txt`). The two passing base checks are the
  trivial negatives — 7 (a tool that never prints `RECOVERED` passes it) and 10 (usage) — so the
  target's discriminating surface is the other nine checks, and the constant-printer control
  (`controls/c2-constant-printer.txt`) reads `held=0/11`, failing both 7 and 10.

Frozen predicate — C2 verifies iff, at M, `node .ufo/waves/round-77/probe/probe77.mjs --set c2
--lane <lane>` prints `C77_C2: HELD held=11/11`, i.e. all eleven checks:
1. `c2.1-journal-surface` — the committed tool names `kumitate-spotcheck-adopt-v2`, `adopt-journal`, `RECOVERED`, the crash seam.
2. `c2.2-crash-journal` — SIGKILL at the journal stage: journal present, no destination byte written; the next `--check` prints one `RECOVERED <target> rolled-back`, removes the journal, restores both files byte-exact.
3. `c2.3-crash-after-row` — SIGKILL after the README rename: half-state `row-only`, journal present; next `--check` rolls back to the pre-adopt pair byte-exact.
4. `c2.4-crash-after-pin` — SIGKILL after the pin rename: both writes applied, journal present; next `--check` prints `RECOVERED <target> complete`, removes the journal, leaves the post-crash bytes unchanged.
5. `c2.5-stale-tmp` — a `<uuid>.tmp` left by a kill during journal creation is removed with `RECOVERED - stale`, bytes unchanged.
6. `c2.6-foreign-journal` — a journal whose manifest names another lane is refused `REFUSED_JOURNAL_FOREIGN` exit 2; bytes and journal retained.
7. `c2.7-no-journal-no-line` — a clean fixture prints no `RECOVERED` line and creates no journal (the constant-printer killer).
8. `c2.8-recovery-idempotent` — after a `complete` recovery, a second `--check` prints no `RECOVERED` and changes no byte.
9. `c2.9-selftest-and-refusals` — `--selftest` exit 0 `SPOTCHECK_ADOPT_SELFTEST: PASS (≥22 cases)` + `VERDICT: PASS`; the three refusal arms still exit 2 with no byte written.
10. `c2.10-usage` — bad `--predict` and an unknown arm exit 64.
11. `c2.11-placement-and-map` — a fixture adopt writes its row **above** the fixture's `## Known gaps` heading (v1 appended at EOF, the r76 `adopt-appends-at-eof` mistake), and the lane reads `README_MAP: CLEAN files=184 rows=184 covered=184` at M.

Kill rule: any check false; a `RECOVERED` line without a journal; a roll-back whose bytes differ
from the pre-images; a crash window that leaves no journal; recovery only on `--adopt`; a journal
outside `.ufo/pins/adopt-journal/`; a foreign journal accepted or destroyed; the row placed after
`## Known gaps`.

Axis arithmetic (pre-registered): operability before **9** and after **9** (`f_O` is terminal at
9); the movement is the capability deepening `spotcheck-adopt` v1 → v2 (crash-recoverable,
placement-correct) and the live repair of the 6th recurrence. No axis row changes.

## Round-76 routed defects carried into this round (not claims)

1. **FREEZE-FIX 6 disposition + absent-diagnostic receipt** — `open/r76-freeze-fix-6-disposition.txt`
   re-derives the base absence (`git cat-file -e ebfcedfa:scripts/spotcheck-adopt.mjs` fails) and
   records the loader diagnostic the r76 report quoted; disposition stated there.
2. **Carried-reject count corrected** — `merge/kumitate/SOURCES.append.md` = **155** S-rows over
   **161** lines; `MERGE-REPORT.json` = **70** entries, unchanged from r75, not "larger".
3. **R75 D4 why-not** — `round-gate --close`'s `UPSTREAM_MISSING` on the jj lane's detached HEAD is
   an operator-owned instrument refusal; the lane cannot repair it, recorded in the round lesson.
4. **`readme-map.json` final newline** — restored `}\n` as a separate routed repair; the v2 writer
   preserves the destination's final-byte state.
5. **6th spotcheck recurrence (r76 routed defect 5) + `readme-map.json` final newline (D4)** —
   repaired in the scaffolding commit as a routed repair, not a claim: the missing
   `lessons/round-76-verifier-spotcheck.md` README row (inside the coverage-map table, above
   `## Known gaps`) and its `.ufo/pins/readme-map.json` entry, with the pin's lost final newline
   restored (`}
`). `README_MAP: CLEAN files=184 rows=184 covered=184` and `SPOTCHECK_MAP: CLEAN
   spotchecks=43 uncovered=0` at freeze, so `plan-before-ready`'s map arm reads GREEN. C2's
   check 11 keeps the placement behaviour mechanical on a fixture (the base tool fails it).

## Controls (pre-data, `controls/`; Q57/Q64)

- `controls/c77-c1-base.txt` — the frozen C1 counter at base: every arm absent → `held=0/10`.
- `controls/c77-c2-base.txt` — the frozen C2 counter at base: no journal surface, no recovery,
  drift at open → `held=2/11` (only the two trivial negatives, 7 and 10, pass).
- `controls/c1-usage-base.txt` — the three offline flags refused by the base tools (usage 64).
- `controls/c2-constant-printer.txt` — a stub that prints `RECOVERED` unconditionally is scored by
  the same counter: check 7 (no journal → no line) and checks 2–4 (byte fidelity) stay FAIL, so the
  target cannot be met by a printer.

## Assimilation (operator item of 2026-10-24)

`merge/kumitate/` re-opened read-only this round: `SOURCES.append.md` **155** rows / **161** lines,
`MERGE-REPORT.json` **70** entries, `accepted=155`, `refused=[]`, `renumbered=0`. Rejected as a
bulk append again: §10 proportionality and CORPUS.md rule 4 (expansion is knowledge, not rows) —
155 rows cannot be re-grounded entry by entry inside a two-claim tooling round; the flip stays a
dedicated assimilation round. `Assimilation: none`.

## considerthese

`considerthese/2026-10-26.md` proposal 6 (a per-round counter series so a rising counter is a
trend, not a one-off) is mined as QUALITY row Q72, and this round's lesson carries the first
`## Counters` table under it. Proposal 5 and the rest stay open.

## Pointer

Frozen bytes: this file + `probe/probe77.mjs` + `open/*` + `controls/*` in the scaffolding commit.
Measured commit M is the lane tip that carries the landed work; the report cites it.

## Amendment 1 — probe fixture and registry name (2026-11-04, before any seat verdict)

Append-only; supersedes nothing in the predicates. Two probe defects found by the L1 while the
wave was in flight, before any seat reported a verdict:

- **A1.1 — check 11's fixture had no `lessons/` row**, so a literal reading of "insert after the
  last existing lessons row" could not be exercised. The fixture now carries
  `corpus/lessons/round-01-verifier-spotcheck.md`, its README row inside the coverage-map table,
  and its `covered` pin entry; the placement arm now reads `fixture row line 11 after ## Known
  gaps line 8` on the base tool (red) and must read before the heading on the final tool.
- **A1.2 — the check's registry name** was `c2.11-live-adoption-and-placement` while the function
  is `c2.11-placement-and-map`; the probe printed `not run`. Fixed; the base reading is unchanged.

No predicate sentence, threshold, target or axis arithmetic changed. Re-scored controls with the
amended probe: C1 `held=0/10`, C2 `held=2/11`, constant printer `held=0/11`; probe sha256 is in
`controls/c77-c1-base.txt`. The seats cloned `4dc470a1`; the final measurement runs the amended
probe, which is committed in the amendment commit that carries this section.

## Amendment 2 — counter v2: the v1 printer attack fired the C1 kill rule (2026-11-04, before any verdict)

The pre-data freeze reviewer (`build/K77ReviewFreeze/report.md`, FREEZE-FIX 2) built a constant
printer that reads no root and no receipt and scored it with the v1 counter: `held=5/10`, passing
`c1.5` and `c1.6`. The v1 kill rule says "a constant printer meeting 5 or 6" kills the claim, so
v1 as written cannot admit C1 even with a real implementation. The attack is committed
(`build/K77ReviewFreeze/printer-c1.txt`). No data seat has scored and no verdict exists; the
lane's precedent (A1 above, and the v2 counters of `control-replay` / `routed-ledger`) is a
versioned successor with the failing bytes preserved.

**v1 bytes are preserved verbatim at `.ufo/waves/round-77/probe/probe77-v1.mjs`** (sha256
`16695655a691ac227c4932b23a5e5b68b8acc1b48b53fce91f75537e67dd0193`). v2 is `probe77.mjs`; the
report names both and the v1 printer receipt stays evidence.

### v2 C1 (12 checks) — same target, discriminating arms added

`c1.1` now requires the exact line including `path=`, hashes the **produced** file, and requires
produced = printed = committed sha256. `c1.6` judges a **trimmed** receipt (the
`last-changelog-version` member dropped; absence is INFO) and requires `O_members` to follow the
receipt instead of a fixed 64. New: `c1.11` widens `agent.db` to 0604 and requires
`MODE agent.db want<=0600 got=0604` plus `O_findings=1 coverage_omp=9`; `c1.12` requires the live
default path to carry no `source` key and no `source=snapshot` line. `c1.8` adds the content-key
receipt (`SHAPE_INVALID`), a malformed `--omp-shape` (`OMP_SHAPE_INVALID`), the absent case by its
distinct token (`OMP_SHAPE_NOT_FOUND`), and `--omp-shape` + `--omp-root` → usage 64. `c1.10` adds
enforcement: a scratch scorecard with a zeroed `pin.omp-shape` must read `GATE_PIN_DRIFT` exit 1.
The check list is exactly the registry in `probe77.mjs`; `C77_C1: HELD held=12/12` is the predicate.

### v2 C2 (13 checks) — same target, exactness and refusal arms added

The three crash arms now require **exactly one** recovery line, byte-equal to
`RECOVERED <target> <state>`, and that the requested arm ran after it (`SPOTCHECK_MAP`). New:
`c2.9` recovers before `--predict` (target line + `SPOTCHECK_PREDICT`); `c2.10` a journal whose
stored `README.pre` does not match the manifest sha256 must read `REFUSED_ORACLE` exit 2 with
destinations and journal untouched. `c2.11` raises the selftest floor to 26 cases. `c2.12`
requires the adopted fixture row to be **adjacent** to the last existing lessons row, the fixture
oracle CLEAN after adoption, and the lane map exactly `files=184 rows=184 covered=184`. `c2.1`
requires the crash seam in the header comment (first 20 lines). `C77_C2: HELD held=13/13` is the
predicate.

### Controls re-scored with v2 (receipts in `controls/`)

- base tree `a321ed80`: C1 `held=1/12` (only `c1.12`, a live-path negative), C2 `held=2/13` (only
  the trivial negatives `c2.7` and `c2.13`).
- C1 constant printer (hand-typed open-TSV receipt + stub): `held=4/12` (ceiling 5/12 on the lane,
  where `c1.2` can pass) — not the target; the kill rule now reads "the 12-check target is not met
  by a constant printer", recorded with the measured score.
- C2 constant printer: `held=0/13`.

### Errata (append-only; the frozen text is not rewritten)

- **A2.1** — the plan's C1 before-state cites `open/c1-usage-base.txt`; the committed receipt is
  `controls/c1-usage-base.txt` (FREEZE-FIX 6). The bytes are the same; the pointer is corrected here.
- **A2.2** — `open/plan-before-ready-freeze.txt` was produced at the freeze but committed after the
  scaffolding commit; it is readiness evidence, not part of the frozen tree, and the report says so.
- **A2.3** — `c2.11`'s name in A1 was `c2.11-placement-and-map`; v2 numbers it `c2.12` and adds
  `c2.9`/`c2.10`. The registry in `probe77.mjs` is the authority; a name absent from it reads
  `not run` (the A1.2 class, now also caught by `c2.11`'s selftest floor? no — by `not run` count).

No predicate sentence, target, axis arithmetic or kill rule *scope* was narrowed; the target
(12/12, 13/13) is unchanged and the counter only gained discriminating arms.
- **A2.4 (after the v2 commit, before any data verdict)** — `c2.12`'s adjacency arm took
  `lessonRows[last]` from a list that included the newly adopted row, so it compared the row with
  itself (`row at 7, last lessons row at 7` on a correctly placed fixture). Fixed to compare against
  the last *prior* lessons row. The integrated clone then reads `C77_C2: HELD held=13/13`; the
  pre-fix integrated reading was 12/13 with only this arm red (`controls/` carries the counter
  receipts). No other check changed.
- **A2.5 (before data)** — `c2.12`'s lane-map arm froze `files=184 rows=184 covered=184`, but the
  round's own two corpus files (the lesson and the knowledge entry) legitimately take the live map
  to 186. The arm now requires a self-consistent `files=N rows=N covered=N` (N from the live tree)
  and the fixture-oracle CLEAN; the freeze number stays in the plan as the *before* reading. This is
  the Q22-class "a count is a state, not a constant" correction, disclosed before any verdict.
