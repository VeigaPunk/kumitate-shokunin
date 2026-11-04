# K85Cheat — C1 `counter-receipt` v2 anti-cheat control (round 85)

Seat `K85Cheat`, lane `kumitate-shokunin`, frozen revision
`9db0c6b5eb9111cfc5581006ba976ca2cd112792`. This subtree is reviewer evidence, not a
repair: no production file, no frozen plan/probe/control and no other seat's file was
modified. Nothing was installed; no git/jj operation was run.

Scratch root at run time: `/fast/scratch/hyaku/kumitate-r85/K85Cheat` (deleted after
packing). Every run below measured that revision; `receipts/MANIFEST.md` names each
receipt's command, exit code, revision and sha256.

## The control

The frozen probe prepends `rev=` + 16 hex + `\n` (21 bytes) to every fixture receipt and
derives `RECEIPT: bytes=… rows=… held=… findings=… sha256=…` from the actual body. The
control copies the probe's own fixture values and tries to answer without reading.

The table is **extracted, not transcribed**: `gen.mjs` slices the probe source from
`const good` to `let held = 0;`, evaluates that slice in a `vm` with the real
`crypto`/`process`, and renders the table into each lane (`fixtures.json` holds the result:
20 cases, 18 with a receipt body, 2 without). Rendered sources are self-contained.

| source | behaviour |
|---|---|
| `control-a.mjs` | **Assigned control.** Keys on the `--receipt` basename; prints the probe's expected verdict line and all `RECEIPT` fields; `bytes`/`sha256` from the nonce-less fixture body. Never opens the receipt (strace: zero mentions of the path). |
| `control-b.mjs` | `control-a` plus the constant 21-byte nonce line in `bytes`. Isolates the digest as the only remaining difference. |
| `control-c.mjs` | Reads exactly the first 21 bytes (`pread64(fd, "rev=…\n", 21, 0) = 21`) to recover the per-run nonce, then replays the label table. Semantic body unread. |
| `control-d.mjs` | `control-c` plus an honest fallback for paths outside the probe's 20 basenames. |
| `control-e.mjs` | `control-c` without the `clean` nonce substitution (naive replayer). |

`probe85-c1-instrumented.mjs` is a copy of the frozen probe with `PROBE_NONCE`/`WANT2`
logging only; it produced no score. Every score receipt comes from the frozen
probe or `controls/content-variation.mjs` unmodified.

## Scores (frozen probe, frozen content-variation control)

| lane | probe | exit | cv | exit | receipt |
|---|---|---:|---|---:|---|
| `control-a` | `UNMET held=2/20` | 1 | 0/3 | 1 | `receipts/probe-a.txt`, `cv-a.txt` |
| `control-b` | `UNMET held=2/20` | 1 | 0/3 | 1 | `receipts/probe-b.txt`, `cv-b.txt` |
| `control-e` | `UNMET held=19/20` | 1 | — | — | `receipts/probe-e.txt` |
| `control-c` | `HELD held=20/20` | 0 | 0/3 | 1 | `receipts/probe-c.txt`, `cv-c.txt` |
| `control-d` | `HELD held=20/20` | 0 | 3/3 | 0 | `receipts/probe-d.txt`, `cv-d.txt` |
| L1 v2 draft (contrast) | `HELD held=20/20` | 0 | 3/3 | 0 | `receipts/probe-ref.txt`, `cv-ref.txt` |

Regenerating the lanes from the durable `gen.mjs` reproduces the two defining scores —
`control-a` 2/20 and `control-c` 20/20 (`receipts/regen-probe-a.txt`,
`receipts/regen-probe-c.txt`, generator output `receipts/gen-durable.txt`). The delivered
sources themselves were copied verbatim into fresh lanes and re-scored: 2/20
(`receipts/verify-a.txt`), 20/20 (`receipts/verify-c.txt`), 19/20
(`receipts/verify-e.txt`).

## Per-passing-arm explanation — `control-a` (assigned), 2/20

- `missing` — the probe writes no file for this arm and expects
  `RECEIPT: bytes=0 rows=0 held=-/- findings=RECEIPT_UNREADABLE sha256=-`. Every value is
  fixed by the basename and the absent-file class; there are no bytes to read.
- `usage` — argv is empty and the arm expects one line `COUNTER_RECEIPT: USAGE` and exit
  64. No receipt is involved.

All other 18 arms carry a receipt and fail. `control-b` isolates the reason: `analyze.txt`
reports **18 failing arms whose only differing field is `sha256`** (`bytes`, `rows`,
`held`, `findings`, the verdict line and the SOURCE line all match). `control-a` fails the
same 18 on `bytes`+`sha256`; its `bytes` is short by exactly 21 because it does not know
the nonce line.

