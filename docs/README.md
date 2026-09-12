# OODS Foundry Documentation

**Object-Oriented Design System Foundry** — A trait-based composition system for building scalable, accessible, and themeable UI components.

## What is OODS Foundry?

OODS Foundry is a comprehensive design system architecture that enables you to build complex UI components from small, reusable building blocks called **traits**. Think of it as a foundry where UI components are forged through composition rather than built from scratch.

### Key Benefits

- **🧩 Composable Architecture**: Build complex objects from simple, reusable traits
- **🎨 Design-to-Code Sync**: Bidirectional workflow between Figma and your codebase
- **♿ Accessibility First**: Automated WCAG compliance checking, dark mode, and high-contrast support
- **🔒 Type-Safe**: Generate TypeScript types from YAML definitions automatically
- **🤖 AI-Augmented**: MCP (Model Context Protocol) integration for automated workflows
- **🎯 Context-Aware**: Same components adapt automatically to list, detail, form, and timeline contexts

## Quick Start by Role

### 👨‍🎨 For Designers
Start with tokens in Figma, export to the design system, and see changes reflected in Storybook.

**→ [Design Quickstart (10 minutes)](getting-started/design.md)**

### 👨‍💻 For Developers
Set up your local environment, make a small change, and push through the validation pipeline.

**→ [Development Quickstart (10 minutes)](getting-started/dev.md)**

### 🏗️ For Maintainers
Learn about the composition system, validation rules, and release workflow.

