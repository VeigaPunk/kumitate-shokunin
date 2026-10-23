# S098 re-open — HOLD

Axes: operability (source/provenance re-opened) and coverage (both cited passages checked).

## Fetch and hash

Command run:
```sh
curl -fsSL -o /tmp/kumitate-r50-strace-v7.2-doc.strace.1.in https://raw.githubusercontent.com/strace/strace/v7.2/doc/strace.1.in && sha256sum /tmp/kumitate-r50-strace-v7.2-doc.strace.1.in && wc -c /tmp/kumitate-r50-strace-v7.2-doc.strace.1.in && date -u +%F
```
Output:
```text
c16859e07dacc5cda882c7ab5f2e353803645a6ca449a0ac41eda1034e67ae9a  /tmp/kumitate-r50-strace-v7.2-doc.strace.1.in
60347 /tmp/kumitate-r50-strace-v7.2-doc.strace.1.in
2026-10-23
```
The downloaded body SHA-256 matches the assigned expected digest.

## Cited spans

Read command: `read /tmp/kumitate-r50-strace-v7.2-doc.strace.1.in:832-835,148-158`

- `doc/strace.1.in:832-835`: `Aligns return values in a specific column (default column 40).` This confirms the cited return-column default.
- `doc/strace.1.in:148-154`: the manual says an ongoing call is marked `.IR unfinished .` and, when it returns, marked `.IR resumed .`; lines 156–158 illustrate the unfinished and resumed markers.

These passages agree with the reopened S098 evidence; verdict **HOLD** (no drift found).

## Receipt and bounds

Wrote the scored receipt to `.ufo/waves/round-50/r50/ReopenS098.md`. Its first nonblank line is exactly:
```text
REOPEN50: HOLD source=https://raw.githubusercontent.com/strace/strace/v7.2/doc/strace.1.in sha256=c16859e07dacc5cda882c7ab5f2e353803645a6ca449a0ac41eda1034e67ae9a fetched=2026-10-23
```
No tool was installed or updated. The lane was only read; the receipt and this report are the only lane files written, both authorized for this seat. The fetched source copy is under `/tmp`.
