const GLOBAL_USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK !== 'false';

export const resolveMockMode = (moduleValue: string | undefined) => {
  if (moduleValue === 'true') return true;
  if (moduleValue === 'false') return false;
  return GLOBAL_USE_MOCK;
};

export const logMockFallback = (message: string, error: unknown) => {
  if (process.env.NODE_ENV !== 'development') return;
  console.warn(`${message}. Usando datos mock.`, error);
};
