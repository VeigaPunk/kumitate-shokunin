import os
import sys

# Flip <path> between a regular receipt (hardlink of <reg>) and a FIFO (hardlink of <fifo>), forever,
# until <stop> exists. Probes the lstat -> open window of a receipt.
path, reg, fifo, stop = sys.argv[1:5]
i = 0
while not os.path.exists(stop):
    i += 1
    t = f"{path}.f{i}"
    os.link(fifo, t)
    os.rename(t, path)
    t = f"{path}.r{i}"
    os.link(reg, t)
    os.rename(t, path)
