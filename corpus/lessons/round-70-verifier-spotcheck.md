author: hyaku closure (non-author integrator, zcode subagent (fresh session, non-author))

# kumitate round 70 (attempt 3) — non-author verifier spot-check

Closed against lane tip `648c6876c07912246fb211f8150948462bd7c3d6` (branch `master`, pushed),
base `fb60afcdb08d`, integration `3b1483801fe67eadc3cf48874a5a8f8150d1b72f`, budget/measured-at
`89cbd998ff956965634b14368231c6d117d6437e` (M). All git used index-free (`rev-parse`, `cat-file`,
`ls-tree`, `diff-tree`, `merge-base --is-ancestor`, `show`, `log`, `ls-remote`).

**Closure verdict: `rejected-honest-stop`, admitted=false. C2 verifies in full; C1's declared
falsifiable after-state is unmet in the lane's own committed, honestly-labeled measurements; the
stop is clean. No axis harmed.**

## 1. Step-1 conformance

| Check | Command | Result |
|---|---|---|
| Report committed by lane identity | `git -C <fleet> log --format='%an <%ae> %H %cI' -1 -- .ufo/reports/round-70/kumitate.md` | `kumitate-shokunin <kumitate@shokunin.local> 4a17af109f6f7c0a53c18f10c31ff8e0a7ba1056 2026-11-01T00:58:54-07:00` — PASS |
| Dispatch/complete digest matches | watchdog digest vs commit date | launch 2026-10-31T18:04:37-07:00, complete 2026-11-01T00:58:54-07:00 = report commit date exactly — PASS |
| `SHONEN` heading | read report | `## SHONEN` with one line per box (3 × `[~]`, 1 × `[x]`) — PASS (see defect D5 on the `[x]`) |
| Cited lane commits exist + are ancestors | `git -C <lane> cat-file -t <sha>` + `merge-base --is-ancestor <sha> refs/heads/master` for `3b148380…`, `89cbd998…`, `648c6876…`, `fb60afcd…`, `78b98d76…`, `fe2aba3b` (attempt-2 stop), `3dbe7e6e…` (freeze) | all `commit`, all `yes` — PASS |
| Lane tip pushed | `git -C <lane> ls-remote origin refs/heads/master` vs `rev-parse refs/heads/master` | both `648c6876c079…` — PASS |
| Round work reachable | `git -C <lane> log --format='%h %an %s' fb60afcdb08d..648c6876c079…` | exactly the 3 attempt-3 lane commits (`3b14838`, `89cbd99`, `648c687`), all `kumitate-shokunin`-authored — PASS |
| Report minimum content | read report | work performed / landed changes tied to LOG / before→after per claim / Sources & frontier with counting command / trend verdicts / SHONEN — PASS |

Real report with real committed work — not a marker. `lanes.kumitate = ok`.

## 2. Claim re-checks

Re-measured by me (plain commands over committed bytes): **C2 in full** and **C1's receipts,
counter-byte immutability, and verdict lines**. Evidence-verified (lane-owned gate/selftest
receipts read as committed bytes, never executed): the control-replay selftest tally and the
frozen-run counter verdicts.

### C2 — coverage frontier (isolation band) — VERIFIED

- Row count before/after with the reported counting command:
  `git show fb60afcdb08d:corpus/SOURCES.md | grep -cE '^ {0,3}\| S[0-9]{3}'` → **156**;
  `git show 648c6876…:corpus/SOURCES.md | …` → **158**. Matches the report exactly.
- S218 (CWE-59) / S219 (CWE-367): tier A `spec`, status `mined`, opened 2026-11-01,
  used-by the new entry; capture pins in-row.
- Knowledge entry `corpus/knowledge/replay-output-isolation-link-following.md` present at tip;
  opens with the provenance trio (`source: S218 …` / `source: S219 …` / `verified-at: 2026-11-01` /
  `recheck: 180d …`) and names the coverage-map band.
- Committed captures hash-verify against the pinned values:
  `git show 648c6876…:.ufo/waves/round-70/close/captures/cwe-59.html | sha256sum` →
  `4fae5c5e7444b5e2f58b126e966640a41d1a055bd60a40b16a5e4ad9b5a7a038` (row value);
  `cwe-367.html` → `a39970c0d78b30307c4efc90bbf1db9faeb91ae31ce35e427c9bbf829be32611` (row value).
