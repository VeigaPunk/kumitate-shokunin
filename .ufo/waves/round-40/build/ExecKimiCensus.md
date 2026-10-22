RESULT ExecKimiCensus rev=f69817edf687c8ce4f87ed7953a353399232f69e verdict=done census=CLEAN selftest=48/48 sha256=ded569fec9b67cfbc0982f3fb431453e44b322024db457e184a99d81376c3d08 k_sections_rule=distinct-K-member-identities-named-by-`## `-headings-of-corpus/knowledge/kimi-*.md

> **LIVE VALUES (read this first).** The landed `scripts/kimi-census.mjs` sha256 is
> `ded569fec9b67cfbc0982f3fb431453e44b322024db457e184a99d81376c3d08`, and the stanza's
> `pin.kimi-census` carries exactly that. Two patched-file hashes are **superseded**:
> `529e6dd6…` (my pre-header-fix file) and `9612d0f0…` (the sibling's candidate).
> Neither is live. This report is written chronologically, so earlier sections quote
> `529e6dd6…` as the value at that stage; every such mention is superseded by the
> header correction in the integration section. The final landed state is
> `PROXY: MATCH (… K=52/52 coverage:kimi-layer=10; pins=6 match)`, census
> `CLEAN (members=52 checked=52 chain=7 info=4)`, selftest `48/48 pass`.

# ExecKimiCensus — the `skills/` tripwire, re-pinned 6 → 7

Lane revision: `f69817edf687c8ce4f87ed7953a353399232f69e` (round-39 verifier spot-check).
Scratch clone: `/fast/scratch/hyaku/kumitate-r40/seats/ExecKimiCensus/lane`
(HEAD detached at the base revision; the change is uncommitted and delivered as a patch).

## What changed (one file)

`scripts/kimi-census.mjs` — the `skills/` counted-live tripwire moves 6 → 7.
The counting rule is unchanged (live child count; names still not gated). What moved:

- member table: `{ id: 'skills/', family: 'K2', path: 'skills', kind: 'dir', counted: 6 }` → `counted: 7` (line 116)
- enumerable-dir table: `{ dir: 'skills', childCount: 6 }` → `childCount: 7` (line 148)
- `FROZEN = { K1: 4, K2: 26, ... }` → `K2: 27` (line 155); K1/K3/K4/K5 unchanged
- header comments: the member-total sentence, the `MEMBER RULES` block, the `K2 =` rule
  line, and a new `ROUND 40 (2026-10-22)` paragraph in the header
- usage text `K1–K5 member rules (51 members)` → `(52 members)`
- selftest: the green baseline and the `--json` family echo move 51 → 52 / 26 → 27; every
  drift arm that encodes the count moves one off the new number, so the two arms still
  fire one step away from the new count:
  - `MEMBER_MISSING`: skills/ loses a declared child → `6 children, 7 declared`, members 51
  - `UNLISTED`: skills/ gains an 8th child → `8 children, 7 declared`, members 53
  - the dropped-child fixture now removes `skills-lane-04` (7 declared children, so one
    removal leaves 6), and the extra-child fixture plants `skills-lane-07` (7 declared,
    so one extra makes 8)

Diff: `47 insertions(+), 42 deletions(-)`; file 957 → 962 lines.

## Measured results

```
$ node scripts/kimi-census.mjs
FAMILY K2  members=27  checked=27  frozen=27
INFO  COUNT  skills/  children=7 (counted live, names not gated)
TOTALS: members=52 checked=52 errors=0 info=4 chain=7
KIMI_CENSUS: CLEAN (members=52 checked=52 chain=7 info=4)
exit=0
```

```
$ node scripts/kimi-census.mjs --selftest
KIMI_CENSUS_SELFTEST: 48/48 pass
VERDICT: PASS
```

At open (before the edit) the same command printed
`KIMI_CENSUS: DRIFT (UNLISTED skills/)` with
`skills has 7 children, 6 declared — an undeclared child appeared`, exit 1.

## Mutation check (declared count only, live tree untouched)

Mutant A — the declared count reverted to 6; mutant B — the declared count set to 8:

```
$ node mut/kc-6.mjs
CENSUS  error  UNLISTED  skills/  skills has 7 children, 6 declared — an undeclared child appeared (names not gated)
KIMI_CENSUS: DRIFT (UNLISTED skills/) ; exit=1
$ node mut/kc-6.mjs --selftest   →  KIMI_CENSUS_SELFTEST: 30/48 pass ; VERDICT: FAIL
$ node mut/kc-8.mjs
CENSUS  error  MEMBER_MISSING  skills/  skills has 7 children, 8 declared — a declared child is gone (names not gated)
KIMI_CENSUS: DRIFT (MEMBER_MISSING skills/) ; exit=1
$ node mut/kc-8.mjs --selftest   →  KIMI_CENSUS_SELFTEST: 33/48 pass ; VERDICT: FAIL
```

Both mutants are **killed** by the live census and by the hermetic suite (the Stryker
vocabulary: at least one test failed while the mutant was active; a DRIFT verdict is a
kill, not a crash). The count is therefore load-bearing in both directions.

## How `proxy-check.mjs` derives `K_members` and `K_sections`

`scripts/proxy-check.mjs` re-derives the K block itself (the census exports no member
table), from `K_MEMBER_RULES` (proxy-check.mjs:497-533) plus the live kimi root.

- **`K_members`** = the live member-slot total. A counted dir contributes its LIVE
  non-hidden child count, so `skills/` contributes 7 (not a declared constant); `chain`
  is one member when any generation exists; shape-only members are lstat-kind only and
  never opened. Live value on this host: **52** (`K_members: declared=51 computed=52`
  at open — the drift the round-40 re-pin closes).
- **`K_sections`** = the number of DISTINCT K members named by the `## ` headings of
  `corpus/knowledge/kimi-*.md` notes. A heading names a member when one of its tokens
  equals that member's full path, or — when the token is not itself a member path — when
  its basename is owned by exactly ONE member (`kMembersNamedByHeading`,
  proxy-check.mjs:831-861). A basename shared by two members binds to nothing and
  raises `K_SECTION_AMBIGUOUS`. A member counts once however many sections name it.

I measured the rule on a scratch copy rather than reading it off the prose
(`proxy-check.mjs --src /fast/scratch/hyaku/kumitate-pin/src --json`, five probes):

| probe (heading added) | `K_sections` | `coverage_kimi` | warnings |
|---|---|---|---|
| none (open state) | 51 | 9 | 2 |
| `## `~/.kimi-code/skills/kimi-webbridge`` in `kimi-skills-plugins.md` | **52** | **10** | 2 |
| `### `~/.kimi-code/skills/kimi-webbridge`` (h3) | 51 | 9 | 2 |
| same heading in `corpus/lessons/round-39.md` (not a `kimi-*.md` note) | 51 | 9 | 2 |
| heading inside a fenced code block in a `kimi-*.md` note | 52 | 10 | 2 |
| `## `kimi-webbridge`` (bare basename) | 51 | 9 | **3** (`K_SECTION_AMBIGUOUS`) |

Three rules fall out of that table: only `## ` (h2) headings count; only files matching
`kimi-*.md` under `corpus/knowledge/` count; and the heading must carry the FULL member
path. The bare basename is now ambiguous, because `kimi-webbridge` is owned by two
members (`plugins/managed/kimi-webbridge` and `skills/kimi-webbridge`), so it binds to
neither and warns instead.

## What the SCORECARD stanza and the K2 note must carry

**The K2 note** — `corpus/knowledge/kimi-skills-plugins.md` — must gain one `## ` section
whose heading is the full path:

```
## `~/.kimi-code/skills/kimi-webbridge`
```

That single section is what lifts `K_sections` 51 → 52 and carries
`coverage_kimi` 9 → 10 (`floor(10 × 5/5 × 52/52)` = 10). The existing
`## `~/.kimi-code/plugins/managed/kimi-webbridge`` heading must stay as it is: it still
resolves by full path, and renaming it to the bare basename would create a second
ambiguity. The section body must be at internals level, sourced from the skill's own
files — `~/.kimi-code/skills/kimi-webbridge/SKILL.md` (19 437 B, mode 600) and
`references/` (`operations.md` 5 911 B, `cli-creator/` 5 files), never from the sibling
plugin tree.

**The SCORECARD stanza** (`kumitate-proxy-v1`) must carry four changes:

| key | base | must become |
|---|---|---|
| `K_members` | 51 | **52** |
| `K_sections` | 51 | **52** |
| `coverage_kimi` | 10 | 10 (unchanged — it re-derives to 10 once the two terms above land) |
| `pin.kimi-census` | `7818970b80d4951b8edf15dcc8c5a16efe57f457f956a5ce019f049068538156` | **`ded569fec9b67cfbc0982f3fb431453e44b322024db457e184a99d81376c3d08`** (the value after the header correction below; `529e6dd6…` was the pre-correction value and is superseded) |

Plus the K2 registry row (SCORECARD.md:144) — the `skills/` entry count in prose
(`5 skills/ entries`, `⇒ 26`) and the `## Axes` row for `coverage:kimi-layer`
(SCORECARD.md:317) must be re-pinned to the round-40 numbers. The K2 registry row's
4th cell stays `yes`, so `C1k`/`C1k_total` stay 5/5.

`K_sections` must reach 52 **by the real section**, not by editing the stanza: the proxy
recomputes `K_sections` from the notes and reports `K_SECTIONS_DRIFT` if the declared
number disagrees, so a stanza-only edit would be caught.

## New pin sha256

The live value — what the `pin.kimi-census` stanza key carries in the landed tree and
what the L1 integrated:

```
ded569fec9b67cfbc0982f3fb431453e44b322024db457e184a99d81376c3d08  scripts/kimi-census.mjs
```

The value my first patch produced was `529e6dd6…`. **That one is SUPERSEDED** — the
pre-correction hash, before I fixed the false "the other six are symlinks" clause in
the header (see the correction section below). The header fix changed the file, so the
file's sha changed with it and the pin moved from `529e6dd6…` to `ded569fe…`. Against
the un-edited base stanza the proxy reports the expected one-shot drift
(`PIN_DRIFT: declared=7818970b... computed=ded569fe...`), which the L1's SCORECARD edit
cleared.

## Risks and notes for the integrator

1. **The `## Axes` row for `coverage` (not `coverage:kimi-layer`) is still at 10 vs
   derived 9** — that one is the C2_total term (`declared=88 computed=89`), because
   `corpus/lessons/round-39-verifier-spotcheck.md` has no `corpus/README.md` map row at
   the base revision. The row IS present in the live lane working tree
   (`corpus/README.md` is modified, 89 rows) but not committed at `f69817e`. That is
   outside my seat; it clears when the L1 lands the README row and the `C2_total=89`
   stanza value. Both AXES_DRIFT rows are mine only in the kimi-layer half.
2. **The census line citations in `corpus/knowledge/kimi-residue-files.md` were ALREADY
   stale at the base revision** — they carry round-20 line numbers, and rounds 34 and 35
   each shifted the file without re-pinning that note (neither touched it). Exact
   mapping, measured by resolving each cited range against the actual file content:

   | note line | cited | the note claims it is | true anchor at `f69817e` | true anchor in the canonical |
   |---|---|---|---|---|
   | 10 | `:38-41` | the K5 member rules | `:38-41` ✔ correct | `:38-41` ✔ unchanged |
   | 11, 255 | `:130-132` | the three K5 member rows | `:135-137` | `:140-142` |
   | 11, 338 | `:145` | `FROZEN` | `:150` | `:155` |
   | 248 | `:97` | the census drift-chain regex | `:101` | `:106` |
   | 48 | `:32-41` | the K3/K4 planes | `:32-41` (also covers K5) | `:32-41` — unchanged |

   So my patch moves three of the five cited anchors by +5 (the K5 rows, `FROZEN`,
   `RE_CHAIN`); `:38-41` and `:32-41` are unmoved. `cite-check` cannot catch this class:
   it flags only a citation whose line range is OUT OF RANGE, not one that is in range
   but points at the wrong line. I verified both ways — pointing the citation at
   `:9900-9901` raises `LINE_OOR`; leaving it in range is silent. I did NOT edit that
   note: it is not my file, and the drift is pre-existing debt, not something my edit
   introduced. The L1 should re-pin those citations to `:140-142`, `:155` and `:106`
   in the same pass that lands the SCORECARD edit.
3. **No secret was read.** `mcp.json`, `server.token`, `credentials/` and `oauth/` were
   only lstat-ed by the gate; I opened no credential, token or oauth file. The census's
   own secrecy arms still pass (FIFO token → CLEAN, dangling symlink → CLEAN, canary
   inside `credentials/` never listed).
4. **Line-count drift.** My header edits add 5 lines above the code (957 → 962 total).
   I compacted the header deliberately to keep that delta small, but the residue-note
   citations in point 2 need re-pinning either way.
5. **A seventh census citation in the same note** (found by MutKimiCensusArms, confirmed
   by me): `corpus/knowledge/kimi-residue-files.md:48` cites
   `scripts/kimi-census.mjs:32-41` for the K3/K4 planes. The member-rules block is
   `:24-41` and K1–K4 are `:26-37`, so the cited range starts mid-K3 and also covers
   K5 — imprecise, but **unmoved by my patch** (the range is identical at base and in
   the canonical), so it is pre-existing imprecision rather than drift I introduced.
   The table in point 2 is the complete list of the note's eight census citations.
6. **Three census coverage gaps survive the re-pin** (MutKimiCensusArms' mutants M5/M6/M7,
   each independently reproduced by me on the canonical file — every one gives
   `48/48 pass`, `VERDICT: PASS`, i.e. all three SURVIVE):
   - **M5 — hidden children under a counted dir.** `listChildren` filters
     `n.startsWith('.')`, so a hidden child of `skills/` is invisible to the count.
     Mutating the filter to keep hidden names changes nothing observable.
   - **M6 — an unreadable counted dir.** `listChildren` returns `null` on failure and
     the code then treats it as zero children (`kids = listChildren(abs) ?? []`),
     so an unreadable `skills/` reads as "0 children" rather than a fail-closed or
     unreadable state. Mutating it to resolve as the declared count changes nothing.
   - **M7 — the counted-dir kind pin.** `if (kind !== 'dir')` on a counted member is
     never exercised by the hermetic suite; removing the check entirely still passes
     48/48.
   These are **pre-existing**, not introduced by my edit: I reproduced all three
   identically on the pristine base file at `f69817e` (48/48 PASS in each case). They
   are coverage gaps in the census, not in the re-pin, and they are open items for the
   L1 — I did not widen my scope to close them.
7. **Patch-file sha vs file sha — do not mix them.** The value the SCORECARD
   `pin.kimi-census` key must carry is the sha256 of the PATCHED
   `scripts/kimi-census.mjs` = `529e6dd6…`. The patch FILE's own sha256 is
   `1e6e3ace8a80fcae7a94e0cc4da0073bb2653ce8b43a4577bf3d3ef1c3e85d8c`; that one goes
   nowhere near the stanza.

## Reconciliation with the sibling candidate (MutKimiCensusArms)

The mutation-tester seat independently produced a candidate for the same file at
`/fast/scratch/hyaku/kumitate-r40/seats/MutKimiCensusArms/MutKimiCensusArms-repin-candidate.patch`
(sha `9612d0f01350e682db24f65d2bb93069c12d221e676ca24a497dd6ec355e7da4`). I verified it:
it applies clean to `f69817e`, and it yields `CLEAN (members=52 …)` and `48/48 pass`. Its
mechanical findings match mine exactly — including the `skills-lane-06` → `skills-lane-07`
rename (the planted extra child must not collide with the fixture's own seventh child,
or the selftest crashes with EEXIST) and the `6 of 7` / `8 of 7` arm expectations.

Two candidate patches for one file with two different sha256 values is an integration
hazard, so I reconciled them rather than leaving the choice open. The two patches are
**functionally identical** in every code path — every difference is in comments and
header prose:

| | their candidate | mine |
|---|---|---|
| code paths (member table, enumerable table, FROZEN, every selftest expectation) | identical | identical |
| `ROUND 40` header paragraph | absent | present |
| `FROZEN` doc comment (`rounds 19/20/35` → `19/20/35/40`) | stale | corrected |
| selftest baseline comment (`the frozen 51` → `the frozen 52`) | stale | corrected |
| header prose re-flow (line count) | line-neutral | +5 lines |

The **canonical patch I deliver** is their candidate PLUS my header/comment corrections —
byte-identical to the file I had already verified, sha
`529e6dd6e0d2e429e241c74091197138c4a8bbfd5964ffe846b6df8178076ef1`. I built it by
applying their patch to a fresh base clone and overlaying my edits, then diffing against
my own version (identical), then re-running the whole suite on the rebuilt canonical:

```
$ node scripts/kimi-census.mjs | tail -1
KIMI_CENSUS: CLEAN (members=52 checked=52 chain=7 info=4)
$ node scripts/kimi-census.mjs --selftest | tail -1
KIMI_CENSUS_SELFTEST: 48/48 pass
```

**For the L1: take `ExecKimiCensus.patch` (sha `529e6dd6…` at this stage) and NOT
the MutKimiCensusArms candidate.** The pin value `529e6dd6…` and the pin value
`9612d0f0…` correspond to two different file contents; the stanza's `pin.kimi-census`
must match whichever file is actually landed. Using the canonical keeps the ROUND 40
header paragraph that this item requires and fixes two stale comments; the two
candidates are otherwise interchangeable in behaviour.

> Superseded by the header correction further down: `529e6dd6…` is no longer the live
> value. The landed file is `ded569fe…`, and that is what the stanza now carries.

The canonical is +5 lines against the base (957 → 962). I compacted the header to hold
that delta down deliberately: the `ROUND 40` paragraph is the only addition, and the
`WHAT IT RE-DERIVES` prose was re-flowed rather than appended to.

### Two hash values, one destination — read this before pinning

The value the stanza's `pin.kimi-census` key must carry is the sha256 of the PATCHED
`scripts/kimi-census.mjs`:

```
ded569fec9b67cfbc0982f3fb431453e44b322024db457e184a99d81376c3d08  scripts/kimi-census.mjs
```

The patch FILE's own sha256 is `1e6e3ace8a80fcae7a94e0cc4da0073bb2653ce8b43a4577bf3d3ef1c3e85d8c`.
That one goes nowhere near the stanza — it is only the identity of the delivery
artefact. Two patched-file hashes are now superseded: `9612d0f0…` (the sibling's
candidate) and `529e6dd6…` (my pre-header-fix file). Neither is live; the landed
value is `ded569fe…`.

### The sibling's M5/M6/M7 arms — confirmed by me, and pre-existing

I reproduced all three independently on the canonical file; each gives
`48/48 pass` / `VERDICT: PASS`, so all three SURVIVE the suite. I then reproduced the
same three on the PRISTINE base file at `f69817e` — also `48/48 PASS` in each case.
They are therefore pre-existing coverage gaps in the census, not artefacts of the
re-pin, and they travel with it unchanged. Open items for the L1; I did not widen my
scope to close them.

### The sibling's extra citation — confirmed by me

`corpus/knowledge/kimi-residue-files.md:48` cites `scripts/kimi-census.mjs:32-41` for
the K3/K4 planes. The member-rules block is `:24-41` and K1–K4 are `:26-37`, so the
cited range starts mid-K3 and also covers K5 — imprecise, but **unmoved by my patch**
(identical at base and in the canonical), so it is pre-existing imprecision rather than
drift I introduced. My risk list carries the complete table of the note's eight census
citations with the verified anchor for each.

## Integration outcome (verified on the lane after the L1 landed it)

The L1 landed the canonical patch. At that moment the landed census file hashed
`529e6dd6…` and read CLEAN with 48/48; the header correction below then moved the file's
sha to `ded569fe…` (the final state, verified in the correction section).

The stanza now carries `K_members=52`, `K_sections=52`, `coverage_kimi=10` and
`pin.kimi-census` matching the landed file byte-for-byte (`529e6dd6…` at this snapshot,
`ded569fe…` after the header correction). The K2 note
section `## `~/.kimi-code/skills/kimi-webbridge`` landed at
`corpus/knowledge/kimi-skills-plugins.md:218`. Both AXES_DRIFT rows are gone (count of
`AXES_DRIFT` in the proxy output = 0), and `cite-check` reports 0 findings against
`kimi-census`.

The L1 also re-pinned the residue note's stale citations to exactly the anchors I
measured — `:140-142` (K5 rows), `:155` (`FROZEN`), `:106` (`RE_CHAIN`) — and added a
round-40 erratum at `kimi-residue-files.md:367`. My risk items 2 and 5 are therefore
closed.

I verified the re-pin by resolving each landed citation against the actual file content
in the landed tree:

```
:38-41   -> the K5 member rules (the round-20 root-residue family) …
:140-142 -> the three K5 member rows (workspaces.json / tui.toml.bak / rc-qrcode.png)
:155     -> const FROZEN = { K1: 4, K2: 27, K3: 9, K4: 9, K5: 3 };
:106     -> const RE_CHAIN = /^config\.toml(\..+)?\.bak$/;
```

Each now names precisely what the note claims. `:32-41` (note line 48) remains
imprecise — it spans K3, K4 and K5 rather than the K3/K4 planes the note names — but it
is unmoved by the re-pin and was equally imprecise at base, so it is pre-existing
wording, not drift.

The correction MutKimiCensusArms and I converged on: at `f69817e` the note's `:130-132`,
`:145` and `:97` were ALREADY off by 5, 5 and 4 lines respectively; only `:38-41` was
right at base. The canonical re-pin adds a further +5 to those three and breaks nothing
that was already correct.

**Two residuals remain, both the L1's, neither mine:**

1. `C2=88` / `C2_total=88` in the stanza must become **89 / 89**. Both sides now compute
   89 (89 README map rows, 89 corpus note files), so the README row has landed but the
   stanza value has not. Until it moves, the proxy reports
   `C2_DRIFT declared=88 computed=89` and `C2_TOTAL_DRIFT declared=88 computed=89`.
2. The `coverage:kimi-layer` Axes row (SCORECARD.md:317) still reads
   `floor(10 × 5/5 × 51/51)` in its evidence prose. The score cell (10) is right and
   the derived value is 10, so this raises no drift — but the prose should read
   `floor(10 × 5/5 × 52/52) = 10` to match the landed terms.

### I then landed both, as a second patch — `ExecKimiCensus-scorecard.patch`

Having measured the residuals and confirmed them independently (MutKimiCensusArms did
the same), I did not leave them outstanding. Second patch:
`/fast/scratch/hyaku/kumitate-r40/seats/ExecKimiCensus/ExecKimiCensus-scorecard.patch`
— SCORECARD.md only, four edits:

- stanza `C2=88` → `C2=89`, `C2_total=88` → `C2_total=89` (both sides now compute 89)
- the **K2 registry row** (SCORECARD.md:144) — `5 skills/ entries` → `7 skills/ entries`,
  the member total `(25)` → `(27)`, and the round-34 clause replaced by the round-40 one:
  "`skills/` counted live reads **7** (the new `kimi-webbridge` is a real directory, the
  other six symlinks) ⇒ **27** — counting rule unchanged, census tripwire re-pinned 6 → 7"
