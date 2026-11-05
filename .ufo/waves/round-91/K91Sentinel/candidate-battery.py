#!/usr/bin/env python3
"""K91Sentinel final battery: the worktree v5 candidate (snapshot) vs base v4 vs the
positive control, on the round-90 sentinel attacks and the new external-branch attacks.

Also measures the pseudo-file hypothesis: a regular file whose st_size is 0 but which
yields content — does a size-from-fstat cap bound the read?
"""
import hashlib, os, shutil, subprocess, sys, time

SCRATCH = "/fast/scratch/hyaku/kumitate-r91/K91Sentinel"
SEAT = "/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-91/K91Sentinel"
RCPT_SEAT = os.path.join(SEAT, "receipts")
LANE_FIX = os.path.join(SCRATCH, "fixture-lane")
EXT = os.path.join(SCRATCH, "ext")
LIMIT = 2147483648
TMO = 20
EMPTY_SHA = hashlib.sha256(b"").hexdigest()
LINES = []

V4 = os.path.join(SCRATCH, "tools", "v4.mjs")
REF = "/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-91/controls/ref-fd-fstat.mjs"
# Snapshot of the worktree candidate (the lane file is being edited by another seat).
CAND = os.path.join(SCRATCH, "tools", "v5-candidate.mjs")
TOOLS = {"v4": V4, "ref": REF, "cand": CAND}


def log(s=""):
    LINES.append(s)
    print(s, flush=True)


def sh(cmd):
    return subprocess.run(cmd, capture_output=True, text=True)


def sha_file(p):
    h = hashlib.sha256()
    with open(p, "rb") as f:
        for c in iter(lambda: f.read(1 << 20), b""):
            h.update(c)
    return h.hexdigest()


def write_receipt(name, rev, cmd, digest):
    d = os.path.join(SCRATCH, "rcpt", name)
    shutil.rmtree(d, ignore_errors=True)
    os.makedirs(d)
    body = f"rev={rev}\ntool_sha256={digest}\ncmd={cmd}\nexit=0\nsignal=none\n"
    with open(os.path.join(d, "a.txt"), "w") as f:
        f.write(body)
    shutil.copyfile(os.path.join(d, "a.txt"), os.path.join(RCPT_SEAT, name + ".txt"))
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
    verdict = ""
    for ln in (out + "\n" + err).splitlines():
        if ln.startswith("RECEIPT_BIND:"):
            verdict = ln
            break
    if not verdict:
        verdict = out.splitlines()[-1] if out else (err.splitlines()[-1] if err else "(none)")
    return {"cmd": " ".join(cmd), "rc": rc, "verdict": verdict, "out": out, "err": err[:600],
            "wall": round(time.time() - t0, 2)}


def save(name, res):
    p = os.path.join(RCPT_SEAT, name + ".txt")
    with open(p, "w") as f:
        f.write(f"### command\n{res['cmd']}\n### exit\n{res['rc']}\n### wall_s\n{res['wall']}\n")
        f.write(f"### verdict\n{res['verdict']}\n### stdout\n{res['out']}\n### stderr\n{res['err']}\n")
    return p


def case(cid, label, klass, rev, cmd_tok, digest, expect, prepare=None, note=""):
    if prepare:
        prepare()
    if callable(digest):
        digest = digest()
    d = write_receipt(cid, rev, cmd_tok, digest)
    res = {}
    for k in ("v4", "ref", "cand"):
        res[k] = run_tool(TOOLS[k], d, rev)
        save(f"{cid}.{k}", res[k])
    log(f"{cid} | {label} | class={klass}")
    for k in ("v4", "ref", "cand"):
        log(f"  {k:4s} exit={res[k]['rc']} wall={res[k]['wall']}s :: {res[k]['verdict']}")
    log(f"  expected: {expect}" + (f" | {note}" if note else ""))
    return res


