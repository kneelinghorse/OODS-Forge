# Decision Memos

Individual decision memos for D1–D5 (and future Dn) live here. The active register is in [../decision-points.md](../decision-points.md).

## Naming convention
`D[N]-[short-slug].md` — e.g., `D1-object-catalog-schema.md`, `D2-multi-fidelity-render.md`.

## Memo template

```markdown
# D[N] — [Decision name]

**Status:** [Drafting / Open / Decided / Superseded]
**Date:** YYYY-MM-DD
**Authors:** [Derek / Derek + Birch / etc.]

## Context
Why this decision exists. What's at stake. What changes if we get it wrong.

## Options
Each option with concrete tradeoffs, not abstract pros/cons.

## Recommendation
The chosen option, with rationale tied to strategic-position.md.

## Implementation implications
What this decision unblocks; what missions it enables; what other
decisions it constrains.

## Open sub-questions
Things the memo deliberately doesn't resolve and why.

## References
Inputs gathered: research artifacts, repo files, external docs, prior decisions.
```

## Lifecycle
- **Drafting** — being authored; not yet a binding decision.
- **Open** — published for review; eligible for change.
- **Decided** — committed to; implementation work can proceed against it.
- **Superseded** — replaced by a later memo (cite the superseding doc).

## Pacing
A new memo is authored when its corresponding D-fork is about to block implementation. Memos cost ~1 session; rework from a wrong call costs 5–15. The math is settled.
