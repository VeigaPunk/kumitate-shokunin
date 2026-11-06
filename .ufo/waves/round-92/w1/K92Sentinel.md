# K92Sentinel — round 92 security review (report)

Full findings with reproductions: `.ufo/waves/round-92/K92Sentinel/security.md`.
Seat dir receipts: `scan1.txt`, `scan2.txt`, `redact-test.txt`, `redact-test2.txt`,
`probe-coverage.txt`, `stub-hardcode0.txt`, `oracle-attack.txt`, `attack.txt`, `spoof-human.txt`,
`exam4.txt`, and the drivers `scan1.py`, `scan2.py`, `redact-test.py`, `redact-test2.py`,
`probe-coverage.py`, `stub-hardcode0.py`, `oracle-attack.py`, `attack.py`.

Candidate reviewed at READY: `sha256=3b8b6ce072db381a52fda44dd78cd9936be5b3fefd19f758328fe82b06002608`
(= `K92ExecTool/READY` = `sha256sum seat-route.mjs`).

| id | surface | finding | severity | in-definition |
|---|---|---|---|---|
| RD-1 | frozen redaction | `[A-Za-z0-9_-]{24,}` misses 8 credential families; an AWS secret access key and a DB password pass through whole | medium (latent) | yes — definition defect |
| RD-2 | counter coverage | no `parseerr` stratum in `index92.tsv`; every scored record has `parse_errors==0`; a tool hardcoding 0 scores **HELD 133/133** | high (claim validity) | counter finding |
| RD-3 | counter coverage | `redact` stratum has 1 transcript vs quota 4 → the redaction branch is scored by ≤1 record (`ctl-noredact` 132/133) | medium | counter finding |
| RD-4 | oracle liveness | FIFO named `<Seat>.jsonl` in the sessions root hangs `oracle92.py` (`timeout 15` → rc 124); no `S_ISREG` check | low/latent | yes — definition under-specified |
| RD-5 | oracle containment | symlinked `.jsonl` is followed and read outside the sessions root; `session` reports a realpath outside root; seat-*name* traversal is closed | low | yes |
| RD-6 | candidate | one ≥~5.3 MB `errorMessage` first line → `RangeError` in `String.replace` → whole run exits 2 with no record (threshold 5,242,880 OK / 5,767,168 throws) | low | no (tool defect) |
| RD-7 | candidate | one line > 512 MB (2 GB sparse) → exit 2 `Invalid string length` after 39 s | low | ambiguous |
| RD-8 | candidate | human mode interpolates `seat`/`captured`/`answered` unescaped → a newline in a seat name or provider forges `SEAT_ROUTE: HELD …` lines (2 forged in `spoof-human.txt`); `--json` is safe | medium (report integrity) | no |

Clean (RD-9): candidate contains no `round-92`/`oracle92`/`probe92` reference (kill rule (d));
no network; writes only under `--selftest`'s tmpdir; traversal/NUL/5000-char/fullwidth names,
FIFO, `/dev/zero` symlink, symlink loop and an unreadable directory all terminate <1 s as
`{session:null, final:"absent"}`; exit 2 on unusable inputs, 64 on usage.

Exposure of RD-1 today is nil: 0 residual credential shapes over sampleA (61 transcripts, 38 with
error turns), over 60 `errfix` + the single `redact` transcript, and over the 4 corpus transcripts
whose error-row line carries a marker anywhere (marker was in `content`, not `errorMessage`).
Corpus-wide: 29541 error turns, longest real `errorMessage` first line 350 chars.

Committed round-92 files carry no transcript payload: `open/types.ts` and `open/session.md` are
upstream omp source, `probe/oracle92.py` mentions only its own field names, `index92.tsv` is
path+size+mtime+strata, `sampleA.tsv` is stratum+path, and `controls/*.txt` hold only `cmd=`,
`at=`, two sha256s, `C_ITEM <stratum> <path>`, `DISAGREE … <seat> <fields>` and the verdict line
(`grep -c '<redacted>'` = 0 in all 11).
