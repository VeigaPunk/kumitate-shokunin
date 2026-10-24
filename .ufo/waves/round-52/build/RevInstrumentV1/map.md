# RevInstrumentV1 — defect → fix map (round 52, C1 receipt-attest v2)

Seat: `kumitate-r52.RevInstrumentV1` (independent leaf, lane read-only; writes only under
`build/RevInstrumentV1/`).
Subject: CURRENT v1 `scripts/receipt-attest.mjs` at lane tip `ac567439`
sha256 `44919763ee523f334adaa4242d370435180d07aa0cdd4b85b0a7be870f48e8d9` (808 lines; equals
the context pin and `pin.receipt-attest` in `SCORECARD.md`). Routed findings read in full:
`SCORECARD.md` §Limits (h2,h3,h4,h5,h6,i,j,k) and `round-51/w2/RevInstrument.md` (F1–F8).
Counter read in full: `.ufo/waves/round-52/probe/attest52-probe.mjs` (rule A52 v1, B1–B6).

Verdict column meaning: **FIXED-BY-CONTRACT** = the plan §C1 text, implemented literally,
makes the quoted false reading impossible; **DOC-ONLY** / **NOT-FIXED** = the routed defect
survives the contract (flagged per assignment); **PROBE-SIDE** = the instrument is not the
repair site.

| ID | v1 defect | Contract item | v2 site | Verdict |
|---|---|---|---|---|
| R52-1 / F1 | non-finite `Date.parse` disables clock + window checks | CLOCK | `doVerify` clock step | FIXED-BY-CONTRACT |
| R52-8 / F8 | prelude never shape-checked → verdict is TZ-dependent | SHAPE | `splitReceipt`/`doVerify` | FIXED-BY-CONTRACT (ordering hazard) |
| R52-6 | selftest cannot see truncated compares | SELFTEST | `SELFTEST_CASES` | **PARTIAL** — sidecar arm kills its mutant; delivered nonce arm is mis-scoped (§3) |
| R52-5 | vacuous `held=0/0 exit 0` | (counter) | probe source + B5c | PROBE-SIDE |
| R52-7 | span arm trusted display prelude | (counter) | probe B2 | PROBE-SIDE |
| R52-2 / F2 | `--ledger` skips damaged priors (false VALID) | LEDGER | contract prose + 1 case | **DOC-ONLY — behaviour unchanged** |
| R52-3 / F4 | non-GNU sidecar for escaped basenames | SHAPE | name equality (read side) | **not in the contract; delivered v2 fixes it anyway** (escape+unescape, verified) |
| R52-3 / F5 | blank-line tolerance | SHAPE | `splitReceipt` | FIXED-BY-CONTRACT |
| R52-3 / F6 | capture failure indistinguishable from real exit 127 | SHAPE | (re-affirms 127) | **NOT-FIXED and now cemented by the whitelist** |
| R52-3 / F7 | sidecar write failure leaves a half-pair | SHAPE | `doRun` write block | FIXED-BY-CONTRACT |
| R52-3 / F8.1 | unknown fields blessed (env smuggling) | SHAPE | `shapeError` | FIXED-BY-CONTRACT |
| R52-3 / F8.2 | unreadable sidecar reported as "absent" | — | — | NOT-ROUTED (cosmetic, unfixed) |
| R52-3 / F8.3 | ±60 s prelude slack | — | — | NOT-ROUTED (Q39 ceiling, kept) |
| A2e / M5 | argv-hash-forger shortcut | STDIN | `doRun --stdin` | FIXED-BY-CONTRACT |

---

## 1. R52-1 (HIGH, F1) — unparseable wall clocks read VALID → CLOCK

**v1 code (exact).**

```
 113 const ISO_RE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;
 145   if (typeof record.wall_start !== 'string' || !ISO_RE.test(record.wall_start)) return 'wall_start is not an ISO instant';
 146   if (typeof record.wall_end !== 'string' || !ISO_RE.test(record.wall_end)) return 'wall_end is not an ISO instant';
 339   const startMs = Date.parse(record.wall_start);
 340   const endMs = Date.parse(record.wall_end);
 341   if (endMs < startMs) {
 385   const lowMs = Math.min(startMs, endMs) - PRELUDE_SLACK_MS;
 386   const highMs = Math.max(startMs, endMs) + PRELUDE_SLACK_MS;
 387   if (!Number.isFinite(preludeMs) || preludeMs < lowMs || preludeMs > highMs) {
```

