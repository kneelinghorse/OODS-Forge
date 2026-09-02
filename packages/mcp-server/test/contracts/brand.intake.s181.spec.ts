import { createHash } from "node:crypto";
import { once } from "node:events";
import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it, vi } from "vitest";

import { getAjv } from "../../src/lib/ajv.js";
import { DTCG_INTAKE_REQUEST_SCHEMA } from "../../src/lib/dtcg-intake/schema.js";
import { LEGACY_CODE_MAP } from "../../src/errors/registry.js";
import { handle } from "../../src/tools/brand.intake.js";
import inputWire from "../../src/schemas/brand.intake.input.json" with { type: "json" };
import outputWire from "../../src/schemas/brand.intake.output.json" with { type: "json" };

const MCP_SERVER_DIR = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../..",
);
const REPO_ROOT = path.resolve(MCP_SERVER_DIR, "../..");
const TODAY = new Date().toISOString().slice(0, 10);
const REVIEW_KIT_WRITE_SINK = path.join(
  REPO_ROOT,
  "artifacts",
  "current-state",
  TODAY,
  "review-kit",
);

interface StdioResponse {
  readonly id?: number;
  readonly result?: Record<string, unknown>;
  readonly error?: {
    readonly code?: string;
    readonly message?: string;
    readonly details?: {
      readonly errors?: readonly {
        readonly field?: string;
        readonly keyword?: string;
        readonly message?: string;
      }[];
    };
  };
}

function sha256(value: string): string {
  return createHash("sha256").update(value, "utf8").digest("hex");
}

function inlineRequest(): Record<string, unknown> {
  const document = {
    tokens: {
      "color-bg": { $type: "color", $value: "#ffffff" },
    },
  };
  const compact = JSON.stringify(document);
  return {
    apply: false,
    brand_id: "Polaris",
    profile: "FORGE-SCALAR-DTCG-1",
    theme_documents: [
      {
        source_theme_id: "light",
        target_theme: "light",
        target_brand_document: "base",
        mapping_status: "PROPOSED-NOT-EXECUTABLE",
        source_file_sha256: "a".repeat(64),
        source_file_bytes: 1,
        source_order_compact_json_sha256: sha256(compact),
        source_order_compact_json_bytes: Buffer.byteLength(compact, "utf8"),
        document_operand: { kind: "inline-document", document },
      },
    ],
  };
}

function referenceRequest(): Record<string, unknown> {
  return {
    apply: false,
    brand_id: "Polaris",
    profile: "FORGE-SCALAR-DTCG-1",
    theme_documents: [
      {
        source_theme_id: "light",
        target_theme: "light",
        target_brand_document: "base",
        mapping_status: "PROPOSED-NOT-EXECUTABLE",
        source_file_sha256: "a".repeat(64),
        source_file_bytes: 123,
        source_order_compact_json_sha256: "b".repeat(64),
        source_order_compact_json_bytes: 99,
        document_operand: {
          kind: "authorized-content-addressed-reference",
          uri: `sha256:${"c".repeat(64)}`,
          token_names: ["space-100", "color-bg"],
        },
      },
    ],
  };
}

function treeHash(root: string): string {
  const hash = createHash("sha256");
  if (!fs.existsSync(root)) {
    hash.update("<absent>");
    return hash.digest("hex");
  }

  const visit = (directory: string): void => {
    const entries = fs
      .readdirSync(directory, { withFileTypes: true })
      .sort((a, b) => a.name.localeCompare(b.name));
    for (const entry of entries) {
      const absolute = path.join(directory, entry.name);
      const relative = path.relative(root, absolute).split(path.sep).join("/");
      if (entry.isDirectory()) {
        hash.update(`d\0${relative}\0`);
        visit(absolute);
      } else if (entry.isFile()) {
        hash.update(`f\0${relative}\0`);
        hash.update(fs.readFileSync(absolute));
        hash.update("\0");
      } else if (entry.isSymbolicLink()) {
        hash.update(`l\0${relative}\0${fs.readlinkSync(absolute)}\0`);
      }
    }
  };

  visit(root);
  return hash.digest("hex");
}

