author: hyaku closure (non-author integrator, @m_zfl)
round: 79
lane: kumitate
reviewed: cohort 5019803b → 0fb019a30203bfb5ecf444557d612bf3c197ffd9; report `.ufo/reports/round-79/kumitate.md` (filed cbb52bd, rewritten 59aa9ae)

# Round 79 — non-author verifier spot-check

Two claims, two axes: C1 `coverage:kimi-layer` (the K score keeps both its factors; the round-78 harm
repaired) and C2 `operability` (capability deepening `report-receipt-diff` v4, new finding `POINTER_DEAD`).
This review re-derived what could be re-derived from committed bytes and evidence-verified the lane's
frozen counters per PROTOCOL §Gate standard (Closure consequence); no sibling gate was executed.

## Conformance (step 1)

- **Report attribution.** `git log --format='%an <%ae> %H' -- .ufo/reports/round-79/kumitate.md` →
  `kumitate-shokunin <kumitate@shokunin.local> cbb52bd6…` and `… 59aa9ae8…`. Filed by the lane
  identity. Pass, with the rewrite defect D8 below.
- **SHONEN heading.** `grep -c '^## SHONEN'` → 1; four `[~]` lines for the four `SHONEN.md` boxes
  (`grep -c '^- \[~\]'` → 4; seed `grep -c '^- \[ \]' SHONEN.md` → 4). Pass. All four are
  author-asserted (`[~]`); a non-author found them checkable in principle, so promotion is left to the
  operator.
- **Cited commits.** Each of `5019803b`, `ba940b51`, `83f6815f`, `8a733ab0`, `357e4e73`, `0fb019a3`
  resolves (`git cat-file -t` → commit) and is an ancestor of `master`
  (`git merge-base --is-ancestor <h> master` → yes for all six). Pass.
- **Lane cleanliness / push.** `jj-lane.sh state …` → `ahead=0 behind=0`, `local=remote=0fb019a3…`,
  `tracked=0 untracked=0`; `git status --porcelain` → empty. Pass.
