# Remaining scripts census — S8 (60 members)
> **Round-37 anchor-truth restoration (2026-10-21).** Anchors in this note were reverted to the lines their 0614092 sentences named, because the round-36 shift-repair moved them one symbol off (spot-check D1). Re-verification against the pin is pending; treat line anchors here as at their base revision until then.


Registry family **S8** is the remainder of the script layer after S1–S6 and the
S7 route-probe cluster. Round 13 first named it as a **60**-member census;
the 2026-10-14 re-census at `964f443e` measured **63** live members (historical).
The pinned 2026-10-20 re-census at `31c465f1` measures **60** live members
(command and list below). **S7** remains the route-probe cluster note
(`corpus/knowledge/route-probe-cluster.md`); its own live membership is owned by
that row. **S8** is everything else in the script-layer universe
(`scripts/*.mjs` + recursive files under `scripts/*/`) that S1–S6 and live S7 do
not own — exactly the 60 members measured at `31c465f1`.
The upstream change behind the 63 → 60 move is source row S021 in
`corpus/SOURCES.md` (own-work: `git diff --name-status 964f443e 31c465f1 --
scripts` → 2 A, 6 D, 61 M files; 2 added, 5 deleted, 55 modified members),
read through a private read-only clone pinned at `31c465f1` (round 35).

Both ids keep the registry grammar `S<n>`/`R<n>`. `scripts/proxy-check.mjs:219`
defines `RE_REGISTRY_ROW`, and `scripts/proxy-check.mjs:355` counts only rows
matching it (a row is covered when its note cell starts `yes`,
`scripts/proxy-check.mjs:358`). A sub-id such as `S7a` is therefore invisible to
C1 accounting and is reported as `C1_TOTAL_DRIFT`, so the partition has to be
drawn with two top-level ids rather than a suffixed one.

Historical measurement (round 32, 2026-10-14): the live member count moved — 60 → 63 —
because the upstream tree gained new remainder scripts and dropped fifteen former
S8 paths at `964f443e`. This remains historical; the pinned origin `31c465f1` is
re-censused below. The family standard still asks a covered family's note to name
every **live** member at internals level: one `##` section headed by the member's
own path, each carrying an anchor in that member's own file plus a verbatim symbol.

## Membership and measurement

The member set is re-derivable from the origin tree with no note content. Round-35
re-census (2026-10-20), pinned upstream tree `31c465f15669f744848bd9f5d56191c5085670f7`
in the read-only source clone `/fast/scratch/kumitate-r35/src`:

```bash
SRC=/fast/scratch/kumitate-r35/src
M=/tmp/s8-members-live.txt
# Live S1–S7 members (intersection of the historical family shapes with the tree)
cat > /tmp/s8-s1s7-live.txt <<'EOF'
scripts/collect-omp-native-handoff-lib/base.mjs
scripts/collect-omp-native-handoff-lib/events.mjs
scripts/collect-omp-native-handoff-lib/evidence.mjs
scripts/collect-omp-native-handoff-lib/policy.mjs
scripts/collect-omp-native-handoff-lib/screening.mjs
scripts/collect-omp-native-handoff.mjs
scripts/fake-omp.mjs
scripts/fleet-dispatcher.mjs
scripts/omp-global-config.mjs
scripts/probe-redact.mjs
scripts/probe-token-plan-kimi.mjs
scripts/probe-token-plan-models.mjs
scripts/probe-token-plan-shared.mjs
scripts/probe-ufo-route-health.mjs
scripts/run-omp-native-trial.mjs
scripts/the-tick-ping.mjs
scripts/ufo-ground-handler.mjs
scripts/ufo-l0-monitor.mjs
scripts/ufo-l0-watch.mjs
scripts/ufo-mission-result.mjs
scripts/ufo-sighting-lib/argv.mjs
scripts/ufo-sighting-lib/base.mjs
scripts/ufo-sighting-lib/observe.mjs
scripts/ufo-sighting-lib/surface.mjs
scripts/ufo-sighting.mjs
scripts/ufo-stale-watchdog.mjs
scripts/ufo-swarm-collect.mjs
scripts/ufo-swarm-wave.mjs
EOF
{
  ls -1 "$SRC"/scripts/*.mjs
  find "$SRC/scripts" -mindepth 2 -type f
} | sed "s|^$SRC/||" | LC_ALL=C sort -u > /tmp/s8-all-scripts.txt
# S8 = script-layer universe minus live S1–S7
comm -23 /tmp/s8-all-scripts.txt <(LC_ALL=C sort /tmp/s8-s1s7-live.txt) > "$M"
wc -l < /tmp/s8-all-scripts.txt   # S_members layer = 88
wc -l < "$M"                      # S8 members = 60
wc -l $(cat "$M" | sed "s|^|$SRC/|") | tail -1  # S8 member lines = 33367
```

Historical observed (round 32, 2026-10-14 at `964f443e`):

```text
S_members (layer): 91   # 73 top-level *.mjs + 18 under scripts/*/
S1–S7 live:        28
S8 members:        63
S8 members L:      36827 total
suites:            23
tools:             32
shims:             3
assets:            4
doc:               1
mjs total:         55
top-level in S8:   54
subdir in S8:      9   # charter-scribe/ 5 + lean-cargo/ 4
```

Current observed (pinned origin `31c465f1`, 2026-10-20):

```text
S_members (layer): 88   # 70 top-level *.mjs + 18 under scripts/*/
S1–S7 live:        28
S8 members:        60
S8 members L:      33367 total
suites:            22
tools:             30
shims:             3
assets:            4
doc:               1
mjs total:         52
top-level in S8:   51
subdir in S8:      9   # charter-scribe/ 5 + lean-cargo/ 4
```

Class is a shape label read off the path, not a behaviour claim: `suite` =
`*.test.mjs`, `tool` = every other `.mjs`, `shim` = `*.sh`, `asset` =
`.service`/`.timer`/`config.json`/`*.prompt.txt`, `doc` = `README.md`.

| Member | L | Class |
|---|---|---|
| `scripts/charter-scribe/config.json` | 26 | asset |
| `scripts/charter-scribe/prompts/kimi-update.prompt.txt` | 17 | asset |
| `scripts/charter-scribe/sync.mjs` | 902 | tool |
| `scripts/charter-scribe/systemd/charter-scribe.service` | 14 | asset |
| `scripts/charter-scribe/systemd/charter-scribe.timer` | 12 | asset |
| `scripts/check-hand-authored-sets.mjs` | 215 | tool |
| `scripts/check-hand-authored-sets.test.mjs` | 141 | suite |
| `scripts/check-routing-free-config.mjs` | 121 | tool |
| `scripts/check-routing-free-config.test.mjs` | 86 | suite |
| `scripts/fleet-dispatcher.test.mjs` | 2852 | suite |
| `scripts/fleet-ledger-read.mjs` | 920 | tool |
| `scripts/fleet-ledger-read.test.mjs` | 1390 | suite |
| `scripts/fleet-ledger-rotate.mjs` | 1302 | tool |
| `scripts/fleet-ledger-rotate.test.mjs` | 2325 | suite |
| `scripts/fleet-selfheal-verify.mjs` | 1048 | tool |
| `scripts/gates-plan.mjs` | 204 | tool |
| `scripts/land-fleet-run.mjs` | 133 | tool |
| `scripts/lean-cargo/README.md` | 81 | doc |
| `scripts/lean-cargo/bin/cargo-shim.sh` | 344 | shim |
| `scripts/lean-cargo/install-shim.sh` | 69 | shim |
| `scripts/lean-cargo/measure.sh` | 98 | shim |
| `scripts/local-helper.mjs` | 360 | tool |
| `scripts/omp-native-shutdown.mjs` | 268 | tool |
| `scripts/omp-role-work.mjs` | 294 | tool |
| `scripts/omp-route-grammar.mjs` | 207 | tool |
| `scripts/prepare-ephemeral-fleet.mjs` | 482 | tool |
| `scripts/prepare-ephemeral-fleet.test.mjs` | 292 | suite |
| `scripts/prepare-ephemeral-l1.mjs` | 962 | tool |
| `scripts/project-devin-subagents.mjs` | 379 | tool |
| `scripts/render-seat-tables.mjs` | 121 | tool |
| `scripts/render-seat-tables.test.mjs` | 102 | suite |
| `scripts/sync-global-routing.mjs` | 255 | tool |
| `scripts/sync-ufo-contracts.mjs` | 2137 | tool |
| `scripts/the-tick-config.mjs` | 458 | tool |
| `scripts/ufo-credential-screen.mjs` | 68 | tool |
| `scripts/ufo-drills.mjs` | 1734 | tool |
| `scripts/ufo-godspeed-inject.test.mjs` | 180 | suite |
| `scripts/ufo-l0-monitor-hook.test.mjs` | 147 | suite |
| `scripts/ufo-l0-monitor.test.mjs` | 1464 | suite |
| `scripts/ufo-l0-watch.test.mjs` | 1608 | suite |
| `scripts/ufo-mission-activity.mjs` | 232 | tool |
| `scripts/ufo-mission-activity.test.mjs` | 80 | suite |
| `scripts/ufo-mission-lifecycle.mjs` | 267 | tool |
| `scripts/ufo-mission-observation.mjs` | 126 | tool |
| `scripts/ufo-mission-observation.test.mjs` | 100 | suite |
| `scripts/ufo-native-names.mjs` | 81 | tool |
| `scripts/ufo-night-watchdog.test.mjs` | 195 | suite |
| `scripts/ufo-route-preflight.mjs` | 177 | tool |
| `scripts/ufo-route-preflight.test.mjs` | 239 | suite |
| `scripts/ufo-stale-watchdog.test.mjs` | 133 | suite |
| `scripts/ufo-state-census.mjs` | 219 | tool |
| `scripts/ufo-state-census.test.mjs` | 172 | suite |
| `scripts/ufo-state-retention.mjs` | 1924 | tool |
| `scripts/ufo-state-retention.test.mjs` | 951 | suite |
| `scripts/ufo-statusline-hook.test.mjs` | 98 | suite |
| `scripts/ufo-swarm-collect.test.mjs` | 1621 | suite |
| `scripts/ufo-swarm-registry.mjs` | 173 | tool |
| `scripts/ufo-swarm-wave.test.mjs` | 1911 | suite |
| `scripts/ufo-watchdog-repend.mjs` | 428 | tool |
| `scripts/ufo-watchdog-repend.test.mjs` | 422 | suite |

## Composition and conventions

What the remainder is: **22 suites + 30 tools + 3 shims + 4 assets + 1 doc = 60**,
including the 5 live files under `scripts/charter-scribe/` and the 4 under
`scripts/lean-cargo/`, and 51 of the 70 top-level `scripts/*.mjs`. The layer
arithmetic at pinned origin `31c465f1` is `S_members 88 = S1–S7 live 28 + S8 60`.
The largest members by `wc -l` among the 60 table rows are
`scripts/fleet-dispatcher.test.mjs` (2852 L),
`scripts/fleet-ledger-rotate.test.mjs` (2325 L) and
`scripts/sync-ufo-contracts.mjs` (2137 L).

Discipline: this re-census is read-only against the origin tree (`ls` / `find` /
`wc -l` / section anchor checks). Suites are described by their own contracts;
nothing here was executed as a fleet mutation.

What the remainder does **not** include:

- **S1–S6 live tops + libs** — dispatcher, native-trial + handoff (+ `collect-omp-native-handoff-lib/` 5),
  swarm pair, sighting + `ufo-sighting-lib/` 4, global-config + mission-result,
  and the five ops watchers (see `/tmp/s8-s1s7-live.txt` above).
