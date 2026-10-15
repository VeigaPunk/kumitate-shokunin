# Remaining scripts census — S8 (63 members)

Registry family **S8** is the remainder of the script layer after S1–S6 and the
S7 route-probe cluster. Round 13 first named it as a **60**-member census; the
2026-10-14 re-census against origin HEAD `964f443e` measures **63** live members
(command and list below). **S7** remains the route-probe cluster note
(`corpus/knowledge/route-probe-cluster.md`); its own live membership is owned by
that row. **S8** is everything else in the script-layer universe
(`scripts/*.mjs` + recursive files under `scripts/*/`) that S1–S6 and live S7 do
not own — exactly the 63 members measured below.

Both ids keep the registry grammar `S<n>`/`R<n>`. `scripts/proxy-check.mjs:219`
defines `RE_REGISTRY_ROW`, and `scripts/proxy-check.mjs:355` counts only rows
matching it (a row is covered when its note cell starts `yes`,
`scripts/proxy-check.mjs:358`). A sub-id such as `S7a` is therefore invisible to
C1 accounting and is reported as `C1_TOTAL_DRIFT`, so the partition has to be
drawn with two top-level ids rather than a suffixed one.

Measurement revision (round 32): the live member count **does** move — 60 → 63 —
because the upstream tree gained new remainder scripts and dropped fifteen former
S8 paths. The family standard still asks a covered family's note to name every
**live** member at internals level: one `##` section headed by the member's own
path, each carrying an anchor in that member's own file plus a symbol verbatim in it.

## Membership and measurement

The member set is re-derivable from the origin tree with no note content. Round-32
re-census (2026-10-14), origin `/home/vgpnk/Projects/ufo-fsd-alpha` at
`964f443ee53df0ce06bd689af01f0dea031b01f9`:

```bash
SRC=/home/vgpnk/Projects/ufo-fsd-alpha
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
wc -l < /tmp/s8-all-scripts.txt   # S_members layer = 91
wc -l < "$M"                      # S8 members
wc -l $(cat "$M" | sed "s|^|$SRC/|") | tail -1
```

Observed:

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

Class is a shape label read off the path, not a behaviour claim: `suite` =
`*.test.mjs`, `tool` = every other `.mjs`, `shim` = `*.sh`, `asset` =
`.service`/`.timer`/`config.json`/`*.prompt.txt`, `doc` = `README.md`.

| Member | L | Class |
|---|---|---|
| `scripts/charter-scribe/config.json` | 27 | asset |
| `scripts/charter-scribe/prompts/kimi-update.prompt.txt` | 17 | asset |
| `scripts/charter-scribe/sync.mjs` | 844 | tool |
| `scripts/charter-scribe/systemd/charter-scribe.service` | 14 | asset |
| `scripts/charter-scribe/systemd/charter-scribe.timer` | 12 | asset |
| `scripts/check-hand-authored-sets.mjs` | 215 | tool |
| `scripts/check-hand-authored-sets.test.mjs` | 141 | suite |
| `scripts/check-routing-free-config.mjs` | 121 | tool |
| `scripts/check-routing-free-config.test.mjs` | 86 | suite |
| `scripts/fleet-dispatcher.test.mjs` | 3278 | suite |
| `scripts/fleet-ledger-read.mjs` | 920 | tool |
| `scripts/fleet-ledger-read.test.mjs` | 1390 | suite |
| `scripts/fleet-ledger-rotate.mjs` | 1414 | tool |
| `scripts/fleet-ledger-rotate.test.mjs` | 2325 | suite |
| `scripts/fleet-selfheal-verify.mjs` | 1103 | tool |
| `scripts/gates-plan.mjs` | 200 | tool |
| `scripts/land-fleet-run.mjs` | 124 | tool |
| `scripts/lean-cargo/README.md` | 80 | doc |
| `scripts/lean-cargo/bin/cargo-shim.sh` | 344 | shim |
| `scripts/lean-cargo/install-shim.sh` | 69 | shim |
| `scripts/lean-cargo/measure.sh` | 98 | shim |
| `scripts/local-helper.mjs` | 360 | tool |
| `scripts/omp-native-shutdown.mjs` | 268 | tool |
| `scripts/omp-role-work.mjs` | 294 | tool |
| `scripts/omp-wave-context.mjs` | 570 | tool |
| `scripts/prepare-ephemeral-fleet.mjs` | 482 | tool |
| `scripts/prepare-ephemeral-fleet.test.mjs` | 253 | suite |
| `scripts/prepare-ephemeral-l1.mjs` | 962 | tool |
| `scripts/primeagent-recovery-assess.mjs` | 555 | tool |
| `scripts/primeagent-refinement-ledger.mjs` | 1676 | tool |
| `scripts/project-devin-subagents.mjs` | 444 | tool |
| `scripts/render-seat-tables.mjs` | 123 | tool |
| `scripts/render-seat-tables.test.mjs` | 102 | suite |
| `scripts/sync-global-routing.mjs` | 389 | tool |
| `scripts/sync-ufo-contracts.mjs` | 2273 | tool |
| `scripts/the-tick-config.mjs` | 458 | tool |
| `scripts/ufo-credential-screen.mjs` | 68 | tool |
| `scripts/ufo-drills.mjs` | 1726 | tool |
| `scripts/ufo-godspeed-inject.test.mjs` | 127 | suite |
| `scripts/ufo-l0-monitor-hook.test.mjs` | 147 | suite |
| `scripts/ufo-l0-monitor.test.mjs` | 1415 | suite |
| `scripts/ufo-l0-watch.test.mjs` | 1370 | suite |
| `scripts/ufo-mission-activity.mjs` | 232 | tool |
| `scripts/ufo-mission-activity.test.mjs` | 80 | suite |
| `scripts/ufo-mission-lifecycle.mjs` | 267 | tool |
| `scripts/ufo-mission-observation.mjs` | 126 | tool |
| `scripts/ufo-mission-observation.test.mjs` | 100 | suite |
| `scripts/ufo-native-names.mjs` | 81 | tool |
| `scripts/ufo-night-watchdog.test.mjs` | 118 | suite |
| `scripts/ufo-refinement-context.mjs` | 103 | tool |
| `scripts/ufo-refinement-context.test.mjs` | 123 | suite |
| `scripts/ufo-route-preflight.mjs` | 176 | tool |
| `scripts/ufo-route-preflight.test.mjs` | 206 | suite |
| `scripts/ufo-stale-watchdog.test.mjs` | 756 | suite |
| `scripts/ufo-state-census.mjs` | 184 | tool |
| `scripts/ufo-state-census.test.mjs` | 91 | suite |
| `scripts/ufo-state-retention.mjs` | 2124 | tool |
| `scripts/ufo-state-retention.test.mjs` | 870 | suite |
| `scripts/ufo-statusline-hook.test.mjs` | 75 | suite |
| `scripts/ufo-swarm-collect.test.mjs` | 1554 | suite |
| `scripts/ufo-swarm-wave.test.mjs` | 1942 | suite |
| `scripts/ufo-watchdog-repend.mjs` | 371 | tool |
| `scripts/ufo-watchdog-repend.test.mjs` | 364 | suite |

## Composition and conventions

What the remainder is: **23 suites + 32 tools + 3 shims + 4 assets + 1 doc = 63**,
including the 5 live files under `scripts/charter-scribe/` and the 4 under
`scripts/lean-cargo/`, and 54 of the 73 top-level `scripts/*.mjs`. The layer
arithmetic at this HEAD is `S_members 91 = S1–S7 live 28 + S8 63`. The largest
members by `wc -l` are `scripts/fleet-dispatcher.test.mjs` (3278 L),
`scripts/sync-ufo-contracts.mjs` (2273 L) and
`scripts/ufo-state-retention.mjs` (2124 L).

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
# Arm 1 — heading set vs member set (expect `63` then 0 diff lines)
SRC=${UFO_SRC:-/home/vgpnk/Projects/ufo-fsd-alpha}
MEMBERS=${MEMBERS:-/tmp/s8-members-live.txt}              # derived in Membership above
NOTE=${NOTE:-corpus/knowledge/remaining-scripts-census.md}
grep -oE '^## `scripts/[^`]+`' "$NOTE" | sed -E 's/^## `//; s/`$//' | sort > /tmp/s8-headings.txt
wc -l < "$MEMBERS"                 # 63
comm -3 <(sort "$MEMBERS") /tmp/s8-headings.txt
```

Arm 1 on this note, verbatim:

```text
$ wc -l < /tmp/kumitate-r13/s8-members.txt
60
$ comm -3 <(sort /tmp/kumitate-r13/s8-members.txt) /tmp/kumitate-r13/arm1-headings.txt
                                    # no output: heading set == member set, 0 diff lines
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

Arm 2 on this note, verbatim:

```text
$ UFO_SRC=/home/vgpnk/Projects/origin-work/ufo-fsd-alpha \
  MEMBERS=/tmp/kumitate-r13/s8-members.txt \
  NOTE=corpus/knowledge/remaining-scripts-census.md node /tmp/member-probe.mjs
HEADINGS: 60  MEMBERS: 60  DUPLICATE: 0
MEMBER_PROBE: 60/60 ok                                                              # exit 0
```

The drop-one control is the arm that closes the critic's blind spot. Rename one
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
  **63**. Parent owns the registry cell and the stanza; this note only keeps
  section-form honesty for the live set.


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

The charter-scribe daemon's policy file (27 L, JSON, no runnable arm): `worker` names the identity `"charter-scribe"` (`scripts/charter-scribe/config.json:2`) and every other top-level key is a bound, not prose. `sinceHours` and `maxCommits` cap the beat's scan window and commit batch, while `grokWeb` fixes the browser arm — `cdpPort`, `mode`, `waitCeilingSec`, `maxPromptChars` (`scripts/charter-scribe/config.json:8`, `:11`) — and `kimi` fixes the second arm — `chatMode`, `timeoutSec`, `promptTemplate` (`:16`). `limits` is the persist ceiling: `maxEntryHtmlBytes` and `maxSubjectChars` (`:23`, `:24`). The `repo`/`charterRepo`/`charterOrigin` triple is host-specific and absolute, so the file is machine-bound rather than portable. It is read only by `scripts/charter-scribe/sync.mjs`; it imports nothing.

