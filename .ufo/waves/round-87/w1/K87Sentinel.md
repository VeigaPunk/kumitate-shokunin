# K87Sentinel — fail-closed / boundary review of the C1 instrument (`receipt-bind`)

Seat: sentinel, round 87 (kumitate-shokunin), wave w1. Leaf seat: no dispatch, no history writes.
All paths absolute. Nothing committed, nothing staged, no mutating git/jj command run.

## 0. Subject, method, reproducibility

| field | value |
|---|---|
| **primary subject** | `/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-87/build/K87ExecBind/receipt-bind.mjs` — sha256 `b640ff3115228e2d7cc1ca748bc892db1887e33f356197ed86937b989eaf4c0a`, 544 lines |
| candidate timing | absent at 18:26 (first listing), present at 18:28; the L1 reference was reviewed first and kept as the comparison baseline |
| baseline subject | `/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-87/build/L1Reference/receipt-bind.mjs` — sha256 `ff91fe78c519766bf4309e5a408c6a14ea78c490997aed12f9efa456bd1b3af5`, 179 lines |
| frozen probe | `/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-87/probe/probe87-c1.mjs` — sha256 `6fbd07b54927681d729f15358577b164a994cefffcff2378839f892137280cee` (read only) |
| measured rev | `25a3a75df123a59c5cf0de944a6d2f067e278f82` (lane tip = freeze commit) |
| second rev | `ab8f60138810981bdb1a294fe684b19b332b8a34` — a commit where `scripts/proxy-check.mjs` differs from tip (`b8d52a84…` vs tip `fd51dc98…`), used to prove a per-receipt `rev=` is honoured |
| harness | `/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-87/build/K87Sentinel/probe-boundary.sh` (re-runnable: `TOOL=` `LANE=` `SCRATCH=`) |
| transcripts | `…/build/K87Sentinel/transcript-boundary-K87ExecBind.txt` (180 lines, 32 cases), `…/transcript-boundary-L1Reference.txt` (198 lines), `…/transcript-extra-K87ExecBind.txt` (relative-escape, provenance, selftest), `…/probe87-K87ExecBind.txt`, `…/probe87-L1Reference.txt` |
| machine summary | `…/build/K87Sentinel/findings.json` |

Run shape (both tools, same harness, only `TOOL=` differs):

```
TMPDIR=/fast/scratch/hyaku/kumitate-r87/K87Sentinel/work \
TOOL=/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-87/build/K87ExecBind/receipt-bind.mjs \
LANE=/home/vgpnk/Projects/shokunin/kumitate-shokunin \
SCRATCH=/fast/scratch/hyaku/kumitate-r87/K87Sentinel \
bash /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-87/build/K87Sentinel/probe-boundary.sh
# harness exit=0
```

`--lane` is always passed explicitly (the candidate defaults to the **cwd's git toplevel**, line
160/200 — the probe runs it with `cwd=lane`, so the integrated default is correct; the reference
defaulted to `dirname(dirname(import.meta.url))`, which is why it needed the explicit flag).

Frozen probe on the candidate: `C87_C1: UNMET held=5/12` — `usage`, `selftest`, `detect-r86`,
`dir-missing`, `random-fixture` PASS; the other seven report `no-r87-close` because
`.ufo/waves/round-87/close/` does not exist yet. **That is expected pre-integration, not a finding**;
it is not evidence about the arms that need the round-87 receipts.

## 1. Verdict table (candidate = primary subject)