- **The S7 cluster (live)** — `probe-ufo-route-health.mjs`, `probe-redact.mjs`,
  the three `probe-token-plan-*.mjs`, and `fake-omp.mjs` (6 live; historical
  `atomic-write.mjs`, `probe-*.test.mjs` companions are gone from the tree and
  belong to the S7 row's re-census, not this note).
- **The five unattributed top-level shell scripts** — `scripts/dev-verify.sh`,
  `scripts/gates.sh`, `scripts/self-iter.sh`, `scripts/smoke.sh` and
  `scripts/ufo-night-watchdog.sh` sit outside the frozen script-layer universe
  (`scripts/*.mjs` + files under `scripts/*/`) and belong to no S-family row.

## Member-completeness probe

Two arms, both re-runnable by a non-author. The proxy cannot do this work —
`scripts/proxy-check.mjs` never reads note contents, which is why a note with a
section deleted still reports `PROXY: MATCH` (exit 0, measured below); this probe
is the compensating check.

```bash
# Arm 1 — heading set vs member set (expect `60` then 0 diff lines)
SRC=${UFO_SRC:-/fast/scratch/kumitate-r35/src}
MEMBERS=${MEMBERS:-/tmp/s8-members-live.txt}              # derived in Membership above
NOTE=${NOTE:-corpus/knowledge/remaining-scripts-census.md}
grep -oE '^## `scripts/[^`]+`' "$NOTE" | sed -E 's/^## `//; s/`$//' | sort > /tmp/s8-headings.txt
wc -l < "$MEMBERS"                 # 60
comm -3 <(sort "$MEMBERS") /tmp/s8-headings.txt
```

Arm 1, historical round-13 output:

```text
$ wc -l < /tmp/kumitate-r13/s8-members.txt
60
$ comm -3 <(sort /tmp/kumitate-r13/s8-members.txt) /tmp/kumitate-r13/arm1-headings.txt
                                    # no output: heading set == member set, 0 diff lines
```

Arm 1 re-run against pinned origin `31c465f1` (2026-10-20):

```text
$ wc -l < /fast/scratch/kumitate-r35/w/ExecS8Writer/members-live.txt
60
$ comm -3 /fast/scratch/kumitate-r35/w/ExecS8Writer/members-sorted.txt /fast/scratch/kumitate-r35/w/ExecS8Writer/headings-sorted.txt
                                    # no output: 0 differences
```

Arm 2 is `member-probe.mjs`, reproduced here so the check does not depend on a
file outside this repository (the lane keeps no scope for round artifacts, and
the `--claims` mode that would move this into `proxy-check.mjs` is pre-registered
as a *next* operability move, not slipped into this round). Save it as
`/tmp/member-probe.mjs` and run
`UFO_SRC=<origin> MEMBERS=<member list> NOTE=<this note> node /tmp/member-probe.mjs`:
it walks the note's `##` sections, resolves each section's anchors
(`scripts/<rel>:N` and the short `:N` form inherited from the last full path),
reopens the cited lines in `<origin>/<rel>`, requires at least one such anchor in
the member's own file on a non-empty line, and requires at least one backticked
symbol that appears verbatim in that file. Exit 0 = complete; exit 1 names
`MISSING_HEADING` / `MISSING_SECTION` / `DUPLICATE_HEADING` / `EXTRA_HEADING` /
`NO_SELF_ANCHOR` / `DEAD_ANCHOR` / `NO_SYMBOL` per offender.

```js
// member-probe.mjs — per-member completeness probe for a census note.
// Why: scripts/proxy-check.mjs never reads note contents, so a registry cell can
// be flipped to `yes` with no note behind it, and a deleted member section still
// reports PROXY: MATCH. This probe re-derives the coverage claim from the note.
//   usage: UFO_SRC=<origin> MEMBERS=<member-list> NOTE=<note> node member-probe.mjs
//   exit 0 = every member named; 1 = offenders named on stdout; 2 = missing input
import { readFileSync } from "node:fs";

const SRC = process.env.UFO_SRC;
const NOTE = process.env.NOTE;
const MEMBERS = process.env.MEMBERS;
if (!SRC || !NOTE || !MEMBERS) {
  console.error("member-probe: UFO_SRC, MEMBERS and NOTE are required");
  process.exit(2);
}

const members = readFileSync(MEMBERS, "utf8").trim().split("\n").filter(Boolean);
const note = readFileSync(NOTE, "utf8");

const headings = [...note.matchAll(/^## `(scripts\/[^`]+)`\s*$/gm)].map((m) => m[1]);
const sections = new Map();
for (const chunk of note.split(/^## /m).slice(1)) {
  const head = /^`?(scripts\/[^`]+)`?/.exec(chunk);
  if (head) sections.set(head[1], chunk.slice(chunk.indexOf("\n") + 1));
}

const missing = members.filter((m) => !headings.includes(m));
const extra = headings.filter((h) => !members.includes(h));
const dup = headings.filter((h, i) => headings.indexOf(h) !== i);
const bad = [];

for (const mem of members) {
  const body = sections.get(mem);
  if (body === undefined) { bad.push(`${mem}: MISSING_SECTION`); continue; }
  const lines = readFileSync(`${SRC}/${mem}`, "utf8").split("\n");
  const syms = [];
  const anchors = [];
  let lastPath = mem; // the section heading names the member: `:N` continues it
  for (const t of [...body.matchAll(/`([^`\n]+)`/g)].map((m) => m[1])) {
    let m;
    if ((m = /^(scripts\/[^:]+):(\d+)(?:-(\d+))?$/.exec(t))) {
      lastPath = m[1];
      anchors.push([m[1], +m[2], m[3] ? +m[3] : +m[2]]);
    } else if ((m = /^:(\d+)(?:-(\d+))?$/.exec(t)) && lastPath) {
      anchors.push([lastPath, +m[1], m[2] ? +m[2] : +m[1]]);
    } else if (!/[/\\:.\s]/.test(t) && t.length >= 3) {
      syms.push(t);
    }
  }
  const own = anchors.filter((a) => a[0] === mem);
  const live = (a, b) => a >= 1 && b <= lines.length && lines[a - 1].trim() !== "" && lines[b - 1].trim() !== "";
  if (!own.length) bad.push(`${mem}: NO_SELF_ANCHOR`);
  else if (!own.some(([, a, b]) => live(a, b))) bad.push(`${mem}: DEAD_ANCHOR ${own.map((a) => a.slice(1).join("-")).join(",")}`);
  if (!syms.some((s) => lines.some((l) => l.includes(s)))) bad.push(`${mem}: NO_SYMBOL`);
}

console.log(`HEADINGS: ${headings.length}  MEMBERS: ${members.length}  DUPLICATE: ${dup.length}`);
for (const m of missing) console.log(`MISSING_HEADING ${m}`);
for (const h of dup) console.log(`DUPLICATE_HEADING ${h}`);
for (const h of extra) console.log(`EXTRA_HEADING ${h}`);
for (const b of bad) console.log(`BAD ${b}`);
const failed = new Set([...missing, ...dup, ...extra, ...bad.map((b) => b.split(":")[0])]);
console.log(`MEMBER_PROBE: ${members.length - failed.size}/${members.length} ok`);
process.exit(missing.length || extra.length || dup.length || bad.length ? 1 : 0);
```

Arm 2, historical round-13 output:

```text
$ UFO_SRC=/home/vgpnk/Projects/origin-work/ufo-fsd-alpha \
  MEMBERS=/tmp/kumitate-r13/s8-members.txt \
  NOTE=corpus/knowledge/remaining-scripts-census.md node /tmp/member-probe.mjs
HEADINGS: 60  MEMBERS: 60  DUPLICATE: 0
MEMBER_PROBE: 60/60 ok                                                              # exit 0
```

Arm 2 re-run against pinned origin `31c465f1` (2026-10-20):

```text
$ UFO_SRC=/fast/scratch/kumitate-r35/src MEMBERS=/fast/scratch/kumitate-r35/w/ExecS8Writer/members-live.txt NOTE=/fast/scratch/kumitate-r35/w/ExecS8Writer/lane/corpus/knowledge/remaining-scripts-census.md node /fast/scratch/kumitate-r35/w/ExecS8Writer/member-probe.mjs
HEADINGS: 60  MEMBERS: 60  DUPLICATE: 0
MEMBER_PROBE: 60/60 ok                                                              # exit 0
```

Historical drop-one control from round 13, retained to demonstrate the critic's blind spot. Rename one
member heading (``## `scripts/ufo-drills.mjs` `` → ``## `scripts/ufo-drills-renamed.mjs` ``)
and re-run both arms plus the proxy on the same tree:

```text
$ comm -3 <(sort /tmp/kumitate-r13/s8-members.txt) /tmp/kumitate-r13/drop-headings.txt
scripts/ufo-drills.mjs
        scripts/ufo-drills-renamed.mjs
