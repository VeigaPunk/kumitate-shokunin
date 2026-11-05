# Round 89 — a scorer that tells the candidate which arm it is measuring is not a scorer

Lane kumitate, 2026-11-04, Linux run-15 host, round 89 attempt 2. Base
`a5d2503393fc5646acb6468888d8b12a445bf62d`; freeze `adfc2f55675f760eaf8b59f80033f926500cd951` (plan,
30-arm probe, 22 pre-data controls, round-open gates); wave spec/dispatch `9c3b64e44024869937a827d588fe1b75e6692ef7`
(13 seats). Paths beginning `open/`, `controls/`, `probe/`, `w1/` or `build/` resolve beneath
`.ufo/waves/round-89/`. One claim: C1 operability, capability acquisition `receipt-bind` v3.

## Method

Rounds 87 and 88 both lost this capability to the same kill rule: a seat construction reached the
frozen terminal score while skipping a claimed behaviour. Round 89 froze a 30-arm scorer built to
make every byte source disagree along a distinct arm — three commits (A, B, C=HEAD), a staged body
that differs from both HEAD and the worktree, a dirty worktree, an untracked instrument, a committed
mode-120000 symlink, and a 12-hex nonce drawn at run time for every body, directory name and commit
message — and committed 22 pre-data controls (`controls/table.txt`). All nine round-88 kill-rule
constructions fall below terminal before any data: `c2-head-default` 24/30, `e2-index-default` 24/30,
`ctl-abs-disk` 26/30, `d-fixture-gated-boundaries` 19/30, `f1-size-after-read` 26/30,
`f4-textual-escape` 26/30, `f5-loose-limit` 26/30, `f6-dup-equal-ok` 26/30, `nogit-overfit` 17/30;
the do-nothing control (v2) 27/30, its worktree twin 14/30, blanket refusal 2/30.

The L1 integrated the wave's v3 candidate (`scripts/receipt-bind.mjs`, sha256 `37201ad0…`, selftest
59 → 68 arms) and measured `C89_C1: HELD held=30/30` at the integration tip.

**The claim is UNMET.** Two seats independently constructed tools that reach 30/30 while skipping
claimed behaviour, and the L1 re-ran both:

| construction | what it skips | score | receipt |
|---|---|---|---|
| `cand-probe-keyed.mjs` | everything: it reads the `--dir` basename (`<arm>-<12 hex>`), prints the verdict that arm expects and computes nothing | **30/30** | `build/K89Review/probe-cand-probe-keyed.txt`, L1 re-run |
| `cand-skip-mode.mjs` | the git mode test (a blob-*shape* test instead) and real-path membership (a literal `/proc/self/root` prefix strip) | **30/30** | `build/K89Review/probe-cand-skip-mode.txt`, L1 re-run |

The instrument is stronger than the scorer on inputs the scorer never drew: on the reviewer's D1 (a
committed mode-120000 symlink whose target has a space) and D3 (an in-lane instrument through a
symlinked ancestor before a dirty worktree) the integrated v3 answers `SYMLINK_INSTRUMENT` and `CLEAN`
where both constructions answer `CLEAN` and `DRIFT external=1` (`build/K89Review/demos.txt`), and the
v3 candidate closes an absolute-token symlink gap the probe has no arm for
(`build/K89ExecInst/abs-symlink-check.txt`). The frozen kill rule is written against the scorer's
score, so it fires: **rejected-honest-stop, third in a row for this capability, and the root cause is
the scorer class, not the instrument.** No capability row enters the table.

## Gate

Sources opened this round by the L1 (captures under `open/`, sha256 pinned in
`.ufo/pins/source-captures.json`, `SOURCE_CAPTURE: CLEAN captures=86 exemptions=111`):

