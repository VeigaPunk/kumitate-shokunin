VERDICT: Surface is clean on credentials (no token/cookie in any capture; the GitHub capture is anonymous), on network scope (only the four in-scope hosts were fetched), on scratch bounds (8/11 landed reports name their `<Seat>` dir under `/fast/scratch/hyaku/kumitate-r68/`, every checked dir deleted, no `/tmp` build) and on REA (`disabledServers:["rea"]`); the one real defect is evidence-hygiene — a 404 page and a 127 KB Next.js error dump sit in the wave build tree under `.md` source-capture names, which M3 (sha/bytes/path only) cannot distinguish from a real capture.

## Evidence

(1) Credentials — no material.
```
$ grep -rniE 'id_token|access_token|refresh_token|Bearer [A-Za-z0-9._-]{20,}|sessionid=|_gh_sess|user_session|csrf-token|ghp_|github_pat_|AKIA' \
    .ufo/waves/round-68/build/ .ufo/waves/round-66/build/ --include='*.md' --include='*.html' --include='*.ts' --include='*.txt' --include='*.patch'
.ufo/waves/round-66/build/K66ScribeQuality/stage/SKILL.md:134:`task_[a-f0-9]{24}` / `runId=gq[a-f0-9]{16}` / `sessionId=omp-<runId>`;   <- a documented pattern, not a value
.ufo/waves/round-66/build/K66ReviewStagedClaims/captures/haning.html:252: ... 声明 <code>refresh_token</code> 授权类型 ...            <- spec prose
$ for p in csrf-token visitor_id _gh_sess user_session logged-in octolytics; do grep -c -- "$p" build/K68ScribeRows/captures/S210-pr2596.html; done
csrf-token: 0   visitor_id: 0   _gh_sess: 0   user_session: 0   logged-in: 0   octolytics: 2
$ grep -oE '<meta name="octolytics[^>]*>' S210-pr2596.html   # repo-owner metadata, not the fetcher
<meta name="octolytics-dimension-user_login" content="modelcontextprotocol" />
$ grep -oE '"logged_in":[a-z]*' S210-pr2596.html
"logged_in":false
$ grep -rniE 'authorization:|GH_TOKEN|GITHUB_TOKEN' .ufo/waves/round-68/   # excluding spec/dispatch
(no output)
$ grep -rhoE 'https?://[^ ")]*[?&](token|key|access_token|auth|sig|code)=' .ufo/waves/round-68/build/
(no output)
```
Earlier hits in `w1-spec.json`, `w1-dispatch.json`, `w1-validate.out`, `build-spec.py` are this seat's own prompt text quoting the pattern names; no capture carries a value.

(2) Network scope — four in-scope destinations, nothing else fetched.
```
$ for f in build/captures/* build/K68ScoutS207/captures/* build/K68ScribeRows/captures/*; do head -c 300 "$f"; done
deprecated-2026-07-28.md   -> modelcontextprotocol.io/specification/2026-07-28/deprecated.md  (explicit `fetched:` header)
feature-lifecycle.md       -> modelcontextprotocol.io/community/feature-lifecycle.md
sep2596.md / S210-pr2596.html -> modelcontextprotocol.io SEP-2596 and github.com/.../pull/2596
sse-v18.12.6.ts / sse-v18.13.1.ts -> raw.githubusercontent.com/can1357/oh-my-pi/v18.12.6|v18.13.1/.../transports/sse.ts
S213-commit-183238ddac.json -> api.github.com/repos/modelcontextprotocol/modelcontextprotocol/commits/183238ddac
$ grep -rhoE '(gh api|curl -[a-zA-Z]+|wget|git clone|npx )' build/   -> 2x "curl -fsSL", 3x "curl -sS", 3x "curl -sSL"; no wget/gh api/clone
```
Hosts appearing inside captured HTML only (githubassets, avatars.githubusercontent, docs.github.com, mintcdn, w3.org, schema.org, …) are sub-resource strings in the page bytes, not fetches. Only non-HTTP destination in the round is the L1 freeze push: `.jj` op `"push bookmark master to git remote origin"`, `origin = https://github.com/VeigaPunk/kumitate-shokunin.git` (no credential in the URL).

(3) Scratch hygiene — 11 reports had landed; 8 name a `<Seat>` scratch path under `/fast/scratch/hyaku/kumitate-r68/`, 3 name none (finding -5); 0 `/tmp/` refs anywhere.
```
$ for f in *.md; do grep -oE '/fast/scratch/hyaku/kumitate-r68/[A-Za-z0-9_.-]+' "$f" | sort -u; grep -c '/tmp/' "$f"; done
K68ExecDemoJj / K68ExecPins / K68ExecProxyStanza / K68ScoutItemsA / K68ScoutS209 / K68ScribeReadmeRows / K68ScribeSkillRow
  -> /fast/scratch/hyaku/kumitate-r68/<Seat>  , tmp=0
K68ScoutOmpBinary.md  K68ExecReadmeFix.md  K68ScribeRows.md  -> scratch=[NONE] tmp=0
$ for s in K68ExecDemoJj K68ExecPins K68ScoutItemsA K68ScoutOmpBinary K68ScoutS209 K68ExecProxyStanza K68ScribeSkillRow; do [ -d /fast/scratch/hyaku/kumitate-r68/$s ] && echo PRESENT || echo deleted; done
deleted x7
$ ls /tmp | grep -iE 'kumitate|r68|ledger68|deprec68'   -> /tmp/closure-round-67-kumitate.json only (round 67, not this round)
```

