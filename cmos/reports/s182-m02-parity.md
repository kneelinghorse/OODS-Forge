# Sprint 182 M02 React parity report

Date: 2026-09-03
Mission: `s182-m02`
Frozen predecessor: `38afc8a`
Target: `@oods/components-react`
Result: 14 React cells are `implemented-evidence-complete` and `emissionEligible`; this is not a
`codegenUsable`, `foundation-v1`, release, or production-readiness claim.

## Canonical surface

The root package exports exactly these 14 runtime values and their public declarations:

`Badge`, `Banner`, `Button`, `Card`, `Checkbox`, `DatePicker`, `Grid`, `Input`, `Select`, `Stack`,
`Table`, `Tabs`, `Text`, and `Textarea`.

Non-census public surfaces are isolated behind package subpaths:

- `@oods/components-react/status` owns the status registry, tone tokens, and glyph resolver used by
  canonical `Badge`, `Banner`, and status-aware `Table.Cell`.
- `@oods/components-react/table` exposes `TableHead`, `TableBody`, `TableCaption`, `TableRow`,
  `TableHeaderCell`, and `TableCell` while `Table` remains the one root census member.
- `@oods/components-react/readiness` exposes the packed 14-row readiness JSON.

`TextField`, `Popover`, and the former `REACT_COMPONENT_PACKAGE_FOUNDATION` scaffold are not root
runtime exports. `TextField` remains only a legacy root-repository alias to canonical `Input`.

## Contract and implementation matrix

| Component | Canonical source | Frozen shared scenario | Compatibility disposition |
|---|---|---|---|
| Badge | `src/presentational.tsx` | `badge-status` | Package-owned status/domain registry preserves label, tone, icon, description, and token behavior. |
| Banner | `src/presentational.tsx` | `banner-dismissible` | Status/domain or explicit tone; critical announces as `alert`; dismissal is a named native button. |
| Button | `src/presentational.tsx` | `button-activate` | Native `type="button"` default; `asChild` remains a React-only Radix Slot extension. |
| Card | `src/presentational.tsx` | `card-elevated-content` | One semantic container with the existing `as`/elevated extensions; no invented subfamily. |
| Checkbox | `src/fields.tsx` | `checkbox-controlled` | Native checkbox, controlled/uncontrolled state, required/disabled/help/validation associations. |
| DatePicker | `src/fields.tsx` | `date-picker-bounded` | Composes canonical `Input` with native `type="date"`, ISO values, min/max/step. |
| Grid | `src/layout.tsx` | `grid-responsive` | Concrete CSS-grid primitive with columns/minimum-column width and token gaps. |
| Input | `src/fields.tsx` | `input-invalid` | Canonical field implementation; root `TextField` is the same value, not another component. |
| Select | `src/fields.tsx` | `select-controlled` | Native select with stable label, options, help/validation, and idiomatic update event. |
| Stack | `src/layout.tsx` | `stack-wrapped-row` | Concrete flex primitive for row/column, gap, alignment, justification, and wrapping. |
| Table | `src/table.tsx` | `table-selectable-row` | One semantic compound family; static subparts plus the dedicated `./table` subpath. |
| Tabs | `src/tabs.tsx` | `tabs-keyboard` | Item API; automatic Arrow/Home/End activation, disabled-item skip, private overflow machinery. |
| Text | `src/presentational.tsx` | `text-semantic` | Safe intrinsic elements include existing `dt`/`dd` callers; defaults to `span`. |
| Textarea | `src/fields.tsx` | `textarea-controlled` | Native textarea with the shared field metadata, validation, and controlled update contract. |

`ComponentTone` retains the existing `accent` extension in addition to the shared semantic tones.
`TabsProps` omits the native `onChange` attribute before defining its string-ID change callback and
accepts canonical `ariaLabel` plus the root-compatible `aria-label`; item `isDisabled` normalizes to
canonical `disabled`.

