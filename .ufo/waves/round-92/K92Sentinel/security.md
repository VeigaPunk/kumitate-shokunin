# K92Sentinel — security review of reading host transcripts (round 92, C1 `seat-route`)

Seat dir: `.ufo/waves/round-92/K92Sentinel/`. Every claim below names the script and the receipt
in this directory. Transcripts are host records: only path + sha256 + field values are quoted;
no credential-shaped string is printed anywhere in this seat dir.

Surface reviewed: (i) the frozen field definitions and their executable form
`probe/oracle92.py`, (ii) the frozen counter `probe/probe92-c1.py` and its pre-data controls,
(iii) the candidate `K92ExecTool/seat-route.mjs`, (iv) the committed round-92 files.

Candidate state at review time: `K92ExecTool/READY` holds
`3b8b6ce072db381a52fda44dd78cd9936be5b3fefd19f758328fe82b06002608`, which equals
`sha256sum seat-route.mjs` and `K92ExecTool/sha256.txt`, so the candidate attacks below
(`attack.txt`, `spoof-human.txt`) ran on the **shipped** bytes. `attack.py` is the driver if the
bytes change.

---

## RD-1 — the frozen redaction is shape-blind: 8 credential families survive intact

Class: credential exposure in a field designed for publication (`last_error`).
Definition: `plan.md` §Frozen field definitions — "every run of 24 or more characters from
`[A-Za-z0-9_-]` replaced by `<redacted>`, then cut to 120 characters".
Reproduction: `redact-test.py`, `redact-test2.py` (fabricated values only, receipts
`redact-test.txt`, `redact-test2.txt`). The frozen oracle is run on synthetic omp-shaped
transcripts; the emitted `last_error` is printed because every value is synthetic.

| family | emitted `last_error` retains | why |
|---|---|---|
| AWS secret access key (40 b64 chars) | the **whole** secret (`<FAKE-REDACTED-40-char-aws-doc-example>`) | `/` splits it into 13/7/18-char runs |
| AWS access key id (20 chars) | the whole id | 20 < 24 |
| AWS session token | `FwoGZXIvYXdzEA+/` prefix + tail fragments | `+/` split |
| JWT (3 short segments) | the whole token | `.` splits every segment |
| `Bearer <14>` | the whole token | 14 < 24 |
| URL `?token=<12>` | the whole query value | 12 < 24 |
| email | the whole address | `@`/`.` split |
| DB URL `postgres://svc:<pw>@host` | the whole password | `:`/`@` split |
| PEM header | the whole header | spaces/hyphens split |
| `api_key=<16>` | the whole value | 16 < 24 |

The redaction fires only on one 24+-char alnum/`_`/`-` run; any credential containing `.`, `/`,
`+`, `=`, `@`, `:`, a space or a hyphen and shorter than 24 chars per fragment passes through
verbatim, and `last_error` is printed in both `--json` and human mode.

Severity: **medium** (would publish a complete AWS secret key or a DB password in a round
report). In-definition: **yes, by construction** — the definition *is* the redaction, and the
counter scores agreement with it, so a tool cannot redact more without losing HELD
(`controls/ctl-noredact.txt` shows the field is worth 1/133). This is a definition defect, not
a tool defect, and it is not a kill-rule event (kill rule (c) requires contradicting the
definition).

Observed exposure today: **none**. `scan1.txt` (all 61 sampleA transcripts, 38 with error turns)
→ 0 residual credential shapes; `scan2.txt` (60 `errfix` + the single `redact` transcript) → 0;
corpus-wide, `errlen.py` counted 29541 error turns over 27678 transcripts and the longest real
`errorMessage` first line is **350 chars**, i.e. the 120-char cap usually hides the tail and no
real error text carries a credential shape. So RD-1 is latent, not live.

## RD-2 — COUNTER: `parse_errors` is unreachable, so HELD is reachable without implementing it

Class: probe coverage / fabricated readiness. Reproduction: `probe-coverage.py`
(`probe-coverage.txt`) and `stub-hardcode0.py` (`stub-hardcode0.txt`).
- `index92.tsv` has **no `parseerr` stratum at all** (histogram: `aborted:459 capnone:46
  clean:9551 dead:941 errfix:1382 fallback:11974 multi:4737 none:5 redact:1 silent:47`), while
  the frozen `QUOTA` draws 2 from `parseerr`.
- Every scored record in the positive control has `parse_errors == 0`:
  A 0/61, C 0/60, W 0/12 have `parse_errors > 0`.
- A tool that implements every field **except** `parse_errors` (hardcoded 0) scores
  `C92_C1: HELD agree=133/133 A=61/61 C=60/60 W=12/12` — receipt `stub-hardcode0.txt`.

