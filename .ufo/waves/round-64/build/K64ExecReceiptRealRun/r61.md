# kumitate — round 61 report (hyaku; attempt 2, landing-only)

Base `c2721f812cebd97ab67a1dd8cd8492a193f82d42` (plan frozen at `48877b4`). Lane origin at attempt-2 start
`be4a820c344d4eb2f94b999c3b5d649e76ab70f1`. **Final lane hash `f351c520bfc4ce193a61145bdfecbcf1cb20db01`**
(`git -C kumitate-shokunin ls-remote origin refs/heads/master` → `f351c520bfc4ce193a61145bdfecbcf1cb20db01	refs/heads/master`).
Measured revision for both claims: `019a844c9db6d63206f3a39949bf790b05747a40`.

**Outcome: both declared claims FAILED AS DECLARED — an honest stop.** Attempt 1 ran both waves and
reached that verdict but landed nothing past `be4a820c`. Attempt 2 did no new craft work and ran no
waves. It landed attempt 1's work, re-ran both falsifiers, and appended the SCORECARD/LOG records.

## Work performed

Declared claims (frozen in `.ufo/waves/round-61/plan.md` §C1/§C2):

- **C1 — operability, capability acquisition `dispatch-evidence`** (frozen `DISPATCH61_HELD`, P61 v1, P1..P4).
- **C2 — coverage frontier band 4, sourced claim on S195** (`corpus/knowledge/temporal-worker-versioning-pinning.md`;
  frozen `DOCTRINE61_HELD`, D61 v1, E1..E6).

Work items:

