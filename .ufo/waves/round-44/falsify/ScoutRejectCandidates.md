RESULT ScoutRejectCandidates rev=8e822511 verdict=found candidates=3

Lane tip 8e8225114dccb31d33fbcb76df78052807a33068 (`master`); counter in force `probe/p44d-count.mjs`
(sha256 `9ea97d86…`), measured commit `d81978cd`. I wrote only this file. Sources opened by ordinary
means: `curl -sSL` for pages, `gh api` for the issue state, one depth-1 clone of oh-my-pi at tag
v18.12.6 (`45c35e40c46166dc726ccc52f5d27f40f2449f99`) for the code checks. No browser, no challenge
or captcha passed, no installs or upgrades, no git or jj writes anywhere, no member content under
`~/.omp/agent` read. Scratch: `/fast/scratch/hyaku/kumitate-r44/seats/w2-ScoutRejectCandidates/`.

Three candidate sources about OMP's agent directory or SQLite sidecar lifetimes that the round record
should REJECT, written in the Q21 decision shape (`Reject <candidate> — criterion missed — flip:`).
None of the three appears in `corpus/SOURCES.md` (`grep` for all five names/ids: no hit).

## 1. Agent Context Sync vendor page on oh-my-pi — third-party, disagrees with the pinned release

- URL `https://www.agentctxsync.com/en/agents/oh-my-pi/`; HTTP 200; access 2026-10-23T01:56:18Z;
  14921 bytes; sha256 `43bff94be4fba194f693e2374ee3d60dd5b336fd3d716731193d46e145a94c91`.
- Verbatim (8 words): "Override set OMP_CODING_AGENT_DIR and the adapter follows it". The page also
  states: "Oh My Pi (omp) stores sessions under ~/.omp/agent/sessions/." (10 words; page JSON-LD
  `dateModified` 2026-09-17).
- The round should reject it because the override name does not exist in the release it describes:
  `OMP_CODING_AGENT_DIR` has 0 hits in the v18.12.6 tree; the release reads `PI_CODING_AGENT_DIR`
  (271 hits; `packages/utils/src/dirs.ts:5`, `:474`, `:496`;
  `docs/environment-variables.md:564` "Full agent-directory override for the default profile only").
  A census row citing this page for the agent root would name a variable that cannot relocate it.
- Criterion missed: Q2 — a vendor page for its own sync connector is community tier, never sole
  support, and the `sessions/` member is already sourced by the primary `dirs.ts:999`
  (`agentSubdir(agentDir, "sessions", "data")`); also Q8 — it names no host version or revision gap.
- Flip: `OMP_CODING_AGENT_DIR` appears in the pinned tree (or in the installed `omp/18.12.6` binary)
  as the agent-dir override, or the page is re-opened naming v18.12.6 with a code anchor. Even then
  it corroborates; it never supplies a rule, because S053 remains the writer row.

## 2. oh-my-pi issue #4824, "Project-Local Memory & Session Storage" — an open proposal, not a writer

- URL `https://github.com/can1357/oh-my-pi/issues/4824`; HTTP 200; access 2026-10-23T01:56:21Z;
  305299 bytes; sha256 `11e4c8134c612d17172a1f8ecbf49c708dac571d419727cdb4c8318d3911e8ab`.
  `gh api` in the same batch just after that fetch: `state=open`, `created_at=2026-07-08T05:29:22Z`,
  `updated_at=2026-07-14T16:34:08Z`, author `sanathusk`.
- Verbatim (19 words): "Today, all OMP agent state — session JSONL files, memory artifacts
  (MEMORY.md, memory_summary.md, generated skills), and Mnemosyne SQLite databases".
