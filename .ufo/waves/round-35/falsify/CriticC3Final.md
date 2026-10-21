ATTACK C3 (coverage:kimi-layer K1 3→4, root mcp.json) verdict=holds defects=1

## Reproduction (all L1 numbers verified, none taken on faith)

- `node scripts/kimi-census.mjs` → `KIMI_CENSUS: CLEAN (members=51 checked=51 chain=7 info=4)`, K1 family members=4 frozen=4, exit 0. DRIFT→CLEAN transition confirmed against round-34 record (master `SCORECARD.md` `## Planned` round-35 item 1 states the UNLISTED disposition; baseline `LOG.md:1450`).
- `node scripts/kimi-census.mjs --selftest` → `KIMI_CENSUS_SELFTEST: 48/48 pass` (claimed 45→48; round-34 log line 1446 records the prior 45).
- `node scripts/proxy-check.mjs --src /fast/scratch/kumitate-r35/src` → `PROXY: MATCH (… K=51/51 coverage:kimi-layer=10 …)`. The lone `PIN_UNPINNED` warn (sources-check.mjs) is pre-existing in `baseline/proxy.txt:9`, unrelated to C3.
- `strace -f -e trace=open,openat,openat2 node scripts/kimi-census.mjs | grep -c mcp.json` → `0`; stat-family count → `2`. Claimed "0 opens, 2 stat-family" reproduces exactly.
- `stat ~/.kimi-code/mcp.json` → `644 regular file` (249 B); the note's recorded observation (kimi-mcp-plane.md:96, mode=644 size=249) matches the live tree.
- `grep -n "readFileSync|openSync|createReadStream" scripts/kimi-census.mjs` → only the header's negative statement. No content read path exists for `mcp.json` anywhere in the gate: MEMBERS row (scripts/kimi-census.mjs:108) is `secret: true`, presence checked via `lstatSync` kind only; proxy's `kMembers` (scripts/proxy-check.mjs:643-647) uses `lstatKind`, never opens. No symlink-follow path (`lstat`, not `stat`).

## Pre-registration match (master `SCORECARD.md` `## Planned` round-35 item 1)

Declared: K1 3→4, shape-only "presence + kind + mode floor, the server.token pattern; never content-read", tool + stanza + `## Axes` travel together, target 51/51 ⇒ 10, falsifiers = census not CLEAN / any content open / K_sections ≠ 51. Landed: MEMBERS row added (kimi-census.mjs:108), FROZEN K1 3→4 (:147), proxy K1 rule (:352), Axes row (:317), K1 registry cell (:143), mcp-plane note binds via `## \`~/.kimi-code/mcp.json\`` heading (kimi-mcp-plane.md:21) — `kMembersNamedByHeading` resolves the backticked span to member identity `mcp.json`, live K_sections 51. Exact match; no slipped scope. All three declared falsifiers fail to fire.

## 0400 floor vs the server.token pattern (0600) — honest, weaker, recorded

- The pre-registration named the *pattern* (shape-only, floor bitmask, stat-only), not the floor value. 0400 = owner-read minimum; defensible for a config file the tool must read (server.token's extra 0200 is owner-write). A 0600 floor would pass identically on the live 0644 file, so the floor choice changes nothing observed.
- Both floors are bitmasks (`mode & floor === floor`), so neither detects the interesting loosening (0644 world-readable already passes both). The real limitation is floor semantics, not the 0400 choice — and it is recorded verbatim in `## Limits` (d) (SCORECARD.md:1071-1073) and kimi-mcp-plane.md:101-103. "Honest" question answered: yes; the round disclosed what a critic would file.

## Score held at 10 — is it an axis move?

Registry-change move: numerator and denominator both +1 (50/50 → 51/51), integer held at 10, drift resolved (UNLISTED→member). The round-34 pre-registration itself declared "target is 51/51 ⇒ 10", so holding at 10 was the registered acceptance, not an after-the-fact claim. The lane convention treats the registry membership + bound section as the coverage unit; a red UNLISTED child converted to a gated member is a real coverage gain even at constant score. Not an inflation: the denominator grew by the same member.

## Counterexamples tested

- Absent mcp.json → MEMBER_MISSING (selftest arm, 48/48 passed; members=50 checked=50).
- Directory at mcp.json → SHAPE_DRIFT "declared file, live dir … non-directory leaf" (selftest).
- FIFO at mcp.json → CLEAN without open; a read would block — proves stat-only end-to-end, not by code reading (selftest, mkfifo executed in suite).
- Symlink/socket at mcp.json → passes `kind !== 'absent' && kind !== 'dir'`. Accepted shape hole — already in Limits (d), so a known tradeoff, not hidden. Also contradicts the claim cell's "kind file" wording.

## Defects

1. corpus/knowledge/kimi-mcp-plane.md:93 — prose says "kind regular file" while the enforced pin is "non-directory leaf" (accepts symlink/FIFO/socket); the same note's Limits clause (:102) discloses leaf-presence, so this is internal inconsistency, not concealment. Claim cells (SCORECARD.md:143, :317 "kind file") inherit the same looseness. Minimal fix: s/kind regular file/kind non-directory leaf/ in the note; optionally "kind leaf" in the two claim cells. Does not change any gate, count, or verdict — a tradeoff the canonical judge may accept as recorded.

## Tooling

No installs. Used: node (lane gates), strace, stat — all preinstalled.
Report: .ufo/waves/round-35/falsify/CriticC3Final.md
