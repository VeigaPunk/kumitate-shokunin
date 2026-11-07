# kumitate round 99 — verifier spot-check (non-author)

author: hyaku closure (non-author integrator, @m_zfl)

Date: 2026-11-07. Scope: lane-round kumitate r99, base `d8968ae5038836811cad7a38670ff1fc458ebd4c` →
tip `2cf2e2aa03e63a719b68975ff25931e9a064b962` (branch `master`). Report: fleet `.ufo/reports/round-99/kumitate.md`.
Driver digest (copied from mutable fleet `.ufo/watchdog.log`):
`2026-11-07T03:14:57-03:00 launch kumitate round=99 pgid=3772426 driver=hyaku-inline attempt=1`;
`2026-11-07T04:12:23-03:00 complete kumitate round=99; hyaku-inline attempt=1`.

## 1. Conformance (step 1)

| check | command | observed | result |
|---|---|---|---|
| report author | `git log --format='%an %ae %H %ci' -- .ufo/reports/round-99/kumitate.md` (fleet) | `kumitate-shokunin kumitate@shokunin.local 3865d7cd0df1621dbf12a25f5f89502b5fc03e2a 2026-11-07 04:11:36 -0300` (before driver complete 04:12:23) | pass |
| prompt | same on `.ufo/prompts/kumitate-round-99.md` | `kumitate-shokunin … e9428116989f7d020e43a822c027f54fa489c87b 03:14:55`; template sections `## 1`–`## 5` + `## 6. Campaign addendum — hyaku`, no `{{` left | pass |
| SHONEN | report `## SHONEN` | 4 lines, one per box (3×`[~]`, 1×`[ ]`) | pass |
| cited lane commits | `git cat-file -t` + `git merge-base --is-ancestor <h> master` for f9cd1bff, f480124b, 206e13dd, b914f5c5, ff8f686e, 2cf2e2aa, base d8968ae5 | all `commit`, all `anc … ok` | pass |
| fleet L0 commit | `git merge-base --is-ancestor 70185df4… HEAD` (fleet) | ok | pass |
| lane pushed/clean | `scripts/hyaku/jj-lane.sh state …/kumitate-shokunin` | `local=remote=2cf2e2aa… ahead=0 behind=0 head=detached tracked=0 untracked=0` | pass |
| leftovers | `git status --porcelain \| wc -l` | `0` | pass |
| remote | `git ls-remote origin refs/heads/master` | `2cf2e2aa03e63a719b68975ff25931e9a064b962` | pass |
| wave | `jq` on `.ufo/waves/round-99/w1-results.json` | seats 12, results 12 | pass |

No conformance defect found. Not a marker report.

## 2. Claim C1 (operability) — re-check

Claim: R99 `scripts/sources-check.mjs` trims every `## Registry` cell (and every other `trim` caller) with the census
`row_pass` blank class `[ \t]` instead of ECMAScript `trim()`.

Re-measured by me (plain commands over committed bytes):

- Production diff: `git diff d8968ae5 2cf2e2aa -- scripts/sources-check.mjs` → the only non-comment, non-selftest
  change is `-function trim(value) { return value.trim(); }` / `+function trim(value) { return value.replace(/^[ \t]+|[ \t]+$/g, ''); }`.
  `grep -nE '\btrim\('` at tip lists 15 production call sites (lines 235, 243, 259, 260, 272–281) = K99Reviewer's 15.
- Reference class: fleet `scripts/sources-census.sh:581` `function trim(s) { gsub(/^[ \t]+|[ \t]+$/,"",s); return s }`.
- Independent differential (my own harness; extracts each revision's `trim` from `git show REV:scripts/sources-check.mjs`
  and compares to `gawk` running the census `trim` body, 13 pad classes × 4 shapes, NUL excluded):
  `cases=48 BASE_agree=16 AFTER_agree=48` (identical under `LC_ALL=C.UTF-8`).
