VERDICT: Both frozen counters hand operator privileges to caller- and revision-controlled input — a shell-injected `<lane>` path (both), inherited `BASH_ENV`/`TAR_OPTIONS`/`NODE_OPTIONS` (both), archive bytes executed as the operator (P1 even scores PASS on them), `..`/symlink reads that escape the extraction dir, and a J5 `curl` that honours host config and non-HTTP schemes; the demo's real host defect is inherited `GIT_DIR`/git-config (its `git init` reinitialises a host repo before the guard and copies host template hooks), which a scrubbed re-exec closes with all 15 keys byte-identical — every finding reproduces from one script, and none is patched by me (probes/controls frozen).

## Evidence

One command, all 12 findings, exit 0, ~13 s, no lane/fleet/HOME writes:
`bash .ufo/waves/round-64/build/K64SentinelDemoHost/repro.sh` — per-finding output quoted below.
Host: `git 2.56.0`, `jj 0.45.1-7c41cdeb16b6b321c64e789a966b6adf723816a5`, `tar (GNU tar) 1.35`, `node v24.21.0`,
`/usr/bin/bwrap`, unprivileged userns enabled (`/proc/sys/kernel/unprivileged_userns_clone` = 1).
Lane HEAD before and after every run: `dd1a3e6f19dc82c54ef67864c9ba87e4eb7c24ef`. Nothing was written outside `/tmp`
fixtures, my build dir and my report; I made no `jj` call, no lane git write, no pacman/uv/npm install.

