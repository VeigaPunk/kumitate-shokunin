author: kumitate L1
round: 77

# Round 77 — coverage:omp becomes re-derivable offline, and adopt becomes crash-recoverable

Two claims, two axes: C1 `coverage:omp` (the plane's score stops being a live-host term: a
committed, pinned `kumitate-omp-shape-v1` receipt that the census and `proxy-check` judge offline),
and C2 `operability` (capability deepening `spotcheck-adopt` v2: the two-file adoption becomes a
crash-recoverable journal transaction with correct row placement, path canonicalisation and
atomic journal retirement). Frozen plan: `.ufo/waves/round-77/plan.md` (scaffolding `4dc470a1`);
counter amendments A1/A2 before any verdict; both claims measured at the work commit with the
frozen counter (C1 12/12, C2 13/13).

## Gate

Sources opened this round (rows in `corpus/SOURCES.md`; capture pinned in
`.ufo/pins/source-captures.json`; the row's own bytes are the authority — Q71):

- **Admit — S227, SQLite `Atomic Commit In SQLite`, kind `docs`, tier A, status `queued` at
  append and `mined` at the work commit.** Opened 2026-11-04: `curl -sSL` → HTTP 200, 77968 bytes,
  sha256 `5a5be7b6…`, capture `.ufo/waves/round-77/open/captures/sqlite-atomiccommit.html`.
  Located quotes, each ≤25 whitespace words: §4.2 `A hot journal only exists when an earlier
  process was in the middle of committing a transaction when it crashed or lost power.` (23);
  §4.4 `It then proceeds to read the original content of pages out of the rollback journal and
  write that content back` (21); §9.5 `it is essential that the original database file and the hot
  journal remain on disk with their original names until the database file is opened` (24).
  Criterion met: the page is primary for the journal-before-change ordering C2 adopts, and it
  names the limit (§9.5: a renamed journal is invisible to recovery) that the contract answers by
  refusing foreign journals instead of moving them. Used by
  `corpus/knowledge/crash-recoverable-two-file-adoption.md`.
- **Reject — the `merge/kumitate/` assimilation package as a bulk append (carried, re-opened).**
  Re-measured read-only: `SOURCES.append.md` **155** S-rows over **161** lines
  (`grep -cE '^\|…S[0-9]{3,}'` / `wc -l`), `MERGE-REPORT.json` `entries=70`, `accepted=155`,
  `refused=[]`, `renumbered=0` — unchanged from round 75, not "larger" (the round-76 routing error
  D2 is corrected here). Criterion missed: §10 proportionality and CORPUS.md rule 4 (expansion is
  knowledge, not rows) — 155 rows cannot be re-grounded entry by entry inside a two-claim tooling
  round. **Flip:** a dedicated assimilation round that re-opens each entry and admits its rows one
  at a time. `Assimilation: none` this round.
- **Re-open — S226 (the installed-release `dirs.ts` row).** Re-read at the round-77 open; the row
  still grounds the 35 declared census names at `v18.15.0`; no correction needed.
- **Registry change, logged old→new (CORPUS.md rule 2):** S227 `status` `queued` → `mined`;
  `used-by` `—` → `corpus/knowledge/crash-recoverable-two-file-adoption.md`, both at the work
  commit that added the entry. No other row's `status`, `recheck` or `used-by` changed.
- No other candidates were opened into the registry this round.

## Mistakes

- **counter-passes-the-printer** · the v1 C1 counter let a constant printer (no root or receipt
  read) pass `c1.5` and `c1.6`, which the frozen kill rule names explicitly as a kill · evidence:
  `build/K77ReviewFreeze/printer-c1.txt` (`held=5/10`), `build/K77ReviewC1/constant-probe.json`
  (`held=7/10` with a receipt-copy trick) · captured-by: **none** — the predicate was frozen before
  anyone built the cheapest no-work artifact; Q64 exercises the *base* control only · fix:
  counter v2 (A2) makes the offline terms follow independently varied receipts (trimmed 63-entry,
  widened mode), hashes the produced write, and tests pin enforcement; the printer then reads
  4/12 (`controls/c1-constant-printer.txt`), preserved with the v1 bytes (`probe77-v1.mjs`).
- **declared-check-not-registered** · the v1 registry listed `c2.11-live-adoption-and-placement`
  while the function was `c2.11-placement-and-map`, so the check printed `FAIL not run` and the
  target was unreachable at 11/11 · evidence: `build/K77ReviewFreeze/report.md` FREEZE-FIX 1,
  `build/K77CriticClaims/predicate-name-mismatch.txt`, `build/K77ScoutOpen/report.md` blocker A1 ·
  captured-by: **none** — the counter had no self-check that every registered name has a
  declaration and vice versa · fix: A1.2/A2.3 renames and renumbers the registry; the v2 probe's
  registry is the authority and an absent name still reads `not run` (disclosed, not a pass).
- **readiness-receipt-outside-the-freeze** · `open/plan-before-ready-freeze.txt` was produced at
  the freeze but committed after the scaffolding commit, so the frozen tree cannot prove the
  map-arm readiness it cites · evidence: FREEZE-FIX 6; the file is untracked at `4dc470a1` ·
  captured-by: Q58/Q64 (a freeze carries its exercised receipts in the same commit) — the rule
  existed and was not applied to the readiness arm · fix: A2.2 discloses the ordering; the receipt
  lands in the work commit and the report distinguishes readiness from freeze evidence.
- **plan-pointer-open-vs-controls** · the plan cited `open/c1-usage-base.txt`; the committed file
  is `controls/c1-usage-base.txt` (FREEZE-FIX 6) · evidence: the two receipts · captured-by:
  **Q65** (a claim sentence cites a path that resolves at the freeze commit) · fix: A2.1 erratum;
  the frozen text is not rewritten.
- **cleanup-window-half-journal** · v2's first cleanup used recursive `rmSync` on the published
  journal; a kill during cleanup could leave a journal missing its pre-images, which the next run
  refuses instead of converging · evidence: `build/K77CriticClaims/report.md` kill-window table ·
  captured-by: **none** — the probe killed at publication/write boundaries only · fix: retire by
  renaming to `<uuid>.done` before deletion and treat `.done` as `RECOVERED - stale`; the probe
  still reads 13/13.
- **symlinked-pin-parent-escape** · v1 wrote through a symlinked `.ufo/pins/` and modified an
  outside-lane pin file (exit 0, reported CLEAN) · evidence:
  `build/K77SentinelBoundary/report.md` confirmed finding + `base-receipts.json` · captured-by:
  **none** — no criterion covered destination-parent canonicalisation · fix: both destination
  parents and the journal parent must `realpath` to the lane's own directories, else
  `REFUSED_PATH_ESCAPE` exit 2; the attack now refuses with the external file untouched.
- **seat-declined-its-own-execution** · the C2 executor implemented + extended the selftest but
  ran no probe/selftest, citing the fleet "never verify" rule; its self-evaluation says acceptance
  unmeasured · evidence: `build/K77ExecJournal/report.md` "blocked acceptance" · captured-by:
  **none** — the lane prompt's self-score instruction conflicted with the fleet-level delegation
  rule and the seat resolved the conflict against the assignment · fix: the L1 measured both
  counters; a future seat prompt must state that the assignment authorises the measured run (or
  drop the self-score demand and say the L1 measures).
- **battery-baseline-missing-oracle** · the C2 mutant battery's first real run copied only the
  tool, not `scripts/readme-map.mjs`, so the pristine selftest failed and the run read
  `BASELINE-FAILED killed=0` (inconclusive) · evidence: `build/K77MutC2/real-v2-run.txt` ·
  captured-by: **none** — the runner's contract said "copies the tool's directory" but the seat's
  invocation passed a file · fix: the L1 re-ran on the lane with the full `scripts/` and
  re-anchored the two arms my hardening moved (`close/mutants77-c2.*`); 8/8 killed.

## Counters

| counter | open | close | source |
|---|---|---|---|
| proxy findings (`--strict`) | 3 (A_DRIFT, C2_TOTAL_DRIFT, AXES_DRIFT) | 0 (`PROXY: MATCH`) | `open/proxy-strict-open.txt`; `close/proxy-check.txt` |
| proxy A / C / C2 / C2_total | 847 / 35 / 183 / 184 | 856 / 37 / 186 / 186 | `open/proxy-open.json`; `close/proxy-json.txt` |
| OMP census entries / findings / bound | 64 / 0 / 35 | 64 / 0 / 35 | `open/census-open.txt`; `close/census.txt` |
| README map (files / uncovered) | 184 / 1 | 186 / 0 | `open/readme-map-open.txt`; `close/readme-map.txt` |
| spotcheck map (spotchecks / uncovered) | 43 / 1 | 43 / 0 | `open/adopt-check-open.txt`; `close/spotcheck-check.txt` |
| SOURCES rows / tier A | 165 / 141 | 166 / 142 | `open/gates-open.txt`; `close/sources.txt` |
| checklists (pass / listed) | 32 / 35 | 37 / 37 | `open/checklists-open.txt`; `close/checklists.txt` |
| probe C1 / C2 | 1/12, 2/13 (base tree) | 12/12, 13/13 | `controls/c77-c*-base.txt`; `close/c*-probe.txt` |

## Spot-check

Pending the non-author closure. The closure writes `lessons/round-77-verifier-spotcheck.md`; this
round does not pre-create it. The two gate decisions above (S227 admit, package reject) are the
sample the closure can re-open.

## Verdicts

- **C1 — coverage:omp: improved (evidence re-derivability; the integer stays 10).** At the work
  commit the frozen counter reads `C77_C1: HELD held=12/12`; the committed receipt replays
  byte-identically from a materialised root; offline and root judges agree on the six O terms,
  including a trimmed receipt the constant printer cannot follow; a stray member and a widened
  mode each read `O_findings=1 coverage_omp=9`; a zeroed `pin.omp-shape` reads `GATE_PIN_DRIFT`.
  The v1 counter's printer hit is disclosed and superseded by A2.
- **C2 — operability: improved (capability deepening; the integer stays 9 by `f_O`).** At the same
  commit `C77_C2: HELD held=13/13`: three real SIGKILL windows converge with one exact recovery
  line, byte-exact rollback or completion; a corrupt pre-image refuses with the journal retained;
  recovery runs before `--predict`; the row is adjacent to the last lessons row; the symlinked
  parent is refused; the journal is retired by rename. Selftest 26/26; mutant battery 8/8.

- **adopt-journal-is-not-a-transaction** · the journal recovers a process crash but not a
  concurrent writer or power loss · evidence: the knowledge entry's limits and the critic's
  table · captured-by: **none** — no lock exists to test · fix: stated, not papered over; the
  contract says single-writer and no `fsync`.


## Erratum (round 78, 2026-11-04; append-only; supersedes only the lines it names)

- **D1 — the `## Counters` row's `A`.** The row reads `847 / 35 / 183 / 184 → 856 / 37 / 186 / 186`.
  The cited `close/proxy-json.txt` reads `"A": 857` at `rev=e47266ae…` (its own header line), and the
  report, the SCORECARD stanza and the pin block all read 857. The close cell's A is **857**;
  `C / C2 / C2_total` (37 / 186 / 186) stand.
- **D4 — quote word counts in `## Gate`.** Quote 2 (§4.4) is annotated "(21)"; the verbatim quote is
  **20** whitespace words. Quote 3 (§9.5) is annotated "(24)"; the verbatim quote is **25** (still
  inside the ≤25 bound). Quote 1's annotation (23) is correct.
- **D5 — the FREEZE-FIX 6 disposition receipt.** `open/r76-freeze-fix-6-disposition.txt` prints a
  loader `ERR_MODULE_NOT_FOUND` trace followed by `exit=0`; the exit line belongs to the trace
  display, not to a successful import — the named import itself exits 1. The underlying absence
  (`git cat-file -e ebfcedfa:scripts/spotcheck-adopt.mjs` → exit 128) is independently true; the
  receipt's annotation, not its evidence, is corrected here.
- **D6 — the carried r76 routed item 3 why-not.** The why-not ("`round-gate --close` reports
  `UPSTREAM_MISSING` on jj detached HEAD; operator-owned instrument, outside lane repair
  authority") existed only in `build/K77ScribeDocs/round-77-lesson.md`. It is recorded here so the
  committed lesson carries it: the gate is not weakened from this lane, and the refusal is
  disclosed each round it fires. (D2 — the base controls re-scored on the final counter bytes with
  `probe-sha256=d48390c3…` — lands as new receipts under `.ufo/waves/round-77/close/`, never as a
  rewrite of the filed controls.)
