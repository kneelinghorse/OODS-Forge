# brand.intake

> Validate a preview-only DTCG intake envelope in memory and return its envelopeHash. Fully accepted brand-relative inline documents for existing A/B with unique mapped target themes return a delta consumable by brand.apply alias strategy. authorized-content-addressed-reference is schema-valid but intentionally unresolved with typed unresolved-content-reference outcomes. apply is forced false; no writes, token application, brand creation or build artifacts.

**Registration:** auto

## Input Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `apply` | boolean | Yes |  |  |
| `brand_id` | string | Yes |  |  |
| `profile` | any | Yes |  |  |
| `theme_documents` | _ref_[] | Yes |  |  |

## Output Shape

| Field | Type | Always Present | Description |
|-------|------|----------------|-------------|
| `envelopeHash` | string | Yes | SHA256 of source-order compact JSON of the complete intake envelope. |
| `delta` | object | No | Fully accepted inline brand-relative documents, wrapped for brand.apply alias strategy. Only existing A/B and unique mapped themes qualify. |
| `deltaUnavailableReason` | string | No |  |
| `mode` | any | Yes |  |
| `preview_only` | any | Yes | Always true: brand.intake validates and receipts without persistence. |
| `grammar_profile` | any | Yes |  |
| `requested` | object | Yes |  |
| `validated` | boolean | Yes |  |
| `applied` | any | Yes |  |
| `brand_created` | any | Yes |  |
| `request_issues` | _ref_[] | Yes |  |
| `theme_documents` | _ref_[] | Yes |  |
| `submitted_token_instance_denominator` | _ref_ | Yes |  |
| `accepted_token_instance_denominator` | _ref_ | Yes |  |
| `not_accepted_token_instance_denominator` | _ref_ | Yes |  |
| `submitted_minus_accepted_denominator` | _ref_ | Yes |  |
| `accepted_minus_submitted_denominator` | _ref_ | Yes |  |
| `not_accepted_token_reason_denominator` | _ref_ | Yes |  |
| `build_artifact_denominator` | object | Yes |  |
| `preview` | object | Yes |  |

## Error Codes

| Code | Description |
|------|-------------|
| `OODS-V001` | Input validation failed |
| `OODS-S001` | Internal server error |

## Example Request

```json
{
  "apply": false,
  "brand_id": "example-brand",
  "profile": "FORGE-SCALAR-DTCG-1",
  "theme_documents": [
    {
      "source_theme_id": "light",
      "target_theme": "light",
      "target_brand_document": "base",
      "mapping_status": "PROPOSED-NOT-EXECUTABLE",
      "source_file_sha256": "9ff566c94a16e8c9707ce79e5a143af0cc5ce1ab56d19c8898384dcf6beda4f6",
      "source_file_bytes": 60,
      "source_order_compact_json_sha256": "9ff566c94a16e8c9707ce79e5a143af0cc5ce1ab56d19c8898384dcf6beda4f6",
      "source_order_compact_json_bytes": 60,
      "document_operand": {
        "kind": "inline-document",
        "document": {
          "tokens": {
            "color-bg": {
              "$type": "color",
              "$value": "#ffffff"
            }
          }
        }
      }
    }
  ]
}
```
