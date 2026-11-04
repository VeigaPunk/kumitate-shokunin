# K85Critic — C1 design attack (round 85)

Seat: **K85Critic** (critic, leaf). Lane: `/home/vgpnk/Projects/shokunin/kumitate-shokunin`.
Lane-author advice only; this is **not** the non-author closure and no SHONEN box is touched.

- Measured revision: `9db0c6b5eb9111cfc5581006ba976ca2cd112792` (freeze); repair
  `6663b3beb4b5bd30e766e9c01f6ba4db24f5c5e8`; base `a5d3e7549501ae76dbd86a6f81c5e858f1f92446`.
- Frozen probe sha256 `6e7b1eb77988f58e7469661e5e412fb9048dda2a275dd9eec4e9acbf7a53ec94`
  (worktree = freeze blob); content-variation sha256
  `08beaba332e4fddd5dc4cd72db90fd72d249cb3d1dd49218d33fd7a5787d0cb7`.
- Scratch `/fast/scratch/hyaku/kumitate-r85/K85Critic` deleted after the durable copies;
  every artifact receipt in `build/K85Critic/` names command, exit and revision, plus
  tool/probe sha256 where applicable
  (`build/K85Critic/MANIFEST.md`). No production, plan, probe or control file was edited;
  no installs; no git/jj mutation.

## Verdict (short)

The frozen predicate **is satisfiable by a read-only, stateless control that never parses the
receipt**. A program that reads the file only for `bytes=`/`sha256=` and takes every semantic
answer from the fixture **basename** prints `C85_C1: HELD held=20/20` (artifact A1). A stronger
program that uses **no basename, no state file and no call position**, strips the predictable
`rev=<16 hex>` prefix and maps sha256 of the remaining known body to a canned answer table,
prints 20/20 **and** `CONTENT_VARIATION: HELD held=3/3 distinct_sha=true` (artifact A2).

Consequences, in the round's own terms:

1. `plan.md` line 28–29, “so a canned or label-keyed answer cannot match”, is **false** as
   written: a label-keyed answer matches when it reads the file for the two derived fields; a
   content-keyed canned table matches both gates.
2. The frozen kill rule (“any control reaching 20/20”, `plan.md` 32–33) is met by a
   constructed control. Under the round-84 precedent — “No repair credit: keep C1 UNMET”
   (`corpus/lessons/round-84.md` line 82), where a *new* label-keyed control discovered by the
   critic kept the claim UNMET despite the tool being real — the consistent result is
   **UNMET / no capability credit**, not a clean acquisition.
3. Independently, the plan’s r84 “Real task” sentence is unsatisfiable under the frozen
   contract: `round-84/close/history-red.txt` and `history-repair.txt` are 4-line counter
   receipts, not arm transcripts; the frozen grammar yields `FAIL-CLOSED SUMMARY_COUNT`,
   exit 2, not DRIFT/CLEAN (measured with the base tool: exits `1,0,0,2,2`). Peers measured
   the same against the v2 candidate (K85Review F3, K85Sentinel S3, K85Mutation).

Recommendation: do **not** record C1 as HELD/acquisition. The tool may land as code if L1’s
own review accepts it, but this round’s measurement does not establish that the check’s
judgment is derived from the receipt — the plan’s stronger sentence (“a canned or label-keyed
answer cannot match”) is false, and a content-keyed hash lookup passes both gates. The
capability row stays out.

## Attack list

### A1 — BLOCKING — a label-keyed *reader* scores 20/20

The round-84 kill class was a label-keyed **no-reader**; the successor defends the digest, not
the judgment. A control that opens the receipt only to copy `bytes` and `sha256`, and keys
`CLEAN/DRIFT|FAIL-CLOSED`, `rows`, `held`, `findings` and the `SOURCE:` line on the basename,
scores:

```
C85_C1 arm clean ok exit=0 want=0
...
C85_C1 arm src-declared ok exit=1 want=1
C85_C1: HELD held=20/20
```

(`build/K85Critic/label-keyed/probe.txt`, exit 0; the same tool is
`CONTENT_VARIATION: UNMET held=0/3 distinct_sha=true`, exit 1,
`build/K85Critic/label-keyed/cv.txt`).

