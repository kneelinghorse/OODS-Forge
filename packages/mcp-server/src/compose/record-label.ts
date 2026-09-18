import type { FieldSchemaEntry } from '../schemas/generated.js';

/**
 * The field an object's author marked as what names a record (`semantic_type: text.label`), when there is exactly
 * one. s205-m02: the collection, detail and workflow producers named a record from a fixed list — plan_name, name,
 * title, display_name, label — and otherwise fell back to the identifier, so the Stage1 objects, whose records are
 * named by `target_name` and `path`, rendered rows and headings as uuids. This is consulted only where those
 * producers would have fallen back to the identifier, and never when content/Labelled's `label` projection sits
 * beside an own field (two text.label fields) — measured: it changes no screen of the 23 objects before this sprint.
 */
export function authoredLabelField(fields: Record<string, FieldSchemaEntry>): string | undefined {
  const marked = Object.keys(fields).filter(name => fields[name]!.semanticType === 'text.label');
  return marked.length === 1 ? marked[0] : undefined;
}
