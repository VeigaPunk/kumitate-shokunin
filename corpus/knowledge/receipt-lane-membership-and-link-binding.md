source: S255 (proc_pid_root(5)), S256 (POSIX realpath(3)), S257 (gitformat-index), S258 (The Unicode Standard 15.0 ch.3) — plus the lane's own instrument at `scripts/receipt-bind.mjs` (contract `kumitate-receipt-bind-v3`)
verified-at: 2026-11-04, lane rev `round-89` integration commit (measured at the integration tip; the 30-arm scorer is `.ufo/waves/round-89/probe/probe89-c1.mjs`)
recheck: `node .ufo/waves/round-89/probe/probe89-c1.mjs --lane . --work "$HYAKU_SCRATCH/x" --rev <lane-tip>` → `C89_C1: HELD held=30/30`; `node scripts/receipt-bind.mjs --selftest` → `RECEIPT_BIND_SELFTEST: PASS held=64/64`

# Lane membership is a real-path fact; a link's blob is not the bytes that run

An evidence binder that decides whether a named instrument is "in the lane" from the **spelling** of
the token gets two verdicts wrong, and both are measurable:

1. **An alias is the lane.** `/proc/self/root<lane>/scripts/x.mjs` is the lane's own file — S255:
   `/proc/pid/root/` "is a symbolic link that points to the process's root directory". A lexical
   test (`relative(lane, resolve(token))`) reads that path as outside the lane, so the instrument is
   hashed **from the dirty worktree** and counted `external=`, and a receipt that binds the worktree
   bytes reads `CLEAN external=1` while the judged revision holds different bytes. Measured on the
   v2 instrument: `ARM alias-proc-root: FAIL exit=0 RECEIPT_BIND: CLEAN matched=1 mismatched=0
   unchecked=0 external=1` (`.ufo/waves/round-89/controls/ctl-base-v2-at-rev.txt`). The repair is the
   operation S256 names — resolve **both** sides and compare the results ("resolution does not
   involve '.', '..', or symbolic links") — after which the same input reads `DRIFT mismatched=1
   external=0` and the lane's own selftest arm `alias-proc-root-negative` holds.
2. **A mode-120000 instrument is a link, not a file.** S257: the 4-bit object type of an index entry
   is `1000 (regular file)`, `1010 (symbolic link)` or `1110 (gitlink)` — so for a symlink the blob
   `git cat-file blob <rev>:<path>` returns is the **target string**. Hashing it binds
   `sha256(<target string>)` while the content that executes is the target's: a receipt can bind
   arbitrary target content and read `CLEAN`. Measured on v2: `ARM symlink-instrument: FAIL exit=0
   RECEIPT_BIND: CLEAN matched=1 ...` (same receipt file). The repair is a `git ls-tree <rev> -- <rel>`
   mode test before the blob read → `FAIL-CLOSED SYMLINK_INSTRUMENT`.
3. **A BOM is a signature, not content.** S258: the UTF-8 byte-order mark's "usage at the beginning
   of a UTF-8 data stream is neither required nor recommended by the Unicode Standard, but its
   presence does not affect conformance". A parser whose field regex is anchored at `^rev=` does not
   see a BOM-prefixed `rev=`, falls back to `--rev`, and reports a **false `DRIFT`** for a receipt
   that is correct. Measured on v2: `ARM bom-rev: FAIL exit=1 RECEIPT_BIND: DRIFT matched=0
   mismatched=1`. The repair is one `replace(/^\uFEFF/, '')` before field parsing.

**The transferable rule.** For any binder that compares a claim against bytes at a revision:
membership is decided on resolved paths, the object type is decided before the bytes are read, and a
transport-level signature is stripped before the payload is parsed. Each of the three is a distinct
arm; the round's scorer keeps them apart so that a candidate that fixes one and not the others
scores below terminal (`ARM alias-proc-root`, `ARM symlink-instrument`, `ARM bom-rev`).

**Limit.** These are the three *observable* defects. The receipt read was also moved onto one
`O_NOFOLLOW` descriptor (`fstat` + read) to close the lstat-to-read swap, but a race is not
observable from a scorer, so it carries a selftest arm and no probe arm — the claim does not rest
on it.

**Correction (round 90, K89-V6; append-only, supersedes the `recheck:` line in the front matter).** That line quotes `RECEIPT_BIND_SELFTEST: PASS held=64/64`. The committed round-89 receipt prints `held=68/68` (`.ufo/waves/round-89/close/bind-selftest.txt`, 68 arms), and the round-90 instrument (v4, `kumitate-receipt-bind-v4`) prints `held=76/76` (`.ufo/waves/round-90/K90ExecInst/selftest-v4.txt`; lane `node scripts/receipt-bind.mjs --selftest --work <scratch>` → `RECEIPT_BIND_SELFTEST: PASS held=76/76`). The boundaries described above are unchanged by v4; v4 adds the invisible-prefix field-line class (`corpus/knowledge/receipt-invisible-prefix-fields.md`).
