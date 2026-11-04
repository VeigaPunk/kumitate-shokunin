# K76SentinelBoundary — frozen-instrument boundary probe

Axes: **operability + coverage (orchestration and tooling)**.

Revision: `cabc7aefd5f1562299f757e23207710c12e4ed58`. Node `v24.21.0`; probe UID `1000`. Frozen plan read before setup. No remediation authorized or performed. Only scratch fixtures were changed; the named report/build receipts are the only lane writes.

## Scope/readiness finding

The assigned frozen revision is pre-implementation: its proxy rejects `--omp-root`, and `scripts/spotcheck-adopt.mjs` does not exist. These are expected baseline gaps, **not proof that a later executor implementation fails**. The requested C2 cases were attempted individually, but none reached adoption logic. They cannot discharge C2 boundary acceptance or establish whether a later implementation writes out of scope. No live-root contents were read, no runtime dispatched, no tooling installed.

The runner printed each EXPECTED line before spawning that case; independent fixtures ran concurrently. Every exact command, cwd, expected verdict, stdout/stderr and exit is included below and in `build/K76SentinelBoundary/raw.json`. The retained driver recreates the small fixtures from the frozen clone; no full-tree mirror was made. Census uses its existing `--root`; the claimed proxy interface is `--omp-root`.

## Probe table

| Probe | Expected before execution | Actual | Verdict |
|---|---|---|---|
| adopt-absolute | exit 2 refusal, zero bytes/mtime changes; REFUSED_OUT_OF_SCOPE; frozen script absent => MODULE_NOT_FOUND exit 1 (blocked) | MODULE_NOT_FOUND; exit 1; sampled file SHA-256 + mtime changes: [] | BLOCKED: adoption implementation absent |
| adopt-directory | exit 2 refusal, zero bytes/mtime changes; reject non-file; frozen script absent => MODULE_NOT_FOUND exit 1 (blocked) | MODULE_NOT_FOUND; exit 1; sampled file SHA-256 + mtime changes: [] | BLOCKED: adoption implementation absent |
| adopt-dotdot | exit 2 refusal, zero bytes/mtime changes; refuse noncanonical ../ rather than guess; frozen script absent => MODULE_NOT_FOUND exit 1 (blocked) | MODULE_NOT_FOUND; exit 1; sampled file SHA-256 + mtime changes: [] | BLOCKED: adoption implementation absent |
| adopt-duplicate-row | exit 2 refusal, zero bytes/mtime changes; duplicate ambiguity must refuse; frozen script absent => MODULE_NOT_FOUND exit 1 (blocked) | MODULE_NOT_FOUND; exit 1; sampled file SHA-256 + mtime changes: [] | BLOCKED: adoption implementation absent |
| adopt-readonly-pin | exit 2 refusal, zero bytes/mtime changes; cannot complete both sides, zero partial README write; frozen script absent => MODULE_NOT_FOUND exit 1 (blocked) | MODULE_NOT_FOUND; exit 1; sampled file SHA-256 + mtime changes: [] | BLOCKED: adoption implementation absent |
| adopt-scope-disguise | exit 2 refusal, zero bytes/mtime changes; reject symlink, not filename-only adoption; frozen script absent => MODULE_NOT_FOUND exit 1 (blocked) | MODULE_NOT_FOUND; exit 1; sampled file SHA-256 + mtime changes: [] | BLOCKED: adoption implementation absent |
| adopt-symlink | exit 2 refusal, zero bytes/mtime changes; reject symlink, not filename-only adoption; frozen script absent => MODULE_NOT_FOUND exit 1 (blocked) | MODULE_NOT_FOUND; exit 1; sampled file SHA-256 + mtime changes: [] | BLOCKED: adoption implementation absent |
| adopt-trailing-space | exit 2 refusal, zero bytes/mtime changes; REFUSED_NOT_SPOTCHECK (do not trim); frozen script absent => MODULE_NOT_FOUND exit 1 (blocked) | MODULE_NOT_FOUND; exit 1; sampled file SHA-256 + mtime changes: [] | BLOCKED: adoption implementation absent |
| adopt-v1-pin | exit 2 refusal, zero bytes/mtime changes; refuse unsupported pin version; frozen script absent => MODULE_NOT_FOUND exit 1 (blocked) | MODULE_NOT_FOUND; exit 1; sampled file SHA-256 + mtime changes: [] | BLOCKED: adoption implementation absent |
| census-member-fifo | exit 1 KIND agent.db want=file got=other; returns promptly without FIFO read | KIND agent.db want=file got=other; OMP_CENSUS: DRIFT (root=/fast/scratch/hyaku/kumitate-r76/K76SentinelBoundary/fixtures/root-fifo entries=1 findings=1); exit 1 | Expected census behavior |
| census-note-comment | exit 1 NOTE_UNBOUND for all declared names | NOTE_UNBOUND RULES.md; OMP_CENSUS: DRIFT (root=/fast/scratch/hyaku/kumitate-r76/K76SentinelBoundary/fixtures/root-clean entries=1 findings=35); exit 1 | Expected census behavior |
| census-note-empty | exit 1 NOTE_UNBOUND for all declared names | NOTE_UNBOUND RULES.md; OMP_CENSUS: DRIFT (root=/fast/scratch/hyaku/kumitate-r76/K76SentinelBoundary/fixtures/root-clean entries=1 findings=35); exit 1 | Expected census behavior |
| census-note-fence | exit 0 CLEAN bound=35/35 (visible fenced tokens bind) | OMP_CENSUS: CLEAN (root=/fast/scratch/hyaku/kumitate-r76/K76SentinelBoundary/fixtures/root-clean entries=1 findings=0 bound=35/35); exit 0 | Expected census behavior |
| census-note-removed | exit 2 NOTE_MISSING | NOTE_MISSING /fast/scratch/hyaku/kumitate-r76/K76SentinelBoundary/fixtures/self-removed/corpus/knowledge/omp-agent-root.md reason=ENOENT; exit 2 | Expected census behavior |
| census-root-empty | exit 1 EMPTY root holds no member | EMPTY root holds no member; OMP_CENSUS: DRIFT (root=/fast/scratch/hyaku/kumitate-r76/K76SentinelBoundary/fixtures/root-empty entries=0 findings=1); exit 1 | Expected census behavior |
| census-root-file | exit 2 OMP_CENSUS: ERROR reason=ENOTDIR | OMP_CENSUS: ERROR root=/fast/scratch/hyaku/kumitate-r76/K76SentinelBoundary/fixtures/root-file reason=ENOTDIR; exit 2 | Expected census behavior |
| census-root-newline-backslash | exit 1 UNLISTED; no member content reads | UNLISTED odd; back\slash; OMP_CENSUS: DRIFT (root=/fast/scratch/hyaku/kumitate-r76/K76SentinelBoundary/fixtures/root-odd entries=1 findings=1); exit 1 | Expected census behavior |
| census-root-symlink | exit 2 OMP_CENSUS: ERROR reason=ENOTDIR | OMP_CENSUS: ERROR root=/fast/scratch/hyaku/kumitate-r76/K76SentinelBoundary/fixtures/root-link reason=ENOTDIR; exit 2 | Expected census behavior |
| census-root-unreadable | exit 2 OMP_CENSUS: ERROR reason=EACCES | OMP_CENSUS: ERROR root=/fast/scratch/hyaku/kumitate-r76/K76SentinelBoundary/fixtures/root-unreadable reason=EACCES; exit 2 | Expected census behavior |
| proxy-note-comment | frozen proxy has no O arm: no OMP_NOTE_MISSING and no coverage_omp term; other existing drift may remain | "verdict": "DRIFT"; exit 1; coverage_omp absent | No O-note gate; not equivalent to census |
| proxy-note-empty | frozen proxy has no O arm: no OMP_NOTE_MISSING and no coverage_omp term; other existing drift may remain | "verdict": "DRIFT"; exit 1; coverage_omp absent | No O-note gate; not equivalent to census |
| proxy-note-fence | frozen proxy has no O arm: no OMP_NOTE_MISSING and no coverage_omp term; other existing drift may remain | "verdict": "DRIFT"; exit 1; coverage_omp absent | No O-note gate; not equivalent to census |
| proxy-note-removed | frozen proxy has no O arm: no OMP_NOTE_MISSING and no coverage_omp term; other existing drift may remain | "verdict": "DRIFT"; exit 1; coverage_omp absent | No O-note gate; not equivalent to census |
| proxy-root-empty | exit 1 EMPTY; coverage_omp=0, never 10; frozen parser expected exit 64 unknown argument | proxy-check: unknown argument: --omp-root; exit 64 | BLOCKED: C1 arm absent at frozen revision |
| proxy-root-file | exit 2 OMP_ROOT_NOT_A_DIR; frozen parser expected exit 64 unknown argument | proxy-check: unknown argument: --omp-root; exit 64 | BLOCKED: C1 arm absent at frozen revision |
| proxy-root-newline-backslash | exit 1 finding(s), never coverage_omp=10; frozen parser expected exit 64 unknown argument | proxy-check: unknown argument: --omp-root; exit 64 | BLOCKED: C1 arm absent at frozen revision |
| proxy-root-symlink | exit 2 OMP_ROOT_NOT_A_DIR (census lstat rejects symlink root); frozen parser expected exit 64 unknown argument | proxy-check: unknown argument: --omp-root; exit 64 | BLOCKED: C1 arm absent at frozen revision |
| proxy-root-unreadable | exit 2 OMP_ROOT_NOT_A_DIR/EACCES as own non-root user; frozen parser expected exit 64 unknown argument | proxy-check: unknown argument: --omp-root; exit 64 | BLOCKED: C1 arm absent at frozen revision |

## Findings: severity, exploit path, evidence, impact, smallest remediation

1. **HIGH readiness/evidence defect if these receipts are called post-change verification.** A caller supplies any `--omp-root` path and receives usage exit 64 rather than the declared O fail-closed/scoring arms; every C2 call terminates in Node's missing-module loader. Evidence: proxy-root and adopt rows above. Impact: no C2 rejection/no-mutation or C1 O scoring claim is exercised here. Smallest remediation: retain these as baseline-only receipts and independently run the same boundary fixtures against the actual measured implementation revision before claiming boundary acceptance. Do not change the frozen plan or infer a pass from process failure.

2. **LOW output-framing flaw.** An untrusted root entry named `odd\nback\\slash` is rendered verbatim: actual output contains `UNLISTED odd` followed by a separate `back\slash` line. Exit remains 1 and the final census summary remains DRIFT, so this is log-boundary ambiguity, not demonstrated acceptance or command execution. Evidence: census-root-newline-backslash stdout. Impact: line-oriented consumers can misattribute attacker-controlled text. Smallest remediation: escape control characters/backslashes in rendered member names while retaining raw names for matching; preserve the census rule/exit contract.

No demonstrated path caused a write outside the two intended C2 files: **the C2 program never ran**. That observation is not a safety proof. For every attempted C2 case, the runner compared SHA-256 and nanosecond mtime for every regular fixture file, including `corpus/README.md`, `.ufo/pins/readme-map.json`, `SCORECARD.md`, the target (when regular), and `corpus/lessons/neighbor.md`; the recorded changed lists are empty. Symlink referent `neighbor.md` was included as its own regular file. This sampling does not detect transient writes restored between snapshots, writes outside the fixture, or attribute-only mutations.

## Census/proxy comparison and residual limits (carry into round report)

- Census rejects file/symlink roots with exit 2 ENOTDIR, rejects mode-000 root with exit 2 EACCES as the actual non-root owner, and rejects an empty root with exit 1 EMPTY. No observed census case silently scores 10: census does not itself print coverage scores, and frozen proxy has no O score to inspect.
- Census refuses missing note (exit 2 NOTE_MISSING), drifts on empty/comment-only notes (exit 1, findings=35), and accepts all identifiers in a visible fenced code block (exit 0, bound=35/35). Fenced binding is expressly the existing census contract, not a bypass. Frozen proxy treats every note variant as ordinary pre-existing DRIFT and has no OMP_NOTE_MISSING or coverage_omp. This is a baseline missing gate, not a post-change equivalence result.
- Source evidence `scripts/omp-census.mjs:139–150,199–244,287–305`: root/member inspection is readdir/lstat; only the binding note is readFileSync'd. FIFO `agent.db` returned KIND/DRIFT promptly, consistent with no member-content read. This is source plus a targeted observation, not a syscall-level proof covering races or arbitrary future code.
- **C2 symlink scope proof is unavailable at the assigned revision.** An exactly named `round-12-verifier-spotcheck.md` symlink to a different corpus file was prepared and attempted; Node failed before inspecting it. Do not report that this target was accepted or refused by the instrument.
- **A filename/regular-file gate can establish only path-and-shape eligibility, not that a document is genuinely a non-author verifier spotcheck.** Even a symlink-rejecting implementation cannot establish authorship, provenance or substantive spotcheck content from its basename. Symlink rejection, canonical-path checking and write containment must be demonstrated separately on the implemented instrument. Do not describe filename eligibility as semantic/provenance verification.
- For C2 cases whose exact refusal token was not frozen (symlink, read-only pin, version-1 pin, duplicate row), the table states the conservative boundary expectation and does not invent a required named token. Read-only-file handling was not reached, so neither atomicity nor rollback is established.

## Exact command receipts

### adopt-absolute

Expected (recorded before run): exit 2 refusal, zero bytes/mtime changes; REFUSED_OUT_OF_SCOPE; frozen script absent => MODULE_NOT_FOUND exit 1 (blocked)

```sh
# cwd: /fast/scratch/hyaku/kumitate-r76/K76SentinelBoundary/fixtures/adopt-absolute
node /fast/scratch/hyaku/kumitate-r76/K76SentinelBoundary/lane/scripts/spotcheck-adopt.mjs --adopt /fast/scratch/hyaku/kumitate-r76/K76SentinelBoundary/fixtures/adopt-absolute/corpus/lessons/round-75-verifier-spotcheck.md
```

Exit: `1`.

```text
node:internal/modules/cjs/loader:1568
  throw err;
  ^

Error: Cannot find module '/fast/scratch/hyaku/kumitate-r76/K76SentinelBoundary/lane/scripts/spotcheck-adopt.mjs'
    at Module._resolveFilename (node:internal/modules/cjs/loader:1564:15)
    at wrapResolveFilename (node:internal/modules/cjs/loader:1118:27)
    at defaultResolveImplForCJSLoading (node:internal/modules/cjs/loader:1142:10)
    at resolveForCJSWithHooks (node:internal/modules/cjs/loader:1169:12)
    at Module._load (node:internal/modules/cjs/loader:1341:5)
    at wrapModuleLoad (node:internal/modules/cjs/loader:261:19)
    at Module.executeUserEntryPoint [as runMain] (node:internal/modules/run_main:154:5)
    at node:internal/main/run_main_module:33:47 {
  code: 'MODULE_NOT_FOUND',
  requireStack: []
}

Node.js v24.21.0
```

### adopt-directory

Expected (recorded before run): exit 2 refusal, zero bytes/mtime changes; reject non-file; frozen script absent => MODULE_NOT_FOUND exit 1 (blocked)

```sh
# cwd: /fast/scratch/hyaku/kumitate-r76/K76SentinelBoundary/fixtures/adopt-directory
node /fast/scratch/hyaku/kumitate-r76/K76SentinelBoundary/lane/scripts/spotcheck-adopt.mjs --adopt corpus/lessons/round-75-verifier-spotcheck.md
```

Exit: `1`.

```text
node:internal/modules/cjs/loader:1568
  throw err;
  ^

Error: Cannot find module '/fast/scratch/hyaku/kumitate-r76/K76SentinelBoundary/lane/scripts/spotcheck-adopt.mjs'
    at Module._resolveFilename (node:internal/modules/cjs/loader:1564:15)
    at wrapResolveFilename (node:internal/modules/cjs/loader:1118:27)
    at defaultResolveImplForCJSLoading (node:internal/modules/cjs/loader:1142:10)
    at resolveForCJSWithHooks (node:internal/modules/cjs/loader:1169:12)
    at Module._load (node:internal/modules/cjs/loader:1341:5)
    at wrapModuleLoad (node:internal/modules/cjs/loader:261:19)
    at Module.executeUserEntryPoint [as runMain] (node:internal/modules/run_main:154:5)
    at node:internal/main/run_main_module:33:47 {
  code: 'MODULE_NOT_FOUND',
  requireStack: []
}

Node.js v24.21.0
```

### adopt-dotdot

Expected (recorded before run): exit 2 refusal, zero bytes/mtime changes; refuse noncanonical ../ rather than guess; frozen script absent => MODULE_NOT_FOUND exit 1 (blocked)

```sh
# cwd: /fast/scratch/hyaku/kumitate-r76/K76SentinelBoundary/fixtures/adopt-dotdot
node /fast/scratch/hyaku/kumitate-r76/K76SentinelBoundary/lane/scripts/spotcheck-adopt.mjs --adopt corpus/lessons/../lessons/round-75-verifier-spotcheck.md
```

Exit: `1`.

```text
node:internal/modules/cjs/loader:1568
  throw err;
  ^

Error: Cannot find module '/fast/scratch/hyaku/kumitate-r76/K76SentinelBoundary/lane/scripts/spotcheck-adopt.mjs'
    at Module._resolveFilename (node:internal/modules/cjs/loader:1564:15)
    at wrapResolveFilename (node:internal/modules/cjs/loader:1118:27)
    at defaultResolveImplForCJSLoading (node:internal/modules/cjs/loader:1142:10)
    at resolveForCJSWithHooks (node:internal/modules/cjs/loader:1169:12)
    at Module._load (node:internal/modules/cjs/loader:1341:5)
    at wrapModuleLoad (node:internal/modules/cjs/loader:261:19)
    at Module.executeUserEntryPoint [as runMain] (node:internal/modules/run_main:154:5)
    at node:internal/main/run_main_module:33:47 {
  code: 'MODULE_NOT_FOUND',
  requireStack: []
}

Node.js v24.21.0
```

### adopt-duplicate-row

Expected (recorded before run): exit 2 refusal, zero bytes/mtime changes; duplicate ambiguity must refuse; frozen script absent => MODULE_NOT_FOUND exit 1 (blocked)

```sh
# cwd: /fast/scratch/hyaku/kumitate-r76/K76SentinelBoundary/fixtures/adopt-duplicate-row
node /fast/scratch/hyaku/kumitate-r76/K76SentinelBoundary/lane/scripts/spotcheck-adopt.mjs --adopt corpus/lessons/round-75-verifier-spotcheck.md
```

Exit: `1`.

```text
node:internal/modules/cjs/loader:1568
  throw err;
  ^

Error: Cannot find module '/fast/scratch/hyaku/kumitate-r76/K76SentinelBoundary/lane/scripts/spotcheck-adopt.mjs'
    at Module._resolveFilename (node:internal/modules/cjs/loader:1564:15)
    at wrapResolveFilename (node:internal/modules/cjs/loader:1118:27)
    at defaultResolveImplForCJSLoading (node:internal/modules/cjs/loader:1142:10)
    at resolveForCJSWithHooks (node:internal/modules/cjs/loader:1169:12)
    at Module._load (node:internal/modules/cjs/loader:1341:5)
    at wrapModuleLoad (node:internal/modules/cjs/loader:261:19)
    at Module.executeUserEntryPoint [as runMain] (node:internal/modules/run_main:154:5)
    at node:internal/main/run_main_module:33:47 {
  code: 'MODULE_NOT_FOUND',
  requireStack: []
}

Node.js v24.21.0
```

### adopt-readonly-pin

Expected (recorded before run): exit 2 refusal, zero bytes/mtime changes; cannot complete both sides, zero partial README write; frozen script absent => MODULE_NOT_FOUND exit 1 (blocked)

```sh
# cwd: /fast/scratch/hyaku/kumitate-r76/K76SentinelBoundary/fixtures/adopt-readonly-pin
node /fast/scratch/hyaku/kumitate-r76/K76SentinelBoundary/lane/scripts/spotcheck-adopt.mjs --adopt corpus/lessons/round-75-verifier-spotcheck.md
```

Exit: `1`.

```text
node:internal/modules/cjs/loader:1568
  throw err;
  ^

Error: Cannot find module '/fast/scratch/hyaku/kumitate-r76/K76SentinelBoundary/lane/scripts/spotcheck-adopt.mjs'
    at Module._resolveFilename (node:internal/modules/cjs/loader:1564:15)
    at wrapResolveFilename (node:internal/modules/cjs/loader:1118:27)
    at defaultResolveImplForCJSLoading (node:internal/modules/cjs/loader:1142:10)
    at resolveForCJSWithHooks (node:internal/modules/cjs/loader:1169:12)
    at Module._load (node:internal/modules/cjs/loader:1341:5)
    at wrapModuleLoad (node:internal/modules/cjs/loader:261:19)
    at Module.executeUserEntryPoint [as runMain] (node:internal/modules/run_main:154:5)
    at node:internal/main/run_main_module:33:47 {
  code: 'MODULE_NOT_FOUND',
  requireStack: []
}

Node.js v24.21.0
```

