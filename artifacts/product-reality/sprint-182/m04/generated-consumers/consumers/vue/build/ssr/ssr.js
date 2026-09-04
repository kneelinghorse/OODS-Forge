import { renderToString } from "@vue/server-renderer";
import { defineComponent, unref, mergeProps, withCtx, createVNode, useSSRContext, createSSRApp } from "vue";
import { ssrRenderComponent } from "vue/server-renderer";
import { Stack, Text, Badge, Banner, Button, Card, Checkbox, DatePicker, Grid, Input, Select, Table, Tabs, Textarea } from "@oods/components-vue";
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "GeneratedUI",
  __ssrInlineRender: true,
  setup(__props) {
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
    return (_ctx, _push, _parent, _attrs) => {
      _push(ssrRenderComponent(unref(Stack), mergeProps({
        id: "foundation-v1-showcase",
        "data-oods-component": "Stack",
        direction: "column",
        gap: "lg"
      }, _attrs), {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(unref(Text), {
              id: "showcase-title",
              "data-oods-component": "Text",
              as: "h1",
              content: "Foundation v1 account operations",
              size: "lg",
              weight: "semibold"
            }, null, _parent2, _scopeId));
            _push2(ssrRenderComponent(unref(Badge), {
              id: "showcase-status",
              "data-oods-component": "Badge",
              content: "Past due",
              emphasis: "solid",
              icon: "!",
              tone: "critical"
            }, null, _parent2, _scopeId));
            _push2(ssrRenderComponent(unref(Banner), {
              id: "showcase-banner",
              "data-oods-component": "Banner",
              detail: "Update the card to keep service active.",
              dismissLabel: "Dismiss payment warning",
              title: "Payment failed",
              tone: "critical",
              onDismiss: handleDismiss
            }, null, _parent2, _scopeId));
            _push2(ssrRenderComponent(unref(Button), {
              id: "showcase-action",
              "data-oods-component": "Button",
              content: "Save changes",
              intent: "primary",
              size: "md",
              onActivate: handleActivate
            }, null, _parent2, _scopeId));
            _push2(ssrRenderComponent(unref(Button), {
              id: "showcase-secondary-action",
              "data-oods-component": "Button",
              content: "Cancel",
              intent: "secondary",
              size: "sm",
              onActivate: handleSecondaryActivate
            }, null, _parent2, _scopeId));
            _push2(ssrRenderComponent(unref(Card), {
              id: "showcase-profile",
              "data-oods-component": "Card",
              as: "section",
              elevated: ""
            }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(ssrRenderComponent(unref(Text), {
                    id: "showcase-profile-copy",
                    "data-oods-component": "Text",
                    as: "p",
                    content: "Canonical fields retain their labels, help, and validation state."
                  }, null, _parent3, _scopeId2));
                } else {
                  return [
                    createVNode(unref(Text), {
                      id: "showcase-profile-copy",
                      "data-oods-component": "Text",
                      as: "p",
                      content: "Canonical fields retain their labels, help, and validation state."
                    })
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
            _push2(ssrRenderComponent(unref(Checkbox), {
              id: "marketing",
              "data-oods-component": "Checkbox",
              defaultChecked: "",
              help: "Choose whether to subscribe.",
              label: "Product updates",
              required: "",
              onChange: handleMarketingChange
            }, null, _parent2, _scopeId));
            _push2(ssrRenderComponent(unref(DatePicker), {
              id: "renewal",
              "data-oods-component": "DatePicker",
              defaultValue: "2026-09-30",
              label: "Renewal date",
              max: "2026-12-31",
              min: "2026-09-01",
              step: 1,
              onChange: handleRenewalChange
            }, null, _parent2, _scopeId));
            _push2(ssrRenderComponent(unref(Grid), {
              id: "showcase-grid",
              "data-oods-component": "Grid",
              align: "stretch",
              gap: "md",
              minColumnWidth: "14rem"
            }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(ssrRenderComponent(unref(Text), {
                    id: "showcase-grid-primary",
                    "data-oods-component": "Text",
                    as: "strong",
                    content: "Account health"
                  }, null, _parent3, _scopeId2));
                  _push3(ssrRenderComponent(unref(Text), {
                    id: "showcase-grid-secondary",
                    "data-oods-component": "Text",
                    as: "span",
                    content: "Recent changes"
                  }, null, _parent3, _scopeId2));
                } else {
                  return [
                    createVNode(unref(Text), {
                      id: "showcase-grid-primary",
                      "data-oods-component": "Text",
                      as: "strong",
                      content: "Account health"
                    }),
                    createVNode(unref(Text), {
                      id: "showcase-grid-secondary",
                      "data-oods-component": "Text",
                      as: "span",
                      content: "Recent changes"
                    })
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
            _push2(ssrRenderComponent(unref(Input), {
              id: "email",
              "data-oods-component": "Input",
              defaultValue: "invalid",
              help: "Use a work address.",
              label: "Email",
              required: "",
              type: "email",
              validation: { "state": "error", "message": "Enter a valid email." },
              onChange: handleEmailChange
            }, null, _parent2, _scopeId));
            _push2(ssrRenderComponent(unref(Select), {
              id: "plan",
              "data-oods-component": "Select",
              defaultValue: "pro",
              label: "Plan",
              options: [{ "value": "basic", "label": "Basic" }, { "value": "pro", "label": "Pro" }, { "value": "enterprise", "label": "Enterprise" }],
              onChange: handlePlanChange
            }, null, _parent2, _scopeId));
            _push2(ssrRenderComponent(unref(Table), {
              id: "showcase-subscriptions",
              "data-oods-component": "Table",
              caption: "Subscriptions",
              columns: [{ "key": "name", "label": "Name" }, { "key": "plan", "label": "Plan" }, { "key": "status", "label": "Status" }],
              density: "compact",
              rows: [{ "id": "sub-1", "name": "Northwind", "plan": "Enterprise", "status": "Active" }, { "id": "sub-2", "name": "Contoso", "plan": "Pro", "status": "Past due" }],
              selectable: "",
              onRowActivate: handleRowActivate
            }, null, _parent2, _scopeId));
            _push2(ssrRenderComponent(unref(Tabs), {
              id: "showcase-tabs",
              "data-oods-component": "Tabs",
              ariaLabel: "Account sections",
              defaultSelectedId: "overview",
              items: [{ "id": "overview", "label": "Overview", "panel": "Account health and recent changes." }, { "id": "billing", "label": "Billing", "panel": "Invoices and payment methods." }, { "id": "security", "label": "Security", "panel": "Security settings.", "disabled": true }],
              overflowLabel: "More sections",
              size: "md",
              onChange: handleTabChange
            }, null, _parent2, _scopeId));
            _push2(ssrRenderComponent(unref(Textarea), {
              id: "notes",
              "data-oods-component": "Textarea",
              defaultValue: "Call before renewal.",
              help: "Visible to account managers.",
              label: "Notes",
              rows: 4,
              onChange: handleNotesChange
            }, null, _parent2, _scopeId));
          } else {
            return [
              createVNode(unref(Text), {
                id: "showcase-title",
                "data-oods-component": "Text",
                as: "h1",
                content: "Foundation v1 account operations",
                size: "lg",
                weight: "semibold"
              }),
              createVNode(unref(Badge), {
                id: "showcase-status",
                "data-oods-component": "Badge",
                content: "Past due",
                emphasis: "solid",
                icon: "!",
                tone: "critical"
              }),
              createVNode(unref(Banner), {
                id: "showcase-banner",
                "data-oods-component": "Banner",
                detail: "Update the card to keep service active.",
                dismissLabel: "Dismiss payment warning",
                title: "Payment failed",
                tone: "critical",
                onDismiss: handleDismiss
              }),
              createVNode(unref(Button), {
                id: "showcase-action",
                "data-oods-component": "Button",
                content: "Save changes",
                intent: "primary",
                size: "md",
                onActivate: handleActivate
              }),
              createVNode(unref(Button), {
                id: "showcase-secondary-action",
                "data-oods-component": "Button",
                content: "Cancel",
                intent: "secondary",
                size: "sm",
                onActivate: handleSecondaryActivate
              }),
              createVNode(unref(Card), {
                id: "showcase-profile",
                "data-oods-component": "Card",
                as: "section",
                elevated: ""
              }, {
                default: withCtx(() => [
                  createVNode(unref(Text), {
                    id: "showcase-profile-copy",
                    "data-oods-component": "Text",
                    as: "p",
                    content: "Canonical fields retain their labels, help, and validation state."
                  })
                ]),
                _: 1
              }),
              createVNode(unref(Checkbox), {
                id: "marketing",
                "data-oods-component": "Checkbox",
                defaultChecked: "",
                help: "Choose whether to subscribe.",
                label: "Product updates",
                required: "",
                onChange: handleMarketingChange
              }),
              createVNode(unref(DatePicker), {
                id: "renewal",
                "data-oods-component": "DatePicker",
                defaultValue: "2026-09-30",
                label: "Renewal date",
                max: "2026-12-31",
                min: "2026-09-01",
                step: 1,
                onChange: handleRenewalChange
              }),
              createVNode(unref(Grid), {
                id: "showcase-grid",
                "data-oods-component": "Grid",
                align: "stretch",
                gap: "md",
                minColumnWidth: "14rem"
              }, {
                default: withCtx(() => [
                  createVNode(unref(Text), {
                    id: "showcase-grid-primary",
                    "data-oods-component": "Text",
                    as: "strong",
                    content: "Account health"
                  }),
                  createVNode(unref(Text), {
                    id: "showcase-grid-secondary",
                    "data-oods-component": "Text",
                    as: "span",
                    content: "Recent changes"
                  })
                ]),
                _: 1
              }),
              createVNode(unref(Input), {
                id: "email",
                "data-oods-component": "Input",
                defaultValue: "invalid",
                help: "Use a work address.",
                label: "Email",
                required: "",
                type: "email",
                validation: { "state": "error", "message": "Enter a valid email." },
                onChange: handleEmailChange
              }),
              createVNode(unref(Select), {
                id: "plan",
                "data-oods-component": "Select",
                defaultValue: "pro",
                label: "Plan",
                options: [{ "value": "basic", "label": "Basic" }, { "value": "pro", "label": "Pro" }, { "value": "enterprise", "label": "Enterprise" }],
                onChange: handlePlanChange
              }),
              createVNode(unref(Table), {
                id: "showcase-subscriptions",
                "data-oods-component": "Table",
                caption: "Subscriptions",
                columns: [{ "key": "name", "label": "Name" }, { "key": "plan", "label": "Plan" }, { "key": "status", "label": "Status" }],
                density: "compact",
                rows: [{ "id": "sub-1", "name": "Northwind", "plan": "Enterprise", "status": "Active" }, { "id": "sub-2", "name": "Contoso", "plan": "Pro", "status": "Past due" }],
                selectable: "",
                onRowActivate: handleRowActivate
              }),
              createVNode(unref(Tabs), {
                id: "showcase-tabs",
                "data-oods-component": "Tabs",
                ariaLabel: "Account sections",
                defaultSelectedId: "overview",
                items: [{ "id": "overview", "label": "Overview", "panel": "Account health and recent changes." }, { "id": "billing", "label": "Billing", "panel": "Invoices and payment methods." }, { "id": "security", "label": "Security", "panel": "Security settings.", "disabled": true }],
                overflowLabel: "More sections",
                size: "md",
                onChange: handleTabChange
              }),
              createVNode(unref(Textarea), {
                id: "notes",
                "data-oods-component": "Textarea",
                defaultValue: "Call before renewal.",
                help: "Visible to account managers.",
                label: "Notes",
                rows: 4,
                onChange: handleNotesChange
              })
            ];
          }
        }),
        _: 1
      }, _parent));
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("src/GeneratedUI.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
async function main() {
  const html = await renderToString(createSSRApp(_sfc_main));
  process.stdout.write(JSON.stringify({ html }));
}
void main();
//# sourceMappingURL=ssr.js.map
