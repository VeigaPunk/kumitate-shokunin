# K98ExecTool — w1 report

Candidate: `.ufo/waves/round-98/K98ExecTool/round-gate.mjs` sha256 `e7c1455e8e8afa1267a35de4f4fce86b007104989aafd6783319cef1bb7ed01f` (READY written).
Change: `SOURCES_ROW_RE` = `/^ {0,3}\|[ \t]*S\d{3,}[ \t]*\|/` + doc comment; header doc paragraph updated one sentence. All else byte-identical (diff.txt).
Selftest: 94/94 before → 96/96 after (selftest.txt; arms xxviii/xxix next to r95/r96 arms, hermetic, exact declared/outsideRows/malformedRows assertions).
Arm teeth: arm-teeth.txt 14/14 (BASE \s + 13 shapes; insideonly killed by xxix, outsideonly by xxviii, rest both).
Counter: score1.txt `C98_C1: HELD a=1/1 b=1/1 c=1/1 d=81/81 e=1/1 seed=f47aaa87e809dd38`; score2.txt `C98_C1: HELD a=1/1 b=1/1 c=1/1 d=81/81 e=1/1 seed=e14f949f2bad282c`.
Receipts: selftest.txt, score1.txt, score2.txt, diff.txt, sha256.txt, arm-teeth.txt, READY — all in `.ufo/waves/round-98/K98ExecTool/`.
Notes: cap-spawn.mjs/cap-run.mjs copied beside candidate (selftest needs them). No tools installed. Scratch removed before yield.
