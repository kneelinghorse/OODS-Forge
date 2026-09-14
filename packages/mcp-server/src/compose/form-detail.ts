import type { UiElement, UiSchema } from '../schemas/generated.js';
import type { ComposedObject } from '../objects/trait-composer.js';
import { fieldLabel, fieldHelp } from './label-generator.js';
import { VIZ_CONTROL_IDS } from '@oods/component-contracts';

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
    const fields = schema.objectSchema ?? {};
    const owned = new Set<string>();
    const fieldEditors = new Set<string>();
    for (const screen of schema.screens) walk(screen, node => {
      if (controls.has(node.component) && typeof node.props?.field === 'string') fieldEditors.add(node.props.field);
      for (const directive of owners[node.component] ?? []) {
        const field = node.props?.[directive];
        if (typeof field === 'string') owned.add(field);
      }
    });
    for (const screen of schema.screens) walk(screen, node => {
      // Keep the declared field editor when the title slot points at that same value.
      node.children = node.children?.filter(child => !(child.component === 'DetailHeader' && fieldEditors.has(String(child.props?.field))));
      // A field wired into a title slot is still editable data, not the form heading.
      const titleField = node.props?.field;
      if (node.component === 'DetailHeader' && typeof titleField === 'string' && fields[titleField]) {
        node.component = 'Input';
        node.props = { field: titleField };
      }
      node.children = node.children?.filter(child => !(controls.has(child.component) && !owners[child.component] && owned.has(String(child.props?.field))));
      const field = node.props?.field;
      const entry = typeof field === 'string' ? schema.objectSchema?.[field] : undefined;
      if (entry && controls.has(node.component)) {
        const type = entry.type.replace(/\?$/, '');
        // Selector heuristics must not turn names/status codes into paragraphs,
        // or a timezone/period label into a native date input.
        if (node.component === 'Textarea' && !/description|reason|notes|body|content|instructions/.test(String(field))) node.component = 'Input';
        if (node.component === 'DatePicker' && !['date', 'datetime'].includes(type)) node.component = 'Input';
        if (entry.enum?.length && ['Input', 'Textarea'].includes(node.component)) { node.component = 'Select'; node.props = { field }; }
        node.props = { ...node.props, label: node.props?.label === entry.description || !node.props?.label ? fieldLabel(field as string) : node.props.label, ...(entry.description ? { help: fieldHelp(field as string, entry.description) } : {}) };
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
          if (description) node.props[node.component === 'CancellationForm' ? directive === 'codeField' ? 'codeHelp' : 'reasonHelp' : 'help'] = fieldHelp(String(name), description);
        }
      }
      if (node.component === 'BillingAmountInput') node.props = { ...node.props, help: `Amount in ${String(node.props?.currency ?? schema.workflow?.data.currency ?? schema.objectSchema?.[String(node.props?.currencyField)]?.enum?.[0] ?? 'USD').toUpperCase()}` };
      if (node.component === 'CancellationForm') node.props = { ...node.props, embedded: true, allowedReasons: composed.traits.find(trait => trait.ref.name.split('/').pop() === 'Cancellable')?.ref.parameters?.allowedReasons ?? [] };
      if (node.component === 'GeoFieldMappingForm') {
        node.props = { ...node.props, embedded: true };
        node.bindings = { ...node.bindings, onChange: 'handleGeoMappingChange' };
      }
      if ((VIZ_CONTROL_IDS as readonly string[]).includes(node.component)) {
        node.bindings = { ...node.bindings, onChange: `handle${node.component}Change` };
      }
    });
    // The native Save owns submit; field controls own edits. Cancellation belongs to detail.
    for (const screen of schema.screens) if (screen.bindings) {
      delete screen.bindings.onChange; delete screen.bindings.onCancel;
    }
  }
  if (context !== 'detail') return;
  const fields = schema.objectSchema ?? {};
  const minorUnits = Number(composed.traits.find(trait => trait.ref.name.split('/').pop() === 'Billable')?.ref.parameters?.minorUnits ?? 100);
  const isControl = (node: UiElement) => controls.has(node.component) || (VIZ_CONTROL_IDS as readonly string[]).includes(node.component) || /(?:Editor|Form|Picker|Selector)$/.test(node.component);
  const traitFields = new Set(composed.traits.flatMap(trait => Object.keys(trait.definition.schema ?? {})));
  const summaryField = (name: string) => !traitFields.has(name) || ['created_at', 'updated_at', 'last_event', 'last_event_at'].includes(name) || /(?:_minor|_id|_code)$/.test(name);
  const isScalar = (name: string) => /^(?:string|uuid|email|url|integer|number|boolean|date|datetime)\??$/.test(fields[name]?.type ?? '');
  const labelField = ['plan_name', 'name', 'title', 'display_name', 'label', `${composed.object?.name?.toLowerCase()}_id`, 'id'].find(name => fields[name]);
  const fieldRow = (name: string, id: string): UiElement => {
    const money = Boolean(fields.currency && (name === 'amount' || name.endsWith('_minor')) && /^(?:integer|number)$/.test(fields[name]?.type ?? ''));
    return { id: `${id}-read-field`, component: 'Stack', children: [
      { id: `${id}-label`, component: 'Text', props: { as: 'strong', content: fieldLabel(name.replace(/_minor$/, '')) } },
      { id: `${id}-value`, meta: { intent: 'read-only-field' }, component: money ? 'BillingSummaryBadge' : 'Text', props: money ? { amountField: name, currencyField: 'currency', minorUnits, showInterval: false } : { field: name } },
    ] };
  };
  const categories = new Map<string, string>();
  for (const trait of composed.traits) for (const extension of trait.definition.view_extensions?.detail ?? []) {
    const category = trait.definition.trait.category ?? trait.ref.name.split('/')[0];
    categories.set(extension.component, category === 'financial' ? 'Billing' : category === 'lifecycle' ? 'Status & History' : category === 'content' ? 'Content' : 'Details');
  }
  for (const screen of schema.screens) {
    const covered = new Set<string>();
    walk(screen, node => {
      if (node.component === 'DetailHeader' && labelField) { covered.add(labelField); if (fields.description) covered.add('description'); return; }
      if (isControl(node) || ['Stack', 'Text', 'StatusBadge'].includes(node.component)) return;
      for (const [key, value] of Object.entries(node.props ?? {})) if ((key === 'field' || key.endsWith('Field')) && typeof value === 'string' && fields[value]) covered.add(value);
    });
    const prune = (node: UiElement): UiElement | undefined => {
      if (node.id.endsWith('-read-field')) {
        walk(node, child => { for (const key of ['field', 'amountField']) { const field = child.props?.[key]; if (typeof field === 'string') covered.add(field); } });
        return node;
      }
      if (isControl(node) || ['SearchInput', 'FilterPanel'].includes(node.component)) return undefined;
      if (node.component === 'StatusBadge' && node.meta?.intent?.startsWith('slot:') && !node.props && !node.children?.length) return undefined;
      // These panel contracts render authored children, not their saved-schema directives.
      // Bind a bounded read summary rather than leave a titled empty shell.
      if (!node.children?.length && ['MembershipPanel', 'PreferencePanel', 'ClassificationPanel'].includes(node.component) && !['summary', 'text', 'body', 'emptyMessage'].some(key => node.props?.[key])) {
        const names = node.component === 'MembershipPanel' ? [node.props?.membershipsField] : node.component === 'ClassificationPanel' ? ['primary_category_id', node.props?.tagsField] : [node.props?.namespaceField, 'preference_version'];
        node.children = names.filter((name): name is string => typeof name === 'string' && Boolean(fields[name])).map(name => fieldRow(name, `${node.id}-${name}`));
      }

      if (node.component === 'AuditTimeline' && !(typeof node.props?.auditLogField === 'string' && fields[node.props.auditLogField])) return undefined;
      // A pattern's scalar children are values, not an additional history log.
      if (node.component === 'Stack' && node.props?.patternComponent === 'StatusTimeline') node.props = undefined;
      if (node.component === 'DetailHeader' && labelField) node.props = { titleField: labelField, ...(fields.description ? { subtitleField: 'description' } : {}), headingLevel: 2 };
      const field = node.props?.field;
      if (['Text', 'StatusBadge'].includes(node.component) && typeof field === 'string' && fields[field]) {
        if (covered.has(field)) return undefined;
        covered.add(field);
        return fieldRow(field, node.id);
      }
      node.children = node.children?.map(prune).filter((child): child is UiElement => Boolean(child));
      if (['Stack', 'Card', 'Tabs'].includes(node.component) && !node.children?.length) return undefined;
      if (node.component === 'Card' && node.layout?.type === 'sidebar' && node.children?.length === 1) node.layout = { ...node.layout, type: 'stack' };
      return node;
    };
    screen.children = screen.children?.map(prune).filter((child): child is UiElement => Boolean(child));
    let header: UiElement | undefined;
    let tabs: UiElement | undefined;
    walk(screen, node => { if (node.id.includes('detail-header')) header = node; if (node.component === 'Tabs') tabs = node; });
    if (header) header.layout = { ...header.layout, type: 'stack', gapToken: 'stack-default' };
    if (header && labelField && !header.children?.some(child => child.component === 'DetailHeader' || child.children?.some(item => item.component === 'DetailHeader'))) {
      header.children = [{ id: `${header.id}-record-title`, component: 'DetailHeader', props: { titleField: labelField, headingLevel: 2 } }, ...(header.children ?? [])];
    }
    if (labelField) {
      covered.add(labelField);
      if (!header && !screen.children?.some(node => node.component === 'DetailHeader')) screen.children = [{ id: `${screen.id}-record-title`, component: 'DetailHeader', props: { titleField: labelField, headingLevel: 2 } }, ...(screen.children ?? [])];
    }
    const remaining = Object.keys(fields).filter(name => isScalar(name) && summaryField(name) && !covered.has(name));
    if (remaining.length && !tabs) {
      tabs = { id: `${screen.id}-record-tabs`, component: 'Tabs', children: [] };
      screen.children = [...(screen.children ?? []), { id: `${screen.id}-record-body`, component: 'Card', children: [tabs] }];
    }
    if (remaining.length && tabs) {
      tabs.children = [{ id: `${tabs.id}-read-fields`, component: 'Stack', props: { label: 'Details' }, children: remaining.map(name => fieldRow(name, `${tabs!.id}-${name}`)) }, ...(tabs.children ?? [])];
    }
    if (!tabs?.children) continue;
    tabs.props = { ...tabs.props, ariaLabel: tabs.props?.ariaLabel ?? 'Record details' };
    const groups = new Map<string, UiElement>();
    for (const [index, panel] of tabs.children.entries()) {
      let label = 'Details';
      walk(panel, child => { if (categories.has(child.component)) label = categories.get(child.component)!; });
      label = tabLabels?.[index] ?? label;
      const existing = groups.get(label);
      if (existing) existing.children = [...(existing.children ?? []), ...(panel.children ?? [])];
      else { panel.props = { ...panel.props, label }; if (panel.meta) delete panel.meta.label; groups.set(label, panel); }
    }
    tabs.children = [...groups.values()];
  }
}
