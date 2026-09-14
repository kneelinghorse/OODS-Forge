import React from 'react';
import { Banner, Card, DetailHeader, Stack, Tabs, Text, VizLinePreview } from '@oods/components-react';
import '@oods/component-styles/css';
import { formatReadOnlyValue } from '@oods/component-contracts';

export type GeneratedUIState = 'loading' | 'empty' | 'error' | 'success';

export interface GeneratedUIActions {
  handleEdit: () => void;
  handleViewTimeline: () => void;
}

export interface PageProps {
  svg?: string;
  actions: GeneratedUIActions;
  uiState: GeneratedUIState;
  /** Detected anomalies with context for investigation. */
  anomalies?: unknown[];
  /** Actual quantity consumed in the active period. */
  consumedQuantity: number;
  /** Timestamp recording when the entity was first created. */
  createdAt: string;
  /** Quantity included in base plan before overages. */
  includedQuantity: number;
  /** Lifecycle event associated with the most recent timestamp mutation. */
  lastEvent: 'reading_captured' | 'anomaly_detected' | 'reset';
  /** Timestamp for the lifecycle event captured in last_event. */
  lastEventAt?: string;
  /** Timestamp of the most recent provider usage payload. */
  lastReportedAt: string;
  /** Provider specific meter identifier. */
  meterId: string;
  /** Friendly metered feature name shown in UI (ex: Analytics Seats). */
  meterName: string;
  /** Cost per additional unit expressed in minor currency units. */
  overageRateMinor?: number;
  /** Date the usage accumulation window ends. */
  periodEnd: string;
  /** Date the usage accumulation window began. */
  periodStart: string;
  /** Forecasted overage spend derived from consumption trends. */
  projectedOverageMinor?: number;
  /** Source provider for usage data. */
  provider: string;
  /** Strategy for unused units (inherits rolloverStrategy parameter). */
  rolloverStrategy?: string;
  /** Rolling usage measurements for charts or anomaly detection. */
  samples?: unknown[];
  /** Health of the usage feed (ok, delayed, investigating). */
  status?: 'ok' | 'delayed' | 'investigating';
  /** Subscription the usage belongs to. */
  subscriptionId: string;
  /** Percent delta compared to previous window. */
  trendPercent?: number;
  /** Label for display, defaults to the unit parameter. */
  unitLabel: string;
  /** Timestamp for the most recent modification, when available. */
  updatedAt?: string;
  /** Identifier for this usage record. */
  usageId: string;
  /** Currency impact of usage variance calculated with overage rate. */
  varianceMinor?: number;
}

type BannerProps = React.ComponentPropsWithoutRef<typeof Banner>;
type CardProps = React.ComponentPropsWithoutRef<typeof Card>;
type DetailHeaderProps = React.ComponentPropsWithoutRef<typeof DetailHeader>;
type StackProps = React.ComponentPropsWithoutRef<typeof Stack>;
type TabsProps = React.ComponentPropsWithoutRef<typeof Tabs>;
type TextProps = React.ComponentPropsWithoutRef<typeof Text>;
type VizLinePreviewProps = React.ComponentPropsWithoutRef<typeof VizLinePreview>;

