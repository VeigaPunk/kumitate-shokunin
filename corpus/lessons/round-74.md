author: kumitate L1
round: 74

# Round 74 — lane operability restored on the Linux host: origin-pin clone re-established (C1) and drifted kimi-plane members declared (C2)

## Gate

Opened this round, capture pinned at `.ufo/waves/round-74/build/captures/git-clone.html`
(sha256 `d31b6c9f293a5dfc52c551b86be211b2d6dad3d2b4cf0d9c696d5fbed713554a`, 107882 bytes):
- S223 — git clone — https://git-scm.com/docs/git-clone, opened 2026-11-04 (`curl -sSL`, HTTP 200;
  installed man page `git clone --help`, git 2.56.0, agrees verbatim with both located quotes).
  Located quotes: § OPTIONS (`--no-hardlinks`, 23 words): "Force the cloning process from a
  repository on a local filesystem to copy the files under the .git/objects directory instead of
  using hardlinks."; § OPTIONS (`-l`, `--local`, 12 words): "The files under .git/objects/
  directory are hardlinked to save space when possible." — grounds why the pinned immutable origin
  clone uses `--no-hardlinks` so its object store stays independent of the live origin repository.

Decisions:
- **Admit** S223 (tier A, official Git documentation; scoped to git clone local-path object
  hardlink semantics) — the row's header facts are in the committed bytes, the capture is pinned
  and gate-verified (`SOURCE_CAPTURE: CLEAN captures=55`), the quote is verbatim in the captured
  bytes, and it grounds exactly C1's recreate recipe.
- **Reject** — candidate: assimilate the shokuknow merge package `merge/kumitate/` (155 rows,
  70 entries). Criterion missed: scoping proportionality (§10) — the package is out of proportion
  to this round's two focused host-restore claims and would dilute verification of the restored
  operability baseline. **Flip:** a dedicated assimilation round once the restored-host baselines
  are re-established. Recorded in the report as `Assimilation (§10): none this round`.

## Mistakes

- stale-premise (a pre-registered candidate carried no host predicate and became moot on host
  restore) · the round-74 pre-registration candidate 1 (kimi-census win32 portability repair,
  `SCORECARD.md ## Planned`) carried no host predicate; when the lane moved back to the restored
  Linux host, `process.getuid` exists and `scripts/kimi-census.mjs --selftest` passed 54/54 at
  open (`open/gates-open.txt`), mooting the candidate before work began · captured-by: the
  claim-sizing host re-measure rule (run-15 addendum: host-failed claims are re-measured on the
  restored host, never re-declared from old receipts) · fix: pre-registered host-conditional
  claims must name the host predicate explicitly and are re-measured at open; dispositioned in the
  round-75 pre-registration.
- recurrence (the closure-landed spotcheck coverage gap recurred, exactly as predicted) ·
  `lessons/round-73-verifier-spotcheck.md` was landed by the round-73 closure without its README
  row or `readme-map.json` covered entry (`open/maps-open.txt`: `README_MAP: DRIFT files=177
  rows=176 covered=176 bad=2 first=uncovered:lessons/round-73-verifier-spotcheck.md`), exactly as
  `corpus/lessons/round-73-verifier-spotcheck.md` item 3 predicted it would · captured-by:
  r73-spotcheck item 3 (the class was known and named) · fix: repair landed this round (row +
  covered entry for the spotcheck file, alongside the round-74 lesson's own row and the
  origin-pin-restore entry); structural note: the lane's own gates run BEFORE the closure writes
  the spotcheck file, so the recurrence is only visible at the NEXT round's open — an
  aggregator-side covered-set check at closure time would catch it in-round; routed to the
  round-75 pre-registration.

## Routed items (dispositioned this round; none silently skipped)

- **R73-spotcheck item 3 (inherited spotcheck coverage): LANDED** — README row + covered pin
  entries for `lessons/round-73-verifier-spotcheck.md`, `lessons/round-74.md` and
  `knowledge/origin-pin-restore.md`; `README_MAP: CLEAN` at close; stanza `C2/C2_total`
  re-measured same-commit (179/179).
- **R73-spotcheck item 4 (REPORT_RECEIPT self-reference): LANDED** — the round report's receipt is
  computed against the final bytes and the measurement point is stated in the report itself.
- **considerthese proposal 1 (2026-10-26, "Check that every number has a transcript"): LANDED** as
  `corpus/QUALITY.md` criterion Q70.
