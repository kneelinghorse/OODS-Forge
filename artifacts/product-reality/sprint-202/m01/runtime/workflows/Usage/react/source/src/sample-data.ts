import type { DomainRecord } from './store';

export const sampleData: DomainRecord[] = [
  {
    "meter_name": "Meter Name",
    "included_quantity": 0,
    "consumed_quantity": 0,
    "unit_label": "api_calls",
    "period_start": "2026-09-01",
    "period_end": "2026-09-01",
    "rollover_strategy": "expire",
    "overage_rate_minor": 1900,
    "projected_overage_minor": 1900,
    "samples": [
      {
        "timestamp": "2025-06-15T00:00:00Z",
        "value": 1200
      },
      {
        "timestamp": "2025-06-20T00:00:00Z",
        "value": 1800
      },
      {
        "timestamp": "2025-06-25T00:00:00Z",
        "value": 1500
      }
    ],
    "created_at": "2026-09-01T12:00:00.000Z",
    "updated_at": "2026-09-01T12:00:00.000Z",
    "last_event": "reading_captured",
    "last_event_at": "2026-09-01T12:00:00.000Z",
    "usage_id": "usage-001",
    "subscription_id": "subscription-001",
    "meter_id": "meter-001",
    "provider": "Internal billing",
    "status": "ok",
    "trend_percent": 0,
    "variance_minor": 1900,
    "last_reported_at": "2026-09-01T12:00:00.000Z",
    "anomalies": []
  },
  {
    "meter_name": "Meter Name",
    "included_quantity": 0,
    "consumed_quantity": 0,
    "unit_label": "api_calls",
    "period_start": "2026-09-01",
    "period_end": "2026-09-01",
    "rollover_strategy": "expire",
    "overage_rate_minor": 4900,
    "projected_overage_minor": 4900,
    "samples": [
      {
        "timestamp": "2025-06-15T00:00:00Z",
        "value": 1200
      },
      {
        "timestamp": "2025-06-20T00:00:00Z",
        "value": 1800
      },
      {
        "timestamp": "2025-06-25T00:00:00Z",
        "value": 1500
      }
    ],
    "created_at": "2026-09-01T12:00:00.000Z",
    "updated_at": "2026-09-01T12:00:00.000Z",
    "last_event": "reading_captured",
    "last_event_at": "2026-09-01T12:00:00.000Z",
    "usage_id": "usage-002",
    "subscription_id": "subscription-002",
    "meter_id": "meter-002",
    "provider": "Internal billing",
    "status": "delayed",
    "trend_percent": 0,
    "variance_minor": 4900,
    "last_reported_at": "2026-09-01T12:00:00.000Z",
    "anomalies": []
  },
  {
    "meter_name": "Meter Name",
    "included_quantity": 0,
    "consumed_quantity": 0,
    "unit_label": "api_calls",
    "period_start": "2026-09-01",
    "period_end": "2026-09-01",
    "rollover_strategy": "expire",
    "overage_rate_minor": 9900,
    "projected_overage_minor": 9900,
    "samples": [
      {
        "timestamp": "2025-06-15T00:00:00Z",
        "value": 1200
      },
      {
        "timestamp": "2025-06-20T00:00:00Z",
        "value": 1800
      },
      {
        "timestamp": "2025-06-25T00:00:00Z",
        "value": 1500
      }
    ],
    "created_at": "2026-09-01T12:00:00.000Z",
    "updated_at": "2026-09-01T12:00:00.000Z",
    "last_event": "reading_captured",
    "last_event_at": "2026-09-01T12:00:00.000Z",
    "usage_id": "usage-003",
    "subscription_id": "subscription-003",
    "meter_id": "meter-003",
    "provider": "Internal billing",
    "status": "investigating",
    "trend_percent": 0,
    "variance_minor": 9900,
    "last_reported_at": "2026-09-01T12:00:00.000Z",
    "anomalies": []
  },
  {
    "meter_name": "Meter Name",
    "included_quantity": 0,
    "consumed_quantity": 0,
    "unit_label": "api_calls",
    "period_start": "2026-09-01",
    "period_end": "2026-09-01",
    "rollover_strategy": "expire",
    "overage_rate_minor": 14900,
    "projected_overage_minor": 14900,
    "samples": [
      {
        "timestamp": "2025-06-15T00:00:00Z",
        "value": 1200
      },
      {
        "timestamp": "2025-06-20T00:00:00Z",
        "value": 1800
      },
      {
        "timestamp": "2025-06-25T00:00:00Z",
        "value": 1500
      }
    ],
    "created_at": "2026-09-01T12:00:00.000Z",
    "updated_at": "2026-09-01T12:00:00.000Z",
    "last_event": "reading_captured",
    "last_event_at": "2026-09-01T12:00:00.000Z",
    "usage_id": "usage-004",
    "subscription_id": "subscription-004",
    "meter_id": "meter-004",
    "provider": "Internal billing",
    "status": "ok",
    "trend_percent": 0,
    "variance_minor": 14900,
    "last_reported_at": "2026-09-01T12:00:00.000Z",
    "anomalies": []
  },
  {
    "meter_name": "Meter Name",
    "included_quantity": 0,
    "consumed_quantity": 0,
    "unit_label": "api_calls",
    "period_start": "2026-09-01",
    "period_end": "2026-09-01",
    "rollover_strategy": "expire",
    "overage_rate_minor": 24900,
    "projected_overage_minor": 24900,
    "samples": [
      {
        "timestamp": "2025-06-15T00:00:00Z",
        "value": 1200
      },
      {
        "timestamp": "2025-06-20T00:00:00Z",
        "value": 1800
      },
      {
        "timestamp": "2025-06-25T00:00:00Z",
        "value": 1500
      }
    ],
    "created_at": "2026-09-01T12:00:00.000Z",
    "updated_at": "2026-09-01T12:00:00.000Z",
    "last_event": "reading_captured",
    "last_event_at": "2026-09-01T12:00:00.000Z",
    "usage_id": "usage-005",
    "subscription_id": "subscription-005",
    "meter_id": "meter-005",
    "provider": "Internal billing",
    "status": "delayed",
    "trend_percent": 0,
    "variance_minor": 24900,
    "last_reported_at": "2026-09-01T12:00:00.000Z",
    "anomalies": []
  },
  {
    "meter_name": "Meter Name",
    "included_quantity": 0,
    "consumed_quantity": 0,
    "unit_label": "api_calls",
    "period_start": "2026-09-01",
    "period_end": "2026-09-01",
    "rollover_strategy": "expire",
    "overage_rate_minor": 1900,
    "projected_overage_minor": 1900,
    "samples": [
      {
        "timestamp": "2025-06-15T00:00:00Z",
        "value": 1200
      },
      {
        "timestamp": "2025-06-20T00:00:00Z",
        "value": 1800
      },
      {
        "timestamp": "2025-06-25T00:00:00Z",
        "value": 1500
      }
    ],
    "created_at": "2026-09-01T12:00:00.000Z",
    "updated_at": "2026-09-01T12:00:00.000Z",
    "last_event": "reading_captured",
    "last_event_at": "2026-09-01T12:00:00.000Z",
    "usage_id": "usage-006",
    "subscription_id": "subscription-006",
    "meter_id": "meter-006",
    "provider": "Internal billing",
    "status": "investigating",
    "trend_percent": 0,
    "variance_minor": 1900,
    "last_reported_at": "2026-09-01T12:00:00.000Z",
    "anomalies": []
  },
  {
    "meter_name": "Meter Name",
    "included_quantity": 0,
    "consumed_quantity": 0,
    "unit_label": "api_calls",
    "period_start": "2026-09-01",
    "period_end": "2026-09-01",
    "rollover_strategy": "expire",
    "overage_rate_minor": 4900,
    "projected_overage_minor": 4900,
    "samples": [
      {
        "timestamp": "2025-06-15T00:00:00Z",
        "value": 1200
      },
      {
        "timestamp": "2025-06-20T00:00:00Z",
        "value": 1800
      },
      {
        "timestamp": "2025-06-25T00:00:00Z",
        "value": 1500
      }
    ],
    "created_at": "2026-09-01T12:00:00.000Z",
    "updated_at": "2026-09-01T12:00:00.000Z",
    "last_event": "reading_captured",
    "last_event_at": "2026-09-01T12:00:00.000Z",
    "usage_id": "usage-007",
    "subscription_id": "subscription-007",
    "meter_id": "meter-007",
    "provider": "Internal billing",
    "status": "ok",
    "trend_percent": 0,
    "variance_minor": 4900,
    "last_reported_at": "2026-09-01T12:00:00.000Z",
    "anomalies": []
  },
  {
    "meter_name": "Meter Name",
    "included_quantity": 0,
    "consumed_quantity": 0,
    "unit_label": "api_calls",
    "period_start": "2026-09-01",
    "period_end": "2026-09-01",
    "rollover_strategy": "expire",
    "overage_rate_minor": 9900,
    "projected_overage_minor": 9900,
    "samples": [
      {
        "timestamp": "2025-06-15T00:00:00Z",
        "value": 1200
      },
      {
        "timestamp": "2025-06-20T00:00:00Z",
        "value": 1800
      },
      {
        "timestamp": "2025-06-25T00:00:00Z",
        "value": 1500
      }
    ],
    "created_at": "2026-09-01T12:00:00.000Z",
    "updated_at": "2026-09-01T12:00:00.000Z",
    "last_event": "reading_captured",
    "last_event_at": "2026-09-01T12:00:00.000Z",
    "usage_id": "usage-008",
    "subscription_id": "subscription-008",
    "meter_id": "meter-008",
    "provider": "Internal billing",
    "status": "delayed",
    "trend_percent": 0,
    "variance_minor": 9900,
    "last_reported_at": "2026-09-01T12:00:00.000Z",
    "anomalies": []
  },
  {
    "meter_name": "Meter Name",
    "included_quantity": 0,
    "consumed_quantity": 0,
    "unit_label": "api_calls",
    "period_start": "2026-09-01",
    "period_end": "2026-09-01",
    "rollover_strategy": "expire",
    "overage_rate_minor": 14900,
    "projected_overage_minor": 14900,
    "samples": [
      {
        "timestamp": "2025-06-15T00:00:00Z",
        "value": 1200
      },
      {
        "timestamp": "2025-06-20T00:00:00Z",
        "value": 1800
      },
      {
        "timestamp": "2025-06-25T00:00:00Z",
        "value": 1500
      }
    ],
    "created_at": "2026-09-01T12:00:00.000Z",
    "updated_at": "2026-09-01T12:00:00.000Z",
    "last_event": "reading_captured",
    "last_event_at": "2026-09-01T12:00:00.000Z",
    "usage_id": "usage-009",
    "subscription_id": "subscription-009",
    "meter_id": "meter-009",
    "provider": "Internal billing",
    "status": "investigating",
    "trend_percent": 0,
    "variance_minor": 14900,
    "last_reported_at": "2026-09-01T12:00:00.000Z",
    "anomalies": []
  },
  {
    "meter_name": "Meter Name",
    "included_quantity": 0,
    "consumed_quantity": 0,
    "unit_label": "api_calls",
    "period_start": "2026-09-01",
    "period_end": "2026-09-01",
    "rollover_strategy": "expire",
    "overage_rate_minor": 24900,
    "projected_overage_minor": 24900,
    "samples": [
      {
        "timestamp": "2025-06-15T00:00:00Z",
        "value": 1200
      },
      {
        "timestamp": "2025-06-20T00:00:00Z",
        "value": 1800
      },
      {
        "timestamp": "2025-06-25T00:00:00Z",
        "value": 1500
      }
    ],
    "created_at": "2026-09-01T12:00:00.000Z",
    "updated_at": "2026-09-01T12:00:00.000Z",
    "last_event": "reading_captured",
    "last_event_at": "2026-09-01T12:00:00.000Z",
    "usage_id": "usage-010",
    "subscription_id": "subscription-010",
    "meter_id": "meter-010",
    "provider": "Internal billing",
    "status": "ok",
    "trend_percent": 0,
    "variance_minor": 24900,
    "last_reported_at": "2026-09-01T12:00:00.000Z",
    "anomalies": []
  }
];
