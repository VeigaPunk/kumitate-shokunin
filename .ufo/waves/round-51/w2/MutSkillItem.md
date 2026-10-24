# MutSkillItem — round 51 wave 2 (mutation-tester, leaf)

Seat `kumitate-r51.PetiteCentipede`. **Attack:** the *executability* of checklist item 23
(`SKILL.md:709`, the `receipt-attest` hermetic-suite item) under the frozen
`scripts/surface-probe.mjs --checklists` detector — i.e. does mutating the item's
**declared** contract (exit set / expected substring / command path) actually make the
item FAIL, or is the item a number in a count that nothing enforces?

**Verdict in one line: item 23 is genuinely executed and genuinely falsifiable — all
three assigned mutations KILL it; but the *lane's own* checklist run at the measured tip
is RED for reasons unrelated to item 23, and the item as written cannot distinguish a
real instrument from a one-line print-stub (a coverage limit, not a mutation-kill
failure).**

---

## 0. Environment, and what I attacked

| item | value |
|---|---|
| lane | `/home/vgpnk/Projects/shokunin/kumitate-shokunin` (read-only to this seat) |
| lane tip at measurement | `42ecc3c333bb79c457aa9bf6ddadd3363cf04d73` (working tree also had `M SCORECARD.md`, `M corpus/lessons/round-51.md` from the L1's in-flight close) |
| `SKILL.md` sha256 (lane, before **and** after this seat) | `6f8923dddda35ed994c91cf15a2b7e4019c6d7daffde15d5bdb7bc6ce7d79179` |
| `scripts/surface-probe.mjs` sha256 | `79081e1b3c661590f4fafe5d2343993d966873cb4422b7b5462434366a084d35` |
| `scripts/receipt-attest.mjs` sha256 | `44919763ee523f334adaa4242d370435180d07aa0cdd4b85b0a7be870f48e8d9` (matches the L1 pin) |
| node | v24.21.0 |
| scratch root | `/tmp/mutskill/**` only — **no runnable file was created anywhere under the lane tree** (verified: `find` over the lane for `*.mjs/*.js/*.sh/*.py` newer than the seat start returns nothing of mine) |

The item under attack, verbatim (`SKILL.md:709`):

```
- [ ] Receipt-attest hermetic suite (round 51; contract `kumitate-receipt-attest-v1`;
  hermetic; the final line is `ATTEST_SELFTEST: PASS`) — `node scripts/receipt-attest.mjs
  --selftest` → exit 0 + `ATTEST_SELFTEST: PASS`
```

**How the detector reads it** (read from source, not assumed):
`scripts/surface-probe.mjs:278` freezes the grammar
`^\s*- \[ \] (?<label>.+?) — \`(?<cmd>[^`]+)\` → exit (?<exits>[0-9]+(?:\|[0-9]+)*) \+ \`(?<expect>[^`]+)\`$`;
`:979-1000` parses it; `:1065-1067` spawns the command with **cwd = `--self`**;
`:1070-1072` scores the item as pass iff **exit ∈ declared set AND combined output
contains the expected substring**; `:1057-1063` skips `[x]` lines (`SKIP(checked)`) and
`--checklists` lines (`SKIP(self)`) out of *both* numerator and denominator.
`--self DIR` is the documented way to point the runner at another tree (`:337`, `:339`).

---

## 1. Baseline (pristine) — the detector is green on item 23 and 23/23 items are RUN

```
$ cd /home/vgpnk/Projects/shokunin/kumitate-shokunin
$ node scripts/surface-probe.mjs --checklists --json > /tmp/mutskill/live-final.json
live exit=1
$ node -e "const j=require('/tmp/mutskill/live-final.json'); console.log('items',j.items.length);
  const f=j.items.filter(x=>x.failed); console.log('failed:', f.map(x=>x.line).join(',')||'none');
  const it=j.items.find(x=>x.line===709);
  console.log('item709:', it.failed?'FAIL':'PASS','exit='+it.status,'exp='+it.exits,'sub='+it.substringOk);"

items 23
failed: 692,694
item709: PASS exit=0 exp=0 sub=true
```

