import { useState, useEffect } from 'react';

/**
 * Hook to debounce value updates.
 * @param {*} value The value to debounce
 * @param {Number} delay Time delay in milliseconds
 * @returns {*} Debounced value
 */
export function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);

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