### adopt-scope-disguise

Expected (recorded before run): exit 2 refusal, zero bytes/mtime changes; reject symlink, not filename-only adoption; frozen script absent => MODULE_NOT_FOUND exit 1 (blocked)

```sh
# cwd: /fast/scratch/hyaku/kumitate-r76/K76SentinelBoundary/fixtures/adopt-scope-disguise
node /fast/scratch/hyaku/kumitate-r76/K76SentinelBoundary/lane/scripts/spotcheck-adopt.mjs --adopt corpus/lessons/round-12-verifier-spotcheck.md
```

Exit: `1`.

```text
node:internal/modules/cjs/loader:1568
  throw err;
  ^

Error: Cannot find module '/fast/scratch/hyaku/kumitate-r76/K76SentinelBoundary/lane/scripts/spotcheck-adopt.mjs'
    at Module._resolveFilename (node:internal/modules/cjs/loader:1564:15)
    at wrapResolveFilename (node:internal/modules/cjs/loader:1118:27)
    at defaultResolveImplForCJSLoading (node:internal/modules/cjs/loader:1142:10)
    at resolveForCJSWithHooks (node:internal/modules/cjs/loader:1169:12)
    at Module._load (node:internal/modules/cjs/loader:1341:5)
    at wrapModuleLoad (node:internal/modules/cjs/loader:261:19)
    at Module.executeUserEntryPoint [as runMain] (node:internal/modules/run_main:154:5)
    at node:internal/main/run_main_module:33:47 {
  code: 'MODULE_NOT_FOUND',
  requireStack: []
}

Node.js v24.21.0
```

### adopt-symlink

Expected (recorded before run): exit 2 refusal, zero bytes/mtime changes; reject symlink, not filename-only adoption; frozen script absent => MODULE_NOT_FOUND exit 1 (blocked)

```sh
# cwd: /fast/scratch/hyaku/kumitate-r76/K76SentinelBoundary/fixtures/adopt-symlink
node /fast/scratch/hyaku/kumitate-r76/K76SentinelBoundary/lane/scripts/spotcheck-adopt.mjs --adopt corpus/lessons/round-12-verifier-spotcheck.md
```

Exit: `1`.

```text
node:internal/modules/cjs/loader:1568
  throw err;
  ^

Error: Cannot find module '/fast/scratch/hyaku/kumitate-r76/K76SentinelBoundary/lane/scripts/spotcheck-adopt.mjs'
    at Module._resolveFilename (node:internal/modules/cjs/loader:1564:15)
    at wrapResolveFilename (node:internal/modules/cjs/loader:1118:27)
    at defaultResolveImplForCJSLoading (node:internal/modules/cjs/loader:1142:10)
    at resolveForCJSWithHooks (node:internal/modules/cjs/loader:1169:12)
    at Module._load (node:internal/modules/cjs/loader:1341:5)
    at wrapModuleLoad (node:internal/modules/cjs/loader:261:19)
    at Module.executeUserEntryPoint [as runMain] (node:internal/modules/run_main:154:5)
    at node:internal/main/run_main_module:33:47 {
  code: 'MODULE_NOT_FOUND',
  requireStack: []
}

Node.js v24.21.0
```

### adopt-trailing-space

Expected (recorded before run): exit 2 refusal, zero bytes/mtime changes; REFUSED_NOT_SPOTCHECK (do not trim); frozen script absent => MODULE_NOT_FOUND exit 1 (blocked)

```sh
# cwd: /fast/scratch/hyaku/kumitate-r76/K76SentinelBoundary/fixtures/adopt-trailing-space
node /fast/scratch/hyaku/kumitate-r76/K76SentinelBoundary/lane/scripts/spotcheck-adopt.mjs --adopt 'corpus/lessons/round-75-verifier-spotcheck.md '
```

Exit: `1`.

```text
node:internal/modules/cjs/loader:1568
  throw err;
  ^

Error: Cannot find module '/fast/scratch/hyaku/kumitate-r76/K76SentinelBoundary/lane/scripts/spotcheck-adopt.mjs'
    at Module._resolveFilename (node:internal/modules/cjs/loader:1564:15)
    at wrapResolveFilename (node:internal/modules/cjs/loader:1118:27)
    at defaultResolveImplForCJSLoading (node:internal/modules/cjs/loader:1142:10)
    at resolveForCJSWithHooks (node:internal/modules/cjs/loader:1169:12)
    at Module._load (node:internal/modules/cjs/loader:1341:5)
    at wrapModuleLoad (node:internal/modules/cjs/loader:261:19)
    at Module.executeUserEntryPoint [as runMain] (node:internal/modules/run_main:154:5)
    at node:internal/main/run_main_module:33:47 {
  code: 'MODULE_NOT_FOUND',
  requireStack: []
}

Node.js v24.21.0
```

### adopt-v1-pin

Expected (recorded before run): exit 2 refusal, zero bytes/mtime changes; refuse unsupported pin version; frozen script absent => MODULE_NOT_FOUND exit 1 (blocked)

```sh
# cwd: /fast/scratch/hyaku/kumitate-r76/K76SentinelBoundary/fixtures/adopt-v1-pin
node /fast/scratch/hyaku/kumitate-r76/K76SentinelBoundary/lane/scripts/spotcheck-adopt.mjs --adopt corpus/lessons/round-75-verifier-spotcheck.md
```

Exit: `1`.

```text
node:internal/modules/cjs/loader:1568
  throw err;
  ^

Error: Cannot find module '/fast/scratch/hyaku/kumitate-r76/K76SentinelBoundary/lane/scripts/spotcheck-adopt.mjs'
    at Module._resolveFilename (node:internal/modules/cjs/loader:1564:15)
    at wrapResolveFilename (node:internal/modules/cjs/loader:1118:27)
    at defaultResolveImplForCJSLoading (node:internal/modules/cjs/loader:1142:10)
    at resolveForCJSWithHooks (node:internal/modules/cjs/loader:1169:12)
    at Module._load (node:internal/modules/cjs/loader:1341:5)
    at wrapModuleLoad (node:internal/modules/cjs/loader:261:19)
    at Module.executeUserEntryPoint [as runMain] (node:internal/modules/run_main:154:5)
    at node:internal/main/run_main_module:33:47 {
  code: 'MODULE_NOT_FOUND',
  requireStack: []
}

Node.js v24.21.0
```

### census-member-fifo

Expected (recorded before run): exit 1 KIND agent.db want=file got=other; returns promptly without FIFO read

```sh
# cwd: /fast/scratch/hyaku/kumitate-r76/K76SentinelBoundary/lane
node /fast/scratch/hyaku/kumitate-r76/K76SentinelBoundary/lane/scripts/omp-census.mjs --root /fast/scratch/hyaku/kumitate-r76/K76SentinelBoundary/fixtures/root-fifo --self /fast/scratch/hyaku/kumitate-r76/K76SentinelBoundary/lane
```

Exit: `1`.

```text
INFO RULES.md absent
INFO agents absent
INFO blobs absent
INFO cache absent
INFO config.yml absent
INFO custom-session-files absent
INFO history.db absent
INFO hooks absent
INFO kimi-device-id absent
INFO last-changelog-version absent
INFO lsp.json absent
INFO mcp.json absent
INFO mcp.json.rea.backup absent
INFO models.db absent
INFO models.yml absent
INFO predict absent
INFO sessions absent
INFO skill-descriptions.db absent
INFO terminal-sessions absent
INFO themes absent
INFO tools absent
INFO commands absent
INFO prompts absent
INFO memories absent
INFO extensions absent
INFO chain agent-pre-restore has no generation
INFO chain agent-recovered has no generation
INFO chain history-corrupt has no generation
INFO chain agent-corrupt has no generation
INFO chain mcp-pre-disable has no generation
INFO chain mcp-rea-backup-recovery has no generation
INFO chain config-pre has no generation
INFO chain agent-pre-named has no generation
INFO chain models-corrupt has no generation
KIND agent.db want=file got=other
OMP_CENSUS: DRIFT (root=/fast/scratch/hyaku/kumitate-r76/K76SentinelBoundary/fixtures/root-fifo entries=1 findings=1)
```

### census-note-comment

Expected (recorded before run): exit 1 NOTE_UNBOUND for all declared names

```sh
# cwd: /fast/scratch/hyaku/kumitate-r76/K76SentinelBoundary/lane
node /fast/scratch/hyaku/kumitate-r76/K76SentinelBoundary/lane/scripts/omp-census.mjs --self /fast/scratch/hyaku/kumitate-r76/K76SentinelBoundary/fixtures/self-comment --root /fast/scratch/hyaku/kumitate-r76/K76SentinelBoundary/fixtures/root-clean
```

Exit: `1`.

```text
INFO agent.db absent
INFO agents absent
INFO blobs absent
INFO cache absent
INFO config.yml absent
INFO custom-session-files absent
INFO history.db absent
INFO hooks absent
INFO kimi-device-id absent
INFO last-changelog-version absent
INFO lsp.json absent
INFO mcp.json absent
INFO mcp.json.rea.backup absent
INFO models.db absent
INFO models.yml absent
INFO predict absent
INFO sessions absent
INFO skill-descriptions.db absent
INFO terminal-sessions absent
INFO themes absent
INFO tools absent
INFO commands absent
INFO prompts absent
INFO memories absent
INFO extensions absent
INFO chain agent-pre-restore has no generation
INFO chain agent-recovered has no generation
INFO chain history-corrupt has no generation
INFO chain agent-corrupt has no generation
INFO chain mcp-pre-disable has no generation
INFO chain mcp-rea-backup-recovery has no generation
INFO chain config-pre has no generation
INFO chain agent-pre-named has no generation
INFO chain models-corrupt has no generation
NOTE_UNBOUND RULES.md
NOTE_UNBOUND agent.db
NOTE_UNBOUND agents
NOTE_UNBOUND blobs
NOTE_UNBOUND cache
NOTE_UNBOUND config.yml
NOTE_UNBOUND custom-session-files
NOTE_UNBOUND history.db
NOTE_UNBOUND hooks
NOTE_UNBOUND kimi-device-id
NOTE_UNBOUND last-changelog-version
NOTE_UNBOUND lsp.json
NOTE_UNBOUND mcp.json
NOTE_UNBOUND mcp.json.rea.backup
NOTE_UNBOUND models.db
NOTE_UNBOUND models.yml
NOTE_UNBOUND predict
NOTE_UNBOUND sessions
NOTE_UNBOUND skill-descriptions.db
NOTE_UNBOUND terminal-sessions
NOTE_UNBOUND themes
NOTE_UNBOUND tools
NOTE_UNBOUND commands
NOTE_UNBOUND prompts
NOTE_UNBOUND memories
NOTE_UNBOUND extensions
NOTE_UNBOUND agent-pre-restore
NOTE_UNBOUND agent-recovered
NOTE_UNBOUND history-corrupt
NOTE_UNBOUND agent-corrupt
NOTE_UNBOUND mcp-pre-disable
NOTE_UNBOUND mcp-rea-backup-recovery
NOTE_UNBOUND config-pre
NOTE_UNBOUND agent-pre-named
NOTE_UNBOUND models-corrupt
OMP_CENSUS: DRIFT (root=/fast/scratch/hyaku/kumitate-r76/K76SentinelBoundary/fixtures/root-clean entries=1 findings=35)
```

### census-note-empty

Expected (recorded before run): exit 1 NOTE_UNBOUND for all declared names

```sh
# cwd: /fast/scratch/hyaku/kumitate-r76/K76SentinelBoundary/lane
node /fast/scratch/hyaku/kumitate-r76/K76SentinelBoundary/lane/scripts/omp-census.mjs --self /fast/scratch/hyaku/kumitate-r76/K76SentinelBoundary/fixtures/self-empty --root /fast/scratch/hyaku/kumitate-r76/K76SentinelBoundary/fixtures/root-clean
```

Exit: `1`.

```text
INFO agent.db absent
INFO agents absent
INFO blobs absent
INFO cache absent
INFO config.yml absent
INFO custom-session-files absent
INFO history.db absent
INFO hooks absent
INFO kimi-device-id absent
INFO last-changelog-version absent
INFO lsp.json absent
INFO mcp.json absent
INFO mcp.json.rea.backup absent
INFO models.db absent
INFO models.yml absent
INFO predict absent
INFO sessions absent
INFO skill-descriptions.db absent
INFO terminal-sessions absent
INFO themes absent
INFO tools absent
INFO commands absent
INFO prompts absent
INFO memories absent
INFO extensions absent
INFO chain agent-pre-restore has no generation
INFO chain agent-recovered has no generation
INFO chain history-corrupt has no generation
INFO chain agent-corrupt has no generation
INFO chain mcp-pre-disable has no generation
INFO chain mcp-rea-backup-recovery has no generation
INFO chain config-pre has no generation
INFO chain agent-pre-named has no generation
INFO chain models-corrupt has no generation
NOTE_UNBOUND RULES.md
NOTE_UNBOUND agent.db
NOTE_UNBOUND agents
NOTE_UNBOUND blobs
NOTE_UNBOUND cache
NOTE_UNBOUND config.yml
NOTE_UNBOUND custom-session-files
NOTE_UNBOUND history.db
NOTE_UNBOUND hooks
NOTE_UNBOUND kimi-device-id
NOTE_UNBOUND last-changelog-version
NOTE_UNBOUND lsp.json
NOTE_UNBOUND mcp.json
NOTE_UNBOUND mcp.json.rea.backup
NOTE_UNBOUND models.db
NOTE_UNBOUND models.yml
NOTE_UNBOUND predict
NOTE_UNBOUND sessions
NOTE_UNBOUND skill-descriptions.db
NOTE_UNBOUND terminal-sessions
NOTE_UNBOUND themes
NOTE_UNBOUND tools
NOTE_UNBOUND commands
NOTE_UNBOUND prompts
NOTE_UNBOUND memories
NOTE_UNBOUND extensions
NOTE_UNBOUND agent-pre-restore
NOTE_UNBOUND agent-recovered
NOTE_UNBOUND history-corrupt
NOTE_UNBOUND agent-corrupt
NOTE_UNBOUND mcp-pre-disable
NOTE_UNBOUND mcp-rea-backup-recovery
NOTE_UNBOUND config-pre
NOTE_UNBOUND agent-pre-named
NOTE_UNBOUND models-corrupt
OMP_CENSUS: DRIFT (root=/fast/scratch/hyaku/kumitate-r76/K76SentinelBoundary/fixtures/root-clean entries=1 findings=35)
```

### census-note-fence

Expected (recorded before run): exit 0 CLEAN bound=35/35 (visible fenced tokens bind)

```sh
# cwd: /fast/scratch/hyaku/kumitate-r76/K76SentinelBoundary/lane
node /fast/scratch/hyaku/kumitate-r76/K76SentinelBoundary/lane/scripts/omp-census.mjs --self /fast/scratch/hyaku/kumitate-r76/K76SentinelBoundary/fixtures/self-fence --root /fast/scratch/hyaku/kumitate-r76/K76SentinelBoundary/fixtures/root-clean
```

Exit: `0`.

```text
INFO agent.db absent
INFO agents absent
INFO blobs absent
INFO cache absent
INFO config.yml absent
INFO custom-session-files absent
INFO history.db absent
INFO hooks absent
INFO kimi-device-id absent
INFO last-changelog-version absent
INFO lsp.json absent
INFO mcp.json absent
INFO mcp.json.rea.backup absent
INFO models.db absent
INFO models.yml absent
INFO predict absent
INFO sessions absent
INFO skill-descriptions.db absent
INFO terminal-sessions absent
INFO themes absent
INFO tools absent
INFO commands absent
INFO prompts absent
INFO memories absent
INFO extensions absent
INFO chain agent-pre-restore has no generation
INFO chain agent-recovered has no generation
INFO chain history-corrupt has no generation
INFO chain agent-corrupt has no generation
INFO chain mcp-pre-disable has no generation
INFO chain mcp-rea-backup-recovery has no generation
INFO chain config-pre has no generation
INFO chain agent-pre-named has no generation
INFO chain models-corrupt has no generation
OMP_CENSUS: CLEAN (root=/fast/scratch/hyaku/kumitate-r76/K76SentinelBoundary/fixtures/root-clean entries=1 findings=0 bound=35/35)
```

### census-note-removed

Expected (recorded before run): exit 2 NOTE_MISSING

```sh
# cwd: /fast/scratch/hyaku/kumitate-r76/K76SentinelBoundary/lane
node /fast/scratch/hyaku/kumitate-r76/K76SentinelBoundary/lane/scripts/omp-census.mjs --self /fast/scratch/hyaku/kumitate-r76/K76SentinelBoundary/fixtures/self-removed --root /fast/scratch/hyaku/kumitate-r76/K76SentinelBoundary/fixtures/root-clean
```

Exit: `2`.

```text
NOTE_MISSING /fast/scratch/hyaku/kumitate-r76/K76SentinelBoundary/fixtures/self-removed/corpus/knowledge/omp-agent-root.md reason=ENOENT
```

### census-root-empty

Expected (recorded before run): exit 1 EMPTY root holds no member

```sh
# cwd: /fast/scratch/hyaku/kumitate-r76/K76SentinelBoundary/lane
node /fast/scratch/hyaku/kumitate-r76/K76SentinelBoundary/lane/scripts/omp-census.mjs --root /fast/scratch/hyaku/kumitate-r76/K76SentinelBoundary/fixtures/root-empty --self /fast/scratch/hyaku/kumitate-r76/K76SentinelBoundary/lane
```

Exit: `1`.

```text
INFO RULES.md absent
INFO agent.db absent
INFO agents absent
INFO blobs absent
INFO cache absent
INFO config.yml absent
INFO custom-session-files absent
INFO history.db absent
INFO hooks absent
INFO kimi-device-id absent
INFO last-changelog-version absent
INFO lsp.json absent
INFO mcp.json absent
INFO mcp.json.rea.backup absent
INFO models.db absent
INFO models.yml absent
INFO predict absent
INFO sessions absent
INFO skill-descriptions.db absent
INFO terminal-sessions absent
INFO themes absent
INFO tools absent
INFO commands absent
INFO prompts absent
INFO memories absent
INFO extensions absent
INFO chain agent-pre-restore has no generation
INFO chain agent-recovered has no generation
INFO chain history-corrupt has no generation
INFO chain agent-corrupt has no generation
INFO chain mcp-pre-disable has no generation
INFO chain mcp-rea-backup-recovery has no generation
INFO chain config-pre has no generation
INFO chain agent-pre-named has no generation
INFO chain models-corrupt has no generation
EMPTY root holds no member
OMP_CENSUS: DRIFT (root=/fast/scratch/hyaku/kumitate-r76/K76SentinelBoundary/fixtures/root-empty entries=0 findings=1)
```

### census-root-file

Expected (recorded before run): exit 2 OMP_CENSUS: ERROR reason=ENOTDIR

```sh
# cwd: /fast/scratch/hyaku/kumitate-r76/K76SentinelBoundary/lane
node /fast/scratch/hyaku/kumitate-r76/K76SentinelBoundary/lane/scripts/omp-census.mjs --root /fast/scratch/hyaku/kumitate-r76/K76SentinelBoundary/fixtures/root-file --self /fast/scratch/hyaku/kumitate-r76/K76SentinelBoundary/lane
```

Exit: `2`.

```text
OMP_CENSUS: ERROR root=/fast/scratch/hyaku/kumitate-r76/K76SentinelBoundary/fixtures/root-file reason=ENOTDIR
```

### census-root-newline-backslash

Expected (recorded before run): exit 1 UNLISTED; no member content reads

```sh
# cwd: /fast/scratch/hyaku/kumitate-r76/K76SentinelBoundary/lane
node /fast/scratch/hyaku/kumitate-r76/K76SentinelBoundary/lane/scripts/omp-census.mjs --root /fast/scratch/hyaku/kumitate-r76/K76SentinelBoundary/fixtures/root-odd --self /fast/scratch/hyaku/kumitate-r76/K76SentinelBoundary/lane
```

Exit: `1`.

