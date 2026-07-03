# s137 Research — Contrast & Color-Distinguishability Rules for `artifact.certify`

**Date:** 2026-07-03
**For:** Sprint-137 (contrast-first), the `artifact.certify` "contrast pillar" — feeds the m01 keystone memo.
**Method:** deep-research harness (5 search angles → 23 sources fetched → 110 claims → 25 adversarially verified via 3-vote; 21 confirmed, 4 refuted). Run `wf_439d6b82-c19`.
**Bottom line:** the crux was right — **select the metric by palette ROLE.** A single WCAG 3:1 luminance rule applied everywhere would *wrongly fail* well-designed hue-differentiated categorical palettes (exactly Forge's ~1.17–2.01:1 adjacent pairs). Three roles, three metrics.

---

## The rule set (what the m01 memo should adopt)

### Role (C) — Mark vs. background — **WCAG-NORMATIVE**
- **Metric:** WCAG relative-luminance **contrast ratio** (reuse the existing `@oods/a11y-tools` `contrastRatio` impl).
- **Threshold:** **≥ 3:1** for a data mark **vs. its plot/panel background** — *only* for marks "required to understand the content."
- **Normative basis (SC 1.4.11):** "Parts of graphics required to understand the content … have a contrast ratio of at least 3:1 against adjacent color(s), except when a particular presentation of graphics is essential." The Understanding doc's line-graph example (Figure 38) says verbatim: *"The lines should have 3:1 contrast against their background, but as there is little overlap with other lines they do not need to contrast with each other."*
- **Scope gate:** "Not every graphical object needs to contrast … only those required for a user to understand." Aesthetic marks and marks whose info is **redundantly available** (embedded labels/values, or a following data table) are **out of scope**.
- **Normative caveat — touching/abutting marks:** the line exemption is conditional on **low overlap.** Marks that **share a boundary** — pie slices, stacked-bar segments, treemap tiles, choropleth regions, sankey nodes — DO fall under "adjacent color(s)" and normatively require **3:1 vs. neighbor OR a separating stroke/gap.** So role (C) has two sub-checks: mark-vs-background (all cartesian) and mark-vs-adjacent-mark (touching types only).

### Role (A) — Categorical / qualitative distinguishability — **BEST-PRACTICE (not WCAG)**
- **Metric:** **perceptual** color difference — **min pairwise CIEDE2000 (ΔE00)**. NOT luminance contrast.
- **Threshold (cols4all bins, most-cited):** **≥ 10 = PASS** (distinguishable even at large spatial separation), **2–10 = WARN**, **< 2 = FAIL**. τ=10 traces to Palettailor (IEEE VIS 2020), attributed to Brychtová & Çöltekin 2017.
- **CVD safety (deterministic simulate-then-measure):** fold color-vision-deficiency straight into the same gate — `d(i,j) = min(ΔE00, ΔE00_deutan, ΔE00_protan, ΔE00_tritan)`; palette passes iff `min over all pairs d(i,j) ≥ 10`. cols4all uses exactly this.
- **CVD simulation (closed-form, no ML — satisfies the determinism constraint):**
  - **Machado-Oliveira-Fernandes 2009** — one **3×3 matrix multiply** per color, indexed by (type, severity 0–100). Used by cols4all/colorspacious/Photoshop. **Recommended** for the single-matrix simplicity + precedent.
  - Brettel-Viénot-Mollon 1997 — piecewise-linear LMS projection onto a reduced-gamut plane (anchor wavelengths 575/475 nm protan/deutan, 660/485 nm tritan). Heavier; alternative.
- **Do NOT apply luminance 3:1 between categorical series.** Empirically, hue-based categorical palettes are the *best* multi-class encoding (91.4% mean-position accuracy vs. 81–87% for sequential/diverging — EuroVis 2024).

### Role (B) — Sequential / diverging (continuous) — **WCAG-EXEMPT + BEST-PRACTICE**
- **WCAG status:** **EXEMPT.** The Essential Exception names "color gradients that represent a measurement, such as heat maps." So do NOT pass/fail a ramp on inter-stop 3:1 luminance.
- **Positive metric (best-practice):** perceptual **uniformity** — equal Euclidean distance in **CIECAM02-UCS / CAM16-UCS** = equal perceived difference; check per-step ΔE is monotonic + roughly uniform. Use **lower** distinguishability thresholds than categorical — cols4all uses **1 and 5** (not 2 and 10) for ramps, since adjacent stops are intentionally close.
- **Still applies:** the extreme stops vs. background (role C) if needed to read the chart.
- **The real accessibility guarantee is an alt-format.** UK Gov Analysis Function: a single-hue sequential palette "makes it difficult to get a sufficient colour contrast ratio across all the colours … you must provide an alternative accessible format … a downloadable data table." (Forge already generates an accessible table + narrative — this is a natural tie-in.)

---

## Where a blanket 3:1 luminance rule is WRONG for charts
1. **Between adjacent categorical series** (non-touching) — WCAG's own line example exempts it; use CIEDE2000 ≥ 10 instead.
2. **Between sequential/diverging gradient stops** — WCAG-exempt as "essential"; use perceptual-uniformity, not contrast ratio.
3. **On aesthetic / redundantly-labeled marks** — out of SC 1.4.11 scope entirely.

## Precedent (mixed, and that's the point)
- **UK Gov Analysis Function** engineers its 6-color palette to hit 3:1 both vs. white AND between *order-adjacent* colors — belt-and-suspenders, **beyond strict WCAG** (treat adjacent-mark 3:1 as an optional "enhanced" check, not a required gate).
- **ONS** deliberately ships **three categorical colors below 3:1** to aid hue differentiation, and applies WCAG ratios only to **text labels.** → Direct precedent that blanket-failing sub-3:1 categorical fills is wrong.
- No established tool ships a "certify chart contrast" verdict — this is uncontested ground (consistent with the flagship moat thesis).

---

## WCAG-normative vs. best-practice (authority split)
| Check | Authority |
|---|---|
| Role (C) mark-vs-background 3:1 (marks needed to understand) | **WCAG 1.4.11 normative** |
| Role (C) touching-mark 3:1-or-stroke (pie/stacked/treemap/choropleth/sankey) | **WCAG 1.4.11 normative** (adjacency) |
| Gradient inter-stop contrast | **WCAG-exempt** (essential) |
| Role (A) CIEDE2000 ≥ 10 + CVD min | best-practice (Palettailor/cols4all; not CIE/ISO-ratified) |
| Role (B) CAM-UCS uniformity, 1/5 thresholds | best-practice (cols4all/cividis) |
| Adjacent categorical 3:1 (UK Gov AF) | best-practice-beyond-WCAG (do NOT adopt as a universal fail) |

---

## Explicitly REFUTED — do not reintroduce these
- ❌ "1.4.11 'adjacent' means background-only" (refuted 1-2) — adjacency resolves to *whatever is literally adjacent*; touching marks count.
- ❌ CIELAB JND numbers of **~5 (CIE76) / ~1 (CIEDE2000)** as categorical distinguishability thresholds (refuted 0-3) — use the cols4all **10** bin, not JND-1.
- ❌ "SC 1.4.1 Use-of-Color makes color-only series a hard failure requiring direct labels instead of any color metric" (refuted 0-3) — color IS a valid channel; distinguishability is the guarantee, redundant labeling is separate/complementary.

---

## Open decisions this hands to the m01 memo
1. **Role detection at emit time** — how does certify classify a mark's palette role (categorical vs. sequential vs. diverging) deterministically from the IR? (Likely from the color-channel encoding/scale spec + chart type — resolvable against the code.)
2. **CVD params to pin for reproducibility** — recommend **Machado-2009 @ severity 100**, deutan + protan (+ tritan?). Must pin type+severity or the verdict isn't deterministic.
3. **Background reference for role (C)** — themed (light/dark), transparent, or unknown-at-emit-time background: against what color is 3:1 computed, and check both themes? Plus how touching-mark types are detected so the adjacent-3:1-or-stroke check fires only there.
4. **Sequential alt-format** — does certify's contrast pillar treat a sequential/diverging scale as `contrast: 'exempt'`/pass-with-note under the essential-exception, or require the accessible data-table alt (which Forge already generates) as the guarantee? (Scope fork — Derek's call.)