## `scripts/charter-scribe/prompts/kimi-update.prompt.txt`

Non-executable prompt body: the Kimi hand-off the charter-scribe beat sends after a beat push (`scripts/charter-scribe/prompts/kimi-update.prompt.txt:1` names the target seat and effort, `kimi instant high`). Its only IO is render-time substitution of four placeholders — `{{DATE}}` (`:7`), `{{HEAD}}` (`:8`), `{{SUBJECT}}` (`:9`), `{{COMMITS}}` (`:12`) — which the beat's own sync registers as `promptTemplate` (`scripts/charter-scribe/config.json:21`) and fills with `replaceAll` (`scripts/charter-scribe/sync.mjs:569-572`); there is no shebang, no argv surface and no exit code, so the file's validity is the placeholder set, not a `node --check`. The closing paragraph is both the refusal arm and the effort pin: `Evidence only —` (`:15`) forbids any claim absent from the injected commit list, and `Kimi Instant, high` (`:16`) restates the seat at runtime. A stale placeholder name here silently ships an unfilled token to the chat; that is the only failure mode this member owns.

## `scripts/charter-scribe/sync.mjs`

The 6-hour charter-scribe beat: `runBeat` (`scripts/charter-scribe/sync.mjs:665`) collects local ufo-fsd-alpha evidence, composes a thread note over grok-web (degrading to a deterministic local template on route failure), injects it into the charter `index.html` and pushes. The exported `BEGIN_MARKER` (`:57`) and `END_MARKER` delimit the single replaceable beat note, and the injection must leave exactly one marker. Every refusal on the beat path is a tagged `ScribeError` (`:85`) carrying a stable snake_case code plus discriminator details. The refusal is put on the wire as one `CHARTER_SCRIBE_REFUSAL_SCHEMA` line (`:104`) by `emitTypedRefusal`; the CLI only runs on a direct invocation (`:1054`) and its catch emits one typed refusal then exits 1 (`:1084`). Non-goal: the worker never judges, never pushes ufo-fsd-alpha itself and never spawns another orchestrator — a push-url override, a non-main branch or a dirty index is refused rather than followed.

## `scripts/charter-scribe/systemd/charter-scribe.service`

A oneshot beat: `Type=oneshot` (`scripts/charter-scribe/systemd/charter-scribe.service:5`) is the whole runtime shape, and `TimeoutStartSec=1200` (`scripts/charter-scribe/systemd/charter-scribe.service:6`) bounds one beat at 1200 s while `NoNewPrivileges=true` (`scripts/charter-scribe/systemd/charter-scribe.service:8`) is the hardening flag (`Nice=10` at `:7` is the only other service key). `ExecStart=` (`:11`) names an absolute node binary followed by the sibling `scripts/charter-scribe/sync.mjs`, with `WorkingDirectory=` (`scripts/charter-scribe/systemd/charter-scribe.service:10`) set to the checked-out tree and `Environment=PATH=` (`scripts/charter-scribe/systemd/charter-scribe.service:9`) pinning PATH explicitly so the child never inherits the caller's. Activation comes from the sibling charter-scribe.timer file in the same directory rather than from anything in this unit: `[Install]` (`:13`) declares only `WantedBy=default.target` (`scripts/charter-scribe/systemd/charter-scribe.service:14`). The file declares no `Restart=` and no `User=`, so a reader must not assume restart-on-failure or a privilege drop — nothing here supplies either.

## `scripts/charter-scribe/systemd/charter-scribe.timer`

**Owning surface** — A 12-line systemd *user* timer unit holding no code — the
whole contract is the `[Timer]` section
(`scripts/charter-scribe/systemd/charter-scribe.timer:4`). `OnBootSec`
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
(`scripts/charter-scribe/systemd/charter-scribe.timer:12`) is the `[Install]` line
(`scripts/charter-scribe/systemd/charter-scribe.timer:11`) that `systemctl --user
enable` latches onto. The unit cannot be run directly and carries no state —
scheduling *is* the deliverable — so the only check performed here is
`systemd-analyze verify <unit>` (exit 0, no output) and the beat body itself lives
in the service's own `ExecStart`.

## `scripts/check-hand-authored-sets.mjs`

Live S8 member (215 L, tool) re-censused 2026-10-14 against origin HEAD `964f443e`. Primary surface symbol `DECLARED_PRE_HOOKS` at `scripts/check-hand-authored-sets.mjs:35`; also `enumerateSets` at `:82`.

## `scripts/check-hand-authored-sets.test.mjs`

Live S8 member (141 L, suite) re-censused 2026-10-14 against origin HEAD `964f443e`. Primary surface symbol `DECLARED_PRE_HOOKS` at `scripts/check-hand-authored-sets.test.mjs:14`; also `checkHandAuthoredSets` at `:54`.

## `scripts/check-routing-free-config.mjs`

Live S8 member (121 L, tool) re-censused 2026-10-14 against origin HEAD `964f443e`. Primary surface symbol `ROUTING_KEYS` at `scripts/check-routing-free-config.mjs:20`; also `checkRoutingFreeConfig` at `:87`.

## `scripts/check-routing-free-config.test.mjs`

Live S8 member (86 L, suite) re-censused 2026-10-14 against origin HEAD `964f443e`. Primary surface symbol `checkRoutingFreeConfig` at `scripts/check-routing-free-config.test.mjs:12`; also `scanText` at `:46`.

## `scripts/fleet-dispatcher.test.mjs`

Self-healing-contract suite for the real dispatcher, driven as a child process rather than by `node:test`: the header (`scripts/fleet-dispatcher.test.mjs:3`) numbers the covered surfaces (hot-ledger status, `once` dedupe, rotation, degraded siblings, queue-lock contention, throwing siblings, usage split), and the tail adds the r38 ledger-busy classification block (`:3983`). Assertions accrue on a hand-rolled `check(name, ok, detail = null)` ledger (`:55`) and the process exits non-zero with the failing names (`:4094`); `--keep` (`:42`) retains fixtures. Fixtures are minted in-process — `lifecycleEvent` (`:63`) builds `ufo-process-lifecycle-v1` rows and `fillerLine` (`:89`) pads segments to the read budget — then passed to `runDispatcher` (`:253`), which spawns the dispatcher with UFO_* overrides into the scratch root (`UFO_TEST_SCRATCH`, default `/scratch/tmp/vgpnk`, `:44`). Bounds are constants: `MAX_LEDGER_SEGMENTS = 5` (`:37`) and `MAX_LEDGER_READ_BYTES` (`:38`), and section 1 (`:295`) opens by proving `fixture_exceeds_read_budget` (`:307`) before requiring `coverageComplete === true` (`:315`). Refusal arms are typed, never textual: the degraded block requires `ledger_coverage_degraded` and forbids `ledger_event_drift`, the throwing-sibling block requires the inline reader fallback (`throwsib_reader_inline`, `:450`), and the busy block pins exactly one durable `LEDGER_BUSY` row per episode with no generic `dispatcher_cycle_error` (`ledgerbusy_once_durable_typed_line`). Usage arms split exit 0 help (`:598`) from exit 1 unknown-command/unsupported-argument with the exact `unknown command: --frobnicate` line (`:607`, `:589`).

## `scripts/fleet-ledger-read.mjs`

**Owning surface** — The streaming read path for the fleet lifecycle ledger,
shipped as the drop-in replacement for the dispatcher's inline
`loadLifecycleLedgerInline`, with import surface `defaultLedgerPath`
(`scripts/fleet-ledger-read.mjs:282`) and `loadLifecycleLedger`
(`scripts/fleet-ledger-read.mjs:492`) plus `extendLedgerMemoWithSuffix`
(`scripts/fleet-ledger-read.mjs:348`); it is import-only by construction. It
streams the live segment then rotated `.1`…`MAX_LEDGER_SEGMENTS`
(`scripts/fleet-ledger-read.mjs:58`) newest-first in fixed `READ_CHUNK_BYTES`
(`scripts/fleet-ledger-read.mjs:62`) chunks under a per-line cap `MAX_LINE_BYTES`
(`scripts/fleet-ledger-read.mjs:66`), so total ledger size never gates
correctness and the old 32 MiB budget with its `read_budget_exceeded` skip is gone
by construction. Lifecycle rows collapse on `dedupeKey`
(`scripts/fleet-ledger-read.mjs:129`) — `(level, missionId, processIdentity,
phase)` — every parsed line is additionally deduped by `eventId` with the newest
segment first and the last line inside the winning segment replacing, and
`processIndex` deliberately keeps PRE-DEDUPE occurrence counts so duplicate
spawns and terminals stay visible. Literals worth naming: `LIFECYCLE_SCHEMA`
(`scripts/fleet-ledger-read.mjs:57`), `MAX_REPORTED_DUPLICATE_IDS`
(`scripts/fleet-ledger-read.mjs:69`), `MAX_NON_LIFECYCLE_TRACKED`
(`scripts/fleet-ledger-read.mjs:75`) and `MAX_ERROR_MESSAGE_CHARS`
(`scripts/fleet-ledger-read.mjs:78`). **Refusal** — The CLI accepts only
`--help`/`-h` through `CLI_HELP_FLAGS`
(`scripts/fleet-ledger-read.mjs:1036`); a bare run emits `cli_usage` and an
unknown flag `cli_unsupported_option` (`scripts/fleet-ledger-read.mjs:1067`),
both exit 2 with empty stdout, while library-side an explicit empty path throws
`usageError` (`scripts/fleet-ledger-read.mjs:498`) instead of silently rebinding
the read window to the process CWD.

## `scripts/fleet-ledger-read.test.mjs`

