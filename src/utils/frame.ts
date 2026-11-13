/** Wraps `run` so any number of calls within one animation frame run it once, on the next frame. */
export function perFrame(run: () => void): () => void {
  let queued = false;
  return () => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => {
      queued = false;
      run();
    });
  };
}