```text
INFO RULES.md absent
INFO agent.db absent
INFO agents absent
INFO blobs absent
INFO cache absent
INFO config.yml absent
INFO custom-session-files absent
INFO history.db absent
INFO hooks absent
INFO kimi-device-id absent
INFO last-changelog-version absent
INFO lsp.json absent
INFO mcp.json absent
INFO mcp.json.rea.backup absent
INFO models.db absent
INFO models.yml absent
INFO predict absent
INFO sessions absent
INFO skill-descriptions.db absent
INFO terminal-sessions absent
INFO themes absent
INFO tools absent
INFO commands absent
INFO prompts absent
INFO memories absent
INFO extensions absent
INFO chain agent-pre-restore has no generation
INFO chain agent-recovered has no generation
INFO chain history-corrupt has no generation
INFO chain agent-corrupt has no generation
INFO chain mcp-pre-disable has no generation
INFO chain mcp-rea-backup-recovery has no generation
INFO chain config-pre has no generation
INFO chain agent-pre-named has no generation
INFO chain models-corrupt has no generation
UNLISTED odd
back\slash
OMP_CENSUS: DRIFT (root=/fast/scratch/hyaku/kumitate-r76/K76SentinelBoundary/fixtures/root-odd entries=1 findings=1)
```

### census-root-symlink

Expected (recorded before run): exit 2 OMP_CENSUS: ERROR reason=ENOTDIR

```sh
# cwd: /fast/scratch/hyaku/kumitate-r76/K76SentinelBoundary/lane
node /fast/scratch/hyaku/kumitate-r76/K76SentinelBoundary/lane/scripts/omp-census.mjs --root /fast/scratch/hyaku/kumitate-r76/K76SentinelBoundary/fixtures/root-link --self /fast/scratch/hyaku/kumitate-r76/K76SentinelBoundary/lane
```

Exit: `2`.

```text
OMP_CENSUS: ERROR root=/fast/scratch/hyaku/kumitate-r76/K76SentinelBoundary/fixtures/root-link reason=ENOTDIR
```

### census-root-unreadable

Expected (recorded before run): exit 2 OMP_CENSUS: ERROR reason=EACCES

```sh
# cwd: /fast/scratch/hyaku/kumitate-r76/K76SentinelBoundary/lane
node /fast/scratch/hyaku/kumitate-r76/K76SentinelBoundary/lane/scripts/omp-census.mjs --root /fast/scratch/hyaku/kumitate-r76/K76SentinelBoundary/fixtures/root-unreadable --self /fast/scratch/hyaku/kumitate-r76/K76SentinelBoundary/lane
```

Exit: `2`.

```text
OMP_CENSUS: ERROR root=/fast/scratch/hyaku/kumitate-r76/K76SentinelBoundary/fixtures/root-unreadable reason=EACCES
```

### proxy-note-comment

Expected (recorded before run): frozen proxy has no O arm: no OMP_NOTE_MISSING and no coverage_omp term; other existing drift may remain

```sh
# cwd: /fast/scratch/hyaku/kumitate-r76/K76SentinelBoundary/lane
node /fast/scratch/hyaku/kumitate-r76/K76SentinelBoundary/lane/scripts/proxy-check.mjs --self /fast/scratch/hyaku/kumitate-r76/K76SentinelBoundary/fixtures/self-comment --src /fast/scratch/hyaku/kumitate-r76/K76SentinelBoundary/lane --kimi-root /fast/scratch/hyaku/kumitate-r76/K76SentinelBoundary/fixtures/kimi --json
```

Exit: `1`.

```text
{
  "contract": "kumitate-proxy-v1",
  "mode": "check",
  "ok": false,
  "verdict": "DRIFT",
  "exitCode": 1,
  "self": "/fast/scratch/hyaku/kumitate-r76/K76SentinelBoundary/fixtures/self-comment",
  "scorecard": "/fast/scratch/hyaku/kumitate-r76/K76SentinelBoundary/fixtures/self-comment/SCORECARD.md",
  "src": "/fast/scratch/hyaku/kumitate-r76/K76SentinelBoundary/lane",
  "pin": null,
  "srcRev": null,
  "kimiRoot": "/fast/scratch/hyaku/kumitate-r76/K76SentinelBoundary/fixtures/kimi",
  "strict": false,
  "terms": {
    "A": 0,
    "C": 33,
    "C1": 19,
    "C1_total": 19,
    "C2": 181,
    "C2_total": 2,
    "operability": 9,
    "coverage": 905,
    "S_members": 29,
    "S_sections": 0,
    "R_members": 0,
    "R_sections": 0,
    "coverage_script": 0,
    "coverage_runtime": 0,
    "C1k": 5,
    "C1k_total": 5,
    "K_members": 0,
    "K_sections": 0,
    "coverage_kimi": 0,
    "pins": {
      "pin.cite-check": {
        "file": "scripts/cite-check.mjs",
        "declared": "7484274fff4c540f39d6df829708c86c78f25e803a4657ab4d7bae6d025acdf2",
        "computed": null,
        "match": false
      },
      "pin.surface-probe": {
        "file": "scripts/surface-probe.mjs",
        "declared": "79081e1b3c661590f4fafe5d2343993d966873cb4422b7b5462434366a084d35",
        "computed": null,
        "match": false
      },
      "pin.round-gate": {
        "file": "scripts/round-gate.mjs",
        "declared": "09d4d79238f44dd74a0fa727c8f6b193c3fa87200c02340e2f4b3dcc6b354594",
        "computed": null,
        "match": false
      },
      "pin.proxy-check": {
        "file": "scripts/proxy-check.mjs",
        "declared": "92465ddc7ad57111e5a946f83af2788adfd63deb28ab6af49f13fde454eabf2e",
        "computed": null,
        "match": false
      },
      "pin.claims-check": {
        "file": "scripts/claims-check.mjs",
        "declared": "de3433b5465a2f2d22c538537e3f9c67e37dc2605888b2ff77adc49264abfe14",
        "computed": null,
        "match": false
      },
      "pin.kimi-census": {
        "file": "scripts/kimi-census.mjs",
        "declared": "73bea81ccdb7cf27234636d9d4c84af2fc7a8a9a25c201bf42c783d7da9dc3e1",
        "computed": null,
        "match": false
      }
    },
    "pinsMatched": 0,
    "pinsTotal": 6,
    "declared": {
      "A": "833",
      "C": "33",
      "C1": "19",
      "C1_total": "19",
      "C2": "181",
      "C2_total": "181",
      "S_members": "88",
      "S_sections": "88",
      "R_members": "92",
      "R_sections": "92",
      "coverage_script": "10",
      "coverage_runtime": "10",
      "C1k": "5",
      "C1k_total": "5",
      "K_members": "55",
      "K_sections": "55",
      "coverage_kimi": "10",
      "pin.cite-check": "7484274fff4c540f39d6df829708c86c78f25e803a4657ab4d7bae6d025acdf2",
      "pin.surface-probe": "79081e1b3c661590f4fafe5d2343993d966873cb4422b7b5462434366a084d35",
      "pin.round-gate": "09d4d79238f44dd74a0fa727c8f6b193c3fa87200c02340e2f4b3dcc6b354594",
      "pin.proxy-check": "92465ddc7ad57111e5a946f83af2788adfd63deb28ab6af49f13fde454eabf2e",
      "pin.claims-check": "de3433b5465a2f2d22c538537e3f9c67e37dc2605888b2ff77adc49264abfe14",
      "pin.kimi-census": "73bea81ccdb7cf27234636d9d4c84af2fc7a8a9a25c201bf42c783d7da9dc3e1"
    },
    "stanzaLine": 287
  },
  "findings": [
    {
      "severity": "error",
      "kind": "A_DRIFT",
      "term": "A",
      "declared": 833,
      "computed": 0,
      "delta": "-833",
      "detail": "A: declared=833 computed=0 delta=-833"
    },
    {
      "severity": "error",
      "kind": "C2_TOTAL_DRIFT",
      "term": "C2_total",
      "declared": 181,
      "computed": 2,
      "delta": "-179",
      "detail": "C2_total: declared=181 computed=2 delta=-179"
    },
    {
      "severity": "error",
      "kind": "S_MEMBERS_DRIFT",
      "term": "S_members",
      "declared": 88,
      "computed": 29,
      "delta": "-59",
      "detail": "S_members: declared=88 computed=29 delta=-59"
    },
    {
      "severity": "error",
      "kind": "S_SECTIONS_DRIFT",
      "term": "S_sections",
      "declared": 88,
      "computed": 0,
      "delta": "-88",
      "detail": "S_sections: declared=88 computed=0 delta=-88"
    },
    {
      "severity": "error",
      "kind": "R_MEMBERS_DRIFT",
      "term": "R_members",
      "declared": 92,
      "computed": 0,
      "delta": "-92",
      "detail": "R_members: declared=92 computed=0 delta=-92"
    },
    {
      "severity": "error",
      "kind": "R_SECTIONS_DRIFT",
      "term": "R_sections",
      "declared": 92,
      "computed": 0,
      "delta": "-92",
      "detail": "R_sections: declared=92 computed=0 delta=-92"
    },
    {
      "severity": "error",
      "kind": "COVERAGE_SCRIPT_DRIFT",
      "term": "coverage_script",
      "declared": 10,
      "computed": 0,
      "delta": "-10",
      "detail": "coverage_script: declared=10 computed=0 delta=-10"
    },
    {
      "severity": "error",
      "kind": "COVERAGE_RUNTIME_DRIFT",
      "term": "coverage_runtime",
      "declared": 10,
      "computed": 0,
      "delta": "-10",
      "detail": "coverage_runtime: declared=10 computed=0 delta=-10"
    },
    {
      "severity": "error",
      "kind": "K_MEMBERS_DRIFT",
      "term": "K_members",
      "declared": 55,
      "computed": 0,
      "delta": "-55",
      "detail": "K_members: declared=55 computed=0 delta=-55"
    },
    {
      "severity": "error",
      "kind": "K_SECTIONS_DRIFT",
      "term": "K_sections",
      "declared": 55,
      "computed": 0,
      "delta": "-55",
      "detail": "K_sections: declared=55 computed=0 delta=-55"
    },
    {
      "severity": "error",
      "kind": "COVERAGE_KIMI_DRIFT",
      "term": "coverage_kimi",
      "declared": 10,
      "computed": 0,
      "delta": "-10",
      "detail": "coverage_kimi: declared=10 computed=0 delta=-10"
    },
    {
      "severity": "error",
      "kind": "PIN_DRIFT",
      "term": "pin.cite-check",
      "declared": "7484274fff4c540f39d6df829708c86c78f25e803a4657ab4d7bae6d025acdf2",
      "computed": "absent (scripts/cite-check.mjs is absent)",
      "detail": "pin.cite-check: declared=7484274fff4c540f39d6df829708c86c78f25e803a4657ab4d7bae6d025acdf2 computed=absent (scripts/cite-check.mjs is absent)"
    },
    {
      "severity": "error",
      "kind": "PIN_DRIFT",
      "term": "pin.surface-probe",
      "declared": "79081e1b3c661590f4fafe5d2343993d966873cb4422b7b5462434366a084d35",
      "computed": "absent (scripts/surface-probe.mjs is absent)",
      "detail": "pin.surface-probe: declared=79081e1b3c661590f4fafe5d2343993d966873cb4422b7b5462434366a084d35 computed=absent (scripts/surface-probe.mjs is absent)"
    },
    {
      "severity": "error",
      "kind": "PIN_DRIFT",
      "term": "pin.round-gate",
      "declared": "09d4d79238f44dd74a0fa727c8f6b193c3fa87200c02340e2f4b3dcc6b354594",
      "computed": "absent (scripts/round-gate.mjs is absent)",
      "detail": "pin.round-gate: declared=09d4d79238f44dd74a0fa727c8f6b193c3fa87200c02340e2f4b3dcc6b354594 computed=absent (scripts/round-gate.mjs is absent)"
    },
    {
      "severity": "error",
      "kind": "PIN_DRIFT",
      "term": "pin.proxy-check",
      "declared": "92465ddc7ad57111e5a946f83af2788adfd63deb28ab6af49f13fde454eabf2e",
      "computed": "absent (scripts/proxy-check.mjs is absent)",
      "detail": "pin.proxy-check: declared=92465ddc7ad57111e5a946f83af2788adfd63deb28ab6af49f13fde454eabf2e computed=absent (scripts/proxy-check.mjs is absent)"
    },
    {
      "severity": "error",
      "kind": "PIN_DRIFT",
      "term": "pin.claims-check",
      "declared": "de3433b5465a2f2d22c538537e3f9c67e37dc2605888b2ff77adc49264abfe14",
      "computed": "absent (scripts/claims-check.mjs is absent)",
      "detail": "pin.claims-check: declared=de3433b5465a2f2d22c538537e3f9c67e37dc2605888b2ff77adc49264abfe14 computed=absent (scripts/claims-check.mjs is absent)"
    },
    {
      "severity": "error",
      "kind": "PIN_DRIFT",
      "term": "pin.kimi-census",
      "declared": "73bea81ccdb7cf27234636d9d4c84af2fc7a8a9a25c201bf42c783d7da9dc3e1",
      "computed": "absent (scripts/kimi-census.mjs is absent)",
      "detail": "pin.kimi-census: declared=73bea81ccdb7cf27234636d9d4c84af2fc7a8a9a25c201bf42c783d7da9dc3e1 computed=absent (scripts/kimi-census.mjs is absent)"
    },
    {
      "severity": "error",
      "kind": "GATE_PIN_DRIFT",
      "term": "pin.anchor-truth",
      "declared": "43c37865a5b3ea5912c5be0e1243fa222642b6be0ef6a1103ee03a287614b23d",
      "computed": "absent (scripts/anchor-truth.mjs is absent)",
      "detail": "pin.anchor-truth: declared=43c37865a5b3ea5912c5be0e1243fa222642b6be0ef6a1103ee03a287614b23d computed=absent (scripts/anchor-truth.mjs is absent)"
    },
    {
      "severity": "error",
      "kind": "GATE_PIN_DRIFT",
      "term": "pin.sources-check",
      "declared": "5402b2103bb9e3ccd76f7bf3f5880f2249f809c78cee4766a75e3cf30b69f434",
      "computed": "absent (scripts/sources-check.mjs is absent)",
      "detail": "pin.sources-check: declared=5402b2103bb9e3ccd76f7bf3f5880f2249f809c78cee4766a75e3cf30b69f434 computed=absent (scripts/sources-check.mjs is absent)"
    },
    {
      "severity": "error",
      "kind": "GATE_PIN_DRIFT",
      "term": "pin.wave-census",
      "declared": "76447250f9de1f7e9258d0dfe9544feba18d6c8723db37e77e6ca422235f45f4",
      "computed": "absent (scripts/wave-census.mjs is absent)",
      "detail": "pin.wave-census: declared=76447250f9de1f7e9258d0dfe9544feba18d6c8723db37e77e6ca422235f45f4 computed=absent (scripts/wave-census.mjs is absent)"
    },
    {
      "severity": "error",
      "kind": "GATE_PIN_DRIFT",
      "term": "pin.gate-mutants",
      "declared": "177f6cbbd70d7503263d00c77357893658a0e393ac722d43034ebd7e429bb717",
      "computed": "absent (scripts/gate-mutants.mjs is absent)",
      "detail": "pin.gate-mutants: declared=177f6cbbd70d7503263d00c77357893658a0e393ac722d43034ebd7e429bb717 computed=absent (scripts/gate-mutants.mjs is absent)"
    },
    {
      "severity": "error",
      "kind": "GATE_PIN_DRIFT",
      "term": "pin.omp-census",
      "declared": "c7065f9d973d772707ae71d87437e7a4df095bd29fb749de63c27f4512a853ed",
      "computed": "absent (scripts/omp-census.mjs is absent)",
      "detail": "pin.omp-census: declared=c7065f9d973d772707ae71d87437e7a4df095bd29fb749de63c27f4512a853ed computed=absent (scripts/omp-census.mjs is absent)"
    },
    {
      "severity": "error",
      "kind": "GATE_PIN_DRIFT",
      "term": "pin.cap-run",
      "declared": "e1d0a79b0c38a5d1d60ccba37ab7dd0528d1ee63982aae3213e28572a8d754c5",
      "computed": "absent (scripts/cap-run.mjs is absent)",
      "detail": "pin.cap-run: declared=e1d0a79b0c38a5d1d60ccba37ab7dd0528d1ee63982aae3213e28572a8d754c5 computed=absent (scripts/cap-run.mjs is absent)"
    },
    {
      "severity": "error",
      "kind": "GATE_PIN_DRIFT",
      "term": "pin.bind-oracle",
      "declared": "c3929a97c5b24303b1acadb62ebaa4778768585597cf7fc06d2996602ec211e5",
      "computed": "absent (scripts/bind-oracle.mjs is absent)",
      "detail": "pin.bind-oracle: declared=c3929a97c5b24303b1acadb62ebaa4778768585597cf7fc06d2996602ec211e5 computed=absent (scripts/bind-oracle.mjs is absent)"
    },
    {
      "severity": "error",
      "kind": "GATE_PIN_DRIFT",
      "term": "pin.cap-spawn",
      "declared": "1fde43fb7f68992fb5e692188cd9afd3581d1d16c720815adc8d3a1ca3c734d0",
      "computed": "absent (scripts/cap-spawn.mjs is absent)",
      "detail": "pin.cap-spawn: declared=1fde43fb7f68992fb5e692188cd9afd3581d1d16c720815adc8d3a1ca3c734d0 computed=absent (scripts/cap-spawn.mjs is absent)"
    },
    {
      "severity": "error",
      "kind": "GATE_PIN_DRIFT",
      "term": "pin.counter-rerun",
      "declared": "c002523fc39b521f57a3ee86c3ff154e06aea8ccd6738501138460141abc369b",
      "computed": "absent (scripts/counter-rerun.mjs is absent)",
      "detail": "pin.counter-rerun: declared=c002523fc39b521f57a3ee86c3ff154e06aea8ccd6738501138460141abc369b computed=absent (scripts/counter-rerun.mjs is absent)"
    },
    {
      "severity": "error",
      "kind": "GATE_PIN_DRIFT",
      "term": "pin.receipt-attest",
      "declared": "ba5139b1290b204054c043df3140554757116e6fbaf19783b502a24ed1b2ce31",
      "computed": "absent (scripts/receipt-attest.mjs is absent)",
      "detail": "pin.receipt-attest: declared=ba5139b1290b204054c043df3140554757116e6fbaf19783b502a24ed1b2ce31 computed=absent (scripts/receipt-attest.mjs is absent)"
    },
    {
      "severity": "error",
      "kind": "GATE_PIN_DRIFT",
      "term": "pin.counter-pins",
      "declared": "060d5d8662701340da24f483316053be86bed246510c541a0518492e7b29028e",
      "computed": "absent (scripts/counter-pins.mjs is absent)",
      "detail": "pin.counter-pins: declared=060d5d8662701340da24f483316053be86bed246510c541a0518492e7b29028e computed=absent (scripts/counter-pins.mjs is absent)"
    },
    {
      "severity": "error",
      "kind": "GATE_PIN_DRIFT",
      "term": "pin.source-capture",
      "declared": "39bdeb39298672dd3ed81036013de542ad6925587cb84f330ab69de6799d28f5",
      "computed": "absent (scripts/source-capture.mjs is absent)",
      "detail": "pin.source-capture: declared=39bdeb39298672dd3ed81036013de542ad6925587cb84f330ab69de6799d28f5 computed=absent (scripts/source-capture.mjs is absent)"
    },
    {
      "severity": "error",
      "kind": "GATE_PIN_DRIFT",
      "term": "pin.source-dupes",
      "declared": "ead88b22fbd1525d13dd46c67b427041dc331d202a005285adea813c32530d7a",
      "computed": "absent (scripts/source-dupes.mjs is absent)",
      "detail": "pin.source-dupes: declared=ead88b22fbd1525d13dd46c67b427041dc331d202a005285adea813c32530d7a computed=absent (scripts/source-dupes.mjs is absent)"
    },
    {
      "severity": "error",
      "kind": "GATE_PIN_DRIFT",
      "term": "pin.readme-map",
      "declared": "b1c8bf97eb01fdb2ebfd46521c8e805fa2c36f8e10ce9740531162cd0b8ee74e",
      "computed": "absent (scripts/readme-map.mjs is absent)",
      "detail": "pin.readme-map: declared=b1c8bf97eb01fdb2ebfd46521c8e805fa2c36f8e10ce9740531162cd0b8ee74e computed=absent (scripts/readme-map.mjs is absent)"
    },
    {
      "severity": "error",
      "kind": "GATE_PIN_DRIFT",
      "term": "pin.receipt-evidence",
      "declared": "0ea6b66df7dcff4dc9381c688a5182fb1fe2c3be5353df7a52d3c6f2e006972c",
      "computed": "absent (scripts/receipt-evidence.mjs is absent)",
      "detail": "pin.receipt-evidence: declared=0ea6b66df7dcff4dc9381c688a5182fb1fe2c3be5353df7a52d3c6f2e006972c computed=absent (scripts/receipt-evidence.mjs is absent)"
    },
    {
      "severity": "error",
      "kind": "GATE_PIN_DRIFT",
      "term": "pin.cite-sources",
      "declared": "7211be845cd994e6dc3bf1b1ed821a0464d9aa1cce6f4695412095a9fc2921a6",
      "computed": "absent (scripts/cite-sources.mjs is absent)",
      "detail": "pin.cite-sources: declared=7211be845cd994e6dc3bf1b1ed821a0464d9aa1cce6f4695412095a9fc2921a6 computed=absent (scripts/cite-sources.mjs is absent)"
    },
    {
      "severity": "error",
      "kind": "GATE_PIN_DRIFT",
      "term": "pin.dispatch-evidence",
      "declared": "765a7aa3ef6b11f18548da4a91f98c42e07b825229135c30010f092cc1af65cc",
      "computed": "absent (scripts/dispatch-evidence.mjs is absent)",
      "detail": "pin.dispatch-evidence: declared=765a7aa3ef6b11f18548da4a91f98c42e07b825229135c30010f092cc1af65cc computed=absent (scripts/dispatch-evidence.mjs is absent)"
    },
    {
      "severity": "error",
      "kind": "GATE_PIN_DRIFT",
      "term": "pin.make-dispatch-actual",
      "declared": "f0194314e98e87e86eb1329f36411e249911f9a0120aa4feb702562a54bf3dc9",
      "computed": "absent (scripts/make-dispatch-actual.mjs is absent)",
      "detail": "pin.make-dispatch-actual: declared=f0194314e98e87e86eb1329f36411e249911f9a0120aa4feb702562a54bf3dc9 computed=absent (scripts/make-dispatch-actual.mjs is absent)"
    },
    {
      "severity": "error",
      "kind": "GATE_PIN_DRIFT",
      "term": "pin.inline-dispatch-evidence",
      "declared": "9f1978a93deb0001396008f48ceae2f154bf7bdc145fff36721e29ef9ce1e741",
      "computed": "absent (scripts/inline-dispatch-evidence.mjs is absent)",
      "detail": "pin.inline-dispatch-evidence: declared=9f1978a93deb0001396008f48ceae2f154bf7bdc145fff36721e29ef9ce1e741 computed=absent (scripts/inline-dispatch-evidence.mjs is absent)"
    },
    {
      "severity": "error",
      "kind": "GATE_PIN_DRIFT",
      "term": "pin.plan-before-ready",
      "declared": "4d927ce36c6728c13f48fd7e44d30b8982b5570ea020930e24ca07f0250554ab",
      "computed": "absent (scripts/plan-before-ready.sh is absent)",
      "detail": "pin.plan-before-ready: declared=4d927ce36c6728c13f48fd7e44d30b8982b5570ea020930e24ca07f0250554ab computed=absent (scripts/plan-before-ready.sh is absent)"
    },
    {
      "severity": "error",
      "kind": "GATE_PIN_DRIFT",
      "term": "pin.jj-seat-demo",
      "declared": "80d174dba368e71296da65f59d93e60fb5e37673f429e3d832be02681c5b480a",
      "computed": "absent (scripts/jj-seat-demo.sh is absent)",
      "detail": "pin.jj-seat-demo: declared=80d174dba368e71296da65f59d93e60fb5e37673f429e3d832be02681c5b480a computed=absent (scripts/jj-seat-demo.sh is absent)"
    },
    {
      "severity": "error",
      "kind": "GATE_PIN_DRIFT",
      "term": "pin.report-receipt-diff",
      "declared": "23efb0908b9ebe51f158f590c6512be59aa183e5e25f268b5e0340f78f2f8927",
      "computed": "absent (scripts/report-receipt-diff.mjs is absent)",
      "detail": "pin.report-receipt-diff: declared=23efb0908b9ebe51f158f590c6512be59aa183e5e25f268b5e0340f78f2f8927 computed=absent (scripts/report-receipt-diff.mjs is absent)"
    },
    {
      "severity": "error",
      "kind": "GATE_PIN_DRIFT",
      "term": "pin.control-replay",
      "declared": "22bd0e31a74f4a58e3303f145d9f88e2ff89d890f21588b4ae2879d4a0e39dc4",
      "computed": "absent (scripts/control-replay.mjs is absent)",
      "detail": "pin.control-replay: declared=22bd0e31a74f4a58e3303f145d9f88e2ff89d890f21588b4ae2879d4a0e39dc4 computed=absent (scripts/control-replay.mjs is absent)"
    },
    {
      "severity": "error",
      "kind": "GATE_PIN_DRIFT",
      "term": "pin.harm-matrix",
      "declared": "ab123486e2fd753fc2df10d207b2d92a3759838bd3f31370402717de493f7c38",
      "computed": "absent (scripts/harm-matrix.mjs is absent)",
      "detail": "pin.harm-matrix: declared=ab123486e2fd753fc2df10d207b2d92a3759838bd3f31370402717de493f7c38 computed=absent (scripts/harm-matrix.mjs is absent)"
    },
    {
      "severity": "error",
      "kind": "GATE_PIN_DRIFT",
      "term": "pin.routed-ledger",
      "declared": "05aacb5ede6b3389a693bb71c6c1cb74281f8bab9b5bf2309027dd97d83913b1",
      "computed": "absent (scripts/routed-ledger.mjs is absent)",
      "detail": "pin.routed-ledger: declared=05aacb5ede6b3389a693bb71c6c1cb74281f8bab9b5bf2309027dd97d83913b1 computed=absent (scripts/routed-ledger.mjs is absent)"
    },
    {
      "severity": "error",
      "kind": "AXES_DRIFT",
      "term": "coverage",
      "key": "coverage",
      "declared": 10,
      "computed": 905,
      "detail": "coverage: ## Axes row=10 derived=905"
    },
    {
      "severity": "error",
      "kind": "AXES_DRIFT",
      "term": "coverage:script-layer",
      "key": "coverage_script",
      "declared": 10,
      "computed": 0,
      "detail": "coverage:script-layer: ## Axes row=10 derived=0"
    },
    {
      "severity": "error",
      "kind": "AXES_DRIFT",
      "term": "coverage:runtime-layer",
      "key": "coverage_runtime",
      "declared": 10,
      "computed": 0,
      "detail": "coverage:runtime-layer: ## Axes row=10 derived=0"
    },
    {
      "severity": "error",
      "kind": "AXES_DRIFT",
      "term": "coverage:kimi-layer",
      "key": "coverage_kimi",
      "declared": 10,
      "computed": 0,
      "detail": "coverage:kimi-layer: ## Axes row=10 derived=0"
    }
  ],
  "errors": 46,
  "warnings": 0,
  "durationMs": 11
}
```

