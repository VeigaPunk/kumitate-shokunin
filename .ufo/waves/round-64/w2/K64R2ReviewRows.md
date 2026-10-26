VERDICT: Registry rows S198–S200 pass mechanical census/pin gates (`sources-census.sh` exit 0, `source-dupes` CLEAN 6/6, `source-capture` CLEAN 32/107, J64 8/8), but carry six concrete cell/note defects against `CORPUS.md` v1 and `QUALITY.md` (an unrun S199 recheck command that prints 0, an S200 anchor/teaches vs scope/entry/Gate split, a false `§ Git Tricks` heading locator in S199, a wrong 8572-char `norm()` count in S198, unlabelled inferences in S198/S199 `teaches` plus over-broad S199 tier A scope, and prose notes with pipes inside `## Registry` alongside incomplete `used-by` cells and a vacuous `Q33` pass).

## Evidence

Run 2026-10-25 against lane commit `2ed8a5f8b133c65b3be59e3d10ff5bff50c4a2d8` (`L=/home/vgpnk/Projects/shokunin/kumitate-shokunin`, `C=$L/.ufo/waves/round-64/build/Capture`):

```
$ bash /home/vgpnk/Projects/shokunin/scripts/sources-census.sh validate --file "$L/corpus/SOURCES.md"; echo EXIT=$?
file	W04	S034 duplicate url stryker-mutator.io/docs/mutation-testing-elements/mutant-states-and-metrics across scopes
file	W04	S068 duplicate url github.com/can1357/oh-my-pi/tree/45c35e40c46166dc726ccc52f5d27f40f2449f99 across scopes
file	W04	S084 duplicate url infection.github.io/guide across scopes
file	W04	S095 duplicate url raw.githubusercontent.com/containers/bubblewrap/v0.13.1/bwrap.xml across scopes
file	W04	S123 duplicate url docs.langchain.com/oss/python/langgraph/checkpointers across scopes
file	W04	S126 duplicate url docs.temporal.io/encyclopedia/detecting-activity-failures across scopes
file	ok	/home/vgpnk/Projects/shokunin/kumitate-shokunin/corpus/SOURCES.md
EXIT=0

$ node "$L/scripts/source-dupes.mjs" --registry "$L/.ufo/pins/source-dupes.json" --sources "$L/corpus/SOURCES.md"; echo EXIT=$?
SOURCE_DUPES: CLEAN groups=6 known=6
EXIT=0

$ node "$L/scripts/source-capture.mjs" --registry "$L/.ufo/pins/source-captures.json" --sources "$L/corpus/SOURCES.md"; echo EXIT=$?
SOURCE_CAPTURE: CLEAN captures=32 exemptions=107
EXIT=0

$ for f in "$C"/*.html; do printf "%s\t%s\t%s\n" "$(basename "$f")" "$(wc -c < "$f")" "$(sha256sum "$f" | awk '{print $1}')"; done
firefox-jujutsu.html	53233	abbe47cfa45e809694b224d0db0ea7d6b00e9846b94086d077aea0604db7b3d2
jj-v0.46.0-technical-concurrency.html	48988	5e2f757641748faf15df032f51e14435ddd579b13c30ab54fea0d40ce2e00bf6
jj-v0.46.0-working-copy.html	47694	947d0c56c02f9c10b4c14e8aaa8cc3f435f7650536ab9386ef6a52f1d64ff3c7

$ curl -fsSL 'https://firefox-source-docs.mozilla.org/contributing/jujutsu.html' | grep -c -F 'A workspace becomes stale when a commit it depends on is rewritten from another workspace'; echo EXIT=$?
0
EXIT=1

$ bash "$L/.ufo/waves/round-46/quality/q33-locator-coverage.sh" "$L" 2ed8a5f8b133c65b3be59e3d10ff5bff50c4a2d8 corpus/lessons/round-64.md; echo EXIT=$?
Q33 PASS rev=2ed8a5f8b133c65b3be59e3d10ff5bff50c4a2d8 rows=0 all-locators-checked
EXIT=0

$ bash "$L/.ufo/waves/round-47/quality/q35-append-only.sh" "$L" 6825a51425e91908f019ed65aa2f4209acbd7087 2ed8a5f8b133c65b3be59e3d10ff5bff50c4a2d8; echo EXIT=$?
Q35 rewritten=0 removed=0 base=6825a51425e91908f019ed65aa2f4209acbd7087 tip=2ed8a5f8b133c65b3be59e3d10ff5bff50c4a2d8
EXIT=0
```

