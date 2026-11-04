source: S250 — in-toto attestation Statement layer specification, https://github.com/in-toto/attestation/blob/main/spec/v1/statement.md (capture `.ufo/waves/round-87/open/intoto-statement.md`, sha256 `cbe684a1…`)
verified-at: 2026-11-04
recheck: on-release

# Receipt-subject binding — a receipt must name the instrument it measured

A close receipt carries two kinds of claim: what it observed, and *what it observed it with*.
This lane's receipts carry the first as `cmd=` + stdout + `exit=` and, since round 86, the second
as `tool_sha256=`. Round 87 found the second half unbound.

## What went wrong (measured)

Round 86's close runner computed one digest — `sha256(scripts/counter-receipt.mjs)` — inside its
per-case loop and wrote it into every case's receipt (`.ufo/waves/round-86/run-close.mjs:24`;
the `plan` case entry that line 20 of the frozen round-87 plan cites is the case table, not the
digest). Ten receipts landed; nine named a subject they never invoked:

```
$ node .ufo/waves/round-87/open/census-toolbind.mjs round-74 … round-86
receipts=239 bound=1 mismatch=9 unresolved=0 no_cmd=229
```

- **239** committed close receipts in rounds 74–86 (`ls .ufo/waves/round-74..86/close/*.txt`).
- **225** carry neither `cmd=` nor `tool_sha256=`, and **4** (all round 85: `c1-probe.txt`,
  `content-variation.txt`, `history-v2.txt`, `selftest.txt`) carry `cmd=` with no digest; the
  census bucket `no_cmd=229` is 225 + 4. The digest field was introduced in round 86, so those
  subjects are unrecoverable by any deterministic rule (see the revenger seat of round 87).
- of the **10** that carry both, **1** binds (`selftest.txt`, whose command really is
  `scripts/counter-receipt.mjs`) and **9** name `scripts/counter-receipt.mjs` while invoking
  `proxy-check.mjs`, `readme-map.mjs`, `ready-handoff.mjs`, `spotcheck-adopt.mjs`,
  `plan-before-ready.sh`, the round-86 probe, or the fleet's `sources-census.sh`.

The receipts were not false about what they ran — their `cmd=` lines are right. They were false
about *what the digest named*, and no gate in this lane could see it: `report-receipt-diff.mjs`
(v4) checks tallies, pointers and hashes, never the instrument a receipt names.

## Why the subject must be digest-bound

The in-toto Statement layer states the general rule this lane was violating:

> The Statement is the middle layer of the attestation, binding it to a particular subject and
> unambiguously identifying the types of the Predicate. — S250, spec/v1/statement.md

and its `subject` entry requires `digest`: *"Each element MUST have `digest` set."* A name is not
a binding; the digest is. Applied to a verification receipt, the subject is the instrument binary,
and the digest must be of *that* binary at *that* revision — a receipt whose digest names a
sibling tool is an attestation about the wrong artifact.

The Sigstore CLI reference is the near-miss this lane rejected (S251): `cosign verify` does bind
a signature payload to the image digest it was attached to, but that is artifact-to-signature
binding, not a statement about the verifier's own identity, and the page is a CLI reference rather
than a normative requirement on receipts.

## What this lane does now (contract `kumitate-receipt-bind-v1`)

`scripts/receipt-bind.mjs` re-derives the binding from the receipt's own bytes:

- the instrument is the **second whitespace token of `cmd=`**;
- a lane-relative or lane-absolute instrument is hashed from `git show <rev>:<path>` (the
  receipt's own `rev=`, else `--rev`), so the binding is *revision-bound*, not worktree-bound;
- an absolute instrument outside the lane is hashed from disk and counted `external=` — an
  external tool cannot be revision-bound, and the output says so instead of hiding it;
- a receipt with no `cmd=`/`tool_sha256=` counts `unchecked`, and CLEAN requires
  `mismatched==0 AND unchecked==0`: silence is never a pass;
- a symlinked receipt, a missing directory, an unresolvable revision and an unresolvable
  instrument are all `FAIL-CLOSED` (exit 2), never a quiet zero.

Frozen 12-arm scorer: `.ufo/waves/round-87/probe/probe87-c1.mjs`. It scores the round-86 bytes
(which must read `DRIFT matched=1 mismatched=9 unchecked=0`), the round-87 receipts (which must
bind), four same-directory fixtures that keep their filenames while changing `cmd=` or the digest,
and a receipt generated at run time from lane bytes — so a canned table, a path key or a filename
key cannot pass it. Pre-data controls: base 0/12, constant-CLEAN 0/12, constant-DRIFT 1/12,
path-keyed 3/12 (`.ufo/waves/round-87/controls/*.txt`).

## Limits

- **Historical receipts stay unbound.** The 229 receipts in the `no_cmd` bucket (225 with no
  field, 4 with `cmd=` only) are history; this instrument does not retroactively bind them and no
  round may claim it does.
- **External instruments are not revision-bound.** `sources-census.sh` lives outside the lane, so
  its receipt can only bind today's bytes; a change to that script after the fact is invisible to
  the binding (it will show as `mismatched`, which is the honest reading).
- **The binding is about identity, not correctness.** A digest match says the receipt measured
  *that* instrument; it says nothing about whether the instrument's verdict is right.
- **One writer per receipt directory.** The instrument reads; it never writes or repairs receipts.
- **The census is a field census.** `no_cmd=229` counts receipts that declare no `cmd=` field; a
  transcript line (`$ node …`) is not a declared field and is not read as one. The revenger seat
  counted 45 receipts in the same range whose text carries a command in another syntax (37 of them
  resolve at their own `rev=`), which is a different question: those receipts *name* a subject but
  declare no digest for it, so no rule can check them.
