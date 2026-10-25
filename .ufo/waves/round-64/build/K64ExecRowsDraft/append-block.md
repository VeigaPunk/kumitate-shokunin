# Registry append block — round 64, jj seat containment rows (seat K64ExecRowsDraft)

Insert point: `corpus/SOURCES.md`, immediately after the `S197` row (line 151 of the base file) and
before the blank run that precedes `## Paths` (line 155). Nothing else in the registry changes except
the optional S067 `used-by` cell patch in §5.

Document identity decides the ids: S198 = the concurrency page, S199 = the Firefox page,
S200 = the working-copy page (`latest` = v0.46.0). Opened 2026-10-25, status `mined`, recheck `180d`
(the recheck commands live in §2 notes, never in the `recheck` cell: a prose cell is `E09`).

## 1. Rows (exact text to append, one physical line each, 11 cells, no `|` inside a cell)

```
| S198 | Jujutsu (jj) documentation — Concurrency — https://docs.jj-vcs.dev/latest/technical/concurrency/ | docs | A | what a shared jj repository actually shares between workspaces: the operation log and the per-workspace working-copy commit, named as the mechanism rather than described as a symptom; the lane holds the colocated-git page (S066) and the working-copy page (S067) but no row on this page | § Operation log, its first three paragraphs; docs v0.46.0 (the `latest` alias in https://docs.jj-vcs.dev/versions.json, read 2026-10-25), whose normalised text equals the v0.45.1 rendering (8572 chars both, measured 2026-10-25); host jj 0.45.1 | the operation log is the most important piece of the lock-free design and is what lets divergent operations be detected and merged; the view object holds the visible head commits, bookmarks, tags and the working-copy commit of each workspace, so a seat's commit is visible from every workspace while its working copy stays per-workspace; a command loads the repo at the latest operation, never sees later changes from other processes, and its own operation cannot fail to commit | mined | 2026-10-25 | 180d | corpus/knowledge/jj-workspace-seat-containment.md |
| S199 | Firefox Source Docs — Introduction to Jujutsu — https://firefox-source-docs.mozilla.org/contributing/jujutsu.html | docs | A | a large multi-workspace deployment's own stale-workspace policy: the precise trigger and the per-workspace knob, the operator-side account of what a seat pool must configure; the lane holds no row on this page | § Working with multiple workspaces (the page's last content heading, followed only by § Git Tricks); fetched 2026-10-25, body sha256 abbe47cfa45e809694b224d0db0ea7d6b00e9846b94086d077aea0604db7b3d2, 53233 bytes | a workspace becomes stale when a commit it depends on is rewritten from another workspace, by rebasing, editing or squashing; Firefox's mach vcs-setup sets snapshot.auto-update-stale=true because some mach commands can fail silently on a stale working copy; disabling it per workspace makes most jj commands refuse to run until jj workspace update-stale runs, so seat staleness is decided by configuration rather than by code | mined | 2026-10-25 | 180d | corpus/knowledge/jj-workspace-seat-containment.md |
| S200 | Jujutsu (jj) documentation — Working copy — https://docs.jj-vcs.dev/latest/working-copy/ | docs | A | the v0.46.0 workspace-release delta that the lane's pinned v0.45.1 copy (S067) does not carry: `jj workspace remove` beside `forget`, scoped to the two release paragraphs only and never to the workspaces or stale material S067 already holds | § Workspaces, the two release paragraphs (forget, then remove); docs v0.46.0 (the `latest` alias, versions.json read 2026-10-25; byte-identical to the v0.46.0 versioned URL, cmp 2026-10-25); the host's jj 0.45.1 lists no remove subcommand (jj workspace --help, 2026-10-25) | releasing a seat has two operations in v0.46.0: jj workspace forget makes the repo forget the workspace and leaves its directory and files on disk, while jj workspace remove forgets it and deletes the directory, snapshotting tracked changes first but deleting ignored files; the main workspace cannot be removed and removing the current workspace needs jj -R from another directory on Windows; on this host (0.45.1) only forget exists, so a seat pool cannot rely on remove | mined | 2026-10-25 | 180d | corpus/knowledge/jj-workspace-seat-containment.md |
```

## 2. Row notes (append after the table, still inside `## Registry`)

