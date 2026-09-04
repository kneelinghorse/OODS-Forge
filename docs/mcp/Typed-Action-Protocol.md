# Typed action protocol

`code.generate` classifies every supported schema binding before either React
or Vue emission. A binding is either behavior Forge can implement locally or a
domain action the generated UI must receive from its consumer. Unknown pairs,
duplicate node IDs, ambiguous aliases, and handler names reused across
different semantics stop generation with `OODS-V007`.

## Forge-owned local behavior

| Component | Supported schema events | Generated behavior |
|---|---|---|
| `Banner` | `onDismiss` | Owns visibility state and removes the banner after dismissal. A dismiss label is supplied when the schema omits one. |
| `Checkbox` | `onChange`, `onUpdate` | Owns a boolean controlled value. React adapts its native change event; Vue consumes the emitted boolean. |
| `DatePicker`, `Input`, `Select`, `Textarea` | `onChange`, `onInput`, `onUpdate` where the component supports the event | Owns a string controlled value. React adapts native events for `onChange`/`onInput`; Vue consumes component values. |
| `Tabs` | `onChange`, `onUpdate` | Owns the selected tab ID and initializes it from `selectedId`, `defaultSelectedId`, or the first enabled item. |

Local behavior is emitted as React state or Vue refs. It is not an optional
callback, and generated binding handlers may not contain an empty or TODO-only
body. `onUpdateModelValue`, `onUpdateSelectedId`, `onValueChange`,
`onCheckedChange`, and `onClick` are not schema aliases; generation rejects
them instead of guessing.

## Consumer-supplied domain actions

| Scope | Supported schema events | Portable parameters |
|---|---|---|
| `Button` | `onActivate` | none |
| `Table` | `onRowActivate` | `rowId: string` |
| Screen root | `onChange`, `onDelete`, `onEdit`, `onSubmit` | none |
| Screen root | `onRowClick` | `rowId: string` |
| Screen root | `onSort` | `column: string` |
| Screen root | `onFilter` | `criteria: Record<string, unknown>` |
| Screen root | `onPageChange` | `page: number` |

React emits a required `actions: GeneratedUIActions` prop and component-event
adapters. Vue emits the equivalent required `defineProps` contract and
idiomatic event adapters. JavaScript output retains checked JSDoc or a required
runtime prop, so choosing `typescript: false` does not turn a missing action
into a silent no-op. Both targets also fail visibly at runtime if a caller
bypasses type checking and omits a named action.

Screen-root bindings are declarations for a consumer-owned action surface.
They appear in the typed contract and `artifact.actions`, but are not attached
as unsupported props to the layout component used as the root. The consumer's
toolbar, menu, or routing surface invokes those required functions explicitly.

## Artifact contract

`artifact.actions` groups compatible occurrences by handler name. Each entry
contains the portable ordered parameter list and every `{ nodeId, component,
event }` declaration source. A component source is wired by the generated tree;
a screen-root source records the schema declaration consumed by the external
action surface. Actions and sources are deterministically ordered, and the
whole contract participates in the artifact content hash. Hash-bound source
markers make either of these regressions fail artifact validation:

- a schema binding remains but its domain action is deleted from metadata;
- a generated local or component-action handler is changed to an empty or
  TODO-only body.

HTML remains the static control target. It emits the required empty
`artifact.actions` contract, but no runnable binding behavior or domain-action
requirements.
