# The runner reaps its process group — proven by killing a run

CMOS learning `#656`: the capture Derek stopped on 2026-09-16 left an orphaned `vitest` worker at
PPID 1 burning 72% CPU for at least 26 minutes. The review found it only by looking, and killing it
dropped host load from 32 to 14.6.

## Why no handler could have helped

The runner used `spawnSync`, which **blocks the event loop**. A registered SIGTERM handler is a JS
callback; it cannot run while `spawnSync` holds the thread. No amount of handler registration would
have reaped anything — the fix had to be structural.

Each suite now runs `detached` in its own process group and is `await`ed, so a handler *can* run:
SIGINT / SIGTERM / SIGHUP call `process.kill(-pid, 'SIGTERM')` on the whole group, then SIGKILL
insists after two seconds.

## SIGTERM — measured

Runner PID 25827, killed at `04:28:21Z` while a `vitest` tree was running beneath it. The kill
landed during the tripwire's `near-md-readers` check, which proves reaping through **two** levels:
the runner's detached child was the tripwire, and the `vitest` processes were the tripwire's own
children.

```
BEFORE KILL: 3 vitest processes
AFTER 6s:    0 vitest processes, runner alive=0
orphans at PPID 1 matching vitest/capture/tripwire: none
```

The runner's own last words, in [sigterm-run.log](sigterm-run.log):

```
capture: SIGTERM received; reaped the running suite's process group
```

## What is still not covered

`SIGKILL` to the runner itself cannot be handled by any process, so a `kill -9` will still strand
children. That is a property of the signal, not of this runner, and it is stated rather than papered
over. The operational remedy is unchanged and belongs with learning `#656`: before trusting any
timing-sensitive measurement, check for orphans with `pgrep -fl vitest` — PPID 1 means orphan.

## An unplanned finding, worth keeping

The second proof run refused to start its suites at all, and it was right to. A log file this
mission had just copied into `artifacts/` was untracked, so `cleanAfterSetup.clean` was false and
the runner stopped before the tripwire. Setup had exited 0 on all four steps.

The capture will not run on a dirty tree — including dirt the capture's own author just created.
Commit or remove stray files before starting one.
