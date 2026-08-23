// File: src/features/Dashboard/hooks/useCountUp.ts
// Lightweight count-up animation — no deps. Eases numbers in on mount/change
// so stat cards feel alive instead of just "popping" a number in.

import { useEffect, useRef, useState } from "react";

function easeOutExpo(t: number) {
  return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
}

export function useCountUp(target: number, durationMs = 900) {
  const [value, setValue] = useState(0);
  const frame = useRef<number | null>(null);
  const startTime = useRef<number | null>(null);
  const startValue = useRef(0);

  useEffect(() => {
    startTime.current = null;
    startValue.current = value;

    function tick(now: number) {
      if (startTime.current === null) {
        startTime.current = now;
      }

      const elapsed = now - startTime.current;
      const progress = Math.min(elapsed / durationMs, 1);
      const eased = easeOutExpo(progress);

      const next =
        startValue.current + (target - startValue.current) * eased;

      setValue(next);

      if (progress < 1) {
        frame.current = requestAnimationFrame(tick);
      } else {
        setValue(target);
      }
    }

    frame.current = requestAnimationFrame(tick);

    return () => {
      if (frame.current) {
        cancelAnimationFrame(frame.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target, durationMs]);

  return value;
}
