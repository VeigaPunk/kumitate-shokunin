FIDELITY scripts/lean-cargo/README.md anchors=6 ok=3 moved=3 changed=0 gone=0

Axes: coverage:script-layer (C2 anchor fidelity at pinned 31c465f1) + note accuracy.
Status convention: ok = cited line at 31c465f1 still carries the claimed text/behavior; moved = claim survives elsewhere in the member (correct anchor given); changed = diff altered the claim's content; gone = claim no longer present in the member at all. The verdict line counts anchors only; unanchored behavior deltas are prose flags.

Method (commands run, all read-only):
- `git -C /fast/scratch/kumitate-r35/src diff 964f443e 31c465f1 -- scripts/lean-cargo/README.md`
  → sole change: line 43 (`Load = ... (gates.sh's heavy stage).`) replaced by two
  lines (`the \`rust\` group in \`gates.sh\`; \`UFO_CLI_BIN\` lets the wrappers
  consume a slot-built binary`), +2/-1, 80 L → 81 L. Commit 403be34 2026-10-19
  "gates: table-driven stage runner, rust stage, derived battery stamps".
- Every cited line read at both revisions via
  `git -C /fast/scratch/kumitate-r35/src show <rev>:scripts/lean-cargo/README.md | sed -n ...`.
- Note section: heading at corpus/knowledge/remaining-scripts-census.md:560, body at :562
  (single prose line), population row at :116 (no inline anchor).

Anchors (6): note:560 heading; note:562 `scripts/lean-cargo/README.md:1`; note:562 `:12`;
note:562 `:34`; note:562 `:77`; note:562 `:82`.

Rows (non-ok anchors):

note:562 | `scripts/lean-cargo/README.md:34` | `LEAN_CARGO_DISABLE=1` documented as byte-for-byte stock baseline | moved | scripts/lean-cargo/README.md:28 | baseline claim (`LEAN_CARGO_DISABLE=1`, :34) verified at 964f443e:28, re-anchored at 31c465f1:28.

note:562 | `scripts/lean-cargo/README.md:77` | Files: `RESET_CACHE=1` wipes sccache; variable exists nowhere in measure.sh, wipe unconditional (measure.sh:66) | moved | scripts/lean-cargo/README.md:72 | `RESET_CACHE=1` Files bullet (:77) re-anchored at 31c465f1:72; measure.sh:66 wipe unchanged in range.

note:562 | `scripts/lean-cargo/README.md:82` | Installed state: `pacman -S sccache` → 0.17.0; installed shim byte-identical to `bin/cargo-shim.sh` | moved | scripts/lean-cargo/README.md:77 | sccache 0.17.0 + shim byte-identity (:82) re-anchored at 31c465f1:77 (shim clause at :78).

Unanchored behavior delta (flag, per instructions): note:562 paraphrases the Measured section
without quoting the Load-line parenthetical, so nothing in the note is falsified, but the
underlying claim "gates.sh's heavy stage" no longer exists — 403be34 rewrote it to
"the `rust` group in `gates.sh`; `UFO_CLI_BIN` lets the wrappers consume a slot-built binary"
(31c465f1:43-44). If the census prose ever quotes that parenthetical, update it.

Also verified, unchanged: note:562's other claims (What ships install/backup/exec -a cargo rustup
wording :11-13; per-subcommand table incl. `flock` on `cargo-slots/s<N>.lock`, 32 slots,
warmest-first, 8 overlay lowers — 31c465f1:19-20; Measured table 30.8/28.9/36.8 s, 7-8 lock-wait
lines, 0.93% sccache hit — 31c465f1:50-57). All line-identical across both revisions; the single
insertion at :43-44 sits after every one of them, so no other anchor can have slid.

Extra flag for the census executor: population row note:116 still carries `| 80 |` for this
member; at 31c465f1 the file is 81 lines (diff +1). Out of anchor scope but feeds C2's 88/88 re-count.

Note: the two stale cites (:34, :82) were already invalid at 964f443e — pre-existing note drift,
not caused by the pinned diff; both claims verifiably existed at 964f443e (lines 28 and 76-78).

[INFERENCE] anchors were verified only against the pinned clone (read-only pin mandate), not the
live working tree; the live lane file is presumed to match 964f443e per the frozen baseline census.

No tool installs/updates were needed or performed.
