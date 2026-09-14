import type { DomainRecord } from './store';

export const sampleData: DomainRecord[] = [
  {
    "label": "Northstar Workspace",
    "description": "Northstar Workspace",
    "placeholder": "",
    "status": "prospect",
    "state_history": [
      {
        "from": null,
        "to": "prospect",
        "at": "2026-09-01T12:00:00.000Z",
        "event": "created",
        "title": "Created",
        "reason": "Record created"
      }
    ],
    "allowed_transitions": [],
    "owner_id": "owner-001",
    "owner_type": "parent_organization",
    "ownership_role": "",
    "ownership_transferred_at": "2026-09-01T12:00:00.000Z",
    "created_at": "2026-09-01T12:00:00.000Z",
    "updated_at": "2026-09-01T12:00:00.000Z",
    "last_event": "created",
    "last_event_at": "2026-09-01T12:00:00.000Z",
    "tags": [],
    "tag_count": 0,
    "tag_metadata": [],
    "address_roles": [
      "headquarters"
    ],
    "default_address_role": "headquarters",
    "addresses": [
      {
        "role": "headquarters",
        "address": {
          "countryCode": "US",
          "addressLines": [
            "100 Main Street"
          ],
          "locality": "Springfield",
          "administrativeArea": "IL",
          "postalCode": "62701"
        },
        "isDefault": true,
        "updatedAt": "2026-09-08T12:00:00.000Z"
      }
    ],
    "preference_document": {
      "version": "2.0.0",
      "preferences": {
        "notifications": {
          "mention": {
            "email": true,
            "push": true
          }
        },
        "display": {},
        "privacy": {}
      },
      "metadata": {
        "schemaVersion": "2.0.0",
        "lastUpdated": "2026-09-01T12:00:00.000Z",
        "source": "system",
        "migrationApplied": []
      }
    },
    "preference_metadata": {
      "schemaVersion": "2.0.0",
      "lastUpdated": "2026-09-01T12:00:00.000Z",
      "source": "system",
      "migrationApplied": []
    },
    "preference_version": "2.0.0",
    "preference_namespaces": [
      "notifications",
      "display",
      "privacy"
    ],
    "preference_mutations": 0,
    "role_catalog": [
      {
        "id": "11111111-1111-4111-8111-111111111111",
        "name": "Owner",
        "description": "Full tenant access + invoice approval (R21.2 Table 1)."
      },
      {
        "id": "22222222-2222-4222-8222-222222222222",
        "name": "Approver",
        "description": "Workflow approver for compliance-sensitive documents."
      },
      {
        "id": "33333333-3333-4333-8333-333333333333",
        "name": "Editor",
        "description": "Contributor allowed to create + update documents in scope."
      }
    ],
    "permission_catalog": [],
    "role_permissions": {},
    "membership_records": [],
    "role_hierarchy_edges": [],
    "session_roles": [],
    "channel_catalog": [
      {
        "id": "44444444-dddd-4ddd-8ddd-dddddddddddd",
        "name": "Primary Email (SMTP)",
        "type": "email"
      },
      {
        "id": "55555555-eeee-4eee-8eee-eeeeeeeeeeee",
        "name": "Twilio SMS",
        "type": "sms"
      },
      {
        "id": "66666666-ffff-4fff-8fff-ffffffffffff",
        "name": "FCM Push",
        "type": "push"
      },
      {
        "id": "77777777-0000-4000-8000-000000000000",
        "name": "Realtime In-App",
        "type": "in_app"
      }
    ],
    "template_catalog": [
      {
        "id": "88888888-1111-4111-8111-111111111111",
        "name": "Welcome Email",
        "channelType": "email",
        "subject": "Welcome to OODS Foundry, {{firstName}}!",
        "body": "Hi {{firstName}},\n\nThanks for joining {{workspaceName}}. Activate your account using {{activationLink}}.",
        "variables": [
          "firstName",
          "workspaceName",
          "activationLink"
        ],
        "locale": "en-US"
      },
      {
        "id": "99999999-2222-4222-8222-222222222222",
        "name": "Password Reset Email",
        "channelType": "email",
        "subject": "Reset your OODS Foundry password",
        "body": "Hello {{firstName}},\n\nWe received a request to reset your password. Use this code: {{resetCode}}.",
        "variables": [
          "firstName",
          "resetCode"
        ],
        "locale": "en-US"
      },
      {
        "id": "aaaaaaa1-3333-4333-8333-333333333333",
        "name": "In-App Notification",
        "channelType": "in_app",
        "subject": "New document shared with you",
        "body": "{{actorName}} shared \"{{documentName}}\" with you. Review it before {{dueDate}}.",
        "variables": [
          "actorName",
          "documentName",
          "dueDate"
        ],
        "locale": "en-US"
      }
    ],
    "delivery_policies": [],
    "messages": [],
    "conversations": [],
    "message_statuses": [],
    "organization_id": "organization-001",
    "domain": "northstar.example.com",
    "plan_tier": "free",
    "billing_status": "good_standing",
    "industry": "",
    "employee_count": 1,
    "billing_contact_email": "anika.bhatt@example.com",
    "data_residency": "us"
  },
  {
    "label": "Harbor Workspace",
    "description": "Harbor Workspace",
    "placeholder": "",
    "status": "onboarding",
    "state_history": [
      {
        "from": null,
        "to": "onboarding",
        "at": "2026-09-01T12:00:00.000Z",
        "event": "created",
        "title": "Created",
        "reason": "Record created"
      }
    ],
    "allowed_transitions": [],
    "owner_id": "owner-002",
    "owner_type": "reseller",
    "ownership_role": "",
    "ownership_transferred_at": "2026-09-01T12:00:00.000Z",
    "created_at": "2026-09-01T12:00:00.000Z",
    "updated_at": "2026-09-01T12:00:00.000Z",
    "last_event": "created",
    "last_event_at": "2026-09-01T12:00:00.000Z",
    "tags": [],
    "tag_count": 0,
    "tag_metadata": [],
    "address_roles": [
      "headquarters"
    ],
    "default_address_role": "headquarters",
    "addresses": [
      {
        "role": "headquarters",
        "address": {
          "countryCode": "US",
          "addressLines": [
            "101 Main Street"
          ],
          "locality": "Springfield",
          "administrativeArea": "IL",
          "postalCode": "62701"
        },
        "isDefault": true,
        "updatedAt": "2026-09-08T12:00:00.000Z"
      }
    ],
    "preference_document": {
      "version": "2.0.0",
      "preferences": {
        "notifications": {
          "mention": {
            "email": true,
            "push": true
          }
        },
        "display": {},
        "privacy": {}
      },
      "metadata": {
        "schemaVersion": "2.0.0",
        "lastUpdated": "2026-09-01T12:00:00.000Z",
        "source": "system",
        "migrationApplied": []
      }
    },
    "preference_metadata": {
      "schemaVersion": "2.0.0",
      "lastUpdated": "2026-09-01T12:00:00.000Z",
      "source": "system",
      "migrationApplied": []
    },
    "preference_version": "2.0.0",
    "preference_namespaces": [
      "notifications",
      "display",
      "privacy"
    ],
    "preference_mutations": 0,
    "role_catalog": [
      {
        "id": "11111111-1111-4111-8111-111111111111",
        "name": "Owner",
        "description": "Full tenant access + invoice approval (R21.2 Table 1)."
      },
      {
        "id": "22222222-2222-4222-8222-222222222222",
        "name": "Approver",
        "description": "Workflow approver for compliance-sensitive documents."
      },
      {
        "id": "33333333-3333-4333-8333-333333333333",
        "name": "Editor",
        "description": "Contributor allowed to create + update documents in scope."
      }
    ],
    "permission_catalog": [],
    "role_permissions": {},
    "membership_records": [],
    "role_hierarchy_edges": [],
    "session_roles": [],
    "channel_catalog": [
      {
        "id": "44444444-dddd-4ddd-8ddd-dddddddddddd",
        "name": "Primary Email (SMTP)",
        "type": "email"
      },
      {
        "id": "55555555-eeee-4eee-8eee-eeeeeeeeeeee",
        "name": "Twilio SMS",
        "type": "sms"
      },
      {
        "id": "66666666-ffff-4fff-8fff-ffffffffffff",
        "name": "FCM Push",
        "type": "push"
      },
      {
        "id": "77777777-0000-4000-8000-000000000000",
        "name": "Realtime In-App",
        "type": "in_app"
      }
    ],
    "template_catalog": [
      {
        "id": "88888888-1111-4111-8111-111111111111",
        "name": "Welcome Email",
        "channelType": "email",
        "subject": "Welcome to OODS Foundry, {{firstName}}!",
        "body": "Hi {{firstName}},\n\nThanks for joining {{workspaceName}}. Activate your account using {{activationLink}}.",
        "variables": [
          "firstName",
          "workspaceName",
          "activationLink"
        ],
        "locale": "en-US"
      },
      {
        "id": "99999999-2222-4222-8222-222222222222",
        "name": "Password Reset Email",
        "channelType": "email",
        "subject": "Reset your OODS Foundry password",
        "body": "Hello {{firstName}},\n\nWe received a request to reset your password. Use this code: {{resetCode}}.",
        "variables": [
          "firstName",
          "resetCode"
        ],
        "locale": "en-US"
      },
      {
        "id": "aaaaaaa1-3333-4333-8333-333333333333",
        "name": "In-App Notification",
        "channelType": "in_app",
        "subject": "New document shared with you",
        "body": "{{actorName}} shared \"{{documentName}}\" with you. Review it before {{dueDate}}.",
        "variables": [
          "actorName",
          "documentName",
          "dueDate"
        ],
        "locale": "en-US"
      }
    ],
    "delivery_policies": [],
    "messages": [],
    "conversations": [],
    "message_statuses": [],
    "organization_id": "organization-002",
    "domain": "harbor.example.com",
    "plan_tier": "growth",
    "billing_status": "past_due",
    "industry": "",
    "employee_count": 2,
    "billing_contact_email": "milo.chen@example.com",
    "data_residency": "eu"
  },
  {
    "label": "Cedar Workspace",
    "description": "Cedar Workspace",
    "placeholder": "",
    "status": "active",
    "state_history": [
      {
        "from": null,
        "to": "active",
        "at": "2026-09-01T12:00:00.000Z",
        "event": "created",
        "title": "Created",
        "reason": "Record created"
      }
    ],
    "allowed_transitions": [],
    "owner_id": "owner-003",
    "owner_type": "platform",
    "ownership_role": "",
    "ownership_transferred_at": "2026-09-01T12:00:00.000Z",
    "created_at": "2026-09-01T12:00:00.000Z",
    "updated_at": "2026-09-01T12:00:00.000Z",
    "last_event": "created",
    "last_event_at": "2026-09-01T12:00:00.000Z",
    "tags": [],
    "tag_count": 0,
    "tag_metadata": [],
    "address_roles": [
      "headquarters"
    ],
    "default_address_role": "headquarters",
    "addresses": [
      {
        "role": "headquarters",
        "address": {
          "countryCode": "US",
          "addressLines": [
            "102 Main Street"
          ],
          "locality": "Springfield",
          "administrativeArea": "IL",
          "postalCode": "62701"
        },
        "isDefault": true,
        "updatedAt": "2026-09-08T12:00:00.000Z"
      }
    ],
    "preference_document": {
      "version": "2.0.0",
      "preferences": {
        "notifications": {
          "mention": {
            "email": true,
            "push": true
          }
        },
        "display": {},
        "privacy": {}
      },
      "metadata": {
        "schemaVersion": "2.0.0",
        "lastUpdated": "2026-09-01T12:00:00.000Z",
        "source": "system",
        "migrationApplied": []
      }
    },
    "preference_metadata": {
      "schemaVersion": "2.0.0",
      "lastUpdated": "2026-09-01T12:00:00.000Z",
      "source": "system",
      "migrationApplied": []
    },
    "preference_version": "2.0.0",
    "preference_namespaces": [
      "notifications",
      "display",
      "privacy"
    ],
    "preference_mutations": 0,
    "role_catalog": [
      {
        "id": "11111111-1111-4111-8111-111111111111",
        "name": "Owner",
        "description": "Full tenant access + invoice approval (R21.2 Table 1)."
      },
      {
        "id": "22222222-2222-4222-8222-222222222222",
        "name": "Approver",
        "description": "Workflow approver for compliance-sensitive documents."
      },
      {
        "id": "33333333-3333-4333-8333-333333333333",
        "name": "Editor",
        "description": "Contributor allowed to create + update documents in scope."
      }
    ],
    "permission_catalog": [],
    "role_permissions": {},
    "membership_records": [],
    "role_hierarchy_edges": [],
    "session_roles": [],
    "channel_catalog": [
      {
        "id": "44444444-dddd-4ddd-8ddd-dddddddddddd",
        "name": "Primary Email (SMTP)",
        "type": "email"
      },
      {
        "id": "55555555-eeee-4eee-8eee-eeeeeeeeeeee",
        "name": "Twilio SMS",
        "type": "sms"
      },
      {
        "id": "66666666-ffff-4fff-8fff-ffffffffffff",
        "name": "FCM Push",
        "type": "push"
      },
      {
        "id": "77777777-0000-4000-8000-000000000000",
        "name": "Realtime In-App",
        "type": "in_app"
      }
    ],
    "template_catalog": [
      {
        "id": "88888888-1111-4111-8111-111111111111",
        "name": "Welcome Email",
        "channelType": "email",
        "subject": "Welcome to OODS Foundry, {{firstName}}!",
        "body": "Hi {{firstName}},\n\nThanks for joining {{workspaceName}}. Activate your account using {{activationLink}}.",
        "variables": [
          "firstName",
          "workspaceName",
          "activationLink"
        ],
        "locale": "en-US"
      },
      {
        "id": "99999999-2222-4222-8222-222222222222",
        "name": "Password Reset Email",
        "channelType": "email",
        "subject": "Reset your OODS Foundry password",
        "body": "Hello {{firstName}},\n\nWe received a request to reset your password. Use this code: {{resetCode}}.",
        "variables": [
          "firstName",
          "resetCode"
        ],
        "locale": "en-US"
      },
      {
        "id": "aaaaaaa1-3333-4333-8333-333333333333",
        "name": "In-App Notification",
        "channelType": "in_app",
        "subject": "New document shared with you",
        "body": "{{actorName}} shared \"{{documentName}}\" with you. Review it before {{dueDate}}.",
        "variables": [
          "actorName",
          "documentName",
          "dueDate"
        ],
        "locale": "en-US"
      }
    ],
    "delivery_policies": [],
    "messages": [],
    "conversations": [],
    "message_statuses": [],
    "organization_id": "organization-003",
    "domain": "cedar.example.com",
    "plan_tier": "enterprise",
    "billing_status": "unpaid",
    "industry": "",
    "employee_count": 3,
    "billing_contact_email": "sunny.rivera@example.com",
    "data_residency": "apac"
  },
  {
    "label": "Summit Workspace",
    "description": "Summit Workspace",
    "placeholder": "",
    "status": "churned",
    "state_history": [
      {
        "from": null,
        "to": "churned",
        "at": "2026-09-01T12:00:00.000Z",
        "event": "created",
        "title": "Created",
        "reason": "Record created"
      }
    ],
    "allowed_transitions": [],
    "owner_id": "owner-004",
    "owner_type": "parent_organization",
    "ownership_role": "",
    "ownership_transferred_at": "2026-09-01T12:00:00.000Z",
    "created_at": "2026-09-01T12:00:00.000Z",
    "updated_at": "2026-09-01T12:00:00.000Z",
    "last_event": "created",
    "last_event_at": "2026-09-01T12:00:00.000Z",
    "tags": [],
    "tag_count": 0,
    "tag_metadata": [],
    "address_roles": [
      "headquarters"
    ],
    "default_address_role": "headquarters",
    "addresses": [
      {
        "role": "headquarters",
        "address": {
          "countryCode": "US",
          "addressLines": [
            "103 Main Street"
          ],
          "locality": "Springfield",
          "administrativeArea": "IL",
          "postalCode": "62701"
        },
        "isDefault": true,
        "updatedAt": "2026-09-08T12:00:00.000Z"
      }
    ],
    "preference_document": {
      "version": "2.0.0",
      "preferences": {
        "notifications": {
          "mention": {
            "email": true,
            "push": true
          }
        },
        "display": {},
        "privacy": {}
      },
      "metadata": {
        "schemaVersion": "2.0.0",
        "lastUpdated": "2026-09-01T12:00:00.000Z",
        "source": "system",
        "migrationApplied": []
      }
    },
    "preference_metadata": {
      "schemaVersion": "2.0.0",
      "lastUpdated": "2026-09-01T12:00:00.000Z",
      "source": "system",
      "migrationApplied": []
    },
    "preference_version": "2.0.0",
    "preference_namespaces": [
      "notifications",
      "display",
      "privacy"
    ],
    "preference_mutations": 0,
    "role_catalog": [
      {
        "id": "11111111-1111-4111-8111-111111111111",
        "name": "Owner",
        "description": "Full tenant access + invoice approval (R21.2 Table 1)."
      },
      {
        "id": "22222222-2222-4222-8222-222222222222",
        "name": "Approver",
        "description": "Workflow approver for compliance-sensitive documents."
      },
      {
        "id": "33333333-3333-4333-8333-333333333333",
        "name": "Editor",
        "description": "Contributor allowed to create + update documents in scope."
      }
    ],
    "permission_catalog": [],
    "role_permissions": {},
    "membership_records": [],
    "role_hierarchy_edges": [],
    "session_roles": [],
    "channel_catalog": [
      {
        "id": "44444444-dddd-4ddd-8ddd-dddddddddddd",
        "name": "Primary Email (SMTP)",
        "type": "email"
      },
      {
        "id": "55555555-eeee-4eee-8eee-eeeeeeeeeeee",
        "name": "Twilio SMS",
        "type": "sms"
      },
      {
        "id": "66666666-ffff-4fff-8fff-ffffffffffff",
        "name": "FCM Push",
        "type": "push"
      },
      {
        "id": "77777777-0000-4000-8000-000000000000",
        "name": "Realtime In-App",
        "type": "in_app"
      }
    ],
    "template_catalog": [
      {
        "id": "88888888-1111-4111-8111-111111111111",
        "name": "Welcome Email",
        "channelType": "email",
        "subject": "Welcome to OODS Foundry, {{firstName}}!",
        "body": "Hi {{firstName}},\n\nThanks for joining {{workspaceName}}. Activate your account using {{activationLink}}.",
        "variables": [
          "firstName",
          "workspaceName",
          "activationLink"
        ],
        "locale": "en-US"
      },
      {
        "id": "99999999-2222-4222-8222-222222222222",
        "name": "Password Reset Email",
        "channelType": "email",
        "subject": "Reset your OODS Foundry password",
        "body": "Hello {{firstName}},\n\nWe received a request to reset your password. Use this code: {{resetCode}}.",
        "variables": [
          "firstName",
          "resetCode"
        ],
        "locale": "en-US"
      },
      {
        "id": "aaaaaaa1-3333-4333-8333-333333333333",
        "name": "In-App Notification",
        "channelType": "in_app",
        "subject": "New document shared with you",
        "body": "{{actorName}} shared \"{{documentName}}\" with you. Review it before {{dueDate}}.",
        "variables": [
          "actorName",
          "documentName",
          "dueDate"
        ],
        "locale": "en-US"
      }
    ],
    "delivery_policies": [],
    "messages": [],
    "conversations": [],
    "message_statuses": [],
    "organization_id": "organization-004",
    "domain": "summit.example.com",
    "plan_tier": "free",
    "billing_status": "suspended",
    "industry": "",
    "employee_count": 4,
    "billing_contact_email": "ada.morgan@example.com",
    "data_residency": "latam"
  },
  {
    "label": "Orchard Workspace",
    "description": "Orchard Workspace",
    "placeholder": "",
    "status": "prospect",
    "state_history": [
      {
        "from": null,
        "to": "prospect",
        "at": "2026-09-01T12:00:00.000Z",
        "event": "created",
        "title": "Created",
        "reason": "Record created"
      }
    ],
    "allowed_transitions": [],
    "owner_id": "owner-005",
    "owner_type": "reseller",
    "ownership_role": "",
    "ownership_transferred_at": "2026-09-01T12:00:00.000Z",
    "created_at": "2026-09-01T12:00:00.000Z",
    "updated_at": "2026-09-01T12:00:00.000Z",
    "last_event": "created",
    "last_event_at": "2026-09-01T12:00:00.000Z",
    "tags": [],
    "tag_count": 0,
    "tag_metadata": [],
    "address_roles": [
      "headquarters"
    ],
    "default_address_role": "headquarters",
    "addresses": [
      {
        "role": "headquarters",
        "address": {
          "countryCode": "US",
          "addressLines": [
            "104 Main Street"
          ],
          "locality": "Springfield",
          "administrativeArea": "IL",
          "postalCode": "62701"
        },
        "isDefault": true,
        "updatedAt": "2026-09-08T12:00:00.000Z"
      }
    ],
    "preference_document": {
      "version": "2.0.0",
      "preferences": {
        "notifications": {
          "mention": {
            "email": true,
            "push": true
          }
        },
        "display": {},
        "privacy": {}
      },
      "metadata": {
        "schemaVersion": "2.0.0",
        "lastUpdated": "2026-09-01T12:00:00.000Z",
        "source": "system",
        "migrationApplied": []
      }
    },
    "preference_metadata": {
      "schemaVersion": "2.0.0",
      "lastUpdated": "2026-09-01T12:00:00.000Z",
      "source": "system",
      "migrationApplied": []
    },
    "preference_version": "2.0.0",
    "preference_namespaces": [
      "notifications",
      "display",
      "privacy"
    ],
    "preference_mutations": 0,
    "role_catalog": [
      {
        "id": "11111111-1111-4111-8111-111111111111",
        "name": "Owner",
        "description": "Full tenant access + invoice approval (R21.2 Table 1)."
      },
      {
        "id": "22222222-2222-4222-8222-222222222222",
        "name": "Approver",
        "description": "Workflow approver for compliance-sensitive documents."
      },
      {
        "id": "33333333-3333-4333-8333-333333333333",
        "name": "Editor",
        "description": "Contributor allowed to create + update documents in scope."
      }
    ],
    "permission_catalog": [],
    "role_permissions": {},
    "membership_records": [],
    "role_hierarchy_edges": [],
    "session_roles": [],
    "channel_catalog": [
      {
        "id": "44444444-dddd-4ddd-8ddd-dddddddddddd",
        "name": "Primary Email (SMTP)",
        "type": "email"
      },
      {
        "id": "55555555-eeee-4eee-8eee-eeeeeeeeeeee",
        "name": "Twilio SMS",
        "type": "sms"
      },
      {
        "id": "66666666-ffff-4fff-8fff-ffffffffffff",
        "name": "FCM Push",
        "type": "push"
      },
      {
        "id": "77777777-0000-4000-8000-000000000000",
        "name": "Realtime In-App",
        "type": "in_app"
      }
    ],
    "template_catalog": [
      {
        "id": "88888888-1111-4111-8111-111111111111",
        "name": "Welcome Email",
        "channelType": "email",
        "subject": "Welcome to OODS Foundry, {{firstName}}!",
        "body": "Hi {{firstName}},\n\nThanks for joining {{workspaceName}}. Activate your account using {{activationLink}}.",
        "variables": [
          "firstName",
          "workspaceName",
          "activationLink"
        ],
        "locale": "en-US"
      },
      {
        "id": "99999999-2222-4222-8222-222222222222",
        "name": "Password Reset Email",
        "channelType": "email",
        "subject": "Reset your OODS Foundry password",
        "body": "Hello {{firstName}},\n\nWe received a request to reset your password. Use this code: {{resetCode}}.",
        "variables": [
          "firstName",
          "resetCode"
        ],
        "locale": "en-US"
      },
      {
        "id": "aaaaaaa1-3333-4333-8333-333333333333",
        "name": "In-App Notification",
        "channelType": "in_app",
        "subject": "New document shared with you",
        "body": "{{actorName}} shared \"{{documentName}}\" with you. Review it before {{dueDate}}.",
        "variables": [
          "actorName",
          "documentName",
          "dueDate"
        ],
        "locale": "en-US"
      }
    ],
    "delivery_policies": [],
    "messages": [],
    "conversations": [],
    "message_statuses": [],
    "organization_id": "organization-005",
    "domain": "orchard.example.com",
    "plan_tier": "growth",
    "billing_status": "good_standing",
    "industry": "",
    "employee_count": 5,
    "billing_contact_email": "theo.reed@example.com",
    "data_residency": "us"
  },
  {
    "label": "Willow Workspace",
    "description": "Willow Workspace",
    "placeholder": "",
    "status": "onboarding",
    "state_history": [
      {
        "from": null,
        "to": "onboarding",
        "at": "2026-09-01T12:00:00.000Z",
        "event": "created",
        "title": "Created",
        "reason": "Record created"
      }
    ],
    "allowed_transitions": [],
    "owner_id": "owner-006",
    "owner_type": "platform",
    "ownership_role": "",
    "ownership_transferred_at": "2026-09-01T12:00:00.000Z",
    "created_at": "2026-09-01T12:00:00.000Z",
    "updated_at": "2026-09-01T12:00:00.000Z",
    "last_event": "created",
    "last_event_at": "2026-09-01T12:00:00.000Z",
    "tags": [],
    "tag_count": 0,
    "tag_metadata": [],
    "address_roles": [
      "headquarters"
    ],
    "default_address_role": "headquarters",
    "addresses": [
      {
        "role": "headquarters",
        "address": {
          "countryCode": "US",
          "addressLines": [
            "105 Main Street"
          ],
          "locality": "Springfield",
          "administrativeArea": "IL",
          "postalCode": "62701"
        },
        "isDefault": true,
        "updatedAt": "2026-09-08T12:00:00.000Z"
      }
    ],
    "preference_document": {
      "version": "2.0.0",
      "preferences": {
        "notifications": {
          "mention": {
            "email": true,
            "push": true
          }
        },
        "display": {},
        "privacy": {}
      },
      "metadata": {
        "schemaVersion": "2.0.0",
        "lastUpdated": "2026-09-01T12:00:00.000Z",
        "source": "system",
        "migrationApplied": []
      }
    },
    "preference_metadata": {
      "schemaVersion": "2.0.0",
      "lastUpdated": "2026-09-01T12:00:00.000Z",
      "source": "system",
      "migrationApplied": []
    },
    "preference_version": "2.0.0",
    "preference_namespaces": [
      "notifications",
      "display",
      "privacy"
    ],
    "preference_mutations": 0,
    "role_catalog": [
      {
        "id": "11111111-1111-4111-8111-111111111111",
        "name": "Owner",
        "description": "Full tenant access + invoice approval (R21.2 Table 1)."
      },
      {
        "id": "22222222-2222-4222-8222-222222222222",
        "name": "Approver",
        "description": "Workflow approver for compliance-sensitive documents."
      },
      {
        "id": "33333333-3333-4333-8333-333333333333",
        "name": "Editor",
        "description": "Contributor allowed to create + update documents in scope."
      }
    ],
    "permission_catalog": [],
    "role_permissions": {},
    "membership_records": [],
    "role_hierarchy_edges": [],
    "session_roles": [],
    "channel_catalog": [
      {
        "id": "44444444-dddd-4ddd-8ddd-dddddddddddd",
        "name": "Primary Email (SMTP)",
        "type": "email"
      },
      {
        "id": "55555555-eeee-4eee-8eee-eeeeeeeeeeee",
        "name": "Twilio SMS",
        "type": "sms"
      },
      {
        "id": "66666666-ffff-4fff-8fff-ffffffffffff",
        "name": "FCM Push",
        "type": "push"
      },
      {
        "id": "77777777-0000-4000-8000-000000000000",
        "name": "Realtime In-App",
        "type": "in_app"
      }
    ],
    "template_catalog": [
      {
        "id": "88888888-1111-4111-8111-111111111111",
        "name": "Welcome Email",
        "channelType": "email",
        "subject": "Welcome to OODS Foundry, {{firstName}}!",
        "body": "Hi {{firstName}},\n\nThanks for joining {{workspaceName}}. Activate your account using {{activationLink}}.",
        "variables": [
          "firstName",
          "workspaceName",
          "activationLink"
        ],
        "locale": "en-US"
      },
      {
        "id": "99999999-2222-4222-8222-222222222222",
        "name": "Password Reset Email",
        "channelType": "email",
        "subject": "Reset your OODS Foundry password",
        "body": "Hello {{firstName}},\n\nWe received a request to reset your password. Use this code: {{resetCode}}.",
        "variables": [
          "firstName",
          "resetCode"
        ],
        "locale": "en-US"
      },
      {
        "id": "aaaaaaa1-3333-4333-8333-333333333333",
        "name": "In-App Notification",
        "channelType": "in_app",
        "subject": "New document shared with you",
        "body": "{{actorName}} shared \"{{documentName}}\" with you. Review it before {{dueDate}}.",
        "variables": [
          "actorName",
          "documentName",
          "dueDate"
        ],
        "locale": "en-US"
      }
    ],
    "delivery_policies": [],
    "messages": [],
    "conversations": [],
    "message_statuses": [],
    "organization_id": "organization-006",
    "domain": "willow.example.com",
    "plan_tier": "enterprise",
    "billing_status": "past_due",
    "industry": "",
    "employee_count": 6,
    "billing_contact_email": "lena.park@example.com",
    "data_residency": "eu"
  },
  {
    "label": "Atlas Workspace",
    "description": "Atlas Workspace",
    "placeholder": "",
    "status": "active",
    "state_history": [
      {
        "from": null,
        "to": "active",
        "at": "2026-09-01T12:00:00.000Z",
        "event": "created",
        "title": "Created",
        "reason": "Record created"
      }
    ],
    "allowed_transitions": [],
    "owner_id": "owner-007",
    "owner_type": "parent_organization",
    "ownership_role": "",
    "ownership_transferred_at": "2026-09-01T12:00:00.000Z",
    "created_at": "2026-09-01T12:00:00.000Z",
    "updated_at": "2026-09-01T12:00:00.000Z",
    "last_event": "created",
    "last_event_at": "2026-09-01T12:00:00.000Z",
    "tags": [],
    "tag_count": 0,
    "tag_metadata": [],
    "address_roles": [
      "headquarters"
    ],
    "default_address_role": "headquarters",
    "addresses": [
      {
        "role": "headquarters",
        "address": {
          "countryCode": "US",
          "addressLines": [
            "106 Main Street"
          ],
          "locality": "Springfield",
          "administrativeArea": "IL",
          "postalCode": "62701"
        },
        "isDefault": true,
        "updatedAt": "2026-09-08T12:00:00.000Z"
      }
    ],
    "preference_document": {
      "version": "2.0.0",
      "preferences": {
        "notifications": {
          "mention": {
            "email": true,
            "push": true
          }
        },
        "display": {},
        "privacy": {}
      },
      "metadata": {
        "schemaVersion": "2.0.0",
        "lastUpdated": "2026-09-01T12:00:00.000Z",
        "source": "system",
        "migrationApplied": []
      }
    },
    "preference_metadata": {
      "schemaVersion": "2.0.0",
      "lastUpdated": "2026-09-01T12:00:00.000Z",
      "source": "system",
      "migrationApplied": []
    },
    "preference_version": "2.0.0",
    "preference_namespaces": [
      "notifications",
      "display",
      "privacy"
    ],
    "preference_mutations": 0,
    "role_catalog": [
      {
        "id": "11111111-1111-4111-8111-111111111111",
        "name": "Owner",
        "description": "Full tenant access + invoice approval (R21.2 Table 1)."
      },
      {
        "id": "22222222-2222-4222-8222-222222222222",
        "name": "Approver",
        "description": "Workflow approver for compliance-sensitive documents."
      },
      {
        "id": "33333333-3333-4333-8333-333333333333",
        "name": "Editor",
        "description": "Contributor allowed to create + update documents in scope."
      }
    ],
    "permission_catalog": [],
    "role_permissions": {},
    "membership_records": [],
    "role_hierarchy_edges": [],
    "session_roles": [],
    "channel_catalog": [
      {
        "id": "44444444-dddd-4ddd-8ddd-dddddddddddd",
        "name": "Primary Email (SMTP)",
        "type": "email"
      },
      {
        "id": "55555555-eeee-4eee-8eee-eeeeeeeeeeee",
        "name": "Twilio SMS",
        "type": "sms"
      },
      {
        "id": "66666666-ffff-4fff-8fff-ffffffffffff",
        "name": "FCM Push",
        "type": "push"
      },
      {
        "id": "77777777-0000-4000-8000-000000000000",
        "name": "Realtime In-App",
        "type": "in_app"
      }
    ],
    "template_catalog": [
      {
        "id": "88888888-1111-4111-8111-111111111111",
        "name": "Welcome Email",
        "channelType": "email",
        "subject": "Welcome to OODS Foundry, {{firstName}}!",
        "body": "Hi {{firstName}},\n\nThanks for joining {{workspaceName}}. Activate your account using {{activationLink}}.",
        "variables": [
          "firstName",
          "workspaceName",
          "activationLink"
        ],
        "locale": "en-US"
      },
      {
        "id": "99999999-2222-4222-8222-222222222222",
        "name": "Password Reset Email",
        "channelType": "email",
        "subject": "Reset your OODS Foundry password",
        "body": "Hello {{firstName}},\n\nWe received a request to reset your password. Use this code: {{resetCode}}.",
        "variables": [
          "firstName",
          "resetCode"
        ],
        "locale": "en-US"
      },
      {
        "id": "aaaaaaa1-3333-4333-8333-333333333333",
        "name": "In-App Notification",
        "channelType": "in_app",
        "subject": "New document shared with you",
        "body": "{{actorName}} shared \"{{documentName}}\" with you. Review it before {{dueDate}}.",
        "variables": [
          "actorName",
          "documentName",
          "dueDate"
        ],
        "locale": "en-US"
      }
    ],
    "delivery_policies": [],
    "messages": [],
    "conversations": [],
    "message_statuses": [],
    "organization_id": "organization-007",
    "domain": "atlas.example.com",
    "plan_tier": "free",
    "billing_status": "unpaid",
    "industry": "",
    "employee_count": 7,
    "billing_contact_email": "sam.brooks@example.com",
    "data_residency": "apac"
  },
  {
    "label": "Meadow Workspace",
    "description": "Meadow Workspace",
    "placeholder": "",
    "status": "churned",
    "state_history": [
      {
        "from": null,
        "to": "churned",
        "at": "2026-09-01T12:00:00.000Z",
        "event": "created",
        "title": "Created",
        "reason": "Record created"
      }
    ],
    "allowed_transitions": [],
    "owner_id": "owner-008",
    "owner_type": "reseller",
    "ownership_role": "",
    "ownership_transferred_at": "2026-09-01T12:00:00.000Z",
    "created_at": "2026-09-01T12:00:00.000Z",
    "updated_at": "2026-09-01T12:00:00.000Z",
    "last_event": "created",
    "last_event_at": "2026-09-01T12:00:00.000Z",
    "tags": [],
    "tag_count": 0,
    "tag_metadata": [],
    "address_roles": [
      "headquarters"
    ],
    "default_address_role": "headquarters",
    "addresses": [
      {
        "role": "headquarters",
        "address": {
          "countryCode": "US",
          "addressLines": [
            "107 Main Street"
          ],
          "locality": "Springfield",
          "administrativeArea": "IL",
          "postalCode": "62701"
        },
        "isDefault": true,
        "updatedAt": "2026-09-08T12:00:00.000Z"
      }
    ],
    "preference_document": {
      "version": "2.0.0",
      "preferences": {
        "notifications": {
          "mention": {
            "email": true,
            "push": true
          }
        },
        "display": {},
        "privacy": {}
      },
      "metadata": {
        "schemaVersion": "2.0.0",
        "lastUpdated": "2026-09-01T12:00:00.000Z",
        "source": "system",
        "migrationApplied": []
      }
    },
    "preference_metadata": {
      "schemaVersion": "2.0.0",
      "lastUpdated": "2026-09-01T12:00:00.000Z",
      "source": "system",
      "migrationApplied": []
    },
    "preference_version": "2.0.0",
    "preference_namespaces": [
      "notifications",
      "display",
      "privacy"
    ],
    "preference_mutations": 0,
    "role_catalog": [
      {
        "id": "11111111-1111-4111-8111-111111111111",
        "name": "Owner",
        "description": "Full tenant access + invoice approval (R21.2 Table 1)."
      },
      {
        "id": "22222222-2222-4222-8222-222222222222",
        "name": "Approver",
        "description": "Workflow approver for compliance-sensitive documents."
      },
      {
        "id": "33333333-3333-4333-8333-333333333333",
        "name": "Editor",
        "description": "Contributor allowed to create + update documents in scope."
      }
    ],
    "permission_catalog": [],
    "role_permissions": {},
    "membership_records": [],
    "role_hierarchy_edges": [],
    "session_roles": [],
    "channel_catalog": [
      {
        "id": "44444444-dddd-4ddd-8ddd-dddddddddddd",
        "name": "Primary Email (SMTP)",
        "type": "email"
      },
      {
        "id": "55555555-eeee-4eee-8eee-eeeeeeeeeeee",
        "name": "Twilio SMS",
        "type": "sms"
      },
      {
        "id": "66666666-ffff-4fff-8fff-ffffffffffff",
        "name": "FCM Push",
        "type": "push"
      },
      {
        "id": "77777777-0000-4000-8000-000000000000",
        "name": "Realtime In-App",
        "type": "in_app"
      }
    ],
    "template_catalog": [
      {
        "id": "88888888-1111-4111-8111-111111111111",
        "name": "Welcome Email",
        "channelType": "email",
        "subject": "Welcome to OODS Foundry, {{firstName}}!",
        "body": "Hi {{firstName}},\n\nThanks for joining {{workspaceName}}. Activate your account using {{activationLink}}.",
        "variables": [
          "firstName",
          "workspaceName",
          "activationLink"
        ],
        "locale": "en-US"
      },
      {
        "id": "99999999-2222-4222-8222-222222222222",
        "name": "Password Reset Email",
        "channelType": "email",
        "subject": "Reset your OODS Foundry password",
        "body": "Hello {{firstName}},\n\nWe received a request to reset your password. Use this code: {{resetCode}}.",
        "variables": [
          "firstName",
          "resetCode"
        ],
        "locale": "en-US"
      },
      {
        "id": "aaaaaaa1-3333-4333-8333-333333333333",
        "name": "In-App Notification",
        "channelType": "in_app",
        "subject": "New document shared with you",
        "body": "{{actorName}} shared \"{{documentName}}\" with you. Review it before {{dueDate}}.",
        "variables": [
          "actorName",
          "documentName",
          "dueDate"
        ],
        "locale": "en-US"
      }
    ],
    "delivery_policies": [],
    "messages": [],
    "conversations": [],
    "message_statuses": [],
    "organization_id": "organization-008",
    "domain": "meadow.example.com",
    "plan_tier": "growth",
    "billing_status": "suspended",
    "industry": "",
    "employee_count": 8,
    "billing_contact_email": "nora.patel@example.com",
    "data_residency": "latam"
  },
  {
    "label": "Juniper Workspace",
    "description": "Juniper Workspace",
    "placeholder": "",
    "status": "prospect",
    "state_history": [
      {
        "from": null,
        "to": "prospect",
        "at": "2026-09-01T12:00:00.000Z",
        "event": "created",
        "title": "Created",
        "reason": "Record created"
      }
    ],
    "allowed_transitions": [],
    "owner_id": "owner-009",
    "owner_type": "platform",
    "ownership_role": "",
    "ownership_transferred_at": "2026-09-01T12:00:00.000Z",
    "created_at": "2026-09-01T12:00:00.000Z",
    "updated_at": "2026-09-01T12:00:00.000Z",
    "last_event": "created",
    "last_event_at": "2026-09-01T12:00:00.000Z",
    "tags": [],
    "tag_count": 0,
    "tag_metadata": [],
    "address_roles": [
      "headquarters"
    ],
    "default_address_role": "headquarters",
    "addresses": [
      {
        "role": "headquarters",
        "address": {
          "countryCode": "US",
          "addressLines": [
            "108 Main Street"
          ],
          "locality": "Springfield",
          "administrativeArea": "IL",
          "postalCode": "62701"
        },
        "isDefault": true,
        "updatedAt": "2026-09-08T12:00:00.000Z"
      }
    ],
    "preference_document": {
      "version": "2.0.0",
      "preferences": {
        "notifications": {
          "mention": {
            "email": true,
            "push": true
          }
        },
        "display": {},
        "privacy": {}
      },
      "metadata": {
        "schemaVersion": "2.0.0",
        "lastUpdated": "2026-09-01T12:00:00.000Z",
        "source": "system",
        "migrationApplied": []
      }
    },
    "preference_metadata": {
      "schemaVersion": "2.0.0",
      "lastUpdated": "2026-09-01T12:00:00.000Z",
      "source": "system",
      "migrationApplied": []
    },
    "preference_version": "2.0.0",
    "preference_namespaces": [
      "notifications",
      "display",
      "privacy"
    ],
    "preference_mutations": 0,
    "role_catalog": [
      {
        "id": "11111111-1111-4111-8111-111111111111",
        "name": "Owner",
        "description": "Full tenant access + invoice approval (R21.2 Table 1)."
      },
      {
        "id": "22222222-2222-4222-8222-222222222222",
        "name": "Approver",
        "description": "Workflow approver for compliance-sensitive documents."
      },
      {
        "id": "33333333-3333-4333-8333-333333333333",
        "name": "Editor",
        "description": "Contributor allowed to create + update documents in scope."
      }
    ],
    "permission_catalog": [],
    "role_permissions": {},
    "membership_records": [],
    "role_hierarchy_edges": [],
    "session_roles": [],
    "channel_catalog": [
      {
        "id": "44444444-dddd-4ddd-8ddd-dddddddddddd",
        "name": "Primary Email (SMTP)",
        "type": "email"
      },
      {
        "id": "55555555-eeee-4eee-8eee-eeeeeeeeeeee",
        "name": "Twilio SMS",
        "type": "sms"
      },
      {
        "id": "66666666-ffff-4fff-8fff-ffffffffffff",
        "name": "FCM Push",
        "type": "push"
      },
      {
        "id": "77777777-0000-4000-8000-000000000000",
        "name": "Realtime In-App",
        "type": "in_app"
      }
    ],
    "template_catalog": [
      {
        "id": "88888888-1111-4111-8111-111111111111",
        "name": "Welcome Email",
        "channelType": "email",
        "subject": "Welcome to OODS Foundry, {{firstName}}!",
        "body": "Hi {{firstName}},\n\nThanks for joining {{workspaceName}}. Activate your account using {{activationLink}}.",
        "variables": [
          "firstName",
          "workspaceName",
          "activationLink"
        ],
        "locale": "en-US"
      },
      {
        "id": "99999999-2222-4222-8222-222222222222",
        "name": "Password Reset Email",
        "channelType": "email",
        "subject": "Reset your OODS Foundry password",
        "body": "Hello {{firstName}},\n\nWe received a request to reset your password. Use this code: {{resetCode}}.",
        "variables": [
          "firstName",
          "resetCode"
        ],
        "locale": "en-US"
      },
      {
        "id": "aaaaaaa1-3333-4333-8333-333333333333",
        "name": "In-App Notification",
        "channelType": "in_app",
        "subject": "New document shared with you",
        "body": "{{actorName}} shared \"{{documentName}}\" with you. Review it before {{dueDate}}.",
        "variables": [
          "actorName",
          "documentName",
          "dueDate"
        ],
        "locale": "en-US"
      }
    ],
    "delivery_policies": [],
    "messages": [],
    "conversations": [],
    "message_statuses": [],
    "organization_id": "organization-009",
    "domain": "juniper.example.com",
    "plan_tier": "enterprise",
    "billing_status": "good_standing",
    "industry": "",
    "employee_count": 9,
    "billing_contact_email": "eli.stone@example.com",
    "data_residency": "us"
  },
  {
    "label": "Brook Workspace",
    "description": "Brook Workspace",
    "placeholder": "",
    "status": "onboarding",
    "state_history": [
      {
        "from": null,
        "to": "onboarding",
        "at": "2026-09-01T12:00:00.000Z",
        "event": "created",
        "title": "Created",
        "reason": "Record created"
      }
    ],
    "allowed_transitions": [],
    "owner_id": "owner-010",
    "owner_type": "parent_organization",
    "ownership_role": "",
    "ownership_transferred_at": "2026-09-01T12:00:00.000Z",
    "created_at": "2026-09-01T12:00:00.000Z",
    "updated_at": "2026-09-01T12:00:00.000Z",
    "last_event": "created",
    "last_event_at": "2026-09-01T12:00:00.000Z",
    "tags": [],
    "tag_count": 0,
    "tag_metadata": [],
    "address_roles": [
      "headquarters"
    ],
    "default_address_role": "headquarters",
    "addresses": [
      {
        "role": "headquarters",
        "address": {
          "countryCode": "US",
          "addressLines": [
            "109 Main Street"
          ],
          "locality": "Springfield",
          "administrativeArea": "IL",
          "postalCode": "62701"
        },
        "isDefault": true,
        "updatedAt": "2026-09-08T12:00:00.000Z"
      }
    ],
    "preference_document": {
      "version": "2.0.0",
      "preferences": {
        "notifications": {
          "mention": {
            "email": true,
            "push": true
          }
        },
        "display": {},
        "privacy": {}
      },
      "metadata": {
        "schemaVersion": "2.0.0",
        "lastUpdated": "2026-09-01T12:00:00.000Z",
        "source": "system",
        "migrationApplied": []
      }
    },
    "preference_metadata": {
      "schemaVersion": "2.0.0",
      "lastUpdated": "2026-09-01T12:00:00.000Z",
      "source": "system",
      "migrationApplied": []
    },
    "preference_version": "2.0.0",
    "preference_namespaces": [
      "notifications",
      "display",
      "privacy"
    ],
    "preference_mutations": 0,
    "role_catalog": [
      {
        "id": "11111111-1111-4111-8111-111111111111",
        "name": "Owner",
        "description": "Full tenant access + invoice approval (R21.2 Table 1)."
      },
      {
        "id": "22222222-2222-4222-8222-222222222222",
        "name": "Approver",
        "description": "Workflow approver for compliance-sensitive documents."
      },
      {
        "id": "33333333-3333-4333-8333-333333333333",
        "name": "Editor",
        "description": "Contributor allowed to create + update documents in scope."
      }
    ],
    "permission_catalog": [],
    "role_permissions": {},
    "membership_records": [],
    "role_hierarchy_edges": [],
    "session_roles": [],
    "channel_catalog": [
      {
        "id": "44444444-dddd-4ddd-8ddd-dddddddddddd",
        "name": "Primary Email (SMTP)",
        "type": "email"
      },
      {
        "id": "55555555-eeee-4eee-8eee-eeeeeeeeeeee",
        "name": "Twilio SMS",
        "type": "sms"
      },
      {
        "id": "66666666-ffff-4fff-8fff-ffffffffffff",
        "name": "FCM Push",
        "type": "push"
      },
      {
        "id": "77777777-0000-4000-8000-000000000000",
        "name": "Realtime In-App",
        "type": "in_app"
      }
    ],
    "template_catalog": [
      {
        "id": "88888888-1111-4111-8111-111111111111",
        "name": "Welcome Email",
        "channelType": "email",
        "subject": "Welcome to OODS Foundry, {{firstName}}!",
        "body": "Hi {{firstName}},\n\nThanks for joining {{workspaceName}}. Activate your account using {{activationLink}}.",
        "variables": [
          "firstName",
          "workspaceName",
          "activationLink"
        ],
        "locale": "en-US"
      },
      {
        "id": "99999999-2222-4222-8222-222222222222",
        "name": "Password Reset Email",
        "channelType": "email",
        "subject": "Reset your OODS Foundry password",
        "body": "Hello {{firstName}},\n\nWe received a request to reset your password. Use this code: {{resetCode}}.",
        "variables": [
          "firstName",
          "resetCode"
        ],
        "locale": "en-US"
      },
      {
        "id": "aaaaaaa1-3333-4333-8333-333333333333",
        "name": "In-App Notification",
        "channelType": "in_app",
        "subject": "New document shared with you",
        "body": "{{actorName}} shared \"{{documentName}}\" with you. Review it before {{dueDate}}.",
        "variables": [
          "actorName",
          "documentName",
          "dueDate"
        ],
        "locale": "en-US"
      }
    ],
    "delivery_policies": [],
    "messages": [],
    "conversations": [],
    "message_statuses": [],
    "organization_id": "organization-010",
    "domain": "brook.example.com",
    "plan_tier": "free",
    "billing_status": "past_due",
    "industry": "",
    "employee_count": 10,
    "billing_contact_email": "maya.silva@example.com",
    "data_residency": "eu"
  }
];