Severity: **high for the claim** (the predicate cannot distinguish "implements the definitions"
from "ignores parse errors"). In-definition: n/a — this is a counter finding, exactly the
"way to reach HELD without implementing the definitions" the assignment asks to report. Not a
kill-rule event by the plan's own text (reaching HELD is not a kill event), but it means HELD
does not certify the `parse_errors` field.

## RD-3 — COUNTER: the redaction branch is scored by at most one record

Class: probe coverage of the security-relevant field. `probe-coverage.txt`, `scan2.txt`.
The `redact` stratum contains exactly **1** transcript, while `QUOTA` asks for 4; the draw takes
what exists, so C contributes at most 1 redaction-dependent record (and 0 if A already used it —
`SAMPLEA_HIST=… redact:1`). `controls/ctl-noredact.txt` reads `132/133`, confirming one record.
Severity: **medium** — RD-1's mitigation is only ever checked by one record, so a tool that
redacts differently on 24+-char runs but agrees on that one file still reaches HELD.

## RD-4 — the frozen oracle (positive control) hangs on a FIFO named `<Seat>.jsonl`

Class: denial of service in the reference reading, inherited by the counter.
Reproduction: `oracle-attack.py` (`oracle-attack.txt`, `O1`): a sessions root containing
`FifoSeat.jsonl` (mkfifo) makes `oracle92.py --results … --sessions-root …` block; `timeout 15`
kills it (`rc=124 dt=15.0s`). `locate()` does `open(p,'rb').read()` on any `filenames` entry with
no `S_ISREG` check, and `_first_ts()` opens it a second time.
Severity: **low** today (the real tree has 0 non-regular `.jsonl`), **high** as a liveness
property of the instrument: any FIFO/socket dropped in the sessions root hangs the counter with
no diagnostic. In-definition: the definition says "`<name>.jsonl` files anywhere under the
sessions root" without a file-type qualifier, so the oracle is faithful and the definition is
what is under-specified.

## RD-5 — the definition has no containment check: a symlinked `.jsonl` is read outside the root