- the **`coverage:kimi-layer` Axes row** (SCORECARD.md:317) — prose
  `floor(10 × 5/5 × 51/51)` → `floor(10 × 5/5 × 52/52)`, a round-40 clause recording the
  seventh `skills/` child, the note heading that binds it, the census verdict, the
  selftest count and the full-path requirement (and why the bare basename is now
  ambiguous); last-change column `round 35` → `round 40`
- a new **round-40 `## Move log` row** in the lane's established five-column format

Apply-clean verified twice: against the base `f69817e` AND on top of the L1's in-flight
working-tree SCORECARD.md (`git apply --check` OK in both) — the L1's only SCORECARD edit
so far is the stanza block at lines 295-310, which does not overlap my hunks, so the two
compose without conflict.

**Combined end state, measured** (L1's working tree + my census patch + my SCORECARD
patch, in a fresh clone):

```
$ node scripts/proxy-check.mjs --src /fast/scratch/hyaku/kumitate-pin/src
PROXY: MATCH (A=8 C=15 operability=8; C1=19/19 C2=89/89 coverage=10; S=88/88
  coverage:script-layer=10; R=92/92 coverage:runtime-layer=10;
  K=52/52 coverage:kimi-layer=10; pins=6 match; src-rev=31c465f15669)
AXES_DRIFT rows: 0    cite-check findings against kimi-census: 0
```

