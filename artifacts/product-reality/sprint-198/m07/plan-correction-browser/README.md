# Plan duplicate-editor correction

Source `d03d9374b0865e0dc4dc437265963e0f336e7f37`, pinned Linux Playwright/Chromium, `builderSelfCertified:false`.

The first closeout census exposed two Plan name controls. Its failed rows remain under `../runtime-before-plan-duplicate-fix/`. The form producer now retains the declared field editor when a field-bound title would duplicate it. The regression fails for Plan before the change; all 66 scoped form/application tests pass afterward, with no skips in the accepted run.

Both packed targets pass all eight gates: exact tarball installation, strict typecheck, production build, SSR, mount, hydration, shared CSS, and interaction evidence. Both execute all five declared flow obligations, including editing Plan name, Save, detail readback and timestamp-backed history. The report retains 32 UI-state observations and 24 screenshots at 390/820/1440. The mobile React form was visually inspected for the single Plan name field; no independent usability certification is claimed.

This is a focused corrective proof. The separate complete runtime census must pass from the same implementation head; no partial cell or earlier screenshot is substituted into that result.
