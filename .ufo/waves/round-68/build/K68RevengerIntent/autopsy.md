# Round-67 draft autopsy — intent, crash anatomy, delta, verdict

Seat `K68RevengerIntent` (r68 w1). Frozen inputs read in full: `.ufo/waves/round-67/plan.md`,
`.ufo/waves/round-67/probe/ledger67-probe.mjs` (439 lines), `.ufo/waves/round-68/plan.md`,
`.ufo/waves/round-68/probe/ledger68-probe.mjs` (466 lines), `.ufo/waves/round-68/base/*.txt`,
`.ufo/waves/round-67/{base,controls}` (both empty), `corpus/lessons/round-67-verifier-spotcheck.md`,
`corpus/lessons/round-66-verifier-spotcheck.md`.

## 1. Intent statement (what the frozen round-67 draft would have measured)

The intent is one predicate with three conjuncts, unchanged from round 66's C1:

1. **Tool** — `scripts/routed-ledger.mjs` at v1 must become v2 (`kumitate-routed-ledger-v2`) with the six
   round-66 wave hardenings, each demonstrable by an independent mutant: GIT_DIR-inherited repo escape,
   symlink/`..` answer and ledger escapes, a silently-missed second routed section, one-word/ambiguous quote
   binding, the ±2-line answer window, and fence-blind item counting.
2. **Data** — `corpus/routed-ledger.md` must bind *every* routed item of the twelve verifier spot-checks of
   rounds 55..66 to one row carrying (a) a quote of 3..25 words that is word-boundary located in that item
   **and unique within the routed section**, and (b) for closed/wontfix rows, an answer quote located at an
   **exact named line of a lane file that is neither the ledger nor any spot-check**; the round-66 items
   (D1–D3) must be answered *this round* (the answer text must not exist in that file at
   `8d557f85312de4fcc82e09ff735d21436bc3746d`); the ledger must span ≥ 5 classes with ≥ 1 class across
   ≥ 4 rounds.
3. **Measure** — that predicate is measured on `git archive <rev>` (never the worktree), the counter cannot
   be vacuous (L5: an always-CLEAN and an always-DRIFT stub must both fail L4), the registry home must exist
   in the same revision (L6), and the counter must confine itself (L7: poisoned env refused, symlinked tool
   never executed, unsafe extraction refused, child env allow-listed).

So the frozen round would have measured: *one row per routed item, each row anchored at both ends — quote in
the item, answer at an exact line — with the tool proven able to catch each of the six escape classes and the
counter proven able to fail.* The number it would have printed is a binding count, not an adequacy judgement
(both plans say so in their stated limits).

## 2. Crash anatomy (reproduced, not inferred)

Reproduced on a scratch copy (`/fast/scratch/.../K68RevengerIntent/ledger67-copy.mjs`, byte-identical):

```
$ TMPDIR=<scratch> node ledger67-copy.mjs <lane> f29eb6990653dba3e1c6296044fd7bfa2ac2b9ed
exit=1
stdout: (empty)
stderr: Error: EEXIST: file already exists, mkdir '.../ledger67.gfEY1m/archive'
          at mkdirSync (node:fs:1410:26)
          at extract (.../ledger67-copy.mjs:79:3)
          at .../ledger67-copy.mjs:92:13
```

Anatomy, in order:

- `ledger67-probe.mjs:71` — `const A = join(T, 'archive'); mkdirSync(A);` pre-creates the extraction root.
- `ledger67-probe.mjs:78-79` — `function extract(dst) { mkdirSync(dst); … }` creates the same directory again.
- Line 92 `const bad = extract(A)` is the **first** call after `git rev-parse` (line 87). The exception is
  synchronous and uncaught: **no `check()` has run**, no `LEDGER67_UNMET`/`LEDGER67_HELD` line is printed,
  and the `rmSync(T)` cleanup at the tail is never reached — the temp dir **leaks** (observed:
  `ledger67.gfEY1m` left behind with an empty `archive/`).
- The failure contradicts the file's own contract ("exit 2 when the revision cannot be read or archived, or
  the environment/extraction is unsafe"): it exits **1 with a stack trace on stderr and an empty stdout**, so
  a harness reading the last stdout line as the verdict reads nothing at all.

