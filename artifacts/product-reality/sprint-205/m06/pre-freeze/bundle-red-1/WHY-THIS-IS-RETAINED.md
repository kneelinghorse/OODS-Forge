# The first frozen-bundle attempt — red at assembly, retained

Head `ebb92a90f`. Server and bridge built; `assemble.mjs --final` refused: `objects tracked boundary count must be 23` — 26. The
assembler pins the tracked-file counts of `objects`, `schemas` and `traits`, which this sprint moved (three capture
objects, the two traits' definitions and parameter schemas), and nothing checked those pins before part B. Moved to
27 / 60 / 81 (the capture domain's README added, as Sprint 203 did for each new domain), and the tripwire's
`e2e-expectations-check` now compares them with `git ls-files` so the mission that adds files sees it that day.
