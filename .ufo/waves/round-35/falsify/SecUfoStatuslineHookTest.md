ATTACK `## \`scripts/ufo-statusline-hook.test.mjs\`` verdict=holds defects=0

Axes: coverage:script-layer (judged). Attack surface: the round-35 re-anchored S8
member section for `scripts/ufo-statusline-hook.test.mjs` in
`corpus/knowledge/remaining-scripts-census.md` (note lines 772-774; next section
starts 775). Every claim below was checked against the pinned source
`31c465f1` via the read-only clone `/fast/scratch/kumitate-r35/src`
(`git -C /fast/scratch/kumitate-r35/src show 31c465f1:<path> | sed -n 'Np'`).

# Anchor-by-anchor verification (all anchors in the section)

Note sentence → source line at 31c465f1 → verdict:

1. "dynamically imports `formatUf0Status`, `isCacheFresh` and
   `shouldStampDisplayRefresh` (`scripts/ufo-statusline-hook.test.mjs:16`)" →
   :16 `const { formatUf0Status, isCacheFresh, shouldStampDisplayRefresh } = await import(join(REPO, ".omp", "hooks", "ufo-statusline.mjs"));` — exact match, all three symbols present at that line. OK.
2. "holds nine pins over a local test harness (`:22`)" → :22 `function test(name, fn) {`; `grep -c '^test('` = 9. Nine pins confirmed. OK.
3. "malformed or drifted payloads render `CLOSED` (`:33`), the literal `uf0 hatch (closed)`" → :33 `const CLOSED = "uf0 hatch (closed)";`. OK.
4. "an empty object must not print fabricated zero-fleet text (`:40`)" → :40
   `test("malformed {} renders CLOSED, not fabricated zeros", () => {`. OK.
5. "null, strings, arrays or missing `levels`, `phaseCounts` (`:36`) or `hatch` likewise render CLOSED (`:44`, `:50`, `:54`, `:58`)" →
   :36 `phaseCounts: { queued: 1, working: 3, suspended: 0 },` (the VALID literal);
   :44 `test("null / non-object renders CLOSED", ...)` (asserts null, "open",
   [1,2] → null/strings/arrays); :50 missing levels; :54 missing phaseCounts;
   :58 missing hatch. All present, all `CLOSED`-asserting. OK.
6. "A valid envelope formats counts with null l2 as the opaque `?` sentinel
   (`:62-63`)" → :62 test title "…(l2 null stays the opaque ? sentinel)", :63
   asserts `"uf0 L1(2) | L2(?) | L3(1) | q1 w3 s0 | hatch (open)"`. OK.
7. "a valid closed envelope formats closed with counts (`:66-70`)" → :66
   `test("valid closed envelope formats closed with counts", ...)` :67-70
   asserts `"… q0 w0 s2 | hatch (closed)"`. OK.
8. "The added cache gates pin TTL freshness (`:73-85`)" → :73
   `test("cache TTL is decoupled from the poll cadence", ...)`; asserts
   isCacheFresh(now-4_999/-5_000/-9_999 → true, now-10_000 → false, now+1_000 →
   true, now+1_001 → false, "nope" → false, Number.NaN → false), lines 73-85.
   "TTL freshness" is accurate: `isCacheFresh` gates the bounded cache age
   (`CACHE_TTL_MS = 2 * POLL_MS`, hook :29/:89-93). OK.
9. "ensure display stamps follow only a confirmed full refresh (`:87-94`)" → :87
   `test("display stamp only follows a confirmed full refresh", ...)`; asserts
   shouldStampDisplayRefresh(false, {displayRefreshed:true}) → true, false with
   {displayRefreshed:false}/{}/null, and true+lite → false (`--lite never
   stamping`, :92-93). Matches the hook's call site `if (shouldStampDisplayRefresh(lite, json)) markDisplayRefreshed();` (.omp/hooks/ufo-statusline.mjs:340). OK.
10. "The run prints N/N pins green or exits 1 when any pin fails (`:97-98`)" →
    :97 `console.log(`\n${results.length - failed.length}/${results.length} pins green`);`
    :98 `if (failed.length > 0) process.exit(1);`. OK.

Every anchor resolves to a non-empty line at the pin; every named symbol
(`formatUf0Status`, `isCacheFresh`, `shouldStampDisplayRefresh`, `test`,
`CLOSED`, `phaseCounts`) is present verbatim at its cited line.

# Population-table row check

note:176 `| `scripts/ufo-statusline-hook.test.mjs` | 98 | suite |` vs
`git -C /fast/scratch/kumitate-r35/src show 31c465f1:scripts/ufo-statusline-hook.test.mjs | wc -l` → 98. Row equals `wc -l` at the pin. OK.

# Revision label + trace of removed clauses

