RESULT ScoutMisroot rev=- verdict=clean files=0

Criterion: an untracked file at the fleet root `/home/vgpnk/Projects/shokunin` whose content names kumitate and round 42. Read-only sweep: nothing moved, copied, deleted, staged or committed; no file in the fleet repo was written.

## Evidence

1. `env -u GIT_DIR -u GIT_WORK_TREE -u GIT_INDEX_FILE git -C /home/vgpnk/Projects/shokunin status --porcelain` → 22 lines: 12 ` M` (11 `.ufo/state/*.report-baseline` + `.ufo/watchdog.log`), 5 ` A` (`.ufo/state/{kotoba,kotodama,revenger}.report-baseline`, `scripts/hyaku/__pycache__/append-closure.cpython-314.pyc`, `write`), 5 `??`.
2. `env -u GIT_DIR -u GIT_WORK_TREE -u GIT_INDEX_FILE git -C /home/vgpnk/Projects/shokunin ls-files --others --exclude-standard` → exactly 5 paths: `AGENTS.md`, `live_s228.html`, `nama.html`, `scripts/hyaku/__pycache__/wave-live.cpython-314.pyc`, `tf_bavelas.html`.
3. Untracked list with size and first line (the list this item asks for):
   - `AGENTS.md`, 5921 bytes, line 1 `# AGENTS.md` — fleet protocol introduction; 9 lines name shokunin, 0 name kumitate.
   - `live_s228.html`, 5196 bytes, line 1 `<!DOCTYPE html>` — saved Anubis challenge page (`"anubis_version": "v1.26.2"`).
   - `nama.html`, 68855 bytes, line 1 empty, line 2 `<!DOCTYPE html>` — saved web page.
   - `tf_bavelas.html`, 5583 bytes, line 1 `<!DOCTYPE html><html lang="en-US"><head><title>Just a moment...</title>` — saved Cloudflare challenge page.
   - `scripts/hyaku/__pycache__/wave-live.cpython-314.pyc`, 10708 bytes, binary Python 3.14 bytecode, magic `2b0e0d0a`; source `scripts/hyaku/wave-live.py` is tracked.
4. Content test on each of the five: `grep -a -c -i kumitate` = 0 and `grep -a -c -iE 'round[ _-]?42|\br42\b'` = 0 for every one. Qualifying files = 0.
5. Expected seat names: `find . -maxdepth 2 -type f \( -name 'ScoutMisroot.md' -o -name 'Crit*.md' -o -name 'Mut*.md' -o -name 'Reopen*.md' -o -name 'Review*.md' -o -name 'Sentinel*.md' -o -name 'ReRun*.md' \) -not -path './kumitate-shokunin/*' -not -path './.git/*'` → no output.
6. Lane side: `git -C kumitate-shokunin status --porcelain` → ` M .ufo/waves/round-42/evidence-seat-gate.txt` plus 4 `??` entries, all under `round-42/` (`falsify/`, `final/`, `falsify-dispatch.json`, `falsify-spec.json`); 9 untracked files total, none outside `.ufo/waves/round-42/`.
7. Every file at the fleet root that does name kumitate and round 42 is tracked: `find` (lanes, `.git`, `.jj` pruned) + per-file `git ls-files --error-unmatch` → 32 tracked paths (6 under `.ufo/prompts`/`.ufo/reports` plus root `LOG.md` and `PROTOCOL-APPENDIX.md`; 26 under `.ufo/waves/hyaku/`). Newest is `.ufo/prompts/kumitate-round-42.md`, the round-42 dispatch prompt.
8. `find . -maxdepth 1 \( -iname '*kumitate*' -o -iname '*round*42*' -o -iname '*r42*' \)` → only the lane directory `./kumitate-shokunin`.

## Adjacent misroot artifacts (named, untouched; none qualifies)

9. ` A write` is a real file at the fleet root: `git ls-files -s -- write` → `100644 e69de29bb2d1d6434b8b29ae775ad8c2e48c5391 0 write` (intent-to-add empty blob; `git cat-file -e HEAD:write` exits 128), worktree 25 bytes, content `agent://U100N079H334f935b`, mtime 2026-10-21 19:52:50 -0300. It never appears in `git ls-files --others`, and its content names neither kumitate nor round 42.
10. A larger misroot artifact sits at the fleet root: the regular file `bash: /home/vgpnk/Projects/shokunin/souji-shokunin/tests/tools/souji-verify.sh: No such file or directory`, 10139 bytes, first line `{`, then `"seat": "S54", "kind": "adversarial", "round": 4, "lane": "souji-shokunin"` — a souji round-4 seat payload.
11. `git check-ignore -v` on that path → `.gitignore:1:*-shokunin/` matches it, because the filename embeds `souji-shokunin/`. The `bash: ` tree mtime is 2026-10-18 14:01:47 -0300.
12. Consequence: the prescribed `git status --porcelain` sweep is blind to a misrooted file whose path embeds a lane directory name. This artifact is absent from the 22-line porcelain output and a kumitate or round-42 name with that shape would be invisible too.
13. Three saved web pages sit untracked at the root (`live_s228.html`, `nama.html`, `tf_bavelas.html`); two are anti-bot challenge captures. They are debris, not seat reports.

## Facts, inference, unknowns

- Observed: zero untracked fleet-root files name kumitate and round 42; the untracked set is completely enumerated by `git ls-files --others --exclude-standard`.
- Observed: the fleet root is not debris-free (`write`, the `bash: ` tree, three HTML captures), but none of that debris is a kumitate round-42 seat report.
- Inference (medium): round-42 seat output is landing inside the lane; wave-2 reports on disk at 18:00-18:01 local were all under `.ufo/waves/round-42/falsify/`.
- Gap: `git status --porcelain` alone is not a complete misroot census; a complete pass needs `-uall --ignored` or the content scan used here. Ignored non-lane trees were checked for the same content: `.tower` (holds a kotoba repository probe copy whose LOG/SCORECARD mention both words in kotoba's own round-42 text), `.ruff_cache`, `.ufo/waves/*-scratch`, and the `bash: ` tree; none is a kumitate round-42 seat report.
- Instrument: no lsp server used; this item asks a textual presence question over files, so literal `grep` is the correct instrument, not semantic proof of a symbol.
- No tool installs or upgrades; no writes in the fleet repo. Only this report was written in the lane.
