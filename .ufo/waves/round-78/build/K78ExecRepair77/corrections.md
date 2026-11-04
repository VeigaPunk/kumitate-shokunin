# Paste-ready append-only round-77 errata

Append to the named documents; retain all original filed report, lesson and receipt bytes.
Evidence paths below are relative to the lane, except the explicitly labelled fleet-root report/template.

## D1 — append to corpus/lessons/round-77.md

Round-78 erratum (D1): the close cell of the `## Counters` row `proxy A / C / C2 / C2_total` at line 104 is superseded by **857 / 37 / 186 / 186**, not 856 / 37 / 186 / 186, as recorded in `.ufo/waves/round-77/close/proxy-json.txt:23-28`; this correction makes no claim about the open cell.

## D2 — append to corpus/lessons/round-77.md and the round-77 report

Round-78 erratum (D2): both round-77 base controls were re-scored against archived base `a321ed8006083be1086a3b991a78d3b4c26f0be9` using the final counter from `e47266ae093e6f4ba6b30507606c6b7f2b70903f`, SHA-256 `d48390c3e2490f2363e31bec6085ca21b5b31cb7bec99b2295580c7a873c4604` (equal to the lane-tip counter bytes); C1 reads `C77_C1: UNMET held=1/12`, exit 1, and C2 reads `C77_C2: UNMET held=2/13`, exit 1. These corrected receipts supersede the old controls' instrument attribution, not their unchanged held counts: `.ufo/waves/round-78/build/K78ExecRepair77/c77-c1-base-final.txt` and `c77-c2-base-final.txt` retain the command, final probe SHA, every per-arm line, stdout, stderr and exit.

## D3 — append to the fleet-root .ufo/reports/round-77/kumitate.md

Round-78 erratum (D3): the line `FLOOR wave1 spawned executor=2/3 scribe=2/1 scout=2/1 connector=1/1 reviewer=2/1 critic=1/1 verdict=met` does not meet the `templates/round-prompt.md:82-88` minimum role split, which requires three executors; the correct verdict under that floor is **unmet (executor shortfall: 2/3)**. The L1 held the canonical planner seat, as already disclosed, but that does not supply a third executor; no alternate executor-floor definition is claimed. Round 78 uses the template's three-executor floor.

## D4 — append to corpus/lessons/round-77.md

Round-78 erratum (D4): the three SQLite quotes in `## Gate` at lines 22–26 contain respectively **23 (§4.2), 20 (§4.4), and 25 (§9.5) whitespace-delimited words**; the latter two annotations (21 and 24) are superseded by 20 and 25. All three quotes remain within the ≤25-word bound; their quoted text is unchanged.

## D5 — append to the round-77 report (do not alter the historical receipt)

Round-78 erratum (D5): the exact supplemental loader command in `.ufo/waves/round-77/open/r76-freeze-fix-6-disposition.txt:9` was re-run and exited **1**, not the `exit=0` annotated at line 13, with `ERR_MODULE_NOT_FOUND`; full command/stdout/stderr/exit are retained in `.ufo/waves/round-78/build/K78ExecRepair77/loader-final.txt`. This corrects the supplemental `spotcheck-adopt-absent.mjs` demo's exit annotation only, not the separate historical module-absence evidence or an unexecuted replay of the original r76 loader path.

## D6 — append to corpus/lessons/round-77.md

Round-78 inherited-state disposition (D6; r76 routed item 3 / r75 D4): `round-gate --close` reporting `UPSTREAM_MISSING` on jj detached HEAD remains an **operator-owned instrument outside lane repair authority**; disclose the refusal without weakening the gate. This carries the why-not from `.ufo/waves/round-77/build/K77ScribeDocs/round-77-lesson.md:25` into the durable lesson and dispositions `corpus/lessons/round-76-verifier-spotcheck.md:170-174`; no repair or fresh round-gate execution is claimed.
