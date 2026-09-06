import React from 'react';
import { Card, DetailHeader, Grid, Stack, Text, VizAreaPreview } from '@oods/components-react';
import { PaginationBar } from '@oods/components-react/ported';
import '@oods/component-styles/css';
import '@oods/component-styles/css-ported';

type CardProps = React.ComponentPropsWithoutRef<typeof Card>;
type DetailHeaderProps = React.ComponentPropsWithoutRef<typeof DetailHeader>;
type GridProps = React.ComponentPropsWithoutRef<typeof Grid>;
type PaginationBarProps = React.ComponentPropsWithoutRef<typeof PaginationBar>;
type StackProps = React.ComponentPropsWithoutRef<typeof Stack>;
type TextProps = React.ComponentPropsWithoutRef<typeof Text>;
type VizAreaPreviewProps = React.ComponentPropsWithoutRef<typeof VizAreaPreview>;

export const GeneratedUI: React.FC = () => {
  return (
    <>
      <Stack id="screen-dashboard-24" data-oods-component="Stack" data-layout="stack" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ref-space-cluster-default)' }}>
            <Stack id="dashboard-header-1" data-oods-component="Stack" data-layout="inline" style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', padding: 'var(--ref-space-inset-default)' }}>
                    <DetailHeader id="slot-header-2" data-oods-component="DetailHeader" />
                  </Stack>
            <Grid id="dashboard-metrics-3" data-oods-component="Grid" columns={3} gap="cluster-default">
                    <Stack id="dashboard-section-4" data-oods-component="Stack" data-layout="stack" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ref-space-cluster-tight)' }}>
                              <Text id="dashboard-section-title-5" data-oods-component="Text" content="Main content area shows" />
                              <VizAreaPreview id="slot-metrics-6" data-oods-component="VizAreaPreview" />
                            </Stack>
                  </Grid>
            <Card id="dashboard-body-20" data-oods-component="Card" data-layout="sidebar" style={{ alignItems: 'start', display: 'grid', gap: 'var(--ref-space-cluster-default)', gridTemplateColumns: 'minmax(0, 1fr) minmax(16rem, 24rem)' }}>
                    <div data-sidebar-main>
                      <Stack id="dashboard-main-7" data-oods-component="Stack" data-layout="stack" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ref-space-cluster-default)' }}>
                                  <Stack id="dashboard-section-8" data-oods-component="Stack" data-layout="stack" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ref-space-cluster-tight)' }}>
                                                <Text id="dashboard-section-title-9" data-oods-component="Text" content="CMOS project management dashboard" />
                                                <Card id="slot-main-content-10" data-oods-component="Card" />
                                              </Stack>
                                  <Stack id="dashboard-section-11" data-oods-component="Stack" data-layout="stack" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ref-space-cluster-tight)' }}>
                                                <Text id="dashboard-section-title-12" data-oods-component="Text" content="Top navigation bar with" />
                                                <PaginationBar id="slot-main-section-1-13" data-oods-component="PaginationBar" />
                                              </Stack>
                                  <Stack id="dashboard-section-14" data-oods-component="Stack" data-layout="stack" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ref-space-cluster-tight)' }}>
                                                <Text id="dashboard-section-title-15" data-oods-component="Text" content="Side panel or header" />
                                                <Card id="slot-main-section-2-16" data-oods-component="Card" />
                                              </Stack>
                                  <Stack id="dashboard-section-17" data-oods-component="Stack" data-layout="stack" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ref-space-cluster-tight)' }}>
                                                <Text id="dashboard-section-title-18" data-oods-component="Text" content="Dark background (#0f172a), card" />
                                                <Card id="slot-main-section-3-19" data-oods-component="Card" />
                                              </Stack>
                                </Stack>
                    </div>
                    <aside data-sidebar-aside>
                      <Stack id="dashboard-sidebar-21" data-oods-component="Stack" data-layout="stack" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ref-space-cluster-tight)', padding: 'var(--ref-space-inset-default)' }}>
                                  <Stack id="dashboard-section-22" data-oods-component="Stack" data-layout="stack" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ref-space-cluster-tight)' }}>
                                                <Stack id="slot-sidebar-23" data-oods-component="Stack" />
                                              </Stack>
                                </Stack>
                    </aside>
                  </Card>
          </Stack>
    </>
  );
};
