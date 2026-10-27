VERDICT: Q62, Q63 and Q64 are drafted in the file's own append-only style with measured evidence, Q65 is added because the wave's own frozen plan surfaced a fourth mistake (dangling receipt paths and a misquoted tally), and none of the drafts edits a frozen byte.

## Evidence

Seat: K68ScribeQuality (scribe, quality criteria drafts). Lane tip at work: `39f61816d4ee7a8d401df42c1818c91a9c537bce`
("round-68: freeze plan + counters L68/M68 v1, base receipts, controls, validated v2 wave spec (66 seats), readme-map inherited repair").

1. Style and insertion point — `wc -l corpus/QUALITY.md` → `1064`; last heading is `210:## Round criteria — round 41
   routed defects …` (`grep -n '^## '`), rows `999: Q60`, `1050: Q61`, last line Q51-C1's `**Supersedes.**` bullet.
   The shape to copy is `- **Qn — <sentence>.** Grounding: …` + `**Who checks.** / **Command.** / **Fails when.** /
   **Shown able to fail.** / **Limit.** / **Supersedes.**`; new rows append after line 1064.

2. Q64's mistake, reproduced from the frozen r67 draft (blob identity first):
   `$ git rev-parse 993a7b16:.ufo/waves/round-67/probe/ledger67-probe.mjs` → `3a3a45a99daf6d1b4995fd3bbdf2929d6bded6ff`
   `$ git hash-object ledger67-probe-as-frozen.mjs` → `3a3a45a99daf6d1b4995fd3bbdf2929d6bded6ff`
   `$ node ledger67-probe-as-frozen.mjs <lane> d23892ad44b41e1af63b3edb949d265ca1dd812d --seed 2583a841b9d97d5e`
   → `Error: EEXIST: file already exists, mkdir '…/archive'` `at mkdirSync (node:fs:1410:26)`
   `at extract (…ledger67-probe-as-frozen.mjs:79:3)` `at …:92:13` … `exit=1` — no verdict line, so no check ran.
   Cause: preamble `mkdirSync(A)` at `:71`, `extract()` re-`mkdirSync(dst)` at `:79`, called at `:92`.
   Receipt: `build/K68ScribeQuality/r67-unexercised-counter-crash.txt`.

3. Q64's positive side and Q63's freeze-tree arm:
   `$ git ls-tree -r --name-only 993a7b16 .ufo/waves/round-67/` → `.ufo/waves/round-67/plan.md`,
   `.ufo/waves/round-67/probe/ledger67-probe.mjs` (nothing else); `ls -la .ufo/waves/round-67/base/` → empty (0 entries).
   `$ git ls-tree -r --name-only 39f61816 .ufo/waves/round-68/base/` → `census-before.txt`, `deprec68-base.txt`,
   `ledger68-base.txt`; both verdict receipts carry `rev=d23892ad44b41e1af63b3edb949d265ca1dd812d`.
   Receipt: `build/K68ScribeQuality/freeze-receipts-r67-vs-r68.txt`.

4. Q62's premise, measured at the freeze:
   `SKILL_gate_rows_naming_routed-ledger=0` / `QUALITY_rows_naming_routed-ledger=0` /
   `SCORECARD_capability_rows_first_cell=0` / `SCORECARD_prose_mentions=1` (`SCORECARD.md:3003`).
   Receipt: `build/K68ScribeQuality/registry-home-census.txt`. Same three arms are the tool's L6 predicates and read
   false at round 66: `L6 MISS skill-row=false quality=false capability-row=false` (`.ufo/waves/round-66/base/ledger66-base.txt`).

