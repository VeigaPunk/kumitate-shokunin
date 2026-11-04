# Kumitate round 89 — plan (frozen before data)

Lane `kumitate-shokunin`, hyaku run 15, round 89 attempt 2, Linux host.
Base `a5d2503393fc5646acb6468888d8b12a445bf62d` (lane branch tip at round open, `ahead=0 behind=0`).
Round-start census `open/census-start.txt` (exit 0, 7 pinned `W04`). Attempt 1 of this round died
before landing anything but `.ufo/waves/round-89/open/census-start.txt`; that file is reused as the
attempt-2 round-start census and nothing else was inherited.

## Claims

### C1 — operability (lowest non-retired axis), capability acquisition `receipt-bind` (v3)

One claim. Operability sits at its terminal integer 9 under the frozen `f_O` proxy and every coverage
row is a saturated sub-axis at 10, so a second claim would be the same claim under `AXES.md`. The
stagnation nudge is **active**: the saturation line is 9 on every live axis and the last verified
capability row is `counter-receipt` v3 (round 86), so rounds 87 and 88 added no row and the window
N = 3 closed at round 89. The round is therefore a capability move, and it is claimed on operability
because the object it moves is a runnable instrument.

**Motivating evidence.** Rounds 87 and 88 both took `receipt-bind` as a rejected-honest-stop, and
both for the same reason: the scorer's fixtures made the byte sources disagree along fewer paths
than the instrument has, so seat-constructed tools that skip a claimed behaviour still reached the
frozen terminal score (round-87 `cand-a-worktree` 12/12; round-88 nine constructions at 20/20,
`.ufo/waves/round-88/build/K88Critic/SCORES.md`). Round 88's own pre-data control set proved the
instrument *is* stronger than that scorer: every 20/20 construction misbehaves on a fixture outside
the probe's path (`build/K88Critic/discriminate.mjs`).

