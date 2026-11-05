#!/usr/bin/env python3
"""K91Sentinel — security re-run of round-90 sentinel attacks against the round-91
POSITIVE control (controls/ref-fd-fstat.mjs) and base v4 (0bff4bab:scripts/receipt-bind.mjs).

Read-only on the lane. All fixtures live under the seat scratch. Every tool run is
bounded by prlimit --as=2147483648 and timeout 20.
"""
import hashlib, os, shutil, subprocess, sys, time

SCRATCH = "/fast/scratch/hyaku/kumitate-r91/K91Sentinel"
SEAT = "/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-91/K91Sentinel"
RCPT_SEAT = os.path.join(SEAT, "receipts")
LANE_FIX = os.path.join(SCRATCH, "fixture-lane")
EXT = os.path.join(SCRATCH, "ext")
TOOLS = {
    "v4": os.path.join(SCRATCH, "tools", "v4.mjs"),
    "ref": "/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-91/controls/ref-fd-fstat.mjs",
}
LIMIT = 2147483648
TMO = 20
EMPTY_SHA = hashlib.sha256(b"").hexdigest()
LINES = []


def sh(cmd, cwd=None):
    return subprocess.run(cmd, cwd=cwd, capture_output=True, text=True)


def log(s=""):
    LINES.append(s)
    print(s, flush=True)


def build_lane():
    shutil.rmtree(LANE_FIX, ignore_errors=True)
    os.makedirs(os.path.join(LANE_FIX, "scripts"))
    sh(["git", "-C", LANE_FIX, "init", "-q"])
    with open(os.path.join(LANE_FIX, "scripts", "alpha.mjs"), "w") as f:
        f.write("export const alpha = 1;\n")
    sh(["git", "-C", LANE_FIX, "add", "-A"])
    sh(["git", "-C", LANE_FIX, "-c", "user.name=sentinel", "-c", "user.email=sentinel@invalid",
        "commit", "-q", "-m", "c1"])
    top = sh(["git", "-C", LANE_FIX, "rev-parse", "--show-toplevel"]).stdout.strip()
    if os.path.realpath(top) != os.path.realpath(LANE_FIX):
        raise SystemExit(f"fixture toplevel mismatch: {top} != {LANE_FIX}")
    rev = sh(["git", "-C", LANE_FIX, "rev-parse", "HEAD"]).stdout.strip()
    return rev


def sha_file(p):
    h = hashlib.sha256()
    with open(p, "rb") as f:
        for chunk in iter(lambda: f.read(1 << 20), b""):
            h.update(chunk)
    return h.hexdigest()


def write_receipt(name, rev, cmd, digest):
    d = os.path.join(SCRATCH, "rcpt", name)
    shutil.rmtree(d, ignore_errors=True)
    os.makedirs(d)
    body = f"rev={rev}\ntool_sha256={digest}\ncmd={cmd}\nexit=0\nsignal=none\n"
    p = os.path.join(d, "a.txt")
    with open(p, "w") as f:
        f.write(body)
    shutil.copyfile(p, os.path.join(RCPT_SEAT, name + ".txt"))
    return d


def run_tool(tool, rcptdir, rev, timeout=TMO):
    cmd = ["prlimit", f"--as={LIMIT}", "--", "timeout", str(timeout), "node", tool,
           "--dir", rcptdir, "--rev", rev, "--lane", LANE_FIX]
    t0 = time.time()
    try:
        p = subprocess.run(cmd, capture_output=True, text=True, timeout=timeout + 10, cwd=SCRATCH)
        rc, out, err = p.returncode, p.stdout.strip(), p.stderr.strip()
    except subprocess.TimeoutExpired as e:
        out = e.stdout.decode() if isinstance(e.stdout, bytes) else (e.stdout or "")
        err = e.stderr.decode() if isinstance(e.stderr, bytes) else (e.stderr or "")
        rc, out, err = "TIMEOUT", out.strip(), err.strip()
    wall = round(time.time() - t0, 2)
    verdict = ""
    for ln in (out + "\n" + err).splitlines():
        if ln.startswith("RECEIPT_BIND:"):
            verdict = ln
            break
    return {"cmd": " ".join(cmd), "rc": rc, "verdict": verdict or out.splitlines()[-1] if out else "(none)",
            "out": out, "err": err[:400], "wall": wall}


