FIDELITY scripts/collect-omp-native-handoff-lib/policy.mjs anchors=9 ok=0 moved=8 changed=1 gone=0

# C2 anchor re-verification — `scripts/collect-omp-native-handoff-lib/policy.mjs`

Source pin: `/fast/scratch/kumitate-r35/src` (HEAD `31c465f15669f744848bd9f5d56191c5085670f7`).
Base: `964f443e`. Member size: 924 L at base, 942 L at pin (+18). Upstream diff: +29/-11 in
exactly two hunks (`@@ -8,0 +9,2 @@` imports, `@@ -39,4 +41,11 @@` splitRoute block); no other
function in the file changed.

Anchor inventory (both note files): 9 anchors. 1 member-section heading
(`native-trial-launch.md:404`), 1 file-qualified anchor (`:406`), 7 bare `:N` continuation anchors
inside the member's own `##` section (`:407`–`:413`). No `policy.mjs:N-M` range anchors exist.
`remaining-scripts-census.md` carries only member-roster citations (`:39`, `:179`) — no line
anchors — and both remain true at 31c465f1.

## Rows (one per non-ok anchor)

note:line | cited anchor | symbol/claim | status | correct anchor at 31c465f1 | proposed replacement wording
--- | --- | --- | --- | --- | ---
native-trial-launch.md:404 | member heading, `(924 L)` | size 924 L | changed (now 942 L) | whole file `scripts/collect-omp-native-handoff-lib/policy.mjs:1-942` | `## \`scripts/collect-omp-native-handoff-lib/policy.mjs\` (942 L; 924 L at 964f443e) — routes, profiles, round plan — re-anchored at 31c465f1`
native-trial-launch.md:406 | `scripts/collect-omp-native-handoff-lib/policy.mjs:39` | `splitRoute` route parse | moved **and behavior changed** (see below) | `scripts/collect-omp-native-handoff-lib/policy.mjs:66` | `Route parse \`splitRoute\` (\`scripts/collect-omp-native-handoff-lib/policy.mjs:66\`), now delegated to \`parseRoute\` in \`scripts/omp-route-grammar.mjs\` — re-anchored at 31c465f1`
native-trial-launch.md:407 | `:155` | seat-routing mirror `loadSeatRoutingMirror` | moved (+18) | `scripts/collect-omp-native-handoff-lib/policy.mjs:173` | `seat-routing mirror \`loadSeatRoutingMirror\` (\`:173\`; 964f443e \`:155\`) + — re-anchored at 31c465f1`
native-trial-launch.md:408 | `:283` | `verifyLaunchSeatRouting` | moved (+18) | `scripts/collect-omp-native-handoff-lib/policy.mjs:301` | `\`verifyLaunchSeatRouting\` (\`:301\`; 964f443e \`:283\`) — re-anchored at 31c465f1`
native-trial-launch.md:409 | `:619` | profile resolve `resolveNativeProfile` | moved (+18) | `scripts/collect-omp-native-handoff-lib/policy.mjs:637` | `profile resolve \`resolveNativeProfile\` (\`:637\`; 964f443e \`:619\`) — re-anchored at 31c465f1`
native-trial-launch.md:410 | `:704` | round plan `readRoundPlan` | moved (+18) | `scripts/collect-omp-native-handoff-lib/policy.mjs:722` | `round plan \`readRoundPlan\` (\`:722\`; 964f443e \`:704\`) — re-anchored at 31c465f1`
native-trial-launch.md:411 | `:780` | wave token `waveTokenFromContext` | moved (+18) | `scripts/collect-omp-native-handoff-lib/policy.mjs:798` | `wave token \`waveTokenFromContext\` (\`:798\`; 964f443e \`:780\`) — re-anchored at 31c465f1`
native-trial-launch.md:412 | `:879` | directive load `loadCanonicalDirective` | moved (+18) | `scripts/collect-omp-native-handoff-lib/policy.mjs:897` | `directive load \`loadCanonicalDirective\` (\`:897\`; 964f443e \`:879\`) — re-anchored at 31c465f1`
native-trial-launch.md:413 | `:908` | rate card `parseRateCard` | moved (+18) | `scripts/collect-omp-native-handoff-lib/policy.mjs:926` | `rate card \`parseRateCard\` (\`:926\`; 964f443e \`:908\`) — re-anchored at 31c465f1`

Counter note: `splitRoute` is both moved (39 → 66) and behaviorally changed; it is counted under
`moved` to keep the arithmetic (9 = 0 ok + 8 moved + 1 changed + 0 gone). The lone `changed`
count is the heading size.

## Behavior change carried by the diff (flag even if the row were re-anchored)

- Base `splitRoute` (964f443e:39-47) was a lenient split: any string containing `/`, provider =
  text before first `/`, optional trailing `:low|medium|max|xhigh|high` stripped; only empty
  provider/model died.
