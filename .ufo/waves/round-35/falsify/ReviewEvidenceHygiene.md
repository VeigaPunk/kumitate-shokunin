ATTACK wave-evidence-hygiene verdict=partial defects=3

Axes attacked: evidence integrity (proxy A walk), leakage (secrets/oversize),
pointer durability (Q14 + tracked-doc references). Lane tree read-only; no lane
edit, no git/jj mutation. Tooling installs: none.

## Holds (verified, not inferred)

1. **A walk counts no wave evidence.** Exact item command restricted to the wave dir:
   `find .ufo/waves/round-35 -type f \( -name '*.mjs' -o -name '*.js' -o -name '*.sh' -o -name '*.py' \) -print`
   → empty (count=0). Whole lane:
   `find . -path ./.git -prune -o -type f \( -name '*.mjs' -o -name '*.js' -o -name '*.sh' -o -name '*.py' \) -print`
   → exactly 7× `scripts/*.mjs`. Gate re-run:
   `node scripts/proxy-check.mjs --self . --src /fast/scratch/kumitate-r35/src`
   → `PROXY: MATCH (A=7 C=13 operability=8; C1=19/19 C2=79/79 coverage=10; S=88/88 coverage:script-layer=10; R=83/92 coverage:runtime-layer=9; K=51/51 coverage:kimi-layer=10; pins=6 match)`.
   The two runnable evidence tools are deliberately `.txt`-suffixed:
   `.ufo/waves/round-35/mutate-distinct.sh.txt` (0755) and
   `.ufo/waves/round-35/baseline/distinct-probe.mjs.txt`; the repair is documented at
   `corpus/lessons/round-35.md:16` (A_DRIFT 8→7). Fragility note: the A walk prunes
   only `.git` (`scripts/proxy-check.mjs:499-507`) and `RE_RUNNABLE` is
   `/\.(?:mjs|js|sh|py)$/` (`:325`), so ANY future `.sh/.py/.mjs/.js` dropped under
   `.ufo/waves/` silently moves A; the suffix discipline must be kept.

2. **No file >1 MiB in the wave dir.** `find .ufo/waves/round-35 -type f -size +1048576c`
   → 0. Largest: `build-dispatch.json` 235,722 B; total 1,678,203 B / 143 files.
   Lane-wide only `.ufo/interactive-sessions/20261015T050057Z/…jsonl` (1,811,965 B),
   ignored by `.gitignore:1` (`.ufo/interactive-sessions/`) — not evidence.

3. **No secrets.** JWT/`ghp_`/`sk-`/`BEGIN … PRIVATE KEY`/`Bearer <value>` sweep over
   the wave dir → 0 value hits; no `mcpServers`/`"command"` content; no copy of any
   `~/.kimi-code` member (`find .ufo -name 'mcp.json*' -o -name 'server.token*'` → none).
   Only shape metadata: `build/SentinelK1Secrecy.md:45` records
   `mcp.json … mode=644 size=249`, `server.token … mode=600 size=43`,
   `credentials … mode=700 size=70`, `oauth … mode=755 size=60` (never content);
   `baseline/kimi.txt:13-15` names the UNLISTED finding only. Census re-run today:
   `node scripts/kimi-census.mjs` → `KIMI_CENSUS: CLEAN (members=51 checked=51 chain=7 info=4)`,
   exit 0 — matches C3.

4. **Q14 clean for round-35 additions.** Exact Q14 test
   `grep -rn '/tmp/kumitate-r\|vgpnk/projects/' LOG.md SCORECARD.md corpus | wc -l`
   → worktree 45, master 45; added-line filter
   (`git diff master -U0 -- LOG.md SCORECARD.md corpus`, tracking `+++ b/`) → 0 hits.
   The `/tmp/s8-all-scripts.txt` intermediates at
   `corpus/knowledge/remaining-scripts-census.md:74,76,77` existed identically at master
   (`git show master:corpus/knowledge/remaining-scripts-census.md`), so not new.
   87 wave files cite `/fast/scratch/kumitate-r35/...`; Q14 bans `/tmp/` and the
   lowercase path, not the scratch clone — [INFERENCE] acceptable because the round
   contract names that pinned clone, but those pointers die with the scratch tree.

5. **Frozen populations match the LOG claim.** `wc -l .ufo/waves/round-35/frozen/*`
   → `s-added-2.txt` 2, `s-deleted-5.txt` 5, `s-modified-members-55.tsv` 55 — exactly
   `LOG.md:1591` "55 modified, 2 added, 5 deleted". Baseline `checklists.txt` tail is
   `CHECKLIST: 9/13 pass / VERDICT: FAIL / exit=1`, matching `LOG.md:1584-1585`.

## Defects