**→ [Maintainer Guide](#) (Coming soon)**

## Core Concepts

<!-- forge-claim:token-architecture -->
### 1. Four-Layer Token Architecture (conceptual)

This diagram illustrates four design roles. It is not a count of implemented token namespaces; the modifier layer is a conceptual role.

```
┌─────────────────────────────────────┐
│  Modifiers Layer (--mod-*)          │  ← Runtime variants (hover, focus, disabled)
├─────────────────────────────────────┤
│  Component Layer (--cmp-*)          │  ← Component-specific tokens
├─────────────────────────────────────┤
│  Theme Layer (--theme-*)            │  ← Light/dark, brand overlays
├─────────────────────────────────────┤
│  Reference Layer (--ref-*)          │  ← Foundational design tokens
└─────────────────────────────────────┘
```

The illustration recommends component-level aliases. The current build also includes system tokens; component implementations may reference those shared roles directly.

**→ [4-Layer Architecture Details](tokens/4-layer-overview.md)**

<!-- /forge-claim:token-architecture -->

### 2. Object & Trait Composition

**Traits** are reusable building blocks (like `Stateful`, `Timestampable` and `Labelled`).
**Objects** compose multiple traits into complete UI entities (like "Subscription", "Invoice", "User").

<!-- forge-claim:subscription-example -->
```yaml
# Canonical objects/core/Subscription.object.yaml composes 6 traits
object: { name: Subscription }
traits:
  - name: lifecycle/Stateful
  - name: lifecycle/Cancellable
  - name: lifecycle/Timestampable
  - name: financial/Billable
  - name: lifecycle/Archivable
  - name: viz/MarkArea
```

The core Subscription is the canonical tool identity; the separate domain-pack definition does not replace it.
<!-- /forge-claim:subscription-example -->

**→ [Authoring Objects Guide](authoring-objects.md)**  
**→ [Authoring Traits Guide](authoring-traits.md)**

### 3. Canonical Regions

<!-- forge-claim:canonical-regions -->
The view engine uses six canonical regions in this order:

- `globalNavigation`
- `pageHeader`
- `breadcrumbs`
- `viewToolbar`
- `main`
- `contextPanel`

<!-- /forge-claim:canonical-regions -->

**→ [Region Specification](specs/regions.md)**

### 4. Context System

<!-- forge-claim:context-inventory -->
The view engine registers 8 contexts: `list`, `detail`, `form`, `timeline`, `card`, `inline`, `chart`, `dashboard`. Examples of their presentation differences follow:
<!-- /forge-claim:context-inventory -->

- **List Context**: Compact spacing, dense typography for scannable lists
- **Detail Context**: Generous spacing, larger type for focused viewing
- **Form Context**: Inline validation, accessibility enhancements
- **Timeline Context**: Chronological layout with events

```tsx
// Same component, different contexts
<div className="context-list">
  <SubscriptionCard {...props} />  {/* Compact rendering */}
</div>

<div className="context-detail">
  <SubscriptionCard {...props} />  {/* Expanded rendering */}
</div>
```

**→ [Context Defaults](contexts/defaults.md)**

## Documentation Map

### 📚 Conceptual Guides
- [4-Layer Token Architecture](tokens/4-layer-overview.md)
- [Trait Composition System](compositor-readme.md)
- [Dependency Resolution](dependency-resolution.md)
- [Canonical Regions](specs/regions.md)

### 🎯 Task-Oriented Guides
- [Authoring Objects](authoring-objects.md)
- [Authoring Traits](authoring-traits.md)
- [Dark Theme Setup](themes/dark-quickstart.md)
- [High Contrast Setup](policies/hc-quickstart.md)
- [Contexts Quickstart](contexts/quickstart.md)

### 🔧 Technical Reference
- [CLI Reference](cli-reference.md)
- [Validation Rules](validation/composition-validator.md)
- [Composition Validation](validation/composition-validator.md)
- [MCP Agent Tools](mcp/Agent%20Recipes%20—%20Quick%20Index.md)

### 🎨 Design Resources
- [Figma Integration Guidelines](Figma%20Integration%20Guidelines%20for%20Traits.md)
- [Figma Roundtrip Checklist](figma/roundtrip-checklist.md)
- [Dark Theme Guide](themes/dark-guidelines.md)

### 🧪 Testing & Quality
- [Visual Regression Strategy](testing/visual-regression.md)
- [Integration Testing Strategy](testing/integration-strategy.md)
- [Accessibility Coverage](policies/dark-a11y-coverage.md)

## Project Structure

```
OODS-docs/
├── onboarding/           # Quick start guides by role
├── contexts/             # List, detail, form, timeline contexts
├── domains/              # Domain-specific implementations (e.g., billing)
├── tokens/               # 4-layer token architecture docs
├── themes/               # Dark mode, brand overlays
├── policies/             # Accessibility, high-contrast policies
├── validation/           # Composition validation, benchmarks
├── testing/              # Visual regression, integration tests
├── mcp/                  # AI agent integration (Model Context Protocol)
├── figma/                # Figma ↔ code roundtrip
├── authoring-objects.md  # How to define objects
├── authoring-traits.md   # How to define traits
├── cli-reference.md      # Command-line tools
└── compositor-readme.md  # Trait composition engine
```

## Common Workflows

### Making a Token Change
1. Edit tokens in Figma (Tokens Studio plugin)
2. Export tokens → `pnpm tokens:transform`
3. Verify in Storybook
4. Run validation: `pnpm validate:all`
5. Commit and open PR

**→ [Design Quickstart](getting-started/design.md)**

### Creating a New Object
1. Define traits in `traits/`
2. Compose object in `objects/`
3. Generate types: `pnpm types:generate`
4. Validate: `pnpm validate:composition`
5. Write stories for proof

**→ [Authoring Objects](authoring-objects.md)**

### Adding Accessibility Support
1. Enable dark mode: Add `data-theme="dark"` in Storybook
2. Run dark a11y scan: `pnpm test:dark-a11y`
3. Enable high contrast: `@media (prefers-contrast: more)`
4. Validate: `pnpm test:hc-snapshots`

**→ [Dark Theme Guide](themes/dark-guidelines.md)**  
**→ [High Contrast Policy](policies/high-contrast.md)**

## Validation & Quality Gates

OODS Foundry enforces quality through automated checks:

- **✅ Purity Audit**: Components use only `--cmp-*` tokens
- **✅ Composition Validation**: Trait dependencies are satisfied
- **✅ Type Safety**: Generated types match schemas
- **✅ Accessibility**: WCAG AA compliance, dark mode, high contrast
- **✅ Visual Regression**: Chromatic snapshots for UI changes
- **✅ Performance**: Benchmark thresholds for composition pipeline

**→ [Validation Strategy](validation/composition-validator.md)**

## Architecture Highlights

<!-- forge-claim:quintet-example -->
### Universal Quintet Pattern
The original modeling guide groups these examples into a “Universal Quintet.” This is a design vocabulary, not a measured prevalence claim:

1. **User/Person**: Authentication, authorization, identity
2. **Product/Item**: The "things" your system manages
3. **Transaction/Event**: State changes, business events
4. **Organization/Location**: Structural, spatial context
5. **Relationship/Association**: Many-to-many connections

**→ [Universal Quintet Reference](universal-quintet.md)**

<!-- /forge-claim:quintet-example -->

### MCP Integration (AI Agents)
OODS includes Model Context Protocol servers that enable AI agents to:

- Apply brand overlays with approval workflows
- Refresh visual regression baselines
- Fix accessibility issues automatically
- Repair enum-to-token drift
- Update documentation and stories

**→ [Agent Recipes](mcp/Agent%20Recipes%20—%20Quick%20Index.md)**

## Getting Help

- **Troubleshooting**: See inline troubleshooting sections in each guide
- **Examples**: Check `domains/billing/` for complete domain implementation
- **Slack**: #design-system (internal)
- **Issues**: File issues in the main repository

## Contributing

1. Read the [Development Quickstart](getting-started/dev.md)
2. Make changes in a feature branch
3. Run `pnpm validate:all` before committing
4. Open a PR with clear description
5. Wait for CI checks (purity, composition, a11y, VR)

## License

[MIT](../LICENSE)

---

**Next Steps**:
- 👉 [Start with the Design Quickstart](getting-started/design.md) if you work in Figma
- 👉 [Start with the Dev Quickstart](getting-started/dev.md) if you write code
- 👉 [Read Core Concepts](#core-concepts) to understand the system architecture
