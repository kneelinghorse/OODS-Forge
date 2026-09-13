import React from 'react';
import { Banner, Button, DatePicker, DetailHeader, Input, Select, Stack } from '@oods/components-react';
import '@oods/component-styles/css';

export type GeneratedUIState = 'loading' | 'empty' | 'error' | 'success';

export interface GeneratedUIActions {
  handleSubmit: () => void;
}

export interface PageProps {
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
  lastEvent: string;
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
type ButtonProps = React.ComponentPropsWithoutRef<typeof Button>;
type DatePickerProps = React.ComponentPropsWithoutRef<typeof DatePicker>;
type DetailHeaderProps = React.ComponentPropsWithoutRef<typeof DetailHeader>;
type InputProps = React.ComponentPropsWithoutRef<typeof Input>;
type SelectProps = React.ComponentPropsWithoutRef<typeof Select>;
type StackProps = React.ComponentPropsWithoutRef<typeof Stack>;

export const GeneratedUI: React.FC<PageProps> = ({ actions, uiState, anomalies, consumedQuantity, createdAt, includedQuantity, lastEvent, lastEventAt, lastReportedAt, meterId, meterName, overageRateMinor, periodEnd, periodStart, projectedOverageMinor, provider, rolloverStrategy, samples, status, subscriptionId, trendPercent, unitLabel, updatedAt, usageId, varianceMinor }) => {
  if (!actions || !Object.prototype.hasOwnProperty.call(actions, 'handleSubmit') || typeof actions.handleSubmit !== 'function') { throw new Error('GeneratedUI requires actions.handleSubmit.'); }

  const [handleChange_consumed_quantityState, setHandleChange_consumed_quantityState] = React.useState<string>(String(consumedQuantity ?? ''));
  /* @oods-local-binding handleChange_consumed_quantity */ const handleChange_consumed_quantity = (event: React.ChangeEvent<HTMLInputElement>) => { setHandleChange_consumed_quantityState(event.currentTarget.value); };
  const [handleChange_included_quantityState, setHandleChange_included_quantityState] = React.useState<string>(String(includedQuantity ?? ''));
  /* @oods-local-binding handleChange_included_quantity */ const handleChange_included_quantity = (event: React.ChangeEvent<HTMLInputElement>) => { setHandleChange_included_quantityState(event.currentTarget.value); };
  const [handleChange_last_eventState, setHandleChange_last_eventState] = React.useState<string>(String(lastEvent ?? ''));
  /* @oods-local-binding handleChange_last_event */ const handleChange_last_event = (event: React.ChangeEvent<HTMLInputElement>) => { setHandleChange_last_eventState(event.currentTarget.value); };
  const [handleChange_meter_nameState, setHandleChange_meter_nameState] = React.useState<string>(String(meterName ?? ''));
  /* @oods-local-binding handleChange_meter_name */ const handleChange_meter_name = (event: React.ChangeEvent<HTMLInputElement>) => { setHandleChange_meter_nameState(event.currentTarget.value); };
  const [handleChange_overage_rate_minorState, setHandleChange_overage_rate_minorState] = React.useState<string>(String(overageRateMinor ?? ''));
  /* @oods-local-binding handleChange_overage_rate_minor */ const handleChange_overage_rate_minor = (event: React.ChangeEvent<HTMLInputElement>) => { setHandleChange_overage_rate_minorState(event.currentTarget.value); };
  const [handleChange_period_startState, setHandleChange_period_startState] = React.useState<string>(String(periodStart ?? ''));
  /* @oods-local-binding handleChange_period_start */ const handleChange_period_start = (event: React.ChangeEvent<HTMLInputElement>) => { setHandleChange_period_startState(event.currentTarget.value); };
  const [handleChange_projected_overage_minorState, setHandleChange_projected_overage_minorState] = React.useState<string>(String(projectedOverageMinor ?? ''));
  /* @oods-local-binding handleChange_projected_overage_minor */ const handleChange_projected_overage_minor = (event: React.ChangeEvent<HTMLInputElement>) => { setHandleChange_projected_overage_minorState(event.currentTarget.value); };
  const [handleChange_rollover_strategyState, setHandleChange_rollover_strategyState] = React.useState<string>(String(rolloverStrategy ?? ''));
  /* @oods-local-binding handleChange_rollover_strategy */ const handleChange_rollover_strategy = (event: React.ChangeEvent<HTMLInputElement>) => { setHandleChange_rollover_strategyState(event.currentTarget.value); };
  const [handleChange_statusState, setHandleChange_statusState] = React.useState<string>(String(status ?? ''));
  /* @oods-local-binding handleChange_status */ const handleChange_status = (event: React.ChangeEvent<HTMLSelectElement>) => { setHandleChange_statusState(event.currentTarget.value); };
  const [handleChange_unit_labelState, setHandleChange_unit_labelState] = React.useState<string>(String(unitLabel ?? ''));
  /* @oods-local-binding handleChange_unit_label */ const handleChange_unit_label = (event: React.ChangeEvent<HTMLInputElement>) => { setHandleChange_unit_labelState(event.currentTarget.value); };
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
                      <DetailHeader id="form-form-title-1" data-oods-component="DetailHeader" as="h1" />
                      <Stack id="form-form-fields-8" data-oods-component="Stack" data-layout="stack" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ref-space-cluster-default)' }}>
                                <Stack id="form-form-field-group-2" data-oods-component="Stack" data-layout="stack" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ref-space-cluster-tight)' }}>
                                            <DatePicker id="form-slot-field-0-3" data-oods-component="DatePicker" help="Date the usage accumulation window began." label="Period start" value={handleChange_period_startState} onChange={handleChange_period_start} />
                                          </Stack>
                                <Stack id="form-form-field-group-4" data-oods-component="Stack" data-layout="stack" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ref-space-cluster-tight)' }}>
                                            <Select id="form-slot-field-1-5" data-oods-component="Select" help="Health of the usage feed (ok, delayed, investigating)." label="Status" options={[{"value":"ok","label":"ok"},{"value":"delayed","label":"delayed"},{"value":"investigating","label":"investigating"}]} placeholder="Enter status" value={handleChange_statusState} onChange={handleChange_status} />
                                          </Stack>
                                <Stack id="form-form-field-group-6" data-oods-component="Stack" data-layout="stack" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ref-space-cluster-tight)' }}>
                                            <Input id="form-slot-field-2-7" data-oods-component="Input" help="Friendly metered feature name shown in UI (ex: Analytics Seats)." label="Meter name" placeholder="Enter meter name" required value={handleChange_meter_nameState} onChange={handleChange_meter_name} />
                                          </Stack>
                                <Stack id="form-form-field-group-12" data-oods-component="Stack" data-layout="stack" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ref-space-cluster-tight)' }}>
                                            <Input id="form-slot-field-3-13" data-oods-component="Input" help="Quantity included in base plan before overages." label="Included quantity" placeholder="Enter included quantity" required type="number" value={handleChange_included_quantityState} onChange={handleChange_included_quantity} />
                                          </Stack>
                                <Stack id="form-form-field-group-14" data-oods-component="Stack" data-layout="stack" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ref-space-cluster-tight)' }}>
                                            <Input id="form-slot-field-4-15" data-oods-component="Input" help="Actual quantity consumed in the active period." label="Consumed quantity" placeholder="Enter consumed quantity" required type="number" value={handleChange_consumed_quantityState} onChange={handleChange_consumed_quantity} />
                                          </Stack>
                                <Stack id="form-form-field-group-16" data-oods-component="Stack" data-layout="stack" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ref-space-cluster-tight)' }}>
                                            <Input id="form-slot-field-5-17" data-oods-component="Input" help="Label for display, defaults to the unit parameter." label="Unit label" placeholder="Enter unit label" required value={handleChange_unit_labelState} onChange={handleChange_unit_label} />
                                          </Stack>
                                <Stack id="form-form-field-group-18" data-oods-component="Stack" data-layout="stack" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ref-space-cluster-tight)' }}>
                                            <Input id="form-slot-field-6-19" data-oods-component="Input" help="Strategy for unused units (inherits rolloverStrategy parameter)." label="Rollover strategy" placeholder="Enter rollover strategy" value={handleChange_rollover_strategyState} onChange={handleChange_rollover_strategy} />
                                          </Stack>
                                <Stack id="form-form-field-group-20" data-oods-component="Stack" data-layout="stack" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ref-space-cluster-tight)' }}>
                                            <Input id="form-slot-field-7-21" data-oods-component="Input" help="Cost per additional unit expressed in minor currency units." label="Overage rate minor" placeholder="Enter overage rate minor" type="number" value={handleChange_overage_rate_minorState} onChange={handleChange_overage_rate_minor} />
                                          </Stack>
                                <Stack id="form-form-field-group-22" data-oods-component="Stack" data-layout="stack" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ref-space-cluster-tight)' }}>
                                            <Input id="form-slot-field-8-23" data-oods-component="Input" help="Forecasted overage spend derived from consumption trends." label="Projected overage minor" placeholder="Enter projected overage minor" type="number" value={handleChange_projected_overage_minorState} onChange={handleChange_projected_overage_minor} />
                                          </Stack>
                                <Stack id="form-form-field-group-24" data-oods-component="Stack" data-layout="stack" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ref-space-cluster-tight)' }}>
                                            <Input id="form-slot-field-9-25" data-oods-component="Input" help="Lifecycle event associated with the most recent timestamp mutation." label="Last event" placeholder="Enter last event" required value={handleChange_last_eventState} onChange={handleChange_last_event} />
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
