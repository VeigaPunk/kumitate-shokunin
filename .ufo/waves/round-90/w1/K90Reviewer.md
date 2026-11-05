# K90Reviewer.w1 — kill-rule attack on C1, probe90-c1.mjs (result: KILL RULE FIRES)

**Probe:** frozen `/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-90/probe/probe90-c1.mjs`.
Read-only on the lane respected; the only writes under the lane are below `.ufo/waves/round-90/K90Reviewer/`.

## What was run (every claim names the command)

Base instrument extracted: `git -C /home/vgpnk/Projects/shokunin/kumitate-shokunin show 7218699cfbdec702ba42f35ceac0a8e52d1bd564:scripts/receipt-bind.mjs > K90Reviewer/base-v3.mjs` → sha256 `37201ad0c6acd4c51b8804fa66ac9606469a181891dbed1d5ee46c56176e1bb3` (matches the round context line; v3 baseline reproduced `C90_C1: UNMET held=39/47` exit 1, failing exactly the plan's K89-V1 arms).

Each candidate scored with:
`TMPDIR=/fast/scratch/hyaku/kumitate-r90/K90Reviewer node …/probe90-c1.mjs --lane /home/vgpnk/Projects/shokunin/kumitate-shokunin --work <scratch>/wN --rev 7218699cfbdec702ba42f35ceac0a8e52d1bd564 --tool <candidate>`
raw outputs: `.ufo/waves/round-90/K90Reviewer/out-cand{1,2,3}.txt`; verdicts also in `K90Reviewer/scores.txt`.

| candidate | change vs v3 (single edit, only the copy edited) | verdict | exit |
|---|---|---|---|
| `cand-1-global-strip.mjs` (sha256 `f2ebdcd5…cc4520f0`) | delete EVERY U+FEFF/U+200B/U+200C/U+200D/U+200E/U+00A0 code point from the WHOLE receipt text before parsing | **C90_C1: HELD held=47/47** | **0** |
| `cand-2-cmdrev-only.mjs` (sha256 `7733bd28…4766174`) | prefix tolerance only when the receipt is (partially) prefixed; unprefixed duplicate key → UNCHECKED instead of AMBIGUOUS_FIELD; selftest short-circuits to `PASS held=68/68` | C90_C1: UNMET held=39/47 | 1 |
| `cand-3-single-gated.mjs` (sha256 `a47ff12f…c989238`) | strip prefixes from field lines only when NO unprefixed field line exists (single-* shape gate) | C90_C1: UNMET held=41/47 | 1 |

## KILL RULE FIRES (C1 UNMET unless the scorer changes)

**Candidate 1 reaches 47/47 and does NOT do the claimed behaviour.**
The claimed v4 behaviour (plan §C1, K89-V1) is *field-line-scoped* recognition: "field lines are
recognized after stripping a bounded set of leading invisible prefixes … so a prefixed duplicate
… line is AMBIGUOUS_FIELD while an all-prefixed receipt still parses". Candidate 1 contains no
field-line logic whatsoever; it applies a blind character-class delete to the entire text and the
probe's 8 K89-V1 arms (`dup-feff`…`dup-nbsp`, `single-zwsp`, `single-nbsp`) all pass as a side
effect. Evidence: `out-cand1.txt` — every dup-* arm `exit=2 … AMBIGUOUS_FIELD r.txt carries 2 cmd= lines`, `C90_C1: HELD held=47/47`.

Why no existing arm catches it: every dup-arm fixture contains the invisible char ONLY as a
prefix of a second field line, and every single-* fixture uses it only as field-line prefixes and
expects CLEAN. No arm places an invisible code point (a) mid-token inside the `cmd=` instrument
path, or (b) anywhere outside field lines (e.g. inside the `OK <nonce>` line or a value). Under
v4-correct behaviour such a receipt must still fail against a differing name; under candidate 1
the whole text is silently rewritten.

## Step-4 reproduction (concrete: mid-token prefix char inside the instrument token)

Fixture (committed under the seat dir, `K90Reviewer/step4/`):
- repo `step4/repo-with-blob` (clone-able; commit `0407d977cd434547264a2d998879704fc874a4a4`),
  single file `scripts/legit.mjs`, blob `21de50b49983f788c2b2aa8fa6a54b112dde3d84`, sha256 `f6e12909cb0f1f0411723136ff43c7a1af52fd438901e9c0f0915b536905f031`.
- receipt `step4/rep/r.txt` (sha256 `f401a4da25f000c320fb9278b0ba4cbdb86485ad8e24ce1a1982590f6c19e24e`):
  `rev=0407d97…  tool_sha256=f6e129…  cmd=node scripts/legit\u200B.mjs --selftest` — the U+200B
  sits INSIDE the instrument token, mid-token (od dump in scores.txt).

Run from the archived fixture:
`node <tool> --dir K90Reviewer/step4/rep --rev 0407d977… --lane K90Reviewer/step4/repo-with-blob`

| tool | verdict |
|---|---|
| base-v3 | `RECEIPT_BIND: FAIL-CLOSED UNRESOLVED r.txt instrument absent at 0407d97…: scripts/legit​.mjs` exit 2 (correct: the reference name does not exist) |
| cand-1-global-strip | `RECEIPT_BIND: CLEAN matched=1 mismatched=0 unchecked=0 external=0` exit 0 (**WRONG**) |
| cand-2 / cand-3 | same UNRESOLVED as v3 (they are line-anchored; the token is untouched) |

Interpretation: the 47/47 tool rewrites the instrument token `scripts/legit\u200B.mjs` →
`scripts/legit.mjs` and declares CLEAN although the receipt's cmd= names a file that does not
exist in the cited revision. Generalized: any receipt pointing at `scripts/<X>\u200B.mjs` where
`scripts/X.mjs` exists binds to the WRONG instrument — receipt identity laundering through the
same one-line delete that the dup-/single- arms reward.

## What a new arm needs (kill candidate 1; no probe edits proposed, report only)

Receipt shape: an otherwise clean at-rev receipt whose `cmd=` instrument token carries an
invisible prefix character in the MIDDLE of the final path component (e.g.
`node scripts/tool-<nonce>\u200B.mjs --run`, where the committed instrument at the rev is
`scripts/tool-<nonce>.mjs`), with a matching `tool_sha256=` of the real blob.
Expected verdict (v4 semantics): NOT CLEAN — `UNRESOLVED` (or `ESCAPES_LANE`/`AMBIGUOUS_FIELD`
per the boundary text chosen); the twin the same arm must not catch: the IDENTICAL receipt
without the mid-token char binds CLEAN at the same rev. Also sufficient: an invisible char in a
non-field region (e.g. inside the `OK <nonce>` tail line) — global-strip deletes that byte too, a
field-line-scoped v4 leaves the token and the tail intact; alternatively a raw byte count
(`receipt size` vs `sum of field content matches`) to catch any whole-text rewrite.
A sub-shape that also kills candidate 3 in the same arm: keep the receipt ALL-PREFIXED (so cand 3
engages its strip) but make the instrument token itself `scripts/\u200Btool-<nonce>.mjs` — after
any prefix-strip the name resolves to a file that never existed.
