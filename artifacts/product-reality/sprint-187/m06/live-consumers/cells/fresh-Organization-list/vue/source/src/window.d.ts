interface Window {
  __OODS_ACTIONS_FROZEN__?: boolean;
  __OODS_ACTION_COUNTS__: Record<string, number>;
  __OODS_ACTION_ARGS__: Record<string, unknown[][]>;
  __OODS_CAPTURE_FINGERPRINT__: () => unknown;
  __OODS_SSR_FINGERPRINT__: unknown;
  __OODS_SSR_ROOT_NODE__: Element | null;
  __OODS_SSR_ACTION_NODE__: Element | null;
}
declare module '*.vue';
