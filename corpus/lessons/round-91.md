# kumitate round 91 — lesson (receipt-bind v5, bounded external reads, attempt 1)

Frozen at `2b1b8bf3d274db8e608035bffb27bd3b3d4009d4` (plan, 56-arm two-context probe `probe91-c1.mjs`,
14 pre-data controls incl. the positive control); wave spec + dispatch at
`2df92d8db51e17209658d946854b645560f0391b`. Wave `.ufo/waves/round-91/w1` (12 seats: 2 executor,
2 scribe, scout, connector, sentinel, 2 reviewer, 2 critic, mutation-tester). Claim C1 operability,
capability acquisition `receipt-bind` v5: **UNMET** (frozen kill rule (d) fired).

## Gate

Candidates considered and their verdict:

- **Admitted — `scripts/receipt-bind.mjs` v5** (bounded external reads). The executor's candidate
  (`.ufo/waves/round-91/K91ExecInst/receipt-bind-v5.mjs`, sha256 `33ee29eb…3013d`: descriptor open
  `O_RDONLY|O_NOFOLLOW|O_NONBLOCK`, `fstat`, non-regular or `st_size` > 16777216 refused, receipt open
  `O_NONBLOCK`, 7 selftest arms) plus one L1 integration edit grounded in two seats: the read is
  bounded by bytes read, not only by `st_size` (K91ReviewProc `hypothesis.md`: `/proc/self/pagemap`
  aborts with no verdict, `/proc/<pid>/smaps` binds 35 MiB; K91Sentinel `attacks.md`: `/proc/kallsyms`
  22489015 bytes binds CLEAN on the positive control). Integrated sha256 `f39aab5c…6cc5e1`, selftest
  84/84 (the 84th arm is `external-pseudo-file-unbounded`). Admitted as instrument quality; it is
  not the capability (the kill rule holds, below).
