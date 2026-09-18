import React from 'react';
import { Banner, Button, Checkbox, Input, Select, Stack } from '@oods/components-react';
import '@oods/component-styles/css';

export type GeneratedUIState = 'loading' | 'empty' | 'error' | 'success';

export interface GeneratedUIActions {
  handleSubmit: () => void;
}

export interface PageProps {
  actions: GeneratedUIActions;
  uiState: GeneratedUIState;
  /** Array of currently applied filter values:
  - field: string (matches a filter descriptor field)
  - operator: "eq" | "in" | "range" | "gt" | "lt" | "between"
  - value: unknown (the selected filter value or values)
 */
  activeFilters?: Record<string, unknown>[];
  /** The rule's tags: WCAG criteria, best-practice and the standards it maps to. */
  criteria?: string[];
  /** What the rule checks, in the engine's words. */
  description: string;
  /** Computed count of currently active filters. */
  filterCount: number;
  /** Array of available filter descriptors. Each entry defines a filterable dimension:
  - field: string (the schema field to filter on)
  - label: string (display label)
  - type: "select" | "multi-select" | "range" | "boolean" | "date-range"
  - options: array of { value, label } for select/multi-select types
 */
  filters?: Record<string, unknown>[];
  /** The page route and the rule, "<route>#<rule_id>": one rule failing on one page is one finding. */
  findingId: string;
  /** The engine's page for the rule. */
  helpUrl?: string;
  /** The engine's impact for the rule. Stage1 keeps an unknown bucket beside axe's four. */
  impact: 'critical' | 'serious' | 'moderate' | 'minor' | 'unknown';
  /** How many elements on the page fail the rule. */
  nodeCount: number;
  /** Current page number (1-based). */
  page: number;
  /** The page's full URL. */
  pageUrl: string;
  /** Number of items displayed per page. */
  pageSize: number;
  /** When they were obtained. */
  provenanceAt: string;
  /** Where in that record the values were read. */
  provenanceLocator?: string;
  /** How the values were obtained. */
  provenanceMethod: string;
  /** Which record there. */
  provenanceRecord: string;
  /** The system that produced the record. */
  provenanceSource: string;
  /** What the engine concluded: violation on every finding of this run, because Stage1 writes needs-review, passed and not-applicable only as page counts. */
  resultState: 'violation' | 'passed' | 'needs_review' | 'not_applicable' | 'not_measured';
  /** The page the finding is on, as a route. */
  route: string;
  /** The engine's rule id. */
  ruleId: string;
  /** Whether the search input is currently focused or has a non-empty query. */
  searchActive?: boolean;
  /** The current search query string entered by the user. */
  searchQuery?: string;
  /** The failing elements, as the engine's selectors. */
  selectors: string[];
  /** The rule's one-line statement of what must hold (axe `help`), which names the finding. */
  title: string;
  /** Total number of items across all pages. Used to compute total page count. */
  totalItems?: number;
  /** Computed total number of pages (ceil(totalItems / pageSize)). */
  totalPages?: number;
}

type BannerProps = React.ComponentPropsWithoutRef<typeof Banner>;
type ButtonProps = React.ComponentPropsWithoutRef<typeof Button>;
type CheckboxProps = React.ComponentPropsWithoutRef<typeof Checkbox>;
type InputProps = React.ComponentPropsWithoutRef<typeof Input>;
type SelectProps = React.ComponentPropsWithoutRef<typeof Select>;
type StackProps = React.ComponentPropsWithoutRef<typeof Stack>;

