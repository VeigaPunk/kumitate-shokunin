# ScribeShonen — round 52

Seat `ScribeShonen` (scribe, lane author; leaf). Lane `kumitate-shokunin`. Round 52 ONLY.
Measured state: lane tip `ac5674393f68` (base `02c01258`, freeze `f539a71`, spec `66766f7`), 2026-10-24.
Artifact delivered: `.ufo/waves/round-52/build/ScribeShonen/shonen.md` (absolute under the lane root).

## Behavior

Drafted the SHONEN evidence mapping for all four boxes in `SHONEN.md:5-8`, per the round-51 report
precedent (`.ufo/reports/round-51/kumitate.md:155-170`):

- each box gets a **primary close evidence** entry (a file the frozen plan's own close steps create,
  named with the exact line/substring it must produce), a **fallback pointer that resolves today** at
  `ac5674393f68`, and a **non-author verifier** column;
- **all four boxes remain `[~]`; none is `[x]`; no placeholder tokens** (round-36's
  `CriticReportHygiene.md:54` defect class is avoided: every pointer is either a resolving path today or a
  close artifact fixed by the frozen plan);
- **verifier status stated plainly**: no box has a named non-author verifier. All 64 seats — including the
  13 reviewer, 6 critic, 5 mutation-tester, 1 revenger and 2 sentinel seats — were dispatched by the L1 from
  one frozen 64-seat spec in one task call, so a wave seat is not an independent reviewer for SHONEN
  promotion purposes. Round 51 is the precedent and is *stronger* than this round's situation: it carried a
  separate falsify wave with non-author re-opens (`w2/ScoutReopenS100.md`, `w2/ScoutReopenS101.md`) and still
  filed four `[~]` lines closing "No named non-author verifier". Only the fleet integrator (round 51:
  `02c0125`, non-author spot-check) or the operator may write `[x]`; `checked=0` is deliberate.
- the artifact also carries a **report-ready four-line `## SHONEN` block** in round-51 shape, with pointing
  done via names/greps rather than angle-bracket revision tokens (a commit cannot name itself).

## Evidence — commands run by this seat (read-only, all at `ac5674393f68`)

| Command | Observed |
|---|---|
| `node scripts/surface-probe.mjs --checklists` | `CHECKLIST: 20/23 pass`, `VERDICT: FAIL`, 188.88 s (item `:709` receipt-attest PASS) |
| `node scripts/cite-check.mjs` | `CITE_CHECK: DRIFT (files=122 tokens=10649 errors=929 warnings=654)` rc=1 |
| `node scripts/round-gate.mjs` | `ROUND_GATE error SCORECARD_ROW_MISSING no table row starting "\| 51 \|"` rc=1 |
| `node scripts/round-gate.mjs --tracked` | `ROUND_GATE: CLEAN (mode=tracked checked=34 errors=0 warnings=0)` rc=0 |
| `node scripts/proxy-check.mjs --strict` | `PROXY: DRIFT (A_DRIFT declared=71 computed=1142 delta=+1071; C2_TOTAL_DRIFT 117/118; AXES_DRIFT 10/9; src-rev=31c465f15669)` rc=1 |
| `node scripts/claims-check.mjs` | rc=0, one warn `SECTION_FILE_NOT_MEMBER row=S2` |
| `node scripts/sources-check.mjs` | `SOURCES_CHECK: CLEAN (rows=101 tiers=A:87,B:6,C:8 …)` rc=0 |
| `node scripts/kimi-census.mjs` | `KIMI_CENSUS: CLEAN (members=53 checked=53 chain=8 info=4)` rc=0 |
| `git ls-files` runnable count | 73 tracked at HEAD (71 at base); 714 untracked runnable now; 1075 runnable under `.ufo/waves/round-52/` |
| `md5sum SHONEN.md` | `531ce597e5be89bc71fb0fb6389ac2c5` (4 boxes, lines 5-8, untouched) |
| `ls .ufo/waves/round-52/{close,receipts}` | both absent at measurement |
| `ls .ufo/waves/round-52/w1` | 2 files at measurement (`ExecProbeSanity.md`, `ScoutRfc3339.md`); rest in flight |

## Findings (full text in the artifact, §Findings F1-F7)

1. **F1** `w1/` evidence is prospective — 2 of the named seat reports existed at measurement; dead seats
   are named, never replaced (plan §Wave), so a dead seat's pointer degrades to the fallback column.
2. **F2** `.ufo/waves/round-52/close/` and `receipts/` are absent; boxes 1/2/4's primary pointers depend on
   close-sequence steps 1-3. The plan fixes only the `close/` *directory*, not `FINAL-harm-census.txt`'s
   name (taken from round-51 precedent).
