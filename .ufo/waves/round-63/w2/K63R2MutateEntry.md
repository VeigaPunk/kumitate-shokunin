VERDICT: The frozen T63 counter kills 17/28 one-fault mutants of the C2 evidence chain at a9531c8e617338fd16cb69c61344ef8f17711117 but survives 11 — prose numbers, sign flips, version pins, tier cells, benchmark names, limits sentences, [INFERENCE] labels, and bullet-set shape — of which the new numbers-check.py closes 3 (prose numbers incl. sign and version suffixes) and 8 remain declared blind spots for the non-author closure.

## Evidence

Pristine fixture `/tmp/kumitate-r63/K63R2MutateEntry/F0` from `git -C /home/vgpnk/Projects/shokunin/kumitate-shokunin archive a9531c8e617338fd16cb69c61344ef8f17711117 | tar -x -C F0`, `git init`, toplevel check, one commit. Before-hash (F0 HEAD, parent of all 28 mutants): `17036a9fb33193a102f20ca869e7fdf0bba022e0`.

```
$ node .ufo/waves/round-63/probe/topology63-probe.mjs $S/F0 HEAD
TOPOLOGY63_HELD held=7/7 checks=7 rev=17036a9fb33193a102f20ca869e7fdf0bba022e0 rule=T63   exit=0
$ python3 .ufo/waves/round-63/build/K63R2MutateEntry/numbers-check.py $S/F0
NUMBERS_CHECK: PASS prose-numbers=64 all in captures[S196,S197]   exit=0
```

Per mutant: `cp -a F0 F<i>` → one edit → `git -C F<i> commit` → `node .../topology63-probe.mjs F<i> HEAD; echo exit=$?` (live T5 fetches on). Probe verdicts verbatim; `held` counts and MISS arms quoted below.

