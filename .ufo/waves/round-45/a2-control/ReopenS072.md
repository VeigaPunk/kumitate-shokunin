RESULT ReopenS072 rev=a2e5b54c verdict=confirmed quotes_found=2/2
Re-derived inherited candidate SOURCES row S072 (systemd 262 manuals) from attempt-1 scratch: rows file line 13, seat report SrcSystemdResource.md.

1. Re-open (ordinary fetches, my scratch /fast/scratch/hyaku/kumitate-r45/seats/a2-ReopenS072/):
- curl -sS -L -o resource-control.html -w 'HTTP %{http_code} final=%{url_effective}\n' https://www.freedesktop.org/software/systemd/man/262/systemd.resource-control.html
  -> HTTP 200 final=https://www.freedesktop.org/software/systemd/man/262/systemd.resource-control.html (no redirect)
- curl -sS -L -o systemd-run.html -w ... https://www.freedesktop.org/software/systemd/man/262/systemd-run.html
  -> HTTP 200 final=https://www.freedesktop.org/software/systemd/man/262/systemd-run.html (no redirect)
- sha256sum resource-control.html systemd-run.html
  -> aa70dfdfd46df925d40d8b33c9ce37de8df915fb3bd2896a2658a4d4e1be134f  resource-control.html
  -> fab8afcc7b547de54a3329ef80e6bddefeebe351c1aa7892a328a98b808e555a  systemd-run.html
- Both match the row's pinned sha256s exactly (check 3 CONFIRMED).
- Version: page banner contains "systemd 262" in both fetched bodies (grep -o 'systemd 2[0-9]+' -> "systemd 262"); the single "systemd 252" string in resource-control.html is a changelog anchor id (dt id="systemd 252"), not the page version. Host: systemctl --version -> "systemd 262 (262-1-arch)". Row's "host systemd 262" holds.

2. Locator exists and says what teaches/gloss claims (check 1 CONFIRMED):
- MemoryMax= under section "Memory Accounting and Control" (h3 header at HTML line 152): dt id="MemoryMax=bytes" at line 191; "Specify the absolute limit on memory usage of the executed processes in this unit." line 191; OOM sentence line 192; "the most stringent limit of the unit and parent slices and it is capped by physical memory" lines 200-201. Gloss claims about absolute limit, in-unit OOM killer, most-stringent effective cap all supported.
- TasksMax= under "Process Accounting and Control" (h3 at line 244): dt id="TasksMax=N" at line 250; "Specify the maximum number of tasks that may be created in the unit." line 250; pids.max control lines 251-258. Gloss claim "TasksMax= caps task creation" supported.
- Delegate= under "Control Group Management" (h3 at line 597): delegation list text lines 618-632 (controller names incl. memory/pids lines 629-632).
- systemd-run(1) § Description: scope text lines 39-42: "If a command is run as transient scope unit, it will be executed by [systemd-run] itself as parent process and will thus inherit the execution environment of the caller." Gloss claim "a systemd-run scope inherits the caller's environment (no env scrub)" supported.

3. Draft quotes attributed to S072 (check 2 CONFIRMED, 2/2):
Draft /fast/scratch/hyaku/kumitate-r45/a2/inherited-entry-draft.md lines 95-96:
- «out-of-memory killer is invoked inside the unit» -> found verbatim in resource-control.html line 192, inside the MemoryMax= entry (region lines 191-201); word count 7 (printf ... | wc -w -> 7).
- «will thus inherit the execution environment of the caller» -> found verbatim in systemd-run.html line 40, inside § Description (lines 39-42); word count 9.
Full sentences also present: OOM sentence (16 words) line 191-192; "will thus inherit..." (9 words) line 40.

4. Kind/tier (check 4 CONFIRMED): kind=docs, tier=A. The systemd project manuals served from freedesktop.org are the official primary documentation for the systemd version; tier A (primary/official) is correct per corpus/QUALITY.md Q2.

5. Rejected row: N/A (S072 is mined/on-release, not rejected).

No correction needed; rows line 13 is accurate as-is. No tools installed or updated; no tests/demos run (plain curl fetches). Evidence quotes copied verbatim from fetched bytes.