Why it works: every fixture basename is outcome-bearing (`clean`, `crlf`, `hidden-red`,
`total-drift`, `held-drift`, `duplicate`, `foreign-arm`, `two-summaries`, `no-summary`,
`malformed-arm`, `zero-arms`, `missing`, `usage`, `honest-red`, `wrong-verdict`,
`summary-before-arms`, `src-bound-clean`, `src-unbound`, `src-arity`, `src-declared`;
`probe85-c1.mjs:31-51`), and the probe writes each fixture under its own name
(`probe85-c1.mjs:58`). The nonce forces a **read** (18 arms carry a 64-hex digest) but not a
**parse**. The plan’s nonce sentence (`plan.md:27-29`) and the probe comment
(`probe85-c1.mjs:60-61`, “A lane-keyed cheat cannot hardcode them”) only defeat a reader that
does not open the file.

Impacted axes: operability (the claim’s measure), coverage (Q78 class list).
Smallest safe correction (this round): none inside the frozen files; disclose and withhold
the capability row; round 86 must make the semantic fields input-derived (see §Recommendation).

### A2 — BLOCKING — a content-keyed, stateless, read-only map scores 20/20 *and* CV 3/3

This is the decisive variant that the peer seats did not cover: no basename, no state file,
no call position, no write. It strips every leading line matching
`^rev=[0-9a-f]{16}$` (the probe’s nonce is a fixed 21-byte prefix, `probe85-c1.mjs:27,60-62`),
hashes the remaining body, and looks the digest up in a table of the 20 committed fixture
texts; for `--src` arms it adds sha256 of the source. Receipts:

```
C85_C1: HELD held=20/20                                   (build/.../content-keyed/probe.txt, exit 0)
CONTENT_VARIATION: HELD held=3/3 distinct_sha=true          (build/.../content-keyed/cv.txt,   exit 0)
```

The source (`build/K85Critic/content-keyed/scripts/counter-receipt.mjs`) imports only
`fs`, `crypto`; it never calls `basename`. The three CV bodies are static constants in
`controls/content-variation.mjs:27-30`, so their digests are authorable offline; the CV
control has no per-run nonce, and its `distinct_sha=true` leg is satisfied by a tool that
merely hashes.

This refutes the two “round already answers it” positions:
- K85Sentinel S7 concludes the content-variation control “does [establish read-dependence]”.
  It does not establish *parse* dependence: the control is passable by a content-keyed table
  with no state.
- The round-84 lesson’s prescribed fix “non-outcome-bearing labels”
  (`corpus/lessons/round-84.md:82`) would not help: this artifact uses no labels at all. The
  fixture **bodies** are the leaked oracle, and they are committed in the probe.

Impacted axes: operability, coverage.
Smallest safe correction (round 86): generate each fixture’s arm names, counts and verdict
distribution from a per-run RNG and compute the expected lines in the probe from the generated
bytes; salt the CV bodies per run the same way. Renaming files or adding a `--src` digest is
necessary but not sufficient.

### A3 — HIGH — the CV control is outside the frozen predicate and outside the kill denominator

`plan.md:24` says “The 20-case table is the only denominator”; `plan.md:32-33` kills on “any
control reaching 20/20”; the CV control is scored `/3` (`plan.md:39-41`). Therefore a CV red
cannot fire the literal kill rule, and the only sentence requiring CV is the controls bullet
(“a correct tool must read 3/3 with three distinct sha256 values”). The committed `cv-*.txt`
receipts (0/3 each) are correct but do not gate the predicate. A2 shows that wiring CV in is
still insufficient without per-run content.

Impacted axes: operability; measurement wiring.
Smallest safe correction: L1 must publish the CV 3/3 run and treat a CV miss as unmet under
the contract sentence, not under the 20/20 trigger; round 86 must fold the content-variation
assertion into the same predicate with a per-run nonce.

### A4 — MEDIUM — the probe does not assert the exact line count for `--src` arms

The contract says the output is **exactly** three lines, with `SOURCE:` only with `--src`
(`plan.md:51-53`). The probe asserts line 3 for `--src` arms but never asserts `out.length === 3`
(`probe85-c1.mjs:85-89`); it enforces exactly 2 lines for non-`--src` arms (`:90`) and exactly
1 for usage (`:93`). An artifact that prints a fourth line after `SOURCE:` still scores 20/20:

```
COUNTER_RECEIPT: CLEAN
RECEIPT: bytes=50 rows=3 held=3/3 findings=none sha256=6d3a...
SOURCE: sites=3 declared=3 receipt=3
EXTRA-LINE-NOT-CHECKED
```

(`build/K85Critic/line-lenient/direct-output.txt`; probe receipt
`build/K85Critic/line-lenient/probe.txt` = `HELD held=20/20`.) Contract-conforming tools are
unaffected; the gap matters because a red or contradictory line can ride along unseen on the
source half.

Smallest safe correction: round 86 adds `out.length === 3` for `--src` arms (and rejects
non-empty stderr); do not edit the frozen probe.

### A5 — MEDIUM — precedence is only partially testable; two source tokens have zero arms

The contract orders malformed (2) `SUMMARY_COUNT, ARM_MALFORMED, ARMS_EMPTY, SUMMARY_ORDER,
RECEIPT_UNREADABLE`, drift (1) `ARMS_TOTAL, ARM_DUPLICATE, ARM_PREFIX, HELD_COUNT, ARM_FAILED,
VERDICT`, source (2) `SOURCE_UNREADABLE, SOURCE_ARMS_EMPTY`, source drift (1) `ARM_UNBOUND,
SOURCE_ARITY, SOURCE_DECLARED` (`plan.md:54-58`). The precedence collisions the 20 arms
actually exercise are only:

- `SUMMARY_COUNT` > `SUMMARY_ORDER` (`two-summaries`);
- `ARM_MALFORMED` > `ARMS_EMPTY` and > `ARMS_TOTAL` (`malformed-arm`);
- `ARMS_TOTAL` > `ARM_FAILED` (`hidden-red`);
- `ARM_FAILED` > `VERDICT` (`honest-red`).

Untested collisions include `ARMS_TOTAL` > `ARM_DUPLICATE`, `ARMS_TOTAL` > `ARM_PREFIX`,
`ARM_DUPLICATE` > `ARM_PREFIX`, `ARM_PREFIX` > `HELD_COUNT`, `HELD_COUNT` > `ARM_FAILED`,
`SUMMARY_COUNT` > `ARM_MALFORMED`, `ARMS_EMPTY` > `SUMMARY_ORDER`, any receipt-drift >
source-drift pair, and `SOURCE_ARITY` > `SOURCE_DECLARED`. `SOURCE_UNREADABLE` and
`SOURCE_ARMS_EMPTY` have **zero** arms; nor are `declared=absent`, `--selftest`, or
unknown/duplicate CLI shapes exercised. The lane already knows how to test the collisions: the
base tool’s own selftest carries `total-before-duplicate`, `duplicate-before-prefix`,
`prefix-before-held`, `held-before-failed`, `empty-before-drift`, `order-before-total` and
more (`a5d3e754:scripts/counter-receipt.mjs`, selftest table lines 91-98; base selftest `PASS held=50/50`,
`build/K85Critic/support/base-selftest.txt`), but the frozen table does not reuse them.
K85Review F5 and K85Mutation’s survivors S01/S02/S03 independently found the same coverage
holes.

Smallest safe correction: round 86 adds the collision arms and the two source tokens; L1 may
run the v2 `--selftest` as an extra published check now, but it is not the claim denominator.

### A6 — HIGH (plan text) — the r84 “Real task” is unsatisfiable under the frozen contract

`plan.md:64-67`: “The new tool must answer over committed bytes … r84 `close/history-red.txt`
and `close/history-repair.txt` → DRIFT/CLEAN.” Those files are 4-line counter receipts
(`rev=…`, `command=…`, `COUNTER_RECEIPT: …`, `exit=…`), not arm transcripts; the contract’s
grammar requires one `: HELD|UNMET held=N/D` summary after one or more arm rows
(`plan.md:48-53`). Measured with the base tool at `a5d3e754`:

| file | exit | first line |
|---|---|---|
| r83 `close/c1-probe.txt` | 1 | `COUNTER_RECEIPT: DRIFT ARMS_TOTAL` |
| r83 `close/c1-repair.txt` | 0 | `COUNTER_RECEIPT: CLEAN` |
| r83 `close/c2-probe.txt` | 0 | `COUNTER_RECEIPT: CLEAN` |
| r84 `close/history-red.txt` | **2** | `COUNTER_RECEIPT: FAIL-CLOSED SUMMARY_COUNT` |
| r84 `close/history-repair.txt` | **2** | `COUNTER_RECEIPT: FAIL-CLOSED SUMMARY_COUNT` |

(`build/K85Critic/realtask/base-five.txt`.) The v2 candidate (K85Review §3) and the L1 draft
(K85Sentinel S3) return the same `SUMMARY_COUNT` for the r84 pair. Either the r84 row means
“the verdicts those receipts *record* for the r83 paths named in their `command=` lines”
(which the r83 results above do satisfy), or the contract needs a second grammar it does not
have. As written, a literal reader of the plan scores this part red.

Smallest safe correction: L1 declares the reading in the report and does not claim the v2 CLI
consumes the r84 files; the frozen files and historical bytes stay untouched.

### A7 — MEDIUM — the contract does not determine all 20 expected `RECEIPT` lines

`rows=0` for the malformed arm (`probe85-c1.mjs:41`), `held=-/-` for no-summary/missing
(`:40,43`), raw-file `bytes` including CRLF (`:33`), and `clean`’s **two** nonce lines
(`:32` embeds `${nonce}\n${good}`, `:62` prepends another nonce, so the expected `bytes` is
95) are not in the contract, which defines only the shape `bytes=<n> rows=<r> held=<h>/<d>
findings=… sha256=…` (`plan.md:51-53`). A prose-only implementer can lose arms while being
contract-faithful: K85Review measured `held=0/0` at 18/20 and the alternative arity reading at
19/20 (`prose-held`, `prose-arity`); my content-keyed tool’s single-strip version scored 19/20
on `clean` because of the double nonce
(`build/K85Critic/content-keyed-single-strip/probe.txt`, `UNMET held=19/20`; the `clean` run
reports the file’s `bytes=95`, twice the 21-byte prefix plus the 53-byte text). The integrated v2 candidate currently matches the
probe’s unstated values (I verified `malformed-arm`, `no-summary`, `missing`, double-nonce on
the worktree tool), so this is a contract-documentation defect, not a tool defect.

Smallest safe correction: pin these conventions in the v3 contract text and Q78 notes, not in
this round’s frozen files. Also record that `clean` carries two metadata lines, contrary to
the probe comment’s “a per-run nonce metadata line”.

### A8 — MEDIUM (provenance) — the committed control receipts carry no command, exit or revision

The round’s receipt rule is “every receipt names command, exit code and the revision it
measured”. The frozen controls do not: `controls/base.txt` starts at
`C85_C1 arm clean FAIL exit=0 want=0 line2=""`; `controls/cv-base.txt` is four lines ending
`CONTENT_VARIATION: UNMET held=0/3 distinct_sha=true`. The r84 precedent did carry headers
(`round-84/controls/base.txt` starts `rev=a648a6f8…`, `base_tool_lookup_exit=128`,
`command=node …/probe84-c1.mjs …`). I reproduced all six r85 controls line-for-line from the
freeze bytes (`build/K85Critic/repro/`), and `controls/base/scripts/counter-receipt.mjs` is
byte-identical to `git show a5d3e754:scripts/counter-receipt.mjs`, so the content is bound by
hash; the **ordering** claim (“committed before data”) is not self-attested in the control
bytes (all enter in the single freeze commit).

Smallest safe correction: L1 adds a `close/` attribution sidecar naming the six commands,
exits, and freeze rev; round 86 templates the header into control receipts. Do not edit the
frozen control files.

### A9 — LOW — the committed noreader understates the no-read class ceiling (1/20, not 2/20)

`controls/noreader.txt` fails `usage` only because its implementation keys usage on a
`--receipt` basename and the probe passes empty argv. A no-reader that special-cases empty
argv and the `missing` label scores **2/20** (`build/K85Critic/no-reader-smart/probe.txt`:
`missing ok`, `usage ok`, `UNMET held=2/20`). K85Cheat F5 and K85Review F7 measured the same
floor independently. The threshold stays 20, so this is not fatal, but the control’s 1/20 is
not the class maximum and should not be quoted as such.