Two further fatals were masked by the crash. Each was measured, not assumed:

- **F2 — the confinement rule is unsatisfiable on the real lane.** r67 `extract()` fails closed on *any*
  symlink anywhere in the revision (line 85). The lane at the r67 base carries **16 committed symlinks**
  (`git -C <lane> ls-tree -r f29eb699 | awk '$1=="120000"'` → 16, first
  `.ufo/waves/round-57/build/SentinelArtifacts/fx/E8/knowledge-link`). Patching *only* the EEXIST line
  (`mkdirSync(A)` removed) yields `LEDGER67_UNMET held=0/7 … | EXTRACTION_UNSAFE`, **exit 2** — permanently,
  for every revision of the lane. So even a crash-free r67 draft could only ever print `held=0/7`.
- **F3 — the frozen denominator is wrong by one.** r67 plan: "60 items in 12 sections: rounds 55..65's 57
  plus round 66's D1–D3". Measured with the draft's own `items67()` over `f29eb699`: rounds 55..65 = 57,
  round 66 = **4** (D1, D2, D3 **and** the bullet `- **Note for the operator (not a defect,
  promotion-owned):** …`), total **61**, 12 sections. With 60 rows, L2 (`rows >= ownItems` = 61) and L3
  (`unledgered:<round>#<item>`) both MISS. Same count at the r68 base (`d23892ad`): 61 / 12, so the one-item
  error is not a revision artifact — it is an arithmetic error in the frozen sentence.

**Why it died unexercised.** The death is the run lifecycle, not the bug: `corpus/lessons/round-67-verifier-spotcheck.md`
records "honest stop — operator ended the hyaku run mid-round; no wave dispatched, no `.ready` marker, no
claim frozen, no lane commit", and grades the draft as "exists only as an uncommitted draft … not exercised".
`.ufo/waves/round-67/base/` and `.ufo/waves/round-67/controls/` are **empty directories** (0 bytes, created
04:17–04:18), although the plan names four receipts there. The run-9 wrap-up then committed the two draft
files as if they were a freeze. The bug is the *consequence*: nothing had ever executed the file between
writing it and committing it, so an exception that fires on the first line after `rev-parse` survived into a
"frozen" artifact. That is exactly the mistake r68 mines (`unexercised-counter`, fix QUALITY Q64: a frozen
counter carries its exercised base receipt in the same freeze commit).

## 3. Delta table — draft L67 vs frozen L68

Mechanical delta: `diff -u` = 186 lines, 75 changed lines (in the build dir as `probe.diff`). Line numbers
are the r67 / r68 files.

| # | Element | r67 draft | r68 frozen | Verdict |
|---|---|---|---|---|
| 1 | Rule label / verdict token | `L67`, `LEDGER67_*` | `L68`, `LEDGER68_*` (+ doc/usage strings) | relabel only |
| 2 | Base constant | `f29eb699…` | `d23892ad…` | base moved to the run-9 wrap-up tip; `R66BASE` `8d557f85…` identical in both |
| 3 | `const A` / `extract()` | `:71 mkdirSync(A)` **and** `:79 mkdirSync(dst)` | `:71` mkdir deleted; `:79` kept | **the crash fix** (F1) |
| 4 | Extraction rule | `:85` any symlink or special file anywhere → `EXTRACTION_UNSAFE` exit 2 | `:82-87` special files only; symlinks tolerated, **never followed** | relaxation of the *extraction* rule — forced by F2 (16 lane symlinks) |
| 5 | Read-path confinement | none (only extraction-time) | `:99-108 chainSafe()`; `:110-114 rd()` latches `UNSAFE`; `:198/:221/:382` L1/L2/L4 refuse a symlinked tool; `:276-286` static-path gate (`ledger`, `SKILL.md`, `QUALITY.md`, `SCORECARD.md`, the twelve spot-checks) → `EXTRACTION_UNSAFE` exit 2 | strengthening: every read is chain-checked, not just the extraction |
| 6 | L7(c) fixture | symlink `notes/alias.md` (not a read path) | symlink **directory** `corpus/lessons` (on a static read path) | fixture re-aimed at the new proof obligation |
| 7 | L7 declared text | "a revision containing any symlink or non-regular file fails closed" | "a symlink at or above any static read path … fails closed; symlinks elsewhere tolerated but never followed" | the sentence was updated **with** the code — the only rule change stated on both sides |
| 8 | L1..L6 predicates | 20 mutants, ≥44 selftest, ≥3/≤25-word quotes, uniqueness in section, exact-line answers, forbidden answer paths, one non-open row per item, ≥5 classes / 1 class ≥4 rounds, L5 stubs, L6 three registry homes | **identical** | survived verbatim |
| 9 | `items67()` parser, `ledgerParse()`, `norm/wb/nwords`, `POISON`, `CHILD_ENV`, `FROM/TO`, `R66BASE` clause | — | **identical** | survived verbatim |
| 10 | Header says L2 passes `--classes` | `spawnSync` passes only `--root --from --to` (`grep -c "'--classes'"` = 0) | same gap, 0 occurrences | **defect survived verbatim** (see F5) |
| 11 | `const BASE` at `:46` | declared, never read | declared, never read | dead constant survived verbatim (cosmetic) |
| 12 | L7 self-invocation structure | `spawnSync(process.execPath, [SELF, …])` in (b) and (c), no recursion guard | identical | **defect survived verbatim** (see F4) |

