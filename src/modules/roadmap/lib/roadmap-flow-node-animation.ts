// roadmap-flow-node-animations.ts
import { useEffect, useRef, useState } from "react";

/**
 * Détecte une transition false→true (ou true→false selon `from`/`to`)
 * et retourne `true` pendant `durationMs`, pour déclencher une classe
 * d'animation CSS ponctuelle sans dépendance externe (Framer Motion, etc.).
 */
export function useFlagTransition(
  value: boolean | undefined,
  options: { from: boolean; to: boolean; durationMs?: number },
) {
  const { from, to, durationMs = 900 } = options;
  const previousValue = useRef(value);
  const [justTransitioned, setJustTransitioned] = useState(false);

  useEffect(() => {
    const wasValue = previousValue.current;
    previousValue.current = value;

    if (wasValue === from && value === to) {
      setJustTransitioned(true);
      const timeout = setTimeout(() => setJustTransitioned(false), durationMs);
      return () => clearTimeout(timeout);
    }
  }, [value, from, to, durationMs]);

  return justTransitioned;
}
