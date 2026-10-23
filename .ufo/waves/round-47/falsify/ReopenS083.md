RESULT ReopenS083 rev=269dadb6 verdict=DEFECT anchor-locators-wrong; supersede target right, correction not supported by bytes

Non-author re-open of S083 (new row) and its Gate record in lessons/round-47.md, per item. Measured at C1 commit 269dadb6a56744531bd1201e5944185e96ff6a4c; source pinned at commit b5e28fd6beac752a2cdcc0ff2f5fdf40e6494fbb.

## Evidence (fetched bytes)

Command: `curl -fsSL 'https://raw.githubusercontent.com/MoonshotAI/kimi-code/b5e28fd6beac752a2cdcc0ff2f5fdf40e6494fbb/packages/agent-core-v2/src/persistence/backends/node-fs/sessionLockService.ts' -o sessionLockService.ts && sha256sum sessionLockService.ts`
Output: `acbcdd3811903885c2edfeb5e67cf5258921768b814c751c511e4cf7c867ad08  sessionLockService.ts` — matches S083's body sha256 cell and SupersedeS041's fetched hash exactly (same bytes).

Located lines (awk NR print; grep -n agrees):
- L55:  `this.lockDir = join(bootstrap.homeDir, 'locks', 'sessions');`
- L61:  `const token = `${process.pid}:${randomUUID()}`;`
- L196: `fs.mkdirSync(this.lockDir, { recursive: true, mode: 0o700 });`
- L201: `return join(this.lockDir, `${sessionId}.lock`);`
- L202: `}`
- L207: `ISessionLockService,`

Quote "this.lockDir = join(bootstrap.homeDir, 'locks', 'sessions');" is verbatim in the file, but at L55, not L61. `printf '%s' "…" | wc -w` = 5 (≤25 OK). Teaches continuation word count = 25 (≤200 chars: 193, per draft).

Supporting byte checks:
- `packages/agent-core-v2/src/app/bootstrap/bootstrap.ts` (pinned commit; sha256 b1f7938db6e65d7d19201657a202e6dd02898e14affe2180dd99da18b6bee173) L173: `return homeDir ?? env['KIMI_CODE_HOME'] ?? join(osHomeDir, '.kimi-code');` → default homeDir = ~/.kimi-code.
- `bootstrapService.ts` L41 store `options.homeDir`; L44-49 derive sessions/blobs/store/cache/logs dirs under it.
- ensureLockDir() invoked from claim flow (sessionLockService.ts L89), so the CLI itself creates `locks/` as parent of `locks/sessions/` (mkdirSync recursive) — teaches clause "the CLI itself creates locks/ as the parent of its per-session lock directory" is byte-supported.
- Tag pin: `git ls-remote --tags https://github.com/MoonshotAI/kimi-code.git 'refs/tags/@moonshot-ai/kimi-code@2.3.0'` → `e65b17b733632ee74924816717c8fa1e0b831ba9 refs/tags/@moonshot-ai/kimi-code@2.3.0` and peel `b5e28fd6beac752a2cdcc0ff2f5fdf40e6494fbb refs/tags/@moonshot-ai/kimi-code@2.3.0^{}` → the pinned commit is the 2.3.0 release commit.

## Findings (severity order)

1. DEFECT (anchor): S083's anchor cell "file lines 61, 202 and 207 at commit b5e28fd6…" does not match the pinned bytes. L61 is a token-generation line, L202 a close brace, L207 the `ISessionLockService` symbol in registerScopedService. The true locators for the three taught clauses are 55 (lockDir path), 196 (mkdirSync mode 0o700), 201 (per-session `${sessionId}.lock`).
2. DEFECT (draft report): build/SupersedeS041.md claims "line 55 is blank, line 196 is `return;`, line 201 is `if (this.lockDirReady) return;`" and that the accurate locators are 61/202/207. Every one of those claims is contradicted by the fetched bytes (identical sha256 acbcdd381…). The draft mis-reported the very file it verified; S083 inherited its wrong locators.
3. DEFECT (Gate record): lessons/round-47.md § Gate S083 row cites the quote at `:61` (actual L55) and its decision "supersedes S041 with corrected locators" is not supported: the original/restored S041 anchor (55, 196) and the round-46 correction (55, 196, 201) were already the correct lines; S083's 61/202/207 make the anchor worse, not better.
4. HOLDS (target naming): "supersedes S041 —" names the right target — identical source, kind=code, tier A, scope, and S041's immutable cells are restored byte-identical to 2b2bf7bb (diff `2b2bf7bb:corpus/SOURCES.md` vs `269dadb6:corpus/SOURCES.md` S041 rows: IDENTICAL).
5. HOLDS (rest): source URL and body sha256 exact; quote verbatim and 5 words; every teaches clause supported by bytes at the true lines; tier A / kind code / scope consistent; status=mined, opened 2026-10-23, recheck=on-release; used-by files exist at rev.

Verdict: the correction is NOT supported by the bytes — the anchor locators in S083 (and in its drafting report and Gate record) are factually wrong and must be corrected to 55, 196, 201 before this row can stand. S083's teaches content itself is otherwise byte-true.

No tools installed/updated. No lane files touched other than this report.
