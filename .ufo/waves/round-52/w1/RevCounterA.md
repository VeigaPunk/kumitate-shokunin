# R52 · RevCounterA — adversarial review of the FROZEN counter `attest52-probe.mjs` (rule A52 v1)

Scope: `.ufo/waves/round-52/probe/attest52-probe.mjs` at base `02c01258464cac3804faf177d0cfbf113cd59706`,
traced against the frozen plan's C1 contract (`SHAPE`/`CLOCK`/`STDIN`/`LEDGER`/`SELFTEST`), the kill rules
K1–K5, and the base freeze receipt `base/attest52-base.txt`. **The counter was not edited.** All mutant /
scratch evidence lives under `.ufo/waves/round-52/build/RevCounterA/`.

**Tool installs: none** (no package was needed; GNU tar 1.35, node, git were already present).

Verdict: **the frozen counter is NOT a sound scorer of the frozen contract.** Two checks (B3c, B4c) are
**unsatisfiable by a conformant v2 instrument** — they pass only for an instrument that violates the
round's own `SHAPE` rules; and three declared kill rules (K3 zero-spawn, K4 counter-mutants, and the
R52-7 span fix) are falsified by concrete bypasses. `ATTEST52_HELD` as frozen is reachable, but it is
not evidence of the hardening package it claims to score.

---

## BLOCKERS (contract ↔ counter contradiction; 13/13 unreachable for a conformant v2)

### X1 — B4c ledger fixture violates the round's own sidecar-name rule → conformant v2 answers TAMPERED, not REPLAY (BLOCKER)

`attest52-probe.mjs:368-374`: the probe copies the live receipt to `ledgerDir/orig.txt` **but copies its
sidecar unchanged**:

```js
copyFileSync(rcpt, join(ledgerDir, 'orig.txt'));                 // :369  receipt renamed
copyFileSync(`${rcpt}.sha256`, join(ledgerDir, 'orig.txt.sha256')); // :370  sidecar NOT rewritten
```

The sidecar's *recorded name* inside still reads `<base>.txt` (v1 text mode records the basename — see
`.ufo/waves/round-51/receipts/attest-run-1.txt.sha256` → `…  attest-run-1.txt`). The plan's C1 §1 `SHAPE`
freezes: *"The sidecar's recorded name must equal the receipt's basename → else `RECEIPT: TAMPERED`."*
Therefore a conformant v2 run on `orig.txt` returns **TAMPERED exit 1**, while `:376` requires
`REPLAY exit 1` (`replay1 = vL1.status === 1 && /RECEIPT: REPLAY/`). **B4c MISSes for every conformant v2.**

Evidence that this check is graded against v1 semantics, not v2: the base receipt shows `B4c PASS` under
the v1 instrument (whose header states "`verify` NEVER resolves the recorded name: it locates the sidecar
next to the RECEIPT … and compares hashes only"). The v2 hardening therefore *breaks* the fixture it must
pass. Independent corroboration: peer `kumitate-r52.CritC1` reported the same lines 369-370.

Bypass/fix shape: the probe must rewrite `orig.txt.sha256` with name `orig.txt` and the new file's sha
(or keep the original basename `orig.txt` absent and use `<base>.txt` as the ledger copy name).

### X2 — B3c injects a prelude value that `SHAPE` classifies UNREADABLE (exit 2), but demands TAMPERED (exit 1) (BLOCKER)

`:290`:

```js
lines[idx] = 'run-at: 2020-01-01T00:00:00.000Z (rewritten by probe B3c)';
```

`SHAPE` freezes: *"The prelude value must match `^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$` → else
UNREADABLE"* (exit 2). The appended ` (rewritten by probe B3c)` fails that anchored grammar, so a
conformant v2 answers **UNREADABLE exit 2**, while `:298` requires `status === 1 && /RECEIPT: TAMPERED/`.
**B3c MISSes for a strict v2**; it passes only if the prelude parser is lenient (first 24 chars / token
split), which violates `SHAPE`.

Compounding masking (same defect class as X1): `:292` copies the sidecar under a new basename
(`….txt.tampered.sha256`) without rewriting the recorded name, so a v2 that checks sidecar-name first
returns TAMPERED **for the wrong reason** — B3c would pass with the prelude-window check entirely deleted.
So B3c either MISSes (verdict arm) or PASSes vacuously (name-mismatch arm); it never isolates the M2
prelude mechanism it is documented (`:46-48`) to attack. Same masking applies to committed B3 if
`attest52-run-2-replayed.txt` carries run-2's untouched sidecar (the plan's §Receipt protocol says it
must) — B3 then passes on sidecar-name mismatch alone, and `:271` does not even require the sidecar to
exist, so an absent sidecar also yields TAMPERED.

