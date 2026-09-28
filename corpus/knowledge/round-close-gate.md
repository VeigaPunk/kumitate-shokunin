
# round-close gate — the fleet round contract, executable

`scripts/round-gate.mjs` (contract `kumitate-round-gate-v1`): zero-dep ESM, node
≥20, READ-ONLY on every input, bounded subprocess use (`timeout`, `maxBuffer`),
and origin-tree reads only for cited-commit tokens unresolved in the lane and
main repos (`--origin`). It turns the obligations a lane already
owes in prose — the report lands, the report is a *report*, the record trio
(`SCORECARD.md` row, `LOG.md` entry, `round-<N>` commit) exists, the work is
committed and pushed — into one verdict over this repo's round history plus
`.ufo/reports/`. Text mode's last line is
`ROUND_GATE: CLEAN (round=N lane=kumitate checks=<k> errors=<e> warnings=<w>)`
or `ROUND_GATE: DRIFT (…)`; `--json` is a single object, schema id
`kumitate-round-gate-v1`. Exit 0 clean · 1 findings (errors; warnings too under
`--strict`) · 2 fail-closed · 64 usage.

## The interface (frozen; quoted, not paraphrased)

```
usage: node scripts/round-gate.mjs [--round N] [--lane kumitate] [--repo DIR]
       [--reports-dir DIR] [--main-repo DIR] [--origin DIR]
       [--close] [--tracked] [--json] [--strict] [--selftest]
contract id: kumitate-round-gate-v1
```

Modes: `--selftest` wins; else `--tracked`; else `--close`; else the artifact
audit. `--tracked` and `--close` are mutually exclusive modes (both ⇒ usage 64).
`--close` runs the audit checks **plus** the three close-only checks; `--tracked`
runs **only** the filed-report freshness clause (below) and no audit check at
all. Defaults: `--lane
kumitate`; `--repo` = the repo root containing the script (the same sibling
convention `scripts/surface-probe.mjs` uses for `DEFAULT_SELF`); `--reports-dir
/home/vgpnk/projects/shokunin/.ufo/reports`; `--main-repo
/home/vgpnk/projects/shokunin`; `--round` = the lane's latest closed round =
max N with `<reports-dir>/round-<N>/<lane>.md` present — none found is
fail-closed, exit 2. Usage is exit 64 (unknown flag, non-numeric `--round`).
Findings print as `ROUND_GATE  <severity>  <KIND>  <detail>`; the kind tokens
are stable, so a consumer can grep a kind without parsing prose.

Three defaults are also environment-overridable, mirroring the siblings' `UFO_SRC`
constant (`scripts/cite-check.mjs:78`, `scripts/surface-probe.mjs:131`) and its
flag-over-env precedence (`opts.src = DEFAULT_SRC` at
`scripts/cite-check.mjs:177`, overwritten by `--src` at `scripts/cite-check.mjs:187`):

| Value | Env | Flag | Literal fallback |
|---|---|---|---|
| reports dir | `KUMITATE_REPORTS_DIR` | `--reports-dir` | `/home/vgpnk/projects/shokunin/.ufo/reports` |
| main repo | `KUMITATE_MAIN_REPO` | `--main-repo` | `/home/vgpnk/projects/shokunin` |
| lane | `KUMITATE_LANE` | `--lane` | `kumitate` |
| origin tree (cited-commit resolution only) | `UFO_SRC` | `--origin` | `/home/vgpnk/Projects/origin-work/ufo-fsd-alpha` |

Precedence is CLI flag > env > literal default, so a lane can run the gate from
anywhere with its own paths exported and still override one of them per
invocation. The usage block should document the env name the way the siblings do
(`--src DIR … (default: $UFO_SRC or …)` at `scripts/cite-check.mjs:158`,
`scripts/surface-probe.mjs:219`).

## The contract it executes

Four clauses out of the main repo, each a rule the fleet already measured
itself against:

| Clause | Where the fleet says it | Measuring input here |
|---|---|---|
| The round ends when the report lands at the contract path | `scripts/shokunin-watchdog.sh:3-4` ("A lane's round ends when `.ufo/reports/round-<N>/<lane>.md` lands"); `report_of()` `scripts/shokunin-watchdog.sh:44`; `MISSION.md:20-22` | `.ufo/reports/round-<N>/<lane>.md` |
| The report is the round's completion evidence, under an exact name | `PROTOCOL.md:140-145` ("A report under any other name does not satisfy the contract"); `PROTOCOL.md:320-322` ("**Completion evidence** is a `.ufo/reports/round-N/<lane>.md` that satisfies the report contract") | report bytes + headings |
| A round's record is report + `SCORECARD.md` row + `LOG.md` entry + a `round-<N>` commit, and the round number is the steered one | `MISSION.md:27-29` (one axis-move, "record before→after in `SCORECARD.md`, log evidence in `LOG.md`"); `PROTOCOL.md:73-77` ("a lane must not claim a round other than the steered one — in commits, `LOG.md` entries, corpus lessons, and reports alike"); `PROTOCOL.md:148-149` | `<repo>/SCORECARD.md`, `<repo>/LOG.md`, `git log --format=%s` |
| Landed means committed, then pushed | `PROTOCOL.md:116-119` ("Landed means committed: changes that exist only in a working tree do not count for the round"); `MISSION.md:47` ("Commit inside the owning repo then `git push`"; reports "commit + push"); push scope `MISSION.md:49-54` | live git state (`--close` only) |

The three gates this repo ships split those clauses cleanly: prose-vs-origin-tree
is `scripts/cite-check.mjs`'s subject, live-surface drift is
`scripts/surface-probe.mjs`'s, and the round record itself is this one's.

## Scope: a stricter local bar on one lane's own record — never a fleet grade

The gate grades **one lane's own round artifacts** (default `--lane kumitate`:
this repo's git record, this lane's report). It is not, and must not be read as,
a fleet report-conformance authority. Three boundaries, all main-repo text, plus
one corollary:

- **Fleet conformance is the integrator's**, not this tool's: `PROTOCOL.md:263-267`
  — "Reads every lane report and verifies each cited child-repo commit exists
  *and is an ancestor of the lane repo's `HEAD`*; … checks each report for the
  contract-required `SHONEN` heading; checks the round's dispatched
  `.ufo/prompts/*.md`…". The gate reads neither other lanes' reports nor prompts,
  and it never assigns a lane-round status; the two citation checks it does run
  (`COMMIT_CITED_UNRESOLVED`, `COMMIT_CITED_NOT_ANCESTOR`) are the lane-local
  pre-check of the same step (`PROTOCOL.md:264-265`) applied to *this lane's own*
  report only.
- **Mission-completion semantics are unchanged.** They stay existence-only:
  `scripts/shokunin-watchdog.sh:44` is `report_of() { [ -f "$SK/.ufo/reports/round-$2/$1.md" ]; }`
  and nothing here adds a condition to the driver. A `REPORT_THIN` finding cannot
  un-land a round, and a CLEAN audit cannot land one.