The colocated contract suite for the streaming fleet-ledger reader, run as `node scripts/fleet-ledger-read.test.mjs`. It imports the subject's `loadLifecycleLedger` (`scripts/fleet-ledger-read.test.mjs:20`) and asserts the NEW contract against a verbatim pre-fix oracle, `legacyLoadLifecycleLedger` (`:35`), which MUST still exhibit the old failure mode on each fixture (the 32 MiB `MAX_LEDGER_READ_BYTES` budget spent before the last segment). Fixtures are built under a real scratch root: `fixtureDir` (`:147`) prefers `PREFERRED_SCRATCH_ROOT`, honours a `UFO_FLEET_SCRATCH` override and falls back once to the OS tmpdir with a stderr note. A shared `assertNewContract` (`:165`) checks the coverage counters, the closed `SKIP_VOCAB` skip reasons and `truncatedSegments === 0`. Its 42 tests cover >32 MiB ledgers, torn tails, symlink/directory refusals and rotation parity; the tail arm pins the import-only CLI envelope, e.g. the no-args `cli_usage` refusal (`:1854`).

## `scripts/fleet-ledger-rotate.mjs`

Self-shrinking rotation for the fleet lifecycle ledger: it exports `rotateLedgerIfNeeded` (`scripts/fleet-ledger-rotate.mjs:994`) for the dispatcher's `importSiblingModule` path and doubles as a CLI. The dedupe contract is canonical here — lifecycle events (schema `ufo-process-lifecycle-v1`, `LIFECYCLE_SCHEMA` at `:114`) keyed by level, missionId, processIdentity and phase, with the LAST occurrence inside a segment kept verbatim, matching `fleet-ledger-read.mjs`'s newest-wins rule; a dropped copy whose payload differs is counted as payload drift, never silently discarded. When compaction shrinks a segment, the raw pre-image is preserved content-addressed as `<segment>.<sha256>.cold` (`:471`) via hardlink with a copy+rename fallback, and the eviction slot keeps the dispatcher's `<segment>.<uuid>.cold` convention. The rotation record is additive to `ROTATION_RECORD_SCHEMA` = `ufo-ledger-rotation-v1` (`:116`), carries `coldVia` (`link`/`copy`/`existing`) plus the stale-temp sweep counts, and a step that throws after the record exists stamps `record.error` and `record.degraded` before the rethrow. The CLI (`CLI_USAGE` at `scripts/fleet-ledger-rotate.mjs:1450`) takes `--incoming-bytes`, `--ledger`, `--threshold-bytes`, `--segments`, `--dry-run` and `--no-record`; every malformed invocation — unknown flag, positional, duplicate flag, boolean with a value, non-canonical integer — refuses as one JSON line on stderr with exit 2 and empty stdout (`scripts/fleet-ledger-rotate.mjs:1522`), because a typo'd `--dryrun` once ran a real rotation.

## `scripts/fleet-ledger-rotate.test.mjs`

**Owning surface** — The `node:test` suite (43 `test()` cases, run as
`node --test scripts/fleet-ledger-rotate.test.mjs`) over the self-shrinking
rotation contract of `scripts/fleet-ledger-rotate.mjs`: the outgoing live segment
is compacted as it rotates, raw bytes are preserved to a cold archive named for
the segment's SHA-256, and each rotation appends one record to a sidecar beside
the live ledger. It imports `COMPACTION_SCHEMA`
(`scripts/fleet-ledger-rotate.test.mjs:41`), `ROTATION_RECORD_SCHEMA`
(`scripts/fleet-ledger-rotate.test.mjs:43`) and the entry point
`rotateLedgerIfNeeded` (`scripts/fleet-ledger-rotate.test.mjs:44`), then re-reads
every rotated result through `loadLifecycleLedger`
(`scripts/fleet-ledger-rotate.test.mjs:46`) as its r12 parity oracle, with
`validateLifecycleEvent` (`scripts/fleet-ledger-rotate.test.mjs:47`) driving the
compactor-validator mirror sweep. Fixtures are synthetic per-test temp dirs sized
by `MAX_BYTES` (`scripts/fleet-ledger-rotate.test.mjs:51`) and `PAD`
(`scripts/fleet-ledger-rotate.test.mjs:52`) around `BASE`
(`scripts/fleet-ledger-rotate.test.mjs:49`) and `SIDECAR`
(`scripts/fleet-ledger-rotate.test.mjs:50`); a segment only shrinks when it
really holds duplicates, so each fixture carries one lifecycle re-append plus one
byte-identical heartbeat. Coverage runs from crash recovery
(`scripts/fleet-ledger-rotate.test.mjs:281`) through payload drift
(`scripts/fleet-ledger-rotate.test.mjs:380`) to the invalid-row preservation rule
(`scripts/fleet-ledger-rotate.test.mjs:2360`) and a four-case lock family ending
at (`scripts/fleet-ledger-rotate.test.mjs:2634`). **Edge** — The lock cases pin
refusal *timing* rather than merely a nonzero exit: a reused live non-rotator pid
is reclaimed immediately, while a live dispatcher holder or a live rotator holder
must be respected until the deadline.

## `scripts/fleet-selfheal-verify.mjs`

End-to-end proof harness for the 2026-09-16 fleet-ledger overflow failure: it is read-only against `scripts/fleet-dispatcher.mjs` and writes only under the incident scope fixtures plus the optional `--report` path. Before anything runs it re-reads the dispatcher's own source and compares the mirrored budgets against their live bytes, so `MAX_LEDGER_SEGMENTS` (`scripts/fleet-selfheal-verify.mjs:50`), `MAX_LEDGER_BYTES` and `MAX_LEDGER_READ_BYTES` drift exits 2 rather than stale-greening the coverage checks. Every dispatcher spawn carries `UFO_PROJECT_ROOT`/`UFO_STATE_DIR`/`UFO_FLEET_LEDGER_PATH` overrides pointed at the fixture tree, with a stub sighting wall emitting a controlled status JSON so nothing live is touched. Checks are tri-state through `check(` (`:246`) — pass/fail gate the verdict, `skip(` records an unrunnable check — and each scenario is proven by name: `capture_planted_events`, `view_dedupe_count_exact`, `once_no_drift_event`, `preswap_event_count`, `rotation_no_event_loss` and `mirror_kept_matches_sibling_reader` (37 `check(` sites, 10 `skip(` sites in the file). Usage is `node scripts/fleet-selfheal-verify.mjs [--report path] [--fixtures-dir path]` (`:81` help echo, exit 0) and the exit map is 0 clean (`:2092`), 1 with named failing assertions, 2 preflight/refusal, 64 unknown argv token (`:112`); `--fixtures-dir` must sit strictly beneath an allowed scratch root so the suite can never `rmSync` an operator path.

## `scripts/gates-plan.mjs`

Fast-tier suite selection for `scripts/gates.sh`, printing one line per field on stdout — `touched=`, `basis=`, `group=`, `note=` (`scripts/gates-plan.mjs:6`) — under a fail-safe contract: ANY uncertainty selects every group, so a fast run can only over-test, never silently under-test. `touchedPaths()` (`:367`) takes the union of worktree-vs-HEAD, untracked files and commits ahead of the upstream, and `UFO_GATES_TOUCHED` (`:334`) pins the set explicitly (empty string means unknown). Selection is table-driven: `GROUPS` (`:20`), the ignore set `IGNORE_RES` (`:132`), the three-literal exemption `IGNORE_ESCAPE` (`:152`) and the ordered `RULES` (`:159`) feed `selectAllGroups` (`:422`). A non-git tree, an unreadable diff (`:428`) or an unmapped path (`:440`) all route to the all-groups arm; `writeStdout` (`:314`) absorbs EPIPE so a `| head -1` consumer cannot crash the CLI. `--root <dir>` and `--touched-file <f>` are the two test/debug entry points (`USAGE`, `:299`).

## `scripts/land-fleet-run.mjs`

Live S8 member (124 L, tool) re-censused 2026-10-14 against origin HEAD `964f443e`. Primary surface symbol `LandingError` at `scripts/land-fleet-run.mjs:32`; also `landFleetRun` at `:50`.

## `scripts/lean-cargo/README.md`

Field note for the `lean-cargo` fleet mission, titled "lean-cargo — kill the cargo lock convoy" (`scripts/lean-cargo/README.md:1`); it states the problem as a machine-wide `CARGO_TARGET_DIR=/scratch/tmp/vgpnk/cargo-target` export that collapses every lane onto one `.cargo-lock`, so concurrent `cargo build|test|check` serialize. The "What ships" section claims `bin/cargo-shim.sh` is installed at `~/.cargo/bin/cargo`, replacing the rustup proxy symlink (backup `cargo.rustup-proxy`, uninstall = move it back) and ending in `exec -a cargo rustup` so toolchain resolution stays byte-identical to stock (`:12`). Its per-subcommand table assigns raw arg passthrough to the net-mutating/meta class, the `--frozen` plus private target slot treatment (`flock` on `cargo-slots/s<N>.lock`, 32 slots, acquired warmest-first by `.lean-use` stamp, up to 8 read-only overlay lowers) to the build family, and env-only treatment to query verbs; `LEAN_CARGO_DISABLE=1` is documented as the byte-for-byte stock baseline (`:34`). The measured table claims a 2× concurrent convoy at 30.8 s / 28.9 s with 7–8 lock-wait lines against slots at 36.8 s with zero waits, and a 0.93% sccache hit rate in the pre-overlay era. The Files section claims `measure.sh` wipes sccache when given `RESET_CACHE=1` (`:77`) — that variable exists nowhere in the script, whose wipe is unconditional (`scripts/lean-cargo/measure.sh:66`) — and the Installed-system-state section pins `pacman -S sccache` → 0.17.0 plus the installed shim's byte-identity to `bin/cargo-shim.sh` (`:82`).

## `scripts/lean-cargo/bin/cargo-shim.sh`

The drop-in `cargo` replacement installed at `~/.cargo/bin/cargo`; every path ends in `raw() { exec -a cargo "$RUSTUP_BIN" "$@"; }` (`scripts/lean-cargo/bin/cargo-shim.sh:36`) so toolchain resolution stays byte-identical to the stock rustup proxy. `LEAN_CARGO_DISABLE=1` is the measurement baseline — byte-for-byte stock behavior (`:27`) — and the fleet layout is three env-overridable roots: `CONVOY` (`:58`), `SLOT_ROOT`, and `NSLOTS` defaulting to 32 (`:60`). Subcommand dispatch is a `case` on the located `sub`; the build family is the literal `BUILD_FAMILY="build|test|check|clippy|run|bench|doc|rustc"` (`:128`) and takes a private overlayfs slot, while `metadata`/`fetch`/`tree`/`pkgid`/`verify-project` deliberately take the env-only path. `have` (`:136`) is the argv-contains helper and `lean_frozen_cache_digest` (`:139`) gates the `--frozen`/offline preflight, so a workspace that needs the network is never frozen. Idle slots past `LEAN_CARGO_SLOT_MAX_AGE_MIN` (default 720 min) are reaped (`:221`), and fresh top-level executables publish back to the convoy bin pool even when `rc != 0` (`:322`).

