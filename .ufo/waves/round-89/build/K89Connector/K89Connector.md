# K89Connector — Sibling Overlap, Adjacency Scan & UFO-FSD Synthesis

Seat: `K89Connector` (subagent, leaf connector)  
Lane: `kumitate-shokunin`  
Base revision: `a5d2503393fc5646acb6468888d8b12a445bf62d`  
Freeze commit: `adfc2f55675f760eaf8b59f80033f926500cd951`  
Claim: C1 — Operability, capability acquisition `receipt-bind` v3 (contract `kumitate-receipt-bind-v3`)  
Build directory: `/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-89/build/K89Connector/`  
Report: `.ufo/waves/round-89/w1/K89Connector.md`  

---

## 1. Sibling Overlap & Adjacency Scan

Scan of all sibling lanes (`/home/vgpnk/Projects/shokunin/*-shokunin/PROVINCE.md` and `corpus/README.md` `## Frontier`) across four declared technical areas:
- **(a)** Receipt/evidence binding to a judged revision
- **(b)** Realpath-based containment or path-escape checking
- **(c)** Byte-order-mark (BOM) handling
- **(d)** Git object-mode inspection

| Sibling Path:Line | Topic | Quoted Claim | Verdict | Analysis & Boundary |
|---|---|---|---|---|
| `mori-shokunin/corpus/README.md:934` | (a) | `Receipt # cmd: execution binding (S611 POSIX token recognition, S610 CPython argv, S609 normpath, S607 shlex tokenizer scope; S608 rejected) \| knowledge/execution-binding-r89.md \| The r87 gate binds a bound path only as a file the command executes: POSIX word-start comments, quote-aware invocation split, wrapper unwrapping, interpreter options (-W/-X values, -c/-m run no file, sh -c parsed), path identity.` | **Adjacent** | Mori parses the execution semantics of shell command invocations in `# cmd:`. Kumitate intentionally restricts instrument extraction to the second whitespace token of `cmd=` and does not model shell grammars. |
| `mori-shokunin/PROVINCE.md:658` | (a) | `...and each binding is verified against the named path's bytes at the receipt's own revision (.ufo/waves/round-85/contract.md P-C2, count-c2.py, make-receipts.sh, QUALITY 175). This is a record rule over lane evidence, not a census surface.` | **Adjacent** | Mori verifies its own lane record headers (`# counter-sha256:` at `# rev:`). Kumitate verifies close receipts in `.ufo/waves/round-*/close/*.txt` against git blob revisions. |
| `kaidoku-shokunin/PROVINCE.md:522` | (a) | `The receipt readers bound to their producers — --check-receipt binds the measured revision, the instrument hash to the blob at that revision, every carrier row to the frozen table (id/pin/source/kind/ceiling)...` | **Adjacent** | Kaidoku binds reverse-engineering carrier rows and unpacker tools to git blobs at measured revisions in its own route. |
| `kaidoku-shokunin/PROVINCE.md:624` | (a) | `receipt_auth (a named receipt carries a 40-hex rev and an instrument.sha256 re-derived from the blob at that rev)` | **Adjacent** | Kaidoku's `attack-gate.py` checks that receipt records name a 40-hex revision and sha256 matching the committed instrument. Kumitate's `receipt-bind.mjs` binds close receipts to instruments at judged revisions. |
| `kake-shokunin/PROVINCE.md:498` | (a) | `scripts/instrument_receipts.py (C2) — binds each live gate-registry instrument to a committed {sha256, bytes, selftest_mode} receipt at a named revision and re-derives it from committed bytes` | **Adjacent** | Kake binds gate instruments to committed JSON inventory receipts. Kumitate verifies round close receipts against arbitrary instruments invoked in `cmd=`. |
| `kama-shokunin/PROVINCE.md:315` | (a) | `tools/round73-receipt-claim-binding.py (the frozen r72 receipt-tip binding plus a claim pass over...)` | **Adjacent** | Kama binds offline model evaluation receipts to round tips. Independent domain instrument. |
| `kengaku-shokunin/PROVINCE.md:104` | (a) | `tools/round72-receipt-tip-binding.py:60-68 share the ancestor check and add intervening-drift classification; mori tools/mori-retention-reconcile.py:169-177 binds resolved full revision` | **Adjacent** | Kengaku evaluates agent performance benchmarks and classifies intervening commit drift. |
| `souji-shokunin/corpus/README.md:470` | (a) | `C2 is ../tools/souji-receipt-run.py: a counter is re-derived at a full durable revision in a private --no-local clone, and the receipt binds the revision, the tool path, the sha256 of the counter... re-reads the tree at the receipt's revision and refuses a digest that is not the committed blob (RECEIPT-TOOL-DIGEST-MISMATCH).` | **Adjacent** | Souji verifies worktree drift and cleanup receipts in temporary git clones. |
| `tameshi-shokunin/corpus/README.md:88` | (a) | `F11 \| trusted-executor binding by committed blob identity (round-58 C2 successor) \| S289 \| partly held (round 59, knowledge/executor-source-binding.md)...` | **Adjacent** | Tameshi binds test suite execution to committed blob identity. |
| `chousa-shokunin/corpus/README.md:1064` | (a) | `knowledge/receipt-binding-r38.md \| Round-38 note: receipts bind pre==post gate hashes, counter/expect/receipt digests, verified by a census-tied verifier; the wave-1 kills it closed; integrity-and-self-consistency, NOT authorship` | **Adjacent** | Chousa binds research citation receipts to counter/expect digests. |
| `chousa-shokunin/corpus/README.md:1348` | (a) | `corpus/knowledge/receipt-digest-provenance-r67.md — a receipt digest is evidence only when it re-derives from committed bytes; S161–S162... Enforced by tools/digest-in-tree.py` | **Adjacent** | Chousa enforces digest presence in git history. |
| `kumitate-shokunin/SKILL.md:646` | (a) | `receipt-bind \| gate \| node scripts/receipt-bind.mjs --dir <receipt-dir> --rev <40-hex> [--lane <dir>] [--json] → RECEIPT_BIND: CLEAN\|DRIFT\|FAIL-CLOSED` | **Deepening** | Kumitate round 89 deepens its own gate `receipt-bind` (registered round 87, v2 round 88) to v3, adding strict revision isolation, realpath lane membership, BOM tolerance, and mode-120000 refusal. |
| `mori-shokunin/corpus/knowledge/containment-timed-supersede-r38.md:22` | (b) | `Containment is decided on the **resolved canonical path**: os.path.realpath eliminates the symlinks a lexical check cannot see, so a prefix test on realpath(p) is the containment test, and rejecting absolute or .. segments before any filesystem call is a cheap pre-filter, not the decision (S226).` | **Adjacent** | Mori established the general principle that containment requires canonical path resolution. Kumitate deepens its own instrument resolver by applying `realpath` to absolute tokens (specifically `/proc/self/root` aliases) to recognize in-lane files. |
| `kaidoku-shokunin/PROVINCE.md:531` | (b) | `Every child of the packed route under the four-key allowlist, with the OBSERVED environ recorded — launcher-pop PYTHONCOERCECLOCALE exclusion declared; capture threaded through packer, REA analyze/decompile, readelf and the route's git; os.path.commonpath containment` | **Adjacent** | Kaidoku enforces containment of child execution environments via `commonpath`. |
| `kake-shokunin/PROVINCE.md:128` | (b) | `containment for five hostile fixture shapes (scripts/citing_set_hostile_selftest.py);` | **Adjacent** | Kake tests path traversal containment on citing-set fixtures. |
| `mado-shokunin/PROVINCE.md:33` | (b) | `tools/mado-watchplan.py \| ...with stat, lstat, realpath, glob, isdir, lexists and islink on those paths only` | **Adjacent** | Mado uses `realpath` for Hyprland config file path resolution. |
| `souji-shokunin/corpus/README.md:819` | (b) | `F1 git-native housekeeping vs receipts: worktree-drift tool, condition-level coverage (r42 C3: the refusal, containment, discovery, write and exit conditions of tools/souji-worktree-drift.py observed by a fixture, tool behaviour not bytes)` | **Adjacent** | Souji verifies worktree containment conditions. |
| `kagi-shokunin/corpus/README.md:74` | (c) | `op.env contract probe (gate) \| corpus/op-ref-probe.sh \| the two-parser contract + masking scope as a verdict: fixture-generated plain-value env files, op run vs the-janitor refs key sets, dotenv edge classes (#/quote/CRLF/duplicate/${:-}/single-quote), two-file precedence and union, the hard-failure class (malformed line / BOM / directory — resolver refuses, inventory clears)...` | **Adjacent** | Kagi treats BOM as a hard parsing failure in `.env` configuration files. Kumitate strips a leading UTF-8 BOM on close receipts to prevent hiding `rev=`. |
| `kake-shokunin/corpus/knowledge/robots-txt-rules.md:31` | (c) | `Lane reading: the parser consumes exactly the first 512000 bytes, drops an initial UTF-8 BOM, replacement-decodes invalid UTF-8, splits...` | **Adjacent** | Kake drops UTF-8 BOM in robots.txt web documents. Different domain artifact. |
| `tameshi-shokunin/corpus/lessons/round-73.md:24` | (c) | `drift on every sweep; a UTF-8 BOM is a setup exit 2, never silently` | **Adjacent** | Tameshi refuses BOM in test definition JSON files (`bom-present`). |
| `souji-shokunin/corpus/lessons/round-41.md:192` | (c) | `FIELD-MISSING C0 Round; CRLF/BOM Round: tolerated; paths may contain spaces; a NUL in a path no longer crashes; git path quoting off so` | **Adjacent** | Souji tolerates leading BOM on round record header tokens. |
| `kaidoku-shokunin/corpus/lessons/round-78.md:58` | (d) | `ConnectorSibling found a real gap in receipt_auth: git show <rev>:<path> returns link text for a mode-120000 symlink and a tree pseudo-header for a mode-040000 tree, so a receipt could authenticate a pin that is not instrument bytes. Closed in-round by blob_mode and the mode check (1a99064b), with four selftest cases.` | **Adjacent** | Kaidoku discovered in round 78 that `git show` returns link text for mode-120000 symlinks and tree headers for 040000, adding `blob_mode` checks to `receipt_auth`. Kumitate deepens its own gate `receipt-bind.mjs` with `SYMLINK_INSTRUMENT` checking mode 120000 via `git ls-tree`. |
| `kake-shokunin/corpus/lessons/round-72.md:61` | (d) | `C2 counter, symlinked SKILL.md: git show <rev>:SKILL.md on a mode-120000 blob returns the link text; a commit making SKILL.md a symlink to /dev/null gives met=True (SentinelC2 R2).` | **Adjacent** | Kake identified symlinked `SKILL.md` defeating `git show`. |
| `tameshi-shokunin/corpus/knowledge/non-regular-receipt-boundary.md:7` | (d) | `Git's Index entry section distinguishes regular-file and symbolic-link object types. This grounds the distinction, not Python filesystem behavior. ... At base c63467bb, the receipt sweep follows the symlink and measures both entries bound; the revision gate passes both... The changed instruments inspect each leaf with lstat: the sweep names the link unbound detail=not-regular-file; the gate names RECEIPT_NOT_REGULAR.` | **Adjacent** | Tameshi distinguishes symlink receipts from regular file receipts via `lstat` and git index object types. Kumitate inspects the *instrument's* object mode in git. |

