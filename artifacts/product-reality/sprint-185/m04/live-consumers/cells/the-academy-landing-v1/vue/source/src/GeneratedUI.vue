<template>
  <Stack id="screen-dashboard-26" data-oods-component="Stack" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-default)">
      <Stack id="dashboard-header-1" data-oods-component="Stack" data-layout="inline" style="display: flex; flex-direction: row; justify-content: space-between; padding: var(--ref-space-inset-default)">
            <DetailHeader id="slot-header-2" data-oods-component="DetailHeader" />
          </Stack>
      <Grid id="dashboard-metrics-3" data-oods-component="Grid" :columns="4" gap="cluster-default">
            <Stack id="dashboard-section-4" data-oods-component="Stack" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-tight)">
                    <ColorizedBadge id="slot-metrics-5" data-oods-component="ColorizedBadge" />
                  </Stack>
          </Grid>
      <Card id="dashboard-body-22" data-oods-component="Card" data-layout="sidebar" style="align-items: start; display: grid; gap: var(--ref-space-cluster-default); grid-template-columns: minmax(0, 1fr) minmax(16rem, 24rem)">
            <div data-sidebar-main>
              <Stack id="dashboard-main-6" data-oods-component="Stack" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-default)">
                        <Stack id="dashboard-section-7" data-oods-component="Stack" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-tight)">
                                    <Text id="dashboard-section-title-8" data-oods-component="Text" content="modern, credible, and warm landing page" />
                                    <Card id="slot-main-content-9" data-oods-component="Card" />
                                  </Stack>
                        <Stack id="dashboard-section-10" data-oods-component="Stack" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-tight)">
                                    <Text id="dashboard-section-title-11" data-oods-component="Text" content="It should feature a" />
                                    <Card id="slot-main-section-1-12" data-oods-component="Card" />
                                  </Stack>
                        <Stack id="dashboard-section-13" data-oods-component="Stack" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-tight)">
                                    <Text id="dashboard-section-title-14" data-oods-component="Text" content="The core of the" />
                                    <Card id="slot-main-section-2-15" data-oods-component="Card" />
                                  </Stack>
                        <Stack id="dashboard-section-16" data-oods-component="Stack" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-tight)">
                                    <Text id="dashboard-section-title-17" data-oods-component="Text" content="Provide sections for authentic" />
                                    <Table id="slot-main-section-3-18" data-oods-component="Table" />
                                  </Stack>
                        <Stack id="dashboard-section-19" data-oods-component="Stack" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-tight)">
                                    <Text id="dashboard-section-title-20" data-oods-component="Text" content="The design should utilize" />
                                    <ColorSwatch id="slot-main-section-4-21" data-oods-component="ColorSwatch" />
                                  </Stack>
                      </Stack>
            </div>
            <aside data-sidebar-aside>
              <Stack id="dashboard-sidebar-23" data-oods-component="Stack" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-tight); padding: var(--ref-space-inset-default)">
                        <Stack id="dashboard-section-24" data-oods-component="Stack" data-layout="stack" style="display: flex; flex-direction: column; gap: var(--ref-space-cluster-tight)">
                                    <Stack id="slot-sidebar-25" data-oods-component="Stack" />
                                  </Stack>
                      </Stack>
            </aside>
          </Card>
    </Stack>
</template>

<script setup lang="ts">
import { Card, ColorSwatch, ColorizedBadge, DetailHeader, Grid, Stack, Table, Text } from '@oods/components-vue';
import '@oods/component-styles/css';

defineProps<{
  // Props can be extended here
}>();
</script>

<style scoped>
/* Token CSS variables are consumed via inline styles. */
/* Add component-scoped overrides here as needed. */
</style>
