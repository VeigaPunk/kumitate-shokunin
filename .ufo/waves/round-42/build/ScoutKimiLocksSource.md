RESULT ScoutKimiLocksSource rev=- verdict=found source=https://github.com/MoonshotAI/kimi-code/blob/b5e28fd6beac752a2cdcc0ff2f5fdf40e6494fbb/packages/agent-core-v2/src/persistence/backends/node-fs/sessionLockService.ts version=2.3.0

# C2 source: what creates `~/.kimi-code/locks/sessions`

Lane revision read (not measured by this seat): `b237e3f09c9559e130c7367bd2efa981c4ea516f`.
This seat is a leaf scout: no lane gate was run, no clone was made, no tool was installed or
updated, and the only file written is this report. Lane files were opened read-only.

## Answer (OBSERVED)

The directory is created by the installed Kimi Code CLI 2.3.0 itself, on the first session
that publishes a lock: `SessionLockService.ensureLockDir()` runs
`fs.mkdirSync(this.lockDir, { recursive: true, mode: 0o700 })` with
`this.lockDir = join(bootstrap.homeDir, 'locks', 'sessions')`, and `bootstrap.homeDir`
resolves to `~/.kimi-code` (or `$KIMI_CODE_HOME`). `locks/` is the parent the recursive
mkdir creates; `locks/sessions/` is its only child. Lock files are per-session
`<sessionId>.lock`, with transient `<sessionId>.lock.tmp-<pid>-<uuid>` and
`<sessionId>.lock.reclaim` siblings — so an empty `locks/sessions/` is the normal resting
state, not drift.

## Best source

- Path: `packages/agent-core-v2/src/persistence/backends/node-fs/sessionLockService.ts`
  in `MoonshotAI/kimi-code`, at commit `b5e28fd6beac752a2cdcc0ff2f5fdf40e6494fbb`
  (annotated tag object `e65b17b733632ee74924816717c8fa1e0b831ba9`, tag
  `@moonshot-ai/kimi-code@2.3.0`, release published 2026-10-21T05:51:43Z).