| # | item | verdict | deciding line(s) | observed |
|---|---|---|---|---|
| 1a | `cmd=` token `../../etc/passwd` | **SAFE** | 277–280, 289 | resolves to `<lane>/../../etc/passwd` → `FAIL-CLOSED UNRESOLVED r.txt external instrument unreadable: /home/vgpnk/Projects/etc/passwd (ENOENT)`, exit 2 |
| 1b | `cmd=` token `scripts/../../etc/passwd` | **SAFE** | 277–280 | `FAIL-CLOSED UNRESOLVED … /home/vgpnk/Projects/shokunin/etc/passwd (ENOENT)`, exit 2 |
| 1c | `cmd=` absolute path **outside** the lane, correct digest | **SAFE** (disclosed) | 271–275, 284–286 | `CLEAN matched=1 mismatched=0 unchecked=0 external=1`, exit 0 |
| 1d | same, wrong digest | **SAFE** | 284–286, 296–299 | `DRIFT matched=0 mismatched=1 … external=1 first=r.txt`, exit 1 |
| **1e** | **`cmd=` RELATIVE token that resolves outside the lane to an existing file** | **FAIL-OPEN** | **280** | `cmd=node ../../../../../etc/hostname` → `CLEAN … external=1` exit 0; `cmd=bash ../scripts/sources-census.sh` → `CLEAN … external=1` exit 0 |
| 1f | `cmd=` absolute token that is a directory (`/etc`) | **SAFE** | 284–286 | `FAIL-CLOSED UNRESOLVED r.txt external instrument unreadable: /etc (EISDIR)`, exit 2 |
| 1g | lane-absolute with `..` prefix confusion | **SAFE** | 272–275 | `CLEAN … external=0` (`resolve` + `relative` normalise before the git read) |
| 1h | `cmd=` `/proc/self/environ` | **SAFE** (disclosed) | 284–286 | `DRIFT mismatched=1 external=1` — host file hashed, digest only, content never printed |
| **2a** | **receipt DIRECTORY is a symlink** to a dir holding a valid receipt | **FAIL-OPEN** | **216** | `CLEAN matched=1 mismatched=0 unchecked=0 external=0`, exit 0 |
| 2b | same symlinked dir + one mismatching receipt | **FAIL-OPEN** | 216 | `DRIFT matched=1 mismatched=1 … first=bad.txt`, exit 1 (content still checked) |
| 2c | `--dir` symlink → `/etc` | SAFE | 216, 303 | `DRIFT matched=0 mismatched=0 unchecked=0 … first=-`, exit 1 (never CLEAN) |
| 2d | `--dir` symlink → the committed round-86 close dir | **FAIL-OPEN** | 216 | `DRIFT matched=1 mismatched=9 … external=1 first=c1-probe.txt`, exit 1 — another round's receipts judged under this path |
| 3a | fully **CRLF** receipt, cmd+digest valid | **SAFE** | 236–237 | `CLEAN matched=1 …`, exit 0 |
| 3b | **mixed** endings: `rev=OLD` CRLF, digest+cmd LF | **SAFE** | 236–237, 240–246 | `DRIFT matched=0 mismatched=1` — identical to the all-LF control 3b2: the per-receipt `rev=` is honoured, not overridden by `--rev` |
| 3c | duplicate `cmd=`, correct **first**, wrong second | SAFE (first-wins) | 236 | `CLEAN matched=1`, exit 0 |
| 3d | duplicate `cmd=`, wrong **first**, correct second | SAFE (first-wins) | 236 | `DRIFT mismatched=1`, exit 1 |
| 3e | duplicate `tool_sha256=`, correct first, wrong second | SAFE (first-wins) | 236 | `CLEAN matched=1`, exit 0 |
| **4** | **200 MB receipt** | **UNBOUNDED** | **234** (and 285) | 64 MiB receipt → `CLEAN`, **max RSS 185 048 kB**, 0.05 s; no size guard, no entry-count guard |
| 5a | `--dir /` | SAFE | 216, 303–315 | `DRIFT matched=0 mismatched=0 unchecked=0 external=0 first=-`, exit 1 |
| 5b | `--dir <lane root>` | SAFE | 250–254 | `DRIFT … unchecked=1 first=r8-in-tree-pollution.txt`, exit 1 |
| 5c | `--dir <existing empty dir>` | SAFE | 303 | `DRIFT … first=-`, exit 1 |
| 5d | `--dir <missing dir>` | SAFE | 216 | `FAIL-CLOSED DIR_UNREADABLE … (ENOENT)`, exit 2 |
| 6a | `rev=` 40 hex, not a commit (`1111…`) | **SAFE** | 212–213 | `FAIL-CLOSED REV_UNRESOLVED --rev 1111… is not a commit in <lane>`, exit 2 |
| 6b | `rev=` = 40-hex **blob** sha, not a commit | **SAFE** | 212–213 (`^{commit}` peel) | `FAIL-CLOSED REV_UNRESOLVED`, exit 2 |
| 6c | unresolvable `--rev` **+ receipts without `cmd=`** | **SAFE** (precedence fixed) | 212–213 **before** 250 | `FAIL-CLOSED REV_UNRESOLVED`, exit 2 — the reference returned DRIFT here |
| 6d | receipt pins an unresolvable `rev=`, `--rev` good | SAFE | 243–245 | `FAIL-CLOSED REV_UNRESOLVED r.txt rev=1111… is not a commit in <lane>`, exit 2 |
| 7a | `cmd=node scripts/proxy-check.mjs; touch <sentinel>` | **SAFE** | 104, 264–266 | `FAIL-CLOSED UNRESOLVED r.txt instrument absent at <rev>: scripts/proxy-check.mjs;`, exit 2; **no sentinel file** |
| 7b | `cmd=node $(touch <sentinel>) …` | **SAFE** | 104, 266 | `FAIL-CLOSED UNRESOLVED … $(touch`, exit 2; no sentinel |
| 7c | `cmd=node \`touch <sentinel>\` …` | **SAFE** | 104, 266 | `FAIL-CLOSED UNRESOLVED … \`touch`, exit 2; no sentinel |
| 7d | `cmd=node scripts/proxy-check.mjs \| tee <sentinel>` | **SAFE** | 264–266 | `CLEAN matched=1`, exit 0 — the tail is discarded, never executed; no sentinel |
| 8a | dir whose only `*.txt` entry is a **subdirectory** | **SAFE** | 231 | `FAIL-CLOSED RECEIPT_UNREADABLE … sub.txt is not a regular file`, exit 2 |
| 8b | dir whose only `*.txt` entry is a **FIFO** | **SAFE** | 231 | `FAIL-CLOSED RECEIPT_UNREADABLE … f.txt is not a regular file`, exit 2 |
| 8c | receipt file mode `000` | SAFE | 234 | `FAIL-CLOSED RECEIPT_UNREADABLE … (EACCES)`, exit 2 |
| 8d | zero-byte receipt | SAFE | 250–254 | `DRIFT … unchecked=1 first=r.txt`, exit 1 |
| 8e | `cmd=` with no instrument token | SAFE | 265 | `FAIL-CLOSED UNRESOLVED r.txt cmd= names no instrument: "node"`, exit 2 |
| 9 | `--lane` is a symlink / not a git repo | SAFE | 205–207 | `FAIL-CLOSED LANE_UNREADABLE … is not a directory`, exit 2 |
| 10 | `--selftest` | SAFE | 323–534 | `RECEIPT_BIND_SELFTEST: PASS held=39/39`, exit 0 |