5. Q65's trigger, measured against the plan's own words:
   `sed -n '86p' plan.md` → `**Before (base `d23892ad`):** `LEDGER68_UNMET held=0/7` exit 1 (`base/ledger68-base.txt`).`
   `head -1 base/ledger68-base.txt` → `LEDGER68_UNMET held=1/7 checks=7 rev=d23892ad… rule=L68 seed=2583a841b9d97d5e`;
   `grep -c '^L[0-9] MISS'` on it → `6` of 7, so the one pass is L7 (`check('L7', bad.length === 0)`,
   `probe/ledger68-probe.mjs:459`; `:465` joins only MISS lines).
   `plan.md:87-90` cites `base/ledger68-donothing.txt` + `base/ledger68-autoledger.txt`, `:143-144` cites
   `base/deprec68-donothing.txt`: all three `ABSENT` at `39f61816`; the committed receipts are
   `controls/c1-donothing.txt`, `controls/c1-autoledger.txt`, `controls/c2-donothing.txt`.
   `git cat-file -e` on each control receipt's `rev=` → UNRESOLVED in the lane and in the fleet repo
   (`3ec65c91…`, `3ab64d18…`, `70434c29…`). Receipt: `build/K68ScribeQuality/plan-vs-receipts.txt`.

6. Q63's scope line: `grep -L 'rev=' .ufo/waves/round-6[4-8]/base/*.txt | wc -l` → `20` of `43` (the rest are
   census/selftest/preflight dumps, outside the "probe receipt" scope the row declares).

## Findings

