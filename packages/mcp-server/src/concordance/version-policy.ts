/**
 * Concordance wire-contract version policy (sprint-97 F2).
 *
 * Spec: cmos/foundational-docs/technical/concordance-integration.md §"Version Policy"
 *   exact          → OK
 *   patch mismatch → OK (INFO log once)
 *   minor mismatch → warn + continue
 *   major mismatch → fail-loud (ConcordanceVersionError)
 *
 * Forge pins schema_version "1.1.0" per the integration spec.
 */

import { ConcordanceVersionError } from './errors.js';

export const FORGE_SCHEMA_VERSION_PIN = '1.1.0';

export type VersionMatchKind = 'exact' | 'patch' | 'minor' | 'major';

export interface VersionComparison {
  kind: VersionMatchKind;
  expected: string;
  observed: string;
}

const SEMVER_RE = /^(\d+)\.(\d+)\.(\d+)$/;

function parse(version: string): [number, number, number] {
  const m = SEMVER_RE.exec(version);
  if (!m) throw new Error(`Invalid semver: ${version}`);
  return [Number(m[1]), Number(m[2]), Number(m[3])];
}

export function compareSchemaVersion(observed: string, expected: string): VersionComparison {
  const [eMajor, eMinor, ePatch] = parse(expected);
  const [oMajor, oMinor, oPatch] = parse(observed);
  if (oMajor !== eMajor) return { kind: 'major', expected, observed };
  if (oMinor !== eMinor) return { kind: 'minor', expected, observed };
  if (oPatch !== ePatch) return { kind: 'patch', expected, observed };
  return { kind: 'exact', expected, observed };
}

/**
 * Apply the three-tier version policy:
 *   - 'major' throws ConcordanceVersionError
 *   - 'minor' / 'patch' return a warning string
 *   - 'exact' returns null
 *
 * Caller layers (validator, client) decide how to surface warnings/info logs.
 */
export function applyVersionPolicy(observed: string, expected: string = FORGE_SCHEMA_VERSION_PIN): string | null {
  const cmp = compareSchemaVersion(observed, expected);
  switch (cmp.kind) {
    case 'major':
      throw new ConcordanceVersionError(cmp.expected, cmp.observed);
    case 'minor':
      return `schema_version minor mismatch: expected ${cmp.expected}, observed ${cmp.observed}. Continuing.`;
    case 'patch':
      return `schema_version patch mismatch: expected ${cmp.expected}, observed ${cmp.observed}. OK.`;
    case 'exact':
      return null;
  }
}
