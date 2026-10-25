# k1-tally-spaced-eq

claims held = 3 / 3 (spaces) while the receipt says 1/3; TALLY needs `held=x/y` adjacent, so the claim is never parsed.

expect: 1 / TALLY_UNRECEIPTED
