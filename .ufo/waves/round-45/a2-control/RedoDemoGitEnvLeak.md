RESULT RedoDemoGitEnvLeak rev=a2e5b54c verdict=reproduces effect=yes control_clean=yes statements_confirmed=18/18

# Re-derivation of inherited demo DemoGitEnvLeak (M3)

Seat `KumitateR45A2.RedoDemoGitEnvLeak`, lane `/home/vgpnk/Projects/shokunin/kumitate-shokunin`, tip `a2e5b54cdd2c4cbf72cb0b2ab4ed53e2fe0d730f`.
My demo script was written from the item's description before I opened the inherited receipt
(`.ufo/waves/round-45/build/DemoGitEnvLeak.md`) or attempt-1 scratch; probe 2-5 were written after the first
run. Host: Arch, git 2.56.0, user systemd 262. Every run used
`systemd-run --user --scope --quiet -p MemoryMax=4G -p TasksMax=128 timeout -s KILL 900 bash <script>`,
exit 0 each time. Scratch: `/fast/scratch/hyaku/kumitate-r45/seats/a2-RedoDemoGitEnvLeak/` (2.9 MiB, `procs=0`
after every run). No tools installed or updated.

## Claim tested

Exported `GIT_DIR`/`GIT_WORK_TREE` beat `git -C` and `cd`; a scrub applied only to the `git clone` line still
lets the next commit land in the inherited repository A.

## Statement-by-statement comparison (M3 paragraph and its decision-table row)

Sources compared: `/fast/scratch/hyaku/kumitate-r45/a2/inherited-entry-draft.md` (draft entry, M3 and the
"edit code, run a gate that writes" row), lane records, and git docs at tag v2.56.0 re-fetched by me.

```
S01 "git -C <B> commit commits into A with GIT_DIR=A/.git"      CONFIRMED  A 1->2 commits, subject "leak via -C"; B stays 1
S02 "cd <B> && git commit commits into A"                       CONFIRMED  A 2->3, subject "leak via cd"; B stays 1
S03 "unset, the commit lands in B"                              CONFIRMED  control: cB 1->3 ("control via -C","control via cd"); cA stays 1
S04 "a hook in A sees 12 GIT_* names"                           CONFIRMED  reproduced exactly 12, identical name set (probe5); see caveat C1
S05 "git clone with GIT_DIR exported leaves A untouched"        CONFIRMED  A commits 2->2, A loose objects 6->6, clone exit 0
S06 "next git -C <clone> commit commits into A"                 CONFIRMED  A 2->3 "probe-after-clone"; clone stays 1
S07 "scrubbing only the clone line still lands in A"            CONFIRMED  A 3->4 "probe-half-scrub"; clone-half stays 1
S08 "git rev-parse --local-env-vars lists 15 names"             CONFIRMED  count=15, list byte-identical to the receipt's
S09 "the lane's rule scrubbed 3"                                CONFIRMED  round-44 specs: env -u GIT_DIR -u GIT_WORK_TREE -u GIT_INDEX_FILE = 3
S10 git.adoc GIT_DIR quote, verbatim                            CONFIRMED  git.adoc.txt:541, 25 words, body sha256 050c5330f1a2...
S11 "-C only sets the starting directory"                       CONFIRMED  git.adoc.txt:64; and observed: repo choice followed GIT_DIR, not -C
S12 githooks.adoc export quote, verbatim                        CONFIRMED  githooks.adoc.txt:30, 22 words, body sha256 c3aff4866753...
S13 lane record round 37 falsify/Sec3.md:48-54                  CONFIRMED  "L1 Ambient GIT_DIR reaches fixture git calls" starts at :48
S14 lane record r42 CritManifestDesign ":7,30-31, 1032 files, 75/75" CONFIRMED  "1032 files changed ... 75/75 PASS" at :7 and E11 at :30
S15 dt-row "unset $(git rev-parse --local-env-vars) (15 names)" CONFIRMED  15 (S08)
S16 dt-row "not only the clone command"                         CONFIRMED  S07
S17 dt-row "commits and index writes landing in inherited repo" CONFIRMED  A index sha 90f246d7..->7df5e642.., B index sha unchanged
S18 dt-row pointer "M3 - DemoGitEnvLeak"                        CONFIRMED  receipt exists at the named path, rev=cfa99304
```