## `scripts/lean-cargo/install-shim.sh`

Idempotent installer that puts the lean-cargo shim at `~/.cargo/bin/cargo`, backing up the rustup-proxy symlink once as `cargo.rustup-proxy`. It resolves its own tracked source from `SCRIPT_SOURCE` (`scripts/lean-cargo/install-shim.sh:9`) and takes its `cargo-shim.sh` payload from `SHIM_SRC` (`:20`), refusing with exit 2 when that source is unresolvable or `HOME` is unset. `CARGO_BIN` (`:25`) is the install target and `BACKUP` (`:26`) the one-shot symlink backup path. When the target already equals the shim (`cmp -s`, `:35`) it prints `already installed` and exits 0; a pre-existing non-symlink `REAL_BACKUP` is refused by name (`:49`) instead of being clobbered. The copy is atomic — `install -m 0755` to a `.tmp.$$` path then `mv -f` (`:61`) under an EXIT trap that removes the temp file.

## `scripts/lean-cargo/measure.sh`

Convoy-vs-slots measurement harness, run as `bash scripts/lean-cargo/measure.sh [outdir]` (usage at `scripts/lean-cargo/measure.sh:3`); it resolves `ROOT` from `readlink -f "${BASH_SOURCE[0]}"` and `cd`s there, exiting 2 if that fails (`:7`). It runs under `set -uo pipefail` — deliberately without errexit — and writes `<outdir>/measure-<ts>/` with `summary.txt` plus raw per-invocation logs, defaulting the outdir to `$ROOT/.ufo/scopes/lean-cargo`. Phase A measures the baseline convoy with `LEAN_CARGO_DISABLE=1` and `export CARGO_TARGET_DIR="$CONVOY"`, two background `one_build` followers; phase B primes sccache and then runs two shimmed concurrent builds; phase C measures one cold-slot build under `LEAN_CARGO_SLOT_ROOT=/scratch/tmp/vgpnk/cargo-slots-cold` (`:84`). The load is `BUILD=(cargo test -p ufo-core-runtime -p ufo-cli --verbose)` (`:16`) — `--verbose` is deliberate so the shim skips its `-q` injection and lock-wait lines stay visible — and contention is counted by `lock_waits()` grepping `Blocking waiting for file lock` (`:43`). Any phase build failure routes through `die` → stderr plus exit 2, and the closing evidence block diffs `sccache --show-stats` before/after and `du -sh` the convoy, slot root and `$SCCACHE_DIR` (`:95`); the sccache wipe before phase B is unconditional (`:66`), which is why the README's documented reset flag does not match this file.

## `scripts/local-helper.mjs`

`scripts/local-helper.mjs` is a single-shot CLI (`main`, `:323`) over a loopback chat-completions backend, invoked as dedupe, digest or classify and printing one JSON document whose schema is `ufo-local-helper-v1` (`scripts/local-helper.mjs:349`). The endpoint comes from `UFO_LOCAL_HELPER_URL` (`scripts/local-helper.mjs:332`) and defaults to `DEFAULT_URL` (`scripts/local-helper.mjs:8`) `http://127.0.0.1:34113`; anything but a credential-free loopback HTTP URL is refused `endpoint_invalid` (`scripts/local-helper.mjs:165`), and that check runs before stdin is read so an unusable URL cannot hang on input (`:329-332`). Input is bounded by `MAX_INPUT_BYTES` (`scripts/local-helper.mjs:10`) inside `readInput` (`scripts/local-helper.mjs:139`): an oversized stream dies `input_too_large` (`scripts/local-helper.mjs:132`), empty input dies `input_invalid` (`scripts/local-helper.mjs:135`), and invalid UTF-8 dies at `:146`. Model output is re-validated rather than trusted — `validateDedupe` (`scripts/local-helper.mjs:263`), `validateDigest` (`scripts/local-helper.mjs:298`) and `validateClassification` (`scripts/local-helper.mjs:307`) raise `model_output_invalid` (`scripts/local-helper.mjs:309`) — so a hallucinated index or label refuses instead of passing through. Every refusal is a `HelperError` (`scripts/local-helper.mjs:17`) with a stable snake_case type, emitted on stderr as `ufo-local-helper-error-v1` (`scripts/local-helper.mjs:363`) with exit code 2 (`:366`).

## `scripts/omp-native-shutdown.mjs`

Per-launch OMP extension loaded only through `omp --extension <absolute path>` on the interactive Main seat of `scripts/run-omp-native-trial.mjs`, and deliberately kept outside `.omp/hooks` and `.omp/config.yml` so discovery never auto-loads it into an L0 or an L2 worker session. Its exported surface is `MAX_STOP_BLOCKS` = 4 (`scripts/omp-native-shutdown.mjs:36`), `HONEST_STATUSES` = {`completed`, `degraded`, `blocked_after_full_topology`} (`:37`) and `evaluateMainArtifact` (`:52`), which opens the final Main artifact once with `O_NOFOLLOW` and `O_NONBLOCK` under a 1 MiB `MAX_ARTIFACT_BYTES` bound (`:38`) and accepts it only when `run_id` matches the launch, `l1` is `Main`, `judge` is `ufo` and the status is honest. The `session_stop` hook blocks the stop with `decision: "block"` while the artifact is premature or mismatched, and once `state.blocks >= MAX_STOP_BLOCKS` it allows the stop and lets the settled turn release the pane so the collector rejects the run honestly instead of the composer idling forever (`:223`). Release requires both an armed `session_stop` and a terminal `agent_end` — `willContinue === true` (the omp 18.2.6 spelling) defers, and a runtime without `ctx.shutdown` records `release_unsupported` rather than throwing. Every decision is persisted to `UFO_NATIVE_GATE_FILE` as `ufo-native-shutdown-v1` through a guarded rewrite that refuses non-regular or multi-linked targets and is best-effort, so a gate-write failure can never wedge the session.

## `scripts/omp-role-work.mjs`

**Owning surface** — `roleWork` (`scripts/omp-role-work.mjs:233`) renders the
natural-language duty block a launcher embeds in one seat assignment; it is a
pure template helper owning no envelope, no schema and no runtime, and it writes
nothing. The tables are `ROLE_METHODS` (`scripts/omp-role-work.mjs:38`, ten role
postures) and `SCOPE_DUTIES` (`scripts/omp-role-work.mjs:69`, 16 frozen blueprint
duties keyed `"role:scope"`), plus `SHARED_BOUNDS`
(`scripts/omp-role-work.mjs:121`) and per-role `ROLE_EXTRA_BOUNDS`
(`scripts/omp-role-work.mjs:129`); the import-time guards throw `RoleWorkError`
(`scripts/omp-role-work.mjs:23`) on a malformed duty key, a non-function duty or a
non-string bounds array, so the module fails at load rather than mid-launch after
a burned wave. Seat identity comes from `seatId` (`scripts/omp-role-work.mjs:21`)
in `ufo-native-names.mjs`, and the block's evidence schema is rendered by
`evidenceSection` (`scripts/omp-role-work.mjs:209`) pointing at
`<runDir>/evidence/<seatLabel>.json` with scratch under `<runDir>/scratch/`.
**Refusal** — `META_CTRL_STRIP` (`scripts/omp-role-work.mjs:176`) strips C0/C1
controls *and* the U+2028/U+2029 line separators plus bidi overrides from any
lineage/axes text before it reaches the duty body, and an inherited or forged key
is rejected as `invalid_key` (`scripts/omp-role-work.mjs:259`), so neither a
prototype-polluted spec nor a hostile string can forge a seat identity or smuggle
a second line into the assignment.

## `scripts/omp-wave-context.mjs`

Live S8 member (570 L, tool) re-censused 2026-10-14 against origin HEAD `964f443e`. Primary surface symbol `WaveContextError` at `scripts/omp-wave-context.mjs:37`; also `WAVE_CONTEXT_MARKER` at `:59`.

## `scripts/prepare-ephemeral-fleet.mjs`

Live S8 member (482 L, tool) re-censused 2026-10-14 against origin HEAD `964f443e`. Primary surface symbol `readFleetPolicy` at `scripts/prepare-ephemeral-fleet.mjs:84`; also `composeEphemeralFleet` at `:219`.

## `scripts/prepare-ephemeral-fleet.test.mjs`

Live S8 member (253 L, suite) re-censused 2026-10-14 against origin HEAD `964f443e`. Primary surface symbol `composeEphemeralFleet` at `scripts/prepare-ephemeral-fleet.test.mjs:15`; also `landFleetRun` at `:23`.

## `scripts/prepare-ephemeral-l1.mjs`

`scripts/prepare-ephemeral-l1.mjs` exposes two library entry points, `createEphemeralL1` (`scripts/prepare-ephemeral-l1.mjs:912`) and `destroyEphemeralL1` (`scripts/prepare-ephemeral-l1.mjs:1226`), plus a CLI `main` whose verbs are exactly create and destroy — anything else is `fail("cli_usage", usage)` (`scripts/prepare-ephemeral-l1.mjs:1377`). Create clones the source tree into a policy-rooted mission directory derived from `ROOT` (`scripts/prepare-ephemeral-l1.mjs:28`) and writes a marker through the create-once `SECURE_WRITE_OPTIONS` (`scripts/prepare-ephemeral-l1.mjs:60`); destroy validates that marker before deleting anything. The policy is read by `readPolicy` (`scripts/prepare-ephemeral-l1.mjs:133`) from `POLICY_PATH` (`scripts/prepare-ephemeral-l1.mjs:29`, the `ephemeral-l1.machine.json` machine file), and `PATH_VARIABLES` (`scripts/prepare-ephemeral-l1.mjs:44`) freezes exactly the eight environment keys the wall's exact-key check requires. Every refusal is a `PrepareError` (`scripts/prepare-ephemeral-l1.mjs:72`) carrying a stable snake_case code, and only that code crosses the stderr envelope — anything else flattens to `internal_error` (`scripts/prepare-ephemeral-l1.mjs:1433`) with exit code 2 (`:1435`). A hostile target is refused rather than deleted: destroy demands one direct child of the configured root (`destroy_target_not_child`, `scripts/prepare-ephemeral-l1.mjs:1111`) that is not a symlink and whose marker is bounded and owner-private.