**Predicate (frozen; the same sentence in the probe's header, the receipt label and this line).**
`node .ufo/waves/round-89/probe/probe89-c1.mjs --lane <LANE> --work <SCRATCH> --rev <REV>` prints
`C89_C1: HELD held=30/30` and exits 0 at REV.

**Kill rule (frozen).** Any control — a committed pre-data control below, the worktree twin of the
integrated instrument at M, or any seat-constructed control — that reaches 30/30 makes C1 UNMET
(rejected-honest-stop). A seat-constructed control is a tool that skips a claimed behaviour
(revision binding against HEAD / the index / the worktree, a receipt's own `rev=` precedence, the
size limit or its order, `ESCAPES_LANE` by resolution, `AMBIGUOUS_FIELD`, realpath lane membership,
BOM tolerance, or the mode-120000 instrument refusal) by construction.

**The thirty arms** (byte-frozen in `probe/probe89-c1.mjs`). A1–A20 carry probe88-c1's arms, with
the fixture rebuilt so the lane fixture holds three commits (A, B, C=HEAD), a staged body that
differs from both HEAD and the worktree, a dirty worktree, an untracked instrument and a committed
symlink instrument; every fixture body, directory name, commit message and outside-directory name is
drawn at run time from a 12-hex nonce, so no construction can key on a path (`/probe88/`) or on a
public body constant.

| arm | asserts | kills |
|---|---|---|
| `usage` | bare invocation exits 64 and prints `USAGE` | — |
| `selftest` | `--selftest` prints `RECEIPT_BIND_SELFTEST: PASS` | a no-op selftest |
| `detect-r86`, `detect-r86-renamed` | the round-86 receipts (9 of 10 misnamed) read `DRIFT`, also under new names | name-keyed binding |
| `clean-r87` | the round-87 close receipts bind clean | blanket refusal |
| `unchecked`, `unresolved`, `dir-missing`, `rev-bad`, `symlink-receipt` | the five fail-closed/`unchecked` arms of v2 | — |
| `rev-receipt-wins`, `rev-receipt-negative` | a receipt's own `rev=` wins over `--rev` | ignoring the receipt rev |
| `worktree-forgery` | a receipt binding worktree bytes is `mismatched` at the judged rev | worktree hashing |
| `default-rev` | no `rev=`: the judged rev binds although it is neither HEAD nor the index | HEAD/index defaults |
| `untracked-instrument` | an instrument absent at the rev is fail-closed | worktree fallback |
| `escape-relative` | a relative `cmd=` escaping the lane is `ESCAPES_LANE`; the absolute twin is a counted external | textual escape checks |
| `symlink-dir` | a `--dir` that is a symlink is `SYMLINK_DIR`; its real target binds | fixture-gated boundaries |
| `oversize` | 2 MiB refuses, 512 KiB binds | a loose limit |
| `duplicate-field` | duplicate `cmd=`/`tool_sha256=`/`rev=` (different values) are `AMBIGUOUS_FIELD` | first-wins parsing |
| `sweep` | every `scripts/*.mjs` at the rev binds clean, then one flipped digest is `first=` that receipt | non-determinism |
| **`default-rev-not-head`** | no `rev=`, judged at A while HEAD is C → clean | HEAD-default |
| **`index-not-judged`** | no `rev=`, judged at B while the index holds body S → clean | index-default |
| **`abs-in-lane-at-rev`** | an absolute in-lane token before a dirty worktree binds at the judged rev | disk hashing of in-lane tokens |
| **`limit-edge`** | exactly 1048576 binds, 1048577 refuses | a loose limit (2000000) |
| **`limit-before-read`** | a 1 GiB sparse receipt with mode 0000 refuses `RECEIPT_TOO_LARGE` | size checked after the read |
| **`escape-inner-dotdot`** | `scripts/../../<outside>/ext.mjs` is `ESCAPES_LANE` by resolution | textual escape checks |
| **`dup-equal-field`** | equal-valued duplicate `rev=`/`tool_sha256=` are `AMBIGUOUS_FIELD` | equal-value tolerance |
| **`alias-proc-root`** | an in-lane instrument named through `/proc/self/root` is IN the lane: the worktree digest is `mismatched`, `external=0` | lexical lane membership (a dirty-worktree forge counted external) |
| **`bom-rev`** | a UTF-8 BOM must not hide `rev=`: BOM + `rev=A` + A's digest, judged at C → clean | BOM-blind parsing (false `DRIFT`) |
| **`symlink-instrument`** | a committed mode-120000 instrument is `SYMLINK_INSTRUMENT` | hashing link text (a forge that binds arbitrary target content) |

`SYMLINK_INSTRUMENT` is the one contract token v3 adds; `kumitate-receipt-bind-v3` also states
realpath lane membership and BOM tolerance.

**Pre-data controls** (scored with the frozen probe, receipts `controls/ctl-*.txt`, table
`controls/table.txt`, driver `controls/run-controls.mjs`):

| control | held | failing arms |
|---|---|---|
| `base-v2-at-rev` (do-nothing: the committed v2 at the base rev) | 27/30 | `alias-proc-root`, `bom-rev`, `symlink-instrument` |
| `base-v1-round87` | 19/30 | the six boundary arms plus the three v3 arms |
| `c88-a-worktree-twin` / `d2-fixture-gated-revision` | 14/30 | revision-binding arms |
| `c88-b-ignore-receipt-rev` | 24/30 | `rev-receipt-wins` and the v3 arms |
| `c88-c-head-all` / `c88-e-index-all` | 16/30 | revision-binding arms |
| **`c88-c2-head-default`** | 24/30 | `default-rev`, `default-rev-not-head`, `index-not-judged` |
| **`c88-e2-index-default`** | 24/30 | `default-rev`, `default-rev-not-head`, `index-not-judged` |
| **`c88-d-fixture-gated-boundaries`** | 19/30 | every boundary arm (the fixture carries no `/probe88/` path) |
| **`c88-f1-size-after-read`** | 26/30 | `limit-before-read` |
| **`c88-f4-textual-escape`**, `c88-sentinel-ctl-escape-prefix` | 26/30 | `escape-inner-dotdot` |
| **`c88-f5-loose-limit`** | 26/30 | `limit-edge` |
| **`c88-f6-dup-equal-ok`** | 26/30 | `dup-equal-field` |
| **`c88-ctl-abs-disk`** | 26/30 | `abs-in-lane-at-rev` |
| **`c88-nogit-overfit`** | 17/30 | the run-time-drawn fixture removes every constant it overfit |
| `c88-sentinel-ctl-read-then-cap` | 26/30 | `limit-before-read` |
| `refuse-all` | 2/30 | blanket refusal is not a pass |
| `absent` | — | a missing tool scores nothing |
| `worktree-twin-at-rev` | 14/30 | revision binding |

Every one of the nine constructions that fired round 88's kill rule is below the terminal score
before any data is taken, so the kill rule cannot fire on a construction this lane already knows.

**Instrument changes the claim lands** (`scripts/receipt-bind.mjs`, v2 → v3): realpath lane
membership for absolute in-lane tokens (`/proc/self/root` aliases), a leading UTF-8 BOM stripped
before field parsing, `SYMLINK_INSTRUMENT` for a mode-120000 instrument at the judged rev (and for a
disk-read external instrument that is a symlink), and a TOCTOU-tight receipt read (open with
`O_NOFOLLOW`, then `fstat` and read the same descriptor) — the last landed with selftest arms but no
probe arm, because a race is not observable from the probe and the limit is recorded.

**Harm rules (declared before data).** H1 `node scripts/proxy-check.mjs --strict` must read MATCH at
M (the stanza re-pinned in the integration commit); H2 `node scripts/surface-probe.mjs --checklists`
must not lose an item that passes at the base; H3 `node scripts/sources-check.mjs`,
`source-capture.mjs`, `source-dupes.mjs` and `counter-pins.mjs` exit 0 at M; H4 the census exits 0;
H5 the instrument's own selftest passes at M with every pre-existing arm retained.

**Limits, recorded not hidden.** (a) The probe is an output-text oracle: it reads the instrument's
verdict lines, so an implementation that prints a verdict it did not compute is out of its reach;
the instrument's bytes are the judged object and the wave's mutation seats attack them. (b) `bom-rev`
asserts one repair (strip the BOM); an implementation that instead fail-closes a BOM receipt is
arguably stricter and would read UNMET — the round claims the stated behaviour, not "any safe
behaviour". (c) `limit-before-read` conflates order with unreadability: it proves the size is judged
before a read is attempted, not that no read is attempted for a *readable* oversize file. (d) The
TOCTOU fix has no arm. (e) `alias-proc-root` depends on `/proc` being mounted at `/proc/self/root`;
on a host without it the arm's fixture is inert and the probe fails closed.

## Round shape

ONE v1 wave of 13 seats under `ufo-wave-policy.json` (band 8–16), attack share 5/13 = 38 %
(reviewer, critic, mutation-tester, labrat, sentinel), one connector seat. The L1 holds the
canonical §3 planner seat (the validator rejects `planner`); a bounded planning data-walk rides the
scout item.

## Frontier step

`corpus/SOURCES.md` curation: the round opens the sources for the three v3 boundaries — realpath /
`/proc/self/root` alias semantics, U+FEFF byte-order mark handling, and the git mode-120000 symlink
blob — and re-opens S218 (CWE-59) and S252 (CWE-22). One mined mistake: round 88's scorer could not
see what its own control set had already proven (`## Mistakes` in `corpus/lessons/round-89.md`).
The sourced claim: C1's knowledge section cites the new `S###` rows.
