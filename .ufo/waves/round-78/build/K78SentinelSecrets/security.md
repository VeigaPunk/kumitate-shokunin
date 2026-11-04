# Round 78 security assessment

Axes: **operability + coverage:kimi-layer**. Read-only review and hermetic probes; no remediation or integration performed.

## Measured revision

Archive: `ad2630d0566a561ee078f47fade5644a22c10621`, overlaid in disposable scratch with:

- `build/K78ExecKDerive/patch.diff`, SHA256 `7ed3b4b6d059cbba097b2728b25eb9dfeb50a743c7a19dc3c32fbe43532ec7ff`.
- `build/K78ExecCompare/patch.diff`, SHA256 `7e6c7f2eec0b089b462bc4000b9d97e811e632accc8e0405b1ce6a8535f6fdf2`.

All artifact references below are relative to this security.md unless explicitly stated. Saved `kimi-census.mjs`, `proxy-check.mjs`, and `omp-census.mjs` are the measured patched sources, not lane edits.

Reproduction: `python /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-78/build/K78SentinelSecrets/security-probe.py`. The driver materializes only the frozen fixture spec, applies patches with `patch` (no git mutation), runs independent cases concurrently, preserves stdout/stderr/syscall traces and evidence.json, then deletes its scratch in `finally`.

## Finding list

### S1 — Low: unescaped live names break the one-line compare contract

- Site: patched `scripts/omp-census.mjs:249`, also executor `patch.diff:52`.
- Exploit path: an actor able to create a root member names it `00\nOMP_SHAPE_COMPARE: IN_SYNC`. The name is inserted literally into `first=`, producing a second readiness-looking stdout line.
- Proof command: driver case `compare-newline` invokes `node scripts/omp-census.mjs --compare RECEIPT --root OMP_NEWLINE_ROOT`; saved `compare-newline.stdout` contains:

  ```text
  OMP_SHAPE_COMPARE: DRIFT entries=1 receipt=64 added=1 removed=64 changed=0 first=00
  OMP_SHAPE_COMPARE: IN_SYNC
  ```

- Verdict: reproduced; exit remains 1. No member bytes leaked. A consumer trusting the final verdict-looking line rather than exit status can be misled. This violates the promised one-line output and is a provenance/correctness defect, not demonstrated code execution.
- Smallest remediation: encode control characters (including CR/LF/ESC) in the displayed `first` value while retaining original names for comparison; add a control-character-name discriminator.

### S2 — Low: the new exported one-argument decision omits owner enforcement

- Sites: patched `scripts/kimi-census.mjs:264,348`; executor K patch lines 18,59. Previously `verify` defaulted `runningUid = process.getuid()`; `decide(root, runningUid)` has no default and guards the owner comparison with `runningUid !== undefined`.
- Exploit path: a caller following the frozen `decide(root)` API receives no owner findings for foreign-owned secret directories. The CLI and proxy explicitly supply the current uid, so no current CLI bypass is claimed.
- Proof: `owner-api.mjs` calls the same decision on the same fixture first without uid and then with a deliberately mismatching uid. `owner-api.stdout`: implicit owner findings `[]`; explicit mismatch reports `locks/`, `credentials/`, `oauth/`. This discriminator uses a synthetic running uid, not chown or an actual foreign-owner fixture; the omission itself is directly visible in the source.
- Proof command: `TMPDIR=SEAT_SCRATCH node build/K78SentinelSecrets/owner-api.mjs` from the lane, with scratch created and subsequently removed. The measured command exited 0.
- Verdict: reproduced API enforcement difference; existing CLI/proxy owner checks retained.
- Smallest remediation: default the exported decision's uid to the running uid, retaining the explicit override solely for owner tests. Missing uid on unsupported platforms should be deliberately fail-closed if the owner contract cannot be enforced.

### B1 — Informational boundary exception: receipt symlinks are followed

- Site: unchanged `scripts/omp-census.mjs:184` (`shapeFromFile` uses `readFileSync(file, 'utf8')`), now reused by compare at line 220.
- Proof commands: `compare-receipt-link` and `compare-secret-link` driver cases. Both symlinks and their targets are outside the lane and inside this seat's scratch. `compare-receipt-link` opens the symlink path and returns IN_SYNC/0; `compare-secret-link` opens a symlink targeting the readable marker file and returns SHAPE_INVALID/2. The `openat` calls are at line 49 of their respective `.strace` files.
- Verdict: the receipt FILE is an explicitly selected content-bearing input, not a root member; following it is inherited behavior, not a newly demonstrated root escape. The strict assertion that *nothing follows any symlink outside the lane* is false. No target bytes are echoed.
- Impact: compare can read an arbitrary readable caller-selected receipt target. This is not a privilege escalation for the local CLI, whose explicit FILE argument already permits arbitrary regular files.
- Smallest remediation if receipt no-follow is required: open with O_NOFOLLOW and validate the opened descriptor as a regular file, then read that descriptor. Do not substitute a racy lstat-then-read guard. No change is required by the currently frozen receipt-path contract.

## Marker and filesystem proofs

Unique fixture marker: `K78_SENTINEL_PRIVATE_6b9e2d077043`. It was placed in `mcp.json`, `server.token`, inside each of `locks/`, `credentials/`, and `oauth/`, in ordinary OMP member files, and in the external symlink target. The marker is intentionally present in this report, driver and evidence metadata; those are sentinel-produced records, not tool leaks.

