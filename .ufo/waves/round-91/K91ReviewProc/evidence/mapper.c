/* mapper.c — child that creates N anonymous mappings (touched nowhere) then SIGSTOPs itself,
 * so /proc/<pid>/smaps has ~N blocks while st_size stays 0. Prints its pid, flushes, stops. */
#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>
#include <signal.h>
#include <sys/mman.h>

int main(int argc, char **argv) {
  long n = (argc > 1) ? atol(argv[1]) : 50000L;
  long made = 0;
  for (long i = 0; i < n; i++) {
    /* Alternate protection so the kernel cannot merge adjacent VMAs (merging collapsed
     * identical anon mappings to one VMA and shrank smaps to ~30 blocks). */
    int prot = (i & 1) ? (PROT_READ | PROT_WRITE) : PROT_READ;
    void *p = mmap(NULL, 4096, prot,
                   MAP_PRIVATE | MAP_ANONYMOUS | MAP_NORESERVE, -1, 0);
    if (p == MAP_FAILED) {
      fprintf(stderr, "mmap failed at %ld\n", i);
      break;
    }
    made++;
  }
  fprintf(stderr, "mappings=%ld\n", made);
  printf("%d\n", (int)getpid());
  fflush(stdout);
  kill(getpid(), SIGSTOP); /* park stopped; parent reads /proc/<pid>/smaps, then SIGKILLs */
  return 0;
}