Smallest safe correction: record the 2/20 ceiling in the round-86 control text; no frozen
change.

### A10 — INFO/SCOPING — the “before” 1/20 is honest, but it measures the new observable, not absence of a check

Reproduced line-for-line (`build/K85Critic/repro/base-probe.txt`): all 15 non-source receipt
arms match the base tool’s verdict line and exit code, and `usage` passes; only the `RECEIPT:`
line is empty, because v1 has no derived line. The 4 `--src` arms exit 64 because v1 does not
know the flag.
So the base is **not** an unrelated blanket refusal; it is the absence of the derived line and
the source interface. But the check itself already exists in v1: all 16 non-source verdicts and
exits are v1 behavior, and v1 already returns the plan’s r83 real-task verdicts (A6 table).
The genuinely new surface is the derived `RECEIPT:`/`SOURCE:` echo plus the source binding —
which is exactly the surface A1/A2 forge. The “before” should be described as an observability
baseline, not as “the check did not exist”.

Impacted axes: operability framing; the capability row’s wording.

## Direct answers to the five assigned questions

### (1) Is the target reachable by a do-nothing control?

Strictly “never opens the receipt”: **no**. Routes and verdicts against the actual assertions:

| route without opening the receipt | what it can produce | verdict |
|---|---|---|
| probe-source inspection + fixed table | `usage` (empty argv, one line, exit 64) and `missing` (`bytes=0 rows=0 held=-/- findings=RECEIPT_UNREADABLE sha256=-`); every other arm needs a 64-hex digest of a nonce-bearing file | **2/20 ceiling**, measured (`no-reader-smart`); K85Cheat/Review agree |
| filename keying with no read | same 2/20; the digest is not name-determined | **2/20** |
| environment keying | probe passes the parent env unchanged and sets no per-case variable; only argv carries the case | **no route** |
| timing | `spawnSync(timeout: 10000)` turns a hang into a null status, which fails the arm | **no route** |
| parent/proc introspection | `/proc/<ppid>/mem` is `EACCES` under `ptrace_scope=1`; the probe argv has `--lane/--work`, not the nonce | **no practical route** (K85Cheat F7; K85Review `parentmem`) |
| rewriting the probe source mid-run | the probe process already holds its table and expectations; the child cannot read them | **no route** |

So round-84’s no-read class is genuinely closed (2/20). The target **is** reachable by a
program that opens the receipt only for `bytes`/`sha256` and does not judge it: **20/20** (A1),
and by a content-keyed table with no labels/state: **20/20 + CV 3/3** (A2). The claim’s
“answer depends on bytes it read” is met by a hash lookup, not by the check.

### (2) Are the 20 arms outcome-bearing?

- A constant printer passes **0/20** (`controls/stub.txt`, reproduced); `usage` is passable by a
  usage-only printer; `missing` and `usage` by a table printer (2/20). Every other arm needs the
  real digest, so the committed constant printer cannot pass 20.
- No two arms have **fully** identical expected output. The closest pairs:
  - `clean` vs `crlf`: identical line 1 `COUNTER_RECEIPT: CLEAN` and identical semantic fields
    `rows=2 held=2/2 findings=none`; only `bytes` (95 for `clean`, which carries two nonce
    lines, vs 77 for `crlf`) and `sha256` differ — a byte/CRLF accounting test, not a distinct
    verdict.
  - `hidden-red` vs `total-drift`: both `DRIFT ARMS_TOTAL`, `rows=2`; `held` `1/1` vs `2/3`.
  - `two-summaries` vs `no-summary`: both `FAIL-CLOSED SUMMARY_COUNT`; `rows` 2 vs 1; `held`
    `2/2` vs `-/-`.
  - `src-bound-clean`, `src-arity`, `src-declared`: the **same receipt input** (`three`), so
    the same expected `bytes/rows/held/sha`; only the token and `SOURCE:` line differ — three
    arms that discriminate source semantics but not the receipt.
- 16 of the 20 arms are v1’s existing semantic cases; the marginal new semantics are the 4
  source arms. The rest of the new content is the derived line (the forgeable part). The table
  is anti-constant but not anti-table: A1/A2 pass all 20.

