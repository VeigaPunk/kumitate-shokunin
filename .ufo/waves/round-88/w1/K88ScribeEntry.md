# K88ScribeEntry — round 88 w1 (scribe): v2 knowledge section + Q81 draft

Leaf seat. Nothing committed, staged or edited outside
`/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-88/build/K88ScribeEntry/` and this
report. Read-only git only (`show`, `diff`, `log`, `rev-parse`, `status`). Nothing installed or
upgraded. Scratch `/fast/scratch/hyaku/kumitate-r88/K88ScribeEntry/` was used through `TMPDIR` and
`rm -rf`'d before yield.

## Behavior

Two drafts for the L1 to integrate:

1. `build/K88ScribeEntry/receipt-subject-binding-v2.md` is the
   `## v2 — revision, not worktree; four fail-closed boundaries (round 88)` section to append to
   `corpus/knowledge/receipt-subject-binding.md`. It covers:
   - round 87's worktree-vs-revision lesson (K87Critic `cand-a-worktree` 12/12 on a clean lane,
     11/12 once the worktree differs);
   - how v2 reads bytes (`blobAt` = `git cat-file blob <rev>:<rel>`);
   - a table of the four tokens, giving for each what it refuses, the v2 anchor, the sentinel row
     and the v1 anchor that was fail-open;
   - the positive twins in the probe;
   - candidate-level evidence (pre-M, per Q79);
   - eight v2 limits, five measured and three marked as from code.

   `S###` placeholders are named by URL: gitrevisions, CWE-59, CWE-22, and CWE-367 (S219, which
   already exists).
2. `build/K88ScribeEntry/q81.md` is Q81 in Q80's format (Grounding / Rule / Check / Shown able to
   fail / Limit). Its mechanical check:
   - generates the worktree twin of `scripts/receipt-bind.mjs`;
   - runs the frozen probe on the integrated instrument and on the twin;
   - passes iff the integrated run exits 0, the twin run exits 1, and the twin fails all four
     worktree-sensitive arms.

## Gates actually run (exact commands; receipts in the build dir)

| receipt | command (abridged; full `cmd=` in file) | outcome |
|---|---|---|
| `q81-integrated.txt` | `node …/probe/probe88-c1.mjs --lane <lane> --work <S>/w2 --rev 0ff3562f15c18d0ca01dc6a76c9f827d30c26950` (worktree instrument sha256 `098a6713…` = blob at 0ff3562f) | `C88_C1: HELD held=20/20`, exit=0 |
| `q81-twin.txt` | `make-worktree-variant.mjs scripts/receipt-bind.mjs` → `twin-v2-worktree.mjs` (copied here); then the probe with `--tool` set to it, same rev | `C88_C1: UNMET held=11/20`, exit=1; FAIL: selftest (36/39), clean-r87, rev-receipt-wins, worktree-forgery (read CLEAN), default-rev, untracked-instrument, symlink-dir, oversize, duplicate-field (each on its positive sub-run) |
| `q81-check.txt` | `bash …/q81-check.sh` (the Q81 snippet verbatim; `Q81_SCRATCH` only redirects `mktemp`), cwd = lane, HEAD 8e4ea5f6 | `Q81: PASS`, exit=0 |
| `limits.txt` | `bash …/limits-probe.sh` with `REV=0ff3562f…`, TOOL = lane `scripts/receipt-bind.mjs` | exit=0. Cases: L1 symlinked parent → CLEAN; L2 symlinked dir + trailing `/` → SYMLINK_DIR; L3 1048576 B → CLEAN; L4 1048577 B → RECEIPT_TOO_LARGE; L5 indented ` cmd=` → CLEAN; L6 equal duplicate `cmd=` → AMBIGUOUS_FIELD; L7 `cmd=` tail `\| tee …; rm -rf x` → CLEAN; L8 relative escape → ESCAPES_LANE; L9 same file by absolute path → CLEAN external=1 |
| `anchors.txt` | every `sed -n` / `nl` re-open of each cited line, at `0ff3562f` (blob `6061484d`), the v1 base `7ac24afa`, the frozen probe at `114877a3`, and the round-87 seat files | all cited anchors present and matching |

None of these runs is the measured revision M. They are candidate-level evidence (Q79). The close
battery at M is the evidence of record.

## Anchor re-verification (summary; full paste in `build/K88ScribeEntry/anchors.txt`)