- **Prompt contract.** `.ufo/prompts/kumitate-round-79.md` §1–§5 diffs against
  `templates/round-prompt.md` with substitutions only (`diff` shows `{{LANE}}`/`{{ROUND}}`/
  `{{FLEET_ROOT}}` renders); it carries the mission/axes binding, the ≥8-seat one-batched-call L2
  floor, commit-then-push ordering, push scope, the L0 side channel, and all five child-lane items
  (report path, report-lands-last, SHONEN heading, landed-hash citation, lane write scope). MISSION.md
  has no per-lane route pins (it defers to the operator's global table), so the prompt's run-15 map
  contradicts no MISSION bucket. Pass.
- **Dispatch evidence.** `.ufo/watchdog.log` digest quoted in the closure entry: launch
  `2026-11-04T04:33:24-03:00 … pgid=3317374 driver=hyaku-inline attempt=1`; complete
  `2026-11-04T05:23:58-03:00`. One v1 wave, 13 seats, band 8–16 (`ufo-wave-policy.json` minLanes 8),
  5/13 attack = 38 % ≥ 25 %. Pass.

## Claim re-check (step 2)

### C1 — `coverage:kimi-layer`: the composite keeps both factors (r78 harm repaired)

Evidence-verified frozen counter, plus a static re-derivation of the harm from committed bytes:

```
$ sed -n '822,826p' scripts/proxy-check.mjs
function kCoverage(covered, total, sections, members, findings) {
  if (total === 0 || members === 0) return 0;
  return Math.floor(10 * (covered / total) * (sections / members) * (members - findings) / members);
}
$ git show 5019803b:scripts/proxy-check.mjs | sed -n '177p'
 *     coverage_kimi = floor(10 × C1k/C1k_total × (K_members − K_findings)/K_members);
$ git show 5019803b:scripts/proxy-check.mjs | sed -n '950p'
      coverage_kimi: layerCoverage(kreg.covered, kreg.total, members - kimi.findings.length, members),
$ grep -c '^C79_C1 arm' .ufo/waves/round-79/close/c1-probe.txt   # 11
$ tail -2 .ufo/waves/round-79/close/c1-probe.txt
C79_C1: HELD held=11/11
exit=0
$ grep 'C79_C1: HELD' .ufo/waves/round-79/controls/c1-base.txt .ufo/waves/round-79/controls/c1-stub.txt
controls/c1-base.txt:C79_C1: HELD held=7/11
controls/c1-stub.txt:C79_C1: HELD held=4/11
```

The base bytes drop the `K_sections` factor (comment and `layerCoverage(..., members-findings,
members)` call), which is the round-78 harm; the base control also reads `cov=10` on a de-named heading
(`K=54/55`) while the measured tree reads 9, and one census finding reads 9. Selftest tallies
`PROXY_SELFTEST: 156/156 → 159/159` are in `w1/K79ExecKComposite/selftest-{before,after}.txt`; the
mutant battery is 7/7 (`close/mutants-c1.json`). Revision binding: `close/proxy-check.txt` carries
`rev=357e4e73…`; the c1 probe receipt itself carries no `rev=` line (D6).

**Verdict: improved.** Claim verifies; the r78 measurement harm is repaired with a discriminating arm
and a control that cannot reach the target (base 7/11, stub 4/11).

### C2 — `operability`: `report-receipt-diff` v4 (`POINTER_DEAD`)

Evidence-verified frozen counter, plus a static confirmation that v3 lacks the finding and that the
selftest grew by exactly the claimed 19 cases:

```
$ git show 5019803b:scripts/report-receipt-diff.mjs | grep -c 'POINTER_DEAD'   # 0
$ grep -c 'POINTER_DEAD' scripts/report-receipt-diff.mjs                        # 4 (code+comment)
$ git show 5019803b:scripts/report-receipt-diff.mjs | grep -cE '^  t\('         # 125
$ grep -cE '^  t\(' scripts/report-receipt-diff.mjs                             # 144
$ grep -c '^C79_C2 arm' .ufo/waves/round-79/close/c2-probe.txt                  # 12
$ tail -2 .ufo/waves/round-79/close/c2-probe.txt
C79_C2: HELD held=12/12
exit=0
$ grep 'C79_C2: HELD' .ufo/waves/round-79/controls/c2-base.txt .ufo/waves/round-79/controls/c2-stub.txt
controls/c2-base.txt:C79_C2: HELD held=9/12
controls/c2-stub.txt:C79_C2: HELD held=4/12
$ cat .ufo/waves/round-79/close/c2-r78.txt
rev=357e4e730574486fc1fd77d037768296da6be685
REPORT_RECEIPT: DRIFT RECEIPT_MISSING,POINTER_DEAD (round=78 rev=worktree bytes=11689 report_sha256=f690710edfac)
… 6 RECEIPT_MISSING lines …
POINTER_DEAD amended-plan-observed.md
POINTER_DEAD SOURCES.md
POINTER_DEAD knowledge/shape-receipt-live-drift.md
POINTER_DEAD knowledge/kimi-plane-single-derivation.md
```

The three resolution bases and the `..`/non-regular-file
refusal are present in the code (`pointerBases = [lane, dirname(report), lane/.ufo/waves/round-N]`,
`unsafe = ref.split('/').includes('..')`, `lstatSync(path).isFile()`), with the critic's three
adversarial fixtures now covered by selftest cases `pointer-directory-is-dead`,
`pointer-symlink-is-dead`, `pointer-escape-is-dead` (scripts/report-receipt-diff.mjs:519–521).

**Verdict: improved.** Claim verifies; 12/12 at M against 9/12 base and 4/12 for the constant-CLEAN
stub, with the new id absent from v3 and the selftest case count re-measured statically.

No claim was exploratory; no non-author `unprovable-but-better` ruling was required.

## Axis verdicts

| axis | verdict | re-derivation |
|---|---|---|
| coverage:kimi-layer | improved | committed base bytes drop `K_sections`; measured tree multiplies both factors; debt arm 54/55 → 9; frozen counter 11/11 vs 7/11 base |
| operability | improved | `POINTER_DEAD` absent at base, present at M; frozen counter 12/12 vs 9/12; selftest 125 → 144 counted statically |
| coverage (`retired`), coverage:script-layer, coverage:runtime-layer, coverage:omp, depth, freshness, calibration, adjacency | unchanged | `git diff 5019803b 0fb019a3 -- SCORECARD.md \| grep '^[-+]\| '` changes only the operability and coverage:kimi-layer rows (both integers hold: 9 and 10); all other axis rows are byte-identical |

No owned axis is harmed (`PROXY: MATCH (A=884 C=39 … C2=194/194 … K=55/55 … O=1/1)`, checklists
39/39, map 194/194).

## Discernment spot-check (LEARNING.md — from outside)

| item | decision | re-opened source | agree/disagree | reason |
|---|---|---|---|---|
| S229 GNU grep manual §2.3, docs/A | admit | committed capture `.ufo/waves/round-79/build/L1/captures/grep-manual.html` lines 1205–1212 (sha256 `517177d0…` matches the row) | agree | quote is present verbatim at 1208–1209 and the page states the ordinary 0/1/2 exit separation; primary documentation. The lesson's "21 words" is wrong — `wc -w` on the quote is 18 (still ≤25; see D4) |
| S230 scikit-learn `fbeta_score`, docs/A | admit | capture `sklearn-fbeta.html` lines 1369–1370 (sha256 `97e0b28f…` matches) | agree | the 24-word quote is present verbatim and the page documents a two-factor aggregate; boundary text ("library metric, not doctrine") is stated in the entry |
| S231 own-work r78 harm receipt, own-work/A | admit | `git show 94ab4065:.ufo/waves/round-78/close/harm-counterexample.txt`, lines 14 and 17 | agree | both verdict lines match the lesson quote; it is the lane's own re-runnable output and grounds the discriminating arm, not an external fact |
| S232 Wikipedia *Harmonic mean*, community/C | reject | capture `harmonic-mean-wikipedia.html` (sha256 `b74c35a7…` matches); tag-stripped lead reads "In mathematics, the harmonic mean is a kind of average, one of the Pythagorean means." | agree | tier-C community source, lead states no non-compensatory rule; rejection with a standards/paper/library flip is the right gate call |
| SOURCES row S229 quote ≤25 words | new row check | row 184 of `corpus/SOURCES.md` | agree (with the count note) | the quote cell is 18 words and located at `§2.3 Exit Status`; the row parses as 11 columns and the census accepts it |

`/home/vgpnk/Projects/shokunin/scripts/sources-census.sh validate --root /home/vgpnk/Projects/shokunin
kumitate` → six carried `W04` warnings + `kumitate ok …/corpus/SOURCES.md`, exit 0.

## Trend verdicts

- **expansion — improved.** Two admitted `knowledge/` entries on ground the map did not hold
  (`composite-score-compensability.md`, `report-evidence-pointers.md`), each citing a row opened this
  round (S230+S231; S229); README map 194/194 (`close/maps.txt`); SOURCES 167 → 171 by
  `git show 5019803b:corpus/SOURCES.md | grep -cE '^\| *S[0-9]{3,} *\|'` vs the same on HEAD; tier A
  143 → 146, C 8 → 9 by an `awk -F'|'` histogram over both commits.
- **quality — improved.** Two sources re-opened byte-identically (capture sha256s match the registry);
  the weaker r78 formula is superseded by the composite with a discriminating arm; the r78 record was
  corrected by an append-only erratum naming its superseded readings; 19 new selftest cases (counted
  statically 125 → 144) and 3 proxy cases (156 → 159). No admitted entry was found false or stale and
  left unmarked; the record defects D3/D4/D5 are pointer/metadata debt, routed below.
- **discernment — improved.** This outside spot-check agrees on all four re-opened gate decisions; the
  critic's adversarial fixtures changed the C2 implementation before filing (directory/symlink/escape
  refusal + three selftest cases); the round's own unreachable-arm mistake was mined into `## Mistakes`
  and turned into QUALITY Q73. The S229 word-count slip (D4) is a metadata error, not a disagreement
  with a gate decision, and is routed rather than absorbed.

