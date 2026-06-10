/**
 * object — grouped action-parameter tool consolidating the object.* read family.
 *
 * Thin dispatch layer over the retained per-action handlers (object.list, object.show).
 * The framework validates `input` against object.input.json (a discriminated union keyed
 * on `action`) before this runs, and validates the returned result against
 * object.output.json after. We route on `input.action` and delegate unchanged — the extra
 * `action` key is ignored by the per-action handlers (their inputs only read named fields).
 *
 * Zero functionality loss: object.show's OODS-N005 did-you-mean (Levenshtein) lives in the
 * delegate and is preserved by delegation — it is not reimplemented here.
 */

import { handle as listHandle, type ObjectListInput, type ObjectListOutput } from './object.list.js';
import { handle as showHandle, type ObjectShowInput, type ObjectShowOutput } from './object.show.js';

export type ObjectAction = 'list' | 'show';

export type ObjectGroupedInput =
  | ({ action: 'list' } & ObjectListInput)
  | ({ action: 'show' } & ObjectShowInput);

export type ObjectGroupedOutput = ObjectListOutput | ObjectShowOutput;

export async function handle(input: any): Promise<ObjectGroupedOutput> {
  const action = input?.action as ObjectAction;
  switch (action) {
    case 'list':
      // input carries the extra `action` key; object.list.handle ignores it.
      return listHandle(input as ObjectListInput);
    case 'show':
      return showHandle(input as ObjectShowInput);
    default: {
      // Defensive: AJV (object.input.json action enum) rejects unknown actions
      // before dispatch. This guards direct/programmatic callers and enforces
      // exhaustiveness — `never` errors at compile time if a case is unhandled.
      const _exhaustive: never = action;
      throw new Error(`Unknown action: ${String((_exhaustive as unknown) ?? input?.action)}`);
    }
  }
}
