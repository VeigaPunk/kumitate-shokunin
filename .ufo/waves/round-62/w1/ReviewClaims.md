# ReviewClaims — round-62 counter/claim freeze review (findings only)

Reviewer: L1Kumitate62.ReviewClaims (sub). Scope: predicate/counter equality, kill conditions,
version pinning, revision source, do-nothing and forged fixture controls for the round-62
target counters. No verdict on round-62 claims; no edits to frozen plan/counters. No tool
installs performed (none needed).

## 0. What round-62 froze locally

- The lane holds `.ufo/waves/round-62/{baseline,bundlescratch,close,controls,plan,probe,w1,w2}`.
  `plan/` is empty: no local round-62 plan file exists; claims are frozen only in the parent
  plan (fleet). `git status` shows `.ufo/waves/round-62/` entirely **untracked** (worktree-only).
- Committed round-62 control receipts:
  - `controls/forged-control-before.txt` — label "C2 forged control baseline".
  - `controls/forged-control-counter-before.txt` — `DOCTRINE61: DOCTRINE61_HELD held=6/6
    checks=6 rev=4247d2da937842bd6846874d548b7125b356e14c rule=D61` (E1..E6 all PASS).
  - No honest control is committed in round-62 `controls/`; the honest-type comparison lives in
    round-61 controls (`ctl-c2-critic-a0-honest-row-vacuity.txt`) and in the round-61 tip
    receipts (`close/a2-tip-doctrine61.txt`).
- Round-62 probes are byte-identical copies of the round-61 frozen probes:
  - `probe/dispatch61-probe.mjs` sha256 `02028d11b9b05d952df421b030be919e2af1bf77101d302c06a8b0a718c9a89f`
  - `probe/doctrine61-probe.mjs` sha256 `e638e2b932f9d1552484c428131f73ad7efef663b273bad72e1581a30efa1965`
  (both equal the round-61 `probe/` files).
- Surfaces implied by the routed defects: (R61-V2) frozen counters must read committed revision
  bytes only; falsifiers must beat forged input and honest input. (R61-V6) dead Audit19 must be
  re-queued.

## 1. C1 — DISPATCH61_HELD (P61 v1)

