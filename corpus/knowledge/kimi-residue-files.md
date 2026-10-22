# K5 — root-residue plane: `~/.kimi-code/workspaces.json`, `~/.kimi-code/tui.toml.bak`, `~/.kimi-code/rc-qrcode.png`

## Scope — three members, the residue the census made enumerable

This note covers the **root-residue family K5** of the Kimi Code CLI data root
(`~/.kimi-code/`): three files that sit directly in the root and that the round-19
frozen set K1–K4 declared nothing about, which is why the root was not enumerable
there. They were pre-registered a round ahead — `corpus/lessons/round-19.md:34-37`
("K5 makes the root enumerable, K_members 46 → 49") — and the registry change landed in
round 20 as the member rules in `scripts/kimi-census.mjs:38-41` and the three member rows
at `scripts/kimi-census.mjs:140-142`, frozen at `scripts/kimi-census.mjs:155`
(`K5: 3`). Live confirmation of that freeze, run for this note:
`node scripts/kimi-census.mjs` → `FAMILY K5 members=3 checked=3 frozen=3` and the verdict
line `KIMI_CENSUS: CLEAN (members=49 checked=49 chain=12 info=4)`, exit 0, with
`INFO ROOT_ENUM - root children=37 declared=25 chain=12 strays=0` — i.e. the 37 live root
children are now 25 declared + 12 drift-chain generations + 0 strays.

Members (3, one `## ` section each, internals level, all anchors live):

1. `~/.kimi-code/workspaces.json` — the workdir catalog; the **input** to the
   `wd_<slug>_<sha12>` session-key derivation the K3 plane names its directories by.
2. `~/.kimi-code/tui.toml.bak` — the plain (non-timestamped) backup of the client-preference
   config, pairwise against `~/.kimi-code/tui.toml`.
3. `~/.kimi-code/rc-qrcode.png` — a PNG, censused by **shape only**.

**Boundary (READ-ONLY substrate):** nothing under `~/.kimi-code` was written, moved or
chowned by this lane; every read is a `stat` / `ls` / `read` of a non-secret artifact.
`~/.kimi-code/credentials/`, `~/.kimi-code/oauth/` and `~/.kimi-code/server.token` stay
**shape-only** (mode/size/mtime via `stat -c`), and no byte of them is in this note.
`~/.kimi-code/workspaces.json` is mode 600 but is *not* on the secret list and is the
assignment object, so it was read in full; it carries filesystem paths and timestamps, no
credential material.

**Internals level here means:** each member gets its own named section with its own path
anchors, the on-disk schema read from the records themselves, and — where the producer is
in scope — the shipped-binary source quoted with **byte offsets** (`~/.kimi-code/bin/kimi`
is a 190 MB ELF with debug_info; it has no meaningful line numbers, so an offset is the
honest anchor, read with `grep -a -b -o` / `dd`).

