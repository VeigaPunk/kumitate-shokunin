import html, re, sys

src = "/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-63/build/K63Capture/arxiv-2512.08296v3.html"
dst = "/tmp/kumitate-r63/K63ReviewQuotes/norm.txt"

raw = open(src, encoding="utf-8", errors="replace").read()
# capture provenance markers before stripping
head = raw[:2000]
t = raw
t = re.sub(r"<(script|style|head)\b.*?</\1>", " ", t, flags=re.S | re.I)
# block boundaries -> newlines
t = re.sub(r"</(p|div|h[1-6]|li|tr|table|figcaption|section|blockquote)>", "\n", t, flags=re.I)
t = re.sub(r"<(br|hr)\s*/?>", "\n", t, flags=re.I)
t = re.sub(r"</t[dh]>", " | ", t, flags=re.I)
# strip remaining tags
t = re.sub(r"<[^>]+>", "", t)
t = html.unescape(t)
# normalize unicode minus/dashes and special dots for greppability, keep original too
lines = []
for ln in t.split("\n"):
    ln = re.sub(r"\s+", " ", ln).strip()
    if ln:
        lines.append(ln)
out = "\n".join(lines) + "\n"
open(dst, "w", encoding="utf-8").write(out)
print("lines:", len(lines))
print("bytes:", len(out.encode("utf-8")))
print("head marker:", [s for s in re.findall(r"arXiv:2512\.08296v\d[^\n<]*", head)][:1])
