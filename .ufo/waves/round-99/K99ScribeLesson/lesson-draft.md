# kumitate round 99 — lesson draft (cell-trim class, attempt 1) — scribe draft, not filed

Draft only: `## Gate` and `### Rows touched` belong to the L1 at close (S278/S279 ids are assigned at
integration; the registry stands at S277). This file carries the two sections the round mined: `## Mistakes`
and the `### Q93` registration. Freeze `f480124b5216d66b8bd74162bc2f61eabaffb8b2`; lane base
`f9cd1bff147508f0d787f9e0cc4d2191aabaf02a`.

## Mistakes

| class | evidence pointer | captured-by | fix |
|---|---|---|---|
| M99-1 — a frozen plan's load statement was prose, so a read-order defect could not fail | r98 lesson `corpus/lessons/round-98.md` § Conformance correction: the frozen plan said "Load done" while the shokunin/swarm bindings, canonical protocol and fleet mission/axes/corpus/learning were opened only during integration; r98 verifier spot-check § 5 item 1 | none — prose statement, no bytes to check | r99 replaced the statement with `.ufo/waves/round-99/open/read-order.log` (27 lines, upper-bound times) and `probe/read-order-check.py`; the checker is shown able to fail: `open/read-order-red.txt` (r98 log NO_LOG, two doctored logs, the r99 log against the earlier adoption commit `AFTER_FREEZE line=27`, all exit 1) and this seat's own doctored runs (`K99ScribeLesson/receipts/read-order-check.txt`: `CANONICAL_AFTER_CLAIM line=25` exit 1 after moving MISSION.md past the claim; `CANONICAL_AFTER_CLAIM line=11` exit 1 after moving the claim before the canonical block) against `READ_ORDER: CLEAN entries=27 canonical=8 claim=2026-11-07T03:17:58-03:00 freeze=2026-11-07T03:32:35-03:00` exit 0. Registered as Q93 below. |
| M99-2 — a shipped selftest that pins no instance of the rule it certifies: green under every wrong reader | `.ufo/waves/round-99/controls/OBSERVED.txt`: `h=1/1` on all 17 lines, i.e. BASE `--selftest` passes with the do-nothing trim (`ctl-nothing`), the 15 violating controls (`ctl-spaceonly`, `ctl-asciiws`, `ctl-nbsp`, `ctl-zs`, `ctl-leadonly`, `ctl-trailonly`, `ctl-padcap3`, `ctl-bomstrip`, `ctl-cfstrip`, `ctl-c0strip`, `ctl-pystrip`, `ctl-idonly`, `ctl-enumonly`, `ctl-countall`) and the out-of-scope split (`ctl-splitjs`); plan § Pre-data controls states the same property | the pre-data control sweep, built before the freeze — no earlier instrument existed (r98 § Gate certified a selftest count, not a blank-class arm) | candidate selftest arms with teeth on all 16 shapes plus a K2 re-mutation of the shipped code; the frozen counter's verdict is unchanged by this defect, it is routed to the selftest owner. |
| M99-3 — a frozen plan counted its own fixture grid in prose, and the number is wrong | plan § C1 "47 pad classes (SP, TAB, …)"; the `PADS` literal at `probe/probe99-c1.mjs` lines 59–68 holds 44 keys (the round brief names 46–56, which misses the literal) — `python3 .ufo/waves/round-99/K99ScribeLesson/padclass-table.py .ufo/waves/round-99/probe/probe99-c1.mjs .ufo/waves/round-99/open/l1-open-unicode-proplist-17.0.0.txt` prints `# classes=44 js_and_blank=4 js_only=27 blank_only=0 neither=13` (`K99ScribeLesson/receipts/padclass-table.txt`) | none — a prose count; no round gates on it | counts in the knowledge entry are derived from the artifact by command, never the prose; the frozen plan is not amended (K4). |

## Q93 — a frozen plan's load statement is a timestamped read-order log checked against the freeze commit (round 99)

- **Rule.** A frozen plan does not assert that the canonical inputs were read; it carries a read-order log,
  one line per input — `<latest-possible ISO time> <role> <path>`, roles `prompt|prior|canonical|binding|lane|claim`
  — committed with the freeze. A checker exits 0 only if the log exists, names every required canonical
  input and both host bindings, has exactly one `claim` line with every `canonical` line at or before it, and
  every line is at or before the freeze commit's committer time; otherwise it prints the first reason and
  exits 1 (usage/unresolvable freeze: 2).
- **Grounding.** M99-1: round 98's plan said the load was done in prose while the bindings, canonical protocol
  and fleet mission/axes/corpus/learning were opened during integration (r98 lesson § Conformance correction;
  r98 verifier spot-check § 5 item 1). No prose statement can fail, so the defect survived to the lesson.
  Round 99's log records the canonical block at 03:15:47, the claim at 03:17:58, the lane reads at 03:25:52,
  and the freeze commit at 03:32:35.
- **Who checks.** The L1 before freezing (writes the log, runs the checker, commits both); the closure re-runs
  it against the freeze revision.
- **Command.**
  `python3 .ufo/waves/round-99/probe/read-order-check.py --log .ufo/waves/round-99/open/read-order.log --freeze f480124b`
  → `READ_ORDER: CLEAN entries=27 canonical=8 claim=2026-11-07T03:17:58-03:00 freeze=2026-11-07T03:32:35-03:00`,
  exit 0. Receipt: `.ufo/waves/round-99/K99ScribeLesson/receipts/read-order-check.txt`.
- **Fails when.** The log is missing (`NO_LOG`); a required canonical path or `skill://` binding is absent
  (`MISSING_CANONICAL`, `MISSING_BINDING`); a `canonical` line is later than the claim (`CANONICAL_AFTER_CLAIM`);
  any line is later than the freeze commit (`AFTER_FREEZE`); a time or line shape does not parse
  (`BAD_TIME`, `BAD_LINE`); the claim line count is not one (`CLAIM_LINES`).
- **Shown able to fail.** Frozen `open/read-order-red.txt`: r98 has no log (`DRIFT NO_LOG`, exit 1); a log
  with `PROTOCOL.md` moved after the claim (`DRIFT CANONICAL_AFTER_CLAIM line=12`, exit 1); a log with the
  `skill://swarm` line removed (`DRIFT MISSING_BINDING skill://swarm`, exit 1); the r99 log run against the
  earlier adoption commit `f9cd1bff` (`DRIFT AFTER_FREEZE line=27`, exit 1). This seat reproduced two of the
  shapes on scratch copies (`receipts/read-order-check.txt`: `CANONICAL_AFTER_CLAIM line=25` and `line=11`,
  both exit 1) and re-ran the clean log at the full freeze sha (exit 0), so the checker reads the bytes it
  is given.
- **Limit (observed).** The times are authored upper bounds from `date -Iseconds` output, not observation:
  the check proves the log is internally ordered, complete and consistent with the freeze commit's time — it
  cannot prove a page was read or understood. `REQUIRED_CANONICAL` and `REQUIRED_BINDING` are code constants,
  so a new canonical input passes silently until the checker is edited. The `AFTER_FREEZE` arm compares
  committer time, which is conservative in one direction only: a read that happened before the commit but is
  logged after it fails, while a fabricated earlier timestamp passes. The log binds rounds from 99 on; r98's
  missing log is reported, not retro-filled.
