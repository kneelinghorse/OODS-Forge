# Internal Release Readiness

Package reproducibility is verified through the repository build and test workflow.
Packing can invoke builds and prepack scripts; it is not a read-only preview.

The on-demand `release.tag` tool accepts a tag such as
`v0.0.0-internal.20251015`, checks duplicate tags and working-tree state, and
creates a lightweight git tag only when `apply` is true. A dirty working tree is
reported as a warning. Dry runs read git state and write receipt artifacts without
creating a tag.

```json
{ "tool": "release.tag", "input": { "tag": "v0.0.0-internal.20251015", "apply": false } }
```

Transcripts and bundle indices land under
`artifacts/current-state/YYYY-MM-DD/release.tag`.