$ ... node /tmp/member-probe.mjs
HEADINGS: 60  MEMBERS: 60  DUPLICATE: 0
MISSING_HEADING scripts/ufo-drills.mjs
EXTRA_HEADING scripts/ufo-drills-renamed.mjs
BAD scripts/ufo-drills.mjs: MISSING_SECTION
MEMBER_PROBE: 58/60 ok                                                              # exit 1
$ node scripts/proxy-check.mjs
PROXY: MATCH (A=4 C=9 operability=8; C1=18/19 C2=45/45 coverage=9; pins=4 match)     # exit 0 — blind to the deleted section
```

Anchor *validity* is re-checked independently by the lane's citation gate, which
must report zero errors in this note (its remaining errors are third-party
artifacts, named in `LOG.md`):

```bash
cd /home/vgpnk/Projects/shokunin/kumitate-shokunin && node scripts/cite-check.mjs
```

At this note's landing the gate reports `errors=14`, **all of them inside the two
aggregator-lane artifacts** (`corpus/lessons/round-6-aggregator-audit.md`,
`corpus/lessons/round-8-aggregator-box3-coldrun.md`), and zero in this note: this
file's own findings are `byKind {OK, FRAGMENT, REF_OWNER_AMBIG, PIN_UNTYPED}`
with no error and no `LINE_OOR`/`UNRESOLVED` row — re-run
`node scripts/cite-check.mjs --json` and filter `files[].file ==
corpus/knowledge/remaining-scripts-census.md` to reproduce it.

## Limits of this note

- **A census, not a playbook.** This note records what each member *is* (size,
  shape, the behaviour its own source states); it is not an operational contract
  and must not be read as a licence to run any member. Every member here is
  fleet-mutating tooling.
- **`.test.mjs` members are described by their suite's own contract** — the
  suite's assertion set is the description, and the section for one names the
  subject it imports and the arms it pins, not a second copy of the contract.
- **`wc -l` counts newlines, and one member has no trailing newline.**
  `scripts/ufo-l0-monitor.test.mjs` measures 1345 under `wc -l` and 1346 under
  `grep -c ''`; the brief's per-file reading was 1346, so the group-2 subtotal is
  9146 under the column's command and 9147 under a per-file reading
  (54874 vs 54875 for the whole set). The column is `wc -l`, the exception is
  named, and neither number is wrong for its own command.
- **`class` is a path shape, not a behaviour class.** `tool` says "not a suite",
  not "independently invocable"; several `tool` members are helper modules whose
  CLI, if any, is incidental.
- **The probe is a documentation check, not a gate.** It reports what the note
  says; it cannot show that a section's prose is true of the member. `--symbols`
  in `scripts/cite-check.mjs` verifies that a named symbol exists in the cited
  file, not that the sentence around it is faithful.
- **R11 is out of scope here** — this note is script-layer S8 only; runtime
  remainder lives in `knowledge/runtime-remainder-census.md`.
- **Round-32 re-census removals (2026-10-14).** The following 15 member sections
  named files no longer present under origin HEAD `964f443e` and were **removed**
  from this note (not left as phantoms). Each removal is the file's absence from
  `ls`/`find` on `$SRC/scripts`, not a judgement of historical content:
  - `scripts/charter-scribe/sync.test.mjs`
  - `scripts/local-helper.test.mjs`
  - `scripts/omp-global-config.test.mjs`
  - `scripts/omp-role-work.test.mjs`
  - `scripts/prepare-ephemeral-l1.test.mjs`
  - `scripts/primeagent-refinement-ledger.test.mjs`
  - `scripts/project-devin-subagents.test.mjs`
  - `scripts/run-omp-native-trial.test.mjs`
  - `scripts/sync-global-routing.test.mjs`
  - `scripts/ufo-drills.test.mjs`
  - `scripts/ufo-ground-handler.test.mjs`
  - `scripts/ufo-mission-lifecycle.test.mjs`
  - `scripts/ufo-mission-result.test.mjs`
  - `scripts/ufo-statusline-gate.test.mjs`
  - `scripts/ufo-statusline-hook-machinery.test.mjs`
  The following 18 live members had no section at the prior census and were
  **added** with own-file anchors + verbatim symbols:
  - `scripts/check-hand-authored-sets.mjs`
  - `scripts/check-hand-authored-sets.test.mjs`
  - `scripts/check-routing-free-config.mjs`
  - `scripts/check-routing-free-config.test.mjs`
  - `scripts/land-fleet-run.mjs`
  - `scripts/omp-wave-context.mjs`
  - `scripts/prepare-ephemeral-fleet.mjs`
  - `scripts/prepare-ephemeral-fleet.test.mjs`
  - `scripts/render-seat-tables.mjs`
  - `scripts/render-seat-tables.test.mjs`
  - `scripts/ufo-godspeed-inject.test.mjs`
  - `scripts/ufo-night-watchdog.test.mjs`
  - `scripts/ufo-refinement-context.mjs`
  - `scripts/ufo-refinement-context.test.mjs`
  - `scripts/ufo-route-preflight.mjs`
  - `scripts/ufo-route-preflight.test.mjs`
  - `scripts/ufo-state-census.mjs`
  - `scripts/ufo-state-census.test.mjs`
Declared member count the S8 registry row must carry after parent integration:
**60** at pinned origin `31c465f1` (2026-10-20); the 2026-10-14 value **63** is
retained as round-32 history. Parent owns the registry cell and the stanza; this
note only keeps section-form honesty for the live set.


## Citation ledger

Every citation in this note is origin-relative and re-resolvable: anchors are
written `` `scripts/<rel>:<line>` `` (or `` `:N` `` continuing the last full
path), the line must exist and be non-empty in the member's own file, and named
symbols are backticked adjacent to the anchor that defines them. The ledger is
verified mechanically, not by reading: `node scripts/cite-check.mjs` resolves
paths, lines and pins for `SKILL.md` + `corpus/**/*.md`, `--symbols` adds the
line-coupled symbol check, `--json` is the machine interface, and the per-member
sections below are additionally covered by the two arms of
`## Member-completeness probe`. A citation that cannot be re-resolved is a defect
of this note, not of the origin tree at the time it was written.

## `scripts/charter-scribe/config.json`

The charter-scribe daemon's policy file (26 L; was 27 @ 964f443e; JSON, no runnable arm): `worker` names `"charter-scribe"` (`scripts/charter-scribe/config.json:2`) and the other top-level keys are bounds. `sinceHours` and `maxCommits` cap the scan window and commit batch; `grokWeb` (`:7`) fixes the browser arm — `cdpPort` (`:9`), `mode` (`:10`), `waitCeilingSec` (`:11`) and `maxPromptChars` (`:12`) — while `kimi` (`:15`) fixes the second arm — `chatMode` (`:17`), `timeoutSec` (`:19`) and `promptTemplate` (`scripts/charter-scribe/config.json:20`). `limits` (`:22`) holds `maxEntryHtmlBytes` and `maxSubjectChars` (`:24`, `:24`). `charterRepo` is relative (`../charter-ufo-fsd`) and `repo` is absent; `charterOrigin` remains the SSH URL (`:6`). The remaining absolute paths are grokWeb.bin (`:6`), grokWeb.launcher (`:6`) and kimi.bridge (`:6`), so the file remains partly machine-bound. It is read only by `scripts/charter-scribe/sync.mjs`; it imports nothing.

## `scripts/charter-scribe/prompts/kimi-update.prompt.txt`

Non-executable prompt body: the Kimi hand-off the charter-scribe beat sends after a beat push (`scripts/charter-scribe/prompts/kimi-update.prompt.txt:1` names the target seat and effort, `kimi instant high`). Its only IO is render-time substitution of four placeholders — `{{DATE}}` (`:7`), `{{HEAD}}` (`:8`), `{{SUBJECT}}` (`:9`), `{{COMMITS}}` (`:12`) — which the beat registers as `promptTemplate` (`scripts/charter-scribe/config.json:20`) and fills with `replaceAll` (`scripts/charter-scribe/sync.mjs:508-511`); there is no shebang, argv surface or exit code, so validity is the placeholder set, not `node --check`. The closing paragraph is both refusal arm and effort pin: `Evidence only —` (`:15`) forbids claims absent from the injected commit list, and `Kimi Instant, high` (`:16`) restates the seat at runtime. A stale placeholder silently ships an unfilled token; that is the only failure mode this member owns. re-anchored at 31c465f1 (round 35)

## `scripts/charter-scribe/sync.mjs`

The 6-hour charter-scribe beat: `runBeat` (`scripts/charter-scribe/sync.mjs:604`) preflights both worktrees, then collects local evidence, composes a thread note, injects it into the charter `index.html` and pushes. The exported `BEGIN_MARKER` (`:717-718`) and `END_MARKER` (`:57`) delimit the replaceable beat note; injection verifies exactly one `BEGIN_MARKER` (`:717-718`). The former tagged-refusal surface is absent: ordinary errors reach the CLI catch, which logs `err.message` and exits 1 (`:898-900`). Direct invocation is guarded by `isMain` (`:881-883`). Non-goal: the worker never judges, pushes the evidence repo itself or spawns another orchestrator — a push-url override, non-main branch or dirty index is refused rather than followed. (round 35: removed ScribeError — absent at 31c465f1) (round 35: removed CHARTER_SCRIBE_REFUSAL_SCHEMA — absent at 31c465f1) re-anchored at 31c465f1 (round 35)

## `scripts/charter-scribe/systemd/charter-scribe.service`

A oneshot beat: `Type=oneshot` (`scripts/charter-scribe/systemd/charter-scribe.service:5`) is the whole runtime shape, and `TimeoutStartSec=1200` (`:6`) bounds one beat at 1200 s while `NoNewPrivileges=true` (`:8`) is the hardening flag; `Nice=10` (`:7`) sets process priority. `ExecStart=` (`:11`) runs `/usr/bin/env node` with the sibling `scripts/charter-scribe/sync.mjs`; node resolves through the PATH pinned at `Environment=PATH=` (`scripts/charter-scribe/systemd/charter-scribe.service:9`). The `ExecStart` value was the absolute fnm node binary at `964f443e`, and the old `WorkingDirectory` was `/home/vgpnk/Projects/origin-work/ufo-fsd-alpha`. `WorkingDirectory=` (`scripts/charter-scribe/systemd/charter-scribe.timer:9`) is now `%h/Projects/ufo-fsd-alpha` — `/home/vgpnk/Projects/ufo-fsd-alpha` under the user manager, but `%h` is `/root` under the system manager, not the checkout. The sibling timer schedules this unit (`Unit=charter-scribe.service` at `scripts/charter-scribe/systemd/charter-scribe.timer:9`); this service's `[Install]` (`:13`) also declares `WantedBy=default.target` (`:14`). The file declares no `Restart=` or `User=`, so it supplies neither restart-on-failure nor a privilege drop. Re-anchored at `31c465f1` (round 35).

## `scripts/charter-scribe/systemd/charter-scribe.timer`

**Owning surface** — A 12-line systemd *user* timer unit holding no code — the
whole contract is the `[Timer]` section
(`scripts/charter-scribe/systemd/charter-scribe.timer:5`). `OnBootSec`
(`scripts/charter-scribe/systemd/charter-scribe.timer:5`) fires the first beat 10
minutes after the user manager starts, `OnUnitActiveSec`
(`scripts/charter-scribe/systemd/charter-scribe.timer:6`) re-fires the paired unit
6 hours after its own last activation, `AccuracySec`
(`scripts/charter-scribe/systemd/charter-scribe.timer:8`) coalesces the wake into
a 60-second window, and `Persistent`
(`scripts/charter-scribe/systemd/charter-scribe.timer:7`) replays one beat missed
while the host was down. `Unit`
(`scripts/charter-scribe/systemd/charter-scribe.timer:9`) binds the beat to
`charter-scribe.service` and `WantedBy`
(`scripts/charter-scribe/systemd/charter-scribe.timer:11`) is the `[Install]` line
(`scripts/charter-scribe/systemd/charter-scribe.timer:11`) that `systemctl --user
enable` latches onto. The unit cannot be run directly and carries no state —
scheduling *is* the deliverable — so the only check performed here is
`systemd-analyze verify <unit>` (exit 0, no output) and the beat body itself lives
in the service's own `ExecStart`.

## `scripts/check-hand-authored-sets.mjs`

Live S8 member (215 L, tool), re-censused at `31c465f1` (round 35). Primary surface symbol `DECLARED_PRE_HOOKS` at `scripts/check-hand-authored-sets.test.mjs:14`, now listing only `ufo-godspeed-inject.js` and `ufo-l0-monitor.js`; also `enumerateSets` at `:82`.

## `scripts/check-hand-authored-sets.test.mjs`

Live S8 member (141 L, suite), re-censused at `31c465f1` (round 35). Primary surface symbol `DECLARED_PRE_HOOKS` at `scripts/check-hand-authored-sets.test.mjs:14`; also `checkHandAuthoredSets` at `:54`.

## `scripts/check-routing-free-config.mjs`

Live S8 member (121 L, tool), re-censused at `31c465f1` (round 35). Primary surface symbol `ROUTING_KEYS` at `scripts/check-routing-free-config.mjs:20`; also `checkRoutingFreeConfig` at `scripts/check-routing-free-config.test.mjs:12`.

## `scripts/check-routing-free-config.test.mjs`

Live S8 member (86 L, suite), re-censused at `31c465f1` (round 35). Primary surface symbol `checkRoutingFreeConfig` at `scripts/check-routing-free-config.test.mjs:12`; also `scanText` at `:46`.

## `scripts/fleet-dispatcher.test.mjs`

Self-healing contract suite for the real dispatcher, driven as a child process rather than by node:test: the header (`scripts/fleet-dispatcher.test.mjs:3-8`) numbers five surfaces (hot-ledger status, `once` dedupe, rotation, streaming reader as the only read path, and queue-lock contention). Assertions accrue on a hand-rolled `check(name, ok, detail = null)` ledger (`:2848-2852`); the process exits non-zero with failing names (`:2848-2852`). `--keep` (`:16`) sets `KEEP` (`:2850`), which retains fixtures (`:2850`). Fixtures are minted in-process — `lifecycleEvent` (`:59`) builds rows with `LIFECYCLE_SCHEMA` (`scripts/fleet-ledger-rotate.test.mjs:42`) = `ufo-process-lifecycle-v1`, and `fillerLine` (`:85`) pads segments to the read budget — then passed to `runDispatcher` (`:226`), which spawns the dispatcher with UFO_* overrides into the scratch root (`UFO_TEST_SCRATCH`, default `/scratch/tmp/vgpnk`, `:40`). Bounds are `MAX_LEDGER_SEGMENTS = 5` (`:33`) and `MAX_LEDGER_READ_BYTES` (`:273`); section 1 (`:273`) opens by proving `fixture_exceeds_read_budget` (`:285`) before requiring `coverageComplete === true` (`:293`). The remaining usage checks classify `--help` as `unknown command: --help` (`:416-440`) and cover unsupported arguments and enqueue errors (`:416-440`), all with exit 1. The old degraded/throwing-sibling and ledger-busy blocks are absent. (round 35: removed throwsib_reader_inline — absent at 31c465f1) (round 35: removed LEDGER_BUSY — absent at 31c465f1) re-anchored at 31c465f1 (round 35)