`ISO_RE` is shape-only; `NaN < NaN` is false so line 341 passes, and `Math.min(NaN, …)` makes
both window bounds `NaN` so line 387's two comparisons are false — only `preludeMs` is
finiteness-guarded, never the window.

**v2 path that must fix it.** CLOCK: after `Date.parse`, require `Number.isFinite(startMs)`
and `Number.isFinite(endMs)` **and** `new Date(ms).toISOString() === record.<field>`; any
failure → `RECEIPT: TAMPERED` exit 1. Implementation shape: replace the two bare
`Date.parse` calls at 339-340 with a helper `acceptInstant(field)` returning `{ms, why}` and
funnel both `shapeError`'s ISO test and step 3 through it, so `lowMs`/`highMs` at 385-386
cannot be `NaN`. The round-trip (not just finiteness) is what rejects rolled instants:
`2020-02-30T00:00:00.000Z` parses to `2020-03-01T00:00:00.000Z` and differs from the field
bytes.

**Acceptance (proved on v1, must invert on v2).** Live v1, rolled month 13, digest+sidecar
repaired: `RECEIPT: VALID` exit 0 (reproduced this seat, `/tmp/rv52b/rolled.txt`; base receipt
`base/attest52-base.txt` B1c `MISS exit=0 last="RECEIPT: VALID"`). v2: exit ≠ 0, no `VALID`.

**Counter coupling.** B1c crafts exactly this (probe lines 148-183). Note the probe header's
rationale ("V8 `Date.parse` rolls month 13 into January 2027") is **factually wrong on this
host**: `Date.parse('2026-13-01T00:00:00.000Z')` is `NaN` (measured, Node 24.21.0). The arm
still discriminates (the NaN path also yields VALID on v1), so this is a documentation defect
in the frozen probe, not a broken check — but a v2 author who trusts the header and only
tests "rolled into next year" will miss the NaN half.

## 2. R52-8 (F8.3/F8 zone-less prelude) — verdict flips with verifier TZ → SHAPE

**v1 code.**

```
 116 function splitReceipt(text) {
 117   const lines = text.split('\n').filter((l) => l.length > 0);
 119   if (!lines[0].startsWith('run-at: ')) return { error: 'first line is not a `run-at: ` prelude' };
 120   const runAt = lines[0].slice('run-at: '.length);
 ...
 384   const preludeMs = Date.parse(runAt);
```

The prelude is never shape-checked; `Date.parse('2026-10-24T02:45:40')` is interpreted in the
verifier's **local** zone, so the same bytes verify VALID under `TZ=UTC` and TAMPERED under
`TZ=Asia/Tokyo` (window is ±60 s). `verify` is therefore not a pure function of receipt bytes.

**v2 path.** SHAPE: prelude value must match `^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$`
else `receipt-attest: UNREADABLE` exit 2. Add the regex test beside the prelude extraction at
119-120 (or immediately after) and route the failure through `unreadable()` (line 96), which
already exits 2.

**ORDERING HAZARD — must not preempt the sidecar step (see §9).**

## 3. R52-6 — truncated-compare mutants invisible to the selftest → SELFTEST arms

**v1 code.** The suite compares by full string equality only, e.g.

```
 332   if (parsed.hash !== actual) {
 371       if (state.nonce === record.nonce && state.digest !== record.digest) {
```

No case feeds a forgery whose sidecar hash / nonce differs **only past a 16-bit prefix**, so a
build mutated to `a.slice(0,4) === b.slice(0,4)` still prints `ATTEST_SELFTEST: PASS`
(SCORECARD (h3): forger read VALID in 313 ms). Shipped v1 bytes are correct here — the gap is
coverage, not behaviour.

**v2 path.** ≥2 hermetic cases in `SELFTEST_CASES` (declared at line 399). Each must target the
mutant's **false accept**, which is the only observable difference between a prefix compare and
a full compare:
(a) sidecar hash replaced by a 64-hex string sharing the first 4 characters with the true
`sha256(receipt bytes)` and differing after → must read `TAMPERED`/exit 1 (a truncating sidecar
compare accepts it and prints VALID);
(b) a *distinct, internally consistent* record whose `nonce` shares the first 4 characters with
a genuine receipt's nonce must NOT be flagged by the ledger — `verify --ledger` over the
directory must read `VALID`/exit 0 (a truncating nonce compare calls it `REPLAY`).
Note the direction: for a genuine reuse (identical nonce, different digest) prefix and full
compares agree, so that construction cannot distinguish the mutant. Both arms are cheap and
deterministic (overwrite the tail of an existing hash; no brute force).

