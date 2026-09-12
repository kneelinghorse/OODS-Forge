import fs from 'node:fs';
import path from 'node:path';

/** Match the server's policy resolution from either a checkout or an extracted bundle. */
export function resolveBridgeArtifacts(serverCwd: string): { artifactsRoot: string; artifactsBase: string } {
  const builtPolicy = path.join(serverCwd, 'dist/security/policy.json');
  const policyPath = fs.existsSync(builtPolicy) ? builtPolicy : path.join(serverCwd, 'src/security/policy.json');
  const policy = JSON.parse(fs.readFileSync(policyPath, 'utf8')) as { artifactsBase?: string };
  const target = policy.artifactsBase?.trim() || 'artifacts/current-state';
  const artifactsBase = path.isAbsolute(target) ? target : path.resolve(serverCwd, '../..', target);
  return { artifactsRoot: path.dirname(artifactsBase), artifactsBase };
}
