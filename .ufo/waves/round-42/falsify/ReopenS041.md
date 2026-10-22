RESULT ReopenS041 rev=- verdict=agree checks=4/4

# S041 re-open — all four checks reproduce

Seat: leaf scout, round-42 falsify wave 2. Nothing written outside this report;
scratch only under `/fast/scratch/hyaku/kumitate-r42/falsify/ReopenS041/`. No clone
needed (read-only source/host checks), no gate run, no tool installed or upgraded.

Subject row: `corpus/SOURCES.md:54` (S041), Kimi Code 2.3.0
`packages/agent-core-v2/src/persistence/backends/node-fs/sessionLockService.ts`.

## Check 1 — line 55 literal (PASS)

Source URL opened by ordinary fetch, at the commit the row names:

    curl -sS -o sesslock.ts -w 'http=%{http_code} size=%{size_download}\n' \
      https://raw.githubusercontent.com/MoonshotAI/kimi-code/b5e28fd6beac752a2cdcc0ff2f5fdf40e6494fbb/packages/agent-core-v2/src/persistence/backends/node-fs/sessionLockService.ts
    -> http=200 size=6455
    sha256sum sesslock.ts -> acbcdd3811903885c2edfeb5e67cf5258921768b814c751c511e4cf7c867ad08

Digest equals the one recorded in `.ufo/waves/round-42/build/ScoutKimiLocksSource.md`, so
this seat re-derived the same bytes the row's digest claim rests on.

    sed -n '55p' sesslock.ts
    ->     this.lockDir = join(bootstrap.homeDir, 'locks', 'sessions');

Exact match with the row's quoted literal (9 words, quotes included).

## Check 2 — line 196 literal (PASS)

    sed -n '196p' sesslock.ts
    ->     fs.mkdirSync(this.lockDir, { recursive: true, mode: 0o700 });

Inside `private ensureLockDir()` (lines 194-198), so the row's "ensureLockDir runs
mkdirSync recursive mode 0o700" is the code as written, and `locks/` is the recursive
parent of `locks/sessions/`. Adjacent `lockPath()` (lines 200-202) returns
`join(this.lockDir, `${sessionId}.lock`)`, matching the row's per-session lock-file scope.

## Check 3 — URL commit is the tag's commit (PASS)

    curl -sS .../git/ref/tags/%40moonshot-ai%2Fkimi-code%402.3.0 | jq -c '{ref,object}'
    -> {"ref":"refs/tags/@moonshot-ai/kimi-code@2.3.0",
        "object":{"sha":"e65b17b733632ee74924816717c8fa1e0b831ba9","type":"tag",...}}
    curl -sS .../git/tags/e65b17b7...
    -> {"tag":"@moonshot-ai/kimi-code@2.3.0",
        "object":{"sha":"b5e28fd6beac752a2cdcc0ff2f5fdf40e6494fbb","type":"commit"},
        "tagger":"2026-10-21T05:51:41Z"}

So the annotated tag dereferences to exactly the commit in the S041 URL. The same file
fetched through the tag ref is byte-identical (`cmp -s tag230.ts sesslock.ts` -> identical),
and its git blob sha1 `910db006471cbdcf48424e1afad0f3db4154749c` equals the contents-API
`.sha` at b5e28fd6 (size 6455), ruling out a raw-vs-tree mismatch.

Release date in the row ("release 2026-10-21") checks against the release object:

    .../releases/tags/%40moonshot-ai%2Fkimi-code%402.3.0
    -> {"tag_name":"@moonshot-ai/kimi-code@2.3.0","published_at":"2026-10-21T05:51:43Z",
        "prerelease":false,"draft":false}

## Check 4 — file absent at the 2.2.0 tag (PASS)

    .../git/ref/tags/%40moonshot-ai%2Fkimi-code%402.2.0 -> tag object f9c6b3cf..., commit 472192c34c1efad89a369870eff0da0b708ce9bb
    raw .../@moonshot-ai/kimi-code@2.2.0/.../node-fs/sessionLockService.ts -> http=404
    raw .../472192c3.../.../node-fs/sessionLockService.ts                        -> http=404
    control raw .../@moonshot-ai/kimi-code@2.2.0/.../agent-core-v2/package.json  -> http=200
    raw .../@moonshot-ai/kimi-code@2.2.0/.../interface/sessionLock.ts            -> http=404

The control proves the 2.2.0 ref path itself resolves, so the 404s are absence, not a bad
ref. Directory listing at the 2.2.0 commit confirms the whole module is gone:

    contents/.../persistence/backends/node-fs?ref=472192c3...
    -> ["appendLogStore.ts","atomicDocumentStore.ts","blobStoreService.ts",
        "fileStorageService.ts","projectLocalConfigService.ts"]

The recursive tree at 472192c3 has 23 paths matching /lock/i and none is a session lock
service (closest: `apps/kimi-code/src/cli/update/install-lock.ts`, `packages/minidb/src/lockfile.ts`),
and `docs/en/configuration/data-locations.md` at 472192c3 contains no `locks` line
(`grep -n locks` -> no match, exit 1). So the weaker inference in
`corpus/knowledge/kimi-session-state.md:423` ("the file is absent at the 2.2.0 tag, so the
directory is new with 2.3.0") is not contradicted: 2.2.0 has no other creator of that path.

## Check 5 — installed binary reads 2.3.0 (PASS, shape only)

    ~/.kimi-code/bin/kimi --version   -> 2.3.0   (exit=0)
    stat -c '%s %y' -> 192482496 2026-10-22 13:48:04.272887447 -0300
    sha256sum       -> cf323ca555ccb69c11147e0ef3f0e3a771f873a7d1aa329ae60271450b265e48

Size, mtime and digest equal the binary `.ufo/waves/round-42/build/ScoutKimiLocksSource.md`
recorded, so the version reading is the same artifact the row's byte-offset claim was taken
from. The claimed literal at byte 134688526 also reproduces:

    python3 -c "f=open('/home/vgpnk/.kimi-code/bin/kimi','rb'); f.seek(134688526); print(repr(f.read(80)))"
    -> b'this.lockDir = join$98(bootstrap.homeDir, "locks", "sessions");\n\t\t\tthis.hostname'

No credential, token or oauth file was opened; only `--version`, `stat`, `sha256sum` and a
byte read of the executable.

## Verdict

Agree. Every literal, the tag-to-commit pin, the 2.2.0 absence and the installed version
reproduce from primary sources; the S041 row is no wider than its evidence. Remaining
unknown: none for this item.
