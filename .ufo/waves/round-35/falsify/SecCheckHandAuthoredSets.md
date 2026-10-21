ATTACK S8-member-section `scripts/check-hand-authored-sets.mjs` verdict=holds defects=0

Target: `corpus/knowledge/remaining-scripts-census.md` lines 499-501 (heading
`## `scripts/check-hand-authored-sets.mjs`` at :499, body at :501), the
round-35 re-anchored S8 member section. Population row :127, historical
round-32 addition list :424. Judged axis: coverage:script-layer.

## Anchor-by-anchor verification at 31c465f1

Every anchor in the section, read at the pinned source
(`git -C /fast/scratch/kumitate-r35/src show 31c465f1:scripts/check-hand-authored-sets.mjs`):

1. `:35` — L35 is exactly
   `export const DECLARED_PRE_HOOKS = Object.freeze(["ufo-godspeed-inject.js", "ufo-l0-monitor.js"]);`
   → symbol present at the cited line; the "now listing only
   `ufo-godspeed-inject.js` and `ufo-l0-monitor.js`" clause is true at the
   pin (array has exactly those two strings, nothing else).
2. `:82` — L82 is exactly `export function enumerateSets(root) {` → present,
   still exported. Sole in-file consumer unchanged: L102
   `const hooks = DECLARED_PRE_HOOKS.map((name) => `.omp/hooks/pre/${name}`);`.
3. Population row :127 `| scripts/check-hand-authored-sets.mjs | 215 | tool |`
   — `wc -l` at 31c465f1 = 215. Class `tool` correct under the note's own
   shape-label rule (`.mjs`, not `*.test.mjs`). No `:N-M` range anchors cite
   this member in the note (grep over the note: none).
4. Original revision label kept: the body still opens "re-censused 2026-10-14
   against origin HEAD `964f443e`", and 215 L is true at that revision too
   (wc at 964f443e = 215). The trailing "re-anchored at 31c465f1 (round 35)"
   tag is present.
5. Removed-clause trace: the pin-to-pin diff
   (`git -C /fast/scratch/kumitate-r35/src diff 964f443e 31c465f1 --
   scripts/check-hand-authored-sets.mjs`) is exactly one hunk, +1/−1:
   `-…Object.freeze(["primeagent-assimilation.js", "ufo-godspeed-inject.js", "ufo-l0-monitor.js"])`
   `+…Object.freeze(["ufo-godspeed-inject.js", "ufo-l0-monitor.js"])`.
   No note clause was removed (the master section never described the array
   contents), so no "(round 35: removed …)" trace is owed; the removal itself
   is surfaced by the "now listing only …" clause. Matches the frozen
   `s-modified-members-55.tsv:4` row (`+1/-1`). Wave-1 input
   `.ufo/waves/round-35/build/FidCheckHandAuthoredSets.md` classified the same
   single hunk and found no moved/removed anchor (ok=2, moved=0, gone=0).
6. No new false claim found in the section: every clause above is verified
   against 31c465f1. The file-header comment at 31c465f1 L12 still reads
   "the three native-discovery pre hooks (AGENTS.md)" while the declared list
   is two — an upstream-internal inconsistency that no note anchor cites; the
   note does not repeat it, so it is not a note defect.

## Cross-checks

- Lane proxy gate, read-only, as instructed by the note's own convention:
  `node scripts/proxy-check.mjs --src /fast/scratch/kumitate-r35/src`
  → `PROXY: MATCH (A=7 C=13 operability=8; C1=19/19 C2=79/79 coverage=10;
  S=88/88 coverage:script-layer=10; R=83/92 coverage:runtime-layer=9;
  K=51/51 coverage:kimi-layer=10; pins=6 match)` — reproduces the round-end
  claim verbatim; S=88/88 and coverage:script-layer=10 are consistent with
  this section being correctly re-anchored (C2 contribution).
  Observation (out of member scope): the same run printed
  `PROXY warn PIN_UNPINNED scripts/sources-check.mjs has no pin.<name> key in
  the kumitate-proxy-v1 stanza` — not mentioned in the round-end trailer, but
  the trailer only claims the MATCH line, so not a refutation.
- Heading-set sanity: `grep -c '^## `scripts/'` on the note = 60, matching the
  declared live member count; this member's heading appears exactly once
  (:499; the .test.mjs sibling is a separate section at :503).
- Member still in the historical round-32 "added with own-file anchors" list
  at note:424 — historically accurate (that list is about 2026-10-14).
- No stale cross-note citation was introduced by this round: the only other
  lane mentions of `primeagent-assimilation` live in notes untouched this
  round (`git diff master --stat -- corpus/knowledge/kimi-modes-machinery.md`
  is empty; `corpus/knowledge/queue-summary.md` refs a different path,
  `config/primeagent-assimilation.json`). The `.test.mjs` sibling at 31c465f1
  is 141 L (= row :128) and its diff is the same hook-set swap (+2/−2);
  anchors `:14` (import) and `:54` (checkHandAuthoredSets deepEqual) both
  verified — cross-fed to peer KumitateR35.SecCheckHandAuthoredSetsTest.
- Correction (peer-confirmed, and verified against my own diff read): the
  sibling NOTE section `## `scripts/check-hand-authored-sets.test.mjs``
  (note:505) is byte-identical to master — it carries no `re-anchored at
  31c465f1 (round 35)` tag. None was owed: the upstream +2/−2 hunks sit at
  test-body lines ~91–105, below both anchor lines, so `:14`/`:54` hold
  unchanged at both pins and the section needed no edit. (My earlier
  cross-feed message to the sibling wrongly said it appends the tag.)

## Residual risk and gaps

- The section does not record the 964f443e array content (3 hooks incl.
  `primeagent-assimilation.js`); it is recoverable only from git. Sibling
  sections with size deltas use "(was N @ 964f443e)", but this member had no
  size delta and no removed note clause, so the lane convention does not
  require it. Cosmetic only — not counted as a defect.
- [INFERENCE] I did not verify that `checkHandAuthoredSets` (the function the
  test imports) is exported from the .mjs; the note does not claim it, so it
  is not an anchor obligation. The two named anchors are the section's only
  claims and both hold.
- [INFERENCE] Coverage of this member by other S1–S7 topic notes: grep of
  `corpus/` found no other citation of the member, so no other note needed
  re-anchoring for this upstream change.

Verdict: the re-anchored section is faithful at 31c465f1; C2's
coverage:script-layer claim is supported for this member. defects=0.