3. **F3** box 4 has no close-time touched-set artifact: `SentScope`'s item covers only round-52 wave files
   plus lane `git status`, not the integration commits. Recommended one-liner for the L1: append
   `git diff --name-only 02c01258..R1` (R1 = the measured close revision) and an empty `git status --porcelain` to `close/FINAL-harm-census.txt`.
4. **F4** checklist: plan baseline 21/23, **observed 20/23** here; the three reds reproduced individually —
   `:687` cite-check (env-dependent, round-37 `S7` limit; errors 454 → 929), `:692` round-close artifact
   audit (`SCORECARD_ROW_MISSING | 51 |` + `LOG_ENTRY_MISSING`), `:694` proxy (see F7). The report must quote
   the measured R1 count, not inherit 21/23.
5. **F5** `SKILL.md:709` item 23's parenthetical still names contract `kumitate-receipt-attest-v1` while the
   round ships v2. It is prose only (`scripts/surface-probe.mjs` has no `receipt-attest` literal; the expected
   substring `ATTEST_SELFTEST: PASS` is a prefix of v2's `ATTEST_SELFTEST: PASS (n/n)`), so the item still
   passes — but the label should be updated at integration so box 1 does not cite a dead contract name.
6. **F6** all line anchors are revision-scoped; cite heading + nearest line and re-anchor at filing.
7. **F7** **the live wave inflates the proxy `A` term.** `scripts/proxy-check.mjs:935` computes
   `A = walkFiles(self).filter(RE_RUNNABLE).length` over the *working tree*; wave scratch under
   `.ufo/waves/round-52/build/` (1075 runnable files, growing) pushes `computed` from the baseline 73 to 1142.
   H3/H1 must therefore be measured on R1's committed/extracted bytes, and the stanza's re-derived `A` must
   equal the **committed** runnable count at R1 (round 51 committed its `build/`, ~25 runnable files — the
   round-52 delta depends on what the L1 commits). Otherwise `PROXY: MATCH` in box 1/box 4 is unquotable.

### Adjacent finding for `ScribeReport` / L1 (not a SHONEN item)

The round-shape attack count is stated two ways: plan §Wave says **25 attack seats = 39%**, while commit
`66766f7`'s message says **37.5%** (= 24/64). The role census in `w1-spec.json` gives reviewer 13 + critic 6 +
mutation-tester 5 + revenger 1 = **25** attack-role seats (plus 2 sentinels, which the plan's 25 does not
count), i.e. 39.06% — so 25/64 is the derivation the validator's role set supports and 37.5% is not
reproducible from the spec. `w1-validate.json` records only lane counts (`spawn=64 resume=0 total=64`) and no
attack percentage. The report should use 25/64 and cite the role census; flag the commit message if it is
quoted.

## Out of scope / untouched

- `SHONEN.md` not edited (md5 above); no product file, `scripts/`, `corpus/`, `SCORECARD.md`, `SKILL.md`,
  pins, lane jj state or git index touched; no fleet or sibling-lane writes; no `MANIFEST.json` or `~/.omp`
  config; no `.ufo/state` or `watchdog.log`.
- No subagents spawned, no swarm, no mutating git/jj. One background bash job (`bg_3436`, the checklist run)
  was launched and **completed** within the seat (188.88 s); its result is cited above. Nothing outlives
  this seat.
- No tool installed or upgraded; pacman not invoked (guard honored).

## Known limits

- Time-boxed leaf: the 64-seat wave was mid-flight at measurement, so every `w1/*.md` pointer except the two
  observed files is prospective by construction — the artifact marks which ones and gives fallbacks.
- The 20/23 checklist reading is an *environment* reading (bare cite-check measures the ambient checkout;
  proxy walks untracked wave scratch). It is not evidence that the plan's 21/23 baseline was wrong.
- I did not run the two frozen counters (A52/D52): `base/attest52-base.txt` and `base/doctrine52-base.txt`
  are the committed freeze receipts and seat `ExecProbeSanity` owns the live re-run; box 2/3 pointers cite
  those, not a run by me.

## Provenance

- Artifact: `.ufo/waves/round-52/build/ScribeShonen/shonen.md` (15.5 KB).
- Read-only sources: `plan.md`, `w1-spec.json` (64 items), `w1-validate.json`, `base/*`, `probe/*.mjs`,
  `SHONEN.md`, `PROTOCOL.md:144-171`, `.ufo/reports/round-51/kumitate.md`, `SKILL.md`, `PROVINCE.md`,
  `SCORECARD.md`, `LOG.md`, `corpus/SOURCES.md`, `scripts/{round-gate,surface-probe,proxy-check}.mjs`.
- Tool installs: none. Lane writes: this report + the artifact, both inside the seat's two allowed paths.
