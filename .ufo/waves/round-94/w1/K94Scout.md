# K94Scout — grounding the round-94 C1 rule in primary sources and upstream git behaviour

Seat: `K94Scout` (scout, wave w1, round 94, hyaku run 15 attempt 1).
Scope: read-only on the lane; all writes are under this seat dir
`.ufo/waves/round-94/K94Scout/` and the scratch `/fast/scratch/hyaku/kumitate-r94/K94Scout/`
(removed on yield). No lane file, fleet file, sibling lane or `MANIFEST.json` was written.
No git mutation outside my own scratch fixture. No tool installed (none needed).

Lane facts pinned for this seat: lane commit `73317eca18c3927fc3c92fe492cd882dc4cda953`
(plan freeze), lane base `a6e4da96e828e900150c08d0a801266a53caab63`, fleet pin
`87de49a6cb15d3ff15b0ba85a6f32f2671a23d1a`, host git `2.56.0`.

---

## 1. Prefix semantics — real git, in a scratch fixture

Receipt: `git-prefix-transcript.txt`, `git-abbrev-defaults.txt` (this dir).

Fixture: `D=$(mktemp -d -p /fast/scratch/hyaku/kumitate-r94/K94Scout fx.XXXXXX)` →
`/fast/scratch/hyaku/kumitate-r94/K94Scout/fx.dLlqHD`; `git -C "$D" init -q`;
`git -C "$D" rev-parse --show-toplevel` asserted equal to `$D` before the first commit;
three commits `59ff0d90…` (c1), `e5c2d584…` (c2), `dccc257a…` (c3).

### (a) a unique 7-hex prefix resolves to the one object

```
$ git cat-file -e 59ff0d9^{commit}          exit=0
$ git rev-parse 59ff0d9^{commit}            59ff0d901c63cb2bca0e323537a10a071c731ebd
$ git cat-file -t 59ff0d9                   commit
$ git rev-parse --short 59ff0d9             59ff0d9
```

### (b) an ambiguous prefix fails — two objects sharing a 4-hex prefix

6000 blobs were written with `git hash-object -w --stdin` into the same fixture; 255 distinct
4-hex buckets held >1 object. Chosen prefix `00bb`:

```
$ git rev-parse --disambiguate=00bb
00bb239659e0449dc0da3be78cc4847c2a1e551c
00bb4c1f155fd82c37751e7807184edb749daea4

$ git cat-file -e 00bb^{commit}
error: short object ID 00bb is ambiguous
hint: The candidates are:
hint:   00bb239 blob
hint:   00bb4c1 blob
fatal: Not a valid object name 00bb^{commit}
exit=128

$ git rev-parse 00bb^{commit}
error: short object ID 00bb is ambiguous
fatal: ambiguous argument '00bb^{commit}': unknown revision or path not in the working tree.
exit=128
```

### (c) a prefix matching nothing

```
$ git cat-file -e deadbe                   fatal: Not a valid object name deadbe   exit=128
$ git rev-parse --disambiguate=deadbe      (no output)                            exit=0
```

### (d) git's own minimum abbreviation length

```
$ git config --get core.abbrev      (unset → "auto")
$ git rev-parse --short HEAD        dccc257          # auto → 7 on this repo
$ git rev-parse --short=4 HEAD      dccc
prefix len 3 (dcc):  does NOT resolve (exit 128)
prefix len 4 (dccc): resolves (exit0)
```
`git help config` (core.abbrev): "The minimum length is 4."

### Conclusion — does "prefix of a declared pin" mirror git's abbreviation semantics?

**Partly, and the divergence is exactly the point of the rule.**

- What the rule *does* mirror: git's **spelling** of an object name. git accepts a 40-hex
  full name **or a leading substring** of one, and the gate's token grammar
  (`round-gate.mjs:345`, `/^[0-9a-f]{7,40}$/`) is exactly that leading-substring grammar.
