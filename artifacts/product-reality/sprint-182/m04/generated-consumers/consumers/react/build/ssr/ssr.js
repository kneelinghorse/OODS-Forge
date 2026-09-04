import { jsx, Fragment, jsxs } from "react/jsx-runtime";
import { renderToString } from "react-dom/server";
import { Stack, Text, Badge, Banner, Button, Card, Checkbox, DatePicker, Grid, Input, Select, Table, Tabs, Textarea } from "@oods/components-react";
const GeneratedUI = () => {
  const handleActivate = () => {
  };
  const handleDismiss = () => {
  };
  const handleEmailChange = (value) => {
  };
  const handleMarketingChange = (value) => {
  };
  const handleNotesChange = (value) => {
  };
  const handlePlanChange = (value) => {
  };
  const handleRenewalChange = (value) => {
  };
  const handleRowActivate = () => {
  };
  const handleSecondaryActivate = () => {
  };
  const handleTabChange = (value) => {
  };
  return /* @__PURE__ */ jsx(Fragment, { children: /* @__PURE__ */ jsxs(Stack, { id: "foundation-v1-showcase", "data-oods-component": "Stack", direction: "column", gap: "lg", children: [
    /* @__PURE__ */ jsx(Text, { id: "showcase-title", "data-oods-component": "Text", as: "h1", content: "Foundation v1 account operations", size: "lg", weight: "semibold" }),
    /* @__PURE__ */ jsx(Badge, { id: "showcase-status", "data-oods-component": "Badge", content: "Past due", emphasis: "solid", icon: "!", tone: "critical" }),
    /* @__PURE__ */ jsx(Banner, { id: "showcase-banner", "data-oods-component": "Banner", detail: "Update the card to keep service active.", dismissLabel: "Dismiss payment warning", title: "Payment failed", tone: "critical", onDismiss: handleDismiss }),
    /* @__PURE__ */ jsx(Button, { id: "showcase-action", "data-oods-component": "Button", content: "Save changes", intent: "primary", size: "md", onActivate: handleActivate }),
    /* @__PURE__ */ jsx(Button, { id: "showcase-secondary-action", "data-oods-component": "Button", content: "Cancel", intent: "secondary", size: "sm", onActivate: handleSecondaryActivate }),
    /* @__PURE__ */ jsx(Card, { id: "showcase-profile", "data-oods-component": "Card", as: "section", elevated: true, children: /* @__PURE__ */ jsx(Text, { id: "showcase-profile-copy", "data-oods-component": "Text", as: "p", content: "Canonical fields retain their labels, help, and validation state." }) }),
    /* @__PURE__ */ jsx(Checkbox, { id: "marketing", "data-oods-component": "Checkbox", defaultChecked: true, help: "Choose whether to subscribe.", label: "Product updates", required: true, onChange: handleMarketingChange }),
    /* @__PURE__ */ jsx(DatePicker, { id: "renewal", "data-oods-component": "DatePicker", defaultValue: "2026-09-30", label: "Renewal date", max: "2026-12-31", min: "2026-09-01", step: 1, onChange: handleRenewalChange }),
    /* @__PURE__ */ jsxs(Grid, { id: "showcase-grid", "data-oods-component": "Grid", align: "stretch", gap: "md", minColumnWidth: "14rem", children: [
      /* @__PURE__ */ jsx(Text, { id: "showcase-grid-primary", "data-oods-component": "Text", as: "strong", content: "Account health" }),
      /* @__PURE__ */ jsx(Text, { id: "showcase-grid-secondary", "data-oods-component": "Text", as: "span", content: "Recent changes" })
    ] }),
    /* @__PURE__ */ jsx(Input, { id: "email", "data-oods-component": "Input", defaultValue: "invalid", help: "Use a work address.", label: "Email", required: true, type: "email", validation: { "state": "error", "message": "Enter a valid email." }, onChange: handleEmailChange }),
    /* @__PURE__ */ jsx(Select, { id: "plan", "data-oods-component": "Select", defaultValue: "pro", label: "Plan", options: [{ "value": "basic", "label": "Basic" }, { "value": "pro", "label": "Pro" }, { "value": "enterprise", "label": "Enterprise" }], onChange: handlePlanChange }),
    /* @__PURE__ */ jsx(Table, { id: "showcase-subscriptions", "data-oods-component": "Table", caption: "Subscriptions", columns: [{ "key": "name", "label": "Name" }, { "key": "plan", "label": "Plan" }, { "key": "status", "label": "Status" }], density: "compact", rows: [{ "id": "sub-1", "name": "Northwind", "plan": "Enterprise", "status": "Active" }, { "id": "sub-2", "name": "Contoso", "plan": "Pro", "status": "Past due" }], selectable: true, onRowActivate: handleRowActivate }),
    /* @__PURE__ */ jsx(Tabs, { id: "showcase-tabs", "data-oods-component": "Tabs", ariaLabel: "Account sections", defaultSelectedId: "overview", items: [{ "id": "overview", "label": "Overview", "panel": "Account health and recent changes." }, { "id": "billing", "label": "Billing", "panel": "Invoices and payment methods." }, { "id": "security", "label": "Security", "panel": "Security settings.", "disabled": true }], overflowLabel: "More sections", size: "md", onChange: handleTabChange }),
    /* @__PURE__ */ jsx(Textarea, { id: "notes", "data-oods-component": "Textarea", defaultValue: "Call before renewal.", help: "Visible to account managers.", label: "Notes", rows: 4, onChange: handleNotesChange })
  ] }) });
};
const html = renderToString(/* @__PURE__ */ jsx(GeneratedUI, {}));
process.stdout.write(JSON.stringify({ html }));
//# sourceMappingURL=ssr.js.map
