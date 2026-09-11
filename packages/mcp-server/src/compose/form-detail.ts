import type { UiElement, UiSchema } from '../schemas/generated.js';
import type { ComposedObject } from '../objects/trait-composer.js';
import { fieldLabel } from './label-generator.js';

const controls = new Set(['Input', 'Select', 'Textarea', 'DatePicker', 'Checkbox', 'Switch', 'Toggle', 'StatusSelector', 'CancellationForm', 'BillingAmountInput', 'BillingIntervalSelector']);
const owners: Record<string, string[]> = {
  ColorStatePicker: ['field'],
  GeoFieldMappingForm: ['latitudeField', 'longitudeField', 'identifierField', 'autoDetectField'],
  BillingAmountInput: ['amountField'], BillingIntervalSelector: ['intervalField'],
  CancellationForm: ['reasonField', 'codeField'], StatusSelector: ['field'],
};
const walk = (node: UiElement, visit: (node: UiElement) => void): void => { visit(node); node.children?.forEach(child => walk(child, visit)); };

/** Reconcile the public form/detail trees after trait placement and field wiring. */
export function reconcileFormDetail(schema: UiSchema, context: string, composed: ComposedObject, tabLabels?: string[]): void {
  if (context === 'form') {
    const owned = new Set<string>();
    for (const screen of schema.screens) walk(screen, node => {
      for (const directive of owners[node.component] ?? []) {
        const field = node.props?.[directive];
        if (typeof field === 'string') owned.add(field);
      }
    });
    for (const screen of schema.screens) walk(screen, node => {
      node.children = node.children?.filter(child => !(controls.has(child.component) && !owners[child.component] && owned.has(String(child.props?.field))));
      const field = node.props?.field;
      const entry = typeof field === 'string' ? schema.objectSchema?.[field] : undefined;
      if (entry && controls.has(node.component)) {
        node.props = { ...node.props, label: node.props?.label === entry.description || !node.props?.label ? fieldLabel(field as string) : node.props.label, ...(entry.description ? { help: entry.description } : {}) };
        if (entry.type.replace(/\?$/, '') === 'datetime' && ['Input', 'DatePicker'].includes(node.component)) {
          node.component = 'Input'; node.props.type = 'datetime-local';
        }
      }
      if (owners[node.component] && !['ColorStatePicker', 'GeoFieldMappingForm'].includes(node.component)) {
        const fields = owners[node.component];
        node.props = { ...node.props };
        for (const directive of fields) {
          const name = node.props[directive];
          const description = typeof name === 'string' ? schema.objectSchema?.[name]?.description : undefined;
          if (description) node.props[node.component === 'CancellationForm' ? directive === 'codeField' ? 'codeHelp' : 'reasonHelp' : 'help'] = description;
        }
      }
      if (node.component === 'BillingAmountInput') node.props = { ...node.props, help: `Amount in ${String(node.props?.currency ?? schema.workflow?.data.currency ?? schema.objectSchema?.[String(node.props?.currencyField)]?.enum?.[0] ?? 'USD').toUpperCase()}` };
      if (node.component === 'CancellationForm') node.props = { ...node.props, embedded: true, allowedReasons: composed.traits.find(trait => trait.ref.name.split('/').pop() === 'Cancellable')?.ref.parameters?.allowedReasons ?? [] };
      if (node.component === 'GeoFieldMappingForm') {
        node.props = { ...node.props, embedded: true };
        node.bindings = { ...node.bindings, onChange: 'handleGeoMappingChange' };
      }
    });
    // The native Save owns submit; field controls own edits. Cancellation belongs to detail.
    for (const screen of schema.screens) if (screen.bindings) {
      delete screen.bindings.onChange; delete screen.bindings.onCancel;
    }
  }
  if (context !== 'detail') return;
  const categories = new Map<string, string>();
  for (const trait of composed.traits) for (const extension of trait.definition.view_extensions?.detail ?? []) {
    const category = trait.definition.trait.category ?? trait.ref.name.split('/')[0];
    categories.set(extension.component, category === 'financial' ? 'Billing' : category === 'lifecycle' ? 'Status & History' : category === 'content' ? 'Content' : 'Details');
  }
  const hasContent = (node: UiElement): boolean => ['Stack', 'Card'].includes(node.component)
    ? Boolean(node.children?.some(hasContent)) : Boolean(node.props && Object.keys(node.props).some(key => !['label', 'title'].includes(key))) || Boolean(node.children?.length);
  for (const screen of schema.screens) walk(screen, node => {
    if (node.id.includes('detail-header')) node.children = node.children?.filter(child => !controls.has(child.component));
    node.children = node.children?.filter(child => child.component !== 'AuditTimeline' || (typeof child.props?.auditLogField === 'string' && Boolean(schema.objectSchema?.[child.props.auditLogField])));
    if (node.component !== 'Tabs' || !node.children) return;
    node.props = { ...node.props, ariaLabel: node.props?.ariaLabel ?? 'Record details' };
    const groups = new Map<string, UiElement>();
    for (const [index, panel] of node.children.entries()) {
      if (!hasContent(panel)) continue;
      let label = 'Details';
      walk(panel, child => { if (categories.has(child.component)) label = categories.get(child.component)!; });
      label = tabLabels?.[index] ?? label;
      const existing = groups.get(label);
      if (existing) existing.children = [...(existing.children ?? []), ...(panel.children ?? [])];
      else { panel.props = { ...panel.props, label }; if (panel.meta) delete panel.meta.label; groups.set(label, panel); }
    }
    node.children = [...groups.values()];
  });
}