Consequence of X1+X2: the only path to `held=13/13` is an instrument that **does not implement** the two
`SHAPE` rules this round introduces. `ATTEST52_HELD` becomes evidence of non-conformance.

---

## HIGH

### H1 — B2e does not close the zero-spawn forger: the "captured child stdout" is computable from the tool's own nonce (falsifies K3)

`:244-258`: for `run --stdin -- /bin/cat`, the probe's independent capture is
`sha(cat(nonce_bytes))` = `sha(nonce_bytes)`. The tool itself generates the nonce and owns both fields,
and the check reduces to the identity

```
stdin_sha256 == sha(nonce)  &&  stdout_sha256 == sha(nonce)
```

(`:250` `stdinOk`, `:252-254` `capturedOk`). A forger that never spawns anything writes
`nonce = N`, `stdin_sha256 = sha(N)`, `stdout_sha256 = sha(N)` — and B2e passes. Zero entropy is added by
the "probe-captured" arm because `/bin/cat` by construction echoes exactly the bytes the tool chose.

B2c is equally mechanical: for `/usr/bin/printf %s <nonce>` the expected stdout *is* the last argv
element, so `stdout_sha256 = sha(argv.last)` (`:226`) passes with no execution.

⇒ Plan K3 ("the B2c argv-hash shortcut is closed by B2e (stdin-bound + probe-captured stdout)") is
**false**: a two-rule, zero-spawn forger passes both. The claim's central anti-forgery argument rests on
a check that cannot distinguish execution from a hash table. Fix direction: only a challenge whose
expected output is *not* derivable from values the tool chose (e.g. the probe supplies a secret through a
side channel the tool cannot read, or the child is chosen by the probe from a large set with an
unpredictable transform) can carry this weight.

### H2 — K4 "drop-one-check must never print HELD" is falsified: the R52-5 guard is count-blind (no expected-count, no id-uniqueness)

`hold()` (`:80`) pushes any string id; the label (`:472-474`) requires only `checks.length > 0` and
`held === checks.length`. There is no `EXPECTED_CHECKS = 13`, and duplicate ids are accepted, so
`held=13/13 checks=13` can be printed with one real check replaced by a duplicate.

Executed evidence (frozen file untouched — `sha256sum -c` OK before/after):
`.ufo/waves/round-52/build/RevCounterA/k4-drop8-mutant.mjs` = the frozen probe with exactly the **eight
`hold()` lines removed that MISS at base** (B1, B1c, B2, B2e, B3, B4, B5, B5c). Run at the frozen base rev:

```
ATTEST52: ATTEST52_HELD held=5/5 checks=5 rev=02c01258464cac3804faf177d0cfbf113cd59706 rule=A52 version=v1 | B2c PASS | B3c PASS | B4c PASS | B4d PASS | B6 PASS
mutant-exit=0
```

That is the **do-nothing control tree printing HELD** — the exact R52-5/vacuous-HELD class the round froze
B5c against, one notch narrower. K1's "the do-nothing control cannot reach HELD" survives only because a
human re-reads the literal `held=13/13 checks=13` in the predicate sentence; the counter's own exit code
does not enforce it. B5c receipts **only** the hold-call-deleted (0/0) mutant — the plan's K4 names a
second mutant ("drop-one-check") that is neither receipted nor guarded. Fix: a literal
`EXPECTED_CHECKS = 13` in the label/exit condition plus uniqueness of ids.

### H3 — B2's "generous span" is author-asserted time; the R52-7 fix moves the forgery, it does not close it

`:196-209` requires only `verify` VALID + distinct nonces + distinct file shas + `span ≥ 300 s` computed
from **body** `wall_start`. All three receipts are committed files authored by the same tree author, and
`verify` is the code under test judging its own format. A static forger writes three parseable bodies
with `wall_start` T, T+150, T+300 and matching sidecars → B2 PASS with **zero executions and zero real
spacing**. Nothing in B2 checks:

- that `argv` in the three receipts is the three declared gate commands (`bind-oracle --selftest`,
  `sources-check`, `round-gate --selftest`) — receipts of `/bin/true` pass;