```
$ git -C /home/vgpnk/Projects/shokunin/kumitate-shokunin show 0ff3562f15c18d0ca01dc6a76c9f827d30c26950:scripts/receipt-bind.mjs | sed -n '227,229p'
  try { dirStat = lstatSync(dir); } catch (e) { throw new FailClosed('DIR_UNREADABLE', `${dir} (${e.code || 'unreadable'})`); }
  if (dirStat.isSymbolicLink()) throw new FailClosed('SYMLINK_DIR', dir);
  try { entries = readdirSync(dir); } catch (e) { throw new FailClosed('DIR_UNREADABLE', `${dir} (${e.code || 'unreadable'})`); }
$ … sed -n '245p'
    if (st.size > MAX_RECEIPT_BYTES) throw new FailClosed('RECEIPT_TOO_LARGE', `${path} is ${st.size} bytes (limit ${MAX_RECEIPT_BYTES})`);
$ … sed -n '250,251p'
      const all = [...text.matchAll(new RegExp(`^${key}=(.*)$`, 'gm'))];
      if (all.length > 1) throw new FailClosed('AMBIGUOUS_FIELD', `${file} carries ${all.length} ${key}= lines`);
$ … sed -n '295p'
      if (!lr.inside) throw new FailClosed('ESCAPES_LANE', `${file} relative instrument resolves outside the lane: ${instrument}`);
$ … sed -n '196,199p'
function blobAt(lane, rev, rel) {
  const r = git(lane, ['cat-file', 'blob', `${rev}:${rel}`], { buffer: true });
  return r.status === 0 ? r.stdout : null;
}
$ … sed -n '301p'
      try { bytes = readFileSync(abs); } catch (e) { throw new FailClosed('UNRESOLVED', `${file} external instrument unreadable: ${abs} (${e.code || 'read failed'})`); }
$ git -C … show 7ac24afa477a44304a3b125e320ef86929218189:scripts/receipt-bind.mjs | nl -ba | sed -n '216p;234,236p;280p'
   216	  try { entries = readdirSync(dir); } catch …
   234	    try { text = readFileSync(path, 'utf8'); } catch …
   236	      const m = text.match(new RegExp(`^${key}=(.*)$`, 'm'));
   280	      if (lr.inside) rel = lr.rel; else fromDisk = true;
```

The v1 line numbers in the committed base (216, 234, 236, 280) are the same lines the round-87
sentinel cited against the K87ExecBind candidate, so its row anchors carry over unchanged.

## Findings (for the L1 — none blocks C1; all are disclosed in the draft's Limits)

1. **The v2 selftest does not exercise any of the four new tokens.** `sed -n '417,518p' | grep -c
   'ESCAPES_LANE|SYMLINK_DIR|RECEIPT_TOO_LARGE|AMBIGUOUS_FIELD'` → 0. The selftest is still
   `held=39/39`, so the four boundaries are held only by the frozen probe. A mutant that deletes
   one throw still passes `--selftest`, though not the probe arm. `[INFERENCE]` from the code; not
   executed here. Mutation seats can confirm.
2. **`SYMLINK_DIR` is last-component only.** A symlinked *parent* of `--dir` reads `CLEAN`
   (limits L1, measured). The plan's wording ("`--dir` is itself a symlink") is met exactly. A
   containment or realpath check is not part of v2.
3. **The external read is still unbounded** (`:301`: no `isFile` and no size guard), and
   `readdirSync` has no entry cap (`:229`). These are the second and third legs of R87-S5, not
   closed. `RECEIPT_TOO_LARGE` covers receipts only. From code, not executed.
4. **Half of R87-S6 remains.** Tokens after the instrument are still ignored (L7 CLEAN with a
   `| tee …; rm -rf x` tail). This is declared at `:55`.
5. **Classification nuance.** The plan and the v2 header (`:35`) call sentinel rows 3c/3d
   "fail-open". The sentinel itself rated 3c/3d/3e "SAFE (first-wins)" and routed them as R87-S6
   DOC-GAP (`K87Sentinel.md:58–60`, `:429`). The draft states both readings and gives v2's own
   reason (`:40–41`).
6. **Small inaccuracy in the existing entry.** The v1 section of
   `corpus/knowledge/receipt-subject-binding.md:59` says bytes come from `git show <rev>:<path>`.
   v1 and v2 both use `git cat-file blob` (`:197`). The draft states `cat-file blob`. The L1 may want
   to correct line 59 at integration.
7. **Source-id collision.** The CWE-59 URL is already SOURCES row S218 and CWE-367 is S219. The
   draft names them by URL and leaves the binding to the L1. The quotes used are the ones
   K88ScribeSources line-checked (`build/K88ScribeSources/quote-check.receipt.txt`,
   `QUOTE_CHECK: CLEAN`). I did not re-fetch them.
8. **Edge of the Q81 limit.** `make-worktree-variant.mjs` keys on the literal
   `function blobAt(lane, rev, rel) {`. A renamed read makes it exit 3, so the generator is coupled to
   that frozen interface (plan.md:66–67), not to the semantics.

## Touched surfaces

All under `/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-88/build/K88ScribeEntry/`:
`receipt-subject-binding-v2.md`, `q81.md`, `anchors.txt`, `limits-probe.sh`, `limits.txt`,
`q81-check.sh`, `q81-check.txt`, `q81-integrated.txt`, `q81-twin.txt`, `twin-v2-worktree.mjs`.
Report: `/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-88/w1/K88ScribeEntry.md`.

## Out of scope / not done

- Not done here: integrating into `corpus/knowledge/` or `corpus/QUALITY.md`, assigning `S###`
  ids, scoring at M, and the census. Those belong to the L1 or other seats.
- No seat-constructed control was submitted. The twin built here is the plan's own worktree twin
  of the integrated bytes, and it scored 11/20, below the kill line.
- The `/dev/zero` external-read case and the TOCTOU windows were not executed. They are marked
  `[from code, not executed]` in the draft.
