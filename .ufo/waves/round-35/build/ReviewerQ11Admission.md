Q11 action=append-admission

# Q11 review — dated admission entry for 16a5441 (read-only reviewer seat)

Axes named (godspeed): operability only (judged axis). Moves: (1) verified every
grounding claim about `16a5441` against the live lane history, not the lesson's
own text; (2) produced the exact admission-entry text Q11 requires, with zero
invented gate outputs and named L1 commands. Cheap iteration: all fact probes
ran in one parallel batch; the entry text reuses the lane's own recorded format
(LOG.md `## Move log` bullets + `corpus/lessons/round-34.md` `## Gate`
"Admitted."/"Rejected or held." headers). Nothing here edits the lane.

## Verdict: admission, not rejection

`16a5441a3347a10ac5ed169abcd5a17ba6f3f185` (2026-10-17 00:28:17 −0300, author
`kumitate-shokunin <kumitate@shokunin.local>`) is **landed** on master:
`git merge-base --is-ancestor 16a5441 HEAD` → ancestor=yes (verified). Q11
(`corpus/QUALITY.md:61-64`) says "every landed candidate has a dated LOG
admission entry … A commit without the entry is an unadmitted candidate
regardless of its content", and the round-34 Mistakes row (round-34.md:16) fixes
the remedy: "A landed candidate carries a dated LOG admission entry naming round
identity, work revision and gate lines." A rejection record (QUALITY "How to
apply" step 6) applies to a candidate refused at gate; it cannot repair a landed
commit's missing entry, and the "Reject or hold" path would leave the landed
commit permanently unadmitted. So: **append-admission**.

Correcting the lesson's own text (operability: don't propagate a stale probe):

- round-34.md:16 states `grep -n 16a5441 LOG.md SCORECARD.md` is **empty**. On
  the live worktree today the command returns 4 hits: LOG.md:1412 and :1523
  ("base `16a5441`" — round-34 continuation and post-review prose), SCORECARD.md:1616
  (frozen legacy-identity set). None is an admission entry: Q11's three required
  members — round identity, work revision, gate lines — name the *work revision*
  and gate outputs; a base-pointer mention names neither. The *commit hash*
  remains unmentioned everywhere (round identity must name it).
