import userEvent from '@testing-library/user-event';
import { getRoles } from '@testing-library/dom';
import { expect } from 'vitest';
import type { ComponentContract, ScenarioTrigger } from '@oods/component-contracts';

export function assertScenarioSemantics(container: HTMLElement, contract: ComponentContract) {
  expect(contract.name).toBeDefined();
  const target = contract.name!.target === ':root' ? container : container.querySelector<HTMLElement>(contract.name!.target);
  expect(target, `${contract.id}: semantic target ${contract.name!.target}`).not.toBeNull();
  if (!target) throw new Error(`${contract.id}: missing semantic target`);
  if (contract.role !== 'none') expect(getRoles(container)[contract.role!] ?? [], `${contract.id}: role ${contract.role}`).toContain(target);
  if (contract.name!.strategy === 'heading') expect(target.textContent?.trim().length).toBeGreaterThan(0);
  if (contract.name!.strategy === 'aria-label') expect(target.getAttribute('aria-label')?.trim().length).toBeGreaterThan(0);
  if (contract.name!.strategy === 'label') {
    const labels = (target as HTMLInputElement).labels;
    const name = labels?.length ? Array.from(labels).map(label => label.textContent).join(' ') : target.getAttribute('aria-label') ?? target.textContent;
    expect(name?.trim().length, `${contract.id}: visible control label`).toBeGreaterThan(0);
  }
}

/** Each trigger gets a fresh scenario: event/state assertions cannot be satisfied
 * by a preceding trigger, and keyboard focus must be reachable by real Tab. */
export async function executeScenarioTrigger(container: HTMLElement, trigger: ScenarioTrigger, calls: unknown[]) {
  const target = container.querySelector<HTMLElement>(trigger.target);
  expect(target, `missing trigger target ${trigger.target}`).not.toBeNull();
  if (!target) throw new Error(`Missing trigger target ${trigger.target}`);
  const user = userEvent.setup();
  calls.length = 0;
  if (trigger.trigger === 'keyboard') {
    if (trigger.key === 'Tab') {
      const sentinel = document.createElement('button');
      sentinel.textContent = 'Before scenario'; container.before(sentinel); sentinel.focus();
      try {
        for (let step = 0; step < 30 && document.activeElement !== target; step++) await user.tab();
      } finally { sentinel.remove(); }
    } else {
      target.focus();
      if (trigger.key === 'x') await user.keyboard('{End}x');
      else await user.keyboard(trigger.key === ' ' ? ' ' : `{${trigger.key}}`);
    }
  } else if (trigger.action === 'select') await user.selectOptions(target, trigger.value!);
  else await user.click(target);
  const effect = trigger.effect;
  if (effect.kind === 'focus') expect(document.activeElement).toBe(target);
  else if (effect.kind === 'event') {
    expect(calls.length, `${trigger.target}: emits exactly one event`).toBe(1);
    if ('value' in effect) expect(calls.at(-1)).toEqual(effect.value);
  } else if (effect.kind === 'value') expect((target as HTMLInputElement).value).toBe(effect.value);
  else if (effect.kind === 'selected-tab') {
    const selected = container.querySelector<HTMLElement>(effect.target!);
    expect(document.activeElement).toBe(selected);
    expect(selected?.getAttribute('aria-selected')).toBe('true');
    expect(calls).toEqual([effect.value]);
  }
}
