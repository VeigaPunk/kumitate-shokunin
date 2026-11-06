#!/usr/bin/env python3
"""K93Sentinel — GH013 pre-check over this seat dir: unexplained credential-shaped bytes.

Flags ONLY tokens that look like secrets: a known credential prefix, a JWT, a PEM header, a Bearer
token, or a mixed-case+digit high-entropy run. Benign shapes are whitelisted and counted separately:
sha256/hex digests, snake_case identifiers, CamelCase identifiers, all-lowercase model slugs, and
the transcript path segment (timestamp + UUID). Prints file/line/class counts, never the text.
"""
import os, re, sys

SEAT = "/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-93/K93Sentinel"
RUN24 = re.compile(r"[A-Za-z0-9_-]{24,}")
PREFIX = re.compile(
    r"(?:^|[^A-Za-z0-9])(sk-[A-Za-z0-9_-]{8,}|sk_live_[A-Za-z0-9]{8,}|"
    r"gh[pousr]_[A-Za-z0-9]{20,}|github_pat_[A-Za-z0-9_]{20,}|"
    r"xox[abprs]-[A-Za-z0-9-]{8,}|AKIA[0-9A-Z]{16}|ASIA[0-9A-Z]{16}|"
    r"AIza[0-9A-Za-z_-]{20,}|glpat-[A-Za-z0-9_-]{16,}|hf_[A-Za-z0-9]{20,}|"
    r"pypi-[A-Za-z0-9_-]{20,}|npm_[A-Za-z0-9]{20,})")
JWT = re.compile(r"^[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}$")
PEM = re.compile(r"-----BEGIN [A-Z ]+-----")
BEARER = re.compile(r"(?i)\bbearer\s+\S{8,}")
HEX = re.compile(r"^[0-9a-fA-F]+$")
SNAKE = re.compile(r"^[a-z_]+$")
UPPER = re.compile(r"^[A-Z_]+$")
CAMEL = re.compile(r"^[A-Z][a-z0-9]*([A-Z][a-z0-9]*)+$")
SLUG = re.compile(r"^[a-z0-9][a-z0-9._-]*$")
PATHSEG = re.compile(r"^[0-9]{4}-[0-9]{2}-[0-9]{2}T.*Z_[0-9a-f-]+$")


def benign(t):
    return bool(HEX.match(t) or SNAKE.match(t) or UPPER.match(t) or CAMEL.match(t)
                or SLUG.match(t) or PATHSEG.match(t))


def main():
    unexplained, benign_n = [], 0
    for dirpath, dirnames, filenames in os.walk(SEAT):
        for fn in sorted(filenames):
            p = os.path.join(dirpath, fn)
            try:
                lines = open(p, errors="replace").read().splitlines()
            except OSError:
                continue
            for i, line in enumerate(lines, 1):
                for name, rx in (("prefix", PREFIX), ("pem", PEM), ("bearer", BEARER)):
                    if rx.search(line):
                        unexplained.append((os.path.relpath(p, SEAT), i, name))
                if JWT.match(line.strip()):
                    unexplained.append((os.path.relpath(p, SEAT), i, "jwt"))
                for m in RUN24.finditer(line):
                    t = m.group(0)
                    if benign(t):
                        benign_n += 1
                        continue
                    # mixed-case + digits and no separators: entropy-ish, flag it
                    if any(c.isupper() for c in t) and any(c.islower() for c in t) \
                            and any(c.isdigit() for c in t):
                        unexplained.append((os.path.relpath(p, SEAT), i, "mixedcase_run"))
                    else:
                        benign_n += 1
    print(f"seat_dir={SEAT}")
    print(f"benign_run24_tokens={benign_n} unexplained={len(unexplained)}")
    for u in unexplained[:20]:
        print(f"  {u[0]}:{u[1]} class={u[2]}")
    return 0 if not unexplained else 1


if __name__ == "__main__":
    sys.exit(main())
