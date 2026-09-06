<template>
  <Stack id="screen-detail-11" data-oods-component="Stack" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-default)">
      <Stack id="detail-header-1" data-oods-component="Stack" data-layout="inline" style="display: flex; flex-direction: row; justify-content: space-between; padding: var(--ref-space-inset-default)">
            <DetailHeader id="slot-header-2" data-oods-component="DetailHeader" />
          </Stack>
      <Card id="detail-body-8" data-oods-component="Card" data-layout="sidebar" style="align-items: start; display: grid; gap: var(--ref-space-cluster-default); grid-template-columns: minmax(0, 1fr) minmax(16rem, 24rem)">
            <div data-sidebar-main>
              <Tabs id="detail-tabs-7" data-oods-component="Tabs" :items="[{'id':'detail-tab-panel-3','label':'Inbox','panel':''},{'id':'detail-tab-panel-5','label':'Sent','panel':''}]">
                        <template #panel="{ item }">
                          <template v-if="item.id === 'detail-tab-panel-3'">
                            <Stack id="detail-tab-panel-3" data-oods-component="Stack" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-default)">
                              <Card id="slot-tab-0-4" data-oods-component="Card" />
                            </Stack>
                          </template>
                          <template v-if="item.id === 'detail-tab-panel-5'">
                            <Stack id="detail-tab-panel-5" data-oods-component="Stack" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-default)">
                              <Badge id="slot-tab-1-6" data-oods-component="Badge" />
                            </Stack>
                          </template>
                        </template>
                      </Tabs>
            </div>
            <aside data-sidebar-aside>
              <Stack id="detail-meta-9" data-oods-component="Stack" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-tight); padding: var(--ref-space-inset-default)">
                        <Badge id="slot-metadata-10" data-oods-component="Badge" />
                      </Stack>
            </aside>
          </Card>
    </Stack>
</template>

<script setup lang="ts">
import { Badge, Card, DetailHeader, Stack, Tabs } from '@oods/components-vue';
import '@oods/component-styles/css';

defineProps<{
  // Props can be extended here
}>();
</script>

<style scoped>
/* Token CSS variables are consumed via inline styles. */
/* Add component-scoped overrides here as needed. */
</style>