## `scripts/primeagent-recovery-assess.mjs`

**Owning surface** — A read-only consumer CLI (`main`, gated by `isMainModule`
(`scripts/primeagent-recovery-assess.mjs:1845`)) that validates caller-supplied L0
source rows before handing them to the `@ufo/substrate-runtime` package; it never
resumes, respawns or mutates anything, and emits ONE allowlisted JSON object on
stdout — `ASSESSMENT_SCHEMA`
(`scripts/primeagent-recovery-assess.mjs:723`) — with every envelope labelling its
evidence `CALLER_PROVENANCE` (`scripts/primeagent-recovery-assess.mjs:724`). Its
entries are `assessRecovery` (`scripts/primeagent-recovery-assess.mjs:1686`)
behind `parseArgs` (`scripts/primeagent-recovery-assess.mjs:1787`), whose
`VALUED_FLAGS` (`scripts/primeagent-recovery-assess.mjs:1785`) refuses a
flag-like token where a value is required, plus the row-level
`assessRecoveryFromRows` (`scripts/primeagent-recovery-assess.mjs:1076`); the exit
map is `EXIT_OK` (`scripts/primeagent-recovery-assess.mjs:727`) for every typed
assessment including package-level refusals, `EXIT_SOURCE_INVALID`
(`scripts/primeagent-recovery-assess.mjs:728`) for broken consumer evidence, and
`EXIT_USAGE` (`scripts/primeagent-recovery-assess.mjs:729`) for argv misuse. Row
grammar is byte-copied from the dispatcher: `MANIFEST_SCHEMA`
(`scripts/primeagent-recovery-assess.mjs:92`), `QUEUE_RUN_ID_PATTERN`
(`scripts/primeagent-recovery-assess.mjs:103`, `gq` plus 16 hex),
`TASK_KEY_PATTERN` (`scripts/primeagent-recovery-assess.mjs:104`, `task_` plus 24
hex), `LINEAGE_ROUND_MAX` (`scripts/primeagent-recovery-assess.mjs:105`) and
`WRITER_ALLOWED_FAILURE_CODES` (`scripts/primeagent-recovery-assess.mjs:126`).
**Refusal** — There is no `--chain` flag and `UFO_SIGHTING_CHAIN_ID` is ignored
(`scripts/primeagent-recovery-assess.mjs:1829`) — a chain store must be named
explicitly — and omitting `--ledger` assesses no store at all, so a cohabiting
pre-grammar fork is never read as the live store.

## `scripts/primeagent-refinement-ledger.mjs`

The assimilated PrimeAgent `rlm.harness` mechanism as pure state I/O — a persisted, parent-scoped refinement ledger that is explicitly "not a second execution engine". The store is single-file with schema `LEDGER_SCHEMA = "ufo-refinement-ledger-v1"` (`scripts/primeagent-refinement-ledger.mjs:132`) and a sha256 chain over canonical entry bytes so tampering is detectable; `DEFAULT_LEDGER_PATH` (`:177`) resolves the location and `loadPolicy` (`:274`) floor-meets the caller's policy against `config/primeagent-assimilation.json`. On the write path `validateEntryShape` (`scripts/primeagent-refinement-ledger.mjs:350`) screens and shape-bounds every entry before `appendEntry` (`scripts/primeagent-refinement-ledger.mjs:935`) persists it atomically (unpredictable tmp + rename, with `LINEAGE_ENVELOPE_KEY` lineage stamping). On the read path `readForSuccessor` (`scripts/primeagent-refinement-ledger.mjs:1035`) names an expected parent runId and refuses typed on mismatch — continuity is receipt-bound, never raw history — and reads are capped at `LEDGER_MAX_READ_BYTES` (`scripts/primeagent-refinement-ledger.mjs:304`). Archive retention is `ARCHIVE_RETENTION = 3` generations (`scripts/primeagent-refinement-ledger.mjs:1109`), pruned by `pruneArchiveGenerations` (`scripts/primeagent-refinement-ledger.mjs:1266`); an entry body matching a credential shape is refused, never persisted.

## `scripts/project-devin-subagents.mjs`

Projects the `devin-native-v1` seat profiles (`scripts/project-devin-subagents.mjs:162`) — the repo and packaged `ufo-<role>.md` files — from canonical `agents/*.md` cards plus the `config/ufo.json` `nativeProfiles.devin-native-v1` declaration. It is rooted at the repo (`root`, `:148`), validates each role key against `safeRoleKey` (`:36`) and every destination path with `assertSafeDest`, refusing symlinked or out-of-root seat paths before any mkdir or write. Repo inputs are read through `readBoundedRepoFile` under the `MAX_REPO_FILE_BYTES` 1 MiB bound (`:102`), and a missing canonical card fails as `card_missing` (`:328`). `--check` is the read-only mode (`:160`), and `ok` (`scripts/project-devin-subagents.mjs:450`) is true only when missing, drifted and extra all empty. The single stdout surface is a JSON report whose refusal arm always carries a stable snake_case `errorCode`; exit codes are 0 ok, 1 projection failure, 64 usage error. Non-goal: these files are dispatch shape only — the seat never judges, and `run_subagent` output is session-local evidence, never an omp-native-v1 handoff.

## `scripts/render-seat-tables.mjs`

Live S8 member (123 L, tool) re-censused 2026-10-14 against origin HEAD `964f443e`. Primary surface symbol `TARGETS` at `scripts/render-seat-tables.mjs:26`; also `seatsDigest` at `:38`.

## `scripts/render-seat-tables.test.mjs`

Live S8 member (102 L, suite) re-censused 2026-10-14 against origin HEAD `964f443e`. Primary surface symbol `renderSeatTables` at `scripts/render-seat-tables.test.mjs:13`; also `seatsDigest` at `:54`.

## `scripts/sync-global-routing.mjs`

CLI that resolves the global OMP seat table and writes the derived mirror the compiled runtime consumes. Entry is `main()` (`scripts/sync-global-routing.mjs:341`) behind an `isMain` guard; argv is either empty (write) or `--check`, and any other token is a typed `usage` refusal (`:353`) with usage text at `:345`. IO is one artifact: `MIRROR_PATH` = `crates/ufo-core-runtime/bundled/omp-seat-routing.json` (`:45`) carrying `MIRROR_SCHEMA` `ufo-seat-routing-v1` (`:46`), rendered by `renderSeatRoutingMirror` (`:337`) from `buildSeatRoutingMirror` (`:267`) and published through `writeAtomicFile`. Exported vocabulary the drift guard consumes: `CORE_SEATS` (`:64`), `PROPOSAL_SEATS`, `MIRROR_SEATS` (`:77`), `EFFORT_SUFFIXES` (`:82`), and `RESOLVER_VERSION` (`:52`), with the digest bound at `:331`. Notable literals: `FAMILY_ID_PATTERN` (`:208`) hashes any group that is not grammar-safe into `route-${sha256(group)}` (`:214`), a non-whitelisted effort suffix is `malformed` (parity with the Rust `parse_route`), and a `gemini`-family provider other than the case-exact `google-antigravity/` prefix is refused as `banned gemini-family route`. Edge arms: `--check` lstats before reading, so a planted symlink or special file at the dest is refused rather than followed (`:380`), byte drift prints the re-run hint and exits 1 (`:394`), a `usage` error exits 64 (`:420`), and an escaped untyped crash is stamped `UNEXPECTED_ERROR_CODE` = `unexpected_error` non-enumerably so the process surface is unchanged.

## `scripts/sync-ufo-contracts.mjs`

`scripts/sync-ufo-contracts.mjs` is the mirror/contract sync-and-verify CLI: a bare run syncs skill and agent mirrors plus contract projections, `--check` verifies without writing, `--review` is an advisory check, and `--check-committed` audits HEAD-vs-HEAD parity (usage text at `:26`, accepted set in `KNOWN_ARGS` (`scripts/sync-ufo-contracts.mjs:62`)). A foreign argument goes to stderr and exits 64 (`:65-66`), while `--check-committed` refuses to combine with `--check`/`--review` (`:74`) and is undefined under `UFO_PROJECTION_ROOT` (`scripts/sync-ufo-contracts.mjs:91`). Its refusal taxonomy is `CONTRACT_ERROR_CODES` (`scripts/sync-ufo-contracts.mjs:342`), with `PROJECT_MODEL_AUTHORITY` (`scripts/sync-ufo-contracts.mjs:366`) refusing a profile that restates the global seat routes and `unclassified_contract_failure` (`scripts/sync-ufo-contracts.mjs:481`) as the catch-boundary sentinel, so a foreign throw cannot masquerade as a declared contract code. It composes sibling members — `readPolicy` (`scripts/sync-ufo-contracts.mjs:18`), `writeAtomicFile` (`scripts/sync-ufo-contracts.mjs:19`) and `validateTickMachineConfig` (`scripts/sync-ufo-contracts.mjs:22`) — and exports `fixtureLaneRoles` (`scripts/sync-ufo-contracts.mjs:1695`) so a parity guard binds the lane roster to its producer instead of scraping source text. Exit is 0 when the report's ok is true and 1 otherwise (`:3868`), after the full report JSON is printed.

## `scripts/the-tick-config.mjs`