- `wall_end ≥ wall_start`, or that "span" agrees with `mono_span_ms`;
- wall-clock *ordering* across runs (only max−min).

The plan's §Receipt protocol ("spaced, live-gate-wrapped", "real wall time across the integration
window") has **no counter coverage at all**; the R52-7 repair only removed the prelude/body mismatch.

### H4 — B2's span parse is zone/offset-sensitive and accepts forms `CLOCK` forbids (question 5 answer, with a live bypass)

`:192` `ws = Date.parse(j.wall_start)` — and `Number.isFinite` is the only gate. Measured (node, this
host):

```
zone-less parse finite: true
offset A,B finite: true true
span(A,B) seconds = -50340
```

Two receipts stamped `2026-10-24T00:00:00.000+00:00` and `2026-10-24T00:01:00.000+14:00` (60 s apart in
wall clock, plausibly generated in the same second) yield a **50 340 s span**. `CLOCK` would reject the
offset form (byte round-trip through `toISOString()` fails — verified: field `…+14:00` → `2026-10-23T10:01:00.000Z`),
but **B1c only ever exercises the month-13 rollover**, so a v2 whose clock arm is "reject month > 12"
passes B1c and unlocks H3's span inflation. Robustness for the *asked* case is fine: a receipt with no
`wall_start` ⇒ `Date.parse(undefined) = NaN` ⇒ `Number.isFinite` false ⇒ MISS (`:195-196`, fail-closed).
Gap: the probe never requires the body field to be the same strict grammar the contract freezes.

### H5 — B4's nonce-reuse sweep cannot see the round-51 receipts it names (basename filter)

`:311-320`:

```js
if (st.isDirectory()) { if (!/round-52$/.test(n)) walk(p); continue; }
if (/receipt|ReRun|L1-score/i.test(n)) prior.push(p);
```

The regex is applied to the **basename** `n`. The r51/prior receipt basenames are `attest-run-{1,2,3}.txt`
— no `receipt`, no `ReRun`, no `L1-score`. Exact replication of the walk over `.ufo/waves`:

```
sweep-collected-files=176
collected-under-round-51/receipts=0
attest-run-1.txt collected? false
```

(176 agrees with peer `kumitate-r52.ScoutReceiptCorpora`.) So the header's claim (`:52-54`) — "each
embedded nonce appears in NO prior receipt corpus file under `.ufo/waves/` (round-48/49/50/51 receipt
corpora)" — is **false for exactly those corpora**: the same probe reads those three files in B6, and
their nonces are in-tree (`attest-run-1.txt` nonce `3fd22d2153f74061d59ed9527b4ffca7`). Concrete bypass:
set round-52 run-2's `nonce` to r51's `3fd22d21…`; nonces stay pairwise distinct, the sweep reports 0
hits, B4 PASSes. Additionally `:473` truncates detail to 80 chars and drops the detail entirely on PASS,
so even a successful sweep never prints the `prior-files=` count it advertises.

### H6 — `rev` is interpolated into `bash -lc` with `JSON.stringify`, i.e. shell-injected (RCE through the frozen counter)

`:120-123`:

```js
spawnSync('bash', ['-lc',
  `git -C ${JSON.stringify(lane)} archive ${JSON.stringify(rev)} | tar -x -C ${JSON.stringify(T)}`], …)
```

