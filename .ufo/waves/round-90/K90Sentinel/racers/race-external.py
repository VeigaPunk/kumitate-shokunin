import os
import sys

# Flip <path> between a regular file (hardlink of <reg>) and a symlink to <other>, forever,
# until <stop> exists. Used to probe the lstat -> readFileSync window of an external instrument.
path, other, reg, stop = sys.argv[1:5]
i = 0
while not os.path.exists(stop):
    i += 1
    t = f"{path}.s{i}"
    os.symlink(other, t)
    os.rename(t, path)
    t = f"{path}.r{i}"
    os.link(reg, t)
    os.rename(t, path)