- Tool identity: `git show ff8f686e:scripts/sources-check.mjs | sha256sum` = `git show 2cf2e2aa:… | sha256sum` =
  `75ac6972d8573be9018ed32f21b6e67407438c32a7b8f0d695fb2c47a66ab40a`; M `b914f5c5` = `50b94567…`; SCORECARD
  `pin.sources-check` 1def379f… → 75ac6972… (matches).
- SOURCES rows: `git show <rev>:corpus/SOURCES.md | grep -cE '^ {0,3}\| S[0-9]{3}'` → d8968ae5 215, f9cd1bff 215, 2cf2e2aa 217.
- SCORECARD diff (`git diff d8968ae5 2cf2e2aa -- SCORECARD.md`): proxy `A_wave` 1695→1755, `C2`/`C2_total` 254→257,
  pin re-pinned, r99 axis-move row (9→9 terminal), r99 disposition, r100 pre-registration. No coverage row changed;
  no axis score lowered.

Evidence-verified (lane-owned gate/probe; committed receipts read, not executed — §Gate standard, Closure consequence):

- `controls/OBSERVED.txt`: 17/17 `match=yes` (positive + `ctl-splitjs` HELD, 15 UNMET). `controls/ctl-nothing.txt`:
  `C99_C1: UNMET a=0/1 … E02=48/88 … E05..E09=16/43 tool_rows=353 tool_sha256=1def379f…`.
- `close/probe-m2-1.txt` / `-2.txt`: `C99_C1: HELD a..f=1/1 g=21/21 h=1/1`, E02 86/86 and 88/88, E05–E09 43/43,
  seeds 621bec879368950b / f320401276901cac, `tool_sha256=75ac6972…` (revision measured = shipped bytes).
- `close-l1/selftest-M.txt` `VERDICT: PASS`; `close-l1/tally-recount.txt` `selftest pass printed=97 counted=97`.
- `close-l1/integration-remut.txt` `REMUT: killed=15/15 reference=PASS`; `close-l1/m2-teeth.txt` `M2_TEETH: killed=9/9`.
- `close/battery-final.txt` 9× `exit=0`; `K99ExecHarm/history.txt` `# same=78 differ=0`; `K99CriticC/H99.md` 943/943 on two seeds.

Reported vs re-derived values agree on every row of the report's before→after table that I could re-derive.

**Disclosed trade, independently re-derived.** The shared `trim` also reads used-by path parts, which the census reads
with bash `trim_cell` `[[:space:]]` (sources-census.sh:531–535, 564). My bash re-run of `trim_cell` on `<pad>corpus/x.md<pad>`:
C locale trims VT/FF/CR, keeps EMSP/NBSP/IDSP; `en_US.UTF-8` trims VT/FF/CR/EMSP/IDSP, keeps NBSP; R99 keeps all six.
So on used-by parts R99 now diverges from the census on VT/FF/CR in every locale and on Zs pads under UTF-8 (the host
default, `LANG=en_US.UTF-8`) — consistent with `close-l1/usedby-agreement.txt` (BASE 37/44 → M2 24/44 UTF-8; 22/44 → 39/44 C).

Ruling: **not harm on the axis.** (a) The measured live surface is unchanged: BASE vs M JSON identical on 21/21 lanes and
78/78 committed revisions, 0 non-blank pads in 5,460+ live rows; (b) the census reference is itself split (gawk `[ \t]`
vs bash locale `[[:space:]]`), so used-by "agreement" has no locale-independent truth; (c) the lane disclosed, measured
both ways, refused to fold it into the verdict, and filed L0 `kumitate | round-99` (fleet `.ufo/l0-questions.md:387`).
It is a prospective divergence routed as a must-resolve item (§6), not an observed regression.

## 3. Per-axis verdicts

