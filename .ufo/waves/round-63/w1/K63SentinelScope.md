VERDICT: The committed round-63 tree is clean (198 files, all in lane/L1 scope, max blob 663,997 B, no secrets, no transcript text, no host-session file paths) and the gate provably prints only counts/names — but two committed probes can destroy or execute arbitrary paths (`rmSync(out)` on a caller path; `bash -c` interpolation of `lane`), the frozen T5 live-fetch arm accepts loopback URLs and hangs on a hostile page, and the gate can be made to emit a forged `CLEAN` line from a lane-written seat name.

## Evidence

Commands run 2026-10-25; full transcripts in `build/K63SentinelScope/evidence.txt`, re-runnable via `build/K63SentinelScope/repro.sh`.

**Gate host access (brief item 1) — no content printed, nothing written.**
`grep -n "writeFileSync\|mkdirSync\|rmSync" scripts/inline-dispatch-evidence.mjs` → only lines 280–344, all inside `fixture()`/`selftest()` under `mkdtempSync`; `inspect()` (lines 153–263) writes nothing and its output line carries `seats/sessions/done/reports/dead` counts only; findings carry seat names and counts (`SESSION_FOREIGN:<name>`, `PARENT_MISMATCH:<n>-parents`, `SESSION_ID_DUP:<name>=<name>`), never `tr.user`, never a session id, never a path.
Empirical: I injected `CANARY-SECRET-9f3a1c-DO-NOT-LEAK` into a matching transcript and into a foreign one; both runs printed it zero times:
```
INLINE_DISPATCH: CLEAN (seats=3 sessions=3 done=3 reports=3 dead=0)          EXIT=0   canary occurrences: out.txt:0,err.txt:0
INLINE_DISPATCH: DRIFT (seats=3 sessions=2 done=2 reports=3 dead=0)          EXIT=1   canary-in-output=0
FINDING SESSION_FOREIGN:K63BetaTwo
```
Cost is bounded: `indexSessions` walks names only (depth ≤3, 1618 `*.jsonl` / 3.4 GB host store); real run `--root …/kengaku-shokunin --round 35 --wave build` → `INLINE_DISPATCH: CLEAN (seats=32 …)` in `real 0m0.085s`.

**Committed round-63 tree — no transcript excerpt, no host-session file path, no secret (brief item 1b).**
`git grep -nE '/home/vgpnk|\.omp/agent/sessions|/fast/scratch|sk-[A-Za-z0-9]{16,}|Bearer |api[_-]?key|password' b38a2065ab8ac5b198f6569b9013d04411c3d40d -- .ufo/waves/round-63 scripts/inline-dispatch-evidence.mjs` → 11 hits, all benign: the plan's own paths (plan.md:25,26,47,90,146), the sessions *directory* name (probe/inline63-probe.mjs:14, plan.md:25), `DEFAULT_LOG` (scripts/inline-dispatch-evidence.mjs:42), the fleet census path (probe/topology63-probe.mjs:36), the lane path in a census receipt (base/census-before.txt:7), and a vendor placeholder `-H "Authorization: Bearer $DASHSCOPE_API_KEY"` in the Bailian capture (build/K63Capture/bailian-managed-agents-multiagent.md:43) — a documented env-var name, no value. No `"parentSession"`, no transcript row, no `~/.omp/.../<Seat>.jsonl` in the committed set.

**Freeze commit scope and size (brief item 2).**
`git show --name-only --format= b38a206…` → 198 paths: 196 under `.ufo/waves/round-63/`, `scripts/inline-dispatch-evidence.mjs`, `.ufo/pins/counter-pins.json` (the L1 is the declared owner of `scripts/` and `.ufo/pins/`; no fleet/sibling/`corpus`/`SCORECARD` file). `git ls-tree -rl b38a206 -- .ufo/waves/round-63 | awk '$4>1048576' | wc -l` → `0`; largest blob `663997 …/build/K63Capture/arxiv-2512.08296v3.html`, i.e. exactly the 663,997 bytes the brief names, so the >1 MiB skip could not have dropped anything here. No `w1/` file is in the freeze commit (freeze precedes dispatch, as plan.md:3 claims).