- Gates receipt `close/gates.txt` at tip: `SOURCES_CHECK: CLEAN (rows=158 …)`, `SOURCE_CAPTURE:
  CLEAN captures=51`, `README_MAP: CLEAN files=170 rows=170`, `CITE_SOURCES: CLEAN cited=206`,
  `COUNTER_PINS: CLEAN pins=40` — matches the report. Two `USED_BY_ASYMMETRY` warns (S028/S124)
  present, lane-declared pre-existing.
- Census re-run by me at closure:
  `bash <fleet>/scripts/sources-census.sh validate --root <fleet> kumitate` → **exit 0**, six
  carried W04 duplicate-URL warns — identical to the committed `close/census-end.txt`.

### C1 — operability / capability `control-replay` — capability demonstrated; declared after-state UNMET (claim not admitted)

- **Instrument receipts (committed, read as bytes):** five `close/replay/ctl-*.txt`, each
  `CONTROL-PASS`, `childExit=0`, canonical-JSON receipt with digest/nonce/mkdtemp child/
  `scrubbedEnv policy=allow-list`/`shimArms`; `durationMs` 643315 / 787137 / 312367 / 274320 /
  263845 — the report's "643 s / 787 s / 312 s / 274 s / 264 s" exact. `substitutions` per receipt:
  c1 `tmp:0`, c2 `tmp:1` — consistent with the private-copy-only `/tmp` write removal design.
- **Selftest (evidence-verified, not executed):** `close/control-replay-selftest.txt` →
  `CONTROL_REPLAY_SELFTEST: PASS (21/21)` + `EXIT_MAP` line, as reported.
- **Construction claims spot-read in `scripts/control-replay.mjs` bytes at tip:** `{flag: 'wx'}`
  exclusive create + race comment; `lstatSync` refusal (exit 3) on any existing `--out` including
  links; `mkdtempSync` unique `ctl-` child; `ENV_ALLOW` allow-list (never full inheritance);
  frozen-source sha256 compare with exit 4 on drift; substitution-count mismatch → exit 5;
  selftest arm names as registered. All match the SKILL registry row and the knowledge entry.
- **Frozen v1 counter bytes un-amended:** `git rev-parse <rev>:.ufo/waves/round-70/probe/replay70-probe.mjs`
  → `d526e5aed81c08d0298fcd8cdfb34644fc821437` at fb60afc, 3b148380, 89cbd998, AND 648c6876 —
  identical; content sha256 `63f52b75d9c0e3d80a91c6957ce4624cbd46a9488841a962a75bc62ffecbf0c1`
  matches the report's "sha `63f52b75…`". **VERIFIED unchanged base→tip.**
- **v2 bytes not amended after scoring:** blob `a5c48014f1108332f65f2d19dec372eef3eb45df`
  at 89cbd998 (M, where 8/17 was scored) == 648c6876 (tip). It did change 3b148380→89cbd998
  (the disclosed budget commit, before scoring) — **VERIFIED not amended after scoring.**
- **v1 verdict lines:** base receipt `base/replay70-base.txt` → `REPLAY70_UNMET held=2/10 …
  rev=78b98d76…` as reported. Close receipts: `close/replay70-v1-AT-M-win32.txt` →
  `held=6/10 … live=exercised` at **rev=3b148380**; `close/replay70-v1-AT-M2-win32.txt` →
  `held=5/10 … live=no-live(vacuous-declared)` at **rev=89cbd998 (M)** ending in an EPERM
  `rmSync` cleanup crash. **Both read UNMET; neither reads 10/10.** (Defect D2: the report
  attributes the 6/10 line to the AT-M2 file — misattribution, conclusion unaffected.)
- **v2 verdict line:** `close/replay70-v2-AT-M-win32.txt` → `REPLAY70V2_UNMET held=8/17` at
  rev=89cbd998. PASS: V01, V02, V10, V11, V14 + live attack fixtures V15/V16/V17 (each
  `REPLAY70V2_UNMET held=3/14` under the stub — correct fixture behavior). MISS: V03–V07
  (`exit=0 digest=ok`), V08 (`two runs diverge`), V09 (`normalized DIFFER`), V12
  (`tool-exit=null`), V13 (`exits=1,1`) — 9 MISS arms.
