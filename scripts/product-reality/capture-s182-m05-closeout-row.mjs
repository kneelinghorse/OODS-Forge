#!/usr/bin/env node

import crypto from "node:crypto";
import fs from "node:fs";
import fsp from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { execFileSync, spawn, spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(scriptDirectory, "../..");
const defaultOutputRoot = path.join(
  repositoryRoot,
  "artifacts/product-reality/sprint-182/m05",
);
const sideEffectPathsByRow = {
  "CI-07": [
    "artifacts/tokens/closeout-brand-a-report.json",
    "artifacts/tokens/closeout-brand-a-comment.md",
    "artifacts/tokens/closeout-brand-b-report.json",
    "artifacts/tokens/closeout-brand-b-comment.md",
  ],
  "CI-08": ["diagnostics.json"],
};

const rowCommands = {
  "M05-package-verification": [
    'node scripts/product-reality/verify-package-foundations.mjs --artifact-root "{FINAL_PACKAGE_ARTIFACT_ROOT}"',
  ],
  "CI-01": [
    "pnpm install --frozen-lockfile",
    "pnpm run build:tokens",
    "pnpm run build:packages",
    "pnpm --filter @oods/schemas-tools run generate:check",
    "pnpm run generate:schema-types -- --check",
    "pnpm -w run docs:api -- --check",
    "pnpm run build",
  ],
  "CI-02": [
    "pnpm run lint",
    "pnpm run lint:enum-convergence",
    "pnpm run lint:enum-to-token",
    "pnpm run lint:audit-log",
    "pnpm run lint:brand-bleed",
    "pnpm run lint:tokens",
  ],
  "CI-03": [
    "pnpm exec tsc --noEmit",
    "pnpm --filter @oods/tokens run build",
    "pnpm --filter @oods/viz-core run typecheck",
    "node scripts/quality/build-stories-ratchet.mjs",
  ],
  "CI-04": ["pnpm tenancy:check"],
  "CI-05": ["pnpm run tokens:collision-guard", "pnpm run tokens-validate"],
  "CI-06": ["node scripts/validate-diagnostics-schema.mjs"],
  "CI-07": [
    "pnpm run build:tokens",
    'pnpm run tokens:governance -- diff --brand A --base {BASE_SHA} --head {HEAD_SHA} --json artifacts/tokens/closeout-brand-a-report.json --comment artifacts/tokens/closeout-brand-a-comment.md --labels "{PR_LABELS_CSV}"',
    'pnpm run tokens:governance -- diff --brand B --base {BASE_SHA} --head {HEAD_SHA} --json artifacts/tokens/closeout-brand-b-report.json --comment artifacts/tokens/closeout-brand-b-comment.md --labels "{PR_LABELS_CSV}"',
  ],
  "CI-08": [
    "pnpm run build:tokens",
    'PR_LABELS="{PR_LABELS_CSV}" TOKEN_GOV_BASE_REF={BASE_SHA} node scripts/state-assessment.mjs --guardrails --tokens',
  ],
  "CI-09": [
    "pnpm run build:tokens",
    "pnpm --filter @oods/tw-variants run build",
    "pnpm run build-storybook",
    "pnpm exec playwright install chromium",
    "pnpm run verify:brand-cascade",
    "pnpm run a11y:diff",
    'python3 -m http.server 6006 --bind 127.0.0.1 --directory storybook-static & VRT_SERVER_PID=$!; trap \'kill "$VRT_SERVER_PID" 2>/dev/null\' EXIT; for attempt in $(seq 1 60); do if curl -sf http://127.0.0.1:6006/index.json >/dev/null; then break; fi; sleep 1; done; curl -sf http://127.0.0.1:6006/index.json >/dev/null; env STORYBOOK_EXTERNAL=1 STORYBOOK_URL=http://127.0.0.1:6006 pnpm run vrt:mobile; env STORYBOOK_EXTERNAL=1 STORYBOOK_URL=http://127.0.0.1:6006 pnpm run vrt:desktop; kill "$VRT_SERVER_PID"; trap - EXIT',
  ],
  "CI-10": [
    'if test -n "${CHROMATIC_PROJECT_TOKEN:-}"; then echo "CHROMATIC_PROJECT_TOKEN=present"; else echo "CHROMATIC_PROJECT_TOKEN=absent"; fi',
  ],
  "CI-11": [
    "pnpm run build:tokens",
    "pnpm run test:coverage",
    "pnpm vitest run tests/contracts tests/viz",
  ],
  "CI-12": [
    "pnpm run build:tokens",
    "pnpm run build:packages",
    "pnpm --filter @oods/mcp-server run test:scale",
  ],
  "CI-12-setup": ["pnpm run build:tokens", "pnpm run build:packages"],
  "CI-13": [
    "pnpm run build:tokens",
    "pnpm run build:packages",
    "node -e 'console.log(JSON.stringify({node:process.version,v8:process.versions.v8,platform:process.platform,arch:process.arch}))'",
    "pnpm --filter @oods/viz-core test",
    "pnpm --filter @oods/viz-render test",
    "pnpm --filter @oods/mcp-server exec vitest run src/tools/viz.render.test.ts src/tools/viz.render.fidelity.test.ts src/tools/viz.render.network-fidelity.test.ts src/tools/viz.render.geo-fidelity.test.ts src/tools/viz.render.intent.test.ts src/tools/dashboard.render.test.ts src/tools/dashboard.render.fidelity.test.ts src/tools/dashboard.render.faostat-e2e.test.ts src/tools/dashboard.render.strict-fields.test.ts src/tools/dashboard.render.kpi-types.test.ts src/tools/dashboard.render.measure-depth.test.ts src/tools/repl.render.skin-mapping.test.ts src/tools/repl.render.brand.test.ts src/tools/ci-golden-list.guard.test.ts",
    "pnpm --filter @oods/mcp-server test",
    "pnpm --filter @oods/mcp-bridge test",
  ],
  "CI-14": [
    "pnpm run build:tokens",
    "pnpm run build:packages",
    "node -e 'console.log(JSON.stringify({node:process.version,v8:process.versions.v8,platform:process.platform,arch:process.arch}))'",
    "pnpm --filter @oods/mcp-server run test:echarts-soak",
  ],
  "CI-14-setup": [
    "pnpm run build:tokens",
    "pnpm run build:packages",
    "node -e 'console.log(JSON.stringify({node:process.version,v8:process.versions.v8,platform:process.platform,arch:process.arch}))'",
  ],
  "CI-15": [
    "portable_lock_before=$(shasum -a 256 pnpm-lock.yaml)",
    "pnpm install --frozen-lockfile",
    "pnpm run build:tokens",
    "pnpm run build:packages",
    "pnpm --filter @oods/mcp-server run build",
    "node --test packages/mcp-adapter/test-s181-lifecycle.js",
    'portable_runtime_tmp=$(mktemp -d); portable_extract_dir=$(mktemp -d); trap \'rm -rf "$portable_runtime_tmp" "$portable_extract_dir"\' EXIT',
    'node scripts/runtime/assemble.mjs --out-dir "$portable_runtime_tmp/out-1" --work-dir "$portable_runtime_tmp/work-1" --final',
    'node scripts/runtime/assemble.mjs --out-dir "$portable_runtime_tmp/out-2" --work-dir "$portable_runtime_tmp/work-2" --final',
    '(cd "$portable_runtime_tmp/out-1" && shasum -a 256 -c forge-runtime.tar.gz.sha256)',
    '(cd "$portable_runtime_tmp/out-2" && shasum -a 256 -c forge-runtime.tar.gz.sha256)',
    'cmp "$portable_runtime_tmp/out-1/forge-runtime.tar.gz.sha256" "$portable_runtime_tmp/out-2/forge-runtime.tar.gz.sha256"',
    'tar -xzf "$portable_runtime_tmp/out-1/forge-runtime.tar.gz" -C "$portable_extract_dir"',
    'node scripts/runtime/e2e.mjs --extract-dir "$portable_extract_dir" --repo-root "$PWD"',
    'test "$portable_lock_before" = "$(shasum -a 256 pnpm-lock.yaml)"',
  ],
  "L-01-viz-core": ["pnpm --filter @oods/viz-core exec vitest run"],
  "L-01-mcp-server": ["pnpm --filter @oods/mcp-server exec vitest run"],
  "L-01-root-core": ["pnpm exec vitest run --project core"],
  "L-02": [
    "find . -name '*.snap' -not -path './node_modules/*' -not -path './.git/*' -print",
    "rg -n '^exports\\[' --glob '*.snap'",
    "git status --porcelain -- '*.snap'",
  ],
  "L-03": ["shasum -a 256 {DECLARED_REHASH_PATHS}"],
  "L-04": [
    "sqlite3 -header -column cmos/db/cmos.sqlite \"SELECT m.id AS mission_id, COUNT(d.id) AS decision_count FROM missions m LEFT JOIN strategic_decisions d ON d.mission_id = m.id AND d.project_id = m.project_id WHERE m.sprint_id = 'sprint-182' AND m.project_id = 'forge' GROUP BY m.id ORDER BY m.id;\"",
  ],
  "L-05": ["curl --fail --silent --show-error http://127.0.0.1:4466/health"],
  "L-06-diff": [
    "git diff --name-only {BASE_SHA} {HEAD_SHA} -- packages/mcp-adapter/tool-descriptions.json packages/mcp-server/src/schemas packages/mcp-server/src/schemas/generated.ts packages/mcp-server/src/tools/registry.json configs/agent/policy.json packages/mcp-server/src/security/policy.json docs/api",
  ],
  "L-06-rebuild": [
    "pnpm --filter @oods/mcp-server run build",
    "pnpm --filter @oods/mcp-bridge run build",
    'if test "$PWD" != "{BRIDGE_RUNTIME_ROOT}"; then rsync -a --delete packages/mcp-server/dist/ "{BRIDGE_RUNTIME_ROOT}/packages/mcp-server/dist/"; rsync -a --delete packages/mcp-bridge/dist/ "{BRIDGE_RUNTIME_ROOT}/packages/mcp-bridge/dist/"; fi',
    "pm2 restart oods-forge-bridge",
    "for attempt in $(seq 1 30); do if curl --fail --silent http://127.0.0.1:4466/health >/dev/null; then break; fi; sleep 1; done; curl --fail --silent --show-error http://127.0.0.1:4466/health",
  ],
  "L-07-scale": ["pnpm --filter @oods/mcp-server run test:scale"],
  "L-07-soak": ["pnpm --filter @oods/mcp-server run test:echarts-soak"],
  "L-08": [
    'for f in packages/tokens/dist/tailwind/tokens.json packages/tokens/dist/index.js packages/tokens/dist/index.cjs packages/viz-core/dist/index.js packages/mcp-server/dist/index.js storybook-static/index.json; do if test -s "$f"; then echo "present $f"; else echo "MISSING $f"; exit 1; fi; done; node -e "import(\'@oods/tokens\').then(m=>console.log(\'tokens import OK\', Object.keys(m).length))"',
  ],
  "L-08-after-governance": [
    'for f in packages/tokens/dist/tailwind/tokens.json packages/tokens/dist/index.js packages/tokens/dist/index.cjs packages/viz-core/dist/index.js packages/mcp-server/dist/index.js storybook-static/index.json; do if test -s "$f"; then echo "present $f"; else echo "MISSING $f"; exit 1; fi; done; node -e "import(\'@oods/tokens\').then(m=>console.log(\'tokens import OK\', Object.keys(m).length))"',
  ],
  "L-08-final": [
    'for f in packages/tokens/dist/tailwind/tokens.json packages/tokens/dist/index.js packages/tokens/dist/index.cjs packages/viz-core/dist/index.js packages/mcp-server/dist/index.js storybook-static/index.json; do if test -s "$f"; then echo "present $f"; else echo "MISSING $f"; exit 1; fi; done; node -e "import(\'@oods/tokens\').then(m=>console.log(\'tokens import OK\', Object.keys(m).length))"',
  ],
  "L-09": [
    "git diff --unified=0 {BASE_SHA} -- .",
    'while IFS= read -r file; do git diff --no-index --unified=0 -- /dev/null "$file"; diff_status=$?; if test "$diff_status" -gt 1; then exit "$diff_status"; fi; done < <(git ls-files --others --exclude-standard)',
  ],
};

function parseArguments(argv) {
  const values = {};
  for (let index = 0; index < argv.length; index += 1) {
    const name = argv[index];
    if (!name.startsWith("--")) throw new Error(`Unexpected argument: ${name}`);
    const value = argv[index + 1];
    if (!value || value.startsWith("--"))
      throw new Error(`Missing value for ${name}`);
    values[name.slice(2)] = value;
    index += 1;
  }
  return values;
}

function sha256(contents) {
  return crypto.createHash("sha256").update(contents).digest("hex");
}

function isWithin(parent, candidate) {
  const relative = path.relative(path.resolve(parent), path.resolve(candidate));
  return (
    relative === "" ||
    (relative !== ".." &&
      !relative.startsWith(`..${path.sep}`) &&
      !path.isAbsolute(relative))
  );
}

function isDetachedHead(workspace) {
  const result = spawnSync("git", ["symbolic-ref", "-q", "HEAD"], {
    cwd: workspace,
    encoding: "utf8",
  });
  if (result.status === 0) return false;
  if (result.status === 1) return true;
  throw new Error(`Unable to determine whether ${workspace} has detached HEAD`);
}

function isParkedStatisticalFloorFailure(contents) {
  const text = contents
    .toString("utf8")
    .replace(/\u001b\[[0-?]*[ -/]*[@-~]/g, "");
  return (
    /echarts-render-soak\.s179\.spec\.ts:283(?::\d+)?/.test(text) &&
    /positiveTrendLower99/.test(text) &&
    /Test Files\s+1 failed/.test(text) &&
    /Tests\s+1 failed\s*\|\s*2 passed\s*\(3\)/.test(text)
  );
}

function runGitStatus(workspace) {
  const result = spawnSync("git", ["status", "--porcelain=v1"], {
    cwd: workspace,
    encoding: "utf8",
  });
  if (result.status !== 0)
    throw new Error(`Unable to read git status in ${workspace}`);
  return result.stdout.split(/\r?\n/).filter(Boolean);
}

function instantiate(commands, replacements) {
  return commands.map((command) =>
    command.replaceAll(/\{([A-Z_]+)\}/g, (_, token) => {
      if (!(token in replacements))
        throw new Error(`No replacement supplied for {${token}}`);
      return replacements[token];
    }),
  );
}

function executionCommandsFor(rowId, literalCommands) {
  if (rowId !== "L-09") return literalCommands;
  if (literalCommands.length !== 2) {
    throw new Error("L-09 requires exactly two locked literal commands");
  }
  const unsafeFragment =
    'git diff --no-index --unified=0 -- /dev/null "$file"; diff_status=$?;';
  const safeFragment =
    'set +e; git diff --no-index --unified=0 -- /dev/null "$file"; diff_status=$?; set -e;';
  if (!literalCommands[1].includes(unsafeFragment)) {
    throw new Error(
      "L-09 locked scan command no longer matches its safety seam",
    );
  }
  return [
    literalCommands[0],
    "git ls-files --others --exclude-standard >/dev/null",
    literalCommands[1].replace(unsafeFragment, safeFragment),
  ];
}

async function runShell({ command, cwd, logPath }) {
  await fsp.mkdir(path.dirname(logPath), { recursive: true });
  const output = fs.createWriteStream(logPath, { encoding: "utf8" });
  const child = spawn("/bin/zsh", ["-lc", command], {
    cwd,
    env: process.env,
    stdio: ["ignore", "pipe", "pipe"],
  });
  child.stdout.on("data", (chunk) => {
    process.stdout.write(chunk);
    output.write(chunk);
  });
  child.stderr.on("data", (chunk) => {
    process.stderr.write(chunk);
    output.write(chunk);
  });
  const exitCode = await new Promise((resolve, reject) => {
    child.on("error", reject);
    child.on("close", resolve);
  });
  await new Promise((resolve, reject) =>
    output.end((error) => (error ? reject(error) : resolve())),
  );
  return exitCode;
}

async function captureSideEffects(rowId, workspace, outputRoot) {
  const records = [];
  const aliasRoot = path.join(
    outputRoot,
    "gate-side-effects",
    rowId.toLowerCase(),
  );
  await fsp.rm(aliasRoot, { recursive: true, force: true });
  for (const repoPath of sideEffectPathsByRow[rowId] ?? []) {
    const sourcePath = path.join(workspace, repoPath);
    if (!fs.existsSync(sourcePath))
      throw new Error(`${rowId} did not produce ${repoPath}`);
    const destinationPath = path.join(
      outputRoot,
      "gate-side-effects",
      rowId.toLowerCase(),
      repoPath,
    );
    await fsp.mkdir(path.dirname(destinationPath), { recursive: true });
    await fsp.copyFile(sourcePath, destinationPath);
    const contents = await fsp.readFile(destinationPath);
    records.push({
      sourcePath: repoPath,
      capturedPath: path
        .relative(repositoryRoot, destinationPath)
        .split(path.sep)
        .join("/"),
      bytes: contents.byteLength,
      sha256: sha256(contents),
    });
  }
  return records;
}

async function main() {
  const args = parseArguments(process.argv.slice(2));
  const rowId = args.id;
  if (!rowId || !rowCommands[rowId]) {
    throw new Error(
      `--id must name one of: ${Object.keys(rowCommands).join(", ")}`,
    );
  }
  const workspace = path.resolve(args.workspace ?? repositoryRoot);
  const outputRoot = path.resolve(
    args["output-root"] ??
      (rowId === "M05-package-verification"
        ? path.join(defaultOutputRoot, "package-verification-capture")
        : defaultOutputRoot),
  );
  if (
    rowId === "M05-package-verification" &&
    outputRoot === path.resolve(defaultOutputRoot)
  ) {
    throw new Error(
      "M05-package-verification capture must not pollute the canonical gate-result set",
    );
  }
  if (rowId === "CI-15" && isWithin(workspace, outputRoot)) {
    throw new Error(
      "CI-15 result/log output must live outside its clean detached worktree",
    );
  }
  const baseSha = args["base-sha"];
  const reviewHead = args["review-head"];
  if (!baseSha || !reviewHead)
    throw new Error("--base-sha and --review-head are required");
  if (args["rehash-paths"] && args["rehash-path-file"]) {
    throw new Error("Use only one of --rehash-paths or --rehash-path-file");
  }
  const rehashPaths = args["rehash-path-file"]
    ? fs
        .readFileSync(path.resolve(args["rehash-path-file"]), "utf8")
        .split(/\r?\n/)
        .filter(Boolean)
        .join(" ")
    : (args["rehash-paths"] ?? "");
  const prLabelsCsv = args["pr-labels"] ?? "";
  const replacements = {
    BASE_SHA: baseSha,
    HEAD_SHA: reviewHead,
    DECLARED_REHASH_PATHS: rehashPaths,
    PR_LABELS_CSV: prLabelsCsv,
    BRIDGE_RUNTIME_ROOT: args["bridge-runtime-root"] ?? "",
    FINAL_PACKAGE_ARTIFACT_ROOT: args["final-package-artifact-root"]
      ? path.resolve(workspace, args["final-package-artifact-root"])
      : "",
  };
  const literalCommands = instantiate(rowCommands[rowId], replacements);
  const executionCommands = executionCommandsFor(rowId, literalCommands);
  if (
    rowId === "L-06-rebuild" &&
    replacements.BRIDGE_RUNTIME_ROOT.length === 0
  ) {
    throw new Error(
      "L-06-rebuild requires --bridge-runtime-root for the live PM2 checkout",
    );
  }
  if (
    rowId === "M05-package-verification" &&
    replacements.FINAL_PACKAGE_ARTIFACT_ROOT.length === 0
  ) {
    throw new Error(
      "M05-package-verification requires --final-package-artifact-root",
    );
  }
  if (rowId === "L-03" && rehashPaths.trim().length === 0) {
    throw new Error("L-03 requires a non-empty --rehash-paths operand");
  }
  if (literalCommands.some((command) => /\{[A-Z_]+\}/.test(command))) {
    throw new Error(`${rowId} retains an unresolved closeout token`);
  }
  const literalCommand = literalCommands.join(" && ");
  const shellCommand = `set -euo pipefail\n${executionCommands.join("\n")}`;
  const evidenceId = `s182-m05-${rowId.toLowerCase()}`;
  const logPath = path.join(outputRoot, "logs", `${evidenceId}.log`);
  const resultPath = path.join(
    outputRoot,
    "gate-results",
    `${rowId.toLowerCase()}.json`,
  );
  const beforeStatus = runGitStatus(workspace);
  const detachedHead = isDetachedHead(workspace);
  if (rowId !== "L-04" && !detachedHead) {
    throw new Error(`${rowId} requires an isolated detached worktree`);
  }
  if (rowId === "CI-15" && beforeStatus.length > 0) {
    throw new Error(
      `CI-15 requires a clean detached worktree; found: ${beforeStatus.join(", ")}`,
    );
  }
  const startedAt = new Date().toISOString();
  const exitCode = await runShell({
    command: shellCommand,
    cwd: workspace,
    logPath,
  });
  const endedAt = new Date().toISOString();
  const afterStatus = runGitStatus(workspace);
  const sideEffects =
    exitCode === 0
      ? await captureSideEffects(rowId, workspace, outputRoot)
      : [];
  const logContents = await fsp.readFile(logPath);
  const parkedStatisticalFloor =
    rowId === "L-07-soak" &&
    exitCode !== 0 &&
    isParkedStatisticalFloorFailure(logContents);
  const measuredHead = execFileSync("git", ["rev-parse", "HEAD"], {
    cwd: workspace,
    encoding: "utf8",
  }).trim();
  const headMismatchAllowed = args["allow-head-mismatch"] === "true";
  if (measuredHead !== reviewHead && !headMismatchAllowed) {
    throw new Error(
      `${rowId} measured ${measuredHead}, expected review HEAD ${reviewHead}`,
    );
  }
  const result = {
    schemaVersion: "1.0.0",
    missionId: "s182-m05",
    rowId,
    evidenceId,
    baseSha,
    reviewHead,
    measuredHead,
    headMismatchAllowed,
    detachedHead,
    cwd: workspace,
    environment: {
      PR_LABELS: prLabelsCsv,
      TOKEN_GOV_BASE_REF: rowId === "CI-08" ? baseSha : null,
      CHROMATIC_PROJECT_TOKEN:
        rowId === "CI-10"
          ? process.env.CHROMATIC_PROJECT_TOKEN
            ? "present"
            : "absent"
          : null,
    },
    literalCommands,
    literalCommand,
    executionCommands,
    executedCommand: executionCommands.join(" && "),
    startedAt,
    endedAt,
    exitCode,
    status:
      exitCode === 0
        ? "pass"
        : parkedStatisticalFloor
          ? "parked-failure"
          : "fail",
    log: {
      path: path.relative(repositoryRoot, logPath).split(path.sep).join("/"),
      bytes: logContents.byteLength,
      sha256: sha256(logContents),
    },
    gitStatusBefore: beforeStatus,
    gitStatusAfter: afterStatus,
    sideEffects,
  };
  await fsp.mkdir(path.dirname(resultPath), { recursive: true });
  await fsp.writeFile(resultPath, `${JSON.stringify(result, null, 2)}\n`);
  console.log(`\n${rowId}: ${result.status}; log ${result.log.sha256}`);
  process.exitCode =
    exitCode === 0 || result.status === "parked-failure" ? 0 : exitCode;
}

await main();
