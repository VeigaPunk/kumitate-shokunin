# K87Connector — Census, Runner Scan, Contract Audit, and UFO-FSD Synthesis

Seat: connector, round 87 (kumitate-shokunin), wave w1. Leaf seat: no subagent dispatch, no git mutations.
All cited paths are absolute. No production files modified.

---

## 1. Independent Re-derived Base Census (Rounds 74–86)

### 1.1 Method & Reproducible Command
The census was re-derived independently via a purpose-built script under the seat's build directory before reading `.ufo/waves/round-87/open/census-toolbind.txt`. Every close directory from round 74 to round 86 (`.ufo/waves/round-{74..86}/close/*.txt`) was inspected for:
- `rev=<40-hex>`
- `cmd=<cmdline>` (extracting the second whitespace token as instrument)
- `tool_sha256=<64-hex>`

For receipts with both `cmd=` and `tool_sha256=`, the instrument was hashed at the receipt's `rev=` (using `git show <rev>:<rel>` for lane files, or disk read for external tools) and compared to `tool_sha256=`.

**Single reproducible command:**
```bash
node /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-87/build/K87Connector/census-toolbind.mjs
```

**Observed stdout:**
```
receipts=239 bound=1 mismatch=9 unresolved=0 no_cmd=229
```

### 1.2 Breakdown of Results
- **`receipts=239`**: Total committed close receipt `.txt` files across rounds 74–86 (round-74: 12, round-75: 17, round-76: 25, round-77: 25, round-78: 12, round-79: 12, round-80: 22, round-81: 21, round-82: 20, round-83: 29, round-84: 25, round-85: 9, round-86: 10).
- **`bound=1`**: Exactly 1 receipt binds to its named subject at its revision:
  - `round-86/close/selftest.txt`: `cmd=node scripts/counter-receipt.mjs --selftest ...`, `tool_sha256=e95313700aaf8430c51e0f8abdb991ab168519eecf9803cce3fac51154f31069`. At `rev=19b4e440e83ea9d618708003f36c3a799eb13e08`, `sha256(scripts/counter-receipt.mjs) === e95313700aaf...`.
- **`mismatch=9`**: Exactly 9 receipts carry `cmd=` and `tool_sha256=`, but the digest does not match the named instrument (all 9 are in round 86, where `run-close.mjs:24` stamped the hash of `scripts/counter-receipt.mjs` onto every case):
  1. `round-86/close/c1-probe.txt`: names `.ufo/waves/round-86/probe/probe86-c1.mjs` (actual `a59dabdbd8f2...` vs declared `e95313700aaf...`).
  2. `round-86/close/census.txt`: names external `/home/vgpnk/Projects/shokunin/scripts/sources-census.sh` (actual `3fb7261569f4...` vs declared `e95313700aaf...`).
  3. `round-86/close/map-selftest.txt`: names `scripts/readme-map.mjs` (actual `fc119ab60569...` vs declared `e95313700aaf...`).
  4. `round-86/close/map.txt`: names `scripts/readme-map.mjs` (actual `fc119ab60569...` vs declared `e95313700aaf...`).
  5. `round-86/close/plan.txt`: names `scripts/plan-before-ready.sh` (actual `4d927ce36c67...` vs declared `e95313700aaf...`).
  6. `round-86/close/proxy-selftest.txt`: names `scripts/proxy-check.mjs` (actual `fd51dc98ab07...` vs declared `e95313700aaf...`).
  7. `round-86/close/proxy.txt`: names `scripts/proxy-check.mjs` (actual `fd51dc98ab07...` vs declared `e95313700aaf...`).
  8. `round-86/close/ready.txt`: names `scripts/ready-handoff.mjs` (actual `d6e6ba8a20a0...` vs declared `e95313700aaf...`).
  9. `round-86/close/spotcheck.txt`: names `scripts/spotcheck-adopt.mjs` (actual `e2b0f0decace...` vs declared `e95313700aaf...`).
