# Seat K70ScoutSources

Audit (read-only) of three round-70 pre-census surfaces: the **six carried W04 warnings**, the
**new own-work row contract (S217)**, and the **capture-vs-exemption alternatives** for that row.
All three are lane-internal bookkeeping surfaces; **no external authority is claimed, inferred or
required** by anything below (the S217 row's own `scope` cell says so, and `corpus/lessons/round-70.md`
states "no external source authority is inferred").

Lane: `/home/vgpnk/Projects/shokunin/kumitate-shokunin` (all paths below are lane-relative unless a
fleet path is given). Base B `78b98d762ccf3e3a0961f94c4042eaabd2bcb706`; freeze commit
`3dbe7e6e2616423d55f0ea2bbcf8fb32fe7bda6a`; handoff commit `1e00955a`.

## Axes

| axis | audit question | verdict |
|---|---|---|
| operability / frozen integrity | are plan + counter + frozen controls byte-unchanged from the freeze commit? | PASS (3/3 identical) |
| coverage / census honesty | is the "before" census identical to the live census, with the six W04s carried unchanged? | PASS (byte-identical, exit 0) |
| coverage / own-work row contract | does S217 satisfy the registry row contract and is its status earned? | PASS (12 fields legal, mined earned) |
| coverage / capture binding | is S217 bound to committed bytes or exempt — and what are the alternatives? | PASS (capture used; sha == frozen bytes) |
| operability / R10 readiness | is the registration triad in place for `scripts/control-replay.mjs`? | **MISS (0/3 legs)** — L1-only integration item |

## A. Frozen bytes: the dispatch hash is the freeze COMMIT, and nothing drifted

`3dbe7e6e2616423d55f0ea2bbcf8fb32fe7bda6a` is **not** a file digest — it is the freeze commit:

    $ git -C <lane> cat-file -t 3dbe7e6e2616423d55f0ea2bbcf8fb32fe7bda6a
    commit
    $ git -C <lane> log -1 --format='%H %ci %s' 3dbe7e6e2616423d55f0ea2bbcf8fb32fe7bda6a
    3dbe7e6e2616423d55f0ea2bbcf8fb32fe7bda6a 2026-10-30 11:29:26 -0300 round-70: freeze replay isolation claim and negative baseline

(The file digests of `plan.md` are sha256 `e518567d74e1cdfb62b53478486a021dd224cc873cd5ea3c7b5a6d4a9394744b`
and sha1 `56ba28076fb3de255d34a354c9855a248ea97945`; blob sha1 `65332006bea147e8750ed76d0f771633608a4f4e`.
None equals the dispatch hash — a seat that "verifies" the plan by comparing that string to a file
hash will wrongly report drift.)

Byte-identity, working copy vs the freeze commit:

    $ git show 3dbe7e6e:.../round-70/plan.md | sha1sum   -> 56ba28076fb3de255d34a354c9855a248ea97945
      (working copy plan.md sha1sum -> same)
    $ git show 3dbe7e6e:.../round-70/probe/replay70-probe.mjs | sha1sum -> 2a020bd4bd6ffe99fbe0e6a3297320a8a5ccff32
      (working copy counter sha1sum -> same)

Frozen round-69 controls (read only, **never executed**):

    $ sha256sum .ufo/waves/round-69/probe/{c1,c2}-controls.sh
      01efd6dde4c987b676b1930f647cc283768e1ae8113fd076b313e54b56aeda12  c1-controls.sh
      679b7d9619ab8d79139cfe8e956e425f7ccbbf7e58b6eaee5cb72c3deb3a66f4  c2-controls.sh
    $ git show 78b98d76:.ufo/waves/round-69/probe/c2-controls.sh | sha256sum -> 679b7d96… (same)
    $ git show 78b98d76:.ufo/waves/round-69/probe/c1-controls.sh | sha256sum -> 01efd6dd… (same)

Freeze-commit tree under `.ufo/waves/round-70/` (6 paths only — plan + counter + the 4 `base/` receipts):

    base/freeze-map.txt  base/readme-map.txt  base/replay70-base.txt  base/sources.txt
    plan.md  probe/replay70-probe.mjs

