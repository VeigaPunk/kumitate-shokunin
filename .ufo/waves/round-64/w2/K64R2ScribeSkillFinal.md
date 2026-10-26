VERDICT: `skill.patch` applies cleanly to SKILL.md at 2ed8a5f8 and reproduces the v2 surfaces (33 checklist items, 0 grammar errors, 3 registry rows added, 4 runnable items proven green), but it is NOT self-contained: it moves proxy-check's `C` term 30→33, so the same landing MUST carry `scorecard-stanza.patch` (C=33 + `pin.plan-before-ready` re-pin) or the round's own `PROXY: MATCH` item goes red.

## Evidence

Patch generation and application (fixture repo: `D=$(mktemp -d)`, `git -C "$D" init -q`, toplevel verified = `$D`):

```
$ diff -u --label a/SKILL.md --label b/SKILL.md base/SKILL.md patched/SKILL.md   # base = git archive 2ed8a5f8
$ grep -n '^@@' skill.patch
3:@@ -586,15 +586,21 @@      28:@@ -626,6 +632,9 @@
38:@@ -679,7 +688,7 @@      47:@@ -724,7 +733,10 @@
$ git -C "$D" apply --check -p1 skill.patch ; echo $?          -> 0
$ git -C "$D" apply -p1 skill.patch && cmp "$D/SKILL.md" patched/SKILL.md && echo IDENTICAL
IDENTICAL
```

Frozen checklist grammar (`scripts/surface-probe.mjs:278`, copied verbatim to a /tmp checker):

```
base/SKILL.md:    MALFORMED SKILL.md:727 :: - [ ] Round dispatch-evidence gate (round 60; contract `kumitate-dispatch-evidence-v1`) — `node scripts/dispatch-evidenc…
                  task-lines=30 malformed=1
