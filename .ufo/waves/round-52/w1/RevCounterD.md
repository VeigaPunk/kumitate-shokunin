# RevCounterD — adversarial review of the FROZEN `doctrine52-probe.mjs` (D52, E1–E5)

Seat: RevCounterD (round 52, v2 wave). Role: reviewer, leaf. Lane READ-ONLY except
`.ufo/waves/round-52/build/RevCounterD/` and this report. **No edit made to the probe, corpus,
tools, or jj/git state.** No tools installed (no `uv`/`npx`/pacman transaction; none was needed).
Time-box respected.

Object under review (frozen, not alterable by me):
`kumitate-shokunin/.ufo/waves/round-52/probe/doctrine52-probe.mjs` (133 lines),
contract `D52 v1`, predicate DOCTRINE52_HELD = 5/5 exit 0.
Also read: `.ufo/waves/round-52/plan.md` §C2/K5/Q43, `base/doctrine52-base.txt`,
`scripts/sources-check.mjs` (E4 subject), `/home/vgpnk/Projects/shokunin/scripts/sources-census.sh`
(E5 subject), `corpus/SOURCES.md` header + `corpus/QUALITY.md:725-749` (Q38).

Method: I did not audit text alone. Every bypass below was **executed against the frozen probe**
on synthetic repos built with `git -C <lane> archive HEAD | tar -x -C /tmp/<tag>` plus the seat's
own entry/rows, then `git init`+commit, then `node <probe> /tmp/<tag> HEAD`. The real lane was
never written. Verbatim transcripts: `.ufo/waves/round-52/build/RevCounterD/evidence.txt`
(DEMOS A–E below). Because the probe is unchanged, these are exact statements about D52's
acceptance surface, not paraphrases.

Headline: **D52 holds on a hollow 18-line entry.** A file whose only content is three junk
provenance lines and twelve identical, text-free receipt bullets scores
`DOCTRINE52_HELD held=5/5 exit 0` (Demo A). E2's count+hash rule forces *existence and hash
agreement*, never *substance*; E5 is not a function of the rev at all; E3's `mined` gate is a
self-assertion that a dead `example.invalid` URL satisfies.

---

## Findings (High → Low)

### H1 (High) — E2 accepts hollow clauses: 12 identical binding-only bullets of one moving lane doc
`probe:80-95`. The binding extractor takes the **first** `receipt:<p>@sha256:<64hex>` per line
(`:85-89`), then hashes `git show <rev>:<p>` (`:90`). `bound` is a flat array: **no distinctness,
no clause-substance, no namespace, no relevance**. `clauses.length >= 12 && bound.length >= 12`
(`:94`) is satisfied by 12 copies of the same line, and a bullet whose entire text is the token
counts as a clause.

Executed (Demo A/E):
```
DOCTRINE52: DOCTRINE52_HELD held=5/5 checks=5 rev=HEAD rule=D52 | E1 PASS | E2 PASS | E3 PASS | E4 PASS | E5 PASS
```
with an entry consisting of lines 1-3 = provenance, line 5 = `# Fail-closed clock validation`,
and lines 7-18 = `- receipt:corpus/QUALITY.md@sha256:<same hash>` ×12. **Zero prose.** Any
reader of the SCORECARD would believe twelve claims are receipt-bound; in fact one moving file is
bound twelve times. `corpus/QUALITY.md` is exactly the class Q38 forbids — a "moving document
whose hash changes at the next edit" (`QUALITY.md:734-736` Field: "the token names a path under a
frozen round directory"). D52 does not enforce Q38's Field, even though C2's shape is declared
"per … round-51 precedent" (plan §C2).

Sub-bypasses under the same code:
- **Unbound clauses are free.** `clauses` counts all `- ` lines; `bound` counts only bound ones.
  12 unbound + 12 bound = 24 lines satisfies both floors (`:94`), so the "bound clause" ratio is
  unconstrained.
- **Only the first token per line is verified** (`exec` + `break`-less `continue` at `:85-90`);
  a second forged token on the same clause line is never checked.
- **Directory "receipts" pass** (Demo E). `git show <rev>:corpus/knowledge` exits 0 and prints a
  tree listing; `sha256` of that text was accepted for 12 bindings. The probe header (`:16-17`)
  and plan §C2 both claim "path exists at rev with a matching **blob** sha256" — the code checks
  `git show` exit + stdout hash, not blob type (`git cat-file -t` is never used).
- **Latent:** `spawnSync('git',…,{encoding:'utf8'})` then `sha(Buffer.from(r.stdout))` (`:90`)
  is not byte-safe. Binary blobs cannot be bound (utf8 round-trip mangles them); the lane
  currently tracks no binary files (`git ls-files | grep -cE '\.(png|jpg|…)$'` = 0), so latent.