`base/freeze-map.txt` = `README_MAP: CLEAN files=169 rows=169 covered=169`, exit 0 — so the
"PLAN_BEFORE_READY" precondition has an observed marker at freeze; the plan's "do not anticipate
PLAN_BEFORE_READY PASS before an observed marker exists" is satisfied by `base/readme-map.txt`.
Confidence: high (reproduced).

## B. Six carried W04 warnings — the "before" census equals the live census

Frozen before-census (`base/sources.txt`, committed in the freeze commit) vs a live re-run:

    $ TMPDIR=<scratch> bash /home/vgpnk/Projects/shokunin/scripts/sources-census.sh validate \
        --root /home/vgpnk/Projects/shokunin kumitate
    kumitate W04 S034 duplicate url stryker-mutator.io/docs/mutation-testing-elements/mutant-states-and-metrics across scopes
    kumitate W04 S068 duplicate url github.com/can1357/oh-my-pi/tree/45c35e40c46166dc726ccc52f5d27f40f2449f99 across scopes
    kumitate W04 S084 duplicate url infection.github.io/guide across scopes
    kumitate W04 S095 duplicate url raw.githubusercontent.com/containers/bubblewrap/v0.13.1/bwrap.xml across scopes
    kumitate W04 S123 duplicate url docs.langchain.com/oss/python/langgraph/checkpointers across scopes
    kumitate W04 S126 duplicate url docs.temporal.io/encyclopedia/detecting-activity-failures across scopes
    kumitate ok  /home/vgpnk/Projects/shokunin/kumitate-shokunin/corpus/SOURCES.md
    exit=0

Byte-identical to `base/sources.txt` (same six rows, same order, same `ok` line, same exit 0).
This matches the round-69 non-author closure, which recorded "exit 0, six carried W04 duplicate-URL
warnings (pre-existing, unchanged before→after)"
(`corpus/lessons/round-69-verifier-spotcheck.md`). Six = six: **no seventh W04 appeared, none was
silently dropped**. W-codes do not change the verdict (exit 0), so the census stays clean-with-
disclosures. The W04 key is per registry file, so these are the lane's own intra-registry duplicate
URLs, not cross-lane findings — no cross-lane authority is involved.

## C. New own-work row contract — S217

Committed at the handoff commit, present in the working copy, and the only registry change since base:

    $ git -C <lane> show 1e00955a:corpus/SOURCES.md | grep -c '^| S217 '   -> 1
    $ git -C <lane> status --porcelain corpus/SOURCES.md | wc -l            -> 0   (clean)
    $ git -C <lane> diff --stat 78b98d76 1e00955a -- corpus/
      corpus/QUALITY.md | 1 +
      corpus/README.md  | 3 +++
      corpus/SOURCES.md | 1 +
      corpus/lessons/round-70.md | 16 ++++++++++++++++
      4 files changed, 21 insertions(+)

Row (`corpus/SOURCES.md:169`):

    | S217 | Frozen round-69 origin controls — .ufo/waves/round-69/probe/c2-controls.sh | own-work | A |
      | fixed-output replay hazard motivating round-70 isolation, not external protocol authority |
      | lines 24-25 and 80 at commit 78b98d762ccf3e3a0961f94c4042eaabd2bcb706; opened 2026-10-30 |
      | The original replay hardcodes its receipt directory and an unused temporary write; private
        versioned execution must preserve historical bytes | mined | 2026-10-30 | on-release |
      corpus/lessons/round-70.md |

Contract conformance, checked against the row contract in `/home/vgpnk/Projects/shokunin/CORPUS.md`
§"SOURCES.md — where a shokunin learns" and the lane's own precedent rows:

- **Shape** — `awk -F'|' '/^\| S217 /{print NF}' corpus/SOURCES.md` -> `13`, i.e. 11 columns
  (`id|source|kind|tier|scope|anchor|teaches|status|opened|recheck|used-by`) under the same
  awk convention round-35 used ("malformed rows = 0 (NF==13)"). No `|` inside cells.
- **Enums** — `kind=own-work` (precedent S008/S009/S021), `tier=A` (precedent S021: lane's own
  re-runnable gate output), `status=mined`, `recheck=on-release` (74 existing rows use this value;
  `on-release` is legal). All legal.
