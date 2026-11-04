# kumitate round 88 — non-author verifier spot-check

author: hyaku closure (non-author integrator, @m_zfl)

Closed 2026-11-04 against lane HEAD `4f7d8ea9f5e314f7a76d8687a16b14ef752bdbe6` (base
`7ac24afa477a44304a3b125e320ef86929218189`, freeze `114877a308ffc0bcd63e354bcef03e6b9fe538d4`, measured
revision M `7817d20093015866a419f865fd2e0085195873a9`). Report `.ufo/reports/round-88/kumitate.md`
(fleet repo). Driver digest (copied from the mutable `.ufo/watchdog.log`):

```
2026-11-04T18:54:48-03:00 launch kumitate round=88 pgid=1608695 driver=hyaku-inline attempt=1
2026-11-04T19:44:10-03:00 complete kumitate round=88; hyaku-inline attempt=1
```

## 1. Conformance (step 1)

| check | command | observed | result |
|---|---|---|---|
| report landed by lane | `git log --format='%an %H' -- .ufo/reports/round-88/kumitate.md` | `kumitate-shokunin <kumitate@shokunin.local> 673790f36b36a91d75da6ca62e07cfaa610b4c35` (2026-11-04 19:43:08 -0300); ancestor of `origin/master` | ok |
| report lands last | lane `git log --date=iso` vs report commit | lane final `4f7d8ea9` 19:42:48 < report 19:43:08 < `complete` 19:44:10; report cites `4f7d8ea9` = lane HEAD | ok |
| SHONEN heading | read report `## SHONEN` | 4 lines, all `[~]` with pointers; `grep -c '^- \[' SHONEN.md` → 4 | ok |
| cited commits exist + ancestry | `git cat-file -t` + `merge-base --is-ancestor <h> master` for `114877a3`, `8735f70f`, `0ff3562f`, `8e4ea5f6`, `7817d200`, `4f7d8ea9` | all `commit`, all ancestors of `master` | ok |
| lane pushed, clean | `jj-lane.sh state …/kumitate-shokunin` | `branch=master local=4f7d8ea9 remote=4f7d8ea9 ahead=0 behind=0 head=detached tracked=0 untracked=0`; `git status --porcelain` → 0 lines | ok |
| prompt carries contract | `.ufo/prompts/kumitate-round-88.md`, committed by `kumitate-shokunin` `fa2db436` | §1 MISSION/AXES (l.3), §2 claims 1–3 + lowest axis (l.9–41), §2b frontier (l.42), §3 ≥8 L2 one batch + godspeed (l.80), §4 report contract incl. SHONEN (l.99–130), §5 commit/push scope/L0 (l.131–140), hyaku addendum §6 (l.141), scratch §7 (l.677) | ok |
| L2 route map vs MISSION | prompt §3 + `MISSION.md:53-65` | prompt names no model alias and routes through the host table; MISSION bucket unchanged | ok |
| marker? | — | real report: 6 cited lane commits, 7 evidence dirs, per-claim counting commands | not a marker; status `ok` |
| append-only / in-place edits | `git diff --numstat 7ac24afa 4f7d8ea9` | LOG.md +29/−0, QUALITY +48/−0, SOURCES +4/−1 (S218 `used-by`, logged old→new in the lesson), SCORECARD +63/−4 (A_wave, C2, C2_total, `pin.receipt-bind` — pinned accounting), SKILL +2/−2 (v1 row and checklist item replaced), knowledge +143/−1 (`source:` line extended with S252/S253) | ok |

Disclosed, status-neutral conformance defects are routed in §5.

## 2. Claims

One declared claim. **C1 operability (lowest non-retired axis) — capability acquisition `receipt-bind`
v2; lane-reported UNMET (frozen kill rule fired) → rejected-honest-stop.**

Re-measured myself (read-only; the frozen *scorer* re-run in my own scratch `/fast/scratch/hyaku/kumitate-r88-verify`;
no lane gate was executed, no lane file written):

