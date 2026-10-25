VERDICT: HELD-FORGED — the frozen C2 counter returns `JJ64_HELD held=8/8` for four independent forgeries that skip the claimed work (staged text with retyped provenance, reused rows, page-header boilerplate as "located quotes", a demo that echoes the entry and never calls `jj`, a two-line amendment); two of the named attacks are refused (cross-document quote transplant, contradicting value), and the two cheapest ones are inherent to a counter that compares a revision against evidence the same revision wrote.

## Evidence

Frozen artifact attacked (never edited): `.ufo/waves/round-64/probe/jj64-probe.mjs`
`sha256 157be0acaa799bb6acb92c76aa989a49f33c68ca3fd74d594e9e98b6b290daf1` == `.ufo/pins/counter-pins.json` pin
`jj64-probe` round 64. Frozen control `jj-donothing-control.sh` `sha256 0b1c08d4…9b7ac` == its pin. Lane `git status`
after all work: no tracked modification (only untracked `build/`, `w1/`, dispatch files).

F1 — cheapest chain to 8/8, one commit in a sandbox clone at base `6825a514`, seven files (`.ufo/…/build/K64CriticC2Predicate/evidence/f1-commit.txt`):
- J1: `corpus/knowledge/jj-workspace-seat-containment.md` = `/home/vgpnk/Projects/shokuknow/merge/kumitate/knowledge/corpus/knowledge/jj-seat-staleness-outcome-2026-10-25.md` byte-for-byte except lines 2–4 (source/verified-at/recheck retyped); `diff` shows only those three lines plus the appended sections. The staged claim the plan calls contradicted ("The seat does not go stale") is carried unchanged.
- J2: no row opened this round — S195 (landed round 61, commit `1508415`) and S196 (round 63, `05b3176`) already carry `opened 2026-10-25`; the entry path is appended to their `used-by` cell.
- J4/J5: the four bullets are the docs-index header note of the two cited pages ("Any documentation page is available as raw Markdown by appending .md to its URL.", "For the complete documentation index, see", …) — page furniture, unrelated to the row's scope or anchor.
- J6: `scripts/jj-seat-demo.sh` is a 17-line `cat <<OUT` of the twelve stated values; `grep -c jj` = 1 (a comment), zero `jj` invocations.
- J7: PROVINCE line worded `- Background: \`<entry>\` — …` (the word "Background" satisfies `/frontier|band|ground|first entry/i`); README row + covered pin added (plus the round-63 spot-check row the base `readme-map` DRIFT requires).
- J8: `## Amendment 2026-10-25` + one line `M7 — \`<entry>\``.
```
JJ64_HELD held=8/8 checks=8 rev=0c698f484e6824b439e4f44fcaadcc47a7370d0b rule=J64
exit=0
```
Calibration (same clone, child commits; full log `evidence/f2.log`, `evidence/verdicts.txt`):
```
A  12 keys with EMPTY values, demo echoes empty   JJ64_HELD held=8/8 … rev=81cb6397… exit=0
B  one stated value contradicts the demo          JJ64_UNMET held=7/8 … | J6 MISS workspace_list:stated=WRONG:live=   exit=1
C  S195 pin re-pointed at another document        JJ64_UNMET held=6/8 … | J4 MISS S195:quote-not-in-capture(…) | J5 MISS S195:quote-not-live(…)   exit=1
```
F3 — attacker-hosted row URLs, tested live (loopback `python3 -m http.server 8741`, page authored by the attacker, capture + pin authored to match, two new rows S198/S199):
```
JJ64_HELD held=8/8 checks=8 rev=ec462374cace019afa36f93131b27644ca94fd85 rule=J64
exit=0
```
F4/F5 — self-referential demo (`awk` over the entry's own `## Demo outcomes`, no `jj`) plus a `pwd > demo-cwd.txt` write:
```
JJ64_HELD held=8/8 checks=8 rev=2ad1bcb155e0fa9b24ca4f33faa5d54f055c14d1 rule=J64   exit=0
demo-cwd.txt = /tmp/kumitate-r64/K64CriticC2Predicate/cwdtest      # the caller's cwd, not the archive T
```
D — "right documents, different pages": S195's cited URL swapped to `https://docs.temporal.io/visibility.md`, anchor cell invented, capture/pin untouched:
```
JJ64_HELD held=8/8 checks=8 rev=930c0fceb71b0eb57743fc9a2a0974e8aad2daa0 rule=J64   exit=0
```
Cross-page check with the counter's own `norm()` (copied verbatim): the F1 quote normalises into `docs.temporal.io/visibility.md` and `docs.temporal.io/workflow-execution.md` as well as the S195 capture — it is site-wide furniture, so J5 cannot bind it to the cited page.

## Findings

1. **K64CriticC2Predicate-1 — critical, inherent. J6 is a tautology.** The demo's stdout is compared only with the entry's own `## Demo outcomes`, so a script that prints (F1) or greps (F4/F5) those values scores HELD with no jj workspace, no operation log, no rewrite, no abandon. Reproduce: `bash .ufo/waves/round-64/build/K64CriticC2Predicate/f1-forge.sh /home/vgpnk/Projects/shokunin/kumitate-shokunin $PWD/.ufo/waves/round-64/probe/jj64-probe.mjs $PWD/.ufo/waves/round-64/build/K64CriticC2Predicate`. Inherent to any output-vs-text comparison without an independent witness; the only real fix is an oracle the counter runs (P-7).
2. **-2 — high, fixable. J2 accepts rows opened by earlier rounds.** S195 (round 61) / S196 (round 63) pass `opened === 2026-10-25`, so the plan's "C2's rows are opened this round" is unmeasured; a forger opens no row. Reproduce: `git -C <lane> log --format='%h %ad %s' --date=short -S'| S195 |' -- corpus/SOURCES.md` then F1. Fix: require each cited id absent from `git show BASE:corpus/SOURCES.md` (P-3).
3. **-3 — high, fixable. J6's 12-key floor is information-free.** Twelve `- key=` with a demo printing `JJ_SEAT: key=` reads 8/8 (variant A). Reproduce: `bash …/f2-variants.sh <f1-clone> <probe>` (first run). Fix: require a non-empty value (P-2).
4. **-4 — high, fixable. The demo is not hermetic; it runs in the caller's cwd.** J6's `spawnSync` passes no `cwd`, so the archive's demo reads/writes the caller's tree — measured by `demo-cwd.txt` landing in `/tmp/…/cwdtest`. Run from the lane (the plan's counting command is lane-relative), a demo can read lane state and write into the lane working tree, which the plan's "hermetic demo" wording excludes. Fix: `cwd: T` (P-1).
5. **-5 — high, partly declared. J5's outside witness is forgeable and the capture is not bound to the cited URL.** F3 (attacker loopback URL + self-authored capture + pin) and D (cited URL = a different page, same site furniture, invented anchor) both read 8/8. The plan declares the attacker-URL hole; it does not declare that a *correct-looking* URL with a capture of another page passes whenever the quote is shared boilerplate. Reproduce: F3 script; D recipe in `evidence/verdicts.txt`. Fix: pin the fetched URL with the capture and compare it to the row's URL (P-7).
6. **-6 — medium, inherent. A "located quote" is any substring of the page.** J4 checks containment only: no anchor, no scope, no relevance. F1's quotes are the page's index header while the row's scope is "§ Versioning behaviors → § Pinned Workflows". The same fixture's entry is also internally contradictory (body: "a seat is never left holding a working copy that contradicts the repository"; its own demo outcomes: `abandon_seat_commit=stale`, `stale_recovery=refused`) and passes. Relevance and soundness are not machine-checkable; only a distinctive-token heuristic or a human review binds them.
7. **-7 — medium, fixable. J7's "frontier line" is any line containing /frontier|band|ground/.** `- Background: \`<entry>\`` passes; no section scoping, no placement. Fix: search only inside the `### Frontier` block (P-4).
8. **-8 — medium, fixable. J8's amendment can be the heading words plus the path and the token M7** (two non-empty lines, 88 bytes) — the "appended amendment" carries no measurement and no correction. Fix: require ≥3 body lines (P-5).
9. **-9 — low, fixable. J1 accepts a placeholder `recheck:`.** F1's `recheck: 90d — \`grep -c -F 'llms.txt' <capture>\` -> 1` passes and is never run; an unexpanded `<capture>` is the round-60 placeholder class C1 exists to catch. Fix: reject `__TOKEN__`/`<token>` forms (P-6).
10. **-10 — calibration, positive.** The counter is not toothless: J4+J5 refuse a capture transplanted from another document with a distinctive quote (C), and J6 refuses a stated value that disagrees with the demo (B). Every surviving forgery above is self-consistent inside the revision; none of them requires breaking a check.

**Which forgeries are inherent to a counter that measures an evidence chain.** Inherent: (i) self-authored provenance — row, capture, pin, quote and demo are all written by the same revision, so only J5 touches the outside, and J5 is defeated by an attacker-hosted URL or by site boilerplate; (ii) the relevance/support of a quote; (iii) the truth of the demo's numbers, since the demo and the entry are the same author; (iv) the provenance of the entry text — nothing compares it with the staged corpus it claims to re-ground. Fixable and cheap: -2, -3, -4, -7, -8, -9, and the capture→URL pin in -5.

## Artifacts

- `.ufo/waves/round-64/build/K64CriticC2Predicate/f1-forge.sh` — regenerates F1 from the lane (clone under this dir, explicit `-C`, commits only inside the clone).
- `…/f2-variants.sh` — A/B/C calibration on an F1 clone. `…/f3-attacker-url.sh` — attacker-URL fixture with a transient loopback server (killed on exit; no job left running).
- `…/fix-proposals.md` — P-1…P-7 as hunks against the frozen counter, each a strengthening only.
- `…/evidence/` — `verdicts.txt` (all verdict lines verbatim), `f1.log`, `f2.log`, `f3.log`, `f1-entry.md`, `f1-demo.sh`, `selfref-demo.sh`, `f1-diff.patch`, `d-wrong-page.patch`, `a-empty-values.patch`, `f1-commit.txt`.
- Fixture clones were deleted after evidence capture (a nested repo inside the lane would be recorded as a gitlink by `git add -A`); the three scripts regenerate them in ~1 min each, live fetches included.

## Limits

- Did not attack C1 (`receipt64-probe.mjs`) or the receipt controls; not this seat's scope.
- J5 was exercised only against live URLs reachable from this host today (two real docs pages, one loopback page). No test of a URL that returns 200 with a redirect chain or a JS-rendered page; `curl -fsSL` sees the same bytes either way.
- F1 needed the base `readme-map` DRIFT repair (round-63 spot-check lesson row + covered pin) to clear J7 — that is the plan's own maintenance item, not a counter defect; any M must carry it.
- No `jj`-based demo was written or judged: I attacked the predicate, not the L1's forthcoming `scripts/jj-seat-demo.sh`, and I did not check whether a genuine demo's 15 frozen outcome keys can be produced on this host (jj 0.45.1 present).
- Tooling: nothing installed; no package manager transaction run.