- The round should reject it because a feature request is a plan, not a writer, and its member names
  are not depth-1 members: `MEMORY.md` and `memory_summary.md` are written at
  `getMemoryRoot = join(getMemoriesDir(agentDir), encodeProjectPath(cwd))`
  (`packages/coding-agent/src/memories/index.ts:1397-1399`, writes at `:1108-1109`;
  `dirs.ts:1032-1034` gives `~/.omp/agent/memories`), i.e. three levels below the root the census
  reads (`probe/p44-shape.tsv` header: "depth 1"). The frozen shape has no `memories` entry at all,
  so a census rule keyed on those names would declare members no release writes at that path, and
  the page's proposed project-local `.omp/agent/` is outside the census root entirely.
- Criterion missed: Q2 — the census contract admits only rules whose writer is cited from an opened
  row, and a proposal cites none; also Q8 — no revision is named, and the issue predates the
  installed `omp/18.12.6` by about three and a half months.
- Flip: the proposal ships and a release tag writes those members under the census root as read
  (depth 1), or the census contract widens past depth 1 — then re-open at that tag and cite the code
  line, not the issue.

## 3. SQLite User Forum thread "WAL files deleted" — a 2021 community post whose absolute its own thread refutes

- URL `https://sqlite.org/forum/info/5cbc6fde4357c8bd`; HTTP 200; access 2026-10-23T01:56:20Z;
  95991 bytes; sha256 `3802006ddf1f89920ba8014d8b2e4ef8d0f36a1a52b19b523e331e09ae61e41e`.
- Verbatim (20 words): "The -wal and -shm files should always be deleted when closing the last
  connection to a database in WAL mode" — post (4), By Keith Medcalf (kmedcalf), 2021-04-29
  17:44:20, in a thread about SQLite 3.35.5 versus 3.28.0.
- The round should reject it as a support for a sidecar rule because the same thread contradicts the
  absolute: post (3), By Larry Brasfield (larrybr), 2021-04-29 16:55:26, verbatim: "I don't believe
  the duration of those files, when left to default behavior, was guaranteed. If it changed, it is
  still within the API specification." The primary already mined (S056, `wal.html` §4) says
  "Usually, the WAL file is deleted automatically when the last connection to the database closes."
  A census rule keyed on "always deleted" would make the healthy frozen shape read DRIFT, because
  that shape carries sidecars (`agent.db-wal`, `history.db-wal`, `models.db-wal`,
  `skill-descriptions.db-wal` and their `-shm`, all present in `p44-shape.tsv`).
- Criterion missed: Q2 — a forum post is community tier and is never sole support, and it cites no
  writer; also Q18 — the quoted "always" is a lexical claim about a range the same thread shows was
  never a guarantee, so a rule built on the quote is not a semantic reading of the source.