patched/SKILL.md: task-lines=33 malformed=0
```

The three new items, run by surface-probe's own parser on a fixture that keeps only the round-64 items (`--self` fixture, patched tree):

```
CHECKLIST  PASS SKILL.md:903 exit=0 expected=0 substring=hit wall=0.983 … — Report-vs-receipt diff suite (round 64; contract `kumitate-report-receipt-diff-v2`…)
CHECKLIST  PASS SKILL.md:904 exit=0 expected=0 substring=hit wall=1.861 … — jj seat-containment demo re-run (round 64; contract `kumitate-jj-seat-demo-v2`; 21 keys…)
CHECKLIST  PASS SKILL.md:905 exit=0 expected=0 substring=hit wall=0.707 … — Plan-before-ready map-arm suite (round 64…)
CHECKLIST: 3/3 pass
VERDICT: PASS        (exit 0)
```

The repaired item 30, same harness (`4/4 pass`, `VERDICT: PASS`, exit 0) vs the same item at base, kept verbatim (`0/1 pass`, exit 1):

```
CHECKLIST  ERROR  SKILL.md:894 grammar (- [ ] Round dispatch-evidence gate (round 60; contract `kumitate-dispatch-evidence-v1`) — `node scripts/dispatch-evidenc)
CHECKLIST: 0/1 pass
VERDICT: FAIL
```

The commands the rows cite, measured on this host (node v24.21.0, jj 0.45.1-7c41cdeb…, git 2.56.0):

```
$ node scripts/report-receipt-diff.mjs --selftest        -> REPORT_RECEIPT_SELFTEST: PASS (52/52)   exit 0
$ bash scripts/jj-seat-demo.sh                           -> 21 `JJ_SEAT:` lines + JJ_SEAT_DEMO: DONE jj=0.45.1-7c41cdeb16b6b321c64e789a966b6adf723816a5   exit 0
$ bash scripts/plan-before-ready.sh --selftest           -> PLAN_BEFORE_READY_SELFTEST: PASS (18/18)   exit 0
$ node scripts/dispatch-evidence.mjs --selftest          -> DISPATCH_EVIDENCE_SELFTEST: PASS (8/8) / VERDICT: PASS   exit 0
$ diff <(bash scripts/jj-seat-demo.sh | grep '^JJ_SEAT: ') \
      <(sed -n '/^## Demo outcomes/,/^## /p' corpus/knowledge/jj-workspace-seat-containment.md | grep '^- ' | sed 's/^- /JJ_SEAT: /')
(no output) exit 0        # the entry's 21 bullets are grounded at this tip
$ PBR_MAP_FROM=0 bash scripts/plan-before-ready.sh --round 57 --rev HEAD
PLAN_BEFORE_READY: NA … round=57 reason=NO_MARKER plan=f0dc6d11… map=CLEAN files=135 rows=135 covered=135
$ PBR_MAP_FROM=0 bash scripts/plan-before-ready.sh --round 63 --rev HEAD
PLAN_BEFORE_READY: FAIL … round=63 reason=MAP_DRIFT … map=DRIFT map_exit=1 map_first=uncovered:lessons/round-62-verifier-spotcheck.md
PLAN_BEFORE_READY_SUMMARY: pass=0 fail=1 na=0 rounds=63-63 … exit=1 failed=63 na_rounds= map_red=63
```

**Does either reader consume the registry?** `grep -c SKILL scripts/claims-check.mjs` → **0**: claims-check never reads SKILL.md, and its verdict is byte-identical before/after the patch (`CLAIMS: MATCH (rows=19 yes=19 notes=27 sections=184 adv=4 src-rev=31c465f15669)`, `SUMMARY: errors=0 warnings=4`, exit 0). `proxy-check` reads SKILL.md only for the `C` term (`C = lines of <self>/SKILL.md matching /^\s*- \[/`, `scripts/proxy-check.mjs:96,441`), so **table rows move nothing and checklist items move exactly C**. Measured in the two archives, same everything else:

```
base:    PROXY: DRIFT (A_DRIFT term=A declared=257 computed=514 delta=+257; C2_DRIFT … delta=+3; C2_TOTAL_DRIFT … delta=+3; GATE_PIN_DRIFT term=pin.plan-before-ready …; PIN_UNPINNED term=scripts/report-receipt-diff.mjs; src-rev=31c465f15669)
patched: PROXY: DRIFT (… A_DRIFT …; C_DRIFT term=C declared=30 computed=33 delta=+3; C2_DRIFT …; GATE_PIN_DRIFT …; PIN_UNPINNED …)
```
The **only** added finding is `C_DRIFT … delta=+3`; `A` is 514 in both trees (`find … -name '*.mjs|*.js|*.sh|*.py' | wc -l`), and `C` is counted `grep -c '^\s*- \[' SKILL.md` → 30 → **33** (3 new items; the item-30 repair changes no count). With `scorecard-stanza.patch` applied (C=33, `pin.plan-before-ready=ef726eae…`):

```
PROXY: DRIFT (A_DRIFT … delta=+257; C2_DRIFT … delta=+3; C2_TOTAL_DRIFT … delta=+3; PIN_UNPINNED term=scripts/report-receipt-diff.mjs; src-rev=31c465f15669)
```
`C_DRIFT` and `GATE_PIN_DRIFT` are gone; the operability integer does not move (`floor(10×(257+33)/(257+33+3)) = floor(2900/293) = 9`; no `AXES_DRIFT` in the verdict). cite-check (`--self` = each archive, same `--fleet`): `errors=1409 warnings=645` in **both**, tokens `11883 → 11899` (+16); every SKILL.md finding line only shifts by +6 lines.

## Findings

**K64R2ScribeSkillFinal-1** (high; attacks "the SKILL patch can land alone"). The patch adds 3 checklist items, so `C` 30→33 and `node scripts/proxy-check.mjs` gains `C_DRIFT … delta=+3` (quoted above); the round's checklist item 8 (`--strict`) and the SCORECARD `C` claim then read red. Reproduce: `cd $(mktemp -d) && git -C . init -q` → extract `git archive 2ed8a5f8`, `git apply skill.patch`, `node scripts/proxy-check.mjs`. Remedy: land `scorecard-stanza.patch` with it.

**K64R2ScribeSkillFinal-2** (high; attacks the registry row's "pinned values live in" cell and the round's pin claim). `pin.plan-before-ready` is **stale at the integrated tree**: declared `fdc10c4b91a3f59b1452ced06104c4fb03ad6130132cf83f3a8b32b8f3898fc9`, computed `ef726eaef83e7068c28ec3e5e0dfc7732337ee7f4c72eaa6db054d1ed40324a0` — the wave-1 map-arm edit landed without a re-pin. Reproduce: `node scripts/proxy-check.mjs | grep GATE_PIN_DRIFT`. Remedy: `scorecard-stanza.patch` (second hunk).

**K64R2ScribeSkillFinal-3** (medium; attacks the claim that a registry row makes a gate pinnable). `pin.report-receipt-diff` **cannot** be added from the scorecard: the key is absent from `GATE_PINS` (`scripts/proxy-check.mjs:461-481`), and an unknown key is `GATE_PIN_KEY_UNKNOWN` (error). So `PIN_UNPINNED term=scripts/report-receipt-diff.mjs` survives the stanza patch, and `node scripts/proxy-check.mjs --strict` still exits 1 (quoted above). Reproduce: `grep -n 'report-receipt-diff' scripts/proxy-check.mjs` → only the warn path, no `GATE_PINS` entry. Remedy for the L1: add `'pin.report-receipt-diff': 'scripts/report-receipt-diff.mjs'` to `GATE_PINS` + the stanza key, then re-pin `proxy-check.mjs` itself (it is one of the frozen six v1 pins).

**K64R2ScribeSkillFinal-4** (high; attacks the checklist's "every item is executed" claim, round 60 residue). Item 30 carried two commands and a trailing clause and never matched the frozen grammar: at base it prints `CHECKLIST ERROR SKILL.md:894 grammar (…)`, `CHECKLIST: 0/1 pass`, `VERDICT: FAIL`, exit 1 — the dispatch-evidence item has not run since it landed. `C` counted it anyway (30 listed vs 29 runnable). Reproduced above with surface-probe's own parser; the patched line runs green in 0.032 s.

**K64R2ScribeSkillFinal-5** (medium; attacks checklist item 1's greenness). `corpus/lessons/round-43.md:67` content-pins SKILL.md's bytes (`45da8b5f`): it is **already mismatched** at 2ed8a5f8 (`sha256(SKILL.md)=61490bb8…`) and every SKILL edit re-opens it (`9a0c587e…` after this patch). Reproduce: `node scripts/cite-check.mjs --self <tree> --fleet /home/vgpnk/Projects/shokunin | grep round-43`. The landing must re-ground that pin; the patch adds no new error class (errors identical 1409).

**K64R2ScribeSkillFinal-6** (medium; attacks the registry's own counts). Three count sentences were stale before this patch — "Twenty-two are gates" (22 measured at base, correct), `"all nineteen" above still counts the gates only` (stale since round 46), and the checklist header "Twenty-six items" over **30** bullets. The patch rewrites all three to measured values: 24 gate rows over 23 gate files (22 + `report-receipt-diff`; the map-arm row is the same gate's second row), 33 items.

**K64R2ScribeSkillFinal-7** (high, scope note for the L1; not caused by this patch). The integrated tree cannot read `PROXY: MATCH` for three reasons outside SKILL.md, all measured: `A_DRIFT declared=257 computed=514` on the **committed** tree and `computed=1294 delta=+1037` on the live worktree (build/scratch `.mjs`/`.sh` copies: 1270 runnable files under `.ufo` vs 486 committed; the worktree number is point-in-time — siblings were cleaning `build/` while this was measured, and it read 541 two minutes later, still ≠ 257); `C2/C2_total` `declared=153 computed=156` (wave-1's three new corpus files + rows). Reproduce: `find . -path ./.git -prune -o -type f \( -name '*.mjs' -o -name '*.js' -o -name '*.sh' -o -name '*.py' \) -print | wc -l`; `grep -cE '^\| `(knowledge|lessons)/' corpus/README.md`. Cleanup of `build/` and the C2 bump must land before item 8 can be quoted green.

## Artifacts

- `.ufo/waves/round-64/build/K64R2ScribeSkillFinal/skill.patch` (unified diff vs SKILL.md@2ed8a5f8; 4 hunks at -586/-626/-679/-724; 16 797 B)
- `.ufo/waves/round-64/build/K64R2ScribeSkillFinal/scorecard-stanza.patch` (C=33 + `pin.plan-before-ready` re-pin; required by finding 1/2)
- `.ufo/waves/round-64/build/K64R2ScribeSkillFinal/evidence.txt` (the measured lines quoted above)
- Scratch: `/tmp/kumitate-r64/K64R2ScribeSkillFinal/` (base/patched/freeze/c33 trees, logs, grammar checker). Build dir holds 0 files with the proxy's counted extensions.

## Limits

- The full `node scripts/surface-probe.mjs --checklists` over all 33 items was **not** run to completion (killed at 100 s, exit 124; output is buffered until the end). Grammar and the 4 affected items were proven with surface-probe's own parser on fixtures holding only those lines — the other 29 items are unverified here.
- cite-check's absolute counts (1409 errors) are the archive's baseline with `--self` on a non-git extraction; only the base↔patched **delta** (0 new findings, +16 tokens) is claimed.
- I did not execute the 37 receipt controls or the frozen counters; the "37 cases / 21 ratchet" and `52/52` claims are from `ls | wc -l`, `CHANGES-AFTER-FREEZE.md` and the selftest's own line.
- `A` must be re-measured at landing (it is transient: build dirs); the stanza patch deliberately leaves `A`, `C2`, `C2_total` untouched.
- No tool was installed (node 24.21.0, git 2.56.0, jj 0.45.1 present); no lane file outside my build/report paths was written; SKILL.md, SCORECARD.md, scripts/ and the frozen round-64 inputs were only read.