**Count: 3 FAIL-OPEN + 1 UNBOUNDED + 1 DOC-GAP + 1 NIT.** Every other requested shape holds.

## 2. Item (1) — `cmd=` traversal and paths outside the lane

### 1a/1b — traversal that lands on nothing: SAFE

```
### (1a) relative traversal token ../../etc/passwd
RECEIPT_BIND: FAIL-CLOSED UNRESOLVED r.txt external instrument unreadable: /home/vgpnk/Projects/etc/passwd (ENOENT)
exit=2
### (1b) mid-path traversal token scripts/../../etc/passwd
RECEIPT_BIND: FAIL-CLOSED UNRESOLVED r.txt external instrument unreadable: /home/vgpnk/Projects/shokunin/etc/passwd (ENOENT)
exit=2
```

Line 277 `abs = resolve(lane, instrument)` then line 278 `laneRel(lane, abs)` — `..` is normalised
**before** the containment decision, so the text of the token can never smuggle a path past the
lane check. There is no disk read for a token that stays inside the lane (line 288 `blobAt` →
`git cat-file blob <rev>:<rel>`).

### 1e — **FAIL-OPEN (R87-S8)**: a *relative* token that escapes the lane is read from disk

```
### (1j) RELATIVE token escaping the lane to /etc/hostname, digest of that file
RECEIPT_BIND: CLEAN matched=1 mismatched=0 unchecked=0 external=1
exit=0
### (1k') RELATIVE escape ../scripts/sources-census.sh (the FLEET root instrument round-86 named)
RECEIPT_BIND: CLEAN matched=1 mismatched=0 unchecked=0 external=1
exit=0
### (1l) RELATIVE escape with a digest that does NOT match
RECEIPT_BIND: DRIFT matched=0 mismatched=1 unchecked=0 external=1 first=r.txt
exit=1
```

Deciding line **280**: in the non-absolute branch, `if (lr.inside) rel = lr.rel; else fromDisk = true;`
— a token that is *not* absolute and *does not* resolve inside the lane falls into the same
disk-read path as a genuinely absolute instrument (line 284–286). The contract this round froze
licenses that path only for **absolute** instruments: "a lane-relative or lane-absolute instrument
is hashed from `git show <rev>:<path>`, **an absolute instrument outside the lane** from the file
on disk (counted `external=`)". A relative token that leaves the lane is neither lane-relative nor
absolute — it is a malformed receipt, and the L1 reference failed it closed (its `git show
rev:../../etc/passwd` errors → `UNRESOLVED`).

**Why it matters beyond symmetry.** 1k' is the exact instrument the round-86 census receipt names
(`cmd=bash /home/vgpnk/Projects/shokunin/scripts/sources-census.sh validate`, i.e. the *fleet root*,
outside the lane). Under this candidate that same instrument can be written as
`cmd=bash ../scripts/sources-census.sh` and still reads `CLEAN external=1`. So the escape hatch
lets a receipt name any host file — including the fleet-root script that motivated R86-D1 — with
only an `external=` count as disclosure, and the round's after-state sentence (`CLEAN` with
`mismatched=0 unchecked=0`) does not mention `external`. The path is *disclosed*, never silent, so
this is not the "silently accepted" case; it is a contract-shape fail-open.

**Smallest remediation** (line 276–281):

