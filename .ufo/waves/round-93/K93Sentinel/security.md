# K93Sentinel — security review of `seat-route` v2 and r92 RD-1 (round 93, C1)

Seat dir: `.ufo/waves/round-93/K93Sentinel/`. Every claim below names the script and the receipt in
this directory. Host transcripts are read-only records: this seat quotes **no** field value from
them; the shape scans report counts, hashes and structural decompositions only. The two synthetic
fixtures used below (`NOT-A-SECRET:…`, `final=dead`) are built at runtime in
`/fast/scratch/hyaku/kumitate-r93/K93Sentinel/` and are not credential-shaped (the seat dir, these
receipts included, passes `gh013-check.py` → `unexplained=0`).

Surface reviewed: (i) the five new/changed v2 string-bearing fields and their frozen definitions
(`plan.md`, executable form `probe/oracle93.py`), (ii) the frozen redaction inherited from v1
(r92 RD-1), (iii) the candidate `K93ExecTool/seat-route.mjs`, (iv) the r93 instrument itself
(`oracle93.py` — the positive control).

Candidate state at review: `K93ExecTool/READY` =
`98a5a3a341b2b41540206caa5378d2ff5dacf02015f8aedf160b9d0f72b6efe9` = `sha256sum seat-route.mjs`
= `K93ExecTool/sha256.txt`. Every candidate result below was produced on those bytes (A0 in
`attack93.txt`, `rd1-repro.txt`).

---

## S1 — shape scan of the new v2 fields: 2 distinct values, 349 occurrences, all model identities

Class: credential exposure in fields v2 prints **unredacted** (`resolved`, `chain`, `upstream`,
`superseded_by`; only `last_error` is redacted). Method: full walk of `~/.omp/agent/sessions`
(regular `.jsonl` only, symlinked dirs not followed), streamed, JSON-parsed only for lines carrying
`session_init` / `upstreamProvider` / `retryRecovery`. Receipts `shape-scan.txt` (27 979 files,
21 644 818 920 bytes, 38.9 s), `shape-scan2.txt`, `shape-scan3.txt`.

| field | values | distinct | 24+ run hits | max len | credential-prefix / JWT / PEM / Bearer / b64 hits |
|---|---|---|---|---|---|
| `session_init.resolvedModel` | 42 914 | 39 | **79** | 45 | 0 |
| `session_init.retryFallback.chain[*]` | 185 810 | 51 | **226** | 45 | 0 |
| `message.upstreamProvider` (served) | 3 398 | 1 | 0 | 7 | 0 |
| `retryRecovery.supersededBy.provider` | 26 869 | 13 | 0 | 18 | 0 |
| `retryRecovery.supersededBy.model` | 26 869 | 28 | **30** | 28 | 0 |

The `run24` hits are **two distinct values**, not free text (`shape-scan3.txt`):

* `sha256_12=440e5db90f7c`, 36 chars, 314 files, fields `resolvedModel` + `chain[]`, never a
  `message.model`. `identify36.txt` decomposes it against the transcript that carries it:
  `prefix_len=7` == that file's `message.provider`, `middle_len=24` == that file's `message.model`,
  `suffix_len=3` is an omp reasoning-effort token (`high`/`max`/…). It is a model **route**
  `provider/model:effort`, not a secret.
* `sha256_12=340615d0fd40`, 24 chars, 36 files, `supersededBy.model`, and it **is** one of the
  corpus's `message.model` identities (`in_ident=True`).

No value in any of the five fields matches a credential family (`sk-`, `ghp_`, `github_pat_`,
`xox?-`, `AKIA`/`ASIA`, `AIza`, `glpat-`, `hf_`, `pypi-`, `npm_`), a JWT, a PEM header, a Bearer
token, or a ≥40-char mixed base64 blob. The literal plan test ("24+ run of `[A-Za-z0-9_-]`") fires
only because omp model ids themselves are long and hyphenated.