C1 (stability of the "12 names" number, advisory for the entry): the count is not a property of the mechanism,
it is git's own additions plus whatever the caller exported. Measured, same leak shape, varying only the caller
environment: `env -i` minimal = 8; `+GIT_PAGER +GIT_TERMINAL_PROMPT` = 10; both + committer identity = 12;
identity passed with `-c` instead = 11 (GIT_CONFIG_PARAMETERS replaces GIT_COMMITTER_*); my own seat shell
(GIT_EDITOR/GIT_PAGER/GIT_TERMINAL_PROMPT exported) with author+committer exported = 13. The inherited 12 is
reproducible and its name set is identical, but as a constant in a knowledge entry it is unsteady; "the hook
inherits the caller's `GIT_*` plus git's own additions (12 in that run, 8 under `env -i`)" would hold.

## Evidence (commands and decisive output)

```
$ git rev-parse --local-env-vars | wc -l
15
$ git rev-parse --local-env-vars
GIT_ALTERNATE_OBJECT_DIRECTORIES GIT_CONFIG GIT_CONFIG_PARAMETERS GIT_CONFIG_COUNT GIT_OBJECT_DIRECTORY
GIT_DIR GIT_WORK_TREE GIT_IMPLICIT_WORK_TREE GIT_GRAFT_FILE GIT_INDEX_FILE GIT_NO_REPLACE_OBJECTS
GIT_REPLACE_REF_BASE GIT_PREFIX GIT_SHALLOW_FILE GIT_COMMON_DIR

$ systemd-run --user --scope --quiet -p MemoryMax=4G -p TasksMax=128 timeout -s KILL 900 bash demo-git-env-leak.sh
wrapper_exit=0  (121 output lines, out.txt sha256 80151d21e810...)
  SECTION 2 (GIT_DIR=A/.git exported)
  A(before)  count=1   B(before)  count=1
  2a git -C B commit  -> A count=2 "leak via -C" ; B count=1
  2b cd B && git commit -> A count=3 "leak via cd" ; B count=1
     A tree: a.txt leak1.txt leak2.txt      B tree: b.txt
  SECTION 3 (clone)
  3a git clone (GIT_DIR exported) exit=0 ; clone_leak count=1 origin=.../lab/B
  3b git -C clone_leak commit -> A count=4 "leak via clone -C" ; clone_leak count=1 ; A tree gains c.txt
  3c env -u ... git clone (half scrub) -> clone_scrub count=1
     then git -C clone_scrub commit -> A count=5 "leak via scrubbed clone" ; clone_scrub count=1
  SECTION 4 (CONTROL, GIT_DIR/GIT_WORK_TREE unset)
  4a git -C cB commit -> cB 1->2 "control via -C" ; cA 1
  4b cd cB && git commit -> cB 3 "control via cd" ; cA 1
  4c clone + commit in clone -> cclone 4 "control via clone" ; cA 1 ; cB 3
  SECTION 5 (GIT_WORK_TREE=A, GIT_DIR unset)
  git -C B rev-parse --show-toplevel      -> .../lab/A
  git -C B rev-parse --absolute-git-dir   -> .../lab/B/.git
  SECTION 6 summary: A=5 B=1 clone_leak=1 clone_scrub=1 cA=1 cB=3 cclone=4 local-env-vars=15

$ bash probe2-index-hook.sh   (probe2.txt sha256 888a4886a24b...)
P1 A index sha 90f246d7.. -> 7df5e642.. changed=yes ; B index sha a775ed46.. -> a775ed46.. changed=no
   A index entries: new.txt seed.txt   (new.txt was created inside B)
P2 hook sees 11 names in my seat-shell shape (GIT_CONFIG_PARAMETERS in, GIT_COMMITTER_* out)
P3 clone: A commits 2->2 (touched=no), A loose objects 6->6, clone exit 0, clone count 1
P4 next command: A 3 "probe-after-clone", clone 1
P5 half scrub: A 4 "probe-half-scrub", clone-half 1

$ bash probe4-hook-count.sh  /  probe5-count12.sh
V1 repo-config identity, no GIT_DIR ......  9 names
V2 repo-config identity, GIT_DIR ......... 10 names
V3 env -i clean, GIT_DIR .................  8 names
V4 env -i, -c identity, GIT_DIR ..........  9 names
V5 env -i, author+committer exported ..... 10 names
P5 minimal env ...........................  8
P5 +GIT_PAGER +GIT_TERMINAL_PROMPT ....... 10
P5 +COMMITTER ident ...................... 12  names: GIT_AUTHOR_DATE GIT_AUTHOR_EMAIL GIT_AUTHOR_NAME
   GIT_COMMITTER_EMAIL GIT_COMMITTER_NAME GIT_DIR GIT_EDITOR GIT_EXEC_PATH GIT_INDEX_FILE GIT_PAGER
   GIT_PREFIX GIT_TERMINAL_PROMPT
P5 -c identity ........................... 11  (GIT_CONFIG_PARAMETERS in, GIT_COMMITTER_* out)

$ curl -sS -o git.adoc.txt -w 'http=%{http_code} bytes=%{size_download}' \
    https://raw.githubusercontent.com/git/git/v2.56.0/Documentation/git.adoc
http=200 bytes=47005   sha256 050c5330f1a231be22bee3db27c7ef90d8ba22bb7bd6c72c8bab462f6f0a1f79
$ grep -n 'If the `GIT_DIR` environment variable is set' git.adoc.txt
541:    If the `GIT_DIR` environment variable is set then it
$ grep -n 'Run as if git was started in' git.adoc.txt
64:    Run as if git was started in '<path>' instead of the current working
$ printf '%s' '<the two quotes>' | wc -w  -> 25 and 22
$ curl -sS -o githooks.adoc.txt .../v2.56.0/Documentation/githooks.adoc
http=200 bytes=29873   sha256 c3aff48667535943bf368c0086567a0f313661bd0544abbb8a41ff90a0cfcdb1
$ grep -n 'Environment variables, such as' githooks.adoc.txt
30:Environment variables, such as `GIT_DIR`, `GIT_WORK_TREE`, etc., are exported

$ python3 -c '<extract GIT_ sentences from round-44 specs>'
falsify-spec.json:: ... in your OWN clone, made with GIT_DIR, GIT_WORK_TREE and GIT_INDEX_FILE unset:
env -u GIT_DIR -u GIT_WORK_TREE -u GIT_INDEX_FILE git clone -q --no-hardlinks ...   (3 names, clone line only)
$ sed -n '46,56p' .ufo/waves/round-37/falsify/Sec3.md
## Leaks / L1 Ambient GIT_DIR reaches fixture git calls. ... Victim gained commit "fixture pin" ...
$ sed -n '1,12p;27,34p' .ufo/waves/round-42/build/CritManifestDesign.md
HIGH: a `KUMITATE_*`-only scrub leaks `GIT_DIR` ... unmutated control read `75/75 PASS` ...
committed `7ba9b82 fixture` ... 1032 files changed ...
E11 ... control `exit=0 PASS 75/75`; afterwards `git -C lane log` -> `ab99489 fixture`, `7ba9b82 fixture`;
     `show --stat 7ba9b82` -> `1032 files changed, 1300 insertions(+), 163552 deletions(-)`
```

