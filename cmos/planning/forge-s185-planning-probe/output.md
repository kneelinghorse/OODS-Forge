# Sprint 185 planning probe output — measured at 1118f436 (s184 tip) on 2026-09-05T21:03:34Z

## reachability-census.mjs
governed=22 reachable=5/16
cmos-activity-redesign               6 missing: (none)
subscription-detail-dark             9 missing: (none)
subscription-list-dark               8 missing: (none)
tier1-acceptance-sub-detail          4 missing: (none)
user-inline-showcase                 6 missing: (none)
cmos-messages-redesign               5 missing: DetailHeader
plan-form-dark                       6 missing: DetailHeader
pt-shop-parts-entry-router-v1        5 missing: DetailHeader
user-card-showcase                   6 missing: CardHeader
cmos-dashboard-redesign              7 missing: DetailHeader VizAreaPreview
the-academy-landing-v1               8 missing: ColorSwatch ColorizedBadge DetailHeader
test-tagged-schema                  10 missing: ClassificationPanel DetailHeader FilterPanel PriceSummary
user-detail-showcase                10 missing: AddressCollectionPanel MembershipPanel PreferencePanel TagManager
user-list-showcase                  12 missing: AddressSummaryBadge MessageStatusBadge PreferenceSummaryBadge RoleBadgeList TagPills
user-timeline-showcase              10 missing: AddressValidationTimeline AuditEvent MembershipAuditTimeline MessageEventTimeline PreferenceTimeline
user-form-showcase                  12 missing: AddressEditor PreferenceEditor RoleAssignmentForm StatusSelector TagInput TemplatePicker
--- blocker frequency ---
 6 DetailHeader
 1 VizAreaPreview
 1 ClassificationPanel
 1 FilterPanel
 1 PriceSummary
 1 ColorSwatch
 1 ColorizedBadge
 1 CardHeader
 1 AddressCollectionPanel
 1 MembershipPanel
 1 PreferencePanel
 1 TagManager
 1 AddressEditor
 1 PreferenceEditor
 1 RoleAssignmentForm
 1 StatusSelector
 1 TagInput
 1 TemplatePicker
 1 AddressSummaryBadge
 1 MessageStatusBadge
 1 PreferenceSummaryBadge
 1 RoleBadgeList
 1 TagPills
 1 AddressValidationTimeline
 1 AuditEvent
 1 MembershipAuditTimeline
 1 MessageEventTimeline
 1 PreferenceTimeline
after wave 1 (+DetailHeader,CardHeader,ColorSwatch,ColorizedBadge,VizAreaPreview): reachable=11/16

## generation-probe.mjs (code.generate at profile=build; full vs pruned of the five)
RESPONSE KEYS: status,framework,code,fileExtension,imports,warnings,validationReceipt,errors,meta
cmos-messages-redesign/react/full: status=error artifact=no {"OODS-N015":1}
cmos-messages-redesign/react/pruned: status=ok artifact=yes {}
cmos-messages-redesign/vue/full: status=error artifact=no {"OODS-N015":1}
cmos-messages-redesign/vue/pruned: status=ok artifact=yes {}
plan-form-dark/react/full: status=error artifact=no {"OODS-N015":1}
plan-form-dark/react/pruned: status=ok artifact=yes {}
plan-form-dark/vue/full: status=error artifact=no {"OODS-N015":1}
plan-form-dark/vue/pruned: status=ok artifact=yes {}
pt-shop-parts-entry-router-v1/react/full: status=error artifact=no {"OODS-N015":1}
pt-shop-parts-entry-router-v1/react/pruned: status=ok artifact=yes {}
pt-shop-parts-entry-router-v1/vue/full: status=error artifact=no {"OODS-N015":1}
pt-shop-parts-entry-router-v1/vue/pruned: status=ok artifact=yes {}
user-card-showcase/react/full: status=error artifact=no {"OODS-N015":1}
user-card-showcase/react/pruned: status=ok artifact=yes {}
user-card-showcase/vue/full: status=error artifact=no {"OODS-N015":1}
user-card-showcase/vue/pruned: status=ok artifact=yes {}
cmos-dashboard-redesign/react/full: status=error artifact=no {"OODS-N015":2}
cmos-dashboard-redesign/react/pruned: status=ok artifact=yes {}
cmos-dashboard-redesign/vue/full: status=error artifact=no {"OODS-N015":2}
cmos-dashboard-redesign/vue/pruned: status=ok artifact=yes {}
the-academy-landing-v1/react/full: status=error artifact=no {"OODS-N015":3}
the-academy-landing-v1/react/pruned: status=ok artifact=yes {}
the-academy-landing-v1/vue/full: status=error artifact=no {"OODS-N015":3}
the-academy-landing-v1/vue/pruned: status=ok artifact=yes {}
