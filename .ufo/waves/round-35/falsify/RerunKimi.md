ATTACK KIMI_CENSUS-CLEAN+0open verdict=holds defects=0

Target: round-35 C3 claim — `KIMI_CENSUS: CLEAN (members=51 checked=51 chain=7 info=4)` plus the
shape-only/0-open policy for root `~/.kimi-code/mcp.json` (presence, kind file, 0400 floor, never
content-read), with master-tree comparison expecting `DRIFT (UNLISTED mcp.json)`.
Judged axis: coverage:kimi-layer. Lane: /home/vgpnk/Projects/shokunin/kumitate-shokunin.

## Reproduction of the claim (all exit 0 unless noted)

1. `node scripts/kimi-census.mjs` →
   `TOTALS: members=51 checked=51 errors=0 info=4 chain=7`;
   `KIMI_CENSUS: CLEAN (members=51 checked=51 chain=7 info=4)`. K1 members=4 frozen=4 (mcp.json in).
2. `node scripts/kimi-census.mjs --json` → schema/contract `kumitate-kimi-census-v1`,
   `totals.members=51 checked=51 chain=7`, `families 4/26/9/9/3`, `rootEnum children=33 declared=26
   strays=0`, `findings=[]`, `verdict=CLEAN`. The mcp.json member row: `kind:"leaf-or-dir"`,
   `secret:true`, `modeFloor:"0400"`, `mode:"0644"`, `state:"ok"` — live 0644 satisfies a 0400 floor.
3. `node scripts/kimi-census.mjs --selftest` → `KIMI_CENSUS_SELFTEST: 48/48 pass`, `VERDICT: PASS`.
   Matches build/ExecK1.md:17; baseline was 45/45 (baseline/kimi-selftest.txt:3).

## Attack 1 — the named 0-open strace

`strace -f -e trace=open,openat,openat2,read node scripts/kimi-census.mjs 2>&1 | grep -n mcp.json`
→ zero matches (grep exit 1). **0 opens of mcp.json confirmed.**

Caveat I closed: `read()` lines carry fds, not paths, so that grep could never see a content read.
Ran the stricter descriptor-decorated variant:
`strace -f -y -e trace=open,openat,openat2,read,pread64 node scripts/kimi-census.mjs 2>&1 | grep 'kimi-code'`
→ exactly 5 syscall lines, all `openat(...O_RDONLY|O_NONBLOCK|O_CLOEXEC|O_DIRECTORY)` on
`~/.kimi-code`, `agents/secondary`, `skills`, `plugins`, `plugins/managed` (readdir enumeration of
non-secret dirs; the JSON-declared enumerables). Zero opens and zero reads of mcp.json,
server.token, credentials/, oauth/.
`strace -f -y -e trace=read,pread64,readv … | grep 'kimi-code'` → only the gate's own stdout line
`KIMI_ROOT: /home/vgpnk/.kimi-code` (merged stream, not a syscall): **zero read syscalls on any
kimi-code fd**.

## Attack 2 — stat-family (shape-only must be stat-only)

`strace -f -e trace=stat,lstat,newfstatat,statx … | grep mcp.json` → exactly 2 statx calls, both
`AT_SYMLINK_NOFOLLOW`, `S_IFREG|0644` (the two lstatSync calls: lstatKind + modeOf,
scripts/kimi-census.mjs:296-316). Symlinks are never followed (dangling-symlink and FIFO selftest
arms at :650-667, :739-749 hold). Same pattern for the other secrets: server.token ×2 statx (0600
reg), credentials ×2 (0700 dir), oauth ×2 (0755 dir) — modes match the JSON output; the live
`oauth/` 0755-vs-0700 divergence is documented in-code at :52-53 and passes its 0700 floor.

## Attack 3 — verify mode must not write

`strace -f -e trace=open,openat,openat2 … | grep 'O_WRONLY|O_RDWR|O_CREAT'` → zero matches outside
node runtime internals. Verify mode is read-only; mkdtemp/write/chmod/rm imports are selftest-only
(fixtureTree, :87-89, :571+).

## Attack 4 — master-tree comparison (DRIFT → CLEAN)

`cd /fast/scratch/kumitate-r35/master-tree && node scripts/kimi-census.mjs` →
`FAMILY K1 members=3 checked=3 frozen=3`; `ROOT_ENUM … children=33 declared=25 chain=7 strays=1`;
`CENSUS error UNLISTED mcp.json  mcp.json sits at the root and is not declared by the frozen K1–K5
set`; `TOTALS: members=50 checked=50 errors=1`; `KIMI_CENSUS: DRIFT (UNLISTED mcp.json)`; exit 1.
Exactly the expected pre-round state; identical to `.ufo/waves/round-35/baseline/kimi.txt:15`
(members=50 checked=50 errors=1, DRIFT UNLISTED mcp.json). The round-35 delta (K1 3→4,
declared 25→26, strays 1→0, DRIFT→CLEAN, 50→51) is fully accounted for by the single added member
at scripts/kimi-census.mjs:108.

## Code-level check of the floor semantics

`scripts/kimi-census.mjs:108` declares
`{ id: 'mcp.json', family: 'K1', path: 'mcp.json', kind: 'file', secret: true, modeFloor: 0o400 }`;
`:311` enforces a true bitwise floor `(mode & m.modeFloor) !== m.modeFloor` (not equality), so the
live 0644 passes and a 0300 file would SHAPE_DRIFT. The secret branch lstats only (`:307-316`); the
shape pin accepts any non-directory leaf for file-declared secrets (FIFO-safe, selftest :742).

## Findings

No defects. Claim C3's measured facts and the 0-open/never-content-read policy hold under strace,
including a stricter fd-decorated trace than the assigned command.

Residual observations (not claim defects):
- R1 [observed]: the selftest has floor-violation arms for `credentials/` (0500, :615-619) and
  `server.token` (0400, :621-626) but no arm that puts mcp.json itself below 0400. The floor-check
  code path is shared, so mutation kills via the sibling arms still exercise it; the mcp.json
  present-arm (:717-727) pins `modeFloor==='0400'` metadata only. Coverage nit for the gate, not a
  false CLEAN on the live tree.
- R2 [observed]: the assigned grep over `open,openat,openat2,read` traces is structurally blind to
  content reads (read() lines lack paths). Anyone re-verifying should use `strace -y` fd decoration;
  I ran both, both clean.
- R3 [inference, out of my lane]: sibling MutKimiCensusMcp covers gate mutation kills; R1 should be
  reconciled with their mutation set.

Verification gaps: none material. Cross-checked against wave-1 evidence (baseline/kimi.txt,
baseline/kimi-selftest.txt, build/ExecK1.md, falsify/SentinelK1Final.md, falsify/CriticC3Final.md) —
my live numbers agree with every recorded figure.

Tooling record: no tools installed or upgraded (host strace 7.2 and node v24.21.0 sufficed).
