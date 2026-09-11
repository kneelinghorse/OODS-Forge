#!/usr/bin/env tsx
/**
 * Auto-generate per-tool API reference markdown from JSON schemas
 * and tool-descriptions.json.
 *
 * Usage: pnpm run docs:api
 * Output: docs/api/<tool-name>.md + docs/api/README.md
 */

import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '../..');
const SCHEMAS_DIR = path.join(ROOT, 'packages/mcp-server/src/schemas');
const DESCRIPTIONS_PATH = path.join(ROOT, 'packages/mcp-adapter/tool-descriptions.json');
const REGISTRY_PATH = path.join(ROOT, 'packages/mcp-server/src/tools/registry.json');
const VIZ_RECIPES_PATH = path.join(ROOT, 'packages/viz-core/src/registry/viz-recipes.v1.json');
const OUT_DIR = path.join(ROOT, 'docs/api');

type JsonSchema = {
  $schema?: string;
  $id?: string;
  title?: string;
  description?: string;
  type?: string;
  required?: string[];
  anyOf?: Array<{ required?: string[] }>;
  properties?: Record<string, JsonSchemaProperty>;
  additionalProperties?: boolean | object;
  items?: JsonSchemaProperty;
  examples?: unknown[];
};

type JsonSchemaProperty = {
  type?: string | string[];
  description?: string;
  enum?: unknown[];
  default?: unknown;
  minimum?: number;
  maximum?: number;
  minLength?: number;
  properties?: Record<string, JsonSchemaProperty>;
  items?: JsonSchemaProperty;
  additionalProperties?: boolean | JsonSchemaProperty;
  $ref?: string;
};

function readJson<T>(filePath: string): T {
  return JSON.parse(fs.readFileSync(filePath, 'utf-8')) as T;
}

function formatType(prop: JsonSchemaProperty): string {
  if (prop.enum) return prop.enum.map((v) => `\`${v}\``).join(' \\| ');
  if (prop.$ref) return `_ref_`;
  if (prop.type === 'array') {
    const itemType = prop.items ? formatType(prop.items) : 'unknown';
    return `${itemType}[]`;
  }
  if (prop.type === 'object') {
    if (prop.additionalProperties && typeof prop.additionalProperties === 'object') {
      return `Record<string, ${formatType(prop.additionalProperties as JsonSchemaProperty)}>`;
    }
    return 'object';
  }
  if (Array.isArray(prop.type)) return prop.type.join(' \\| ');
  return prop.type ?? 'any';
}

function formatDefault(prop: JsonSchemaProperty): string {
  if (prop.default === undefined) return '';
  return `\`${JSON.stringify(prop.default)}\``;
}

function buildParamsTable(schema: JsonSchema): string {
  if (!schema.properties || Object.keys(schema.properties).length === 0) {
    return '_No parameters._\n';
  }

  const requiredSet = new Set(schema.required ?? []);
  // Also check anyOf required
  if (schema.anyOf) {
    for (const clause of schema.anyOf) {
      if (clause.required) clause.required.forEach((r) => requiredSet.add(r));
    }
  }

  const lines: string[] = [
    '| Parameter | Type | Required | Default | Description |',
    '|-----------|------|----------|---------|-------------|',
  ];

  for (const [name, prop] of Object.entries(schema.properties)) {
    const req = requiredSet.has(name) ? 'Yes' : 'No';
    const type = formatType(prop);
    const def = formatDefault(prop);
    const desc = prop.description ?? '';
    lines.push(`| \`${name}\` | ${type} | ${req} | ${def} | ${desc} |`);

    // Expand nested objects one level
    if (prop.properties) {
      for (const [subName, subProp] of Object.entries(prop.properties)) {
        const subReq = (prop as JsonSchema).required?.includes(subName) ? 'Yes' : 'No';
        const subType = formatType(subProp);
        const subDef = formatDefault(subProp);
        const subDesc = subProp.description ?? '';
        lines.push(`| \`${name}.${subName}\` | ${subType} | ${subReq} | ${subDef} | ${subDesc} |`);
      }
    }
  }

  return lines.join('\n') + '\n';
}

