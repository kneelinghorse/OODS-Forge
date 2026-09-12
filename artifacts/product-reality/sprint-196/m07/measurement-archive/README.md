# Measurement archive at implementation A

Assembled and verified at clean `794084bf34dabab4d8218ccb2a32e2ec81f10d51` before any measurement receipts or canonical ledger updates entered the checkout. Original detached manifest, checksum, SBOM, embedded manifest and readiness attestation are retained byte for byte. The detached manifest adds archive size and SHA; the embedded manifest describes the payload.

Archive binary: `/tmp/forge-s196-m07-A-794084bf-out/forge-runtime.tar.gz`. Extracted runtime: `/tmp/forge-s196-m07-A-794084bf-extract`. Archive SHA256 `4dba1e35f383e0463822f35def30f090a9cc9c800aa080196882fa4903b96885`; 32,480,913 bytes. These temporary paths are local retention, not a claim that the binary is committed.

The host154 and extracted release42 measurements passed at unchanged A; their full receipts are retained in `../runtime/` and `../release-runtime/`. Final carry archive and E2E require the later clean proof commit B. Durable archive storage and same-byte verification are recorded in `archive-verification.json`.