Class: trust-boundary escape (read outside the sessions root through a seat file).
Reproduction: `oracle-attack.py` `O2` — `EscapeSeat.jsonl` → `../../outside/EscapeSeat.jsonl`
is followed, the outside file is parsed and `session` reports
`…/oracle-attack/tmp*/outside/EscapeSeat.jsonl`, i.e. a realpath **outside** the sessions root.
Traversal through the seat *name* is closed in both implementations (`O3`: `../x` and
`/etc/passwd` → `absent`; the candidate additionally rejects `/`, `\`, NUL and `..`
via `UNSAFE_NAME`).
Severity: **low** (same-uid host data; the tool only republishes field values). In-definition:
yes — `locate()` realpaths the hit and never compares it to the root, so a faithful tool inherits
it. The candidate diverges here by skipping non-regular dirents (`entry.isFile()` is false for a
symlink), which is the safer behaviour; the real tree holds **0 symlinks and 0 non-regular
`.jsonl`**, so the divergence is not reachable today, but a future symlinked transcript would
make the candidate report `absent` where the oracle reports a record.

## RD-6 — candidate: one ≥~5.3 MB `errorMessage` first line aborts the whole run (exit 2)

Class: availability / fail-closed on a parseable line. Reproduction: `attack.py` `A11`
(`attack.txt`), threshold measured in scratch with the same primitives:
`node bisect.mjs` → 5,242,880 chars OK, **5,767,168 chars → `RangeError: Maximum call stack
size exceeded`** from `String.prototype.replace(/[A-Za-z0-9_-]{24,}/g, …)` on node v24.21.0.
The tool's `redactLastError()` calls that replace before the 120-char cut, so a single error
turn with a ≥~5.3 MB first line makes `--file` and `--results` print
`SEAT_ROUTE: FAILCLOSED error: Maximum call stack size exceeded` and exit 2 — no record at all,
where the definition says the line parses to a turn and `last_error` is its first line cut to 120.
Severity: **low** — no real exposure: the longest real `errorMessage` first line is 350 chars
(`errlen.py`), and the corpus's longest lines (9,334,445 and 6,354,727 bytes) are `stop` /
`toolResult` turns, which the tool handles (`A9` passes on a 50 MB non-error line).
In-definition: no — a parseable line must produce a record; this is a tool defect.
Fix: cut to 120 chars *before* the replace, or replace per-run with a manual scan.

## RD-7 — candidate: a single line > 512 MB aborts the run (exit 2)

Class: availability. Reproduction: `attack.py` `A10` — a 2 GB sparse transcript
(`truncate -s 2G`) under `prlimit --as=4294967296 timeout 300` exits 2 after 39 s with
`Invalid string length` (V8's 512 MB string ceiling) instead of counting one unparsable line.
Severity: **low** (no real file exceeds 9.4 MB; the oracle would need >2 GB of RSS for the same
input, so this is not a divergence on realistic data). In-definition: ambiguous — "a line that
does not parse to an object adds 1 to `parse_errors`" cannot be honoured without a line-length
cap; the tool fails closed instead, which is the safer of the two.

## RD-8 — candidate: human mode forges `SEAT_ROUTE:` lines from untrusted field values

Class: report integrity (log injection). Reproduction: `spoof-human.txt` — a results.json seat
name `Evil\nSEAT_ROUTE: HELD agree=133/133` and a transcript `provider`
`p\nSEAT_ROUTE: HELD agree=133/133` produce **two** lines matching
`^SEAT_ROUTE: HELD agree=133/133`, alongside the real `SEAT_ROUTE: OK seats=2 …`. `humanLine()`
interpolates `rec.seat`, `captured` and `answered.join(',')` unescaped; `last_error` is
`JSON.stringify`-escaped and is safe, and `--json` output is escaped throughout.
Severity: **medium for the claim's purpose** — the tool exists to replace hand-written seat-status
prose in round reports, so a lane-written results.json or a model string can plant a fake verdict
line that a `grep '^SEAT_ROUTE:'` reader would accept. In-definition: no (the frozen definitions
say nothing about human-mode rendering); routed, not a kill-rule event.
Fix: `JSON.stringify` or strip `[\u0000-\u001f\u007f]` from `seat`, `captured`, `answered`,
`role` in `humanLine()`.

## RD-9 — checked and clean (no finding)

- Candidate does not read/import/execute anything under `.ufo/waves/round-92/`: grep of its bytes
  for `round-92`, `oracle92`, `probe92` → 0 hits (kill rule (d) clean for the reviewed sha).
- No network use; the only writes are inside `--selftest`'s `mkdtempSync(tmpdir())` tree.
- Seat-name traversal, NUL, 5000-char name, fullwidth `．．/`, FIFO, `/dev/zero` symlink,
  symlink loop (`loop -> root`, `cwd-a/back -> root`), unreadable directory: all terminate in
  <1 s and yield `{session: null, final: "absent"}` (`attack.txt` A1..A6).
- Fail-closed exit 2 on absent/unparseable results.json, absent root, root-is-a-file; exit 64 on
  usage (`A8`). `--file` on a 50 MB non-error line returns a correct record (`A9`).
- Committed round-92 files carry no transcript payload: `git show 596f675… --name-only` × grep
  for `"stopReason"|"errorMessage"|toolCall|"usage"|"content"` → only upstream omp source
  (`open/types.ts` 10, `open/session.md` 9), `probe/oracle92.py` 5 (its own field names),
  `plan.md` 1. `probe/index92.tsv` is path+size+mtime+strata, `probe/sampleA.tsv` is
  stratum+path, `probe/sampleA.salt` is one line. `controls/*.txt` hold `cmd=`, `at=`, two
  sha256 values, `C_ITEM <stratum> <path>`, `DISAGREE … <seat> <fields>` and the verdict line —
  no `last_error`, no message text (grep `<redacted>` → 0 in all 11 files).
- `last_error` in `--json` is `JSON.stringify`-escaped, so the JSON surface is injection-safe.

## Severity summary

| id | surface | severity | in-definition |
|---|---|---|---|
| RD-1 | frozen redaction | medium (latent) | yes — definition defect |
| RD-2 | counter coverage (`parse_errors`) | high (claim validity) | counter finding |
| RD-3 | counter coverage (`redact`) | medium | counter finding |
| RD-4 | oracle liveness (FIFO) | low/latent | yes — definition under-specified |
| RD-5 | oracle containment (symlink) | low | yes |
| RD-6 | candidate, huge error line | low | no (tool defect) |
| RD-7 | candidate, >512 MB line | low | ambiguous |
| RD-8 | candidate, human-mode injection | medium (report integrity) | no |

Smallest remediations: RD-1 add `[A-Za-z0-9._+/=@:-]{16,}` and a `Bearer\s+\S+` rule to the
definition (or publish `last_error` length+class only); RD-2 add a `parseerr` stratum to the
index and draw from it, or drop the field from the record; RD-3 raise the `redact` stratum;
RD-4/5 add `stat.S_ISREG` and a realpath-under-root check to `locate()`; RD-6 cut before
replacing; RD-8 escape the four interpolated fields.
