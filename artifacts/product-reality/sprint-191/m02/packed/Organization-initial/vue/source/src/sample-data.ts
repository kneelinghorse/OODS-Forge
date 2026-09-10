import type { DomainRecord } from './store';

export const sampleData: DomainRecord[] = [
  {
    "label": "",
    "description": "",
    "placeholder": "",
    "status": "prospect",
    "state_history": [
      {
        "from": null,
        "to": "prospect",
        "at": "2026-09-01T12:00:00.000Z",
        "event": "created",
        "reason": "Sample record created"
      }
    ],
    "allowed_transitions": [],
    "owner_id": "",
    "owner_type": "",
    "ownership_role": "",
    "ownership_transferred_at": "2026-01-01T00:00:00.000Z",
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
        "updatedAt": "2026-09-01T12:00:00.000Z"
      }
    ],
    "preference_document": "",
    "preference_metadata": "",
    "preference_version": "",
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
    "organization_id": "organization-001",
    "domain": "",
    "plan_tier": "free",
    "billing_status": "good_standing",
    "industry": "",
    "employee_count": 0,
    "billing_contact_email": "customer1@example.com",
    "data_residency": "us"
  },
  {
    "label": "",
    "description": "",
    "placeholder": "",
    "status": "onboarding",
    "state_history": [
      {
        "from": null,
        "to": "onboarding",
        "at": "2026-09-01T12:00:00.000Z",
        "event": "created",
        "reason": "Sample record created"
      }
    ],
    "allowed_transitions": [],
    "owner_id": "",
    "owner_type": "",
    "ownership_role": "",
    "ownership_transferred_at": "2026-01-01T00:00:00.000Z",
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
        "updatedAt": "2026-09-01T12:00:00.000Z"
      }
    ],
    "preference_document": "",
    "preference_metadata": "",
    "preference_version": "",
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
    "organization_id": "organization-002",
    "domain": "",
    "plan_tier": "growth",
    "billing_status": "past_due",
    "industry": "",
    "employee_count": 0,
    "billing_contact_email": "customer2@example.com",
    "data_residency": "eu"
  },
  {
    "label": "",
    "description": "",
    "placeholder": "",
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
    "owner_id": "",
    "owner_type": "",
    "ownership_role": "",
    "ownership_transferred_at": "2026-01-01T00:00:00.000Z",
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
        "updatedAt": "2026-09-01T12:00:00.000Z"
      }
    ],
    "preference_document": "",
    "preference_metadata": "",
    "preference_version": "",
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
    "organization_id": "organization-003",
    "domain": "",
    "plan_tier": "enterprise",
    "billing_status": "unpaid",
    "industry": "",
    "employee_count": 0,
    "billing_contact_email": "customer3@example.com",
    "data_residency": "apac"
  },
  {
    "label": "",
    "description": "",
    "placeholder": "",
    "status": "churned",
    "state_history": [
      {
        "from": null,
        "to": "churned",
        "at": "2026-09-01T12:00:00.000Z",
        "event": "created",
        "reason": "Sample record created"
      }
    ],
    "allowed_transitions": [],
    "owner_id": "",
    "owner_type": "",
    "ownership_role": "",
    "ownership_transferred_at": "2026-01-01T00:00:00.000Z",
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
        "updatedAt": "2026-09-01T12:00:00.000Z"
      }
    ],
    "preference_document": "",
    "preference_metadata": "",
    "preference_version": "",
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
    "organization_id": "organization-004",
    "domain": "",
    "plan_tier": "free",
    "billing_status": "suspended",
    "industry": "",
    "employee_count": 0,
    "billing_contact_email": "customer4@example.com",
    "data_residency": "latam"
  },
  {
    "label": "",
    "description": "",
    "placeholder": "",
    "status": "prospect",
    "state_history": [
      {
        "from": null,
        "to": "prospect",
        "at": "2026-09-01T12:00:00.000Z",
        "event": "created",
        "reason": "Sample record created"
      }
    ],
    "allowed_transitions": [],
    "owner_id": "",
    "owner_type": "",
    "ownership_role": "",
    "ownership_transferred_at": "2026-01-01T00:00:00.000Z",
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
        "updatedAt": "2026-09-01T12:00:00.000Z"
      }
    ],
    "preference_document": "",
    "preference_metadata": "",
    "preference_version": "",
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
    "organization_id": "organization-005",
    "domain": "",
    "plan_tier": "growth",
    "billing_status": "good_standing",
    "industry": "",
    "employee_count": 0,
    "billing_contact_email": "customer5@example.com",
    "data_residency": "us"
  },
  {
    "label": "",
    "description": "",
    "placeholder": "",
    "status": "onboarding",
    "state_history": [
      {
        "from": null,
        "to": "onboarding",
        "at": "2026-09-01T12:00:00.000Z",
        "event": "created",
        "reason": "Sample record created"
      }
    ],
    "allowed_transitions": [],
    "owner_id": "",
    "owner_type": "",
    "ownership_role": "",
    "ownership_transferred_at": "2026-01-01T00:00:00.000Z",
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
        "updatedAt": "2026-09-01T12:00:00.000Z"
      }
    ],
    "preference_document": "",
    "preference_metadata": "",
    "preference_version": "",
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
    "organization_id": "organization-006",
    "domain": "",
    "plan_tier": "enterprise",
    "billing_status": "past_due",
    "industry": "",
    "employee_count": 0,
    "billing_contact_email": "customer6@example.com",
    "data_residency": "eu"
  },
  {
    "label": "",
    "description": "",
    "placeholder": "",
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
    "owner_id": "",
    "owner_type": "",
    "ownership_role": "",
    "ownership_transferred_at": "2026-01-01T00:00:00.000Z",
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
        "updatedAt": "2026-09-01T12:00:00.000Z"
      }
    ],
    "preference_document": "",
    "preference_metadata": "",
    "preference_version": "",
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
    "organization_id": "organization-007",
    "domain": "",
    "plan_tier": "free",
    "billing_status": "unpaid",
    "industry": "",
    "employee_count": 0,
    "billing_contact_email": "customer7@example.com",
    "data_residency": "apac"
  },
  {
    "label": "",
    "description": "",
    "placeholder": "",
    "status": "churned",
    "state_history": [
      {
        "from": null,
        "to": "churned",
        "at": "2026-09-01T12:00:00.000Z",
        "event": "created",
        "reason": "Sample record created"
      }
    ],
    "allowed_transitions": [],
    "owner_id": "",
    "owner_type": "",
    "ownership_role": "",
    "ownership_transferred_at": "2026-01-01T00:00:00.000Z",
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
        "updatedAt": "2026-09-01T12:00:00.000Z"
      }
    ],
    "preference_document": "",
    "preference_metadata": "",
    "preference_version": "",
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
    "organization_id": "organization-008",
    "domain": "",
    "plan_tier": "growth",
    "billing_status": "suspended",
    "industry": "",
    "employee_count": 0,
    "billing_contact_email": "customer8@example.com",
    "data_residency": "latam"
  },
  {
    "label": "",
    "description": "",
    "placeholder": "",
    "status": "prospect",
    "state_history": [
      {
        "from": null,
        "to": "prospect",
        "at": "2026-09-01T12:00:00.000Z",
        "event": "created",
        "reason": "Sample record created"
      }
    ],
    "allowed_transitions": [],
    "owner_id": "",
    "owner_type": "",
    "ownership_role": "",
    "ownership_transferred_at": "2026-01-01T00:00:00.000Z",
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
        "updatedAt": "2026-09-01T12:00:00.000Z"
      }
    ],
    "preference_document": "",
    "preference_metadata": "",
    "preference_version": "",
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
    "organization_id": "organization-009",
    "domain": "",
    "plan_tier": "enterprise",
    "billing_status": "good_standing",
    "industry": "",
    "employee_count": 0,
    "billing_contact_email": "customer9@example.com",
    "data_residency": "us"
  },
  {
    "label": "",
    "description": "",
    "placeholder": "",
    "status": "onboarding",
    "state_history": [
      {
        "from": null,
        "to": "onboarding",
        "at": "2026-09-01T12:00:00.000Z",
        "event": "created",
        "reason": "Sample record created"
      }
    ],
    "allowed_transitions": [],
    "owner_id": "",
    "owner_type": "",
    "ownership_role": "",
    "ownership_transferred_at": "2026-01-01T00:00:00.000Z",
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
        "updatedAt": "2026-09-01T12:00:00.000Z"
      }
    ],
    "preference_document": "",
    "preference_metadata": "",
    "preference_version": "",
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
    "organization_id": "organization-010",
    "domain": "",
    "plan_tier": "free",
    "billing_status": "past_due",
    "industry": "",
    "employee_count": 0,
    "billing_contact_email": "customer10@example.com",
    "data_residency": "eu"
  }
];
