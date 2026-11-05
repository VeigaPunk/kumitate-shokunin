# K91Reviewer — scoped findings (C1 probe & positive-control review)

REV `0bff4babeec90dd57ea36efeaa94b66db9af381d` · probe `3bd88e8e…3f4c` & ref control `bc3df527…94db` sha-verified · all runs used the frozen predicate at that REV.

## Controls re-run (assignment Step 3)
- Stock v4 do-nothing: `C91_C1: UNMET held=52/56` exit 1 — receipt `../K91Reviewer/p-noret.txt` (seat dir). Fails exactly ext-zero, ext-null, ext-fifo, ext-overcap, matching committed `controls/table.txt`.
- Positive control ref-fd-fstat: `C91_C1: HELD held=56/56` exit 0 — receipt `../K91Reviewer/p-pos.txt`.

## Findings (severity → label → evidence)
- **F1 [LOW, out-of-class/routed]** No arm names an external instrument whose leaf is a symlink, so a candidate may silently drop the v3/v4 external-symlink refusal and still reach 56/56 (`ctl-fd-fstat-nolstat.mjs`, receipt `../K91Reviewer/sc-fd-fstat-nolstat.txt`: HELD; diff vs ref control `../K91Reviewer/d-nolstat-vs-ref.txt`). Integration must keep the ref control's lstat-symlink check verbatim; probe cannot see its absence. Not a declared class → routed, not a kill.
- **F2 [INFO, probe-fact]** `--ctx` IS visible to a candidate via `/proc/<ppid>/cmdline` on this host; plan.md's "(it cannot see it)" is wrong as stated. Scoring unaffected: the live cheat (`ctx-ast-pass.mjs`) mis-answers ctx B and scores `UNMET held=2/56` (receipt `../K91Reviewer/sc-ctx-ast-pass.txt`) because verdicts are arm-invariant and merged A∧B.
- **F3 [INFO]** fd-on-throw: a fd/fstat read block without `finally { closeSync }` still scores HELD 56/56 (`ctl-fd-fstat-nolstat.mjs`); the committed ref control closes in `finally`. Keep the ref shape in v5 integration — code-review item only.
- **F4 [INFO, verification]** Bounds are live on this host: kill at 20 s → `status=null`, no verdict, arm FAIL (`p-noret.txt` ext-zero/ext-fifo `bound=OUT exit=null`); `prlimit --as=2 GiB` bites (allocation test → RangeError). No false green/red across 9 probe runs. `bound=` is red-only (can't fake green).

## Shortcut decomposition — every declared class is load-bearing (receipts in seat dir `../K91Reviewer/sc-*.txt`)
- type-check only (no cap) → 55/56, fails ext-overcap only.
- cap only (no type) → 53/56, fails ext-zero/null/fifo.
- refuse-empty variant → 55/56, fails ext-empty-twin only.
- cap `>=` edge variant → 55/56, fails ext-atcap only.
- refuse-read shim → 44/56, refuse-profile collapse incl. INTERNAL crash (clean refuse-profile is the committed refuse-external control at 49/56).
- fd protocol (the claimed edit) → HELD 56/56. Nothing shortcut reaches 56/56; kill rule does not fire on any reviewed tool.

**Verdict: no in-class hole found in the frozen probe or positive control; F1 routed; C1 review clean.**