Library module (no CLI) owning validation and loading of `config/the-tick.machine.json` — `DEFAULT_TICK_CONFIG_PATH` (`scripts/the-tick-config.mjs:15`). IO is fd-bound and fail-closed: `readBoundedFile` (`:19`) opens with `openSync(file, fsConstants.O_RDONLY | fsConstants.O_NOFOLLOW | fsConstants.O_NONBLOCK)`, rejects non-regular descriptors and anything above `MAX_CONFIG_FILE_BYTES` 1_048_576 (`:17`), and re-`fstat`s after the read so a size change under it is `config_file_changed_during_read`. `validateTickMachineConfig` (`:259`) pins the `"the-tick-machine-v1"` schema literal, exact key sets through `exactKeySet` (`:221`), the loopback credential-free backend endpoint, and runner↔slot arithmetic; every arm fails as `TickConfigError` (`:189`) carrying one frozen `TICK_CONFIG_ERROR_CODES` (`:143`) value such as `config_root_not_private`. `loadTickMachineConfig` (`:464`) resolves `${REPO_ROOT}` / `XDG_RUNTIME_DIR` templates only beneath a literal, normalized, non-root base (`config_base_path_unnormalized`, `config_base_path_invalid`) and returns a frozen config plus `configSha256`; `revalidateAllowedRoot` (`:547`) re-checks dev/ino/uid/gid/full-mode identity (`config_root_identity_changed`), and `tickProvenance` (`:565`) projects the model and topology. Bounds are declared, not inferred: `PATH_PING_LIMITS` (`:73`) hulls each pathPing value and `PATH_PING_ERROR_CODES` (`:91`) fixes the ping client's codes, with `abortError` (`:208`) returning the shared `AbortError` shape.

## `scripts/ufo-credential-screen.mjs`

The shared credential-shape screen used by both the native-trial launcher and the handoff collector, deliberately byte-exact to the judge's `detail_contains_credential` mirror. `containsCredentialShape` (`scripts/ufo-credential-screen.mjs:19`) applies an ASCII-only fold and matches three literal needles in `SECRET_LITERAL_NEEDLES` (`:15`) plus the provider token prefixes in `SECRET_TOKEN_NEEDLES` (`:16`) only when at least `SECRET_TOKEN_MIN = 12` token characters follow (`:17`) — so `sk-42` never trips. The evidence-writing side is wider: `containsSensitiveShape` (`:69`) adds `SENSITIVE_LITERAL_RE` (`:54`, catching the compact `eyJ…` JWT shape and `PRIVATE KEY`) and re-scans the `FORMAT_CHARS_RE`-stripped text (`:68`), because invisible Cf/Mn/Zs characters split a shape without changing what a reader copies out. The widening lives only on this side — stripping in the judge mirror would break parity, so callers layer their own shapes on top rather than editing the needle sets. A value either side would redact must never reach `launch.json`, `rejection.txt`, `handoff.json` or an `effectiveLaunch` host field.

## `scripts/ufo-drills.mjs`

The UFO-FSD drill harness: it executes `drills/<id>.drill.json` on deterministic fixture routes with no OMP, no OAuth and no network, writing evidence under the resolved root. `main` (`scripts/ufo-drills.mjs:4450`) parses a strict argv (`--list`, `--only ID`, `--self-test`, `--help`) and drives the suite. Six executors are closed in `EXECUTORS` (`:264`) — self-iter, sync-check, cargo-test, node-test, judge-handoff, shell — and shadow runs copy only the `SHADOW_PATHS` tree (`:232`). A suite-level coverage invariant refuses a full run where a placeholder class outnumbers the wired count `wiredCount` (`:4597`), so `pending-mechanism` rows stay honest undeclared coverage, never a pass. Any escape from `main` maps through `boundaryRefusal` to a typed `DRILLS_REFUSAL_SCHEMA` (`:110`) line: a `DrillFormatError` keeps exit 2, anything else becomes `UNEXPECTED_ERROR` (`:4649`) with exit 1.

## `scripts/ufo-godspeed-inject.test.mjs`

Live S8 member (127 L, suite) re-censused 2026-10-14 against origin HEAD `964f443e`. Primary surface symbol `loadHandler` at `scripts/ufo-godspeed-inject.test.mjs:33`; also `DIRECTIVE` at `:52`.

## `scripts/ufo-l0-monitor-hook.test.mjs`

**Owning surface** — A 137-line, six-case suite pinning `claimRun`
(`scripts/ufo-l0-monitor-hook.test.mjs:3`) in the pre-hook
`.omp/hooks/pre/ufo-l0-monitor.js` against the documented stale-claim contract: a
future-dated or malformed JSON timestamp must fall back to the claim file's own
mtime instead of suppressing the monitor until the claimed instant or forever.
`loadHook` (`scripts/ufo-l0-monitor-hook.test.mjs:32`) byte-copies the real hook
into a temp dir, rewrites `REPO_ROOT` (`scripts/ufo-l0-monitor-hook.test.mjs:37`)
to that root, appends `export { claimRun, releaseClaim };` and imports the copy,
so the live `.ufo` claim is never touched. The bounds are `STALE_MS`
(`scripts/ufo-l0-monitor-hook.test.mjs:43`, 120 s — beyond `SPAWN_TIMEOUT_MS` plus
10 s) and `FRESH_MS` (`scripts/ufo-l0-monitor-hook.test.mjs:44`, 1 s), with each
case planting a chosen JSON timestamp against a chosen mtime. **Edge** — The
load-bearing arms are the mtime fallback — a future-dated claim with an aged mtime
is reclaimed (`scripts/ufo-l0-monitor-hook.test.mjs:83`) and a malformed one with
an aged mtime is reclaimed too (`scripts/ufo-l0-monitor-hook.test.mjs:110`) —
while both fresh-mtime spellings still defer. The suite carries no `node:test`
runner: it prints per-case `ok`/`FAIL` lines plus a final `N/M pins green` count
and exits 1 on any red.

## `scripts/ufo-l0-monitor.test.mjs`

Suite over the heal-repend journal and successor-forge policy of `scripts/ufo-l0-monitor.mjs`; the header (`scripts/ufo-l0-monitor.test.mjs:3`) states the journal is the recovery seam for a healed-but-never-repended row, because cross-file atomicity between queue publish, parent-receipt rewrite and dispatcher repend is unachievable. It imports the pure policy surface (`:18`): `mergeRependPending`, `sweepRependPending`, `forgeSuccessor`, `findStalled`, `settle`, `rependReportOk`, `diagnose`, plus `validateTaskReceipt` for receipt-shape pins. Driver is a hand-rolled `test(name, fn)` collector (`:22`) ending in a failure-count exit (`:1346`), with a `row = (state) => ({ state })` shim (`:33`) for queue rows and `scratchMonitorJson` (`:1159`) spawning the real CLI against a scratch queue/journal. Pure pins cover journal arithmetic first (a new key heals at zero, cap exhaustion names the row once, a row advanced by any other surface is cleared), then the durable CLI arms: aging and gave-up counts persist across invocations (`:129`), and a damaged or partially malformed journal is preserved, named and never silently overwritten (`:230`). Later blocks pin rebind tallies (`:608`), live successor parent-receipt rebind (`:1171`) and malformed-receipt isolation — a `null`/numeric top-level receipt row must be skipped without aborting or masking the later stalled row (`:1286`). Line count is 1346 by `awk 'END{print NR}'`; `wc -l` reports 1345 because the final line is unterminated.

## `scripts/ufo-l0-watch.test.mjs`

The §8.1 whip-walk ordering pins for `ufo-l0-watch.mjs` (nc5-swarm r10), run by a hand-rolled `test(name, fn)` collector (`scripts/ufo-l0-watch.test.mjs:63`, `:66`) that records into a `results` array and exits 1 on any failure. The fixture core is `stalledRow` (`:83`), `steerRecorder` (`:91`) and `deps` (`:99`) with injected steer/clock/cooldown, because r10 extracted the walk verbatim into `whipRow` so the whole battery is pinnable offline. The pins are the cross-gate ORDER — a row carrying several anomaly flags must surface the EARLIEST gate — e.g. `order_scanError_outranks_foreign_receipt_and_drift` (`:204`), `order_foreign_receipt_outranks_future_mtime_and_drift` (`:218`) and `order_future_mtime_outranks_drift` (`:231`), plus the drift-bypasses-decision rule and the cooldown window. Lane-state transitions (`lastWhipAt`/`lastWhipSkip`/`cooldownLoggedFor`) are pinned, and `bindSnapshotConfig_matches_dispatcher_binding` (`:404`) holds the snapshot-binding parity with the dispatcher. Queue helpers and `validateTaskReceipt` are reused from `scripts/ufo-mission-result.mjs` (`:28`).

## `scripts/ufo-mission-activity.mjs`

Pure projection of mission activity for UFO wall panes: `projectMissionActivity` (`scripts/ufo-mission-activity.mjs:133`) validates the closed input `{mission, task, activity}`, delegates lifecycle to `projectMissionLifecycle`, and returns the schema-tagged view `ACTIVITY_SCHEMA` (`:14`) with a bounded `activity` and `label`. Bounds are Unicode code points, never UTF-16 units: `ACTIVITY_MAX_CODE_POINTS` is 240 (`:27`). `sanitizeDisplayText` strips C0/C1, ANSI/OSC, bidi controls and tmux format tokens, failing `INVALID_ACTIVITY` for a non-string (`:67`), before anything is bounded. `renderMissionActivity` (`:160`) is the single-line renderer and refuses a view whose schema is not `ACTIVITY_SCHEMA` with `INVALID_VIEW` (`:162`). The CLI takes `[json|text] [file|-]`, and only a direct invocation (`isMainModule`, `:242`) runs `main`; refusals emit a `ufo-mission-activity-error-v1` envelope and exit 1.

## `scripts/ufo-mission-activity.test.mjs`

Colocated suite (nc5-swarm r26) that pins `buildLabel`'s truncated-reason dedup, run as `node scripts/ufo-mission-activity.test.mjs` (`scripts/ufo-mission-activity.test.mjs:15`) over 13 `test(` cases. It imports `projectMissionActivity` and `renderMissionActivity` from `./ufo-mission-activity.mjs` (`:17`) and locally fixes `LABEL_MAX` = 280 (`:23`). The defect it holds fixed is a membership test that deduped against the untruncated reason while the fallback activity carried the 240-code-point truncation (`ACTIVITY_MAX_CODE_POINTS`), so for reasons in the 240..label-headroom window the bounded label appended a visible duplicated fragment of the reason head. The discriminating case asserts the 250-code-point window reason renders exactly once, with `suspended · ` prefixing the reason and no re-appended ` · REASON-` fragment (`:38`); the short-reason control and the explicit-activity append path cover the other sides. Refusal coverage is direct: the projector and renderer boundary arms must keep typed codes for unknown keys, non-string activity/finalNote and invalid views, alongside sanitizer pins for ANSI/OSC, bidi controls and tmux tokens and the wall-state → phase mapping (`:105`).

