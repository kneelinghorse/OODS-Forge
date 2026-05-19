import type { MapApplyResult } from "../bridge-client";
import type { TriageHistoryEntry } from "../App";

type TranscriptPayload = {
  fixtureId: string;
  minConfidence: number;
  mapApplyResult: MapApplyResult;
  triageHistory: TriageHistoryEntry[];
  artifactPath: string | null;
};

type Props = {
  bridgeOk: boolean | null;
  loading: boolean;
  error: string | null;
  metrics: {
    totalNodes: number;
    componentsUsed: number;
    fieldsBound: number;
    fieldsOmitted?: Array<{ field: string; reason: string }>;
    responseBytes: number;
  } | null;
  pipeline: {
    steps: string[];
    stepLatency?: Record<string, number>;
    duration: number;
  } | null;
  summary: string | null;
  transcript?: TranscriptPayload | null;
};

const TRANSCRIPT_SCHEMA_VERSION = "1.0.0";

function buildTranscript(payload: TranscriptPayload): Record<string, unknown> {
  const startTime = new Date().toISOString();
  return {
    schemaVersion: TRANSCRIPT_SCHEMA_VERSION,
    source: "oods-playground/m04",
    command: "replay",
    tool: "map_apply+review_triage",
    args: {
      apply: false,
      options: { approve: false },
      payload: {
        fixtureId: payload.fixtureId,
        minConfidence: payload.minConfidence,
      },
    },
    user: "playground",
    hostname:
      typeof window !== "undefined" && window.location
        ? window.location.host
        : "localhost",
    startTime,
    endTime: startTime,
    exitCode: 0,
    artifacts: payload.artifactPath
      ? [
          {
            path: payload.artifactPath,
            sha256: "",
            role: "input",
            name: "conflictArtifact",
            purpose: "map.apply conflict artifact mutated by review.triage",
          },
        ]
      : [],
    redactions: [],
    signature: { algo: "none", hash: "" },
    meta: {
      mapApplyResult: payload.mapApplyResult,
      triageHistory: payload.triageHistory,
    },
  };
}

function downloadTranscript(payload: TranscriptPayload): void {
  const transcript = buildTranscript(payload);
  const blob = new Blob([JSON.stringify(transcript, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  link.download = `oods-transcript-${payload.fixtureId}-${timestamp}.json`;
  link.click();
  URL.revokeObjectURL(url);
}

function formatError(error: string): { label: string; detail: string } {
  // Parse [step] prefix if present
  const match = error.match(/^\[(\w+)\]\s*(.+)/);
  if (match) {
    return { label: match[1], detail: match[2] };
  }
  return { label: 'Error', detail: error };
}

export function StatusBar({ bridgeOk, loading, error, metrics, pipeline, summary, transcript }: Props) {
  const err = error ? formatError(error) : null;

  return (
    <div className="flex items-center gap-4 px-5 py-1.5 border-t border-gray-800 bg-gray-900/80 text-xs shrink-0">
      {/* Bridge status */}
      <span className="flex items-center gap-1.5">
        <span
          className={`inline-block w-2 h-2 rounded-full ${
            bridgeOk === null ? 'bg-gray-600' : bridgeOk ? 'bg-emerald-500' : 'bg-red-500'
          }`}
        />
        <span className="text-gray-500">
          {bridgeOk === null ? 'Connecting...' : bridgeOk ? 'Bridge' : 'Bridge offline'}
        </span>
      </span>

      {/* Error */}
      {err && (
        <span className="flex items-center gap-1.5 text-red-400 truncate max-w-lg" title={error ?? undefined}>
          <span className="px-1.5 py-0.5 rounded bg-red-900/40 text-red-300 font-mono text-[10px]">
            {err.label}
          </span>
          <span className="truncate">{err.detail}</span>
        </span>
      )}

      {/* Summary */}
      {!error && summary && (
        <span className="text-gray-400 truncate">{summary}</span>
      )}

      <span className="flex-1" />

      {/* Fields omitted indicator */}
      {metrics?.fieldsOmitted && metrics.fieldsOmitted.length > 0 && (
        <span
          className="text-yellow-500/80 cursor-help"
          title={metrics.fieldsOmitted.map((f) => `${f.field}: ${f.reason}`).join('\n')}
        >
          {metrics.fieldsOmitted.length} fields omitted
        </span>
      )}

      {/* Metrics */}
      {metrics && (
        <span className="text-gray-500">
          {metrics.componentsUsed} components, {metrics.fieldsBound} fields
        </span>
      )}

      {/* Pipeline duration */}
      {pipeline && (
        <span className="text-gray-600 font-mono">
          {pipeline.duration}ms
        </span>
      )}

      {transcript ? (
        <button
          type="button"
          onClick={() => downloadTranscript(transcript)}
          className="rounded border border-cyan-500/40 px-2 py-0.5 text-[11px] font-medium text-cyan-200 transition-colors hover:bg-cyan-500/10"
          data-action="transcript-export"
          data-fixture={transcript.fixtureId}
          data-min-confidence={transcript.minConfidence}
          title="Download an OODS transcript JSON conforming to packages/artifacts/schemas/transcript.schema.json"
        >
          Export transcript
        </button>
      ) : null}

      {loading && <span className="text-indigo-400">Running...</span>}
    </div>
  );
}
