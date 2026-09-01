import { getAjv } from "../ajv.js";
import type { DtcgIntakeRequest } from "./types.js";

export const DTCG_INTAKE_REQUEST_SCHEMA = {
  $schema: "https://json-schema.org/draft/2020-12/schema",
  $id: "https://designlab.local/schemas/internal/dtcg-intake-request.json",
  title: "Internal DTCG intake request",
  type: "object",
  additionalProperties: false,
  required: ["apply", "brand_id", "profile", "theme_documents"],
  properties: {
    apply: { type: "boolean", const: false },
    brand_id: { type: "string", minLength: 1, pattern: "^(?!.*::).+$" },
    profile: { const: "FORGE-SCALAR-DTCG-1" },
    theme_documents: {
      type: "array",
      minItems: 1,
      items: { $ref: "#/$defs/themeDocument" },
    },
  },
  $defs: {
    sha256: { type: "string", pattern: "^[a-fA-F0-9]{64}$" },
    nonNegativeBytes: { type: "integer", minimum: 0 },
    themeDocument: {
      type: "object",
      additionalProperties: false,
      required: [
        "source_theme_id",
        "target_theme",
        "target_brand_document",
        "mapping_status",
        "source_file_sha256",
        "source_file_bytes",
        "source_order_compact_json_sha256",
        "source_order_compact_json_bytes",
        "document_operand",
      ],
      properties: {
        source_theme_id: {
          type: "string",
          minLength: 1,
          pattern: "^(?!.*::)(?!<invalid-theme-document-)\\S(?:.*\\S)?$",
        },
        target_theme: { enum: ["light", "dark", "hc", null] },
        target_brand_document: { enum: ["base", "dark", "hc", null] },
        mapping_status: {
          enum: [
            "PROPOSED-NOT-EXECUTABLE",
            "UNMAPPED-REQUIRES-VARIANT-SUPPORT",
          ],
        },
        source_file_sha256: { $ref: "#/$defs/sha256" },
        source_file_bytes: { $ref: "#/$defs/nonNegativeBytes" },
        source_order_compact_json_sha256: { $ref: "#/$defs/sha256" },
        source_order_compact_json_bytes: { $ref: "#/$defs/nonNegativeBytes" },
        document_operand: { $ref: "#/$defs/documentOperand" },
      },
      allOf: [
        {
          if: {
            properties: {
              mapping_status: { const: "PROPOSED-NOT-EXECUTABLE" },
            },
            required: ["mapping_status"],
          },
          then: {
            oneOf: [
              {
                properties: {
                  target_theme: { const: "light" },
                  target_brand_document: { const: "base" },
                },
              },
              {
                properties: {
                  target_theme: { const: "dark" },
                  target_brand_document: { const: "dark" },
                },
              },
              {
                properties: {
                  target_theme: { const: "hc" },
                  target_brand_document: { const: "hc" },
                },
              },
            ],
          },
        },
        {
          if: {
            properties: {
              mapping_status: { const: "UNMAPPED-REQUIRES-VARIANT-SUPPORT" },
            },
            required: ["mapping_status"],
          },
          then: {
            properties: {
              target_theme: { const: null },
              target_brand_document: { const: null },
            },
          },
        },
      ],
    },
    documentOperand: {
      oneOf: [
        {
          type: "object",
          additionalProperties: false,
          required: ["kind", "document"],
          properties: {
            kind: { const: "inline-document" },
            document: { type: "object" },
          },
        },
        {
          type: "object",
          additionalProperties: false,
          required: ["kind", "uri", "token_names"],
          properties: {
            kind: { const: "authorized-content-addressed-reference" },
            uri: { type: "string", pattern: "^sha256:[a-fA-F0-9]{64}$" },
            token_names: {
              type: "array",
              minItems: 1,
              uniqueItems: true,
              items: {
                type: "string",
                minLength: 1,
                pattern: "^(?!.*::).+$",
              },
            },
          },
        },
      ],
    },
  },
} as const;

export interface DtcgIntakeStructuralValidation {
  readonly valid: boolean;
  readonly errors: readonly {
    readonly instancePath: string;
    readonly keyword: string;
    readonly message: string;
  }[];
}

let compiled: ReturnType<ReturnType<typeof getAjv>["compile"]> | undefined;

export function validateDtcgIntakeRequestStructure(
  input: unknown,
): DtcgIntakeStructuralValidation {
  const ajv = getAjv();
  compiled ??=
    ajv.getSchema(DTCG_INTAKE_REQUEST_SCHEMA.$id) ??
    ajv.compile(DTCG_INTAKE_REQUEST_SCHEMA);
  const valid = compiled(input) === true;
  return {
    valid,
    errors: valid
      ? []
      : (compiled.errors ?? []).map(
          (error: {
            instancePath?: string;
            keyword?: string;
            message?: string;
          }) => ({
            instancePath: error.instancePath ?? "",
            keyword: error.keyword ?? "schema",
            message:
              error.message ?? "does not match the intake request schema",
          }),
        ),
  };
}

export function isDtcgIntakeRequest(
  input: unknown,
): input is DtcgIntakeRequest {
  return validateDtcgIntakeRequestStructure(input).valid;
}