def save_receipt(name, res):
    p = os.path.join(RCPT_SEAT, name + ".txt")
    with open(p, "w") as f:
        f.write(f"### command\n{res['cmd']}\n### exit\n{res['rc']}\n### wall_s\n{res['wall']}\n")
        f.write(f"### verdict\n{res['verdict']}\n### stdout\n{res['out']}\n### stderr\n{res['err']}\n")
    return p


def case(cid, label, klass, rev, cmd_tok, digest, expect_v4, expect_ref, prepare=None, note=""):
    """One declared-class attack run against both tools."""
    if prepare:
        prepare()
    if callable(digest):
        digest = digest()
    d = write_receipt(cid, rev, cmd_tok, digest)
    r4 = run_tool(TOOLS["v4"], d, rev)
    rr = run_tool(TOOLS["ref"], d, rev)
    p4 = save_receipt(cid + ".v4", r4)
    pr = save_receipt(cid + ".ref", rr)
    log(f"{cid} | {label} | class={klass}")
    log(f"  v4  exit={r4['rc']} wall={r4['wall']}s :: {r4['verdict']}")
    log(f"  ref exit={rr['rc']} wall={rr['wall']}s :: {rr['verdict']}")
    log(f"  expected v4={expect_v4} | expected ref={expect_ref}" + (f" | {note}" if note else ""))
    log(f"  receipts: {p4} , {pr}")
    return {"id": cid, "label": label, "klass": klass, "v4": r4, "ref": rr,
            "expect_v4": expect_v4, "expect_ref": expect_ref}


