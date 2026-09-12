> Archived on 2026-09-12 (s196-m04). This guide describes the historical Foundry component tree and is excluded from current governed component claims. See the [generated component index](../../components/README.md) for current contracts and evidence.

# Dialog

Accessible modal dialog built on the Overlay Manager. Uses tokenized surfaces and borders, traps focus, and restores focus on close.

- API: `<Dialog open onOpenChange title description closeOnEsc closeOnBackdrop />`
- ARIA: `role="dialog"`, `aria-modal="true"`, labelled by title, described by description.
- Policies: ESC closes by default; backdrop does not (configurable).

