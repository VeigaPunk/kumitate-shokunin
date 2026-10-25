# RevPins — round 59 / w1

Item: confirm `.ufo/pins/readme-map.json` `covered` contains `lessons/round-58-verifier-spotcheck.md`, `lessons/round-59.md`, and `knowledge/mcp-orchestration-contract.md`, and that those three files exist. Quote the three pin lines. Axes: operability, coverage. Date: 2026-10-24.

**Item result: CORROBORATED.** This is not a claim verdict. It does not attest REPAIR59 or DOCTRINE59.

## Pin lines

From `git cat-file -p 5469c0a58d7986ff8a5f203938ae1c8785a92213:.ufo/pins/readme-map.json | nl -ba`, the only three hits (`06-pin-lines-nl.txt`):

```text
    30	    "knowledge/mcp-orchestration-contract.md",
   136	    "lessons/round-58-verifier-spotcheck.md",
   138	    "lessons/round-59.md",
```

Raw lines, indent and trailing comma included:

```text
    "knowledge/mcp-orchestration-contract.md",
    "lessons/round-58-verifier-spotcheck.md",
    "lessons/round-59.md",
```

## Membership

Parsed `covered` of that blob (`04-membership.txt`, `08-indexes.txt`):

```text
version=2
covered_type=list
covered_len=141
unique=141
dups=[]
lessons/round-58-verifier-spotcheck.md indexes=[132] count=1
lessons/round-59.md indexes=[134] count=1
knowledge/mcp-orchestration-contract.md indexes=[26] count=1
```

Each wanted string is an exact member once. `substring_other=[]` and `endswith_other=[]` for all three, so none is only a substring of a longer pin. `lessons/round-58.md` is a separate member and is not the spotcheck line. Keys are only `covered` and `version`.

## Files exist

The pin paths are corpus-relative (`knowledge/` or `lessons/`). The files that exist are the `corpus/` joins. Each is a regular file at the score revision and in the worktree, and the worktree blob id equals the score-rev blob id (`07-file-identity.txt`, `09-hash-object.txt`).

```text
100644 blob fd64c0f5ef1e5db9ef0ac7b7cf3c717fefbdf934	corpus/lessons/round-58-verifier-spotcheck.md
mode=81a4 type=regular file size=24555 links=1
equal hash-object=fd64c0f5ef1e5db9ef0ac7b7cf3c717fefbdf934 rev-parse=fd64c0f5ef1e5db9ef0ac7b7cf3c717fefbdf934
sha256 fd302d1ea4fdc1d84ec033d50652fbc8870ca65e28e60bd68fc9d5f20de64aa4

100644 blob a7e14c72450f67e913db34d4b24665db08bf6e03	corpus/lessons/round-59.md
mode=81a4 type=regular file size=5182 links=1
equal hash-object=a7e14c72450f67e913db34d4b24665db08bf6e03 rev-parse=a7e14c72450f67e913db34d4b24665db08bf6e03
sha256 8ce1bb64701c04123628dad7146aaf1058e219f599fa45445ac3898be5da1133

100644 blob f84a4b5d6dc0f8d07f08ce20ef776a8bdbb52a6b	corpus/knowledge/mcp-orchestration-contract.md
mode=81a4 type=regular file size=4452 links=1
equal hash-object=f84a4b5d6dc0f8d07f08ce20ef776a8bdbb52a6b rev-parse=f84a4b5d6dc0f8d07f08ce20ef776a8bdbb52a6b
sha256 a9c11099d665df26ccb223acd74170c54f3cf91363b3e400d95f5c51c26f3797
```

None of the three is a symlink (`islink=False`, mode `100644`).

## Attack

Bare repo-root paths do not exist, and that does not falsify the item. `git cat-file -t` on `lessons/round-58-verifier-spotcheck.md`, `lessons/round-59.md`, and `knowledge/mcp-orchestration-contract.md` (no `corpus/` prefix) exited 128 with `fatal: path '…' does not exist in '5469c0a58d7986ff8a5f203938ae1c8785a92213'`. The registry stores those strings as corpus-relative covered members; the files are under `corpus/`. `corpus/knowledge/lessons/round-59.md` is also absent (exit 128). No duplicate covered member, no substring-only hit, no symlink, no empty file.

## Revision binding

This item does not name the base. Measured revision is `5469c0a58d7986ff8a5f203938ae1c8785a92213`. Captured `2026-10-24T21:35:08-03:00` (`00-identity.txt`):

```text
head=5469c0a58d7986ff8a5f203938ae1c8785a92213
score=5469c0a58d7986ff8a5f203938ae1c8785a92213
ancestor_exit=0
pin_type=blob
pin_blob=fe99a22939a56e8143b1953d913289975d579b75
worktree_hash=fe99a22939a56e8143b1953d913289975d579b75
```

`git status --porcelain --untracked-files=all` on the pin and the three corpus files printed nothing (`status_exit=0`). `git diff --stat` of those paths against the score revision printed nothing (`diff_exit=0`). Pin sha256: `cd61cbdf0b9f798351e6670c5ddb350b2cd6ad45e9fec2a547d94538b7f17649`. HEAD was not moved.

## Evidence and scope

Captures are under `.ufo/waves/round-59/build/RevPins/`. `commands.md` is the command index. Primary captures: `03-pin-at-rev.json`, `04-membership.txt`, `06-pin-lines-nl.txt`, `07-file-identity.txt`, `09-hash-object.txt`.

This seat did not run `readme-map.mjs`, `repair59-probe.mjs`, or `doctrine59-probe.mjs`. No production file, pin, corpus file, lane ledger, jj state, or Git index was changed. Writes were confined to this report and `build/RevPins/`. No install, pacman transaction, commit, push, or mutating git/jj command was used.

Report: .ufo/waves/round-59/w1/RevPins.md
