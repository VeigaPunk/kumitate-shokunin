ROUNDGATE_DEFAULT fires_when=no-cwd-condition: the default reports dir is `<script>/../../.ufo/reports` (absolute, derived from `import.meta.url`), so bare `--round 34` is CLEAN from every cwd; REPORTS_DIR_MISSING fires only when the RESOLVED `--reports-dir` is absent/not-a-dir, and cwd enters that resolution only through a RELATIVE `--reports-dir`/`--main-repo`/`KUMITATE_*` value

# Scout: round-gate.mjs default REPORTS_DIR_MISSING (routed claim)

Read-only. Repo `kumitate-shokunin` at `1770305fae20826b39905a8251ddeca6b4957ac4`.
No tools installed or upgraded; no production, git, jj, or host state touched.

## 1. Reproduction — routed claim does NOT reproduce at HEAD

Command (identical in all three runs):
`node /home/vgpnk/Projects/shokunin/kumitate-shokunin/scripts/round-gate.mjs --round 34`

| cwd | stdout | exit |
|---|---|---|
| `/home/vgpnk/Projects/shokunin/kumitate-shokunin` | `ROUND_GATE: CLEAN (round=34 lane=kumitate checks=10 errors=0 warnings=0)` | 0 |
| `/home/vgpnk/Projects/shokunin` | same CLEAN line, 10/10 checks | 0 |
| `/tmp` | same CLEAN line, 10/10 checks | 0 |

`--json` from each cwd resolved the identical triple:
`repo=/home/vgpnk/Projects/shokunin/kumitate-shokunin`,
`reportsDir=/home/vgpnk/Projects/shokunin/.ufo/reports`,
`round=34, verdict=CLEAN, errors=0, warnings=0`
(`mainRepo` is not emitted in audit-mode JSON; it is echoed only in `--tracked`/fail-closed bodies, `scripts/round-gate.mjs:560`).
No `KUMITATE_*` variables are set in this shell (`env | grep -i kumitate` → empty).
The default reports dir exists and holds the round-34 report:
`-rw-r--r-- 1 vgpnk vgpnk 20798 Oct 19 20:58 /home/vgpnk/Projects/shokunin/.ufo/reports/round-34/kumitate.md`.

## 2. How the defaults actually resolve (cwd-independent)

`scripts/round-gate.mjs`:
- `:139` `const HERE = dirname(fileURLToPath(import.meta.url));` — script location, never `process.cwd()`.
- `:142` `const DEFAULT_MAIN_REPO = resolve(HERE, '..', '..');` → `/home/vgpnk/Projects/shokunin`.
- `:143` `const DEFAULT_REPORTS_DIR = join(DEFAULT_MAIN_REPO, '.ufo', 'reports');`.
- `:193` `const DEFAULT_REPO = realpathOr(resolve(HERE, '..'));` → the lane repo root.
- `:244-248` `dirValue()` returns `resolve(v)` — the *only* place cwd can enter (relative flag values).
- `:264-266` flag parsing (`--repo`, `--reports-dir`, `--main-repo`).
- `:282-285` main repo: flag > `KUMITATE_MAIN_REPO` > `DEFAULT_MAIN_REPO`; `mainRepoSrc` records flag/env.
- `:287-291` reports dir: flag > `KUMITATE_REPORTS_DIR` > (if main-repo was explicit) `<main-repo>/.ufo/reports` > `DEFAULT_REPORTS_DIR`.
- `:526-529` (`--tracked`) and `:646-649` (audit / `--close`) preflight: `if (statKind(opts.reportsDir) !== 'dir')` → `failClosed(..., 'REPORTS_DIR_MISSING', '--reports-dir <path> is <absent|file|other>')`, exit 2. Documented at `:115-116` and exit map `:63-64`.

So for the exact routed invocation (no flags, no env) the reports dir is the derived absolute path; changing cwd cannot change `repo`, `mainRepo`, `reportsDir`, or `--round` derivation (`:650`, `latestClosedRound` over the reports dir).

## 3. Exactly when REPORTS_DIR_MISSING fires

Only when `statKind(resolvedReportsDir) !== 'dir'` at `:526-529` / `:646-649`. Four resolution routes:

1. No flags/env (the routed case): fires iff `/home/vgpnk/Projects/shokunin/.ufo/reports` is missing/not-a-dir — **cwd-independent**.
2. `--reports-dir DIR`: fires iff `resolve(DIR)` is not a dir (`:247`). Relative `DIR` → **cwd-dependent**.
3. `KUMITATE_REPORTS_DIR`: same as (2) (`:289`).
4. `--main-repo`/`KUMITATE_MAIN_REPO` without a reports flag: fires iff `<resolved main-repo>/.ufo/reports` is not a dir (`:290`); a relative main-repo is resolved at `:247` → **cwd-dependent**.