```js
    } else {
      abs = resolve(lane, instrument);
      const lr = laneRel(lane, abs);
      if (lr.root) throw new FailClosed('UNRESOLVED', `${file} instrument resolves to the lane root: ${instrument}`);
      if (!lr.inside) throw new FailClosed('UNRESOLVED', `${file} instrument escapes the lane: ${instrument}`);
      rel = lr.rel;
    }
```

i.e. delete `else fromDisk = true` from the **relative** branch only. `fromDisk` then remains
reachable exactly where the contract licenses it. Second, independent of code: make the round's
own after-state assert `external=0`, so no close receipt can bind a copy outside the lane
regardless.

### 1c/1d/1h — absolute instrument outside the lane: SAFE and disclosed

```
### (1c) absolute path OUTSIDE lane, hash of that file
RECEIPT_BIND: CLEAN matched=1 mismatched=0 unchecked=0 external=1     exit=0
### (1d) absolute path OUTSIDE lane, wrong hash
RECEIPT_BIND: DRIFT matched=0 mismatched=1 unchecked=0 external=1 first=r.txt   exit=1
### (1g) absolute token /proc/self/environ
RECEIPT_BIND: DRIFT matched=0 mismatched=1 unchecked=0 external=1 first=r.txt   exit=1
```

Line 271–275 classifies, line 284–286 reads and increments `external`, and the counter is printed
in **both** the CLEAN (line 313) and DRIFT (line 315) verdict lines. The digest is compared, never
printed, so no host content leaks beyond one equality bit per receipt. Contract-conformant: SAFE.

### 1f — absolute token that is a directory: SAFE (crash class removed)

```
### (1e) absolute token that is a DIRECTORY (/etc)
RECEIPT_BIND: FAIL-CLOSED UNRESOLVED r.txt external instrument unreadable: /etc (EISDIR)
exit=2
```

Line 285 wraps the disk read, so the EISDIR that crashed the L1 reference (`exit=1` with a Node
stack trace and **no** `RECEIPT_BIND` line) is now `UNRESOLVED` exit 2. The top-level `INTERNAL`
catch (lines 531–541, emit at 539) covers anything else, so a crash can no longer masquerade as DRIFT. Residual
not exercised: `/dev/zero` passes `isAbsolute` + containment, then `readFileSync` on a size-0 device
loops until memory is exhausted — same unbounded-reader class as item 4, `[INFERENCE]` from the code
path (not executed; see §4 for the measured unboundedness on a finite file).

## 3. Item (2) — the receipt directory is a symlink: **FAIL-OPEN** (R87-S2)

```
### (2a) --dir is a symlink to a directory (valid receipt inside)
RECEIPT_BIND: CLEAN matched=1 mismatched=0 unchecked=0 external=0     exit=0
### (2b) same symlinked dir after a mismatching receipt is added
RECEIPT_BIND: DRIFT matched=1 mismatched=1 unchecked=0 external=0 first=bad.txt   exit=1
### (2d) --dir symlinked to the committed round-86 close dir
RECEIPT_BIND: DRIFT matched=1 mismatched=9 unchecked=0 external=1 first=c1-probe.txt   exit=1
```

Line **216** `entries = readdirSync(dir)` follows the symlink; there is **no `lstatSync(dir)`**
anywhere in `bind()` (the only `lstat` calls are line 205 for `--lane` and line 229 for each entry).
So a symlinked receipt **directory** is resolved silently and its target is judged. `--json` at
least echoes the operand as given (`"dir":"…/extra/2link2"`, transcript `(2e)`), which is the only
provenance signal, and it is the *symlink path*, not the resolved target.

**Exploit path:** point the close directory (or the `--dir` an operator types) at another round's
clean close directory: 2a reads `CLEAN matched=1` through a link; 2d shows the round-86 directory
judged verbatim under a round-87 path. Content binding still applies — this cannot make a misnamed
instrument match — but it relocates the **evidence**: the round's after-state sentence, "the round's
own close receipts read `RECEIPT_BIND: CLEAN`", is then satisfied by receipts that are not this
round's. That is R86-D1's subject-substitution one level up.

Note the frozen arm 11 only covers a symlinked **receipt file** (`SYMLINK_RECEIPT`), and the
contract's fail-closed list has no directory-level token, so the probe cannot see this.

**Smallest remediation** (before line 216, reusing the existing token so no new token enters the
contract):

```js
  let dst;
  try { dst = lstatSync(dir); } catch (e) { throw new FailClosed('DIR_UNREADABLE', `${dir} (${e.code || 'lstat failed'})`); }
  if (dst.isSymbolicLink()) throw new FailClosed('SYMLINK_RECEIPT', dir);
  if (!dst.isDirectory()) throw new FailClosed('DIR_UNREADABLE', `${dir} is not a directory`);
```

Optionally also require `realpathSync(dir)` under `realpathSync(lane)` so a round can only judge
receipts that live under its own lane.

