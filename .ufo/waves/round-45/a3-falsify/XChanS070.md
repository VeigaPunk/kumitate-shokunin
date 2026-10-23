RESULT XChanS070 rev=6b2a4517 verdict=holds channels=2 verbatim=yes version_ok=yes pins=reproduce unsupported=0

No tool installed. Revision 6b2a45178c72a4565bb9d98e09f4c36b95ca1521. Gate line is corpus/lessons/round-45.md:35 (23 words): "We have to have a pid 1 in the pid namespace, because otherwise we'll get a bunch of zombies as nothing reaps them." (:3481-3484, 23). `printf '%s' "<quote>" | wc -w` prints 23. Apostrophe in the file is byte 0x27.

Channel A, shallow clone of tag v0.13.1. Command: `env -u GIT_DIR -u GIT_WORK_TREE -u GIT_INDEX_FILE git clone -q --depth 1 --branch v0.13.1 --no-hardlinks https://github.com/containers/bubblewrap.git` under scratch a3f-XChanS070/bwrap. Tag object 46ec5c413a3c1da265624ddac3a715b4d1bc487d is an annotated tag, not a commit. `git rev-parse 'v0.13.1^{commit}'` and `HEAD` are 362936aea0d5c6e70f7af75d2d44b5a914cb4ba2. Tag text says "bubblewrap 0.13.1". meson.build:4 says `version : '0.13.1'`. Commit subject: "Prepare 0.13.1 release". `sha256sum bubblewrap.c` prints de141c805cb88f8faff9af1b3bb49098191fc67833b51b51fea84510ea4426ce (3570 lines). That is the row's hash.

Channel B, one fetch of the row URL. `curl -fsSL` of https://github.com/containers/bubblewrap/blob/362936aea0d5c6e70f7af75d2d44b5a914cb4ba2/bubblewrap.c returned HTTP 200, 937340 bytes, HTML sha256 5dcc7b5e0aa6cb40f48a00eec3b9c8c22b76bc84a8e36c17f3c8c41f3d163082. Title and `currentOid` are that same commit. The HTML body contains the string "0.13.1" zero times. Embedded `rawLines` decodes to 3570 lines whose sha256 is again de141c805cb88f8faff9af1b3bb49098191fc67833b51b51fea84510ea4426ce, byte-identical to the clone. The URL serves the commit the row names, and that commit is tag v0.13.1.

Quote. Joining comment lines 3481-3483 and collapsing whitespace finds the gate sentence in both channels (FOUND). Lines 3483-3484 also continue "Alternatively if we're using sync_fd or lock_files we need some process to own these." The quoted sentence sits inside the stated :3481-3484. Raw HTML does not contain the 23 words as one string; they are split JSON lines. After decoding `rawLines`, same text.

Pins, observed at that commit:
- :2490 is `xclearenv ();` inside `parse_args_recurse` (`--clearenv`). utils.c:315-318 `xclearenv` calls `clearenv()`. `main` calls `parse_args` at :2947, before `execvp`.
- :3487-3495 is `pid = fork ();`, the failure check, and the parent branch (`pid != 0`) starting `drop_all_caps`. Guard at :3479: `if (!opt_as_pid_1 && (opt_unshare_pid || lock_files != NULL || opt_sync_fd_count > 0))`.
- :3555 is `if (execvp (exec_path, argv) == -1)`.
- Claimed sha256 matches both channels. Line numbers and hash reproduce.

`return do_init (event_fd, pid);` is at :3513, after the closed range :3487-3495. `do_init` is :585-656: a `wait` loop, then `return initial_exit_status`. No `exec` in that function. The parent returns there and does not reach :3555. The child does.

Entry sentences that contain S070 (entry lines 1 and 111-113 only):
- Line 1, "S070 bubblewrap.c 362936ae". Supported: that prefix is the v0.13.1 commit above.
- Lines 111-113: "`xclearenv` clears bwrap's own environment before `execvp` of the command (:3555); PID 1 is the forked reaper (:3487-3495) that runs `do_init` and never execs." Supported by :2490, utils.c:317, :3555, and the parent path :3479-3513 plus `do_init`. The `do_init` call is at :3513, not inside :3487-3495. "Never execs" is the parent path only. With `--as-pid-1`, or with no pid namespace and no lock files and no sync fds, the fork is skipped and the command is the process that reaches `execvp`. The entry's next sentence attributes `/proc/<pid>/environ` to S071, not to this file. bubblewrap.c does not mention `/proc/1/environ`. unsupported=0.
