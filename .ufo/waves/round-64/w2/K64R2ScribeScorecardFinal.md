VERDICT: The final SCORECARD text is written against the integrated tree with every figure measured and every close-time slot left as the literal word UNMEASURED plus its exact command; applying it to a scratch copy of `2ed8a5f` changes no gate reading (readme-map CLEAN, cite-check 1689/722, claims-check MATCH, proxy-check identical) — but the round's own maintenance obligation is still unmet at the tip (proxy-check DRIFT, 4 error terms vs 2 at base), so the text records that as a carried defect rather than a repair.

## Evidence

All commands run in `/home/vgpnk/Projects/shokunin/kumitate-shokunin` unless a scratch cwd is named. Measured revision
`2ed8a5f8b133c65b3be59e3d10ff5bff50c4a2d8` (integration commit; wave-1 landing `d92cf1fff3026087a0e21a3183b97de169c6f22c`,
freeze `dd1a3e6f19dc82c54ef67864c9ba87e4eb7c24ef`, base `6825a51425e91908f019ed65aa2f4209acbd7087`).

```
$ node .ufo/waves/round-64/probe/receipt64-probe.mjs /home/vgpnk/Projects/shokunin/kumitate-shokunin 2ed8a5f8b133c65b3be59e3d10ff5bff50c4a2d8
RECEIPT64_UNMET held=4/5 checks=5 rev=2ed8a5f8b133c65b3be59e3d10ff5bff50c4a2d8 rule=R64 | P5 MISS report-not-given
EXIT=1
$ node .ufo/waves/round-64/probe/jj64-probe.mjs /home/vgpnk/Projects/shokunin/kumitate-shokunin 2ed8a5f8b133c65b3be59e3d10ff5bff50c4a2d8
JJ64_HELD held=8/8 checks=8 rev=2ed8a5f8b133c65b3be59e3d10ff5bff50c4a2d8 rule=J64
EXIT=0
$ node scripts/report-receipt-diff.mjs --selftest
REPORT_RECEIPT_SELFTEST: PASS (52/52)                                   EXIT=0
$ ls -d .ufo/waves/round-64/controls/receipt/*/ | wc -l                  37
$ for d in .../controls/receipt/*/; do tr '\n' ' ' < "$d/expect"; echo; done | awk '{print $2}' | tr ',' '\n' | sort -u
CLEAN HASH_DEAD PLACEHOLDER RECEIPT_EMPTY RECEIPT_MISSING SECTION_MISSING SHONEN_COUNT TALLY_CHECKS_MISMATCH TALLY_UNRECEIPTED   (8 ids)
$ grep -l '^0' .ufo/waves/round-64/controls/receipt/*/expect | wc -l    3
$ bash scripts/jj-seat-demo.sh | grep -c '^JJ_SEAT: '                  21   (demo EXIT=0, JJ_SEAT_DEMO: DONE jj=0.45.1-7c41cdeb…)
$ node scripts/readme-map.mjs        README_MAP: CLEAN files=156 rows=156 covered=156          EXIT=0
$ node scripts/cite-check.mjs        CITE_CHECK: DRIFT (files=160 tokens=11883 errors=1224 warnings=645)   EXIT=1
$ node scripts/claims-check.mjs      CLAIMS: MATCH (rows=19 yes=19 notes=27 sections=184 adv=4 src-rev=31c465f15669)  EXIT=0
$ node scripts/proxy-check.mjs       PROXY: DRIFT (A_DRIFT term=A declared=257 computed=1291 delta=+1034;
      C2_DRIFT …153→156; C2_TOTAL_DRIFT …153→156; GATE_PIN_DRIFT term=pin.plan-before-ready
      declared=fdc10c4b… computed=ef726eae…; PIN_UNPINNED term=scripts/report-receipt-diff.mjs; src-rev=31c465f15669) EXIT=1
$ node scripts/counter-pins.mjs      COUNTER_PINS: CLEAN pins=25                                   EXIT=0
$ node scripts/sources-check.mjs     SOURCES_CHECK: CLEAN (rows=139 tiers=A:116,B:15,C:8 … mined:107 entries_with_source=21 legacy=38) EXIT=0
$ bash scripts/plan-before-ready.sh --round 64
PLAN_BEFORE_READY: PASS rev=2ed8a5f… round=64 plan=dd1a3e6f… marker=d92cf1f… marker_kind=ready … map=SKIP reason=MAP_PRE_EPOCH_ROUND  EXIT=0
$ node scripts/wave-census.mjs --round 64
WAVE round=64 wave=w1 … seats=41 attack=8 reports=41/41 ; wave=w2 … seats=39 attack=15 reports=11/39
ROUND round=64 waves=2 seats=80 attack=23 reports=52/80 ; WAVE_CENSUS: CLEAN (rounds=1 waves=2 findings=0)  EXIT=0
$ git diff --stat dd1a3e6 2ed8a5f -- .ufo/waves/round-64/probe/          (empty)
$ git diff --stat dd1a3e6 2ed8a5f -- .ufo/waves/round-64/controls/receipt   107 files changed, 567 insertions(+), 0 deletions
```

