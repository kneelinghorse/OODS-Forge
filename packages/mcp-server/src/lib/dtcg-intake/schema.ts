import { getAjv } from "../ajv.js";
import type { DtcgIntakeRequest } from "./types.js";
import dtcgIntakeRequestSchema from "../../schemas/brand.intake.input.json" with { type: "json" };

export const DTCG_INTAKE_REQUEST_SCHEMA = dtcgIntakeRequestSchema;

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
