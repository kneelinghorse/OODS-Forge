import '@oods/component-styles/css';
import './visual.css';

import { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';

import {
  Badge,
  Banner,
  Button,
  Card,
  Checkbox,
  DatePicker,
  Grid,
  Input,
  Select,
  Stack,
  Table,
  Tabs,
  Text,
  Textarea,
} from '../src/index.js';

const params = new URLSearchParams(window.location.search);
const brand = params.get('brand') === 'B' ? 'B' : 'A';
const themeParam = params.get('theme');
const theme = themeParam === 'dark' || themeParam === 'hc' ? themeParam : 'light';

document.documentElement.dataset.brand = brand;
document.documentElement.dataset.theme = theme;
document.documentElement.style.colorScheme = theme === 'dark' || theme === 'hc' ? 'dark' : 'light';

function VisualShowcase() {
  const [email, setEmail] = useState('invalid');
  const [renewal, setRenewal] = useState('2026-09-30');
  const [plan, setPlan] = useState('pro');
  const [marketing, setMarketing] = useState(true);
  const [notes, setNotes] = useState('Call before renewal');

  useEffect(() => {
    requestAnimationFrame(() => requestAnimationFrame(() => {
      document.body.dataset.visualReady = 'true';
    }));
  }, []);

  return (
    <main id="react-foundation-showcase" className="visual-shell" aria-label="OODS React foundation showcase">
      <header className="visual-header">
        <div>
          <Text as="h1" size="lg" weight="semibold">Account operations</Text>
          <p>React component foundation · responsive and token driven</p>
        </div>
        <span className="visual-cell-label" data-cell-label>{brand} · {theme}</span>
      </header>
      <Grid minColumnWidth="18rem" gap="lg" align="start">
        <section className="visual-section">
          <h2>Status and actions</h2>
          <Stack gap="md">
            <div className="visual-status-row">
              <Badge domain="subscription" status="active" emphasis="subtle" />
              <Badge domain="invoice" status="past_due" emphasis="solid" icon="!" />
            </div>
            <Banner
              domain="invoice"
              status="past_due"
              title="Payment failed"
              detail="Update the card to keep service active."
              dismissLabel="Dismiss payment warning"
              onDismiss={() => undefined}
              actions={<Button>Update card</Button>}
            />
            <div className="visual-actions">
              <Button>Save changes</Button>
              <Button disabled>Unavailable</Button>
            </div>
          </Stack>
        </section>
        <Card as="section" elevated className="visual-mini-card">
          <h2>Account profile</h2>
          <Text as="p">Canonical native fields with associated help and errors.</Text>
          <Stack gap="md">
            <Input id="visual-email" label="Email" value={email} onValueChange={setEmail} required help="Use a work address" validation={{ state: 'error', message: 'Enter a valid email' }} />
            <DatePicker id="visual-renewal" label="Renewal date" value={renewal} onValueChange={setRenewal} min="2026-09-01" max="2026-12-31" />
            <Select id="visual-plan" label="Plan" value={plan} onValueChange={setPlan} options={[{ value: 'basic', label: 'Basic' }, { value: 'pro', label: 'Pro' }, { value: 'enterprise', label: 'Enterprise' }]} />
            <Textarea id="visual-notes" label="Notes" value={notes} onValueChange={setNotes} rows={3} help="Visible to account managers" />
            <Checkbox id="visual-marketing" label="Product updates" checked={marketing} onCheckedChange={setMarketing} help="Choose whether to subscribe" />
          </Stack>
        </Card>
        <section className="visual-section visual-section--wide">
          <h2>Navigation and data</h2>
          <Tabs
            ariaLabel="Account sections"
            defaultSelectedId="overview"
            overflowLabel="More sections"
            items={[
              { id: 'overview', label: 'Overview', panel: 'Account health and recent changes.' },
              { id: 'profile', label: 'Profile', panel: 'Contact and identity information.' },
              { id: 'security', label: 'Security', panel: 'Unavailable for this account.', disabled: true },
              { id: 'billing', label: 'Billing', panel: 'Invoices and payment methods.' },
              { id: 'activity', label: 'Activity', panel: 'Recent account events.' },
            ]}
          />
          <div className="visual-table-frame">
            <Table
              caption="Subscriptions"
              density="compact"
              selectable
              columns={[{ key: 'name', label: 'Name' }, { key: 'plan', label: 'Plan' }, { key: 'status', label: 'Status' }]}
              rows={[{ id: 'sub-1', name: 'Northwind', plan: 'Enterprise', status: 'Active' }, { id: 'sub-2', name: 'Contoso', plan: 'Pro', status: 'Past due' }]}
            />
          </div>
        </section>
      </Grid>
      <footer className="visual-footer">Frozen component-styles CSS · no consumer source scanning</footer>
    </main>
  );
}

const app = document.getElementById('app');
if (!app) throw new Error('Missing React visual evidence root.');
createRoot(app).render(<VisualShowcase />);