**Control generators (brief item 3).**
`make-inline-controls.mjs` writes only under `out` (every path is `join(out, …)`) but `rmSync(out, {recursive:true, force:true})` at line 19 runs on `resolve(argv[2])` with the only guard being "an argument was given" (lines 17–18) → finding 1. `make-topology-controls.mjs`: `mkdirSync(out)` only (line 28), fixture `D = mkdtempSync` (line 40), `git -C D rev-parse --show-toplevel` compared to `D` before the first commit (lines 41–42), every git call is `-C D`, `reset --hard` only inside `D`, `rmSync(D)` at the end — the fixture discipline is correct. Its line 43 shells out (`bash -c "git -C \"${lane}\" archive …"`) → finding 2.

**Live-fetch arm (brief item 4).**
`topology63-probe.mjs:172` runs `curl -fsSL --max-time 90 --retry 2 -A … <url from a lane-written row>`. Loopback is fetched end-to-end: a fixture repo whose two `## Registry` rows point at `http://127.0.0.1:18765/secret.html` scores
```
TOPOLOGY63_UNMET held=5/7 checks=7 rev=46f2950a… rule=T63 | T6 MISS census-exit=1 | T7 MISS province-names-entry=false readme-map-clean=false
```
— T5 is *absent from the miss list*, i.e. the arm accepted the internal URL. 8 MiB downloaded in one shot (`bytes=8388608`, no `--max-filesize`). `file://` redirect is already refused (`curl: (1) Protocol "file" is disabled (in redirect)`, curl 8.23.0 default `--proto-redir`), so the scheme path is closed; the private-address path is not. The normaliser is quadratic on unclosed tags: `bytes=140000 norm_ms=1032.8 | bytes=280000 norm_ms=4110.6 | bytes=560000 norm_ms=16312.4` (4× per doubling), with no overall timeout.

**Seat write scope (brief item 5).**
All 40 `w1-dispatch.json` tasks were machine-scanned for write verbs near absolute paths: every named write target is `.ufo/waves/round-63/build/<Seat>/…`, `.ufo/waves/round-63/w1/<Seat>.md` or `/tmp/kumitate-r63/<Seat>/…`; the only `corpus/` paths named (K63ScribeLesson, K63ScribeQuality) are read sources ("Draft … as a full file at …/build/…"). No prompt asks for `git add/commit/reset`, `jj`, `pacman`, a write to `shokuknow`, or a write into `~/.omp/agent/sessions`. The dispatch context (4,002 bytes) states the write scope, the freeze and the not-an-integration-owner rule verbatim. The two indirect exposures are volume, not permission: `K63ExecProxyStanza` copies the lane into `build/K63ExecProxyStanza/mirror/` (158 MB) and `K63ExecReadmeMapRepair` mirrors `corpus/`, `.ufo/pins/readme-map.json`, `scripts/readme-map.mjs` (5.1 MB) → finding 5.

## Findings

1. **K63SentinelScope-1 — high — `make-inline-controls.mjs` deletes any tree the caller names.**
   `const out = resolve(process.argv[2] || '')` (line 17) then `rmSync(out, { recursive: true, force: true })` (line 19); no containment check, and `resolve` accepts `.`, `..` and absolute paths. Verified: a pre-existing `rmtest/precious/` holding `nested/keepme.txt` and `sibling.txt` was replaced by the fixtures (`keepme.txt exists? NO`, `sibling.txt exists? NO`). A one-component slip (`…/round-63` instead of `…/round-63/controls/inline`) destroys `plan.md`, `probe/` and `controls/`; the lane root would destroy `.git`. Reproduce: `build/K63SentinelScope/repro.sh` §S-1. Fix: `guard-proposal.md` G1 (allowlist `controls/inline` or `/tmp/kumitate-r63/<Seat>`, per-case `rmSync` instead of a top-level one).