## 4. Item (3) — CRLF and duplicate `cmd=`: both SAFE, one contract-text gap

### CRLF: SAFE

```
### (3a) fully CRLF receipt, cmd+hash otherwise valid
RECEIPT_BIND: CLEAN matched=1 mismatched=0 unchecked=0 external=0     exit=0
### (3b) MIXED endings: 'rev=OLD' has CRLF, digest+cmd LF
RECEIPT_BIND: DRIFT matched=0 mismatched=1 unchecked=0 external=0 first=r.txt   exit=1
### (3b2) same receipt with LF everywhere (control for 3b)
RECEIPT_BIND: DRIFT matched=0 mismatched=1 unchecked=0 external=0 first=r.txt   exit=1
```

Lines 235–237: `text.match(new RegExp('^'+key+'=(.*)$','m'))` then `.trim()`. Two JS facts make
CRLF safe here: with the `m` flag `$` matches before **any** LineTerminator (including `\r`), and
`(.*)` cannot cross a LineTerminator, so `rev=`, `cmd=` and `tool_sha256=` all parse on CRLF input
and the trailing `\r` is removed by `trim()`. 3b is the case that would have hurt — a receipt that
pins `rev=OLD` and gets silently re-judged at `--rev` — and it is provably not happening: the mixed
file and the all-LF control return the same verdict, i.e. the per-receipt `rev=` wins at line 244.

### Duplicate `cmd=` / `tool_sha256=`: deterministic first-wins, undocumented (R87-S6)

```
### (3c) duplicate cmd= : correct FIRST, wrong SECOND
RECEIPT_BIND: CLEAN matched=1 mismatched=0 unchecked=0 external=0     exit=0
### (3d) duplicate cmd= : wrong FIRST, correct SECOND
RECEIPT_BIND: DRIFT matched=0 mismatched=1 unchecked=0 external=0 first=r.txt   exit=1
### (3e) duplicate tool_sha256= : correct FIRST, wrong SECOND
RECEIPT_BIND: CLEAN matched=1 mismatched=0 unchecked=0 external=0     exit=0
```

`String.match` returns the first occurrence (line 236), so the first line of a duplicated field is
authoritative — deterministic, and 3d proves it cannot read CLEAN by accident. But the tool header
documents only "instrument := the SECOND whitespace token of `cmd=`" (line 15) and says nothing
about a duplicated field. Related, same block: line 264–266 takes token[1] and discards the rest,
so 7d (`cmd=node scripts/proxy-check.mjs | tee <sentinel>`) reads CLEAN while the receipt *displays*
a pipeline that never ran.

