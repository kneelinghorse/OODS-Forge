export type AdapterExit = { code: number | null; signal: NodeJS.Signals | null };
export class McpClient {
  constructor(options: { adapterPath: string; cwd: string; env: NodeJS.ProcessEnv });
  request<T = unknown>(method: string, params?: unknown, timeoutMs?: number): Promise<T>;
  notify(method: string, params?: unknown): void;
  callTool<T = unknown>(name: string, args: unknown, expectedError?: string): Promise<T>;
  waitForExit(timeoutMs: number): Promise<AdapterExit | null>;
  closeStdinAndObserve(): Promise<AdapterExit & { exited: boolean }>;
  terminate(signal?: NodeJS.Signals): Promise<AdapterExit & {
    requestedSignal: NodeJS.Signals;
    forcedKill: boolean;
    alreadyExited: boolean;
  }>;
}