Checked and **holds** (the ticket's specific worries that are NOT reachable):
- `rm -rf "" ""` / wildcard delete: **not reachable**. `set -u` (`scripts/jj-seat-demo.sh:7`) makes the trap abort before
  `rm` on an unset `$D`/`$S`. With `TMPDIR=/nonexistent` and with a `mktemp` stub failing on its 2nd call, an `rm` stub
  logged **zero** invocations; both runs printed `JJ_SEAT_DEMO: FAIL-CLOSED mktemp` exit 2.
- "TMPDIR makes `$D` a parent dir": **not reachable** — `mktemp -d` always appends `tmp.XXXXXXXXXX`; `TMPDIR=$HOME` left
  0 entries under HOME (`exit=0  leftovers under $HOME: 0`).
- Demo writes outside fixtures: **none** — an isolated `HOME`/`XDG_*`/`TMPDIR` run created nothing but dirs I pre-made;
  the hardened draft leaves `leftover entries under TMPDIR: 0`.
- Do-nothing control: `--no-hardlinks` (`:9`) + `rev-parse --show-toplevel = $C` guard (`:11`) **before** the checkout
  (`:12`), commit only inside the clone (`rev=3aaffa17d00791be1a36765f3cbf0eea5f457041`, local). Ordering is correct;
  its hole is host git config (finding 6), not the clone.
- Demo's jj side is **well hardened**: `JJ_CONFIG=/dev/null` (`:10`) + `--config` flags; a hostile `~/.jjconfig.toml`
  (`ui.pager = 12345`) never reached jj (demo exit 0, `DONE`). Load-bearing today: `/home/vgpnk/.config/jj/config.toml` exists.
- Counters never write the lane: writes only into `mkdtempSync(tmpdir())` (`scripts/report-receipt-diff.mjs:109-117`, rm at :150).
- `tar`-through-symlink escape is **not representable**: git refuses `esc/written` under symlink `esc`
  (`error: failed to redirect to …/esc/written`), so the archive cannot write outside `T`; only reads escape (finding 4).

## Findings

**K64SentinelDemoHost-1 — HIGH — command injection through the `<lane>` argument, both counters.**
`jj64-probe.mjs:52` / `receipt64-probe.mjs:43` interpolate `lane` into `bash -c "git -C \"${lane}\" archive … | tar -x …"`.
A directory/symlink name containing `$(…)` executes with the counter's privileges.
`ln -s <clone> '/tmp/x/a$(touch PWNED)b'; node receipt64-probe.mjs '/tmp/x/a$(touch PWNED)b' dd1a3e6f` → PWNED created,
same for `jj64-probe.mjs`. Fix: drop the shell (build/probe-hardening.patch.txt F1). `rev` is not injectable (hex from
`rev-parse`); `--fleet`/`--report`/`--entry` never reach a shell.

**K64SentinelDemoHost-2 — HIGH (standing boundary) — archive bytes run as the operator, and P1 trusts them.**
`receipt64-probe.mjs:88` runs `node <T>/scripts/report-receipt-diff.mjs --selftest`; `jj64-probe.mjs:197` runs
`bash <T>/scripts/jj-seat-demo.sh`; `:213` runs `node scripts/readme-map.mjs` with `cwd=T`; `:208` feeds archive data to
the fleet census. A measured revision that ships a tool writing a beacon and printing `REPORT_RECEIPT_SELFTEST: PASS
(20/20)` gets **both** effects: `VULN the measured revision's scripts/report-receipt-diff.mjs ran with operator
privileges` / `VULN P1 scored PASS on bytes the measured revision supplied`. Nothing bounds this by default. Bound that
works (verified, build dir): `run-frozen-counter.sh <lane> <rev> jj64 --no-live --sandbox` reproduced the identical
verdicts and a write outside the run root failed: `touch: cannot touch '/home/vgpnk/…': Read-only file system`.

**K64SentinelDemoHost-3 — MEDIUM-HIGH — the whole environment rides into every child.**
`BASH_ENV` is sourced by the counters' `bash -c` and by `bash scripts/jj-seat-demo.sh` at `:197`; `TAR_OPTIONS=
--checkpoint-action=exec=…` fires during `tar -x` in **both** counters (beacon created); `NODE_OPTIONS=--require` fires
in every node child. Repro: repro.sh F3. Fix: call-site scrub (verified wrapper) + `{env:{PATH}}` per spawn (patch F3).

**K64SentinelDemoHost-4 — MEDIUM — reads escape the extraction dir, so "lane bytes come from git archive" is false.**
`rd()` = `readFileSync(join(T, rel))` (`jj64-probe.mjs:54`) follows symlinks and normalises `..`. Proven twice:
`--entry ../../…/outside.md` (outside `T`) made **J1 pass**, and a measured revision committing
`corpus/knowledge/jj-workspace-seat-containment.md` as a symlink to an outside file also made **J1 pass**. Same path for
pin `path` values (J3). Content is compared, not printed → membership oracle; J2/J4/J5 MISS strings echo
attacker-derived fields. Fix: prefix + `lstat` guard (patch F4).

**K64SentinelDemoHost-5 — MEDIUM (latent today) — J5's live fetch is host-configured and scheme-blind.**
`jj64-probe.mjs:171` = `curl -fsSL --max-time 90 --retry 2 -A 'Mozilla/5.0 (kumitate-jj64)' <url>`. No `-q`, so
`~/.curlrc`/`CURL_HOME` applies (proven: body redirected, stdout 0 bytes); no `--proto`, so `file:///etc/hostname` is
fetched and matched (proven); no `--max-redirs`, no byte cap; the URL is untrusted bytes from `SOURCES.md`, so `-L`+http
reaches localhost services [INFERENCE from `-L`/curl semantics, no listener started]. Credentials: none sent (no
`-n`/`-u`/`-H`); the UA only fingerprints the harness. `~/.curlrc` absent on this host.

**K64SentinelDemoHost-6 — MEDIUM — the do-nothing control executes the operator's git config.**
`jj-donothing-control.sh:16-17` (`git add -A`, `git commit`) run under the host config: with `core.hooksPath` set, the
host `pre-commit` ran — `HOST-HOOK-FIRED pre-commit cwd=/tmp/tmp.BxIxaX9hvy/c`. `init.templateDir`, `include.path`,
`commit.gpgsign` reach the clone too. All unset on this host (global config is `/home/vgpnk/.config/git/config`), so
latent. Fix: `env -i … GIT_CONFIG_GLOBAL=/dev/null` at the call site, or `-c core.hooksPath=/dev/null` on the commit.

**K64SentinelDemoHost-7 — MEDIUM — inherited `GIT_DIR` defeats the demo's fixture-root guard and reinitialises a host repo.**
`jj-seat-demo.sh:16` runs `git -C "$D" init -q` **before** the guard at `:17`, and with `GIT_DIR=/abs/victim/.git` the
guard still passes (worktree defaults to `-C $D`): victim `.git` went `HEAD config description objects refs` →
`… hooks info …` and the demo printed `JJ_SEAT_DEMO: DONE` exit 0. Harm needs an **absolute** `GIT_DIR` (a relative one,
as hooks export, resolves under `-C "$D"` and is benign). Fixed by the draft (verified: victim untouched).

**K64SentinelDemoHost-8 — LOW-MEDIUM — host `init.templateDir` hooks land inside the demo's fixture.**
`HOME=<hostile> git -C $F init` put `pre-commit` in `$F/.git/hooks`. The demo's own git calls never run a hook (no hook
fired under a hostile HOME), so latent — but the fixture is not hermetic and any future commit there runs
operator-configured code. Fixed by the draft (`GIT_CONFIG_GLOBAL=/dev/null` + HOME isolation).

