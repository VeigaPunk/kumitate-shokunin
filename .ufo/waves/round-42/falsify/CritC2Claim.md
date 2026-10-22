RESULT CritC2Claim rev=c9a084bf03fb043d3cce5da102fffbc023552a45 verdict=weaker objections=6

Scratch clone /fast/scratch/hyaku/kumitate-r42/falsify/CritC2Claim/lane, detached at c9a084bf (commands run there unless named). Fixtures under ../fx were built by ../mkfx.mjs, which copies the census `fixtureTree` shape and adds `locks/sessions`. No tools were installed. No mutants were run, no background jobs were started, and no lane file other than this report was written. The only live reads were `stat` and `find | wc -l` on ~/.kimi-code/locks (shape only).

1. Attacks "C2 is an improvement on coverage:kimi-layer". The axis integer did not move, and the axis instrument cannot see the change. The proxy at open read `{"K_members":52,"K_sections":52,"coverage_kimi":10}`. At c9a084bf, `node scripts/proxy-check.mjs --src /fast/scratch/hyaku/kumitate-pin/src | tail -1` gives `PROXY: MATCH (… K=53/53 coverage:kimi-layer=10 …)`. That is ratio 1.0 before and after. The judge admits a round only if an axis improves (SKILL.md:355, `gate.rs:15`). The only counter that moved is the census stray count, and that count went 0 → 1 because of host drift: the Kimi Code 2.3.0 install at 16:48Z, with `locks` born at 16:53:33Z (knowledge lines 410-412). So C2 puts back a CLEAN census that already held at round 40 (52/52, CLEAN). Impacted axis: coverage:kimi-layer. Correction: in `## Per-axis verdicts`, key C2 as `unprovable-but-better` (or `unchanged`), not `improved`. Do not treat the round as having moved two distinct axes.
2. Attacks the claim that the member is declared "in both hand-kept lists". There is a third authority, and it is stale. SCORECARD.md:145 still reads K3 = `sessions/` … `search-index` (9), with no `locks/`. `git diff dfabe92 c9a084bf -- SCORECARD.md | grep -E '^[-+]\| K3'` prints nothing, so the row was not touched. The census header (kimi-census.mjs:6-7) says the K1–K5 rules "in SCORECARD.md" are the frozen source. Nothing catches the gap: `grep -cE "'K[1-5]'|K3|kimi" scripts/claims-check.mjs` → 0, and `node scripts/claims-check.mjs` → `CLAIMS: MATCH (rows=19 …)`. Correction: update the K3 row to `locks/` … (10).
3. Attacks "0700 mode floor, secret-class handling". The floor cannot catch a loosened directory. On a fixture, `chmod 0777 fx/loose777/locks; node scripts/kimi-census.mjs --root fx/loose777 | tail -1` → `KIMI_CENSUS: CLEAN (members=53 checked=53 chain=3 info=4)`, exit=0. With `locks/sessions` at 0777 the result is also CLEAN, exit=0. `grep -cE '\.uid|\.gid|getuid' scripts/kimi-census.mjs` → 0, so the owner is never pinned either. S041 line 196 creates the directory with `mode: 0o700`, and a world-writable lock directory lets another local user plant or remove lock files. The census header line 11 says the gate catches "a secret path can loosen". For `locks/` that is false. The selftest only tests tightening (0500, kimi-census.mjs:632-636). Correction: give `locks/` a ceiling, `(mode & 0o077) === 0`, plus a 0777 selftest case.
4. Attacks "census CLEAN hides nothing". Everything below `locks/` is dark, including the one fixed-name child. Every fixture variant below read `KIMI_CENSUS: CLEAN (members=53 checked=53 chain=3 info=4)` with exit=0:
   - `locks/sessions` removed (`nosess`);
   - `locks/sessions` replaced by a file (`sessfile`);
   - `locks/sessions` as a symlink to /tmp (`sesslink`);
   - `locks/rogue/` plus `locks/payload.sh` (`lockrogue`).
   The knowledge section gives the reason "child set is not gated because lock file names are per session" (line 443). That reason covers the lock files but not the fixed name `sessions`. S042 attaches its purpose quote to the `locks/sessions/` node, not to `locks/`. Wave-1 ReviewKimiRegistry finding 3 measured a working nested-member variant (`MEMBER_MISSING locks/sessions/` when it is replaced by a file), but it was not adopted, and the lesson's open limits do not name the gap. Correction: add a stat-only kind and mode pin on `locks/sessions` (with the counts rebased), or name the gap as an open limit.