---

## 2. Kumitate PROVINCE Band Verdict

**Verdict:** The round's ground already sits in **Core** (`kumitate-shokunin/PROVINCE.md:15`).

**Evidence & Rationale:**
In `kumitate-shokunin/PROVINCE.md`:
- Line 10: `### Core — governed at member level, gated`
- Line 15: `- The lane's own instruments \`scripts/*.mjs\` (registry: \`SKILL.md\` §Gate registry) and its learning registry \`corpus/SOURCES.md\` (checked by \`scripts/sources-check.mjs\`).`

The instrument moved in this round is `scripts/receipt-bind.mjs`. It was entered into the gate registry in round 87 (`SKILL.md:589, 646`: `receipt-bind | gate | node scripts/receipt-bind.mjs...`).
Because `scripts/receipt-bind.mjs` already sits in Core as a registered member of `scripts/*.mjs`, round 89 is a deepening and boundary hardening of existing Core ground (`kumitate-receipt-bind-v2` → `kumitate-receipt-bind-v3`). It is **not** frontier ground being moved into core.

---

## 3. Cross-Domain Evidence (Reported, Not Absorbed)

1. **Mori (`mori-shokunin`) — Shell Invocations & Tokenizer Execution Grammar:**
   - *Evidence:* `mori-shokunin/corpus/README.md:934`, `knowledge/execution-binding-r89.md` (S609–S611).
   - *Nature:* Mori parses `# cmd:` execution bindings via CPython argv semantics, POSIX word-start comment rules, quote-aware invocation splitting, wrapper unwrapping, and interpreter options (`-W`, `-X`, `-c`, `-m`).
   - *Disposition:* Kumitate deliberately refuses shell grammar parsing; its contract declares `instrument := the SECOND whitespace token of cmd=` and explicitly refuses to inspect command arguments. Reported to orchestrator, not absorbed.