function buildOutputShape(schema: JsonSchema): string {
  if (!schema.properties || Object.keys(schema.properties).length === 0) {
    return '_See tool response._\n';
  }

  const requiredSet = new Set(schema.required ?? []);
  const lines: string[] = [
    '| Field | Type | Always Present | Description |',
    '|-------|------|----------------|-------------|',
  ];

  for (const [name, prop] of Object.entries(schema.properties)) {
    const always = requiredSet.has(name) ? 'Yes' : 'No';
    const type = formatType(prop);
    const desc = prop.description ?? '';
    lines.push(`| \`${name}\` | ${type} | ${always} | ${desc} |`);
  }

  return lines.join('\n') + '\n';
}

function toolSlug(toolName: string): string {
  return toolName.replace(/\./g, '-');
}

function buildErrorCodes(toolName: string): string {
  // Common error codes that apply to all tools
  const common = [
    { code: 'OODS-V001', desc: 'Input validation failed' },
    { code: 'OODS-S001', desc: 'Internal server error' },
  ];

  // Tool-specific codes
  const specific: Record<string, Array<{ code: string; desc: string }>> = {
    'viz.render': [
      { code: 'OODS-V165', desc: 'SVG rendering failed; no SVG or spec-only success is returned' },
    ],
    'design.compose': [
      { code: 'OODS-V006', desc: 'Unknown component during slot selection' },
      { code: 'OODS-N001', desc: 'Object not found in registry' },
    ],
    'repl.validate': [
      { code: 'OODS-V007', desc: 'DSL schema validation failed' },
      { code: 'OODS-V009', desc: 'Missing schema' },
      { code: 'OODS-N002', desc: 'Schema ref not found or expired' },
    ],
    'repl.render': [
      { code: 'OODS-V006', desc: 'Unknown component (no renderer)' },
      { code: 'OODS-N002', desc: 'Schema ref not found or expired' },
    ],
    'code.generate': [
      { code: 'OODS-V005', desc: 'No emitter is registered for the requested framework' },
      { code: 'OODS-V007', desc: 'UiSchema structure, normalization, syntax, binding, prop, slot, or event contract failed' },
      { code: 'OODS-V009', desc: 'Neither schema nor schemaRef was provided' },
      { code: 'OODS-V119', desc: 'Schema contains an unregistered component' },
      { code: 'OODS-V162', desc: 'Required release evidence is missing' },
      { code: 'OODS-V163', desc: 'Release evidence artifact hash does not match generated artifact' },
      { code: 'OODS-N003', desc: 'SchemaRef was not found' },
      { code: 'OODS-N004', desc: 'SchemaRef has expired' },
      { code: 'OODS-N013', desc: 'HTML renderer unavailable; fallback output is forbidden at build or release confidence' },
      { code: 'OODS-N015', desc: 'Component is unavailable for the requested React or Vue target' },
      { code: 'OODS-N016', desc: 'Generated artifact dependency closure is invalid' },
      { code: 'OODS-S006', desc: 'HTML rendering failed' },
    ],
    pipeline: [
      { code: 'OODS-V003', desc: 'Compose input is missing a usable intent or object' },
      { code: 'OODS-V006', desc: 'Validation found a component outside the OODS registry' },
      { code: 'OODS-V007', desc: 'Validation or code-generation schema/target contract failed' },
      { code: 'OODS-V008', desc: 'Validation found duplicate node IDs' },
      { code: 'OODS-V119', desc: 'Code generation found an unregistered component' },
      { code: 'OODS-V162', desc: 'Code generation is missing required release evidence' },
      { code: 'OODS-V163', desc: 'Release evidence artifact hash does not match generated artifact' },
      { code: 'OODS-N003', desc: 'A pipeline SchemaRef was not found' },
      { code: 'OODS-N004', desc: 'A pipeline SchemaRef expired' },
      { code: 'OODS-N013', desc: 'HTML renderer unavailable; fallback output is forbidden at build or release confidence' },
      { code: 'OODS-N015', desc: 'Component is unavailable for the requested React or Vue target' },
      { code: 'OODS-N016', desc: 'Generated artifact dependency closure is invalid' },
      { code: 'OODS-N017', desc: 'Code generation reported success without an artifact envelope' },
      { code: 'OODS-C001', desc: 'Compose completed without returning a SchemaRef' },
      { code: 'OODS-S004', desc: 'Compose could not load the requested object' },
      { code: 'OODS-S005', desc: 'Compose could not load the component catalog' },
      { code: 'OODS-S006', desc: 'HTML rendering failed during code generation' },
      { code: 'OODS-S009', desc: 'A failed step omitted its structured issue, or code generation returned a missing, invalid, downgraded, or target-mismatched receipt/artifact' },
      { code: 'OODS-S010', desc: 'Compose step threw an exception' },
      { code: 'OODS-S011', desc: 'Validate step threw an exception' },
      { code: 'OODS-S012', desc: 'Render step threw an exception' },
      { code: 'OODS-S013', desc: 'Code-generation step threw an exception' },
      { code: 'OODS-S014', desc: 'Save step threw an exception' },
    ],
    'schema.save': [
      { code: 'OODS-V004', desc: 'Invalid slug format for schema name' },
      { code: 'OODS-N002', desc: 'Schema ref not found or expired' },
    ],
    'schema.load': [
      { code: 'OODS-N003', desc: 'Saved schema not found' },
    ],
    'schema.delete': [
      { code: 'OODS-N003', desc: 'Saved schema not found' },
    ],
    'object.show': [
      { code: 'OODS-N001', desc: 'Object not found in registry' },
    ],
    'map.create': [
      { code: 'OODS-V001', desc: 'Invalid mapping definition' },
    ],
    'map.resolve': [
      { code: 'OODS-N004', desc: 'Mapping not found' },
    ],
    'map.update': [
      { code: 'OODS-N004', desc: 'Mapping not found' },
    ],
    'map.delete': [
      { code: 'OODS-N004', desc: 'Mapping not found' },
    ],
  };

  const codes = [...common, ...(specific[toolName] ?? [])];

  const lines = [
    '| Code | Description |',
    '|------|-------------|',
  ];
  for (const { code, desc } of codes) {
    lines.push(`| \`${code}\` | ${desc} |`);
  }

  return lines.join('\n') + '\n';
}