Item 23 is **executed, not skipped**: `status=0`, `exitOk=true`, `substringOk=true`,
`skipped=null`; `CHECKLIST_SKIPPED: 0`. (The two red items are §4 findings about *other*
items, not item 23.)

An earlier baseline run at the same tip (`/tmp/mutskill/baseline-lane-2.json`) read
`failed: none` — the difference is the L1's in-flight `SCORECARD.md` edit between runs
(§4, F2).

---

## 2. The three assigned mutations — ALL THREE KILL item 23

Method: overlay-copy the whole lane to `/tmp/mutskill/lane` (`cp -a`, 99 MB), clone it
three more times (`m1`, `m2`, `m3`), mutate **only the SKILL.md:709 line** in each, and
run the *copy's own* `scripts/surface-probe.mjs --checklists --self /tmp/mutskill/<copy>`.
Because `--self` is also the cwd, each copy executes **its own** `scripts/receipt-attest.mjs`
— the mutation is genuinely in the executed tree.

### M1 — wrong exit set (`exit 0` → `exit 1`)

```
$ node -e "..."  # edit /tmp/mutskill/m1/SKILL.md:709
- [ ] Receipt-attest hermetic suite (… ) — `node scripts/receipt-attest.mjs --selftest` → exit 1 + `ATTEST_SELFTEST: PASS`

$ cd /tmp/mutskill/m1 && node scripts/surface-probe.mjs --checklists --self /tmp/mutskill/m1
CHECKLIST  FAIL SKILL.md:709 exit=0 expected=1 substring=hit wall=1.484 load1=14.16 — Receipt-attest hermetic suite (round 51; contract `kumitate-receipt-attest-v1`; hermetic; the final line is `ATTEST_SELFTEST: PASS`)
  | ATTEST_CASE 22 inner-digest-covers-every-semantic-field: PASS
  | …
  | ATTEST_CASES: 27 passed, 0 failed
  | ATTEST_SELFTEST: PASS
CHECKLIST_SKIPPED: 0
CHECKLIST: 20/23 pass
VERDICT: FAIL
m1 exit=1
```
**KILLED.** Note the receipt line: the tool really ran (27 cases, `ATTEST_SELFTEST: PASS`
in the tail) — the *declared* exit set is what was falsified.

### M2 — wrong expected substring (`ATTEST_SELFTEST: PASS` → `ATTEST_SELFTEST: FAIL`)

```
$ cd /tmp/mutskill/m2 && node scripts/surface-probe.mjs --checklists --self /tmp/mutskill/m2
CHECKLIST  FAIL SKILL.md:709 exit=0 expected=0 substring=miss wall=1.426 load1=12.59 — Receipt-attest hermetic suite (…)
  | ATTEST_CASES: 27 passed, 0 failed
  | ATTEST_SELFTEST: PASS
CHECKLIST_SKIPPED: 0
CHECKLIST: 19/23 pass
VERDICT: FAIL
m2 exit=1
```
**KILLED.** `substring=miss` while the tool's own last line is literally
`ATTEST_SELFTEST: PASS` — the substring arm is live, not decorative.

### M3 — command points at a nonexistent script (`scripts/receipt-attest.mjs` → `scripts/receipt-attest.missing.mjs`)

```
$ cd /tmp/mutskill/m3 && node scripts/surface-probe.mjs --checklists --self /tmp/mutskill/m3
CHECKLIST  FAIL SKILL.md:709 exit=1 expected=0 substring=miss wall=0.016 load1=14.16 — Receipt-attest hermetic suite (…)
  |     at wrapModuleLoad (node:internal/modules/cjs/loader:261:19)
  |     at Module.executeUserEntryPoint [as runMain] (node:internal/modules/run_main:154:5)
  |     at node:internal/modules/run_main_module:33:47 {
  |   code: 'MODULE_NOT_FOUND',
  |   requireStack: []
  | }
  | Node.js v24.21.0
CHECKLIST_SKIPPED: 0
CHECKLIST: 20/23 pass
VERDICT: FAIL
m3 exit=1
```
**KILLED.** The command is executed as written; a missing script is a real non-zero exit
plus a substring miss.