### proxy-note-empty

Expected (recorded before run): frozen proxy has no O arm: no OMP_NOTE_MISSING and no coverage_omp term; other existing drift may remain

```sh
# cwd: /fast/scratch/hyaku/kumitate-r76/K76SentinelBoundary/lane
node /fast/scratch/hyaku/kumitate-r76/K76SentinelBoundary/lane/scripts/proxy-check.mjs --self /fast/scratch/hyaku/kumitate-r76/K76SentinelBoundary/fixtures/self-empty --src /fast/scratch/hyaku/kumitate-r76/K76SentinelBoundary/lane --kimi-root /fast/scratch/hyaku/kumitate-r76/K76SentinelBoundary/fixtures/kimi --json
```

Exit: `1`.

```text
{
  "contract": "kumitate-proxy-v1",
  "mode": "check",
  "ok": false,
  "verdict": "DRIFT",
  "exitCode": 1,
  "self": "/fast/scratch/hyaku/kumitate-r76/K76SentinelBoundary/fixtures/self-empty",
  "scorecard": "/fast/scratch/hyaku/kumitate-r76/K76SentinelBoundary/fixtures/self-empty/SCORECARD.md",
  "src": "/fast/scratch/hyaku/kumitate-r76/K76SentinelBoundary/lane",
  "pin": null,
  "srcRev": null,
  "kimiRoot": "/fast/scratch/hyaku/kumitate-r76/K76SentinelBoundary/fixtures/kimi",
  "strict": false,
  "terms": {
    "A": 0,
    "C": 33,
    "C1": 19,
    "C1_total": 19,
    "C2": 181,
    "C2_total": 2,
    "operability": 9,
    "coverage": 905,
    "S_members": 29,
    "S_sections": 0,
    "R_members": 0,
    "R_sections": 0,
    "coverage_script": 0,
    "coverage_runtime": 0,
    "C1k": 5,
    "C1k_total": 5,
    "K_members": 0,
    "K_sections": 0,
    "coverage_kimi": 0,
    "pins": {
      "pin.cite-check": {
        "file": "scripts/cite-check.mjs",
        "declared": "7484274fff4c540f39d6df829708c86c78f25e803a4657ab4d7bae6d025acdf2",
        "computed": null,
        "match": false
      },
      "pin.surface-probe": {
        "file": "scripts/surface-probe.mjs",
        "declared": "79081e1b3c661590f4fafe5d2343993d966873cb4422b7b5462434366a084d35",
        "computed": null,
        "match": false
      },
      "pin.round-gate": {
        "file": "scripts/round-gate.mjs",
        "declared": "09d4d79238f44dd74a0fa727c8f6b193c3fa87200c02340e2f4b3dcc6b354594",
        "computed": null,
        "match": false
      },
      "pin.proxy-check": {
        "file": "scripts/proxy-check.mjs",
        "declared": "92465ddc7ad57111e5a946f83af2788adfd63deb28ab6af49f13fde454eabf2e",
        "computed": null,
        "match": false
      },
      "pin.claims-check": {
        "file": "scripts/claims-check.mjs",
        "declared": "de3433b5465a2f2d22c538537e3f9c67e37dc2605888b2ff77adc49264abfe14",
        "computed": null,
        "match": false
      },
      "pin.kimi-census": {
        "file": "scripts/kimi-census.mjs",
        "declared": "73bea81ccdb7cf27234636d9d4c84af2fc7a8a9a25c201bf42c783d7da9dc3e1",
        "computed": null,
        "match": false
      }
    },
    "pinsMatched": 0,
    "pinsTotal": 6,
    "declared": {
      "A": "833",
      "C": "33",
      "C1": "19",
      "C1_total": "19",
      "C2": "181",
      "C2_total": "181",
      "S_members": "88",
      "S_sections": "88",
      "R_members": "92",
      "R_sections": "92",
      "coverage_script": "10",
      "coverage_runtime": "10",
      "C1k": "5",
      "C1k_total": "5",
      "K_members": "55",
      "K_sections": "55",
      "coverage_kimi": "10",
      "pin.cite-check": "7484274fff4c540f39d6df829708c86c78f25e803a4657ab4d7bae6d025acdf2",
      "pin.surface-probe": "79081e1b3c661590f4fafe5d2343993d966873cb4422b7b5462434366a084d35",
      "pin.round-gate": "09d4d79238f44dd74a0fa727c8f6b193c3fa87200c02340e2f4b3dcc6b354594",
      "pin.proxy-check": "92465ddc7ad57111e5a946f83af2788adfd63deb28ab6af49f13fde454eabf2e",
      "pin.claims-check": "de3433b5465a2f2d22c538537e3f9c67e37dc2605888b2ff77adc49264abfe14",
      "pin.kimi-census": "73bea81ccdb7cf27234636d9d4c84af2fc7a8a9a25c201bf42c783d7da9dc3e1"
    },
    "stanzaLine": 287
  },
  "findings": [
    {
      "severity": "error",
      "kind": "A_DRIFT",
      "term": "A",
      "declared": 833,
      "computed": 0,
      "delta": "-833",
      "detail": "A: declared=833 computed=0 delta=-833"
    },
    {
      "severity": "error",
      "kind": "C2_TOTAL_DRIFT",
      "term": "C2_total",
      "declared": 181,
      "computed": 2,
      "delta": "-179",
      "detail": "C2_total: declared=181 computed=2 delta=-179"
    },
    {
      "severity": "error",
      "kind": "S_MEMBERS_DRIFT",
      "term": "S_members",
      "declared": 88,
      "computed": 29,
      "delta": "-59",
      "detail": "S_members: declared=88 computed=29 delta=-59"
    },
    {
      "severity": "error",
      "kind": "S_SECTIONS_DRIFT",
      "term": "S_sections",
      "declared": 88,
      "computed": 0,
      "delta": "-88",
      "detail": "S_sections: declared=88 computed=0 delta=-88"
    },
    {
      "severity": "error",
      "kind": "R_MEMBERS_DRIFT",
      "term": "R_members",
      "declared": 92,
      "computed": 0,
      "delta": "-92",
      "detail": "R_members: declared=92 computed=0 delta=-92"
    },
    {
      "severity": "error",
      "kind": "R_SECTIONS_DRIFT",
      "term": "R_sections",
      "declared": 92,
      "computed": 0,
      "delta": "-92",
      "detail": "R_sections: declared=92 computed=0 delta=-92"
    },
    {
      "severity": "error",
      "kind": "COVERAGE_SCRIPT_DRIFT",
      "term": "coverage_script",
      "declared": 10,
      "computed": 0,
      "delta": "-10",
      "detail": "coverage_script: declared=10 computed=0 delta=-10"
    },
    {
      "severity": "error",
      "kind": "COVERAGE_RUNTIME_DRIFT",
      "term": "coverage_runtime",
      "declared": 10,
      "computed": 0,
      "delta": "-10",
      "detail": "coverage_runtime: declared=10 computed=0 delta=-10"
    },
    {
      "severity": "error",
      "kind": "K_MEMBERS_DRIFT",
      "term": "K_members",
      "declared": 55,
      "computed": 0,
      "delta": "-55",
      "detail": "K_members: declared=55 computed=0 delta=-55"
    },
    {
      "severity": "error",
      "kind": "K_SECTIONS_DRIFT",
      "term": "K_sections",
      "declared": 55,
      "computed": 0,
      "delta": "-55",
      "detail": "K_sections: declared=55 computed=0 delta=-55"
    },
    {
      "severity": "error",
      "kind": "COVERAGE_KIMI_DRIFT",
      "term": "coverage_kimi",
      "declared": 10,
      "computed": 0,
      "delta": "-10",
      "detail": "coverage_kimi: declared=10 computed=0 delta=-10"
    },
    {
      "severity": "error",
      "kind": "PIN_DRIFT",
      "term": "pin.cite-check",
      "declared": "7484274fff4c540f39d6df829708c86c78f25e803a4657ab4d7bae6d025acdf2",
      "computed": "absent (scripts/cite-check.mjs is absent)",
      "detail": "pin.cite-check: declared=7484274fff4c540f39d6df829708c86c78f25e803a4657ab4d7bae6d025acdf2 computed=absent (scripts/cite-check.mjs is absent)"
    },
    {
      "severity": "error",
      "kind": "PIN_DRIFT",
      "term": "pin.surface-probe",
      "declared": "79081e1b3c661590f4fafe5d2343993d966873cb4422b7b5462434366a084d35",
      "computed": "absent (scripts/surface-probe.mjs is absent)",
      "detail": "pin.surface-probe: declared=79081e1b3c661590f4fafe5d2343993d966873cb4422b7b5462434366a084d35 computed=absent (scripts/surface-probe.mjs is absent)"
    },
    {
      "severity": "error",
      "kind": "PIN_DRIFT",
      "term": "pin.round-gate",
      "declared": "09d4d79238f44dd74a0fa727c8f6b193c3fa87200c02340e2f4b3dcc6b354594",
      "computed": "absent (scripts/round-gate.mjs is absent)",
      "detail": "pin.round-gate: declared=09d4d79238f44dd74a0fa727c8f6b193c3fa87200c02340e2f4b3dcc6b354594 computed=absent (scripts/round-gate.mjs is absent)"
    },
    {
      "severity": "error",
      "kind": "PIN_DRIFT",
      "term": "pin.proxy-check",
      "declared": "92465ddc7ad57111e5a946f83af2788adfd63deb28ab6af49f13fde454eabf2e",
      "computed": "absent (scripts/proxy-check.mjs is absent)",
      "detail": "pin.proxy-check: declared=92465ddc7ad57111e5a946f83af2788adfd63deb28ab6af49f13fde454eabf2e computed=absent (scripts/proxy-check.mjs is absent)"
    },
    {
      "severity": "error",
      "kind": "PIN_DRIFT",
      "term": "pin.claims-check",
      "declared": "de3433b5465a2f2d22c538537e3f9c67e37dc2605888b2ff77adc49264abfe14",
      "computed": "absent (scripts/claims-check.mjs is absent)",
      "detail": "pin.claims-check: declared=de3433b5465a2f2d22c538537e3f9c67e37dc2605888b2ff77adc49264abfe14 computed=absent (scripts/claims-check.mjs is absent)"
    },
    {
      "severity": "error",
      "kind": "PIN_DRIFT",
      "term": "pin.kimi-census",
      "declared": "73bea81ccdb7cf27234636d9d4c84af2fc7a8a9a25c201bf42c783d7da9dc3e1",
      "computed": "absent (scripts/kimi-census.mjs is absent)",
      "detail": "pin.kimi-census: declared=73bea81ccdb7cf27234636d9d4c84af2fc7a8a9a25c201bf42c783d7da9dc3e1 computed=absent (scripts/kimi-census.mjs is absent)"
    },
    {
      "severity": "error",
      "kind": "GATE_PIN_DRIFT",
      "term": "pin.anchor-truth",
      "declared": "43c37865a5b3ea5912c5be0e1243fa222642b6be0ef6a1103ee03a287614b23d",
      "computed": "absent (scripts/anchor-truth.mjs is absent)",
      "detail": "pin.anchor-truth: declared=43c37865a5b3ea5912c5be0e1243fa222642b6be0ef6a1103ee03a287614b23d computed=absent (scripts/anchor-truth.mjs is absent)"
    },
    {
      "severity": "error",
      "kind": "GATE_PIN_DRIFT",
      "term": "pin.sources-check",
      "declared": "5402b2103bb9e3ccd76f7bf3f5880f2249f809c78cee4766a75e3cf30b69f434",
      "computed": "absent (scripts/sources-check.mjs is absent)",
      "detail": "pin.sources-check: declared=5402b2103bb9e3ccd76f7bf3f5880f2249f809c78cee4766a75e3cf30b69f434 computed=absent (scripts/sources-check.mjs is absent)"
    },
    {
      "severity": "error",
      "kind": "GATE_PIN_DRIFT",
      "term": "pin.wave-census",
      "declared": "76447250f9de1f7e9258d0dfe9544feba18d6c8723db37e77e6ca422235f45f4",
      "computed": "absent (scripts/wave-census.mjs is absent)",
      "detail": "pin.wave-census: declared=76447250f9de1f7e9258d0dfe9544feba18d6c8723db37e77e6ca422235f45f4 computed=absent (scripts/wave-census.mjs is absent)"
    },
    {
      "severity": "error",
      "kind": "GATE_PIN_DRIFT",
      "term": "pin.gate-mutants",
      "declared": "177f6cbbd70d7503263d00c77357893658a0e393ac722d43034ebd7e429bb717",
      "computed": "absent (scripts/gate-mutants.mjs is absent)",
      "detail": "pin.gate-mutants: declared=177f6cbbd70d7503263d00c77357893658a0e393ac722d43034ebd7e429bb717 computed=absent (scripts/gate-mutants.mjs is absent)"
    },
    {
      "severity": "error",
      "kind": "GATE_PIN_DRIFT",
      "term": "pin.omp-census",
      "declared": "c7065f9d973d772707ae71d87437e7a4df095bd29fb749de63c27f4512a853ed",
      "computed": "absent (scripts/omp-census.mjs is absent)",
      "detail": "pin.omp-census: declared=c7065f9d973d772707ae71d87437e7a4df095bd29fb749de63c27f4512a853ed computed=absent (scripts/omp-census.mjs is absent)"
    },
    {
      "severity": "error",
      "kind": "GATE_PIN_DRIFT",
      "term": "pin.cap-run",
      "declared": "e1d0a79b0c38a5d1d60ccba37ab7dd0528d1ee63982aae3213e28572a8d754c5",
      "computed": "absent (scripts/cap-run.mjs is absent)",
      "detail": "pin.cap-run: declared=e1d0a79b0c38a5d1d60ccba37ab7dd0528d1ee63982aae3213e28572a8d754c5 computed=absent (scripts/cap-run.mjs is absent)"
    },
    {
      "severity": "error",
      "kind": "GATE_PIN_DRIFT",
      "term": "pin.bind-oracle",
      "declared": "c3929a97c5b24303b1acadb62ebaa4778768585597cf7fc06d2996602ec211e5",
      "computed": "absent (scripts/bind-oracle.mjs is absent)",
      "detail": "pin.bind-oracle: declared=c3929a97c5b24303b1acadb62ebaa4778768585597cf7fc06d2996602ec211e5 computed=absent (scripts/bind-oracle.mjs is absent)"
    },
    {
      "severity": "error",
      "kind": "GATE_PIN_DRIFT",
      "term": "pin.cap-spawn",
      "declared": "1fde43fb7f68992fb5e692188cd9afd3581d1d16c720815adc8d3a1ca3c734d0",
      "computed": "absent (scripts/cap-spawn.mjs is absent)",
      "detail": "pin.cap-spawn: declared=1fde43fb7f68992fb5e692188cd9afd3581d1d16c720815adc8d3a1ca3c734d0 computed=absent (scripts/cap-spawn.mjs is absent)"
    },
    {
      "severity": "error",
      "kind": "GATE_PIN_DRIFT",
      "term": "pin.counter-rerun",
      "declared": "c002523fc39b521f57a3ee86c3ff154e06aea8ccd6738501138460141abc369b",
      "computed": "absent (scripts/counter-rerun.mjs is absent)",
      "detail": "pin.counter-rerun: declared=c002523fc39b521f57a3ee86c3ff154e06aea8ccd6738501138460141abc369b computed=absent (scripts/counter-rerun.mjs is absent)"
    },
    {
      "severity": "error",
      "kind": "GATE_PIN_DRIFT",
      "term": "pin.receipt-attest",
      "declared": "ba5139b1290b204054c043df3140554757116e6fbaf19783b502a24ed1b2ce31",
      "computed": "absent (scripts/receipt-attest.mjs is absent)",
      "detail": "pin.receipt-attest: declared=ba5139b1290b204054c043df3140554757116e6fbaf19783b502a24ed1b2ce31 computed=absent (scripts/receipt-attest.mjs is absent)"
    },
    {
      "severity": "error",
      "kind": "GATE_PIN_DRIFT",
      "term": "pin.counter-pins",
      "declared": "060d5d8662701340da24f483316053be86bed246510c541a0518492e7b29028e",
      "computed": "absent (scripts/counter-pins.mjs is absent)",
      "detail": "pin.counter-pins: declared=060d5d8662701340da24f483316053be86bed246510c541a0518492e7b29028e computed=absent (scripts/counter-pins.mjs is absent)"
    },
    {
      "severity": "error",
      "kind": "GATE_PIN_DRIFT",
      "term": "pin.source-capture",
      "declared": "39bdeb39298672dd3ed81036013de542ad6925587cb84f330ab69de6799d28f5",
      "computed": "absent (scripts/source-capture.mjs is absent)",
      "detail": "pin.source-capture: declared=39bdeb39298672dd3ed81036013de542ad6925587cb84f330ab69de6799d28f5 computed=absent (scripts/source-capture.mjs is absent)"
    },
    {
      "severity": "error",
      "kind": "GATE_PIN_DRIFT",
      "term": "pin.source-dupes",
      "declared": "ead88b22fbd1525d13dd46c67b427041dc331d202a005285adea813c32530d7a",
      "computed": "absent (scripts/source-dupes.mjs is absent)",
      "detail": "pin.source-dupes: declared=ead88b22fbd1525d13dd46c67b427041dc331d202a005285adea813c32530d7a computed=absent (scripts/source-dupes.mjs is absent)"
    },
    {
      "severity": "error",
      "kind": "GATE_PIN_DRIFT",
      "term": "pin.readme-map",
      "declared": "b1c8bf97eb01fdb2ebfd46521c8e805fa2c36f8e10ce9740531162cd0b8ee74e",
      "computed": "absent (scripts/readme-map.mjs is absent)",
      "detail": "pin.readme-map: declared=b1c8bf97eb01fdb2ebfd46521c8e805fa2c36f8e10ce9740531162cd0b8ee74e computed=absent (scripts/readme-map.mjs is absent)"
    },
    {
      "severity": "error",
      "kind": "GATE_PIN_DRIFT",
      "term": "pin.receipt-evidence",
      "declared": "0ea6b66df7dcff4dc9381c688a5182fb1fe2c3be5353df7a52d3c6f2e006972c",
      "computed": "absent (scripts/receipt-evidence.mjs is absent)",
      "detail": "pin.receipt-evidence: declared=0ea6b66df7dcff4dc9381c688a5182fb1fe2c3be5353df7a52d3c6f2e006972c computed=absent (scripts/receipt-evidence.mjs is absent)"
    },
    {
      "severity": "error",
      "kind": "GATE_PIN_DRIFT",
      "term": "pin.cite-sources",
      "declared": "7211be845cd994e6dc3bf1b1ed821a0464d9aa1cce6f4695412095a9fc2921a6",
      "computed": "absent (scripts/cite-sources.mjs is absent)",
      "detail": "pin.cite-sources: declared=7211be845cd994e6dc3bf1b1ed821a0464d9aa1cce6f4695412095a9fc2921a6 computed=absent (scripts/cite-sources.mjs is absent)"
    },
    {
      "severity": "error",
      "kind": "GATE_PIN_DRIFT",
      "term": "pin.dispatch-evidence",
      "declared": "765a7aa3ef6b11f18548da4a91f98c42e07b825229135c30010f092cc1af65cc",
      "computed": "absent (scripts/dispatch-evidence.mjs is absent)",
      "detail": "pin.dispatch-evidence: declared=765a7aa3ef6b11f18548da4a91f98c42e07b825229135c30010f092cc1af65cc computed=absent (scripts/dispatch-evidence.mjs is absent)"
    },
    {
      "severity": "error",
      "kind": "GATE_PIN_DRIFT",
      "term": "pin.make-dispatch-actual",
      "declared": "f0194314e98e87e86eb1329f36411e249911f9a0120aa4feb702562a54bf3dc9",
      "computed": "absent (scripts/make-dispatch-actual.mjs is absent)",
      "detail": "pin.make-dispatch-actual: declared=f0194314e98e87e86eb1329f36411e249911f9a0120aa4feb702562a54bf3dc9 computed=absent (scripts/make-dispatch-actual.mjs is absent)"
    },
    {
      "severity": "error",
      "kind": "GATE_PIN_DRIFT",
      "term": "pin.inline-dispatch-evidence",
      "declared": "9f1978a93deb0001396008f48ceae2f154bf7bdc145fff36721e29ef9ce1e741",
      "computed": "absent (scripts/inline-dispatch-evidence.mjs is absent)",
      "detail": "pin.inline-dispatch-evidence: declared=9f1978a93deb0001396008f48ceae2f154bf7bdc145fff36721e29ef9ce1e741 computed=absent (scripts/inline-dispatch-evidence.mjs is absent)"
    },
    {
      "severity": "error",
      "kind": "GATE_PIN_DRIFT",
      "term": "pin.plan-before-ready",
      "declared": "4d927ce36c6728c13f48fd7e44d30b8982b5570ea020930e24ca07f0250554ab",
      "computed": "absent (scripts/plan-before-ready.sh is absent)",
      "detail": "pin.plan-before-ready: declared=4d927ce36c6728c13f48fd7e44d30b8982b5570ea020930e24ca07f0250554ab computed=absent (scripts/plan-before-ready.sh is absent)"
    },
    {
      "severity": "error",
      "kind": "GATE_PIN_DRIFT",
      "term": "pin.jj-seat-demo",
      "declared": "80d174dba368e71296da65f59d93e60fb5e37673f429e3d832be02681c5b480a",
      "computed": "absent (scripts/jj-seat-demo.sh is absent)",
      "detail": "pin.jj-seat-demo: declared=80d174dba368e71296da65f59d93e60fb5e37673f429e3d832be02681c5b480a computed=absent (scripts/jj-seat-demo.sh is absent)"
    },
    {
      "severity": "error",
      "kind": "GATE_PIN_DRIFT",
      "term": "pin.report-receipt-diff",
      "declared": "23efb0908b9ebe51f158f590c6512be59aa183e5e25f268b5e0340f78f2f8927",
      "computed": "absent (scripts/report-receipt-diff.mjs is absent)",
      "detail": "pin.report-receipt-diff: declared=23efb0908b9ebe51f158f590c6512be59aa183e5e25f268b5e0340f78f2f8927 computed=absent (scripts/report-receipt-diff.mjs is absent)"
    },
    {
      "severity": "error",
      "kind": "GATE_PIN_DRIFT",
      "term": "pin.control-replay",
      "declared": "22bd0e31a74f4a58e3303f145d9f88e2ff89d890f21588b4ae2879d4a0e39dc4",
      "computed": "absent (scripts/control-replay.mjs is absent)",
      "detail": "pin.control-replay: declared=22bd0e31a74f4a58e3303f145d9f88e2ff89d890f21588b4ae2879d4a0e39dc4 computed=absent (scripts/control-replay.mjs is absent)"
    },
    {
      "severity": "error",
      "kind": "GATE_PIN_DRIFT",
      "term": "pin.harm-matrix",
      "declared": "ab123486e2fd753fc2df10d207b2d92a3759838bd3f31370402717de493f7c38",
      "computed": "absent (scripts/harm-matrix.mjs is absent)",
      "detail": "pin.harm-matrix: declared=ab123486e2fd753fc2df10d207b2d92a3759838bd3f31370402717de493f7c38 computed=absent (scripts/harm-matrix.mjs is absent)"
    },
    {
      "severity": "error",
      "kind": "GATE_PIN_DRIFT",
      "term": "pin.routed-ledger",
      "declared": "05aacb5ede6b3389a693bb71c6c1cb74281f8bab9b5bf2309027dd97d83913b1",
      "computed": "absent (scripts/routed-ledger.mjs is absent)",
      "detail": "pin.routed-ledger: declared=05aacb5ede6b3389a693bb71c6c1cb74281f8bab9b5bf2309027dd97d83913b1 computed=absent (scripts/routed-ledger.mjs is absent)"
    },
    {
      "severity": "error",
      "kind": "AXES_DRIFT",
      "term": "coverage",
      "key": "coverage",
      "declared": 10,
      "computed": 905,
      "detail": "coverage: ## Axes row=10 derived=905"
    },
    {
      "severity": "error",
      "kind": "AXES_DRIFT",
      "term": "coverage:script-layer",
      "key": "coverage_script",
      "declared": 10,
      "computed": 0,
      "detail": "coverage:script-layer: ## Axes row=10 derived=0"
    },
    {
      "severity": "error",
      "kind": "AXES_DRIFT",
      "term": "coverage:runtime-layer",
      "key": "coverage_runtime",
      "declared": 10,
      "computed": 0,
      "detail": "coverage:runtime-layer: ## Axes row=10 derived=0"
    },
    {
      "severity": "error",
      "kind": "AXES_DRIFT",
      "term": "coverage:kimi-layer",
      "key": "coverage_kimi",
      "declared": 10,
      "computed": 0,
      "detail": "coverage:kimi-layer: ## Axes row=10 derived=0"
    }
  ],
  "errors": 46,
  "warnings": 0,
  "durationMs": 8
}
```

