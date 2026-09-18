# The first closeout capture — red, retained, never a receipt

Head `4ff1e6f92`, the canonical runner (`capture-s185-m01-baseline.mjs --sprint sprint-205 --mission s205-m06
--label closeout --runs 1`), tripwire first. Three suites green; **mcp-server and root-core each failed ONE assertion
in ONE file**, the same one (root-core runs the mcp-server product-reality directory too):

    runtime-cells.s193.spec.ts > requires all 206 distinct object/context/framework identities
    expected ... to have a length of 266 but got 302

A count pin this mission should have moved with the others: the roster's NON-workflow cells, 266 → 302 with the
three capture objects (36 cells). The m06 count sweep searched for 310 and 44 and missed this spec, which counts
only the non-workflow rows. Moved with its reason; the capture re-runs in full at the next head.

| suite | passed | failed | skipped | failed files |
| --- | ---: | ---: | ---: | ---: |
| viz-core | 1,546 | 0 | 0 | 0 |
| viz-render | 72 | 0 | 0 | 0 |
| mcp-server | 7,393 | 1 | 0 | 1 |
| root-core | 7,777 | 1 | 0 | 1 |
| component-packages | 1,485 | 0 | 0 | 0 |

Skipped is 0 in every suite, as m01's action-mappings retirement intended.