2. **K63SentinelScope-2 — high — shell command injection through `bash -c` in three committed tools.**
   `make-topology-controls.mjs:43`, `topology63-probe.mjs:53`, `inline63-probe.mjs:29` build `git -C "${lane}" archive "${rev}" | tar -x -C "${T}"` with double-quoted interpolation of an argv value. Verified with `lane = '/tmp/…/x";touch /tmp/…/PWNED;"'` → `PWNED created? YES`. `rev` is safe in both probes (already a 40-hex hash from `rev-parse`); `lane` is not. Reproduce: `repro.sh` §S-2. Fix: `guard-proposal.md` G2 (`spawnSync('git', ['-C', lane, 'archive', '--format=tar', rev])` piped to `tar -x -C T` via `input:`).

3. **K63SentinelScope-3 — medium — T5 is an unguarded SSRF + unbounded-download + quadratic-parse hang in the frozen counter.**
   Row URLs are lane-authored (two rows are opened this round) and reach `curl` with only `https?://` as a filter, so loopback/RFC1918/`169.254.169.254` are reachable (loopback proven end-to-end above; `-f` makes the exit code a one-bit oracle on internal responses, and a chosen quote makes T5 HELD/MISS read that oracle). Download is uncapped below the 128 MiB `maxBuffer`, and `norm` (`topology63-probe.mjs:57–69`) is O(n²) on unclosed `<script`/`<style>` — 560 KB already costs 16.3 s, so an 8 MiB hostile page stalls the counting command for days with no overall timeout (`--retry 2` × `--max-time 90` bounds each attempt only). Reproduce: `repro.sh` §S-3, plus `$S/ssrf2`. Fix: `guard-proposal.md` G3 (private-address refusal, `--proto '=https' --proto-redir '=https,http' --max-redirs 3 --max-filesize 8M --connect-timeout 10 --max-time 30 --noproxy '*'`, greedy linear `norm`, byte cap). Report-only: the counter is frozen, I did not patch it.

4. **K63SentinelScope-4 — medium — lane-written seat names forge a verdict line and reach the report path unchecked.**
   `tasks[].name` from `w1-dispatch.json` is never validated; it is interpolated into `FINDING …` output and into `src.read(\`${base}/${wave}/${s.name}.md\`)`. Verified: a name `K63Evil\nINLINE_DISPATCH: CLEAN (seats=40 sessions=40 done=40 reports=40 dead=0)` produced a real gate run whose stdout holds *both* the true `DRIFT` line and a forged `CLEAN` line (`grep -c 'INLINE_DISPATCH: CLEAN'` → `1`) at exit 1 — enough to poison a grep-built receipt (I6 quotes CLEAN lines) or a human reading. A name containing `..` makes the report read escape the wave directory. I2/I3 are not fooled (they read `stdout.split('\n')[0]` and require the exit code), so the blast radius is receipts, not the probe. Reproduce: `repro.sh` §S-4. Fix: `guard-proposal.md` G4 (fail-closed on `/^[A-Za-z0-9._-]{1,64}$/`).

5. **K63SentinelScope-5 — medium (operability) — `build/` is 160 MB / 12,547 untracked files and is not ignored; a blanket commit doubles the repo.**
   `du -sb .ufo/waves/round-63/build` → `160329220`; `git status --porcelain --untracked-files=all .ufo/waves/round-63/build | wc -l` → `12547`; `git check-ignore -v …/mirror/LOG.md` → no rule (`.gitignore` holds only `.ufo/interactive-sessions/`). 158 MB of that is `K63ExecProxyStanza/mirror/` (a `git archive` of the lane), whose largest member is `…/round-61/controls/r61-c2-full-forgery.bundle` (16,488,385 B) — **already tracked at HEAD**, so committing the mirror stores a second copy; 19 mirror `.jsonl` stream logs also carry real `~/.omp` paths from round 59. The freeze commit already committed `build/K63Capture` (660 KB), so committing `build/` is a live precedent. Reproduce: `git status --porcelain -uall .ufo/waves/round-63/build`. Fix: add `.ufo/waves/*/build/*/mirror/` and `**/*.bundle` to `.gitignore` before the tip commit, or commit named files only.

