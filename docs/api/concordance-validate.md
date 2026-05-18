# concordance.validate

> Validate an Object Catalog manifest against the vendored Concordance wire contract. Accepts either an inline `manifest` object or a project-relative `manifestPath`. Returns valid/errors/warnings plus version-policy outcome (exact|patch|minor|major|absent) against the Forge schema_version pin. Errors preserve AJV instancePath/keyword/params shape for Pydantic detail.errors[] parity. Agent-callable only — manifest validation is NOT auto-baked into the compose/render pipeline yet.

**Registration:** auto

## Input Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `manifest` | object | No |  | Inline Object Catalog manifest object. Mutually exclusive with manifestPath. |
| `manifestPath` | string | No |  | Project-relative path to a manifest JSON file. Absolute paths and parent-directory traversal (..) are rejected. |
| `projectRoot` | string | No |  | Optional override for the project root used to resolve manifestPath. Defaults to process.cwd(). |
| `throwOnVersionError` | boolean | No | `false` | When true, a ConcordanceVersionError (major schema_version mismatch) is surfaced as a tool error. When false (default), the same condition is reported as a structured error in the response. |

## Output Shape

| Field | Type | Always Present | Description |
|-------|------|----------------|-------------|
| `valid` | boolean | Yes | True iff the manifest passes AJV validation against the vendored manifest.schema.json (after schema_version strip). |
| `errors` | _ref_[] | Yes | AJV-native error shape, preserved for Pydantic detail.errors[] parity per the F2 / hosted Concordance convention. |
| `warnings` | string[] | Yes | Non-fatal version-policy notes (e.g. patch or minor schema_version drift). |
| `schemaVersion` | string \| null | Yes | schema_version observed on the manifest. Null when the manifest omits the field. |
| `versionPolicy` | `exact` \| `patch` \| `minor` \| `major` \| `absent` | No | Outcome of the version policy check against the Forge schema_version pin. |
| `diagnostics` | object | Yes |  |

## Error Codes

| Code | Description |
|------|-------------|
| `OODS-V001` | Input validation failed |
| `OODS-S001` | Internal server error |

## Example Request

```json
{}
```
