# Receipt secret sweep — SentSecrets2

## Result

**Severity: Informational / no secret detected in the available files.** The case-insensitive search for `token|secret|passwd|apikey|authorization|cookie|ssh|private` returned **no matches** in the available receipt files. The field listing contains no environment field. The argv values are public lane commands, not credential-bearing arguments.

**Coverage gap: run-3 is absent, so the three-receipt claim is not fully assessed.** This is not evidence that run-3 contains a secret; its absence prevents a complete conclusion.

## Evidence

Attacked: `/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-51/receipts/attest-run-1.txt`, `/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-51/receipts/attest-run-2.txt`, `/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-51/receipts/attest-run-3.txt`, and `/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-51/receipts/attest-run-2-replayed.txt`.

- Secret-pattern scan (case-insensitive, requested expression): `token|secret|passwd|apikey|authorization|cookie|ssh|private`.
- Output: `No matches found`; the search tool reported `/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-51/receipts/attest-run-3.txt` as a skipped missing path.
- A `jq` key listing over each available receipt JSON line returned:
  - `attest-run-1.txt`: `argv,digest,exit,mono_span_ms,nonce,stderr_sha256,stdout_sha256,wall_end,wall_start`
  - `attest-run-2.txt`: `argv,digest,exit,mono_span_ms,nonce,stderr_sha256,stdout_sha256,wall_end,wall_start`
  - `attest-run-2-replayed.txt`: `argv,digest,exit,mono_span_ms,nonce,stderr_sha256,stdout_sha256,wall_end,wall_start`
  - `attest-run-3.txt`: `MISSING`
- The JSON `argv` values were inspected: run 1 is `["node","scripts/bind-oracle.mjs","--selftest"]`; run 2 and its doctored control are `["node","scripts/proxy-check.mjs","--strict"]`. `git ls-tree -r --name-only HEAD` lists both scripts as tracked at the inspected HEAD; their source headers/usage show these are lane scripts and these are supported flags. No inline environment assignment, credential-looking value, or external secret-bearing argument is present.
- `git ls-tree -r --name-only HEAD` listed only `attest-run-1.txt`, `attest-run-2.txt`, and `attest-run-2-replayed.txt` among the four requested receipt paths. Reading the run-3 path also returned not found.

The other listed fields are receipt metadata (digest, exit, elapsed/wall-clock values, nonce, and stdout/stderr hashes); no `env`/environment key is recorded. The visible nonce is receipt metadata, not an authorization token.

## Exploit path, impact, remediation

- **Available files:** no credential exposure path was found in the inspected bytes. An observer learns the lane-public argv and receipt metadata only. Smallest remediation: none for these files.
- **Missing run-3:** if the absent file contained secret material, this sweep could not detect it. Impact is limited to an incomplete close assertion; no leak in that file is established. Smallest remediation: after run-3 is committed, rerun the sweep below against the close revision and record its output. Do not count the missing file as clean.

## Close sweep command

Run at close from any directory; this scans each entire text receipt (including the `run-at:` prelude), lists the JSON-line keys, and reports missing inputs explicitly:

```bash
for f in \
  /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-51/receipts/attest-run-1.txt \
  /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-51/receipts/attest-run-2.txt \
  /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-51/receipts/attest-run-3.txt \
  /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-51/receipts/attest-run-2-replayed.txt; do
  printf '\n== %s ==\n' "$f"
  if [ ! -f "$f" ]; then printf 'MISSING\n'; continue; fi
  grep -iE 'token|secret|passwd|apikey|authorization|cookie|ssh|private' "$f" || {
    rc=$?; [ "$rc" -eq 1 ] || exit "$rc";
  }
  jq -r 'keys | join(",")' < <(tail -n 1 "$f")
done
```

`grep` exit 1 means no pattern match; any other grep error fails the loop. The close command is proposed for rerun once run-3 exists; the executed pattern scan and key listing above covered the three available files only.

Report: .ufo/waves/round-51/w2/SentSecrets2.md