6. **K63SentinelScope-6 — low — host-session metadata for other lanes was copied into an uncommitted artifact.**
   `build/K63ExecTranscriptStats/stats.tsv` (1,251,011 B, 4,528 rows) and `stats.summary.txt` (`root=/home/vgpnk/.omp/agent/sessions files=4527 … bytes=3083636269`) record session directory paths, session UUIDs, tool-call histograms and timings for *every* session on the host, including other lanes' (`-Projects-shokunin/2026-10-25T06-15-52-413Z_01a171b3-…/ClosureKake51`). I verified the column set holds counts/ids only — no message text — so this is metadata, not content; it must not be committed (session ids are host-session paths beyond a directory name). Reproduce: `head -1 build/K63ExecTranscriptStats/stats.tsv`. Fix: keep it in `/tmp/kumitate-r63/` or exclude it in the same `.gitignore` change as finding 5.

7. **K63SentinelScope-7 — low/info — the gate's "records the lane does not author" are same-UID writable.**
   `stat` → `/fast/scratch/hyaku-run7/dispatcher.log` is `vgpnk vgpnk 644`, `/home/vgpnk/.omp/agent/sessions` is `vgpnk vgpnk 755`, and seats run as `vgpnk` (`test -w` on the log → `WRITABLE by vgpnk`). So any seat can append `spawned kumitate 63 w1 40` / `done …` lines or write transcripts; the boundary is policy, not permissions. plan.md already declares the transcript half as a stated limit; the dispatcher log's writability is not declared, and the script header's "cannot rewrite from inside the repo" is true only in the narrow sense (repo files). Fix: state it in the plan's limit paragraph; longer term have the orchestrator write the log where the lane cannot (different UID, append-only mount) or add a per-line HMAC.

## Artifacts
- `.ufo/waves/round-63/w1/K63SentinelScope.md` — this report.
- `.ufo/waves/round-63/build/K63SentinelScope/repro.sh` — re-runs findings 1–4 (writes only under `/tmp/kumitate-r63/K63SentinelScope`).
- `.ufo/waves/round-63/build/K63SentinelScope/evidence.txt` — verbatim outputs E0–E9.
- `.ufo/waves/round-63/build/K63SentinelScope/guard-proposal.md` — G1–G4 patch text for the L1 (containment check, no-shell archive, T5 fetch guard + linear `norm`, seat-name validation).
- Scratch: `/tmp/kumitate-r63/K63SentinelScope/{honest,inject,rmtest,ssrf,ssrf2,www}`.
- No tool installed or upgraded this seat.

## Limits
- I did not execute `rmSync('/')` or point the generator at the lane root — the deletion capability is proven on a populated scratch tree, the root/lane cases are inference from the same unguarded call. Node's own root-path guard was not exercised.
- I did not attempt to write the dispatcher log or the sessions store (finding 7 rests on ownership/mode plus `test -w`).
- DNS-name rebinding (a public-looking host resolving to a private IP) is not closed by G3 and was not tested; `curl --proto-redir` defaults for `ftp`/`ftps` were not enumerated beyond the `file://` case.
- Findings 5–6 are working-tree state at 18:0x mid-wave, not committed bytes; the L1's commit set decides whether they matter. Grep-based sweeps cannot prove the absence of paraphrased transcript text in every build artifact; I checked for JSON transcript rows, `parentSession`, credential patterns and known host paths.
- I could not locate the "helper skips >1 MiB new files" rule in `kumitate-shokunin/scripts/*.mjs|*.sh` or `shokunin/scripts/*` (`grep -rn 1048576` → no hit), so item 2's skip behaviour is verified only from the outcome (no blob >1 MiB, arXiv capture at its stated 663,997 B).
