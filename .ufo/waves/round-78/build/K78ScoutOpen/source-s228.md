# S228 — Terraform CLI `plan`, section `#detailed-exitcode`

- **URL**: https://developer.hashicorp.com/terraform/cli/commands/plan
- **Access date**: 2026-11-04 (local -03:00; the request was served 2026-11-03T21:39:40Z per the `date:` header)
- **HTTP status**: 200 (HTTP/2; `server: Vercel`, `x-vercel-cache: HIT`, `etag: "zd60gu8edy5x8c"`, `age: 32422`)
- **Last-Modified**: **absent** from the response headers. This is a Next.js SSR page; the only
  freshness markers served are `date`, `etag`, `age`, `x-vercel-cache`. None was fabricated here.
- **Byte size**: 276352 (`content-length: 276352`, body 276352 bytes)
- **sha256**: `a501ef22dec9e3c0bd05ffc7082b0f6a84abf5a96d1c6199a02223b74b207cca`
- **Section anchor**: `#detailed-exitcode` — exactly one `id="detailed-exitcode"` in the capture,
  carried by the `<a>` inside the `-detailed-exitcode` list item.
- **Capture**: `terraform-plan.html` (this directory, 276352 bytes, byte-identical sha256 above);
  response headers verbatim in `terraform-plan.headers.txt`.
- **Fetch**: `curl -sS -L -D terraform-plan.headers.txt -o terraform-plan.html <URL>` — exit 0.
  The `?output=1` variant was **not** fetched: the seat makes that conditional on the first
  capture lacking the exit-code table, and the table is present.

## Located quote — verbatim, 18 whitespace words

> 0 = Succeeded with empty diff (no changes) 1 = Error 2 = Succeeded with non-empty diff (changes present)

Document form: three adjacent `<li>` items inside the `-detailed-exitcode` list item, quoted in
document order with the list markers dropped —
`<li>0 = Succeeded with empty diff (no changes)</li>`,
`<li>1 = Error</li>`,
`<li>2 = Succeeded with non-empty diff (changes present)</li>`.
No word was added, dropped or reordered; the only edit is the omitted `</li><li>` boundaries.

**Sentence before (location of the quote):** "Returns a detailed exit code when the command
exits. When provided, this argument changes the exit codes and their meanings to provide more
granular information about what the resulting plan contains:"

**Sentence after:** the next list item, `-generate-config-out=PATH` (Experimental import-block
generation).

## What the row grounds (one line)

The three-valued **0 / 1 / 2 detailed-exit-code convention** — a diagnostic that encodes "nothing
to report / difference found / a distinct third state" in the process exit status instead of
requiring callers to parse output text — which is the precedent capability `omp-shape-compare`
adopts for `OMP_SHAPE_COMPARE` (0 in sync, 1 drift, 2 fail-closed).

Scope limit, stated so the row is not stretched: Terraform's `2` means *success with a non-empty
diff*, while `omp-shape-compare` uses `2` for *fail-closed* (malformed/absent receipt, root not a
directory). S228 grounds the **code space and the "exit status carries the verdict" discipline**,
not our mapping of `2`.

## Row state

`corpus/SOURCES.md` at the scaffolding commit carries 166 rows; the last row is `S227` (line 182)
and `S228` does not occur (grep count 0), so this is a new row. The knowledge file the plan cites
for it, `corpus/knowledge/shape-receipt-live-drift.md`, does **not** exist at the base tree
(`corpus/knowledge/` holds 64 docs, none matching `shape|receipt|drift` except
`receipt-identity-canonicalization.md`).