- Every measured stdout/stderr, including both frozen counters, is marker-free (`evidence.json`: every `marker_leaked=false`).
- Clean and escaping-secret K fixtures both produce census CLEAN/0; the latter is intentional under the existing non-directory-leaf secret pin. Traces show **no file-content open** under either K root and no opening of the escaping target. Only the declared enumerable directories are opened with O_DIRECTORY; secret directories are not enumerated.
- Proxy clean/escape calls also perform no member-content opens. Both exit 1 only for `GATE_PIN_DRIFT pin.omp-census`, because the combined overlay changed that tool after the K patch's scorecard pin was generated. Both derive `K_members=55 K_sections=55 K_findings=0 coverage_kimi=10`.
- Direct census and compare calls have no filesystem write syscalls in the traced file-operation class. The two proxy calls' sole write-capable open is `/dev/null` from their read-only git child; no regular output file is opened for writing. Thus these calls cannot write the marker to a tool-created file. The driver additionally finds zero marker-bearing files anywhere in the measured lane archive.
- Frozen counters intentionally create/remove their own hermetic fixtures and snapshots; their traces retain those expected writes. Their fixtures never receive this unique sentinel marker. Do not mistake those writes, or the sentinel's trace/log capture, for live verification writes.

| Compare case | Exit / observed result | Root/member content opened? |
|---|---|---|
| clean receipt/root, marker-filled members | 0 IN_SYNC 64/64 | No |
| receipt entry `../outside-secret` | 2 SHAPE_INVALID | No |
| receipt entry absolute target path | 2 SHAPE_INVALID | No |
| receipt symlink to valid external receipt | 0 IN_SYNC | Receipt target only, by explicit FILE input |
| receipt symlink to external marker file | 2 SHAPE_INVALID | Receipt target only; marker not printed |
| root itself a symlink | 2 ROOT_NOT_A_DIR | No: lstat sees link; no root traversal |
| extra FIFO member | 1 DRIFT added=1 first=fifo-member | No: stat-only, finishes without a writer |
| newline-bearing member | 1 DRIFT, two stdout lines | No; S1 above |

`evidence.json`'s `content_opens` is a lexical root-member-path filter, not a symlink-target resolver: its empty result for receipt symlinks MUST NOT be interpreted as no target read. The explicit receipt exception above comes from the captured open syscall and construction.

## Patch construction review

The K member table retains all five secret flags, mode floors (mcp.json 0400, server.token 0600, locks/credentials/oauth 0700), oauth's existing 0755 ceiling, and directory mode-ceiling arithmetic. No added member-content read/open occurs. CLI/proxy callers still pass current uid; S2 identifies the one-argument export discrepancy. K member paths remain hard-coded; receipt names are rejected for separators, dot/dotdot, malformed kinds/modes, or unsorted duplicates and are not joined into live paths. C2 reads only the enumerated root's immediate names and lstats each; root/member symlinks are not dereferenced for metadata. Root replacement races between lstat/readdir were not exercised; no claim of race-proof confinement is made.

## Frozen counters and limits

- Frozen SHA256s observed: C1 `aa00be37a46afdf02b68f47ed774094eb9297dbc5707089313e2915da9e652cf`; C2 `a46e53d7449bffad66541dae4661e20651930dc4551b49f6544eb56d5e84b460`. Neither was edited.
- Baseline archive: C1 3/12 (exit 1), C2 2/11 (exit 1), recorded under `baseline/`.
- Combined executor overlay: C1 **10/12** (exit 1), C2 **11/11** (exit 0). C1 misses proxy-clean-terms and live-strict because of the combined-overlay OMP tool pin drift. Security/content-blind arm passes; both K/proxy selftests pass, and OMP selftests pass. No HELD 12/12 assertion is made. Smallest integration repair: remeasure the OMP tool pin after combining actual final bytes, then the coordinator runs the frozen C1 counter. Sentinel did not alter scorecard/pins or rerun the failure.
- This review stops at the two assigned surfaces. No resume_continuity_v1 surface is involved; no readiness or external live access is inferred from these fixtures.

Tools: existing Node v24.21.0, strace 7.2, Python, tar and patch; **no installs/updates**. All disposable archives/fixtures lived under `/fast/scratch/hyaku/kumitate-r78/K78SentinelSecrets/`; both runs and the separate owner discriminator removed their scratch via finally. No lane/fleet tracked files, git/jj state, config, frozen probes, or sibling artifacts were modified.

Report routing: the binding Report trailer names `w1/K78SentinelSecrets.md`, while the acceptance prose also names `w1/K78SentinelSecrets/report.md`. The former is written; the latter was not written because it is outside the binding trailer write scope. This full assessment and a report copy are in the authorized build directory for the coordinator to route if necessary.

Self-evaluation: accuracy 4/5 (explicitly scoped owner proof uses synthetic uid); completeness 4/5 (all requested arms run, nested report path conflicts with scope); clarity 4/5 (trace filter limitation is disclosed); actionability 5/5 (exact sites and minimal remediations); conciseness 4/5 (full syscall evidence is separate). Overall 4.2/5. Improve by routing the nested report centrally and retaining a true foreign-owner fixture if the coordinator wants stronger API enforcement evidence; neither uncertainty changes the reproduced newline defect or observed marker boundary.