### proxy-note-fence

Expected (recorded before run): frozen proxy has no O arm: no OMP_NOTE_MISSING and no coverage_omp term; other existing drift may remain

```sh
# cwd: /fast/scratch/hyaku/kumitate-r76/K76SentinelBoundary/lane
node /fast/scratch/hyaku/kumitate-r76/K76SentinelBoundary/lane/scripts/proxy-check.mjs --self /fast/scratch/hyaku/kumitate-r76/K76SentinelBoundary/fixtures/self-fence --src /fast/scratch/hyaku/kumitate-r76/K76SentinelBoundary/lane --kimi-root /fast/scratch/hyaku/kumitate-r76/K76SentinelBoundary/fixtures/kimi --json
```

Exit: `1`.

```text
{
  "contract": "kumitate-proxy-v1",
  "mode": "check",
  "ok": false,
  "verdict": "DRIFT",
  "exitCode": 1,
  "self": "/fast/scratch/hyaku/kumitate-r76/K76SentinelBoundary/fixtures/self-fence",
  "scorecard": "/fast/scratch/hyaku/kumitate-r76/K76SentinelBoundary/fixtures/self-fence/SCORECARD.md",
  "src": "/fast/scratch/hyaku/kumitate-r76/K76SentinelBoundary/lane",
  "pin": null,
  "srcRev": null,
  "kimiRoot": "/fast/scratch/hyaku/kumitate-r76/K76SentinelBoundary/fixtures/kimi",
  "strict": false,
  "terms": {
    "A": 0,
    "C": 33,
    "C1": 19,
    "C1_total": 19,
    "C2": 181,
    "C2_total": 2,
    "operability": 9,
    "coverage": 905,
    "S_members": 29,
    "S_sections": 0,
    "R_members": 0,
    "R_sections": 0,
    "coverage_script": 0,
    "coverage_runtime": 0,
    "C1k": 5,
    "C1k_total": 5,
    "K_members": 0,
    "K_sections": 0,
    "coverage_kimi": 0,
    "pins": {
      "pin.cite-check": {
        "file": "scripts/cite-check.mjs",
        "declared": "7484274fff4c540f39d6df829708c86c78f25e803a4657ab4d7bae6d025acdf2",
        "computed": null,
        "match": false
      },
      "pin.surface-probe": {
        "file": "scripts/surface-probe.mjs",
        "declared": "79081e1b3c661590f4fafe5d2343993d966873cb4422b7b5462434366a084d35",
        "computed": null,
        "match": false
      },
      "pin.round-gate": {
        "file": "scripts/round-gate.mjs",
        "declared": "09d4d79238f44dd74a0fa727c8f6b193c3fa87200c02340e2f4b3dcc6b354594",
        "computed": null,
        "match": false
      },
      "pin.proxy-check": {
        "file": "scripts/proxy-check.mjs",
        "declared": "92465ddc7ad57111e5a946f83af2788adfd63deb28ab6af49f13fde454eabf2e",
        "computed": null,
        "match": false
      },
      "pin.claims-check": {
        "file": "scripts/claims-check.mjs",
        "declared": "de3433b5465a2f2d22c538537e3f9c67e37dc2605888b2ff77adc49264abfe14",
        "computed": null,
        "match": false
      },
      "pin.kimi-census": {
        "file": "scripts/kimi-census.mjs",
        "declared": "73bea81ccdb7cf27234636d9d4c84af2fc7a8a9a25c201bf42c783d7da9dc3e1",
        "computed": null,
        "match": false
      }
    },
    "pinsMatched": 0,
    "pinsTotal": 6,
    "declared": {
      "A": "833",
      "C": "33",
      "C1": "19",
      "C1_total": "19",
      "C2": "181",
      "C2_total": "181",
      "S_members": "88",
      "S_sections": "88",
      "R_members": "92",
      "R_sections": "92",
      "coverage_script": "10",
      "coverage_runtime": "10",
      "C1k": "5",
      "C1k_total": "5",
      "K_members": "55",
      "K_sections": "55",
      "coverage_kimi": "10",
      "pin.cite-check": "7484274fff4c540f39d6df829708c86c78f25e803a4657ab4d7bae6d025acdf2",
      "pin.surface-probe": "79081e1b3c661590f4fafe5d2343993d966873cb4422b7b5462434366a084d35",
      "pin.round-gate": "09d4d79238f44dd74a0fa727c8f6b193c3fa87200c02340e2f4b3dcc6b354594",
      "pin.proxy-check": "92465ddc7ad57111e5a946f83af2788adfd63deb28ab6af49f13fde454eabf2e",
      "pin.claims-check": "de3433b5465a2f2d22c538537e3f9c67e37dc2605888b2ff77adc49264abfe14",
      "pin.kimi-census": "73bea81ccdb7cf27234636d9d4c84af2fc7a8a9a25c201bf42c783d7da9dc3e1"
    },
    "stanzaLine": 287
  },
  "findings": [
    {
      "severity": "error",
      "kind": "A_DRIFT",
      "term": "A",
      "declared": 833,
      "computed": 0,
      "delta": "-833",
      "detail": "A: declared=833 computed=0 delta=-833"
    },
    {
      "severity": "error",
      "kind": "C2_TOTAL_DRIFT",
      "term": "C2_total",
      "declared": 181,
      "computed": 2,
      "delta": "-179",
      "detail": "C2_total: declared=181 computed=2 delta=-179"
    },
    {
      "severity": "error",
      "kind": "S_MEMBERS_DRIFT",
      "term": "S_members",
      "declared": 88,
      "computed": 29,
      "delta": "-59",
      "detail": "S_members: declared=88 computed=29 delta=-59"
    },
    {
      "severity": "error",
      "kind": "S_SECTIONS_DRIFT",
      "term": "S_sections",
      "declared": 88,
      "computed": 0,
      "delta": "-88",
      "detail": "S_sections: declared=88 computed=0 delta=-88"
    },
    {
      "severity": "error",
      "kind": "R_MEMBERS_DRIFT",
      "term": "R_members",
      "declared": 92,
      "computed": 0,
      "delta": "-92",
      "detail": "R_members: declared=92 computed=0 delta=-92"
    },
    {
      "severity": "error",
      "kind": "R_SECTIONS_DRIFT",
      "term": "R_sections",
      "declared": 92,
      "computed": 0,
      "delta": "-92",
      "detail": "R_sections: declared=92 computed=0 delta=-92"
    },
    {
      "severity": "error",
      "kind": "COVERAGE_SCRIPT_DRIFT",
      "term": "coverage_script",
      "declared": 10,
      "computed": 0,
      "delta": "-10",
      "detail": "coverage_script: declared=10 computed=0 delta=-10"
    },
    {
      "severity": "error",
      "kind": "COVERAGE_RUNTIME_DRIFT",
      "term": "coverage_runtime",
      "declared": 10,
      "computed": 0,
      "delta": "-10",
      "detail": "coverage_runtime: declared=10 computed=0 delta=-10"
    },
    {
      "severity": "error",
      "kind": "K_MEMBERS_DRIFT",
      "term": "K_members",
      "declared": 55,
      "computed": 0,
      "delta": "-55",
      "detail": "K_members: declared=55 computed=0 delta=-55"
    },
    {
      "severity": "error",
      "kind": "K_SECTIONS_DRIFT",
      "term": "K_sections",
      "declared": 55,
      "computed": 0,
      "delta": "-55",
      "detail": "K_sections: declared=55 computed=0 delta=-55"
    },
    {
      "severity": "error",
      "kind": "COVERAGE_KIMI_DRIFT",
      "term": "coverage_kimi",
      "declared": 10,
      "computed": 0,
      "delta": "-10",
      "detail": "coverage_kimi: declared=10 computed=0 delta=-10"
    },
    {
      "severity": "error",
      "kind": "PIN_DRIFT",
      "term": "pin.cite-check",
      "declared": "7484274fff4c540f39d6df829708c86c78f25e803a4657ab4d7bae6d025acdf2",
      "computed": "absent (scripts/cite-check.mjs is absent)",
      "detail": "pin.cite-check: declared=7484274fff4c540f39d6df829708c86c78f25e803a4657ab4d7bae6d025acdf2 computed=absent (scripts/cite-check.mjs is absent)"
    },
    {
      "severity": "error",
      "kind": "PIN_DRIFT",
      "term": "pin.surface-probe",
      "declared": "79081e1b3c661590f4fafe5d2343993d966873cb4422b7b5462434366a084d35",
      "computed": "absent (scripts/surface-probe.mjs is absent)",
      "detail": "pin.surface-probe: declared=79081e1b3c661590f4fafe5d2343993d966873cb4422b7b5462434366a084d35 computed=absent (scripts/surface-probe.mjs is absent)"
    },
    {
      "severity": "error",
      "kind": "PIN_DRIFT",
      "term": "pin.round-gate",
      "declared": "09d4d79238f44dd74a0fa727c8f6b193c3fa87200c02340e2f4b3dcc6b354594",
      "computed": "absent (scripts/round-gate.mjs is absent)",
      "detail": "pin.round-gate: declared=09d4d79238f44dd74a0fa727c8f6b193c3fa87200c02340e2f4b3dcc6b354594 computed=absent (scripts/round-gate.mjs is absent)"
    },
    {
      "severity": "error",
      "kind": "PIN_DRIFT",
      "term": "pin.proxy-check",
      "declared": "92465ddc7ad57111e5a946f83af2788adfd63deb28ab6af49f13fde454eabf2e",
      "computed": "absent (scripts/proxy-check.mjs is absent)",
      "detail": "pin.proxy-check: declared=92465ddc7ad57111e5a946f83af2788adfd63deb28ab6af49f13fde454eabf2e computed=absent (scripts/proxy-check.mjs is absent)"
    },
    {
      "severity": "error",
      "kind": "PIN_DRIFT",
      "term": "pin.claims-check",
      "declared": "de3433b5465a2f2d22c538537e3f9c67e37dc2605888b2ff77adc49264abfe14",
      "computed": "absent (scripts/claims-check.mjs is absent)",
      "detail": "pin.claims-check: declared=de3433b5465a2f2d22c538537e3f9c67e37dc2605888b2ff77adc49264abfe14 computed=absent (scripts/claims-check.mjs is absent)"
    },
    {
      "severity": "error",
      "kind": "PIN_DRIFT",
      "term": "pin.kimi-census",
      "declared": "73bea81ccdb7cf27234636d9d4c84af2fc7a8a9a25c201bf42c783d7da9dc3e1",
      "computed": "absent (scripts/kimi-census.mjs is absent)",
      "detail": "pin.kimi-census: declared=73bea81ccdb7cf27234636d9d4c84af2fc7a8a9a25c201bf42c783d7da9dc3e1 computed=absent (scripts/kimi-census.mjs is absent)"
    },
    {
      "severity": "error",
      "kind": "GATE_PIN_DRIFT",
      "term": "pin.anchor-truth",
      "declared": "43c37865a5b3ea5912c5be0e1243fa222642b6be0ef6a1103ee03a287614b23d",
      "computed": "absent (scripts/anchor-truth.mjs is absent)",
      "detail": "pin.anchor-truth: declared=43c37865a5b3ea5912c5be0e1243fa222642b6be0ef6a1103ee03a287614b23d computed=absent (scripts/anchor-truth.mjs is absent)"
    },
    {
      "severity": "error",
      "kind": "GATE_PIN_DRIFT",
      "term": "pin.sources-check",
      "declared": "5402b2103bb9e3ccd76f7bf3f5880f2249f809c78cee4766a75e3cf30b69f434",
      "computed": "absent (scripts/sources-check.mjs is absent)",
      "detail": "pin.sources-check: declared=5402b2103bb9e3ccd76f7bf3f5880f2249f809c78cee4766a75e3cf30b69f434 computed=absent (scripts/sources-check.mjs is absent)"
    },
    {
      "severity": "error",
      "kind": "GATE_PIN_DRIFT",
      "term": "pin.wave-census",
      "declared": "76447250f9de1f7e9258d0dfe9544feba18d6c8723db37e77e6ca422235f45f4",
      "computed": "absent (scripts/wave-census.mjs is absent)",
      "detail": "pin.wave-census: declared=76447250f9de1f7e9258d0dfe9544feba18d6c8723db37e77e6ca422235f45f4 computed=absent (scripts/wave-census.mjs is absent)"
    },
    {
      "severity": "error",
      "kind": "GATE_PIN_DRIFT",
      "term": "pin.gate-mutants",
      "declared": "177f6cbbd70d7503263d00c77357893658a0e393ac722d43034ebd7e429bb717",
      "computed": "absent (scripts/gate-mutants.mjs is absent)",
      "detail": "pin.gate-mutants: declared=177f6cbbd70d7503263d00c77357893658a0e393ac722d43034ebd7e429bb717 computed=absent (scripts/gate-mutants.mjs is absent)"
    },
    {
      "severity": "error",
      "kind": "GATE_PIN_DRIFT",
      "term": "pin.omp-census",
      "declared": "c7065f9d973d772707ae71d87437e7a4df095bd29fb749de63c27f4512a853ed",
      "computed": "absent (scripts/omp-census.mjs is absent)",
      "detail": "pin.omp-census: declared=c7065f9d973d772707ae71d87437e7a4df095bd29fb749de63c27f4512a853ed computed=absent (scripts/omp-census.mjs is absent)"
    },
    {
      "severity": "error",
      "kind": "GATE_PIN_DRIFT",
      "term": "pin.cap-run",
      "declared": "e1d0a79b0c38a5d1d60ccba37ab7dd0528d1ee63982aae3213e28572a8d754c5",
      "computed": "absent (scripts/cap-run.mjs is absent)",
      "detail": "pin.cap-run: declared=e1d0a79b0c38a5d1d60ccba37ab7dd0528d1ee63982aae3213e28572a8d754c5 computed=absent (scripts/cap-run.mjs is absent)"
    },
    {
      "severity": "error",
      "kind": "GATE_PIN_DRIFT",
      "term": "pin.bind-oracle",
      "declared": "c3929a97c5b24303b1acadb62ebaa4778768585597cf7fc06d2996602ec211e5",
      "computed": "absent (scripts/bind-oracle.mjs is absent)",
      "detail": "pin.bind-oracle: declared=c3929a97c5b24303b1acadb62ebaa4778768585597cf7fc06d2996602ec211e5 computed=absent (scripts/bind-oracle.mjs is absent)"
    },
    {
      "severity": "error",
      "kind": "GATE_PIN_DRIFT",
      "term": "pin.cap-spawn",
      "declared": "1fde43fb7f68992fb5e692188cd9afd3581d1d16c720815adc8d3a1ca3c734d0",
      "computed": "absent (scripts/cap-spawn.mjs is absent)",
      "detail": "pin.cap-spawn: declared=1fde43fb7f68992fb5e692188cd9afd3581d1d16c720815adc8d3a1ca3c734d0 computed=absent (scripts/cap-spawn.mjs is absent)"
    },
    {
      "severity": "error",
      "kind": "GATE_PIN_DRIFT",
      "term": "pin.counter-rerun",
      "declared": "c002523fc39b521f57a3ee86c3ff154e06aea8ccd6738501138460141abc369b",
      "computed": "absent (scripts/counter-rerun.mjs is absent)",
      "detail": "pin.counter-rerun: declared=c002523fc39b521f57a3ee86c3ff154e06aea8ccd6738501138460141abc369b computed=absent (scripts/counter-rerun.mjs is absent)"
    },
    {
      "severity": "error",
      "kind": "GATE_PIN_DRIFT",
      "term": "pin.receipt-attest",
      "declared": "ba5139b1290b204054c043df3140554757116e6fbaf19783b502a24ed1b2ce31",
      "computed": "absent (scripts/receipt-attest.mjs is absent)",
      "detail": "pin.receipt-attest: declared=ba5139b1290b204054c043df3140554757116e6fbaf19783b502a24ed1b2ce31 computed=absent (scripts/receipt-attest.mjs is absent)"
    },
    {
      "severity": "error",
      "kind": "GATE_PIN_DRIFT",
      "term": "pin.counter-pins",
      "declared": "060d5d8662701340da24f483316053be86bed246510c541a0518492e7b29028e",
      "computed": "absent (scripts/counter-pins.mjs is absent)",
      "detail": "pin.counter-pins: declared=060d5d8662701340da24f483316053be86bed246510c541a0518492e7b29028e computed=absent (scripts/counter-pins.mjs is absent)"
    },
    {
      "severity": "error",
      "kind": "GATE_PIN_DRIFT",
      "term": "pin.source-capture",
      "declared": "39bdeb39298672dd3ed81036013de542ad6925587cb84f330ab69de6799d28f5",
      "computed": "absent (scripts/source-capture.mjs is absent)",
      "detail": "pin.source-capture: declared=39bdeb39298672dd3ed81036013de542ad6925587cb84f330ab69de6799d28f5 computed=absent (scripts/source-capture.mjs is absent)"
    },
    {
      "severity": "error",
      "kind": "GATE_PIN_DRIFT",
      "term": "pin.source-dupes",
      "declared": "ead88b22fbd1525d13dd46c67b427041dc331d202a005285adea813c32530d7a",
      "computed": "absent (scripts/source-dupes.mjs is absent)",
      "detail": "pin.source-dupes: declared=ead88b22fbd1525d13dd46c67b427041dc331d202a005285adea813c32530d7a computed=absent (scripts/source-dupes.mjs is absent)"
    },
    {
      "severity": "error",
      "kind": "GATE_PIN_DRIFT",
      "term": "pin.readme-map",
      "declared": "b1c8bf97eb01fdb2ebfd46521c8e805fa2c36f8e10ce9740531162cd0b8ee74e",
      "computed": "absent (scripts/readme-map.mjs is absent)",
      "detail": "pin.readme-map: declared=b1c8bf97eb01fdb2ebfd46521c8e805fa2c36f8e10ce9740531162cd0b8ee74e computed=absent (scripts/readme-map.mjs is absent)"
    },
    {
      "severity": "error",
      "kind": "GATE_PIN_DRIFT",
      "term": "pin.receipt-evidence",
      "declared": "0ea6b66df7dcff4dc9381c688a5182fb1fe2c3be5353df7a52d3c6f2e006972c",
      "computed": "absent (scripts/receipt-evidence.mjs is absent)",
      "detail": "pin.receipt-evidence: declared=0ea6b66df7dcff4dc9381c688a5182fb1fe2c3be5353df7a52d3c6f2e006972c computed=absent (scripts/receipt-evidence.mjs is absent)"
    },
    {
      "severity": "error",
      "kind": "GATE_PIN_DRIFT",
      "term": "pin.cite-sources",
      "declared": "7211be845cd994e6dc3bf1b1ed821a0464d9aa1cce6f4695412095a9fc2921a6",
      "computed": "absent (scripts/cite-sources.mjs is absent)",
      "detail": "pin.cite-sources: declared=7211be845cd994e6dc3bf1b1ed821a0464d9aa1cce6f4695412095a9fc2921a6 computed=absent (scripts/cite-sources.mjs is absent)"
    },
    {
      "severity": "error",
      "kind": "GATE_PIN_DRIFT",
      "term": "pin.dispatch-evidence",
      "declared": "765a7aa3ef6b11f18548da4a91f98c42e07b825229135c30010f092cc1af65cc",
      "computed": "absent (scripts/dispatch-evidence.mjs is absent)",
      "detail": "pin.dispatch-evidence: declared=765a7aa3ef6b11f18548da4a91f98c42e07b825229135c30010f092cc1af65cc computed=absent (scripts/dispatch-evidence.mjs is absent)"
    },
    {
      "severity": "error",
      "kind": "GATE_PIN_DRIFT",
      "term": "pin.make-dispatch-actual",
      "declared": "f0194314e98e87e86eb1329f36411e249911f9a0120aa4feb702562a54bf3dc9",
      "computed": "absent (scripts/make-dispatch-actual.mjs is absent)",
      "detail": "pin.make-dispatch-actual: declared=f0194314e98e87e86eb1329f36411e249911f9a0120aa4feb702562a54bf3dc9 computed=absent (scripts/make-dispatch-actual.mjs is absent)"
    },
    {
      "severity": "error",
      "kind": "GATE_PIN_DRIFT",
      "term": "pin.inline-dispatch-evidence",
      "declared": "9f1978a93deb0001396008f48ceae2f154bf7bdc145fff36721e29ef9ce1e741",
      "computed": "absent (scripts/inline-dispatch-evidence.mjs is absent)",
      "detail": "pin.inline-dispatch-evidence: declared=9f1978a93deb0001396008f48ceae2f154bf7bdc145fff36721e29ef9ce1e741 computed=absent (scripts/inline-dispatch-evidence.mjs is absent)"
    },
    {
      "severity": "error",
      "kind": "GATE_PIN_DRIFT",
      "term": "pin.plan-before-ready",
      "declared": "4d927ce36c6728c13f48fd7e44d30b8982b5570ea020930e24ca07f0250554ab",
      "computed": "absent (scripts/plan-before-ready.sh is absent)",
      "detail": "pin.plan-before-ready: declared=4d927ce36c6728c13f48fd7e44d30b8982b5570ea020930e24ca07f0250554ab computed=absent (scripts/plan-before-ready.sh is absent)"
    },
    {
      "severity": "error",
      "kind": "GATE_PIN_DRIFT",
      "term": "pin.jj-seat-demo",
      "declared": "80d174dba368e71296da65f59d93e60fb5e37673f429e3d832be02681c5b480a",
      "computed": "absent (scripts/jj-seat-demo.sh is absent)",
      "detail": "pin.jj-seat-demo: declared=80d174dba368e71296da65f59d93e60fb5e37673f429e3d832be02681c5b480a computed=absent (scripts/jj-seat-demo.sh is absent)"
    },
    {
      "severity": "error",
      "kind": "GATE_PIN_DRIFT",
      "term": "pin.report-receipt-diff",
      "declared": "23efb0908b9ebe51f158f590c6512be59aa183e5e25f268b5e0340f78f2f8927",
      "computed": "absent (scripts/report-receipt-diff.mjs is absent)",
      "detail": "pin.report-receipt-diff: declared=23efb0908b9ebe51f158f590c6512be59aa183e5e25f268b5e0340f78f2f8927 computed=absent (scripts/report-receipt-diff.mjs is absent)"
    },
    {
      "severity": "error",
      "kind": "GATE_PIN_DRIFT",
      "term": "pin.control-replay",
      "declared": "22bd0e31a74f4a58e3303f145d9f88e2ff89d890f21588b4ae2879d4a0e39dc4",
      "computed": "absent (scripts/control-replay.mjs is absent)",
      "detail": "pin.control-replay: declared=22bd0e31a74f4a58e3303f145d9f88e2ff89d890f21588b4ae2879d4a0e39dc4 computed=absent (scripts/control-replay.mjs is absent)"
    },
    {
      "severity": "error",
      "kind": "GATE_PIN_DRIFT",
      "term": "pin.harm-matrix",
      "declared": "ab123486e2fd753fc2df10d207b2d92a3759838bd3f31370402717de493f7c38",
      "computed": "absent (scripts/harm-matrix.mjs is absent)",
      "detail": "pin.harm-matrix: declared=ab123486e2fd753fc2df10d207b2d92a3759838bd3f31370402717de493f7c38 computed=absent (scripts/harm-matrix.mjs is absent)"
    },
    {
      "severity": "error",
      "kind": "GATE_PIN_DRIFT",
      "term": "pin.routed-ledger",
      "declared": "05aacb5ede6b3389a693bb71c6c1cb74281f8bab9b5bf2309027dd97d83913b1",
      "computed": "absent (scripts/routed-ledger.mjs is absent)",
      "detail": "pin.routed-ledger: declared=05aacb5ede6b3389a693bb71c6c1cb74281f8bab9b5bf2309027dd97d83913b1 computed=absent (scripts/routed-ledger.mjs is absent)"
    },
    {
      "severity": "error",
      "kind": "AXES_DRIFT",
      "term": "coverage",
      "key": "coverage",
      "declared": 10,
      "computed": 905,
      "detail": "coverage: ## Axes row=10 derived=905"
    },
    {
      "severity": "error",
      "kind": "AXES_DRIFT",
      "term": "coverage:script-layer",
      "key": "coverage_script",
      "declared": 10,
      "computed": 0,
      "detail": "coverage:script-layer: ## Axes row=10 derived=0"
    },
    {
      "severity": "error",
      "kind": "AXES_DRIFT",
      "term": "coverage:runtime-layer",
      "key": "coverage_runtime",
      "declared": 10,
      "computed": 0,
      "detail": "coverage:runtime-layer: ## Axes row=10 derived=0"
    },
    {
      "severity": "error",
      "kind": "AXES_DRIFT",
      "term": "coverage:kimi-layer",
      "key": "coverage_kimi",
      "declared": 10,
      "computed": 0,
      "detail": "coverage:kimi-layer: ## Axes row=10 derived=0"
    }
  ],
  "errors": 46,
  "warnings": 0,
  "durationMs": 12
}
```