Cell-by-cell audit summary (`corpus/SOURCES.md:150-152`):
- **Well-formedness & IDs:** 11 cells (`NF=13`) each, no `|` inside any cell, `kind=docs`, `status=mined`, `opened=2026-10-25`, `recheck=180d`; IDs `S198`–`S200` unused at base `6825a514` (`rows=136` → `139`, `tiers=A:116 B:15 C:8`, `status=mined:107 queued:13 rejected:19`).
- **Captures (`.ufo/pins/source-captures.json:207-227`):** recomputed sha256 and byte counts match pins exactly (`S198`: `5e2f7576…00bf6`, `48988` B; `S199`: `abbe47cf…7b3d2`, `53233` B; `S200`: `947d0c56…ff3c7`, `47694` B).
- **Duplicate-URL & S200-vs-S067 (`CORPUS.md` Rule 4, W04, `source-dupes`):** `S067` (`raw.githubusercontent.com/jj-vcs/jj/v0.45.1/docs/working-copy.md`, `6019` B, sha256 `20578df0…e4ea`) and `S200` (`docs.jj-vcs.dev/v0.46.0/working-copy/`) have distinct normalized URLs, so neither `W04` nor `source-dupes` fires. `diff -u` of raw `v0.45.1` vs `v0.46.0` `docs/working-copy.md` (`6517` B, sha256 `d7c31dd7…6875`) has a single hunk (`@@ -87,8 +87,16 @@`) in `## Workspaces` rewriting the `forget` sentence and adding the `remove` paragraph. Under `CORPUS.md:123-125` Rule 4, expansion counts admitted `knowledge/` entries on uncovered ground, not rows, so a second row does not inflate expansion, but `S200` exists only because frozen `J2`/`J3` reject `S067` (`opened=2026-10-23`, exempted capture).
- **Staged rows (`SOURCES.append.md` `S259`/`S270`/`S290`/`S291`):** none can be appended verbatim (`\|` in `recheck` causes `E01 fields=12` + `E11`). `S290→S198` fixed `S290`'s wrong recheck count (`grep -c -F 'operation log'` is `6`, not `1`) and replaced `S290`'s unsupported op-log visibility claim with the `view` object list, but dropped `(except for disk failures and such)` and kept the unlabelled seat-visibility inference. `S291→S199` fixed `S291`'s misattribution of `"silently"` (belongs to `mach` commands failing on a stale working copy, not auto-update absorbing rewrites), dropped `jj config set --workspace snapshot.auto-update-stale false` and the ancestor-only note (`:540,544-549`), and kept `S291`'s broken recheck grep and unlabelled tail. `S259+S270→S200` added the `v0.46.0` vs host `0.45.1` skew and Windows `jj -R` note, but dropped `S259`'s `§ Workspaces` ¶1 facts and `S270`'s stale-working-copy facts from `anchor` and `teaches` while keeping them in `scope` and the entry.

## Findings

1. **K64R2ReviewRows-1 — HIGH (`corpus/SOURCES.md:157`; attacks `QUALITY.md` Q3 and `CORPUS.md:34` count-carries-command).**
   The S199 row note states: `` `curl -fsSL 'https://firefox-source-docs.mozilla.org/contributing/jujutsu.html' | grep -c -F 'A workspace becomes stale when a commit it depends on is rewritten from another workspace'` -> 1 (ran 2026-10-25)``. In both the live response and `Capture/firefox-jujutsu.html:533-534`, a newline splits `rewritten from\nanother workspace`, so `grep -c -F` outputs **`0`** (exit 1). The command was copied from staged `S291` (`SOURCES.append.md:103`) and re-dated without execution.
   Repro: `grep -c -F 'A workspace becomes stale when a commit it depends on is rewritten from another workspace' /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-64/build/Capture/firefox-jujutsu.html; echo exit=$?` → `0`, `exit=1`.

