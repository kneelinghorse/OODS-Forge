import type { DomainRecord } from './store';

export const sampleData: DomainRecord[] = [
  {
    "status": "invited",
    "state_history": [
      {
        "from": null,
        "to": "invited",
        "at": "2026-09-01T12:00:00.000Z",
        "event": "created",
        "title": "Created",
        "reason": "Record created"
      }
    ],
    "allowed_transitions": [],
    "created_at": "2026-09-01T12:00:00.000Z",
    "updated_at": "2026-09-01T12:00:00.000Z",
    "last_event": "created",
    "last_event_at": "2026-09-01T12:00:00.000Z",
    "tags": [],
    "tag_count": 0,
    "tag_metadata": [],
    "address_roles": [
      "home"
    ],
    "default_address_role": "home",
    "addresses": [
      {
        "role": "home",
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
        "theme": {
          "mode": "system"
        },
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
      "theme",
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
    "user_id": "user-001",
    "name": "Anika Bhatt",
    "preferred_name": "",
    "description": "Anika Bhatt",
    "primary_email": "anika.bhatt@example.com",
    "role": "end_user",
    "timezone": "UTC"
  },
  {
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
    "created_at": "2026-09-01T12:00:00.000Z",
    "updated_at": "2026-09-01T12:00:00.000Z",
    "last_event": "created",
    "last_event_at": "2026-09-01T12:00:00.000Z",
    "tags": [],
    "tag_count": 0,
    "tag_metadata": [],
    "address_roles": [
      "home"
    ],
    "default_address_role": "home",
    "addresses": [
      {
        "role": "home",
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
        "theme": {
          "mode": "system"
        },
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
      "theme",
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
    "user_id": "user-002",
    "name": "Milo Chen",
    "preferred_name": "",
    "description": "Milo Chen",
    "primary_email": "milo.chen@example.com",
    "role": "admin",
    "timezone": "UTC"
  },
  {
    "status": "suspended",
    "state_history": [
      {
        "from": null,
        "to": "suspended",
        "at": "2026-09-01T12:00:00.000Z",
        "event": "created",
        "title": "Created",
        "reason": "Record created"
      }
    ],
    "allowed_transitions": [],
    "created_at": "2026-09-01T12:00:00.000Z",
    "updated_at": "2026-09-01T12:00:00.000Z",
    "last_event": "created",
    "last_event_at": "2026-09-01T12:00:00.000Z",
    "tags": [],
    "tag_count": 0,
    "tag_metadata": [],
    "address_roles": [
      "home"
    ],
    "default_address_role": "home",
    "addresses": [
      {
        "role": "home",
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
        "theme": {
          "mode": "system"
        },
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
      "theme",
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
    "user_id": "user-003",
    "name": "Sunny Rivera",
    "preferred_name": "",
    "description": "Sunny Rivera",
    "primary_email": "sunny.rivera@example.com",
    "role": "owner",
    "timezone": "UTC"
  },
  {
    "status": "deactivated",
    "state_history": [
      {
        "from": null,
        "to": "deactivated",
        "at": "2026-09-01T12:00:00.000Z",
        "event": "created",
        "title": "Created",
        "reason": "Record created"
      }
    ],
    "allowed_transitions": [],
    "created_at": "2026-09-01T12:00:00.000Z",
    "updated_at": "2026-09-01T12:00:00.000Z",
    "last_event": "created",
    "last_event_at": "2026-09-01T12:00:00.000Z",
    "tags": [],
    "tag_count": 0,
    "tag_metadata": [],
    "address_roles": [
      "home"
    ],
    "default_address_role": "home",
    "addresses": [
      {
        "role": "home",
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
        "theme": {
          "mode": "system"
        },
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
      "theme",
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
    "user_id": "user-004",
    "name": "Ada Morgan",
    "preferred_name": "",
    "description": "Ada Morgan",
    "primary_email": "ada.morgan@example.com",
    "role": "billing",
    "timezone": "UTC"
  },
  {
    "status": "invited",
    "state_history": [
      {
        "from": null,
        "to": "invited",
        "at": "2026-09-01T12:00:00.000Z",
        "event": "created",
        "title": "Created",
        "reason": "Record created"
      }
    ],
    "allowed_transitions": [],
    "created_at": "2026-09-01T12:00:00.000Z",
    "updated_at": "2026-09-01T12:00:00.000Z",
    "last_event": "created",
    "last_event_at": "2026-09-01T12:00:00.000Z",
    "tags": [],
    "tag_count": 0,
    "tag_metadata": [],
    "address_roles": [
      "home"
    ],
    "default_address_role": "home",
    "addresses": [
      {
        "role": "home",
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
        "theme": {
          "mode": "system"
        },
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
      "theme",
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
    "user_id": "user-005",
    "name": "Theo Reed",
    "preferred_name": "",
    "description": "Theo Reed",
    "primary_email": "theo.reed@example.com",
    "role": "end_user",
    "timezone": "UTC"
  },
  {
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
    "created_at": "2026-09-01T12:00:00.000Z",
    "updated_at": "2026-09-01T12:00:00.000Z",
    "last_event": "created",
    "last_event_at": "2026-09-01T12:00:00.000Z",
    "tags": [],
    "tag_count": 0,
    "tag_metadata": [],
    "address_roles": [
      "home"
    ],
    "default_address_role": "home",
    "addresses": [
      {
        "role": "home",
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
        "theme": {
          "mode": "system"
        },
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
      "theme",
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
    "user_id": "user-006",
    "name": "Lena Park",
    "preferred_name": "",
    "description": "Lena Park",
    "primary_email": "lena.park@example.com",
    "role": "admin",
    "timezone": "UTC"
  },
  {
    "status": "suspended",
    "state_history": [
      {
        "from": null,
        "to": "suspended",
        "at": "2026-09-01T12:00:00.000Z",
        "event": "created",
        "title": "Created",
        "reason": "Record created"
      }
    ],
    "allowed_transitions": [],
    "created_at": "2026-09-01T12:00:00.000Z",
    "updated_at": "2026-09-01T12:00:00.000Z",
    "last_event": "created",
    "last_event_at": "2026-09-01T12:00:00.000Z",
    "tags": [],
    "tag_count": 0,
    "tag_metadata": [],
    "address_roles": [
      "home"
    ],
    "default_address_role": "home",
    "addresses": [
      {
        "role": "home",
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
        "theme": {
          "mode": "system"
        },
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
      "theme",
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
    "user_id": "user-007",
    "name": "Sam Brooks",
    "preferred_name": "",
    "description": "Sam Brooks",
    "primary_email": "sam.brooks@example.com",
    "role": "owner",
    "timezone": "UTC"
  },
  {
    "status": "deactivated",
    "state_history": [
      {
        "from": null,
        "to": "deactivated",
        "at": "2026-09-01T12:00:00.000Z",
        "event": "created",
        "title": "Created",
        "reason": "Record created"
      }
    ],
    "allowed_transitions": [],
    "created_at": "2026-09-01T12:00:00.000Z",
    "updated_at": "2026-09-01T12:00:00.000Z",
    "last_event": "created",
    "last_event_at": "2026-09-01T12:00:00.000Z",
    "tags": [],
    "tag_count": 0,
    "tag_metadata": [],
    "address_roles": [
      "home"
    ],
    "default_address_role": "home",
    "addresses": [
      {
        "role": "home",
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
        "theme": {
          "mode": "system"
        },
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
      "theme",
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
    "user_id": "user-008",
    "name": "Nora Patel",
    "preferred_name": "",
    "description": "Nora Patel",
    "primary_email": "nora.patel@example.com",
    "role": "billing",
    "timezone": "UTC"
  },
  {
    "status": "invited",
    "state_history": [
      {
        "from": null,
        "to": "invited",
        "at": "2026-09-01T12:00:00.000Z",
        "event": "created",
        "title": "Created",
        "reason": "Record created"
      }
    ],
    "allowed_transitions": [],
    "created_at": "2026-09-01T12:00:00.000Z",
    "updated_at": "2026-09-01T12:00:00.000Z",
    "last_event": "created",
    "last_event_at": "2026-09-01T12:00:00.000Z",
    "tags": [],
    "tag_count": 0,
    "tag_metadata": [],
    "address_roles": [
      "home"
    ],
    "default_address_role": "home",
    "addresses": [
      {
        "role": "home",
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
        "theme": {
          "mode": "system"
        },
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
      "theme",
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
    "user_id": "user-009",
    "name": "Eli Stone",
    "preferred_name": "",
    "description": "Eli Stone",
    "primary_email": "eli.stone@example.com",
    "role": "end_user",
    "timezone": "UTC"
  },
  {
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
    "created_at": "2026-09-01T12:00:00.000Z",
    "updated_at": "2026-09-01T12:00:00.000Z",
    "last_event": "created",
    "last_event_at": "2026-09-01T12:00:00.000Z",
    "tags": [],
    "tag_count": 0,
    "tag_metadata": [],
    "address_roles": [
      "home"
    ],
    "default_address_role": "home",
    "addresses": [
      {
        "role": "home",
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
        "theme": {
          "mode": "system"
        },
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
      "theme",
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
    "user_id": "user-010",
    "name": "Maya Silva",
    "preferred_name": "",
    "description": "Maya Silva",
    "primary_email": "maya.silva@example.com",
    "role": "admin",
    "timezone": "UTC"
  }
];