---

## Sources (primary unless noted)
- W3C, *Understanding SC 1.4.11 Non-text Contrast* — https://www.w3.org/WAI/WCAG21/Understanding/non-text-contrast.html (normative)
- Palettailor (IEEE VIS 2020 / TVCG 2021) — https://ar5iv.labs.arxiv.org/html/2009.02969 (CIEDE2000 ≥ 10)
- cols4all (Tennekes, CRAN) — https://cols4all.github.io/cols4all-R/articles/01_paper.html (bins 2/10/15 categorical, 1/5 gradient; min-over-CVD)
- Perceptually-Optimized Color Selection — https://arxiv.org/pdf/2205.14472
- Mean-position judgment / palette-type efficacy (EuroVis 2024) — https://arxiv.org/pdf/2404.03787
- Machado, Oliveira, Fernandes 2009 (IEEE TVCG) CVD simulation — https://www.inf.ufrgs.br/~oliveira/pubs_files/CVD_Simulation/Machado_Oliveira_Fernandes_CVD_Vis2009_final.pdf
- Brettel, Viénot, Mollon 1997 (JOSA A) — http://vision.psychol.cam.ac.uk/jdmollon/papers/Dichromatsimulation.pdf
- cividis (PLOS ONE) CIECAM02-UCS uniformity — https://journals.plos.org/plosone/article?id=10.1371%2Fjournal.pone.0199239
- UK Gov Analysis Function, *Data visualisation: colours in charts* — https://analysisfunction.civilservice.gov.uk/policy-store/data-visualisation-colours-in-charts/
- ONS Service Manual, *Using colours in charts* — https://service-manual.ons.gov.uk/data-visualisation/colours/using-colours-in-charts