## 4. Verdict — does the r68 counter serve the ORIGINAL intent?

**Yes for the binding predicate, with three inherited holes and one prose defect.** Reasons, each grounded:

- All of §1's conjuncts are still measured, check for check: the 20 mutants are the six hardenings'
  falsifiers, the quote/answer anchoring is byte-identical (exact line, no window), the round-66
  answered-this-round clause is unchanged, L5 keeps the counter non-vacuous, L6 keeps the registry home.
  Nothing was dropped and nothing was relaxed in the *binding* semantics; the one relaxation (#4) is
  confined to symlinks on non-read paths and is the precondition for measuring the real lane at all.
- The r68 draft is the first of the two that can emit a verdict on the real lane: re-run at base with the
  receipt's seed reproduces the committed line exactly —
  `LEDGER68_UNMET held=1/7 checks=7 rev=d23892ad… rule=L68 seed=2583a841b9d97d5e | L1 MISS … | L2 MISS exit=2
  … own-items=61 own-sections=12 own-spotchecks=12 | L3 MISS 68 problems … | L4 MISS 7/20 mutants wrong …`
  (my scratch run, 200.14 s wall; the only held check is L7).
- The denominator question is settled in the right place: L2 binds `items=` to the counter's own count
  (61), not to the plan's sentence (which says "58 plus round 66's D1–D3", i.e. 61 by accident and 58 by
  error — 55..65 is 57). A counter that trusts its parser over its prose is the intended design; the prose
  should be corrected by the L1, never edited in place.
- But the intent's own completeness clause is now *over*-broad relative to its wording: the parser counts
  round 66's `Note for the operator (not a defect, promotion-owned)` bullet as an item, so L3 forces a row
  (and, for the round-66 clause, a *closed/wontfix* answer that does not exist at the r66 base) for a bullet
  the spot-check declares is **not a defect**. The intent sentence says "every routed item"; the bullet sits
  inside the routed section, so the parser is defensible, but the r68 plan's own gloss ("round 66's D1–D3")
  shows the author believed 3. Either ledger it with a non-defect class (`wontfix` + a located answer, or a
  `note` class) or exclude bullets matching `not a defect`/`Note for the operator` in **both** the tool and
  the counter — the second is a rule change and needs a fresh freeze.
