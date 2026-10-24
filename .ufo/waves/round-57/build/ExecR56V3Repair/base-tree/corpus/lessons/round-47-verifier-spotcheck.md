author: hyaku closure (non-author integrator, @m_opus)

# Round 47 — verifier spot-check (non-author)

Closure session `HyakuCloseKumitate47`, 2026-10-23. Inputs:
- report `.ufo/reports/round-47/kumitate.md` (fleet `ed17d1de`)
- prompt `.ufo/prompts/kumitate-round-47.md` (fleet `eb7830a`)
- lane base `0bd8be60d9150030a2eee8344a2e70b65f6eb4f4`, tip `e42eba65e72c3cb3b7b1f50c3caedb1d4df86910`

Driver digest, copied from `.ufo/watchdog.log`:
- `2026-10-23T06:28:20-03:00 launch kumitate round=47 pgid=665961 driver=hyaku-inline attempt=1`
- `2026-10-23T07:58:09-03:00 complete kumitate round=47; hyaku-inline attempt=1`

This session ran its own commands on 2026-10-23 between 10:50 and 11:05Z. It dispatched no seats, so none died and
none was resent. No sibling gate, selftest or counter was executed (§Gate standard, Closure consequence). No tools
were installed. Source re-fetches went to `/fast/scratch/hyaku/close-kumitate-r47/`; the fetch commands and digests
are below.

## 1. Conformance (step 1)

| check | command | observed | result |
|---|---|---|---|
| report committed by lane identity | `git log --format='%an %H %aI %cI' -- .ufo/reports/round-47/kumitate.md` | `kumitate-shokunin ed17d1de…`, authored 07:48:41 -03, committed 07:57:43 -03, after the lane tip (07:56:49 -03) | ok |
| `SHONEN` heading, one line per box | read report:82-87 | 4 lines (`[~]`,`[~]`,`[ ]`,`[ ]`), the two `[~]` with pointers | ok |
| cited hashes exist and are ancestors of `master` | `git merge-base --is-ancestor <h> master` for cac43009, 796b49b4, 68aa4336, 269dadb6, 8de35e79, 47e386fc, f399fc60, 67ebb32d, e42eba65 (plus 0bd8be60, 2b2bf7bb, 9b33e03e) | 12 × ok; `git rev-list --count 0bd8be60..e42eba65` = 9 | ok |
| pushed, nothing uncommitted | `scripts/hyaku/jj-lane.sh state …` ; `git status --porcelain` | `local=remote=e42eba65… ahead=0 behind=0 tracked=0 untracked=0` ; empty | ok |
| prompt carries the template contract | `diff <(head -140 prompt) templates/round-prompt.md` | only `{{LANE}}`, `{{ROUND}}`, `{{FLEET_ROOT}}` and `{{AXES}}` substitutions differ; the §6 hyaku addendum is appended at :141 | ok |
| cancelled seats not cited | `git grep -l <name> e42eba65 -- . ':!*.json'` for all 16 names | every name hits only `lessons/round-47.md:122-125` (the cancelled list). The three counter readings come from IRC messages of MutRouteAT802, MutRouteK488 and MutRouteCC879 (report:20, lesson:105-107), not from reports. Their `falsify/MutRoute*-M*.patch` files are committed but cited nowhere | ok, with defects R47-1 and R47-2 |
| timestamps vs commits | plan `## A1` / `## A2` headings against the commit times | A1 heading says "~10:45Z", but `796b49b4` was committed at 10:13:45Z. A2 heading says "~10:55Z", but `8de35e79` was committed at 10:40:32Z. Both headings are later than the commits that ship them | defect R47-3 (minor) |

Not a marker: nine lane commits carry checkable work.

## 2. Claim C1 — operability (`ROUTED_HELD`, five child-process sites through `cap-run` via `cap-spawn`)

**Re-measured by this session over committed bytes:**
- `git show <rev>:scripts/<s>.mjs | grep -c cap-spawn` for kimi-census, sources-check, claims-check and anchor-truth:
  0/0/0/0 at `0bd8be60`, 2/1/1/1 at `e42eba65`.
- `capSpawnSync` is called at the five named sites at the tip:
  - `kimi-census.mjs:502` (K488)
  - `sources-check.mjs:555` (SC549) and `:869` (SC859, the parity `sh -c`)
  - `claims-check.mjs:892` (CC879)
  - `anchor-truth.mjs:806` (AT802)
