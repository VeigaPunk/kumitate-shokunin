PIN-DESIGN consumers=6 gaining=3

# ScoutPinDesign — exact PIN v1 file, recreate one-liner, default-`--src` consumer map

Read-only seat. Every fact below was observed on this host at the pinned revision; inference is marked [INFERENCE].
Lane cwd for all lane commands: `/home/vgpnk/Projects/shokunin/kumitate-shokunin`. Pinned source was only ever read.

## 1. The literal file: `.ufo/pins/origin.json`

`.ufo/pins/` does not exist yet (`ls .ufo` → no `pins`). Exact bytes to commit (2-space indent, trailing newline, field order as in the contract):

```json
{
  "contract": "kumitate-origin-pin-v1",
  "repo": "ufo-fsd-alpha",
  "revision": "31c465f15669f744848bd9f5d56191c5085670f7",
  "clone": "/fast/scratch/kumitate-r36/src",
  "recreate": "git clone --no-local --no-checkout /home/vgpnk/Projects/ufo-fsd-alpha /fast/scratch/kumitate-r36/src && git -C /fast/scratch/kumitate-r36/src checkout -q --detach 31c465f15669f744848bd9f5d56191c5085670f7 && chmod -R a-w /fast/scratch/kumitate-r36/src",
  "verified_at": "2026-10-21"
}
```

Notes on the `recreate` value:
- It clones **from** the upstream work tree at `/home/vgpnk/Projects/ufo-fsd-alpha` (that is what `git -C /fast/scratch/kumitate-r36/src config --get remote.origin.url` reports) and writes **only** to the destination. No command in it touches the upstream tree, and none runs with `cwd` inside it.
- `--no-local` forces a real pack transfer instead of the local-clone fast path, so the destination shares no hardlinked object files with the upstream `.git` (a hardlinked clone would be corrupted by an upstream `git gc`). It also means the clone is not affected by the upstream's `chmod` mode.
- `--no-checkout` + `checkout --detach <rev>` makes the destination HEAD the pin **regardless of where the upstream default branch points later**; the rev is never taken from a branch tip.
- `chmod -R a-w` runs last, after checkout (a checkout into an `a-w` tree cannot write).
- Destination must be absent: `git clone` refuses a non-empty existing dir, so a re-run fails loudly instead of half-overwriting. Measured cost on this host: **0.33 s**, `.git` 13 MB, 191 upstream refs.

**Verified by executing the exact string** into `/fast/scratch/kumitate-r36/w/ScoutPinDesign/recreate-a` (with the destination substituted):
`git -C recreate-a rev-parse HEAD` → `31c465f15669f744848bd9f5d56191c5085670f7` (exit 0); `HEAD^{tree}` = `1815a679d954f4e12624e522847641e84b25fdd8`, identical to the live pinned clone; `git ls-tree -r --name-only` file lists identical; `.git` size 13 MB vs 13 MB; `.git/shallow` has the same 4 lines.
No-write proof: upstream `.git/index` (mtime 1792491951, 125375 B), `.git/HEAD` (1792447324, 21 B) and `Cargo.toml` (1791072640, 640 B) were stat'ed before and after → `diff` empty, no `.git/*.lock` created.

Two alternative variants were probed and rejected as the declared value:
- `git clone --depth 1 --no-local <upstream> <dst>` also produced the pin **today** (upstream HEAD is the pin), but a depth-1 clone follows the upstream's default-branch tip, so it stops being revision-faithful the moment upstream advances.
- `git init <dst> && git -C <dst> fetch --depth 1 <upstream> <sha> && git -C <dst> checkout --detach FETCH_HEAD` also worked, but it demands `uploadpack.allow*SHA1InWant`-style reachability for a non-tip sha and is three processes longer with no gain.

Upstream shape matters for readers: `/home/vgpnk/Projects/ufo-fsd-alpha` is itself **shallow** (`rev-parse --is-shallow-repository` → `true`, `.git/shallow` populated), HEAD == pin, `--is-bare-repository` → `false`. A clone from it is therefore shallow too (4 graft lines) — irrelevant to PIN v1, which compares HEAD only.