1. **K68ScribeQuality-1 — C1's `Before` sentence quotes a tally its own base receipt contradicts.** (low; attacks
   C1's base line, Q63, and any closure that copies the number.) `plan.md:86` reads `held=0/7`; the receipt it
   names reads `held=1/7`. No axis credit is at stake (the claim is UNMET at base either way), but a plan sentence
   that misstates its receipt is the same class as round 60's `__MEASURED__`. Reproduce:
   `sed -n '86p' .ufo/waves/round-68/plan.md; head -1 .ufo/waves/round-68/base/ledger68-base.txt`.
   Fix is append-only (an erratum line in the round's report/lesson), never an edit of the frozen plan.

2. **K68ScribeQuality-2 — three receipts the plan names do not exist at the paths it names.** (medium; attacks Q57's
   control re-run and Q61's `RECEIPT_MISSING` arm.) `plan.md:87-90`, `:143-144` point at
   `base/ledger68-{donothing,autoledger}.txt` and `base/deprec68-donothing.txt`; `git ls-tree -r --name-only 39f61816
   .ufo/waves/round-68/base/` lists three files, none of them those, while the receipts sit in `controls/`. A closure
   that follows the plan's paths reads them absent. Reproduce: `for p in base/ledger68-donothing.txt
   base/ledger68-autoledger.txt base/deprec68-donothing.txt; do test -e .ufo/waves/round-68/$p || echo ABSENT $p; done`.

3. **K68ScribeQuality-3 — every committed control receipt names a `rev=` that resolves in neither repo.** (medium;
   attacks the "scored before any seat" claim, Q57, Q63.) The three `controls/*.txt` lines carry
   `rev=3ec65c91b208142392690aec43c44657fbdc16ad`, `rev=3ab64d18c37ce2db0851af755d6ebe3633f4dd6a`,
   `rev=70434c290f7dd2f32ea868a75989f357d0ff0f3b`; `git cat-file -e <rev>^{commit}` fails in the lane and in
   `/home/vgpnk/Projects/shokunin`. They are almost certainly throwaway fixture commits (legitimate), but neither
   receipt says `fixture` nor carries the fixture-creation command or a tool-bytes hash, so a non-author cannot
   re-derive them. That is exactly the arm Q63 now states. Reproduce: `for f in .ufo/waves/round-68/controls/*.txt;
   do h=$(grep -o 'rev=[0-9a-f]\{40\}' $f | cut -d= -f2); git cat-file -e ${h}^{commit} || echo "UNRESOLVED $f"; done`.

4. **K68ScribeQuality-4 — the capability has no registry home at the freeze.** (info; the C1 L6 task, not a counter
   defect.) `routed-ledger` has 0 SKILL gate rows, 0 QUALITY criteria and 0 SCORECARD `## Capabilities` rows at
   `39f61816`, while `SCORECARD.md:3003` already discusses it in prose and says "No capability row is entered". The
   Q62 draft makes prose insufficient on purpose. Reproduce: `build/K68ScribeQuality/registry-home-census.txt`.

5. **K68ScribeQuality-5 — both drafts cite a lesson file that does not exist yet.** (info; dead-pointer risk of the
   Q51-C1 class.) `ls corpus/lessons/round-68.md` → `No such file or directory`. Q62–Q65 point at
   `corpus/lessons/round-68.md`; the L1 must land that lesson with §Mistakes classes `registry-home`,
   `unreceipted-tip`, `unexercised-counter`, `plan-quotes-receipt` or the four rows become unresolvable pointers.
   Reproduce: `test -e corpus/lessons/round-68.md || echo ABSENT`.

6. **K68ScribeQuality-6 — an empty `base/` cannot be frozen at all, so the r67 D2 wording understates the defect.**
   (info; attacks how a freeze is audited, Q64.) `corpus/lessons/round-67-verifier-spotcheck.md:71` says empty
   `base/`/`controls/` "should be populated or removed"; git cannot commit a directory, so a freeze that only
   creates them commits nothing and `git ls-tree` on the freeze shows no trace. The audit arm must therefore be
   "which receipt FILES does the freeze commit carry", never "does `base/` exist". Reproduce:
   `git ls-tree -r --name-only 993a7b16 .ufo/waves/round-67/`.

## Drafted rows (content, for the L1)

`build/K68ScribeQuality/quality-rows.md`, 147 lines, append after `corpus/QUALITY.md:1064`: **Q62** capability
registry home is three places and all three name the same round (`0/0/0` vs `prose=1` measured); **Q63** a receipt
names the revision it measured (`rev=<full 40-hex>`), a quoted tip without that tip's committed receipt is a routed
defect, a fixture `rev=` must carry its creation command and tool hash; **Q64** a frozen counter carries its
exercised base receipt in the same freeze commit (r67's EEXIST crash vs r68's two base receipts); **Q65** (one line,
drafted because the wave surfaced a fourth mistake) a claim sentence cites a receipt path that resolves at the
freeze commit and quotes its verdict line byte-for-byte. Q62/Q63/Q64 each carry the lesson pointer
`corpus/lessons/round-68.md` and an evidence pointer into this build dir.

No tool was installed or upgraded; pacman untouched; no subagents, no background jobs, no `agent://all`; no git
write in the lane or the fleet; scratch `/fast/scratch/hyaku/kumitate-r68/K68ScribeQuality/` removed.

## Artifacts

- `/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-68/build/K68ScribeQuality/quality-rows.md`
- `.ufo/waves/round-68/build/K68ScribeQuality/registry-home-census.txt`
- `.ufo/waves/round-68/build/K68ScribeQuality/freeze-receipts-r67-vs-r68.txt`
- `.ufo/waves/round-68/build/K68ScribeQuality/r67-unexercised-counter-crash.txt`
- `.ufo/waves/round-68/build/K68ScribeQuality/ledger67-probe-as-frozen.mjs` (blob `3a3a45a9…`, byte copy of the
  frozen r67 draft, sha256 `5d65b315c9ef3aa4574c25e3012e4a5a00f2bfc7695dea7591962193b49d566a`)
- `.ufo/waves/round-68/build/K68ScribeQuality/plan-vs-receipts.txt`
- `.ufo/waves/round-68/w1/K68ScribeQuality.md` (this report)

## Limits

- I did not run `ledger68-probe.mjs` or `deprec68-probe.mjs`: the frozen counters' verdicts are read from the
  committed base receipts only. Whether they reach HELD at the L1's tip is the closure's measurement, not mine.
- I did not check C2's captures, S207–S213 rows, `SOURCES.md` cells or the live-fetch arms; C2's M-arms are outside
  this seat.
- Findings 2–3 are measured on committed bytes; I did not try to recover the fixture repos the control receipts
  name, so "throwaway fixture" is inference from the unresolved shas, not proof.
- The Q62 "same round" arm is stated as a rule; no mechanical gate enforces it today, and I did not write one.
- `plan.md:86`'s `held=1/7` is arithmetic over the receipt's own line (7 checks, 6 MISS lines, `:465` joins only
  misses), not a fresh run of the counter at `d23892ad`.