- **K74MutKimi survivor mutants 4(a)/4(b): RESOLVED AT INTEGRATION** — the seat tested its own
  hand-built declaration (the C2 patch was absent at its start) and reported two survivors against
  the proxy selftest; re-tested against the applied patch, both mutants read `PROXY_SELFTEST:
  122/124 pass VERDICT: FAIL` (the two new fixture cases die when their rule is dropped) —
  receipt `close/mutant-verify.txt`. The finding is recorded as a sequencing artifact, and the
  receipt is the red state the applied patch kills.
- **omp-census host drift (NEW, routed — not a round-74 claim):** `node scripts/omp-census.mjs`
  reads `OMP_CENSUS: DRIFT (root=/home/vgpnk/.omp/agent entries=63 findings=39)` at open
  (`open/checklists-BEFORE.txt`, item SKILL.md:731): the agent root gained 39 unlisted members
  across the Windows rounds and the run-15 host restore (`config.yml.pre-*` backups, `lsp.json`,
  corrupt `models.db*` triads). Same class as C2 on the OMP plane; pre-registered as a round-75
  candidate. Carried red, disclosed, NOT silently skipped.
- **kimi-census win32 portability: MOOT on this host** (selftest 54/54 at open) — dispositioned
  as the stale-premise mistake above; the win32 arms stay origin-host-disclosed ground.

## Round-74 verdicts

C1 (operability, capability acquisition `origin-pin-restore`; sourced on S223) **verifies**: red
at base `3c369336…`: `node scripts/proxy-check.mjs` → `PROXY: FAIL-CLOSED (SRC_NOT_A_DIR) --src
/fast/scratch/hyaku/kumitate-pin/src is absent` exit 2 (`open/gates-open.txt`). Green at the
close rev: after the pin's recreate recipe verbatim (`git clone --no-hardlinks
file:///home/vgpnk/Projects/ufo-fsd-alpha /fast/scratch/hyaku/kumitate-pin/src`, detach checkout
`31c465f15669f744848bd9f5d56191c5085670f7`, `chmod -R a-w`), `node scripts/proxy-check.mjs` →
`PROXY: MATCH` exit 0 and `node scripts/proxy-check.mjs --strict` → `PROXY: MATCH` exit 0
(`close/proxy-check.txt`, `close/proxy-check-strict.txt`), with `git -C
/fast/scratch/hyaku/kumitate-pin/src rev-parse HEAD` at the pinned rev
(`build/K74ExecPinRestore/recreate-transcript.txt`). The five fail-closed arms still hold
(sentinel seat, arms 5/5: `SRC_NOT_A_DIR`, `SRC_REV_MISMATCH`, `UNLISTED`, `SRC_REV_UNVERIFIABLE`,
wrong-rev refusal).

C2 (coverage:kimi-layer, integer held at 10) **verifies**: red at base `3c369336…`: `node
scripts/kimi-census.mjs` → `KIMI_CENSUS: DRIFT (UNLISTED
plugins/installed.json.bak-pre-shokunin; UNLISTED plugins/managed/kimi-shokunin)` exit 1
(`open/gates-open.txt`), members=53. Green at the close rev: `node scripts/kimi-census.mjs` →
`KIMI_CENSUS: CLEAN (members=55 checked=55 chain=22 info=4)` exit 0 with `TOTALS: members=55
checked=55 errors=0 info=4 chain=22` (`close/kimi-census.txt`), selftests
`KIMI_CENSUS_SELFTEST: 56/56 pass` and `PROXY_SELFTEST: 124/124 pass` (`close/kimi-census.txt`,
`close/proxy-selftest.txt`),
both members declared in `scripts/kimi-census.mjs` and `scripts/proxy-check.mjs`
`K_MEMBER_RULES`, bound by `## ` sections in `corpus/knowledge/kimi-skills-plugins.md`, and
`node scripts/proxy-check.mjs --json` re-deriving `K_members=55`, `K_sections=55`,
`coverage_kimi=10`. Five census mutants killed (`UNLISTED`/`MEMBER_MISSING`/family-flip/
enumerable-drop/FROZEN-decrement); the two proxy survivors re-verified killed against the applied
patch (`close/mutant-verify.txt`).

admitted_self: both declared claims verify; routed repairs landed; no axis harmed.

## Round-gate at filing

`node scripts/round-gate.mjs --round 74` at open read `DRIFT` (REPORT_MISSING,
SCORECARD_ROW_MISSING, LOG_ENTRY_MISSING, COMMIT_MISSING — the expected pre-close state). All four
are satisfied by this round's close artifacts (Move-log rows `| 74 |`, the LOG round-74 entry, the
round-74 commits, and the filed report).
