# Runbook: Change Tokens Safely

## Intent
- Token edits follow the 4-layer model and rebuild without guardrail failures.
- Generated outputs are updated for CSS, TS, and Tailwind consumers.

## Files You Will Touch
- packages/tokens/src/tokens/base/** - reference and system tokens
- packages/tokens/src/tokens/brands/<A|B>/*.json - brand overlays
- packages/tokens/src/tokens/themes/<theme>/*.json - theme ramps (dark, hc, etc.)
- packages/tokens/src/tokens/base/system/ - system semantic bindings
- packages/tokens/src/tokens/component/ - component slots
- apps/explorer/src/styles/layers.css - component slot mappings

## Commands to Run
```bash
pnpm build:tokens
pnpm tokens-validate
# Optional for PR guardrails or protected namespaces.
# --base takes a REF, not a branch name you hope exists: `main` is frozen (sprint-95) and
# PRs target OODS-pro. Omit --base and the tool resolves origin/OODS-pro, or throws naming
# the flag — it will not silently diff against nothing. In CI both callers pass the
# merge-base of the PR base branch and HEAD.
pnpm tokens:governance diff --brand A --base origin/OODS-pro --head HEAD \
  --json artifacts/tokens/brand-a-report.json \
  --comment artifacts/tokens/brand-a-comment.md
```

## Expected Artifacts
- packages/tokens/dist/css/tokens.css
- packages/tokens/dist/ts/tokens.ts
- packages/tokens/dist/tailwind/tokens.json

## Common Failure Modes
| Symptom | Cause | Fix |
| --- | --- | --- |
| Duplicate token name/variable | Two tokens resolve to same name | Rename or move one token path |
| tokens:lint-semantic fails | Component token maps to invalid system token | Update canonical system/component references under `packages/tokens/src/tokens/` |
| Brand token mismatch | Brand overlay missing a required key | Add the missing token to the brand file |
| Visual regressions | Slot mapping not updated | Adjust `apps/explorer/src/styles/layers.css` |

`tokens:validate` and `tokens:transform` delegate to the canonical package builder.
The legacy root `tokens/` tree is historical; it is not a gate input. Both color
guard CLIs use `tools/a11y/guardrails/read.mjs`; palette rows are evaluated by
`tokens-validate`, and the a11y CLI grades the six relative-color rows.