### M3 (isolated, single-item tree — the same mutation without the 22 noise items)

To show the kill is attributable to item 23 and not to the other items' noise, the same
three mutations were replayed on minimal trees holding **only** the item-23 line plus the
real instrument (`/tmp/mutskill/iso/{ctl,m1,m2,m3}`, `SKILL.md` = one GFM task line;
`scripts/receipt-attest.mjs` = the real sha `44919763…`):

```
$ node /home/vgpnk/Projects/shokunin/kumitate-shokunin/scripts/surface-probe.mjs --checklists --self /tmp/mutskill/iso/ctl
CHECKLIST  PASS SKILL.md:3 exit=0 expected=0 substring=hit wall=1.406 load1=2.77 — Receipt-attest hermetic suite (…)
CHECKLIST: 1/1 pass
VERDICT: PASS
exit=0
=== iso/m1 ===
CHECKLIST  FAIL SKILL.md:3 exit=0 expected=1 substring=hit wall=1.414 load1=3.11 — Receipt-attest hermetic suite (…)
CHECKLIST: 0/1 pass
VERDICT: FAIL
exit=1
=== iso/m2 ===
CHECKLIST  FAIL SKILL.md:3 exit=0 expected=0 substring=miss wall=1.393 load1=3.11 — Receipt-attest hermetic suite (…)
CHECKLIST: 0/1 pass
VERDICT: FAIL
exit=1
=== iso/m3 ===
CHECKLIST  FAIL SKILL.md:3 exit=1 expected=0 substring=miss wall=0.014 load1=3.11 — Receipt-attest hermetic suite (…)
CHECKLIST: 0/1 pass
VERDICT: FAIL
exit=1
```

**Conclusion for the assigned question: item 23's declared contract is load-bearing in
all three places. Mutating any one of them makes the item FAIL, and the whole
`--checklists` verdict go FAIL/exit 1. The item is genuinely executed, not counted.**

---

## 3. Additional mutations (cheap, parallel) — what else the item does and does not catch

| # | mutation | observed | killed? |
|---|---|---|---|
| M4 | exit set widened `exit 0` → `exit 0\|1` | `PASS … expected=0\|1 substring=hit` → `1/1 pass`, `VERDICT: PASS` | **SURVIVED** — but this is *correct* behaviour: the item declares `exit 0`; a widened set is a *weaker claim*, not a false one. Recorded as a coverage note, not a defect. |
| M5 | expected substring `ATTEST_SELFTEST: PASSED` | `FAIL … substring=miss` | KILLED |
| M6 | expected substring swapped for the neighbouring item's `VERDICT: PASS` | `FAIL … substring=miss` | KILLED |
| M7 | command repointed at a *real but different* script (`node scripts/proxy-check.mjs --selftest`) | `FAIL … exit=0 expected=0 substring=miss` | KILLED (the real proxy selftest prints `PROXY_SELFTEST: 122/122 pass`, not `ATTEST_SELFTEST: PASS`) |
| M8 | wrong flag `--selftests` (typo) | `FAIL … exit=64` (`receipt-attest: USAGE unknown subcommand "--selftests"`) | KILLED — the instrument's own usage error (exit 64) is what the item's exit set rejects |
| M9 | grammar broken (the `→` dropped) | `CHECKLIST  ERROR SKILL.md:3 grammar (…)` → `0/1 pass`, `VERDICT: FAIL` | KILLED as a **grammar** failure (an unparsable task line counts as a failed item — `surface-probe.mjs:1057-1061`) |
| M10 | expected substring loosened to `SELFTEST: PASS` | `PASS … substring=hit` | **SURVIVED** — the substring arm is a *containment* test (`output.includes(expect)`), so a shorter substring still hits. The item's own string is the tight one; recorded as a coverage note. |
| M13 | command repointed at a script that throws (`receipt-attest-broken.mjs`) | `FAIL … exit=1 expected=0 substring=miss` (`Error: boom`) | KILLED |
| M11 | **the instrument itself replaced by a one-line print-stub** (`process.stdout.write('ATTEST_SELFTEST: PASS\n')`) | `PASS … exit=0 expected=0 substring=hit` → `1/1 pass`, `VERDICT: PASS` | **SURVIVED** — see F1 |

