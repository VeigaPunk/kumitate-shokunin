# ReviewAxisMove — independent re-derivation: operability A=90 / C=27 / score 9; no-axis-harm

Seat: reviewer, round 57 wave 1 (kumitate, hyaku run 5). Item: independently re-derive
operability (A=90, C=27, `floor(10·(A+C)/(A+C+3))` = 9) and confirm no axis harmed.
Measured against **committed bytes** of the report's close revision R1 `f0dc6d1160e66af65355bd353665adac22bbf4a9`
and base `7178bfd3643c0fac74c8eb637cd6e985faadd0cf` (lane HEAD moved to bookkeeping tip
`8c6f5b017d149b18134917378cdbed3b492d8e89` during review; HEAD never moved by me; 46 dirty
entries at measurement time — all counts therefore taken from `git archive` extractions in my
build dir, never the working tree).

**Verdict: CONFIRMED — claim stands exactly as stated; no actionable defect. No tools installed.**

## Re-derivation (all commands exit 0; full log in evidence)

| term | claimed | re-derived @ R1 | method |
|---|---|---|---|
| A | 90 | **90** (70 `.ufo` + 20 `scripts`) | canonical `find . -path ./.git -prune -o -type f \( -name '*.mjs' -o -name '*.js' -o -name '*.sh' -o -name '*.py' \) -print \| wc -l` |
| C | 27 | **27** (27× `- [ ]`, all open) | `grep -c '^\s*- \[' SKILL.md` |
| score | 9 | **9** | `floor(10×117/120) = floor(9.75) = 9` |

Before (base 7178bfd): A=**87** (68 `.ufo` + 19 `scripts`), C=**26** — matches SCORECARD row 57's
"base terms A=87, C=26". Delta base→R1, verified by wc/md5/comm and a direct SKILL.md diff:

- A **+3 / −0**: `scripts/readme-map.mjs`, `.ufo/waves/round-57/probe/attest57-probe.mjs`,
  `.ufo/waves/round-57/probe/doctrine57-probe.mjs` (only-in-base set is empty — pure addition).
- C **+1**: SKILL.md diff has exactly two hunks — new checklist item 27
  (`Corpus coverage-map bimap gate … node scripts/readme-map.mjs → exit 0 + README_MAP: CLEAN`)
  and the new gate-registry row (not a `- [` line). Nothing else changed.
- A57 B7 binding re-verified from the file: items 24–27 name `counter-pins.mjs`,
  `source-capture.mjs`, `source-dupes.mjs`, `readme-map.mjs`.

Arithmetic properties (independently derived): score 9 ⟺ A+C ≥ 27 (since `10x/(x+3) ≥ 9 ⟺ x ≥ 27`);
`f_O < 1` for every finite x, so 10 is unreachable and 9 is terminal — the `## Axes` saturation
claim is honest. Corollary worth recording: **C=27 alone saturates the integer**; A is immaterial
to the score while C stays ≥ 27 (documented proxy saturation, not a defect). Base already scored 9
(floor(10×113/116) = 9), so the round's operability move is term growth under a held terminal
integer, exactly as the move-log row states.

## No axis harmed — formal, tool-re-derived at both ends

- Before, r56 close `e74ea6b8`: `node scripts/proxy-check.mjs` →
  `PROXY: MATCH (A=87 C=26 operability=9; C1=19/19 C2=132/132 coverage=10; S=88/88 coverage:script-layer=10; R=92/92 coverage:runtime-layer=10; K=53/53 coverage:kimi-layer=10; pins=6 match; src-rev=31c465f15669)` exit 0.
- After, R1 `f0dc6d11` (`--strict`): `PROXY: MATCH (A=90 C=27 operability=9; C1=19/19 C2=135/135 coverage=10; S=88/88 …10; R=92/92 …10; K=53/53 …10; pins=6 match; src-rev=31c465f15669)` exit 0.

All five lane integers identical before→after; only terms grew. Additionally, at base the
coverage axis read **derived 9** (`C2_TOTAL_DRIFT declared=132 computed=133` + `AXES_DRIFT
row=10 derived=9`, exit 1) — the R56-V3 spotcheck harm pre-existed round 57, and the round
**repaired** coverage 9 → 10 (C2 135/135; new gate live: `README_MAP: CLEAN files=135 rows=135
covered=135` exit 0, `--selftest` 14/14). Net: no axis dropped; coverage net-improved.

## Findings

- **F1 [MINOR, pre-existing, not introduced by round 57] — checklist item "Per-anchor truth
  burn-down" is runtime-sensitive.** `node scripts/anchor-truth.mjs --base e18ff1af…` reads
  `TRUTH: CLEAN` exit 0 in the canonical lane checkout (reproduced today) but `TRUTH: DRIFT`
  exit 1 (138 `REVIEW_UNBOUND` findings) on committed bytes — identically at base, R1 and tip
  (`TRUTH_TOTAL anchors=811 true=778 debt=20 unchecked=13` in all four runs). The binding review
  records are lane-working-tree wave artifacts that committed-only extractions lack. Round 57
  added zero anchor debt (byte-identical totals at base vs R1), so no harm — but a fresh clone
  would read this item red. The close receipt's `CHECKLIST: 27/27 pass` (canonical runtime) is
  therefore reproducible only where those records exist.
- **F2 [INFO] — A is working-tree-fragile.** The same canonical find in the live lane mid-wave
  reads **6276** (uncommitted seat scratch under `.ufo/waves/round-57/build/*`). The scored
  surface is committed bytes (90); any accidental scratch commit would flip proxy-check to
  DRIFT (declared 90) — the gate catches it — and the integer cannot exceed terminal 9 anyway.
- **F3 [INFO] — "minus .git" is a no-op.** `.git` and `.jj` contain 0 matching files in the
  working tree, and `git archive` extractions have no `.git`; the claim's loose find phrasing
  is equivalent to the scorecard's canonical frozen command.
- **F4 [INFO] — scratch battery 24/27 vs close receipt 27/27, fully decomposed.** Two fails are
  lane-root misdetection from a git-less scratch (`REPORTS_DIR_MISSING` resolved under my build
  dir; `.ufo` IS committed at R1 — one file, `.ufo/reports/round-33/kumitate.md`), the third is
  F1. The scored term C counts listed lines (27), not passes; the pass count is a separate
  measurement quoted with its date, per the scorecard's own convention.

## Residual risk and verification gaps

- ATTEST57/D57 predicate internals not re-audited here (seats ReviewA57Predicate /
  ReviewD57Predicate own those); I corroborated only the committed-file presence and A-delta
  of both probes.
- proxy/claims/anchor-truth runs read the live origin tree; every run reported
  `src-rev=31c465f15669` = the pinned measurement rev, so the layer terms are pinned-rev grounded.
- The close receipt `close/harm-battery.txt` was read and its key lines independently
  reproduced (PROXY MATCH at R1; item 707 exit 0 in the lane), but the full 27-item battery was
  not re-executed end-to-end in the lane (only in scratch, where 24/27 is fully explained above).
- A/C measured at R1 = the report's measured close rev; the bookkeeping tip differs from R1 by
  receipts/scorecard slots per its commit messages (not re-diffed file-by-file; the C2/README-map
  terms at tip were not re-measured — nothing in scope suggests they moved).

Evidence: `artifact://` none; full command/stdout/exit-code log at
`.ufo/waves/round-57/build/ReviewAxisMove/EVIDENCE.md` (path relative to
/home/vgpnk/Projects/shokunin/kumitate-shokunin).