## 2. `git -C <src> rev-parse HEAD` — exact observable behaviour

All rows below were executed on this host (`git version` from the distro; `set +e`, status captured directly).

| case | stdout | stderr | exit |
|---|---|---|---|
| pin clone, detached at rev (also after `chmod -R a-w`) | `31c465f15669f744848bd9f5d56191c5085670f7\n` | — | 0 |
| same, `rev-parse --verify 'HEAD^{commit}'` | same 40-hex | — | 0 |
| existing dir that is not a repo (`mktemp -d`) | — | `fatal: not a git repository (or any parent up to mount point /)` / `Stopping at filesystem boundary …` | 128 |
| absent dir (`/nonexistent-xyz`) | — | `fatal: cannot change to '/nonexistent-xyz': No such file or directory` | 128 |
| path is a file, not a dir | — | `fatal: cannot change to '<file>': Not a directory` | 128 |
| `git` absent (`env PATH=/nonexistent git …`) | — | `env: 'git': No such file or directory` | 127 (Node `spawnSync`: `error.code === 'ENOENT'`, `status === null`) |
| **empty bare repo** (`git init --bare`) — plain `rev-parse HEAD` | `HEAD` | — | **0** |
| empty bare repo — `rev-parse --verify 'HEAD^{commit}'` | — | `fatal: Needed a single revision` | 128 |
| unborn branch in a normal repo — plain `rev-parse HEAD` | — | `fatal: ambiguous argument 'HEAD': unknown revision …` | 128 |
| polluted env `GIT_DIR=/nonexistent/.git` inside the valid clone | — | `fatal: not a git repository: '/nonexistent/.git'` | 128 |
| `<src>` is a symlink to the clone | 40-hex | — | 0 (`rev-parse --show-toplevel` = the real path) |
| `<src>` is a **subdirectory** of a repo | 40-hex of the OUTER repo | — | 0 |

Consequences the PIN v1 implementation must encode (these are the only places the naive assertion is wrong):
1. **Exit status alone is not the assertion.** An empty bare repo prints `HEAD` and exits 0. The check must be `rev-parse --verify 'HEAD^{commit}'` **and** a 40-hex regex on stdout (`/^[0-9a-f]{40}$/` on the trimmed line) before comparing to `pin.revision`. Empty-bare then lands in `SRC_REV_UNVERIFIABLE`, not a match.
2. **All failures share exit 128.** Non-repo, absent dir, file-not-dir, unborn, and ownership refusal are indistinguishable by status; the contract already maps them all to `SRC_REV_UNVERIFIABLE`, which is correct. `SRC_NOT_A_DIR` must stay the *earlier* arm (proxy-check already stats `opts.src` at line 1005 before use), so a missing dir never reaches git and never mislabels.
3. **`ENOENT` from spawn is the "git absent" case** (`status === null`, `error.code === 'ENOENT'`) → `SRC_REV_UNVERIFIABLE`, never a silent pass.
4. **Sanitize the child env.** `GIT_DIR` (proved) and `GIT_WORK_TREE`/`GIT_INDEX_FILE`/`GIT_OBJECT_DIRECTORY`/`GIT_COMMON_DIR` make a valid clone look invalid; spawn git with those keys deleted (e.g. `Object.fromEntries(Object.entries(process.env).filter(([k]) => !/^GIT_/u.test(k)))`), not `{...process.env}`.
5. **Subdirectory hole.** `-C <subdir>` resolves the enclosing repo, so a wrong `clone` path that lands inside another checkout would "verify". Hardening beyond the contract: also assert `realpath(rev-parse --show-toplevel) === realpath(clone)` and map a mismatch to `SRC_REV_UNVERIFIABLE`. [`[INFERENCE]` — not exercised; recommended, not required by PIN v1.]
6. `<src>` may be a symlink; `realpath` it before both the stat and `-C` so `SRC_NOT_A_DIR` and `src-rev` describe the same tree.
7. `rev-parse` is read-only on the `a-w` tree: `.git/index` and `.git/HEAD` mtime+size are byte-identical before/after, and no `.git/*.lock` appears. That is what makes "the gates stop writing into the tree they read" verifiable.
8. Display form is `src-rev=` + **first 12 hex** — observed `31c465f15669` (`${rev.slice(0,12)}`).
9. `rev-parse` can emit a non-UTF-8/odd line only under hostile config; take `.trim().split('\n').at(-1)` for the 40-hex test so a stderr-less warning line cannot poison the compare. [`[INFERENCE]`]

