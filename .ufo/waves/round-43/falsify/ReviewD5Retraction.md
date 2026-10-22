RESULT ReviewD5Retraction verdict=right reproduced=yes

The retraction is the right disposition, with one correction to its stated reason. "Does not reproduce" is imprecise: the round-42 counts DO reproduce under the lane's default invocation (--src defaults to the moving origin checkout), and what fails is reproduction against the pinned-src inputs the wave used. Counts are decided by the scanned doc tree, the --src tree state, the --fleet root, and working-copy edits; the script bytes alone do not fix them.

Reruns, each under `systemd-run --user --scope --quiet -p MemoryMax=4G -p TasksMax=128 timeout -s KILL 600 node scripts/cite-check.mjs` (node v24.21.0; no tools installed; scratch /fast/scratch/hyaku/kumitate-r43/seats/ReviewD5Retraction/):

1. Clone `lane-c9a084bf` detached at c9a084bf03fb043d3cce5da102fffbc023552a45; `git show c9a084bf:scripts/cite-check.mjs` sha256 1915e5b97cff8b6ee29ea72071ae093f9d5d9f1c7ea8a5007ab61f7117530c3e.
   - `--src /fast/scratch/hyaku/kumitate-pin/src --fleet /home/vgpnk/Projects/shokunin`: `CITE_CHECK: DRIFT (files=98 tokens=9465 errors=554 warnings=481)`, exit 1. Reproduces wave-1 ExecCiteBefore and the round-42 CritNoHarm measured value (554/481).
   - `--src /home/vgpnk/Projects/ufo-fsd-alpha --fleet /home/vgpnk/Projects/shokunin` (default src; UFO_SRC unset): `CITE_CHECK: DRIFT (files=98 tokens=9466 errors=526 warnings=481)`, exit 1. This is exactly the round-42 claimed "errors stay 526, warnings 481".

2. Clone `lane` detached at e5ffcbe7f155b89cb1870f9da7b0d671d092948b (same cite-check hash 1915e5b9): pinned-src+fleet command: `CITE_CHECK: DRIFT (files=99 tokens=9507 errors=558 warnings=486)`, exit 1; run twice, byte-identical stdout (`cmp identical-full`) — deterministic given identical inputs. With moving src: errors=530 warnings=486.

3. Cause of the pinned-vs-moving delta: REV_UNKNOWN falls 33 -> 5 (c9a084bf) and 34 -> 6 (e5ffcbe7); `pins ok` rises accordingly. The pinned src clone lacks commits cited by rev pins; the moving origin checkout holds them. LINE_OOR, UNRESOLVED and PIN_MISMATCH are unchanged across src states.

4. Fleet input: same e5ffcbe7 clone, pinned src, `--fleet <empty dir>`: `CITE_CHECK: DRIFT (files=99 tokens=9500 errors=731 warnings=562)`, FLEET_MISSING=100 — the fleet root changes counts materially.

5. Scanned-tree input: file set differs per sha (97/98/99 docs -> errors 553/554/558 at pinned src); dfabe92's cite-check hash (896f0720) differs from c9a084bf/e5ffcbe7 (1915e5b9). The round-42 close receipt tokens=9471 vs clone 9465/9466 imply close-time working-copy doc edits.

6. The after-side warnings 484 do not reproduce today either (481 under both src states at c9a084bf), reinforcing that the round-42 numbers were a snapshot of time-varying inputs, not a same-sha fact.

7. No leftover processes after runs (`pgrep -f ReviewD5Retraction` empty); scratch cleaned.