| mutant | mutation (one fault) | flagged by | verdict | after-hash |
|---|---|---|---|---|
| F1 | decision table `+80.8%`→`+79.8%` (entry L17) | numbers-check only | probe **HELD 7/7 exit=0** → survives | c39aa6c5b54d86154f883004c7c7ab1f641d7f39 |
| F2 | loss sign `Independent −70.0%`→`+70.0%` (L19) | numbers-check only | probe **HELD 7/7 exit=0** → survives | f47057bcd2bee6f693411cd3013fb3d088cad559 |
| F3 | swap `BrowseComp-Plus`↔`Workbench` in Decentralized row | neither | probe **HELD 7/7**, numbers-check PASS | 05f0bc3f1dbc2f9774843ba760eed8ce16365b80 |
| F4 | delete limits sentence "Communication overhead grows superlinearly…" | neither | probe **HELD 7/7**, numbers-check PASS | f196fcaf7159247eec001f2e539cee139daeeed4 |
| F5 | delete `[INFERENCE]` label (transfer sentence, L28) | neither | probe **HELD 7/7**, numbers-check PASS | fefc3dddb678786cf0f9bf77f6b28b70e294f01e |
| F6 | header `source:` URL `2512.08296v3`→`v2` (L2) | neither | probe **HELD 7/7**, numbers-check PASS | c5775812892e631e23bf88920c3819472c1fa2d9 |
| F7 | located quote one word `consistent`→`uniform` (L68) | T4+T5 | UNMET held=5/7: `T4 MISS S197:quote-not-in-capture(PlanCraft exhibits uniform deg)` `T5 MISS S197:quote-not-live(...)` exit=1 | da68aee20b6005089400bb6c6e6fffc7f1ac81d9 |
| F8 | delete entry path from S196 `used-by` cell | T2 | UNMET held=6/7: `T2 MISS S196:used-by-lacks-entry` exit=1 | c28988ed7f072cdd441e07a695ed4ca5f0fe0819 |
| F9 | S196 tier `A`→`B` | neither | probe **HELD 7/7**, numbers-check PASS | ae5b8508e4a24843912f25b8d466bc0a2156022a |
| F10 | S197 row URL → `https://arxiv.org/abs/2512.08296` | T5 | UNMET held=6/7: `T5 MISS` ×6 `quote-not-live(...)` (abstract quote survives on abs page) exit=1 | df0ba6afd419e29232971238fb0cfec169294a4d |
| F11 | remove `verified-at:` line | T1 | UNMET held=6/7: `T1 MISS trio source=true verified-at=false recheck=true` exit=1 | 55ec9be6cc7d5ccea0e221c43c81e287c5aa6847 |
| F12 | add fabricated quote bullet (not in capture) | T4+T5 | UNMET held=5/7: `T4 MISS S197:quote-not-in-capture(Choosing the coordinator with )` + `T5 MISS quote-not-live` exit=1 | 23ec3bae9723c1d749d9efc8026cb2537e48e2fc |
| F13 | duplicate a bullet verbatim | neither | probe **HELD 7/7**, numbers-check PASS | a15086fe4c42be188d370d8f9c1859bf33363176 |
| F14 | delete one bullet (15→14, floor is 6) | neither | probe **HELD 7/7**, numbers-check PASS | 12564fda075ac79d93218dc74d7da0a56d4e1e1d |
| F15 | S196 `opened` `2026-10-25`→`2026-10-24` | T2 | UNMET held=6/7: `T2 MISS S196:opened=2026-10-24` exit=1 | acb96d3647f705e2df804718ed319bd669078f80 |
| F16 | S196 status `mined`→`open` | T2+T6 | UNMET held=5/7: `T2 MISS S196:status=open` `T6 MISS census-exit=1` exit=1 | 83075e8948c248481383b6363ecdcd9718497588 |
| F17 | drop S196 `recheck` cell (NF=12) | T2+T6 | UNMET held=5/7: `T2 MISS S196:NF=12` `T6 MISS census-exit=1` exit=1 | 5f9540f8bb0512112b14fb1cc61e6283bc977509 |
| F18 | entry `source: S197`→`S299` (nonexistent row) | T2+T3+T4+T5 | UNMET held=3/7: `S299:not-in-registry`,`S299:unbound`,`S299:no-bullet`,`S197:not-a-source`×5,`S299:no-url` exit=1 | 6ffff8ef3c6b5d7a56f345b1499f085dbede96a8 |
| F19 | edit committed S196 capture byte (`1-20`→`1-21`), pin stale | T3+T4 | UNMET held=5/7: `T3 MISS S196:hash-or-size` + `T4 MISS` ×5 `quote-not-in-capture` exit=1 | a1c889fe7d381a38fee21ebecafb31f415791396 |
| F20 | same-size forged capture (`260`→`261`) + aligned entry quote + pin sha recomputed (`df31beb3…`→`565cf04bb44c7531375282b640999a6aaea9162e317bbb81b54589b46be541e6`, bytes 663997) | T5 only | UNMET held=6/7: `T5 MISS S197:quote-not-live(We conducted 261 experiments a)` — T3/T4 pass exit=1 | 2846a3467bc9fa5c4e10714afaecd42a25b34264 |
| F21 | duplicate row id (`S195`→`S196`) | T6 only | UNMET held=6/7: `T6 MISS census-exit=1` — T2 passes (id→row map is last-wins) exit=1 | 51d4d677991b519c315351120e51d502b6f44c93 |
| F22 | PROVINCE frontier line names `…topology.md` (broken path) | T7 | UNMET held=6/7: `T7 MISS province-names-entry=false readme-map-clean=true` exit=1 | ab55fd4435c19bfcd74cedee47a8dabd08626f33 |
| F23 | delete the entry's corpus/README.md row (L187) | T7 | UNMET held=6/7: `T7 MISS province-names-entry=true readme-map-clean=false` exit=1 | 9d494f29fbfd644b3fcbad078c54343a4205f03f |
| F24 | remove `recheck:` line | T1 | UNMET held=6/7: `T1 MISS trio source=true verified-at=true recheck=false` exit=1 | ab9c40234abeee735aff588a0180a9d4cb9dae33 |
| F25 | roster ceiling prose `at most 19 members`→`29` (L35) | neither | probe **HELD 7/7**, numbers-check PASS (`29` occurs in the 664 KB arXiv capture) | 025884fea76df8c58c42f95a56aa94ce9266a8bd |
| F26 | prose version pin `arXiv 2512.08296v3`→`v2` (Version scope, L55) | numbers-check only | probe **HELD 7/7 exit=0** → survives | 82849eac9d5c9149f656ee6ecd6417d5d2660c4b |
| F27 | vendor quote attributed `- S196`→`- S197` | T4+T5 | UNMET held=5/7: `T4 MISS S197:quote-not-in-capture(多智能体协作让一个 coordinator（协调者） 智能体)` + `T5 MISS quote-not-live` exit=1 | 66b7728de06192be92c01cc40b98ef6eaecaa9bd |
| F28 | quote inflated past 25 words | T4+T5 | UNMET held=5/7: `T4 MISS S197:over-25-words;S197:quote-not-in-capture(...)` + `T5 MISS quote-not-live` exit=1 | 529fe80e74d500ff6cc27936f438477a2399fb7b |

numbers-check on the prose-number mutants (v3, after minus-glue fix; pristine PASS is the baseline):

```
F1: NUMBERS_CHECK: FAIL missing=1/64 tokens not in captures[S196,S197]: +79.8@L17      exit=1
F2: NUMBERS_CHECK: FAIL missing=1/64 tokens not in captures[S196,S197]: +70.0@L19      exit=1
F26: NUMBERS_CHECK: FAIL missing=1/64 tokens not in captures[S196,S197]: 2512.08296v2@L55 exit=1
F25: NUMBERS_CHECK: PASS prose-numbers=64 all in captures[S196,S197]                   exit=0
```

