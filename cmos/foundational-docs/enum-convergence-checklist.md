# Canonical Enum Convergence Checklist

Use this whenever you ADD, REMOVE, or RENAME a member of a canonical enum — an object
field `validation.enum`, the billing/subscription state sets, a viz trait parameter
enum, or a closed TS union. It exists because s126 converged `Subscription.status` but
left the retired `delinquent` on the SIBLING `Organization.billing_status`, and that hid
from a subscription-scoped grep. See `quality-bars.md` → "Canonical enum convergence: the
4-layer hidden-source-of-truth sweep".

## 0. Identify the authoritative source
- [ ] Name the ONE authoritative declaration of the set (a `traits/viz/*.trait.ts`
      parameter enum, a `src/domain/billing/states.ts` const, or an inline object-YAML
      `validation.enum`). Converge it first, order-exact.

## 1. Repo-wide grep — including sibling objects
- [ ] `grep -rni "<old-value>" .` excluding `node_modules`/`.git`/`dist`. Do NOT scope the
      grep to the mission-anchored file or object.
- [ ] Explicitly check the related enums of SIBLING objects (account-level
      `Organization.billing_status` is a separate vocabulary from `Subscription.status`).
- [ ] Classify EVERY hit into one of the four layers below. Leave none unclassified.

## 2. The four layers — fix every copy that HAS the bug
- [ ] **Authoritative model** — the trait enum / const / object-YAML enum is converged,
      order-exact.
- [ ] **JSON-schema mirror (where one exists)** — viz traits: the
      `schemas/traits/<name>.parameters.schema.json` mirror is byte-identical, so
      `pnpm run lint:enum-convergence` is green. (Billing/status enums have no mirror —
      skip this layer for them.)
- [ ] **Exhaustive `Record<Enum,…>` shims** — every total map keyed on the union gains/loses
      the member. Verified by BOTH `pnpm typecheck` (root, `src/**`) AND the changed
      package's `tsc` build (`packages/**`). vitest does NOT prove these compile.
- [ ] **String-typed consumers + tolerance aliases** — literal-gated logic
      (`x === 'old'`), status/token maps, and DELIBERATELY-retained legacy aliases. For
      each, DECIDE: converge, or retain as a documented inbound-tolerance alias. Only a
      TEST catches these — do not rely on typecheck or schema.

## 3. Guard the convergence so it cannot silently re-diverge
- [ ] Viz traits: covered by `lint:enum-convergence` (wired into the CI lint job).
- [ ] Enums WITHOUT a schema mirror: add or extend an m01-style guard test that asserts
      the authoritative set order-exact AND that any related presentation source (token
      map, configs) matches and carries no retired value. Worked example:
      `tests/domain/billing/state-set-convergence.spec.ts`.
- [ ] If the object enum change is breaking, bump the object version (e.g. 1.0.0 → 2.0.0)
      and update the one cross-package pin it reds.

## 4. Closeout gates (all green before session.complete)
- [ ] `pnpm run lint:enum-convergence` exits 0 — closeout criterion (i).
- [ ] ROOT `pnpm typecheck` exits 0; the changed package's `tsc` build exits 0.
- [ ] The guard test(s) + `pnpm vitest run tests/contracts tests/viz` are green.
- [ ] A final repo-wide `grep -rni "<old-value>"` confirms the only residual hits are
      deliberate tolerance aliases + prose — no live authoritative / sibling / mirror /
      shim copy remains.
