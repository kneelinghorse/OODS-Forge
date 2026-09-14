export function ensureConsumerRollup(
  consumerRoot: string,
  reinstall: (extraArgs: string[]) => Promise<unknown>,
): Promise<{ retried: boolean; missingPackage?: string }>;