---

## 4. Findings

### F1 (MEDIUM) — the checklist item alone cannot tell the real instrument from a print-stub; the frozen A51 counter does

`iso/m11` replaces `scripts/receipt-attest.mjs` with a stub that prints
`ATTEST_SELFTEST: PASS` and exits 0, and **item 23 still PASSES**
(`CHECKLIST: 1/1 pass`, `VERDICT: PASS`, exit 0). This is the same string-shape limitation
wave 1 already established for A51's A1 arm (`w1/RevengerGap.md` F2, `w1/CritC1.md`,
`w1/ExecForgerControl.md`), reached here through the *checklist* surface instead of the
counter surface.

It is **not** a defect of item 23: the item is a *hermetic-suite* item, and the
behavioural teeth live in the frozen counter. I confirmed the counter still kills the
stub — running the frozen `attest51-probe.mjs` (v3r6) against a scratch git repo whose
`scripts/receipt-attest.mjs` is the same stub:

```
$ node /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-51/probe/attest51-probe.mjs /tmp/mutskill/stublane HEAD
ATTEST51: ATTEST_UNMET held=1/9 checks=9 rev=HEAD rule=A51 version=v3 | A1 PASS | A2 MISS attest-run-1.txt:absent;attest-run-2.txt:absent;attest-run-3.txt:absent | A2c MISS run exit=0 last="ATTEST_SELFTEST: PASS" | A3 MISS attest-run-2-replayed.txt absent | A3c MISS run exit=0 | A4 MISS tool or receipts dir absent | A4c MISS run exit=0 | A3d MISS run exit=0 | A5 MISS tool or SCORECARD absent
probe_exit=1
```
`A2c` / `A3c` / `A4c` / `A3d` all MISS on the stub — the behavioural arms work.

**Reading, stated as a bound and not as a contract change:** H1's checklist level proves
item 23 *ran and printed its verdict*; it does **not** prove the instrument behind item 23
does anything. The counter (A2c/A3c/A3d/A4c) is the arm that carries that claim, and
`plan.md`'s §C1 wording should not let a reader infer instrument integrity from the
checklist number. A cheap supplemental harm arm — "the item's command must be the pinned
`pin.receipt-attest` sha256's file, and the frozen counter must read `held=9/9` at the
same rev" — is already satisfied by A5 + the counter; no new probe is needed.

### F2 (HIGH, environmental — not item 23) — the lane's `--checklists` run is RED at the measured tip, on two items other than 23

Live run at `42ecc3c` (`/tmp/mutskill/live-final.json`): `failed: 692,694`.

```
CHECKLIST  FAIL SKILL.md:692 … — Round-close artifact audit
  | ROUND_GATE  error  SCORECARD_ROW_MISSING  no table row starting "| 51 |" in …/SCORECARD.md
  | ROUND_GATE  warning  SCORECARD_PLAN_MISSING  ## Planned names no round later than 51
  | ROUND_GATE  error  LOG_ENTRY_MISSING  no "- YYYY-MM-DD — round 51" line in …/LOG.md
  | ROUND_GATE: DRIFT (round=51 lane=kumitate checks=10 errors=2 warnings=1)
CHECKLIST  FAIL SKILL.md:694 … — Proxy recompute (`--strict` …)
  | PROXY  error  A_DRIFT  A: declared=71 computed=81 delta=+10
  | PROXY: DRIFT (A_DRIFT term=A declared=71 computed=81 delta=+10; src-rev=31c465f15669)
```

Two independent causes, both **outside** item 23:

**(a) round-51 close artifacts not yet written** (item 692, `SCORECARD.md` `| 51 |` row and
`LOG.md` round-51 line). Expected for an in-flight round — the close commit supplies
them. Note the sibling seat `w2/RevChecklist23.md` F1 measured the same class of red for
item 12 (`Sources-registry gate`, `ENTRY_HEADER_REQUIRED`) — that one has since been
**fixed** by the L1 (`corpus/knowledge/invocation-attestation.md` now carries the
`source:`/`verified-at:`/`recheck:` trio on lines 1–3; `node scripts/sources-check.mjs`
→ `SOURCES_CHECK: CLEAN … entries_with_source=8`, exit 0). My lane copy reproduces
`SOURCES_CHECK: CLEAN` too, so that red is gone at the tip.

