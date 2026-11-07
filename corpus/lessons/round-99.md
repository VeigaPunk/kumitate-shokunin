# kumitate round 99 — lesson (sources-check cell-trim class, attempt 1)

Frozen at `f480124b5216d66b8bd74162bc2f61eabaffb8b2`: `.ufo/waves/round-99/plan.md`, `.ufo/waves/round-99/probe/probe99-c1.mjs`, generator,
17 pre-data controls (all match expected: `.ufo/waves/round-99/controls/OBSERVED.txt`), read-order log and checker (`.ufo/waves/round-99/open/`). R98 spot-check
adopted before freeze (`f9cd1bff`, DRIFT → CLEAN). Spec/dispatch `206e13dd`; WAVE-DONE received for 12 seats, none dead.
M = `b914f5c5a25fac45f8460921ef331d30a68edb28` (K99ExecTool READY sha256 `50b94567…`, selftest 90/90);
M2 = `ff8f686e83e3da948dd3b4009b846d418297551b` (sha256 `75ac6972…`, seven selftest arms only, 97/97).

C1 operability (lowest non-retired, 9 terminal): R99 — `sources-check` `trim` strips only ASCII SP/TAB from both
ends, every caller. Frozen counter HELD twice at M (`.ufo/waves/round-99/close/probe-m-{1,2}.txt`) and twice at M2
(`.ufo/waves/round-99/close/probe-m2-{1,2}.txt`); do-nothing control UNMET a=0 b=0 c=0 d=0 e=0 (`.ufo/waves/round-99/controls/ctl-nothing.txt`).

## Gate

- **admit — sources-check R99 at M/M2.** K99Reviewer: production change is the `trim` helper only (+doc comments),
  15 call sites listed, 20/20 hand cases equal the census (`.ufo/waves/round-99/w1/K99Reviewer.md`). K99CriticC independent differential
  H99: 943/943 scored rows agree with the live census on two seeds, BASE 704/943 (`.ufo/waves/round-99/K99CriticC/H99.md`). K2: L1
  re-mutation of the shipped bytes kills 15/15 control shapes at M and at M2 (`.ufo/waves/round-99/close-l1/integration-remut-M.txt`,
  `.ufo/waves/round-99/close-l1/integration-remut.txt`); K99Mutation 23/26 behaviour mutants killed at M, survivors m15/m20/m23.
- **admit — M2 selftest arms.** Seven arms for the wave's survivors: m15 unanchored trim, m23 pad-only id, K99CriticA
  k01 NUL / k02 U+0080 / k03 capped blank / k04 JS on text cells / k08 empty-id counted / k09 BOM sniff. L1 teeth:
  `M2_TEETH: killed=9/9 reference=PASS` (`.ufo/waves/round-99/close-l1/m2-teeth.txt`). m20 (used-by parts keep JS) deliberately not pinned.
- **admit — S278**, Unicode PropList.txt 17.0.0, https://www.unicode.org/Public/17.0.0/ucd/PropList.txt, opened
  2026-11-07 by L1 (`.ufo/waves/round-99/open/l1-open-unicode-proplist-17.0.0.txt`) and K99ScribeSources, HTTP 200, byte-identical sha256
  `130dcddcaadaf071008bdfce1e7743e04fdfbc910886f017d9f9ac931d8c64dd`. Located quote (file line 14, 4 words):
  "0085 ; White_Space # Cc" — NEL is White_Space while JS trim keeps it; U+FEFF/U+200B absent from the file
  (`grep -c` 0), while JS trim strips U+FEFF.
- **admit — S279**, POSIX XCU Issue 8 ch. 2, https://pubs.opengroup.org/onlinepubs/9799919799/utilities/V3_chap02.html,
  opened 2026-11-07 by K99ScribeSources (sha256 `0889867a…`); § 2.14.1 defers to XBD § 9.3.5, re-fetched by L1
  2026-11-07 (`.ufo/waves/round-99/close-l1/l1-open-xbd-ch09.html`, sha256 `2f5f60e9…`, = scribe capture). Located quote (V1_chap09.html
  lines 276–277, 21 words): "The set of single characters that belong to the character class, as defined in the
  LC_CTYPE category in the current locale." Grounds why the census `trim_cell` `[[:space:]]` moves with the locale.