**Status (final bytes):** done. `r52-6-ledger-nonce-16bit-prefix-not-reuse` (line 710) is the
correct construction above; the earlier digest-scoring arm was renamed
`nonce-change-with-stale-digest-is-replay` (700), and a digest-prefix arm was added (728).

**Also required by B1** (see §9): the case-line label changes from
`ATTEST_CASE nn <name>: PASS` (line 771/775) to `case <name>: PASS`, and line 782/788 to
`ATTEST_SELFTEST: PASS (n/n)`. Probe B1 regex is `/^case\s+\S+:\s+PASS\s*$/` plus
`/ATTEST_SELFTEST: PASS/` on the **last** line — measured against live v1 output this matches
**0** lines (v1 prints `ATTEST_CASE 01 …`), hence B1 MISS `cases=0` at base. The `<name>` must
be a single non-space token (`case 01 foo: PASS` also fails the regex).

## 4. R52-5 — vacuous HELD → PROBE-SIDE, instrument not the repair site

Frozen probe already carries the guard: `const label = held === checks.length &&
checks.length > 0 ? 'ATTEST52_HELD' : 'ATTEST52_UNMET';` and exits
`held === checks.length && checks.length > 0 ? 0 : 1` (probe lines 470-473; B5c self-guard
regex matches, `selfGuard=present` in the base receipt). The remaining obligation is
**evidence, not code**: `.ufo/waves/round-52/build/MutCounter52/counter-mutant.txt` must exist
**at the scored rev** and contain `ATTEST52_UNMET`, `held=0/0`, `exit 1`. At this writing the
lane has `build/MutCounter52/{pristine.mjs,baseline.out,baseline.err}` and **no
`counter-mutant.txt`** → B5c unreachable until seat MutCounter52 lands it and L1 commits it
(the probe extracts with `git archive`, so an uncommitted file is invisible).

## 5. R52-7 — span arm trusted the display prelude → PROBE-SIDE

v1 emits `run-at: ${wallStart}` (line 227) — prelude and body `wall_start` are produced equal,
so the instrument needs **no change**; the fix is the probe scoring the span from the body
field (`const j = JSON.parse(jsonLineOf(p)); ws = Date.parse(j.wall_start)` — probe line 203-204,
already implemented in the frozen probe). Residual unchanged and correctly kept in SCORECARD:
the display prelude may drift ±60 s outward with a repaired sidecar; that no longer moves B2.
Do **not** "fix" this by rejecting a prelude that differs from `wall_start` — no contract item
authorises it and B3/B3c would still pass, but it would newly reject v1 receipts whose prelude
is a re-dated `valid` instant, i.e. change B6 semantics for no routed gain.

## 6. R52-2 / F2 (MEDIUM) — ledger skips damaged priors → **DOC-ONLY, behaviour unchanged**

**v1 code.**

```
 366       const state = attestationState(other);
 367       if (!state.attested) {
 368         out(`receipt-attest: ledger skipped ${name}: not an attested receipt (${state.why})\n`);
 369         continue;
 370       }
 371       if (state.nonce === record.nonce && state.digest !== record.digest) {
```

`attestationState` (249-272) requires sidecar hash **and** inner digest, so a prior whose
sidecar is damaged is skipped before the nonce comparison (line 371 never runs) — a same-nonce
different-digest twin verifies **VALID** (RevInstrument F2 T2).

**What the contract actually buys.** Item 4 only *states* the skip and adds a selftest case
asserting the printed note. The false-VALID class survives verbatim. Note also that v1
**already** has a case pinning this behaviour (`ledger-ignores-an-unattested-copy`, line 545)
and already prints the note at 368 — so the net increment is an assertion on a string that
already prints. **Flagged: R52-2 is documented, not repaired.** If the round wants the class
closed, the companion change is F2's own minimal repair (parse every `*.txt` with
`splitReceipt`; flag nonce equality on the *stored* digest regardless of attestation, keeping
self/same-digest exemptions) — but that is a contract change and would need re-freezing.

## 7. R52-3 lows