async function runStdio(
  inputs: readonly Record<string, unknown>[],
): Promise<StdioResponse[]> {
  const child = spawn(process.execPath, ["dist/index.js"], {
    cwd: MCP_SERVER_DIR,
    stdio: ["pipe", "pipe", "pipe"],
    env: {
      ...process.env,
      MCP_HEALTH_PORT: "0",
      MCP_ROLE: "designer",
      OODS_OTLP_ENDPOINT: "",
    },
  });
  child.stdout.setEncoding("utf8");
  child.stderr.setEncoding("utf8");

  let stderr = "";
  child.stderr.on("data", (chunk: string) => {
    stderr += chunk;
  });

  const responses = await new Promise<StdioResponse[]>((resolve, reject) => {
    const collected = new Map<number, StdioResponse>();
    let buffer = "";
    const timeout = setTimeout(() => {
      reject(
        new Error(
          `Timed out waiting for brand.intake stdio responses. stderr=${stderr}`,
        ),
      );
    }, 15_000);

    const fail = (error: unknown): void => {
      clearTimeout(timeout);
      reject(error);
    };

    child.once("error", fail);
    child.once("exit", (code, signal) => {
      if (collected.size < inputs.length) {
        fail(
          new Error(
            `MCP server exited before replying (code=${String(code)}, signal=${String(signal)}). stderr=${stderr}`,
          ),
        );
      }
    });
    child.stdout.on("data", (chunk: string) => {
      buffer += chunk;
      let newline = buffer.indexOf("\n");
      while (newline >= 0) {
        const line = buffer.slice(0, newline).trim();
        buffer = buffer.slice(newline + 1);
        newline = buffer.indexOf("\n");
        if (!line) continue;
        const response = JSON.parse(line) as StdioResponse;
        if (typeof response.id !== "number") continue;
        collected.set(response.id, response);
        if (collected.size === inputs.length) {
          clearTimeout(timeout);
          resolve(inputs.map((_, index) => collected.get(index + 1)!));
        }
      }
    });

    inputs.forEach((input, index) => {
      child.stdin.write(
        `${JSON.stringify({ id: index + 1, tool: "brand.intake", input })}\n`,
        "utf8",
      );
    });
  });

  const closed = once(child, "close");
  child.kill("SIGTERM");
  await closed;
  return responses;
}

