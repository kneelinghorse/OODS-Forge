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
        "reason": "Sample record created"
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
        "updatedAt": "2026-09-01T12:00:00.000Z"
      }
    ],
    "preference_document": "",
    "preference_metadata": "",
    "preference_version": "preference-version sample 1",
    "preference_namespaces": [],
    "preference_mutations": 0,
    "role_catalog": [],
    "permission_catalog": [],
    "role_permissions": "",
    "membership_records": [],
    "role_hierarchy_edges": [],
    "session_roles": [],
    "channel_catalog": [],
    "template_catalog": [],
    "delivery_policies": [],
    "messages": [],
    "conversations": [],
    "message_statuses": [],
    "user_id": "user-001",
    "name": "User 01",
    "preferred_name": "",
    "description": "",
    "primary_email": "customer1@example.com",
    "role": "end_user",
    "timezone": ""
  },
  {
    "status": "active",
    "state_history": [
      {
        "from": null,
        "to": "active",
        "at": "2026-09-01T12:00:00.000Z",
        "event": "created",
        "reason": "Sample record created"
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
        "updatedAt": "2026-09-01T12:00:00.000Z"
      }
    ],
    "preference_document": "",
    "preference_metadata": "",
    "preference_version": "preference-version sample 2",
    "preference_namespaces": [],
    "preference_mutations": 0,
    "role_catalog": [],
    "permission_catalog": [],
    "role_permissions": "",
    "membership_records": [],
    "role_hierarchy_edges": [],
    "session_roles": [],
    "channel_catalog": [],
    "template_catalog": [],
    "delivery_policies": [],
    "messages": [],
    "conversations": [],
    "message_statuses": [],
    "user_id": "user-002",
    "name": "User 02",
    "preferred_name": "",
    "description": "",
    "primary_email": "customer2@example.com",
    "role": "admin",
    "timezone": ""
  },
  {
    "status": "suspended",
    "state_history": [
      {
        "from": null,
        "to": "suspended",
        "at": "2026-09-01T12:00:00.000Z",
        "event": "created",
        "reason": "Sample record created"
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
        "updatedAt": "2026-09-01T12:00:00.000Z"
      }
    ],
    "preference_document": "",
    "preference_metadata": "",
    "preference_version": "preference-version sample 3",
    "preference_namespaces": [],
    "preference_mutations": 0,
    "role_catalog": [],
    "permission_catalog": [],
    "role_permissions": "",
    "membership_records": [],
    "role_hierarchy_edges": [],
    "session_roles": [],
    "channel_catalog": [],
    "template_catalog": [],
    "delivery_policies": [],
    "messages": [],
    "conversations": [],
    "message_statuses": [],
    "user_id": "user-003",
    "name": "User 03",
    "preferred_name": "",
    "description": "",
    "primary_email": "customer3@example.com",
    "role": "owner",
    "timezone": ""
  },
  {
    "status": "deactivated",
    "state_history": [
      {
        "from": null,
        "to": "deactivated",
        "at": "2026-09-01T12:00:00.000Z",
        "event": "created",
        "reason": "Sample record created"
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
        "updatedAt": "2026-09-01T12:00:00.000Z"
      }
    ],
    "preference_document": "",
    "preference_metadata": "",
    "preference_version": "preference-version sample 4",
    "preference_namespaces": [],
    "preference_mutations": 0,
    "role_catalog": [],
    "permission_catalog": [],
    "role_permissions": "",
    "membership_records": [],
    "role_hierarchy_edges": [],
    "session_roles": [],
    "channel_catalog": [],
    "template_catalog": [],
    "delivery_policies": [],
    "messages": [],
    "conversations": [],
    "message_statuses": [],
    "user_id": "user-004",
    "name": "User 04",
    "preferred_name": "",
    "description": "",
    "primary_email": "customer4@example.com",
    "role": "billing",
    "timezone": ""
  },
  {
    "status": "invited",
    "state_history": [
      {
        "from": null,
        "to": "invited",
        "at": "2026-09-01T12:00:00.000Z",
        "event": "created",
        "reason": "Sample record created"
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
        "updatedAt": "2026-09-01T12:00:00.000Z"
      }
    ],
    "preference_document": "",
    "preference_metadata": "",
    "preference_version": "preference-version sample 5",
    "preference_namespaces": [],
    "preference_mutations": 0,
    "role_catalog": [],
    "permission_catalog": [],
    "role_permissions": "",
    "membership_records": [],
    "role_hierarchy_edges": [],
    "session_roles": [],
    "channel_catalog": [],
    "template_catalog": [],
    "delivery_policies": [],
    "messages": [],
    "conversations": [],
    "message_statuses": [],
    "user_id": "user-005",
    "name": "User 05",
    "preferred_name": "",
    "description": "",
    "primary_email": "customer5@example.com",
    "role": "end_user",
    "timezone": ""
  },
  {
    "status": "active",
    "state_history": [
      {
        "from": null,
        "to": "active",
        "at": "2026-09-01T12:00:00.000Z",
        "event": "created",
        "reason": "Sample record created"
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
        "updatedAt": "2026-09-01T12:00:00.000Z"
      }
    ],
    "preference_document": "",
    "preference_metadata": "",
    "preference_version": "preference-version sample 6",
    "preference_namespaces": [],
    "preference_mutations": 0,
    "role_catalog": [],
    "permission_catalog": [],
    "role_permissions": "",
    "membership_records": [],
    "role_hierarchy_edges": [],
    "session_roles": [],
    "channel_catalog": [],
    "template_catalog": [],
    "delivery_policies": [],
    "messages": [],
    "conversations": [],
    "message_statuses": [],
    "user_id": "user-006",
    "name": "User 06",
    "preferred_name": "",
    "description": "",
    "primary_email": "customer6@example.com",
    "role": "admin",
    "timezone": ""
  },
  {
    "status": "suspended",
    "state_history": [
      {
        "from": null,
        "to": "suspended",
        "at": "2026-09-01T12:00:00.000Z",
        "event": "created",
        "reason": "Sample record created"
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
        "updatedAt": "2026-09-01T12:00:00.000Z"
      }
    ],
    "preference_document": "",
    "preference_metadata": "",
    "preference_version": "preference-version sample 7",
    "preference_namespaces": [],
    "preference_mutations": 0,
    "role_catalog": [],
    "permission_catalog": [],
    "role_permissions": "",
    "membership_records": [],
    "role_hierarchy_edges": [],
    "session_roles": [],
    "channel_catalog": [],
    "template_catalog": [],
    "delivery_policies": [],
    "messages": [],
    "conversations": [],
    "message_statuses": [],
    "user_id": "user-007",
    "name": "User 07",
    "preferred_name": "",
    "description": "",
    "primary_email": "customer7@example.com",
    "role": "owner",
    "timezone": ""
  },
  {
    "status": "deactivated",
    "state_history": [
      {
        "from": null,
        "to": "deactivated",
        "at": "2026-09-01T12:00:00.000Z",
        "event": "created",
        "reason": "Sample record created"
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
        "updatedAt": "2026-09-01T12:00:00.000Z"
      }
    ],
    "preference_document": "",
    "preference_metadata": "",
    "preference_version": "preference-version sample 8",
    "preference_namespaces": [],
    "preference_mutations": 0,
    "role_catalog": [],
    "permission_catalog": [],
    "role_permissions": "",
    "membership_records": [],
    "role_hierarchy_edges": [],
    "session_roles": [],
    "channel_catalog": [],
    "template_catalog": [],
    "delivery_policies": [],
    "messages": [],
    "conversations": [],
    "message_statuses": [],
    "user_id": "user-008",
    "name": "User 08",
    "preferred_name": "",
    "description": "",
    "primary_email": "customer8@example.com",
    "role": "billing",
    "timezone": ""
  },
  {
    "status": "invited",
    "state_history": [
      {
        "from": null,
        "to": "invited",
        "at": "2026-09-01T12:00:00.000Z",
        "event": "created",
        "reason": "Sample record created"
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
        "updatedAt": "2026-09-01T12:00:00.000Z"
      }
    ],
    "preference_document": "",
    "preference_metadata": "",
    "preference_version": "preference-version sample 9",
    "preference_namespaces": [],
    "preference_mutations": 0,
    "role_catalog": [],
    "permission_catalog": [],
    "role_permissions": "",
    "membership_records": [],
    "role_hierarchy_edges": [],
    "session_roles": [],
    "channel_catalog": [],
    "template_catalog": [],
    "delivery_policies": [],
    "messages": [],
    "conversations": [],
    "message_statuses": [],
    "user_id": "user-009",
    "name": "User 09",
    "preferred_name": "",
    "description": "",
    "primary_email": "customer9@example.com",
    "role": "end_user",
    "timezone": ""
  },
  {
    "status": "active",
    "state_history": [
      {
        "from": null,
        "to": "active",
        "at": "2026-09-01T12:00:00.000Z",
        "event": "created",
        "reason": "Sample record created"
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
        "updatedAt": "2026-09-01T12:00:00.000Z"
      }
    ],
    "preference_document": "",
    "preference_metadata": "",
    "preference_version": "preference-version sample 10",
    "preference_namespaces": [],
    "preference_mutations": 0,
    "role_catalog": [],
    "permission_catalog": [],
    "role_permissions": "",
    "membership_records": [],
    "role_hierarchy_edges": [],
    "session_roles": [],
    "channel_catalog": [],
    "template_catalog": [],
    "delivery_policies": [],
    "messages": [],
    "conversations": [],
    "message_statuses": [],
    "user_id": "user-010",
    "name": "User 10",
    "preferred_name": "",
    "description": "",
    "primary_email": "customer10@example.com",
    "role": "admin",
    "timezone": ""
  }
];