- `scripts/cap-spawn.mjs` is absent at base and 58 lines at the tip. `cap-run.mjs:96` reads `CONTRACT = 'kumitate-cap-run-v2'`.
- `git diff --stat 269dadb6 e42eba65 -- scripts SKILL.md corpus/QUALITY.md` is empty, so the scored bytes are the tip
  bytes.
- `sha256` of each `scripts/<name>.mjs` at `e42eba65` equals its SCORECARD `pin.<name>` for all 13 pins, including
  the new `pin.cap-spawn`.

So the routing exists in the code. Whether it holds at run time, as the counter judges it, is a separate question.

**Evidence-verified (counter receipts; this session did not run the counter):**
- Before: `probe/receipts/c1-base.txt` reads `CAPROUTE_PROBE rev=0bd8be60… held=0/5` exit=1, every site
  `ROUTED_MISS` (`no_cap_run_ancestor,…`).
- After: `close/c1-a2.txt` reads `CAPROUTE_PROBE rev=269dadb6… held=5/5 rule=A2` exit=0 (ends 10:48:27; committed
  in `f399fc60` at 10:48:35Z). That same receipt has `SITE AT802 … n=104 base_n=106 capped=104`: two of the base's
  AT802 execs were not observed, and the site still scored `ROUTED_HELD`.
- No other committed receipt scores `269dadb6`. `git grep -n 269dadb6 e42eba65 -- .ufo/waves/round-47` finds
  `CAPROUTE_PROBE` only in `close/c1-a2.txt`.
- The three re-runs, 3/5, 3/5 and 4/5, exist only as IRC readings quoted in `lessons/round-47.md:105-107`. Their
  seats were cancelled, and no receipt is committed (R47-1).

**Chronology — do A1 and A2 predate every candidate score? Yes.**

| step | commit time (Z) | what it records |
|---|---|---|
| freeze `cac43009` | 09:49:02 | the frozen counter |
| control CtlEnvCaps | committed with A1 | 5/5 under the freeze rule (`ctl-envcaps-frozen.txt`, exit=0) |
| A1 `796b49b4` | 10:13:45 | the counter re-designed; CtlEnvCaps then reads 0/5 under A1 (`a1-ctl-envcaps.txt`) |
| C1 commit `269dadb6` | 10:20:05 | the candidate lands, unscored |
| control CtlRetParse, scratch `259e967b` | committed with A2 | 5/5 under A1 (`a1-ctl-retparse2.txt`, exit=0) |
| A2 `8de35e79` | 10:40:32 | the counter re-designed; CtlRetParse then reads 3/5 under A2 (`a2-ctl-retparse2.txt`, exit=1) |
| A2 re-score `47e386fc` | 10:45:04 | every control, calibration, base and freeze receipt re-scored under A2 |
| first candidate score `f399fc60` | 10:48:35 | `close/c1-a2.txt` |

- The four ExecRoute* build reports state that the frozen counter was not run (`ExecRouteAnchor.md:4`,
  `ExecRouteClaims.md:78`, `ExecRouteKimi.md:137` and `ExecRouteSources.md:64`).
- CritChronology (`falsify/CritChronology.md:19,35`) also finds no score of the candidate before A2.
- Per plan:128-133, A2 adds conditions and removes none. Target, sites and kill rule are unchanged.
- Landing `269dadb6` before A2 is not a §9 breach. A2 can only make the counter stricter, so it cannot help the
  candidate.

**Verdict C1: not verified.** The author's single committed 5/5 is the only after-score, and that receipt itself
shows AT802 below its base exec count (104 < 106). The predicate asks that *every* site-child exec be seen inside
the runner chain. A run that misses execs therefore cannot show that predicate held. The author reports the
re-runs below 5/5, and nothing committed contradicts that. I confirm the author's own reading: C1 does not verify.
The integer stays at 9.

### Harm (HarmChecklists and HarmGates cancelled; ruled on what exists)

- `close/proxy-strict.txt`: `PROXY: MATCH (A=25 C=22 operability=9; C1=19/19 C2=106/106 coverage=10;
  S=88/88 coverage:script-layer=10; R=92/92 coverage:runtime-layer=10; K=53/53 coverage:kimi-layer=10; pins=6 match)`
  exit=0. The 13 pins also match the tip by this session's own `sha256` (above).
- The four routed selftests at `269dadb6` (`close/c1-a2.txt` SITE lines) give `cases=54/54, 46/46, 46/46, 47/47,
  44/44`, equal to `base_cases`, all with `gate_exit=0`. `cap-run --selftest` 12/12 (`build/ReviewCapRunV2.md:6`,
  `falsify/ReviewRouteAnchor.md:29`).
