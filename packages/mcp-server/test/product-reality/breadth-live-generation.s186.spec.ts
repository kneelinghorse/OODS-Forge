import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import ts from 'typescript';
import { describe, expect, it } from 'vitest';

import { canonicalize, sha256 } from '@oods/artifacts';

import { validateGeneratedArtifact } from '../../src/codegen/artifact-envelope.js';
import { analyzeBindings } from '../../src/codegen/binding-utils.js';
import type { UiSchema } from '../../src/schemas/generated.js';
import { handle as generateCode } from '../../src/tools/code.generate.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../..');
const require = createRequire(import.meta.url);
const frameworks = ['react', 'vue'] as const;

// One declared invalid value per family so deleting a PROP_VALUE_CONTRACTS entry is observable.
const invalidProps = {
  ClassificationPanel: { title: false },
  FilterPanel: { filters: 'all' },
  PriceSummary: { amount: true },
  AddressCollectionPanel: { summary: 7 },
  MembershipPanel: { subtitle: false },
  PreferencePanel: { emptyMessage: [] },
  TagManager: { tags: 'alpha' },
  AddressSummaryBadge: { role: 7 },
  MessageStatusBadge: { delivery: false },
  PreferenceSummaryBadge: { version: [] },
  RoleBadgeList: { roles: 'owner' },
  TagPills: { maxVisible: true },
  AddressValidationTimeline: { validations: 'checked' },
  AuditEvent: { timestamp: 7 },
  MembershipAuditTimeline: { title: false },
  MessageEventTimeline: { messages: {} },
  PreferenceTimeline: { changes: 'none' },
  AddressEditor: { street: 7 },
  PreferenceEditor: { namespaces: 'billing' },
  RoleAssignmentForm: { roles: 'owner' },
  StatusSelector: { options: 'draft' },
  TagInput: { placeholder: 7 },
  TemplatePicker: { templates: 'welcome' },
};

