// src/shims/fs-shim.ts
export const readFileSync = () => {
  throw new Error('readFileSync not supported in browser');
};

export const writeFileSync = () => {
  throw new Error('writeFileSync not supported in browser');
};

// Default export for compatibility
export default { readFileSync, writeFileSync };