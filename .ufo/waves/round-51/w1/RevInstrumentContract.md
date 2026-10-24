# RevInstrumentContract — kumitate r51 wave 1 (PracticalCobra)

**Item:** Review the C1 instrument contract (plan.md §C1 + `probe/attest51-probe.mjs`) for
implementability gaps; then review `build/ExecInstrument/receipt-attest.mjs` line by line,
or — if absent — write the five trickiest ambiguities as questions with resolutions.
**Inputs read:** `.ufo/waves/round-51/plan.md` §C1 (lines 21–73, esp. 26–48, 50–66);
`.ufo/waves/round-51/probe/attest51-probe.mjs` v2 (191 lines at write time; re-reviewed
as v3, 265 lines — see Status below); `.ufo/waves/round-51/w1-taskcall.json`
(ExecInstrument item text).
**STATUS (2026-10-24, post-freeze-repair):** findings below were written against A51 **v2**
(commit `06ecbf47`, 191 lines; line citations are v2 numbers). L1 accepted **F1** and
froze it into `## Freeze repair addendum` item 4 + probe **v3** at commit **`8c07e880`**
("ledger same-digest exemption per RevInstrumentContract F1"); base re-measured v3
`ATTEST_UNMET held=0/7` at `c90b9de9` (`base/attest-base-v3.txt`, verified read). v3 adds
challenge arms **A2c/A3c** (addendum item 3, for seat CritC1's stub-kill falsification —
a distinct finding, not this report's F2). v2→v3 check map: A1→A1, A2→A2, A3→A3, A4→A4,
A5→A5; new A2c (probe lines 141–166), A3c (179–203). v3 changes this report's answers at
three points, annotated inline: F2 (missing sidecar), F3/Q2 (new pinned fields
`argv`/`stdout_sha256`), F7 (`run` must exit 0). Deliverable status unchanged:
`build/ExecInstrument/receipt-attest.mjs` still absent at update time.
**STATUS UPDATE 2 (repair 4, `8fd3cde1`):** A3c now copies the genuine sidecar
unchanged to `<rcpt>.tampered.sha256` (probe line 198) — the arm tests exactly
prelude-rewrite + untouched-sidecar (the M2 move verbatim), NOT the missing-sidecar
class. Annotations below corrected: the "missing sidecar → TAMPERED mandatory" note
(v3-era) is withdrawn to "recommended"; both strict-append (`<file>.sha256`) and
`.tampered`-stripping sidecar lookups find a stale sidecar under repair 4 and converge
to TAMPERED by hash mismatch.
**Delivered-code status:** `build/ExecInstrument/` does **not exist** as of 2026-10-23
(`find .ufo/waves/round-51/build -name 'receipt-attest*'` → no hits; `ls build/` shows only
ExecBaseCounter, ExecSelftestArms, LabratClocks, LabratM2Replay, ScoutBaselineHar,
ScoutClockSource, ScoutRandomSource, ScoutReceiptCorpora). Executor seat
ExecInstrument (kumitate-r51.VocationalAntlion) is still running. **Fallback branch taken:**
five trickiest ambiguities written as questions with resolutions (§3), plus a full gap
sweep (§2). No files edited outside this report.

---

## 1. Verdict

The contract is implementable end-to-end — the probe pins observable behavior tightly
(final verdict line + exit code only). It contained **one HIGH-severity latent trap,
now repaired**: the plan's prose for `--ledger` ("rejects a nonce already present",
plan.md line 36), read literally, made frozen check **A4 impossible to pass**, because
the doctored A3 control lives in the same ledger directory and carries the same nonce
as `attest-run-2.txt`. **Status: RESOLVED** — freeze repair addendum item 4 + A51 v3
(`8c07e880`) adopted this report's resolution verbatim (flag same-nonce+different-digest;
self and same-digest duplicates exempt). Under literal v2 semantics the instrument would
have yielded `ATTEST_UNMET` at close.