// Sprint 186 subjects, appended per mission with the directives each schema lowers.
// `carried` names composer-authored defects that no component port can repair: the
// saved schema keeps failing with exactly those issues, and the lowering assertions run
// on the schema with those nodes pruned (the m05 live cells run on the same derivation).
const SCHEMAS: Record<string, {
  breadth: Array<keyof typeof invalidProps>;
  lowered: Record<(typeof frameworks)[number], string[]>;
  consumedDirectives: string[];
  carried?: Array<{ nodeId: string; component: string; field: string; kind: string }>;
}> = {
  'test-tagged-schema': {
    breadth: ['ClassificationPanel', 'FilterPanel', 'PriceSummary'],
    lowered: {
      react: [
        'amount={unitAmountCents}', 'currency={currency}', 'model={pricingModel}', 'interval={billingInterval}',
        'filters={filters}', 'activeFilters={activeFilters}',
        // The DetailHeader on this schema hid three more directives behind the N015 mask.
        'title={label}', 'subtitle={description}', 'level={1}',
      ],
      vue: [
        ':amount="unitAmountCents"', ':currency="currency"', ':model="pricingModel"', ':interval="billingInterval"',
        ':filters="filters"', ':activeFilters="activeFilters"',
        ':title="label"', ':subtitle="description"', ':level="1"',
      ],
    },
    consumedDirectives: [
      'amountField', 'currencyField', 'modelField', 'intervalField', 'taxBehaviorField',
      'categoriesField', 'tagsField', 'metadataField', 'modeParameter', 'activeField', 'collapsibleParameter',
      'titleField', 'subtitleField', 'headingLevel',
    ],
  },
  'user-detail-showcase': {
    breadth: ['AddressCollectionPanel', 'MembershipPanel', 'PreferencePanel', 'TagManager'],
    lowered: { react: ['tags={tags}'], vue: [':tags="tags"'] },
    consumedDirectives: [
      'allowCustomParameter', 'allowListParameter', 'maxTagsParameter', 'moderationParameter', 'synonymParameter',
      'membershipsField', 'hierarchyField', 'roleField', 'permissionField',
      'defaultRoleField', 'roleParameter', 'preferencesField', 'metadataField', 'namespaceField',
      // The composer writes these onto the pattern-group Stack; the N015 mask hid them at planning.
      'channelsField', 'templatesField', 'policiesField', 'conversationsField',
    ],
  },
  'user-list-showcase': {
    breadth: ['AddressSummaryBadge', 'MessageStatusBadge', 'PreferenceSummaryBadge', 'RoleBadgeList', 'TagPills'],
    lowered: {
      react: ['role={defaultAddressRole}', 'version={preferenceVersion}', 'roles={sessionRoles}', 'tags={tags}', 'maxVisible={3}', 'overflowLabel="+{{ tag_count }}"'],
      vue: [':role="defaultAddressRole"', ':version="preferenceVersion"', ':roles="sessionRoles"', ':tags="tags"', ':maxVisible="3"', 'overflowLabel="+{{ tag_count }}"'],
    },
    consumedDirectives: ['statusesField', 'namespacesField', 'versionField', 'rolesField', 'fallbackRoleParameter'],
  },
  'user-timeline-showcase': {
    breadth: ['AddressValidationTimeline', 'AuditEvent', 'MembershipAuditTimeline', 'MessageEventTimeline', 'PreferenceTimeline'],
    lowered: {
      // The pattern-group Stack's historyField and showReason travel to the lowered StatusTimeline.
      react: ['event={lastEvent}', 'timestamp={lastEventAt}', 'events={addresses}', 'events={membershipRecords}', 'messages={messages}', 'statuses={messageStatuses}', 'history={stateHistory}', 'showReason'],
      vue: [':event="lastEvent"', ':timestamp="lastEventAt"', ':events="addresses"', ':events="membershipRecords"', ':messages="messages"', ':statuses="messageStatuses"', ':history="stateHistory"', 'showReason'],
    },
    consumedDirectives: ['typeField', 'timestampField', 'timezoneParameter', 'messagesField', 'statusesField', 'metadataField', 'labelField', 'historyField'],
  },
  'user-form-showcase': {
    breadth: ['AddressEditor', 'PreferenceEditor', 'RoleAssignmentForm', 'StatusSelector', 'TagInput', 'TemplatePicker'],
    lowered: {
      // StatusSelector and TagInput own local string state; the Text and pattern-group Stack that share
      // handleChange_status subscribe to it; TagInput shares handleChange_tags with the plain tags Input.
      react: [
        'value={handleChange_statusState}', 'onChange={handleChange_status}', '>{handleChange_statusState}</Text>',
        'tags={tags}', 'value={handleChange_tagsState}', 'onChange={handleChange_tags}', 'handleChange_addresses(address)',
        'namespaces={preferenceNamespaces}', 'availableRoles={roleCatalog}', 'templates={templateCatalog}', 'channels={channelCatalog}',
      ],
      vue: [
        ':modelValue="handleChange_statusState"', '@change="handleChange_status"', '{{ handleChange_statusState }}',
        ':tags="tags"', ':modelValue="handleChange_tagsState"', '@change="handleChange_tags"', 'handleChange_addresses(address)',
        ':namespaces="preferenceNamespaces"', ':availableRoles="roleCatalog"', ':templates="templateCatalog"', ':channels="channelCatalog"',
      ],
    },
    consumedDirectives: [
      'optionsParameter', 'initialParameter', 'allowedTransitionsField', 'requireReasonParameter',
      'maxTagsParameter', 'allowCustomParameter', 'allowListParameter', 'minLengthParameter', 'maxLengthParameter', 'synonymParameter',
      'roleParameter', 'allowDynamicParameter', 'defaultRoleField',
      'namespacesField', 'documentField', 'registryNamespaceParameter',
      'availableRolesField', 'membershipField', 'defaultRoleParameter', 'templatesField', 'channelsField',
    ],
    carried: [
      { nodeId: 'slot-field-3-13', component: 'Input', field: 'address_roles', kind: 'array' },
      { nodeId: 'slot-field-5-17', component: 'Input', field: 'preference_document', kind: 'unknown' },
      { nodeId: 'slot-field-6-19', component: 'DatePicker', field: 'state_history', kind: 'array' },
      { nodeId: 'slot-field-8-23', component: 'Input', field: 'tags', kind: 'array' },
      { nodeId: 'slot-field-9-25', component: 'Input', field: 'tag_metadata', kind: 'array' },
    ],
  },
};

