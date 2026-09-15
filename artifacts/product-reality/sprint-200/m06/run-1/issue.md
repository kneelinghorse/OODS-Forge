### What did not read right

The README tells me twice that a `schemaRef` "lasts 30 minutes", and the first-run walkthrough hands the
ref from step 3 straight to steps 5 and 6. I read that as wall-clock time. It is not: the ref lives in the
server process that produced it, so as soon as the next tool call comes from a new assistant session (a new
adapter process), the ref is gone — mine died 68 seconds old with 29 minutes of its own stated expiry left.

The two sentences I read:

> a `schemaRef` such as `compose-dae744a8` (it lasts 30 minutes; `schema.save` keeps it longer)

> `schemaRef` TTL: refs returned by `design.compose`, `design.preview`, `pipeline`, and `schema.load` last
> 30 minutes. Persist them with `schema.save` when the workflow spans sessions or multiple review loops.

"spans sessions" is the only hint, it sits in a later section about long workflows, and it reads like
advice for multi-day work — not for the very next call in a ten-minute walkthrough.

### Which screen or document

`README.md` — "The first run, in ten minutes", steps 3, 5 and 6, and the "Working with the tools" bullet on
`schemaRef` TTL. The error surfaces from `code.generate` (and would from `repl` action `render` too).

### What you saw

Step 3, 23:46:15Z:

```
status: ok, layout: detail
schemaRef: compose-b8fc9aa5
Created: 2026-09-14T23:46:15.980Z
Expires: 2026-09-15T00:16:15.980Z (30-minute TTL)
```

Step 5, 23:47:23Z — 68 seconds later, from a fresh assistant session:

```
code.generate {"schemaRef":"compose-b8fc9aa5","framework":"react","profile":"build"}

Code: OODS-N003
Message: The schemaRef 'compose-b8fc9aa5' is missing and needs to be regenerated
validationReceipt.profile: build
validationReceipt.notChecked (18): schema-structure, component-registry, state-contract,
  target-readiness, normalization-fidelity, binding-contract, props-contract, slots-contract,
  events-contract, dependency-closure, fallback-policy, rendered-evidence, interaction-evidence,
  accessibility-evidence, theme-evidence, determinism-evidence, performance-evidence,
  certification-evidence
```

The message itself says "missing **or expired**" / "is missing and needs to be regenerated", which sent me
looking for an expiry that had not happened, instead of at the session boundary that had.

Re-running steps 3, 5 and 6 inside one session worked first time: `code.generate` returned
`src/GeneratedUI.tsx` + `src/charts/payment-001.svg`, `sha256:eb92ea79…`, five pinned dependencies and an
11-ran / 7-notChecked receipt, and `repl` render returned a 215,664-byte document. Nothing is broken —
only the sentence.

### What you expected instead

That the ref I was told lasts 30 minutes would still resolve a minute later, or that the README would say
where its lifetime actually ends. Two concrete fixes, either one would have saved me the detour:

1. In step 3, replace "(it lasts 30 minutes; `schema.save` keeps it longer)" with something like
   "(30 minutes, and only inside the client session that produced it — restart the client or start a new
   conversation and the ref is gone; `schema.save` outlives both)".
2. Make `OODS-N003` say which case it is: "unknown in this server process (a client restart or a new
   session drops in-memory refs)" rather than "missing or expired".

A third, smaller one: the walkthrough could carry `schema.save` into step 3 as the default rather than as
an aside, since steps 5 and 6 both depend on the ref surviving.

### Runtime version

runtime v0.1.0, adapter 0.3.0 (per `docs/runtime/install.md` §8). Archive
`forge-runtime.tar.gz` sha256 `eca3704c4d38cf3352bebc2b8a2fb1d7dc9c0f5aadaa970a77a1e100936d5adf`, manifest
commit `59269dd7f376058216f8c8077719d304de5f31c4`. `health` reports server version 0.1.0, 110 components,
46 traits, 18 objects, 24 tools (19 product-reality + 5 contract). macOS (darwin 25.3.0), Node v24.6.0,
Claude Code as the client via `claude mcp add forge`.