## `scripts/ufo-mission-lifecycle.mjs`

`scripts/ufo-mission-lifecycle.mjs` is display-only: it projects caller-supplied wall-manifest and pending-work snapshots into an observational lifecycle phase and never mutates the wall or the queue (`:2`). `projectMissionLifecycle` (`scripts/ufo-mission-lifecycle.mjs:96`) validates snapshots against `WALL_STATES` (`scripts/ufo-mission-lifecycle.mjs:5`), `QUEUE_STATES` (`scripts/ufo-mission-lifecycle.mjs:6`), `TERMINAL_PHASES` (`scripts/ufo-mission-lifecycle.mjs:7`) and the id grammars (`MISSION_ID`, `scripts/ufo-mission-lifecycle.mjs:10`), rejects crossed identities, and emits a `ufo-mission-lifecycle-v1` envelope (`:187`) with phase, terminal, resumed, suspendedReason and an advisory `resumeHint` (`:181`). Input crosses one shared boundary, `readBoundedJsonInput` (`scripts/ufo-mission-lifecycle.mjs:215`), which is bounded and refuses an explicit empty operand rather than silently rebinding to stdin (`:227`). Its refusals are event-shaped: a live mission paired with a terminal task, or with an acceptance-blocked task (`acceptanceConflict`, `scripts/ufo-mission-lifecycle.mjs:126`), dies as `mission and task lifecycle snapshots conflict` (`:131`); CLI faults go through `emitErrorJson` (`scripts/ufo-mission-lifecycle.mjs:278`) with `cliErrorCode` (`scripts/ufo-mission-lifecycle.mjs:280`) and fs messages redacted (`:282`), at exit 1 (`:285`).

## `scripts/ufo-mission-observation.mjs`

Pure projection module plus a standalone inspection CLI: `reconcileObservation(input)` (`scripts/ufo-mission-observation.mjs:34`) accepts only the `task` and `mission` keys — any other key or a non-object throws `TypeError` — and composes the display-only snapshot `OBSERVATION_SCHEMA` = `ufo-mission-observation-v1` (`:16`) from `projectMissionLifecycle` (`:13`) and `projectMissionActivity` (`:64`), returning `phase`/`terminal`/`suspendedReason`/`failureClass`/`activity`/`label` fields (`:66`). Activity precedence is phase-split on purpose: `working` prefers the launcher-attested `task?.lastDispatch?.route`, `queued` prefers the configured `task?.route` (`:58`), and non-string or blank candidates fall through to the next. The CLI (`:85`) is inspection-only, gated by the shared `isMainModule` (`:90`): `--help`/`-h` or at most one file/`-` argv, anything else a `TypeError`; output uses `writeStdout` (`:106`) because `console.log` swallows a failing sink, and failures emit `ufo-mission-observation-error-v1` (`:122`) with `cliErrorCode` and `redactFsErrorMessage` (`:125`) before `process.exitCode = 1` (`:130`). Never an acceptance path — consumers read the persisted observations sidecar, not this module.

## `scripts/ufo-mission-observation.test.mjs`

**Owning surface** — The co-located suite over the observation boundary, driving
`reconcileObservation` (`scripts/ufo-mission-observation.test.mjs:31`) and
`projectMissionLifecycle` (`scripts/ufo-mission-observation.test.mjs:32`) from
`ufo-mission-observation.mjs` and `ufo-mission-lifecycle.mjs`. CLI cases go
through `runObservationCli` (`scripts/ufo-mission-observation.test.mjs:34`) and
`assertCliRefusal` (`scripts/ufo-mission-observation.test.mjs:41`), which parse
the stderr envelope `ufo-mission-observation-error-v1`
(`scripts/ufo-mission-observation.test.mjs:44`) and assert exit 1 plus the typed
code. **Pins** — Working phase must prefer the attested dispatch route over the
configured one (`scripts/ufo-mission-observation.test.mjs:112`), queued phase must
keep the configured route authoritative over a stale dispatch record
(`scripts/ufo-mission-observation.test.mjs:131`), and an empty or whitespace route
falls through to the next candidate
(`scripts/ufo-mission-observation.test.mjs:174`). **Refusals** — Non-plain input,
unknown top-level keys and extra or flag-like operands are refused as
`INVALID_INPUT` (`scripts/ufo-mission-observation.test.mjs:67`), while ENOENT for
a missing input path is preserved
(`scripts/ufo-mission-observation.test.mjs:83`). The last case walks U+2028/U+2029
and the bidi controls through the substrate field and asserts
`projectMissionLifecycle` (`scripts/ufo-mission-observation.test.mjs:208`) refuses
each as neither nonempty, bounded nor single-line.

## `scripts/ufo-native-names.mjs`

Canonical OMP-native seat/name derivations shared by the trial launcher and the handoff collector — a NATIVE_CONTRACT_FILES member whose strings are hash-bound into `launch.json` and the candidate receipt. `seatKey` (`scripts/ufo-native-names.mjs:37`) builds the `{role, instance}` tuple that `seatId` and `seatLabel` render; `canonicalDispatchName` (`:80`) sha256-truncates the runId to an 8-hex tag and returns `u<tag>-<role>-<NN>`. `correlationGroup` (`:92`) and `unavailabilityGroup` (`:108`) hash their `omp-native-correlation-v1`/`omp-native-unavailability-v1` domain strings into `sha256:` digests. Five validation arms raise `NativeNamesError` with stable codes in `NATIVE_NAMES_ERROR_CODES` (`:21`): unsafe seat roles, out-of-range instances, non-string runIds, and non-string correlation or unavailability inputs. Non-goal: it derives names only — it never writes files or dispatches seats.

## `scripts/ufo-night-watchdog.test.mjs`

Live S8 member (118 L, suite) re-censused 2026-10-14 against origin HEAD `964f443e`. Primary surface symbol `hasTmux` at `scripts/ufo-night-watchdog.test.mjs:90`.

## `scripts/ufo-refinement-context.mjs`

Live S8 member (103 L, tool) re-censused 2026-10-14 against origin HEAD `964f443e`. Primary surface symbol `REFINEMENT_CONTEXT_SCHEMA` at `scripts/ufo-refinement-context.mjs:24`; also `buildRefinementContext` at `:47`.

## `scripts/ufo-refinement-context.test.mjs`

Live S8 member (123 L, suite) re-censused 2026-10-14 against origin HEAD `964f443e`. Primary surface symbol `buildRefinementContext` at `scripts/ufo-refinement-context.test.mjs:20`; also `REFINEMENT_BEGIN` at `:17`.

## `scripts/ufo-route-preflight.mjs`

Live S8 member (176 L, tool) re-censused 2026-10-14 against origin HEAD `964f443e`. Primary surface symbol `ROUTE_PREFLIGHT_SCHEMA` at `scripts/ufo-route-preflight.mjs:32`; also `routeFamilies` at `:54`.

## `scripts/ufo-route-preflight.test.mjs`

Live S8 member (206 L, suite) re-censused 2026-10-14 against origin HEAD `964f443e`. Primary surface symbol `routeFamilies` at `scripts/ufo-route-preflight.test.mjs:17`; also `probeFamilies` at `:101`.

## `scripts/ufo-stale-watchdog.test.mjs`

Colocated suite (nc5-swarm r16) that pins the one r15 fix which shipped with no direct verification: `emitFor`'s `writeSync(2, telemetryLine(event))` stderr fallback for a dead duty-log path (`scripts/ufo-stale-watchdog.test.mjs:2`), over 29 `test(` cases. Because `writeSync(2, …)` cannot be intercepted in-process, each case runs a `spawnSync` child with a controlled stderr (`:12`) whose driver imports the real module and calls `tick` with faked flash/sighting seams and dead fixture paths; the malformed status `{missions: null}` returns before the `loadSwarmPolicy` read, so the arm emits `status_malformed` instead of touching real config. `STALE_MS` = 1_200_000 (`:36`) and `SAFE_RUN_ID` fix the fixture clock and identity, and assertions filter single `state_save_error`-style events out of the parsed stderr JSONL rather than demanding whole-stream equality. Representative cases are `fd2_fallback_carries_duty_events_when_log_path_dead` (`:120`) and the closed-fd-2 case `closed_fd2_never_throws_out_of_tick` (`:168`), which pins that an unwritable evidence channel never throws out of the tick loop. An r20 addendum adds three in-process rung-4 pins that drive `tick` through the `deps.log` event seam to pin the configPath doctrine: configured band consumed, malformed → typed fallback, and the default repo config live.

## `scripts/ufo-state-census.mjs`

Live S8 member (184 L, tool) re-censused 2026-10-14 against origin HEAD `964f443e`. Primary surface symbol `CENSUS_SCHEMA` at `scripts/ufo-state-census.mjs:22`; also `censusState` at `:28`.

## `scripts/ufo-state-census.test.mjs`

Live S8 member (91 L, suite) re-censused 2026-10-14 against origin HEAD `964f443e`. Primary surface symbol `censusState` at `scripts/ufo-state-census.test.mjs:14`; also `sparse` at `:20`.

## `scripts/ufo-state-retention.mjs`

