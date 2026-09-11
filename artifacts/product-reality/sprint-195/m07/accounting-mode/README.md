# Sprint 195 suite-accounting mode

The existing accounting producer now admits Sprint 195 with Sprint 194's final capture as its default baseline. It requires the five-suite roster, exactly one final run, and at most one retained corrective attempt under decision 1833. Execution-to-review changes remain restricted to added capture, closeout, or CI evidence. No historical timeout or third-capture exception is borrowed.

The final golden authority is `m07/golden-attribution.json`, using the existing `beforeHead` and `files[{file,beforeSha256,afterSha256}]` format. The separately qualified m05 migration is not reinterpreted as a current-byte receipt. The default CLI capture path is `m07/five-suite-closeout/four-suite-baseline.json`; the output is `m07/closeout/suite-accounting.json`.

Nine new intent tests use explicitly synthetic receipts in isolated Git repositories, including five-suite membership, preserved skips, an immutable failed first attempt, genuine final failure, head identity, evidence-only additions, historical migration separation, and CLI write/check behavior. They do not execute or imitate a real closeout campaign. All nine pass. The 20 existing accounting regressions also pass; 29 distinct tests pass with zero skips. Targeted strict TypeScript checking passes.

Raw intermediate failures are retained. Adding the CLI case initially exposed the fixture's macOS `/var` versus `/private/var` path alias, which caused the CLI entry guard to skip invocation; resolving the temporary root's real path corrected the fixture. The first targeted typecheck also reported the JavaScript API's inferred required optional keys and one unannotated callback; the test now supplies explicit undefined values and a callback type. Neither correction changed production accounting logic. `verification.json` records each executed command and actual outcome.

No full suite, package build, runtime sweep, or capture was run by this slice. Pre-freeze integration and the actual budgeted campaign remain separate steps.
