# brand.intake

> Validate a preview-only DTCG brand intake envelope in memory. Each theme document supplies one of two document_operand kinds: `inline-document` or `authorized-content-addressed-reference`. The latter is schema-valid but intentionally unresolved and returns a typed `unresolved-content-reference` not-accepted outcome. `apply` is forced false; the tool never writes files, applies tokens, creates a brand, or emits build artifacts.

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
