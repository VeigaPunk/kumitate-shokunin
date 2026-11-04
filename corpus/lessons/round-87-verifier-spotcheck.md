# kumitate round 87 — non-author verifier spot-check

author: hyaku closure (non-author integrator, @m_zfl)

Closed 2026-11-04 against lane HEAD `71efd992093161b872a8989c957253bc9427e076` (base
`db97929212bb61ae970b10abac3cc4cd976713ae`, freeze `25a3a75df123a59c5cf0de944a6d2f067e278f82`, measured
revision M `d3f64dc43027a9754700e70129b6ba91deaada19`). Report `.ufo/reports/round-87/kumitate.md`
(fleet repo). Driver digest (copied from the mutable `.ufo/watchdog.log`):

```
2026-11-04T18:20:51-03:00 launch kumitate round=87 pgid=567931 driver=hyaku-inline attempt=1
2026-11-04T18:50:35-03:00 complete kumitate round=87; hyaku-inline attempt=1
```

## 1. Conformance (step 1)

| check | command | observed | result |
|---|---|---|---|
| report landed by lane | `git log --format='%an %H' -- .ufo/reports/round-87/kumitate.md` | `kumitate-shokunin 89b3e82e…` (report) and `kumitate-shokunin cc00ba18…` (appended erratum; `git diff cc00ba18~1 cc00ba18` deletes 0 lines) | ok |
| SHONEN heading | read report `## SHONEN` | 4 lines, all `[~]`; `grep -c '^- \[' SHONEN.md` → 4 | ok |
| cited commits exist + ancestry | `git cat-file -t` + `merge-base --is-ancestor <h> refs/heads/master` for db979292, 25a3a75d, d3f64dc4, 71efd992 | all `commit`, all ancestors | ok |
| lane pushed, clean | `jj-lane.sh state …` | `ahead=0 behind=0 tracked=0 untracked=0`, local = remote = `71efd992…`; `status --porcelain` → 0 lines | ok |
| prompt carries contract | `.ufo/prompts/kumitate-round-87.md` (826 L, committed by kumitate-shokunin `00e34a6e`) | MISSION/AXES binding (l.5), §2b frontier step (l.42), ≥8 L2 batched (l.82), report path (l.101), SHONEN (l.118), commit/push scope/L0 (l.131–139), write scope (l.448), hyaku addendum §6 (l.141) | ok |
| marker? | — | real report naming committed work hashes | not a marker; status `ok` |
| append-only files | `git diff --numstat db97929 71efd99` deletions | only `SCORECARD.md` (7, pinned accounting lines), `SKILL.md` (1), `scripts/readme-map.mjs` (2), `.ufo/pins/readme-map.json` (15); LOG/SOURCES/QUALITY 0 deletions | ok |

## 2. Claims

One declared claim. **C1 operability — capability acquisition `receipt-bind`; lane-reported UNMET
(kill rule fired) → rejected-honest-stop.**

Re-measured (plain, my own script — sha256 of `git cat-file blob <rev>:<cmd token 2>` vs each
receipt's `tool_sha256=`; I did not execute the lane's gate or probe):

- round-87 `close/` receipts at M: 12 files, 11 lane-hashed `match` + 1 external (`census.txt`,
  disk hash `match`) → **12/12 bound**. Agrees with the instrument's intended verdict.
- round-86 `close/` receipts at M: 10 files → 1 `match` (`selftest.txt`), 8 `mismatch`, 1 external
  `mismatch` (`census.txt`). Agrees with `DRIFT matched=1 mismatched=9 … external=1`
  (`close/c1-probe.txt:6`). Same picture at base `db979292` (8 mismatch + external + 1 match): the
  R86-D1 defect is real in the committed round-86 bytes.

Evidence-verified (committed receipts, not executed):

- frozen kill rule `plan.md:31-33` at freeze `25a3a75d`: any seat-constructed control reaching 12/12
  makes C1 UNMET.
- `build/K87Critic/transcript-cand-a-worktree.txt` → `C87_C1: HELD held=12/12` (worktree-hashing
  candidate); `transcript-cand-e-hardcoded-r86.txt` → `HELD held=12/12`;
  `build/K87Review/receipts/probe-dirkey-afterstate.txt` → `HELD held=12/12`. Kill rule fires; UNMET
  is the correct ruling.
- integrated instrument: `close/c1-probe.txt` → `C87_C1: HELD held=12/12` exit 0;
  `close/bind-selftest.txt` → `RECEIPT_BIND_SELFTEST: PASS held=39/39`; pre-data controls
  `controls/{base,stub-clean,constant-drift,path-keyed}.txt` → 0/12, 0/12, 1/12, 3/12 (match report).