- Family wording check: "colocated" is established census usage (master used
  "colocated fail-closed suite" here; fleet-ledger-read.test.mjs uses "colocated
  contract suite"), so the new paragraph's "colocated fail-closed statusline
  suite" keeps the existing convention rather than introducing new wording.
- Label: the section carries `re-anchored at 31c465f1 (round 35)` (note:774,
  final words). 34 member sections in the note carry the same marker; 37
  sections carry round-35 markers overall — the label is kept and consistent
  with the note's convention. The old value 75 lives in the diff as the
  replaced table row (`-| … | 75 | suite |`), so the history remains recoverable
  from the working-tree diff against master.
- Clause trace: the removed sentence "Because the cache gate shares
  `isStatusEnvelope` … these format pins decide accept/reject for the
  cross-session cache too" (master note:807, whole paragraph read back via
  `git show master:… | sed -n '807p'`) is absent from the new paragraph with no
  `(round 35: …)` marker; census-wide grep for
  `cross-session cache|no-cache-write|accept/reject` = 0 hits. This is the one
  removed clause in this section. Note convention does allow silent removal
  when the clause is merely stale (ExecS8Fidelity.md: "clauses_removed counts
  report `gone` findings resolved by removing or replacing the stale
  claim/anchor"; no trace convention exists for such removals — explicit
  `(round 35: removed X — absent at 31c465f1)` markers are used only when a
  named symbol is removed, e.g. charter-scribe/sync.mjs ScribeError). The
  removed clause is a stale consequence-of-`isStatusEnvelope` claim, not a
  symbol; the trace rule as practiced is satisfied. Recorded as an observation,
  not a defect.
- Symbol-level truth of the removed clause at the pin (did its removal hide a
  fact change?): at 31c465f1 the cache write is still envelope-gated —
  `if (isStatusEnvelope(json)) { writeStatusCache(...); if (shouldStampDisplayRefresh(...)) ... }`
  (hook :338-341) — so the accept/reject consequence still holds at the pin;
  the clause was dropped for conciseness, not because the behavior vanished.
  No hidden regression.

# Line-mapping integrity

The round-35 edit rewrote :16 in place and inserted :73-94; lines 1-15 and
17-72 are byte-identical between 964f443e and 31c465f1 (per-file diff
964f443e→31c465f1: +25/-1 for the test file incl. :16 rewrite; hooks file
+35/-6). FidUfoStatuslineHookTest.md ("Old file 75 lines, new 98") and
ExecS8Fidelity.md ("all 60 population-table rows … match wc -l at 31c465f1,
stale=0") are both consistent with what I measured directly (75/98).

# New false claims hunted

- "nine pins": 9 `test(` calls; suite self-reports 9/9. OK.
- "added cache gates": both symbols absent at 964f443e (`grep -c displayRefresh`
  = 0 there; no isCacheFresh/shouldStampDisplayRefresh exports at that rev —
  the 964f443e hook stamps every full fetch unconditionally at :317). OK.
- "display stamps follow only a confirmed full refresh": verified against the
  pin's producer semantics (`--lite` never stamps; `displayRefreshed === true`
  required; hook :99-101, :340). OK.
- Runtime confirmation: extracted the pinned tree with
  `git -C /fast/scratch/kumitate-r35/src archive 31c465f1 | tar -x` into my
  scratch and ran `node scripts/ufo-statusline-hook.test.mjs` →
  `9/9 pins green`, exit 0. The section's claims are not just line-present;
  the suite itself passes at the pin.

# Commands run (evidence)

- `git -C /home/vgpnk/Projects/shokunin/kumitate-shokunin diff master -- corpus/knowledge/remaining-scripts-census.md`
  (read; statusline hunks at diff lines 172-196, 549-560)
- `awk`-extraction of note:772-774 (current) and
  `git show master:… | sed -n '805-809p'` (old section at note:805-807)
- `git -C /fast/scratch/kumitate-r35/src show 31c465f1:scripts/ufo-statusline-hook.test.mjs | cat -n` (full 98-line read)
- `git -C /fast/scratch/kumitate-r35/src show 964f443e:scripts/ufo-statusline-hook.test.mjs | wc -l` → 75 (and line-by-line for :16/:22/:33/:36/:40/:44/:50/:54/:58/:62/:63/:66-70/:74-75)
- `git -C /fast/scratch/kumitate-r35/src show 31c465f1:.omp/hooks/ufo-statusline.mjs | grep -n 'export'` → formatUf0Status :58, isCacheFresh :89, shouldStampDisplayRefresh :99
- `git -C /fast/scratch/kumitate-r35/src archive 31c465f1 | tar -x` into /fast/scratch/kumitate-r35/w/SecUfoStatuslineHookTest/pin/ then `node scripts/ufo-statusline-hook.test.mjs` → `9/9 pins green`, exit 0
- `grep -c '^test('` at pin → 9; `wc -l` at pin → 98
- census greps: `ufo-statusline-hook` → note:176 (row), :421 (round-32 removed list, other file), :772, :774; `cross-session cache|no-cache-write|accept/reject` → 0 hits; `re-anchored at 31c465f1 (round 35)` → 34 sections

# Gaps

- [INFERENCE] I read the section's claims as pinned to 31c465f1 per the
  trailing revision label; the note has no per-anchor revision stamps, so I
  also verified every surviving anchor against the old revision 964f443e where
  the Fid report said it was unchanged (all byte-identical in 17-72 — verified
  by diff, not taken on trust).
- No tool installs or updates were needed (repo git + coreutils + node only).
- Read-only item: no lane files edited; only my report and the scratch pin-tree
  extraction under /fast/scratch/kumitate-r35/w/SecUfoStatuslineHookTest/.
