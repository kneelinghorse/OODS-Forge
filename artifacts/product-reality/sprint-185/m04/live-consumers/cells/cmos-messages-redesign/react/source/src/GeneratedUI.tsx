import React from 'react';
import { Badge, Card, DetailHeader, Stack, Tabs } from '@oods/components-react';
import '@oods/component-styles/css';

type BadgeProps = React.ComponentPropsWithoutRef<typeof Badge>;
type CardProps = React.ComponentPropsWithoutRef<typeof Card>;
type DetailHeaderProps = React.ComponentPropsWithoutRef<typeof DetailHeader>;
type StackProps = React.ComponentPropsWithoutRef<typeof Stack>;
type TabsProps = React.ComponentPropsWithoutRef<typeof Tabs>;

export const GeneratedUI: React.FC = () => {
  return (
    <>
      <Stack id="screen-detail-11" data-oods-component="Stack" data-layout="stack" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ref-space-cluster-default)' }}>
            <Stack id="detail-header-1" data-oods-component="Stack" data-layout="inline" style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', padding: 'var(--ref-space-inset-default)' }}>
                    <DetailHeader id="slot-header-2" data-oods-component="DetailHeader" />
                  </Stack>
            <Card id="detail-body-8" data-oods-component="Card" data-layout="sidebar" style={{ alignItems: 'start', display: 'grid', gap: 'var(--ref-space-cluster-default)', gridTemplateColumns: 'minmax(0, 1fr) minmax(16rem, 24rem)' }}>
                    <div data-sidebar-main>
                      <Tabs id="detail-tabs-7" data-oods-component="Tabs" items={[
                        { ...{"id":"detail-tab-panel-3","label":"Inbox"}, panel: (
                          <Stack id="detail-tab-panel-3" data-oods-component="Stack" data-layout="stack" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ref-space-cluster-default)' }}>
                            <Card id="slot-tab-0-4" data-oods-component="Card" />
                          </Stack>
                        ) },
                        { ...{"id":"detail-tab-panel-5","label":"Sent"}, panel: (
                          <Stack id="detail-tab-panel-5" data-oods-component="Stack" data-layout="stack" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ref-space-cluster-default)' }}>
                            <Badge id="slot-tab-1-6" data-oods-component="Badge" />
                          </Stack>
                        ) }
                      ]} />
                    </div>
                    <aside data-sidebar-aside>
                      <Stack id="detail-meta-9" data-oods-component="Stack" data-layout="stack" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ref-space-cluster-tight)', padding: 'var(--ref-space-inset-default)' }}>
                                  <Badge id="slot-metadata-10" data-oods-component="Badge" />
                                </Stack>
                    </aside>
                  </Card>
          </Stack>
    </>
  );
};
