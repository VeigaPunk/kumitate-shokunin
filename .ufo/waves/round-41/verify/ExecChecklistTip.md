RESULT ExecChecklistTip rev=fae386aa9e0542710b7a893d84c8e92e86fc079b verdict=improved tip=14/17 open=11/15

# ExecChecklistTip — the SKILL.md checklist at the tip and at the round open

Scope: run `node scripts/surface-probe.mjs --checklists` at `fae386aa9e0542710b7a893d84c8e92e86fc079b`
and at `a58b7f72afc1eb44b37e438a2f8b212c658874e5`, paste every CHECKLIST line of both, and for each
failing item name the cause from its own output and attribute it to the lane (a commit in
`a58b7f72..fae386aa`) or to the host.

Verdict: IMPROVED, and no lane-caused checklist failure survives at the tip. The tip run fails
three items: two of them are a clone-path artifact of this seat (not the lane, not the host), the
third is the host's Kimi drift. The one failure the lane did own — "Proxy recompute" — was
present at the round open and was fixed inside the range.

Environment: node v24.21.0 (already present; nothing installed or updated, no package manager
transaction). Scratch clone `/fast/scratch/hyaku/kumitate-r41a2/seats/ExecChecklistTip/lane`,
detached at `fae386aa`; the round-open tree is a worktree of that clone at `../open`. Nothing was
written to the lane except this report; no index, jj state, ref, commit or push was touched.

## TIP — rev fae386aa9e0542710b7a893d84c8e92e86fc079b (prescribed clone)

Command: `node scripts/surface-probe.mjs --checklists` in `…/seats/ExecChecklistTip/lane` (exit 1)

```
CHECKLIST  PASS SKILL.md:675 exit=1 expected=0|1 substring=hit — Citation gate verdict
CHECKLIST  PASS SKILL.md:676 exit=0 expected=0 substring=hit — Citation gate hermetic suite
CHECKLIST  PASS SKILL.md:677 exit=0 expected=0 substring=hit — Live sighting-surface conformance
CHECKLIST  PASS SKILL.md:678 exit=0 expected=0 substring=hit — Surface-probe hermetic suite
CHECKLIST  PASS SKILL.md:679 exit=0 expected=0 substring=hit — Round-gate hermetic suite
CHECKLIST  FAIL SKILL.md:680 exit=2 expected=0 substring=miss — Round-close artifact audit
CHECKLIST  FAIL SKILL.md:681 exit=2 expected=0 substring=miss — Filed-report tracking
CHECKLIST  PASS SKILL.md:682 exit=0 expected=0 substring=hit — Proxy recompute
CHECKLIST  PASS SKILL.md:683 exit=0 expected=0 substring=hit — Proxy-check hermetic suite
CHECKLIST  PASS SKILL.md:684 exit=0 expected=0 substring=hit — Member-claims gate
CHECKLIST  FAIL SKILL.md:685 exit=1 expected=0 substring=miss — Kimi-substrate census
CHECKLIST  PASS SKILL.md:686 exit=0 expected=0 substring=hit — Sources-registry gate
CHECKLIST  PASS SKILL.md:687 exit=0 expected=0 substring=hit — Sources-check hermetic suite
CHECKLIST  PASS SKILL.md:688 exit=0 expected=0 substring=hit — Per-anchor truth burn-down
CHECKLIST  PASS SKILL.md:689 exit=0 expected=0 substring=hit — Anchor-truth hermetic suite
CHECKLIST  PASS SKILL.md:690 exit=0 expected=0 substring=hit — Wave census of round 40's committed payloads (payload counts and findings; a payload proves validation, not dispatch)
CHECKLIST  PASS SKILL.md:691 exit=0 expected=0 substring=hit — Wave-census hermetic suite
CHECKLIST_SKIPPED: 0
CHECKLIST: 14/17 pass
VERDICT: FAIL
```

## OPEN — rev a58b7f72afc1eb44b37e438a2f8b212c658874e5 (same clone, second worktree)

Command: `node scripts/surface-probe.mjs --checklists` in `…/seats/ExecChecklistTip/open` (exit 1)

