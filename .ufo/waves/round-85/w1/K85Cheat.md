# K85Cheat — C1 control review (round 85, reviewer seat)

Measured revision: `9db0c6b5eb9111cfc5581006ba976ca2cd112792`. Durable artifacts:
`/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-85/build/K85Cheat/`
(`README.md`, `control-{a,b,c,d,e}.mjs`, `fixtures.json`, `gen.mjs`, `analyze.mjs`,
38 receipts with command/exit/revision/sha256 in `receipts/MANIFEST.md`). Scratch was
`/fast/scratch/hyaku/kumitate-r85/K85Cheat` and is deleted. No production, plan, probe or
control file was touched; nothing was installed; no git/jj mutation; no other seat's
files were read-modify-written.

## Assigned hypothesis — answer

A label-keyed no-reader that copies the probe's own fixture values (table extracted
verbatim from `probe85-c1.mjs`, not transcribed) scores **`C85_C1: UNMET held=2/20`,
exit 1** (`receipts/probe-a.txt`). Adding the known constant 21-byte nonce line to the
byte count changes nothing: still **2/20** (`receipts/probe-b.txt`).

- **The assertion class that defeats it is `sha256=` and nothing else.** `analyze.txt`
  reports 18 failing arms for `control-b` whose *only* differing field is `sha256`; the
  verdict line, exit code, `bytes`, `rows`, `held`, `findings` and `SOURCE` all match.
  For `control-a` the same 18 arms differ in `bytes`+`sha256`, and the byte gap is exactly
  the 21-byte nonce line (`gen.txt`: `nonce_line_bytes=21`).
- **Arms defeatable without reading the file: exactly two.** `missing` (the probe writes
  no file; the expected `RECEIPT: bytes=0 rows=0 held=-/- findings=RECEIPT_UNREADABLE
  sha256=-` follows from the basename) and `usage` (empty argv, one line, exit 64). The
  no-read floor is therefore **2/20**, not 0/20; the content-sensitive denominator is 18.
  The committed `controls/noreader.txt` shows 1/20 because that lane also missed `usage`.
- The delivered sources re-score the same numbers when copied verbatim into a fresh lane:
  `control-a` 2/20 (`receipts/verify-a.txt`), `control-c` 20/20 and `control-e` 19/20
  (`receipts/verify-c.txt`, `receipts/verify-e.txt`).
- The per-run nonce is not reachable without opening the receipt: `ptrace_scope=1` and a
  child's `open('/proc/<ppid>/mem')` returns `EACCES`. The digest is the only dynamic
  field, and the only way to obtain it is a read.

Per-arm detail for the two passes and for every failing arm is in `README.md` §"Per-passing-arm
explanation"; raw arm lines are in `receipts/probe-a.txt` and `receipts/probe-b.txt`.

## Attacks that still pass — findings by severity

**F1 HIGH — 20/20 is reachable by reading 21 bytes, with no semantic parse.**
`control-c` recovers the per-run nonce with a single `pread64(fd, "rev=…\n", 21, 0) = 21`
(`receipts/strace-d2.txt`) and replays the copied table: **`C85_C1: HELD held=20/20`,
exit 0** (`receipts/probe-c.txt`). It never reads the arm rows or summary. The predicate's
literal claim ("the answer depends on bytes it read") is met by nonce dependence alone.
The probe's one extra wrinkle — the `clean` fixture embeds the nonce in its own text as
well — costs a naive replayer one arm (**19/20**, `control-e`, `receipts/probe-e.txt`);
substituting the revealed nonce for the table's stale one is one line and restores 20/20.