(4) Pins stay inside the lane — M3 predicate reproduced verbatim from `probe/deprec68-probe.mjs:196-199`, no bypass:
```
$ node build/K68SentinelScope/m3-harness.txt   (m3harness.mjs, guard() = lines 196-199)
"corpus/captures/s207.md"        -> allowed:<A>/corpus/captures/s207.md
"../etc/passwd"                  -> path-escape
".ufo/../../../etc/passwd"       -> path-escape
"/etc/passwd"                    -> path-escape
""  /  "."                       -> path-outside
"a/../.."  ".//../../x"          -> path-escape
"corpus/../x"                    -> allowed:<A>/x            (normalizes inside the extraction: safe)
"C:\\tmp\\x"                     -> allowed:<A>/C:\tmp\x     (a filename inside the extraction: safe, absent on Linux)
"sub/.."                         -> path-outside
$ python3 -c '...escaping...'  -> captures 38 escaping 0 ; dup sourceIds: []
$ tail -3 build/K68ExecPins/validation.txt -> COUNTER_PINS: CLEAN pins=34 / COUNTER_PINS_SELFTEST: PASS (11/11) / exit=0
```
`scripts/source-capture.mjs:194-204` (the M9 arm) resolves `realpathSync` then `relative(baseReal,targetReal)` and refuses `..` — symlinked and escaping captures are DRIFT, not CLEAN.
Pin drafts for S207–S213 had NOT landed at sweep time: `source-captures.json` still holds 38 captures, last id `S206` (re-checked at the end of the sweep).

(5) REA MCP disabled — no seat can address it.
```
$ python3 -c "d=json.load(open('/home/vgpnk/.omp/agent/mcp.json')); print(d['disabledServers']); print('rea' in d['disabledServers'])"
["rea"]   True
$ grep -rliE 'mcp__rea|rea_mcp|rea-mcp' .ufo/waves/round-68/w1/   -> (no output; 7 reports present)
```
`rea` remains defined in `mcpServers` (stdio `npx -y rea-agents@6.7.0`) and is disabled by name — the disable is a config file one edit away from re-enabling, which is the standing risk, not a this-round finding.

## Findings

**K68SentinelScope-1 — MEDIUM — evidence substitution: a 404 page and an error dump are stored as source captures.**
Attacks: the C2 evidence chain (M2/M3/M4) and any reader who trusts the build tree. `build/captures/transports-2025-11-05.md` (831 B) is the docs' "Page Not Found" body; `build/K68ScribeRows/captures/S211-transports-2025-11-05.md` (127278 B) is a Next.js `<html id="__next_error__">` error dump — both named like captures of the 2025-11-05 Transports page, which does not exist. M3 checks path + sha256 + bytes only, so either file would pass a pin; only M4 (quote must appear in the capture) refuses it, and only after the pin is written. The correct artifact is `S211b-transports-2025-11-25.md` (16321 B, real page). The seat documented the 404 (`build/K68ScribeRows/…` note: "the seat brief's pattern `specification/2025-11-05/basic/transports` answers 404 (127278 B error page)"), so this is a residue problem, not a misreading.
Repro: `grep -c '__next_error__\|Page Not Found' .ufo/waves/round-68/build/captures/transports-2025-11-05.md .ufo/waves/round-68/build/K68ScribeRows/captures/S211-transports-2025-11-05.md`
Smallest remediation: rename both to `…-404.html`/`…-404.md` (or delete) before integration so no pin can reach them.

**K68SentinelScope-2 — MEDIUM — 288 KB of captures sits outside every `build/<Seat>/` (`build/captures/`).**
Attacks: provenance. Six files (`deprecated-2026-07-28.md`, `feature-lifecycle.md`, `sep2596.md`, `sse-v18.12.6.ts`, `sse-v18.13.1.ts`, `transports-2025-11-05.md`, mtime 11:55) belong to no seat and are byte-identical to seat copies where a counterpart exists (`sha256 c12c3cb7…` = `K68ScribeRows/captures/S207-deprecated.md`), while `K68ScoutS207/captures/deprecated-2026-07-28.md` is a third variant (`227bfbad…`, +111 B `fetched:` header). A pin into this dir cannot name who fetched what, and one member is the 404 stub of finding -1.
Repro: `du -sh .ufo/waves/round-68/build/captures; sha256sum .ufo/waves/round-68/build/captures/deprecated-2026-07-28.md .ufo/waves/round-68/build/K68ScribeRows/captures/S207-deprecated.md`
Smallest remediation: drop the dir, or move it under the seat that produced it before any pin cites it.

