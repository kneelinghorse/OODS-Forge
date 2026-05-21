# review.resolve

> Resolve low-confidence reconciliation conflicts in an Object Catalog manifest by applying a policy bundle. Each entity gets one decision (accept|patch|defer|dismiss) with reason + matching policyId + evaluatedScore + evaluatedTier, plus an audit trail (evaluatedAt, defaultAction, policyBundle echo, matchedPolicyIds). Accepts either an inline `manifest` or a project-relative `manifestPath`; `policies` bundle is required. Three predicate kinds supported: confidence_threshold (score vs threshold), signal_type_floor (named signal vs floor), entity_urn_match (urn or glob pattern). Ordered rules, first-match-wins, defaultAction='defer' covers no-match. Consumed by orchestrating agents; no playground UI required.

**Registration:** auto

## Input Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `manifest` | object | No |  | Inline Object Catalog manifest object. Mutually exclusive with manifestPath. |
| `manifestPath` | string | No |  | Project-relative path to a manifest JSON file. Absolute paths and parent-directory traversal (..) are rejected. |
| `projectRoot` | string | No |  | Optional override for the project root used to resolve manifestPath. Defaults to process.cwd(). |
| `policies` | _ref_ | Yes |  |  |
| `defaultAction` | _ref_ | No |  | Decision applied when no policy matches an entity. Defaults to 'defer' so unmatched items surface for follow-up rather than being silently accepted. |

## Output Shape

| Field | Type | Always Present | Description |
|-------|------|----------------|-------------|
| `resolutions` | _ref_[] | Yes |  |
| `auditTrail` | object | Yes |  |
| `warnings` | string[] | Yes |  |
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
