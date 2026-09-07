import React from 'react';
import { Button, Input, PaginationBar, RelativeTimestamp, SearchInput, Stack } from '@oods/components-react';
import '@oods/component-styles/css';

export interface GeneratedUIActions {
  /* @oods-domain-action handleFilter sha256:16ab1e92d1fca94435e207207864ab7015dc274fc62e2f211a0df55cc291ea36 */
  /* @oods-domain-source sha256:8e5f3caefc9ad5e749948c77de5f5978bb91ef33958f95a5a2be4b419cff400e */
  handleFilter: (criteria: Record<string, unknown>) => void;
  /* @oods-domain-action handleRowClick sha256:773eb5947f10b9c469abd54e200f61529df89035100d7d19eaa88adcd565efc0 */
  /* @oods-domain-source sha256:2691a39947329776a84396671cd57ad501e6855e24bc09bfe575a98e1fde4a88 */
  handleRowClick: (rowId: string) => void;
  /* @oods-domain-action handleSort sha256:757d6df84825c12c0f0cf60e76596eb7c5d0f48a6a4d4cf4186ee36063811b44 */
  /* @oods-domain-source sha256:a44f6b01c1934ac2bd84da820758bea74479e3a4ec56f169390a3d3eeaf34649 */
  handleSort: (column: string) => void;
}

export interface PageProps {
  actions: GeneratedUIActions;
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

type ButtonProps = React.ComponentPropsWithoutRef<typeof Button>;
type InputProps = React.ComponentPropsWithoutRef<typeof Input>;
type PaginationBarProps = React.ComponentPropsWithoutRef<typeof PaginationBar>;
type RelativeTimestampProps = React.ComponentPropsWithoutRef<typeof RelativeTimestamp>;
type SearchInputProps = React.ComponentPropsWithoutRef<typeof SearchInput>;
type StackProps = React.ComponentPropsWithoutRef<typeof Stack>;

export const GeneratedUI: React.FC<PageProps> = ({ actions, anomalies, consumedQuantity, createdAt, includedQuantity, lastEvent, lastEventAt, lastReportedAt, meterId, meterName, overageRateMinor, periodEnd, periodStart, projectedOverageMinor, provider, rolloverStrategy, samples, status, subscriptionId, trendPercent, unitLabel, updatedAt, usageId, varianceMinor }) => {
  if (!actions || !Object.prototype.hasOwnProperty.call(actions, 'handleFilter') || typeof actions.handleFilter !== 'function') { throw new Error('GeneratedUI requires actions.handleFilter.'); }
  if (!actions || !Object.prototype.hasOwnProperty.call(actions, 'handleRowClick') || typeof actions.handleRowClick !== 'function') { throw new Error('GeneratedUI requires actions.handleRowClick.'); }
  if (!actions || !Object.prototype.hasOwnProperty.call(actions, 'handleSort') || typeof actions.handleSort !== 'function') { throw new Error('GeneratedUI requires actions.handleSort.'); }

  const [handleChange_consumed_quantityState, setHandleChange_consumed_quantityState] = React.useState<string>(String(consumedQuantity ?? ''));
  /* @oods-local-binding handleChange_consumed_quantity */ const handleChange_consumed_quantity = (event: React.ChangeEvent<HTMLInputElement>) => { setHandleChange_consumed_quantityState(event.currentTarget.value); };
  /* @oods-domain-binding handleFilter */ const handleFilter = (criteria: Record<string, unknown>) => { actions.handleFilter(criteria); };
  /* @oods-domain-binding handleRowClick */ const handleRowClick = (rowId: string) => { actions.handleRowClick(rowId); };
  /* @oods-domain-binding handleSort */ const handleSort = (column: string) => { actions.handleSort(column); };

  return (
    <>
      <>
        <Stack id="screen-list-9" data-oods-component="Stack" data-layout="stack" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ref-space-cluster-default)' }}>
              <Stack id="list-toolbar-4" data-oods-component="Stack" data-layout="inline" style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', padding: 'var(--ref-space-inset-default)' }}>
                      <SearchInput id="slot-search-1" data-oods-component="SearchInput" />
                      <Input id="slot-filters-2" data-oods-component="Input" label="Actual quantity consumed in the active period." placeholder="Enter consumed quantity" required type="number" value={handleChange_consumed_quantityState} onChange={handleChange_consumed_quantity} />
                      <Button id="slot-toolbar-actions-3" data-oods-component="Button" />
                    </Stack>
              <Stack id="list-items-5" data-oods-component="Stack" data-layout="stack" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ref-space-cluster-tight)' }}>
                      <RelativeTimestamp id="slot-items-6" data-oods-component="RelativeTimestamp" label="Timestamp for the most recent modification, when available." datetime={updatedAt ?? createdAt} />
                    </Stack>
              <Stack id="list-pagination-7" data-oods-component="Stack" data-layout="inline" style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', padding: 'var(--ref-space-inset-default)' }}>
                      <PaginationBar id="slot-pagination-8" data-oods-component="PaginationBar" />
                    </Stack>
            </Stack>
        <div role="group" aria-label="Screen actions" data-oods-screen-actions="screen-list-9">
          <button type="button" data-oods-action="handleFilter" onClick={() => handleFilter({})}>Filter</button>
          <button type="button" data-oods-action="handleRowClick" onClick={() => handleRowClick(meterId)}>Open row</button>
          <button type="button" data-oods-action="handleSort" onClick={() => handleSort('status')}>Sort</button>
        </div>
      </>
    </>
  );
};