### F4 — sidecar name escaping: **NOT-FIXED by the contract text**
```
 154 const sidecarLine = (hash, name) => `${hash}  ${name}\n`;
 158   const m = /^([0-9a-f]{64})[ \t]+[*]?(\S+)$/.exec(text.trim());
```
`run` writes the raw basename. For a basename containing `\` or a newline the emitted sidecar
is not GNU text mode: coreutils escapes (`\` prefix, `\\`, `\n`), `parseSidecar` cannot parse
the newline form, and `sha256sum -c` rejects it. Read it carefully: the contract's SHAPE
clause is *"the sidecar's recorded name must equal the receipt's basename → else TAMPERED"* —
a **read-side** comparison. It does not make `run` write a GNU-legal line, and for the `\`
case the name *does* equal the basename after parsing, so the pair verifies VALID while GNU
`sha256sum -c` still fails. **Residual: run↔coreutils invariant remains broken for escaped
basenames.** Fixing it needs either coreutils escaping at line 154 + unescaping at 158, or
rejecting such basenames in `run` (usage exit 64) — neither is in the frozen contract.

### F5 — blank-line tolerance: FIXED
```
 117   const lines = text.split('\n').filter((l) => l.length > 0);
 118   if (lines.length !== 2) return { error: `expected 2 non-empty lines, got ${lines.length}` };