function pruneNodes(schema: UiSchema, nodeIds: readonly string[]): UiSchema {
  const prune = (nodes: UiSchema['screens']): UiSchema['screens'] => nodes
    .filter((node) => !nodeIds.includes(node.id))
    .map((node) => (node.children ? { ...node, children: prune(node.children as UiSchema['screens']) } : node)) as UiSchema['screens'];
  return { ...schema, screens: prune(schema.screens) };
}

const CARRIED_FORM_NODE_IDS = SCHEMAS['user-form-showcase']!.carried!.map(({ nodeId }) => nodeId);

function savedSchema(name: string): UiSchema {
  return JSON.parse(readFileSync(path.join(root,
    `artifacts/product-reality/sprint-183/m04/saved-schema-store/${name}.json`), 'utf8')).schema as UiSchema;
}

const detailHeaderSchema = (props: Record<string, unknown>, fieldType = 'string'): UiSchema => ({
  version: '1.0',
  screens: [{ id: 'header', component: 'DetailHeader', props }],
  objectSchema: { label: { type: fieldType, required: true, description: 'Display name' } },
});

describe('Sprint 186 DetailHeader saved-schema directives', () => {
  for (const framework of frameworks) {
    it(`${framework} lowers titleField/subtitleField/headingLevel and rejects a non-string field or out-of-range level`, async () => {
      const ok = await generateCode({ framework, profile: 'build',
        schema: detailHeaderSchema({ titleField: 'label', headingLevel: 3 }) });
      expect(ok.status, JSON.stringify(ok.errors)).toBe('ok');
      expect(ok.code).toContain(framework === 'react' ? 'title={label} level={3}' : ':title="label" :level="3"');
      expect(ok.code).not.toContain('titleField');
      expect(ok.code).not.toContain('headingLevel');
      const numeric = await generateCode({ framework, profile: 'build',
        schema: detailHeaderSchema({ titleField: 'label' }, 'number') });
      expect(numeric.errors).toEqual([expect.objectContaining({ code: 'OODS-V007', component: 'DetailHeader',
        message: 'Field "label" referenced by DetailHeader.titleField must contain string data.' })]);
      for (const headingLevel of [0, 7, 2.5, '2']) {
        const invalid = await generateCode({ framework, profile: 'build', schema: detailHeaderSchema({ headingLevel }) });
        expect(invalid.errors, String(headingLevel)).toEqual([expect.objectContaining({ code: 'OODS-V007', component: 'DetailHeader' })]);
      }
    });
  }

  it('html keeps its visible placeholder for the lowered title and its own default heading level', async () => {
    const result = await generateCode({ framework: 'html', profile: 'build',
      schema: detailHeaderSchema({ titleField: 'label', headingLevel: 3 }) });
    expect(result.status, JSON.stringify(result.errors)).toBe('ok');
    expect(result.code).toContain('<h2>[label]</h2>');
    expect(result.code).not.toContain('heading-level');
  });
});