- **Two authorities may label the same artifact differently — that is by
  design.** Live example, measured 2026-09-28: `.ufo/reports/round-7/kumitate.md`
  is 122 bytes ("Fleet-1 lane retired mid-round; corpus commits pushed
  (7a4c9a0). Marker so fleet-2 respawns."), recorded at
  `SCORECARD.md:29` in the main repo's own marker census. The protocol's rule
  grades it **`ok`, minimum-content defect recorded**, because it "names a real
  committed round-work hash" and is therefore a *defective* report rather than a
  contentless marker (`PROTOCOL.md:210-213`); the frozen thresholds here — thin
  floor 1024 bytes, heading floor 2 — are violated by those same bytes (122 B,
  one heading line), so this gate's spec raises `REPORT_THIN` and
  `REPORT_HEADINGS` errors. Neither verdict is wrong: the
  protocol asks "is this lane-round's record real?", the gate asks "does this
  lane's report meet its own written bar?".
- Corollary: `SCORECARD_PLAN_MISSING` is a warning precisely because no normative
  line compels a written forward plan — the gate must not manufacture fleet law
  from a local convention. Any repair a finding implies is this lane's own work.

## Audit kinds (default mode)

Eleven kinds — nine errors, two warnings. Every one of them is a fact about the
*record*, so all of them stay checkable after the round closed and none of them
reads live git state.

| Kind (severity) | Fires when (frozen spec) | Clause it protects (main repo) |
|---|---|---|
| `REPORT_MISSING` error | the report file is absent | `scripts/shokunin-watchdog.sh:44` — `report_of()` IS the completion signal; `MISSION.md:20-22`; `PROTOCOL.md:140-145` |
| `REPORT_THIN` error | report < 1024 bytes (`REPORT_THIN (bytes=<n>)`) | `PROTOCOL.md:200-206` — the contentless **completion marker** class, `.ufo/reports/round-8/kengaku.md` (101 B) named there; minimum content at `PROTOCOL.md:146-150` |
| `REPORT_HEADINGS` error | fewer than 2 lines matching `^#{1,3} ` | `PROTOCOL.md:151-155` — a report must carry the `SHONEN` heading ("A report without this heading does not satisfy the contract"); the ≥2 count is the kind-agnostic proxy for 'structured report', not the clause itself (the `SHONEN` heading is checked in its own right by `REPORT_SHONEN_MISSING`) |
| `REPORT_SHONEN_MISSING` **warning** | no line matching `^#{1,6}\s*SHONEN` (case-insensitive) | `PROTOCOL.md:151-152` (the report's `SHONEN.md` checklist assessment must sit under a `SHONEN` heading); warning-class because the fleet-level call belongs to the integrator's step 1 (`PROTOCOL.md:263-267`), which is also where a missing heading was censused — 41 of 45 reports at `PROTOCOL.md:99-100` |
| `COMMIT_CITED_UNRESOLVED` error | a backticked `[0-9a-f]{7,40}` token (ranges split on `..`/`...`) resolves in no probeable source: lane → `--main-repo` → `--origin` | `PROTOCOL.md:118-120` — "a report naming a hash the repo does not contain fails verification" |
| `COMMIT_CITED_NOT_ANCESTOR` error | a cited token resolves in `<repo>` but is not an ancestor of its `HEAD` (`git merge-base --is-ancestor`) | `PROTOCOL.md:120-124` — a cited hash that is no longer an ancestor is a conformance defect (amending a cited commit orphans the record); the step the integrator performs at `PROTOCOL.md:264-265` |
| `REPORT_ROUND_MISMATCH` error | report text matches neither `round-<N>` nor `round <N>` (case-insensitive) | `PROTOCOL.md:73-77` — the report must claim the steered round, not another one |
| `SCORECARD_ROW_MISSING` error | no row whose first cell is `<N>` (`^\|\s*<N>\s*\|`) in `<repo>/SCORECARD.md` | `MISSION.md:27-29` — before→after is recorded in `SCORECARD.md` each round (lane precedent: the `\| Round \|` move log, `kumitate-shokunin/SCORECARD.md:133`) |
| `SCORECARD_PLAN_MISSING` **warning** | no `## Planned` section mentioning `round <N+1>` | no normative line compels a *written* forward plan, which is exactly why the spec makes this a warning; anchored on `MISSION.md:27-29` (the next move is picked from `SCORECARD.md`) and the main repo's own precedent, `SCORECARD.md:44-47` (`## Planned` naming `round 11`) |
| `LOG_ENTRY_MISSING` error | no line matching `^- \d{4}-\d{2}-\d{2} — round <N>\b` in `<repo>/LOG.md` | `PROTOCOL.md:75` (round naming binds `LOG.md` entries); `PROTOCOL.md:148-149` (each landed change is tied to a `LOG.md` entry); `MISSION.md:29` ("log evidence in `LOG.md`"); format precedent `kumitate-shokunin/LOG.md:3` |
| `COMMIT_MISSING` error | no commit **message** in `<repo>` carrying a `round-<N>` marker, matched as `\bround[- ]<N>\b` and scanned in JS over the log — never via git `--grep`, whose word boundaries are the reason the spec names a JS scan. Deliberately widened by L1 adjudication to the full message (subject + body); it is a **convention check on the round marker**, not a commit-identity check | `PROTOCOL.md:74` (the round number binds "commits"); `PROTOCOL.md:116-118` (landed means committed). How a commit is *cited* is governed elsewhere and stays elsewhere: a report is graded on the hash it names (`PROTOCOL.md:210-213`) and ancestry is the integrator's step-1 check (`PROTOCOL.md:263-264`) |

`REPORT_MISSING` + the four record kinds are the executable form of the
round-10 audit's own finding that a file at the report path is not
automatically a report (`PROTOCOL.md:200-218`: marker vs defective report vs
real report) — the gate can only proxy the bytes, so the integrator still
adjudicates status; see *What it does not do*.

## Close-only kinds and the fail-closed arms

Three checks run only under `--close` — they are the ones that cannot be true
for most of a round, which is why the default skips them (the frozen spec's own
reason: "skipped in audit mode so the default stays green mid-round").

| Kind (severity) | Fires when (frozen spec) | Clause it protects (main repo) |
|---|---|---|
| `TREE_DIRTY` error | `git status --porcelain` in `<repo>` non-empty (first 5 entries named) | `PROTOCOL.md:117-118` — a working-tree change does not count for the round; `MISSION.md:47` (commit inside the owning repo) |
| `UNPUSHED` error | `git rev-list --count @{u}..HEAD` in `<repo>` > 0 | `MISSION.md:47` ("then `git push`") and `MISSION.md:49-54` — the push-scope hard rule |
| `REPORT_UNTRACKED` error | in `--main-repo`: `git ls-files --error-unmatch <relative report path>` fails, or the path appears in `git log @{u}..HEAD --name-only` | `PROTOCOL.md:128-133` — "landed also means landed *by the lane*": the commit that adds `.ufo/reports/round-<N>/<id>.md` carries the lane identity; `PROTOCOL.md:140-143` fixes the path being checked |

Fail-closed arms (exit 2). The principle is `PROTOCOL.md:320-322`: completion
evidence *is* the report that satisfies the contract — when the evidence
surface can't be read, "absent" must never be reported as `CLEAN`:

| Arm (printed token) | Spec |
|---|---|
| `UPSTREAM_MISSING` | `<repo>` has no upstream configured — the push clause (`MISSION.md:47`, remote scope `MISSION.md:49-54`) is unsatisfiable, so no push verdict exists to give. Detected from a nonzero `git rev-list` exit (missing upstream exits 128), so stdout is never parsed as a count |
| `REPORTS_DIR_MISSING` | `--reports-dir` missing / not a directory — no evidence surface to audit; the report's home is fixed by contract (`PROTOCOL.md:140-143`: `.ufo/reports/round-<N>/<id>.md` in the main repo), so with the directory gone there is nothing to read and absence must not verdict `CLEAN` |
| `NOT_A_GIT_WORKTREE` | `--repo` is not a git work tree — the round is defined against that repo's `HEAD` and commits (`PROTOCOL.md:117-120`) |
| `NO_CLOSED_ROUND` | no closed round found for the lane — rounds are per-lane counters (`PROTOCOL.md:109-113`) and the report path is what closes one (`PROTOCOL.md:140`) |
| `MAIN_REPO_NOT_GIT` | `<main-repo>` is not a git repo — the report lives in the main repo (`PROTOCOL.md:140-141`); reused by `--tracked` for an unusable/absent `--main-repo` |
| `NO_FILED_REPORTS` | `--tracked` found fewer than two filed reports for the lane — with only one on disk there is nothing *older* to check, and "nothing to check" must not be reported as CLEAN |

## The filed-report freshness mode (`--tracked`)

`--tracked` is the mid-round form of exactly one close clause — the tracking
half of `REPORT_UNTRACKED`, without the push half (a push is a *close-time* act,
`MISSION.md:47`, so checking it mid-round would be red by construction). It runs
no audit check at all, which is why it stays green while the current round is
still in flight:

- It enumerates `<reports-dir>/round-*/<lane>.md`, sorts by round, and **drops
  the highest round** — the in-flight one, whose report may legitimately not be
  committed yet.
- Every remaining report must be tracked in `--main-repo`
  (`git -C <main> ls-files --error-unmatch -- <rel>`); each miss is one
  `REPORT_UNTRACKED` finding, and a report outside `--main-repo` gets its own
  `outside …` detail rather than being silently skipped.
- `--tracked` + `--close` ⇒ usage 64 (mutually exclusive modes); `--selftest`
  still wins over both.
- `--round` and `--repo` are never consulted in this mode, so a bogus `--repo`
  cannot change the verdict (selftest case 56).
- Verdict line: `ROUND_GATE: CLEAN (mode=tracked checked=<n> errors=0
  warnings=<w>)` or `ROUND_GATE: DRIFT (mode=tracked …)`; `--json` adds
  `mode`, `checked` and `excludedRound`.

Why the newest report is excluded, and the blind spot it leaves: a report filed
in round N but never committed becomes visible the moment round N+1 files its own
report (N is no longer the highest) — the failure
`.ufo/reports/round-9/kumitate.md` demonstrated, found in round 10 only at close
by `--close`. A lane that never files another report keeps that blind spot; it is
recorded, not hidden.

## Exit map and verdict line

| Exit | Meaning |
|---|---|
| 0 | clean — `ROUND_GATE: CLEAN (round=N lane=kumitate checks=<k> errors=<e> warnings=<w>)` |
| 1 | findings — errors; warnings too under `--strict`. `ROUND_GATE: DRIFT (…)` |
| 2 | fail-closed (arms above) |
| 64 | usage (unknown flag, non-numeric `--round`) |

Same four-value shape as the three gates beside it (`cite-check.mjs`: 0/1/2/64;
`surface-probe.mjs`: 0/1/2/64; `proxy-check.mjs`: 0/1/2/64), so the checklist
grammar's `exit <n>[|<m>…]` reads identically for all four.

## How it composes with the other three gates

Four instruments, four disjoint inputs, four disjoint failure domains — none
of them shells another.

| Gate | Contract | Reads | Failure domain |
|---|---|---|---|
| `scripts/cite-check.mjs` | `kumitate-cite-check-v1` | every path/line/symbol/pin in `SKILL.md` + `corpus/**/*.md`, resolved against the origin tree (`--symbols`, `--integrations`, `--selftest`, `--json`, `--strict`) | prose rot against the origin tree |
| `scripts/surface-probe.mjs` | `kumitate-surface-probe-v1` | the `ufo-sighting surface --json` manifest + `fleet-dispatcher.mjs status` vs the origin bytes; `--checklists` executes this repo's `SKILL.md` task list | live-surface drift |
| `scripts/round-gate.mjs` | `kumitate-round-gate-v1` | this repo's git record, `.ufo/reports/round-<N>/`, the main repo | the round contract itself |
| `scripts/proxy-check.mjs` | `kumitate-proxy-v1` | this repo's `SCORECARD.md` (claim block + registry + `## Axes`), `SKILL.md`, `corpus/README.md`, corpus dirs | the lane's own axis arithmetic (`corpus/knowledge/executable-scorecard.md`) |

The only shared surface is the checklist: `surface-probe.mjs --checklists` runs
the `SKILL.md` items, so one command exercises all four gates. The origin tree
is not scanned here — the only `--origin` read is a lazy `git cat-file`/ancestry
probe for a cited-commit token that resolved in neither the lane nor the main
repo, so the gate stays safe to run in any lane, and it reports into the same
`exit 0|1 + <VERDICT>:` shape the other three use.

## Why audit mode deliberately omits live git state

The three close-only kinds are exactly the checks whose truth is *transient*.
Four main-repo observations, each already recorded:

- **Mid-round absence of a commit is not a defect in this fleet.**
  `PROTOCOL.md:182-185`: "Commit sparsity is normal in this fleet (round-10:
  kumitate committed 39 min after launch, kake 34 min, this lane 47 min), so
  the absence of a commit is not silence and must not trigger `failed`."
- **Tree and push state are closure conditions, not standing ones.**
  `PROTOCOL.md:117-118` ("Landed means committed") is what counts *for the
  round*; `MISSION.md:47` orders commit-then-push at round end. Both are
  evaluated when the lane closes, and a lane is expected to hold an uncommitted
  tree for most of its round.
- **The main repo is multi-writer, so its git state is not lane-attributable.**
  Eight lanes write `.ufo/reports/` concurrently (`MISSION.md:5-16`), and swept
  reports are the recorded norm: `PROTOCOL.md:128-137` measured 46 of 60 reports
  added by three commits authored by identities that are not the filing lane's.
- **The default-round ordering makes the audit safe by construction.** `--round`
  defaults to the latest closed round, and a report *lands last*
  (`PROTOCOL.md:116`) — so the instant a new report exists, the `SCORECARD.md`
  row, `LOG.md` entry and `round-<N>` commit it audits are already required to
  exist. The audit never has to read a moving target to know what a closed round
  should look like.

Consequence for the checklist: the `SKILL.md` item runs the default (audit)
mode, which stays green mid-round by design; `--close` is the pre-report act and
is the only mode that reads live git state. A gate that is red for most of every
round is a gate lanes learn to ignore — the freeze exists so the round-ritual
item stays meaningful.

## Inputs as measured 2026-09-28 (inputs only, not a run of the gate)

- `ls .ufo/reports/round-*/kumitate.md` → the lane's latest closed round is
  **9**; `--round` therefore defaults to 9 until round 10's report lands.
- `.ufo/reports/round-9/kumitate.md` → 10464 bytes, 11 lines matching
  `^#{1,3} ` (`wc -c`; `grep -c`) — above both the thin floor and the heading
  floor.
- `<repo> git log --format='%h %s' -n 12` → `d65aa24 round-9`, `2075363 round-8`,
  `a6f9456 round-8 fixups: …`, `eca3d14 round-6` — the `round-<N>` subject
  convention the commit check matches.
- `kumitate-shokunin/SCORECARD.md:133` (`| Round | Axis | Before | After |
  Evidence |`) and `kumitate-shokunin/SCORECARD.md:137` (a `| 9 | …` row),
  `kumitate-shokunin/SCORECARD.md:142` (`## Planned`);
  `kumitate-shokunin/LOG.md:3` (`- 2026-09-28 — round 0: minted as shonen.`) —
  the row/entry shapes the audit parses.

## Observed verdicts (round 10 — the 1226 L / 49-case revision; its sha is superseded and recorded in `LOG.md` round 10)

Every arm below was run by hand at round-10 close, from the repo root; the
default flip from round 9 to round 10 happens the moment a round-10 report
lands, which is why the round-9 arm is pinned with `--round 9`.

```
$ node scripts/round-gate.mjs                       # default = latest closed round
ROUND_GATE  warning  REPORT_SHONEN_MISSING  no ^#{1,6} SHONEN heading in …/round-9/kumitate.md
ROUND_GATE: CLEAN (round=9 lane=kumitate checks=10 errors=0 warnings=1)      # exit 0

$ node scripts/round-gate.mjs --round 42
ROUND_GATE  error  REPORT_MISSING / SCORECARD_ROW_MISSING / LOG_ENTRY_MISSING / COMMIT_MISSING
ROUND_GATE: DRIFT (round=42 lane=kumitate checks=5 errors=4 warnings=1)      # exit 1

$ node scripts/round-gate.mjs --selftest
ROUND_GATE_SELFTEST: 49/49 pass
VERDICT: PASS                                                                # exit 0, 3.1 s

$ node scripts/round-gate.mjs --reports-dir /nonexistent    # exit 2 REPORTS_DIR_MISSING
$ cd /tmp && node <repo>/scripts/round-gate.mjs --repo /tmp # exit 2 NOT_A_GIT_WORKTREE
$ node scripts/round-gate.mjs --bogus                       # exit 64
```

Falsification arms — both new citation checks were shown firing on real bytes,
not only in fixtures. Report copy with one cited token replaced by `deadbeef0`:

```
ROUND_GATE  error  COMMIT_CITED_UNRESOLVED  cited=5 unresolved=1 [deadbeef0]  # exit 1
```

Round-9's report audited against a throwaway clone checked out at `efe19da`
(round 3), so its cited `d65aa24`-era tokens are no longer ancestors:

```
ROUND_GATE  error  COMMIT_CITED_NOT_ANCESTOR  cited=4 notAncestor=3 [d65aa24 31f09cd 0ac2272]  # exit 1
```

The real report cites four tokens, three of which resolve in this repo and one
(`ee907f1cf`) only in the origin tree — the measured reason `--origin` exists and
why an unresolved-token finding is not raised for it.

## Observed verdicts (round 11, `scripts/round-gate.mjs` sha256 `4c447463…`, 1426 L, 57-case suite)

Round 11 added the `--tracked` mode and applied a two-site simplifier pass (the
unreachable `ahead=?(raw=…)` arm and the duplicate missing-`SCORECARD.md`
warning; −3 L, no case-count change). Verdicts below were run by hand from the
repo root; `checked=8` is the nine filed reports (rounds 1, 3–10 — round 2 filed
none) minus the newest, round 10:

```
$ node scripts/round-gate.mjs --tracked
ROUND_GATE: CLEAN (mode=tracked checked=8 errors=0 warnings=0)                # exit 0
$ node scripts/round-gate.mjs --tracked --json
{"contract":"kumitate-round-gate-v1","mode":"tracked","checked":8,"excludedRound":10,…}
$ node scripts/round-gate.mjs --tracked --close                               # exit 64
$ node scripts/round-gate.mjs --tracked --lane other   # exit 2 NO_FILED_REPORTS filed=0
$ node scripts/round-gate.mjs --selftest
ROUND_GATE_SELFTEST: 57/57 pass
VERDICT: PASS                                                                 # exit 0, ~3.5 s
$ node scripts/round-gate.mjs
ROUND_GATE: CLEAN (round=10 lane=kumitate checks=10 errors=0 warnings=0)      # exit 0
```

## What it deliberately does not do

- **No writes.** No file is created, edited or deleted; no git index operation;
  no queue, lock or wall touch. The record is repaired by its owner, and
  `LOG.md` corrections are *appended*, never rewritten (`PROTOCOL.md:124-127`).
- **No origin-tree scan.** The origin tree is consulted only to resolve a cited
  commit token that exists in neither the lane repo nor the main repo
  (`--origin`, default `$UFO_SRC`); no origin file's content is read and no
  origin fact is asserted. Prose-vs-origin-tree drift belongs to
  `scripts/cite-check.mjs`.
- **No citation re-verification.** Whether a path/line/symbol/pin in this note
  still resolves is `scripts/cite-check.mjs`'s job.
- **No surface conformance.** Whether `ufo-sighting surface --json` or
  `fleet-dispatcher.mjs status` still match their source bytes is
  `scripts/surface-probe.mjs`'s job.
- **It does not adjudicate a lane-round's status.** `ok | failed |
  not-dispatched | in-flight` and the marker-vs-defective-report call are the
  integrator's (`PROTOCOL.md:220`, `PROTOCOL.md:200-218`, `PROTOCOL.md:370-374`);
  the gate emits findings, not statuses.
- **It does not measure coverage or depth.** Which sources are undocumented is
  the coverage axis's question (`corpus/README.md` "Known gaps").

