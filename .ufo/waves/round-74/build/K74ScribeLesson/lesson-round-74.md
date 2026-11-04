author: kumitate L1
round: 74

# Round 74 — lane operability restored on Linux host: origin-pin clone re-established (C1) and drifted kimi-plane members declared (C2)

## Gate

Opened this round, capture pinned under `.ufo/waves/round-74/open/captures/` (build capture at `.ufo/waves/round-74/build/captures/git-clone.html`):
- S223 — Git project, "git-clone", https://git-scm.com/docs/git-clone, opened 2026-11-04
  (`curl -sSL`, 107882 bytes, sha256 `d31b6c9f293a5dfc52c551b86be211b2d6dad3d2b4cf0d9c696d5fbed713554a`).
  Located quote: § OPTIONS (--no-hardlinks) (23 words): <measured quote: "Force the cloning process from a repository on a local filesystem to copy the files under the .git/objects directory instead of using hardlinks."> —
  grounds why the pinned immutable origin clone uses `--no-hardlinks` to ensure object independence from the live origin repository.

Decisions:
- **Admit** S223 (tier A, official Git documentation) — criterion Q1–Q5: header facts in
  the row, capture pinned and gate-verified; grounds exactly one claim (C1 origin pin recreate recipe);
  re-opened live, quote verbatim in captured bytes.
- **Reject** — candidate: assimilate merge package `merge/kumitate/` (155 rows, 70 entries).
  Criterion missed: scoping proportionality (§10) — the package's 155 rows and 70 entries are
  out of proportion to this round's two focused host-restore claims and would dilute verification of the
  restored Linux operability baseline; reported as `Assimilation (§10): none this round`.
  **Flip:** a dedicated assimilation round once the restored host operability and coverage baselines are fully established.
- Standing rejects re-opened this round: the round-72 reject (editing scored v3 counter header) and round-73 rejects re-checked; standing reject verdicts unchanged.

## Mistakes

- stale-premise (pre-registration candidate 1 carried no host predicate and became moot upon host restore) · the round-74 pre-registration candidate 1 in SCORECARD.md `## Planned` (kimi-census win32 portability repair) carried no host predicate; when the lane moved back from Windows to the restored Linux host (plazir27), `process.getuid` existed and `scripts/kimi-census.mjs --selftest` passed 54/54 immediately (`open/gates-open.txt`), making the candidate moot before work began · captured-by: claim-sizing host re-measure rule (run-15 addendum) · fix: pre-registered host-conditional claims must name the host predicate explicitly and are re-measured at open; landed as the round-74 lesson `## Mistakes` + SCORECARD round-75 pre-registration disposition.
- recurrence (inherited spotcheck coverage gap recurred) · `lessons/round-73-verifier-spotcheck.md` was landed by the round-73 closure commit without its README row or `readme-map.json` covered entry (`open/maps-open.txt`: `README_MAP: DRIFT files=177 rows=176 covered=176 bad=2 first=uncovered:lessons/round-73-verifier-spotcheck.md`), exactly as predicted by `corpus/lessons/round-73-verifier-spotcheck.md` item 3 · captured-by: r73-spotcheck item 3 (known recurrence class) · fix: repair lands this round (spotcheck row and pin entry added alongside the round-74 lesson's own row); structural note: the lane's own gates run before the closure writes the spotcheck file, so the recurrence is only visible at the NEXT round's open — an aggregator-side covered-set check would catch it in-round.

## Routed items (dispositioned this round; none silently skipped)

- **R73-spotcheck item 3 (inherited spotcheck coverage): LANDED** as routed repair — `lessons/round-73-verifier-spotcheck.md` row and covered pin entry added alongside the round-74 lesson's own row (`corpus/README.md` and `.ufo/pins/readme-map.json`); stanza `C2/C2_total` re-measured same-commit.
- **R73-spotcheck item 4 (REPORT_RECEIPT self-reference): LANDED** — computed against final bytes in companion wave file, measurement point stated in report.
- **considerthese proposal 1 (2026-10-26, "every number has a transcript"): LANDED** as `corpus/QUALITY.md` criterion Q70.
- **kimi-census win32 crash: moot on Linux host** (54/54 selftest PASS at open), dispositioned as stale-premise mistake, candidate retired/grounded in origin-host.

## Round-74 verdicts

C1 (operability, capability acquisition `origin-pin-restore`; sourced on S223) **verifies**: red at base `3c369336…`: `node scripts/proxy-check.mjs` → `PROXY: FAIL-CLOSED (SRC_NOT_A_DIR) --src /fast/scratch/hyaku/kumitate-pin/src is absent` exit 2 (`open/gates-open.txt`). Green at `<measured fix rev>`: after running the pin's recreate recipe verbatim (`git clone --no-hardlinks file:///home/vgpnk/Projects/ufo-fsd-alpha /fast/scratch/hyaku/kumitate-pin/src`, detach checkout `31c465f15669f744848bd9f5d56191c5085670f7`, `chmod -R a-w`), `node scripts/proxy-check.mjs` → `PROXY: MATCH` exit 0 (`<receipt: close/proxy-check.txt>`), `node scripts/proxy-check.mjs --strict` → `PROXY: MATCH` exit 0 (`<receipt: close/proxy-check-strict.txt>`), and `git -C /fast/scratch/hyaku/kumitate-pin/src rev-parse HEAD` prints `31c465f15669f744848bd9f5d56191c5085670f7` (`<receipt: close/recreate-transcript.txt>`). Kill rules held: no re-derived term reading DRIFT; do-nothing control exit 2. Capability row `origin-pin-restore` entered into `## Capabilities`. Operability integer 9 → 9 held (terminal under `f_O`).

C2 (coverage:kimi-layer, integer held at 10) **verifies**: red at base `3c369336…`: `node scripts/kimi-census.mjs` → `KIMI_CENSUS: DRIFT (UNLISTED plugins/installed.json.bak-pre-shokunin; UNLISTED plugins/managed/kimi-shokunin)` exit 1 (`open/gates-open.txt`), members=53. Green at `<measured fix rev>`: `node scripts/kimi-census.mjs` → `KIMI_CENSUS: CLEAN (members=55 checked=55 errors=0 …)` exit 0 (`<receipt: close/kimi-census.txt>`), selftest `<measured>` PASS (`<receipt: close/kimi-selftest.txt>`), both members declared in `scripts/kimi-census.mjs` and `scripts/proxy-check.mjs` `K_MEMBER_RULES`, and bound by `## ` sections in `corpus/knowledge/kimi-skills-plugins.md`. `node scripts/proxy-check.mjs --json` re-derives `K_members=55`, `K_sections=55`, `coverage_kimi=10` (`<receipt: close/proxy-check-json.txt>`). Integer held at 10. Same-commit re-pin of `pin.kimi-census` and `pin.proxy-check`.

admitted_self: both declared claims verify; routed repairs landed; no axis harmed.

## Round-gate at filing

`node scripts/round-gate.mjs --round 74` at open read `DRIFT (errors=4 warnings=0)` — the expected pre-close state (REPORT_MISSING, SCORECARD_ROW_MISSING, LOG_ENTRY_MISSING, COMMIT_MISSING). All four errors are satisfied by this round's close artifacts (Move-log row `| 74 |`, gate-required one-line LOG record, round-74 commit `<measured>`, and filed report).