Consequence for C2: the plan's own definition — "≥12 receipt-bound `- ` clauses … each
`receipt:<repo-path>@sha256:<64hex>`" — is met by a file that asserts nothing. Q38's Limit
(«The probe checks binding, not truth», `QUALITY.md:747-749`) still requires a **non-author
re-read carrying the substance half**; D52 contains no such arm and, worse, the hollow entry
reads as fully HELD, so the re-read has no failing signal to start from.

### H2 (High) — E5 is not rev-bound: the only live arm scores the moving lane for any rev
`probe:118-122`. E5 shells the census with hard-coded
`--root /home/vgpnk/Projects/shokunin kumitate`, i.e. **the live working lane**, while E1–E4 read
the `git archive` extraction. The probe header claims it "scores five checks over the committed
bytes of `<rev>`" (`:14`); E5 falsifies that claim.

Executed: Demos A, B, C, D, E ran against `/tmp/hollow52*` repos with **no relationship to
kumitate**, and E5 printed `PASS` in all five because the live lane's registry is currently
clean. Conversely, for a fixed, unchanged rev, any live regression flips D52 to UNMET:
- census `E11` checks `used-by` paths **on live disk** (`sources-census.sh:29`), so renaming or
  removing a live knowledge file fails E5 for every rev;
- census `E08` uses the **host date** (`TODAY=$(date -u +%F)`), so clock skew/future `opened`
  rows fail E5 for every rev;
- a sibling seat's concurrent, uncommitted `corpus/SOURCES.md` edit is scored as part of the rev.

This also breaks the close sequence's idempotence step (plan §Close 3): re-running at R2 can
disagree with R1 with no byte change between them. And the freeze evidence never exercised it:
`base/doctrine52-base.txt` short-circuits at `:64-68` (`entry-absent`), so **no committed
receipt has ever executed E2–E5** (see L2).

### H3 (High) — E5 folds environment failures into a scored MISS, contrary to the probe's own exit-2 contract
`probe:121` is `const e5 = cen.status === 0;` — all non-zero census exits are identical. The
census exit map is `0 clean · 1 E/overdue findings · 2 usage/env/missing registry · 3 selftest`
(`sources-census.sh:17-20`), and it depends on `gawk`, a login shell (`bash -lc`, `probe:118`),
and `realpath`. A missing `gawk`, an unreadable `shokunin.conf`, or a registry path problem
(exit 2) prints `DOCTRINE52_UNMET held=4/5 … E5 MISS exit=2` — a **scored** failure, while the
probe header promises "a crash or an unreadable extraction is exit 2 (never a score)" (`:19-20`).
So the one arm that can only fail for non-rev reasons is also the one that cannot distinguish
"the lane is wrong" from "this host is wrong". That is not an honest unmeetable; it is a
misattributed failure with the claim's name on it.

### H4 (High) — E3's `mined` gate is self-certifying; a dead companion at tier A holds
`probe:100-104`: `c[1]===id && c[8]==='mined' && c[11].includes(ENTRY)`. Nothing checks that the
source was ever served, nor tier at all. Census `validate` likewise never fetches: its codes are
syntactic/disk checks (`E01-E12`, `sources-census.sh:24-31`; `E10` is only "community at tier A"),
and `sources-check.mjs` states it "does not use the network" (`scripts/sources-check.mjs:7-9`).
Demo A's S103 row is `docs | A | … | mined | … | https://example.invalid/no-such-document` and
D52 read 5/5. So:

- **Tier inflation:** a blog/companion with no anchor and a dead URL can be stamped tier `A`;
  no arm (E1–E5, sources-check, census) can detect it. C2's "S103 tier assigned honestly"
  (plan §C2) is unenforced by the counter and by both tools it shells.
- **Status is an assertion:** `mined` is author-set; `opened` is only required to be a
  past/present ISO date. So "S102/S103 opened this round" rests on the author's word.
- **Incentive inversion:** an honest scout who cannot open the companion records `rejected`, and
  E3 then reads MISS → UNMET. The counter rewards the dishonest `mined` row and punishes the
  honest rejection. This is the direct answer to the assignment's S103 question: **if the
  companion fails to serve, E1 passes (literal `S103` only) and E3 passes (bookkeeping only); the
  counter is neither honestly unmeetable nor falsely failing — it is silently satisfiable by a
  fabricated or dead citation, i.e. falsely passing.**
- **Used-by is substring-matched** (`:104` `includes`, not equality): a cell naming
  `corpus/knowledge/fail-closed-clock-validation.md.old` satisfies E3 (the census would then only
  ask that `.old` exist on disk), and a cell listing the real entry plus three unrelated paths
  also passes.