- Inherited-state triage of the 37 uncommitted lane paths (attempt 1's work). 36 were kept and 1 discarded; both lists
  are under *Inherited state* below. Re-verification: census exit 0 (`.ufo/waves/round-61/close/census-after.txt`),
  `node scripts/readme-map.mjs` → `README_MAP: CLEAN files=148 rows=148 covered=148`.
- S195 row, entry, capture pin, README/PROVINCE rows, QUALITY Q52–Q57, lesson → commit `15084153`.
- Wave evidence (w1 32 seats, w2 40 seats), controls, counters pack, R60-V6 dead-seat table
  (`.ufo/waves/round-60/close/dead-seats-r60.md`), `scripts/make-dispatch-actual.mjs` → commit `019a844c`.
- Attempt-2 falsifier reproductions:
  - C1 zero-seat fabrication → `DISPATCH61_HELD held=4/4` exit 0 (`.ufo/waves/round-61/close/a2-repro-c1-fabrication.txt`).
  - C2 forged commit on a clean checkout → `DOCTRINE61_HELD held=6/6` exit 0 (`close/a2-repro-c2-forgery.txt`).
  - The same forged rev on the critic's reset worktree → 4/6 (`close/a2-repro-c2-forgery-dirty-worktree.txt`). This
    shows E4/E5 read the worktree, not the revision.
- Honest-tip counter receipts at `019a844c`: `close/a2-tip-dispatch61.txt`, `close/a2-tip-doctrine61.txt`, and
  `close/a2-tip-proxy.txt` → commit `f351c520`.
- SCORECARD append (`cat >>`) → commit `f351c520`. It supersedes:
  - the R60 measured-revision template placeholders at SCORECARD.md lines 2833/2847;
  - the R60 C1 10/10 overclaim (the receipt reads 8/10);
  - the stale proxy stanza (in prose: `proxy-check` admits exactly one stanza).

  It also adds a round-61 block recording both claims failed as declared with the reproduced falsifiers.
- LOG.md round-61 entry appended → commit `f351c520`.
- One inherited inconsistency fixed before landing. The `lessons/round-61.md` README row said "8 present, 1 absent"
  for the quarantine slice; it now matches the lesson's post-Audit14 count, "9 present, 0 absent" (in `15084153`).

## Landed changes

| Commit | Content | LOG tie |
|---|---|---|
| `15084153a0227554bd20d4dbf82bc730f596a511` | S195 row, entry, `.ufo/pins/{readme-map,source-captures}.json`, README/PROVINCE rows, QUALITY Q52–Q57, `corpus/lessons/round-61.md`, `.ufo/waves/round-61/build/` | LOG.md round-61 entry ("Landed anyway as honest work: S195 row … Q52–Q57, lesson") |
| `019a844c9db6d63206f3a39949bf790b05747a40` | `.ufo/waves/round-61/{w1,w2,close,controls}`, `probe/counters.sh`, `plan.md` shape addendum, `build-wave2.mjs`, `w2-{dispatch,plan,spec}.json`, `.ufo/waves/round-60/close/dead-seats-r60.md`, `scripts/make-dispatch-actual.mjs` | LOG.md round-61 entry ("R60-V6 dead-seat table, `scripts/make-dispatch-actual.mjs`, and wave evidence") |
| `f351c520bfc4ce193a61145bdfecbcf1cb20db01` | SCORECARD.md correction + round-61 block, LOG.md entry, attempt-2 receipts in `close/` | LOG.md round-61 entry (whole entry) |

Every commit went through `scripts/hyaku/jj-lane.sh commit … --as kumitate` and printed `landed <hash>`.

Limit: the appended SCORECARD correction quotes the R60 template token by name as the subject it supersedes.
A bare Q52 `grep` over SCORECARD.md therefore still hits lines 2833/2847 (the historical originals) and those
quoted mentions. The token is not used as a citation anywhere in this round's text.

## Before → after measurements

- **C1** — `node .ufo/waves/round-61/probe/dispatch61-probe.mjs /home/vgpnk/Projects/shokunin/kumitate-shokunin <rev>`
  - Before (base `c2721f81`): gate `FAIL-CLOSED wave-dir-absent` (`.ufo/waves/round-61/base/dispatch61-base.txt`).
  - After (`019a844c`): `DISPATCH61_UNMET held=2/4 checks=4` exit 1. P3 misses because the capability row does not
    name round 61; P4 misses because the tip receipt is absent (`close/a2-tip-dispatch61.txt`).
  - Falsifier: the fabrication fixture at rev `ab902da2fa30d051455a5f3563627e2c23c3a74d` reads HELD 4/4.
  - Verdict: **failed as declared**. Operability stays 9.
- **C2** — `node .ufo/waves/round-61/probe/doctrine61-probe.mjs /home/vgpnk/Projects/shokunin/kumitate-shokunin <rev>`
  - Before (base): entry absent, 133 rows (`base/census-before.txt`).
  - After (`019a844c`): `DOCTRINE61_UNMET held=3/6 checks=6` exit 1, with E3 `row-absent`, E4 `pin=` and E5 `exit=2`
    (`close/a2-tip-doctrine61.txt`).
  - Root cause: the JS regex uses POSIX `[[:space:]]`, and the probe reads cells c[9]/c[10]/c[12] of the 11-cell
    contract row (`controls/ctl-c2-critic-a0-honest-row-vacuity.txt`).
  - Falsifier: the forged commit `4247d2d` reads HELD 6/6.
  - Verdict: **failed as declared**. Coverage stays 10.
- **Proxy** — `node scripts/proxy-check.mjs` at `019a844c` (exit 1).
  - Findings: `A_DRIFT declared=105 computed=115`, `C2_DRIFT`/`C2_TOTAL_DRIFT declared=145 computed=148`, and
    `PIN_UNPINNED scripts/make-dispatch-actual.mjs`.
  - The base already read DRIFT (`base/proxy-before.txt`: A 105/107, C2_total 145/146, AXES_DRIFT).
  - The `AXES_DRIFT` finding is gone at the tip.

## Sources & frontier

- Census command: `/home/vgpnk/Projects/shokunin/scripts/sources-census.sh validate --root /home/vgpnk/Projects/shokunin kumitate`
  - Before: exit 0, six W04 warnings, registry 133 rows (A=110 B=15 C=8) (`.ufo/waves/round-61/base/census-before.txt`).
  - After: exit 0 at lane tip, same six W04 warnings, registry 134 rows (A=111 B=15 C=8) (`.ufo/waves/round-61/close/census-after.txt`).
- Rows added by tier: A +1 (S195 — Temporal Worker Versioning, `https://docs.temporal.io/worker-versioning.md`).
  It was opened on 2026-10-25 and its located quote is in the lesson `## Gate`. Capture sha256
  `8ef2ee5f5e196d9d14fc8c85449442764e812f3e4f0f6e2bb1bdc12895f0f8fc` is pinned in `.ufo/pins/source-captures.json`.
  Rows touched old→new: none.
- Frontier: the band-4 reading path in `corpus/SOURCES.md` was extended from S106 → … → S194 to S106 → … → S194 → S195,
  and the band-4 line in PROVINCE.md names the new entry.
- Rejects with flips: `exactly-once-attribution.md` and `multi-agent-coordinator-topologies.md` (lesson `## Gate`).
- Mined mistakes: `corpus/lessons/round-61.md` §Mistakes records four, covering reference-drift, the vacuous frozen
  predicates (→ Q57), landing, and stale-premise. The quarantine id-vs-document lesson became Q56.

## Trend verdicts

- **expansion: improved.** One A-tier row and one band-4 entry landed with a pinned capture (census exit 0,
  133→134). C2 does not verify, so this rests on the census and the receipts, not on D61.
- **quality: unchanged.** The proxy read DRIFT before and still reads DRIFT. `AXES_DRIFT` cleared, but the A and C2
  deltas grew because new artifacts are not yet declared. Q52–Q57 are criteria, not yet a measured quality move.
- **discernment: unchanged (not self-claimed).** Both claims' predicates were broken by wave-2 and critic controls,
  and attempt 2 reproduced the breaks. That judgment awaits the non-author closure.

## SHONEN

- [~] SKILL.md contains real decision tables, error patterns, checklists, cited sources — new entry
  `corpus/knowledge/temporal-worker-versioning-pinning.md` cites S195 with a pinned capture (`15084153`); QUALITY Q52–Q57 in `corpus/QUALITY.md`.
- [~] At least one end-to-end domain task executed and logged in LOG.md — two waves (72 seats) under
  `.ufo/waves/round-61/{w1,w2}/` and the LOG.md round-61 entry (`f351c520`); both claims failed as declared.
- [~] Instructions executable by an agent without oral context — attempt 2 re-ran both frozen counters and both
  falsifiers from committed bytes alone (`.ufo/waves/round-61/close/a2-*.txt`).
- [~] No cross-domain bleed (PROVINCE.md still accurate) — PROVINCE.md band 4 names the new entry; connector scan
  `.ufo/waves/round-61/w1/ConnectorSiblings.md` found adjacency only (see *Cross-domain*).

## Wave accounting

- **Round shape:** default, two v1 waves (policy `scripts/hyaku/ufo-wave-policy.json`, band 32–64), all run by
  attempt 1. Attempt 2 dispatched none.
- **Wave 1 (build): 32 seats**, all exit 0 (`.ufo/waves/round-61/w1/launcher-progress.tsv`, `w1/swarm-registry.json`,
  `w1/dispatch-actual.json`). Role mix: executor 9, scout 8, reviewer 5, critic 4, scribe 3, connector 1,
  mutation-tester 1, sentinel 1. The §3 floor is met inside wave 1.
- **Planner seat:** the validator rejects `planner`, so the L1 held the planner seat; the bounded planning walk rode
  scout and connector items.
- **Wave 2 (falsify): 40 seats** (reviewer 21, critic 19), dispatched on 40 distinct attack items (`plan.md`
  §Shape addendum, `w2-spec.json`). 39 exited 0 and 1 died (`w2/launcher-progress.tsv`, `close/w2-results.json`).
- **Residual call:** none. **Round total:** 72/128 seats.

## Dead seat

- `Audit19` (wave 2, `L1Kumitate61.Audit19`): exit 1. Last error text: `provider rejected task prompt as invalid_prompt`
  (`.ufo/waves/round-61/close/w2-results.json`). It was not replaced and gets no credit; its attack item stays unattacked.

## Misroot

- Wave-2 `Audit22` wrote its report under a misspelled fleet-root directory,
  `/home/vgpnk/Projects/shokunin/kumitate-shokukin/.ufo/waves/round-61/w2/Audit22.md`. Attempt 1 copied it byte-exact
  into the lane (`cmp` exit 0) and deleted the fleet copy (`.ufo/waves/round-61/close/misroot-Audit22.txt`, landed in `019a844c`).
- Attempt-2 sweep: `git -C /home/vgpnk/Projects/shokunin status --porcelain` shows untracked `.omp/mcp.json`,
  `.ufo/waves/round-24/`, `.ufo/waves/round-69/` and `s795.pdf … s820.pdf/html`. `rg -a -l -i 'kumitate|L1Kumitate61'`
  over them → exit 1 (no match), so none are kumitate's. `kumitate-shokukin/` no longer exists.

## Attempt-1 failure

Attempt 1 ran both waves and reached its own verdict that both claims fail:

- C1 is reachable by a no-seat fabrication.
- C2's probe cannot verify an honest row and accepts forged evidence.

It then ended with 37 uncommitted lane paths and no report (origin stayed at `be4a820c`). Attempt 2 is the landing
finish: triage, three helper commits, falsifier re-runs, appends, this report. No claim was re-scored and no frozen
predicate was edited after seats scored.

## Inherited state

**Kept (36 paths, committed as attempt-1 round-61 work):**

- Modified, tracked:
  - `.ufo/pins/readme-map.json`, `.ufo/pins/source-captures.json`
  - `.ufo/waves/round-61/plan.md`, `PROVINCE.md`
  - `corpus/QUALITY.md`, `corpus/README.md` (+ the one-row count fix), `corpus/SOURCES.md`
- Untracked:
  - `.ufo/waves/round-60/close/dead-seats-r60.md`
  - `.ufo/waves/round-61/build-wave2.mjs`, `.ufo/waves/round-61/build/`, `.ufo/waves/round-61/close/`
  - 16 `.ufo/waves/round-61/controls/ctl-c{1,2}-critic-*.txt` files
  - `.ufo/waves/round-61/probe/counters.sh`
  - `.ufo/waves/round-61/w1/`, `w2-dispatch.json`, `w2-plan.json`, `w2-spec.json`, `.ufo/waves/round-61/w2/`
  - `corpus/knowledge/temporal-worker-versioning-pinning.md`, `corpus/lessons/round-61.md`
  - `scripts/make-dispatch-actual.mjs`

**Discarded (1):** attempt 1's uncommitted `SCORECARD.md` append. It carried a duplicated `## Round 61 correction`
heading and put off the proxy supersession. It was restored from `master` and replaced by attempt 2's appended block
(content reused, defects fixed). Nothing was unattributable: every untracked file names round 61 or a round-61 seat.

**Not authored by this lane, untouched:** the fleet-root items listed under *Misroot*.

## Cross-domain

Connector `.ufo/waves/round-61/w1/ConnectorSiblings.md` gives the verdict *adjacent*. It names one hard contradiction:
the shokuknow campaign package stages a different source (MCP Architecture) as S195 and Temporal as S217. The lane
kept S195 because it is the lane's next free id; the package row is not appended (lesson §Assimilation; collision
guard `build/ScoutCollisionGuard/guard-proof.md`). It also found that mori r44's README-row grammar would read
`uncovered` under this lane's gate. Nothing was pushed to sibling repos.

## Open L0 questions

None new.

## Tool installs/updates

None.
