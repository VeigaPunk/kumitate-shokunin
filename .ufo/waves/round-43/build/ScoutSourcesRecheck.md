RESULT ScoutSourcesRecheck verdict=drift-found rechecked=5 changed=2

Lane revision e5ffcbe7f155b89cb1870f9da7b0d671d092948b; `corpus/SOURCES.md` blob 6617086e696a999c1a6771d7066e14f9a69f7515, identical to the working tree (`git hash-object corpus/SOURCES.md`). 45 rows. Contract read first: `/home/vgpnk/Projects/shokunin/CORPUS.md` § "SOURCES.md — where a shokunin learns" (v1, frozen) — rules 1, 2 and 5 govern what follows.

## Selection (rule as executed, reproducible)

The registry holds no ISO-date recheck values: 14 queued rows, 14 cadences (8 `on-release`, 6 `NNd`). "Recheck date is oldest (or have none)" therefore has one computable meaning — rows with no datable recheck first, since an `on-release` row cannot come due on its own — ordered by oldest `opened`, ties by lowest id:

```
$ awk -F'|' '/^\|[[:space:]]*S[0-9][0-9][0-9]+[[:space:]]*\|/{i=$2;o=$10;r=$11;s=$9;gsub(/^[[:space:]]+|[[:space:]]+$/,"",i);gsub(/^[[:space:]]+|[[:space:]]+$/,"",o);gsub(/^[[:space:]]+|[[:space:]]+$/,"",r);gsub(/^[[:space:]]+|[[:space:]]+$/,"",s); if(s=="queued") printf "%s %s %s\n", i,o,r}' corpus/SOURCES.md | sort -k3,3 -k2,2 -k1,1
S017 2026-10-19 180d   S025 2026-10-20 180d   S011 2026-10-19 365d
S015 2026-10-19 365d   S016 2026-10-19 365d   S028 2026-10-20 90d
S010 2026-10-19 on-release   S013 2026-10-19 on-release   S014 2026-10-19 on-release
S024 2026-10-20 on-release   S026 2026-10-20 on-release   S027 2026-10-20 on-release
S036 2026-10-22 on-release   S037 2026-10-22 on-release
```

Picked: **S010, S013, S014, S024, S026**. S027 is the sixth (same `opened` as S024/S026, excluded by lowest-id tie-break). Next dated queue, not yet due: S028 (2026-10-20 + 90d = 2027-01-18), then S017/S025 (≈2027-04-17/18). No row's `recheck` is overdue today.

All five opened by ordinary HTTP GET (`curl -sS`, desktop UA, no browser, no challenge bypass); none unopened, no installs or upgrades, no scope outside the queue.

| id | URL | HTTP | claim located verbatim | proposal old -> new |
|---|---|---|---|---|
| S010 | modelcontextprotocol.io/specification/2026-07-28/changelog | 200 | yes | status/recheck unchanged |
| S013 | moonshotai.github.io/kimi-code/en/guides/tower.html | 200 | yes (anchor underspecified) | recheck `on-release` -> `90d` |
| S014 | git-scm.com/docs/git-worktree/2.54.0 | 200 | yes; host-version clause stale | unchanged; supersede row at 2.56.0 |
| S024 | github.com/can1357/oh-my-pi/blob/main/docs/mcp-config.md | 200 | yes | recheck `on-release` -> `30d` |
| S026 | github.com/modelcontextprotocol/ext-tasks | 200 | yes | status/recheck unchanged |

## Findings

### S010 — MCP 2026-07-28 changelog — holds, no change
Observed: `200 327368` at the row's URL. § Major changes, first bullet: "Remove protocol-level sessions and the Mcp-Session-Id header from the Streamable HTTP transport." (12 words, verbatim). Same section carries the other three clauses: "Make MCP stateless: remove the initialize / notifications/initialized handshake." (9 words); "Add server/discover" (servers MUST advertise protocol versions); "Multi Round-Trip Requests (MRTR) pattern introduced"; tasks handles "without per-request opt-in ( SEP-2663 )". So `teaches` is fully grounded and the anchor ("§ Major changes, first bullet") is exact.
Currency: `GET https://modelcontextprotocol.io/specification/` → `308` → `200 https://modelcontextprotocol.io/specification/2026-07-28`, i.e. 2026-07-28 is still the current revision and the `on-release` trigger has not fired. Proposal: `queued`/`on-release` unchanged — the trigger is a new revision, and the index redirect is the readable signal for it.