## 3. Default-`--src` consumers in the lane (every site)

`consumers=6` counts every file in the lane that resolves an origin tree by default; `gaining=3` are the C1 movers. Line numbers are current `master 0614092e`.

| # | file | default resolution (path:line) | flag parse | materialized at | other reads of the resolved tree | C1 |
|---|---|---|---|---|---|---|
| 1 | `scripts/cite-check.mjs` | `SRC_CANDIDATES` 106-109, `resolveSrcDefault()` 116-120 (`$UFO_SRC` → `~/Projects/ufo-fsd-alpha` → `~/Projects/origin-work/ufo-fsd-alpha`) | `--src` 260 | 276, skipped when `--selftest` without `--integrations` | 1592 JSON `src`; 2517 fail-closed dir checks; `--integrations` walks it | **unchanged** |
| 2 | `scripts/claims-check.mjs` | `SRC_CANDIDATES` 78-81, `resolveSrcDefault()` 89-93 | `--src` 891 (resolved absolute) | 903, skipped for `--selftest`/`--help` | **second default site**: `probeSections({ …, src = resolveSrcDefault() })` 463; `SRC_NOT_A_DIR` arm 473; JSON `src` 524; `ctx.src` 476 | **gains `--pin`** |
| 3 | `scripts/proxy-check.mjs` | `SRC_CANDIDATES` 264-267, `resolveSrcDefault()` 275-279 | `--src` 2450 (`dirValue`) | 2461, skipped for `--selftest`/`--help` | `SRC_NOT_A_DIR` 1005-1006; `probeSections({src: opts.src})` 1048; JSON `src` 984 and 1084 | **gains `--pin`** |
| 4 | `scripts/surface-probe.mjs` | `SRC_CANDIDATES` 137-140, `resolveSrcDefault()` 147-151 | `--src` 1463 | 1491 | fail-closed 1493-1496; JSON `src` 502; **spawns into the tree**: `cwd: src` at 392 (`readSightingSurface`) and 406 (`readDispatcherStatus`); digest/verb checks read `<src>/scripts/*` | **gains `--pin`** (+ `--known`, mkdtemp state) |
| 5 | `scripts/kimi-census.mjs` | **none** — parses only `--root` (930) defaulting to `~/.kimi-code`; reads no origin tree | — | — | — | **unchanged** |
| 6 | `scripts/round-gate.mjs` | `SRC_CANDIDATES` 150-153, `resolveSrcDefault(env)` 161-166; defaulted at 293-296 for `--origin` (not `--src`) | `--origin` 267 | 296, never in `--selftest` | origin used for commit-cited checks; `UFO_SRC` is in `ENV_KEYS` 711 so `--selftest` scrubs it | **unchanged** |

