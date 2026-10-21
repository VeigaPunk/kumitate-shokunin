SENTINEL secrets hits=15 leaks=0

# SentinelSecrets — round-36 build wave (read-only)

Snapshot **2026-10-21T02:30:10-03:00**, lane tip `0614092e0804`, wave dir at
snapshot: **97 files** (53 of them `build/*.md` reports), plus 3 pin files in
the `ExecPinFiles` scratch clone and **18 in-flight scratch clones (30 changed
entries)**. No installs, no package transactions, no writes except this file.

Verdict: **no credential value, cookie value, one-password (`op://`) reference,
private HTTP URL or sensitive-file content exists in any scanned byte.** Every
match below is a path name, policy prose, a self-reference, or an upstream
matcher literal. `leaks=0`.

## Hits table (15 dispositioned references)

| # | path:line | Surface | Disposition |
|---|-----------|---------|-------------|
| 1 | `.ufo/waves/round-36/build-spec.json:3` | `~/.kimi-code/mcp.json`, `server.token`, `credentials/`, `oauth/` named in wave context | **shape-only** — policy text; no content |
| 2 | `.ufo/waves/round-36/build-spec.json:745` | same names + `op://` in the SentinelSecrets item prompt | **shape-only** — self-referential item text |
| 3 | `.ufo/waves/round-36/build-dispatch.json:997` | dispatch copy of the context | **shape-only** |
| 4 | `.ufo/waves/round-36/build-dispatch.json:1457` | dispatch copy of the item prompt | **shape-only** |
| 5 | `.ufo/waves/round-36/falsify-spec.json:3` | falsify context copy | **shape-only** |
| 6 | `.ufo/waves/round-36/falsify-spec.json:609` | `SecSecrets` item prompt copy | **shape-only** |
| 7 | `.ufo/waves/round-36/build/ConnectorOutOfProvince.md:18` | `~/.kimi-code/mcp.json` named as out-of-province route plane; explicit "MUST NOT … inspect … content" | **shape-only** |
| 8 | `.ufo/waves/round-36/build/ConnectorOutOfProvince.md:20` | `~/.kimi-code/mcp.json` is lane Core K1, "gated by kimi-census"; `SentinelSecrets` "must not open it" | **shape-only** |
| 9 | `.ufo/waves/round-36/build/ScoutPinDesign.md:80` | `~/.kimi-code` default root; "reads no origin tree" | **shape-only** |
| 10 | `.ufo/waves/round-36/build/ScribeKnowledgePin.md:91` | `~/.kimi-code` "live tree, not a corpus source" | **shape-only** |
| 11 | `.ufo/waves/round-36/baseline/kimi.txt:1` | `KIMI_ROOT: /home/…/.kimi-code` + family **counts only** | **shape-only** (census evidence; no member name printed in text mode) |
| 12 | `.ufo/pins/origin.json:6` (scratch `ExecPinFiles`; quoted at `build/ExecPinFiles.md:20,83`) | `file:///home/<user>/Projects/ufo-fsd-alpha` local URL + two absolute paths in `recreate` | **path disclosure, not a credential** — precedent: 126 tracked files already carry `/home/<user>` paths, 169 carry `/fast/scratch` (`git grep`). Optional smallest fix: `${HOME}/Projects/ufo-fsd-alpha` inside the one-liner |
| 13 | `.ufo/waves/round-36/frozen/pin.txt:2` | `/fast/scratch/kumitate-r36/src` | **internal path**, no secret |
| 14 | `.ufo/waves/round-36/baseline/surface-default.txt:2`, `surface-pin.txt:2`, `cite-pin.txt:2-3` | `src=`, `self=`, `fleet=` absolute paths | **internal paths**, no secret |
| 15 | scratch `ExecR5Sections` / `ReviewChecklist` `corpus/knowledge/native-admission-detail.md` added lines | `sk-`/`rk-`/`ak-`/`xai-`/`xoxb-`/`token=`/`authorization:`/`dashscope_api_key=`/`eyj<…>` | **upstream matcher literals, not secrets** — verified at pin `native_admission_text.rs:18-70`; all are `contains(...)` needles with no trailing value |

Zero hits for: GitHub/Slack/AWS/OpenAI-style key shapes, compact JWT
(`eyJ… . … . …`), `Bearer <token>`, `-----BEGIN … PRIVATE KEY-----`, URL
userinfo, `Cookie:`/`Set-Cookie:` values, and any `op://` vault path. The three
`op://` byte sequences in the wave dir are exactly rows 2/4/6 (item text);
`op://` in `corpus/lessons/round-5-aggregator-audit.md:79` and
`round-9-…:20` are pre-existing meta-references to that sweep, not this round.