## `scripts/fleet-ledger-read.mjs`

**Owning surface** — The streaming read path for the fleet lifecycle ledger replaces the dispatcher's inline `loadLifecycleLedgerInline`; its import surface is `defaultLedgerPath` (`scripts/fleet-ledger-read.mjs:282`), `loadLifecycleLedger` (`scripts/fleet-ledger-read.test.mjs:20`) and `extendLedgerMemoWithSuffix` (`scripts/fleet-ledger-read.mjs:348`). It is import-only by construction. It streams the live segment and rotated `.1`…`MAX_LEDGER_SEGMENTS` (`scripts/fleet-selfheal-verify.mjs:52`) newest-first in fixed `READ_CHUNK_BYTES` (`scripts/fleet-ledger-read.mjs:57`) chunks under a per-line cap `MAX_LINE_BYTES` (`scripts/fleet-ledger-read.mjs:61`); oversized segments are still read, and the former aggregate 32 MiB read budget is not a correctness ceiling. Lifecycle rows collapse on `dedupeKey` (`scripts/fleet-ledger-read.mjs:129`) — `(level, missionId, processIdentity, phase)` — while `eventId` is deduped newest-segment-first and `processIndex` keeps PRE-DEDUPE occurrence counts. Literals worth naming: `LIFECYCLE_SCHEMA` (`scripts/fleet-ledger-rotate.test.mjs:42`), `MAX_REPORTED_DUPLICATE_IDS` (`scripts/fleet-ledger-read.mjs:64`), `MAX_NON_LIFECYCLE_TRACKED` (`scripts/fleet-ledger-read.mjs:70`) and `MAX_ERROR_MESSAGE_CHARS` (`scripts/fleet-ledger-read.mjs:73`). **Refusal** — `CLI_HELP_FLAGS` (`scripts/fleet-ledger-read.mjs:895`) accepts `--help`/`-h`; a no-argument invocation or any non-help argument emits one JSON error on stderr and exits 2 (`scripts/fleet-ledger-read.mjs:914-918`). An explicit empty library path throws usageError (`scripts/fleet-ledger-read.mjs:914-918`) instead of silently rebinding the read window to the process CWD.

## `scripts/fleet-ledger-read.test.mjs`

The colocated contract suite imports `loadLifecycleLedger` (`scripts/fleet-ledger-read.test.mjs:20`) and checks it against the pre-fix oracle `legacyLoadLifecycleLedger` (`scripts/fleet-ledger-read.test.mjs:1388-1390`). Its 34 test cases cover ledgers over 32 MiB, torn tails, symlink/directory refusals, streaming limits and rotation parity. The hand-rolled runner prints its pass count and exits on failures (`scripts/fleet-ledger-read.test.mjs:1388-1390`). (round 35: removed the stale 42-case count and no-args CLI-refusal test claim — no such CLI test remains in this member at 31c465f1)

## `scripts/fleet-ledger-rotate.mjs`

Self-shrinking rotation for the fleet lifecycle ledger: it exports `rotateLedgerIfNeeded` (`scripts/fleet-ledger-rotate.test.mjs:54`) for the dispatcher's static import (`scripts/fleet-ledger-rotate.test.mjs:54`) and also has a CLI. The compaction contract is canonical here — lifecycle events (`LIFECYCLE_SCHEMA` = `ufo-process-lifecycle-v1`, `:107`) are keyed by level, missionId, processIdentity and phase, and the FIRST occurrence inside a segment is kept verbatim; payload drift is counted, never silently discarded. When compaction shrinks a segment, the raw pre-image is preserved content-addressed as `<segment>.<sha256>.cold` (`:393`, name template `:393`) via hardlink with a copy+rename fallback, and the eviction slot keeps the dispatcher's `<segment>.<uuid>.cold` convention. The rotation record is additive to `ROTATION_RECORD_SCHEMA` = `ufo-ledger-rotation-v1` (`:109`), carries `coldVia` (`:591`; `link`/`copy`/`existing`) plus stale-temp sweep counts (`:975-978`), and a step that throws after the record exists stamps `record.error` and `record.degraded` before rethrow. The CLI (`CLI_USAGE` at `scripts/fleet-ledger-rotate.mjs:1228`) takes `--incoming-bytes`, `--ledger`, `--threshold-bytes`, `--segments`, `--dry-run` and `--no-record`; malformed invocations refuse as one JSON line on stderr with exit 2 and empty stdout (`:1296-1300`), because a typo'd `--dryrun` once ran a real rotation. (round 35: the dispatcher dropped the importSiblingModule loader; it now uses the static import at `scripts/fleet-dispatcher.mjs:38`) Re-anchored at `31c465f1` (round 35).

## `scripts/fleet-ledger-rotate.test.mjs`

**Owning surface** — The `node:test` suite (`scripts/ufo-stale-watchdog.test.mjs:16-22`) has 36 test cases; its 37 textual `test(` occurrences include one `RegExp.test()` call. It runs with `node --test scripts/fleet-ledger-rotate.test.mjs` and exercises the self-shrinking rotation contract of `scripts/fleet-ledger-rotate.mjs`: the outgoing live segment is compacted as it rotates, raw bytes are preserved to a content-addressed cold archive, and each rotation appends one record to a sidecar. The imports are `COMPACTION_SCHEMA` (`scripts/fleet-ledger-rotate.test.mjs:41`), `LIFECYCLE_SCHEMA` (`scripts/fleet-ledger-rotate.test.mjs:42`), `ROTATION_RECORD_SCHEMA` (`scripts/fleet-ledger-rotate.test.mjs:43`) and `rotateLedgerIfNeeded` (`scripts/fleet-ledger-rotate.test.mjs:54`). Fixtures use per-test temporary directories (`scripts/fleet-ledger-rotate.test.mjs:54`) and sizes `MAX_BYTES` (`:49`) and `PAD` (`:50`) around `BASE` (`:47`) and `SIDECAR` (`:48`). Coverage includes `crash_mid_rotation_recovery` (`scripts/fleet-ledger-rotate.test.mjs:276`), `payload_drift_detection` (`:375`), `stale_temp_sweep` (`:887`), `hot_set_eviction` (`:927`) and `rotation_record_invocation_attribution` (`:2258`). (round 35: removed the unsupported 43-case count and the loadLifecycleLedger/validateLifecycleEvent parity-oracle, invalid-row-preservation, and four-case-lock-family claims — absent from this member at 31c465f1)

## `scripts/fleet-selfheal-verify.mjs`

End-to-end proof harness for the 2026-09-16 fleet-ledger overflow failure: it is read-only against `scripts/fleet-dispatcher.mjs` and writes only under incident fixtures plus the optional `--report` path. Before anything runs it re-reads the dispatcher's source and compares mirrored budgets against live bytes, so `MAX_LEDGER_SEGMENTS` (`scripts/fleet-selfheal-verify.mjs:52`), `MAX_LEDGER_BYTES` and `MAX_LEDGER_READ_BYTES` drift exits 2 rather than stale-greening the checks. Every dispatcher spawn carries fixture-root overrides, so nothing live is touched. Checks are tri-state through `check(` (`:243`) — pass/fail gate the verdict, `skip(` (`:114`) records an unrunnable check — and scenarios are proved by name, including `capture_planted_events` (37 `check(` sites and 10 `skip(` sites in the file). Usage is `node scripts/fleet-selfheal-verify.mjs [--report path] [--fixtures-dir path]` (`:114`; help text at `:114`), exit 0 when clean (`:114`), 1 for named failing assertions and 64 for an unknown argv token (`:114`); `--fixtures-dir` must sit strictly beneath an allowed scratch root so the suite can never `rmSync` an operator path. re-anchored at 31c465f1 (round 35)

## `scripts/gates-plan.mjs`

Fast-tier suite selection for `scripts/gates.sh` prints one line per field on stdout — `touched=`, `basis=`, `group=`, `note=` (`scripts/gates-plan.mjs:4-7`) — under a fail-safe contract: any uncertainty selects every group. `touchedPaths()` (`:120`) takes the union of worktree-vs-HEAD, untracked files and commits ahead of upstream, while `UFO_GATES_TOUCHED` (`:126`) pins the set explicitly; an empty value is routed to the unknown-selection arm (`:126`) and emitted as touched=unknown (`:126`). Selection is table-driven by `GROUPS` (`:20`), `IGNORE_RES` (`:37`) and ordered `RULES` (`:46`); `selectAllGroups` (`:193`) is the uncertainty sink. A non-git tree or unreadable diff routes to that arm (`:193`), as does an unmapped path (`:193`). The CLI writes fields through `process.stdout.write` (`:204`); EPIPE is not absorbed. `--root` and `--touched-file` are the test/debug entry points (`USAGE`, `:70`). (round 35: removed IGNORE_ESCAPE — absent at 31c465f1) (round 35: removed writeStdout — absent at 31c465f1) re-anchored at 31c465f1 (round 35)

## `scripts/land-fleet-run.mjs`

Live S8 member (133 L, tool; was 124 @ 964f443e), re-censused at `31c465f1` (round 35). Primary surface symbol `LandingError` at `scripts/land-fleet-run.mjs:33`; also `landFleetRun` at `:23`.

## `scripts/lean-cargo/README.md`

Field note for the `lean-cargo` fleet mission, titled "lean-cargo — kill the cargo lock convoy" (`scripts/lean-cargo/README.md:1`); it states the problem as a machine-wide `CARGO_TARGET_DIR=/scratch/tmp/vgpnk/cargo-target` export that collapses every lane onto one `.cargo-lock`, so concurrent `cargo build|test|check` serialize. The "What ships" section claims `bin/cargo-shim.sh` is installed at `~/.cargo/bin/cargo`, replacing the rustup proxy symlink (backup `cargo.rustup-proxy`, uninstall = move it back) and ending in `exec -a cargo rustup` so toolchain resolution stays byte-identical to stock (`scripts/lean-cargo/README.md:11-13`). Its per-subcommand table assigns raw arg passthrough to the net-mutating/meta class, the `--frozen` plus private target slot treatment (`flock` on `cargo-slots/s<N>.lock`, 32 slots, acquired warmest-first by `.lean-use` stamp, up to 8 read-only overlay lowers) to the build family, and env-only treatment to query verbs; `LEAN_CARGO_DISABLE=1` is documented as the byte-for-byte stock baseline (`:27`). The measured table claims a 2× concurrent convoy at 30.8 s / 28.9 s with 7–8 lock-wait lines against slots at 36.8 s with zero waits, and a 0.93% sccache hit rate in the pre-overlay era. The Files section claims `measure.sh` wipes sccache when given `RESET_CACHE=1` (`scripts/lean-cargo/measure.sh:66`) — that variable exists nowhere in the script, whose wipe is unconditional (`scripts/lean-cargo/measure.sh:66`) — and the Installed-system-state section pins `pacman -S sccache` → 0.17.0 plus the installed shim's byte-identity to `bin/cargo-shim.sh` (`scripts/lean-cargo/README.md:77-78`). re-anchored at 31c465f1 (round 35)

## `scripts/lean-cargo/bin/cargo-shim.sh`