### proxy-note-removed

Expected (recorded before run): frozen proxy has no O arm: no OMP_NOTE_MISSING and no coverage_omp term; other existing drift may remain

```sh
# cwd: /fast/scratch/hyaku/kumitate-r76/K76SentinelBoundary/lane
node /fast/scratch/hyaku/kumitate-r76/K76SentinelBoundary/lane/scripts/proxy-check.mjs --self /fast/scratch/hyaku/kumitate-r76/K76SentinelBoundary/fixtures/self-removed --src /fast/scratch/hyaku/kumitate-r76/K76SentinelBoundary/lane --kimi-root /fast/scratch/hyaku/kumitate-r76/K76SentinelBoundary/fixtures/kimi --json
```

Exit: `1`.

```text
{
  "contract": "kumitate-proxy-v1",
  "mode": "check",
  "ok": false,
  "verdict": "DRIFT",
  "exitCode": 1,
  "self": "/fast/scratch/hyaku/kumitate-r76/K76SentinelBoundary/fixtures/self-removed",
  "scorecard": "/fast/scratch/hyaku/kumitate-r76/K76SentinelBoundary/fixtures/self-removed/SCORECARD.md",
  "src": "/fast/scratch/hyaku/kumitate-r76/K76SentinelBoundary/lane",
  "pin": null,
  "srcRev": null,
  "kimiRoot": "/fast/scratch/hyaku/kumitate-r76/K76SentinelBoundary/fixtures/kimi",
  "strict": false,
  "terms": {
    "A": 0,
    "C": 33,
    "C1": 19,
    "C1_total": 19,
    "C2": 181,
    "C2_total": 1,
    "operability": 9,
    "coverage": 1810,
    "S_members": 29,
    "S_sections": 0,
    "R_members": 0,
    "R_sections": 0,
    "coverage_script": 0,
    "coverage_runtime": 0,
    "C1k": 5,
    "C1k_total": 5,
    "K_members": 0,
    "K_sections": 0,
    "coverage_kimi": 0,
    "pins": {
      "pin.cite-check": {
        "file": "scripts/cite-check.mjs",
        "declared": "7484274fff4c540f39d6df829708c86c78f25e803a4657ab4d7bae6d025acdf2",
        "computed": null,
        "match": false
      },
      "pin.surface-probe": {
        "file": "scripts/surface-probe.mjs",
        "declared": "79081e1b3c661590f4fafe5d2343993d966873cb4422b7b5462434366a084d35",
        "computed": null,
        "match": false
      },
      "pin.round-gate": {
        "file": "scripts/round-gate.mjs",
        "declared": "09d4d79238f44dd74a0fa727c8f6b193c3fa87200c02340e2f4b3dcc6b354594",
        "computed": null,
        "match": false
      },
      "pin.proxy-check": {
        "file": "scripts/proxy-check.mjs",
        "declared": "92465ddc7ad57111e5a946f83af2788adfd63deb28ab6af49f13fde454eabf2e",
        "computed": null,
        "match": false
      },
      "pin.claims-check": {
        "file": "scripts/claims-check.mjs",
        "declared": "de3433b5465a2f2d22c538537e3f9c67e37dc2605888b2ff77adc49264abfe14",
        "computed": null,
        "match": false
      },
      "pin.kimi-census": {
        "file": "scripts/kimi-census.mjs",
        "declared": "73bea81ccdb7cf27234636d9d4c84af2fc7a8a9a25c201bf42c783d7da9dc3e1",
        "computed": null,
        "match": false
      }
    },
    "pinsMatched": 0,
    "pinsTotal": 6,
    "declared": {
      "A": "833",
      "C": "33",
      "C1": "19",
      "C1_total": "19",
      "C2": "181",
      "C2_total": "181",
      "S_members": "88",
      "S_sections": "88",
      "R_members": "92",
      "R_sections": "92",
      "coverage_script": "10",
      "coverage_runtime": "10",
      "C1k": "5",
      "C1k_total": "5",
      "K_members": "55",
      "K_sections": "55",
      "coverage_kimi": "10",
      "pin.cite-check": "7484274fff4c540f39d6df829708c86c78f25e803a4657ab4d7bae6d025acdf2",
      "pin.surface-probe": "79081e1b3c661590f4fafe5d2343993d966873cb4422b7b5462434366a084d35",
      "pin.round-gate": "09d4d79238f44dd74a0fa727c8f6b193c3fa87200c02340e2f4b3dcc6b354594",
      "pin.proxy-check": "92465ddc7ad57111e5a946f83af2788adfd63deb28ab6af49f13fde454eabf2e",
      "pin.claims-check": "de3433b5465a2f2d22c538537e3f9c67e37dc2605888b2ff77adc49264abfe14",
      "pin.kimi-census": "73bea81ccdb7cf27234636d9d4c84af2fc7a8a9a25c201bf42c783d7da9dc3e1"
    },
    "stanzaLine": 287
  },
  "findings": [
    {
      "severity": "error",
      "kind": "A_DRIFT",
      "term": "A",
      "declared": 833,
      "computed": 0,
      "delta": "-833",
      "detail": "A: declared=833 computed=0 delta=-833"
    },
    {
      "severity": "error",
      "kind": "C2_TOTAL_DRIFT",
      "term": "C2_total",
      "declared": 181,
      "computed": 1,
      "delta": "-180",
      "detail": "C2_total: declared=181 computed=1 delta=-180"
    },
    {
      "severity": "error",
      "kind": "S_MEMBERS_DRIFT",
      "term": "S_members",
      "declared": 88,
      "computed": 29,
      "delta": "-59",
      "detail": "S_members: declared=88 computed=29 delta=-59"
    },
    {
      "severity": "error",
      "kind": "S_SECTIONS_DRIFT",
      "term": "S_sections",
      "declared": 88,
      "computed": 0,
      "delta": "-88",
      "detail": "S_sections: declared=88 computed=0 delta=-88"
    },
    {
      "severity": "error",
      "kind": "R_MEMBERS_DRIFT",
      "term": "R_members",
      "declared": 92,
      "computed": 0,
      "delta": "-92",
      "detail": "R_members: declared=92 computed=0 delta=-92"
    },
    {
      "severity": "error",
      "kind": "R_SECTIONS_DRIFT",
      "term": "R_sections",
      "declared": 92,
      "computed": 0,
      "delta": "-92",
      "detail": "R_sections: declared=92 computed=0 delta=-92"
    },
    {
      "severity": "error",
      "kind": "COVERAGE_SCRIPT_DRIFT",
      "term": "coverage_script",
      "declared": 10,
      "computed": 0,
      "delta": "-10",
      "detail": "coverage_script: declared=10 computed=0 delta=-10"
    },
    {
      "severity": "error",
      "kind": "COVERAGE_RUNTIME_DRIFT",
      "term": "coverage_runtime",
      "declared": 10,
      "computed": 0,
      "delta": "-10",
      "detail": "coverage_runtime: declared=10 computed=0 delta=-10"
    },
    {
      "severity": "error",
      "kind": "K_MEMBERS_DRIFT",
      "term": "K_members",
      "declared": 55,
      "computed": 0,
      "delta": "-55",
      "detail": "K_members: declared=55 computed=0 delta=-55"
    },
    {
      "severity": "error",
      "kind": "K_SECTIONS_DRIFT",
      "term": "K_sections",
      "declared": 55,
      "computed": 0,
      "delta": "-55",
      "detail": "K_sections: declared=55 computed=0 delta=-55"
    },
    {
      "severity": "error",
      "kind": "COVERAGE_KIMI_DRIFT",
      "term": "coverage_kimi",
      "declared": 10,
      "computed": 0,
      "delta": "-10",
      "detail": "coverage_kimi: declared=10 computed=0 delta=-10"
    },
    {
      "severity": "error",
      "kind": "PIN_DRIFT",
      "term": "pin.cite-check",
      "declared": "7484274fff4c540f39d6df829708c86c78f25e803a4657ab4d7bae6d025acdf2",
      "computed": "absent (scripts/cite-check.mjs is absent)",
      "detail": "pin.cite-check: declared=7484274fff4c540f39d6df829708c86c78f25e803a4657ab4d7bae6d025acdf2 computed=absent (scripts/cite-check.mjs is absent)"
    },
    {
      "severity": "error",
      "kind": "PIN_DRIFT",
      "term": "pin.surface-probe",
      "declared": "79081e1b3c661590f4fafe5d2343993d966873cb4422b7b5462434366a084d35",
      "computed": "absent (scripts/surface-probe.mjs is absent)",
      "detail": "pin.surface-probe: declared=79081e1b3c661590f4fafe5d2343993d966873cb4422b7b5462434366a084d35 computed=absent (scripts/surface-probe.mjs is absent)"
    },
    {
      "severity": "error",
      "kind": "PIN_DRIFT",
      "term": "pin.round-gate",
      "declared": "09d4d79238f44dd74a0fa727c8f6b193c3fa87200c02340e2f4b3dcc6b354594",
      "computed": "absent (scripts/round-gate.mjs is absent)",
      "detail": "pin.round-gate: declared=09d4d79238f44dd74a0fa727c8f6b193c3fa87200c02340e2f4b3dcc6b354594 computed=absent (scripts/round-gate.mjs is absent)"
    },
    {
      "severity": "error",
      "kind": "PIN_DRIFT",
      "term": "pin.proxy-check",
      "declared": "92465ddc7ad57111e5a946f83af2788adfd63deb28ab6af49f13fde454eabf2e",
      "computed": "absent (scripts/proxy-check.mjs is absent)",
      "detail": "pin.proxy-check: declared=92465ddc7ad57111e5a946f83af2788adfd63deb28ab6af49f13fde454eabf2e computed=absent (scripts/proxy-check.mjs is absent)"
    },
    {
      "severity": "error",
      "kind": "PIN_DRIFT",
      "term": "pin.claims-check",
      "declared": "de3433b5465a2f2d22c538537e3f9c67e37dc2605888b2ff77adc49264abfe14",
      "computed": "absent (scripts/claims-check.mjs is absent)",
      "detail": "pin.claims-check: declared=de3433b5465a2f2d22c538537e3f9c67e37dc2605888b2ff77adc49264abfe14 computed=absent (scripts/claims-check.mjs is absent)"
    },
    {
      "severity": "error",
      "kind": "PIN_DRIFT",
      "term": "pin.kimi-census",
      "declared": "73bea81ccdb7cf27234636d9d4c84af2fc7a8a9a25c201bf42c783d7da9dc3e1",
      "computed": "absent (scripts/kimi-census.mjs is absent)",
      "detail": "pin.kimi-census: declared=73bea81ccdb7cf27234636d9d4c84af2fc7a8a9a25c201bf42c783d7da9dc3e1 computed=absent (scripts/kimi-census.mjs is absent)"
    },
    {
      "severity": "error",
      "kind": "GATE_PIN_DRIFT",
      "term": "pin.anchor-truth",
      "declared": "43c37865a5b3ea5912c5be0e1243fa222642b6be0ef6a1103ee03a287614b23d",
      "computed": "absent (scripts/anchor-truth.mjs is absent)",
      "detail": "pin.anchor-truth: declared=43c37865a5b3ea5912c5be0e1243fa222642b6be0ef6a1103ee03a287614b23d computed=absent (scripts/anchor-truth.mjs is absent)"
    },
    {
      "severity": "error",
      "kind": "GATE_PIN_DRIFT",
      "term": "pin.sources-check",
      "declared": "5402b2103bb9e3ccd76f7bf3f5880f2249f809c78cee4766a75e3cf30b69f434",
      "computed": "absent (scripts/sources-check.mjs is absent)",
      "detail": "pin.sources-check: declared=5402b2103bb9e3ccd76f7bf3f5880f2249f809c78cee4766a75e3cf30b69f434 computed=absent (scripts/sources-check.mjs is absent)"
    },
    {
      "severity": "error",
      "kind": "GATE_PIN_DRIFT",
      "term": "pin.wave-census",
      "declared": "76447250f9de1f7e9258d0dfe9544feba18d6c8723db37e77e6ca422235f45f4",
      "computed": "absent (scripts/wave-census.mjs is absent)",
      "detail": "pin.wave-census: declared=76447250f9de1f7e9258d0dfe9544feba18d6c8723db37e77e6ca422235f45f4 computed=absent (scripts/wave-census.mjs is absent)"
    },
    {
      "severity": "error",
      "kind": "GATE_PIN_DRIFT",
      "term": "pin.gate-mutants",
      "declared": "177f6cbbd70d7503263d00c77357893658a0e393ac722d43034ebd7e429bb717",
      "computed": "absent (scripts/gate-mutants.mjs is absent)",
      "detail": "pin.gate-mutants: declared=177f6cbbd70d7503263d00c77357893658a0e393ac722d43034ebd7e429bb717 computed=absent (scripts/gate-mutants.mjs is absent)"
    },
    {
      "severity": "error",
      "kind": "GATE_PIN_DRIFT",
      "term": "pin.omp-census",
      "declared": "c7065f9d973d772707ae71d87437e7a4df095bd29fb749de63c27f4512a853ed",
      "computed": "absent (scripts/omp-census.mjs is absent)",
      "detail": "pin.omp-census: declared=c7065f9d973d772707ae71d87437e7a4df095bd29fb749de63c27f4512a853ed computed=absent (scripts/omp-census.mjs is absent)"
    },
    {
      "severity": "error",
      "kind": "GATE_PIN_DRIFT",
      "term": "pin.cap-run",
      "declared": "e1d0a79b0c38a5d1d60ccba37ab7dd0528d1ee63982aae3213e28572a8d754c5",
      "computed": "absent (scripts/cap-run.mjs is absent)",
      "detail": "pin.cap-run: declared=e1d0a79b0c38a5d1d60ccba37ab7dd0528d1ee63982aae3213e28572a8d754c5 computed=absent (scripts/cap-run.mjs is absent)"
    },
    {
      "severity": "error",
      "kind": "GATE_PIN_DRIFT",
      "term": "pin.bind-oracle",
      "declared": "c3929a97c5b24303b1acadb62ebaa4778768585597cf7fc06d2996602ec211e5",
      "computed": "absent (scripts/bind-oracle.mjs is absent)",
      "detail": "pin.bind-oracle: declared=c3929a97c5b24303b1acadb62ebaa4778768585597cf7fc06d2996602ec211e5 computed=absent (scripts/bind-oracle.mjs is absent)"
    },
    {
      "severity": "error",
      "kind": "GATE_PIN_DRIFT",
      "term": "pin.cap-spawn",
      "declared": "1fde43fb7f68992fb5e692188cd9afd3581d1d16c720815adc8d3a1ca3c734d0",
      "computed": "absent (scripts/cap-spawn.mjs is absent)",
      "detail": "pin.cap-spawn: declared=1fde43fb7f68992fb5e692188cd9afd3581d1d16c720815adc8d3a1ca3c734d0 computed=absent (scripts/cap-spawn.mjs is absent)"
    },
    {
      "severity": "error",
      "kind": "GATE_PIN_DRIFT",
      "term": "pin.counter-rerun",
      "declared": "c002523fc39b521f57a3ee86c3ff154e06aea8ccd6738501138460141abc369b",
      "computed": "absent (scripts/counter-rerun.mjs is absent)",
      "detail": "pin.counter-rerun: declared=c002523fc39b521f57a3ee86c3ff154e06aea8ccd6738501138460141abc369b computed=absent (scripts/counter-rerun.mjs is absent)"
    },
    {
      "severity": "error",
      "kind": "GATE_PIN_DRIFT",
      "term": "pin.receipt-attest",
      "declared": "ba5139b1290b204054c043df3140554757116e6fbaf19783b502a24ed1b2ce31",
      "computed": "absent (scripts/receipt-attest.mjs is absent)",
      "detail": "pin.receipt-attest: declared=ba5139b1290b204054c043df3140554757116e6fbaf19783b502a24ed1b2ce31 computed=absent (scripts/receipt-attest.mjs is absent)"
    },
    {
      "severity": "error",
      "kind": "GATE_PIN_DRIFT",
      "term": "pin.counter-pins",
      "declared": "060d5d8662701340da24f483316053be86bed246510c541a0518492e7b29028e",
      "computed": "absent (scripts/counter-pins.mjs is absent)",
      "detail": "pin.counter-pins: declared=060d5d8662701340da24f483316053be86bed246510c541a0518492e7b29028e computed=absent (scripts/counter-pins.mjs is absent)"
    },
    {
      "severity": "error",
      "kind": "GATE_PIN_DRIFT",
      "term": "pin.source-capture",
      "declared": "39bdeb39298672dd3ed81036013de542ad6925587cb84f330ab69de6799d28f5",
      "computed": "absent (scripts/source-capture.mjs is absent)",
      "detail": "pin.source-capture: declared=39bdeb39298672dd3ed81036013de542ad6925587cb84f330ab69de6799d28f5 computed=absent (scripts/source-capture.mjs is absent)"
    },
    {
      "severity": "error",
      "kind": "GATE_PIN_DRIFT",
      "term": "pin.source-dupes",
      "declared": "ead88b22fbd1525d13dd46c67b427041dc331d202a005285adea813c32530d7a",
      "computed": "absent (scripts/source-dupes.mjs is absent)",
      "detail": "pin.source-dupes: declared=ead88b22fbd1525d13dd46c67b427041dc331d202a005285adea813c32530d7a computed=absent (scripts/source-dupes.mjs is absent)"
    },
    {
      "severity": "error",
      "kind": "GATE_PIN_DRIFT",
      "term": "pin.readme-map",
      "declared": "b1c8bf97eb01fdb2ebfd46521c8e805fa2c36f8e10ce9740531162cd0b8ee74e",
      "computed": "absent (scripts/readme-map.mjs is absent)",
      "detail": "pin.readme-map: declared=b1c8bf97eb01fdb2ebfd46521c8e805fa2c36f8e10ce9740531162cd0b8ee74e computed=absent (scripts/readme-map.mjs is absent)"
    },
    {
      "severity": "error",
      "kind": "GATE_PIN_DRIFT",
      "term": "pin.receipt-evidence",
      "declared": "0ea6b66df7dcff4dc9381c688a5182fb1fe2c3be5353df7a52d3c6f2e006972c",
      "computed": "absent (scripts/receipt-evidence.mjs is absent)",
      "detail": "pin.receipt-evidence: declared=0ea6b66df7dcff4dc9381c688a5182fb1fe2c3be5353df7a52d3c6f2e006972c computed=absent (scripts/receipt-evidence.mjs is absent)"
    },
    {
      "severity": "error",
      "kind": "GATE_PIN_DRIFT",
      "term": "pin.cite-sources",
      "declared": "7211be845cd994e6dc3bf1b1ed821a0464d9aa1cce6f4695412095a9fc2921a6",
      "computed": "absent (scripts/cite-sources.mjs is absent)",
      "detail": "pin.cite-sources: declared=7211be845cd994e6dc3bf1b1ed821a0464d9aa1cce6f4695412095a9fc2921a6 computed=absent (scripts/cite-sources.mjs is absent)"
    },
    {
      "severity": "error",
      "kind": "GATE_PIN_DRIFT",
      "term": "pin.dispatch-evidence",
      "declared": "765a7aa3ef6b11f18548da4a91f98c42e07b825229135c30010f092cc1af65cc",
      "computed": "absent (scripts/dispatch-evidence.mjs is absent)",
      "detail": "pin.dispatch-evidence: declared=765a7aa3ef6b11f18548da4a91f98c42e07b825229135c30010f092cc1af65cc computed=absent (scripts/dispatch-evidence.mjs is absent)"
    },
    {
      "severity": "error",
      "kind": "GATE_PIN_DRIFT",
      "term": "pin.make-dispatch-actual",
      "declared": "f0194314e98e87e86eb1329f36411e249911f9a0120aa4feb702562a54bf3dc9",
      "computed": "absent (scripts/make-dispatch-actual.mjs is absent)",
      "detail": "pin.make-dispatch-actual: declared=f0194314e98e87e86eb1329f36411e249911f9a0120aa4feb702562a54bf3dc9 computed=absent (scripts/make-dispatch-actual.mjs is absent)"
    },
    {
      "severity": "error",
      "kind": "GATE_PIN_DRIFT",
      "term": "pin.inline-dispatch-evidence",
      "declared": "9f1978a93deb0001396008f48ceae2f154bf7bdc145fff36721e29ef9ce1e741",
      "computed": "absent (scripts/inline-dispatch-evidence.mjs is absent)",
      "detail": "pin.inline-dispatch-evidence: declared=9f1978a93deb0001396008f48ceae2f154bf7bdc145fff36721e29ef9ce1e741 computed=absent (scripts/inline-dispatch-evidence.mjs is absent)"
    },
    {
      "severity": "error",
      "kind": "GATE_PIN_DRIFT",
      "term": "pin.plan-before-ready",
      "declared": "4d927ce36c6728c13f48fd7e44d30b8982b5570ea020930e24ca07f0250554ab",
      "computed": "absent (scripts/plan-before-ready.sh is absent)",
      "detail": "pin.plan-before-ready: declared=4d927ce36c6728c13f48fd7e44d30b8982b5570ea020930e24ca07f0250554ab computed=absent (scripts/plan-before-ready.sh is absent)"
    },
    {
      "severity": "error",
      "kind": "GATE_PIN_DRIFT",
      "term": "pin.jj-seat-demo",
      "declared": "80d174dba368e71296da65f59d93e60fb5e37673f429e3d832be02681c5b480a",
      "computed": "absent (scripts/jj-seat-demo.sh is absent)",
      "detail": "pin.jj-seat-demo: declared=80d174dba368e71296da65f59d93e60fb5e37673f429e3d832be02681c5b480a computed=absent (scripts/jj-seat-demo.sh is absent)"
    },
    {
      "severity": "error",
      "kind": "GATE_PIN_DRIFT",
      "term": "pin.report-receipt-diff",
      "declared": "23efb0908b9ebe51f158f590c6512be59aa183e5e25f268b5e0340f78f2f8927",
      "computed": "absent (scripts/report-receipt-diff.mjs is absent)",
      "detail": "pin.report-receipt-diff: declared=23efb0908b9ebe51f158f590c6512be59aa183e5e25f268b5e0340f78f2f8927 computed=absent (scripts/report-receipt-diff.mjs is absent)"
    },
    {
      "severity": "error",
      "kind": "GATE_PIN_DRIFT",
      "term": "pin.control-replay",
      "declared": "22bd0e31a74f4a58e3303f145d9f88e2ff89d890f21588b4ae2879d4a0e39dc4",
      "computed": "absent (scripts/control-replay.mjs is absent)",
      "detail": "pin.control-replay: declared=22bd0e31a74f4a58e3303f145d9f88e2ff89d890f21588b4ae2879d4a0e39dc4 computed=absent (scripts/control-replay.mjs is absent)"
    },
    {
      "severity": "error",
      "kind": "GATE_PIN_DRIFT",
      "term": "pin.harm-matrix",
      "declared": "ab123486e2fd753fc2df10d207b2d92a3759838bd3f31370402717de493f7c38",
      "computed": "absent (scripts/harm-matrix.mjs is absent)",
      "detail": "pin.harm-matrix: declared=ab123486e2fd753fc2df10d207b2d92a3759838bd3f31370402717de493f7c38 computed=absent (scripts/harm-matrix.mjs is absent)"
    },
    {
      "severity": "error",
      "kind": "GATE_PIN_DRIFT",
      "term": "pin.routed-ledger",
      "declared": "05aacb5ede6b3389a693bb71c6c1cb74281f8bab9b5bf2309027dd97d83913b1",
      "computed": "absent (scripts/routed-ledger.mjs is absent)",
      "detail": "pin.routed-ledger: declared=05aacb5ede6b3389a693bb71c6c1cb74281f8bab9b5bf2309027dd97d83913b1 computed=absent (scripts/routed-ledger.mjs is absent)"
    },
    {
      "severity": "error",
      "kind": "AXES_DRIFT",
      "term": "coverage",
      "key": "coverage",
      "declared": 10,
      "computed": 1810,
      "detail": "coverage: ## Axes row=10 derived=1810"
    },
    {
      "severity": "error",
      "kind": "AXES_DRIFT",
      "term": "coverage:script-layer",
      "key": "coverage_script",
      "declared": 10,
      "computed": 0,
      "detail": "coverage:script-layer: ## Axes row=10 derived=0"
    },
    {
      "severity": "error",
      "kind": "AXES_DRIFT",
      "term": "coverage:runtime-layer",
      "key": "coverage_runtime",
      "declared": 10,
      "computed": 0,
      "detail": "coverage:runtime-layer: ## Axes row=10 derived=0"
    },
    {
      "severity": "error",
      "kind": "AXES_DRIFT",
      "term": "coverage:kimi-layer",
      "key": "coverage_kimi",
      "declared": 10,
      "computed": 0,
      "detail": "coverage:kimi-layer: ## Axes row=10 derived=0"
    }
  ],
  "errors": 46,
  "warnings": 0,
  "durationMs": 12
}
```

