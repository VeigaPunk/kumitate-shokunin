source: S236 — GitHub Actions, *Contexts* (`steps.<step_id>.outcome` / `.conclusion`) (https://docs.github.com/en/actions/reference/workflows-and-actions/contexts, opened 2026-11-04); S237 — GitLab, *CI/CD YAML reference — `allow_failure`* (https://docs.gitlab.com/ci/yaml/#allow_failure, opened 2026-11-04); own-work — `scripts/spotcheck-adopt.mjs` v2→v3 diff `1968689f..6d03402f`, `.ufo/waves/round-80/probe/probe80-c1.mjs`
verified-at: 2026-11-04, lane tip `509afb1d` (live tree) — `node scripts/spotcheck-adopt.mjs --check` reads `SPOTCHECK_COVERAGE: CLEAN spotchecks=46 uncovered=0` + `MAP: CLEAN`, exit 0 (`.ufo/waves/round-80/w1/K80ScribeKnowledge/receipts/spotcheck-check.txt`)
recheck: `node scripts/spotcheck-adopt.mjs --check` and `node .ufo/waves/round-80/probe/probe80-c1.mjs --set c1` at the next lane tip; re-open S236 if the steps-context table drops `outcome`/`conclusion` (cadence 180d)

# Two-reading verdicts — one tool, one verdict per surface

## The rule

When one tool answers a question about surface A and also reads surface B, it MUST report **one verdict
line per surface** and MUST make its exit code the verdict of the surface whose question it owns. The
other surface's reading is disclosed on its own line and never folded into the owned verdict.

A writer that changes A MUST validate **its own delta** against the child oracle: the target it wrote now
resolves, and every finding not about that target is byte-identical to the pre-write set. It MUST NOT
require the whole of B to be clean before writing A.

## Why (the source)

Both CI platforms keep a check's own verdict and the surrounding aggregate as two readings, and neither
overwrites the other.

GitHub Actions gives one step two properties: `steps.<step_id>.outcome` is "The result of a completed step
before continue-on-error is applied" and `steps.<step_id>.conclusion` is the result after it is applied.
The documentation states the split outright: "When a continue-on-error step fails, the outcome is failure,
but the final conclusion is success." (S236, steps-context table, `steps.<step_id>.conclusion` row). The
aggregate can therefore be green while the check's own verdict stays red — and both remain readable.

GitLab CI does the same at job scope: "Use allow_failure to determine whether a pipeline should continue
running when a job fails." (S237, § allow_failure). A job with `allow_failure: true` keeps its failed
status and is shown with a warning while the pipeline continues, so the job's own verdict is not rewritten
by the pipeline verdict.

The lane's defect was the same structure read backwards: the aggregate (the README map) went red for a
reason unrelated to the owned question (the spotcheck set), and that red replaced the owned verdict and
refused the writer. The platform rule is the invariant both directions: **the owned verdict is never
derived from, and never suppressed by, the other surface's state.**

## The lane's instance (v2 → v3)

`scripts/spotcheck-adopt.mjs` v2 returned one folded line and gated on it:

```js
return { exit: result.clean ? 0 : 1, lines: [result.clean
  ? `SPOTCHECK_MAP: CLEAN spotchecks=${paths.length} uncovered=0`
  : `SPOTCHECK_MAP: DRIFT spotchecks=${paths.length} uncovered=${uncovered.length} first=${uncovered[0] || 'oracle'}`] };
```

On a fixture whose spotcheck set was green and whose map was red for an unrelated uncovered file it
printed `SPOTCHECK_MAP: DRIFT spotchecks=46 uncovered=0 first=oracle`, exit 1
(`.ufo/waves/round-80/open/conflation.txt`, the plan's measured open receipt; not re-run by this seat).
`uncovered=0` and `DRIFT` disagree, and `--adopt` refused the same state with `REFUSED_ORACLE`.

v3 (`6d03402f`, `git diff 1968689f..6d03402f -- scripts/spotcheck-adopt.mjs`) splits the readings and
scopes the writer:

- `--check` prints `SPOTCHECK_COVERAGE:` from the spotcheck set and `MAP:` from the oracle's own `first=`
  finding (or `oracle` when the oracle cannot name one), and exits on `uncovered.length === 0 ? 0 : 1` —
  the owned surface alone.
- `otherFindings(result, key)` is `[...new Set(result.findings.filter(f => !f.includes(key)))].sort()`,
  i.e. the map's other defects, order-free.
- `--adopt` refuses unless `after.valid`, the target's row and pin are both absent from `after`, and
  `otherFindings(after, key)` equals `otherFindings(result, key)` byte-for-byte; the pre-image journal
  and its recovery are unchanged from v2.

Observed at `509afb1d`: `SPOTCHECK_COVERAGE: CLEAN spotchecks=46 uncovered=0` + `MAP: CLEAN`, exit 0.

## Decision table

| State | v3 reading | exit |
|---|---|---|
| spotcheck set green, map clean | `SPOTCHECK_COVERAGE: CLEAN … uncovered=0` + `MAP: CLEAN` | 0 |
| spotcheck set green, map red (unrelated uncovered file) | `SPOTCHECK_COVERAGE: CLEAN … uncovered=0` + `MAP: DRIFT first=uncovered:<path>` | 0 |
| spotcheck set green, map red (orphan row) | `SPOTCHECK_COVERAGE: CLEAN … uncovered=0` + `MAP: DRIFT first=orphan-row:<path>` | 0 |
| an uncovered spotcheck exists | `SPOTCHECK_COVERAGE: DRIFT … uncovered=k first=<spotcheck>` + the map line | 1 |
| oracle cannot parse (malformed pin/README) | `REFUSED_ORACLE`, no coverage line | 2 |
| adopt on a red map, own delta clean | `SPOTCHECK_ADOPT: ADOPTED <path> wrote=both` + the oracle's post-write line | 0 |
| adopt whose target still missing, or whose other findings changed | `REFUSED_ORACLE`, bytes restored from the journal | 2 |

## Failure modes this rules out

- **Folded-green:** one surface's red suppresses the other surface's recovery — the r76–r79 recurrence,
  where the closure's spotcheck file stayed unadopted because the map was red for a second reason.
- **Folded-red (the inverse):** an aggregate green that hides the owned surface's red. The platform
  sources keep `outcome` beside `conclusion` for exactly this; a split that prints two lines but exits on
  `result.clean` still fails it.
- **Label-only split:** printing `SPOTCHECK_COVERAGE:` and `MAP:` while keeping the folded `result.clean`
  as the gate — killed by the counter's `map-only-drift-green-coverage` and `adopt-on-red-map` arms.
- **Delta-blind adopt:** writing while silently adding or removing an unrelated finding — killed by the
  `otherFindings` equality, `adopt-duplicate-refused` and `rollback-clean` arms.

## Boundary

The child oracle (`scripts/readme-map.mjs`) owns every map verdict; this entry splits readings, it does
not re-derive them. It does not license ignoring the other surface: the map keeps its own gate and its own
checklist item, and a red map is printed on every `--check`. The counter's 13 arms are the measurement of
record; this seat ran only the live `--check` (see Gate).

## Gate

| source | URL | opened | located quote (≤25 words) | capture |
|---|---|---|---|---|
| S236 | https://docs.github.com/en/actions/reference/workflows-and-actions/contexts | 2026-11-04, HTTP 200, 1,017,423 bytes | "When a continue-on-error step fails, the outcome is failure, but the final conclusion is success." (15 words; steps-context table, `steps.<step_id>.conclusion` row) | `.ufo/waves/round-80/w1/K80ScribeKnowledge/captures/gha-contexts.html` line 1190; sha256 4e2c0ffd5c3ae6ba5f45adc97c277e1803a87a89497a4b91cc40b497c6c09157 |
| S237 | https://docs.gitlab.com/ci/yaml/#allow_failure | 2026-11-04, HTTP 200, 731,768 bytes | "Use allow_failure to determine whether a pipeline should continue running when a job fails." (14 words; § `allow_failure`) | `.ufo/waves/round-80/w1/K80ScribeKnowledge/captures/gitlab-ci-yaml.html` line 478; sha256 93f94544e3069ceb0f801cc5163dda360bb1acb9ec12a80737b7577c4a03bf27 |

Executed by this seat: `node scripts/spotcheck-adopt.mjs --check` (output above, receipt
`.ufo/waves/round-80/w1/K80ScribeKnowledge/receipts/spotcheck-check.txt`); the v2→v3 code reading is `git diff 1968689f 6d03402f -- scripts/spotcheck-adopt.mjs`.
Not executed by this seat: the frozen 13-arm counter, its base-tree control, and `--selftest`; the
after-state `held=13/13` is the measurement seats' receipt, not this entry's. The GHA page is unversioned
vendor documentation; the quote is a reading of the page as served on the access date, not a stable spec
revision.

Draft status: alternate ground for `corpus/knowledge/two-reading-verdicts.md`; the live lane carries a
same-named entry grounded on S119 at `509afb1d`. Ids proposed: S236, S237. See
`.ufo/waves/round-80/w1/K80ScribeKnowledge/COLLISION-CHECK.md`.