5. Attacks "the section is bound by its source (A2)". An unsourced stub passes every counter. I replaced the locks section body with `TODO.`, so `grep -c S041` dropped to 0. The results:
   - proxy `{"v":"MATCH","t":{"K_members":53,"K_sections":53,"coverage_kimi":10},"f":[]}`, exit=0;
   - `node scripts/sources-check.mjs` → `SOURCES_CHECK: CLEAN (rows=45 …)`, exit=0;
   - census CLEAN, exit=0;
   - `CLAIMS: MATCH`, exit=0;
   - cite-check `errors=722`, the same as the unmodified baseline (`errors=722 warnings=555` at c9a084bf).
   The S041 binding exists only as a hand `grep -c` line in the receipt. This repeats wave-1 CritC2Axis objection 2, which was not turned into a gate. Correction: run a checklist command that fails when the `locks` heading body lacks `S041`.
6. Attacks the knowledge section's and the lesson's provenance against S041 and S042. I opened both by plain HTTPS.
   - The tag check holds: `git/tags/e65b17b…` → commit `b5e28fd6…`, tag `@moonshot-ai/kimi-code@2.3.0`.
   - The file (sha256 acbcdd38…, 211 lines) has line 55 `this.lockDir = join(bootstrap.homeDir, 'locks', 'sessions');` and line 196 `fs.mkdirSync(this.lockDir, { recursive: true, mode: 0o700 });`. Both are verbatim.
   - The same path at the 2.2.0 tag returns http=404.
   - The S042 page returns http=200, and the quote "Cross-process occupancy locks while a client writes a session" is verbatim.
   - The lifecycle literals (`.tmp-${pid}-${uuid}` with mode 0o600, `EEXIST`, `.reclaim`, the boot-time check, `continuing without lock`) are all in the S041 file.

   Two overclaims:
   - Knowledge line 419 places "`bootstrap.homeDir` is `~/.kimi-code` unless `KIMI_CODE_HOME` is set" under "(source, S041)". `KIMI_CODE_HOME` does not appear in the S041 file. It is at bootstrap.ts:173 (`return homeDir ?? env['KIMI_CODE_HOME'] ?? join(osHomeDir, '.kimi-code');`), and S042 also states it. The claim is true, but it cites the wrong source.
   - Lesson line 62 says the S042 quote is on the "`locks/` node". On the page it annotates `locks/sessions/`, and SOURCES row S042 says so correctly.

   Correction: cite S042 for `KIMI_CODE_HOME` and say `locks/sessions/` node in the lesson.

Holds (measured):
- The live census just now gives `KIMI_CENSUS: CLEAN (members=53 checked=53 chain=8 info=4)`, exit=0.
- The live stat shows `locks` as a directory, mode 700, inode 96401346, and `sessions` mode 700, inode 96401347. `find ~/.kimi-code/locks -mindepth 1 | wc -l` → 1. This matches the identity receipt.
- A symlinked `locks` gives `DRIFT (SHAPE_DRIFT locks/)`, exit=1, and the proxy also uses `lstat` for it (proxy-check.mjs:814, 823-826).
- A hidden root child `.hidden` gives `DRIFT (UNLISTED .hidden)`, exit=1.
- Not new to C2: a directory named `config.toml.anything.bak` at the root is absorbed into the chain and reads CLEAN, `chain=4`. This was already reported by ReviewKimiRegistry finding 4.

Leftover processes: none were started, because no mutant or mutated selftest was run.