`JSON.stringify` does **not** escape `$`, backticks or `\`; inside the double quotes bash still performs
command substitution. Executed end-to-end against the **unmodified** frozen probe:

```
node .ufo/waves/round-52/probe/attest52-probe.mjs "$PWD" '$(id -u > …/build/RevCounterA/inj-proof.txt)'
ATTEST52: FAIL-CLOSED git archive $(id -u > …/inj-proof.txt) exit=2      probe-exit=2
inj-proof.txt: 1000
```

The substitution ran before git failed; the FAIL-CLOSED line prints the *literal* rev, so the transcript
looks innocuous. Secondary: `rev` is not separated with `--` and is not format-validated, so a rev of
`--remote=<url>` reaches `git archive` as an option (fetches a foreign tree) rather than a rev.

### H7 — extraction is rev-bound only for regular files: symlinks are recreated and read *through*, and `export-subst`/`export-ignore` change the archived bytes

`:120-123` extracts with `git archive | tar -x` and never `lstat`s anything. Proven in a scratch repo
(`build/RevCounterA/scratch/`, `git ls-tree` mode `120000`):

```
lrwxrwxrwx … receipt-link.txt -> /home/vgpnk/…/.ufo/waves/round-52/probe/attest52-probe.mjs
symlink read-through resolves to: /**
```

So a committed symlink named `attest52-run-1.txt` (B2, `:184`) or `…/MutCounter52/counter-mutant.txt`
(B5c, `:436`) makes the probe read a mutable file **outside the rev** — defeating the header's central
invariant (`:17-18` "Scores … over the committed bytes of `<rev>` … never the working tree") and the
plan's R52-11 rev-binding story. Latent today (base tree has **0** mode-120000 entries) but unguarded.

Same class, also proven: `git archive` honours `.gitattributes`, so the extracted bytes are not the
committed blob:

```
committed-blob-sha=825eee1d7…   archive-member-sha=9dc26b91c6ac59d5…
archive member line: PINNED INSTRUMENT BYTES rev=e0b6f7eb8461f088501c4315b3d95d26c872c37a
```

With `scripts/receipt-attest.mjs export-subst`, B5's "pin == sha256(extracted bytes)" (`:419-425`) pins
**substituted** bytes that are not the blob at that path; `export-ignore` can silently drop any file from
what the counter scores (e.g. `SCORECARD.md` → B5 MISS, or a witness file). Nothing in the probe checks
for `.gitattributes` effects. (No `.gitattributes` exists at base — latent.)

### H8 — B5's proxy oracle is code from the tree under test; only the instrument is pinned

`:424-429` runs `<T>/scripts/proxy-check.mjs --strict` and accepts its stdout. A committer who edits
`proxy-check.mjs` (or the stanza it reads) makes it print `PROXY: MATCH` unconditionally; the probe
verifies only `pin.receipt-attest`. `b5ok` (`:429`) is therefore a pin *consistency* check plus a
self-judged assertion — under a full-tree author this is in the declared boundary, but B5 is presented in
the plan as the independent "no axis harm" arm (H3 `PROXY: MATCH`), so the report must not treat it as
independent evidence.

---

## MEDIUM

### M1 — B5c's mutant arm is satisfied by a fabricated transcript, and its source arm reads the *running* file, not the frozen one

`:433-443`:

```js
mutantOk  = /ATTEST52_UNMET/.test(t) && /held=0\/0/.test(t) && /exit 1/.test(t);
selfGuardOk = /checks\.length\s*>\s*0/.test(selfSrc) && /held\s*===\s*checks\.length/.test(selfSrc);
```

* **Fabricated transcript (asked directly):** yes. `counter-mutant.txt` is three loose regexes over a
  committed text file. The probe never executes the mutant, never requires the mutant source to exist, and
  never binds the transcript to a command or a rev. A three-line file satisfies arm (a). Per the plan's K3
  wording ("a tree author who implements the full contract remains inside the declared forgery boundary"),
  author-controlled artifacts are in-boundary — so B5c(a) is **in-boundary theater**, not evidence that a
  deleted-checks mutant fails. Peer `SentScope`/`CritC1Kill` were chartered for exactly this;
  independent confirmation not required for the reading above.
* **Provenance:** `selfSrc` is read via `fileURLToPath(import.meta.url)` — the currently executing file.
  A comment containing `checks.length > 0` satisfies the regex even if the guard is deleted from code. My
  own mutant run above proves the arm does not bind to the frozen path.

### M2 — B1 is selftest theater: 30 lines of text is all that is graded

`:134-139` counts stdout lines matching `^case\s+\S+:\s+PASS\s*$` (≥30) and requires the last line to
match `/ATTEST_SELFTEST: PASS/`. Nothing checks that `--selftest` *exercises* anything, that case names are
distinct, or that any contract arm exists. Every `SHAPE` arm this round introduces — unknown field,
blank-line rejection, half-pair removal, sidecar-name mismatch, non-finite clock, LEDGER skip-note — is
**verifiable only through this text**, i.e. unverified. Concrete forger: `for (i=0;i<30;i++)
console.log(\`case c${i}: PASS\`)` + `ATTEST_SELFTEST: PASS (30/30)`; exit 0 → B1 PASS with no behaviour.
(The plan's own B1 wording only promised the text contract, so this is a counter-design weakness, not a
probe↔plan divergence — but it means B1 contributes 1/13 for zero capability evidence.)

### M3 — B4c/B1c hard-code the tool's canonicalization and verdict vocabulary, freezing an implementation detail the plan does not freeze

`:158-168` and `:355-366` recompute the digest as `JSON.stringify(sortKeys(rest))`. A conformant v2 that
canonicalizes differently (different key order is tolerated, but e.g. `undefined`-pruning, `-0`, or an
explicit `stdin_sha256: null` for non-stdin receipts changes the byte string) yields TAMPERED instead of
VALID and MISSes B4c/B1c through no fault of its own. Likewise `:406` demands exactly `RECEIPT: REPLAY`
for a corrupted digest — a tool answering TAMPERED (semantically defensible for a local digest mismatch)
MISSes, without the frozen C1 text fixing that mapping (only the probe header does). The counter thus
over-specifies the instrument; the milestone should either freeze the canonical form in the plan's C1
text or have the probe read the tool's own `--selftest`/canonicalization helper (not a stub).

### M4 — the prelude-window mechanism has no unmasked coverage

Every prelude-related verdict the probe can observe is reachable by sidecar-name effects introduced this
round (X1/X2 masking): a v2 that deletes the `−60 000/+60 073 ms` prelude-window check while keeping
round-trip clock validation still passes B1c (month-13 round-trip fires), B3 (sidecar-name mismatch on the
committed control), and B3c (sidecar-name mismatch or UNREADABLE). Recommend the probe rewrite the
sidecar *name* consistently in its hostile fixtures so the only inconsistency left is the one under test.

---

## LOW

- **L1 — extraction pipeline lacks `pipefail`** (`:120-123`). On this host GNU tar 1.35 fails closed on
  empty input (`empty-tar-exit=2`, `pipeline-exit=2`), so the documented "exit 2, never a score" holds.
  Under bsdtar (accepts an empty stream) `git archive <bad>` would be swallowed and the probe would score
  `held=0/13 exit 1` — a *score*, not a fail-closed exit. Also git's stderr is never surfaced, so a bad
  rev and an unreadable repo are indistinguishable in the transcript.
- **L2 — `:228`/`:253` hardcode `/usr/bin/sha256sum`**; a host without it MISSes B2c/B2e spuriously.
- **L3 — B2e hashes a UTF-8 *string*** (`cat.stdout` under `encoding:'utf8'`, `:252`). Safe for a hex
  nonce, silently wrong for any non-ASCII child output; the check is not byte-faithful in general.
- **L4 — MISS details are truncated to 80 chars** (`:473`) and dropped entirely on PASS, so B4's
  `prior-files=` count and B2's span diagnostics never appear in a HELD transcript — the receipt cannot
  show *what was scanned*.
- **L5 — `lastLine` concatenates stderr then stdout** (`:82`); a diagnostic printed to stderr after the
  verdict is not the last line, so the verdict regex passes while stderr warnings are invisible.
- **L6 — B3 requires no sidecar** (`:270-273` only checks the receipt's existence): an absent sidecar
  yields TAMPERED and B3 PASSes.

---

## Residual risk (what a HELD transcript would still not prove)

1. That any command was executed (H1) or that the three receipts were spaced in real time or wrapped the
   declared gates (H3).
2. That the instrument implements any `SHAPE` arm (M2), the `LEDGER` skip-note (M2), or the prelude window
   (M4).
3. That the scored bytes are the committed bytes (H7: symlinks, `export-subst`, `export-ignore`).
4. That `rev` names a rev (H6).
5. That the counter scoring the run contains 13 checks (H2).

## Verification gaps / dependencies

- No v2 tree exists yet, so B4c/B3c unsatisfiability (X1/X2) is established by frozen-text contradiction
  plus the base receipt's `B3c PASS | B4c PASS` under v1 semantics — **not** by executing a conformant v2.
  The decisive test is cheap once v2 lands: run the frozen counter and observe `B4c`/`B3c` MISS with
  detail `ledger(orig)=…TAMPERED` / `exit=2 …UNREADABLE`. If the implementer instead loosens `SHAPE` to
  make them pass, that is the regression this review predicts, and it should be caught at integration.
- Base receipt corroboration used: `base/attest52-base.txt` → `held=5/13`; the five held at base are
  exactly `B2c B3c B4c B4d B6` (H2's mutant proof rests on that), and `B5c MISS
  mutantReceipt=absent-or-malformed selfGuard=present` confirms the mutant arm is unmet until a committed
  transcript exists.
- Peers whose findings I independently reproduced: `kumitate-r52.CritC1` (B4c sidecar rename, B3c prelude
  grammar), `kumitate-r52.ScoutReceiptCorpora` (176-file sweep census, r51 basename exclusion).