export const GeneratedUI: React.FC<PageProps> = ({ actions, uiState, anomalies, consumedQuantity, createdAt, includedQuantity, lastEvent, lastEventAt, lastReportedAt, meterId, meterName, overageRateMinor, periodEnd, periodStart, projectedOverageMinor, provider, rolloverStrategy, samples, status, subscriptionId, trendPercent, unitLabel, updatedAt, usageId, varianceMinor, svg }) => {
  if (!actions || !Object.prototype.hasOwnProperty.call(actions, 'handleEdit') || typeof actions.handleEdit !== 'function') { throw new Error('GeneratedUI requires actions.handleEdit.'); }
  if (!actions || !Object.prototype.hasOwnProperty.call(actions, 'handleViewTimeline') || typeof actions.handleViewTimeline !== 'function') { throw new Error('GeneratedUI requires actions.handleViewTimeline.'); }

  /* @oods-domain-binding handleEdit */ const handleEdit = () => { actions.handleEdit(); };
  /* @oods-domain-binding handleViewTimeline */ const handleViewTimeline = () => { actions.handleViewTimeline(); };

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
                        <Stack id="detail-detail-header-1" data-oods-component="Stack" data-layout="stack" style={{ alignItems: 'space-between', display: 'flex', flexDirection: 'column', gap: 'var(--ref-space-stack-default)', padding: 'var(--ref-space-inset-default)' }}>
                                  <Stack id="detail-slot-header-2" data-oods-component="Stack" data-layout="stack" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ref-space-cluster-default)' }}>
                                              <DetailHeader id="detail-primary-header-21" data-oods-component="DetailHeader" title={usageId} level={2} />
                                              <VizLinePreview id="detail-ve-header-20" data-oods-component="VizLinePreview" svg={svg ?? "<svg xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" version=\"1.1\" class=\"marks\" width=\"370\" height=\"210\" viewBox=\"0 0 370 210\"><rect width=\"370\" height=\"210\" fill=\"#F9FAFC\"/><g fill=\"none\" stroke-miterlimit=\"10\" transform=\"translate(67,35)\"><g class=\"mark-group role-frame root\" role=\"graphics-object\" aria-roledescription=\"group mark container\"><g transform=\"translate(0,0)\"><path class=\"background\" aria-hidden=\"true\" d=\"M0,0h296v138h-296Z\"/><g><g class=\"mark-group role-axis\" aria-hidden=\"true\"><g transform=\"translate(0.5,0.5)\"><path class=\"background\" aria-hidden=\"true\" d=\"M0,0h0v0h0Z\" pointer-events=\"none\"/><g><g class=\"mark-rule role-axis-grid\" pointer-events=\"none\"><line transform=\"translate(0,138)\" x2=\"296\" y2=\"0\" stroke=\"#CED1D6\" stroke-width=\"1\" opacity=\"1\"/><line transform=\"translate(0,100)\" x2=\"296\" y2=\"0\" stroke=\"#CED1D6\" stroke-width=\"1\" opacity=\"1\"/><line transform=\"translate(0,61)\" x2=\"296\" y2=\"0\" stroke=\"#CED1D6\" stroke-width=\"1\" opacity=\"1\"/><line transform=\"translate(0,23)\" x2=\"296\" y2=\"0\" stroke=\"#CED1D6\" stroke-width=\"1\" opacity=\"1\"/></g></g><path class=\"foreground\" aria-hidden=\"true\" d=\"\" pointer-events=\"none\" display=\"none\"/></g></g><g class=\"mark-group role-axis\" role=\"graphics-symbol\" aria-roledescription=\"axis\" aria-label=\"X-axis titled 'Recorded at' for a utc scale with values from Sunday, 15 June 2025, 12:00:00 AM UTC to Wednesday, 25 June 2025, 12:00:00 AM UTC\"><g transform=\"translate(0.5,138.5)\"><path class=\"background\" aria-hidden=\"true\" d=\"M0,0h0v0h0Z\" pointer-events=\"none\"/><g><g class=\"mark-rule role-axis-tick\" pointer-events=\"none\"><line transform=\"translate(0,0)\" x2=\"0\" y2=\"5\" stroke=\"#BABEC4\" stroke-width=\"1\" opacity=\"1\"/><line transform=\"translate(30,0)\" x2=\"0\" y2=\"5\" stroke=\"#BABEC4\" stroke-width=\"1\" opacity=\"1\"/><line transform=\"translate(59,0)\" x2=\"0\" y2=\"5\" stroke=\"#BABEC4\" stroke-width=\"1\" opacity=\"1\"/><line transform=\"translate(89,0)\" x2=\"0\" y2=\"5\" stroke=\"#BABEC4\" stroke-width=\"1\" opacity=\"1\"/><line transform=\"translate(118,0)\" x2=\"0\" y2=\"5\" stroke=\"#BABEC4\" stroke-width=\"1\" opacity=\"1\"/><line transform=\"translate(148,0)\" x2=\"0\" y2=\"5\" stroke=\"#BABEC4\" stroke-width=\"1\" opacity=\"1\"/><line transform=\"translate(178,0)\" x2=\"0\" y2=\"5\" stroke=\"#BABEC4\" stroke-width=\"1\" opacity=\"1\"/><line transform=\"translate(207,0)\" x2=\"0\" y2=\"5\" stroke=\"#BABEC4\" stroke-width=\"1\" opacity=\"1\"/><line transform=\"translate(237,0)\" x2=\"0\" y2=\"5\" stroke=\"#BABEC4\" stroke-width=\"1\" opacity=\"1\"/><line transform=\"translate(266,0)\" x2=\"0\" y2=\"5\" stroke=\"#BABEC4\" stroke-width=\"1\" opacity=\"1\"/><line transform=\"translate(296,0)\" x2=\"0\" y2=\"5\" stroke=\"#BABEC4\" stroke-width=\"1\" opacity=\"1\"/></g><g class=\"mark-text role-axis-label\" pointer-events=\"none\"><text text-anchor=\"start\" transform=\"translate(0,15)\" font-family=\"'DM Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif\" font-size=\"10px\" fill=\"#484D58\" opacity=\"1\">Jun 15</text><text text-anchor=\"middle\" transform=\"translate(29.6,15)\" font-family=\"'DM Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif\" font-size=\"10px\" fill=\"#484D58\" opacity=\"0\">Mon 16</text><text text-anchor=\"middle\" transform=\"translate(59.2,15)\" font-family=\"'DM Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif\" font-size=\"10px\" fill=\"#484D58\" opacity=\"0\">Tue 17</text><text text-anchor=\"middle\" transform=\"translate(88.8,15)\" font-family=\"'DM Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif\" font-size=\"10px\" fill=\"#484D58\" opacity=\"0\">Wed 18</text><text text-anchor=\"middle\" transform=\"translate(118.4,15)\" font-family=\"'DM Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif\" font-size=\"10px\" fill=\"#484D58\" opacity=\"1\">Thu 19</text><text text-anchor=\"middle\" transform=\"translate(148,15)\" font-family=\"'DM Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif\" font-size=\"10px\" fill=\"#484D58\" opacity=\"0\">Fri 20</text><text text-anchor=\"middle\" transform=\"translate(177.6,15)\" font-family=\"'DM Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif\" font-size=\"10px\" fill=\"#484D58\" opacity=\"0\">Sat 21</text><text text-anchor=\"middle\" transform=\"translate(207.2,15)\" font-family=\"'DM Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif\" font-size=\"10px\" fill=\"#484D58\" opacity=\"0\">Jun 22</text><text text-anchor=\"middle\" transform=\"translate(236.8,15)\" font-family=\"'DM Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif\" font-size=\"10px\" fill=\"#484D58\" opacity=\"1\">Mon 23</text><text text-anchor=\"middle\" transform=\"translate(266.40000000000003,15)\" font-family=\"'DM Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif\" font-size=\"10px\" fill=\"#484D58\" opacity=\"0\">Tue 24</text><text text-anchor=\"end\" transform=\"translate(296,15)\" font-family=\"'DM Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif\" font-size=\"10px\" fill=\"#484D58\" opacity=\"0\">Wed 25</text></g><g class=\"mark-rule role-axis-domain\" pointer-events=\"none\"><line transform=\"translate(0,0)\" x2=\"296\" y2=\"0\" stroke=\"#BABEC4\" stroke-width=\"1\" opacity=\"1\"/></g><g class=\"mark-text role-axis-title\" pointer-events=\"none\"><text text-anchor=\"middle\" transform=\"translate(148,30)\" font-family=\"'DM Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif\" font-size=\"11px\" font-weight=\"bold\" fill=\"#1A1D23\" opacity=\"1\">Recorded at</text></g></g><path class=\"foreground\" aria-hidden=\"true\" d=\"\" pointer-events=\"none\" display=\"none\"/></g></g><g class=\"mark-group role-axis\" role=\"graphics-symbol\" aria-roledescription=\"axis\" aria-label=\"Y-axis titled 'API calls' for a linear scale with values from 0 to 1,800\"><g transform=\"translate(0.5,0.5)\"><path class=\"background\" aria-hidden=\"true\" d=\"M0,0h0v0h0Z\" pointer-events=\"none\"/><g><g class=\"mark-rule role-axis-tick\" pointer-events=\"none\"><line transform=\"translate(0,138)\" x2=\"-5\" y2=\"0\" stroke=\"#BABEC4\" stroke-width=\"1\" opacity=\"1\"/><line transform=\"translate(0,100)\" x2=\"-5\" y2=\"0\" stroke=\"#BABEC4\" stroke-width=\"1\" opacity=\"1\"/><line transform=\"translate(0,61)\" x2=\"-5\" y2=\"0\" stroke=\"#BABEC4\" stroke-width=\"1\" opacity=\"1\"/><line transform=\"translate(0,23)\" x2=\"-5\" y2=\"0\" stroke=\"#BABEC4\" stroke-width=\"1\" opacity=\"1\"/></g><g class=\"mark-text role-axis-label\" pointer-events=\"none\"><text text-anchor=\"end\" transform=\"translate(-7,141)\" font-family=\"'DM Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif\" font-size=\"10px\" fill=\"#484D58\" opacity=\"1\">0</text><text text-anchor=\"end\" transform=\"translate(-7,102.66666666666667)\" font-family=\"'DM Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif\" font-size=\"10px\" fill=\"#484D58\" opacity=\"1\">500</text><text text-anchor=\"end\" transform=\"translate(-7,64.33333333333333)\" font-family=\"'DM Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif\" font-size=\"10px\" fill=\"#484D58\" opacity=\"1\">1,000</text><text text-anchor=\"end\" transform=\"translate(-7,25.999999999999996)\" font-family=\"'DM Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif\" font-size=\"10px\" fill=\"#484D58\" opacity=\"1\">1,500</text></g><g class=\"mark-rule role-axis-domain\" pointer-events=\"none\"><line transform=\"translate(0,138)\" x2=\"0\" y2=\"-138\" stroke=\"#BABEC4\" stroke-width=\"1\" opacity=\"1\"/></g><g class=\"mark-text role-axis-title\" pointer-events=\"none\"><text text-anchor=\"middle\" transform=\"translate(-51,69) rotate(-90) translate(0,-2)\" font-family=\"'DM Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif\" font-size=\"11px\" font-weight=\"bold\" fill=\"#1A1D23\" opacity=\"1\">API calls</text></g></g><path class=\"foreground\" aria-hidden=\"true\" d=\"\" pointer-events=\"none\" display=\"none\"/></g></g><g class=\"mark-line role-mark marks\" role=\"graphics-object\" aria-roledescription=\"line mark container\"><path aria-label=\"Recorded at: Jun 15, 2025; API calls: 1200\" role=\"graphics-symbol\" aria-roledescription=\"line mark\" d=\"M0,46L148,0L296,23\" stroke=\"#580918\" stroke-width=\"2\"/></g><g class=\"mark-group role-title\"><g transform=\"translate(-62.00000000000001,-30)\"><path class=\"background\" aria-hidden=\"true\" d=\"M0,0h0v0h0Z\" pointer-events=\"none\"/><g><g class=\"mark-text role-title-text\" role=\"graphics-symbol\" aria-roledescription=\"title\" aria-label=\"Title text 'Example API-call usage'\" pointer-events=\"none\"><text text-anchor=\"start\" transform=\"translate(0,19)\" font-family=\"'DM Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif\" font-size=\"24px\" font-weight=\"600\" fill=\"#1A1D23\" opacity=\"1\">Example API-call usage</text></g></g><path class=\"foreground\" aria-hidden=\"true\" d=\"\" pointer-events=\"none\" display=\"none\"/></g></g></g><path class=\"foreground\" aria-hidden=\"true\" d=\"\" display=\"none\"/></g></g></g></svg>"} description="Synthetic API-call counts for generated example records." height={200} title="Example API-call usage" width={360} />
                                            </Stack>
                                </Stack>
                        <Card id="detail-detail-body-10" data-oods-component="Card" data-layout="stack" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ref-space-cluster-default)' }}>
                                  <Tabs id="detail-detail-tabs-9" data-oods-component="Tabs" ariaLabel="Record details" items={[
                                    { ...{"id":"detail-detail-tabs-9-read-fields","label":"Details"}, panel: (
                                      <Stack id="detail-detail-tabs-9-read-fields" data-oods-component="Stack">
                                        <Stack id="detail-detail-tabs-9-overage_rate_minor-read-field" data-oods-component="Stack">
                                            <Text id="detail-detail-tabs-9-overage_rate_minor-label" data-oods-component="Text" as="strong" content="Overage rate" />
                                            <Text id="detail-detail-tabs-9-overage_rate_minor-value" data-oods-component="Text">{formatReadOnlyValue(overageRateMinor, "integer", false)}</Text>
                                          </Stack>
                                        <Stack id="detail-detail-tabs-9-projected_overage_minor-read-field" data-oods-component="Stack">
                                            <Text id="detail-detail-tabs-9-projected_overage_minor-label" data-oods-component="Text" as="strong" content="Projected overage" />
                                            <Text id="detail-detail-tabs-9-projected_overage_minor-value" data-oods-component="Text">{formatReadOnlyValue(projectedOverageMinor, "integer", false)}</Text>
                                          </Stack>
                                        <Stack id="detail-detail-tabs-9-created_at-read-field" data-oods-component="Stack">
                                            <Text id="detail-detail-tabs-9-created_at-label" data-oods-component="Text" as="strong" content="Created at" />
                                            <Text id="detail-detail-tabs-9-created_at-value" data-oods-component="Text">{formatReadOnlyValue(createdAt, "datetime", false)}</Text>
                                          </Stack>
                                        <Stack id="detail-detail-tabs-9-last_event-read-field" data-oods-component="Stack">
                                            <Text id="detail-detail-tabs-9-last_event-label" data-oods-component="Text" as="strong" content="Last event" />
                                            <Text id="detail-detail-tabs-9-last_event-value" data-oods-component="Text">{formatReadOnlyValue(lastEvent, "string", true)}</Text>
                                          </Stack>
                                        <Stack id="detail-detail-tabs-9-last_event_at-read-field" data-oods-component="Stack">
                                            <Text id="detail-detail-tabs-9-last_event_at-label" data-oods-component="Text" as="strong" content="Last event at" />
                                            <Text id="detail-detail-tabs-9-last_event_at-value" data-oods-component="Text">{formatReadOnlyValue(lastEventAt, "datetime", false)}</Text>
                                          </Stack>
                                        <Stack id="detail-detail-tabs-9-subscription_id-read-field" data-oods-component="Stack">
                                            <Text id="detail-detail-tabs-9-subscription_id-label" data-oods-component="Text" as="strong" content="Subscription id" />
                                            <Text id="detail-detail-tabs-9-subscription_id-value" data-oods-component="Text">{formatReadOnlyValue(subscriptionId, "string", false)}</Text>
                                          </Stack>
                                        <Stack id="detail-detail-tabs-9-meter_id-read-field" data-oods-component="Stack">
                                            <Text id="detail-detail-tabs-9-meter_id-label" data-oods-component="Text" as="strong" content="Meter id" />
                                            <Text id="detail-detail-tabs-9-meter_id-value" data-oods-component="Text">{formatReadOnlyValue(meterId, "string", false)}</Text>
                                          </Stack>
                                        <Stack id="detail-detail-tabs-9-provider-read-field" data-oods-component="Stack">
                                            <Text id="detail-detail-tabs-9-provider-label" data-oods-component="Text" as="strong" content="Provider" />
                                            <Text id="detail-detail-tabs-9-provider-value" data-oods-component="Text">{formatReadOnlyValue(provider, "string", false)}</Text>
                                          </Stack>
                                        <Stack id="detail-detail-tabs-9-trend_percent-read-field" data-oods-component="Stack">
                                            <Text id="detail-detail-tabs-9-trend_percent-label" data-oods-component="Text" as="strong" content="Trend percent" />
                                            <Text id="detail-detail-tabs-9-trend_percent-value" data-oods-component="Text">{formatReadOnlyValue(trendPercent, "number", false)}</Text>
                                          </Stack>
                                        <Stack id="detail-detail-tabs-9-variance_minor-read-field" data-oods-component="Stack">
                                            <Text id="detail-detail-tabs-9-variance_minor-label" data-oods-component="Text" as="strong" content="Variance" />
                                            <Text id="detail-detail-tabs-9-variance_minor-value" data-oods-component="Text">{formatReadOnlyValue(varianceMinor, "integer", false)}</Text>
                                          </Stack>
                                        <Stack id="detail-detail-tabs-9-last_reported_at-read-field" data-oods-component="Stack">
                                            <Text id="detail-detail-tabs-9-last_reported_at-label" data-oods-component="Text" as="strong" content="Last reported at" />
                                            <Text id="detail-detail-tabs-9-last_reported_at-value" data-oods-component="Text">{formatReadOnlyValue(lastReportedAt, "datetime", false)}</Text>
                                          </Stack>
                                        <Stack id="detail-slot-tab-0-4" data-oods-component="Stack" data-layout="stack" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ref-space-cluster-tight)' }}>
                                            <Stack id="detail-pg-status-timeline-23-read-field" data-oods-component="Stack">
                                                  <Text id="detail-pg-status-timeline-23-label" data-oods-component="Text" as="strong" content="Status" />
                                                  <Text id="detail-pg-status-timeline-23-value" data-oods-component="Text">{formatReadOnlyValue(status, "string", true)}</Text>
                                                </Stack>
                                            <Stack id="detail-pg-status-timeline-24-read-field" data-oods-component="Stack">
                                                  <Text id="detail-pg-status-timeline-24-label" data-oods-component="Text" as="strong" content="Updated at" />
                                                  <Text id="detail-pg-status-timeline-24-value" data-oods-component="Text">{formatReadOnlyValue(updatedAt, "datetime", false)}</Text>
                                                </Stack>
                                          </Stack>
                                        <Stack id="detail-slot-tab-1-6-read-field" data-oods-component="Stack">
                                            <Text id="detail-slot-tab-1-6-label" data-oods-component="Text" as="strong" content="Consumed quantity" />
                                            <Text id="detail-slot-tab-1-6-value" data-oods-component="Text">{formatReadOnlyValue(consumedQuantity, "integer", false)}</Text>
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
          <button type="button" data-oods-action="handleViewTimeline" onClick={() => handleViewTimeline()}>View timeline</button>
        </div>
      </>
    </>
  );
};
