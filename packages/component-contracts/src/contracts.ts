import type { ComponentContract, NucleusComponentId } from './types.js';

export const COMPONENT_CONTRACT_VERSION = '1.0.0' as const;
export const COMPONENT_CONTRACT_VERSION_1_1 = '1.1.0' as const;

export const componentContracts: Readonly<Record<NucleusComponentId, ComponentContract>> = {
  Badge: {
    id: 'Badge', version: COMPONENT_CONTRACT_VERSION,
    props: ['content', 'status', 'domain', 'tone', 'emphasis', 'icon'], slots: ['default'], events: [],
    states: ['subtle', 'solid'], tokenRoles: ['badge.background', 'badge.border', 'badge.text', 'badge.icon'],
    accessibility: ['Inline noninteractive status label', 'Decorative icons are hidden from assistive technology'],
    compatibility: 'The existing React status registry is the starting implementation.',
  },
  Banner: {
    id: 'Banner', version: COMPONENT_CONTRACT_VERSION,
    props: ['title', 'detail', 'content', 'status', 'domain', 'tone', 'emphasis', 'dismissLabel'], slots: ['default', 'actions'], events: ['dismiss'],
    states: ['info', 'success', 'warning', 'critical'], tokenRoles: ['banner.background', 'banner.border', 'banner.text', 'banner.icon'],
    accessibility: ['Critical tone uses alert', 'Other tones use status', 'Dismiss control has an accessible label'],
    compatibility: 'Dismissal is a real button and actions remain authored content.',
  },
  Button: {
    id: 'Button', version: COMPONENT_CONTRACT_VERSION,
    props: ['content', 'intent', 'size', 'disabled', 'type'], slots: ['default'], events: ['activate'],
    states: ['default', 'hover', 'focus', 'pressed', 'disabled'], tokenRoles: ['button.background', 'button.border', 'button.text', 'button.focus'],
    accessibility: ['Native button semantics', 'Defaults to type=button'],
    compatibility: 'React asChild remains an extension and is not a Vue parity requirement.',
  },
  Card: {
    id: 'Card', version: COMPONENT_CONTRACT_VERSION,
    props: ['elevated', 'as'], slots: ['default'], events: [], states: ['default', 'elevated'],
    tokenRoles: ['surface.panel', 'border.default', 'shadow.panel'], accessibility: ['Safe semantic container element', 'Preserves native attributes'],
    compatibility: 'One container primitive; no header or footer family is introduced.',
  },
  Checkbox: {
    id: 'Checkbox', version: COMPONENT_CONTRACT_VERSION,
    props: ['id', 'label', 'checked', 'defaultChecked', 'required', 'disabled', 'help', 'validation'], slots: ['label', 'help', 'validation'], events: ['change', 'update'],
    states: ['unchecked', 'checked', 'disabled', 'invalid'], tokenRoles: ['checkbox.background', 'checkbox.border', 'checkbox.check', 'checkbox.focus', 'field.message'],
    accessibility: ['Native checkbox semantics', 'Label and help/error descriptions are programmatically associated'],
    compatibility: 'Indeterminate remains unsupported until implemented and tested in both targets.',
  },
  DatePicker: {
    id: 'DatePicker', version: COMPONENT_CONTRACT_VERSION,
    props: ['id', 'label', 'value', 'defaultValue', 'min', 'max', 'step', 'required', 'disabled', 'readOnly', 'help', 'validation'], slots: ['label', 'help', 'validation'], events: ['input', 'change', 'update'],
    states: ['empty', 'valued', 'disabled', 'readOnly', 'invalid'], tokenRoles: ['input.background', 'input.border', 'input.text', 'input.focus', 'field.message'],
    accessibility: ['Native date input semantics', 'ISO YYYY-MM-DD values', 'Label and descriptions are associated'],
    compatibility: 'Composes canonical Input; no custom calendar claim.',
  },
  Grid: {
    id: 'Grid', version: COMPONENT_CONTRACT_VERSION,
    props: ['columns', 'minColumnWidth', 'gap', 'align', 'justify'], slots: ['default'], events: [],
    states: ['fixed-columns', 'auto-fit'], tokenRoles: ['layout.gap', 'layout.breakpoint'], accessibility: ['Does not alter child semantics'],
    compatibility: 'CSS-grid layout with responsive behavior defined by the shared CSS contract.',
  },
  Input: {
    id: 'Input', version: COMPONENT_CONTRACT_VERSION,
    props: ['id', 'label', 'type', 'value', 'defaultValue', 'placeholder', 'required', 'disabled', 'readOnly', 'help', 'validation'], slots: ['label', 'help', 'validation'], events: ['input', 'change', 'update'],
    states: ['empty', 'valued', 'disabled', 'readOnly', 'invalid'], tokenRoles: ['input.background', 'input.border', 'input.text', 'input.placeholder', 'input.focus', 'field.message'],
    accessibility: ['Native input semantics', 'Label and help/error descriptions are programmatically associated'],
    compatibility: 'Canonicalizes TextField; TextField remains a non-counting compatibility alias.',
  },
  Select: {
    id: 'Select', version: COMPONENT_CONTRACT_VERSION_1_1,
    props: ['id', 'label', 'value', 'defaultValue', 'placeholder', 'required', 'disabled', 'options', 'help', 'validation'], slots: ['label', 'option', 'help', 'validation'], events: ['change', 'update'],
    states: ['unselected', 'selected', 'disabled', 'invalid'], tokenRoles: ['input.background', 'input.border', 'input.text', 'input.focus', 'field.message'],
    accessibility: ['Native select semantics', 'Label and descriptions are associated', 'Placeholder is an explicit empty-value option'],
    compatibility: 'Native select only; no custom combobox claim.',
  },
  Stack: {
    id: 'Stack', version: COMPONENT_CONTRACT_VERSION_1_1,
    props: ['direction', 'gap', 'align', 'justify', 'wrap', 'patternComponent', 'fields'], slots: ['default'], events: [],
    states: ['row', 'column', 'wrapped'], tokenRoles: ['layout.gap'], accessibility: ['Does not alter child semantics'],
    compatibility: 'Maps saved-schema stack and inline modes to one flex primitive; patternComponent and fields are executed composition directives.',
  },
  Table: {
    id: 'Table', version: COMPONENT_CONTRACT_VERSION,
    props: ['caption', 'columns', 'rows', 'density', 'selectable'], slots: ['caption', 'head', 'body', 'row', 'headerCell', 'cell'], events: ['rowActivate'],
    states: ['default', 'compact', 'selectable'], tokenRoles: ['table.background', 'table.border', 'table.text', 'table.rowHover', 'table.focus'],
    accessibility: ['Native table/head/body/row/header/data-cell semantics', 'Caption names the table', 'Selectable rows expose a real focus target'],
    compatibility: 'Named subparts are exports of one compound family and do not inflate the census.',
  },
  Tabs: {
    id: 'Tabs', version: COMPONENT_CONTRACT_VERSION,
    props: ['items', 'selectedId', 'defaultSelectedId', 'size', 'overflowLabel', 'ariaLabel'], slots: ['itemLabel', 'panel'], events: ['change', 'update'],
    states: ['selected', 'unselected', 'disabled', 'overflow'], tokenRoles: ['tabs.background', 'tabs.border', 'tabs.text', 'tabs.selected', 'tabs.focus'],
    accessibility: ['tablist/tab/tabpanel semantics', 'Arrow/Home/End keyboard navigation', 'Focus follows the selected tab'],
    compatibility: 'Item-driven API; overflow helper and Popover remain private.',
  },
  Text: {
    id: 'Text', version: COMPONENT_CONTRACT_VERSION_1_1,
    props: ['content', 'label', 'as', 'size', 'weight'], slots: ['default'], events: [],
    states: ['body', 'muted', 'emphasized'], tokenRoles: ['text.body', 'text.muted', 'font.body'], accessibility: ['Only governed safe intrinsic elements are emitted', 'Label is exposed as an accessible description'],
    compatibility: 'Defaults to span.',
  },
  Textarea: {
    id: 'Textarea', version: COMPONENT_CONTRACT_VERSION,
    props: ['id', 'label', 'value', 'defaultValue', 'rows', 'placeholder', 'required', 'disabled', 'readOnly', 'help', 'validation'], slots: ['label', 'help', 'validation'], events: ['input', 'change', 'update'],
    states: ['empty', 'valued', 'disabled', 'readOnly', 'invalid'], tokenRoles: ['input.background', 'input.border', 'input.text', 'input.placeholder', 'input.focus', 'field.message'],
    accessibility: ['Native textarea semantics', 'Label and help/error descriptions are programmatically associated'],
    compatibility: 'Shares the canonical field metadata and validation contract.',
  },
};
