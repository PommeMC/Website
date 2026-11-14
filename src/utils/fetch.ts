const TIMEOUT_MS = 10_000;

/** Fetches JSON at build time, failing soft: a bad status, network error or timeout logs a warning and returns null. */
export async function fetchJson<T>(url: string, label: string, init?: RequestInit): Promise<{ data: T; res: Response } | null> {
  try {
    const res = await fetch(url, { ...init, signal: AbortSignal.timeout(TIMEOUT_MS) });
    if (!res.ok) {
      console.warn(`[${label}] ${res.status} for ${url}`);
      return null;
    }
    return { data: (await res.json()) as T, res };
  } catch (err) {
    console.warn(`[${label}] request failed for ${url}`, err);
    return null;
  }
}