- URL opened: https://raw.githubusercontent.com/MoonshotAI/kimi-code/b5e28fd6beac752a2cdcc0ff2f5fdf40e6494fbb/packages/agent-core-v2/src/persistence/backends/node-fs/sessionLockService.ts
  (browser form: https://github.com/MoonshotAI/kimi-code/blob/b5e28fd6beac752a2cdcc0ff2f5fdf40e6494fbb/packages/agent-core-v2/src/persistence/backends/node-fs/sessionLockService.ts)
- Version: `@moonshot-ai/kimi-code@2.3.0`; file sha256 `acbcdd3811903885c2edfeb5e67cf5258921768b814c751c511e4cf7c867ad08`.
- Access date: 2026-10-22 (ordinary fetch, no bot challenge involved).
- Verbatim quote showing the path (line 55, 9 words):
  `this.lockDir = join(bootstrap.homeDir, 'locks', 'sessions');`
- Verbatim quote showing what creates it (line 196, 7 words):
  `fs.mkdirSync(this.lockDir, { recursive: true, mode: 0o700 });`
- Verbatim quote showing the purpose, official docs, same pinned commit,
  `docs/en/configuration/data-locations.md:45-46` (11 words):
  `├── locks/` / `│   └── sessions/           # Cross-process occupancy locks while a client writes a session`

Purpose in one sentence: a cross-process occupancy lock so a second Kimi Code client cannot
write a session another client already owns; the code's refusal message is
`'This session is in use by another Kimi Code process. Stop the session in that process or exit it, then try again.'`
(`packages/agent-core-v2/src/persistence/interface/sessionLock.ts`, `sessionOccupiedError`).

## Second candidate (opened; weaker)

- `https://moonshotai.github.io/kimi-code/en/configuration/data-locations.html` (VitePress
  docs, opened 2026-10-22; bundle `llms-full.txt` 1,125,683 bytes, sha256 of the page's
  Markdown source `docs/en/configuration/data-locations.md` at the same pinned commit
  `6d50aeb5e923e4a17186c73096fae18625797fdb367aeba8fa8d4614d26a428f`).
- Weaker because it is generated documentation: it names the path and the purpose in words,
  but it does not define the creator, the mkdir mode, the `<sessionId>.lock` naming, or the
  version that introduced the directory. It is corroboration, not the defining source.

## Third candidate (opened and rejected)

- `https://raw.githubusercontent.com/MoonshotAI/kimi-code/main/.../node-fs/sessionLockService.ts`
  (moving `main`). It has drifted from the installed build: it adds a `KIMI_CODE_SESSION_LOCK`
  env switch, a `disabled` flag, `evict()`, and a `ps` zombie check. The installed 2.3.0
  binary contains none of those (`grep -ac 'KIMI_CODE_SESSION_LOCK'` → 0,
  `grep -ac 'taking over session lock'` → 0), so `main` is NOT the code that runs on this
  host. Pinned tag `@moonshot-ai/kimi-code@2.3.0` matches the installed bundle exactly.

## Evidence

Host state (all read-only):

- `~/.kimi-code/bin/kimi --version` → `2.3.0`; binary sha256
  `cf323ca555ccb69c11147e0ef3f0e3a771f873a7d1aa329ae60271450b265e48`, mtime
  `2026-10-22 13:48:04 -0300`, size 192482496.
- `~/.kimi-code/updates/install.json` → `{"lastSuccess":{"version":"2.3.0","installedAt":"2026-10-22T16:48:04.288Z","notifiedAt":"2026-10-22T16:53:20.727Z"}}`.
- `stat ~/.kimi-code/locks` → `Birth: 2026-10-22 13:53:33.966993951 -0300` (= 16:53:33Z, 13 s
  after the 2.3.0 launch notification), mode `0700`. `stat ~/.kimi-code/locks/sessions` →
  same birth, `Modify: 2026-10-22 14:03:45.796085891 -0300` (a lock file created and removed).
- `find ~/.kimi-code/locks -maxdepth 2 -printf '%y %TT %m %p\n'` → exactly two entries:
  `d 13:53:33 700 /home/vgpnk/.kimi-code/locks`, `d 14:03:45 700 /home/vgpnk/.kimi-code/locks/sessions`.
  `find ~/.kimi-code/locks -mindepth 1 | wc -l` → 1 (i.e. only `sessions`, currently empty).
- `~/.kimi-code/logs/kimi-code.log` has no lock lines (`grep -in lock` → no output); the
  directory is created silently.

Installed binary (embedded bundle, read with `strings`/`grep -a` — ordinary means):

- Region marker in the binary:
  `//#region ../../packages/agent-core-v2/src/persistence/backends/node-fs/sessionLockService.ts`
- Byte offset 134688526 of `this.lockDir = join`; the surrounding pretty-printed bundle line is
  `this.lockDir = join$98(bootstrap.homeDir, "locks", "sessions");` and `ensureLockDir` ends in
  `node_fs.default.mkdirSync(this.lockDir, { recursive: true, mode: 448 })` (448 = 0o700).
- `grep -ac '"locks"' ~/.kimi-code/bin/kimi` → 1: this is the only `locks` path in the binary.
- `homeDir` resolution in the binary:
  `return homeDir ?? env["KIMI_CODE_HOME"] ?? join$98(osHomeDir, ".kimi-code");`
- `NPM_PACKAGE_NAME = "@moonshot-ai/kimi-code";`, `FEEDBACK_ISSUE_URL = "https://github.com/MoonshotAI/kimi-code/issues"`.

Version boundary:

- `curl -s -o /dev/null -w '%{http_code}' .../%40moonshot-ai/kimi-code%402.2.0/packages/agent-core-v2/package.json` → `200` (control: the ref is valid).
- Same probe for `.../node-fs/sessionLockService.ts` and `.../interface/sessionLock.ts` at 2.2.0 → `404` `404`. The lock service, and with it `locks/sessions`, is new in 2.3.0.
- Changelog 2.3.0 (`llms-full.txt:1559,1564`): `* When the same session is open in multiple clients, sending a message from another client now shows an occupancy prompt, with options to retry or cancel.`

## Handoff for the C2 declaration

- Exact member to declare: root child `locks` (a directory, mode `0700`), created by
  `SessionLockService.ensureLockDir` on the first published session lock. It belongs in the
  presence-only family next to K3 (`sessions/`, `session_index.jsonl`, …); children are
  runtime-transient (`<sessionId>.lock`, `*.tmp-<pid>-<uuid>`, `*.reclaim`) and an empty
  `sessions/` inside it is normal, so it should be pinned by presence + kind + mode floor,
  never by child enumeration or content.
- `scripts/kimi-census.mjs` currently declares no `locks` anywhere (`grep -n locks` → no
  match), which is why the root-enumeration arm reports `UNLISTED locks` (census :329-367,
  `declaredRootNames()` at :224); `K_members`/`K_sections` gain one each once the member row
  and its knowledge heading land.
- Suggested SOURCES.md row (tier A, source code at a pinned release):
  id next free; source `MoonshotAI/kimi-code packages/agent-core-v2/src/persistence/backends/node-fs/sessionLockService.ts — https://github.com/MoonshotAI/kimi-code/blob/b5e28fd6beac752a2cdcc0ff2f5fdf40e6494fbb/packages/agent-core-v2/src/persistence/backends/node-fs/sessionLockService.ts`;
  kind `code`; tier A; scope `Kimi Code 2.3.0 session lock service: creation and layout of ~/.kimi-code/locks/sessions`;
  anchor `sessionLockService.ts:55,196 (lockDir join; mkdirSync 0o700); tag @moonshot-ai/kimi-code@2.3.0 commit b5e28fd6 (2026-10-21)`;
  teaches `Kimi Code CLI 2.3.0 creates <homeDir>/locks/sessions (mode 0700) on first session-lock publish; per-session <sessionId>.lock with transient .tmp-*/.reclaim siblings; absent at 2.2.0`;
  status `mined`; opened `2026-10-22`; recheck `on-release`; used-by the C2 knowledge section.

## Confidence and remaining unknowns

- Confidence: high for "the installed 2.3.0 CLI creates `~/.kimi-code/locks/sessions` via
  `SessionLockService.ensureLockDir`". Three independent witnesses agree: pinned upstream
  source at the release tag, the same code inside the installed binary, and the official
  docs layout page; the install/launch timeline (16:48:04Z install, 16:53:20Z notify,
  16:53:33Z directory birth) matches.
- INFERENCE, not observed: the installed binary is byte-identical to the published
  `kimi-code-linux-x64` asset (its tarball digest was not compared; version string, embedded
  package name, and code shape were).
- Unresolved: whether `locks/` also gains other children in later releases (the `main`
  variant keeps the same single `lockDir`); no 2.3.1+ tag was inspected.