- "SCORECARD.md:378,458 (measurement record promised, never appended)" is true
  **at `16a5441` itself** — that commit *added* the promise (verified:
  `git show 16a5441 -- SCORECARD.md`, new Move-log row 18 "appended in the
  measurement record"; new Planned stanza "The committed after-measurement will
  name its actual work revision in an appended measurement record"). It is false
  on the live worktree: the round-34 commit (base → HEAD, 18 files +2184/−62)
  already appended the measurement record into LOG.md:1411+ — the round-34 entry
  declares itself measured at base `16a5441`, names work-revision precedent
  (`964f443e`), and quotes gate lines (`sources-check` CLEAN/34-34, census,
  proxy, claims). Only the *revision-identity gap* is open: no admission text
  binds the landed bytes `16a5441` itself.

## What the entry must cover (derived, not invented)

`16a5441` is the current-cycle **round-18** work commit: it adds LOG.md:1317-1344
(the round-18 "current fleet cycle; runtime member coverage" admission bullet,
committed in that very commit), three knowledge notes (cost-and-profile.md 249 L,
runtime-support.md 222 L, distill-and-l3.md 194 L), `corpus/lessons/round-18.md`
(42 L), and the SCORECARD hunk asserting R_sections 75 → **83**,
coverage_runtime 8 → **9**, plus the planned steered-18/17 stanzas. The claimed
outcome lives in that hunk: 83/92 = ceil(0.9×92), selected rows R3 5/5, R4 6/6,
R6 4/4, eight distinct in-family identities.

The commit therefore *contains* its LOG/SCORECARD record but no dated admission
entry that names the revision it landed at and the gate lines measured **on that
revision** — the Q11 gap. The admission entry (a new top-level bullet appended
to the current `## Move log` in LOG.md, dated today) must state:

1. **Round identity** — "round 18 (current fleet cycle), candidate commit
   `16a5441a3347a10ac5ed169abcd5a17ba6f3f185` (2026-10-17), admitted
   retroactively per Q11 (round-34 Mistakes row 'Admission-status ambiguity')."
2. **Work revision** — `16a5441` itself, with baseline lane `6b982ab` and
   read-only source `964f443e` already recorded (LOG.md:1322-1323).
3. **Gate lines** — the five pre/post commands LOG.md:1324-1331 already names,
   **re-run at `16a5441` by the L1** before the entry lands (never invented).
   No gate may read live upstream `main`: the tree has moved (C2: 88 members,
   55 modified; live S 86/88), so unpinned runs would contradict the recorded
   round-18 claims. Commands (all from the lane worktree, `--src` pinned to
   `964f443e` exactly as LOG.md:1324-1331 records; `--fleet` path per lane
   layout, not `/tmp`):

```sh
node scripts/proxy-check.mjs --src /home/vgpnk/Projects/ufo-fsd-alpha --json
node scripts/claims-check.mjs --src /home/vgpnk/Projects/ufo-fsd-alpha \
  --row R3 --row R4 --row R6 --strict --json
node scripts/cite-check.mjs --src /home/vgpnk/Projects/ufo-fsd-alpha \
  --fleet /home/vgpnk/Projects/shokunin --json   # delta on the 3 notes + lessons/round-18.md only
node scripts/surface-probe.mjs --checklists
```

   Acceptance to quote in the entry: `PROXY: MATCH` (R=83/92,
   coverage_runtime=9, all seven v1 pins); `CLAIMS:` R3 5/5, R4 6/6, R6 4/4,
   strict adv=0; the recorded cite-check delta reproduced (the three notes and
   round-18.md print 0 new errors). The L1 pastes each full verdict line plus
   its date into the entry (Q7 discipline). If `proxy-check` at the pinned src
   fails against the `16a5441` stanza the entry stays an admission of **status**,
   not content, and names the delta — never fit the numbers.

## Draft entry text (exact, placeholders marked)

    - 2026-10-20 — admission of landed candidate 16a5441a3347a10ac5ed169abcd5a17ba6f3f185
      (round 18, current fleet cycle, runtime member coverage; commit dated
      2026-10-17). Q11 retro-admission: the round-34 "Admission-status ambiguity"
      row records that no dated LOG admission entry names this landed work
      revision. Round identity: round 18 (current fleet cycle), admission bullet
      LOG.md:1317; baseline lane 6b982abbb20378b5110bba5f2f9bd581ac20d08e;
      read-only source 964f443ee53df0ce06bd689af01f0dea031b01f9. Work revision:
      the candidate itself, 16a5441 — R_sections 75→83, coverage_runtime 8→9
      (SCORECARD as committed there), eight distinct in-family R3/R4/R6 members,
      three knowledge notes + lessons/round-18.md. Gate lines (L1-run 2026-10-20,
      from the lane worktree, upstream pinned to 964f443e per LOG.md:1324-1331):
      `node scripts/proxy-check.mjs --src /home/vgpnk/Projects/ufo-fsd-alpha --json`
      → <L1: paste full line>; `node scripts/claims-check.mjs --src
      /home/vgpnk/Projects/ufo-fsd-alpha --row R3 --row R4 --row R6 --strict
      --json` → <L1: paste full line>; per-file cite delta for
      corpus/knowledge/cost-and-profile.md, runtime-support.md,
      distill-and-l3.md, corpus/lessons/round-18.md → <L1: paste counts>.
      Acceptance: PROXY MATCH with R=83/92 coverage_runtime=9 and pins match;
      rows 5/5 6/6 4/4, strict warnings 0; every gate line dated and quoted whole
      (Q7). On any gate DRIFT at the pinned source the entry records the delta
      and does not fit the recorded numbers. Admission of the landed candidate's
      status; no new axis claim; no push.

(Indent and dash match the neighboring `## Move log` bullets; the L1 fixes only
the four `<L1: …>` slots with real output.)

## Residual risk / verification gaps

- Gate re-runs are the L1's seat; I ran none (read-only lane, no gate execution
  assigned). The five commands above are named, not executed — outputs remain
  `[UNOBSERVED]` by design.
- Whether `proxy-check`'s current parser still reads the `16a5441`-era stanza is
  unverified; if parsing changed since, the entry must say so rather than force
  MATCH.
- The entry's date line (2026-10-20) is the append date; the round identity and
  commit date carry the original timing, matching how round-34's retro bullets
  are dated in this LOG.

Report file: `.ufo/waves/round-35/build/ReviewerQ11Admission.md` (this file).
Tooling installs: none (no tool installed or updated).