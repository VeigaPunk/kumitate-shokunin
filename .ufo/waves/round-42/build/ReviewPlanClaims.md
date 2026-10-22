RESULT ReviewPlanClaims rev=b237e3f09c9559e130c7367bd2efa981c4ea516f verdict=usable defects=6

Scope: `.ufo/waves/round-42/plan.md` vs AXES.md and prompt §2/§6 item 9 — distinct
axes, causal separability, lowest-axis rule, one-concrete-value after-states
re-derivable over committed bytes, no universal clauses, capability-row rule.
Reviewed bytes are the amended plan: HEAD is a0a07ba ("plan amendments A1-A4 …
base repair"), the pinned plan commit b237e3f carried the pre-amendment file
(working blob 501236e2 == a0a07ba blob, != b237e3f blob 4b8cee57).

Checks that pass:

- Distinct axes: C1 operability, C2 coverage:kimi-layer — two different live
  `## Axes` rows (coverage itself retired; kimi-layer is a declared successor).
- Lowest-axis: `## Axes` at dfabe92 = operability 8, coverage 10 (retired),
  script-layer 10, runtime-layer 10, kimi-layer 10 → operability is the lowest
  non-retired axis and C1 works it. Saturation line 9, window N=3
  (SCORECARD.md:1689-1690); nudge correctly inactive (operability 8 < 9).
- Causal separability: C1 terms {A,C,operability} never read K terms; C2's never
  read A/C; shared SCORECARD edits are per key (stanza pins + declared terms).
- C1 arithmetic verified in code: operability = floor(10x(A+C)/(A+C+3))
  (proxy-check.mjs:713-715): (10+19)/(32) = 0.906 -> 9; coverage_kimi =
  floor(10 x C1k/C1k_total x K_sections/K_members) (:158): 53/53 holds 10.
- Capability-row rule: rows measured 2 at dfabe92 (awk counter), row enters the
  same round with the demonstration declared (gate CLEAN + --selftest PASS);
  claim type recorded. Frozen counters exist: 16 cite ids +
  a2-census-{repair,survivor,findings,exits} = 3+10+10+2 = 25 ids.
- Universal clauses: "each of the 41 frozen ids printing killed" is backstopped
  by the gate enumerating every mutant line (A1: frozen=<k>/41, exit 2 if one
  missing), so the full set is enumerated by the counting command. A1's kill
  rule matches the Stryker vocabulary in my context; 40 distinct mutations
  disclosed. 2 claims = prompt preference.

Defects (exact sentence -> fix):

D1 (moderate) — C2's after-state is not re-derivable over committed bytes.
  Sentence: "Counting command: `node scripts/kimi-census.mjs; echo exit=$?` plus
  `node scripts/proxy-check.mjs --src … --json | jq -c '.terms | {K_members,
  K_sections, coverage_kimi}'`" and "`K_members` 52 → 53". proxy-check.mjs:37-44
  states K_members "is read LIVE from the kimi root"; census reads
  KIMI_ROOT=/home/vgpnk/.kimi-code (open receipts). Both commands gate live host
  state; a later unlisted root child flips them to exit 1 with the claim intact.
  The plan's drift sentence only covers "before the measurement".
  Fix: declare the committed-bytes core as the re-derivable value (stanza
  K_members=53, K_MEMBER_RULES naming `locks`, the `## ~/.kimi-code/locks`
  heading in kimi-session-state.md) and demote the live census run to a
  timestamped receipt — extend A2's identity receipt with census output plus a
  host-root digest — and state in the plan/report that re-derivation is
  live-state-gated by design.

D2 (minor-moderate) — A2's added acceptance can silently break C1's C=19.
  Sentence (A2): "Added acceptance: … `node scripts/sources-check.mjs` reads
  CLEAN". C counts every `^\s*- \[` line in SKILL.md (proxy-check.mjs:96);
  SKILL.md already carries the sources-gate items (items 12-13). If the executor
  naturalizes this acceptance as a new task line, C=20 and C1's declared
  `{A:10,C:19,operability:9}` fails (operability integer still 9, but the
  declared value cannot be narrowed after landing).
  Fix: one sentence in A2 — the acceptance adds no SKILL task line; it verifies
  through existing items 12-13 plus the report command.

D3 (minor) — A-walk hygiene unstated. Sentence: "After at the measured commit:
  `{"A":10,"C":19,"operability":9}`". A counts every `*.mjs|*.js|*.sh|*.py`
  under --self except .git (proxy-check.mjs:94-95) — a seat-written helper
  anywhere (e.g. .ufo/waves/round-42/probe/x.mjs) moves A past 10 and the proxy
  reads A_DRIFT, breaking "the proxy reads MATCH". Round 41's counters were
  deliberately `.mjs.txt`. Walk right now = 9, all under scripts/ — not yet fired.
  Fix: plan sentence — no new runnable-suffix file outside
  `scripts/gate-mutants.mjs` lands this round; probes use a `.txt` suffix.

D4 (minor) — R41-3 extras <-> exit-0 coupling unstated. Sentence: "with the
  R41-3 skip-bypass mutants in the manifest, `--rev dfabe92…` exits 1 (they
  survive at open bytes)". If R41-3 is explain-routed instead of fixed, the
  same extras at the measured commit read SURVIVED -> exit 1 -> C1's after-state
  unlandable.
  Fix: state the dependency — the extras stay in the manifest only when the
  R41-3 selftest fix lands (they then die at measured bytes); otherwise they are
  dropped and the red-before stands as a one-off `--rev` demonstration.

D5 (minor) — A2 omits the SCORECARD registry-row edit for the gaining family.
  A2 names kimi-census.mjs, proxy-check.mjs K_MEMBER_RULES, the knowledge
  section, the SOURCES row and the receipt — but the "In-scope surface
  registry" K3 row (SCORECARD.md:145, 9 members, no `locks`) must also gain
  `~/.kimi-code/locks` (9 -> 10); the r41 `## Planned` row (SCORECARD ~:1834)
  pre-registered `locks` "in K1", so A2's K3 choice is a recorded deviation that
  needs the registry cell of whichever family takes it. No gate fails on a stale
  K cell (claims-check grades `^\| (S|R)\d+` rows only; K_sections binds against
  K_MEMBER_RULES identities), but the registry is the truth table the Axes row
  cites.
  Fix: add "the K-row Members cell for `locks` (A2: K3) gains the member" to A2.

D6 (minor) — "at the measured commit" runs on the working copy with no
  clean-tree gate stated. proxy-check has no --rev; all counting commands read
  the live checkout. The tree is dirty right now (SCORECARD.md,
  scripts/anchor-truth.mjs, scripts/proxy-check.mjs modified; build/ untracked),
  so a mid-flight measurement re-derives values the cited commit does not hold.
  Fix: plan sentence — the counting commands run only on a clean tree at the
  measured revision (jj state tracked=0 untracked=0), or --self a scratch clone.

Found at b237e3f, already repaired before any counted run (not counted above):

F1 — "the `## Axes` operability row moves 8 → 9 in the same commit so the proxy
  reads MATCH" was unachievable at the pinned plan commit: the open base was
  already PROXY: DRIFT — C2_total declared 92 vs computed 93 (the
  closure-authored lessons/round-41-verifier-spotcheck.md had no README row;
  measured rows=92 files=93 at b237e3f) and coverage derived 9 vs row 10.
  Amendment A3 + commit a0a07ba repaired it (README row; stanza C2=C2_total=93).

F2 — "C2 touches `scripts/kimi-census.mjs` and one knowledge section" omitted
  scripts/proxy-check.mjs: the frozen K_MEMBER_RULES are re-derived inside
  proxy-check (K1 4, K2 live+2, K3 9, K4 9, K5 3; header :133-146), so K_members
  stays 52 without that edit -> K_MEMBERS_DRIFT and C2's own terms command fails.
  Amendment A2 names proxy-check.mjs K_MEMBER_RULES explicitly.

Evidence commands (all run read-only against the lane):
  git rev-parse HEAD -> a0a07bae9236311314f12e3cec8d3666049d0dbc
  git log --oneline dfabe92..HEAD -> b237e3f (plan+receipts), a0a07ba (A1-A4 +
    README row + stanza C2=C2_total=93)
  git show dfabe92:SCORECARD.md | awk '/^## Capabilities/… /^\| `/' | wc -l -> 2
  git show dfabe92:SCORECARD.md (## Axes rows) -> operability 8; coverage 10
    retired; coverage:script-layer/runtime-layer/kimi-layer 10
  SCORECARD.md:1689-1690 -> saturation line 9 on every live axis; window N=3
  open receipts -> {"A":9,"C":17,"operability":8,"K_members":52,
    "K_sections":52,"coverage_kimi":10}; KIMI_CENSUS: DRIFT (UNLISTED locks)
    exit 1; grep -c '^\s*- \[' SKILL.md -> 17; 9 scripts/*.mjs
  proxy-check.mjs:94-96,158,713-715,37-44,133-146 -> A/C definitions,
    coverage_kimi formula, floor scores, K_members live, frozen K rules
  b237e3f -> README map rows 92 vs corpus files 93 (drift live); spotcheck row
    absent; a0a07ba adds it
  working tree now -> A walk = 9 all under scripts/, C = 17; dirty:
    SCORECARD.md, scripts/anchor-truth.mjs, scripts/proxy-check.mjs, build/ dir
  SCORECARD.md:145 -> K3 registry cell lists 9 members, no `locks`;
    ~:1834 -> r41 `## Planned` pre-registered `locks` "in K1"

Residual risk: gate-mutants.mjs does not exist yet (wave 1 is building it), so
all after-values are verified for arithmetic/formula and inventory consistency,
not by execution. C2's source for what creates `locks/` (the A2 K3 choice) was
not re-opened here; the K1->K3 deviation rests on A2's citation of it. --strict
warnings will read 4 (anchor-truth, sources-check, wave-census, gate-mutants)
until A4's pin block lands; counted, not claimed, and warnings are not terms.

No tool installs or updates. Verification gap: none re-runnable now — the
gate does not yet exist; every other check above was executed, not inferred.
