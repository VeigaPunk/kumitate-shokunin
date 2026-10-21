KIMIROOT children=33 stray=mcp.json mcp_kind=file mcp_mode=644

# ScoutKimiRoot — C3 substrate census (stat-only)

Seat: read-only scout, lane `/home/vgpnk/Projects/shokunin/kumitate-shokunin` @
`1770305fae20826b39905a8251ddeca6b4957ac4`. No edits, no installs, no delegation.
`~/.kimi-code/mcp.json` was **never opened or read**; every operation below is
`readdirSync`/`lstatSync`/`stat` (kind, mode, size, times) only.

## Verdict-relevant facts (OBSERVED)

### Root enumeration

```
$ ls -la ~/.kimi-code/      # 17 files, 16 dirs (8 .bak, 2 .json, 1 .jsonl, 1 .png)
$ ls -A ~/.kimi-code | wc -l
33
$ ls -A ~/.kimi-code | grep -c '^\.'
0
```

`readdirSync` (unsorted) returns the same 33 names; there are **no hidden root
children**, so the enumeration is complete and cannot hide a second stray.

Derivation reproduced with the gate's own rule (root segment of every `MEMBERS`
path, `chain` contributing its literal prefix `config.toml`; then
`!declared && !RE_CHAIN`):

```
declared_names 25
children 33 chain 7 strays 1
STRAYS: ["mcp.json"]
DECLARED_BUT_ABSENT: []
stray_stat mcp.json file 0644 249
```

So the single stray **is** `mcp.json`. Code path: `scripts/kimi-census.mjs:218-226`
(`declaredRootNames`), `:353-360` (stray filter + `ROOT_ENUM` info line),
`:356` (the `UNLISTED` finding text). This matches the baseline line verbatim:
`.ufo/waves/round-35/baseline/kimi.txt:8` →
`INFO  ROOT_ENUM  -  root children=33 declared=25 chain=7 strays=1` and
`kimi.txt:9` → `CENSUS  error  UNLISTED  mcp.json  …`.

Declared set (25) decomposes as K1 `config.toml`,`tui.toml` (2) + K2 `agents`,
`skills`, `plugins` (3) + K3 9 + K4 8 + K5 3; the 7 `config.toml.*.bak`
generations are exempt chain figures. `declared 25 + chain 7 + stray 1 = 33`.

### `mcp.json` shape

```
$ stat -c '%n %F %a %s %y' ~/.kimi-code/mcp.json
/home/vgpnk/.kimi-code/mcp.json regular file 644 249 2026-10-15 06:47:10.647583513 -0300
$ stat -c '%n %F %a %U:%G(%u:%g) %s %y' ~/.kimi-code/mcp.json
… regular file 644 vgpnk:vgpnk(1000:1000) 249 2026-10-15 06:47:10.647583513 -0300
```

- kind: **regular file** (not symlink, not FIFO, not dir) — satisfies the
  `isLeaf` kind pin used by `server.token` (`kimi-census.mjs:208,295-305`).
- mode: **0644**. Owner `vgpnk` (uid 1000) is the census caller, so `rw` is
  present for the reader.
- size 249 B; mtime 2026-10-15 06:47:10.647583513 -0300. This is byte-for-byte
  the shape recorded in `corpus/knowledge/kimi-mcp-plane.md:35-37`
  (`kind=regular file size=249 mode=644 mtime=2026-10-15 06:47:10.647583513 -0300`):
  **no drift since the 2026-10-19 note**.

### Mode vs a 0600 floor

Gate semantics are a **floor**, not equality: `kimi-census.mjs:310`
`(mode & m.modeFloor) !== m.modeFloor` → `SHAPE_DRIFT`; same rule documented at
`:39-46` (“mode pins are floors (`mode & floor === floor`) … `oauth/` is 0755,
not 0700”). Measured:

```
mode 0644 floor600_and true groupother 044 exact600 false
```

- 0644 **satisfies** a `modeFloor: 0o600` pin (`0o644 & 0o600 = 0o600`).
  Declaring `{ id: 'mcp.json', family: 'K1', path: 'mcp.json', kind: 'file',
  secret: true, modeFloor: 0o600 }` — the `server.token` pattern at
  `kimi-census.mjs:128` — therefore passes on the live tree and the C3 target
  (CLEAN, K 51/51) is reachable **without touching the host file**.