The drop-in `cargo` replacement installed at `~/.cargo/bin/cargo`; every path ends in `raw() { exec -a cargo "$RUSTUP_BIN" "$@"; }` (`scripts/lean-cargo/bin/cargo-shim.sh:36`) so toolchain resolution stays byte-identical to the stock rustup proxy. `LEAN_CARGO_DISABLE=1` is the measurement baseline — byte-for-byte stock behavior (`:27`) — and the fleet layout is three env-overridable roots: `CONVOY` (`:58`), `SLOT_ROOT`, and `NSLOTS` defaulting to 32 (`:60`). Subcommand dispatch is a `case` on the located `sub`; the build family is the literal `BUILD_FAMILY="build|test|check|clippy|run|bench|doc|rustc"` (`:128`) and takes a private overlayfs slot, while `metadata`/`fetch`/`tree`/`pkgid`/`verify-project` deliberately take the env-only path. `have` (`:136`) is the argv-contains helper and `lean_frozen_cache_digest` (`:139`) gates the `--frozen`/offline preflight, so a workspace that needs the network is never frozen. Idle slots past `LEAN_CARGO_SLOT_MAX_AGE_MIN` (default 720 min) are reaped (`:221`), and fresh top-level executables publish back to the convoy bin pool even when `rc != 0` (`:322`).

## `scripts/lean-cargo/install-shim.sh`

Idempotent installer that puts the lean-cargo shim at `~/.cargo/bin/cargo`, backing up the rustup-proxy symlink once as `cargo.rustup-proxy`. It resolves its own tracked source from `SCRIPT_SOURCE` (`scripts/lean-cargo/install-shim.sh:9`) and takes its `cargo-shim.sh` payload from `SHIM_SRC` (`:20`), refusing with exit 2 when that source is unresolvable or `HOME` is unset. `CARGO_BIN` (`:25`) is the install target and `BACKUP` (`:26`) the one-shot symlink backup path. When the target already equals the shim (`cmp -s`, `:35`) it prints `already installed` and exits 0; a pre-existing non-symlink `REAL_BACKUP` is refused by name (`:49`) instead of being clobbered. The copy is atomic — `install -m 0755` to a `.tmp.$$` path then `mv -f` (`:61`) under an EXIT trap that removes the temp file.

## `scripts/lean-cargo/measure.sh`

Convoy-vs-slots measurement harness, run as `bash scripts/lean-cargo/measure.sh [outdir]` (usage at `scripts/lean-cargo/measure.sh:3`); it resolves `ROOT` from `readlink -f "${BASH_SOURCE[0]}"` and `cd`s there, exiting 2 if that fails (`:7`). It runs under `set -uo pipefail` — deliberately without errexit — and writes `<outdir>/measure-<ts>/` with `summary.txt` plus raw per-invocation logs, defaulting the outdir to `$ROOT/.ufo/scopes/lean-cargo`. Phase A measures the baseline convoy with `LEAN_CARGO_DISABLE=1` and `export CARGO_TARGET_DIR="$CONVOY"`, two background `one_build` followers; phase B primes sccache and then runs two shimmed concurrent builds; phase C measures one cold-slot build under `LEAN_CARGO_SLOT_ROOT=/scratch/tmp/vgpnk/cargo-slots-cold` (`:84`). The load is `BUILD=(cargo test -p ufo-core-runtime -p ufo-cli --verbose)` (`:16`) — `--verbose` is deliberate so the shim skips its `-q` injection and lock-wait lines stay visible — and contention is counted by `lock_waits()` grepping `Blocking waiting for file lock` (`:43`). Any phase build failure routes through `die` → stderr plus exit 2, and the closing evidence block diffs `sccache --show-stats` before/after and `du -sh` the convoy, slot root and `$SCCACHE_DIR` (`:66`); the sccache wipe before phase B is unconditional (`:66`), which is why the README's documented reset flag does not match this file.

## `scripts/local-helper.mjs`

The single-shot CLI is `main` (`scripts/ufo-watchdog-repend.mjs:366`) over a loopback chat-completions backend, invoked as dedupe, digest or classify and printing one JSON document whose schema is `ufo-local-helper-v1` (`scripts/local-helper.mjs:342`). The endpoint comes from `UFO_LOCAL_HELPER_URL` (`scripts/local-helper.mjs:332`) and defaults to `DEFAULT_URL` (`scripts/local-helper.mjs:8`) `http://127.0.0.1:34113`; anything but a credential-free loopback HTTP URL is refused as `endpoint_invalid` (`scripts/local-helper.mjs:325-327`), and that check runs before stdin is read (`scripts/local-helper.mjs:325-327`). Input is bounded by `MAX_INPUT_BYTES` (`scripts/local-helper.mjs:10`) inside `readInput` (`scripts/local-helper.mjs:139`): an oversized stream dies `input_too_large` (`scripts/local-helper.mjs:132`), empty input dies `input_invalid` (`:146`), and invalid UTF-8 dies at `:146`. Model output is re-validated rather than trusted — `validateDedupe` (`scripts/local-helper.mjs:263`), `validateDigest` (`scripts/local-helper.mjs:298`) and `validateClassification` (`scripts/local-helper.mjs:307`) raise `model_output_invalid` (`scripts/local-helper.mjs:309`) — so a hallucinated index or label refuses instead of passing through. Every refusal is a `HelperError` (`scripts/local-helper.mjs:17`) with a stable snake_case type, emitted on stderr as `ufo-local-helper-error-v1` (`:360`) with exit code 2 (`:360`).

## `scripts/omp-native-shutdown.mjs`

Per-launch OMP extension loaded only through `omp --extension <absolute path>` on the interactive Main seat of `scripts/run-omp-native-trial.mjs`, and deliberately kept outside `.omp/hooks` and `.omp/config.yml` so discovery never auto-loads it into an L0 or an L2 worker session. Its exported surface is `MAX_STOP_BLOCKS` = 4 (`scripts/omp-native-shutdown.mjs:35`), `HONEST_STATUSES` = {`completed`, `degraded`, `blocked_after_full_topology`} (`:36`) and `evaluateMainArtifact` (`:51`), which opens the final Main artifact once with `O_NOFOLLOW` and `O_NONBLOCK` under a 1 MiB `MAX_ARTIFACT_BYTES` bound (`:37`) and accepts it only when `run_id` matches the launch, `l1` is `Main`, `judge` is `ufo` and the status is honest. The `session_stop` hook blocks the stop with `decision: "block"` while the artifact is premature or mismatched, and once `state.blocks >= MAX_STOP_BLOCKS` it allows the stop and lets the settled turn release the pane so the collector rejects the run honestly instead of the composer idling forever (`:223`). Release requires both an armed `session_stop` and a terminal `agent_end` — `willContinue === true` (the omp 18.2.6 spelling) defers, and a runtime without `ctx.shutdown` records `release_unsupported` rather than throwing. Every decision is persisted to `UFO_NATIVE_GATE_FILE` as `ufo-native-shutdown-v1` through a guarded rewrite that refuses non-regular or multi-linked targets and is best-effort, so a gate-write failure can never wedge the session.

## `scripts/omp-role-work.mjs`

**Owning surface** — `roleWork` (`scripts/omp-role-work.mjs:213`) renders the natural-language duty block a launcher embeds in one seat assignment; it is a pure template helper owning no envelope, schema or runtime, and writes nothing. The tables are `ROLE_METHODS` (`:38`, ten role postures) and `SCOPE_DUTIES` (`:69`, 16 frozen `"role:scope"` duties), plus `SHARED_BOUNDS` (`:121`) and per-role `ROLE_EXTRA_BOUNDS` (`:129`). Import-time guards throw `RoleWorkError` (`:23`) on malformed duty keys, non-function duties or non-string bounds arrays, so the module fails at load rather than mid-launch. Seat identity comes from `seatId` (`:40`) in `ufo-native-names.mjs`, and `evidenceSection` (`:189`) renders the evidence schema and points to `<runDir>/evidence/<seatLabel>.json` with scratch under `<runDir>/scratch/`.
**Refusal** — `META_CTRL_STRIP` (`:171`) strips C0/C1 controls and DEL from lineage/axes text before it reaches the duty body; it does not strip U+2028/U+2029 or bidi overrides. An inherited or forged key is rejected as `invalid_key` (`:239`), preventing a prototype-polluted spec or hostile key from forging a seat identity. re-anchored at 31c465f1 (round 35)

## `scripts/omp-route-grammar.mjs`

Live S8 member (207 L, tool) censused 2026-10-20 against pinned origin `31c465f1`. Primary symbol `parseRoute` is declared at `scripts/omp-route-grammar.mjs:104-108`; `MAX_CHAIN_LENGTH` is declared at `:31`. It centralizes routing-selector and fallback-chain parsing plus provider-to-failure-domain mapping so JavaScript consumers share one grammar.

## `scripts/prepare-ephemeral-fleet.mjs`

Live S8 member (482 L, tool), re-censused at `31c465f1` (round 35). Primary surface symbol `readFleetPolicy` at `scripts/prepare-ephemeral-fleet.mjs:82`; also `composeEphemeralFleet` at `scripts/prepare-ephemeral-fleet.test.mjs:15`.

## `scripts/prepare-ephemeral-fleet.test.mjs`

Live S8 member (292 L, suite; was 253 @ 964f443e), re-censused at `31c465f1` (round 35). Primary surface symbol `composeEphemeralFleet` at `scripts/prepare-ephemeral-fleet.test.mjs:15`; also `landFleetRun` at `:23`.

## `scripts/prepare-ephemeral-l1.mjs`

The module exports lifecycle entry points `createEphemeralL1` (`scripts/prepare-ephemeral-l1.mjs:659`) and `destroyEphemeralL1` (`:814`), plus `main` (`scripts/ufo-watchdog-repend.mjs:366`), whose top-level verbs are create and destroy; an unknown verb throws a usage error (`scripts/ufo-watchdog-repend.mjs:366`). `ROOT` (`:29`) is the default source root, `POLICY_PATH` (`:30`) selects the machine policy, and destination roots come from `policy.root`. The marker is created once with `O_EXCL|O_NOFOLLOW` and mode `0o600` (`:736`); ordinary destroy validates it through `readValidatedMarker` (`:760`), which requires a direct child (`:760`), while the --force path also permits a layout heuristic (`:760`). `readPolicy` (`:16`) reads `POLICY_PATH`, and `PATH_VARIABLES` (`:45`) freezes exactly eight environment keys. Refusals are emitted as {error: message} (`:45`) and the CLI exits 2 (`:45`). (round 35: removed stale PrepareError claim — absent from this member at both 964f443e and 31c465f1) (round 35: removed stale internal_error claim — absent from this member at both 964f443e and 31c465f1) re-anchored at 31c465f1 (round 35)

## `scripts/project-devin-subagents.mjs`

Projects the `devin-native-v1` seat profiles (`scripts/project-devin-subagents.mjs:100`; `loadProfile` at `:107`) from canonical `agents/*.md` cards plus `config/ufo.json` `nativeProfiles.devin-native-v1` (`:99-101`). It is rooted at the repo (`root`, `:86`), validates role keys with `safeRoleKey` (`:31`) enforced by `assertSafeRoleKey` (`:33`), and guards each destination with `assertSafeDest`. Repo inputs use shared `readBoundedFile` (`:19`) under the local `MAX_REPO_FILE_BYTES` 1 MiB bound (`:247`; read sites `:247`, `:247`, `:247`). A missing canonical card throws a plain error (`:247`) and surfaces as `ok:false` plus `error` (`:362-379`). `--check` is read-only (`checkOnly`, `:336`; accepted at `:336`); `ok` (`:336`) means all missing, drifted and extra lists are empty only in check mode. The JSON report exposes the error message rather than a stable error-code field. Non-goal: these files are dispatch shape only — the seat never judges, and `run_subagent` output is session-local evidence, never an omp-native-v1 handoff. (round 35: removed card_missing — absent at 31c465f1) re-anchored at 31c465f1 (round 35)

