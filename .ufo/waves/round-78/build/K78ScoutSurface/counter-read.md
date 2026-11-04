# K78ScoutSurface — frozen counter C2 read (`probe/probe78-c2.mjs`)

File: `.ufo/waves/round-78/probe/probe78-c2.mjs`
sha256 `a46e53d7449bffad66541dae4661e20651930dc4551b49f6544eb56d5e84b460` (241 lines, 11 arms).
Frozen: do not edit. A counter change is a routed defect, not a seat edit.

## 1. Invocation and the lane-resolution defect

`parseArgs` (L30-45) accepts `--set c2`, `--lane DIR`, `--work DIR`, `--keep-work`, `--help`.
`main` (L199-241): resolves `lane`, makes `work`, validates the pinned receipt, materialises it
into `work/omp-root`, runs the arms, prints one `C78_C2 arm …` line per arm, then
`C78_C2: HELD held=<n>/11`, exits 0 iff all 11 pass.

```js
24 const SELF = fileURLToPath(import.meta.url);
25 const DEFAULT_LANE = resolve(dirname(SELF), '..', '..', '..');
26 const RECEIPT_REL = '.ufo/pins/omp-shape.json';
...
213   const receipt = join(lane, RECEIPT_REL);
215   if (!validShape(doc)) {
216     process.stderr.write(`probe78-c2: receipt ${receipt} invalid\n`);
217     process.exit(2);
```

`SELF` is `<lane>/.ufo/waves/round-78/probe/probe78-c2.mjs`; three `..` steps land on
`<lane>/.ufo`, not on `<lane>`. **Measured** (base tree, default lane):

```
$ node .ufo/waves/round-78/probe/probe78-c2.mjs --set c2
probe78-c2: receipt /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/.ufo/pins/omp-shape.json invalid
exit 2
```

(`build/K78ScoutSurface/counter-base-ad2630d0.txt`.) The probe aborts before any arm, so the
plan's and C2's literal claim command (`node .ufo/waves/round-78/probe/probe78-c2.mjs --set c2`)
is **unsatisfiable by any implementation**. With an explicit lane it behaves as designed:

```
$ node .ufo/waves/round-78/probe/probe78-c2.mjs --set c2 --lane <lane> --work <scratch>
C78_C2: HELD held=2/11        # base tree, exit 1
```

(`counter-base-lane.txt`), matching pre-data control A (`controls/c2-base.txt`, `held=2/11`).
Control B (constant-printer stub) reads `held=5/11` — the counter kills a constant printer on
arms 3-5 and 10. Both controls pass `--lane` explicitly, so the defect is outside the measured
controls but inside the frozen claim sentence. **Routed defect, not a seat edit.**
`probe78-c1.mjs:25` carries the same expression, and its arms resolve every
`scripts/*.mjs`, `SCORECARD.md` and `corpus/` path through `ctx.lane` (L82-87, L147-165,
L210-211), so C1's claim sentence is exposed identically. Plan Amendment 2 (working tree,
pre-verdict, append-only) records this and rewrites both claim invocations to the explicit
`--lane /home/vgpnk/Projects/shokunin/kumitate-shokunin` form; the `DEFAULT_LANE` rewrite itself is
routed to round 79 and the probe bytes are unchanged (`probe78-c2.mjs` = `a46e53d7…`; C1 is at
`5e9d9d4f…` after its unrelated Amendment-1 arm-selector fix, with `DEFAULT_LANE` untouched). The
measurement above independently confirms both halves of that amendment.

## 2. Exact line grammar asserted

`lastLine` (L83) is `(r.stdout.trim().split('\n').pop() || '')` — the summary must be the **last
stdout line**, and `trim()` means a trailing space is tolerated but an embedded newline is not.

| arm | anchors | assertion, verbatim |
|---|---|---|
| usage-lists-compare | L85-89 | `help.status === 0 && /--compare/u.test(help.stdout)` |
| in-sync | L91-97 | `status === 0` and the last line **equals** `OMP_SHAPE_COMPARE: IN_SYNC entries=64 receipt=64 added=0 removed=0 changed=0` |
| added | L99-108 | writes `probe-extra` (file, 0644); `status === 1`; `/^OMP_SHAPE_COMPARE: DRIFT /`; `/entries=65 receipt=64 /`; `/added=1 removed=0 changed=0 /`; `/first=probe-extra$/` |
| removed | L110-119 | victim = first `kind:'file'` receipt entry = `RULES.md` (measured); re-materialises, unlinks; `status === 1`; `/entries=63 receipt=64 /`; `/added=0 removed=1 changed=0 /`; `line.includes('first=RULES.md')` |
| changed | L121-130 | victim `RULES.md`; `chmod 0644 ^ 0o004 = 0640`; `status === 1`; `/entries=64 receipt=64 /`; `/added=0 removed=0 changed=1 /`; `line.includes('first=RULES.md')` |
| invalid-receipt | L132-138 | receipt `{"contract":"kumitate-omp-shape-v1","entries":[`; `status === 2`; `/SHAPE_INVALID/` in stdout+stderr |
| absent-receipt | L140-144 | `status === 2`; `/SHAPE_NOT_FOUND/` |
| root-not-dir | L146-152 | `--root` a regular file; `status === 2`; `/ROOT_NOT_A_DIR/` |
| content-blind | L154-163 | re-materialises; writes `PROBE78_OMP_CONTENT_MARKER` into `RULES.md`, chmods back to the receipt mode; no marker in stdout+stderr; `status === 0`; `/IN_SYNC entries=64 receipt=64 /` in the last line |
| non-scoring | L165-175 | `--compare` occurrences in `scripts/proxy-check.mjs` === 0; `--snapshot` exit 0; `--shape` exit 0; `/OMP_CENSUS: CLEAN \(source=snapshot entries=64 findings=0 bound=35\/35\)/` |
| selftests | L177-183 | `--selftest` exit 0; `--shape <lane>/.ufo/pins/omp-shape.json` exit 0; `/OMP_CENSUS: CLEAN \(source=snapshot /` |

