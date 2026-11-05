#!/usr/bin/env python3
"""K91Sentinel supplementary probes: node readFileSync(fd) semantics on pseudo-files,
hardlinked device nodes, and the empty/at-cap digest binding."""
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
        verdict = (out.splitlines()[-1] if out else (err.splitlines()[-1] if err else "(none)"))
    res = {"cmd": " ".join(cmd), "rc": rc, "verdict": verdict, "out": out, "err": err[:600],
           "wall": round(time.time() - t0, 2)}
    return res


def save(name, res):
    p = os.path.join(RCPT_SEAT, name + ".txt")
    with open(p, "w") as f:
        f.write(f"### command\n{res['cmd']}\n### exit\n{res['rc']}\n### wall_s\n{res['wall']}\n")
        f.write(f"### verdict\n{res['verdict']}\n### stdout\n{res['out']}\n### stderr\n{res['err']}\n")
    return p


def show(cid, label, klass, r4, rr, note=""):
    log(f"{cid} | {label} | class={klass}")
    log(f"  v4  exit={r4['rc']} wall={r4['wall']}s :: {r4['verdict']}")
    log(f"  ref exit={rr['rc']} wall={rr['wall']}s :: {rr['verdict']}")
    if note:
        log(f"  {note}")


def main():
    rev = sh(["git", "-C", LANE_FIX, "rev-parse", "HEAD"]).stdout.strip()
    v4 = os.path.join(SCRATCH, "tools", "v4.mjs")
    ref = "/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-91/controls/ref-fd-fstat.mjs"

    # P1: node readFileSync(fd) semantics on a st_size==0 pseudo-file vs path read.
    log("== P1: node readFileSync(fd) on st_size==0 pseudo-files ==")
    js = os.path.join(SCRATCH, "p1.mjs")
    with open(js, "w") as f:
        f.write(
            "import { openSync, fstatSync, readFileSync, closeSync, constants } from 'node:fs';\n"
            "for (const p of ['/proc/self/status', '/proc/self/cmdline', '/sys/kernel/mm/transparent_hugepage/enabled']) {\n"
            "  try {\n"
            "    const fd = openSync(p, constants.O_RDONLY | constants.O_NOFOLLOW | constants.O_NONBLOCK);\n"
            "    const st = fstatSync(fd);\n"
            "    const b = readFileSync(fd);\n"
            "    closeSync(fd);\n"
            "    const pb = readFileSync(p);\n"
            "    console.log(JSON.stringify({p, isFile: st.isFile(), size: st.size, fdBytes: b.length, pathBytes: pb.length, shaFd: b.length ? 'x' : require('node:crypto').createHash('sha256').update(b).digest('hex')}));\n"
            "  } catch (e) { console.log(JSON.stringify({p, err: String(e && e.code || e)})); }\n"
            "}\n")
    # rewrite without require() (ESM)
    with open(js, "w") as f:
        f.write(
            "import { openSync, fstatSync, readFileSync, closeSync, constants } from 'node:fs';\n"
            "import { createHash } from 'node:crypto';\n"
            "for (const p of ['/proc/self/status', '/proc/self/cmdline', '/sys/kernel/mm/transparent_hugepage/enabled']) {\n"
            "  try {\n"
            "    const fd = openSync(p, constants.O_RDONLY | constants.O_NOFOLLOW | constants.O_NONBLOCK);\n"
            "    const st = fstatSync(fd);\n"
            "    const b = readFileSync(fd);\n"
            "    closeSync(fd);\n"
            "    let pb = -1; try { pb = readFileSync(p).length; } catch (e) { pb = -2; }\n"
            "    console.log(JSON.stringify({p, isFile: st.isFile(), size: st.size, fdBytes: b.length, pathBytes: pb, shaFd: createHash('sha256').update(b).digest('hex')}));\n"
            "  } catch (e) { console.log(JSON.stringify({p, err: String(e && e.code || e)})); }\n"
            "}\n")
    p1 = sh(["prlimit", f"--as={LIMIT}", "--", "timeout", "20", "node", js])
    log(p1.stdout.strip())
    log(p1.stderr.strip()[:400])
    log("")

    # P2: hardlink to /dev/zero — a char device with NO /dev/ spelling (plan: NOT claimed)
    hl = os.path.join(EXT, "zeronode")
    if os.path.lexists(hl):
        os.unlink(hl)
    try:
        os.link("/dev/zero", hl)
        ok = True
    except OSError as e:
        ok = False
        log(f"P2: cannot hardlink /dev/zero: {e}")
    if ok:
        d = write_receipt("P2", rev, "node " + hl, "0" * 64)
        r4, rr = run_tool(v4, d, rev), run_tool(ref, d, rev)
        save("P2.v4", r4)
        save("P2.ref", rr)
        show("P2", "char device hardlinked outside /dev (no /dev/ spelling)", "OUT-of-CLASS (plan excludes)", r4, rr)

    # P3: empty external regular file — declared class "empty binds as before (CLEAN external=1)"
    ef = os.path.join(EXT, "empty2.bin")
    open(ef, "wb").close()
    d = write_receipt("P3", rev, "node " + ef, EMPTY_SHA)
    r4, rr = run_tool(v4, d, rev), run_tool(ref, d, rev)
    save("P3.v4", r4)
    save("P3.ref", rr)
    show("P3", "external empty regular file, declared digest sha256(empty)", "IN-CLASS empty regular", r4, rr)

    # P4: at-cap external regular file — declared class "exactly 16777216 binds as before"
    ac = os.path.join(EXT, "atcap2.bin")
    if not os.path.exists(ac) or os.path.getsize(ac) != 16777216:
        with open(ac, "wb") as f:
            f.truncate(16777216)
    d = write_receipt("P4", rev, "node " + ac, sha_file(ac))
    r4, rr = run_tool(v4, d, rev), run_tool(ref, d, rev)
    save("P4.v4", r4)
    save("P4.ref", rr)
    show("P4", "external regular file exactly at 16777216, correct digest", "IN-CLASS at-cap regular", r4, rr)

    # P5: over-cap external regular file — declared class "FAIL-CLOSED UNRESOLVED even with correct digest"
    oc = os.path.join(EXT, "overcap2.bin")
    if not os.path.exists(oc) or os.path.getsize(oc) != 16777217:
        with open(oc, "wb") as f:
            f.truncate(16777217)
    d = write_receipt("P5", rev, "node " + oc, sha_file(oc))
    r4, rr = run_tool(v4, d, rev), run_tool(ref, d, rev)
    save("P5.v4", r4)
    save("P5.ref", rr)
    show("P5", "external regular file 16777217 bytes, CORRECT digest", "IN-CLASS over-cap regular", r4, rr)

    # P6: /proc/self/status as an external instrument with the digest the ref computes
    d = write_receipt("P6", rev, "node /proc/self/status", EMPTY_SHA)
    r4, rr = run_tool(v4, d, rev), run_tool(ref, d, rev)
    save("P6.v4", r4)
    save("P6.ref", rr)
    show("P6", "external /proc/self/status (st_size 0) with sha256(empty)", "OUT-of-CLASS (pseudo-file; ReviewProc seat)", r4, rr)

    # P7: does the ref bound the read by fstat size? grow a file between fstat and read is a race;
    #     instead check a regular file whose st_size is under the cap but whose CONTENT is larger
    #     via a sparse-then-written file — size is authoritative, so this must still bind.
    #     Instead: check that the ref's cap check uses fstat (descriptor) size, not path size.
    #     Do a direct fd-level experiment.
    js2 = os.path.join(SCRATCH, "p7.mjs")
    with open(js2, "w") as f:
        f.write(
            "import { openSync, fstatSync, closeSync, constants } from 'node:fs';\n"
            "const p = process.argv[2];\n"
            "const fd = openSync(p, constants.O_RDONLY | constants.O_NOFOLLOW | constants.O_NONBLOCK);\n"
            "const st = fstatSync(fd);\n"
            "console.log(JSON.stringify({path: p, isFile: st.isFile(), isFifo: st.isFIFO(), isChr: st.isCharacterDevice(), isDir: st.isDirectory(), isSock: st.isSocket(), size: st.size}));\n"
            "closeSync(fd);\n")
    for target, lbl in [("/dev/zero", "char device"), ("/dev/null", "char device (empty)"),
                        (os.path.join(EXT, "fifo2"), "fifo"), (EXT, "directory"),
                        ("/proc/self/status", "proc pseudo-file"), ("/proc/self/fd/1", "proc fd symlink"),
                        ("/dev/stdin", "symlink to fd")]:
        if "fifo2" in target:
            if os.path.exists(target):
                os.unlink(target)
            os.mkfifo(target)
        out = sh(["prlimit", f"--as={LIMIT}", "--", "timeout", "20", "node", js2, target])
        log(f"P7 fstat {lbl:24s} {target}: {out.stdout.strip()}{out.stderr.strip()[:120]}")
    log("")

    with open(os.path.join(SEAT, "probes.log"), "w") as f:
        f.write("\n".join(LINES) + "\n")


if __name__ == "__main__":
    main()
