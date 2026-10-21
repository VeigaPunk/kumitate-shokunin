EXEC r7-sections done sections=5 anchors=42 row-adv=0

# ExecR7Sections — R7 member sections in corpus/knowledge/local-ship.md

Pin: `31c465f15669f744848bd9f5d56191c5085670f7` (`git -C /fast/scratch/kumitate-r36/src rev-parse HEAD`, read-only clone).
Base: `0614092e0804aaca06642cb3a263a05c1cacc98e`. Scratch clone:
`/fast/scratch/kumitate-r36/w/KumitateR36.ExecR7Sections/lane` (branch `r36-execr7sections`).
Patch: `/fast/scratch/kumitate-r36/w/KumitateR36.ExecR7Sections.patch` (87 lines, 1 file, +79;
`git apply --check --reverse` → OK).

## Files changed

- `corpus/knowledge/local-ship.md` +79 lines: five internals-level `## ` member sections
  appended after the existing defects section (EOF-only; no existing line edited).
  Nothing else touched; no production file written; report is the only lane write.

## Sections delivered (heading → body lines/anchor counts)

| heading | body non-blank lines | anchors | ok | nonok |
|---|---|---|---|---|
| `crates/ufo-core-runtime/src/local_ship.rs` | 14 | 11 | 11 | 0 |
| `crates/ufo-core-runtime/src/bounded_fs.rs` | 9 | 6 | 6 | 0 |
| `crates/ufo-core-runtime/src/bounded_fs_tests.rs` | 9 | 5 | 5 | 0 |
| `crates/ufo-core-runtime/src/fs_durability.rs` | 12 | 9 | 9 | 0 |
| `crates/ufo-core-runtime/src/local_ship_tests.rs` | 12 | 11 | 11 | 0 |
| total | — | 42 | 42 | 0 |

Every anchor is `symbol` immediately followed by a bare backticked `:N-M`, so FIDELITY v1's
14-character adjacent-span pairing binds left and the paired symbol is on line N by
construction. Every section carries >=5 own-file anchors and >=1 verbatim symbol
(gate `SECTION_NO_SYMBOL`/`SECTION_NO_ANCHOR` read clean).

Content is internals-level, pinned to the pin: local_ship.rs = transaction/veto order
(`apply_local_ship` :1644-1831, bounds→normalize→denylist→canonicalize→external-effect
before the walk, resolve→nlink→lock, `JournalOp` preimage-before-pending, `run_verifier`
rollback asymmetry, `atomic_write` tmp+fsync+rename+fsync); bounded_fs.rs = classify→
O_NONBLOCK open→fstat→bounded read with `max+1` growth detection; bounded_fs_tests.rs =
the exact-ceiling / TooLarge / NotRegular / GrewPast / IdentityMismatch cases;
fs_durability.rs = `create_0600_tmp`, `hard_link_tmp` lost-race, `TmpGuard`, epoch clocks;
local_ship_tests.rs = commit/rollback/timeout receipts, veto order, journal recovery,
lock election, receipt durability cases.

## Gate output (verbatim)

Before (base tree, my clone stashed):

```
CLAIMS  warn  ROW_NO_SECTIONS          row=R7  R7 has no member section — member completeness unchecked
SUMMARY: errors=0 warnings=1
CLAIMS: MATCH (rows=1 yes=1 notes=1 sections=0 adv=1)
```
```
CLAIMS: MATCH (rows=19 yes=19 notes=27 sections=175 adv=6)
```

After:

```
$ node scripts/claims-check.mjs --src /fast/scratch/kumitate-r36/src --row R7 --strict
ROWS: 1  YES: 1  NOTES: 1  SECTIONS: 5
ROW R7   form=section   notes=1 sections=5 adv=0
SUMMARY: errors=0 warnings=0
CLAIMS: MATCH (rows=1 yes=1 notes=1 sections=5 adv=0)
exit=0
```

