/**
 * review — grouped action-parameter MCP tool (review family consolidation).
 *
 * Thin dispatch layer over the existing per-action review handlers. Consolidates
 * the CRUD-shaped review family (resolve, chain) behind a single registered tool
 * name with one `action` discriminator, mirroring review.chain.input.json's
 * oneOf-on-const precedent. ZERO functionality loss: the per-action handlers
 * (review.resolve.ts, review.chain.ts) and their schemas are unchanged; this
 * module only routes to them.
 *
 * The framework (src/index.ts) validates `input` against review.input.json
 * BEFORE calling this handle, and validates the returned value against
 * review.output.json AFTER. By the time we dispatch, `action` is guaranteed to
 * be one of the enum members. The default branch is defensive only.
 *
 * The extra `action` key is passed straight through to the per-action handlers;
 * each ignores it (their handlers read named fields, not the whole object).
 */

import { handle as resolveHandle } from './review.resolve.js';
import { handle as chainHandle } from './review.chain.js';

export type ReviewAction = 'resolve' | 'chain';

export interface ReviewGroupedInput {
  action: ReviewAction;
  [key: string]: unknown;
}

export async function handle(input: any): Promise<any> {
  const action = input?.action as ReviewAction;
  switch (action) {
    case 'resolve':
      return resolveHandle(input);
    case 'chain':
      return chainHandle(input);
    default: {
      // Defensive: AJV (review.input.json `action` enum) rejects unknown
      // actions before this handler is reached. The exhaustiveness assignment
      // makes TypeScript flag any future enum member added without a case.
      const _exhaustive: never = action as never;
      throw new Error(`Unknown action: ${String(input?.action ?? _exhaustive)}`);
    }
  }
}