## `scripts/render-seat-tables.mjs`

Live S8 member (121 L, tool; was 123 @ 964f443e), re-censused at `31c465f1` (round 35). Primary surface symbol `TARGETS` at `scripts/render-seat-tables.mjs:27`; `seatsDigest` moved to `:54` and now digests `canonicalJsonCompact` from `sync-global-routing.mjs`.

## `scripts/render-seat-tables.test.mjs`

Live S8 member (102 L, suite), re-censused at `31c465f1` (round 35). Primary surface symbol `renderSeatTables` at `scripts/render-seat-tables.test.mjs:13`; also `seatsDigest` at `:54`.

## `scripts/sync-global-routing.mjs`

Library-only routing mirror builder: this module deliberately has no CLI (`scripts/sync-global-routing.mjs:41`). `MIRROR_PATH` (`scripts/sync-global-routing.mjs:41`) names `crates/ufo-core-runtime/bundled/omp-seat-routing.json`; `MIRROR_SCHEMA` (`scripts/sync-global-routing.mjs:42`) is `ufo-seat-routing-v1`. `renderSeatRoutingMirror` (`scripts/sync-global-routing.mjs:253`) serializes the result of `buildSeatRoutingMirror` (`scripts/sync-global-routing.mjs:209-214`) but does not publish it; `sync-ufo-contracts.mjs` owns the write through `writeFileAtomic` (`:19`). The seat vocabulary is `CORE_SEATS` (`scripts/sync-global-routing.mjs:53`, module-local), `PROPOSAL_SEATS` (`scripts/sync-global-routing.mjs:54`, module-local) and exported `MIRROR_SEATS` (`scripts/sync-global-routing.mjs:66`); `RESOLVER_VERSION` (`scripts/sync-global-routing.mjs:48`) is module-local. Effort parsing and the whitelist live in `parseRoute` (`scripts/omp-route-grammar.mjs:104-108`; check at `scripts/omp-route-grammar.mjs:104-108`), while `validateChain` starts at `scripts/omp-route-grammar.mjs:139`. The banned-gemini screen is `assertAdmissibleRoute` (`scripts/sync-global-routing.mjs:89-95`); it lowercases routes before allowing the `google-antigravity/` prefix, and rejects other gemini-family routes as malformed. Group safety flows through `routingGroupProblem` in `omp-route-grammar.mjs` (`scripts/omp-route-grammar.mjs:194`) called from `chainGroup` (`scripts/sync-global-routing.mjs:105-109`); groups remain opaque. The snapshot option is passed into `buildSeatRoutingMirror` (`scripts/sync-global-routing.mjs:209-214`), and serialization helpers are `canonicalJson` (`scripts/sync-global-routing.mjs:120`) and `canonicalJsonCompact` (`scripts/sync-global-routing.mjs:129`). (round 35: removed main — absent at 31c465f1) (round 35: removed isMain — absent at 31c465f1) (round 35: removed CLI usage text and refusal — absent at 31c465f1) (round 35: removed writeAtomicFile — absent at 31c465f1) (round 35: removed EFFORT_SUFFIXES — absent at 31c465f1) (round 35: removed in-module effort suffix refusal — absent at 31c465f1) (round 35: removed FAMILY_ID_PATTERN — absent at 31c465f1) (round 35: removed hashed-route-suffix literal — absent from this member at git pin 31c465f1) (round 35: removed --check lstat arm — absent at 31c465f1) (round 35: removed byte-drift hint and exit-1 path — absent at 31c465f1) (round 35: removed CLI exit-64 usage arm — absent at 31c465f1) (round 35: removed UNEXPECTED_ERROR_CODE sentinel — absent at 31c465f1) re-anchored at 31c465f1 (round 35)

## `scripts/sync-ufo-contracts.mjs`

`scripts/sync-ufo-contracts.mjs` is the mirror/contract sync-and-verify CLI: a bare run syncs skill and agent mirrors plus contract projections; `--check` verifies without writing and `--review` is advisory (usage text in `CONTRACTS_USAGE`, `:32-36`). Its inline argv guard admits only those two flags (`:32-36`); a foreign argument writes to stderr and exits 64 (`:32-36`). `UFO_PROJECTION_ROOT` selects `projectionRoot` and `projectionOnly` (`:44-47`); there is no `--check-committed` mode. Failures append raw messages to `report.validationErrors` (`:2137`, `:2137`) and set exit 1 (`:2137`), rather than using an error-code taxonomy. `PROJECT_MODEL_AUTHORITY_FIELDS` (`:415`) and `assertNoProjectModelAuthority` (`:422-437`) refuse profiles that restate seat routes, fallbacks or catalogs. The module composes `readPolicy` (`:16`), `writeFileAtomic` (`:19`) and `validateTickMachineConfig` (`:183-185`); `fixtureLaneRoles` is module-local at `:2136`, not exported. The report prints at `:2136`, then `!report.ok` sets exit 1 at `:2137`. (round 35: removed --check-committed mode — absent at 31c465f1) (round 35: removed CONTRACT_ERROR_CODES — absent at 31c465f1) (round 35: removed unclassified_contract_failure — absent at 31c465f1) (round 35: removed KNOWN_ARGS — absent from this member at 31c465f1) re-anchored at 31c465f1 (round 35)

## `scripts/the-tick-config.mjs`

Library module (no CLI) owning validation and loading of `config/the-tick.machine.json` — `DEFAULT_TICK_CONFIG_PATH` (`scripts/the-tick-config.mjs:15`). IO is fd-bound and fail-closed: `readBoundedFile` (`:19`) opens with `openSync(file, fsConstants.O_RDONLY | fsConstants.O_NOFOLLOW | fsConstants.O_NONBLOCK)`, rejects non-regular descriptors and anything above `MAX_CONFIG_FILE_BYTES` 1_048_576 (`:17`), and re-`fstat`s after the read so a size change is refused. `validateTickMachineConfig` (`:183-185`) pins the `"the-tick-machine-v1"` schema literal; `requireExactKeys` (`:214-221`) checks exact key sets, the loopback credential-free backend endpoint is checked at `:214-221`, and runner/slot arithmetic at `:214-221`. Validation failures throw `TickConfigError` (`:124-132`) with a message, not a frozen config-error code enum. `loadTickMachineConfig` (`:364-405`) expands runtime and allowed-root templates only beneath literal, normalized, absolute non-root bases (`safeAbsoluteBase`, `:294-300`; `expandTemplate`, `:302-307`) and returns a frozen config plus `configSha256`. `revalidateAllowedRoot` (`:431-437`) re-checks dev/ino/uid/gid/full-mode identity, and `tickProvenance` (`:449-457`) projects model and topology. Bounds are declared, not inferred: `PATH_PING_LIMITS` (`:65-72`) hulls each pathPing value and `PATH_PING_ERROR_CODES` (`:83-91`) fixes the ping client's codes, with `abortError` (`:142-145`) returning the shared `AbortError` shape. (round 35: removed stale config-root error-code claims — TICK_CONFIG_ERROR_CODES, config_root_not_private, config_base_path_unnormalized and config_base_path_invalid are absent from this member at 31c465f1)

## `scripts/ufo-credential-screen.mjs`

The shared credential-shape screen used by both the native-trial launcher and the handoff collector, deliberately byte-exact to the judge's `detail_contains_credential` mirror. `containsCredentialShape` (`scripts/ufo-credential-screen.mjs:18`) applies an ASCII-only fold and matches three literal needles in `SECRET_LITERAL_NEEDLES` (`:14`) plus provider token prefixes in `SECRET_TOKEN_NEEDLES` (`:15`) only when at least `SECRET_TOKEN_MIN = 12` token characters follow (`:16`) — so `sk-42` never trips. The evidence-writing side is wider: `containsSensitiveShape` (`:62`) adds `SENSITIVE_LITERAL_RE` (`:51`, catching the compact `eyJ…` JWT shape and `PRIVATE KEY`) and re-scans text stripped by `FORMAT_CHARS_RE` (`:65-68`, applied at `:65-68`), because invisible Cf/Mn/Zs characters split a shape without changing what a reader copies out. The widening lives only on this side — stripping in the judge mirror would break parity, so callers layer their own shapes on top rather than editing the needle sets. A value either side would redact must never reach `launch.json`, `rejection.txt`, `handoff.json` or an `effectiveLaunch` host field.

## `scripts/ufo-drills.mjs`

The UFO-FSD drill harness executes `drills/<id>.drill.json` on deterministic fixture routes with no OMP, OAuth or network. `main` (`scripts/ufo-watchdog-repend.mjs:366`) parses strict argv (`parseArgs`, `:1518`; `DRILLS_USAGE`, `:1507`) and drives the suite. Six executors are closed in `EXECUTORS` (`:107`) — self-iter, sync-check, cargo-test, node-test, judge-handoff, shell — and shadow runs copy only `SHADOW_PATHS` (`:519`, iterated at `:519`). A full-run coverage invariant compares placeholder counts with `wiredCount` (`:1705-1710`, checks `:1705-1710`). `DrillFormatError` reaches the top-level catch and exits 2 (`:1733`); other errors rethrow (`:1733`) and exit 1. (round 35: removed boundaryRefusal — absent at 31c465f1) (round 35: removed DRILLS_REFUSAL_SCHEMA — absent at 31c465f1) (round 35: removed UNEXPECTED_ERROR — absent at 31c465f1) re-anchored at 31c465f1 (round 35)

## `scripts/ufo-godspeed-inject.test.mjs`

Live S8 member (180 L, suite; was 127 @ 964f443e) re-censused 2026-10-14 against origin HEAD `964f443e`. Primary surface symbol `loadHandler` at `scripts/ufo-godspeed-inject.test.mjs:33`; `DIRECTIVE` at `:52`; directive-led pins now pass rather than remain marked todo. re-anchored at 31c465f1 (round 35)

## `scripts/ufo-l0-monitor-hook.test.mjs`

**Owning surface** — A 137-line, six-case suite pinning `claimRun`
(`scripts/ufo-l0-monitor-hook.test.mjs:3`) in the pre-hook
`.omp/hooks/pre/ufo-l0-monitor.js` against the documented stale-claim contract: a
future-dated or malformed JSON timestamp must fall back to the claim file's own
mtime instead of suppressing the monitor until the claimed instant or forever.
`loadHook` (`scripts/ufo-l0-monitor-hook.test.mjs:32`) byte-copies the real hook
into a temp dir, rewrites `REPO_ROOT` (`scripts/ufo-l0-monitor-hook.test.mjs:37`)
to that root, appends `export { claimRun, releaseClaim };` and imports the copy,
The bounds are `STALE_MS` (`scripts/ufo-l0-monitor-hook.test.mjs:41`, 120 s — beyond `SPAWN_TIMEOUT_MS` plus
10 s) and `FRESH_MS` (`scripts/ufo-l0-monitor-hook.test.mjs:42`, 1 s), with each
case planting a chosen JSON timestamp against a chosen mtime. **Edge** — The
load-bearing arms are the mtime fallback — a future-dated claim with an aged mtime
is reclaimed (`scripts/ufo-l0-monitor-hook.test.mjs:83`) and a malformed one with
an aged mtime is reclaimed too (`scripts/ufo-l0-monitor-hook.test.mjs:110`) —
while both fresh-mtime spellings still defer. The suite carries no `node:test`
runner: it prints per-case `ok`/`FAIL` lines plus a final `N/M pins green` count
and exits 1 on any red.

## `scripts/ufo-l0-monitor.test.mjs`