- Census exits 0 (below).
- `git diff 0bd8be60 e42eba65 -- SCORECARD.md`:
  - proxy terms A 21→25 and C2 104→106, consistent with the MATCH line
  - nine re-pinned hashes and a new `pin.cap-spawn`
  - one `| 47 |` move-log row, an appended `## Round 46 correction` and a `## Round 47` section
  - no axis value is lowered
- **Not observed:** no checklist-harness run exists at `269dadb6`. SCORECARD's Round 47 section states that routed
  selftests take about 2–4× longer. Checklist items carry a fixed 120 s budget, so this is an unprobed risk, not
  observed harm (R47-4).
- **Ruling:** no axis harmed on the committed evidence.

## 3. Axis verdicts

- **operability — unprovable.** The routing is present (re-measured), but the claim's counter after-state does not
  reproduce. The integer is held at 9.
- **coverage — unchanged.** coverage=10; script-, runtime- and kimi-layer each 10/10 (`close/proxy-strict.txt`).
- **No axis harmed** (see Harm).

## 4. R46-1 repair — were the original bytes restored, and was anything rewritten?

Re-measured by this session: parse every `| S### |` row of `corpus/SOURCES.md` at `2b2bf7bb`, `0bd8be60`, `269dadb6`
and `e42eba65`, then compare cell by cell. Row counts are 77, 79, 95 and 97.
- The immutable cells (`id`…`teaches`, `opened`) of all 13 rows (S003, S004, S013, S041, S047, S051–S055, S061,
  S073, S076) equal the `2b2bf7bb` cells.
- Their `status`, `recheck` and `used-by` cells equal `0bd8be60`.
- 12 of the 13 rows are byte-identical whole rows to `2b2bf7bb`. S076 differs only in `used-by`, a round-46 change
  that Rule 2 allows.
- No other pre-existing row changed between `0bd8be60` and `e42eba65`, and no row was removed.
- The 18 new rows are S080–S097. Each `supersedes` row points at the right target: S080→S003 … S092→S076,
  S096→S083, S097→S085.
- Between `269dadb6` and `e42eba65` no row changed, and only S096 and S097 were appended. S083 and S085 were corrected
  by appended rows, not rewritten.
- Evidence-verified: `close/q35.txt` reads `2b2bf7bb→269dadb6 rewritten=0` and `0bd8be60→269dadb6 rewritten=13`. The
  13 are exactly the restored rows. QUALITY Q35 is at `corpus/QUALITY.md:700`.

**Confirmed:** the restore returned the original bytes, and nothing was rewritten.

## 5. Discernment spot-check (`lessons/round-47.md` § Gate and report § Gate)

Re-fetches by this session (2026-10-23, about 11:00Z):
- `curl -fsSL` of the raw bwrap.xml v0.13.1 → sha256 `2cb77df2…40f5be1da`
- raw kimi-code `b5e28fd6…/sessionLockService.ts` → `acbcdd38…c867ad08`
- `curl -sSL https://git-scm.com/docs/gitrepository-layout/2.56.0` (one 301 to `…/2.56.0/`) → 632 bytes,
  `c4cd4197…2d79ca5`
- `curl -fsSL -A Mozilla/5.0` of the CircleCI article → `814548b7…a086f2`

| item | gate decision | re-opened source | agree / disagree | reason |
|---|---|---|---|---|
| S095 (lesson:43) | admit A, mined | bwrap.xml v0.13.1; sha256 = the row's pin | agree | :253-254 read "These are applied in the order they are given as arguments." verbatim (11 words). `cap-run.mjs` places `--bind` after `--tmpfs /tmp` on exactly this rule |
| S092 (lesson:40) | reject A (kept) | git-scm 2.56.0 → 632-byte page; sha256 = pin | agree | :7 `<meta http-equiv="refresh" content="0; url=…/2.49.0">`. `grep -c objects` = 0, so there is no manual text. The reason stands |
| S083 locators (report:94) | reject; S096 supersedes | sessionLockService.ts; sha256 = pin | agree | :55 holds `this.lockDir = join(…'locks', 'sessions')`, :196 `mkdirSync(… mode: 0o700)` and :201 the `.lock` path. :61 is `const token = …`, :202 `}` and :207 `ISessionLockService,`. S083's 61/202/207 are wrong, and S096's 55/196/201 are right |
| S085 hash (report:95) | reject; S097 supersedes | CircleCI article; sha256 = S097's 64-hex value | agree | S085 records 63 hex characters, the same value minus its final `2`. The quote "A floor of 60–80% on high-risk modules is the realistic target." is present in the bytes |
| C1 itself (report:96) | reject (not reproduced) | `close/c1-a2.txt` | agree | AT802 `n=104 base_n=106` in the passing run (§2) |

