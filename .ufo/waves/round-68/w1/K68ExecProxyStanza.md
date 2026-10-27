VERDICT: The refreshed stanza is drafted and archive-verified `PROXY: MATCH … exit 0` on a fixture commit, but it cannot be applied alone: the close also needs two gate-pin additions in `scripts/proxy-check.mjs` plus their re-pin, because `--strict` (checklist item 8) fails on two `PIN_UNPINNED` warnings that no term correction removes.

## Evidence

Freeze commit (what the round is frozen on; worktree tracked == HEAD):
```
$ git -C /home/vgpnk/Projects/shokunin/kumitate-shokunin rev-parse HEAD
39f61816d4ee7a8d401df42c1818c91a9c537bce
$ node scripts/proxy-check.mjs      # exit=1
PROXY: DRIFT (A_DRIFT term=A declared=351 computed=548 delta=+197; C2_DRIFT term=C2 declared=156 computed=163 delta=+7; C2_TOTAL_DRIFT …; K_MEMBERS_DRIFT … declared=49 computed=53 delta=+4; K_SECTIONS_DRIFT …; PIN_UNPINNED term=scripts/harm-matrix.mjs; PIN_UNPINNED term=scripts/routed-ledger.mjs; src-rev=31c465f15669)
```
Post-round terms, each re-derived (not trusted from the tool):
```
$ git ls-tree -r --name-only HEAD | grep -cE '\.(mjs|js|sh|py)$'            → 548
$ grep -cE '^\s*- \[' SKILL.md                                              → 33   (+1 new item ⇒ C=34)
$ grep -cE '^\| `(knowledge|lessons)/' corpus/README.md                     → 163
$ find corpus/knowledge corpus/lessons -maxdepth 1 -name '*.md' | wc -l     → 163  (60 knowledge + 103 lessons)
$ git show d23892ad:corpus/README.md | grep -cE '^\| `(knowledge|lessons)/'  → 161   (base)
$ git show --stat 39f61816 | grep README   → corpus/README.md | 2 +            (freeze added the 2 spotcheck rows)
$ node scripts/readme-map.mjs               → README_MAP: CLEAN files=163 rows=163 covered=163
$ node scripts/kimi-census.mjs              → KIMI_CENSUS: CLEAN (members=53 checked=53 chain=10 info=4)
```
Drafted stanza applied in a fixture clone (`git clone --shared`, commit `760c7b8e3352f8c61f744e24774fc1c88535dc40`) and measured over `git archive`:
```
$ node <extraction>/scripts/proxy-check.mjs --self <extraction> --strict ; exit=0
PROXY: MATCH (A=548 C=34 operability=9; C1=19/19 C2=165/165 coverage=10; S=88/88 coverage:script-layer=10; R=92/92 coverage:runtime-layer=10; K=53/53 coverage:kimi-layer=10; pins=6 match; src-rev=31c465f15669)
$ node lane/scripts/proxy-check.mjs --selftest  → PROXY_SELFTEST: 122/122 pass / VERDICT: PASS
```
Control — same stanza terms, gate-pin block lines removed (proves terms alone are not enough):
```
$ node lane2/scripts/proxy-check.mjs --self lane2            ; exit=0 → PROXY: MATCH (A=548 C=34 … pins=6 match; src-rev=31c465f15669)
$ node lane2/scripts/proxy-check.mjs --self lane2 --strict    ; exit=1 → PROXY: DRIFT (PIN_UNPINNED term=scripts/harm-matrix.mjs; PIN_UNPINNED term=scripts/routed-ledger.mjs; src-rev=31c465f15669)
```
Full transcripts: `.ufo/waves/round-68/build/K68ExecProxyStanza/evidence.txt` (§1–§8).

## Findings

**K68ExecProxyStanza-1 — high — the stanza has been stale for three rounds and fails at the freeze.** The base block declares `A=351 C2=156 C2_total=156 K=49 K_sections=49`; the tree measures `548/163/163/53/53`. So `node scripts/proxy-check.mjs` is `PROXY: DRIFT` exit 1 at `39f61816`, i.e. the lane opens the round with checklist item 8 red before any seat writes. Repro: `node scripts/proxy-check.mjs` (exit 1). Routed at round 65 (README row 195 "proxy stanza") and never liquidated; the drift is monotone because `A` counts round probes/build artifacts (round-45 SCORECARD note).

**K68ExecProxyStanza-2 — high — the block text alone cannot reach `--strict` MATCH.** Two `scripts/*.mjs` files carry no pin key: `scripts/harm-matrix.mjs` (round-65 instrument) and `scripts/routed-ledger.mjs` (C1's own gate). `--strict` promotes `PIN_UNPINNED` to drift, and `SKILL.md:714` runs `--strict`. Measured: with the terms corrected but no gate pins, default mode prints `PROXY: MATCH … exit 0` while `--strict` prints `PROXY: DRIFT (PIN_UNPINNED …; PIN_UNPINNED …)` exit 1. Fix requires the code edit (`GATE_PINS` in `scripts/proxy-check.mjs`, since `parseGatePins` rejects unknown keys) + the two block lines + a re-hash of `pin.proxy-check`; with all three the fixture is `MATCH` exit 0 and `--selftest` stays 122/122. Repro: `stanza.md` §1–§2, control in `evidence.txt` §7.

**K68ExecProxyStanza-3 — medium — `A` is worktree-relative and is moving while the wave runs, so any literal written now will drift.** Tracked at the freeze commit: 548 (`ls-tree`). Worktree: 555 at 11:52, 556 at 11:58 — the delta is untracked seat artifacts under `.ufo/waves/round-68/build/` (7 files at t1: `K68ExecCounterRehearsal/ctl/*.sh`, `K68ExecPins/*.mjs|.sh`, `K68ExecReadmeFix/apply.mjs`, `K68ScribeQuality/ledger67-probe-as-frozen.mjs`) and it only grows. Since every consumer measures `git archive`, `A` must be filled from `git ls-tree -r --name-only <close-rev> | grep -cE '\.(mjs|js|sh|py)$'` after the wave stops writing (equivalence proved: tracked 548 = archive 548; 0 of 16 committed symlinks carry a runnable name, the one case `ls-tree` and `walkFiles` would disagree). Repro: `evidence.txt` §2.

**K68ExecProxyStanza-4 — medium — the plan's C2 premise is already repaired at its own freeze, and the counter cannot see the error.** `plan.md` says the round-66/67 verifier-spotcheck lessons "landed without README map rows" (`README_MAP: DRIFT files=163 rows=161`) and that this round repairs them. The freeze commit `39f61816` ("readme-map inherited repair") already added both rows: base `d23892ad` has 161 rows / 163 notes, the freeze has 163/163 and `README_MAP: CLEAN`. A drafter who follows the plan literally adds 4 rows and declares `C2=167 C2_total=165` — which still scores coverage 10 and is *not* a drift kind (`C2` is a raw row count, compared only to its declared integer), so the misdeclaration survives every gate. Correct delta: +2 (the entry and one lesson), `C2=C2_total=165`. This is a strengthening note for the L1 (plan is frozen; not edited).

**K68ExecProxyStanza-5 — low — pin sequencing hazard on `pin.routed-ledger`.** The current bytes hash `f92a364d…`; C1 rewrites the file to v2 this round, so that value is invalid at close and `GATE_PIN_DRIFT` would fire. Hash after the v2 edit. Likewise `pin.proxy-check` `121c02f3…` is valid only for the exact two-line `GATE_PINS` hunk (re-hash if the L1 touches that file otherwise).

**K68ExecProxyStanza-6 — low/info — `C` cannot move the axis.** `operability = floor(10·(A+C)/(A+C+3))` = 9 for `A=548, C=33` and for `C=34` alike; the integer is terminal, so the checklist item the round adds is bookkeeping, not a score move. The stanza must still declare it or `C_DRIFT` fails item 8.

## Artifacts

- `/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-68/build/K68ExecProxyStanza/stanza.md` — the draft: three edits in order (patch to `GATE_PINS`, gate-pin block lines, the full 23-key replacement block), the `A` fill rule and command, per-term derivations, the expected `PROXY: MATCH` line (literal for `A=548` and the fill-time template), and the close-time verification loop.
- `/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-68/build/K68ExecProxyStanza/evidence.txt` — verbatim receipts §1–§8 (base DRIFT, A samples, counts, K census, archive+strict MATCH, selftest, gate-pin-off control, hashes).
- This report.

## Limits

- Draft only: nothing was applied to `SCORECARD.md`, `SKILL.md`, `scripts/` or `corpus/` — that is the L1's edit, and the fixture used a clone (`--shared`) at the freeze commit.
- `A` at close is unknown by construction; the draft fixes the rule, not the number. The literal `A=548` is correct only for an archive in which no runnable file is added after `39f61816`.
- I did not run the round's own counters (`ledger68-probe.mjs`, `deprec68-probe.mjs`), the ledger v2 selftest, or any C1/C2 claim measurement — other seats own those.
- The `pin.proxy-check` value is byte-exact for the quoted hunk only; a differently placed or additionally edited change yields another sha (and `PIN_DRIFT` will say so).
- No tool was installed or upgraded; no pacman transaction was run.
- Scratch `/fast/scratch/hyaku/kumitate-r68/K68ExecProxyStanza/` was deleted after the receipts above were copied into the build dir.