describe("brand.intake s181 advertised dry-run contract", () => {
  it("B-07 keeps the engine request schema reference-identical to the input wire JSON", () => {
    expect(DTCG_INTAKE_REQUEST_SCHEMA).toBe(inputWire);
  });

  it("publishes a wire-valid dry-run example in the generated API reference", async () => {
    const markdown = fs.readFileSync(
      path.join(REPO_ROOT, "docs", "api", "brand-intake.md"),
      "utf8",
    );
    const exampleBlock = markdown.match(
      /## Example Request\s+```json\s+([\s\S]*?)\s+```/,
    );
    expect(exampleBlock).not.toBeNull();

    const example = JSON.parse(exampleBlock![1]!) as Record<string, unknown>;
    const validateInput = getAjv().compile(inputWire);
    expect(validateInput(example), validateInput.errors ?? []).toBe(true);
    expect(example.apply).toBe(false);
    expect(example.profile).toBe("FORGE-SCALAR-DTCG-1");
    expect(example.theme_documents).toEqual(
      expect.arrayContaining([expect.any(Object)]),
    );
    await expect(handle(example)).resolves.toMatchObject({
      preview_only: true,
      validated: true,
      applied: false,
      brand_created: false,
    });
  });

  it("receipts inline acceptance as preview-only, unapplied, uncreated, and memberful without filesystem writes", async () => {
    const mkdir = vi.spyOn(fs, "mkdirSync");
    const writeFile = vi.spyOn(fs, "writeFileSync");
    try {
      const receipt = await handle(inlineRequest());

      expect(receipt).toMatchObject({
        mode: "PREVIEW-ONLY",
        preview_only: true,
        validated: true,
        applied: false,
        brand_created: false,
        build_artifact_denominator: { count: 0, membership: [] },
        preview: {
          classification: "PREVIEW-ONLY",
          persisted: false,
          accepted_population: {
            count: 1,
            membership: ["light::color-bg"],
          },
        },
      });
      expect(receipt.accepted_token_instance_denominator).toEqual({
        count: 1,
        membership: ["light::color-bg"],
      });
      expect(receipt.not_accepted_token_instance_denominator).toEqual({
        count: 0,
        membership: [],
      });
      expect(mkdir.mock.calls.length + writeFile.mock.calls.length).toBe(0);

      const validateOutput = getAjv().compile(outputWire);
      expect(validateOutput(receipt), validateOutput.errors ?? []).toBe(true);
    } finally {
      mkdir.mockRestore();
      writeFile.mockRestore();
    }
  });

  it("returns a typed unresolved-content-reference outcome and one reason per submitted member", async () => {
    const receipt = await handle(referenceRequest());

    expect(receipt).toMatchObject({
      preview_only: true,
      validated: false,
      applied: false,
      brand_created: false,
      accepted_token_instance_denominator: { count: 0, membership: [] },
      not_accepted_token_instance_denominator: {
        count: 2,
        membership: ["light::color-bg", "light::space-100"],
      },
      theme_documents: [
        {
          operand_kind: "authorized-content-addressed-reference",
          validated: false,
          issues: [
            {
              ruleId: "unresolved-content-reference",
              location: "<request>.theme_documents[0].document_operand",
              reason:
                "Content-addressed references are schema-valid but this in-memory engine has no resolution authority.",
            },
          ],
        },
      ],
    });
    expect(receipt.not_accepted_token_reason_denominator).toEqual({
      count: 2,
      membership: ["color-bg", "space-100"].map((tokenName) => ({
        token_instance_id: `light::${tokenName}`,
        ruleId: "unresolved-content-reference",
        location: tokenName,
        reason:
          "Content-addressed references are schema-valid but this in-memory engine has no resolution authority.",
      })),
    });
  });

  it("spawns dist/index.js, returns the full inline receipt, and leaves the review-kit tree byte-identical", async () => {
    expect(fs.existsSync(path.join(MCP_SERVER_DIR, "dist", "index.js"))).toBe(
      true,
    );
    const before = treeHash(REVIEW_KIT_WRITE_SINK);
    const [response] = await runStdio([inlineRequest()]);
    const after = treeHash(REVIEW_KIT_WRITE_SINK);

    expect(response.error).toBeUndefined();
    expect(response.result).toMatchObject({
      mode: "PREVIEW-ONLY",
      preview_only: true,
      validated: true,
      applied: false,
      brand_created: false,
      accepted_token_instance_denominator: {
        count: 1,
        membership: ["light::color-bg"],
      },
      preview: {
        persisted: false,
        accepted_population: {
          count: 1,
          membership: ["light::color-bg"],
        },
      },
    });
    expect(after).toBe(before);
  });

  it("B-09 rejects apply:true and consumer-local paths at index-level AJV before the handler", async () => {
    const applyTrue = { ...inlineRequest(), apply: true };
    const localPath = inlineRequest();
    const [themeDocument] = localPath.theme_documents as Record<
      string,
      unknown
    >[];
    themeDocument!.document_operand = {
      kind: "filesystem-path",
      path: "/Users/consumer/polaris-light.tokens.json",
      token_names: ["color-bg"],
    };

    const [applyResponse, pathResponse] = await runStdio([
      applyTrue,
      localPath,
    ]);
    for (const response of [applyResponse, pathResponse]) {
      // index.ts names this branch SCHEMA_INPUT; the legacy transport maps it to OODS-V001.
      expect(response.error?.code).toBe(LEGACY_CODE_MAP.SCHEMA_INPUT);
      expect(response.result).toBeUndefined();
    }
    expect(applyResponse.error?.details?.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ field: "apply", keyword: "const" }),
      ]),
    );
    expect(pathResponse.error?.details?.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          field: "path",
          keyword: "additionalProperties",
        }),
      ]),
    );
  });
});
