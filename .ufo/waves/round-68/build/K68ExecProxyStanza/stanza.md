# Draft — refreshed `kumitate-proxy-v1` stanza (round 68 close)

Drafted by seat `K68ExecProxyStanza`. Measured at the freeze commit
`39f61816d4ee7a8d401df42c1818c91a9c537bce` (worktree clean apart from the untracked wave
dirs) and proved on a fixture clone committed at `760c7b8e3352f8c61f744e24774fc1c88535dc40`
over `git archive` (scratch, deleted). The L1 applies; this file only drafts.

## 0. Why three edits and not one

The block text alone does **not** reach `--strict` MATCH. `--strict` promotes warnings
to drift, and the lane carries two `PIN_UNPINNED` warnings
(`scripts/harm-matrix.mjs`, `scripts/routed-ledger.mjs`) that no pin key covers.
Checklist item 8 (`SKILL.md:714`) runs `--strict`, so the close needs all three edits:

| # | file | edit | why |
|---|---|---|---|
| 1 | `scripts/proxy-check.mjs` | two `GATE_PINS` entries (§1) | a gate pin key must exist in code; `parseGatePins` rejects unknown keys (`GATE_PIN_KEY_UNKNOWN`) |
| 2 | `SCORECARD.md` `<!-- kumitate-gate-pins-v1` | two sha256 lines (§2) | binds the two gate files, suppresses their warnings |
| 3 | `SCORECARD.md` `<!-- kumitate-proxy-v1` | the 23-key block (§3) | the declared terms |

Edit 1 changes the bytes `pin.proxy-check` declares, so the order is 1 → hash → 3.
Edit 1 was proved not to disturb the hermetic suite: `PROXY_SELFTEST: 122/122 pass` /
`VERDICT: PASS`, exit 0, on the fixture clone with the two keys added.

If the L1 refuses edit 1 (proxy-check.mjs is a pinned gate), then **there is no
`--strict` MATCH this round**: default mode reaches `PROXY: MATCH` exit 0 with the two
warnings printed, `--strict` stays `PROXY: DRIFT (PIN_UNPINNED …; PIN_UNPINNED …)` exit 1
(measured; `evidence.txt` §7). The three edits are the only path measured to exit 0.

## 1. Patch — `scripts/proxy-check.mjs`

Append these two lines to `GATE_PINS` (after `pin.report-receipt-diff`, before `};`, i.e.
after line 483 at the freeze commit):

```diff
   'pin.report-receipt-diff': 'scripts/report-receipt-diff.mjs', // proxy-check PIN_UNPINNED: no pin key covered this file
+  'pin.harm-matrix': 'scripts/harm-matrix.mjs', // round 68: proxy-check PIN_UNPINNED (round-65 instrument, never pinned)
+  'pin.routed-ledger': 'scripts/routed-ledger.mjs', // round 68: C1's gate, registry home; pinned with its v2 advance
 };
```

With exactly this hunk: `sha256sum scripts/proxy-check.mjs` =
`121c02f3407391ab23adca05a73d42ccbead84ec152e9a96318ca3e9ef5079b6`.
Any other change to that file invalidates this value — re-hash and use the new one in §3.

## 2. Patch — `kumitate-gate-pins-v1` block (SCORECARD.md)

```diff
 pin.report-receipt-diff=23efb0908b9ebe51f158f590c6512be59aa183e5e25f268b5e0340f78f2f8927
+pin.harm-matrix=ab123486e2fd753fc2df10d207b2d92a3759838bd3f31370402717de493f7c38
+pin.routed-ledger=<sha256 of scripts/routed-ledger.mjs AFTER its v2 edit>
```

`ab123486…` is `scripts/harm-matrix.mjs` at the freeze commit (untouched this round).
`f92a364d…` is the **v1** ledger and is *not* usable: C1 rewrites the file. Run
`sha256sum scripts/routed-ledger.mjs` after the v2 edit and put that value in.

## 3. Replacement block — `kumitate-proxy-v1`

Same 23 keys, same order, integers only; A is the one value that must be filled at close
(§4). Draft-time values, `A=548` = tracked runnable count at the freeze commit:

```
<!-- kumitate-proxy-v1
A=548
C=34
C1=19
C1_total=19
C2=165
C2_total=165
S_members=88
S_sections=88
R_members=92
R_sections=92
coverage_script=10
coverage_runtime=10
C1k=5
C1k_total=5
K_members=53
K_sections=53
coverage_kimi=10
pin.cite-check=7484274fff4c540f39d6df829708c86c78f25e803a4657ab4d7bae6d025acdf2
pin.surface-probe=79081e1b3c661590f4fafe5d2343993d966873cb4422b7b5462434366a084d35
pin.round-gate=09d4d79238f44dd74a0fa727c8f6b193c3fa87200c02340e2f4b3dcc6b354594
pin.proxy-check=121c02f3407391ab23adca05a73d42ccbead84ec152e9a96318ca3e9ef5079b6
pin.claims-check=de3433b5465a2f2d22c538537e3f9c67e37dc2605888b2ff77adc49264abfe14
pin.kimi-census=9d27bc9c12546e07f8c54d36dcc73b50cfab56bf3198674febefd6c23ef84f50
-->
```

Determinism: the six pins are unchanged except `pin.proxy-check` (edit 1). The five others
were re-hashed at the freeze commit and match the block.

## 4. The one value the L1 must fill: `A`

`A` is `walkFiles(self)` filtered by `RE_RUNNABLE = /\.(?:mjs|js|sh|py)$/` — **every**
runnable file in the tree being scored, including probe counters and seat build artifacts
(SCORECARD round-45 note; unchanged pattern). It is therefore not a stable constant while
the wave is still writing:

- archive / tracked at the freeze commit: **548** (`git ls-tree -r --name-only HEAD |
  grep -cE '\.(mjs|js|sh|py)$'` → 548; the fixture archive run computed 548).
- worktree during the wave: **555** at 11:52 and **556** at 11:58 on 2026-10-27 — the delta
  grows with each seat that drops a script (`build/K68ExecCounterRehearsal/ctl/*.sh`,
  `build/K68ExecPins/*`, `build/K68ExecReadmeFix/apply.mjs`,
  `build/K68ScribeQuality/ledger67-probe-as-frozen.mjs`, …).

Fill rule (run after the wave has stopped writing, on the commit that will be scored):

```sh
CLOSE_REV=$(git -C /home/vgpnk/Projects/shokunin/kumitate-shokunin rev-parse HEAD)
git -C /home/vgpnk/Projects/shokunin/kumitate-shokunin ls-tree -r --name-only "$CLOSE_REV" \
  | grep -cE '\.(mjs|js|sh|py)$'
```

Use that integer. Rationale: every consumer (the round counter, L3/L7, a reader) measures
`git archive`, not a worktree; the equivalence held exactly in the fixture (tracked 548 =
archive 548), and the lane commits no symlink with a runnable name (0 of 16 symlink entries),
which is the one case where `ls-tree` and `walkFiles` would differ.

A wrong `A` cannot move the operability integer — `floor(10·(A+34)/(A+37))` is 9 for every
A ≥ 0 — but it *is* `A_DRIFT` and fails checklist item 8.

## 5. Terms, with the command behind each

| key | value | derivation at the freeze commit |
|---|---|---|
| A | 548 (fill, §4) | `git ls-tree -r --name-only HEAD \| grep -cE '\.(mjs\|js\|sh\|py)$'` → 548 |
| C | 34 | `grep -cE '^\s*- \[' SKILL.md` → 33, +1 for the ledger checklist item this round lands |
| C1 / C1_total | 19 / 19 | `| S\|R\d+ |` rows, 4th cell `yes` (proxy computed 19/19 — no drift) |
| C2 / C2_total | 165 / 165 | 163 notes now (`find corpus/knowledge corpus/lessons -maxdepth 1 -name '*.md'` = 60 + 103), +2 this round: `knowledge/mcp-deprecation-registry.md` and one `lessons/round-68*.md`; one README row each (`^\| \`(knowledge\|lessons)/`) |
| S_members / S_sections | 88 / 88 | origin pin `31c465f1` via `claims-check.probeSections` (proxy computed 88/88) |
| R_members / R_sections | 92 / 92 | same walk (92/92) |
| coverage_script / coverage_runtime | 10 / 10 | `floor(10·8/8·88/88)`, `floor(10·11/11·92/92)` |
| C1k / C1k_total | 5 / 5 | `| K\d+ |` rows, 4th cell `yes` |
| K_members / K_sections | 53 / 53 | live: `node scripts/kimi-census.mjs` → `TOTALS: members=53 checked=53 errors=0 info=4 chain=10` |
| coverage_kimi | 10 | `floor(10·5/5·53/53)` |

The two verifier-spotcheck README rows the plan calls missing (rounds 66/67) are **already
in** — the freeze commit `39f61816` added them ("readme-map inherited repair"): base
`d23892ad` had 161 rows / 163 notes, the freeze has 163/163 and
`node scripts/readme-map.mjs` → `README_MAP: CLEAN files=163 rows=163 covered=163`.
So the round's C2 delta is +2, not +4. Do not add those rows twice.

`## Axes` integers stay as they are (9, 10, 10, 10, 10): derived operability = 9,
coverage = 10, the three layer axes = 10 — matching, so no `AXES_DRIFT`. Adding the C1
capability row does not touch `RE_REGISTRY_ROW` (that table is `| S…`/`| R…` only).

## 6. The expected `--strict` MATCH line

With `A=548` (draft-time; substitute the §4 value and the rest is unchanged):

```
PROXY: MATCH (A=548 C=34 operability=9; C1=19/19 C2=165/165 coverage=10; S=88/88 coverage:script-layer=10; R=92/92 coverage:runtime-layer=10; K=53/53 coverage:kimi-layer=10; pins=6 match; src-rev=31c465f15669)
```

This exact line was produced by the fixture archive run (`--strict`, exit 0). `pins=6` counts
only the six v1 pins; the gate-pin block is verified separately (`GATE_PIN_DRIFT`) and never
enters that count — the fixture has 24 gate keys and still prints `pins=6 match`.

Fill-time template:

```
PROXY: MATCH (A=<A_close> C=34 operability=9; C1=19/19 C2=165/165 coverage=10; S=88/88 coverage:script-layer=10; R=92/92 coverage:runtime-layer=10; K=53/53 coverage:kimi-layer=10; pins=6 match; src-rev=31c465f15669)
```

If `C` ships as 33 (no new checklist item) the same line reads `A=<A> C=33`, operability
still 9. If a third corpus note lands, `C2=C2_total=166`. Any other deviation is drift.

## 7. Close-time verification (the commands the L1 should run once)

```sh
L=/home/vgpnk/Projects/shokunin/kumitate-shokunin
node $L/scripts/proxy-check.mjs --strict          # worktree: expected MATCH, exit 0
                                                 #   (only if no untracked runnable artifact exists at that moment)
REV=$(git -C $L rev-parse HEAD)
D=$(mktemp -d) && git -C $L archive "$REV" | tar -x -C "$D"
node "$D/scripts/proxy-check.mjs" --self "$D" --strict    # the scored measure
rm -rf "$D"
node $L/scripts/proxy-check.mjs --selftest        # VERDICT: PASS (122/122)
```

The two runs must print the *same* line; if they differ, `A` was filled from the worktree
and must be re-filled from `ls-tree` (§4).