Restoration: F0 untouched — `git -C F0 status --porcelain` = 0 lines, HEAD `17036a9f…`, probe re-run `TOPOLOGY63_HELD held=7/7 … exit=0`; every F1..F28 `rev-parse HEAD^` = `17036a9fb33193a102f20ca869e7fdf0bba022e0` (28/28 printed). Lane repo touched only at `.ufo/waves/round-63/build/K63R2MutateEntry/` and this report.

## Findings

1. **K63R2MutateEntry-1 (high)** — The counter does not read decision-table numbers: `+80.8%`→`+79.8%` reads HELD 7/7 (F1). Repro: `node .ufo/waves/round-63/probe/topology63-probe.mjs /tmp/kumitate-r63/K63R2MutateEntry/F1 HEAD` → HELD; `python3 .ufo/waves/round-63/build/K63R2MutateEntry/numbers-check.py /tmp/kumitate-r63/K63R2MutateEntry/F1` → FAIL `+79.8@L17`. Closed by numbers-check.py.
2. **K63R2MutateEntry-2 (high)** — Sign of a loss is invisible to the counter (F2 HELD). numbers-check closes it because tokens keep their sign (`+70.0` absent, capture has `−70.0`). Same repro pattern with F2.
3. **K63R2MutateEntry-3 (high)** — Version pins in prose are invisible (F26 HELD); numbers-check closes the prose instance (`2512.08296v2@L55`), but the **header** `source:` URL `v3`→`v2` (F6) survives both: the probe never compares the entry's `source:` URL to the registry row's URL, and numbers-check excludes header metadata by design. Open blind spot; a one-line counter patch could compare entry-`source:` URLs to the cited rows' URLs (patch proposal, not applied).
4. **K63R2MutateEntry-4 (medium)** — Tier cell is only checked non-empty (`tier === ''` is the sole tier test in T2): `A`→`B` reads HELD (F9). Open; suggest the counter pin each cited row's tier value or the census validate tier vocabulary.
5. **K63R2MutateEntry-5 (medium)** — Bullet-set shape is unguarded: a verbatim duplicate bullet (F13) and deleting one bullet 15→14 (F14) both read HELD; only the ≥6 floor, ≤25 words, per-row ≥1 and in-capture bind. Open; suggest the counter reject duplicate quotes and pin the bullet count.
6. **K63R2MutateEntry-6 (medium)** — Benchmark names outside located quotes are unchecked: swapping `BrowseComp-Plus`↔`Workbench` in the Decentralized row reads HELD (F3). Open; numbers-check is numbers-only by scope.
7. **K63R2MutateEntry-7 (low)** — Limits-sentence deletion (F4) and **[INFERENCE]**-label deletion (F5) read HELD: the counter cannot see prose sentences or epistemic labels. Open; non-author closure territory.
8. **K63R2MutateEntry-8 (low)** — Roster ceiling `19`→`29` (F25) survives both: `29` coincidentally occurs in the 664 KB arXiv capture, so token-membership checks have coincidental-hit limits; per-row number attribution or short n-gram context would be needed.
9. **K63R2MutateEntry-9 (info, defense-in-depth observed)** — `status=open` (F16) and NF=12 (F17) are double-flagged (T2 + T6 census); a duplicated row id (F21) is flagged **only** by T6 because T2's id→row map is last-wins — the census is the sole duplicate-id detector; keep it in the chain.
10. **K63R2MutateEntry-10 (info)** — Capture-forgery arms: a stale pin after editing capture bytes → T3+T4 (F19); a self-consistent forgery (same-size capture edit + aligned entry quote + recomputed pin) passes T3 **and** T4 and is caught only by the live re-fetch T5 (F20) — confirming the plan's control claim that T5 is what catches a coordinated forgery.

## Artifacts

- `/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-63/w2/K63R2MutateEntry.md` (this report)
- `/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-63/build/K63R2MutateEntry/numbers-check.py` (prose-number closure; exit 0 PASS / 1 FAIL / 2 fail-closed)
- Fixtures (scratch): `/tmp/kumitate-r63/K63R2MutateEntry/F0` (pristine) and `F1`–`F28` (one mutant each, parent `17036a9f…`)

## Limits

- T5 ran live from this host; every fetch succeeded (F0 HELD; the `quote-not-live` MISSes of F10/F20/F27/F28 require successful fetches). No `--no-live` runs recorded.
- One fault per mutant; the only multi-file mutant is F20's coordinated forgery (capture + entry quote + pin), declared as one semantic fault.
- numbers-check's prose definition excludes (documented in its docstring): header fields, the Located-quotes section, `S###` ids, ISO dates, `§` section pointers; it is numbers-only (names/labels/sentences out of scope).
- Frozen files (probe, controls, plan, base receipts) only read/copied, never edited; no `scripts/`, `SCORECARD.md`, `LOG.md`, `PROVINCE.md`, `SKILL.md`, `corpus/`, `.ufo/pins/` writes; no subagents, no tool installs (none needed); no pacman transactions.
- Probe batches initially run in parallel were backgrounded by the harness mid-loop; every fixture was committed exactly once and probed to a delivered verdict; verdicts above are those outputs verbatim.
