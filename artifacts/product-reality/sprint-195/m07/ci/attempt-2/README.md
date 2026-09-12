# B2 natural CI attempt

Actual branch metadata head `39deb793a3161621b5a0893618f9d40201c22256`; actual PR merge checkout `4787733b6bfd48aedde0d5f850a0e9d87643356f`. The main workflow completed with two failed jobs (coverage and viz-determinism); all failed assertions are preserved in complete raw logs. Five required jobs succeeded and are retained as observed history; the final selection belongs to ci/observed.json after the corrected C2 run completes. The soak job was skipped. No failure was relabeled.

The runtime job passed 154 canonical cells, four dashboard cells, and 48 chart theme scopes from one packing operation and five hash-verified tarballs. Its actual runtime UUID and checkout head are retained. Only 32 native JSON files from the SHA-bound archive are committed; PNG/tarball/source binary content remains in the external archive.