```
Round-64 row notes (K64ExecRowsDraft) — the recheck commands and the S067 reuse, kept out of the recheck cells:

- S198 recheck: `curl -fsSL 'https://docs.jj-vcs.dev/latest/technical/concurrency/' | grep -c -F 'The most important piece in the lock-free design'` -> 1 (ran 2026-10-25); `cmp` of `https://docs.jj-vcs.dev/v0.46.0/technical/concurrency/` against `latest` -> identical (48988 bytes both).
- S199 recheck: `curl -fsSL 'https://firefox-source-docs.mozilla.org/contributing/jujutsu.html' | grep -c -F 'A workspace becomes stale when a commit it depends on is rewritten from another workspace'` -> 1 (ran 2026-10-25).
- S200 recheck: `curl -fsSL 'https://docs.jj-vcs.dev/latest/working-copy/' | grep -c -F 'jj workspace remove'` -> 1 (ran 2026-10-25); `jj workspace --help | grep -c '^  remove'` -> 0 on host jj 0.45.1 (the delta is v0.46.0-only).
- S200 is a delta row, not a second copy of S067: the workspaces and stale-working-copy material stays grounded on S067 (raw v0.45.1 `docs/working-copy.md`, opened 2026-10-23). S067 is named in the entry's prose as the version-pinned counterpart and is NOT on its `source:` line, because J64 J2 requires every cited row to be opened 2026-10-25.
- Staged S259 and S270 are not appended: S259 duplicates S067's whole scope (same document, moving `latest` URL, less pinnable than the v0.45.1 tag), and S270's forget-versus-remove distinction is carried by S200's delta scope alone.
```

## 3. Capture pins (proposed fragment for `.ufo/pins/source-captures.json`)

Captures are committed in this build dir; `sha256`/`bytes` are measured on those exact files
(`sha256sum` + `stat -c %s`, 2026-10-25), and every located quote is found in them under the frozen
probe's own normaliser (`verify-quotes.mjs`, `QUOTE_CHECK: PASS quotes=8 failing=0`).

```json
  { "sourceId": "S198", "path": ".ufo/waves/round-64/build/K64ExecRowsDraft/concurrency-latest.html", "sha256": "5e2f757641748faf15df032f51e14435ddd579b13c30ab54fea0d40ce2e00bf6", "bytes": 48988, "captured": "2026-10-25" },
  { "sourceId": "S199", "path": ".ufo/waves/round-64/build/K64ExecRowsDraft/firefox-jujutsu.html", "sha256": "abbe47cfa45e809694b224d0db0ea7d6b00e9846b94086d077aea0604db7b3d2", "bytes": 53233, "captured": "2026-10-25" },
  { "sourceId": "S200", "path": ".ufo/waves/round-64/build/K64ExecRowsDraft/working-copy-latest.html", "sha256": "947d0c56c02f9c10b4c14e8aaa8cc3f435f7650536ab9386ef6a52f1d64ff3c7", "bytes": 47694, "captured": "2026-10-25" }
```

## 4. Located quotes for the entry's `## Located quotes` (8 bullets, all PASS capture + live)

```
- S198 — "The most important piece in the lock-free design is the "operation log". That is what allows us to detect and merge divergent operations."
- S198 — "The view object contains the set of visible head commits, bookmarks, tags, and the working-copy commit in each workspace."
- S198 — "When a command starts, it loads the repo at the latest operation."
- S199 — "A workspace becomes stale when a commit it depends on is rewritten from another workspace, for example by rebasing, editing, or squashing."
- S199 — "We recommend this default because some mach commands invoke jj and can fail, sometimes silently, if the working copy is stale."
- S200 — "Use jj workspace remove to forget a workspace and remove its directory from disk."
- S200 — "Tracked changes are snapshotted before the directory is removed, but ignored files in that directory are deleted."
- S200 — "The main workspace cannot be removed."
```

Entry header line 0 must be `source:` (sources-check requires `lines[0].startsWith('source:')`), e.g.
`source: S198 https://docs.jj-vcs.dev/latest/technical/concurrency/ · S199 https://firefox-source-docs.mozilla.org/contributing/jujutsu.html · S200 https://docs.jj-vcs.dev/latest/working-copy/`
with `verified-at: 2026-10-25 …` and `recheck: 180d …` inside the first five lines.

## 5. Optional S067 `used-by` patch (permitted in-place change; not required by J2)

The contract allows `status`, `recheck` and `used-by` to change in place. Appending the entry path to
S067's `used-by` records that the entry reuses the pinned v0.45.1 copy without re-opening it:

```
- old: corpus/knowledge/agent-isolation-substrates.md, corpus/lessons/round-45.md
- new: corpus/knowledge/agent-isolation-substrates.md, corpus/lessons/round-45.md, corpus/knowledge/jj-workspace-seat-containment.md
```

If the L1 prefers no S067 mention at all, drop this patch and drop the S067 sentence from the notes;
neither affects J2, J3, J4 or J5.