- **`unresolved=0`**: All named instruments in rounds carrying commands resolved to existing files at their recorded revisions.
- **`no_cmd=229`**: Receipts lacking binding metadata (220 from rounds 74–84, plus 9 from round 85).
  - *Strict sub-breakdown*: 225 receipts carry neither `cmd=` nor `tool_sha256=`. Exactly 4 receipts in round 85 (`c1-probe.txt`, `content-variation.txt`, `history-v2.txt`, `selftest.txt`) carry `rev=` and `cmd=`, but lack `tool_sha256=`.

### 1.3 Diff Against L1 File (`open/census-toolbind.txt`)
Detailed comparison against `/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-87/open/census-toolbind.txt`:
1. **Summary Line Agreement**: Both yield identical totals on line 1:
   `receipts=239 bound=1 mismatch=9 unresolved=0 no_cmd=229`
2. **Disagreements in File Content**:
   - **Conflation of `no_cmd` vs missing hash**: L1's file labels all 229 non-binding receipts uniformly as `NO_CMD_OR_HASH`. This obscures that 4 receipts in round 85 had valid `cmd=` and `rev=` lines and were only missing `tool_sha256=`.
   - **Omission of BOUND Detail Row**: L1's file contains 239 total lines: 1 summary line plus 238 detail rows. The single bound receipt (`round-86 | selftest.txt | BOUND | scripts/counter-receipt.mjs`) was **completely omitted** from the table in `open/census-toolbind.txt`, leaving only 9 MISMATCH rows and 229 NO_CMD_OR_HASH rows. The full 239-row table is preserved in `/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-87/build/K87Connector/census-details.txt`.

---

## 2. Cross-Round Close-Runner Scan

Every runner script across `.ufo/waves/` that produces or manages close receipts was scanned for the one-hash-for-every-case pattern:

| File | Hashing Line | Hash Behavior | Classification |
|---|---|---|---|
| `/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-86/run-close.mjs` | **line 24**: `const hash=createHash('sha256').update(readFileSync(`${lane}/scripts/counter-receipt.mjs`)).digest('hex');` | Hashes `scripts/counter-receipt.mjs` inside `for (const [name,cmd,args] of cases)` and writes `tool_sha256=${hash}` (line 26) for all 10 cases | **Hashes a fixed script** (Root cause of R86-D1) |
| `/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-87/build/K87ExecClose/run-close.mjs` | **line 125**: `const digest = sha(instrumentBytes(args[0]));` (pre-flight check line 114) | Dynamically reads and hashes `args[0]` per case from worktree or disk before execution | **Hashes the invoked instrument** |
| `/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-87/build/K87ExecBind/rehearse/emit-close-receipts.mjs` | **line 85**: `const { digest, source } = digestOf(instrument);` (calling `digestOf` lines 57–64) | Resolves git blob sha at `--rev` for lane paths or disk file for external tools | **Hashes the invoked instrument** |
| `/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-83/build/close-receipts.sh` | lines 11, 15: stamps `rev=$REV`, exit code, output | Does not compute or stamp `tool_sha256=` or `cmd=` | **Hashes nothing** |
| `/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-65/build/K65ExecCloseScript/close-battery.sh` | lines 55, 61: stamps `## STEP`, cwd, base, tip, exit | Does not compute or stamp `tool_sha256=` or `cmd=` | **Hashes nothing** |
| `/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-63/build/K63R2ExecReadmeMapFinal/readme-map-close.mjs` | lines 50–54: delegates to `receipt-attest.mjs` | Records exit code in JSON format; does not hash script bytes | **Hashes nothing** |

---

## 3. Existing Instrument Contract & Documentation Audit

We inspected `scripts/report-receipt-diff.mjs` and `scripts/counter-receipt.mjs` to determine whether either already claims or performs receipt-to-instrument binding:

### 3.1 `scripts/report-receipt-diff.mjs` (Contract: `kumitate-report-receipt-diff-v4`)
- **Header & Docstring (lines 10–39)**: Audits round report markdown prose against cited receipt files in `.ufo/waves/round-N/{base,close}/*`. Checks for placeholders (`PLACEHOLDER`), unreceipted tallies (`TALLY_UNRECEIPTED`), check counts (`TALLY_CHECKS_MISMATCH`), missing/empty receipts (`RECEIPT_MISSING`, `RECEIPT_EMPTY`), dead repo pointers (`POINTER_DEAD`), and commit hash anomalies (`HASH_DEAD`, `HASH_ORPHAN`, `HASH_FOREIGN`).
- **Explicit Declared Limit (lines 35–37)**:
  > *"and a receipt written by the lane itself is trusted as written — nothing in the tree binds a receipt to a counter run (the frozen fixtures carry `rev=aaa rule=X9`, so any syntactic binding is copyable at the same cost)."*
- **Verdict**: `report-receipt-diff.mjs` explicitly disclaims binding receipts to instruments.

### 3.2 `scripts/counter-receipt.mjs` (Contract: `kumitate-counter-receipt-v3`)
- **Header & Docstring (lines 3–23)**: Reads an arm transcript within a single receipt file and reconciles arm results (`<PREFIX> arm <name> ok|FAIL`) against summary tallies (`<PREFIX>: HELD held=h/d`). Optionally checks literal `arm('...')` sites in an explicitly provided `--src COUNTER.mjs`.
- **Parser Implementation (line 52)**:
  `if (metadataAssignment.test(line) || metadataPrefix.test(line)) continue;`
  Explicitly ignores all metadata assignment lines (`^[A-Za-z_][A-Za-z0-9_-]*=`), including `cmd=`, `tool_sha256=`, and `rev=`.
- **Verdict**: `counter-receipt.mjs` does not parse or bind `cmd=` or `tool_sha256=`.

### 3.3 Conclusion
Neither existing instrument performs or claims receipt-to-instrument binding. `scripts/receipt-bind.mjs` (contract `kumitate-receipt-bind-v1`) establishes a new, non-overlapping operability capability.

---

## 4. UFO-FSD Connector Move: Synthesis Across Round Proposals

### 4.1 Evidence & Contradictions Across Wave Seats
During round 87, three distinct approaches and observations emerged across peer seats:

1. **`K87ExecBind` & `L1Reference` (`receipt-bind.mjs`)**:
   - Both implementations set `receiptRev = receipt.rev || judgedRev` (lines 240–246 in `K87ExecBind`, line 71 in `L1Reference`).
   - `--rev <40-hex>` is treated as a default fallback; if a receipt carries its own `rev=`, that `rev=` overrides the CLI argument.
   - `K87ExecBind` even added a selftest arm (`rev-per-receipt-overrides`) asserting that a receipt claiming `rev=c1` passes as CLEAN when judged at `--rev c2`.

2. **`K87Critic` Adversarial Finding (`rev-bind-canary.mjs` & `cand-a2-receiptrev.mjs`)**:
   - `K87Critic` demonstrated that allowing `receipt.rev` to override `--rev` inverts the core meaning of C1 ("bind a close receipt to the instrument its own `cmd=` names, *at a judged revision*").
   - In `K87Critic`'s canary test `t2`, `receipt-bind.mjs` judged a receipt carrying `rev=revA` (with digest at `revA`) under `--rev revB`. Because the tool used `receipt.rev` (`revA`), it reported CLEAN even though the instrument had completely changed at `revB`. This failed test `t2` (`INVERTED`).
   - A tool that allows `receipt.rev` to override `--rev` enables an adversary (or a stale runner) to launder obsolete receipts across revisions.

3. **`K87Review` Probe Boundary Hazard (`orderflip-control.mjs`)**:
   - In `probe87-c1.mjs:62`, `field(line, key)` matches `new RegExp(`${key}=(\\d+)`)` without word boundaries.
   - If a candidate outputs `mismatched=` before `matched=`, `field(line, 'matched')` matches the suffix of `mismatched=9` and returns `9` instead of `1`, breaking arms 3, 4, 5, 6, 7, and 12.

4. **`K87Sentinel` Symlink Finding (`K87Sentinel.md` Finding 2a)**:
   - In `L1Reference`, `bindDir` checks if individual receipt files are symlinks (Arm 11), but fails to check whether `--dir` itself is a symlink, allowing symlinked directories to pass as clean.

