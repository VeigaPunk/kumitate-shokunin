# CritControlC2 — round 61 w1, C2 falsify (critic)

**Verdict: C2 probe `doctrine61-probe.mjs` (D61 v1) is BROKEN — vacuous for honest work, forgeable to `DOCTRINE61_HELD 6/6`.**
The three requested gaming attempts each fail as required, but only one of them (E4 no-capture, variant 2) fails for the reason the plan states;
the strongest counterexample (a5) reaches HELD with no S195 row in `## Registry`, a fabricated capture and an un-re-grounded entry.

Scratch: `/tmp/kumitate-r61/CritControlC2/` (harness `harness.mjs`; fleet root `fleet/` with `shokunin.conf` + clone of lane @ `be4a820`).
All attacks were scratch commits; lane jj/git state untouched. No tools installed.

## Requested attempts (assignment 1–3)

| # | Attempt | Observed (verbatim) | Receipt |
|---|---|---|---|
| 1 | S195 row, opened 2026-10-25, sha pin, no `body.md` | v1 contract row: `E4 MISS pin= sha=` (E3 `row-absent`) · v2 probe-visible row: `E3 PASS …` / `E4 MISS pin=sha256 8ef2ee5f5e196d9d1 sha=` → `DOCTRINE61_UNMET held=5/6` | `controls/ctl-c2-critic-a1-no-capture.txt` |
| 2 | Package entry copied verbatim (S217, verified-at 2026-10-23) | `E2 MISS src=false verified=false recheck=true` → `DOCTRINE61_UNMET held=3/6` | `controls/ctl-c2-critic-a2-verbatim-package.txt` |
| 3 | Escaped pipe `\|` in a Registry row | census `kumitate	E01	S195 fields=12` exit=1 (also: duplicate → `E03`+`E04`; same URL+scope → `E04`; `|:S195:|` in Registry → `E01`+`E02`) | `controls/ctl-c2-critic-a3-malformed-row-census.txt` |

## Counterexamples (defects found)

1. **Honest build cannot pass (vacuity)** — a0: contract-shaped row + real capture (sha `8ef2ee5f…f8fc`) + re-grounded entry + README row →
   `DOCTRINE61: DOCTRINE61_UNMET held=4/6 … | E3 MISS row-absent | E4 MISS pin= sha=8ef2ee5f5e196d9d`. Two causes, probe lines 17/21:
   - row regex `/^\|[[:space:]]*S195[[:space:]]*\|/` — JS has no POSIX classes; it requires exactly one of `[ : s p a c e` after `|`, so `| S195 |` never matches.
   - column off-by-one: probe reads `c[9]/c[10]/c[12]`; on the 11-column contract those are opened/recheck/trailing-empty (status/opened/used-by are `c[8]/c[9]/c[11]`).
   - Census requires NF=13 in `## Registry`, the probe requires a 12th cell and a non-`S` id char → **E3 and E5 are jointly unsatisfiable for any Registry row.**
   Consequence: the frozen control `ctl-c2-unopened-row.txt` ("E4 PASS: false") passes vacuously — it would read the same for a real row. Receipt `ctl-c2-critic-a0-honest-row-vacuity.txt`.
2. **Phantom row outside `## Registry`** — probe searches the whole file; census ignores non-Registry lines unless they match `^\|[ \t]*S[0-9]{3,}`. `|:S195:| … | shim | mined | 2026-10-25 | 90d | <entry> |` after `## Leads` → census `kumitate	ok` exit=0 and probe `E3 PASS` (a3 v5, a1 v2).
3. **E4 binds pin↔file, not file↔source** — invented bytes in `body.md`, own sha pinned → `E4 PASS pin=sha256 15841c50876fe839f sha=15841c50876fe839`. Also only 16 hex compared (`includes(sha.slice(0,16))`), and capture read from worktree, not rev. Receipt `ctl-c2-critic-a1b-fabricated-capture.txt`.
4. **E2 has no located-quote / re-grounding check** — header-only rewrite `S217→S195`, `2026-10-23→2026-10-25`, no fetch, recheck still says `(ran 2026-10-23)`, body still cites S217 → `E2 PASS src=true verified=true recheck=true`. Regexes are `m`-flag anywhere-in-file, not "opens with". Receipt a2 v2.
5. **E5/E6 measure the worktree, not the rev** — a4: rev `ad78e87` commits an escaped-pipe registry; `git archive` of that rev → census `E01 S195 fields=12` exit=1, yet probe at that rev `E5 PASS exit=0`. E6 likewise mixes rev (`mapped`) with worktree (`readme-map`). Receipt `ctl-c2-critic-a4-e5-worktree-not-rev.txt`.
6. **Plan's counting command can never pass E5** — without `--census-root` the probe calls census with `--root <lane>`: `ERROR: config not found: …/kumitate-shokunin/shokunin.conf` / `unknown lane … kumitate` exit=2 → `E5 MISS exit=2`. plan.md E5 names `--root /home/vgpnk/Projects/shokunin` (that reads `ok` exit=0). Receipt `ctl-c2-critic-a6-default-census-root.txt`.
7. **Composition → HELD (strongest)** — a5 = 2+3+4 + README row: no S195 line inside `## Registry`, fabricated capture, un-re-grounded entry →
   `DOCTRINE61: DOCTRINE61_HELD held=6/6 checks=6 rev=4247d2d rule=D61` (all E1–E6 PASS; census exit=0). Receipt `ctl-c2-critic-a5-full-forgery-held.txt`.

## Impacted axes
coverage (C2 frontier claim): as frozen, D61 v1 yields UNMET for the honest build and HELD only for a forged/off-Registry build. **Any `DOCTRINE61_HELD` under v1 is false provenance by construction** (no census-valid Registry row can satisfy E3) — the judge must reject a v1 HELD at face value. Fixing the probe after seats scored is a rule change ⇒ per the kill rule, C2 fails as declared under v1 unless re-declared as a disclosed v2.

## Smallest safe correction (v2, disclosed)
- E3/E4 row: `/^\|\s*S195\s*\|/`, restricted to lines inside `## Registry`; cells `c[8]==='mined' && c[9]==='2026-10-25' && c[11]===ep`.
- E4: full equality `pin === 'sha256 ' + sha`; hash `git show <rev>:.ufo/waves/round-61/build/ScoutSourceWorkerVersioning/body.md` (capture committed at rev).
- E2 + source binding: trio must be the first non-blank lines; entry must carry a located quote that occurs verbatim in the capture; reject residual `S217` in the entry.
- E5/E6: run census/readme-map on `git archive <rev>` extracted under a temp fleet root with `shokunin.conf`; default census root = fleet root (match plan.md).
- Re-record `ctl-c2-unopened-row.txt` against v2 with a positive control (a0 must read HELD) so the negative control is non-vacuous.