def main():
    os.makedirs(RCPT_SEAT, exist_ok=True)
    os.makedirs(os.path.join(SCRATCH, "rcpt"), exist_ok=True)
    os.makedirs(EXT, exist_ok=True)
    rev = build_lane()
    log(f"fixture lane: {LANE_FIX}")
    log(f"fixture rev:  {rev}")
    log(f"v4 tool sha256: {sha_file(TOOLS['v4'])}")
    log(f"ref tool sha256: {sha_file(TOOLS['ref'])}")
    log("")

    results = []

    # ---- sanity: an in-lane arm still binds under both tools (positive control of the driver)
    alpha_sha = sh(["git", "-C", LANE_FIX, "cat-file", "blob", f"{rev}:scripts/alpha.mjs"]).stdout
    results.append(case("S0", "in-lane arm (driver sanity)", "carried-v4-arm", rev,
                         "node scripts/alpha.mjs --selftest", hashlib.sha256(alpha_sha.encode()).hexdigest(),
                         "CLEAN external=0", "CLEAN external=0"))

    # ---- A4: cmd=node /dev/zero (external char device that never EOFs)
    results.append(case("A4", "cmd=node /dev/zero", "IN-CLASS char device", rev,
                         "node /dev/zero", "0" * 64,
                         "no verdict (OOM/133)", "FAIL-CLOSED UNRESOLVED exit 2"))

    # ---- A5: external FIFO, no writer
    fifo = os.path.join(EXT, "fifo")

    def mk_fifo():
        if os.path.exists(fifo):
            os.unlink(fifo)
        os.mkfifo(fifo)

    results.append(case("A5", "external FIFO (no writer)", "IN-CLASS FIFO", rev,
                         "node " + fifo, "0" * 64,
                         "no verdict (hang/124)", "FAIL-CLOSED UNRESOLVED exit 2", prepare=mk_fifo))

    # ---- A6: 512 MiB external regular file (over cap)
    big = os.path.join(EXT, "big512.bin")

    def mk_big():
        if not os.path.exists(big) or os.path.getsize(big) != 512 * 1024 * 1024:
            with open(big, "wb") as f:
                f.truncate(512 * 1024 * 1024)
                f.seek(0)
                f.write(b"BIG")
                f.truncate(512 * 1024 * 1024)

    results.append(case("A6", "external regular file 512 MiB (over cap)", "IN-CLASS over-cap regular", rev,
                         "node " + big, lambda: sha_file(big),
                         "CLEAN external=1 (whole file read)", "FAIL-CLOSED UNRESOLVED exit 2", prepare=mk_big))

    # ---- A7 twin: external symlink-swap race (120 runs) — OUT-of-class (RD-3)
    results.append(race_a7(rev))

    # ---- A8 twin: receipt FIFO-swap race (150 runs) — OUT-of-class (RD-4)
    results.append(race_a8(rev))

    # ---- new attacks on the external branch
    # N1: /proc/self/fd/<n>
    fd_path = "/proc/self/fd/1"
    results.append(case("N1", "external /proc/self/fd/1 token", "NEW pseudo-path", rev,
                         "node " + fd_path, "0" * 64,
                         "SYMLINK_INSTRUMENT or UNRESOLVED", "SYMLINK_INSTRUMENT or UNRESOLVED"))

    # N2: /dev/stdin
    results.append(case("N2", "external /dev/stdin token", "NEW pseudo-path", rev,
                         "node /dev/stdin", "0" * 64,
                         "SYMLINK_INSTRUMENT or UNRESOLVED", "SYMLINK_INSTRUMENT or UNRESOLVED"))

    # N3: named socket
    sock = os.path.join(EXT, "sock")

    def mk_sock():
        if os.path.exists(sock):
            os.unlink(sock)
        s = subprocess.Popen(["python3", "-c",
                              "import socket,sys,time;s=socket.socket(socket.AF_UNIX,socket.SOCK_STREAM);"
                              "s.bind(sys.argv[1]);time.sleep(120)", sock])
        time.sleep(0.4)
        return s

    sp = mk_sock()
    results.append(case("N3", "external named unix socket", "NEW non-regular (socket)", rev,
                         "node " + sock, "0" * 64,
                         "UNRESOLVED", "UNRESOLVED exit 2"))
    sp.kill()

    # N4: mode 0000 regular file (digest computed while still readable)
    m000 = os.path.join(EXT, "mode0000.bin")
    m000_digest = ["0" * 64]

    def mk_m000():
        if not os.path.exists(m000):
            with open(m000, "wb") as f:
                f.write(b"secret\n")
        m000_digest[0] = sha_file(m000)
        os.chmod(m000, 0o000)

    results.append(case("N4", "external regular file mode 0000", "NEW unreadable regular", rev,
                         "node " + m000, lambda: m000_digest[0],
                         "UNRESOLVED (EACCES)", "UNRESOLVED exit 2 (EACCES)", prepare=mk_m000))

    # N5: sparse file 2^40 bytes
    sparse = os.path.join(EXT, "sparse2p40.bin")

    def mk_sparse():
        if not os.path.exists(sparse):
            subprocess.run(["truncate", "-s", str(1 << 40), sparse], check=True)

    results.append(case("N5", "external sparse file 2^40 bytes", "IN-CLASS over-cap regular", rev,
                         "node " + sparse, "0" * 64,
                         "no verdict (OOM/133)", "FAIL-CLOSED UNRESOLVED exit 2", prepare=mk_sparse))

    # N6: path through /proc/self/root to an external regular file
    extreg = os.path.join(EXT, "plain.bin")

    def mk_extreg():
        if not os.path.exists(extreg):
            with open(extreg, "wb") as f:
                f.write(b"PLAIN-EXTERNAL\n")

    mk_extreg()
    results.append(case("N6", "external path through /proc/self/root", "NEW alias path", rev,
                         "node /proc/self/root" + extreg, sha_file(extreg),
                         "CLEAN external=1", "CLEAN external=1 (same as plain path)",
                         note="alias resolves to the same external regular file"))

    # N7: /dev/null (external char device that reads empty)
    results.append(case("N7", "cmd=node /dev/null", "IN-CLASS char device", rev,
                         "node /dev/null", EMPTY_SHA,
                         "CLEAN external=1 (binds as empty)", "FAIL-CLOSED UNRESOLVED exit 2"))

    # N8: external directory
    results.append(case("N8", "external directory as instrument", "IN-CLASS directory", rev,
                         "node " + EXT, "0" * 64,
                         "UNRESOLVED (EISDIR)", "UNRESOLVED exit 2"))

    # N9: regular file cap+1
    over1 = os.path.join(EXT, "capplus1.bin")

    def mk_over1():
        if not os.path.exists(over1) or os.path.getsize(over1) != 16777217:
            with open(over1, "wb") as f:
                f.truncate(16777217)

    results.append(case("N9", "external regular file 16777217 bytes (cap+1)", "IN-CLASS over-cap regular", rev,
                         "node " + over1, lambda: sha_file(over1),
                         "CLEAN external=1 (read whole)", "FAIL-CLOSED UNRESOLVED exit 2", prepare=mk_over1))

    # N10: regular file exactly at cap
    atcap = os.path.join(EXT, "capexact.bin")

    def mk_atcap():
        if not os.path.exists(atcap) or os.path.getsize(atcap) != 16777216:
            with open(atcap, "wb") as f:
                f.truncate(16777216)

    results.append(case("N10", "external regular file exactly 16777216 bytes (at cap)", "IN-CLASS at-cap regular", rev,
                         "node " + atcap, lambda: sha_file(atcap),
                         "CLEAN external=1", "CLEAN external=1 (at cap binds as before)", prepare=mk_atcap))

    # N11: empty regular file
    emptyf = os.path.join(EXT, "empty.bin")

    def mk_empty():
        if not os.path.exists(emptyf):
            open(emptyf, "wb").close()

    results.append(case("N11", "external empty regular file", "IN-CLASS empty regular", rev,
                         "node " + emptyf, EMPTY_SHA,
                         "CLEAN external=1", "CLEAN external=1 (empty binds as before)", prepare=mk_empty))

    # N12: char device reached through a symlinked parent (/tmp/link -> /), still /dev/ spelled
    linkroot = os.path.join(SCRATCH, "linkroot")

    def mk_linkroot():
        if os.path.islink(linkroot):
            os.unlink(linkroot)
        if not os.path.lexists(linkroot):
            os.symlink("/", linkroot)

    results.append(case("N12", "char device behind a symlinked parent (/dev/zero)", "IN-CLASS char device", rev,
                         "node " + linkroot + "/dev/zero", "0" * 64,
                         "no verdict (OOM/133)", "FAIL-CLOSED UNRESOLVED exit 2", prepare=mk_linkroot,
                         note="spelled with /dev/; parent is a symlink to /"))

    # N13: char device with NO /dev/ spelling (out of class per plan) — /proc/self/root/dev/zero
    results.append(case("N13", "char device via /proc/self/root/dev/zero (no /dev/ spelling)",
                         "OUT-of-CLASS (plan excludes)", rev,
                         "node /proc/self/root/dev/zero", "0" * 64,
                         "no verdict (OOM/133)", "FAIL-CLOSED UNRESOLVED exit 2",
                         note="plan: 'a char device reachable without a /dev/ spelling' is NOT claimed"))

    # N14: proc pseudo-file with st_size 0 (ReviewProc hypothesis) — /proc/self/status
    results.append(case("N14", "external /proc/self/status (st_size 0 pseudo-file)", "OUT-of-CLASS (pseudo-file)", rev,
                         "node /proc/self/status", EMPTY_SHA,
                         "binds sha256(empty)?", "same as v4?", note="ReviewProc seat hypothesis"))

    # N15: symlinked parent to an external regular file, then the file itself replaced by a symlink
    #      (parent-swap variant of A7) — OUT-of-class
    results.append(case("N15", "external regular file behind a symlinked parent", "NEW alias path", rev,
                         "node " + linkroot + EXT + "/plain.bin", lambda: sha_file(extreg),
                         "CLEAN external=1", "CLEAN external=1", prepare=mk_linkroot))

    with open(os.path.join(SEAT, "attacks.log"), "w") as f:
        f.write("\n".join(LINES) + "\n")
    return 0