- `close/plan.txt` → `PLAN_BEFORE_READY: FAIL … reason=MAP_DRIFT` at M (lane-disclosed red gate).

Axis harm: `git diff db97929 71efd99 -- SCORECARD.md` → +69/−7; the removed lines are the accounting
pins (`A=35`, `C=45`, `C2=219`, two pin digests) re-stated as A 36 / C 46 / C2 222; stanza states
operability 9 unchanged and every coverage sub-axis 10 unchanged. No capability row credited.

| axis | verdict | basis |
|---|---|---|
| operability | unchanged | claim UNMET by frozen kill rule; integer 9 unchanged; no capability row |
| coverage | unchanged | no claim; sub-axes stay 10 |

## 3. Discernment spot-check

| item | decision | re-opened source | agree/disagree | reason |
|---|---|---|---|---|
| S250 in-toto Statement v1 | admit (A, mined, Q80) | `https://raw.githubusercontent.com/in-toto/attestation/main/spec/v1/statement.md` fetched 2026-11-04 | agree | live text: "binding it to a particular subject and unambiguously identifying the types of the [Predicate]" (lane quote drops the link brackets only; 15 words ≤ 25); same file: "Each element MUST have `digest` set" and "Subject artifacts are matched purely by digest". Primary spec, normative, directly grounds Q80. Capture sha256 `cbe684a1…` matches the row. |
| S251 Sigstore cosign verify | reject (B) | `https://docs.sigstore.dev/cosign/verifying/verify/` fetched 2026-11-04 | agree | quote present verbatim: "Signature payloads created by cosign included the digest of the container image they are attached to" (17 words). It binds signature→artifact, not receipt→verifying instrument; the stated flip condition is precise. Capture sha256 `cddc1582…` matches. |

New-row quote check: S250 row (`corpus/SOURCES.md:205`) claim/quote re-located live as above. Census:
`sources-census.sh validate --root /home/vgpnk/Projects/shokunin kumitate` → 7 `W04` (pinned),
`kumitate ok …/corpus/SOURCES.md`, exit 0. Rows 187 → 189 consistent with S250/S251.

## 4. Trend verdicts

- **expansion — unchanged.** +1 admitted row in a band the map already holds, +1 reject, no
  frontier area entered, no capability row, assimilation none. Agrees with lane.
- **quality — improved.** Independently re-derived: a drift class invisible before (8/10 round-86
  receipts bind to a different instrument than their `cmd=` names) is now detected, round-87 receipts
  bind 12/12, Q80 adopted, readme-map fix with selftest arm. Tempered by defect K87-V1 below.
- **discernment — improved.** 2/2 sampled gate decisions agree; the round honoured its frozen kill
  rule against its own predicate instead of narrowing it; in-round self-corrections recorded.

## 5. Routed defects (lane fixes next round)

- **K87-V1 (receipt attribution).** Report l.36–38, `LOG.md:3004`, `SCORECARD.md:4255` cite
  `RECEIPT_BIND: CLEAN matched=12 … external=1` for the round-87 receipts, but no committed receipt
  prints it: `close/bind.txt` prints `CLEAN matched=10` (taken before the last receipts) and
  `close/c1-probe.txt` arm clean-r87 prints `matched=11`. The report also attributes the round-86
  `DRIFT matched=1 mismatched=9` line to `close/bind.txt`; it lives in `close/c1-probe.txt:6`. Fix:
  commit a post-battery `receipt-bind` receipt over `close/` at M, or append a named correction.
- **K87-V2 (red gate).** `plan-before-ready` FAIL `MAP_DRIFT` at M (`close/plan.txt`); lane-disclosed.
- **K87-V3 (open carry).** R86-D2/R86-D3 unaddressed (seat `K87ExecSources` dead); remain open.
- **K87-V4 (predicate nondeterminism).** `build/K87Review/receipts/probe-arm12-nondeterminism.txt`:
  probe87 arm 12 (`random-fixture`) picks differ across identical runs (4–5/12 swings); a round-88
  predicate must seed or enumerate the fixture pick.
- **K87-V5 (process).** Round-start census was not run (lane's own erratum, appended after filed
  bytes); the base-revision reconstruction is acceptable evidence; noted, not status-bearing.

Operator note: SHONEN boxes 1, 2 and 4 (SKILL.md registry/checklist, LOG end-to-end task,
PROVINCE untouched) look checkable by a non-author from committed bytes; promotion stays
operator-owned.