## Behavioral and accessibility parity

- All 14 frozen scenarios mount a nondegenerate canonical marker and execute the declared
  event/assertion outcome or concrete semantic/layout/content outcome; the scenario suite is 15/15
  because one test also proves exact scenario-to-component coverage.
- Server rendering covers all 14 scenarios without browser globals.
- Field tests prove native label targeting, help/error `aria-describedby`, `aria-invalid`, required,
  disabled, controlled value, and framework-idiomatic update behavior.
- Interaction tests prove Banner dismissal, Button activation, selectable Table row activation, and
  automatic Tabs focus/selection with ArrowRight, ArrowLeft, Home, End, and disabled-item skipping.
- The mounted nucleus passes automated axe. Color contrast is proved in the browser evidence because
  jsdom cannot compute the frozen token cascade.

## Visual and responsive evidence

The owned report at
`artifacts/product-reality/sprint-182/m02/visual-regression/report.json` was generated at
`2026-09-04T02:30:22.088Z`: selected 9, failed 0, skipped 0 in Chromium `141.0.7390.37`.

All captures use persistent animation/transition/caret freeze CSS and a single viewport containing
the complete document; desktop capture is explicitly non-`fullPage`. Every brand/theme cell
recomputes geometry after Tabs/focus/hover interaction and proves 11 concrete profile, field,
checkbox, tab-panel, table-header, and table-row completeness targets. Independent lossless contact
sheets show all nine captures intact, and Tesseract finds all 10 key labels in every original PNG.
The reviewed raster SHA-256 values are pinned by the harness; a full replay must reproduce every
byte before it can replace this report. Full-run high-contrast captures use the `-desktop-full.png`
suffix, leaving the separately frozen M01a `hc-report.json` and its two generic HC PNGs untouched.

| Cell | Enabled Button | Critical status/banner | Validation error | Disabled label | Dismiss |
|---|---:|---:|---:|---:|---:|
| A light | 4.61:1 | 6.74:1 | 7.46:1 | 1.76:1 | 40×40 |
| A dark | 5.45:1 | 8.96:1 | 12.16:1 | 2.64:1 | 40×40 |
| A high contrast | 15.13:1 | 21:1 | 21:1 | 14.02:1 | 40×40 |
| B light | 4.65:1 | 6.79:1 | 7.52:1 | 1.88:1 | 40×40 |
| B dark | 6.51:1 | 8.98:1 | 12.13:1 | 2.59:1 | 40×40 |
| B high contrast | 15.13:1 | 21:1 | 21:1 | 14.02:1 | 40×40 |

Phone 375px, tablet 768px, and desktop 1280px captures have no horizontal document clipping. The
phone capture exercises private Tabs overflow while preserving table/form usability and DOM order.

## Readiness derivation

`packages/components-react/evidence/react-readiness.v1.json` contains exactly 14 ordered rows. Each
row carries passed, non-empty references for `versionedContract`, `targetImplementation`,
`packageExport`, `publicDeclaration`, `dependencyClosure`, and `frameworkScenario`. The package test
re-derives every `emissionEligible` value through the frozen `evaluateEmissionEligibility` predicate;
the JSON does not certify itself. Every framework-scenario reference names the executable `.tsx`
carrier and is checked against the corresponding scenario case.

## Compatibility risks retained for review

- Root Tabs callers that depended on the pre-sprint manual-arrow behavior now receive the locked
  automatic activation behavior. The four stale root expectations were updated with explicit Sprint
  182 rationale; production behavior was not weakened to satisfy them.
- Root compatibility modules import the package-owned source during repository development. Packed
  consumers import only package artifacts and do not reach root `src/` paths.
- Status behavior is now package-owned. The root registry and glyph modules are shims to that same
  implementation, avoiding two mutable registries.
- No `component-core` package was introduced: no new target-neutral behavior is genuinely shared by
  the two framework runtimes at this stage.