- **Admitted — QUALITY Q84** (two-context scorer; generalises round-90 M3) and **Q85** (declared
  classes sampled by randomized members; this round's M7). Each carries a shown-able-to-fail
  receipt (Q84: `controls/ctl-r90-*-gated+ref.txt`, eight `FAIL A=PASS B=FAIL` arms; Q85:
  `close-l1/class-sampler.txt`, the three 56/56 constructions UNMET on both runs).
- **Admitted — knowledge `receipt-bounded-external-reads.md`**, citing S263 (fifo(7)), S264
  (open(2)) and S265 (Node.js `fs`), all opened this round (seat K91ScribeSources captures + the
  L1's own `grep -F` re-check below).
- **Rejected — the scribe draft's claim that `fstat` deciding type and size "on the opened object"
  makes the decision and the read see the same bytes for every regular file.** Reason: a procfs
  regular file reports `st_size` 0 (K91ReviewProc), so the `fstat` size is not the read size. Flip:
  none; the integrated read bound replaces the reasoning.
- **Rejected — the positive control `controls/ref-fd-fstat.mjs` as the shipping design.** It is the
  frozen claim edit and stays frozen, but it binds `/proc/kallsyms` CLEAN past the cap
  (`K91Sentinel/receipts/R1.kallsyms.ref.rep1.txt`). Flip: none.
- **Routed (out of class per the frozen plan), not admitted, not kills:** K91Reviewer F1 (no arm
  names an external symlink leaf), F2 (`--ctx` visible through `/proc/<ppid>/cmdline`; harmless:
  `ctx-ast-pass` scores 2/56), CriticA `cand-shy-strip` (U+00AD mid-token strip — a new code-point
  class), CriticA `extsh-gate-devalias` (`/proc/self/root/dev/zero` through a v4 fallback), the
  mutation survivors m02/m07/m08/m10/m11 (equivalent on the suite; TOCTOU/fd hygiene).

Spot-check result: **to be recorded by the non-author verifier.** Samples offered: admitted Q85
(with its sampler receipt), the S263 row; rejected `ref-fd-fstat` as shipping design.

### Sources opened this round (CORPUS.md rule 1)

Opened by the L1 on 2026-11-05 with `curl -sSL` into `.ufo/waves/round-91/close-l1/sources/`
(byte-identical to seat K91ScribeSources' captures: same sha256), quotes located with `grep -n` on
the tag-stripped text (`close-l1/sources/quote-locations.txt`):

- **S263** fifo(7), https://man7.org/linux/man-pages/man7/fifo.7.html, accessed 2026-11-05, sha256
  `9c9bbe32…500749f`: "opening for read-only succeeds even if no one has opened on the write
  side yet" (fifo.7.txt line 88, the nonblocking-mode paragraph).
- **S264** open(2), https://man7.org/linux/man-pages/man2/open.2.html, accessed 2026-11-05, sha256
  `d665489c…8491c789`: "Neither the open() nor any subsequent I/O operations on the file descriptor
  which is returned will cause the calling process to wait" (open.2.txt line 366); "If the trailing
  component (i.e., basename) of path is a symbolic link, then the open fails" (line 349).
- **S265** Node.js v24 fs, https://nodejs.org/docs/latest-v24.x/api/fs.html (docs v24.22.2),
  accessed 2026-11-05, sha256 `c175e0e7…c5c29d50`: "Retrieves the <fs.Stats> for the file
  descriptor." (fs.txt line 6729); "Flag indicating to open the file in nonblocking mode when
  possible." (line 9080).
- Rows added: 3, tier A, status `mined`, each `used-by` `corpus/knowledge/receipt-bounded-external-reads.md`.
  Rows touched: none (S260 and S255 receive append-only corrections in their knowledge entries, not
  cell edits: S260 verbatim quote; S255 location line 70 → 75). Rejected: none this round.
- Sibling rows considered and not reused (connector `w1/K91Connector.md`): souji S062/S241 (fifo(7))
  and chousa S134 (open(2)) live in sibling registries; this lane cites its own opened rows.

## Kill rule (frozen) — fired

Kill clause (d) of `.ufo/waves/round-91/plan.md`: a tool at 56/56 with a committed reproduction of
a wrong verdict on an input of a declared class. Three seat constructions
(`.ufo/waves/round-91/K91CriticA/scores.md`), each 56/56 on the frozen probe three times:

1. `cand-extsh-gate` (descriptor discipline only for `/dev/*` or `*.sh` tokens) — external FIFO
   `pipe.bin`: no verdict, exit 124 (declared class: external FIFO); over-cap regular without `.sh`:
   CLEAN (declared class: external regular over the cap).
2. `cand-capwindow` (refuses only size 16777217) — 16781312-byte external regular with its
   correct digest: CLEAN.
3. `cand-dirhash` (refuses only an empty external directory) — non-empty directory: CLEAN
   `external=1`.

The L1 re-ran three reproductions and one 56/56 score independently
(`.ufo/waves/round-91/close-l1/l1-rerun-criticA-repros.txt`). The reproductions live as git
bundles beside their scripts (`K91CriticA/repro/*.bundle`, heads in `K91CriticA/repro-heads.txt`);
the seat's nested `.git` directories were converted so the lane commit carries no gitlinks.

Verdict: **C1 UNMET — rejected-honest-stop.** No capability row. The probe is frozen; the rule is
not narrowed. The integrated v5 is right on every reproduction input (positive-control column of
each `OUT.txt`; `close-l1/class-sampler.txt` v5 `HELD held=36/36` twice).

## Mistakes

| class | evidence pointer | captured-by | fix |
|---|---|---|---|
| M3 (mined from round 90) — the mandated scratch root carried the round token into every candidate-visible path, and the probe set `TMPDIR=<work>` for every call, so a construction gated on `/kumitate-r90/` or on the `TMPDIR`-ancestor relation scored 47/47 | `.ufo/waves/round-90/w1/K90CriticA.md` rows d, e; `corpus/lessons/round-90.md` M3 | none in round 90 (`K90ExecAudit` checked arm labels only) | probe91 contexts A/B (`probe91-c1.mjs` parent mode). Shown able to fail: `controls/ctl-r90-roundpath-gated+ref.txt` and `ctl-r90-tmpdir-gated+ref.txt` read `UNMET held=47/56` with eight `FAIL A=PASS B=FAIL` arms each. QUALITY Q84. |
| M6 (mined from round 90; K91ScribeLesson) — the round-90 close ran `round-gate --round 90` before the round's records existed, committed the red receipt, and the M5 fix text claimed otherwise | `.ufo/waves/round-90/close/round-gate.txt` (rev `82c9c7ef`, DRIFT 3 errors) vs `.ufo/waves/round-91/K91ExecCarry/round-gate-r90.txt` (CLEAN at the landed tree) | the round-90 spot-check §6.1 (routed, never mined) | round 91 writes its SCORECARD row, LOG line and `## Planned` pointer BEFORE the close battery, and the close receipt `close/round-gate.txt` is measured on that tree; the round-90 green receipt is committed as `close-l1/round-gate-r90.txt`. |
| M7 (this round) — a declared input class was armed with ONE fixture token (`*.sh`/`/dev/*` spellings, exactly 16777217 bytes, an empty directory), so three token-keyed constructions reached 56/56 while wrong on the same class one token away | `.ufo/waves/round-91/K91CriticA/scores.md`; `close-l1/l1-rerun-criticA-repros.txt` | none: Q82 forbids arm identity in paths, Q84 forbids shared ambient tokens; neither forbids a constant member token inside a class | `close-l1/class-sampler.mjs` draws ≥ 6 members per class per run (random name/extension, over-cap size in [16777217, 16777216+2^20], directory empty or populated). Shown able to fail: `close-l1/class-sampler.txt` — `cand-extsh-gate` 26/36 and 25/36, `cand-capwindow` 30/36 twice, `cand-dirhash` 31/36 and 34/36, base v4 24/36 twice; positive control and v5 `HELD held=36/36` twice. QUALITY Q85. Routed to round 92 as the counter for any re-claim. |

## Routed to round 92

- Re-claim `receipt-bind` v5 only under a counter that samples every declared class (Q85) and keeps
  the two contexts (Q84); include a procfs member (`/proc/self/pagemap`, `/proc/kallsyms`) in the
  over-cap class, since the shipped v5 bounds the read and the frozen positive control does not.
- K91Reviewer F1 (external symlink leaf arm), F2 (`--ctx` visibility; derive context from a
  non-argv channel or accept as harmless with the merged verdict).
- CriticA `cand-shy-strip` (U+00AD and the other Cf members outside the v4 set).
- Mutation survivors m02 (O_NOFOLLOW), m07 (read by path), m10 (stat by path): only a race arm or
  a pseudo-file member separates them; m08/m11 are hygiene.
- Connector adjacency: tabi `check-receipt-provenance.mjs:53` reads a receipt-supplied path with no
  type/size check (RD-2 class) — reported for tabi's lane, not edited here.
- RD-1 (worktree-symlink laundering), RD-5 (replace refs), A8 receipt-FIFO race (v5: 0/150 hangs on
  the candidate per K91Sentinel; not claimed).

## Operator note

None. No L0 question was filed this round.