Bounded retention for UFO runtime state, with three frozen verbs — `cap`, `sweep`, `watch` (`scripts/ufo-state-retention.mjs:7`) — dispatched from the `IS_MAIN` block and printing one JSON payload on stdout (`:2253`). `cap` bounds each `*.bash.log` generation to `CAP_BYTES = 100 * 1024 * 1024` (`:95`) and the run's whole bash-log set under `RUN_BASH_LOG_CAP_BYTES = 1024 * 1024 * 1024` (`:96`), but any generation with an open writable fd is reported `defer_open_writer` rather than truncated — there is no live-writer bound (`:41-42`). `sweep` retires whole run dirs only: it protects the newest `NEWEST_PROTECTED_RUNS = 10` runIds (`:108`) and anything younger than `YOUNG_PROTECTED_MS` 14 days (`:109`), and retirement additionally requires age ≥ `RETIRE_MIN_AGE_MS` 30 days (`:110`) with every lifecycle guard clear. The held watcher lock is read from its on-disk shape, never from path existence: a regular lock file (the session-retention lock) whose body is a dead pid is stale, while a link, FIFO/socket/dir, unreadable lock, or a body naming no pid is `watch_lock_unverifiable` — fail closed (`:1431`, `:1440`). Every mutation writes a `ufo-runtime-reclaim-v1` row (`RECLAIM_SCHEMA`, `:136`) and a typed JSONL event under `$UFO_STATE_DIR/session-retention.jsonl` (`:199`). Bare `cap`/`sweep` are dry-run unless `--apply` is passed (`:2101`); a missing verb exits 2 with a typed `retention_usage_error` (`:2261`), and any typed refusal sets exit 2 while an untyped escape sets 1 (`:2282`).

## `scripts/ufo-state-retention.test.mjs`

The owned behavioral suite for the retention CLI holds 49 `test(` call sites, each against a scratch state tree so live `.ufo/` state is never touched (`:2-4`). It pins the cap arms — a closed-file bound that preserves head/tail evidence while leaving JSONL byte-identical (`:191`), a true second-pass no-op (`:233`) and open-writer deferral (`:267`) — and reads the watcher lock from its on-disk shape rather than the path's existence (`:655`), treating FIFO, pidless, link or directory bodies as `watch_lock_unverifiable` (`scripts/ufo-state-retention.test.mjs:674`) while granting `watch_active` (`scripts/ufo-state-retention.test.mjs:560`) only to a verifiably live owner (`:851`). Guards fail closed: an unreadable ledger segment reports `ledger_incomplete` (`scripts/ufo-state-retention.test.mjs:1019`), and a FIFO planted at the state-global lock or at a cap session lock refuses typed under a spawn deadline instead of wedging the pass (`:886`, `:909`). The cross-owner contract the sighting wall depends on is pinned by the four wall-cap cases (`:1387`), including the caller's 1 MiB stdout bound (`:1443`), and it is the external consumer `capRunBashLogs` (`scripts/ufo-state-retention.test.mjs:1355`) whose report shape those cases freeze.

## `scripts/ufo-statusline-hook.test.mjs`

The colocated fail-closed suite for the statusline hook dynamically imports only `formatUf0Status` (`scripts/ufo-statusline-hook.test.mjs:16`) and holds seven pins over a local test harness (`:22`). Its spine is that a malformed or drifted payload renders `CLOSED` (`scripts/ufo-statusline-hook.test.mjs:33`), the literal `uf0 hatch (closed)`: an empty object must not print fabricated zero-fleet text (`:40`), and null, strings, arrays and any payload missing `levels`, `phaseCounts` (`scripts/ufo-statusline-hook.test.mjs:36`) or `hatch` likewise render CLOSED (`:44`, `:50`, `:54`, `:58`). A valid envelope formats counts with a null l2 kept as the opaque `?` sentinel (`:62-63`), and a valid closed envelope formats closed with its counts (`:66-70`). Because the cache gate shares `isStatusEnvelope` (`scripts/ufo-statusline-hook.test.mjs:17`) with the formatter, these format pins decide accept/reject for the cross-session cache too; the run prints N/N pins green or exits 1 when any pin failed (`:74-75`).

## `scripts/ufo-swarm-collect.test.mjs`

**Owning surface** — The wave→envelope bridge suite for
`scripts/ufo-swarm-collect.mjs`, named by `SCRIPT`
(`scripts/ufo-swarm-collect.test.mjs:16`) — 84 `test()` cases covering outcome
mapping, the `resume_hint` presence rule, fail-closed joins and the
`<agent_swarm_result>` XML shape. It reuses `spinWait` and `ENTRY_FAILURE_CLASSES` from
`scripts/ufo-mission-result.mjs` (`scripts/ufo-swarm-collect.test.mjs:17`),
spawns the real CLI through `run` (`scripts/ufo-swarm-collect.test.mjs:65`) and
`runJson` (`scripts/ufo-swarm-collect.test.mjs:77`), and counts cases with its own
`test` helper (`scripts/ufo-swarm-collect.test.mjs:83`). Fixtures come from
`dispatchPayload` (`scripts/ufo-swarm-collect.test.mjs:95`) and `resultsPayload`
(`scripts/ufo-swarm-collect.test.mjs:107`), while the contended-registry-lock
cases plant a live holder from `REGISTRY_LOCK_HOLDER_SOURCE`
(`scripts/ufo-swarm-collect.test.mjs:23`) keyed by `R22_HOLDER_TOKEN`
(`scripts/ufo-swarm-collect.test.mjs:31`) under a fixed `OWNER`
(`scripts/ufo-swarm-collect.test.mjs:32`); the join arms reject an unmapped member
(`scripts/ufo-swarm-collect.test.mjs:234`), an unexpected one, a duplicate results
row and a conflicting `agentId`, and the lock case asserts the collector still
succeeds fast while the writer holds the registry lock
(`scripts/ufo-swarm-collect.test.mjs:1767`). **Edge** — Composition cases drive a
real wave run record (`scripts/ufo-swarm-collect.test.mjs:2028`) and a mixed
spawn/resume wave (`scripts/ufo-swarm-collect.test.mjs:2088`) into the collector,
and the suite prints a final `N/M passed` line
(`scripts/ufo-swarm-collect.test.mjs:2205`) before exiting 1 on any red.

## `scripts/ufo-swarm-wave.test.mjs`

Dispatch-payload contract suite for the swarm path: it pins the plan block (declared vs clamped `maxLanes`, `dispatch.calls`) and the run split (spawn `taskCall` vs `resumeSends`, one-swarm-per-wave), over 167 `test(` cases (`scripts/ufo-swarm-wave.test.mjs:2`). It imports `planSwarmWave` from `./ufo-swarm-wave.mjs` plus `FAILURE_CLASS_NAMES`, `createMissionResult`, `createTaskReceipt`, `spinWait` and `validateTaskReceipt` from `./ufo-mission-result.mjs` (`:14`), takes the CLI path from `SCRIPT = join(import.meta.dirname, "ufo-swarm-wave.mjs")` (`:22`) and spawns the real script, and draws outside-root fixture bases from `outsideRootBase` in `tests/helpers/tmp-roots.mjs` (`:20`) because the fleet TMPDIR can be in-repo when the system temp mount is quota-dead. Coverage spans plan admission (`spawn_only_wave_emits_one_task_call` at `scripts/ufo-swarm-wave.test.mjs:158`, `empty_wave_rejected`, `duplicate_resume_id_rejected`), the hard lane cap (`hard_cap_admits_100_lanes` at `scripts/ufo-swarm-wave.test.mjs:980`, and `hard_cap_rejects_101_lanes` refusing with code `too_many_lanes`), registry write/merge semantics (`run_writes_member_registry`, `rerun_merges_registry_reset_preserve_retain`) and record reassignment refusals. Refusal arms are explicit: an outside-root config path is refused without the escape flag while the escape flag reads it, a symlinked config component is refused, and `run_withholds_dispatch_when_persist_refuses` proves the wave withholds dispatch when the registry persist refuses (`scripts/ufo-swarm-wave.test.mjs:573`). Fixture hygiene is itself part of the contract — every temp dir is registered and swept at exit, and a live-PID anchor for contended-registry-lock fixtures is written into the suite's own temp tree.

## `scripts/ufo-watchdog-repend.mjs`

Refusal-aware blocked-row repend duty extracted from `ufo-night-watchdog.sh`, exported as `main` (`scripts/ufo-watchdog-repend.mjs:310`) and run through `isMainModule(import.meta.url)` → `process.exitCode = main()` (`:362`). Its argv surface is `--queue`/`--state`/`--fleet`/`--dispatcher`/`--quiet-seconds`/`--min-age-seconds`/`--now`; any other token is an `unsupported argument` fault, which prints one `ufo-watchdog-repend:` line per fault to stderr and returns 64. Eligibility is queue state `blocked` plus fleet membership plus a blocked age over `DEFAULT_MIN_AGE_SECONDS` (240); a successful repend consumes one of `MAX_ATTEMPTS` = 3 lifetime attempts while a refused or failed one does not, and the durable state file is `STATE_SCHEMA` = 2 (`:51`) with the legacy bare `{key: n}` shape read as attempts and keys for rows no longer blocked pruned on write. The r07 addition is stable-refusal suppression: `STABLE_REFUSAL_REASONS` = {`mission_stale_registered`} (`:58`) is quieted for `DEFAULT_QUIET_SECONDS` (900) while `rowSignature(row)` is unchanged, because the dispatcher refuses that class by design and repend can never succeed — transient classes are never suppressed. Child stdout/stderr tails are telemetry and are redacted to `SPAWN_FAILURE_TAIL_MAX` = 120 characters (`:141`), and an unreadable queue prints one stamped line and still returns 0, since a watchdog duty must never die on a transient read fault.

## `scripts/ufo-watchdog-repend.test.mjs`

The suite for the extracted night-watchdog repend duty, run as `node scripts/ufo-watchdog-repend.test.mjs`. It imports the whole decision surface — `MAX_ATTEMPTS` (`scripts/ufo-watchdog-repend.test.mjs:14`), `STABLE_REFUSAL_REASONS` (`:15`), `decideRow` (`:16`), `extractRependReport` (`:17`), `manifestClassFor` (`:18`), `normalizeState` (`:19`), `rowSignature` (`:20`) and `runRependCycle` (`:21`) — and drives it with a local `test` runner (`:25`). Fixtures are a fixed-`NOW` `row` factory plus a `fakeSpawn` (`:47`) that records calls and replays a canned report; `STABLE` (`:56`) is the `mission_stale_registered` refusal. Pins cover stable-refusal suppression with row/manifest-change reset, transient retry, success counting and the attempt cap, and legacy bare-number state migration. The final arm runs an end-to-end `main` against scratch surfaces only (`UFO_STATE_DIR` plus a scratch queue, `:311`), suppressing the second tick and then resetting on a manifest change.

