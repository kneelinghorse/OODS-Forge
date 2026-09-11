import { describe, expect, it } from 'vitest';
import { editVizIntent, isVizIntentFragment, vizControlFields, vizSummaryRows } from '../src/viz-controls.js';

describe('typed chart input edits', () => {
  it('changes only the authored binding and never mutates the consumer input', () => {
    const value = { chartType: 'bar' as const, encodings: { x: { field: 'period' }, y: { field: 'value' } }, opacity: 0 };
    const before = JSON.stringify(value);
    expect(editVizIntent(value, vizControlFields('VizAxisControls')[0]!, 'quarter').value).toEqual({ ...value, encodings: { x: { field: 'quarter' }, y: { field: 'value' } } });
    expect(JSON.stringify(value)).toBe(before);
  });
  it('zero opacity is a value; invalid opacity and incomplete colors never produce a fragment', () => {
    expect(editVizIntent({}, vizControlFields('VizOpacityControls')[0]!, '0').value).toEqual({ opacity: 0 });
    for (const value of ['', 'NaN', '-1', '1.1']) expect(editVizIntent({}, vizControlFields('VizOpacityControls')[0]!, value).value).toBeUndefined();
    for (const value of ['#fff', 'red, blue', '#ff0000, nope']) expect(editVizIntent({ encodings: { color: { field: 'category' } } }, vizControlFields('VizColorControls')[1]!, value).value).toBeUndefined();
  });
  it('validates only the public Cartesian control subset and never accepts data or invented channels', () => {
    expect(isVizIntentFragment({ opacity: 0, encodings: { color: { field: 'category', range: ['#123', '#456'] } } })).toBe(true);
    for (const value of [{ rows: [] }, { opacity: Number.NaN }, { chartType: 'point' }, { encodings: { opacity: { field: 'value' } } }, { encodings: { x: { field: 'value', range: ['#123', '#456'] } } }, { encodings: { x: { field: '' } } }, { encodings: { x: { field: 'x', scale: 'invented' } } }]) expect(isVizIntentFragment(value)).toBe(false);
  });
  it('read-only summaries disclose absent data and preserve explicit zero', () => {
    expect(vizSummaryRows('VizOpacitySummary', {})).toEqual([['Opacity', 'Renderer default']]);
    expect(vizSummaryRows('VizOpacitySummary', { opacity: 0 })).toEqual([['Opacity', '0']]);
    expect(vizSummaryRows('VizEncodingBadge', {}, 'color')).toEqual([['COLOR', 'Not bound']]);
  });
});
