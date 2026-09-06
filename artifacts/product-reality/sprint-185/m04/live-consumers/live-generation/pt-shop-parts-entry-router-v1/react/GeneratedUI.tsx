import React from 'react';
import { Button, Card, DetailHeader, Stack } from '@oods/components-react';
import { SearchInput } from '@oods/components-react/ported';
import '@oods/component-styles/css';
import '@oods/component-styles/css-ported';

type ButtonProps = React.ComponentPropsWithoutRef<typeof Button>;
type CardProps = React.ComponentPropsWithoutRef<typeof Card>;
type DetailHeaderProps = React.ComponentPropsWithoutRef<typeof DetailHeader>;
type SearchInputProps = React.ComponentPropsWithoutRef<typeof SearchInput>;
type StackProps = React.ComponentPropsWithoutRef<typeof Stack>;

export const GeneratedUI: React.FC = () => {
  return (
    <>
      <Stack id="screen-landing-15" data-oods-component="Stack" data-layout="stack" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ref-space-cluster-default)' }}>
            <Stack id="landing-hero-1" data-oods-component="Stack" data-layout="stack" style={{ alignItems: 'center', display: 'flex', flexDirection: 'column', gap: 'var(--ref-space-cluster-default)', padding: 'var(--ref-space-inset-default)' }}>
                    <DetailHeader id="slot-hero-2" data-oods-component="DetailHeader" />
                    <Button id="slot-hero-cta-3" data-oods-component="Button" />
                  </Stack>
            <Stack id="landing-sections-10" data-oods-component="Stack" data-layout="stack" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ref-space-cluster-default)' }}>
                    <Card id="landing-section-0-4" data-oods-component="Card" data-layout="stack" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ref-space-cluster-tight)', padding: 'var(--ref-space-inset-default)' }}>
                              <SearchInput id="slot-section-0-5" data-oods-component="SearchInput" />
                            </Card>
                    <Card id="landing-section-1-6" data-oods-component="Card" data-layout="stack" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ref-space-cluster-tight)', padding: 'var(--ref-space-inset-default)' }}>
                              <SearchInput id="slot-section-1-7" data-oods-component="SearchInput" />
                            </Card>
                    <Card id="landing-section-2-8" data-oods-component="Card" data-layout="stack" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ref-space-cluster-tight)', padding: 'var(--ref-space-inset-default)' }}>
                              <SearchInput id="slot-section-2-9" data-oods-component="SearchInput" />
                            </Card>
                  </Stack>
            <Stack id="landing-cta-11" data-oods-component="Stack" data-layout="inline" style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', padding: 'var(--ref-space-inset-default)' }}>
                    <Button id="slot-cta-12" data-oods-component="Button" />
                  </Stack>
            <Stack id="landing-footer-13" data-oods-component="Stack" data-layout="inline" style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', padding: 'var(--ref-space-inset-squish)' }}>
                    <SearchInput id="slot-footer-14" data-oods-component="SearchInput" />
                  </Stack>
          </Stack>
    </>
  );
};
