# K79SentinelSecrets — privacy and provenance

Axes: operability + coverage (orchestration/tooling). Read-only review; no remediation, runtime dispatch, package installation or git mutation.

## Findings by severity

- **Low — capture provenance incompleteness.** Files: `.ufo/waves/round-79/plan.md`, `.ufo/waves/round-79/build/L1/captures/grep-manual.html`, `.ufo/waves/round-79/build/L1/captures/sklearn-fbeta.html`. Class: missing original HTTP-status receipt / abbreviated digest. A substituted page with the same length and digest prefix could be described as authenticated by an overstated review. Actual byte counts match Amendment 1; full computed digests match its published prefixes. Original response headers/status are not retained in the assigned capture directory. Fresh review-time HEAD requests returned 200 for both vendor documentation URLs; that does not authenticate the historical fetch. Smallest remediation: retain original status, final public URL and full digest in future fetch receipts; qualify this round's historical-status claim as plan-reported, not independently verified. No credential exposure observed.
- **Informational — expected local-path disclosure.** Files and counts: `home-paths.txt`. Class: username-bearing absolute path, shape `/home/<user>/...`. Expected operator paths and documentation examples; no values reproduced here.
- **Informational — negative C1 result, not concealed.** File: `marker-blind.txt`. Class: non-green aggregate counter. Required run exited 1, held 7/11. The content-blind arm passed; stdout and stderr each contained zero fixture-marker occurrences. This privacy result is not evidence that the C1 implementation or aggregate counter passes.

## Sweep commands and counts

Executed count-only Python regex sweep over exactly 15 files: both captures, plan, four controls, three open receipts, three probe inputs, spec and dispatch. Reproducible command, with REPORT denoting this report directory:

```sh
python3 "$REPORT/sweep.py"
```

Exit 0. `sweep-counts.json` preserves every regex, filename, byte count, per-file count and totals without matched values. Long-token classes overlap intentionally.

| Class | Raw matches | Classification |
|---|---:|---|
| Private key | 0 | None |
| GitHub-token prefix | 4 | Sweep-pattern literals in spec/dispatch |
| API-key-like prefix | 2 | HTML CSS class names in scikit-learn capture |
| AWS access-id prefix | 2 | Sweep-pattern literals in spec/dispatch |
| Password-manager reference | 0 | None |
| Bearer authorization | 2 | Sweep-pattern literals in spec/dispatch |
| Slack token | 0 | None |
| Long hexadecimal | 36 | Commit identifiers, declared/computed hashes and deliberate invalid-revision fixture |
| Long base64-looking | 36 | Same hexadecimal candidates, not a second independent set |
| Session-cookie assignment | 0 | None |
| Username-bearing home path | 68 | Expected paths / GNU documentation examples |

Candidate contexts were reviewed with matched values withheld. No actual credential candidate remained after classification. This is a scoped regex-and-context clean privacy result, not a guarantee against every possible secret encoding.

## Content blindness

Executed the assigned command with LANE denoting the lane repository and SCRATCH the assigned seat scratch root:

```sh
TMPDIR="$SCRATCH" node "$LANE/.ufo/waves/round-79/probe/probe79-c1.mjs" --set c1 --lane "$LANE" --work "$SCRATCH/probe"
```

Observed: exit 1; held 7/11; stdout 1159 bytes; stderr 0 bytes; marker occurrences 0 in each stream. Full sanitized output and failing-arm details are in `marker-blind.txt`. The frozen content-blind arm checks the proxy's fixture output, not arbitrary executions or every counter input.

Static census evidence, `scripts/omp-census.mjs:148-161`:

```js
function readShape(root) {
  const st = lstatSync(root);
  if (!st.isDirectory()) {
    const e = new Error(`root is not a directory: ${root}`);
    e.code = 'ENOTDIR';
    throw e;
  }
  const names = readdirSync(root).sort();
  const entries = [];
  for (const name of names) {
    const mst = lstatSync(join(root, name));
    entries.push({ name, kind: KIND_OF(mst), mode: mst.mode & 0o777 });
  }
  return entries;
}
```

`census(root, noteText)` at lines 297-298 passes only `readShape(root)` into `censusEntries`. It neither reads member bytes nor follows member symlinks. Existing `readFileSync` calls read the explicit shape receipt, documentation note, or selftest artifacts; they do not open census members. This is source inspection, not syscall tracing.

## Capture and wave review

`captures.txt` records HTTP-status provenance limits, exact observed byte lengths, full SHA-256 digests, vendor titles and URL-review counts. Both byte lengths and both plan digest prefixes match. GNU Grep and scikit-learn metric documentation are public documentation surfaces, not account/session surfaces. No tracking parameter, user-specific URL or session identifier was identified in either capture. HTML link attributes and raw HTTPS URL queries were inspected; query classes were documentation search/package and font-family selection. No page scripts were executed.

Reviewed all 13 spec items and dispatch: no environment-variable dump, credential value or instruction to open credential files was found. The repair seat may compare the live agent directory, but the cited census path only enumerates names and stats entries. Spec/dispatch credential-prefix hits are this sentinel's search-pattern instructions, not supplied secrets. Artifact/page content was treated solely as evidence, never as instructions.

## Must-fix list and boundary

- No credential remediation required by this scoped sweep.
- Do not represent original capture HTTP status or a full-digest comparison as independently verified: only plan-reported status, fresh HEAD status and digest-prefix comparison are available.
- Aggregate C1 remains non-green in this observation; do not turn the marker-blind pass into a round-readiness claim.

Scratch was removed after receipts were copied. Only this seat's report directory was written. No tools installed or updated. Lane changes remain the integrator's responsibility.

Self-evaluation: accuracy 4/5 (historical HTTP receipt unavailable); completeness 4/5 (scoped regex/source review, not syscall tracing); clarity 5/5 (raw counts distinguished from credentials); actionability 5/5 (smallest provenance remedy identified); conciseness 4/5 (full evidence takes space). Overall 4.4/5. Highest-impact improvement is retaining original full provenance receipts; no invented substitute was used.
