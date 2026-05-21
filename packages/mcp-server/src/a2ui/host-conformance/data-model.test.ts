/**
 * Unit tests for the A2UI host conformance data-model utilities (s104-m01).
 *
 * Tests pure functions only — DOM-touching adapter tests live in
 * adapter.test.ts under a happy-dom environment. Keeping these in the default
 * node environment is intentional: the resolver / synthesizer pair must not
 * grow a DOM dependency by accident.
 */

import { describe, expect, it } from 'vitest';

import type {
  A2uiCreateSurfaceMessage,
  A2uiMessage,
  A2uiUpdateComponentsMessage,
} from '../../codegen/a2ui-runtime-emitter.js';
import {
  collectDataBindingPaths,
  resolvePath,
  synthesizeDataModel,
} from './data-model.js';

// ---------------------------------------------------------------------------
// resolvePath — JSON Pointer (RFC 6901) semantics
// ---------------------------------------------------------------------------

describe('resolvePath — JSON Pointer resolution', () => {
  it('empty pointer returns the whole document', () => {
    const model = { a: 1 };
    const r = resolvePath(model, '');
    expect(r).toEqual({ resolved: true, value: model });
  });

  it('resolves a single-segment object path', () => {
    const r = resolvePath({ name: 'Ada' }, '/name');
    expect(r).toEqual({ resolved: true, value: 'Ada' });
  });

  it('resolves a nested object path', () => {
    const r = resolvePath({ a: { b: { c: 42 } } }, '/a/b/c');
    expect(r).toEqual({ resolved: true, value: 42 });
  });

  it('resolves an array index', () => {
    const r = resolvePath({ users: [{ name: 'Ada' }, { name: 'Lin' }] }, '/users/1/name');
    expect(r).toEqual({ resolved: true, value: 'Lin' });
  });

  it('returns resolved: false for a missing object key', () => {
    expect(resolvePath({ a: 1 }, '/b')).toEqual({ resolved: false });
  });

  it('returns resolved: false for a missing nested key', () => {
    expect(resolvePath({ a: {} }, '/a/b/c')).toEqual({ resolved: false });
  });

  it('returns resolved: false for an out-of-bounds array index', () => {
    expect(resolvePath({ arr: [1] }, '/arr/5')).toEqual({ resolved: false });
  });

  it('returns resolved: false when a non-numeric segment targets an array', () => {
    expect(resolvePath({ arr: [1] }, '/arr/foo')).toEqual({ resolved: false });
  });

  it('returns resolved: false when descending past a null intermediate', () => {
    expect(resolvePath({ a: null }, '/a/b')).toEqual({ resolved: false });
  });

  it('returns resolved: true with value=null when the target itself is null', () => {
    const r = resolvePath({ a: null }, '/a');
    expect(r).toEqual({ resolved: true, value: null });
  });

  it('honors JSON Pointer escaping (~0 → ~, ~1 → /)', () => {
    const model = { 'a/b': 1, 'c~d': 2 };
    expect(resolvePath(model, '/a~1b')).toEqual({ resolved: true, value: 1 });
    expect(resolvePath(model, '/c~0d')).toEqual({ resolved: true, value: 2 });
  });

  it('rejects pointers that do not start with "/" (non-empty)', () => {
    expect(resolvePath({ a: 1 }, 'a')).toEqual({ resolved: false });
  });
});

// ---------------------------------------------------------------------------
// collectDataBindingPaths — message-stream walking
// ---------------------------------------------------------------------------

function makeUpdate(components: unknown[]): A2uiUpdateComponentsMessage {
  return {
    version: 'v0.9',
    updateComponents: {
      surfaceId: 'urn:test#default',
      components: components as never,
    },
  };
}

function makeCreate(surfaceId = 'urn:test#default'): A2uiCreateSurfaceMessage {
  return {
    version: 'v0.9',
    createSurface: { surfaceId, catalogId: 'oods-forge:catalog/v1' },
  };
}