Anchor verification against `SCORECARD.md` (2971 lines at `2ed8a5f`) — each count = 1:
`grep -c '^\*\*Waves:\*\* w1 40 seats'` → 1 (EOF anchor); `grep -c 'Round-48 note (capabilities; the paragraphs above
stay as written)'` → 1 (Capabilities anchor, before line 1799); `grep -c '^| 50 | operability (integer held 9'` → 1
(Move-log anchor, after the separator at 444). The bare header `| Round | Axis | Before | After | Evidence |` occurs
**twice** (443 and 1726) and is therefore rejected as an anchor.

Scratch application (`/tmp/kumitate-r64/K64R2ScribeScorecardFinal/lane`, `git archive 2ed8a5f | tar -x`), gates run
before and after inserting the four blocks:

```
                       before                          after
readme-map   EXIT=0  README_MAP: CLEAN files=156…  EXIT=0  README_MAP: CLEAN files=156 rows=156 covered=156
cite-check   EXIT=1  DRIFT files=160 tokens=11875 errors=1689 warnings=722   ← identical after
claims-check EXIT=0  CLAIMS: MATCH rows=19 yes=19 sections=184 adv=4        ← identical after
proxy-check  EXIT=1  A_DRIFT A declared=257 computed=514 delta=+257; C2 153→156; C2_total 153→156; GATE_PIN_DRIFT; PIN_UNPINNED   ← identical after
```

## Findings

**K64R2ScribeScorecardFinal-1 (high — attacks the plan's maintenance clause and the round's no-harm claim).**
The plan requires `proxy-check` DRIFT at base to read clean at the tip. It does not: base carries 2 error terms
(`C2_TOTAL_DRIFT +1`, `AXES_DRIFT coverage 10/9`), the tip carries 4. Three are round-64 artefacts still bindable
before close (C2/C2_total 153→156 = the three new corpus files; stale `pin.plan-before-ready` because the script
gained the map arm after its pin; missing `pin.report-receipt-diff`). My text states this as carried, not repaired.
Reproduce: `cd /home/vgpnk/Projects/shokunin/kumitate-shokunin && node scripts/proxy-check.mjs; echo EXIT=$?` → EXIT=1.

**K64R2ScribeScorecardFinal-2 (medium — attacks any scorecard figure that quotes the `A` term).** `A` counts
`.mjs/.js/.sh/.py` files in the lane **worktree** (`scripts/proxy-check.mjs:945` `const A = walkFiles(self)…`), so it
is not reproducible: two consecutive runs of the same command at the same revision read `computed=1290` and
`computed=1291` (live wave-2 build dirs), and the same revision extracted with `git archive` reads `computed=514`.
Any A figure in a scorecard or report must name the tree and the instant. Reproduce: run `node scripts/proxy-check.mjs`
twice while seats are writing, then compare with the scratch archive run above.

**K64R2ScribeScorecardFinal-3 (medium — attacks `controls/CHANGES-AFTER-FREEZE.md`, Q55-class).** The disclosure states
"Over all 24 real reports of rounds 40–63 the v2 tool reads 13 CLEAN and 11 DRIFT (`controls/real-reports-v2.txt` …)",
but that file has 11 lines and every one is a DRIFT line: the 13 CLEAN readings have no committed receipt, so a
reader cannot re-derive the half of the sentence that makes the tool's false-positive rate look bounded.
Reproduce: `wc -l .ufo/waves/round-64/controls/real-reports-v2.txt` → 11; `grep -c 'REPORT_RECEIPT: CLEAN'
.ufo/waves/round-64/controls/real-reports-v2.txt` → 0.

