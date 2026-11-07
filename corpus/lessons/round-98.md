# kumitate round 98 — lesson (round-gate id-cell class, attempt 1)

Frozen at `7038ee4c487d8c8d3116d98ec831b8e754337239`: `.ufo/waves/round-98/plan.md`,
`.ufo/waves/round-98/probe/probe98-c1.mjs`, generator, 15 pre-data controls and open receipts. R97 spotcheck adopted before freeze
(`42f08b17`, DRIFT → CLEAN). Spec/dispatch `8a6a4490`; WAVE-DONE received for 12 seats, none dead.
M = `6172bd82f1a9e0cb82e6d7ba1dbc81dfe6646edd` (READY round-gate sha256 `e7c1455e…`);
M2 = `94195b83d9e61554469e1b13153f262bd2643912` (sha256 `84ebaf9f…`, only selftest arms added).

C1 operability (lowest non-retired, 9 terminal): R98 changes `SOURCES_ROW_RE` from `\s` pads to
`^ {0,3}\|[ \t]*S\d{3,}[ \t]*\|`, inside/outside alike; everything else unchanged. BASE declares
82 pins vs census-valid 22, outside 108 vs E12 28, malformed 82 vs valid E01 22 on FIX-A
(`.ufo/waves/round-98/controls/ctl-nothing.txt`). Frozen counter at M: HELD twice (K98ExecTool score1/score2);
at M2: `.ufo/waves/round-98/close/probe-m2-1.txt` and `.ufo/waves/round-98/close/probe-m2-2.txt`. No score integer increase; repaired instrument.

## Gate

- **admit — round-gate R98 at M/M2.** K98Reviewer: regex exactly R98; all other production branches
  byte-identical, 20 hand cases and 286-row matrix against live census; `fields[1].trim()` equals census
  blank trim on every R98-admitted cell. Selftest 94 → 96 at M → 98 at M2. K98Mutation: 25 mutants,
  23 selftest kills, 2 counter-only (`[ \t]+` lead/trail). M2 arms (xxx)/(xxxi) cover zero pads,
  long pads, 8/12-digit ids, exotic pads and a file-start BOM; their expected census reading is
  `.ufo/waves/round-98/close-l1/m2-census-check.txt`. K2 re-mutation: `.ufo/waves/round-98/close-l1/integration-remut.txt`; M2 teeth:
  `.ufo/waves/round-98/close-l1/m2-teeth.txt`. K98CriticC H98 SURVIVES 400/400 (99 real/history, 300 seeded mutations,
  one pad matrix; BASE 382/400); its extracted harness equals the full CLI on three fixtures.
- **admit — S277**, POSIX Base Definitions Issue 8 ch. 7 Locale,
  https://pubs.opengroup.org/onlinepubs/9799919799/basedefs/V1_chap07.html, opened 2026-11-07 by L1
  (`.ufo/waves/round-98/close-l1/l1-open-posix-ch07.html`) and K98ScribeSources, HTTP 200, byte-identical
  sha256 `a5c9d6e5a971aaa47e900cbd62e6bcf9a8c8c74384242319d954095d90ef995e`.
  Located quote (§7.3.1 LC_CTYPE, `blank`, HTML line 354, 12 words): "In the POSIX locale, only the <space> and <tab> shall be included."
  The adjacent `space` entry (lines 302–303) also includes FF/LF/CR/VT. This grounds the census's
  literal blank class; S276 already grounds the wider JS class. GNU gawk manual pages were unreachable
  (two curl connection timeouts), not rejected as false.
- **admit — sources-check selftest hygiene**, K98ExecDebt READY sha256 `1def379f…`: census found from
  SHOKUNIN_ROOT or sibling path (no hardcoded home), found census exit outside 0/1 fails rather than
  skips; absence alone SKIPs with paths tried. Receipts: PASS 71/71, absent 70/70 + one SKIP,
  bad census 70/71 FAIL; real-lane JSON byte-identical (`.ufo/waves/round-98/w1/K98ExecDebt.md`). Not a second claim.
