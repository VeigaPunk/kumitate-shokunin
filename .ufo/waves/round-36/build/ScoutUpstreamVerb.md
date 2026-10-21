UPSTREAM-VERB source-only="surface" declared=open,launch,complete,remove,steer,peek,status,overview,reconcile,respawn-terminal,inquiry,resume,register,twin,help filed=/home/vgpnk/Projects/shokunin/.ufo/reports/round-35/kumitate.md:82

# ScoutUpstreamVerb — `surface` VERB_UNDECLARED at the pin

Pin: `/fast/scratch/kumitate-r36/src`, `git rev-parse HEAD` →
`31c465f15669f744848bd9f5d56191c5085670f7` (mode `dr-xr-xr-x`; read-only, never written).
Everything below is observed at that revision unless tagged [INFERENCE].

## 1. Dispatch arm(s) that accept `surface` (observed)

`/fast/scratch/kumitate-r36/src/scripts/ufo-sighting.mjs:4484-4493`, inside
`export async function main(argv = process.argv.slice(2), env = process.env)` (opens :4432;
`const command = argv[0];` :4464):

```
4484:  if (command === "surface") {
4485:    const { options, command: unexpected } = parseNamedOptions(rest, { booleans: ["json"] });
4486:    if (unexpected.length > 0) fail("INVALID_ARGUMENT", "surface takes no command");
4487:    rejectUnknownOptions(options, ["json"], "surface");
4488:    // The declared verb is `surface --json`; accepting a bare `surface` would
4489:    // make the documented flag a lie inside the surface's own manifest.
4490:    if (options.json !== true) fail("INVALID_ARGUMENT", "surface requires --json");
4491:    output(surfaceManifest());
4492:    return;
4493:  }
```

This is the **only** CLI arm accepting `surface`: `grep -rn '"surface"' scripts --include=*.mjs`
yields exactly this arm (:4484), its option list (:4487), and `scripts/sync-ufo-contracts.mjs:480`
— a *consumer* that spawns `bash <host> surface --json`, not a second dispatcher.

The verb is shipped and advertised, not dead code: `scripts/ufo-sighting-lib/surface.mjs:265`
has the usage line `"       ufo-sighting surface --json",` and `:285` maps scoped help
`surface: 1,`. Live proof (cwd `/tmp`, never inside the pin):
```
node …/scripts/ufo-sighting.mjs surface --json  → exit 0, JSON manifest
node …/scripts/ufo-sighting.mjs surface         → exit 2, {"code":"INVALID_ARGUMENT",
                                                   "message":"surface requires --json"}
```
Introduction: `git log --reverse -S'command === "surface"' -- scripts/ufo-sighting.mjs`
→ single commit `72ab84a8` (2026-09-25 02:43:32 +0000, "fix(sub-7): M4 r04 …");
`merge-base --is-ancestor 72ab84a8 31c465f1` → 0. Matches round 35's "since `72ab84a`".

## 2. Manifest — verbs object keys only (observed)

`surfaceManifest()` is `scripts/ufo-sighting-lib/surface.mjs:59`; `verbs: {` opens :74,
`extras: [` :203, `errors:` :259. Rendered from the pinned module:
```
verbsKeys = open,launch,complete,remove,steer,peek,status,overview,reconcile,
            respawn-terminal,inquiry,resume                             (12)
extras    = register,twin,help                    (surface.mjs:205,220,238)  (3)
declared  = verbs ∪ extras names                                        (15)
```
No `surface` key in `verbs` or `extras`; the live `surface --json` output confirms 12/3.

## 3. Absence of any error/notes about the omission (observed)

Rendered top-level keys: `kind, scriptDigest, digestInputs, exitCodes, verbs, extras,
missionId, nonLiveOutcomes, bounds, caps, errors` — **no `notes` member**
(`Object.hasOwn(manifest,"notes")` → `false`). `errors` is 73 codes mechanically harvested
from `fail("…")` literals (`surfaceErrors()` :62-72); it holds `INVALID_ARGUMENT` because
the arm uses it, but no `surface`-named or omission-related code. The string `surface`
appears in the rendered JSON exactly twice — `"kind": "sighting-surface-v1"` and the
digestInputs path `scripts/ufo-sighting-lib/surface.mjs` — never as a capability.
`config/ufo.json` declares only `sighting.surfaceDigest` (:55), not a verb. No exception,
allow-list, TODO or note acknowledges the gap in module, lib, or config.

Independent recompute (same sets the lane probe derives, node against the pin):
```
dispatchArms=--help,-h,__idle,__pane-run,__reconcile,complete,help,inquiry,launch,open,overview,
             peek,reconcile,register,remove,respawn-terminal,resume,status,steer,surface,twin
undeclared=surface   declared-only=-
errorsCount=73 includesINVALID_ARGUMENT=true   notesKey=false
```

## 4. How the gate sees it

