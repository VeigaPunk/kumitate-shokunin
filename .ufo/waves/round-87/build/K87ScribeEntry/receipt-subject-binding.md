source: S250 — in-toto attestation Statement layer specification, https://github.com/in-toto/attestation/blob/main/spec/v1/statement.md (spec/v1/statement.md § Statement layer specification, main branch read 2026-11-04; capture `.ufo/waves/round-87/open/intoto-statement.md`, sha256 cbe684a1…; quote: "The Statement is the middle layer of the attestation, binding it to a particular subject" — lines 3–4); own-work `.ufo/waves/round-87/open/census-toolbind.txt` and `.ufo/waves/round-87/build/K87ScribeEntry/field-breakdown.txt`
verified-at: 2026-11-04 — census re-run at base `db97929212bb61ae970b10abac3cc4cd976713ae`; frozen probe re-run over all four pre-data controls at that same base; the L1 reference candidate re-run over the committed round-86 close dir at round-86's own rev
recheck: `node .ufo/waves/round-87/open/census-toolbind.mjs round-74 … round-86`; `node .ufo/waves/round-87/build/K87ScribeEntry/field-breakdown.mjs`; `node .ufo/waves/round-87/probe/probe87-c1.mjs --lane . --work <SCRATCH> --rev <REV>` (re-run at the next lane tip)

# Receipt-subject binding — a receipt must name the instrument it measured

A close receipt makes two claims: *what it observed* and *what it observed it with*. This lane's
receipts carry the first as `cmd=` plus stdout plus `exit=`, and — since round 86 — the second as
`tool_sha256=`. Round 87 found the second half unbound: the digest field was populated, but it
named the same script in every receipt, so most of the round-86 receipts named an instrument they
never invoked, and no gate in this lane could see it (routed defect R86-D1). The exact counts are
measured below.

## What went wrong (measured)

Round 86's close runner hashed the same script (`scripts/counter-receipt.mjs`) once per case and
wrote that digest into every receipt:

```
$ grep -n "createHash('sha256')" .ufo/waves/round-86/run-close.mjs
24: const hash=createHash('sha256').update(readFileSync(`${lane}/scripts/counter-receipt.mjs`)).digest('hex');
```

The runner declares ten cases — 10 — `grep -c "^ \['" .ufo/waves/round-86/run-close.mjs` 2026-11-04 —
and wrote ten receipts —
`ls .ufo/waves/round-86/close/*.txt | wc -l` 2026-11-04 → 10 —
and every one of them carries the digest of `scripts/counter-receipt.mjs` —
`sha256sum scripts/counter-receipt.mjs` 2026-11-04 →
`e95313700aaf8430c51e0f8abdb991ab168519eecf9803cce3fac51154f31069` —
even those whose `cmd=` names something else.

The base census over the committed rounds 74–86 close dirs:

```
$ node .ufo/waves/round-87/open/census-toolbind.mjs round-74 … round-86
receipts=239 bound=1 mismatch=9 unresolved=0 no_cmd=229
```

The census's `no_cmd` bucket is *no `cmd=` **or** no `tool_sha256=`* — it is not "neither field".
An independent per-receipt breakdown splits the corpus into the three groups below:

- 225 — `node .ufo/waves/round-87/build/K87ScribeEntry/field-breakdown.mjs` 2026-11-04 — carry
  neither field. The `cmd=` field itself first appears in round 85, so for most of the history the
  subject is not recoverable from the receipt by any deterministic rule.
- 4 — `node .ufo/waves/round-87/build/K87ScribeEntry/field-breakdown.mjs` 2026-11-04 — carry
  `cmd=` but no `tool_sha256=`. All four are round-85 receipts (`c1-probe.txt`,
  `content-variation.txt`, `history-v2.txt`, `selftest.txt`): they name their instrument but do
  not digest it.
- 10 — `node .ufo/waves/round-87/build/K87ScribeEntry/field-breakdown.mjs` 2026-11-04 — carry both
  fields. All ten are round-86 receipts.

239 — `ls .ufo/waves/round-{74,75,76,77,78,79,80,81,82,83,84,85,86}/close/*.txt | wc -l` 2026-11-04 —
the committed close receipts of rounds 74–86 that the breakdown walks.

Of the receipts that carry both fields, the census finds

- 1 bound — `node .ufo/waves/round-87/open/census-toolbind.mjs round-74 … round-86` 2026-11-04.
  It is `selftest.txt`, whose `cmd=` really is `node scripts/counter-receipt.mjs --selftest`.
- 9 mismatched — the same command, 2026-11-04. The nine mismatched receipts name 8 distinct
  instruments, counted by
  `grep -h '^cmd=' .ufo/waves/round-86/close/*.txt | sed 's/^cmd=//' | awk '{print $2}' | sort -u | wc -l`
  2026-11-04: `scripts/proxy-check.mjs` (twice), `scripts/readme-map.mjs` (twice),
  `scripts/spotcheck-adopt.mjs`, `scripts/ready-handoff.mjs`, `scripts/plan-before-ready.sh`, the
  round-86 probe `…/round-86/probe/probe86-c1.mjs`, and the fleet-root script
  `/home/vgpnk/Projects/shokunin/scripts/sources-census.sh`.

The receipts were not false about *what they ran* — their `cmd=` lines are right. They were false
about *what the digest named*. No gate could see it: 0 — `grep -rn "tool_sha256" scripts/ | wc -l`
2026-11-04 — no script in this lane ever reads the field, and `scripts/report-receipt-diff.mjs`
(v4) checks tallies, pointers and hashes, never the instrument a receipt names. Its own header
declares the limit at `scripts/report-receipt-diff.mjs:35`: a receipt written by the lane itself is
trusted as written, "nothing in the tree binds a receipt to a counter run".