Four further ambiguities (digest-removal procedure, verdict precedence/unmapped failure
classes, sidecar byte format, selftest mechanism/output contract) can each flip a verdict
or exit code if guessed wrong; all have defensible resolutions the probe rewards.

## 2. Findings (severity order)

### F1 — HIGH — Ledger "nonce already present" contradicts A4 under the literal reading — **RESOLVED** (addendum item 4, A51 v3 `8c07e880`)

- plan.md line 34–36: `verify [--ledger <dir>] <file>` … "walks every other `*.txt`
  receipt in `<dir>` and rejects a nonce already present."
- Probe A4 (lines 132–139) runs `verify --ledger <rd> <receipt>` for each of
  `attest-run-{1,2,3}.txt` where `<rd>` = the whole extracted
  `.ufo/waves/round-51/receipts/` directory — which per plan.md line 58 and probe line 121
  also contains `attest-run-2-replayed.txt`.
- The replayed control is run-2's receipt with *only the `run-at:` prelude rewritten*
  (probe line 15–16, plan line 58–59): its JSON body — hence its `nonce` field — is
  **byte-identical** to run-2's. Its sidecar is untouched, so the file is TAMPERED.
- Literal ledger rule: verifying run-2 against `<rd>` finds a `*.txt` file containing
  run-2's nonce → `RECEIPT: REPLAY` exit 1 → A4 MISS → `ATTEST_UNMET`. The two frozen
  artifacts are mutually consistent only under a non-literal reading of "present".
- **Status: RESOLVED by L1.** `## Freeze repair addendum` item 4 (plan.md lines 181–188)
  froze the clarified contract: "`--ledger` flags a nonce only when another receipt file
  binds the SAME nonce to a DIFFERENT record digest; the target file itself and
  byte-identical duplicates (same digest) are exempt" — the resolution below verbatim.
  A51 v3 at commit `8c07e880`; base re-measured `ATTEST_UNMET held=0/7`
  (`base/attest-base-v3.txt`, verified read).
- **Resolution (required for A4):** a ledger entry counts toward "nonce already present"
  iff (a) it is not the target file itself (exclude by resolved realpath, not just
  filename), and (b) its nonce equals the target's **and** its bound record differs —
  operationally: `other.digest !== mine.digest` (digest already binds the whole body, so
  same-nonce+different-body ⇒ different digest). Optionally also require the other entry
  to self-verify; the conjunctive form (self-verifies AND same nonce AND different
  digest) is the strictest reading satisfying every probe arm: the replayed control is
  skipped both because it fails its own sidecar check and because its body is identical;
  a genuinely forged receipt (stolen nonce, new body, self-consistent digest and fresh
  sidecar — trivially forgeable since the digest is keyless) is still REPLAY. A bare
  `*.txt` glob must also exclude `*.txt.sha256` sidecars (suffix `.txt` only) and skip
  unparseable files without crashing.

### F2 — MEDIUM — Verdict precedence and unmapped failure classes

plan.md line 36–37 maps three failures (inner-digest→REPLAY, nonce-reuse→REPLAY,
sidecar→TAMPERED) but leaves unassigned:

- **Clock ordering failure** (checked per line 34: `wall_end ≥ wall_start, mono ≥ 0`) has
  no named verdict. Fail-closed default: `RECEIPT: REPLAY` exit 1 — it is a semantic
  inconsistency inside the record, same class as digest mismatch. (No probe arm reaches
  it; any choice except VALID/exit 0 is probe-safe, but REPLAY is the defensible one.)
- **Precedence when several checks fail simultaneously.** A3's control fails *only* the
  sidecar (JSON untouched ⇒ inner digest still valid), so the probe never disambiguates.
  Resolution: check **sidecar first** (TAMPERED dominates — if the bytes don't match the
  recorded hash nothing inside is trustworthy), then parse+inner-digest (REPLAY), then
  clock ordering (REPLAY), then ledger (REPLAY). Note plan line 33 lists "inner digest,
  sidecar hash, clock ordering" — that listing order is descriptive, not a precedence
  grant; byte-integrity-first is the sound order and survives the probe either way.