function buildExampleBlock(inputSchema: JsonSchema): string {
  const declaredExample = inputSchema.examples?.[0];
  if (declaredExample !== undefined) {
    return [
      '```json',
      JSON.stringify(declaredExample, null, 2),
      '```',
    ].join('\n') + '\n';
  }

  // Build a minimal example from schema properties
  const example: Record<string, unknown> = {};

  if (inputSchema.properties) {
    const requiredSet = new Set(inputSchema.required ?? []);
    // Also check anyOf required — take first clause
    if (inputSchema.anyOf?.[0]?.required) {
      inputSchema.anyOf[0].required.forEach((r) => requiredSet.add(r));
    }

    for (const [name, prop] of Object.entries(inputSchema.properties)) {
      if (!requiredSet.has(name)) continue;
      if (prop.enum) example[name] = prop.enum[0];
      else if (prop.type === 'string') example[name] = `<${name}>`;
      else if (prop.type === 'integer' || prop.type === 'number') example[name] = prop.minimum ?? 0;
      else if (prop.type === 'boolean') example[name] = true;
      else if (prop.type === 'array') example[name] = [];
      else if (prop.type === 'object') example[name] = {};
    }
  }

  return [
    '```json',
    JSON.stringify(example, null, 2),
    '```',
  ].join('\n') + '\n';
}

