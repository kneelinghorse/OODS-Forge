import { useCallback, useEffect, useRef, useState } from 'react';

// ---------------------------------------------------------------------------
// useUrlParam — URL-search-param-backed state (sprint-101 m04 C4)
// ---------------------------------------------------------------------------

function readSearchParam(name: string): string | null {
  if (typeof window === 'undefined') return null;
  const search = new URLSearchParams(window.location.search);
  return search.get(name);
}

function writeSearchParam(name: string, value: string | null): void {
  if (typeof window === 'undefined') return;
  const url = new URL(window.location.href);
  if (value === null || value === '') {
    url.searchParams.delete(name);
  } else {
    url.searchParams.set(name, value);
  }
  window.history.replaceState({}, '', url);
}

/**
 * Read/write a single URL search-param key as React state. Initial value comes
 * from the URL if present, otherwise from `fallback`. Back/forward navigation
 * (popstate) re-reads the URL and updates the value. `replaceState` is used so
 * fast slider movements don't blow up history.
 */
export function useUrlParam(name: string, fallback: string): [string, (next: string) => void] {
  const [value, setValue] = useState<string>(() => readSearchParam(name) ?? fallback);

  useEffect(() => {
    const sync = () => {
      const current = readSearchParam(name);
      if (current !== null && current !== value) {
        setValue(current);
      }
    };
    window.addEventListener('popstate', sync);
    return () => window.removeEventListener('popstate', sync);
  }, [name, value]);

  const set = useCallback(
    (next: string) => {
      setValue(next);
      writeSearchParam(name, next);
    },
    [name],
  );

  return [value, set];
}

// ---------------------------------------------------------------------------
// useSessionCache — sessionStorage-backed key/value cache (sprint-101 m04 C4)
// ---------------------------------------------------------------------------

export interface SessionCache<T> {
  get(key: string): T | undefined;
  set(key: string, value: T): void;
  invalidate(key: string): void;
}

/**
 * Returns a stable handle to a per-namespace sessionStorage cache. Keys are
 * stringified by the caller (e.g. `${fixtureId}|${minConfidence}`). Values are
 * JSON-serialized. Failures (storage disabled, quota, parse) fall back to
 * memory.
 */
export function useSessionCache<T>(namespace: string): SessionCache<T> {
  const fallback = useRef(new Map<string, T>());

  const fullKey = (key: string) => `oods-playground:${namespace}:${key}`;

  const get = useCallback(
    (key: string): T | undefined => {
      const fk = fullKey(key);
      if (typeof window === 'undefined') return fallback.current.get(key);
      try {
        const raw = window.sessionStorage.getItem(fk);
        if (raw === null) return fallback.current.get(key);
        return JSON.parse(raw) as T;
      } catch {
        return fallback.current.get(key);
      }
    },
    [namespace],
  );

  const set = useCallback(
    (key: string, value: T): void => {
      fallback.current.set(key, value);
      if (typeof window === 'undefined') return;
      try {
        window.sessionStorage.setItem(fullKey(key), JSON.stringify(value));
      } catch {
        // ignore quota / disabled storage
      }
    },
    [namespace],
  );

  const invalidate = useCallback(
    (key: string): void => {
      fallback.current.delete(key);
      if (typeof window === 'undefined') return;
      try {
        window.sessionStorage.removeItem(fullKey(key));
      } catch {
        // ignore
      }
    },
    [namespace],
  );

  return { get, set, invalidate };
}

/** Debounce a value by `delay` ms. */
export function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

/** Copy text to clipboard with transient feedback. */
export function useCopyToClipboard(resetMs = 2000): [boolean, (text: string) => void] {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const copy = useCallback(
    (text: string) => {
      navigator.clipboard.writeText(text).then(() => {
        setCopied(true);
        clearTimeout(timer.current);
        timer.current = setTimeout(() => setCopied(false), resetMs);
      });
    },
    [resetMs],
  );

  return [copied, copy];
}
