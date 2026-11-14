/** Fetches JSON at build time, failing soft: a bad status or network error logs a warning and returns null. */
export async function fetchJson<T>(url: string, label: string, init?: RequestInit): Promise<{ data: T; res: Response } | null> {
  try {
    const res = await fetch(url, init);
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