- The same pin does **not** buy confidentiality: group/other bits `044` remain,
  i.e. the file is group- and world-readable. Every other credential-adjacent
  file on this root is owner-only — `config.toml 0600`, `server.token 0600`,
  `workspaces.json 0600`, `device_id 0600`, `session_index.jsonl 0600` — while
  the 0644 cohort is `tui.toml`, `region`, `tui.toml.bak`, `rc-qrcode.png`.
  `mcp.json` sits in the permissive cohort although S005 documents `env`,
  `headers` and `bearerTokenEnvVar` fields for it
  (`corpus/knowledge/kimi-mcp-plane.md:20-23`), which is exactly why the
  registry entry is SHAPE-ONLY.
- [INFERENCE] Consequence for the build: a 0600 floor is *consistent with the
  frozen “mode floor” rule* and yields the declared K 51/51, but it certifies
  only “owner-rw present”, not “no group/other read”. The floor model at
  `:310` cannot express “no `0o077` bits”; if the lane wants that guarantee it
  needs a different shape rule (a mask pin), which is outside this item's
  pre-registered “presence, kind, mode floor” contract. Flagged, not decided.

## Build coupling (OBSERVED; executor scope, not mine)

- Adding `mcp.json` to `MEMBERS` makes `declaredRootNames()` return 26
  automatically (`path.split('/')[0]`), so `ROOT_ENUM` becomes
  `declared=26 strays=0`, and `members 50 → 51` (K1 3 → 4). `FROZEN.K1` must
  move 3 → 4 (`kimi-census.mjs:148`) or the informational `--json` echo diagrees.
- The companion registry re-derives its own K1 table: `scripts/proxy-check.mjs:346-348`
  (`config.toml`, `tui.toml`, chain) and its fixture total
  `K_members = 29` (`:1141-1142`, `:1315`, `:1424-1427`, `:1598-1633`). It needs
  the same member or `K_members` reads 50 against the live tree while the
  census reads 51 — the two gates would disagree on the same substrate.
- Pre-registration is recorded: `SCORECARD.md:311` (“Root mcp.json stays
  outside K … until the round-35 pre-registered K1 change”) and
  `corpus/knowledge/kimi-mcp-plane.md:25-28`. No `mcp.json` reference exists in
  `.ufo/waves/round-35/frozen/` (grep, no output) — the frozen set is S-layer
  populations only, which is consistent.

## Confidence
| Claim | Basis | Confidence |
|---|---|---|
| 33 root children, 0 hidden | `ls -A`, `readdirSync` | high (observed) |
| sole stray = `mcp.json` | gate rule re-executed locally | high (observed) |
| kind regular file, mode 0644, 249 B, mtime 2026-10-15 | `stat` (two formats) | high (observed) |
| 0644 passes a 0600 floor | gate code `:310` + computed `&` | high (observed) |
| post-add totals 51 / declared 26 / strays 0 | arithmetic over code | high (`[INFERENCE]` on unrun edit) |
| floor intent = owner-only vs “owner-rw present” | not stated anywhere read | **unresolved** |

## Remaining unknowns
1. Whether the lane intends `mcp.json` to be *owner-only* (then the floor pin is
   insufficient) or merely *present with owner-rw* (then 0600 floor is exact and
   target 51/51 is honest). No document read states this.
2. ACLs/xattrs on `mcp.json` were not inspected; mode-only was in scope.
3. Whether a project-level `.kimi-code/mcp.json` twin exists anywhere relevant —
   the corpus note already reports none under `/home/vgpnk/Projects` to depth 3;
   not re-probed here.

## Commands run

```
ls -la ~/.kimi-code/
ls -A ~/.kimi-code | wc -l ; ls -A ~/.kimi-code | grep -c '^\.'
stat -c '%n %F %a %s %y' ~/.kimi-code/mcp.json
stat -c '%n %F %a %U:%G(%u:%g) %s %y' ~/.kimi-code/mcp.json
node -e '<readdir/lstat re-derivation of declaredRootNames + RE_CHAIN>'   # 3 variants, all read-only
grep -n 'modeFloor|SHAPE_DRIFT|secret' scripts/kimi-census.mjs
grep -n 'K1|K_members|KIMI|mcp.json' scripts/proxy-check.mjs
grep -rn 'mcp\.json' .ufo/waves/round-35/frozen/ docs/          # no output
node -e '<JSON slice of .ufo/waves/round-35/build-spec.json around mcp.json>'
```

No tools installed or upgraded. No file outside this report written.