describe('collectDataBindingPaths — DataBinding path enumeration', () => {
  it('returns [] for an empty stream', () => {
    expect(collectDataBindingPaths([])).toEqual([]);
  });

  it('skips createSurface-only messages', () => {
    expect(collectDataBindingPaths([makeCreate()])).toEqual([]);
  });

  it('extracts a Text.text DataBinding path', () => {
    const stream: A2uiMessage[] = [
      makeUpdate([
        { id: 't', component: 'Text', text: { path: '/article/title' } },
      ]),
    ];
    expect(collectDataBindingPaths(stream)).toEqual(['/article/title']);
  });

  it('extracts Image.url and Image.alt paths', () => {
    const stream: A2uiMessage[] = [
      makeUpdate([
        {
          id: 'img',
          component: 'Image',
          url: { path: '/article/hero_url' },
          alt: { path: '/article/hero_alt' },
        },
      ]),
    ];
    expect(collectDataBindingPaths(stream)).toEqual([
      '/article/hero_url',
      '/article/hero_alt',
    ]);
  });

  it('ignores string-literal DynamicString values', () => {
    const stream: A2uiMessage[] = [
      makeUpdate([
        { id: 't1', component: 'Text', text: 'literal' },
        { id: 't2', component: 'Text', text: { path: '/dyn' } },
      ]),
    ];
    expect(collectDataBindingPaths(stream)).toEqual(['/dyn']);
  });

  it('deduplicates repeated paths but preserves first-encounter order', () => {
    const stream: A2uiMessage[] = [
      makeUpdate([
        { id: 'a', component: 'Text', text: { path: '/x' } },
        { id: 'b', component: 'Text', text: { path: '/y' } },
        { id: 'c', component: 'Text', text: { path: '/x' } },
      ]),
    ];
    expect(collectDataBindingPaths(stream)).toEqual(['/x', '/y']);
  });
});

// ---------------------------------------------------------------------------
// synthesizeDataModel — build a model that covers every emitted path
// ---------------------------------------------------------------------------

describe('synthesizeDataModel — build a model with full path coverage', () => {
  it('covers single-segment paths', () => {
    const stream: A2uiMessage[] = [
      makeUpdate([{ id: 't', component: 'Text', text: { path: '/name' } }]),
    ];
    const model = synthesizeDataModel(stream);
    expect(model).toEqual({ name: 'synthetic:/name' });
  });

  it('builds nested objects for multi-segment paths', () => {
    const stream: A2uiMessage[] = [
      makeUpdate([
        { id: 't', component: 'Text', text: { path: '/article/headline' } },
        { id: 'u', component: 'Image', url: { path: '/article/hero_url' } },
      ]),
    ];
    const model = synthesizeDataModel(stream);
    expect(model).toEqual({
      article: {
        headline: 'synthetic:/article/headline',
        hero_url: 'synthetic:/article/hero_url',
      },
    });
  });

  it('builds arrays for numeric segments', () => {
    const stream: A2uiMessage[] = [
      makeUpdate([
        { id: 't1', component: 'Text', text: { path: '/users/0/name' } },
        { id: 't2', component: 'Text', text: { path: '/users/1/name' } },
      ]),
    ];
    const model = synthesizeDataModel(stream);
    expect(model).toEqual({
      users: [
        { name: 'synthetic:/users/0/name' },
        { name: 'synthetic:/users/1/name' },
      ],
    });
  });

  it('honors a custom placeholder function', () => {
    const stream: A2uiMessage[] = [
      makeUpdate([{ id: 't', component: 'Text', text: { path: '/name' } }]),
    ];
    const model = synthesizeDataModel(stream, () => 'X');
    expect(model).toEqual({ name: 'X' });
  });

  it('produces a model that resolvePath can resolve for every collected path', () => {
    const stream: A2uiMessage[] = [
      makeUpdate([
        { id: 'a', component: 'Text', text: { path: '/a/b/c' } },
        { id: 'b', component: 'Text', text: { path: '/d/0/e' } },
        { id: 'img', component: 'Image', url: { path: '/img/src' }, alt: { path: '/img/alt' } },
      ]),
    ];
    const model = synthesizeDataModel(stream);
    const paths = collectDataBindingPaths(stream);
    for (const path of paths) {
      const result = resolvePath(model, path);
      expect(result.resolved, `path ${path} should resolve`).toBe(true);
    }
  });
});