**K64R2ScribeScorecardFinal-4 (medium — attacks every before/after `cite-check` comparison in this round).**
`cite-check` resolves hashes with `git rev-parse --verify <hex>^{commit}` (`scripts/cite-check.mjs:1147`), so the same
revision reads `errors=1224` in the worktree (`.git` present) and `errors=1689` in a `git archive` extraction (no
object database → every hash token dead), with tokens 11883 vs 11875 and the same `files=160`. A seat that compares a
base receipt taken in a worktree with an after receipt taken from an archive will report a ~465-error regression that
is an artefact of the tree, not of the change. Reproduce: `git archive 2ed8a5f | tar -x -C /tmp/x --one-top-level=lane
&& cd /tmp/x/lane && node scripts/cite-check.mjs`.

**K64R2ScribeScorecardFinal-5 (low — attacks the Capabilities row's admission).** C1 reads `RECEIPT64_UNMET held=4/5`
at the integrated tree; P5 is unreachable until the round-64 report exists, so *First-working round* must stay the
literal word `UNMEASURED`. The build text carries the conditional explicitly (insert the row only on
`RECEIPT64_HELD held=5/5` exit 0; otherwise record the MISS and do not enter the row). Reproduce:
`node .ufo/waves/round-64/probe/receipt64-probe.mjs /home/vgpnk/Projects/shokunin/kumitate-shokunin 2ed8a5f8b133c65b3be59e3d10ff5bff50c4a2d8`.

**K64R2ScribeScorecardFinal-6 (low — attacks the round-64 gate-pin family).** `GATE_PIN_DRIFT
term=pin.plan-before-ready` (`declared=fdc10c4b…` vs `computed=ef726eae…`): the shipped `scripts/plan-before-ready.sh`
including the round-64 readme-map arm no longer matches its committed pin, so the round's own structural fix is
unpinned until the L1 refreshes it. Reproduce: `node scripts/proxy-check.mjs | grep GATE_PIN_DRIFT`.

**K64R2ScribeScorecardFinal-7 (low — attacks the new tool's future integrity).** `PIN_UNPINNED
scripts/report-receipt-diff.mjs has no pin.<name> key`: the round's headline capability is the only new `scripts/`
member without a gate pin, so a later ratchet that relaxed the tool would not be caught by `proxy-check`. Reproduce:
`node scripts/proxy-check.mjs | grep PIN_UNPINNED`.

## Artifacts

- `.ufo/waves/round-64/build/K64R2ScribeScorecardFinal/scorecard-final.md` — the deliverable: insertion map with
  anchors + verified line numbers, §A section (append at EOF), §B Capabilities row, §C Move-log row 64, §D planned
  row 65, and the §Close-time UNMEASURED table (each slot with the exact command and the receipt to commit).
- `/tmp/kumitate-r64/K64R2ScribeScorecardFinal/apply.mjs` — the applier used for the scratch gate test (kept out of
  the build dir so the proxy `A` term does not count it).
- Scratch tree `/tmp/kumitate-r64/K64R2ScribeScorecardFinal/lane` — deleted before yielding.

## Limits

- Close-time values are not measured by me and are not guessed: C1's admission and its *First-working round* cell,
  the close `proxy-check` reading, the final wave census, the per-axis no-harm gate table, the round-65 C2 family and
  plan freeze — each appears in the build text as `UNMEASURED` with its exact command.
- I did not re-derive the C1 P1..P4 internals beyond the probe's `held=4/5` line; I did not re-run the 37 control
  cases individually (I read their `expect` files and counted ids/CLEAN); I did not re-run `jj-seat-demo.sh`'s
  hermeticity arms (4 sequential + 4 parallel) claimed in `CHANGES-AFTER-FREEZE.md`.
- The scratch gate comparison ran without `.git`, so its absolute `cite-check`/`proxy` numbers are not the lane's
  (see finding -4); only the before/after delta is meaningful, and it is zero on all four gates.
- I did not run `readme-map`/`cite-check`/`claims-check` against the **lane** copy of the edited SCORECARD — the lane
  is integration-owned and I am not its editor; the scratch copy at the same revision is the controlled substitute.
- No pacman/uv/npx install was needed; no tool was installed or upgraded this seat.
