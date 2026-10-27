VERDICT: Every assigned confinement arm holds — symlinked corpus/lessons and symlinked SOURCES.md fail closed EXTRACTION_UNSAFE exit 2 with strace-proven zero read-through, the walk net catches fifo/socket (top and nested) and never descends symlinked dirs, absent files degrade to plain MISSes, and NODE_OPTIONS self-rerun yields ENV_POISONED exit 2 on both counters — while five contract-text deviations were found (all fail-closed in outcome, none a false PASS), each with a strengthening ratchet patch proposed.

## Evidence
Scratch `S=/fast/scratch/hyaku/kumitate-r68/K68ReviewConfinement` (deleted on exit; cited logs copied to build dir). Fixtures `fx.*` under S; every commit preceded by `git -C "$D" rev-parse --show-toplevel` = "$D" (TOPLEVEL_OK observed); identity via `-c user.name=revconf -c user.email=revconf@invalid` on the commit call; all probe runs `TMPDIR=$S`. No tool installs (2026-10-19 authorization unused). Revs quoted are full fixture-repo HEADs.

Arm 1 — `corpus/lessons` symlink → outside dir holding a copy of the real round-55 spotcheck; rev 2128f180f2874be59acfa8f36e8298fadba7bcde:
`TMPDIR=$S strace -f -qq -e trace=openat,readlink,newfstatat,statx -o $S/strace-a.log node .../ledger68-probe.mjs $S/fx.a HEAD`
→ `LEDGER68_UNMET held=0/7 checks=7 rev=2128f180f2874be59acfa8f36e8298fadba7bcde rule=L68 | EXTRACTION_UNSAFE`, FIXA_EXIT=2.
`grep -c "outside-a" strace-a.log` → **0** (target never read); `grep -c "corpus/lessons"` → 19; strace-a-full.log:505 `statx(...archive/corpus/lessons, AT_SYMLINK_NOFOLLOW, ... stx_mode=S_IFLNK|0777)` — lstat-only, never opened through.

Arm 2 — ENTRY a regular file, `corpus/SOURCES.md` symlink → outside populated SOURCES.md (119802 bytes, real lane copy); rev f2570c64b08b235d27249b34133395381fae35b6:
`... deprec68-probe.mjs $S/fx.b HEAD --no-live` → `DEPREC68_UNMET held=0/10 checks=10 rev=f2570c64b08b235d27249b34133395381fae35b6 rule=M68 | EXTRACTION_UNSAFE`, FIXB_EXIT=2. `grep -c "outside-b" strace-b.log` → **0**; `grep -c "corpus/SOURCES"` → 7.