## Routed defects (status-neutral; lane to fix in round 80)

1. **D1 — wrong receipt cited for the round-open repair.** The report's "Round-open repair" bullet
   cites `.ufo/waves/round-79/open/gates-open.txt` for `README_MAP: CLEAN files=191 rows=191
   covered=191`; that file is the before-snapshot and reads `DRIFT files=191 rows=190` (line 31). The
   clean reading is committed at `w1/K79ScoutOpen/gates.txt:35` and
   `w1/K79ReviewFreeze/scaffold-tree-readme-map.txt`; wave review FF-6 already names the mis-citation.
2. **D2 — dead pointer in "Independent attacks".** The report says the C2 mutation seat's matrix is
   `w1/K79MutC2/`; no such path exists at HEAD, and the report itself says that seat filed "no report
   and no matrix". `report-receipt-diff` v4 does not flag extensionless directory tokens, so its
   pre-filing CLEAN misses this.
3. **D3 — dead receipt names in the lesson's counter table.** `corpus/lessons/round-79.md` § Counters
   cites `close/shape.txt`, `close/census.txt`, `close/readme-map.txt` and `close/spotcheck-check.txt`;
   none exists (the real files are `close/census-shape.txt` and `close/maps.txt`). The append-only
   counter erratum corrects the values but not those pointers.