- **reject — “C98_C1 HELD certifies R98”.** K98CriticA: eight wrong recognisers reach HELD (capped pad
  length, capped id length, four extra pad classes, BOM strip, census delegation). Minimal differentials
  in `.ufo/waves/round-98/K98CriticA/minimal-diff.txt`; counter remains frozen. M2 selftests kill the expressible shapes,
  but do not repair the frozen counter. Flip: successor counter draws those dimensions and hides the
  fixed header/delegation path. Q92 records both the witness gain and its limitation.
- **reject — “all three readers now agree inside the Registry”.** K98Connector/K98CriticB:
  sources-check still JS-trims inside cells; FIX-A ID_FORM 42 vs census E02 182, rows 190 vs 349.
  The shared outside class and section grammar do not imply inside-row parity. Flip: measured repair
  of sources-check inside trim/count (r99 candidate). Not silently included in R98.
- **framing — prospective.** K98CriticB calls the claim weak: zero non-blank pads in 5,442 real rows /
  21 lanes or kumitate history. Its NBSP fixture does prove BASE CLEAN vs census E02 and candidate
  DRIFT/COMMIT_CITED_UNRESOLVED. K98Scout confirms 0 current/history mismatches. No claim of live harm.

### Rows touched (old → new)

- New: S277 — https://pubs.opengroup.org/onlinepubs/9799919799/basedefs/V1_chap07.html; mined, on-release, used-by `corpus/knowledge/round-gate-row-id-class.md`.
- No existing status/recheck/used-by changed. SOURCES 214 → 215. Census receipts in `.ufo/waves/round-98/open/census-before.txt`
  and `.ufo/waves/round-98/close/census-after.txt`. Assimilation: none; no staged theme fits this row recogniser.
- considerthese: `considerthese/2026-11-06.md` proposal 4 (class-diversity note) mined into Q92 and M98-1/2; grounded in S277/S276 and CriticA's measured gaps, not treated as evidence itself. No other proposal mined.

## Mistakes

| class | evidence pointer | captured-by | fix |
|---|---|---|---|
| M98-1 — character-grid sampling omitted classes | r97 K97CriticA six HELD readers, r97 spotcheck §5 item 1 | Q91 covered identities, not classes | 32 pad classes + Q92; ctl-zs/nbsp/asciiws UNMET, Q92 doctored-grid receipt fails. Remaining pad/id length and Cf gaps disclosed, not certified away. |
| M98-2 — nonce grid still has fixed lengths/header and partial character sets | K98CriticA eight HELD constructions | Q92 finite witnesses only | M2 arms (xxx)/(xxxi), census expectations and nine-shape teeth; successor counter routed, frozen counter unchanged. |
| M98-3 — L1 re-mutation copy lacked local cap-spawn imports | close-l1/integration-remut-invalid-missing-imports.txt (reference FAIL, no tally) | reference-control check | invalid run retained, never cited as kills; copy cap-spawn/cap-run beside mutants, rerun with reference PASS. |

## Routed to round 99

1. sources-check inside id-cell trim/count parity with census (K98Connector measurements); do not confuse
   its outside-row `[ \t]` regex with its generic inside-cell `trim()`.
2. Counter pad lengths 0/1/2/3/4/8, ids 3/7/8/12 digits, absent Zs/Cf/C0/filler witnesses, first-line BOM,
   nonce fixture header, census-unavailable/delegation control (K98CriticA).
3. Out-of-scope status case/trim and URL character class; M93-3, M93-5, R93-D1, F93 fixtures;
   sibling transfer (report-only), census gawk/bash CR disagreement (open L0 kumitate round-96).

## Conformance correction and outside check

The frozen plan's “Load done” sentence overstated the L1's actual read order: the round prompt,
prior lesson/spotcheck and scorecard were read before freeze, but shokunin/swarm bindings, the
canonical protocol and fleet mission/axes/corpus/learning were opened only during integration.
This is a read-order defect, not retrospectively cured by the late reads; the frozen plan is
unchanged. The next round must load those inputs before choosing a claim.
Outside non-author admit/reject spot-check is pending the orchestrator's closure; dispatched seats
are still the lane and are not credited as that independent judgment.
