VERDICT: All four documentation drafts are written and each was checked against the frozen expression that will grade it (checklist grammar, T7 predicate, readme-map row grammar); three committed-bytes defects in the target files and two contradictions between sibling wave-1 drafts are reported, not patched.

## Evidence

Lane at `b38a2065ab8ac5b198f6569b9013d04411c3d40d`; `git status --porcelain` showed no modified
tracked file, so `SKILL.md`, `PROVINCE.md`, `corpus/README.md` read here are committed bytes. Targets:
`SKILL.md:587-800` (registry table `:599-626`, last row `:626`; checklist `:678-726`, last item `:725`),
`PROVINCE.md:17-22`, `corpus/README.md:12-185` (last map row) and `:277-281`.

```
$ grep -c '^- \[ \] ' SKILL.md                                   → 30
$ awk '/<!-- kumitate-proxy-v1/,/kumitate-proxy-v1 -->/' SCORECARD.md | grep '^C='  → C=30   (A=117)
$ git ls-tree -r --name-only b38a2065 -- .ufo/waves/round-63/controls/inline | wc -l → 164 (14 case dirs)
$ grep -c '^| S' corpus/SOURCES.md                               → 134   (last row S195)
$ grep -c 'S130\|S132' corpus/SOURCES.md                         → 0
```

Grammar + arithmetic, run on the committed `SKILL.md` and on my two candidate item shapes
(`node /tmp/kumitate-r63/K63ScribeSkillProvince/{grammar,all}.mjs`):

```
items counted by RE_CHECKLIST = 30
LAST ITEM PARSES: false
DRAFT1 PARSES: true cmd=node scripts/inline-dispatch-evidence.mjs --selftest exits=0 expect=INLINE_DISPATCH_SELFTEST: PASS
DRAFT2 PARSES: false
A=117 C=30 -> 9  C=31 -> 9  C=32 -> 9
items = 30 unparsable = 1
  item 30: - [ ] Round dispatch-evidence gate (round 60; contract `kumitate-dispa…
```

Draft-row cost under `cite-check` (minimal pair: scratch copies of the committed `SKILL.md`, one with
the D1 row appended; `--self` each, default `--src`):

```
== a ==  CITE_CHECK: DRIFT (files=1 tokens=274 errors=133 warnings=2)   VERDICT: FAIL
== b ==  CITE_CHECK: DRIFT (files=1 tokens=276 errors=134 warnings=2)   VERDICT: FAIL
added: {"token":"scripts/inline-dispatch-evidence.mjs","class":"source","kind":"UNRESOLVED","severity":"error",
        "message":"scripts/inline-dispatch-evidence.mjs not found under src (exact or suffix)"}
