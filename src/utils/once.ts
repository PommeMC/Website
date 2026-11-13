/** Runs `load` on first call and returns the same promise on every later call. */
export function once<T>(load: () => Promise<T>): () => Promise<T> {
  let cached: Promise<T> | undefined;
  return () => (cached ??= load());
}