## Full demo script (`demo-git-env-leak.sh`, sha256 886fdff8be0f41469e3c3f10e8ad8b642f88351861bb06aa1dfa8bfc9aa16343)

```bash
#!/usr/bin/env bash
# Re-derivation demo (independent, written before reading any inherited receipt).
# Claim under test (M3-ish): an exported GIT_DIR (and GIT_WORK_TREE) beats `git -C`
# and `cd`; a scrub applied only to the `git clone` command still lets a later
# commit land in the inherited repository A.
#
# Everything happens inside $ROOT (scratch only). No network, no host state.
set -u

ROOT="$(cd "$(dirname "$0")" && pwd)/lab"
rm -rf "$ROOT"
mkdir -p "$ROOT"
cd "$ROOT" || exit 1

# Identity is passed per-command with -c so no config file is ever written.
GITC=(-c user.name=demo -c user.email=demo@example.invalid -c commit.gpgsign=false -c init.defaultBranch=main)

# ---- measurement helpers (always run with the inherited env scrubbed) -------
# state <repo> <label>: prints branch, HEAD sha, commit count, and top subject
state() {
  local repo="$1" label="$2"
  local gd="$repo/.git"
  if [ ! -d "$gd" ]; then
    printf '  %-14s NO_GIT_DIR\n' "$label"
    return
  fi
  env -u GIT_DIR -u GIT_WORK_TREE -u GIT_INDEX_FILE \
    git --git-dir="$gd" --work-tree="$repo" \
        log -1 --format='branch=%D head=%h count=%H subject=%s' 2>/dev/null \
    | sed "s/^/  $label /"
  env -u GIT_DIR -u GIT_WORK_TREE -u GIT_INDEX_FILE \
    git --git-dir="$gd" rev-list --count HEAD 2>/dev/null \
    | sed "s/^/  $label commit_count=/"
}

echo "=================================================================="
echo "SECTION 0 — environment facts"
echo "=================================================================="
echo "git version: $(git --version)"
echo "GIT_DIR in env at start: ${GIT_DIR:-<unset>}"
echo "GIT_WORK_TREE in env at start: ${GIT_WORK_TREE:-<unset>}"
echo "git rev-parse --local-env-vars count: $(git rev-parse --local-env-vars | wc -l)"
echo "git rev-parse --local-env-vars names:" $(git rev-parse --local-env-vars | tr '\n' ' ')

# ---- build the two fresh repos A and B, with no GIT_* exported --------------
echo
echo "=================================================================="
echo "SECTION 1 — build two fresh repos A and B (no GIT_* exported)"
echo "=================================================================="
mkdir -p A B
git "${GITC[@]}" init -q A
git "${GITC[@]}" init -q B
echo "A seed" > A/a.txt
( cd A && git "${GITC[@]}" add a.txt && git "${GITC[@]}" commit -q -m "A seed commit" )
echo "B seed" > B/b.txt
( cd B && git "${GITC[@]}" add b.txt && git "${GITC[@]}" commit -q -m "B seed commit" )
state "$ROOT/A" "A(before)"
state "$ROOT/B" "B(before)"

# ---- leak phase: export GIT_DIR=A/.git ------------------------------------
echo
echo "=================================================================="
echo "SECTION 2 — LEAK: export GIT_DIR=A/.git, then commit inside B"
echo "=================================================================="
export GIT_DIR="$ROOT/A/.git"
echo "exported GIT_DIR=$GIT_DIR"
echo "git rev-parse --local-env-vars count (still): $(git rev-parse --local-env-vars | wc -l)"
echo "git rev-parse --local-env-vars names (still):" $(git rev-parse --local-env-vars | tr '\n' ' ')

echo
echo "-- 2a: git -C B commit (file added with git -C B add)"
echo "leak file one" > B/leak1.txt
git -C B "${GITC[@]}" add leak1.txt 2>&1 | sed 's/^/   add-out: /'
echo "   add exit=$?"
git -C B "${GITC[@]}" commit -q -m "leak via -C" 2>&1 | sed 's/^/   commit-out: /'
echo "   commit exit=$?"
state "$ROOT/A" "A(after -C)"
state "$ROOT/B" "B(after -C)"
echo "   A tree now:" $(env -u GIT_DIR git --git-dir="$ROOT/A/.git" ls-tree --name-only HEAD | tr '\n' ' ')
echo "   B tree now:" $(env -u GIT_DIR git --git-dir="$ROOT/B/.git" ls-tree --name-only HEAD | tr '\n' ' ')

echo
echo "-- 2b: cd B && git commit"
echo "leak file two" > B/leak2.txt
( cd B && git "${GITC[@]}" add leak2.txt && git "${GITC[@]}" commit -q -m "leak via cd" ) 2>&1 | sed 's/^/   cd-out: /'
state "$ROOT/A" "A(after cd)"
state "$ROOT/B" "B(after cd)"
echo "   A tree now:" $(env -u GIT_DIR git --git-dir="$ROOT/A/.git" ls-tree --name-only HEAD | tr '\n' ' ')
echo "   B tree now:" $(env -u GIT_DIR git --git-dir="$ROOT/B/.git" ls-tree --name-only HEAD | tr '\n' ' ')

echo
echo "-- 2c: which repo received the new commits? (explicit git-dir probe)"
echo "   A recent subjects:" $(env -u GIT_DIR git --git-dir="$ROOT/A/.git" log --format='%s' | tr '\n' '|')
echo "   B recent subjects:" $(env -u GIT_DIR git --git-dir="$ROOT/B/.git" log --format='%s' | tr '\n' '|')

# ---- clone phase -----------------------------------------------------------
echo
echo "=================================================================="
echo "SECTION 3 — git clone with GIT_DIR still exported"
echo "=================================================================="
echo "-- 3a: plain 'git clone' with GIT_DIR exported (no scrub)"
git "${GITC[@]}" clone -q "$ROOT/B" "$ROOT/clone_leak" 2>&1 | sed 's/^/   clone-out: /'
echo "   clone exit=$?"
if [ -d "$ROOT/clone_leak/.git" ]; then
  echo "   clone_leak/.git exists: yes"
  state "$ROOT/clone_leak" "clone_leak"
  echo "   clone_leak remote origin:" $(env -u GIT_DIR git --git-dir="$ROOT/clone_leak/.git" config --get remote.origin.url)
  echo
  echo "   -- 3b: git -C clone_leak commit (GIT_DIR still exported)"
  echo "clone leak file" > "$ROOT/clone_leak/c.txt"
  git -C "$ROOT/clone_leak" "${GITC[@]}" add c.txt 2>&1 | sed 's/^/   add-out: /'
  git -C "$ROOT/clone_leak" "${GITC[@]}" commit -q -m "leak via clone -C" 2>&1 | sed 's/^/   commit-out: /'
  state "$ROOT/A" "A(after clone)"
  state "$ROOT/clone_leak" "clone_leak(after)"
  echo "   A tree now:" $(env -u GIT_DIR git --git-dir="$ROOT/A/.git" ls-tree --name-only HEAD | tr '\n' ' ')
  echo "   clone_leak tree now:" $(env -u GIT_DIR git --git-dir="$ROOT/clone_leak/.git" ls-tree --name-only HEAD | tr '\n' ' ')
else
  echo "   clone_leak/.git missing"
fi

echo
echo "-- 3c: clone-only scrub (unset GIT_DIR just for the clone command)"
env -u GIT_DIR -u GIT_WORK_TREE -u GIT_INDEX_FILE \
  git "${GITC[@]}" clone -q "$ROOT/B" "$ROOT/clone_scrub" 2>&1 | sed 's/^/   clone-out: /'
echo "   clone exit=$?"
if [ -d "$ROOT/clone_scrub/.git" ]; then
  state "$ROOT/clone_scrub" "clone_scrub"
  echo "   clone_scrub recent subjects:" $(env -u GIT_DIR git --git-dir="$ROOT/clone_scrub/.git" log --format='%s' | tr '\n' '|')
  echo "   -- now commit inside the scrubbed clone WITHOUT scrubbing the env"
  echo "scrubbed clone file" > "$ROOT/clone_scrub/d.txt"
  git -C "$ROOT/clone_scrub" "${GITC[@]}" add d.txt 2>&1 | sed 's/^/   add-out: /'
  git -C "$ROOT/clone_scrub" "${GITC[@]}" commit -q -m "leak via scrubbed clone" 2>&1 | sed 's/^/   commit-out: /'
  state "$ROOT/A" "A(after scrubbed clone)"
  state "$ROOT/clone_scrub" "clone_scrub(after)"
  echo "   clone_scrub recent subjects:" $(env -u GIT_DIR git --git-dir="$ROOT/clone_scrub/.git" log --format='%s' | tr '\n' '|')
  echo "   A recent subjects:" $(env -u GIT_DIR git --git-dir="$ROOT/A/.git" log --format='%s' | tr '\n' '|')
fi

# ---- control phase: GIT_DIR unset ------------------------------------------
echo
echo "=================================================================="
echo "SECTION 4 — CONTROL: same operations with GIT_DIR/GIT_WORK_TREE unset"
echo "=================================================================="
unset GIT_DIR
unset GIT_WORK_TREE
unset GIT_INDEX_FILE
mkdir -p cA cB
git "${GITC[@]}" init -q cA
git "${GITC[@]}" init -q cB
echo "cA seed" > cA/a.txt
( cd cA && git "${GITC[@]}" add a.txt && git "${GITC[@]}" commit -q -m "cA seed commit" )
echo "cB seed" > cB/b.txt
( cd cB && git "${GITC[@]}" add b.txt && git "${GITC[@]}" commit -q -m "cB seed commit" )
echo "-- 4a: git -C cB commit (no GIT_DIR)"
echo "control file" > cB/ctl.txt
git -C cB "${GITC[@]}" add ctl.txt 2>&1 | sed 's/^/   add-out: /'
git -C cB "${GITC[@]}" commit -q -m "control via -C" 2>&1 | sed 's/^/   commit-out: /'
state "$ROOT/cA" "cA(after)"
state "$ROOT/cB" "cB(after)"
echo "-- 4b: cd cB && git commit (no GIT_DIR)"
echo "control file two" > cB/ctl2.txt
( cd cB && git "${GITC[@]}" add ctl2.txt && git "${GITC[@]}" commit -q -m "control via cd" ) 2>&1 | sed 's/^/   cd-out: /'
state "$ROOT/cA" "cA(after cd)"
state "$ROOT/cB" "cB(after cd)"
echo "-- 4c: clone + commit in clone (no GIT_DIR)"
git "${GITC[@]}" clone -q "$ROOT/cB" "$ROOT/cclone" 2>&1 | sed 's/^/   clone-out: /'
echo "control clone file" > "$ROOT/cclone/e.txt"
git -C "$ROOT/cclone" "${GITC[@]}" add e.txt 2>&1 | sed 's/^/   add-out: /'
git -C "$ROOT/cclone" "${GITC[@]}" commit -q -m "control via clone" 2>&1 | sed 's/^/   commit-out: /'
state "$ROOT/cA" "cA(after clone)"
state "$ROOT/cB" "cB(after clone)"
state "$ROOT/cclone" "cclone(after)"
echo "   cB recent subjects:" $(env -u GIT_DIR git --git-dir="$ROOT/cB/.git" log --format='%s' | tr '\n' '|')
echo "   cclone recent subjects:" $(env -u GIT_DIR git --git-dir="$ROOT/cclone/.git" log --format='%s' | tr '\n' '|')
echo "   cA recent subjects:" $(env -u GIT_DIR git --git-dir="$ROOT/cA/.git" log --format='%s' | tr '\n' '|')

# ---- GIT_WORK_TREE only ----------------------------------------------------
echo
echo "=================================================================="
echo "SECTION 5 — GIT_WORK_TREE exported (GIT_DIR unset)"
echo "=================================================================="
export GIT_WORK_TREE="$ROOT/A"
echo "exported GIT_WORK_TREE=$GIT_WORK_TREE (GIT_DIR unset)"
echo "   git -C B rev-parse --show-toplevel:" $(git -C "$ROOT/B" rev-parse --show-toplevel 2>&1)
echo "   git -C B rev-parse --absolute-git-dir:" $(git -C "$ROOT/B" rev-parse --absolute-git-dir 2>&1)
echo "   git rev-parse --local-env-vars count: $(git rev-parse --local-env-vars | wc -l)"
unset GIT_WORK_TREE

echo
echo "=================================================================="
echo "SECTION 6 — summary counters"
echo "=================================================================="
cnt() { env -u GIT_DIR git --git-dir="$1/.git" rev-list --count HEAD 2>/dev/null || echo 0; }
echo "A commits            : $(cnt "$ROOT/A")"
echo "B commits            : $(cnt "$ROOT/B")"
echo "clone_leak commits   : $(cnt "$ROOT/clone_leak")"
echo "clone_scrub commits  : $(cnt "$ROOT/clone_scrub")"
echo "cA commits           : $(cnt "$ROOT/cA")"
echo "cB commits           : $(cnt "$ROOT/cB")"
echo "cclone commits       : $(cnt "$ROOT/cclone")"
echo "local-env-vars count : $(git rev-parse --local-env-vars | wc -l)"
echo "DONE"
```

