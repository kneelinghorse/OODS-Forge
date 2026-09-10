import type { PageProps } from './GeneratedUI.js';

export const model: Omit<PageProps, 'actions'> = {
  "allowedTransitions": [],
  "createdAt": "2026-09-05T12:00:00.000Z",
  "description": "Consumer description",
  "direction": "unidirectional",
  "isBidirectional": false,
  "label": "Consumer label",
  "lastEvent": "Consumer last event",
  "lastEventAt": "2026-09-05T12:00:00.000Z",
  "originSource": "manual",
  "ownerId": "consumer-owner-id",
  "ownerType": "Consumer owner type",
  "ownershipRole": "Consumer ownership role",
  "ownershipTransferredAt": "2026-09-05T12:00:00.000Z",
  "placeholder": "Consumer placeholder",
  "relationshipId": "consumer-relationship-id",
  "relationshipType": "membership",
  "sourceId": "consumer-source-id",
  "stateHistory": [],
  "status": "Consumer status",
  "strength": "low",
  "tagCount": 0,
  "tagMetadata": [],
  "tags": [],
  "targetId": "consumer-target-id",
  "updatedAt": "2026-09-05T12:00:00.000Z",
  "events": [
    {
      "id": "consumer-event-1",
      "kind": "state",
      "at": "2026-09-05T12:00:00Z",
      "title": "Created",
      "description": "Initial state"
    },
    {
      "id": "consumer-event-2",
      "kind": "state",
      "at": "2026-09-06T12:00:00Z",
      "title": "Updated",
      "description": "Next state"
    }
  ]
};
