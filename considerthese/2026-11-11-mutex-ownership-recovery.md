# Kumitate: an error can transfer lock ownership

[Issue 6](https://pubs.opengroup.org/onlinepubs/009695399/functions/pthread_mutex_lock.html) describes successful mutex locking as returning zero. [Issue 7, 2018 edition](https://pubs.opengroup.org/onlinepubs/9699919799/functions/pthread_mutex_lock.html) retains that summary but explicitly allows EOWNERDEAD with an acquired robust mutex. Its history records incorporation of the 2006 Extended API Set.

The [consistency operation](https://pubs.opengroup.org/onlinepubs/9699919799/functions/pthread_mutex_consistent.html), first released in Issue 7, acknowledges recovery; it does not repair application state. Unlocking an inconsistent mutex without that acknowledgment makes subsequent acquisition fail with ENOTRECOVERABLE.

Kumitate inference: record the returned condition, resource ownership and repair obligation separately. Treating every nonzero result as failed acquisition can miss a held resource; treating acquired ownership as healthy state can expose unfinished work.

These standards specify a local synchronization contract, not a distributed recovery protocol or measured host behavior. Implementation priority and broader redistribution rights are unestablished. Original commentary only; no code copied, runtime test, training or assimilation.

Destination: VeigaPunk/kumitate-shokunin, master, considerthese/2026-11-11-mutex-ownership-recovery.md.
