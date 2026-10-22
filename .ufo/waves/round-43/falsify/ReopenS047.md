RESULT ReopenS047 rev=84cb1d5d8e703aafd4f73d887ba4237692ff13f9 verdict=differs quote_found=yes words=12

# Re-open S047 — Infection official guide (PHP mutation testing)

Row under test: `corpus/SOURCES.md:60` at 84cb1d5d8e703aafd4f73d887ba4237692ff13f9.

Verdict `differs`: the URL, the quote, the line numbers, the file hash and the revision all
verify exactly; the row nevertheless carries a wrong repository name for its own anchor and a
scope parenthetical that its own anchored file contradicts.

## What verified

- URL `https://infection.github.io/guide/` answers HTTP 200 (43231 bytes), page title
  "Introduction | Infection", generator VitePress v1.6.4.
- The anchor file `guide/index.md` at commit 4d7570f512c9ce6e76203ec192b0009a0b3ac4ce is
  HTTP 200, 5041 bytes, sha256 `8a3d6254e64d469b0c7be70957d92c0cf44d174f2917b428bf730f42eae105dc`
  — identical to the row's recorded hash, byte for byte.
- Line 13 holds the sentence. Raw markdown carries emphasis: `... this is called a *killed
  mutant*.` Removing the emphasis asterisks yields the row's quote verbatim; the served page
  carries `<em>killed mutant</em>` and its rendered text contains the quote exactly.
- Line 35 is `* collects the results of killed, escaped Mutants, errors and timeouts`, verbatim.
- Word count of the quote: 12 words (74 characters, sha256 of the quoted string
  `8a78acac6596047a6550b0b23d4b440e5125e7fd1c69d52d60fdfd22eb17a2de`).
- The anchored commit is the head of `main` (compare `4d7570f5...main` → status identical,
  ahead_by 0, behind_by 0); its commit date is 2026-10-14T09:57:05Z and it is still head when
  observed on 2026-10-22, so "main head 2026-10-22" holds as an observation date. The row's
  `used-by` is complete: S047 is cited at `SKILL.md:608` and `corpus/lessons/round-43.md:3,23,70`
  and nowhere under `corpus/knowledge/`.

## Where the row differs

1. Wrong repository name in the locator. The row says "at infection/site commit
   4d7570f512c9ce6e76203ec192b0009a0b3ac4ce". That commit does not exist in `infection/site`:
   the REST commits API returns 422 "No commit found for SHA" and the web commit page returns
   HTTP 404, while the same page on `infection/infection.github.io` returns HTTP 200.
   `infection/site` is the archived Jekyll site (top level `_config.yml`, `src/`, `themes`;
   master head e95e69f9 dated 2026-08-02); its analogue of the file is `src/guide/index.md` with
   sha256 `a6f7aa500a561204a7f64fc9189ad4da91359c768e3528c80baa95d7fa33e9aa`, not the stated
   hash. `infection/infection.github.io` is the VitePress source (`.vitepress`, `guide/`,
   `package.json`) and its `guide/index.md` carries exactly the stated hash. The wave-1 proposal
   named no repository in its locator, but its evidence ran
   `git ls-remote https://github.com/infection/infection.github.io`; the string "infection/site"
   first appears at admission. Fix: name `infection/infection.github.io` in the locator.