Corpus-wide after: `CLAIMS: MATCH (rows=19 yes=19 notes=27 sections=180 adv=5)` —
sections 175→180 (this patch), advisories 6→5 (R7's ROW_NO_SECTIONS gone; R5 remains
topic-form, owned by ExecR5Sections; R9's three SECTION_FILE_NOT_MEMBER warnings are
pre-existing and not from this patch).

## FIDELITY v1 self-check

`--fidelity` does not exist in the base clone (ExecClaimsFidelity owns it), so I ran a
throwaway contract-faithful simulator in `/fast/scratch` over the five member sections
(membership per `probeSections`, bare `:N-M` / own-file `path:N-M` anchors, adjacent-span
pairing right-then-left within 14 chars, classes ok/elsewhere/absent/dead/noid):

```
FIDELITY note=corpus/knowledge/local-ship.md sec=crates/ufo-core-runtime/src/local_ship.rs body-lines=14 anchors=11 ok=11 elsewhere=0 absent=0 dead=0 noid=0 nonok=0
FIDELITY note=corpus/knowledge/local-ship.md sec=crates/ufo-core-runtime/src/bounded_fs.rs body-lines=9 anchors=6 ok=6 elsewhere=0 absent=0 dead=0 noid=0 nonok=0
FIDELITY note=corpus/knowledge/local-ship.md sec=crates/ufo-core-runtime/src/bounded_fs_tests.rs body-lines=9 anchors=5 ok=5 elsewhere=0 absent=0 dead=0 noid=0 nonok=0
FIDELITY note=corpus/knowledge/local-ship.md sec=crates/ufo-core-runtime/src/fs_durability.rs body-lines=12 anchors=9 ok=9 elsewhere=0 absent=0 dead=0 noid=0 nonok=0
FIDELITY note=corpus/knowledge/local-ship.md sec=crates/ufo-core-runtime/src/local_ship_tests.rs body-lines=12 anchors=11 ok=11 elsewhere=0 absent=0 dead=0 noid=0 nonok=0
FIDELITY_TOTAL anchors=42 ok=42 elsewhere=0 absent=0 dead=0 noid=0 nonok=0
```

Each cited range was derived by brace-matched span on the pinned file (not estimated);
e.g. `apply_local_ship` 1644-1831, `claim_apply_lock` 777-1006, `JournalOp` 217-269,
`atomic_write` 2269-2334, `run_verifier` 2355-2385, `bounded_fs::read_bounded_ident`
112-139, `fs_durability::hard_link_tmp` 83-89, and the named test spans.

## Commands run

- `git -C /fast/scratch/kumitate-r36/src rev-parse HEAD` → 31c465f1…
- `git clone --no-hardlinks …/kumitate-shokunin …/w/KumitateR36.ExecR7Sections/lane` +
  `checkout -b r36-execr7sections 0614092e0804`
- `node scripts/claims-check.mjs --src /fast/scratch/kumitate-r36/src --row R7 --strict`
  (before via `git stash`, after via `git stash pop`)
- `node scripts/claims-check.mjs --src /fast/scratch/kumitate-r36/src`
- fidelity simulator (throwaway python in scratch; not committed to the lane)
- `git diff --src-prefix=a/ --dst-prefix=b/ > …/KumitateR36.ExecR7Sections.patch`;
  `git apply --check --reverse` OK

## Risks / notes

- `corpus/knowledge/local-ship.md` is also named in ExecFidSmall's repair scope; this
  change is an EOF append, so a rebase/merge is hunk-separated. Coordination note sent to
  `KumitateR36.ExecFidSmall`.
- The note's pre-existing prose (defects section) still carries stale pin line references
  (`:1639-1848`, `:2317`, `:2465`, etc.) and still lists D-C ("doc claims a pre-rename
  dir fsync that does not exist") although the pin now fsyncs both sides of the rename
  (`local_ship.rs:2324`, `:2332`). Non-member prose is not scored by FIDELITY v1 and is
  outside this item; flagged for the L1/ExecFidSmall rather than edited.
- Dead/noid are 0 here by construction; nothing was ratcheted.
- No tool installs; no pacman; no builds/lint/formatters run (wave rule).
- Blockers: none.
