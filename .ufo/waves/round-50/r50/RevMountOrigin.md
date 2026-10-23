# RevMountOrigin — cap-run mount-layout history (revenger)

Lane `/home/vgpnk/Projects/shokunin/kumitate-shokunin`, read-only; no tooling installed (none needed). Method: read-only `git log`/`git diff`/`git show`/`git grep` on the lane repo plus the r49 seat record. Note: the lane tip during this wave is `378b6e7` ("round-50: freeze guard and closure corrections") and it ALREADY carries the `/tmp` guard — every claim below is anchored to a commit, so it holds regardless of when the L1 integrates.

## 1. Chronology of `scripts/cap-run.mjs`

`git log --oneline --follow -- scripts/cap-run.mjs` → 5 commits, all 2026-10-23 (repo seed `cb1f12e` 2026-09-28; rounds 46/47/49/50 all land the same day):

| commit | round | what changed on the mount surface |
|---|---|---|
| `980a16a` | 46 C1 | file born, 416 lines, contract `kumitate-cap-run-v1`. argv line 165-166: `bwrap --ro-bind / / --dev /dev --proc /proc --tmpfs /tmp --tmpfs /run --bind <cwd> <cwd> --chdir <cwd>`. Motivation: QUALITY Q31 / round-45 AuditLaneSandboxes (24 child sites, no `MemoryMax`). NO user `--bind` option; `/tmp` masked by tmpfs from birth. |
| `cac4300` | 47 freeze | contract v2 (`kumitate-cap-run-v2`, R46-5): adds `--bind <dir>` and `--verdict-file`. Bind arm at freeze: only `v.startsWith('/') && statSync(v).isDirectory()` — **no refusal list at all**. Binds appended AFTER the tmpfs mounts: `'--tmpfs','/tmp','--tmpfs','/run','--bind',cwd,cwd, ...o.bind.flatMap(d=>['--bind',d,d])`. Header states the intent: "each `--bind <dir>` ... is bound read-write at the same path after the tmpfs mounts, **so a caller's fixture under the host `/tmp` stays visible**". |
| `269dadb` | 47 C1 | hardening per ReviewCapRunV2 F1 + SentinelCapSpawn 1: binds become `[realpathSync(v), resolve(v)]`, refused when `p === '/' || /^\/(?:proc|sys|dev|run)(?:\/|$)/.test(p)` — applied to BOTH the realpath and the resolve. `/tmp` deliberately NOT in the set. New S095 note: "why `--bind` follows `--tmpfs /tmp`". |
| `5b0de26` | 50 freeze | bytes unchanged on the bind/tmpfs surface; guard still absent (this is the round's H1 baseline rev). `git diff 5b0de26 378b6e7 -- scripts/cap-run.mjs` shows the guard being ADDED, so 5b0de26 = pre-guard. |
| `378b6e7` | 50 tip | the guard: `const bad = (p) => p === '/' || p === '/tmp' || /^\/(?:proc|sys|dev|run)(?:\/|$)/.test(p);` (cap-run.mjs:131), message updated to "root, /tmp, /proc, /sys, /dev and /run stay as the sandbox mounts them" (:132), selftest arm `[...lim(), '--bind', '/tmp', '--', 'true']` appended to the same usage loop (:317), header becomes "rounds 46-50" with "A subdirectory fixture under host `/tmp` stays visible, but `/tmp` itself cannot be rebound after the tmpfs" (:19-20). |

## 2. When `--bind` was added after `--tmpfs`, and why

**Added at `cac4300` (r47 freeze), placed after `--tmpfs /tmp --tmpfs /run` by design, and hardened at `269dadb` (r47 C1).** The reason is recorded twice:

- S095 (bubblewrap 0.13.1 manual): filesystem options "are applied in the order they are given as arguments". Binds after the tmpfs therefore re-expose (punch through) the tmpfs at that path.
- The r47 F1 record, `corpus/lessons/round-47.md` § Routed repairs, R46-5: "ReviewCapRunV2 F1 and SentinelCapSpawn 1 (`--bind /` re-opened the read-only root; `/run` leaked host sockets) are fixed: `--bind` binds the resolved directory and refuses `/`, `/proc`, `/sys`, `/dev` and `/run`".

So at r47 the review audited exactly this surface and flagged **two** exposures — `/` (root re-open, F1) and `/run` (host sockets, SentinelCapSpawn 1) — and wrote a refusal list for root + kernel/runtime trees. `/tmp` was the *stated purpose* of the option ("so a caller's fixture under the host `/tmp` stays visible", header at both `cac4300` and `269dadb`), not an oversight anyone recorded.

## 3. Did any round flag the `/tmp` hole before ScoutCapRunVisibility?

**No — ScoutCapRunVisibility (r49) is the first recorded flag.** Evidence chain:

- r46: no `--bind` option existed; nothing to flag. The r46 record (`980a16a` commit message + lesson) concerns Q31/MemoryMax and selftest scrubbing.
- r47: closest miss. ReviewCapRunV2 F1 and SentinelCapSpawn 1 enumerated the refusal list and explicitly stopped at `/` `/proc` `/sys` `/dev` `/run` — `/tmp` was kept out on purpose (fixture visibility). The r47 lesson (`corpus/lessons/round-47.md:75-77`) is the durable record; `.ufo/reports/round-47/` is not retained in the lane tree (only `round-33` exists under `.ufo/reports/` at tip).
- r48: `git grep -i 'expos|hole|/tmp' HEAD~5 -- .ufo/reports/round-48/` filtered for bind/tmpfs → no hits. The r48 records cite cap-run child sites (round-gate.mjs:742, surface-probe.mjs:491/:519/:1592), not its mount surface.
- r49: `.ufo/waves/round-49/r49/ScoutCapRunVisibility.md` states: "`--bind /tmp` (the directory itself): visible top is `/tmp xfs rw` ... `TMP_ENTRIES 40905` ... Without that bind: top `/tmp tmpfs rw` ... `TMP_ENTRIES 0`" and "`/tmp` is not in the refuse set. Because user binds are appended after `--tmpfs /tmp` ... `--bind /tmp` undoes the mask and shows host `/tmp` read-write", with live unit receipts (`cap-run-1551667-1792785012809-0cfe50`, `cap-run-1548567-...0aef2a`). The r50 plan cites it as R50-6 (plan.md:24-25).
- The r49 bind-oracle (K4-K6) targeted mount-order attacks generally (EXTRA/MISSING/CONTROL_VISIBLE), not `--bind /tmp` through cap-run's CLI; the discovery seat is the specific flag.

## 4. Original intent vs the guard — verdict

**The guard does not contradict the original intent; it restores the runner's founding invariant while preserving the r47 feature exactly as stated.**

- Founding invariant (r46 header, `980a16a`): "the rest of `/` is read-only, `/tmp` and `/run` are fresh tmpfs mounts". A wholesale `--bind /tmp /tmp` erases that invariant for `/tmp`.
- r47 intent: fixture visibility under host `/tmp` — i.e. *subdirectory* binds punching through the tmpfs. The guard's exact-match test (`p === '/tmp'`, post-realpath and post-resolve, applied to both) keeps every subdirectory bind legal and refuses only the whole mount point. The tip header says precisely this ("A subdirectory fixture under host `/tmp` stays visible, but `/tmp` itself cannot be rebound after the tmpfs").
- Continuity of method: the guard extends the same `bad()` list the r47 F1 record created, in the same place, with the same both-roots application — it is the next entry in the list r47's review started, not a redesign.

**Residual, recorded, not a contradiction:** the automatic cwd bind (`'--bind', cwd, cwd`, unconditional, cap-run.mjs:190) still punches through the `/tmp` tmpfs when the lane runs cap-run with its working directory under `/tmp` — observed live by ScoutCapRunVisibility ("Cwd under `/tmp` with no user `--bind` ... `CWD_WRITABLE yes`"). The guard closes the caller-supplied surface only; the cwd surface is the runner contract itself (the child's working directory is writable by design, r46 header). A refusal there would break every run; the correct containment is not calling cap-run from under `/tmp` with a sandbox that must not see host `/tmp`.

## Confidence

- Chronology, diff contents, refusal-list provenance, F1 record: **high** (direct `git show`/`git diff`/lesson text, quoted above).
- "No earlier flag": **high within the lane tree** — negative searches over r46–r48 records; the r47/r48 per-round report files are not retained in the lane (only `round-33`), so a fleet-side report could in principle contain text not visible here; nothing in the corpus lessons or wave dirs does.