### D1 — stray untracked gate backup in `scripts/` (must be removed before commit)
- Path: `scripts/proxy-check.mjs.orig` (untracked, 121,144 B, mode 0755, mtime
  2026-10-20 22:17:41); `git check-ignore -v` → rc=1 (not ignored).
- `git -C . status --porcelain` → `?? scripts/proxy-check.mjs.orig`.
- Provenance: `sha256sum scripts/proxy-check.mjs.orig`
  `= 0a128507520fea0936211cf1d62d4b1bef3f4bf62dd737d83351f89a93976ee9`, identical to
  `/fast/scratch/kumitate-r35/w/MutKimiCensusMcp/scripts/proxy-check.mjs.orig` and
  `…/MutProxyLayerTerms/scripts/proxy-check.mjs.orig`; blob not in git history
  (`git rev-list --all --objects | grep <blob>` → empty). Live
  `scripts/proxy-check.mjs` is 125,322 B, i.e. the `.orig` is its pre-change backup.
  [INFERENCE] created by an in-place edit of the live gate during the build wave.
- Gate impact today: none — `.orig` does not match `RE_RUNNABLE`, and pin coverage
  scans only `scripts/*.mjs` (`scripts/proxy-check.mjs:887-889`), so it escapes
  `PIN_UNPINNED`. Risk: `git add -A` would commit a stale 121 KB gate copy with no pin.
- Minimal fix (L1, before commit): `rm scripts/proxy-check.mjs.orig`; keep edit
  backups in the scratch dir, not in `scripts/`.

### D2 — tracked round-35 docs cite an entirely untracked evidence tree
- `git status --porcelain .ufo` → `?? .ufo/waves/` (whole tree untracked);
  `.gitignore` lists only `.ufo/interactive-sessions/`; master tracks
  `.ufo/rounds/round-33` and `.ufo/rounds/round-34` but has no `.ufo/waves/`
  (`git ls-tree master .ufo/waves/` → empty).
- Committed-candidate docs that dereference it: `LOG.md:1581` (`baseline/`),
  `LOG.md:1591` (`frozen/`), `SCORECARD.md:57`
  (`baseline/checklists.txt`), `corpus/lessons/round-35.md:6,13,23,49`
  (`baseline/`, `build/ScribeSrc*.md`). If those docs commit without the wave dir,
  every one of these pointers is dead in the repo (Q14 spirit: pointers resolve under
  the live repo root).
- Minimal fix (L1): commit `.ufo/waves/round-35/{baseline,frozen,build,falsify}`
  and keep the harness inputs (`build-spec.json`, `build-dispatch.json`,
  `falsify-spec.json`, `falsify-dispatch.json`, both `swarm-registry.json` — these
  duplicate full agent prompts) out via `.gitignore`, or move the cited dirs to the
  tracked `.ufo/rounds/round-35/` layout and repoint the 7 citations. Do not commit
  the 0600 registries as-is.

### D3 — baseline witness records a `/tmp` command that no longer resolves (low)
- `.ufo/waves/round-35/baseline/distinct.txt:1`:
  `$ node /tmp/kr35-distinct.mjs /fast/scratch/kumitate-r35/src`; the probe bytes are
  retained only as `baseline/distinct-probe.mjs.txt`, so the recorded invocation
  cannot be re-run as written (the `/tmp` file is gone).
- Minimal fix: change the header to
  `cp .ufo/waves/round-35/baseline/distinct-probe.mjs.txt /tmp/kr35-distinct.mjs && node …`
  (or equivalent scratch-dir path) so the witness is reproducible; same pattern is
  used correctly by `mutate-distinct.sh.txt`, which is retained in-tree.

## Misroot sweep (reported, not moved)
`git -C /home/vgpnk/Projects/shokunin status --porcelain`:
` M .ufo/watchdog.log` plus 14 untracked `?? .ufo/state/<lane>.report-baseline`.
The only one naming kumitate (and round 35) is
`.ufo/state/kumitate.report-baseline` — 68 B, content
`35 e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855`
(round 35 + SHA-256 of an empty report), mtime 2026-10-20 21:05:24. Producer is
`scripts/shokunin-watchdog.sh:122` (`state="$UFO/state/$1.report-baseline"`), so this
is watchdog state, not a lane-evidence misroot; 13 sibling lanes have the same file.
No untracked kumitate/round-35 file exists outside `.ufo/state/` in the fleet repo
(`git status --porcelain --untracked-files=all`). No action taken.

## Remaining unknowns
- Whether L1 intends to commit `.ufo/waves/` (D2) — not observable from the tree.
- Whether D1's `.orig` was created in the live tree or copied there — sha+mtime point
  to the build wave, but the creating command is unrecorded [INFERENCE].