def main():
    os.makedirs(RCPT_SEAT, exist_ok=True)
    os.makedirs(EXT, exist_ok=True)
    rev = sh(["git", "-C", LANE_FIX, "rev-parse", "HEAD"]).stdout.strip()
    log(f"fixture lane {LANE_FIX} rev {rev}")
    for k, p in TOOLS.items():
        log(f"  {k:4s} sha256={sha_file(p)}")
    log("")

    # ---- declared-class battery, three tools ----
    fifo = os.path.join(EXT, "fifo")

    def mk_fifo():
        if os.path.exists(fifo):
            os.unlink(fifo)
        os.mkfifo(fifo)

    case("A4", "cmd=node /dev/zero", "IN-CLASS char device (never EOF)", rev,
         "node /dev/zero", "0" * 64, "all: FAIL-CLOSED UNRESOLVED exit 2 (<20s, 2 GiB AS)")

    case("A5", "external FIFO, no writer", "IN-CLASS FIFO", rev,
         "node " + fifo, "0" * 64, "all: FAIL-CLOSED UNRESOLVED exit 2 (no block)",
         prepare=mk_fifo)

    big = os.path.join(EXT, "big512.bin")

    def mk_big():
        if not os.path.exists(big) or os.path.getsize(big) != 512 * 1024 * 1024:
            with open(big, "wb") as f:
                f.truncate(512 * 1024 * 1024)

    case("A6", "external regular file 512 MiB (over cap)", "IN-CLASS over-cap regular", rev,
         "node " + big, lambda: sha_file(big),
         "v4: CLEAN external=1 (whole file read) | ref+cand: FAIL-CLOSED UNRESOLVED exit 2",
         prepare=mk_big)

    case("A7-static", "external symlink instrument (no race)", "IN-CLASS-ish symlink", rev,
         "node " + os.path.join(EXT, "link"), "0" * 64,
         "all: FAIL-CLOSED SYMLINK_INSTRUMENT",
         prepare=lambda: (os.path.lexists(os.path.join(EXT, "link")) and os.unlink(os.path.join(EXT, "link")))
         or os.symlink("plain.bin", os.path.join(EXT, "link")))

    case("N7", "cmd=node /dev/null", "IN-CLASS char device (reads empty)", rev,
         "node /dev/null", EMPTY_SHA,
         "v4: CLEAN external=1 (binds as empty) | ref+cand: FAIL-CLOSED UNRESOLVED exit 2")

    case("N8", "external directory", "IN-CLASS directory", rev,
         "node " + EXT, "0" * 64, "all: FAIL-CLOSED UNRESOLVED exit 2")

    over = os.path.join(EXT, "capplus1.bin")

    def mk_over():
        if not os.path.exists(over) or os.path.getsize(over) != 16777217:
            with open(over, "wb") as f:
                f.truncate(16777217)

    case("N9", "external regular file 16777217 bytes (cap+1), correct digest",
         "IN-CLASS over-cap regular", rev, "node " + over, lambda: sha_file(over),
         "v4: CLEAN external=1 | ref+cand: FAIL-CLOSED UNRESOLVED exit 2", prepare=mk_over)

    atcap = os.path.join(EXT, "capexact.bin")

    def mk_atcap():
        if not os.path.exists(atcap) or os.path.getsize(atcap) != 16777216:
            with open(atcap, "wb") as f:
                f.truncate(16777216)

    case("N10", "external regular file exactly 16777216 bytes (at cap), correct digest",
         "IN-CLASS at-cap regular", rev, "node " + atcap, lambda: sha_file(atcap),
         "all: CLEAN matched=1 external=1 (at cap binds as before)", prepare=mk_atcap)

    emptyf = os.path.join(EXT, "empty.bin")

    def mk_empty():
        if not os.path.exists(emptyf):
            open(emptyf, "wb").close()

    case("N11", "external empty regular file, sha256(empty)", "IN-CLASS empty regular", rev,
         "node " + emptyf, EMPTY_SHA, "all: CLEAN matched=1 external=1 (empty binds as before)",
         prepare=mk_empty)

    # ---- new external-branch attacks ----
    case("N1", "/proc/self/fd/1 token", "NEW pseudo-path (symlink)", rev,
         "node /proc/self/fd/1", "0" * 64, "all: FAIL-CLOSED SYMLINK_INSTRUMENT")

    case("N2", "/dev/stdin token", "NEW pseudo-path (symlink)", rev,
         "node /dev/stdin", "0" * 64, "all: FAIL-CLOSED SYMLINK_INSTRUMENT")

    sock = os.path.join(EXT, "sock")

    def mk_sock():
        if os.path.exists(sock):
            os.unlink(sock)
        p = subprocess.Popen(["python3", "-c",
                               "import socket,sys,time;s=socket.socket(socket.AF_UNIX,socket.SOCK_STREAM);"
                               "s.bind(sys.argv[1]);time.sleep(180)", sock])
        time.sleep(0.4)
        return p

    sp = mk_sock()
    case("N3", "external named unix socket", "NEW non-regular (socket)", rev,
         "node " + sock, "0" * 64, "all: FAIL-CLOSED UNRESOLVED exit 2")
    sp.kill()

    m000 = os.path.join(EXT, "mode0000.bin")
    dig = ["0" * 64]

    def mk_m000():
        if not os.path.exists(m000):
            with open(m000, "wb") as f:
                f.write(b"secret\n")
        os.chmod(m000, 0o600)
        dig[0] = sha_file(m000)
        os.chmod(m000, 0o000)

    case("N4", "external regular file mode 0000", "NEW unreadable regular", rev,
         "node " + m000, lambda: dig[0], "all: FAIL-CLOSED UNRESOLVED exit 2 (EACCES)",
         prepare=mk_m000)

    sparse = os.path.join(EXT, "sparse2p40.bin")

    def mk_sparse():
        if not os.path.exists(sparse):
            subprocess.run(["truncate", "-s", str(1 << 40), sparse], check=True)

    case("N5", "external sparse file 2^40 bytes", "IN-CLASS over-cap regular", rev,
         "node " + sparse, "0" * 64, "all: FAIL-CLOSED UNRESOLVED exit 2 (no 1 TiB read)",
         prepare=mk_sparse)

    plain = os.path.join(EXT, "plain.bin")

    def mk_plain():
        if not os.path.exists(plain):
            with open(plain, "wb") as f:
                f.write(b"PLAIN-EXTERNAL\n")

    mk_plain()
    case("N6", "external path through /proc/self/root", "NEW alias path", rev,
         "node /proc/self/root" + plain, lambda: sha_file(plain),
         "all: CLEAN matched=1 external=1 (same as the plain path)")

    linkroot = os.path.join(SCRATCH, "linkroot")

    def mk_linkroot():
        if os.path.lexists(linkroot):
            os.unlink(linkroot)
        os.symlink("/", linkroot)

    case("N12", "char device behind a symlinked parent (still /dev/ spelled)",
         "IN-CLASS char device", rev, "node " + linkroot + "/dev/zero", "0" * 64,
         "v4: no verdict (OOM) | ref+cand: FAIL-CLOSED UNRESOLVED exit 2", prepare=mk_linkroot)

    case("N13", "char device via /proc/self/root/dev/zero", "OUT-of-CLASS (plan excludes)", rev,
         "node /proc/self/root/dev/zero", "0" * 64,
         "v4: no verdict (OOM) | ref+cand: FAIL-CLOSED UNRESOLVED exit 2 (ref is stronger than claimed)",
         note="plan: 'a char device reachable without a /dev/ spelling' is NOT claimed")

    case("N15", "external regular file behind a symlinked parent", "NEW alias path", rev,
         "node " + linkroot + plain, lambda: sha_file(plain),
         "all: CLEAN matched=1 external=1", prepare=mk_linkroot)

    # ---- the pseudo-file hypothesis: st_size 0 but content ----
    log("")
    log("== pseudo-file measurement: is a size-from-fstat cap a bound on the bytes read? ==")
    js = os.path.join(SCRATCH, "pseudo.mjs")
    with open(js, "w") as f:
        f.write(
            "import { openSync, fstatSync, readFileSync, closeSync, constants } from 'node:fs';\n"
            "import { createHash } from 'node:crypto';\n"
            "for (const p of process.argv.slice(2)) {\n"
            "  try {\n"
            "    const fd = openSync(p, constants.O_RDONLY | constants.O_NOFOLLOW | constants.O_NONBLOCK);\n"
            "    const st = fstatSync(fd);\n"
            "    const b = readFileSync(fd);\n"
            "    closeSync(fd);\n"
            "    console.log(JSON.stringify({p, isFile: st.isFile(), stSize: st.size, readBytes: b.length, exceedsCap: b.length > 16777216, sha: createHash('sha256').update(b).digest('hex')}));\n"
            "  } catch (e) { console.log(JSON.stringify({p, err: String(e && e.code || e)})); }\n"
            "}\n")
    targets = ["/proc/self/status", "/proc/self/maps", "/proc/self/smaps", "/proc/self/mountinfo",
               "/proc/self/environ", "/proc/self/cmdline", "/proc/self/limits",
               "/proc/self/task/1/status", "/sys/kernel/mm/transparent_hugepage/enabled",
               "/sys/devices/system/cpu/online", "/proc/version", "/proc/self/coredump_filter",
               "/proc/self/keys", "/proc/self/attr/current"]
    out = sh(["prlimit", f"--as={LIMIT}", "--", "timeout", "20", "node", js] + targets)
    for ln in out.stdout.strip().splitlines():
        log("  " + ln)
    log("")

    with open(os.path.join(SEAT, "candidate-battery.log"), "w") as f:
        f.write("\n".join(LINES) + "\n")


if __name__ == "__main__":
    main()