2. **Kaidoku (`kaidoku-shokunin`) — Binary Carrier Routing & Kernel-Side Environ Tracing:**
   - *Evidence:* `kaidoku-shokunin/PROVINCE.md:522, 544, 552, 624`.
   - *Nature:* Kaidoku performs packed-ELF reverse engineering, UPX carrier verification, and kernel-side `/proc/<pid>/environ` ancestor tracking for unblob and disassembler routes.
   - *Disposition:* Reverse engineering and binary carrier unpacking belong strictly to Kaidoku. Reported, not absorbed.
3. **Kagi (`kagi-shokunin`) — Secret Management & Dotenv Hard Failures:**
   - *Evidence:* `kagi-shokunin/corpus/README.md:74`.
   - *Nature:* Kagi tests `op.env` secret injection and enforces hard failure on BOM in environment configuration.
   - *Disposition:* Secret vault and 1Password environment injection belong to Kagi. Reported, not absorbed.
4. **Tameshi (`tameshi-shokunin`) — Mutation Kill Framework & 4-Bit Index Object Types:**
   - *Evidence:* `tameshi-shokunin/corpus/knowledge/non-regular-receipt-boundary.md:1-11` (S291).
   - *Nature:* Tameshi defines mutation kill matrices and grounded index-entry type distinctions for receipt files.
   - *Disposition:* Mutation testing framework belongs to Tameshi. Reported, not absorbed.
