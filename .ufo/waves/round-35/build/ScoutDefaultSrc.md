DEFAULTSRC resolves=/home/vgpnk/Projects/ufo-fsd-alpha moving=yes

# Scout: default origin-tree resolution (`--src` omitted) — operability

Read-only seat. No edits outside this report; no tool installs; no REA.

## 1. Resolution chain (observed in source)

`scripts/claims-check.mjs:78-95` and `scripts/proxy-check.mjs:262-280` carry the
same constant and the same body:

```
const SRC_CANDIDATES = [
  join(homedir(), 'Projects', 'ufo-fsd-alpha'),
  join(homedir(), 'Projects', 'origin-work', 'ufo-fsd-alpha'),
];
function resolveSrcDefault() {
  if (process.env.UFO_SRC) return process.env.UFO_SRC;
  for (const c of SRC_CANDIDATES) if (existsSync(c)) return c;
  return SRC_CANDIDATES[0];
}
```

Order, exactly: (1) `$UFO_SRC` verbatim — no `resolve()`, no trim; (2)
`~/Projects/ufo-fsd-alpha` if it exists as an entry; (3) the legacy
`~/Projects/origin-work/ufo-fsd-alpha`; (4) candidate[0] as the doomed fallback,
which makes the run fail closed `SRC_NOT_A_DIR` (claims `:473`, exit 2 — never a
scored zero).

Call sites, both guarded to fire only for a real check run: `claims-check.mjs:903`
and `proxy-check.mjs:2346` (`opts.src === null && !selftest && !help`).
`claims-check` exports the function (`:874`); `proxy-check` exports nothing
(`grep '^export' scripts/proxy-check.mjs` = empty).

Same list, same shape, in the three sibling gates: `cite-check.mjs:106-121`,
`surface-probe.mjs:137-151`, `round-gate.mjs:150-166` (flag named `--origin`;
this one also trims and `resolve()`s the env value, and resolves on every
non-selftest run at `:296`).

## 2. What resolves on this host now

`HOME=/home/vgpnk`, `UFO_SRC` **unset**, `KIMI_ROOT` unset.
`~/Projects/ufo-fsd-alpha` → directory (`drwxr-xr-x`, mtime 2026-10-20 07:12:04).
`~/Projects/origin-work/ufo-fsd-alpha` → absent.

Live probe:
`node --input-type=module -e "import {resolveSrcDefault} from './scripts/claims-check.mjs'; console.log(resolveSrcDefault())"`
→ `/home/vgpnk/Projects/ufo-fsd-alpha`.

proxy-check's copy is not exported, so it cannot be called directly; equality
with the claims result rests on the byte-identical constant and body above
(observed code, [INFERENCE] only for its execution).

## 3. Is that tree the operator's moving checkout? yes

- `git -C ~/Projects/ufo-fsd-alpha symbolic-ref --short HEAD` → `main`;
  `git diff-index --quiet HEAD --` → clean; two remotes (`origin` GitHub,
  `cursor`).
- HEAD `31c465f15669f744848bd9f5d56191c5085670f7`, committed
  `2026-10-20 07:25:51 -0300`; 40 commits since 2026-10-01
  (`git rev-list --count --since=2026-10-01 HEAD`).
- `git rev-list --left-right --count HEAD...@{u}` → `0  0`: it is a live
  tracking clone on `main`, not a fixture or a fixed worktree.
- Coincidence that matters: that HEAD **equals** the binding pin, and
  `/fast/scratch/kumitate-r35/src` is `DETACHED` at the same `31c465f1`. So a
  bare checklist run *today* is accidentally honest; nothing in code or docs
  makes that repeatable after the next upstream commit.

## 4. Checklists are exposed, and the exposure is silent

SKILL.md:616-630 is 13 `- [ ]` items, every command bare. Five consume the
origin tree: `:618` cite-check, `:620` surface-probe (reads origin
`config/ufo.json`), `:623`/`:624` round-gate (resolves `--origin` on every run;
reads it only for citations that do not resolve in the lane), `:625` proxy-check,
`:627` claims-check.

The executor is `surface-probe.mjs:858-860`:
`spawnSync('bash', ['-c', item.command], { cwd: opts.self })` — the environment
is inherited, and a per-item `UFO_SRC=… node …` prefix is valid under the frozen
checklist grammar (`CHECKLIST_RE`, `:182`), because the command is one
backticked string handed to a shell.

