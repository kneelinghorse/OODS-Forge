import React from 'react';
import { StatusBadge, ArchivedRowOverlay, Tabs } from '@oods/components-react';
import { GeneratedUI as List } from './screens/List';
import { GeneratedUI as Detail } from './screens/Detail';
import { GeneratedUI as Form } from './screens/Form';
import { GeneratedUI as Timeline } from './screens/Timeline';
import { createWorkflow, idField, titleField, screenProps, history, routes, statuses, supplementalFields, cancellable, archivePresentation, type Screen } from './application';
import type { StoreOptions } from './store';
import './app.css';
export default function App(options: StoreOptions) {
  const [app] = React.useState(() => createWorkflow(options));
  const [state, setState] = React.useState(app.snapshot);
  const [search, setSearch] = React.useState('');
  const [status, setStatus] = React.useState('');
  React.useEffect(() => { const unsubscribe = app.subscribe(setState); void app.navigate('list'); return () => { unsubscribe(); app.dispose(); }; }, [app]);
  const props = { ...screenProps(state.draft), actions: app.actions, uiState: state.uiState };
  const recordList = <> <ul className="workflow-records">{state.records.map((record) => <li key={String(record[idField])}><ArchivedRowOverlay isArchived={Boolean((record as Record<string, unknown>)[archivePresentation.archivedField])} label={String(record[titleField])} showBadge={archivePresentation.showBadge} separateTab={archivePresentation.separateTab} tabLabel={archivePresentation.tabLabel}><button type="button" data-record-id={String(record[idField])} onClick={() => app.actions.handleRowClick(String(record[idField]))}><strong>{String(record[titleField])}</strong><StatusBadge status={String((record as Record<string, unknown>).status)} /><span aria-hidden="true">→</span></button></ArchivedRowOverlay></li>)}</ul><div className="workflow-pagination"><span>{state.total} records</span><button disabled={state.page <= 1} onClick={() => { void app.page(state.page - 1); }}>Previous</button><button disabled={state.page * 10 >= state.total} onClick={() => { void app.page(state.page + 1); }}>Next</button></div> </>;
  return <main className="workflow-app" data-oods-workflow="Subscription" data-screen={state.screen} data-selected-id={state.id} data-route={routes[state.screen]} data-ui-state={state.uiState}>
    <header className="workflow-heading"><div><p className="workflow-eyebrow">SUBSCRIPTION WORKSPACE</p><h1>{state.screen === 'list' ? 'Subscriptions' : String(state.draft["plan_name"])}</h1></div><span className="workflow-mode">Local workspace</span></header>
    <nav aria-label="Workflow screens">{(['list', 'detail', 'form', 'timeline'] as Screen[]).map((screen) => <button type="button" key={screen} aria-current={state.screen === screen ? 'page' : undefined} onClick={() => { void app.navigate(screen); }}>{screen === 'form' ? 'Edit' : screen[0].toUpperCase() + screen.slice(1)}</button>)}</nav>
    {state.screen === 'list' && <section className="workflow-toolbar" aria-label="Find subscriptions"><label>Search<input type="search" value={search} onChange={(event) => { setSearch(event.target.value); void app.filter(event.target.value, status); }} /></label><label>Status<select value={status} onChange={(event) => { setStatus(event.target.value); void app.filter(search, event.target.value); }}><option value="">All states</option>{statuses.map((value) => <option key={value} value={value}>{value.replaceAll('_', ' ')}</option>)}</select></label><label>Sort<select onChange={(event) => { void app.sort(event.target.value === 'desc'); }}><option value="asc">Name A–Z</option><option value="desc">Name Z–A</option></select></label></section>}
    {state.error && <p role="alert">{state.error}</p>}
    {state.uiState === 'error' && <button type="button" onClick={() => { void app.retry(); }}>Try again</button>}
    <section aria-label="Subscription screen" className="workflow-content" onChangeCapture={(event) => app.edit(event.nativeEvent)}>
      {state.uiState === 'success' && state.screen === 'form' && supplementalFields.map((field) => <label className="workflow-field" key={field.name}>{field.label}<input name={field.name} defaultValue={String((state.draft as Record<string, unknown>)[field.name])} /></label>)}
      {state.uiState === 'success' && state.screen === 'detail' && cancellable && <fieldset className="workflow-cancel"><legend>Cancellation details</legend><label>Reason<input name="cancellation_reason" defaultValue={String((state.draft as Record<string, unknown>).cancellation_reason ?? '')} /></label><label>Reason code<input name="cancellation_reason_code" defaultValue={String((state.draft as Record<string, unknown>).cancellation_reason_code ?? '')} /></label><label><input name="cancel_at_period_end" type="checkbox" defaultChecked={Boolean((state.draft as Record<string, unknown>).cancel_at_period_end)} />Cancel at period end</label></fieldset>}
      {state.screen === 'list' && <List {...props} key={state.revision + ':' + state.uiState} />}
      {state.screen === 'detail' && <Detail {...props} key={state.revision + ':' + state.uiState} />}
      {state.screen === 'form' && <form onSubmit={(event) => { event.preventDefault(); app.actions.handleSubmit(); }}><Form {...props} key={state.revision + ':' + state.uiState} /></form>}
      {state.screen === 'timeline' && <Timeline {...props} key={state.revision + ':' + state.uiState} />}
      {state.uiState === 'success' && state.screen === 'list' && <Tabs ariaLabel="Archive views" selectedId={state.archived ? 'archived' : 'active'} onChange={(id) => { void app.archived(id === 'archived'); }} items={[{ id: 'active', label: 'Active', panel: state.archived ? null : recordList }, { id: 'archived', label: archivePresentation.tabLabel, panel: state.archived ? recordList : null }]} />}
      {state.uiState === 'success' && state.screen === 'timeline' && <ol className="workflow-history" aria-label="Lifecycle history">{history(state.draft).map((entry, index) => <li key={index}><strong>{entry.to.replaceAll('_', ' ')}</strong><time dateTime={entry.at}>{entry.at}</time><p>{entry.reason}</p></li>)}</ol>}
      {state.uiState === 'success' && state.screen === 'detail' && Boolean((state.draft as Record<string, unknown>).is_archived) && <button onClick={() => { void app.restore(); }}>Restore record</button>}
    </section>
    <p className="workflow-notice" role="status">{state.notice}</p>
  </main>;
}
