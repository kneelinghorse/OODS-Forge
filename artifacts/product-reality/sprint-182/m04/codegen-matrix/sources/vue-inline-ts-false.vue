<template>
  <Stack id="foundation-v1-showcase" data-oods-component="Stack" direction="column" gap="lg">
      <Text id="showcase-title" data-oods-component="Text" as="h1" content="Foundation v1 account operations" size="lg" weight="semibold" />
      <Badge id="showcase-status" data-oods-component="Badge" content="Past due" emphasis="solid" icon="!" tone="critical" />
      <Banner id="showcase-banner" data-oods-component="Banner" detail="Update the card to keep service active." dismissLabel="Dismiss payment warning" title="Payment failed" tone="critical" @dismiss="handleDismiss" />
      <Button id="showcase-action" data-oods-component="Button" content="Save changes" intent="primary" size="md" @activate="handleActivate" />
      <Button id="showcase-secondary-action" data-oods-component="Button" content="Cancel" intent="secondary" size="sm" @activate="handleSecondaryActivate" />
      <Card id="showcase-profile" data-oods-component="Card" as="section" elevated>
            <Text id="showcase-profile-copy" data-oods-component="Text" as="p" content="Canonical fields retain their labels, help, and validation state." />
          </Card>
      <Checkbox id="marketing" data-oods-component="Checkbox" defaultChecked help="Choose whether to subscribe." label="Product updates" required @change="handleMarketingChange" />
      <DatePicker id="renewal" data-oods-component="DatePicker" defaultValue="2026-09-30" label="Renewal date" max="2026-12-31" min="2026-09-01" :step="1" @change="handleRenewalChange" />
      <Grid id="showcase-grid" data-oods-component="Grid" align="stretch" gap="md" minColumnWidth="14rem">
            <Text id="showcase-grid-primary" data-oods-component="Text" as="strong" content="Account health" />
            <Text id="showcase-grid-secondary" data-oods-component="Text" as="span" content="Recent changes" />
          </Grid>
      <Input id="email" data-oods-component="Input" defaultValue="invalid" help="Use a work address." label="Email" required type="email" :validation="{'state':'error','message':'Enter a valid email.'}" @change="handleEmailChange" />
      <Select id="plan" data-oods-component="Select" defaultValue="pro" label="Plan" :options="[{'value':'basic','label':'Basic'},{'value':'pro','label':'Pro'},{'value':'enterprise','label':'Enterprise'}]" @change="handlePlanChange" />
      <Table id="showcase-subscriptions" data-oods-component="Table" caption="Subscriptions" :columns="[{'key':'name','label':'Name'},{'key':'plan','label':'Plan'},{'key':'status','label':'Status'}]" density="compact" :rows="[{'id':'sub-1','name':'Northwind','plan':'Enterprise','status':'Active'},{'id':'sub-2','name':'Contoso','plan':'Pro','status':'Past due'}]" selectable @rowActivate="handleRowActivate" />
      <Tabs id="showcase-tabs" data-oods-component="Tabs" ariaLabel="Account sections" defaultSelectedId="overview" :items="[{'id':'overview','label':'Overview','panel':'Account health and recent changes.'},{'id':'billing','label':'Billing','panel':'Invoices and payment methods.'},{'id':'security','label':'Security','panel':'Security settings.','disabled':true}]" overflowLabel="More sections" size="md" @change="handleTabChange" />
      <Textarea id="notes" data-oods-component="Textarea" defaultValue="Call before renewal." help="Visible to account managers." label="Notes" :rows="4" @change="handleNotesChange" />
    </Stack>
</template>

<script setup>
import { Badge, Banner, Button, Card, Checkbox, DatePicker, Grid, Input, Select, Stack, Table, Tabs, Text, Textarea } from '@oods/components-vue';
import '@oods/component-styles/css';

const handleActivate = () => { /* TODO: implement handleActivate */ };
const handleDismiss = () => { /* TODO: implement handleDismiss */ };
const handleEmailChange = (value) => { /* TODO: implement handleEmailChange */ };
const handleMarketingChange = (value) => { /* TODO: implement handleMarketingChange */ };
const handleNotesChange = (value) => { /* TODO: implement handleNotesChange */ };
const handlePlanChange = (value) => { /* TODO: implement handlePlanChange */ };
const handleRenewalChange = (value) => { /* TODO: implement handleRenewalChange */ };
const handleRowActivate = () => { /* TODO: implement handleRowActivate */ };
const handleSecondaryActivate = () => { /* TODO: implement handleSecondaryActivate */ };
const handleTabChange = (value) => { /* TODO: implement handleTabChange */ };
</script>
