# kumitate round 74 — plan (frozen 2026-11-04, before any data seat runs)

Host: Linux plazir27 (the run-15 restored omp/jj host). The lane ran rounds 70–73 on a Windows host
(PROVINCE host corrections r70/r72/r73); per the run-15 addendum, host-failed claims are re-measured
here, never re-declared from old receipts. Round-74 open revision: lane branch master `3c369336…`
(the r73 close). Both pre-registered candidates 1 (kimi-census win32 portability) and 2
(proxy-check `SRC_NOT_A_DIR`) are re-measured at open in `open/gates-open.txt`:
the win32 crash does not reproduce on this host (`process.getuid` exists; selftest 54/54 PASS) —
candidate 1 is moot here, recorded as the round's mined mistake (stale-premise pre-registration,
no host predicate). The live reds are the kimi-plane drift and the dead origin-pin clone path.

## C1 — operability — capability acquisition `origin-pin-restore` (sourced on S223, opened this round)

Red at open (base `3c369336…`): `node scripts/proxy-check.mjs` →
`PROXY: FAIL-CLOSED (SRC_NOT_A_DIR) --src /fast/scratch/hyaku/kumitate-pin/src is absent` exit 2
(`open/gates-open.txt`); `node scripts/proxy-check.mjs --src /home/vgpnk/Projects/ufo-fsd-alpha` →
`SRC_REV_MISMATCH` exit 2 (`open/proxy-open-src.txt`). The pin `.ufo/pins/origin.json` (contract
`kumitate-origin-pin-v1`) pins origin rev `31c465f15669f744848bd9f5d56191c5085670f7` at clone path
`/fast/scratch/hyaku/kumitate-pin/src`; the path is absent on this host (scratch from the previous
Linux run was reclaimed); the pinned rev EXISTS in the local origin repo
(`git cat-file -t 31c465f1…` → commit, `open/prereqs.txt`).

**Frozen predicate:** after re-establishing the pinned clone with the pin's own `recreate` recipe
verbatim (clone `--no-hardlinks` from `file:///home/vgpnk/Projects/ufo-fsd-alpha`, detach-checkout
the pinned rev, `chmod -R a-w`), at the measured commit BOTH
`node scripts/proxy-check.mjs` and `node scripts/proxy-check.mjs --strict` print `PROXY: MATCH`
exit 0, and `git -C /fast/scratch/hyaku/kumitate-pin/src rev-parse HEAD` prints the pinned rev.

**Counting command (frozen):** `node scripts/proxy-check.mjs; echo exit=$?` → `PROXY: MATCH`, exit 0.
**Kill rule (frozen):** any re-derived term reading DRIFT, or any stanza/term edit made to force
MATCH, kills the claim; if the pinned rev cannot be checked out, fail closed and report. The
do-nothing control (no recreate) stays at exit 2 SRC_NOT_A_DIR — receipted at open — so the
control cannot reach the predicate. **C2-first sequencing:** `PROXY: MATCH` additionally requires
the stanza true (C2's terms); C2 is verified by its own instrument first (kimi-census), and both
receipts are quoted at the measured commit. **Capability row:** `origin-pin-restore` enters
`## Capabilities` — on this host the lane re-establishes an immutable pinned origin clone from the
pin contract and runs the full proxy recompute (first demonstrated this round; rounds 70–73 could
not run it at all).

## C2 — coverage:kimi-layer — declare the two drifted kimi-plane members

Red at open (base `3c369336…`): `node scripts/kimi-census.mjs` →
`KIMI_CENSUS: DRIFT (UNLISTED plugins/installed.json.bak-pre-shokunin; UNLISTED plugins/managed/kimi-shokunin)`
exit 1 (`open/gates-open.txt`). The live root `~/.kimi-code` gained two members since the round-42
census (rounds 70–73 ran on a host where the census could not run at all):
`plugins/installed.json.bak-pre-shokunin` (file) and `plugins/managed/kimi-shokunin` (dir).

**Frozen predicate:** at the measured commit `node scripts/kimi-census.mjs` prints
`KIMI_CENSUS: CLEAN (members=55 checked=55 errors=0 …)` exit 0 with the two members declared in
BOTH `scripts/kimi-census.mjs` and `scripts/proxy-check.mjs` `K_MEMBER_RULES`, each bound by a
`## ` section naming it at internals level in `corpus/knowledge/kimi-skills-plugins.md`, the census
selftest green with the new arms, and `node scripts/proxy-check.mjs --json` re-deriving
`K_members=55`, `K_sections=55`, `coverage_kimi=10`.

**Counting command (frozen):** `node scripts/kimi-census.mjs; echo exit=$?` → CLEAN, exit 0.
**Kill rule (frozen):** the declared members must be verified present on the live root at measure
time (shape-only, never content-read for secret material); a selftest tally change without a
committed transcript kills the claim; same-commit re-pin of `pin.kimi-census` and `pin.proxy-check`
per the row's own rule. Integer held at 10 — the ratio cannot show this move; the member counts
and root enumeration do (rounds 34/35/40/42 precedent).

## Routed repairs carried into the round (not claims)

- R73-spotcheck item 3: `lessons/round-73-verifier-spotcheck.md` is uncovered in
  `corpus/README.md`/`readme-map.json` (`open/maps-open.txt`: `README_MAP: DRIFT files=177 rows=176
  covered=176 first=uncovered:lessons/round-73-verifier-spotcheck.md`) — repaired this round
  (row + covered pin entry) together with the round-74 lesson file's own row, stanza `C2/C2_total`
  re-measured same-commit.
- R73-spotcheck item 4 (REPORT_RECEIPT self-reference): this round's report receipt is computed
  against final bytes in a companion wave file, and the measurement point is stated in the report.
- considerthese proposal 1 (2026-10-26, "every number has a transcript") lands as a QUALITY.md
  criterion via the scribe seat.

## Frontier step (§2b)

- Census: start exit 0 (`open/census-start.txt`, six carried W04); end MUST be exit 0.
- Mistake mined: stale-premise pre-registration without a host predicate (candidate 1 above);
  second row: the spotcheck-uncovered recurrence class, captured-by r73-spotcheck item 3.
- Sourced claim: C1 rests on S223 (git-clone local hardlink semantics, opened by the scout seat
  this round; capture pinned by `source-capture`).
- Assimilation (§10): none this round — the package's 155 rows/70 entries are out of proportion to
  this round's two host-restore claims; report says so.

## Wave (one v1 wave, 11 seats, band 8–16, attack 4/11 = 36 %, connectors 1)

Seats: K74ScoutGitCloneDocs (scout), K74ExecKimiMembers / K74ExecPinRestore / K74ExecReadmeRepair
(executors ×3), K74ScribeLesson (scribe), K74ConnectorOverlap (connector), K74MutKimi
(mutation-tester), K74LabratFailClosed (labrat), K74CriticClaims (critic), K74ReviewFreeze
(reviewer). L1 holds the canonical planner seat (validator rejects `planner`; orchestrator ruling
2026-10-19). Seats are leaves; no lane writes except each seat's report; writers deliver patches
under `.ufo/waves/round-74/build/`; L1 is the sole integrator. No new runnable-extension files in
the lane tree (the `A=687` proxy term counts every `*.mjs|js|sh|py` in the tree — patches edit
existing files only; receipts are `.txt`/`.md`).