4. **D4 — quote word count.** The lesson states the S229 quote is 21 words; `wc -w` over the quoted
   text is 18. Under the ≤25 limit, but the recorded number is wrong (quote itself is faithful).
5. **D5 — round-78 SCORECARD placeholder filled with round-79 text.** `git diff 5019803b 0fb019a3 --
   SCORECARD.md` shows `-<SETTLEMENT>` / `+All 13 seats settled (…round-79/w1-results.json)…` inside
   the *Round 78* section, duplicating the round-79 settlement sentence. The round-78 placeholder
   should have been resolved with round-78 facts or left named as a placeholder.
6. **D6 — close counter receipts do not name the measured revision.** `close/c1-probe.txt` and
   `close/c2-probe.txt` carry no `rev=` line (unlike `close/proxy-check.txt` and `close/c2-r78.txt`,
   both `rev=357e4e73…`). Revision binding is indirect (report + `close/blob-identity.txt`); PROTOCOL
   §Gate standard asks the verdict to name the revision it was measured against.
7. **D7 — no committed round-start sources-census output.** The report's Sources & frontier cites
   `open/gates-open.txt` for the start census, but that file has no census section; only
   `close/sources-census.txt` (`census_exit=0`) is committed. The before row counts are re-derivable
   from `5019803b` bytes, but the required start command output/exit is not on record.
8. **D8 — filed report rewritten in place.** `cbb52bd` filed the report; `59aa9ae` rewrote its
   header lane-HEAD line and one Landed-changes bullet and regenerated `kumitate-receipt.txt`
   (13495 → 14251 bytes) instead of appending an erratum that names the superseded text. Commit
   subject says "erratum"; the body does not. PROTOCOL requires appended, naming corrections.

Also carried (lane-reported, not re-adjudicated here): `spotcheck-adopt --check` conflates map drift
with an uncovered spotcheck; the composite still floors and `K_findings` double-penalizes a missing
member; `POINTER_DEAD` resolves existence, not honesty.

## Verdict

Both claims verify against committed evidence, no owned axis is harmed, and the three trends are
`improved`. The defects above are conformance/record defects and are status-neutral; the round is
**admitted**.