- **Missing vs. malformed sidecar.** plan's "unreadable 2" (line 37) covers the receipt
  file itself; the sidecar case is silent. **Repair-4 (`8fd3cde1`) resolution:** A3c
  copies the genuine sidecar to `<rcpt>.tampered.sha256` (probe line 198), so the arm
  exercises *stale* sidecar (hash mismatch), never the missing case — the
  missing-sidecar verdict is free again. Resolution: **recommend TAMPERED exit 1** for
  missing or malformed sidecar (fail-closed: the integrity companion is absent or
  broken, same class as hash mismatch), exit 2 only for the receipt file itself being
  unreadable; either reading passes every current probe arm. Sidecar lookup convention
  `<file>.sha256` strict-append is what A3/A3c exercise; a `.tampered`-stripping lookup
  also converges to TAMPERED here because the copied sidecar is byte-identical to the
  original's.
- **Structurally invalid JSON** (unparseable line, missing `nonce`/`digest`/clock fields):
  treat as REPLAY (fail-closed integrity verdict), distinct from I/O failure (exit 2) and
  argv errors (usage 64).

### F3 — MEDIUM — Digest-removal procedure and canonical-JSON definition underspecified

- plan line 31–32: "sha256 over the JSON line with the `digest` field removed." Two
  readings: textual excision of the `"digest":"…"` substring, vs. parse → delete key →
  re-canonicalize → hash. For honest canonical receipts both coincide; only the
  parse-and-re-canonicalize reading is robust for the verifier. Resolution: **verify
  recomputes by parsing the JSON line, deleting `digest`, re-serializing canonically, and
  comparing to the stored `digest` field.** The sidecar already byte-binds the file, so
  strict canonical-byte checking of the stored line is unnecessary and unrequired.
- "canonical-JSON (sorted keys)" does not specify: recursive vs. top-level sort; array
  order (argv must preserve order); whitespace; unicode/number rendering. Resolution:
  JCS-style recursive lexicographic key sort, `JSON.stringify` default separators (no
  spaces), arrays keep order; emit integers as JSON numbers (mono-span ns fits in a
  double for any realistic span — hrtime.bigint exceeds 2^53 only after ~104 days).
- Probe pins only two field names: `nonce` (line 100, truthy, and swept as a string at
  line 159 — so nonce is a **hex string**, `crypto.randomBytes(16).toString('hex')`) and
  `wall_start` (line 100, used only as Date.parse fallback when no prelude line exists).
  All other field names are free, but every semantic field (nonce, argv, exit, stdout
  sha, stderr sha, wall start/end, mono span) must be inside the digest-bound object.
- **v3 pins three more field names** (challenge arms, probe lines 157–158): `argv` must
  be a JSON array whose last element equals the probe-issued nonce string, and
  `stdout_sha256` must equal sha256 of the command's real stdout bytes. `run` must write
  exactly `<base>.txt` / `<base>.txt.sha256` (probe line 147–148 checks `<base>.txt`).

### F4 — MEDIUM-LOW — Sidecar byte format and filename-field semantics

- "GNU `sha256sum` format" (plan line 29) + ExecInstrument text "`sha256sum -c` format":
  the emitted line must be `<64hex><space><space><name>` (two spaces; GNU also accepts
  ` *` binary marker). For `sha256sum -c <base>.txt.sha256` to work portably, `<name>`
  must be the **basename** — a relative or absolute path breaks `-c` outside the writing
  cwd and breaks committed receipts. Resolution: `<hex>  <basename>`.
