# K91CriticA — C1 falsification scorecard (kumitate round 91, hyaku 15, attempt 1)

Frozen predicate (each tool scored 3×; verdict line and exit identical every run):

```
node /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-91/probe/probe91-c1.mjs \
  --lane /home/vgpnk/Projects/shokunin/kumitate-shokunin \
  --work /fast/scratch/hyaku/kumitate-r91/K91CriticA/pN \
  --alt /fast/scratch/hyaku \
  --rev 2b1b8bf3d274db8e608035bffb27bd3b3d4009d4 \
  --tool <tool>
```

Probe sha256 verified before use:
`3bd88e8efe4bb0851b5ef57c90e80792eada34cd0f2450922d75fbe9fc313f4c`.
Filed receipts (run 3, full output, tool named in header): `receipts/p0..p4-*.txt`;
runs 1–2 were observed in-session with the same `C91_C1: HELD held=56/56` / exit 0.

## Table

| construction | sha256 | probe score | in-class reproduction (declared class) |
|---|---|---|---|
| ref-fd-fstat (positive control, sanity) | `bc3df527ec224f2f5542d4c42f5583920503e433b5f39734a7be4db626a894db` | HELD 56/56 | none — right verdict on every fixture built, incl. all repro inputs below |
| cand-extsh-gate | `2c7974276ff2eec7503d510cfb804ab2028a5c7f8b5893dde40644c5e5460850` | HELD 56/56 ×3 | **KILL ×2** — `repro/extsh-gate-fifo` @ commit `9a40cc295bf982f9e55b0d9268a939001bb1e008`: external FIFO `pipe.bin` (no `.sh` suffix) → blocking open, NO verdict, exit 124 at the bound; control `FAIL-CLOSED UNRESOLVED` exit 2. `repro/extsh-gate-overcap` @ `7b4b5542c9721f9c39880edb027b538184c34f67`: external regular file 16781312 B with correct digest → `CLEAN matched=1 external=1` exit 0; control refuses exit 2 |
| cand-capwindow | `cdacfa5d7d73696e346dfb8d7cb9aece3a9bfa902ac122ad1d438f59c238fed1` | HELD 56/56 ×3 | **KILL** — `repro/capwindow` @ `41abf2d30e113db4396744436a1a821d74bd5000`: cap check fires only at the probed size 16777217; external regular 16781312 B → `CLEAN` exit 0 (bound); control `UNRESOLVED` exit 2 |
| cand-dirhash | `c7fb60f5792bbd23a859038340c064d4ce5cec98ac67e524a17579f67348278d` | HELD 56/56 ×3 | **KILL** — `repro/dirhash` @ `b82af77770dc11eb9847ee75d66318d4e95df084`: external NON-empty directory `bundle.sh` → `CLEAN matched=1 external=1` exit 0 (binds the directory as its sorted-listing digest); the probed `ext-dir` fixture (A48) is an EMPTY directory and is refused, so the arm passes while the class is broken |
| cand-shy-strip | `282e086b55f762d78b1c31b63451a4cbb46c9dca21da0a5d3fc1b36bd6f26b91` | HELD 56/56 ×3 | no in-class kill — `repro/shy-strip` @ `6c6dbe3dc10dc1c90a311d3ee975469cec980fa9` shows a WRONG verdict (`CLEAN matched=1 external=0` on a receipt naming `scripts/receipt<U+00AD>-bind.mjs`; control `UNRESOLVED`), but "new invisible code-point classes" are ROUTED per plan.md → **reported out-of-class** |
| (routed demo) cand-extsh-gate | (same sha as above) | — | **ROUTED** — `repro/extsh-gate-devalias` @ `46027256cdccd827253770ab31e25baeb76836f7`: `bash /proc/self/root/dev/zero` takes the v4 fallback (no lexical `/dev/` prefix) → unbounded read → V8 OOM abort under `prlimit --as=2147483648`, exit 133, no verdict (round-90 sentinel A4 mode); control refuses exit 2. Char device via non-`/dev/` spelling is in plan's NOT-claimed list → routed defect, not a kill |

Every reproduction emits the receipt with the probe's own shape (`rev=` / `tool_sha256=` / `cmd=`
lines, `printf` in `run-repro.sh`), names the input, and re-runs both the candidate and the
positive control on it (`sh run-repro.sh` inside the repo; recorded output in `OUT.txt`).

## Honest coverage statement

- What the probe arms: every declared RD-2 kind has an arm — A44 `ext-zero`, A45 `ext-null`,
  A46 `ext-empty-twin`, A47 `ext-fifo`, A48 `ext-dir`, A49 `ext-overcap` (16777217 sparse),
  A50 `ext-atcap` (16777216), A51/A52 mid-token U+200B and its twin — plus the 47 carried v4
  arms, each scored in contexts A and B.
- What the arms leak: every RD-2 external fixture is spelled `*.sh` or `/dev/*`; the over-cap
  fixture is always exactly 16777217 B; the `ext-dir` fixture is always empty. All three kills
  exploit exactly those tokens (suffix gate, exact-size window, empty-dir case split). The
  broken inputs remain inside the declared classes (any FIFO, any over-cap regular file, any
  directory), so each is a kill-rule (d) hit, not a routed finding.
- Not breakable while 56/56 (tried and reasoned): empty regular external and at-cap regular
  (A46/A50 force bind, which IS the correct verdict — no wrong verdict exists in-class);
  the U+200B mid-token (A51+A52 pin both sides); the carried v4 arm shapes (a wrong verdict on
  the same shape is by definition a failing arm); fixture contexts (both are run per arm).
- Verdict on C1 itself: the claimed behaviour — descriptor-open + fstat discipline with no
  shape key (ref-fd-fstat) — was NOT falsified: the positive control returned the right verdict
  on every declared-class reproduction input. The kills show that `held=56/56` alone does not
  establish the claimed behaviour; the integrated v5 must be checked for shape-keyed gating.

Transparency: the first build of cand-extsh-gate (sha `781fd0f9…`) was a builder splice bug
(duplicated `external += 1;`), scored 51/56, and was discarded; the scored file is the fixed
build. `cand/v4-base.mjs` is the unmodified v4 reference
(`35f4f25e6130dd827747ceff8ced80682d96c6c04d9516f2a463ce58cc7c1fce`), kept for diffing only.
No lane file was written; scratch `/fast/scratch/hyaku/kumitate-r91/K91CriticA` was removed.
