# K80ScribeKnowledge — round-80 corpus text (drafts, text only)

## Behavior

Drafted the round's corpus text as an **alternate ground** for the two entries the round names, and
proved the id space before proposing ids. Nothing was applied to the lane tree: the drafts, rows, map
lines, captures and receipts all live under this seat's report directory.

- `drafts/knowledge-two-reading-verdicts.md` — Entry A (C1's ground), full `corpus/knowledge/`-shaped
  entry with the provenance trio and a `## Gate` block; grounded on **S236** (GitHub Actions
  `steps.<step_id>.outcome` vs `.conclusion`) and **S237** (GitLab `allow_failure`), both opened by this
  seat, plus the lane's own v2→v3 diff.
- `drafts/knowledge-snapshot-bound-derived-scores.md` — Entry B (C2's ground), full entry; grounded on
  **S234** (Terraform dependency lock, re-opened and quote-matched by this seat) and **S238** (npm
  `package-lock.json`), plus the lane's own O-source diff and observed offline MATCH.
- `drafts/SOURCES-rows.md` — three contract-v1 rows (**S236, S237, S238**), 11 columns, plus the S234
  reuse note.
- `drafts/README-map-rows.md` — two one-line Coverage-map rows (replacement rows for the two existing
  entry paths).
- `COLLISION-CHECK.md` — ids proposed, commands run, observed outputs.
- `captures/` — five HTML captures taken by this seat on 2026-11-04 (the four cited plus one opened but
  not minted).
- `receipts/` — five command receipts (`spotcheck-check.txt`, `proxy-default.txt`, `omp-compare.txt`,
  `receipt-pin.txt`, `collision-check.txt`), each headed by the lane rev and a UTC timestamp.

**Ids proposed: S236, S237, S238.** Collision check (live `corpus/SOURCES.md`, 2026-11-04T09:01:50Z):
high-water mark **S235**, no duplicate ids, `S236|S237|S238` absent from `corpus/` and
`.ufo/waves/round-80/` outside this seat's dir. Full command/output record in `COLLISION-CHECK.md`.

## Gates run (observed, this seat)

| command | observed | exit |
|---|---|---|
| `node scripts/spotcheck-adopt.mjs --check` | `SPOTCHECK_COVERAGE: CLEAN spotchecks=46 uncovered=0` + `MAP: CLEAN` | 0 |
| `OMP_AGENT_ROOT=/nonexistent node scripts/proxy-check.mjs` | `PROXY: MATCH (A=886 C=39 operability=9; C1=19/19 C2=197/197 coverage=10; S=88/88 coverage:script-layer=10; R=92/92 coverage:runtime-layer=10; K=55/55 coverage:kimi-layer=10; O=1/1 O_members=65 O_findings=0 O_bound=35 coverage:omp=10; pins=6 match; src-rev=31c465f15669; source=snapshot)` | 0 |
| `node scripts/omp-census.mjs --compare .ufo/pins/omp-shape.json` | `OMP_SHAPE_COMPARE: IN_SYNC entries=65 receipt=65 added=0 removed=0 changed=0 transient=0` | 0 |
| receipt parse (`node -e`) | `{"contract":"kumitate-omp-shape-v1","entries":65,"sha256":"84e41b9f5167479f2d806686ee702db49d0ebd0a83e6bcb28bd444d50eb0c435","bytes":6716}` | — |
| `grep -n '^pin.omp-shape=' SCORECARD.md` vs `sha256sum .ufo/pins/omp-shape.json` | both `84e41b9f5167479f2d806686ee702db49d0ebd0a83e6bcb28bd444d50eb0c435` | — |

Not run by this seat (measurement seats' receipts, not mine): the frozen counters
`probe80-c1.mjs`/`probe80-c2.mjs`, their base-tree controls, `--selftest` on either tool, and the
`--omp-live` fixture arms. The drafts say so in their Gate blocks.

## Sources opened (every one by this seat, 2026-11-04)

| URL | HTTP | bytes | sha256 | use |
|---|---|---|---|---|
| https://docs.github.com/en/actions/reference/workflows-and-actions/contexts | 200 | 1,017,423 | 4e2c0ffd…9157 | S236 |
| https://docs.gitlab.com/ci/yaml/#allow_failure | 200 | 731,768 | 93f94544…bf27 | S237 |
| https://developer.hashicorp.com/terraform/language/files/dependency-lock | 200 | 312,690 | b155ff6d…b4dd | S234 re-verification |
| https://docs.npmjs.com/cli/v11/configuring-npm/package-lock-json | 200 | 537,925 | 0fa22b19…4d50 | S238 |
| https://pip.pypa.io/en/stable/topics/secure-installs/ | 200 | 40,203 | 441f71e7…2bc45 | opened, **not minted** (two-rows-per-entry cap) |

The pip page's hash-checking text ("This mode uses local hashes, embedded in a requirements.txt file, to
protect against remote tampering and network issues", § Hash-checking Mode, capture line 336) is recorded
here as an alternate for a future round; it is not cited by either entry.

## Touched surfaces

Wrote only: `.ufo/waves/round-80/w1/K80ScribeKnowledge/` (drafts, captures, receipts, collision doc) and
this report `.ufo/waves/round-80/w1/K80ScribeKnowledge.md`. No lane-tree edit, no `corpus/SOURCES.md` or
`corpus/README.md` edit, no git/jj mutation, no commit, no fleet-root write, no PATH write. Scratch
`/fast/scratch/hyaku/kumitate-r80/K80ScribeKnowledge` removed after the captures were copied and their
sha256 re-verified in the report dir.

The lane tree carried **other writers' uncommitted changes** while this seat read it (`corpus/SOURCES.md`,
`corpus/README.md`, both knowledge entries, `SCORECARD.md`, `.ufo/waves/round-80/plan.md`, two pin files
modified; `corpus/lessons/round-80.md` and several `w1/` reports untracked). None of those are this seat's
writes; they are named in `COLLISION-CHECK.md` because they change the id space.

## Findings

1. **Both named entries already landed at `509afb1d`** (commit subject: "corpus increment — two sourced
   knowledge entries (S233/S234)"), with README rows and rows S233/S234. The drafts here are therefore
   alternates, not new entries. Two application options and only one may be taken: keep the applied
   grounds (then **do not** append S236–S238 — they would be `mined` rows with no citing entry), or adopt
   this package (append the three rows, edit the two `source:` lines and the two README rows). See
   `COLLISION-CHECK.md` § What this means.
2. **The committed increment briefly carried two registry rows for one URL.** S233 (committed) and S119
   (pre-existing) are the same Kubernetes probes page. The live working tree removes S233, points
   S117/S119 `used-by` at `two-reading-verdicts.md`, and adds S235 (`clig.dev`, community, **rejected**).
   This is the round's own reference-drift instance, observed in the tree during this seat; it is not
   re-decided here.
3. **Entry A's applied ground is a different-probes source; S236/S237 are a same-check-two-readings
   source.** Kubernetes liveness/readiness are two different probes; GitHub Actions `outcome`/`conclusion`
   are two readings of *the same* step, which is the exact shape the rule governs. Recommendation: the L1
   consider adding S236 alone to the applied entry even if the rest of this package is not taken.
4. **Plan/measurement discrepancy, unresolved:** the plan's C1 after-state names
   `SPOTCHECK_COVERAGE: CLEAN spotchecks=47 uncovered=0`; the observed tip reads **46** (the open receipt
   also read 46, `uncovered=1`). Adoption adds a map row and a pin, not a spotcheck file, so 46 is
   consistent with the open receipt; the plan's 47 is unobserved at `509afb1d` and this seat does not
   resolve it.
5. **S234's row carries no byte count or sha256** (S229/S230 do). This seat's re-open supplies one
   (`b155ff6d…`); recorded as a style variance, not a defect.
6. **Point-in-time readings.** The lane advanced `ed64ddca → 509afb1d` during the seat and the working
   tree was dirty; every receipt is headed by `rev=` and a UTC timestamp.

## Out of scope

Applying the drafts, editing the registry or map, running the frozen counters or their controls,
`--selftest`, committing, and any subagent dispatch. No tool installs or upgrades were needed (curl,
node, git, sha256sum were present); no `pacman` invocation.

## Artifact paths

- `.ufo/waves/round-80/w1/K80ScribeKnowledge.md` (this report)
- `.ufo/waves/round-80/w1/K80ScribeKnowledge/drafts/knowledge-two-reading-verdicts.md`
- `.ufo/waves/round-80/w1/K80ScribeKnowledge/drafts/knowledge-snapshot-bound-derived-scores.md`
- `.ufo/waves/round-80/w1/K80ScribeKnowledge/drafts/SOURCES-rows.md`
- `.ufo/waves/round-80/w1/K80ScribeKnowledge/drafts/README-map-rows.md`
- `.ufo/waves/round-80/w1/K80ScribeKnowledge/COLLISION-CHECK.md`
- `.ufo/waves/round-80/w1/K80ScribeKnowledge/captures/{gha-contexts,gitlab-ci-yaml,terraform-dependency-lock,npm-package-lock,pip-secure-installs}.html`
- `.ufo/waves/round-80/w1/K80ScribeKnowledge/receipts/{spotcheck-check,proxy-default,omp-compare,receipt-pin,collision-check}.txt`
