<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, shallowRef } from 'vue';
import List from './screens/List.vue';
import Detail from './screens/Detail.vue';
import Form from './screens/Form.vue';
import Timeline from './screens/Timeline.vue';
import { createWorkflow, idField, titleField, screenProps, history, routes, statuses, supplementalFields, cancellable, type Screen } from './application';
import type { StoreOptions } from './store';
import './app.css';
const options = defineProps<StoreOptions>();
const app = createWorkflow(options);
const state = shallowRef(app.snapshot());
const search = ref('');
const status = ref('');
const screens: Screen[] = ['list', 'detail', 'form', 'timeline'];
const unsubscribe = app.subscribe((next) => { state.value = next; });
onMounted(() => { void app.navigate('list'); });
onUnmounted(() => { unsubscribe(); app.dispose(); });
const props = computed(() => ({ ...screenProps(state.value.draft), actions: app.actions, uiState: state.value.uiState }));
const view = computed(() => ({ list: List, detail: Detail, form: Form, timeline: Timeline })[state.value.screen]);
const values = computed(() => state.value.draft as Record<string, unknown>);
</script>
<template>
  <main class="workflow-app" data-oods-workflow="Subscription" :data-screen="state.screen" :data-route="routes[state.screen]" :data-ui-state="state.uiState">
    <header class="workflow-heading"><div><p class="workflow-eyebrow">SUBSCRIPTION WORKSPACE</p><h1>{{ state.screen === 'list' ? 'Subscriptions' : state.draft["plan_name"] }}</h1></div><span class="workflow-mode">Local workspace</span></header>
    <nav aria-label="Workflow screens"><button v-for="screen in screens" :key="screen" type="button" :aria-current="state.screen === screen ? 'page' : undefined" @click="app.navigate(screen)">{{ screen === 'form' ? 'Edit' : screen[0].toUpperCase() + screen.slice(1) }}</button></nav>
    <section v-if="state.screen === 'list'" class="workflow-toolbar" aria-label="Find subscriptions"><label>Search<input v-model="search" type="search" @input="app.filter(($event.target as HTMLInputElement).value, status)" /></label><label>Status<select v-model="status" @change="app.filter(search, ($event.target as HTMLSelectElement).value)"><option value="">All states</option><option v-for="value in statuses" :key="value" :value="value">{{ value.replaceAll('_', ' ') }}</option></select></label><label>Sort<select @change="app.sort(($event.target as HTMLSelectElement).value === 'desc')"><option value="asc">Name A–Z</option><option value="desc">Name Z–A</option></select></label><button type="button" :aria-pressed="state.archived" @click="app.archived(!state.archived)">{{ state.archived ? 'Show active' : 'Archived' }}</button></section>
    <p v-if="state.error" role="alert">{{ state.error }}</p><button v-if="state.uiState === 'error'" type="button" @click="app.retry()">Try again</button>
    <section aria-label="Subscription screen" class="workflow-content" @input.capture="app.edit" @change.capture="app.edit">
      <template v-if="state.uiState === 'success' && state.screen === 'form'"><label v-for="field in supplementalFields" :key="field.name" class="workflow-field">{{ field.label }}<input :name="field.name" :value="values[field.name]" /></label></template>
      <fieldset v-if="state.uiState === 'success' && state.screen === 'detail' && cancellable" class="workflow-cancel"><legend>Cancellation details</legend><label>Reason<input name="cancellation_reason" :value="values.cancellation_reason ?? ''" /></label><label>Reason code<input name="cancellation_reason_code" :value="values.cancellation_reason_code ?? ''" /></label><label><input name="cancel_at_period_end" type="checkbox" :checked="Boolean(values.cancel_at_period_end)" />Cancel at period end</label></fieldset>
      <component :is="view" :key="state.revision + ':' + state.uiState" v-bind="props" />
      <template v-if="state.uiState === 'success' && state.screen === 'list'"><ul class="workflow-records"><li v-for="record in state.records" :key="String(record[idField])"><button type="button" :data-record-id="record[idField]" @click="app.actions.handleRowClick(String(record[idField]))"><strong>{{ record[titleField] }}</strong><span>{{ String((record as Record<string, unknown>).status).replaceAll('_', ' ') }}</span><span aria-hidden="true">→</span></button></li></ul><div class="workflow-pagination"><span>{{ state.total }} records</span><button :disabled="state.page <= 1" @click="app.page(state.page - 1)">Previous</button><button :disabled="state.page * 10 >= state.total" @click="app.page(state.page + 1)">Next</button></div></template>
      <ol v-if="state.uiState === 'success' && state.screen === 'timeline'" class="workflow-history" aria-label="Lifecycle history"><li v-for="(entry, index) in history(state.draft)" :key="index"><strong>{{ entry.to.replaceAll('_', ' ') }}</strong><time :datetime="entry.at">{{ entry.at }}</time><p>{{ entry.reason }}</p></li></ol>
      <button v-if="state.uiState === 'success' && state.screen === 'detail' && values.is_archived" @click="app.restore()">Restore record</button>
    </section><p class="workflow-notice" role="status">{{ state.notice }}</p>
  </main>
</template>