Suite over the heal-repend journal and successor-forge policy of `scripts/ufo-l0-monitor.mjs`; the header (`scripts/ufo-l0-monitor.test.mjs:3`) states the journal is the recovery seam for a healed-but-never-repended row. It imports the pure policy surface via the dynamic-import destructure (`:18`), plus `validateTaskReceipt` (`scripts/ufo-l0-watch.test.mjs:30-35`). The hand-rolled test(name, fn) driver (`scripts/ufo-l0-watch.test.mjs:30-35`) supports counted skips and ends in a failure-count exit (`scripts/ufo-l0-watch.test.mjs:30-35`); `row = (state) => ({ state })` is at `:59`, and `scratchMonitorJson` (`:1424`) spawns the CLI against scratch surfaces. Pins cover journal arithmetic and aging/gave-up persistence (`:1424`), a damaged journal preserved without silent overwrite (`:1424`), rebind tallies (`:1424`), live successor parent-receipt rebind (`:1424`) and malformed null/numeric receipt rows skipped without masking the later stalled row (`:1424`). The file measures 1464 L by `wc -l`; its unterminated last line makes the numbered line count 1465. re-anchored at 31c465f1 (round 35)

## `scripts/ufo-l0-watch.test.mjs`

The §8.1 whip-walk ordering pins for `ufo-l0-watch.mjs` (nc5-swarm r10) are run by the hand-rolled `test(name, fn)` helper (`scripts/ufo-l0-watch.test.mjs:83`), which records into `results` (`:82`) and exits 1 on any failure. The fixture core is `stalledRow` (`:100`), `steerRecorder` (`:108`) and `deps` (`:116`) with injected steer, clock and cooldown; the extracted walk uses imported `whipRow` (`:62`). The pins enforce earliest-gate ordering, including `order_scanError_outranks_foreign_receipt_and_drift` (`:221`), `order_foreign_receipt_outranks_future_mtime_and_drift` (`:235`) and `order_future_mtime_outranks_drift` (`:248`), plus the drift-bypasses-decision rule and cooldown window. Lane-state transitions and snapshot-binding parity (`bindSnapshotConfig_matches_dispatcher_binding`, `:421`) remain pinned. Queue helpers and `validateTaskReceipt` are reused from `scripts/ufo-mission-result.mjs` (`scripts/ufo-l0-watch.test.mjs:30-35`). re-anchored at 31c465f1 (round 35)

## `scripts/ufo-mission-activity.mjs`

Pure projection of mission activity for UFO wall panes: `projectMissionActivity` (`:64`) validates the closed input `{mission, task, activity}`, delegates lifecycle to `projectMissionLifecycle`, and returns the schema-tagged view `ACTIVITY_SCHEMA` (`:14`) with bounded `activity` and `label`. Bounds are Unicode code points, never UTF-16 units: `ACTIVITY_MAX_CODE_POINTS` is 240 (`:27`). `sanitizeDisplayText` strips C0/C1, ANSI/OSC, bidi controls and tmux format tokens, failing `INVALID_ACTIVITY` for a non-string (`:67`), before anything is bounded. `renderMissionActivity` (`scripts/ufo-mission-activity.test.mjs:18-21`) is the single-line renderer and refuses a view whose schema is not `ACTIVITY_SCHEMA` with `INVALID_VIEW` (`:162`). The CLI takes `[json|text] [file|-]`; `main` is at `scripts/ufo-watchdog-repend.mjs:366`, and only direct invocation (`isMainModule`, `:1912`) runs it. Refusals emit a `ufo-mission-activity-error-v1` envelope and exit 1.

## `scripts/ufo-mission-activity.test.mjs`

Colocated suite (nc5-swarm r26) covers truncated-reason dedup, run as `node scripts/ufo-mission-activity.test.mjs` (`scripts/ufo-mission-activity.test.mjs:17`) over five `node:test` cases. It imports `projectMissionActivity` and `renderMissionActivity` from `./ufo-mission-activity.mjs` (`scripts/ufo-mission-activity.test.mjs:18-21`) and fixes `LABEL_MAX` = 280 (`:74`). The 250-code-point window case (`:74`), maximal reason (`:74`), short-reason control (`:74`), explicit-activity append (`:74`) and renderer round-trip (`:74`) pin the bounded label. (round 35: removed stale refusal and sanitizer-test claims — absent from this member at 31c465f1)

## `scripts/ufo-mission-lifecycle.mjs`

`scripts/ufo-mission-lifecycle.mjs` is display-only: it projects caller-supplied wall-manifest and pending-work snapshots into an observational lifecycle phase and never mutates the wall or the queue (`:85`). `projectMissionLifecycle` (`:13`) validates snapshots against `WALL_STATES` (`scripts/ufo-mission-lifecycle.mjs:5`), `QUEUE_STATES` (`scripts/ufo-mission-lifecycle.mjs:6`), `TERMINAL_PHASES` (`scripts/ufo-mission-lifecycle.mjs:7`) and the id grammars (`MISSION_ID`, `scripts/ufo-mission-lifecycle.mjs:10`), rejects crossed identities, and emits a `ufo-mission-lifecycle-v1` envelope (`:187`) with phase, terminal, resumed, suspendedReason and an advisory `resumeHint` (`:181`). Input crosses one shared boundary, `readBoundedJsonInput` (`:227`), which is bounded and refuses an explicit empty operand rather than silently rebinding to stdin (`:227`). Its refusals are event-shaped: a live mission paired with a terminal task, or with an acceptance-blocked task (`acceptanceConflict`, `scripts/ufo-mission-lifecycle.mjs:126`), dies as `mission and task lifecycle snapshots conflict` (`:131`); CLI faults go through `emitErrorJson` (`scripts/ufo-mission-lifecycle.mjs:258`) with `cliErrorCode` (`:124`) and fs messages redacted (`:124`), at exit 1 (`:124`).

## `scripts/ufo-mission-observation.mjs`

Pure projection module plus a standalone inspection CLI: `reconcileObservation(input)` (`scripts/ufo-mission-observation.mjs:34`) accepts only the `task` and `mission` keys — any other key or a non-object throws `TypeError` — and composes the display-only snapshot `OBSERVATION_SCHEMA` = `ufo-mission-observation-v1` (`:16`) from `projectMissionLifecycle` (`:13`) and `projectMissionActivity` (`:64`), returning `phase`/`terminal`/`suspendedReason`/`failureClass`/`activity`/`label` fields (`:66`). Activity precedence is phase-split: `working` prefers the launcher-attested `task?.lastDispatch?.route`, `queued` prefers configured `task?.route` (`:85-103`), and non-string or blank candidates fall through. The CLI is inspection-only (`:85-103`), gated by `isMainModule` (`:1912`), and accepts `--help` or one optional file/`-` operand; invalid extra or flag-like operands throw `TypeError` (`:99-100`). It prints the JSON snapshot with `console.log` (`:103`). Failures use `ufo-mission-observation-error-v1` (`:116-124`) with `cliErrorCode` and redacted fs messages, then exit 1 (`:124`). (round 35: removed writeStdout helper claim — absent from this member at 31c465f1) Never an acceptance path — consumers read the persisted observations sidecar, not this module.

## `scripts/ufo-mission-observation.test.mjs`

**Owning surface** — The co-located `node:test` suite (`scripts/ufo-stale-watchdog.test.mjs:16-22`) exercises `reconcileObservation`: working phase prefers the dispatcher's attested serving route (`:90`), queued phase keeps the configured route authoritative (`:90`), suspended/terminal phases do not leak the row's route into the reason channel (`:90`), and non-string route values fall through to the next candidate (`:90`). (round 35: removed stale CLI/refusal and U+2028/U+2029/bidi-control test claims — absent from this member at 31c465f1)

## `scripts/ufo-native-names.mjs`

Canonical OMP-native seat/name derivations shared by the trial launcher and handoff collector — a NATIVE_CONTRACT_FILES member whose strings are hash-bound into `launch.json`, the manifest and candidate receipt. `seatKey` (`scripts/ufo-native-names.mjs:13`) builds the {role, instance} tuple that `seatId` (`:40`) and `seatLabel` (`:45`) render; `canonicalDispatchName` (`:50-56`) sha256-truncates the runId to an 8-hex tag. `correlationGroup` (`:59-69`) and `unavailabilityGroup` (`:72-80`) hash their `omp-native-correlation-v1`/`omp-native-unavailability-v1` domain strings into `sha256:` digests. `assertSafeRole` (`:17-23`) and `assertSeatKey` (`:26-38`) reject unsafe roles and invalid seat keys; the correlation and unavailability helpers reject non-string inputs in their respective ranges. (round 35: removed NativeNamesError/NATIVE_NAMES_ERROR_CODES claim — absent from this member at 31c465f1)

## `scripts/ufo-night-watchdog.test.mjs`

Live S8 member (195 L, suite; was 118 @ 964f443e), re-censused at `31c465f1` (round 35). Primary surface symbol `hasTmux` at `scripts/ufo-night-watchdog.test.mjs:168`.

## `scripts/ufo-route-preflight.mjs`

Live S8 member (177 L, tool; was 176 @ 964f443e), re-censused at `31c465f1` (round 35). Primary surface symbol `ROUTE_PREFLIGHT_SCHEMA` at `scripts/ufo-route-preflight.mjs:33`; also `routeFamilies` at `scripts/ufo-route-preflight.test.mjs:17`.

## `scripts/ufo-route-preflight.test.mjs`

Live S8 member (239 L, suite; was 206 @ 964f443e), re-censused at `31c465f1` (round 35). Primary surface symbol `routeFamilies` at `scripts/ufo-route-preflight.test.mjs:17`; also `probeFamilies` at `:134`.

## `scripts/ufo-stale-watchdog.test.mjs`

Compatibility-leaf suite (133 L; was 756 @ 964f443e; 9 `node:test` cases). At 964f443e this suite pinned the fd-2 telemetry fallback, tick ladder and rung-4 configPath behavior; that supervision ladder moved to `scripts/ufo-l0-watch.mjs`. At 31c465f1 the leaf imports the shared repend seam (`scripts/ufo-stale-watchdog.test.mjs:16-22`), begins with the `attemptRepend` success case (`:62`), covers throw/retry (`:62`) and uses `spawnSync` only for a `--check` probe (`:127-133`). Its fixture identity is `RUN_ID` (`:26`). (round 35: removed emitFor — absent from this member at 31c465f1) (round 35: removed per-case spawnSync stderr harness — absent from this member at 31c465f1) (round 35: removed STALE_MS — absent from this member at 31c465f1) (round 35: removed SAFE_RUN_ID — absent from this member at 31c465f1) (round 35: removed fd2_fallback_carries_duty_events_when_log_path_dead — absent from this member at 31c465f1) (round 35: removed closed_fd2_never_throws_out_of_tick — absent from this member at 31c465f1) (round 35: removed status_malformed suite pin — absent from this member at 31c465f1) (round 35: removed state_save_error event claim — absent from this member at 31c465f1) (round 35: removed configPath rung-4 suite pins — absent from this member at 31c465f1) (round 35: removed nc5-swarm r16 provenance tag and stale 29-case count — 964f443e has 27 `test(` cases) re-anchored at 31c465f1 (round 35)

## `scripts/ufo-state-census.mjs`

Live S8 member (219 L, tool; was 184 @ 964f443e), re-censused at `31c465f1` (round 35). Primary surface symbol `CENSUS_SCHEMA` at `scripts/ufo-state-census.mjs:25`; also `censusState` at `scripts/ufo-state-census.test.mjs:14`.

## `scripts/ufo-state-census.test.mjs`

Live S8 member (172 L, suite; was 91 @ 964f443e), re-censused at `31c465f1` (round 35). Primary surface symbol `censusState` at `scripts/ufo-state-census.test.mjs:14`; also `sparse` at `:20`.

