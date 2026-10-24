# ExecMapSelftest — command log (round 57, 2026-10-24)

Lane root for all runs: /home/vgpnk/Projects/shokunin/kumitate-shokunin
B = .ufo/waves/round-57/build/ExecMapSelftest

## Assigned command (captured)

    node scripts/readme-map.mjs --selftest
    -> $B/selftest.stdout.txt, $B/selftest.stderr.txt, $B/selftest.exit.txt
    exit 0; stderr empty (sha256 e3b0c442...b855)

## Revision binding (read-only git)

    git rev-parse HEAD
      -> 8c6f5b017d149b18134917378cdbed3b492d8e89
    git show HEAD:scripts/readme-map.mjs | sha256sum
      -> 058e503363363ca3d9dbfd7a82602bd1b7287dfc9936af25796834b8812c7727
    sha256sum scripts/readme-map.mjs
      -> 058e503363363ca3d9dbfd7a82602bd1b7287dfc9936af25796834b8812c7727
    git cat-file -e 7178bfd3643c0fac74c8eb637cd6e985faadd0cf:scripts/readme-map.mjs
      -> exit 128 (path absent at plan base)

## Counts

    grep -c '^case .*: PASS$' $B/selftest.stdout.txt      -> 14
    grep -c '^case ' $B/selftest.stdout.txt               -> 14
    grep -c ': PASS$' $B/selftest.stdout.txt              -> 15 (14 cases + summary line)
    grep ': FAIL' $B/selftest.stdout.txt (case lines)     -> 0

## Supplementary: live gate over the real corpus (read-only)

    node scripts/readme-map.mjs
      -> $B/gate-live.stdout.txt, $B/gate-live.stderr.txt, $B/gate-live.exit.txt
      stdout: README_MAP: CLEAN files=135 rows=135 covered=135
      exit 0

## Supplementary: frozen B1 predicate inputs applied to captured bytes

    node -e '<B1 regex/status check over selftest.stdout.txt + selftest.exit.txt>'
      -> {"exit":0,"cases":14,"selftest":"14/14","verdict":true,"B1_predicate_inputs_satisfied":true}

## Mutation probes (scratch copies only; lane untouched)

    cp scripts/readme-map.mjs $B/scratch/pristine.mjs            (sha 058e5033...)
    node $B/scratch/pristine.mjs --selftest                      -> exit 0, 14/14

    m1 $B/scratch/m1-clean-label.mjs
       mutation: CLEAN emit `files=` -> `filesx=`
       node ... --selftest  -> exit 1, case-pass=12, FAIL: clean, non-corpus-rows
       summary: README_MAP_SELFTEST: PASS (12/14) / VERDICT: FAIL

    m2 $B/scratch/m2-duplicate-arm.mjs
       mutation: `if (seen.has(r))` -> `if (false && seen.has(r))`
       node ... --selftest  -> exit 1, case-pass=13, FAIL: duplicate-row
       summary: README_MAP_SELFTEST: PASS (13/14) / VERDICT: FAIL

    m3 $B/scratch/m3-format-arm.mjs
       mutation: format-unmapped bad.push -> `void` expression
       node ... --selftest  -> exit 1, case-pass=13, FAIL: format-unmapped
       summary: README_MAP_SELFTEST: PASS (13/14) / VERDICT: FAIL

## Supplementary: unexercised FAIL-CLOSED branches probed on scratch fixtures

    node scripts/readme-map.mjs --registry fx/empty/reg.json --readme fx/empty/corpus/README.md \
         --corpus fx/empty/corpus/knowledge --corpus fx/empty/corpus/lessons
      -> exit 2, README_MAP: FAIL-CLOSED reason=no *.md under ... (empty corpus)
    node scripts/readme-map.mjs --registry fx/noarr/reg.json --readme fx/noarr/corpus/README.md \
         --corpus fx/noarr/corpus/knowledge --corpus fx/noarr/corpus/lessons
      -> exit 2, README_MAP: FAIL-CLOSED reason=registry covered not an array

No pacman, no installs, no git/jj mutations.
