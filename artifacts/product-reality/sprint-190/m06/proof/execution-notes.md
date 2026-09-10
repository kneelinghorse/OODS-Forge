# Frozen implementation proof

Implementation: `82a6b45a74dd3b3567f89e50f68672488dd7aea3`.

All matrix, census, saved-store, app-consumer and design-loop observations in this directory and the adjacent `matrix/` and `after/` directories were executed at this implementation HEAD. Builds and fresh tarball packing were completed before dependent observations. Matrix capture first verified all 15 m03 attributed golden hashes. The later preservation check again found all 15 unchanged and the flat export and token CSS unchanged; `preservation.json` is the byte-identical result of rerunning the retained m05 checker, whose embedded historical attribution remains unchanged.

The first prose check overlapped design-loop startup's package packing and failed one test with ENOENT for the temporarily removed token CSS output (not a product assertion). `prose.log` retains that attempt. After packing finished, the same prose selection passed 63/63 in `prose-after-pack.log`. No source edit was made for that rerun.

Initial PR CI exposed a malformed test-only NormalizedVizSpec fixture in the package-specific viz-core typecheck. The root typecheck does not include this colocated test. The correction adds the required empty data/encoding and accessibility fields; it changes no public runtime code, golden, registry or rendered output. The original CI and local typecheck failures are retained, alongside the passing package typecheck and seven passing scoped-token tests. The clean commit retaining this correction and these fresh proofs becomes the four-suite execution head; public-runtime equivalence to the implementation head must be independently verified.

The fresh s188 flow harness used the existing Playwright Linux browser server because native macOS select behavior differs; it passed 16 gates, 18 flows, 32 state observations and 36 screenshots. The design-loop AFTER observations use the local browser and freshly packed outside-workspace React/Vue consumers. All 12 chart views at 390/820/1440 across light/dark have no overflow or browser errors and zero framework parity differences. Visual inspection of the dark mobile Vue and light desktop React captures confirms the payment figure above Status Timeline. Dark scope applies to chart pixels; the surrounding unchanged app shell remains light.

The owned design-loop PID 72592 and Docker browser server were stopped after capture. The primary served bridge was not rebuilt or restarted during this proof. The Sprint 191 reconnect remains prepared and unsent.

No local four-suite capture had run when this record was committed.