function visualizationCoverage(toolName: string): string {
  if (!['viz.render', 'dashboard.render', 'artifact.certify'].includes(toolName)) return '';
  const recipes = readJson<Array<{ chartType: string; specEngine: string; publicSvg: boolean; dashboardDrawn: boolean | string; themes: Record<string, boolean>; brands: string[]; certifyCoverage: string; contrastMeasured: string[]; chartInApp: string; notes: string[] }>>(VIZ_RECIPES_PATH);
  const count = (predicate: (row: typeof recipes[number]) => boolean) => recipes.filter(predicate).length;
  return [
    '## Measured visualization coverage', '',
    'Derived from `packages/viz-core/src/registry/viz-recipes.v1.json`, checked against the public-handler census.', '',
    `Public SVG: ${count(row => row.publicSvg)}/${recipes.length}. Dashboard SVG panels: ${count(row => row.dashboardDrawn === true)}/${recipes.length}. Certification coverage: ${count(row => row.certifyCoverage === 'certified')} certified / ${count(row => row.certifyCoverage === 'uncertified')} uncertified; uncertified results keep conformant:null.`, '',
    `Theme parameters: light (${count(row => row.themes.light)}/${recipes.length}) and dark (${count(row => row.themes.dark)}/${recipes.length}); HC pixels (${count(row => row.themes.hc)}/${recipes.length}) are deferred. Brand parameters: ${[...new Set(recipes.flatMap(row => row.brands))].join(', ')}. Default scope is light/A.`, '',
    'Contrast measurement records actual categorical canvas grades, including failures; exemptions and unchecked results do not count as measured passes. The four cartesian accuracy rules remain a closed set (V150–V153); the ECharts set remains V154–V159 with per-type applicability.', '',
    '| Type | Engine | Dashboard | Certification | Contrast measured | Application |',
    '| --- | --- | --- | --- | --- | --- |',
    ...recipes.map(row => `| ${row.chartType} | ${row.specEngine} | ${row.dashboardDrawn} | ${row.certifyCoverage} | ${row.contrastMeasured.join(', ') || 'none (exempt)'} | ${row.chartInApp} |`), '',
    ...[...new Set(recipes.flatMap(row => row.notes))].map(note => `- ${note}`), '',
  ].join('\n');
}

function generateToolDoc(
  toolName: string,
  description: string,
  inputSchema: JsonSchema,
  outputSchema: JsonSchema,
  tier: 'auto' | 'on-demand',
): string {
  const lines: string[] = [];

  lines.push(`# ${toolName}\n`);
  lines.push(`> ${description}\n`);
  lines.push(`**Registration:** ${tier}\n`);

  const coverage = visualizationCoverage(toolName);
  if (coverage) lines.push(coverage);

  lines.push(`## Input Parameters\n`);
  lines.push(buildParamsTable(inputSchema));

  lines.push(`## Output Shape\n`);
  lines.push(buildOutputShape(outputSchema));

  lines.push(`## Error Codes\n`);
  lines.push(buildErrorCodes(toolName));

  lines.push(`## Example Request\n`);
  lines.push(buildExampleBlock(inputSchema));

  return lines.join('\n');
}

function generateIndex(tools: Array<{ name: string; description: string; tier: string }>): string {
  const lines: string[] = [];

  lines.push(`# OODS Foundry API Reference\n`);
  lines.push(`Auto-generated from JSON schemas and tool-descriptions.json.\n`);

  // Group by tier
  const auto = tools.filter((t) => t.tier === 'auto');
  const onDemand = tools.filter((t) => t.tier === 'on-demand');

  lines.push(`## Auto-registered Tools\n`);
  lines.push('| Tool | Description |');
  lines.push('|------|-------------|');
  for (const t of auto) {
    lines.push(`| [${t.name}](./${toolSlug(t.name)}.md) | ${t.description} |`);
  }
  lines.push('');

  if (onDemand.length > 0) {
    lines.push(`## On-demand Tools\n`);
    lines.push('| Tool | Description |');
    lines.push('|------|-------------|');
    for (const t of onDemand) {
      lines.push(`| [${t.name}](./${toolSlug(t.name)}.md) | ${t.description} |`);
    }
    lines.push('');
  }

  return lines.join('\n');
}

// ── Main ──────────────────────────────────────────────────────────────────

// sprint-125 m05: --check regenerates into memory and compares against the
// committed docs/api/* — exit 1 on any diff — so a schema/description change that
// isn't re-baked reds CI (mirrors the schemas-tools generate-types.ts --check
// freshness gate). Preferred over `git diff --exit-code`, which would false-fail
// on any unrelated dirty generated file. A bare `--` (from `pnpm ... -- --check`)
// is ignored by the includes() check.
const CHECK = process.argv.slice(2).includes('--check');

const descriptions = readJson<Record<string, string>>(DESCRIPTIONS_PATH);
const registry = readJson<{ auto: string[]; onDemand: string[] }>(REGISTRY_PATH);

