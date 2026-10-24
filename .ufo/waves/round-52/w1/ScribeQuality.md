# Seat ScribeQuality — round 52, wave 1 (quality draft)

Assignment: draft QUALITY criterion **Q44** at `build/ScribeQuality/Q44.md` in the shape of
`corpus/QUALITY.md`'s recent entries (Q43 as model, Q39 for the field style), fields
classes caught / fix / fails when / shown able to fail / limit, plus the one-line manual-
enforcement note mirroring Q43's. Done. No product code, corpus, judge, commit or gate was
touched; the lane was read-only except this seat's two paths.

## Behavior

1. Read `corpus/QUALITY.md` (Q43 at :801-818, Q39 at :754-773) for shape, and the frozen
   `round-52/plan.md` for the R52-11 route and the `## Close sequence` the criterion freezes.
2. Established the "shown able to fail" instance from committed bytes only (read-only git:
   `log`, `show`, `merge-base`, `rev-list`, `cat-file`, plus `grep`/`find`/`wc`/`sha256sum`).
3. Wrote the paste-ready entry to `build/ScribeQuality/Q44.md`; checked shape against Q43
   (2-space continued heading, `Classes caught:`/`Fix:` paragraphs, 4-space sub-bullets),
   backtick parity per line (0 odd lines), and max width 87 < Q43's 91.

## Evidence (exact commands, outcomes)

F1 — receipt rev ≠ cited rev (the R52-11 class, confirmed independently):

- `git log --oneline -15` → head chain `ac56743 66766f7 f539a71 02c0125 … cb6c472 fef6707`.
- `git log -1 --format='%h %ad %s' --date=short 57333ead…` →
  `57333ea 2026-10-23 round-51: close record — SCORECARD round-51 section + capability row, LOG, …`
- `git log -1 … fef67079` → `fef6707 …: stanza A re-derived to 71 (committed-tree walk; transient seat scratch had inflated the live reading)`.
- `git log -1 … cb6c472` → `cb6c472 …: final harm+census receipts`.
- `git log --format='%h parent=%p' -3 cb6c472` → `cb6c472 parent=fef6707`, `fef6707 parent=57333ea`. So the
  FINAL receipt commit is **1 commit after** the close rev `fef67079`, **2 after** the rev it cites.
- `git log --oneline --diff-filter=A -- .ufo/waves/round-51/close/FINAL-57333ead…txt` → `cb6c472`
  (the FINAL file and `FINAL-harm-census.txt` are the only files in that commit; `git show --stat`).
- `grep -rn 'rev=fef67079' .ufo/waves/round-51` → **no output** (no counter receipt exists at the
  measured close rev).
- `find .ufo/waves/round-51 -iname '*idempot*'` → **no output**; `ls .ufo/waves/round-51/close` →
  only `A51-cd7f69d3.txt D51-cd7f69d3.txt FINAL-57333ead….txt FINAL-harm-census.txt`.

F2 — the FINAL receipt bytes:

- `wc -lc .ufo/waves/round-51/close/FINAL-57333ead13b1b39419bdb1cf6502fad0aa8523ff.txt` → `6 655`.
- `sha256sum` → `0c1f9b225e412fe7870610f90aa72e61cccc42a589015739231d71a3c9e01d3f`.
- per-line lengths `280 5 147 5 208 4`; line 1 ends mid-word at `delt` (truncated `delta`).
- line 1 verbatim (280 bytes, full line):
  `ATTEST51: ATTEST_UNMET held=8/9 checks=9 rev=57333ead13b1b39419bdb1cf6502fad0aa8523ff rule=A51 version=v3 | A1 PASS | A2 PASS | A2c PASS | A3 PASS | A3c PASS | A4 PASS | A4c PASS | A3d PASS | A5 MISS pin match;proxy exit=1 PROXY: DRIFT (A_DRIFT term=A declared=81 computed=71 delt`
- line 5 verbatim (208 bytes, no lane `rev=` token; only upstream `src-rev=`):
  `PROXY: MATCH (A=81 C=23 operability=9; C1=19/19 C2=117/117 coverage=10; S=88/88
  coverage:script-layer=10; R=92/92 coverage:runtime-layer=10; K=53/53 coverage:kimi-layer=10;
  pins=6 match; src-rev=31c465f15669)` (single physical line; wrapped here for the page).
- `git show 57333ead:SCORECARD.md | sed -n '288p'` → `A=81`; `git show fef67079:SCORECARD.md | sed -n '288p'`
  → `A=71`; `git show fef67079 -- SCORECARD.md | grep '^[-+]A='` → `-A=81` / `+A=71`.
  Consequence: at the rev the FINAL line names, the declared A (81) disagrees with the committed-tree
  computed A (71 — the DRIFT the same line records); at `fef67079` the declaration is 71. No committed
  tree yields `MATCH (A=81 …)`. [INFERENCE] Attribution to transient seat scratch rests on `fef6707`'s
  own commit message above, not on a re-run.

F3 — the route already files this, verbatim
(`corpus/lessons/round-51-verifier-spotcheck.md:71`):
"commit a frozen-counter receipt at the measured close revision itself. The report's C1
after-citation names `close/FINAL-*.txt`, which reads 8/9 at 57333ead; SCORECARD's
`close/A51-<rev>.txt` pointer has no file at fef67079. The 9/9 at fef67079 is compositional
(cd7f69d3 receipt + SCORECARD-only delta + MutStanza proxy control 00 + my re-count); every
conjunct verifies, but a round that preaches "a frozen counter that was never executed is not
a predicate" (M1/Q43) should not file a measured close revision without receipts executed
against that revision."

