
/**
 * Creates an array of specified length with optional step
 * This is a utility function to replace Array.from({length, step}) which TypeScript doesn't support
 */
export const createArrayWithLength = (length: number, step?: number): number[] => {
  const arr = Array.from({length}, (_, i) => i);
  
  if (step) {
    return arr.map(i => i * step);
  }
  
  return arr;
};