### (3) Is the predicate the contract sentence, and is the precedence testable in order?

- The predicate sentence in `plan.md:22-24` and the assignment is exactly the probe’s final
  assertion (`probe85-c1.mjs:99-101`): `HELD held=20/20`, exit 0, with
  `ran === cases.length === 20`. **Yes, same sentence.**
- Precedence: **partially**. See A5 for the tested and untested pairs; the two source
  precedence-2 tokens have zero arms. The order is therefore not fully testable “in the order
  claimed”; a tool could reorder the untested pairs and still score 20/20. The base tool’s own
  selftest already covers several of the missing collisions (`a5d3e754:scripts/counter-receipt.mjs`, selftest table lines 91-98).
- **Contradiction found (A6):** the Real-task sentence (`plan.md:64-67`) requires DRIFT/CLEAN
  from the r84 history files, which the contract grammar (`plan.md:48-58`) can only read as
  `SUMMARY_COUNT`, exit 2. This is a plan-text contradiction, not a predicate contradiction:
  the predicate can still be HELD while the real-task leg fails. A second wiring contradiction:
  plan 24 says the 20-case table is the only denominator while plan 39-41 requires CV 3/3; the
  kill rule (32-33) cannot fire on a `/3` control (A3).

### (4) Does the base 1/20 measure absence of the work rather than an unrelated refusal?

Yes, with the scoping caveat. The base tool is the real base revision
(`controls/base/scripts/counter-receipt.mjs` sha256 `190a4c1f…`, byte-identical to
`git show a5d3e754:scripts/counter-receipt.mjs`). It evaluates all 15 non-source receipt arms
and matches their verdict/exit; only `RECEIPT:` is missing. Four `--src` arms exit 64 because
the flag is new; `usage` passes. Reproduced line-for-line against the committed receipt. So it is the
absence of the derived line and the source interface, not a blanket usage refusal. But the
check logic already exists in v1 (A10): the “before” is an observability baseline; the
anti-vacuity before is `controls/noreader.txt` (1/20; class ceiling 2/20, A9).

### (5) Strongest realistic critique the closure will raise — and has the round answered it?

The critique:

> “Your 20/20 proves the tool read bytes, not that it judged them. A read-only, stateless,
> basename-free tool that strips your predictable `rev=<16 hex>` prefix and maps the known
> fixture bodies to canned answers passes the probe **and** your content-variation control. Your
> nonce is a 21-byte constant prefix, not fresh content; your CV bodies are static; your fixture
> basenames encode outcomes; and your r84 real-task sentence is unsatisfiable. `plan.md:28-29`
> is false. Q78’s class list omits the reader classes, and the kill rule’s control trigger is
> met by a constructed control.”

No, the round has **not** answered it. It has partially disclosed it: K85Cheat F1/F2 measured a
nonce-read table and a hybrid; K85Review F1/F2 measured a path-keyed reader and a stateful CV
pass; K85Sentinel S7 measured a path-keyed reader and concluded CV is the discriminator; K85Mutation
found the contract survivors; K85Review F3/Sentinel S3/Mutation found the r84 real-task defect.
What the round still says is the opposite: the plan text claims label-keyed answers cannot
match; Q78’s class list names only absent/constant/label-keyed-no-reader/same-path; the CV is
not in the predicate or the kill denominator; and the r84 sentence stands. A2 removes the last
escape hatches (no basename, no state file, no write): the content-variation control is not a
sufficient discriminator, and renaming labels would not fix it. The integrated candidate may be
a sincere parser (K85Review §3), but the *measurement* does not establish that, and the lane’s
own r84 precedent says a passing non-checking control keeps the claim UNMET.

## Recommendation to L1

1. **Do not record C1 as HELD/acquisition.** The honest record is `C85_C1: HELD held=20/20`
   with a disclosed **UNMET** claim: the predicate is satisfiable by a read-only control that
   never judges the bytes, and the r84 real-task leg is unsatisfiable as written. Per the r84
   lesson (“No repair credit: keep C1 UNMET”), the capability row stays out and SHONEN boxes
   stay `[~]`.
2. If L1 instead treats “control” as only the three pre-data files, record the probe as HELD
   **with the same disclosure** and do not upgrade it to “the answer depends on the receipt’s
   content”. The plan cannot be narrowed after data (`plan.md:30`); the Q78 text and the
   round-86 predicate must be the place the correction lands.