| item | command | observed | agrees with report |
|---|---|---|---|
| scorer frozen | `git show 114877a3:<probe> \| sha256sum`, `git show 4f7d8ea9:<probe> \| sha256sum`, `sha256sum` on disk; `git diff 114877a3 4f7d8ea9 -- <probe>` | `5ccd01ec…c6739d2b` at freeze = at final = on disk; empty diff; `grep -c '^  arm('` → 20 at both | yes (20-arm frozen probe, unedited) |
| before (do-nothing = v1 at freeze, `git show 114877a3:scripts/receipt-bind.mjs` sha `b640ff31…`, the pre-round pin) | `node <probe> --lane … --work S/base --rev 114877a3 --tool S/base-v1.mjs` | `C88_C1: UNMET held=16/20` exit 1; `RECEIPT_BIND_SELFTEST: PASS held=39/39` | yes (`controls/base-v1.txt`) |
| after at M | `node <probe> --lane … --work S/integrated --rev 7817d200` | `C88_C1: HELD held=20/20` exit 0, 20 `ARM` lines | yes (`close/c1-probe.txt`) |
| worktree twin at M | `make-worktree-variant.mjs` on `git show 7817d200:scripts/receipt-bind.mjs` → sha `54962fa2…c30da1aa` = the receipt's `twin_sha256`; `node <probe> … --tool S/twin-M.mjs` | `C88_C1: UNMET held=11/20` exit 1 | yes (`close/twin.txt`) |
| kill rule, construction 1 | `node <probe> --rev 0ff3562f --tool build/K88Critic/cand/f5-loose-limit.mjs` | `C88_C1: HELD held=20/20` exit 0 — limit 2000000 instead of the claimed 1048576 | yes (`build/K88Critic/SCORES.md`) |
| kill rule, construction 2 | `node <probe> --rev 0ff3562f --tool build/K88Critic/cand/c2-head-default.mjs` | `C88_C1: HELD held=20/20` exit 0 — `HEAD:` read when a receipt has no `rev=` | yes (`build/K88Critic/SCORES.md`) |
| selftest 39 → 59 | `close/bind-selftest.txt` arm count `grep -c 'RECEIPT_BIND_SELFTEST arm '` | 59 arms, `PASS held=59/59`; v1 control prints `39/39`; `0ff3562f` prints `39/39` | yes |

Evidence-verified (committed receipts, not executed): the remaining seven kill-rule constructions
(`build/K88Critic/SCORES.md` + `disc-*.txt`, e.g. `disc-f5-loose-limit.txt` shows the candidate CLEAN on a
1.5 MiB receipt the integrated instrument refuses); `build/K88Connector/probe-ctl-abs-disk.txt`;
`build/K88Review2/ctl-nogit-overfit.txt`; mutation battery `summary.json` (`mutants: 26` = M01–M25 + M26
twin, `survived: 8` — M05, M11, M16, M17, M18, M23, M24, M25 — matching the report's "25 mutants + twin,
8 survive"); the 59-case selftest mutant receipts (`56, 57, 57, 51 of 59`); `close/plan.txt` PASS;
`close/proxy.txt` `PROXY: MATCH` exit 0; `close/spotcheck.txt` CLEAN; `close/selftest.txt` 63/63;
`build/K88Review2/determinism-diff.txt` (three diff-identical runs); `build/K88ExecCarry/*` all CLEAN.

**Ruling: UNMET is correct.** Two constructions I ran myself reach the frozen predicate's terminal score
while skipping a claimed behaviour, so the pre-registered kill rule (`.ufo/waves/round-88/plan.md`, any
seat-constructed control at 20/20) fires. The lane reported this itself and did not narrow the rule.

Axis harm: `git diff 7ac24afa 4f7d8ea9 -- SCORECARD.md` removes 4 lines, all accounting
(`A_wave=1012`, `C2=222`, `C2_total=222`, `pin.receipt-bind=b640ff31…` → `A_wave=1112`, `C2=224`,
`pin.receipt-bind=1f11f124…` = the v2 sha at M). No axis integer moved; no capability row was credited.

| axis | verdict | basis |
|---|---|---|
| operability | unchanged | claim UNMET by the lane's own frozen kill rule; integer 9 (terminal under `f_O`) unchanged; capability row not added |
| coverage | unchanged | 10, retired; no claim |
| coverage:script-layer | unchanged | `close/proxy.txt` → 10 |
| coverage:runtime-layer | unchanged | `close/proxy.txt` → 10 |
| coverage:kimi-layer | unchanged | `close/proxy.txt` → 10 |
| coverage:omp | unchanged | `close/proxy.txt` → 10 |

## 3. Discernment spot-check

| item | decision | re-opened source | agree/disagree | reason |
|---|---|---|---|---|
| S252 CWE-22 | admit (A, mined) | `https://cwe.mitre.org/data/definitions/22.html` fetched 2026-11-04, byte-identical to `open/cwe22.html` (sha256 `654cd4b7…017382`) | agree | live text at the cited line: "…special elements within the pathname that can cause the pathname to resolve to a location that is outside of the restricted directory" (22 words). Primary, normative for containment, grounds `ESCAPES_LANE` exactly. |
| S253 gitrevisions(7) | admit (A, mined) | `https://git-scm.com/docs/gitrevisions` fetched 2026-11-04, byte-identical to `open/gitrev.html` (sha256 `1ab7124a…19070b`) | agree | live text at the cited line: "at the given path in the tree-ish object named by the part" (13 words). Authoritative for `rev:path` addressing, which is precisely `blobAt`; grounds "revision, not worktree". |
| S254 OWASP Community Path Traversal | reject (B, community) | `https://owasp.org/www-community/attacks/Path_Traversal` fetched 2026-11-04, byte-identical to `open/owasp-pt.html` (sha256 `ba073650…5216a4`) | agree | quote present: "access files and directories that are stored outside the web root" (12 words); `grep -oi 'canonicaliz[a-z]*'` → 0 hits. Attack-side, web-root framed, no normative containment rule — adds nothing over S252; the stated flip (a normative canonicalize-then-contain check) is the right one. |
| S218 CWE-59 (re-opened, not a new row) | existing A, `used-by` extended | capture `open/*` vs round-70 pin `4fae5c5e…a7a038` | agree | `SYMLINK_DIR` is the link-resolution class; extending `used-by` rather than writing a duplicate URL row is the contract-correct move (`W04`). |

New-row quote check: all three new rows carry URL, access date, located quote and capture sha256 in the
lesson's `## Gate`; the quotes are 22 / 13 / 12 words (≤25). Census:
`sources-census.sh validate --root /home/vgpnk/Projects/shokunin kumitate` → `kumitate ok …/corpus/SOURCES.md`
exit 0 with the same 7 pinned `W04` rows. Rows re-derived from committed bytes:
`grep -cE '^\|[[:space:]]*S[0-9]{3,}[[:space:]]*\|'` → 189 at `7ac24afa`, 192 at `4f7d8ea9`; malformed 0,
duplicate ids none, tiers A=161 B=21 C=10, status mined=152 queued=13 rejected=27.

## 4. Trend verdicts

- **expansion — unchanged.** +2 admitted rows and +1 reject in bands the coverage map already holds; no
  new `knowledge/` entry (`git diff --stat` shows only `receipt-subject-binding.md`, extended), no
  frontier area moved into core, no capability row, assimilation none. Agrees with lane.
- **quality — improved.** Independently visible: the instrument gained four fail-closed boundaries with
  positive twins, the selftest grew 39 → 59 arms with each boundary's removal failing it (56/57/57/51 of
  59), v1 and v2 agree on all 41 committed close dirs (`build/K88Scout/walk/table.tsv`, 41 rows), and
  the round-87 routed defects K87-V1/V2/V3/V4 all carry committed receipts this round. Tempered: the
  claim is UNMET, so this is corpus/instrument quality, not a capability.