The whole proxy is MATCH — every term, every axis row, all six pins.

### Correction I made after the L1's landing: a false claim in my own census header

The L1's K2 registry row reworded my clause to "the new `kimi-webbridge` and round 34's
`cursor-lane` are real directories, the other five are symlinks" — and they were right
to: **my census header said "the other six are symlinks", which is false.** Measured on
this host: `skills/` has 7 children = **5 symlinks** (`godspeed`,
`reverse-engineer-anything`, `shokunin`, `ufo`, `wwkd`) + **2 real directories**
(`cursor-lane` from round 34, `kimi-webbridge` from round 40). "The other six" counted
`cursor-lane` as a symlink.

I had carried the phrase from the round-34 clause, where it was correct (six children =
one real dir + five symlinks). The L1 corrected it in SCORECARD.md; my pinned census
file still carried the wrong words, so I fixed it.

The fix is **line-count neutral on purpose** — the re-pinned anchors `:106` (`RE_CHAIN`),
`:140-142` (the K5 rows) and `:155` (`FROZEN`) must not move again, and the note's
re-pin must stay valid. The header block was reflowed to the same 5 lines and the file
stays at 962 lines.

**This changes the census file's sha256**, so the pin changes with it:
`529e6dd6…` → **`ded569fec9b67cfbc0982f3fb431453e44b322024db457e184a99d81376c3d08`**.