describe('Sprint 186 container directives consumed without a binding', () => {
  const stackSchema: UiSchema = {
    version: '1.0',
    screens: [{ id: 'group', component: 'Stack', props: {
      channelsField: 'channel_catalog', templatesField: 'template_catalog', policiesField: 'delivery_policies',
      conversationsField: 'conversations', patternComponent: 'StatusTimeline', fields: ['status'],
    }, children: [{ id: 'status-text', component: 'Text', props: { field: 'status' } }] }],
    objectSchema: {
      status: { type: 'string', required: true, description: 'Lifecycle state' },
      channel_catalog: { type: 'object[]', required: false, description: 'Channels' },
      template_catalog: { type: 'object[]', required: false, description: 'Templates' },
      delivery_policies: { type: 'object[]', required: false, description: 'Policies' },
      conversations: { type: 'object[]', required: false, description: 'Conversations' },
    },
  };
  const addressSchema: UiSchema = {
    version: '1.0',
    screens: [{ id: 'addresses', component: 'AddressCollectionPanel', props: { field: 'addresses', roleField: 'address_roles', defaultRoleField: 'default_address_role', roleParameter: 'roles' } }],
    objectSchema: {
      addresses: { type: 'AddressableEntry[]', required: false, description: 'Addresses' },
      address_roles: { type: 'string[]', required: true, description: 'Roles' },
      default_address_role: { type: 'string', required: false, description: 'Default role' },
    },
  };
  const timelineGroupSchema: UiSchema = {
    version: '1.0',
    screens: [{ id: 'group', component: 'Stack', props: {
      historyField: 'state_history', labelField: 'status', showActor: true, showReason: true,
      patternComponent: 'StatusTimeline', fields: ['status'],
    }, children: [{ id: 'status-text', component: 'Text', props: { field: 'status' } }] }],
    objectSchema: {
      status: { type: 'string', required: true, description: 'Lifecycle state' },
      state_history: { type: 'StateTransition[]', required: false, description: 'History' },
    },
  };
  for (const framework of frameworks) {
    it(`${framework} carries historyField and showReason into the lowered StatusTimeline and drops labelField and showActor`, async () => {
      const group = await generateCode({ framework, profile: 'build', schema: timelineGroupSchema });
      expect(group.status, JSON.stringify(group.errors)).toBe('ok');
      expect(group.code).toContain(framework === 'react' ? 'history={stateHistory}' : ':history="stateHistory"');
      expect(group.code).toContain('showReason');
      expect(group.code).not.toContain('labelField');
      expect(group.code).not.toContain('historyField');
      expect(group.code).not.toMatch(/\bshowActor\b/);
      const invalid = await generateCode({ framework, profile: 'build', schema: {
        ...timelineGroupSchema,
        screens: [{ ...timelineGroupSchema.screens[0]!, props: { ...timelineGroupSchema.screens[0]!.props, showActor: 'yes' } }],
      } });
      expect(invalid.errors).toEqual([expect.objectContaining({ code: 'OODS-V007', component: 'Stack',
        message: 'Prop "showActor" on Stack must be a boolean; received string.' })]);
    });

    it(`${framework} consumes pattern-group Stack directives and the address panel field without leaking them`, async () => {
      const stack = await generateCode({ framework, profile: 'build', schema: stackSchema });
      expect(stack.status, JSON.stringify(stack.errors)).toBe('ok');
      for (const directive of ['channelsField', 'templatesField', 'policiesField', 'conversationsField']) expect(stack.code).not.toContain(directive);
      // user-form-showcase leaves `as` on the expanded title Stack and `field` on the pattern-group Stack.
      const leftovers = await generateCode({ framework, profile: 'build', schema: {
        ...stackSchema,
        screens: [{ id: 'title', component: 'Stack', props: { as: 'h1' }, children: [
          { ...stackSchema.screens[0]!, props: { ...stackSchema.screens[0]!.props, field: 'status' } },
        ] }],
      } });
      expect(leftovers.status, JSON.stringify(leftovers.errors)).toBe('ok');
      expect(leftovers.code).not.toMatch(/\bas=/);
      expect(leftovers.code).not.toContain('field=');
      expect(leftovers.code).toContain('<StatusTimeline');
      const address = await generateCode({ framework, profile: 'build', schema: addressSchema });
      expect(address.status, JSON.stringify(address.errors)).toBe('ok');
      expect(address.code).toMatch(/<AddressCollectionPanel id="addresses" data-oods-component="AddressCollectionPanel" \/>/);
      const missing = await generateCode({ framework, profile: 'build', schema: {
        ...addressSchema, screens: [{ id: 'addresses', component: 'AddressCollectionPanel', props: { field: 'missing' } }],
      } });
      expect(missing.errors).toEqual([expect.objectContaining({ code: 'OODS-V007', component: 'AddressCollectionPanel',
        message: 'Field "missing" referenced by AddressCollectionPanel does not exist in objectSchema.' })]);
    });
  }
});

