# K64ReviewProbeC2 — repro bundle for jj64-probe.mjs review

Frozen counter: `.ufo/waves/round-64/probe/jj64-probe.mjs` (pin sha256 157be0ac…d594e9e98 per `.ufo/pins/counter-pins.json`).
Attack fixture (untracked, scratch): `/tmp/kumitate-r64/K64ReviewProbeC2/fixture`, commits
`7a0f3a73c46f2f679b5ace343e79da9e76a3824e` (clean-look forgery) and `6d15f0973259ef83d23ed59e9f71a910ba01b473` (+dup S199 row).

## Reproduced verdicts at fixed revisions

1. `cd /tmp/kumitate-r64/K64ReviewProbeC2/rightcwd && node fixture/.ufo/waves/round-64/probe/jj64-probe.mjs fixture HEAD`
   → `JJ64_UNMET held=7/8 … | J8 MISS file-unreadable` (J3/J4/J5/J6 all PASS) at rev 7a0f3a73:
   - J3 S198 "capture" = pin path `../kumitate-r64/K64ReviewProbeC2/www/host-capture.txt` — a host file OUTSIDE the commit.
   - J4 quote `"**"` normalises to `""`; `t.includes("")` is true → vacuous bullets count toward the >=4 floor and per-row floor.
   - J5 same vacuous quotes pass a real live fetch (python http.server on 127.0.0.1:8873 serving the capture bytes).
   - J6 demo = 16 lines of `echo "JJ_SEAT: k=v"`; no jj, no git, no fixture — passed set-equality.
   - J8 MISS is only because the fixture repo cannot contain lane base 6825a514; J8 itself is not the bypassed leg.
2. Same rev, `cd …/wrongcwd` → `J6 MISS probe_cwd:stated=rightcwd:live=wrongcwd` — demo inherits CALLER cwd (spawnSync lacks cwd:T while J7's readme-map run has cwd:T).
3. Same rev, mutate host file post-commit → `J3 MISS S198:hash-or-size` — the counter measured non-committed bytes.
4. `scripts/jj-seat-demo.sh` committed as symlink → `/tmp/…/hostscript.sh`: probe executed the host file; editing it post-commit changed the verdict at the same rev.
5. `SOURCES_CENSUS=/tmp/kumitate-r64/K64ReviewProbeC2/true-census.sh` (body `exit 0`) at rev 6d15f097 (real census reports `E03 S199 duplicate id`, exit 1) → `J7 MISS` under real census becomes J7 PASS under the env stub.
   (`SOURCES_CENSUS=/bin/true` gives census-exit=126 because the counter runs it via `bash` — a script is required.)
6. `git -C kumitate-shokunin archive` + `tar -x` extracts committed symlinks; `rd()`/`join(T, c.path)` follow both symlinks and `..`, so nothing in J3/J6 is confined to committed bytes.
7. Parity: `node …/jj64-probe.mjs kumitate-shokunin 6825a514… --no-live` → `held=0/8`, identical miss list to `base/jj64-base.txt` (exit 1).

## Regex/matcher facts (node -e repros in report)
- stated `- k=v   ` → value `v`; live `JJ_SEAT: k=v   ` → `v   ` (trailing-space values are unrepresentable → permanent J6 MISS).
- live `JJ_SEAT: k=v\r` matches NOTHING (`.` excludes `\r`, `$` can't anchor before it) → CRLF demo output → stated-not-live MISS.
- keys must match `[a-z0-9_]+`: `seatCount`, `seat-count` silently dropped from both parsers (plan says `<key>` unqualified).
- `### ` is not a section terminator (`/^##\s/`) → bullets under `###` inside `## Located quotes`/`## Demo outcomes` are counted.
- duplicate stated keys: Map last-wins, `stated.size` counts unique keys.
- `- S198 – "q"` (en-dash) matches nothing; only `—` and `-` accepted.
- `- S198 — "say "hi" ok"` captures `say "hi" ok` (greedy `.+` spans inner quotes).
- `- abandoned: <entry path>` passes J7's `named` test because `abandoned` contains substring `band`.
- `verified-at: 2026-10-25xyz` passes J1 (`verified-at` regex not end-anchored).
- `used-by` cell `jj-workspace-seat-containment.md.bak` passes J2 (`includes`, not cell-token equality).
- J5 takes only the FIRST URL in a source cell; the regex includes a trailing `.` → `…/x.txt.` 404s → false live-unreachable MISS.
- spawnSync no maxBuffer for the demo: default 1 MiB → >1MiB stdout → `ENOBUFS`, r.status null → `demo-exit=null` MISS (plan assumes output is read).
- demo timeout 120 s → SIGTERM → status null → MISS (fail-closed, fine) but orphan grandchildren can linger.
- J8: `tail.includes(ENTRY) && /\bM7\b/` scans ALL appended bytes, not the amendment section → `…entry…M7\n\n## Amendment 2026-10-25\n(empty)` passes. Section-containment is not enforced.
- J8 measured bytes = `git archive` (attributes applied) vs `git show` (raw): LF blob + `*.md eol=crlf` at tip → archive exports CRLF → honest append reads `base-bytes-not-a-prefix`. Also `$Format:%H$`/`export-subst`/`export-ignore` similarly desynchronise the two reads.

## Control script notes
- `jj-donothing-control.sh` line 19 `|| true` swallows the probe's exit 1 → `base/jj64-donothing.txt` records `exit=0` while plan line 92 states `exit 1`. Recorded receipt shape inconsistent with `jj64-base.txt` (`exit=1`).
- Control reads the staged entry from mutable `/home/vgpnk/Projects/shokuknow/…/jj-seat-staleness-outcome-2026-10-25.md` (verified-at 2026-10-24 → explains `verified-at=false` in the receipt); re-running the control later can change its output.
- bullets.length < 4 change vs T63's < 6: consistent with plan J4 `>= 4`; NOT a defect.
- J2 code adds `tier === ''` MISS not stated in plan (stricter; benign direction, note only).