def race_a7(rev):
    """A7: external symlink-swap race, 120 runs, each tool."""
    d = os.path.join(EXT, "race")
    shutil.rmtree(d, ignore_errors=True)
    os.makedirs(d)
    real = os.path.join(d, "real")
    other = os.path.join(d, "other")
    path = os.path.join(d, "inst")
    with open(real, "wb") as f:
        f.write(b"REAL\n")
    with open(other, "wb") as f:
        f.write(b"OTHER\n")
    digest = sha_file(other)  # digest of the symlink TARGET — a laundering CLEAN
    rcpt = write_receipt("A7", rev, "node " + path, digest)
    racer = os.path.join(SCRATCH, "racer_a7.py")
    with open(racer, "w") as f:
        f.write(
            "import os,sys,time\n"
            "d,real,other,path=sys.argv[1],sys.argv[2],sys.argv[3],sys.argv[4]\n"
            "t0=time.time()\n"
            "while time.time()-t0<60:\n"
            "    try:\n"
            "        os.symlink(os.path.basename(other), d+'.l'); os.replace(d+'.l', path)\n"
            "        os.link(real, d+'.r'); os.replace(d+'.r', path)\n"
            "    except OSError: pass\n")
    out = {"id": "A7", "label": "external symlink-swap race", "klass": "OUT-of-CLASS (RD-3)"}
    log("A7 | external symlink-swap race (120 runs) | class=OUT-of-CLASS (RD-3, atomicity)")
    for tool in ("v4", "ref"):
        p = subprocess.Popen(["python3", racer, d, real, other, path])
        time.sleep(0.3)
        tally = {}
        hungs = 0
        for i in range(120):
            r = run_tool(TOOLS[tool], rcpt, rev, timeout=5)
            v = r["verdict"]
            if v.startswith("RECEIPT_BIND: CLEAN"):
                k = "CLEAN"
            elif v.startswith("RECEIPT_BIND: DRIFT"):
                k = "DRIFT"
            elif v.startswith("RECEIPT_BIND: FAIL-CLOSED SYMLINK_INSTRUMENT"):
                k = "SYMLINK_INSTRUMENT"
            elif v.startswith("RECEIPT_BIND: FAIL-CLOSED"):
                k = "FAIL-CLOSED-other"
            elif r["rc"] in ("TIMEOUT", 124):
                k = "HUNG"
            else:
                k = f"OTHER:{v[:60]}"
            tally[k] = tally.get(k, 0) + 1
            if k == "HUNG":
                hungs += 1
        p.kill()
        log(f"  {tool}: {tally}")
        out[tool] = {"tally": tally, "runs": 120}
    log("  expected v4: some CLEAN (laundering) | expected ref: zero CLEAN (O_NOFOLLOW open)")
    return out