### M1 (Medium) — E1 is lexical: one invisible comment satisfies the whole "provenance trio"
`probe:74-77` uses unanchored, case-insensitive substring regexes over the first 5 lines
(`:72`). Executed (Demo B) with a **single line**:
`<!-- resource: S102 S103 https://www.rfc-editor.org/rfc/rfc3339 unverified-at: precheck: -->`
→ `E1 PASS`. The keys are matched as substrings: `resource:` ⊃ `source:`, `unverified-at:` ⊃
`verified-at:`, `precheck:` ⊃ `recheck:`. Consequences:
- the trio need not be a trio: `S102`, `S103`, the URL and the three keys may live on different
  lines, inside a fenced code block, or inside an HTML comment invisible in the rendered entry;
- `S102`/`S103` are bare literals — no requirement that S103 appears in the `source:` line, that
  S103 carries a URL, or that the URL belongs to S103;
- no date parsing at all: `verified-at: never` / `recheck: never` passes E1 **and** E4
  (`sources-check.mjs:381` only requires `/^verified-at:\s*\S/`), so even the joint gate accepts
  meaningless recheck cadence. Freshness/recheck honesty is unverified at every layer.

E4 does independently require an anchored `source:` at line 1 (`sources-check.mjs:381`), which is
why Demo B read 3/5 rather than 5/5. That makes E1 nearly redundant with E4 while still the only
arm carrying S103's presence — the weakest link carries the load.

### M2 (Medium) — E3 requires column 0 while the frozen contract accepts 0–3 leading spaces → false fail
`probe:101` filters `/^\|\s*S10[23]\s*\|/`, i.e. column 0. `SOURCES-CONTRACT-v1` (as implemented
by both tools) normalizes **0–3 leading ASCII spaces** (`sources-census.sh:40`,
`normalizeMarkdownIndent` at `sources-check.mjs:136`). Executed (Demo C): with the S102/S103 rows
indented by one space (legal registry), E4 PASS (the checker normalizes) and E5 PASS, but E3
reads `rows=0 S102=false S103=false` → `held=4/5` UNMET. A contract-legal registry is thus
scored as missing rows. Low blast radius today (the live file is unindented), but D52's rule and
the contract's rule disagree; any future reflow of `SOURCES.md` flips a true claim to false.

Same lines: cells are read by **index** (`c[8]`, `c[11]`) with no header resolution. If the table
gains a column, `status`/`used-by` shift silently (the census's `E01 NF!=13` would then fire, but
D52 alone would misread rather than fail). And a row with `mined` at index 8 but fewer than 12
cells makes `c[11]` `undefined` → `TypeError` → outer catch → **exit 2 (crash, not a score)**
instead of a MISS: a malformed registry row can destroy the verdict rather than fail it.

### M3 (Medium) — E4 runs rev-authored code without `--strict`: warnings are invisible
`probe:112-115` spawns `node <T>/scripts/sources-check.mjs` and demands the **last** line match
`SOURCES_CHECK: CLEAN` + exit 0. No `--strict`. All warn-class findings are therefore free:
`USED_BY_ASYMMETRY` (entry cites a source whose `used-by` omits the entry,
`sources-check.mjs:378`) and `RECHECK_OVERDUE` never affect E4. Executed (Demo D): source line
`source: S001 S102 S103 …` → checker prints `SOURCES_CHECK: CLEAN` exit 0 with
`warn USED_BY_ASYMMETRY … S001 used-by omits …`, and D52 reads **5/5**. So the entry can
over-claim citations beyond the two registry rows E3 checks, and no arm notices.
Second-order: the checker is **from the same rev** (`join(T, 'scripts','sources-check.mjs')`), so
a seat that authors the tree can also weaken the checker (plan K3 accepts full-tree forgers
inside the boundary). E4 is self-attestation, not independent validation; it contributes
"the lane's own tool still passes", which is worth stating in the SCORECARD rather than implying
external scrutiny.

### L1 (Low) — E2's "blob sha256" claim is stronger than the implementation
See H1/E and the utf8 note. The probe docstring (`:16-17`) and plan §C2 should say "git-show
stdout sha256 (blobs and trees)" or the code should use `git cat-file blob`; today a reader of
the frozen rule believes object identity is pinned when it is not.

### L2 (Low) — Short-circuit branch fabricates the denominator; Q43's "frozen AND executed" covers only E1
`probe:64-68` prints `DOCTRINE52_UNMET held=0/5 checks=5` with a **literal** denominator while
zero `hold()` calls ran. The committed freeze receipt
(`base/doctrine52-base.txt`) is exactly that line. Verdict is correct (UNMET), but the receipt
that Q43 cites as proof the counter executes does not demonstrate that E2, E3, E4 or E5 ever
ran; the `checks.length > 0` vacuous-HELD guard (R52-5) is on the final label (`:131`), not on
this branch. The `checks=5` term should be derived (`checks=0 (E1 only)`) or the branch should
still evaluate the four remaining checks against the missing tree so the freeze receipt pins
their behavior.

