# Sprint 195 final five-suite capture (attempt 2)

The existing runner completed all five default suites at `6e779776a7efa3b6e7b26a12966f0c4186dba1d6` on 2026-09-12, from 2026-09-12T01:52:26.745154+00:00 to 2026-09-12T02:10:56.769720+00:00, with process exit 0. HEAD was identical and the worktree clean before and after the full process; each suite separately records clean before/after. All four standard setup commands exited 0.

| Suite | Passed | Failed | Skipped | Exit |
| --- | ---: | ---: | ---: | ---: |
| viz-core | 1496 | 0 | 0 | 0 |
| viz-render | 69 | 0 | 0 | 0 |
| mcp-server | 6580 | 0 | 16 | 0 |
| root-core | 6804 | 0 | 16 | 0 |
| component-packages | 1434 | 0 | 0 | 0 |
| Total | 16383 | 0 | 32 | 0 |

There were 16415 assertions and zero todos. The 32 skipped executions are the exact Sprint 194 skip identities (16 unique assertions repeated across MCP and root). Versus Sprint 194 head `ceecd21fd51626ef7f20c25c6ac6753fee7f7238`, the same five literal commands gained 794 passing assertions; failures remain zero and skip identities remain unchanged. `assertion-inventory.json` retains every skipped assertion, and `sprint-194-comparison.json` records per-suite counts.

The actual command, environment, timestamps, absolute temporary locations and clean-head observations are retained unchanged in `capture-execution.json`. It used `--runs 1`, omitted `--suites`, and retained the default commands, timeouts and coverage settings. The actual output root was `/tmp/oods-s195-capture-C2/five-suite-closeout`; the runner's temporary raw-report paths remain as executed. The raw `five-suite-closeout/...` references resolve from this directory's parent after copying. No raw receipt was rewritten.

After the full process exited and the coordinator released the write hold, all 20 runner files and both outer files were copied unchanged. `copy-verification.json` verifies every source/copy path, byte length and SHA256 (22 files). The external originals remain available.

This is the second and final full capture under decision 1833. The failed first attempt remains intact in `../five-suite-closeout-attempt-1` at C1 `54def3aa88683d81f1f942558a24715c064021e9` (16,365 passed, 17 failed, 32 skipped); its raw results are not replaced or merged into this proof. This receipt is local suite evidence; CI runs and independent closeout review are attributed separately.
