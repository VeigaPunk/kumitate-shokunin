# K87ScribeEntry — round 87 scribe seat (C1 `receipt-bind`, knowledge entry + SOURCES rows)

Seat: K87ScribeEntry (scribe, leaf). Base `db97929212bb61ae970b10abac3cc4cd976713ae`; freeze `25a3a75df123a59c5cf0de944a6d2f067e278f82`.
Write scope used: `.ufo/waves/round-87/build/K87ScribeEntry/` and this report only. No commit, no push, no stash, no git mutation; the lane's history is unchanged (`HEAD` = `25a3a75d`).

## Behavior

Two drafts, one knowledge entry and two SOURCES rows, written under the build dir. Nothing under `corpus/` was edited by this seat; the L1 integrates.

| artifact | path | status |
|---|---|---|
| knowledge entry draft | `.ufo/waves/round-87/build/K87ScribeEntry/receipt-subject-binding.md` | drafted, parses (trio on lines 1–3) |
| SOURCES rows draft | `.ufo/waves/round-87/build/K87ScribeEntry/sources-rows.md` | drafted, both rows 11 cells |
| field breakdown receipt | `.ufo/waves/round-87/build/K87ScribeEntry/field-breakdown.txt` (script `field-breakdown.mjs`) | run, output committed to build dir |
| census re-run | `.ufo/waves/round-87/build/K87ScribeEntry/census-rerun.txt` | `receipts=239 bound=1 mismatch=9 unresolved=0 no_cmd=229` |
| verification receipts | `verify-A.txt`, `verify-B.txt` (+ driver `verify-B.sh`), `verify-C.txt`, `ctrl-*.out` | as listed in Gates |

## Gates / commands run (exact; all read-only over the lane)

