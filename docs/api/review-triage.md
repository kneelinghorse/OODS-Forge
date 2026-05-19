# review.triage

> Operator triage for conflict artifacts written by map.apply. Loads .oods/conflicts/{...}.json at conflictArtifactPath, applies an array of decisions {objectId, verdict: 'accept'|'patch'|'defer'|'dismiss', reason?, patchOverrides?}, additively mutates the artifact with resolution_status/resolved_at/resolved_by/operator_reason, and routes accept→map.create, patch→map.update (defer/dismiss are local-only). Idempotent: already-resolved items return as errors[] with kind='already_resolved'. Path safety mirrors concordance.validate. Returns per-verdict summary counts, mapsCreated/mapsUpdated/mapsRemoved, and non-fatal per-decision errors. Pairs with the C5a review-queue + C5b conflict-detail codegen surfaces.

**Registration:** auto

## Input Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `conflictArtifactPath` | string | Yes |  | Project-relative path to the conflict artifact JSON. Absolute paths, parent-directory traversal (..), and paths escaping the project root are rejected. |
| `projectRoot` | string | No |  | Optional override for the project root used to resolve conflictArtifactPath. Defaults to process.cwd(). |
| `apply` | boolean | No | `true` | When false, accept/patch verdicts route through map.create/map.update with apply=false (dry-run). Default true: review.triage exists to persist decisions. |
| `decisions` | _ref_[] | Yes |  |  |

## Output Shape

| Field | Type | Always Present | Description |
|-------|------|----------------|-------------|
| `summary` | object | Yes |  |
| `artifact` | string | Yes | Project-relative path to the (possibly mutated) conflict artifact. |
| `mapsCreated` | object[] | Yes |  |
| `mapsUpdated` | object[] | Yes |  |
| `mapsRemoved` | object[] | Yes |  |
| `errors` | object[] | Yes | Per-decision non-fatal failures. Items whose map.* call failed remain 'open' in the artifact so a retry can re-attempt them. |

## Error Codes

| Code | Description |
|------|-------------|
| `OODS-V001` | Input validation failed |
| `OODS-S001` | Internal server error |

## Example Request

```json
{
  "conflictArtifactPath": "<conflictArtifactPath>",
  "decisions": []
}
```
