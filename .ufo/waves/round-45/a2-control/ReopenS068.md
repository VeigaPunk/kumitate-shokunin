RESULT ReopenS068 rev=a2e5b54c verdict=confirmed quotes_found=1/1

Re-derived inherited candidate SOURCES row S068 (oh-my-pi v18.12.6 task-isolation source) from attempt-1 scratch /fast/scratch/hyaku/kumitate-r45/a2/inherited-rows.md line 9, against seat report build/SrcOmpIsolation.md. Source re-opened by ordinary means at the pinned commit.

Fetch evidence (all under `systemd-run --user --scope --quiet -p MemoryMax=4G -p TasksMax=128 timeout -s KILL 900`):
- `env -u GIT_DIR -u GIT_WORK_TREE -u GIT_INDEX_FILE git clone -q --depth 1 --branch v18.12.6 https://github.com/can1357/oh-my-pi` → stdout advisory `Note: switching to '45c35e40c46166dc726ccc52f5d27f40f2449f99'.`; `git -C oh-my-pi rev-parse HEAD` → `45c35e40c46166dc726ccc52f5d27f40f2449f99`. Tag v18.12.6 resolves to the row's pinned commit.
- `omp --version` → `omp/18.12.6` (host version matches row scope).
- `curl -sS -L -w "HTTP %{http_code} final=%{url_effective}"` for each raw file at 45c35e40: every response HTTP 200, final URL = request URL (no redirects). Body sha256: settings.ts `47e04d3878de54e31ae3b73edcb628a0622a37a5dc49bb102d6567d2dfc777ac`; worktree.ts `1adba7ba4dfd5ff85ad5d9fcec862acd05871735a6c8faa302d10999af56761f`; isolation-runner.ts `1e613ff94e9df87bc4d7b94e8154b48a01ccfdbfe74ee799720279d1f5a9f0e6`; lib.rs `6f7b1b97f884c06fadb7c10e309f84d470eb1414ec8c14897688ef984beed438`; rcopy.rs `8d3a334b717d9ce38d6d92f4724f15243b736ca86e591e4510190611e8208296`.
- Each raw fetch `cmp`-equal to the cloned file at the pinned commit (version the text belongs to: oh-my-pi v18.12.6 = 45c35e40, immutable).
- Tree URL `https://github.com/can1357/oh-my-pi/tree/45c35e40...` → HTTP 200, no redirect.

Check 1 — locator exists and says what teaches/gloss claims: CONFIRMED.
- settings.ts:26-36: cfgTaskIsolationEnabled id `task.isolation.enabled`, `default: false,` (:30); ui description (:35) `tasks without it run in the shared checkout`.
- settings.ts:161-177: cfgTaskIsolationMerge values `["patch", "branch"]`, `default: "patch"` (:165-166).
- lib.rs:139-145: LINUX_AUTO_ORDER = Btrfs, Zfs, LinuxReflink, Overlayfs, Rcopy (:140-144).
- lib.rs:397-408: resolve() doc `walk auto_order, skipping preferred if present`; Rcopy final automatic candidate (:402-404).
- rcopy.rs:3-6: `git worktree add --detach <merged> HEAD` when lower is a git working tree; recursive copy otherwise.
- worktree.ts:648-716: ensureIsolation candidate loop with detached git metadata (vcs.detachGitDir) and cleanupIsolation removing baseDir (:700-716).
- isolation-runner.ts:397-600: cleanupHandle skips cleanupIsolation when retainWorkspace true (:400,:406,:588); retainWorkspace set on capture/patch/persist failure paths (:415,:515,:547,:569) — gloss "failed captures retain the workspace" holds.
- isolation-runner.ts:625-631: mergeIsolatedChanges doc: `patch apply (patch mode) or cherry-pick + cleanup (branch mode)` (:626-627).

Check 2 — verbatim quotes the draft attributes to S068: quotes_found=1/1.
- Draft `## Mechanisms` M4 (:74-75): «a private, frozen repo» attributed to (task/worktree.ts:672-680, S068). Found verbatim in worktree.ts comments at :677-678 — `Detaching gives each isolation a private,` / `frozen repo that still borrows the source object DB via alternates.` — inside the cited range. Word count: `printf '%s' "a private, frozen repo" | wc -w` → 4.
- `grep S068` over the draft → lines 1, 29, 75, 126; only line 75 carries a guillemet quote, so 1/1.

Check 3 — pinned sha256: CONFIRMED. settings.ts 47e04d38... and lib.rs 6f7b1b97... both equal my fresh fetch. Pinned immutable commit, so no live-page mismatch caveat.

Check 4 — kind/tier: CONFIRMED. kind=code, tier=A per SOURCES-CONTRACT-v1 (A = primary/authoritative for scope: official source code at pinned release tag v18.12.6 = 45c35e40; not community). status=mined; used-by names corpus/knowledge/agent-isolation-substrates.md and corpus/lessons/round-45.md.

Check 5 — N/A: S068 is not a rejected row (status mined); no rejection reason to hold.

Inherited-only, not re-verifiable by this seat: `host ~/.omp/agent/config.yml has no isolation key`. The binding contract forbids reading file contents under ~/.omp/agent except RULES.md; I stat'd config.yml only (exists, size=7350, mode=600, mtime=2026-10-23 02:27:51 -0300). The grep is inherited evidence; it is auxiliary to the row (teaches is source-grounded) and does not change the verdict.

Corrected row text: none needed — row S068 as inherited is accurate.

No tools installed or updated. No processes left (pgrep -af 'a2-ReopenS068' → none). Scratch kept: raw/ five fetched files (132K); the 302M clone removed.