5. **Kake (`kake-shokunin`) — Web Crawler & Sitemap BOM Tolerances:**
   - *Evidence:* `kake-shokunin/corpus/knowledge/robots-txt-rules.md:31`, `sitemap-formats.md:193`.
   - *Nature:* Web document parsing (robots.txt, sitemaps, hreflang) tolerances for UTF-8 BOM.
   - *Disposition:* Web document standards belong to Kake. Reported, not absorbed.

---

## 4. UFO-FSD Connector Synthesis (Non-Obvious Move)

### Evidence
1. **Adversarial Scorer Review:** Review seat `K89Review` demonstrated that a seat-constructed candidate (`cand-skip-mode.mjs`, sha256 `f976e065...`, build artifact `.ufo/waves/round-89/build/K89Review/cand-skip-mode.mjs`) scores **30/30** under the frozen probe `probe89-c1.mjs` (`.ufo/waves/round-89/build/K89Review/probe-cand-skip-mode.txt`).
2. **Skipped Behaviour by Construction:** `cand-skip-mode.mjs` skips git mode-120000 inspection by replacing `git ls-tree` with a crude regex shape test (`if (!bytes.includes(10) && /^[\w.\-\/]+$/.test(bytes)) throw SYMLINK_INSTRUMENT`), and skips realpath membership by doing a literal string prefix strip (`.replace(/^\/proc\/self\/root(?=\/)/, '')`).
3. **Unprobed Inputs Divergence (`demos.txt`):**
   - **D1 (Symlink target with spaces):** `cand-skip-mode.mjs` evaluates to `CLEAN` (fails open: binds link text digest as if valid), while the integrated worktree candidate `scripts/receipt-bind.mjs` evaluates to `FAIL-CLOSED SYMLINK_INSTRUMENT`.
   - **D3 (In-lane instrument via symlinked ancestor):** `cand-skip-mode.mjs` evaluates to `DRIFT external=1` (falsely treats in-lane file as external), while `scripts/receipt-bind.mjs` evaluates to `CLEAN external=0` at the judged revision.
4. **Frozen Kill Rule:** `plan.md:32-37` dictates that any seat-constructed tool skipping a claimed behaviour that reaches 30/30 makes C1 **UNMET** (rejected-honest-stop).
5. **Sibling Precedent:** Kaidoku round 78 (`kaidoku-shokunin/corpus/lessons/round-78.md:58-61`) previously discovered that `git show` returns link text for mode-120000 blobs and solved it via `blob_mode` inspection; Mori round 38 (`mori-shokunin/corpus/knowledge/containment-timed-supersede-r38.md:20-26`) established that canonical `realpath` resolution is required because lexical checks miss symlink/ancestor redirection.