- Pin `splitRoute` (31c465f1:66) returns `parseRoute(route, { allowEffortless: true })` from
  `scripts/omp-route-grammar.mjs:88`, which enforces `ROUTE_COMPONENT_PATTERN` on the provider and
  on every `/`-separated model component, refuses `.`/`..` traversal, and treats a trailing colon
  segment as effort only if whitelisted. On `RouteGrammarError` it dies with
  `invalid route <text>` — unless `containsSensitiveShape(text)`
  (`scripts/ufo-credential-screen.mjs:62`) holds, in which case the legacy lenient shape is
  returned by `lenientSensitiveSplit` (policy.mjs:42-56), with `requested: route` verbatim.
- Consequence: a route such as `provider/org/model:free` (non-whitelisted colon suffix) parsed at
  base and now dies at the pin unless it is credential-shaped. `splitRoute` callers that consume
  *observed* routes — `evidence.mjs:347,385,391,395,404,746,1060`,
  `collect-omp-native-handoff.mjs:1516,1575` — can therefore now throw where they previously
  parsed. [INFERENCE] from reading call sites; not executed.
- No other described behavior was removed: `routes, profiles, round plan` still describes the
  file, and the five `Symbols:` names (policy.mjs:414-415) all still exist (15 exports at both
  revisions).

## Non-anchor citations (checked, still correct)

- `remaining-scripts-census.md:39` — `scripts/collect-omp-native-handoff-lib/policy.mjs` in the
  member heredoc: still a live member at 31c465f1.
- `remaining-scripts-census.md:179` — "`collect-omp-native-handoff-lib/` 5": the lib still holds
  exactly 5 files at 31c465f1 (`base.mjs`, `events.mjs`, `evidence.mjs`, `policy.mjs`,
  `screening.mjs`); both top-level members also survive. Note this note's commands still point at
  `/home/vgpnk/Projects/ufo-fsd-alpha` pinned to `964f443e` — parent-level census concern, not an
  anchor fault here.

## Observed facts vs inference

Observed (commands below): symbol line map at both revisions; all 8 cited line numbers land on
`export function <name>` at 964f443e and on unrelated body/blank lines at 31c465f1; diff hunk set;
file sizes; export counts; `parseRoute` body and return contract
(`{requested, provider, model, effort, resolved}`); membership of the lib directory at both revs.
[INFERENCE]: runtime impact on the call sites listed above (static reading only).

## Commands run (with key output)

```
git -C /fast/scratch/kumitate-r35/src rev-parse HEAD
  -> 31c465f15669f744848bd9f5d56191c5085670f7
git show <rev>:scripts/collect-omp-native-handoff-lib/policy.mjs | wc -l
  -> 924 (964f443e) / 942 (31c465f1)
git show 964f443e:...policy.mjs | grep -nE '^export function (splitRoute|loadSeatRoutingMirror|...'
  -> 39,155,283,619,704,780,879,908   (all exact matches)
git show 31c465f1:...policy.mjs | grep -nE same
  -> 66,173,301,637,722,798,897,926
git show 31c465f1:...policy.mjs | sed -n '39p;155p;283p;619p;704p;780p;879p;908p'
  -> blank / "    });" / "      requested: seat.requested," / "    herdWindowMs: ..." /
     "  if (typeof criterion.value !== ..." / "  }" / "  };" / "      die(`godspeed directive ..."
git -C ... diff 964f443e 31c465f1 --unified=0 -- scripts/collect-omp-native-handoff-lib/policy.mjs | grep '^@@'
  -> @@ -8,0 +9,2 @@ ; @@ -39,4 +41,11 @@ ; @@ -44 +52,0 @@ ; @@ -46 +54 @@ ; @@ -48,2 +56 @@ ;
     @@ -51 +58 @@ ; @@ -54,2 +61,2 @@ ; @@ -58,0 +66,11 @@
git show 31c465f1:scripts/omp-route-grammar.mjs | sed -n '88,135p'
  -> parseRoute body: shape/effort/charset checks, returns {requested, provider, model, effort, resolved}
git show 31c465f1:scripts/ufo-credential-screen.mjs | grep -n 'export function containsSensitiveShape'
  -> 62
git ls-tree --name-only 31c465f1 scripts/collect-omp-native-handoff-lib/  -> 5 files (unchanged set)
git grep -n splitRoute 31c465f1 -- scripts  -> callers listed above
grep -n 'policy\.mjs' corpus/knowledge/native-trial-launch.md corpus/knowledge/remaining-scripts-census.md
  -> native-trial-launch.md:404,406 ; remaining-scripts-census.md:39
```

## Remaining unknowns

- Whether the launcher/compile gate upstream now guarantees grammar-clean routes before they reach
  `splitRoute` (would neutralize the caller-throw risk). Not exercised: no builds/tests per lane
  bounds.
- Whether other notes outside the two assigned files cite this member at old line numbers — not
  surveyed (out of scope).

Tooling: none installed or upgraded. Read-only: no notes, lane files, or repo state modified; the
only write is this report.
