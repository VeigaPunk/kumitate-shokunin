# K70ScribeSourceRow — S217 own-work source row draft (scribe, leaf)

Seat: K70ScribeSourceRow (scribe, leaf, axis operability, milestone ScribeSourceRow). Lane: /home/vgpnk/Projects/shokunin/kumitate-shokunin. Date: 2026-10-30. Frozen plan 3dbe7e6e2616423d55f0ea2bbcf8fb32fe7bda6a; base B 78b98d762ccf3e3a0961f94c4042eaabd2bcb706. **No production append** — the row and pin below are drafts/evidence only; production integration is L1's.

## Behavior

Drafted an own-work source row for S217 (the frozen round-69 c2 control) from the opened frozen source, with a ≤25-word located Gate quote and a capture-pin proposal. Everything is grounded in observed reads/hashes; nothing was executed against the controls and nothing outside my private build dir and this report was written.

## Deliverable 1 — located Gate quote (12 words, ≤25; verified with `wc -w`)

From `.ufo/waves/round-69/probe/c2-controls.sh`, frozen bytes sha256 `679b7d9619ab8d79139cfe8e956e425f7ccbbf7e58b6eaee5cb72c3deb3a66f4` (7030 bytes), byte-identical at commit 78b98d762ccf3e3a0961f94c4042eaabd2bcb706 and in the working tree:

> line 24: ``W="$LANE/.ufo/waves/round-69/controls"``; line 80: ``printf '%s\n' '- S207 — capture 2026-10-30 — pinned' > /tmp/forge-sed.txt``

This locates exactly what the round-70 lesson Gate names: the fixed-output assignment (line 24 hardcodes the receipt directory into the production lane; line 106 redirects `> "$W/c2-$MODE.txt"` onto it) and the unused fixed temporary write (line 80; `forge-sed` occurs nowhere else in the file — nothing consumes it; the name is fixed and outside both `$S` and `$W`). Line numbers confirmed by `grep -n`: 24, 25, 80, 106.

## Deliverable 2 — draft S217 row (11 cells, NF=13, sha256 4130d0757b4f39ddd713890e561a1a41bc0346aa192cb3afad020ece53237053)

Artifact: `build/K70ScribeSourceRow/row-S217-draft.txt` (one line):

```
| S217 | Frozen round-69 origin controls — .ufo/waves/round-69/probe/c2-controls.sh | own-work | A | fixed-output replay hazard motivating round-70 isolation; not external protocol authority | c2-controls.sh:24 `W="$LANE/.ufo/waves/round-69/controls"` and :25 `S="${HYAKU_SCRATCH:-/fast/scratch/hyaku}/kumitate-r69/c2-controls-$MODE"`, :80 `printf '%s\n' '- S207 — capture 2026-10-30 — pinned' > /tmp/forge-sed.txt`; file sha256 679b7d9619ab8d79139cfe8e956e425f7ccbbf7e58b6eaee5cb72c3deb3a66f4, 7030 bytes, byte-identical at commit 78b98d762ccf3e3a0961f94c4042eaabd2bcb706 and working tree; opened 2026-10-30 | the replay hardcodes its receipt directory into the production lane and line 80 writes an unused fixed-name /tmp file that nothing consumes; a private versioned successor must preserve the frozen bytes and refuse existing outputs | mined | 2026-10-30 | on-release | corpus/lessons/round-70.md |
```

Comparison against the row L1 already landed (`corpus/SOURCES.md:169`, committed; clean at HEAD `1e00955a657a5b955992e23915143e7b3e261bb4`): id/kind/tier/scope/status/opened/recheck/used-by agree; anchors agree on lines 24-25 and 80 at B (mine quotes the lines verbatim and adds the file sha256/7030 bytes); teaches agree in substance (mine adds "refuse existing outputs", the R9 obligation). The landed row passes `scripts/sources-check.mjs` (below), so no correction is proposed; the draft stands as the independent scribe corroboration.

## Deliverable 3 — capture-pin proposal

Artifact: `build/K70ScribeSourceRow/pin-proposal.json`. Proposed entry for `.ufo/pins/source-captures.json` (append-only; frozen counter bytes untouched):

```json
{
  "sourceId": "S217",
  "path": ".ufo/waves/round-69/probe/c2-controls.sh",
  "sha256": "679b7d9619ab8d79139cfe8e956e425f7ccbbf7e58b6eaee5cb72c3deb3a66f4",
  "bytes": 7030,
  "captured": "2026-10-30"
}
```

Basis: `sha256sum`/`wc -c` on the frozen file, re-hashed through `git show 78b98d76…:.ufo/waves/round-69/probe/c2-controls.sh` — identical digest and byte count both ways. This proposal matches the pin already landed at HEAD verbatim (read at `.ufo/pins/source-captures.json:4-10`); it was absent at base B, so L1 added it during the wave as the plan's "opened source" step requires.

## Observed commands and outcomes (summary; verbatim in build/K70ScribeSourceRow/evidence.txt)

- `sha256sum` + `wc -c` working vs `git show 78b98d7…` → `679b7d96…`, `7030` both. Frozen bytes intact.
- `git -C <lane> rev-parse HEAD` → `1e00955a657a5b955992e23915143e7b3e261bb4` (wave has advanced past B; all base comparisons done via read-only `git show`, no checkout).
- `git -C <lane> status --porcelain=v1 -- corpus/SOURCES.md .ufo/pins/source-captures.json` → empty (both clean/committed).
- `grep -c '^| S217 '` → 0 at base B, 1 in working tree; pin `"sourceId": "S217"` → 0 at base B (the trailing 0-match grep made that combined command exit 1 — expected grep semantics, not a failure).
- `grep -n` on the frozen script → lines 24/25/80/106 as quoted above; `forge-sed` only on line 80.
- `node scripts/sources-check.mjs` (documented read-only: "does not use the network or modify the live tree") → `SOURCES_CHECK: CLEAN (rows=156 tiers=A:133,B:15,C:8 status=queued:13,mined:124,rejected:19 entries_with_source=23 legacy=38)`, exit 0; two pre-existing advisory `USED_BY_ASYMMETRY` warnings on S028/S124, unrelated to S217, reported verbatim.
- `awk -F'|'` on the draft row → `NF=13` (11 cells, no escaped-pipe splitting); `wc -w` on the Gate quote → 12.

## Gates honored

- Originals `c1-controls.sh`/`c2-controls.sh` only read, never executed; no copies made, so no private W/S was needed.
- No scratch used → no `/fast/scratch/hyaku/kumitate-r70/K70ScribeSourceRow/` created; nothing to clean before yield.
- No commits/push/mutating git or jj in lane or fleet; fixture `show-toplevel` gate not triggered (no fixture commits).
- Production files untouched: no append to SOURCES.md, no pin write, no frozen-byte change (hashes above prove c2 intact).
- Read-only tooling only; no installs (pacman paused; nothing installed).

## Out of scope / not done

- No production append (L1 owns integration; row and pin already landed there before this report).
- The S028/S124 used-by asymmetry warnings are pre-existing registry items, not touched or judged here.
- No claim about replay outcomes, counter scores, or other seats' results; nothing was run that could produce them.

Report:
- w1/K70ScribeSourceRow.md
- build/K70ScribeSourceRow/row-S217-draft.txt
- build/K70ScribeSourceRow/pin-proposal.json
- build/K70ScribeSourceRow/evidence.txt
