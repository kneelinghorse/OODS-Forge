import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';
import type tokensBundle from '@oods/tokens';

const REPO_ROOT = fileURLToPath(new URL('../../../../', import.meta.url));

/** Operator configuration only: a tokens package root, never a wire operand. */
export function tokenPackageRoot(): string {
  return path.resolve(REPO_ROOT, process.env.MCP_BRAND_SOURCE_ROOT || 'packages/tokens');
}

export interface TokenBuildReceipt {
  exitCode: number | null;
  commands: Array<{ command: string[]; exitCode: number | null; stdout: string; stderr: string }>;
  durationMs: number;
}

/** Both stages are required: build.mjs emits CSS; build-entry.mjs resolves scoped values. */
export async function runTokenBuild(): Promise<TokenBuildReceipt> {
  const start = Date.now();
  const receipt: TokenBuildReceipt = { exitCode: 0, commands: [], durationMs: 0 };
  for (const script of ['build.mjs', 'build-entry.mjs']) {
    const command = [process.execPath, path.join(tokenPackageRoot(), 'scripts', script)];
    const result = await new Promise<TokenBuildReceipt['commands'][number]>((resolve) => {
      const result: TokenBuildReceipt['commands'][number] = { command, exitCode: null, stdout: '', stderr: '' };
      const child = spawn(command[0], command.slice(1), { cwd: tokenPackageRoot(), stdio: ['ignore', 'pipe', 'pipe'] });
      child.stdout.on('data', chunk => { result.stdout += chunk.toString(); });
      child.stderr.on('data', chunk => { result.stderr += chunk.toString(); });
      child.on('error', error => { result.stderr += error.message; resolve(result); });
      child.on('close', code => { result.exitCode = code; resolve(result); });
    });
    receipt.commands.push(result);
    receipt.exitCode = result.exitCode;
    if (result.exitCode !== 0) break;
  }
  receipt.durationMs = Date.now() - start;
  return receipt;
}

export function readTokenScopes(): typeof tokensBundle.cssVariablesByScope {
  return JSON.parse(fs.readFileSync(path.join(tokenPackageRoot(), 'dist/css-variables-by-scope.json'), 'utf8'));
}

/** Refresh existing references held by long-lived MCP renderers after a successful build. */
export async function refreshTokenBundle(): Promise<void> {
  const { default: tokensBundle } = await import('@oods/tokens');
  Object.assign(tokensBundle.cssVariablesByScope, readTokenScopes());
  const defaults = JSON.parse(fs.readFileSync(path.join(tokenPackageRoot(), 'dist/tailwind/tokens.json'), 'utf8'));
  for (const [target, source] of [[tokensBundle.tokens, defaults.tokens], [tokensBundle.flatTokens, defaults.flat], [tokensBundle.cssVariables, defaults.cssVariables]]) {
    for (const key of Object.keys(target)) delete target[key];
    Object.assign(target, source);
  }
}
