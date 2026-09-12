# Sprint 195 final advertised movers and hunk attribution

Selected implementation B2 is `39deb793a3161621b5a0893618f9d40201c22256`;
its tool census was derived at actual source A2
`a0c10f8b075ba07c28816cb2c453061a53400a4a`. The locked sprint base stays
`5b25c3c9ec795315bf52a698d135c96bffd66393`. These identities have separate roles.

The existing mover producer and independent attribution check pass with **18
canonical advertised paths, 141 public paths and 770 exact Git hunks**. This is
one more public path than B1: `scripts/runtime/assemble.mjs`, whose domain-file
count now includes the authored Usage API-call example. No public path was
removed from the B1 inventory. Seven scoped public files changed B1→B2: the
tool ledger, five proof-script type corrections and portable assembly.

`advertised.patch` retains the exact full
`git diff --no-ext-diff --no-renames --unified=0 BASE B2 -- ...S195_PUBLIC_RUNTIME_SCOPE`
bytes. `patch-command.json` records the complete argument array and process
environment. The raw full-scope patch includes scoped test files; public mover
rows retain the existing test-exclusion rules. Three correction tests are in
that raw scope and filtered from rows; two other MCP correction tests sit
outside the enumerated source scope. All five remain absent from public mover
rows for their actual reasons, recorded in `verification.json`. The new
`component-theme-proof.d.mts` is a type-only declaration outside the frozen
executable scope; its actual B2 hash is retained as supplemental evidence
without changing the scope.

`attribution.json` covers every public path once and every actual hunk in order:
23,894 aggregate added lines and 1,632 aggregate removed lines. Seventeen full
commit IDs actually contribute to those public paths, with twenty first-parent
commit mappings retained overall. Rows bind exact historical before/after file
hashes, mission causes, contributing commits and hash-bound mission evidence.
Actual C/A2/B2 commits map to m07; C itself adds retained evidence, not product
code. Added correction evidence includes the TypeScript, root, worker and MCP
contract packets plus `m07/correction/pre-freeze.json`.

The selected artifact helper is `derive-attribution-b2.py`, the bounded existing
hunk-replay derivation with explicit frozen-head/additional-commit inputs. It
replays actual first-parent Git hunks, requiring every reconstructed file to
match that commit's bytes. `commit-diffs/` and `blame/` retain raw commit patches
and independent final-line blame. Four aggregate removal alignments survive in
the final file (blank lines and generated comment delimiters); no unique
deletion author is invented. Existing baseline-aligned additions likewise retain
their historical identity. The original B1 helper remains historical; it is not
the selected B2 command.

`verify-attribution.mjs` invokes both the existing producer verifier and the
independently written auditor using an independently re-read Git patch. Both
pass all141 paths. The original m05 qualification is unchanged: 29 file pairs at
`52b0da991705c4c565987bc9faf7738ba00d885e`, raw receipt commit
`3c8a7a5664f811b9168028d63684502ac956f657`, 910 historical matrix rows and231
superseded rows. The B2 refresh does not relabel that historical execution.

Before regeneration, **171 selected old derived files** were checked byte for
byte against immutable C `54def3aa88683d81f1f942558a24715c064021e9` and moved to
a verified `/tmp` backup. `supersession.json` binds every old hash/path, C and
backup destination. That commit preserves the entire B1 packet and its original
140-path/768-hunk result. Removing the old declaration from the output location
respected the producer's deliberate overwrite refusal; no tool rule changed.
The old rejected Unicode-path attempt remains under `attempt-1-quoted-paths/`.
The local B2 receipt finalizer initially assumed all five correction tests were
inside the raw scope; its retained diagnostic and corrected exact partition
are in `verification-finalizer-initial.log` and `verification.json`.

Every selected Git command uses process-only
`GIT_CONFIG_COUNT=1 GIT_CONFIG_KEY_0=core.quotePath GIT_CONFIG_VALUE_0=false`,
preserving the actual Unicode filename through nested calls. No repository or
global Git configuration changed. `verification.json` binds the actual selected
logs, scripts and outputs.

The existing reconnect generator and its check pass at B2.
`../reconnect/notice-plan.json` prepares three Sprint196 notices for
cmos-dashboard, forge-demos and aquex-mcp, with **sendsExecuted:0**. Pattern, HC,
accuracy, HTML, ECharts placement, portable and soak limitations remain explicit,
as does pending independent review. This task performed no delivery, send,
source edit, build, full-suite campaign or runtime qualification. Root owns all
fresh B2 runtime/component/population evidence; no B1 proof is relabeled here.