Observed proof of the cwd-mediated route (cwd `/tmp`):
- `--round 34 --reports-dir .ufo/reports` → `ROUND_GATE: FAIL-CLOSED (REPORTS_DIR_MISSING) --reports-dir /tmp/.ufo/reports is absent`, exit 2.
- `--round 34 --main-repo .` → same token, `--reports-dir /tmp/.ufo/reports is absent`, exit 2.

Contrast (directory present, round absent) — NOT this token: `--round 999` from `/tmp` →
`ROUND_GATE error REPORT_MISSING <reports>/round-999/kumitate.md` plus `SCORECARD_ROW_MISSING`/`LOG_ENTRY_MISSING`, exit 1 (`:339-343`).

## 4. Origin of the routed claim: stale hardcoded path (round 17), not cwd

The claim matches the pre-repair constants, removed in `c860887` (round-17):
`git show c860887 -- scripts/round-gate.mjs` →
```
- *   --main-repo   KUMITATE_MAIN_REPO   else /home/vgpnk/projects/shokunin
- *                 /home/vgpnk/projects/shokunin/.ufo/reports
-const DEFAULT_REPORTS_DIR = '/home/vgpnk/projects/shokunin/.ufo/reports';
-const DEFAULT_MAIN_REPO = '/home/vgpnk/projects/shokunin';
+const DEFAULT_MAIN_REPO = resolve(HERE, '..', '..');
+const DEFAULT_REPORTS_DIR = join(DEFAULT_MAIN_REPO, '.ufo', 'reports');
```
Failure cause was the lowercase `projects` literal going stale after the move to `~/Projects`:
`LOG.md:934-938`, `SCORECARD.md:1406-1410`, `corpus/lessons/round-17.md:128-132`,
`corpus/knowledge/round-close-gate.md:34-37` (“the pre-move literal `/home/vgpnk/projects/shokunin` went stale and fail-closed `REPORTS_DIR_MISSING`”).
No file under `.ufo/waves/round-35/baseline/` contains the token (`grep -rl` hits only
`build-spec.json`/`build-dispatch.json`, i.e. this task's own text).
[INFERENCE] The routed report was produced against a pre-`c860887` checkout or copied from the round-17 finding; the specific source artifact the router read is not identifiable from the repo.

## 5. Checklist item “Round-close artifact audit” (SKILL.md:623) — cwd dependence

Item: `- [ ] Round-close artifact audit — `node scripts/round-gate.mjs` → exit 0 + `ROUND_GATE: CLEAN`` (`SKILL.md:623`; preamble `SKILL.md:611-613`: every item “runs from this repo's root”).

- **Invocation path: cwd-dependent.** The command uses a relative script path. From `/tmp`,
  `node scripts/round-gate.mjs` dies in `node:internal/modules/cjs/loader` (module not found), i.e. exit 1 and no verdict line — the item fails for the wrong reason unless cwd is the lane root.
- **Audit semantics: cwd-independent.** Once the script is found, its `--repo`/`--main-repo`/`--reports-dir`/`--round` defaults are derived as in §2; absolute-script runs from all three cwds gave byte-identical verdicts and resolved paths.
- **Executed via the checklist harness: cwd-independent by construction.**
  `scripts/surface-probe.mjs:858-860` spawns each item with `{ cwd: opts.self }`;
  `:130` `DEFAULT_SELF = resolve(HERE, '..')` (this lane repo); doc `:17-18` “run each command with cwd = repo root”.
- **Frozen baseline corroborates PASS:** `.ufo/waves/round-35/baseline/checklists.txt` →
  `CHECKLIST PASS SKILL.md:623 exit=0 expected=0 substring=hit — Round-close artifact audit`
  (aggregate `CHECKLIST: 9/13 pass`, `VERDICT: FAIL`; failures are :620 sighting, :625 proxy, :627 claims, :628 kimi census — unrelated to cwd).

## 6. Residual unknowns

- [INFERENCE] The route by which a round-17-era failure was surfaced as a live “routed report” in round 35 is unverified; nothing in the frozen baseline or wave dir reproduces it.
- The default derives the main repo as the lane repo's **parent**. Moving the lane repo out of the main repo would regenerate the same token class without any cwd change — a latent naming coupling, not a cwd defect.
- All cwd claims above are observable with `--json` `repo`/`reportsDir`; `mainRepo` is only visible via `--tracked --json` or a fail-closed body, so its default value is confirmed from source (`:142`) rather than the audit-mode payload.
