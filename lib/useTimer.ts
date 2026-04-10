import { useState, useEffect, useCallback, useRef } from "react";

export function useTimer() {
  const [elapsed, setElapsed] = useState(0);
  const startTimeRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);

  const startRef = useRef(() => {
    startTimeRef.current = performance.now();
    function tick() {
      if (startTimeRef.current !== null) {
        setElapsed((performance.now() - startTimeRef.current) / 1000);
        rafRef.current = requestAnimationFrame(tick);
      }
    }
    rafRef.current = requestAnimationFrame(tick);
  });

  const stopRef = useRef((): number => {
    let final = 0;
    if (startTimeRef.current !== null) {
      final = (performance.now() - startTimeRef.current) / 1000;
      setElapsed(final);
    }
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    startTimeRef.current = null;
    return final;
  });

  const resetRef = useRef(() => {
    stopRef.current();
    setElapsed(0);
  });

  const start = useCallback(() => startRef.current(), []);
  const stop = useCallback(() => stopRef.current(), []);
  const reset = useCallback(() => resetRef.current(), []);

  useEffect(() => () => { if (rafRef.current !== null) cancelAnimationFrame(rafRef.current); }, []);

  return { elapsed, start, stop, reset };
}
