source: S223 (https://git-scm.com/docs/git-clone, § OPTIONS `--no-hardlinks`, captured
`.ufo/waves/round-74/build/captures/git-clone.html`) and the lane's own pin contract
`.ufo/pins/origin.json` (`kumitate-origin-pin-v1`, own-work)
verified-at: 2026-11-04 (round 74)
recheck: on-host-change

# Origin pin restore — re-establishing an immutable pinned clone on a restored host

## The mechanism

The lane's coverage proxies read the upstream ufo-fsd-alpha tree through a pinned, immutable clone:
`.ufo/pins/origin.json` pins the git revision (`31c465f15669f744848bd9f5d56191c5085670f7` at round 74)
and the clone path (`/fast/scratch/hyaku/kumitate-pin/src`), and carries a verbatim `recreate`
recipe — `git clone --no-hardlinks file:///home/vgpnk/Projects/ufo-fsd-alpha <path>`,
`checkout -q --detach <rev>`, `chmod -R a-w`. `scripts/proxy-check.mjs` resolves `--src` as
`--src` flag → pin `clone` → legacy `$UFO_SRC`, refuses a different tree under the active pin with
`SRC_REV_MISMATCH`, and fails closed `SRC_NOT_A_DIR` when the clone is absent (exit 2, never a
scored zero).

## Why `--no-hardlinks` (S223)

git's own documentation (S223, tier A for this scope): a clone "from a repository on a local
filesystem" defaults to hardlinking "the files under the .git/objects directory" (`-l/--local`,
"hardlinked to save space when possible"), and `--no-hardlinks` forces the clone "to copy the
files under the .git/objects directory instead of using hardlinks" — desirable "if you are trying
to make a back-up of your repository". An immutable pin must not share its object store with the
live checkout: upstream gc/repack would otherwise mutate the pinned bytes underneath the
coverage terms. The man page (`git clone --help`, git 2.56.0) agrees verbatim with both passages
(seat verification, round 74).

## The round-74 restore (host migration)

Rounds 70–73 ran on a Windows host where the pinned path did not exist and the proxy fail-closed
(`SRC_NOT_A_DIR`) every round; the stanza's self-only terms accrued unmeasured drift (A 687→821).
On the restored Linux host (run 15), the recreate recipe re-established the clone: HEAD verified at
the pinned rev, `test ! -w` on the tree, detached clean status
(`.ufo/waves/round-74/build/K74ExecPinRestore/recreate-transcript.txt`, report
`.ufo/waves/round-74/w1/K74ExecPinRestore.md`). After the restore the src-resolution arm passes
and the recompute reaches every term; the remaining round-close re-measure (A, C2/C2_total,
K_members/K_sections, gate pins) is the lane's standing re-pin discipline, receipted same-commit.