- F4 (L7 self-recursion) is the one place where the intent's "the counter confines itself" is asserted by a
  construction whose cost is not bounded: L7(b) and L7(c) each re-invoke the counter itself
  (`spawnSync(process.execPath, [SELF, …])`, `:439` and `:454`), the child re-enters L7, and there is **no
  nesting guard anywhere in the file** (`grep -n 'NESTED|depth|recurs'` matches only `recursive: true`
  options). Measured cost split on the base revision, same seed:
  with L7 stubbed → `real 0m2.548s`; unmodified → `200.14s` (**78×**, L7 = 99% of the run).
  Observed fan-out while two seats ran it concurrently: **370 live counter processes** (219 mine, killed;
  the rest a sibling seat's), with nested temp-dir chains 11 path components deep, e.g.
  `…/K68MutToolDrop/ledger68.6C6Sqo/ledger68.tEoKli/ledger68.yZI8sZ/ledger68.xnBK7H/ledger68.udRzyL/
  ledger68.um0gBZ/ledger68.i6jEmd/ledger68.Q22i2x/ledger68.vYCbBf/fx-symtool` — each level's fixture living
  inside its parent's TMPDIR. On the smallest possible input (a two-file fixture with no tool and no ledger,
  where L1–L6 cost 2.5 s) the counter had printed **no verdict after 160 s** (`exit=143`, killed).
  The expectation (`exit 1 && /L1 MISS/`) is satisfied by *any* inner failure — including an inner run whose
  own L7 collapsed — so the check passes while the proof it claims is not what the code does. A one-shot guard
  (`LEDGER68_NESTED=1` in `CHILD_ENV`, or a `--nested` flag that skips L7) makes the proof linear and keeps
  its teeth.
- F5 (`--classes` documented, never passed) means the tool's class-aggregation output path is not exercised
  by the frozen counter; classes are only checked from the ledger by L3. This is the `unexercised-counter`
  mistake one level down: an unexercised *flag* inside an exercised counter.
- F6 (unexercised sub-rule, inference only): the declared static-path gate tests
  `existsSync(ap) && !chainSafe(ap)`. A **dangling** symlink at `SKILL.md`/`QUALITY.md`/`SCORECARD.md` is not
  `existsSync`-visible, so the gate does not fire; the later `rd()` sets `UNSAFE` *after* the gate has
  passed, giving `L6 MISS` + exit 1 instead of the declared `EXTRACTION_UNSAFE` exit 2. Outcome is UNMET
  either way, so no claim can be gained — but the sentence "fails closed before any check" is not what the
  code does on that input. Not exercised: the fixture run that would have shown it was consumed by F4's
  recursion and was killed at 160 s with no verdict.

## 5. Reproduction commands

```bash
L=/home/vgpnk/Projects/shokunin/kumitate-shokunin
S=/fast/scratch/hyaku/kumitate-r68/K68RevengerIntent   # TMPDIR
cp $L/.ufo/waves/round-67/probe/ledger67-probe.mjs $S/ledger67-copy.mjs
TMPDIR=$S/tmp node $S/ledger67-copy.mjs $L f29eb6990653dba3e1c6296044fd7bfa2ac2b9ed       # F1: EEXIST, exit 1, empty stdout
sed "s|; mkdirSync(A);|;|" $S/ledger67-copy.mjs > $S/ledger67-fixed.mjs
TMPDIR=$S/tmp node $S/ledger67-fixed.mjs $L f29eb6990653dba3e1c6296044fd7bfa2ac2b9ed      # F2: EXTRACTION_UNSAFE exit 2
git -C $L ls-tree -r f29eb6990653dba3e1c6296044fd7bfa2ac2b9ed | awk '$1=="120000"'        # 16 symlinks
TMPDIR=$S/tmp2 node $L/.ufo/waves/round-68/probe/ledger68-probe.mjs $L d23892ad44b41e1af63b3edb949d265ca1dd812d --seed 2583a841b9d97d5e   # held=1/7, 200.14 s
# L7 isolation: same run with the L7 block replaced by check('L7', true, …) → 2.548 s
awk '/^\/\/ ---- L7: self-confinement proofs/{print "check(\"L7\", true, \"disabled-for-timing\");"; skip=1; next} skip==1 && /^rmSync\(T, \{ recursive: true, force: true \}\);$/{skip=0} skip==0{print}' \
  $L/.ufo/waves/round-68/probe/ledger68-probe.mjs > $S/ledger68-noL7.mjs
TMPDIR=$S/tmp5 node $S/ledger68-noL7.mjs $L d23892ad44b41e1af63b3edb949d265ca1dd812d --seed 2583a841b9d97d5e
pgrep -cf 'waves/round-68/probe/ledger68-probe.mjs'   # fan-out of one invocation while a sibling seat ran it: 370
diff -u $L/.ufo/waves/round-67/probe/ledger67-probe.mjs $L/.ufo/waves/round-68/probe/ledger68-probe.mjs | grep -c '^[+-][^+-]'   # 75
```