2. The scope parenthetical is contradicted by the same anchor file. The row's scope says errors
   and timeouts are "collected as their own outcomes (not the MSI aggregate)". The same 5041-byte
   file says the opposite about the metric: line 94, "MSI is 47%. This means that 47% of all
   generated mutations were detected (i.e. kills, timeouts or fatal errors)", and lines 99-101,
   "TotalDefeatedMutants = KilledCount + TimedOutCount + ErrorCount; MSI = (TotalDefeatedMutants /
   TotalMutantsCount) * 100;". The seat wrote it correctly as an instruction ("Do not cite for the
   MSI aggregate (KilledCount + TimedOutCount + ErrorCount)"); admission turned that into a
   factual parenthetical inside scope, so the row now contradicts its own teaches cell ("never
   cite it for the MSI sum of killed, timed-out and errored"). Fix: drop the parenthetical, or
   keep only the "do not cite" form in teaches and add lines 94-101 to the anchor.
3. Downstream cites reach past the anchor (minor; outside this row). `SKILL.md:608` says "Kill
   vocabulary sourced: S047 (a kill is read off the run's reported failure)", and
   `corpus/lessons/round-43.md:23` lists S047 among the sources for K43 (a)-(c) as a whole. The
   pinned page says nothing about an exit status or a verdict line — `grep -n -i exit` over the
   file prints nothing (exit 1) — so S047 supports "failing tests kill" and the separated
   killed/escaped/errors/timeouts outcome list, not (b) a numeric non-zero exit nor (c) the exact
   `VERDICT: FAIL` line. The sibling page `guide/command-line-options.md` at the same commit
   mentions exit codes only in passing (lines 472, 559), never as a status map.
4. Identifier collision in wave 1 (minor). ScoutSrcKillDef numbered this source S046 and used S047
   for Cosmic Ray; ScoutSrcFlaky used S047 for the PIT FAQ. The registry reassigned S047 to the
   Infection guide and moved Cosmic Ray to S048, so "(seat ScoutSrcKillDef)" is right about the
   seat and wrong about the seat's own id; a reader following S047 into the wave-1 reports lands
   on the PIT FAQ. The seat's proposed row also carried a one-character-wrong SHA (...`b3ac4ec`);
   admission corrected it to ...`b3ac4ce`, which is the true head. No fabrication survives in the
   admitted row, but the repository name is a transcription error introduced at admission.

## Evidence (commands and observed output, seat ReopenS047)

1. `curl -sS -o /dev/null -w "HTTP=%{http_code} time=%{time_total}\n" -L https://infection.github.io/guide/`
   → `HTTP=200 time=0.166006`; served HTML title "Introduction | Infection", generator VitePress v1.6.4.
2. `curl -sS -o idx_4d757.md -w "HTTP=%{http_code} bytes=%{size_download}\n" https://raw.githubusercontent.com/infection/infection.github.io/4d7570f512c9ce6e76203ec192b0009a0b3ac4ce/guide/index.md`
   → `HTTP=200 bytes=5041`; `sha256sum idx_4d757.md` →
   `8a3d6254e64d469b0c7be70957d92c0cf44d174f2917b428bf730f42eae105dc`.
3. Same raw URL on `infection/site` → `HTTP=404 bytes=14`.
4. `api.github.com/repos/infection/site/commits/4d7570f5...` → `HTTP 422`, "No commit found for SHA".
5. `api.github.com/repos/infection/infection.github.io/commits/4d7570f5...` →
   `FOUND 4d7570f5 2026-10-14T09:57:05Z "Document the new --threads=auto option (#4)"`.
6. `github.com/infection/site/commit/4d7570f5...` → `HTTP=404`;
   `github.com/infection/infection.github.io/commit/4d7570f5...` → `HTTP=200`.
7. `compare/4d7570f512c9ce6e76203ec192b0009a0b3ac4ce...main` → `status identical ahead_by 0 behind_by 0`;
   `commits/main` → `4d7570f5... 2026-10-14T09:57:05Z`.
8. `sha256sum` of `src/guide/index.md` at `infection/site` master e95e69f9 →
   `a6f7aa500a561204a7f64fc9189ad4da91359c768e3528c80baa95d7fa33e9aa` (5005 bytes).
9. `nl -ba idx_4d757.md | sed -n '1,40p'` → line 13 the sentence, line 35 the collects bullet.
10. Python check on line 13: raw substring `False`; with emphasis `a *killed mutant*` → `True`;
    after stripping `*` → `True`; `len(quote.split())` → `12`.
11. `printf '%s' "<quote>" | wc -w` → `12`; `wc -c` → `74`.
12. `sed -n '94p;99p;101p' idx_4d757.md` → the MSI sentence, `TotalDefeatedMutants = KilledCount +
    TimedOutCount + ErrorCount;`, `MSI = (TotalDefeatedMutants / TotalMutantsCount) * 100;`.
13. `grep -n -i "exit" idx_4d757.md` → no output, `grep_exit=1`.
14. `curl .../guide/command-line-options.md` → `HTTP=200 bytes=26418`; `grep -n -i -E "exit (code|status)|EXIT_"`
    → lines 472, 559 only, both incidental.
15. Live page text: rendered exact substring of the quote `True`; fragment
    `If mutated program produces failing tests, this is called a <em>killed mutant</em>.`
16. Live page body has `<h1>Introduction</h1>`, which exists only in the anchored revision; the
    archived `infection/site` copy has no such heading, so the served page is built from the
    anchored bytes.
17. `git grep -n "S047"` at 84cb1d5d → `SKILL.md:608`, `corpus/SOURCES.md:60`,
    `corpus/lessons/round-43.md:3,23,70`, plus the two wave-1 build reports (different sources).
18. Seat report `build/ScoutSrcKillDef.md`: `grep -o "4d7570f5[0-9a-f]*"` → line 126 (proposed
    row) `...b3ac4ec`, lines 17 and 155 (evidence) `...b3ac4ce`.
19. No gate, suite or selftest was run (read-only research), so no systemd-run bounds were needed;
    no tool was installed or upgraded; `pgrep -af "kumitate-r43/seats/ReopenS047"` → `none`.

## Confidence and remaining unknowns

Confidence high on every point above: each is an exact-substring, hash, HTTP status or API answer
reproduced this seat. Remaining unknown: whether the shipped site HTML is built from a CI artifact
rather than directly from these bytes is not observable, but the h1 only present in the anchored
revision shows the served text matches it. The row's defects are locator transcription and a
scope parenthetical, both fixable without touching the frozen C1 counter or K43.
