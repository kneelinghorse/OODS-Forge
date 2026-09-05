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

React emits a required `actions: GeneratedUIActions` prop and domain-event
adapters. Vue emits the equivalent required `defineProps` contract and
idiomatic adapters. JavaScript output retains checked JSDoc or a required
runtime prop, so choosing `typescript: false` does not turn a missing action
into a silent no-op. Both targets also fail visibly at runtime if a caller
bypasses type checking and omits a named action.

Screen-root bindings produce a generated action surface beside the schema
root. Each native button has a deterministic
`data-oods-action="<handlerName>"` selector and invokes the matching injected
action through a generated adapter; semantic screen events are never attached
as fictional props to the layout component. Portable action parameters use
stable schema-derived operands, so the generated call site remains executable
without a consumer-authored replacement control. This deliberately supersedes
the Sprint 183 rule that treated screen bindings as external action-surface
declarations: the Subscription exit schemas declare all domain bindings on
their screen roots, and the older rule could not generate an interactive
workflow from those saved schemas.

## Artifact contract

`artifact.actions` groups compatible occurrences by handler name. Each entry
contains the portable ordered parameter list and every `{ nodeId, component,
event }` declaration source. Component and screen-root sources are wired by the
generated tree. Actions and sources are deterministically ordered, and the
whole contract participates in the artifact content hash. Hash-bound markers
make any of these regressions fail artifact validation:

- a schema binding remains but its domain action is deleted from metadata;
- a generated domain handler no longer forwards to `actions.<its own name>`;
- a generated local handler is changed to an empty or TODO-only body.

HTML remains the static control target. It emits the required empty
`artifact.actions` contract, but no runnable binding behavior or domain-action
requirements.
