# K93Sentinel — round 93 security review (report)

Full findings, counts and reproductions: `.ufo/waves/round-93/K93Sentinel/security.md`.
Receipts: `shape-scan{,2,3}.{py,txt}`, `identify36.{py,txt}`, `rd1-repro.{py,txt}`,
`attack93.py`, `attack93.txt`, `attack93-quick.txt`, `rd6-check.{py,txt}`,
`fifo-symlink-check.{py,txt}`, `record-parity.txt`, `selftest-k93.txt`, `gh013-check.{py,txt}`.
Candidate reviewed at READY: `sha256=98a5a3a341b2b41540206caa5378d2ff5dacf02015f8aedf160b9d0f72b6efe9`
(= `K93ExecTool/READY` = `sha256sum seat-route.mjs` = `sha256.txt`).

S1 — shape scan of the five new string fields, full host tree (27 979 files / 21.6 GB, then 27 989):
`resolvedModel` 42 914 values/39 distinct, `chain[]` 185 810/51, `upstreamProvider` 3 398/1,
`supersededBy.provider` 26 869/13, `supersededBy.model` 26 869/28. 24+ run hits: 79 / 226 / 0 / 0 / 30
(later pass 79/235/0/0/35) = **2 distinct values**, both model identities: a 36-char
`provider/model:effort` route (prefix == that file's `message.provider`, middle == its
`message.model`, suffix an effort token; `identify36.txt`) and a 24-char `message.model`. Zero
`sk-`/`ghp_`/JWT/PEM/Bearer/b64 hits. **v2 needs no redaction on these fields for the observed
data**; the residual risk (harness-supplied values printed verbatim) is routed as **R93-D1**, a
definition question — the frozen definitions were not changed.

RD-1 (r92 debt) — reproduced with a NON-credential-shaped token (`classify=[]`):
`NOT-A-SECRET:alpha/beta.gamma+delta=epsilon@zeta-split` survives `last_error` verbatim in v1
`cd7ee03d…`, oracle93 and the READY candidate, while 24×`a` becomes `<redacted>`; `mismatches=0`,
`receipt_credential_shapes=0` (`rd1-repro.txt`). Same code path a `/`/`+`-split AWS secret or a
`: @`-split DB password takes; defect unchanged by v2 (medium, latent, in-definition).

New findings: **S3a** `SEAT_ROUTE: DRIFT` joins raw seat names → a newline in a results.json name
forges a `SEAT_ROUTE: HELD` line (v1 and candidate, 1 forged line, `attack93.txt` A1); **S3b**
space-free `key=value` text in untrusted values duplicates SEAT fields — candidate 5 duplicates vs
v1 1, i.e. v2's five new fields widen it (A8); records are identical to the oracle
(`record-parity.txt`), so both are rendering-only, not kill-rule (c). **S4** oracle93 still hangs on
a FIFO (`rc=124`) and follows a symlinked transcript outside the root (`session_outside_root=true`);
candidate returns `absent`/fail-closed (live tree: 0 symlinks, 0 non-regular of 28 020). **S5** r92
RD-6 does not reproduce (v1 and candidate return a record at 5.7 M/50 MiB/200 MiB error lines — the
shipped v1 already carries the linear fix); RD-7 carried (600 MiB line → exit 2 after 67 s).
Clean: runtime clause (static grep 0, strace `execs=1 round93_opens=0` from a scratch copy),
`--selftest` PASS 54/54 writing only `mkdtemp(tmpdir())`, JSON escaping, control-char quoting of the
new fields, no network imports.

`resume_continuity_v1` is not part of round 93's predicate or contract (0 occurrences under
`.ufo/waves/round-93/`), so that standing check is inapplicable here.
