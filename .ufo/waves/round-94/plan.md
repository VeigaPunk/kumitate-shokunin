# kumitate round 94 — plan (frozen before any seat runs)

Lane base `a6e4da96e828e900150c08d0a801266a53caab63` (r93 closure spot-check tip). Fleet pin for
filed reports `87de49a6cb15d3ff15b0ba85a6f32f2671a23d1a`. Origin `ufo-fsd-alpha` HEAD
`fb7157fcf14625be9d0b91bdd425a4b3212e4194` (read-only object probes only). L1 = `KumitateR94`
(holds the §3 planner seat; the validator refuses `planner`).

Load done: MISSION.md, AXES.md (lowest-axis rule, capabilities, stagnation nudge), PROTOCOL addendum §6
(run-15 + amendments 1–47; Amendment 46: kumitate fresh start at r92, r93 closed `ok` C1 verified),
SCORECARD `## Round 94 pre-registration (written by round 93)`, `corpus/lessons/round-93.md`,
`corpus/lessons/round-93-verifier-spotcheck.md` (5 routed defects).

## Axes (named)

Lane axes: operability (9, terminal `f_O`) and the coverage sub-axes (script/runtime/kimi/omp, all 10).
Lowest non-retired axis: **operability**. This round declares ONE claim on it. Every coverage row is a
harm surface (must stay 10, `PROXY: MATCH`, `README_MAP: CLEAN`).

## C1 — operability: `round-gate` resolves SOURCES-declared upstream commit pins

Routed defect (r93 spot-check §5 item 2, report erratum): the gate's citation scan resolves a backticked
hex token in lane → main → origin and otherwise reports `COMMIT_CITED_UNRESOLVED`. An upstream pin the
lane itself declares in its own registry (S267–S269 cite oh-my-pi at `79fa222e…`) therefore reads as a
lane error: `node scripts/round-gate.mjs --round 93` → `DRIFT … unresolved=2 [79fa222e 79fa222e8390…]`
exit 1 (`open/round-gate-r93-before.txt`). The other seven red rounds (12, 46, 53, 57, 61, 62, 63) cite
tokens that are NOT in the registry (typos, stale shorts, unrecorded upstreams) — those reds are real and
must stay red.

**Rule (the claim's after-state, frozen).** A cited token that resolves in no probeable repo is
`declared` (never a finding; listed in `--json` `citations.declared`) iff it is a prefix of a 40-hex
string that is a complete path segment — the URL split on `/`, `?`, `#` — of an `http(s)://` URL on a
`corpus/SOURCES.md` registry row (`^ {0,3}\|\s*S\d{3,}\s*\|`) whose status cell (8th column) is not
`rejected`. No SOURCES.md → no declared pins. Everything else is unchanged.

Sourced: the rule rests on rows opened this round (git's object-name abbreviation = a unique leading
substring; GitHub permalinks carry the commit id as a path segment) — S-ids assigned at integration.

**Frozen counter** `probe/probe94-c1.mjs` (this commit), run as

    node .ufo/waves/round-94/probe/probe94-c1.mjs --tool <round-gate bytes> --work <scratch> --freeze <FREEZE>

with `<FREEZE>` = the commit that adds this plan, `--tool` = `git show <M>:scripts/round-gate.mjs` at
the integration commit M. **Frozen predicate `C94_C1: HELD`** iff (a) FIX round 93 green with both
tokens in `citations.declared`; (b) KEEP rounds 12 46 53 57 61 62 63 keep the exact BASE unresolved sets
and stay red; (c) NO-REG all 77 filed reports: (id, ok) vectors and exit codes equal BASE except round
93's citation check, `declared` empty elsewhere; (d) FIXTURE synthetic registry: declared exactly
{url8, full, commitfrag}, unresolved exactly {digest, prose, rejected, mid, none}; no-SOURCES fixture
all 8 unresolved, DRIFT, no INTERNAL_ERROR; (e) candidate `--selftest` exit 0 `VERDICT: PASS`.
Counter text = same sentence; receipt label `C94_C1: HELD|UNMET`.

**Pre-data controls** (`controls/`, built by `probe/make-controls94.py` from BASE bytes, run against
`--freeze a6e4da96`, whose round-gate, SOURCES, SCORECARD and LOG equal the freeze commit's):

| control | what it does | verdict |
|---|---|---|
| ctl-nothing | BASE bytes (do-nothing) | UNMET a=0 |
| ctl-blanket | every unresolvable token declared | UNMET b=0/7 c=70/77 d=0/2 e=0 |
| ctl-substring | token anywhere in SOURCES.md | UNMET d=1/2 |
| ctl-anyline | URL segments on any line, any status | UNMET d=1/2 |
| ctl-contains | segment contains token (not prefix) | UNMET d=1/2 |
| ctl-norejfilter | rejected rows count | UNMET d=1/2 |
| ctl-slashonly | split on `/` only (a `#fragment` hides the pin) | UNMET d=1/2 |
| ctl-positive | L1 reference rule (no new selftest arms) | **HELD** 1/1 7/7 77/77 2/2 1/1 |

Disclosed limit: on the real reports only the do-nothing and blanket controls are separated; the five
rule-precision forgeries are separated by the synthetic fixture (d) alone.

**Kill rules (frozen).** K1: counter at M prints anything but `C94_C1: HELD` → C1 UNMET (honest stop, no
re-target). K2: the shipped selftest passes on any of the six forgery-control rule shapes applied to the
shipped code (mutation-tester seat; a surviving rule-shape mutant is a selftest defect routed AND the
claim reports it — it does not flip the counter verdict, which is frozen). K3: harm — any of
`node scripts/proxy-check.mjs` (after the `pin.round-gate` re-pin), `readme-map`, `sources-check`,
`counter-pins`, `spotcheck-adopt --check`, `round-gate --tracked`, the census validate, reads worse at M
than at base → harm, C1 not admitted. K4: plan/probe/controls bytes change after this freeze → claim void.

## Frontier step (§2b, inside the cap)

SOURCES rows opened this round: the rule's two grounding sources + the r93 routed M93-2 row
(`retry-fallback-chains.ts` at `79fa222e…`). Mistake mined: the r93 report erratum class (a gate red
filed as a known erratum instead of being repaired the same round) and/or seat findings. considerthese:
mine ≤1 proposal if one fits; else one report line. Assimilation: none (no theme fits a gate repair).

## Wave w1 (one v1 wave, 11 seats; attack = reviewer + critic×2 + mutation-tester = 4/11 = 36 %)

executor×2 (candidate tool + selftest arms; harm battery), scribe×2 (sources rows; lesson/knowledge
draft), scout×1 (open grounding sources), connector×1 (sibling overlap), sentinel×1 (regex/ReDoS + path
safety of the SOURCES read), reviewer×1, critic×2 (counter forgeries; claim/scope attack),
mutation-tester×1 (K2). Routed, not this round: M93-3 counter repair (frozen r93 artefact), M93-5
`--close` probe-receipt requirement (plan naming varies across r85–r93, no stable predicate marker),
R93-D1 seat-route human-mode redaction, F93 fixtures.
