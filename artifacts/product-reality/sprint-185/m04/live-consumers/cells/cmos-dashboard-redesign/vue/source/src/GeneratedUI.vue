<template>
  <Stack id="screen-dashboard-24" data-oods-component="Stack" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-default)">
      <Stack id="dashboard-header-1" data-oods-component="Stack" data-layout="inline" style="display: flex; flex-direction: row; justify-content: space-between; padding: var(--ref-space-inset-default)">
            <DetailHeader id="slot-header-2" data-oods-component="DetailHeader" />
          </Stack>
      <Grid id="dashboard-metrics-3" data-oods-component="Grid" :columns="3" gap="cluster-default">
            <Stack id="dashboard-section-4" data-oods-component="Stack" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-tight)">
                    <Text id="dashboard-section-title-5" data-oods-component="Text" content="Main content area shows" />
                    <VizAreaPreview id="slot-metrics-6" data-oods-component="VizAreaPreview" />
                  </Stack>
          </Grid>
      <Card id="dashboard-body-20" data-oods-component="Card" data-layout="sidebar" style="align-items: start; display: grid; gap: var(--ref-space-cluster-default); grid-template-columns: minmax(0, 1fr) minmax(16rem, 24rem)">
            <div data-sidebar-main>
              <Stack id="dashboard-main-7" data-oods-component="Stack" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-default)">
                        <Stack id="dashboard-section-8" data-oods-component="Stack" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-tight)">
                                    <Text id="dashboard-section-title-9" data-oods-component="Text" content="CMOS project management dashboard" />
                                    <Card id="slot-main-content-10" data-oods-component="Card" />
                                  </Stack>
                        <Stack id="dashboard-section-11" data-oods-component="Stack" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-tight)">
                                    <Text id="dashboard-section-title-12" data-oods-component="Text" content="Top navigation bar with" />
                                    <PaginationBar id="slot-main-section-1-13" data-oods-component="PaginationBar" />
                                  </Stack>
                        <Stack id="dashboard-section-14" data-oods-component="Stack" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-tight)">
                                    <Text id="dashboard-section-title-15" data-oods-component="Text" content="Side panel or header" />
                                    <Card id="slot-main-section-2-16" data-oods-component="Card" />
                                  </Stack>
                        <Stack id="dashboard-section-17" data-oods-component="Stack" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-tight)">
                                    <Text id="dashboard-section-title-18" data-oods-component="Text" content="Dark background (#0f172a), card" />
                                    <Card id="slot-main-section-3-19" data-oods-component="Card" />
                                  </Stack>
                      </Stack>
            </div>
            <aside data-sidebar-aside>
              <Stack id="dashboard-sidebar-21" data-oods-component="Stack" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-tight); padding: var(--ref-space-inset-default)">
                        <Stack id="dashboard-section-22" data-oods-component="Stack" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-tight)">
                                    <Stack id="slot-sidebar-23" data-oods-component="Stack" />
                                  </Stack>
                      </Stack>
            </aside>
          </Card>
    </Stack>
</template>

<script setup lang="ts">
import { Card, DetailHeader, Grid, Stack, Text, VizAreaPreview } from '@oods/components-vue';
import { PaginationBar } from '@oods/components-vue/ported';
import '@oods/component-styles/css';
import '@oods/component-styles/css-ported';

defineProps<{
  // Props can be extended here
}>();
</script>

<style scoped>
/* Token CSS variables are consumed via inline styles. */
/* Add component-scoped overrides here as needed. */
</style>
