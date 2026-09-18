import React from 'react';
import { Banner, Card, DetailHeader, Stack, StatusBadge, Tabs, Text } from '@oods/components-react';
import '@oods/component-styles/css';
import { formatReadOnlyValue } from '@oods/component-contracts';

export type GeneratedUIState = 'loading' | 'empty' | 'error' | 'success';

export interface GeneratedUIActions {
  handleEdit: () => void;
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
type CardProps = React.ComponentPropsWithoutRef<typeof Card>;
type DetailHeaderProps = React.ComponentPropsWithoutRef<typeof DetailHeader>;
type StackProps = React.ComponentPropsWithoutRef<typeof Stack>;
type StatusBadgeProps = React.ComponentPropsWithoutRef<typeof StatusBadge>;
type TabsProps = React.ComponentPropsWithoutRef<typeof Tabs>;
type TextProps = React.ComponentPropsWithoutRef<typeof Text>;

export const GeneratedUI: React.FC<PageProps> = ({ actions, uiState, activeFilters, criteria, description, filterCount, filters, findingId, helpUrl, impact, nodeCount, page, pageSize, pageUrl, provenanceAt, provenanceLocator, provenanceMethod, provenanceRecord, provenanceSource, resultState, route, ruleId, searchActive, searchQuery, selectors, title, totalItems, totalPages }) => {
  if (!actions || !Object.prototype.hasOwnProperty.call(actions, 'handleEdit') || typeof actions.handleEdit !== 'function') { throw new Error('GeneratedUI requires actions.handleEdit.'); }

  /* @oods-domain-binding handleEdit */ const handleEdit = () => { actions.handleEdit(); };

  return (
    <>
      <>
        <Stack id="detail-screen" data-oods-component="Stack">
              {uiState === 'loading' && (
                <Banner id="detail-loading" data-oods-component="Banner" data-oods-state="loading" content="Loading your records." title="Loading" />
              )}
              {uiState === 'empty' && (
                <Banner id="detail-empty" data-oods-component="Banner" data-oods-state="empty" content="Change the filters or add a record." title="No records found" />
              )}
              {uiState === 'error' && (
                <Banner id="detail-error" data-oods-component="Banner" data-oods-state="error" content="Try again or choose another record." title="Unable to load records" />
              )}
              {uiState === 'success' && (
                <Stack id="detail-screen-detail-13" data-oods-component="Stack" data-oods-state="success" data-layout="stack" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ref-space-cluster-default)' }}>
                        <DetailHeader id="detail-screen-detail-13-record-title" data-oods-component="DetailHeader" title={title} level={2} />
                        <Card id="detail-detail-body-10" data-oods-component="Card" data-layout="stack" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ref-space-cluster-default)' }}>
                                  <Tabs id="detail-detail-tabs-9" data-oods-component="Tabs" ariaLabel="Record details" items={[
                                    { ...{"id":"detail-detail-tab-panel-3","label":"Details"}, panel: (
                                      <Stack id="detail-detail-tab-panel-3" data-oods-component="Stack" data-layout="stack" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ref-space-cluster-default)' }}>
                                        <StatusBadge id="detail-slot-tab-0-4" data-oods-component="StatusBadge" domain="result" emphasis="subtle" showIcon={false} tone="neutral" status={resultState} />
                                        <Stack id="detail-slot-tab-1-6-read-field" data-oods-component="Stack">
                                            <Text id="detail-slot-tab-1-6-label" data-oods-component="Text" as="strong" content="Source" />
                                            <Text id="detail-slot-tab-1-6-value" data-oods-component="Text">{formatReadOnlyValue(provenanceSource, "string", false)}</Text>
                                          </Stack>
                                        <Stack id="detail-slot-tab-2-8-read-field" data-oods-component="Stack">
                                            <Text id="detail-slot-tab-2-8-label" data-oods-component="Text" as="strong" content="Obtained by" />
                                            <Text id="detail-slot-tab-2-8-value" data-oods-component="Text">{formatReadOnlyValue(provenanceMethod, "string", false)}</Text>
                                          </Stack>
                                        <Stack id="detail-slot-tab-3-15-read-field" data-oods-component="Stack">
                                            <Text id="detail-slot-tab-3-15-label" data-oods-component="Text" as="strong" content="Read from" />
                                            <Text id="detail-slot-tab-3-15-value" data-oods-component="Text">{formatReadOnlyValue(provenanceLocator, "string", false)}</Text>
                                          </Stack>
                                        <Stack id="detail-slot-tab-4-17-read-field" data-oods-component="Stack">
                                            <Text id="detail-slot-tab-4-17-label" data-oods-component="Text" as="strong" content="Record" />
                                            <Text id="detail-slot-tab-4-17-value" data-oods-component="Text">{formatReadOnlyValue(provenanceRecord, "string", false)}</Text>
                                          </Stack>
                                        <Stack id="detail-detail-tabs-9-finding_id-read-field" data-oods-component="Stack">
                                            <Text id="detail-detail-tabs-9-finding_id-label" data-oods-component="Text" as="strong" content="Finding id" />
                                            <Text id="detail-detail-tabs-9-finding_id-value" data-oods-component="Text">{formatReadOnlyValue(findingId, "string", false)}</Text>
                                          </Stack>
                                        <Stack id="detail-detail-tabs-9-description-read-field" data-oods-component="Stack">
                                            <Text id="detail-detail-tabs-9-description-label" data-oods-component="Text" as="strong" content="Description" />
                                            <Text id="detail-detail-tabs-9-description-value" data-oods-component="Text">{formatReadOnlyValue(description, "string", false)}</Text>
                                          </Stack>
                                        <Stack id="detail-detail-tabs-9-impact-read-field" data-oods-component="Stack">
                                            <Text id="detail-detail-tabs-9-impact-label" data-oods-component="Text" as="strong" content="Impact" />
                                            <Text id="detail-detail-tabs-9-impact-value" data-oods-component="Text">{formatReadOnlyValue(impact, "string", true)}</Text>
                                          </Stack>
                                        <Stack id="detail-detail-tabs-9-rule_id-read-field" data-oods-component="Stack">
                                            <Text id="detail-detail-tabs-9-rule_id-label" data-oods-component="Text" as="strong" content="Rule id" />
                                            <Text id="detail-detail-tabs-9-rule_id-value" data-oods-component="Text">{formatReadOnlyValue(ruleId, "string", false)}</Text>
                                          </Stack>
                                        <Stack id="detail-detail-tabs-9-route-read-field" data-oods-component="Stack">
                                            <Text id="detail-detail-tabs-9-route-label" data-oods-component="Text" as="strong" content="Route" />
                                            <Text id="detail-detail-tabs-9-route-value" data-oods-component="Text">{formatReadOnlyValue(route, "string", false)}</Text>
                                          </Stack>
                                        <Stack id="detail-detail-tabs-9-page_url-read-field" data-oods-component="Stack">
                                            <Text id="detail-detail-tabs-9-page_url-label" data-oods-component="Text" as="strong" content="Page url" />
                                            <Text id="detail-detail-tabs-9-page_url-value" data-oods-component="Text">{formatReadOnlyValue(pageUrl, "string", false)}</Text>
                                          </Stack>
                                        <Stack id="detail-detail-tabs-9-node_count-read-field" data-oods-component="Stack">
                                            <Text id="detail-detail-tabs-9-node_count-label" data-oods-component="Text" as="strong" content="Node count" />
                                            <Text id="detail-detail-tabs-9-node_count-value" data-oods-component="Text">{formatReadOnlyValue(nodeCount, "integer", false)}</Text>
                                          </Stack>
                                        <Stack id="detail-detail-tabs-9-help_url-read-field" data-oods-component="Stack">
                                            <Text id="detail-detail-tabs-9-help_url-label" data-oods-component="Text" as="strong" content="Help url" />
                                            <Text id="detail-detail-tabs-9-help_url-value" data-oods-component="Text">{formatReadOnlyValue(helpUrl, "string", false)}</Text>
                                          </Stack>
                                      </Stack>
                                    ) }
                                  ]} />
                                </Card>
                      </Stack>
              )}
            </Stack>
        <div role="group" aria-label="Screen actions" data-oods-screen-actions="detail-screen">
          <button type="button" data-oods-action="handleEdit" onClick={() => handleEdit()}>Edit</button>
        </div>
      </>
    </>
  );
};
