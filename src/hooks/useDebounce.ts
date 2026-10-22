import { useState, useEffect } from "react";

/**
 * Custom hook to debounce any fast-changing value (such as search keystrokes).
 * Prevents flooding API endpoints and SQLite database on every keystroke.
 */
export function useDebounce<T>(value: T, delay: number = 250): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
