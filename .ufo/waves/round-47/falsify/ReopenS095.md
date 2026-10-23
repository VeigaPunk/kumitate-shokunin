RESULT ReopenS095 rev=269dadb6 verdict=HOLDS row=S095 (non-author re-open; no defect found)

Measured rev: 269dadb6a56744531bd1201e5944185e96ff6a4c (C1 commit).

1. Row S095 at C1 (corpus/SOURCES.md:108, grep '^| S095 |' → single row):
   id=S095; source="bubblewrap 0.13.1 manual — https://raw.githubusercontent.com/containers/bubblewrap/v0.13.1/bwrap.xml"; kind=docs; tier=A; scope="bubblewrap filesystem action semantics: read-write and read-only binds, tmpfs, and operation order"; anchor="bwrap.xml:253-255, 295-312, 410-416 at tag v0.13.1 = 362936aea0d5c6e70f7af75d2d44b5a914cb4ba2; body sha256 2cb77df2f4be0b2a0302bb2f0a260fdb4d9e1299b76481ea66ed34c40f5be1da; fetched 2026-10-23 (seat ScribeBwrapBind)"; status=mined; opened=2026-10-23; recheck=on-release; used-by=scripts/cap-run.mjs, scripts/cap-spawn.mjs, corpus/lessons/round-47.md. Row NF=13 (11 columns) per census awk.

2. Fetch (ordinary means): `curl -fsSL -o bwrap-v0.13.1.xml https://raw.githubusercontent.com/containers/bubblewrap/v0.13.1/bwrap.xml`.
   - sha256sum = 2cb77df2f4be0b2a0302bb2f0a260fdb4d9e1299b76481ea66ed34c40f5be1da — matches row. (681 lines, 33289 bytes)
   - Tag: `git ls-remote https://github.com/containers/bubblewrap 'refs/tags/v0.13.1*'` → `46ec5c413a3c1da265624ddac3a715b4d1bc487d refs/tags/v0.13.1` and `362936aea0d5c6e70f7af75d2d44b5a914cb4ba2 refs/tags/v0.13.1^{}` — peeled commit matches the row's anchor hash.
   - Byte-exactness: GitHub API tree of commit 362936ae (api.github.com/repos/containers/bubblewrap/git/trees/362936aea0d5c6e70f7af75d2d44b5a914cb4ba2) → bwrap.xml blob = b48cf5b448270f2234da911cf24ba8b47469ee26 == `git hash-object` of the fetched file. The fetched body is exactly the blob in the tagged commit.

3. Quote (Gate table, lessons/round-47.md:43): "These are applied in the order they are given as arguments." (:253-254; 11 words)
   - Verbatim in fetched bytes at lines 253-254: line 253 ends "…modified the filesystem directly, or", line 254 "mounts stuff in the filesystem. These are applied in the order they are given as arguments." Exact string matched.
   - `printf '%s' 'These are applied in the order they are given as arguments.' | wc -w` → 11 (≤25). Locator accurate.

4. teaches clauses vs located bytes (fetched bwrap.xml):
   - "`--bind SRC DEST` exposes a host path read-write, unlike read-only `--ro-bind`": :295-296 `--bind … Bind mount the host path SRC on DEST` vs :311-312 `--ro-bind … Bind mount the host path SRC readonly on DEST`. Contrast byte-supported; "read-write" is a gloss of the unqualified bind (readonly is the explicit qualifier) — consistent, no misquote.
   - "`--tmpfs DEST` mounts a new tmpfs": :410-412 "Mount new tmpfs on DEST." Direct.
   - "Filesystem operations apply in argument order, so `--tmpfs /tmp` masks a host fixture unless its path is explicitly bound afterward": :253-254 "These are applied in the order they are given as arguments." First part verbatim; the masking corollary is derived from the order statement (a later mount over the same path wins). It matches cap-run.mjs's actual argv order at C1: `--ro-bind / / --dev /dev --proc /proc --tmpfs /tmp --tmpfs /run --bind <cwd> <cwd>` (cap-run.mjs:187-188), and its comment cites S095 for exactly this (cap-run.mjs:17-18, 84). Grounded, not overclaimed.

5. tier/kind/scope/anchor vs fleet contract SOURCES-CONTRACT-v1.md (kaika, frozen):
   - kind=docs, tier=A (official upstream manual source — primary/authoritative for the scoped claim; not community; no inflation). scope is scoped and matches the three teaches clauses. anchor carries exact lines plus revision (tag → commit). status=mined (used-by cites it: cap-run.mjs comments cite S095 at :17-18 and :84; lessons/round-47.md:19 and Gate row cite it; all three used-by paths exist at C1). recheck=on-release is an allowed cadence. opened is ISO date of this round.
   - Census at C1 (contract awk): malformed-rows=0, no duplicate ids, no enum violations, no tier inflation, no missing used-by paths.

6. Gate record (lessons/round-47.md:43) consistency: URL identical, accessed 2026-10-23, quote/locator/word-count identical, decision "admit A, mined (ScribeBwrapBind)" matches row's tier/status/provenance.

7. Drafting seat report build/ScribeBwrapBind.md: verdict=OPENED row=S095; records same fetch command and body sha; notes source overlap check vs S069 (S069 covers env options/PID reaping/--die-with-parent at different anchors; S095's mount-action teaching does not repeat it — consistent with S069 row at C1). No tools installed (curl/git pre-existing; no installs performed).

Findings: none — no defect. Two notes (not defects): "read-write" gloss and the masking corollary are inferences from the located bytes, both consistent with the manual and with C1's code.
