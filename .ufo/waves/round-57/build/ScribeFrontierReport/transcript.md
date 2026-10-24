# ScribeFrontierReport — command transcript (all times 2026-10-24, lane /home/vgpnk/Projects/shokunin/kumitate-shokunin)

All git invocations were read-only: `--no-optional-locks` throughout, no jj command, no
commit/push, no index or working-tree mutation. Only writes were into
`.ufo/waves/round-57/build/ScribeFrontierReport/`. No tools installed (none needed; no pacman run).

## 1. Locate the round's PROVINCE.md history
```
git --no-optional-locks log --oneline -n 30 -- PROVINCE.md
```
exit=0. Newest-first: f0dc6d1 (round-57 freeze+integrate; subject names
"worker-heartbeat/liveness frontier entry (S117-S120)"), e4a4943 (round-56), 68940c6
(round-55), 8eb113f (round-54), 6b2a451 (round-45), 1a8eed5 (round-34), cb1f12e (seed).
=> the only round-57 commit touching PROVINCE.md is f0dc6d1.

## 2. Establish revisions and cleanliness
```
git --no-optional-locks rev-parse HEAD                  -> 8c6f5b017d149b18134917378cdbed3b492d8e89
git --no-optional-locks log --oneline -n 3              -> 8c6f5b0 round-57: idempotence at bookkeeping tip c42afe1c — A57 10/10, D57 5/5
                                                        -> 1238575 round-57: idempotence ... at 798d4d2
                                                        -> c42afe1 round-57: SCORECARD measured-commit slots filled (R1 f0dc6d11; ...)
git --no-optional-locks status --porcelain -- PROVINCE.md  -> (empty), porcelain_exit=0
sha256sum PROVINCE.md
  -> c4ddb37ae1e394e4e8695c8bfe270b0e802b7ea7b9921fb89f73015c707b0dc7  PROVINCE.md
```

## 3. INVALID extraction attempt (self-caught, superseded — kept for audit)
```
git --no-optional-locks show f0dc6d136e0:PROVINCE.md 2>/dev/null | sha256sum
  -> e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855  -
```
`f0dc6d136e0` is not a valid object name; git errored to stderr, the pipe hashed empty
input, and the `||` fallback short-circuited (sha256sum on empty input exits 0).
Result discarded.

## 4. INVALID `--output` extraction (self-caught, superseded — kept for audit)
```
git --no-optional-locks show 7178bfd3643c0fac74c8eb637cd6e985faadd0cf:PROVINCE.md --output=$B/base-PROVINCE.md
git --no-optional-locks show f0dc6d1:PROVINCE.md --output=$B/r1-f0dc6d1-PROVINCE.md
sha256sum $B/base-PROVINCE.md $B/r1-f0dc6d1-PROVINCE.md
  -> e3b0c442... (EMPTY-string sha) for BOTH files
diff -u $B/base-PROVINCE.md $B/r1-f0dc6d1-PROVINCE.md ; echo diff_exit=0
```
`git show <rev>:<path>` displays the blob on stdout and does not honor `--output` for
blob display: both extracted files were created 0-byte, so this diff compared two empty
files and is VOID. The blob texts did reach stdout and were read; the extraction was
redone correctly in step 6 and the 0-byte artifacts were overwritten.

## 5. Knowledge-entry creation order (seventh-entry numbering) + entry blob existence
```
git --no-optional-locks log --diff-filter=A --name-status --format='COMMIT %h %ad %s' --date=short -- corpus/knowledge/
git --no-optional-locks cat-file -e f0dc6d1:corpus/knowledge/worker-heartbeat-liveness.md   -> exit 0
git --no-optional-locks ls-tree f0dc6d1 -- corpus/knowledge/
```
Observed: first-add commits round-1..round-57; ls-tree at f0dc6d1 lists 52 blobs;
worker-heartbeat-liveness.md = blob afed676b678fafa1328c28ec8ebc20d66ef5ee6c, added in
f0dc6d1. Lineage ordinals read from frozen artifacts: D52 probe "second sourced entry"
(fail-closed-clock-validation), round-53 plan "third entry" (receipt-identity-
canonicalization), D54 "fourth" (at-least-once-dedupe), D55 "fifth" (bounded-redelivery-
budgets), D56 "sixth" (visibility-lease-ack-deadlines) => worker-heartbeat-liveness is
the seventh.

## 6. Correct extraction + diff + section hashes (eval kernel; git cat-file, no locks)
```
git -C <lane> --no-optional-locks cat-file blob <rev>:PROVINCE.md   for
  7178bfd3643c0fac74c8eb637cd6e985faadd0cf (base), f0dc6d1 (R1), 8c6f5b017d... (HEAD)
```
Written to this dir: base-PROVINCE.md (2896 B), r1-f0dc6d1-PROVINCE.md (3061 B),
head-8c6f5b0-PROVINCE.md (3061 B), province-base-to-r1.diff (unified, n=2),
adjacent-base.txt / adjacent-r1.txt (366 B each: "### Adjacent" header to EOF).
Observed:
- sha256 base   = ed4e1a3256d6bdeb43231000c4bb40e48111c6ce30428545a2fc927812639361
- sha256 r1     = c4ddb37ae1e394e4e8695c8bfe270b0e802b7ea7b9921fb89f73015c707b0dc7
- sha256 head   = c4ddb37ae1e394e4e8695c8bfe270b0e802b7ea7b9921fb89f73015c707b0dc7 (== r1, == working copy)
- unified diff base->r1: exactly ONE hunk (@@ -20,5 +20,5 @@), one line replaced by its extended self
- Adjacent section sha256 identical at base and r1:
  a75a9c7e0d28972f2324d651897bf27381f9d1e59933074ea72610190aada1c8 (both)
- lines-only-in-base = 1 (the durable-execution bullet, old form); lines-only-in-r1 = 1 (new form); no other differing lines
- queued markers present in BOTH revs: "MCP protocol revisions as they bear on orchestration",
  "rows, queued", "other broker/workflow failure families remain queued"
- "advanced round 57" absent at base, present at r1

## 7. Pure-insertion proof (eval kernel)
For the durable-execution bullet old=ob, new=nb:
- ob ends with "; other broker/workflow failure families remain queued." (occurs once)
- nb == ob with the single in-line insertion
  "; advanced round 57 by `corpus/knowledge/worker-heartbeat-liveness.md` (S117/S118/S119): the liveness signal — worker heartbeats, session timeouts, platform probes"
  placed before that tail (548-byte shared prefix byte-identical; no other change)
- bullet-line counts base/r1: 11 / 11; no other bullet line differs