```
v2: split once, require exactly `[prelude, json, '']` → else `unreadable()` exit 2. Watch that
`\r` is not silently tolerated if "exact bytes" is the claim.

### F6 — capture failure indistinguishable from a real 127: **NOT-FIXED, and cemented**
```
 200   if (r.error) {
 204     exitCode = 127;
 220     stderr_sha256: sha256(stderr),
```
Contract: *"A spawn failure is recorded as exit 127 in the receipt (v1 behavior) AND asserted
by a selftest case"* — i.e. the ambiguity is re-affirmed, not removed: the receipt still
carries only a hash of a synthesized message, so it cannot be told from a command that really
exited 127 (F6 T12/T13: ENOENT and a 70 MB ENOBUFS capture both record `exit 127`,
`stdout_sha256 = e3b0c442…`, `verify` VALID). Worse, the SHAPE whitelist in the same contract
excludes any `capture_error`/`spawn_status` field, so the repair F6 recommended is now
**contract-illegal**. **Flagged: repair the contract before the bytes.** The honest options
are (i) whitelist an optional `capture_error: true` field, or (ii) make `run` exit non-zero on
capture failure. Neither is currently allowed.

### F7 — half-pair: FIXED
```
 231   try {
 233     writeFileSync(file, receiptBytes);
 234     writeFileSync(side, sidecarLine(sha256(receiptBytes), basename(file)));
 235   } catch (e) {
 236     unreadable(`cannot write receipt pair (${e.code ?? e.message})`);
 237   }
```
v2: on a failure after line 233 succeeded, `rmSync(file, {force:true})` before
`unreadable(...)` (which exits 2). Verify the cleanup covers the *directory-created* case too
(`mkdirSync` at 232 can itself fail — then nothing was written, fine).

### F8.1 — unknown-field whitelist: FIXED
```
 136 function shapeError(record) {
 137   if (!Array.isArray(record.argv) …
```
`shapeError` never rejects unknown keys, so a record with `"env":{"PATH":…}` (digest+sidecar
recomputed) reads VALID. v2: allowed set
`{argv, exit, mono_span_ms, nonce, stderr_sha256, stdout_sha256, wall_end, wall_start, digest,
stdin_sha256?}`; any other key → `unreadable()` exit 2. Keep `digest` in the set (it is
required, not optional) and keep `stdin_sha256` optional — v1 receipts have no such field and
B6 must stay green.

### F8.2 / F8.3 — not routed, unchanged
`sidecar exists but unreadable` is still reported as "absent (EISDIR)" at line 321 (cosmetic);
±60 s prelude slack (line 75) is the recorded Q39 ceiling. Neither is in the routed package;
neither should be "fixed" opportunistically (both would move verdict text/semantics the round
has already priced).

## 8. A2e / M5 — STDIN: FIXED-BY-CONTRACT (new code)

No v1 code exists (`doRun` rejects unknown flags at line 183: `usage('unexpected argument …
in run mode')`, which is exactly base B2e `run exit=64`). v2 must add `--stdin` to the
pre-separator flag loop in `doRun` (167-190), generate the nonce **before** the spawn, pass
`input: Buffer.from(nonce, 'utf8')` to `spawnSync` at 192, and record
`stdin_sha256: sha256(Buffer.from(nonce,'utf8'))` into the record at 215-224 **before**
`digestOf(record)` at 225 (semantic field → inside the digest). Exact bytes matter: B2e checks
`j.stdin_sha256 === sha(Buffer.from(j.nonce,'utf8'))` — 32 ASCII hex characters, **no trailing
newline**, and the child's stdout must be the probe-reproducible 32 bytes (`/bin/cat` echoes
stdin). Adding `'\n'` breaks B2e while still passing the instrument's own selftest.

---

## 9. Two frozen-text contradictions the v2 author must resolve (highest risk in this round)

> **RESOLVED (final state).** L1 ruled that the SHAPE contract stands unamended and repaired the
> **counter** instead: live probe `67b16479…` carries addendum item 1 (B3c: copy under the
> original basename, in-window prelude) and item 2 (B4c: re-point the copied sidecar's name
> field). Both repaired crafts PASS on the final strict instrument (`4d9d824a…`) — my M12r/M11r —
> and still PASS on v1, so base arithmetic is unchanged (re-run at base is byte-identical to
> `base/attest52-base.txt`). The analysis below stands as the record of why the repair was
> necessary; the instrument must **not** drop the name rule.

### 9a. SHAPE name-equality vs B4c — mutually exclusive as written

B4c copies a genuine pair into a ledger dir under a **new name** and does not rewrite the
sidecar (probe lines 341-345):
```js
copyFileSync(rcpt, join(ledgerDir, 'orig.txt'));
copyFileSync(`${rcpt}.sha256`, join(ledgerDir, 'orig.txt.sha256'));
```
The copied sidecar still records the **old** basename. Measured this seat: recorded
`b4c-deadbeef.txt` vs basename `orig.txt`. Under v1 that copy verifies `RECEIPT: VALID`
(reproduced `/tmp/rv52b/orig.txt`), which is why base B4c PASSes. Under a literal SHAPE name
rule the same call is `TAMPERED` exit 1 — and B4c demands `REPLAY` exit 1 for **both** the
original and the twin (`replay1`/`replay2`), so the check goes MISS at 12/13 and C1 is
unprovable. No placement saves both directions: the twin's own verify needs `orig.txt` to
count as ledger evidence, and a name-checking `attestationState` will skip it.

Consequence: the only way to keep 13/13 is to **weaken** the name rule to what v1 already
does (locate the sidecar as `<file>.sha256` and compare hashes, ignoring the recorded name) or
to apply the name test only as a non-verdict diagnostic. That is a contract deviation, and it
should be named in the round report rather than discovered at the close. Either way this is an
L1 decision: **the SHAPE clause and B4c cannot both hold.**

### 9b. Prelude-shape → UNREADABLE must run *after* the sidecar step, or B3c breaks

B3c rewrites the prelude to `run-at: 2020-01-01T00:00:00.000Z (rewritten by probe B3c)` with
the sidecar untouched (probe lines 280-292) and requires `TAMPERED` **exit 1**. That prelude
value fails `^\d{4}-…Z$`. If the new SHAPE test runs inside `splitReceipt` (v1's structural
pass, called at line 296 before the digest/sidecar steps), the verdict becomes
`UNREADABLE` exit 2 → B3c MISS. The shape test must therefore live at the **prelude step
(order 5, line 384)** or, if placed early, only after the sidecar hash comparison has already
returned TAMPERED. Same reasoning protects B3 (doctored control) and any prelude-tamper
challenge.

### 9c. B1 label (already in §3)

`case <single-token-name>: PASS` + `ATTEST_SELFTEST: PASS (n/n)`, ≥30 lines. v1's
`ATTEST_CASE nn <name>: PASS` scores 0.

---

## 10. Verification of the delivered bytes

The named artifact `build/ExecInstrumentV2/receipt-attest.mjs` landed during this seat
(sha256 `aed7191c29edea3fb317ce9aaf1bd9fe6ec7b954c4421788057730e82cf20b29`, 757 lines,
contract `kumitate-receipt-attest-v2`). `verify-v2.mjs` in this directory runs this map as
executable checks:

```
node .ufo/waves/round-52/build/RevInstrumentV1/verify-v2.mjs <path-to-v2-receipt-attest.mjs>
```

Results (transcripts beside this map): v1 baseline **7/17**, earlier v2 bytes (`aed7191c…`) 15/17,
final v2 bytes (`4d9d824a…`, 44 cases) **17/17** on the current-contract gate. After L1's freeze
repair of B3c/B4c (map §9 resolution note), every contract item above holds on the final bytes;
the two pre-repair counter shapes are retained as `[historical]` cases and fail by design.
Evidence and the outstanding freeze-discipline gap (no numbered addendum yet; base receipt not
re-committed though the re-run is byte-identical) are in `verification.md`.
