# k15-receipt-symlink

the round-9 tip receipt is a symlink to a file outside the lane tree (uncommitted, unaudited); readFileSync follows it, so the false 3/3 is "receipted".

expect: 1 / RECEIPT_MISSING,TALLY_UNRECEIPTED
