OUT-OF-PROVINCE items=4 filed=3 unfiled=1

Seat: KumitateR36.ConnectorOutOfProvince (connector, read-only). Counts — `items` = distinct cross-domain surfaces
this round touches; `filed` = an on-disk filing naming the surface **and** its owner exists today; `unfiled` = no filing
exists (none required this round). The L0 channel is reported per row and is empty for all four.

The L0 channel is `/home/vgpnk/Projects/shokunin/.ufo/l0-questions.md` (fleet root). There is **no** lane-local
`.ufo/l0-questions.md` (`test -e kumitate-shokunin/.ufo/l0-questions.md` → absent), so the item's path resolves at the
fleet root only.

## Table

| # | Surface (observed at the pin) | Owning province / channel | Filing path already used | L0 | This lane MUST NOT |
|---|---|---|---|---|---|
| U1 | `ufo-sighting` manifest omits the `surface` verb: dispatched at `/fast/scratch/kumitate-r36/src/scripts/ufo-sighting.mjs:4484` (`command === "surface"`), manifest `verbs` at `scripts/ufo-sighting-lib/surface.mjs:74` carries 11 keys (open, launch, complete, remove, steer, peek, status, overview, reconcile, inquiry, resume) and no `surface`; probe reads `FAIL sighting VERB_DISPATCH — source-only=surface declared-only=-` (`.ufo/waves/round-36/baseline/surface-pin.txt:6,15`) | `ufo-fsd-alpha` — **no fleet province owns it** (`corpus/lessons/round-5-aggregator-mirror-out-of-province-membrane-seal.md:24`: `grep ufo-fsd-alpha *-shokunin/PROVINCE.md` → no match); operator/integrator disposition | fleet report `.ufo/reports/round-35/kumitate.md:82` (root-relative to `/home/vgpnk/Projects/shokunin`); restated `SCORECARD.md:463-467` ("filed in the round-35 report, never patched here"); policy `PROVINCE.md:28` | none (`grep -ci 'ufo-sighting\|VERB_UNDECLARED' .ufo/l0-questions.md` → 0) | Patch `scripts/ufo-sighting-lib/surface.mjs` or `ufo-sighting.mjs` in any copy and call it a fix; add the verb to a lane-side stub; `chmod`/write/clean `/fast/scratch/kumitate-r36/src` (`dr-xr-xr-x`); count `SURFACE_PROBE: CLEAN (known=1)` as the defect being gone — the KNOWN line *is* the defect, held at `31c465f1` |
| U2 | `fleet-dispatcher.mjs status` writes into the tree it reads: `UFO_STATE = UFO_STATE_DIR \|\| ROOT/.ufo` (`scripts/fleet-dispatcher.mjs:42`), ledger at `:90`, `assertLedgerPath()` `mkdirSync(dirname(LEDGER_PATH), …)` at `:458-462`; at the read-only pin this is `SURFACE_UNREACHABLE [dispatcher/STATUS_REACH] status exited 1` (`baseline/surface-pin.txt:8`) | `ufo-fsd-alpha` (same owner; this is a second, independent upstream defect, not part of U1) | `.ufo/reports/round-35/kumitate.md:82` only ("the dispatcher's status verb creates `<src>/.ufo` and fails on a read-only tree") | none | Patch the dispatcher; point `UFO_STATE_DIR`/`UFO_PENDING_WORK_PATH` at any path **inside** `<src>` (that reproduces the defect inside the pin); leave a mkdtemp behind; accept `reach=ok` without the before/after file-list+mtime proof (`src-writes=0`) |
| U3 | Operator checkout is a moving tree and is the gates' *default* src: `scripts/claims-check.mjs:79-80` (`~/Projects/ufo-fsd-alpha`, then `origin-work/…`), `:89`, applied at `:903`; `proxy-check.mjs:265-266,275,2461`; `surface-probe.mjs:138-139,147` | operator/host — the checkout is a domain working tree; no province owns its state | lane rules: `SCORECARD.md:458-462` (round-36 pre-registration, `ScoutDefaultSrc`), `corpus/QUALITY.md:78-84` (Q15), `corpus/lessons/round-35.md:15` (`resolveSrcDefault` → operator checkout, "checklist verdict follows the operator's moving checkout"); report `.ufo/reports/round-35/kumitate.md:71` | none | Pass it as `--src` to any gate/probe; read its HEAD/tree as a *measurement* (this seat read `git -C /home/vgpnk/Projects/ufo-fsd-alpha rev-parse HEAD` → `31c465f1…` read-only, and records that as a **coincidence with today's pin, not evidence**); chmod, edit, `git clean`, or reset it; let a pin-less verdict stand as a claim about "the tree" |
| U4 | Host route plane: OMP harness + MCP/routing/client config; REA. Round-36 has **zero** work items here — `\bREA\b\|rea-agents\|xd://mcp\|routing` matches only this seat's own prompt; the CLI-only REA rule appears once, in the dispatch boilerplate (`npx -y rea-agents@6.5.0`) | operator/protocol — OMP harness is this lane's Frontier band (`PROVINCE.md:19`), MCP revisions only as SOURCES rows (`PROVINCE.md:20`); the *host* config is not lane-owned | **none** — no filing exists and none is required this round (no round surface to route) | none | Write `~/.omp`, `~/.config`, MCP/routing/client config or agent databases; call `xd://mcp__rea_*`; broadcast `agent://all`; install/inspect credentials, tokens, `~/.kimi-code/mcp.json` content |

