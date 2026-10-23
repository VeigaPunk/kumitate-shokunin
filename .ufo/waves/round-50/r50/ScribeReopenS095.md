# S095 re-open

Axes: source-content validity and auditability of the cited anchors.

## Verdict

**HOLD** — the pinned v0.13.1 body hash matches the recorded digest, and the filesystem claims remain supported by the same body. The S095 row's cited line ranges are not all accurate; this anchor defect is reported rather than silently treated as source-content drift.

## Commands and evidence

From `/home/vgpnk/Projects/shokunin/kumitate-shokunin`:

```text
curl -fsSL https://raw.githubusercontent.com/containers/bubblewrap/v0.13.1/bwrap.xml | sha256sum
2cb77df2f4be0b2a0302bb2f0a260fdb4d9e1299b76481ea66ed34c40f5be1da  -

date -u +%F
2026-10-23
```

Read-only source checks:

- `corpus/SOURCES.md:108` — S095 records tag `v0.13.1 = 362936aea0d5c6e70f7af75d2d44b5a914cb4ba2` and the same expected body SHA-256.
- Fetched `https://raw.githubusercontent.com/containers/bubblewrap/v0.13.1/bwrap.xml`; digest matches exactly.
- `bwrap.xml:260-263`: “Filesystem related options. These are all operations that modify the filesystem directly, or mounts stuff in the filesystem. These are applied in the order they are given as arguments.”
- `bwrap.xml:301-302`: `--bind` “Bind mount[s] the host path SRC on DEST”; `bwrap.xml:319-320`: `--ro-bind` binds the host path “readonly”.
- `bwrap.xml:416-418`: `--tmpfs DEST` — “Mount new tmpfs on DEST.”

## Anchor finding

The locator triplet recorded in S095 (`bwrap.xml:253-255, 295-312, 410-416`) does not accurately cover the full cited semantics in this unchanged body: 253-255 is the `--sync-fd` entry, 295-312 includes `--bind` but not `--ro-bind`, and 410-416 reaches only the `--tmpfs` term, not its explanatory text. The corrected anchors above locate the relevant wording. Argument ordering and a later mount's overlay/masking effect support the host-fixture conclusion; “masks” is a consequence of those semantics, not a verbatim manual sentence.

## Artifacts and bounds

- Receipt: `.ufo/waves/round-50/r50/ReopenS095.md` (first line: `REOPEN50: HOLD source=https://raw.githubusercontent.com/containers/bubblewrap/v0.13.1/bwrap.xml sha256=2cb77df2f4be0b2a0302bb2f0a260fdb4d9e1299b76481ea66ed34c40f5be1da fetched=2026-10-23`).
- This report: `.ufo/waves/round-50/r50/ScribeReopenS095.md`.
- No tools installed. Only these authorized round-50 receipt/report files were written; lane source files were not modified. No tests/builds or runtime probes were run.