```

The gate the registry row documents, one run on the uncommitted build file (not rerun):

```
$ sha256sum scripts/inline-dispatch-evidence.mjs
fdd883927baa136afb4672474dc39eb0e524d5351fed26bfe6934bd05b7d2bfd
$ node scripts/inline-dispatch-evidence.mjs --selftest | tail -1
INLINE_DISPATCH_SELFTEST: PASS (25/25)        (exit 0)
```

D3/D4 checked on the strings actually written in `drafts.md` (`check2.mjs`): T7 predicate `true`;
readme-map row grammar `true knowledge/multi-agent-coordinator-topologies.md`; 3 cells; README frontier
bullet names the entry.

## Findings

**K63ScribeSkillProvince-1 — HIGH — the round-60 checklist item cannot be executed by the checklist
runner, and the item shape the sibling draft proposes for round 63 inherits the defect.**
`scripts/surface-probe.mjs:278` freezes a single-command, `$`-anchored grammar; `SKILL.md:725` carries
two commands joined by `, and`, so it parses as `malformed` (`surface-probe.mjs:1056-1062` →
`CHECKLIST  ERROR  SKILL.md:725 grammar (…)`, `failed: true`) and `--checklists` cannot read PASS.
Any new item written in that style fails the same way (measured: DRAFT2 above).
Reproduce: `node /tmp/kumitate-r63/K63ScribeSkillProvince/all.mjs`.

**K63ScribeSkillProvince-2 — HIGH — two steps of the sibling integration draft contradict each other
and one of them would open the round in `C_DRIFT`.** `build/K63ConnIntegrationMap/integration-checklist.md`
step 2 states "`C=30` … unchanged" while step 5 adds a `- [ ]` item; `C` is
`countLines(skillText, /^\s*- \[/)` (`scripts/proxy-check.mjs:503,943`), so the item moves `C` 30 → 31
and the stanza must become `C=31` (`C_DRIFT`, `proxy-check.mjs:559-566`) or `PROXY: DRIFT` exit 1.
The score does not move (`operabilityOf`, `proxy-check.mjs:740-742`: 147/150 → 9, 148/151 → 9).
Reproduce: `grep -c '^- \[ \] ' SKILL.md` and the arithmetic above.

**K63ScribeSkillProvince-3 — MEDIUM — the S196/S197 → document assignment is swapped between two
wave-1 drafts.** `integration-checklist.md` step 7 binds `S196` to
`.ufo/waves/round-63/build/K63Capture/arxiv-2512.08296v3.html` and `S197` to
`…/bailian-managed-agents-multiagent.md`; `w1/K63ScoutBailianOpen.md:147-150` states the opposite
("`S196` for this page", the Bailian page). T5 fetches the URL from the row's `source` cell
(`topology63-probe.mjs:167-183`), so a swap fails four quotes. The staged entry also still opens on
`source: S200` / `S202` (`.ufo/waves/round-63/…`, staged copy under
`/home/vgpnk/Projects/shokuknow/merge/kumitate/knowledge/corpus/knowledge/multi-agent-coordinator-topologies.md:2-3`),
ids that do not exist in this lane's registry. Reported verbatim; my drafts cite `S196/S197` without
asserting which document each is.

**K63ScribeSkillProvince-4 — MEDIUM — `CITE_CHECK` is red at the base revision, and every new gate row
adds one error of the same class.** The plan names two live defects (proxy-check, readme-map);
measured at base: `node scripts/cite-check.mjs` → `CITE_CHECK: DRIFT (files=155 tokens=11547
errors=1136 warnings=635)` exit 1. The D1 row adds exactly one `UNRESOLVED` (`133 → 134` on a
`SKILL.md`-only scan) because lane-local `scripts/*.mjs` names resolve against the origin tree, which
does not hold them. This is a carried class, not something the draft can avoid without dropping the
column style; no claim in this report says the doc additions are cite-clean.

**K63ScribeSkillProvince-5 — LOW — three stale numerals around the two sections being edited.**
`SKILL.md:589` "Twenty are gates" (20 gate rows today, 21 after D1), `:593` "Verdict map for all
twenty" (→ twenty-one), `:596` "all nineteen" (already stale), `:680` "Twenty-six items" while 30
items exist (31 after D2). Only the first two are this round's edits; the other two are flagged so the
L1 does not mistake them for drafting errors.

**K63ScribeSkillProvince-6 — LOW/MEDIUM — the C2 flip cites ids this lane does not hold.**
`corpus/lessons/round-60.md:39-41` sets the flip as "re-opens S130 and S132"; neither id is a row in
`corpus/SOURCES.md` (`grep -c` → 0). The flip is satisfiable only as a package-document re-open, so
the round-63 lesson should name the package ids it re-opened; the PROVINCE bullet I drafted cites
`S196/S197` (the plan's adopted ids) and not `S130/S132`.

## Artifacts

- `.ufo/waves/round-63/build/K63ScribeSkillProvince/drafts.md` — D1 registry row (+ the three prose
  edits and the insertion point), D2 checklist item (+ the exact `C` consequence and the mandatory
  stanza edit), D3 `PROVINCE.md` Frontier bullet, D4 `corpus/README.md` coverage-map row and Frontier
  bullet, each with a fact-source list and a `{{L1:…}}` roll-up (6 items).
- Scratch (not committed): `/tmp/kumitate-r63/K63ScribeSkillProvince/{grammar.mjs,all.mjs,check2.mjs,cite.json,ck/}`.
- No edit to `SKILL.md`, `PROVINCE.md`, `corpus/README.md`, `SCORECARD.md`, `scripts/`, `.ufo/pins/`
  or any git state; nothing installed or upgraded (no tool needed).

## Limits

- The gate's finding list, usage string and 25-case count come from the **uncommitted** build file
  `scripts/inline-dispatch-evidence.mjs` (sha256 `fdd88392…`); if it changes before commit the row
  must be re-read. I ran its `--selftest` once and did not rerun it.
- I did not run `node scripts/surface-probe.mjs --checklists` (it spawns all 30 items, ≤120 s each);
  finding 1 is a parse-level measurement on the same regex the runner uses, not a full-list run. I did
  not run `topology63-probe.mjs`/`inline63-probe.mjs` (their subjects do not exist yet at any
  revision): T7/readme-map were checked by replicating their expressions on my draft strings.
- I did not verify the live URLs or the capture contents; the vendor name/URL and the arXiv title stay
  `{{L1:…}}` because the captures are uncommitted build-tree facts. I did not adjudicate
  `CITE_CHECK`'s 1136 base errors (pre-existing, outside this seat's scope).
