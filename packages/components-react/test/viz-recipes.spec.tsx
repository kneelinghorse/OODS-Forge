import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { VizColorControls, VizLinePreview, VizOpacityControls } from '../src/viz-recipes.js';
afterEach(cleanup);
const value = { encodings: { color: { field: 'category', range: ['#123456', '#654321'] }, x: { field: 'period' } } };
describe('Viz recipe consumer boundaries', () => {
  it('invalid colors are announced without emitting and a valid edit preserves other bindings', () => {
    const change = vi.fn(); const { container } = render(<VizColorControls value={value} onChange={change} />);
    const input = container.querySelector('input[name="color.range"]')!;
    fireEvent.change(input, { target: { value: '#bad' } });
    expect(change).not.toHaveBeenCalled(); expect(container.querySelector('[role="alert"]')?.textContent).toContain('at least two');
    fireEvent.change(input, { target: { value: '#abcdef, #fedcba' } });
    expect(change).toHaveBeenCalledExactlyOnceWith({ encodings: { color: { field: 'category', range: ['#abcdef', '#fedcba'] }, x: { field: 'period' } } });
    expect(container.querySelector('[role="alert"]')).toBeNull();
  });
  it('consumer prop updates replace editor state without emitting a change', () => {
    const change = vi.fn(); const { container, rerender } = render(<VizColorControls value={value} onChange={change} />);
    rerender(<VizColorControls value={{ encodings: { color: { field: 'region', range: ['#000', '#fff'] } } }} onChange={change} />);
    expect((container.querySelector('input[name="color.field"]') as HTMLInputElement).value).toBe('region'); expect(change).not.toHaveBeenCalled();
  });
  it('disabled controls reject keyboard editing', async () => {
    const change = vi.fn(); const { container } = render(<VizColorControls value={value} disabled onChange={change} />);
    await userEvent.setup().type(container.querySelector('input')!, 'x'); expect(change).not.toHaveBeenCalled();
  });
  it('a zero-opacity selection is numeric and an absent preview contains no chart pixels', () => {
    const change = vi.fn(); const { container } = render(<><VizOpacityControls value={{ opacity: 0.8 }} onChange={change} /><VizLinePreview /></>);
    fireEvent.change(container.querySelector('select')!, { target: { value: '0' } }); expect(change).toHaveBeenCalledExactlyOnceWith({ opacity: 0 });
    expect(container.querySelector('svg')).toBeNull(); expect(container.textContent).toContain('No rendered chart supplied');
  });
});
