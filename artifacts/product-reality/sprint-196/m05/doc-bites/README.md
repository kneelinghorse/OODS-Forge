# Documentation mutation bites

All 11 bites passed against immutable inputs from `944f4dda5f784e266310978b31f65b3d452e6387`: ten hand-edited documentation surfaces and one valid ledger classification/count change. Every hand edit produced the intended stale-document `--check` failure, followed by a passing check after byte-identical restoration. No production generator or document was changed by these bites.

The ten document surfaces are the Button component page, component index, Tool-Specs, a marked how-forge-works claim, Connections, the design.compose API page, server README, bridge README, docs README, and root README. Mutations alter actual published counts, classification or TTL text rather than relying on unrelated compilation failures.

The ledger bite changes `AddressCollectionPanel` from proposed recipe to proposed native. Membership remains 109 and `approvedRuntimeCensus` remains null. Derived counts change from 24 native / 84 recipe / 1 alias to 25 / 83 / 1. Both component and claims checks fail. Running the real generators updates the component page, component index and HTML counts; both checks then pass. Restoring the source ledger and all output bytes exactly returns both checks to green.

Inputs were captured before the UTC source edits: tracked files came from a Git archive, historical evidence references came from the same commit, and built package inputs were copied once. First-party package links resolve inside the frozen checkout; only external dependencies use the installed pnpm store. Each generator executes from the frozen tree with its own TypeScript configuration. `snapshot.json` binds 2,474 tracked files to Git blobs and SHA-256, plus 1,038 copied build files, the dependency lock and first-party module resolutions. The final run rechecks every captured file against its original hash.

Run from the repository root before changing baseline source:

```sh
node scripts/product-reality/s196-m05-doc-bites.mjs --execute --source-head 944f4dda5f784e266310978b31f65b3d452e6387
```

For the retained capture, pass `--frozen <directory-containing-freeze.json-and-repository>`. Fresh capture refuses once source inputs differ from the baseline; `isolation-guard.log` records that refusal while concurrent UTC work was present. `--output <directory>` selects a receipt directory. No exclusive mutation window is needed after the immutable capture.

`bites.json` is the aggregate receipt with per-bite hashes, exact commands, exit codes and restoration results. Per-bite directories contain red, regeneration and green logs. `run.log` records the final 11-pass / 0-fail result. The runner hash and Node version are retained in the receipt. These are build-session proofs, not independent certification.