```
CHECKLIST  PASS SKILL.md:673 exit=1 expected=0|1 substring=hit — Citation gate verdict
CHECKLIST  PASS SKILL.md:674 exit=0 expected=0 substring=hit — Citation gate hermetic suite
CHECKLIST  PASS SKILL.md:675 exit=0 expected=0 substring=hit — Live sighting-surface conformance
CHECKLIST  PASS SKILL.md:676 exit=0 expected=0 substring=hit — Surface-probe hermetic suite
CHECKLIST  PASS SKILL.md:677 exit=0 expected=0 substring=hit — Round-gate hermetic suite
CHECKLIST  FAIL SKILL.md:678 exit=2 expected=0 substring=miss — Round-close artifact audit
CHECKLIST  FAIL SKILL.md:679 exit=2 expected=0 substring=miss — Filed-report tracking
CHECKLIST  FAIL SKILL.md:680 exit=1 expected=0 substring=miss — Proxy recompute
CHECKLIST  PASS SKILL.md:681 exit=0 expected=0 substring=hit — Proxy-check hermetic suite
CHECKLIST  PASS SKILL.md:682 exit=0 expected=0 substring=hit — Member-claims gate
CHECKLIST  FAIL SKILL.md:683 exit=1 expected=0 substring=miss — Kimi-substrate census
CHECKLIST  PASS SKILL.md:684 exit=0 expected=0 substring=hit — Sources-registry gate
CHECKLIST  PASS SKILL.md:685 exit=0 expected=0 substring=hit — Sources-check hermetic suite
CHECKLIST  PASS SKILL.md:686 exit=0 expected=0 substring=hit — Per-anchor truth burn-down
CHECKLIST  PASS SKILL.md:687 exit=0 expected=0 substring=hit — Anchor-truth hermetic suite
CHECKLIST_SKIPPED: 0
CHECKLIST: 11/15 pass
VERDICT: FAIL
```

The item count moved 15 → 17: the lane added items 16 and 17 (the wave-census pair) in `SKILL.md`
inside the range. Both pass at the tip.

## Failing items at the tip: cause and attribution

**SKILL.md:680 Round-close artifact audit — exit 2 — neither the lane nor the host: a clone-path
artifact.** Its own output: `round-gate: fail-closed — REPORTS_DIR_MISSING: --reports-dir
/fast/scratch/hyaku/kumitate-r41a2/seats/ExecChecklistTip/.ufo/reports is absent`, then
`ROUND_GATE: FAIL-CLOSED (REPORTS_DIR_MISSING) …`. `scripts/round-gate.mjs` derives the reports
directory from the script's own path (`DEFAULT_MAIN_REPO = resolve(HERE,'..','..')`,
`scripts/round-gate.mjs:142-143`, used at `:287-291`), so it looks for `<parent of the repo>/.ufo/reports`.
A scratch clone named `…/seats/<name>/lane` has no fleet root above it, so the item fails closed
at any seat. Measured in a fleet-layout replica (clone nested one level under a root that carries
`.ufo/reports`, same revision) the item passes: `ROUND_GATE: CLEAN (round=40 lane=kumitate
checks=10 errors=0 warnings=1)`, exit 0 — at the tip and at the round open alike.

**SKILL.md:681 Filed-report tracking — exit 2 — neither the lane nor the host: the same
clone-path artifact.** Its own output is the same `REPORTS_DIR_MISSING` fail-closed line
(`--reports-dir …/seats/ExecChecklistTip/.ufo/reports is absent`). Run against the real fleet root
instead of the replica's own root, it passes at both revisions:
`node scripts/round-gate.mjs --tracked --main-repo /home/vgpnk/Projects/shokunin --reports-dir
/home/vgpnk/Projects/shokunin/.ufo/reports` → `ROUND_GATE: CLEAN (mode=tracked checked=23
errors=0 warnings=0)`, exit 0 at `fae386aa` and exit 0 at `a58b7f72`.

**SKILL.md:685 Kimi-substrate census — exit 1 — the host, not the lane.** Its own output:
`CENSUS  error  UNLISTED  locks  locks sits at the root and is not declared by the frozen K1–K5
set`, ending `KIMI_CENSUS: DRIFT (UNLISTED locks)` with `TOTALS: members=52 checked=52 errors=1`.
The undeclared member is `/home/vgpnk/.kimi-code/locks` (directory, mode 700, one child
`sessions/`), created 2026-10-22 13:53:33 -0300 (= 16:53:33Z) — after the round-open census read
CLEAN at 16:00:11Z. `scripts/kimi-census.mjs` was not touched in the range (the range changes only
`scripts/cite-check.mjs` and adds `scripts/wave-census.mjs`), and `locks` is absent from the
frozen member set (`grep -c "'locks'" scripts/kimi-census.mjs` → 0). This is the lesson's open
limit "Live Kimi drift found this round, not caused by the lane"; declaring the member is a K1
registry change for round 42.

