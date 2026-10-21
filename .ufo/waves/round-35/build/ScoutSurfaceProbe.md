SURFACE cause=both commit=72ab84a digest-commit=a431eee

# Live sighting-surface conformance (SKILL.md:620) — diagnosis

Two independent causes, both stable across 964f443e..31c465f1:
- `DIGEST_CONCAT` / `SCRIPT_DIGEST_MISMATCH` → **lane probe expectation drift** (probe hashes a
  lexicographic lib order the upstream generator never used and never claims).
- `VERB_DISPATCH` / `VERB_UNDECLARED` (`source-only=surface`) → **upstream manifest defect**
  (`surface` is dispatched and advertised in usage, but absent from the self-describing
  manifest's `verbs`/`extras`). File for operator; never patch from this lane.

## Commands run and observed output

| # | command | observed |
|---|---------|----------|
| 1 | `node scripts/surface-probe.mjs --help` (cwd kumitate-shokunin) | exit 0; `--src DIR` accepted, default `$UFO_SRC` else first of `~/Projects/ufo-fsd-alpha`, `~/Projects/origin-work/ufo-fsd-alpha` |
| 2 | `node scripts/surface-probe.mjs --src /fast/scratch/kumitate-r35/src` | `DRIFT (surfaces=2 checks=12 errors=3 warnings=1)`; extra `SURFACE_UNREACHABLE [dispatcher/STATUS_REACH] status exited 1` (clone artifact, see §Environment) |
| 3 | `git archive 31c465f1 \| tar -x -C <scratch>/pin` then `surface-probe --src <scratch>/pin` | `DRIFT (surfaces=2 checks=12 errors=2 warnings=1)`; **exactly reproduces baseline** (`10 passed`, `DIGEST_CONCAT`, `VERB_DISPATCH`; `PIN_DIGEST ok`) |
| 4 | `bash scripts/ufo-sighting surface --json` (cwd pinned tree) | exit 0; `scriptDigest=sha256:b36559…`, 12 verbs, extras `register,twin,help`, 6 digestInputs |
| 5 | same in extracted 964f443e tree | exit 0; `scriptDigest=sha256:e4f4d56f…`, same 12 verbs, same extras, same 6 paths |
| 6 | `git -C <clone> log --oneline 964f443e..31c465f1 -- scripts/ufo-sighting.mjs scripts/ufo-sighting-lib config` | `a431eee`, `7a8130a`, `2a04baf`, `c90bbcf` |
| 7 | `git log -S 'command === "surface"' -- scripts/ufo-sighting.mjs` | single commit `72ab84a` (shallow root of the clone) |
| 8 | node concat cross-check (both trees) | see §Digest |

No tool installed or upgraded; no package transaction run.

## Digest — `DIGEST_CONCAT` (lane cause)

Mechanics: the manifest is generated live, never stored. `scripts/ufo-sighting-lib/surface.mjs:19-24`
hardcodes the digest input order:

```
base.mjs, argv.mjs, observe.mjs, surface.mjs          (fixed dependency order)
```

`surfaceScriptDigest()` (`surface.mjs:35-49`) appends `SHIM_PATH`, `MODULE_PATH`, then that array,
and hashes those bytes in **declared** order. `digestInputs` is that same list, path+sha256.

The lane probe instead derives the set from disk with `readdirSync(...).sort()`
(`scripts/surface-probe.mjs:290-302`) → `argv.mjs, base.mjs, observe.mjs, surface.mjs`, and hashes
that order at `scripts/surface-probe.mjs:583-596`. Only `base.mjs`/`argv.mjs` are transposed, which
is exactly enough to change the hash:

| input order | sha256 prefix |
|---|---|
| declared (base,argv,observe,surface) | `b36559d0…` = `manifest.scriptDigest` ✔ |
| sorted (argv,base,observe,surface) | `f17d1547…` = probe result ✘ |
| base revision, sorted | `ca708547…` vs declared `e4f4d56f…` (same failure) |

`DIGEST_INPUT_SET` and `DIGEST_PER_FILE` both pass, so the byte set and every per-file digest are
correct; only the concatenation order is contested. The probe already emits
`DIGEST_ORDER` (note, non-gating) at `surface-probe.mjs:558-559` for this exact condition, then
still errors one branch later — the probe contradicts itself.

Upstream's own contract statement is `surface.mjs:3-5`: "The surface digest covers the shim plus
every module in this directory, **in fixed order**." No lexicographic claim anywhere; the pin
(`config/ufo.json sighting.surfaceDigest`) is `sha256(canonicalJson(manifest))` and `PIN_DIGEST`
passes at the pin, i.e. the produced manifest is exactly what upstream attested.

Verdict: no upstream byte drift; probe expectation drift. Introduced with the probe itself
(`d65aa24 round-9`, the only commit that ever touched `--help`/`DIGEST_ORDER`/the digest logic);
its hermetic fixture also bakes the sorted order in (`scripts/surface-probe.mjs:968`), which is why
`--selftest` never catches it.

Lane-side repair options (probe is a lane file, own it here):
1. Hash `listedPaths` (manifest order) and keep `DIGEST_INPUT_SET` + `DIGEST_PER_FILE` as the
   anti-drift binds; the digest then still cannot be CLEAN-by-accident because a byte change moves
   the per-file digest. Keep `DIGEST_ORDER` a note.
2. Minimal: try canonical order, then declared order; error only if neither matches.
3. Documented escape hatch keyed on `digestInputs` order equality is **not** recommended — it
   silently blesses any future permutation.
Also update the docstring at `scripts/surface-probe.mjs:39-48` and the fixture so the spec and the
test agree.

## Verbs — `VERB_DISPATCH` (upstream cause)

- dispatch arm: `/fast/scratch/kumitate-r35/src/scripts/ufo-sighting.mjs:4484`
  (`if (command === "surface")`), option gate `:4487`.
- advertised in the CLI's own usage: `scripts/ufo-sighting-lib/surface.mjs:265`
  (`ufo-sighting surface --json`).
- `manifest.verbs` (12) = complete,inquiry,launch,open,overview,peek,reconcile,remove,
  respawn-terminal,resume,status,steer; `manifest.extras` = register,twin,help. `surface` is in
  neither; `grep -c '"surface"'` over the generated manifest returns **0**.
- Identical at 964f443e (base) and 31c465f1 (pin): `source-only=surface declared-only=-` in both.
- The manifest omits the very verb that produces it; a consumer enumerating `manifest.verbs`/
  `extras` cannot discover `surface`, and `sync-ufo-contracts.mjs` calls it blind.

The lane probe's intent is correct: its hermetic fixture declares `surface` in `extras`
(`scripts/surface-probe.mjs:971-973`). So this is upstream's self-description gap, not a probe
over-reach. Upstream repair (operator-owned, do not patch): add
`{ name: "surface", flags: { "--json": { type: "bool", required: true } } }` (or a `verbs.surface`
entry) to `surfaceManifest()` in `scripts/ufo-sighting-lib/surface.mjs`, then re-charter
`config/ufo.json sighting.surfaceDigest` via `sync-ufo-contracts` because the manifest bytes change.

`ERROR_CODE_OFF_MANIFEST` (warn, non-gating, 4 literals) is unchanged at base and pin: pre-existing,
not part of this item.

## Commit attribution

- `72ab84a` — "fix(sub-7): M4 r04 — bounded successor reads, archive roll-up, probe trace",
  2026-09-25. Creates `scripts/ufo-sighting-lib/surface.mjs` including the fixed module order
  (lines 13-18) and the `surface` dispatch; **the verb was never declared in the manifest from its
  creation**. It is the shallow root of `/fast/scratch/kumitate-r35/src` (`--is-shallow-repository`
  = true; parent `aae28e49` is absent), so earlier history is unobservable here — but base and pin
  both exhibit the gap, so no later regression explains it.
- `964f443e` (base) — manifest `scriptDigest` `e4f4d56f…`; pin `666cd0a1…`; probe reports
  `PIN_DRIFT` (canonical `8884924f…`), i.e. upstream's pin was stale at base.
- `7a8130a` — the only commit in `964f443e..31c465f1` touching sighting scripts; changed
  `base.mjs`, `surface.mjs` (twin extras/usage only, **no order change**) and `ufo-sighting.mjs`,
  moving `scriptDigest` to `b36559…`. Did not declare `surface`.
- `a431eee` — "surfaceDigest re-chartered": `config/ufo.json` `666cd0a1…` → `1064c19a…`; pin now
  equals `canonicalJson(manifest)` (`PIN_DIGEST ok`). This is the only digest-value change in the
  base..pin window; it does not affect `DIGEST_CONCAT`.

## Environment caveat (`--src` against the pinned clone)

`/fast/scratch/kumitate-r35/src` is `dr-xr-xr-x`; the probe's dispatcher surface runs
`node scripts/fleet-dispatcher.mjs status` with cwd = src and the dispatcher does
`mkdir <src>/.ufo` → `EACCES: permission denied, mkdir '/fast/scratch/kumitate-r35/src/.ufo'`,
adding `SURFACE_UNREACHABLE` (exit 1; keys `kind=dispatcher_crash`, `ledger_append_failed`).
When probed in a writable extraction of the same revision, all three dispatcher checks pass and the
verdict matches the frozen baseline exactly. So the clone read-only bit adds one artifact error and
nothing else; do not read it as tree drift. No writable clone copy was requested by this ticket, and
none was written to the clone.

Cross-check for the baseline's provenance: the six sighting files are byte-identical between
`/home/vgpnk/Projects/ufo-fsd-alpha` and the pinned clone (e.g. `surface.mjs`
`838f28a64996d5c8…`, `ufo-sighting.mjs` `ce625a0b19c7fc46…`), which is why baseline
(`src=31c465f1…`) and the pin run agree to the digit.

## Impact on the checklist item and remaining unknowns

`SKILL.md:620` demands `exit 0 + SURFACE_PROBE: CLEAN`. At the pin that is unreachable from the
lane alone: after fixing the lane's digest-order expectation, `VERB_UNDECLARED surface` still gates
until upstream declares the verb (and re-charters the pin). Operability consequence: the item is
honest DRIFT, not tool failure (exit 1, verdict line present — not the exit-2 tool fault the
SKILL.md prose describes), and its cause is now named.

Unknowns:
- Whether upstream once declared `surface` before `72ab84a` — unobservable (shallow root; parent
  object absent). [INFERENCE] irrelevant, since both 964f443e and 31c465f1 omit it.
- Whether the operator prefers `verbs.surface` vs `extras`-with-flags for the upstream repair; both
  satisfy the probe (`extras[].name` is accepted), but `verbs` is the semantically correct home for
  a top-level command that takes `--json`.
- [INFERENCE] No other consumer currently re-derives `scriptDigest` in sorted order; `sync-ufo-contracts`
  only compares the canonical-JSON pin, so the lane probe is the sole divergent reader.