### 1.1 Predicate vs counter equality
- P2 plan sentence requires "≥32 non-empty `<seat>.md` seat report files" verified via
  `git ls-tree -r --name-only <rev>`. The probe (`dispatch61-probe.mjs` lines 17-21) counts any
  `.md` file directly under `…/w1/` whose name matches, with no size/content check and no
  seat-name cross-check. Non-emptiness is enforced only transitively by the *worktree* gate run
  (the gate's `REPORT_ABSENT` uses `statSync(...).size > 0`, `dispatch-evidence.mjs` line 120),
  never from the rev tree.
- P3 plan sentence: "evidence pointer names round 61 (first-working round 61)". Probe regex
  requires literal `round 61` in the first pipe-row of the SCORECARD capabilities table that
  contains `dispatch-evidence`. The committed SCORECARD row names **"first working round 60"**
  and a round-60 live record (verified at HEAD line 1794; no `round 61` substring). P3 therefore
  cannot pass on the genuine state even when the row exists. Receipt confirms: `close/a2-tip-
  dispatch61.txt` → `P3 MISS` at rev 019a844.
- P4 plan sentence: "`.ufo/waves/round-61/close/dispatch61-tip.txt` exists at the measured
  revision and contains the same CLEAN line." Probe reads the **worktree** path
  (`readFileSync(join(lane,'.ufo','waves','round-61','close','dispatch61-tip.txt'))`). No such
  file exists at HEAD (`git ls-tree -r --name-only HEAD -- …/close/` lists only
  `a2-tip-dispatch61.txt`, `a2-tip-doctrine61.txt`, `a2-tip-proxy.txt`, repros, census, results).
  P4 is unholdable for the honest state as committed, and is worktree-sensitive for any state.
- Kill rule: any check MISS → fail as declared; verdict `held=N/M`, exit 0 iff all pass. The
  kill/exit semantics match the plan text; the defect is in what the checks measure, not in the
  kill logic.

### 1.2 Revision source / version pinning
- P1 spawns `node <lane>/scripts/dispatch-evidence.mjs --selftest` from the **worktree** path
  (no rev). P2 runs the gate against the **worktree** wave directory. P3 is the only check that
  reads rev bytes (`git show <rev>:SCORECARD.md`). P4 reads worktree bytes. A dirty worktree can
  flip P1/P2/P4 verdicts for a fixed rev without any tree change (e.g., deleting
  `launcher-progress.tsv` yields fail-closed; planting a report or close receipt yields PASS).

### 1.3 Do-nothing control
- `controls/ctl-c1-critic-a4-full-fabrication.txt` (and `close/a2-repro-c1-fabrication.txt`):
  scratch git repo containing a fabricated scorecard row, 32 one-line fabricated seat reports, a
  hand-written `launcher-progress.tsv` with fabricated session ids, a hand-written
  `dispatch-actual.json`, and a fabricated `close/dispatch61-tip.txt` holding the CLEAN line; no
  seat ever ran, no real dispatch record exists → probe prints `DISPATCH61_HELD held=4/4` exit 0.
- Cause: the gate (`dispatch-evidence.mjs` `inspect`) verifies only internal consistency among
  progress rows, registry, and report-file presence/non-emptiness. Any non-null session string
  counts (only `null`/absent trips `NOT_A_DISPATCH`, lines 130-135); pid/exit columns are not
  cross-checked against any launcher log or stream. Round-60 per-seat stream files exist
  (`w1/<Seat>.stream.jsonl`, referenced by `dead-seats-r60.md`) and a launcher log exists, but
  the gate never reads them — so stream/history-backed evidence could distinguish fabrication but
  is not consulted.

## 2. C2 — DOCTRINE61_HELD (D61 v1)

### 2.1 Predicate vs counter equality — E3 row parsing
Contract: registry rows have 11 cells (`| id | source | kind | tier | scope | anchor | teaches
| status | opened | recheck | used-by |`), verified in `corpus/SOURCES.md` header at HEAD and
by census NF=13 counting.

Probe E3 (lines 16-18) uses:
- `row.match(/^\|[[:space:]]*S195[[:space:]]*\|/)` — JavaScript has no POSIX `[[:space:]]`;
  the pattern is a literal class of `{[, :, s, p, a, c, e, ]}` plus `*`. Empirical replay
  (node, exact probe regex):
  - honest row `| S195 | …` → **no match** → `E3 MISS row-absent`;
  - probe-shaped lookalike `|:S195:| …` → **match** → `E3 PASS`.
- Column indices `c[9]/c[10]/c[12]` (after `split('|').map(trim)`). On the 11-cell contract row:
  `c[9]='2026-10-25'`, `c[10]='90d'`, `c[12]=''` (status/opened/used-by live at
  `c[8]/c[9]/c[11]`). On a 12-cell lookalike the probe's expected triple `mined / 2026-10-25 /
  <entry path>` lines up exactly.
- Consequences: E3 cannot pass on any genuine registry row, and passes on a syntactically
  lookalike row — including one placed **outside** `## Registry` (see 2.5). The probe's row
  search scans the whole file, never anchoring to the `## Registry` section.

### 2.2 E4 — capture pin
- Capture hash is computed over the **worktree** file
  `join(lane,'.ufo','waves','round-61','build','ScoutSourceWorkerVersioning','body.md')`
  (`readFileSync`), while the pin is parsed from the rev row. If the row is not found, E4 reads
  `pin=''` and MISSes (honest state) even though the genuine committed capture exists.
- Comparison is `pin.includes(sha.slice(0,16))` — only the first 16 hex chars (64 bits) of the
  sha256 are matched. A fabricated capture whose bytes the forger chooses can be self-pinned with
  full consistency (control `a1b-fabricated-capture`: HELD 6/6 on invented bytes; no fetch).
- Genuine state at HEAD: `body.md` sha256 = `8ef2ee5f5e196d9d14fc8c85449442764e812f3e4f0f6e2bb1bdc12895f0f8fc`
  and the committed S195 row pins exactly `sha256 8ef2ee5f…` — so E4 would pass if E3 found the
  row; E3's failure makes E4 MISS (`pin= sha=8ef2ee5f…` in `close/a2-tip-doctrine61.txt`).

### 2.3 E5 — census root and revision
- Probe runs `sources-census.sh validate --root <censusRoot||lane> kumitate`. The plan's counting
  command (`node …/doctrine61-probe.mjs <lane> <rev>`) omits `--census-root`, so the default
  root is the **lane**, not the fleet: `validate --root <lane>` fails
  (`ERROR: config not found: …/shokunin.conf`, `ERROR: unknown lane …`, exit 2). E5 therefore
  MISSes under the documented counting command for any state (receipts: `ctl-c2-critic-a6-default-
  census-root.txt`, `close/a2-tip-doctrine61.txt` E5 `exit=2`). Only the `counters.sh` pack adds
  `--census-root $FLEET`.
- E5 evaluates the **worktree** registry, not the rev tree: control `ctl-c2-critic-a4-e5-
  worktree-not-rev.txt` commits a malformed row and restores the worktree; census of the worktree
  says `ok` exit 0 while census of the committed tree (`git archive <rev>`) reports
  `E01 S195 fields=12` exit 1. E5 cannot detect a revoked/malformed row.

### 2.4 E6 — revision mix
- `mapped` comes from `git show <rev>:corpus/README.md`; `node scripts/readme-map.mjs` runs in
  the **worktree** (`cwd: lane`). Same worktree/rev mixing as elsewhere.

### 2.5 Forged vs honest controls (the inversion)
- Forged (all HELD 6/6, exit 0):
  - `ctl-c2-critic-a1b-fabricated-capture.txt` (invented capture bytes, self-pinned),
  - `ctl-c2-critic-a5-full-forgery-held.txt` (header-only entry rewrite, fabricated body.md,
    probe-shaped phantom `|:S195:|` row outside `## Registry`, README row),
  - `close/a2-repro-c2-forgery.txt` (same commit `4247d2d` in a clean checkout),
  - round-62 `controls/forged-control-counter-before.txt` (rev `4247d2da937842bd6846874d548b7125b356e14c`,
    HELD 6/6) — the committed forged baseline for this round.
- Honest (UNMET):
  - `ctl-c2-critic-a0-honest-row-vacuity.txt`: fully honest build (contract-shaped 11-cell row,
    real capture, real pin, re-grounded entry, README row) → `held=4/6`, E3/E4 MISS solely
    because the probe rejects the genuine row format;
  - `close/a2-tip-doctrine61.txt` at genuine rev 019a844 → `held=3/6` (E3/E4/E5 MISS).
- Net effect: a falsifier must **forge the row's shape** (12 cells, `:` after the pipe) for the
  probe to notice the row at all, and the census accepts that same malformed row only when placed
  outside `## Registry` (control `a3` variant 5: escape=0; variant 4 inside `## Registry`:
  `E01 fields=12`). The counter therefore fails both directions the falsifier requirement
  demands: it does not beat honest input (rejects it) and does not beat forged input (accepts it).

## 3. Kill conditions / exit semantics
- Both probes print `…_HELD`/`…_UNMET`, `held=N/M`, and exit 0 iff no MISS. Verified consistent
  with the plan's "any check MISS → fails as declared". No kill-condition ambiguity beyond the
  measurement defects above.

## 4. Audit19 (R61-V6)
- w2-spec.json item `Audit19` (role reviewer; axes operability/coverage) prompt (verbatim):
  "**Round60-DeadTable — Audit `.ufo/waves/round-60/close/dead-seats-r60.md` against committed
  progress, stream files and launcher log: count 32/5/27, full errors no truncation, traceback
  exact.**"
- w2-dispatch.json `Audit19` entry: `kind=spawn`, role reviewer, axes operability/coverage.
- Result: `close/w2-results.json` member Audit19 → `status: "failed"`, `exit: 1`,
  `error: "provider rejected task prompt as invalid_prompt"`. No `Audit19.md` exists in w2/
  (23 of 24 audit seats landed a report; commit message records "w2 39/40 seats with Audit19
  dead"). The seat `L1Kumitate61.Audit19` must not be revived; re-queue the item with the same
  prompt to a fresh seat writing `…/round-62/w2/Audit19.md`.
- Target artifact exists and is intact: `.ufo/waves/round-60/close/dead-seats-r60.md`
  (13,270 bytes), whose own provenance header already models the desired discipline — derived
  only from committed blobs at `HEAD=be4a820` via `git show HEAD:<path>`, counts 32 seats/5
  exit-0/27 dead (-9), full error/no-truncation/traceback checks, and a window. The claimed
  counts (32/5/27) and the launcher `SEAT_TIMEOUT=420` kill mechanism are documented there.

## 5. Adjacent artifact (bundle)
- `controls/r61-c2-full-forgery.bundle` exists (untracked): 16,488,385 bytes, sha256
  `c5c0154010d5becc752179bee2cbf81c8fb5dc8a8bd7ed8debb2a20ec9f0526b`, mtime 2026-10-25 10:19,
  consistent with the a2 full-forgery repro. Full bundle/commit/tree verification is the sibling
  AttackC1C2 surface (per wave routing); only existence/hash/size are recorded here.
- C2 fixture clone `/tmp/kumitate-r61-a2/fleet/kumitate-shokunin` exists (with `.git`), matching
  the a2 repro paths; usable by the bundle lane.

## 6. Concrete follow-up requirements (findings, not edits)
1. R61-V2 counters: evaluate P1/P2/P4 and E4/E5/E6 against **rev material only** (export
   `git archive <rev>` to a temp tree and run against it; or read every byte via
   `git show <rev>:<path>`). E5 must run census against the exported rev tree with an explicit
   fleet `--census-root`; the plan's documented counting command must either pass that flag or
   the E5 default must be corrected.
2. E3: replace the broken regex (`/^\|[[:space:]]*S195[[:space:]]*\|/`) with a correct
   whitespace class, anchor the search under the `## Registry` section, and read the 11-cell
   contract columns (status `c[8]`, opened `c[9]`, used-by `c[11]`), or validate via the census
   NF=13 semantics. Align with census scoping (rows outside `## Registry` are ignored by census
   and must be ignored by the probe).
3. E4: compare the full 64-hex sha256 pin, not `pin.includes(sha.slice(0,16))`; read the capture
   from the rev tree.
4. P3/P4: make the SCORECARD row text and the probe regex agree on the round reference ("round
   61" vs the committed "first working round 60"); require `close/dispatch61-tip.txt` to exist
   at rev and read its bytes from the rev.
5. The gate should cross-check progress session ids against per-seat stream/launcher-log
   evidence (available in-repo) so `NOT_A_DISPATCH`-class fabrications with any non-null session
   string cannot produce CLEAN.
6. Re-queue Audit19 with the same prompt to a fresh seat (do not revive
   `L1Kumitate61.Audit19`); report to `…/round-62/w2/Audit19.md`.
7. Commit the round-62 control receipts (currently untracked) and add an honest-state control
   (e.g., real lane HEAD run) beside `forged-control-(counter-)before.txt`.
