source: S095 https://raw.githubusercontent.com/containers/bubblewrap/v0.13.1/bwrap.xml; S099 https://man7.org/linux/man-pages/man5/proc_pid_mountinfo.5.html; own-work: scripts/cap-run.mjs (contract kumitate-cap-run-v2)
verified-at: 2026-10-23 (bubblewrap 0.13.1 body hash S095; mountinfo body hash S099; cap-run inspected after the round-50 guard)
recheck: on-release; after a cap-run mount-order or bind-validation change, run cap-run --selftest and the frozen bindguard50 probe at the committed revision

# Mount order and bind scope

Bubblewrap applies filesystem operations in argument order (S095, bwrap.xml:253-255: “These are applied in the order they are given as arguments.”). A later mount operation at the same destination covers what was mounted there earlier. `--bind SRC DEST` exposes the host path at DEST; `--tmpfs DEST` mounts a new tmpfs there (S095, bwrap.xml:295-312 and :410-416). Thus `--tmpfs /tmp --bind /tmp /tmp` replaces the runner's private tmpfs with the host `/tmp` read-write.

`cap-run` mounts fresh `/tmp` and `/run` tmpfs roots before appending bind requests and its implicit cwd bind. Refuse a bind that targets the whole `/tmp` root and refuse a cwd that resolves to a sandbox-managed mount root/tree; do not refuse every path beneath `/tmp`, because a caller may legitimately bind a specific fixture directory there. This rule governs cap-run's own CLI; direct bwrap callers remain outside that parser.

Read `/proc/self/mountinfo` inside the child namespace being checked. Field 5 is the mount point, and the file describes mounts in that process's mount namespace (S099, `proc_pid_mountinfo(5)`, DESCRIPTION ¶1 and field (5)). A mount-point row proves that a mount exists at the path, not that it exposes the requested source bytes; an absent extra row does not prove a path is invisible when a recursive root bind can leave it readable. Check visibility, content and writability separately when they are the property under test.

Evidence: r49 `ScoutCapRunVisibility.md` reproduced the host `/tmp` write after `--bind /tmp`; r50 `LabratBwrapEmpiric.md` re-ran the order cases; r50 `bindguard50-probe.mjs` specifies the subdirectory-bind and tmpfs checks. These receipts distinguish observed host behavior from the source-derived ordering rule.

Disambiguation: “bind” here means a bwrap filesystem bind mount; it is not mado's Hyprland keybinding table or `mado-binds.py`.