**Discipline:** every claim below is labelled **OBSERVATION** (measured on this host,
anchor given), **INFERENCE** (this lane's reading of measured structure), or **UNKNOWN**.
Snapshot window for all three files: 2026-10-13, 18:40–19:10 local (-0300). Two of the three
are mutating or mutable artifacts, so the live-row claims are snapshots; the durable part
is the schema and the pairwise relation.

**Label collision, recorded not fitted.** The registry is unambiguous — K3 is the
session/state plane and K4 the binary/secret plane (`SCORECARD.md:139-140`,
`scripts/kimi-census.mjs:32-41`), and K5 is this residue family (`SCORECARD.md:141`). Two of
the round-18 notes still carry stale self-labels in their own title lines:
`corpus/knowledge/kimi-session-state.md:1` opens "# K4 — Kimi Code session & runtime state
plane" and `corpus/knowledge/kimi-binary-secrets.md:1` opens "# K5 — binary & version plane".
This note follows the registry, so "K3" below means the session note and "K4" the binary
note; neither title is edited by this lane (out of assignment), and the parent should treat
the two stale ordinals as a routing item.

## Measurement transcript

```
$ stat -c '%n size=%s mode=%a mtime=%y' workspaces.json tui.toml.bak rc-qrcode.png
workspaces.json size=1559 mode=600 mtime=2026-10-13 17:05:07.422722642 -0300
tui.toml.bak    size=1301 mode=644 mtime=2026-10-03 17:53:30.971929921 -0300
rc-qrcode.png   size=2323 mode=644 mtime=2026-10-13 16:03:10.190917267 -0300
$ wc -lc workspaces.json tui.toml.bak tui.toml
  0 1559   workspaces.json        # one line, no trailing newline
 31 1301   tui.toml.bak
 31 1300   tui.toml
$ node -e '…'                    # per-entry key sets, one distinct set across 9/9
["created_at,last_opened_at,name,root"]        # top keys: version, workspaces, deleted_workspace_ids
$ printf '%s' /home/vgpnk | sha256sum | cut -c1-12
403b91ce3657
$ printf '%s' /home/vgpnk/Projects | sha256sum | cut -c1-12
48a771e908b1
$ diff tui.toml.bak tui.toml                     # exactly one hunk
10c10
< disable_feedback_survey = false # …
---
> disable_feedback_survey = true  # …
$ sed '10s/false/true/' tui.toml.bak | cmp - tui.toml   # no output, exit 0 → byte-identical
$ file -b rc-qrcode.png
PNG image data, 196 x 196, 8-bit/color RGBA, non-interlaced
$ ls ~/.kimi-code/tui.toml.*.bak                 # the tui chain does not exist
ls: cannot access '…tui.toml.*.bak': No such file or directory
$ timeout 200 grep -a -b -o -m1 'function encodeWorkDirKey'  ~/.kimi-code/bin/kimi
125573410:function encodeWorkDirKey
# normalised-sha: line 10 masked out of each file, then hashed as a whole buffer
$ node -e '…mask line index 9, join, createHash sha256, compare…'
tui.toml.bak and tui.toml masked-identical → true
```

## `~/.kimi-code/workspaces.json` — the workdir catalog (the key derivation's input)

### Shape, mode, schema

**OBSERVATION (shape).** 1559 B, mode `600`, `links=1`, uid 1000, one line with **0**
newlines and no trailing newline, ASCII-only (verified against `/^[\x20-\x7e]*$/`),
sha256 `14330c805066c65b0e060ffdc2f86028b2433ed9e4d5997c4289b564c155698c`, mtime
`2026-10-13 17:05:07.422722642 -0300`. Anchors: `~/.kimi-code/workspaces.json:1` is the
whole file.

**OBSERVATION (top level).** Exactly three keys, in this byte order: `"version"` at offset
1 (value `1`), `"workspaces"` at offset 13 (9 entries), `"deleted_workspace_ids"` at offset
1532 (value `[]`). Per-entry key sets across **9 / 9** entries collapse to one distinct
set: `created_at`, `last_opened_at`, `name`, `root` — no entry carries an extra or missing
key, so the record shape is uniform, not permissive-by-observation.

**OBSERVATION (entry layout, byte offsets into `~/.kimi-code/workspaces.json:1`).** The
key strings begin at 27, 173, 339, 512, 673, 843, 1018, 1191, 1361; entry spans are 146,
166, 173, 161, 170, 175, 173, 170 B and the last entry runs 198 B to EOF (it carries the
`deleted_workspace_ids` trailer). Timestamp fields are ISO-8601 UTC with millisecond
precision and a literal `Z` on **9 / 9** `created_at` and **9 / 9** `last_opened_at`.

**OBSERVATION (order + rewrite behaviour).** `file order == created_at order` — the nine
keys are strictly ascending by `created_at`, so the catalog preserves insertion order
rather than sorting by key or by recency. Every entry has `last_opened_at > created_at`
(9 / 9; gaps from 30 ms to 857 362 s). The file's own mtime is
`2026-10-13T20:05:07.422Z` and the maximum `last_opened_at` is
`2026-10-13T20:05:07.423Z` — 0.28 ms apart, the JSON being millisecond-rounded.

**INFERENCE.** A rewrite whose mtime coincides with the newest `last_opened_at` to sub-ms
means the catalog is re-serialised *when a workspace is opened*, not on a timer; that fits
the producer, which sets `WATCH_DEBOUNCE_MS = 150` and `WORKSPACE_CATALOG_KEY =
"workspaces.json"` (`~/.kimi-code/bin/kimi` bytes 134080357 and 134080313, inside
`init_fileWorkspacePersistence`). The `deleted_workspace_ids` array existing but empty is
the same story: a deletion path exists in the schema and has never fired on this host.

**OBSERVATION (cross-artifact census, read-only).** Of the 9 catalog roots, 7 exist as
directories (`fs.existsSync` + `isDirectory()`), and 2 do not: `/tmp/kimi-m4-test` and
`/tmp/tog-tower-integration/Projects/tog`. Of the 9 keys, 7 have a matching dir under
`~/.kimi-code/sessions/` — absent for `wd_kimi-m4-test_9f2b5d6d6efa` and
`wd_dbzmon_25f4897e97c0` — and **no** `sessions/wd_*` directory lacks a catalog key (7 / 7
resolve into the catalog). So on this host the catalog is a strict superset of the session
store, and it does not prune a root that has vanished from disk.

### The derivation it feeds — `wd_<slug>_<sha12>`

The K3 note established the scheme from both ends: `corpus/knowledge/kimi-session-state.md:59-60`
(data side, 9 / 9 entries: the 12-hex suffix equals the first 12 hex of `sha256(root)`) and
`corpus/knowledge/kimi-session-state.md:443-446` (the round-19 A3 audit upgrading the
derivation from strings-only to measured-corroborated). This section re-derives it from
`~/.kimi-code/workspaces.json` itself, on this lane's own commands.

**OBSERVATION (source side).** Read out of `~/.kimi-code/bin/kimi` with `grep -a -b -o` and
`dd`: region marker `"utils/workdir-slug.ts"` at byte 125573119, `function slugifyWorkDirName`
at 125573141, `function encodeWorkDirKey` at 125573410, `function workspaceRootKey` at
125573711, and the constant block at 125574056 onward. The fragments below are the minified
source with whitespace reflowed for reading — identifiers, literals and call order verbatim.

```
/* ~/.kimi-code/bin/kimi @125573141 */
function slugifyWorkDirName(name) {
  const slug = name.toLowerCase().replaceAll(/[^a-z0-9._-]+/g, "-")
                   .replaceAll(/^-+|-+$/g, "").slice(0, MAX_WORKDIR_SLUG_LENGTH)
                   .replaceAll(/^-+|-+$/g, "");
  return slug === "" || slug === "." || slug === ".." ? "workspace" : slug;
}
/* ~/.kimi-code/bin/kimi @125573410 */
function encodeWorkDirKey(workDir) {
const normalized = workDir.replace(/\\/g, "/").replace(/\/+$/, "");
return `${WORKDIR_KEY_PREFIX}${slugifyWorkDirName(normalized.split("/").pop() ?? normalized)}_${(0, node_crypto.createHash)("sha256").update(normalized).digest("hex").slice(0, HASH_LENGTH)}`;
}
/* ~/.kimi-code/bin/kimi @125574056 */ MAX_WORKDIR_SLUG_LENGTH = 40; WORKDIR_KEY_PREFIX = "wd_";
                                            HASH_LENGTH = 12;
```

**OBSERVATION (two keys re-computed here, by hand, from this file's `root` values).**

| # | `root` (from `~/.kimi-code/workspaces.json:1`) | `basename` | slug per the recipe | sha256 of root, first 12 hex | assembled key | in file? |
|---|---|---|---|---|---|---|
| 1 | `/home/vgpnk` | `vgpnk` | `vgpnk` | `403b91ce3657` | `wd_vgpnk_403b91ce3657` | ✓ at byte 27 |
| 2 | `/home/vgpnk/Projects` | `Projects` | `projects` | `48a771e908b1` | `wd_projects_48a771e908b1` | ✓ at byte 512 |

Commands: `printf '%s' <root> | sha256sum | cut -c1-12` for the hash, and
`grep -c 'wd_projects_48a771e908b1' ~/.kimi-code/workspaces.json` → `1`. A third pass
recomputed all 9 keys programmatically (`crypto.createHash('sha256')` over the raw `root`
string, slug = lowercased `basename(root)` with `[^a-z0-9._-]+` → `-`): **9 / 9 MATCH**,
zero DIFF.

**INFERENCE (why the `root` field is the input, not `name`).** `encodeWorkDirKey` hashes
the *normalized workDir*, while `name` is only the display basename (`Projects` with a
capital P at entry offset 512). The hash pre-image cannot be recovered from `name`, and the
slug cannot be recovered from `root` without the lowercase + character-class fold. So
`~/.kimi-code/workspaces.json` is the **minimum sufficient input** to reproduce every
`wd_*` directory name: `root` alone regenerates both halves of the key.

**Refinement of the K3 wording (route, do not edit).** The K3 note says "the slug equals
`basename(root)`" (`corpus/knowledge/kimi-session-state.md:60`). Measured here: the slug
equals `slugifyWorkDirName(basename(root))`, which **case-folds** — the catalog's `name`
field is `Projects` (`~/.kimi-code/workspaces.json:1`, entry at byte 512) while the key is
`wd_projects_48a771e908b1`. The claim is correct for the other 8 entries only because their
basenames were already lowercase; `wd_projects_48a771e908b1` is the one entry that
discriminates.

**UNKNOWN.** Truncation at `MAX_WORKDIR_SLUG_LENGTH = 40` is unexercised here (the longest
slug is 12 B, `kimi-m4-test`), as is the `"" / "." / ".." → "workspace"` fallback and the
`WIN_SHAPED` case-fold branch in `workspaceRootKey` (`~/.kimi-code/bin/kimi` byte
125573711) — this host has no Windows-shaped root. `deleted_workspace_ids` semantics
(tombstone vs purge) cannot be read from an empty array.

## `~/.kimi-code/tui.toml.bak` — the plain backup, pairwise against `~/.kimi-code/tui.toml`

**OBSERVATION (shape).** 1301 B, mode `644`, `links=1`, 31 lines, mtime
`2026-10-03 17:53:30.971929921 -0300`, sha256
`8ada090d15993c99c57266eabd512cb42fd7c0ee8dcd826a0cf885f9a698d0e1`. The live sibling
`~/.kimi-code/tui.toml` is 1300 B, mode `644`, 31 lines, mtime
`2026-10-03 18:36:19.244352233 -0300`, sha256
`02cc238f3f547c042c3b1ce83e33eceac5c5076561b7ccaa81bfff71d0f75e71`. Exact mtime delta:
2568.272 s = **42 min 48 s** (the K1 note's "43 minutes",
`corpus/knowledge/kimi-config-plane.md:294`, is that figure rounded up).

**OBSERVATION (pairwise diff — the round-18 claim re-verified independently).** Three
independent reads, all in agreement:

- `diff ~/.kimi-code/tui.toml.bak ~/.kimi-code/tui.toml` → exactly one hunk, `10c10`:
  `disable_feedback_survey = false # true hides the occasional session rating prompt` →
  the same line with `true`. Anchors `~/.kimi-code/tui.toml.bak:10` and
  `~/.kimi-code/tui.toml:10`; line lengths 81 B → 80 B.
- Minimal-edit script over the raw bytes (longest common prefix/suffix): 541 B identical
  prefix, 756 B identical suffix, one `replace` opcode, `b'fals'` (4 B) → `b'tru'` (3 B).
  1301 − 1300 = **1 B**, fully explained by `false`→`true`.
- Reconstruction: `sed '10s/false/true/' ~/.kimi-code/tui.toml.bak | cmp - ~/.kimi-code/tui.toml`
  exits 0 with no output — the backup plus that one flip **is** the live file, byte for byte.
  A normalising hash agrees: mask line 10 out of each file and both digest to the same
  value (transcript block, fenced row `normalised-sha`).

**Verdict on the round-18 claim: it HOLDS.** `corpus/knowledge/kimi-config-plane.md:294-297`
("the *entire* byte-level difference … one value flip … 1301−1300 = 1 byte … no other line
differs") re-measured here is false→true at line 10 and nothing else.

**OBSERVATION (the trap a re-prober falls into).** A *positional* compare is not the same
question: `cmp -l ~/.kimi-code/tui.toml.bak ~/.kimi-code/tui.toml` reports **742** differing
byte positions over the first 1300 B, because the deletion of one character shifts every
later byte. "Exactly 1 byte" is true of the file-size delta and of the minimal edit; it is
not true of an aligned byte-by-byte compare. Both numbers are recorded so the next read
does not "refute" the claim with the wrong instrument.

**OBSERVATION (structure of the backup, and the chain that is not there).** Both files
carry the same three table headers at the same lines —
`~/.kimi-code/tui.toml.bak:12` `[editor]`, `~/.kimi-code/tui.toml.bak:15` `[notifications]`,
`~/.kimi-code/tui.toml.bak:19` `[upgrade]` — and the same header comment block at
`~/.kimi-code/tui.toml.bak:1-3`
(line 1 is literally `# ~/.kimi-code/tui.toml`, i.e. the backup's header still names the
live path). The 31 lines of `~/.kimi-code/tui.toml.bak` decompose without residue: 10
assignment lines + 12 comment lines + 6 blank lines + 3 table headers = 31, trailing newline
present. And `ls ~/.kimi-code/tui.toml.*.bak` finds nothing:
the client-preference plane has **no timestamped chain at all** — this bare `.bak` is its
only backup generation, unlike `~/.kimi-code/config.toml`, whose chain is 12 generations
(11 timestamped + 1 bare, counted by `ls ~/.kimi-code/config.toml*.bak | wc -l` = 12 and
gated as ONE member by the census regex `scripts/kimi-census.mjs:106`).

**INFERENCE.** The bare-suffix `.bak` with a header that names the live file is a
copy-on-write snapshot taken by whatever wrote `~/.kimi-code/tui.toml` at 18:36, not a
user-named backup; the census's drift-chain regex `/^config\.toml(\..+)?\.bak$/` exempts the
config generations from root enumeration but not this one, which is why
`~/.kimi-code/tui.toml.bak` had to become a declared K5 member rather than a chain
generation (`scripts/kimi-census.mjs:38-41`, `scripts/kimi-census.mjs:140-142`).

**OBSERVATION (the substrate's own sensitivity rule, strings-grade).** `~/.kimi-code/bin/kimi`
defines `isSensitiveFile` at byte 129778221: a basename is sensitive if it is in
`SENSITIVE_BASENAMES` (`.env`, `id_rsa`, `id_ed25519`, `id_ecdsa`, `credentials`), starts
with `ENV_PREFIX` (`.env.`), or starts with one of `SENSITIVE_BASENAME_PREFIXES` (`id_rsa`,
`id_ed25519`, `id_ecdsa`, `credentials`) — and only *that* branch consults
`SENSITIVE_DOT_VARIANT_SUFFIX_SET.has` (byte 129778912), whose list
`SENSITIVE_DOT_VARIANT_SUFFIXES = [` starts at byte 129784375 with `".bak"` as its first
entry (byte 129784412). `~/.kimi-code/tui.toml` matches none of those prefixes.

**INFERENCE.** By the substrate's own classifier `~/.kimi-code/tui.toml.bak` is not a
sensitive path, which is consistent with the `644` both files actually carry — this residue
is readable by house rule, not merely tolerated.

**UNKNOWN.** Which writer produced the plain `.bak` — no `tui.toml.bak` literal exists in
`~/.kimi-code/bin/kimi` (`grep -a -b -o 'tui\.toml\.bak'` → exit 1). The `.bak` strings that
*do* exist belong to other subsystems: the wire-journal backup function
`wireJournalBackupKey` (byte 128043889) returning `` `${key}.bak` `` (byte 128043926), the
update-swap rollback comments (bytes 145230438, 145241889), the sensitive-suffix list above,
`leveldb.bak` (byte 181825300), and agent-facing theme/skill instructions (`~/.kimi-code/bin/kimi`
bytes 127850944, 127873362) — and those last two prescribe the *timestamped*
`<name>.<stamp>.bak` convention, which this file's name does not follow. Retention and
generation count are not derivable from a single file.

## `~/.kimi-code/rc-qrcode.png` — PNG shape census (no content claims)

**OBSERVATION (file shape).** 2323 B, mode `644`, `links=1`, mtime
`2026-10-13 16:03:10.190917267 -0300`, sha256
`950adf928833f7a700ed90f49e784d747a9d0421d3d7e1b8c5e16e0f48d2589a`. `file -b
~/.kimi-code/rc-qrcode.png` → `PNG image data, 196 x 196, 8-bit/color RGBA,
non-interlaced`.

**OBSERVATION (chunk census, `python3` + `struct` + `binascii.crc32`).** Signature
`89504e470d0a1a0a` present. Exactly four chunks, in canonical order, each CRC verified
correct:

| chunk | length | CRC ok | notes |
|---|---|---|---|
| `IHDR` | 13 | ✓ | width 196, height 196, bit depth 8, colour type 6 (RGBA), compression 0, filter 0, interlace 0 |
| `IDAT` | 2 | ✓ | first scanline-data chunk |
| `IDAT` | 2252 | ✓ | second chunk; IDAT total 2254 B |
| `IEND` | 0 | ✓ | terminator, last chunk |

No ancillary chunks of any kind are present (`gAMA`, `iCCP`, `pHYs`, `sRGB`, `bKGD`,
`sBIT`, `tEXt`, `zTXt` all absent). Inflating the concatenated IDAT stream yields exactly
153860 B = `196 × (1 + 196 × 4)` — the raw filtered scanline buffer for 196×196 RGBA, which
confirms the IHDR fields against the data rather than trusting the header. Row filter bytes
observed across the 196 rows: `{1, 2, 4}` (Sub / Up / Paeth; no None or Average rows).
Compression ratio raw:IDAT ≈ 68.3.

**INFERENCE (producer, strings-grade only).** `~/.kimi-code/bin/kimi` carries the region
`src/utils/remote-control-qr.ts` (byte 142051126) whose header `function
generateRemoteControlQr(url, dataDir)` starts at byte 142051171; it `mkdir`s the data dir,
resolves the literal `"rc-qrcode.png"` (byte 142051335) inside it, renders a QR of type
`png` with `margin: QR_PNG_MARGIN` (byte 142051424) and writes it. So the file is the
Remote-Control QR artefact of this data root, and its mode `644` is consistent with a
display artifact rather than a secret — the K4 note reached the same reading from the
opposite end (`corpus/knowledge/kimi-binary-secrets.md:190-197`). The 196×196 canvas and
the small IDAT are what a low-version QR with a quiet-zone margin looks like.

**OBSERVATION (mtime neighbourhood, shape only).** `~/.kimi-code/server.token` mtime is
`2026-10-13 16:03:07.313 -0300` (43 B, mode 600 — `stat` only, never opened) and
`~/.kimi-code/server/rc.json` is 261 B, mode 644, mtime `16:03:07.427`; this PNG is
2877 ms after the token and 2763 ms after `~/.kimi-code/server/rc.json`, i.e. the same
Remote-Control startup window.

**Deliberately not done (by rule, not by inability).** The QR payload was **not decoded**
and no content of the image is claimed here; decoding it would materialise a pairing
secret into this note. "PNG shape census" is the whole of what this section asserts.

**UNKNOWN.** What URL the QR encodes and whether it is still valid; whether the file is
rewritten on every `rc`/`web` boot or only when absent (one generation on disk, no chain to
compare); whether a non-`644` umask would have produced a different mode; whether the
`{1,2,4}` filter set is a property of the encoder library (the census cannot name the
library from four chunks).

## Registry row and re-run probe

**Members: 3 / 3** named, one section each, each with its own path anchors —
`~/.kimi-code/workspaces.json:1`, `~/.kimi-code/tui.toml.bak:10`,
`~/.kimi-code/rc-qrcode.png` (shape rows above). This is the K5 row of
`SCORECARD.md:141` ("`workspaces.json`, `tui.toml.bak`, `rc-qrcode.png` (3)"), and the
family the census freezes at `K5: 3` (`scripts/kimi-census.mjs:155`).

**Re-run probe for a non-author (all read-only, one line each):**

- `node scripts/kimi-census.mjs` → exit 0 and `KIMI_CENSUS: CLEAN (members=49 …)`, with the
  `FAMILY K5 members=3 checked=3 frozen=3` line and `strays=0` in the ROOT_ENUM info line.
- `printf '%s' /home/vgpnk/Projects | sha256sum | cut -c1-12` → `48a771e908b1`, and
  `grep -c wd_projects_48a771e908b1 ~/.kimi-code/workspaces.json` → `1`.
- `sed '10s/false/true/' ~/.kimi-code/tui.toml.bak | cmp - ~/.kimi-code/tui.toml; echo $?` →
  `0` (the one-flip identity between the two files).
- `file -b ~/.kimi-code/rc-qrcode.png` → `PNG image data, 196 x 196, 8-bit/color RGBA,
  non-interlaced`.

**Route elsewhere, do not absorb:**

- *paths → kagi.* `~/.kimi-code/workspaces.json` is mode 600 yet holds nine absolute
  filesystem paths (two of them under `/tmp`, one under `~/.zcode`) — a home-directory
  disclosure surface for the credential/leak plane, not this plane.
- *session plane → K3.* The `wd_*` derivation, the catalog-vs-`sessions/` superset relation,
  and the case-fold refinement of `corpus/knowledge/kimi-session-state.md:60` all belong to
  `corpus/knowledge/kimi-session-state.md`; this note only supplies the input side.
- *pairing secret → kagi.* The QR payload and `~/.kimi-code/server.token` /
  `~/.kimi-code/server/rc.json` validity are secret-plane questions; this note census's the
  PNG header and nothing more.
- *config drift → K1.* Whether the client-preference plane should grow a timestamped chain
  (it has none) is a `~/.kimi-code/config.toml`-chain question for
  `corpus/knowledge/kimi-config-plane.md`.


Round-40 re-pin (2026-10-22): the census citations above at note lines 11, 248, 255 and 338 had gone stale through the round-34 (+4 lines) and round-35 (+1) edits of `scripts/kimi-census.mjs`, and the round-40 edit moved the true anchors a further +5 (in range, wrong line, which `cite-check` does not flag); they now name the K5 member rows `scripts/kimi-census.mjs:140-142`, `FROZEN` at `scripts/kimi-census.mjs:155` and `RE_CHAIN` at `scripts/kimi-census.mjs:106` (found by the round-40 seat ExecKimiCensus, `.ufo/waves/round-40/build/ExecKimiCensus.md`). Old to new, as line numbers of `scripts/kimi-census.mjs`: 130-132 became 140-142, 145 became 155, 97 became 106.