describe('Sprint 186 badge-family field lowering', () => {
  const badgeSchema: UiSchema = {
    version: '1.0',
    screens: [{ id: 'row', component: 'Stack', children: [
      { id: 'address', component: 'AddressSummaryBadge', props: { field: 'default_address_role', label: 'Default role' } },
      { id: 'pills', component: 'TagPills', props: { field: 'tags', maxVisible: 2, overflowLabel: '+{{ tag_count }}', label: 'Tags' } },
    ] }],
    objectSchema: {
      default_address_role: { type: 'string', required: false, description: 'Role' },
      tags: { type: 'string[]', required: false, description: 'Tags' },
    },
  };
  for (const framework of frameworks) {
    it(`${framework} lowers AddressSummaryBadge.field to role beside its authored label and TagPills.field to tags without its label`, async () => {
      const result = await generateCode({ framework, profile: 'build', schema: badgeSchema });
      expect(result.status, JSON.stringify(result.errors)).toBe('ok');
      expect(result.code).toContain(framework === 'react' ? 'role={defaultAddressRole}' : ':role="defaultAddressRole"');
      expect(result.code).toContain('label="Default role"');
      expect(result.code).toContain(framework === 'react' ? 'tags={tags}' : ':tags="tags"');
      expect(result.code).not.toMatch(/TagPills[^>]*\blabel=/);
      expect(result.code).not.toContain('field=');
    });
  }

  it('html keeps the authored label and shows the bound role placeholder as the badge status', async () => {
    const result = await generateCode({ framework: 'html', profile: 'build', schema: badgeSchema });
    expect(result.status, JSON.stringify(result.errors)).toBe('ok');
    expect(result.code).toContain('data-badge-status="[defaultAddressRole]"');
    expect(result.code).toContain('>Default role</span>');
    expect(result.code).not.toContain(' role="[');
  });
});

describe('Sprint 186 list-context field-bound inputs on Vue', () => {
  // user-list-showcase binds a filter Select to a field inside a list context, where the
  // Vue emitter keeps fields as props; v-model on a prop fails the consumer's production build.
  const listSchema: UiSchema = {
    version: '1.0',
    screens: [{ id: 'list', component: 'Stack', bindings: { onRowClick: 'handleRowClick' }, children: [
      { id: 'filter', component: 'Select', props: { field: 'last_event', label: 'Event' } },
    ] }],
    objectSchema: { last_event: { type: 'string', required: true, description: 'Event', enum: ['created', 'updated'] } },
  };
  const formSchema: UiSchema = {
    version: '1.0',
    screens: [{ id: 'form', component: 'Stack', children: [
      { id: 'filter', component: 'Select', props: { field: 'last_event', label: 'Event' } },
    ] }],
    objectSchema: listSchema.objectSchema,
  };
  it('reads a list-context field one-way and keeps form-mode refs two-way, both compiling as Vue templates', async () => {
    const list = await generateCode({ framework: 'vue', profile: 'build', schema: listSchema });
    expect(list.status, JSON.stringify(list.errors)).toBe('ok');
    expect(list.code).toContain(':modelValue="lastEvent"');
    expect(list.code).not.toContain('v-model="lastEvent"');
    expect(list.code).toContain('lastEvent } = defineProps<Props>()');
    const form = await generateCode({ framework: 'vue', profile: 'build', schema: formSchema });
    expect(form.status, JSON.stringify(form.errors)).toBe('ok');
    expect(form.code).toContain('v-model="lastEvent"');
    expect(form.code).toContain("const lastEvent = ref<'created' | 'updated'>('created');");
    const compiler = require('@vue/compiler-sfc') as typeof import('@vue/compiler-sfc');
    for (const [name, code] of [['list', list.code], ['form', form.code]] as const) {
      const parsed = compiler.parse(code, { filename: `${name}.vue` });
      expect(parsed.errors, name).toEqual([]);
      const template = compiler.compileTemplate({ id: name, filename: `${name}.vue`, source: parsed.descriptor.template!.content });
      expect(template.errors, name).toEqual([]);
    }
  });
});

