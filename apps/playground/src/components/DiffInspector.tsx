/**
 * DiffInspector — field-level changed_fields[] table + ranked remediation_hints[] list.
 * Consumes the Stage1CandidateDiff shape from map.apply output and the
 * RemediationHint[] introduced by s101-m01's conflict-artifact schema extension.
 */

import { useState } from "react";
import type { MapApplyRoute, RemediationHint } from "../bridge-client";

type DiffShape = NonNullable<MapApplyRoute["diff"]>;

type Props = {
  diff?: DiffShape;
  remediationHints?: RemediationHint[];
  defaultOpen?: boolean;
};

function classifyChangeKind(field: DiffShape["changed_fields"][number]): string {
  if (field.from === undefined && field.to !== undefined) return "added";
  if (field.from !== undefined && field.to === undefined) return "removed";
  return "modified";
}

function fmtValue(value: unknown): string {
  if (value === undefined) return "—";
  if (value === null) return "null";
  if (typeof value === "string") return value;
  return JSON.stringify(value);
}

function hintToneClasses(confidence: number): string {
  if (confidence >= 0.8) return "border-emerald-400/40 bg-emerald-400/8 text-emerald-100";
  if (confidence >= 0.5) return "border-amber-400/40 bg-amber-400/8 text-amber-100";
  return "border-rose-400/40 bg-rose-400/8 text-rose-100";
}

export function DiffInspector({ diff, remediationHints, defaultOpen = false }: Props) {
  const [open, setOpen] = useState(defaultOpen);

  const hasDiff = diff && (diff.changed_fields.length > 0 || diff.added_traits.length > 0 || diff.removed_traits.length > 0);
  const hasHints = remediationHints && remediationHints.length > 0;
  if (!hasDiff && !hasHints) return null;

  return (
    <details
      open={open}
      onToggle={(e) => setOpen((e.currentTarget as HTMLDetailsElement).open)}
      className="mt-3 rounded-lg border border-gray-800 bg-gray-950/70"
      data-role="diff-inspector"
    >
      <summary className="cursor-pointer select-none px-3 py-2 text-[11px] uppercase tracking-[0.18em] text-gray-400 hover:text-gray-200">
        Diff &amp; Remediation Hints
      </summary>
      <div className="space-y-4 border-t border-gray-800 px-3 py-3">
        {hasDiff ? (
          <div data-role="changed-fields-table">
            <div className="text-[11px] uppercase tracking-[0.18em] text-gray-500">
              Changed fields
            </div>
            {diff!.changed_fields.length > 0 ? (
              <div className="mt-2 overflow-hidden rounded border border-gray-800">
                <table className="w-full table-fixed text-xs">
                  <thead className="bg-gray-900/80 text-[10px] uppercase tracking-[0.18em] text-gray-500">
                    <tr>
                      <th className="w-1/3 px-2 py-1.5 text-left font-medium">Field</th>
                      <th className="w-1/3 px-2 py-1.5 text-left font-medium">From</th>
                      <th className="w-1/3 px-2 py-1.5 text-left font-medium">To</th>
                      <th className="w-20 px-2 py-1.5 text-left font-medium">Kind</th>
                    </tr>
                  </thead>
                  <tbody>
                    {diff!.changed_fields.map((field) => {
                      const kind = classifyChangeKind(field);
                      return (
                        <tr
                          key={field.field}
                          className="border-t border-gray-800 text-gray-300"
                          data-change-kind={kind}
                          data-field-name={field.field}
                        >
                          <td className="px-2 py-1.5 font-mono text-[11px] text-cyan-200/80">{field.field}</td>
                          <td className="px-2 py-1.5 font-mono text-[11px] text-gray-400">{fmtValue(field.from)}</td>
                          <td className="px-2 py-1.5 font-mono text-[11px] text-gray-200">{fmtValue(field.to)}</td>
                          <td className="px-2 py-1.5 text-[11px] text-gray-400">{kind}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="mt-2 text-[11px] text-gray-500">No field-level changes.</div>
            )}
            {(diff!.added_traits.length > 0 || diff!.removed_traits.length > 0) ? (
              <div className="mt-3 flex flex-wrap gap-2">
                {diff!.added_traits.map((trait) => (
                  <span
                    key={`added-${trait}`}
                    className="rounded-full border border-emerald-400/40 bg-emerald-400/10 px-2 py-0.5 text-[10px] uppercase tracking-[0.16em] text-emerald-100"
                    data-trait-diff-kind="added"
                    data-trait-name={trait}
                  >
                    +{trait}
                  </span>
                ))}
                {diff!.removed_traits.map((trait) => (
                  <span
                    key={`removed-${trait}`}
                    className="rounded-full border border-rose-400/40 bg-rose-400/10 px-2 py-0.5 text-[10px] uppercase tracking-[0.16em] text-rose-100"
                    data-trait-diff-kind="removed"
                    data-trait-name={trait}
                  >
                    −{trait}
                  </span>
                ))}
              </div>
            ) : null}
          </div>
        ) : null}
        {hasHints ? (
          <div data-role="remediation-hints-list">
            <div className="text-[11px] uppercase tracking-[0.18em] text-gray-500">
              Remediation hints
            </div>
            <ol className="mt-2 space-y-2">
              {remediationHints!.map((hint, index) => (
                <li
                  key={`${hint.kind}-${index}`}
                  className={`rounded-lg border px-3 py-2 text-[12px] ${hintToneClasses(hint.confidence)}`}
                  data-role="remediation-hint"
                  data-hint-rank={index}
                  data-hint-kind={hint.kind}
                  data-hint-confidence={hint.confidence}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-[10px] uppercase tracking-[0.16em]">{hint.kind}</span>
                    <span className="font-mono text-[10px]">{hint.confidence.toFixed(2)}</span>
                  </div>
                  <p className="mt-1 text-[12px] leading-5">{hint.reasoning}</p>
                  {hint.refs?.existingMapId ? (
                    <div className="mt-1 text-[10px] text-gray-400">
                      existing: <span className="font-mono">{hint.refs.existingMapId}</span>
                    </div>
                  ) : null}
                </li>
              ))}
            </ol>
          </div>
        ) : null}
      </div>
    </details>
  );
}
