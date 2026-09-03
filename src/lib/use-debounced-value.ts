import { useEffect, useState } from "react";

/**
 * Devolve `value` com atraso: só reflete o valor depois que ele para de mudar por
 * `delayMs`. Usado na busca para não disparar uma requisição à Unsplash a cada tecla —
 * o mock da Fase 1 filtrava em memória e não precisava disso, uma API real precisa.
 */
export function useDebouncedValue<T>(value: T, delayMs = 400): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);

  return debounced;
}