### S013 — Kimi Tower docs — holds; anchor underspecified; cadence change
Observed: `200 41799`. § Safety and resource cost: "Worktrees isolate writes, but they are not a security sandbox." (10 words, verbatim) — this grounds only the `not a security sandbox` clause of `teaches`. The merge-gate clause sits elsewhere: § Understand merges and rebases — "It also requires a valid clean review and merge approval, usually from an independent reviewer." (15 words) — and in the H1 lead (HTML offset 17876, before the first H2): "The tower routes messages and completion reports, and merges only branches that pass its checks." (15 words). One-coordinator clause: "Each workspace can have only one tower coordinator." (8 words); worktree-per-mission: "Every mission has its own branch and Git worktree." (9 words).
Defect: the row's anchor names one section that grounds one of four clauses (contract rule "A quote names its location"). And the page is versionless: counts of `updated`, `revision`, `version`, `last` in its extracted text are 0/0/0/0; the anchor's only freshness datum is "fetched 2026-10-19", so a release event cannot be detected here at all. Proposal: `recheck` `on-release` -> `90d` (a dated cadence is the only guard for a page with no revision marker); `status` queued unchanged; widen the anchor (or supersede) to § Understand merges and rebases + § Safety and resource cost.

### S014 — git-worktree 2.54.0 — BUGS holds at both versions; host clause now false
Observed: `200 98696` at the row's URL. § BUGS, verbatim on both pages: "Multiple checkout in general is still experimental, and the support for submodules is incomplete." (14 words; BUGS text offset 24991 in 2.54.0 vs 25173 on the latest page).
Drift, three parts:
1. `git --version` → `git version 2.56.0`; the row says host git 2.55.0 and "docs lag host 2.55.0". `GET /docs/git-worktree/2.56.0` → `200 98921`, selector "Latest version", body "git-worktree last updated in 2.56.0", changes list "2.56.0 2026-09-28 / 2.55.0 no changes". Docs no longer lag.
2. The 2.54.0 page still serves 2.54.0 text: `diff` of extracted text vs latest = 2 hunks, both the 2.56.0 `add` DWIM wording ("If there are multiple matches, the command fails. If there is no match, the command falls back to creating a new branch from HEAD."), plus the selector label. So the version pin works, but the pinned version is two releases behind.
3. The row's note "the 2.55.0 path redirects here" is now a JS canonical redirect, not HTTP: `/2.55.0` → `301` → `/2.55.0/` → `200 608` stub `window.location.replace(...canonical...)` whose `rel=canonical` is `https://git-scm.com/docs/git-worktree/2.54.0`.
Proposal: `status` queued and `recheck` `on-release` unchanged — release-watching is the correct trigger for release-pinned docs, and the BUGS claim it is scoped to is intact. The stale text is in `scope` and `teaches` ("host git 2.55.0", "docs lag host 2.55.0"), which rule 2 forbids editing in place: the correct fix is a superseding row (next free id S046) anchored § BUGS + § COMMANDS add at 2.56.0 (2026-09-28) with `teaches` opening `supersedes S014 —`, carrying the quote above and the DWIM change.

