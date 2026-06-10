import { describe, expect, it } from 'vitest';
import { getAjv } from '../lib/ajv.js';
import { handle as groupedHandle } from './repl.js';
import { handle as renderHandle } from './repl.render.js';
import { handle as validateHandle } from './repl.validate.js';

// Per-action schemas (unchanged) and the new grouped schemas.
import groupedInput from '../schemas/repl.input.json' assert { type: 'json' };
import groupedOutput from '../schemas/repl.output.json' assert { type: 'json' };
import renderInput from '../schemas/repl.render.input.json' assert { type: 'json' };
import validateInput from '../schemas/repl.validate.input.json' assert { type: 'json' };
import renderOutput from '../schemas/repl.render.output.json' assert { type: 'json' };
import validateOutput from '../schemas/repl.validate.output.json' assert { type: 'json' };

const ajv = getAjv();

// Compile once. getAjv() preloads repl.ui.schema.json + repl.patch.json by $id,
// so the relative $refs (./repl.ui.schema.json, ./repl.patch.json) resolve in
// both the per-action and grouped schemas.
const validateGroupedIn = ajv.compile(groupedInput);
const validateGroupedOut = ajv.compile(groupedOutput);
const validateRenderIn = ajv.compile(renderInput);
const validateValidateIn = ajv.compile(validateInput);
const validateRenderOut = ajv.compile(renderOutput);
const validateValidateOut = ajv.compile(validateOutput);

const clone = <T>(v: T): T => JSON.parse(JSON.stringify(v)) as T;

// Minimal valid UiSchema (version + >=1 screen with id+component).
const UI_SCHEMA = {
  version: '1.0',
  screens: [{ id: 'screen-root', component: 'Stack' }],
};

// Representative VALID payloads per action, in their OLD (un-grouped) form.
// Each grouped form is the same body with `action` added.
const VALID = {
  render: [
    { schema: UI_SCHEMA },
    { mode: 'full', schemaRef: 'ref-123' },
    {
      mode: 'patch',
      baseTree: UI_SCHEMA,
      patch: [{ op: 'replace', path: '/screens/0/component', value: 'Card' }],
    },
    { schema: UI_SCHEMA, output: { format: 'fragments', strict: true } },
  ],
  validate: [
    { schema: UI_SCHEMA },
    { mode: 'full', schemaRef: 'ref-abc' },
    {
      mode: 'patch',
      patch: [{ op: 'add', path: '/screens/0/props/label', value: 'Save' }],
    },
    { schema: UI_SCHEMA, options: { checkA11y: true, includeNormalized: false } },
  ],
} as const;

const PER_ACTION_IN = {
  render: validateRenderIn,
  validate: validateValidateIn,
} as const;