### proxy-root-empty

Expected (recorded before run): exit 1 EMPTY; coverage_omp=0, never 10; frozen parser expected exit 64 unknown argument

```sh
# cwd: /fast/scratch/hyaku/kumitate-r76/K76SentinelBoundary/lane
node /fast/scratch/hyaku/kumitate-r76/K76SentinelBoundary/lane/scripts/proxy-check.mjs --omp-root /fast/scratch/hyaku/kumitate-r76/K76SentinelBoundary/fixtures/root-empty --json
```

Exit: `64`.

```text
proxy-check: unknown argument: --omp-root

usage: node scripts/proxy-check.mjs [--self DIR] [--scorecard FILE] [--src DIR] [--kimi-root DIR] [--pin FILE] [--json] [--strict]
       node scripts/proxy-check.mjs --tip-drift [--origin DIR] [--pin FILE] [--self DIR] [--json]
       node scripts/proxy-check.mjs --selftest
       node scripts/proxy-check.mjs -h|--help
contract id: kumitate-proxy-v1

modes:
  default      recompute A C C1 C1_total C2 C2_total, the layer terms
               (S_members S_sections R_members R_sections), the kimi-block terms
               (C1k C1k_total K_members K_sections), the five scores
               (operability, coverage, coverage:script-layer,
               coverage:runtime-layer, coverage:kimi-layer) and the seven script
               pins, then compare
               them with the kumitate-proxy-v1 block in --scorecard (default
               <self>/SCORECARD.md) and with that file's ## Axes rows.
               The legacy counts are self-only; the layer terms are counted
               over --src, walked exactly once and in process by
               probeSections() imported from scripts/claims-check.mjs, and the
               layer numerator counts only member sections that gate grades
               inside the row's declared family (out-of-family sections are
               excluded); the kimi-block terms count over --kimi-root (lstat and
               readdir only — secret members are never opened) plus the
               corpus/knowledge/kimi-*.md headings under --self; K_sections is
               the count of DISTINCT K members those headings name, and a heading
               whose only candidate is a basename shared by several members names
               none of them (warn K_SECTION_AMBIGUOUS).
               With an active origin pin (--pin, or the default pin file under
               --self) the tree is resolved through the pin and its HEAD is
               asserted; the verdict then carries src-rev=<12 hex>.
  --tip-drift  compare the required pin with the live origin HEAD (read-only git);
               report IN_SYNC (0), MOVED (1), or FAIL-CLOSED (2).
               Missing default pins are PIN_MALFORMED in this mode.
  --selftest   hermetic fixture suite (tmp dirs only; never reads this repo)
  -h | --help  print this text, exit 0

options:
  --self DIR         repo root to measure (default: the repo containing this script)
  --scorecard FILE   claim block + registry rows + ## Axes rows (default <self>/SCORECARD.md)
  --src DIR          origin tree the layer terms count over, via the claims gate
                     (default: the pin's clone when a pin is active, else $UFO_SRC,
                     else the first existing of
                     ~/Projects/ufo-fsd-alpha and ~/Projects/origin-work/ufo-fsd-alpha);
                     a non-directory is refused as SRC_NOT_A_DIR (exit 2)
  --origin DIR       live tree for --tip-drift only (default: $UFO_ORIGIN, else
                     the first existing legacy origin candidate listed above)
  --pin FILE         origin pin (kumitate-origin-pin-v1), default <self>/.ufo/pins/origin.json
                     when that file exists; resolves --src from the pin's clone,
                     asserts git rev-parse HEAD equals the pin revision
                     (SRC_REV_MISMATCH / SRC_REV_UNVERIFIABLE, exit 2) and prints
                     src-rev=<12 hex> in the verdict. A missing default pin file
                     is not an error — the run is then unpinned and unchanged.
  --kimi-root DIR    kimi installation the K terms count over
                     (default: $KIMI_ROOT or /home/vgpnk/.kimi-code);
                     a non-directory is refused as KIMI_ROOT_NOT_A_DIR (exit 2),
                     never scored 0
  --json             one machine-readable object on stdout
  --strict           promote warn-level findings (PIN_UNPINNED,
                     K_SECTION_AMBIGUOUS) to failure

exit map: 0 match · 1 drift (findings; warnings too under --strict) · 2 fail-closed · 64 usage
```