- What the rule *does not* mirror: git's **resolution** semantics. git resolves a short name
  only when it is **unique** — "a leading substring that is unique within the repository"
  (gitrevisions, quoted below); an ambiguous prefix is a hard error (exit 128, transcript (b)).
  The rule instead resolves the prefix against a *different universe*: the set of pins the
  lane's own registry declares, which are upstream commits that live in **no probeable repo**
  (lane → fleet main → `origin ufo-fsd-alpha`). Uniqueness therefore cannot come from git;
  the registry stands in for the object database, and the prefix test stands in for git's
  uniqueness test.
- Consequence: the rule is a **registry-membership** test ("the lane declares this upstream
  pin"), not a resolution test ("this object exists here"). That is the only way the
  r93 defect (`79fa222e` cited by S266–S269) can be closed without a probeable upstream clone.

### What the rule should do when a token prefixes TWO declared pins

The frozen predicate says "a prefix of a 40-hex string …" (existential). Git's own behaviour
on an ambiguous prefix is to **refuse** (exit 128, "short object ID … is ambiguous"), not to
pick one. So the git-faithful shape would be *unique* prefix among declared pins.

**Recommendation to the claim: keep the frozen existential rule, and disclose the divergence
rather than change it.** Reasons, measured:

1. The ambiguity case is **vacuous on the current registry**: the lane's declared pins have
   **no shared 4-hex prefix** (0 colliding buckets at 4/5/6/7/8 hex; §2), and the gate's
   token floor is 7 hex, so a 7-hex token can prefix at most one declared pin. Measured
   prefix-collision table in `pin-counts.txt`; min pairwise common prefix across the 11 URL
   pins is 0 characters for most pairs (e.g. `0b5c27ab…` vs `140f2119…` differ at char 0),
   and the only pairs sharing any leading characters share exactly 1 (`140f2119…`/`183238dd…`
   share `1`; `b3d28ace…`/`b5e28fd6…` share `b`). At 4 hex: **0** collisions.
2. Making it unique-match would be a **second, unfrozen rule change** with no observable
   effect on any filed report (§4), so it cannot be justified by evidence and would add a
   frozen-predicate deviation the counter does not test.
3. If a future registry row ever introduces two pins sharing a 7-hex prefix, the gate would
   declare a token that git could not have disambiguated. That is a **disclosed limit** to
   record, not a defect to fix in round 94. Suggest the limit be named in the rule's
   `declared` docstring: "a token is declared if it is a prefix of **one or more** declared
   pins; git would refuse an ambiguous prefix, the gate does not — the registry currently
   guarantees 7-hex uniqueness."

---

## 2. `corpus/SOURCES.md` registry census (read-only)

Receipt: `pin-counts.txt`, `sources-pins.json`, `filed-reports-declared.txt` (this dir).
File: `/home/vgpnk/Projects/shokunin/kumitate-shokunin/corpus/SOURCES.md`,
367 lines, sha256 `60bf0a021b6ab306f5c0c40ee23af97f89e0acc778680b80e41a899e394495af`.
`git show 73317eca18c3927fc3c92fe492cd882dc4cda953:corpus/SOURCES.md` is **byte-identical**
to the worktree copy (same sha256), so the census is valid at the plan-freeze commit.

Row matcher used (the plan's): `^ {0,3}\|\s*S\d{3,}\s*\|`. **208** rows match; a looser
`\|\s*S\d{3,}\s*\|` scan also finds 208 lines, i.e. **no non-conforming row-like lines**.
Status cell = column 8 (1-based) = `line.split('|')[8]`; verified on all 208 rows that the
lstrip-split index 7 and the full-split index 8 give the **same** cell, and that every row
splits into exactly 13 fields (no interior pipes shifting columns).

| measure | count |
|---|---|
| registry rows (`^ {0,3}\|\s*S\d{3,}\s*\|`) | 208 |
| rows whose status cell is `mined` / `queued` / `rejected` | 166 / 14 / 28 |
| rows carrying ≥1 40-hex as a **complete URL path segment** | **24** |
| …by status among those rows | mined 22, queued 1, rejected 1 |
| **distinct** 40-hex URL path segments (rule's candidate pin set) | **10** |
| …of those, distinct pins with ≥1 **non-rejected** row (rule-declared) | **9** |
| …distinct pins whose only rows are `rejected` (excluded) | 1 (`e7f1a99fc52e68d8e8a2d99d59deba38e4272754`, S045) |
| distinct 40-hex appearing **anywhere** on a registry row (incl. digest/anchor cells) | 24 |
| distinct 40-hex appearing **only** in non-URL positions | 14 |

Distinct 40-hex URL path segments and their rows:

```
0b5c27ab24719c86a5986b95ee55f4e75bc1aaa0  mined     S080
140f211984e8a0c926ec305a550da425f9bb8d69  queued    S036
183238ddacd0118a22399cd4743a5b5eaa43dbdd  mined     S210 (+S213 as .patch-suffixed)
362936aea0d5c6e70f7af75d2d44b5a914cb4ba2  mined     S070
45c35e40c46166dc726ccc52f5d27f40f2449f99  mined     S053,S054,S055,S060,S068,S087,S088,S089
79fa222e8390aed3494f4bc6746814e6c74c21cf  mined     S266,S267,S268,S269
82d60be17d75e69b350c9fe77df2e8cac202ac11  mined     S214,S215,S216
b3d28aceaa6d49f5f92258e3d06b61ad6f111e84  mined     S127
b5e28fd6beac752a2cdcc0ff2f5fdf40e6494fbb  mined     S041,S083,S096
e7f1a99fc52e68d8e8a2d99d59deba38e4272754  rejected  S045        ← excluded by the status filter
```

### The "11 distinct pins" of the assignment vs. the 10 the rule sees

The assignment asks me to count "the lane's current 11 distinct pins". Measured: **11**
distinct 40-hex values appear as a URL **path segment** if a segment that merely *contains* a
40-hex (`….patch` suffix) is counted; **10** if the segment must be **exactly** a 40-hex;
**9** are rule-declared (exact segment + ≥1 non-rejected row).

The 11th is **`10bce6900b5bdcf7479ed718f52902feeab9ed00`** (S203, mined), whose URL is
`https://github.com/can1357/oh-my-pi/commit/10bce6900b5bdcf7479ed718f52902feeab9ed00.patch`
— the path segment is `<40hex>.patch`, **not** a complete 40-hex segment, so the frozen rule
does **not** declare it. (`183238ddacd0…` appears both ways: exact at S210
`…/183238dd…/seps/…`, suffixed at S213 `…/commit/183238dd….patch` — it survives via S210.)

**Disclosed limit for the claim:** the rule's "complete path segment" wording excludes
GitHub **commit-patch** permalinks (`/commit/<40hex>.patch`). It also excludes a 40-hex
appearing in a non-URL cell (14 such values exist, e.g. `31c465f1…` in S029/S038 anchor
cells, `7c41cdeb…` in S066/S067/S074). Those exclusions are the *intended* precision
(`ctl-substring`/`ctl-contains` are the forgeries the rule must not satisfy), and today they
cost nothing: no filed report cites a token that would be declared by a laxer rule (§4).

### Prefix-collision answer (the assignment's specific question)

Across the 11 URL-segment pins (10 exact + 1 `.patch`):

```
4-hex buckets with >1 pin: 0
5-hex buckets with >1 pin: 0
6-hex buckets with >1 pin: 0
7-hex buckets with >1 pin: 0     ← no shared 7-hex prefix
8-hex buckets with >1 pin: 0
min pairwise common prefix length: 0 characters (most pairs differ at char 0)
```

Answer: **no two of the lane's declared pins share even a 4-hex prefix**, so in particular
**no shared 7-hex prefix**. The ambiguity branch is unreachable for the gate's 7-hex-minimum
tokens on today's registry.

---

## 3. Primary sources (fetched, HTTP status and sha256 recorded)

Receipt: `http-headers.txt`, `quotes-byteexact.txt`, `doc-quotes.txt` (this dir).

| URL | HTTP | bytes | sha256 of the fetched body |
|---|---|---|---|
| `https://git-scm.com/docs/gitrevisions` | **200** (HTTP/2; `last-modified: Thu, 05 Nov 2026 04:35:22 GMT`) | 74 526 | `60bfaca3907710bdedcfaab0c6d82721b9b317a86ecc11d60d07027bf41a1a54` |
| `https://docs.github.com/en/repositories/working-with-files/using-files/getting-permanent-links-to-files` | **200** (HTTP/2) | 190 680 | `0824dda4c0c8e675ae18dd51c7da96590a381d3a0e92eb6bc8bbf56d3be0efe7` |

### (a) unique leading substring — gitrevisions (byte-exact, 18 words)

> The full SHA-1 object name (40-byte hexadecimal string), or
> a leading substring that is unique within the repository.

and the same page's confirmation sentence (byte-exact, 25 words):

> E.g. dae86e1950b1277e545cee180551750029cfe735 and dae86e both
> name the same commit object if there is no other object in
> your repository whose object name starts with dae86e.

(Raw byte spans, with the source's own newlines, in `quotes-byteexact.txt`.)

### (b) commit id in permanent URLs — GitHub Docs (byte-exact, 14 and 23 words)

> This will permanently link to the exact version of the file in that commit.

> You can put any identifier that can be resolved to a commit in the URL, including branch names, specific commit SHAs, or tags!

Grounding note: GitHub's own permalink example is
`https://github.com/github/codeql/blob/b212af08a6cffbb434f3c8a2795a579e092792fd/README.md`
— the commit id is a **complete path segment** of the URL, which is exactly the shape the
rule requires of a SOURCES row (`/blob/<40hex>/…`). That is why the rule is written as
"complete path segment" and not "substring of the URL": a GitHub permalink puts the commit
id in its own path segment, so the segment test is the faithful reading of (b).

---

## 4. Blast radius over the 77 filed reports (read-only, fleet pin)

Receipt: `filed-reports-declared.txt` (this dir).

Command: `git -C /home/vgpnk/Projects/shokunin ls-tree -r --name-only 87de49a6… .ufo/reports`
→ **77** `round-<n>/kumitate.md` files; each body read with
`git show 87de49a6…:.ufo/reports/round-<n>/kumitate.md`; tokens extracted exactly as the
gate does (backticked spans split on `..`/`...`, `/^[0-9a-f]{7,40}$/`), then matched against
the rule-declared pin set.

- The rule declares tokens in **exactly one** filed report: **r93** →
  `["79fa222e", "79fa222e8390aed3494f4bc6746814e6c74c21cf"]` (the S266–S269 oh-my-pi pin).
- The seven red rounds stay red under the rule: r12/r46/r53/r57/r61/r62/r63 declare
  **nothing** (`declared_by_rule = []` for each).
- Latent false-red check: **0** cited tokens across all 77 reports are prefixes of any of the
  11 URL-segment hexes without being rule-declared. So the rule neither repairs nor breaks
  any other filed round.

---

## 5. Sibling-lane practice (read-only)

Command: `grep -rl "COMMIT_CITED\|cat-file -e" /home/vgpnk/Projects/shokunin/*-shokunin/scripts/`.
Exactly **three** lanes match, and **no sibling lane has a `round-gate.mjs`** or any
registry-driven external-pin rule:

| lane / file | 1-line summary |
|---|---|
| `kumitate-shokunin/scripts/round-gate.mjs` | The only commit-citation gate in the fleet: resolves lane→main→origin, buckets `external` / `unverifiable` / `unresolved`, and (round 94) adds the SOURCES-declared bucket. |
| `kake-shokunin/scripts/citation_lint.py` | Commit-citation hygiene gate: a dead hex token in a commit context is a violation; "external" is excluded by **name on the line** (`EXTERNAL_RE` = ufo-fsd-alpha, ds4cc-marketplace, marketplace, upstream, sandbox, fleet repo, …) and by an adjudication ledger — i.e. kake excludes externals **lexically**, never by consulting a pin registry. |
| `kake-shokunin/scripts/instrument_receipts.py` | Requires a declared receipt revision to satisfy `git cat-file -e <rev>^{commit}` **and** `git merge-base --is-ancestor` — a *resolvable* pin requirement, the opposite of the r94 rule. |
| `tabi-shokunin/scripts/check-selfassessment.mjs` | `SAFE_GIT` allow-lists `git cat-file -e`/`show` on `^[0-9a-fA-F]{7,40}:<path>` — a *command-safety* allow-list, not a citation resolver. |
| `tabi-shokunin/scripts/check-release-pins.mjs` | Reads `corpus/SOURCES.md` registry rows, but for **release-tag freshness** (`refs/tags/<A.B.C.D>/`), not for commit pins. |

Conclusion for sibling practice: **the round-94 rule is novel in the fleet.** No sibling gate
reads a registry to excuse an unresolved external commit id, and the two sibling commit-citation
gates (kake) instead *require* resolvability or exclude externals by line wording. The r93
defect (the lane declaring its own upstream pin in its own registry, then being called red for
it) is therefore a lane-local gap, not a fleet-wide convention being followed elsewhere.

---

## 6. Candidate-independent attack on `ctl-positive` (candidate READY absent)

Per the seat spec: candidate-independent work first, then look for `READY`; if still absent,
attack `ctl-positive` (regenerated into my scratch) and say so.

- `ls .ufo/waves/round-94/K94ExecTool/READY` → **absent** (the builder had not finalised the
  candidate when this seat finished; `.ufo/waves/round-94/K94ExecTool/` held `round-gate.mjs`,
  `cap-run.mjs`, `cap-spawn.mjs`, `selftest.txt`, `score1.txt` but no `READY`).
- Regenerated the controls into scratch with the frozen generator:
  `python3 .ufo/waves/round-94/probe/make-controls94.py <base round-gate.mjs> $S/ctl`,
  where `<base round-gate.mjs>` = `git show a6e4da96…:scripts/round-gate.mjs`
  (sha256 `09d4d79238f44dd74a0fa727c8f6b193c3fa87200c02340e2f4b3dcc6b354594`, matching
  `controls/controls-sha256.txt`).
- **The regenerated `ctl-positive` is byte-identical to the frozen control**:
  sha256 `c67dbc8d638b30b550d4b5e902a924dd3c1e0119ce35f3804fcbd59d5fcf2424` =
  `controls/controls-sha256.txt` line 2. (All eight regenerated controls match their frozen
  hashes.)
- Ran the frozen counter against the regenerated `ctl-positive`:
  `node .ufo/waves/round-94/probe/probe94-c1.mjs --tool $S/ctl/ctl-positive.mjs --work $S/probe --freeze a6e4da96e828e900150c08d0a801266a53caab63`
  (TMPDIR=$S, `timeout 900 prlimit --as=4294967296`). Receipt: `probe-ctl-positive.txt`.

```
C94 reports=77 manifest_sha256=c5542d1aac28f141cd97e37077d66684f8582dc4ec09e426f873107434bcaca9
C94 r12 KEEP cand_unresolved=["23e476e21"] ok=true
C94 r46 KEEP cand_unresolved=["7af3d978"] ok=true
C94 r53 KEEP cand_unresolved=["b717dc035bf687a3039123f4c70527bd3774f510"] ok=true
C94 r57 KEEP cand_unresolved=["1cd6d667e20075fd2e77e6e655bc755f95e3d940"] ok=true
C94 r61 KEEP cand_unresolved=["ab902da2fa30d051455a5f3563627e2c23c3a74d","4247d2d"] ok=true
C94 r62 KEEP cand_unresolved=["4247d2da937842bd6846874d548b7125b356e14c"] ok=true
C94 r63 KEEP cand_unresolved=["9237a72"] ok=true
C94 r93 FIX base_exit=1 cand_exit=0 declared=["79fa222e","79fa222e8390aed3494f4bc6746814e6c74c21cf"] unresolved=[] a=true
C94 FX sources   exit=1 declared=[url8 full commitfrag] unresolved=[digest prose rejected mid none] ok=true
C94 FX nosources exit=1 verdict=DRIFT unresolved=8/8 ok=true
C94 SELFTEST exit=0 ROUND_GATE_SELFTEST: 61/61 pass ok=true
C94 fails=none
C94_C1: HELD a=1/1 b=7/7 c=77/77 d=2/2 e=1/1 tool_sha256=c67dbc8d638b30b550d4b5e902a924dd3c1e0119ce35f3804fcbd59d5fcf2424
```

**Verdict: the L1 reference rule (the frozen predicate) is HELD under the frozen counter,
run against a control regenerated independently in my own scratch.** This is a
control-behaviour result, not a candidate result: the candidate's own bytes were never
admitted by this seat (no `READY` existed).

---

## 6b. Opportunistic probe of the in-flight candidate (informational only)

After the `ctl-positive` attack, `K94ExecTool/READY` was still absent, but a candidate file
existed at `.ufo/waves/round-94/K94ExecTool/round-gate.mjs`. I copied those bytes into my
scratch (lane untouched) and ran the frozen counter on the copy — receipt
`probe-candidate-inflight.txt`:

```
tool_sha256=341726f3854ce424c433dfe7d4321301bc9803bc72b0b6a1657e9387f82dae20
C94 r93 FIX base_exit=1 cand_exit=0 declared=["79fa222e","79fa222e8390aed3494f4bc6746814e6c74c21cf"] unresolved=[] a=true
C94 FX sources   exit=1 declared=[url8 full commitfrag] unresolved=[digest prose rejected mid none] ok=true
C94 FX nosources exit=1 verdict=DRIFT unresolved=8/8 ok=true
C94 SELFTEST exit=0 ROUND_GATE_SELFTEST: 71/71 pass ok=true
C94 fails=none
C94_C1: HELD a=1/1 b=7/7 c=77/77 d=2/2 e=1/1
```

**This is a snapshot of bytes that were still moving, not a verdict on the delivered
candidate.** The builder's own `K94ExecTool/sha256.txt` recorded
`77f6470b8fbdcbfa825f8af2dd1235b805bfa46d884991582bbefc071e9454e7` while the file I copied
at that moment hashed `341726f3854ce424c433dfe7d4321301bc9803bc72b0b6a1657e9387f82dae20` —
i.e. the builder was mid-edit. I record the measurement only as evidence that the rule as
implemented in that snapshot passes the frozen counter against the freeze commit
`73317eca18c3927fc3c92fe492cd882dc4cda953`; the delivered candidate must be re-measured by
its own builder against the `READY` hash. Two implementation facts I read in that snapshot
(they match my §1/§2 findings and are worth the reviewer's attention):

- `declaredPins()` reads the status cell as `line.split('|')[8]` — verified equivalent to the
  1-based 8th column on all 208 rows (every row splits into exactly 13 fields; 0 rows where
  the two indexings disagree).
- `isDeclaredPin()` is the **existential** prefix test (`p.startsWith(tok)`), i.e. it does not
  implement git's uniqueness requirement. Per §1 finding 2 that is the recommended frozen
  behaviour on today's registry, but the divergence from `git cat-file -e` should be named in
  the docstring as a disclosed limit.

---

## 7. Findings summary (for the claim / reviewer)

1. **Grounding is sound but partial.** The rule's *spelling* (leading substring of a 40-hex)
   is git's own (`gitrevisions` Q1/Q1b, byte-exact above). The rule's *resolution universe*
   is deliberately **not** git's: git resolves within a repository and demands uniqueness;
   the rule resolves against the lane's registry because the pins are upstream commits in no
   probeable repo. The claim should say "mirrors git's abbreviation spelling over a registry,
   not git's in-repo uniqueness", not "git's abbreviation semantics" flatly.
2. **Uniqueness branch is vacuous today, keep the frozen existential rule, disclose it.**
   Measured: 0 shared 4-hex prefixes among the 10/11 registry pins; gate token floor is 7 hex.
   Recommended wording for the rule docstring: *"a token is declared if it is a prefix of one
   or more declared pins; git refuses an ambiguous short name, the gate does not — the current
   registry guarantees 7-hex uniqueness."* No rule change in round 94.
3. **Registry census (measured, freeze-commit valid):** 208 registry rows; 24 rows carry a
   40-hex URL path segment; **10** distinct such pins; **9** rule-declared (1 rejected-only,
   S045 `e7f1a99f…`); 14 further 40-hex values appear only in non-URL (digest/anchor) cells
   and are correctly not declared.
4. **Disclosed limit:** GitHub **commit-patch** permalinks (`/commit/<40hex>.patch`, S203
   `10bce6900b5b…`) are not complete-40-hex path segments and are therefore **not** declared
   by the rule; likewise 40-hex in non-URL cells. Both exclusions are the rule's intended
   precision, and measured blast radius over the 77 filed reports is **0** extra tokens.
5. **Blast radius is exactly r93.** Over all 77 filed reports the rule declares tokens in
   r93 only (`79fa222e`, `79fa222e8390aed3494f4bc6746814e6c74c21cf`); the seven red rounds
   (12, 46, 53, 57, 61, 62, 63) declare nothing and keep their exact unresolved sets.
6. **Novel in the fleet.** No sibling lane gate treats external pins by registry; the two
   sibling commit-citation gates (kake `citation_lint.py`, `instrument_receipts.py`) require
   resolvability or exclude externals lexically. The r93 defect is a lane-local gap.
7. **Candidate-independent control attack done** (candidate `READY` absent at the time):
   regenerated `ctl-positive` is byte-identical to the frozen control and the frozen counter
   prints `C94_C1: HELD a=1/1 b=7/7 c=77/77 d=2/2 e=1/1`.

## 8. Remaining unknowns / limits of this seat

- I did **not** verify the candidate's bytes (no `READY`); the counter runs above are against
  the **control** (§6) and an **in-flight snapshot** (§6b), not the delivered candidate.
- I did not measure how a candidate that *omits* the uniqueness rule would differ from one
  that includes it: on today's registry the two are indistinguishable (finding 2), so the
  mutation-tester seat's rule-shape mutants cannot separate them by this route either.
- The `10bce690…` (`.patch`) case is a **semantic** limit of the frozen predicate, not a bug
  in any implementation: an implementation that declared it would violate the frozen rule and
  would fail `ctl-positive`/`d=2/2`. If the lane later wants commit-patch URLs to count, that
  is a rule amendment for a future frozen round, not a round-94 fix.

## 9. Files produced (all under `.ufo/waves/round-94/K94Scout/`)

| file | content |
|---|---|
| `K94Scout.md` | this trailer |
| `git-prefix-transcript.txt` | fixture git transcript: unique 7-hex, ambiguous 4-hex, no-match prefix |
| `git-abbrev-defaults.txt` | `core.abbrev`, `--short` lengths, minimum abbreviation length 4 |
| `pin-counts.txt` | SOURCES.md registry census + prefix-collision table |
| `sources-pins.json` | machine-readable per-row census (pins, statuses, non-URL 40-hex) |
| `filed-reports-declared.txt` | declared-token scan over the 77 filed reports at the fleet pin |
| `quotes-byteexact.txt` | byte-exact quotes with source sha256 |
| `doc-quotes.txt` | full extracted sentence list from both primaries |
| `http-headers.txt` | HTTP status/headers for both primaries |
| `probe-ctl-positive.txt` | frozen-counter receipt for the regenerated `ctl-positive` (HELD) |
| `probe-candidate-inflight.txt` | frozen-counter receipt for the in-flight candidate snapshot (HELD; informational, bytes were moving) |

Scratch `/fast/scratch/hyaku/kumitate-r94/K94Scout/` removed on yield.