## Draft content decisions

- Insertion point: append after Q43's `Limit.` at `corpus/QUALITY.md:818` (file ends `…round 51).\n`;
  criteria are back-to-back with no blank line, so Q44 starts at line 819). The L1 integration
  step owns the paste; this seat did not edit corpus.
- "Measured close revision" is named as `fef67079` per the frozen plan's R52-11 sentence and the
  spotcheck, not re-measured by this seat (no counter run — not this seat's gate and the lane is
  read-only for counters' receipts). Labeled as a citation, never as execution evidence.
- The draft does not claim the round-51 9/9 was false; it claims the receipt rev and the cited rev
  differ and that the file composes two tree states — both observable in committed bytes.
- Enforcement note mirrors Q43: placed as the closing sentences of `Limit.`, starting
  `Enforcement is MANUAL —`, ending `no lane gate mechanically rejects …`, attributed
  `(seat ScribeQuality, round 52)`.
- Fields present: `Classes caught:`, `Fix:`, then bullets `Fails when.`, `Shown able to fail.`,
  `Limit.` — Q43's exact field set; no `Who checks`/`Command` fields (Q39–Q41 vintage, not Q43's).

## Draft-shape gates run (self-checks, not lane gates)

- backtick parity per line (`awk` odd-count scan) → 0 odd lines.
- max line 87 chars (< Q43 region max 91); heading wraps like Q43 (bold sentence over 2 lines).
- `awk` line-length map printed 39 lines; no line exceeds corpus style.

## Findings

1. **Confirmed R52-11 with hard bytes.** FINAL cites `57333ead`, committed at `cb6c472`
   (1 commit past `fef67079`, 2 past the cited rev); zero receipts at `fef67079`; zero idempotence
   artifacts. The 9/9 at the close rev exists only compositionally.
2. **The FINAL transcript is itself two-tree.** A rev-bound `held=8/9` + `PROXY: DRIFT
   declared=81 computed=71` line sits beside an un-rev-bound `PROXY: MATCH (A=81 …)` line that no
   committed tree can produce (declared A is 81 at 57333ead with computed 71, and 71 at fef67079
   and at tip). Q44's "fails when" names exactly this mixed-transcript shape.
3. **Byte defect in the FINAL receipt**: line 1 truncated mid-token at `delt` (280 bytes). A Q24
   adjacency (a receipt that names bytes it did not finish writing); not folded into Q44's
   predicate, recorded here.
4. **No idempotence discipline existed before Q44**: round-51 has no re-run transcript at all
   (the `find` above), so the "receipt commit carries a re-run" half of Q44 is new, not a
   restatement of a prior rule.
5. **Dependency note**: no sibling artifact was needed; all evidence is committed bytes in this
   lane. No peer file was absent for this item.

## Verbatim conflicts (for the canonical Rust judge — no adjudication by this seat)

- Frozen plan, `round-52/plan.md` (R52-11): "no frozen A51/D51 receipt committed at the measured
  close rev fef67079 (committed FINAL read 8/9@57333ead)".
- Committed receipt, `close/FINAL-57333ead….txt:1`: `rev=57333ead13b1b39419bdb1cf6502fad0aa8523ff`
  with `held=8/9`.
- Committed corpus at that rev: `git show 57333ead:SCORECARD.md` line 288 = `A=81`, while the same
  receipt line records `computed=71` and the repo at `fef67079`/tip declares `A=71`.
- Un-rev-bound line in the same 655-byte file: `PROXY: MATCH (A=81 C=23 operability=9; … pins=6
  match; src-rev=31c465f15669)`.

## Touched surfaces

- Created: `.ufo/waves/round-52/build/ScribeQuality/Q44.md` (40 lines / 3,153 B draft; the one
  edit after first write only re-wrapped two code spans, no content change) and this report.
- Created directories: `.ufo/waves/round-52/build/ScribeQuality/`, `.ufo/waves/round-52/w1/`
  (the latter did not exist at seat start — see finding 5 note; it is the assigned report path).
- No writes elsewhere; no git/jj mutation; no commit; no background jobs; no subagents.
- Directory listing side effect: none in the lane; other seats' `build/` dirs were only read.

## Out of scope / not done

- `corpus/QUALITY.md` not edited (L1 integration step 1 owns "Q44" per the close sequence).
- No counter (A52/D52/A51/D51), probe, selftest, build, lint or gate executed — none is this seat's
  artifact, and running them would produce unreceipted claims.
- SCORECARD/LOG/README/SOURCES untouched; no triplet re-derivation; no commit or push.

## Provenance

- Tools installed or upgraded: **none** (no pacman — paused host-wide — and no uv/npx/binary
  install was needed; `node`, `git`, `awk`, `sha256sum`, `find` already present). L0 needs: none.
- Read-only git only (`log`, `show`, `merge-base`, `rev-list`, `cat-file` queries via `log/show`).

## Artifacts

- `kumitate-shokunin/.ufo/waves/round-52/build/ScribeQuality/Q44.md` — the Q44 draft
  (paste target: after `corpus/QUALITY.md:818`).
- `kumitate-shokunin/.ufo/waves/round-52/w1/ScribeQuality.md` — this report.
