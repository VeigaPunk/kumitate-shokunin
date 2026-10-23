RESULT ScoutProxyADef rev=a2e5b54c verdict=confirmed A_base=16 A_tip=16 lines=match

Inherited statement CONFIRMED. No tool installed.

Revision checked: `a2e5b54cdd2c4cbf72cb0b2ab4ed53e2fe0d730f` (HEAD). Base: `3632602c6f68945ce973043f6d47bf3990afff13`. Blob `scripts/proxy-check.mjs` is `eea8555fda475fff4fa873b94ae5672b351fceb4`, sha256 `da3de1fb1ff826da9e7a8d07b49812e4d84d220d16c3531feadd90b3e0dce826`, 2971 lines. The worktree file has the same sha256, so the lines below are the tip, not a dirty edit.

Command: `git -C /home/vgpnk/Projects/shokunin/kumitate-shokunin show a2e5b54cdd2c4cbf72cb0b2ab4ed53e2fe0d730f:scripts/proxy-check.mjs` (those line numbers). Observed text:

- 94-95: `A   files under --self (any .git tree excluded), named *.mjs|*.js|*.sh|*.py`
- 490: `const RE_RUNNABLE = /\.(?:mjs|js|sh|py)$/;`
- 681: `if (e.name === '.git') continue;` (the only skip inside `walkFiles`, lines 677-686)
- 930: `const A = walkFiles(self).filter((r) => RE_RUNNABLE.test(r)).length;`

`lines=match`: the note's `:490` and `:930` are those two lines, byte for byte with the regex it quotes.

`walkFiles` does not skip `.ufo`. It does not skip hidden directories. It skips an entry only when the name is `.git` (a file or a directory, nested too). Symlinks are not files (`isFile` is false) and are not followed. `.txt` files are walked and then dropped, because the regex must end the path. The self-test at lines 1668-1670 states the same rule: `.git/junk.mjs` and `notes.txt` are outside `A`. `listChildren` (line 652) hides dot names, but that helper is not used for `A`.

Command: `git -C /home/vgpnk/Projects/shokunin/kumitate-shokunin ls-tree -r --name-only <rev>`, keep paths matching `/\.(?:mjs|js|sh|py)$/`. Observed: base 1349 paths, 16 matches; tip 1356 paths, 16 matches; the two sets are equal. A mode listing (`git ls-tree -r`) shows all 16 as blobs (`100755` or `100644`), no symlink and no gitlink. Eleven are under `scripts/` (same eleven at both revs, including `scripts/omp-census.mjs`). Five are round probes, all under `.ufo`:

- `.ufo/waves/round-43/probe/c1-discriminators.sh`
- `.ufo/waves/round-44/probe/p44-count.mjs`
- `.ufo/waves/round-44/probe/p44b-count.mjs`
- `.ufo/waves/round-44/probe/p44c-count.mjs`
- `.ufo/waves/round-44/probe/p44d-count.mjs`

So `A` counts every committed runnable file, probes included, not only `scripts/`.

Attempt 1's `.txt` probes do not change `A`. The tip adds `.ufo/waves/round-45/probe/normalize.py.txt` and `reopen-quote.sh.txt` (commit `a2e5b54`, `git log -1 --format=%h -- <path>`). Both end in `.txt`, so the regex misses them. The runnable set is unchanged, 16 to 16. The worktree also has untracked `catalog-check.mjs.txt` and `toy-count.mjs.txt`; same miss. `git status --porcelain -uall` shows 0 dirty paths ending in `.mjs`, `.js`, `.sh`, or `.py`. `git ls-files -o -i --exclude-standard` shows 2324 ignored paths and 0 of those suffixes (the `.jj` store is in that set: 2321 files walked, 0 runnable). A live `walkFiles` on this worktree would still be 16.

Separate clause in the same note, also re-counted, CONFIRMED: round 44's `A` 11 to 16. Command: same `ls-tree --name-only` filter at `6cda8c353c7dd7a890eb20382ffa55fac9daaf6d` (round-44 open; `361d449^` is that commit). Observed `A=11`: the ten scripts without `omp-census.mjs`, plus the round-43 probe. At `32b7fd561dae` (`d81978c^`) `A=15` (the four `p44*.mjs` probes are in). At `d81978cdfefd` `A=16` (`scripts/omp-census.mjs` added). Net: one shipped instrument plus four round-44 probes; the round-43 probe was already inside the 11.
