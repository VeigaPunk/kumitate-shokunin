#!/usr/bin/env python3
"""K91Sentinel race battery: A7 (external symlink-swap) and A8 (receipt FIFO-swap)
across base v4, the positive control, and the worktree v5 candidate."""
import hashlib, os, shutil, subprocess, sys, time

SCRATCH = "/fast/scratch/hyaku/kumitate-r91/K91Sentinel"
SEAT = "/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-91/K91Sentinel"
RCPT_SEAT = os.path.join(SEAT, "receipts")
LANE_FIX = os.path.join(SCRATCH, "fixture-lane")
EXT = os.path.join(SCRATCH, "ext")
LIMIT = 2147483648
TOOLS = {
    "v4": os.path.join(SCRATCH, "tools", "v4.mjs"),
    "ref": "/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-91/controls/ref-fd-fstat.mjs",
    "cand": os.path.join(SCRATCH, "tools", "v5-candidate.mjs"),
}
LINES = []


def log(s=""):
    LINES.append(s)
    print(s, flush=True)


def sh(cmd):
    return subprocess.run(cmd, capture_output=True, text=True)


def rev():
    return sh(["git", "-C", LANE_FIX, "rev-parse", "HEAD"]).stdout.strip()


def run_tool(tool, rcptdir, r, timeout=5):
    cmd = ["prlimit", f"--as={LIMIT}", "--", "timeout", str(timeout), "node", tool,
           "--dir", rcptdir, "--rev", r, "--lane", LANE_FIX]
    try:
        p = subprocess.run(cmd, capture_output=True, text=True, timeout=timeout + 8, cwd=SCRATCH)
        rc, out, err = p.returncode, p.stdout.strip(), p.stderr.strip()
    except subprocess.TimeoutExpired:
        rc, out, err = "TIMEOUT", "", ""
    verdict = ""
    for ln in (out + "\n" + err).splitlines():
        if ln.startswith("RECEIPT_BIND:"):
            verdict = ln
            break
    return rc, verdict


def sha_file(p):
    h = hashlib.sha256()
    with open(p, "rb") as f:
        h.update(f.read())
    return h.hexdigest()


def a7(r, runs=120):
    d = os.path.join(EXT, "raceA7")
    shutil.rmtree(d, ignore_errors=True)
    os.makedirs(d)
    real, other = os.path.join(d, "real"), os.path.join(d, "other")
    path = os.path.join(d, "inst")
    with open(real, "wb") as f:
        f.write(b"REAL\n")
    with open(other, "wb") as f:
        f.write(b"OTHER\n")
    digest = sha_file(other)  # the SYMLINK TARGET's digest: a laundering CLEAN
    rcpt = os.path.join(SCRATCH, "rcpt", "A7")
    shutil.rmtree(rcpt, ignore_errors=True)
    os.makedirs(rcpt)
    with open(os.path.join(rcpt, "a.txt"), "w") as f:
        f.write(f"rev={r}\ntool_sha256={digest}\ncmd=node {path}\nexit=0\n")
    shutil.copyfile(os.path.join(rcpt, "a.txt"), os.path.join(RCPT_SEAT, "A7.txt"))
    racer = os.path.join(SCRATCH, "racer_a7.py")
    with open(racer, "w") as f:
        f.write("import os,sys,time\n"
                "d,real,other,path=sys.argv[1],sys.argv[2],sys.argv[3],sys.argv[4]\n"
                "t0=time.time()\n"
                "while time.time()-t0<300:\n"
                "    try:\n"
                "        for s in (d+'.l', d+'.r'):\n"
                "            if os.path.lexists(s): os.unlink(s)\n"
                "        os.symlink(os.path.basename(other), d+'.l'); os.replace(d+'.l', path)\n"
                "        os.link(real, d+'.r'); os.replace(d+'.r', path)\n"
                "    except OSError: pass\n")
    # A stale temp file from a killed racer would make os.symlink/os.mkfifo raise EEXIST
    # and silently kill the racer (the whole try block is skipped) — clear them first.
    for s in (d + ".l", d + ".r"):
        if os.path.lexists(s):
            os.unlink(s)
    log("A7 | external symlink-swap race | class=OUT-of-CLASS (RD-3, atomicity of the type/size check)")
    log(f"     (the receipt's tool_sha256 is the digest of the SYMLINK TARGET; a CLEAN = laundering)")
    res = {}
    for tool in ("v4", "ref", "cand"):
        p = subprocess.Popen(["python3", racer, d, real, other, path])
        time.sleep(0.3)
        tally = {}
        for _ in range(runs):
            rc, v = run_tool(TOOLS[tool], rcpt, r)
            if v.startswith("RECEIPT_BIND: CLEAN"):
                k = "CLEAN(LAUNDERED)"
            elif v.startswith("RECEIPT_BIND: DRIFT"):
                k = "DRIFT"
            elif "SYMLINK_INSTRUMENT" in v:
                k = "SYMLINK_INSTRUMENT"
            elif "FAIL-CLOSED UNRESOLVED" in v:
                k = "UNRESOLVED"
            elif rc in ("TIMEOUT", 124):
                k = "HUNG"
            else:
                k = f"OTHER:{v[:70]}"
            tally[k] = tally.get(k, 0) + 1
        p.kill()
        res[tool] = tally
        log(f"  {tool:4s} n={runs}: {tally}")
    log("  expected: v4 shows CLEAN (laundering) | ref/cand: ZERO CLEAN (O_NOFOLLOW open)")
    log("")
    return res


