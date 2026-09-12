# Sprint 195 evidence bootstrap

The production implementation is B2 `39deb793a3161621b5a0893618f9d40201c22256`. The final five-suite capture executed at clean C2 `6e779776a7efa3b6e7b26a12966f0c4186dba1d6`: 16,383 passed, zero failed, and 32 skipped. The earlier C1 failure remains a separate retained attempt. This document is a plan, not an audit execution receipt. CMOS decision 1948 records the chosen sequence; its literal read-only response is retained in `decision-1948.json`.

Mission m07 criterion 2 requires successful producer and independent auditor executions at frozen heads. Its own future audit cannot be an input to the manifest being audited. The existing Sprint 195 tools therefore run in two explicit evidence stages, with no source changes or new closeout framework.

1. Freeze review R0 with the complete capture and selected actual CI receipts. Its criterion 2 binding is explicitly provisional and points to existing input verification plus this disclosure. Full C2/R0 output checks have not run at that freeze. Any generic generated `proven` headline at this stage is diagnostic bootstrap output; it does not complete m07.
2. Execute the existing producer, producer `--check`, and independent auditor at C2/R0. Preserve exact commands, exits, output bytes and the R0 manifest under unique `closeout/bootstrap/` paths. Failed executions remain failures. R1 cannot claim completed checks unless all three actually succeed.
3. Replace the provisional binding with those successful C2/R0 execution receipts. Freeze R1, then execute the complete producer, `--check`, and independent auditor again at C2/R1. Only actual successful final checks can complete the build mission.

The bootstrap execution row records head R0 with `historical:false`: R0 is the frozen input review, while its later logs are stored in R1. The retained `bootstrap/manifest-r0.json` is copied byte-for-byte from R0, so changing the main manifest does not invalidate its input hash. Bootstrap output stays in its own output tree. Final generation uses its normal separate destinations. A later commit storing the final outputs does not change either executed tuple.

Every review change relative to C2 must be an added `.json`, `.log`, or `.md` file under the existing m07 `five-suite-closeout*`, `closeout`, or `ci` paths. Public implementation, tests, schemas, configuration, goldens and pre-C2 proof remain unchanged. The actual CI source heads and merge checkout heads remain distinct. No run is relabeled.

The final state remains **BUILT, REVIEW PENDING**, with `builderSelfCertified:false`, sprint Active, and separate human craft and classification review pending. The initial provisional output is never represented as independent approval.