Nothing in the human verdict names which tree was measured: `PROXY: MATCH`
(`proxy-check.mjs:948-963`), `CLAIMS: MATCH` (`claims-check.mjs:426-433`) and
`ROUND_GATE:` (`round-gate.mjs:677`) all omit it. Only JSON (`src` at
`proxy-check.mjs:978,1078`, `claims-check.mjs:441,524`) and the fail-closed
stderr line carry it.

Baseline evidence of the split: `.ufo/waves/round-35/baseline/checklists.txt`
records `$ node scripts/surface-probe.mjs --checklists` (bare, 9/13, four fails
at 620/625/627/628), while `proxy.txt`/`claims.txt` in the same directory record
`--src /fast/scratch/kumitate-r35/src`. The round measured the pin in its direct
gates and the moving checkout inside the checklist. Same HEAD today, so the
divergence is unobservable.

## 5. Doc drift (live instructions naming a path that no longer exists)

- `SKILL.md:9` — "its source in the origin repo
  (`/home/vgpnk/Projects/origin-work/ufo-fsd-alpha`, paths relative)". Absent.
- `corpus/knowledge/member-claims-gate.md:23`,
  `corpus/knowledge/round-close-gate.md:53`,
  `corpus/knowledge/live-surface-probe.md:12` present the legacy path as *the*
  default, though every script derives it. (Round lessons such as
  `corpus/lessons/round-16.md` are historical records and may keep the old path.)
- SKILL.md:607-609 already names the deeper gap itself: "no verdict line names
  the revision it measured — cite the commit beside the verdict instead."

## 6. Recommendation (design only, not implemented)

Axis moved: **operability**. Smallest honest pinning, in this order:

**R1 — zero code, zero repo edit (preferred).** Pin by revision, not by path:
materialise the pin once as a detached worktree and export it around the
checklist run.

```
git -C /fast/scratch/kumitate-r35/src worktree add --detach \
    /fast/scratch/kumitate-r35/src-31c465f1 31c465f1
UFO_SRC=/fast/scratch/kumitate-r35/src-31c465f1 \
    node scripts/surface-probe.mjs --checklists
```

`$UFO_SRC` is already precedence 1 in all five gates
(`claims-check.mjs:90`, `proxy-check.mjs:274`, `cite-check.mjs:117`,
`surface-probe.mjs:148`, `round-gate.mjs:162-164`) and is inherited through
`bash -c`, so all five origin-reading items pin at once with no SKILL.md edit.
Caveat: `worktree add` mutates the read-only clone, so the L1 owns that step; I
did not run it.

**R2 — smallest durable repo change, if an env prefix cannot be guaranteed.**
Add a one-line repo pin (`.ufo/src-pin` = `<rev>`); in each `resolveSrcDefault`
prefer `$UFO_SRC` → repo pin (verify `git -C <candidate> rev-parse HEAD` equals it,
else fail closed `SRC_REV_DRIFT`) → existing candidates; and append
`src=<path>@<rev>` to the MATCH/DRIFT line — ~eight lines × five scripts, closing
SKILL.md:607-609: a moved default becomes loud, and MATCH is attributable to a revision.

**Reject.** Hardcoding `/fast/scratch/...` into SKILL.md (ephemeral path in a
durable doc); and treating the operator's checkout as the pin — it moved again
at 07:25 today, so corpus citations from 2026-09-27 cannot be re-checked there.

## 7. Commands run (all read-only)

- `grep -n resolveSrcDefault|UFO_SRC|--src scripts/{claims,proxy,cite,surface,round-gate}*.mjs` — chain + call sites.
- `node --input-type=module -e "import {resolveSrcDefault} from './scripts/claims-check.mjs'; …"` → `/home/vgpnk/Projects/ufo-fsd-alpha`; `printf $HOME/$UFO_SRC` + `test -d` on both candidates (1 dir, 2 absent).
- `git -C ~/Projects/ufo-fsd-alpha rev-parse/symbolic-ref/log -1/diff-index --quiet/rev-list --count --since/rev-list --left-right --count HEAD...@{u}/remote -v`; `git -C /fast/scratch/kumitate-r35/src symbolic-ref` → `DETACHED`, `rev-parse HEAD` → `31c465f1…`.
- `sed -n` reads of `surface-probe.mjs:795-885`, `proxy-check.mjs:925-1095`, `claims-check.mjs:78-95`, `round-gate.mjs:140-180,293-296`, `SKILL.md:1-16,606-632,668-690`, corpus notes cited above; `cat .ufo/waves/round-35/baseline/{checklists,proxy,claims}.txt`.

Remaining unknown: whether `--tracked` alone ever opens the origin tree depends on
citations unresolved locally — not exercised (no gate run against the operator's tree).