Scan commands (all read-only, cwd=lane):
`grep -rEc '<shape>' .ufo/waves/round-36/` → all 0 except `op://`=3 and
sensitive-path=8 (rows 1-8); entropy filter (`[A-Za-z0-9_+/=.-]{32,}`,
Shannon ≥ 4.5, non-hex) over 97 files → 2 candidates, both
`scripts/fleet-dispatcher.mjsL<digits>-<digits>` line-range tokens.

## Kimi census remains shape-only

- `scripts/kimi-census.mjs` is **unmodified**: `sha256sum` =
  `7818970b80d4951b8edf15dcc8c5a16efe57f457f956a5ce019f049068538156`,
  byte-identical to `frozen/scripts.sha256:3`.
- Imports are `lstatSync, readdirSync, mkdtempSync, mkdirSync, writeFileSync,
  chmodSync, rmSync, symlinkSync, realpathSync` — **no `readFileSync`**. The
  only `readFile*` token in the file is the policy comment at `:46`.
- Secret members are declared `secret: true` and handled by `lstatKind` +
  `modeOf` only (`:201`, `:269`); `mcp.json` is a K1 member with 0400 floor,
  `server.token` 0600, `credentials/`/`oauth/` 0700. `spawnSync` is used only
  for self-selftest re-invocation (`:463`) and `mkfifo` fixtures
  (`:652`,`:741`) — no shell-out that could `cat` a secret.
- `baseline/kimi.txt` output is `KIMI_ROOT` + per-family counts + `TOTALS`; no
  member names, no content. `baseline/selftest-kimi.txt` = `48/48 pass`.
- Exact-copy control without reading secrets: `stat` sizes are `mcp.json`=249 B,
  `server.token`=43 B; `find .ufo/waves/round-36 -type f -size 249c -o -size
  43c` → **none**. [INFERENCE] byte-fragment containment inside larger files
  was not tested because the contract forbids reading those files; the
  shape/entropy scans above are the compensating control.

## No new script reads the secret files

- Changed gate scripts (`claims-check.mjs`, `proxy-check.mjs`,
  `surface-probe.mjs`) in all 18 in-flight clones: added `readFileSync`/
  `readText` targets are the lane's own `--pin`/`--known`/`--fidelity-ratchet`
  JSON, corpus notes, scorecard/SKILL/README, and pinned origin sources. No
  added line references `.kimi-code` beyond proxy-check's pre-existing
  `DEFAULT_KIMI_ROOT` (`proxy-check.mjs:419`) and its `kMembers` path, which
  stays `lstatKind` + `listChildren` (`:626-657`) — shape-only.
- Pin verification runs `git -C <dir> rev-parse HEAD` with
  `GIT_TERMINAL_PROMPT=0` and `GIT_OPTIONAL_LOCKS=0` (e.g. `proxy-check`
  added `:107-109`), so it can neither prompt for nor emit credentials; its
  only output is a 40-hex HEAD.
- FIDELITY anchor resolution is confined: `probeSections` binds
  `resolve: makeResolver(files)` (origin index) and `fidelityAnchor` rejects
  unless `resolved.length === 1 && resolved[0] === own`, so a note anchor such
  as `…/.kimi-code/mcp.json:5` resolves to zero and is skipped; symbol search
  reads only that section's own member file (`readText(join(src, sec.file))`).
- `surface-probe` dispatcher spawn now passes a `mkdtemp` state root and
  spreads `process.env` (pre-existing pattern, `env: { ...process.env, UFO_* }`);
  the pinned `fleet-dispatcher.mjs status` verb is lock-free/read-only
  (`fleet-dispatcher.mjs:640`) and its `process.env` uses read config paths,
  never dumping env into stdout.

## Non-secret observations for the L1

1. `ExecFidRemainder` clone carries an **untracked**
   `corpus/knowledge/remaining-scripts-census.md.bak` (clean content, no
   secret). Ensure the delivered patch excludes it (dead weight).
2. `ReviewChecklist` clone applies claims PIN v1 but its `surface-probe` still
   has the old `readDispatcherStatus` and no `--known`; do not mistake that
   snapshot for the integrated tree (completeness is other seats' surface).
3. My scan is a snapshot while the wave is still landing reports. Re-run on
   the integrated lane before commit:
   `grep -rEn 'gh[pousr]_[A-Za-z0-9]{20,}|sk-[A-Za-z0-9_-]{20,}|xox[baprs]-|AKIA[0-9A-Z]{16}|eyJ[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}\.|-----BEGIN .*PRIVATE KEY-----|op://[A-Za-z0-9]|https?://[^ ]*:[^ ]*@' .ufo/pins .ufo/waves/round-36`
   → expect only the three `op://` self-references (rows 2/4/6).
