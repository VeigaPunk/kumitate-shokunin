# ScribeSourcesCells — source/frontier draft

## Draft for `corpus/lessons/round-50.md`

The append-only rule in `corpus/SOURCES.md:7-8` permits changing only `status`, `recheck`, and `used-by`. Therefore keep the `opened` cells at `2026-10-23`; record the new reopen event in the lesson rather than rewriting the source rows' opened dates or anchors.

```markdown
## Frontier — SOURCES

- **S095 re-opened 2026-10-23** — bubblewrap 0.13.1 manual, `https://raw.githubusercontent.com/containers/bubblewrap/v0.13.1/bwrap.xml`; body sha256 `2cb77df2f4be0b2a0302bb2f0a260fdb4d9e1299b76481ea66ed34c40f5be1da`. Existing row remains tier A, status `mined`, opened `2026-10-23`, recheck `on-release`; used-by adds `corpus/knowledge/counter-amendment-discipline.md`. Attach `.ufo/waves/round-50/r50/ReopenS095.md` and its observed HOLD/DRIFT verdict before treating the reopen as evidenced.
- **S098 re-opened 2026-10-23** — strace 7.2 manual, `https://raw.githubusercontent.com/strace/strace/v7.2/doc/strace.1.in`; body sha256 `c16859e07dacc5cda882c7ab5f2e353803645a6ca449a0ac41eda1034e67ae9a`. Existing row remains tier A, status `mined`, opened `2026-10-23`, recheck `on-release`; used-by adds `corpus/knowledge/counter-amendment-discipline.md`. Receipt `.ufo/waves/round-50/r50/ReopenS098.md` says `REOPEN50: HOLD`.
- **S099 retained from round 49** — Linux man-pages `proc_pid_mountinfo(5)`, `https://man7.org/linux/man-pages/man5/proc_pid_mountinfo.5.html`; body sha256 `27a0e5ad5cf9fc4ef4059cd0c4a9b70fa2ac23457a4d39b82f2381a654b3813f`. Keep status `mined`, opened `2026-10-23`, and recheck `on-release`; the existing used-by list already includes `scripts/bind-oracle.mjs`, `corpus/knowledge/counter-amendment-discipline.md`, and `corpus/lessons/round-49.md`.
```

## Exact permitted source-cell deltas

Observed in `git diff ff40d7d HEAD -- corpus/SOURCES.md corpus/knowledge/counter-amendment-discipline.md` (read-only):

- S095 `used-by`: `scripts/cap-run.mjs, scripts/cap-spawn.mjs, corpus/lessons/round-47.md` → `scripts/cap-run.mjs, scripts/cap-spawn.mjs, corpus/lessons/round-47.md, corpus/knowledge/counter-amendment-discipline.md`.
- S098 `used-by`: `.ufo/waves/round-48/probe/caproute48-probe.mjs, corpus/lessons/round-48.md` → `.ufo/waves/round-48/probe/caproute48-probe.mjs, corpus/lessons/round-48.md, corpus/knowledge/counter-amendment-discipline.md`.
- For both rows, `status` stays `mined`, `opened` stays `2026-10-23`, and `recheck` stays `on-release`. S099 already has the counter-amendment entry in `used-by`; its current row is `mined | 2026-10-23 | on-release` and no R50 addition to that row is required by R50-10.

## Counter-amendment provenance trio

Exact insertion to use (the current file already contains these lines):

```text
<no provenance header>
→ source: S095 https://raw.githubusercontent.com/containers/bubblewrap/v0.13.1/bwrap.xml; S098 https://raw.githubusercontent.com/strace/strace/v7.2/doc/strace.1.in; S099 https://man7.org/linux/man-pages/man5/proc_pid_mountinfo.5.html
  verified-at: 2026-10-23 round-50 source re-open (body hashes retained in corpus/SOURCES.md)
  recheck: on-release
  [blank line]
```

## Evidence and limits

- `corpus/SOURCES.md:7-8` states rows are append-only except `status`, `recheck`, and `used-by`. Current source rows at `:108`, `:111-112` show the hashes, dates, status, recheck values, and used-by lists summarized above.
- `corpus/lessons/round-49.md:37-44` records S099 admitted/mined and S095/S098 as re-opened with no status/recheck edits. `.ufo/waves/round-49/plan.md:113-114` names S099 as opened and S095/S098 as re-opened. The corresponding r49 spec items are `ScribeReopenS095` (`r49-spec.json:237-243`) and `ScribeReopenS098` (`:246-252`).
- `.ufo/waves/round-50/plan.md:34-36,134-137` identifies the H1 `ENTRY_HEADER_REQUIRED` failure and specifies the provenance trio plus S095/S098 used-by additions.
- The current `corpus/knowledge/counter-amendment-discipline.md:1-3` already has the exact trio above. The read-only diff against `ff40d7d` reports `2 files changed, 7 insertions(+), 3 deletions(-)` and shows those three lines plus a blank line inserted before the title; it also shows the two used-by additions. This is current-tree evidence, not a claim that I made those edits.
- `.ufo/waves/round-50/r50/ReopenS098.md:1` records `REOPEN50: HOLD`, the expected URL/hash, and fetched date `2026-10-23`. `.ufo/waves/round-50/r50/ReopenS095.md` was not present when read, so its verdict is deliberately not asserted in the draft above.
- No source fetch, test, or tool installation was performed for this item. I wrote only this scoped report; all lane inspection and `git diff` were read-only.