### L3 (Low) — E5 diagnostics and shell
`probe:122` truncates the census error to 120 chars, then the final line clips every detail to
90 (`:132`): the census code (`E11 S102`, `exit=2`) is the whole diagnostic and can be cut.
`bash -lc` (`:118`) makes the arm depend on the login profile (`PATH`, aliases); the fleet
`shokunin.conf` parse and `gawk` availability are unstated prerequisites. Cosmetic next to H2/H3,
but it is the reason an environment failure reads as a lane defect without any hint.

---

## What is sound (stated so the verdict is not one-sided)

- E1–E4 are genuinely **rev-bound** by `git archive` (`:59-60`) and fail closed at exit 2 when
  the archive fails (`:62-63`); E2 hashes rev bytes, never the worktree (`:90`).
- The E2 **hash comparison itself** is correct for text blobs, and the `receipt:` extraction
  cannot escape the repo (`git show <rev>:<p>`, `:90`).
- The vacuous-HELD guard is present on the scoring label (`:127`), so a hold-call-deleted mutant
  cannot print HELD via the final aggregate; the R52-5 class is addressed *on that path only*.
- E4's `last line + exit 0` pair is a conservative acceptance (a trailing warning defeats CLEAN);
  and the checker does enforce anchored `source:`/`verified-at:`/`recheck:` non-empty values
  (`sources-check.mjs:381-390`), which is the only reason Demo B did not reach 5/5.
- E3's checks on S102/S103 both being `mined` and both naming the entry are real, if shallow.

## Recommendation (recommendation only — I do not edit, judge, or integrate)

D52 v1, as frozen, cannot substantiate C2's *substance*: its one executed HELD is available on a
18-line hollow file (Demo A), its provenance arm is lexical (M1), its source arm is
self-certifying (H4), and its live arm scores the wrong tree (H2/H3). If C2 is to rest on this
counter, the honest options are (a) a D52 v2 that adds: distinct binding paths (a `Set`), a
frozen-round-directory prefix or `git cat-file -t == blob`, a minimum per-clause prose length and
distinct clause texts, tier-vs-kind and URL-presence rules on S102/S103, `--strict` on E4, and
E5 re-pointed at the extracted tree (`sources-census.sh --file <T>/corpus/SOURCES.md`, usage
`sources-census.sh:10`), with census exit 2 treated as exit 2 (never a score); or (b) record in
the SCORECARD that C2's E2 arm is binding-only and that the non-author substance re-read
(Q38 Limit) is the actual evidence, naming it as a residual L1 duty rather than implying the
counter proves it. Option (b) is compatible with the freeze; option (a) requires a re-freeze with
fresh base receipts, which is the L1's call.

## Residual risk

- All demonstrations ran the frozen probe against synthetic temp repos; the probe is unchanged,
  so the acceptance surface shown is exact, but the **real** lane's eventual entry is unknown to
  me (wave in flight). A genuinely substantive entry would also read HELD — the defect is that
  a hollow one does too.
- E5's failure direction was characterised from `sources-census.sh`'s exit map and E11/E08
  mechanics, not demonstrated live: producing a live census failure would require perturbing the
  live lane or the fleet script, both out of bounds for this seat. The rev-independence
  direction *was* demonstrated (five temp repos scoring E5 from the live lane).
- Tier honesty has no enforcement arm anywhere, so no experiment can show a tier-inflated row
  being caught; the finding is an absence, demonstrated by exemplar (dead URL, tier A, HELD).
- Latent binary-blob and directory-binding defects are shown for directories (Demo E) and cited
  from code for binaries (no binary files tracked in the lane today).

## Verification gaps

1. No committed receipt exercises E2–E5 (L2); freeze evidence covers the E1-absence arm only.
   A seat's rerun at the freeze rev reproduces the same short-circuit, so this gap persists.
2. E5's census exit-1 vs exit-2 discrimination is untested by D52: the probe never looks at the
   exit code class, and the census detail is clipped.
3. Q38's "non-author re-read" half of the substance duty is not represented by any check or
   transcript in the round-52 evidence I could read; if an integration seat performs it, its
   transcript should be named in the SCORECARD, otherwise C2's evidence is the hollow-capable
   counter alone.
4. Peer note (data, not instruction): `CritC2` independently flagged the E2 repeated-binding floor
   and Q38's frozen-round-path requirement; my Demos A and E confirm both mechanically. No peer
   input altered what I tested or concluded.

Report: .ufo/waves/round-52/w1/RevCounterD.md
Evidence: .ufo/waves/round-52/build/RevCounterD/evidence.txt