2. **K64R2ReviewRows-2 — HIGH (`corpus/SOURCES.md:152,159-160` vs `corpus/knowledge/jj-workspace-seat-containment.md:3,51-54,98-101` and `corpus/lessons/round-64.md:35`; attacks `CORPUS.md:99-101,112-115` Rule 1 and `QUALITY.md` Q2/Q33).**
   `S200`'s `scope` claims three topics (`several working copies backed by one repo`, `forget versus remove`, `stale-working-copy trigger and remedy`), the entry cites `S200` for `§ Workspaces, § Stale working copy` (4 of its 6 `S200` quotes come from `§ Workspaces` ¶1 `:2058-2062` and `§ Stale working copy` `:2088-2093`), and `round-64.md:35` (`## Gate`) grounds `S200` with the `§ Stale working copy` quote (`"When you modify workspace A's working-copy commit..."`). Yet `S200`'s `anchor` pins only `§ Workspaces, the two release paragraphs (forget, then remove)` (`:2068-2077`), its `teaches` covers only `forget` vs `remove` (so the Gate quote does not ground `teaches` and lies outside `anchor`), its `anchor` has a tautological edit (`v0.46.0 ... byte-identical to the v0.46.0 versioned URL` instead of `to latest`), and the row notes (`:159-160`) contradict `scope` by claiming `S200` has a "delta scope alone".
   Repro: `awk -F'|' '/^\| S200 \|/{print "SCOPE:",$6,"\nANCHOR:",$7,"\nTEACHES:",$8}' /home/vgpnk/Projects/shokunin/kumitate-shokunin/corpus/SOURCES.md` vs `grep -n 'S200' /home/vgpnk/Projects/shokunin/kumitate-shokunin/corpus/lessons/round-64.md /home/vgpnk/Projects/shokunin/kumitate-shokunin/corpus/knowledge/jj-workspace-seat-containment.md`.

