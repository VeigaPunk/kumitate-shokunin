python3 -c 'import os, stat, json, collections, datetime
root = "/home/vgpnk/Projects/shokunin/kumitate-shokunin"
prefix = ".ufo/waves/round-58/build/"
exts = (".mjs", ".js", ".sh", ".py")
total = build = other = 0
seats = collections.Counter()
started = datetime.datetime.now(datetime.timezone.utc).isoformat()
for directory, dirs, files in os.walk(root):
    dirs[:] = [name for name in dirs if name != ".git"]
    for name in files:
        if not name.endswith(exts):
            continue
        path = os.path.join(directory, name)
        try:
            if not stat.S_ISREG(os.lstat(path).st_mode):
                continue
        except FileNotFoundError:
            continue
        rel = os.path.relpath(path, root)
        total += 1
        if rel.startswith(prefix):
            build += 1
            seats[rel.split("/")[4]] += 1
        else:
            other += 1
finished = datetime.datetime.now(datetime.timezone.utc).isoformat()
print(json.dumps({"started_utc": started, "finished_utc": finished, "total_runnable": total, "round58_build_runnable": build, "outside_round58_build": other, "build_by_seat": dict(sorted(seats.items()))}, indent=2))'