## The one failure the lane owned (open run), and its repair inside the range

**SKILL.md:680 Proxy recompute at `a58b7f72` — exit 1 — lane-caused, lane-fixed.** Its own
output: `PROXY  error  C2_TOTAL_DRIFT  C2_total: declared=90 computed=91 delta=+1` and
`PROXY  error  AXES_DRIFT  coverage: ## Axes row=10 derived=9`, ending `PROXY: DRIFT (…)`.
Cause: round 40's closure file `corpus/lessons/round-40-verifier-spotcheck.md` landed without its
`corpus/README.md` row (the lesson's recurrence row, R40-7). The AXES coverage row followed from
it: `coverage = floor(10 × C1/C1_total × C2/C2_total)` = floor(10 × 19/19 × 90/91) = 9 at the
round open. Commit `34fccc1` (inside `a58b7f72..fae386aa`, "plan, frozen counters, open receipts,
R40-7 README row") adds the missing row; measured at `34fccc1`: `PROXY: MATCH (A=8 C=15
operability=8; C1=19/19 C2=91/91 coverage=10; …)`, exit 0. At the tip: `PROXY: MATCH (A=9 C=17
operability=8; C1=19/19 C2=92/92 coverage=10; S=88/88 coverage:script-layer=10; R=92/92
coverage:runtime-layer=10; K=52/52 coverage:kimi-layer=10; pins=6 match; src-rev=31c465f15669)`,
exit 0 — the checklist item passes at the tip.

## Corrected score, and the operability risk this exposes

With the two clone-path artifacts removed, the checklist reads **16/17 at the tip** (only the Kimi
item fails — which is the "16/17 for that item alone" the lesson records) and **13/15 at the round
open** (Kimi plus the lane's own proxy drift). The prescribed-clone numbers are 14/17 and 11/15.

Measured directly, in the fleet-layout replicas with round-gate pointed at the real fleet root
through its own env vars (`KUMITATE_MAIN_REPO=/home/vgpnk/Projects/shokunin`,
`KUMITATE_REPORTS_DIR=/home/vgpnk/Projects/shokunin/.ufo/reports`; `scripts/round-gate.mjs:282-291`),
`node scripts/surface-probe.mjs --checklists` gives at the tip
`CHECKLIST  FAIL SKILL.md:685 exit=1 expected=0 substring=miss — Kimi-substrate census` /
`CHECKLIST: 16/17 pass` / `VERDICT: FAIL` (exit 1), and at the round open
`CHECKLIST  FAIL SKILL.md:680 exit=1 expected=0 substring=miss — Proxy recompute` /
`CHECKLIST  FAIL SKILL.md:683 exit=1 expected=0 substring=miss — Kimi-substrate census` /
`CHECKLIST: 13/15 pass` / `VERDICT: FAIL` (exit 1).

Risk for the operability axis: the checklist is not clone-portable. Any seat that runs
`node scripts/surface-probe.mjs --checklists` from a scratch clone reads two spurious exit-2
failures (`Round-close artifact audit`, `Filed-report tracking`) that have nothing to do with the
lane's bytes. A verify wave that reports `14/17` without naming that cause would read as a lane
regression that is not there; a wave that reads `16/17` needs the fleet root above the clone, or
`--main-repo`/`--reports-dir` pointed at `/home/vgpnk/Projects/shokunin`.

One further observation, advisory only (a warn, not a gate failure): the tip's proxy run prints
`PROXY  warn  PIN_UNPINNED  scripts/wave-census.mjs has no pin.<name> key in the kumitate-proxy-v1
stanza` — the new lane script is unpinned, the same open limit the lesson already records for
`anchor-truth` and `sources-check`. It does not fail any checklist item.

Files written: this report only. No lane file other than `.ufo/waves/round-41/verify/ExecChecklistTip.md`
was modified; the scratch clone and its worktrees are under
`/fast/scratch/hyaku/kumitate-r41a2/seats/ExecChecklistTip/`.