- **reject — "C99_C1 HELD certifies R99".** K99CriticA: eleven wrong constructions reach HELD (blank+NUL, blank+U+0080,
  cap 17, JS on text cells, title/size/order/BOM/SHOKUNIN_ROOT sniffs, empty-id counting, absolute-path census
  delegation); one (BOM sniff) is seed-dependent on the same bytes (`.ufo/waves/round-99/K99CriticA/constructions.md`). The counter is a
  refutation budget, not a proof; M2 arms kill the six expressible shapes, sniffing/delegation stay instrument gaps.
- **reject — "R99 is census parity everywhere".** K99CriticB D3 + L1 measurement: on used-by path parts the census
  reads with bash `trim_cell` `[[:space:]]`, locale-dependent. Over the 44 counter pad classes: BASE agrees with census
  E11 22/44 (C) and 37/44 (C.UTF-8, en_US.UTF-8); M2 39/44 (C) and 24/44 (UTF-8) (`.ufo/waves/round-99/close-l1/usedby-agreement.txt`).
  Under the host's default UTF-8 locale R99 agrees less on this out-of-scope helper — a disclosed trade (0 live rows
  carry such pads), frozen R99 unchanged, routed with an L0 question.
- **reject — fixing cite-sources/source-capture this round.** K99ExecSibling measured both `\s` readers
  (cite-sources 8 ids vs census 3; source-capture 14 vs 3) and wrote fixes that agree with the census, but they are
  outside the frozen claim; diffs kept in `.ufo/waves/round-99/K99ExecSibling/`, routed to round 100.
- **framing — prospective.** K99Scout/K99CriticB/K99ExecSibling: 0 non-blank pads in 5,460–5,555 live rows / 21 lanes and
  80 historical kumitate blobs (K99Scout); BASE vs M JSON byte-identical on 21/21 lanes and 78/78 committed kumitate `corpus/SOURCES.md`
  revisions (`.ufo/waves/round-99/K99ExecHarm/history.txt`, `same=78 differ=0`).

### Rows touched (old → new)

- New: S278 — https://www.unicode.org/Public/17.0.0/ucd/PropList.txt; mined, on-release, used-by `corpus/knowledge/sources-check-cell-trim-class.md`.
- New: S279 — https://pubs.opengroup.org/onlinepubs/9799919799/utilities/V3_chap02.html; mined, on-release, used-by `corpus/knowledge/sources-check-cell-trim-class.md`.
- No existing status/recheck/used-by changed. SOURCES 215 → 217. Census receipts `.ufo/waves/round-99/open/census-before.txt` and
  `.ufo/waves/round-99/close/census-after.txt`. Search log note added (GNU Bash manual unreachable three times, not rejected).
- Assimilation: none (no `merge/kumitate/` theme fits a cell-trim class).
- considerthese: `considerthese/2026-11-06.md` proposal 1 (arithmetic/tally cross-check), opened 2026-11-07 — mined as
  `.ufo/waves/round-99/close-l1/tally-recount.sh`, which re-counts the round's printed tallies (controls 17/17, REMUT 15/15, selftest 97)
  from receipt rows (`.ufo/waves/round-99/close-l1/tally-recount.txt`). Sole proposal mined this round.

## Mistakes