- **Status earned** — contract rule "mined = cited by >=1 path in used-by": `used-by` is
  `corpus/lessons/round-70.md`, and that file names S217 ("S217 will bind this opened source to the
  bounded replay repair"). Earned, not pre-flipped.
- **Gate quote located (≤25 words)** — the anchor's cited lines are real and match the lesson's
  quote, verified in the frozen source (read-only; the originals were never executed):
  - line 24: `W="$LANE/.ufo/waves/round-69/controls"`  ← the fixed receipt directory (lesson quote, 5 words)
  - line 25: `S="${HYAKU_SCRATCH:-/fast/scratch/hyaku}/kumitate-r69/c2-controls-$MODE"`
  - line 80: `printf '%s\n' '- S207 — capture 2026-10-30 — pinned' > /tmp/forge-sed.txt` ← the unused
    hardcoded temporary write; its content is re-typed later inside the python heredoc, so the file
    is written and never read back (routed item 2 of round 69).
- **No external authority** — the `scope` cell itself says "not external protocol authority"; the
  lesson says the same. S217 is the lane's own file at a lane commit, so re-opening it needs no
  third-party page and no network.

Gap: none found in the row itself. [INFERENCE, medium] The row's `teaches` cell asserts two
properties ("hardcodes its receipt directory and an unused temporary write"); both are grounded in
lines 24 and 80 above, but the cell does not carry a ≤25-word quoted snippet, so a reader who
misses the `## Gate` quote in `corpus/lessons/round-70.md` has no inline quote to check. Cosmetic
only — the lesson holds the quote.

## D. Capture binding vs exemption alternatives (`kumitate-source-capture-v1`)

Contract, from `scripts/source-capture.mjs` header: *"every row id must resolve to exactly one
binding — a capture entry or an exemption"*. A capture entry is
`{sourceId, path (lane-root-relative regular file), sha256, bytes, captured}`; an exemption is
`{ids[], reason}`. Missing/duplicate binding = DRIFT exit 1.

Live gate and registry shape:

    $ node scripts/source-capture.mjs
    SOURCE_CAPTURE: CLEAN captures=49 exemptions=107      exit 0

Alternatives measured for S217:

| alternative | available to S217? | observed |
|---|---|---|
| **A. capture binding** (committed bytes + sha256 + byte count) | **yes — exercised** | first entry of `captures`: `{"sourceId":"S217","path":".ufo/waves/round-69/probe/c2-controls.sh","sha256":"679b7d96…a66f4","bytes":7030,"captured":"2026-10-30"}`; sha256 == live file == base blob |
| B. standing exemption group | no | the only group is S001–S107, reason: "rows opened before the capture-commit rule (S001-S107, rounds <= 54): the rule starts at round 55; pre-rule rows are exempt rather than retroactively fabricated. S108 (opened round 54, captured round 55) and S109+ are captured." S217 is post-rule → not covered |
| C. commit-pinning alone (anchor cites commit `78b98d76…`) | not needed, not codified | the capture entry binds the same bytes; there is **no** own-work exemption class in the registry. Creating one would be a new contract group → L1 decision, not a seat call |

So the honest statement is: **S217 is captured, not exempted**; the exemption alternative exists
only as the pre-rule S001–S107 group, and extending it to a post-rule own-work row would be a
contract change owned by L1 (production files are L1-only).

Two limits worth stating plainly:

- The capture entry binds the bytes at the **current path**, not at the pinned commit; the gate
  verifies path/sha/bytes but not "path == base commit". Immutability of those bytes is carried
  separately by the counter's R1 (which compares the archived tree at the tested rev against
  `git show 78b98d76:…`) and by `.ufo/pins/counter-pins.json`. Today all three agree
  (sha256 `679b7d96…`).
- `captured: "2026-10-30"` == today; the capture was made in the same wave that opened S217, so the
  "capture before use" ordering cannot be shown from dates alone — the ordering is shown by the
  handoff commit adding row and capture together (`git diff --stat base..handoff -- .ufo/pins/` shows
  only `source-captures.json | 7 +++++++`, `counter-pins.json | 6 ++++++`, `readme-map.json | 2 ++`).

