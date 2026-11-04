# Rationale: why --no-hardlinks is required for immutable pinned clones
Local filesystem cloning shares object files via filesystem hardlinks when --no-hardlinks is omitted.
Hardlink sharing couples the pinned clone's repository storage directly to the live origin repository.
Upstream maintenance operations such as git gc, git repack, or object pruning would mutate or uncouple the pin's object store.
Using --no-hardlinks guarantees isolated immutable storage as documented in git-clone (S223: https://git-scm.com/docs/git-clone).
