RESULT CtlQuoteRerun rev=a2e5b54c verdict=reproduces fabricated=MISSING oneword=MISSING mutants_killed=2/3
Axes: coverage (quote-control discrimination), operability (bounded execution and exact restoration). No entry judgment.
Scratch: `/fast/scratch/hyaku/kumitate-r45/seats/a2-CtlQuoteRerun/`. Only this report was written inside the lane.
Command: `unset $(git rev-parse --local-env-vars); env -u GIT_DIR -u GIT_WORK_TREE -u GIT_INDEX_FILE git clone -q --no-hardlinks /home/vgpnk/Projects/shokunin/kumitate-shokunin /fast/scratch/hyaku/kumitate-r45/seats/a2-CtlQuoteRerun/lane && git -C /fast/scratch/hyaku/kumitate-r45/seats/a2-CtlQuoteRerun/lane checkout -q --detach a2e5b54cdd2c4cbf72cb0b2ab4ed53e2fe0d730f` → exit 0, no output.
Command: `git -C /fast/scratch/hyaku/kumitate-r45/seats/a2-CtlQuoteRerun/lane rev-parse HEAD` with repository-local environment names unset → `a2e5b54cdd2c4cbf72cb0b2ab4ed53e2fe0d730f`.
Both copied scripts initially matched the frozen `.txt` bytes exactly. No inherited rows.tsv or bodies were copied; the inherited receipt was read only after independent runs.
Command C, used unchanged for every detector run: `systemd-run --user --scope --quiet -p MemoryMax=4G -p TasksMax=128 timeout -s KILL 900 python3 /fast/scratch/hyaku/kumitate-r45/seats/a2-CtlQuoteRerun/detector.py`; cwd was the scratch root.
The detector requires exactly six REOPEN rows, G006/G031 FOUND and FAB/ONE/VAR/EMPTY MISSING, and procedure exit 0; a mismatch exits 1.
Raw stdout, stderr and exit codes for every run, including calibration, are in scratch `runs.json`; primary evidence is `requested_six_row_runs_scored`.
Final rows.tsv sha256: `9c4085f42b5de1c9f3946f4718924007bc0eec96d175fc39136e5512c69a23b8`.
Detector.py sha256: `8e43f54b6beb4748e028c88b9783e30b5a60387e33d335ef48ba61979ae6b79d`.
Rows below are my independently constructed inputs. Word-count command for each was `bash -c 'printf '"'"'%s'"'"' "$1" | wc -w' _ <quote>`; outputs are in parentheses.
G006, S006: https://moonshotai.github.io/kimi-code/en/configuration/config-files.html ; lesson round-34.md:100, prefix of its Gate quote: "A spawn resolves the subagent's model in this order:" (9).
G031, S031: https://git-scm.com/docs/git-rev-parse ; lesson round-36.md:49, Gate quote: "If so, emit it to the standard output; otherwise, error out." (11).
FAB, G031 URL, fabricated: "If so, emit it to the lunar teapot; otherwise, invent success." (11).
ONE, G031 URL, exactly output → input: "If so, emit it to the standard input; otherwise, error out." (11).
VAR, G006 URL, exactly U+0027 → U+2019: "A spawn resolves the subagent’s model in this order:" (9).
EMPTY, https://httpbin.org/status/404 , G031’s unchanged genuine quote at the wrong URL (11).
Procedure fetch command: `curl -sSL --max-time 60 -A 'kumitate-quote-reopen/1.0' -o "$body" -w '%{http_code}' "$url"`.
G006 fetch: HTTP 200, 124126 bytes, body sha256 `71c87605ad494a9d3d604f77765eb5a2766d835a11c6d2085e15fb265644b78e`; `bodies/73e337e4d8acaead.html:140`, under secondary_model, carries `subagent&#39;s`.
G031 fetch: HTTP 200, 122463 bytes, body sha256 `64c603545b3f9799cc9525228ba70cf80444a063b32a4be37de2a5ca09b83421`; `bodies/a50eccd4db87b5d3.html:2722-2723`, --verify paragraph.
EMPTY fetch on every run: HTTP 404, 0 bytes, body sha256 `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855`.
Nonempty source bodies were cached unchanged for baseline, mutants and restorations; EMPTY was re-fetched because the procedure does not cache zero-length files.
Actual C outputs below list REOPEN verdicts in G006/G031/FAB/ONE/VAR/EMPTY order. Every procedure_exit was 0.
| Run | Detector exit | REOPEN outputs | Detector output |
|---|---:|---|---|
| baseline | 0 | FOUND/FOUND/MISSING/MISSING/MISSING/MISSING | DETECTOR: PASS failures=none procedure_exit=0 |
| grep-i | 0 | FOUND/FOUND/MISSING/MISSING/MISSING/MISSING | DETECTOR: PASS failures=none procedure_exit=0 |
| restored-grep-i | 0 | FOUND/FOUND/MISSING/MISSING/MISSING/MISSING | DETECTOR: PASS failures=none procedure_exit=0 |
| skip-entity | 1 | MISSING/FOUND/MISSING/MISSING/MISSING/MISSING | DETECTOR: FAIL failures=G006 procedure_exit=0 |
| restored-skip-entity | 0 | FOUND/FOUND/MISSING/MISSING/MISSING/MISSING | DETECTOR: PASS failures=none procedure_exit=0 |
| first-five | 1 | FOUND/FOUND/FOUND/FOUND/MISSING/MISSING | DETECTOR: FAIL failures=FAB,ONE procedure_exit=0 |
| restored-first-five | 0 | FOUND/FOUND/MISSING/MISSING/MISSING/MISSING | DETECTOR: PASS failures=none procedure_exit=0 |
grep-i mutant: reopen-quote.sh:50 `grep -qF` → `grep -qi`; SURVIVED the requested six rows. This is a coverage finding, not permission to weaken verbatim matching.
Its script sha256 before → mutant → restored: `41ffd87fc7394e6850ac62e5a316db0f9fd5a807e9906eb8880fccb4582a22ba` → `8ac52793ebb36626f9b02e348a018cb140e0de36d30149d8b4f0916972995554` → original.
skip-entity mutant: remove normalize.py:30 `data = html.unescape(data)`; KILLED by G006 changing FOUND → MISSING.
Its normalizer sha256 before → mutant → restored: `87ba6408cf03421750559586f0b669ce1def811b326ed47a1f49547e149729d8` → `cc3816540078ca8d93b77c4e03b630bd54548b9189b0a54f2b4eac91c13e3540` → original.
first-five mutant: reopen-quote.sh:48 becomes `nq=$(norm_quote "$quote" | cut -d' ' -f1-5)`; KILLED by FAB and ONE changing MISSING → FOUND.
Its script sha256 before → mutant → restored: `41ffd87fc7394e6850ac62e5a316db0f9fd5a807e9906eb8880fccb4582a22ba` → `c30ac2d4131fac786794ba28d09e8570b895e757aa20e170f2f9b5dab1e819d5` → original.
Each mutant was removed before the next. Final byte equality against both saved pristine scripts was True; restored detector runs above all passed.
CONFIRMED on independently chosen rows: two authentic excerpts FOUND, fabricated and semantic one-word changes MISSING. PARTIAL for inherited wrong-locator coverage: a genuine quote at a 404 was MISSING; the original S027-on-S014 pairing was not rerun.
CONFIRMED apostrophe limitation: VAR remains MISSING in pristine and restored runs. These committed scripts do not implement the apostrophe folding required by plan E7/K3.
Initial calibration used the entire S006 Gate quote, including generated list marker `1.`: G006 MISSING, G031 FOUND, others MISSING; C exited 1 (`failures=G006`). That baseline is inconclusive and scores no kill.
The fetched HTML has `<ol><li>` without literal `1.`. The primary six-row batch therefore uses the nine-word verbatim prefix already present in that Gate quote; it passed before all scored mutations.
A separate seven-row diagnostic added a case-only `out.` → `OUT.` quote: pristine/restored MISSING, grep-i FOUND, detector exit 1. That extra row kills grep-i, but is not counted in the requested-six result (2/3). Its outputs are preserved, not substituted for the scored batch.
After every bounded run, `pgrep -af /fast/scratch/hyaku/kumitate-r45/seats/a2-CtlQuoteRerun` returned exit 1 with no output. No background jobs remain.
`du -sh /fast/scratch/hyaku/kumitate-r45/seats/a2-CtlQuoteRerun` → `52M`; no large temporary demo files were created. No tool installations or updates.
No git/jj writes occurred in the lane or fleet repository, no sibling files were touched, and no operator configuration or secret contents were read. No source-access challenge or provider refusal occurred.
