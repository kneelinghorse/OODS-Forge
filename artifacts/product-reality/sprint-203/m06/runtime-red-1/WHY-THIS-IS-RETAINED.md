# The first runtime sweep, retained red

310 cells, 306 pass, **4 fail**. Kept beside the green sweep rather than overwritten, the way Sprint 202
kept its own red capture: a receipt that went red is evidence, and replacing it hides what the gate
caught.

Two of the four were real, and this sweep is the only gate in the repository that catches them:

| Cell | Gate | What it was |
| --- | --- | --- |
| `Sprint/detail/react` | `strict-typecheck` | `TS2322` on a `Stack` carrying `patternComponent` and `fields` |
| `Sprint/workflow/react` | `strict-typecheck`, then every gate after it | the same artifact |

Sprint 203 m02 made `Sprint` the first object in the registry with both a `start_date` and an
`end_date`, so it composes a `DateRange` pattern group, and m02 widened the Stack target contract to
admit it. That widened **what is allowed** without widening **what is lowered**:
`composition-directives.ts` stripped the group's directives only for `StatusTimeline`, so a `DateRange`
group kept them and the generated React artifact emitted `<Stack patternComponent="DateRange"
fields={[…]}>` — props no `Stack` accepts.

`code.generate` accepted it, the target contracts accepted it, and the component suites, the server
suite, the m04 craft matrix and the running-app previews all passed, because **none of them strict-
typechecks a generated artifact against the built packages**. This sweep does. m06 strips the
directives for every pattern group, leaving the Stack the layout container the contract's own
compatibility note already describes.

The other two were environmental, not product:

| Cell | Gate | What it was |
| --- | --- | --- |
| `Decision/card/react` | `fresh-exact-tarball-install` | `spawnSync npm ETIMEDOUT` |
| `Report/list/react` | `fresh-exact-tarball-install` | `ERESOLVE` against `react@undefined`, a half-populated `node_modules` |

`Report` is a pre-existing research object untouched by this sprint, which is what marks these as
install flakes rather than defects.