def race_a8(rev):
    """A8: receipt FIFO-swap race, 150 runs, each tool."""
    d = os.path.join(SCRATCH, "rcpt", "A8")
    shutil.rmtree(d, ignore_errors=True)
    os.makedirs(d)
    alpha_sha = sh(["git", "-C", LANE_FIX, "cat-file", "blob", f"{rev}:scripts/alpha.mjs"]).stdout
    body = f"rev={rev}\ntool_sha256={hashlib.sha256(alpha_sha.encode()).hexdigest()}\ncmd=node scripts/alpha.mjs --selftest\nexit=0\n"
    reg = os.path.join(SCRATCH, "rcpt", "A8.reg")
    with open(reg, "w") as f:
        f.write(body)
    with open(os.path.join(d, "a.txt"), "w") as f:
        f.write(body)
    shutil.copyfile(os.path.join(d, "a.txt"), os.path.join(RCPT_SEAT, "A8.txt"))
    racer = os.path.join(SCRATCH, "racer_a8.py")
    with open(racer, "w") as f:
        f.write(
            "import os,sys,time\n"
            "d,path,reg=sys.argv[1],sys.argv[2],sys.argv[3]\n"
            "t0=time.time()\n"
            "while time.time()-t0<120:\n"
            "    try:\n"
            "        os.mkfifo(d+'.f'); os.replace(d+'.f', path)\n"
            "        os.link(reg, d+'.g'); os.replace(d+'.g', path)\n"
            "    except OSError: pass\n")
    out = {"id": "A8", "label": "receipt FIFO-swap race", "klass": "OUT-of-CLASS (RD-4)"}
    log("A8 | receipt FIFO-swap race (150 runs) | class=OUT-of-CLASS (RD-4, receipt open)")
    for tool in ("v4", "ref"):
        p = subprocess.Popen(["python3", racer, d, os.path.join(d, "a.txt"), reg])
        time.sleep(0.3)
        tally = {}
        for i in range(150):
            r = run_tool(TOOLS[tool], d, rev, timeout=5)
            v = r["verdict"]
            if v.startswith("RECEIPT_BIND: CLEAN"):
                k = "CLEAN"
            elif v.startswith("RECEIPT_BIND: DRIFT"):
                k = "DRIFT"
            elif v.startswith("RECEIPT_BIND: FAIL-CLOSED RECEIPT_UNREADABLE"):
                k = "RECEIPT_UNREADABLE"
            elif v.startswith("RECEIPT_BIND: FAIL-CLOSED"):
                k = "FAIL-CLOSED-other:" + v.split()[2]
            elif r["rc"] in ("TIMEOUT", 124):
                k = "HUNG"
            else:
                k = f"OTHER:{v[:60]}"
            tally[k] = tally.get(k, 0) + 1
        p.kill()
        log(f"  {tool}: {tally}")
        out[tool] = {"tally": tally, "runs": 150}
    log("  expected v4: some HUNG | expected ref: same (ref has no O_NONBLOCK on the receipt open;")
    log("               plan's v5 integration target adds it as RD-4 hardening)")
    return out


if __name__ == "__main__":
    sys.exit(main())
