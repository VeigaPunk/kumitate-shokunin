RESULT ReopenS082 rev=269dadb6 verdict=HOLDS supersedes-S013=right-target quote=verbatim-10w teaches=all-clauses-supported sha256=MATCH last-modified=1s-wobble

Re-open of the S082 registry row and its Gate record at the C1 commit 269dadb6a56744531bd1201e5944185e96ff6a4c, and of the drafting seat's report (build/SupersedeS013.md, rev=cac43009). Independent fetch of the source; no lane mutation; only report write is this file.

## 1. Row and Gate bytes read at the revision

Command: `git -C /home/vgpnk/Projects/shokunin/kumitate-shokunin show 269dadb6a56744531bd1201e5944185e96ff6a4c:corpus/SOURCES.md | grep '^| S082 |'`
Observed (excerpt, full row is 1095 bytes):
`| S082 | Kimi Code CLI Docs: Tower multi-agent collaboration — https://moonshotai.github.io/kimi-code/en/guides/tower.html | docs | A | Kimi Tower coordination, merge gating, and safety | § Tower multi-agent collaboration (intro); § Check status and intervene; § Understand merges and rebases; § Safety and resource cost; unversioned page re-opened 2026-10-23; HTTP 200; Last-Modified Fri, 23 Oct 2026 08:04:11 GMT; body sha256 05a1e7d1fb7e697c5aa444ec96362b3905b715b0fca9dddbe363eff4424e894d | supersedes S013 — Kimi Tower: one coordinator per workspace, worktree per mission, independent review merge gate, not a security sandbox | mined | 2026-10-23 | on-release | corpus/knowledge/agent-isolation-substrates.md, corpus/lessons/round-45.md |`

Column header (same rev, corpus/SOURCES.md lines 7-8): `| id | source | kind | tier | scope | anchor | teaches | status | opened | recheck | used-by |` — so tier=A, kind=docs, scope="Kimi Tower coordination, merge gating, and safety", anchor="on-release" (recheck cadence), status=mined.

Gate record (same rev, corpus/lessons/round-47.md line 30):
`| S082 | https://moonshotai.github.io/kimi-code/en/guides/tower.html | 2026-10-23 | "Worktrees isolate writes, but they are not a security sandbox." (§ Safety and resource cost, ¶1; 10 words) | admit A, mined — supersedes S013; Last-Modified differs by one second from the round-46 record (SupersedeS013) |`

## 2. Suppersedes target check (S013 restored)

Command: `git -C /home/vgpnk/Projects/shokunin/kumitate-shokunin show 2b2bf7bb:corpus/SOURCES.md | grep '^| S013 |'` and same at `269dadb6…`.
Observed: both lines identical (838 bytes each; `[ "$a" = "$b" ]` → IDENTICAL). The S013 original bytes (2b2bf7bb) are exactly restored at 269dadb6. Round-46's in-place edition (cac43009) had appended "re-opened round 46 (SweepS011S015): page rebuilt, Last-Modified Fri, 23 Oct 2026 08:04:12 GMT, body sha256 05a1e7d1…" to S013, violating append-only; the C1 commit restores the immutable cells. Per fleet CORPUS.md:116-118, "A correction is a new row whose teaches opens `supersedes S0NN —`" — S082 is that appended row for the same source (URL identical), and names S013, the row it corrects. Right target. The correction is supported by the bytes below.

## 3. Source fetched (ordinary means)

Command: `curl -fL --max-filesize 2097152 -D - -o /fast/scratch/hyaku/kumitate-r47/seats/w2-ReopenS082/tower.html -w '\nHTTP_CODE=%{http_code} SIZE=%{size_download} URL=%{url_effective}\n' https://moonshotai.github.io/kimi-code/en/guides/tower.html && sha256sum …`
Observed (2026-10-23 ~10:52Z): `HTTP/2 200`, content-type text/html utf-8, `last-modified: Fri, 23 Oct 2026 08:04:12 GMT`, content-length 42839, `HTTP_CODE=200 SIZE=42839 URL=https://moonshotai.github.io/kimi-code/en/guides/tower.html`; `sha256sum` → `05a1e7d1fb7e697c5aa444ec96362b3905b715b0fca9dddbe363eff4424e894d`.

