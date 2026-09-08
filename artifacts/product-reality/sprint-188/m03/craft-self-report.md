# Observed craft defects — not a quality certification

The final proof is `final-verified/`. All 24 screenshots have measured viewport
and document widths; none showed document-wide horizontal overflow. That metric
does not rule out internal clipping, awkward wrapping or weak composition.

## Fixed during this mission

- The 390px list hid badge text through an overly broad descendant selector.
  The rule now targets only the row arrow, and narrow rows put their readable
  status badge beneath the name. The long pending-cancellation label no longer
  squeezes the record name into a few characters per line.
- The inherited list toolbar squeezed the price into vertical digits and its
  search field into a few characters. The application allows inline groups to
  wrap and gives search/select controls room; currency remains on one line.
- The composed form's visible Save button had no form owner. A generated form
  boundary now handles its native submission. The browser proof clicks **Save**,
  not the generic screen-action Submit button.
- The required last_event sample was empty. Workflow metadata now carries the
  Timestampable event parameter, and the sample generator uses declared events.
  Cancellation also respects the trait's optional-reason setting.
- The application kept saying Unsaved changes after a successful write. Successful
  save/cancel now reports Changes saved in this session, asserted by the browser.
- Native textareas now receive the application input border/font treatment.

## Remaining named carries for review and subsequent composition work

These are present in the preserved public source screens. They are not hidden
by the generated app or treated as proof of mature component craft.

1. **List template/data duplication:** the source list retains its own Search,
   cancellation-period filter and generic Filter/Open row/Sort group in addition
   to the app's working search/status/sort controls. The source PaginationBar
   says No items while the app's populated collection and correct count appear
   below. The source control group is not wired to the app's collection query.
2. **Timeline scaffold:** five empty Card shells and an unlabeled minor-unit
   number remain above the app's real lifecycle history. The final screenshots
   show the active → pending cancellation event and reason below those shells.
3. **Detail repetition and wrapping:** the source tree repeats status/timeline
   sections; its Audit Timeline can say No events despite the lifecycle history
   shown elsewhere. The 820px detail tabs wrap short labels into fragments.
   Summary boxes, tab spacing and heading hierarchy remain inconsistent.
4. **Form duplication and spacing:** Cancellation Form overlaps the individual
   cancellation controls. The reason-code slot is a textarea; descriptions are
   long and dense, with inconsistent label weight, checkbox placement and gaps.
   Save and generic Change/Submit controls coexist.
5. **Timestamp presentation:** timestamps appear as raw ISO strings in timelines.
   The cancellation-request DatePicker appears blank for its ISO datetime seed;
   the draft model still contains the value. Some sample cancellation metadata
   is populated even for an uncancelled lifecycle state.
6. **Literal/template copy:** Archive Summary exposes a literal false flag; some
   timestamps render field-description copy rather than a concise time label.
   The empty-state text suggests adding a record although this app has no create
   action. Empty/detail headings use the fallback sample title.

Visual inspection sampled both frameworks across the four contexts and narrow,
medium and wide widths, including the final 390px React list and 820px Vue
cancelled-record timeline. This is an honest builder report, not a complete
accessibility or responsive certification. The independent reviewer must inspect
the entire screenshot set and decide usability. The eight new billing/archive
rows are still m04/m05 work at this boundary.