New-row quote check: S095's quote "These are applied in the order they are given as arguments." is 11 words, which is
≤25, and verbatim at bwrap.xml:254. Its used-by paths `scripts/cap-run.mjs`, `scripts/cap-spawn.mjs` and
`corpus/lessons/round-47.md` exist at the tip.

Census: `scripts/sources-census.sh validate --root /home/vgpnk/Projects/shokunin kumitate` prints W04 S034, S068,
S084 and S095, then `kumitate ok …/corpus/SOURCES.md`, exit=0 (10:59:41Z). This is identical to
`close/census-close.txt`.

## 6. Trend verdicts

- **expansion — unprovable-but-better.**
  - For: S093–S095 are new tier-A rows, opened this round and mined by code (`cap-run.mjs`, `cap-spawn.mjs`, the
    counter). Runner contract v2 now routes five gate sites.
  - Against: no `knowledge/` entry was admitted (`git diff --stat 0bd8be60 e42eba65 -- corpus/knowledge` is empty),
    and no capability row was added. CORPUS rule 4 says "Expansion is knowledge, not rows", and the routed after-state
    is unverified.
- **quality — improved.**
  - The 13 in-place rewrites were restored byte-exact (§4) and their corrections were appended as `supersedes` rows.
  - Two re-open defects (S083, S085) were corrected append-only; the spot-check agrees with both.
  - Q35 was shown able to fail.
  - No admitted entry was found false and left unmarked. The S093 `-f` range and the lesson's S085 word count are
    recorded in the lesson at :120-121.
  - One overstatement: report:76 says "All 16 new rows were re-opened by non-authors", but S084, S091 and S092 have no
    re-open report (R47-2).
- **discernment — improved.**
  - The spot-check agrees with the gate on 1 admit and 4 rejects.
  - Two counter shortcuts were caught before data, each with a red-before and a re-scored receipt: CtlEnvCaps 5/5→0/5
    and CtlRetParse 5/5→3/5.
  - The lane rejected its own C1 when re-runs disagreed, and it recorded the class as Mistake 3 with a fix that is
    shown able to fail.

## 7. Routed defects (the lane fixes these next round)

- **R47-1. Re-run readings not committed.** The 3/5, 3/5 and 4/5 that decide C1 are IRC quotes from three cancelled
  seats (lesson:105-107). Fix: commit repeated A2 runs at `269dadb6` (or its successor) as receipts. Adopt Mistake 3's
  repeat-run and exec-count-equality rule before the next freeze.
- **R47-2. Misstatements in the filed report and SCORECARD.** Append errata; do not rewrite.
  - Report:11 says "Every control was re-scored under A2: all read 0/5". SCORECARD `## Round 47` says "all fourteen
    controls read 0/5 under A2 (… `a2-ctl-retparse2.txt`)". In fact `a2-ctl-retparse2.txt` reads `held=3/5 rule=A2`,
    and calibration `d066e8cc` reads 1/5 in `a2-controls.txt`. Plan:135 states the 3/5 correctly.
  - Report:76 says "All 16 new rows were re-opened by non-authors". S084, S091 and S092 have no re-open report.
  - ReopenS088 is listed as cancelled (report:105, lesson:124), yet `falsify/ReopenS088.md` (HOLDS) is committed in
    `67ebb32d`. Reconcile which is true.
- **R47-3. Future-dated amendment headings.** Plan `## A1 (~10:45Z)` and `## A2 (~10:55Z)` are later than their
  commits (10:13:45Z and 10:40:32Z). Fix: an appended correction line.
- **R47-4. Harm unprobed.** No checklist-harness run exists at `269dadb6`; HarmChecklists and HarmGates were
  cancelled. The routed selftests run about 2–4× slower against 120 s per-item budgets. Fix: run
  `surface-probe --checklists` at base and tip under recorded load, and commit both receipts before routing more sites.
- **R47-5. Counter observation gap.** A2 scores `ROUTED_HELD` with `n < base_n` (AT802 104/106). The root cause is
  open, because ReviewCounterA2 was cancelled. CritChronology's two static objections are open: A1 narrows the
  checked execs to five signatures, and the summary line is not tied to the owning gate.
- **SHONEN** (operator note): no box is fully checkable by a non-author from this round. The two `[~]` lines are
  author-asserted, and what I observed matches them: SKILL.md is unchanged, and LOG.md:1918 holds the round-47 entry
  with close receipts.
