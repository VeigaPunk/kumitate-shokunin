#!/usr/bin/env python3
"""K91Sentinel — DOUBLE REPRODUCTION of the size-from-fstat cap defect, with the exact
receipt bytes saved, plus a prototype of the smallest remediation validated against the
frozen probe.

Defect: the external branch's size bound comes from fstat's st_size. A procfs pseudo-file
is a regular file (S_ISREG) whose st_size is 0, so it passes both the type check and the
cap check, and is then read to EOF — past the declared 16777216 bound.
  /proc/kallsyms     content 22489015 bytes (> cap) -> tool returns CLEAN (a wrong verdict
                      for an over-cap regular file; the read exceeded the cap)
  /proc/self/pagemap content 274877906936 bytes (256 GiB) -> tool aborts, exit 133, NO
                      verdict line (the round-90 A4 /dev/zero failure mode, unrouted)
"""
import hashlib, os, shutil, subprocess, sys, time

SCRATCH = "/fast/scratch/hyaku/kumitate-r91/K91Sentinel"
SEAT = "/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-91/K91Sentinel"
RCPT_SEAT = os.path.join(SEAT, "receipts")
LANE_FIX = os.path.join(SCRATCH, "fixture-lane")
LIMIT = 2147483648
CAP = 16777216
LINES = []

REF = "/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-91/controls/ref-fd-fstat.mjs"
# The FIRST v5 candidate snapshot (sha256 33ee29eb) is preserved by the K91ExecInst seat; it
# predates the bounded-read edit and is the snapshot that exhibits the defect.
FIRST_CAND = "/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-91/K91ExecInst/receipt-bind-v5.mjs"
TOOLS = {
    "v4": os.path.join(SCRATCH, "tools", "v4.mjs"),
    "ref": REF,
    "cand1": FIRST_CAND,
    "cand": os.path.join(SCRATCH, "tools", "v5-candidate.mjs"),
    "fix": os.path.join(SCRATCH, "tools", "v5-bounded-read.mjs"),
}


def log(s=""):
    LINES.append(s)
    print(s, flush=True)


def sh(cmd):
    return subprocess.run(cmd, capture_output=True, text=True)


def rev():
    return sh(["git", "-C", LANE_FIX, "rev-parse", "HEAD"]).stdout.strip()


def write_receipt(name, r, cmd, digest):
    d = os.path.join(SCRATCH, "rcpt", name)
    shutil.rmtree(d, ignore_errors=True)
    os.makedirs(d)
    body = f"rev={r}\ntool_sha256={digest}\ncmd={cmd}\nexit=0\nsignal=none\n"
    with open(os.path.join(d, "a.txt"), "w") as f:
        f.write(body)
    shutil.copyfile(os.path.join(d, "a.txt"), os.path.join(RCPT_SEAT, name + ".txt"))
    return d, body


def run_tool(tool, d, r, timeout=20):
    cmd = ["prlimit", f"--as={LIMIT}", "--", "timeout", str(timeout), "node", tool,
           "--dir", d, "--rev", r, "--lane", LANE_FIX]
    t0 = time.time()
    try:
        p = subprocess.run(cmd, capture_output=True, text=True, timeout=timeout + 10, cwd=SCRATCH)
        rc, out, err = p.returncode, p.stdout.strip(), p.stderr.strip()
    except subprocess.TimeoutExpired:
        rc, out, err = "TIMEOUT", "", ""
    verdict = ""
    for ln in (out + "\n" + err).splitlines():
        if ln.startswith("RECEIPT_BIND:"):
            verdict = ln
            break
    if not verdict:
        verdict = out.splitlines()[-1] if out else (err.splitlines()[-1] if err else "(none)")
    return {"cmd": " ".join(cmd), "rc": rc, "verdict": verdict, "out": out, "err": err[:900],
            "wall": round(time.time() - t0, 2)}


def save(name, res, extra=""):
    p = os.path.join(RCPT_SEAT, name + ".txt")
    with open(p, "w") as f:
        f.write(f"### command\n{res['cmd']}\n### exit\n{res['rc']}\n### wall_s\n{res['wall']}\n")
        f.write(f"### verdict\n{res['verdict']}\n### stdout\n{res['out']}\n### stderr\n{res['err']}\n")
        if extra:
            f.write(extra)
    return p