**K64SentinelDemoHost-9 — LOW — `SOURCES_CENSUS` env override execs an arbitrary script.**
`jj64-probe.mjs:34`; `SOURCES_CENSUS=/tmp/x/census.sh node jj64-probe.mjs …` ran it and J7 accepted its `exit 0`. Fix:
drop the override or require the resolved path under the fleet repo.

**K64SentinelDemoHost-10 — LOW — a failed `mktemp` leaks the first fixture; `rm -rf` lacks `--`.**
Partial failure left `1` fixture and ran no `rm` (`:15` `rm -rf "$D" "$S"` also misparses a TMPDIR starting with `-`).
Draft uses `rm -rf --` + prefix check against the run root.

**K64SentinelDemoHost-11 — LOW (DoS) — unbounded archive extraction.** No size cap on `tar -x`: a measured rev's 32 MiB
blob (and separately 64 MiB) landed verbatim in TMPDIR. `/tmp` has 47 G free; the extraction is otherwise contained.

**K64SentinelDemoHost-12 — MEDIUM (claim-level, frozen artifact — REPORTED, NOT PATCHED) — C1's frozen controls cannot
satisfy their own P2.** `node .ufo/waves/round-64/probe/receipt64-probe.mjs <lane> dd1a3e6f…` →
`RECEIPT64_UNMET held=3/5 checks=5 rev=dd1a3e6f19dc82c54ef67864c9ba87e4eb7c24ef rule=R64 | P2 MISS ids=6 | P5
MISS report-not-given`. All 16 cases match their `expect` files, but they exercise exactly 6 distinct ids
(`HASH_DEAD PLACEHOLDER RECEIPT_MISSING SECTION_MISSING SHONEN_COUNT TALLY_UNRECEIPTED`) while P2 demands ≥ 8. The
plan's ratchet (adding cases) can close it; I did not touch `controls/` or the probe.

## Artifacts

- `.ufo/waves/round-64/build/K64SentinelDemoHost/repro.sh` — all 12 findings, one run, exit 0.
- `.ufo/waves/round-64/build/K64SentinelDemoHost/jj-seat-demo.hardened.sh` — full-file draft (re-exec under `env -i`,
  throwaway HOME/TMPDIR, `GIT_CONFIG_GLOBAL=/dev/null`, prefix-checked `rm -rf --` trap). Verified: `diff` of the
  `JJ_SEAT:`/`DONE` lines against `base/jj-seat-demo-freeze.txt` is **empty** (15 keys) both normally and under the
  hostile env that defeated the frozen script (`GIT_DIR` victim untouched; no hook/template/TAR_OPTIONS/NODE_OPTIONS
  beacon). `BASH_ENV` is read by the *outer* interpreter before any script code, so it is a call-site property —
  `env -i … bash` closes it (verified).
- `.ufo/waves/round-64/build/K64SentinelDemoHost/run-frozen-counter.sh` — call-site bound for the frozen counters
  (env scrub; `--sandbox` = bwrap: host read-only, only the run root writable, net unshared unless live). Verified
  identical verdicts with and without `--sandbox`.
- `.ufo/waves/round-64/build/K64SentinelDemoHost/probe-hardening.patch.txt` — patch text for the frozen probes
  (NOT applied; frozen at dd1a3e6f).

## Limits

Did not run the counters' live J5 fetch against real row URLs (no entry exists yet; SSRF is marked INFERENCE). Did not
test a malicious *measured* revision beyond the P1 tool and the symlink fixture, nor the census script's handling of
hostile `SOURCES.md`. Did not exercise `--report` (P5) or the tool's own host-safety beyond reading its write sites
(`:109-117`, `:150`). `bwrap` was verified on this host only; no seccomp/cap-run bound (`cap-run` absent). No tool was
installed or upgraded. Frozen files (`probe/*`, `controls/`, `base/`, `plan.md`) were read and copied only.