describe('Sprint 186 saved form bindings on user-form-showcase', () => {
  const textSubscriptionSchema = (bindings: Record<string, Record<string, string>>, options: { textChildren?: boolean; inputField?: string } = {}): UiSchema => ({
    version: '1.0',
    screens: [{ id: 'form', component: 'Stack', children: [
      { id: 'status', component: 'StatusSelector', props: { field: 'status', label: 'Status' }, bindings: bindings.status },
      { id: 'mirror', component: 'Text', props: { field: 'status', ...(options.textChildren ? { children: 'Authored' } : {}) }, bindings: bindings.mirror },
      { id: 'tags', component: 'TagInput', props: { field: 'tags', label: 'Tags' }, bindings: bindings.tags },
      { id: 'tags-input', component: 'Input', props: { field: options.inputField ?? 'tags', label: 'Tags' }, bindings: bindings.tagsInput },
    ] }],
    objectSchema: {
      status: { type: 'string', required: true, description: 'Status' },
      tags: { type: 'string[]', required: false, description: 'Tags' },
      name: { type: 'string', required: false, description: 'Name' },
    },
  });
  const baseBindings = {
    status: { onChange: 'handleChange_status' }, mirror: { onChange: 'handleChange_status' },
    tags: { onChange: 'handleChange_tags' }, tagsInput: { onChange: 'handleChange_tags' },
  };

  it('keeps refusing the five composer-authored controls over array and object fields on the saved schema, and nothing else', async () => {
    const saved = savedSchema('user-form-showcase');
    const analysis = analyzeBindings(saved.screens);
    expect(analysis.issues).toEqual([]);
    expect(analysis.handlers.find(({ handlerName }) => handlerName === 'handleChange_tags')?.occurrences.map(({ nodeId }) => nodeId))
      .toEqual(['ve-title-27', 'slot-field-8-23']);
    for (const framework of frameworks) {
      const result = await generateCode({ schema: saved, framework, profile: 'build' });
      expect(result.status).toBe('error');
      expect(result.errors).toEqual(SCHEMAS['user-form-showcase']!.carried!.map(({ nodeId, component, field, kind }) => expect.objectContaining({
        code: 'OODS-V007', nodeId, component,
        message: `Field "${field}" has ${kind} data, which cannot bind to ${component}.value on the ${framework} target; accepted field kinds: string, number, boolean.`,
      })));
    }
  });

  it('lets same-field controls share one local writer, subscribes a Text display to it, and reports a writerless display as inert', () => {
    const analysis = analyzeBindings(textSubscriptionSchema(baseBindings).screens);
    expect(analysis.issues).toEqual([]);
    expect(analysis.handlers.filter(({ kind }) => kind === 'local').map(({ handlerName, occurrences }) => [handlerName, occurrences.map(({ nodeId }) => nodeId)]))
      .toEqual([['handleChange_status', ['status']], ['handleChange_tags', ['tags', 'tags-input']]]);
    expect(analysis.readonlyFieldSubscriptions).toEqual([expect.objectContaining({ nodeId: 'mirror', component: 'Text', field: 'status', writer: expect.objectContaining({ nodeId: 'status' }) })]);
    expect(analysis.inertSubscriptions).toEqual([]);

    const inert = analyzeBindings(textSubscriptionSchema({ ...baseBindings, mirror: { onChange: 'handleChange_nobody' } }).screens);
    expect(inert.issues).toEqual([]);
    expect(inert.readonlyFieldSubscriptions).toEqual([]);
    expect(inert.inertSubscriptions).toEqual([expect.objectContaining({ nodeId: 'mirror', component: 'Text', handlerName: 'handleChange_nobody', field: 'status' })]);

    const differentFields = analyzeBindings(textSubscriptionSchema(baseBindings, { inputField: 'name' }).screens);
    expect(differentFields.issues).toEqual([expect.objectContaining({ code: 'AMBIGUOUS_HANDLER', handlerName: 'handleChange_tags' })]);

    const authored = analyzeBindings(textSubscriptionSchema(baseBindings, { textChildren: true }).screens);
    expect(authored.issues).toEqual([expect.objectContaining({ code: 'INVALID_READONLY_FIELD_SUBSCRIPTION', nodeId: 'mirror',
      message: 'Read-only binding Text.onChange cannot replace authored children with a field subscription.' })]);
  });

  for (const framework of frameworks) {
    it(`${framework} emits controlled wave-2 form controls, one shared state, an inert-binding warning, and a hash-sealed handler`, async () => {
      const result = await generateCode({ schema: pruneNodes(savedSchema('user-form-showcase'), CARRIED_FORM_NODE_IDS), framework, profile: 'build' });
      expect(result.status, JSON.stringify(result.errors)).toBe('ok');
      expect(result.warnings).toEqual(expect.arrayContaining([expect.objectContaining({
        code: 'OODS-V007', component: 'Text', nodeId: 'pg-status-timeline-135',
        message: 'Binding Text.onChange to handleChange_allowed_transitions names no local writer; the display renders its field directly.',
      })]));
      const code = result.code;
      // The pattern-group Stack lowers to the StatusTimeline and never acquires a change attribute.
      expect(code).toMatch(/<StatusTimeline\b[^>]*id="slot-field-0-3"[^>]*>/);
      expect(code.match(/<StatusTimeline\b[^>]*id="slot-field-0-3"[^>]*>/)![0]).not.toMatch(/onChange|@change/);
      expect(code.match(/@oods-local-binding handleChange_tags \*\//g)).toHaveLength(1);
      expect(code.match(/@oods-local-binding handleChange_status \*\//g)).toHaveLength(1);
      expect(code).not.toMatch(/<Stack\b[^>]*\bas=/);
      // The editor's domain binding owns its action selector on the element itself.
      expect(code).toMatch(framework === 'react'
        ? /<AddressEditor\b[^>]*data-oods-action="handleChange_addresses"[^>]*onChange=\{handleChange_addresses\}/
        : /<AddressEditor\b[^>]*data-oods-action="handleChange_addresses"[^>]*@change="handleChange_addresses"/);
      expect(code.match(/data-oods-action="handleChange_addresses"/g)).toHaveLength(1);
      if (framework === 'react') {
        expect(code.match(/const \[handleChange_tagsState, setHandleChange_tagsState\]/g)).toHaveLength(1);
        expect(code).toMatch(/<TagInput\b[^>]*\btags=\{tags\}/);
        expect(code).toMatch(/<TagInput\b[^>]*\bvalue=\{handleChange_tagsState\}/);
        expect(code).toContain('React.ChangeEvent<HTMLSelectElement>');
      } else {
        expect(code.match(/const handleChange_tagsState = ref/g)).toHaveLength(1);
        expect(code).toMatch(/<TagInput\b[^>]*:tags="tags"/);
        expect(code).toMatch(/<TagInput\b[^>]*:modelValue="handleChange_tagsState"/);
      }
      expect(code).not.toContain('handleChange_allowed_transitions');

      // The owned-state guard bites when the shared handler stops updating its state.
      const artifact = result.artifact!;
      expect(validateGeneratedArtifact(artifact)).toEqual([]);
      const mutated = structuredClone(artifact);
      const entry = mutated.files[0]!;
      entry.contents = entry.contents.replace(/(const handleChange_status = .*?=> \{).*?(\};)/, '$1 $2');
      expect(entry.contents).not.toBe(artifact.files[0]!.contents);
      for (const file of mutated.files) file.contentHash = `sha256:${sha256(file.contents)}`;
      const { contentHash: _old, ...payload } = mutated;
      mutated.contentHash = `sha256:${sha256(canonicalize(payload))}`;
      expect(validateGeneratedArtifact(mutated)).toEqual([
        "Generated local binding handler 'handleChange_status' must update its own state from its input or dismiss it.",
      ]);
    });
  }
});

describe('Sprint 186 live readiness, directive lowering and root export generation', () => {
  for (const framework of frameworks) {
    for (const [component, typedInvalid] of Object.entries(invalidProps)) {
      for (const [kind, props] of Object.entries({ unknown: { bogusProp: 'reject' }, typed: typedInvalid })) {
        it(`${framework}/${component}/${kind} rejects invalid props at the live build boundary`, async () => {
          // No readiness injection: implementations, exports and all evidence refs must resolve first.
          const result = await generateCode({ framework, profile: 'build', schema: {
            version: '1.0', screens: [{ id: 'invalid-breadth', component, props }],
          } });
          expect(result.status).toBe('error');
          expect(result.artifact).toBeUndefined();
          expect(result.validationReceipt.checks).toContain('props-contract');
          expect(result.errors).toEqual([expect.objectContaining({ code: 'OODS-V007', component })]);
        });
      }
    }

    for (const [name, expected] of Object.entries(SCHEMAS)) {
      it(`${framework}/${name} generates unchanged, lowers every directive, and resolves every emitted import`, async () => {
        const schema = expected.carried ? pruneNodes(savedSchema(name), expected.carried.map(({ nodeId }) => nodeId)) : savedSchema(name);
        const before = JSON.stringify(schema);
        const result = await generateCode({ schema, framework, profile: 'build' });
        expect(result.status, JSON.stringify(result.errors)).toBe('ok');
        expect(result.artifact).toBeDefined();
        expect(result.errors ?? []).toEqual([]);
        expect(JSON.stringify(schema)).toBe(before);
        const script = framework === 'vue'
          ? result.code.match(/<script\b[^>]*>([\s\S]*?)<\/script>/)?.[1]
          : result.code;
        expect(script).toBeTruthy();
        for (const binding of expected.lowered[framework]) expect(result.code, binding).toContain(binding);
        for (const directive of expected.consumedDirectives) expect(result.code, directive).not.toContain(directive);

        const source = ts.createSourceFile('generated.tsx', script!, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
        const importedBreadth: string[] = [];
        for (const statement of source.statements) {
          if (!ts.isImportDeclaration(statement) || !ts.isStringLiteral(statement.moduleSpecifier)) continue;
          const specifier = statement.moduleSpecifier.text;
          if (!specifier.startsWith('@oods/components-') || statement.importClause?.isTypeOnly) continue;
          expect(require.resolve(specifier)).toContain('/dist/');
          const exports = require(specifier) as Record<string, unknown>;
          const bindings = statement.importClause?.namedBindings;
          if (!bindings || !ts.isNamedImports(bindings)) continue;
          for (const binding of bindings.elements) {
            if (binding.isTypeOnly) continue;
            const symbol = (binding.propertyName ?? binding.name).text;
            expect(exports[symbol], `${specifier}#${symbol}`).toBeDefined();
            if (Object.hasOwn(invalidProps, symbol)) {
              expect(specifier).toBe(`@oods/components-${framework}`);
              importedBreadth.push(symbol);
            }
          }
        }
        expect(importedBreadth.sort()).toEqual([...expected.breadth].sort());
      });
    }
  }
});
