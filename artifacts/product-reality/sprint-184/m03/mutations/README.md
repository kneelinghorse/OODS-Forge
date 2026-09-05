# s184-m03 mutation evidence

This directory records seven hand-applied mutation probes against the exact
implementation commit `b4697e40fb67dfd59e638f7c847f103d9f06a8d2`.

The probes ran sequentially in the disposable detached worktree
`/private/tmp/oods-s184-m03-mutations.kPGdQU/repo`. No source or test file in
the sprint worktree was changed. Each cycle followed the same sequence:

1. establish the selected test green at the implementation commit;
2. apply the one bounded patch recorded here;
3. hash the mutated source;
4. run the focused selector and require a non-zero exit;
5. reverse the patch;
6. require the restored SHA-256 to equal the pre-mutation SHA-256;
7. require `git diff --exit-code` and the restored selector to pass.

For canonical-contract mutants, `@oods/component-contracts` was rebuilt after
the source mutation so the MCP target validator consumed the mutated package,
not stale `dist` bytes. The selected target test failed on both React and Vue.
The directive mutant bypassed execution on HTML, React, Vue, `renderTree`, and
fragment rendering in one patch; its selector reported seven failures covering
all three emitters plus direct renderer and `repl.render`.

An initial setup attempt to run the MCP suite exited 1 before collecting tests
because a fresh worktree had no built `@oods/artifacts` entry point. It is not
counted as a pre-green or mutation result. The transitive MCP dependencies were
then built with `pnpm --filter @oods/mcp-server... run build`; the recorded
pre-green suite subsequently passed 25/25.

`mutation-manifest.json` is the machine-readable index. `pre-green.log`,
`mutation-red.log`, and `post-restore.log` contain the real observed command
outputs (with the very large HTML assertion diff reduced by an explicitly
recorded `rg` filter on the rerun). The `.patch` files are the exact mutations.

Result: **7/7 mutants killed, 7/7 restored byte-identically, no gaps.**