Body sha256 MATCHes the S082 row's recorded hash exactly (and the round-46 in-place row's hash). HTTP 200 matches.

## 4. Quote verbatim, locator, word count

Command: `grep -o 'Worktrees isolate writes, but they are not a security sandbox.' …/tower.html` → one match, verbatim.
`grep -o 'id="safety-and-resource-cost"' …` → present.
`printf '%s' "Worktrees isolate writes, but they are not a security sandbox." | wc -w` → `10`.
The quote is the first sentence of the § Safety and resource cost section (section text begins with it), i.e. ¶1. Locator `#safety-and-resource-cost` verified on the page. 10 words ≤ 25.

## 5. teaches clauses vs located bytes (all found in the fetched HTML)

- "one coordinator per workspace": "Each workspace can have only one tower coordinator." (Understand merges and rebases area) and "A project cannot have multiple tower coordinators at the same time." — byte-present.
- "worktree per mission": "Every mission has its own branch and Git worktree." (intro, Tower multi-agent collaboration) — byte-present.
- "independent review merge gate": "It also requires a valid clean review and merge approval, usually from an independent reviewer."; "Tower assigns independent reviewers, rebases when needed, and merges approved missions in dependency order."; "merges only branches that pass its checks" — byte-present.
- "not a security sandbox": "Worktrees isolate writes, but they are not a security sandbox." — byte-present (the Gate quote itself).

All four locator anchors exist: `id="tower-multi-agent-collaboration"`, `id="check-status-and-intervene"`, `id="understand-merges-and-rebases"`, `id="safety-and-resource-cost"` — all YES.

## 6. Tier/kind/scope/anchor

- Tier A, kind docs: primary vendor manual page (docs) — consistent with the registry's A tier usage for official vendor docs.
- scope "Kimi Tower coordination, merge gating, and safety": page covers exactly these (coordination/monitor, merge/rebase checks, safety/resource cost). Supported.
- anchor "on-release": unversioned page; on-release is a valid recheck cadence per CORPUS.md (recheck: 90d/180d/on-release). Reasonable; page is unversioned so on-release (as in on page release) is the only sensible cadence.
- status mined: used-by lists corpus/knowledge/agent-isolation-substrates.md and corpus/lessons/round-45.md; those files currently cite S013 (restored), not the literal id S082. This is systemic to all S080–S092 supersede rows this round (row takes over the superseded row's citation relationship by design of R46-1). Noted as residual risk, not a defect of the correction itself.

## 7. Last-Modified note

Row records `Last-Modified Fri, 23 Oct 2026 08:04:11 GMT`; round-46 record pinned 08:04:12; my fetch of identical body bytes returned 08:04:12. Both values occur for the same sha256 body — the unversioned page re-stamps Last-Modified ±1s between fetches. The Gate note "Last-Modified differs by one second from the round-46 record" is accurate (observed both directions). No defect.

## Verdict

`supersedes S013` names the right target (S013 restored byte-identical to its original; same source; appended correction row per CORPUS.md rule 2). The correction is fully supported by the bytes: quote verbatim at the stated ¶1, 10 words, body sha256 match, all four teaches clauses byte-present at the cited sections. Tier/kind/scope/anchor check out. HOLDS.

Evidence: URL https://moonshotai.github.io/kimi-code/en/guides/tower.html; fetched body sha256 05a1e7d1fb7e697c5aa444ec96362b3905b715b0fca9dddbe363eff4424e894d (42839 bytes); source artifact /fast/scratch/hyaku/kumitate-r47/seats/w2-ReopenS082/tower.html. No tool installed; no gate/counter run; no processes left (pgrep clean). Lane writes: this report only.