## Per-passing-arm explanation — `control-c` / `control-d`, 20/20

- 18 receipt arms: first line, exit, `rows`, `held`, `findings` come from the extracted
  table; `bytes = 21 + byteLength(text)`; `sha256 = sha256(nonce + "\n" + text)` with the
  revealed nonce. For `clean`, whose fixture text embeds a nonce of its own, the
  extraction-time nonce is substituted by the revealed one (`control-e` shows the naive
  version scoring 19/20, failing only `clean`). The semantic body is never parsed.
- 4 `--src` arms: the `SOURCE:` line is a table constant. `strace-src-c.txt` shows the
  `.mjs` is never opened while the line matches the reference byte-for-byte.
- `missing`, `usage`: as above.

## Findings (severity ordered)

1. **HIGH — 20/20 by reading 21 bytes, no semantics.** `control-c` is HELD at 20/20 while
   `strace-d2.txt` records exactly one `pread64(…, 21, 0)` on the receipt and no body
   read. The claim "the answer depends on bytes it read" is literally satisfied by the
   nonce, not by transcript comprehension.
2. **HIGH — probe + content-variation together admit a semantically blind tool.**
   `control-d` is 20/20 on the probe and 3/3 on cv. cv alone catches the pure replayer
   (`control-c` 0/3, because its path has no nonce line); a name-keyed hybrid with an
   honest fallback defeats both gates.
3. **MEDIUM — only `sha256` discriminates.** `control-b` matches `bytes`, `rows`, `held`,
   `findings` and the verdict line on all 18 receipt arms; the byte count is a constant
   +21 offset from a known fixture length. The plan's sentence treats "byte count/sha256"
   as one barrier; measured, the byte count is forgeable and only the digest is not.
4. **MEDIUM — SOURCE is not input-derived.** All four `--src` arms print static
   `sites=/declared=/receipt=` values; the source bytes are never hashed. A lane that
   never reads `--src` passes them (measured, `strace-src-c.txt`).
5. **LOW — the no-read floor is 2/20, not 0.** `missing` and `usage` are label-passable;
   the content-sensitive denominator is 18. The committed `noreader.txt` scored 1/20
   because it also missed `usage`; `control-a` shows the class's real ceiling.
6. **LOW — cv does not assert the verdict line.** The plan's Q78 wording says controls
   carry "exact unique verdict assertions"; `content-variation.mjs` asserts exit code,
   `bytes` prefix, `rows/held/findings` needle and `sha256`, but never line 1.
7. **INFO — no read-free channel to the nonce.** `ptrace_scope=1` and a child's
   `open('/proc/<ppid>/mem')` returns `EACCES`; the nonce is obtainable only by opening
   the receipt (measured, and consistent with the 2/20 no-read score).
8. **INFO — the `clean` double nonce is a speed bump, not a barrier.** `control-e`
   (naive replayer) is 19/20; substituting the revealed nonce for the table's stale one
   is one line and restores 20/20.

## Residual risk and recommendations (report-only; round-86 registration)

The C1 predicate measures **byte dependence**, not oracle quality. A green `held=20/20`
means the tool opened the receipt (at least 21 bytes) and reproduced an exactly known
static table; it does not mean the tool parsed the transcript. This is the same gap the
plan cites from S245: executed coverage is not oracle quality.

If a future round wants the probe to force comprehension, the cheapest changes are:
randomise per-run arm names, row counts and verdict distributions so `rows`/`held`/
`findings` become input-derived; add one fixture whose visible label contradicts its body
(a name-keyed answer then contradicts the file's own bytes); hash the `--src` bytes or add
a source-content mutation arm; assert line 1 in the content-variation control. None of
these is a change to the frozen round-85 predicate, which was not edited.

## Reproduction

```sh
node gen.mjs [OUTDIR]                         # extract fixtures, render lane-{a,b,c,d,e}
node <wave>/probe/probe85-c1.mjs --lane OUTDIR/lane-a --work <scratch>/work-a
node <wave>/controls/content-variation.mjs --lane OUTDIR/lane-d --work <scratch>/cv-d
node analyze.mjs                              # field-level diff table
```

`gen.mjs` writes into `OUTDIR` (default `regen/` beside the script) and never overwrites
the measured `control-*.mjs`, `fixtures.json` or `receipts/` in this directory. The
contrast lane needs L1's v2 draft; if it is absent, `gen.mjs` reports it and continues.
Because extraction runs a fresh nonce, a regenerated `control-a`/`control-b` changes only
the `clean` fixture's stale nonce (their behaviour and scores are unchanged), while
`control-c`/`control-d` remain correct because they substitute the revealed nonce — the
reproduction receipts above are from exactly that path.