### S024 — oh-my-pi docs/mcp-config.md — holds; moving-branch anchor; cadence change
Observed: blob URL `200 487937`; content read from `https://raw.githubusercontent.com/can1357/oh-my-pi/main/docs/mcp-config.md` `200 28507`. § Preferred config locations, verbatim (18 words, whitespace-normalized): "for OMP-native configuration you should usually use one of these primary files: - Project: `.omp/mcp.json` - User: `~/.omp/agent/mcp.json`" — supports "primary server-definition files" and the profile path used in the same bullet.
Drift: the row cites "main 10b9b493 (ls-remote 2026-10-20)"; `GET api.github.com/repos/can1357/oh-my-pi/commits/main` → `0b5c27ab24719c86a5986b95ee55f4e75bc1aaa0 2026-10-22T10:22:25Z`, so the branch head moved. The file did not: `commits?path=docs/mcp-config.md` → latest `4ab6de0b20b5 2026-10-16T14:01:35Z`, exactly the row's cited file revision, so the claim is still true at the file's current content.
Wording nit for the next row (not an in-place edit): the doc calls root `mcp.json` / `.mcp.json` "fallback standalone files" and separately says `.omp/.mcp.json` and `~/.omp/agent/.mcp.json` are read "for compatibility"; `teaches`'s "legacy .mcp.json paths are also read for compatibility" merges two documented categories.
Proposal: `recheck` `on-release` -> `30d` — a branch blob has no release event to trigger on, and the path took 5 commits between 2026-10-10 and 2026-10-16 while the head advanced within two days of the row; a dated cadence re-pins the file revision (better still, cite the file at commit 4ab6de0b in the next row's anchor). `status` queued unchanged.

### S026 — MCP Tasks extension — holds, head current, no change
Observed: repo URL `200 331788`; `raw README.md` `200 3427`. Head: `api.github.com/repos/modelcontextprotocol/ext-tasks/commits/main` → `b3d28aceaa6d49f5f92258e3d06b61ad6f111e84 2026-10-20T23:40:57Z` — identical to the row's cited `main b3d28ace`. § Why Tasks?, verbatim: "The Tasks extension lets a receiver return a durable task handle so the requester can follow progress and retrieve the result later." (22 words). § Schemas table lists `2026-07-28` with Status `Stable`; lead gives "(`io.modelcontextprotocol/tasks`), based on SEP-2663". All three clauses of `teaches` grounded; anchor names both sections it uses.
Proposal: `status` queued, `recheck` `on-release` unchanged — the cited head is still head, and the next schema version is a release event the trigger catches.

## Checked and not changed / gaps

- `used-by` stays `—` and `status` stays `queued` for all five: `grep -rlE 'S0(10|13|14|24|26)\b' corpus/knowledge/` → 0 files, so no row has a citation that would justify `mined`, and none of the five claims was falsified.
- Registry-level observation for the aggregator: no queued row carries an ISO-date `recheck` (14/14 cadences), so "oldest recheck" is only computable as `opened` + cadence; rows that should be re-opened on a calendar (S013, S024 after this report) currently cannot say so.
- All five URLs resolve; no source was unopened, no redirect loop, no bot challenge, no credential material touched.

## Commands (exact, as run)

```
curl -sS -o pages/<id>.html -w '%{http_code} %{size_download} %{redirect_url}' --max-time 60 -A 'Mozilla/5.0 (X11; Linux x86_64) source-recheck/1.0' <url>
  S010 200 327368 | S013 200 41799 | S014 200 98696 | S024 200 487937 | S026 200 331788
curl -sS https://api.github.com/repos/can1357/oh-my-pi/commits/main          -> 0b5c27ab... 2026-10-22T10:22:25Z
curl -sS 'https://api.github.com/repos/can1357/oh-my-pi/commits?path=docs/mcp-config.md&per_page=5' -> 4ab6de0b 2026-10-16 (latest for that path)
curl -sS https://api.github.com/repos/modelcontextprotocol/ext-tasks/commits/main -> b3d28ace... 2026-10-20T23:40:57Z
curl -sS -o GIT2.56.0.html -w '%{http_code} %{size_download}' https://git-scm.com/docs/git-worktree/2.56.0      -> 200 98921 ("Latest version"; "last updated in 2.56.0")
curl -sS -o GIT2.55.0.html -w '%{http_code}' https://git-scm.com/docs/git-worktree/2.55.0                     -> 301 -> /2.55.0/ 200 608 (JS canonical -> /2.54.0)
curl -sSL -o MCPINDEX.html -w '%{http_code} %{url_effective}' https://modelcontextprotocol.io/specification/ -> 200 .../specification/2026-07-28
git --version -> git version 2.56.0
```

quote check method: fetch → strip `<script|style>` and tags → unescape → collapse whitespace → substring test of the quoted sentence; all five `verbatim=True`, word counts 12 / 10 / 14 / 18 / 22.