- **v3 probe-enforces this** (A2c, probe line 160): the probe shells real
  `/usr/bin/sha256sum -c <base>.txt.sha256` with `cwd=T`; a non-GNU or non-basename
  sidecar fails `sha256sum -c` outright. The F4 format is now mandatory, not advisory.
- Does `verify` enforce the embedded filename? Contract requires only "recomputes … the
  sidecar hash". Resolution: extract the first whitespace-delimited token as expected
  hex, compare to sha256 of the receipt bytes, **ignore** the filename field (renaming a
  receipt must not invalidate it — A2's `verify <p>` uses absolute probe-generated paths).
  Documented choice; either way passes the probe, but name-enforcement would be wrong.

### F5 — LOW — Selftest mechanism and output contract

- Probe A1 (lines 74–76): exit 0 AND the **last line of `stderr+stdout` concatenated**
  matches `/ATTEST_SELFTEST: PASS/`. Consequences: the banner must be the final stdout
  line; nothing may print to stdout after it (stderr is prepended in the concatenation,
  so late stderr can't clobber — but don't rely); regex is unanchored but a literal final
  line is the honest form. On any case failure print a FAIL line and exit 1 — never the
  PASS banner.
- "hermetic" (plan line 39): selftest runs `cwd` = the extracted tree (probe line 74,
  `{cwd: T}`) — must do all I/O under `fs.mkdtempSync(os.tmpdir())`, never touch the lane
  tree, network, or env.
- The two mandated arms must exercise the *right mechanism*: flake-injection must doctor
  a **digest-bound field** (e.g., flip a char in an output hash or the exit code) **and
  then re-write the sidecar over the doctored bytes** — otherwise the stale sidecar reads
  TAMPERED, not the mandated REPLAY. Symmetrically the sidecar-mismatch case must doctor
  receipt bytes and keep the **old** sidecar → TAMPERED. A naive flake case that forgets
  the re-sign cannot legitimately claim the REPLAY arm.
- Recommended ≥10-case spread (locks the F1 resolution): 2× round-trip VALID (run→verify),
  flake→REPLAY, stale-sidecar→TAMPERED, prelude-rewrite→TAMPERED (the M2 move), clock
  disorder→REPLAY, nonce-reuse-different-body→REPLAY, **same-body duplicate in ledger →
  VALID** (regression-locks F1's benign-copy arm — this is the case that decides whether
  A4 can ever pass), target-self-exclusion in ledger→VALID, usage→64, unreadable→2.

### F6 — LOW — `run-at:` prelude semantics

- Probe line 102–104: the `run-at:` line (must start the line with literal `run-at:` — no
  leading whitespace) **overrides** `j.wall_start` for the A2 span computation, and its
  payload must `Date.parse`. Resolution: emit exactly one prelude line,
  `run-at: <wall_start.toISOString()>\n`, as the file's first line; keep `run-at` equal to
  `wall_start` (prelude is display-only, plan line 30; the sidecar binds it, so no
  cross-check is required). Emit exactly one `{`-leading JSON line — the probe finds the
  *first* line whose `trimStart` starts with `{` (line 98).

### F7 — LOW — `run` mechanics unspecified

- `<cmd...>` execution: use `spawnSync(argv[0], argv.slice(1))` with **no shell** — the
  recorded argv is then exactly `<cmd...>`. `run`'s own exit code is unspecified;
  resolution: exit 0 once the record+sidecar are written (the child's exit is *data* in
  the receipt, not the tool's verdict). Argv form is pinned by probe usage:
  `verify [--ledger <dir>] <file>` (line 93/136), `verify <file>` (line 93); unknown
  args/malformed → usage 64.
- **v3 hard-requirement (A2c/A3c, probe lines 146–148, 183–186):** `run` MUST exit 0 when
  it successfully records the invocation — the probe treats `r.status !== 0` or a missing
  `<base>.txt` as arm failure before `verify` runs. The recommended "exit 0 on write"
  reading is now mandatory; a nonzero `run` exit loses A2c and A3c outright.

### F8 — LOW — Integration-order notes (not executor-blocking)

- A5 (probe lines 170–178) requires `pin.receipt-attest=<sha256 of committed script
  bytes>` literally in `SCORECARD.md` (regex `pin\.receipt-attest=([0-9a-f]{64})`, anywhere
  in file; block membership is plan-asserted) — the pin must be computed **after** the
  script is frozen; any post-pin edit silently breaks A5.
- A4's prior-corpus sweep (probe lines 141–162) greps prior `*receipt*|*ReRun*|*L1-score*`
  files under `.ufo/waves/` for the three new nonce strings — satisfied automatically by
  fresh 128-bit nonces; no tool behavior needed.
- Selftest must not rely on `node` version features beyond the lane floor (lane uses
  `process.hrtime.bigint`, `crypto.randomBytes` — both fine).

### Scratch-impl observation (concrete F1 confirmation)

`build/ExecSelftestArms/scratch/receipt-attest.mjs` (a sibling seat's scratch copy,
317 lines — NOT the ExecInstrument deliverable) encodes the literal F1 reading:
its ledger arm (`scratch/receipt-attest.mjs:165-178`) walks every other `*.txt`,
`parseReceipt`s it (the replayed control parses fine — its JSON line is intact),
and at line 176 rejects on `other.nonce === obj.nonce` with no same-body/digest
exemption. `verify --ledger <receipts-dir> attest-run-2.txt` on the close corpus
would therefore read `RECEIPT: REPLAY` → **A4 MISS**. Its selftest case list
(`ledger-nonce-reuse-replay`, `ledger-distinct-valid`, line 251–268) has no
same-body-duplicate→VALID arm, so nothing in its own suite catches this. If
ExecInstrument's delivered script shares this ledger predicate, A4 cannot pass.
**Repair-4 note:** the defect it exhibited is now contract-prohibited (addendum item
4); its missing-sidecar→TAMPERED choice (line 152) matches this report's recommended
reading — under repair 4 A3c exercises *stale* sidecar, so the missing-verdict is free
but TAMPERED remains the fail-closed recommendation. Its inner-digest-first order
remains probe-safe under v3/repair-4 (A3c's tampered file keeps valid JSON; the stale
sidecar reads TAMPERED regardless of check order).
Divergent-but-probe-safe choices in the same file (for contrast, not defects):
missing sidecar → TAMPERED (line 152; recommended, see F2), unparseable
JSON → exit 2 UNREADABLE (lines 141–144; equally defensible to REPLAY), check
order inner-digest→sidecar→clocks→ledger (follows plan line 33 listing order;
still yields TAMPERED on the A3 control since its JSON is intact), self-exclusion
by basename (line 172; adequate for same-dir ledgers).

## 3. The five trickiest ambiguities — questions and resolutions

**Q1. In `verify --ledger`, does "a nonce already present" mean *any* other `*.txt` file
containing the nonce string — and if so, how can A4 ever pass with the replayed control
in the same directory?**
Resolution: no — a ledger entry flags reuse only when it (a) is a different file than the
target (compare resolved realpaths), (b) carries the same `nonce`, and (c) binds a
*different* record (`other.digest !== target.digest`, equivalently a different canonical
JSON line); counting only self-verifying entries is a sound strengthening and is what the
probe's semantics imply. Rationale: the A3 control `attest-run-2-replayed.txt` is the same
record re-dated — same nonce, same body, TAMPERED sidecar — and A4 (probe lines 132–139)
requires `verify --ledger` of run-2 over that directory to read `RECEIPT: VALID` exit 0.
The literal string-presence reading makes A4 unpassable (F1, HIGH). Same-nonce +
same-body = resubmission/copy (benign); same-nonce + different-body = replay (REPLAY) —
which is exactly the plan's stated threat ("a new receipt forged from an old body's
nonce", plan line 44–45). **Status: now the FROZEN contract** — addendum item 4 adopted
this resolution verbatim (same-nonce+different-digest flag; self and same-digest
duplicates exempt); A51 v3 (`8c07e880`) carries it.

**Q2. "sha256 over the JSON line with the `digest` field removed" — remove textually or
semantically, and what exactly is canonical JSON?**
Resolution: semantic. On write: build the object minus `digest`, serialize canonically
(recursive lexicographic key sort, `JSON.stringify` no-space separators, arrays in order),
sha256 the UTF-8 serialization, then insert `digest` and emit the final canonical line.
On verify: `JSON.parse` the stored line, `delete digest`, re-serialize canonically,
compare to the stored `digest`. Do **not** require the stored line's bytes to be
canonical — the sidecar already byte-binds the file; the digest binds semantics (F3).
Field names are free except `nonce` (top-level, hex string) and `wall_start` (probe
fallback), but all semantic fields must be inside the bound object. **v3 also pins**
`argv` (JSON array; last element = the executed command's final arg) and
`stdout_sha256` (sha256 of the child's real stdout bytes) via A2c probe lines 157–158 —
they join `nonce`/`wall_start` as hard-pinned names.

**Q3. Which verdict wins when several checks fail, and what verdict covers failures the
plan doesn't map (clock disorder, malformed sidecar, unparseable JSON)?**
Resolution: precedence sidecar → inner-digest/structure → clocks → ledger, i.e.
TAMPERED dominates (bytes don't match their recorded hash ⇒ nothing inside is
authoritative), then REPLAY for inner-digest mismatch, clock disorder
(`wall_end < wall_start` or `mono < 0`), and nonce reuse. Malformed or **missing
sidecar → TAMPERED** (recommended fail-closed; repair-4 A3c exercises only the stale
case — it copies the genuine sidecar to `<rcpt>.tampered.sha256`, probe line 198 — so
exit 2 on missing is also probe-compatible); unreadable receipt file → exit 2;
unparseable JSON or missing bound fields → REPLAY; argv errors → 64. The probe only
exercises single-failure receipts, so any consistent order passes; this order is
fail-closed and self-consistent (F2).

**Q4. What are the exact sidecar bytes — which GNU `sha256sum` variant, what filename is
embedded, and does `verify` check the embedded name?**
Resolution: emit `<64hex><space><space><basename>\n` (GNU text-mode `sha256sum` output;
`sha256sum -c` accepts it from the receipt's directory and committed receipts stay
portable). On verify, parse the first whitespace-delimited token as the expected hex and
compare to sha256 of the receipt file's exact bytes; the embedded filename is display
data — do not enforce it (A2 verifies under absolute extracted paths). Sidecar name is
`<receipt-path>.sha256`, adjacent to the receipt (F4).

**Q5. What makes the two mandated selftest arms produce REPLAY and TAMPERED specifically —
and what output contract does the probe actually enforce?**
Resolution: the verdict a doctored receipt reads depends on *which layer* is broken.
Flake-injection→REPLAY requires doctoring a digest-bound field **and re-writing the
sidecar over the doctored bytes** (sidecar stays valid, inner digest mismatches →
REPLAY); leaving the old sidecar yields TAMPERED and the arm cannot claim REPLAY.
Sidecar-mismatch→TAMPERED requires doctoring receipt bytes while keeping the stale
sidecar (byte hash fails before inner checks). Output contract (probe lines 74–76):
exit 0 and the last line of the combined stream literally `ATTEST_SELFTEST: PASS` — write
it last, once, to stdout, only if all ≥10 cases passed; per-case `PASS|FAIL <name>`
lines above it; all I/O under a fresh `os.tmpdir()` mkdtemp (hermetic — probe runs it
with cwd = extracted tree). Include a same-body-duplicate-in-ledger→VALID case to lock
the F1 resolution (F5).

## 4. Evidence

- `find /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-51 -type f` → no
  `build/ExecInstrument/`; `find … -name 'receipt-attest*'` → only probe/base files
  plus `build/ExecSelftestArms/scratch/receipt-attest.mjs` (a sibling's scratch copy,
  reviewed at §2 "Scratch-impl observation", lines cited to that file).
- `ls .ufo/waves/round-51/build/` → seat dirs, none ExecInstrument (re-checked after
  v3 landed — still absent).
- v3 update evidence: `git log -1` → `8c07e88` "round-51: freeze repair 3 — A51 v3
  challenge arms (A2c/A3c) … ledger same-digest exemption per RevInstrumentContract F1";
  `cat base/attest-base-v3.txt` → `ATTEST51: ATTEST_UNMET held=0/7 checks=7
  rev=c90b9de9… version=v3` exit 1; addendum at plan.md lines 157–193 (item 3 = A2c/A3c
  challenge arms per CritC1's stub-kill falsification, item 4 = ledger clarification,
  item 5 = probe-side absolute binaries `/usr/bin/printf`,`/usr/bin/sha256sum`); v3
  probe (265 lines) re-read in full — A2c lines 141–166, A3c lines 179–203; repair 4
  (`8fd3cde1`) re-reviewed at 268 lines — A3c sidecar-copy arm lines 179–206.
- Repair-4 evidence: `git log -1` → `8fd3cde` "round-51: freeze repair 4 — A3c copies
  the genuine sidecar to the tampered target so the arm tests prelude-rewrite +
  untouched-sidecar (CritC1)"; probe re-read — A3c lines 179–206, sidecar copy at line
  198 (`copyFileSync(<rcpt>.sha256 → <tampered>.sha256)`), TAMPERED requirement
  unchanged at lines 199–202; probe now 268 lines.
- Probe citations in §2/§3 are **v2** line numbers (written against the 191-line v2
  probe). v3 equivalents: A1 95–105; A2 107–139 (JSON/`nonce`/`run-at` 118–127); A3
  168–177; A4 ledger calls 205–214, prior-corpus 215–236; A5 240–254; verdict-line fn
  `lastLine` line 82. v2 originals: A1 71–81; A2 89–117 (parsing 96–104); A3 119–128;
  A4 ledger 132–139, prior-corpus 140–162; A5 166–180; verdict lines 75–76, 95, 125, 138.
- plan.md citations: contract lines 26–38; doctored control lines 58–59; selftest
  line 39–40; ledger threat line 44–45.
- No code executed beyond `ls`/`find`/`python3 json.load` for the dispatch files; no
  lane files modified (this report is the only write).

## 5. Residual risk

- If ExecInstrument lands while this report is in flight, the line-by-line review branch
  remains undone — flag to L1: apply §2/§3 as a checklist against the delivered script.
  Under v3 the make-or-break items are: the addendum-item-4 ledger predicate (same-nonce
  + different-digest only), A2c/A3c behavior (real `run` binding `argv`+`stdout_sha256`,
  GNU-basename sidecar passing `sha256sum -c`, `run` exit 0 on write, TAMPERED on a
  prelude-only rewrite), then the selftest banner contract.
- F2's remaining free choices (check order when several fail; unparseable JSON →
  REPLAY-vs-2; clock-disorder verdict; missing-sidecar verdict — free again after
  repair 4, TAMPERED recommended) stay probe-compatible under v3+repair-4; a w2
  falsifier could probe edge orderings (e.g., ledger + TAMPERED file) but no frozen
  check depends on them.
- v3 repair status: the v2 plan-prose underdetermination (F1) is repaired by the
  addendum; the v3 probe itself is self-consistent and passable. New residual: A2c/A3c
  make `run` a scored surface — an instrument that cannot execute and record a real
  child loses two of seven checks; that is the intended anti-stub design, not a defect.