**R87-S6 (DOC-GAP, low).** Remediation is one sentence in the contract and the header ("when a field
occurs more than once the first occurrence is authoritative and later ones are ignored"), or the
stronger form that removes the display/bind divergence entirely:

```js
    if ((text.match(/^cmd=/gm) || []).length > 1) throw new FailClosed('RECEIPT_UNREADABLE', `${file} duplicate cmd=`);
```

## 5. Item (4) — a 200 MB receipt: **UNBOUNDED** (R87-S5)

No 200 MB file was created. The code path was measured on a 64 MiB receipt:

```
### (4) read bound — no size cap in the reader; measure with a 64 MiB receipt
-rw-r--r-- 1 vgpnk vgpnk 67109028 …/boundary/4big/big.txt
RECEIPT_BIND: CLEAN matched=1 mismatched=0 unchecked=0 external=0
	Elapsed (wall clock) time (h:mm:ss or m:ss): 0:00.05
	Maximum resident set size (kbytes): 185048
	Exit status: 0
```

Line **234** `text = readFileSync(path, 'utf8')` — `st` from line 229 already carries `st.size` and
it is never consulted; line **285** (external instrument) is the same reader with the same absence
of a bound; line **216** (`readdirSync(dir)`) has no entry-count bound either. Cost is linear and
paid twice (Buffer + UTF-8 string): 64 MiB → **185 MB peak RSS** in 0.05 s. **200 MB ⇒ ≈570 MB RSS**
`[INFERENCE]` by that ratio; a multi-GB receipt would be killed by the OOM reaper instead of
failing closed, and `/dev/zero` as an instrument would never return at all.

The only bounded read in the process is the git fetch: line 104–110 `maxBuffer: 64 << 20` +
`timeout: 120000`. A >64 MiB script at `<rev>:<rel>` makes `git` fail, `blobAt` returns null, and
line 289 fails closed — that half is fine.

**Smallest remediation:**

```js
    const MAX_RECEIPT_BYTES = 1 << 20;                  // declared in the contract
    if (st.size > MAX_RECEIPT_BYTES) throw new FailClosed('RECEIPT_UNREADABLE', `${path} size=${st.size}`);
```

and in the external branch, before line 285: `statSync(abs)` → require `isFile()` and
`size <= MAX_RECEIPT_BYTES` (this also closes the `/dev/zero` hang and the EISDIR class properly,
instead of catching it after the fact). Cap the entry count at line 216 for the third leg.

## 6. Item (5) — `--dir /` and `--dir <lane root>`

```
### (5a) --dir /
RECEIPT_BIND: DRIFT matched=0 mismatched=0 unchecked=0 external=0 first=-        exit=1
### (5b) --dir <lane root>
RECEIPT_BIND: DRIFT matched=0 mismatched=0 unchecked=1 external=0 first=r8-in-tree-pollution.txt   exit=1
### (5c) --dir <existing empty dir>
RECEIPT_BIND: DRIFT matched=0 mismatched=0 unchecked=0 external=0 first=-        exit=1
### (5d) --dir <missing dir>
RECEIPT_BIND: FAIL-CLOSED DIR_UNREADABLE … (ENOENT)                             exit=2
```

Line 303 `const total = matched + mismatched + unchecked;` and line 304
`const clean = total > 0 && mismatched === 0 && unchecked === 0;` — **the reference's
`CLEAN matched=0` hole is closed**: an empty or receipt-less directory can no longer read CLEAN
(5a/5c are DRIFT, not CLEAN, which is what matters for fail-closed). The lane root is DRIFT because
`r8-in-tree-pollution.txt` is read as a receipt and counted `unchecked` (line 250–254), so pointing
the gate at a non-close directory is loud. The candidate documents empty-directory-is-DRIFT in its
header (line 30–31), which diverges from the reference's `DIR_UNREADABLE`; the frozen arm 9 only
tests a **missing** directory (`DIR_UNREADABLE`, still exit 2), so no arm is affected — but the L1
should note the divergence when the contract text is finalised.

There is still no containment notion for `--dir` (any directory is accepted, line 216), which is
why 2a/2d are possible; the remediation in §3 covers it.

## 7. Item (6) — `rev=` 40 hex but not a commit: SAFE (and the reference's precedence bug is fixed)

```
### (6a) --rev 1111..(40) with a cmd-carrying receipt
RECEIPT_BIND: FAIL-CLOSED REV_UNRESOLVED --rev 1111… is not a commit in /home/vgpnk/Projects/shokunin/kumitate-shokunin   exit=2
### (6b) --rev <40-hex blob sha, not a commit>
RECEIPT_BIND: FAIL-CLOSED REV_UNRESOLVED --rev 674b2ac7… is not a commit in …                                           exit=2
### (6c) unresolvable --rev + receipt WITHOUT cmd= (contract precedence: fail-closed)
RECEIPT_BIND: FAIL-CLOSED REV_UNRESOLVED --rev 1111… is not a commit in …                                               exit=2
### (6d) receipt pins an unresolvable rev=, --rev is good
RECEIPT_BIND: FAIL-CLOSED REV_UNRESOLVED r.txt rev=1111… is not a commit in …                                            exit=2
```

Line 212–213 resolves the **default** revision before any receipt is read, and line 243–245 resolves
a per-receipt `rev=`; both use `rev-parse --verify --quiet <rev>^{commit}` (line 175), so a 40-hex
**blob** sha is rejected as well as a nonexistent one. 6c is the important one: a directory of
`cmd=`-less receipts plus a mistyped `--rev` now fails closed instead of reporting `DRIFT
unchecked=1` — the contract's precedence ("usage > fail-closed > drift > clean") is now structural,
which the reference got wrong.

## 8. Item (7) — shell injection through `cmd=`: **SAFE**

The complete spawn surface of the candidate:

```
 49:import { spawnSync } from 'node:child_process';
104:  return spawnSync('git', ['-C', dir, ...args], { … env: gitEnv(o.env) });
160:  const r = spawnSync('git', ['rev-parse', '--show-toplevel'], { … });
391:    const r = spawnSync(process.execPath, [SELF, ...args], { … });     // selftest only
```

All four are argv arrays; there is **no `shell: true`** and no string-built command anywhere
(`grep -n 'shell:\|exec('` → no hits). The `cmd=` text only ever becomes a git **pathspec**
(`${receiptRev}:${rel}`, line 288) after being reduced to token[1] (line 266), and `receiptRev` is
regex-constrained to `[a-f0-9]{40}` (line 243). `gitEnv()` (lines 95–100) additionally strips
`GIT_DIR`, `GIT_WORK_TREE`, `GIT_INDEX_FILE`, `GIT_OBJECT_DIRECTORY`, `GIT_ALTERNATE_OBJECT_DIRECTORIES`
and friends, so an inherited environment cannot redirect the read either.

```
### (7a) 'cmd=' with ; touch <sentinel> after the instrument
RECEIPT_BIND: FAIL-CLOSED UNRESOLVED r.txt instrument absent at 25a3a75d…: scripts/proxy-check.mjs;
exit=2
### (7b) 'cmd=' with $(...) command substitution as the instrument token
RECEIPT_BIND: FAIL-CLOSED UNRESOLVED r.txt instrument absent at 25a3a75d…: $(touch
exit=2
### (7c) 'cmd=' with backtick substitution
RECEIPT_BIND: FAIL-CLOSED UNRESOLVED r.txt instrument absent at 25a3a75d…: `touch
exit=2
### (7d) 'cmd=' with a pipe into tee
RECEIPT_BIND: CLEAN matched=1 mismatched=0 unchecked=0 external=0
exit=0
sentinel check:
ls: cannot access '/fast/scratch/hyaku/kumitate-r87/K87Sentinel/work/sentinel.*': No such file or directory
no sentinel files created -> no shell executed
```

All four payloads are echoed verbatim inside the `UNRESOLVED` detail — consumed as data, not
executed — and none of the four sentinel paths exists. 7d is not an execution either: the pipe tail
is dropped at line 264 (see R87-S6 for the display divergence).

## 9. Items not asked for but load-bearing (all SAFE on the candidate)

```
### (8a) dir whose only *.txt entry is a SUBDIRECTORY
RECEIPT_BIND: FAIL-CLOSED RECEIPT_UNREADABLE …/sub.txt is not a regular file        exit=2
### (8b) dir whose only *.txt entry is a FIFO
RECEIPT_BIND: FAIL-CLOSED RECEIPT_UNREADABLE …/f.txt is not a regular file          exit=2
### (8c) receipt file mode 000
RECEIPT_BIND: FAIL-CLOSED RECEIPT_UNREADABLE …/r.txt (EACCES)                      exit=2
### (8d) zero-byte receipt
RECEIPT_BIND: DRIFT matched=0 mismatched=0 unchecked=1 external=0 first=r.txt       exit=1
### (8e) cmd= with no instrument token
RECEIPT_BIND: FAIL-CLOSED UNRESOLVED r.txt cmd= names no instrument: "node"        exit=2
### (9) --lane given as a symlink to the lane
RECEIPT_BIND: FAIL-CLOSED LANE_UNREADABLE …/lanelink is not a directory            exit=2
### (10) --selftest
RECEIPT_BIND_SELFTEST: PASS held=39/39                                             exit=0
```

* Line 230–231 turns every non-regular `*.txt` entry into `RECEIPT_UNREADABLE` (fail-closed), and
  line 303–304 requires `total > 0` — together these close the reference's `CLEAN matched=0`
  fail-open (§11).
* Line 205–206 `lstatSync(lane)` + `isDirectory()` rejects a **symlinked** lane path
  (`LANE_UNREADABLE`, exit 2). Fail-closed, so acceptable, but it is an undocumented sharp edge: any
  seat that passes the lane through a symlink gets a fail-closed gate rather than a verdict. The
  probe and the harness pass the real path, so neither is affected.
* Line 256 lower-cases `tool_sha256=` before validating, so an **uppercase** digest is silently
  accepted and normalised (R87-S9, cosmetic). Uppercase `rev=` is rejected at line 243
  (`FULL_REV` is lowercase-only) — the two fields are inconsistent.
* `--json` carries a per-receipt `rows[]` with `instrument`, `rev`, `source: git|disk` and the
  `computed` digest (line 295/298). This is a real strengthening for the after-state: the round can
  publish the bound subject, not just a tally. It also shows the 2a symlink case as
  `source: git` with `dir` = the symlink path, i.e. provenance is *printed* but never *checked*.

## 10. Routed defects (for the L1 — nothing here is a silent note)

| id | class | severity | lines | title | smallest remediation |
|---|---|---|---|---|---|
| **R87-S8** | FAIL-OPEN | low–medium | **280** | a **relative** `cmd=` token that resolves outside the lane is read from disk and counted `external=`, though the contract licenses disk reads only for **absolute** instruments (1j/1k' read `CLEAN external=1`) | delete `else fromDisk = true` from the relative branch → `FailClosed('UNRESOLVED')`; separately require `external=0` on the round's own close receipts |
| **R87-S2** | FAIL-OPEN | medium | **216** | receipt **directory** symlink followed; no `lstat` on `--dir`, no lane/round provenance (2a `CLEAN`, 2d another round's receipts) | `lstatSync(dir).isSymbolicLink() → SYMLINK_RECEIPT`; require `realpath(dir)` under `realpath(lane)` |
| **R87-S5** | UNBOUNDED | medium | **234**, 285, 216 | receipt read and external-instrument read have no size cap; directory read has no entry cap; 64 MiB → 185 MB RSS, 200 MB ⇒ ≈570 MB `[INFERENCE]`; `/dev/zero` would never return `[INFERENCE]` | `st.size > 1 MiB → RECEIPT_UNREADABLE`; `statSync(abs).isFile()` + size guard before line 285; cap entries at 216 |
| **R87-S6** | DOC-GAP | low | 236, 264–266 | duplicate `cmd=`/`tool_sha256=` is first-wins and undocumented; `cmd=` tail after the instrument is ignored, so a receipt can display a pipeline that never ran and still read CLEAN | one sentence in contract+header, or fail closed on a duplicate field |
| **R87-S9** | NIT | cosmetic | 256 | `tool_sha256=` is lower-cased before validation (uppercase digest silently accepted) while uppercase `rev=` is rejected | make the two fields consistent; document the leniency if kept |

None of these weakens a frozen arm: arms 5–8/11/12 are content-keyed, arm 4 is `matched>=8`, arm 3
is the committed round-86 directory. R87-S2/S5/S8 only make the tool *stricter*, which cannot help
any control under `.ufo/waves/round-87/controls/` reach 12/12 (all four answer from constants, a
table or the directory path).

## 11. Reference baseline — what the candidate fixed (kept for the L1's repair record)

The L1 reference (`…/build/L1Reference/receipt-bind.mjs`, `ff91fe78…`) failed four of my probes that
the candidate passes; recording them keeps the repair auditable rather than invisible:

| reference finding | reference evidence | candidate |
|---|---|---|
| `CLEAN matched=0` when the only `*.txt` entry is a subdirectory/FIFO (lines 67/97/98) | `RECEIPT_BIND: CLEAN matched=0 mismatched=0 unchecked=0`, exit 0 | fixed: line 231 fail-closed + line 304 `total > 0` |
| uncaught `EISDIR` on the external read (line 85) → exit 1 with **no** verdict line | Node stack trace, `exit=1` | fixed: line 285 try/catch → `UNRESOLVED` exit 2; `INTERNAL` catch at 531–541 |
| `unchecked` short-circuit before rev resolution (line 74 before 75) → DRIFT where the contract says fail-closed | `DRIFT … unchecked=1`, exit 1 | fixed: line 212–213 resolves `--rev` before any receipt |
| `DRIFT … first=null` when only `unchecked > 0` (lines 61/99) | `first=null` in 3 cases | fixed: line 315 prints `first=-` |

The reference's own remaining defect class is therefore exactly R87-S2 + R87-S5, both of which the
candidate still carries.

## 12. What I did not do / limits of this review

* I did not run the twelve arms as a verdict: seven of them need `.ufo/waves/round-87/close/`, which
  does not exist (checked at 18:26, 18:31 and 18:36). The probe on both tools reads `held=5/12`
  with the seven `no-r87-close` details — pre-integration, not a finding.
* The candidate is a **build-directory** file, not the integrated `scripts/receipt-bind.mjs`
  (absent). If the L1 integrates a different revision of it, re-run the harness:
  `TOOL=/home/vgpnk/Projects/shokunin/kumitate-shokunin/scripts/receipt-bind.mjs LANE=… SCRATCH=… bash …/probe-boundary.sh`
  — the line numbers above move, the probe cases do not.
* I did not create a 200 MB receipt (64 MiB measured; 200 MB stated as inference) and did not
  execute the `/dev/zero` hang.
* No mutating git/jj command was run anywhere: only `log`, `show`, `rev-parse`, `cat-file -e`,
  `status` reads. Fixtures were plain directories under scratch; no `git init`, no commit, no clone.
* Nothing was installed or upgraded, so there is no tool/version/channel entry to record.
* Scratch `/fast/scratch/hyaku/kumitate-r87/K87Sentinel/` was created explicitly, passed explicitly
  via `TMPDIR`, and `rm -rf`'d before this report was finalised; every receipt cited above lives
  under `/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-87/build/K87Sentinel/`.

## 13. Artefacts

| path (all under `/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-87/`) | content |
|---|---|
| `build/K87Sentinel/probe-boundary.sh` | harness; 32 cases; re-runnable against any candidate via `TOOL=` |
| `build/K87Sentinel/transcript-boundary-K87ExecBind.txt` | 180-line transcript of the 32 cases against the candidate |
| `build/K87Sentinel/transcript-boundary-L1Reference.txt` | same cases against the L1 reference (198 lines) |
| `build/K87Sentinel/transcript-extra-K87ExecBind.txt` | relative-escape (1j/1k'/1k''/1l), empty dir, symlink provenance + `--json`, round-86 dir, symlinked lane, selftest 39/39 |
| `build/K87Sentinel/probe87-K87ExecBind.txt` | frozen probe on the candidate (`held=5/12`, seven `no-r87-close`) |
| `build/K87Sentinel/probe87-L1Reference.txt` | frozen probe on the reference (`held=5/12`) |
| `build/K87Sentinel/findings.json` | machine-readable verdict per item, routed defects, fixed-vs-reference list |
