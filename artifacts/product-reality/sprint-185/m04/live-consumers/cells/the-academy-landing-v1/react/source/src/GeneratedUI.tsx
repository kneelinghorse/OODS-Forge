import React from 'react';
import { Card, ColorSwatch, ColorizedBadge, DetailHeader, Grid, Stack, Table, Text } from '@oods/components-react';
import '@oods/component-styles/css';

type CardProps = React.ComponentPropsWithoutRef<typeof Card>;
type ColorSwatchProps = React.ComponentPropsWithoutRef<typeof ColorSwatch>;
type ColorizedBadgeProps = React.ComponentPropsWithoutRef<typeof ColorizedBadge>;
type DetailHeaderProps = React.ComponentPropsWithoutRef<typeof DetailHeader>;
type GridProps = React.ComponentPropsWithoutRef<typeof Grid>;
type StackProps = React.ComponentPropsWithoutRef<typeof Stack>;
type TableProps = React.ComponentPropsWithoutRef<typeof Table>;
type TextProps = React.ComponentPropsWithoutRef<typeof Text>;

export const GeneratedUI: React.FC = () => {
  return (
    <>
      <Stack id="screen-dashboard-26" data-oods-component="Stack" data-layout="stack" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ref-space-cluster-default)' }}>
            <Stack id="dashboard-header-1" data-oods-component="Stack" data-layout="inline" style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', padding: 'var(--ref-space-inset-default)' }}>
                    <DetailHeader id="slot-header-2" data-oods-component="DetailHeader" />
                  </Stack>
            <Grid id="dashboard-metrics-3" data-oods-component="Grid" columns={4} gap="cluster-default">
                    <Stack id="dashboard-section-4" data-oods-component="Stack" data-layout="stack" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ref-space-cluster-tight)' }}>
                              <ColorizedBadge id="slot-metrics-5" data-oods-component="ColorizedBadge" />
                            </Stack>
                  </Grid>
            <Card id="dashboard-body-22" data-oods-component="Card" data-layout="sidebar" style={{ alignItems: 'start', display: 'grid', gap: 'var(--ref-space-cluster-default)', gridTemplateColumns: 'minmax(0, 1fr) minmax(16rem, 24rem)' }}>
                    <div data-sidebar-main>
                      <Stack id="dashboard-main-6" data-oods-component="Stack" data-layout="stack" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ref-space-cluster-default)' }}>
                                  <Stack id="dashboard-section-7" data-oods-component="Stack" data-layout="stack" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ref-space-cluster-tight)' }}>
                                                <Text id="dashboard-section-title-8" data-oods-component="Text" content="modern, credible, and warm landing page" />
                                                <Card id="slot-main-content-9" data-oods-component="Card" />
                                              </Stack>
                                  <Stack id="dashboard-section-10" data-oods-component="Stack" data-layout="stack" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ref-space-cluster-tight)' }}>
                                                <Text id="dashboard-section-title-11" data-oods-component="Text" content="It should feature a" />
                                                <Card id="slot-main-section-1-12" data-oods-component="Card" />
                                              </Stack>
                                  <Stack id="dashboard-section-13" data-oods-component="Stack" data-layout="stack" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ref-space-cluster-tight)' }}>
                                                <Text id="dashboard-section-title-14" data-oods-component="Text" content="The core of the" />
                                                <Card id="slot-main-section-2-15" data-oods-component="Card" />
                                              </Stack>
                                  <Stack id="dashboard-section-16" data-oods-component="Stack" data-layout="stack" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ref-space-cluster-tight)' }}>
                                                <Text id="dashboard-section-title-17" data-oods-component="Text" content="Provide sections for authentic" />
                                                <Table id="slot-main-section-3-18" data-oods-component="Table" />
                                              </Stack>
                                  <Stack id="dashboard-section-19" data-oods-component="Stack" data-layout="stack" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ref-space-cluster-tight)' }}>
                                                <Text id="dashboard-section-title-20" data-oods-component="Text" content="The design should utilize" />
                                                <ColorSwatch id="slot-main-section-4-21" data-oods-component="ColorSwatch" />
                                              </Stack>
                                </Stack>
                    </div>
                    <aside data-sidebar-aside>
                      <Stack id="dashboard-sidebar-23" data-oods-component="Stack" data-layout="stack" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ref-space-cluster-tight)', padding: 'var(--ref-space-inset-default)' }}>
                                  <Stack id="dashboard-section-24" data-oods-component="Stack" data-layout="stack" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ref-space-cluster-tight)' }}>
                                                <Stack id="slot-sidebar-25" data-oods-component="Stack" />
                                              </Stack>
                                </Stack>
                    </aside>
                  </Card>
          </Stack>
    </>
  );
};