**(b) A-term inflation from wave-1's untracked forger-control scratch lanes** (item 694).
The `A` term is `walkFiles(self)` over the **working tree** (`proxy-check.mjs:682-692`,
`:936`) — it counts *untracked* files. The wave-1 seat `ExecForgerControl` left five
scratch lanes with ten runnable files under
`.ufo/waves/round-51/build/ExecForgerControl/lanes/` (untracked):

```
$ find .ufo/waves/round-51/build/ExecForgerControl/lanes \( -name '*.mjs' -o -name '*.js' -o -name '*.sh' -o -name '*.py' \) | wc -l
10
$ find . -path ./.git -prune -o \( -name '*.mjs' -o -name '*.js' -o -name '*.sh' -o -name '*.py' \) -print \
    | grep -v 'ExecForgerControl/lanes' | wc -l
71          # == the stanza's declared A=71, and == `git ls-tree -r HEAD | grep -cE '\.(mjs|js|sh|py)$'` = 71
$ node scripts/proxy-check.mjs --strict ; echo exit=$?
PROXY  error  A_DRIFT  A: declared=71 computed=81 delta=+10
PROXY: DRIFT (A_DRIFT term=A declared=71 computed=81 delta=+10; src-rev=31c465f15669)
exit=1
$ git archive HEAD | tar -x -C /tmp/mutskill/headtree && (cd /tmp/mutskill/headtree && node scripts/proxy-check.mjs --strict)
PROXY: MATCH (A=71 C=23 operability=9; C1=19/19 C2=117/117 coverage=10; S=88/88 …; pins=6 match; src-rev=31c465f15669)
exit=0
```