describe('tools/repl grouped action-parameter consolidation', () => {
  describe('input parity: VALID payloads validate under both per-action and grouped schemas', () => {
    for (const action of ['render', 'validate'] as const) {
      for (const [i, body] of VALID[action].entries()) {
        it(`${action}[#${i}] valid under per-action AND grouped`, () => {
          const perAction = PER_ACTION_IN[action];

          const oldOk = perAction(clone(body));
          expect(oldOk, `per-action errors: ${JSON.stringify(perAction.errors)}`).toBe(true);

          const grouped = { action, ...clone(body) };
          const newOk = validateGroupedIn(grouped);
          expect(newOk, `grouped errors: ${JSON.stringify(validateGroupedIn.errors)}`).toBe(true);
        });
      }
    }
  });

  describe('defaults parity: useDefaults injects identical defaults in both schemas', () => {
    for (const action of ['render', 'validate'] as const) {
      for (const [i, body] of VALID[action].entries()) {
        it(`${action}[#${i}] applies the same defaults`, () => {
          const perAction = PER_ACTION_IN[action];

          // Old validator mutates a clone in place via useDefaults.
          const oldPayload = clone(body) as Record<string, unknown>;
          expect(perAction(oldPayload)).toBe(true);

          // Grouped validator mutates a clone (with action) in place.
          const newPayload = { action, ...clone(body) } as Record<string, unknown>;
          expect(validateGroupedIn(newPayload)).toBe(true);

          // The only intended difference is the discriminator key.
          expect(newPayload.action).toBe(action);
          delete newPayload.action;
          expect(newPayload).toEqual(oldPayload);
        });
      }
    }
  });

  describe('compact default flip (Workbench signal): MCP surface defaults to compact', () => {
    // Workbench hit MCP result-size caps because repl.render inlined ~79KB of
    // token CSS. The default is now compact=true at both layers (schema +
    // handler), so AJV injects it on the validated tool path and a direct
    // handler import behaves identically — see normalizeCompact() in
    // repl.render.ts.
    it('grouped repl render injects compact=true when output omits it', () => {
      const payload = {
        action: 'render',
        schema: UI_SCHEMA,
        output: { format: 'document' },
      } as Record<string, unknown>;
      expect(validateGroupedIn(payload)).toBe(true);
      expect((payload.output as Record<string, unknown>).compact).toBe(true);
    });

    it('per-action repl.render schema injects the same compact=true default (parity)', () => {
      const payload = {
        schema: UI_SCHEMA,
        output: { format: 'document' },
      } as Record<string, unknown>;
      expect(validateRenderIn(payload)).toBe(true);
      expect((payload.output as Record<string, unknown>).compact).toBe(true);
    });

    it('explicit compact=false is preserved (opt-out still works)', () => {
      const payload = {
        action: 'render',
        schema: UI_SCHEMA,
        output: { format: 'document', compact: false },
      } as Record<string, unknown>;
      expect(validateGroupedIn(payload)).toBe(true);
      expect((payload.output as Record<string, unknown>).compact).toBe(false);
    });
  });

  describe('negative parity: INVALID payloads are rejected by the grouped schema', () => {
    it('missing action is rejected', () => {
      expect(validateGroupedIn({ schema: UI_SCHEMA })).toBe(false);
    });

    it('unknown action is rejected', () => {
      expect(validateGroupedIn({ action: 'destroy', schema: UI_SCHEMA })).toBe(false);
    });

    it('extra/unknown key inside a branch is rejected (additionalProperties:false preserved)', () => {
      // bogusKey is invalid under the OLD render schema too.
      expect(validateRenderIn(clone({ schema: UI_SCHEMA, bogusKey: 1 }))).toBe(false);
      expect(validateGroupedIn({ action: 'render', schema: UI_SCHEMA, bogusKey: 1 })).toBe(false);
    });

    it('render mode=patch missing baseTree+patch is rejected (branch-local allOf preserved)', () => {
      expect(validateRenderIn(clone({ mode: 'patch' }))).toBe(false);
      expect(validateGroupedIn({ action: 'render', mode: 'patch' })).toBe(false);
    });

    it('full mode with neither schema nor schemaRef is rejected', () => {
      expect(validateValidateIn(clone({ mode: 'full' }))).toBe(false);
      expect(validateGroupedIn({ action: 'validate', mode: 'full' })).toBe(false);
    });

    it('wrong-action body shape (validate-only option under render) is rejected', () => {
      // checkA11y lives only on validate.options; render.options forbids it.
      expect(
        validateGroupedIn({ action: 'render', schema: UI_SCHEMA, options: { checkA11y: true } }),
      ).toBe(false);
    });
  });

  describe('dispatch routing: grouped handle === per-action handle (read-only actions)', () => {
    it('validate routes to repl.validate handle (identical output)', async () => {
      const body = { schema: UI_SCHEMA, options: { includeNormalized: true } };
      const direct = await validateHandle(clone(body) as any);
      const viaGroup = await groupedHandle({ action: 'validate', ...clone(body) } as any);
      expect(viaGroup).toEqual(direct);
    });

    it('render (no apply -> no disk writes) routes to repl.render handle (identical output)', async () => {
      const body = { schema: UI_SCHEMA };
      const direct = await renderHandle(clone(body) as any);
      const viaGroup = await groupedHandle({ action: 'render', ...clone(body) } as any);
      expect(viaGroup).toEqual(direct);
    });

    it('grouped render output validates under grouped output schema (anyOf)', async () => {
      const out = await groupedHandle({ action: 'render', schema: UI_SCHEMA } as any);
      expect(validateGroupedOut(out), JSON.stringify(validateGroupedOut.errors)).toBe(true);
      // and remains valid under its own per-action output schema.
      expect(validateRenderOut(clone(out))).toBe(true);
    });

    it('grouped validate output validates under grouped output schema (anyOf)', async () => {
      const out = await groupedHandle({ action: 'validate', schema: UI_SCHEMA } as any);
      expect(validateGroupedOut(out), JSON.stringify(validateGroupedOut.errors)).toBe(true);
      expect(validateValidateOut(clone(out))).toBe(true);
    });

    it('unknown action throws (defensive default branch)', async () => {
      await expect(groupedHandle({ action: 'nope' } as any)).rejects.toThrow('Unknown action: nope');
    });
  });
});
