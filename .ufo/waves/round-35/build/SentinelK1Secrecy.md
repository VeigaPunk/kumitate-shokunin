SENTINEL_K1 risks=2 content_reads_found=2

## Scope and count basis

Read-only static review of `scripts/kimi-census.mjs`, `scripts/proxy-check.mjs`, the K1 pre-registration, `corpus/knowledge/kimi-mcp-plane.md`, and shape metadata only for the listed secret paths. No test, gate, build, or runtime was invoked. `content_reads_found=2` counts two **conditional, caller-directed proxy paths** that can be redirected/aliased to a K member; the normal K measurement paths themselves read/hash/print/log zero member-content bytes. The distinction matters because `--scorecard` and `--self` are caller-selected.

## Findings

### R1 — MEDIUM: nested K paths can traverse an ancestor symlink outside the selected root

**Exploit path:** replace a nested parent such as `~/.kimi-code/plugins` (or `agents`, `logs`, `bin`) with a symlink to an external directory containing the expected child. Both K walkers `lstat` the joined child path; `lstat` does not follow the final component but the OS follows symlinks in intermediate components. Census also skips child enumeration when `plugins` itself is not an actual directory, so the member probes can still accept outside target metadata without a corresponding parent-shape failure. Proxy additionally validates `--kimi-root` with following `statSync`, so a symlinked root is accepted.

**Evidence:** `scripts/kimi-census.mjs:186-200,254-268,327-343`; nested K2 identities are `scripts/kimi-census.mjs:111-112`, and `lstatKind(abs) === 'dir'` skips the symlinked parent at `:331-334`. `scripts/proxy-check.mjs:351-352,448-465,620-643`; `kMembers` joins each member path then `lstatKind`s it at `:630-643`, while `statKind` follows symlinks and root validation uses it at `:1002-1008`.

**Impact:** an outside file/directory can supply metadata (and counted child names for a counted path) for a K slot, potentially fabricating a clean/covered census. No member file content is read by this path. The new root-level `mcp.json` leaf itself has no nested parent and its final symlink is not followed by `lstat`.

**Smallest remediation:** require the selected root and each parent component of every nested K path to be actual non-symlink directories before probing/listing the child; use descriptor-relative `openat`/`O_NOFOLLOW` traversal if resistance to concurrent path replacement is required. Make proxy root validation no-follow as census already does.

### R2 — LOW: generic proxy readers can be pointed/aliased at a K member

**Exploit path:** explicitly pass a secret K member as `--scorecard`; `runCheck` calls `readText(opts.scorecard)` (`readFileSync`). Separately, supply a `--self` tree whose pinned `scripts/<name>.mjs` entry is a symlink to a K member; `comparePins` calls `sha256File` (`readFileSync`) on that path. This is not the normal K-member route and requires caller-controlled paths/tree. `parseStanza` also includes a malformed raw scorecard line in its diagnostic (`scripts/proxy-check.mjs:803-804`), which is sent through fail-closed stderr/stdout (`:987-989`); therefore arbitrary secret-bearing scorecard input can be logged in malformed-block cases. The hash path can emit the computed digest in JSON (`:852-870,1070-1096`).

**Evidence:** options admit arbitrary scorecard/self paths (`scripts/proxy-check.mjs:421-423,2333-2342`); generic read/hash primitives are `:444-445,473-474`; call sites are `:1010-1015,852-860`. K-only derivation is separate and uses `lstat`/`readdir` (`:620-643,1052-1055`).

**Impact:** accidental option/path aliasing can violate an absolute “never read/hash/log a member's contents” claim. No source evidence shows the standard invocation does this. `[INFERENCE]` Whether the live `mcp.json` content would trigger raw-line diagnostics was not inspected and is deliberately unknown.

**Smallest remediation:** before generic scorecard/pin reads, reject resolved targets inside `--kimi-root` and reject pin symlinks escaping `--self`; avoid echoing raw malformed scorecard lines. Alternatively, state explicitly that the secrecy guarantee applies to K measurement only, not caller-selected input files.

## Enforcement pattern required for K1 `mcp.json`