1. `node .ufo/waves/round-87/open/census-toolbind.mjs round-74 … round-86` → stdout `receipts=239 bound=1 mismatch=9 unresolved=0 no_cmd=229`, exit 0 (receipt `build/K87ScribeEntry/census-rerun.txt`).
2. `node .ufo/waves/round-87/build/K87ScribeEntry/field-breakdown.mjs` → `TOTAL receipts=239 cmd_and_hash=10 cmd_only=4 hash_only=0 neither=225`; per round: round-85 `cmd_only=4 neither=5`; round-86 `cmd+hash=10`; rounds 74–84 all `neither`. exit 0.
3. `grep -cE '^\|…S[0-9]{3,}…' corpus/SOURCES.md` (working tree) → 189; at base → 187; highest base id `S249`; `awk` malformed-row check (NF≠13) → 0 at base and in working tree.
4. Row NF check on both drafted rows: `S250 NF=13`, `S251 NF=13` (11 cells each; no `|` inside a cell, verified cell by cell).
5. `grep -c "createHash('sha256')" run-close.mjs` at base → line 24; `sed -n 24p` shows `counter-receipt.mjs` hashed in the loop body; `grep -c "^ \['" run-close.mjs` → 10 cases; `ls round-86/close/*.txt | wc -l` → 10; `grep -H tool_sha256 round-86/close/*.txt | uniq -c` → one digest `e95313700aaf…` ×10.
6. `sha256sum scripts/counter-receipt.mjs` → `e95313700aaf8430c51e0f8abdb991ab168519eecf9803cce3fac51154f31069`.
7. `grep -rn tool_sha256 scripts/ | wc -l` → 0 (no lane script reads the field).
8. Probe controls re-measured with the frozen probe at base (`bash .ufo/waves/round-87/build/K87ScribeEntry/verify-B.sh`, driver exit 0; each probe exit 1 as the probe's own UNMET verdict): base `C87_C1: UNMET held=0/12`; stub-clean `held=0/12`; constant-drift `held=1/12`; path-keyed `held=3/12`. These match the committed `controls/*.txt`.
9. L1 reference candidate `build/L1Reference/receipt-bind.mjs --dir .ufo/waves/round-86/close --rev 19b4e440e83ea9d618708003f36c3a799eb13e08 --lane .` → `RECEIPT_BIND: DRIFT matched=1 mismatched=9 unchecked=0 external=1 first=c1-probe.txt`, exit 1. (Probe-level scoring of this candidate was NOT run by this seat; that belongs to the executor/critic seats.)
10. `grep -cE '^\s*// A[0-9]+ —' probe87-c1.mjs` → 12; `grep -c 'copyDir(R87' probe87-c1.mjs` → 6 (the six same-directory fixtures).
11. `git status --porcelain -- .ufo/waves/round-87/build/K87ScribeEntry` → only `??` (untracked, mine). `git log --oneline -1` → `25a3a75d`. No mutating git command was run.

Verification of the entry's count-with-command rule: a bare-number sweep (`grep -nE '\b(…|[0-9]+)\b'` on the entry, excluding lines carrying a command, a date or a path) leaves only structural mentions (exit codes, `12` arm maximum, list headings). Every corpus count carries `<n> — <command> <date>` or sits inside a command output block.

## Frozen inputs read before work

`.ufo/waves/round-87/plan.md` (frozen) and `probe/probe87-c1.mjs` (frozen, read in full, 258 lines) were read first. Neither was edited. `CORPUS.md` (fleet root) and `corpus/README.md` / `corpus/SOURCES.md` rules were read for the trio, census and row shape.

## Source rows — what the L1 supplied and what I used

No L1 handoff message (URL/anchor/quote/tier) reached this seat. I used the L1's own uncommitted working-tree rows `S250` and `S251` (`git diff -- corpus/SOURCES.md`, lines 205–206), and re-read the two byte-pinned captures under `.ufo/waves/round-87/open/`:

- `open/intoto-statement.md` sha256 `cbe684a18b812b8b613d9202eb43b2ea24477f91a2ad6ca5be935185a455ebea`; lines 3–4 ("The Statement is the middle layer of the attestation, binding it to a particular subject") and line 37 ("Each element MUST have `digest` set") confirmed by `sed`/`python` read.
- `open/cosign-verify.html` sha256 `cddc158241a16c414589b05f77674d24902660e61c722f9630414c16a753e298`; the "Important Note" sentence ("Signature payloads created by cosign included the digest of the container image they are attached to") confirmed in the stripped text.

I did not re-fetch the live URLs from this seat; the evidence for both rows is the capture file. If the L1 expected a live re-open, that is a gap the L1 should close.

## Findings (for the L1 integration and the reviewer)

1. **Entry replaces an L1 draft.** The working tree already holds an untracked `corpus/knowledge/receipt-subject-binding.md` (81 lines, `verified-at: 2026-11-04` bare, `recheck: on-release`). Under CORPUS.md's count rule that draft has bare counts in its prose; the seat draft is the replacement. The L1 should overwrite the untracked file with `build/K87ScribeEntry/receipt-subject-binding.md`, not merge.
2. **Census bucket definition.** The census's `no_cmd=229` bucket is "no `cmd=` **or** no `tool_sha256=`", i.e. 225 neither + 4 cmd-only (round-85). The entry says so explicitly; the plan's "229 with no `cmd=`/`tool_sha256=`" is correct only under that reading.
3. **Round-85 cmd-only receipts.** Four round-85 receipts carry `cmd=` without `tool_sha256=` (`c1-probe.txt`, `content-variation.txt`, `history-v2.txt`, `selftest.txt`). The plan does not name them; the entry names them.
4. **S251 tier.** Drafted as `B` as the L1 wrote it. Sigstore's own CLI reference is a maintainer statement and could be argued `A` for its own scope; the rejection's reason does not depend on the tier, so I left it. Reviewer may flip it.
5. **Control receipts.** The base-rev measurement of the `--tool scripts/receipt-bind.mjs` control is "absent instrument" by construction (the file is not integrated); it reads 0/12 as `controls/base.txt` does.
6. **External instrument.** `sources-census.sh` is named by round-86 `census.txt` as `/home/vgpnk/Projects/shokunin/scripts/sources-census.sh`, a fleet-root file. Checked: `git -C /home/vgpnk/Projects/shokunin ls-files scripts/sources-census.sh` → `scripts/sources-census.sh` (tracked by the fleet repo); `git ls-files | grep -c sources-census.sh` in the lane → 0 (not in the lane). Its current `sha256sum` is `3fb7261569f46423dd80ecc23e0a23789a7926f667c7a3fc559d2439d4a64e30`; the round-86 receipt declares `e95313700aaf…` (the counter-receipt digest). The entry cites only the fleet-root path, which is the path the receipt names.
7. **Revenger reference.** The entry's earlier draft cited "the revenger arm of round 87"; no such arm exists in the round-87 spec, so the reference was removed. (The fleet `revenger-shokunin/.ufo/waves/round-87/` holds only four census logs with no toolbind content.)

## Out-of-scope / not done

- No commit, no integration into `corpus/`, `corpus/README.md`, `corpus/SOURCES.md`, `corpus/lessons/`, `scripts/`, `SCORECARD.md`, `LOG.md`.
- Did not score the L1 reference candidate with the 12-arm probe (not my seat).
- The round-87 close receipts do not yet exist (`.ufo/waves/round-87/close/` absent at this read); the trio's recheck names the command that will produce them.

## Tools

None installed or upgraded. Used only `node` (host), `git` (read-only), `sha256sum`, `awk`, `grep`, `python3` (read-only text extraction of captures).

## Scratch

`/fast/scratch/hyaku/kumitate-r87/K87ScribeEntry/` was created for probe work dirs and the census re-run; receipts needed were copied into the build dir; the scratch dir was removed (`rm -rf`) before this report. `HYAKU_SCRATCH` was unset in the environment; the path used is the default `/fast/scratch/hyaku`.

---

## Draft 1 — `corpus/knowledge/receipt-subject-binding.md` (verbatim; file `build/K87ScribeEntry/receipt-subject-binding.md`)

````
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
````

---

## Draft 2 — SOURCES rows (verbatim; file `build/K87ScribeEntry/sources-rows.md`)

Admitted row (`status=mined`, `used-by=corpus/knowledge/receipt-subject-binding.md`):

```
| S250 | in-toto attestation Statement layer specification — https://github.com/in-toto/attestation/blob/main/spec/v1/statement.md | spec | A | An attestation must identify its subject artifact by digest | spec/v1/statement.md Statement layer specification, main branch read 2026-11-04; capture .ufo/waves/round-87/open/intoto-statement.md sha256 cbe684a1…; quote lines 3–4 "The Statement is the middle layer of the attestation, binding it to a particular subject" and line 37 "Each element MUST have `digest` set" | An attestation binds to its subject only when the subject carries a digest; a name alone is not the binding | mined | 2026-11-04 | on-release | corpus/knowledge/receipt-subject-binding.md |
```

Rejected row (`status=rejected`, `used-by=—`):

```
| S251 | Sigstore cosign — Verifying Signatures (CLI reference) — https://docs.sigstore.dev/cosign/verifying/verify/ | docs | B | Cosign payload claim that a signature names the image digest | Verifying Signatures, Important Note block, page read 2026-11-04; capture .ufo/waves/round-87/open/cosign-verify.html sha256 cddc1582…; quote "Signature payloads created by cosign included the digest of the container image they are attached to" | REJECTED: covers artifact-to-signature binding, not the instrument that produced a measurement; flip: a normative statement that a verification receipt records the verifier binary and its digest | rejected | 2026-11-04 | 180d | — |
```

Both rows: 11 cells each (`awk -F'|' NF` = 13), no `|` inside a cell, ids `S250`/`S251` are the next unused after `S249`. The L1's uncommitted working-tree rows at `corpus/SOURCES.md` lines 205–206 carry the same two ids; integration is a no-op on the ids.

## Integration points for the L1

1. Replace the untracked `corpus/knowledge/receipt-subject-binding.md` with `build/K87ScribeEntry/receipt-subject-binding.md` (the working-tree file is the older draft; not merged).
2. `corpus/SOURCES.md`: keep the two rows at the end of the registry table as they stand in the working tree (they match the drafts above, except that the drafted anchor and quote cells carry the capture digests and quote locations).
3. `corpus/README.md`: the coverage row for `knowledge/receipt-subject-binding.md` is already present in the working tree; no change from this seat.