### 4.2 Affected Axes
- **`operability`** (Primary declared axis, claim C1): The capability must enforce that receipts bind at the revision requested by the operator/gate, not at an arbitrary self-asserted string.
- **`freshness`**: Ensuring that close receipts accurately reflect the tip revision being closed, preventing historical drift from going unnoticed.
- **`calibration`**: Eliminating false passes on stale receipts without introducing false rejections on valid historical fixtures (like Arm 3).

### 4.3 Proposed Move: "Authoritative Judged-Revision Git Retrieval with Receipt-Revision Consistency"
Synthesize the insights from `K87Critic`, `K87ExecBind`, `K87Sentinel`, and `K87Review` into the following unified design for `scripts/receipt-bind.mjs`:

1. **Authoritative Hash at Judged Revision**:
   - For lane instruments, the blob bytes MUST always be fetched via `git cat-file blob <judgedRev>:<rel>`, where `<judgedRev>` is the `--rev` option passed on the CLI.
   - Do NOT use `receipt.rev` to retrieve the blob. This guarantees that `receipt-bind` answers: *"Does the digest declared in this receipt match the bytes of the instrument at the revision we are judging right now?"*
   - This passes `K87Critic`'s canary test `t2` cleanly.

2. **Handling Arm 3 (`detect-r86`) Under Judged Revision**:
   - In `probe87-c1.mjs:104`, Arm 3 runs `runTool(['--dir', R86, '--rev', rev])` passing round 87's freeze revision.
   - `scripts/counter-receipt.mjs` has the identical sha256 digest (`e95313700aaf8430c51e0f8abdb991ab168519eecf9803cce3fac51154f31069`) at both `19b4e44...` (round 86) and `25a3a75...` (round 87).
   - Therefore, retrieving `counter-receipt.mjs` at `--rev` still produces `matched=1` for `selftest.txt` and `mismatched=9` for the other 9 receipts, preserving 100% compatibility with Arm 3.

3. **Strict Field Output Ordering**:
   - Enforce that `matched=` is always serialized strictly before `mismatched=` in `RECEIPT_BIND: CLEAN` and `RECEIPT_BIND: DRIFT` output lines, mitigating the unanchored regex hazard in `probe87-c1.mjs:62`.

4. **Directory Symlink Guard**:
   - In `bind()`, assert `!lstatSync(dir).isSymbolicLink()`, throwing `FailClosed('SYMLINK_RECEIPT', dir)` to seal the symlink boundary identified by `K87Sentinel`.

### 4.4 Risks & Second-Order Effects
- **Risk**: If a test creates a fixture with `rev=OLD` where an instrument differed at `OLD` vs `NEW`, reading at `--rev NEW` will report `MISMATCH` (DRIFT) instead of `CLEAN`.
- **Mitigation**: This risk is a feature: the definition of C1 is binding *at a judged revision*. If an operator judges revision `NEW`, a receipt containing bytes from `OLD` is genuinely drifted and must not read CLEAN.

### 4.5 Verification Plan
1. Run frozen probe:
   `node .ufo/waves/round-87/probe/probe87-c1.mjs --lane <lane> --work <scratch> --rev <rev>` -> `C87_C1: HELD held=12/12`.
2. Run critic canary:
   `node .ufo/waves/round-87/build/K87Critic/rev-bind-canary.mjs <lane> <revA> <revB> scripts/receipt-bind.mjs` -> `CANARY: REV-BOUND`.
3. Verify directory symlink rejection:
   Passing a symlinked directory to `--dir` exits 2 with `RECEIPT_BIND: FAIL-CLOSED SYMLINK_RECEIPT`.

---

## 5. Artifact Ledger
All artifacts written by this seat reside beneath `/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-87/build/K87Connector/`:
- `census-toolbind.mjs`: Standalone executable probe that reproduces the round 74–86 census in a single command.
- `census-details.txt`: 240-line itemized ledger of all 239 receipts across rounds 74–86 with per-receipt resolution status, instrument paths, and sha256 digests.
- Scratch root `/fast/scratch/hyaku/kumitate-r87/K87Connector/` was cleaned up completely prior to yielding.
