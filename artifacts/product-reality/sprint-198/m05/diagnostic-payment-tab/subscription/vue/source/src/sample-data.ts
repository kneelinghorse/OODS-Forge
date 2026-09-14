import type { DomainRecord } from './store';

export const sampleData: DomainRecord[] = [
  {
    "status": "future",
    "state_history": [
      {
        "from": null,
        "to": "future",
        "at": "2026-09-01T12:00:00.000Z",
        "event": "billing_cycle_started",
        "title": "Billing Cycle Started",
        "reason": "Record created"
      }
    ],
    "allowed_transitions": [],
    "cancel_at_period_end": false,
    "created_at": "2026-09-01T12:00:00.000Z",
    "updated_at": "2026-09-01T12:00:00.000Z",
    "last_event": "billing_cycle_started",
    "last_event_at": "2026-09-01T12:00:00.000Z",
    "amount": 1900,
    "currency": "usd",
    "billing_interval": "monthly",
    "payment_status": "pending",
    "payment_method_type": "card",
    "proration_amount": 0,
    "proration_date": 0,
    "last_payment_at": "2026-09-01T12:00:00.000Z",
    "next_payment_due_at": "2026-10-01T12:00:00.000Z",
    "current_period_start": "2026-09-01T12:00:00.000Z",
    "current_period_end": "2026-10-01T12:00:00.000Z",
    "current_period_progress": 0.23333333333333334,
    "is_archived": false,
    "archived_at": "2026-09-01T12:00:00.000Z",
    "restored_at": "2026-09-01T12:00:00.000Z",
    "archive_reason": "",
    "archived_by": "",
    "archive_metadata": {},
    "restoration_metadata": {},
    "subscription_id": "subscription-001",
    "plan_name": "Northstar Plan",
    "plan_code": "northstar_001",
    "plan_interval": "",
    "customer_name": "",
    "customer_email": "anika.bhatt@example.com",
    "payment_history": [
      {
        "at": "2026-06-01T12:00:00.000Z",
        "amount": 1520
      },
      {
        "at": "2026-07-01T12:00:00.000Z",
        "amount": 2090
      },
      {
        "at": "2026-08-01T12:00:00.000Z",
        "amount": 1710
      },
      {
        "at": "2026-09-01T12:00:00.000Z",
        "amount": 1900
      }
    ]
  },
  {
    "status": "trialing",
    "state_history": [
      {
        "from": null,
        "to": "trialing",
        "at": "2026-03-01T12:00:00.000Z",
        "event": "billing_cycle_started",
        "title": "Billing Cycle Started",
        "reason": "Record created"
      }
    ],
    "allowed_transitions": [],
    "cancel_at_period_end": false,
    "created_at": "2026-03-01T12:00:00.000Z",
    "updated_at": "2026-03-01T12:00:00.000Z",
    "last_event": "billing_cycle_started",
    "last_event_at": "2026-03-01T12:00:00.000Z",
    "amount": 4900,
    "currency": "usd",
    "billing_interval": "yearly",
    "payment_status": "succeeded",
    "payment_method_type": "ach",
    "proration_amount": 0,
    "proration_date": 0,
    "last_payment_at": "2026-03-01T12:00:00.000Z",
    "next_payment_due_at": "2027-03-01T12:00:00.000Z",
    "current_period_start": "2026-03-01T12:00:00.000Z",
    "current_period_end": "2027-03-01T12:00:00.000Z",
    "current_period_progress": 0.5232876712328767,
    "is_archived": false,
    "archived_at": "2026-09-01T12:00:00.000Z",
    "restored_at": "2026-09-01T12:00:00.000Z",
    "archive_reason": "",
    "archived_by": "",
    "archive_metadata": {},
    "restoration_metadata": {},
    "subscription_id": "subscription-002",
    "plan_name": "Harbor Plan",
    "plan_code": "harbor_002",
    "plan_interval": "",
    "customer_name": "",
    "customer_email": "milo.chen@example.com",
    "payment_history": [
      {
        "at": "2025-12-01T12:00:00.000Z",
        "amount": 3920
      },
      {
        "at": "2026-01-01T12:00:00.000Z",
        "amount": 5390
      },
      {
        "at": "2026-02-01T12:00:00.000Z",
        "amount": 4410
      },
      {
        "at": "2026-03-01T12:00:00.000Z",
        "amount": 4900
      }
    ]
  },
  {
    "status": "active",
    "state_history": [
      {
        "from": null,
        "to": "active",
        "at": "2026-09-01T12:00:00.000Z",
        "event": "billing_cycle_started",
        "title": "Billing Cycle Started",
        "reason": "Record created"
      }
    ],
    "allowed_transitions": [],
    "cancel_at_period_end": false,
    "created_at": "2026-09-01T12:00:00.000Z",
    "updated_at": "2026-09-01T12:00:00.000Z",
    "last_event": "billing_cycle_started",
    "last_event_at": "2026-09-01T12:00:00.000Z",
    "amount": 9900,
    "currency": "usd",
    "billing_interval": "monthly",
    "payment_status": "failed",
    "payment_method_type": "wire",
    "proration_amount": 0,
    "proration_date": 0,
    "last_payment_at": "2026-09-01T12:00:00.000Z",
    "next_payment_due_at": "2026-10-01T12:00:00.000Z",
    "current_period_start": "2026-09-01T12:00:00.000Z",
    "current_period_end": "2026-10-01T12:00:00.000Z",
    "current_period_progress": 0.23333333333333334,
    "is_archived": false,
    "archived_at": "2026-09-01T12:00:00.000Z",
    "restored_at": "2026-09-01T12:00:00.000Z",
    "archive_reason": "",
    "archived_by": "",
    "archive_metadata": {},
    "restoration_metadata": {},
    "subscription_id": "subscription-003",
    "plan_name": "Cedar Plan",
    "plan_code": "cedar_003",
    "plan_interval": "",
    "customer_name": "",
    "customer_email": "sunny.rivera@example.com",
    "payment_history": [
      {
        "at": "2026-06-01T12:00:00.000Z",
        "amount": 7920
      },
      {
        "at": "2026-07-01T12:00:00.000Z",
        "amount": 10890
      },
      {
        "at": "2026-08-01T12:00:00.000Z",
        "amount": 8910
      },
      {
        "at": "2026-09-01T12:00:00.000Z",
        "amount": 9900
      }
    ]
  },
  {
    "status": "paused",
    "state_history": [
      {
        "from": null,
        "to": "paused",
        "at": "2026-03-01T12:00:00.000Z",
        "event": "billing_cycle_started",
        "title": "Billing Cycle Started",
        "reason": "Record created"
      }
    ],
    "allowed_transitions": [],
    "cancel_at_period_end": false,
    "created_at": "2026-03-01T12:00:00.000Z",
    "updated_at": "2026-03-01T12:00:00.000Z",
    "last_event": "billing_cycle_started",
    "last_event_at": "2026-03-01T12:00:00.000Z",
    "amount": 14900,
    "currency": "usd",
    "billing_interval": "yearly",
    "payment_status": "retrying",
    "payment_method_type": "invoice",
    "proration_amount": 0,
    "proration_date": 0,
    "last_payment_at": "2026-03-01T12:00:00.000Z",
    "next_payment_due_at": "2027-03-01T12:00:00.000Z",
    "current_period_start": "2026-03-01T12:00:00.000Z",
    "current_period_end": "2027-03-01T12:00:00.000Z",
    "current_period_progress": 0.5232876712328767,
    "is_archived": false,
    "archived_at": "2026-09-01T12:00:00.000Z",
    "restored_at": "2026-09-01T12:00:00.000Z",
    "archive_reason": "",
    "archived_by": "",
    "archive_metadata": {},
    "restoration_metadata": {},
    "subscription_id": "subscription-004",
    "plan_name": "Summit Plan",
    "plan_code": "summit_004",
    "plan_interval": "",
    "customer_name": "",
    "customer_email": "ada.morgan@example.com",
    "payment_history": [
      {
        "at": "2025-12-01T12:00:00.000Z",
        "amount": 11920
      },
      {
        "at": "2026-01-01T12:00:00.000Z",
        "amount": 16390
      },
      {
        "at": "2026-02-01T12:00:00.000Z",
        "amount": 13410
      },
      {
        "at": "2026-03-01T12:00:00.000Z",
        "amount": 14900
      }
    ]
  },
  {
    "status": "pending_cancellation",
    "state_history": [
      {
        "from": null,
        "to": "pending_cancellation",
        "at": "2026-09-01T12:00:00.000Z",
        "event": "billing_cycle_started",
        "title": "Billing Cycle Started",
        "reason": "Record created"
      }
    ],
    "allowed_transitions": [],
    "cancel_at_period_end": true,
    "created_at": "2026-09-01T12:00:00.000Z",
    "updated_at": "2026-09-01T12:00:00.000Z",
    "last_event": "billing_cycle_started",
    "last_event_at": "2026-09-01T12:00:00.000Z",
    "amount": 24900,
    "currency": "usd",
    "billing_interval": "monthly",
    "payment_status": "refunded",
    "payment_method_type": "other",
    "proration_amount": 0,
    "proration_date": 0,
    "last_payment_at": "2026-09-01T12:00:00.000Z",
    "next_payment_due_at": "2026-10-01T12:00:00.000Z",
    "current_period_start": "2026-09-01T12:00:00.000Z",
    "current_period_end": "2026-10-01T12:00:00.000Z",
    "current_period_progress": 0.23333333333333334,
    "is_archived": false,
    "archived_at": "2026-09-01T12:00:00.000Z",
    "restored_at": "2026-09-01T12:00:00.000Z",
    "archive_reason": "",
    "archived_by": "",
    "archive_metadata": {},
    "restoration_metadata": {},
    "subscription_id": "subscription-005",
    "plan_name": "Orchard Plan",
    "plan_code": "orchard_005",
    "plan_interval": "",
    "customer_name": "",
    "customer_email": "theo.reed@example.com",
    "cancellation_reason": "Service no longer needed",
    "cancellation_reason_code": "customer_request",
    "cancellation_requested_at": "2026-09-01T12:00:00.000Z",
    "payment_history": [
      {
        "at": "2026-06-01T12:00:00.000Z",
        "amount": 19920
      },
      {
        "at": "2026-07-01T12:00:00.000Z",
        "amount": 27390
      },
      {
        "at": "2026-08-01T12:00:00.000Z",
        "amount": 22410
      },
      {
        "at": "2026-09-01T12:00:00.000Z",
        "amount": 24900
      }
    ]
  },
  {
    "status": "past_due",
    "state_history": [
      {
        "from": null,
        "to": "past_due",
        "at": "2026-03-01T12:00:00.000Z",
        "event": "billing_cycle_started",
        "title": "Billing Cycle Started",
        "reason": "Record created"
      }
    ],
    "allowed_transitions": [],
    "cancel_at_period_end": false,
    "created_at": "2026-03-01T12:00:00.000Z",
    "updated_at": "2026-03-01T12:00:00.000Z",
    "last_event": "billing_cycle_started",
    "last_event_at": "2026-03-01T12:00:00.000Z",
    "amount": 1900,
    "currency": "usd",
    "billing_interval": "yearly",
    "payment_status": "pending",
    "payment_method_type": "card",
    "proration_amount": 0,
    "proration_date": 0,
    "last_payment_at": "2026-03-01T12:00:00.000Z",
    "next_payment_due_at": "2027-03-01T12:00:00.000Z",
    "current_period_start": "2026-03-01T12:00:00.000Z",
    "current_period_end": "2027-03-01T12:00:00.000Z",
    "current_period_progress": 0.5232876712328767,
    "is_archived": false,
    "archived_at": "2026-09-01T12:00:00.000Z",
    "restored_at": "2026-09-01T12:00:00.000Z",
    "archive_reason": "",
    "archived_by": "",
    "archive_metadata": {},
    "restoration_metadata": {},
    "subscription_id": "subscription-006",
    "plan_name": "Willow Plan",
    "plan_code": "willow_006",
    "plan_interval": "",
    "customer_name": "",
    "customer_email": "lena.park@example.com",
    "payment_history": [
      {
        "at": "2025-12-01T12:00:00.000Z",
        "amount": 1520
      },
      {
        "at": "2026-01-01T12:00:00.000Z",
        "amount": 2090
      },
      {
        "at": "2026-02-01T12:00:00.000Z",
        "amount": 1710
      },
      {
        "at": "2026-03-01T12:00:00.000Z",
        "amount": 1900
      }
    ]
  },
  {
    "status": "unpaid",
    "state_history": [
      {
        "from": null,
        "to": "unpaid",
        "at": "2026-09-01T12:00:00.000Z",
        "event": "billing_cycle_started",
        "title": "Billing Cycle Started",
        "reason": "Record created"
      }
    ],
    "allowed_transitions": [],
    "cancel_at_period_end": false,
    "created_at": "2026-09-01T12:00:00.000Z",
    "updated_at": "2026-09-01T12:00:00.000Z",
    "last_event": "billing_cycle_started",
    "last_event_at": "2026-09-01T12:00:00.000Z",
    "amount": 4900,
    "currency": "usd",
    "billing_interval": "monthly",
    "payment_status": "succeeded",
    "payment_method_type": "ach",
    "proration_amount": 0,
    "proration_date": 0,
    "last_payment_at": "2026-09-01T12:00:00.000Z",
    "next_payment_due_at": "2026-10-01T12:00:00.000Z",
    "current_period_start": "2026-09-01T12:00:00.000Z",
    "current_period_end": "2026-10-01T12:00:00.000Z",
    "current_period_progress": 0.23333333333333334,
    "is_archived": false,
    "archived_at": "2026-09-01T12:00:00.000Z",
    "restored_at": "2026-09-01T12:00:00.000Z",
    "archive_reason": "",
    "archived_by": "",
    "archive_metadata": {},
    "restoration_metadata": {},
    "subscription_id": "subscription-007",
    "plan_name": "Atlas Plan",
    "plan_code": "atlas_007",
    "plan_interval": "",
    "customer_name": "",
    "customer_email": "sam.brooks@example.com",
    "payment_history": [
      {
        "at": "2026-06-01T12:00:00.000Z",
        "amount": 3920
      },
      {
        "at": "2026-07-01T12:00:00.000Z",
        "amount": 5390
      },
      {
        "at": "2026-08-01T12:00:00.000Z",
        "amount": 4410
      },
      {
        "at": "2026-09-01T12:00:00.000Z",
        "amount": 4900
      }
    ]
  },
  {
    "status": "terminated",
    "state_history": [
      {
        "from": null,
        "to": "terminated",
        "at": "2025-03-01T12:00:00.000Z",
        "event": "billing_cycle_started",
        "title": "Billing Cycle Started",
        "reason": "Record created"
      }
    ],
    "allowed_transitions": [],
    "cancel_at_period_end": false,
    "created_at": "2025-03-01T12:00:00.000Z",
    "updated_at": "2025-03-01T12:00:00.000Z",
    "last_event": "billing_cycle_started",
    "last_event_at": "2025-03-01T12:00:00.000Z",
    "amount": 9900,
    "currency": "usd",
    "billing_interval": "yearly",
    "payment_status": "failed",
    "payment_method_type": "wire",
    "proration_amount": 0,
    "proration_date": 0,
    "last_payment_at": "2025-03-01T12:00:00.000Z",
    "next_payment_due_at": "2026-03-01T12:00:00.000Z",
    "current_period_start": "2025-03-01T12:00:00.000Z",
    "current_period_end": "2026-03-01T12:00:00.000Z",
    "current_period_progress": 1,
    "is_archived": false,
    "archived_at": "2026-09-01T12:00:00.000Z",
    "restored_at": "2026-09-01T12:00:00.000Z",
    "archive_reason": "",
    "archived_by": "",
    "archive_metadata": {},
    "restoration_metadata": {},
    "subscription_id": "subscription-008",
    "plan_name": "Meadow Plan",
    "plan_code": "meadow_008",
    "plan_interval": "",
    "customer_name": "",
    "customer_email": "nora.patel@example.com",
    "cancellation_reason": "Service no longer needed",
    "cancellation_reason_code": "customer_request",
    "cancellation_requested_at": "2026-03-01T12:00:00.000Z",
    "payment_history": [
      {
        "at": "2024-12-01T12:00:00.000Z",
        "amount": 7920
      },
      {
        "at": "2025-01-01T12:00:00.000Z",
        "amount": 10890
      },
      {
        "at": "2025-02-01T12:00:00.000Z",
        "amount": 8910
      },
      {
        "at": "2025-03-01T12:00:00.000Z",
        "amount": 9900
      }
    ]
  },
  {
    "status": "future",
    "state_history": [
      {
        "from": null,
        "to": "future",
        "at": "2026-09-01T12:00:00.000Z",
        "event": "billing_cycle_started",
        "title": "Billing Cycle Started",
        "reason": "Record created"
      }
    ],
    "allowed_transitions": [],
    "cancel_at_period_end": false,
    "created_at": "2026-09-01T12:00:00.000Z",
    "updated_at": "2026-09-01T12:00:00.000Z",
    "last_event": "billing_cycle_started",
    "last_event_at": "2026-09-01T12:00:00.000Z",
    "amount": 14900,
    "currency": "usd",
    "billing_interval": "monthly",
    "payment_status": "retrying",
    "payment_method_type": "invoice",
    "proration_amount": 0,
    "proration_date": 0,
    "last_payment_at": "2026-09-01T12:00:00.000Z",
    "next_payment_due_at": "2026-10-01T12:00:00.000Z",
    "current_period_start": "2026-09-01T12:00:00.000Z",
    "current_period_end": "2026-10-01T12:00:00.000Z",
    "current_period_progress": 0.23333333333333334,
    "is_archived": false,
    "archived_at": "2026-09-01T12:00:00.000Z",
    "restored_at": "2026-09-01T12:00:00.000Z",
    "archive_reason": "",
    "archived_by": "",
    "archive_metadata": {},
    "restoration_metadata": {},
    "subscription_id": "subscription-009",
    "plan_name": "Juniper Plan",
    "plan_code": "juniper_009",
    "plan_interval": "",
    "customer_name": "",
    "customer_email": "eli.stone@example.com",
    "payment_history": [
      {
        "at": "2026-06-01T12:00:00.000Z",
        "amount": 11920
      },
      {
        "at": "2026-07-01T12:00:00.000Z",
        "amount": 16390
      },
      {
        "at": "2026-08-01T12:00:00.000Z",
        "amount": 13410
      },
      {
        "at": "2026-09-01T12:00:00.000Z",
        "amount": 14900
      }
    ]
  },
  {
    "status": "trialing",
    "state_history": [
      {
        "from": null,
        "to": "trialing",
        "at": "2026-03-01T12:00:00.000Z",
        "event": "billing_cycle_started",
        "title": "Billing Cycle Started",
        "reason": "Record created"
      }
    ],
    "allowed_transitions": [],
    "cancel_at_period_end": false,
    "created_at": "2026-03-01T12:00:00.000Z",
    "updated_at": "2026-03-01T12:00:00.000Z",
    "last_event": "billing_cycle_started",
    "last_event_at": "2026-03-01T12:00:00.000Z",
    "amount": 24900,
    "currency": "usd",
    "billing_interval": "yearly",
    "payment_status": "refunded",
    "payment_method_type": "other",
    "proration_amount": 0,
    "proration_date": 0,
    "last_payment_at": "2026-03-01T12:00:00.000Z",
    "next_payment_due_at": "2027-03-01T12:00:00.000Z",
    "current_period_start": "2026-03-01T12:00:00.000Z",
    "current_period_end": "2027-03-01T12:00:00.000Z",
    "current_period_progress": 0.5232876712328767,
    "is_archived": true,
    "archived_at": "2026-09-07T12:00:00.000Z",
    "restored_at": "2026-09-01T12:00:00.000Z",
    "archive_reason": "",
    "archived_by": "",
    "archive_metadata": {},
    "restoration_metadata": {},
    "subscription_id": "subscription-010",
    "plan_name": "Brook Plan",
    "plan_code": "brook_010",
    "plan_interval": "",
    "customer_name": "",
    "customer_email": "maya.silva@example.com",
    "payment_history": [
      {
        "at": "2025-12-01T12:00:00.000Z",
        "amount": 19920
      },
      {
        "at": "2026-01-01T12:00:00.000Z",
        "amount": 27390
      },
      {
        "at": "2026-02-01T12:00:00.000Z",
        "amount": 22410
      },
      {
        "at": "2026-03-01T12:00:00.000Z",
        "amount": 24900
      }
    ]
  }
];
