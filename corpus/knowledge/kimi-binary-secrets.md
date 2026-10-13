# K4 — binary & version plane: `bin/`, `updates/`, and the shape-only secret census

## Scope — four surfaces, one of them shape-only by declaration

K4 documents the **binary & version plane** of the host's Kimi Code CLI data
directory (`~/.kimi-code`, the `getDataDir()` root the binary itself resolves): (1) the two
managed executables `bin/kimi` and `bin/fd`; (2) the `updates/` directory and what an update
artifact is; (3) the `server/` runtime surface plus the four secret-shaped siblings
`server.token`, `device_id`, `region`, `oauth/`, `credentials/` — documented **shape-only**
per the kagi census discipline; and (4) the two sibling files `rc-qrcode.png` and
`~/.kimi-code/session_index.jsonl`, identified by shape.

Every claim below is split into **OBSERVATION** (measured on this host with a command whose
output is quoted), **INFERENCE** (this lane's reading of measured evidence), and **UNKNOWN**
(not verifiable from files at rest). Binary-embedded symbols are anchored as
`bin/kimi @sha256:66f47536… «verbatim»`: the binary has no line numbers, so the anchor is the
hash-pinned 190 MB file plus the exact byte-substring, re-extractable with
`strings -n 8 ~/.kimi-code/bin/kimi | grep -F '<verbatim>'`. Shell/file anchors use
`path:size`/`path:mode`.

**Declaration.** This lane never opened the contents of `~/.kimi-code/credentials/`,
`~/.kimi-code/oauth/`, or `~/.kimi-code/server.token`. Those three are reported below as
**kind, mode, size, mtime only**. The manifest census table in §"Shape-only census" *is* the
declaration: four secret-path rows, zero byte reads. `device_id` and `region` are reported by
shape too; `region`'s 7-byte value («global») was read but is a non-secret region marker.

## Measurement block (command → output, this host, 2026-10-13)

```
$ ~/.kimi-code/bin/kimi --version
2.1.1
$ file ~/.kimi-code/bin/kimi
… ELF 64-bit LSB executable, x86-64, dynamically linked,
  interpreter /lib64/ld-linux-x86-64.so.2,
  BuildID[sha1]=5e67bdf95c7646325b62decd0ca8d375d325ea19,
  with debug_info, not stripped, too many notes (256)
$ file ~/.kimi-code/bin/fd
… ELF 64-bit LSB pie executable, x86-64, static-pie linked, stripped
$ sha256sum ~/.kimi-code/bin/kimi ~/.kimi-code/bin/fd
66f47536e40b02bb1d577cdd324768f73d39b8b9472e0ca140e73d8e225cd7de  bin/kimi
78d315b3ed7bb8cc42052880c7be02454ad5324c7c853c291c53b0aaf6f4367b  bin/fd
$ stat -c '%n size=%s mode=%a mtime=%y' private files
bin/kimi        size=190778560 mode=755 mtime=2026-10-03 17:52:50 -0300
bin/fd          size=4142816   mode=755 mtime=2026-03-10 04:39:47 -0300
server.token    size=43        mode=600 mtime=2026-10-13 16:03:07 -0300
device_id       size=36        mode=600 mtime=2026-10-03 17:53:30 -0300
region          size=7         mode=644 mtime=2026-10-03 17:52:50 -0300
rc-qrcode.png   size=2323      mode=644 mtime=2026-10-13 16:03:10 -0300
session_index.jsonl size=7588  mode=600 mtime=2026-10-13 17:05:07 -0300
$ ls -la ~/.kimi-code/updates/         # 2 files, no staged artifact
latest.json  rollout.log
```

`region` = `global` (`cat`), which selects the profile row measured in §"Update mechanism".
No member of this plane is absent; no blocker rows resulted except where explicitly marked.

## `~/.kimi-code/bin/kimi`

Kimi Code CLI itself. **OBSERVATION:** version string `2.1.1` from `kimi --version`;
190,778,560 B; mode 755; sha256 `66f47536…`; ELF x86-64 dynamically linked against
`/lib64/ld-linux-x86-64.so.2`; **not stripped, with debug_info** — which is why the update
symbols in §"Update mechanism" are recoverable as readable identifiers rather than guessed.
The shipped `--help` names the two self-management verbs verbatim
(`bin/kimi @sha256:66f47536… «upgrade|update [options]      Upgrade Kimi Code to the latest
version.»` and `«-V, --version                 output the version number»`); `kimi upgrade
--help` completes the surface as `«-y, --yes   Skip the confirmation prompt and install the
update directly.»`. The top-level program string is `«The Starting Point for Next-Gen
Agents»` and the docs pointer `«https://moonshotai.github.io/kimi-code/»`.

**INFERENCE:** the mounted binary is a *managed install* rather than an npm shim — it carries
its own updater, its own CDN profile table, and its own `bin/` directory resolver (§"Update
mechanism"), and `detectInstallSource` classifies *how* it was installed at runtime. The
`mtime` (2026-10-03 17:52:50) matches `region`'s mtime to the second, i.e. both were written
by the same first-boot install event.

## `~/.kimi-code/bin/fd`

The bundled `fd` search binary (CLI autocomplete). **OBSERVATION:** `fd --version` →
`fd 10.4.2`; 4,142,816 B; mode 755; sha256 `78d315b3…`; `static-pie linked, stripped` — the
opposite posture to `kimi` (self-contained, no symbols). **INFERENCE (strong):** `fd` is not
hand-installed; it is a *downloaded managed dependency*. The binary embeds a pinned
checksum table and a fetch path — `bin/kimi @sha256:66f47536… «FD_ARCHIVE_SHA256 = {
"fd-v10.4.2-aarch64-apple-darwin.tar.gz": "623dc0af…" …»`, the resolver
`«function getManagedFdBinaryPath() { return path.join(getBinDir(), platform() === "win32" ?
"fd.exe" : "fd"); }»` (→ `<dataDir>/bin/fd`), and the downloader
`«await downloadFile(\`${kimiCodeCdnBase()}/fd/${assetName}\`, archivePath);
verifyArchive(archivePath, expectedSha256); extractArchive(extractDir, assetName)»`.
`ensureFdPath()` first tries `detectFdPath()`, then `downloadFd()`, else returns null — so a
present `bin/fd` is the cache of a prior download, and the version is pinned in the asset name
(`fd-v10.4.2-…`). The `212`-day-old mtime (2026-03-10) vs `kimi`'s 2026-10-03 indicates fd is
staged once and reused across CLI upgrades (it is not version-coupled to `kimi`).

## `~/.kimi-code/updates/`

**OBSERVATION — layout is exactly two files, no staging directory, no downloaded artifact:**

```
$ ls -la ~/.kimi-code/updates/
latest.json   402 B   -rw-r--r--   mtime 2026-10-13 17:04
rollout.log   21074 B -rw-r--r--   mtime 2026-10-13 17:04
```

`latest.json` is the **cached CDN manifest** — its content is the version/rollout document:

```json
{ "source": "cdn", "checkedAt": "2026-10-13T20:04:41.472Z", "latest": "2.1.1",
  "manifest": { "version": "2.1.1", "publishedAt": "2026-09-24T09:09:58Z",
    "rollout": [ {"percent":30,"delaySeconds":0},
                 {"percent":30,"delaySeconds":43200},
                 {"percent":40,"delaySeconds":86400} ] } }
```

`rollout.log` is a **JSONL decision ledger**, 88 lines, one object per check with a stable key
set `ts, phase, reason, current, latest, target, manifestPresent, publishedAt, bucket,
delaySeconds, eligibleAt` (first line verbatim: `{"ts":"2026-10-03T20:53:30.966Z","phase":
"startup-cache","reason":"no-latest","current":"2.1.1","latest":null,"target":null,
"manifestPresent":false,…}`). Of the 88 records, 87 are `reason:"not-newer"` and exactly one —
the very first, quoted above — is `reason:"no-latest"` (empty cache before the first CDN read);
all 88 carry `current=latest=2.1.1` and `target:null`: no update has ever been pending, which is
the artifact-level proof that this install has never re-staged.

**What an update artifact would look like — INFERENCE,** because none is present at rest
(`target:null` throughout). The binary names its own on-disk layout as constants, so the
*shape* is measured even though no instance exists:
`bin/kimi @sha256:66f47536… «KIMI_CODE_UPDATE_DIR_NAME = "updates"; KIMI_CODE_UPDATE_STATE_FILE_NAME
= "latest.json"; KIMI_CODE_UPDATE_INSTALL_STATE_FILE_NAME = "install.json";
KIMI_CODE_UPDATE_INSTALL_LOCK_FILE_NAME = "install.lock";
KIMI_CODE_UPDATE_ROLLOUT_LOG_FILE_NAME = "rollout.log"; … KIMI_CODE_NATIVE_STAGING_DIR_NAME
= ".staging"; KIMI_CODE_NATIVE_STAGED_STATE_FILE_NAME = "staged.json"»`. So a version that
*is* updating adds, under `updates/`: `install.json` (`UpdateInstallStateSchema`:
`active{version,source,startedAt}`, `lastFailure{version,failedAt,attempts}`,
`lastSuccess{version,installedAt,notifiedAt}`), a held `install.lock`, and a `.staging/` dir
holding the per-platform payload plus `staged.json`. The payload itself is a **zstd-compressed
per-platform native asset** (`decompressAndHash(zstPath, destPath, expectedSha256)`,
`zstdDecompress`, `nativeManifestUrl(version)` → `${cdnBase}/binaries/${version}/manifest.json`,
asset keys seen in-binary: `native/linux-x64/…`, `web/linux-x64/dist-web/assets/…`).

**UNKNOWN:** the byte size and internal layout of a real staged artifact — not observable
because no update is pending, and this lane must not trigger one (that would write to
`~/.kimi-code`, outside the read-only boundary). The redaction-safe read of a future artifact
is simply `ls -la ~/.kimi-code/updates/` (which files exist) — the artifact is not a secret
surface.

## `~/.kimi-code/server/` — the local web/RC runtime surface

**OBSERVATION:** `server/` (mode 755) holds `~/.kimi-code/server/rc.json` (261 B, 644) and `instances/`
(755) with one `*.json` per live server. `~/.kimi-code/server/rc.json` keys measured (values **not** reported —
it carries `nonce`(16) and `device_id`(36)): `device_id, local_origin, nonce, pid,
started_at, url`. Each `instances/<ULID>.json` (166 B, 644) carries
`server_id, pid, host, port, started_at, heartbeat_at, host_version` (e.g. `port:58627`, a
`heartbeat_at` 13 minutes after `started_at`). **INFERENCE:** `~/.kimi-code/server/rc.json` is the Remote-Control
handshake record (`nonce` = single-use pairing secret, `local_origin` = the bound
`http://host:port`), and `instances/` is a heartbeat registry of running `kimi web`/`kimi rc`
servers; the ULID filename is the server id. This matches the shipped `kimi rc --help` which
documents `--port` default `58627`, the bearer token, and `--allowed-host` DNS-rebinding
check (`bin/kimi @sha256:66f47536… «Run the local Kimi server and open the web UI through
Remote Control.»`). `rc-qrcode.png` (§below) is the pairing QR for this same surface.

## `~/.kimi-code/server.token` — shape-only; the RC bearer token

**Shape-only by declaration — never opened.** Regular file, mode **600**, 43 B; a bearer
token whose contents are NOT read. Kind/mode/size/mtime are censused in
§"Shape-only census — the declaration"; the in-binary doc-comment reading of it is in that
same section.

## `~/.kimi-code/device_id` — shape-only; the 36 B UUID text

**Shape-only by declaration — never opened.** Regular file, mode **600**, 36 B; 36 = UUID
text length, value NOT printed. Kind/mode/size/mtime are censused in §"Shape-only census —
the declaration".

## `~/.kimi-code/region` — shape-only; the profile selector

**Shape-only by declaration — never opened.** Regular file, mode 644, 7 B; value `global`,
a non-secret region marker. `region` (`global`) selects the profile row in §"Update
mechanism". Kind/mode/size/mtime are censused in §"Shape-only census — the declaration".

## `~/.kimi-code/credentials/` — shape-only; the credential blob

**Shape-only by declaration — never opened.** Directory, mode **700**, holding
`credentials/kimi-code-env-0e4f99c69cc27850.json` (regular file, mode **600**, 1556 B) — a
credential blob whose contents are NOT read. Kind/mode/size/mtime are censused in
§"Shape-only census — the declaration".

## `~/.kimi-code/oauth/` — shape-only; the presence marker

**Shape-only by declaration — never opened.** Directory, mode 755, holding
`oauth/kimi-code-env-0e4f99c69cc27850` (regular file, 644, **0 B**) — an empty marker;
contents (none) NOT read. Kind/mode/size/mtime are censused in §"Shape-only census — the
declaration".

## Shape-only census — the declaration

**No secret file below was opened.** This table is the declaration.

| Path | Kind | Mode | Size | mtime | Notes (shape only) |
|---|---|---|---|---|---|
| `server.token` | regular file | **600** | 43 B | 2026-10-13 16:03:07 | bearer token; contents NOT read |
| `credentials/` | dir | **700** | — | 2026-10-13 17:26 | contains `kimi-code-env-0e4f99c69cc27850.json` (mode 600, 1556 B); contents NOT read |
| `credentials/kimi-code-env-0e4f99c69cc27850.json` | regular file | **600** | 1556 B | 2026-10-13 17:26 | credential blob; NOT read |
| `oauth/` | dir | 755 | — | 2026-10-13 17:26 | contains `kimi-code-env-0e4f99c69cc27850` (mode 644, **0 B**); NOT read |
| `oauth/kimi-code-env-0e4f99c69cc27850` | regular file | 644 | 0 B | 2026-10-03 18:02 | empty marker; contents (none) NOT read |
| `device_id` | regular file | **600** | 36 B | 2026-10-03 17:53:30 | 36 = UUID text length; value NOT printed |
| `region` | regular file | 644 | 7 B | 2026-10-03 17:52:50 | value `global` (non-secret marker) |

**What the binary says these are — OBSERVATION of in-binary doc comments** (not of the
files): `«server.token` (0600) on first boot and reuses it across restarts (ROADMAP M5.1);
CLI commands that hit a gated REST route read it back here and send it as `Authorization:
Bearer <token>`.»`; and the shared credential filename prefix `«kimi-code-env-»` with the
`.json` credential under `credentials/` and the marker under `oauth/`. **INFERENCE:** the
`kimi-code-env-<hash>` basename is a profile key (the same 16-hex `0e4f99c69cc27850` names
both the credentials blob and the oauth marker), and `0 B` in `oauth/` means that file is a
presence/state marker, not a payload. The `0600` mode on `credentials/`-blob and `server.token`
vs `644` on the oauth marker is a consistent secret-classification split. `region`
(`global`) selects the profile row in §"Update mechanism".

**UNKNOWN:** token validity, credential schema, expiry — none is inferable without reading the
files, which this lane did not do. Full credential/minting anatomy belongs to the kagi lane,
not here.

## `~/.kimi-code/rc-qrcode.png`

**`rc-qrcode.png`** (2,323 B, 644, mtime 2026-10-13 16:03:10 — same minute as
`server.token`): **OBSERVATION** the header is `\x89PNG\r\n\x1a\n` + `IHDR` with width/height
`0x000000c4 = 196 × 196`, colour type 6 (RGBA). **INFERENCE:** a 196×196 PNG written at
server-start time is the **Remote-Control pairing QR** — it encodes the `~/.kimi-code/server/rc.json`
`local_origin`/`nonce` handshake so a phone can pair; its mtime tracks `server.token`'s, i.e.
both are produced by the same first `kimi rc`/`kimi web` boot. It is not a secret surface
(mode 644, and a QR to a loopback origin). **UNKNOWN:** the encoded payload (reading it would
require decoding a pairing secret — deliberately not done).

## `~/.kimi-code/session_index.jsonl`

**`~/.kimi-code/session_index.jsonl`** (7,588 B, **600**, 37 lines, mtime 2026-10-13 17:05:07):
**OBSERVATION** every line is a JSON object with the identical three-key shape
`sessionDir, sessionId, workDir` (verified across the first 5 lines; 37 records total) —
`{"sessionId": «str», "sessionDir": «str», "workDir": «str»}` (values are paths/IDs, not
printed here). **INFERENCE:** it is the session **directory index** — the lookup the CLI's
`-c/--continue` and `-S/--session` resume feature walks to map a working dir to its most
recent session; mode `600` because `sessionDir` reveals filesystem paths. It is an
*index*, not the transcripts themselves (those live under `sessions/`). **UNKNOWN:** whether
entries are pruned — no retention rule is visible from shape alone.

## The update mechanism — evidence, from files only

**Question:** how does the CLI update itself, evidenced by files? **Answer (all measured):**

1. **Poll.** On startup and in the background the CLI reads a CDN manifest into
   `~/.kimi-code/updates/latest.json`. **OBSERVATION** via `~/.kimi-code/updates/latest.json` (`"source":"cdn"`) and the
   `rollout.log` `phase` values `startup-cache` / `background-refresh`; **OBSERVATION** in-binary:
   `«function getUpdateStateFile() { return (0, node_path.join)(getDataDir(),
   KIMI_CODE_UPDATE_DIR_NAME, KIMI_CODE_UPDATE_STATE_FILE_NAME); }»` → `<dataDir>/updates/latest.json`,
   and the doc string
   `«CDN \`latest.json\` wire format. Deliberately NOT \`.strict()\` — unknown fields are
   ignored so future manifest additions…»`.
2. **Decide.** A pure decision function gates whether the new version applies now.
   **OBSERVATION** in-binary verbs: `«decidePassiveUpdateTarget(currentVersion, cache?.latest
   ?? null, cachedManifest, deviceId, new Date(), bypassRollout)»`, `rolloutBucket(deviceId,
   manifest.version)`, `rolloutDelayForBucket(manifest.rollout, bucket)`, `isRolloutEligible
   (manifest, deviceId, now)`, `MAX_ROLLOUT_DELAY_SECONDS = 86400`. **INFERENCE:** the
   `rollout.log` `bucket`/`delaySeconds`/`eligibleAt` fields are this staged-rollout math
   materialised — the `30% / 30% +12h / 40% +24h` manifest is enforced per device by hashing
   `device_id` into a bucket, so not all clients update at once.
3. **Classify the install source.** **OBSERVATION** in-binary
   `«InstallSourceSchema = _enum(["npm-global","pnpm-global","yarn-global","bun-global",
   "homebrew","native","unsupported"])»` and `«function classifyInstallSource(packageRoot,
   globalPrefix, platform)»` / `«detectInstallSource(deps)»` / `«resolveInstallSource(source)»`.
   **INFERENCE:** how the CLI updates *depends on how it was installed* — a manager-owned
   install (npm/pnpm/yarn/bun/homebrew) is updated by the manager's own command, and only
   `native` is self-managed byte-replacement. `rollout.log`'s `source` field is absent in the
   88 observed lines (`target:null`), so this host has never reached step 3.
4. **Fetch, verify, stage (native path).** **OBSERVATION** in-binary:
   `«downloadAndHash(url, partPath, expectedSha256, fetchImpl, onProgress, idleTimeoutMs =
   DOWNLOAD_IDLE_TIMEOUT_MS)»`, `«decompressAndHash(zstPath, destPath, expectedSha256)»`,
   `«verifyArchiveChecksum(archivePath, archiveName, expectedSha256)»`, the error string
   `«checksum mismatch»`, and `«stageNativeUpdate(options) { … arch = options.arch ??
   process.arch; … exePath: process.execPath …}»`. **INFERENCE:** the payload is a zstd
   archive fetched over HTTP with a **pinned SHA-256** verified before use — integrity is
   non-optional, matching the same "integrity bar" the code cites for fd
   (`«Adoption applies the same integrity bar as stageNativeUpdate's»`). `partPath` implies a
   `.part` temp file renamed on completion.
5. **Publish by atomic swap, then re-exec.** **OBSERVATION** in-binary:
   `«const UPDATE_INSTALL_LOCK_STALE_MS = 1800 * 1e3»` (30 min stale lock),
   `«KIMI_CODE_UPDATE_REEXEC_ENV»`, `«if (result.status === "already-staged") out.write(\`Kimi
   Code ${version} is already downloaded; it applies on the next start.\`)»`, and the staging
   comment `«a concurrent startup swap may be claiming … add(), swap everything in with
   commit(), or discard with abort()»`. **INFERENCE:** the new binary is downloaded to a
   `.staging/` area next to the live `bin/kimi`, then **swapped in atomically under
   `~/.kimi-code/updates/install.lock`** (the lock serialises concurrent starters; stale after 30 min) and
   the process **re-execs** via `KIMI_CODE_UPDATE_REEXEC_ENV` — the new bytes "apply on the
   next start", never mid-run. This is the same swap-not-edit posture the repo's own
   `local-ship.md` note preaches for publish.
6. **Host profile.** **OBSERVATION** `region` file = `global`, and in-binary
   `«KIMI_REGION_PROFILES = { "mainland-cn": { … cdnBase: "https://code.kimi.com/kimi-code", …
   }, global: { oauthHost: "https://auth.kimi.ai", baseUrl: "https://api.kimi.ai/coding/v1",
   cdnBase: "https://code.kimi.ai/kimi-code", siteBase: "https://www.kimi.ai" … } }»`, with
   `«function kimiCodeCdnBase() { return currentKimiProfile().cdnBase; }»`. So this host's update
   base is `https://code.kimi.ai/kimi-code` and the per-release manifest is
   `«nativeManifestUrl(version) { return \`${kimiCodeCdnBinariesBase()}/${version}/manifest.json\`; }»`
   where `«kimiCodeCdnBinariesBase() { return \`${kimiCodeCdnBase()}/binaries\`; }»`.

**End-to-end INFERENCE (the answer):** the CLI self-updates by *polling a per-region CDN
manifest into `~/.kimi-code/updates/latest.json`, gating the new version behind a device-bucketed rollout
schedule, then — only for a `native` install — downloading a zstd per-platform asset to
`updates/.staging/`, verifying its pinned SHA-256, atomically swapping it under
`~/.kimi-code/updates/install.lock`, and re-execing on next start.* The files that prove each hop exist as
constants and doc comments in the hash-pinned binary, and the `updates/` state proves **zero**
updates have been staged on this host.

## Blocker / residual rows

| Surface | Status | Why |
|---|---|---|
| staged update artifact bytes | **UNKNOWN** | none pending (`target:null`); staging one would mutate `~/.kimi-code` — read-only boundary |
| `kimi` symbol table line anchors | replaced by hash+symbol | 190 MB ELF has no source line numbers; anchors are `sha256 + verbatim substring` |
| credential/token internals | **out of scope** | contents deliberately unread; route to kagi |
| `~/.kimi-code/session_index.jsonl` retention | **UNKNOWN** | no prune rule visible from shape |

## Cross-domain findings to route (report, never absorb)

- **Endpoints → kama.** Update/CDN base per region (`mainland-cn`
  `https://code.kimi.com/kimi-code`, `global` `https://code.kimi.ai/kimi-code`), release
  manifest `…/binaries/<version>/manifest.json`, fd download `…/fd/<asset>`, `latest` URL,
  `https://code.kimi.ai/kimi-code/install.sh`, plugin marketplace, changelog
  `https://moonshotai.github.io/kimi-code/en/release-notes/changelog.html`, telemetry
  `https://telemetry-logs.kimi.com/v1/event`, site `https://www.kimi.ai`, and the
  `https://cdn.kimi.com/` host string. Not this province's to own.
- **Credentials → kagi.** The shape-only census above is the handoff: `server.token` (600, 43 B),
  `credentials/kimi-code-env-<hash>.json` (600, 1556 B), `oauth/kimi-code-env-<hash>` (644, 0 B),
  `device_id` (600, 36 B). Contents unread by design; kagi owns the minting/expiry anatomy.
- **Model quality → kengaku.** None — no model-behaviour evidence was produced on this lane.
## Errata (round-19 audit A3, 2026-10-13, append-only)

- **"all 88 rollout rows carry `latest=2.1.1`" → 87/88.** Line 1 is the
  pre-CDN-cache `no-latest` row with `latest:null` (the note's own
  classification already counted it 87+1; the prose overgeneralized).
- **Shape-census mtimes for `credentials/` and `oauth/` have drifted**
  (17:26 → 18:13 at audit time) — sizes/modes confirmed unchanged; mtimes
  are snapshot values like the config-plane live row.