## Why the subject must be digest-bound

The in-toto Statement layer states the general rule this lane was violating. S250, at
`spec/v1/statement.md` § Statement layer specification: "The Statement is the middle layer of the
attestation, binding it to a particular subject and unambiguously identifying the types of the
Predicate." Its `subject` field then requires the digest, not the name: "Each element MUST have
`digest` set" — and adds that "Subjects are assumed to be _immutable_".

A name is not a binding; the digest is. Applied to a verification receipt the subject is the
instrument binary, and the digest must be of *that* binary at *that* revision. A receipt whose
digest names a sibling tool is an attestation about the wrong artifact, even though every other
field in it is truthful.

The near-miss this lane rejected is the Sigstore CLI reference (S251): `cosign verify` does bind a
signature payload to the image digest the signature was attached to ("Signature payloads created by
cosign included the digest of the container image they are attached to"), but that is
artifact-to-signature binding. It says nothing about the identity of the *verifier*, and a CLI
reference is not a normative requirement on receipts. S251 is kept as a rejection because it is the
plausible-looking source that would have carried the wrong rule.

## What this lane does now (contract `kumitate-receipt-bind-v1`)

`scripts/receipt-bind.mjs` re-derives the binding from the receipt's own bytes and the judged
revision:

- the instrument is the **second whitespace token of `cmd=`**;
- a lane-relative or lane-absolute instrument is hashed from `git show <rev>:<path>` at the
  receipt's own `rev=` (falling back to `--rev`), so the binding is *revision-bound*, not
  worktree-bound;
- an absolute instrument outside the lane is hashed from the file on disk and counted in
  `external=` — an external tool cannot be revision-bound, and the verdict says so instead of
  hiding it;
- a receipt carrying no `cmd=` or no `tool_sha256=` counts `unchecked`, and CLEAN requires
  `mismatched==0 AND unchecked==0` over at least one receipt: silence is never a pass;
- a symlinked receipt, a missing receipt directory, an unresolvable revision and an unresolvable
  instrument are all fail-closed (exit 2), never a quiet zero;
- exit map: 0 CLEAN, 1 DRIFT, 2 fail-closed, 64 usage.

The frozen scorer is `.ufo/waves/round-87/probe/probe87-c1.mjs`, which scores twelve arms —
12 — `grep -cE '^\s*// A[0-9]+ —' .ufo/waves/round-87/probe/probe87-c1.mjs` 2026-11-04. It scores
the committed round-86 bytes (which must read exactly 9 mismatches), the round-87 receipts (which
must bind), six same-directory fixtures whose filenames do not change while their `cmd=` or digest
does — 6 — `grep -c 'copyDir(R87' .ufo/waves/round-87/probe/probe87-c1.mjs` 2026-11-04 — and a
receipt generated at run time from lane bytes. So a canned table, a directory key or a filename key
cannot pass it.

The four pre-data controls are re-measured at base `db97929212bb61ae970b10abac3cc4cd976713ae`
with the same frozen probe (`node .ufo/waves/round-87/probe/probe87-c1.mjs --lane . --work <SCRATCH>
--rev db97929212bb61ae970b10abac3cc4cd976713ae --tool <control>`, 2026-11-04):

- 0/12 — `node .ufo/waves/round-87/probe/probe87-c1.mjs --lane . --work <SCRATCH> --rev db97929212bb61ae970b10abac3cc4cd976713ae --tool scripts/receipt-bind.mjs`
  2026-11-04 — base (the instrument absent at base).
- 0/12 — the same command with `--tool .ufo/waves/round-87/controls/stub-clean.mjs` 2026-11-04 —
  stub-clean (a constant CLEAN).
- 1/12 — the same command with `--tool .ufo/waves/round-87/controls/constant-drift.mjs` 2026-11-04 —
  constant-drift (the constant round-86 numbers).
- 3/12 — the same command with `--tool .ufo/waves/round-87/controls/path-keyed.mjs` 2026-11-04 —
  path-keyed (the verdict keyed on the directory path, never reading a receipt).

None reaches the twelve-arm maximum, so the kill rule does not fire and the predicate is not
vacuous.

Over the committed round-86 close dir at round-86's own revision
`19b4e440e83ea9d618708003f36c3a799eb13e08`, the reference candidate reads
`RECEIPT_BIND: DRIFT matched=1 mismatched=9 unchecked=0 external=1 first=c1-probe.txt` (exit 1) —
`node .ufo/waves/round-87/build/L1Reference/receipt-bind.mjs --dir .ufo/waves/round-86/close --rev
19b4e440e83ea9d618708003f36c3a799eb13e08 --lane .` 2026-11-04 — and the `external=1` is the
fleet-root `sources-census.sh`, the one instrument no lane revision can bind.

## Limits

- **Historical receipts stay unbound.** The receipts that carry no digest are history; this
  instrument does not retroactively bind them, and no round may claim that it does.
- **An external instrument cannot be revision-bound.** `sources-census.sh` lives in the fleet
  repository, not in this lane, so a receipt naming it can only be bound against today's bytes on
  disk. A later change to that script is invisible to the binding and will surface as a
  `mismatched`, which is the honest reading, not a clean verdict.
- **The binding is about identity, not correctness.** A digest match says the receipt measured
  *that* instrument; it says nothing about whether the instrument's verdict was right.
- **One writer per receipt directory.** The instrument reads receipts; it never writes or repairs
  them.
- **The subject is the second token of `cmd=`.** A receipt that invokes a wrapper, an environment
  shim, or a script the revision does not carry is fail-closed, not silently bound.