### Affected Axes
- **Operability (`f_O` / capability acquisition `receipt-bind` v3):** Primary axis of round 89. Operability cannot advance if the frozen kill rule fires.
- **Verification / Calibration:** Scorer fixture discrimination power. Under-discriminating single-path fixtures in `probe89-c1.mjs` (arms 28 and 30) repeat the exact failure pattern of rounds 87 and 88.

### Contradiction
The integrated v3 instrument in the worktree (`scripts/receipt-bind.mjs`) is genuinely correct and defect-free on all 30 arms as well as the unprobed discriminator inputs (D1 and D3). However, the frozen scorer `probe89-c1.mjs` drew its arm 30 symlink target as a single bare word without whitespace (`tool-<nonce>.mjs`) and arm 28 as a literal `/proc/self/root` string prefix. This allowed a shortcut construction (`cand-skip-mode.mjs`) to reach 30/30, triggering the frozen kill rule.

### Proposed Move
A compatible, non-obvious synthesis that improves verification rigor and safeguards operability without violating the frozen probe or falsifying the record:

1. **Explicit Honest-Stop Recognition in Round 89 Closure:**
   Do not suppress, soften, or re-weight the kill rule. Record that `cand-skip-mode.mjs` reached 30/30 on `probe89-c1.mjs`, honestly tripping the frozen kill rule for round 89. This preserves the absolute integrity of Kumitate's falsifiable kill rules (Harm Rule H4 / protocol conformance).
2. **Embed the Missing Discriminators into the Instrument's Own Self-Test (M):**
   While `probe89-c1.mjs` cannot be edited during round 89, `scripts/receipt-bind.mjs --selftest` is the lane's own permanent regression gate (Harm Rule H5). Synthesize Kaidoku's mode check and Mori's canonical containment into the permanent self-test:
   - Add a selftest arm with a symlink instrument pointing to a target with spaces (D1: `alpha space.mjs`).
   - Add a selftest arm with an in-lane instrument reached through a symlinked parent directory (D3).
   This immediately prevents any regression or shortcut tool from passing `receipt-bind.mjs --selftest` in the lane.
3. **Pre-Register Scorer v4 for Round 90:**
   Pre-register for round 90 a 32-arm scorer (`probe90-c1.mjs`) whose fixtures:
   - Draw randomized multi-word symlink targets (`link-<nonce>.mjs -> target with spaces <nonce>.mjs`), killing any text-shape regex shortcuts.
   - Test in-lane ancestor directory symlinks rather than relying solely on `/proc/self/root`.
   - Include a positive in-lane `..` relative token twin (preventing naive `..` bans).

### Risks
- *Second-Order Verification Risk:* Hardening `--selftest` with symlink fixtures requires git repo initialization in scratch; this is already isolated in `--work` / `mkdtemp` and poses zero worktree leakage risk.
- *Substrate Dependency:* `/proc/self/root` is Linux-specific; `realpathSync` handles standard POSIX symlinks portably.

### Verification
1. Verify worktree instrument passes 30/30 on probe89-c1:
   `node .ufo/waves/round-89/probe/probe89-c1.mjs --lane . --work /fast/scratch/hyaku/kumitate-r89/K89Connector/chk --rev a5d2503393fc5646acb6468888d8b12a445bf62d`
   -> `C89_C1: HELD held=30/30` exit 0.
2. Verify candidate discrimination on D1 and D3 via `demos.sh`:
   `bash .ufo/waves/round-89/build/K89Review/demos.sh`
   -> D1 `cand-skip-mode.mjs` binds CLEAN (fail open), `scripts/receipt-bind.mjs` returns `SYMLINK_INSTRUMENT` (correct).
   -> D3 `cand-skip-mode.mjs` returns `DRIFT external=1` (fail closed on in-lane file), `scripts/receipt-bind.mjs` returns `CLEAN external=0` (correct).
3. Verify sibling repositories remained untouched:
   `for d in ../*-shokunin; do git -C "$d" status --porcelain; done` -> unchanged.