- **Admit — S255, mined, A.** *proc_pid_root(5)*, https://man7.org/linux/man-pages/man5/proc_pid_root.5.html,
  § DESCRIPTION `/proc/pid/root/`, accessed 2026-11-04. Located quote (`open/proc-root.html` line 70):
  “a symbolic link that points to the process's root directory, and behaves in the same way as exe,
  and fd/*”. Grounds real-path lane membership (`alias-proc-root`). sha256 `1a71736f…c251ac`.
- **Admit — S256, mined, A.** *POSIX realpath(3)*,
  https://pubs.opengroup.org/onlinepubs/9799919799/functions/realpath.html, § DESCRIPTION, accessed
  2026-11-04. Located quote (`open/posix-realpath.html` line 40): “resolution does not involve '.',
  '..', or symbolic links”. Grounds resolving both sides before comparing. sha256 `1573b1a2…5f25e`.
- **Admit — S257, mined, A.** *Git index format* (`gitformat-index`), https://git-scm.com/docs/gitformat-index,
  § Index entry, 4-bit object type, accessed 2026-11-04. Located quote (`open/gitformat-index.html`
  line 1625): “valid values in binary are 1000 (regular file), 1010 (symbolic link)”. Grounds
  `SYMLINK_INSTRUMENT`. sha256 `723e4e71…76d2c`.
- **Admit — S258, mined, A.** *The Unicode Standard 15.0, ch.3*, https://www.unicode.org/versions/Unicode15.0.0/ch03.pdf,
  § 3.9 Encoding Schemes (UTF-8), accessed 2026-11-04. Located quote (`open/unicode-ch03.txt` line
  2583): “its usage at the beginning of a UTF-8 data stream is neither required nor recommended …
  but its presence does not affect conformance”. Grounds the BOM strip. sha256 `cca252ce…635030`.
- **Reject — S259, rejected, B.** *git-ls-tree*, https://git-scm.com/docs/git-ls-tree, § OUTPUT,
  accessed 2026-11-04, capture `open/git-ls-tree.html` sha256 `ff06fbc8…818267`. The page documents
  `ls-tree` output columns but never states the object-mode encoding (`grep -c 120000` → 0), so it
  cannot ground a mode test. Flip: a git manual page that states the mode table (gitformat-index,
  admitted as S257).
- **Registry changes, old→new.** S255–S258 added (`mined`, used-by
  `corpus/knowledge/receipt-lane-membership-and-link-binding.md`); S259 added (`rejected`, used-by
  `—`). No existing `status`, `recheck` or `used-by` cell changed this round. Row census 192 → 197
  (`grep -cE '^\|[[:space:]]*S[0-9]{3,}[[:space:]]*\|' corpus/SOURCES.md`).
- Sourced claim: C1's knowledge section (`corpus/knowledge/receipt-lane-membership-and-link-binding.md`)
  cites S255, S256, S257 and S258.
- **Assimilation: none.** `/home/vgpnk/Projects/shokuknow/merge/kumitate` was not adopted: the round's
  claim, the probe investigation and the routed-debt repairs filled it. `considerthese/2026-10-26.md`
  (latest) re-checked: its ideas 1/2/3/4/6 are already implemented as Q75/Q76/Q68/Q69/Q72, idea 5 is
  outside this province.

## Mistakes

| class | evidence pointer | captured-by | fix |
|---|---|---|---|
| **survivor** (round 88, mined here) | `build/K88Critic/SCORES.md` + `build/K88Critic/discriminate.mjs`: nine constructions reached 20/20 while the same round's own off-probe table already showed each of them wrong | `none` at the time — Q81 said a scorer must make the judged revision and the worktree differ, but nothing said a scorer must be scored by its own *known* constructions before the round freezes it | Q81's round-88 amendment (bind the fixture to HEAD/index/worktree/edges) **and** the pre-data control table this round committed (`controls/table.txt`) |
| **vacuous** (round 89, this round) | `build/K89Review/probe-cand-probe-keyed.txt` — a tool that computes nothing prints `C89_C1: HELD held=30/30` because `mk(name)` names each fixture directory `<arm>-<nonce>` and the probe reads only stdout | `none` — the plan's limit (a) asserted an output-text oracle could not be gamed this way; it was wrong | **Q82** (new): a scorer may not hand the candidate its fixture's identity; every shape-gated arm carries a positive twin |
| **survivor** (round 89, this round) | `build/K89Review/probe-cand-skip-mode.txt` (30/30 by a blob-shape test + literal prefix strip) and `build/K89ExecInst/abs-symlink-check.txt` (the probe has no arm for an *absolute* in-lane symlink token) | Q82, written this round after the finding — it did not exist when the probe was frozen | the Q82 twin requirement; the next scorer draws a non-bare symlink target and an absolute symlink token, and its fixture names carry no arm |
| **reference-drift** (round 89, this round) | `probe/probe89-c1.mjs` header still says A25 runs “under a 256 MiB address-space cap”; the code uses a mode-0000 sparse file (the cap was removed before the freeze commit) | Q82's "the scorer's docstring names the fixture it actually builds" | disclosed; the frozen probe is not edited after data |

## Limits

- The probe remains the counter of record for its claim and is not edited after data. Its defects
  (arm-name-keyed fixtures, shape-gated arms without twins, stale docstring, `usage`/`selftest` text
  stubs, worktree-read arms #3/#5) stand as findings for the next scorer, not as repairs.
- `limit-before-read` is host-dependent: it discriminates on uid 1000 because a mode-0000 file cannot
  be read; under root the read succeeds and the arm's discrimination would rest on the V8 string
  limit (not run).
- `alias-proc-root` needs `/proc/self/root`; on a host without it the arm cannot HOLD for any tool.
- The TOCTOU repair (one `O_NOFOLLOW` descriptor, `fstat` + read) carries selftest arms and no probe
  arm: a race is not observable from a scorer, so the claim never rested on it.
- The round lands the instrument, the corpus and the gate repairs, but **not** the capability: the
  scoreboard records UNMET.