| class | evidence pointer | captured-by | fix |
|---|---|---|---|
| M99-1 — a frozen plan's load statement was prose, so a read-order defect could not fail | r98 lesson `corpus/lessons/round-98.md` § Conformance correction: the frozen plan said "Load done" while the shokunin/swarm bindings, canonical protocol and fleet mission/axes/corpus/learning were opened only during integration; r98 verifier spot-check § 5 item 1 | none — prose statement, no bytes to check | r99 replaced the statement with `.ufo/waves/round-99/open/read-order.log` (27 lines, upper-bound times) and `.ufo/waves/round-99/probe/read-order-check.py`; the checker is shown able to fail: `.ufo/waves/round-99/open/read-order-red.txt` (r98 log NO_LOG, two doctored logs, the r99 log against the earlier adoption commit `AFTER_FREEZE line=27`, all exit 1) and this seat's own doctored runs (`.ufo/waves/round-99/K99ScribeLesson/receipts/read-order-check.txt`: `CANONICAL_AFTER_CLAIM line=25` exit 1 after moving MISSION.md past the claim; `CANONICAL_AFTER_CLAIM line=11` exit 1 after moving the claim before the canonical block) against `READ_ORDER: CLEAN entries=27 canonical=8 claim=2026-11-07T03:17:58-03:00 freeze=2026-11-07T03:32:35-03:00` exit 0. Registered as Q93 below. |
| M99-2 — a shipped selftest that pins no instance of the rule it certifies: green under every wrong reader | `.ufo/waves/round-99/controls/OBSERVED.txt`: `h=1/1` on all 17 lines, i.e. BASE `--selftest` passes with the do-nothing trim (`ctl-nothing`), the 15 violating controls (`ctl-spaceonly`, `ctl-asciiws`, `ctl-nbsp`, `ctl-zs`, `ctl-leadonly`, `ctl-trailonly`, `ctl-padcap3`, `ctl-bomstrip`, `ctl-cfstrip`, `ctl-c0strip`, `ctl-pystrip`, `ctl-idonly`, `ctl-enumonly`, `ctl-countall`) and the out-of-scope split (`ctl-splitjs`); plan § Pre-data controls states the same property | the pre-data control sweep, built before the freeze — no earlier instrument existed (r98 § Gate certified a selftest count, not a blank-class arm) | candidate selftest arms with teeth on all 16 shapes plus a K2 re-mutation of the shipped code; the frozen counter's verdict is unchanged by this defect, it is routed to the selftest owner. |
| M99-3 — a frozen plan counted its own fixture grid in prose, and the number is wrong | plan § C1 "47 pad classes (SP, TAB, …)"; the `PADS` literal at `.ufo/waves/round-99/probe/probe99-c1.mjs` lines 59–68 holds 44 keys (the round brief names 46–56, which misses the literal) — `python3 .ufo/waves/round-99/K99ScribeLesson/padclass-table.py .ufo/waves/round-99/probe/probe99-c1.mjs .ufo/waves/round-99/open/l1-open-unicode-proplist-17.0.0.txt` prints `# classes=44 js_and_blank=4 js_only=27 blank_only=0 neither=13` (`.ufo/waves/round-99/K99ScribeLesson/receipts/padclass-table.txt`) | none — a prose count; no round gates on it | counts in the knowledge entry are derived from the artifact by command, never the prose; the frozen plan is not amended (K4). |


## Routed to round 100

1. used-by path-part class: the census itself splits (`row_pass` `[ \t]` vs `usedby_findings` `[[:space:]]`); pick the
   lane's class after the L0 answer (`kumitate | round-99 | used-by …`); M2 agreement 24/44 UTF-8 vs BASE 37/44.
2. `scripts/cite-sources.mjs:36` and `scripts/source-capture.mjs:157` `\s` row readers — fixes measured in
   `.ufo/waves/round-99/K99ExecSibling/` (agree with census on the fixture), not landed.
3. Counter gaps (K99CriticA): provenance sniffing (title/size/order/BOM/SHOKUNIN_ROOT), census delegation, undrawn
   classes (NUL, U+0080, …), pad runs > 16, the five unpadded cells, empty-id rows; plan prose "47 pad classes" vs 44 (M99-3).
4. Carried: status/URL classes in round-gate, M93-3/M93-5/R93-D1/F93, census gawk/bash CR L0 `kumitate | round-96`.

## Outside check

Outside non-author admit/reject spot-check is pending the orchestrator's closure; dispatched seats are the lane and are
not credited as that independent judgment.