## E. Counter (normative) and what L1 still owes R10

Read of `.ufo/waves/round-70/probe/replay70-probe.mjs` (the plan says "counter code is normative"):

- predicate: `REPLAY70_HELD` iff **10/10** checks pass, else `REPLAY70_UNMET`, exit 1; usage/invalid
  rev -> exit 64; internal error -> `REPLAY70_ERROR`, exit 2.
- the tool under test is taken from an archive of `<lane>@<rev>` — so `scripts/control-replay.mjs`
  must exist **in the committed tree at the measured rev**, not merely in the working copy.
- R1: frozen `c1-controls.sh`/`c2-controls.sh` at the archived rev are byte-equal to
  `git show 78b98d76:…` (so any edit to them fails R1).
- R2: `--selftest` must exit 0 and print `CONTROL_REPLAY_SELFTEST: PASS` (text match on the
  implementer's own selftest — a self-attestation; attack seats own that surface).
- R3–R7: one run per mode (`c1 donothing|autoledger`, `c2 donothing|autoorigin|forgecapture`) with
  fresh `--out` file and fresh `--work` dir; requires the old UNMET label (`LEDGER69_UNMET` /
  `DEPREC69_UNMET`) **and** `CONTROL-PASS <mode>` in the new receipt, the pre-existing
  `.ufo/waves/round-69/controls/*` receipts unchanged by hash, and the work dir **empty** afterwards.
- R8: `--family junk` -> exit 64. R9: an existing `--out` file must be preserved and the run refused.
- R10 ("registration triad"): `SKILL.md` contains `| control-replay |`, `SCORECARD.md` contains
  `| control-replay |`, and `.ufo/pins/counter-pins.json` has a pin whose `path` is
  `scripts/control-replay.mjs` with `sha256` equal to the sha256 of the archived tool.
- `live=` is informational: it flips to `exercised` only if the forgecapture receipt contains
  `live=exercised`; it never changes HELD/UNMET. That matches the plan's "network-dependent arm
  remains network-dependent: failure is reported, never waived".

**R10 readiness, measured now (integration item for L1, production writes are L1-only):**

    $ grep -c 'control-replay' SKILL.md SCORECARD.md .ufo/pins/counter-pins.json
    SKILL.md:0   SCORECARD.md:0   .ufo/pins/counter-pins.json:0

All three legs are absent — expected mid-wave, but it is the concrete remaining work for 10/10, and
the pin's sha256 must be the *committed* tool's sha256 (the counter hashes the archived file).
`.ufo/pins/counter-pins.json` currently holds 38 pins (37 at round-69 close + the round-70 probe
pin added at freeze — "pins are added without changing counter bytes", confirmed by the diff above).

**Negative baseline** `base/replay70-base.txt` re-read: `REPLAY70_UNMET held=2/10 checks=10
rev=78b98d76… rule=R70 live=no-live(vacuous-declared)`, with `R1 PASS` and `R9 PASS` (both pass
vacuously when the tool is absent) and R2–R8/R10 MISS, exit 1 — exactly the "absent tool must remain
UNMET (2/10)" control the plan freezes.

## F. Hygiene observed

- Working tree: `git status --porcelain` shows only untracked `??` paths, all under
  `.ufo/waves/round-70/` (seat build dirs, seat reports, `w1.ready.partial`). **Zero modifications to
  tracked production files**; no frozen file was touched by this seat.
- `node scripts/sources-check.mjs` (live): `SOURCES_CHECK: CLEAN (rows=156 tiers=A:133,B:15,C:8
  status=queued:13,mined:124,rejected:19 …)`, exit 0 — rows 155 -> 156 with the S217 row (tier A,
  mined), matching `base/source-counts.json` (rev `78b98d76…`, rows 155, A:132, mined:123) plus
  exactly S217. Two informational `USED_BY_ASYMMETRY` warnings (S028, S124 vs
  `corpus/knowledge/failure-recovery-replay.md`) are **pre-existing**: `git diff --stat
  78b98d76..1e00955a -- corpus/ scripts/` touches neither that file, those rows, nor any script.
- `base/band-control.json`: rule `campaign-round-band-64-128`; red_before round-65 total 45 FAIL;
  current_prepared `.ufo/waves/round-70/w1-dispatch.json` total 64 PASS, `dispatch_observed: false`.
- Toolchain used (no installs, pacman untouched): node v24.21.0, git 2.56.0, bash 5.3.20.
  `/home/vgpnk/.omp/agent/RULES.md` read first; nothing installed or updated (no tool needed one).
- Read-only git only (`cat-file`, `log`, `show`, `ls-tree`, `diff`, `status`); no commit, push, jj
  mutation, branch or ref write anywhere in lane or fleet. No `c1-controls.sh`/`c2-controls.sh`
  executed. Scratch `/fast/scratch/hyaku/kumitate-r70/K70ScoutSources/` was created explicitly, used
  only for command output, receipts copied to the private build dir first, and the directory removed
  before this report.

## Unknowns / limits (not closed by this seat)

1. **R10 legs** — cannot be closed here: SKILL.md / SCORECARD.md / counter-pins.json are production
   files owned by L1. Until then the counter cannot exceed 9/10 (R1+R9 pass; R10 needs all three).
2. **`live=exercised`** — depends on the live forgecapture arm reaching the network; unrun here.
   Not waivable and not counted in HELD.
3. **`dispatch_observed: false`** in `base/band-control.json` — the wave-dispatch observation marker
   is not yet recorded in the frozen base; whether the L1 handoff is the marker is an L1 reading.
4. **Semantics of the new tool** — this seat did not audit `scripts/control-replay.mjs` (it does not
   exist yet at the audited rev); selftest self-attestation (R2) and the textual R10 triad are
   stub-forgeable surfaces owned by the attack seats.

## Commands (all run; outputs above are verbatim)

    sha256sum /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-70/plan.md
    sha1sum  <same plan.md>
    git -C <lane> cat-file -t 3dbe7e6e2616423d55f0ea2bbcf8fb32fe7bda6a
    git -C <lane> log -1 --format='%H %ci %s' 3dbe7e6e…
    git -C <lane> show 3dbe7e6e:.ufo/waves/round-70/plan.md | sha1sum
    git -C <lane> show 3dbe7e6e:.ufo/waves/round-70/probe/replay70-probe.mjs | sha1sum
    sha1sum <lane>/.ufo/waves/round-70/probe/replay70-probe.mjs
    git -C <lane> ls-tree -r --name-only 3dbe7e6e… -- .ufo/waves/round-70
    git -C <lane> show 78b98d76:.ufo/waves/round-69/probe/c{1,2}-controls.sh | sha256sum ; sha256sum <paths>
    git -C <lane> diff --stat 78b98d76 1e00955a -- corpus/ scripts/ .ufo/pins/
    git -C <lane> show 1e00955a:corpus/SOURCES.md | grep -c '^| S217 '
    awk -F'|' '/^\| S217 /{print NF}' corpus/SOURCES.md
    bash /home/vgpnk/Projects/shokunin/scripts/sources-census.sh validate --root /home/vgpnk/Projects/shokunin kumitate
    node scripts/sources-check.mjs
    node scripts/source-capture.mjs
    node -e '…JSON.parse(.ufo/pins/source-captures.json) -> captures/exemptions counts'
    grep -c 'control-replay' SKILL.md SCORECARD.md .ufo/pins/counter-pins.json
    git -C <lane> status --porcelain

## Receipts (private build dir, copied from scratch before cleanup)

    .ufo/waves/round-70/build/K70ScoutSources/census-before.txt   (census validate + sources-check, live)
    .ufo/waves/round-70/build/K70ScoutSources/capture-audit.txt   (capture gate, counts, corpus delta, control hashes)
    .ufo/waves/round-70/build/K70ScoutSources/capture-s217.txt    (S217 capture entry, full corpus delta stat)
    .ufo/waves/round-70/build/K70ScoutSources/env-audit.txt       (scripts/pins delta, node/git/bash versions)

Report: .ufo/waves/round-70/w1/K70ScoutSources.md