- **discernment — improved.** 3/3 sampled gate decisions agree; the lane honoured its frozen kill rule
  against its own 20/20 predicate, recorded nine constructions with off-fixture discrimination, and
  pre-registered the scorer fix (Q81 amendment) instead of narrowing the rule.

## 5. Routed defects (lane fixes next round)

- **K88-V1 (quoted output not persisted — K87-V1 class, narrower).** `SCORECARD.md:4317` and `LOG.md:3043`
  quote `RECEIPT_BIND: CLEAN matched=13 mismatched=0 unchecked=0 external=1` for the close receipts, but
  the committed receipt prints `matched=12` (`close/bind.txt:4`; 12 others + `bind.txt` itself = the 13
  `.txt` in the dir). `matched=13` is only in the seat's dry-run transcript at `0ff3562f`
  (`build/K88ExecClose/evidence/run-transcript.txt:21`), not for the M run. Fix: commit the v3 runner
  transcript (`BIND_CASE`/final `BIND`/`DONE` lines) for the M run, or append a named correction.
- **K88-V2 (quoted output not persisted).** Report l.63 `node scripts/sources-check.mjs` → `rows=192` and
  l.66 `SOURCE_CAPTURE: CLEAN captures=81` have no committed receipt; the only committed run reads
  `rows=189`/`captures=78` at `0ff3562f` (`build/K88ExecCarry/check-gate.txt`, `capture-gate.txt`). Both
  numbers verify from committed bytes (row census 192; `.ufo/pins/source-captures.json` `captures` list =
  81) but the cited outputs do not resolve. Fix: commit the M-time gate receipts.
- **K88-V3 (uncited measurement).** `SCORECARD.md:4322` cites `checklist 40/46` with reds `723, 737, 741,
  746, 748, 756`; no committed receipt in the round dir prints it (`grep -rn '40/46' .ufo/waves/round-88`
  → nothing). Not re-executed by the closure (a lane gate). Fix: commit the `surface-probe --checklists`
  receipt or drop the number.
- **K88-V4 (process — prompt §3 minimum role split).** The wave has 12 seats and no planner
  (`w1-spec.json` items; `w1-results.json` agents = executor 3, scribe 2, reviewer 2, scout 1, connector
  1, critic 1, mutation-tester 1, sentinel 1); the report says the L1 "holds the §3 planner seat". The
  template's minimum split names 1× planner as an L2 seat. Disclosed, status-neutral. Fix: dispatch a
  planner seat or record the waiver in the plan/prompt.
- **K88-V5 (red gate at M).** `close/ready.txt` → `READY_HANDOFF: DRIFT RELATIVE_WAVE_PATH` exit 1 on this
  round's own handoff (a lane-relative `.ufo/waves` path in K88ExecCarry's item text). Disclosed in the
  report. Fix the item text so the handoff reads READY.

Operator note: SHONEN boxes 1 (SKILL registry row `SKILL.md:646` + checklist `SKILL.md:763`), 2 (LOG
"Round 88" + `close/*.txt` at `7817d200`), 3 (`close/bind-selftest.txt`, `close/c1-probe.txt`) and 4
(`git diff 7ac24afa 4f7d8ea9 -- PROVINCE.md` empty) all resolve from committed bytes and look checkable
by a non-author; promotion stays operator-owned.