Why exactly those three move under C1: move (d) names `claims-check` and `proxy-check`; moves (b) and (c) name `surface-probe`, and the After target requires `SURFACE_PROBE: CLEAN (known=1) at src-rev=31c465f1` and `PROXY: MATCH at src-rev=31c465f1`, so those two verdict lines must carry the pin. `cite-check`, `kimi-census` and `round-gate` appear in no C1 move and in no After line; adding a pin there would be unreviewed scope (and `round-gate`'s flag is `--origin`, a different contract).

Implementation hazards found while mapping (hand to the executors):
- **Name collision**: proxy-check already owns a `pin.*` scorecard-term family (`pin.cite-check`, `pin.surface-probe`, `pin.round-gate`, `pin.proxy-check`, `pin.claims-check`, `pin.kimi-census` at 295-300) with `PIN_DRIFT`/`PIN_UNPINNED`. The new `--pin FILE` is an *origin pin*. Keep them verbally distinct in USAGE and in the JSON (e.g. `srcRev` beside `src`); do not fold the origin pin into `terms.pins`, and do not let a `PIN_*` finding absorb `SRC_REV_MISMATCH`.
- **Two default sites in claims-check**: the argv default (903) and the exported `probeSections` parameter default (463). `--fidelity`, `--pin` and the verdict must all use the argv-resolved tree; leaving 463 to re-derive the old default would score a different tree than the one the verdict names. `proxy-check` is safe here only because it passes `src` explicitly at 1048.
- **surface-probe writes into the tree it reads** at 406: the dispatcher `status` spawn inherits `cwd: src`, so the fix must set `UFO_STATE_DIR`/`UFO_PENDING_WORK_PATH` under a `mkdtemp` (and `UFO_PROJECT_ROOT=<src>`) exactly as the frozen contract says; a `--pin` against the `a-w` clone otherwise turns the write into an EACCES failure rather than a clean probe. The sighting spawn at 392 is a `bash <shim> surface --json` read; it has no state env in evidence, but the same `cwd: src` pattern applies if it turns out to write [`[INFERENCE]`].
- **`src-rev=` placement**: claims `renderVerdict` at 424-433, proxy `renderVerdict` at 961-970, surface-probe verdict at 792-793 (and fail-closed at 1495). The After target quotes `PROXY: MATCH at src-rev=…` / `SURFACE_PROBE: CLEAN (known=1) at src-rev=…`, so the segment goes inside the parenthesised term list of the MATCH/DRIFT line, and only when a pin is active — the no-pin selftest expectations at claims 630, proxy 1375 and surface 1321-1344 compare verdict lines, so an unconditional suffix would break them.

## 4. Commands run (all read-only against the pin and upstream)

```
git -C /fast/scratch/kumitate-r36/src rev-parse HEAD            # 31c465f1…c5670f7, 0
git -C /fast/scratch/kumitate-r36/src rev-parse --verify 'HEAD^{commit}'  # same, 0
git -C /fast/scratch/kumitate-r36/src rev-parse --is-shallow-repository # true
git -C /home/vgpnk/Projects/ufo-fsd-alpha rev-parse HEAD        # pin; --is-bare-repository false
git clone --no-local --no-checkout … recreate-a && checkout --detach <rev> && chmod -R a-w  # 0.33s, 0
git -C recreate-a rev-parse 'HEAD^{tree}'  # == pinned clone tree 1815a679…
git -C recreate-a ls-tree -r --name-only HEAD | diff - <(same on pin)   # identical
stat .git/index .git/HEAD Cargo.toml (upstream) before/after clone      # identical, no locks
git -C /nonexistent-xyz rev-parse HEAD                          # 128
env PATH=/nonexistent git -C <pin> rev-parse HEAD               # 127
empty bare: plain → "HEAD"/0 ; --verify HEAD^{commit} → 128
env GIT_DIR=/nonexistent/.git git -C <pin> rev-parse HEAD      # 128
```

Remaining unknowns: none blocking PIN v1's declared contract. Not tested: `safe.directory` ownership refusal (would need a chown; expected exit 128 → `SRC_REV_UNVERIFIABLE` [`[INFERENCE]`]), a `git worktree` `.git`-file clone (expected to pass; skipped to avoid writing under the `a-w` clone), and Windows path forms (out of scope on this host).
No tools installed or upgraded. No package transactions. No writes outside this report and `/fast/scratch/kumitate-r36/w/ScoutPinDesign/`.
