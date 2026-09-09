# Browser design loop

Run from the Forge build worktree. `pnpm design:loop serve` packs the five foundation packages once, installs isolated Vite consumers from those tarballs, and keeps both servers and Chromium running. Cold installation is paid once. The controller binds 127.0.0.1:4477; React and Vue use 4478 and 4479. `--port N` moves all three ports. `--state DIR` selects the pack/install receipt directory; the default is a repository-specific temporary directory. Consumers are separate temporary directories outside the workspace.

`pnpm design:loop status` reports ports, PID, consumer roots, package versions/hashes, isolation and startup timing. Stop with Ctrl-C in the serve terminal (or SIGTERM to the reported PID). Temporary directories are retained for inspection. To observe component or CSS package changes, rebuild and restart serve to repack; composer/emitter changes take effect on every render invocation without restarting.

Write an input JSON file, then run `pnpm design:loop render --input input.json`:

```json
{
  "compose": { "object": "Subscription", "context": "list" },
  "framework": "both",
  "widths": [390, 820, 1440],
  "output": "/tmp/subscription-list"
}
```

Compose accepts the public handler's preferences. Framework defaults to both, widths to 390/820/1440. The exact composed schema and generated artifact are retained. Standalone artifacts mount with the existing consumer harness's deterministic field model; optional `model` supplies field values in the same way. Standalone required action callbacks dispatch observable `oods-design-loop-action` events; they do not claim store behavior. Workflow artifacts carry their own App, store and sample data, with no consumer-authored components or action wiring.

To inspect a workflow screen, compose `context: "workflow"` and optionally provide `steps`: an ordered array of public browser interactions, each with `action` (`click`, `fill`, `select`, `check`), a Playwright `selector`, and `value` for fill/select. These steps are recorded in the receipt and operate only the generated browser app's memory. The Sprint 188 review screenshots were captured after its edit/cancel flow; these workflow receipts must be labeled separately from standalone contexts.

Each framework produces receipt.json, artifact.json, full-page PNGs and accessibility text at every width. Receipts include DOM-ordered Playwright accessibility snapshots, labeled input values, visible component text, document/viewport widths, every overflowing element box, wrapped text grouped by glyph line, console/page errors, source and artifact hashes, the installed package hashes and timings. The browser clock is fixed at 2026-09-08T12:00:00Z, en-US/UTC. Errors remain visible in receipts; a receipt alone is not a usability verdict.

`pnpm design:loop diff before/react/receipt.json after/react/receipt.json --output /tmp/diff` validates both receipts and writes diff.json plus diff.md. Source identity, accessibility, input values, layout, regions and errors are compared; timings, screenshot encoding and output locations are excluded. Unchanged renders should report zero differences.

Output is confined to the chosen receipt directory; unsafe artifact paths, saved-store and structured-data output paths are rejected. No saved schema is mutated. Browser consumers are serially rendered; a concurrent render receives a busy error. The loop is local tooling, not a deployed site or a replacement for the packed-consumer flow harness.