3. **K64R2ReviewRows-3 — MEDIUM (`corpus/SOURCES.md:151`; attacks `CORPUS.md:41,99` exact section/heading rule).**
   `S199`'s `anchor` says `§ Working with multiple workspaces (the page's last content heading, followed only by § Git Tricks)`. `Working with multiple workspaces` is an `<h3>` at `firefox-jujutsu.html:530` followed by `</footer>` (`:557`); `Git Tricks` is **not** a heading on this page (`0` `<h1..h6>` hits) — it is a sibling page (`git-tricks.html`) in the sidebar `toctree-l2` (`:111`) and footer "Next" link (`:559`).
   Repro: `grep -nE '<h[1-6][^>]*>.*Git Tricks' /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-64/build/Capture/firefox-jujutsu.html; grep -n 'Git Tricks' /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-64/build/Capture/firefox-jujutsu.html`.

4. **K64R2ReviewRows-4 — MEDIUM (`corpus/SOURCES.md:150`; attacks `QUALITY.md` Q3 and `CORPUS.md:34` reproducible counts).**
   `S198`'s `anchor` states `whose normalised text equals the v0.45.1 rendering (8572 chars both, measured 2026-10-25)`. Under the frozen `jj64-probe.mjs:56-64` `norm()`, `Capture/jj-v0.46.0-technical-concurrency.html` and live `v0.45.1/technical/concurrency/` both measure **`8602` chars**, not `8572` (`8572` requires decoding six `&para;` entities that `norm()` leaves literal). Moreover, `v0.46.0`, `latest`, and `v0.45.1` HTML renderings are byte-identical (`48988` B, sha256 `5e2f7576…00bf6`).
   Repro: `node -e 'import fs from "node:fs"; const s=fs.readFileSync("/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-64/build/Capture/jj-v0.46.0-technical-concurrency.html","utf8").replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/gi," ").replace(/<[^>]+>/g," ").replace(/&nbsp;|&#160;/g," ").replace(/&amp;/g,"&").replace(/&lt;/g,"<").replace(/&gt;/g,">").replace(/&quot;|&#34;/g,"\"").replace(/&#39;|&#x27;|&apos;/g,"\x27").replace(/[\u2018\u2019]/g,"\x27").replace(/[\u201c\u201d]/g,"\"").replace(/[\u2013\u2014]/g,"-").replace(/\*\*|__|`/g,"").replace(/\s+/g," ").trim(); console.log(s.length);'` → `8602`.

5. **K64R2ReviewRows-5 — MEDIUM (`corpus/SOURCES.md:150,151`; attacks `CORPUS.md:93-101` tier/teaches and `QUALITY.md` Q4/Q33).**
   - `S198` `teaches` states `"so a seat's commit is visible from every workspace while its working copy stays per-workspace"` without `[INFERENCE]`; `jj-v0.46.0-technical-concurrency.html` has `0` hits for `seat`, `1` body hit for `workspace` (`:2082`), and `working copy` only in `§ Syncing with rsync…` (`:2058`, outside `§ Operation log`). It also drops `(except for disk failures and such)` (`:2092`) from `"cannot fail to commit"`.
   - `S199` claims `tier=A` for `"the precise trigger ... what a seat pool must configure"` and states in `teaches` `"so seat staleness is decided by configuration rather than by code"`. Mozilla's contributor guide is tier `A` only for Firefox's own `./mach vcs-setup` policy (`snapshot.auto-update-stale = true`), not for general jj staleness triggers (downstream secondary = tier `B`, and `rewrite_seat_head_seat_state=fresh` refutes its unqualified rewrite trigger); `"seat"` and `"decided by configuration rather than by code"` do not appear in `firefox-jujutsu.html`, and the knob controls auto-update vs refusal on a stale workspace, not whether it becomes stale.
   Repro: `grep -icE 'seat|rather than by code' /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-64/build/Capture/firefox-jujutsu.html /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-64/build/Capture/jj-v0.46.0-technical-concurrency.html`.

6. **K64R2ReviewRows-6 — LOW (`corpus/SOURCES.md:80,150-160`, `corpus/lessons/round-64.md:31-35`, `scripts/sources-check.mjs:370`; attacks `CORPUS.md:80,108` and `QUALITY.md` Q33).**
   (a) `corpus/SOURCES.md:154-160` places prose notes containing unescaped `|` characters inside `## Registry` (`CORPUS.md:80`: "the one table below"); current `^ {0,3}\|` parsers skip them, but appending a later row at the end of `## Registry` splits the table. Move them to `corpus/lessons/round-64.md` `## Gate`.
   (b) `S198`–`S200` `used-by` omits `corpus/lessons/round-64.md` (`:33-35,60`) and `corpus/knowledge/agent-isolation-substrates.md` (`:315`), and `S067` `used-by` omits `corpus/knowledge/jj-workspace-seat-containment.md` (`:64`) and `corpus/lessons/round-64.md` (`:48`). Also `scripts/sources-check.mjs:370` inspects only `lines[0]` for `source:` IDs, missing `S199`/`S200` on lines 2–3 of `jj-workspace-seat-containment.md`.
   (c) `q33-locator-coverage.sh` passes vacuously (`rows=0`) on `corpus/lessons/round-64.md` because its `## Gate` rows (`| S198 |`..`| S200 |`) do not contain lowercase `admit`.
   Repro: `bash /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-46/quality/q33-locator-coverage.sh /home/vgpnk/Projects/shokunin/kumitate-shokunin 2ed8a5f8b133c65b3be59e3d10ff5bff50c4a2d8 corpus/lessons/round-64.md`.

## Artifacts

- `.ufo/waves/round-64/build/K64R2ReviewRows/SOURCES-S198-S200.patch` — minimal diff repairing `S067` and `S198`–`S200` in `corpus/SOURCES.md` and removing the prose block from `## Registry`.
- `.ufo/waves/round-64/w2/K64R2ReviewRows.md` — this report.

## Limits

- Did not edit `corpus/SOURCES.md` or any tracked lane file (L1 integration scope).
- Did not re-run `scripts/report-receipt-diff.mjs` (C1) or `scripts/jj-seat-demo.sh` (checked by dedicated wave-2 seats).