def a8(r, runs=150):
    d = os.path.join(SCRATCH, "rcpt", "A8")
    shutil.rmtree(d, ignore_errors=True)
    os.makedirs(d)
    alpha = sh(["git", "-C", LANE_FIX, "cat-file", "blob", f"{r}:scripts/alpha.mjs"]).stdout
    body = f"rev={r}\ntool_sha256={hashlib.sha256(alpha.encode()).hexdigest()}\ncmd=node scripts/alpha.mjs --selftest\nexit=0\n"
    reg = os.path.join(SCRATCH, "rcpt", "A8.reg")
    with open(reg, "w") as f:
        f.write(body)
    with open(os.path.join(d, "a.txt"), "w") as f:
        f.write(body)
    shutil.copyfile(os.path.join(d, "a.txt"), os.path.join(RCPT_SEAT, "A8.txt"))
    racer = os.path.join(SCRATCH, "racer_a8.py")
    with open(racer, "w") as f:
        f.write("import os,sys,time\n"
                "d,path,reg=sys.argv[1],sys.argv[2],sys.argv[3]\n"
                "t0=time.time()\n"
                "while time.time()-t0<300:\n"
                "    try:\n"
                "        for s in (d+'.f', d+'.g'):\n"
                "            if os.path.lexists(s): os.unlink(s)\n"
                "        os.mkfifo(d+'.f'); os.replace(d+'.f', path)\n"
                "        os.link(reg, d+'.g'); os.replace(d+'.g', path)\n"
                "    except OSError: pass\n")
    for s in (d + ".f", d + ".g"):
        if os.path.lexists(s):
            os.unlink(s)
    log("A8 | receipt FIFO-swap race | class=OUT-of-CLASS (RD-4, receipt open is not the claim)")
    res = {}
    for tool in ("v4", "ref", "cand"):
        p = subprocess.Popen(["python3", racer, d, os.path.join(d, "a.txt"), reg])
        time.sleep(0.3)
        tally = {}
        for _ in range(runs):
            rc, v = run_tool(TOOLS[tool], d, r)
            if v.startswith("RECEIPT_BIND: CLEAN"):
                k = "CLEAN"
            elif v.startswith("RECEIPT_BIND: DRIFT"):
                k = "DRIFT"
            elif "RECEIPT_UNREADABLE" in v:
                k = "RECEIPT_UNREADABLE"
            elif rc in ("TIMEOUT", 124):
                k = "HUNG"
            else:
                k = f"OTHER:{v[:70]}"
            tally[k] = tally.get(k, 0) + 1
        p.kill()
        res[tool] = tally
        log(f"  {tool:4s} n={runs}: {tally}")
    log("  expected: v4/ref show some HUNG (no O_NONBLOCK on the receipt open);")
    log("            cand adds O_NONBLOCK to the receipt open (RD-4 hardening, out of the claim)")
    log("")
    return res


if __name__ == "__main__":
    os.makedirs(RCPT_SEAT, exist_ok=True)
    r = rev()
    log(f"fixture rev {r}")
    for k, p in TOOLS.items():
        log(f"  {k:4s} {p}")
    log("")
    a7(r)
    a8(r)
    with open(os.path.join(SEAT, "races.log"), "w") as f:
        f.write("\n".join(LINES) + "\n")