3. Publish, in `close/`: the CV 3/3 run; the real-task five with the r84 reading declared
   (actual `SUMMARY_COUNT` for the r84 files); the v2 `--selftest`; and the two counterexamples
   (label-keyed, content-keyed) with their command/exit/rev. Do not call the r84 pair green.
4. Round-86 pre-registration (not a re-scope of this frozen predicate): per-run randomized
   receipt **content** (arm names, counts, verdict distribution) with expected lines computed
   by the probe from the generated bytes; salted CV bodies; exact line count for `--src`; a
   source digest or source-mutation arm; the missing precedence collision arms and the two
   source tokens; Q78 classes for path-keyed/partial readers and content-keyed tables; control
   receipts with command/exit/rev headers.
5. No edits to the frozen plan, probe, controls, `SCORECARD.md`, `LOG.md`, `corpus/`, `SKILL.md`
   or another seat’s subtree; historical bytes untouched.

## Peer reconciliation (what is new here)

- K85Cheat F1/F2: nonce-read + table 20/20; name-keyed hybrid 20/20 + CV 3/3. My A1 is an
  independent label-keyed reader; my A2 is the stronger no-label/no-state variant.
- K85Review F1/F2: path-keyed reader 20/20; stateful position-keyed tool 20/20 + CV 3/3. My A2
  is stateless and read-only (no state file, no call position), so it cannot be dismissed as a
  contract-violating write; it also shows the fix is content randomization, not just order.
- K85Sentinel S7: path-keyed 20/20, CV 0/3, concludes CV is the discriminator. A2 refutes that
  conclusion as a *sufficient* condition.
- K85Mutation: probe survivors and the r84 contract defect; my A6 gives the base-tool receipt
  and the exact exits; my A5 lists the untested precedence pairs.
- New in this seat: A2 (content-keyed both-gates counterexample), A4 (fourth line accepted on
  `--src`), A8 (control receipts lack command/exit/rev), A10 (before is observability, not
  check absence), and the kill-rule reading/recommendation.

## Artifacts

All under `/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-85/build/K85Critic/`;
every receipt names command, exit and revision, plus tool/probe sha256 where applicable;
`MANIFEST.md` indexes them. They are written for L1 to commit — this seat performs no git/jj
mutation.

- `label-keyed/{scripts,probe.txt,cv.txt}` — 20/20 probe, 0/3 CV.
- `content-keyed/{scripts,probe.txt,cv.txt}` — 20/20 probe, 3/3 CV, no basename/state/write.
- `content-keyed-single-strip/{scripts,probe.txt}` — 19/20; grounds the `clean` double-nonce
  and `bytes=95` observation (A7).
- `line-lenient/{scripts,probe.txt,direct-output.txt}` — 20/20 with a fourth line.
- `no-reader-smart/{scripts,probe.txt}` — 2/20 class ceiling.
- `repro/{base,stub,noreader}-probe.txt`, `repro/cv-*.txt` — all six committed control receipts
  reproduced line-for-line.
- `realtask/base-five.txt` — base tool on the five real-task files: exits `1,0,0,2,2`.
- `support/base-selftest.txt` — base selftest `PASS held=50/50`, including the precedence
  collisions the frozen table omits.

## Method, limits, cleanup

- Only the frozen probe, frozen content-variation control, base tool and the v2 worktree tool
  were executed read-only; all probe `--work` paths were under
  `/fast/scratch/hyaku/kumitate-r85/K85Critic/`. No build/lint/tests on the shared tree; no
  production, plan, probe, control, SCORECARD/LOG/corpus/SKILL edit; no git/jj mutation; no
  installs; S245/S246 unused.
- The shared worktree changed mid-review: at 15:50 the lane tool was v1 (sha `190a4c…`); by
  16:05 an uncommitted v2 was present (sha `f385bd…`), and peer receipts cite other candidate
  shas. I did not score the integrated tree; L1 must run the frozen probe once on a pinned
  integration and bind the report to that hash.
- Scratch `/fast/scratch/hyaku/kumitate-r85/K85Critic/` is deleted after these durable copies.