Arm 3 — walk() harness (`walkharness.mjs`, logic byte-equivalent to the probes' walk): `walk(c1) -> c1/pipe` (fifo top), `walk(c2) -> c2/sub/deep_pipe` (fifo nested), `walk(c3) -> c3/sock` (unix socket); `walk(c4) -> null` (symlink-to-dir NOT descended; lstat: isSymbolicLink=true, isDirectory=false); `walk(c5) -> null` (symlink-to-file tolerated by walk). Gitlink arm: `git -C fx.gl archive HEAD | tar -x --no-same-owner --no-same-permissions -C exdir` → TAR_EXIT=0, mode-160000 entry materializes as an EMPTY DIR `sub/` — a git object stream cannot carry fifo/socket/dev; the walk is the defense-in-depth net and detects each.

Arm 4 — chainSafe absent-component path (`ledger68-probe.mjs:105` `try { st = lstatSync(cur); } catch { return true; }`): absence = plain MISS, never unsafe, never a pass.
- FIX-D1 ledger, only round-55 spot present, no tool; rev 244ee4b1ced9b33440fa26590155207a45e9adbb → `LEDGER68_UNMET held=1/7 ... rule=L68 seed=557805e68f64f45a | L1 MISS tool-absent | L2 MISS tool-absent-or-symlinked | L3 MISS 7 problems: ledger-empty-or-absent,unledgered:55#1,...` FIXD1_EXIT=1.
- FIX-D2 deprec, entry head only (SOURCES/pins/PROVINCE absent); rev 6be4712abc381234bd7246325b1c976c75860850 → `DEPREC68_UNMET held=2/10 ... M2 MISS cited=3 S207:row-absent,... | M9 MISS census-exit=2,...,province-entry-not-named` FIXD2_EXIT=1 (M1+M10 pass).

Arm 5 — NODE_OPTIONS preload (`preload.cjs` = `process.env.FORGED="1";`), real lane at base d23892ad44b41e1af63b3edb949d265ca1dd812d:
ledger → `LEDGER68_UNMET held=0/7 checks=7 rev=unknown rule=L68 | ENV_POISONED:NODE_OPTIONS` EXIT=2; deprec (+ `--no-live`) → `DEPREC68_UNMET held=0/10 checks=10 rev=unknown rule=M68 | ENV_POISONED:NODE_OPTIONS` EXIT=2; bogus lane + dead rev + NODE_OPTIONS → same ENV_POISONED exit 2 (preamble precedes arg/rev handling; ledger :54-57, deprec :59-62).

Tolerance arm (declared: symlinks off read paths tolerated): fixture with ONLY `README.md` → outside file; rev 72ae380a360bba199a528a70196dcc9c540f5788 → `LEDGER68_UNMET held=1/7 ... | L1 MISS tool-absent | L2 MISS tool-absent-or-symlinked | L3 MISS 4 problems: ...` FIXT_EXIT=1 — normal scoring, NO EXTRACTION_UNSAFE.

Baseline anchors cited from committed receipts (not re-run): `base/ledger68-base.txt` `held=1/7 ... L1 MISS exit=0 line=ROUTED_LEDGER_SELFTEST: PASS (33/33)` exit 1; `base/deprec68-base.txt` `held=1/10 ... M9 MISS readme-map-exit=1,province-entry-not-named` exit 1.

## Findings
**K68ReviewConfinement-1** (medium-low, ledger): a DANGLING symlink at an L6 static read path (SKILL.md; QUALITY/SCORECARD share the guard) exits 1 as plain `L6 MISS` instead of the declared fail-closed `EXTRACTION_UNSAFE` exit 2 (rule L7 + docstring :31-32). The sweep's guard `existsSync(ap) && !chainSafe(ap)` (:280) is false for a dangling link, and UNSAFE is set only later, by L6's rd (:399), after the sweep (:276-284). Outcome still fail-closed (chainSafe refused the read). Contrast — FIX-D3A dangling, rev 9949aab1d31e4880f215148d725fe8072d2c178b: `LEDGER68_UNMET held=1/7 ... | ... | L6 MISS skill-row=false quality=false capability-row=false` FIXD3A_EXIT=1; FIX-D3B existing target, rev 91f06959fcd6591ab21ae86ec41cc23d53c8db90: `LEDGER68_UNMET held=0/7 ... | EXTRACTION_UNSAFE` FIXD3B_EXIT=2. Repro: `D=$S/fx.d3a; ln -s $S/no-such-skill-target $D/SKILL.md; commit; TMPDIR=$S node ledger68-probe.mjs $D HEAD`. → patch P1: lstat-based `pathUnsafe` + hoist sweep.

**K68ReviewConfinement-2** (medium-low, ledger): the fail-closed sweep runs AFTER L1 executes the archive's tool — revision-controlled code ran before the EXTRACTION_UNSAFE exit, contra the rule's "before any check". FIX-A2B rev 4522739ffd6c6af9aa1a72c6c1b00718d65ae35b (corpus/lessons symlink + tool stub printing `ROUTED_LEDGER_SELFTEST: PASS (44/44)` and writing a canary): verdict `LEDGER68_UNMET held=0/7 ... | EXTRACTION_UNSAFE` FIXA2B_EXIT=2 AND canary content `executed-before-fail-closed`. Spawn at :200 precedes sweep at :276. Mitigations already present: env allow-list + 300s timeout; the tool is L1's legitimate subject. → P1 hoist makes it literal.

**K68ReviewConfinement-3** (medium-low, deprec): same dangling-symlink deviation at PROVINCE.md, a static read path NAMED in rule M10/docstring :34. FIX-D4A dangling, rev 50601f86416aafe7b104df038fe112b5f80d4393: `DEPREC68_UNMET held=1/10 ... M9 MISS census-exit=2,sources-check-exit=1,source-capture-exit=1,readme-map-exit=1,province-entry-not-named` FIXD4A_EXIT=1; FIX-D4B existing target (file naming mcp-deprecation-registry), rev 82217c2ab359a92fa207437a8cccc5be2d63a6db: `held=0/10 ... | EXTRACTION_UNSAFE` FIXD4B_EXIT=2. Guard :214; late rd in M9. → P2 (same pathUnsafe, sweep hoisted above M1).

**K68ReviewConfinement-4** (low, deprec): docstring :39 claims exit 2 "or --no-live is passed"; code exits 1 (M5 MISS `no-live`; :398 `process.exit(ok ? 0 : 1)`). Observed: base receipt `deprec68 exit=1`; FIX-D4A/FIX-D2 with `--no-live` → exit 1. → P3.

**K68ReviewConfinement-5** (low, ledger): docstring :31-32 overstates — "a revision containing any symlink or non-regular file fails closed EXTRACTION_UNSAFE" — while code + plan L7 tolerate symlinks off the read paths (proven by the tolerance arm: README symlink → normal exit 1). An auditor trusting the header mispredicts that run. → P4 doc alignment.

Verified conforming (no defect): arm-1/arm-2 fail-closed with zero target reads; walk detects fifo/socket top+nested, never descends symlinked dirs, gitlink→harmless empty dir; absent files = plain MISS on both counters; ENV_POISONED exit 2 on both counters even with a bogus lane; benign-symlink tolerance as the plan declares.

## Artifacts
- `.ufo/waves/round-68/build/K68ReviewConfinement/ratchet-proposals.md` (P1–P4, strengthening only)
- `.../strace-a-full.log`, `.../strace-a-relevant.log`, `.../strace-b-full.log`, `.../strace-b-relevant.log`, `.../walkharness.mjs`
- Report: `.ufo/waves/round-68/w1/K68ReviewConfinement.md` (this file)

## Limits
- Did not re-run the frozen counters at the lane base for full scoring (base receipts cited as committed evidence; my real-lane runs exercised only the preamble poison arms).
- Symlinked ENTRY path (deprec M1 MISS) and symlinked TOOL path (ledger L1 MISS) not re-run as external fixtures; the counters' internal L7(b)/M10(b) assert them and my arm-2 SOURCES test exercises the same chainSafe machinery.
- Symlinked capture FILE under `.ufo/captures/`: code-read only (M3 `capture-not-regular-or-symlinked`); not fixture-tested (needs a full pins/captures scaffold).
- Block/char devices not materialized in the walk harness (needs root); they share the tested predicate with fifo/socket.
- strace traced openat/readlink/newfstatat/statx only; a read-through would still require an openat on the target — 0 observed.