| axis | verdict | basis |
|---|---|---|
| operability | improved | claim re-measured (48/48 vs 16/48 trim agreement; diff = one helper line) + gate evidence verified; 9→9 terminal, repaired instrument |
| coverage | unchanged | SCORECARD coverage rows 10→10, no row changed in diff |

## 4. Discernment spot-check (`corpus/lessons/round-99.md` `## Gate`)

| item | decision | re-opened source | agree/disagree | reason |
|---|---|---|---|---|
| S278 Unicode PropList 17.0.0 | admit | `curl https://www.unicode.org/Public/17.0.0/ucd/PropList.txt` → sha256 `130dcddc…` (= row/L1 capture); line 14 `0085          ; White_Space # Cc`; `grep -cE '^(FEFF\|200B) '` → 0 | agree | quote located and verbatim (whitespace-collapsed); grounds JS-trim ≠ White_Space ≠ blank |
| S279 POSIX XCU ch.2 → XBD §9.3.5 | admit | `curl …/basedefs/V1_chap09.html` → sha256 `2f5f60e9…` (= row); tag-stripped text contains the 21-word quote exactly | agree | quote ≤25 words, verbatim; grounds locale-dependence of `[[:space:]]` |
| sources-check R99 at M/M2 | admit | `git diff` + my differential (48/48) + receipts in §2 | agree | single-helper change, matches census `row_pass` class |
| "R99 is census parity everywhere" | reject | fleet `scripts/sources-census.sh:531-535,564` + my bash `trim_cell` re-run in C and en_US.UTF-8 | agree | used-by parts read with locale `[[:space:]]`; R99 diverges there (VT/FF/CR all locales, Zs under UTF-8) |
| "C99_C1 HELD certifies R99" | reject | `.ufo/waves/round-99/K99CriticA/constructions.md` (cited); counter is a refutation budget | agree | eleven wrong constructions reach HELD; M2 arms kill the six expressible ones |

SOURCES row re-open: S279 `teaches` cell carries the quote "The set of single characters that belong to the character
class, as defined in the LC_CTYPE category in the current locale." — 21 words (≤25), location XBD 9.3.5 lines 276–277,
verified above. S278's located quote lives in the lesson `## Gate` (CORPUS.md step 1), verified above.

Census: `scripts/sources-census.sh validate --root /home/vgpnk/Projects/shokunin kumitate` → 8 `W04` duplicate-url warnings
(S034, S068, S084, S095, S123, S126, S247, S271), `kumitate ok …/corpus/SOURCES.md`, `exit=0`; byte-identical (`diff`
empty) to committed `.ufo/waves/round-99/close/census-after.txt`.

## 5. Trend verdicts

- **expansion: improved** — new `corpus/knowledge/sources-check-cell-trim-class.md` on ground the map did not hold,
  citing mined S278/S279 (SOURCES 215→217, both re-opened and agreed); README map row added.
- **quality: improved** — selftest 71→97 with pinned trim-class arms (REMUT 15/15, M2_TEETH 9/9); the knowledge entry
  records the used-by locale split instead of claiming parity; no admitted entry failed re-check.
- **discernment: improved** — r98 outside finding (read order) became Q93 with a checker shown to fail; this outside
  spot-check agrees with the gate on all 3 sampled admits and 2 sampled rejects.

## 6. Routed defects / items for round 100

1. Resolve the used-by path-part divergence (VT/FF/CR in every locale; Zs pads under UTF-8) once L0 `kumitate | round-99`
   is answered; until then the shared `trim` reads used-by parts differently from the census `trim_cell`.
2. Land or route K99ExecSibling's `\s`-reader fixes (`scripts/cite-sources.mjs:36`, `scripts/source-capture.mjs:157`).
3. Counter gaps from K99CriticA (sniffing, census delegation, undrawn classes, pad runs >16, empty-id rows).
4. M99-3: plan text "47 pad classes" vs 44 in the counter stays frozen; carry the correction in the next round's plan.