- **Counter-side bug confirmed in bytes:** v2 line `&& rec.childExit === 1` while all five
  frozen-control receipts show `childExit=0` on `CONTROL-PASS` — the V03–V07 expectation bug is
  real and is a counter defect, not a fixture failure. V08's cause is **not** accounted in the
  report/SCORECARD anatomy (defect D3).
- **Ruling.** The SCORECARD attempt-3 declaration defines C1's falsifiable after-state as
  "frozen v1 HELD 10/10 at the landed rev driven by the real tool, v2 HELD with every active
  check, [attacks] each UNMET under v2". The committed measurements read v1 UNMET 6/10 (idle,
  rev 3b148380) / 5/10 (contended, rev M) and v2 UNMET 8/17 — the declared after-state is unmet.
  Per AXES.md ("admitted only if every claim verifies"), C1 does not verify → the round is not
  admitted. The lane said so itself (`admitted_self=false`; SCORECARD "C1 — not admitted;
  capability demonstrated"), preserved the frozen bytes, named the mechanisms (frozen 300 s
  per-mode budget vs 643–787 s measured control costs — a host-bound budget mismatch, not a
  fixture failure), and routed the counter-side fixes instead of amending scored bytes. That is
  the honest-stop shape: **rejected-honest-stop**. The capability row itself stands on a passing
  demonstration (five CONTROL-PASS receipts + selftest 21/21) and is not pre-claiming.

## 3. Axis-harm check

`git diff-tree -r -p fb60afcd… 648c6876… -- SCORECARD.md`: +23 lines — capability row,
attempt-3 declarations + verdicts, claims table. Axis rows: operability 9 held (terminal per
f_O = (11+20)/(11+20+3); score recomputes to 9); coverage and its successors unchanged; no
score lowered anywhere in the diff; PROVINCE gained a dated host correction; SKILL gained one
registry row. **No owned axis harmed.** Spot reads of PROVINCE/SKILL/LOG diffs corroborate.

## 4. Discernment spot-check (non-author, outside)

| Item | Decision | Re-opened source | Agree/disagree | Reason |
|---|---|---|---|---|
| Admit S218 (CWE-59) + knowledge entry | admit | Live https://cwe.mitre.org/data/definitions/59.html — Description contains the exact quoted sentence "attempts to access a file based on the filename, but it does not properly prevent that filename from identifying a link or shortcut that resolves to an unintended resource"; Name/Abstraction = Improper Link Resolution… (Base), matching the row; committed capture sha256 matches the pinned value | **agree** | Quote, anchor, abstraction and tier all re-verify; tier A `spec` is right for weakness-class vocabulary; the entry's constructions each verified against the tool bytes |
| Admit S219 (CWE-367) | admit | Live https://cwe.mitre.org/data/definitions/367.html — Potential Mitigations contains "to not perform a check before the use"; Name/Abstraction = TOCTOU (Base); capture sha256 matches | **agree** | Mitigation grounds the exclusive-create construction exactly as the entry claims |
| Reject consumer write-ups of symlink attacks as row candidates | reject | Lesson `## Gate — attempt 3` records the rejection with reason (tier C for a weakness-vocabulary scope) and flip (exploit-chain detail the CWE Base pages lack) | **agree** | Tier C can never solely support an admitted entry; CWE Base is the authoritative vocabulary; no row was written for an unopened lead — correct under contract rule 1 |
| Admit S217 (own-work, frozen c2-controls at 78b98d76) | admit (attempt-1 Gate) | `git show 78b98d76…:.ufo/waves/round-69/probe/c2-controls.sh` — line 24 is exactly `W="$LANE/.ufo/waves/round-69/controls"`; line 80 carries the `/tmp/forge-sed.txt` fixed write | **agree** | Both located quotes resolve at the cited rev; own-work tier scoping ("replay mechanics, not external authority") is correct |

Census validate re-run by me: exit 0 (§2). Disagreements: none.