### proxy-root-file

Expected (recorded before run): exit 2 OMP_ROOT_NOT_A_DIR; frozen parser expected exit 64 unknown argument

```sh
# cwd: /fast/scratch/hyaku/kumitate-r76/K76SentinelBoundary/lane
node /fast/scratch/hyaku/kumitate-r76/K76SentinelBoundary/lane/scripts/proxy-check.mjs --omp-root /fast/scratch/hyaku/kumitate-r76/K76SentinelBoundary/fixtures/root-file --json
```

Exit: `64`.

```text
proxy-check: unknown argument: --omp-root

usage: node scripts/proxy-check.mjs [--self DIR] [--scorecard FILE] [--src DIR] [--kimi-root DIR] [--pin FILE] [--json] [--strict]
       node scripts/proxy-check.mjs --tip-drift [--origin DIR] [--pin FILE] [--self DIR] [--json]
       node scripts/proxy-check.mjs --selftest
       node scripts/proxy-check.mjs -h|--help
contract id: kumitate-proxy-v1

modes:
  default      recompute A C C1 C1_total C2 C2_total, the layer terms
               (S_members S_sections R_members R_sections), the kimi-block terms
               (C1k C1k_total K_members K_sections), the five scores
               (operability, coverage, coverage:script-layer,
               coverage:runtime-layer, coverage:kimi-layer) and the seven script
               pins, then compare
               them with the kumitate-proxy-v1 block in --scorecard (default
               <self>/SCORECARD.md) and with that file's ## Axes rows.
               The legacy counts are self-only; the layer terms are counted
               over --src, walked exactly once and in process by
               probeSections() imported from scripts/claims-check.mjs, and the
               layer numerator counts only member sections that gate grades
               inside the row's declared family (out-of-family sections are
               excluded); the kimi-block terms count over --kimi-root (lstat and
               readdir only — secret members are never opened) plus the
               corpus/knowledge/kimi-*.md headings under --self; K_sections is
               the count of DISTINCT K members those headings name, and a heading
               whose only candidate is a basename shared by several members names
               none of them (warn K_SECTION_AMBIGUOUS).
               With an active origin pin (--pin, or the default pin file under
               --self) the tree is resolved through the pin and its HEAD is
               asserted; the verdict then carries src-rev=<12 hex>.
  --tip-drift  compare the required pin with the live origin HEAD (read-only git);
               report IN_SYNC (0), MOVED (1), or FAIL-CLOSED (2).
               Missing default pins are PIN_MALFORMED in this mode.
  --selftest   hermetic fixture suite (tmp dirs only; never reads this repo)
  -h | --help  print this text, exit 0

options:
  --self DIR         repo root to measure (default: the repo containing this script)
  --scorecard FILE   claim block + registry rows + ## Axes rows (default <self>/SCORECARD.md)
  --src DIR          origin tree the layer terms count over, via the claims gate
                     (default: the pin's clone when a pin is active, else $UFO_SRC,
                     else the first existing of
                     ~/Projects/ufo-fsd-alpha and ~/Projects/origin-work/ufo-fsd-alpha);
                     a non-directory is refused as SRC_NOT_A_DIR (exit 2)
  --origin DIR       live tree for --tip-drift only (default: $UFO_ORIGIN, else
                     the first existing legacy origin candidate listed above)
  --pin FILE         origin pin (kumitate-origin-pin-v1), default <self>/.ufo/pins/origin.json
                     when that file exists; resolves --src from the pin's clone,
                     asserts git rev-parse HEAD equals the pin revision
                     (SRC_REV_MISMATCH / SRC_REV_UNVERIFIABLE, exit 2) and prints
                     src-rev=<12 hex> in the verdict. A missing default pin file
                     is not an error — the run is then unpinned and unchanged.
  --kimi-root DIR    kimi installation the K terms count over
                     (default: $KIMI_ROOT or /home/vgpnk/.kimi-code);
                     a non-directory is refused as KIMI_ROOT_NOT_A_DIR (exit 2),
                     never scored 0
  --json             one machine-readable object on stdout
  --strict           promote warn-level findings (PIN_UNPINNED,
                     K_SECTION_AMBIGUOUS) to failure

exit map: 0 match · 1 drift (findings; warnings too under --strict) · 2 fail-closed · 64 usage
```

### proxy-root-newline-backslash

Expected (recorded before run): exit 1 finding(s), never coverage_omp=10; frozen parser expected exit 64 unknown argument

```sh
# cwd: /fast/scratch/hyaku/kumitate-r76/K76SentinelBoundary/lane
node /fast/scratch/hyaku/kumitate-r76/K76SentinelBoundary/lane/scripts/proxy-check.mjs --omp-root /fast/scratch/hyaku/kumitate-r76/K76SentinelBoundary/fixtures/root-odd --json
```

Exit: `64`.

```text
proxy-check: unknown argument: --omp-root

usage: node scripts/proxy-check.mjs [--self DIR] [--scorecard FILE] [--src DIR] [--kimi-root DIR] [--pin FILE] [--json] [--strict]
       node scripts/proxy-check.mjs --tip-drift [--origin DIR] [--pin FILE] [--self DIR] [--json]
       node scripts/proxy-check.mjs --selftest
       node scripts/proxy-check.mjs -h|--help
contract id: kumitate-proxy-v1

modes:
  default      recompute A C C1 C1_total C2 C2_total, the layer terms
               (S_members S_sections R_members R_sections), the kimi-block terms
               (C1k C1k_total K_members K_sections), the five scores
               (operability, coverage, coverage:script-layer,
               coverage:runtime-layer, coverage:kimi-layer) and the seven script
               pins, then compare
               them with the kumitate-proxy-v1 block in --scorecard (default
               <self>/SCORECARD.md) and with that file's ## Axes rows.
               The legacy counts are self-only; the layer terms are counted
               over --src, walked exactly once and in process by
               probeSections() imported from scripts/claims-check.mjs, and the
               layer numerator counts only member sections that gate grades
               inside the row's declared family (out-of-family sections are
               excluded); the kimi-block terms count over --kimi-root (lstat and
               readdir only — secret members are never opened) plus the
               corpus/knowledge/kimi-*.md headings under --self; K_sections is
               the count of DISTINCT K members those headings name, and a heading
               whose only candidate is a basename shared by several members names
               none of them (warn K_SECTION_AMBIGUOUS).
               With an active origin pin (--pin, or the default pin file under
               --self) the tree is resolved through the pin and its HEAD is
               asserted; the verdict then carries src-rev=<12 hex>.
  --tip-drift  compare the required pin with the live origin HEAD (read-only git);
               report IN_SYNC (0), MOVED (1), or FAIL-CLOSED (2).
               Missing default pins are PIN_MALFORMED in this mode.
  --selftest   hermetic fixture suite (tmp dirs only; never reads this repo)
  -h | --help  print this text, exit 0

options:
  --self DIR         repo root to measure (default: the repo containing this script)
  --scorecard FILE   claim block + registry rows + ## Axes rows (default <self>/SCORECARD.md)
  --src DIR          origin tree the layer terms count over, via the claims gate
                     (default: the pin's clone when a pin is active, else $UFO_SRC,
                     else the first existing of
                     ~/Projects/ufo-fsd-alpha and ~/Projects/origin-work/ufo-fsd-alpha);
                     a non-directory is refused as SRC_NOT_A_DIR (exit 2)
  --origin DIR       live tree for --tip-drift only (default: $UFO_ORIGIN, else
                     the first existing legacy origin candidate listed above)
  --pin FILE         origin pin (kumitate-origin-pin-v1), default <self>/.ufo/pins/origin.json
                     when that file exists; resolves --src from the pin's clone,
                     asserts git rev-parse HEAD equals the pin revision
                     (SRC_REV_MISMATCH / SRC_REV_UNVERIFIABLE, exit 2) and prints
                     src-rev=<12 hex> in the verdict. A missing default pin file
                     is not an error — the run is then unpinned and unchanged.
  --kimi-root DIR    kimi installation the K terms count over
                     (default: $KIMI_ROOT or /home/vgpnk/.kimi-code);
                     a non-directory is refused as KIMI_ROOT_NOT_A_DIR (exit 2),
                     never scored 0
  --json             one machine-readable object on stdout
  --strict           promote warn-level findings (PIN_UNPINNED,
                     K_SECTION_AMBIGUOUS) to failure

exit map: 0 match · 1 drift (findings; warnings too under --strict) · 2 fail-closed · 64 usage
```

### proxy-root-symlink

Expected (recorded before run): exit 2 OMP_ROOT_NOT_A_DIR (census lstat rejects symlink root); frozen parser expected exit 64 unknown argument

```sh
# cwd: /fast/scratch/hyaku/kumitate-r76/K76SentinelBoundary/lane
node /fast/scratch/hyaku/kumitate-r76/K76SentinelBoundary/lane/scripts/proxy-check.mjs --omp-root /fast/scratch/hyaku/kumitate-r76/K76SentinelBoundary/fixtures/root-link --json
```

Exit: `64`.

```text
proxy-check: unknown argument: --omp-root

usage: node scripts/proxy-check.mjs [--self DIR] [--scorecard FILE] [--src DIR] [--kimi-root DIR] [--pin FILE] [--json] [--strict]
       node scripts/proxy-check.mjs --tip-drift [--origin DIR] [--pin FILE] [--self DIR] [--json]
       node scripts/proxy-check.mjs --selftest
       node scripts/proxy-check.mjs -h|--help
contract id: kumitate-proxy-v1

modes:
  default      recompute A C C1 C1_total C2 C2_total, the layer terms
               (S_members S_sections R_members R_sections), the kimi-block terms
               (C1k C1k_total K_members K_sections), the five scores
               (operability, coverage, coverage:script-layer,
               coverage:runtime-layer, coverage:kimi-layer) and the seven script
               pins, then compare
               them with the kumitate-proxy-v1 block in --scorecard (default
               <self>/SCORECARD.md) and with that file's ## Axes rows.
               The legacy counts are self-only; the layer terms are counted
               over --src, walked exactly once and in process by
               probeSections() imported from scripts/claims-check.mjs, and the
               layer numerator counts only member sections that gate grades
               inside the row's declared family (out-of-family sections are
               excluded); the kimi-block terms count over --kimi-root (lstat and
               readdir only — secret members are never opened) plus the
               corpus/knowledge/kimi-*.md headings under --self; K_sections is
               the count of DISTINCT K members those headings name, and a heading
               whose only candidate is a basename shared by several members names
               none of them (warn K_SECTION_AMBIGUOUS).
               With an active origin pin (--pin, or the default pin file under
               --self) the tree is resolved through the pin and its HEAD is
               asserted; the verdict then carries src-rev=<12 hex>.
  --tip-drift  compare the required pin with the live origin HEAD (read-only git);
               report IN_SYNC (0), MOVED (1), or FAIL-CLOSED (2).
               Missing default pins are PIN_MALFORMED in this mode.
  --selftest   hermetic fixture suite (tmp dirs only; never reads this repo)
  -h | --help  print this text, exit 0

options:
  --self DIR         repo root to measure (default: the repo containing this script)
  --scorecard FILE   claim block + registry rows + ## Axes rows (default <self>/SCORECARD.md)
  --src DIR          origin tree the layer terms count over, via the claims gate
                     (default: the pin's clone when a pin is active, else $UFO_SRC,
                     else the first existing of
                     ~/Projects/ufo-fsd-alpha and ~/Projects/origin-work/ufo-fsd-alpha);
                     a non-directory is refused as SRC_NOT_A_DIR (exit 2)
  --origin DIR       live tree for --tip-drift only (default: $UFO_ORIGIN, else
                     the first existing legacy origin candidate listed above)
  --pin FILE         origin pin (kumitate-origin-pin-v1), default <self>/.ufo/pins/origin.json
                     when that file exists; resolves --src from the pin's clone,
                     asserts git rev-parse HEAD equals the pin revision
                     (SRC_REV_MISMATCH / SRC_REV_UNVERIFIABLE, exit 2) and prints
                     src-rev=<12 hex> in the verdict. A missing default pin file
                     is not an error — the run is then unpinned and unchanged.
  --kimi-root DIR    kimi installation the K terms count over
                     (default: $KIMI_ROOT or /home/vgpnk/.kimi-code);
                     a non-directory is refused as KIMI_ROOT_NOT_A_DIR (exit 2),
                     never scored 0
  --json             one machine-readable object on stdout
  --strict           promote warn-level findings (PIN_UNPINNED,
                     K_SECTION_AMBIGUOUS) to failure

exit map: 0 match · 1 drift (findings; warnings too under --strict) · 2 fail-closed · 64 usage
```

### proxy-root-unreadable

Expected (recorded before run): exit 2 OMP_ROOT_NOT_A_DIR/EACCES as own non-root user; frozen parser expected exit 64 unknown argument

```sh
# cwd: /fast/scratch/hyaku/kumitate-r76/K76SentinelBoundary/lane
node /fast/scratch/hyaku/kumitate-r76/K76SentinelBoundary/lane/scripts/proxy-check.mjs --omp-root /fast/scratch/hyaku/kumitate-r76/K76SentinelBoundary/fixtures/root-unreadable --json
```

Exit: `64`.

```text
proxy-check: unknown argument: --omp-root

usage: node scripts/proxy-check.mjs [--self DIR] [--scorecard FILE] [--src DIR] [--kimi-root DIR] [--pin FILE] [--json] [--strict]
       node scripts/proxy-check.mjs --tip-drift [--origin DIR] [--pin FILE] [--self DIR] [--json]
       node scripts/proxy-check.mjs --selftest
       node scripts/proxy-check.mjs -h|--help
contract id: kumitate-proxy-v1

modes:
  default      recompute A C C1 C1_total C2 C2_total, the layer terms
               (S_members S_sections R_members R_sections), the kimi-block terms
               (C1k C1k_total K_members K_sections), the five scores
               (operability, coverage, coverage:script-layer,
               coverage:runtime-layer, coverage:kimi-layer) and the seven script
               pins, then compare
               them with the kumitate-proxy-v1 block in --scorecard (default
               <self>/SCORECARD.md) and with that file's ## Axes rows.
               The legacy counts are self-only; the layer terms are counted
               over --src, walked exactly once and in process by
               probeSections() imported from scripts/claims-check.mjs, and the
               layer numerator counts only member sections that gate grades
               inside the row's declared family (out-of-family sections are
               excluded); the kimi-block terms count over --kimi-root (lstat and
               readdir only — secret members are never opened) plus the
               corpus/knowledge/kimi-*.md headings under --self; K_sections is
               the count of DISTINCT K members those headings name, and a heading
               whose only candidate is a basename shared by several members names
               none of them (warn K_SECTION_AMBIGUOUS).
               With an active origin pin (--pin, or the default pin file under
               --self) the tree is resolved through the pin and its HEAD is
               asserted; the verdict then carries src-rev=<12 hex>.
  --tip-drift  compare the required pin with the live origin HEAD (read-only git);
               report IN_SYNC (0), MOVED (1), or FAIL-CLOSED (2).
               Missing default pins are PIN_MALFORMED in this mode.
  --selftest   hermetic fixture suite (tmp dirs only; never reads this repo)
  -h | --help  print this text, exit 0

options:
  --self DIR         repo root to measure (default: the repo containing this script)
  --scorecard FILE   claim block + registry rows + ## Axes rows (default <self>/SCORECARD.md)
  --src DIR          origin tree the layer terms count over, via the claims gate
                     (default: the pin's clone when a pin is active, else $UFO_SRC,
                     else the first existing of
                     ~/Projects/ufo-fsd-alpha and ~/Projects/origin-work/ufo-fsd-alpha);
                     a non-directory is refused as SRC_NOT_A_DIR (exit 2)
  --origin DIR       live tree for --tip-drift only (default: $UFO_ORIGIN, else
                     the first existing legacy origin candidate listed above)
  --pin FILE         origin pin (kumitate-origin-pin-v1), default <self>/.ufo/pins/origin.json
                     when that file exists; resolves --src from the pin's clone,
                     asserts git rev-parse HEAD equals the pin revision
                     (SRC_REV_MISMATCH / SRC_REV_UNVERIFIABLE, exit 2) and prints
                     src-rev=<12 hex> in the verdict. A missing default pin file
                     is not an error — the run is then unpinned and unchanged.
  --kimi-root DIR    kimi installation the K terms count over
                     (default: $KIMI_ROOT or /home/vgpnk/.kimi-code);
                     a non-directory is refused as KIMI_ROOT_NOT_A_DIR (exit 2),
                     never scored 0
  --json             one machine-readable object on stdout
  --strict           promote warn-level findings (PIN_UNPINNED,
                     K_SECTION_AMBIGUOUS) to failure

exit map: 0 match · 1 drift (findings; warnings too under --strict) · 2 fail-closed · 64 usage
```

## Delivery self-check

Accuracy 4/5: exact raw outputs retained; no post-change result inferred. Completeness 3/5: all named cases attempted, but absent frozen C2 implementation and O proxy arm prevent behavioral discharge. Clarity 4/5: baseline/blocked statuses separated from census observations; full proxy stderr makes appendix long. Actionability 4/5: exact commands and smallest remediations supplied; implementation revision still requires independent rerun. Conciseness 3/5: full stderr/JSON retained for evidence fidelity. Overall 3.6/5. Highest-impact improvement is execution against the measured implementation, not guessing its outcome. User agreement expected only with the explicit blocked qualification.