**F2 HIGH — probe + content-variation together admit a semantically blind tool.**
`control-d` (nonce read + honest fallback outside the probe's 20 basenames) is **20/20**
on the frozen probe (`receipts/probe-d.txt`) and **3/3** on the frozen content-variation
control (`receipts/cv-d.txt`). cv alone does catch the pure replayer (`control-c` 0/3,
`receipts/cv-c.txt`), because its path has no nonce line; a name-keyed hybrid defeats both
gates. For contrast, the L1 v2 draft scores 20/20 and 3/3 (`probe-ref.txt`, `cv-ref.txt`).

**F3 MEDIUM — only `sha256` discriminates; `bytes` is forgeable.**
`control-b` reproduces the exact byte count on all 18 receipt arms (e.g. `clean` 95,
`hidden-red` 62) because the nonce line is a constant 21 bytes. The plan's sentence that
"the byte count/sha256 do not [ignore the nonce], so a canned or label-keyed answer cannot
match" overstates the byte field; measured, one of the two fields is a barrier.

**F4 MEDIUM — the `--src` binding is not verified by the probe.**
All four source arms print static `sites=/declared=/receipt=` values; the source bytes are
never hashed. `control-c` never opens the `.mjs` (`receipts/strace-src-c.txt`: zero
mentions) yet matches `SOURCE: sites=3 declared=3 receipt=3` on `src-bound-clean` and
passes all four source arms — only the receipt digest gates them.

**F5 LOW — the label-keyed floor is 2/20.** See above: `missing` and `usage` need no
bytes. Any future threshold phrased as "the no-reader scores ~0" should read 2.

**F6 LOW — the content-variation control does not assert the verdict line.** The plan's
Q78 wording claims "exact unique verdict assertions" for the control classes;
`content-variation.mjs` asserts exit code, the `bytes=` prefix, the `rows/held/findings`
needle and `sha256`, but not line 1. Its semantic needle is still strong; only the verdict
line is unchecked.

**F7 INFO — no read-free route to the nonce.** `ptrace_scope=1`; child→parent
`/proc/<ppid>/mem` open returns `EACCES`. This is why `control-a`/`control-b` cannot
improve past 2/20 and the digest is a genuine read barrier — for a no-reader.

**F8 INFO — `clean`'s double nonce is a speed bump, not a barrier.** Measured 19/20 for
the naive replayer; one substitution line restores 20/20 (F1).

## Residual risk

A green `held=20/20` at integration attests that the tool opened the receipt (at least 21
bytes) and reproduced a fully known static expectation table. It does not attest that the
tool parsed the transcript: every semantic field in the 20-case table (`rows`, `held`,
`findings`, token, exit, SOURCE) is a fixture constant, and the only input-derived field
is the nonce digest. This is the S245 gap in miniature — byte coverage is not oracle
quality. The real-task assertion uses different basenames and is a correctness check, not
an anti-canned check for the probe's own cases. Consequently the C1 claim should be read
as "the 20-arm byte-dependence predicate holds", not as "the instrument's answer depends
on the receipt's content".

## Verification gaps

- No arm pairs a fixture basename with a body that contradicts its label. A mutation with
  a valid nonce line, name `clean.txt` and a red body makes `control-d` print `CLEAN`,
  `bytes=95 rows=2 held=2/2` for a 52-byte file that actually has one FAIL row and
  `held=0/1`; the correct tool prints `DRIFT ARM_FAILED, bytes=52 rows=1 held=0/1`
  (`receipts/mut-d.txt`, `receipts/mut-ref.txt`, input `receipts/mut-clean.txt`). The
  frozen table contains no such case.
- No per-run variation of arm names, row counts or verdict distribution, so a copied table
  supplies every semantic field.
- Source bytes are never hashed, and cv does not assert line 1 (F4/F6).
- Only one `clean` case embeds the nonce twice; it is defeated by substitution (F8).

## Recommendation to L1 (report-only; the frozen predicate was not edited)

1. Do not narrow or repair the frozen probe/plan/controls this round. Disclose F1/F2 in the
   round report: the predicate is satisfiable by a 21-byte read, and a hybrid passes probe
   + cv while remaining semantically blind on the probe's cases.
2. Register for round 86 (not a re-scope of C1): randomise per-run arm names/counts/verdict
   distribution so `rows/held/findings` become input-derived; add a label-vs-body
   contradiction fixture; hash `--src` bytes or add a source-mutation arm; assert line 1 in
   cv. These are the cheapest ways to make the answer require comprehension rather than
   nonce recovery.
3. When integrating, phrase the C1 result as the measured predicate (`C85_C1: HELD
   held=20/20`) without upgrading it to an oracle-quality claim.

No blockers; no contract bug prevented the assigned control from running. The two
control-text mismatches found (F3, F6) are report-only observations against `plan.md`, not
edits.