The two grammar shapes are therefore exactly:

```
OMP_SHAPE_COMPARE: IN_SYNC entries=<L> receipt=<R> added=0 removed=0 changed=0      (string equality, no first=)
OMP_SHAPE_COMPARE: DRIFT entries=<L> receipt=<R> added=<A> removed=<M> changed=<C> first=<name>   (first= must end the line)
```

Single spaces between terms; `first=` is the final token on DRIFT; `first=` must never appear on
IN_SYNC (the in-sync arm is an equality check).

## 3. What the counter fixes, and what it leaves free

Fixed (a wrong value fails a named arm): the summary order and spacing; `entries` = live count;
`receipt` = 64; the three drift counters; `first` for a single added, removed and changed name;
the three fail-closed tokens; content blindness; absence of any proxy coupling; `--selftest` and
live `--shape` unchanged.

Free (the design must choose and document; a wrong choice still scores 11/11):

- `first` = minimum vs maximum vs readdir order — every drift arm has exactly one differing name;
- multi-difference counting and `first` when `added+removed+changed > 1`;
- one-name-one-count when kind **and** mode differ;
- receipt key-set strictness (the only malformed receipt arm is broken JSON, not a content key);
- receipt sortedness/duplicate rejection;
- `lstat` vs `stat` (the pinned receipt contains no symlink entries);
- escaping of control characters in `first=` (all fixture names are ASCII);
- root symlink / root missing / unreadable root tokens (only a regular-file root is tested);
- live `kind=other` (FIFO/socket) handling;
- treatment of `--work` alongside `--compare`;
- empty live root;
- default `--root` (the probe always passes one).

## 4. Probe mechanics a design must not break

- `runNode` (L47-54) spawns with `cwd: lane`, `env.TMPDIR = work`, timeout 900 s. Relative paths
  inside the tool resolve against the lane; the tool's own temporaries land in `work`.
- `materialise` (L71-81) is the inverse of `--snapshot`: `mkdir`/`chmod` for dirs,
  `writeFileSync('')`/`chmod` for files, `ln -s probe-missing-target` for symlinks (symlink mode is
  ignored). It `rm -rf`s the root first, so arms are independent.
- `validShape` (L62-70) is the probe's own receipt check: contract string, non-empty entries,
  each entry's key set exactly `kind,mode,name`, kind in `file|dir|symlink`, mode an integer. It
  does **not** check sortedness/duplicates (the tool's `validateShape` does), which is only safe
  because the pinned receipt is sorted and unique.
- Arm order matters: in-sync → added → removed (re-materialises) → changed (re-materialises) →
  invalid → absent → root-not-dir → content-blind (re-materialises) → non-scoring → selftests.
  The invalid/absent/root-not-dir arms run against the *changed* root, so receipt failures must be
  reported before (or independently of) root reading.
- The non-scoring arm's `--shape` invocation supplies `--self <lane>` and
  `--note <lane>/corpus/knowledge/omp-agent-root.md`; the census binding must stay byte-stable
  (`entries=64 findings=0 bound=35/35`).
- `--work` is passed to the probe, never to the tool; the tool receives only `--compare`,
  `--root`, `--shape`, `--snapshot`, `--self`, `--note`, `--selftest` as listed above.

## 5. Verdict

All 11 arms are satisfiable by the design in `design.md`; this is proved by measurement, not
argument: an independent rerun of the frozen counter against a `git archive` of
`ad2630d0` with the integrated candidate overlaid reads
`C78_C2: HELD held=11/11`, exit 0 (`counter-candidate-independent.txt`).

Two satisfiability notes:

1. The **literal claim sentence in the committed plan** is not satisfiable: the probe's own
   `DEFAULT_LANE` (L25) resolves to `<lane>/.ufo`, so the receipt path doubles and the probe exits 2
   before any arm. Plan Amendment 2 (working tree) replaces both claim invocations with the
   explicit `--lane <lane>` form and routes the `DEFAULT_LANE` rewrite to round 79; with that
   invocation every arm is satisfiable, as measured. The counter itself must not be edited in a
   seat. The same defect exists in `probe78-c1.mjs:25`.
2. `first=<name>` itself is satisfiable, but under-specified: minimum and maximum both pass, and
   the name is emitted raw, so a legal newline-bearing name would break the one-line contract.
   Neither is a counter failure; both are design obligations (see `design.md` §5-§6).