export const GeneratedUI: React.FC<PageProps> = ({ actions, uiState, activeFilters, criteria, description, filterCount, filters, findingId, helpUrl, impact, nodeCount, page, pageSize, pageUrl, provenanceAt, provenanceLocator, provenanceMethod, provenanceRecord, provenanceSource, resultState, route, ruleId, searchActive, searchQuery, selectors, title, totalItems, totalPages }) => {
  if (!actions || !Object.prototype.hasOwnProperty.call(actions, 'handleSubmit') || typeof actions.handleSubmit !== 'function') { throw new Error('GeneratedUI requires actions.handleSubmit.'); }

  const [handleChange_descriptionState, setHandleChange_descriptionState] = React.useState<string>(String(description ?? ''));
  /* @oods-local-binding handleChange_description */ const handleChange_description = (event: React.ChangeEvent<HTMLInputElement>) => { setHandleChange_descriptionState(event.currentTarget.value); };
  const [handleChange_filterCountState, setHandleChange_filterCountState] = React.useState<string>(String(filterCount ?? ''));
  /* @oods-local-binding handleChange_filterCount */ const handleChange_filterCount = (event: React.ChangeEvent<HTMLInputElement>) => { setHandleChange_filterCountState(event.currentTarget.value); };
  const [handleChange_pageState, setHandleChange_pageState] = React.useState<string>(String(page ?? ''));
  /* @oods-local-binding handleChange_page */ const handleChange_page = (event: React.ChangeEvent<HTMLInputElement>) => { setHandleChange_pageState(event.currentTarget.value); };
  const [handleChange_pageSizeState, setHandleChange_pageSizeState] = React.useState<string>(String(pageSize ?? ''));
  /* @oods-local-binding handleChange_pageSize */ const handleChange_pageSize = (event: React.ChangeEvent<HTMLInputElement>) => { setHandleChange_pageSizeState(event.currentTarget.value); };
  const [handleChange_provenance_atState, setHandleChange_provenance_atState] = React.useState<string>(String(provenanceAt ?? ''));
  /* @oods-local-binding handleChange_provenance_at */ const handleChange_provenance_at = (event: React.ChangeEvent<HTMLInputElement>) => { setHandleChange_provenance_atState(event.currentTarget.value); };
  const [handleChange_provenance_locatorState, setHandleChange_provenance_locatorState] = React.useState<string>(String(provenanceLocator ?? ''));
  /* @oods-local-binding handleChange_provenance_locator */ const handleChange_provenance_locator = (event: React.ChangeEvent<HTMLInputElement>) => { setHandleChange_provenance_locatorState(event.currentTarget.value); };
  const [handleChange_provenance_recordState, setHandleChange_provenance_recordState] = React.useState<string>(String(provenanceRecord ?? ''));
  /* @oods-local-binding handleChange_provenance_record */ const handleChange_provenance_record = (event: React.ChangeEvent<HTMLInputElement>) => { setHandleChange_provenance_recordState(event.currentTarget.value); };
  const [handleChange_provenance_sourceState, setHandleChange_provenance_sourceState] = React.useState<string>(String(provenanceSource ?? ''));
  /* @oods-local-binding handleChange_provenance_source */ const handleChange_provenance_source = (event: React.ChangeEvent<HTMLInputElement>) => { setHandleChange_provenance_sourceState(event.currentTarget.value); };
  const [handleChange_result_stateState, setHandleChange_result_stateState] = React.useState<string>(String(resultState ?? ''));
  /* @oods-local-binding handleChange_result_state */ const handleChange_result_state = (event: React.ChangeEvent<HTMLSelectElement>) => { setHandleChange_result_stateState(event.currentTarget.value); };
  const [handleChange_searchActiveState, setHandleChange_searchActiveState] = React.useState<boolean>(searchActive ?? false);
  /* @oods-local-binding handleChange_searchActive */ const handleChange_searchActive = (event: React.ChangeEvent<HTMLInputElement>) => { setHandleChange_searchActiveState(event.currentTarget.checked); };
  const [handleChange_searchQueryState, setHandleChange_searchQueryState] = React.useState<string>(String(searchQuery ?? ''));
  /* @oods-local-binding handleChange_searchQuery */ const handleChange_searchQuery = (event: React.ChangeEvent<HTMLInputElement>) => { setHandleChange_searchQueryState(event.currentTarget.value); };
  /* @oods-domain-binding handleSubmit */ const handleSubmit = () => { actions.handleSubmit(); };

  return (
    <>
      <Stack id="form-screen" data-oods-component="Stack">
            {uiState === 'loading' && (
              <Banner id="form-loading" data-oods-component="Banner" data-oods-state="loading" content="Loading your records." title="Loading" />
            )}
            {uiState === 'empty' && (
              <Banner id="form-empty" data-oods-component="Banner" data-oods-state="empty" content="Change the filters or add a record." title="No records found" />
            )}
            {uiState === 'error' && (
              <Banner id="form-error" data-oods-component="Banner" data-oods-state="error" content="Try again or choose another record." title="Unable to load records" />
            )}
            {uiState === 'success' && (
              <Stack id="form-screen-form-11" data-oods-component="Stack" data-oods-state="success" data-layout="stack" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ref-space-cluster-default)', padding: 'var(--ref-space-inset-default)' }}>
                      <Input id="form-form-title-1" data-oods-component="Input" help="What the rule checks, in the engine's words." label="Description" placeholder="What the rule checks, in the engine's words." required value={handleChange_descriptionState} onChange={handleChange_description} />
                      <Stack id="form-form-fields-8" data-oods-component="Stack" data-layout="stack" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ref-space-cluster-default)' }}>
                                <Stack id="form-form-field-group-2" data-oods-component="Stack" data-layout="stack" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ref-space-cluster-tight)' }}>
                                            <Input id="form-slot-field-0-3" data-oods-component="Input" help="The current search query string entered by the user." label="Search Query" placeholder="The current search query string entered by the user." value={handleChange_searchQueryState} onChange={handleChange_searchQuery} />
                                          </Stack>
                                <Stack id="form-form-field-group-4" data-oods-component="Stack" data-layout="stack" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ref-space-cluster-tight)' }}>
                                            <Checkbox id="form-slot-field-1-5" data-oods-component="Checkbox" help="Whether the search input is currently focused or has a non-empty query." label="Search Active" checked={handleChange_searchActiveState} onChange={handleChange_searchActive} />
                                          </Stack>
                                <Stack id="form-form-field-group-6" data-oods-component="Stack" data-layout="stack" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ref-space-cluster-tight)' }}>
                                            <Input id="form-slot-field-2-7" data-oods-component="Input" help="Computed count of currently active filters." label="Filter Count" placeholder="Enter filterCount" required type="number" value={handleChange_filterCountState} onChange={handleChange_filterCount} />
                                          </Stack>
                                <Stack id="form-form-field-group-12" data-oods-component="Stack" data-layout="stack" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ref-space-cluster-tight)' }}>
                                            <Select id="form-slot-field-3-13" data-oods-component="Select" help="What the engine concluded: violation on every finding of this run, because Stage1 writes needs-review, passed and not-applicable only as page counts." label="Result state" options={[{"value":"violation","label":"violation"},{"value":"passed","label":"passed"},{"value":"needs_review","label":"needs_review"},{"value":"not_applicable","label":"not_applicable"},{"value":"not_measured","label":"not_measured"}]} placeholder="Enter result state" required value={handleChange_result_stateState} onChange={handleChange_result_state} />
                                          </Stack>
                                <Stack id="form-form-field-group-14" data-oods-component="Stack" data-layout="stack" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ref-space-cluster-tight)' }}>
                                            <Input id="form-slot-field-4-15" data-oods-component="Input" help="When they were obtained." label="Obtained" placeholder="When they were obtained." required type="datetime-local" value={handleChange_provenance_atState} onChange={handleChange_provenance_at} />
                                          </Stack>
                                <Stack id="form-form-field-group-16" data-oods-component="Stack" data-layout="stack" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ref-space-cluster-tight)' }}>
                                            <Input id="form-slot-field-5-17" data-oods-component="Input" help="Current page number (1-based)." label="Page" placeholder="Enter page" required type="number" value={handleChange_pageState} onChange={handleChange_page} />
                                          </Stack>
                                <Stack id="form-form-field-group-18" data-oods-component="Stack" data-layout="stack" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ref-space-cluster-tight)' }}>
                                            <Input id="form-slot-field-6-19" data-oods-component="Input" help="Number of items displayed per page." label="Page Size" placeholder="Enter pageSize" required type="number" value={handleChange_pageSizeState} onChange={handleChange_pageSize} />
                                          </Stack>
                                <Stack id="form-form-field-group-20" data-oods-component="Stack" data-layout="stack" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ref-space-cluster-tight)' }}>
                                            <Input id="form-slot-field-7-21" data-oods-component="Input" help="The system that produced the record." label="Source" placeholder="Enter provenance source" required value={handleChange_provenance_sourceState} onChange={handleChange_provenance_source} />
                                          </Stack>
                                <Stack id="form-form-field-group-22" data-oods-component="Stack" data-layout="stack" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ref-space-cluster-tight)' }}>
                                            <Input id="form-slot-field-8-23" data-oods-component="Input" help="Which record there." label="Record" placeholder="Enter provenance record" required value={handleChange_provenance_recordState} onChange={handleChange_provenance_record} />
                                          </Stack>
                                <Stack id="form-form-field-group-24" data-oods-component="Stack" data-layout="stack" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ref-space-cluster-tight)' }}>
                                            <Input id="form-slot-field-9-25" data-oods-component="Input" help="Where in that record the values were read." label="Read from" placeholder="Enter provenance locator" value={handleChange_provenance_locatorState} onChange={handleChange_provenance_locator} />
                                          </Stack>
                              </Stack>
                      <Stack id="form-form-actions-9" data-oods-component="Stack" data-layout="inline" style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-end', padding: 'var(--ref-space-inset-default)' }}>
                                <Button id="form-form-submit-10" data-oods-component="Button" content="Save" type="submit" />
                              </Stack>
                    </Stack>
            )}
          </Stack>
    </>
  );
};