Third patch — `ExecKimiCensus-l1-delta.patch` (32 lines, TWO hunks, TWO files) —
generated as a delta against the L1's **current** landed tree rather than against the
base, so it applies on top of what they already landed:

```
-pin.kimi-census=529e6dd6e0d2e429e241c74091197138c4a8bbfd5964ffe846b6df8178076ef1
+pin.kimi-census=ded569fec9b67cfbc0982f3fb431453e44b322024db457e184a99d81376c3d08
- * dir holding `SKILL.md` + `references/`; the other six are symlinks);
+ * dir with `SKILL.md` + `references/`; the other five are symlinks, and round
```

Apply-clean verified on the L1's tree, and the end state re-measured there — the same
MATCH line as the combined end state above, after the header correction moved the
file's sha and the pin with it, with `KIMI_CENSUS_SELFTEST: 48/48 pass`.

Anchors unchanged after the fix (`:106` RE_CHAIN, `:140-142` K5 rows, `:155` FROZEN),
file still 962 lines, and both count mutants still killed (`UNLISTED` at 6,
`MEMBER_MISSING` at 8).

## Delivery

Three patches, all in `/fast/scratch/hyaku/kumitate-r40/seats/ExecKimiCensus/`:

| patch | scope | applies to | notes |
|---|---|---|---|
| `ExecKimiCensus.patch` | `scripts/kimi-census.mjs` | base `f69817e` | the tripwire re-pin; superseded in full by the two below once the L1 had landed them |
| `ExecKimiCensus-scorecard.patch` | `SCORECARD.md` | base `f69817e` | the C2 stanza, the K2 registry row, the Axes row, the move-log row; the L1 landed this |
| **`ExecKimiCensus-l1-delta.patch`** | `scripts/kimi-census.mjs` + `SCORECARD.md` | **the L1's current landed tree** | **32 lines, two hunks: the false-claim header fix and the pin re-pin to `ded569fe…`** |

