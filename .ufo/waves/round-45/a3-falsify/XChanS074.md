RESULT XChanS074 rev=6b2a4517 verdict=holds channels=2 verbatim=yes version_ok=yes pins=reproduce unsupported=0

Gate quote, corpus/lessons/round-45.md line 39: "By default, Jujutsu snapshots the working copy at the beginning of every command." The row's own count is 13. `printf '%s' "By default, Jujutsu snapshots the working copy at the beginning of every command." | wc -w` prints 13. Locator in the gate: stdout line 36.

Row at 6b2a45178c72, corpus/SOURCES.md, the S074 line: source column is "jj status --help, installed jj 0.45.1-7c41cdeb16b6b321c64e789a966b6adf723816a5 — local command output". There is no http URL. Anchor: stdout lines 34-41; capture sha256 2307dec8feff9498850918be714615d68cb512b00655832bdc49a5bcc865370d. What it teaches: by default jj snapshots the working copy at the beginning of every command; --ignore-working-copy neither snapshots nor updates it.

(a) Channel 1, fresh help. Command: systemd-run --user --scope --quiet -p MemoryMax=4G -p TasksMax=128 timeout -s KILL 60 /home/vgpnk/.local/bin/jj status --help. Exit 0. `jj --version` prints `jj 0.45.1-7c41cdeb16b6b321c64e789a966b6adf723816a5`. The help text itself prints no version line. stdout sha256 2307dec8feff9498850918be714615d68cb512b00655832bdc49a5bcc865370d, 119 lines, 5026 bytes. Same hash with COLUMNS unset and with COLUMNS=100.

(a) Channel 2, upstream source at tag v0.45.1. https://api.github.com/repos/jj-vcs/jj/git/refs/tags/v0.45.1 returns object type commit, sha 7c41cdeb16b6b321c64e789a966b6adf723816a5, message "release: 0.45.1". That is the commit named by the binary version suffix. https://raw.githubusercontent.com/jj-vcs/jj/v0.45.1/cli/src/cli_util.rs body sha256 ee1eb31d16c0b5a920ea80ad2f73ff4183b83450013f63dacb8402f2f77f1e2d (185869 bytes, 4862 lines). Same tag, Cargo.toml line 15: `version = "0.45.1"`, body sha256 68e75e7e78986f37c58ea1f023d4810c6a933d7a4ff28d94e8f3ed17f22e7d07.

(a) Row URL: none. The source column says "local command output", so there was no row URL to fetch. The version the row names is the installed binary, and both `jj --version` and tag v0.45.1 are that commit. version_ok=yes.

(b) Help channel: FOUND, stdout line 36, verbatim "By default, Jujutsu snapshots the working copy at the beginning of every command." (13 words).

(b) Source channel: FOUND as the doc comment on GlobalArgs.ignore_working_copy, cli/src/cli_util.rs lines 3751-3752. Line 3751 reads `/// By default, Jujutsu snapshots the working copy at the beginning of every` (`printf '%s' "By default, Jujutsu snapshots the working copy at the beginning of every" | wc -w` prints 12). The next doc line is `/// command.` Folding only whitespace still leaves the `///` marker between "every" and "command". The help printer drops those markers; the printed sentence matches the gate quote. No curly apostrophe and no guillemet in either channel.

(c) Locality, help: lines 33-44 are the Global Options flag `--ignore-working-copy`. Line 34 (9 words, `printf '%s' "Don't snapshot the working copy, and don't update it" | wc -w`): "Don't snapshot the working copy, and don't update it". Lines 36-41 are the long text that starts with the gate quote. The quote is inside the row's stated lines 34-41.

(c) Locality, source: cli_util.rs line 3740 sets the help heading "Global Options". Lines 3749-3760 are that flag's doc comment. Line 3761 is `#[arg(long, global = true)]` on `ignore_working_copy`. Same flag the help prints at lines 33-44.

(d) The fresh default stdout hash equals the row's capture hash 2307dec8feff9498850918be714615d68cb512b00655832bdc49a5bcc865370d. Line 36 is the quote. Lines 34-41 are that flag's short line and long text. pins=reproduce. Other widths change both hash and line, and are not the pinned bytes: COLUMNS=80 sha 5f1c8bc6c7245180bf2af5aaf065f5ffb70adbcac20b0c17b725cb6ca3276bf2 at line 37; COLUMNS=40 at line 48; COLUMNS=120 at line 35. The pin is the default non-tty wrap.

(e) Entry sentence 1, corpus/knowledge/agent-isolation-substrates.md line 1, cites S074 as `jj status --help` 0.45.1. Supported: `jj --version` is 0.45.1-7c41cdeb16b6b321c64e789a966b6adf723816a5 and tag v0.45.1 is that commit.

(e) Entry sentence 2, same file lines 53-54: S074 (`jj status --help` lines 34-41): «By default, Jujutsu snapshots the working copy at the beginning of every command.» Supported by help line 36 and by cli_util.rs lines 3751-3752. The row's other clause, that the flag neither snapshots nor updates the working copy, is help line 34 and source line 3749, inside the cited line range. A search of the entry for S074 finds only line 1 and line 53. unsupported=0.

No tool was installed. No process was left under /fast/scratch/hyaku/kumitate-r45/seats/a3f-XChanS074.