**K68SentinelScope-3 — LOW — capture type/extension confusion.**
`S211-transports-2025-11-05.md` is 127 KB of HTML in a `.md` name; `S210-pr2596.html` is correctly typed. Anyone diffing "markdown" captures gets a page that is neither markdown nor the requested page. Repro: `file`-free check `head -c 60 .ufo/waves/round-68/build/K68ScribeRows/captures/S211-transports-2025-11-05.md` → `<!DOCTYPE html><html id="__next_error__">`. Remediation: fold into -1.

**K68SentinelScope-4 — LOW — shared scratch root holds 10 non-seat entries from pre-wave rehearsals.**
Attacks: seat isolation. `/fast/scratch/hyaku/kumitate-r68/` contains `c1-controls-autoledger`, `c1-controls-donothing`, `c2-donothing`, `dbg`, `fixtest`, `fixtest-out.txt`, `ledger67.PrfCXb`, `ledger67.p0SM8A`, `outside-tool.mjs`, `witness-deprec` beside 67 `K68*` seat dirs. All predate wave dispatch (11:11–11:49 vs registry `createdAt 14:50:20Z` = 11:50 local), so no seat is at fault; but `outside-tool.mjs` is exactly the L7 fixture a seat copies, and any seat that derives the round root as its own scratch and `rm -rf`s it destroys every sibling. Repro: `ls -la --time-style=+%H:%M /fast/scratch/hyaku/kumitate-r68/ | grep -v K68`. Remediation: keep L1 rehearsal scratch in `<Round>/_l1/`.

**K68SentinelScope-5 — LOW — 3 of 11 landed seat reports omit the mandated scratch path; one also claimed a deletion that had not happened.**
`K68ScoutOmpBinary.md`, `K68ExecReadmeFix.md` ("placeholders in a scratch copy", line 21) and `K68ScribeRows.md` ("scratch `lane`", line 29) name no `/fast/scratch/hyaku/kumitate-r68/<Seat>` path, so their scratch bounds are unattributable from the report alone. `build/K68ScoutOmpBinary/evidence.md:4` additionally says "(scratch, since deleted)" while at 11:57 the dir still held files; it was gone when the seat yielded, so that sentence is true-at-yield / false-at-write. Repro: `grep -c '/fast/scratch' .ufo/waves/round-68/w1/K68ScoutOmpBinary.md .ufo/waves/round-68/w1/K68ExecReadmeFix.md .ufo/waves/round-68/w1/K68ScribeRows.md` → 0 0 0. Remediation: report-shape gate at validation time (the validator already parses these files), not a per-seat chase.

**K68SentinelScope-6 — INFO — frozen counter `ledger68-probe.mjs` docstring overstates symlink refusal; no predicate gap.**
Header lines 32-33 say "a revision containing any symlink or non-regular file fails closed `EXTRACTION_UNSAFE`", but `walk()` (lines 83-90) only returns special files and `extract()` closes with "symlinks are tolerated in evidence trees but NEVER followed". Implementation matches the frozen plan's L7 (static read paths incl. the twelve spot-checks via `spotPath(n)`, line 279), and answer-file reads go through `rd()`/`chainSafe` (line 259) so a symlinked answer yields `EXTRACTION_UNSAFE` — never a false HELD. Not an in-place edit (frozen); a comment-only strengthening candidate for the L1's ratchet.
Evidence: `sed -n '26,40p;77,95p;276,285p' .ufo/waves/round-68/probe/ledger68-probe.mjs`

**K68SentinelScope-7 — INFO — S209 and S212 captures are byte-identical (`0b69229a…`).**
`sse.ts` is unchanged between v18.12.6 and v18.13.1, so the two rows may cite the same bytes; M3 keys on `sourceId` and the registry currently has no duplicate ids, but a pin may not reuse one *file* for both without the row URL staying distinct (M5 re-fetches the row URL, so this is caught). Note for the L1, not a defect.

## Artifacts
- `/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-68/w1/K68SentinelScope.md` (this report)
- `/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-68/build/K68SentinelScope/m3harness.mjs`, `m3-harness.txt` (verbatim M3 predicate + bypass table)

## Limits
- Pin drafts for S207–S213 had not landed (`source-captures.json` = 38 captures, last `S206`); item (4) is verified against the M3 predicate and `source-capture.mjs`, not against the eventual pin content — re-run only `deprec68-probe.mjs` M3 once they land.
- Only 11 of the expected ~66 seat reports had landed at sweep time (wave still live); scratch hygiene covers all 11, the rest unchecked.
- `K68ExecReadmeFix` and `K68ScribeRows` scratch dirs were still present when their reports were read; re-checked after they finished: both deleted (in-flight cleanup, not a miss).
- No pacman/uv/npm install was run (nothing needed).
- Scratch `/fast/scratch/hyaku/kumitate-r68/K68SentinelScope/` deleted on exit; no lane file outside my report and build dir was written.