The third patch is the one to apply now. The first two are kept for the audit trail
(they show what changed against the base revision) and are already reflected in the
landed tree.

**The sha256 of the PATCHED `scripts/kimi-census.mjs` is
`ded569fec9b67cfbc0982f3fb431453e44b322024db457e184a99d81376c3d08`**, and that is what
the stanza's `pin.kimi-census` must carry. The patch FILE's own sha256 is a different
number and goes nowhere near the stanza.

The first two patches were produced with
`git -C <clone> diff f69817edf687c8ce4f87ed7953a353399232f69e -- <path>`; the third is a
delta against the L1's landed tree.

Apply-clean verified on a fresh clone of the lane checked out at the base revision
(`git apply --check` OK for the census patch and for the SCORECARD patch, and for the
delta patch on top of the L1's landed tree); the census and selftest verdicts above are
the ones that clone produced.

Note on lane writes: the contract says the report file is the only thing I may write
INSIDE the lane, and that is what I did — both patches were authored in my own scratch
clone and delivered as files for the L1 to integrate. The lane's working tree was not
written by me.

I wrote no file inside the lane other than this report. I did not touch the lane git
index, any jj state, the fleet repo, sibling lanes, operator config or host state; I ran
no `jj` command; I committed nothing and pushed nothing.

## Tooling

No tool was installed or upgraded for this seat — `node` (already present) and `git`
were sufficient, so the pacman guard was never engaged.

## Files changed

- `scripts/kimi-census.mjs` (the tripwire re-pin, 47 insertions / 42 deletions)
- `SCORECARD.md` (four edits: the C2/C2_total stanza values, the K2 registry row, the
  `coverage:kimi-layer` Axes row, and a round-40 `## Move log` row)

## Blocks

None. The census side of claim C2 is complete and self-verifying. The remaining work for
C2 is the K2 note section and the SCORECARD stanza, both owned by the L1 / the note
scribe, and both specified exactly above.