The table is the first pass (335 hit occurrences). The tree is live while the fleet writes, so the
later passes (`shape-scan2/3.txt`, 27 989 files) saw 349: `chain[]` 235, `resolvedModel` 79,
`supersededBy.model` 35 — same two distinct values, no new class.

**Answer to the assignment's question.** v2 does **not** need redaction on these fields for the
observed data: every hit is a model identity, and redacting 24+ runs would mangle 2 legitimate
values / 349 occurrences and make `chain`/`superseded_by` unreadable. The residual definition-level
risk is real but unexercised: `resolvedModel`, `chain` items and `supersededBy.{provider,model}` are
harness-supplied and printed verbatim, so a future omp build that writes a credential there would
publish it. Routed as **R93-D1** (definition question, not changed here — the definitions are
frozen and the counter scores them type-strictly; a redaction rule would have to be defined in v3
together with the oracle and counter).

Minor, same surface: `superseded_by` is `provider + "/" + model`, which is not invertible when the
provider contains `/` (oracle and candidate agree; definition wording, routed with R93-D1).

## S2 — RD-1 reproduction on a NON-credential-shaped token (r92 debt)

Class: the frozen redaction is shape-blind — it replaces only one 24+-char `[A-Za-z0-9_-]` run, so a
value split by `/ . + = : @` into shorter runs passes through whole. r92 could only demonstrate
this with a credential-shaped fixture (GH013 block). `rd1-repro.py` (`rd1-repro.txt`) shows the
**same code path** with a token that matches no credential family and no 24+ run:

```
SPLIT = 'NOT-A-SECRET:alpha/beta.gamma+delta=epsilon@zeta-split'   classify(SPLIT) = []
TWENTYFOUR = 24 x 'a'                                              classify = ['run24']
```

| tool (sha256) | `last_error` for SPLIT | `last_error` for 24×`a` |
|---|---|---|
| v1 `cd7ee03d…` | survives verbatim | `request failed: <redacted>` |
| oracle93 (frozen definition) | survives verbatim | `request failed: <redacted>` |
| candidate `98a5a3a3…` | survives verbatim | `request failed: <redacted>` |

`mismatches=0`, `receipt_credential_shapes=0`. So the branch exists and is exactly the one a real
AWS secret access key (40 base64 chars, `/`/`+` split) or a DB-URL password (`:`/`@` split) would
take; the fixture itself is committable. v2 inherits the defect unchanged — the rename and the new
fields do not touch `_head`/`redactLastError`. Severity **medium (latent)**, in-definition: yes
(the definition *is* the redaction); not a kill-rule event.

The new fields widen the unredacted surface by four fields (S1), but the observed values there are
model identities, so no live exposure was found.

## S3 — human-mode report integrity: two carry-overs, one widened by v2

Records are unaffected: for the forging fixture the oracle and candidate records are byte-identical
(`record-parity.txt`: `record_identical=true`, 17 keys). Both findings are rendering-only, so they
are not kill-rule (c) events (that clause is about record fields).

### S3a — the `SEAT_ROUTE: DRIFT` line interpolates raw seat names (v1 and candidate)