`scripts/surface-probe.mjs` `checkVerbs` (:599-627) builds the dispatch set from
`/\bcommand\s*===\s*"([A-Za-z0-9_-]+)"/g` plus the `argv[0] ===` form, subtracts
`verbs ∪ extras ∪ aliases ∪ __internal`, and emits severity `error` for `VERB_UNDECLARED`
(`surface-probe.mjs:192`). Pinned baseline `.ufo/waves/round-36/baseline/surface-pin.txt:6`:
```
ERROR VERB_UNDECLARED [sighting/VERB_DISPATCH] dispatched in scripts/ufo-sighting.mjs but undeclared in the manifest: surface
```
The current probe has **no `--known`/suppression path** (grep: no KNOWN handling), so
KNOWN v1 is net-new this round; without it this finding gates item 620 forever.

## 5. Where round 35 filed it (observed)

- Fleet L0 channel, `## Routed, not absorbed` (heading :80):
  `/home/vgpnk/Projects/shokunin/.ufo/reports/round-35/kumitate.md:82`
  «Upstream (operator): `scripts/ufo-sighting-lib/surface.mjs` manifest omits the
  `surface` verb that `scripts/ufo-sighting.mjs:4484` dispatches (`VERB_UNDECLARED`,
  since `72ab84a`); the dispatcher's status verb creates `<src>/.ufo` and fails on a
  read-only tree; stale "importSiblingModule"/"three pre hooks" comments.»
  The same report records item 620 red in its round-records bullet (:46).
- Earlier filing: `/home/vgpnk/Projects/shokunin/.ufo/reports/round-34/kumitate.md:94`
  («`VERB_UNDECLARED surface` … upstream surface, reported, not patched»).
- Lane lessons `corpus/lessons/round-35.md:85-86`: «The upstream `surface` verb missing
  from the sighting manifest — routed to the operator in the round report; never patched
  here (PROVINCE adjacent band).» Lane `LOG.md:1629-1633` records the same two causes.
- In-lane seat evidence: `.ufo/waves/round-35/build/ScoutSurfaceProbe.md:8-10`.
- **The item's named lane path `.ufo/reports/round-35/kumitate.md` does not exist** (lane
  `.ufo/reports/` holds only `round-33`); that grep is ENOENT. The filing lives only in
  the fleet repo channel named above.

## 6. Has the operator acted? — No (observed)

- Domain repo `/home/vgpnk/Projects/ufo-fsd-alpha`: `HEAD` and `refs/remotes/origin/main`
  are both `31c465f15669f744848bd9f5d56191c5085670f7` — identical to the pin.
- `git branch -a --contains 31c465f1` lists only `main` / `origin/HEAD` / `origin/main`:
  no branch or remote ref descends from the pin. Other sighting refs exist
  (`tower/elegance/sighting c2019369` 2026-10-19, `cursor/nc8/sighting 458f1199`
  2026-09-26) but both are older and also lack a `surface:` verb key.
- `git log --all --oneline --since=2026-10-20 -- scripts/ufo-sighting-lib/surface.mjs
  scripts/ufo-sighting.mjs config/ufo.json` → empty; no commit message matching
  `surface verb|VERB_UNDECLARED|manifest omits`.
- Live worktree: `surface.mjs` mtime `2026-10-19T19:02:03`, `git diff --quiet HEAD --` it
  → exit 0 (clean); its only `surface:` hit is the usage map at :285.
- No L0 question was queued: `/home/vgpnk/Projects/shokunin/.ufo/l0-questions.md` has 0
  occurrences of `round-35`; kumitate entries are rounds 10, 11, 17 only. Round-36's fleet
  channel holds only `kotodama.md`; the round-36 plan instead pins the defect as KNOWN.
- [INFERENCE] A fix existing only on an unfetched remote would be invisible here; no local
  ref or worktree state shows one.

Consequence for C1: the finding is live at the pin and must fire. The honest disposition is
the KNOWN v1 entry `{surface:"sighting",kind:"VERB_UNDECLARED",check:"VERB_DISPATCH",
subject:"surface"}` with strict staleness — not suppression. If upstream declares the verb,
`KNOWN_STALE` correctly turns the gate red until the allow-list is retired.

## Commands run (all cwd=/tmp; pin never written)

```
git -C PIN rev-parse HEAD
git -C PIN log --reverse -S'command === "surface"' -- scripts/ufo-sighting.mjs
git -C PIN merge-base --is-ancestor 72ab84a8 31c465f1
node -e '<import surface.mjs: enumerate verbsKeys/extras/notes/errors/dispatch set>'
node PIN/scripts/ufo-sighting.mjs surface --json ; node PIN/scripts/ufo-sighting.mjs surface
git -C DOMAIN rev-parse HEAD refs/remotes/origin/main
git -C DOMAIN for-each-ref --format='%(refname) %(objectname:short)' refs/heads refs/remotes
git -C DOMAIN log --all --oneline --since=2026-10-20 -- <three paths>
git --no-optional-locks -C DOMAIN diff --quiet HEAD -- scripts/ufo-sighting-lib/surface.mjs
grep -rn '"surface"' PIN/scripts --include=*.mjs
grep -n 'surface\|round-35' /home/vgpnk/Projects/shokunin/.ufo/l0-questions.md
```
(`PIN=/fast/scratch/kumitate-r36/src`, `DOMAIN=/home/vgpnk/Projects/ufo-fsd-alpha`.)

No tool installs/upgrades. Nothing written outside this report; no delegation.
Unresolved gaps: none affecting the verdict. Confidence: high — source lines, live CLI
execution, and ref/worktree state all agree.
