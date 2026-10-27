VERDICT: The frozen counters' measured checks (L1–L6, M1–M9) are faithful to the plan sentences, but both self-confinement checks (L7, M10) are unsound — an unbounded recursive self-spawn with a vacuously satisfiable pass criterion — so LEDGER68_HELD / DEPREC68_HELD as frozen do not prove what L68/M68 declare; the L1 needs a strengthening re-freeze.

## Evidence

All paths absolute; lane = /home/vgpnk/Projects/shokunin/kumitate-shokunin. Scratch S=/fast/scratch/hyaku/kumitate-r68/K68ReviewProbes (deleted on exit; cited outputs copied to build/).

E1. Base receipts (frozen):
- `base/ledger68-base.txt:1` = `LEDGER68_UNMET held=1/7 … | L1 MISS … PASS (33/33) | L2 MISS … own-items=61 own-sections=12 own-spotchecks=12 | L3 MISS 68 problems: … | L4 MISS … 7/20 mutants wrong: …` (line truncated in transcript; full line in artifact of record). held=1 with L1–L4 shown missed.
- L5 forced MISS at base (L4 wrong ⇒ realL4=false ⇒ L5 MISS by code). L6 forced MISS at base, verified read-only:
  `git -C <lane> show d23892ad…:SKILL.md | grep -n routed-ledger.mjs` → no output; `show …:SCORECARD.md` Capabilities grep → no output; `show …:corpus/QUALITY.md | grep -c routed-ledger` → `0`.
- ⇒ the single held check at base is L7. Same arithmetic for `base/deprec68-base.txt:1` = `… held=1/10 … M1 MISS entry-absent | M2 MISS cited=0 | … | M9 MISS readme-map-exit=1,province-entry-not-named` ⇒ M10 is the held one (its M9 internals match plan: census/sources-check/source-capture CLEAN at base, readme-map DRIFT exit 1).

E2. Live recursion (M10(b), deprec68-probe.mjs:371): built the exact M10(b) fixture (symlink blob `120000,<sha>,corpus/knowledge/mcp-deprecation-registry.md`, rev `0528f03c5a7f6284283009ce24d3a99180719675`) and ran the child-level invocation:
```
TMPDIR=$S timeout 500 node <lane>/.ufo/waves/round-68/probe/deprec68-probe.mjs $S/fx-symentry 0528f03c… --no-live
→ exit=1 elapsed=34s
DEPREC68_UNMET held=1/10 … | M1 MISS entry-absent | … | M9 MISS census-exit=2,sources-check-exit=1,source-capture-exit=1,readme-map-exit=1,province-entry-not-named
```
(M10 held here — the full text is in build/K68ReviewProbes/e3-symentry-run-verdict.txt.) During overlapping runs, `pgrep -fc deprec68-probe.mjs` went 22→56→89→122→153→184→215→244 within 24 s, then collapsed to ~10 by t≈36 s. A live ps capture (`ps -eo pid,ppid,etime,args`) shows a sibling seat's identical invocation as an unbroken parent→child chain ≥25 deep (each PPID = previous PID, one new level ≈ every 1 s, rev re-hashed per level), 149 concurrent probe processes at last count, no termination observed before I stopped watching (~90 s); each level blocks in `spawnSync(process.execPath,[SELF,…],{timeout:120000})` (deprec:371) / `timeout:300000` (ledger:439).

E3. `--tool` escape (ledger68-probe.mjs:57 `TOOL=join(A,TOOL_REL)`, :47–56 `chainSafe`, :84–90 L1 executes `spawnSync('node',[TOOL,'--selftest'])`). Counter expressions executed verbatim with `TOOL_REL='../evil.mjs'`, A=$S/A:
```
TOOL: /fast/scratch/hyaku/kumitate-r68/K68ReviewProbes/evil.mjs
inside A: false
existsSync: true isFile: true chainSafe: true
```
and `node evil.mjs` prints `ROUTED_LEDGER_SELFTEST: PASS (99/99)` (≥44 ⇒ L1 would "pass" on a host file outside the archive).

E4. Plan cross-checks: plan.md:52 L2 wording is `--root <extraction> --from 55 --to 66` (no `--classes` anywhere in the plan — the counter matches the plan). plan.md:86 says base receipt `held=0/7`; the committed receipt says `held=1/7`.

E5. Cleanup verification: my processes filtered by cmdline∩{K68ReviewProbes} → killed=0 needed (mine had already self-unwound), mine remaining=0, scratch deleted at exit. `ulimit -u` = 122865 (not the bound that stops the chain).

## Findings