`attack93.txt` A1: a results.json seat name `Evil\nSEAT_ROUTE: HELD agree=221/221` — legal under
`UNSAFE_NAME` (no `/`, `\`, NUL, `..`) — locates nothing, so it lands in `drift`, which is joined
raw: `drift=Evil` + newline + `SEAT_ROUTE: HELD agree=221/221`. Both v1 and the candidate print a
line matching `^SEAT_ROUTE: HELD` (1 forged line each). The per-seat `SEAT` line is safe (`tok()`
quotes the name). Severity **medium-low** (report integrity; a `grep '^SEAT_ROUTE:'` reader accepts
the forgery). Not in the frozen definitions (human mode is specified only as "one `SEAT …` line per
seat"); carry-over from v1, routed. Smallest remediation: `drift.map(tok)` in `summarize`/the DRIFT
line.

### S3b — printable `key=value` text in untrusted values duplicates SEAT fields (widened by v2)

`attack93.txt` A8: `tok()` quotes only non-printable ASCII and `"`; a space-free value such as
`resolvedModel="final=dead"`, `chain=["flag_hops=9"]`, `upstreamProvider="yielded=true"`,
`supersededBy.provider="fallback=true"` and a results.json `agent="executor:final=dead"` stays bare,
so the SEAT line reads
`… superseded_by=fallback=true/m upstream=yielded=true resolved=final=dead chain=[flag_hops=9]
flag_hops=0 … final=dead …` and a field-extracting reader sees duplicated `final=`, `fallback=`,
`flag_hops=`, `yielded=`. Candidate: 5 duplicated fields; v1: 1 (it has no new fields) — **v2 widens
this surface by five fields**. Severity **low-medium** (report integrity, lane-written results.json
and provider-supplied names only; host model ids do not contain `=`). Not in the definitions;
routed. Smallest remediation: quote any value containing `=`/space (or emit `key=<json>` for all
values).

## S4 — instrument (positive control) trust boundaries, re-verified on oracle93

`fifo-symlink-check.txt`:

* **O1** a FIFO named `FifoSeat.jsonl` in the sessions root: `oracle93.py --results` blocks
  (`rc=124` at the 8 s timeout; `locate()` does `open(p,'rb').read()` with no `S_ISREG` check);
  the candidate returns `absent` in 0.0 s. r92 RD-4 unchanged.
* **O2** a symlinked `EscapeSeat.jsonl` → outside the root: oracle follows it and reports a
  `session` realpath outside the sessions root (`session_outside_root=true`, `final=served`); the
  candidate's `entry.isFile()` skips symlinks → `absent`. r92 RD-5 unchanged; the candidate is the
  safer of the two.
* **O3** `--file` on a FIFO: oracle hangs (`rc=124`), candidate fail-closes
  (`rc=2 transcript is not a file`).

Latent only: the live tree holds **0 symlinked and 0 non-regular `.jsonl`** among 28 020 files
(counted at 18:05). Severity **low**; in-definition (the definition says "`<name>.jsonl` files
anywhere under the sessions root" with no file-type qualifier).

## S5 — r92 RD-6 verified fixed; RD-7 carried

`rd6-check.txt`: the r92 threshold does not reproduce — v1 **and** the candidate return a record
(`rc=0`, `last_error='e <redacted>'`) for a single-line `errorMessage` of 5 767 168, 50 MiB and
200 MiB chars (200 MiB: 8.2 s / 8.6 s). The shipped v1 already carries the linear-scan fix its
comment attributes to RD-6, so this is a regression check, not a contradiction of r92's finding on
the then-candidate.

RD-7 still holds: a 600 MiB single line (sparse) → `rc=2 SEAT_ROUTE: FAILCLOSED error: Invalid
string length` after 67.2 s (`attack93.txt` A6). Low, ambiguous-definition: r92's review reports the longest
real transcript line at 9.4 MB (`.ufo/waves/round-92/K92Sentinel/security.md` RD-7), far below the
V8 string ceiling.

## S6 — checked and clean

* **Runtime clause (d).** Static byte grep of the candidate for `round-93`, `round-92`, `oracle93`,
  `oracle92`, `probe93`, `probe92`, `fixtures` → all 0 (`attack93.txt` A4). Dynamic: the candidate
  copied to scratch and run under `strace -f -e trace=open,openat,openat2,execve` → `execs=1`,
  `round93_opens=0`, verdict `CLEAN` (same receipt). The copy is used so the tool's own
  `round-93/K93ExecTool/` path cannot be mistaken for a read (at M the tool lives in `scripts/`).
* **Writes.** Only `--selftest` writes, under `mkdtempSync(join(tmpdir(), 'seat-route-selftest-'))`,
  removed with `rmSync`; `--selftest` run with `TMPDIR=<scratch>` → `PASS held=54/54`
  (`selftest-k93.txt`). No network module is imported (`node:fs`, `node:os`, `node:path`,
  `node:child_process` for selftest re-entry only, `node:string_decoder`, `node:url`).
* **JSON mode.** Hostile newline/ANSI values in all four new fields still produce valid JSON
  (`attack93.txt` A3), and the oracle/candidate records agree (`record-parity.txt`).
* **Control characters in human mode.** Newline and `ESC[2J` in `resolvedModel`, `chain[]`,
  `upstreamProvider`, `supersededBy` produce 0 forged `SEAT_ROUTE: HELD` lines and 0 ESC bytes
  (`attack93.txt` A2) — `tok()` quotes them. This is the r92 RD-8 fix working for the new fields.
* **Seat-dir hygiene.** 136 KB total, no transcript payload (only field names in the drivers), and
  `gh013-check.py` → `benign_run24_tokens=29 unexplained=0` (the 29 are sha256 digests, snake_case
  identifiers, a CamelCase identifier and the transcript path segment).

## Severity summary

| id | surface | severity | in-definition | action |
|---|---|---|---|---|
| S1 / R93-D1 | new v2 fields printed unredacted | info (no live exposure; 2 model-identity values / 349 occurrences) | yes — definition question | **route**; no v2 change |
| RD-1 (S2) | frozen redaction shape-blind | medium (latent) | yes — definition defect | route; unchanged by v2 |
| S3a | `SEAT_ROUTE: DRIFT` raw seat names | medium-low (report integrity) | no (human mode unspecified) | route; `drift.map(tok)` |
| S3b | `key=value` forging in SEAT line, widened by 5 new fields | low-medium (report integrity) | no | route; quote `=`/space |
| S4 | oracle FIFO hang / symlink escape | low (latent; 0/0 in live tree) | yes — definition under-specified | route; `S_ISREG` + realpath-under-root |
| RD-7 (S5) | >512 MiB single line → exit 2 | low | ambiguous | route |
| RD-6 (S5) | huge error line | — | — | verified fixed in v1 and candidate |

No kill-rule event was found: no non-positive control was disturbed, no committed reproduction
contradicts a frozen field definition, the candidate's bytes are the READY bytes, and the runtime
clause is clean. S1/S3 are counter-adjacent findings about what HELD does **not** certify (the
unredacted new fields and human-mode rendering), reported as the assignment asks.

## Receipts

| file | what it is |
|---|---|
| `shape-scan.py` / `shape-scan.txt` | first shape pass over the live host tree (counts per field + shape classes) |
| `shape-scan2.py` / `shape-scan2.txt` | identity correlation: hits vs `message.model`/`model_change.model` |
| `shape-scan3.py` / `shape-scan3.txt` | provenance: distinct hit values, sha256_12, char classes, files, timestamps |
| `identify36.py` / `identify36.txt` | structural decomposition of the 36-char route (no value printed) |
| `rd1-repro.py` / `rd1-repro.txt` | RD-1 non-secret reproduction on v1, oracle93 and the READY candidate |
| `attack93.py` / `attack93.txt` | A0 readiness, A1 drift injection, A2 new-field injection, A3 JSON, A4 runtime clause, A5 RD-6, A6 RD-7, A7 unredacted new fields, A8 field forging |
| `attack93-quick.txt` | the same run before the final A8 payload (kept for the audit trail) |
| `rd6-check.py` / `rd6-check.txt` | RD-6 threshold re-check at 5.7 M / 50 MiB / 200 MiB |
| `fifo-symlink-check.py` / `fifo-symlink-check.txt` | O1/O2/O3 instrument checks |
| `record-parity.txt` | oracle vs candidate record equality on the forging fixture |
| `selftest-k93.txt` | `--selftest` PASS under a scratch `TMPDIR` |
| `gh013-check.py` | seat-dir credential-shape pre-check (`unexplained=0`) |