In-province (not counted, listed because the item names MCP material): `~/.kimi-code/mcp.json` is lane Core K1
(`PROVINCE.md:14`, "secret members shape-only"), gated by `scripts/kimi-census.mjs`; the only round-36 item that names
it is `SentinelSecrets`, which greps the round's own artifacts for leaks and must not open it. R5/R7 upstream source
(`crates/ufo-core-runtime/src/*.rs`, `crates/ufo-cli/src/*.rs`) is likewise in-province for documentation
(`PROVINCE.md:13`) and never for editing; C2 copies identifiers, not code.

## Contradictions (stated, not smoothed)

1. **PIN v1 portability vs C1's universal wording.** C1 says "every lane gate verdict names the revision it scored",
   but PIN v1 makes a pin-less run "behave exactly as today": `resolveSrcDefault()` picks the operator checkout and no
   `src-rev=` is printed. The property holds only while `<self>/.ufo/pins/origin.json` exists — a defaulted
   convention, not an invariant. Today `.ufo/pins/` does not exist yet (`ls .ufo/pins` → absent), so **the claim is
   false on the tree as this seat finds it** and becomes true only when the pin file lands and survives.
2. **KNOWN v1's revision check is conditional on the pin.** "With an active pin, a known file whose revision differs
   is exit 2 `KNOWN_REV_MISMATCH`" (frozen contract). With `--known` and no resolvable pin the revision check is
   vacuous, so the out-of-province containment (U1) can silently outlive the pin that gave it meaning.
3. **Strict staleness couples the lane's checklist to an upstream event.** `KNOWN_STALE` is right, but the first
   re-pin to a revision where upstream declares `surface` turns item 620 red through no lane fault. Re-pinning and
   re-validating `.ufo/pins/surface-known.json` must therefore be one commit, not two.
4. **U2's containment rests on two upstream env contracts** (`UFO_STATE_DIR` at `:42`, the `beneath(UFO_STATE,
   UFO_PENDING_WORK_PATH)` assertion at `:4013`). If upstream renames or tightens them, the lane probe silently
   returns to writing `<src>/.ufo`; the `src-writes=0` proof is per-revision, not permanent.

## Risks

- `/fast/scratch/kumitate-r36/src` is operator scratch. A wipe makes every pinned gate exit 2 `SRC_REV_UNVERIFIABLE`
  (fail-closed and correct, but the checklist goes red): the pin's `recreate` command line is the only recovery, so the
  checklist item must name it rather than assume the clone persists.
- C2's 9 new sections are line-anchored to `31c465f1`. They are the first real consumer of U3's fix: on a re-pin the
  fidelity ratchet (not the claims gate, which checks liveness) is what catches drift — the two must be re-run together.
- `corpus/knowledge/live-surface-probe.md:167` records `VERB_UNDECLARED` as "not fired", which contradicts
  `baseline/surface-pin.txt:6` at the pin. In-lane doc debt (not cross-domain) — route to whoever owns C2's note
  riders, and do not "fix" it by weakening the check.
- A green `SURFACE_PROBE: CLEAN (known=1)` is evidence of *awareness*, not repair. If the round report or LOG states
  the surface probe is clean without the `known=1` and the owner, it misreads U1 as fixed.

## Proposed move (one, bounded; L1 decides)

Fill the KNOWN v1 hole named in contradiction 2: in `scripts/surface-probe.mjs`, when `--known` is supplied and no pin
is active/resolvable, exit 2 with `KNOWN_UNPINNED` (fail-closed, same class as `SRC_REV_UNVERIFIABLE`). It adds no
claim, removes no stated behaviour (no-pin is unspecified for `--known`), and costs nothing today — the only known
file is revision-scoped and the checklist runs from the lane where the default pin path resolves. Effect: the
out-of-province expectation cannot be graded by a gate that does not know which revision it is grading.

## Verification for the L1

```sh
cd /home/vgpnk/Projects/shokunin/kumitate-shokunin
grep -n 'command === "surface"' /fast/scratch/kumitate-r36/src/scripts/ufo-sighting.mjs      # 4484
grep -nE '^      [a-zA-Z]+: \{' /fast/scratch/kumitate-r36/src/scripts/ufo-sighting-lib/surface.mjs | head -11
grep -n 'UFO_STATE_DIR\|assertLedgerPath' /fast/scratch/kumitate-r36/src/scripts/fleet-dispatcher.mjs
grep -ci 'ufo-sighting\|VERB_UNDECLARED' /home/vgpnk/Projects/shokunin/.ufo/l0-questions.md  # 0
node scripts/surface-probe.mjs --known .ufo/pins/surface-known.json   # must print known=1 + src-rev=; no pin → move above
```

## Commands this seat ran (read-only)

`ls`/`sed`/`grep`/`nl` on the lane, `/home/vgpnk/Projects/shokunin/.ufo/{l0-questions.md,reports/round-35/kumitate.md}`
and `/fast/scratch/kumitate-r36/src`; `git -C /fast/scratch/kumitate-r36/src rev-parse HEAD` → `31c465f1…`;
`git -C /home/vgpnk/Projects/ufo-fsd-alpha rev-parse HEAD` → `31c465f1…` (read-only; no write there);
`python3` read of `.ufo/waves/round-36/build-spec.json` for token/item counts. No gate was executed, no file written
outside this report, no L0 append (not this seat's write scope), no tool install, no pacman transaction.
