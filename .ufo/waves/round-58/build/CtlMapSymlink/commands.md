## 01-clone

```console
$ git clone --no-hardlinks file:///home/vgpnk/Projects/shokunin/kumitate-shokunin /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-58/build/CtlMapSymlink/lane
```

Exit: `0`.

## 02-checkout-r1

```console
$ git -C /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-58/build/CtlMapSymlink/lane checkout --detach 6affb9ebde37b7d663658f1959d64f0f0b68f480
```

Exit: `0`.

## 03-revision

```console
$ git -C /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-58/build/CtlMapSymlink/lane rev-parse HEAD
```

Exit: `0`.

## 04-select-covered

```console
$ node -e $'\nconst fs = require("node:fs");\nconst path = require("node:path");\nconst registry = JSON.parse(fs.readFileSync(process.argv[1], "utf8"));\nconst member = registry.covered[0];\nif (registry.version !== 2 || typeof member !== "string") throw new Error("no v2 covered member");\nconst full = path.join(process.argv[2], "corpus", member);\nif (!fs.lstatSync(full).isFile()) throw new Error("selected member is not initially a regular file");\nif (fs.existsSync(path.join(path.dirname(full), "__CtlMapSymlink_r58_missing_target__"))) throw new Error("intended target already exists");\nprocess.stdout.write(member + "\\n");\n' /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-58/build/CtlMapSymlink/lane/.ufo/pins/readme-map.json /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-58/build/CtlMapSymlink/lane
```

Exit: `0`.

## 05-gate-clean

```console
$ node /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-58/build/CtlMapSymlink/lane/scripts/readme-map.mjs
```

Exit: `0`.

## 06-remove-covered

```console
$ rm -- /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-58/build/CtlMapSymlink/lane/corpus/knowledge/agent-isolation-substrates.md
```

Exit: `0`.

## 07-dangling-symlink

```console
$ ln -s -- __CtlMapSymlink_r58_missing_target__ /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-58/build/CtlMapSymlink/lane/corpus/knowledge/agent-isolation-substrates.md
```

Exit: `0`.

## 08-inspect-symlink

```console
$ node -e $'\nconst fs = require("node:fs");\nconst full = process.argv[1];\nconst lst = fs.lstatSync(full);\nprocess.stdout.write(JSON.stringify({ member: process.argv[2], isSymbolicLink: lst.isSymbolicLink(), target: fs.readlinkSync(full), targetExists: fs.existsSync(full) }) + "\\n");\nif (!lst.isSymbolicLink() || fs.existsSync(full)) process.exit(1);\n' /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-58/build/CtlMapSymlink/lane/corpus/knowledge/agent-isolation-substrates.md knowledge/agent-isolation-substrates.md
```

Exit: `0`.

## 09-gate-dangling

```console
$ node /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-58/build/CtlMapSymlink/lane/scripts/readme-map.mjs
```

Exit: `1`.

## 10-status

```console
$ git -C /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-58/build/CtlMapSymlink/lane status --short -- corpus/knowledge/agent-isolation-substrates.md
```

Exit: `0`.

## 11-diff

```console
$ git -C /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-58/build/CtlMapSymlink/lane diff --no-ext-diff -- corpus/knowledge/agent-isolation-substrates.md
```

Exit: `0`.