- Flip: sqlite.org's own documentation at the bundled SQLite version states deletion is guaranteed
  unless `SQLITE_FCNTL_PERSIST_WAL` is set, or a maintainer-authored post at that version asserts the
  guarantee. In either case the row must cite the documentation section (S056's scope), not this
  thread.

## Recorded, not counted

- Mirror `https://web.archive.org/web/2025id_/https://www.sqlite.org/wal.html`: HTTP 200, access
  2026-10-23T01:57:22Z, 37572 bytes, sha256 `45f9992d2e5322c8f5da6e9c95feb6385487744466b1f33beecdb8d2562e022c`;
  it carries the same "Usually, the WAL file is deleted automatically when the …" wording, so it
  adds nothing the live primary (S056, Last-Modified 2026-10-22) does not say. Reject class: stale
  mirror redundant with a reachable primary. Flip: the live page stops answering and a capture
  postdates the last known change.
- `https://deepwiki.com/can1357/oh-my-pi/3.1-session-lifecycle`: HTTP 429 at 01:56:19Z and again at
  01:57:03Z, 34218 / 34228 bytes. Recorded as unopened; no quote is claimed for it.

## Evidence (commands and observed output)

```
$ date -u +%FT%TZ
2026-10-23T01:54:48Z
$ curl -sSL --max-time 45 -o <file> -w '%{http_code}' <url>   # five URLs, 01:56:18Z-01:56:21Z
2026-10-23T01:56:18Z HTTP=200 bytes=14921  https://www.agentctxsync.com/en/agents/oh-my-pi/
2026-10-23T01:56:19Z HTTP=429 bytes=34218  https://deepwiki.com/can1357/oh-my-pi/3.1-session-lifecycle
2026-10-23T01:56:19Z HTTP=200 bytes=146147 https://fly.io/blog/wal-mode-in-litefs/      (not a candidate)
2026-10-23T01:56:20Z HTTP=200 bytes=95991  https://sqlite.org/forum/info/5cbc6fde4357c8bd
2026-10-23T01:56:21Z HTTP=200 bytes=305299 https://github.com/can1357/oh-my-pi/issues/4824
$ curl ... https://web.archive.org/web/2025id_/https://www.sqlite.org/wal.html
2026-10-23T01:57:22Z HTTP=200 bytes=37572
$ gh api repos/can1357/oh-my-pi/issues/4824 --jq '{number,state,created_at,updated_at,user:.user.login}'
{"created_at":"2026-07-08T05:29:22Z","number":4824,"state":"open","updated_at":"2026-07-14T16:34:08Z","user":"sanathusk"}
$ grep -rn 'OMP_CODING_AGENT_DIR' packages crates | wc -l   # in the v18.12.6 clone
0
$ grep -rn 'PI_CODING_AGENT_DIR' packages crates | wc -l
271
$ grep -n 'PI_CODING_AGENT_DIR' docs/environment-variables.md
564:| `PI_CODING_AGENT_DIR` | Full agent-directory override for the default profile only; named profiles ignore it |
$ grep -rn 'agentSubdir(agentDir, "sessions"' packages/utils/src/dirs.ts
999:	return dirs.agentSubdir(agentDir, "sessions", "data");
$ grep -rn 'function getMemoryRoot' -A2 packages/coding-agent/src/memories/index.ts
1397:export function getMemoryRoot(agentDir: string, cwd: string): string {
1398:	return path.join(getMemoriesDir(agentDir), encodeProjectPath(normalizeScopeCwd(cwd)));
$ grep -n 'memories' packages/utils/src/dirs.ts
1032:/** Get the memories directory (~/.omp/agent/memories). */
1034:	return dirs.agentSubdir(agentDir, "memories", "state");
$ grep -n 'should always be deleted\|I don.t believe the duration' <forum page text>
(4) By Keith Medcalf (kmedcalf) on 2021-04-29 17:44:20 ... The -wal and -shm files should always be deleted ...
(3) By Larry Brasfield (larrybr ) on 2021-04-29 16:55:26 ... I don't believe the duration of those files, when left to default behavior, was guaranteed. ...
$ awk -F'\t' '{print $1"\t"$2"\t"$3}' p44-shape.tsv   # frozen shape, sha256 fcf9fcb6…
38 entries, depth 1; sidecars present: agent.db-wal/-shm, history.db-wal/-shm, models.db-wal/-shm, skill-descriptions.db-wal/-shm
no `memories` entry at depth 1
$ grep -n 'agentctxsync|4824|5cbc6fde4357c8bd|noahlaratta|fly.io|web.archive' corpus/SOURCES.md   # no hit
$ pgrep -cf 'w2-ScoutRejectCandidates'
0
```

## Remaining unknowns

- Whether `OMP_CODING_AGENT_DIR` is read by the installed harness binary rather than the coding-agent
  release: not checked (would require reading the installed binary; the release tree has 0 hits, and
  the census rule is pinned to the release, so the reject stands either way for this scope).
- The exact bundled SQLite version OMP 18.12.6 links: not measured here; the forum thread's 3.35.5
  context is a further skew reason, not a claim I verified.
- DeepWiki's page content: unopened at HTTP 429 twice, so no quote and no verdict beyond "unopened".
