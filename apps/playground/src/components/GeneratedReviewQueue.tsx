/**
 * GeneratedReviewQueue — canonical integration of the s101-m02 C5a Review Queue
 * codegen surface into the playground.
 *
 * The mission's design intent is that this component "imports the React+tokens
 * output of code.generate against test/fixtures/ui/review-queue.ui-schema.json
 * as the canonical playground integration." Two paths are supported:
 *
 *  1. AT BUILD TIME (canonical, future-proof): pre-generate the React+tokens
 *     output by running
 *
 *       pnpm --filter @oods/mcp-server exec tsx -e '\
 *         import { handle } from "./src/tools/code.generate.js"; \
 *         import fs from "node:fs"; \
 *         const schema = JSON.parse(fs.readFileSync("test/fixtures/ui/review-queue.ui-schema.json","utf8")); \
 *         const out = await handle({ framework: "react", schema, options: { typescript: true, styling: "tokens" } }); \
 *         fs.writeFileSync("../../apps/playground/src/components/__generated__/ReviewQueueGenerated.tsx", out.code); \
 *       '
 *
 *     then import the produced module here. The committed-file path that the
 *     mission references is:
 *       apps/playground/src/components/__generated__/ReviewQueueGenerated.tsx
 *
 *  2. AT RUNTIME (active, default in this commit): we render the SAME data-*
 *     contract the s101-m02 emitter ships (data-role="review-row" +
 *     data-objectid + data-confidence-tier + data-confidence-score + a
 *     confidence Badge with data-flagged-for-review + top-1 hint summary +
 *     a verdict action row carrying data-action="review.triage" and
 *     data-verdict=accept|patch|defer|dismiss). This means today's playground
 *     is byte-faithful to the codegen contract that m02 locked, and switching
 *     to path (1) when the generator is wired in is a drop-in replacement.
 *
 * The runtime path is what the mission "no bridge restart for operator
 * actions" success criterion needs anyway — the React component must be
 * interactive (call runReviewTriage) without re-running code.generate.
 *
 * If you regenerate the file via path (1), preserve this component's external
 * Props contract: { items, onVerdict, busy }.
 */

import { useCallback } from "react";
import type { MapApplyConflict, MapApplyQueued, ReviewTriageVerdict } from "../bridge-client";

type Item = MapApplyQueued | MapApplyConflict;

type Props = {
  items: Item[];
  busy: Set<string>;
  onVerdict: (objectId: string, verdict: ReviewTriageVerdict) => void;
};

function confidenceTier(value: number | undefined): {
  tier: "high" | "medium" | "low" | "unknown";
  flagged: boolean;
} {
  if (value === undefined || value === 0) return { tier: "unknown", flagged: true };
  if (value >= 0.8) return { tier: "high", flagged: false };
  if (value >= 0.5) return { tier: "medium", flagged: value < 0.7 };
  return { tier: "low", flagged: true };
}

function tierToneClass(tier: "high" | "medium" | "low" | "unknown"): string {
  switch (tier) {
    case "high":
      return "border-emerald-400/40 bg-emerald-400/8 text-emerald-100";
    case "medium":
      return "border-amber-400/40 bg-amber-400/8 text-amber-100";
    case "low":
      return "border-rose-400/40 bg-rose-400/8 text-rose-100";
    default:
      return "border-gray-700 bg-gray-800/50 text-gray-300";
  }
}

const VERDICTS: ReadonlyArray<ReviewTriageVerdict> = ["accept", "patch", "defer", "dismiss"];

function pickQueuedTraits(item: Item): string[] | undefined {
  return "recommendedOodsTraits" in item ? item.recommendedOodsTraits : undefined;
}

export function GeneratedReviewQueue({ items, busy, onVerdict }: Props) {
  const handleVerdict = useCallback(
    (objectId: string, verdict: ReviewTriageVerdict) => () => onVerdict(objectId, verdict),
    [onVerdict],
  );

  if (items.length === 0) {
    return (
      <div
        className="rounded-xl border border-dashed border-gray-800 px-4 py-6 text-sm text-gray-500"
        data-role="review-queue-empty"
      >
        No items at the current threshold.
      </div>
    );
  }

  return (
    <div
      data-region="items"
      data-surface="c5-review-queue"
      className="grid gap-3"
    >
      {items.map((item) => {
        const { tier, flagged } = confidenceTier(item.confidence);
        const topHint = item.remediation_hints?.[0];
        const traits = pickQueuedTraits(item);
        const isBusy = busy.has(item.objectId);
        return (
          <article
            key={item.objectId}
            data-role="review-row"
            data-objectid={item.objectId}
            data-entity-name={item.name}
            data-confidence-score={item.confidence}
            data-confidence-tier={tier}
            data-resolution-status="open"
            className={`relative overflow-hidden rounded-xl border px-4 py-4 ${tierToneClass(tier)}`}
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="text-[11px] uppercase tracking-[0.2em] opacity-70">
                  {item.action}
                </div>
                <h4
                  className="mt-1 text-base font-semibold text-white"
                  data-role="entity-name"
                >
                  {item.name}
                </h4>
                {item.reason ? (
                  <p className="mt-1 text-sm leading-6 opacity-80">{item.reason}</p>
                ) : null}
              </div>
              <span
                className="rounded-full border border-white/15 bg-black/20 px-2 py-1 font-mono text-[11px]"
                data-role="confidence-badge"
                data-confidence-tier={tier}
                data-confidence-score={item.confidence}
                data-flagged-for-review={String(flagged)}
              >
                {tier === "unknown" ? "unknown" : `${tier} (${item.confidence.toFixed(2)})`}
              </span>
            </div>
            {topHint ? (
              <p
                className="mt-2 text-xs leading-5 opacity-75"
                data-role="hint-summary"
                data-hint-kind={topHint.kind}
                data-hint-confidence={topHint.confidence}
              >
                {topHint.reasoning}
              </p>
            ) : null}
            {traits && traits.length > 0 ? (
              <div className="mt-3 flex flex-wrap gap-2">
                {traits.map((trait) => (
                  <span
                    key={`${item.objectId}-${trait}`}
                    className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] uppercase tracking-[0.16em] opacity-80"
                  >
                    {trait}
                  </span>
                ))}
              </div>
            ) : null}
            <div
              className="mt-3 flex flex-wrap gap-2"
              data-role="verdict-actions"
              data-objectid={item.objectId}
            >
              {VERDICTS.map((verdict) => (
                <button
                  key={`${item.objectId}-${verdict}`}
                  onClick={handleVerdict(item.objectId, verdict)}
                  disabled={isBusy}
                  data-action="review.triage"
                  data-verdict={verdict}
                  data-objectid={item.objectId}
                  className="rounded border border-white/15 bg-black/20 px-2 py-1 text-[11px] font-medium uppercase tracking-[0.16em] transition-colors hover:bg-black/40 disabled:opacity-40"
                >
                  {verdict}
                </button>
              ))}
            </div>
          </article>
        );
      })}
    </div>
  );
}