## 5. Trend verdicts (with evidence)

- **expansion: improved** — new admitted `knowledge/` entry on ground the map did not hold
  (output/work-path half of the isolation band), provenance trio citing mined S218/S219; +2
  tier-A rows; captures committed and sha-pinned; README_MAP CLEAN 170/170; capability row
  entered with a passing demonstration. Re-measured, not asserted.
- **quality: improved** — no admitted entry failed its re-check on substance (every construction
  claim in the new entry verified against `scripts/control-replay.mjs` bytes; captures hash-match);
  the honest UNMET readings are committed with mechanisms named rather than tuned green; four
  landing-class defects were caught by the lane's own instruments before scoring. (The 20/20
  selftest count drift inside the entry/SKILL row is a routed defect D4, not an entry failing
  its bar.)
- **discernment: improved** — my outside spot-check agrees with both sampled gate decisions
  (admit and reject); the round routed its own counter defects with anatomy instead of amending
  bytes after scoring; v2 claims no universal forgery-resistance and v1's forgeability stays
  disclosed; `admitted_self=false` matches my re-derivation.

## 6. Routed defects (lane must fix in round 71; all status-neutral)

- **D1 (dead pointer).** Report and SCORECARD cite `close/replay70-v1-AT-BASE-win32.txt` (the
  claimed line-for-line win32 reproduction of `base/replay70-base.txt`) — no such path exists in
  any commit (verified `ls-tree` at 3b148380, 89cbd998, 648c6876). Land the receipt in r71 or
  withdraw the "reproduced on this host at round start" sub-claim.
- **D2 (receipt misattribution).** Report and SCORECARD cite `close/replay70-v1-AT-M2-win32.txt`
  for "held=6/10 … live=exercised"; that file reads `held=5/10, live=no-live(vacuous-declared),
  rev=89cbd998` with an EPERM `rmSync` cleanup-crash tail. The 6/10 exercised reading lives in
  `close/replay70-v1-AT-M-win32.txt` at rev=3b148380. Conclusion unaffected (both UNMET), but the
  attribution must be corrected in r71's report.
- **D3 (anatomy gap).** v2 has 9 MISS arms (V03–V07, V08, V09, V12, V13); the report/SCORECARD
  anatomy covers only 8 — V08 (cross-run divergence) is unaccounted. Account for V08 in r71
  (likely resource-bound: two full sequential replays against the budget).
- **D4 (number drift / corrections sweep).** SKILL registry row says "--selftest (20 hermetic
  cases … PASS (20/20))" and the knowledge entry quotes "CONTROL_REPLAY_SELFTEST: PASS (20/20)";
  the committed receipt and SCORECARD read 21/21 (the `refuse-dangling-link` arm was added after
  those bytes were written). Land named corrections (new entries / row corrections, never
  rewrites) in r71.
- **D5 (SHONEN mark).** Report box 4 carries `[x]` with no named non-author verifier — counts as
  `[~]` per protocol; no `[x]` was written by this verifier (SHONEN.md is untouchable by closure).
- **Routed counter fixes (lane-declared; confirmed in bytes):** v2 `childExit===1` must accept
  the controls' 0-on-CONTROL-PASS (V03–V07); V09 L4 failing-mutant-set seed normalization;
  V12/V13 (and V08) resource budgets. The frozen v1 counter's 300 s per-mode budget cannot hold
  R3–R6 on this host (controls cost 643–787 s standalone); v1 bytes stay frozen — a faster host
  re-reads 10/10 with zero byte changes, or r71 ships a further versioned counter, never a v1 edit.

## 7. SHONEN assessment (operator note, no marks written)

Boxes 1–3 are asserted `[~]` with resolvable pointers (SKILL registry row + decision tables;
LOG.md round-70 entry with end-to-end receipts; usage text + SKILL row + receipts for
executability) and look fully checkable by a non-author on the committed evidence. Box 4's `[x]`
is author attestation counting as `[~]` (D5); the PROVINCE correction and L0 note it cites
resolve. Promotion review is the operator's call; nothing in this closure blocks it.

*Written by the non-author closure judge; not committed by the lane. The orchestrator commits
this file and cites the hash in the ledger row.*
