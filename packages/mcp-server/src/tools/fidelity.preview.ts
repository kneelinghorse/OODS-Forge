import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { emit as emitBoxesArrows } from '../codegen/boxes-arrows-emitter.js';
import { emit as emitWireframe } from '../codegen/wireframe-emitter.js';
import { emit as emitReview } from '../codegen/review-emitter.js';
import { emit as emitBrandedMockup } from '../codegen/branded-mockup-emitter.js';

export type FidelityKind = 'boxes-arrows' | 'wireframe' | 'review' | 'branded-mockup';

export type FidelityPreviewInput = {
  fidelityKind: FidelityKind;
  fixture: string;
  options?: {
    variant?: string;
    brandOverlay?: string;
    reviewThreshold?: number;
    includeStyles?: boolean;
  };
};

export type FidelityPreviewIssue = {
  code: string;
  message: string;
  entity?: string;
};

export type FidelityPreviewOutput = {
  status: 'ok' | 'warning' | 'error';
  fidelityKind: FidelityKind;
  fixture: string;
  html: string;
  warnings: FidelityPreviewIssue[];
  errors: FidelityPreviewIssue[];
  meta: {
    entityCount: number;
    appliedBrandOverlay?: string;
  };
};

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Server-resident fixtures the playground (or any caller) may name. Keeps
// fixture loading on a tight allow-list — no caller-supplied paths are
// resolved, eliminating path-traversal risk. Exported so other playground-
// affordance tools (review.chain) reuse the same allow-list rather than
// duplicating it.
const PACKAGE_ROOT = path.resolve(__dirname, '..', '..');
export const FIXTURE_PATHS: Record<string, string> = {
  user: path.join(PACKAGE_ROOT, 'src', 'object-catalog', 'fixtures', 'user.json'),
  product: path.join(PACKAGE_ROOT, 'src', 'object-catalog', 'fixtures', 'product.json'),
  subscription: path.join(PACKAGE_ROOT, 'src', 'object-catalog', 'fixtures', 'subscription.json'),
  article: path.join(PACKAGE_ROOT, 'src', 'object-catalog', 'fixtures', 'content', 'article.json'),
  author: path.join(PACKAGE_ROOT, 'src', 'object-catalog', 'fixtures', 'content', 'author.json'),
  comment: path.join(PACKAGE_ROOT, 'src', 'object-catalog', 'fixtures', 'content', 'comment.json'),
  'content-pack': path.join(PACKAGE_ROOT, 'test', 'fixtures', 'object-catalog', 'content-pack.json'),
  'billing-multi-entity': path.join(PACKAGE_ROOT, 'test', 'fixtures', 'object-catalog', 'billing-multi-entity.json'),
  'subscription-low-confidence': path.join(PACKAGE_ROOT, 'test', 'fixtures', 'object-catalog', 'subscription-low-confidence.json'),
};

export const FIXTURE_NAMES: ReadonlyArray<string> = Object.keys(FIXTURE_PATHS);

const SUPPORTED_KINDS = new Set<FidelityKind>(['boxes-arrows', 'wireframe', 'review', 'branded-mockup']);

function loadFixture(name: string): { manifest: unknown } {
  const filePath = FIXTURE_PATHS[name];
  if (!filePath) {
    throw Object.assign(new Error(`Unknown fixture '${name}'`), { code: 'OODS-FP-001' });
  }
  if (!fs.existsSync(filePath)) {
    throw Object.assign(new Error(`Fixture file missing on disk: ${filePath}`), { code: 'OODS-FP-002' });
  }
  const raw = fs.readFileSync(filePath, 'utf8');
  const manifest = JSON.parse(raw);
  return { manifest };
}

function countEntities(manifest: unknown): number {
  if (manifest && typeof manifest === 'object' && Array.isArray((manifest as { entities?: unknown[] }).entities)) {
    return (manifest as { entities: unknown[] }).entities.length;
  }
  return 0;
}

export async function handle(input: FidelityPreviewInput): Promise<FidelityPreviewOutput> {
  const { fidelityKind, fixture, options = {} } = input;

  if (!SUPPORTED_KINDS.has(fidelityKind)) {
    return {
      status: 'error',
      fidelityKind,
      fixture,
      html: '',
      warnings: [],
      errors: [{ code: 'OODS-FP-003', message: `Unsupported fidelityKind '${fidelityKind}'. Supported: ${Array.from(SUPPORTED_KINDS).join(', ')}` }],
      meta: { entityCount: 0 },
    };
  }

  let manifest: unknown;
  try {
    ({ manifest } = loadFixture(fixture));
  } catch (e) {
    const code = (e as { code?: string })?.code || 'OODS-FP-001';
    const message = e instanceof Error ? e.message : String(e);
    return {
      status: 'error',
      fidelityKind,
      fixture,
      html: '',
      warnings: [],
      errors: [{ code, message }],
      meta: { entityCount: 0 },
    };
  }

  const entityCount = countEntities(manifest);

  // Dispatch — each emitter has its own option shape but they all share
  // variant + includeStyles. branded-mockup additionally honors brandOverlay;
  // review additionally honors reviewThreshold.
  const sharedOptions = {
    variant: options.variant,
    includeStyles: options.includeStyles,
  };

  let html: string;
  let warnings: FidelityPreviewIssue[] = [];
  let errors: FidelityPreviewIssue[] = [];
  let appliedBrandOverlay: string | undefined;

  switch (fidelityKind) {
    case 'boxes-arrows': {
      const result = emitBoxesArrows(manifest as Parameters<typeof emitBoxesArrows>[0], sharedOptions);
      html = result.code;
      warnings = result.warnings ?? [];
      errors = result.errors ?? [];
      break;
    }
    case 'wireframe': {
      const result = emitWireframe(manifest as Parameters<typeof emitWireframe>[0], sharedOptions);
      html = result.code;
      warnings = result.warnings ?? [];
      errors = result.errors ?? [];
      break;
    }
    case 'review': {
      const result = emitReview(manifest as Parameters<typeof emitReview>[0], {
        ...sharedOptions,
        reviewThreshold: options.reviewThreshold,
      });
      html = result.code;
      warnings = result.warnings ?? [];
      errors = result.errors ?? [];
      break;
    }
    case 'branded-mockup': {
      const result = emitBrandedMockup(manifest as Parameters<typeof emitBrandedMockup>[0], {
        ...sharedOptions,
        brandOverlay: options.brandOverlay,
      });
      html = result.code;
      warnings = result.warnings ?? [];
      errors = result.errors ?? [];
      appliedBrandOverlay = options.brandOverlay;
      break;
    }
    default: {
      // Exhaustive — SUPPORTED_KINDS gate above ensures we never reach here.
      const exhaustive: never = fidelityKind;
      throw new Error(`Unhandled fidelityKind: ${String(exhaustive)}`);
    }
  }

  const status: FidelityPreviewOutput['status'] = errors.length > 0 ? 'error' : warnings.length > 0 ? 'warning' : 'ok';

  return {
    status,
    fidelityKind,
    fixture,
    html,
    warnings,
    errors,
    meta: {
      entityCount,
      ...(appliedBrandOverlay !== undefined ? { appliedBrandOverlay } : {}),
    },
  };
}
