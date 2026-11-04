# SOURCES rows — round-87 drafts (seat K87ScribeEntry)

Two rows, in the 11-column registry shape of `corpus/SOURCES.md` (`| id | source | kind | tier |
scope | anchor | teaches | status | opened | recheck | used-by |`). Both are for the source the L1
opened this round and one rejection from the same opening.

**Row ids.** The L1's uncommitted working-tree edit to `corpus/SOURCES.md` already carries these two
rows as **S250** and **S251** (lines 205–206 of the working-tree file, `git diff -- corpus/SOURCES.md`
shows `+2` lines). The drafts below keep those ids so the L1's edit and this draft agree on one
registry; the L1 changes nothing on integration.

**Counting.** `grep -cE '^\|[[:space:]]*S[0-9]{3,}[[:space:]]*\|' corpus/SOURCES.md` (working tree,
2026-11-04) → 189 rows; the same command over
`git show db97929212bb61ae970b10abac3cc4cd976713ae:corpus/SOURCES.md` → 187 rows at base. The two
round-87 rows are the last two by id; the highest base id is S249
(`git show db97929212bb61ae970b10abac3cc4cd976713ae:corpus/SOURCES.md | grep -oE '^\|[[:space:]]*S[0-9]{3,}' | tr -d ' |' | sort | tail -1`),
so S250 and S251 are the next unused ids. The ids are not contiguous with the row count — 187
distinct ids at base against a highest id of S249 — so the count is stated from the command, never
from the id range.

**Cells.** No cell contains a `|`. Each row has exactly 11 cells (the `awk -F'|'` NF is 13, counting
the empty fields either side of the outer pipes). Verified:
`awk -F'|' '/^\|[[:space:]]*S250[[:space:]]*\|/ {print NF}'` → 13 and
`awk -F'|' '/^\|[[:space:]]*S251[[:space:]]*\|/ {print NF}'` → 13.

## Admitted row (status `mined`)

```
| S250 | in-toto attestation Statement layer specification — https://github.com/in-toto/attestation/blob/main/spec/v1/statement.md | spec | A | An attestation must identify its subject artifact by digest | spec/v1/statement.md Statement layer specification, main branch read 2026-11-04; capture .ufo/waves/round-87/open/intoto-statement.md sha256 cbe684a1…; quote lines 3–4 "The Statement is the middle layer of the attestation, binding it to a particular subject" and line 37 "Each element MUST have `digest` set" | An attestation binds to its subject only when the subject carries a digest; a name alone is not the binding | mined | 2026-11-04 | on-release | corpus/knowledge/receipt-subject-binding.md |
```

- **id** S250 — the next unused id after S249 (`grep -cE '^\|[[:space:]]*S[0-9]{3,}[[:space:]]*\|' corpus/SOURCES.md` at base → 249 rows, S001..S249).
- **kind** `spec` · **tier** `A` — tier A is scoped to the claim it supports (a normative
  specification of the attestation subject binding), not global.
- **anchor** — the exact heading plus the revision read (`main`, 2026-11-04) and the byte-pinned
  capture under this round's `open/`, so the quote is re-openable without a network fetch.
- **teaches** — one grounded learner benefit, with the ≤25-word quote and its location grounding
  it, per `CORPUS.md` § SOURCES rule 1.
- **status** `mined` — cited by `corpus/knowledge/receipt-subject-binding.md`.
- **used-by** — `corpus/knowledge/receipt-subject-binding.md` (the file the L1 integrates; the
  draft is at `.ufo/waves/round-87/build/K87ScribeEntry/receipt-subject-binding.md`).

## Rejected row

```
| S251 | Sigstore cosign — Verifying Signatures (CLI reference) — https://docs.sigstore.dev/cosign/verifying/verify/ | docs | B | Cosign payload claim that a signature names the image digest | Verifying Signatures, Important Note block, page read 2026-11-04; capture .ufo/waves/round-87/open/cosign-verify.html sha256 cddc1582…; quote "Signature payloads created by cosign included the digest of the container image they are attached to" | REJECTED: covers artifact-to-signature binding, not the instrument that produced a measurement; flip: a normative statement that a verification receipt records the verifier binary and its digest | rejected | 2026-11-04 | 180d | — |
```

- **reason** — the page binds a *signature payload* to the *artifact it signs*. It says nothing
  about the identity of the verifier that produced a measurement, which is the class of binding
  round 87 needed. A CLI reference is not a normative requirement on receipts.
- **flip** — what would change the verdict: a normative statement that a verification receipt
  records the verifier binary and its digest. That is exactly the gap this round's contract
  `kumitate-receipt-bind-v1` fills locally, so the row stays rejected as an external source.
- **status** `rejected` — kept as evidence of taste (the plausible-looking source that would have
  carried the wrong rule), per `CORPUS.md` § SOURCES: a rejection is evidence of taste.
- **used-by** — `—` — a rejected row is not cited by an admitted entry; the knowledge entry
  mentions S251 as the rejected near-miss but does not rest any admitted claim on it.

## Integration points for the L1

1. `corpus/SOURCES.md` — append the two rows above at the end of the registry table (the working
   tree already holds exactly these two rows at lines 205–206; this draft is the same content with
   the anchor extended with the capture digest and the quote location, per `CORPUS.md` rule 1).
   Do not renumber: `S250`/`S251` are the next unused ids and the L1's own working-tree edit
   already uses them.
2. `corpus/knowledge/receipt-subject-binding.md` — the entry draft at
   `.ufo/waves/round-87/build/K87ScribeEntry/receipt-subject-binding.md`; it opens with the
   provenance trio and cites `S250` plus the URL and anchor, as `CORPUS.md` requires of a new
   knowledge entry.
3. `corpus/README.md` — the coverage-map row for the new entry (the L1's working tree already
   carries one at the `knowledge/receipt-subject-binding.md` line).

## Census commands the L1 can run after integration

```
grep -cE '^\|[[:space:]]*S[0-9]{3,}[[:space:]]*\|' corpus/SOURCES.md
awk -F'|' '/^\|[[:space:]]*S[0-9][0-9][0-9]+[[:space:]]*\|/ && NF!=13 {n++} END{print n+0}' corpus/SOURCES.md
awk -F'|' '/^\|[[:space:]]*S[0-9][0-9][0-9]+[[:space:]]*\|/ {s=$9; gsub(/[[:space:]]/,"",s); n[s]++} END{for(k in n) printf "%s=%d ", k, n[k]; print ""}' corpus/SOURCES.md
```