const allTools = [
  ...registry.auto.map((name) => ({ name, tier: 'auto' as const })),
  ...registry.onDemand.map((name) => ({ name, tier: 'on-demand' as const })),
];

// Compute every output file's content IN MEMORY first, so --check can compare
// against the committed copy without touching the filesystem.
const outputs = new Map<string, string>();
const indexEntries: Array<{ name: string; description: string; tier: string }> = [];

for (const { name, tier } of allTools) {
  const inputPath = path.join(SCHEMAS_DIR, `${name}.input.json`);
  const outputPath = path.join(SCHEMAS_DIR, `${name}.output.json`);

  // Some tools use generic schemas
  const inputFallback = path.join(SCHEMAS_DIR, 'generic.input.json');
  const outputFallback = path.join(SCHEMAS_DIR, 'generic.output.json');

  const inputFile = fs.existsSync(inputPath) ? inputPath : (fs.existsSync(inputFallback) ? inputFallback : null);
  const outputFile = fs.existsSync(outputPath) ? outputPath : (fs.existsSync(outputFallback) ? outputFallback : null);

  if (!inputFile) {
    console.warn(`Skipping ${name}: no input schema found`);
    continue;
  }

  const inputSchema = readJson<JsonSchema>(inputFile);
  const outputSchema = outputFile ? readJson<JsonSchema>(outputFile) : { type: 'object' as const, properties: {} };
  const description = descriptions[name] ?? `MCP tool: ${name}`;

  const markdown = generateToolDoc(name, description, inputSchema, outputSchema, tier);
  outputs.set(path.join(OUT_DIR, `${toolSlug(name)}.md`), markdown);
  indexEntries.push({ name, description, tier });
}

outputs.set(path.join(OUT_DIR, 'README.md'), generateIndex(indexEntries));

// ORPHAN DETECTION (feedback-73): a doc for a REMOVED tool is invisible to the
// content diff above (it is simply never regenerated). Enumerate the .md files that
// exist on disk but are not in `outputs` — those are orphans from a retired tool and
// must be pruned (write mode) or fail the gate (--check).
const expectedBasenames = new Set([...outputs.keys()].map((f) => path.basename(f)));
const orphans = fs.existsSync(OUT_DIR)
  ? fs
      .readdirSync(OUT_DIR)
      .filter((f) => f.endsWith('.md') && !expectedBasenames.has(f))
      .map((f) => path.join(OUT_DIR, f))
  : [];

if (CHECK) {
  const stale: string[] = [];
  for (const [file, content] of outputs) {
    const current = fs.existsSync(file) ? fs.readFileSync(file, 'utf-8') : null;
    if (current !== content) {
      stale.push(path.relative(ROOT, file));
    }
  }
  if (stale.length > 0 || orphans.length > 0) {
    if (stale.length > 0) {
      console.error(`✗ docs/api is STALE — ${stale.length} file(s) differ from the schemas/descriptions. Re-run \`pnpm run docs:api\` and commit:`);
      for (const f of stale) console.error(`  - ${f}`);
    }
    if (orphans.length > 0) {
      console.error(`✗ docs/api has ${orphans.length} ORPHANED doc(s) for retired/unregistered tool(s). Re-run \`pnpm run docs:api\` to prune and commit:`);
      for (const f of orphans) console.error(`  - ${path.relative(ROOT, f)}`);
    }
    process.exit(1);
  }
  console.log(`✔ docs/api is fresh (${outputs.size} files checked, no orphans).`);
} else {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  for (const [file, content] of outputs) {
    fs.writeFileSync(file, content, 'utf-8');
  }
  // PRUNE orphaned docs for retired tools so a removed tool never leaks a stale page.
  for (const orphan of orphans) {
    fs.rmSync(orphan);
    console.log(`Pruned orphaned doc: ${path.relative(ROOT, orphan)}`);
  }
  console.log(`Generated ${outputs.size} API reference docs in ${OUT_DIR}${orphans.length ? ` (pruned ${orphans.length} orphan(s))` : ''}`);
  console.log(`Index: ${path.join(OUT_DIR, 'README.md')}`);
}
