import type { FieldSchemaEntry } from '../schemas/generated.js';

/**
 * Fields a record keeps for itself: derived counters, version and mutation counters, hint copy
 * and machine-maintained lists. They are seeded and stored like any other field, but they are
 * not edited in forms and not listed as record details (Sprint 198 craft carry: internal fields
 * in forms, `#2046`).
 */
const INTERNAL_FIELD_NAMES = new Set([
  'placeholder', 'tag_count', 'tag_preview', 'preference_version', 'preference_mutations', 'preference_metadata',
  'classification_metadata', 'allowed_transitions', 'state_history',
]);

export function isInternalField(name: string, fields: Record<string, FieldSchemaEntry> = {}): boolean {
  if (INTERNAL_FIELD_NAMES.has(name)) return true;
  // A `<thing>_count` beside a `<thing>s` collection is derived from that collection.
  const counted = /^(.+)_count$/.exec(name)?.[1];
  return Boolean(counted && (fields[`${counted}s`] ?? fields[counted])?.type.match(/\[\]$|^array$/));
}

/** Enum values become option labels the way status badges print them: every word capitalised. */
export function enumOptionLabel(value: string): string {
  return value.split(/[_\-\s]+/).filter(Boolean).map(part => part.charAt(0).toUpperCase() + part.slice(1)).join(' ');
}
