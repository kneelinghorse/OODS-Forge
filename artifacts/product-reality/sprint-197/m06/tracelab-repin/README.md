# Prepared TraceLab re-pin — apply in TraceLab after review

These are the built `@oods/tokens` and `@oods/tw-variants` tarballs from Forge
commit `0d5fe1fc8004a260496b416c83c77b1aec4dc84f`. The token archive is new;
the variants archive is byte-identical to TraceLab's current pin. Package names
and versions remain `0.1.0`. SHA-256, sizes and the successful scratch clean
install are in `oods-provenance.json`.

Forge has not applied this to TraceLab. The source checkout's two pre-existing
CMOS report edits are preserved; the before/after boundary receipt records the
actual status rather than describing that checkout as clean.

From TraceLab's `frontend` directory, after the palette review, run:

```sh
repin="/Users/systemsystems/.codex/worktrees/s197/OODS-Forge/artifacts/product-reality/sprint-197/m06/tracelab-repin"
node "$repin/prepare-consumer-repin.mjs" .
npm install --package-lock-only --ignore-scripts --no-audit --no-fund
npm ci --ignore-scripts --no-audit --no-fund
npm run check:tokens
node -e 'require("node:fs").rmSync(".next", { recursive: true, force: true })'
node -e 'const fs=require("node:fs"), crypto=require("node:crypto"), p=require("./vendor/oods-provenance.json"); const b=fs.readFileSync("node_modules/@oods/tokens/dist/css/tokens.css"); if(crypto.createHash("sha256").update(b).digest("hex")!==p.clean_install_smoke.installed_css_sha256) throw Error("Installed CSS differs from the reviewed package")'
git diff -- package-lock.json vendor
```

The preparation script verifies both archive hashes before copying, preserves
all dependency declarations and removes only the two local package lock entries.
This forces npm to measure the new same-version tarball integrities; simply
replacing the archive and running a normal lock refresh retained the old token
bytes in the first scratch attempt. A scratch Next compiler cache also reused
the old CSS because both tarballs retain normalized mtimes and version 0.1.0;
the command above clears that local generated cache before the next build.
The failed receipt is retained in `initial/`.
The npm refresh also records six bundled optional WASM metadata entries; no
existing unrelated package version or integrity moved. `lock-delta.json` records
those exact additions and the two changed OODS entries.
The successful scratch lockfile is `package-lock.prepared.json`; it is a review
reference, not a replacement for a newer consumer lockfile.

The clean install used an empty `node_modules` directory and passed
`check-token-colors`. Installed CSS was byte-checked and exposes Brand A
light/dark/hc. To recover local disk space after that proof, 53 large dependency
files were replaced with APFS copy-on-write clones of byte-identical installed
files, with each before/after SHA verified in `scratch-clones.json`. Visual
workers materialized the exact old or new two tarballs in scratch and retained
the same other dependencies, frontend source, seed data and clock.
