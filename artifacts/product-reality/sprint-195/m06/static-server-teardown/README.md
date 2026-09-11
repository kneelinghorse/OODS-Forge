# Static proof server teardown

The first full runtime sweep retained passing Media React/Vue eight-gate receipts, then hung after the successful navigation-bite build. Read-only diagnosis found its listener gone and one forwarded loopback connection still established. The parent interrupted that sweep with SIGTERM (exit 143); its partial evidence remains under `../runtime/`.

The shared helper awaited `server.close()` while the bite's page remained open. Node 24 stops its HTTP request-timeout checking interval on close, so a retained or partial request could wait indefinitely. The fix initiates close and then calls `closeAllConnections()` in the same `finally` block. This happens only after the proof callback has returned or thrown. No runtime timeout, callback operation, or proof assertion changes.

The new test uses real loopback TCP sockets and the real static-server helper. It checks a connected socket with no request, an incomplete HTTP header, and an incomplete header when the callback throws. A separate complete request retrieves exact fixture HTML before callback completion in every case. Successful callbacks retain their original return object; the failed callback preserves its exact error object. All retained connections close afterward.

The unchanged helper failed all three cases (`before.log`, exit 1) at the test-only two-second shutdown deadline. The fixed helper passed all three with no skips in 23 ms of test execution (`after.log`, exit 0). Strict targeted TypeScript checking of the helper, test, and imported graph passed (`typecheck.log`, exit 0). The before and after runs use identical test bytes. No builds or full sweeps were run by this slice. CMOS learning 588 records the issue and fix.
