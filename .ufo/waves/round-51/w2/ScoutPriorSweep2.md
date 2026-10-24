# ScoutPriorSweep2 — A4 prior-corpus re-sweep (current tree)

Seat `kumitate-r51.MatureDinosaur`. Axes: fidelity to the frozen A4 walk, distinctness of the three round-51 nonces, evidence (command + output). No tools installed. Lane files not edited except this report. Probe code not modified. Swept the working tree, not `git archive`.

Attacked: the A4 prior-corpus arm in `.ufo/waves/round-51/probe/attest51-probe.mjs` (walk at lines 229–241, substring test at 247) and the reverse distinctness claim on `attest-run-{1,2,3}.txt`.

## Result

**Prior-corpus substring hits = 0** across **162** files. The two live nonces do not occur in any `.ufo/waves` file outside a directory named `round-51`, with or without the basename filter.

**Three-distinct is not confirmed.** `attest-run-3.txt` is absent. The two present nonces are distinct 32-hex strings and neither appears inside the other receipt. Expected pre-close gap (A2 stays MISS until that file lands); not a prior-corpus collision.

| receipt | nonce | note |
|---|---|---|
| `attest-run-1.txt` | `3fd22d2153f74061d59ed9527b4ffca7` | present, `^[0-9a-f]{32}$` |
| `attest-run-2.txt` | `f95078d001c850abec0f9c0be449318f` | present, `^[0-9a-f]{32}$`, ≠ run-1 |
| `attest-run-3.txt` | — | **ABSENT** (`test -f` exit 1; `git ls-files '*attest-run-3*'` empty) |

Walk predicate copied from the probe: `statSync` recurse of `.ufo/waves`; do not enter a directory whose basename matches `/round-51$/`; keep files whose basename matches `/receipt|ReRun|L1-score/i`; `String.includes` each parsed `nonce`. Node walk: `priorFiles=162`, `hits=0`, `unread=0`, `statFail=[]`, `priorInsideRound51=0`. Round histogram (same as wave-1 `w1/ScoutReceiptCorpora.md`): round-35:7, 40:6, 41:3, 42:5, 43:7, 44:12, 45:1, 46:1, 48:113, 49:3, 50:4.

Path set is identical to wave-1 inventory rows with `in_a4_walk: true` (162). Added `[]`, removed `[]`. Inventory: `.ufo/waves/round-51/build/ScoutReceiptCorpora/inventory.json`.

Tree swept: git HEAD `3304a56db425ea9c7cd496b426876aaedbce3949` (`round-51: w2 dispatch evidence`). jj `@` was an undescribed working-copy change on that parent (`2ea91e44`, then `5c07279d` while other seats wrote). Both measurements saw the same 162 paths. Zero symlinks under `.ufo/waves`. Only directory matching `*round-51*` is `.ufo/waves/round-51` itself, so `find -name round-51 -prune` matches the probe's `/round-51$/` skip here.

## Sweeps (negative claim carries them)

Nonce extract (probe reader: first `{` line, `JSON.parse`, `.nonce`):

```text
$ node -e '<exists + JSON.parse nonce for attest-run-{1,2,3}.txt>'
attest-run-1.txt	3fd22d2153f74061d59ed9527b4ffca7	hex32=true
attest-run-2.txt	f95078d001c850abec0f9c0be449318f	hex32=true
attest-run-3.txt	ABSENT
present=2 distinct=2 threeDistinct=false
pair 3fd22d2153f74061d59ed9527b4ffca7 == f95078d001c850abec0f9c0be449318f -> false
```

Positive control (the same `grep -F` finds a nonce when it is there) and reverse substring check inside the receipt files:

```text
$ grep -F -c 3fd22d2153f74061d59ed9527b4ffca7 .ufo/waves/round-51/receipts/attest-run-1.txt
1
$ grep -F -c f95078d001c850abec0f9c0be449318f .ufo/waves/round-51/receipts/attest-run-2.txt
1
$ grep -F -c f95078d001c850abec0f9c0be449318f .ufo/waves/round-51/receipts/attest-run-1.txt
0
$ grep -F -c 3fd22d2153f74061d59ed9527b4ffca7 .ufo/waves/round-51/receipts/attest-run-2.txt
0
```

Prior-corpus sweep (basename filter, `round-51` pruned). `xargs -r` does not run `grep` on an empty list. Exit 123 is GNU xargs for "grep exited 1" (no match), and stdout is empty — not a crash. `prior_files=162` is from that same list.

```text
$ list=$(mktemp)
$ find .ufo/waves -type d -name 'round-51' -prune -o -type f \
    -regextype posix-extended -iregex '.*/[^/]*(receipt|ReRun|L1-score)[^/]*' -print > "$list"
$ echo "prior_files=$(wc -l < "$list")"
prior_files=162
first=.ufo/waves/round-35/falsify/RerunProxy.md
last=.ufo/waves/round-50/ReRunB49-3.txt
$ xargs -a "$list" -d $'\n' -r grep -F -n \
    -e 3fd22d2153f74061d59ed9527b4ffca7 \
    -e f95078d001c850abec0f9c0be449318f
grep_exit=123
```

No `file:line` lines. An earlier `find | wc -l` of the same predicate also printed `162`.

Extra, not the frozen arm (name-filter bypass): every file under `.ufo/waves` except `round-51`.

```text
$ grep -R -F -l -e 3fd22d2153f74061d59ed9527b4ffca7 -e f95078d001c850abec0f9c0be449318f \
    .ufo/waves --exclude-dir=round-51
unfiltered_exit=1
```

No paths. The basename filter did not hide either nonce.

## Observed, not a prior hit

`attest-run-2-replayed.txt` (inside skipped `round-51`) reuses run-2's nonce `f95078d001c850abec0f9c0be449318f` and the same inner digest `5f7b2bd339cb1fb52b7ca182fcbe50b435d850bad699057805b08dd49ae95b01`. That is the committed M2 control (prelude rewritten, body unchanged), not a third receipt and not a file the A4 walk opens. Addendum item 4 exempts same-nonce/same-digest anyway.

## Confidence and unknowns

High on zero prior hits and on the two present nonces being distinct. High that `attest-run-3.txt` is not in this working tree.

Unresolved: the third nonce does not exist yet, so "3 distinct" cannot be measured. Re-run the same `find` + `grep -F` after that file is committed. This was the working tree at git `3304a56`, not the close rev's `git archive` (what A4 actually scores).

## Report

`.ufo/waves/round-51/w2/ScoutPriorSweep2.md`
