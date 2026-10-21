CRITIC_C1 verdict=risky tests=9

Claim C1 is an admissible operability claim, but the delivered patch
(/fast/scratch/kumitate-r35/w/ExecDistinct.patch, stat 2026-10-20 21:18) is
broken as shipped and trades away a detection class. Judge-callable tradeoff
plus two fixable executor defects below.

## Q1 — is it an axis move given f_O does not change?

Admissible. `f_O=(A+C)/(A+C+3)` stays 20/23 ⇒ 8 (A=7, C=13; no file count or
checklist item moves). AXES.md requires "one verifiable improvement" with a
falsifiable before→after, not necessarily an integer move; lane precedent is
explicit — LOG.md round 22 (K distinct tightening, "score holds at 10",
godspeed verdict "operability improved"), round 23 (gate repairs filed as
operability), and this exact hole is recorded as queued operability work in
SCORECARD.md `## Limits` (`:1387-1396`) and LOG.md `:916-924` ("queued for an
operability round"). The honest before→after is mutation-kill 0/2 → 2/2 and
the selftest case delta, recorded where a number is expected — the SCORECARD
row must carry the verdict, not a fake integer.

## Q2 — mutation-kill 0/2→2/2 legitimate before→after? YES, and I reproduced it.

Method: `/tmp/kr35-crit/lane` = SCORECARD.md+SKILL.md+scripts+corpus copy;
stanza re-pinned to live-computed values (S_members=88, S_sections=86,
C2_total=78, coverage_script=9, axes coverage|script-layer=9) →
`node scripts/proxy-check.mjs --self … --src /fast/scratch/kumitate-r35/src` →
`PROXY: MATCH` exit 0. Then mutate `corpus/knowledge/remaining-scripts-census.md`.

- T1 BEFORE, dup+drop (dup `## \`scripts/charter-scribe/config.json\``, drop
  `## \`scripts/ufo-watchdog-repend.test.mjs\``): **PROXY: MATCH exit 0** —
  occurrence numerator preserved at 86; the member loss is invisible. Hole
  confirmed on live notes, not only fixtures.
- T2 BEFORE, dup+add only: `S_SECTIONS_DRIFT declared=86 computed=87` — today
  the occurrence counter does catch pure duplication.
- T3 AFTER (patched file + restored `*/` in my copy): same dup+drop →
  `S_SECTIONS_DRIFT declared=86 computed=85 delta=-1` exit 1. Kill confirmed.
- T5 AFTER, symmetric R mutation on `runtime-remainder-census.md` →
  `R_SECTIONS_DRIFT declared=83 computed=82` + `COVERAGE_RUNTIME_DRIFT` +
  `AXES_DRIFT`. Kill confirmed.

## Q3 — can it break the live MATCH or silently lower S/R?

No, on content. Baseline `distinct.txt` already proves occurrences=distinct on
live notes (S 86=86, R 83=83); patched-sim on the unmutated copy prints
`PROXY: MATCH (… S=86/88 …; R=83/92 …; K=50/50 …; pins=6 match)`. No
undefined-bucket risk: `inFamily===true` implies `s.file` non-null
(claims-check.mjs:354,359 push `file:null` WITHOUT `inFamily` for
unresolved/ambiguous). Dedup key is the resolved rel path `own` (:390), so
cross-row or cross-note duplicates of one member now count once — consistent
with the gate's own distinct check (:401).

## Q4 — can the selftest pass while the live path is still occurrence-counted?

No. Selftest fixtures go through `runProxy → deriveTerms → layerTerms` — the
same function `--json` uses (:763). The new cases assert literal verdict
strings (`S_SECTIONS_DRIFT term=S_sections declared=2 computed=1 delta=-1`),
and T3/T5 above are runs of the patched code path on REAL corpus notes, not
fixtures — a secretly occurrence-counted live path would print MATCH. Attack
refuted by evidence.

## DEFECT 1 — delivered patch is DOA (fail-closed)

The diff deletes the `*/` closing `layerTerms`'s doc comment; `function
layerTerms` becomes comment text.
`node /fast/scratch/kumitate-r35/w/ExecDistinct/lane/scripts/proxy-check.mjs
--self … --src …` → `PROXY: FAIL-CLOSED (INTERNAL_ERROR) layerTerms is not
defined`; `--selftest` → `PROXY_SELFTEST: 43/107 pass VERDICT: FAIL`. The
.patch file carries the same defect (context ` function layerTerms` with no
`*/`). Smallest correction: restore ` */` before `function layerTerms`.

## DEFECT 2 — new fixture cases name phantom members

After simulating the `*/` fix, selftest is 103/107; the 3 new cases +
hermeticity aggregate fail. Root cause: `DISTINCT_LAYER_KNOBS` sections name
`scripts/b.mjs` and `crates/ufo-core-runtime/src/c.rs`, but `FX_SRC_FILES`
(:1121-1128) contains neither (S members: a.mjs, lib/x.mjs, lib/deep/y.sh; R:
ufo-core-runtime/src/b.rs, ufo-cli/src/c.rs). Unresolved sections get
`file:null` (never inFamily), so each case's OTHER layer computes 1 vs
declared 2 and pollutes kindsEq; the stanza `=1\n→=2\n` replace is also a
no-op since expect already declares 2. Smallest correction: rename the second
fixture member to `scripts/lib/x.mjs` / `crates/ufo-cli/src/c.rs` in the notes
and registry cells (inFamily is basename-matched, claims-check.mjs:261-262).

## TRADEOFF for the judge — detection shape changes (T4)

Patched-sim dup+add (occurrences 87, distinct 86) → `PROXY: MATCH`, and the
claims gate also stays silent (distinct count already dedupes). The mutation
class "duplicate a member section, drop nothing" moves from detected to
invisible on BOTH gates. Counterweight: dup+add was only an upward-inflation
vector on a numerator the scorecard writer already controls; distinct counting
removes the inflation itself and makes the proxy's term consistent with the
gate's semantics. If the judge rules this a regression, the smallest safe
correction is a warn-only advisory (occurrences≠distinct) — but that adds a
finding kind the item forbids; the honest minimum is recording the tradeoff in
SCORECARD `## Limits` as round-22 did for K.

## Commands run

`node scripts/proxy-check.mjs --self /tmp/kr35-crit/{lane,t1,t2,p1,p2,p3}
--src /fast/scratch/kumitate-r35/src` (± --json, --selftest);
`node claims-check.mjs --row S8` on mutated copy → `MEMBER_COUNT_DRIFT row=S8
declared 63 members, found 62 distinct sections` (gate arm still armed);
`git diff 1770305fae…` on executor lane; sha256 re-pin of stanza in copies.
No lane/jj/git-index writes; all mutation work in /tmp/kr35-crit/*.

Impacted axes: operability (claim axis; artifact broken = axis harmed until
DEFECT 1 lands a fix). Integration note for L1: C2's re-census must declare
S_sections under the NEW distinct term — with the live 86-occurrence census
this currently coincides, but ordering matters if any S8 note gains a
duplicate heading.

## Lane observation (not mine — concurrent writer)

`corpus/knowledge/remaining-scripts-census.md` in the LIVE lane shows
` M` in `git status` at stat mtime 2026-10-20 21:22 — a one-line deletion of
the trailing blank line after the last member section. All my mutation work
was in `/tmp/kr35-crit/*` (removed); this is a sibling/integrator write.
Flagging because an in-flight edit to the exact note whose 63 sections feed
S_sections can shift the distinct census underneath C1's and C2's
before→after. [INFERENCE] attribution unobserved.