def build_fix():
    """Smallest remediation: bound the READ by bytes actually read, not by st_size.
    Read at most CAP+1 bytes from the descriptor; if more than CAP bytes are available,
    refuse as UNRESOLVED. Preserves: exactly-CAP binds, empty binds."""
    src = open(REF).read()
    old = ("          bytes = readFileSync(xfd);\n")
    new = ("          // Bounded read: the cap must bound the BYTES READ, not st_size — a\n"
           "          // procfs/sysfs pseudo-file is a regular file whose st_size is 0 but\n"
           "          // whose content can exceed the cap. Read at most CAP+1 bytes and refuse\n"
           "          // if more than CAP are available.\n"
           "          const CAPB = 16777216;\n"
           "          const chunks = [];\n"
           "          let total = 0;\n"
           "          const buf = Buffer.alloc(1 << 20);\n"
           "          for (;;) {\n"
           "            const n = readSync(xfd, buf, 0, buf.length, null);\n"
           "            if (n === 0) break;\n"
           "            total += n;\n"
           "            if (total > CAPB) throw new FailClosed('UNRESOLVED', `${file} external instrument too large: ${abs}`);\n"
           "            chunks.push(Buffer.from(buf.subarray(0, n)));\n"
           "          }\n"
           "          bytes = Buffer.concat(chunks, total);\n")
    assert old in src, "anchor not found"
    src = src.replace(old, new)
    src = src.replace("  closeSync, constants as fsConstants, existsSync, fstatSync, lstatSync, mkdirSync, mkdtempSync,\n"
                      "  openSync, readFileSync, readdirSync, realpathSync, rmSync, symlinkSync, writeFileSync, writeSync,\n",
                      "  closeSync, constants as fsConstants, existsSync, fstatSync, lstatSync, mkdirSync, mkdtempSync,\n"
                      "  openSync, readFileSync, readdirSync, readSync, realpathSync, rmSync, symlinkSync, writeFileSync, writeSync,\n")
    assert "readSync," in src, "import not patched"
    out = os.path.join(SCRATCH, "tools", "v5-bounded-read.mjs")
    with open(out, "w") as f:
        f.write(src)
    return out


def main():
    os.makedirs(RCPT_SEAT, exist_ok=True)
    r = rev()
    log(f"fixture rev {r}")
    log(f"cap {CAP}")
    log("")

    # ---------- build the remediation prototype ----------
    fix = build_fix()
    log(f"remediation prototype: {fix} sha256={hashlib.sha256(open(fix,'rb').read()).hexdigest()}")
    log("")

    # ---------- DOUBLE REPRODUCTION ----------
    log("=== REPRO 1: /proc/kallsyms — external regular file, content 22489015 bytes > cap ===")
    with open("/proc/kallsyms", "rb") as f:
        content = f.read()
    digest = hashlib.sha256(content).hexdigest()
    log(f"  content_bytes={len(content)} over_cap={len(content) > CAP} sha256={digest}")
    for rep in (1, 2):
        d, body = write_receipt("R1.kallsyms", r, "node /proc/kallsyms", digest)
        log(f"  --- reproduction {rep} --- receipt bytes:")
        for ln in body.rstrip("\n").split("\n"):
            log(f"      {ln}")
        for k in ("v4", "ref", "cand1", "cand", "fix"):
            res = run_tool(TOOLS[k], d, r)
            save(f"R1.kallsyms.{k}.rep{rep}", res)
            log(f"      {k:5s} exit={res['rc']} wall={res['wall']}s :: {res['verdict']}")
    log("")

    log("=== REPRO 2: /proc/self/pagemap — external regular file, content 274877906936 bytes ===")
    for rep in (1, 2):
        d, body = write_receipt("R2.pagemap", r, "node /proc/self/pagemap", "0" * 64)
        log(f"  --- reproduction {rep} --- receipt bytes:")
        for ln in body.rstrip("\n").split("\n"):
            log(f"      {ln}")
        for k in ("v4", "ref", "cand1", "cand", "fix"):
            res = run_tool(TOOLS[k], d, r)
            save(f"R2.pagemap.{k}.rep{rep}", res)
            log(f"      {k:5s} exit={res['rc']} wall={res['wall']}s :: {res['verdict']}")
    log("")

    # ---------- does the prototype preserve the declared twins? ----------
    log("=== prototype check: the declared positive twins must still bind ===")
    EXT = os.path.join(SCRATCH, "ext")
    os.makedirs(EXT, exist_ok=True)
    cases = []
    atcap = os.path.join(EXT, "fix-atcap.bin")
    if not os.path.exists(atcap) or os.path.getsize(atcap) != CAP:
        with open(atcap, "wb") as f:
            f.truncate(CAP)
    cases.append(("at-cap (16777216)", atcap))
    overcap = os.path.join(EXT, "fix-overcap.bin")
    if not os.path.exists(overcap) or os.path.getsize(overcap) != CAP + 1:
        with open(overcap, "wb") as f:
            f.truncate(CAP + 1)
    cases.append(("over-cap (16777217)", overcap))
    emptyf = os.path.join(EXT, "fix-empty.bin")
    open(emptyf, "wb").close()
    cases.append(("empty", emptyf))
    for label, path in cases:
        with open(path, "rb") as f:
            h = hashlib.sha256(f.read()).hexdigest()
        d, _ = write_receipt("FIX." + label.split()[0], r, "bash " + path, h)
        out = []
        for k in ("ref", "fix"):
            res = run_tool(TOOLS[k], d, r)
            save(f"FIX.{label.split()[0]}.{k}", res)
            out.append(f"{k}={res['verdict'].split(': ',1)[-1]}")
        log(f"  {label:22s} {' | '.join(out)}")
    log("")

    with open(os.path.join(SEAT, "reproduce.log"), "w") as f:
        f.write("\n".join(LINES) + "\n")


if __name__ == "__main__":
    main()
