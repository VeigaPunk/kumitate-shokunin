Measured source: `31c465f15669f744848bd9f5d56191c5085670f7`, `scripts/lean-cargo/bin/cargo-shim.sh`.

- Check21#156: `:128-135` defines `lean_frozen_cache_digest` and derives its key from Cargo.lock/Cargo.toml sizes and mtimes. At `:143-175`, a matching successful cache entry skips preflight (TTL defaults to `0`) and enables `--frozen`/offline. This supports wording that the helper supplies a stat-based cached-preflight key and a matching success skips revalidation; it does not support a no-network-needed-workspace guarantee.
- Check21#157: `:208-219` contains the slot-age cleanup comment, the 720-minute default cutoff, the age/lock predicate, and the `rm -rf` action. This range supports the reap claim; `:210` alone only computes the cutoff.