The pre-registration explicitly requires a shape-only K1 member (presence, kind, mode floor; never content-read): `SCORECARD.md:440-448`.

- Census: add `mcp.json` as K1 with the existing secret shape mechanism, not the ordinary file/content path: `secret: true` and a mode floor. `lstatKind`/`modeOf` use `lstatSync` (`scripts/kimi-census.mjs:186-200`); the secret branch requires a directory for directory members or a non-directory leaf for file members, checks `(mode & modeFloor) === modeFloor`, emits only shape metadata, and `continue`s without listing/opening (`:294-317`). Root names derive from `MEMBERS` (`:218-224`), so declaring it there also removes the root `UNLISTED` finding.
- Proxy: declare the K1 identity with `secret: true`; `kMembers` uses `lstatKind`, counts a non-directory leaf, and records only the path identity (`scripts/proxy-check.mjs:345-374,620-651`). The proxy's established K behavior does not check mode floors; keep the floor check in census rather than introducing content access.
- `[INFERENCE]` Reusing the exact `server.token` file pin means `kind: 'file', secret: true, modeFloor: 0o600`; the existing `secret` branch intentionally treats any non-directory inode (including symlink/FIFO) as a leaf. The observed `mcp.json` mode is 0644, which meets that bit floor. Do not add a hash, `readFile`, `readText`, `readdir`-inside-member, content-derived output, or pin for this file. Add mcp-specific mode-floor, FIFO, dangling-symlink, and output-canary assertions patterned on the census secrecy cases at `:643-679`.

Existing shape-only detail: `server.token` uses 0600; `credentials/` and `oauth/` use 0700, require directories, and are neither opened nor listed (`scripts/kimi-census.mjs:43-53,128-132,306-317`; proxy sets `secret:true` for all three at `scripts/proxy-check.mjs:366-370` and only lstat-counts them at `:640-643`). Census has FIFO and dangling-symlink no-follow checks plus a credentials-child canary (`scripts/kimi-census.mjs:649-679`).

## Knowledge-note disclosure check

`corpus/knowledge/kimi-mcp-plane.md:14-19,33-68,82-88` contains field names (`env`, `headers`, `bearerTokenEnvVar`), documentation-derived behavior, version facts, and the file's stat metadata. Its full 96-line content contains no reproduced credential/token/API-key value. The note explicitly records that the mcp content is unknown and never read (`:14-19,65-68`). I did not read the mcp file content.

## Commands/queries and observed output

- `stat -c '%n %F mode=%a size=%s uid=%u gid=%g' /home/vgpnk/.kimi-code/mcp.json /home/vgpnk/.kimi-code/server.token /home/vgpnk/.kimi-code/credentials /home/vgpnk/.kimi-code/oauth` → `mcp.json regular file mode=644 size=249`; `server.token regular file mode=600 size=43`; `credentials directory mode=700 size=70`; `oauth directory mode=755 size=60`. Metadata only; no file contents.
- `functions.grep` census pattern `readFile|readFileSync|createReadStream|openSync|readSync|createHash|digest|readdirSync|writeFileSync|process\.stdout|process\.stderr` → matches `lstatSync,readdirSync,...` imports (`:87-90`), `readdirSync` helpers/root walk (`:204-205,243-245`), fixture writes only, and shape/output rows (`:388-425`); no content-read/hash API.
- `functions.grep` proxy pattern `sha256File\(|readText\(|readFileSync\(|createHash\(` → `readFileSync` via `sha256File` (`:440-445`) and `readText` (`:473-475`); callsites `kSections` local corpus (`:695-701`), fixed script pins (`:852-860`), explicit scorecard (`:1010`), and self docs (`:1021-1026`); K member walk remains lstat/readdir only (`:620-643`).
- `functions.grep` note pattern `server\.token|credentials|oauth|mcp\.json|Bearer|token|secret|password|api[_-]?key` → note hits field names and claims at `:14-19,46-48,66-68`; complete read found no reproduced value.
- `functions.read` `SCORECARD.md:438-450` → pre-registration requires shape-only, server.token pattern, never content-read; `functions.read` `corpus/knowledge/kimi-mcp-plane.md:1-96` → note contains stat/docs/version facts only.
