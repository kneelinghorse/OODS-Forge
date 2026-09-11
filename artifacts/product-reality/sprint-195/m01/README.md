# s195-m01 — Certified delivery, exact reconnect, retirement gate

The primary checkout now serves certified Sprint 194 closure
`5b25c3c9ec795315bf52a698d135c96bffd66393` (public implementation
`71538162e839aec60dda6267a83f506906c1792e`). PR #100 was still open and draft,
so the explicitly approved certified commit was delivered detached from the
prior `1f69c957f4435a0a2f18b168b684de050f7a5f22` checkout.

Frozen install, token build, package builds, bridge build, package build,
PM2 restart and PM2 save passed (`build-results.json`). `/health` identifies the
delivered commit and 19 tools. The served health tool reports 24 tool ledger
entries and runtime 154/154, zero gaps/failures, at public implementation
`71538162`. `bridge-proofs.ts` calls the actual bridge and verifies 109 complete
React/Vue catalog rows with zero unverified cells, the A/dark line SVG against
Sprint 194's retained observations, and the Subscription/workflow React dark shell.
Operands and responses are retained beside `behavior-summary.json`.

All 17 primary store files and the existing sprint-190 delivery folder remained
byte-identical. The manifest hash before and after is
`993644cc01a5f150ea42d2882a953577a0066a6cecb3f74032e1877d6e4e620d`.
`before.json`, `after-restart.json`, `final.json` and `verification.json` retain
those observations. `backup.json` identifies the private rollback backup outside
Git; `rollback.sh --check` verified all 865 prior compiled-file hashes. Rollback
was not executed. No environment values are retained in Git.

Exactly the three frozen requests from sprint-194/m07/reconnect-plan.json were
sent. Their request hashes were independently recomputed and server readback
matched body, summary and type (`send-01.json` through `send-03.json`,
`send-readback.json`). Message ids:

- cmos-dashboard: `4cfa464d-cd49-4309-94c7-983c19de3e8f`
- forge-demos: `5d7ea13d-989d-4da5-86fc-331c0a935c75`
- aquex-mcp: `ada20203-9432-4fce-a802-6feaf79cf55d`

The byte-identical notice requirement preserves its prepare-time statement that
primary serves 1f69c957 and review is pending. That historical statement is stale
at send time; the delivery observations above are current. CMOS learning #582
records the temporal wording defect for future notice preparation. No additional
message was sent.

The gate scans every retired name across the repository in dot, underscore and
camel spellings, including contextual references to the single-word retired tool.
Its scratch mutation failed exactly the repo-wide assertion (9 passed/1 failed),
then all 10 gate tests passed after removal. The three affected smoke scripts
passed 19, 17 and 3 tests; focused addon, policy and narrative tests passed 16/16,
and server typecheck passed. No tests were skipped. Exact commands, logs, archived
historical source and the mutation receipt are in `gate/verification.json`.
This mission is committed as a bisection boundary before visualization behavior
changes so delivery and retirement defects remain separable from those movers. No five-suite capture belongs
to this mission. Builder certification remains false; independent sprint review
is separate. Build session: PS-2026-09-11-008.