So the **committed** tree is `PROXY: MATCH`; the **working tree** is `A_DRIFT` purely
because of ten untracked scratch `.mjs` files. This is exactly the hazard the wave-2
assignment note states ("the frozen A-term walk counts them"). It is a *lane hygiene*
finding for the L1 — delete or relocate `.ufo/waves/round-51/build/ExecForgerControl/lanes/`
before the close commit (or the close's `A` will be re-derived from a dirty tree) — and
it is **not** caused by item 23 and **not** caused by this seat.

### F3 (MEDIUM) — the `[x]` hole is real and reproducible at full-tree scale: marking item 23 `[x]` makes H1's 22/22 floor satisfiable *without executing item 23*

Full-lane copy with the single character change `- [ ]` → `- [x]` on `SKILL.md:709`:

```
$ cd /tmp/mutskill/m12full && node scripts/surface-probe.mjs --checklists --self /tmp/mutskill/m12full
CHECKLIST  SKIP(checked)  SKILL.md:709 Receipt-attest hermetic suite (round 51; …)
CHECKLIST_SKIPPED: 1
CHECKLIST: 20/22 pass
VERDICT: FAIL
m12full2 exit=1
```

The denominator **falls from 23 to 22** and the item is `SKIP(checked)`, never spawned.
Once item 12's red (F2a) is repaired by the close commit, that same tree would read
`CHECKLIST: 21/22 pass` → **exactly the H1 floor of "≥ 22/22"** … with item 23 never
executed and `CHECKLIST_SKIPPED: 1` visible but not gating. The isolated variant makes
the arithmetic explicit:

```
$ node …/surface-probe.mjs --checklists --self /tmp/mutskill/iso/m12
CHECKLIST  SKIP(checked)  SKILL.md:3 Receipt-attest hermetic suite (round 51; …)
CHECKLIST_SKIPPED: 1
CHECKLIST: 0/0 pass
VERDICT: PASS
exit=0
```

`0/0 pass` with `VERDICT: PASS` and **exit 0** — a tree whose only checklist item is
skipped passes the checklist. Wave 1's `w1/CritHarm.md` F2 predicted this
("a numerical floor alone does not establish item identity or execution of new item 23");
I have now measured it end-to-end at full-tree scale, so the prediction is now an
observation. The remedy is the one CritHarm already proposed (supplemental H6): require
`CHECKLIST_SKIPPED: 0`, `CHECKLIST: 23/23 pass`, exit 0, **and** the item's identity
(`command`, `exits`, `expect`) to be asserted rather than a floor — `--checklists --json`
exposes exactly those fields (`surface-probe.mjs:1105-1118`).

### F4 (LOW) — the item's expected substring is a containment test, so a shortened substring still passes

M10 (`SELFTEST: PASS`) and M4 (`exit 0|1`) both survive. Neither is a false green of the
*shipped* item — the shipped string `ATTEST_SELFTEST: PASS` is the tight one, and its
containment in the real output is what M2 falsified. Recorded so that no future edit
shortens the expected substring or widens the exit set without a note.

---

## 5. Restoration / non-mutation evidence

* The **lane was never mutated.** `SKILL.md` sha256 in the lane is
  `6f8923dddda35ed994c91cf15a2b7e4019c6d7daffde15d5bdb7bc6ce7d79179` **before and after**
  every run in this report; `git status --porcelain SKILL.md` prints nothing (no
  tracked-file change to `SKILL.md`, `scripts/`, `corpus/`, `SCORECARD.md` by this seat).
  The only lane-tracked modifications visible are the L1's own in-flight
  `M SCORECARD.md` / `M corpus/lessons/round-51.md`.
* Every mutated `SKILL.md` lived under `/tmp/mutskill/`. The three full-tree mutants
  (`m1`, `m2`, `m3`) were mutated **twice** — once for the JSON-mode runs, then
  restored, then re-mutated for the text-mode transcripts — and were **restored
  byte-for-byte at the end of the seat**, verified by hash *and* by `diff -q`:

```
$ cp lane/SKILL.md m1/SKILL.md && cp lane/SKILL.md m2/SKILL.md && cp lane/SKILL.md m3/SKILL.md
$ sha256sum lane/SKILL.md m1/SKILL.md m2/SKILL.md m3/SKILL.md
6f8923dddda35ed994c91cf15a2b7e4019c6d7daffde15d5bdb7bc6ce7d79179  lane/SKILL.md
6f8923dddda35ed994c91cf15a2b7e4019c6d7daffde15d5bdb7bc6ce7d79179  m1/SKILL.md
6f8923dddda35ed994c91cf15a2b7e4019c6d7daffde15d5bdb7bc6ce7d79179  m2/SKILL.md
6f8923dddda35ed994c91cf15a2b7e4019c6d7daffde15d5bdb7bc6ce7d79179  m3/SKILL.md
$ for v in m1 m2 m3; do diff -q lane/SKILL.md $v/SKILL.md && echo "$v: identical"; done
m1: identical
m2: identical
m3: identical
```

  The `m12full` (`[x]`) copy and all `iso/*` trees remain as mutated scratch under
  `/tmp/mutskill/` — they are the evidence artifacts, they are outside the lane tree,
  and their pre-restore hashes are listed below.
* Mutated-file hashes (before restore), for the record:
  `m1/SKILL.md` `c8f85fb9e10ab2e3fab7ec01ce18fcd3c9416ae0ec393d54857a66e00d5ee3aa` ·
  `m2/SKILL.md` `53064d36231d352ff9e94f01a7b73d81a80778b71a0a83f37621ed1d9f763078` ·
  `m3/SKILL.md` `e534377ab6f43a317b60453a0d9c18609802624f92cc4e70462967fcf9ef34ac` ·
  `m12full/SKILL.md` `b3931b479639517af1e2ad7713a2b1db0fa140e8f1cfc4cf4b5f1fad4472f310`.
* The scratch instrument stub (`7bceafbf07089393d6bce3458241cffef11e300b0e2f7a2c541586a267945aa3`)
  and every mutated `iso/*/SKILL.md` live only under `/tmp/mutskill/`; the lane tree
  contains no file with a runnable extension created by this seat.

---

## 6. Answer to the assigned question, and what I recommend

**Assigned question — "each mutation must fail the item":** satisfied. M1 (wrong exit
set), M2 (wrong expected substring) and M3 (command at a nonexistent script) each make
item 23 FAIL, both in a full-lane overlay copy and in an isolated single-item tree, and
each drives the run's `VERDICT: FAIL` / exit 1. Item 23 is executed, not counted.

**Recommendations (owner: L1 / integration; none of them are counter or plan edits):**
1. **Close hygiene (F2b, HIGH):** remove or relocate
   `.ufo/waves/round-51/build/ExecForgerControl/lanes/` (10 untracked `.mjs` files). Until
   then `proxy-check --strict` reads `A_DRIFT delta=+10` on the working tree and H3 is red
   for a reason that has nothing to do with round 51's claim. The committed tree is
   already `PROXY: MATCH`.
2. **H1 sharpening (F3, MEDIUM):** record `CHECKLIST_SKIPPED: 0`, `CHECKLIST: 23/23 pass`,
   exit 0, **and** item-23's identity `(command, exits, expect)` from
   `--checklists --json` — the numeric floor alone is satisfiable with item 23 marked
   `[x]` (`0/0 pass`, `VERDICT: PASS`, exit 0 on the isolated tree).
3. **Prose bound (F1, MEDIUM):** wherever the round's write-up ties "item 23 green" to
   instrument integrity, name the frozen counter's `A2c/A3c/A3d/A4c` arms as the arm that
   carries it; the checklist item proves the selftest ran and printed its verdict, and
   nothing more (a one-line print-stub passes item 23).

**Not claimed:** I did not re-run the frozen counters (`ATTEST_HELD` / `DOCTRINE_HELD`),
did not judge whether the lane's claim or the plan's declared terms are met, and did not
attribute the red items 692/694 to any round-51 deliverable — only to the two named
causes above.

---

## 7. Transcripts (all under `/tmp/mutskill/`, all reproducible)

| file | content |
|---|---|
| `live-final.json` | live lane `--checklists --json` at `42ecc3c` (23 items, failed 692/694, item 709 PASS) |
| `baseline-lane-2.json` | live lane `--checklists --json`, earlier tip state (23/23, no failures) |
| `ctl.txt`, `ctl2.txt` | full-lane control copy, text mode (item 709 PASS; 692/693 red from copy relocation — see §8) |
| `m1.txt`, `m2.txt`, `m3.txt` | full-lane mutant copies, text mode (item 709 FAIL each) |
| `m12full.txt`, `m12full2.txt` | full-lane `[x]` copy (item 709 `SKIP(checked)`, denominator 22) |
| `iso/{ctl,m1,m2,m3}/` | single-item trees: control PASS, m1/m2/m3 FAIL |
| `iso/m4 … iso/m13/` | the extra mutations of §3 |
| `stublane/` | git repo with the print-stub instrument, scored by the frozen `attest51-probe.mjs` (`held=1/9`, exit 1) |

**§8 note on the copy-run noise (transparency, not a finding):** in the `/tmp` full-lane
copies, items 692/693 fail for *relocation* reasons, not round-51 reasons —
`round-gate.mjs` derives `--reports-dir` from `resolve(HERE,'..','..')` and
`--main-repo` from the checkout's parent, so in `/tmp/mutskill/ctl` they resolve to
`/tmp/mutskill/.ufo/reports` and `/tmp/mutskill` (not a git work tree:
`ROUND_GATE: FAIL-CLOSED (MAIN_REPO_NOT_GIT)`). I symlinked
`/tmp/mutskill/.ufo/reports → /home/vgpnk/Projects/shokunin/.ufo/reports`, which fixed
693's reports-dir half and left only the "not a git work tree" fail-closed; running
`round-gate.mjs` directly against the live checkout shows the *real* item-692 red is the
missing round-51 `SCORECARD.md`/`LOG.md` close artifacts (F2a). This is why the decisive
evidence for item 23 is the isolated single-item trees plus the per-item `status` /
`exitOk` / `substringOk` fields of the JSON output, and why the item-level verdicts are
reported per item rather than only as a `n/23` ratio.
