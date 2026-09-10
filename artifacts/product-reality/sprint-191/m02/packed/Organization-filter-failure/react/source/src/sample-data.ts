import type { DomainRecord } from './store';

export const sampleData: DomainRecord[] = [
  {
    "label": "Organization 01",
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
    "owner_id": "owner-id sample 1",
    "owner_type": "owner-type sample 1",
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
    "organization_id": "organization-001",
    "domain": "domain sample 1",
    "plan_tier": "free",
    "billing_status": "good_standing",
    "industry": "",
    "employee_count": 0,
    "billing_contact_email": "customer1@example.com",
    "data_residency": "us"
  },
  {
    "label": "Organization 02",
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
    "owner_id": "owner-id sample 2",
    "owner_type": "owner-type sample 2",
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
    "organization_id": "organization-002",
    "domain": "domain sample 2",
    "plan_tier": "growth",
    "billing_status": "past_due",
    "industry": "",
    "employee_count": 0,
    "billing_contact_email": "customer2@example.com",
    "data_residency": "eu"
  },
  {
    "label": "Organization 03",
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
    "owner_id": "owner-id sample 3",
    "owner_type": "owner-type sample 3",
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
    "organization_id": "organization-003",
    "domain": "domain sample 3",
    "plan_tier": "enterprise",
    "billing_status": "unpaid",
    "industry": "",
    "employee_count": 0,
    "billing_contact_email": "customer3@example.com",
    "data_residency": "apac"
  },
  {
    "label": "Organization 04",
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
    "owner_id": "owner-id sample 4",
    "owner_type": "owner-type sample 4",
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
    "organization_id": "organization-004",
    "domain": "domain sample 4",
    "plan_tier": "free",
    "billing_status": "suspended",
    "industry": "",
    "employee_count": 0,
    "billing_contact_email": "customer4@example.com",
    "data_residency": "latam"
  },
  {
    "label": "Organization 05",
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
    "owner_id": "owner-id sample 5",
    "owner_type": "owner-type sample 5",
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
    "organization_id": "organization-005",
    "domain": "domain sample 5",
    "plan_tier": "growth",
    "billing_status": "good_standing",
    "industry": "",
    "employee_count": 0,
    "billing_contact_email": "customer5@example.com",
    "data_residency": "us"
  },
  {
    "label": "Organization 06",
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
    "owner_id": "owner-id sample 6",
    "owner_type": "owner-type sample 6",
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
    "organization_id": "organization-006",
    "domain": "domain sample 6",
    "plan_tier": "enterprise",
    "billing_status": "past_due",
    "industry": "",
    "employee_count": 0,
    "billing_contact_email": "customer6@example.com",
    "data_residency": "eu"
  },
  {
    "label": "Organization 07",
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
    "owner_id": "owner-id sample 7",
    "owner_type": "owner-type sample 7",
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
    "organization_id": "organization-007",
    "domain": "domain sample 7",
    "plan_tier": "free",
    "billing_status": "unpaid",
    "industry": "",
    "employee_count": 0,
    "billing_contact_email": "customer7@example.com",
    "data_residency": "apac"
  },
  {
    "label": "Organization 08",
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
    "owner_id": "owner-id sample 8",
    "owner_type": "owner-type sample 8",
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
    "organization_id": "organization-008",
    "domain": "domain sample 8",
    "plan_tier": "growth",
    "billing_status": "suspended",
    "industry": "",
    "employee_count": 0,
    "billing_contact_email": "customer8@example.com",
    "data_residency": "latam"
  },
  {
    "label": "Organization 09",
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
    "owner_id": "owner-id sample 9",
    "owner_type": "owner-type sample 9",
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
    "organization_id": "organization-009",
    "domain": "domain sample 9",
    "plan_tier": "enterprise",
    "billing_status": "good_standing",
    "industry": "",
    "employee_count": 0,
    "billing_contact_email": "customer9@example.com",
    "data_residency": "us"
  },
  {
    "label": "Organization 10",
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
    "owner_id": "owner-id sample 10",
    "owner_type": "owner-type sample 10",
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
    "organization_id": "organization-010",
    "domain": "domain sample 10",
    "plan_tier": "free",
    "billing_status": "past_due",
    "industry": "",
    "employee_count": 0,
    "billing_contact_email": "customer10@example.com",
    "data_residency": "eu"
  }
];