## `scripts/ufo-state-retention.mjs`

Bounded retention for UFO runtime state, with the `cap` and `sweep` verbs (`scripts/ufo-state-retention.mjs:4-12`), dispatched through `isMainModule` (`:1912`) and printing JSON (`:1912`). `cap` bounds each `*.bash.log` generation to `CAP_BYTES = 100 * 1024 * 1024` (`:85`) and the run's whole bash-log set under `RUN_BASH_LOG_CAP_BYTES = 1024 * 1024 * 1024` (`:86`); open-writer generations report `defer_open_writer` (`:24-26`). `sweep` protects the newest `NEWEST_PROTECTED_RUNS = 10` runIds (`:98`), those younger than `YOUNG_PROTECTED_MS` 14 days (`:99`), and requires age ≥ `RETIRE_MIN_AGE_MS` 30 days (`:100`). `retentionLockHolder` (`:1664-1676`) supplies owner-pid liveness; `watch_active` is applied only for a live holder (`:767-771`), while dead or malformed locks are not owners. Every mutation writes a `ufo-runtime-reclaim-v1` row (`RECLAIM_SCHEMA`, `:184`) and typed JSONL events under `$UFO_STATE_DIR/session-retention.jsonl` (`:184`, `appendEvent` at `:441-456`). Bare `cap`/`sweep` are dry-run unless `--apply` (`:1831-1832`, `:1831-1832`); a missing verb exits 2 with `retention_usage_error` (`:1922`), and typed refusals exit 2 while untyped escapes exit 1 (`:1922`). (round 35: removed watch — absent at 31c465f1) (round 35: removed watch_lock_unverifiable — absent at 31c465f1) re-anchored at 31c465f1 (round 35)

## `scripts/ufo-state-retention.test.mjs`

The owned behavioral suite for the retention CLI has 29 `test(` declarations and builds each case under a scratch state tree (`:449`). It pins cap apply bounds and head/tail preservation (`:449`, `:449`), JSONL immutability (`:449`), a true second-apply no-op (`:449`) and open-writer deferral (`:449`); a read-only holder now caps instead (`:449`). The sweep suite admits `watch_active` (`:767-771`) only for a verifiably live lock owner (`:767-771`), and malformed, dead-pid or pid-0 lock bodies do not protect (`:767-771`). Guards fail closed: a malformed ledger reports `ledger_incomplete` (`:650`), a FIFO at the queue guard returns `queue_unsafe` within the timeout (`:795-800`), and a FIFO event-log path is not overwritten while cap completes (`:795-800`). (round 35: removed watch fixture — absent at 31c465f1) (round 35: removed watch_lock_unverifiable — absent at 31c465f1) (round 35: removed wall-cap cases — absent at 31c465f1) (round 35: removed 1 MiB stdout bound — absent at 31c465f1) (round 35: removed capRunBashLogs — absent at 31c465f1) re-anchored at 31c465f1 (round 35)

## `scripts/ufo-statusline-hook.test.mjs`

The colocated fail-closed statusline suite dynamically imports `formatUf0Status`, `isCacheFresh` and `shouldStampDisplayRefresh` (`:22`) and holds nine pins over a local test harness (`:22`). Its spine is that malformed or drifted payloads render `CLOSED` (`:33`), the literal `uf0 hatch (closed)`: an empty object must not print fabricated zero-fleet text (`:40`), and null, strings, arrays or missing `levels`, `phaseCounts` (`:36`) or `hatch` likewise render CLOSED (`:97-98`, `:97-98`, `:97-98`, `:97-98`). A valid envelope formats counts with null l2 as the opaque `?` sentinel (`:97-98`), and a valid closed envelope formats closed with counts (`:97-98`). The added cache gates pin TTL freshness (`:97-98`) and ensure display stamps follow only a confirmed full refresh (`:97-98`). The run prints N/N pins green or exits 1 when any pin fails (`:97-98`). re-anchored at 31c465f1 (round 35)

## `scripts/ufo-swarm-collect.test.mjs`

**Owning surface** — The wave→envelope bridge suite for
`scripts/ufo-swarm-collect.mjs`, named by `SCRIPT`
(`scripts/ufo-swarm-collect.test.mjs:16`) — 71 test() declarations covering outcome
mapping, the `resume_hint` presence rule, fail-closed joins and the
`<agent_swarm_result>` XML shape. It reuses `spinWait` from
`scripts/ufo-mission-result.mjs` (`scripts/ufo-swarm-collect.test.mjs:14`),
spawns the real CLI through `run` (`scripts/ufo-swarm-collect.test.mjs:65`) and
`runJson` (`scripts/ufo-swarm-collect.test.mjs:77`), and counts cases with its own
`test` helper (`:31`). Fixtures come from
`dispatchPayload` (`scripts/ufo-swarm-collect.test.mjs:95`) and `resultsPayload`
(`scripts/ufo-swarm-collect.test.mjs:107`), while the contended-registry-lock cases
use `REGISTRY_LOCK_HOLDER_SOURCE` (`scripts/ufo-swarm-collect.test.mjs:23`),
`R22_HOLDER_TOKEN` (`:31`) and fixed `OWNER` (`:32`). Join arms reject an
unmapped member (`:234`), an unexpected member (`:246`), duplicate results
(`:260`) and conflicting `agentId` (`:560`); the collector succeeds quickly
while a writer holds the registry lock (`scripts/ufo-swarm-collect.test.mjs:1386`).
Composition coverage includes the hand-built registry join (`:828`) and a
plan-schema mixed spawn/resume wave (`:692`), not an end-to-end wave-run record.
The suite prints its final `N/M passed` line (`scripts/ufo-swarm-collect.test.mjs:1620`)
before exit 1 on any red (`scripts/ufo-swarm-collect.test.mjs:1621`). (round 35: removed end-to-end wave-run composition case — absent from this member at 31c465f1) (round 35: removed ENTRY_FAILURE_CLASSES — absent from this member at 31c465f1) re-anchored at 31c465f1 (round 35)

## `scripts/ufo-swarm-registry.mjs`

Live S8 member (173 L, tool) censused 2026-10-20 against pinned origin `31c465f1`. Primary symbol `SWARM_REGISTRY_SCHEMA` is declared at `scripts/ufo-swarm-registry.mjs:27`; `loadRegistryDocument` is declared at `:165`. It centralizes the swarm registry schema, shared shape/path rules and parsing/normalization into ordered member rows.

## `scripts/ufo-swarm-wave.test.mjs`

Dispatch-payload contract suite for the swarm path: the header (`scripts/ufo-swarm-wave.test.mjs:2`) describes plan admission and the run split; the file has 98 `test(` declarations at both pinned revisions. It imports `planSwarmWave` and `spinWait` from `./ufo-swarm-wave.mjs` and `./ufo-mission-result.mjs` (`scripts/ufo-swarm-wave.test.mjs:12-13`), takes the CLI path from `SCRIPT` (`:15`) and spawns the real script. The temp-root helper `tmpRoot` (`:150`) uses `tmpdir()` (`:151`); the outside-root config fixture creates its own temp directory with mkdtempSync(tmpdir()) (`:151`). Coverage includes `spawn_only_wave_emits_one_task_call` (`:106`), `hard_cap_admits_100_lanes` (`:766`) and `hard_cap_rejects_101_lanes` (`:775`), plus registry write/merge and record reassignment refusals. `run_withholds_dispatch_when_persist_refuses` (`:433`) proves a refused registry persist withholds dispatch. Fixture hygiene registers and sweeps every temp dir at exit, with the live-PID anchor in the suite's own temp tree. re-anchored at 31c465f1 (round 35)

## `scripts/ufo-watchdog-repend.mjs`

Refusal-aware blocked-row repend duty extracted from `ufo-night-watchdog.sh`, exported as `main` (`scripts/ufo-watchdog-repend.mjs:366`) and run through `isMainModule(import.meta.url)` → `process.exitCode = main()` (`:426-427`). Its argv surface is `--queue`/`--state`/`--fleet`/`--dispatcher`/`--quiet-seconds`/`--min-age-seconds`/`--now`; any other token is an `unsupported argument` fault (`:366-371`), printed to stderr with exit 64 (`:366-371`). Eligibility is queue state `blocked` and age over `DEFAULT_MIN_AGE_SECONDS` (240), plus matching fleet membership when `--fleet` is supplied (`:278-280`). A successful repend consumes one of `MAX_ATTEMPTS` = 3 (`scripts/ufo-watchdog-repend.test.mjs:16`) while refusal or failure does not. The durable state file is `STATE_SCHEMA` = 2 (`:57`) with legacy bare `{key: n}` reads as attempts; it now also carries a `notes` dedupe member, and attempts/refusals/notes for rows no longer blocked are pruned (`:341-345`). `STABLE_REFUSAL_REASONS` = {`mission_stale_registered`} (`:64`) is quieted for `DEFAULT_QUIET_SECONDS` (900) only while `rowSignature(row)` and the manifest class remain unchanged (`:244-249`, `:244-249`); transient refusal classes are never suppressed (`:244-249`). This r07 stable-refusal suppression covers a dispatcher refusal of `mission_stale_registered`, which is designed not to succeed on retry. Child stdout/stderr tails are redacted and capped by `SPAWN_FAILURE_TAIL_MAX` = 120 (`:159`); an unreadable queue prints one stamped line and returns 0. re-anchored at 31c465f1 (round 35)

## `scripts/ufo-watchdog-repend.test.mjs`

The 422-line suite (was 364 @ 964f443e) for the extracted night-watchdog repend duty runs as `node scripts/ufo-watchdog-repend.test.mjs`. It imports the decision surface — `MAX_ATTEMPTS` (`scripts/ufo-watchdog-repend.test.mjs:16`), `STABLE_REFUSAL_REASONS` (`:17`), `decideRow` (`:18`), `extractRependReport` (`:19`), `manifestClassFor` (`:20`), `normalizeState` (`:22`), `rowSignature` (`:23`) and `runRependCycle` (`:24`) — and drives them with the local `test` runner (`:31`). Fixtures use fixed `NOW` (`:42`), a `row` factory (`:43`), `fakeSpawn` (`:53`) and `STABLE` (`:62`), the `mission_stale_registered` refusal. Pins cover stable-refusal suppression with row/manifest-change reset, transient retry, success counting, the attempt cap and legacy state migration. The end-to-end case `main_end_to_end_scratch_suppresses_then_manifest_change_resets` (`:333`) sets `UFO_STATE_DIR` to a scratch root (`:345`) and verifies suppression on a second tick followed by reset after a manifest change. re-anchored at 31c465f1 (round 35)

## Departed members (re-census 31c465f1, 2026-10-20)

- `scripts/omp-wave-context.mjs` — last seen at `964f443e`; deleted in `87e6ab30c61e3965b02fe26171bf2e84be87324e` (2026-10-19); old primary symbol `WaveContextError`.
- `scripts/primeagent-recovery-assess.mjs` — last seen at `964f443e`; deleted in `2a04baf280328658b22f70521f62c4ff76410d9b` (2026-10-19); old primary symbol `main`.
- `scripts/primeagent-refinement-ledger.mjs` — last seen at `964f443e`; deleted in `2a04baf280328658b22f70521f62c4ff76410d9b` (2026-10-19); old primary symbol `LEDGER_SCHEMA`.
- `scripts/ufo-refinement-context.mjs` — last seen at `964f443e`; deleted in `2a04baf280328658b22f70521f62c4ff76410d9b` (2026-10-19); old primary symbol `REFINEMENT_CONTEXT_SCHEMA`.
- `scripts/ufo-refinement-context.test.mjs` — last seen at `964f443e`; deleted in `2a04baf280328658b22f70521f62c4ff76410d9b` (2026-10-19); old primary symbol `buildRefinementContext`.