1. **K68ReviewProbes-1 — CRITICAL — L7(b)/M10(b) self-spawn recursion is unbounded and its pass is vacuous; the base receipts' "held" for L7/M10 is unsound.** deprec68-probe.mjs:371 (and ledger68-probe.mjs:439, timeout 300 s) spawns the FULL counter on the fixture rev; that child runs its own M10(b)/L7(b) and spawns again — no depth guard. Termination is only the per-spawnSync timeout cascade (~120 s / ~300 s after each level's start, root gets `r.status=null` → `M10/L7 MISS … exit=null`), or early accidental unwind when a deep spawn fails under host load (nondeterministic: E2's run finished "held" in 34 s while the sibling chain kept growing; 244 concurrent probes observed). The pass criterion `r.status===1 && /M1 MISS/.test(v)` (deprec:372–374; `/L1 MISS/` at ledger:440) is satisfied by ANY exit-1 child because the fixture by design makes M1 MISS (`entry-absent`) appear in the verdict's miss list — the check cannot see whether the child's own M10/L7 held or missed. Consequence: the frozen claims' only self-confinement proof proves nothing, and the counting command at tip inherits a nondeterministic 34 s ↔ ~2.5–5 min wall clock with a transient process spike. Reproducer: E2 command (fast/vacuous outcome) — the runaway outcome is the same command on a quiet host (observed live). L1 attention: YES — strengthening re-freeze (depth-guard env var, or inline chainSafe assertion instead of self-spawn, or a dedicated non-self checker script). No in-place edit.
2. **K68ReviewProbes-2 — MEDIUM — the symlink-refusal "proof" cannot detect a counter that reads the symlinked entry.** Same criterion as Finding 1: a broken variant that followed `corpus/knowledge/mcp-deprecation-registry.md` as a symlink would still print `M1 MISS` (no `source:` lines in the target) and exit 1 — indistinguishable from correct refusal. The declared M10 sentence ("never reads a host file") is untested by the frozen text. L1 attention: yes (fold into Finding 1's re-freeze).
3. **K68ReviewProbes-3 — MEDIUM — `--tool` path escape executes arbitrary host files.** `TOOL=join(A,'../x')` resolves outside the archive and `chainSafe` returns true for components outside A (E3: `inside A: false`, `chainSafe: true`, isFile true) → L1 runs `node <host-file> --selftest` and accepts `PASS (99/99)`. Only reachable via the explicit `--tool` flag (the frozen counting command and both controls omit it — a dead affordance carrying an arbitrary-execution hazard, in a counter whose L7 purports to prove "never executes a host file"). L1 attention: drop the flag or reject `relative(A,TOOL).startsWith('..')`.
4. **K68ReviewProbes-4 — LOW — plan.md:86 mis-quotes its own frozen receipt.** Plan: "Before (base d23892ad): LEDGER68_UNMET held=0/7"; receipt `base/ledger68-base.txt:1`: `held=1/7` (the held one being unsound L7, Finding 1). Record-only; a finding that frozen text mis-reads evidence goes to the L1 as a ratchet note, never an edit.
5. **K68ReviewProbes-5 — LOW — vacuous/permissive arms in M4/M5/M8.** If `## Located quotes` is absent/malformed, `bullets=[]` → M5 performs zero fetches and counts held (reachable only while M4 already MISSes, so HELD stays unreachable, but per-check held counts inflate, e.g. a 9/10 verdict with a meaningless M5). M8's `citesOld` accepts a bare prose mention of S201..S206 inside the section with no registry-row/pin requirement. M5 binds the fetch to the FIRST `https?://` in the source cell — a cell with two URLs fetches the wrong one (author-side trap, closed direction). L1 attention: optional ratchet wording.
6. **K68ReviewProbes-6 — INFO — environment/timing answers (asked explicitly).** Empty PATH: spawn lookup uses the parent's PATH; empty parent PATH fails `git` resolution → honest `rev-unreadable` exit 2 (the `/usr/bin:/bin` fallback only fills the child env). Proxy vars: Node fetch ignores HTTP(S)_PROXY, so CHILD_ENV stripping them is moot; on a proxy-only egress M5 fails `unreachable` = MISS (honest, stated limit). HOME absent from child env: git operates without global config. No leak found. Timing: M5 sequential, 45 s abort per bullet, no overall cap (~6 min worst for 8 bullets) + four M9 gates ≤300 s each — budget ~10 min wall clock; no correctness impact. `ulimit -u` 122865 — resource exhaustion, not the design, is the only thing that stops the Finding-1 chain early.
7. **K68ReviewProbes-7 — INFO/residual — path semantics verified sound elsewhere.** Symlinked INTERMEDIATE components are caught by `chainSafe`'s per-component lstat (UNSAFE + confinement exit 2); the M10(c)/L7(c) symtree child demonstrably exits 2 at the confinement block before reaching its own M10/L7 — that branch terminates and does not recurse. `atBase`/`atR66Base` on a symlinked base path returns the link-target blob text (not target content) — can only fabricate "present at base" (fails closed) under attacker control of the frozen base hash: out of scope. `registryRow`'s 11-cell convention matches the real SOURCES.md (S198 row measures 11 cells); rows with unescaped `|` would go unseen as row-absent (closed direction). L3 checks id↔round consistency only when the id matches `^R\d+-` (arbitrary ids escape; plan doesn't mandate id shape).

## Artifacts

- /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-68/build/K68ReviewProbes/e3-symentry-run-verdict.txt (full E2 verdict line)
- /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-68/build/K68ReviewProbes/e3-symentry-run-cmd.txt (exact command + exit/elapsed)
- /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-68/build/K68ReviewProbes/evil-tool-demo.mjs (the E3 host-file stand-in)
- /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-68/w1/K68ReviewProbes.md (this report)

## Limits

- Did not run the frozen counting commands at the tip (not this seat's job; verification is the main agent's) and did not execute the `--tool` escape against the real probe end-to-end — the Finding-1 recursion makes any full run nondeterministic; E3 demonstrates the code path with the counter's own expressions instead (that check is therefore NOT a run pass).
- Did not wait for the sibling tree's 120 s cascade to complete and did not touch its processes (ownership: K68MutEntry, informed via agent message); the "no termination before ~90 s" observation is bounded by my watch window.
- M5's live-fetch arm, M6's capture-table comparison, and L4's mutant matrix were reviewed by code reading plus the committed base receipt only — no network fetches and no S207 capture existed to exercise them here.
- Subject tools (scripts/routed-ledger.mjs v1/v2, gates) were not audited — other seats' scope.
- Scratch /fast/scratch/hyaku/kumitate-r68/K68ReviewProbes deleted; no installs performed (no tooling beyond stock node/git/ps needed).
