# Audit10 — Source-Hash: S195 capture vs SOURCES row vs source-captures pin (round-62 w2)

**Seat:** L1Kumitate62.Audit10 (round-62 w2, read-only falsification).
**Assignment:** independently hash `.ufo/waves/round-61/build/ScoutSourceWorkerVersioning/body.md` and compare with the S195 SOURCES row and the source-captures pin; do not trust scribe output.
**Scope:** attack inherited round-61 C2 predicate evidence only (D61 v1 / E-checks). No new claims, no verdicts on round-62 claims. No edits, no commit, no tests run.

## 1. Independent hash (computed, not read from any report)

```text
$ sha256sum kumitate-shokunin/.ufo/waves/round-61/build/ScoutSourceWorkerVersioning/body.md
8ef2ee5f5e196d9d14fc8c85449442764e812f3e4f0f6e2bb1bdc12895f0f8fc  .../body.md
$ wc -c .../body.md
9645
$ git -C kumitate-shokunin status --porcelain -- .../ScoutSourceWorkerVersioning/ .ufo/pins/source-captures.json
(empty — worktree clean for these paths)
$ git -C kumitate-shokunin show HEAD:.ufo/waves/round-61/build/ScoutSourceWorkerVersioning/body.md | sha256sum
8ef2ee5f5e196d9d14fc8c85449442764e812f3e4f0f6e2bb1bdc12895f0f8fc  -
```

Committed blob at lane HEAD `0cbe0d75e5a08718e2256408329692908c837766` hashes identically to the working-tree copy.

## 2. Comparison targets

| Target | Location (committed at HEAD) | Value | Match |
|---|---|---|---|
| Capture file (working tree = committed blob) | `.ufo/waves/round-61/build/ScoutSourceWorkerVersioning/body.md` | sha256 `8ef2ee5f5e196d9d14fc8c85449442764e812f3e4f0f6e2bb1bdc12895f0f8fc`, 9645 bytes | — |
| SOURCES row S195 (cell 6 pin text) | `corpus/SOURCES.md` line 147 | `sha256 8ef2ee5f5e196d9d14fc8c85449442764e812f3e4f0f6e2bb1bdc12895f0f8fc` | **yes** |
| Source-captures pin | `.ufo/pins/source-captures.json` (`sourceId: S195`) | `sha256: "8ef2ee5f5e196d9d14fc8c85449442764e812f3e4f0f6e2bb1bdc12895f0f8fc"`, `bytes: 9645`, `captured: 2026-10-25`, path `.ufo/waves/round-61/build/ScoutSourceWorkerVersioning/body.md` | **yes** |

Anchor quote in the row (“A **Pinned** Workflow is guaranteed to complete on a single Worker Deployment Version.”) appears exactly once in body.md (line 39; `grep -c` = 1), matching the row's `§ Versioning behaviors → § Pinned Workflows` locator.

## 3. Live-source cross-check (closes the self-authored-capture gap)

To test whether the capture is real vs fabricated by the lane, I re-fetched the source URL today:

```text
$ curl -sSL -D headers.txt -o live.md https://docs.temporal.io/worker-versioning.md
HTTP/2 200; content-type: text/markdown; charset=utf-8; content-length: 9645
etag: "689e2563eb73d2382351d119ee1d4ad5"; last-modified: Sat, 24 Oct 2026 00:21:02 GMT
x-vercel-cache: HIT
$ sha256sum live.md
8ef2ee5f5e196d9d14fc8c85449442764e812f3e4f0f6e2bb1bdc12895f0f8fc  live.md
$ diff live.md <lane>/.ufo/waves/round-61/build/ScoutSourceWorkerVersioning/body.md   # empty → IDENTICAL
```

The live entity is byte-identical to the committed capture, with the same etag and last-modified values recorded in the scout's access record (`build/ScoutSourceWorkerVersioning/findings.md`). The capture is genuine as of now; the hash chain (file ↔ row ↔ pin ↔ live bytes) is internally and externally consistent.

## 4. Counterexample search — result

- **Hash-consistency axis: no counterexample found.** All four nodes agree on the full 64-hex digest and byte count.
- **Residual weakness (inherited from round-61, unchanged in the round-62 probe copy):** the frozen D61 E4 check does not perform this comparison. `probe/doctrine61-probe.mjs` (identical in round-62 copy, `e638e2b9…` as noted in w1 ReviewClaims) (a) reads the capture via `readFileSync` from the **worktree**, not from the revision; (b) parses the pin from the registry row only — `.ufo/pins/source-captures.json` is **never read by the predicate**; and (c) compares only `pin.includes(sha.slice(0,16))` — the first 16 hex chars (64 bits). A forged capture whose bytes share a 16-hex prefix with the row pin (or a self-pinned capture) passes E4; the round-61 w2 CritC2HashPin and w1 C2Bundle/AttackC1C2 repros already demonstrate `HELD 6/6` on such forgeries. The pins file is thus not part of any frozen check — it is a report-level artifact only.

## 5. Impacted axes

- **Coverage (C2 / D61 E4):** the inherited pin-verification predicate remains unsound; the correct full-digest chain I verified here is exactly what E4 does not check.
- Source-hash consistency itself: no axis impact — it passes.

## 6. Smallest safe correction

Within E4 only: parse the S195 entry from `.ufo/pins/source-captures.json` **at the revision** (`git show <rev>:.ufo/pins/source-captures.json`), hash the capture from the revision (`git show <rev>:…/body.md | sha256sum`), and require full 64-hex equality across pins entry, registry-row pin, and capture digest — replacing the 16-hex `includes` test and the worktree `readFileSync`. This is the minimal change that makes the source-captures pin a real predicate element. (E3's unscoped whole-file row scan is a separate, already-documented defect; not part of this slice.)
