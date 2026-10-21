ATTACK re-anchored S8 member section `scripts/lean-cargo/README.md` (corpus/knowledge/remaining-scripts-census.md:598-600) verdict=partial defects=2

Scope: only this member section and its population-table row at 31c465f1.
Input: .ufo/waves/round-35/build/FidLeanCargoREADMEMd.md (line refs :560/:562 are
stale after integration; current heading/body are note:598/600 — expected drift).

Method (all read-only):
- `git -C /fast/scratch/kumitate-r35/src show 31c465f1:scripts/lean-cargo/README.md`
- per-anchor `… | sed -n 'Np'` at 31c465f1 (also at 964f443e for pre-existing check)
- `node scripts/cite-check.mjs --src /fast/scratch/kumitate-r35/src --self . --symbols --json`
- the note's own Arm-2 member-probe over a one-member scratch copy (scratch:
  /fast/scratch/kumitate-r35/w/KumitateR35.SecLeanCargoREADMEMd/)

## Population row
`corpus/knowledge/remaining-scripts-census.md:139` = `| scripts/lean-cargo/README.md | 81 | doc |`.
`git -C /fast/scratch/kumitate-r35/src show 31c465f1:scripts/lean-cargo/README.md | wc -l` → `81`. PASS.
(diff master: `-| … | 80 | doc |` / `+| … | 81 | doc |`; 964f443e is 80 lines.)

## Anchor table (pin 31c465f1)
| anchor | cited line | named behavior on that line | verdict |
|---|---|---|---|
| README:1 | `# lean-cargo — kill the cargo lock convoy` | title quoted verbatim | PASS |
| README:12 | `proxy symlink; backup \`cargo.rustup-proxy\`, uninstall = move it back). Ends in` | backup/uninstall yes; `exec -a cargo rustup` is at :13 | DEFECT 2 |
| README:28 | `` `LEAN_CARGO_DISABLE=1` → byte-for-byte stock behavior (measurement baseline). `` | byte-for-byte stock baseline | PASS |
| README:72 | `` - `measure.sh` — convoy-vs-slots measurement (`RESET_CACHE=1` to wipe sccache) `` | Files-section RESET_CACHE claim | PASS |
| README:77 | `` - `pacman -S sccache` → sccache 0.17.0 (`/usr/bin/sccache`) `` | pacman/0.17.0 yes; byte-identity clause is :78 | DEFECT 1 |
| measure.sh:66 | `rm -rf "$SCCACHE_DIR"` | unconditional wipe (comment :64 says "unconditional"); `grep -c RESET_CACHE` on measure.sh = 0 | PASS |

Prose re-verified true at pin (unanchored claims): problem statement (README:3-7),
subcommand classes incl. `flock` on `cargo-slots/s<N>.lock` / 32 slots / warmest-first /
up to 8 read-only overlay lowers (README:19-20,22), Measured 30.8 s/28.9 s with 7–8
lock-wait lines vs 36.8 s slots/0 waits and 0.93% sccache in the without-overlay era
(README:52-57). No new false prose claim introduced by the round-35 edit.

## Defects

### D1 (new in round 35) — note:600 final `(`:77`)` resolves to the wrong file and drops :78
The sentence "…the Installed-system-state section pins `pacman -S sccache` → 0.17.0
plus the installed shim's byte-identity to `bin/cargo-shim.sh` (`:77`)" needs
README:77-78: the byte-identity clause is README:78
(`- \`~/.cargo/bin/cargo\` = shim (byte-identical to \`bin/cargo-shim.sh\`);`).
Worse, `:77` is not path-qualified after a foreign full-path cite:
- the note's own ledger grammar ("`:N` continuing the last full path", note:450-452,
  which also requires "the line … in the member's own file") makes `:77` →
  `scripts/lean-cargo/measure.sh:77` (not the member's own file):
  `$ … measure.sh | sed -n '77p'` → `echo "B total wall_ms=$((tb1 - tb0))" | tee -a "$LOGD/summary.txt"`
- the note's Arm-2 resolution (same rule) prints `SHORT :77 -> scripts/lean-cargo/measure.sh:77`
- cite-check's sticky owner steals it to the adjacent `bin/cargo-shim.sh` token:
  `600 note OK bin/cargo-shim.sh :77 | bin/cargo-shim.sh:77 -> scripts/lean-cargo/bin/cargo-shim.sh`
  (`sed -n '77p'` → `  wrapper_ours=1`).

Neither machine-resolved line carries the claimed behavior; both checks pass only
because the line is non-empty. Command: see above (cite-check JSON at
`/fast/scratch/kumitate-r35/w/KumitateR35.SecLeanCargoREADMEMd/cite-check.json`,
line-600 findings contain no SYMBOL finding at all).
Minimal fix: write `` (`scripts/lean-cargo/README.md:77-78`) `` in note:600.

### D2 (pre-existing, retained) — note:600 `(`:12`)` does not carry `exec -a cargo rustup`
`README:12` stops at "Ends in"; the named symbol is README:13
(`` `exec -a cargo rustup` so toolchain resolution is byte-identical to stock. ``).
The claim's install/backup facts also start at :11. cite-check binds `:12` to
`bin/cargo-shim.sh:12` (`# CARGO_NET_OFFLINE=true, --frozen -q (deduped),`) because the
backticked `bin/cargo-shim.sh` token owns the following ref — another vacuous OK.
Minimal fix: write `` (`scripts/lean-cargo/README.md:11-13`) `` (or at least `:12-13`).

## Verifier caveat (not counted as a section defect)
cite-check reports OK for `:12`, `:28`, `:72`, `:77` while binding them to
`bin/cargo-shim.sh`/`measure.sh` lines that do not contain the claims:
`:12`→shim:12, `:28`→shim:28 (`# Env overrides: …`), `:72`→measure.sh:72
(`one_build B1 "$LOGD/B1.log" & p1=$!`), `:77`→shim:77. So the mechanical ledger does
not substantiate these four anchors; repeating the full README path on each cite
closes both grammars. The note's Arm-2 probe also passes
(`MEMBER_PROBE: 1/1 ok`) only because `measure.sh:77` is non-empty.

## Revision label / removed clauses
master's section carried no revision label and the round-35 diff removes zero clauses;
the char-level diff is exactly `:34→:28`, `:77→:72`, `:82→:77` plus
` re-anchored at 31c465f1 (round 35)`. Nothing removed, so no trace is owed. The new
tag is accurate; the 80→81 row change matches the pin.

## Wave-1 disagreement
FidLeanCargoREADMEMd.md records "(:82) re-anchored at 31c465f1:77 (shim clause at :78)"
yet returns `moved`/ok. Under the falsify standard (the cited line must carry the named
behavior) that anchor is partial: :77 has pacman only, :78 has byte-identity, and the
bare ref binds to another file. D2's :12 was likewise accepted as "ok".

[INFERENCE] The live lane file was compared via git; the pin clone is detached and
read-only, so no working-tree divergence was checked beyond the lane diff.

Tool installs/updates: none.