## Notes, limits, risks

- Effect is real and directional: with `GIT_DIR` exported, every commit invoked through `-C`, `cd`, a clone and a
  scrubbed clone landed on A's branch and A's index; the do-nothing control in the same script (section 4) put
  the same three commits in their own repositories, so the control shows no effect.
- The draft's M3 wording holds as written except one unsteady constant: the "12 `GIT_*` names" figure is the
  caller's environment plus git's additions, not a fixed number (8 to 13 observed across shapes; 12 reproduced
  exactly with the inherited shape and the identical name set).
- Limits: one host, git 2.56.0 only; no Windows path forms; `git clone`'s internal handling of `GIT_DIR` was
  observed by its effect (A untouched by the clone) and not read from git source. `git clone` with
  `GIT_WORK_TREE` exported (inherited O17, `fatal: working tree ... already exists`) was NOT re-run by me.
- Risk for the entry: a decision-table row that quotes "12" as a fact will read as mechanism-derived when it is
  environment-derived; S04's caveat is the smallest correction.
- Artifacts are scratch-only and uncommitted: `demo-git-env-leak.sh` 886fdff8be0f41469e3c3f10e8ad8b642f88351861bb06aa1dfa8bfc9aa16343,
  `probe2-index-hook.sh` 94220a3c91b593c2879aa660967d9da8310b5ff1e061d87b6582b1360ce930d5,
  `probe3-ident-names.sh` d0f9f2dbf77910d8962e1bf7763ed21757bcf6bcc7fab51fcd0963a217d3b3a5,
  `probe4-hook-count.sh` bc51020a5e270af775dc4ad542ac7d008123890d9ad9e5c2c176713aba8d1c0e,
  `probe5-count12.sh` 8812860d3eadeea8cff0d63ccacb593ac906b8bdaf9f6e3dba4812b1c171f79a,
  `out.txt` 80151d21e810555d1afe20bd0e1886349d6aaafe8a00a08e6bbe69ae35f514eb,
  `probe2.txt` 888a4886a24bbfcf108644d645b95feeab05e912c5f028555f11e1ee74404e09,
  `probe4.txt` d130d1609827dc6b0524af6c415f7370e0150ff938842055145e7f13b6aa0d67,
  `probe5.txt` 5bff3449b4b0fa8ee99bfce3414fd5ecad4adfd221dd9369086e957a4eee6243.
- No lane writes except this report; no git or jj writes anywhere; no secrets read; `procs=0` after every run.
